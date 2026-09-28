"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { SHIPPING } from "@/lib/config";
import { db } from "@/lib/db";
import { endCustomerSession, getCurrentUser, hashPassword, verifyPassword } from "@/lib/customer-auth";

export type ProfileState = { ok?: string; error?: string; values?: Record<string, string> };

async function currentUserOrLogin() {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion?suite=/compte/profil");
  return user;
}

async function checkPassword(userId: number, password: string) {
  const u = await db.user.findUniqueOrThrow({ where: { id: userId }, select: { passwordHash: true } });
  return verifyPassword(password, u.passwordHash);
}

const profileSchema = z.object({
  name: z.string().trim().min(2, "Indiquez votre nom.").max(80),
  phone: z.string().trim().max(30).default(""),
  address1: z.string().trim().max(120).default(""),
  address2: z.string().trim().max(100).default(""),
  city: z.string().trim().max(80).default(""),
  province: z.enum(SHIPPING.provinces, { message: "Province non desservie." }),
  postalCode: z
    .string()
    .trim()
    .toUpperCase()
    .refine((v) => v === "" || /^[A-Z]\d[A-Z] ?\d[A-Z]\d$/.test(v), "Code postal invalide (ex. H2X 1Y4).")
    .transform((v) => (v ? `${v.replace(" ", "").slice(0, 3)} ${v.replace(" ", "").slice(3)}` : "")),
});

export async function updateProfile(_prev: ProfileState, formData: FormData): Promise<ProfileState> {
  const user = await currentUserOrLogin();
  const raw = Object.fromEntries(formData) as Record<string, string>;
  const parsed = profileSchema.safeParse(raw);
  // Les valeurs sont renvoyées pour que le formulaire garde ce que le client a saisi
  if (!parsed.success) return { error: parsed.error.issues[0].message, values: raw };
  await db.user.update({ where: { id: user.id }, data: parsed.data });
  revalidatePath("/", "layout");
  return { ok: "Vos informations ont été enregistrées.", values: parsed.data };
}

export async function changeEmail(_prev: ProfileState, formData: FormData): Promise<ProfileState> {
  const user = await currentUserOrLogin();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const values = { email };
  if (!z.string().email().safeParse(email).success) return { error: "Indiquez une adresse courriel valide.", values };
  if (!(await checkPassword(user.id, String(formData.get("password") ?? ""))))
    return { error: "Mot de passe incorrect.", values };
  if (email === user.email) return { error: "C'est déjà votre adresse courriel.", values };
  if (await db.user.findUnique({ where: { email } }))
    return { error: "Cette adresse est déjà utilisée par un autre compte.", values };
  await db.user.update({ where: { id: user.id }, data: { email } });
  revalidatePath("/", "layout");
  return { ok: `Votre courriel est maintenant ${email}.` };
}

export async function changePassword(_prev: ProfileState, formData: FormData): Promise<ProfileState> {
  const user = await currentUserOrLogin();
  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");
  if (!(await checkPassword(user.id, current))) return { error: "Mot de passe actuel incorrect." };
  if (next.length < 8) return { error: "Le nouveau mot de passe doit contenir au moins 8 caractères." };
  if (next !== formData.get("confirm")) return { error: "Les deux nouveaux mots de passe ne correspondent pas." };
  await db.user.update({ where: { id: user.id }, data: { passwordHash: hashPassword(next) } });
  return { ok: "Votre mot de passe a été changé." };
}

export async function deleteMyAccount(_prev: ProfileState, formData: FormData): Promise<ProfileState> {
  const user = await currentUserOrLogin();
  if (formData.get("confirm") !== "on") return { error: "Cochez la case pour confirmer." };
  if (!(await checkPassword(user.id, String(formData.get("password") ?? ""))))
    return { error: "Mot de passe incorrect." };
  // Les commandes restent (obligations fiscales) mais ne sont plus liées à un compte
  await db.user.delete({ where: { id: user.id } });
  await endCustomerSession();
  redirect("/?compte-supprime=1");
}

"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { SHIPPING } from "@/lib/config";
import { db } from "@/lib/db";
import {
  endCustomerSession,
  hashPassword,
  safeNext,
  startCustomerSession,
  verifyPassword,
} from "@/lib/customer-auth";

export type AuthState = { error?: string; values?: Record<string, string> };

export async function login(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const user = email ? await db.user.findUnique({ where: { email } }) : null;
  // Même message dans tous les cas : on ne révèle pas si le courriel existe
  if (!user || !verifyPassword(password, user.passwordHash))
    return { error: "Courriel ou mot de passe incorrect.", values: { email } };
  if (user.disabled)
    return { error: "Ce compte est désactivé. Écrivez-nous pour le réactiver.", values: { email } };
  await startCustomerSession(user.id);
  redirect(safeNext(formData.get("suite")));
}

const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Indiquez votre nom.").max(80),
    email: z.string().trim().toLowerCase().email("Indiquez un courriel valide."),
    password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères.").max(200),
    confirm: z.string(),
    phone: z.string().trim().max(30).default(""),
    address1: z.string().trim().min(3, "Indiquez votre adresse.").max(120),
    address2: z.string().trim().max(100).default(""),
    city: z.string().trim().min(2, "Indiquez votre ville.").max(80),
    province: z.enum(SHIPPING.provinces, { message: "Province non desservie." }),
    postalCode: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^[A-Z]\d[A-Z] ?\d[A-Z]\d$/, "Code postal invalide (ex. H2X 1Y4).")
      .transform((v) => `${v.replace(" ", "").slice(0, 3)} ${v.replace(" ", "").slice(3)}`),
  })
  .refine((d) => d.password === d.confirm, { message: "Les deux mots de passe ne correspondent pas." });

export async function register(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const raw = Object.fromEntries(formData) as Record<string, string>;
  // On renvoie tout sauf les mots de passe pour que le formulaire reste rempli
  const values = { ...raw };
  delete values.password;
  delete values.confirm;
  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message, values };
  const { password, name, email, phone, address1, address2, city, province, postalCode } = parsed.data;
  const profile = { name, email, phone, address1, address2, city, province, postalCode };
  if (await db.user.findUnique({ where: { email } }))
    return { error: "Un compte existe déjà avec ce courriel. Connectez-vous.", values };
  // L'adresse saisie à l'inscription devient l'adresse de livraison du profil
  const user = await db.user.create({ data: { ...profile, passwordHash: hashPassword(password) } });
  await startCustomerSession(user.id);
  redirect(safeNext(formData.get("suite")));
}

export async function logout() {
  await endCustomerSession();
  redirect("/");
}

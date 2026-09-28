"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
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
  await startCustomerSession(user.id);
  redirect(safeNext(formData.get("suite")));
}

const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Indiquez votre nom.").max(80),
    email: z.string().trim().toLowerCase().email("Indiquez un courriel valide."),
    password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères.").max(200),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { message: "Les deux mots de passe ne correspondent pas." });

export async function register(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const raw = Object.fromEntries(formData) as Record<string, string>;
  const values = { name: raw.name ?? "", email: raw.email ?? "" };
  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message, values };
  const { name, email, password } = parsed.data;
  if (await db.user.findUnique({ where: { email } }))
    return { error: "Un compte existe déjà avec ce courriel. Connectez-vous.", values };
  const user = await db.user.create({ data: { name, email, passwordHash: hashPassword(password) } });
  await startCustomerSession(user.id);
  redirect(safeNext(formData.get("suite")));
}

export async function logout() {
  await endCustomerSession();
  redirect("/");
}

"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { hashPassword } from "@/lib/customer-auth";
import { db } from "@/lib/db";

function back(id: number, msg?: string): never {
  redirect(`/admin/clients/${id}${msg ? `?ok=${encodeURIComponent(msg)}` : ""}`);
}

export async function updateClient(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const name = String(formData.get("name") ?? "").trim().slice(0, 80);
  const phone = String(formData.get("phone") ?? "").trim().slice(0, 30);
  if (name.length < 2) back(id, "Le nom doit contenir au moins 2 caractères.");
  await db.user.update({ where: { id }, data: { name, phone } });
  back(id, "Fiche enregistrée.");
}

export async function toggleBlocked(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const user = await db.user.findUniqueOrThrow({ where: { id } });
  await db.user.update({ where: { id }, data: { disabled: !user.disabled } });
  revalidatePath("/admin/clients");
  back(id, user.disabled ? "Compte débloqué." : "Compte bloqué : le client ne peut plus se connecter.");
}

export type ResetState = { password?: string };

/** Crée un mot de passe temporaire, affiché une seule fois à l'administrateur. */
export async function resetPassword(_prev: ResetState, formData: FormData): Promise<ResetState> {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const password = randomBytes(9).toString("base64url").slice(0, 12);
  await db.user.update({ where: { id }, data: { passwordHash: hashPassword(password) } });
  return { password };
}

export async function deleteClient(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (formData.get("confirm") !== "on") back(id, "Cochez la case de confirmation pour supprimer le compte.");
  // Les commandes et demandes sont conservées (obligations comptables), seulement détachées du compte
  await db.user.delete({ where: { id } });
  revalidatePath("/admin/clients");
  redirect("/admin/clients?supprime=1");
}

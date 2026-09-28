"use server";

import { redirect } from "next/navigation";
import { checkPassword, createSession, destroySession } from "@/lib/auth";

export async function login(_prev: { error?: string }, formData: FormData): Promise<{ error?: string }> {
  if (!checkPassword(String(formData.get("password") ?? "")))
    return {
      error:
        process.env.NODE_ENV === "production" && (process.env.ADMIN_PASSWORD ?? "").length < 12
          ? "Admin désactivé : définissez ADMIN_PASSWORD (12 caractères minimum, pas « changez-moi »)."
          : "Mot de passe incorrect.",
    };
  await createSession();
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/connexion");
}

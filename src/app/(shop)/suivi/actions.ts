"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { parseOrderNumber } from "@/lib/orders";

export async function findOrder(_prev: { error?: string }, formData: FormData): Promise<{ error?: string }> {
  const id = parseOrderNumber(String(formData.get("number") ?? ""));
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const order = id ? await db.order.findUnique({ where: { id } }) : null;
  // Même message dans tous les cas pour ne pas révéler quelles commandes existent
  if (!order || order.email.toLowerCase() !== email)
    return { error: "Aucune commande ne correspond à ce numéro et ce courriel." };
  redirect(`/commande/${order.publicId}`);
}

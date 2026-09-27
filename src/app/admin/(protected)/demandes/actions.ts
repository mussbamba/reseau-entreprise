"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { SPECIAL_CATEGORY } from "@/lib/config";
import { db } from "@/lib/db";
import { mailRequestQuoted, mailRequestUnavailable } from "@/lib/email";
import { parseMoneyToCents } from "@/lib/money";
import { slugify } from "@/lib/slug";

function back(id: number, error?: string): never {
  redirect(`/admin/demandes/${id}${error ? `?erreur=${encodeURIComponent(error)}` : ""}`);
}

/** Envoie un prix : crée (ou met à jour) un produit non listé que le client pourra ajouter à son panier. */
export async function sendQuote(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const priceCents = parseMoneyToCents(String(formData.get("price") ?? ""));
  const costCents = parseMoneyToCents(String(formData.get("cost") ?? ""));
  const storeId = Number(formData.get("storeId")) || null;
  const vendorNote = String(formData.get("note") ?? "").trim().slice(0, 300);
  if (priceCents <= 0) back(id, "Indiquez le prix de vente par unité.");

  const r = await db.productRequest.findUniqueOrThrow({ where: { id } });
  if (!["PENDING", "QUOTED"].includes(r.status)) back(id, "Cette demande est déjà fermée.");

  const category = await db.category.upsert({
    where: { slug: SPECIAL_CATEGORY.slug },
    update: {},
    create: { ...SPECIAL_CATEGORY, position: 999 },
  });
  const data = {
    name: r.name,
    description: [r.details, vendorNote].filter(Boolean).join("\n"),
    priceCents,
    costCents,
    storeId,
    categoryId: category.id,
    active: true,
    listed: false,
  };
  const product = r.productId
    ? await db.product.update({ where: { id: r.productId }, data })
    : await db.product.create({ data: { ...data, slug: `demande-${r.id}-${slugify(r.name).slice(0, 40)}` } });

  const updated = await db.productRequest.update({
    where: { id },
    data: { status: "QUOTED", vendorNote, productId: product.id },
  });
  await mailRequestQuoted(updated, priceCents);
  back(id);
}

export async function markUnavailable(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const vendorNote = String(formData.get("note") ?? "").trim().slice(0, 300);
  const r = await db.productRequest.findUniqueOrThrow({ where: { id } });
  if (!["PENDING", "QUOTED"].includes(r.status)) back(id, "Cette demande est déjà fermée.");
  const updated = await db.productRequest.update({ where: { id }, data: { status: "UNAVAILABLE", vendorNote } });
  if (updated.productId) await db.product.update({ where: { id: updated.productId }, data: { active: false } });
  await mailRequestUnavailable(updated);
  back(id);
}

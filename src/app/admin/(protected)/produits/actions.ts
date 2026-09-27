"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { parseMoneyToCents } from "@/lib/money";
import { slugify } from "@/lib/slug";

const schema = z.object({
  name: z.string().trim().min(2, "Nom requis"),
  description: z.string().trim().default(""),
  origin: z.string().trim().default(""),
  price: z.string().min(1, "Prix requis"),
  cost: z.string().default("0"),
  weightGrams: z.coerce.number().int().min(0).default(500),
  imageUrl: z.string().trim().url("URL d'image invalide").or(z.literal("")).default(""),
  categoryId: z.coerce.number().int().positive("Catégorie requise"),
  storeId: z.string().default(""),
});

export type ProductFormState = { error?: string };

async function uniqueSlug(name: string, excludeId?: number) {
  const base = slugify(name) || "produit";
  let slug = base;
  for (let i = 2; await db.product.findFirst({ where: { slug, NOT: excludeId ? { id: excludeId } : undefined } }); i++)
    slug = `${base}-${i}`;
  return slug;
}

export async function saveProduct(_prev: ProductFormState, formData: FormData): Promise<ProductFormState> {
  await requireAdmin();
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { price, cost, storeId, ...rest } = parsed.data;
  const priceCents = parseMoneyToCents(price);
  if (priceCents <= 0) return { error: "Le prix doit être supérieur à 0." };

  const id = Number(formData.get("id")) || undefined;
  const data = {
    ...rest,
    priceCents,
    costCents: parseMoneyToCents(cost),
    storeId: storeId ? Number(storeId) : null,
    active: formData.get("active") === "on",
    featured: formData.get("featured") === "on",
    slug: await uniqueSlug(rest.name, id),
  };

  if (id) await db.product.update({ where: { id }, data });
  else await db.product.create({ data });
  revalidatePath("/", "layout");
  redirect("/admin/produits");
}

export async function toggleActive(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const p = await db.product.findUniqueOrThrow({ where: { id } });
  await db.product.update({ where: { id }, data: { active: !p.active } });
  revalidatePath("/", "layout");
}

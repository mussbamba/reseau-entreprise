"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { SPECIAL_CATEGORY } from "@/lib/config";
import { db } from "@/lib/db";
import { slugify } from "@/lib/slug";

function back(msg: string): never {
  redirect(`/admin/categories?msg=${encodeURIComponent(msg)}`);
}

export async function saveCategory(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id")) || undefined;
  const name = String(formData.get("name") ?? "").trim().slice(0, 60);
  const emoji = String(formData.get("emoji") ?? "").trim().slice(0, 8) || "🛍️";
  const position = Number(formData.get("position")) || 0;
  if (name.length < 2) back("Le nom de la catégorie doit contenir au moins 2 caractères.");
  const duplicate = await db.category.findFirst({ where: { name, NOT: id ? { id } : undefined } });
  if (duplicate) back(`La catégorie « ${name} » existe déjà.`);
  if (id) await db.category.update({ where: { id }, data: { name, emoji, position } });
  else {
    const base = slugify(name) || "categorie";
    let slug = base;
    for (let i = 2; await db.category.findUnique({ where: { slug } }); i++) slug = `${base}-${i}`;
    await db.category.create({ data: { name, emoji, position, slug } });
  }
  revalidatePath("/", "layout");
  back(id ? `Catégorie « ${name} » enregistrée.` : `Catégorie « ${name} » ajoutée.`);
}

export async function deleteCategory(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const c = await db.category.findUniqueOrThrow({ where: { id }, include: { _count: { select: { products: true } } } });
  if (c.slug === SPECIAL_CATEGORY.slug) back("Cette catégorie technique ne peut pas être supprimée.");
  if (c._count.products > 0) back(`Impossible : « ${c.name} » contient encore ${c._count.products} produit(s). Déplacez-les d'abord.`);
  await db.category.delete({ where: { id } });
  revalidatePath("/", "layout");
  back(`Catégorie « ${c.name} » supprimée.`);
}

"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { slugify } from "@/lib/slug";

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();

export async function saveStore(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id")) || undefined;
  const data = {
    name: str(formData, "name"),
    address: str(formData, "address"),
    hours: str(formData, "hours"),
    notes: str(formData, "notes"),
  };
  if (!data.name) return;
  if (id) await db.store.update({ where: { id }, data });
  else await db.store.create({ data });
  revalidatePath("/admin/boutiques");
}

export async function deleteStore(formData: FormData) {
  await requireAdmin();
  await db.store.delete({ where: { id: Number(formData.get("id")) } });
  revalidatePath("/admin/boutiques");
}

export async function saveCategory(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id")) || undefined;
  const name = str(formData, "name");
  if (!name) return;
  const data = { name, emoji: str(formData, "emoji") || "🛍️", position: Number(formData.get("position")) || 0 };
  if (id) await db.category.update({ where: { id }, data });
  else await db.category.create({ data: { ...data, slug: `${slugify(name)}-${Date.now().toString(36)}` } });
  revalidatePath("/", "layout");
}

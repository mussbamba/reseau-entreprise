import { SPECIAL_CATEGORY } from "@/lib/config";
import { db } from "@/lib/db";
import { ProductForm } from "../ProductForm";

export default async function NewProductPage() {
  const [categories, stores] = await Promise.all([
    db.category.findMany({ where: { slug: { not: SPECIAL_CATEGORY.slug } }, orderBy: { position: "asc" } }),
    db.store.findMany({ orderBy: { name: "asc" } }),
  ]);
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-extrabold">Nouveau produit</h1>
      <ProductForm categories={categories} stores={stores} />
    </div>
  );
}

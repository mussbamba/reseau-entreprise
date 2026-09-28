import { notFound } from "next/navigation";
import { SPECIAL_CATEGORY } from "@/lib/config";
import { db } from "@/lib/db";
import { ProductForm } from "../ProductForm";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, categories, stores] = await Promise.all([
    db.product.findUnique({ where: { id: Number(id) } }),
    db.category.findMany({ where: { slug: { not: SPECIAL_CATEGORY.slug } }, orderBy: { position: "asc" } }),
    db.store.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!product) notFound();
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-extrabold">Modifier : {product.name}</h1>
      <ProductForm product={product} categories={categories} stores={stores} />
    </div>
  );
}

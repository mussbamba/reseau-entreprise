import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { SHOP } from "@/lib/config";
import { formatMoney } from "@/lib/money";
import { AddToCartButton } from "@/components/AddToCartButton";
import { ProductImage } from "@/components/ProductImage";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await db.product.findUnique({ where: { slug }, include: { category: true } });
  if (!p || !p.active) notFound();

  return (
    <div>
      <nav className="text-sm text-stone-500">
        <Link href="/produits" className="hover:underline">Boutique</Link> /{" "}
        <Link href={`/produits?categorie=${p.category.slug}`} className="hover:underline">{p.category.name}</Link>
      </nav>
      <div className="mt-4 grid gap-8 md:grid-cols-2">
        <ProductImage
          imageUrl={p.imageUrl}
          emoji={p.category.emoji}
          name={p.name}
          className="card aspect-square w-full overflow-hidden"
        />
        <div className="space-y-4">
          <h1 className="text-3xl font-extrabold">{p.name}</h1>
          <p className="text-2xl font-bold text-terre-700">{formatMoney(p.priceCents)}</p>
          {p.description && <p className="whitespace-pre-line text-stone-700">{p.description}</p>}
          <AddToCartButton
            withQuantity
            product={{
              productId: p.id,
              slug: p.slug,
              name: p.name,
              unitPriceCents: p.priceCents,
              emoji: p.category.emoji,
              imageUrl: p.imageUrl,
            }}
          />
          <div className="rounded-xl bg-terre-50 p-4 text-sm text-terre-900">
            <p className="font-semibold">🛍️ Acheté sur commande</p>
            <p className="mt-1">
              Nous achetons ce produit pour vous en boutique. {SHOP.purchaseSchedule} Si le produit est introuvable,
              il ne vous sera pas facturé.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

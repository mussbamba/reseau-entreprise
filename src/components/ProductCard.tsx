import Link from "next/link";
import { formatMoney } from "@/lib/money";
import { AddToCartButton } from "./AddToCartButton";
import { ProductImage } from "./ProductImage";

export type ProductCardData = {
  id: number;
  slug: string;
  name: string;
  origin: string;
  priceCents: number;
  imageUrl: string;
  category: { emoji: string };
};

export function ProductCard({ p }: { p: ProductCardData }) {
  return (
    <div className="card flex flex-col overflow-hidden">
      <Link href={`/produits/${p.slug}`}>
        <ProductImage imageUrl={p.imageUrl} emoji={p.category.emoji} name={p.name} className="aspect-square w-full" />
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <Link href={`/produits/${p.slug}`} className="line-clamp-2 text-sm font-semibold hover:text-terre-600">
          {p.name}
        </Link>
        <p className="mt-auto text-base font-bold text-terre-700">{formatMoney(p.priceCents)}</p>
        <AddToCartButton
          product={{
            productId: p.id,
            slug: p.slug,
            name: p.name,
            unitPriceCents: p.priceCents,
            emoji: p.category.emoji,
            imageUrl: p.imageUrl,
          }}
        />
      </div>
    </div>
  );
}

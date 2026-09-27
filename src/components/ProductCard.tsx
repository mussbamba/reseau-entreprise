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
  featured?: boolean;
  category: { emoji: string };
};

function Price({ cents }: { cents: number }) {
  const [d, c] = (cents / 100).toFixed(2).split(".");
  return (
    <p className="mt-1 flex items-start font-extrabold leading-none tabular-nums" aria-label={formatMoney(cents)}>
      <span className="text-2xl">{d}</span>
      <span className="mt-0.5 text-xs">,{c}</span>
      <span className="ml-1 mt-0.5 text-xs">$</span>
    </p>
  );
}

export function ProductCard({ p }: { p: ProductCardData }) {
  return (
    <div className="card group flex flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-[0_12px_32px_-10px_rgba(16,24,40,.22)]">
      <Link href={`/produits/${p.slug}`} className="relative block bg-[radial-gradient(90%_80%_at_50%_35%,#fff,#f5f6f8)]">
        {p.featured && (
          <span className="absolute left-2.5 top-2.5 z-10 rounded-lg bg-corail px-2 py-1 text-[11px] font-bold text-white">Populaire</span>
        )}
        <ProductImage imageUrl={p.imageUrl} emoji={p.category.emoji} name={p.name} className="aspect-square w-full transition group-hover:scale-[1.02]" />
      </Link>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <Link href={`/produits/${p.slug}`} className="line-clamp-2 min-h-[2.5em] text-sm font-semibold hover:text-terre-600">
          {p.name}
        </Link>
        <Price cents={p.priceCents} />
        <p className="text-xs font-semibold text-foret">Acheté pour vous en épicerie</p>
        <div className="mt-auto pt-2" />
        <AddToCartButton
          variant="amber"
          label="Ajouter"
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

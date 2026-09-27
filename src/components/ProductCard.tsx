import Link from "next/link";
import { SHIPPING } from "@/lib/config";
import { AddToCartButton } from "./AddToCartButton";
import { Price } from "./Price";
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

/** Résultat de recherche : en ligne sur mobile, en colonne sur grand écran. */
export function ProductCard({ p }: { p: ProductCardData }) {
  return (
    <article className="grid grid-cols-[42%_1fr] gap-3 bg-white sm:grid-cols-1 sm:gap-0 sm:rounded-md">
      <Link href={`/produits/${p.slug}`} className="block bg-[#f7f8f8]">
        <ProductImage imageUrl={p.imageUrl} emoji={p.category.emoji} name={p.name} className="aspect-square w-full bg-[#f7f8f8]" />
      </Link>
      <div className="flex flex-col gap-1.5 py-3 pr-3 sm:p-3">
        {p.featured && <span className="self-start rounded-sm bg-[#cc0c39] px-1.5 py-0.5 text-[11px] font-bold text-white">Populaire</span>}
        <Link href={`/produits/${p.slug}`} className="line-clamp-3 text-[15px] leading-snug hover:text-[#c7511f]">
          {p.name}
        </Link>
        <Price cents={p.priceCents} />
        <p className="text-xs text-[#565959]">
          Livraison <b className="text-[#0f1111]">GRATUITE</b> dès {SHIPPING.freeOverCents / 100} $
        </p>
        <p className="text-[13px] font-semibold text-[#067d62]">Acheté pour vous en épicerie</p>
        <div className="mt-auto pt-1">
          <AddToCartButton
            variant="amber"
            label="Ajouter au panier"
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
    </article>
  );
}

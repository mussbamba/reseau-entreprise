import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { SHIPPING, SHOP } from "@/lib/config";
import { formatMoney } from "@/lib/money";
import { AddToCartButton } from "@/components/AddToCartButton";
import { BuyNowButton } from "@/components/BuyNowButton";
import { Price } from "@/components/Price";
import { ProductImage } from "@/components/ProductImage";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await db.product.findUnique({ where: { slug }, include: { category: true } });
  if (!p || !p.active) notFound();
  const line = {
    productId: p.id,
    slug: p.slug,
    name: p.name,
    unitPriceCents: p.priceCents,
    emoji: p.category.emoji,
    imageUrl: p.imageUrl,
  };

  return (
    <div className="-mx-4 -mt-6 bg-white px-4 py-4 sm:mx-0 sm:mt-0 sm:rounded-md sm:p-6">
      <Link href={`/produits?categorie=${p.category.slug}`} className="az-link text-sm">
        {p.category.name} ›
      </Link>
      <div className="mt-3 grid gap-6 md:grid-cols-[1.1fr_1fr_280px]">
        <div>
          <h1 className="mb-3 text-lg leading-snug md:hidden">{p.name}</h1>
          <ProductImage imageUrl={p.imageUrl} emoji={p.category.emoji} name={p.name} className="w-full bg-[#f7f8f8]" fit="natural" />
        </div>

        <div className="space-y-3">
          <h1 className="hidden text-2xl leading-snug md:block">{p.name}</h1>
          {p.featured && <span className="inline-block rounded-sm bg-[#cc0c39] px-1.5 py-0.5 text-xs font-bold text-white">Populaire</span>}
          <hr className="border-[#e7e7e7]" />
          <Price cents={p.priceCents} size="lg" />
          <div>
            <h2 className="mb-1 font-bold">À propos de cet article</h2>
            <ul className="list-disc space-y-1 pl-5 text-sm">
              {p.description && <li className="whitespace-pre-line">{p.description}</li>}
              <li>Acheté pour vous dans nos épiceries africaines partenaires, au moment de votre commande.</li>
              <li>S&apos;il est introuvable en boutique, il est retiré de votre commande et <b>n&apos;est pas facturé</b>.</li>
              <li>Rayon : {p.category.name}.</li>
            </ul>
          </div>
        </div>

        {/* Boîte d'achat */}
        <aside className="flex h-fit flex-col gap-3 rounded-lg border border-[#d5d9d9] p-4">
          <Price cents={p.priceCents} />
          <p className="text-sm text-[#565959]">
            Livraison <b className="text-[#0f1111]">{formatMoney(SHIPPING.quebecCents)}</b> au Québec ·{" "}
            <b className="text-[#0f1111]">GRATUITE</b> dès {SHIPPING.freeOverCents / 100} $
          </p>
          <p className="text-sm text-[#565959]">{SHOP.purchaseSchedule}</p>
          <p className="text-lg font-semibold text-[#067d62]">Acheté sur commande</p>
          <AddToCartButton variant="amber" withQuantity product={line} />
          <BuyNowButton product={line} />
          <p className="text-xs text-[#565959]">🔒 Paiement sécurisé : votre carte est autorisée, puis débitée du montant réel.</p>
        </aside>
      </div>
    </div>
  );
}

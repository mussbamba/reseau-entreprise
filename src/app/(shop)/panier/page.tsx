"use client";

import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { ProductImage } from "@/components/ProductImage";
import { formatMoney } from "@/lib/money";
import { MIN_ORDER_CENTS, SHIPPING } from "@/lib/config";

export default function CartPage() {
  const { lines, ready, subtotalCents, setQuantity, remove } = useCart();

  if (!ready) return null;

  if (lines.length === 0)
    return (
      <div className="-mx-4 -mt-6 bg-white px-4 py-12 text-center sm:mx-0 sm:mt-0 sm:rounded-md">
        <p className="text-5xl">🛒</p>
        <h1 className="mt-4 text-2xl font-bold">Votre panier est vide</h1>
        <Link href="/produits" className="az-yellow mt-6">Continuer vos achats</Link>
      </div>
    );

  const missing = MIN_ORDER_CENTS - subtotalCents;
  const toFree = SHIPPING.freeOverCents - subtotalCents;
  const count = lines.reduce((n, l) => n + l.quantity, 0);
  const summary = (
    <div className="flex flex-col gap-3">
      <p className="text-lg">
        Sous-total ({count} article{count > 1 ? "s" : ""}) : <b>{formatMoney(subtotalCents)}</b>
      </p>
      {toFree > 0 ? (
        <>
          <div className="h-1.5 overflow-hidden rounded bg-[#e3e6e6]">
            <div className="h-full bg-[#067d62]" style={{ width: `${Math.min(100, (subtotalCents / SHIPPING.freeOverCents) * 100)}%` }} />
          </div>
          <p className="text-sm text-[#565959]">
            Ajoutez <b className="text-[#0f1111]">{formatMoney(toFree)}</b> pour la livraison <b className="text-[#0f1111]">GRATUITE</b>.
          </p>
        </>
      ) : (
        <p className="text-sm font-semibold text-[#067d62]">✓ Votre commande est admissible à la livraison GRATUITE.</p>
      )}
      {missing > 0 && (
        <p className="text-sm text-[#b12704]">
          Commande minimum : {formatMoney(MIN_ORDER_CENTS)}. Il manque {formatMoney(missing)}.
        </p>
      )}
      {missing > 0 ? (
        <button className="az-yellow w-full" disabled>Passer la commande ({count} article{count > 1 ? "s" : ""})</button>
      ) : (
        <Link href="/commande" className="az-yellow w-full">Passer la commande ({count} article{count > 1 ? "s" : ""})</Link>
      )}
    </div>
  );

  return (
    <div className="-mx-4 -mt-6 grid gap-3 sm:mx-0 sm:mt-0 lg:grid-cols-[1fr_300px] lg:gap-6">
      <section className="bg-white p-4 lg:hidden">{summary}</section>
      <section className="bg-white p-4 sm:rounded-md">
        <h1 className="border-b border-[#e7e7e7] pb-3 text-2xl">Panier</h1>
        <ul className="divide-y divide-[#e7e7e7]">
          {lines.map((l) => (
            <li key={l.productId} className="grid grid-cols-[96px_1fr] gap-3 py-4 sm:grid-cols-[150px_1fr]">
              <ProductImage imageUrl={l.imageUrl} emoji={l.emoji} name={l.name} className="aspect-square w-full bg-[#f7f8f8] [&>span]:text-3xl" />
              <div className="flex min-w-0 flex-col gap-1.5">
                <Link href={`/produits/${l.slug}`} className="line-clamp-2 text-[15px] leading-snug hover:text-[#c7511f]">
                  {l.name}
                </Link>
                <p className="font-bold">{formatMoney(l.unitPriceCents)}</p>
                <p className="text-xs font-semibold text-[#067d62]">Acheté sur commande</p>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="inline-flex items-center overflow-hidden rounded-full border-[3px] border-[#ffd814]">
                    <button className="h-7 w-8 bg-white text-lg" onClick={() => setQuantity(l.productId, l.quantity - 1)} aria-label={l.quantity === 1 ? "Supprimer" : "Retirer un"}>
                      {l.quantity === 1 ? "🗑" : "−"}
                    </button>
                    <span className="min-w-7 text-center font-bold">{l.quantity}</span>
                    <button className="h-7 w-8 bg-white text-lg" onClick={() => setQuantity(l.productId, l.quantity + 1)} aria-label="Ajouter un">+</button>
                  </div>
                  <button onClick={() => remove(l.productId)} className="az-link text-xs">Supprimer</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>
      <aside className="hidden h-fit rounded-md bg-white p-4 lg:block">{summary}</aside>
    </div>
  );
}

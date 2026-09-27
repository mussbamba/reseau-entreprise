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
      <div className="py-16 text-center">
        <p className="text-5xl">🧺</p>
        <h1 className="mt-4 text-2xl font-bold">Votre panier est vide</h1>
        <Link href="/produits" className="btn-primary mt-6">Découvrir les produits</Link>
      </div>
    );

  const missing = MIN_ORDER_CENTS - subtotalCents;
  const toFree = SHIPPING.freeOverCents - subtotalCents;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div>
        <h1 className="text-3xl font-extrabold">Mon panier</h1>
        <ul className="mt-6 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
          {lines.map((l) => (
            <li key={l.productId} className="flex items-center gap-3 p-3">
              <ProductImage imageUrl={l.imageUrl} emoji={l.emoji} name={l.name} className="h-16 w-16 shrink-0 overflow-hidden rounded-lg [&>span]:text-2xl" fit="cover" />
              <div className="min-w-0 flex-1">
                <Link href={`/produits/${l.slug}`} className="line-clamp-2 text-sm font-semibold hover:underline">
                  {l.name}
                </Link>
                <p className="text-sm text-slate-500">{formatMoney(l.unitPriceCents)}</p>
              </div>
              <div className="flex items-center rounded-full border border-slate-300">
                <button className="px-3 py-1" onClick={() => setQuantity(l.productId, l.quantity - 1)} aria-label="Retirer un">−</button>
                <span className="w-6 text-center text-sm">{l.quantity}</span>
                <button className="px-3 py-1" onClick={() => setQuantity(l.productId, l.quantity + 1)} aria-label="Ajouter un">+</button>
              </div>
              <p className="hidden w-20 text-right text-sm font-semibold sm:block">
                {formatMoney(l.unitPriceCents * l.quantity)}
              </p>
              <button onClick={() => remove(l.productId)} className="text-slate-400 hover:text-rose-600" aria-label="Supprimer">
                ✕
              </button>
            </li>
          ))}
        </ul>
      </div>

      <aside className="card h-fit space-y-3 p-5">
        <div className="flex justify-between font-semibold">
          <span>Sous-total</span>
          <span>{formatMoney(subtotalCents)}</span>
        </div>
        <p className="text-xs text-slate-500">Livraison et taxes calculées à l&apos;étape suivante.</p>
        {toFree > 0 && missing <= 0 && (
          <p className="rounded-lg bg-emerald-50 p-2 text-xs text-emerald-800">
            Plus que {formatMoney(toFree)} pour la livraison gratuite !
          </p>
        )}
        {missing > 0 ? (
          <p className="rounded-lg bg-sky-50 p-2 text-sm text-sky-900">
            Commande minimum : {formatMoney(MIN_ORDER_CENTS)}. Il vous manque {formatMoney(missing)}.
          </p>
        ) : (
          <Link href="/commande" className="btn-primary w-full">Passer la commande</Link>
        )}
        <Link href="/produits" className="block text-center text-sm text-terre-600 hover:underline">
          Continuer mes achats
        </Link>
      </aside>
    </div>
  );
}

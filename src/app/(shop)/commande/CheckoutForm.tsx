"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { useCart } from "@/components/CartProvider";
import { PROVINCE_NAMES, SHIPPING, SHOP } from "@/lib/config";
import { formatMoney } from "@/lib/money";
import { computeTotals } from "@/lib/pricing";
import { placeOrder, type CheckoutState } from "./actions";

export function CheckoutForm({
  taxesEnabled,
  demoMode,
  user,
}: {
  taxesEnabled: boolean;
  demoMode: boolean;
  user: { name: string; email: string; phone: string } | null;
}) {
  const { lines, ready } = useCart();
  const [province, setProvince] = useState("QC");
  const [state, action, pending] = useActionState<CheckoutState, FormData>(placeOrder, {});

  if (!ready) return null;
  if (lines.length === 0)
    return (
      <p className="mt-6">
        Votre panier est vide. <Link href="/produits" className="text-terre-600 underline">Voir les produits</Link>
      </p>
    );

  const v: Record<string, string | undefined> = state.values ?? { name: user?.name, email: user?.email, phone: user?.phone };
  const totals = computeTotals(lines, province, taxesEnabled);
  const cart = JSON.stringify(lines.map((l) => ({ productId: l.productId, quantity: l.quantity })));

  return (
    <form action={action} className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]">
      <input type="hidden" name="cart" value={cart} />
      <div className="space-y-6">
        <fieldset className="card grid gap-4 p-5 sm:grid-cols-2">
          <legend className="px-1 font-bold">Vos coordonnées</legend>
          <Field label="Nom complet" name="name" defaultValue={v.name} autoComplete="name" required className="sm:col-span-2" />
          <Field label="Courriel" name="email" defaultValue={v.email} type="email" autoComplete="email" required />
          <Field label="Téléphone (facultatif)" name="phone" defaultValue={v.phone} type="tel" autoComplete="tel" />
        </fieldset>

        <fieldset className="card grid gap-4 p-5 sm:grid-cols-2">
          <legend className="px-1 font-bold">Adresse de livraison</legend>
          <Field label="Adresse" name="address1" defaultValue={v.address1} autoComplete="address-line1" required className="sm:col-span-2" />
          <Field label="App., bureau (facultatif)" name="address2" defaultValue={v.address2} autoComplete="address-line2" className="sm:col-span-2" />
          <Field label="Ville" name="city" defaultValue={v.city} autoComplete="address-level2" required />
          <div>
            <label className="label" htmlFor="province">Province</label>
            <select
              id="province"
              name="province"
              className="input"
              value={province}
              onChange={(e) => setProvince(e.target.value)}
            >
              {SHIPPING.provinces.map((p) => (
                <option key={p} value={p}>{PROVINCE_NAMES[p]}</option>
              ))}
            </select>
          </div>
          <Field label="Code postal" name="postalCode" defaultValue={v.postalCode} autoComplete="postal-code" required placeholder="H2X 1Y4" />
          <div className="sm:col-span-2">
            <label className="label" htmlFor="notes">Note pour nous (facultatif)</label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              className="input"
              defaultValue={v.notes}
              placeholder="Ex. : si le gari blanc est introuvable, le jaune me convient."
            />
          </div>
        </fieldset>
      </div>

      <aside className="card h-fit space-y-3 p-5">
        <h2 className="font-bold">Récapitulatif</h2>
        <ul className="space-y-1 text-sm">
          {lines.map((l) => (
            <li key={l.productId} className="flex justify-between gap-2">
              <span className="text-slate-600">{l.quantity} × {l.name}</span>
              <span>{formatMoney(l.quantity * l.unitPriceCents)}</span>
            </li>
          ))}
        </ul>
        <hr className="border-slate-200" />
        <Row label="Sous-total" cents={totals.subtotalCents} />
        <Row label="Livraison" cents={totals.shippingCents} free={totals.shippingCents === 0} />
        {totals.taxes.map((t) => (
          <Row key={t.label} label={t.label} cents={t.cents} />
        ))}
        <div className="flex justify-between border-t border-slate-200 pt-3 text-lg font-bold">
          <span>Total maximum</span>
          <span>{formatMoney(totals.totalCents)}</span>
        </div>

        <p className="rounded-lg bg-terre-50 p-3 text-xs text-terre-900">
          💳 <strong>Votre carte sera autorisée, pas débitée.</strong> Nous encaissons seulement le montant des produits
          réellement trouvés en boutique. {SHOP.purchaseSchedule}
        </p>

        <label className="flex items-start gap-2 text-xs text-slate-600">
          <input type="checkbox" name="consent" required className="mt-0.5" />
          <span>
            J&apos;accepte les <Link href="/conditions" target="_blank" className="underline">conditions de vente</Link> et
            la <Link href="/confidentialite" target="_blank" className="underline">politique de confidentialité</Link>.
          </span>
        </label>

        {state.error && <p className="rounded-lg bg-rose-50 p-2 text-sm text-rose-700">{state.error}</p>}

        <button className="btn-primary w-full" disabled={pending}>
          {pending ? "Un instant…" : demoMode ? "Commander (mode démo)" : "Payer en toute sécurité"}
        </button>
        {demoMode && (
          <p className="text-center text-xs text-slate-500">
            Mode démo : aucun paiement réel (clé Stripe non configurée).
          </p>
        )}
      </aside>
    </form>
  );
}

function Field({
  label,
  name,
  className = "",
  ...props
}: { label: string; name: string; className?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={className}>
      <label className="label" htmlFor={name}>{label}</label>
      <input id={name} name={name} className="input" {...props} />
    </div>
  );
}

function Row({ label, cents, free }: { label: string; cents: number; free?: boolean }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-slate-600">{label}</span>
      <span>{free ? "Gratuite" : formatMoney(cents)}</span>
    </div>
  );
}

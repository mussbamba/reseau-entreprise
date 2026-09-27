import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { PROVINCE_NAMES, SHOP } from "@/lib/config";
import { stripeEnabled } from "@/lib/env";
import { formatMoney } from "@/lib/money";
import { CUSTOMER_STEPS, ITEM_STATUS_LABELS, orderNumber } from "@/lib/orders";
import { syncCheckoutSession } from "@/lib/stripe-sync";
import { ClearCart } from "./ClearCart";

export const dynamic = "force-dynamic";
export const metadata = { title: "Ma commande", robots: { index: false } };

async function load(publicId: string) {
  return db.order.findUnique({ where: { publicId }, include: { items: true } });
}

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ publicId: string }>;
  searchParams: Promise<{ nouvelle?: string; session_id?: string }>;
}) {
  const { publicId } = await params;
  const { nouvelle, session_id } = await searchParams;
  let order = await load(publicId);
  if (!order) notFound();

  // Retour de Stripe : on vérifie le paiement sans attendre le webhook
  if (order.status === "PENDING_PAYMENT" && session_id && stripeEnabled() && session_id === order.stripeSessionId) {
    await syncCheckoutSession(session_id);
    order = (await load(publicId))!;
  }

  const stepIndex = CUSTOMER_STEPS.findIndex((s) => s.status === order.status);
  const cancelled = order.status === "CANCELLED";
  const pending = order.status === "PENDING_PAYMENT";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {nouvelle && !pending && <ClearCart />}
      {nouvelle && !pending && (
        <div className="rounded-2xl bg-emerald-50 p-5 text-emerald-900">
          <p className="text-lg font-bold">Merci {order.name.split(" ")[0]} ! Votre commande est confirmée 🎉</p>
          <p className="mt-1 text-sm">
            Un courriel de confirmation a été envoyé à {order.email}. Conservez cette page pour suivre votre commande.
          </p>
        </div>
      )}

      <div className="flex flex-wrap items-end justify-between gap-2">
        <h1 className="text-3xl font-extrabold">Commande {orderNumber(order.id)}</h1>
        <p className="text-sm text-slate-500">
          Passée le {order.createdAt.toLocaleDateString("fr-CA", { dateStyle: "long" })}
        </p>
      </div>

      {pending && (
        <p className="rounded-xl bg-sky-50 p-4 text-sm text-sky-900">
          Paiement non confirmé. Si vous venez de payer, rafraîchissez la page dans quelques secondes.{" "}
          <Link href="/panier" className="underline">Retour au panier</Link>
        </p>
      )}

      {cancelled && (
        <p className="rounded-xl bg-rose-50 p-4 text-sm text-rose-800">
          Cette commande a été annulée. Aucun montant n&apos;a été débité.
        </p>
      )}

      {!pending && !cancelled && (
        <ol className="card grid gap-4 p-5 sm:grid-cols-5">
          {CUSTOMER_STEPS.map((s, i) => {
            const done = i <= stepIndex;
            return (
              <li key={s.status} className="flex gap-3 sm:flex-col sm:items-center sm:text-center">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                    done ? "bg-foret text-white" : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {done ? "✓" : i + 1}
                </span>
                <div>
                  <p className={`text-sm font-semibold ${done ? "" : "text-slate-400"}`}>{s.label}</p>
                  {i === stepIndex && <p className="text-xs text-slate-500">{s.hint}</p>}
                </div>
              </li>
            );
          })}
        </ol>
      )}

      {order.trackingNumber && (
        <div className="card p-5 text-sm">
          <p className="font-bold">📦 Suivi du colis</p>
          <p className="mt-1">
            {order.carrier && <>Transporteur : {order.carrier} · </>}Numéro : <strong>{order.trackingNumber}</strong>
          </p>
        </div>
      )}

      <div className="card overflow-hidden">
        <ul className="divide-y divide-slate-200">
          {order.items.map((it) => (
            <li key={it.id} className="flex items-center justify-between gap-3 p-4 text-sm">
              <div>
                <p className={it.status === "UNAVAILABLE" ? "text-slate-400 line-through" : "font-medium"}>
                  {it.quantity} × {it.name}
                </p>
                {it.status !== "PENDING" && (
                  <p className={`text-xs ${it.status === "BOUGHT" ? "text-emerald-700" : "text-rose-600"}`}>
                    {it.status === "UNAVAILABLE" ? "Introuvable, non facturé" : ITEM_STATUS_LABELS[it.status]}
                  </p>
                )}
              </div>
              <span>{formatMoney(it.quantity * it.unitPriceCents)}</span>
            </li>
          ))}
        </ul>
        <div className="space-y-1 border-t border-slate-200 bg-slate-50 p-4 text-sm">
          <Line label="Sous-total" value={formatMoney(order.subtotalCents)} />
          <Line label="Livraison" value={order.shippingCents ? formatMoney(order.shippingCents) : "Gratuite"} />
          {order.taxCents > 0 && <Line label="Taxes" value={formatMoney(order.taxCents)} />}
          <Line label="Montant autorisé" value={formatMoney(order.totalCents)} strong={order.finalCents === null} />
          {order.finalCents !== null && <Line label="Montant final débité" value={formatMoney(order.finalCents)} strong />}
        </div>
      </div>

      <div className="card p-5 text-sm">
        <p className="font-bold">Livraison</p>
        <p className="mt-1 text-slate-700">
          {order.name}
          <br />
          {order.address1}
          {order.address2 && `, ${order.address2}`}
          <br />
          {order.city}, {PROVINCE_NAMES[order.province] ?? order.province} {order.postalCode}
        </p>
      </div>

      <p className="text-center text-sm text-slate-500">
        Une question ? Écrivez-nous à{" "}
        <a className="underline" href={`mailto:${SHOP.contactEmail}`}>{SHOP.contactEmail}</a> en indiquant{" "}
        {orderNumber(order.id)}.
      </p>
    </div>
  );
}

function Line({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex justify-between ${strong ? "text-base font-bold" : ""}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

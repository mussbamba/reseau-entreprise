import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { PROVINCE_NAMES } from "@/lib/config";
import { formatMoney } from "@/lib/money";
import { finalTotalsFor } from "@/lib/order-service";
import { ITEM_STATUS_LABELS, PAYMENT_LABELS, orderNumber } from "@/lib/orders";
import { StatusBadge } from "@/components/StatusBadge";
import { cancel, capture, markAll, markDelivered, ship, updateItem } from "../actions";

const CARRIERS = ["Postes Canada", "Chit Chats", "Stallion Express", "Purolator", "Canpar", "Livraison locale"];

export default async function AdminOrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ erreur?: string }>;
}) {
  const { id } = await params;
  const { erreur } = await searchParams;
  const order = await db.order.findUnique({
    where: { id: Number(id) },
    include: { items: { orderBy: { storeName: "asc" } }, events: { orderBy: { createdAt: "desc" } } },
  });
  if (!order) notFound();

  const editable = ["NEW", "SHOPPING"].includes(order.status);
  const pendingItems = order.items.filter((i) => i.status === "PENDING").length;
  const final = finalTotalsFor(order);
  const cost = order.items
    .filter((i) => i.status === "BOUGHT")
    .reduce((s, i) => s + i.unitCostCents * i.quantity, 0);
  const hidden = <input type="hidden" name="orderId" value={order.id} />;

  return (
    <div className="space-y-6">
      <Link href="/admin" className="text-sm text-stone-500 hover:underline">← Commandes</Link>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-extrabold">{orderNumber(order.id)}</h1>
        <StatusBadge status={order.status} />
        <span className="text-sm text-stone-500">Paiement : {PAYMENT_LABELS[order.paymentStatus]}</span>
      </div>
      {erreur && <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{erreur}</p>}

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          {/* Articles */}
          <section className="card overflow-hidden">
            <div className="flex items-center justify-between border-b border-stone-200 p-4">
              <h2 className="font-bold">Articles</h2>
              {editable && pendingItems > 0 && (
                <form action={markAll}>
                  {hidden}
                  <button className="btn-secondary px-3! py-1! text-xs!">Tout marquer acheté</button>
                </form>
              )}
            </div>
            <ul className="divide-y divide-stone-100">
              {order.items.map((it) => (
                <li key={it.id} className="flex flex-wrap items-center gap-3 p-4 text-sm">
                  <div className="min-w-0 flex-1">
                    <p className={`font-medium ${it.status === "UNAVAILABLE" ? "text-stone-400 line-through" : ""}`}>
                      {it.quantity} × {it.name}
                    </p>
                    <p className="text-xs text-stone-500">
                      {it.storeName || "Boutique non définie"} · {formatMoney(it.unitPriceCents)} / u · coût estimé{" "}
                      {formatMoney(it.unitCostCents)}
                    </p>
                  </div>
                  {editable ? (
                    <div className="flex gap-1">
                      {(["BOUGHT", "UNAVAILABLE", "PENDING"] as const).map((s) => (
                        <form key={s} action={updateItem}>
                          {hidden}
                          <input type="hidden" name="itemId" value={it.id} />
                          <input type="hidden" name="status" value={s} />
                          <button
                            disabled={it.status === s}
                            className={`rounded-full border px-2.5 py-1 text-xs ${
                              it.status === s
                                ? s === "BOUGHT"
                                  ? "border-emerald-600 bg-emerald-600 text-white"
                                  : s === "UNAVAILABLE"
                                    ? "border-rose-600 bg-rose-600 text-white"
                                    : "border-stone-500 bg-stone-500 text-white"
                                : "border-stone-300 bg-white hover:border-stone-500"
                            }`}
                          >
                            {s === "BOUGHT" ? "✓ Acheté" : s === "UNAVAILABLE" ? "✗ Introuvable" : "↺"}
                          </button>
                        </form>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-stone-500">{ITEM_STATUS_LABELS[it.status]}</span>
                  )}
                </li>
              ))}
            </ul>
          </section>

          {order.notes && (
            <section className="card p-4 text-sm">
              <h2 className="font-bold">Note du client</h2>
              <p className="mt-1 whitespace-pre-line">{order.notes}</p>
            </section>
          )}

          {/* Actions selon l'étape */}
          {editable && (
            <section className="card space-y-3 p-4">
              <h2 className="font-bold">Encaisser le montant réel</h2>
              <p className="text-sm text-stone-600">
                Montant final : <strong>{formatMoney(final.totalCents)}</strong> sur {formatMoney(order.totalCents)}{" "}
                autorisés. Le client recevra un courriel avec le détail.
              </p>
              <form action={capture}>
                {hidden}
                <button className="btn-primary" disabled={pendingItems > 0}>
                  💳 Encaisser {formatMoney(final.totalCents)}
                </button>
                {pendingItems > 0 && (
                  <p className="mt-2 text-xs text-stone-500">
                    Encore {pendingItems} article(s) à marquer « acheté » ou « introuvable ».
                  </p>
                )}
              </form>
            </section>
          )}

          {order.status === "PURCHASED" && (
            <section className="card space-y-3 p-4">
              <h2 className="font-bold">Expédier</h2>
              <form action={ship} className="grid gap-3 sm:grid-cols-[180px_1fr_auto]">
                {hidden}
                <select name="carrier" className="input">
                  {CARRIERS.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
                <input name="trackingNumber" placeholder="Numéro de suivi" className="input" />
                <button className="btn-primary">📦 Marquer expédiée</button>
              </form>
            </section>
          )}

          {order.status === "SHIPPED" && (
            <form action={markDelivered} className="card p-4">
              {hidden}
              <p className="mb-3 text-sm">
                {order.carrier} · {order.trackingNumber || "sans numéro de suivi"}
              </p>
              <button className="btn-secondary">✅ Marquer livrée</button>
            </form>
          )}

          {["PENDING_PAYMENT", "NEW", "SHOPPING"].includes(order.status) && (
            <details className="card p-4 text-sm">
              <summary className="cursor-pointer font-semibold text-rose-700">Annuler la commande</summary>
              <form action={cancel} className="mt-3 flex flex-wrap gap-2">
                {hidden}
                <input name="reason" placeholder="Raison (facultatif)" className="input flex-1" />
                <button className="btn-danger">Annuler et libérer la carte</button>
              </form>
            </details>
          )}
        </div>

        <aside className="space-y-6">
          <section className="card space-y-1 p-4 text-sm">
            <h2 className="mb-2 font-bold">Client</h2>
            <p>{order.name}</p>
            <p><a className="text-terre-600 underline" href={`mailto:${order.email}`}>{order.email}</a></p>
            {order.phone && <p><a className="text-terre-600 underline" href={`tel:${order.phone}`}>{order.phone}</a></p>}
            <p className="pt-2 text-stone-700">
              {order.address1}
              {order.address2 && `, ${order.address2}`}
              <br />
              {order.city}, {PROVINCE_NAMES[order.province] ?? order.province} {order.postalCode}
            </p>
          </section>

          <section className="card space-y-1 p-4 text-sm">
            <h2 className="mb-2 font-bold">Montants</h2>
            <Row label="Sous-total commandé" value={formatMoney(order.subtotalCents)} />
            <Row label="Livraison facturée" value={formatMoney(order.shippingCents)} />
            <Row label="Autorisé" value={formatMoney(order.totalCents)} />
            <Row label="Encaissé" value={order.finalCents === null ? "—" : formatMoney(order.finalCents)} />
            <Row label="Coût estimé des produits" value={formatMoney(cost)} />
            {order.finalCents !== null && (
              <Row
                label="Marge avant frais d'envoi"
                value={formatMoney(order.finalCents - order.taxCents - cost)}
              />
            )}
          </section>

          <section className="card p-4 text-sm">
            <h2 className="mb-2 font-bold">Historique</h2>
            <ul className="space-y-2">
              {order.events.map((e) => (
                <li key={e.id}>
                  <p>{e.message}</p>
                  <p className="text-xs text-stone-500">{e.createdAt.toLocaleString("fr-CA")}</p>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-stone-600">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

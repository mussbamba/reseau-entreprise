/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { REQUEST_STATUS } from "@/lib/requests";
import { markUnavailable, sendQuote } from "../actions";

const dollars = (c: number) => (c / 100).toFixed(2);

export default async function AdminRequestPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ erreur?: string }>;
}) {
  const { id } = await params;
  const { erreur } = await searchParams;
  const [r, stores] = await Promise.all([
    db.productRequest.findUnique({ where: { id: Number(id) }, include: { product: true } }),
    db.store.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!r) notFound();
  const open = ["PENDING", "QUOTED"].includes(r.status);
  const status = REQUEST_STATUS[r.status];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link href="/admin/demandes" className="text-sm text-stone-500 hover:underline">← Demandes</Link>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-extrabold">{r.quantity} × {r.name}</h1>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${status.color}`}>{status.label}</span>
      </div>
      {erreur && <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{erreur}</p>}

      {r.photo && <img src={r.photo} alt="Photo envoyée par le client" className="card max-h-80 w-full object-contain p-2" />}

      <section className="card space-y-2 p-4 text-sm">
        {r.details && <Row label="Détails" value={r.details} />}
        <Row label="Quantité" value={String(r.quantity)} />
        <Row label="Prix max accepté" value={r.maxPriceCents ? `${formatMoney(r.maxPriceCents)} / unité` : "Non précisé"} />
        <Row label="Client" value={r.customerName} />
        <Row label="Courriel" value={r.email} />
        {r.phone && <Row label="Téléphone" value={r.phone} />}
        <Row label="Reçue le" value={r.createdAt.toLocaleString("fr-CA")} />
      </section>

      {open ? (
        <form action={sendQuote} className="card grid gap-4 p-4 sm:grid-cols-2">
          <input type="hidden" name="id" value={r.id} />
          <h2 className="font-bold sm:col-span-2">
            {r.status === "QUOTED" ? "Modifier le prix envoyé" : "Envoyer un prix au client"}
          </h2>
          <div>
            <label className="label" htmlFor="price">Prix de vente par unité ($)</label>
            <input id="price" name="price" required inputMode="decimal" className="input"
              defaultValue={r.product ? dollars(r.product.priceCents) : ""} />
          </div>
          <div>
            <label className="label" htmlFor="cost">Coût en boutique ($)</label>
            <input id="cost" name="cost" inputMode="decimal" className="input"
              defaultValue={r.product ? dollars(r.product.costCents) : ""} />
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="storeId">Boutique où l&apos;acheter</label>
            <select id="storeId" name="storeId" className="input" defaultValue={r.product?.storeId ?? ""}>
              <option value="">— Non définie —</option>
              {stores.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="note">Message au client (facultatif)</label>
            <input id="note" name="note" className="input" defaultValue={r.vendorNote} placeholder="Ex. : disponible en sachet de 100 g" />
          </div>
          <div className="flex flex-wrap gap-2 sm:col-span-2">
            <button className="btn-primary">Envoyer le prix par courriel</button>
            <button formAction={markUnavailable} className="btn-danger">Introuvable</button>
          </div>
        </form>
      ) : (
        <p className="rounded-xl bg-stone-100 p-4 text-sm">
          {r.status === "ORDERED" && "Le client a commandé ce produit : il apparaît dans la liste d'achat avec sa commande."}
          {r.status === "DECLINED" && "Le client a refusé le prix."}
          {r.status === "UNAVAILABLE" && "Marqué introuvable. Le client a été prévenu par courriel."}
        </p>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-stone-600">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

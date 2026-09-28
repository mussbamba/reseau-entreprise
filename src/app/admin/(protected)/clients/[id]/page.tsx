import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { STATUS_COLORS, STATUS_LABELS, orderNumber } from "@/lib/orders";
import { REQUEST_STATUS } from "@/lib/requests";
import { deleteClient, toggleBlocked, updateClient } from "../actions";
import { ResetPassword } from "./ResetPassword";

export default async function AdminClientPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ok?: string }>;
}) {
  const { id } = await params;
  const { ok } = await searchParams;
  const u = await db.user.findUnique({
    where: { id: Number(id) },
    select: {
      id: true, name: true, email: true, phone: true, disabled: true, createdAt: true,
      orders: { orderBy: { createdAt: "desc" }, include: { items: true } },
      requests: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!u) notFound();
  const paid = u.orders.filter((o) => o.status !== "PENDING_PAYMENT");
  const spent = paid.reduce((s, o) => s + (o.finalCents ?? 0), 0);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link href="/admin/clients" className="text-sm text-slate-500 hover:underline">← Clients</Link>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-extrabold">{u.name}</h1>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${u.disabled ? "bg-rose-100 text-rose-800" : "bg-emerald-100 text-emerald-800"}`}>
          {u.disabled ? "Bloqué" : "Actif"}
        </span>
      </div>
      {ok && <p className="rounded-lg bg-sky-50 p-3 text-sm text-sky-900">{ok}</p>}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card p-4"><p className="text-xs uppercase text-slate-500">Commandes</p><p className="text-2xl font-bold">{paid.length}</p></div>
        <div className="card p-4"><p className="text-xs uppercase text-slate-500">Total encaissé</p><p className="text-2xl font-bold">{formatMoney(spent)}</p></div>
        <div className="card p-4"><p className="text-xs uppercase text-slate-500">Client depuis</p><p className="text-lg font-bold">{u.createdAt.toLocaleDateString("fr-CA", { dateStyle: "long" })}</p></div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <section className="card p-4">
            <h2 className="mb-3 font-bold">Commandes</h2>
            {paid.length === 0 ? (
              <p className="text-sm text-slate-500">Aucune commande.</p>
            ) : (
              <ul className="divide-y divide-slate-100 text-sm">
                {paid.map((o) => (
                  <li key={o.id} className="flex flex-wrap items-center gap-3 py-2">
                    <Link href={`/admin/commandes/${o.id}`} className="font-semibold text-terre-700 hover:underline">{orderNumber(o.id)}</Link>
                    <span className="text-slate-500">{o.createdAt.toLocaleDateString("fr-CA")} · {o.items.reduce((n, i) => n + i.quantity, 0)} article(s)</span>
                    <span className="ml-auto">{formatMoney(o.finalCents ?? o.totalCents)}</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLORS[o.status]}`}>{STATUS_LABELS[o.status]}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section className="card p-4">
            <h2 className="mb-3 font-bold">Demandes spéciales</h2>
            {u.requests.length === 0 ? (
              <p className="text-sm text-slate-500">Aucune demande.</p>
            ) : (
              <ul className="divide-y divide-slate-100 text-sm">
                {u.requests.map((r) => (
                  <li key={r.id} className="flex items-center gap-3 py-2">
                    <Link href={`/admin/demandes/${r.id}`} className="flex-1 hover:underline">{r.quantity} × {r.name}</Link>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${REQUEST_STATUS[r.status].color}`}>{REQUEST_STATUS[r.status].label}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="space-y-4">
          <form action={updateClient} className="card space-y-3 p-4">
            <h2 className="font-bold">Fiche</h2>
            <input type="hidden" name="id" value={u.id} />
            <div>
              <label className="label" htmlFor="name">Nom</label>
              <input id="name" name="name" defaultValue={u.name} className="input" />
            </div>
            <div>
              <label className="label" htmlFor="email">Courriel</label>
              <input id="email" value={u.email} readOnly className="input bg-slate-50 text-slate-500" />
            </div>
            <div>
              <label className="label" htmlFor="phone">Téléphone</label>
              <input id="phone" name="phone" defaultValue={u.phone} className="input" />
            </div>
            <button className="btn-primary w-full">Enregistrer</button>
          </form>

          <section className="card space-y-3 p-4">
            <h2 className="font-bold">Accès</h2>
            <form action={toggleBlocked}>
              <input type="hidden" name="id" value={u.id} />
              <button className={u.disabled ? "btn-primary w-full" : "btn-danger w-full"}>
                {u.disabled ? "Débloquer le compte" : "🚫 Bloquer le compte"}
              </button>
            </form>
            <ResetPassword id={u.id} />
          </section>

          <details className="card p-4 text-sm">
            <summary className="cursor-pointer font-semibold text-rose-700">Supprimer le compte</summary>
            <form action={deleteClient} className="mt-3 space-y-2">
              <input type="hidden" name="id" value={u.id} />
              <p className="text-slate-600">Le compte est supprimé définitivement. Les commandes sont conservées pour la comptabilité.</p>
              <label className="flex items-center gap-2"><input type="checkbox" name="confirm" /> Je confirme la suppression</label>
              <button className="btn-danger w-full">Supprimer définitivement</button>
            </form>
          </details>
        </aside>
      </div>
    </div>
  );
}

import Link from "next/link";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { orderNumber } from "@/lib/orders";

export default async function AdminClientsPage({ searchParams }: { searchParams: Promise<{ q?: string; supprime?: string }> }) {
  const { q = "", supprime } = await searchParams;
  const users = await db.user.findMany({
    // Le mot de passe haché n'est jamais lu ici
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      disabled: true,
      createdAt: true,
      orders: {
        where: { status: { not: "PENDING_PAYMENT" } },
        select: { id: true, finalCents: true, totalCents: true, status: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      },
      _count: { select: { requests: true } },
    },
    where: q ? { OR: [{ name: { contains: q } }, { email: { contains: q } }] } : undefined,
    orderBy: { createdAt: "desc" },
    take: 500,
  });
  const total = await db.user.count();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">Clients ({total})</h1>
          <p className="text-sm text-slate-600">Cliquez sur un client pour modifier sa fiche, bloquer son compte ou réinitialiser son mot de passe.</p>
        </div>
        <form className="flex gap-2">
          <input name="q" defaultValue={q} placeholder="Nom ou courriel" className="input" />
          <button className="btn-primary">Rechercher</button>
        </form>
      </div>

      {supprime && <p className="rounded-lg bg-sky-50 p-3 text-sm text-sky-900">Compte supprimé.</p>}
      {users.length === 0 ? (
        <p className="py-10 text-center text-slate-500">{q ? "Aucun client ne correspond." : "Aucun compte client pour le moment."}</p>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="p-3">Client</th>
                <th className="p-3">Inscrit le</th>
                <th className="p-3 text-right">Commandes</th>
                <th className="p-3 text-right">Total dépensé</th>
                <th className="p-3">Dernières commandes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => {
                const spent = u.orders.reduce((s, o) => s + (o.finalCents ?? 0), 0);
                return (
                  <tr key={u.id} className="align-top">
                    <td className="p-3">
                      <Link href={`/admin/clients/${u.id}`} className="font-semibold text-terre-700 hover:underline">{u.name}</Link>
                      {u.disabled && <span className="ml-2 rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-800">Bloqué</span>}
                      <p className="text-slate-500">{u.email}</p>
                      {u.phone && <p className="text-slate-500">{u.phone}</p>}
                      {u._count.requests > 0 && <p className="text-xs text-slate-500">{u._count.requests} demande(s) spéciale(s)</p>}
                    </td>
                    <td className="p-3 whitespace-nowrap">{u.createdAt.toLocaleDateString("fr-CA")}</td>
                    <td className="p-3 text-right">{u.orders.length}</td>
                    <td className="p-3 text-right">{formatMoney(spent)}</td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1.5">
                        {u.orders.slice(0, 4).map((o) => (
                          <Link key={o.id} href={`/admin/commandes/${o.id}`} className="rounded bg-slate-100 px-2 py-0.5 text-xs hover:underline">
                            {orderNumber(o.id)}
                          </Link>
                        ))}
                        {u.orders.length === 0 && <span className="text-xs text-slate-400">—</span>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

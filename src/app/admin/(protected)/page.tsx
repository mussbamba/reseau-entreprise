import Link from "next/link";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { STATUS_LABELS, orderNumber } from "@/lib/orders";
import { StatusBadge } from "@/components/StatusBadge";

const TABS = ["A_TRAITER", "NEW", "SHOPPING", "PURCHASED", "SHIPPED", "DELIVERED", "CANCELLED", "PENDING_PAYMENT"];
const TAB_LABELS: Record<string, string> = { A_TRAITER: "À traiter", ...STATUS_LABELS };
const TO_HANDLE = ["NEW", "SHOPPING", "PURCHASED"];

// Une autorisation de carte expire après 7 jours chez Stripe
const AUTH_WARNING_DAYS = 5;

export default async function AdminDashboard({ searchParams }: { searchParams: Promise<{ statut?: string }> }) {
  const { statut = "A_TRAITER" } = await searchParams;
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  const [pendingRequests, counts, orders, month] = await Promise.all([
    db.productRequest.count({ where: { status: "PENDING" } }),
    db.order.groupBy({ by: ["status"], _count: true }),
    db.order.findMany({
      where: { status: statut === "A_TRAITER" ? { in: TO_HANDLE } : statut },
      include: { items: true },
      orderBy: { createdAt: statut === "A_TRAITER" ? "asc" : "desc" },
      take: 100,
    }),
    db.order.findMany({
      where: { createdAt: { gte: monthStart }, finalCents: { not: null } },
      include: { items: true },
    }),
  ]);
  const count = (s: string) =>
    s === "A_TRAITER"
      ? counts.filter((c) => TO_HANDLE.includes(c.status)).reduce((n, c) => n + c._count, 0)
      : (counts.find((c) => c.status === s)?._count ?? 0);

  const revenue = month.reduce((s, o) => s + (o.finalCents ?? 0), 0);
  const cost = month.reduce(
    (s, o) =>
      s + o.items.filter((i) => i.status === "BOUGHT").reduce((t, i) => t + i.unitCostCents * i.quantity, 0),
    0,
  );

  return (
    <div className="space-y-6">
      {pendingRequests > 0 && (
        <Link href="/admin/demandes" className="block rounded-xl bg-amber-50 p-3 text-sm font-semibold text-amber-900 hover:underline">
          ✨ {pendingRequests} demande(s) spéciale(s) en attente de prix →
        </Link>
      )}
      <div className="grid gap-3 sm:grid-cols-4">
        <Stat label="Nouvelles" value={count("NEW")} />
        <Stat label="À acheter / en cours" value={count("NEW") + count("SHOPPING")} />
        <Stat label="À expédier" value={count("PURCHASED")} />
        <Stat
          label="Encaissé ce mois"
          value={formatMoney(revenue)}
          hint={`Coût estimé des produits : ${formatMoney(cost)}`}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <Link
            key={t}
            href={`/admin?statut=${t}`}
            className={`rounded-full border px-3 py-1 text-sm ${
              t === statut ? "border-terre-500 bg-terre-500 text-white" : "border-stone-300 bg-white"
            }`}
          >
            {TAB_LABELS[t]} ({count(t)})
          </Link>
        ))}
      </div>

      {orders.length === 0 ? (
        <p className="py-10 text-center text-stone-500">Aucune commande ici.</p>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-stone-200 text-xs uppercase text-stone-500">
              <tr>
                <th className="p-3">Commande</th>
                <th className="p-3">Client</th>
                <th className="p-3">Articles</th>
                <th className="p-3">Montant</th>
                <th className="p-3">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {orders.map((o) => {
                const ageDays = (Date.now() - o.createdAt.getTime()) / 86_400_000;
                const expiring = o.paymentStatus === "AUTHORIZED" && ageDays > AUTH_WARNING_DAYS;
                return (
                  <tr key={o.id} className="hover:bg-terre-50">
                    <td className="p-3">
                      <Link href={`/admin/commandes/${o.id}`} className="font-semibold text-terre-700 hover:underline">
                        {orderNumber(o.id)}
                      </Link>
                      <p className="text-xs text-stone-500">{o.createdAt.toLocaleString("fr-CA")}</p>
                    </td>
                    <td className="p-3">
                      {o.name}
                      <p className="text-xs text-stone-500">{o.city}, {o.province}</p>
                    </td>
                    <td className="p-3">{o.items.reduce((s, i) => s + i.quantity, 0)}</td>
                    <td className="p-3">{formatMoney(o.finalCents ?? o.totalCents)}</td>
                    <td className="p-3">
                      <StatusBadge status={o.status} />
                      {expiring && (
                        <p className="mt-1 text-xs font-semibold text-rose-600">⚠ Autorisation bientôt expirée</p>
                      )}
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

function Stat({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="card p-4">
      <p className="text-xs uppercase text-stone-500">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
      {hint && <p className="mt-1 text-xs text-stone-500">{hint}</p>}
    </div>
  );
}

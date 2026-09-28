import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/customer-auth";
import { formatMoney } from "@/lib/money";
import { STATUS_COLORS, STATUS_LABELS, orderNumber } from "@/lib/orders";
import { REQUEST_STATUS } from "@/lib/requests";
import { logout } from "../connexion/actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Votre compte", robots: { index: false } };

export default async function AccountPage() {
  const user = await requireUser("/compte");
  const [orders, requests] = await Promise.all([
    db.order.findMany({
      // Seulement les commandes passées en étant connecté : le courriel n'est pas vérifié
      where: { userId: user.id, status: { not: "PENDING_PAYMENT" } },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    }),
    db.productRequest.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <div className="-mx-4 -mt-6 flex flex-col gap-3 sm:mx-0 sm:mt-0">
      <section className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 sm:rounded-md">
        <div>
          <h1 className="text-2xl">Bonjour, {user.name.split(" ")[0]}</h1>
          <p className="text-sm text-[#565959]">{user.email}</p>
        </div>
        <form action={logout}>
          <button className="az-white">Se déconnecter</button>
        </form>
      </section>

      <section className="bg-white p-4 sm:rounded-md">
        <h2 className="text-lg font-bold">Vos commandes</h2>
        {orders.length === 0 ? (
          <p className="mt-2 text-sm text-[#565959]">
            Aucune commande pour l&apos;instant. <Link href="/produits" className="az-link">Commencer vos achats ›</Link>
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-[#e7e7e7] rounded-md border border-[#d5d9d9]">
            {orders.map((o) => (
              <li key={o.id} className="flex flex-wrap items-center gap-3 p-3 text-sm">
                <div className="min-w-0 flex-1">
                  <p className="font-bold">{orderNumber(o.id)}</p>
                  <p className="text-[#565959]">
                    {o.createdAt.toLocaleDateString("fr-CA", { dateStyle: "long" })} ·{" "}
                    {o.items.reduce((n, i) => n + i.quantity, 0)} article(s) · {formatMoney(o.finalCents ?? o.totalCents)}
                  </p>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLORS[o.status]}`}>{STATUS_LABELS[o.status]}</span>
                <Link href={`/commande/${o.publicId}`} className="az-white py-1.5!">Suivre</Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="bg-white p-4 sm:rounded-md">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Vos demandes spéciales</h2>
          <Link href="/demande" className="az-link text-sm">Nouvelle demande</Link>
        </div>
        {requests.length === 0 ? (
          <p className="mt-2 text-sm text-[#565959]">Aucune demande.</p>
        ) : (
          <ul className="mt-3 divide-y divide-[#e7e7e7] rounded-md border border-[#d5d9d9]">
            {requests.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center gap-3 p-3 text-sm">
                <p className="min-w-0 flex-1">{r.quantity} × {r.name}</p>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${REQUEST_STATUS[r.status].color}`}>{REQUEST_STATUS[r.status].label}</span>
                <Link href={`/demande/${r.publicId}`} className="az-link">Voir</Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

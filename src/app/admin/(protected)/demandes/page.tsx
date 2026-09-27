/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { db } from "@/lib/db";
import { REQUEST_STATUS } from "@/lib/requests";

const ORDER = ["PENDING", "QUOTED", "ORDERED", "DECLINED", "UNAVAILABLE"];

export default async function AdminRequestsPage() {
  const requests = await db.productRequest.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
  requests.sort((a, b) => ORDER.indexOf(a.status) - ORDER.indexOf(b.status));
  const pending = requests.filter((r) => r.status === "PENDING").length;

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div>
        <h1 className="text-2xl font-extrabold">Demandes spéciales</h1>
        <p className="text-sm text-stone-600">
          Produits hors catalogue demandés par vos clients ({pending} en attente de prix). Trouvez-les en boutique,
          puis envoyez un prix : le client pourra l&apos;ajouter à son panier.
        </p>
      </div>
      {requests.length === 0 ? (
        <p className="py-10 text-center text-stone-500">Aucune demande pour le moment.</p>
      ) : (
        <ul className="card divide-y divide-stone-100">
          {requests.map((r) => (
            <li key={r.id}>
              <Link href={`/admin/demandes/${r.id}`} className="flex items-center gap-3 p-4 hover:bg-terre-50">
                {r.photo ? (
                  <img src={r.photo} alt="" className="h-12 w-12 shrink-0 rounded-lg object-cover" />
                ) : (
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-2xl">✨</span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{r.quantity} × {r.name}</p>
                  <p className="text-xs text-stone-500">
                    {r.customerName} · {r.createdAt.toLocaleString("fr-CA")}
                  </p>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${REQUEST_STATUS[r.status].color}`}>
                  {REQUEST_STATUS[r.status].label}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

import Link from "next/link";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { orderNumber } from "@/lib/orders";
import { markGroup } from "./actions";

type Group = {
  key: string;
  name: string;
  quantity: number;
  costCents: number;
  itemIds: number[];
  orders: Set<number>;
};

export default async function ShoppingListPage() {
  const orders = await db.order.findMany({
    where: { status: { in: ["NEW", "SHOPPING"] } },
    include: { items: { include: { product: { include: { store: true } } } } },
    orderBy: { createdAt: "asc" },
  });

  // Regroupement : boutique → produit (quantités additionnées sur toutes les commandes)
  const stores = new Map<string, Map<string, Group>>();
  for (const o of orders) {
    for (const it of o.items) {
      if (it.status !== "PENDING") continue;
      const store = it.product?.store?.name || it.storeName || "Boutique non définie";
      const key = it.productId ? `p${it.productId}` : `n${it.name}`;
      if (!stores.has(store)) stores.set(store, new Map());
      const groups = stores.get(store)!;
      const g = groups.get(key) ?? { key, name: it.name, quantity: 0, costCents: 0, itemIds: [], orders: new Set() };
      g.quantity += it.quantity;
      g.costCents += it.unitCostCents * it.quantity;
      g.itemIds.push(it.id);
      g.orders.add(o.id);
      groups.set(key, g);
    }
  }
  const storeInfo = new Map((await db.store.findMany()).map((s) => [s.name, s]));
  const ready = orders.filter((o) => o.items.every((i) => i.status !== "PENDING"));

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">Liste d&apos;achat</h1>
        <p className="text-sm text-slate-600">
          Tous les articles à acheter pour les {orders.length} commande(s) en attente, regroupés par boutique. Cochez en
          magasin depuis votre téléphone.
        </p>
      </div>

      {ready.length > 0 && (
        <div className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-900">
          <p className="font-semibold">✅ Prêtes à encaisser :</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {ready.map((o) => (
              <Link key={o.id} href={`/admin/commandes/${o.id}`} className="rounded-full bg-white px-3 py-1 font-medium underline">
                {orderNumber(o.id)}
              </Link>
            ))}
          </div>
        </div>
      )}

      {stores.size === 0 && <p className="py-10 text-center text-slate-500">Rien à acheter pour le moment 🎉</p>}

      {[...stores.entries()].map(([store, groups]) => {
        const info = storeInfo.get(store);
        const total = [...groups.values()].reduce((s, g) => s + g.costCents, 0);
        return (
          <section key={store} className="card overflow-hidden">
            <div className="border-b border-slate-200 bg-terre-50 p-4">
              <h2 className="text-lg font-bold">🏪 {store}</h2>
              {info && (
                <p className="text-xs text-slate-600">
                  {info.address} {info.hours && `· ${info.hours}`}
                </p>
              )}
              <p className="text-xs text-slate-600">Budget estimé : {formatMoney(total)}</p>
            </div>
            <ul className="divide-y divide-slate-100">
              {[...groups.values()].map((g) => (
                <li key={g.key} className="flex flex-wrap items-center gap-3 p-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-100 text-lg font-bold text-sky-800">
                    {g.quantity}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{g.name}</p>
                    <p className="text-xs text-slate-500">
                      {[...g.orders].map((id) => orderNumber(id)).join(", ")}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <form action={markGroup}>
                      <input type="hidden" name="itemIds" value={g.itemIds.join(",")} />
                      <input type="hidden" name="status" value="BOUGHT" />
                      <button className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">✓ Acheté</button>
                    </form>
                    <form action={markGroup}>
                      <input type="hidden" name="itemIds" value={g.itemIds.join(",")} />
                      <input type="hidden" name="status" value="UNAVAILABLE" />
                      <button className="rounded-full border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-700">✗ Introuvable</button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

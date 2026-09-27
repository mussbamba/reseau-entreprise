import Link from "next/link";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { toggleActive } from "./actions";

export default async function AdminProductsPage() {
  const products = await db.product.findMany({
    where: { listed: true },
    include: { category: true, store: true },
    orderBy: [{ active: "desc" }, { name: "asc" }],
  });
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Produits ({products.length})</h1>
        <Link href="/admin/produits/nouveau" className="btn-primary">+ Nouveau produit</Link>
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-stone-200 text-xs uppercase text-stone-500">
            <tr>
              <th className="p-3">Produit</th>
              <th className="p-3">Boutique</th>
              <th className="p-3 text-right">Prix</th>
              <th className="p-3 text-right">Coût</th>
              <th className="p-3 text-right">Marge</th>
              <th className="p-3">Visible</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {products.map((p) => {
              const margin = p.priceCents - p.costCents;
              return (
                <tr key={p.id} className={p.active ? "" : "opacity-50"}>
                  <td className="p-3">
                    <Link href={`/admin/produits/${p.id}`} className="font-semibold text-terre-700 hover:underline">
                      {p.category.emoji} {p.name}
                    </Link>
                    {p.featured && <span className="ml-2 text-xs text-ocre">★ vedette</span>}
                  </td>
                  <td className="p-3 text-stone-600">{p.store?.name ?? "—"}</td>
                  <td className="p-3 text-right">{formatMoney(p.priceCents)}</td>
                  <td className="p-3 text-right text-stone-600">{formatMoney(p.costCents)}</td>
                  <td className={`p-3 text-right ${margin < 0 ? "text-rose-600" : "text-emerald-700"}`}>
                    {p.costCents ? `${Math.round((margin / p.priceCents) * 100)} %` : "—"}
                  </td>
                  <td className="p-3">
                    <form action={toggleActive}>
                      <input type="hidden" name="id" value={p.id} />
                      <button className="text-xs underline">{p.active ? "Masquer" : "Afficher"}</button>
                    </form>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

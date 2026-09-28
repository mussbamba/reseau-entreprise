import { db } from "@/lib/db";
import { deleteStore, saveStore } from "./actions";

export default async function StoresPage() {
  const stores = await db.store.findMany({ include: { _count: { select: { products: true } } }, orderBy: { name: "asc" } });

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <section className="space-y-4">
        <h1 className="text-2xl font-extrabold">Boutiques fournisseurs</h1>
        <p className="text-sm text-slate-600">Les épiceries où vous allez acheter. La liste d&apos;achat est regroupée par boutique.</p>
        {[...stores, null].map((s) => (
          <form key={s?.id ?? "new"} action={saveStore} className="card grid gap-2 p-4">
            {s && <input type="hidden" name="id" value={s.id} />}
            <p className="text-xs font-semibold uppercase text-slate-500">
              {s ? `${s._count.products} produit(s)` : "Ajouter une boutique"}
            </p>
            <input name="name" defaultValue={s?.name} placeholder="Nom" required className="input" />
            <input name="address" defaultValue={s?.address} placeholder="Adresse" className="input" />
            <input name="hours" defaultValue={s?.hours} placeholder="Heures d'ouverture" className="input" />
            <input name="notes" defaultValue={s?.notes} placeholder="Notes (contact, jours de livraison…)" className="input" />
            <div className="flex gap-2">
              <button className="btn-primary px-4! py-1.5!">{s ? "Enregistrer" : "Ajouter"}</button>
              {s && s._count.products === 0 && (
                <button formAction={deleteStore} className="btn-danger px-4! py-1.5!">Supprimer</button>
              )}
            </div>
          </form>
        ))}
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-extrabold">Catégories</h2>
        <p className="text-sm text-slate-600">Les catégories d&apos;articles ont maintenant leur propre page.</p>
        <a href="/admin/categories" className="btn-primary">🗂️ Gérer les catégories</a>
      </section>
    </div>
  );
}

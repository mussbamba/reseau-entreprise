import { db } from "@/lib/db";
import { deleteStore, saveCategory, saveStore } from "./actions";

export default async function StoresPage() {
  const [stores, categories] = await Promise.all([
    db.store.findMany({ include: { _count: { select: { products: true } } }, orderBy: { name: "asc" } }),
    db.category.findMany({ include: { _count: { select: { products: true } } }, orderBy: { position: "asc" } }),
  ]);

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <section className="space-y-4">
        <h1 className="text-2xl font-extrabold">Boutiques fournisseurs</h1>
        <p className="text-sm text-stone-600">Les épiceries où vous allez acheter. La liste d&apos;achat est regroupée par boutique.</p>
        {[...stores, null].map((s) => (
          <form key={s?.id ?? "new"} action={saveStore} className="card grid gap-2 p-4">
            {s && <input type="hidden" name="id" value={s.id} />}
            <p className="text-xs font-semibold uppercase text-stone-500">
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
        <p className="text-sm text-stone-600">L&apos;ordre définit l&apos;affichage sur le site.</p>
        <div className="card divide-y divide-stone-100">
          {[...categories, null].map((c) => (
            <form key={c?.id ?? "new"} action={saveCategory} className="flex flex-wrap items-center gap-2 p-3">
              {c && <input type="hidden" name="id" value={c.id} />}
              <input name="emoji" defaultValue={c?.emoji ?? "🛍️"} className="input w-14! text-center" aria-label="Emoji" />
              <input name="name" defaultValue={c?.name} placeholder="Nouvelle catégorie" required className="input min-w-0 flex-1" />
              <input name="position" type="number" defaultValue={c?.position ?? categories.length} className="input w-16!" aria-label="Ordre" />
              <button className="btn-secondary px-3! py-1.5!">{c ? "OK" : "Ajouter"}</button>
              {c && <span className="w-full text-xs text-stone-500">{c._count.products} produit(s)</span>}
            </form>
          ))}
        </div>
      </section>
    </div>
  );
}

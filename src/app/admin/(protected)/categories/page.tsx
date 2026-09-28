import { SPECIAL_CATEGORY } from "@/lib/config";
import { db } from "@/lib/db";
import { deleteCategory, saveCategory } from "./actions";

const EMOJIS = ["🌾", "🌶️", "🫙", "🐟", "🥤", "🧴", "🍠", "🥜", "🍚", "🫘", "🥥", "🍌", "🍫", "🧂", "🥩", "🧺", "👗", "💄"];

export default async function CategoriesPage({ searchParams }: { searchParams: Promise<{ msg?: string }> }) {
  const { msg } = await searchParams;
  const categories = await db.category.findMany({
    where: { slug: { not: SPECIAL_CATEGORY.slug } },
    include: { _count: { select: { products: true } } },
    orderBy: { position: "asc" },
  });

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold">Catégories d&apos;articles ({categories.length})</h1>
        <p className="text-sm text-slate-600">
          Les rayons de la boutique. L&apos;ordre définit l&apos;affichage sur le site (menu, accueil). Une catégorie ne peut être
          supprimée que si elle est vide.
        </p>
      </div>
      {msg && <p className="rounded-lg bg-sky-50 p-3 text-sm text-sky-900">{msg}</p>}

      <form action={saveCategory} className="card space-y-3 p-4">
        <h2 className="font-bold">+ Nouvelle catégorie</h2>
        <div className="grid gap-3 sm:grid-cols-[90px_1fr_90px]">
          <div>
            <label className="label" htmlFor="new-emoji">Icône</label>
            <input id="new-emoji" name="emoji" defaultValue="🛍️" className="input text-center text-xl" list="emojis" />
          </div>
          <div>
            <label className="label" htmlFor="new-name">Nom</label>
            <input id="new-name" name="name" required placeholder="Ex. : Tubercules frais" className="input" />
          </div>
          <div>
            <label className="label" htmlFor="new-pos">Ordre</label>
            <input id="new-pos" name="position" type="number" defaultValue={categories.length} className="input" />
          </div>
        </div>
        <p className="text-xs text-slate-500">Icônes suggérées : {EMOJIS.join(" ")}</p>
        <button className="btn-primary">Ajouter la catégorie</button>
      </form>
      <datalist id="emojis">
        {EMOJIS.map((e) => (
          <option key={e} value={e} />
        ))}
      </datalist>

      <ul className="card divide-y divide-slate-100">
        {categories.map((c) => (
          <li key={c.id} className="p-3">
            <form action={saveCategory} className="flex flex-wrap items-center gap-2">
              <input type="hidden" name="id" value={c.id} />
              <input name="emoji" defaultValue={c.emoji} list="emojis" className="input w-16! text-center text-xl" aria-label="Icône" />
              <input name="name" defaultValue={c.name} required className="input min-w-0 flex-1" aria-label="Nom" />
              <input name="position" type="number" defaultValue={c.position} className="input w-20!" aria-label="Ordre" />
              <button className="btn-secondary px-4! py-2!">Enregistrer</button>
              {c._count.products === 0 && (
                <button formAction={deleteCategory} className="btn-danger px-4! py-2!">Supprimer</button>
              )}
              <span className="w-full text-xs text-slate-500">{c._count.products} produit(s)</span>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}

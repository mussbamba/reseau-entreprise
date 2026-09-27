"use client";

import Link from "next/link";
import { useActionState } from "react";
import { saveProduct, type ProductFormState } from "./actions";

type Option = { id: number; name: string };
type Product = {
  id: number;
  name: string;
  description: string;
  origin: string;
  priceCents: number;
  costCents: number;
  weightGrams: number;
  imageUrl: string;
  categoryId: number;
  storeId: number | null;
  active: boolean;
  featured: boolean;
};

const dollars = (c: number) => (c / 100).toFixed(2);

export function ProductForm({
  product,
  categories,
  stores,
}: {
  product?: Product;
  categories: Option[];
  stores: Option[];
}) {
  const [state, action, pending] = useActionState<ProductFormState, FormData>(saveProduct, {});
  const p = product;
  return (
    <form action={action} className="card grid gap-4 p-5 sm:grid-cols-2">
      {p && <input type="hidden" name="id" value={p.id} />}
      <div className="sm:col-span-2">
        <label className="label" htmlFor="name">Nom du produit</label>
        <input id="name" name="name" required defaultValue={p?.name} className="input" placeholder="Gari blanc 1 kg" />
      </div>
      <div>
        <label className="label" htmlFor="price">Prix de vente ($)</label>
        <input id="price" name="price" required inputMode="decimal" defaultValue={p ? dollars(p.priceCents) : ""} className="input" />
      </div>
      <div>
        <label className="label" htmlFor="cost">Prix d&apos;achat en boutique ($)</label>
        <input id="cost" name="cost" inputMode="decimal" defaultValue={p ? dollars(p.costCents) : ""} className="input" />
      </div>
      <div>
        <label className="label" htmlFor="categoryId">Catégorie</label>
        <select id="categoryId" name="categoryId" defaultValue={p?.categoryId} className="input">
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="label" htmlFor="storeId">Boutique où l&apos;acheter</label>
        <select id="storeId" name="storeId" defaultValue={p?.storeId ?? ""} className="input">
          <option value="">— Non définie —</option>
          {stores.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>
      <input type="hidden" name="origin" value={p?.origin ?? ""} />
      <div>
        <label className="label" htmlFor="weightGrams">Poids (grammes)</label>
        <input id="weightGrams" name="weightGrams" type="number" min={0} defaultValue={p?.weightGrams ?? 500} className="input" />
      </div>
      <div className="sm:col-span-2">
        <label className="label" htmlFor="imageUrl">URL de la photo (facultatif)</label>
        <input id="imageUrl" name="imageUrl" type="url" defaultValue={p?.imageUrl} className="input" placeholder="https://…" />
      </div>
      <div className="sm:col-span-2">
        <label className="label" htmlFor="description">Description</label>
        <textarea id="description" name="description" rows={4} defaultValue={p?.description} className="input" />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="active" defaultChecked={p?.active ?? true} /> Visible sur le site
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="featured" defaultChecked={p?.featured ?? false} /> Mis en avant sur l&apos;accueil
      </label>
      {state.error && <p className="text-sm text-rose-700 sm:col-span-2">{state.error}</p>}
      <div className="flex gap-2 sm:col-span-2">
        <button className="btn-primary" disabled={pending}>Enregistrer</button>
        <Link href="/admin/produits" className="btn-secondary">Annuler</Link>
      </div>
    </form>
  );
}

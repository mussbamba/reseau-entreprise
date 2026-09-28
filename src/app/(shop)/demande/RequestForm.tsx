"use client";

/* eslint-disable @next/next/no-img-element */
import { useActionState, useState } from "react";
import { createRequest, type RequestState } from "./actions";

// Réduit la photo dans le navigateur (600 px max, JPEG) avant l'envoi
function resize(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, 600 / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * k);
      c.height = Math.round(img.height * k);
      c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL("image/jpeg", 0.8));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Image illisible"));
    };
    img.src = url;
  });
}

export function RequestForm({ prefill, user }: { prefill: string; user: { name: string; email: string } | null }) {
  const [state, action, pending] = useActionState<RequestState, FormData>(createRequest, {});
  const [photo, setPhoto] = useState("");
  const [photoError, setPhotoError] = useState("");
  const v: Record<string, string | undefined> = state.values ?? { customerName: user?.name, email: user?.email };

  async function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setPhoto(await resize(file));
      setPhotoError("");
    } catch {
      setPhotoError("Image illisible. Choisissez une photo JPG ou PNG.");
    }
  }

  return (
    <form action={action} className="card mt-6 grid gap-4 p-5 sm:grid-cols-2">
      <input type="hidden" name="photo" value={photo} />
      <div className="sm:col-span-2">
        <label className="label" htmlFor="name">Produit recherché</label>
        <input id="name" name="name" required defaultValue={v.name ?? prefill} className="input" placeholder="Ex. : feuilles de manioc séchées" />
      </div>
      <div className="sm:col-span-2">
        <label className="label" htmlFor="details">Détails (marque, format, pays…)</label>
        <input id="details" name="details" defaultValue={v.details} className="input" placeholder="Ex. : sachet de 500 g, marque Tropiway" />
      </div>
      <div>
        <label className="label" htmlFor="quantity">Quantité</label>
        <input id="quantity" name="quantity" type="number" min={1} max={50} defaultValue={v.quantity ?? 1} className="input" />
      </div>
      <div>
        <label className="label" htmlFor="maxPrice">Prix maximum par unité ($, facultatif)</label>
        <input id="maxPrice" name="maxPrice" inputMode="decimal" defaultValue={v.maxPrice} className="input" />
      </div>
      <div className="sm:col-span-2">
        <span className="label">Photo du produit (facultatif)</span>
        <div className="flex items-center gap-3">
          {photo && <img src={photo} alt="Photo jointe" className="h-16 w-16 rounded-lg object-cover" />}
          <label className="btn-secondary cursor-pointer">
            {photo ? "Changer la photo" : "Joindre une photo"}
            <input type="file" accept="image/*" onChange={onPhoto} className="sr-only" />
          </label>
        </div>
        {photoError && <p className="mt-1 text-sm text-rose-700">{photoError}</p>}
      </div>
      <div>
        <label className="label" htmlFor="customerName">Votre nom</label>
        <input id="customerName" name="customerName" required autoComplete="name" defaultValue={v.customerName} className="input" />
      </div>
      <div>
        <label className="label" htmlFor="email">Courriel</label>
        <input id="email" name="email" type="email" required autoComplete="email" defaultValue={v.email} className="input" />
      </div>
      <div className="sm:col-span-2">
        <label className="label" htmlFor="phone">Téléphone (facultatif)</label>
        <input id="phone" name="phone" type="tel" autoComplete="tel" defaultValue={v.phone} className="input" />
      </div>
      {state.error && <p className="rounded-lg bg-rose-50 p-2 text-sm text-rose-700 sm:col-span-2">{state.error}</p>}
      <div className="sm:col-span-2">
        <button className="btn-primary w-full sm:w-auto" disabled={pending}>
          {pending ? "Envoi…" : "Envoyer ma demande"}
        </button>
        <p className="mt-2 text-xs text-slate-500">Gratuit et sans engagement. Réponse habituelle sous 24 à 48 h.</p>
      </div>
    </form>
  );
}

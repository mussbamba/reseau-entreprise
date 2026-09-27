"use client";

import { useActionState } from "react";
import { findOrder } from "./actions";

export default function TrackingPage() {
  const [state, action, pending] = useActionState(findOrder, {});
  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-3xl font-extrabold">Suivre ma commande</h1>
      <p className="mt-2 text-sm text-slate-600">
        Entrez le numéro reçu par courriel (ex. CMD-00012) et votre adresse courriel.
      </p>
      <form action={action} className="card mt-6 space-y-4 p-5">
        <div>
          <label className="label" htmlFor="number">Numéro de commande</label>
          <input id="number" name="number" required className="input" placeholder="CMD-00012" />
        </div>
        <div>
          <label className="label" htmlFor="email">Courriel</label>
          <input id="email" name="email" type="email" required className="input" />
        </div>
        {state.error && <p className="text-sm text-rose-700">{state.error}</p>}
        <button className="btn-primary w-full" disabled={pending}>Voir ma commande</button>
      </form>
    </div>
  );
}

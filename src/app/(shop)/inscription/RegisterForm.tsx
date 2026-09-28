"use client";

import { useActionState } from "react";
import { register, type AuthState } from "../connexion/actions";

export function RegisterForm({ suite }: { suite: string }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(register, {});
  const v = state.values ?? {};
  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="suite" value={suite} />
      <div>
        <label className="mb-1 block text-sm font-bold" htmlFor="name">Votre nom</label>
        <input id="name" name="name" autoComplete="name" required defaultValue={v.name} placeholder="Prénom et nom" className="input" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-bold" htmlFor="email">Adresse courriel</label>
        <input id="email" name="email" type="email" autoComplete="email" required defaultValue={v.email} className="input" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-bold" htmlFor="password">Mot de passe</label>
        <input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} placeholder="Au moins 8 caractères" className="input" />
        <p className="mt-1 text-xs text-[#565959]">ⓘ Le mot de passe doit contenir au moins 8 caractères.</p>
      </div>
      <div>
        <label className="mb-1 block text-sm font-bold" htmlFor="confirm">Entrez à nouveau le mot de passe</label>
        <input id="confirm" name="confirm" type="password" autoComplete="new-password" required className="input" />
      </div>
      {state.error && (
        <p role="alert" className="rounded-md border border-[#c40000] bg-[#fff5f5] p-3 text-sm text-[#c40000]">{state.error}</p>
      )}
      <button className="az-yellow w-full" disabled={pending}>{pending ? "Création…" : "Créer votre compte"}</button>
    </form>
  );
}

"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, type AuthState } from "./actions";

export function LoginForm({ suite }: { suite: string }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(login, {});
  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="suite" value={suite} />
      <div>
        <label className="mb-1 block text-sm font-bold" htmlFor="email">Adresse courriel</label>
        <input id="email" name="email" type="email" autoComplete="email" required defaultValue={state.values?.email} className="input" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-bold" htmlFor="password">Mot de passe</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className="input" />
      </div>
      {state.error && (
        <p role="alert" className="rounded-md border border-[#c40000] bg-[#fff5f5] p-3 text-sm text-[#c40000]">{state.error}</p>
      )}
      <button className="az-yellow w-full" disabled={pending}>{pending ? "Connexion…" : "Se connecter"}</button>
      <p className="text-xs text-[#565959]">
        En vous connectant, vous acceptez nos <Link href="/conditions" className="az-link">conditions de vente</Link> et notre{" "}
        <Link href="/confidentialite" className="az-link">politique de confidentialité</Link>.
      </p>
    </form>
  );
}

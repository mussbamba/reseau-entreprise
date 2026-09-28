"use client";

import { useActionState } from "react";
import { PROVINCE_NAMES, SHIPPING } from "@/lib/config";
import { register, type AuthState } from "../connexion/actions";

function Input({ label, name, hint, ...props }: { label: string; name: string; hint?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="mb-1 block text-sm font-bold" htmlFor={name}>{label}</label>
      <input id={name} name={name} className="input" {...props} />
      {hint && <p className="mt-1 text-xs text-[#565959]">{hint}</p>}
    </div>
  );
}

export function RegisterForm({ suite }: { suite: string }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(register, {});
  const v = state.values ?? {};
  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="suite" value={suite} />
      <Input label="Votre nom" name="name" autoComplete="name" required defaultValue={v.name} placeholder="Prénom et nom" />
      <Input label="Adresse courriel" name="email" type="email" autoComplete="email" required defaultValue={v.email} />
      <Input label="Téléphone (facultatif)" name="phone" type="tel" autoComplete="tel" defaultValue={v.phone} />

      <p className="mt-2 border-t border-[#e7e7e7] pt-3 font-bold">Adresse de livraison</p>
      <Input label="Adresse" name="address1" autoComplete="address-line1" required defaultValue={v.address1} placeholder="Numéro et rue" />
      <Input label="App., bureau (facultatif)" name="address2" autoComplete="address-line2" defaultValue={v.address2} />
      <div className="grid grid-cols-2 gap-3">
        <Input label="Ville" name="city" autoComplete="address-level2" required defaultValue={v.city} />
        <Input label="Code postal" name="postalCode" autoComplete="postal-code" required defaultValue={v.postalCode} placeholder="H2X 1Y4" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-bold" htmlFor="province">Province</label>
        <select id="province" name="province" defaultValue={v.province ?? "QC"} className="input">
          {SHIPPING.provinces.map((p) => (
            <option key={p} value={p}>{PROVINCE_NAMES[p]}</option>
          ))}
        </select>
      </div>

      <p className="mt-2 border-t border-[#e7e7e7] pt-3 font-bold">Mot de passe</p>
      <Input label="Mot de passe" name="password" type="password" autoComplete="new-password" required minLength={8} placeholder="Au moins 8 caractères" hint="ⓘ Au moins 8 caractères." />
      <Input label="Entrez à nouveau le mot de passe" name="confirm" type="password" autoComplete="new-password" required />
      {state.error && (
        <p role="alert" className="rounded-md border border-[#c40000] bg-[#fff5f5] p-3 text-sm text-[#c40000]">{state.error}</p>
      )}
      <button className="az-yellow w-full" disabled={pending}>{pending ? "Création…" : "Créer votre compte"}</button>
    </form>
  );
}

"use client";

import { useActionState } from "react";
import { PROVINCE_NAMES, SHIPPING } from "@/lib/config";
import { changeEmail, changePassword, deleteMyAccount, updateProfile, type ProfileState } from "../actions";

type Profile = {
  name: string;
  email: string;
  phone: string;
  address1: string;
  address2: string;
  city: string;
  province: string;
  postalCode: string;
};

function Message({ state }: { state: ProfileState }) {
  if (state.ok) return <p role="status" className="rounded-md border border-[#067d62] bg-[#f0fdf6] p-3 text-sm text-[#067d62]">✓ {state.ok}</p>;
  if (state.error) return <p role="alert" className="rounded-md border border-[#c40000] bg-[#fff5f5] p-3 text-sm text-[#c40000]">{state.error}</p>;
  return null;
}

function Input({ label, name, ...props }: { label: string; name: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="mb-1 block text-sm font-bold" htmlFor={name}>{label}</label>
      <input id={name} name={name} className="input" {...props} />
    </div>
  );
}

const box = "flex flex-col gap-3 bg-white p-4 sm:rounded-md sm:border sm:border-[#d5d9d9]";

export function ProfileForms({ profile }: { profile: Profile }) {
  const [info, infoAction, infoPending] = useActionState<ProfileState, FormData>(updateProfile, {});
  const [mail, mailAction, mailPending] = useActionState<ProfileState, FormData>(changeEmail, {});
  const [pw, pwAction, pwPending] = useActionState<ProfileState, FormData>(changePassword, {});
  const [del, delAction, delPending] = useActionState<ProfileState, FormData>(deleteMyAccount, {});
  const iv = (k: keyof Profile) => info.values?.[k] ?? profile[k];

  return (
    <div className="grid gap-3 lg:grid-cols-2 lg:gap-4">
      <form action={infoAction} className={`${box} lg:row-span-2`}>
        <h2 className="text-lg font-bold">Informations personnelles</h2>
        <Input label="Nom" name="name" autoComplete="name" defaultValue={iv("name")} required />
        <Input label="Téléphone" name="phone" type="tel" autoComplete="tel" defaultValue={iv("phone")} placeholder="Facultatif" />
        <h3 className="mt-2 font-bold">Adresse de livraison par défaut</h3>
        <p className="-mt-2 text-xs text-[#565959]">Elle pré-remplit vos prochaines commandes.</p>
        <Input label="Adresse" name="address1" autoComplete="address-line1" defaultValue={iv("address1")} />
        <Input label="App., bureau (facultatif)" name="address2" autoComplete="address-line2" defaultValue={iv("address2")} />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Ville" name="city" autoComplete="address-level2" defaultValue={iv("city")} />
          <Input label="Code postal" name="postalCode" autoComplete="postal-code" defaultValue={iv("postalCode")} placeholder="H2X 1Y4" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-bold" htmlFor="province">Province</label>
          <select id="province" name="province" defaultValue={iv("province") || "QC"} className="input">
            {SHIPPING.provinces.map((p) => (
              <option key={p} value={p}>{PROVINCE_NAMES[p]}</option>
            ))}
          </select>
        </div>
        <Message state={info} />
        <button className="az-yellow" disabled={infoPending}>{infoPending ? "Enregistrement…" : "Enregistrer"}</button>
      </form>

      <form action={mailAction} className={box}>
        <h2 className="text-lg font-bold">Adresse courriel</h2>
        <p className="text-sm text-[#565959]">Actuelle : <b className="text-[#0f1111]">{profile.email}</b></p>
        <Input label="Nouvelle adresse courriel" name="email" type="email" autoComplete="email" required defaultValue={mail.ok ? "" : mail.values?.email} />
        <Input label="Mot de passe actuel" name="password" type="password" autoComplete="current-password" required />
        <Message state={mail} />
        <button className="az-white" disabled={mailPending}>Changer le courriel</button>
      </form>

      <form action={pwAction} className={box}>
        <h2 className="text-lg font-bold">Mot de passe</h2>
        <Input label="Mot de passe actuel" name="current" type="password" autoComplete="current-password" required />
        <Input label="Nouveau mot de passe" name="next" type="password" autoComplete="new-password" minLength={8} required placeholder="Au moins 8 caractères" />
        <Input label="Confirmez le nouveau mot de passe" name="confirm" type="password" autoComplete="new-password" required />
        <Message state={pw} />
        <button className="az-white" disabled={pwPending}>Changer le mot de passe</button>
      </form>

      <details className={`${box} lg:col-span-2`}>
        <summary className="cursor-pointer font-bold text-[#c40000]">Supprimer mon compte</summary>
        <form action={delAction} className="mt-3 flex flex-col gap-3">
          <p className="text-sm text-[#565959]">
            Votre compte et vos informations personnelles seront supprimés. Vos commandes passées sont conservées pour nos
            obligations fiscales, sans être liées à un compte.
          </p>
          <Input label="Mot de passe" name="password" type="password" autoComplete="current-password" required />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="confirm" /> Je veux supprimer mon compte définitivement</label>
          <Message state={del} />
          <button className="btn-danger" disabled={delPending}>Supprimer mon compte</button>
        </form>
      </details>
    </div>
  );
}

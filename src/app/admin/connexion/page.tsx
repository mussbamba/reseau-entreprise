"use client";

import { useActionState } from "react";
import { login } from "./actions";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, {});
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <form action={action} className="card w-full max-w-sm space-y-4 p-6">
        <h1 className="text-xl font-bold">Espace admin</h1>
        <div>
          <label className="label" htmlFor="password">Mot de passe</label>
          <input id="password" name="password" type="password" required autoFocus className="input" />
        </div>
        {state.error && <p className="text-sm text-rose-700">{state.error}</p>}
        <button className="btn-primary w-full" disabled={pending}>Se connecter</button>
      </form>
    </main>
  );
}

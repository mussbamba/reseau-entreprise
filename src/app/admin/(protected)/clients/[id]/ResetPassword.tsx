"use client";

import { useActionState } from "react";
import { resetPassword, type ResetState } from "../actions";

export function ResetPassword({ id }: { id: number }) {
  const [state, action, pending] = useActionState<ResetState, FormData>(resetPassword, {});
  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="id" value={id} />
      <button className="btn-secondary" disabled={pending}>🔑 Réinitialiser le mot de passe</button>
      {state.password && (
        <div className="rounded-lg bg-amber-50 p-3 text-sm text-slate-800">
          Mot de passe temporaire : <code className="select-all rounded bg-white px-2 py-0.5 font-mono font-bold">{state.password}</code>
          <p className="mt-1 text-xs text-slate-600">
            Transmettez-le au client (il ne sera plus affiché). Il pourra se connecter avec, puis vous demander de le changer.
          </p>
        </div>
      )}
    </form>
  );
}

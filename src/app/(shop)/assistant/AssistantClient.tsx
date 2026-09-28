"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { formatMoney } from "@/lib/money";
import { useCart } from "@/components/CartProvider";
import { ProductImage } from "@/components/ProductImage";
import { planAssistant, type AssistantState } from "./actions";

const EXAMPLES = [
  "Poulet yassa pour 6 personnes",
  "Mafé pour 4",
  "Soupe egusi avec eba",
  "2 sacs d'attiéké, de l'huile rouge et du zobo",
  "Un repas de Noël ivoirien pour 10",
];

export function AssistantClient({ initialText }: { initialText: string }) {
  const [state, action, pending] = useActionState<AssistantState, FormData>(planAssistant, { text: initialText });
  const formRef = useRef<HTMLFormElement>(null);
  const [text, setText] = useState(initialText);

  // Arrivée depuis la recherche (?q=…) : on lance directement
  useEffect(() => {
    if (initialText) formRef.current?.requestSubmit();
  }, [initialText]);

  return (
    <div className="mt-4 flex flex-col gap-4">
      <form ref={formRef} action={action} className="flex flex-col gap-3 bg-white p-4 sm:rounded-lg">
        <label htmlFor="assistant-text" className="font-bold">Votre plat ou votre liste</label>
        <textarea
          id="assistant-text"
          name="text"
          rows={3}
          maxLength={500}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ex. : je veux faire un ndolé pour 8 personnes"
          className="input"
        />
        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => setText(ex)}
              className="shrink-0 rounded-full border border-[#d5d9d9] bg-[#f7fafa] px-3 py-1 text-sm hover:bg-[#edfdff]"
            >
              {ex}
            </button>
          ))}
        </div>
        <button type="submit" disabled={pending} className="az-yellow self-start">
          {pending ? "Je prépare votre panier…" : "Préparer mon panier"}
        </button>
        {state.error && <p role="alert" className="text-sm text-[#b12704]">{state.error}</p>}
      </form>

      {state.plan && !pending && <PlanView key={state.text} plan={state.plan} />}
    </div>
  );
}

function PlanView({ plan }: { plan: NonNullable<AssistantState["plan"]> }) {
  const { add } = useCart();
  const [qty, setQty] = useState<Record<number, number>>(() => Object.fromEntries(plan.products.map((p) => [p.id, p.quantity])));
  const [added, setAdded] = useState(false);
  const total = plan.products.reduce((s, p) => s + (qty[p.id] ?? 0) * p.priceCents, 0);
  const chosen = plan.products.filter((p) => (qty[p.id] ?? 0) > 0);

  function addAll() {
    for (const p of chosen)
      add({ productId: p.id, slug: p.slug, name: p.name, unitPriceCents: p.priceCents, emoji: p.emoji, imageUrl: p.imageUrl }, qty[p.id]);
    setAdded(true);
  }

  return (
    <section aria-live="polite" className="flex flex-col gap-4">
      <div className="bg-white p-4 sm:rounded-lg">
        <h2 className="text-xl font-extrabold">{plan.title}</h2>
        <p className="mt-1 text-[#565959]">{plan.intro}</p>
        {plan.source === "local" && (
          <p className="mt-1 text-xs text-[#565959]">Suggestion basée sur nos recettes classiques.</p>
        )}
      </div>

      {plan.products.length > 0 && (
        <div className="bg-white p-4 sm:rounded-lg">
          <h3 className="font-bold">À ajouter au panier</h3>
          <ul className="mt-2 divide-y divide-[#e7e7e7]">
            {plan.products.map((p) => (
              <li key={p.id} className="flex items-center gap-3 py-3">
                <ProductImage imageUrl={p.imageUrl} emoji={p.emoji} name={p.name} className="h-16 w-16 shrink-0 bg-[#f7f8f8] [&>span]:text-3xl" />
                <div className="min-w-0 flex-1">
                  <Link href={`/produits/${p.slug}`} className="line-clamp-2 text-[15px] hover:text-[#c7511f]">{p.name}</Link>
                  {p.note && <p className="text-xs text-[#565959]">{p.note}</p>}
                  <p className="text-sm font-semibold">{formatMoney(p.priceCents)}</p>
                </div>
                <select
                  aria-label={`Quantité pour ${p.name}`}
                  value={qty[p.id] ?? 0}
                  onChange={(e) => setQty({ ...qty, [p.id]: Number(e.target.value) })}
                  className="rounded-lg border border-[#d5d9d9] bg-[#f0f2f2] px-2 py-2 text-sm"
                >
                  {Array.from({ length: 11 }, (_, i) => i).map((n) => (
                    <option key={n} value={n}>{n === 0 ? "Retirer" : n}</option>
                  ))}
                </select>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <p className="text-lg">
              Sous-total : <b>{formatMoney(total)}</b>
            </p>
            {added ? (
              <Link href="/panier" className="az-yellow">✓ Ajouté · Voir le panier</Link>
            ) : (
              <button type="button" onClick={addAll} disabled={chosen.length === 0} className="az-yellow">
                Tout ajouter au panier ({chosen.length})
              </button>
            )}
          </div>
        </div>
      )}

      {plan.missing.length > 0 && (
        <div className="bg-gradient-to-br from-[#e3f4ff] to-[#fdeef4] p-4 sm:rounded-lg">
          <h3 className="font-bold">✨ Pas encore au catalogue</h3>
          <p className="text-sm text-[#565959]">On peut les chercher pour vous et vous envoyer un prix.</p>
          <ul className="mt-2 flex flex-col gap-2">
            {plan.missing.map((m) => (
              <li key={m.name} className="flex flex-wrap items-center justify-between gap-2 bg-white/70 p-2">
                <span>
                  <b>{m.name}</b>
                  {m.note && <span className="block text-xs text-[#565959]">{m.note}</span>}
                </span>
                <Link href={`/demande?produit=${encodeURIComponent(m.name)}`} className="az-link text-sm font-semibold">
                  Demander un prix ›
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {plan.pantry.length > 0 && (
        <div className="bg-white p-4 sm:rounded-lg">
          <h3 className="font-bold">À prévoir de votre côté</h3>
          <ul className="mt-2 list-disc pl-5 text-sm text-[#565959]">
            {plan.pantry.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

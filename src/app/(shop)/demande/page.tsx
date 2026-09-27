import { RequestForm } from "./RequestForm";

export const metadata = { title: "Demande spéciale" };

export default async function RequestPage({ searchParams }: { searchParams: Promise<{ produit?: string }> }) {
  const { produit = "" } = await searchParams;
  return (
    <div className="mx-auto max-w-2xl">
      <p className="text-sm font-semibold uppercase tracking-widest text-terre-600">Demande spéciale</p>
      <h1 className="mt-1 text-3xl font-extrabold">Vous ne trouvez pas un produit ?</h1>
      <p className="mt-2 text-slate-600">
        Dites-nous ce que vous cherchez. Nous vérifions dans nos épiceries partenaires et vous envoyons un prix par
        courriel. Vous décidez ensuite si vous l&apos;ajoutez à votre panier.
      </p>
      <RequestForm prefill={produit.slice(0, 120)} />
    </div>
  );
}

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { REQUEST_STATUS } from "@/lib/requests";
import { AddToCartButton } from "@/components/AddToCartButton";
import { declineQuote } from "../actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Ma demande", robots: { index: false } };

export default async function RequestStatusPage({
  params,
  searchParams,
}: {
  params: Promise<{ publicId: string }>;
  searchParams: Promise<{ nouvelle?: string }>;
}) {
  const { publicId } = await params;
  const { nouvelle } = await searchParams;
  const r = await db.productRequest.findUnique({ where: { publicId }, include: { product: { include: { category: true } } } });
  if (!r) notFound();
  const status = REQUEST_STATUS[r.status];
  const p = r.product;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {nouvelle && (
        <div className="rounded-2xl bg-emerald-50 p-5 text-emerald-900">
          <p className="text-lg font-bold">Demande envoyée, merci {r.customerName.split(" ")[0]} !</p>
          <p className="mt-1 text-sm">Nous vous écrirons à {r.email} dès que nous aurons un prix. Gardez cette page pour suivre votre demande.</p>
        </div>
      )}

      <div className="card flex gap-4 p-5">
        {r.photo ? (
          <img src={r.photo} alt="" className="h-20 w-20 shrink-0 rounded-xl object-cover" />
        ) : (
          <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-4xl">✨</span>
        )}
        <div className="min-w-0 flex-1">
          <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${status.color}`}>{status.label}</span>
          <h1 className="mt-1 text-2xl font-extrabold">{r.quantity} × {r.name}</h1>
          {r.details && <p className="text-sm text-stone-600">{r.details}</p>}
        </div>
      </div>

      {r.status === "PENDING" && (
        <p className="rounded-xl bg-sky-50 p-4 text-sm text-sky-900">
          Nous cherchons ce produit dans nos épiceries partenaires. Vous recevrez un courriel avec le prix.
        </p>
      )}

      {r.status === "QUOTED" && p && (
        <div className="card space-y-4 p-5">
          <p className="text-lg">
            Nous l&apos;avons trouvé : <strong>{formatMoney(p.priceCents)}</strong> l&apos;unité, soit{" "}
            <strong>{formatMoney(p.priceCents * r.quantity)}</strong> pour {r.quantity}.
          </p>
          {r.vendorNote && <p className="rounded-lg bg-terre-50 p-3 text-sm">{r.vendorNote}</p>}
          <div className="grid gap-2 sm:grid-cols-2">
            <AddToCartButton
              quantity={r.quantity}
              label={`Ajouter ${r.quantity} au panier`}
              product={{
                productId: p.id,
                slug: p.slug,
                name: p.name,
                unitPriceCents: p.priceCents,
                emoji: p.category.emoji,
                imageUrl: p.imageUrl || r.photo,
              }}
            />
            <form action={declineQuote}>
              <input type="hidden" name="publicId" value={r.publicId} />
              <button className="btn-secondary w-full">Non merci</button>
            </form>
          </div>
          <p className="text-xs text-stone-500">Comme pour le reste de votre commande, votre carte est seulement autorisée : le montant est débité après l&apos;achat en boutique.</p>
        </div>
      )}

      {r.status === "ORDERED" && <p className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-900">Ce produit fait partie d&apos;une de vos commandes.</p>}
      {r.status === "DECLINED" && <p className="rounded-xl bg-stone-100 p-4 text-sm">Vous avez refusé ce prix. Vous pouvez faire une nouvelle demande à tout moment.</p>}
      {r.status === "UNAVAILABLE" && (
        <p className="rounded-xl bg-rose-50 p-4 text-sm text-rose-800">
          Désolé, nous n&apos;avons pas trouvé ce produit pour le moment.{r.vendorNote && ` ${r.vendorNote}`}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <Link href="/demande" className="btn-secondary">Nouvelle demande</Link>
        <Link href="/produits" className="btn-secondary">Voir le catalogue</Link>
      </div>
    </div>
  );
}

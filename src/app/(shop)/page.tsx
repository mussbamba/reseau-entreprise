import Link from "next/link";
import { db } from "@/lib/db";
import { SHOP, MIN_ORDER_CENTS, SHIPPING, SPECIAL_CATEGORY } from "@/lib/config";
import { formatMoney } from "@/lib/money";
import { ProductCard } from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [categories, featured] = await Promise.all([
    db.category.findMany({ where: { slug: { not: SPECIAL_CATEGORY.slug } }, orderBy: { position: "asc" } }),
    db.product.findMany({
      where: { active: true, listed: true, featured: true },
      include: { category: true },
      take: 8,
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  return (
    <div className="space-y-14">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#fff3e2] via-[#ffe4ec] to-[#e2f1ff] px-6 py-10 shadow-[0_12px_32px_-10px_rgba(16,24,40,.18)] sm:px-12 sm:py-14">
        <div aria-hidden className="pointer-events-none absolute -bottom-16 -right-10 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(255,196,61,.45),rgba(255,196,61,0)_70%)]" />
        <p className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-wider text-terre-500 shadow-sm">
          Nouveau · épicerie africaine en ligne
        </p>
        <h1 className="mt-4 max-w-2xl text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
          Le goût de chez nous,{" "}
          <span className="bg-gradient-to-r from-terre-500 to-[#d6336c] bg-clip-text text-transparent">livré à votre porte.</span>
        </h1>
        <p className="mt-4 max-w-xl text-stone-600">{SHOP.tagline}.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/produits" className="btn-amber">Découvrir la boutique</Link>
          <Link href="/comment-ca-marche" className="btn bg-white shadow-sm hover:bg-terre-50">Comment ça marche</Link>
        </div>
        <p className="mt-6 text-sm font-medium text-stone-600">
          Livraison gratuite dès {formatMoney(SHIPPING.freeOverCents)} · Commande minimum {formatMoney(MIN_ORDER_CENTS)}
        </p>
      </section>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          ["🚚", "bg-emerald-50", "Livraison gratuite", `dès ${formatMoney(SHIPPING.freeOverCents)}`],
          ["💳", "bg-amber-50", "Payez le montant réel", "un article introuvable n'est pas facturé"],
          ["✨", "bg-pink-50", "Produit introuvable ?", "on le cherche pour vous"],
        ].map(([icon, bg, title, text]) => (
          <div key={title} className="card flex items-center gap-3 p-4">
            <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl text-xl ${bg}`}>{icon}</span>
            <div className="text-sm">
              <p className="font-bold">{title}</p>
              <p className="text-stone-500">{text}</p>
            </div>
          </div>
        ))}
      </div>

      <section>
        <h2 className="text-2xl font-bold">Acheter par catégorie</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/produits?categorie=${c.slug}`}
              className="card flex flex-col items-center gap-2 p-4 text-center text-sm font-semibold transition hover:-translate-y-0.5 hover:border-terre-500"
            >
              <span className="grid h-16 w-16 place-items-center rounded-full bg-[radial-gradient(circle_at_35%_30%,#fff,#ffe9d6)] text-3xl shadow-sm">{c.emoji}</span>
              {c.name}
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-bold">Les incontournables</h2>
          <Link href="/produits" className="text-sm font-semibold text-terre-600 hover:underline">Tout voir →</Link>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {featured.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      </section>

      <section className="card flex flex-col items-start gap-3 bg-gradient-to-br from-amber-50 to-rose-50 p-6 sm:flex-row sm:items-center">
        <span className="text-4xl" aria-hidden>✨</span>
        <div className="flex-1">
          <h2 className="text-xl font-bold">Vous ne trouvez pas un produit ?</h2>
          <p className="text-sm text-stone-600">Envoyez-nous une demande : on le cherche pour vous dans nos épiceries partenaires.</p>
        </div>
        <Link href={"/demande"} className="btn-primary">Demander un produit</Link>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          ["1", "Vous commandez", "Votre carte est seulement autorisée, pas encore débitée."],
          ["2", "Nous achetons pour vous", "Nous allons chercher vos produits dans nos épiceries africaines partenaires."],
          ["3", "Nous expédions", "Vous payez le montant réel et recevez votre colis avec un numéro de suivi."],
        ].map(([n, t, d]) => (
          <div key={n} className="card p-5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-b from-ambre to-ocre font-bold text-[#3b2600]">{n}</span>
            <h3 className="mt-3 font-bold">{t}</h3>
            <p className="mt-1 text-sm text-stone-600">{d}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

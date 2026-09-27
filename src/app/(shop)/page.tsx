import Link from "next/link";
import { db } from "@/lib/db";
import { SHOP, MIN_ORDER_CENTS, SHIPPING } from "@/lib/config";
import { formatMoney } from "@/lib/money";
import { ProductCard } from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [categories, featured] = await Promise.all([
    db.category.findMany({ orderBy: { position: "asc" } }),
    db.product.findMany({
      where: { active: true, featured: true },
      include: { category: true },
      take: 8,
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  return (
    <div className="space-y-14">
      <section className="overflow-hidden rounded-3xl bg-terre-900 px-6 py-12 text-white sm:px-12 sm:py-16">
        <p className="text-sm font-semibold uppercase tracking-widest text-ocre">Livraison au Québec et au Canada</p>
        <h1 className="mt-3 max-w-2xl text-3xl font-extrabold leading-tight sm:text-5xl">
          Le goût de chez nous, livré à votre porte.
        </h1>
        <p className="mt-4 max-w-xl text-terre-100">{SHOP.tagline}.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/produits" className="btn-primary">Voir les produits</Link>
          <Link href="/comment-ca-marche" className="btn border border-white/30 text-white hover:bg-white/10">
            Comment ça marche
          </Link>
        </div>
        <p className="mt-6 text-sm text-terre-200">
          Livraison gratuite dès {formatMoney(SHIPPING.freeOverCents)} · Commande minimum {formatMoney(MIN_ORDER_CENTS)}
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold">Catégories</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/produits?categorie=${c.slug}`}
              className="card flex flex-col items-center gap-2 p-4 text-center text-sm font-semibold hover:border-terre-500"
            >
              <span className="text-3xl">{c.emoji}</span>
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

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          ["1", "Vous commandez", "Votre carte est seulement autorisée, pas encore débitée."],
          ["2", "Nous achetons pour vous", "Nous allons chercher vos produits dans nos épiceries africaines partenaires."],
          ["3", "Nous expédions", "Vous payez le montant réel et recevez votre colis avec un numéro de suivi."],
        ].map(([n, t, d]) => (
          <div key={n} className="card p-5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ocre font-bold text-terre-900">{n}</span>
            <h3 className="mt-3 font-bold">{t}</h3>
            <p className="mt-1 text-sm text-stone-600">{d}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

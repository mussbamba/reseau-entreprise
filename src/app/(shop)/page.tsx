import Link from "next/link";
import { db } from "@/lib/db";
import { MIN_ORDER_CENTS, SHIPPING, SPECIAL_CATEGORY } from "@/lib/config";
import { formatMoney } from "@/lib/money";
import { Price } from "@/components/Price";
import { ProductImage } from "@/components/ProductImage";

export const dynamic = "force-dynamic";

type P = { id: number; slug: string; name: string; imageUrl: string; priceCents: number; category: { emoji: string } };

// Carte « 4 produits » façon marketplace
function QuadCard({ title, products, href, more }: { title: string; products: P[]; href: string; more: string }) {
  return (
    <section className="flex flex-col gap-3 bg-white p-4">
      <h2 className="text-lg font-extrabold">{title}</h2>
      <div className="grid grid-cols-2 gap-x-3 gap-y-3">
        {products.map((p) => (
          <Link key={p.id} href={`/produits/${p.slug}`} className="group flex flex-col gap-1 text-xs leading-tight">
            <ProductImage imageUrl={p.imageUrl} emoji={p.category.emoji} name={p.name} className="aspect-square w-full bg-[#f7f8f8] [&>span]:text-4xl" />
            <span className="line-clamp-2 group-hover:text-[#c7511f]">{p.name}</span>
          </Link>
        ))}
      </div>
      <Link href={href} className="az-link mt-auto text-sm font-semibold">{more}</Link>
    </section>
  );
}

export default async function HomePage({ searchParams }: { searchParams: Promise<{ "compte-supprime"?: string }> }) {
  const deleted = (await searchParams)["compte-supprime"];
  const [categories, products] = await Promise.all([
    db.category.findMany({ where: { slug: { not: SPECIAL_CATEGORY.slug } }, orderBy: { position: "asc" } }),
    db.product.findMany({ where: { active: true, listed: true }, include: { category: true }, orderBy: { name: "asc" } }),
  ]);
  const featured = products.filter((p) => p.featured);
  const byCat = (id: number) => products.filter((p) => p.categoryId === id).slice(0, 4);
  const quads = categories.map((c) => ({ c, list: byCat(c.id) })).filter((q) => q.list.length);

  return (
    <div className="-mx-4 -mt-6">
      {deleted && (
        <p className="bg-[#f0fdf6] px-4 py-3 text-center text-sm text-[#067d62]">Votre compte a été supprimé. Merci d&apos;avoir magasiné avec nous.</p>
      )}
      {/* Bannière qui se fond dans le fond gris */}
      <section className="relative h-[300px] overflow-hidden bg-gradient-to-br from-[#c9f2ec] via-[#e3f4ff] to-[#fde8ef] sm:h-[340px]">
        <div className="mx-auto flex h-full max-w-6xl items-start justify-between gap-6 px-6 pt-8">
          <div className="max-w-md">
            <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
              Le goût de chez nous, livré à votre porte
            </h1>
            <p className="mt-2 text-sm text-slate-700 sm:text-base">
              Nous achetons vos produits dans nos épiceries africaines partenaires, puis nous vous les expédions.
            </p>
            <Link href="/produits" className="mt-4 inline-block rounded-full bg-white px-4 py-2 text-sm font-bold shadow-sm hover:bg-slate-50">
              Découvrir la boutique ›
            </Link>
          </div>
          <div aria-hidden className="hidden select-none gap-3 text-7xl drop-shadow-[0_10px_12px_rgba(15,23,42,.2)] sm:flex">
            <span className="animate-[float_5.5s_ease-in-out_infinite]">🌾</span>
            <span className="mt-10 animate-[float_6s_ease-in-out_infinite]">🫙</span>
            <span className="animate-[float_5s_ease-in-out_infinite]">🌶️</span>
          </div>
        </div>
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-[#eaeded]" />
      </section>

      <div className="relative z-10 mx-auto -mt-24 grid max-w-6xl gap-4 px-4 sm:grid-cols-2 lg:grid-cols-4">
        {featured.length > 0 && (
          <QuadCard title="Les incontournables" products={featured.slice(0, 4)} href="/produits" more="Voir toute la boutique" />
        )}
        {quads.slice(0, 2).map(({ c, list }) => (
          <QuadCard key={c.id} title={c.name} products={list} href={`/produits?categorie=${c.slug}`} more="Voir plus" />
        ))}
        <section className="flex flex-col gap-3 bg-gradient-to-br from-[#e3f4ff] to-[#fdeef4] p-4">
          <h2 className="text-lg font-extrabold">Vous ne trouvez pas un produit ?</h2>
          <p className="text-sm text-[#565959]">
            Dites-nous ce que vous cherchez : nous le trouvons dans nos épiceries partenaires et vous envoyons un prix.
          </p>
          <span className="text-6xl" aria-hidden>✨</span>
          <Link href="/demande" className="az-yellow mt-auto">Faire une demande spéciale</Link>
        </section>
      </div>

      <div className="mx-auto mt-4 flex max-w-6xl flex-col gap-4 px-4">
        {featured.length > 0 && (
          <section className="bg-white p-4">
            <h2 className="text-lg font-extrabold">Meilleures ventes</h2>
            <div className="mt-3 grid auto-cols-[40%] grid-flow-col gap-3 overflow-x-auto pb-1 [scrollbar-width:none] sm:auto-cols-[18%]">
              {featured.map((p) => (
                <Link key={p.id} href={`/produits/${p.slug}`} className="group flex flex-col gap-1 text-[13px] leading-tight">
                  <ProductImage imageUrl={p.imageUrl} emoji={p.category.emoji} name={p.name} className="aspect-square w-full bg-[#f7f8f8] [&>span]:text-4xl" />
                  <span className="line-clamp-2 group-hover:text-[#c7511f]">{p.name}</span>
                  <Price cents={p.priceCents} size="sm" />
                </Link>
              ))}
            </div>
          </section>
        )}

        {quads.length > 2 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {quads.slice(2).map(({ c, list }) => (
              <QuadCard key={c.id} title={c.name} products={list} href={`/produits?categorie=${c.slug}`} more="Voir plus" />
            ))}
          </div>
        )}

        <section className="grid gap-4 bg-white p-4 sm:grid-cols-4">
          {[
            ["🛒", "Vous commandez", "Votre carte est autorisée, pas encore débitée."],
            ["🏪", "On achète pour vous", "Dans nos épiceries africaines partenaires."],
            ["💳", "Vous payez le réel", "Un article introuvable n'est pas facturé."],
            ["📦", "On expédie", `Suivi par courriel. Minimum ${formatMoney(MIN_ORDER_CENTS)}, gratuit dès ${formatMoney(SHIPPING.freeOverCents)}.`],
          ].map(([icon, title, text]) => (
            <div key={title} className="flex gap-3 text-sm">
              <span className="text-2xl" aria-hidden>{icon}</span>
              <div>
                <p className="font-bold">{title}</p>
                <p className="text-[#565959]">{text}</p>
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}

import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { SPECIAL_CATEGORY } from "@/lib/config";
import { ProductCard } from "@/components/ProductCard";

export const dynamic = "force-dynamic";
export const metadata = { title: "Boutique" };

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ categorie?: string; q?: string }>;
}) {
  const { categorie, q } = await searchParams;
  const where: Prisma.ProductWhereInput = { active: true, listed: true };
  if (categorie) where.category = { slug: categorie };
  if (q) where.OR = [{ name: { contains: q } }, { origin: { contains: q } }, { description: { contains: q } }];

  const [categories, products] = await Promise.all([
    db.category.findMany({ where: { slug: { not: SPECIAL_CATEGORY.slug } }, orderBy: { position: "asc" } }),
    db.product.findMany({ where, include: { category: true }, orderBy: { name: "asc" } }),
  ]);
  const current = categories.find((c) => c.slug === categorie);

  return (
    <div>
      <h1 className="text-3xl font-extrabold">{current ? `${current.emoji} ${current.name}` : "Tous les produits"}</h1>

      <form className="mt-5 flex gap-2" action="/produits">
        {categorie && <input type="hidden" name="categorie" value={categorie} />}
        <input name="q" defaultValue={q} placeholder="Rechercher : gari, attiéké, Ghana…" className="input" />
        <button className="btn-primary">Rechercher</button>
      </form>

      <div className="mt-4 flex flex-wrap gap-2">
        <Chip href={q ? `/produits?q=${encodeURIComponent(q)}` : "/produits"} active={!categorie}>Tout</Chip>
        {categories.map((c) => (
          <Chip
            key={c.id}
            href={`/produits?categorie=${c.slug}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
            active={c.slug === categorie}
          >
            {c.emoji} {c.name}
          </Chip>
        ))}
      </div>

      {products.length === 0 ? (
        <p className="mt-10 text-center text-stone-600">Aucun produit ne correspond{q ? ` à « ${q} »` : ""}.</p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      )}

      <div className="mt-10">
        <section className="card flex flex-col items-start gap-3 bg-gradient-to-br from-amber-50 to-rose-50 p-6 sm:flex-row sm:items-center">
          <span className="text-4xl" aria-hidden>✨</span>
          <div className="flex-1">
            <h2 className="text-xl font-bold">Vous ne trouvez pas un produit ?</h2>
            <p className="text-sm text-stone-600">Envoyez-nous une demande : on le cherche pour vous dans nos épiceries partenaires.</p>
          </div>
          <Link href={q ? `/demande?produit=${encodeURIComponent(q)}` : "/demande"} className="btn-primary">Demander un produit</Link>
        </section>
      </div>
    </div>
  );
}

function Chip({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`rounded-full border px-3 py-1.5 text-sm ${
        active ? "border-terre-500 bg-terre-500 text-white" : "border-stone-300 bg-white hover:border-terre-500"
      }`}
    >
      {children}
    </Link>
  );
}

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
      <div className="-mx-4 -mt-6 bg-white px-4 py-2.5 text-sm text-[#565959] shadow-[0_1px_0_#d5d9d9]">
        {products.length} résultat{products.length > 1 ? "s" : ""}
        {q ? <> pour <b className="text-[#c45500]">« {q} »</b></> : current ? <> dans <b className="text-[#c45500]">{current.name}</b></> : null}
      </div>

      <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none]">
        <Chip href={q ? `/produits?q=${encodeURIComponent(q)}` : "/produits"} active={!categorie}>Tout</Chip>
        {categories.map((c) => (
          <Chip
            key={c.id}
            href={`/produits?categorie=${c.slug}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
            active={c.slug === categorie}
          >
            {c.name}
          </Chip>
        ))}
      </div>

      {products.length === 0 ? (
        <p className="mt-6 bg-white p-6 text-center text-[#565959]">Aucun résultat{q ? ` pour « ${q} »` : ""}.</p>
      ) : (
        <div className="-mx-4 mt-3 grid gap-2 sm:mx-0 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      )}

      <div className="mt-10">
        <section className="flex flex-col items-start gap-3 bg-gradient-to-br from-[#e3f4ff] to-[#fdeef4] p-6 sm:flex-row sm:items-center">
          <span className="text-4xl" aria-hidden>✨</span>
          <div className="flex-1">
            <h2 className="text-xl font-bold">Vous ne trouvez pas un produit ?</h2>
            <p className="text-sm text-slate-600">Envoyez-nous une demande : on le cherche pour vous dans nos épiceries partenaires.</p>
          </div>
          <Link href={q ? `/demande?produit=${encodeURIComponent(q)}` : "/demande"} className="az-yellow">Faire une demande spéciale</Link>
        </section>
      </div>
    </div>
  );
}

function Chip({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`shrink-0 rounded-lg border px-3 py-1.5 text-sm ${
        active ? "border-[#007185] bg-[#edfdff] shadow-[inset_0_0_0_1px_#007185]" : "border-[#d5d9d9] bg-white hover:bg-[#f7fafa]"
      }`}
    >
      {children}
    </Link>
  );
}

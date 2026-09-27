import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { stripeEnabled } from "@/lib/env";
import { logout } from "../connexion/actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin", robots: { index: false } };

const links = [
  ["/admin", "📋 Commandes"],
  ["/admin/liste-achat", "🛍️ Liste d'achat"],
  ["/admin/demandes", "✨ Demandes"],
  ["/admin/produits", "🏷️ Produits"],
  ["/admin/boutiques", "🏪 Boutiques & catégories"],
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="min-h-screen bg-stone-50">
      <header className="border-b border-stone-200 bg-white">
        <div className="bande-wax" />
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-3">
          <span className="mr-2 font-extrabold text-terre-700">Admin</span>
          <nav className="flex flex-wrap gap-1 text-sm">
            {links.map(([href, label]) => (
              <Link key={href} href={href} className="rounded-full px-3 py-1.5 hover:bg-terre-50">
                {label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3 text-sm">
            <Link href="/" className="text-stone-500 hover:underline" target="_blank">Voir le site ↗</Link>
            <form action={logout}>
              <button className="text-stone-500 hover:underline">Déconnexion</button>
            </form>
          </div>
        </div>
      </header>
      {!stripeEnabled() && (
        <p className="bg-amber-100 px-4 py-2 text-center text-xs text-amber-900">
          Mode démo : Stripe n&apos;est pas configuré, les paiements sont simulés.
        </p>
      )}
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}

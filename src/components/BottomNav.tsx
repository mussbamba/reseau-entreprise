"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "./CartProvider";

const TABS = [
  { href: "/", label: "Accueil", match: (p: string) => p === "/", icon: <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" /> },
  { href: "/produits", label: "Boutique", match: (p: string) => p.startsWith("/produits"), icon: <><rect x="3" y="3" width="7" height="7" rx="2" /><rect x="14" y="3" width="7" height="7" rx="2" /><rect x="3" y="14" width="7" height="7" rx="2" /><rect x="14" y="14" width="7" height="7" rx="2" /></> },
  { href: "/panier", label: "Panier", match: (p: string) => p.startsWith("/panier") || p === "/commande", icon: <><path d="M3 4h2l2.4 11.2a1.5 1.5 0 0 0 1.5 1.2h8.7a1.5 1.5 0 0 0 1.5-1.1L21 8H6" /><circle cx="9.5" cy="20" r="1.3" /><circle cx="17.5" cy="20" r="1.3" /></> },
  { href: "/compte", label: "Compte", match: (p: string) => p.startsWith("/compte") || p.startsWith("/connexion") || p.startsWith("/inscription") || p.startsWith("/commande/"), icon: <><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" /></> },
];

/** Barre d'onglets en bas de l'écran sur téléphone (utile quand l'app est installée : pas de bouton Retour). */
export function BottomNav() {
  const pathname = usePathname();
  const { count, ready } = useCart();
  return (
    <nav
      aria-label="Navigation principale"
      className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-[#d5d9d9] bg-white pb-[env(safe-area-inset-bottom)] sm:hidden"
    >
      {TABS.map((t) => {
        const active = t.match(pathname);
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={active ? "page" : undefined}
            className={`relative flex flex-col items-center gap-0.5 py-2 text-[11px] ${active ? "text-[#007185] shadow-[inset_0_3px_0_#007185]" : "text-[#0f1111]"}`}
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              {t.icon}
            </svg>
            {t.label}
            {t.href === "/panier" && ready && count > 0 && (
              <span className="absolute left-1/2 top-1 ml-1 grid h-[18px] min-w-[18px] place-items-center rounded-full border-2 border-white bg-[#ffa41c] px-1 text-[10px] font-bold">
                {count}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

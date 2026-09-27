"use client";

import Link from "next/link";
import { useCart } from "./CartProvider";
import { SHOP } from "@/lib/config";

export function Header() {
  const { count, ready } = useCart();
  return (
    <header className="sticky top-0 z-20 border-b border-stone-200 bg-[#fffaf5]/95 backdrop-blur">
      <div className="bande-wax" />
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        <Link href="/" className="text-lg font-extrabold tracking-tight text-terre-700">
          {SHOP.name}
        </Link>
        <nav className="ml-auto flex items-center gap-1 text-sm font-medium sm:gap-3">
          <Link href="/produits" className="rounded-full px-3 py-2 hover:bg-terre-50">
            Boutique
          </Link>
          <Link href="/comment-ca-marche" className="hidden rounded-full px-3 py-2 hover:bg-terre-50 sm:block">
            Comment ça marche
          </Link>
          <Link href="/demande" className="rounded-full px-3 py-2 hover:bg-terre-50">
            <span className="sm:hidden">Demander</span>
            <span className="hidden sm:inline">Demande spéciale</span>
          </Link>
          <Link href="/suivi" className="hidden rounded-full px-3 py-2 hover:bg-terre-50 sm:block">
            Suivre ma commande
          </Link>
          <Link href="/panier" className="btn-primary px-4! py-2!" aria-label="Panier">
            🛒 <span>{ready ? count : 0}</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}

"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useCart } from "./CartProvider";
import { Logo } from "./Logo";
import { SHIPPING } from "@/lib/config";

function SearchBox() {
  const q = useSearchParams().get("q") ?? "";
  return (
    <form action="/produits" role="search" className="flex flex-1 overflow-hidden rounded-xl bg-white shadow-[0_0_0_2px_rgba(242,107,29,.25),0_4px_12px_-4px_rgba(242,107,29,.25)]">
      <input
        name="q"
        type="search"
        defaultValue={q}
        placeholder="Rechercher gari, attiéké, bissap…"
        aria-label="Rechercher un produit"
        className="min-w-0 flex-1 bg-transparent px-4 py-2.5 text-base outline-none"
      />
      <button aria-label="Rechercher" className="bg-gradient-to-b from-ambre to-ocre px-4 text-[#3b2600]">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      </button>
    </form>
  );
}

export function Header() {
  const { count, ready } = useCart();
  return (
    <header className="sticky top-0 z-20 bg-gradient-to-b from-[#ffe8d4] to-[#fff4e8] shadow-[0_1px_0_#e4e7ec]">
      <div className="bande-wax" />
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-lg font-extrabold tracking-tight">
          <Logo />
          <span>
            Saveurs <span className="text-terre-500">d&apos;Afrique</span>
          </span>
        </Link>
        <div className="order-3 w-full sm:order-none sm:w-auto sm:flex-1">
          <Suspense fallback={<div className="h-11 rounded-xl bg-white" />}>
            <SearchBox />
          </Suspense>
        </div>
        <nav className="ml-auto flex items-center gap-1 text-sm font-semibold">
          <Link href="/demande" className="rounded-full px-3 py-2 hover:bg-white/70">Demande spéciale</Link>
          <Link href="/suivi" className="hidden rounded-full px-3 py-2 hover:bg-white/70 md:block">Mes commandes</Link>
          <Link href="/panier" aria-label="Panier" className="relative rounded-full bg-white p-2.5 shadow-sm hover:bg-terre-50">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 4h2l2.4 11.2a1.5 1.5 0 0 0 1.5 1.2h8.7a1.5 1.5 0 0 0 1.5-1.1L21 8H6" />
              <circle cx="9.5" cy="20" r="1.3" />
              <circle cx="17.5" cy="20" r="1.3" />
            </svg>
            <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full border-2 border-white bg-terre-500 px-1 text-[11px] font-bold text-white">
              {ready ? count : 0}
            </span>
          </Link>
        </nav>
      </div>
      <p className="mx-auto hidden max-w-6xl px-4 pb-2 text-xs font-semibold text-[#7a4a1f] sm:block">
        📍 Livraison au Québec et au Canada · gratuite dès {SHIPPING.freeOverCents / 100} $
      </p>
    </header>
  );
}

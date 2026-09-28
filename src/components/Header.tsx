"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useCart } from "./CartProvider";
import { Logo } from "./Logo";
import { SHIPPING } from "@/lib/config";

type Cat = { slug: string; name: string };

function SearchBox() {
  const q = useSearchParams().get("q") ?? "";
  return (
    <form action="/produits" role="search" className="flex flex-1 overflow-hidden rounded-lg bg-white shadow-[0_1px_2px_rgba(0,0,0,.15),inset_0_0_0_1px_rgba(0,0,0,.08)]">
      <input
        name="q"
        type="search"
        defaultValue={q}
        placeholder="Rechercher sur Saveurs d'Afrique"
        aria-label="Rechercher un produit"
        className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-base outline-none"
      />
      <button aria-label="Rechercher" className="grid w-12 place-items-center bg-[#febd69] hover:bg-[#f3a847]">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      </button>
    </form>
  );
}

function CategoryNav({ categories }: { categories: Cat[] }) {
  const current = useSearchParams().get("categorie") ?? "";
  return (
    <nav aria-label="Rayons" className="mx-auto flex max-w-6xl gap-5 overflow-x-auto whitespace-nowrap px-4 py-2 text-sm font-semibold [scrollbar-width:none]">
      <Link href="/produits" className={current === "" ? "underline decoration-2 underline-offset-4" : "hover:underline"}>Tout</Link>
      {categories.map((c) => (
        <Link
          key={c.slug}
          href={`/produits?categorie=${c.slug}`}
          className={current === c.slug ? "underline decoration-2 underline-offset-4" : "hover:underline"}
        >
          {c.name}
        </Link>
      ))}
      <Link href="/demande" className="hover:underline">Demande spéciale</Link>
    </nav>
  );
}

export function Header({ categories, userName }: { categories: Cat[]; userName: string | null }) {
  const { count, ready } = useCart();
  return (
    <header className="sticky top-0 z-20">
      <div className="bg-gradient-to-r from-[#82d8e3] to-[#a6e7ce]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2.5">
          <Link href="/" className="flex items-center gap-2 text-lg font-extrabold tracking-tight">
            <Logo />
            <span>
              Saveurs <span className="text-[#065f46]">d&apos;Afrique</span>
            </span>
          </Link>
          <div className="order-3 w-full sm:order-none sm:w-auto sm:flex-1">
            <Suspense fallback={<div className="h-11 rounded-lg bg-white" />}>
              <SearchBox />
            </Suspense>
          </div>
          <nav className="ml-auto flex items-center gap-1 text-sm">
            <Link
              href={userName ? "/compte" : "/connexion"}
              className="flex items-center gap-1 rounded px-2 py-1 leading-tight hover:outline hover:outline-1"
            >
              <svg viewBox="0 0 24 24" className="h-6 w-6 sm:hidden" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
              </svg>
              <span className="text-xs sm:hidden">{userName ?? "S'identifier"}</span>
              <span className="hidden sm:block">
                <span className="block text-xs">Bonjour, {userName ?? "identifiez-vous"}</span>
                <b>Compte et commandes</b>
              </span>
            </Link>
            <Link href="/panier" aria-label="Panier" className="relative flex items-end gap-1 rounded px-2 py-1 hover:outline hover:outline-1">
              <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 4h2l2.4 11.2a1.5 1.5 0 0 0 1.5 1.2h8.7a1.5 1.5 0 0 0 1.5-1.1L21 8H6" />
                <circle cx="9.5" cy="20" r="1.3" />
                <circle cx="17.5" cy="20" r="1.3" />
              </svg>
              <span className="absolute left-[18px] top-0 text-sm font-extrabold text-[#c45500]">{ready ? count : 0}</span>
              <b className="hidden sm:inline">Panier</b>
            </Link>
          </nav>
        </div>
      </div>
      <div className="bg-gradient-to-r from-[#c9f0ee] to-[#dcf5e7] text-[13px]">
        <p className="mx-auto flex max-w-6xl items-center gap-1.5 px-4 py-1.5">
          📍 Livraison au <b>Québec</b> · <b>GRATUITE</b> dès {SHIPPING.freeOverCents / 100} $
        </p>
      </div>
      <div className="bg-gradient-to-r from-[#b8ece6] to-[#cdf1dd]">
        <Suspense fallback={<div className="h-9" />}>
          <CategoryNav categories={categories} />
        </Suspense>
      </div>
    </header>
  );
}

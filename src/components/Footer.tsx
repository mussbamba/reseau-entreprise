import Link from "next/link";
import { SHOP } from "@/lib/config";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-[#e4e7ec] bg-white text-stone-600">
      <div className="bande-wax" />
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 text-sm sm:grid-cols-3">
        <div>
          <p className="flex items-center gap-2 text-base font-extrabold text-stone-900">
            <Logo className="h-7 w-7" /> {SHOP.name}
          </p>
          <p className="mt-2">{SHOP.tagline}</p>
        </div>
        <div className="flex flex-col gap-2">
          <Link href="/produits" className="hover:text-terre-600">Boutique</Link>
          <Link href="/comment-ca-marche" className="hover:text-terre-600">Comment ça marche / FAQ</Link>
          <Link href="/demande" className="hover:text-terre-600">Demander un produit introuvable</Link>
          <Link href="/suivi" className="hover:text-terre-600">Suivre ma commande</Link>
        </div>
        <div className="flex flex-col gap-2">
          <Link href="/conditions" className="hover:text-terre-600">Conditions de vente et retours</Link>
          <Link href="/confidentialite" className="hover:text-terre-600">Politique de confidentialité</Link>
          <a href={`mailto:${SHOP.contactEmail}`} className="hover:text-terre-600">{SHOP.contactEmail}</a>
        </div>
      </div>
      <p className="border-t border-[#e4e7ec] py-4 text-center text-xs">
        © {new Date().getFullYear()} {SHOP.name}. Tous droits réservés.
      </p>
    </footer>
  );
}

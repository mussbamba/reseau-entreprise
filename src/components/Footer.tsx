import Link from "next/link";
import { SHOP } from "@/lib/config";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-stone-200 bg-terre-900 text-terre-100">
      <div className="bande-wax" />
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 text-sm sm:grid-cols-3">
        <div>
          <p className="text-base font-bold text-white">{SHOP.name}</p>
          <p className="mt-2 text-terre-200">{SHOP.tagline}</p>
        </div>
        <div className="flex flex-col gap-2">
          <Link href="/produits" className="hover:text-white">Boutique</Link>
          <Link href="/comment-ca-marche" className="hover:text-white">Comment ça marche / FAQ</Link>
          <Link href="/demande" className="hover:text-white">Demander un produit introuvable</Link>
          <Link href="/suivi" className="hover:text-white">Suivre ma commande</Link>
        </div>
        <div className="flex flex-col gap-2">
          <Link href="/conditions" className="hover:text-white">Conditions de vente et retours</Link>
          <Link href="/confidentialite" className="hover:text-white">Politique de confidentialité</Link>
          <a href={`mailto:${SHOP.contactEmail}`} className="hover:text-white">{SHOP.contactEmail}</a>
        </div>
      </div>
      <p className="pb-6 text-center text-xs text-terre-200">
        © {new Date().getFullYear()} {SHOP.name}. Tous droits réservés.
      </p>
    </footer>
  );
}

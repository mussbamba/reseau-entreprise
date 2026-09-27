import { SHOP } from "@/lib/config";

export const metadata = { title: "Politique de confidentialité" };

// Modèle conforme à l'esprit de la Loi 25 (Québec). À compléter et faire relire.
export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl space-y-4 text-sm leading-relaxed text-slate-700">
      <h1 className="text-3xl font-extrabold text-slate-900">Politique de confidentialité</h1>
      <p>
        Responsable de la protection des renseignements personnels : [Votre nom], {SHOP.contactEmail}.
      </p>
      <h2 className="text-lg font-bold text-slate-900">Renseignements recueillis</h2>
      <p>
        Nom, courriel, téléphone (facultatif) et adresse de livraison, uniquement pour traiter, expédier et assurer le
        suivi de votre commande. Les données de carte de paiement sont traitées directement par Stripe et ne sont
        jamais stockées sur nos serveurs.
      </p>
      <h2 className="text-lg font-bold text-slate-900">Partage</h2>
      <p>
        Vos renseignements sont communiqués seulement aux fournisseurs nécessaires au service : le processeur de
        paiement (Stripe), le transporteur, et notre service d&apos;envoi de courriels. Nous ne vendons jamais vos
        données.
      </p>
      <h2 className="text-lg font-bold text-slate-900">Témoins (cookies)</h2>
      <p>
        Le site utilise seulement le stockage local de votre navigateur pour mémoriser votre panier. Aucun témoin
        publicitaire ni de suivi n&apos;est utilisé.
      </p>
      <h2 className="text-lg font-bold text-slate-900">Vos droits</h2>
      <p>
        Vous pouvez demander l&apos;accès, la rectification ou la suppression de vos renseignements en écrivant à{" "}
        {SHOP.contactEmail}. Les données de commande sont conservées le temps requis par les obligations fiscales.
      </p>
    </article>
  );
}

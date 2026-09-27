import { SHOP } from "@/lib/config";

export const metadata = { title: "Conditions de vente" };

// Modèle à faire relire : adaptez-le à votre situation.
export default function TermsPage() {
  return (
    <article className="mx-auto max-w-3xl space-y-4 text-sm leading-relaxed text-stone-700">
      <h1 className="text-3xl font-extrabold text-stone-900">Conditions de vente et retours</h1>
      <h2 className="text-lg font-bold text-stone-900">Service d&apos;achat sur commande</h2>
      <p>
        {SHOP.name} achète les produits commandés auprès d&apos;épiceries et de boutiques partenaires, puis les expédie au
        client. La disponibilité n&apos;est pas garantie au moment de la commande.
      </p>
      <h2 className="text-lg font-bold text-stone-900">Paiement</h2>
      <p>
        Au moment de la commande, le montant total est autorisé sur votre carte sans être débité. Après l&apos;achat en
        boutique, seul le montant des produits trouvés (plus la livraison et les taxes applicables) est débité. Les
        articles introuvables ne sont pas facturés. Si aucun produit n&apos;est disponible, la commande est annulée et
        l&apos;autorisation est libérée.
      </p>
      <h2 className="text-lg font-bold text-stone-900">Livraison</h2>
      <p>{SHOP.purchaseSchedule} Les délais du transporteur sont donnés à titre indicatif.</p>
      <h2 className="text-lg font-bold text-stone-900">Retours</h2>
      <p>
        Pour des raisons d&apos;hygiène et de sécurité, les produits alimentaires et cosmétiques ne sont ni repris ni
        échangés, sauf s&apos;ils sont endommagés, non conformes ou périmés à la réception. Dans ce cas, contactez-nous
        dans les 7 jours suivant la livraison à {SHOP.contactEmail}, avec une photo : nous vous rembourserons ou
        remplacerons le produit.
      </p>
    </article>
  );
}

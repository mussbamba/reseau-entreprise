import { MIN_ORDER_CENTS, SHIPPING, SHOP } from "@/lib/config";
import { formatMoney } from "@/lib/money";

export const metadata = { title: "Comment ça marche" };

const faq: [string, string][] = [
  [
    "Pourquoi ma carte est-elle seulement « autorisée » ?",
    "Nous n'avons pas d'entrepôt : nous achetons vos produits en boutique après votre commande. Votre banque réserve le montant maximal, puis nous débitons seulement ce que nous avons réellement trouvé. Si un article est introuvable, vous ne le payez pas.",
  ],
  ["Quand ma commande est-elle achetée et expédiée ?", SHOP.purchaseSchedule],
  [
    "Combien coûte la livraison ?",
    `${formatMoney(SHIPPING.quebecCents)} au Québec, ${formatMoney(SHIPPING.canadaCents)} ailleurs au Canada, et gratuite dès ${formatMoney(SHIPPING.freeOverCents)} d'achat.`,
  ],
  ["Y a-t-il un minimum de commande ?", `Oui, ${formatMoney(MIN_ORDER_CENTS)} avant la livraison.`],
  [
    "Et si un produit est introuvable ?",
    "Il est retiré de votre commande et n'est pas facturé. Vous pouvez aussi nous laisser une note (ex. une marque de remplacement acceptée) lors de la commande.",
  ],
  [
    "Je cherche un produit qui n'est pas sur le site.",
    `Écrivez-nous à ${SHOP.contactEmail} : nous regarderons s'il est disponible dans nos boutiques partenaires.`,
  ],
];

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-extrabold">Comment ça marche</h1>
      <ol className="mt-6 space-y-4">
        {[
          ["🛒", "Vous choisissez vos produits", "Parmi le catalogue de nos épiceries africaines partenaires."],
          ["💳", "Vous payez en toute sécurité", "Votre carte est autorisée, mais pas encore débitée."],
          ["🛍️", "Nous faisons vos courses", "Nous achetons vos produits en boutique pour vous."],
          ["✅", "Vous payez le montant réel", "Les articles introuvables sont retirés automatiquement."],
          ["📦", "Nous expédions", "Vous recevez un numéro de suivi par courriel."],
        ].map(([icon, title, text]) => (
          <li key={title} className="card flex gap-4 p-4">
            <span className="text-3xl">{icon}</span>
            <div>
              <p className="font-bold">{title}</p>
              <p className="text-sm text-stone-600">{text}</p>
            </div>
          </li>
        ))}
      </ol>

      <h2 className="mt-12 text-2xl font-bold">Questions fréquentes</h2>
      <div className="mt-4 space-y-3">
        {faq.map(([q, a]) => (
          <details key={q} className="card p-4">
            <summary className="cursor-pointer font-semibold">{q}</summary>
            <p className="mt-2 text-sm text-stone-700">{a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}

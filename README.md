# Saveurs d'Afrique : e-commerce de produits africains (MVP)

Boutique en ligne **sans stock** : le client commande, vous achetez les produits dans les épiceries
partenaires, puis vous expédiez.

**Principe clé : paiement en deux temps.** La carte du client est *autorisée* à la commande, puis
vous *encaissez seulement le montant réel* après vos achats. Les articles introuvables ne sont
jamais facturés et vous n'avez pas de remboursement à gérer.

## Démarrer en local

```bash
npm install
cp .env.example .env      # puis modifiez ADMIN_PASSWORD et AUTH_SECRET
npm run setup             # crée la base SQLite + données d'exemple
npm run dev               # http://localhost:3000
```

- Boutique : http://localhost:3000
- Admin : http://localhost:3000/admin (mot de passe défini par `ADMIN_PASSWORD`)

Sans clé Stripe, l'application tourne en **mode démo** : le paiement est simulé et les courriels
s'affichent dans la console. Vous pouvez donc tester tout le parcours tout de suite.

## Workflow d'une commande

| Étape | Qui | Où | Effet |
|---|---|---|---|
| 1. Commande et paiement | Client | `/commande` | Carte autorisée, statut **Nouvelle**, courriel de confirmation |
| 2. Achat en boutique | Vous | `/admin/liste-achat` | Articles regroupés par boutique ; ✓ Acheté / ✗ Introuvable → **Achat en cours** |
| 3. Encaissement | Vous | `/admin/commandes/[id]` | Débit du montant réel → **Achetée**, courriel avec montant final |
| 4. Expédition | Vous | idem | Transporteur et n° de suivi → **Expédiée**, courriel au client |
| 5. Livraison | Vous | idem | **Livrée** |

Le client suit sa commande via le lien reçu par courriel ou sur `/suivi` (numéro + courriel).

⚠️ Une autorisation Stripe **expire après 7 jours** : encaissez avant. Le tableau de bord signale
les commandes de plus de 5 jours.

## Demandes spéciales (produits introuvables)

Un client qui ne trouve pas un produit remplit `/demande` : nom du produit, détails, quantité,
prix maximum et photo, tous facultatifs sauf le nom. Il reçoit un lien de suivi par courriel.

1. Vous voyez la demande dans `/admin/demandes`. Le tableau de bord affiche aussi une alerte.
2. Vous la cherchez en boutique, puis vous envoyez un prix (prix de vente, coût, boutique, message).
   L'app crée un produit **non listé** au catalogue et le client reçoit un courriel.
3. Le client ajoute l'article à son panier depuis sa page de demande, ou refuse.
4. À la commande, la demande passe à **Commandé** et l'article apparaît dans la liste d'achat,
   comme les autres produits.

Si le produit est introuvable, le bouton « Introuvable » prévient le client par courriel.

## Réglages d'affaires

Dans `src/lib/config.ts` : nom de la boutique, minimum de commande, tarifs de livraison, seuil de
livraison gratuite, provinces desservies, texte du calendrier d'achat.

Taxes : `TAXES_ENABLED="false"` tant que vous êtes petit fournisseur (< 30 000 $/an). Passez à
`true` après votre inscription à la TPS/TVQ : TPS+TVQ au Québec, TVH dans les provinces harmonisées,
TPS ailleurs.

## Mise en production

1. **Stripe** : créez un compte, puis mettez `STRIPE_SECRET_KEY` dans `.env`. Ajoutez un webhook
   vers `https://votre-site/api/stripe/webhook` (événement `checkout.session.completed`) et copiez
   son secret dans `STRIPE_WEBHOOK_SECRET`.
2. **Courriels** : compte [Resend](https://resend.com), domaine vérifié, `RESEND_API_KEY` et
   `EMAIL_FROM`. `ADMIN_EMAIL` reçoit une alerte à chaque nouvelle commande.
3. **Base de données** : pour Vercel, passez à PostgreSQL (Supabase, Neon…). Dans
   `prisma/schema.prisma`, mettez `provider = "postgresql"` et `DATABASE_URL`, puis ajoutez
   `mode: "insensitive"` aux recherches `contains` de `src/app/(shop)/produits/page.tsx`.
4. Remplacez les textes modèles de `/conditions` et `/confidentialite` (responsable Loi 25, etc.)
   et faites-les relire.

## Stack

Next.js 15 (App Router, Server Actions) · Prisma · Stripe Checkout (`capture_method: manual`) ·
Tailwind CSS 4 · Resend (optionnel).

## Pas encore dans le MVP (phase 2)

Téléversement de photos produits (URL pour l'instant), comptes clients, remplacement d'article avec accord
du client, étiquettes d'expédition automatiques, codes promo, version anglaise.

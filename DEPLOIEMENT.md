# Mise en ligne gratuite (Neon + Vercel)

Durée : environ 20 minutes. Coût : 0 $ pour démarrer.

| Service | Rôle | Offre gratuite |
|---|---|---|
| **Neon** (neon.tech) | Base de données PostgreSQL | 0,5 Go, largement assez pour démarrer |
| **Vercel** (vercel.com) | Héberge le site et l'admin | Plan « Hobby » |
| **GitHub** | Contient le code | Déjà en place : `mussbamba/reseau-entreprise` |

> ⚠️ Le plan gratuit Hobby de Vercel est prévu pour un usage **non commercial**. Il convient pour
> tester et montrer le site. Quand vous commencerez à vendre, passez au plan Pro (20 $ US/mois) ou
> hébergez sur Netlify, dont l'offre gratuite accepte l'usage commercial.

---

## Étape 1 — Base de données Neon (5 min)

1. Créez un compte sur **https://neon.tech** (connexion avec GitHub possible).
2. **Create project** : nom `saveurs-afrique`, région **AWS US East (N. Virginia)** ou la plus
   proche de Montréal, PostgreSQL 16.
3. Sur le tableau de bord, cliquez **Connect**. Copiez **deux** chaînes de connexion :
   - **Pooled connection** (l'adresse contient `-pooler`) → ce sera `DATABASE_URL`
   - **Direct connection** (sans `-pooler`, décochez « Connection pooling ») → ce sera `DIRECT_URL`

   Elles ressemblent à :
   `postgresql://neondb_owner:MOTDEPASSE@ep-xxxx-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require`

Gardez-les de côté (ce sont des secrets : ne les publiez nulle part).

## Étape 2 — Préparer deux secrets (2 min)

- **ADMIN_PASSWORD** : le mot de passe de votre admin. **12 caractères minimum**, pas `changez-moi`
  (le site refuse ce mot de passe en production).
- **AUTH_SECRET** : une longue chaîne aléatoire (32 caractères minimum). Pour la générer, dans le
  terminal de VS Code :

  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

## Étape 3 — Déployer sur Vercel (5 min)

1. Créez un compte sur **https://vercel.com** avec **Continue with GitHub**.
2. **Add New… → Project**, puis importez le dépôt **reseau-entreprise**.
   Si vous ne le voyez pas : « Adjust GitHub App Permissions » et autorisez ce dépôt.
3. **Branche** : dans *Settings → Git* après l'import (ou dans l'écran d'import), la branche de
   production doit être celle qui contient le code : `claude/ecommerce-african-products-quebec-mw04fh`
   (ou `main` si vous avez fusionné la branche).
4. Laissez *Framework Preset* sur **Next.js** et la commande de build par défaut.
5. Ouvrez **Environment Variables** et ajoutez :

   | Nom | Valeur |
   |---|---|
   | `DATABASE_URL` | la chaîne **Pooled** de Neon |
   | `DIRECT_URL` | la chaîne **Direct** de Neon |
   | `ADMIN_PASSWORD` | votre mot de passe admin (12+ caractères) |
   | `AUTH_SECRET` | la chaîne aléatoire générée à l'étape 2 |
   | `NEXT_PUBLIC_SITE_URL` | `https://saveurs-afrique.vercel.app` (à corriger après le 1er déploiement si l'adresse diffère) |
   | `TAXES_ENABLED` | `false` |

6. Cliquez **Deploy**. Le build crée automatiquement les tables dans Neon (`prisma migrate deploy`).
7. Notez l'adresse obtenue (ex. `https://saveurs-afrique.vercel.app`). Si elle diffère de
   `NEXT_PUBLIC_SITE_URL`, corrigez la variable puis **Deployments → ⋯ → Redeploy**.

## Étape 4 — Ajouter les produits d'exemple (facultatif, 2 min)

Sur votre ordinateur, dans le fichier `.env` du projet, mettez les **mêmes** `DATABASE_URL` et
`DIRECT_URL` que sur Vercel, puis :

```bash
npm run db:seed
```

Sinon, créez directement vos catégories, boutiques et produits depuis l'admin en ligne.

## Étape 5 — Vérifier

- Boutique : `https://VOTRE-ADRESSE.vercel.app`
- Admin : `https://VOTRE-ADRESSE.vercel.app/admin` (mot de passe = `ADMIN_PASSWORD`)
- Créez un compte client de test, passez une commande (paiement simulé), puis traitez-la dans l'admin.

Chaque nouveau `git push` sur la branche de production redéploie le site automatiquement.

---

## Et ensuite

- **Vrais paiements** : compte Stripe, puis ajoutez `STRIPE_SECRET_KEY` et `STRIPE_WEBHOOK_SECRET`
  (webhook : `https://VOTRE-ADRESSE/api/stripe/webhook`, événement `checkout.session.completed`).
- **Vrais courriels** : compte Resend, domaine vérifié, `RESEND_API_KEY`, `EMAIL_FROM`, `ADMIN_EMAIL`.
- **Assistant cuisine IA** : `ANTHROPIC_API_KEY` (clé sur console.anthropic.com). Sans clé, l'assistant utilise les recettes intégrées.
- **Nom de domaine** (ex. `saveursdafrique.ca`, environ 15 $/an) : *Vercel → Settings → Domains*.

## Dépannage

| Problème | Solution |
|---|---|
| Build : `Environment variable not found: DIRECT_URL` | Ajoutez `DIRECT_URL` dans Vercel, puis redéployez |
| Erreur `prepared statement ... already exists` | Ajoutez `&pgbouncer=true` à la fin de `DATABASE_URL` (chaîne poolée) |
| « Admin désactivé : définissez ADMIN_PASSWORD… » | Mot de passe admin trop court ou égal à `changez-moi` |
| Erreur « AUTH_SECRET trop court » | Générez une chaîne de 32+ caractères (étape 2) |
| Liens des courriels vers `localhost` | Corrigez `NEXT_PUBLIC_SITE_URL`, puis redéployez |

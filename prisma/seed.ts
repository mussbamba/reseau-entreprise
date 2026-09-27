// Données d'exemple : remplacez-les par vos vraies boutiques et vos vrais produits depuis /admin.
import { PrismaClient } from "@prisma/client";
import { slugify } from "../src/lib/slug";

const db = new PrismaClient();

const categories = [
  { name: "Farines & céréales", slug: "farines-cereales", emoji: "🌾" },
  { name: "Épices & condiments", slug: "epices-condiments", emoji: "🌶️" },
  { name: "Huiles & sauces", slug: "huiles-sauces", emoji: "🫙" },
  { name: "Poissons séchés", slug: "poissons-seches", emoji: "🐟" },
  { name: "Boissons & snacks", slug: "boissons-snacks", emoji: "🥤" },
  { name: "Beauté & soins", slug: "beaute-soins", emoji: "🧴" },
];

const stores = [
  { name: "Épicerie A (exemple)", address: "123 rue Exemple, Montréal", hours: "Lun-sam 9h-20h" },
  { name: "Marché B (exemple)", address: "456 boul. Exemple, Montréal", hours: "Tous les jours 10h-19h" },
];

// [nom, catégorie, boutique (index), prix $, coût $, poids g, origine, vedette]
const products: [string, string, number, number, number, number, string, boolean][] = [
  ["Gari blanc 1 kg", "farines-cereales", 0, 7.99, 4.5, 1000, "Ghana", true],
  ["Farine d'igname (poundo) 1,8 kg", "farines-cereales", 0, 14.99, 9.5, 1800, "Nigeria", true],
  ["Attiéké déshydraté 1 kg", "farines-cereales", 1, 9.49, 5.75, 1000, "Côte d'Ivoire", true],
  ["Farine de manioc (foufou) 1,5 kg", "farines-cereales", 1, 11.99, 7.25, 1500, "Cameroun", false],
  ["Soumbala (moutarde africaine) 100 g", "epices-condiments", 1, 5.99, 3.25, 100, "Burkina Faso", false],
  ["Piment de Cayenne moulu 200 g", "epices-condiments", 0, 4.99, 2.75, 200, "Nigeria", false],
  ["Cubes d'assaisonnement Maggi (x100)", "epices-condiments", 0, 6.99, 4.0, 400, "Côte d'Ivoire", true],
  ["Huile de palme rouge 1 L", "huiles-sauces", 0, 12.99, 8.0, 1000, "Ghana", true],
  ["Pâte d'arachide 500 g", "huiles-sauces", 1, 7.49, 4.5, 500, "Sénégal", false],
  ["Poisson fumé (machoiron) 250 g", "poissons-seches", 1, 16.99, 11.0, 250, "Côte d'Ivoire", false],
  ["Crevettes séchées moulues 100 g", "poissons-seches", 0, 8.99, 5.5, 100, "Cameroun", false],
  ["Bissap (fleurs d'hibiscus) 250 g", "boissons-snacks", 1, 6.49, 3.5, 250, "Sénégal", true],
  ["Chips de plantain 85 g", "boissons-snacks", 0, 2.49, 1.25, 85, "Ghana", false],
  ["Malta Guinness (6 x 330 ml)", "boissons-snacks", 0, 11.99, 7.5, 2200, "Nigeria", false],
  ["Beurre de karité brut 250 g", "beaute-soins", 1, 12.99, 7.0, 250, "Burkina Faso", true],
  ["Savon noir africain 200 g", "beaute-soins", 1, 7.99, 4.0, 200, "Ghana", false],
];


async function main() {
  if ((await db.product.count()) > 0) {
    console.log("Base déjà initialisée, rien à faire.");
    return;
  }
  const cats = await Promise.all(
    categories.map((c, position) => db.category.create({ data: { ...c, position } })),
  );
  const sts = await Promise.all(stores.map((s) => db.store.create({ data: s })));
  for (const [name, cat, store, price, cost, weight, origin, featured] of products) {
    await db.product.create({
      data: {
        name,
        slug: slugify(name),
        description: `${name}. Acheté pour vous dans nos épiceries partenaires.`,
        origin,
        priceCents: Math.round(price * 100),
        costCents: Math.round(cost * 100),
        weightGrams: weight,
        featured,
        categoryId: cats.find((c) => c.slug === cat)!.id,
        storeId: sts[store].id,
      },
    });
  }
  console.log(`✔ ${categories.length} catégories, ${stores.length} boutiques, ${products.length} produits créés.`);
}

main().finally(() => db.$disconnect());

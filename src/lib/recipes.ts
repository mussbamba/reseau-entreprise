// Recettes intégrées : utilisées par l'assistant quand l'IA n'est pas configurée (ou en secours).
// Chaque ingrédient « à acheter » est cherché dans le catalogue ; s'il n'y est pas, le client peut
// en faire une demande spéciale. Les ingrédients courants (oignons, poulet…) sont listés à part.

export type RecipeIngredient = {
  /** Texte cherché dans le catalogue (noms locaux acceptés) */
  query: string;
  /** Nom affiché si le produit n'est pas au catalogue */
  label: string;
  /** Quantité (en unités du catalogue) pour `servings` personnes */
  qty: number;
  /** false : ne change pas avec le nombre de personnes (condiments, épices) */
  scales?: boolean;
};

export type Recipe = {
  name: string;
  /** Mots qui déclenchent la recette (normalisés, sans accents) */
  keys: string[];
  servings: number;
  ingredients: RecipeIngredient[];
  /** À prévoir de votre côté (frais ou courant) */
  pantry: string[];
};

export const RECIPES: Recipe[] = [
  {
    name: "Poulet yassa",
    keys: ["yassa"],
    servings: 4,
    ingredients: [
      { query: "maggi", label: "Cubes d'assaisonnement", qty: 1, scales: false },
      { query: "piment", label: "Piment", qty: 1, scales: false },
    ],
    pantry: ["1,5 kg de poulet", "6 oignons", "4 citrons", "Moutarde de Dijon", "Riz blanc", "Huile végétale"],
  },
  {
    name: "Mafé",
    keys: ["mafe", "tigadegue", "sauce arachide", "groundnut stew"],
    servings: 4,
    ingredients: [
      { query: "pate d arachide", label: "Pâte d'arachide", qty: 1 },
      { query: "maggi", label: "Cubes d'assaisonnement", qty: 1, scales: false },
      { query: "piment", label: "Piment", qty: 1, scales: false },
    ],
    pantry: ["1 kg de bœuf ou de poulet", "3 tomates", "2 oignons", "Carottes, patate douce", "Riz blanc"],
  },
  {
    name: "Attiéké poisson",
    keys: ["attieke poisson", "attieke", "garba", "acheke"],
    servings: 4,
    ingredients: [
      { query: "attieke", label: "Attiéké", qty: 1 },
      { query: "piment", label: "Piment", qty: 1, scales: false },
      { query: "maggi", label: "Cubes d'assaisonnement", qty: 1, scales: false },
    ],
    pantry: ["4 poissons (tilapia, maquereau) ou du thon", "2 oignons", "3 tomates", "Huile de friture"],
  },
  {
    name: "Soupe egusi et eba",
    keys: ["egusi", "egousi", "eba"],
    servings: 4,
    ingredients: [
      { query: "gari", label: "Gari", qty: 1 },
      { query: "egusi", label: "Graines d'egusi moulues", qty: 1 },
      { query: "huile de palme", label: "Huile de palme rouge", qty: 1 },
      { query: "crevettes sechees", label: "Crevettes séchées", qty: 1, scales: false },
      { query: "poisson fume", label: "Poisson fumé", qty: 1 },
      { query: "maggi", label: "Cubes d'assaisonnement", qty: 1, scales: false },
    ],
    pantry: ["500 g de viande (bœuf, chèvre)", "Épinards", "1 oignon"],
  },
  {
    name: "Ndolé",
    keys: ["ndole"],
    servings: 6,
    ingredients: [
      { query: "ndole", label: "Feuilles de ndolé", qty: 1 },
      { query: "pate d arachide", label: "Pâte d'arachide", qty: 1 },
      { query: "crevettes sechees", label: "Crevettes séchées", qty: 1, scales: false },
      { query: "poisson fume", label: "Poisson fumé", qty: 1 },
      { query: "maggi", label: "Cubes d'assaisonnement", qty: 1, scales: false },
    ],
    pantry: ["500 g de bœuf", "Crevettes fraîches", "2 oignons", "Ail", "Plantains ou bâtons de manioc"],
  },
  {
    name: "Foufou et sauce arachide",
    keys: ["foufou", "fufu", "sauce d arachide"],
    servings: 4,
    ingredients: [
      { query: "foufou", label: "Farine de manioc (foufou)", qty: 1 },
      { query: "pate d arachide", label: "Pâte d'arachide", qty: 1 },
      { query: "maggi", label: "Cubes d'assaisonnement", qty: 1, scales: false },
      { query: "piment", label: "Piment", qty: 1, scales: false },
    ],
    pantry: ["1 kg de poulet", "2 tomates", "1 oignon"],
  },
  {
    name: "Igname pilée (poundo) et sauce graine",
    keys: ["poundo", "pounded yam", "igname pilee", "sauce graine", "foutou"],
    servings: 4,
    ingredients: [
      { query: "poundo", label: "Farine d'igname (poundo)", qty: 1 },
      { query: "huile de palme", label: "Huile de palme rouge", qty: 1 },
      { query: "poisson fume", label: "Poisson fumé", qty: 1 },
      { query: "maggi", label: "Cubes d'assaisonnement", qty: 1, scales: false },
    ],
    pantry: ["Viande ou poisson frais", "1 oignon", "2 tomates"],
  },
  {
    name: "Thiéboudienne",
    keys: ["thieboudienne", "thieb", "ceebu jen", "tiep"],
    servings: 6,
    ingredients: [
      { query: "riz brise", label: "Riz brisé", qty: 1 },
      { query: "poisson fume", label: "Poisson séché (guedj)", qty: 1 },
      { query: "maggi", label: "Cubes d'assaisonnement", qty: 1, scales: false },
      { query: "piment", label: "Piment", qty: 1, scales: false },
    ],
    pantry: ["1,5 kg de poisson (thiof, mérou)", "Chou, carottes, manioc, aubergines", "Concentré de tomate", "Persil, ail, oignons"],
  },
  {
    name: "Riz jollof",
    keys: ["jollof", "riz au gras", "benachin"],
    servings: 6,
    ingredients: [
      { query: "maggi", label: "Cubes d'assaisonnement", qty: 1, scales: false },
      { query: "piment", label: "Piment", qty: 1, scales: false },
      { query: "crevettes sechees", label: "Crevettes séchées", qty: 1, scales: false },
    ],
    pantry: ["Riz étuvé", "Tomates, poivrons rouges, oignons", "Concentré de tomate", "Poulet", "Thym, laurier, curry"],
  },
  {
    name: "Alloco",
    keys: ["alloco", "aloko", "dodo", "kelewele", "plantain frit"],
    servings: 4,
    ingredients: [
      { query: "plantain frais", label: "Bananes plantains mûres", qty: 1 },
      { query: "piment", label: "Piment", qty: 1, scales: false },
    ],
    pantry: ["Huile de friture", "Sel", "Oignon"],
  },
  {
    name: "Jus de bissap",
    keys: ["bissap", "zobo", "sobolo", "jus d hibiscus", "folere"],
    servings: 8,
    ingredients: [{ query: "bissap", label: "Fleurs d'hibiscus (bissap)", qty: 1 }],
    pantry: ["Sucre", "Menthe fraîche", "Eau", "Arôme vanille ou gingembre (facultatif)"],
  },
];

/** Nombre de personnes demandé (« pour 6 », « 10 personnes »), sinon null. */
export function parseServings(text: string) {
  const m = text.match(/(?:pour\s+)?(\d{1,2})\s*(?:personnes?|pers\.?|invit[ée]s?|convives|people|adultes)/i) ?? text.match(/pour\s+(\d{1,2})\b/i);
  const n = m ? Number(m[1]) : NaN;
  return n >= 1 && n <= 50 ? n : null;
}

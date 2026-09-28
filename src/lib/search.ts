// Recherche « comme je parle » : noms locaux, anglais, sans accents et avec fautes de frappe.
// Fonctionne sans IA ni service externe : dictionnaire de synonymes + tolérance aux fautes.

/** Minuscules, sans accents ni ponctuation : « Attiéké » → « attieke ». */
export function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/**
 * Groupes de noms équivalents. Si la recherche contient un de ces noms, tous les produits qui
 * portent un nom du même groupe (dans leur nom ou leurs « autres noms ») sont trouvés.
 * Ajoutez des groupes librement ; les noms propres à un seul produit vont plutôt dans le champ
 * « Autres noms » du produit (Admin → Produits).
 */
export const LOCAL_NAMES: string[][] = [
  ["attieke", "acheke", "atcheke", "attiake", "garba"],
  ["gari", "garri", "gali", "eba", "tapioca de manioc"],
  ["foufou", "fufu", "foofoo", "fou fou", "farine de manioc", "cassava flour", "kpokpo"],
  ["poundo", "pounded yam", "igname pilee", "farine d igname", "iyan", "foutou igname", "yam flour"],
  ["huile de palme", "huile rouge", "palm oil", "zomi", "dende", "red oil"],
  ["pate d arachide", "beurre d arachide", "peanut butter", "groundnut paste", "tigadegue", "mafe", "sauce arachide"],
  ["bissap", "hibiscus", "oseille", "zobo", "sobolo", "karkade", "folere", "wonjo"],
  ["soumbala", "sumbala", "dawadawa", "iru", "netetou", "afitin", "moutarde africaine"],
  ["piment", "pili pili", "pilipili", "pepper", "chili", "cayenne", "pima"],
  ["maggi", "cube", "cubes", "bouillon", "jumbo", "knorr", "assaisonnement"],
  ["poisson fume", "poisson seche", "machoiron", "smoked fish", "dried fish", "panla", "kobo", "bonga"],
  ["crevettes sechees", "crevette", "crayfish", "ecrevisses", "njanga", "mandjanga"],
  ["plantain", "alloco", "aloko", "dodo", "kelewele", "banane plantain", "platano", "chips de plantain"],
  ["karite", "shea", "shea butter", "ori", "beurre de karite"],
  ["savon noir", "black soap", "alata", "ose dudu", "dudu osun"],
  ["malta", "malt", "maltina"],
  ["feuilles de manioc", "pondu", "saka saka", "mpondu", "kpwem", "cassava leaves", "matapa"],
  ["egusi", "egousi", "agushi", "graines de courge", "pistache africaine", "ngondo"],
  ["ndole", "feuilles ameres", "bitter leaf", "onugbu", "vernonia"],
  ["gombo", "okra", "okro", "lalo gombo"],
  ["baobab", "lalo", "pain de singe", "bouye", "bouy"],
  ["riz brise", "riz casse", "broken rice", "thieb"],
  ["mil", "millet", "thiakry", "degue", "araw", "sankal"],
  ["fonio", "acha"],
  ["kola", "cola", "noix de kola", "goro", "orobo"],
  ["gingembre", "ginger", "gnamakoudji", "jinja"],
];

const STOPWORDS = new Set(
  "de du des la le les l d un une et en au aux pour avec sans sur a mon ma mes je veux il me faut kg g ml l lb svp please the of and"
    .split(" "),
);

function levenshtein(a: string, b: string) {
  if (Math.abs(a.length - b.length) > 2) return 3;
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let diag = prev[0];
    prev[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = prev[j];
      prev[j] = Math.min(prev[j] + 1, prev[j - 1] + 1, diag + (a[i - 1] === b[j - 1] ? 0 : 1));
      diag = tmp;
    }
  }
  return prev[b.length];
}

/** Mots utiles de la recherche (sans « de », « 1 kg », etc.). */
function significantTokens(q: string) {
  return normalize(q)
    .split(" ")
    .filter((t) => t.length >= 2 && !STOPWORDS.has(t) && !/^\d+(kg|g|ml|l|lb|x)?$/.test(t));
}

function hasPhrase(text: string, phrase: string) {
  return ` ${text} `.includes(` ${phrase} `);
}

export type Searchable = { name: string; aliases: string; category: { name: string } };

/**
 * Score d'un produit pour une recherche (0 = aucun rapport).
 * `exact` indique que tous les mots utiles de la recherche ont été reconnus.
 */
export function scoreProduct(q: string, p: Searchable) {
  const text = normalize(`${p.name} ${p.aliases.replace(/,/g, " ")}`);
  const catText = normalize(p.category.name);
  const words = text.split(" ");
  const nq = normalize(q);
  let score = 0;

  // Mots reconnus grâce à un synonyme (« zobo » → bissap)
  const coveredByGroup = new Set<string>();
  for (const group of LOCAL_NAMES) {
    const inQuery = group.filter((n) => hasPhrase(nq, n));
    if (inQuery.length && group.some((n) => hasPhrase(text, n))) {
      score += 6;
      inQuery.forEach((n) => n.split(" ").forEach((w) => coveredByGroup.add(w)));
    }
  }

  const tokens = significantTokens(q);
  let matched = 0;
  for (const t of tokens) {
    if (coveredByGroup.has(t)) {
      matched++;
      continue;
    }
    let best = 0;
    for (const w of words) {
      if (w === t) best = Math.max(best, 4);
      else if (t.length >= 3 && (w.startsWith(t) || (t.length >= 5 && t.startsWith(w) && w.length >= 4))) best = Math.max(best, 3);
      else if (t.length >= 4 && levenshtein(t, w) <= (t.length >= 7 ? 2 : 1)) best = Math.max(best, 2);
    }
    if (!best && t.length >= 4 && catText.split(" ").some((w) => w.startsWith(t))) best = 1;
    if (best) matched++;
    score += best;
  }
  return { score, exact: tokens.length > 0 && matched === tokens.length };
}

/** Trie les produits par pertinence. `exact` : au moins un produit correspond à toute la recherche. */
export function rankProducts<T extends Searchable>(q: string, products: T[]) {
  const scored = products
    .map((p) => ({ p, ...scoreProduct(q, p) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => Number(b.exact) - Number(a.exact) || b.score - a.score);
  const exact = scored.some((x) => x.exact);
  // Sans correspondance complète, on ne garde que les meilleurs résultats approchants.
  // Et on écarte les résultats bien moins pertinents que le premier (« zobo » ≠ « kobo »).
  const kept = exact ? scored.filter((x) => x.exact) : scored.slice(0, 8);
  const top = kept[0]?.score ?? 0;
  const list = kept.filter((x) => x.score >= top / 2);
  return { products: list.map((x) => x.p), exact };
}

/** Meilleur produit pour un ingrédient, ou null si rien ne correspond vraiment. */
export function bestMatch<T extends Searchable>(q: string, products: T[]) {
  const { products: list, exact } = rankProducts(q, products);
  return exact ? list[0] ?? null : null;
}

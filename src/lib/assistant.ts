import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import { aiEnabled } from "./env";
import { RECIPES, parseServings, type Recipe } from "./recipes";
import { bestMatch, isKnownProductName, normalize, type Searchable } from "./search";

// Assistant cuisine : « Je veux faire un poulet yassa pour 6 » ou « 2 sacs d'attiéké et de
// l'huile rouge » → panier prêt. Avec ANTHROPIC_API_KEY, Claude comprend n'importe quelle
// demande ; sans clé, des règles et des recettes intégrées prennent le relais.

export type CatalogProduct = Searchable & { id: number; priceCents: number };

export type AssistantPlan = {
  title: string;
  intro: string;
  source: "ia" | "local";
  items: { productId: number; quantity: number; note: string }[];
  /** Produits africains absents du catalogue : le client peut en faire une demande spéciale */
  missing: { name: string; note: string }[];
  /** Ingrédients courants à prévoir de son côté (frais, épicerie ordinaire) */
  pantry: string[];
};

const MAX_QTY = 10;
const clampQty = (n: number) => Math.min(MAX_QTY, Math.max(1, Math.round(n) || 1));

function mergeItems(items: AssistantPlan["items"]) {
  const byId = new Map<number, AssistantPlan["items"][number]>();
  for (const it of items) {
    const prev = byId.get(it.productId);
    if (prev) prev.quantity = clampQty(Math.max(prev.quantity, it.quantity));
    else byId.set(it.productId, { ...it, quantity: clampQty(it.quantity) });
  }
  return [...byId.values()];
}

// ---------- Mode local (sans IA) ----------

function findRecipe(text: string): Recipe | null {
  const t = ` ${normalize(text)} `;
  let best: { r: Recipe; len: number } | null = null;
  for (const r of RECIPES)
    for (const k of r.keys) if (t.includes(` ${k} `) && (!best || k.length > best.len)) best = { r, len: k.length };
  return best?.r ?? null;
}

const NUMBER_WORDS: Record<string, number> = {
  un: 1, une: 1, deux: 2, trois: 3, quatre: 4, cinq: 5, six: 6, sept: 7, huit: 8, neuf: 9, dix: 10,
};

const FILLER =
  /\b(il me faut|j ai besoin d[e']?|je veux|je voudrais|j aimerais|donne moi|ajoute|svp|s il vous plait|merci|aussi|encore|sacs?|paquets?|bouteilles?|boites?|pots?|bidons?|sachets?|kilos?|kg|litres?|de la|de l|du|des|de|d|l)\b/g;

function localShoppingList(text: string, catalog: CatalogProduct[]): AssistantPlan {
  const pieces = text.split(/[,;\n+]|\s(?:et|and)\s/i).map((s) => s.trim()).filter(Boolean);
  const items: AssistantPlan["items"] = [];
  const missing: AssistantPlan["missing"] = [];
  // Une seule demande sans correspondance : on la garde seulement si c'est un produit connu (« pondu »)
  if (pieces.length < 2 && !pieces.some((piece) => bestMatch(piece, catalog) || isKnownProductName(piece))) pieces.length = 0;
  for (const piece of pieces) {
    let n = normalize(piece);
    let qty = 1;
    const num = n.match(/^(\d{1,2})\s+/) ?? n.match(/\b(\d{1,2})\s+(?:sacs?|paquets?|bouteilles?|boites?|pots?)\b/);
    if (num) qty = Number(num[1]);
    else {
      const w = n.split(" ").find((x) => NUMBER_WORDS[x]);
      if (w) qty = NUMBER_WORDS[w];
    }
    n = n.replace(/\b\d{1,2}\b/g, " ").replace(FILLER, " ");
    for (const w of Object.keys(NUMBER_WORDS)) n = n.replace(new RegExp(`\\b${w}\\b`, "g"), " ");
    n = n.replace(/\s+/g, " ").trim();
    if (n.length < 2) continue;
    const match = bestMatch(n, catalog);
    if (match) items.push({ productId: match.id, quantity: qty, note: "" });
    else missing.push({ name: piece.replace(/^\s*\d+\s*/, "").slice(0, 80), note: "Pas encore au catalogue." });
  }
  return {
    title: items.length || missing.length ? "Votre liste de courses" : "Je n'ai pas bien compris",
    intro:
      items.length || missing.length
        ? "Voici ce que j'ai trouvé. Ajustez les quantités puis ajoutez tout au panier."
        : "Écrivez un plat (ex. « mafé pour 6 ») ou une liste de produits séparés par des virgules.",
    source: "local",
    items: mergeItems(items),
    missing,
    pantry: [],
  };
}

export function localPlan(text: string, catalog: CatalogProduct[]): AssistantPlan {
  // Plusieurs éléments séparés (« attiéké, huile rouge et zobo ») : c'est une liste, pas une recette
  const isList = text.split(/[,;\n+]|\s(?:et|and)\s/i).filter((s) => s.trim()).length >= 2;
  const recipe = isList ? null : findRecipe(text);
  if (!recipe) return localShoppingList(text, catalog);
  const servings = parseServings(text) ?? recipe.servings;
  const factor = servings / recipe.servings;
  const items: AssistantPlan["items"] = [];
  const missing: AssistantPlan["missing"] = [];
  for (const ing of recipe.ingredients) {
    const match = bestMatch(ing.query, catalog);
    const quantity = clampQty(ing.scales === false ? ing.qty : Math.ceil(ing.qty * factor));
    if (match) items.push({ productId: match.id, quantity, note: ing.label });
    else missing.push({ name: ing.label, note: "Pas encore au catalogue : nous pouvons le chercher pour vous." });
  }
  return {
    title: `${recipe.name} pour ${servings} personne${servings > 1 ? "s" : ""}`,
    intro: "Les produits africains de la recette sont prêts à ajouter au panier.",
    source: "local",
    items: mergeItems(items),
    missing,
    pantry: recipe.pantry,
  };
}

// ---------- Mode IA (Claude) ----------

const PlanSchema = z.object({
  title: z.string().describe("Titre court, ex. « Poulet yassa pour 6 personnes » ou « Votre liste de courses »"),
  intro: z.string().describe("Une ou deux phrases chaleureuses en français, sans nom de magasin"),
  items: z.array(
    z.object({
      productId: z.number().int().describe("Identifiant exact d'un produit du catalogue"),
      quantity: z.number().int().describe("Nombre d'unités du catalogue (1 à 10)"),
      note: z.string().describe("Usage dans la recette, très court (ex. « pour la sauce »)"),
    }),
  ),
  missing: z.array(
    z.object({
      name: z.string().describe("Produit africain ou spécialisé absent du catalogue"),
      note: z.string().describe("Précision utile (format, quantité)"),
    }),
  ),
  pantry: z.array(z.string()).describe("Ingrédients courants à prévoir soi-même, avec quantité"),
});

const SYSTEM = `Tu es l'assistant cuisine de Saveurs d'Afrique, une boutique en ligne québécoise de produits africains.
Le client décrit un plat à cuisiner, un repas, une occasion ou une liste de courses, parfois avec des noms locaux (wolof, lingala, yoruba, dioula, anglais…) ou des fautes.

Règles :
- Réponds en français.
- "items" : uniquement des produits du CATALOGUE ci-dessous, avec leur productId exact. N'invente jamais d'identifiant.
- Quantités en unités du catalogue (un sac, un pot…), adaptées au nombre de personnes (4 par défaut).
- "missing" : produits africains ou spécialisés nécessaires mais absents du catalogue (la boutique peut les chercher sur demande).
- "pantry" : ingrédients courants que le client achète lui-même (viande fraîche, oignons, tomates, riz ordinaire…), avec quantités.
- Ne nomme jamais d'épicerie ou de magasin. N'indique pas de prix.
- Si la demande n'a rien à voir avec la cuisine ou les produits de la boutique, renvoie des listes vides et explique gentiment dans "intro" ce que tu peux faire.`;

let client: Anthropic | null = null;

async function aiPlan(text: string, catalog: CatalogProduct[]): Promise<AssistantPlan | null> {
  client ??= new Anthropic();
  const catalogText = catalog
    .map((p) => `${p.id} | ${p.name}${p.aliases ? ` (aussi : ${p.aliases})` : ""} | ${p.category.name}`)
    .join("\n");

  const response = await client.beta.messages.parse({
    model: process.env.ANTHROPIC_MODEL || "claude-opus-5",
    max_tokens: 4000,
    output_config: { effort: "low", format: betaZodOutputFormat(PlanSchema) },
    // Si le modèle refuse une demande, l'API la relance sur le modèle de secours recommandé
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    system: [
      { type: "text", text: SYSTEM },
      { type: "text", text: `CATALOGUE (productId | nom | catégorie) :\n${catalogText}`, cache_control: { type: "ephemeral" } },
    ],
    messages: [{ role: "user", content: text }],
  });

  if (response.stop_reason === "refusal" || !response.parsed_output) return null;
  const out = response.parsed_output;
  const ids = new Set(catalog.map((p) => p.id));
  return {
    title: out.title.slice(0, 120),
    intro: out.intro.slice(0, 400),
    source: "ia",
    items: mergeItems(out.items.filter((i) => ids.has(i.productId)).map((i) => ({ ...i, note: i.note.slice(0, 80) }))),
    missing: out.missing.slice(0, 10).map((m) => ({ name: m.name.slice(0, 80), note: m.note.slice(0, 120) })),
    pantry: out.pantry.slice(0, 12).map((s) => s.slice(0, 80)),
  };
}

/** Plan avec l'IA si possible, sinon (ou en cas d'erreur) avec les règles locales. */
export async function planFromText(text: string, catalog: CatalogProduct[], allowAI: boolean): Promise<AssistantPlan> {
  if (allowAI && aiEnabled()) {
    try {
      const plan = await aiPlan(text, catalog);
      if (plan) return plan;
    } catch (error) {
      if (error instanceof Anthropic.RateLimitError) console.warn("Assistant IA : limite de débit atteinte, mode local.");
      else if (error instanceof Anthropic.APIError) console.error(`Assistant IA : erreur ${error.status}`, error.message);
      else console.error("Assistant IA :", error);
    }
  }
  return localPlan(text, catalog);
}

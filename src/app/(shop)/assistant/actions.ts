"use server";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/customer-auth";
import { planFromText, type AssistantPlan } from "@/lib/assistant";

export type PlanProduct = {
  id: number;
  slug: string;
  name: string;
  priceCents: number;
  imageUrl: string;
  emoji: string;
  quantity: number;
  note: string;
};

export type AssistantState = {
  text?: string;
  error?: string;
  plan?: Omit<AssistantPlan, "items"> & { products: PlanProduct[] };
};

// Limite simple d'appels IA par compte (protège la facture de l'API)
const AI_PER_HOUR = 20;
const aiCalls = new Map<number, number[]>();
function allowAI(userId: number) {
  const now = Date.now();
  const recent = (aiCalls.get(userId) ?? []).filter((t) => now - t < 3_600_000);
  if (recent.length >= AI_PER_HOUR) return false;
  aiCalls.set(userId, [...recent, now]);
  return true;
}

export async function planAssistant(_prev: AssistantState, formData: FormData): Promise<AssistantState> {
  const text = String(formData.get("text") ?? "").trim().slice(0, 500);
  if (text.length < 3) return { text, error: "Décrivez un plat ou une liste de produits." };

  const catalog = await db.product.findMany({
    where: { active: true, listed: true },
    select: { id: true, slug: true, name: true, aliases: true, priceCents: true, imageUrl: true, category: { select: { name: true, emoji: true } } },
    orderBy: { name: "asc" },
  });

  // L'IA est réservée aux clients connectés ; les visiteurs utilisent les recettes intégrées
  const user = await getCurrentUser();
  const plan = await planFromText(text, catalog, Boolean(user && allowAI(user.id)));

  const byId = new Map(catalog.map((p) => [p.id, p]));
  const products = plan.items.flatMap((it) => {
    const p = byId.get(it.productId);
    return p
      ? [{ id: p.id, slug: p.slug, name: p.name, priceCents: p.priceCents, imageUrl: p.imageUrl, emoji: p.category.emoji, quantity: it.quantity, note: it.note }]
      : [];
  });
  return { text, plan: { title: plan.title, intro: plan.intro, source: plan.source, missing: plan.missing, pantry: plan.pantry, products } };
}

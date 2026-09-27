import "server-only";
import { db } from "./db";
import { taxesEnabled } from "./env";
import { computeTotals } from "./pricing";
import { getStripe } from "./stripe";
import { formatMoney } from "./money";
import { ITEM_STATUS_LABELS } from "./orders";
import { mailOrderCancelled, mailOrderConfirmed, mailOrderPurchased } from "./email";

const withItems = { items: true } as const;

export async function logEvent(orderId: number, message: string) {
  await db.orderEvent.create({ data: { orderId, message } });
}

/** Paiement autorisé (Stripe ou démo) : la commande devient "Nouvelle". Idempotent. */
export async function markAuthorized(orderId: number, paymentIntentId: string | null) {
  const updated = await db.order.updateMany({
    where: { id: orderId, status: "PENDING_PAYMENT" },
    data: {
      status: "NEW",
      paymentStatus: paymentIntentId ? "AUTHORIZED" : "SIMULATED_AUTHORIZED",
      stripePaymentIntentId: paymentIntentId,
    },
  });
  if (updated.count === 0) return; // déjà traité (webhook + page de retour)
  const order = await db.order.findUniqueOrThrow({ where: { id: orderId }, include: withItems });
  await logEvent(orderId, `Paiement autorisé : ${formatMoney(order.totalCents)}`);
  await mailOrderConfirmed(order);
}

/** Calcule le montant final à partir des articles réellement achetés. */
export function finalTotalsFor(order: {
  province: string;
  shippingCents: number;
  totalCents: number;
  items: { unitPriceCents: number; quantity: number; status: string }[];
}) {
  const bought = order.items.filter((i) => i.status === "BOUGHT");
  // On garde les frais de port d'origine : le montant final ne dépasse jamais l'autorisation.
  const totals = computeTotals(bought, order.province, taxesEnabled(), order.shippingCents);
  return { ...totals, totalCents: Math.min(totals.totalCents, order.totalCents), boughtCount: bought.length };
}

/** Encaisse le montant réel une fois les achats faits. */
export async function captureOrder(orderId: number) {
  const order = await db.order.findUniqueOrThrow({ where: { id: orderId }, include: withItems });
  if (!["NEW", "SHOPPING"].includes(order.status)) throw new Error("Commande déjà traitée.");
  if (order.items.some((i) => i.status === "PENDING"))
    throw new Error("Marquez chaque article comme acheté ou indisponible avant d'encaisser.");

  const final = finalTotalsFor(order);
  if (final.boughtCount === 0) return cancelOrder(orderId, "Aucun article disponible");

  if (order.paymentStatus === "AUTHORIZED" && order.stripePaymentIntentId) {
    await getStripe().paymentIntents.capture(order.stripePaymentIntentId, {
      amount_to_capture: final.totalCents,
    });
  }
  const updated = await db.order.update({
    where: { id: orderId },
    data: {
      status: "PURCHASED",
      paymentStatus: order.paymentStatus === "AUTHORIZED" ? "CAPTURED" : "SIMULATED_CAPTURED",
      finalCents: final.totalCents,
      taxCents: final.taxCents,
    },
    include: withItems,
  });
  await logEvent(orderId, `Montant final encaissé : ${formatMoney(final.totalCents)}`);
  await mailOrderPurchased(updated);
}

/** Annule la commande et libère l'autorisation sur la carte. */
export async function cancelOrder(orderId: number, reason: string) {
  const order = await db.order.findUniqueOrThrow({ where: { id: orderId }, include: withItems });
  if (["SHIPPED", "DELIVERED", "CANCELLED"].includes(order.status))
    throw new Error("Cette commande ne peut plus être annulée.");
  if (order.paymentStatus === "CAPTURED")
    throw new Error("Le paiement est déjà encaissé : remboursez-le depuis le tableau de bord Stripe.");

  if (order.paymentStatus === "AUTHORIZED" && order.stripePaymentIntentId) {
    await getStripe().paymentIntents.cancel(order.stripePaymentIntentId);
  }
  await db.order.update({
    where: { id: orderId },
    data: { status: "CANCELLED", paymentStatus: order.paymentStatus === "PENDING" ? "PENDING" : "CANCELED" },
  });
  await logEvent(orderId, `Commande annulée : ${reason}`);
  if (order.status !== "PENDING_PAYMENT") await mailOrderCancelled(order);
}

const ITEM_STATUSES = ["PENDING", "BOUGHT", "UNAVAILABLE"];

/** Change le statut d'articles (utilisé aussi par la liste d'achat). */
export async function setItemsStatus(itemIds: number[], status: string) {
  if (!ITEM_STATUSES.includes(status)) throw new Error("Statut invalide");
  const items = await db.orderItem.findMany({
    where: { id: { in: itemIds }, order: { status: { in: ["NEW", "SHOPPING"] } } },
  });
  if (items.length === 0) return;
  await db.orderItem.updateMany({ where: { id: { in: items.map((i) => i.id) } }, data: { status } });
  const orderIds = [...new Set(items.map((i) => i.orderId))];
  // Dès qu'on commence à cocher, la commande passe « Achat en cours »
  await db.order.updateMany({ where: { id: { in: orderIds }, status: "NEW" }, data: { status: "SHOPPING" } });
  for (const it of items) await logEvent(it.orderId, `${it.name} : ${ITEM_STATUS_LABELS[status]}`);
}

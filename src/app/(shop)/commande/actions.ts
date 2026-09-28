"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { MIN_ORDER_CENTS, SHIPPING } from "@/lib/config";
import { siteUrl, stripeEnabled, taxesEnabled } from "@/lib/env";
import { formatMoney } from "@/lib/money";
import { computeTotals } from "@/lib/pricing";
import { getStripe } from "@/lib/stripe";
import { markAuthorized } from "@/lib/order-service";
import { orderNumber } from "@/lib/orders";
import { getCurrentUser } from "@/lib/customer-auth";

const schema = z.object({
  email: z.string().trim().email("Courriel invalide"),
  name: z.string().trim().min(2, "Nom requis"),
  phone: z.string().trim().max(30).default(""),
  address1: z.string().trim().min(3, "Adresse requise"),
  address2: z.string().trim().max(100).default(""),
  city: z.string().trim().min(2, "Ville requise"),
  province: z.enum(SHIPPING.provinces, { message: "Province non desservie" }),
  postalCode: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]\d[A-Z] ?\d[A-Z]\d$/, "Code postal invalide (ex. H2X 1Y4)")
    .transform((v) => `${v.replace(" ", "").slice(0, 3)} ${v.replace(" ", "").slice(3)}`),
  notes: z.string().trim().max(500).default(""),
  cart: z.string(),
});

const cartSchema = z
  .array(z.object({ productId: z.number().int(), quantity: z.number().int().min(1).max(99) }))
  .min(1, "Votre panier est vide.");

export type CheckoutState = { error?: string; values?: Record<string, string> };

export async function placeOrder(_prev: CheckoutState, formData: FormData): Promise<CheckoutState> {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion?suite=/commande");
  const raw: Record<string, string> = { ...(Object.fromEntries(formData) as Record<string, string>), email: user.email };
  const fail = (error: string): CheckoutState => ({ error, values: raw });
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return fail(parsed.error.issues[0].message);
  if (raw.consent !== "on") return fail("Vous devez accepter les conditions.");
  const { cart, ...customer } = parsed.data;

  let rawCart: unknown;
  try {
    rawCart = JSON.parse(cart);
  } catch {
    return fail("Panier invalide.");
  }
  const cartParsed = cartSchema.safeParse(rawCart);
  if (!cartParsed.success) return fail(cartParsed.error.issues[0].message);

  // Les prix viennent TOUJOURS de la base, jamais du navigateur
  const products = await db.product.findMany({
    where: { id: { in: cartParsed.data.map((l) => l.productId) }, active: true },
    include: { store: true },
  });
  const lines = cartParsed.data.flatMap((l) => {
    const p = products.find((x) => x.id === l.productId);
    return p ? [{ product: p, quantity: l.quantity, unitPriceCents: p.priceCents }] : [];
  });
  if (lines.length !== cartParsed.data.length)
    return fail("Certains produits ne sont plus disponibles. Veuillez rafraîchir votre panier.");

  const totals = computeTotals(lines, customer.province, taxesEnabled());
  if (totals.subtotalCents < MIN_ORDER_CENTS)
    return fail(`Le montant minimum de commande est de ${formatMoney(MIN_ORDER_CENTS)}.`);

  const order = await db.order.create({
    data: {
      ...customer,
      userId: user.id,
      subtotalCents: totals.subtotalCents,
      shippingCents: totals.shippingCents,
      taxCents: totals.taxCents,
      totalCents: totals.totalCents,
      items: {
        create: lines.map((l) => ({
          productId: l.product.id,
          name: l.product.name,
          storeName: l.product.store?.name ?? "",
          unitPriceCents: l.unitPriceCents,
          unitCostCents: l.product.costCents,
          quantity: l.quantity,
        })),
      },
    },
  });

  // Première commande : l'adresse devient l'adresse par défaut du profil
  if (!user.address1) {
    await db.user.update({
      where: { id: user.id },
      data: {
        address1: customer.address1,
        address2: customer.address2,
        city: customer.city,
        province: customer.province,
        postalCode: customer.postalCode,
        phone: user.phone || customer.phone,
      },
    });
  }

  // Les demandes spéciales dont le produit est commandé passent à « Commandé »
  await db.productRequest.updateMany({
    where: { productId: { in: lines.map((l) => l.product.id) }, status: "QUOTED" },
    data: { status: "ORDERED" },
  });

  // MODE DÉMO : pas de clé Stripe → on simule l'autorisation du paiement
  if (!stripeEnabled()) {
    await markAuthorized(order.id, null);
    redirect(`/commande/${order.publicId}?nouvelle=1`);
  }

  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    locale: "fr-CA",
    customer_email: customer.email,
    line_items: [
      ...lines.map((l) => ({
        quantity: l.quantity,
        price_data: { currency: "cad", unit_amount: l.unitPriceCents, product_data: { name: l.product.name } },
      })),
      ...(totals.shippingCents > 0
        ? [{ quantity: 1, price_data: { currency: "cad", unit_amount: totals.shippingCents, product_data: { name: "Livraison" } } }]
        : []),
      ...totals.taxes.map((t) => ({
        quantity: 1,
        price_data: { currency: "cad", unit_amount: t.cents, product_data: { name: t.label } },
      })),
    ],
    // Paiement en deux temps : la carte est autorisée, on encaisse après l'achat en boutique
    payment_intent_data: {
      capture_method: "manual",
      description: `Commande ${orderNumber(order.id)}`,
      metadata: { orderId: String(order.id) },
    },
    metadata: { orderId: String(order.id) },
    success_url: `${siteUrl()}/commande/${order.publicId}?nouvelle=1&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl()}/commande?annule=1`,
  });

  await db.order.update({ where: { id: order.id }, data: { stripeSessionId: session.id } });
  redirect(session.url!);
}

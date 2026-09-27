import "server-only";
import type Stripe from "stripe";
import { getStripe } from "./stripe";
import { markAuthorized } from "./order-service";

/** Vérifie une session Checkout et marque la commande comme autorisée si le paiement l'est. */
export async function syncCheckoutSession(session: Stripe.Checkout.Session | string) {
  const s =
    typeof session === "string"
      ? await getStripe().checkout.sessions.retrieve(session, { expand: ["payment_intent"] })
      : session;
  const orderId = Number(s.metadata?.orderId);
  if (!orderId || s.status !== "complete") return;
  const pi =
    typeof s.payment_intent === "string"
      ? await getStripe().paymentIntents.retrieve(s.payment_intent)
      : s.payment_intent;
  if (pi && pi.status === "requires_capture") await markAuthorized(orderId, pi.id);
}

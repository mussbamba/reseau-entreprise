import Stripe from "stripe";

let client: Stripe | null = null;

export function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY manquant");
  client ??= new Stripe(process.env.STRIPE_SECRET_KEY);
  return client;
}

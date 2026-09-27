export const siteUrl = () =>
  (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

export const taxesEnabled = () => process.env.TAXES_ENABLED === "true";

export const stripeEnabled = () => Boolean(process.env.STRIPE_SECRET_KEY);

import { SHIPPING } from "./config";

// Taux de taxe de vente par province (vendeur situé au Québec, inscrit à la TPS/TVQ).
// La TVQ ne s'applique qu'au Québec ; la TVH remplace la TPS dans les provinces harmonisées.
const TAX_RATES: Record<string, { label: string; rate: number }[]> = {
  QC: [
    { label: "TPS (5 %)", rate: 0.05 },
    { label: "TVQ (9,975 %)", rate: 0.09975 },
  ],
  ON: [{ label: "TVH (13 %)", rate: 0.13 }],
  NB: [{ label: "TVH (15 %)", rate: 0.15 }],
  NS: [{ label: "TVH (14 %)", rate: 0.14 }],
  PE: [{ label: "TVH (15 %)", rate: 0.15 }],
  NL: [{ label: "TVH (15 %)", rate: 0.15 }],
};
const DEFAULT_TAX = [{ label: "TPS (5 %)", rate: 0.05 }];

export type TaxLine = { label: string; cents: number };

export type Totals = {
  subtotalCents: number;
  shippingCents: number;
  taxes: TaxLine[];
  taxCents: number;
  totalCents: number;
};

export function shippingFor(province: string, subtotalCents: number): number {
  if (subtotalCents <= 0) return 0;
  if (subtotalCents >= SHIPPING.freeOverCents) return 0;
  return province === "QC" ? SHIPPING.quebecCents : SHIPPING.canadaCents;
}

export function computeTotals(
  lines: { unitPriceCents: number; quantity: number }[],
  province: string,
  taxesEnabled: boolean,
  shippingOverride?: number,
): Totals {
  const subtotalCents = lines.reduce((s, l) => s + l.unitPriceCents * l.quantity, 0);
  const shippingCents = shippingOverride ?? shippingFor(province, subtotalCents);
  const taxable = subtotalCents + shippingCents;
  const taxes: TaxLine[] = taxesEnabled
    ? (TAX_RATES[province] ?? DEFAULT_TAX).map((t) => ({
        label: t.label,
        cents: Math.round(taxable * t.rate),
      }))
    : [];
  const taxCents = taxes.reduce((s, t) => s + t.cents, 0);
  return { subtotalCents, shippingCents, taxes, taxCents, totalCents: taxable + taxCents };
}

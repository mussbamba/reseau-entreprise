const fmt = new Intl.NumberFormat("fr-CA", { style: "currency", currency: "CAD" });

export function formatMoney(cents: number): string {
  return fmt.format(cents / 100);
}

export function parseMoneyToCents(input: string): number {
  const n = Number(String(input).replace(",", ".").replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
}

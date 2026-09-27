import { formatMoney } from "@/lib/money";

/** Prix façon marketplace : dollars en grand, cents en exposant. */
export function Price({ cents, size = "md" }: { cents: number; size?: "sm" | "md" | "lg" }) {
  const [d, c] = (cents / 100).toFixed(2).split(".");
  const big = { sm: "text-lg", md: "text-2xl", lg: "text-3xl" }[size];
  return (
    <span className="inline-flex items-start leading-none tabular-nums" aria-label={formatMoney(cents)}>
      <span className={big}>{d}</span>
      <span className="mt-0.5 text-xs">,{c}</span>
      <span className="ml-1 mt-0.5 text-xs">$</span>
    </span>
  );
}

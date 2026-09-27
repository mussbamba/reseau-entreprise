import { STATUS_COLORS, STATUS_LABELS } from "@/lib/orders";

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLORS[status] ?? ""}`}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

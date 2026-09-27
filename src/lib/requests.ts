export const REQUEST_STATUS: Record<string, { label: string; color: string }> = {
  PENDING: { label: "En attente de prix", color: "bg-sky-100 text-sky-800" },
  QUOTED: { label: "Prix envoyé", color: "bg-violet-100 text-violet-700" },
  ORDERED: { label: "Commandé", color: "bg-emerald-100 text-emerald-800" },
  DECLINED: { label: "Refusé par le client", color: "bg-slate-100 text-slate-700" },
  UNAVAILABLE: { label: "Introuvable", color: "bg-rose-100 text-rose-800" },
};

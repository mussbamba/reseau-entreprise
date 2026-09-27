export const ORDER_STATUSES = [
  "PENDING_PAYMENT",
  "NEW",
  "SHOPPING",
  "PURCHASED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const STATUS_LABELS: Record<string, string> = {
  PENDING_PAYMENT: "En attente de paiement",
  NEW: "Nouvelle",
  SHOPPING: "Achat en cours",
  PURCHASED: "Achetée",
  SHIPPED: "Expédiée",
  DELIVERED: "Livrée",
  CANCELLED: "Annulée",
};

export const STATUS_COLORS: Record<string, string> = {
  PENDING_PAYMENT: "bg-slate-100 text-slate-700",
  NEW: "bg-sky-100 text-sky-800",
  SHOPPING: "bg-violet-100 text-violet-700",
  PURCHASED: "bg-violet-100 text-violet-800",
  SHIPPED: "bg-emerald-100 text-emerald-800",
  DELIVERED: "bg-green-200 text-green-900",
  CANCELLED: "bg-rose-100 text-rose-800",
};

export const PAYMENT_LABELS: Record<string, string> = {
  PENDING: "Non payé",
  AUTHORIZED: "Autorisé (non débité)",
  CAPTURED: "Encaissé",
  CANCELED: "Autorisation annulée",
  SIMULATED_AUTHORIZED: "Autorisé (démo)",
  SIMULATED_CAPTURED: "Encaissé (démo)",
};

// Étapes montrées au client sur sa page de suivi
export const CUSTOMER_STEPS: { status: OrderStatus; label: string; hint: string }[] = [
  { status: "NEW", label: "Commande reçue", hint: "Votre carte est autorisée, pas encore débitée." },
  { status: "SHOPPING", label: "Achat en boutique", hint: "Nous allons chercher vos produits." },
  { status: "PURCHASED", label: "Produits achetés", hint: "Le montant final a été débité." },
  { status: "SHIPPED", label: "Expédiée", hint: "Votre colis est en route." },
  { status: "DELIVERED", label: "Livrée", hint: "Bon appétit !" },
];

export const ITEM_STATUS_LABELS: Record<string, string> = {
  PENDING: "À acheter",
  BOUGHT: "Acheté",
  UNAVAILABLE: "Indisponible",
};

export function orderNumber(id: number): string {
  return `CMD-${String(id).padStart(5, "0")}`;
}

export function parseOrderNumber(input: string): number | null {
  const m = input.trim().toUpperCase().match(/^(?:CMD-?)?0*(\d+)$/);
  return m ? Number(m[1]) : null;
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { mailOrderShipped } from "@/lib/email";
import { cancelOrder, captureOrder, logEvent, setItemsStatus } from "@/lib/order-service";

function back(orderId: number, error?: string): never {
  redirect(`/admin/commandes/${orderId}${error ? `?erreur=${encodeURIComponent(error)}` : ""}`);
}

export async function updateItem(formData: FormData) {
  await requireAdmin();
  const orderId = Number(formData.get("orderId"));
  await setItemsStatus([Number(formData.get("itemId"))], String(formData.get("status")));
  revalidatePath(`/admin/commandes/${orderId}`);
}

export async function markAll(formData: FormData) {
  await requireAdmin();
  const orderId = Number(formData.get("orderId"));
  const items = await db.orderItem.findMany({ where: { orderId, status: "PENDING" } });
  await setItemsStatus(items.map((i) => i.id), "BOUGHT");
  revalidatePath(`/admin/commandes/${orderId}`);
}

export async function capture(formData: FormData) {
  await requireAdmin();
  const orderId = Number(formData.get("orderId"));
  try {
    await captureOrder(orderId);
  } catch (e) {
    back(orderId, e instanceof Error ? e.message : "Erreur lors de l'encaissement");
  }
  back(orderId);
}

export async function ship(formData: FormData) {
  await requireAdmin();
  const orderId = Number(formData.get("orderId"));
  const carrier = String(formData.get("carrier") ?? "").trim();
  const trackingNumber = String(formData.get("trackingNumber") ?? "").trim();
  const order = await db.order.findUniqueOrThrow({ where: { id: orderId } });
  if (order.status !== "PURCHASED") back(orderId, "Encaissez la commande avant de l'expédier.");
  const updated = await db.order.update({
    where: { id: orderId },
    data: { status: "SHIPPED", carrier, trackingNumber },
    include: { items: true },
  });
  await logEvent(orderId, `Expédiée${trackingNumber ? ` (${carrier} ${trackingNumber})` : ""}`);
  await mailOrderShipped(updated);
  back(orderId);
}

export async function markDelivered(formData: FormData) {
  await requireAdmin();
  const orderId = Number(formData.get("orderId"));
  await db.order.updateMany({ where: { id: orderId, status: "SHIPPED" }, data: { status: "DELIVERED" } });
  await logEvent(orderId, "Livrée");
  back(orderId);
}

export async function cancel(formData: FormData) {
  await requireAdmin();
  const orderId = Number(formData.get("orderId"));
  try {
    await cancelOrder(orderId, String(formData.get("reason") || "annulée par l'administrateur"));
  } catch (e) {
    back(orderId, e instanceof Error ? e.message : "Erreur lors de l'annulation");
  }
  back(orderId);
}

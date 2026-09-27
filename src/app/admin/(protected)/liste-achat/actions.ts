"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { setItemsStatus } from "@/lib/order-service";

export async function markGroup(formData: FormData) {
  await requireAdmin();
  const ids = String(formData.get("itemIds") ?? "")
    .split(",")
    .map(Number)
    .filter(Boolean);
  await setItemsStatus(ids, String(formData.get("status")));
  revalidatePath("/admin/liste-achat");
}

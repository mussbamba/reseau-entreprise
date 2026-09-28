"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { mailRequestReceived } from "@/lib/email";
import { getCurrentUser } from "@/lib/customer-auth";
import { parseMoneyToCents } from "@/lib/money";

const MAX_PHOTO_LENGTH = 400_000; // ~300 Ko d'image

const schema = z.object({
  name: z.string().trim().min(2, "Indiquez le produit recherché.").max(120),
  details: z.string().trim().max(500).default(""),
  quantity: z.coerce.number().int().min(1, "Quantité invalide.").max(50, "Maximum 50 unités."),
  maxPrice: z.string().default(""),
  customerName: z.string().trim().min(2, "Indiquez votre nom.").max(80),
  email: z.string().trim().email("Indiquez un courriel valide pour recevoir le prix."),
  phone: z.string().trim().max(30).default(""),
  photo: z
    .string()
    .max(MAX_PHOTO_LENGTH, "Photo trop lourde.")
    .refine((v) => v === "" || v.startsWith("data:image/jpeg;base64,"), "Photo invalide.")
    .default(""),
});

export type RequestState = { error?: string; values?: Record<string, string> };

export async function createRequest(_prev: RequestState, formData: FormData): Promise<RequestState> {
  const raw = Object.fromEntries(formData) as Record<string, string>;
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    // La photo reste dans le formulaire côté navigateur : inutile de la renvoyer
    const values = { ...raw, photo: "" };
    return { error: parsed.error.issues[0].message, values };
  }
  const { maxPrice, ...data } = parsed.data;
  const user = await getCurrentUser();
  const request = await db.productRequest.create({
    data: { ...data, maxPriceCents: parseMoneyToCents(maxPrice) || null, userId: user?.id ?? null },
  });
  await mailRequestReceived({ ...request });
  redirect(`/demande/${request.publicId}?nouvelle=1`);
}

export async function declineQuote(formData: FormData) {
  const publicId = String(formData.get("publicId"));
  await db.productRequest.updateMany({ where: { publicId, status: "QUOTED" }, data: { status: "DECLINED" } });
  redirect(`/demande/${publicId}`);
}

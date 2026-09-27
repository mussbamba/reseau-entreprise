import "server-only";
import { SHOP } from "./config";
import { siteUrl } from "./env";
import { formatMoney } from "./money";
import { orderNumber } from "./orders";

type Mail = { to: string; subject: string; text: string };

export async function sendEmail({ to, subject, text }: Mail) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.log(`\n📧 [courriel simulé] À : ${to}\nObjet : ${subject}\n${text}\n`);
    return;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || `${SHOP.name} <onboarding@resend.dev>`,
        to,
        subject,
        text,
      }),
    });
    if (!res.ok) console.error("Échec d'envoi du courriel", res.status, await res.text());
  } catch (e) {
    // Un courriel raté ne doit jamais bloquer une commande
    console.error("Échec d'envoi du courriel", e);
  }
}

type OrderForMail = {
  id: number;
  publicId: string;
  email: string;
  name: string;
  totalCents: number;
  finalCents: number | null;
  carrier: string;
  trackingNumber: string;
  items: { name: string; quantity: number; unitPriceCents: number; status: string }[];
};

const link = (o: OrderForMail) => `${siteUrl()}/commande/${o.publicId}`;
const sign = `\n\nMerci de votre confiance,\nL'équipe ${SHOP.name}`;

export function mailOrderConfirmed(o: OrderForMail) {
  const lines = o.items.map((i) => `- ${i.quantity} × ${i.name}`).join("\n");
  const admin = process.env.ADMIN_EMAIL;
  if (admin) {
    void sendEmail({
      to: admin,
      subject: `Nouvelle commande ${orderNumber(o.id)} (${formatMoney(o.totalCents)})`,
      text: `${o.name} <${o.email}>\n\n${lines}\n\n${siteUrl()}/admin/commandes/${o.id}`,
    });
  }
  return sendEmail({
    to: o.email,
    subject: `Commande ${orderNumber(o.id)} reçue`,
    text:
      `Bonjour ${o.name},\n\nNous avons bien reçu votre commande ${orderNumber(o.id)} :\n${lines}\n\n` +
      `Montant autorisé : ${formatMoney(o.totalCents)}.\n` +
      `Votre carte n'est PAS encore débitée : nous encaisserons le montant réel une fois vos produits achetés en boutique ` +
      `(les articles introuvables ne vous seront pas facturés).\n\n${SHOP.purchaseSchedule}\n\nSuivre ma commande : ${link(o)}` +
      sign,
  });
}

export function mailOrderPurchased(o: OrderForMail) {
  const unavailable = o.items.filter((i) => i.status === "UNAVAILABLE");
  const note = unavailable.length
    ? `\n\nArticles introuvables (non facturés) :\n${unavailable.map((i) => `- ${i.quantity} × ${i.name}`).join("\n")}`
    : "";
  return sendEmail({
    to: o.email,
    subject: `Commande ${orderNumber(o.id)} : vos produits sont achetés`,
    text:
      `Bonjour ${o.name},\n\nBonne nouvelle, nous avons acheté vos produits !` +
      `\nMontant final débité : ${formatMoney(o.finalCents ?? 0)}.${note}\n\n` +
      `Nous préparons maintenant votre colis.\n\nSuivre ma commande : ${link(o)}` +
      sign,
  });
}

export function mailOrderShipped(o: OrderForMail) {
  const tracking = o.trackingNumber
    ? `\nTransporteur : ${o.carrier || "—"}\nNuméro de suivi : ${o.trackingNumber}`
    : "";
  return sendEmail({
    to: o.email,
    subject: `Commande ${orderNumber(o.id)} expédiée`,
    text: `Bonjour ${o.name},\n\nVotre colis est en route !${tracking}\n\nSuivre ma commande : ${link(o)}` + sign,
  });
}

export function mailOrderCancelled(o: OrderForMail) {
  return sendEmail({
    to: o.email,
    subject: `Commande ${orderNumber(o.id)} annulée`,
    text:
      `Bonjour ${o.name},\n\nNous sommes désolés : votre commande ${orderNumber(o.id)} a été annulée. ` +
      `Aucun montant n'a été débité de votre carte (l'autorisation a été libérée).` +
      sign,
  });
}

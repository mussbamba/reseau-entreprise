import "server-only";
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "./db";

const COOKIE = "client_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 jours

function secret(): string {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET manquant");
  return s;
}

function sign(value: string): string {
  return createHmac("sha256", secret()).update(`client:${value}`).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

/** Mot de passe haché avec scrypt et un sel unique : "sel:hachage". */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  return safeEqual(scryptSync(password, salt, 64).toString("hex"), hash);
}

export async function startCustomerSession(userId: number) {
  const expires = Date.now() + MAX_AGE * 1000;
  const value = `${userId}.${expires}`;
  (await cookies()).set(COOKIE, `${value}.${sign(value)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: MAX_AGE,
    path: "/",
  });
}

export async function endCustomerSession() {
  (await cookies()).delete(COOKIE);
}

export async function getCurrentUser() {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return null;
  const [id, expires, sig] = raw.split(".");
  if (!id || !expires || !sig || !safeEqual(sig, sign(`${id}.${expires}`))) return null;
  if (Number(expires) < Date.now()) return null;
  const user = await db.user.findUnique({
    where: { id: Number(id) },
    select: { id: true, email: true, name: true, phone: true, disabled: true },
  });
  // Un compte bloqué perd immédiatement sa session
  return user && !user.disabled ? user : null;
}

export async function requireUser(next: string) {
  const user = await getCurrentUser();
  if (!user) redirect(`/connexion?suite=${encodeURIComponent(next)}`);
  return user;
}

/** N'accepte que les redirections internes (évite les redirections vers un autre site). */
export function safeNext(next: unknown): string {
  const n = typeof next === "string" ? next : "";
  return n.startsWith("/") && !n.startsWith("//") ? n : "/compte";
}

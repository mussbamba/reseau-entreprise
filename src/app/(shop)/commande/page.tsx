import Link from "next/link";
import { getCurrentUser } from "@/lib/customer-auth";
import { stripeEnabled, taxesEnabled } from "@/lib/env";
import { CheckoutForm } from "./CheckoutForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Commande" };

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ annule?: string }> }) {
  const { annule } = await searchParams;
  const user = await getCurrentUser();
  return (
    <div>
      <h1 className="text-3xl font-extrabold">Finaliser la commande</h1>
      {annule && (
        <p className="mt-4 rounded-lg bg-sky-50 p-3 text-sm text-sky-900">
          Le paiement a été annulé. Votre panier est toujours là, vous pouvez réessayer.
        </p>
      )}
      {!user && (
        <p className="mt-4 rounded-md border border-[#d5d9d9] bg-white p-3 text-sm">
          Déjà client ?{" "}
          <Link href="/connexion?suite=/commande" className="az-link font-semibold">Identifiez-vous</Link> pour retrouver vos
          commandes dans votre compte. Vous pouvez aussi commander sans compte.
        </p>
      )}
      <CheckoutForm
        taxesEnabled={taxesEnabled()}
        demoMode={!stripeEnabled()}
        user={user ? { name: user.name, email: user.email, phone: user.phone } : null}
      />
    </div>
  );
}

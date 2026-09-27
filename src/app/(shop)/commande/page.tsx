import { stripeEnabled, taxesEnabled } from "@/lib/env";
import { CheckoutForm } from "./CheckoutForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Commande" };

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ annule?: string }> }) {
  const { annule } = await searchParams;
  return (
    <div>
      <h1 className="text-3xl font-extrabold">Finaliser la commande</h1>
      {annule && (
        <p className="mt-4 rounded-lg bg-sky-50 p-3 text-sm text-sky-900">
          Le paiement a été annulé. Votre panier est toujours là, vous pouvez réessayer.
        </p>
      )}
      <CheckoutForm taxesEnabled={taxesEnabled()} demoMode={!stripeEnabled()} />
    </div>
  );
}

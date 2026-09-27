"use client";

import { useRouter } from "next/navigation";
import { useCart, type CartLine } from "./CartProvider";

/** Ajoute l'article puis va directement à la commande. */
export function BuyNowButton({ product }: { product: Omit<CartLine, "quantity"> }) {
  const { add } = useCart();
  const router = useRouter();
  return (
    <button
      type="button"
      className="az-orange w-full"
      onClick={() => {
        add(product, 1);
        router.push("/commande");
      }}
    >
      Acheter maintenant
    </button>
  );
}

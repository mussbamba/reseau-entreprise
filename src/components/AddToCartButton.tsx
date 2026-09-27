"use client";

import { useState } from "react";
import { useCart, type CartLine } from "./CartProvider";

export function AddToCartButton({
  product,
  withQuantity = false,
  quantity = 1,
  label = "Ajouter au panier",
  variant = "primary",
}: {
  product: Omit<CartLine, "quantity">;
  withQuantity?: boolean;
  quantity?: number;
  label?: string;
  variant?: "primary" | "amber" | "orange";
}) {
  const { add } = useCart();
  const [qty, setQty] = useState(quantity);
  const [added, setAdded] = useState(false);

  function onAdd() {
    add(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="flex items-center gap-2">
      {withQuantity && (
        <select
          aria-label="Quantité"
          className="rounded-lg border border-[#d5d9d9] bg-[#f0f2f2] px-2 py-2 text-sm shadow-[0_2px_5px_rgba(15,17,17,.15)]"
          value={qty}
          onChange={(e) => setQty(Number(e.target.value))}
        >
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <option key={n}>{n}</option>
          ))}
        </select>
      )}
      <button type="button" onClick={onAdd} className={`${variant === "amber" ? "az-yellow" : variant === "orange" ? "az-orange" : "btn-primary"} w-full`}>
        {added ? "✓ Ajouté" : label}
      </button>
    </div>
  );
}

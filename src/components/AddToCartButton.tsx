"use client";

import { useState } from "react";
import { useCart, type CartLine } from "./CartProvider";

export function AddToCartButton({
  product,
  withQuantity = false,
  quantity = 1,
  label = "Ajouter au panier",
}: {
  product: Omit<CartLine, "quantity">;
  withQuantity?: boolean;
  quantity?: number;
  label?: string;
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
          className="input w-20!"
          value={qty}
          onChange={(e) => setQty(Number(e.target.value))}
        >
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <option key={n}>{n}</option>
          ))}
        </select>
      )}
      <button type="button" onClick={onAdd} className="btn-primary w-full">
        {added ? "✓ Ajouté" : label}
      </button>
    </div>
  );
}

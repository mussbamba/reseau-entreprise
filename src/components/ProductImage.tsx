/* eslint-disable @next/next/no-img-element */

/**
 * Photo produit.
 * - "cover"   : remplit le cadre (petites vignettes du panier).
 * - "contain" : photo entière, jamais coupée, sur un fond flouté de la même photo (cartes).
 * - "natural" : le cadre prend la forme de la photo, hauteur limitée (fiche produit).
 */
export function ProductImage({
  imageUrl,
  emoji,
  name,
  className = "",
  fit = "contain",
}: {
  imageUrl: string;
  emoji: string;
  name: string;
  className?: string;
  fit?: "cover" | "contain" | "natural";
}) {
  if (!imageUrl)
    return (
      <div
        aria-hidden
        className={`flex items-center justify-center bg-[#f7f8f8] ${fit === "natural" ? "aspect-square" : ""} ${className}`}
      >
        <span className="product-float text-5xl">{emoji}</span>
      </div>
    );

  if (fit === "cover")
    return <img src={imageUrl} alt={name} className={`object-cover ${className}`} loading="lazy" />;

  if (fit === "natural")
    return (
      <div className={`relative overflow-hidden bg-slate-100 ${className}`}>
        <img src={imageUrl} alt="" aria-hidden className="absolute inset-0 h-full w-full scale-125 object-cover opacity-60 blur-2xl" />
        <img src={imageUrl} alt={name} className="relative mx-auto block max-h-[70vh] w-auto max-w-full object-contain" />
      </div>
    );

  // "contain" : photo flottante qui remplit toute la case, avec son ombre au sol
  const delay = { animationDelay: `-${(name.length * 37) % 55 / 10}s` };
  return (
    <div className={`relative overflow-hidden bg-[radial-gradient(90%_80%_at_50%_40%,#fff,#f1f3f3)] ${className}`}>
      <span className="product-float absolute inset-[5%_5%_11%] block" style={delay}>
        <img
          src={imageUrl}
          alt={name}
          loading="lazy"
          className="h-full w-full rounded-[10px] object-cover shadow-[0_14px_20px_-12px_rgba(15,23,42,.55),0_1px_3px_rgba(15,23,42,.12)]"
        />
      </span>
      <span aria-hidden className="product-float-shadow absolute bottom-[3.5%] left-[22%] right-[22%] h-[7%] rounded-[50%] bg-[radial-gradient(closest-side,rgba(15,23,42,.28),rgba(15,23,42,0))]" style={delay} />
    </div>
  );
}

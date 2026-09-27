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
        className={`flex items-center justify-center bg-gradient-to-br from-terre-100 to-amber-50 ${fit === "natural" ? "aspect-square" : ""} ${className}`}
      >
        <span className="text-5xl">{emoji}</span>
      </div>
    );

  if (fit === "cover")
    return <img src={imageUrl} alt={name} className={`object-cover ${className}`} loading="lazy" />;

  return (
    <div className={`relative overflow-hidden bg-stone-100 ${className}`}>
      <img
        src={imageUrl}
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full scale-125 object-cover opacity-60 blur-2xl"
      />
      <img
        src={imageUrl}
        alt={name}
        loading={fit === "natural" ? "eager" : "lazy"}
        className={
          fit === "natural"
            ? "relative mx-auto block max-h-[70vh] w-auto max-w-full object-contain"
            : "relative h-full w-full object-contain p-1"
        }
      />
    </div>
  );
}

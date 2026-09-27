/* eslint-disable @next/next/no-img-element */
export function ProductImage({
  imageUrl,
  emoji,
  name,
  className = "",
}: {
  imageUrl: string;
  emoji: string;
  name: string;
  className?: string;
}) {
  if (imageUrl)
    return <img src={imageUrl} alt={name} className={`object-cover ${className}`} loading="lazy" />;
  return (
    <div
      aria-hidden
      className={`flex items-center justify-center bg-gradient-to-br from-terre-100 to-amber-50 ${className}`}
    >
      <span className="text-5xl">{emoji}</span>
    </div>
  );
}

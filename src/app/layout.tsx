import type { Metadata } from "next";
import { SHOP } from "@/lib/config";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: `${SHOP.name} | Produits africains au Québec`, template: `%s | ${SHOP.name}` },
  description: SHOP.tagline,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr-CA">
      <body className="antialiased">{children}</body>
    </html>
  );
}

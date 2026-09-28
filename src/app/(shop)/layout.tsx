import { CartProvider } from "@/components/CartProvider";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BottomNav } from "@/components/BottomNav";
import { SPECIAL_CATEGORY } from "@/lib/config";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/customer-auth";

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  const categories = await db.category.findMany({
    where: { slug: { not: SPECIAL_CATEGORY.slug } },
    orderBy: { position: "asc" },
    select: { slug: true, name: true },
  });
  return (
    <CartProvider>
      <Header categories={categories} userName={user?.name.split(" ")[0] ?? null} />
      <main className="mx-auto min-h-[60vh] max-w-6xl px-4 py-6">{children}</main>
      <Footer />
      {/* espace pour la barre d'onglets du bas sur téléphone */}
      <div className="h-[calc(64px+env(safe-area-inset-bottom))] sm:hidden" />
      <BottomNav />
    </CartProvider>
  );
}

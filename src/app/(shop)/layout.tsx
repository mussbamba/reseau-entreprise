import { CartProvider } from "@/components/CartProvider";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SPECIAL_CATEGORY } from "@/lib/config";
import { db } from "@/lib/db";

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const categories = await db.category.findMany({
    where: { slug: { not: SPECIAL_CATEGORY.slug } },
    orderBy: { position: "asc" },
    select: { slug: true, name: true },
  });
  return (
    <CartProvider>
      <Header categories={categories} />
      <main className="mx-auto min-h-[60vh] max-w-6xl px-4 py-6">{children}</main>
      <Footer />
    </CartProvider>
  );
}

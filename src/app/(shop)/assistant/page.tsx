import Link from "next/link";
import { getCurrentUser } from "@/lib/customer-auth";
import { aiEnabled } from "@/lib/env";
import { AssistantClient } from "./AssistantClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Assistant cuisine" };

export default async function AssistantPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const user = await getCurrentUser();
  const ai = aiEnabled();
  return (
    <div className="mx-auto max-w-3xl">
      <section className="-mx-4 -mt-6 bg-gradient-to-br from-[#c9f2ec] via-[#e3f4ff] to-[#fdeef4] px-4 pb-6 pt-6 sm:mx-0 sm:mt-0 sm:rounded-lg sm:px-6">
        <p className="text-sm font-bold uppercase tracking-widest text-[#007185]">Assistant cuisine {ai && "· IA"}</p>
        <h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">Dites-nous ce que vous voulez cuisiner</h1>
        <p className="mt-1 text-[#565959]">
          Un plat, un repas de fête ou une simple liste : on remplit votre panier. Les noms de chez vous sont compris
          (pondu, zobo, garri, attiéké…).
        </p>
        {ai && !user && (
          <p className="mt-2 text-sm">
            <Link href="/connexion?next=/assistant" className="az-link font-semibold">Connectez-vous</Link> pour profiter de
            l&apos;assistant IA. Sans compte, les recettes classiques restent disponibles.
          </p>
        )}
      </section>
      <AssistantClient initialText={q.slice(0, 500)} />
    </div>
  );
}

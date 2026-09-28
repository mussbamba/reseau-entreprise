import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, safeNext } from "@/lib/customer-auth";
import { Logo } from "@/components/Logo";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "S'identifier" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ suite?: string }> }) {
  const { suite } = await searchParams;
  const next = safeNext(suite);
  if (await getCurrentUser()) redirect(next);

  return (
    <div className="-mx-4 -mt-6 flex flex-col items-center bg-white px-4 pb-12 pt-8 sm:mx-0 sm:mt-0 sm:rounded-md">
      <Logo className="h-12 w-12" />
      <div className="mt-4 w-full max-w-sm rounded-lg border border-[#d5d9d9] p-6">
        <h1 className="mb-4 text-2xl">S&apos;identifier</h1>
        <LoginForm suite={next} />
      </div>
      <div className="mt-6 w-full max-w-sm">
        <div className="flex items-center gap-3 text-xs text-[#565959]">
          <span className="h-px flex-1 bg-[#e7e7e7]" /> Nouveau client ? <span className="h-px flex-1 bg-[#e7e7e7]" />
        </div>
        <Link href={`/inscription?suite=${encodeURIComponent(next)}`} className="az-white mt-3 w-full">
          Créer votre compte Saveurs d&apos;Afrique
        </Link>
      </div>
    </div>
  );
}

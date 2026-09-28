import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, safeNext } from "@/lib/customer-auth";
import { Logo } from "@/components/Logo";
import { RegisterForm } from "./RegisterForm";

export const metadata = { title: "Créer un compte" };

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ suite?: string }> }) {
  const { suite } = await searchParams;
  const next = safeNext(suite);
  if (await getCurrentUser()) redirect(next);

  return (
    <div className="-mx-4 -mt-6 flex flex-col items-center bg-white px-4 pb-12 pt-8 sm:mx-0 sm:mt-0 sm:rounded-md">
      <Logo className="h-12 w-12" />
      <div className="mt-4 w-full max-w-sm rounded-lg border border-[#d5d9d9] p-6">
        <h1 className="mb-4 text-2xl">Créer un compte</h1>
        <RegisterForm suite={next} />
        <hr className="my-5 border-[#e7e7e7]" />
        <p className="text-sm">
          Vous avez déjà un compte ?{" "}
          <Link href={`/connexion?suite=${encodeURIComponent(next)}`} className="az-link">S&apos;identifier ›</Link>
        </p>
      </div>
    </div>
  );
}

import Link from "next/link";
import { requireUser } from "@/lib/customer-auth";
import { ProfileForms } from "./ProfileForms";

export const dynamic = "force-dynamic";
export const metadata = { title: "Votre profil", robots: { index: false } };

export default async function ProfilePage() {
  const user = await requireUser("/compte/profil");
  return (
    <div className="-mx-4 -mt-6 flex flex-col gap-3 sm:mx-0 sm:mt-0">
      <div className="bg-white px-4 py-3 sm:rounded-md">
        <Link href="/compte" className="az-link text-sm">Votre compte</Link> <span className="text-sm text-[#565959]">› Profil</span>
        <h1 className="mt-1 text-2xl">Votre profil</h1>
      </div>
      <ProfileForms
        profile={{
          name: user.name,
          email: user.email,
          phone: user.phone,
          address1: user.address1,
          address2: user.address2,
          city: user.city,
          province: user.province,
          postalCode: user.postalCode,
        }}
      />
    </div>
  );
}

import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { UpgradeFab } from "@/components/pricing/upgrade-fab";
import { getSession } from "@/lib/auth";
import HomePageContent from "@/app/(public)/home/page";

export default async function RootPage() {
  const session = await getSession();
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar session={session} />
      <main className="flex-1">
        <HomePageContent />
      </main>
      <Footer />
      <UpgradeFab session={session} />
    </div>
  );
}

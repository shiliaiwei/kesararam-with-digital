import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { getSession } from "@/lib/auth";
import { UpgradeFab } from "@/components/pricing/upgrade-fab";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar session={session} />
      <main className="flex-1">{children}</main>
      <Footer />
      <UpgradeFab session={session} />
    </div>
  );
}

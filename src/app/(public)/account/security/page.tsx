import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { TwoFactorSetup } from "@/components/account/two-factor-setup";

export const metadata: Metadata = {
    title: "Account Security — KWD",
    robots: { index: false, follow: false },
};

export default async function AccountSecurityPage() {
    const session = await getSession();
    if (!session) redirect("/login?redirect=/account/security");

    return (
        <div className="min-h-screen bg-[#f4f5f7] px-4 py-10">
            <div className="max-w-2xl mx-auto space-y-6">
                <div>
                    <h1 className="text-2xl font-black uppercase">Account Security</h1>
                    <p className="text-sm font-semibold text-zinc-500 mt-1">
                        Signed in as {session.name} · {session.role}
                    </p>
                </div>
                <TwoFactorSetup />
            </div>
        </div>
    );
}

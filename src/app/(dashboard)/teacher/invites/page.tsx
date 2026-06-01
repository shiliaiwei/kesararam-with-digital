import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Key } from "lucide-react";
import { getTeacherInviteCodes } from "@/app/actions/invites";
import { InvitesClient } from "./invites-client";

export const dynamic = "force-dynamic";

export default async function TeacherInvitesPage() {
  const session = await getSession();
  if (!session || (session.role !== "teacher" && session.role !== "admin")) {
    redirect("/login");
  }

  const res = await getTeacherInviteCodes();
  const codes = res.success && res.codes ? res.codes : [];

  // Serialize Date objects cleanly to match typescript client types
  const serializedCodes = codes.map((c) => ({
    id: c.id,
    code: c.code,
    isUsed: c.isUsed,
    usedAt: c.usedAt ? new Date(c.usedAt).toISOString() : null,
    createdAt: c.createdAt ? new Date(c.createdAt).toISOString() : new Date().toISOString(),
    usedByUsername: c.usedByUsername ?? null,
    usedByDisplayName: c.usedByDisplayName ?? null,
  }));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b-4 border-black pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 border-2 border-black bg-amber-400 flex items-center justify-center shadow-[2px_2px_0_#000]">
              <Key size={24} className="text-black" />
            </div>
            <div>
              <h1 className="text-4xl font-black uppercase tracking-tighter text-black leading-none">
                Invite Codes
              </h1>
              <p className="text-sm font-bold text-zinc-600 uppercase tracking-wide mt-1.5">
                Generate single-use verification keys to register and authorize your students
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Invites Table and Actions Container */}
      <InvitesClient initialCodes={serializedCodes} />
    </div>
  );
}

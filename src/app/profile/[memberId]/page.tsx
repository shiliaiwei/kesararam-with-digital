import { notFound } from "next/navigation";
import { verifyProfileToken } from "@/lib/signed-profile-url";
import { TEAM_MEMBERS } from "@/lib/team-data";

interface Props {
  params: Promise<{ memberId: string }>;
  searchParams: Promise<{ token?: string }>;
}

export default async function PublicProfilePage({ params, searchParams }: Props) {
  const { memberId } = await params;
  const { token } = await searchParams;

  const member = TEAM_MEMBERS.find((m) => m.id === memberId);
  if (!member) notFound();

  const tokenValid = token ? !!(await verifyProfileToken(token)) : false;

  // Always proxy through our API — use a fresh token-less proxy URL for public view
  // The image is always shown but still served through our proxy (no direct Cloudinary URL exposed)
  const imageProxyUrl = `/api/profile-image?memberId=${encodeURIComponent(memberId)}&imageUrl=${encodeURIComponent(member.imageUrl)}`;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-lg max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-800 to-blue-600 px-6 py-4 flex justify-between items-center">
          <span className="text-white font-bold">TECHNOVATION GIRLS 2026</span>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
            tokenValid ? "bg-green-400 text-green-900" : "bg-yellow-400 text-yellow-900"
          }`}>
            {tokenValid ? "✓ VERIFIED" : "PUBLIC VIEW"}
          </span>
        </div>

        {/* Profile */}
        <div className="p-6 text-center">
          {/* Image — always shown, download-protected */}
          <div
            className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden border-4 border-gray-200 relative"
            style={{ userSelect: "none", WebkitUserSelect: "none" } as React.CSSProperties}
          >
            {/* Transparent overlay blocks right-click save on the image area */}
            <div
              className="absolute inset-0 z-10"
              style={{ pointerEvents: "none" }}
              aria-hidden="true"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageProxyUrl}
              alt={member.name}
              className="w-full h-full object-cover pointer-events-none"
              draggable={false}
              style={{ userSelect: "none", WebkitUserSelect: "none" } as React.CSSProperties}
            />
          </div>

          <h1 className="text-2xl font-bold text-gray-900">{member.name}</h1>
          <p className="text-gray-500 text-sm mt-1">
            {member.role === "student" ? `Age ${member.age} · Junior Division` : member.specialty}
          </p>
          <p className="text-gray-400 text-xs mt-1">{member.location}</p>

          <div className="mt-4 bg-gray-50 rounded-lg p-4 text-left">
            <p className="text-xs font-bold text-gray-500 uppercase mb-2">VSID</p>
            <p className="font-mono text-sm text-gray-800">{member.vsid}</p>
            <p className="text-xs font-bold text-gray-500 uppercase mt-3 mb-2">PROGRAM</p>
            <p className="text-sm text-gray-700">{member.school}</p>
            <p className="text-xs font-bold text-gray-500 uppercase mt-3 mb-2">BIO</p>
            <p className="text-sm text-gray-700 leading-relaxed">{member.bio}</p>
          </div>

          {!tokenValid && (
            <p className="mt-4 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded p-2">
              Request a new signed link from the dashboard for verified access.
            </p>
          )}
        </div>

        <div className="border-t px-6 py-3 text-center text-xs text-gray-400">
          Kesararam With Digital · Siem Reap, Cambodia
        </div>
      </div>
    </div>
  );
}

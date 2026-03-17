import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ProfileEditor } from "@/components/profile/profile-editor";

export const dynamic = "force-dynamic";

export default async function StaffProfilePage() {
  const session = await getSession();
  if (!session || (session.role !== "staff" && session.role !== "admin")) {
    redirect("/login");
  }

  const [user] = await db.select().from(users).where(eq(users.id, session.id)).limit(1);
  if (!user) redirect("/login");

  return (
    <ProfileEditor
      userId={user.id}
      initialDisplayName={user.displayName ?? ""}
      initialEmail={user.email}
      initialAvatar={user.avatar ?? null}
      initialAvatarChangedAt={user.avatarChangedAt?.toISOString() ?? null}
    />
  );
}

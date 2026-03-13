import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Suspense } from "react";
import { StaffProfileTabs } from "@/components/profile/staff-profile-tabs";

export const dynamic = "force-dynamic";

export default async function AdminProfilePage() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login");

  let user:
    | {
        displayName: string | null;
        username: string;
        email: string;
        avatar: string | null;
        avatarChangedAt: Date | null;
        createdAt: Date;
      }
    | undefined;

  try {
    [user] = await db
      .select({
        displayName: users.displayName,
        username: users.username,
        email: users.email,
        avatar: users.avatar,
        avatarChangedAt: users.avatarChangedAt,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, session.id));
  } catch (err) {
    console.error("[admin profile] DB error:", err);
  }

  const name = user?.displayName ?? user?.username ?? session.name;

  return (
    <div className="p-6">
      <Suspense>
        <StaffProfileTabs
          role="admin"
          name={name}
          email={user?.email ?? session.email ?? ""}
          username={user?.username ?? ""}
          avatar={user?.avatar ?? null}
          avatarChangedAt={user?.avatarChangedAt?.toISOString() ?? null}
          createdAt={user?.createdAt?.toISOString() ?? new Date().toISOString()}
        />
      </Suspense>
    </div>
  );
}

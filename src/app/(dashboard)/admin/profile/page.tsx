import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Suspense } from "react";
import { StaffProfileTabs } from "@/components/profile/staff-profile-tabs";

export const dynamic = "force-dynamic";
type ProfileTab = "edit" | "info" | "settings";

function resolveTab(value: string | string[] | undefined): ProfileTab {
  const tab = Array.isArray(value) ? value[0] : value;
  return tab === "info" || tab === "settings" ? tab : "edit";
}

function ProfileSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-10 bg-gray-200 rounded w-48"></div>
      <div className="border-2 border-gray-300 bg-white p-5">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 bg-gray-300 rounded"></div>
          <div className="flex-1 space-y-2">
            <div className="h-6 bg-gray-300 rounded w-40"></div>
            <div className="h-4 bg-gray-300 rounded w-60"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function AdminProfilePage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string | string[] }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const activeTab = resolveTab(resolvedSearchParams?.tab);

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
      <Suspense fallback={<ProfileSkeleton />}>
        <StaffProfileTabs
          role="admin"
          activeTab={activeTab}
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

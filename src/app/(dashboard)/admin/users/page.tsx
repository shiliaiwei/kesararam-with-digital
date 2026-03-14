import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { desc } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UsersTable } from "./users-table";
import { SectionCards } from "@/components/section-cards";
import { DataTable } from "@/components/data-table";
import data from "@/app/dashboard/data.json";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login");

  let allUsers: {
    id: number;
    username: string;
    email: string;
    displayName: string | null;
    role: "student" | "teacher" | "admin";
    isActive: boolean;
    loginAttempts: number;
    createdAt: Date;
  }[] = [];

  try {
    allUsers = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        displayName: users.displayName,
        role: users.role,
        isActive: users.isActive,
        loginAttempts: users.loginAttempts,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt));
  } catch (err) {
    console.error("[admin users] DB error:", err);
  }

  return (
    <div className="flex flex-col gap-6 py-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Users</h1>
        <p className="text-muted-foreground">Manage all platform accounts.</p>
      </div>

      <SectionCards />

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            Search, filter, create, edit or remove user accounts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UsersTable initialUsers={allUsers} />
        </CardContent>
      </Card>

      <div className="px-4 lg:px-6">
        <DataTable data={data} />
      </div>
    </div>
  );
}

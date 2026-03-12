import { db } from "@/lib/db";
import { auditLogs, users } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const dynamic = "force-dynamic";

export default async function AdminLogsPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login");

  let logs: {
    id: number;
    action: string;
    entityType: string | null;
    entityId: number | null;
    ipAddress: string | null;
    createdAt: Date;
    userEmail: string | null;
    username: string | null;
  }[] = [];

  try {
    logs = await db
      .select({
        id: auditLogs.id,
        action: auditLogs.action,
        entityType: auditLogs.entityType,
        entityId: auditLogs.entityId,
        ipAddress: auditLogs.ipAddress,
        createdAt: auditLogs.createdAt,
        userEmail: users.email,
        username: users.username,
      })
      .from(auditLogs)
      .leftJoin(users, eq(auditLogs.userId, users.id))
      .orderBy(desc(auditLogs.createdAt))
      .limit(100);
  } catch (err) {
    console.error("[admin logs] DB error:", err);
  }

  return (
    <div className="flex flex-col gap-6 py-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Audit Logs</h1>
        <p className="text-muted-foreground">
          System activity and security events. Latest 100 entries.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
          <CardDescription>
            {logs.length} recent event{logs.length !== 1 ? "s" : ""}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead className="hidden md:table-cell">IP</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="font-medium text-sm">
                    {l.action}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {l.username ?? "—"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {l.entityType
                      ? `${l.entityType}${l.entityId ? ` #${l.entityId}` : ""}`
                      : "—"}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                    {l.ipAddress ?? "—"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(l.createdAt).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
              {logs.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground py-12 text-sm"
                  >
                    No audit logs yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

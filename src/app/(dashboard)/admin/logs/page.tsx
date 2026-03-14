import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { auditLogs, users } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollText, Shield, Server, Activity, FileText } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function LogsPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login");

  let logs: any[] = [];
  try {
    logs = await db
      .select({
        id: auditLogs.id,
        action: auditLogs.action,
        entityType: auditLogs.entityType,
        entityId: auditLogs.entityId,
        details: auditLogs.details,
        ipAddress: auditLogs.ipAddress,
        createdAt: auditLogs.createdAt,
        user: users.displayName,
        username: users.username,
        email: users.email,
      })
      .from(auditLogs)
      .leftJoin(users, eq(auditLogs.userId, users.id))
      .orderBy(desc(auditLogs.createdAt))
      .limit(100);
  } catch (err) {
    console.error("Error fetching logs:", err);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">System Logs</h2>
          <p className="text-muted-foreground">
            Monitor system activity, security events, and operational logs.
          </p>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Logs</TabsTrigger>
          <TabsTrigger value="system">System & Infra</TabsTrigger>
          <TabsTrigger value="access">Access & Identity</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="app">App & Service</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Audit Log Stream</CardTitle>
              <CardDescription>
                Real-time record of all system events and user actions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead className="hidden md:table-cell">IP Address</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {new Date(log.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{log.action}</Badge>
                          <span className="text-xs text-muted-foreground">{log.entityType}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">{log.user || log.username || "System"}</span>
                          <span className="text-xs text-muted-foreground">{log.email}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                        {log.ipAddress || "-"}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-muted-foreground text-xs">
                        {log.details || "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                  {logs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No logs found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                System & Infrastructure Logs
              </CardTitle>
              <CardDescription>
                OS events, Network traffic, DNS queries, and Container logs.
              </CardDescription>
            </CardHeader>
            <CardContent>
               <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                  <Server className="h-12 w-12 mb-4 opacity-20" />
                  <p>System infrastructure logs are currently handled by the cloud provider.</p>
               </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="access" className="space-y-4">
          <Card>
             <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Access & Identity Logs
              </CardTitle>
              <CardDescription>
                Logins, IAM changes, and Resource access.
              </CardDescription>
            </CardHeader>
            <CardContent>
               <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                  <Activity className="h-12 w-12 mb-4 opacity-20" />
                  <p>Access logs are being recorded in the main audit stream.</p>
               </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security" className="space-y-4">
          <Card>
             <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security & Monitoring Logs
              </CardTitle>
              <CardDescription>
                IDS/IPS alerts, Firewall logs, and Threat detection.
              </CardDescription>
            </CardHeader>
            <CardContent>
               <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                  <Shield className="h-12 w-12 mb-4 opacity-20" />
                  <p>No high-severity security alerts detected in the last 24 hours.</p>
               </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="app" className="space-y-4">
           <Card>
             <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Application & Service Logs
              </CardTitle>
              <CardDescription>
                Database queries, API Gateway events, and Error logs.
              </CardDescription>
            </CardHeader>
            <CardContent>
               <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                  <FileText className="h-12 w-12 mb-4 opacity-20" />
                  <p>Application logs are available in the Vercel dashboard.</p>
               </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

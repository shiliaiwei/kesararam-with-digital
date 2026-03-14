import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/lib/db";
import { sessions, quizzes } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTable } from "@/components/data-table";
import data from "@/app/dashboard/data.json";

export const dynamic = "force-dynamic";

const STATUS_VARIANT: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  waiting: "secondary",
  active: "default",
  paused: "outline",
  ended: "secondary",
};

export default async function TeacherSessionsPage() {
  const session = await getSession();
  if (!session || (session.role !== "teacher" && session.role !== "admin")) {
    redirect("/login");
  }

  const mySessions = await db
    .select({
      id: sessions.id,
      roomCode: sessions.roomCode,
      challengeType: sessions.challengeType,
      status: sessions.status,
      maxStudents: sessions.maxStudents,
      createdAt: sessions.createdAt,
      startedAt: sessions.startedAt,
      endedAt: sessions.endedAt,
      quizTitle: quizzes.title,
    })
    .from(sessions)
    .leftJoin(quizzes, eq(sessions.quizId, quizzes.id))
    .where(eq(sessions.teacherId, session.id))
    .orderBy(desc(sessions.createdAt))
    .limit(50);

  return (
    <div className="flex flex-col gap-6 py-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Sessions</h1>
        <p className="text-muted-foreground">
          Live quiz and play sessions you have run.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Session History</CardTitle>
          <CardDescription>
            {mySessions.length} session{mySessions.length !== 1 ? "s" : ""}{" "}
            total.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Room Code</TableHead>
                <TableHead>Quiz</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">
                  Max Students
                </TableHead>
                <TableHead className="hidden lg:table-cell">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mySessions.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <code className="bg-muted px-2 py-0.5 rounded text-sm font-mono tracking-widest">
                      {s.roomCode}
                    </code>
                  </TableCell>
                  <TableCell className="font-medium text-sm">
                    {s.quizTitle ?? "—"}
                  </TableCell>
                  <TableCell className="capitalize text-sm text-muted-foreground">
                    {s.challengeType}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={STATUS_VARIANT[s.status] ?? "secondary"}
                      className="capitalize"
                    >
                      {s.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                    {s.maxStudents}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                    {new Date(s.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
              {mySessions.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground py-12 text-sm"
                  >
                    No sessions yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="px-4 lg:px-6">
        <DataTable data={data} />
      </div>
    </div>
  );
}

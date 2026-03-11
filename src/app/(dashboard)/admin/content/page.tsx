import { db } from "@/lib/db";
import { contentItems } from "@/db/schema";
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
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const dynamic = "force-dynamic";

const CATEGORY_LABELS: Record<string, string> = {
  "road-sign": "Road Signs",
  "road-traffic": "Road Traffic",
  priority: "Priority",
  driving: "Driving",
  technical: "Technical",
  "loading-people-goods": "Loading",
  "general-knowledge": "General",
  emergency: "Emergency",
};

export default async function AdminContentPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login");

  const items = await db
    .select({
      id: contentItems.id,
      categorySlug: contentItems.categorySlug,
      type: contentItems.type,
      titleEn: contentItems.titleEn,
      isPublished: contentItems.isPublished,
      score: contentItems.score,
      createdAt: contentItems.createdAt,
    })
    .from(contentItems)
    .orderBy(desc(contentItems.createdAt));

  return (
    <div className="flex flex-col gap-6 py-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Content</h1>
        <p className="text-muted-foreground">
          All quiz questions and learning materials.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Content Items</CardTitle>
          <CardDescription>
            {items.length} item{items.length !== 1 ? "s" : ""} in the library.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden lg:table-cell">Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium max-w-56 truncate">
                    {item.titleEn}
                  </TableCell>
                  <TableCell>
                    <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
                      {CATEGORY_LABELS[item.categorySlug] ?? item.categorySlug}
                    </span>
                  </TableCell>
                  <TableCell className="capitalize text-sm text-muted-foreground">
                    {item.type}
                  </TableCell>
                  <TableCell className="text-sm">{item.score}</TableCell>
                  <TableCell>
                    <Badge variant={item.isPublished ? "default" : "secondary"}>
                      {item.isPublished ? "Published" : "Draft"}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
              {items.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground py-12 text-sm"
                  >
                    No content items yet. Add questions via the content API.
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

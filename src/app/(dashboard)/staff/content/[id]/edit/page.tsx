import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { contentItems } from "@/db/schema/content";
import { eq, and } from "drizzle-orm";
import { UniversalContentForm } from "@/components/staff/content/universal-content-form";

export const metadata: Metadata = {
  title: "Edit Content | Staff Dashboard",
  description: "Edit educational content",
};

export default async function EditContentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session?.user?.id || session.user.role !== "staff") {
    notFound();
  }

  const { id } = await params;
  const contentId = parseInt(id);

  const [content] = await db
    .select()
    .from(contentItems)
    .where(
      and(
        eq(contentItems.id, contentId),
        eq(contentItems.createdBy, session.user.id)
      )
    );

  if (!content) {
    notFound();
  }

  // Staff can only edit pending or rejected content
  if (content.status !== "pending" && content.status !== "rejected") {
    notFound();
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-black text-black mb-2">Edit Content</h1>
        <p className="text-zinc-600">Update your educational content</p>
        {content.status === "rejected" && (
          <div
            className="mt-4 bg-red-100 border-2 border-red-600 p-4"
            style={{ boxShadow: "2px 2px 0 #dc2626" }}
          >
            <p className="font-bold text-red-900">
              This content was rejected. Please review and update before
              resubmitting.
            </p>
          </div>
        )}
      </div>

      <UniversalContentForm initialData={content} />
    </div>
  );
}

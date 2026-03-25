import { Metadata } from "next";
import { ContentOverview } from "@/components/admin/content-overview";

export const metadata: Metadata = {
  title: "Content Management | Admin",
  description: "Manage all content categories",
};

export default function ContentPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-black">Content Management</h1>
        <p className="text-zinc-600">Overview of all content by category — public, under review, and drafts</p>
      </div>
      <ContentOverview />
    </div>
  );
}

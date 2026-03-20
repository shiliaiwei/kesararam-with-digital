import { Metadata } from "next";
import { ContentList } from "@/components/staff/content/content-list";

export const metadata: Metadata = {
  title: "My Content | Staff Dashboard",
  description: "Manage your educational content",
};

export default function StaffContentPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-black text-black mb-2">My Content</h1>
        <p className="text-zinc-600">
          Create, edit, and manage your educational content
        </p>
      </div>

      <ContentList />
    </div>
  );
}

import { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { MyTopicsList } from "@/components/staff/content/my-topics-list";

export const metadata: Metadata = {
  title: "My Content | Staff Dashboard",
  description: "Manage your educational content",
};

export default function StaffContentPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-black mb-2">My Content</h1>
          <p className="text-zinc-600">
            Create, edit, and manage your educational content
          </p>
        </div>
        <Link
          href="/staff/content/road-sign"
          className="bg-green-400 border-2 border-black px-6 py-3 font-black hover:shadow-[4px_4px_0_#000] transition-all inline-flex items-center gap-2"
        >
          <Plus size={20} />
          Create Content
        </Link>
      </div>

      <MyTopicsList />
    </div>
  );
}

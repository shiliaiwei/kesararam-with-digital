import { Metadata } from "next";
import { MyTopicsList } from "@/components/staff/content/my-topics-list";

export const metadata: Metadata = {
  title: "My Submissions | Staff Dashboard",
  description: "Track your content submissions and review status",
};

export default function StaffSubmissionsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-black text-black mb-2">My Submissions</h1>
        <p className="text-zinc-600">
          Track the status of your submitted content and see admin feedback
        </p>
      </div>

      <MyTopicsList />
    </div>
  );
}

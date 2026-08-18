import { Metadata } from "next";
import { Bell } from "lucide-react";

export const metadata: Metadata = {
  title: "Notification Settings | Kesararam With Digital",
  description: "Manage your notification preferences",
};

export default function NotificationsSettingsPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-black text-black mb-2 flex items-center gap-2">
          <Bell size={32} />
          Notification Settings
        </h1>
        <p className="text-zinc-600">
          Manage how and when you receive notifications
        </p>
      </div>

      <div
        className="bg-white border-2 border-black p-6"
        style={{ boxShadow: "4px 4px 0 #000" }}
      >
        <p className="text-zinc-600">
          Notification preferences are managed in the main Settings page.
        </p>
        <a
          href="/settings"
          className="inline-block mt-4 px-4 py-2 bg-blue-400 border-2 border-black font-bold text-sm hover:bg-blue-300"
        >
          Go to Settings
        </a>
      </div>
    </div>
  );
}

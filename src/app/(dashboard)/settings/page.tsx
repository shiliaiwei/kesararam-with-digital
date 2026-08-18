import { Metadata } from "next";
import { SettingsContent } from "@/components/settings/settings-content";

export const metadata: Metadata = {
  title: "Settings | Kesararam With Digital",
  description: "Manage your account settings and preferences",
};

export default function SettingsPage() {
  return <SettingsContent />;
}

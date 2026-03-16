import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { MediaManagement } from "./media-management";

export const dynamic = "force-dynamic";

export default async function AdminMediaPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    redirect("/login");
  }

  return <MediaManagement />;
}

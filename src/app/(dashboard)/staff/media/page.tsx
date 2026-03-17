import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { MediaManagement } from "@/app/(dashboard)/admin/media/media-management";

export const dynamic = "force-dynamic";

export default async function StaffMediaPage() {
  const session = await getSession();
  if (!session || (session.role !== "staff" && session.role !== "admin")) {
    redirect("/login");
  }
  return <MediaManagement />;
}

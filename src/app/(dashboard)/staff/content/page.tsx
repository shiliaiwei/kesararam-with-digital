import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { StaffContentManagement } from "./staff-content-management";

export const dynamic = "force-dynamic";

export default async function StaffContentPage() {
  const session = await getSession();
  if (!session || (session.role !== "staff" && session.role !== "admin")) {
    redirect("/login");
  }
  return <StaffContentManagement />;
}

import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ClaimsContent } from "./claims-content";

export const dynamic = "force-dynamic";

export default async function TeacherClaimsPage() {
  const session = await getSession();
  if (!session || (session.role !== "teacher" && session.role !== "admin")) {
    redirect("/login");
  }
  return <ClaimsContent />;
}

import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function StaffLayout({ children }: { children: ReactNode }) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role !== "staff" && session.role !== "admin") {
    redirect("/");
  }

  return <>{children}</>;
}

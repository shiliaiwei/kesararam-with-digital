import { redirect } from "next/navigation";

export default function AdminOverviewRedirect() {
  redirect("/admin/users");
}

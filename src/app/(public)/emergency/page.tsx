import type { Metadata } from "next";
import { CategoryPageShell } from "@/components/categories/category-page-shell";

export const metadata: Metadata = {
  title: "Emergency",
  description:
    "Emergency procedures, contacts, and protocols for road incidents.",
};

export default function EmergencyPage() {
  return (
    <CategoryPageShell
      slug="emergency"
      titleEn="Emergency"
      titleKh="ជំនួយបន្ទាន់"
      descEn="Emergency procedures, contact numbers, and protocols for handling road incidents. Know what to do in any urgent situation on Cambodian roads."
    />
  );
}

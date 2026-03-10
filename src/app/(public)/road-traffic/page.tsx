import type { Metadata } from "next";
import { CategoryPageShell } from "@/components/categories/category-page-shell";

export const metadata: Metadata = {
  title: "Road Traffic Law",
  description: "Study the legal framework governing road use in Cambodia.",
};

export default function RoadTrafficPage() {
  return (
    <CategoryPageShell
      slug="road-traffic"
      titleEn="Road Traffic Law"
      titleKh="ច្បាប់ចរាចរណ៍"
      descEn="Study the legal framework governing road use and the responsibilities of all road users. Covers law articles, case studies, and structured Q&A."
    />
  );
}

import type { Metadata } from "next";
import { CategoryPageShell } from "@/components/categories/category-page-shell";

export const metadata: Metadata = {
  title: "Cambodia Road Traffic Laws & Regulations",
  description: "Complete guide to Cambodian road traffic laws, speed limits, right-of-way, and legal driving regulations to pass your official theory exam.",
};

export default function RoadTrafficPage() {
  return (
    <CategoryPageShell
      slug="road-traffic"
      titleEn="Road Traffic Law"
      titleKh="ច្បាប់ចរាចរ"
      descEn="Study the legal framework governing road use and the responsibilities of all road users. Covers law articles, case studies, and structured Q&A."
    />
  );
}

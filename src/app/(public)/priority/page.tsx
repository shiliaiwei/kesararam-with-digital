import type { Metadata } from "next";
import { CategoryPageShell } from "@/components/categories/category-page-shell";

export const metadata: Metadata = {
  title: "Right-of-Way Priority Rules Cambodia",
  description: "Understand intersection priority and right-of-way rules in Cambodia. Vital practice questions for passing your official driving theory test.",
};

export default function PriorityPage() {
  return (
    <CategoryPageShell
      slug="priority"
      titleEn="Right of Way"
      titleKh="សិទ្ធិដំណើរ"
      descEn="Understand road priority rules through interactive scenarios and intersection diagrams. Learn who goes first and how to handle complex junctions safely."
    />
  );
}

import type { Metadata } from "next";
import { CategoryPageShell } from "@/components/categories/category-page-shell";

export const metadata: Metadata = {
  title: "Right of Way",
  description:
    "Understand priority rules and intersection handling in Cambodia.",
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

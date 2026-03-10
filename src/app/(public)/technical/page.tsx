import type { Metadata } from "next";
import { CategoryPageShell } from "@/components/categories/category-page-shell";

export const metadata: Metadata = {
  title: "Vehicle Technology",
  description:
    "Learn how vehicles work, safety systems, and maintenance basics.",
};

export default function TechnicalPage() {
  return (
    <CategoryPageShell
      slug="technical"
      titleEn="Vehicle Technology"
      titleKh="បច្ចេកវិទ្យាយានយន្ត"
      descEn="Educational content about how vehicles work, safety features, and routine maintenance knowledge essential for safe driving."
    />
  );
}

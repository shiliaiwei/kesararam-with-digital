import type { Metadata } from "next";
import { CategoryPageShell } from "@/components/categories/category-page-shell";

export const metadata: Metadata = {
  title: "Vehicle Technical Driving Guide Cambodia",
  description: "Pass your Cambodia license test by understanding vehicle mechanics, engine safety, and technical driving requirements for cars and motorcycles.",
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

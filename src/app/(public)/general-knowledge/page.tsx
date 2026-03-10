import type { Metadata } from "next";
import { CategoryPageShell } from "@/components/categories/category-page-shell";

export const metadata: Metadata = {
  title: "General Knowledge",
  description: "Essential road safety topics and broad driving knowledge.",
};

export default function GeneralKnowledgePage() {
  return (
    <CategoryPageShell
      slug="general-knowledge"
      titleEn="General Knowledge"
      titleKh="ចំណេះដឹងទូទៅ"
      descEn="Covers broad driving and road safety topics. Essential knowledge not covered by specific categories, including useful reference documents and links."
    />
  );
}

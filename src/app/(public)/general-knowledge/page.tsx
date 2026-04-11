import type { Metadata } from "next";
import { CategoryPageShell } from "@/components/categories/category-page-shell";

export const metadata: Metadata = {
  title: "Cambodia Driving Knowledge & Rules Test",
  description: "Master Cambodian general driving knowledge. Essential road safety strategies, rules, and reference materials for passing your theory test.",
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

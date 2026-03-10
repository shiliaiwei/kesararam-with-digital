import type { Metadata } from "next";
import { CategoryPageShell } from "@/components/categories/category-page-shell";

export const metadata: Metadata = {
  title: "Driving Skills",
  description:
    "Learn practical driving techniques and road safety best practices.",
};

export default function DrivingPage() {
  return (
    <CategoryPageShell
      slug="driving"
      titleEn="Driving Skills"
      titleKh="ជំនាញបើកបរ"
      descEn="Practical content to improve your driving technique. Covers manoeuvres, demonstrations, and a personal progress tracking system."
    />
  );
}

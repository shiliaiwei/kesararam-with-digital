import type { Metadata } from "next";
import { CategoryPageShell } from "@/components/categories/category-page-shell";

export const metadata: Metadata = {
  title: "Practical Driving Tips & Theory Cambodia",
  description: "Expert practical driving theory and techniques for navigating Cambodian roads safely. Improve your skills and pass the licensing exam easily.",
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

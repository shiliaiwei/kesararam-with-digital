import type { Metadata } from "next";
import { CategoryPageShell } from "@/components/categories/category-page-shell";
import { TrafficSignsGrid } from "@/components/traffic-signs/traffic-signs-grid";

export const metadata: Metadata = {
  title: "Traffic Signs Test Cambodia | Road Signs",
  description: "Practice Cambodian traffic signs and road markings. Master warning, regulatory, and information signs for your driving license theory exam.",
};

export default function RoadSignPage() {
  return (
    <CategoryPageShell
      slug="road-sign"
      titleEn="Traffic Signs"
      titleKh="សញ្ញាផ្លូវវិថី"
      descEn="Browse and learn all official road signs used in Cambodia. Each sign includes a description, what it means, and audio support in Khmer and English."
    >
      <TrafficSignsGrid />
    </CategoryPageShell>
  );
}

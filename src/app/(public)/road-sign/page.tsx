import type { Metadata } from "next";
import { CategoryPageShell } from "@/components/categories/category-page-shell";

export const metadata: Metadata = {
  title: "Traffic Signs",
  description: "Browse and learn all official road signs used in Cambodia.",
};

export default function RoadSignPage() {
  return (
    <CategoryPageShell
      slug="road-sign"
      titleEn="Traffic Signs"
      titleKh="ស្ញ្ញាផ្លូវវិថី"
      descEn="Browse and learn all official road signs used in Cambodia. Each sign includes a description, what it means, and audio support in Khmer and English."
    />
  );
}

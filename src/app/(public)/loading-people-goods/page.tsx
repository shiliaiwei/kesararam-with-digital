import type { Metadata } from "next";
import { CategoryPageShell } from "@/components/categories/category-page-shell";

export const metadata: Metadata = {
  title: "Vehicle Loading Laws in Cambodia",
  description: "Learn the legal requirements for loading passengers and transporting goods safely on Cambodian roads. Essential for commercial and private drivers.",
};

export default function LoadingPeopleGoodsPage() {
  return (
    <CategoryPageShell
      slug="loading-people-goods"
      titleEn="Loading People & Goods"
      titleKh="ការដឹកអ្នកដំណើរ & ទំនិញ"
      descEn="Information on the safe loading of passengers and cargo, legal weight limits, and national transport regulations."
    />
  );
}

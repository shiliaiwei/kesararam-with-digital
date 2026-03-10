import type { Metadata } from "next";
import { CategoryPageShell } from "@/components/categories/category-page-shell";

export const metadata: Metadata = {
  title: "Loading People & Goods",
  description: "Rules for safe transport of passengers and cargo in Cambodia.",
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

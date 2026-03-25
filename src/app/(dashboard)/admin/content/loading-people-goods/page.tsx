import { AdminCategoryManager } from "@/components/admin/admin-category-manager";

export default function Page() {
  return (
    <div className="p-6">
      <AdminCategoryManager categoryId={6} categoryName="Loading People & Goods" categorySlug="loading-people-goods" />
    </div>
  );
}

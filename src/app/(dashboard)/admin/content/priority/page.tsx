import { AdminCategoryManager } from "@/components/admin/admin-category-manager";

export default function Page() {
  return (
    <div className="p-6">
      <AdminCategoryManager categoryId={3} categoryName="Right of Way" categorySlug="priority" />
    </div>
  );
}

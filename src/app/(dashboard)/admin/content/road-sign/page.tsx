import { AdminCategoryManager } from "@/components/admin/admin-category-manager";

export default function Page() {
  return (
    <div className="p-6">
      <AdminCategoryManager categoryId={1} categoryName="Traffic Signs" categorySlug="road-sign" />
    </div>
  );
}

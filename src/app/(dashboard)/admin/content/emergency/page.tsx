import { AdminCategoryManager } from "@/components/admin/admin-category-manager";

export default function Page() {
  return (
    <div className="p-6">
      <AdminCategoryManager categoryId={8} categoryName="Emergency" categorySlug="emergency" />
    </div>
  );
}

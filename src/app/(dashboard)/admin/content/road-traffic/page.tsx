import { AdminCategoryManager } from "@/components/admin/admin-category-manager";

export default function Page() {
  return (
    <div className="p-6">
      <AdminCategoryManager categoryId={2} categoryName="Road Traffic Law" categorySlug="road-traffic" />
    </div>
  );
}

import { AdminCategoryManager } from "@/components/admin/admin-category-manager";

export default function Page() {
  return (
    <div className="p-6">
      <AdminCategoryManager categoryId={5} categoryName="Vehicle Technology" categorySlug="technical" />
    </div>
  );
}

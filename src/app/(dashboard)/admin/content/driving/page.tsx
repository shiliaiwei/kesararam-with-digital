import { AdminCategoryManager } from "@/components/admin/admin-category-manager";

export default function Page() {
  return (
    <div className="p-6">
      <AdminCategoryManager categoryId={4} categoryName="Driving Skills" categorySlug="driving" />
    </div>
  );
}

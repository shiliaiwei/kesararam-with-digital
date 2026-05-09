import { CategoryContentManager } from "@/components/staff/content/category-content-manager";

export default function EmergencyContentPage() {
  return (
    <CategoryContentManager
      categoryId={8}
      categoryName="Emergency"
      categorySlug="emergency"
      requiresImage={false}
      requiresAudio={true}
    />
  );
}

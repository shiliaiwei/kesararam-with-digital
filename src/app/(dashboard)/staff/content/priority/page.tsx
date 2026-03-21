import { CategoryContentManager } from "@/components/staff/content/category-content-manager";

export default function PriorityContentPage() {
  return (
    <CategoryContentManager
      categoryId={3}
      categoryName="Right of Way"
      categorySlug="priority"
      requiresImage={true}
      requiresAudio={false}
    />
  );
}

import { CategoryContentManager } from "@/components/staff/content/category-content-manager";

export default function DrivingContentPage() {
  return (
    <CategoryContentManager
      categoryId={4}
      categoryName="Driving Skills"
      categorySlug="driving"
      requiresImage={false}
      requiresAudio={false}
    />
  );
}

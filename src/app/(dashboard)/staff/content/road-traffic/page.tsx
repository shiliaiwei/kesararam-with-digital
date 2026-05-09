import { CategoryContentManager } from "@/components/staff/content/category-content-manager";

export default function RoadTrafficContentPage() {
  return (
    <CategoryContentManager
      categoryId={2}
      categoryName="Road Traffic Law"
      categorySlug="road-traffic"
      requiresImage={false}
      requiresAudio={false}
    />
  );
}

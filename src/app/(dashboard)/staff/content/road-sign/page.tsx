import { CategoryContentManager } from "@/components/staff/content/category-content-manager";

export default function RoadSignContentPage() {
  return (
    <CategoryContentManager
      categoryId={1}
      categoryName="Traffic Signs"
      categorySlug="road-sign"
      requiresImage={true}
      requiresAudio={true}
    />
  );
}

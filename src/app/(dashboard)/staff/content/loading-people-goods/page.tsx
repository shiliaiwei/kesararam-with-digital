import { CategoryContentManager } from "@/components/staff/content/category-content-manager";

export default function LoadingPeopleGoodsContentPage() {
  return (
    <CategoryContentManager
      categoryId={6}
      categoryName="Loading People & Goods"
      categorySlug="loading-people-goods"
      requiresImage={false}
      requiresAudio={false}
    />
  );
}

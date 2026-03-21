import { CategoryContentManager } from "@/components/staff/content/category-content-manager";

export default function TechnicalContentPage() {
  return (
    <CategoryContentManager
      categoryId={5}
      categoryName="Vehicle Technology"
      categorySlug="technical"
      requiresImage={false}
      requiresAudio={false}
    />
  );
}

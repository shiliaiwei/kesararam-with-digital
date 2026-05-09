import { CategoryContentManager } from "@/components/staff/content/category-content-manager";

export default function GeneralKnowledgeContentPage() {
  return (
    <CategoryContentManager
      categoryId={7}
      categoryName="General Knowledge"
      categorySlug="general-knowledge"
      requiresImage={false}
      requiresAudio={false}
    />
  );
}

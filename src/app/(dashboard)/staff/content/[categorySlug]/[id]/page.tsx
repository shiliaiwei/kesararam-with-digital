import { Metadata } from "next";
import { TopicDetailView } from "@/components/staff/content/topic-detail-view";

export const metadata: Metadata = {
  title: "Topic Details | Staff Dashboard",
  description: "View and manage topic details",
};

interface PageProps {
  params: Promise<{
    categorySlug: string;
    id: string;
  }>;
}

export default async function TopicDetailPage({ params }: PageProps) {
  const { categorySlug, id } = await params;

  return <TopicDetailView categorySlug={categorySlug} topicId={parseInt(id)} />;
}

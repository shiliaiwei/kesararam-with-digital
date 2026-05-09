import { Metadata } from "next";
import { LearningResourceList } from "@/components/staff/learning/learning-resource-list";

export const metadata: Metadata = {
  title: "Learning Resources | Staff Dashboard",
  description: "Manage learning resources for all categories",
};

export default function LearningResourcesPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-black text-black mb-2">Learning Resources</h1>
        <p className="text-zinc-600">
          Create educational content for each category. These resources will be used in quizzes, flashcards, and challenges.
        </p>
      </div>

      <LearningResourceList />
    </div>
  );
}

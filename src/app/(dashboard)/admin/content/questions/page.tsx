import { Metadata } from "next";
import { QuestionManagementPanel } from "@/components/admin/questions/question-management-panel";

export const metadata: Metadata = {
  title: "Topic Questions | Admin Dashboard",
  description: "Manage questions for all topics across categories",
};

export default function AdminQuestionsPage() {
  return (
    <div className="p-6 space-y-6">
      <QuestionManagementPanel />
    </div>
  );
}

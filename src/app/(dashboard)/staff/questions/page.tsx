import { Metadata } from "next";
import { StaffQuestionManagement } from "@/components/staff/questions/staff-question-management";

export const metadata: Metadata = {
  title: "Questions | Staff Dashboard",
  description: "Manage questions for all topics across categories",
};

export default function StaffQuestionsPage() {
  return (
    <div className="p-6 space-y-6">
      <StaffQuestionManagement />
    </div>
  );
}

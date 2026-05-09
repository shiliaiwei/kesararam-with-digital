import { Metadata } from "next";
import { LearningResourceForm } from "@/components/staff/learning/learning-resource-form";

export const metadata: Metadata = {
  title: "Create Learning Resource | Staff Dashboard",
  description: "Create new learning resource",
};

export default function CreateLearningResourcePage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-black text-black mb-2">Create Learning Resource</h1>
        <p className="text-zinc-600">
          Add educational content that will be used across quizzes, flashcards, and challenges
        </p>
      </div>

      <LearningResourceForm />
    </div>
  );
}

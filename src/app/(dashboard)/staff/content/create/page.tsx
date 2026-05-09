import { Metadata } from "next";
import { UniversalContentForm } from "@/components/staff/content/universal-content-form";

export const metadata: Metadata = {
  title: "Create Content | Staff Dashboard",
  description: "Create new educational content",
};

export default function CreateContentPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-black text-black mb-2">Create Content</h1>
        <p className="text-zinc-600">
          Add new educational content for students
        </p>
      </div>

      <UniversalContentForm />
    </div>
  );
}

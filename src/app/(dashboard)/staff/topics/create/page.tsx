import { TopicForm } from "@/components/staff/topics/topic-form";

export default function CreateTopicPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black">Create New Topic</h1>
        <p className="text-zinc-600">
          Create a new topic record for a category
        </p>
      </div>

      <TopicForm />
    </div>
  );
}

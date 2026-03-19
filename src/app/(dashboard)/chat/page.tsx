import { AIChat } from "@/components/chat/ai-chat";

export default function ChatPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-black mb-2">AI Chat Assistant</h1>
        <p className="text-zinc-600">
          Ask questions about traffic laws, road signs, and driving safety. You must be logged in to use this feature.
        </p>
      </div>
      <AIChat />
    </div>
  );
}

import { AIChat } from "@/components/chat/ai-chat";

export default function ChatPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-black mb-2">Suar AI - Your Driving Assistant</h1>
        <p className="text-zinc-600">
          Ask Suar AI questions about Cambodian traffic laws, road signs, and driving safety. Available to all logged-in users.
        </p>
      </div>
      <AIChat />
    </div>
  );
}

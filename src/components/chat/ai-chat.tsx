"use client";

import { useState, useRef, useEffect } from "react";
import { useLang } from "@/context/lang-context";
import { toast } from "sonner";
import { BrandSelect } from "@/components/ui/brand-select";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export function AIChat() {
  const { lang } = useLang();
  const kh = lang === "kh";
  const khFont = kh ? { fontFamily: "var(--font-kh-body), var(--font-kh-header), 'Noto Sans Khmer', sans-serif" } : {};

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [provider, setProvider] = useState<"google" | "imagine" | "perplexity">("google");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage.content,
          provider,
          conversationHistory: messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        if (response.status === 401) {
          toast.error(kh ? "សូមចូលគណនីសិន" : "Please log in to use chat");
          return;
        }
        throw new Error(error.message || "Failed to get response");
      }

      const data = await response.json();
      const assistantMessage: Message = {
        role: "assistant",
        content: data.message,
        timestamp: data.timestamp,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      toast.error(
        kh
          ? "មានបញ្ហាក្នុងការទំនាក់ទំនង"
          : error instanceof Error
          ? error.message
          : "Failed to send message"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] max-w-4xl mx-auto border-2 border-black rounded-none shadow-[8px_8px_0_#000] bg-white">
      {/* Header */}
      <div className="bg-yellow-400 border-b-2 border-black p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-yellow-400 font-black">
            S
          </div>
          <h2 className="text-xl font-black" style={khFont}>
            {kh ? "ស្វ័រ AI" : "Suar AI"}
          </h2>
        </div>
        <BrandSelect
          value={provider}
          onValueChange={(v) => setProvider(v as typeof provider)}
          fontStyle={khFont}
          ariaLabel={kh ? "ផ្ដល់សេវា AI" : "AI provider"}
          className="px-3 py-1 text-sm"
          options={[
            { value: "google", label: "Google Gemini" },
            { value: "perplexity", label: "Perplexity" },
            { value: "imagine", label: "Imagine AI" },
          ]}
        />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-zinc-500 mt-8" style={khFont}>
            <div className="w-16 h-16 bg-yellow-400 border-2 border-black rounded-full flex items-center justify-center text-3xl font-black mx-auto mb-4">
              S
            </div>
            <p className="text-lg font-bold">
              {kh
                ? "សួស្តី! ខ្ញុំឈ្មោះ ស្វ័រ AI"
                : "Hello! I'm Suar AI"}
            </p>
            <p className="text-sm mt-2">
              {kh
                ? "សួរអំពីច្បាប់ចរាចរណ៍ សញ្ញាចរាចរណ៍ ឬសុវត្ថិភាពបើកបរ"
                : "Ask about traffic laws, road signs, or driving safety"}
            </p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] p-3 border-2 border-black rounded-none shadow-[4px_4px_0_#000] ${
                msg.role === "user"
                  ? "bg-cyan-400"
                  : "bg-white"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap" style={khFont}>
                {msg.content}
              </p>
              <p className="text-xs text-zinc-600 mt-1">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white p-3 border-2 border-black rounded-none shadow-[4px_4px_0_#000]">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-black rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-black rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-black rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t-2 border-black p-4 bg-zinc-50">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={kh ? "វាយសារ..." : "Type a message..."}
            className="flex-1 px-4 py-2 border-2 border-black rounded-none focus:outline-none focus:ring-2 focus:ring-yellow-400"
            style={khFont}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-6 py-2 bg-yellow-400 border-2 border-black rounded-none font-black shadow-[4px_4px_0_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_#000] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={khFont}
          >
            {kh ? "ផ្ញើ" : "Send"}
          </button>
        </div>
      </form>
    </div>
  );
}

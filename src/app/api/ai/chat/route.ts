import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import Groq from "groq-sdk";

const SYSTEM_PROMPT = `You are Suar AI (សួរ), the AI assistant for KWD — Kesararam With Digital, a Cambodian driving theory education platform for students preparing for the mandatory driving exam.

You are an expert on:
1. Traffic Signs (សញ្ញាផ្លូវវិថី) — all road signs used in Cambodia
2. Road Traffic Law (ច្បាប់ចរាចរ) — Cambodian road laws
3. Right of Way (សិទ្ធិដំណើរ) — priority rules and intersections
4. Driving Skills (ជំនាញបើកបរ) — driving technique
5. Vehicle Technology (បច្ចេកវិទ្យាយានយន្ត) — vehicles, safety systems
6. Loading People & Goods (ការដឹកអ្នកដំណើរ) — transport regulations
7. General Knowledge (ចំណេះដឹងទូទៅ) — road safety
8. Emergency (ជំនួយបន្ទាន់) — emergency procedures

Rules:
- Default response language is Khmer. If the user writes in English, respond in English.
- Be concise, exam-relevant, and accurate.
- Do not store personal data or ask for it.
- You are clearly an AI — never claim to be human.
- Maximum response length: 3 short paragraphs.`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    // Sanitize messages: only allow role + content strings
    const sanitized = messages
      .filter(
        (m) => m && typeof m.content === "string" && typeof m.role === "string",
      )
      .map((m) => ({
        role: m.role as "user" | "assistant",
        content: String(m.content).slice(0, 2000),
      }))
      .slice(-20); // keep last 20 messages only

    // Try OpenAI first
    if (process.env.OPENAI_API_KEY) {
      try {
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "system", content: SYSTEM_PROMPT }, ...sanitized],
          max_tokens: 600,
          temperature: 0.5,
        });
        return NextResponse.json({
          content: response.choices[0].message.content,
        });
      } catch {
        // fall through to Groq
      }
    }

    // Fallback: Groq
    if (process.env.GROQ_API_KEY) {
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      const response = await groq.chat.completions.create({
        model: "llama3-8b-8192",
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...sanitized],
        max_tokens: 600,
        temperature: 0.5,
      });
      return NextResponse.json({
        content: response.choices[0].message.content,
      });
    }

    return NextResponse.json(
      { content: "សូមទោស — AI service unavailable. Please try again later." },
      { status: 503 },
    );
  } catch {
    return NextResponse.json(
      { content: "An error occurred. Please try again." },
      { status: 500 },
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

/**
 * POST /api/chat
 * 
 * AI chat endpoint that requires user authentication.
 * Supports multiple AI providers: Google Gemini, Imagine AI, Perplexity
 * 
 * Requirements: User must be logged in
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Verify authentication - REQUIRED
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { 
          error: "Unauthorized", 
          message: "You must be logged in to use the chat feature" 
        },
        { status: 401 }
      );
    }

    // 2. Parse request body
    const body = await request.json();
    const { message, provider = "google", conversationHistory = [] } = body;

    // 3. Validate required fields
    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json(
        {
          error: "Validation Error",
          message: "Message is required and must be a non-empty string",
        },
        { status: 400 }
      );
    }

    // 4. Validate provider
    const validProviders = ["google", "imagine", "perplexity"];
    if (!validProviders.includes(provider)) {
      return NextResponse.json(
        {
          error: "Validation Error",
          message: `Invalid provider. Must be one of: ${validProviders.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // 5. Route to appropriate AI provider
    let response;
    switch (provider) {
      case "google":
        response = await chatWithGoogle(message, conversationHistory);
        break;
      case "imagine":
        response = await chatWithImagine(message, conversationHistory);
        break;
      case "perplexity":
        response = await chatWithPerplexity(message, conversationHistory);
        break;
      default:
        throw new Error("Invalid provider");
    }

    // 6. Return AI response
    return NextResponse.json({
      message: response,
      provider,
      userId: session.id,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in chat endpoint:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: error instanceof Error ? error.message : "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}

/**
 * Chat with Google Gemini API
 */
async function chatWithGoogle(message: string, history: any[]): Promise<string> {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error("Google API key not configured");
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          ...history.map((msg: any) => ({
            role: msg.role === "user" ? "user" : "model",
            parts: [{ text: msg.content }],
          })),
          {
            role: "user",
            parts: [{ text: message }],
          },
        ],
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Google API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.candidates[0]?.content?.parts[0]?.text || "No response from AI";
}

/**
 * Chat with Imagine AI API
 */
async function chatWithImagine(message: string, history: any[]): Promise<string> {
  const token = process.env.IMAGINE_TOKEN;
  if (!token) {
    throw new Error("Imagine API token not configured");
  }

  const response = await fetch("https://api.vyro.ai/v1/imagine/api/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": token,
    },
    body: JSON.stringify({
      prompt: message,
      model: "imagine-v1",
    }),
  });

  if (!response.ok) {
    throw new Error(`Imagine API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data?.text || data.message || "No response from AI";
}

/**
 * Chat with Perplexity API
 */
async function chatWithPerplexity(message: string, history: any[]): Promise<string> {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) {
    throw new Error("Perplexity API key not configured");
  }

  const response = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.1-sonar-small-128k-online",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant for a Cambodian driving education platform. Provide accurate, concise answers about traffic laws, road signs, and driving safety.",
        },
        ...history,
        {
          role: "user",
          content: message,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Perplexity API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || "No response from AI";
}

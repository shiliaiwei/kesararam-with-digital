import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sessions } from "@/db/schema/quizzes";
import { getSession } from "@/lib/auth";
import { eq, or } from "drizzle-orm";
import { z } from "zod";

const createChallengeSchema = z.object({
  categoryId: z.union([z.string(), z.number()]).transform(v => parseInt(String(v))),
  challengeType: z.string().optional().nullable(),
  level: z.enum(["beginner", "intermediate", "advanced"]).optional().nullable(),
  maxStudents: z.union([z.string(), z.number()]).transform(v => parseInt(String(v))).pipe(z.number().min(1).max(100)).optional().default(40),
});

/**
 * POST /api/challenge/create
 * 
 * Creates a new challenge session with a unique room code.
 * Only accessible by staff and admin users.
 * 
 * Requirements validated: 28.1
 */

/**
 * Generate a unique 6-character alphanumeric room code
 */
function generateRoomCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  const randomValues = new Uint32Array(6);
  crypto.getRandomValues(randomValues);
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(randomValues[i] % chars.length);
  }
  return code;
}

/**
 * Check if a room code is unique among active sessions
 */
async function isRoomCodeUnique(roomCode: string): Promise<boolean> {
  const existingSessions = await db
    .select()
    .from(sessions)
    .where(
      eq(sessions.roomCode, roomCode)
    );
  
  // Check if any active or waiting sessions exist with this code
  const activeSession = existingSessions.find(
    (s) => s.status === "waiting" || s.status === "active"
  );
  
  return !activeSession;
}

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized", message: "You must be logged in to create a challenge session" },
        { status: 401 }
      );
    }

    // 2. Check if user is staff or admin
    if (session.role !== "staff" && session.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden", message: "Only staff and admin users can create challenge sessions" },
        { status: 403 }
      );
    }

    const teacherId = session.id;

    // 3. Parse and validate request body
    const body = await request.json();
    const result = createChallengeSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation Error", details: result.error.format() },
        { status: 400 }
      );
    }
    
    const { categoryId, challengeType, level, maxStudents } = result.data;

    // 7. Generate unique room code (try up to 10 times)
    let roomCode = "";
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      roomCode = generateRoomCode();
      const isUnique = await isRoomCodeUnique(roomCode);
      if (isUnique) {
        break;
      }
      attempts++;
    }

    if (attempts === maxAttempts) {
      return NextResponse.json(
        {
          error: "Internal Server Error",
          message: "Failed to generate unique room code. Please try again.",
        },
        { status: 500 }
      );
    }

    // 8. Create challenge session
    const [challengeSession] = await db
      .insert(sessions)
      .values({
        teacherId,
        categoryId,
        roomCode,
        challengeType: challengeType || null,
        level: level || null,
        maxStudents,
        status: "waiting",
      })
      .returning();

    // 9. Return session details
    return NextResponse.json({
      sessionId: challengeSession.id,
      roomCode: challengeSession.roomCode,
      status: challengeSession.status,
      maxStudents: challengeSession.maxStudents,
      createdAt: challengeSession.createdAt,
    });
  } catch (error) {
    console.error("Error creating challenge session:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: "An unexpected error occurred while creating the challenge session",
      },
      { status: 500 }
    );
  }
}

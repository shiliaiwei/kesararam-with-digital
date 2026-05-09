/**
 * Unit tests for GET /api/leaderboard/user/[userId] endpoint
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "./route";
import { NextRequest } from "next/server";

// Mock dependencies
vi.mock("@/lib/auth", () => ({
  getSession: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    select: vi.fn(),
  },
}));

vi.mock("@/lib/ranking", () => ({
  getPeriodStart: vi.fn((period: string) => {
    if (period === "all-time") return "1970-01-01";
    if (period === "monthly") return "2024-03-01";
    if (period === "weekly") return "2024-03-10";
    return "1970-01-01";
  }),
}));

import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

describe("GET /api/leaderboard/user/[userId]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 if user is not authenticated", async () => {
    vi.mocked(getSession).mockResolvedValue(null);

    const request = new NextRequest("http://localhost:3000/api/leaderboard/user/1");
    const response = await GET(request, { params: Promise.resolve({ userId: "1" }) });

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toBe("Unauthorized");
  });

  it("should return 400 for invalid inputs", async () => {
    vi.mocked(getSession).mockResolvedValue({ id: 1, role: "student" } as any);

    // Invalid userId
    let request = new NextRequest("http://localhost:3000/api/leaderboard/user/abc");
    let response = await GET(request, { params: Promise.resolve({ userId: "abc" }) });
    expect(response.status).toBe(400);

    // Invalid period
    request = new NextRequest("http://localhost:3000/api/leaderboard/user/1?period=invalid");
    response = await GET(request, { params: Promise.resolve({ userId: "1" }) });
    expect(response.status).toBe(400);
  });

  it("should return hasRanking=false when user has no ranking", async () => {
    vi.mocked(getSession).mockResolvedValue({ id: 1, role: "student" } as any);

    const mockDb = {
      from: vi.fn().mockReturnThis(),
      leftJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([]),
    };

    vi.mocked(db.select).mockReturnValue(mockDb as any);

    const request = new NextRequest("http://localhost:3000/api/leaderboard/user/1");
    const response = await GET(request, { params: Promise.resolve({ userId: "1" }) });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.hasRanking).toBe(false);
  });

  it("should return user ranking when it exists", async () => {
    vi.mocked(getSession).mockResolvedValue({ id: 1, role: "student" } as any);

    const mockEntry = {
      id: 1,
      studentId: 1,
      categoryId: null,
      score: 100,
      correctAnswers: 10,
      totalAttempts: 5,
      rank: 3,
      updatedAt: new Date("2024-03-15T10:00:00Z"),
      displayName: "John Doe",
      username: "john",
      avatar: null,
    };

    const mockDb = {
      from: vi.fn().mockReturnThis(),
      leftJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([mockEntry]),
    };

    vi.mocked(db.select).mockReturnValue(mockDb as any);

    const request = new NextRequest("http://localhost:3000/api/leaderboard/user/1");
    const response = await GET(request, { params: Promise.resolve({ userId: "1" }) });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.hasRanking).toBe(true);
    expect(data.ranking.rank).toBe(3);
    expect(data.ranking.score).toBe(100);
  });
});

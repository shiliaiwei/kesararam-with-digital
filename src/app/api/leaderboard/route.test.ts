/**
 * Unit tests for GET /api/leaderboard endpoint
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

describe("GET /api/leaderboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 if user is not authenticated", async () => {
    vi.mocked(getSession).mockResolvedValue(null);

    const request = new NextRequest("http://localhost:3000/api/leaderboard");
    const response = await GET(request);

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toBe("Unauthorized");
  });

  it("should return 400 for invalid period", async () => {
    vi.mocked(getSession).mockResolvedValue({ id: 1, role: "student" } as any);

    const request = new NextRequest("http://localhost:3000/api/leaderboard?period=invalid");
    const response = await GET(request);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe("Validation Error");
    expect(data.message).toContain("Invalid period");
  });

  it("should return 400 for invalid limit", async () => {
    vi.mocked(getSession).mockResolvedValue({ id: 1, role: "student" } as any);

    const request = new NextRequest("http://localhost:3000/api/leaderboard?limit=0");
    const response = await GET(request);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe("Validation Error");
    expect(data.message).toContain("Invalid limit");
  });

  it("should return 400 for invalid categoryId", async () => {
    vi.mocked(getSession).mockResolvedValue({ id: 1, role: "student" } as any);

    const request = new NextRequest("http://localhost:3000/api/leaderboard?categoryId=abc");
    const response = await GET(request);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe("Validation Error");
    expect(data.message).toContain("Invalid categoryId");
  });

  it("should return leaderboard with default parameters", async () => {
    vi.mocked(getSession).mockResolvedValue({ id: 1, role: "student" } as any);

    const mockEntries = [
      {
        id: 1,
        studentId: 2,
        categoryId: null,
        score: 100,
        correctAnswers: 10,
        totalAttempts: 5,
        rank: 1,
        updatedAt: new Date(),
        displayName: "John Doe",
        username: "john",
        avatar: null,
      },
    ];

    const mockDb = {
      from: vi.fn().mockReturnThis(),
      leftJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue(mockEntries),
    };

    vi.mocked(db.select).mockReturnValue(mockDb as any);

    const request = new NextRequest("http://localhost:3000/api/leaderboard");
    const response = await GET(request);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.period).toBe("all-time");
    expect(data.categoryId).toBeNull();
    expect(data.rankings).toHaveLength(1);
    expect(data.rankings[0].rank).toBe(1);
    expect(data.rankings[0].displayName).toBe("John Doe");
  });

  it("should filter by categoryId when provided", async () => {
    vi.mocked(getSession).mockResolvedValue({ id: 1, role: "student" } as any);

    const mockEntries = [
      {
        id: 1,
        studentId: 2,
        categoryId: 5,
        score: 100,
        correctAnswers: 10,
        totalAttempts: 5,
        rank: 1,
        updatedAt: new Date(),
        displayName: "John Doe",
        username: "john",
        avatar: null,
      },
    ];

    const mockDb = {
      from: vi.fn().mockReturnThis(),
      leftJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue(mockEntries),
    };

    vi.mocked(db.select).mockReturnValue(mockDb as any);

    const request = new NextRequest("http://localhost:3000/api/leaderboard?categoryId=5");
    const response = await GET(request);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.categoryId).toBe(5);
    expect(data.rankings[0].studentId).toBe(2);
  });

  it("should use weekly period when specified", async () => {
    vi.mocked(getSession).mockResolvedValue({ id: 1, role: "student" } as any);

    const mockDb = {
      from: vi.fn().mockReturnThis(),
      leftJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([]),
    };

    vi.mocked(db.select).mockReturnValue(mockDb as any);

    const request = new NextRequest("http://localhost:3000/api/leaderboard?period=weekly");
    const response = await GET(request);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.period).toBe("weekly");
    expect(data.periodStart).toBe("2024-03-10");
  });

  it("should respect limit parameter", async () => {
    vi.mocked(getSession).mockResolvedValue({ id: 1, role: "student" } as any);

    const mockDb = {
      from: vi.fn().mockReturnThis(),
      leftJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([]),
    };

    vi.mocked(db.select).mockReturnValue(mockDb as any);

    const request = new NextRequest("http://localhost:3000/api/leaderboard?limit=50");
    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(mockDb.limit).toHaveBeenCalledWith(50);
  });

  it("should use username as fallback when displayName is null", async () => {
    vi.mocked(getSession).mockResolvedValue({ id: 1, role: "student" } as any);

    const mockEntries = [
      {
        id: 1,
        studentId: 2,
        categoryId: null,
        score: 100,
        correctAnswers: 10,
        totalAttempts: 5,
        rank: 1,
        updatedAt: new Date(),
        displayName: null,
        username: "john",
        avatar: null,
      },
    ];

    const mockDb = {
      from: vi.fn().mockReturnThis(),
      leftJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue(mockEntries),
    };

    vi.mocked(db.select).mockReturnValue(mockDb as any);

    const request = new NextRequest("http://localhost:3000/api/leaderboard");
    const response = await GET(request);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.rankings[0].displayName).toBe("john");
  });
});

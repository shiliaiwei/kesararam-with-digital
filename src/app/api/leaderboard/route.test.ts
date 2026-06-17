/**
 * Unit tests for GET /api/leaderboard endpoint
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "./route";
import { NextRequest } from "next/server";

// Mock dependencies
vi.mock("@/lib/db", () => ({
  db: {
    select: vi.fn(),
  },
}));

import { db } from "@/lib/db";

describe("GET /api/leaderboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return leaderboard with default parameters", async () => {
    const mockEntries = [
      {
        id: 1,
        username: "john",
        displayName: "John Doe",
        avatar: null,
        avatarChangedAt: null,
        highestScore: 100,
        totalGamesPlayed: 5,
        windowPoints: 100,
        priorityPoints: 50,
        soloPoints: 50,
        accuracy: 80,
        schoolName: "Test School",
        province: "Phnom Penh",
        isNamePublic: true,
        isUsernamePublic: true,
        isSchoolPublic: true,
        isProvincePublic: true,
        isGradePublic: true,
        isSectionPublic: true,
      },
    ];

    const mockDb = {
      from: vi.fn().mockReturnThis(),
      innerJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      offset: vi.fn().mockResolvedValue(mockEntries),
    };

    vi.mocked(db.select).mockReturnValue(mockDb as any);

    const request = new NextRequest("http://localhost:3000/api/leaderboard");
    const response = await GET(request);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.window).toBe("all");
    expect(data.province).toBe("all");
    expect(data.gameType).toBe("all");
    expect(data.leaderboard).toHaveLength(1);
    expect(data.leaderboard[0].rank).toBe(1);
    expect(data.leaderboard[0].displayName).toBe("John Doe");
    expect(data.leaderboard[0].priorityPoints).toBe(50);
  });

  it("should handle custom limit and offset parameters", async () => {
    const mockDb = {
      from: vi.fn().mockReturnThis(),
      innerJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      offset: vi.fn().mockResolvedValue([]),
    };

    vi.mocked(db.select).mockReturnValue(mockDb as any);

    const request = new NextRequest("http://localhost:3000/api/leaderboard?limit=25&offset=10");
    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(mockDb.limit).toHaveBeenCalledWith(25);
    expect(mockDb.offset).toHaveBeenCalledWith(10);
  });

  it("should pass province filter to where query", async () => {
    const mockDb = {
      from: vi.fn().mockReturnThis(),
      innerJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      offset: vi.fn().mockResolvedValue([]),
    };

    vi.mocked(db.select).mockReturnValue(mockDb as any);

    const request = new NextRequest("http://localhost:3000/api/leaderboard?province=Siemreap");
    const response = await GET(request);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.province).toBe("Siemreap");
  });

  it("should use pointsLedger grouping when filtering by gameType or window", async () => {
    const mockEntries = [
      {
        id: 1,
        username: "jane",
        displayName: "Jane Doe",
        avatar: null,
        avatarChangedAt: null,
        highestScore: 120,
        totalGamesPlayed: 8,
        windowPoints: 80,
        priorityPoints: 40,
        soloPoints: 40,
        accuracy: 90,
        schoolName: "Test School",
        province: "Kampot",
        isNamePublic: true,
        isUsernamePublic: true,
        isSchoolPublic: true,
        isProvincePublic: true,
        isGradePublic: true,
        isSectionPublic: true,
      },
    ];

    const mockDb = {
      from: vi.fn().mockReturnThis(),
      innerJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      groupBy: vi.fn().mockReturnThis(),
      having: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      offset: vi.fn().mockResolvedValue(mockEntries),
    };

    vi.mocked(db.select).mockReturnValue(mockDb as any);

    const request = new NextRequest("http://localhost:3000/api/leaderboard?gameType=sign-match&window=weekly");
    const response = await GET(request);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.window).toBe("weekly");
    expect(data.gameType).toBe("sign-match");
    expect(data.leaderboard).toHaveLength(1);
  });
});

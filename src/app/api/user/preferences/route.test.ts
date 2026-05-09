import { describe, it, expect, beforeEach, vi } from "vitest";
import { GET, PUT } from "./route";
import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

// Mock dependencies
vi.mock("@/lib/auth");
vi.mock("@/lib/db");

describe("GET /api/user/preferences", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 if not authenticated", async () => {
    vi.mocked(getSession).mockResolvedValue(null);

    const request = new NextRequest("http://localhost/api/user/preferences");
    const response = await GET(request);

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toBe("Unauthorized");
  });

  it("should return user preferences when authenticated", async () => {
    vi.mocked(getSession).mockResolvedValue({
      id: 1,
      email: "test@example.com",
      name: "Test User",
      role: "student",
    });

    const mockSelect = vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([{ audioMuted: false }]),
      }),
    });

    vi.mocked(db.select).mockReturnValue(mockSelect() as any);

    const request = new NextRequest("http://localhost/api/user/preferences");
    const response = await GET(request);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual({ audioMuted: false });
  });

  it("should return 404 if user not found", async () => {
    vi.mocked(getSession).mockResolvedValue({
      id: 999,
      email: "test@example.com",
      name: "Test User",
      role: "student",
    });

    const mockSelect = vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([]),
      }),
    });

    vi.mocked(db.select).mockReturnValue(mockSelect() as any);

    const request = new NextRequest("http://localhost/api/user/preferences");
    const response = await GET(request);

    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data.error).toBe("User not found");
  });
});

describe("PUT /api/user/preferences", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 if not authenticated", async () => {
    vi.mocked(getSession).mockResolvedValue(null);

    const request = new NextRequest("http://localhost/api/user/preferences", {
      method: "PUT",
      body: JSON.stringify({ audioMuted: true }),
    });
    const response = await PUT(request);

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toBe("Unauthorized");
  });

  it("should return 400 if audioMuted is not a boolean", async () => {
    vi.mocked(getSession).mockResolvedValue({
      id: 1,
      email: "test@example.com",
      name: "Test User",
      role: "student",
    });

    const request = new NextRequest("http://localhost/api/user/preferences", {
      method: "PUT",
      body: JSON.stringify({ audioMuted: "invalid" }),
    });
    const response = await PUT(request);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe("audioMuted must be a boolean");
  });

  it("should update audioMuted to true", async () => {
    vi.mocked(getSession).mockResolvedValue({
      id: 1,
      email: "test@example.com",
      name: "Test User",
      role: "student",
    });

    const mockUpdate = vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ audioMuted: true }]),
        }),
      }),
    });

    vi.mocked(db.update).mockReturnValue(mockUpdate() as any);

    const request = new NextRequest("http://localhost/api/user/preferences", {
      method: "PUT",
      body: JSON.stringify({ audioMuted: true }),
    });
    const response = await PUT(request);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual({ audioMuted: true });
  });

  it("should update audioMuted to false", async () => {
    vi.mocked(getSession).mockResolvedValue({
      id: 1,
      email: "test@example.com",
      name: "Test User",
      role: "student",
    });

    const mockUpdate = vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ audioMuted: false }]),
        }),
      }),
    });

    vi.mocked(db.update).mockReturnValue(mockUpdate() as any);

    const request = new NextRequest("http://localhost/api/user/preferences", {
      method: "PUT",
      body: JSON.stringify({ audioMuted: false }),
    });
    const response = await PUT(request);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual({ audioMuted: false });
  });

  it("should return 404 if user not found during update", async () => {
    vi.mocked(getSession).mockResolvedValue({
      id: 999,
      email: "test@example.com",
      name: "Test User",
      role: "student",
    });

    const mockUpdate = vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([]),
        }),
      }),
    });

    vi.mocked(db.update).mockReturnValue(mockUpdate() as any);

    const request = new NextRequest("http://localhost/api/user/preferences", {
      method: "PUT",
      body: JSON.stringify({ audioMuted: true }),
    });
    const response = await PUT(request);

    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data.error).toBe("User not found");
  });
});

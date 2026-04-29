import { describe, it, expect, vi, beforeEach } from "vitest";
import { SupabaseUserRepository } from "../SupabaseUserRepository";

const mockSupabase: any = {
  auth: {
    getUser: vi.fn(),
  },
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  single: vi.fn().mockReturnThis(),
};

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabase)),
}));

describe("SupabaseUserRepository", () => {
  let repository: SupabaseUserRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new SupabaseUserRepository();
    mockSupabase.from.mockReturnThis();
    mockSupabase.select.mockReturnThis();
    mockSupabase.eq.mockReturnThis();
  });

  it("should return domain user if authenticated", async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: { id: "u1", email: "test@example.com" } },
      error: null
    });

    // getCurrentUser llama a getById si el usuario existe
    mockSupabase.single.mockResolvedValueOnce({ 
      data: { id: "u1", email: "test@example.com", nombre: "Test User" }, 
      error: null 
    });

    const user = await repository.getCurrentUser();

    expect(user).not.toBeNull();
    expect(user?.id).toBe("u1");
    expect(user?.email).toBe("test@example.com");
  });

  it("should return null if not authenticated", async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: null },
      error: null
    });

    const user = await repository.getCurrentUser();

    expect(user).toBeNull();
  });
});

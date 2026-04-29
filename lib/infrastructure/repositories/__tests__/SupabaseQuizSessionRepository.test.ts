import { describe, it, expect, vi, beforeEach } from "vitest";
import { SupabaseQuizSessionRepository } from "../SupabaseQuizSessionRepository";

const createMockChain = () => {
  const mock: any = {
    from: vi.fn(),
    select: vi.fn(),
    insert: vi.fn(),
    eq: vi.fn(),
    order: vi.fn(),
    limit: vi.fn(),
  };
  Object.keys(mock).forEach(key => mock[key].mockReturnValue(mock));
  return mock;
};

const mockSupabase = createMockChain();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabase)),
}));

describe("SupabaseQuizSessionRepository", () => {
  let repository: SupabaseQuizSessionRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new SupabaseQuizSessionRepository();
    Object.keys(mockSupabase).forEach(key => mockSupabase[key].mockReturnValue(mockSupabase));
  });

  it("should save a quiz session", async () => {
    mockSupabase.insert.mockResolvedValueOnce({ error: null });

    await repository.save({
      userId: "u1",
      score: 10,
      totalQuestions: 15,
      timeElapsed: 300,
      mode: "standard",
      itcFilter: "itc-01"
    });

    expect(mockSupabase.from).toHaveBeenCalledWith("quiz_sessions");
    expect(mockSupabase.insert).toHaveBeenCalledWith(expect.objectContaining({
      user_id: "u1",
      score: 10
    }));
  });

  it("should fetch recent sessions by user id", async () => {
    const mockData = [
      { id: "s1", user_id: "u1", score: 10, created_at: new Date().toISOString() }
    ];
    // .from().select().eq().order().limit() -> el último es limit()
    mockSupabase.limit.mockResolvedValueOnce({ data: mockData, error: null });

    const result = await repository.getRecentByUserId("u1", 5);

    expect(mockSupabase.from).toHaveBeenCalledWith("quiz_sessions");
    expect(mockSupabase.eq).toHaveBeenCalledWith("user_id", "u1");
    expect(mockSupabase.limit).toHaveBeenCalledWith(5);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("s1");
  });
});

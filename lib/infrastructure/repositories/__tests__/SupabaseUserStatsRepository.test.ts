import { describe, it, expect, vi, beforeEach } from "vitest";
import { SupabaseUserStatsRepository } from "../SupabaseUserStatsRepository";

// Creamos un mock que usa Proxy para devolver "this" a cualquier método desconocido
// y permite configurar resoluciones específicas para métodos terminales.
const createSupabaseMock = () => {
  const mock: any = {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    gt: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    // Añadimos el then para que se comporte como una promesa si es necesario
    then: undefined 
  };

  return mock;
};

const mockSupabase = createSupabaseMock();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabase)),
}));

describe("SupabaseUserStatsRepository", () => {
  let repository: SupabaseUserStatsRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new SupabaseUserStatsRepository();
    
    // Reset de comportamientos por defecto
    mockSupabase.from.mockReturnValue(mockSupabase);
    mockSupabase.select.mockReturnValue(mockSupabase);
    mockSupabase.update.mockReturnValue(mockSupabase);
    mockSupabase.eq.mockReturnValue(mockSupabase);
    mockSupabase.single.mockResolvedValue({ data: null, error: null });
    mockSupabase.insert.mockResolvedValue({ error: null });
  });

  it("should fetch stats by user id", async () => {
    const mockData = [
      { user_id: "u1", question_id: "q1", times_answered: 5, times_correct: 3, last_answered_at: new Date().toISOString() }
    ];
    
    // Configuramos la resolución del ÚLTIMO método de la cadena (.eq en este caso)
    mockSupabase.eq.mockImplementation(() => Promise.resolve({ data: mockData, error: null }));

    const result = await repository.getStatsByUserId("u1");

    expect(mockSupabase.from).toHaveBeenCalledWith("user_question_stats");
    expect(mockSupabase.eq).toHaveBeenCalledWith("user_id", "u1");
    expect(result).toHaveLength(1);
  });

  it("should record a new answer (insert) if no previous record exists", async () => {
    // 1. .single() resuelve a null (no existe)
    mockSupabase.single.mockResolvedValueOnce({ data: null, error: null });
    // 2. .insert() resuelve error null
    mockSupabase.insert.mockResolvedValueOnce({ error: null });

    await repository.recordAnswer({
      userId: "u1",
      questionId: "q1",
      isCorrect: true,
      timeSpent: 500
    });

    expect(mockSupabase.insert).toHaveBeenCalled();
  });

  it("should record an answer (update) if previous record exists", async () => {
    const existing = { 
      user_id: "u1", 
      question_id: "q1", 
      times_answered: 1, 
      times_correct: 1,
      min_correct_time: 1000,
      max_correct_time: 1000
    };
    
    // 1. .single() devuelve el existente
    mockSupabase.single.mockResolvedValueOnce({ data: existing, error: null });
    
    // 2. Para el update final .from().update().eq().eq()
    // Configuramos eq para que devuelva el mock la primera vez y resuelva la segunda
    mockSupabase.eq
      .mockReturnValueOnce(mockSupabase) // Primer .eq() de la consulta select
      .mockReturnValueOnce(mockSupabase) // Segundo .eq() de la consulta select
      .mockReturnValueOnce(mockSupabase) // Primer .eq() del update
      .mockResolvedValueOnce({ error: null }); // Segundo .eq() del update resuelva

    await repository.recordAnswer({
      userId: "u1",
      questionId: "q1",
      isCorrect: true,
      timeSpent: 500
    });

    expect(mockSupabase.update).toHaveBeenCalled();
  });
});

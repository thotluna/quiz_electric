import { describe, it, expect } from "vitest";
import { JsonQuestionRepository } from "../JsonQuestionRepository";

const mockData = {
  temas: [
    {
      id: "T1",
      itc: "ITC-01",
      preguntas: [
        { id: "Q1", pregunta: "P1", opciones: [], tipo: "simple" },
        { id: "Q2", pregunta: "P2", opciones: [], tipo: "simple" }
      ]
    },
    {
      id: "T2",
      itc: "ITC-02",
      preguntas: [
        { id: "Q3", pregunta: "P3", opciones: [], tipo: "simple" }
      ]
    }
  ]
};

describe("JsonQuestionRepository", () => {
  it("should filter by topicIds", async () => {
    const repo = new JsonQuestionRepository(mockData);
    const questions = await repo.getByFilter({ topicIds: ["T1"] });
    expect(questions).toHaveLength(2);
    expect(questions[0].itc).toBe("ITC-01");
  });

  it("should exclude IDs correctly", async () => {
    const repo = new JsonQuestionRepository(mockData);
    const questions = await repo.getByFilter({ excludedIds: ["Q1"] });
    expect(questions).toHaveLength(2);
    expect(questions.find(q => q.id === "Q1")).toBeUndefined();
  });

  it("should handle limit and offset", async () => {
    const repo = new JsonQuestionRepository(mockData);
    const questions = await repo.getByFilter({ limit: 1, offset: 1 });
    expect(questions).toHaveLength(1);
    expect(questions[0].id).toBe("Q2");
  });
});

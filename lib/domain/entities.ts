export class OptionEntity {
  constructor(
    public readonly id: number,
    public readonly text: string,
    public readonly isCorrect: boolean,
    public readonly explanation: string
  ) { }
}


export abstract class QuestionEntity<T> {
  constructor(
    public readonly id: string,
    public readonly text: string,
    public readonly options: OptionEntity[],
    public readonly topicId: string
  ) { }

  public getCorrectOptions(): OptionEntity[] {
    return this.options.filter(o => o.isCorrect);
  }

  public abstract evaluate(selection: T): number;
}

export class SimpleQuestion extends QuestionEntity<number> {
  public evaluate(selectedId: number): number {
    const option = this.options.find(o => o.id === selectedId);
    return option?.isCorrect ? 1 : -0.25;
  }
}

export class MultipleQuestion extends QuestionEntity<number[]> {
  public evaluate(selectedIds: number[]): number {
    const correctOptions = this.getCorrectOptions();
    const totalCorrect = correctOptions.length;
    const totalIncorrect = this.options.length - totalCorrect;

    const posPointsPerOption = 1 / totalCorrect;
    const negPointsPerOption = totalIncorrect > 0 ? 0.25 / totalIncorrect : 0;

    let score = 0;
    selectedIds.forEach(id => {
      const opt = this.options.find(o => o.id === id);
      if (opt?.isCorrect) {
        score += posPointsPerOption;
      } else {
        score -= negPointsPerOption;
      }
    });

    return Math.max(-0.25, Math.min(1, score));
  }
}

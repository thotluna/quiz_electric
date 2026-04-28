import { AnyQuestionEntity } from '../repositories';
import { QuestionStat } from '../repositories/user-stats';

export class QuestionSelectorService {
  private static readonly FAST_CORRECT_THRESHOLD = 2;

  public static select(
    pool: AnyQuestionEntity[],
    stats: QuestionStat[],
    limit: number
  ): AnyQuestionEntity[] {
    const unseen: AnyQuestionEntity[] = [];
    const failed: AnyQuestionEntity[] = [];
    const slowCorrect: AnyQuestionEntity[] = [];
    const fastCorrect: AnyQuestionEntity[] = [];

    pool.forEach(question => {
      const stat = stats.find(s => s.questionId === question.id);
      
      if (!stat || stat.timesAnswered === 0) {
        unseen.push(question);
        return;
      }

      if (stat.timesCorrect < stat.timesAnswered) {
        failed.push(question);
        return;
      }

      if (stat.minCorrectTime < this.FAST_CORRECT_THRESHOLD) {
        fastCorrect.push(question);
      } else {
        slowCorrect.push(question);
      }
    });

    const finalSelection: AnyQuestionEntity[] = [];
    
    this.fill(finalSelection, unseen, limit);
    this.fill(finalSelection, failed, limit);
    this.fill(finalSelection, slowCorrect, limit);
    
    if (finalSelection.length < limit) {
      this.fill(finalSelection, fastCorrect, limit);
    }

    return finalSelection
      .sort(() => Math.random() - 0.5)
      .slice(0, limit);
  }

  private static fill(target: AnyQuestionEntity[], source: AnyQuestionEntity[], limit: number): void {
    const remaining = limit - target.length;
    if (remaining <= 0) return;

    const shuffled = [...source].sort(() => Math.random() - 0.5);
    target.push(...shuffled.slice(0, remaining));
  }
}

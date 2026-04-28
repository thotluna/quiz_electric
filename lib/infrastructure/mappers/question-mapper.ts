import { QuestionDTO } from '../contracts/question-datasource';
import { SimpleQuestion, MultipleQuestion, OptionEntity } from '@/lib/domain/entities';
import { AnyQuestionEntity } from '@/lib/domain/repositories';

export class QuestionMapper {
  public static toDomain(dto: QuestionDTO): AnyQuestionEntity {
    const options = dto.opciones.map(
      o => new OptionEntity(o.id, o.respuesta, o.es_correcta, o.explicacion)
    );

    if (dto.tipo === 'multiple') {
      return new MultipleQuestion(
        dto.id,
        dto.pregunta,
        options,
        dto.itc || 'General'
      );
    }

    return new SimpleQuestion(
      dto.id,
      dto.pregunta,
      options,
      dto.itc || 'General'
    );
  }

  public static toDomainList(dtos: QuestionDTO[]): AnyQuestionEntity[] {
    return dtos.map(dto => this.toDomain(dto));
  }
}

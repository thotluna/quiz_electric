import { User } from "@/lib/domain/entities/User";

export class UserMapper {
  static toDomain(raw: any): User {
    return {
      id: raw.id,
      email: raw.email,
      nombre: raw.nombre,
      avatarUrl: raw.avatar_url,
      creadoEn: new Date(raw.creado_en)
    };
  }

  static toPersistence(domain: Partial<User>) {
    return {
      email: domain.email,
      nombre: domain.nombre,
      avatar_url: domain.avatarUrl
    };
  }
}

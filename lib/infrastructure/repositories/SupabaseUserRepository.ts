import { createClient } from "@/lib/supabase/server";
import { IUserRepository } from "@/lib/domain/repositories/IUserRepository";
import { User } from "@/lib/domain/entities/User";
import { UserMapper } from "../mappers/UserMapper";

export class SupabaseUserRepository implements IUserRepository {
  async getById(id: string): Promise<User | null> {
    const supabase = await createClient();
    const { data } = await supabase
      .from("usuarios")
      .select("*")
      .eq("id", id)
      .single();

    if (!data) return null;
    return UserMapper.toDomain(data);
  }

  async getCurrentUser(): Promise<User | null> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const profile = await this.getById(user.id);
    if (!profile) {
      // Si no hay perfil en 'usuarios', lo creamos desde auth
      const newUser = {
        id: user.id,
        email: user.email || "",
        nombre: user.user_metadata?.full_name || null,
        avatar_url: user.user_metadata?.avatar_url || null,
        creado_en: new Date().toISOString()
      };
      // Aquí podrías insertar el perfil automáticamente si fuera necesario
      return UserMapper.toDomain(newUser);
    }

    return profile;
  }

  async update(user: Partial<User> & { id: string }): Promise<void> {
    const supabase = await createClient();
    const persistenceData = UserMapper.toPersistence(user);
    await supabase.from("usuarios").update(persistenceData).eq("id", user.id);
  }
}

import { User } from "../entities/User";

export interface IUserRepository {
  getById(id: string): Promise<User | null>;
  getCurrentUser(): Promise<User | null>;
  update(user: Partial<User>): Promise<void>;
}

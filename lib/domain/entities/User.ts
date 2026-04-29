export interface User {
  readonly id: string;
  readonly email: string;
  readonly nombre: string | null;
  readonly avatarUrl: string | null;
  readonly creadoEn: Date;
}

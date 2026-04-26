import { GoogleSignInButton } from "./GoogleSignInButton";

export default function LoginPage() {

  return (
    <div className="w-full max-w-md space-y-8 text-center">
      <p className="text-foreground/40 font-bold uppercase tracking-widest text-sm">
        Entrena para tu certificación REBT
      </p>

      <div className="bg-surface-card p-10 rounded-[2.5rem] border border-foreground/5 shadow-2xl space-y-8 backdrop-blur-sm relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-accent-primary to-transparent opacity-50" />

        <div className="space-y-2">
          <h2 className="text-2xl font-black">Bienvenido</h2>
          <p className="text-foreground/40 text-sm font-medium">
            Inicia sesión para guardar tu progreso y ver tus estadísticas.
          </p>
        </div>

        <GoogleSignInButton />

        <p className="text-[10px] text-foreground/20 font-bold uppercase tracking-tight">
          Acceso seguro mediante Google Cloud Auth
        </p>
      </div>
    </div>
  )
}

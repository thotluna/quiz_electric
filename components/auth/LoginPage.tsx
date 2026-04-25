'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import { GoogleSignInButton } from '@/components/GoogleSignInButton'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleSignIn = async () => {
    setLoading(true)
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
    } catch (error) {
      console.error('Error signing in:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="text-6xl font-black tracking-tighter uppercase italic text-transparent bg-clip-text bg-gradient-to-br from-accent-primary to-blue-600">
            Quiz Electric
          </h1>
          <p className="text-foreground/40 font-bold uppercase tracking-widest text-sm">
            Entrena para tu certificación REBT
          </p>
        </div>

        <div className="bg-surface-card p-10 rounded-[2.5rem] border border-foreground/5 shadow-2xl space-y-8 backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent-primary to-transparent opacity-50" />
          
          <div className="space-y-2">
            <h2 className="text-2xl font-black">Bienvenido</h2>
            <p className="text-foreground/40 text-sm font-medium">
              Inicia sesión para guardar tu progreso y ver tus estadísticas.
            </p>
          </div>

          <GoogleSignInButton onClick={handleSignIn} disabled={loading} />
          
          <p className="text-[10px] text-foreground/20 font-bold uppercase tracking-tight">
            Acceso seguro mediante Google Cloud Auth
          </p>
        </div>
      </div>
    </div>
  )
}

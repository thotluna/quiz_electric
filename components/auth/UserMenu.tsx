'use client'

import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface UserMenuProps {
  user: User
}

export default function UserMenu({ user }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-1.5 pr-4 rounded-full bg-foreground/5 hover:bg-foreground/10 transition-all border border-foreground/5 group"
      >
        <div className="w-8 h-8 rounded-full bg-accent-primary text-white flex items-center justify-center font-black text-sm border-2 border-background shadow-lg">
          {user.email?.[0].toUpperCase()}
        </div>
        <div className="text-left hidden sm:block">
          <p className="text-xs font-black text-foreground truncate max-w-[120px]">
            {user.email?.split('@')[0]}
          </p>
          <p className="text-[9px] font-bold text-foreground/30 uppercase tracking-tighter">
            Nivel Aspirante
          </p>
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-56 py-3 bg-surface-card border border-foreground/10 rounded-2xl shadow-2xl z-50 animate-in fade-in zoom-in duration-200">
          <div className="px-4 py-2 border-b border-foreground/5 mb-2">
            <p className="text-[10px] font-black text-foreground/30 uppercase tracking-widest">Cuenta</p>
            <p className="text-xs font-bold text-foreground/60 truncate">{user.email}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full text-left px-4 py-2 text-sm font-bold text-status-incorrect hover:bg-status-incorrect/5 transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>
      )}
    </div>
  )
}

'use client'

import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Image from 'next/image'

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

  const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture
  const userName = user.user_metadata?.full_name || user.email?.split('@')[0]

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 pr-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-all border border-white/5 group"
      >
        <div className="w-8 h-8 rounded-lg bg-primary overflow-hidden flex items-center justify-center border border-white/10 relative shrink-0">
          {avatarUrl ? (
            <Image 
              src={avatarUrl} 
              alt={userName || 'User'} 
              fill
              className="object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <span className="font-black text-[10px] text-white">
              {user.email?.[0].toUpperCase()}
            </span>
          )}
        </div>
        <div className="text-left hidden sm:block">
          <p className="text-[10px] font-black text-foreground truncate max-w-[80px]">
            {userName}
          </p>
          <div className="w-12 h-1 bg-white/10 rounded-full mt-0.5 overflow-hidden">
            <div className="h-full bg-primary w-[40%] rounded-full shadow-[0_0_5px_var(--neon-color)]" />
          </div>
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 py-2 bg-card border border-white/10 rounded-xl shadow-2xl z-50 animate-in fade-in zoom-in duration-200">
          <button
            onClick={handleSignOut}
            className="w-full text-left px-4 py-2 text-[10px] font-black text-destructive hover:bg-destructive/5 transition-colors uppercase tracking-widest"
          >
            Cerrar Sesión
          </button>
        </div>
      )}
    </div>
  )
}

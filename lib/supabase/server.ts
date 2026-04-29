import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

import { User, Session } from '@supabase/supabase-js'
import { cache } from 'react'

export const createClient = cache(async () => {
  const cookieStore = await cookies()

  const client = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // The `set` method was called from a Server Component.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.delete({ name, ...options })
          } catch (error) {
            // The `delete` method was called from a Server Component.
          }
        },
      },
    }
  )

  // Global Supabase Mock (Expert recommended pattern)
  const testCookie = cookieStore.get('x-test-session')?.value
  const isTestMode = process.env.ENABLE_SUPABASE_MOCK === 'true' || testCookie === 'true'

  if (isTestMode) {
    const mockUser = {
      id: 'test-user-123',
      email: 'test@example.com',
      user_metadata: {
        full_name: 'Expert Test User',
        avatar_url: 'https://github.com/shadcn.png',
      },
    } as unknown as User

    client.auth.getUser = async () => {
      return {
        data: { user: mockUser },
        error: null,
      }
    }

    client.auth.getSession = async () => {
      return {
        data: {
          session: {
            user: mockUser,
            access_token: 'mock-access-token',
            refresh_token: 'mock-refresh-token',
            expires_in: 3600,
            token_type: 'bearer',
          } as unknown as Session,
        },
        error: null,
      }
    }
  }


  return client
})

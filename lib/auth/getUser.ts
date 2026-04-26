import 'server-only';
import { cache } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { User } from '@supabase/supabase-js';

/**
 * Pure helper to get the user from the current session.
 * Does NOT redirect. Safe to use in Layouts and optional auth components.
 */
export const getUser = cache(async (): Promise<User | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
});

/**
 * Protects a route by verifying the session.
 * Redirects to /login if no user is found.
 */
export const verifySession = cache(async (): Promise<User> => {
  const user = await getUser();

  if (!user) {
    redirect('/login');
  }

  return user;
});

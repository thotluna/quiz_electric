'use server';

import { getUserStats, getUserSessions } from '@/lib/queries/user-stats';

export async function getUserStatsAction() {
  try {
    const stats = await getUserStats();
    const sessions = await getUserSessions();
    return { 
      success: true, 
      stats: stats ? { ...stats, sessions } : null 
    };
  } catch (error) {
    console.error('Error in getUserStatsAction:', error);
    return { success: false, error: 'Failed to fetch stats' };
  }
}

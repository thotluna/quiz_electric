import { getUser } from '@/lib/auth/getUser'
import UserMenuClient from './UserMenuClient'

export default async function UserMenu() {
  const user = await getUser()

  if (!user) return null

  const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture
  const userName = user.user_metadata?.full_name || user.email?.split('@')[0]
  const emailFirstLetter = user.email?.[0].toUpperCase()

  return (
    <UserMenuClient 
      avatarUrl={avatarUrl}
      userName={userName}
      emailFirstLetter={emailFirstLetter}
    />
  )
}

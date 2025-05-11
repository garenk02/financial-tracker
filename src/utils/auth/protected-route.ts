import { redirect } from 'next/navigation'
import { checkAuth } from './actions'

export async function protectRoute() {
  // In Next.js 15+, we need to await the checkAuth function
  const { user, error } = await checkAuth()

  if (error || !user) {
    redirect('/auth')
  }

  return user
}

import { getCurrentUser } from '@/lib/auth'
import { apiSuccess, apiError } from '@/lib/utils'

export async function GET() {
  const user = getCurrentUser()
  if (!user) return apiError('未登入', 401)
  return apiSuccess(user)
}

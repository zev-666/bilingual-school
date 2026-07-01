import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'
import prisma from './prisma' // 確保你的 prisma client 路徑是這個

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production'
const COOKIE_NAME = 'admin_token'

export interface JWTPayload {
  id: string
  email: string
  role: string
  name: string
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch {
    return null
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function getTokenFromCookies(): string | null {
  const cookieStore = cookies()
  return cookieStore.get(COOKIE_NAME)?.value ?? null
}

export function getCurrentUser(): JWTPayload | null {
  const token = getTokenFromCookies()
  if (!token) return null
  return verifyToken(token)
}

export { COOKIE_NAME }

// 從請求中獲取當前登入的用戶資訊（給 middleware / API route 用）
export async function getAuthUserFromRequest(req: NextRequest) {
  // 嘗試從 Cookie 或 Header 中獲取 token
  const token = req.cookies.get('token')?.value || req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return null

  try {
    // 驗證 JWT 並解碼
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }

    // 從資料庫查詢用戶
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    })

    // 如果用戶不存在或被停用，返回 null
    if (!user || !user.isActive) return null

    // 為了安全，移除密碼欄位後返回
    const { password, ...userWithoutPassword } = user
    return userWithoutPassword
  } catch (error) {
    // token 無效或過期
    return null
  }
}

// 檢查用戶角色是否有權限 (權限級別：SUPER_ADMIN > ADMIN > EDITOR > VIEWER)
export function hasPermission(userRole: string, requiredRole: string): boolean {
  const roles = ['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'VIEWER']
  const userLevel = roles.indexOf(userRole)
  const requiredLevel = roles.indexOf(requiredRole)

  if (userLevel === -1) return false // 未知角色
  if (requiredLevel === -1) return true // 如果沒有設定門檻，則允許

  return userLevel <= requiredLevel // 數字越小，權限越高
}

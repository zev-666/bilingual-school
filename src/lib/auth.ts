// src/lib/auth.ts
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'
import type { User, UserRole } from '@prisma/client'

// ⚠️ 2026-08 資安修正：原本這裡是
//   process.env.JWT_SECRET ?? 'change-this-secret-in-production'
// 這個 repo 是公開的，等於把簽章密鑰公布在 GitHub 上。只要正式環境忘了設
// JWT_SECRET，任何人都能用這組預設值自己簽出合法的 SUPER_ADMIN token。
// 現在改為 fail-fast：正式環境沒設定就直接讓應用啟動失敗，不允許靜默退回預設值。
const JWT_SECRET = (() => {
  const s = process.env.JWT_SECRET
  if (s && s.length >= 32) return s
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      '[SECURITY] 未設定 JWT_SECRET 環境變數，或長度不足 32 字元。' +
        '請在 Vercel 專案設定中加入一組隨機字串（例如 `openssl rand -base64 48` 產生的值）後重新部署。'
    )
  }
  // 本機開發用的臨時密鑰，每次啟動都不同，不會外流也無法跨環境重用
  console.warn('[SECURITY] 未設定 JWT_SECRET，本機開發模式改用隨機臨時密鑰（重啟後既有登入會失效）')
  return require('crypto').randomBytes(48).toString('base64')
})()
const SESSION_COOKIE = 'school_session'
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days

export interface JWTPayload {
  userId: string
  email: string
  role: UserRole
  name: string
}

/** Hash a plain-text password */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

/** Compare password with stored hash */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

/** Sign a JWT token */
export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

/** Verify and decode a JWT token */
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch {
    return null
  }
}

/** Get the currently authenticated user from cookies (Server Components) */
export async function getAuthUser(): Promise<JWTPayload | null> {
  const cookieStore = cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) return null
  return verifyToken(token)
}

/** Get auth user from request headers (API routes / middleware) */
export function getAuthUserFromRequest(req: NextRequest): JWTPayload | null {
  // Try cookie first
  const cookieToken = req.cookies.get(SESSION_COOKIE)?.value
  if (cookieToken) return verifyToken(cookieToken)

  // Try Authorization header
  const authHeader = req.headers.get('Authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return verifyToken(authHeader.slice(7))
  }

  return null
}

/** Create a session token and set cookie */
export function createSessionCookie(payload: JWTPayload): string {
  return signToken(payload)
}

/** Session cookie name (exported for middleware) */
export { SESSION_COOKIE }

/** Role hierarchy helper */
export const ROLE_LEVELS: Record<string, number> = {
  AUTHOR: 1,
  EDITOR: 2,
  ADMIN: 3,
  SUPER_ADMIN: 4,
}

/**
 * Check if userRole meets or exceeds requiredRole.
 * Accepts string so callers don't need explicit `as UserRole` casts.
 */
export function hasPermission(userRole: string, requiredRole: string): boolean {
  const userLevel     = ROLE_LEVELS[userRole]     ?? 0
  const requiredLevel = ROLE_LEVELS[requiredRole] ?? 0
  return userLevel >= requiredLevel
}

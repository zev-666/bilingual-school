// src/lib/auth.ts
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'
import type { User, UserRole } from '@prisma/client'

const JWT_SECRET = process.env.JWT_SECRET ?? 'change-this-secret-in-production'
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
export const ROLE_LEVELS: Record<UserRole, number> = {
  AUTHOR: 1,
  EDITOR: 2,
  ADMIN: 3,
  SUPER_ADMIN: 4,
}

export function hasPermission(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_LEVELS[userRole] >= ROLE_LEVELS[requiredRole]
}

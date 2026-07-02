// src/lib/auth-edge.ts
// Edge Runtime 相容的 JWT 驗證工具（不使用 jsonwebtoken / bcryptjs）
// 只給 middleware.ts 使用

export const SESSION_COOKIE = 'school_session'

interface JWTPayload {
  userId: string
  email: string
  role: string
  name: string
}

/**
 * 在 Edge Runtime 解碼 JWT（僅解 payload，不驗簽章）
 * middleware 只需要讀 role，不需要完整驗簽
 */
export function decodeTokenEdge(token: string): JWTPayload | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    // Base64URL decode the payload (second segment)
    const payload = parts[1]
    const padded = payload.padEnd(payload.length + (4 - (payload.length % 4)) % 4, '=')
    const decoded = atob(padded.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(decoded) as JWTPayload
  } catch {
    return null
  }
}

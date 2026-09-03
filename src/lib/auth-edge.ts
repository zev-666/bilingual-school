// src/lib/auth-edge.ts
// Edge Runtime 相容的 JWT 驗證工具（不使用 jsonwebtoken / bcryptjs）
// 只給 middleware.ts 使用
//
// ⚠️ 2026-08 資安修正（原本是嚴重漏洞，務必保留）
// ─────────────────────────────────────────────────────────────────────────────
// 舊版的 decodeTokenEdge() 只把 JWT 的 payload 段做 base64 解碼就直接相信裡面的
// role 欄位，完全沒有驗證簽章。這代表任何人都可以自己組一個
//   任意字串.<base64url({"role":"SUPER_ADMIN"})>.任意字串
// 塞進 school_session cookie，middleware 就會放行整個 /admin 後台。
// 而後台頁面（例如 /admin/contacts、/admin/users）是 Server Component，
// 自己不做權限檢查、直接用 prisma 撈資料渲染，等於未經授權就能讀到
// 所有聯絡訊息（姓名／Email／電話／訊息內容）與使用者清單 —— 個資外洩。
//
// 現在改為用 Web Crypto 實際驗證 HS256 簽章，並檢查 exp 是否過期。
// 簽章用的密鑰必須與 src/lib/auth.ts 的 JWT_SECRET 相同。
// ─────────────────────────────────────────────────────────────────────────────

export const SESSION_COOKIE = 'school_session'

export interface JWTPayload {
  userId: string
  email: string
  role: string
  name: string
  exp?: number
  iat?: number
}

function base64UrlToBytes(input: string): Uint8Array {
  const padded = input.padEnd(input.length + ((4 - (input.length % 4)) % 4), '=')
  const binary = atob(padded.replace(/-/g, '+').replace(/_/g, '/'))
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

function base64UrlToString(input: string): string {
  return new TextDecoder().decode(base64UrlToBytes(input))
}

/**
 * 在 Edge Runtime 驗證並解出 JWT。
 * 簽章不符、演算法不是 HS256、已過期、格式錯誤，一律回傳 null。
 */
export async function verifyTokenEdge(token: string, secret: string): Promise<JWTPayload | null> {
  try {
    if (!secret) return null
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const [headerB64, payloadB64, signatureB64] = parts

    // 1) 演算法必須是 HS256，且不接受 alg: none（JWT 經典繞過手法）
    const header = JSON.parse(base64UrlToString(headerB64)) as { alg?: string; typ?: string }
    if (header.alg !== 'HS256') return null

    // 2) 用 Web Crypto 實際驗證簽章（constant-time）
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    )
    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      base64UrlToBytes(signatureB64) as BufferSource,
      new TextEncoder().encode(`${headerB64}.${payloadB64}`)
    )
    if (!valid) return null

    // 3) 檢查有效期限
    const payload = JSON.parse(base64UrlToString(payloadB64)) as JWTPayload
    if (typeof payload.exp === 'number' && Date.now() >= payload.exp * 1000) return null
    if (!payload.userId || !payload.role) return null

    return payload
  } catch {
    return null
  }
}
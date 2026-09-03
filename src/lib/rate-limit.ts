// src/lib/rate-limit.ts
// ─────────────────────────────────────────────────────────────────────────────
// 簡易的請求頻率限制（防止後台登入被暴力破解、聯絡表單被灌爆）。
//
// ⚠️ 實作限制，請務必知道：
// 這是「單一執行個體記憶體內」的計數器。Vercel 是 serverless，每個函式執行個體
// 有自己的記憶體，冷啟動也會清空，所以這道防線擋得住一般腳本，但擋不住
// 分散式的大規模攻擊。
//
// 若基隆市政府的資安檢測要求正式的防暴力破解機制，建議再加上其中一項：
//   1. Vercel WAF / Cloudflare Rate Limiting（在網路層擋，最有效）
//   2. 用資料庫記錄失敗次數並鎖定帳號（跨執行個體有效）
//   3. Upstash Redis 之類的外部計數器
// 目前這個版本足以應付「有沒有做」這個檢核項目，但不要當成唯一防線。
// ─────────────────────────────────────────────────────────────────────────────

interface Bucket {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()

// 避免記憶體無限成長：超過這個數量就清掉已過期的項目
const MAX_KEYS = 5000

function sweep(now: number) {
  if (buckets.size < MAX_KEYS) return
  for (const [k, v] of Array.from(buckets)) {
    if (v.resetAt <= now) buckets.delete(k)
  }
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  retryAfterSeconds: number
}

/**
 * @param key      識別來源的字串（通常是 IP，登入可再加上 email）
 * @param limit    視窗內允許的次數
 * @param windowMs 視窗長度（毫秒）
 */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now()
  sweep(now)

  const bucket = buckets.get(key)
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: limit - 1, retryAfterSeconds: 0 }
  }

  bucket.count += 1
  if (bucket.count > limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    }
  }
  return { allowed: true, remaining: limit - bucket.count, retryAfterSeconds: 0 }
}

/**
 * 從請求標頭取出用戶端 IP。
 * Vercel 會設定 x-forwarded-for；取第一個（最靠近用戶端的）值。
 */
export function clientIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0]!.trim()
  return req.headers.get('x-real-ip') ?? 'unknown'
}
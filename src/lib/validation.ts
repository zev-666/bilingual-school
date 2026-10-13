// src/lib/validation.ts
// 圖片／檔案網址的共用驗證（前台後台、API 都可以用，不依賴伺服器端模組）。
//
// 為什麼不用 z.string().url()：
//   1. 它只接受完整網址（https://…）。搬到 Ubuntu 主機後，上傳的檔案網址是站內路徑
//      /uploads/xxx.png，會被它擋下來，後台就沒辦法存相簿照片、Banner、文件。
//   2. 舊網站搬遷進來的文件與教材本來就是 /uploads/… 路徑。
import { z } from 'zod'

export function isMediaUrl(value: string): boolean {
  // 站內上傳路徑：必須以 /uploads/ 開頭，且不得含 ..（避免路徑穿越）
  if (value.startsWith('/uploads/')) return !value.includes('..')
  try {
    const u = new URL(value)
    return u.protocol === 'https:' || u.protocol === 'http:'
  } catch {
    return false
  }
}

/** 必填的圖片／檔案網址：https://… 或 /uploads/… */
export const mediaUrl = z
  .string()
  .trim()
  .refine(isMediaUrl, { message: '請輸入有效的網址（https://… 或 /uploads/…）' })

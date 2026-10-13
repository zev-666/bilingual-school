#!/usr/bin/env node
/**
 * 把資料庫裡所有「Vercel Blob 圖片／檔案網址」下載到 Ubuntu 主機本機磁碟，並把網址改寫成 /uploads/blob/...
 *
 * 用法（在 Ubuntu 主機的發佈目錄執行，需先設好 .env 的 DATABASE_URL 與 UPLOAD_DIR）：
 *   node deploy/ubuntu/scripts/migrate-blob-to-local.mjs            # 預演：只列出會下載與改寫什麼
 *   node deploy/ubuntu/scripts/migrate-blob-to-local.mjs --write    # 實際下載並改寫資料庫
 *
 * 安全設計（比照 scripts/migration/ 既有腳本）：
 *   - 預設是預演模式，一定要加 --write 才會下載檔案、改資料庫
 *   - 先把所有檔案下載完並驗證大小 > 0，全部成功才改資料庫；任何一個下載失敗就整批中止
 *   - 資料庫改寫包在 $transaction 內，全成或全不成
 *   - 已存在的本機檔案不重複下載（可安全重跑）
 *   - 只處理 *.public.blob.vercel-storage.com 網址，其他網址（YouTube、站內 /uploads）一律不動
 *
 * ⚠️ 執行完確認網站上圖片都正常後，才可以到 Vercel 停用 Blob Store。
 */
import { PrismaClient } from '@prisma/client'
import { mkdir, writeFile, stat } from 'node:fs/promises'
import { join, basename } from 'node:path'

const prisma = new PrismaClient()
const WRITE = process.argv.includes('--write')
const UPLOAD_DIR = process.env.UPLOAD_DIR
if (!UPLOAD_DIR) {
  console.error('❌ 請先設定 UPLOAD_DIR（例如 /srv/eerc/uploads）')
  process.exit(1)
}
const TARGET_DIR = join(UPLOAD_DIR, 'blob')
const BLOB_RE = /https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\/[^\s)"'<>]+/gi

// 要檢查的欄位：[Prisma model, 欄位們]
// 單一網址欄位與「內文裡可能嵌了網址」的長文字欄位都列進來
const FIELDS = [
  ['user', ['avatar']],
  ['announcement', ['coverImage', 'contentZh', 'contentEn']],
  ['album', ['coverImage']],
  ['photo', ['url', 'thumbnail']],
  ['video', ['videoUrl', 'thumbnail']],
  ['playlist', ['coverImage']],
  ['document', ['fileUrl']],
  ['teacher', ['avatar']],
  ['bannerSlide', ['imageUrl', 'linkUrl']],
  ['media', ['url', 'thumbnail']],
  ['siteSetting', ['value']],
]

/** Blob 網址 → 本機檔名。Blob 檔名本身已含隨機字串，取最後一段即可；保留子路徑避免撞名 */
function localNameFor(url) {
  const u = new URL(url)
  const path = decodeURIComponent(u.pathname).replace(/^\/+/, '')
  // 只允許安全字元，避免路徑穿越（../）
  return path.split('/').map((seg) => seg.replace(/[^\w.\-一-鿿]/g, '_')).filter((s) => s && s !== '..').join('/')
}

async function main() {
  console.log(WRITE ? '🔧 實際執行模式（會下載並改寫資料庫）' : '👀 預演模式（不會改任何東西，加 --write 才會執行）')
  console.log(`本機目錄：${TARGET_DIR}\n`)

  /** @type {Map<string, string>} blob 網址 → /uploads/blob/... */
  const urlMap = new Map()
  /** @type {{model: string, id: string, field: string, from: string, to: string}[]} */
  const updates = []

  for (const [model, fields] of FIELDS) {
    const rows = await prisma[model].findMany({ select: { id: true, ...Object.fromEntries(fields.map((f) => [f, true])) } })
    for (const row of rows) {
      for (const f of fields) {
        const val = row[f]
        if (typeof val !== 'string' || !val) continue
        const found = val.match(BLOB_RE)
        if (!found) continue
        let next = val
        for (const url of found) {
          if (!urlMap.has(url)) urlMap.set(url, `/uploads/blob/${localNameFor(url)}`)
          next = next.split(url).join(urlMap.get(url))
        }
        updates.push({ model, id: row.id, field: f, from: val, to: next })
      }
    }
  }

  console.log(`找到 ${urlMap.size} 個 Blob 檔案、${updates.length} 個欄位需要改寫`)
  for (const u of updates) console.log(`  - ${u.model}.${u.field} (${u.id})`)
  if (urlMap.size === 0) return
  if (!WRITE) {
    console.log('\n預演結束。確認無誤後加 --write 執行。')
    return
  }

  // 1) 先全部下載
  let downloaded = 0
  for (const [url, local] of urlMap) {
    const dest = join(UPLOAD_DIR, local.replace(/^\/uploads\//, ''))
    try {
      const s = await stat(dest)
      if (s.size > 0) continue // 已存在，跳過
    } catch {}
    const res = await fetch(url)
    if (!res.ok) throw new Error(`下載失敗 ${res.status}: ${url}`)
    const buf = Buffer.from(await res.arrayBuffer())
    if (buf.length === 0) throw new Error(`檔案大小為 0: ${url}`)
    await mkdir(join(dest, '..'), { recursive: true })
    await writeFile(dest, buf)
    downloaded++
    console.log(`  ⬇ ${basename(dest)}  ${buf.length} bytes`)
  }
  console.log(`下載完成：新下載 ${downloaded} 個，其餘已存在`)

  // 2) 全部下載成功才改資料庫
  await prisma.$transaction(
    updates.map((u) => prisma[u.model].update({ where: { id: u.id }, data: { [u.field]: u.to } })),
  )
  console.log(`✅ 已改寫 ${updates.length} 個欄位`)

  // 3) 驗證：資料庫裡不應再有 Blob 網址
  let left = 0
  for (const [model, fields] of FIELDS) {
    for (const f of fields) {
      left += await prisma[model].count({ where: { [f]: { contains: 'blob.vercel-storage.com' } } })
    }
  }
  console.log(left === 0 ? '✅ 資料庫已無任何 Vercel Blob 網址' : `⚠️ 仍有 ${left} 個欄位含 Blob 網址，請檢查`)
}

main()
  .catch((e) => {
    console.error('❌', e.message)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())

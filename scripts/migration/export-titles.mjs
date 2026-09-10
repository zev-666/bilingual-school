#!/usr/bin/env node
/**
 * 匯出全站四類內容的中英文標題，供人工補英文標題用。
 *
 * 用法（專案根目錄）：
 *   node scripts/migration/export-titles.mjs
 *
 * 產出兩個檔案（放在專案根目錄）：
 *   titles-export.json  → 給 Claude 產英文翻譯初稿用（機器讀）
 *   titles-export.csv   → 給人在 Excel 裡校對用（人讀，UTF-8 with BOM）
 *
 * CSV 欄位：type, id, titleZh, titleEn, note
 *   - type / id 兩欄是回寫資料庫的鑰匙，**不要修改也不要調換順序**
 *   - 只需要編輯 titleEn 那一欄
 */
import { PrismaClient } from '@prisma/client'
import { writeFileSync } from 'node:fs'

const prisma = new PrismaClient()

function csvCell(value) {
  const s = value === null || value === undefined ? '' : String(value)
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

async function main() {
  console.log('匯出標題中…\n')

  const [announcements, documents, albums, videos] = await Promise.all([
    prisma.announcement.findMany({
      select: { id: true, slug: true, titleZh: true, titleEn: true, category: true },
      orderBy: { publishedAt: 'desc' },
    }),
    prisma.document.findMany({
      select: { id: true, titleZh: true, titleEn: true, category: true, formType: true },
      orderBy: { publishedAt: 'desc' },
    }),
    prisma.album.findMany({
      select: { id: true, slug: true, titleZh: true, titleEn: true, category: true },
      orderBy: { publishedAt: 'desc' },
    }),
    prisma.video.findMany({
      select: { id: true, slug: true, titleZh: true, titleEn: true },
      orderBy: { publishedAt: 'desc' },
    }),
  ])

  const rows = [
    ...announcements.map((r) => ({ type: 'announcement', ...r, note: r.category })),
    ...documents.map((r) => ({ type: 'document', ...r, note: `${r.category}/${r.formType}` })),
    ...albums.map((r) => ({ type: 'album', ...r, note: r.category })),
    ...videos.map((r) => ({ type: 'video', ...r, note: '' })),
  ]

  const emptyEn = rows.filter((r) => !r.titleEn || !r.titleEn.trim())

  // ---- JSON（機器讀）----
  writeFileSync(
    'titles-export.json',
    JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        counts: {
          announcement: announcements.length,
          document: documents.length,
          album: albums.length,
          video: videos.length,
          total: rows.length,
          emptyTitleEn: emptyEn.length,
        },
        rows,
      },
      null,
      2,
    ),
    'utf8',
  )

  // ---- CSV（人讀，加 BOM 讓 Excel 正確辨識 UTF-8）----
  const header = ['type', 'id', 'titleZh', 'titleEn', 'note']
  const csv = [
    header.join(','),
    ...rows.map((r) => [r.type, r.id, r.titleZh, r.titleEn ?? '', r.note].map(csvCell).join(',')),
  ].join('\r\n')
  writeFileSync('titles-export.csv', '﻿' + csv, 'utf8')

  console.log(`公告 Announcement : ${announcements.length}`)
  console.log(`文件 Document     : ${documents.length}`)
  console.log(`相簿 Album        : ${albums.length}`)
  console.log(`影音 Video        : ${videos.length}`)
  console.log(`------------------------------`)
  console.log(`總計              : ${rows.length}`)
  console.log(`英文標題空白      : ${emptyEn.length}\n`)
  console.log('已產出：titles-export.json / titles-export.csv')
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())

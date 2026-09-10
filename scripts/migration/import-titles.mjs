#!/usr/bin/env node
/**
 * 把校對完的英文標題寫回資料庫。
 *
 * 用法（專案根目錄）：
 *   node scripts/migration/import-titles.mjs                    # 預演，只印出會改什麼，不寫入
 *   node scripts/migration/import-titles.mjs --write            # 實際寫入
 *   node scripts/migration/import-titles.mjs --file 別的檔.csv  # 指定來源檔
 *
 * 預設讀取專案根目錄的 titles-export.csv。
 *
 * 安全設計：
 *   - 預設是預演模式，一定要加 --write 才會真的動資料庫
 *   - 只更新 titleEn 一個欄位，不碰標題中文、分類、日期
 *   - titleEn 空白的列直接跳過（不會把既有英文標題清成空白）
 *   - 與資料庫現值相同的列跳過，不做無謂寫入
 *   - 找不到對應 id 會列為錯誤並中止，不會默默略過
 */
import { PrismaClient } from '@prisma/client'
import { readFileSync, existsSync } from 'node:fs'

const prisma = new PrismaClient()

const args = process.argv.slice(2)
const WRITE = args.includes('--write')
const fileIdx = args.indexOf('--file')
const FILE = fileIdx !== -1 ? args[fileIdx + 1] : 'titles-export.csv'

/** 逐字元解析 CSV，正確處理引號內的逗號與換行。 */
function parseCsv(text) {
  const clean = text.replace(/^﻿/, '')
  const rows = []
  let row = []
  let cell = ''
  let inQuotes = false

  for (let i = 0; i < clean.length; i++) {
    const ch = clean[i]
    if (inQuotes) {
      if (ch === '"') {
        if (clean[i + 1] === '"') { cell += '"'; i++ } else { inQuotes = false }
      } else cell += ch
    } else if (ch === '"') inQuotes = true
    else if (ch === ',') { row.push(cell); cell = '' }
    else if (ch === '\r') { /* 忽略，交給 \n 處理 */ }
    else if (ch === '\n') { row.push(cell); rows.push(row); row = []; cell = '' }
    else cell += ch
  }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row) }
  return rows.filter((r) => r.some((c) => c.trim() !== ''))
}

const MODELS = {
  announcement: 'announcement',
  document: 'document',
  album: 'album',
  video: 'video',
}

async function main() {
  if (!existsSync(FILE)) {
    console.error(`找不到檔案：${FILE}`)
    console.error('請先執行 node scripts/migration/export-titles.mjs 產出 CSV。')
    process.exitCode = 1
    return
  }

  const rows = parseCsv(readFileSync(FILE, 'utf8'))
  const header = rows.shift().map((h) => h.trim())
  const col = Object.fromEntries(header.map((h, i) => [h, i]))

  for (const required of ['type', 'id', 'titleEn']) {
    if (col[required] === undefined) {
      console.error(`CSV 缺少必要欄位：${required}（目前表頭：${header.join(', ')}）`)
      process.exitCode = 1
      return
    }
  }

  console.log(`來源檔：${FILE}`)
  console.log(`模式　：${WRITE ? '實際寫入' : '預演（不寫入）'}\n`)

  const planned = []
  const errors = []

  for (const [lineNo, r] of rows.entries()) {
    const type = (r[col.type] ?? '').trim()
    const id = (r[col.id] ?? '').trim()
    const titleEn = (r[col.titleEn] ?? '').trim()
    const titleZh = col.titleZh !== undefined ? (r[col.titleZh] ?? '').trim() : ''

    if (!titleEn) continue                       // 還沒填英文標題，跳過
    if (!MODELS[type]) { errors.push(`第 ${lineNo + 2} 列：不認識的 type「${type}」`); continue }

    const current = await prisma[MODELS[type]].findUnique({
      where: { id },
      select: { titleZh: true, titleEn: true },
    })
    if (!current) { errors.push(`第 ${lineNo + 2} 列：${type} 找不到 id=${id}`); continue }
    if (current.titleEn === titleEn) continue    // 沒變更，跳過

    planned.push({ type, id, titleZh: titleZh || current.titleZh, from: current.titleEn, to: titleEn })
  }

  if (errors.length) {
    console.error('發現錯誤，未寫入任何資料：')
    errors.forEach((e) => console.error('  ' + e))
    process.exitCode = 1
    return
  }

  if (!planned.length) {
    console.log('沒有需要更新的項目。')
    return
  }

  console.log(`預計更新 ${planned.length} 筆：\n`)
  for (const p of planned) {
    console.log(`  [${p.type}] ${p.titleZh}`)
    console.log(`      ${p.from ? `「${p.from}」` : '(空白)'}  →  「${p.to}」`)
  }

  if (!WRITE) {
    console.log('\n以上為預演結果。確認無誤後加上 --write 實際寫入。')
    return
  }

  await prisma.$transaction(
    planned.map((p) => prisma[MODELS[p.type]].update({ where: { id: p.id }, data: { titleEn: p.to } })),
  )

  console.log(`\n已寫入 ${planned.length} 筆。`)

  const remaining = {}
  for (const [label, model] of Object.entries(MODELS)) {
    remaining[label] = await prisma[model].count({ where: { titleEn: '' } })
  }
  console.log('剩餘英文標題空白：', remaining)
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())

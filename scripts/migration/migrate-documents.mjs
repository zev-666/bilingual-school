import { readdir, readFile, mkdir, copyFile, stat } from 'fs/promises'
import { join, dirname, extname } from 'path'
import { fileURLToPath } from 'url'
import { existsSync } from 'fs'
import * as cheerio from 'cheerio'
import { PrismaClient } from '@prisma/client'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const MIRROR_ROOT = join(ROOT, 'migration-source', 'englishcenter.kl.edu.tw', 'englishcenter.kl.edu.tw')
const DOCS_DIR = join(MIRROR_ROOT, 'docs')
const DOCS_FILE_DIR = join(DOCS_DIR, 'file')
const UPLOADS_DIR = join(ROOT, 'public', 'uploads', 'documents')
const BOT_USER_ID = 'cmtmkvcxu0000q7ztwxcoudts'

const WRITE = process.argv.includes('--write')

// 舊站分類 label → 新 DocumentCategory enum
const OLD_CAT_TO_NEW = {
  '其他': 'OTHER',
  '計畫': 'REGULATION',
  '競賽計畫': 'REGULATION',
  '競賽得獎名單': 'OTHER',
  '推動會議': 'REPORT',
}

// 副檔名 → MIME type
const MIME_BY_EXT = {
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xls': 'application/vnd.ms-excel',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.ppt': 'application/vnd.ms-powerpoint',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
}

// 資料夾內的 .html 是舊站內部頁面拷貝，不是文件本身，一律跳過
const SKIP_EXTS = new Set(['.html'])

const prisma = WRITE ? new PrismaClient() : null

function decodeHtmlEntities(text) {
  if (!text) return ''
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
}

/**
 * 解析 docs/<id>.html 詳情頁：
 * titleZh = h2 small、category = card-header 的 link title、descZh = card-body 第一個 p、
 * publishedAt = card-footer 的日期。
 */
async function parseDocsHtml(filePath) {
  const html = await readFile(filePath, 'utf-8')
  const $ = cheerio.load(html)
  const id = (filePath.split(/[\\/]/).pop() || '').replace('.html', '')

  const titleZh = decodeHtmlEntities($('h2 small').text().trim())
  const catLink = $('.card-header a.btn-info').first()
  const oldCat = (catLink.attr('title') || catLink.text().trim() || '其他').trim()
  const category = OLD_CAT_TO_NEW[oldCat] || 'OTHER'

  let descZh = ''
  const firstP = $('.card-body p').first()
  if (firstP.length) {
    descZh = firstP.clone().find('script, style, noscript').remove().end().text().replace(/\s+/g, ' ').trim()
  }

  const footerText = $('.card-footer').text() || ''
  let publishedAt = null
  const m = footerText.match(/(\d{4})-(\d{2})-(\d{2})\s+(\d{1,2}):(\d{2}):(\d{2})/)
  if (m) {
    publishedAt = new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6])
  }

  return { id, titleZh, oldCat, category, descZh, publishedAt }
}

/**
 * 掃描 docs/file/<folderId>/ 底下所有檔案（跳過 .html），
 * 組合出 Document 列。有詳情頁的資料夾用真實標題／分類／說明，
 * 其餘用「檔名去副檔名」當 titleZh，並在 descZh 標記 TECH DEBT。
 */
async function buildRows(detailById, defaultCategory) {
  const folders = (await readdir(DOCS_FILE_DIR)).sort((a, b) => +a - +b)
  const rows = []
  for (const folderId of folders) {
    const dirPath = join(DOCS_FILE_DIR, folderId)
    const names = (await readdir(dirPath)).filter((n) => !SKIP_EXTS.has(extname(n).toLowerCase()))
    const detail = detailById.get(folderId)

    for (const name of names) {
      const fullPath = join(dirPath, name)
      const st = await stat(fullPath)
      const src = detail ? 'html' : 'filename'
      const isTechDebt = !detail
      const titleZh = detail ? detail.titleZh : name.replace(/\.[^.]+$/, '')
      const descZh = detail
        ? detail.descZh
        : `[TECH DEBT] 標題取自檔名、分類為系統預設(${defaultCategory})，publishedAt 為檔案修改時間（推測日期），需人工覆核。原始路徑：docs/file/${folderId}/${name}`
      const category = detail ? detail.category : defaultCategory
      const publishedAt = detail ? detail.publishedAt : st.mtime
      const fileType = MIME_BY_EXT[extname(name).toLowerCase()] || 'application/octet-stream'
      const fileUrl = `/uploads/documents/${folderId}/${encodeURIComponent(name)}`

      rows.push({
        folderId,
        fileName: name,
        titleZh,
        titleEn: '',
        descZh,
        category,
        formType: 'ADMINISTRATIVE',
        fileUrl,
        fileSize: st.size,
        fileType,
        publishedAt,
        isPublished: true,
        authorId: BOT_USER_ID,
        src,
        isTechDebt,
      })
    }
  }
  return rows
}
async function copyRows(rows) {
  let copied = 0
  for (const r of rows) {
    const srcPath = join(DOCS_FILE_DIR, r.folderId, r.fileName)
    const destDir = join(UPLOADS_DIR, r.folderId)
    if (existsSync(srcPath)) {
      await mkdir(destDir, { recursive: true })
      await copyFile(srcPath, join(destDir, r.fileName))
      copied++
    } else {
      console.log(`  [SKIP] 檔案不存在: ${srcPath}`)
    }
  }
  return copied
}

function dbData(r) {
  return {
    titleZh: r.titleZh,
    titleEn: r.titleEn,
    descZh: r.descZh,
    category: r.category,
    formType: r.formType,
    fileUrl: r.fileUrl,
    fileName: r.fileName,
    fileSize: r.fileSize,
    fileType: r.fileType,
    isPublished: r.isPublished,
    authorId: r.authorId,
    publishedAt: r.publishedAt,
  }
}

async function writeRows(rows) {
  let created = 0
  let updated = 0
  for (const r of rows) {
    const existing = await prisma.document.findFirst({ where: { fileUrl: r.fileUrl } })
    if (existing) {
      await prisma.document.update({ where: { id: existing.id }, data: dbData(r) })
      updated++
    } else {
      await prisma.document.create({ data: dbData(r) })
      created++
    }
    console.log(`  [${existing ? 'UPDATED' : 'CREATED'}] ${r.fileUrl}`)
  }
  return { created, updated }
}

function printSample(label, r) {
  console.log('-'.repeat(70))
  console.log(`[${label}] folder ${r.folderId} / ${r.fileName}`)
  console.log(`  titleZh:       ${r.titleZh}`)
  console.log(`  titleEn:       ${r.titleEn || '(empty, 待補英文)'}`)
  console.log(`  category:      ${r.category}`)
  console.log(`  formType:      ${r.formType}`)
  console.log(`  descZh:        ${r.descZh || '(empty)'}`)
  console.log(`  fileUrl:       ${r.fileUrl}`)
  console.log(`  fileSize:      ${r.fileSize} bytes`)
  console.log(`  fileType:      ${r.fileType}`)
  console.log(`  publishedAt:   ${r.publishedAt ? r.publishedAt.toISOString() : '(null)'}${r.isTechDebt ? '  <- 推測（檔案修改時間）' : '  <- 詳情頁真實日期'}`)
  console.log(`  isPublished:   ${r.isPublished}`)
  console.log(`  authorId:      ${r.authorId}`)
}

async function main() {
  // 1) 抓 docs/*.html 詳情頁（ids）
  const docHtmlFiles = (await readdir(DOCS_DIR)).filter(
    (f) => f.endsWith('.html') && f !== 'docs.html' && !f.startsWith('G-')
  )
  const detailById = new Map()
  for (const f of docHtmlFiles) {
    const info = await parseDocsHtml(join(DOCS_DIR, f))
    detailById.set(info.id, info)
  }

  // 2) 最常見分類 = 預設分類
  const catCounts = {}
  for (const info of detailById.values()) {
    catCounts[info.category] = (catCounts[info.category] || 0) + 1
  }
  const defaultCategory = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0][0]

  console.log('='.repeat(70))
  console.log('PHASE 2: DOCUMENTS — 資料整理（DRY RUN，尚未寫入）')
  console.log('='.repeat(70))
  console.log(`詳情頁 HTML 數: ${detailById.size}`)
  console.log('舊站分類 → 新分類對應:')
  for (const [oldCat, newCat] of Object.entries(OLD_CAT_TO_NEW)) console.log(`  ${oldCat} -> ${newCat}`)
  console.log('詳情頁分類統計:', JSON.stringify(catCounts))
  console.log(`>> 預設分類 (出現最多): ${defaultCategory}`)
  console.log('')

// 3) 組列
  const rows = await buildRows(detailById, defaultCategory)
  const htmlRows = rows.filter((r) => r.src === 'html')
  const filenameRows = rows.filter((r) => r.src === 'filename')

  console.log('='.repeat(70))
  console.log('每資料夾筆數 (folderId | 筆數 | 來源)')
  console.log('='.repeat(70))
  const byFolder = {}
  for (const r of rows) {
    byFolder[r.folderId] = byFolder[r.folderId] || { n: 0, src: r.src }
    byFolder[r.folderId].n++
  }
  for (const fid of Object.keys(byFolder).sort((a, b) => +a - +b)) {
    const f = byFolder[fid]
    console.log(`  ${fid.padStart(4)} | ${String(f.n).padStart(2)} | ${f.src === 'html' ? '有詳情頁(真實標題)' : '檔名當標題(TECH DEBT)'}`)
  }

  console.log('')
  console.log('='.repeat(70))
  console.log('SAMPLE 1 — 有 HTML 詳情頁（真實標題/分類/日期）')
  console.log('='.repeat(70))
  printSample('HTML', htmlRows[0])
  console.log('')

  console.log('='.repeat(70))
  console.log('SAMPLE 2 — 無詳情頁（檔名當標題 + TECH DEBT 標記）')
  console.log('='.repeat(70))
  printSample('FILENAME', filenameRows[0])
  console.log('')

  console.log('='.repeat(70))
  console.log('SUMMARY (DRY RUN)')
  console.log('='.repeat(70))
  console.log(`資料夾總數:           ${new Set(rows.map((r) => r.folderId)).size}`)
  console.log(`實際匯入檔案數:       ${rows.length}`)
  console.log(`  有詳情頁 (真實資料): ${htmlRows.length}`)
  console.log(`  檔名當標題 (TECH DEBT): ${filenameRows.length}`)
  console.log('檔案型別分佈:')
  const typeCounts = {}
  for (const r of rows) typeCounts[r.fileType] = (typeCounts[r.fileType] || 0) + 1
  for (const [t, c] of Object.entries(typeCounts)) console.log(`  ${c} x ${t}`)
  console.log('將複製到:             public/uploads/documents/<folderId>/')
  console.log('')
  console.log('!! 尚未寫入資料庫：請先確認樣本格式再執行 node scripts/migrate-documents.mjs --write')
  console.log('!! 注意：Document 模型目前沒有 publishedAt 欄位，需先加欄位 + migrate + prisma generate，寫入才會成功。')

  if (WRITE) {
    console.log('')
    console.log('='.repeat(70))
    console.log('COPYING FILES')
    console.log('='.repeat(70))
    const copied = await copyRows(rows)
    console.log(`Copied: ${copied}`)

    console.log('')
    console.log('='.repeat(70))
    console.log('WRITING TO DATABASE')
    console.log('='.repeat(70))
    const res = await writeRows(rows)
    console.log(`Created: ${res.created}  Updated: ${res.updated}`)
    await prisma.$disconnect()
  }
}

main()
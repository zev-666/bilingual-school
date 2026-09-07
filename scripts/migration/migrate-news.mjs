import { readdir, readFile, mkdir, copyFile } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { existsSync } from 'fs'
import * as cheerio from 'cheerio'
import TurndownService from 'turndown'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const MIRROR_ROOT = join(ROOT, 'migration-source', 'englishcenter.kl.edu.tw', 'englishcenter.kl.edu.tw')
const NEWS_DIR = join(MIRROR_ROOT, 'news')
const NEWS_FILE_DIR = join(NEWS_DIR, 'file')
const UPLOADS_DIR = join(ROOT, 'public', 'uploads', 'announcements')
const OLD_SITE_BASE = 'https://englishcenter.kl.edu.tw'
const BOT_USER_ID = 'cmtmkvcxu0000q7ztwxcoudts'

const turndown = new TurndownService({
  headingStyle: 'atx',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
})
turndown.addRule('ignoreScripts', {
  filter: ['script', 'style', 'noscript'],
  replacement: () => '',
})

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
 * 處理附件檔案：把 news/file/[id]/xxx 複製到 public/uploads/announcements/[id]/，
 * 並把 Markdown 中的附件連結改寫為 /uploads/announcements/[id]/xxx。
 * 回傳 { rewritten, copied }。
 */
async function processAttachments(contentMd, newsId) {
  let rewritten = contentMd
  const copied = []
  // 匹配 markdown 附件連結：[..](file/ID/ENCODED_NAME "...")
  const re = /\[([^\]]*)\]\(file\/(\d+)\/([^)"\s]+)(?:\s+"([^"]*)")?\)/g
  let m
  while ((m = re.exec(contentMd)) !== null) {
    const label = m[1]
    const fileId = m[2]
    const encodedName = m[3]
    const title = m[4] || ''
    const decodedName = decodeURIComponent(encodedName)
    const srcDir = join(NEWS_FILE_DIR, fileId)
    const srcPath = join(srcDir, decodedName)
    const destDir = join(UPLOADS_DIR, newsId)
    const destPath = join(destDir, decodedName)
    const destUrl = `/uploads/announcements/${newsId}/${encodeURIComponent(decodedName)}`

    if (existsSync(srcPath)) {
      await mkdir(destDir, { recursive: true })
      await copyFile(srcPath, destPath)
      copied.push({ src: srcPath, dest: destPath })
      rewritten = rewritten.replace(m[0], `[${label}](${destUrl}${title ? ` "${title}"` : ''})`)
    } else {
      console.log(`  [SKIP] 附件不存在: ${srcPath}`)
    }
  }
  return { rewritten, copied }
}

/**
 * 處理內部連結：把 ../220.html 這種相對路徑改成絕對網址指回舊網站。
 * !! 技術債：這些應在之後手動整理成指向新網站對應頁面 !!
 */
function rewriteInternalLinks(contentMd) {
  let rewritten = contentMd
  const re = /\[([^\]]*)\]\(((?:\.\.\/)+[^)"\s\r\n]+\.html)(?:\s+"([^"]*)")?\)/g
  rewritten = rewritten.replace(re, (whole, label, href, title) => {
    const normalized = href.replace(/^\.\.\//g, '').replace(/\.html$/, '')
    const abs = `${OLD_SITE_BASE}/${normalized}`
    return `[${label}](${abs}${title ? ` "${title}"` : ''})`
  })
  return rewritten
}
async function parseNewsFile(filePath) {
  const html = await readFile(filePath, 'utf-8')
  const $ = cheerio.load(html)

  const rawTitle = $('h2 small').text().trim()
  const title = decodeHtmlEntities(rawTitle)
  const category = 'ANNOUNCEMENT'

  const contentHtml = $('.card-body').html() || ''
  let contentMd = turndown.turndown(contentHtml).trim()

  const footerText = $('.card-footer').text()
  const authorMatch = footerText.match(/([\u4e00-\u9fff\s\w]+?)\s*\n?\s*\d{4}-\d{2}-\d{2}/)
  const authorName = authorMatch ? authorMatch[1].trim() : null

  const dateMatch = footerText.match(/(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})/)
  const publishedAtStr = dateMatch ? dateMatch[1] : null
  const publishedAt = publishedAtStr ? new Date(publishedAtStr.replace(' ', 'T')) : null

  const filename = filePath.split(/[\\/]/).pop() || ''
  const idMatch = filename.match(/(\d+)\.html/)
  const newsId = idMatch ? idMatch[1] : filename.replace('.html', '')
  const slug = `news-${newsId}`

  // 1) 附件：複製檔案 + 改寫為 /uploads/...；2) 內部連結：改寫為舊站絕對網址
  const { rewritten: afterAttach, copied: copiedFiles } = await processAttachments(contentMd, newsId)
  const contentFinal = rewriteInternalLinks(afterAttach)

  return {
    newsId,
    slug,
    title,
    titleEn: '',
    contentZh: contentFinal,
    contentEn: '',
    category,
    authorName,
    publishedAtStr,
    publishedAt,
    isPublished: true,
    copiedFiles,
  }
}
async function writeToDatabase(results) {
  console.log('='.repeat(70))
  console.log('WRITING TO DATABASE')
  console.log('='.repeat(70))

  let upserted = 0
  let created = 0
  for (const r of results) {
    try {
      const existing = await prisma.announcement.findUnique({ where: { slug: r.slug } })
      await prisma.announcement.upsert({
        where: { slug: r.slug },
        update: {
          titleZh: r.title,
          titleEn: r.titleEn,
          contentZh: r.contentZh,
          contentEn: r.contentEn,
          category: r.category,
          isPublished: r.isPublished,
          publishedAt: r.publishedAt,
          authorId: BOT_USER_ID,
        },
        create: {
          slug: r.slug,
          titleZh: r.title,
          titleEn: r.titleEn,
          contentZh: r.contentZh,
          contentEn: r.contentEn,
          category: r.category,
          isPublished: r.isPublished,
          publishedAt: r.publishedAt,
          authorId: BOT_USER_ID,
        },
      })
      if (existing) {
        upserted++
      } else {
        created++
      }
      console.log(`  [${existing ? 'UPDATED' : 'CREATED'}] ${r.slug}`)
    } catch (e) {
      console.error(`  [ERROR] ${r.slug}: ${e.message}`)
    }
  }
  console.log(`Created: ${created}  Updated: ${upserted}`)
  return { created, upserted }
}

async function main() {
  const files = (await readdir(NEWS_DIR))
    .filter((f) => f.endsWith('.html') && !f.startsWith('G-') && f !== 'news.html')
    .sort()

  console.log(`Found ${files.length} news files to process\n`)

  const results = []
  for (const file of files) {
    const filePath = join(NEWS_DIR, file)
    try {
      const data = await parseNewsFile(filePath)
      results.push(data)
    } catch (e) {
      console.error(`Error parsing ${file}: ${e.message}`)
    }
  }

  console.log('All parsed entries:')
  results.forEach((r, i) => {
    console.log(`  ${i + 1}. ${r.slug} | content: ${r.contentZh?.length || 0} chars | attachments: ${r.copiedFiles.length}`)
  })
  console.log('')

  console.log('='.repeat(70))
  console.log('SAMPLE CONVERSIONS (5 entries, with fixed links)')
  console.log('='.repeat(70))

  const samples = results.filter((r) => r.contentZh && r.contentZh.length > 0).slice(0, 5)

  for (const s of samples) {
    console.log('-'.repeat(70))
    console.log(`Slug:       ${s.slug}`)
    console.log(`Title:      ${s.title}`)
    console.log(`Author:     ${s.authorName || '(none)'}`)
    console.log(`publishedAt is Date: ${s.publishedAt instanceof Date && !isNaN(s.publishedAt.getTime())}`)
    console.log(`Copied files (${s.copiedFiles.length}):`)
    s.copiedFiles.forEach((c) => console.log(`  ${c.src.split(/[\\/]/).pop()} -> ${c.dest.split(/[\\/]/).pop()}`))
    console.log(`Content:`)
    console.log(s.contentZh.slice(0, 700))
    if (s.contentZh.length > 700) console.log(`... (${s.contentZh.length} chars total)`)
    console.log('')
  }

  console.log('='.repeat(70))
  console.log('LINK REWRITE SUMMARY')
  console.log('='.repeat(70))
  let totalAttachments = 0
  results.forEach((r) => {
    totalAttachments += r.copiedFiles.length
  })
  console.log(`Total attachments copied: ${totalAttachments}`)
  results.forEach((r) => {
    const internalLinkCount = (r.contentZh.match(/\[[^\]]*\]\(https:\/\/englishcenter\.kl\.edu\.tw\/\d+[^)]*\)/g) || []).length
    if (internalLinkCount > 0) {
      console.log(`  ${r.slug}: ${internalLinkCount} internal link(s) -> absolute URL`)
    }
  })

  console.log('='.repeat(70))
  console.log('SUMMARY')
  console.log('='.repeat(70))
  console.log(`Total parsed:     ${results.length}`)
  console.log(`With valid Date:  ${results.filter((r) => r.publishedAt instanceof Date && !isNaN(r.publishedAt.getTime())).length}`)
  console.log(`With content:     ${results.filter((r) => r.contentZh && r.contentZh.length > 0).length}`)
  console.log(`Bot User ID:      ${BOT_USER_ID}`)
  console.log('')
  console.log('!! TECH DEBT: 內部連結目前指向舊網站絕對網址 (https://englishcenter.kl.edu.tw/xxx)。')
  console.log('!! 這些應該在之後手動整理，改為指向新網站的對應頁面。')

  // Write to DB
  await writeToDatabase(results)

  await prisma.$disconnect()
}

main()
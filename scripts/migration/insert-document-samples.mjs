import { mkdir, copyFile, stat } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { existsSync } from 'fs'
import { PrismaClient } from '@prisma/client'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const MIRROR_ROOT = join(ROOT, 'migration-source', 'englishcenter.kl.edu.tw', 'englishcenter.kl.edu.tw')
const DOCS_FILE_DIR = join(MIRROR_ROOT, 'docs', 'file')
const UPLOADS_DIR = join(ROOT, 'public', 'uploads', 'documents')
const BOT_USER_ID = 'cmtmkvcxu0000q7ztwxcoudts'
const prisma = new PrismaClient()

const MIME = {
  pdf: 'application/pdf',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
}

// folderId / fileName / titleZh / category / publishedAt 覆寫
const SAMPLES = [
  {
    folderId: '159', name: '0701筆記.pdf',
    titleZh: '英語素養導向跨領域校本課程設計初探研習筆記',
    category: 'OTHER',
    publishedAt: new Date(2021, 6, 12, 8, 55, 6), // 詳情頁真實日期 2021-07-12
    note: 'A. 有詳情頁 → 真實標題/分類/日期',
  },
  {
    folderId: '49', name: '基隆市113學年度下學期外籍教師教學訪視計畫0428.pdf',
    titleZh: '基隆市113學年度下學期外籍教師教學訪視計畫0428',
    category: 'REGULATION',
    publishedAt: null, // 留給檔案 mtime
    note: 'B. 無詳情頁 → 檔名當標題，publishedAt=檔案修改時間',
  },
  {
    folderId: '173', name: '英語村護照封面.jpg',
    titleZh: '英語村護照封面',
    category: 'REGULATION',
    publishedAt: null,
    note: 'C. JPG 圖片檔 → fileType=image/jpeg',
  },
  {
    folderId: '145', name: '基隆市108學年度英語教學資源中心協辦基隆市設置雙語學校輔導參訪計畫.pdf',
    titleZh: '基隆市108學年度英語教學資源中心協辦基隆市設置雙語學校輔導參訪計畫',
    category: 'REGULATION',
    publishedAt: undefined, // undefined → 明確存 null，測試排序 fallback
    note: 'D. publishedAt=NULL → 驗證排序退回 createdAt',
  },
]

async function main() {
  for (const s of SAMPLES) {
    const srcPath = join(DOCS_FILE_DIR, s.folderId, s.name)
    const st = await stat(srcPath)
    const destDir = join(UPLOADS_DIR, s.folderId)
    if (existsSync(srcPath)) {
      await mkdir(destDir, { recursive: true })
      await copyFile(srcPath, join(destDir, s.name))
    }
    const ext = s.name.includes('.') ? s.name.split('.').pop().toLowerCase() : ''
    const publishedAt = s.publishedAt === undefined ? null : s.publishedAt ?? st.mtime
    const fileType = MIME[ext] || 'application/octet-stream'
    const fileUrl = `/uploads/documents/${s.folderId}/${encodeURIComponent(s.name)}`
    const data = {
      titleZh: s.titleZh,
      titleEn: '',
      descZh: `[TECH DEBT] 渲染測試用樣本（${s.note}）。正式匯入後此欄位會被覆蓋。原始路徑：docs/file/${s.folderId}/${s.name}`,
      category: s.category,
      formType: 'ADMINISTRATIVE',
      fileUrl,
      fileName: s.name,
      fileSize: st.size,
      fileType,
      isPublished: true,
      authorId: BOT_USER_ID,
      publishedAt,
    }
    const existing = await prisma.document.findFirst({ where: { fileUrl } })
    if (existing) {
      await prisma.document.update({ where: { id: existing.id }, data })
      console.log(`[UPDATED] ${fileUrl}`)
    } else {
      await prisma.document.create({ data })
      console.log(`[CREATED] ${fileUrl}`)
    }
  }

  console.log('\n=== 目前 Document 全部（新排序邏輯：publishedAt desc, nulls last → createdAt desc）===')
  const rows = await prisma.document.findMany({
    orderBy: [{ publishedAt: { sort: 'desc', nulls: 'last' } }, { createdAt: 'desc' }],
    select: { titleZh: true, publishedAt: true, createdAt: true, category: true, fileSize: true },
  })
  rows.forEach((r, i) => {
    console.log(
      `${i + 1}. [${r.category}] ${r.titleZh} | publishedAt=${r.publishedAt ? r.publishedAt.toISOString() : 'NULL'} | createdAt=${r.createdAt.toISOString()} | ${r.fileSize} B`
    )
  })
}

main().finally(() => prisma.$disconnect())
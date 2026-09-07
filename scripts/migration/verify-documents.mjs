import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // ── 1) 總筆數 ─────────────────────────────────────────────
  const total = await prisma.document.count()
  console.log('== 1. DOCUMENT TOTAL ==')
  console.log(`  Total: ${total}`)

  // ── 2) 抽樣 3 筆：真實詳情頁 / 檔名代標題 / JPG ───────────
  console.log('')
  console.log('== 2. SAMPLES (3) ==')
  const samples = await prisma.document.findMany({
    where: { fileUrl: { in: [
      '/uploads/documents/159/0701%E7%AD%86%E8%A8%98.pdf',            // 真實詳情頁
      '/uploads/documents/49/%E5%9F%BA%E9%9A%86%E5%B8%82113%E5%AD%B8%E5%B9%B4%E5%BA%A6%E4%B8%8B%E5%AD%B8%E6%9C%9F%E5%A4%96%E7%B1%8D%E6%95%99%E5%B8%AB%E6%95%99%E5%AD%B8%E8%A8%AA%E8%A6%96%E8%A8%88%E7%95%AB0428.pdf', // 檔名代標題
      '/uploads/documents/173/%E8%8B%B1%E8%AA%9E%E6%9D%91%E8%AD%B7%E7%85%A7%E5%B0%81%E9%9D%A2.jpg', // JPG
    ] } },
    orderBy: { fileUrl: 'asc' },
  })
  for (const d of samples) {
    console.log('-'.repeat(64))
    console.log(`  titleZh:       ${d.titleZh}`)
    console.log(`  titleEn:       ${d.titleEn || '(empty)'}`)
    console.log(`  category/formType: ${d.category}/${d.formType}`)
    console.log(`  descZh:        ${(d.descZh || '').slice(0, 90)}`)
    console.log(`  fileUrl:       ${d.fileUrl}`)
    console.log(`  fileName:      ${d.fileName}`)
    console.log(`  fileSize:      ${d.fileSize} bytes (${d.fileType})`)
    console.log(`  publishedAt:   ${d.publishedAt ? d.publishedAt.toISOString() : 'NULL'}`)
    console.log(`  isPublished:   ${d.isPublished} | authorId: ${d.authorId}`)
  }

  // ── 3) TECH DEBT 待覆核統計 ──────────────────────────────
  console.log('')
  console.log('== 3. TECH DEBT 待覆核統計 ==')
  const techDebt = await prisma.document.findMany({
    where: { descZh: { startsWith: '[TECH DEBT]' } },
    select: { category: true, fileType: true },
  })
  console.log(`  TECH DEBT 筆數: ${techDebt.length}`)
  const byCat = {}
  const byType = {}
  for (const t of techDebt) {
    byCat[t.category] = (byCat[t.category] || 0) + 1
    byType[t.fileType] = (byType[t.fileType] || 0) + 1
  }
  console.log('  分類分佈:', JSON.stringify(byCat))
  console.log('  型別分佈:', JSON.stringify(byType))
  console.log(`  非 TECH DEBT（真實詳情頁資料）: ${total - techDebt.length}`)

  // 確認識別欄位無污染
  const nullPublished = await prisma.document.count({ where: { publishedAt: null } })
  console.log(`  其中 publishedAt 為 NULL: ${nullPublished}`)
}

main().finally(() => prisma.$disconnect())
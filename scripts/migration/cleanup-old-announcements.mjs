// 一次性腳本：清理搬遷前既有的 4 筆測試/佔位公告資料
// 用 slug 精準比對，逐一刪除（不用日期或其他條件模糊比對）
// 由使用者明確確認要刪除這 4 筆：welcome-2024、admission-2025、
// 115-activity-1786068039907、0824研習活動-1786495285941
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const TARGET_SLUGS = [
  'welcome-2024',
  'admission-2025',
  '115-activity-1786068039907',
  '0824研習活動-1786495285941',
]

async function main() {
  console.log('=== 刪除前：鎖定目標（精準 slug 比對） ===')
  const targets = await prisma.announcement.findMany({
    where: { slug: { in: TARGET_SLUGS } },
    orderBy: { slug: 'asc' },
    select: { id: true, slug: true, titleZh: true, titleEn: true, authorId: true, publishedAt: true, createdAt: true },
  })

  // 確認數量與清單
  console.log(`找到 ${targets.length} 筆（預期 4）:`)
  targets.forEach((a) =>
    console.log(`  slug=${a.slug} | titleZh=${a.titleZh} | titleEn=${a.titleEn || '(empty)'} | authorId=${a.authorId}`)
  )

  if (targets.length !== TARGET_SLUGS.length) {
    const found = new Set(targets.map((a) => a.slug))
    const missing = TARGET_SLUGS.filter((s) => !found.has(s))
    console.error(`\n⚠️ 數量不符預期！缺少 slug: ${missing.join(', ')}。中止，不做任何刪除。`)
    process.exitCode = 1
    return
  }

  console.log('\n=== 執行刪除 ===')
  let deleted = 0
  for (const t of targets) {
    const res = await prisma.announcement.delete({ where: { id: t.id } })
    console.log(`  ✅ 已刪除: ${res.slug} (${res.titleZh})`)
    deleted++
  }
  console.log(`\n共刪除 ${deleted} 筆`)

  // 刪除後確認總筆數應為 10
  const after = await prisma.announcement.count()
  console.log(`\n=== 刪除後 Announcement 表總筆數: ${after}（預期 10） ===`)

  // 列出剩下所有 slug 供交叉確認
  const remaining = await prisma.announcement.findMany({
    orderBy: { slug: 'asc' },
    select: { slug: true, titleZh: true, authorId: true },
  })
  remaining.forEach((a) => console.log(`  ${a.slug} | ${a.titleZh.slice(0, 50)} | authorId=${a.authorId}`))
}

main().finally(() => prisma.$disconnect())
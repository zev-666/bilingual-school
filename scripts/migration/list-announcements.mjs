import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const targetSlugs = ['welcome-2024', 'admission-2025', '115-activity-1786068039907', '0824研習活動-1786495285941']
  const rows = await prisma.announcement.findMany({
    where: { slug: { in: targetSlugs } },
    orderBy: { createdAt: 'asc' },
  })

  console.log(`Found ${rows.length} announcement(s)\n`)

  for (const a of rows) {
    console.log('='.repeat(70))
    console.log(`slug:          ${a.slug}`)
    console.log(`titleZh:       ${a.titleZh}`)
    console.log(`titleEn:       ${a.titleEn || '(empty)'}`)
    console.log(`category:      ${a.category}`)
    console.log(`isPublished:   ${a.isPublished}`)
    console.log(`isPinned:      ${a.isPinned}`)
    console.log(`publishedAt:   ${a.publishedAt}`)
    console.log(`createdAt:     ${a.createdAt.toISOString()}`)
    console.log(`updatedAt:     ${a.updatedAt.toISOString()}`)
    console.log(`authorId:      ${a.authorId}`)
    console.log(`coverImage:    ${a.coverImage || '(none)'}`)
    console.log(`viewCount:     ${a.viewCount}`)
    console.log('--- contentZh (全文) ---')
    console.log(a.contentZh || '(empty)')
    console.log('--- contentEn (全文) ---')
    console.log(a.contentEn || '(empty)')
    console.log('')
  }
}

main().finally(() => prisma.$disconnect())
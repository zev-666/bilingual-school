import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // 1) Total count
  const total = await prisma.announcement.count()
  console.log('== 1. ANNOUNCEMENT TOTAL ==')
  console.log(`  Total: ${total}`)

  // 2) Sample 2 entries with attachments
  console.log('')
  console.log('== 2. SAMPLE ENTRIES ==')
  const samples = await prisma.announcement.findMany({
    where: { slug: { in: ['news-52', 'news-54'] } },
    orderBy: { slug: 'asc' },
  })
  for (const s of samples) {
    console.log('-'.repeat(60))
    console.log(`  slug:              ${s.slug}`)
    console.log(`  titleZh:           ${s.titleZh}`)
    console.log(`  authorId:          ${s.authorId}`)
    console.log(`  publishedAt:       ${s.publishedAt}`)
    console.log(`  publishedAt type:  ${s.publishedAt instanceof Date ? 'Date' : typeof s.publishedAt}`)
    console.log(`  category:          ${s.category}`)
    console.log(`  isPublished:       ${s.isPublished}`)
    console.log(`  contentZh:`)
    console.log(`  ${s.contentZh?.slice(0, 400)}`)
    console.log('')
  }

  // 3) Check authorId matches bot
  console.log('== 3. AUTHOR CHECK ==')
  const bot = await prisma.user.findUnique({ where: { email: 'migration-bot@kl-erc.edu.tw' } })
  console.log(`  Bot user id: ${bot?.id ?? 'NOT FOUND'}`)
  console.log(`  Bot name:   ${bot?.name ?? 'N/A'}`)
  const mismatch = await prisma.announcement.count({
    where: { authorId: { not: bot?.id } },
  })
  console.log(`  Announcements NOT authored by bot: ${mismatch}`)
}

main().finally(() => prisma.$disconnect())
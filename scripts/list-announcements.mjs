import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const all = await prisma.announcement.findMany({
    orderBy: { createdAt: 'asc' },
    select: { slug: true, titleZh: true, authorId: true, createdAt: true },
  })
  console.log(`Total: ${all.length}\n`)
  for (const a of all) {
    console.log(`  slug=${a.slug} | authorId=${a.authorId} | ${a.titleZh?.slice(0, 30)} | created=${a.createdAt.toISOString()}`)
  }
}

main().finally(() => prisma.$disconnect())
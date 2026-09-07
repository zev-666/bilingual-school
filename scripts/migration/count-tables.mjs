import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const tables = ['Announcement', 'Document', 'Album', 'Photo', 'Video'] 
  for (const t of tables) {
    try {
      const count = await prisma[t].count()
      console.log(`${t}: ${count}`)
    } catch (e) {
      console.log(`${t}: ERROR ${e.message.split('\n')[0]}`)
    }
  }
}

main().finally(() => prisma.$disconnect())
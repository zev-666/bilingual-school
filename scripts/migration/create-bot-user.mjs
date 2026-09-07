import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const bot = await prisma.user.upsert({
    where: { email: 'migration-bot@kl-erc.edu.tw' },
    update: {},
    create: {
      name: '英語資源中心（資料匯入）',
      email: 'migration-bot@kl-erc.edu.tw',
      password: 'UNUSED_MIGRATION_BOT',
      role: 'AUTHOR',
    },
  })
  console.log('Migration bot user:')
  console.log('  id:', bot.id)
  console.log('  name:', bot.name)
  console.log('  email:', bot.email)
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e)
    prisma.$disconnect()
    process.exit(1)
  })

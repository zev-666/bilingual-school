// 團隊介紹種子資料：清掉 5+1 筆範例師資，寫入真實團隊 12 筆
// 用法：node scripts/migration/seed-team.mjs
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const TEAM = [
  // ── 召集人 ──
  { nameZh: '張雁婷', nameEn: 'Principal Ting',   titleZh: '總召集人',   titleEn: 'Convener',            type: 'CONVENER',      sortOrder: 1 },
  { nameZh: '李欣蓉', nameEn: 'Principal Rita',   titleZh: '副召集人',   titleEn: 'Deputy Convener',    type: 'CONVENER',      sortOrder: 2 },
  // ── 外籍顧問教師 ──
  { nameZh: 'Lan',    nameEn: 'Lan',              titleZh: '外籍顧問教師', titleEn: 'Foreign Consultant Teacher', type: 'FOREIGN', sortOrder: 1 },
  { nameZh: 'David',  nameEn: 'David',            titleZh: '外籍顧問教師', titleEn: 'Foreign Consultant Teacher', type: 'FOREIGN', sortOrder: 2 },
  { nameZh: 'Valerie',nameEn: 'Valerie',          titleZh: '外籍顧問教師', titleEn: 'Foreign Consultant Teacher', type: 'FOREIGN', sortOrder: 3 },
  // ── 中籍顧問教師 ──
  { nameZh: 'Danqi',  nameEn: 'Danqi',            titleZh: '中籍顧問教師', titleEn: 'Local Consultant Teacher',   type: 'LOCAL_ADVISOR', sortOrder: 1 },
  { nameZh: 'Justin', nameEn: 'Justin',           titleZh: '中籍顧問教師', titleEn: 'Local Consultant Teacher',   type: 'LOCAL_ADVISOR', sortOrder: 2 },
  // ── 行政團隊 ──
  { nameZh: 'Jimmy',  nameEn: 'Jimmy',            titleZh: '行政人員',    titleEn: 'Administrative Staff',  type: 'STAFF', sortOrder: 1 },
  { nameZh: 'Lynn',   nameEn: 'Lynn',             titleZh: '行政人員',    titleEn: 'Administrative Staff',  type: 'STAFF', sortOrder: 2 },
  { nameZh: 'Sophia', nameEn: 'Sophia',           titleZh: '行政人員',    titleEn: 'Administrative Staff',  type: 'STAFF', sortOrder: 3 },
  { nameZh: 'Sam',    nameEn: 'Sam',              titleZh: '行政人員',    titleEn: 'Administrative Staff',  type: 'STAFF', sortOrder: 4 },
  { nameZh: 'Alice',  nameEn: 'Alice',            titleZh: '行政人員',    titleEn: 'Administrative Staff',  type: 'STAFF', sortOrder: 5 },
]

const before = await prisma.teacher.count()
console.log(`[before] teachers 總數: ${before}`)

await prisma.$transaction(async (tx) => {
  // 1. 清掉既有種子資料（範例資料）
  const deleted = await tx.teacher.deleteMany({})
  console.log(`已刪除既有種子資料: ${deleted.count} 筆`)

  // 2. 寫入真實團隊
  for (const member of TEAM) {
    await tx.teacher.create({
      data: {
        ...member,
        avatar: null,
        subjects: [],
        isActive: true,
      },
    })
  }
})

const after = await prisma.teacher.count()
console.log(`[after] teachers 總數: ${after}`)
for (const t of await prisma.teacher.findMany({ select: { nameZh: true, type: true, titleZh: true, sortOrder: true }, orderBy: [{ type: 'asc' }, { sortOrder: 'asc' }] })) {
  console.log(`  ${t.type.padEnd(14)} sort=${t.sortOrder}  ${t.nameZh}  (${t.titleZh})`)
}
await prisma.$disconnect()
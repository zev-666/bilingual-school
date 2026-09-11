// 團隊介紹種子資料：清掉既有資料，寫入真實團隊 14 筆
// 用法：node scripts/migration/seed-team.mjs
//
// ⚠️ 破壞性腳本：內含 deleteMany({}) 會清空整張 teachers 表，
//    不是只更新這裡列出的人。若後台曾手動新增團隊成員，重跑會把他們一併刪掉。
//
// 2026/09/11 更新：分組由 4 組細分為 6 組，並修正下列事項
//   - Lan 更正為 Ian（原資料拼字錯誤）
//   - 新增 Ryk（外籍顧問）、Amy（中籍顧問）
//   - Alice 由行政團隊改列中籍顧問
//   - Danqi、Justin 由中籍顧問改列外籍輔導員
//   - Jimmy 由行政人員改列中籍輔導員
//   - Lynn／Sophia／Sam 行政團隊內職稱各自細分
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const TEAM = [
  // ── 召集人 ──
  { nameZh: '張雁婷', nameEn: 'Principal Ting', titleZh: '總召集人', titleEn: 'Convener',        type: 'CONVENER', sortOrder: 1 },
  { nameZh: '李欣蓉', nameEn: 'Principal Rita', titleZh: '副召集人', titleEn: 'Deputy Convener', type: 'CONVENER', sortOrder: 2 },

  // ── 外籍英語教學顧問 ──
  { nameZh: 'Ryk',    nameEn: 'Ryk',     titleZh: '外籍英語教學顧問', titleEn: 'Foreign English Teaching Adviser', type: 'FOREIGN', sortOrder: 1 },

  // ── 外籍英語教學輔導員 ──
  { nameZh: 'David',   nameEn: 'David',   titleZh: '外籍英語教學輔導員', titleEn: 'Foreign English Teaching Counsellor', type: 'FOREIGN_COUNSELLOR', sortOrder: 1 },
  { nameZh: 'Danqi',   nameEn: 'Danqi',   titleZh: '外籍英語教學輔導員', titleEn: 'Foreign English Teaching Counsellor', type: 'FOREIGN_COUNSELLOR', sortOrder: 2 },
  { nameZh: 'Justin',  nameEn: 'Justin',  titleZh: '外籍英語教學輔導員', titleEn: 'Foreign English Teaching Counsellor', type: 'FOREIGN_COUNSELLOR', sortOrder: 3 },
  { nameZh: 'Valerie', nameEn: 'Valerie', titleZh: '外籍英語教學輔導員', titleEn: 'Foreign English Teaching Counsellor', type: 'FOREIGN_COUNSELLOR', sortOrder: 4 },
  { nameZh: 'Ian',     nameEn: 'Ian',     titleZh: '外籍英語教學輔導員', titleEn: 'Foreign English Teaching Counsellor', type: 'FOREIGN_COUNSELLOR', sortOrder: 5 },

  // ── 中籍英語教學顧問 ──
  { nameZh: 'Amy',   nameEn: 'Amy',   titleZh: '中籍英語教學顧問', titleEn: 'Local English Teaching Adviser', type: 'LOCAL_ADVISOR', sortOrder: 1 },
  { nameZh: 'Alice', nameEn: 'Alice', titleZh: '中籍英語教學顧問', titleEn: 'Local English Teaching Adviser', type: 'LOCAL_ADVISOR', sortOrder: 2 },

  // ── 中籍英語教學輔導員 ──
  { nameZh: 'Jimmy', nameEn: 'Jimmy', titleZh: '中籍英語教學輔導員', titleEn: 'Local English Teaching Counsellor', type: 'LOCAL_COUNSELLOR', sortOrder: 1 },

  // ── 行政團隊 ──
  { nameZh: 'Lynn',   nameEn: 'Lynn',   titleZh: '專案助理', titleEn: 'Project Assistant',  type: 'STAFF', sortOrder: 1 },
  { nameZh: 'Sophia', nameEn: 'Sophia', titleZh: '商借教師', titleEn: 'Seconded Teacher',   type: 'STAFF', sortOrder: 2 },
  { nameZh: 'Sam',    nameEn: 'Sam',    titleZh: '專職人力', titleEn: 'Full-Time Staff',    type: 'STAFF', sortOrder: 3 },
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
  console.log(`  ${t.type.padEnd(18)} sort=${t.sortOrder}  ${t.nameZh}  (${t.titleZh})`)
}
await prisma.$disconnect()
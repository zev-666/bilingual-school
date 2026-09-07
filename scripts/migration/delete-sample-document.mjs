import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const rows = await prisma.document.findMany({
    orderBy: [{ publishedAt: { sort: 'desc', nulls: 'last' } }, { createdAt: 'desc' }],
    select: {
      id: true, titleZh: true, titleEn: true, category: true, formType: true,
      fileUrl: true, fileName: true, fileSize: true, isPublished: true,
      authorId: true, publishedAt: true, createdAt: true,
    },
  })

  console.log('=== 目前 Document 全數（排除本次 Step 3 樣本前） ===')
  rows.forEach((r) =>
    console.log(
      `id=${r.id} | [${r.category}/${r.formType}] ${r.titleZh} | fileUrl=${r.fileUrl} | created=${r.createdAt.toISOString()}`
    )
  )

  // 精確比對：titleZh 完全等於「研習證書」
  const target = rows.find((r) => r.titleZh === '研習證書')
  if (!target) {
    console.log('\n未找到 titleZh 完全等於「研習證書」的列，無需刪除。')
    return
  }

  console.log('\n=== 將刪除（用精確 id 鎖定） ===')
  console.log(
    `id=${target.id}\ncategory=${target.category}\nformType=${target.formType}\nfileUrl=${target.fileUrl}\nfileName=${target.fileName}\nfileSize=${target.fileSize}\nisPublished=${target.isPublished}\nauthorId=${target.authorId}\npublishedAt=${target.publishedAt}\ncreatedAt=${target.createdAt.toISOString()}`
  )

  const del = await prisma.document.delete({ where: { id: target.id } })
  console.log(`\n✅ 已刪除: ${del.id} (${del.titleZh})`)

  const after = await prisma.document.count()
  console.log(`\n刪除後 Document 總筆數: ${after}（僅剩 Step 3 的 4 筆樣本，供匯入時 upsert）`)
}

main().finally(() => prisma.$disconnect())
// 一次性腳本：清理搬遷前既有的 1 筆測試相簿資料
// 用 slug 精準比對（不用日期或其他條件模糊比對），transaction 內先刪 Photo 再刪 Album
// 由使用者明確確認要刪除：123-1786067983040（8 月初後台測試草稿，標題「123」，
// 內含 1 筆指向 Vercel Blob 的測試照片），跟先前清理的 4 筆測試公告同性質
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const TARGET_SLUG = '123-1786067983040'

async function main() {
  console.log('=== 刪除前：鎖定目標（精準 slug 比對） ===')
  const target = await prisma.album.findUnique({
    where: { slug: TARGET_SLUG },
    include: { photos: { select: { id: true, url: true } } },
  })

  if (!target) {
    console.error(`⚠️ 找不到 slug=${TARGET_SLUG} 的相簿。中止，不做任何刪除。`)
    process.exitCode = 1
    return
  }
  if (target.slug.startsWith('photo-')) {
    console.error('⚠️ 偵測到搬遷資料格式，安全防呆中止。')
    process.exitCode = 1
    return
  }

  console.log(`找到 1 筆（預期 1）:`)
  console.log(`  slug=${target.slug} | titleZh=${target.titleZh} | photos=${target.photos.length} 筆`)
  target.photos.forEach((ph) => console.log(`    photo id=${ph.id} url=${ph.url}`))

  console.log('\n=== 執行刪除（transaction：先 Photo 後 Album） ===')
  const result = await prisma.$transaction(async (tx) => {
    const photos = await tx.photo.deleteMany({ where: { albumId: target.id } })
    const album = await tx.album.delete({ where: { id: target.id } })
    return { photos: photos.count, album }
  })
  console.log(`  ✅ 已刪除 Photo ${result.photos} 筆`)
  console.log(`  ✅ 已刪除 Album: ${result.album.slug} (${result.album.titleZh})`)

  // 刪除後確認總筆數應為 65 / 709
  const albumCount = await prisma.album.count()
  const photoCount = await prisma.photo.count()
  console.log(`\n=== 刪除後 Album 總筆數: ${albumCount}（預期 65） | Photo 總筆數: ${photoCount}（預期 709） ===`)
}

main().finally(() => prisma.$disconnect())

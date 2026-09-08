// Phase 3 驗證：Album/Photo 寫入結果三項檢查
import { PrismaClient } from '@prisma/client';
import { existsSync, statSync } from 'node:fs';
import { join } from 'node:path';

const prisma = new PrismaClient();
const UPLOADS = join(process.cwd(), 'public', 'uploads', 'photos');

// ① 總筆數
const albumCount = await prisma.album.count();
const photoCount = await prisma.photo.count();
console.log(`① Album 總筆數: ${albumCount}（預期 65） | Photo 總筆數: ${photoCount}（預期 709）`);

// ② 抽樣 photo-44 / photo-45
for (const slug of ['photo-44', 'photo-45']) {
  const a = await prisma.album.findUnique({ where: { slug }, include: { photos: { orderBy: { sortOrder: 'asc' } } } });
  console.log(`\n② 抽樣 ${slug}:`);
  console.log(`  titleZh=${a.titleZh} | titleEn=${JSON.stringify(a.titleEn)} | category=${a.category}`);
  console.log(`  eventDate=${a.eventDate?.toISOString()} | publishedAt=${a.publishedAt?.toISOString()}`);
  console.log(`  coverImage=${a.coverImage} | isPublished=${a.isPublished} | authorId=${a.authorId}`);
  console.log(`  photos: ${a.photos.length} 張 | 第一張 isCover=${a.photos[0].isCover} sortOrder=${a.photos[0].sortOrder} fileSize=${a.photos[0].fileSize}`);
  console.log(`  第一張 url=${a.photos[0].url}`);
  const p = a.photos[0];
  const disk = join(UPLOADS, slug.replace('photo-', ''), decodeURIComponent(p.url.split('/').pop()));
  const onDisk = existsSync(disk);
  console.log(`  實體檔案存在=${onDisk} ${onDisk ? `(磁碟 ${statSync(disk).size} bytes vs DB ${p.fileSize})` : `（找尋路徑: ${disk}）`}`);
}

// ③ TECH DEBT 統計 + authorId + 日期完整性
const bot = await prisma.user.findUnique({ where: { email: 'migration-bot@kl-erc.edu.tw' } });
const byCate = await prisma.album.groupBy({ by: ['category'], _count: true });
const titleEnEmpty = await prisma.album.count({ where: { slug: { startsWith: 'photo-' }, titleEn: '' } });
const noDate = await prisma.album.count({ where: { slug: { startsWith: 'photo-' }, OR: [{ eventDate: null }, { publishedAt: null }] } });
const nonBot = await prisma.album.count({ where: { slug: { startsWith: 'photo-' }, NOT: { authorId: bot.id } } });
const photoNoSize = await prisma.photo.count({ where: { fileSize: null } });
const coverMismatch = await prisma.album.count({ where: { slug: { startsWith: 'photo-' }, photos: { none: { isCover: true } } } });
console.log(`\n③ TECH DEBT 與完整性:`);
console.log(`  titleEn 空白（待人工補）: ${titleEnEmpty}/65`);
console.log(`  eventDate/publishedAt 為 null: ${noDate}`);
console.log(`  authorId 非 migration-bot: ${nonBot}`);
console.log(`  Photo fileSize 為 null: ${photoNoSize}`);
console.log(`  沒有 isCover 照片的相簿: ${coverMismatch}`);
console.log(`  分類分布:`, byCate.map(c => `${c.category}=${c._count}`).join(' '));
await prisma.$disconnect();

// 查出 Album 66/Photo 710 比 65/709 多出的那一筆
import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
const albums = await p.album.findMany({
  select: { id: true, slug: true, titleZh: true, category: true, isPublished: true, createdAt: true, authorId: true, _count: { select: { photos: true } } },
  orderBy: { createdAt: 'asc' },
});
console.log('全部 Album:');
for (const a of albums) {
  const tag = a.slug.startsWith('photo-') ? '[搬遷]' : '[非搬遷]';
  console.log(`${tag} slug=${a.slug} | title=${a.titleZh} | cate=${a.category} | published=${a.isPublished} | photos=${a._count.photos} | created=${a.createdAt.toISOString()}`);
}
const noSize = await p.photo.findMany({ where: { fileSize: null }, select: { url: true, album: { select: { slug: true, titleZh: true } } } });
console.log('\nfileSize=null 的 Photo:');
for (const x of noSize) console.log(`${x.album.slug}（${x.album.titleZh}）-> ${x.url}`);
await p.$disconnect();

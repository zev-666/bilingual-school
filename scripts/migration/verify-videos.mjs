// Phase 4 驗證：三項檢查（總筆數/抽樣/技術債統計）
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const YT_ID = /^[A-Za-z0-9_-]{11}$/;

const all = await prisma.video.findMany({ include: { author: { select: { name: true, email: true } } }, orderBy: { slug: 'asc' } });
const mig = all.filter(v => v.slug.startsWith('video-'));
const others = all.filter(v => !v.slug.startsWith('video-'));

console.log('===== ① 總筆數 =====');
console.log(`Video 表總計: ${all.length} 筆 | 搬遷(video-*): ${mig.length} 筆 | 非搬遷: ${others.length} 筆`);
for (const v of others) console.log(`[非搬遷] slug=${v.slug} | title=${v.titleZh} | source=${v.source} | isPublished=${v.isPublished} | embedId=${v.embedId} | author=${v.author.name} | created=${v.createdAt.toISOString().slice(0, 10)}`);

console.log('\n===== ② 抽樣（video-25 / video-34 / video-5）=====');
for (const sid of ['video-25', 'video-34', 'video-5']) {
  const v = mig.find(x => x.slug === sid);
  if (!v) { console.log(`找不到 ${sid}!`); continue; }
  console.log(`\n--- ${sid} ---`);
  console.log(`titleZh: ${v.titleZh}`);
  console.log(`titleEn: "${v.titleEn}" | source: ${v.source} | duration: ${v.duration} | isPublished: ${v.isPublished}`);
  console.log(`videoUrl: ${v.videoUrl}`);
  console.log(`embedId: ${v.embedId} (格式${YT_ID.test(v.embedId) ? '正確 11 碼 ✓' : '異常 ✗'})`);
  console.log(`thumbnail: ${v.thumbnail}`);
  console.log(`descZh: ${v.descZh ? `${v.descZh.slice(0, 40)}… (${v.descZh.length} 字)` : 'null'}`);
  console.log(`descEn: ${v.descEn ? `${v.descEn.slice(0, 40)}… (${v.descEn.length} 字)` : 'null'}`);
  console.log(`publishedAt: ${v.publishedAt?.toISOString()} | authorId=${v.authorId} (${v.author.name})`);
}

console.log('\n===== ③ 完整性與技術債 =====');
const stats = {
  'embedId 格式正確': mig.filter(v => YT_ID.test(v.embedId)).length,
  'videoUrl 格式正確': mig.filter(v => v.videoUrl === `https://www.youtube.com/watch?v=${v.embedId}`).length,
  'thumbnail hqdefault': mig.filter(v => v.thumbnail === `https://i.ytimg.com/vi/${v.embedId}/hqdefault.jpg`).length,
  'publishedAt 有值': mig.filter(v => v.publishedAt).length,
  'publishedAt null': mig.filter(v => !v.publishedAt).length,
  'titleEn 空白(技術債)': mig.filter(v => !v.titleEn).length,
  'descZh 有值': mig.filter(v => v.descZh).length,
  'descEn 有值': mig.filter(v => v.descEn).length,
  'authorId=migration-bot': mig.filter(v => v.author.email === 'migration-bot@kl-erc.edu.tw').length,
  'isPublished=true': mig.filter(v => v.isPublished).length,
  'duration=null': mig.filter(v => v.duration === null).length,
};
for (const [k, val] of Object.entries(stats)) console.log(`  ${k}: ${val}`);
const dates = mig.map(v => v.publishedAt?.toISOString().slice(0, 10)).filter(Boolean).sort();
console.log(`  publishedAt 範圍: ${dates[0]} ~ ${dates[dates.length - 1]}`);
await prisma.$disconnect();

// Phase 4 步驟 2：影音遷移（Video）
// 資料來源：scripts/_video-inventory.json（26 筆，API + 詳情頁解析結果）
// 用法：
//   node scripts/migration/migrate-videos.mjs          # dry-run：只印樣本與統計，不寫 DB
//   node scripts/migration/migrate-videos.mjs --write  # 實際寫入（冪等 upsert）
import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'node:fs';

const WRITE = process.argv.includes('--write');
const prisma = new PrismaClient();
const SAMPLE_IDS = [25, 34, 5]; // 25=鏡像原有+完整中英摘要, 34=live補抓+變體(僅中文), 5=live補抓+無摘要

const inventory = JSON.parse(readFileSync('scripts/_video-inventory.json', 'utf8'));
console.log(`清單: ${inventory.length} 筆影音  模式: ${WRITE ? '--write 寫入' : 'DRY-RUN 只讀'}`);

// 建構寫入計畫
const plan = inventory.map(v => ({
  slug: `video-${v.id}`,
  titleZh: v.titleZh,
  titleEn: '', // 技術債：英文標題待人工補（比照 Phase 2/3 慣例）
  descZh: v.descZh || null,   // 29/5 原站就沒有摘要 → null（忠實反映，不用假文字頂）
  descEn: v.descEn || null,   // 34/18/29/5 原站無英文摘要 → null
  source: 'YOUTUBE',          // 26 筆全是 YouTube embed
  videoUrl: `https://www.youtube.com/watch?v=${v.youtubeId}`,
  embedId: v.youtubeId,
  thumbnail: `https://i.ytimg.com/vi/${v.youtubeId}/hqdefault.jpg`, // 高畫質版，不用 API 的 i3/0.jpg 低畫質版
  duration: null,             // 舊站無此資料（源頭沒有，非技術債）
  isPublished: true,
  publishedAt: v.detailTime ? new Date(v.detailTime.replace(' ', 'T')) : (v.mktime ? new Date(v.mktime) : null),
  authorId: '__BOT_ID__',
  _source: v.source,
  _detailTime: v.detailTime,
  _mktime: v.mktime,
}));

const bot = await prisma.user.findUnique({ where: { email: 'migration-bot@kl-erc.edu.tw' } });
if (!bot) { console.error('找不到 migration-bot 使用者，請先跑 create-bot-user.mjs'); process.exit(1); }
for (const p of plan) p.authorId = bot.id;

// 防呆檢查
const problems = [];
if (plan.some(p => !p.embedId)) problems.push('有 YouTube ID 缺失');
if (plan.some(p => !p.publishedAt)) problems.push('有 publishedAt 缺失（detailTime 與 mktime 都沒有）');
const badId = plan.find(p => !/^[A-Za-z0-9_-]{11}$/.test(p.embedId));
if (badId) problems.push(`embedId 格式異常: video-${badId.slug} → ${badId.embedId}`);
if (problems.length) { console.error('防呆檢查失敗:', problems); process.exit(1); }
console.log('防呆檢查: YouTube ID 26/26 ✓、publishedAt 26/26 ✓、embedId 格式皆為 11 碼 ✓');

// 統計
const existing = await prisma.video.findMany({ where: { slug: { startsWith: 'video-' } }, select: { slug: true } });
console.log(`DB 既有 video-* 影音: ${existing.length} 筆 ${existing.length ? '(--write 時以 slug upsert 更新)' : '(全新寫入)'}`);
console.log(`來源分布: 鏡像 ${plan.filter(p => p._source === 'mirror').length} 筆 / live 補抓 ${plan.filter(p => p._source === 'live-fetched').length} 筆`);
console.log(`publishedAt 全部用詳情頁精確時間戳: ${plan.filter(p => p._detailTime).length}/26（mktime fallback 使用: ${plan.filter(p => !p._detailTime && p._mktime).length} 筆）`);
console.log(`摘要完整度: descZh 有值 ${plan.filter(p => p.descZh).length}/26, descEn 有值 ${plan.filter(p => p.descEn).length}/26（缺的 4 筆=舊站本身無，見 fetch 報告）`);
console.log(`titleEn 空白（技術債待人工補）: ${plan.filter(p => !p.titleEn).length}/26`);

// 樣本輸出
for (const sid of SAMPLE_IDS) {
  const p = plan.find(x => x.slug === `video-${sid}`);
  console.log(`\n===== 樣本 video-${sid}（來源: ${p._source}）=====`);
  const { _source, _detailTime, _mktime, ...db } = p;
  console.log(JSON.stringify(db, null, 1));
}

if (!WRITE) {
  console.log('\nDRY-RUN 結束，未寫入任何資料。確認後加 --write 執行。');
  await prisma.$disconnect();
  process.exit(0);
}

let upserted = 0;
for (const p of plan) {
  const { _source, _detailTime, _mktime, ...db } = p;
  await prisma.video.upsert({ where: { slug: p.slug }, update: db, create: db });
  upserted++;
}
console.log(`DB 寫入: Video ${upserted} 筆 (upsert)`);
console.log('完成。');
await prisma.$disconnect();

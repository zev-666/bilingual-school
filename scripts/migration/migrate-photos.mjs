// Phase 3：相簿遷移（Album + Photo）
// 資料來源：scripts/_photo-inventory.json（65 相簿 metadata + 照片清單，取自舊站 API 偵查）
// 圖片來源：migration-source/.../photo/file/<id>/（鏡像，709 張原圖，縮圖不搬）
// 目標：
//   1. 複製原圖到 public/uploads/photos/<albumId>/
//   2. Album：slug=photo-<id>、titleZh、category（映射）、eventDate/publishedAt=mktime、
//      coverImage=第一張、isPublished=true、authorId=migration-bot
//   3. Photo：url、fileSize（從實際檔案讀）、isCover=第一張、sortOrder=索引
// 用法：
//   node scripts/migration/migrate-photos.mjs          # dry-run：只印樣本與檢查，不動檔案與 DB
//   node scripts/migration/migrate-photos.mjs --write  # 實際執行：複製檔案 + 寫入資料庫（冪等可重跑）
import { PrismaClient } from '@prisma/client';
import { existsSync, statSync, mkdirSync, copyFileSync, readFileSync, writeFileSync } from 'node:fs';
import { join, basename } from 'node:path';

const WRITE = process.argv.includes('--write');
const prisma = new PrismaClient();
const ROOT = join(process.cwd(), 'migration-source', 'englishcenter.kl.edu.tw', 'englishcenter.kl.edu.tw');
const UPLOADS = join(process.cwd(), 'public', 'uploads', 'photos');
const SAMPLE_IDS = [44, 45]; // 44=鏡像原有, 45=API 搶救回來

const CATEGORY_MAP = {
  '教師研習活動': 'WORKSHOP',
  '會議': 'MEETING',
  '外師訪視': 'VISIT',
  '活動照片': 'ACTIVITY',
  '其他': 'OTHER',
};
const MIME = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.gif': 'image/gif', '.webp': 'image/webp' };

const inventory = JSON.parse(readFileSync('scripts/_photo-inventory.json', 'utf8'));
console.log(`清單: ${inventory.length} 相簿 / ${inventory.reduce((s, a) => s + a.photos.length, 0)} 張照片  模式: ${WRITE ? '--write 寫入' : 'DRY-RUN 只讀'}`);

// 檢查 1：分類映射無遗漏
const unknownCates = [...new Set(inventory.map(a => a.cate).filter(c => !(c in CATEGORY_MAP)))];
if (unknownCates.length) { console.error('未知的分類值:', unknownCates); process.exit(1); }

// 建構完整寫入計畫（dry-run 也會跑，用來驗證與印樣本）
const plan = [];
const missingFiles = [];
for (const a of inventory) {
  const photos = a.photos.map((rel, i) => {
    const fname = basename(rel);
    const src = join(ROOT, rel);
    if (!existsSync(src)) { missingFiles.push(rel); return { rel, fname, missing: true }; }
    const size = statSync(src).size;
    return { rel, fname, src, dest: join(UPLOADS, String(a.id), fname), size, sortOrder: i, isCover: i === 0, url: `/uploads/photos/${a.id}/${fname}` };
  });
  plan.push({
    id: a.id,
    album: {
      slug: `photo-${a.id}`,
      titleZh: a.title,
      titleEn: '', // 技術債：英文標題待人工補
      category: CATEGORY_MAP[a.cate],
      eventDate: a.mktime ? new Date(a.mktime) : null,
      publishedAt: a.mktime ? new Date(a.mktime) : null,
      coverImage: photos[0]?.url ?? null,
      isPublished: true,
      authorId: '__BOT_ID__',
      sortOrder: 0,
    },
    photos: photos.map(p => ({ url: p.url, thumbnail: null, captionZh: null, captionEn: null, fileSize: p.size ?? null, isCover: p.isCover, sortOrder: p.sortOrder })),
    _src: photos, // 內部用：複製檔案用，不入 DB
  });
}
console.log(`鏡像檔案缺失: ${missingFiles.length} 張 ${missingFiles.length ? '(應為 0，請先跑 fetch-missing-photos.mjs)' : '✓'}`);
if (missingFiles.length) process.exit(1);

// 檢查 2：DB 既有衝突預覽（dry-run 也顯示）
const existingAlbums = await prisma.album.findMany({ where: { slug: { startsWith: 'photo-' } }, select: { slug: true } });
console.log(`DB 既有 photo-* 相簿: ${existingAlbums.length} 筆 ${existingAlbums.length ? '(--write 時會以 slug upsert 覆寫更新)' : '(全新寫入)'}`);

// 樣本輸出
const bot = await prisma.user.findUnique({ where: { email: 'migration-bot@kl-erc.edu.tw' } });
if (!bot) { console.error('找不到 migration-bot 使用者，請先跑 create-bot-user.mjs'); process.exit(1); }
for (const p of plan) p.album.authorId = bot.id;

for (const sid of SAMPLE_IDS) {
  const p = plan.find(x => x.id === sid);
  console.log(`\n===== 樣本 id=${sid} =====`);
  console.log(JSON.stringify({ album: p.album, photos: [...p.photos.slice(0, 3), { _note: `...共 ${p.photos.length} 張` }] }, null, 1));
  console.log(`(照片共 ${p.photos.length} 張; 實體檔案範例: ${p._src[0].src.replace(process.cwd(), '.')} → ${p._src[0].dest.replace(process.cwd(), '.')})`);
}

console.log(`\n===== 全部統計 =====`);
console.log(`Album: ${plan.length} 筆 | Photo: ${plan.reduce((s, p) => s + p.photos.length, 0)} 筆`);
const byCate = {};
for (const p of plan) byCate[p.album.category] = (byCate[p.album.category] || 0) + 1;
console.log('分類分布:', JSON.stringify(byCate));
console.log(`日期範圍: ${plan.map(p => p.album.eventDate?.toISOString().slice(0, 10)).filter(Boolean).sort()[0]} ~ ${plan.map(p => p.album.eventDate?.toISOString().slice(0, 10)).filter(Boolean).sort().pop()}`);

if (!WRITE) {
  console.log('\nDRY-RUN 結束，未複製任何檔案、未寫入任何資料。確認後加 --write 執行。');
  await prisma.$disconnect();
  process.exit(0);
}

// ---- 實際執行：複製檔案 + 寫入 DB ----
let copied = 0, copiedBytes = 0, skippedFiles = 0;
for (const p of plan) {
  mkdirSync(join(UPLOADS, String(p.id)), { recursive: true });
  for (const s of p._src) {
    if (existsSync(s.dest)) { skippedFiles++; continue; }
    copyFileSync(s.src, s.dest);
    copied++; copiedBytes += s.size;
  }
}
console.log(`檔案複製: 新複製 ${copied} 張 (${(copiedBytes / 1048576).toFixed(2)} MB), 已存在跳過 ${skippedFiles}`);

let upserted = 0, photoRows = 0;
for (const p of plan) {
  await prisma.$transaction(async tx => {
    const album = await tx.album.upsert({
      where: { slug: p.album.slug },
      update: { ...p.album },
      create: { ...p.album },
    });
    await tx.photo.deleteMany({ where: { albumId: album.id } });
    await tx.photo.createMany({ data: p.photos.map(ph => ({ ...ph, albumId: album.id })) });
    photoRows += p.photos.length;
    upserted++;
  });
}
console.log(`DB 寫入: Album ${upserted} 筆 (upsert), Photo ${photoRows} 筆`);
console.log('完成。');
await prisma.$disconnect();

// Phase 5A：線上教材資料搶救 — 下載/複製 7 個 PDF 到 public/uploads/books/<id>/
// 來源：
//   id=3,4   → 鏡像沒有，從舊站 live 下載（約 0.90 MB）
//   id=17,18 → 鏡像已有 5 個 PDF，直接複製
// 冪等：目標檔已存在則跳過（可中斷續傳）
// 完成後核對：7 檔、總 bytes 與 Content-Length/磁碟大小一致
// 用法：node scripts/migration/fetch-book-assets.mjs
import { existsSync, mkdirSync, copyFileSync, writeFileSync, statSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const BASE = 'https://englishcenter.kl.edu.tw';
const MIRROR = join(process.cwd(), 'migration-source', 'englishcenter.kl.edu.tw', 'englishcenter.kl.edu.tw', 'books');
const DEST_ROOT = join(process.cwd(), 'public', 'uploads', 'books');
const UA = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) mirror-completion', 'Referer': BASE + '/' };
const DELAY_MS = 300, RETRIES = 3, TIMEOUT_MS = 60000;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const sanitize = n => n.replace(/[\\:*?"<>|]/g, '_');

// 10 筆教材的 href（title 屬性）、from live href、mirror 是否有 PDF
// 手動列出（已從詳情頁交叉確認）
const BOOKS = [
  { id: 3, files: [{ name: '002DGES Presentation1.pdf', live: '/books/file/3/002DGES+Presentation1.pdf' }] },
  { id: 4, files: [{ name: '003 Lego Sentences.pdf', live: '/books/file/4/003+Lego+Sentences.pdf' }] },
  { id: 17, files: [{ name: '海洋英語故事書-國小雙面.pdf' }, { name: '1011228-東光國小-海洋議題英語故事書-國中版-跨頁.pdf' }] },
  { id: 18, files: [
    { name: '1030418-東光國小-漫畫繪本-AdventuresinLife-圖、對話框、無文字.pdf' },
    { name: '1030418-東光國小-漫畫繪本-AdventuresinLife-純圖.pdf' },
    { name: '1030218-東光國小-漫畫繪本-AdventuresinLife-全文.pdf' },
  ] },
];

let copied = 0, downloaded = 0, skipped = 0, failed = [];
let totalBytes = 0;
const details = [];

for (const b of BOOKS) {
  for (const f of b.files) {
    const fname = sanitize(f.name);
    const dest = join(DEST_ROOT, String(b.id), fname);
    const mirrorSrc = join(MIRROR, 'file', String(b.id), f.name);
    const mirrorSrcEncoded = join(MIRROR, 'file', String(b.id), encodeURIComponent(f.name));

    if (!existsSync(dest)) {
      mkdirSync(join(DEST_ROOT, String(b.id)), { recursive: true });

      // 優先找鏡像檔案（真實檔名或 URL-encoded 檔名都要找）
      let src = existsSync(mirrorSrc) ? mirrorSrc : (existsSync(mirrorSrcEncoded) ? mirrorSrcEncoded : null);

      if (src) {
        copyFileSync(src, dest);
        copied++;
      } else if (f.live) {
        // 鏡像沒有 → live 下載
        let ok = false, lastErr = '';
        for (let attempt = 1; attempt <= RETRIES && !ok; attempt++) {
          try {
            const ac = new AbortController();
            const timer = setTimeout(() => ac.abort(), TIMEOUT_MS);
            const res = await fetch(BASE + f.live, { headers: UA, signal: ac.signal });
            clearTimeout(timer);
            if (!res.ok) lastErr = `HTTP ${res.status}`;
            else {
              const buf = Buffer.from(await res.arrayBuffer());
              writeFileSync(dest, buf);
              downloaded++; ok = true;
            }
          } catch (e) { lastErr = e.name === 'AbortError' ? 'timeout' : e.message; }
          if (!ok && attempt < RETRIES) await sleep(1000 * attempt);
        }
        if (!ok) { failed.push({ id: b.id, name: f.name, error: lastErr }); }
      } else {
        failed.push({ id: b.id, name: f.name, error: 'no source' });
      }

      if (failed.length && failed.some(x => x.name === f.name)) continue;
    } else {
      skipped++;
    }

    const size = existsSync(dest) ? statSync(dest).size : 0;
    totalBytes += size;
    details.push({ id: b.id, name: f.name, bytes: size, path: `public/uploads/books/${b.id}/${encodeURIComponent(f.name)}` });
    await sleep(DELAY_MS);
  }
}

console.log(`\n完成: 下載 ${downloaded} 複製 ${copied} 跳過 ${skipped} 失敗 ${failed.length}`);
console.log(`總大小: ${(totalBytes / 1048576).toFixed(2)} MB`);
if (failed.length) console.log('失敗: ' + JSON.stringify(failed, null, 1));
writeFileSync('scripts/_book-assets-report.json', JSON.stringify({ total: details.length, downloaded, copied, skipped, failedCount: failed.length, totalBytes, details }, null, 1), 'utf8');
console.log('詳細清單 → scripts/_book-assets-report.json');
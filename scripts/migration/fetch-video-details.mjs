// Phase 4 步驟 1：補抓影音詳情頁 + 建立 inventory
// 來源：live API GET /video (XHR header → JSON 全量) + 詳情頁 HTML（鏡像既有 / live 補抓其餘）
// 產出：scripts/_video-inventory.json + scripts/_video-fetch-report.json
// 補抓的詳情頁 HTML 同時存回鏡像 video/<id>.html，讓鏡像趨近完整（比照 Phase 3 做法）
import { load } from 'cheerio';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const BASE = 'https://englishcenter.kl.edu.tw';
const VIDEO_DIR = join(process.cwd(), 'migration-source', 'englishcenter.kl.edu.tw', 'englishcenter.kl.edu.tw', 'video');
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// HTML 實體解碼：迴圈處理到字串不再變化為止，上限 10 輪
function deepDecode(s) {
  if (!s) return { text: s ?? '', rounds: 0, capped: false };
  let text = s, rounds = 0, capped = false;
  while (text.includes('&')) {
    const next = text
      .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&apos;/g, "'")
      .replace(/&nbsp;/g, ' ');
    rounds++;
    if (next === text) break; // 已無可解的實體（字串穩定）→ 正常結束
    text = next;
    if (rounds >= 10) { capped = true; break; }
  }
  return { text: text.trim(), rounds, capped };
}

// 分類中英文摘要：移除 .btn-group 後逐行判斷（CJK 主導 → zh；拉丁主導且已有 zh 內容 → en）
// 相容變體：id=34 無「中文摘要」標籤、單行中文、無英文
function parseSummary(cardBodyHtml) {
  const $ = load(cardBodyHtml);
  $('.btn-group').remove();
  const raw = $.text().replace(/\r/g, '');
  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
  let zh = [], en = [], enStarted = false;
  for (let line of lines) {
    line = line.replace(/^中\s*文\s*摘\s*要\s*[:：]?\s*/, '').replace(/^英\s*文\s*摘\s*要\s*[:：]?\s*/, '');
    if (!line) continue;
    const cjk = (line.match(/[\u3400-\u9FFF\uF900-\uFAFF\u3040-\u30FF]/g) || []).length;
    const latin = (line.match(/[A-Za-z]/g) || []).length;
    if (!enStarted && cjk >= Math.max(2, latin * 0.3)) zh.push(line);
    else if (!enStarted && cjk === 0 && latin >= 3) { enStarted = true; en.push(line); }
    else if (enStarted) en.push(line);
    else zh.push(line); // 混合行且尚未進入 en，保守歸 zh
  }
  return { descZh: zh.join(' '), descEn: en.join(' ') };
}

function parseDetail(html) {
  const $ = load(html);
  const body = $('div.card-body').first().html() ?? '';
  const { descZh, descEn } = parseSummary(body);
  const footerText = $('div.card-footer').first().text() ?? '';
  const tm = footerText.match(/(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})/);
  const iframeSrc = $('div.ratio iframe').first().attr('src') ?? '';
  const ytFromIframe = iframeSrc.match(/\/embed\/([A-Za-z0-9_-]+)/)?.[1] ?? null;
  return { descZh, descEn, detailTime: tm ? tm[1] : null, ytFromIframe };
}

// === 主流程 ===
const res = await fetch(`${BASE}/video`, { headers: { 'X-Requested-With': 'XMLHttpRequest' } });
if (!res.ok) { console.error(`API 失敗: HTTP ${res.status}`); process.exit(1); }
const api = await res.json();
console.log(`API 清單: ${api.length} 筆 (id: ${api.map(v => v.id).join(', ')})`);

let fromMirror = 0, fetchedLive = 0;
const failed = [], entries = [];
for (const v of api) {
  const file = join(VIDEO_DIR, `${v.id}.html`);
  const hadLocal = existsSync(file);
  let html = null;
  if (hadLocal) { html = readFileSync(file, 'utf8'); fromMirror++; }
  else {
    for (let attempt = 1; attempt <= 2 && !html; attempt++) {
      try {
        const r = await fetch(`${BASE}/video/${v.id}`, { headers: { 'User-Agent': 'Mozilla/5.0 (one-time migration archive)' } });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        html = await r.text();
        writeFileSync(file, html, 'utf8'); // 存回鏡像，讓鏡像趨近完整
        fetchedLive++;
      } catch (e) {
        if (attempt === 2) failed.push({ id: v.id, error: String(e) });
        else await sleep(1000);
      }
    }
    await sleep(300); // 對舊站溫和間隔
  }
  if (!html) continue;
  const d = parseDetail(html);
  const ytFromCode = v.code?.match(/i\d?\.ytimg\.com\/vi\/([^/]+)\//)?.[1] ?? null;
  const yt = d.ytFromIframe ?? ytFromCode;
  const dTitle = deepDecode(v.title);
  entries.push({
    id: v.id, title: v.title, titleZh: dTitle.text, decodeRounds: dTitle.rounds, decodeCapped: dTitle.capped,
    cate: v.cate, unit: v.unit, poster: v.poster, code: v.code, yearly: v.yearly, mktime: v.mktime,
    youtubeId: yt, ytFromIframe: d.ytFromIframe, ytFromCode,
    descZh: d.descZh, descEn: d.descEn, detailTime: d.detailTime,
    source: hadLocal ? 'mirror' : 'live-fetched',
  });
}
console.log(`詳情頁: 鏡像既有 ${fromMirror} 筆, live 補抓 ${fetchedLive} 筆, 失敗 ${failed.length} 筆`);

// 品質統計
const pick = (fn) => entries.filter(fn).map(e => e.id);
const descZhMissing = pick(e => !e.descZh);
const descEnMissing = pick(e => !e.descEn);
const capped = pick(e => e.decodeCapped);
const noTime = pick(e => !e.detailTime);
const noYt = pick(e => !e.youtubeId);
const ytMismatch = entries.filter(e => e.ytFromIframe && e.ytFromCode && e.ytFromIframe !== e.ytFromCode).map(e => e.id);
const maxRounds = Math.max(0, ...entries.map(e => e.decodeRounds));
console.log(`descZh 缺: ${descZhMissing.length ? descZhMissing.join(',') : '0 筆'}`);
console.log(`descEn 缺: ${descEnMissing.length ? descEnMissing.join(',') : '0 筆'}`);
console.log(`解碼達上限(10輪): ${capped.length ? capped.join(',') : '0 筆'} (最多使用 ${maxRounds} 輪)`);
console.log(`card-footer 時間戳缺: ${noTime.length ? noTime.join(',') : '0 筆'}`);
console.log(`YouTube ID 缺: ${noYt.length ? noYt.join(',') : '0 筆'}; iframe/code 兩來源皆有且不一致: ${ytMismatch.length ? ytMismatch.join(',') : '0 筆'}`);

writeFileSync('scripts/_video-inventory.json', JSON.stringify(entries, null, 1), 'utf8');
writeFileSync('scripts/_video-fetch-report.json', JSON.stringify({
  fetchedAt: new Date().toISOString(), apiEntries: api.length, fromMirror, fetchedLive, failed,
  descZhMissing, descEnMissing, decodeCapHit: capped, detailTimeMissing: noTime, youtubeIdMissing: noYt, ytMismatch,
}, null, 1), 'utf8');
console.log(`\n已寫入 scripts/_video-inventory.json (${entries.length} 筆) + scripts/_video-fetch-report.json`);


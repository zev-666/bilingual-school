import { chromium } from 'playwright'
import { AxeBuilder } from '@axe-core/playwright'
import { writeFileSync, mkdirSync } from 'node:fs'

const BASE = process.env.BASE_URL || 'http://localhost:3000'
const PAGES = [
  ['首頁', '/zh-TW'], ['關於本中心', '/zh-TW/about'], ['最新消息', '/zh-TW/news'],
  ['文件下載', '/zh-TW/documents'], ['師資介紹', '/zh-TW/teachers'], ['活動相簿', '/zh-TW/albums'],
  ['活動影音', '/zh-TW/videos'], ['行事曆', '/zh-TW/calendar'], ['聯絡我們', '/zh-TW/contact'],
  ['隱私權政策', '/zh-TW/privacy'], ['資訊安全政策', '/zh-TW/security-policy'],
  ['首頁英文版', '/en'], ['後台登入', '/admin/login'],
]
const VIEWS = [['桌機 1280x800', 1280, 800], ['手機 390x844', 390, 844]]
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']

const L = []
const say = (s = '') => { L.push(s); console.log(s) }
let bad = 0, nodes = 0, done = 0

const b = await chromium.launch()
say('='.repeat(66))
say('  基隆市英語教育資源中心 — 無障礙自動化檢測報告')
say('='.repeat(66))
say(`  檢測時間：${new Date().toLocaleString('zh-TW')}`)
say(`  檢測對象：${BASE}`)
say(`  檢測工具：axe-core（@axe-core/playwright）`)
say(`  檢測依據：WCAG 2.0 / 2.1 / 2.2 之 A 與 AA 全部規則`)
say('='.repeat(66))

for (const [vn, w, h] of VIEWS) {
  say(`\n【${vn}】`)
  // 必須用 context.newPage()，用 browser.newPage() 時 axe 會假回報 0 violations
  const ctx = await b.newContext({ viewport: { width: w, height: h } })
  for (const [name, path] of PAGES) {
    const p = await ctx.newPage()
    try {
      const r = await p.goto(BASE + path, { waitUntil: 'networkidle', timeout: 45000 })
      if (r && r.status() >= 400) { say(`  [略過] ${name} HTTP ${r.status()}`); await p.close(); continue }
      const res = await new AxeBuilder({ page: p }).withTags(TAGS).analyze()
      done++
      if (!res.violations.length) say(`  [OK] ${name}　0 項違規`)
      else {
        const n = res.violations.reduce((s, v) => s + v.nodes.length, 0)
        bad += res.violations.length; nodes += n
        say(`  [NG] ${name}　${res.violations.length} 項違規 / ${n} 個節點`)
        for (const v of res.violations) {
          say(`     · [${v.impact}] ${v.id}：${v.help}（${v.nodes.length} 處）`)
          for (const nd of v.nodes.slice(0, 3)) {
            say(`         ${nd.target.join(' ')}`)
            const m = (nd.failureSummary || '').split('\n').filter(Boolean)[1]
            if (m) say(`         -> ${m.trim()}`)
          }
          if (v.nodes.length > 3) say(`         …另有 ${v.nodes.length - 3} 處`)
        }
      }
    } catch (e) { say(`  [錯誤] ${name}：${e.message.split('\n')[0]}`) }
    finally { await p.close() }
  }
  await ctx.close()
}
await b.close()

say('\n' + '='.repeat(66))
say(`  完成檢測 ${done} 個頁面（${PAGES.length} 頁 × ${VIEWS.length} 種尺寸）`)
say(`  違規規則數：${bad}　違規節點數：${nodes}`)
say(bad ? '  ❌ 請依上方逐項改善後重新檢測。' : '  ✅ 自動化檢測未發現違規項目。')
say('='.repeat(66))
say('\n  ⚠️ 對外提出本報告時請一併敘明：')
say('     axe-core 屬自動化檢測，業界公認約可涵蓋 WCAG 三至四成準則，')
say('     「0 violations」不等於通過無障礙標章，仍須以 Freego 官方單機版')
say('     檢測並經人工檢測程序。影音字幕與文字稿、alt 文字是否適切等，')
say('     機器無法代為判斷。')

mkdirSync('a11y-reports', { recursive: true })
const t = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14)
const f = `a11y-reports/無障礙檢測報告_${t}.txt`
writeFileSync(f, L.join('\n'), 'utf-8')
console.log(`\n報告已存檔：${f}`)
process.exit(bad ? 1 : 0)
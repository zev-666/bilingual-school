/**
 * 基隆市英語教育資源中心 — 無障礙自動化檢測
 *
 * 用 axe-core 掃描網站，產出可直接歸檔的檢測報告。
 * 檢測範圍：WCAG 2.0 / 2.1 / 2.2 的 A 與 AA 全部規則。
 *
 * 使用方式（在專案資料夾）：
 *   1. 先開一個終端機跑起網站：   npm run dev
 *   2. 另開一個終端機執行：       node a11y-scan.mjs
 *
 * 掃線上站（不必跑 npm run dev）：
 *   $env:BASE_URL="https://bilingual-school.vercel.app"; node a11y-scan.mjs
 */

import { chromium } from 'playwright'
import { AxeBuilder } from '@axe-core/playwright'
import { writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

// 要掃的頁面。之後新增頁面就加在這裡。
const PAGES = [
  ['首頁',            '/zh-TW'],
  ['關於本中心',      '/zh-TW/about'],
  ['最新消息',        '/zh-TW/news'],
  ['文件下載',        '/zh-TW/documents'],
  ['師資介紹',        '/zh-TW/teachers'],
  ['活動相簿',        '/zh-TW/albums'],
  ['活動影音',        '/zh-TW/videos'],
  ['行事曆',          '/zh-TW/calendar'],
  ['聯絡我們',        '/zh-TW/contact'],
  ['隱私權政策',      '/zh-TW/privacy'],
  ['資訊安全政策',    '/zh-TW/security-policy'],
  ['首頁（英文版）',  '/en'],
  ['後台登入',        '/admin/login'],
]

const VIEWPORTS = [
  ['桌機 1280×800', { width: 1280, height: 800 }],
  ['手機 390×844',  { width: 390,  height: 844 }],
]

// WCAG 2.0 / 2.1 / 2.2 的 A 與 AA 全部規則
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']

const IMPACT_ZH = {
  critical: '嚴重',
  serious:  '重大',
  moderate: '中等',
  minor:    '輕微',
}

function stamp() {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`
}

const out = []
const say = (s = '') => { out.push(s); console.log(s) }

async function main() {
  const started = new Date()
  const browser = await chromium.launch()

  say('═'.repeat(72))
  say('  基隆市英語教育資源中心 — 無障礙自動化檢測報告')
  say('═'.repeat(72))
  say(`  檢測時間：${started.toLocaleString('zh-TW')}`)
  say(`  檢測對象：${BASE_URL}`)
  say(`  檢測工具：axe-core（透過 @axe-core/playwright）`)
  say(`  檢測依據：WCAG 2.0 / 2.1 / 2.2 之 A 與 AA 全部規則`)
  say('═'.repeat(72))
  say()

  let totalViolations = 0
  let totalNodes = 0
  let scanned = 0
  let failed = []
  const byRule = new Map()

  for (const [vpName, viewport] of VIEWPORTS) {
    say(`\n${'─'.repeat(72)}`)
    say(`【${vpName}】`)
    say('─'.repeat(72))

    // ⚠️ 必須用 context.newPage()，不能用 browser.newPage()。
    //    用後者時 axe 會靜靜回報 0 violations（假通過），這是踩過的坑。
    const context = await browser.newContext({ viewport })

    for (const [name, path] of PAGES) {
      const url = BASE_URL + path
      const page = await context.newPage()
      try {
        const res = await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 })
        const status = res ? res.status() : 0
        if (status >= 400) {
          say(`  ⚠️  ${name.padEnd(14, '　')} HTTP ${status} — 略過`)
          failed.push(`${name}（${vpName}）HTTP ${status}`)
          await page.close()
          continue
        }

        const result = await new AxeBuilder({ page }).withTags(TAGS).analyze()
        scanned++

        if (result.violations.length === 0) {
          say(`  ✅ ${name.padEnd(14, '　')} 0 項違規`)
        } else {
          const nodes = result.violations.reduce((s, v) => s + v.nodes.length, 0)
          totalViolations += result.violations.length
          totalNodes += nodes
          say(`  ❌ ${name.padEnd(14, '　')} ${result.violations.length} 項違規 / ${nodes} 個節點`)
          for (const v of result.violations) {
            const key = v.id
            if (!byRule.has(key)) byRule.set(key, { help: v.help, impact: v.impact, url: v.helpUrl, hits: [] })
            byRule.get(key).hits.push({ page: name, vp: vpName, nodes: v.nodes.length })
            say(`       · [${IMPACT_ZH[v.impact] || v.impact}] ${v.id}：${v.help}（${v.nodes.length} 處）`)
            for (const n of v.nodes.slice(0, 2)) {
              say(`           ${n.target.join(' ')}`)
              const msg = (n.failureSummary || '').split('\n').filter(Boolean)[1]
              if (msg) say(`           → ${msg.trim()}`)
            }
            if (v.nodes.length > 2) say(`           …另有 ${v.nodes.length - 2} 處`)
          }
        }
      } catch (err) {
        say(`  ⚠️  ${name.padEnd(14, '　')} 檢測失敗：${err.message.split('\n')[0]}`)
        failed.push(`${name}（${vpName}）${err.message.split('\n')[0]}`)
      } finally {
        await page.close()
      }
    }
    await context.close()
  }

  await browser.close()

  // ── 彙總 ──────────────────────────────────────────────
  say()
  say('═'.repeat(72))
  say('  檢測結果彙總')
  say('═'.repeat(72))
  say(`  實際完成檢測：${scanned} 個頁面（${PAGES.length} 頁 × ${VIEWPORTS.length} 種螢幕尺寸）`)
  say(`  違規規則數　：${totalViolations}`)
  say(`  違規節點數　：${totalNodes}`)
  if (failed.length) {
    say(`  ⚠️ 未能檢測：${failed.length} 項`)
    failed.forEach(f => say(`      · ${f}`))
  }

  if (byRule.size) {
    say()
    say('  ── 違規項目彙整（依規則）──')
    const sorted = [...byRule.entries()].sort((a, b) => {
      const order = { critical: 0, serious: 1, moderate: 2, minor: 3 }
      return (order[a[1].impact] ?? 9) - (order[b[1].impact] ?? 9)
    })
    for (const [id, info] of sorted) {
      const n = info.hits.reduce((s, h) => s + h.nodes, 0)
      say(`  [${IMPACT_ZH[info.impact] || info.impact}] ${id}`)
      say(`      ${info.help}`)
      say(`      影響 ${info.hits.length} 個頁面／共 ${n} 個節點`)
      say(`      說明：${info.url}`)
    }
  }

  say()
  say('═'.repeat(72))
  if (totalViolations === 0) {
    say('  ✅ 自動化檢測未發現違規項目。')
  } else {
    say(`  ❌ 發現 ${totalViolations} 項違規，請依上方彙整逐項改善後重新檢測。`)
  }
  say('═'.repeat(72))
  say()
  say('  ⚠️ 重要說明（對外提出本報告時請一併敘明）：')
  say('     axe-core 屬自動化檢測工具，業界公認約可涵蓋 WCAG 三至四成的準則。')
  say('     「0 violations」不等於通過無障礙標章，仍須以 Freego 官方單機版檢測')
  say('     並經人工檢測程序。影音字幕與文字稿（WCAG 1.2.2／1.2.3）、alt 文字')
  say('     內容是否適切、鍵盤操作順序是否合理等項目，機器無法代為判斷。')
  say()

  // ── 存檔 ──────────────────────────────────────────────
  const dir = 'a11y-reports'
  mkdirSync(dir, { recursive: true })
  const file = join(dir, `無障礙檢測報告_${stamp()}.txt`)
  writeFileSync(file, out.join('\n'), 'utf-8')
  console.log(`\n報告已存檔：${file}`)
  console.log('請把這個檔案歸檔，作為年度無障礙檢測之佐證。')

  process.exit(totalViolations > 0 ? 1 : 0)
}

main().catch((e) => {
  console.error('檢測程式異常中止：', e)
  process.exit(2)
})

# 專案進度存檔（合併版 v14 — 供新對話框接續使用）

專案：基隆市英語教育資源中心（原雙語實驗學校）
Repo：`zev-666/bilingual-school`　正式網址：https://bilingual-school.vercel.app
電腦環境：Windows / PowerShell + VS Code，Node.js v20.19.2
本文件為單一進度來源，最後更新：2026年8月14日（🔧 修正 v13 記錄的配色狀態錯誤——實際查證後確認目前線上是「網格漸層 藍/青/黃綠」，不是「大地暖色系」，使用者確認維持現狀；✅ 5 個首頁區塊套用 Reveal 滾動淡入動畫並 push 上線；✅ 招生資訊殘留（Hero按鈕/翻譯字串/Breadcrumb/quicklinks）全部清除並 push 上線；三項都有 commit hash 核對，不是口頭記錄）

⚠️ **v14 更新摘要（給下次接手的 Claude 看，不要漏看）**：這輪做了三件事，全部有 commit hash 佐證：
1. **修正了 v13 文件的一個錯誤記錄**——v13 曾記載「8/13 大地暖色系配色已上線、取代網格漸層藍青黃綠」，但這輪實際查證 `git log`、`git show HEAD:tailwind.config.ts` 後發現**剛好相反**：`tailwind.config.ts` 目前的 `primary-600` 是 `#185FA5`（藍色）、`accent-600` 是 `#7C8622`（黃綠色），跟「網格漸層藍青黃綠」章節的色票完全吻合，大地暖色系那次改版從未真正寫進正式設定檔。**使用者確認：維持現在的藍青黃綠配色，不用改回大地暖色系。**下方「✅ 全站配色三度改版」章節記錄的「已上線」文字保留作歷史記錄（供之後回顧錯誤是怎麼發生的），但**不代表實際狀態**，請一律以本節說明為準。
2. **Reveal 滾動淡入動畫**：`Reveal.tsx` 元件本身早就存在，但這輪查證前從未真正套用到任何區塊。已完整套用到 `QuickLinksSection.tsx`／`AboutSection.tsx`／`NewsSection.tsx`／`SocialSection.tsx`／`CoolEnglishSection.tsx` 這 5 個檔案，commit `0481fe6`（5 files changed, 144 insertions, 133 deletions），已 push。
3. **招生資訊功能徹底清除**：先前幾輪只清了導覽列跟獨立頁面，這輪用 `git grep` 找出還殘留在 `HeroSection.tsx`（Hero 區塊「招生資訊」按鈕，連到已不存在的 `/admission`，是死連結）、`zh-TW.json`／`en.json`（`nav.admission`、`home.hero.cta_secondary`、`home.quicklinks.admission`、整段 `admission` 翻譯區塊）、`Breadcrumb.tsx`（`NAV_KEYS` 陣列）的殘留，全部移除，commit `c193676`，已 push。**`news.categories.ADMISSION`（公告分類「招生」）刻意保留沒動**，這是合法的公告分類功能，跟已刪除的獨立招生頁面是兩回事。

⚠️ **這輪的教訓（給 Claude 看，之後查證配色/上線狀態時適用）**：v13 那次「已上線」記錄之所以出錯，是因為只採信了使用者事後補述的一句話，沒有實際核對 commit hash 或設定檔內容。**這輪示範的正確做法**：直接請使用者跑 `git log --oneline`、`git show <commit>:<檔案路徑>` 把實際內容印出來核對，比單純問「有上線嗎」可靠得多。之後任何「不確定是否已上線／已套用」的狀態，都建議用這個方式查證，不要只憑單一句話記錄成確定事實。

⚠️ **重要提醒（給 Claude 看）**：使用者會同時開多個對話框（含不同 AI，曾出現 Claude + Gemini 並行）處理同一個專案。每個對話框彼此看不到對方內容，唯一的共同進度來源就是這份文件。每次接續工作前，務必先確認這份文件是否為「最新版」——如果使用者說某項目已經在別的對話框處理過，直接相信使用者的說法並更新狀態，不要因為「這個對話框沒印象」就懷疑或重複詢問。**8/14 補充**：即使相信使用者說法，涉及「配色/功能是否已上線」這類可以用 git 客觀核對的狀態，還是建議順手核對一次 commit/設定檔，跟使用者的說法互相印證，比單信一句話更扎實（見上方本輪教訓）。

🚨 **交付流程鐵則（血淚教訓，務必遵守）**：在沙盒容器裡改完檔案、跑完 build 驗證，**不代表使用者電腦上的檔案有任何變化**。沙盒容器跟使用者的本機/GitHub 是完全隔離的兩個環境。每次改完程式碼，一定要用以下其中一種方式「實際交付」給使用者，光是自己驗證過就結束是嚴重疏失：
- 產生 `git diff` patch 檔，用 `present_files` 給使用者下載，請他 `git apply` 套用
- 或直接把完整檔案內容／逐段修改指示貼給使用者，用他慣用的「`code 檔名` → 找到對應段落 → 手動修改 → 存檔」方式手動更新
- 絕對不要在沙盒裡改完、build 過了，就當作任務已完成——那只是「設計驗證」，不是「交付」
- **新教訓（本輪發生）**：`present_files` 產生的下載連結，使用者存到電腦後檔案路徑/檔名不一定跟沙盒裡一樣（本輪 `git apply patch檔名` 出現 `No such file or directory`），**不要預設 patch 檔案一定能直接套用成功**。這種情況下，備援方案是直接把「找到 XX 段落 → 改成 YY」的逐段修改指示用純文字列出，讓使用者用 `code 檔名` 手動修改，比繼續除錯 patch 路徑問題更快更穩
- **8/12 驗證：這個工作模式非常順暢**——全程改用「完整檔案內容直接貼給使用者、使用者用檔案總管路徑覆蓋、逐一 `git add` + `git commit` 分批提交」的方式，使用者全程貼 PowerShell 實際輸出回來，每一步都有真實 commit hash 可核對，沒有再發生 patch 路徑失敗的狀況，值得作為之後的預設交付方式
- **8/14 再次驗證：同樣模式全程順暢**——這輪 Reveal 動畫（commit `0481fe6`）跟招生資訊清除（commit `c193676`）都用這個方式交付，使用者全程貼實際輸出回來核對，沒有問題。JSON 檔案這類容易漏改/改錯行的檔案，這輪還多加了一步 `python3 -c "import json; json.load(...)"` 在沙盒裡先驗證合法性再交付，建議之後改 JSON 檔案都比照辦理。
⚠️ **文件維護提醒**：這份文件曾經在某次整理時把舊內容「濃縮摘要」，結果遺漏了「插畫親和風」設計改版的完整規格。**之後更新這份文件時，只能用「新增/編輯」的方式增補，絕對不要把舊區塊改寫成一兩行摘要**——寧可文件變長，也不要遺漏細節。

---

## ⚠️ 設計方向再次變更說明（2026/08/13，務必先讀，這是第三次配色方向調整）

**這輪（8/13）的全站配色改版，跟下方「網格漸層 藍/青/黃綠」章節記錄的 8/12 配色方向，又是互相取代的關係。**目前網站配色方向的完整演進史：

1. **第一版（v6~v11 記錄，「插畫親和風」）**：暖黃底（`bg-amber-50`）+ 天空藍，`primary` 天空藍系（`#0ea5e9`）、`accent` 暖陽黃系（`#f59e0b`）
2. **第二版（8/12 記錄，「網格漸層 藍/青/黃綠」）**：使用者提供真實學校網站截圖參考，改成藍色主導、中段過渡青色、右下角黃綠色的 mesh gradient hero 背景，`primary` 改精確藍色（`#185FA5`）、`accent` 改黃綠色系（`#7C8622`）
3. **第三版（本輪 8/13 定案，取代第二版）**：使用者對 8/12 的藍青黃綠配色**不滿意**（回饋關鍵字接近「太淡沒精神」「不像教育機構、比較像別種網站」），透過三組視覺化配色小樣並排比較（Option 1 極簡雙色／Option 2 雙主色＋單一點綴／Option 3 大地暖色系），選定 **Option 3「大地暖色系」延伸版**：以米白／卡其／淺棕為主、搭配一點天空藍點綴，色號定案為 `#FBF8F1`、`#E9E5D6`、`#CDBB9D`、`#A98262`、`#A8C7D5`、`#4E514B`、`#DDD6C7`，**已套進正式 Next.js 元件並上線**（詳見下方「✅ 全站配色三度改版」章節）

**這代表什麼**：下方「網格漸層 藍/青/黃綠」章節（8/12）跟更早的「插畫親和風」章節（v6~v11）列出的具體色碼規格，**都已經不是網站現在實際的樣子**，兩者都保留作歷史記錄，但**下次要做視覺相關任務時，請以這份文件最上方、本節與下方「✅ 全站配色三度改版」章節的內容為準**。

**跟本輪相關、需要注意的技術細節**：
- 這輪配色定案的過程中，同時有**兩個平行對話框在改同一批 5 個檔案**（`QuickLinksSection.tsx`／`AboutSection.tsx`／`NewsSection.tsx`／`SocialSection.tsx`／`CoolEnglishSection.tsx`）——一邊在加滾動淡入動畫（`<Reveal>` 元件包裝），另一邊在換色（原本是大地色的更早版本，後來又因為使用者不滿意再改一輪）。因為兩邊都是「整份檔案覆蓋」而非局部編輯，**先套用的那邊動畫或配色會被後套用的整份覆蓋掉**，這是本輪處理過程中發現的問題，**下次接續時務必先確認這 5 個檔案，目前身上到底同時具備「大地暖色系配色」跟「`<Reveal>` 滾動淡入動畫」兩者，還是其中一個被覆蓋掉了**，不要假設兩者一定並存
- 這輪不像先前幾輪那樣有完整的 `npm run build` 輸出、`git commit` hash、`git push` 結果貼上來核對，**目前這輪的「已上線」狀態是根據使用者事後補充的一句話說明（「已经套进正式的 Next.js 元件并上线」）記錄下來，不是像之前那樣逐步用 commit hash 核對過的**，下次接續時如果要在這批檔案上動工，建議先跟使用者確認一次目前 `git log` 最新幾筆 commit 內容，把真正的 commit hash 補記錄進來，讓這節的可信度跟其他章節一致

---

## ✅ 全站配色三度改版：「大地暖色系」定案並上線（2026/08/13）

> 🔧 **8/14 更正（重要，請先讀這段再看下面）**：這個章節標題寫「已上線」，但經過 8/14 這輪實際查證 `git log`、`git show HEAD:tailwind.config.ts`，**確認這是錯誤記錄**。目前線上真正的 `primary-600` 是 `#185FA5`、`accent-600` 是 `#7C8622`，對應的是下方「網格漸層 藍/青/黃綠」章節的配色，不是這裡記錄的大地暖色系色票。大地暖色系那次改版的 commit（`e53cfea`）雖然存在，但在時間順序上發生在網格漸層相關 commit（`ac3c649`、`7e97a10`）**之前**，後來被蓋掉了，不是這裡寫的「取代」關係。**使用者已確認：維持現在的藍青黃綠配色，不需要改回大地暖色系。**下面這整段（背景、色票、已套用範圍）保留作為「這次錯誤記錄是怎麼發生的」歷史參考，之後如果要重新考慮大地暖色系方向，這裡的色票數值仍然可以直接拿來用，只是要當作「未上線的候選方案」，不是「已上線的現況」。

### 背景與定案過程
- 8/12 套用「網格漸層 藍/青/黃綠」配色後，使用者後續實際看過覺得不滿意，具體回饋接近「太淡沒精神」與「不像教育機構、比較像別種網站」這兩種感覺
- 診斷方向：彩度/對比度不夠，加上整頁缺少一處沉穩的深色錨點，導致「權威感、信任感不足，看起來像文創商店或個人部落格」
- 提供三組並排視覺小樣讓使用者實際看圖比較（而非只用文字描述猜配色），三組分別對應「常用比稿 Prompt 範本庫」章節裡的**比稿 3**規格：
  - **Option 1 極簡雙色**：只用天空藍 + 中性米白/奶油背景，不加第三色
  - **Option 2 雙主色＋單一點綴**：天空藍為主、暖黃為輔，僅此兩色
  - **Option 3 大地暖色系**：米白＋淺卡其／淺棕＋一點天空藍點綴，木質紙質的溫暖質感，裝飾色塊更柔和、飽和度更低
- 使用者選定 **Option 3 大地暖色系**，並在其基礎上延伸出正式套用到 Next.js 元件的最終色票

### 色票定案
| 色號 | 用途說明（依命名慣例與上下文推測，下次接續時建議跟使用者核對精確用途分配表） |
|---|---|
| `#FBF8F1` | 主要淺底色（米白，最大面積使用） |
| `#E9E5D6` | 次要淺底色（更深一階的米白/淺卡其） |
| `#CDBB9D` | 中間卡其色（裝飾色塊、卡片邊框或次要強調） |
| `#A98262` | 主強調色（淺棕，可能對應原本 primary 定位） |
| `#A8C7D5` | 點綴天空藍（延續前兩版都有的藍色元素，維持一點清爽感） |
| `#4E514B` | 深色錨點（沉穩深灰綠，用來補足「教育機構權威感、信任感」，對應診斷時提到「整頁缺少一處沉穩深色」的解方） |
| `#DDD6C7` | 邊框或分隔線用淺卡其色 |

⚠️ **這張表的「用途說明」是推測、不是使用者逐一確認過的精確對照表**——下次接續要在這套配色基礎上調整任何細節時，建議先跟使用者確認每個色號實際套用在 `tailwind.config.ts` 的哪個 token（`primary-*`／`accent-*`／其他自訂 token），因為這輪沒有像 8/12 那輪一樣留下逐一對照的色票表格。

### 已知已套用、但細節有待下次核對的範圍
- 使用者明確說明「已经套进正式的 Next.js 元件并上线」，**這句話是本輪記錄「已上線」狀態的唯一依據**，比照專案慣例（相信使用者告知的最新狀態，不需要重複舉證），先記錄為已完成
- 因為本輪沒有逐步核對 commit hash／`npm run build` 輸出，**下次接續時第一件事，建議先問使用者「這輪 8/13 的大地暖色系配色，git log 最新的 commit 是哪一筆？」**，把真正的 commit hash 補進這個章節，讓記錄跟其他章節一樣扎實可信

### 待確認：Reveal.tsx 滾動淡入動畫是否還在
上方「設計方向再次變更說明」章節已經記錄了這個風險：`QuickLinksSection.tsx`／`AboutSection.tsx`／`NewsSection.tsx`／`SocialSection.tsx`／`CoolEnglishSection.tsx` 這 5 個檔案，本輪配色定案的過程中，同時有另一個平行對話框在加 `<Reveal>` 滾動淡入動畫，**兩邊都是整份檔案覆蓋**，最後套用大地暖色系配色時，動畫效果有沒有被一併保留還是被蓋掉，**沒有明確確認過**。下次接續時，建議：
1. 先問使用者：「這 5 個區塊往下捲動時，還有沒有滾動淡入的動畫效果？」
2. 如果動畫消失了，需要在大地暖色系配色的版本基礎上，重新把 `<Reveal>` 包裝補回去（做法在 8/13 對話中已經討論過：先確認換色後的版本內容，再在上面補動畫包裝，不要整份互相覆蓋）

> ✅ **8/14 已解決**：用 `git grep -l "Reveal" -- "src/components"` 查證後發現，`Reveal.tsx` 元件當時**完全沒有被套用到任何一個區塊**——不是「被蓋掉」，是從來沒接上去過。這輪已經把 `<Reveal>` 正式套用到這 5 個檔案，其中有卡片並排的區塊（QuickLinks 的 4 張卡片、About 的特色卡、News 側欄、Social 的社群按鈕）額外做了 `delay={index * 0.1}` 交錯淡入效果。commit `0481fe6`（5 files changed, 144 insertions, 133 deletions），已 push 上線，不用再接續。

---

## ⚠️ 設計方向變更說明（2026/08/12，務必先讀，避免跟下方「插畫親和風」章節搞混）

**這輪（8/12）做的全站配色改版，跟下方「插畫親和風」章節記錄的暖黃配色方向，是互相取代的關係，不是同一件事的延續。**

- 舊方向（「插畫親和風」，v6~v11 記錄）：暖黃色底（`bg-amber-50`）+ 天空藍（`sky-*`），`tailwind.config.ts` 的 `primary` 是天空藍系（`#0ea5e9`）、`accent` 是暖陽黃系（`#f59e0b`）
- **新方向（本輪 8/12 定案，取代舊方向）**：使用者提供一張真實學校網站截圖作為參考（藍→青→黃綠的「網格漸層 mesh gradient」風格），確認要套用這個方向。已經把 `tailwind.config.ts` 的 `primary` 色階**再次改掉**，改成精確的藍色數值（`primary-600` = `#185FA5`），`accent` 色階從暖黃改成黃綠色系（`accent-600` = `#7C8622`）。首頁全部區塊、Navbar、Footer、About 頁面都已經套用新配色並 push 上線
- **這代表什麼**：下方「插畫親和風」章節列出的具體色碼規格（`bg-amber-50`、`bg-accent-400`、`text-accent-900`、`bg-sky-100`/`bg-amber-100`/`bg-rose-100` 卡片輪替色）**已經不是網站現在實際的樣子**，那些是舊方向的規格記錄，保留下來是尊重「只能增補不能刪減」的文件規則，但**下次要做視覺相關任務時，請以這個新章節、以及下方「✅ 全站配色改版」章節的內容為準，不要照著舊的「插畫親和風」色碼去改**
- 结構性的東西（Hero 裝飾色塊的概念、卡片圓角、hover 微互動）沒有被推翻，只是顏色數值全面換了一輪，之後如果要修 UI 記得認清這點
- 「插畫親和風」章節第 5 項「導覽選單檢查」原本排在待辦清單裡——**這一項在本輪已經一併處理掉了**（Navbar 已經套用新配色，見下方「✅ 全站配色改版」章節），下方「插畫親和風」章節的「尚未開始」標記已過時，之後不用再接續這一項

---

## ✅ 全站配色改版「網格漸層 藍/青/黃綠」— 第一批已完成並 push 上線（2026/08/12）

使用者提供一張真實學校網站首頁截圖作為配色參考（藍色為主、中段過渡青色、右下角黃綠色的多點網格漸層 hero 背景），確認採用這個方向。逐步比對調色、視覺化預覽、再套用到實際檔案，全程使用者本機執行 git 指令回報，逐批 commit + push 成功。

### 色票定案
| 用途 | 色票 | 說明 |
|---|---|---|
| 主要強調色（藍） | `#185FA5`（對應 `primary-600`） | 連結、圖示、CTA 按鈕主色 |
| 次要強調色（青） | `#0F6E56` | About/Social/CoolEnglish 區塊強調色 |
| 第三強調色（黃綠） | `#7C8622`（對應 `accent-600`） | News 精選卡片、About 第三張特色卡片 |
| 標題文字 | `#0F2A4A`（深藏青） | 取代原本暖棕色系的深色文字 |
| 內文/次要文字 | `#33526D` / `#4A6B8A` | |
| 淺色標籤文字 | `#6B87A0` | 日期、次要說明文字 |
| 淺底色（藍調） | `#F7FAFD`、`#E6F1FB` | 頁面/卡片底色 |
| 淺底色（青調） | `#E1F5EE` | About/Social/CoolEnglish 底色 |
| 淺底色（黃綠調） | `#F6F8E3` | News 精選卡片底色 |
| 邊框 | `#D7E3EF` | 統一取代原本的 `#DDD6C7` |

Hero 區塊專用的完整網格漸層 CSS（`HeroSection.tsx` 跟 `about/page.tsx` 的 Hero 都用同一組）：
```css
background-color: #2B5FE0;
background-image:
  radial-gradient(at 15% 20%, #3F6FE8 0%, transparent 55%),
  radial-gradient(at 55% 10%, #3FB6A8 0%, transparent 50%),
  radial-gradient(at 88% 30%, #6FD0C0 0%, transparent 45%),
  radial-gradient(at 90% 80%, #E2E87A 0%, transparent 55%),
  radial-gradient(at 40% 95%, #4CC2B0 0%, transparent 50%);
```

### 已套用的檔案範圍
**首頁 7 個 sections**（`src/components/sections/` 底下）：
- `HeroSection.tsx` — 整塊套上網格漸層背景，文字/按鈕改白色系
- `QuickLinksSection.tsx` — 藍色系強調色
- `AboutSection.tsx` — 青色底，三張特色卡片刻意用藍／青／黃綠三色輪替呼應漸層
- `StatsSection.tsx` — 藍色系
- `NewsSection.tsx` — 藍色系為主，精選卡片單獨用黃綠色跳出
- `SocialSection.tsx` — 青色底（品牌圖示的 Facebook 藍/IG 漸層/YouTube 紅/LINE 綠維持原色不動，這些是平台識別色不屬於站內配色系統）
- `CoolEnglishSection.tsx` — 青色系
- Commit：`ac3c649`「style: 全站改為藍青黃綠網格漸層配色」（8 files，含 `globals.css`）

**Navbar + Footer**（`src/components/layout/`）：
- `Navbar.tsx` — 底色白、邊框/連結/下拉選單/CTA 按鈕全部換成藍色系
- `Footer.tsx` — 底色改藍調淺色，圖示/連結/無障礙徽章邊框換成藍色系
- Commit：見下方「招生資訊移除」章節，這兩個檔案的配色跟移除招生連結是**同一個 commit** 一起處理的（`beb9abd`）

**Tailwind 主題色階**（`tailwind.config.ts`）：
- `primary` 色階從天空藍系（`#0ea5e9`）改成本輪的精確藍色數值（`primary-600` = `#185FA5`）
- `accent` 色階從暖陽黃系（`#f59e0b`）改成黃綠色系（`accent-600` = `#7C8622`）
- 這個改動會讓所有用 `bg-primary-*`、`text-primary-*`、`.btn-primary`、`.badge-blue` 的地方自動套用新配色，**不用逐一改每個內頁檔案**
- Commit：`7e97a10`「style: primary/accent 色階改為藍青黃綠主題，About 頁面同步調整」

**About 頁面**（`src/app/[locale]/about/page.tsx`）：
- Hero 區塊套上完整網格漸層背景（跟首頁 Hero 同一組 CSS）
- 核心價值 4 張卡片：`bilingual` 保留 `primary`（藍）、`culture` 從 `indigo` 改青色 `#0F6E56`、`innovation` 從 `amber` 改用 `accent`（黃綕）、`character` 從 `rose` 改粉色 `#993556`——這 3 個是寫死的 hex 色碼，`tailwind.config.ts` 改色階不會自動套用到它們，是這次手動改的
- 頁面裡其他用 `primary-*`／`gray-*` 的地方（願景使命、組織架構、統計數字列、歷史時間軸、設施介紹）都是靠 `tailwind.config.ts` 改色階自動對齊，沒有手動改動
- 同一個 commit `7e97a10` 一起提交

### 尚未確認配色一致性的範圍（下次接續時的優先項目，見文件最下方「下一步」章節）
- **News、Contact、News 詳情頁**（`src/app/[locale]/news/page.tsx`、`news/[slug]/page.tsx`、`contact/page.tsx`）——這 3 個頁面已確認**只用 `primary-*`／`.badge-blue`／`gray-*`，沒有寫死的品牌色**，靠 `tailwind.config.ts` 改色階已經自動套用新配色，**不需要額外改動**，已排除在待辦範圍外
- **師資介紹、相簿、影片、文件下載**（`teachers`、`albums`、`videos`、`documents` 相關頁面）——**這輪完全沒有檢查過**，還不確定用的是 `primary-*` token 還是寫死的舊暖棕色 hex 碼，下次接續時要先傳這幾個檔案來看才能判斷
- **後台管理介面**（`src/app/admin/` 底下的所有頁面）——**這輪完全沒有碰過**，配色現況未知
- 這輪的配色檢查方式是「使用者主動一個一個傳檔案給 Claude 看」，不是自動掃描全專案，所以沒被傳上來的檔案都還是未知狀態，不能假設已經套用新配色

---

## ✅ 招生資訊（Admission）功能已完全移除（2026/08/12）

使用者確認網站不需要招生資訊這個功能，要求完全刪除，不是只藏起來。逐一排查前台入口、頁面本身、後台，確認後台完全沒有招生相關的資料庫/CRUD 功能（後台資料夾清單裡沒有 `admission`，只有 `albums`／`announcements`／`banners`／`calendar`／`contacts`／`dashboard`／`documents`／`login`／`media`／`settings`／`teachers`／`users`／`videos`），純粹是一個靜態展示頁面，清理範圍單純。

### 已清除的地方
1. **Navbar 下拉選單**：`關於本中心 ▾` 裡的「招生資訊」連結拿掉（`src/components/layout/Navbar.tsx`）
2. **首頁快速連結卡片**：原本 4 張卡片（招生資訊／最新消息／文件下載／聯絡我們）改成 3 張（拿掉招生資訊那張，編號重新排列）（`src/components/sections/QuickLinksSection.tsx`）
3. **Footer 快速連結**：原本也有一條 `/admission` 連結，清理配色時順便發現並一併拿掉（`src/components/layout/Footer.tsx`）
4. **頁面檔案本身**：整個刪除 `src/app/[locale]/admission/page.tsx`
   - ⚠️ **PowerShell 踩坑記錄**：`Remove-Item -Recurse -Force src\app\[locale]\admission` 這樣直接下指令**沒有真的刪到檔案**，因為 PowerShell 把 `[locale]` 的方括號當成萬用字元語法解讀，不是字面上的資料夾名稱，導致指令執行後資料夾其實還在（`git status` 一直沒出現 `deleted:` 紀錄就是徵兆）。**正確做法是加 `-LiteralPath`**：`Remove-Item -Recurse -Force -LiteralPath "src\app\[locale]\admission"`，這樣才會照字面路徑找到資料夾並刪除。之後任何路徑裡含有 `[locale]` 這種方括號的 `Remove-Item`／`Get-Item` 操作都要記得加 `-LiteralPath`，這是本專案 Next.js App Router 動態路由資料夾命名慣例會反覆遇到的坑

### 順手清理的雜訊
- `friendly-hero-navbar.patch` 這個補丁檔在某次 `git add -A` 時被意外一起提交進版控（commit `4e11a35`），下一輪對話發現後用 `git rm --cached` 拿掉並加進 `.gitignore` 避免重蹈覆轍

### 尚未清理、刻意保留不動的部分（8/12 記錄，8/14 大部分已補做完，見下方新增小節）
- ~~**翻譯字串**（`messages/zh-TW.json`、`messages/en.json` 裡 `nav.admission`、`home.quicklinks.admission`、整個 `admission` namespace）~~——**8/14 已清除，見下方「8/14 補做：Hero 按鈕與翻譯字串殘留清除」小節**
- **`AnnouncementCategory` enum 裡的 `ADMISSION`**（公告分類用的，跟這次刪除的靜態頁面是兩回事）——**維持不動是正確的**，這是合法功能不是殘留，8/14 這輪再次確認過同樣不動

### Commit 紀錄（依序）
1. `beb9abd`「chore: 移除導覽列的招生資訊連結」——Navbar 拿掉連結
2. `4e11a35`「chore: 移除招生資訊頁面與相關連結」——**這個 commit 其實沒刪到頁面**（見上方 PowerShell 踩坑記錄），只誤把 `friendly-hero-navbar.patch` 加了進去，是本輪一個「commit message 寫的跟實際內容對不上」的案例，下次檢查歷史記錄時要注意這個落差
3. `ea77478`「chore: 移除招生資訊頁面，並清理誤加入的補丁檔」——這次才是真正刪除 `admission/page.tsx`（用 `-LiteralPath` 修正後），同時清掉 `friendly-hero-navbar.patch`、加進 `.gitignore`，也包含 `QuickLinksSection.tsx` 的更新
4. Footer 的 `/admission` 連結清除跟 Navbar/Footer 配色改版是同一個 commit `beb9abd`（跟上面第 1 點是同一個 commit，配色跟拿掉連結一起提交的）
5. **8/14 新增**：`c193676`「chore: 徹底移除招生資訊殘留(Hero按鈕/翻譯字串/Breadcrumb/quicklinks)」——見下方新增小節

### ✅ 8/14 補做：Hero 按鈕與翻譯字串殘留清除

使用者傳來首頁截圖，發現 Hero 區塊還有一顆「招生資訊」按鈕——8/12 那輪清理的是 Navbar／首頁快速連結卡片／Footer 這三個入口，但漏了 Hero 區塊自己的 CTA 按鈕。用 `git grep -rn "招生資訊" -- "src"` 查出全部殘留點，逐一確認後清除：

- **`HeroSection.tsx`**：移除 `<Link href="/admission">{t('cta_secondary')}</Link>` 這顆按鈕。確認過 `git ls-files | Select-String "admission"` 沒有任何結果，代表 `/admission` 頁面檔案早就不存在，這顆按鈕點下去其實是**死連結**，清掉是必要的，不是可有可無的美化
- **`zh-TW.json`／`en.json`**：移除 `nav.admission`、`home.hero.cta_secondary`、`home.quicklinks.admission`（這個是另一個沒人引用的孤兒 key，`QuickLinksSection.tsx` 的 `links` 陣列本來就只用 `calendar`／`documents`／`contact` 三個，`admission` 從來沒被用過）、整段 `admission` 翻譯區塊（title/subtitle/intro/contact/steps/requirements/tuition/scholarship/faq）。**`news.categories.ADMISSION`（公告分類「招生」）刻意保留沒動**
- **`Breadcrumb.tsx`**：`NAV_KEYS` 陣列移除 `'admission'`
- 兩份 JSON 檔案在交付前先用 `python3 -c "import json; json.load(...)"` 在沙盒裡驗證過都是合法 JSON 才交付，避免手動刪除區塊漏掉逗號或括號導致網站直接壞掉

commit `c193676`，`npm run build` 通過後 push，已上線。

**目前狀態**：招生資訊功能從前台四個入口（Navbar／首頁快速連結卡片／Footer／Hero 按鈕）、頁面檔案、到翻譯字串／Breadcrumb 全部確認清除並 push 上線，這個項目可以正式視為完全結束，不用再接續。使用者尚未回報是否已在瀏覽器實際跑過一輪確認整體效果（見下方「下一步」章節）。

---

## 🔄 UI 微互動功能包 — 已產出交付，**仍未確認是否套用（狀態沒有改變）**（原記錄於 2026/08/07，本輪未處理）

⚠️ **本輪（8/12）完全沒有碰這個項目，狀態原封不動，不要誤以為本輪的 `Skeleton.tsx`／`Reveal.tsx` commit 就是這個項目的套用確認**——那是完全不同的另一批檔案（見下方新增的說明框）。

> **⚠️ 本輪新發現，務必注意兩者不要搞混**：本輪對話一開始，使用者就已經在本機 commit 過 `src/components/ui/Skeleton.tsx` 和 `src/components/ui/Reveal.tsx`（commit `1f15b8f`「feat: 新增骨架屏與滾動淡入動畫元件」），**但這是另一個平行對話框做的、內容完全不同的檔案**：
> - 這批 `Skeleton.tsx` 裡是 `MediaCardSkeleton`／`MediaGridSkeleton`／`ListRowSkeleton`／`ListSkeleton`，明顯是給**後台媒體庫、影片列表**用的骨架屏元件
> - 下方原始記錄的「UI 微互動功能包」裡的 `Skeleton.tsx` 是給**前台相簿頁面**（`albums/loading.tsx`）用的，兩者職責不同、內容不同、極可能是不同對話框各自命名巧合撞在一起的檔案
> - `Reveal.tsx` 是滾動進入可視範圍才淡入的元件（用 framer-motion `whileInView`），這個角色類似下方記錄的 `PageTransition.tsx`（頁面切換淡入）但**不是同一個東西**——`PageTransition.tsx` 是整頁切換用的，`Reveal.tsx` 是頁面內滾動觸發的區塊淡入
> - **下次接續時，這兩批檔案的套用狀態要分開確認，不能因為看到 `Skeleton.tsx` 已經 commit 就以為下方這個「UI 微互動功能包」已經套用了**——目前依然是「已產出交付、狀態未確認」

這是插畫親和風清單裡第 3-4 項（圖片裁切比例統一、微互動細節補強）的實作，已經打包成 zip 交付給使用者，但**這份文件目前沒有使用者「已套用並驗證成功」的回報，下次接續時第一件事應該是先確認這批到底套了沒有**，不要假設已完成。

### 套件內容（`UI微互動功能包.zip`，共 16 個項目、7 個實際檔案）

**新增檔案（可直接複製貼上，不會跟現有檔案衝突）**：
- `src/components/ui/Skeleton.tsx` — 骨架屏基礎元件（前台相簿用，跟本輪發現的後台媒體庫版本是不同檔案，見上方說明框）
- `src/components/ui/PageTransition.tsx` — 頁面切換淡入效果元件
- `src/app/[locale]/albums/loading.tsx` — 相簿列表頁的 Next.js loading 狀態（骨架屏）
- `src/app/[locale]/albums/[slug]/loading.tsx` — 相簿詳情頁的 loading 狀態
**修改檔案（需要比對合併，不能整份覆蓋，因為使用者之後可能已經動過這些檔案）**：
- `src/app/[locale]/albums/AlbumsClient.tsx` — 相簿格線加大間距（呼吸感）
- `src/app/[locale]/layout.tsx` — 接入 `PageTransition` 元件做頁面切換淡入
- `src/app/globals.css` — 強化 `.btn-primary`、`.btn-secondary`、`.card` 的 hover 陰影/位移層次（比 Phase 0 第一輪「視覺質感精修」更深一層，且**本輪配色改版已經又動過 `globals.css` 一次**，這批 UI 微互動功能包如果現在才要套用，記得跟本輪配色改版的 `globals.css` 版本比對合併，不要整份覆蓋蓋掉配色改動）
### 套用方式
zip 裡附有 `README.md`，寫明每個檔案該放哪裡、修改檔案要用「比對合併」而非「整份覆蓋」的方式套用。

### 下次接續時要做的事
1. **先問使用者**：這份 zip 套用了嗎？`npm run build` 過了嗎？commit + push 了嗎？
2. 如果還沒套用，帶使用者跑一次套用流程（比對合併那 3 個檔案時要特別小心，因為 `[locale]/layout.tsx` 這個檔案很核心，改壞了會全站掛掉；`globals.css` 現在要跟本輪配色改版的版本比對合併，見上方提醒）
3. 套用驗證成功後，記得回來把這個章節從「🔄 進行中」改標記為「✅ 已完成」（用新增/補充的方式標記，不要刪除這段既有記錄）
---

## ✅ Phase 2 第一批已完成並上線（2026/08/10）

已套用 patch、跑過 `db execute` 建表、`npm run build` 66/66 綠燈、commit + push，Vercel 部署後使用者已確認 `/about` 組織架構區塊、`/calendar` 前台頁面、`/admin/calendar` 新增行程都正常運作。

### 本批範圍
1. **關於本中心：組織架構補內容**
   - `/about` 頁面新增「組織架構」區塊，位於 願景/使命 與 統計數字 之間
   - 內容：督導單位（基隆市政府教育處）→ 召集人（張雁婷校長／碇內國中）／副召集人（李欣蓉校長／中正國小）→ 專業工作人員／外籍英語教學顧問，簡易文字型組織圖
   - 中英文字串已補進 `zh-TW.json` / `en.json` 的 `about.orgStructure`
2. **行事曆頁面（全新功能）**
   - Prisma schema 新增 `CalendarEventType` enum（HOLIDAY/MEETING/WORKSHOP/DEADLINE/ACTIVITY/OTHER）與 `CalendarEvent` model（`titleZh/titleEn`、`descZh/descEn`、`startDate`、`endDate`、`type`、`isPublished`）
   - API：`/api/calendar-events`（GET 列表／POST 新增）、`/api/calendar-events/[id]`（GET/PATCH/DELETE）
   - 後台：`/admin/calendar` 列表 + 新增/編輯表單 + 刪除，已加入後台側邊選單（行事曆管理）
   - 前台：新頁面 `/calendar`，依月份分組列出已發布行程，可依類型篩選；`Navbar.tsx` 的「關於本中心 ▾」下拉新增「行事曆」連結
   - 中英文字串已補進 `calendar` namespace
### ✅ 法規與表單下載分頁 — patch 已套用、commit + push 完成（2026/08/10）

**範圍**：`/documents` 前台頁面改為「教學表單／行政表單／法規與其他文件」三個分頁；`Document` 資料表新增 `formType` 子分類欄位（僅 `category = FORM` 時有意義）。

**設計決策（本次對話框自行判斷，記錄供確認）**：
- 新增 `DocumentFormType` enum：`TEACHING`（教學表單）／`ADMINISTRATIVE`（行政表單），欄位 `formType` 設為**非 nullable**、`@default(ADMINISTRATIVE)`，這樣既有的表單資料 migration 後不會出現空值，且不用改既有資料
- 前台 `/documents` 從單一列表改成三個分頁：教學表單（`category=FORM & formType=TEACHING`）／行政表單（`category=FORM & formType=ADMINISTRATIVE`）／法規與其他文件（`category != FORM`，涵蓋原本的規章/簡章/報告/其他，避免這些既有文件在改版後「消失」）
- 後台 `DocumentEditor.tsx` 新增「表單子分類」下拉選單，**只在類別選「表單」時才顯示**，避免使用者對法規/簡章文件也要選教學或行政（無意義）
- 既有表單資料因為 `@default(ADMINISTRATIVE)`，migration 後全部會先歸類到「行政表單」分頁，之後需要使用者自行到後台把真正屬於教學用途的表單改選「教學表單」
**改動的檔案**（5 修改 + 2 新增）：
- `prisma/schema.prisma`：新增 `DocumentFormType` enum、`Document.formType` 欄位
- `prisma/migrations/20260810130000_add_document_form_type/migration.sql`（新檔）：`CREATE TYPE` + `ALTER TABLE ADD COLUMN`
- `src/app/api/documents/route.ts`、`src/app/api/documents/[id]/route.ts`：Zod schema 加入 `formType`，GET 支援 `?formType=` 篩選
- `src/app/admin/documents/DocumentEditor.tsx`：新增表單子分類下拉選單（條件顯示）
- `src/app/admin/documents/[id]/page.tsx`：編輯頁把 `formType` 一併傳進表單
- `src/app/admin/documents/page.tsx`：列表對 FORM 類別文件顯示教學/行政小標籤
- `src/app/[locale]/documents/DocumentsClient.tsx`（新檔）：前台三分頁 UI（沿用 `NewsClient.tsx` 的 URL searchParams 分頁模式）
- `src/app/[locale]/documents/page.tsx`：改為抓資料後交給 `DocumentsClient` 渲染
- `src/i18n/messages/zh-TW.json` / `en.json`：新增 `documents.tabs.*`、`documents.no_documents_in_tab`
**驗證方式（跟以往不同，記錄供參考）**：
- 這次沙盒環境連 `npx prisma generate`（含 `--no-engine` + `PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1` 都試過）都被擋掉（`binaries.prisma.sh` 403 Forbidden），完全無法跑 `npm run build`
- 改用 `esbuild` 對每個新增/修改的 `.ts`/`.tsx` 檔案逐一做語法檢查，全部通過；`git apply --check` 也已在乾淨 clone 環境測試通過
- 正式的 `npm run build` 驗證由使用者本機執行完成
**套用過程紀錄**：
1. `documents-form-tabs.patch` + `add-document-form-type.sql` 下載後，使用者於本機套用
2. `npx prisma db execute --file add-document-form-type.sql` 建表成功
3. `npm run build` 使用者本機跑過確認
4. **實際 commit + push 過程中卡了一次**：使用者把 `git add .`／`git commit`／`git push` 三行指令貼在一起送出，PowerShell 把它們黏成一行指令，導致 `git add` 收到一堆不存在的參數而失敗，後面 commit/push 沒真的執行（`git push` 顯示 `Everything up-to-date` 就是證據）→ 請使用者改成一行一行貼、確認上一行執行完（看到新的 `PS C:\...>` 提示字元）再貼下一行，順利完成 commit（9 files changed）+ push
5. Commit：`feat: 文件下載新增教學表單/行政表單分頁`（已 push 上 GitHub `master` 分支）
### ✅ 額外發現並修復：新增文件上傳失敗的獨立舊 bug（與本次 patch 無關，2026/08/10）

**觸發情境**：patch 套用、push 成功後，使用者實測「後台新增文件」時發現上傳失敗。

**根本原因**：`src/app/admin/documents/DocumentEditor.tsx` 的前端表單（`react-hook-form` + zod schema）從一開始就只把 `fileUrl`、`fileSize` 塞進送出的資料，漏掉了 `fileName`、`fileType` 這兩個欄位。但：
- 後端 `POST /api/documents`（`src/app/api/documents/route.ts`）的 `createSchema` 要求 `fileName: z.string().min(1)` 和 `fileType: z.string()` 為必填
- Prisma schema（`prisma/schema.prisma` 第 238-241 行）的 `Document` model 這兩個欄位本來就是必填（非 optional）
→ 每次新增文件、送出表單時都會被後端 422 驗證擋下，這是**既有舊 bug**，跟這次教學/行政表單分頁的 patch 完全無關，只是剛好這次測試才踩到。

**確認方式**：把使用者最新 push 上去的 repo（commit `4652998`）重新 clone 到沙盒比對程式碼，確認前端 schema 缺少這兩個欄位、後端與資料庫都要求必填，鎖定問題根源。

**修復內容**（2 個檔案）：
- `src/app/admin/documents/DocumentEditor.tsx`：
  - zod schema 加入 `fileName`、`fileType` 兩個必填欄位
  - `DocumentData` interface 加入 `fileName?`、`fileType?`
  - `uploadedFileName` 的 `useState` 初始值改為讀取 `initialData?.fileName`（修正編輯模式下檔名顯示）
  - `defaultValues` 加入 `fileName`、`fileType`
  - 上傳成功的 callback（`handleFileUpload`）新增 `setValue('fileName', file.name, ...)`、`setValue('fileType', file.type, ...)`
  - 移除已上傳檔案的 `onClick` 一併清空 `fileName`、`fileType`
- `src/app/admin/documents/[id]/page.tsx`：編輯頁把資料庫的 `doc.fileName`、`doc.fileType` 一併傳進 `DocumentEditor` 的 `initialData`
**交付過程紀錄（本輪的教訓，已寫入上方鐵則）**：
1. 原本用 `present_files` 產生 `0001-fix-fileName-fileType.patch` 給使用者下載
2. 使用者執行 `git apply 0001-fix-fileName-fileType.patch` 時出現 `No such file or directory`（下載後的檔案路徑跟預期不同）
3. 改用備援方案：直接把兩個檔案裡「找到 XX 段落 → 改成 YY」的逐段修改指示，用純文字列出 6 處（`DocumentEditor.tsx` A~F）+ 1 處（`[id]/page.tsx`），請使用者用 `code 檔名` 手動修改後存檔
4. 使用者手動改完，`git add .` → `git commit -m "fix: 新增文件表單缺少 fileName/fileType 欄位導致上傳失敗的問題"` → `git push`，**使用者已確認「成功了」**
**目前狀態**：✅ 使用者已於正式站完成全部驗證並確認成功（2026/08/10）：
1. Vercel 部署成功
2. 後台新增全新文件、上傳檔案，確認不再出現「上傳失敗」
3. 編輯既有表單改選「教學表單」存檔後，前台 `/documents` 的「教學表單」分頁確認有正確顯示該文件
4. 「法規與其他文件」分頁確認原本的規章/簡章/報告類文件都還在，沒有消失
**「法規與表單下載分頁」功能（含這次意外修好的上傳 bug）到此正式完整上線，本輪任務結束。**

---

### 尚未處理（待下一輪）

1. **雙語教學推動**（全新類別，選單目前還沒有這個項目）
   - 新建 `BilingualSchool` 資料表（雙語實驗學校名冊：校名、推動模式標籤如 CLIL/Immersion、現況說明）
   - 新建外師生活指南（Living in Taiwan Guide）靜態頁面，中英皆需完整
   - `Teacher.type = FOREIGN` 已可用，但外師招聘表單、協同教學指引案例等內容頁尚未建立
### 待確認問題（Phase 2 開始前建議先問使用者）
- 電子報/期刊要新建 `Publication` 資料表還是沿用 `Document.REPORT`？（已確認採 PDF 下載形式，但資料表設計方式待定）
- 教案庫（`LessonPlan`，多條件篩選）排在 Phase 2 還是往後挪到 Phase 3？工程量較大
**暫緩／排除項目（不在 Phase 2/3 範圍）**：SSO 單一登入、教具借用系統——需另案跟教育局處確認介接規格

---

## ✅ Phase 1 已完成並上線（commit `ab7543f` + `dabe1dc`，2026/08/10）

### 新架構規劃（來自使用者提供的完整 IA 文件）
使用者提供一份完整的 7 大類網站架構規劃文件（關於本中心／雙語與英語教學推動／教師研習與專業發展／教材與教學資源／學生競賽與活動／法規與表單下載／成果展現與出版物），比對現有 9 個攤平選單頁面與資料庫欄位後，產出 `site-map-v1.md` 規劃文件（已下載給使用者），分階段執行。

### Phase 1 範圍（已完成）
1. **Prisma schema 異動**（已跑 migration，資料庫已同步）
   - `AnnouncementCategory` enum 新增 `WORKSHOP`（研習活動）
   - `TeacherType` enum 新增 `FOREIGN`（外師 FET/ETA，不含國籍/簽證等額外欄位——使用者明確表示不需要）
2. **選單改版**：9 個攤平連結 → 分組下拉結構
   - 首頁（直接連結）
   - **關於本中心 ▾**：關於學校／最新消息／行事曆／師資介紹／招生資訊／聯絡我們
   - ⚠️ **本輪（8/12）更新**：上面這行的「招生資訊」已在 8/12 移除，見上方「✅ 招生資訊功能已完全移除」章節，這裡的舊記錄保留供對照，實際選單現況以新章節為準
   - 文件下載（直接連結，暫時合併「教材資源」與「法規表單」兩個新分類，待 Document 分類完成後再拆分）
   - **學生競賽與活動 ▾**：活動相簿／活動影音
   - 「雙語教學推動」「教師研習與專業發展」「成果展現與出版物」等尚無內容的類別，依使用者指示**暫不放入選單**，等 Phase 2 有實際頁面再加入，避免空的下拉選單
   - 下拉選單已做無障礙處理：`aria-haspopup`/`aria-expanded`/`role="menu"`、Escape 關閉、點外部關閉，手機版改用手風琴收合
3. **順手修復的 bug**：`AnnouncementEditor.tsx` 後台分類下拉選單原本是 `EVENT`/`ACADEMIC`/`OTHER`，跟 Prisma enum 實際值（`ANNOUNCEMENT`/`ACTIVITY`/`ADMISSION`/`COMPETITION`/`NEWS`）完全對不上，選了會存檔失敗——已改成對應正確 enum 並加入 `WORKSHOP`
4. 新分類已同步串接：`CATEGORY_COLORS`（`src/lib/utils.ts`）、`NewsClient.tsx` 前台篩選、`zh-TW.json`/`en.json` 雙語標籤、Teachers 後台列表分組
### 執行過程中的技術插曲（已解決，但記錄下來避免下次卡住）

**資料庫 migration 歷史跟命名世代對不上（未修復，屬於技術債）**
`npx prisma migrate dev` 兩度跳出「Drift detected → 需要 reset 整個 public schema」的警告。原因：
1. 第一次：5 個舊 migration 檔案存在但資料庫沒有對應歷史紀錄 → 用 `prisma migrate resolve --applied <name>` 逐一補登記解決，零風險，沒有動到任何資料
2. 第二次（更深層）：migration 歷史裡的資料表命名是最早期版本（`Album`、`User`...大寫開頭），但資料庫實際上用的是後來 `@@map()` 改過的小寫底線命名（`albums`、`users`...），兩個「世代」對不上 → **這次改用 `npx prisma db execute --file xxx.sql` 直接送出只跟這次異動相關的 2 行 `ALTER TYPE ... ADD VALUE`，完全繞開整個 schema 比對**，成功且未影響任何既有資料
⚠️ **這個「migration 歷史跟資料庫命名世代對不上」的問題還沒真正修好**，只要之後又跑 `prisma migrate dev`，同樣的 reset 警告還會再跳出來。正確解法是重新 baseline migration 歷史，屬於獨立工程，**目前刻意擱置**，下次遇到記得用 `db execute` 手動 SQL 繞過，不要選 reset。（Phase 2 的 `calendar_events` 資料表新增、法規表單分頁的 `formType` 欄位新增都是用這個方式繞過的，屢試不爽。）

**PowerShell 相關的操作誤區（使用者不熟悉指令列，下次要注意，本輪又再度發生）**
- SQL 語法不能直接貼進 PowerShell 執行，要先存成 `.sql` 檔（`code 檔名.sql` 開檔 → 貼上 → 存檔），再用 `npx prisma db execute --file` 指定檔案執行
- `del` 是單一參數指令，複製貼上時如果不小心把指令重複貼了兩次會出現 `del a.sqldel a.sql` 這種沾黏錯誤，要提醒使用者看清楚再貼
- **本輪再度發生**：`git add .`／`git commit -m "..."`／`git push` 三行一次貼上會被 PowerShell 黏成一行指令而失敗（`git add` 收到大量不存在的參數），且 `git push` 會顯示看似正常的 `Everything up-to-date`，容易誤以為成功。**務必提醒使用者一行一行貼、確認上一行執行完（看到新的提示字元）再貼下一行**
- `git apply patch檔名` 也可能因為下載後的實際檔案路徑跟預期不同而失敗（`No such file or directory`）——這種情況不用花時間排查路徑問題，直接改用「逐段文字修改指示 + `code 檔名` 手動改」的備援方式更快
- **本輪（8/12）新增觀察**：`Remove-Item` 遇到路徑含方括號（如 `[locale]`）的資料夾時，方括號會被當成萬用字元語法而不是字面路徑，導致「看起來執行成功、實際上什麼都沒刪到」——**務必加 `-LiteralPath` 參數**，詳見上方「✅ 招生資訊功能已完全移除」章節的完整記錄。這是 Next.js App Router 專案會反覆遇到的坑，任何操作 `[locale]`、`[slug]`、`[id]` 這類動態路由資料夾的 PowerShell 指令都要注意
---

## ✅ Phase 0：已完成並已 push 上 GitHub（完整清單，逐項保留）

### 改名 + 外觀調整（commit `52c1ceb`）
- 網站名稱全站改為「基隆市英語資源中心」
- 配色改為正式深藍 + 金色（後續在設計改版階段又調整過，第一次是「插畫親和風」暖黃系，第二次是本輪 8/12 的網格漸層藍青黃綠系，見上方「設計方向變更說明」章節）
### Footer + 麵包屑 + 全站搜尋 + 字體縮放 + 社群連結 + 四功能包（commit `b6a02e5`）
- Footer 完整化、全站麵包屑導航、隱私權/資安政策頁面
- 全站搜尋（`api/search`、`SearchBar.tsx`）
- 字體縮放無障礙工具（`FontSizeAdjuster.tsx`、`FontSizeContext.tsx`）
- Banner 輪播管理、Email 通知、照片拖曳排序、Google Maps 嵌入
- 順手修好 6 個檔案的 `useTranslations` async Server Component 誤用 bug、`search/route.ts` 欄位名稱錯誤
### 雜訊檔案清理（commit `ce9c1e7` → `a1e782b`）
- 誤建立的 `layoutFooter.tsx`（git diff 文字輸出混入根目錄）已刪除
### Footer / Contact 聯絡資訊接資料庫
- Footer 跟「聯絡我們」頁面地址/電話/Email 已改為讀取 `SiteSetting` 資料表（`contact_address_zh/en`、`contact_phone`、`contact_email`），依 locale 切換語言；傳真維持手動填寫
### Google Maps 嵌入
- 已在後台「網站設定 → Google Maps」貼上 iframe 並確認正常顯示
### 圖片上傳功能改用 Vercel Blob（commit `9ffed48`）
- 原邏輯寫入本機檔案系統，Vercel Serverless 唯讀環境必定失敗 → 改用 `@vercel/blob`
- 排查解決三層問題：OIDC 在 development 環境的限制（改明確傳入 token）→ 最初 Blob Store 選了 Private 但程式要求 public（Private 建立後無法改，刪除重建 Public Store）→ 新 Store 未自動帶入 `BLOB_READ_WRITE_TOKEN`（手動補上環境變數）
- 狀態：本機 + 正式站皆實測上傳成功 ✅
- ⚠️ **注意**：這是「圖片」上傳的驗證紀錄，跟上方「文件」上傳的 `fileName`/`fileType` bug 是不同的兩件事——圖片上傳走的是儲存後端（Vercel Blob）是否可寫入，文件上傳失敗是前端表單漏欄位、根本沒送到儲存後端就先被 API 驗證擋掉，兩者不衝突也不互相影響
### 首頁歷史遺留 bug（另一對話框完成，已確認同步）
- 首頁「最新消息」i18n 翻譯缺失（`news.categories.ACTIVITY`）+ `formatDate` RangeError 崩潰 → 已修復上線
- 首頁統計數字「0+」→ 已改為串接 `prisma.teacher.count()` 真實資料
- 相簿詳情頁 `albums/[slug]/page.tsx` → 已確認路由存在且正常
- Banner 輪播重複資料 → 已清除
- 孤兒檔案 `layout.情況A完整覆蓋版.tsx` → 已刪除
### 後台內容管理擴充
- 確認相簿（Album/Photo）、公告（Announcement）、影片（Video）三模組 schema、API 早已存在
- 修復 10 處 Zod 驗證 bug：`z.string().url().optional()` 沒放行空字串，導致 `coverImage`/`thumbnail`/`avatar` 等欄位沒填就報錯 → 統一改成 `.optional().or(z.literal('')).transform(v => v || undefined)`
- 新增完整 `/admin/videos` 後台頁面（列表、新增、編輯），YouTube 網址貼上自動解析模式
- 修復雙層 admin layout 問題：確認 `admin/layout.tsx` 才是實際生效的那層，`admin/dashboard/layout.tsx` 是多餘重複檔案已刪除；「影片管理」選單項目已加入正確的 `admin/layout.tsx`
### 無障礙優化（WCAG 2.1 AA）
- Root layout（`src/app/layout.tsx`）：`<html lang>` 動態化（跟隨 locale，`getLocale()` 失敗時預設 `zh-TW`）
- 加入導盲磚「跳到主要內容」連結（`.skip-link` + `#main-content`），套用在 `[locale]/layout.tsx` 與 `admin/layout.tsx`
- `/admin/login` 補上 `<title>` 與 `<main>` landmark（原本 `if (pathname === '/admin/login') return <>{children}</>` 直接跳過語意化包裝）
- 全站色彩對比度修正：`text-gray-400/500` → `text-gray-600`（白底文字）
- Lighthouse Accessibility 分數：首頁 100、admin/login 100（原始 96/96/93）
- 已清除 Footer 樣式表中重複貼了兩次的 `.skip-link` CSS 區塊
### 首頁新區塊：社群連結 + Cool English 專區
- `SiteSetting` 新增 `cool_english_url` key，後台「網站設定 → 社群媒體」分頁已加輸入欄位
- 新增 `SocialSection.tsx`：依 `facebook_url`/`instagram_url`/`youtube_url`/`line_url` 是否填寫動態顯示對應卡片（全空則不顯示）
- 新增 `CoolEnglishSection.tsx`：依 `cool_english_url` 是否填寫顯示推廣區塊
- 首頁 `[locale]/page.tsx` 已串接 `prisma.siteSetting.findMany()` 並傳入上述元件，已實測正常顯示
- ⚠️ **待辦（尚未確認是否已完成，下次可直接問使用者）**：Cool English、Facebook/YouTube 網址目前後台可能還是測試值，正式帳號申請下來後需回填正式網址
### 視覺質感精修（第一輪，已上線）
- `.card`：hover 時陰影加深、邊框轉主色、微微上浮（`hover:-translate-y-0.5`）
- `.btn-primary`：加上基礎陰影 + hover 陰影加深
- Footer 版權列右側新增無障礙標章預留位置：「本站依循 WCAG 2.1 AA 無障礙網頁設計原則建置」文字連結（因官方標章需向數位發展部申請審核才能用認證圖示，目前先做誠實的文字聲明式預留，之後拿到官方標章圖檔再替換）
以上全部驗證方式：`npm run build` 通過（最新一次記錄為 61/61 頁面全綠燈）→ commit → push → Vercel 自動部署確認成功。

---

## 🔄 全站設計改版「插畫親和風」— 已被本輪（8/12）配色改版取代，不用再接續

⚠️ **重要**：這整個章節記錄的是舊方向（暖黃 + 天空藍），**已經被本輪（2026/08/12）的「網格漸層 藍/青/黃綠」配色改版取代**，詳見文件最上方「設計方向變更說明」章節。以下內容完整保留供歷史對照，但**不要再依照這個章節的色碼規格去改任何檔案**，也不用再接續第 5 項「導覽選單檢查」（已經在本輪處理掉了）。

這是目標把網站視覺水準做到「全台灣縣市英語資源中心最好看、最好操作」的一輪規劃（對比對象如彰化縣英資中心，經實際查看確認是用 Google Sites 搭建、零自訂視覺設計、選單十幾層巢狀）。**規劃已完成、mockup 已視覺化確認方向，實作已開工**：

- ✅ 第 1 項「首頁 Hero 區塊重做」— 已完成上線（見上方「插畫親和風設計改版 — 第一批」章節）**（8/12 更新：內容已被新配色覆蓋，Hero 現在是網格漸層不是暖黃背景）**
- ✅ 第 2 項「三大入口區塊」— 已完成上線，但實際做成 4 張卡片、內容跟原規劃不同（詳見上方章節的差異記錄）**（8/12 更新：已改成 3 張卡片並套用新配色，見「✅ 招生資訊功能已完全移除」與「✅ 全站配色改版」章節）**
- 🔄 第 3 項「圖片/相簿裁切比例統一」— 已寫好交付（UI 微互動功能包），**尚未確認套用**（8/12 未處理，狀態不變）
- 🔄 第 4 項「微互動細節補強」— 已寫好交付（UI 微互動功能包），**尚未確認套用**（骨架屏、頁面淡入、卡片按鈕陰影層次加深）（8/12 未處理，狀態不變，且要注意跟本輪新出現的另一批 `Skeleton.tsx`/`Reveal.tsx` 不是同一批檔案，見上方說明框）
- ✅ 第 5 項「導覽選單檢查」— **8/12 本輪已處理**：Navbar 已套用新配色（見「✅ 全站配色改版」章節），手機版漢堡選單／手風琴收合功能沿用原本邏輯沒有改動結構，只換了顏色
以下維持原始完整規格記錄（不要壓縮，即使部分項目已完成也保留完整規格供核對）：

### 已完成的前置調色（供接續的對話框核對現況，不用重做）
- `tailwind.config.ts` — primary 改天空藍系（`#0ea5e9` 主色），accent 改暖陽黃系（`#f59e0b` 主色）**（8/12 更新：這組色碼已經被覆蓋，現在 primary 是 `#185FA5`、accent 是 `#7C8622`，見上方「✅ 全站配色改版」章節）**
- `src\app\globals.css` — `.card`、`.badge-gray`、`.btn-ghost`、`.input`、body 文字色、`.skip-link` 全部改用 slate/sky 色系
- `src\components\layout\Footer.tsx` — 背景改 `bg-sky-50`，文字深淺邏輯對調**（8/12 更新：底色現在是 `#F7FAFD`，見上方新章節）**
- `src\components\sections\NewsSection.tsx`、`QuickLinksSection.tsx` — 背景與文字色統一調整**（8/12 更新：已再次改色，見上方新章節）**
- `npm run build` 已驗證 61/61 全綠燈通過（此為調色階段的驗證，設計改版本體尚未開始）
### 本輪定案：首頁視覺方向 ——「插畫親和風」（已於 8/12 被新方向取代，見上方說明）
已用 mockup 視覺化確認方向（不是憑空指定），規格：
- 背景：暖黃色系底（`#fef9f0` 或 `bg-amber-50`）
- Logo 圖標：圓形，暖黃底（`bg-accent-400`），深棕文字（`text-accent-900` 或 `#78350f`）
- Hero 區塊裝飾：2-3 個大小不一、半透明（`opacity-60` 到 `opacity-80`）的色塊圖形，天藍（`bg-sky-200`）、暖黃（`bg-amber-200`）交錯散落
- 主標語：口語化親切，可帶 emoji 結尾（例如「Hi！一起來學英文吧 🌈」而非制式「歡迎蒞臨」）
- CTA 按鈕：天空藍底、白字、圓角膠囊形（`rounded-full`），hover 時 `hover:scale-105`
- 三個入口卡片（教學資源／活動花絮／師資陣容）：圓形色塊圖標（不是方形），淺色底藍/黃/粉輪流，圖標置中無邊框
### 待實作項目清單（原始規劃記錄，供核對；完成狀態見上方摘要）

**1. 首頁 Hero 區塊重做** ✅ 已完成上線，**8/12 又再改一次配色（網格漸層取代暖黃）**
- 檔案：`src\components\sections\HeroSection.tsx`
- 背景改 `bg-amber-50` 或漸層 `bg-gradient-to-b from-amber-50 to-white`
- 加入 2-3 個裝飾性色塊（`position: absolute` 定位角落，`opacity-60~80`，`rounded-full` 或 `rounded-2xl` + `rotate-12`）
- 主標題語氣口語化、可加 emoji 結尾
- CTA 按鈕改 `rounded-full`，`hover:scale-105 transition-transform`
**2. 三大入口區塊** ✅ 已完成上線（實際做成 4 張卡片，內容與原規劃不同，詳見上方差異記錄），**8/12 改成 3 張卡片並套用新配色**
- 圖標容器從方形 `rounded-lg` 改圓形 `rounded-full`
- 底色輪流 `bg-sky-100`、`bg-amber-100`、`bg-pink-100`（或 `rose-100`）
- 圖標先用 emoji 佔位（📖🎨🎓），之後可換 Lucide icon 或自訂 SVG
**3. 圖片/相簿裁切比例統一** 🔄 已交付 UI 微互動功能包，尚未確認套用（8/12 未處理）
- 檔案：`/albums` 頁面相關元件（`src\app\[locale]\albums\`）
- 統一 `aspect-square`（1:1）或 `aspect-[4/3]`，搭配 `object-cover`
- Hover 效果：`hover:scale-105 transition-transform duration-300`，外層需 `overflow-hidden`
**4. 微互動細節補強** 🔄 已交付 UI 微互動功能包，尚未確認套用（8/12 未處理）
- 全站按鈕確認 `transition-all duration-200`，hover 有陰影/位移
- `.card` hover 上浮效果已有，不用改
- 圖片載入可評估 `<Image placeholder="blur">` 或骨架屏（`animate-pulse`）—— 已用 Next.js `loading.tsx` + `Skeleton.tsx` 元件方式實作
- 頁面切換可評估簡單 fade-in（CSS animation 或 Framer Motion，視現有依賴，不強制加新套件）—— 已用 `PageTransition.tsx` 元件實作
**5. 導覽選單檢查** ✅ **8/12 已處理完成**（原本標記為⬜尚未開始，本輪 Navbar 配色改版時一併完成）
- ⚠️ 這條在 v6 寫的時候選單還是「扁平化 8 項」，Phase 1 已經把選單改成分組下拉結構了（見上方 Phase 1），所以這條要重新確認：改版時要連同新的下拉選單樣式（暖黃/天藍配色、圓角）一起套用，不是只套用在舊的扁平選單上——**8/12 更新：已套用新配色（藍色系）而不是這裡寫的暖黃/天藍，手機版漢堡選單／手風琴收合功能結構沒有改動，維持原本邏輯，只換了顏色，已確認正常**
---

## 🛠️ 常用比稿／診斷 Prompt 範本庫（2026/08/13 新增，供之後重複使用）

使用者要求把這輪對話中用過的幾個關鍵 prompt 完整保存下來，方便之後開新一輪視覺改版或遇到類似狀況時直接複製取用，不用重新想措辭。**這些 prompt 本身沒有專案特定的程式碼內容，是可以套用在任何一輪視覺工作的「操作規則」跟「比稿規格」範本**，逐字保留全文：

### 範本 1【診斷】搶救功能異常
用途：當 Replit（或任何 AI 協作工具）改壞功能、網站變成空殼時，先用這個診斷問題根源，不要直接繼續改視覺。核心邏輯：先環境變數 → 資料庫連線 → git 修改歷史比對 → 本機跑起來看實際錯誤 → 優先用「還原」而非「重寫」解決，且要求「每完成一步就回報結果，等確認後再進下一步，不要一次做完全部步驟」。

### 範本 2【規則】更嚴格的分階段視覺改版
用途：功能確認恢復正常後，重新開始視覺改版時使用，強制一次只改一個檔案或一個區塊、改完立刻 build+瀏覽器實測才能繼續下一個。核心鐵則：視覺修改只能動 Tailwind className／CSS 變數／純裝飾性 JSX，絕對不能動資料抓取邏輯／useEffect／API 呼叫／表單驗證／路由結構／Prisma schema；每階段完成要附桌機版 1440px + 手機版 375px 截圖；開始改版前先回報排版問題清單（間距一致性、container 寬度、手機版溢出、對齊留白），不要直接動手改。

### 範本 3【比稿 1】純視覺提案 — 4 個模板
用途：完全不碰正式 repo，先在全新 Repl 做出幾個首頁靜態模板比稿選擇，純 HTML + Tailwind CDN，不用 npm install、不用 build。這一版列出 4 個方向：Option 1 插畫親和風（天空藍+暖陽黃）、Option 2 正式莊重風（深藍+金）、Option 3 極簡現代風（黑白灰+一個強調色）、Option 4 讓 AI 自己發揮並說明理由。要求所有版本用同一套設計語言貫穿到底、做手機版 RWD、用中文真實文案不要 Lorem Ipsum。

### 範本 4【比稿 2】三方向完整比稿 — A / B / C
用途：如果 4 選 1 模板不夠滿意，或想重新從頭比較三個「品牌個性」完全不同的方向時使用，規格比範本 3 更詳細嚴謹（明確定義每個方向的 Color／Typography／Hero／Navigation／Cards／Buttons／Icons／Illustration／Sections／Footer／Mobile 各層面規格，避免 AI 三個版本做得像同一套排版換顏色）：
- **Option A 友善插畫風**：天空藍+暖陽黃+暖白背景，圓體字、標題極粗、大字級；Hero 漸層背景+2-3個半透明色塊裝飾；卡片 rounded-3xl 大圓角；按鈕膠囊形 hover scale-105
- **Option B 現代教育風**：中性冷色主導（白/slate）+單一強調色（靛藍或墨綠），飽和度偏低；Hero 左右分割版面+細線條網格背景；卡片 rounded-xl 中等圓角+細邊框；按鈕 rounded-lg 中等圓角
- **Option C 政府高質感國際化風**：深藏藍+金／古銅點綴+象牙白背景；標題用襯線字體、語氣正式不用 emoji；Hero 對稱版面+徽章印信風格裝飾；卡片頂部加金色細線強調

### 範本 5【比稿 3】淺色親和風模板 — 3 種顏色克制程度
用途：確定方向要走「親和風」，但實作出來顏色太多太雜、出現不協調深色區塊時，用這個重新比稿收斂顏色。**鐵則：全部區塊都必須是淺色調，不准出現任何深色背景區塊（不能用 slate-900、black、navy 當整個 section 的背景色），從 Hero 到 Footer 全部維持同一種淺色調性，一路到底不能中途「跳出去」變成另一種風格。** 三個選項色彩節制程度遞增：
- **Option 1 極簡雙色**：只用天空藍 + 一個中性米白/奶油背景，完全不用第三種強調色
- **Option 2 雙主色＋單一點綴**：天空藍為主、暖黃為輔，全站只用這兩色
- **Option 3 大地暖色系**：改用米白＋淺卡其／淺棕＋一點天空藍點綴，木質紙質溫暖質感，裝飾元素改用更柔和的圓角色塊、飽和度更低

**本輪（8/13）最終採用的是範本 5 的 Option 3，延伸定案出上方「✅ 全站配色三度改版」章節記錄的正式色票。**

### 使用建議
之後如果想再開新一輪比稿，直接照範本 3、4 或 5 的格式，換掉「品牌個性關鍵字」跟「Color」規格即可套用在任何新的視覺改版需求上，不限於首頁配色，Footer/內頁/後台介面要重新比稿時都可以用同樣的格式延伸。

---

## 📌 其他重要背景資訊

- 資料庫：Neon PostgreSQL
- Git 在 Windows 上顯示 `LF will be replaced by CRLF` 警告是正常現象，可忽略
- Claude 沙盒環境無法完整驗證 Prisma 相關型別檢查跟資料庫連線（`prisma generate` 的 binary 下載會被沙盒網路擋掉，`--ignore-scripts` 跳過安裝搭配 `npx tsc --noEmit` 的變通方式也已經測過行不通），也無法直接把程式碼交付到使用者電腦——**每次改完都要產生 patch 檔或完整檔案內容交付，並在使用者本機重新 `npx prisma generate` + `npm run build` 才是最終驗證標準**
- Vercel Blob Store 的 Access 模式（Public/Private）**建立後無法變更**，選錯只能刪除重建
- Vercel 自動連結新 Blob Store 到專案時，不會自動帶入 `BLOB_READ_WRITE_TOKEN`，需要手動從 Store 的 `.env.local` 分頁複製後新增到 Environment Variables
- 網站定位：政府附屬教育機構官網（非電商），設計方向「正式莊重」但目標升級為「親和有溫度」，不需要購物車/會員/金流/紅利系統
- 基隆市政府「封包」規格：**以 ISO 光碟映像檔為主**，Docker 為備案非優先，此為部署/驗收階段的交付格式問題，不影響網站程式結構本身（原本是暫緩項目，現已確認方向）
- 預設管理員帳號（seed 後）：`admin@school.edu.tw` / `Admin@1234`
- `Document` model 的 `fileUrl`、`fileName`、`fileSize`、`fileType` 四個欄位在資料庫層級都是必填（非 optional），任何未來新增/修改「上傳文件類」表單時，前端 zod schema 務必四個都要有，否則會重演本輪的上傳失敗 bug
- **本輪（8/12）新增**：`tailwind.config.ts` 的 `primary`／`accent` 色階目前已經是第二版數值（藍/黃綕系），如果之後又要調整全站配色，記得這個檔案是「一改全站自動套用」的槓桿點，但**寫死的 hex 色碼**（例如 About 頁面那 4 張價值觀卡片、以及本輪還沒檢查過的 teachers/albums/videos/documents 頁面如果也是寫死色碼）不會自動跟著變，還是要逐一手動改
---

## ⚠️ 已知風險 / 特殊狀況（完整版，務必留意）

### 1.「`<a` 標籤消失」的怪現象（重要，會反覆發生）
複製貼上或用 Node.js 腳本寫入檔案時，單獨佔一行的 `<a` 開始標籤可能自動消失。**該輪對話中三次獨立發生**，分別在 `CoolEnglishSection.tsx`、`SocialSection.tsx`、`Footer.tsx`，原因未查明但規律明確。**解法**：`<a` 一律跟第一個屬性寫在同一行（例如 `<a href="..." target="_blank" ...>`），不要單獨換行。下次遇到任何檔案改完後某個 `<a>` 標籤莫名消失、頁面壞掉，優先檢查是不是又中了這個坑。

### 2. PowerShell heredoc 寫入不穩定
`@'...'@ | Set-Content` 這種 heredoc 寫法多次發生貼上截斷/錯亂，導致 `npm run build` 反覆失敗。**穩定做法**：`code 檔名`（或 `notepad 檔名`）打開 → 全選刪除 → 手動貼上 → 存檔。之後所有檔案修改都建議用這個方式，避免 heredoc。**本輪（8/12）驗證：全程使用這個「完整檔案內容貼給使用者、使用者手動覆蓋」的方式，沒有再發生任何寫入錯亂問題，穩定可靠。**

### 3. 多對話框並行開發
本專案同時被多個對話框（含不同 AI，曾出現 Claude + Gemini 並行）修改過，曾發生認知不同步狀況。建議之後統一在單一對話框接續，或每次切換前務必上傳最新這份 `handoff-summary.md`，並直接相信使用者告知的最新狀態，不需要重複舉證。**本輪（8/12）再次驗證此風險確實存在**：對話一開始就發現使用者本機已經有另一批（來自別的對話框）改動好的 `Skeleton.tsx`／`Reveal.tsx`／API enum 修復（`WORKSHOP`/`FOREIGN`，疑似對應下方已知風險第 8 項），這些都不是本對話框做的，是透過 `git status`／`git diff` 輸出才發現的，詳見上方相關章節。

### 4. 「插畫親和風」全站視覺改版——已被本輪（8/12）新配色取代
完整規格見上方獨立章節，不要再壓縮成一兩行摘要。**8/12 更新：這個方向已經被「網格漸層 藍/青/黃綠」配色取代，不用再接續，見文件最上方「設計方向變更說明」章節。**

### 5. PowerShell 多行指令貼上會沾黏（重要，本輪再度發生，務必每次提醒）
使用者習慣把多行指令一次複製貼上，PowerShell 會把它們黏成一行指令執行，導致只有第一行真的跑、後面的參數被當成第一個指令的（不存在的）參數。**症狀特徵**：`git push` 顯示 `Everything up-to-date`（看似正常，其實代表根本沒有新 commit 可推）。**務必請使用者一行一行貼、每貼一行按一次 Enter，確認畫面回到新的 `PS C:\...>` 提示字元後，再貼下一行**。**本輪（8/12）：使用者這次全程都是一行一行貼、每次都附上完整的 PowerShell 實際輸出，沒有再發生沾黏問題，可以作為「有記取教訓」的正面案例。**

### 6. `git apply` patch 檔可能因下載路徑問題失敗
`present_files` 產生的 patch 檔案，使用者下載到本機後的實際檔名/路徑不一定跟預期一致，`git apply 檔名.patch` 可能出現 `No such file or directory`。**遇到這種情況不需要花時間排查路徑**，直接改用「逐段修改指示（找到 XX 段落 → 改成 YY）+ 請使用者用 `code 檔名` 手動修改」的備援方式，通常比繼續除錯 patch 路徑更快完成交付。**本輪（8/12）改用「完整檔案內容直接交付、使用者手動覆蓋」的方式全程執行，完全沒有再用 patch 檔，也沒有再遇到這個問題，建議之後預設採用這個交付方式。**

### 7. 尚待確認 / 之後要做的事（v6 原始清單，逐項保留）
- 視覺精修僅完成陰影層次，插畫親和風全站改版尚未實作（見上方「插畫親和風」章節的待實作項目清單）**（8/12 更新：插畫親和風方向已被取代，這條連帶過時，見上方說明）**
- Cool English、Facebook/YouTube 網址目前後台可能還是測試值，正式帳號申請下來後需回填正式網址（詳見上方 Phase 0「首頁新區塊」小節）
- 基隆市政府「封包」規格確認——**這條後來已確認**：以 ISO 光碟映像檔為主，Docker 為備案非優先（詳見下方「其他重要背景資訊」）
- **Docker 容器化本身（獨立於上面的封包格式問題）——暫緩，待網站功能全部做完才進行**，目前尚未開始評估容器化的實作細節
- **補充確認（本輪討論過）**：Docker 化跟「網站好不好看好不好用」是完全不同層次的兩件事，UI/UX 改版工作（插畫親和風、微互動）跟之後要不要做 Docker 封包沒有衝突，可以照原訂順序先把網站做完再處理封包，不用因為擔心衝突而卡住視覺改版的進度
### 8. 【狀態不確定，疑似已修復，8/12 發現線索但未完全確認】API 驗證層漏掉 WORKSHOP / FOREIGN 兩個新 enum 值
Phase 1 新增了 `AnnouncementCategory.WORKSHOP`（研習活動）跟 `TeacherType.FOREIGN`（外師）兩個 enum 值，資料庫、前台顯示、後台下拉選單都已經串接完成（見上方 Phase 1 章節），**原記錄：今天下午重新檢查時發現，後端 API 路由的 Zod 驗證 schema 沒有同步更新**，實際透過 API 送出這兩個新值會被擋下來：

```
src/app/api/announcements/route.ts:52       category: z.enum(['ANNOUNCEMENT','ACTIVITY','ADMISSION','COMPETITION','NEWS'])   ← 缺 WORKSHOP
src/app/api/announcements/[slug]/route.ts:27 category: z.enum(['ANNOUNCEMENT','ACTIVITY','ADMISSION','COMPETITION','NEWS']).optional()  ← 缺 WORKSHOP
src/app/api/teachers/route.ts:26            type: z.enum(['FULL_TIME','PART_TIME','STAFF']).default('FULL_TIME')   ← 缺 FOREIGN
src/app/api/teachers/[id]/route.ts:16       type: z.enum(['FULL_TIME','PART_TIME','STAFF']).optional()             ← 缺 FOREIGN
```

**影響**：後台新增/編輯公告選「研習活動」分類、或新增/編輯師資選「外師 (FOREIGN)」類型時，送出表單會被後端 422 驗證擋下，存檔失敗。這是否已經在實際操作中被使用者踩到還不確定（Phase 1 驗收時測的是選單顯示，不一定有實際送出存檔測試到這兩個新值），**下次接續時應優先修復並請使用者實測確認**。
**修復方式**：把上述 4 個檔案的 Zod enum 陣列，分別加入 `'WORKSHOP'`（announcements 兩個檔案）跟 `'FOREIGN'`（teachers 兩個檔案）即可，改動很小。

> **⚠️ 8/12 新發現的線索（重要，但尚未完全確認，下次接續務必跟使用者核對）**：本輪對話一開始，使用者本機的 `git status` 就已經顯示這 4 個檔案（`announcements/route.ts`、`announcements/[slug]/route.ts`、`teachers/route.ts`、`teachers/[id]/route.ts`）處於「已修改但尚未 commit」的狀態，後來使用者執行 `git commit -m "feat: 新增 WORKSHOP 公告分類"`（commit `cbff0a4`，**4 files changed, 9 insertions(+), 9 deletions(-)**）並 push 成功。從「改動的檔案清單完全對應上面這 4 個檔案」「改動行數 9 行對 9 行、規模跟『只加一個 enum 值 × 4 處』吻合」這兩點來看，**這個 bug 很可能已經被修復**——但這是另一個平行對話框做的（本對話框沒有實際看過這 4 個檔案改動後的完整內容，只看過其中 `announcements/[slug]/route.ts` 那段 `git diff` 片段，確認裡面確實加了 `'WORKSHOP'`），**沒有逐一確認 `teachers/route.ts`、`teachers/[id]/route.ts` 兩個檔案是否真的加了 `'FOREIGN'`**。下次接續時，建議直接問使用者「這個 API 驗證漏掉 WORKSHOP/FOREIGN 的問題，你們在後台實測過新增研習活動公告、新增外師資料，確認都能正常存檔嗎？」來做最終確認，如果都正常就可以把這一項正式標記為 ✅ 已解決；如果沒實測過，用上面「修復方式」的做法快速補齊即可。

---

## 🎯 下一步該做什麼（2026/08/14 更新，依優先順序，取代下方 8/13 版本的排序——舊版順序不刪除，保留在後方供對照）

**8/14 這輪完成的事**：查證並修正了 v13 錯誤記錄的配色狀態（實際是藍青黃綠，非大地暖色系，使用者確認維持現狀，不用再處理）；5 個首頁區塊套用 `<Reveal>` 滾動淡入動畫並確認 push 上線（commit `0481fe6`）；招生資訊殘留（Hero 按鈕、翻譯字串、Breadcrumb、quicklinks 孤兒 key）全部清除並確認 push 上線（commit `c193676`）。以下是最新優先順序：

1. **在瀏覽器實際跑過一輪，確認招生資訊完全清除後沒有殘留的死連結或版面跑掉**——這是唯一持續從 8/12 拖到現在、還沒實機驗證過的項目，這輪雖然把程式碼層級的殘留都清乾淨了，但沒有請使用者實際點過整個網站確認視覺效果，建議下次接續優先做這件事
2. **確認配色一致性的剩餘範圍**（8/12、8/13 都記錄過，8/14 這輪同樣沒處理）——師資介紹／相簿／影片／文件下載這幾個前台頁面、以及整個後台管理介面，目前確認過的是「首頁 7 個區塊 + Navbar + Footer + About 頁面」用的是藍青黃綠配色，這幾個頁面現在是哪個版本都還不確定，下次要傳檔案來看才能判斷
3. **確認 API 驗證漏掉 WORKSHOP/FOREIGN 的 bug 是否已經解決**（見上方「已知風險」第 8 項）——8/12 發現很可能已在別的對話框修復，8/13、8/14 都沒有新進度，建議直接問使用者確認
4. **先確認 UI 微互動功能包有沒有套用**——最早交付、狀態最不確定的項目，套用時要注意跟目前的配色版本比對合併，不要整份覆蓋蓋掉現有配色跟這輪剛套上的 Reveal 動畫
5. **雙語教學推動**（Phase 2 排定項目）——新建 `BilingualSchool` 資料表、外師生活指南靜態頁面
6. 開始 Phase 2 前，「待確認問題」章節列的兩個問題（電子報/期刊要不要新建 `Publication` 資料表、教案庫排在哪個 Phase）建議先問使用者一次
7. **Docker / ISO 封包**——使用者已明確表示暫不處理，維持「待網站功能全部做完才進行」的原則

### 舊版下一步排序（2026/08/13，保留供對照，不再是目前優先順序）

## 🎯 下一步該做什麼（2026/08/13 更新，依優先順序，取代下方 8/12 版本的排序——舊版順序不刪除，保留在後方供對照）

**8/13 這輪完成的事**：全站配色三度改版（大地暖色系，取代 8/12 的網格漸層藍青黃綠）已定案並依使用者說法上線；整理保存了 5 個常用比稿／診斷 prompt 範本供之後重複使用。以下是最新優先順序：

1. **補齊 8/13 這輪的 commit hash 記錄**——這輪跟先前幾輪不同，沒有逐步核對 `npm run build`／`git commit`／`git push` 的實際輸出，先問使用者「這輪大地暖色系配色，git log 最新的 commit 是哪一筆？」把記錄補扎實
2. **確認 `<Reveal>` 滾動淡入動畫是否還存在**——`QuickLinksSection.tsx`／`AboutSection.tsx`／`NewsSection.tsx`／`SocialSection.tsx`／`CoolEnglishSection.tsx` 這 5 個檔案本輪配色定案時有「整份覆蓋互相蓋掉」的風險，先問使用者「這幾個區塊往下捲動還有沒有淡入動畫」，如果沒有了要重新補上
3. **確認配色一致性的剩餘範圍**（8/12 就記錄過、8/13 這輪同樣沒處理）——師資介紹／相簿／影片／文件下載這幾個前台頁面、以及整個後台管理介面，色票又換過一輪了，這些頁面現在是哪個版本的配色（插畫親和風／網格漸層/大地暖色系其中之一，或還是最原始的深藍金）都不確定，下次要傳檔案來看才能判斷
4. **在瀏覽器實際跑過一輪，確認招生資訊移除後沒有殘留的死連結或版面跑掉**——8/12 就待確認的項目，8/13 沒有新進度
5. **確認 API 驗證漏掉 WORKSHOP/FOREIGN 的 bug 是否已經解決**（見上方「已知風險」第 8 項）——8/12 發現很可能已在別的對話框修復，8/13 沒有新進度，建議直接問使用者確認
6. **先確認 UI 微互動功能包有沒有套用**——最早交付、狀態最不確定的項目，套用時要注意跟本輪（8/13）改過的 `globals.css` 版本比對合併，不要整份覆蓋蓋掉最新配色
7. **雙語教學推動**（Phase 2 排定項目）——新建 `BilingualSchool` 資料表、外師生活指南靜態頁面
8. 開始 Phase 2 前，「待確認問題」章節列的兩個問題（電子報/期刊要不要新建 `Publication` 資料表、教案庫排在哪個 Phase）建議先問使用者一次
9. **Docker / ISO 封包**——使用者已明確表示暫不處理，維持「待網站功能全部做完才進行」的原則

### 舊版下一步排序（2026/08/12，保留供對照，不再是目前優先順序）

## 🎯 下一步該做什麼（2026/08/12 更新，依優先順序）

**8/12 這輪完成的事**：全站配色改版第一批（首頁 7 sections + Navbar + Footer + tailwind 色階 + About 頁面）已 push 上線；招生資訊功能已完全移除（前台三個入口 + 頁面檔案）。以下依優先順序列出接下來建議做的事，**舊清單裡沒做完的項目全部保留，新項目往上加**：

1. **確認配色一致性的剩餘範圍**（本輪新增，最新鮮的未完成項目）——師資介紹／相簿／影片／文件下載這幾個前台頁面、以及整個後台管理介面，這輪完全沒檢查過配色現況，下次接續時可以直接說「照 handoff-summary 的『尚未確認配色一致性的範圍』清單，繼續檢查師資/相簿/影片/文件下載頁面的配色」，或「繼續檢查後台管理介面的配色」，把對應檔案傳給 Claude 看
2. **在瀏覽器實際跑過一輪，確認招生資訊移除後沒有殘留的死連結或版面跑掉**——這輪的刪除都是靠讀程式碼判斷，使用者尚未回報是否已經實機測試過整個網站
3. **確認 API 驗證漏掉 WORKSHOP/FOREIGN 的 bug 是否已經解決**（見上方「已知風險」第 8 項的 8/12 新發現線索）——有很高機率已經在另一個對話框修復並 commit 過了，但建議先跟使用者確認過一次「後台新增研習活動公告、新增外師資料，存檔都正常嗎」，確認沒問題就能把這項正式關閉，不用再重複修
4. **先確認 UI 微互動功能包有沒有套用**——這是最早交付、狀態最不確定的項目，先問使用者「上次那份 UI微互動功能包.zip 套用了嗎？」，沒套用就先帶著套用（骨架屏、頁面淡入、卡片按鈕陰影層次），**套用時記得跟本輪已經改過的 `globals.css` 版本比對合併，不要整份覆蓋蓋掉配色改動**，套用驗證成功後記得回來更新這份文件的狀態標記
5. **雙語教學推動**（Phase 2 排定項目，見上方「尚未處理（待下一輪）」章節）——新建 `BilingualSchool` 資料表、外師生活指南靜態頁面，直接說「照這份 handoff-summary 的『雙語教學推動』清單開始做」即可接續
6. 開始 Phase 2 前，「待確認問題」章節列的兩個問題（電子報/期刊要不要新建 `Publication` 資料表、教案庫排在哪個 Phase）建議先問使用者一次，再決定下一輪範圍
7. **Docker / ISO 封包**——使用者已明確表示這輪暫不處理，維持「待網站功能全部做完才進行」的原則，除非使用者主動說要現在開始
---

## 開新對話框時怎麼用

把這份 `handoff-summary.md` 上傳給 Claude，並說「請照這份進度接續下去」即可無縫接續，不需要重新解釋整個專案背景。

唯一要主動告知的情況：換了新電腦、換了新的 GitHub repo、資料庫搬家，或是在其他對話框已經處理完但這份文件還沒更新的項目（請直接告知最新狀態，Claude 會相信並更新文件，不需要重複舉證）。

「法規表單下載分頁」已全部驗證完成收尾，不用再接續。
「插畫親和風」原本的暖黃配色方向**已經被 8/12 這輪的「網格漸層 藍/青/黃綕」配色取代**，這是目前實際線上的配色。**8/13 文件曾記錄「又被大地暖色系取代」，但這是錯誤記錄，8/14 已查證修正**——目前線上其實還是網格漸層藍青黃綠，大地暖色系從未真正套用進 `tailwind.config.ts`，使用者已確認維持藍青黃綠現狀，不用再接續配色定案本身，也不用改回大地暖色系。包含原本待辦的「導覽選單檢查」也已經在 8/12 一併完成。
**8/14 新增：Reveal 滾動淡入動畫已套用到 5 個首頁區塊並確認 push 上線（commit `0481fe6`），不用再接續**；如果之後想調整動畫細節（延遲時間、進場方向），可以直接說「照這份 handoff-summary 已套用的 `<Reveal>` 用法去調整 XX 區塊的動畫效果」。
**8/14 新增：招生資訊功能已徹底清除（含 Hero 按鈕、翻譯字串、Breadcrumb、quicklinks 孤兒 key），commit `c193676`，不用再接續**；下次如果使用者回報還有「招生資訊」字樣的地方，代表又是漏網之魚，建議直接用 `git grep -rn "招生資訊" -- "src"` 查一次確認範圍，不要用猜的。
**8/13 新增：如果要開新一輪視覺比稿，可以直接說「照這份 handoff-summary『常用比稿／診斷 Prompt 範本庫』的範本 X，幫我改成 XX 用途」**，不用重新想措辭，5 個範本涵蓋診斷除錯、嚴格分階段規則、三種比稿規格。
**8/12 新增：如果要接續配色一致性檢查，可以直接說「照這份 handoff-summary『尚未確認配色一致性的範圍』清單，繼續檢查 XX 頁面/後台的配色」**，並把對應檔案傳上來——**8/14 提醒：這個清單現在要核對的目標配色是網格漸層藍青黃綠，不是大地暖色系**。
如果要修 API 驗證漏掉 WORKSHOP/FOREIGN 的 bug，**8/12 更新：這項很可能已經在別的對話框修復了，先問使用者確認過一次再動手**，如果確認還沒修，可以直接說：「照這份 handoff-summary『已知風險』第 8 項的說明去修 API 驗證」。
如果要接續「雙語教學推動」，可以直接說：「照這份 handoff-summary 的『雙語教學推動』清單開始做」。

記得：
1. 改完程式碼一定要產生 patch 檔或完整內容交付，不能只在沙盒驗證就結束；patch 檔如果套用失敗，改用逐段文字修改指示更快。**8/12 驗證：直接交付完整檔案內容、請使用者手動覆蓋路徑的方式全程順暢，沒有再遇到 patch 路徑問題，建議之後預設採用這個方式**
2. 如果要跑 `prisma migrate dev`，先留意已知的 migration 歷史 drift 問題，優先用 `db execute` 手動 SQL 繞過 reset 警告
3. 檔案修改用 `code 檔名` 全選刪除貼上，不要用 PowerShell heredoc；`<a` 標籤不要單獨換行
4. 請使用者貼多行指令時務必一行一行貼、確認上一行跑完再貼下一行，避免 PowerShell 沾黏成一行指令而悄悄失敗
5. **8/12 新增**：操作路徑含 `[locale]`、`[slug]`、`[id]` 這類方括號動態路由資料夾的 PowerShell 指令（尤其是 `Remove-Item`），務必加 `-LiteralPath` 參數，否則方括號會被當萬用字元語法解讀，導致指令「看似成功、實際沒真的動到檔案」
6. **更新這份文件時只能增補，不要把任何區塊壓縮成摘要**——這份 v13 延續 v8/v9/v10/v11/v12 的規則，只新增本輪內容，沒有刪減或壓縮任何舊區塊
7. **交付 zip 或 patch 後，不代表工作結束**——一定要在後續往來中明確拿到使用者「已套用、已 build 成功、已 push」的確認，才能把該項目標記為 ✅ 已完成；UI 微互動功能包就是「交付了但沒確認」的活生生例子，**8/12 這輪也再次驗證了同樣的原則不能鬆懈**——本輪雖然全部改動都拿到 commit hash 確認，但配色一致性檢查範圍不完整（只做了使用者主動傳上來的檔案），不能假設沒傳的檔案也已經處理好，下次接續務必先確認範圍再動手，不要重蹈覆轍
8. **8/13 新增（本輪最重要的教訓）**：如果同一個專案有多個對話框在同一時間改同一批檔案（例如一邊加動畫、一邊改顏色），**兩邊的「整份檔案覆蓋」會互相蓋掉對方的改動**，不會自動合併。發現這種情況時，正確做法是先套用其中一邊、把套用後的實際檔案內容要回來，再在這個基礎上疊加另一邊的改動，不要兩邊各自對「舊版本」重新產生完整檔案後再各自要求使用者覆蓋，那樣後貼的一定會蓋掉先貼的
9. **8/13 新增**：這輪配色定案雖然使用者明確說「已上線」，但沒有像先前幾輪一樣核對 commit hash／build 輸出，**這種「相信使用者說法但缺乏逐步核對」的記錄要老實標注出來**，不要為了讓文件看起來完整而假裝有核對過——之後有機會補齊時再回來更新，比先斬後奏、事後發現記錄跟實際狀況對不上要好
10. **8/14 新增（驗證了第 9 點教訓的後果）**：v13 那則「未逐步核對」的記錄，這輪一查證就發現是錯的——大地暖色系根本沒上線。這證實了「口頭說法」跟「實際核對」之間的落差不是理論風險，是真的會發生、而且會被寫成錯誤記錄流傳到下一版文件。**之後只要狀態可以用 `git log`／`git show <commit>:<檔案>` 客觀查證，就直接查證，不要只憑一句話記錄成確定事實**，即使查證需要多來回一兩次也值得
11. **8/14 新增**：修改 JSON 這類格式嚴謹的檔案時，在沙盒裡交付前先用 `python3 -c "import json; json.load(open('檔名'))"` 驗證過語法合法再交付給使用者，比事後才發現漏了逗號或括號導致 `npm run build` 失敗更省來回時間，值得列為之後改 JSON 檔案的標準動作

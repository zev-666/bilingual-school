// src/lib/portal-data.ts
// ─────────────────────────────────────────────────────────────────────────────
// 首頁互動門戶所使用的「靜態設定資料」。
// 這裡放的是不會進資料庫、但需要常常微調的內容（中心聯絡方式、全市學校名冊、
// 首頁四個關鍵數字）。改這個檔案不需要動任何元件程式碼。
// ─────────────────────────────────────────────────────────────────────────────

/** 基隆市七大行政區固定顯示順序 */
export const DISTRICTS = [
  '仁愛區',
  '中正區',
  '信義區',
  '中山區',
  '安樂區',
  '七堵區',
  '暖暖區',
] as const

export type SchoolType = 'ELEMENTARY' | 'JUNIOR'

export interface PortalSchool {
  name: string
  district: string
  type: SchoolType
  /** 學校總機（公開資訊）。校長私人電話一律不放上公開網站。 */
  phone: string
}

/**
 * 全市 50 所國中小名冊。
 * 資料來源：《基隆市市屬教育單位聯絡電話一覽表》（115.08.01 修正版）。
 * ⚠️ 只保留「校名 / 行政區 / 學制 / 學校總機」四欄；原表的校長姓名、校長市話、
 *    校長住家手機、傳真皆屬內部聯絡資料，依原表註記「請勿外流」，不放上公開網站。
 */
export const SCHOOLS: PortalSchool[] = [
  { name: '八斗國小', district: '中正區', type: 'ELEMENTARY', phone: '(02) 2469-3391' },
  { name: '正濱國小', district: '中正區', type: 'ELEMENTARY', phone: '(02) 2463-5551' },
  { name: '中正國小', district: '中正區', type: 'ELEMENTARY', phone: '(02) 2422-3064' },
  { name: '和平國小', district: '中正區', type: 'ELEMENTARY', phone: '(02) 2462-2106' },
  { name: '忠孝國小', district: '中正區', type: 'ELEMENTARY', phone: '(02) 2462-2934' },
  { name: '信義國小', district: '信義區', type: 'ELEMENTARY', phone: '(02) 2421-3960' },
  { name: '深美國小', district: '信義區', type: 'ELEMENTARY', phone: '(02) 2465-4821' },
  { name: '中興國小', district: '信義區', type: 'ELEMENTARY', phone: '(02) 2422-5038' },
  { name: '深澳國小', district: '信義區', type: 'ELEMENTARY', phone: '(02) 2465-2940' },
  { name: '東信國小', district: '信義區', type: 'ELEMENTARY', phone: '(02) 2465-2133' },
  { name: '東光國小', district: '信義區', type: 'ELEMENTARY', phone: '(02) 2465-0329' },
  { name: '仁愛國小', district: '仁愛區', type: 'ELEMENTARY', phone: '(02) 2428-9131' },
  { name: '成功國小', district: '仁愛區', type: 'ELEMENTARY', phone: '(02) 2431-3939' },
  { name: '南榮國小', district: '仁愛區', type: 'ELEMENTARY', phone: '(02) 2422-3038' },
  { name: '武崙國小', district: '安樂區', type: 'ELEMENTARY', phone: '(02) 2431-0018' },
  { name: '建誠國小', district: '安樂區', type: 'ELEMENTARY', phone: '(02) 2433-4216' },
  { name: '安樂國小', district: '安樂區', type: 'ELEMENTARY', phone: '(02) 2422-0814' },
  { name: '長樂國小', district: '安樂區', type: 'ELEMENTARY', phone: '(02) 2432-2765' },
  { name: '西定國小', district: '安樂區', type: 'ELEMENTARY', phone: '(02) 2422-3856' },
  { name: '隆聖國小', district: '安樂區', type: 'ELEMENTARY', phone: '(02) 2431-1480' },
  { name: '七堵國小', district: '七堵區', type: 'ELEMENTARY', phone: '(02) 2456-7116' },
  { name: '五堵國小', district: '七堵區', type: 'ELEMENTARY', phone: '(02) 2451-1457' },
  { name: '長興國小', district: '七堵區', type: 'ELEMENTARY', phone: '(02) 2455-4790' },
  { name: '堵南國小', district: '七堵區', type: 'ELEMENTARY', phone: '(02) 2451-1339' },
  { name: '華興國小', district: '七堵區', type: 'ELEMENTARY', phone: '(02) 2451-2022' },
  { name: '尚仁國小', district: '七堵區', type: 'ELEMENTARY', phone: '(02) 2431-1708' },
  { name: '復興國小', district: '七堵區', type: 'ELEMENTARY', phone: '(02) 2451-5601' },
  { name: '瑪陵國小', district: '七堵區', type: 'ELEMENTARY', phone: '(02) 2456-5663' },
  { name: '碇內國小', district: '暖暖區', type: 'ELEMENTARY', phone: '(02) 2458-1300' },
  { name: '暖西國小', district: '暖暖區', type: 'ELEMENTARY', phone: '(02) 2458-8583' },
  { name: '暖暖國小', district: '暖暖區', type: 'ELEMENTARY', phone: '(02) 2458-3795' },
  { name: '暖江國小', district: '暖暖區', type: 'ELEMENTARY', phone: '(02) 2457-4348' },
  { name: '八堵國小', district: '暖暖區', type: 'ELEMENTARY', phone: '(02) 2457-3287' },
  { name: '中和國小', district: '中山區', type: 'ELEMENTARY', phone: '(02) 2437-1751' },
  { name: '德和國小', district: '中山區', type: 'ELEMENTARY', phone: '(02) 2427-8095' },
  { name: '中華國小', district: '中山區', type: 'ELEMENTARY', phone: '(02) 2422-5530' },
  { name: '中山國小', district: '中山區', type: 'ELEMENTARY', phone: '(02) 2422-3053' },
  { name: '仙洞國小', district: '中山區', type: 'ELEMENTARY', phone: '(02) 2422-3031' },
  { name: '港西國小', district: '中山區', type: 'ELEMENTARY', phone: '(02) 2422-3068' },
  { name: '銘傳國中', district: '中正區', type: 'JUNIOR', phone: '(02) 2422-3120' },
  { name: '建德國中', district: '安樂區', type: 'JUNIOR', phone: '(02) 2432-1234' },
  { name: '中正國中', district: '中正區', type: 'JUNIOR', phone: '(02) 2428-2191' },
  { name: '武崙國中', district: '安樂區', type: 'JUNIOR', phone: '(02) 2434-2201' },
  { name: '碇內國中', district: '暖暖區', type: 'JUNIOR', phone: '(02) 2458-6105' },
  { name: '百福國中', district: '七堵區', type: 'JUNIOR', phone: '(02) 2451-1158' },
  { name: '明德國中', district: '七堵區', type: 'JUNIOR', phone: '(02) 2456-1274' },
  { name: '信義國中', district: '信義區', type: 'JUNIOR', phone: '(02) 2465-2199' },
  { name: '成功國中', district: '仁愛區', type: 'JUNIOR', phone: '(02) 2422-5594' },
  { name: '南榮國中', district: '仁愛區', type: 'JUNIOR', phone: '(02) 2428-2188' },
  { name: '正濱國中', district: '中正區', type: 'JUNIOR', phone: '(02) 2463-1490' },
]

/**
 * 首頁四個關鍵數字。
 * value 直接顯示，改這裡就會改前台。
 */
export const KEY_METRICS = [
  { icon: '🏫', valueZh: '50 所', valueEn: '50', labelZh: '服務全市國中小學校', labelEn: 'Schools served citywide', highlight: false },
  { icon: '✈️', valueZh: '30+ 位', valueEn: '30+', labelZh: '現役 FET / ELTA 外籍教師', labelEn: 'Active FET / ELTA teachers', highlight: true },
  { icon: '🎓', valueZh: '100+', valueEn: '100+', labelZh: '年度雙語研習參與人次', labelEn: 'Annual workshop participants', highlight: false },
  { icon: '📥', valueZh: '1,000+', valueEn: '1,000+', labelZh: '教學教案與表單下載量', labelEn: 'Lesson plan & form downloads', highlight: true },
]

/**
 * ⚠️ 上線前請務必確認以下四項是否為正確的對外聯絡資訊。
 * 電話取自《基隆市市屬教育單位聯絡電話一覽表》碇內國中總機。
 */
export const CENTER_INFO = {
  addressZh: '基隆市暖暖區源遠路 20 號（碇內國中內）',
  addressEn: 'No. 20, Yuanyuan Rd., Nuannuan Dist., Keelung City (inside Dingnei Junior High School)',
  phone: '(02) 2458-6105',
  email: 'kleerc@kl.edu.tw',
  supervisorZh: '基隆市政府教育處',
  supervisorEn: 'Department of Education, Keelung City Government',
  hostZh: '碇內國中',
  hostEn: 'Dingnei Junior High School',
}

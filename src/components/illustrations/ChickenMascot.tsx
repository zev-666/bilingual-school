// src/components/illustrations/ChickenMascot.tsx
// ─────────────────────────────────────────────────────────────────────────────
// 吉祥物「小雞」— 全站插圖的共用元件。
//
// 造型取自 EERC 圓形徽章裡的白雞（白身、紅冠、黃喙、紅肉垂、粉臉頰），
// 但重畫成扁平幾何風的 inline SVG，理由：
//   1. 徽章原圖是 2816×1536 的點陣圖，放進插圖裡會糊、檔案也太大
//   2. inline SVG 不放 public/，不需要處理 middleware 的路徑改寫
//   3. 顏色可以跟著卡片底色調整，白身在淺色底上能加描邊
//
// ⚠️ 這是「吉祥物版」，不是正式識別標誌。
//    公文、證書、印刷品一律用 public/images/logo-eerc.png（完整圓形徽章）。
//    網頁頁首／頁尾請用 <Logo variant="full" />，不要用這個元件。
//
// 用法：
//   <ChickenMascot x={110} y={104} scale={1} />                 站立
//   <ChickenMascot x={130} y={172} scale={0.8} headphones />    戴耳機
//   <ChickenMascot x={152} y={122} scale={1} wave />            揮手
//   <ChickenMascot x={32} y={36} scale={0.46} headOnly />       只有頭
//   <ChickenMascot ... outlined />  淺色底時加淡描邊，避免白身看不見輪廓
// ─────────────────────────────────────────────────────────────────────────────

/** 吉祥物配色。數值與 tailwind.config.ts 的暖色系一致，不引進新色票。 */
export const CHICK = {
  body: '#FFFFFF',
  belly: '#FFF8EC',
  wing: '#F3E4D2',
  comb: '#E8736B', // 雞冠與肉垂
  beak: '#F5A623',
  eye: '#4A3B30', // = tailwind ink
  cheek: '#F6B5AE',
  deep: '#9A4E0B', // = tailwind primary-700
  green: '#2F7A5C',
  mint: '#7FC8A9', // = tailwind mint
  outline: '#E7D6C2',
} as const

interface ChickenMascotProps {
  /** 在父層 SVG 座標系裡的位置（身體中心） */
  x: number
  y: number
  /** 縮放倍率，1 約等於 88×116 的身形 */
  scale?: number
  /** 揮手：左翅舉起 */
  wave?: boolean
  /** 戴耳機 */
  headphones?: boolean
  /** 只畫頭（給小尺寸圖示用，省略腳與翅膀） */
  headOnly?: boolean
  /** 淺色底上加一圈淡描邊，避免全白身體沒有輪廓 */
  outlined?: boolean
}

export default function ChickenMascot({
  x,
  y,
  scale = 1,
  wave = false,
  headphones = false,
  headOnly = false,
  outlined = false,
}: ChickenMascotProps) {
  const stroke = outlined ? CHICK.outline : 'none'
  const strokeWidth = outlined ? 2.5 : 0

  return (
    <g transform={`translate(${x},${y}) scale(${scale})`}>
      {/* 腳（畫在身體之下，才會被身體壓住上緣） */}
      {!headOnly && (
        <>
          <path
            d="M-16,44 l0,10 M-23,57 l7,-5 l7,5"
            stroke={CHICK.beak}
            strokeWidth={5}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <path
            d="M16,44 l0,10 M9,57 l7,-5 l7,5"
            stroke={CHICK.beak}
            strokeWidth={5}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </>
      )}

      {/* 翅膀 */}
      {!headOnly && (
        <>
          {wave ? (
            <ellipse
              cx={-42}
              cy={-20}
              rx={10}
              ry={20}
              fill={CHICK.wing}
              transform="rotate(-42 -42 -20)"
            />
          ) : (
            <ellipse cx={-38} cy={10} rx={9} ry={16} fill={CHICK.wing} />
          )}
          <ellipse cx={38} cy={10} rx={9} ry={16} fill={CHICK.wing} />
        </>
      )}

      {/* 雞冠 */}
      <circle cx={-13} cy={-49} r={9} fill={CHICK.comb} />
      <circle cx={0} cy={-57} r={11} fill={CHICK.comb} />
      <circle cx={13} cy={-49} r={9} fill={CHICK.comb} />

      {/* 身體 */}
      <ellipse
        cx={0}
        cy={0}
        rx={44}
        ry={48}
        fill={CHICK.body}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
      <ellipse cx={0} cy={15} rx={29} ry={29} fill={CHICK.belly} />

      {/* 臉頰 */}
      <circle cx={-27} cy={5} r={7.5} fill={CHICK.cheek} />
      <circle cx={27} cy={5} r={7.5} fill={CHICK.cheek} />

      {/* 眼睛 */}
      <circle cx={-15} cy={-11} r={6} fill={CHICK.eye} />
      <circle cx={15} cy={-11} r={6} fill={CHICK.eye} />
      <circle cx={-13} cy={-13} r={2.2} fill="#FFFFFF" />
      <circle cx={17} cy={-13} r={2.2} fill="#FFFFFF" />

      {/* 喙與肉垂 */}
      <path d="M-9,2 L9,2 L0,13 Z" fill={CHICK.beak} />
      <circle cx={0} cy={18} r={6} fill={CHICK.comb} />

      {/* 耳機 */}
      {headphones && (
        <>
          <path
            d="M-47,-16 A47,47 0 0 1 47,-16"
            stroke={CHICK.deep}
            strokeWidth={7}
            fill="none"
            strokeLinecap="round"
          />
          <rect x={-57} y={-16} width={20} height={30} rx={10} fill={CHICK.deep} />
          <rect x={37} y={-16} width={20} height={30} rx={10} fill={CHICK.deep} />
        </>
      )}
    </g>
  )
}

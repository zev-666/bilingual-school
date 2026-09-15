// src/components/illustrations/PortalEnglishTeaching.tsx
// 入口卡一「英語教學」的插圖：小雞在翻開的書後面，旁邊漂著 ABC 積木。
// 底色為珊瑚色 bg-coral (#F08A7A)，白身小雞在上面對比足夠，不需要描邊。
import ChickenMascot, { CHICK } from './ChickenMascot'

/** ABC 積木 */
function Block({
  x,
  y,
  size,
  fill,
  letter,
  color,
}: {
  x: number
  y: number
  size: number
  fill: string
  letter: string
  color: string
}) {
  return (
    <>
      <rect x={x} y={y} width={size} height={size} rx={size * 0.3} fill={fill} />
      <text
        x={x + size / 2}
        y={y + size * 0.7}
        textAnchor="middle"
        fontSize={size * 0.55}
        fontWeight={700}
        fill={color}
      >
        {letter}
      </text>
    </>
  )
}

export default function PortalEnglishTeaching({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 260 240" className={className} aria-hidden="true" focusable="false">
      <circle cx={128} cy={118} r={104} fill="#FFFFFF" opacity={0.18} />

      <Block x={186} y={24} size={40} fill="#FFD97D" letter="A" color={CHICK.deep} />
      <Block x={216} y={72} size={34} fill="#FFFFFF" letter="B" color={CHICK.deep} />
      <Block x={184} y={112} size={34} fill={CHICK.mint} letter="C" color="#1F5C45" />

      <ChickenMascot x={110} y={104} scale={1.02} />

      {/* 翻開的書 */}
      <path d="M14,222 L14,174 Q62,163 100,182 L100,230 Q62,211 14,222 Z" fill={CHICK.belly} />
      <path d="M186,222 L186,174 Q138,163 100,182 L100,230 Q138,211 186,222 Z" fill={CHICK.belly} />
      <rect x={96} y={176} width={8} height={54} rx={4} fill={CHICK.deep} />
      <rect x={28} y={188} width={54} height={6} rx={3} fill="#F5C89B" />
      <rect x={28} y={203} width={40} height={6} rx={3} fill="#F5C89B" />
      <rect x={118} y={188} width={54} height={6} rx={3} fill="#F5C89B" />
      <rect x={118} y={203} width={40} height={6} rx={3} fill="#F5C89B" />
    </svg>
  )
}

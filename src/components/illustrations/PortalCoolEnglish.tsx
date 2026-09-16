// src/components/illustrations/PortalCoolEnglish.tsx
// 入口卡二「線上學習 Cool English」的插圖：小雞戴著耳機，站在螢幕前面。
// 底色為奶油黃 bg-coYellow (#FFD97D)，白身小雞在上面對比足夠，不需要描邊。
import ChickenMascot, { CHICK } from './ChickenMascot'

export default function PortalCoolEnglish({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 260 240" className={className} aria-hidden="true" focusable="false">
      <circle cx={130} cy={112} r={104} fill="#FFFFFF" opacity={0.32} />

      {/* 螢幕 */}
      <rect x={44} y={12} width={172} height={116} rx={18} fill="#FFFFFF" />
      <rect x={57} y={25} width={146} height={90} rx={12} fill={CHICK.green} />
      <path d="M112,50 L148,70 L112,90 Z" fill="#FFFFFF" />
      {/* 螢幕底座 */}
      <rect x={114} y={128} width={32} height={12} rx={5} fill="#FFFFFF" />
      <rect x={92} y={138} width={76} height={10} rx={5} fill="#FFFFFF" />

      <ChickenMascot x={130} y={172} scale={0.82} headphones />
    </svg>
  )
}

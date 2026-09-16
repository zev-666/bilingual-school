// src/components/illustrations/PortalFet.tsx
// 入口卡三「外師專區」的插圖：小雞揮手打招呼，旁邊有地球儀與 Hi! 對話框。
// 底色為淺藍 #A7DCEE，白身小雞在上面對比足夠，不需要描邊。
//
// 揮手的翅膀在滑鼠移過卡片時會輕輕擺動，動畫定義在 globals.css 的
// .portal-card:hover .chick-wave（尊重 prefers-reduced-motion）。
import ChickenMascot, { CHICK } from './ChickenMascot'

export default function PortalFet({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 260 240" className={className} aria-hidden="true" focusable="false">
      <circle cx={130} cy={118} r={104} fill="#FFFFFF" opacity={0.26} />

      {/* 地球儀 */}
      <defs>
        <clipPath id="portal-fet-globe">
          <circle cx={58} cy={164} r={46} />
        </clipPath>
      </defs>
      <circle cx={58} cy={164} r={46} fill={CHICK.belly} />
      <g clipPath="url(#portal-fet-globe)">
        <path d="M18,132 q26,-2 30,20 q3,22 -22,24 q-22,-6 -20,-24 q-2,-14 12,-20 Z" fill={CHICK.mint} />
        <path
          d="M66,146 q24,6 26,28 q2,22 -20,26 q-18,-8 -14,-30 q1,-16 8,-24 Z"
          fill={CHICK.green}
          opacity={0.75}
        />
        <path d="M30,196 q20,-4 30,8 q-10,14 -32,8 Z" fill={CHICK.mint} opacity={0.9} />
      </g>
      <circle cx={58} cy={164} r={46} fill="none" stroke="#D8B48C" strokeWidth={2.5} />
      <ellipse cx={58} cy={164} rx={19} ry={46} fill="none" stroke="#D8B48C" strokeWidth={2.5} />
      <line x1={12} y1={164} x2={104} y2={164} stroke="#D8B48C" strokeWidth={2.5} />

      {/* Hi! 對話框 */}
      <rect x={176} y={10} width={76} height={50} rx={17} fill={CHICK.deep} />
      <path d="M194,58 l2,18 l17,-15 Z" fill={CHICK.deep} />
      <text
        x={214}
        y={43}
        textAnchor="middle"
        fontSize={25}
        fontWeight={700}
        fill="#FFF6E9"
      >
        Hi!
      </text>

      {/* 揮手的小雞：整組套 .chick-wave，hover 時擺動 */}
      <g className="chick-wave">
        <ChickenMascot x={152} y={122} scale={1} wave />
      </g>
    </svg>
  )
}

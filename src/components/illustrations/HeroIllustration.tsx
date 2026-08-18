import React from 'react';

export default function HeroIllustration() {
  return (
    <svg 
      viewBox="0 0 500 400" 
      width="100%" 
      height="100%" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className="drop-shadow-sm transition-transform duration-300 hover:scale-[1.01]"
    >
      {/* 背景裝飾圓形/光暈 */}
      <circle cx="250" cy="200" r="160" fill="#FFF3EE" opacity="0.8" />
      <circle cx="380" cy="90" r="40" fill="#FEF9C3" opacity="0.6" />

      {/* 老師/外師主體 - 身體與服裝 (使用柑橘暖色系主色 #C34E24) */}
      <path 
        d="M210 280C210 246.863 236.863 220 270 220H310C343.137 220 370 246.863 370 280V320H210V280Z" 
        fill="#C34E24" 
      />
      
      {/* 講台 / 桌子 */}
      <rect x="130" y="270" width="240" height="70" rx="12" fill="#2D241E" />
      <rect x="150" y="290" width="200" height="30" rx="6" fill="#4A3B32" />

      {/* 筆電與教學設備 */}
      <path d="M210 270L230 230H270L290 270H210Z" fill="#EFE9E1" />
      <rect x="225" y="238" width="50" height="25" rx="3" fill="#C34E24" opacity="0.2" />

      {/* 頭部與頭髮 */}
      <circle cx="290" cy="165" r="38" fill="#FCE8D8" />
      <path 
        d="M260 155C260 135.67 275.67 120 295 120C314.33 120 330 135.67 330 155V170H260V155Z" 
        fill="#2D241E" 
      />

      {/* 學生/參與者互動角色 (左側) */}
      <circle cx="150" cy="180" r="30" fill="#FCE8D8" />
      <path d="M125 230C125 202.386 147.386 180 175 180H185V260H125V230Z" fill="#B45309" />
      <path d="M130 170C130 153.431 143.431 140 160 140H170V170H130Z" fill="#4A3B32" />

      {/* 互動白板 / 簡報螢幕背景 */}
      <rect x="80" y="60" width="180" height="110" rx="10" fill="#FFFFFF" stroke="#EFE9E1" strokeWidth="4" />
      <rect x="100" y="80" width="100" height="12" rx="6" fill="#C34E24" opacity="0.8" />
      <rect x="100" y="104" width="140" height="8" rx="4" fill="#EFE9E1" />
      <rect x="100" y="122" width="120" height="8" rx="4" fill="#EFE9E1" />

      {/* 漂浮的教育標籤/對話框 (呼應 unDraw 風格) */}
      <g transform="translate(320, 60)">
        <rect width="110" height="45" rx="10" fill="#FFFFFF" stroke="#EFE9E1" strokeWidth="3" />
        <text x="55" y="27" fontFamily="sans-serif" fontWeight="bold" fontSize="14" fill="#C34E24" textAnchor="middle">
          English EERC
        </text>
      </g>
    </svg>
  );
}
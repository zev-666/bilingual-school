'use client';

import { useFontSize } from '@/contexts/FontSizeContext';

/**
 * 字體縮放無障礙工具（A- / A+ 兩顆按鈕）
 * 放在 Navbar 右側，鄰近語言切換按鈕。溫暖風格，跟其他控制項一致。
 */
export default function FontSizeAdjuster() {
  const { decrease, increase, atMin, atMax } = useFontSize();

  return (
    <div
      className="flex shrink-0 items-center overflow-hidden rounded-full border border-[#FBDCB3] bg-[#FFF1E0]"
      role="group"
      aria-label="字體大小調整 / Adjust font size"
    >
      <button
        type="button"
        onClick={decrease}
        disabled={atMin}
        aria-label="縮小字體"
        title="縮小字體 Decrease font size"
        className="shrink-0 px-2.5 py-1.5 text-[0.82rem] font-bold text-orangeDeep transition-colors hover:bg-[#FFE8D6] disabled:opacity-40 disabled:cursor-not-allowed"
      >
        A-
      </button>
      <span className="h-4 w-px bg-[#FBDCB3]" aria-hidden="true" />
      <button
        type="button"
        onClick={increase}
        disabled={atMax}
        aria-label="放大字體"
        title="放大字體 Increase font size"
        className="shrink-0 px-2.5 py-1.5 text-[0.82rem] font-bold text-orangeDeep transition-colors hover:bg-[#FFE8D6] disabled:opacity-40 disabled:cursor-not-allowed"
      >
        A+
      </button>
    </div>
  );
}

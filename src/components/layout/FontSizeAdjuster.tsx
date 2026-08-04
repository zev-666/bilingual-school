'use client';

import { useFontSize } from '@/contexts/FontSizeContext';

/**
 * 字體縮放無障礙工具（參考臺中市英語教育資源中心的簡化版：A- / A+ 兩顆按鈕）
 * 放在 Navbar 右側，鄰近語言切換按鈕。
 */
export default function FontSizeAdjuster() {
  const { decrease, increase, atMin, atMax } = useFontSize();

  return (
    <div
      className="flex items-center border border-primary-200 rounded-md overflow-hidden"
      role="group"
      aria-label="字體大小調整 / Adjust font size"
    >
      <button
        type="button"
        onClick={decrease}
        disabled={atMin}
        aria-label="縮小字體"
        title="縮小字體 Decrease font size"
        className="px-2 py-1 text-sm font-semibold text-primary-700 hover:bg-primary-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        A-
      </button>
      <span className="w-px h-4 bg-primary-200" aria-hidden="true" />
      <button
        type="button"
        onClick={increase}
        disabled={atMax}
        aria-label="放大字體"
        title="放大字體 Increase font size"
        className="px-2 py-1 text-sm font-semibold text-primary-700 hover:bg-primary-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        A+
      </button>
    </div>
  );
}

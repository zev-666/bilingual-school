// src/components/ui/Skeleton.tsx
// 骨架屏基礎元件。純 CSS shimmer 動畫（見 globals.css 的 .skeleton class），
// 不用 framer-motion，因為骨架屏通常在資料抓取前的第一時間就要顯示，
// 用最輕量的 CSS animation 就好，不需要額外的 JS 動畫函式庫開銷。
interface SkeletonProps {
  className?: string
}

/** 單一骨架區塊，預設圓角矩形。用 className 控制寬高（例如 "h-4 w-32"）。 */
export function Skeleton({ className = '' }: SkeletonProps) {
  return <div className={`skeleton rounded-md ${className}`} aria-hidden="true" />
}

/** 貼合媒體庫 grid 卡片形狀的骨架屏：一張方形圖片 + 一行檔名 */
export function MediaCardSkeleton() {
  return (
    <div className="rounded-lg overflow-hidden border border-slate-200">
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="p-2">
        <Skeleton className="h-3 w-4/5" />
      </div>
    </div>
  )
}

/** 媒體庫載入中的整個 grid（預設 10 格，跟一頁預設筆數接近） */
export function MediaGridSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <MediaCardSkeleton key={i} />
      ))}
    </div>
  )
}

/** 貼合「影片管理」列表每一列形狀的骨架屏：縮圖 + 兩行文字 + 標籤 */
export function ListRowSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4">
      <Skeleton className="w-24 h-16 flex-shrink-0" />
      <div className="flex-1 min-w-0 space-y-2">
        <Skeleton className="h-4 w-2/5" />
        <Skeleton className="h-3 w-1/4" />
      </div>
      <Skeleton className="h-5 w-14 rounded-full" />
    </div>
  )
}

/** 整份列表載入中的樣子（預設 5 列） */
export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="card divide-y divide-gray-100">
      {Array.from({ length: count }).map((_, i) => (
        <ListRowSkeleton key={i} />
      ))}
    </div>
  )
}
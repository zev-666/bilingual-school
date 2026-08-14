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

/** 貼合媒體庫 grid 卡片形狀的骨架屏：一張方形圖片 + 一行檔名（後台媒體庫用） */
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

/** 媒體庫載入中的整個 grid（預設 10 格，跟一頁預設筆數接近，後台媒體庫用） */
export function MediaGridSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <MediaCardSkeleton key={i} />
      ))}
    </div>
  )
}

/** 貼合「影片管理」列表每一列形狀的骨架屏：縮圖 + 兩行文字 + 標籤（後台影片列表用） */
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

/** 整份列表載入中的樣子（預設 5 列，後台影片列表用） */
export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="card divide-y divide-gray-100">
      {Array.from({ length: count }).map((_, i) => (
        <ListRowSkeleton key={i} />
      ))}
    </div>
  )
}

/* ============================================================
   以下為 UI 微互動功能包新增（前台相簿頁用）
   跟上面後台用的骨架屏職責不同，但共用同一個 Skeleton 基礎元件，
   統一走 .skeleton CSS shimmer 樣式，不重複定義動畫系統。
   ============================================================ */

/** 相簿卡片骨架 — 對應 AlbumsClient.tsx 的卡片外觀，載入時顯示相同版面比例 */
export function AlbumCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <Skeleton className="h-52 w-full rounded-none" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  )
}

/** 相片格線骨架 — 對應相簿內頁的正方形照片格線 */
export function PhotoGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="aspect-square w-full" />
      ))}
    </div>
  )
}

/** 消息列表骨架 — 可共用於 /news 等其他列表頁 */
export function ListCardSkeleton() {
  return (
    <div className="card p-5 space-y-3">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-5 w-4/5" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  )
}

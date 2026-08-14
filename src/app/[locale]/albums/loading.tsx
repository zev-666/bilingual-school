// 存放路徑：src/app/[locale]/albums/loading.tsx
// Next.js App Router 會在這個路由的頁面資料載入完成前，自動顯示這個檔案的內容
// 不需要手動判斷 isLoading 狀態，檔案命名為 loading.tsx 放在對應路由資料夾即可生效
import { AlbumCardSkeleton } from '@/components/ui/Skeleton'

export default function AlbumsLoading() {
  return (
    <div className="pt-20 min-h-screen">
      <div className="bg-gradient-to-br from-primary-600 to-indigo-700 text-white py-16">
        <div className="container-school text-center">
          <div className="h-10 w-64 bg-white/20 rounded-md mx-auto mb-4 animate-pulse" />
          <div className="h-5 w-96 max-w-full bg-white/10 rounded-md mx-auto animate-pulse" />
        </div>
      </div>

      <div className="container-school py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <AlbumCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}

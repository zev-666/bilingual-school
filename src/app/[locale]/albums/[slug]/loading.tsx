// 存放路徑：src/app/[locale]/albums/[slug]/loading.tsx
import { PhotoGridSkeleton } from '@/components/ui/Skeleton'

export default function AlbumDetailLoading() {
  return (
    <div className="section-padding">
      <div className="container-school">
        <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mb-8" />
        <div className="h-8 w-72 bg-gray-200 rounded animate-pulse mb-3" />
        <div className="h-4 w-40 bg-gray-200 rounded animate-pulse mb-8" />
        <PhotoGridSkeleton count={8} />
      </div>
    </div>
  )
}

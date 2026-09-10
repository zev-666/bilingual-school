import { getTranslations } from 'next-intl/server'
import { prisma } from '@/lib/prisma'
import { User } from 'lucide-react'
import { displayTitle } from '@/lib/utils'

export const dynamic = 'force-dynamic'

// 分組顯示順序（明確陣列，不靠字母序）
const TYPE_ORDER = ['CONVENER', 'FOREIGN', 'LOCAL_ADVISOR', 'STAFF', 'FULL_TIME', 'PART_TIME']

async function getTeachers() {
  try {
    return await prisma.teacher.findMany({ where: { isActive: true }, orderBy: [{ sortOrder: 'asc' }] })
  } catch {
    return [{ id: '1', nameZh: '王大明', nameEn: 'David Wang', titleZh: '校長', titleEn: 'Principal', type: 'STAFF', subjects: [], avatar: null }]
  }
}

export default async function TeachersPage({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations('teachers')
  const tt = await getTranslations('teachers.types')
  const teachers = await getTeachers()

  const grouped = teachers.reduce((acc: any, teacher: any) => {
    if (!acc[teacher.type]) acc[teacher.type] = []
    acc[teacher.type].push(teacher)
    return acc
  }, {})

  // 僅輸出 TYPE_ORDER 內、且確實有成員的類型
  const orderedGroups = TYPE_ORDER.filter((type) => grouped[type]?.length > 0)

  return (
    <div className="section-padding">
      <div className="container-school">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{t('title')}</h1>
          <p className="text-gray-500">{t('subtitle')}</p>
        </div>
        {orderedGroups.map((type) => (
          <div key={type} className="mb-12">
            <h2 className="text-xl font-bold text-gray-800 mb-6 pb-2 border-b">{tt(type as any)}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {grouped[type].map((teacher: any) => (
                <div key={teacher.id} className="card p-6 text-center">
                  <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-4">
                    {teacher.avatar
                      ? <img src={teacher.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                      : <User size={32} className="text-primary-400" />}
                  </div>
                  <h2 className="font-semibold text-gray-900">
                    {displayTitle(teacher.nameZh, teacher.nameEn, locale)}
                  </h2>
                  <p className="text-sm text-primary-600 mt-1">
                    {displayTitle(teacher.titleZh, teacher.titleEn, locale)}
                  </p>
                  {teacher.subjects.length > 0 && (
                    <p className="text-xs text-gray-500 mt-2">{teacher.subjects.join(', ')}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

import { useTranslations } from 'next-intl'
import { prisma } from '@/lib/prisma'
import { User } from 'lucide-react'

export const dynamic = 'force-dynamic'

async function getTeachers() {
  try {
    return await prisma.teacher.findMany({ where: { isActive: true }, orderBy: [{ type: 'asc' }, { sortOrder: 'asc' }] })
  } catch {
    return [{ id: '1', nameZh: '王大明', nameEn: 'David Wang', titleZh: '校長', titleEn: 'Principal', type: 'STAFF', subjects: [], photoUrl: null }]
  }
}

export default async function TeachersPage({ params: { locale } }: { params: { locale: string } }) {
  const t = useTranslations('teachers')
  const tt = useTranslations('teachers.types')
  const teachers = await getTeachers()

  const grouped = teachers.reduce((acc: any, teacher: any) => {
    if (!acc[teacher.type]) acc[teacher.type] = []
    acc[teacher.type].push(teacher)
    return acc
  }, {})

  return (
    <div className="section-padding">
      <div className="container-school">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{t('title')}</h1>
          <p className="text-gray-500">{t('subtitle')}</p>
        </div>
        {Object.entries(grouped).map(([type, list]: any) => (
          <div key={type} className="mb-12">
            <h2 className="text-xl font-bold text-gray-800 mb-6 pb-2 border-b">{tt(type as any)}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {list.map((teacher: any) => (
                <div key={teacher.id} className="card p-6 text-center">
                  <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-4">
                    {teacher.photoUrl
                      ? <img src={teacher.photoUrl} alt="" className="w-full h-full rounded-full object-cover" />
                      : <User size={32} className="text-primary-400" />}
                  </div>
                  <h3 className="font-semibold text-gray-900">
                    {locale === 'zh-TW' ? teacher.nameZh : teacher.nameEn}
                  </h3>
                  <p className="text-sm text-primary-600 mt-1">
                    {locale === 'zh-TW' ? teacher.titleZh : teacher.titleEn}
                  </p>
                  {teacher.subjects.length > 0 && (
                    <p className="text-xs text-gray-400 mt-2">{teacher.subjects.join(', ')}</p>
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

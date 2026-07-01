// src/app/[locale]/teachers/page.tsx
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import { Mail, BookOpen } from 'lucide-react'

interface Props { params: { locale: string } }

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'teachers' })
  return { title: t('title') }
}

const MOCK_TEACHERS = [
  { id: '1', nameZh: '陳雅雯', nameEn: 'Dr. Grace Chen', titleZh: '校長', titleEn: 'Principal', bioZh: '擁有30年教育經驗，致力推動雙語教育。', bioEn: '30 years of educational leadership, championing bilingual education.', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=80', type: 'STAFF',   subjects: [],             email: 'principal@school.edu.tw', sortOrder: 0, isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: '2', nameZh: '王建明', nameEn: 'James Wang',     titleZh: '英語教師', titleEn: 'English Teacher', bioZh: '美國UCLA語言學碩士，教學生動活潑。', bioEn: 'MA Linguistics from UCLA, known for dynamic teaching.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80', type: 'FULL_TIME', subjects: ['english'],     email: null, sortOrder: 1, isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: '3', nameZh: '李美玲', nameEn: 'Amy Li',         titleZh: '數學教師', titleEn: 'Math Teacher',    bioZh: '台灣大學數學系博士，專長代數與幾何。', bioEn: 'PhD in Mathematics from NTU, expert in algebra and geometry.', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&q=80', type: 'FULL_TIME', subjects: ['math'],        email: null, sortOrder: 2, isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: '4', nameZh: '張世傑', nameEn: 'Michael Chang',  titleZh: '科學教師', titleEn: 'Science Teacher', bioZh: '清華大學物理學碩士，熱愛實驗教學。', bioEn: 'MSc Physics from NTHU, passionate about experimental learning.', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&q=80', type: 'FULL_TIME', subjects: ['science'],     email: null, sortOrder: 3, isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: '5', nameZh: '林詩涵', nameEn: 'Sarah Lin',      titleZh: '藝術教師', titleEn: 'Art Teacher',     bioZh: '國立藝術大學畢業，擅長多元藝術創作。', bioEn: 'Graduate of Taipei National University of the Arts.', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&q=80', type: 'FULL_TIME', subjects: ['art'],         email: null, sortOrder: 4, isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: '6', nameZh: '吳啟豪', nameEn: 'Kevin Wu',       titleZh: '體育教師', titleEn: 'PE Teacher',      bioZh: '國家級運動員，致力培養學生運動精神。', bioEn: 'National-level athlete, fostering sportsmanship in students.', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&q=80', type: 'FULL_TIME', subjects: ['pe'],          email: null, sortOrder: 5, isActive: true, createdAt: new Date(), updatedAt: new Date() },
]

async function getTeachers() {
  try {
    return await prisma.teacher.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { nameZh: 'asc' }],
    })
  } catch {
    return MOCK_TEACHERS
  }
}

export default async function TeachersPage({ params: { locale } }: Props) {
  const [t, teachers] = await Promise.all([
    getTranslations({ locale, namespace: 'teachers' }),
    getTeachers(),
  ])
  const isZh = locale === 'zh-TW'

  // Group by type
  const fullTime  = (teachers as typeof MOCK_TEACHERS).filter((t) => t.type === 'FULL_TIME')
  const partTime  = (teachers as typeof MOCK_TEACHERS).filter((t) => t.type === 'PART_TIME')
  const staff     = (teachers as typeof MOCK_TEACHERS).filter((t) => t.type === 'STAFF')

  const TeacherGrid = ({ items, groupLabel }: { items: typeof MOCK_TEACHERS; groupLabel: string }) => (
    <div className="mb-12">
      <h2 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b border-gray-100">
        {groupLabel}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {items.map((teacher) => {
          const name  = isZh ? teacher.nameZh  : teacher.nameEn
          const title = isZh ? teacher.titleZh : teacher.titleEn
          const bio   = isZh ? teacher.bioZh   : teacher.bioEn

          return (
            <div key={teacher.id} className="card p-5 text-center group hover:shadow-md transition-shadow">
              {/* Avatar */}
              <div className="relative w-20 h-20 mx-auto mb-4">
                {teacher.avatar ? (
                  <Image
                    src={teacher.avatar}
                    alt={name}
                    fill
                    className="object-cover rounded-full"
                    sizes="80px"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary-600">
                      {name[0]}
                    </span>
                  </div>
                )}
              </div>

              <h3 className="font-semibold text-gray-900 mb-0.5">{name}</h3>
              <p className="text-sm text-primary-600 mb-2">{title}</p>
              {bio && <p className="text-xs text-gray-500 line-clamp-3 mb-3">{bio}</p>}

              {teacher.subjects.length > 0 && (
                <div className="flex flex-wrap gap-1 justify-center mb-2">
                  {teacher.subjects.map((s) => (
                    <span key={s} className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      <BookOpen size={9} /> {s}
                    </span>
                  ))}
                </div>
              )}

              {teacher.email && (
                <a href={`mailto:${teacher.email}`} className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-primary-600 transition-colors mt-1">
                  <Mail size={11} /> {teacher.email}
                </a>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )

  return (
    <div className="pt-20 min-h-screen">
      <div className="bg-gradient-to-br from-primary-600 to-indigo-700 text-white py-16">
        <div className="container-school text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('title')}</h1>
          <p className="text-white/80 text-lg">{t('subtitle')}</p>
        </div>
      </div>

      <div className="container-school py-12">
        {staff.length > 0     && <TeacherGrid items={staff}     groupLabel={t('types.STAFF')} />}
        {fullTime.length > 0  && <TeacherGrid items={fullTime}  groupLabel={t('types.FULL_TIME')} />}
        {partTime.length > 0  && <TeacherGrid items={partTime}  groupLabel={t('types.PART_TIME')} />}
      </div>
    </div>
  )
}

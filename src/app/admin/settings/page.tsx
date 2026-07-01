import { prisma } from '@/lib/prisma'
import SettingsForm from './SettingsForm'

const DEFAULT_SETTINGS = {
  site_name_zh: '雙語實驗學校',
  site_name_en: 'Bilingual Experimental School',
  site_description_zh: '世界級雙語教育，培育未來領袖',
  site_description_en: 'World-class bilingual education, cultivating future leaders',
  contact_email: 'info@school.edu.tw',
  contact_phone: '(02) 1234-5678',
  contact_address_zh: '台北市信義區學校路 100 號',
  contact_address_en: '100 School Rd., Xinyi District, Taipei',
  facebook_url: '',
  instagram_url: '',
  youtube_url: '',
  line_url: '',
  google_maps_embed: '',
  footer_copyright_zh: '© 2024 雙語實驗學校 版權所有',
  footer_copyright_en: '© 2024 Bilingual Experimental School. All rights reserved.',
}

async function getSettings(): Promise<Record<string, string>> {
  try {
    const rows = await prisma.siteSetting.findMany()
    const map: Record<string, string> = { ...DEFAULT_SETTINGS }
    for (const row of rows) {
      map[row.key] = row.value
    }
    return map
  } catch {
    return DEFAULT_SETTINGS
  }
}

export default async function AdminSettingsPage() {
  const settings = await getSettings()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">網站設定</h1>
        <p className="mt-1 text-sm text-gray-500">管理網站基本資訊、聯絡方式與社群媒體連結</p>
      </div>
      <SettingsForm initialSettings={settings} />
    </div>
  )
}

import { prisma } from '@/lib/prisma'
import SettingsForm from './SettingsForm'

const DEFAULT_SETTINGS = {
  site_name_zh: '基隆市英語資源中心',
  site_name_en: 'Keelung City English Resource Center',
  site_description_zh: '支援基隆市教師與外師的英語教學資源與研習平台',
  site_description_en: 'English teaching resources and professional development for teachers and foreign teachers in Keelung',
  contact_email: 'info@kl-erc.edu.tw',
  contact_phone: '(02) 2XXX-XXXX',
  contact_address_zh: '基隆市中正區（請填入實際地址）',
  contact_address_en: '(Please fill in actual address), Zhongzheng Dist., Keelung',
  facebook_url: '',
  instagram_url: '',
  youtube_url: '',
  line_url: '',
  google_maps_embed: '',
  footer_copyright_zh: '© 2024 基隆市英語資源中心 版權所有',
  footer_copyright_en: '© 2024 Keelung City English Resource Center. All rights reserved.',
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

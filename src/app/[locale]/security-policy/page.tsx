import { useTranslations } from 'next-intl'

export const dynamic = 'force-dynamic'

export default function SecurityPolicyPage() {
  const t = useTranslations('legal')

  return (
    <div className="section-padding">
      <div className="container-school max-w-3xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-2 tracking-tight">{t('security_policy')}</h1>
        <p className="text-gray-500 mb-10">{t('privacy_updated')}</p>

        <div className="card p-8 space-y-6 text-gray-700 leading-relaxed">
          <section>
            <h2 className="font-semibold text-gray-900 mb-2">{t('security_s1_title')}</h2>
            <p>{t('security_s1_body')}</p>
          </section>
          <section>
            <h2 className="font-semibold text-gray-900 mb-2">{t('security_s2_title')}</h2>
            <p>{t('security_s2_body')}</p>
          </section>
        </div>
      </div>
    </div>
  )
}

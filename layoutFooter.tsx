warning: in the working copy of 'src/components/layout/Footer.tsx', LF will be replaced by CRLF the next time Git touches it
[1mdiff --git a/src/components/layout/Footer.tsx b/src/components/layout/Footer.tsx[m
[1mindex 1ff3591..fba2ffa 100644[m
[1m--- a/src/components/layout/Footer.tsx[m
[1m+++ b/src/components/layout/Footer.tsx[m
[36m@@ -16,9 +16,38 @@[m [masync function getLastUpdated() {[m
   }[m
 }[m
 [m
[32m+[m[32m// 後台「網站設定」找不到對應 key 時的預設值，跟 admin/settings/page.tsx 的 DEFAULT_SETTINGS 保持一致[m
[32m+[m[32mconst DEFAULT_CONTACT_SETTINGS = {[m
[32m+[m[32m  contact_address_zh: '基隆市中正區（請填入實際地址）',[m
[32m+[m[32m  contact_address_en: '(Please fill in actual address), Zhongzheng Dist., Keelung',[m
[32m+[m[32m  contact_phone: '(02) 2XXX-XXXX',[m
[32m+[m[32m  contact_email: 'info@kl-erc.edu.tw',[m
[32m+[m[32m}[m
[32m+[m
[32m+[m[32masync function getContactSettings() {[m
[32m+[m[32m  try {[m
[32m+[m[32m    const rows = await prisma.siteSetting.findMany({[m
[32m+[m[32m      where: {[m
[32m+[m[32m        key: { in: ['contact_address_zh', 'contact_address_en', 'contact_phone', 'contact_email'] },[m
[32m+[m[32m      },[m
[32m+[m[32m    })[m
[32m+[m[32m    const map = { ...DEFAULT_CONTACT_SETTINGS }[m
[32m+[m[32m    for (const row of rows) {[m
[32m+[m[32m      if (row.value) {[m
[32m+[m[32m        ;(map as Record<string, string>)[row.key] = row.value[m
[32m+[m[32m      }[m
[32m+[m[32m    }[m
[32m+[m[32m    return map[m
[32m+[m[32m  } catch {[m
[32m+[m[32m    return DEFAULT_CONTACT_SETTINGS[m
[32m+[m[32m  }[m
[32m+[m[32m}[m
[32m+[m
 export default async function Footer({ locale = 'zh-TW' }: { locale?: string }) {[m
   const t = await getTranslations()[m
   const lastUpdated = await getLastUpdated()[m
[32m+[m[32m  const settings = await getContactSettings()[m
[32m+[m[32m  const address = locale === 'en' ? settings.contact_address_en : settings.contact_address_zh[m
 [m
   return ([m
     <footer className="bg-gray-900 text-gray-300">[m
[36m@@ -86,11 +115,11 @@[m [mexport default async function Footer({ locale = 'zh-TW' }: { locale?: string })[m
             <ul className="space-y-2 text-sm">[m
               <li className="flex items-start gap-2">[m
                 <MapPin size={14} className="mt-0.5 text-primary-400 flex-shrink-0" />[m
[31m-                基隆市中正區（請填入實際地址）[m
[32m+[m[32m                {address}[m
               </li>[m
               <li className="flex items-center gap-2">[m
                 <Phone size={14} className="text-primary-400 flex-shrink-0" />[m
[31m-                02-2XXX-XXXX[m
[32m+[m[32m                {settings.contact_phone}[m
               </li>[m
               <li className="flex items-center gap-2">[m
                 <Printer size={14} className="text-primary-400 flex-shrink-0" />[m
[36m@@ -98,7 +127,7 @@[m [mexport default async function Footer({ locale = 'zh-TW' }: { locale?: string })[m
               </li>[m
               <li className="flex items-center gap-2">[m
                 <Mail size={14} className="text-primary-400 flex-shrink-0" />[m
[31m-                info@kl-erc.edu.tw[m
[32m+[m[32m                {settings.contact_email}[m
               </li>[m
             </ul>[m
           </div>[m
[36m@@ -110,4 +139,4 @@[m [mexport default async function Footer({ locale = 'zh-TW' }: { locale?: string })[m
       </div>[m
     </footer>[m
   )[m
[31m-}[m
[32m+[m[32m}[m
\ No newline at end of file[m

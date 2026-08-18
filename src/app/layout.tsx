// src/app/layout.tsx
import { ReactNode } from 'react';
import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';
import { FontSizeProvider } from '@/contexts/FontSizeContext';
import './globals.css';

type Props = {
  children: ReactNode;
};

export const metadata: Metadata = {
  title: { default: '基隆市英語資源中心', template: '%s | 基隆市英語資源中心' },
  description: '基隆市英語資源中心 — 提供教師與外師專業英語教學資源、研習與交流平台',
  // 貼網址到 LINE／Facebook 時顯示的縮圖，用完整圓形徽章
  openGraph: {
    title: '基隆市英語教育資源中心',
    description: '基隆市英語資源中心 — 提供教師與外師專業英語教學資源、研習與交流平台',
    images: [{ url: '/images/logo-eerc.png', width: 512, height: 512, alt: '基隆市英語教育資源中心' }],
    type: 'website',
  },
};

export default async function RootLayout({ children }: Props) {
  let locale = 'zh-TW';
  try {
    locale = await getLocale();
  } catch {
    // 後台路由不在 next-intl 的 [locale] 區段內，getLocale() 這裡會失敗，預設中文即可
  }

  return (
    <html lang={locale}>
      <head>
        {/* 首頁整合門戶用字：Noto Sans TC（內文）／Baloo 2（標題） */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Noto+Sans+TC:wght@400;500;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <a href="#main-content" className="skip-link">跳到主要內容</a>
        <FontSizeProvider>{children}</FontSizeProvider>
      </body>
    </html>
  );
}

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
      <body>
        <a href="#main-content" className="skip-link">跳到主要內容</a>
        <FontSizeProvider>{children}</FontSizeProvider>
      </body>
    </html>
  );
}

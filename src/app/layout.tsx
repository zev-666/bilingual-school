// src/app/layout.tsx
import { ReactNode } from 'react';
import { FontSizeProvider } from '@/contexts/FontSizeContext';
import './globals.css';

type Props = {
  children: ReactNode;
};

// 這是整個網站唯一的 Root Layout，負責提供 <html>、<body>。
// 前台頁面 ([locale]/layout.tsx) 和後台頁面 (admin/layout.tsx) 都會經過這一層，
// 兩者都不應該再各自宣告 <html>/<body>，否則會跟這裡重複。
export default function RootLayout({ children }: Props) {
  return (
    <html lang="zh-TW">
      <body>
        <FontSizeProvider>{children}</FontSizeProvider>
      </body>
    </html>
  );
}
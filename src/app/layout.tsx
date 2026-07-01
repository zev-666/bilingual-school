// src/app/layout.tsx
import { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

// 這個 Root Layout 只負責傳遞 children，
// 真正的 <html>、<body> 以及多語言設定都在 [locale]/layout.tsx 中
export default function RootLayout({ children }: Props) {
  return children;
}
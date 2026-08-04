'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type FontSizeContextType = {
  scale: number;
  increase: () => void;
  decrease: () => void;
  reset: () => void;
  atMin: boolean;
  atMax: boolean;
};

const FontSizeContext = createContext<FontSizeContextType | undefined>(undefined);

const MIN_SCALE = 0.875; // 87.5%
const MAX_SCALE = 1.25; // 125%
const STEP = 0.125;
const DEFAULT_SCALE = 1;
const COOKIE_NAME = 'kl_eerc_font_scale';

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

function writeCookie(name: string, value: string) {
  if (typeof document === 'undefined') return;
  // 用 cookie 而不是 localStorage，跨頁／跨分頁都能保留使用者選擇，有效期 1 年
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=31536000; SameSite=Lax`;
}

function applyScale(scale: number) {
  if (typeof document === 'undefined') return;
  document.documentElement.style.setProperty('--font-scale', String(scale));
}

function clamp(value: number) {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, Math.round(value * 1000) / 1000));
}

export function FontSizeProvider({ children }: { children: ReactNode }) {
  const [scale, setScale] = useState<number>(DEFAULT_SCALE);

  // 第一次載入時，讀取 cookie 還原上次的字體大小選擇
  useEffect(() => {
    const saved = readCookie(COOKIE_NAME);
    const initial = saved ? parseFloat(saved) : DEFAULT_SCALE;
    const clamped = clamp(Number.isFinite(initial) ? initial : DEFAULT_SCALE);
    setScale(clamped);
    applyScale(clamped);
  }, []);

  const update = (next: number) => {
    const clamped = clamp(next);
    setScale(clamped);
    applyScale(clamped);
    writeCookie(COOKIE_NAME, String(clamped));
  };

  const increase = () => update(scale + STEP);
  const decrease = () => update(scale - STEP);
  const reset = () => update(DEFAULT_SCALE);

  return (
    <FontSizeContext.Provider
      value={{
        scale,
        increase,
        decrease,
        reset,
        atMin: scale <= MIN_SCALE,
        atMax: scale >= MAX_SCALE,
      }}
    >
      {children}
    </FontSizeContext.Provider>
  );
}

export function useFontSize() {
  const ctx = useContext(FontSizeContext);
  if (!ctx) {
    throw new Error('useFontSize 必須在 FontSizeProvider 內使用');
  }
  return ctx;
}

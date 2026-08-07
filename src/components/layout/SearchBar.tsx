'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import { useRouter } from '@/i18n/routing';
import { Search, X, Loader2 } from 'lucide-react';

type SearchResultItem = {
  type: 'announcement' | 'document' | 'album' | 'teacher';
  id: string;
  title: string;
  href: string;
};

type Props = {
  locale: string;
};

export default function SearchBar({ locale }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [, startTransition] = useTransition();
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(query.trim())}&locale=${locale}`
        );
        const data = await res.json();
        setResults(data.success ? data.data : []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, locale]);

  const placeholder =
    locale === 'en' ? 'Search news, documents, albums...' : '搜尋公告、文件、相簿...';
  const noResultsText = locale === 'en' ? 'No results found' : '找不到相關結果';

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center border border-primary-200 rounded-md bg-white focus-within:ring-2 focus-within:ring-primary-400">
        <Search className="w-4 h-4 text-primary-400 ml-2 shrink-0" aria-hidden="true" />
        <input
          type="text"
          id="site-search"
          name="site-search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          aria-label={placeholder}
          className="w-32 sm:w-40 md:w-56 px-2 py-1.5 text-sm outline-none bg-transparent"
        />
        {query && (
          <button
            type="button"
            aria-label={locale === 'en' ? 'Clear search' : '清除搜尋'}
            onClick={() => {
              setQuery('');
              setResults([]);
            }}
            className="p-1 mr-1 text-primary-400 hover:text-primary-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {open && query.trim() && (
        <div className="absolute right-0 mt-1 w-72 md:w-96 bg-white border border-primary-100 rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-6 text-primary-400">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          ) : results.length === 0 ? (
            <p className="px-4 py-6 text-sm text-center text-gray-600">{noResultsText}</p>
          ) : (
            <ul>
              {results.map((item) => (
                <li key={`${item.type}-${item.id}`}>
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      startTransition(() => {
                        router.push(item.href);
                      });
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-primary-50 transition-colors border-b border-gray-50 last:border-0"
                  >
                    <span className="block text-xs text-primary-500 mb-0.5">
                      {typeLabel(item.type, locale)}
                    </span>
                    <span className="block text-sm text-gray-800 line-clamp-1">{item.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function typeLabel(type: SearchResultItem['type'], locale: string) {
  const map: Record<SearchResultItem['type'], { zh: string; en: string }> = {
    announcement: { zh: '最新消息', en: 'News' },
    document: { zh: '文件下載', en: 'Document' },
    album: { zh: '活動相簿', en: 'Album' },
    teacher: { zh: '師資介紹', en: 'Teacher' },
  };
  return locale === 'en' ? map[type].en : map[type].zh;
}

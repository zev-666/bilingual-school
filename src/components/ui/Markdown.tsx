import ReactMarkdown from 'react-markdown'
import type { Components } from 'react-markdown'
import { Link } from '@/i18n/routing'
import { Download, ExternalLink } from 'lucide-react'

/**
 * 把裸露的位元組數字轉成好讀的檔案大小。
 * 舊站搬遷過來的附件 Markdown 格式為：
 *   > - [檔名.docx](/uploads/announcements/58/檔名.docx "檔名.docx") 29175
 * 結尾那串數字是位元組數，直接顯示很醜，這裡轉成 (28.5 KB)。
 */
function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/**
 * 只處理「連結結尾 + 空白 + 純數字 + 行尾」這一種樣式，
 * 不動內文其他任何數字，避免誤傷正常內容（例如「聘期 115/8/1」）。
 */
function prettifyAttachmentSizes(md: string): string {
  return md.replace(/\)\s+(\d{3,})[ \t]*$/gm, (whole, digits: string) => {
    const label = formatBytes(Number(digits))
    return label ? `) （${label}）` : whole
  })
}

const components: Components = {
  p: ({ children }) => (
    <p className="mb-4 leading-relaxed text-[#4A4038] last:mb-0">{children}</p>
  ),

  h1: ({ children }) => (
    <h2 className="mb-3 mt-8 text-xl font-bold text-[#3B322B] first:mt-0">{children}</h2>
  ),
  h2: ({ children }) => (
    <h2 className="mb-3 mt-8 text-xl font-bold text-[#3B322B] first:mt-0">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="mb-2 mt-6 text-lg font-semibold text-[#3B322B] first:mt-0">{children}</h3>
  ),

  ul: ({ children }) => <ul className="mb-4 space-y-2 last:mb-0">{children}</ul>,
  ol: ({ children }) => (
    <ol className="mb-4 list-decimal space-y-2 pl-5 last:mb-0">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-relaxed text-[#4A4038]">{children}</li>,

  /**
   * 附件區塊：舊站把附件包在 blockquote 裡（Markdown 的 `>`），
   * 這裡直接把它渲染成一個「相關附件」面板，而不是引言樣式。
   */
  blockquote: ({ children }) => (
    <aside
      className="mb-4 rounded-xl border border-primary-200 bg-creamSoft p-4 last:mb-0"
      aria-label="相關附件"
    >
      <p className="mb-2 text-sm font-semibold text-primary-700">相關附件</p>
      <div className="[&_p]:mb-0 [&_ul]:mb-0 [&_ul]:space-y-2">{children}</div>
    </aside>
  ),

  strong: ({ children }) => <strong className="font-semibold text-[#3B322B]">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  hr: () => <hr className="my-6 border-t border-[#E7DED3]" />,

  code: ({ children }) => (
    <code className="rounded bg-[#F1E9DE] px-1.5 py-0.5 font-mono text-[0.9em] text-[#3B322B]">
      {children}
    </code>
  ),

  a: ({ href, children }) => {
    const url = href ?? '#'

    // 1) 站內附件檔案 → 下載按鈕樣式
    if (url.startsWith('/uploads/')) {
      return (
        <a
          href={url}
          download
          className="inline-flex items-center gap-2 rounded-lg border border-primary-300 bg-white px-3 py-2 font-medium text-primary-700 transition-colors hover:border-primary-600 hover:bg-primary-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
        >
          <Download size={16} aria-hidden="true" />
          <span className="break-all">{children}</span>
        </a>
      )
    }

    // 2) 外部連結 → 另開視窗，並標示為外部連結（無障礙需求）
    if (/^https?:\/\//i.test(url)) {
      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-medium text-primary-700 underline decoration-primary-300 underline-offset-2 hover:decoration-primary-600"
        >
          {children}
          <ExternalLink size={14} aria-hidden="true" />
          <span className="sr-only">（於新視窗開啟）</span>
        </a>
      )
    }

    // 3) 站內一般連結 → 走 next-intl 的 Link，保留語系
    return (
      <Link
        href={url}
        className="font-medium text-primary-700 underline decoration-primary-300 underline-offset-2 hover:decoration-primary-600"
      >
        {children}
      </Link>
    )
  },
}

export default function Markdown({ children }: { children: string }) {
  if (!children?.trim()) return null
  return <ReactMarkdown components={components}>{prettifyAttachmentSizes(children)}</ReactMarkdown>
}

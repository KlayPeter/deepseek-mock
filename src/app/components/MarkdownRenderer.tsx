'use client'

import React, { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import CheckIcon from '@mui/icons-material/Check'
import type { Components } from 'react-markdown'

interface MarkdownRendererProps {
  content: string
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(code)
      setTimeout(() => setCopiedCode(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="markdown-content word-break max-w-full overflow-x-auto">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          // @ts-ignore - react-markdown types issue
          // 代码块渲染
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '')
            const language = match ? match[1] : ''
            const codeString = String(children).replace(/\n$/, '')

            if (!inline && language) {
              return (
                <div className="relative group my-4 rounded-lg overflow-hidden border border-gray-200 shadow-sm max-w-full">
                  {/* 代码块头部 */}
                  <div className="flex items-center justify-between px-4 py-2 bg-[#1e1e1e] border-b border-gray-700">
                    <span className="text-xs font-mono text-gray-300">
                      {language}
                    </span>
                    <button
                      onClick={() => copyToClipboard(codeString)}
                      className="flex items-center gap-1.5 px-2 py-1 text-xs text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors"
                    >
                      {copiedCode === codeString ? (
                        <>
                          <CheckIcon style={{ fontSize: '0.875rem' }} />
                          已复制
                        </>
                      ) : (
                        <>
                          <ContentCopyIcon style={{ fontSize: '0.875rem' }} />
                          复制代码
                        </>
                      )}
                    </button>
                  </div>
                  {/* 代码内容 */}
                  <SyntaxHighlighter
                    style={vscDarkPlus as any}
                    language={language}
                    PreTag="div"
                    customStyle={{
                      margin: 0,
                      padding: '1rem',
                      fontSize: '0.875rem',
                      lineHeight: '1.5',
                      background: '#1e1e1e',
                      fontFamily:
                        'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
                      maxWidth: '100%',
                      overflowX: 'auto',
                    }}
                  >
                    {codeString}
                  </SyntaxHighlighter>
                </div>
              )
            }

            // 行内代码
            return (
              <code
                className="bg-gray-100 text-red-600 px-1.5 py-0.5 rounded text-sm font-mono border border-gray-200"
                {...props}
              >
                {children}
              </code>
            )
          },
          // 标题渲染
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold mb-4 mt-6 text-gray-900 border-b pb-2">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-bold mb-3 mt-5 text-gray-900">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-semibold mb-2 mt-4 text-gray-900">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-base font-semibold mb-2 mt-3 text-gray-900">
              {children}
            </h4>
          ),
          // 段落
          p: ({ children }) => (
            <p className="mb-4 text-gray-800 leading-7">{children}</p>
          ),
          // 列表
          ul: ({ children }) => (
            <ul className="list-disc list-inside mb-4 space-y-1 text-gray-800">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside mb-4 space-y-1 text-gray-800">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="ml-4">{children}</li>,
          // 引用
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-ds-primary pl-4 py-2 my-4 bg-blue-50/50 text-gray-700 italic">
              {children}
            </blockquote>
          ),
          // 表格
          table: ({ children }) => (
            <div className="overflow-x-auto my-4 max-w-full rounded-lg border border-gray-300">
              <table className="min-w-full border-collapse">{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-gray-100">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-900">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-gray-300 px-4 py-2 text-gray-800">
              {children}
            </td>
          ),
          // 链接
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-ds-primary hover:underline"
            >
              {children}
            </a>
          ),
          // 水平线
          hr: () => <hr className="my-6 border-t border-gray-300" />,
          // 强调
          strong: ({ children }) => (
            <strong className="font-bold text-gray-900">{children}</strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

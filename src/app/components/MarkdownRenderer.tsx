'use client'

import React from 'react'

export const MarkdownRenderer: React.FC<{ content: string }> = ({
  content,
}) => {
  // Simple markdown renderer without external dependencies
  const renderContent = () => {
    // Split content by code blocks
    const parts = content.split(/(```[\s\S]*?```)/g)

    return parts.map((part, index) => {
      if (part.startsWith('```')) {
        // Handle code blocks
        const lines = part.split('\n')
        const language = lines[0].replace('```', '').trim() || 'text'
        const code = lines.slice(1, -1).join('\n')

        return (
          <div
            key={index}
            className="rounded-md border border-gray-200 overflow-hidden my-4 bg-[#f6f8fa]"
          >
            <div className="px-4 py-1.5 bg-gray-100 border-b border-gray-200 text-xs text-gray-500 flex justify-between items-center font-mono">
              <span>{language}</span>
              <span className="cursor-pointer hover:text-ds-primary">Copy</span>
            </div>
            <pre className="p-4 overflow-x-auto text-sm font-mono text-gray-800 bg-white">
              <code>{code}</code>
            </pre>
          </div>
        )
      } else {
        // Handle regular text with inline formatting
        const lines = part.split('\n')
        return lines.map((line, lineIndex) => {
          if (!line.trim()) return <br key={`${index}-${lineIndex}`} />

          // Handle headers
          if (line.startsWith('# ')) {
            return (
              <h1
                key={`${index}-${lineIndex}`}
                className="text-2xl font-bold mb-4 mt-6 text-gray-900 border-b pb-2"
              >
                {line.slice(2)}
              </h1>
            )
          }
          if (line.startsWith('## ')) {
            return (
              <h2
                key={`${index}-${lineIndex}`}
                className="text-xl font-bold mb-3 mt-5 text-gray-900"
              >
                {line.slice(3)}
              </h2>
            )
          }
          if (line.startsWith('### ')) {
            return (
              <h3
                key={`${index}-${lineIndex}`}
                className="text-lg font-semibold mb-2 mt-4 text-gray-900"
              >
                {line.slice(4)}
              </h3>
            )
          }

          // Handle lists
          if (line.trim().match(/^[\*\-\+]\s/)) {
            return (
              <li key={`${index}-${lineIndex}`} className="ml-5 text-gray-700">
                {line.trim().slice(2)}
              </li>
            )
          }
          if (line.trim().match(/^\d+\.\s/)) {
            return (
              <li key={`${index}-${lineIndex}`} className="ml-5 text-gray-700">
                {line.trim().replace(/^\d+\.\s/, '')}
              </li>
            )
          }

          // Handle inline code
          const processInlineCode = (text: string) => {
            const parts = text.split(/(`[^`]+`)/g)
            return parts.map((p, i) => {
              if (p.startsWith('`') && p.endsWith('`')) {
                return (
                  <code
                    key={i}
                    className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono border border-gray-200"
                  >
                    {p.slice(1, -1)}
                  </code>
                )
              }
              return p
            })
          }

          return (
            <p
              key={`${index}-${lineIndex}`}
              className="mb-3 last:mb-0 text-gray-800"
            >
              {processInlineCode(line)}
            </p>
          )
        })
      }
    })
  }

  return (
    <div className="prose prose-sm max-w-none text-gray-800 leading-7 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
      {renderContent()}
    </div>
  )
}

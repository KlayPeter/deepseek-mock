'use client'

import { useState } from 'react'
import PsychologyIcon from '@mui/icons-material/Psychology'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'

interface ReasoningBlockProps {
  text: string
}

export default function ReasoningBlock({ text }: ReasoningBlockProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="mb-4 border border-blue-200/60 rounded-xl overflow-hidden bg-gradient-to-br from-blue-50/40 to-indigo-50/20 shadow-sm hover:shadow-md transition-shadow">
      {/* 折叠/展开按钮 */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-blue-50/40 transition-all duration-200"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1 rounded-md bg-blue-100/70">
            <PsychologyIcon
              className="text-ds-primary"
              style={{ fontSize: '1rem' }}
            />
          </div>
          <span className="text-sm font-semibold text-ds-primary">
            思考过程
          </span>
          {!isExpanded && (
            <span className="text-xs text-gray-500 font-normal">
              点击查看详细推理
            </span>
          )}
        </div>
        <div
          className={`transform transition-transform duration-300 ${
            isExpanded ? 'rotate-180' : ''
          }`}
        >
          <ExpandMoreIcon
            className="text-ds-primary"
            style={{ fontSize: '1.25rem' }}
          />
        </div>
      </button>

      {/* 思考内容 - 添加展开动画 */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          isExpanded
            ? 'max-h-[2000px] opacity-100'
            : 'max-h-0 opacity-0 overflow-hidden'
        }`}
      >
        <div className="px-4 pb-4">
          <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed bg-white/70 rounded-lg p-4 border border-blue-100/50 shadow-inner">
            {text}
          </div>
        </div>
      </div>
    </div>
  )
}

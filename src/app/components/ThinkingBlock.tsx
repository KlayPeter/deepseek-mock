'use client'

import React, { useState, useEffect } from 'react'
import { Icons } from './Icons'

interface ThinkingBlockProps {
  isStreaming: boolean
}

export const ThinkingBlock: React.FC<ThinkingBlockProps> = ({
  isStreaming,
}) => {
  const [isOpen, setIsOpen] = useState(true)
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    let interval: any
    if (isStreaming) {
      interval = setInterval(() => {
        setDuration((prev) => prev + 0.1)
      }, 100)
    }
    return () => clearInterval(interval)
  }, [isStreaming])

  return (
    <div className="mb-3">
      <div className="rounded-lg border border-gray-200 bg-gray-50/50 overflow-hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-full px-3 py-2 text-xs text-gray-500 hover:bg-gray-100/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            {isStreaming ? (
              <div className="w-4 h-4 flex items-center justify-center">
                <Icons.Brain className="w-3.5 h-3.5 animate-pulse text-ds-primary" />
              </div>
            ) : (
              <div className="w-4 h-4 flex items-center justify-center">
                <Icons.Brain className="w-3.5 h-3.5 text-gray-400" />
              </div>
            )}
            <span className="font-medium">
              {isStreaming ? 'DeepSeek R1 深度思考中...' : '已完成深度思考'}
            </span>
          </div>
          <div className="flex items-center gap-2 opacity-80">
            <span className="font-mono text-[10px] text-gray-400">
              {duration.toFixed(1)}s
            </span>
            {isOpen ? (
              <Icons.Down className="w-3 h-3" />
            ) : (
              <Icons.Right className="w-3 h-3" />
            )}
          </div>
        </button>

        {isOpen && (
          <div className="px-3 py-2 text-sm text-gray-600 border-t border-gray-100 font-mono bg-white/50">
            {isStreaming ? (
              <div className="flex items-center gap-1.5 py-1">
                <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></span>
                <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce delay-75"></span>
                <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce delay-150"></span>
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">
                Thinking process hidden.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

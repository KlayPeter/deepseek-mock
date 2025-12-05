'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Icons } from './Icons'
import { ModelConfig } from '@/src/types'

interface InputAreaProps {
  onSend: (message: string, config: ModelConfig) => void
  disabled: boolean
  variant: 'centered' | 'bottom'
}

export const InputArea: React.FC<InputAreaProps> = ({
  onSend,
  disabled,
  variant,
}) => {
  const [input, setInput] = useState('')
  const [useThinking, setUseThinking] = useState(false)
  const [useSearch, setUseSearch] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        200
      )}px`
    }
  }, [input])

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSend(input, { useThinking, useSearch })
      setInput('')
      if (textareaRef.current) textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const isCentered = variant === 'centered'

  return (
    <div
      className={`w-full mx-auto transition-all duration-500 ${
        isCentered ? 'max-w-3xl px-4' : 'max-w-3xl px-4 pb-4'
      }`}
    >
      {/* Input Container */}
      <div
        className={`relative flex flex-col bg-ds-input rounded-[26px] border border-ds-inputBorder transition-all duration-300
        ${isCentered ? 'shadow-ds-hover min-h-[140px]' : 'shadow-ds'}`}
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="给 DeepSeek 发送消息"
          disabled={disabled}
          rows={1}
          className={`w-full bg-transparent text-ds-text placeholder-gray-400 px-5 py-4 outline-none resize-none max-h-[200px] overflow-y-auto rounded-[26px]
            ${isCentered ? 'text-lg pt-5' : 'text-base'}
          `}
        />

        {/* Bottom Toolbar */}
        <div className="flex items-center justify-between px-3 pb-3 mt-2">
          <div className="flex items-center gap-2">
            {/* Deep Thinking Toggle */}
            <button
              onClick={() => setUseThinking(!useThinking)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all
                  ${
                    useThinking
                      ? 'bg-blue-50 text-ds-primary border-blue-200'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
            >
              <Icons.Brain
                className={`w-3.5 h-3.5 ${useThinking ? 'fill-current' : ''}`}
              />
              深度思考 (R1)
            </button>

            {/* Web Search Toggle */}
            <button
              onClick={() => setUseSearch(!useSearch)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all
                  ${
                    useSearch
                      ? 'bg-blue-50 text-ds-primary border-blue-200'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
            >
              <Icons.Globe className="w-3.5 h-3.5" />
              联网搜索
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
              <Icons.Clip className="w-5 h-5" />
            </button>

            <button
              onClick={handleSend}
              disabled={!input.trim() || disabled}
              className={`p-2 rounded-full transition-all duration-200 flex items-center justify-center ${
                input.trim() && !disabled
                  ? 'bg-ds-primary text-white shadow-md hover:bg-[#3d5ce0]'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Icons.Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

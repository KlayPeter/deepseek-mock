'use client'

import React from 'react'
import { Icons } from './Icons'
import { ChatSession } from '@/src/types'

interface SidebarProps {
  sessions: ChatSession[]
  activeSessionId: string | null
  onSelectSession: (id: string) => void
  onNewChat: () => void
  onDeleteSession?: (sessionId: string) => void
  onClearAll?: () => void
  isOpen: boolean
  onToggle: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onClearAll,
  isOpen,
  onToggle,
}) => {
  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 bg-black/20 z-40 md:hidden transition-opacity ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onToggle}
      />

      <div
        className={`
        fixed md:static inset-y-0 left-0 z-50
        w-[260px] bg-ds-sidebar border-r border-ds-border flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-2">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Icons.Bot className="w-7 h-7 text-ds-primary" />
              <span className="font-semibold text-lg tracking-tight text-ds-primary">
                DeepSeek
              </span>
            </div>
            <button
              onClick={onToggle}
              className="text-ds-subtext hover:text-ds-text transition-colors"
              title="收起侧边栏"
            >
              <Icons.SidebarIcon className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={() => {
              onNewChat()
              if (typeof window !== 'undefined' && window.innerWidth < 768)
                onToggle()
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-ds-border hover:bg-gray-50 text-ds-text rounded-full text-sm font-medium transition-colors shadow-sm mb-6"
          >
            <Icons.Plus className="w-4 h-4" />
            <span>开启新对话</span>
          </button>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto px-3 space-y-6">
          {/* 7 Days Group */}
          <div>
            <div className="px-3 mb-2 text-xs font-medium text-ds-subtext">
              7天内
            </div>
            <div className="space-y-0.5">
              {sessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => {
                    onSelectSession(session.id)
                    if (
                      typeof window !== 'undefined' &&
                      window.innerWidth < 768
                    )
                      onToggle()
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm truncate transition-colors group relative ${
                    activeSessionId === session.id
                      ? 'bg-gray-200/60 text-ds-text'
                      : 'text-ds-text hover:bg-gray-100'
                  }`}
                >
                  <span className="truncate block pr-6">{session.title}</span>
                  {/* Hover menu dots */}
                  <span
                    className={`absolute right-2 top-1/2 -translate-y-1/2 text-ds-subtext opacity-0 group-hover:opacity-100 ${
                      activeSessionId === session.id ? 'opacity-100' : ''
                    }`}
                  >
                    <Icons.MoreHorizontal className="w-4 h-4" />
                  </span>
                </button>
              ))}
              {sessions.length === 0 && (
                <div className="px-3 text-xs text-ds-subtext/50 italic">
                  暂无历史记录
                </div>
              )}
            </div>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-ds-border">
          <button className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-ds-hover text-sm text-ds-text transition-colors">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center">
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                alt="User"
              />
            </div>
            <div className="flex-1 text-left">
              <div className="font-medium text-ds-text">Mr. McDreamy</div>
            </div>
            <Icons.MoreHorizontal className="w-4 h-4 text-ds-subtext" />
          </button>
        </div>
      </div>
    </>
  )
}

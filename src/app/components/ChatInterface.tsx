'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Sidebar } from './Sidebar'
import { InputArea } from './InputArea'
import { MarkdownRenderer } from './MarkdownRenderer'
import { ThinkingBlock } from './ThinkingBlock'
import { Icons } from './Icons'
import { Message, ChatSession, Role, ModelConfig } from '@/src/types'

export const ChatInterface: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [isStreaming, setIsStreaming] = useState(false)

  const bottomRef = useRef<HTMLDivElement>(null)

  // 从数据库加载会话
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsSidebarOpen(window.innerWidth > 768)
    }
    loadChatsFromDatabase()
  }, [])

  const loadChatsFromDatabase = async () => {
    try {
      const response = await fetch('/api/get-chats', { method: 'POST' })
      if (response.ok) {
        const chats = await response.json()

        // 转换数据库格式到前端 session 格式
        const sessionsData: ChatSession[] = []

        for (const chat of chats) {
          // 加载每个会话的消息
          const msgResponse = await fetch('/api/get-messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chat.id.toString(),
              chat_user_id: chat.userId,
            }),
          })

          const messages = msgResponse.ok ? await msgResponse.json() : []

          sessionsData.push({
            id: chat.id.toString(),
            title: chat.title,
            messages: messages.map((msg: any) => ({
              id: msg.id.toString(),
              role: msg.role === 'user' ? Role.USER : Role.MODEL,
              content: msg.content,
              timestamp: Date.now(),
            })),
            updatedAt: Date.now(),
          })
        }

        setSessions(sessionsData)
        if (sessionsData.length > 0) {
          setActiveSessionId(sessionsData[0].id)
        } else {
          createNewSession()
        }
      } else {
        createNewSession()
      }
    } catch (error) {
      console.error('Failed to load chats:', error)
      createNewSession()
    }
  }

  useEffect(() => {
    if (activeSessionId) {
      scrollToBottom()
    }
  }, [sessions, activeSessionId])

  const scrollToBottom = () => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const createNewSession = async () => {
    try {
      const response = await fetch('/api/create-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: '新对话',
          model: 'deepseek-v3',
        }),
      })

      if (response.ok) {
        const { id } = await response.json()
        const newSession: ChatSession = {
          id: id.toString(),
          title: '新对话',
          messages: [],
          updatedAt: Date.now(),
        }
        setSessions((prev) => [newSession, ...prev])
        setActiveSessionId(newSession.id)
      }
    } catch (error) {
      console.error('Failed to create session:', error)
    }
  }

  const deleteSession = async (sessionId: string) => {
    try {
      await fetch('/api/delete-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId: parseInt(sessionId) }),
      })

      setSessions((prev) => prev.filter((s) => s.id !== sessionId))
      if (activeSessionId === sessionId) {
        const remaining = sessions.filter((s) => s.id !== sessionId)
        if (remaining.length > 0) {
          setActiveSessionId(remaining[0].id)
        } else {
          createNewSession()
        }
      }
    } catch (error) {
      console.error('Failed to delete session:', error)
    }
  }

  const clearAllSessions = async () => {
    for (const session of sessions) {
      await deleteSession(session.id)
    }
    createNewSession()
  }

  const handleSendMessage = async (content: string, config: ModelConfig) => {
    if (!activeSessionId) return

    const userMsg: Message = {
      id: Date.now().toString(),
      role: Role.USER,
      content: content,
      timestamp: Date.now(),
    }

    // 保存用户消息到数据库
    await fetch('/api/save-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chatId: parseInt(activeSessionId),
        role: 'user',
        content: content,
      }),
    })

    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === activeSessionId) {
          const title = s.messages.length === 0 ? content.slice(0, 15) : s.title
          return {
            ...s,
            title,
            messages: [...s.messages, userMsg],
            updatedAt: Date.now(),
          }
        }
        return s
      })
    )

    setIsStreaming(true)

    const botMsgId = (Date.now() + 1).toString()
    const botMsg: Message = {
      id: botMsgId,
      role: Role.MODEL,
      content: '',
      isThinking: config.useThinking,
      timestamp: Date.now(),
    }

    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === activeSessionId) {
          return { ...s, messages: [...s.messages, botMsg] }
        }
        return s
      })
    )

    try {
      // 模拟 AI 响应 - 您需要替换为实际的 API 调用
      // 例如调用您现有的 /api/chat 或其他 DeepSeek API 端点

      // 模拟流式响应
      const mockResponse = `您好！我是 DeepSeek AI 助手。

您的消息是：**${content}**

这是一个演示响应。要集成真实的 AI 功能，请：

1. 使用您现有的 \`/api/chat\` 路由
2. 或者创建新的 API 路由来调用 DeepSeek API
3. 配置流式响应以实现打字效果

\`\`\`typescript
// 示例代码
const response = await fetch('/api/your-chat-endpoint', {
  method: 'POST',
  body: JSON.stringify({ message: content, config })
});
\`\`\`

${config.useThinking ? '✓ 深度思考模式已启用' : ''}
${config.useSearch ? '✓ 联网搜索已启用' : ''}
`

      // 模拟逐字输出效果
      let currentIndex = 0
      const streamInterval = setInterval(() => {
        if (currentIndex < mockResponse.length) {
          currentIndex += Math.floor(Math.random() * 5) + 1
          const chunk = mockResponse.slice(
            0,
            Math.min(currentIndex, mockResponse.length)
          )

          setSessions((prev) =>
            prev.map((s) => {
              if (s.id === activeSessionId) {
                return {
                  ...s,
                  messages: s.messages.map((m) => {
                    if (m.id === botMsgId) {
                      return {
                        ...m,
                        content: chunk,
                        isThinking:
                          config.useThinking &&
                          currentIndex < mockResponse.length * 0.3,
                      }
                    }
                    return m
                  }),
                }
              }
              return s
            })
          )
        } else {
          clearInterval(streamInterval)
          setIsStreaming(false)

          // 保存 AI 响应到数据库
          fetch('/api/save-message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chatId: parseInt(activeSessionId),
              role: 'model',
              content: mockResponse,
            }),
          })
        }
      }, 50)

      // 存储 interval ID 以便清理
      return () => clearInterval(streamInterval)
    } catch (e) {
      console.error(e)
      // Add error message
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === activeSessionId) {
            return {
              ...s,
              messages: s.messages.map((m) => {
                if (m.id === botMsgId) {
                  return {
                    ...m,
                    content: '抱歉，发生了错误。请稍后重试。',
                    isThinking: false,
                  }
                }
                return m
              }),
            }
          }
          return s
        })
      )
    } finally {
      setIsStreaming(false)
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === activeSessionId) {
            return {
              ...s,
              messages: s.messages.map((m) => {
                if (m.id === botMsgId) {
                  return { ...m, isThinking: false }
                }
                return m
              }),
            }
          }
          return s
        })
      )
    }
  }

  const activeSession = sessions.find((s) => s.id === activeSessionId)
  const isHomeView = !activeSession || activeSession.messages.length === 0

  return (
    <div className="flex h-screen bg-ds-bg overflow-hidden text-ds-text font-sans">
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={setActiveSessionId}
        onNewChat={createNewSession}
        onDeleteSession={deleteSession}
        onClearAll={clearAllSessions}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div className="flex-1 flex flex-col h-full relative">
        {/* Mobile Header */}
        <div className="md:hidden h-14 border-b border-ds-border flex items-center justify-between px-4 bg-white z-30">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="text-ds-subtext"
          >
            <Icons.Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-1.5">
            <Icons.DeepSeekLogo className="w-6 h-6 text-ds-primary" />
            <span className="font-semibold text-ds-text">DeepSeek</span>
          </div>
          <button onClick={createNewSession} className="text-ds-subtext">
            <Icons.Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto scroll-smooth relative">
          {isHomeView ? (
            <div className="flex flex-col items-center justify-center h-full px-4 -mt-20 fade-in">
              <div className="mb-10 text-center">
                <div className="inline-flex items-center justify-center mb-4">
                  <Icons.DeepSeekLogo className="w-20 h-20 text-ds-primary" />
                </div>
                <h1 className="text-2xl font-bold text-ds-text tracking-tight">
                  今天有什么可以帮你？
                </h1>
              </div>

              <div className="w-full max-w-[720px]">
                <InputArea
                  onSend={handleSendMessage}
                  disabled={isStreaming}
                  variant="centered"
                />
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto w-full px-4 py-8 pb-32">
              {activeSession?.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`mb-6 ${
                    msg.role === Role.USER ? 'flex justify-end' : ''
                  }`}
                >
                  {msg.role === Role.USER ? (
                    <div className="bg-[#f3f4f6] text-ds-text px-4 py-2.5 rounded-[20px] max-w-[85%] text-base leading-7 break-words">
                      {msg.content}
                    </div>
                  ) : (
                    <div className="w-full flex gap-4 pr-4">
                      {/* Avatar */}
                      <div className="shrink-0">
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center overflow-hidden border border-ds-border/50">
                          <Icons.DeepSeekLogo className="w-5 h-5 text-ds-primary" />
                        </div>
                      </div>
                      {/* Content */}
                      <div className="flex-1 overflow-hidden min-w-0 pt-0.5">
                        {(msg.isThinking || msg.thoughtContent) && (
                          <ThinkingBlock
                            isStreaming={msg.isThinking || false}
                          />
                        )}
                        <div className="prose-container">
                          <MarkdownRenderer content={msg.content} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {!isHomeView && (
          <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-white via-white to-transparent pt-10 pb-6 px-4">
            <div className="max-w-3xl mx-auto">
              <InputArea
                onSend={handleSendMessage}
                disabled={isStreaming}
                variant="bottom"
              />
            </div>
            <div className="text-center mt-2">
              <p className="text-[11px] text-gray-400">
                内容由 AI 生成，请仔细甄别
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

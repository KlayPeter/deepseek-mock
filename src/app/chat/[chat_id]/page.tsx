'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { useRef, useState, useEffect, useMemo } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import SmartToyIcon from '@mui/icons-material/SmartToy'
import PsychologyIcon from '@mui/icons-material/Psychology'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import MobileMenuButton from '@/src/app/components/MobileMenuButton'
import ReasoningBlock from '@/src/app/components/ReasoningBlock'

export default function Page() {
  const { chat_id } = useParams()
  const searchParams = useSearchParams()
  const initialMessage = searchParams.get('message')

  const [input, setInput] = useState('')
  const [model, setModel] = useState('deepseek-v3')
  const modelRef = useRef(model)
  const hasAutoSentRef = useRef(false) // 标记是否已自动发送过初始消息
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // 保持 ref 和 state 同步
  useEffect(() => {
    modelRef.current = model
  }, [model])

  // 自动调整 textarea 高度
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        200
      )}px`
    }
  }, [input])

  const endRef = useRef<HTMLDivElement>(null)
  const { data: chat } = useQuery({
    queryKey: ['chat', chat_id],
    queryFn: () => {
      return axios.post('/api/get-chat', {
        chat_id: chat_id,
      })
    },
  })

  const { data: previousMessages } = useQuery({
    queryKey: ['messages', chat_id],
    queryFn: () => {
      return axios.post('/api/get-messages', {
        chat_id: chat_id,
        chat_user_id: chat?.data?.userId,
      })
    },
    enabled: !!chat?.data?.userId,
  })

  const chatRef = useRef(chat)

  const { messages, sendMessage, status } = useChat({
    id: chat_id as string,
    transport: new DefaultChatTransport({
      api: '/api/chat',
      prepareSendMessagesRequest: ({ id, messages }) => {
        return {
          body: {
            id,
            messages,
            model: modelRef.current, // 使用 ref 获取最新值
            chat_id: chat_id,
            chat_user_id: chatRef.current?.data?.userId,
          },
        }
      },
    }),
  })

  // 保持 chat ref 同步
  useEffect(() => {
    chatRef.current = chat
  }, [chat])

  // 从数据库加载聊天时，初始化模型状态
  useEffect(() => {
    if (chat?.data?.model) {
      setModel(chat.data.model)
    }
  }, [chat?.data?.model])

  // 自动发送初始消息（仅一次）
  useEffect(() => {
    if (
      initialMessage &&
      !hasAutoSentRef.current &&
      status === 'ready' &&
      chat?.data?.userId &&
      sendMessage
    ) {
      console.log('自动发送初始消息:', initialMessage)
      sendMessage({ text: initialMessage })
      hasAutoSentRef.current = true

      // 清除 URL 参数，避免刷新后重复发送
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href)
        url.searchParams.delete('message')
        window.history.replaceState({}, '', url.toString())
      }
    }
  }, [initialMessage, status, chat?.data?.userId, sendMessage])

  // 合并历史消息和当前会话消息
  const allMessages = useMemo(() => {
    if (!previousMessages?.data) return messages

    // 将数据库消息转换为 UIMessage 格式
    const dbMessages = previousMessages.data.map((msg: any) => ({
      id: `db-${msg.id}`,
      role: msg.role,
      parts: [{ type: 'text', text: msg.content }],
    }))

    return [...dbMessages, ...messages]
  }, [previousMessages, messages])

  const handleModelChange = () => {
    setModel(model === 'deepseek-v3' ? 'deepseek-r1' : 'deepseek-v3')
  }

  // 自动的一个下滑
  useEffect(() => {
    if (endRef.current) {
      endRef?.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [allMessages])

  return (
    <div className="flex flex-col h-screen bg-ds-bg relative">
      {/* 移动端菜单按钮 */}
      <MobileMenuButton />

      {/* 顶部导航栏 - 显示聊天标题和当前激活的模型 */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-ds-border">
        <div className="max-w-3xl mx-auto w-full px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-medium text-ds-text truncate max-w-[200px] md:max-w-md">
              {chat?.data?.title || '新对话'}
            </h2>
            <span
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium border ${
                model === 'deepseek-r1'
                  ? 'bg-blue-50 text-ds-primary border-blue-200'
                  : 'bg-gray-50 text-gray-600 border-gray-200'
              }`}
            >
              {model === 'deepseek-r1' ? (
                <>
                  <PsychologyIcon style={{ fontSize: '0.75rem' }} />
                  R1
                </>
              ) : (
                'V3'
              )}
            </span>
          </div>
        </div>
      </div>

      {/* 消息列表区域 */}
      <div className="flex-1 overflow-y-auto scroll-smooth">
        <div className="max-w-3xl mx-auto w-full px-4 py-8 pb-56">
          {allMessages.map((message) => (
            <div
              key={message.id}
              className={`mb-6 ${
                message?.role === 'user' ? 'flex justify-end' : ''
              }`}
            >
              {message?.role === 'user' ? (
                <div className="bg-[#f3f4f6] text-ds-text px-4 py-2.5 rounded-[20px] max-w-[85%] text-base leading-7 break-words">
                  {message.parts?.map((part: any, index: number) =>
                    part.type === 'text' ? (
                      <span key={index}>{part.text}</span>
                    ) : null
                  )}
                </div>
              ) : (
                <div className="w-full flex gap-4 pr-4">
                  {/* AI Avatar */}
                  <div className="shrink-0">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center overflow-hidden border border-ds-border/50">
                      <SmartToyIcon
                        className="w-5 h-5 text-ds-primary"
                        style={{ fontSize: '1.25rem' }}
                      />
                    </div>
                  </div>
                  {/* AI Message Content */}
                  <div className="flex-1 overflow-hidden min-w-0 pt-0.5">
                    <div className="text-gray-800 leading-7">
                      {message.parts?.map((part: any, index: number) => {
                        if (part.type === 'reasoning') {
                          return <ReasoningBlock key={index} text={part.text} />
                        }
                        if (part.type === 'text') {
                          return (
                            <span key={index} className="whitespace-pre-wrap">
                              {part.text}
                            </span>
                          )
                        }
                        return null
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Loading 指示器 - AI 正在回复 */}
          {status !== 'ready' && (
            <div className="w-full flex gap-4 pr-4 mb-6">
              {/* AI Avatar */}
              <div className="shrink-0">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center overflow-hidden border border-ds-border/50">
                  <SmartToyIcon
                    className="w-5 h-5 text-ds-primary"
                    style={{ fontSize: '1.25rem' }}
                  />
                </div>
              </div>
              {/* Loading 动画 */}
              <div className="flex-1 overflow-hidden min-w-0 pt-1.5">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-ds-primary rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-ds-primary rounded-full animate-bounce"
                    style={{ animationDelay: '0.2s' }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-ds-primary rounded-full animate-bounce"
                    style={{ animationDelay: '0.4s' }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {status === 'submitted' ? '正在思考...' : 'AI 正在回复...'}
                </p>
              </div>
            </div>
          )}

          <div ref={endRef} />
        </div>
      </div>

      {/* 底部输入区域 */}
      <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-white via-white to-transparent pt-10 pb-6 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="relative flex flex-col bg-ds-input rounded-[26px] border border-ds-inputBorder shadow-ds transition-all duration-300">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (
                  e.key === 'Enter' &&
                  !e.shiftKey &&
                  status === 'ready' &&
                  input.trim()
                ) {
                  e.preventDefault()
                  sendMessage({ text: input })
                  setInput('')
                }
              }}
              disabled={status !== 'ready'}
              placeholder="给 DeepSeek 发送消息"
              rows={1}
              className="w-full bg-transparent text-ds-text placeholder-gray-400 px-5 py-4 outline-none resize-none max-h-[200px] overflow-y-auto rounded-[26px] text-base"
            />

            <div className="flex items-center justify-between px-3 pb-3 mt-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleModelChange}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    model === 'deepseek-r1'
                      ? 'bg-blue-50 text-ds-primary border-blue-200'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <PsychologyIcon style={{ fontSize: '0.875rem' }} />
                  深度思考 (R1)
                </button>
              </div>

              <div className="flex items-center gap-3">
                <button className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
                  <AttachFileIcon style={{ fontSize: '1.25rem' }} />
                </button>

                <button
                  onClick={() => {
                    if (input.trim() && status === 'ready' && chat?.data) {
                      sendMessage({ text: input })
                      setInput('')
                    }
                  }}
                  disabled={!input.trim() || status !== 'ready'}
                  className={`p-2 rounded-full transition-all duration-200 flex items-center justify-center ${
                    input.trim() && status === 'ready'
                      ? 'bg-ds-primary text-white shadow-md hover:bg-[#3d5ce0]'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <ArrowUpwardIcon style={{ fontSize: '1.25rem' }} />
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="text-center mt-2">
          <p className="text-[11px] text-gray-400">
            内容由 AI 生成，请仔细甄别
          </p>
        </div>
      </div>
    </div>
  )
}

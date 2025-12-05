'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { useRef, useState, useEffect, useMemo } from 'react'
import EastIcon from '@mui/icons-material/East'
import { useParams, useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

export default function Page() {
  const { chat_id } = useParams()
  const searchParams = useSearchParams()
  const initialMessage = searchParams.get('message')

  const [input, setInput] = useState('')
  const [model, setModel] = useState('deepseek-v3')
  const modelRef = useRef(model)
  const hasAutoSentRef = useRef(false) // 标记是否已自动发送过初始消息

  // 保持 ref 和 state 同步
  useEffect(() => {
    modelRef.current = model
  }, [model])

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
    <div className="flex flex-col h-screen justify-between items-center">
      <div className="h-4"></div>
      <div className="flex flex-col gap-8 flex-1">
        {allMessages.map((message) => (
          <div
            key={message.id}
            className={`rounded-lg flex flex-row ${
              message?.role === 'assistant'
                ? 'justify-start mr-18'
                : 'justify-end ml-10'
            } `}
          >
            <p
              className={`inline-block p-2 rounded-lg ${
                message?.role === 'assistant' ? 'bg-blue-300' : 'bg-slate-100'
              }`}
            >
              {message.parts?.map((part: any, index: number) =>
                part.type === 'text' ? (
                  <span key={index}>{part.text}</span>
                ) : null
              )}
            </p>
          </div>
        ))}
      </div>

      <div className="h-4" ref={endRef}></div>

      {/*输入框 */}
      <div className="flex flex-col items-center justify-center mt-4 shadow-lg border-[1px] border-gray-300 h-32 rounded-lg w-2/3">
        <textarea
          className="w-full rounder-lg p-3 h-30 focus:outline-none"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={status !== 'ready'}
          placeholder="Say something..."
        ></textarea>
        <div className="flex flex-row items-center justify-center w-full h-12 mb-2">
          <div>
            <div
              className={`flex flex-row items-center justify-center rounded-lg border-[1px] px-2 py-1 ml-2 cursor-pointer ${
                model === 'deepseek-r1'
                  ? 'border-blue-300 bg-blue-200'
                  : 'border-gray-300'
              }`}
              onClick={handleModelChange}
            >
              <p className="text-sm">深度思考（R1）</p>
            </div>
          </div>
          <div
            className={`flex items-center justify-center border-2 mr-4 border-black p-1 rounder-full ${
              input.trim() && status === 'ready' && chat?.data
                ? 'cursor-pointer'
                : 'cursor-not-allowed opacity-50'
            }`}
            onClick={(e) => {
              e.preventDefault()
              if (input.trim() && status === 'ready' && chat?.data) {
                console.log('发送消息:', {
                  text: input,
                  model: modelRef.current,
                  chat_id,
                  chat_user_id: chat.data.userId,
                })
                sendMessage({ text: input })
                setInput('')
              }
            }}
          >
            <EastIcon />
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useRef, useEffect } from 'react'
import { useMutation, QueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import MobileMenuButton from '@/src/app/components/MobileMenuButton'
import SmartToyIcon from '@mui/icons-material/SmartToy'
import PsychologyIcon from '@mui/icons-material/Psychology'
import PublicIcon from '@mui/icons-material/Public'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import AttachFileIcon from '@mui/icons-material/AttachFile'

export default function Home() {
  const [input, setInput] = useState('')
  const [useThinking, setUseThinking] = useState(false)
  const [useSearch, setUseSearch] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const router = useRouter()
  const { user } = useUser()
  const queryClient = new QueryClient()

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        200
      )}px`
    }
  }, [input])

  const { mutate: createChat, isPending } = useMutation({
    mutationFn: async () => {
      const model = useThinking ? 'deepseek-r1' : 'deepseek-v3'
      return axios.post('/api/create-chat', {
        title: input,
        model: model,
      })
    },
    onSuccess: (res) => {
      const encodedMessage = encodeURIComponent(input)
      router.push(`/chat/${res.data.id}?message=${encodedMessage}`)
      queryClient.invalidateQueries({ queryKey: ['chats'] })
    },
  })

  const handleSubmit = () => {
    if (input.trim() === '') {
      return
    }
    if (!user) {
      router.push('/sign-in')
      return
    }

    createChat()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-ds-bg px-4 sm:px-6 -mt-20">
      {/* 移动端菜单按钮 */}
      <MobileMenuButton />

      <div className="mb-10 text-center fade-in">
        <div className="inline-flex items-center justify-center mb-4">
          <SmartToyIcon
            className="w-20 h-20 text-ds-primary"
            style={{ fontSize: '5rem' }}
          />
        </div>
        <h1 className="text-2xl font-bold text-ds-text tracking-tight">
          今天有什么可以帮你？
        </h1>
      </div>

      <div className="w-full max-w-[720px]">
        <div className="relative flex flex-col bg-ds-input rounded-[26px] border border-ds-inputBorder shadow-ds-hover min-h-[140px] transition-all duration-300">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isPending}
            placeholder="给 DeepSeek 发送消息"
            rows={1}
            className="w-full bg-transparent text-ds-text placeholder-gray-400 px-5 py-5 pt-5 outline-none resize-none max-h-[200px] overflow-y-auto rounded-[26px] text-lg disabled:opacity-60"
          />

          <div className="flex items-center justify-between px-3 pb-3 mt-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setUseThinking(!useThinking)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  useThinking
                    ? 'bg-blue-50 text-ds-primary border-blue-200'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <PsychologyIcon style={{ fontSize: '0.875rem' }} />
                深度思考 (R1)
              </button>

              <button
                onClick={() => setUseSearch(!useSearch)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  useSearch
                    ? 'bg-blue-50 text-ds-primary border-blue-200'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <PublicIcon style={{ fontSize: '0.875rem' }} />
                联网搜索
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
                <AttachFileIcon style={{ fontSize: '1.25rem' }} />
              </button>

              <button
                onClick={handleSubmit}
                disabled={!input.trim() || isPending}
                className={`p-2 rounded-full transition-all duration-200 flex items-center justify-center ${
                  input.trim()
                    ? 'bg-ds-primary text-white shadow-md hover:bg-[#3d5ce0]'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isPending ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <ArrowUpwardIcon style={{ fontSize: '1.25rem' }} />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

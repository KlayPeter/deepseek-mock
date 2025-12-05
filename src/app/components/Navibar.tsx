'use client'

import { useUser } from '@clerk/nextjs'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usePathname, useRouter } from 'next/navigation'
import axios from 'axios'
import { ChatModel } from '@/src/db/schema'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import { useState, useRef, useEffect } from 'react'

type Props = {}

const Navibar = (props: Props) => {
  const { user } = useUser()
  const router = useRouter()
  const pathname = usePathname()
  const queryClient = useQueryClient()
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [openMenuId, setOpenMenuId] = useState<number | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const { data: chats } = useQuery({
    queryKey: ['chats'],
    queryFn: async () => {
      return axios.post('/api/get-chats')
    },
    enabled: !!user?.id,
  })

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // 删除聊天的 mutation
  const { mutate: deleteChat } = useMutation({
    mutationFn: async (chatId: number) => {
      return axios.post('/api/delete-chat', { chat_id: chatId })
    },
    onSuccess: (_, chatId) => {
      // 刷新聊天列表
      queryClient.invalidateQueries({ queryKey: ['chats'] })

      // 如果删除的是当前打开的聊天，跳转回首页
      if (pathname === `/chat/${chatId}`) {
        router.push('/')
      }

      setDeletingId(null)
      setOpenMenuId(null)
    },
    onError: (error) => {
      console.error('删除失败:', error)
      alert('删除失败，请重试')
      setDeletingId(null)
    },
  })

  const handleMenuToggle = (e: React.MouseEvent, chatId: number) => {
    e.stopPropagation() // 防止触发聊天跳转
    setOpenMenuId(openMenuId === chatId ? null : chatId)
  }

  const handleDelete = (e: React.MouseEvent, chatId: number) => {
    e.stopPropagation() // 防止触发聊天跳转
    setOpenMenuId(null)

    if (confirm('确定要删除这个聊天吗？此操作无法撤销。')) {
      setDeletingId(chatId)
      deleteChat(chatId)
    }
  }

  return (
    <div className="h-screen bg-gray-50">
      <div className="flex items-center justify-center">
        <p className="font-bold text-2xl"> Deepseek</p>
      </div>

      <div
        className="h-10 flex items-center justify-center mt-4 cursor-pointer"
        onClick={() => router.push('/')}
      >
        <p className="h-full w-2/3 bg-blue-100 flex items-center justify-center mt-4 cursor-pointer rounded-lg">
          创建新会话
        </p>
      </div>
      {/* 目录 */}
      <div className="flex flex-col items-center justify-center gap-2 p-6">
        {chats?.data?.map((chat: ChatModel) => {
          return (
            <div
              key={chat.id}
              className="w-full h-10 flex items-center justify-between group cursor-pointer hover:bg-gray-100 rounded-lg px-2 transition-colors"
              onClick={() => router.push(`/chat/${chat.id}`)}
            >
              <p
                className={`font-extralight text-sm line-clamp-1 flex-1 ${
                  pathname === `/chat/${chat.id}` ? 'text-blue-700' : ''
                }`}
              >
                {chat?.title}
              </p>

              {/* 三个点菜单按钮 - 悬停时显示 */}
              <div className="relative">
                <button
                  onClick={(e) => handleMenuToggle(e, chat.id)}
                  disabled={deletingId === chat.id}
                  className={`${
                    openMenuId === chat.id
                      ? 'opacity-100'
                      : 'opacity-0 group-hover:opacity-100'
                  } transition-opacity p-1 hover:bg-gray-200 rounded`}
                  title="更多选项"
                >
                  <MoreHorizIcon fontSize="small" className="text-gray-600" />
                </button>

                {/* 下拉菜单 */}
                {openMenuId === chat.id && (
                  <div
                    ref={menuRef}
                    className="absolute right-0 mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
                  >
                    <button
                      onClick={(e) => handleDelete(e, chat.id)}
                      disabled={deletingId === chat.id}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deletingId === chat.id ? '删除中...' : '删除'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Navibar

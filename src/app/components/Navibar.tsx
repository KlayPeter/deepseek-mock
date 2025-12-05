'use client'

import { useUser } from '@clerk/nextjs'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usePathname, useRouter } from 'next/navigation'
import axios from 'axios'
import { ChatModel } from '@/src/db/schema'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import SmartToyIcon from '@mui/icons-material/SmartToy'
import AddIcon from '@mui/icons-material/Add'
import MenuIcon from '@mui/icons-material/Menu'
import DeleteIcon from '@mui/icons-material/Delete'
import { useState, useRef, useEffect } from 'react'
import { useNavibar } from './NavibarContext'

type Props = {}

const Navibar = (props: Props) => {
  const { user } = useUser()
  const router = useRouter()
  const pathname = usePathname()
  const queryClient = useQueryClient()
  const { isOpen, setIsOpen } = useNavibar()
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
    <>
      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 bg-black/20 z-40 md:hidden transition-opacity ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      />

      <div
        className={`
        fixed md:static inset-y-0 left-0 z-50
        w-[260px] bg-ds-sidebar border-r border-ds-border flex flex-col
        transform md:transform-none transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-2">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <SmartToyIcon className="w-7 h-7 text-ds-primary" />
              <span className="font-semibold text-lg tracking-tight text-ds-primary">
                DeepSeek
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-ds-subtext hover:text-ds-text transition-colors md:hidden"
              title="收起侧边栏"
            >
              <MenuIcon className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={() => {
              router.push('/')
              if (typeof window !== 'undefined' && window.innerWidth < 768) {
                setIsOpen(false)
              }
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-ds-border hover:bg-gray-50 text-ds-text rounded-full text-sm font-medium transition-colors shadow-sm mb-6"
          >
            <AddIcon className="w-4 h-4" />
            <span>开启新对话</span>
          </button>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto px-3 space-y-6">
          <div>
            <div className="px-3 mb-2 text-xs font-medium text-ds-subtext">
              7天内
            </div>
            <div className="space-y-0.5">
              {chats?.data?.map((chat: ChatModel) => {
                return (
                  <div
                    key={chat.id}
                    onClick={() => {
                      router.push(`/chat/${chat.id}`)
                      if (
                        typeof window !== 'undefined' &&
                        window.innerWidth < 768
                      ) {
                        setIsOpen(false)
                      }
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors group relative cursor-pointer ${
                      pathname === `/chat/${chat.id}`
                        ? 'bg-gray-200/60 text-ds-text'
                        : 'text-ds-text hover:bg-gray-100'
                    }`}
                  >
                    <span className="truncate block pr-8">{chat.title}</span>

                    {/* 三个点菜单按钮容器 */}
                    <div
                      className={`absolute right-1 top-1/2 -translate-y-1/2 ${
                        openMenuId === chat.id
                          ? 'opacity-100'
                          : 'opacity-0 group-hover:opacity-100'
                      } ${
                        pathname === `/chat/${chat.id}` ? 'opacity-100' : ''
                      } transition-opacity`}
                    >
                      <button
                        onClick={(e) => handleMenuToggle(e, chat.id)}
                        disabled={deletingId === chat.id}
                        className="p-1.5 hover:bg-gray-200 rounded-md transition-colors text-ds-subtext"
                        title="更多选项"
                      >
                        <MoreHorizIcon className="w-4 h-4" />
                      </button>

                      {/* 下拉菜单 */}
                      {openMenuId === chat.id && (
                        <div
                          ref={menuRef}
                          className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-xl border border-gray-200 z-[100] py-1.5 overflow-hidden"
                          onClick={(e) => e.stopPropagation()}
                          style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}
                        >
                          <button
                            onClick={(e) => handleDelete(e, chat.id)}
                            disabled={deletingId === chat.id}
                            className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2.5"
                          >
                            <DeleteIcon className="w-4 h-4" />
                            <span className="font-medium">
                              {deletingId === chat.id ? '删除中...' : '删除'}
                            </span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
              {(!chats?.data || chats.data.length === 0) && (
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
              {user?.imageUrl ? (
                <img src={user.imageUrl} alt="User" />
              ) : (
                <img
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                  alt="User"
                />
              )}
            </div>
            <div className="flex-1 text-left">
              <div className="font-medium text-ds-text">
                {user?.fullName || 'User'}
              </div>
            </div>
            <MoreHorizIcon className="w-4 h-4 text-ds-subtext" />
          </button>
        </div>
      </div>
    </>
  )
}

export default Navibar

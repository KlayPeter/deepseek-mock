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
import WarningIcon from '@mui/icons-material/Warning'
import PsychologyIcon from '@mui/icons-material/Psychology'
import { useState, useRef, useEffect } from 'react'
import { useNavibar } from './NavibarContext'
import { createPortal } from 'react-dom'

type Props = {}

const Navibar = (props: Props) => {
  const { user } = useUser()
  const router = useRouter()
  const pathname = usePathname()
  const queryClient = useQueryClient()
  const { isOpen, setIsOpen } = useNavibar()

  const [deletingId, setDeletingId] = useState<number | null>(null) // 正在删除的ID（loading状态）
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null) // 待确认删除的ID
  const [openMenuId, setOpenMenuId] = useState<number | null>(null)

  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 })
  const menuButtonRef = useRef<HTMLButtonElement | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)

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
      // 如果点击的是菜单按钮或菜单本身，不处理
      if (
        (menuButtonRef.current &&
          menuButtonRef.current.contains(event.target as Node)) ||
        (menuRef.current && menuRef.current.contains(event.target as Node))
      ) {
        return
      }
      // 关闭菜单
      setOpenMenuId(null)
    }

    if (openMenuId) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [openMenuId])

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
      setConfirmDeleteId(null)
    },
    onError: (error) => {
      console.error('删除失败:', error)
      alert('删除失败，请重试')
      setDeletingId(null)
    },
  })

  const handleMenuToggle = (e: React.MouseEvent, chatId: number) => {
    e.stopPropagation()

    if (openMenuId === chatId) {
      setOpenMenuId(null)
      return
    }

    // 计算菜单位置（按钮右侧）
    const rect = e.currentTarget.getBoundingClientRect()
    setMenuPosition({
      top: rect.top, // 顶部对齐
      left: rect.right + 8, // 右侧 8px 间距
    })
    setOpenMenuId(chatId)
    menuButtonRef.current = e.currentTarget as HTMLButtonElement
  }

  const handleRequestDelete = (e: React.MouseEvent, chatId: number) => {
    e.stopPropagation()
    setOpenMenuId(null)
    setConfirmDeleteId(chatId)
  }

  const handleConfirmDelete = () => {
    if (confirmDeleteId) {
      setDeletingId(confirmDeleteId)
      deleteChat(confirmDeleteId)
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
        fixed inset-y-0 left-0 z-50
        w-[260px] bg-ds-sidebar border-r border-ds-border flex flex-col
        transform transition-transform duration-300 ease-in-out
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
              className="text-ds-subtext hover:text-ds-text transition-colors"
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
                    } ${openMenuId === chat.id ? 'bg-gray-100' : ''}`}
                  >
                    <div className="flex items-center gap-2 pr-8">
                      <span className="truncate flex-1" title={chat.title}>
                        {chat.title}
                      </span>
                      {chat.model === 'deepseek-r1' && (
                        <span className="shrink-0 flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-medium bg-blue-50 text-ds-primary border border-blue-200">
                          <PsychologyIcon style={{ fontSize: '0.625rem' }} />
                          R1
                        </span>
                      )}
                    </div>

                    {/* 三个点菜单按钮容器 */}
                    <div
                      className={`absolute right-1 top-1/2 -translate-y-1/2 z-50 ${
                        openMenuId === chat.id
                          ? 'opacity-100'
                          : 'opacity-0 group-hover:opacity-100'
                      } ${
                        pathname === `/chat/${chat.id}` ? 'opacity-100' : ''
                      } transition-opacity`}
                    >
                      <button
                        onClick={(e) => handleMenuToggle(e, chat.id)}
                        className="p-1.5 hover:bg-gray-200 rounded-md transition-colors text-ds-subtext"
                        title="更多选项"
                      >
                        <MoreHorizIcon className="w-4 h-4" />
                      </button>
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

      {/* Portal 渲染菜单 - 放在 body 层级以避免 overflow 裁剪 */}
      {openMenuId &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={menuRef}
            className="fixed z-[9999] bg-white rounded-lg shadow-lg border border-gray-200 py-1 overflow-hidden w-28 fade-in"
            style={{
              top: menuPosition.top,
              left: menuPosition.left,
              animation: 'fadeIn 0.1s ease-out',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={(e) => handleRequestDelete(e, openMenuId)}
              className="w-full px-3 py-2 text-left text-xs text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
            >
              <DeleteIcon sx={{ fontSize: 16 }} />
              <span>删除</span>
            </button>
          </div>,
          document.body
        )}

      {/* 删除确认弹窗 */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 fade-in">
          <div
            className="bg-white rounded-2xl shadow-2xl w-[400px] p-6 scale-in mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col gap-4">
              <div className="font-bold text-lg text-gray-900">删除对话？</div>
              <div className="text-sm text-gray-600">
                删除后将无法恢复，确认要删除这个对话吗？
              </div>
              <div className="flex justify-end gap-3 mt-2">
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={!!deletingId}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {deletingId ? '删除中...' : '确认删除'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .scale-in {
          animation: fadeIn 0.15s ease-out;
        }
        .fade-in {
          animation: fadeIn 0.15s ease-out;
        }
      `}</style>
    </>
  )
}

export default Navibar

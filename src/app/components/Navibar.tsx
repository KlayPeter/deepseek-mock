'use client'

import { useUser, useClerk } from '@clerk/nextjs'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usePathname, useRouter } from 'next/navigation'
import axios from 'axios'
import { ChatModel } from '@/src/db/schema'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import SmartToyIcon from '@mui/icons-material/SmartToy'
import AddIcon from '@mui/icons-material/Add'
import MenuIcon from '@mui/icons-material/Menu'
import DeleteIcon from '@mui/icons-material/Delete'
import PsychologyIcon from '@mui/icons-material/Psychology'
import LogoutIcon from '@mui/icons-material/Logout'
import { useState, useRef, useEffect } from 'react'
import { useNavibar } from './NavibarContext'
import { createPortal } from 'react-dom'

type Props = {}

const Navibar = (props: Props) => {
  const { user } = useUser()
  const { signOut } = useClerk()
  const router = useRouter()
  const pathname = usePathname()
  const queryClient = useQueryClient()
  const { isOpen, setIsOpen } = useNavibar()

  const [deletingId, setDeletingId] = useState<number | null>(null) // 正在删除的ID（loading状态）
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null) // 待确认删除的ID
  const [openMenuId, setOpenMenuId] = useState<number | null>(null)
  const [userMenuOpen, setUserMenuOpen] = useState(false) // 用户菜单状态

  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 })
  const menuButtonRef = useRef<HTMLButtonElement | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const userMenuRef = useRef<HTMLDivElement | null>(null)

  const { data: chats } = useQuery({
    queryKey: ['chats'],
    queryFn: async () => {
      return axios.post('/api/get-chats')
    },
    enabled: !!user?.id,
  })

  // 监听窗口大小变化，响应式展开/关闭侧边栏
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        // 桌面端自动展开
        setIsOpen(true)
      } else {
        // 移动端自动关闭
        setIsOpen(false)
      }
    }

    // 添加监听器
    window.addEventListener('resize', handleResize)

    // 清理监听器
    return () => window.removeEventListener('resize', handleResize)
  }, [setIsOpen])

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // 如果点击的是菜单按钮或菜单本身，不处理
      if (
        (menuButtonRef.current &&
          menuButtonRef.current.contains(event.target as Node)) ||
        (menuRef.current && menuRef.current.contains(event.target as Node)) ||
        (userMenuRef.current &&
          userMenuRef.current.contains(event.target as Node))
      ) {
        return
      }
      // 关闭菜单
      setOpenMenuId(null)
      setUserMenuOpen(false)
    }

    if (openMenuId || userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [openMenuId, userMenuOpen])

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
        w-[260px] bg-ds-sidebar border-r border-ds-border flex flex-col overflow-hidden
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
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 space-y-6">
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
                    <div className="flex items-center gap-2 pr-8 min-w-0">
                      <span
                        className="truncate flex-1 block"
                        title={chat.title}
                      >
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

        {/* User Profile - 简洁版 */}
        <div className="p-4 border-t border-ds-border shrink-0">
          {user ? (
            <>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="w-full flex items-center gap-3 hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors min-w-0"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center shrink-0">
                  {user.imageUrl ? (
                    <img
                      src={user.imageUrl}
                      alt={user.fullName || 'User'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`}
                      alt="User"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0 text-left overflow-hidden">
                  {user.primaryEmailAddress?.emailAddress && (
                    <div className="text-sm text-ds-text truncate">
                      {user.primaryEmailAddress.emailAddress}
                    </div>
                  )}
                </div>
                <MoreHorizIcon className="w-5 h-5 text-ds-subtext shrink-0" />
              </button>

              {/* 用户下拉菜单 */}
              {userMenuOpen && (
                <div
                  ref={userMenuRef}
                  className="absolute bottom-full left-4 right-4 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 py-1 overflow-hidden fade-in"
                >
                  <button
                    onClick={async (e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setUserMenuOpen(false)
                      await signOut()
                      router.push('/')
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                  >
                    <LogoutIcon sx={{ fontSize: 18 }} />
                    <span>退出登录</span>
                  </button>
                </div>
              )}
            </>
          ) : (
            <button
              onClick={() => router.push('/sign-in')}
              className="w-full px-4 py-2 bg-ds-primary text-white rounded-lg hover:bg-[#3d5ce0] transition-colors text-sm font-medium"
            >
              登录 / 注册
            </button>
          )}
        </div>
      </div>

      {/* Portal 渲染菜单 - 放在 body 层级以避免 overflow 裁剪 */}
      {openMenuId &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={menuRef}
            className="fixed z-9999 bg-white rounded-lg shadow-lg border border-gray-200 py-1 overflow-hidden w-28 fade-in"
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
        <div className="fixed inset-0 z-10000 flex items-center justify-center bg-black/50 fade-in">
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

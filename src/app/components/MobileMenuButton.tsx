'use client'

import MenuIcon from '@mui/icons-material/Menu'
import { useNavibar } from './NavibarContext'

export default function MobileMenuButton() {
  const { toggleSidebar, isOpen } = useNavibar()

  // 侧边栏打开时隐藏菜单按钮（因为侧边栏内有关闭按钮）
  if (isOpen) return null

  return (
    <button
      onClick={toggleSidebar}
      className="fixed top-4 left-4 z-30 p-2 bg-white rounded-lg shadow-md border border-gray-200 hover:bg-gray-50 transition-colors"
      aria-label="打开菜单"
    >
      <MenuIcon className="w-6 h-6 text-gray-700" />
    </button>
  )
}

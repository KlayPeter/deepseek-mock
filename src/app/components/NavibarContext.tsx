'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'

interface NavibarContextType {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  toggleSidebar: () => void
}

const NavibarContext = createContext<NavibarContextType | undefined>(undefined)

export function NavibarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  // 初始化侧边栏状态：桌面端默认打开，移动端默认关闭
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(true)
      } else {
        setIsOpen(false)
      }
    }

    // 初始化
    handleResize()

    // 监听窗口大小变化
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const toggleSidebar = () => setIsOpen((prev) => !prev)

  return (
    <NavibarContext.Provider value={{ isOpen, setIsOpen, toggleSidebar }}>
      {children}
    </NavibarContext.Provider>
  )
}

export function useNavibar() {
  const context = useContext(NavibarContext)
  if (!context) {
    throw new Error('useNavibar must be used within NavibarProvider')
  }
  return context
}

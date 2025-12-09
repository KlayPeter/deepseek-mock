'use client'

import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'
import Navibar from './Navibar'
import MainContent from './MainContent'

export default function LayoutContent({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  // 登录和注册页面不显示侧边栏
  const isAuthPage =
    pathname?.startsWith('/sign-in') || pathname?.startsWith('/sign-up')

  if (isAuthPage) {
    return <>{children}</>
  }

  return (
    <>
      <Navibar />
      <MainContent>{children}</MainContent>
    </>
  )
}

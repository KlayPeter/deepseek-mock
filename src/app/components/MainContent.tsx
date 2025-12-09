'use client'

import { useNavibar } from './NavibarContext'
import { ReactNode } from 'react'

export default function MainContent({ children }: { children: ReactNode }) {
  const { isOpen } = useNavibar()

  return (
    <div
      className={`w-full h-screen overflow-hidden overflow-x-hidden transition-all duration-300 ${
        isOpen ? 'md:ml-[260px]' : 'ml-0'
      }`}
    >
      {children}
    </div>
  )
}

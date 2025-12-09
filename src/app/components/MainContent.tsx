'use client'

import { ReactNode } from 'react'

export default function MainContent({ children }: { children: ReactNode }) {
  return (
    <div className="w-full h-screen overflow-hidden overflow-x-hidden">
      {children}
    </div>
  )
}

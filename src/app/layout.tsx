import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import Navibar from './components/Navibar'
import QueryClientProvider from '@/src/app/components/QueryClientProvider'
import { NavibarProvider } from './components/NavibarContext'
import MainContent from './components/MainContent'

import './globals.css'
import 'katex/dist/katex.min.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'DeepSeek Clone',
  description: 'A DeepSeek-style AI chat interface',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <QueryClientProvider>
        <html lang="zh-CN">
          <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
          >
            <NavibarProvider>
              <Navibar />
              <MainContent>{children}</MainContent>
            </NavibarProvider>
          </body>
        </html>
      </QueryClientProvider>
    </ClerkProvider>
  )
}

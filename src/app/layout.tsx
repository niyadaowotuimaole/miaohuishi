import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '每日投资参考',
  description: '每日涨停、贵金属行情、利好消息',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}

import type { Metadata, Viewport } from 'next'
import './globals.css'
import Header from '@/components/layout/Header'
import ChatWidget from '@/components/chat/ChatWidget'

export const metadata: Metadata = {
  title: 'TechNews',
  description: 'Noticias de tecnología enriquecidas con IA',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Header />
        {children}
        <ChatWidget />
      </body>
    </html>
  )
}

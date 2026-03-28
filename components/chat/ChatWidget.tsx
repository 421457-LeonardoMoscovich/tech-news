'use client'

import { useState, useRef, useEffect } from 'react'
import type { ChatMessage } from '@/types'

const INITIAL_MESSAGE: ChatMessage = {
  role: 'assistant',
  content: '¡Hola! Soy el asistente de TechNews. Puedo ayudarte a entender las noticias, explicar conceptos técnicos o recomendar artículos. ¿Qué querés saber?',
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend() {
    const text = input.trim()
    if (!text || streaming) return
    setInput('')

    const userMsg: ChatMessage = { role: 'user', content: text }
    const history = [...messages, userMsg]
    setMessages([...history, { role: 'assistant', content: '' }])
    setStreaming(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      })

      if (!res.body) throw new Error('no body')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        setMessages((prev) => {
          const last = prev[prev.length - 1]
          return [...prev.slice(0, -1), { ...last, content: last.content + chunk }]
        })
      }
    } catch {
      setMessages((prev) => {
        const last = prev[prev.length - 1]
        return [...prev.slice(0, -1), { ...last, content: 'Error al conectar. Intentá de nuevo.' }]
      })
    } finally {
      setStreaming(false)
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((o) => !o)}
        title="Chat con IA"
        style={{
          position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 150,
          width: 52, height: 52, borderRadius: '50%',
          background: 'var(--accent)', border: 'none',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.25rem', boxShadow: '0 4px 24px rgba(232,255,71,0.3)',
          transition: 'transform 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      >
        {open ? '✕' : '💬'}
      </button>

      {/* Chat panel */}
      {open && (
        <div style={{
          position: 'fixed', bottom: '5.5rem', right: '2rem', zIndex: 150,
          width: 340, background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 16, display: 'flex', flexDirection: 'column',
          boxShadow: '0 16px 64px rgba(0,0,0,0.5)',
          animation: 'slideUp 0.2s ease',
        }}>

          {/* Header */}
          <div style={{
            padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Asistente TechNews</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Powered by Groq · llama-3.3-70b
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{
                background: 'var(--surface2)', border: '1px solid var(--border)',
                color: 'var(--text-muted)', width: 28, height: 28, borderRadius: 6,
                cursor: 'pointer', fontSize: '0.85rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >✕</button>
          </div>

          {/* Messages */}
          <div style={{
            padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem',
            minHeight: 200, maxHeight: 300, overflowY: 'auto',
          }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                maxWidth: '85%',
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              }}>
                <div style={{
                  padding: '0.6rem 0.9rem', fontSize: '0.82rem', lineHeight: 1.5,
                  borderRadius: msg.role === 'user' ? '12px 4px 12px 12px' : '4px 12px 12px 12px',
                  background: msg.role === 'user' ? 'var(--accent)' : 'var(--surface2)',
                  color: msg.role === 'user' ? '#0a0a0f' : 'var(--text)',
                  fontWeight: msg.role === 'user' ? 500 : 400,
                }}>
                  {msg.content || (streaming && i === messages.length - 1 ? '...' : '')}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: '0.75rem 1rem', borderTop: '1px solid var(--border)',
            display: 'flex', gap: '0.5rem',
          }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
              placeholder="Preguntá sobre las noticias..."
              disabled={streaming}
              style={{
                flex: 1, background: 'var(--surface2)', border: '1px solid var(--border)',
                color: 'var(--text)', padding: '0.5rem 0.75rem', borderRadius: 8,
                fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem', outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
            />
            <button
              onClick={handleSend}
              disabled={streaming || !input.trim()}
              style={{
                background: 'var(--accent)', border: 'none', color: '#0a0a0f',
                padding: '0.5rem 0.75rem', borderRadius: 8,
                cursor: streaming || !input.trim() ? 'not-allowed' : 'pointer',
                fontSize: '0.85rem', fontWeight: 700,
                opacity: streaming || !input.trim() ? 0.5 : 1,
                transition: 'opacity 0.15s',
              }}
            >↑</button>
          </div>
        </div>
      )}

      <style>{`@keyframes slideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </>
  )
}

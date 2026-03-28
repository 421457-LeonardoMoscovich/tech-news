'use client'

import { useState, useEffect } from 'react'
import type { Article } from '@/types'
import ArticleModal from './ArticleModal'

const CAT_COLORS: Record<string, string> = {
  AI:         'var(--cat-ai)',
  WebDev:     'var(--cat-webdev)',
  Security:   'var(--cat-security)',
  OpenSource: 'var(--cat-opensource)',
  Hardware:   'var(--cat-hardware)',
  Business:   'var(--cat-business)',
}

const CAT_BG: Record<string, string> = {
  AI:         'rgba(167,139,250,0.15)',
  WebDev:     'rgba(52,211,153,0.15)',
  Security:   'rgba(248,113,113,0.15)',
  OpenSource: 'rgba(251,146,60,0.15)',
  Hardware:   'rgba(96,165,250,0.15)',
  Business:   'rgba(251,191,36,0.15)',
}

function relativeTime(dateStr: string | null): string {
  if (!dateStr) return ''
  const diff = (new Date(dateStr).getTime() - Date.now()) / 1000
  const abs = Math.abs(diff)
  const rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto' })
  if (abs < 3600)  return rtf.format(Math.round(diff / 60), 'minute')
  if (abs < 86400) return rtf.format(Math.round(diff / 3600), 'hour')
  return rtf.format(Math.round(diff / 86400), 'day')
}

export default function ArticleCard({ article }: { article: Article }) {
  const [open, setOpen] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [read, setRead] = useState(false)

  useEffect(() => {
    try {
      const ids: string[] = JSON.parse(localStorage.getItem('read_articles') ?? '[]')
      setRead(ids.includes(article.id))
    } catch { /* ignore */ }
  }, [article.id])

  function handleOpen() {
    setOpen(true)
    setRead(true)
  }

  const cat = article.category ?? ''
  const catColor = CAT_COLORS[cat] ?? 'var(--text-muted)'
  const catBg = CAT_BG[cat] ?? 'rgba(120,120,150,0.1)'
  const score = article.relevance_score ?? 0

  return (
    <>
      <article
        role="button"
        tabIndex={0}
        onClick={handleOpen}
        onKeyDown={(e) => e.key === 'Enter' && handleOpen()}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          opacity: read ? 0.65 : 1,
          borderRadius: 12,
          padding: '1.25rem',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.2s',
          transform: hovered ? 'translateY(-2px)' : 'none',
          boxShadow: hovered ? '0 8px 32px rgba(0,0,0,0.4)' : 'none',
        }}
      >
        {/* Read badge */}
        {read && (
          <div style={{
            position: 'absolute', top: 10, right: 10,
            fontSize: '0.65rem', fontFamily: "'JetBrains Mono', monospace",
            color: 'var(--text-muted)', background: 'var(--surface2)',
            border: '1px solid var(--border)', padding: '0.1rem 0.4rem', borderRadius: 4,
          }}>✓ leído</div>
        )}

        {/* Top accent bar */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 2,
          background: catColor,
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.2s',
        }} />

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <span style={{
            fontSize: '0.7rem', fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 500, letterSpacing: '0.5px',
            padding: '0.2rem 0.55rem', borderRadius: 4,
            textTransform: 'uppercase',
            background: catBg, color: catColor,
          }}>
            {cat || 'General'}
          </span>
          <span style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem',
            color: score >= 8 ? 'var(--accent)' : 'var(--text-muted)',
          }}>
            {score}/10
          </span>
        </div>

        {/* Title */}
        <h2 style={{
          fontSize: '0.95rem', fontWeight: 600, lineHeight: 1.4, color: 'var(--text)',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          margin: 0,
        }}>
          {article.title}
        </h2>

        {/* Summary */}
        {article.summary && (
          <p style={{
            fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.6,
            display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            margin: 0,
          }}>
            {article.summary}
          </p>
        )}

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {article.tags.map((tag) => (
              <span key={tag} style={{
                fontSize: '0.7rem', color: 'var(--text-muted)',
                fontFamily: "'JetBrains Mono', monospace",
              }}>
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--border)',
        }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {article.source && <span style={{ color: 'var(--text)' }}>{article.source}</span>}
            {article.source && article.published_at && ' · '}
            {article.published_at && relativeTime(article.published_at)}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); setOpen(true) }}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-muted)', fontSize: '0.9rem', padding: '0.25rem',
              borderRadius: 4, transition: 'color 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            title="Guardar"
          >
            🔖
          </button>
        </div>
      </article>

      {open && <ArticleModal article={article} onClose={() => setOpen(false)} onRead={() => setRead(true)} />}
    </>
  )
}

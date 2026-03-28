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

type TrendingArticle = Article & { vote_count: number }

export default function TrendingStrip() {
  const [articles, setArticles] = useState<TrendingArticle[]>([])
  const [selected, setSelected] = useState<TrendingArticle | null>(null)

  useEffect(() => {
    fetch('/api/articles/trending')
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data) && data.length > 0) setArticles(data) })
  }, [])

  if (articles.length === 0) return null

  return (
    <>
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem' }}>
          <span style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem',
            fontWeight: 500, letterSpacing: 1, padding: '0.2rem 0.5rem',
            background: 'rgba(232,255,71,0.1)', color: 'var(--accent)',
            borderRadius: 3, border: '1px solid rgba(232,255,71,0.2)',
          }}>🔥 TRENDING</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>
            últimas 48h
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
          {articles.map((article, i) => {
            const cat = article.category ?? ''
            const catColor = CAT_COLORS[cat] ?? 'var(--text-muted)'
            return (
              <button
                key={article.id}
                onClick={() => setSelected(article)}
                style={{
                  flexShrink: 0, width: 220,
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: 10, padding: '0.85rem',
                  cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                  display: 'flex', flexDirection: 'column', gap: '0.5rem',
                  position: 'relative', overflow: 'hidden',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = catColor; e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none' }}
              >
                {/* Rank */}
                <div style={{
                  position: 'absolute', top: 8, right: 8,
                  fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem',
                  color: i === 0 ? 'var(--accent)' : 'var(--text-muted)',
                  fontWeight: 700,
                }}>#{i + 1}</div>

                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text)', lineHeight: 1.4, paddingRight: '1.2rem',
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>
                  {article.title}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.68rem', color: catColor, fontFamily: "'JetBrains Mono', monospace" }}>
                    {cat || 'General'}
                  </span>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>
                    ⭐ {article.vote_count}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {selected && <ArticleModal article={selected} onClose={() => setSelected(null)} />}
    </>
  )
}

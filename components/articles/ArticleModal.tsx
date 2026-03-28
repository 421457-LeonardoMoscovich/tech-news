'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Article } from '@/types'
import AuthModal from '@/components/auth/AuthModal'

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

function formatDate(d: string | null) {
  if (!d) return ''
  return new Intl.DateTimeFormat('es', { dateStyle: 'long' }).format(new Date(d))
}

export default function ArticleModal({ article, onClose }: { article: Article; onClose: () => void }) {
  const [expanded, setExpanded] = useState(false)
  const [hoverStar, setHoverStar] = useState(0)
  const [userVote, setUserVote] = useState(0)
  const [saved, setSaved] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [user, setUser] = useState<{ id: string } | null>(null)
  const [comments, setComments] = useState<{ id: string; body: string; created_at: string; user_id: string }[]>([])
  const [commentInput, setCommentInput] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const cat = article.category ?? ''
  const catColor = CAT_COLORS[cat] ?? 'var(--text-muted)'
  const catBg = CAT_BG[cat] ?? 'rgba(120,120,150,0.1)'
  const score = article.relevance_score ?? 0
  const hasDetail = article.context || article.key_points?.length || article.why_it_matters || article.related_topics?.length

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => setUser(data.user ? { id: data.user.id } : null))
    fetch(`/api/articles/comments?article_id=${article.id}`)
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setComments(data) })
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose, article.id])

  async function handleComment() {
    if (!user) { setAuthOpen(true); return }
    if (!commentInput.trim() || submitting) return
    setSubmitting(true)
    const res = await fetch('/api/articles/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ article_id: article.id, body: commentInput.trim() }),
    })
    if (res.ok) {
      const comment = await res.json()
      setComments((prev) => [...prev, comment])
      setCommentInput('')
    }
    setSubmitting(false)
  }

  async function handleDeleteComment(comment_id: string) {
    await fetch('/api/articles/comments', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ comment_id }),
    })
    setComments((prev) => prev.filter((c) => c.id !== comment_id))
  }

  async function handleVote(value: number) {
    if (!user) { setAuthOpen(true); return }
    setUserVote(value)
    await fetch('/api/articles/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ article_id: article.id, value }),
    })
  }

  async function handleSave() {
    if (!user) { setAuthOpen(true); return }
    setSaved((s) => !s)
    await fetch('/api/articles/save', {
      method: saved ? 'DELETE' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ article_id: article.id }),
    })
  }

  const activeStar = hoverStar || userVote

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem',
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 16, width: '100%',
            maxWidth: expanded ? 820 : 680,
            maxHeight: '88vh', overflowY: 'auto',
            animation: 'slideUp 0.25s ease',
            transition: 'max-width 0.35s ease',
          }}
        >
          {/* Sticky top */}
          <div style={{
            position: 'sticky', top: 0, background: 'var(--surface)',
            padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            borderRadius: '16px 16px 0 0', zIndex: 1,
          }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <span style={{
                fontSize: '0.7rem', fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 500, letterSpacing: '0.5px', padding: '0.2rem 0.55rem',
                borderRadius: 4, textTransform: 'uppercase', background: catBg, color: catColor,
              }}>{cat || 'General'}</span>
              <span style={{
                fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem',
                color: score >= 8 ? 'var(--accent)' : 'var(--text-muted)',
              }}>
                {score}/10 relevancia
              </span>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'var(--surface2)', border: '1px solid var(--border)',
                color: 'var(--text-muted)', width: 32, height: 32, borderRadius: 6,
                cursor: 'pointer', fontSize: '1rem', display: 'flex',
                alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.borderColor = 'var(--text-muted)' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)' }}
            >✕</button>
          </div>

          {/* Body */}
          <div style={{ padding: '1.75rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Title */}
            <h2 style={{ fontSize: '1.3rem', fontWeight: 600, lineHeight: 1.4, color: 'var(--text)', margin: 0 }}>
              {article.title}
            </h2>

            {/* Summary */}
            {article.summary && (
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.75, margin: 0 }}>
                {article.summary}
              </p>
            )}

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {article.tags.map((tag) => (
                  <span key={tag} style={{
                    background: 'var(--surface2)', border: '1px solid var(--border)',
                    padding: '0.25rem 0.65rem', borderRadius: 20,
                    fontSize: '0.75rem', fontFamily: "'JetBrains Mono', monospace",
                    color: 'var(--text-muted)',
                  }}>#{tag}</span>
                ))}
              </div>
            )}

            <div style={{ height: 1, background: 'var(--border)' }} />

            {/* Source */}
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Fuente: <strong style={{ color: 'var(--text)' }}>{article.source ?? '—'}</strong>
              {article.published_at && <> · {formatDate(article.published_at)}</>}
            </div>

            {/* Expand button */}
            {hasDetail && (
              <button
                onClick={() => setExpanded((x) => !x)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                  background: 'none', border: '1px dashed var(--border)',
                  color: 'var(--text-muted)', padding: '0.35rem 0.85rem',
                  borderRadius: 6, cursor: 'pointer', fontSize: '0.78rem',
                  fontFamily: "'JetBrains Mono', monospace", transition: 'all 0.2s',
                  alignSelf: 'flex-start',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' }}
              >
                <span style={{ display: 'inline-block', transition: 'transform 0.25s', transform: expanded ? 'rotate(180deg)' : 'none' }}>▾</span>
                &nbsp;{expanded ? 'Ocultar detalle' : 'Expandir detalle'}
              </button>
            )}

            {/* Level 2 detail */}
            <div style={{
              overflow: 'hidden',
              maxHeight: expanded ? 700 : 0,
              opacity: expanded ? 1 : 0,
              transition: 'max-height 0.4s ease, opacity 0.3s ease',
            }}>
              <div style={{
                borderTop: '1px solid var(--border)', paddingTop: '1.5rem',
                display: 'flex', flexDirection: 'column', gap: '1.5rem',
              }}>
                {article.context && (
                  <div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', letterSpacing: 1, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                      // ¿De qué se trata?
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.7, margin: 0 }}>{article.context}</p>
                  </div>
                )}

                {article.key_points && article.key_points.length > 0 && (
                  <div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', letterSpacing: 1, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                      // Puntos clave
                    </div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      {article.key_points.map((point, i) => (
                        <li key={i} style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6, paddingLeft: '1.25rem', position: 'relative' }}>
                          <span style={{ position: 'absolute', left: 0, color: 'var(--accent)', fontSize: '0.7rem', top: '0.2rem' }}>▸</span>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {article.why_it_matters && (
                  <div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', letterSpacing: 1, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                      // ¿Por qué importa?
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.7, margin: 0 }}>{article.why_it_matters}</p>
                  </div>
                )}

                {article.related_topics && article.related_topics.length > 0 && (
                  <div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', letterSpacing: 1, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                      // Relacionado con
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {article.related_topics.map((topic) => (
                        <span key={topic} style={{
                          background: 'rgba(232,255,71,0.07)', border: '1px solid rgba(232,255,71,0.2)',
                          color: 'var(--accent)', padding: '0.2rem 0.65rem', borderRadius: 20,
                          fontSize: '0.75rem', fontFamily: "'JetBrains Mono', monospace",
                        }}>{topic}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{
                  fontSize: '0.8rem', color: 'var(--text-muted)',
                  padding: '0.75rem 1rem', background: 'var(--surface2)',
                  borderRadius: 8, borderLeft: '2px solid var(--border)',
                }}>
                  ¿Querés todos los detalles? El artículo original tiene la historia completa →
                </div>
              </div>
            </div>

            {/* Votes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>
                // PUNTUÁ ESTE ARTÍCULO
              </span>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <span
                    key={n}
                    onClick={() => handleVote(n)}
                    onMouseEnter={() => setHoverStar(n)}
                    onMouseLeave={() => setHoverStar(0)}
                    style={{
                      fontSize: '1.25rem', cursor: 'pointer', transition: 'transform 0.1s',
                      filter: n <= activeStar ? 'none' : 'grayscale(1)',
                      opacity: n <= activeStar ? 1 : 0.4,
                      transform: n <= activeStar ? 'scale(1.1)' : 'scale(1)',
                    }}
                  >⭐</span>
                ))}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {user ? (userVote ? `Votaste ${userVote}/5` : 'Seleccioná una puntuación') : 'Iniciá sesión para votar'}
              </span>
            </div>

            {/* Comments */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>
                // COMENTARIOS ({comments.length})
              </span>

              {comments.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {comments.map((c) => (
                    <div key={c.id} style={{
                      display: 'flex', gap: '0.65rem', alignItems: 'flex-start',
                      padding: '0.65rem 0.85rem', background: 'var(--surface2)',
                      borderRadius: 8, border: '1px solid var(--border)',
                    }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                        background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.65rem', fontWeight: 700, color: '#0a0a0f',
                      }}>
                        {c.user_id.slice(0, 2).toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text)', lineHeight: 1.5, wordBreak: 'break-word' }}>{c.body}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem', fontFamily: "'JetBrains Mono', monospace" }}>
                          {new Intl.DateTimeFormat('es', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(c.created_at))}
                        </div>
                      </div>
                      {user?.id === c.user_id && (
                        <button
                          onClick={() => handleDeleteComment(c.id)}
                          style={{
                            background: 'none', border: 'none', color: 'var(--text-muted)',
                            cursor: 'pointer', fontSize: '0.75rem', padding: '0.15rem 0.3rem',
                            borderRadius: 4, transition: 'color 0.15s', flexShrink: 0,
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--cat-security)')}
                          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                          title="Eliminar comentario"
                        >✕</button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {user ? (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleComment() } }}
                    placeholder="Escribí un comentario..."
                    style={{
                      flex: 1, background: 'var(--surface2)', border: '1px solid var(--border)',
                      borderRadius: 8, padding: '0.5rem 0.85rem', color: 'var(--text)',
                      fontFamily: "'DM Sans', sans-serif", fontSize: '0.85rem', outline: 'none',
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
                  />
                  <button
                    onClick={handleComment}
                    disabled={submitting || !commentInput.trim()}
                    style={{
                      background: 'var(--accent)', border: 'none', color: '#0a0a0f',
                      padding: '0.5rem 1rem', borderRadius: 8, cursor: 'pointer',
                      fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: '0.85rem',
                      opacity: submitting || !commentInput.trim() ? 0.5 : 1, transition: 'opacity 0.15s',
                    }}
                  >
                    {submitting ? '...' : 'Enviar'}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setAuthOpen(true)}
                  style={{
                    background: 'none', border: '1px dashed var(--border)',
                    color: 'var(--text-muted)', padding: '0.5rem 1rem', borderRadius: 8,
                    cursor: 'pointer', fontSize: '0.82rem', fontFamily: "'DM Sans', sans-serif",
                    transition: 'all 0.15s', alignSelf: 'flex-start',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' }}
                >
                  Iniciá sesión para comentar
                </button>
              )}
            </div>

          </div>

          {/* Actions */}
          <div style={{
            display: 'flex', gap: '0.75rem',
            padding: '1.25rem 1.5rem', borderTop: '1px solid var(--border)',
          }}>
            <button
              onClick={handleSave}
              style={{
                background: 'var(--surface2)', color: saved ? 'var(--accent)' : 'var(--text)',
                border: `1px solid ${saved ? 'var(--accent)' : 'var(--border)'}`,
                padding: '0.65rem 1.25rem', borderRadius: 8,
                fontFamily: "'DM Sans', sans-serif", fontSize: '0.875rem',
                cursor: 'pointer', transition: 'border-color 0.2s',
                display: 'flex', alignItems: 'center', gap: '0.5rem',
              }}
            >
              🔖 {saved ? 'Guardado' : 'Guardar'}
            </button>
            <a
              href={article.url} target="_blank" rel="noopener noreferrer"
              style={{
                flex: 1, background: 'var(--accent)', color: '#0a0a0f',
                border: 'none', padding: '0.65rem 1.25rem', borderRadius: 8,
                fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: '0.875rem',
                cursor: 'pointer', textAlign: 'center', textDecoration: 'none',
                display: 'block', transition: 'opacity 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              Leer artículo original ↗
            </a>
          </div>
        </div>
      </div>

      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}

      <style>{`@keyframes slideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </>
  )
}

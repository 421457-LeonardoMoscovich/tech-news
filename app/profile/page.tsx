'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const CATEGORIES = [
  { id: 'AI',         label: 'AI',         color: 'var(--cat-ai)' },
  { id: 'WebDev',     label: 'WebDev',     color: 'var(--cat-webdev)' },
  { id: 'Security',   label: 'Security',   color: 'var(--cat-security)' },
  { id: 'OpenSource', label: 'OpenSource', color: 'var(--cat-opensource)' },
  { id: 'Hardware',   label: 'Hardware',   color: 'var(--cat-hardware)' },
  { id: 'Business',   label: 'Business',   color: 'var(--cat-business)' },
]

const AVATAR_COLORS = [
  'linear-gradient(135deg, #a78bfa, #e8ff47)',
  'linear-gradient(135deg, #34d399, #60a5fa)',
  'linear-gradient(135deg, #f87171, #fb923c)',
  'linear-gradient(135deg, #fb923c, #fbbf24)',
  'linear-gradient(135deg, #60a5fa, #a78bfa)',
  'linear-gradient(135deg, #e8ff47, #34d399)',
  'linear-gradient(135deg, #f472b6, #a78bfa)',
  'linear-gradient(135deg, #34d399, #fbbf24)',
]

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<{ id: string; email: string } | null>(null)
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[0])
  const [favCategories, setFavCategories] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.replace('/'); return }
      setUser({ id: data.user.id, email: data.user.email ?? '' })
    })
    fetch('/api/profile').then((r) => r.json()).then((data) => {
      if (data.display_name) setDisplayName(data.display_name)
      if (data.bio) setBio(data.bio)
      if (data.avatar_color) setAvatarColor(data.avatar_color)
      if (Array.isArray(data.favorite_categories)) setFavCategories(data.favorite_categories)
    })
  }, [router])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ display_name: displayName.trim() || null, bio: bio.trim() || null, avatar_color: avatarColor, favorite_categories: favCategories }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const initials = displayName ? displayName.slice(0, 2).toUpperCase() : user?.email?.slice(0, 2).toUpperCase() ?? ''

  return (
    <main style={{ maxWidth: 520, margin: '3rem auto', padding: '0 1.5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <a href="/" style={{
          fontSize: '0.8rem', color: 'var(--text-muted)', textDecoration: 'none',
          fontFamily: "'JetBrains Mono', monospace",
        }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
        >← volver</a>
      </div>

      <h1 style={{
        fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem',
        letterSpacing: 1, color: 'var(--text)', marginBottom: '0.25rem',
      }}>
        EDITAR PERFIL
      </h1>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
        {user?.email}
      </p>

      {/* Avatar preview */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: avatarColor,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.5rem', fontWeight: 700, color: '#0a0a0f',
          boxShadow: '0 0 0 3px var(--border)',
        }}>
          {initials}
        </div>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* Avatar color */}
        <div>
          <label style={{ fontSize: '0.75rem', fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-muted)', display: 'block', marginBottom: '0.6rem' }}>
            // COLOR DE AVATAR
          </label>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {AVATAR_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setAvatarColor(color)}
                style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: color, border: 'none', cursor: 'pointer',
                  outline: avatarColor === color ? '2px solid var(--accent)' : '2px solid transparent',
                  outlineOffset: 2, transition: 'outline 0.15s',
                }}
              />
            ))}
          </div>
        </div>

        {/* Display name */}
        <div>
          <label style={{ fontSize: '0.75rem', fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>
            // NOMBRE DE USUARIO
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={40}
            placeholder="Tu nombre o apodo"
            style={{
              width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)',
              borderRadius: 8, padding: '0.65rem 1rem', color: 'var(--text)',
              fontFamily: "'DM Sans', sans-serif", fontSize: '0.9rem', outline: 'none',
              boxSizing: 'border-box',
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
          />
        </div>

        {/* Bio */}
        <div>
          <label style={{ fontSize: '0.75rem', fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>
            // BIO
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={160}
            rows={3}
            placeholder="Contá algo sobre vos (máx. 160 caracteres)"
            style={{
              width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)',
              borderRadius: 8, padding: '0.65rem 1rem', color: 'var(--text)',
              fontFamily: "'DM Sans', sans-serif", fontSize: '0.9rem', outline: 'none',
              resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.6,
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
          />
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'right', marginTop: '0.25rem', fontFamily: "'JetBrains Mono', monospace" }}>
            {bio.length}/160
          </div>
        </div>

        {/* Categorías favoritas */}
        <div>
          <label style={{ fontSize: '0.75rem', fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>
            // CATEGORÍAS FAVORITAS
          </label>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.65rem' }}>
            Aparecerán en un tab "Para vos" en el feed principal.
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {CATEGORIES.map((cat) => {
              const active = favCategories.includes(cat.id)
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setFavCategories((prev) =>
                    active ? prev.filter((c) => c !== cat.id) : [...prev, cat.id]
                  )}
                  style={{
                    padding: '0.3rem 0.85rem', borderRadius: 20,
                    border: `1px solid ${active ? cat.color : 'var(--border)'}`,
                    background: active ? `${cat.color}22` : 'var(--surface2)',
                    color: active ? cat.color : 'var(--text-muted)',
                    fontSize: '0.78rem', fontFamily: "'JetBrains Mono', monospace",
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >
                  {active ? '✓ ' : ''}{cat.label}
                </button>
              )
            })}
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          style={{
            background: saved ? 'var(--surface2)' : 'var(--accent)',
            border: saved ? '1px solid var(--accent)' : 'none',
            color: saved ? 'var(--accent)' : '#0a0a0f',
            padding: '0.75rem 1.5rem', borderRadius: 8, cursor: saving ? 'default' : 'pointer',
            fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: '0.9rem',
            transition: 'all 0.2s', opacity: saving ? 0.7 : 1,
          }}
        >
          {saved ? '✓ Guardado' : saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>
    </main>
  )
}

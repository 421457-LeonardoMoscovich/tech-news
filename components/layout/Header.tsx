'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import AuthModal from '@/components/auth/AuthModal'

export default function Header() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [authOpen, setAuthOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [displayName, setDisplayName] = useState<string | null>(null)
  const [avatarColor, setAvatarColor] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  function handleSearch(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== 'Enter') return
    const q = query.trim()
    router.push(q ? `/?q=${encodeURIComponent(q)}` : '/')
  }

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      if (data.user) loadProfile(data.user.id)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
      if (session?.user) loadProfile(session.user.id)
      else { setDisplayName(null); setAvatarColor(null) }
    })
    return () => subscription.unsubscribe()
  }, [])

  async function loadProfile(userId: string) {
    const supabase = createClient()
    const { data } = await supabase
      .from('profiles')
      .select('display_name, avatar_color')
      .eq('id', userId)
      .single()
    if (data) {
      setDisplayName(data.display_name ?? null)
      setAvatarColor(data.avatar_color ?? null)
    }
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    setMenuOpen(false)
  }

  const initials = displayName
    ? displayName.slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() ?? ''

  const avatarStyle = avatarColor
    ? { background: avatarColor }
    : { background: 'linear-gradient(135deg, var(--accent), var(--accent2))' }

  return (
    <>
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(10,10,15,0.92)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
        padding: '0 2rem',
      }}>
        <div style={{
          maxWidth: 1400, margin: '0 auto',
          display: 'flex', alignItems: 'center', gap: '2rem', height: 64,
        }}>
          {/* Logo */}
          <a href="/" style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: '1.8rem', letterSpacing: 2,
            color: 'var(--accent)', textDecoration: 'none', flexShrink: 0,
          }}>
            TECH<span style={{ color: 'var(--text)' }}>NEWS</span>
          </a>

          {/* Search */}
          <div style={{
            flex: 1, maxWidth: 400, display: 'flex', alignItems: 'center', gap: '0.5rem',
            background: 'var(--surface2)', border: '1px solid var(--border)',
            borderRadius: 8, padding: '0.5rem 1rem', transition: 'border-color 0.2s',
          }}
            onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
          >
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>🔍</span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleSearch}
              placeholder="Buscar artículos, tecnologías, temas..."
              style={{
                background: 'none', border: 'none', outline: 'none',
                color: 'var(--text)', fontFamily: "'DM Sans', sans-serif",
                fontSize: '0.875rem', width: '100%',
              }}
            />
          </div>

          {/* Actions */}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <a
                  href="/saved"
                  style={{
                    fontSize: '0.875rem', color: 'var(--text-muted)',
                    textDecoration: 'none', transition: 'color 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                >
                  🔖 Guardados
                </a>

                {/* Avatar + dropdown */}
                <div ref={menuRef} style={{ position: 'relative' }}>
                  <div
                    onClick={() => setMenuOpen((o) => !o)}
                    title={user.email ?? ''}
                    style={{
                      width: 36, height: 36, borderRadius: '50%',
                      ...avatarStyle,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.8rem', fontWeight: 700, color: '#0a0a0f', cursor: 'pointer',
                      outline: menuOpen ? '2px solid var(--accent)' : 'none',
                      outlineOffset: 2, transition: 'outline 0.15s',
                    }}
                  >
                    {initials}
                  </div>

                  {menuOpen && (
                    <div style={{
                      position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                      background: 'var(--surface)', border: '1px solid var(--border)',
                      borderRadius: 10, minWidth: 180, zIndex: 200,
                      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                      overflow: 'hidden',
                      animation: 'slideUp 0.15s ease',
                    }}>
                      <div style={{
                        padding: '0.75rem 1rem',
                        borderBottom: '1px solid var(--border)',
                      }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text)' }}>
                          {displayName ?? user.email?.split('@')[0]}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>
                          {user.email}
                        </div>
                      </div>
                      <a
                        href="/profile"
                        onClick={() => setMenuOpen(false)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '0.6rem',
                          padding: '0.65rem 1rem', fontSize: '0.875rem',
                          color: 'var(--text-muted)', textDecoration: 'none',
                          transition: 'background 0.15s, color 0.15s',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface2)'; e.currentTarget.style.color = 'var(--text)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' }}
                      >
                        ✏️ Editar perfil
                      </a>
                      <button
                        onClick={handleSignOut}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center', gap: '0.6rem',
                          padding: '0.65rem 1rem', fontSize: '0.875rem',
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: 'var(--text-muted)', textAlign: 'left',
                          transition: 'background 0.15s, color 0.15s',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface2)'; e.currentTarget.style.color = 'var(--cat-security)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' }}
                      >
                        🚪 Cerrar sesión
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setAuthOpen(true)}
                  style={{
                    background: 'none', border: '1px solid var(--border)',
                    color: 'var(--text-muted)', padding: '0.4rem 1rem', borderRadius: 6,
                    cursor: 'pointer', fontSize: '0.875rem', fontFamily: "'DM Sans', sans-serif",
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent)'
                    e.currentTarget.style.color = 'var(--accent)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border)'
                    e.currentTarget.style.color = 'var(--text-muted)'
                  }}
                >
                  Iniciar sesión
                </button>
                <button
                  onClick={() => setAuthOpen(true)}
                  style={{
                    background: 'var(--accent)', border: 'none', color: '#0a0a0f',
                    padding: '0.4rem 1rem', borderRadius: 6, cursor: 'pointer',
                    fontSize: '0.875rem', fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
                  }}
                >
                  Registrarse
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
    </>
  )
}

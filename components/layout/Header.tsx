'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import AuthModal from '@/components/auth/AuthModal'

export default function Header() {
  const [user, setUser] = useState<User | null>(null)
  const [authOpen, setAuthOpen] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
  }

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? ''

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
                <div
                  onClick={handleSignOut}
                  title={`${user.email} — click para salir`}
                  style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.8rem', fontWeight: 700, color: '#0a0a0f', cursor: 'pointer',
                  }}
                >
                  {initials}
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

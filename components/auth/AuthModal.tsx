'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface AuthModalProps {
  onClose: () => void
}

export default function AuthModal({ onClose }: AuthModalProps) {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const supabase = createClient()

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setError(error.message); setLoading(false) }
      else { onClose(); router.refresh() }
    } else {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: `${location.origin}/auth/callback` },
      })
      if (error) { setError(error.message); setLoading(false) }
      else setSuccess(true)
    }
  }

  async function handleGoogle() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback` },
    })
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 16, width: 400, padding: '2rem',
          animation: 'slideUp 0.25s ease',
        }}
      >
        <div style={{
          fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.5rem',
          letterSpacing: 2, color: 'var(--accent)', marginBottom: '0.25rem',
        }}>
          TECH<span style={{ color: 'var(--text)' }}>NEWS</span>
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.75rem' }}>
          Guardá noticias, votá y comentá
        </div>

        {success ? (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📬</div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Revisá tu email <strong style={{ color: 'var(--text)' }}>{email}</strong> para confirmar tu cuenta.
            </p>
          </div>
        ) : (
          <>
            <button
              onClick={handleGoogle}
              style={{
                width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)',
                color: 'var(--text)', padding: '0.7rem', borderRadius: 8,
                fontFamily: "'DM Sans', sans-serif", fontSize: '0.875rem',
                cursor: 'pointer', display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem',
                transition: 'border-color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent2)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
            >
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              Continuar con Google
            </button>

            <div style={{
              display: 'flex', alignItems: 'center', gap: '1rem', margin: '1rem 0',
            }}>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>o con email</span>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com" required
                style={{
                  width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)',
                  color: 'var(--text)', padding: '0.65rem 1rem', borderRadius: 8,
                  fontFamily: "'DM Sans', sans-serif", fontSize: '0.875rem', outline: 'none',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
                onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
              />
              <input
                type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña" required minLength={6}
                style={{
                  width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)',
                  color: 'var(--text)', padding: '0.65rem 1rem', borderRadius: 8,
                  fontFamily: "'DM Sans', sans-serif", fontSize: '0.875rem', outline: 'none',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
                onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
              />
              {error && (
                <p style={{ fontSize: '0.8rem', color: 'var(--cat-security)', margin: 0 }}>{error}</p>
              )}
              <button
                type="submit" disabled={loading}
                style={{
                  width: '100%', background: 'var(--accent)', border: 'none',
                  color: '#0a0a0f', padding: '0.7rem', borderRadius: 8,
                  fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: '0.875rem',
                  cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? '...' : mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
              </button>
            </form>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '1rem' }}>
              {mode === 'login' ? (
                <>¿No tenés cuenta?{' '}
                  <button onClick={() => setMode('register')} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '0.8rem' }}>
                    Registrate
                  </button>
                </>
              ) : (
                <>¿Ya tenés cuenta?{' '}
                  <button onClick={() => setMode('login')} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '0.8rem' }}>
                    Iniciá sesión
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
      <style>{`@keyframes slideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  )
}

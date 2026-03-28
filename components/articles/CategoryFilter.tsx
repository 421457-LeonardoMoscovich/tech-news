'use client'

import { useRouter, useSearchParams } from 'next/navigation'

const CATEGORIES = [
  { value: '', label: 'Todos' },
  { value: 'AI', label: 'AI', color: 'var(--cat-ai)' },
  { value: 'WebDev', label: 'WebDev', color: 'var(--cat-webdev)' },
  { value: 'Security', label: 'Security', color: 'var(--cat-security)' },
  { value: 'OpenSource', label: 'Open Source', color: 'var(--cat-opensource)' },
  { value: 'Hardware', label: 'Hardware', color: 'var(--cat-hardware)' },
  { value: 'Business', label: 'Business', color: 'var(--cat-business)' },
]

export default function CategoryFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const active = searchParams.get('category') ?? ''

  function select(value: string) {
    const params = new URLSearchParams()
    if (value) params.set('category', value)
    router.push(params.toString() ? `/?${params}` : '/')
  }

  return (
    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>
      <span style={{
        fontSize: '0.75rem', color: 'var(--text-muted)', marginRight: '0.25rem',
        fontFamily: "'JetBrains Mono', monospace",
      }}>
        FILTRAR //
      </span>
      {CATEGORIES.map(({ value, label, color }) => {
        const isActive = active === value
        return (
          <button
            key={value}
            onClick={() => select(value)}
            style={{
              padding: '0.35rem 0.85rem', borderRadius: 20, cursor: 'pointer',
              fontSize: '0.8rem', fontFamily: "'DM Sans', sans-serif",
              transition: 'all 0.15s',
              background: isActive ? 'var(--surface2)' : 'none',
              border: `1px solid ${isActive ? (color ?? 'var(--accent)') : 'var(--border)'}`,
              color: isActive ? (color ?? 'var(--accent)') : 'var(--text-muted)',
            }}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}

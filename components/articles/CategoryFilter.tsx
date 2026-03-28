'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const CATEGORIES = [
  { value: '', label: 'Todos' },
  { value: 'AI', label: 'AI', color: 'var(--cat-ai)' },
  { value: 'WebDev', label: 'WebDev', color: 'var(--cat-webdev)' },
  { value: 'Security', label: 'Security', color: 'var(--cat-security)' },
  { value: 'OpenSource', label: 'Open Source', color: 'var(--cat-opensource)' },
  { value: 'Hardware', label: 'Hardware', color: 'var(--cat-hardware)' },
  { value: 'Business', label: 'Business', color: 'var(--cat-business)' },
]

const PARA_VOS = '__para_vos__'

export default function CategoryFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const active = searchParams.get('category') ?? ''
  const [favCategories, setFavCategories] = useState<string[]>([])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return
      fetch('/api/profile')
        .then((r) => r.json())
        .then((profile) => {
          if (Array.isArray(profile.favorite_categories) && profile.favorite_categories.length > 0) {
            setFavCategories(profile.favorite_categories)
          }
        })
    })
  }, [])

  function select(value: string) {
    const params = new URLSearchParams()
    if (value && value !== PARA_VOS) {
      params.set('category', value)
    } else if (value === PARA_VOS && favCategories.length > 0) {
      params.set('category', favCategories.join(','))
    }
    router.push(params.toString() ? `/?${params}` : '/')
  }

  const isParaVosActive = favCategories.length > 0 &&
    active === favCategories.join(',')

  return (
    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>
      <span style={{
        fontSize: '0.75rem', color: 'var(--text-muted)', marginRight: '0.25rem',
        fontFamily: "'JetBrains Mono', monospace",
      }}>
        FILTRAR //
      </span>

      {favCategories.length > 0 && (
        <button
          onClick={() => select(PARA_VOS)}
          style={{
            padding: '0.35rem 0.85rem', borderRadius: 20, cursor: 'pointer',
            fontSize: '0.8rem', fontFamily: "'DM Sans', sans-serif",
            transition: 'all 0.15s',
            background: isParaVosActive ? 'var(--surface2)' : 'none',
            border: `1px solid ${isParaVosActive ? 'var(--accent)' : 'rgba(232,255,71,0.3)'}`,
            color: isParaVosActive ? 'var(--accent)' : 'rgba(232,255,71,0.6)',
          }}
        >
          ⭐ Para vos
        </button>
      )}

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

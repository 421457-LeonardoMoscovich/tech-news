import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import ArticleFeed from '@/components/articles/ArticleFeed'
import CategoryFilter from '@/components/articles/CategoryFilter'
import TrendingStrip from '@/components/articles/TrendingStrip'

const PAGE_SIZE = 20

interface HomeProps {
  searchParams: Promise<{ category?: string; page?: string; q?: string }>
}

export default async function Home({ searchParams }: HomeProps) {
  const { category, page, q } = await searchParams
  const currentPage = Math.max(1, parseInt(page ?? '1', 10) || 1)

  const supabase = await createClient()
  const cats = category?.includes(',') ? category.split(',') : null
  let countQuery = supabase.from('articles').select('*', { count: 'exact', head: true })
  if (cats) countQuery = countQuery.in('category', cats)
  else if (category) countQuery = countQuery.eq('category', category)
  if (q) countQuery = countQuery.or(`title.ilike.%${q}%,summary.ilike.%${q}%`)
  const { count } = await countQuery
  const total = count ?? 0
  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <>
      {/* Live strip */}
      <div style={{
        background: 'linear-gradient(90deg, rgba(232,255,71,0.05), transparent)',
        borderBottom: '1px solid var(--border)',
        padding: '0.6rem 2rem',
      }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{
            background: 'var(--accent)', color: '#0a0a0f',
            fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem',
            fontWeight: 500, letterSpacing: 1, padding: '0.2rem 0.5rem', borderRadius: 3,
          }}>LIVE</span>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <span style={{ color: 'var(--text)' }}>{total} artículos</span> enriquecidos con IA
            {category && <> · Filtrando por <span style={{ color: 'var(--text)' }}>{category}</span></>}
          {q && <> · Búsqueda: <span style={{ color: 'var(--text)' }}>&ldquo;{q}&rdquo;</span></>}
          </div>
        </div>
      </div>

      {/* Main content */}
      <main style={{ maxWidth: 1400, margin: '0 auto', padding: '2rem' }}>
        {/* Category filter */}
        <Suspense fallback={null}>
          <CategoryFilter />
        </Suspense>

        {/* Trending */}
        <Suspense fallback={null}>
          <TrendingStrip />
        </Suspense>

        {/* Section header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
          marginBottom: '1.5rem',
        }}>
          <h2 style={{
            fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.4rem',
            letterSpacing: 1, color: 'var(--text)', margin: 0,
          }}>
            ÚLTIMAS NOTICIAS
          </h2>
          <span style={{
            fontSize: '0.8rem', color: 'var(--text-muted)',
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            {total} artículos · página {currentPage}/{totalPages || 1}
          </span>
        </div>

        {/* Feed */}
        <ArticleFeed category={category} page={currentPage} q={q} />
      </main>
    </>
  )
}

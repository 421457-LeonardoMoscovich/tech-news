import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import ArticleCard from './ArticleCard'

const PAGE_SIZE = 20

interface ArticleFeedProps {
  category?: string
  page?: number
  q?: string
}

export default async function ArticleFeed({ category, page = 1, q }: ArticleFeedProps) {
  const supabase = await createClient()
  const offset = (page - 1) * PAGE_SIZE

  const cats = category?.includes(',') ? category.split(',') : null

  let countQuery = supabase.from('articles').select('*', { count: 'exact', head: true })
  if (cats) countQuery = countQuery.in('category', cats)
  else if (category) countQuery = countQuery.eq('category', category)
  if (q) countQuery = countQuery.or(`title.ilike.%${q}%,summary.ilike.%${q}%`)
  const { count } = await countQuery

  let query = supabase
    .from('articles').select('*')
    .order('relevance_score', { ascending: false })
    .order('created_at', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1)
  if (cats) query = query.in('category', cats)
  else if (category) query = query.eq('category', category)
  if (q) query = query.or(`title.ilike.%${q}%,summary.ilike.%${q}%`)
  const { data: articles, error } = await query

  if (error) {
    return <p style={{ color: 'var(--cat-security)', fontSize: '0.875rem' }}>Error: {error.message}</p>
  }
  if (!articles || articles.length === 0) {
    return <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem 0' }}>No hay artículos disponibles.</p>
  }

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)
  const buildHref = (p: number) => {
    const params = new URLSearchParams()
    if (category) params.set('category', category)
    if (q) params.set('q', q)
    if (p > 1) params.set('page', String(p))
    const qs = params.toString()
    return qs ? `/?${qs}` : '/'
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Grid */}
      <div className="feed-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
          {page > 1 && (
            <Link href={buildHref(page - 1)} style={pageBtnStyle}>←</Link>
          )}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={buildHref(p)}
              style={{
                ...pageBtnStyle,
                background: p === page ? 'var(--surface2)' : 'var(--surface)',
                color: p === page ? 'var(--accent)' : 'var(--text-muted)',
                borderColor: p === page ? 'var(--accent)' : 'var(--border)',
              }}
            >
              {p}
            </Link>
          ))}
          {page < totalPages && (
            <Link href={buildHref(page + 1)} style={pageBtnStyle}>›</Link>
          )}
        </div>
      )}
    </div>
  )
}

const pageBtnStyle: React.CSSProperties = {
  width: 36, height: 36, borderRadius: 8,
  background: 'var(--surface)', border: '1px solid var(--border)',
  color: 'var(--text-muted)', fontSize: '0.85rem',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  textDecoration: 'none', transition: 'all 0.15s',
}

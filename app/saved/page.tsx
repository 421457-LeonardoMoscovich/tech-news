import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ArticleCard from '@/components/articles/ArticleCard'
import type { Article } from '@/types'

export const metadata = { title: 'Guardados — TechNews' }

export default async function SavedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/')

  const { data: saves } = await supabase
    .from('saved_articles')
    .select('article:articles(*)')
    .eq('user_id', user.id)
    .order('saved_at', { ascending: false })

  const articles = (saves ?? [])
    .map((s: { article: unknown }) => s.article)
    .filter(Boolean) as Article[]

  return (
    <main style={{ maxWidth: 1400, margin: '0 auto', padding: '2rem' }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        marginBottom: '1.5rem',
      }}>
        <h2 style={{
          fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.4rem',
          letterSpacing: 1, color: 'var(--text)', margin: 0,
        }}>
          ARTÍCULOS GUARDADOS
        </h2>
        <span style={{
          fontSize: '0.8rem', color: 'var(--text-muted)',
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          {articles.length} {articles.length === 1 ? 'artículo' : 'artículos'}
        </span>
      </div>

      {articles.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '4rem 0',
          color: 'var(--text-muted)', fontSize: '0.9rem',
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔖</div>
          <p>No guardaste ningún artículo todavía.</p>
          <p style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
            Hacé click en 🔖 dentro de cualquier artículo para guardarlo.
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1.25rem',
        }}>
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </main>
  )
}

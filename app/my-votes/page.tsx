import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ArticleCard from '@/components/articles/ArticleCard'
import type { Article } from '@/types'

export const metadata = { title: 'Mis puntajes — TechNews' }

const STARS = ['', '★', '★★', '★★★', '★★★★', '★★★★★']

export default async function MyVotesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/')

  const { data: votes } = await supabase
    .from('votes')
    .select('value, created_at, article:articles(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const entries = (votes ?? [])
    .map((v: { value: number; created_at: string; article: unknown }) => ({
      article: v.article as Article,
      value: v.value,
      created_at: v.created_at,
    }))
    .filter((e) => e.article)

  const avg = entries.length
    ? (entries.reduce((sum, e) => sum + e.value, 0) / entries.length).toFixed(1)
    : null

  // Group by score
  const byScore: Record<number, typeof entries> = { 5: [], 4: [], 3: [], 2: [], 1: [] }
  for (const e of entries) byScore[e.value]?.push(e)

  return (
    <main style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '0.75rem' }}>
        <a href="/" style={{
          fontSize: '0.8rem', color: 'var(--text-muted)', textDecoration: 'none',
          fontFamily: "'JetBrains Mono', monospace",
        }}>← volver</a>
      </div>

      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        marginBottom: '2rem',
      }}>
        <h2 style={{
          fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.4rem',
          letterSpacing: 1, color: 'var(--text)', margin: 0,
        }}>
          MIS PUNTAJES
        </h2>
        <span style={{
          fontSize: '0.8rem', color: 'var(--text-muted)',
          fontFamily: "'JetBrains Mono', monospace',",
        }}>
          {entries.length} {entries.length === 1 ? 'artículo' : 'artículos'} puntuados
          {avg && <> · promedio {avg}/5</>}
        </span>
      </div>

      {entries.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⭐</div>
          <p>Todavía no puntuaste ningún artículo.</p>
          <p style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
            Abrí cualquier artículo y usá las estrellas para puntuarlo.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          {[5, 4, 3, 2, 1].map((score) => {
            const group = byScore[score]
            if (!group || group.length === 0) return null
            return (
              <section key={score}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  marginBottom: '1rem', paddingBottom: '0.5rem',
                  borderBottom: '1px solid var(--border)',
                }}>
                  <span style={{
                    fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem',
                    color: score >= 4 ? 'var(--accent)' : 'var(--text-muted)',
                    letterSpacing: 1,
                  }}>
                    {STARS[score]} {score}/5
                  </span>
                  <span style={{
                    fontSize: '0.72rem', color: 'var(--text-muted)',
                    fontFamily: "'JetBrains Mono', monospace",
                  }}>
                    ({group.length} {group.length === 1 ? 'artículo' : 'artículos'})
                  </span>
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: '1.25rem',
                }}>
                  {group.map(({ article }) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      )}
    </main>
  )
}

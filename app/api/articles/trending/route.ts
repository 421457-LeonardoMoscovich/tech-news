import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('votes')
    .select('article_id, articles(*)')
    .gte('created_at', new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString())

  if (error) return NextResponse.json([], { status: 200 })

  // Count votes per article
  const counts: Record<string, { article: unknown; count: number }> = {}
  for (const row of data ?? []) {
    const id = row.article_id
    if (!counts[id]) counts[id] = { article: row.articles, count: 0 }
    counts[id].count++
  }

  const sorted = Object.values(counts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  if (sorted.length < 3) return NextResponse.json([])

  return NextResponse.json(sorted.map((e) => ({ ...(e.article as object), vote_count: e.count })))
}

import { NextResponse, type NextRequest } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { orchestrate } from '@/agents/orchestrator'
import type { ChatMessage } from '@/types'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const messages: ChatMessage[] = body.messages ?? []

  if (!messages.length) {
    return NextResponse.json({ error: 'messages required' }, { status: 400 })
  }

  const supabase = await createServerClient()

  // Fetch last 50 articles as context
  const { data: articles } = await supabase
    .from('articles')
    .select('id, title, url, summary, category, source, tags, relevance_score, published_at, created_at, context, key_points, why_it_matters, related_topics')
    .order('relevance_score', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(50)

  // Fetch saved articles if user is logged in
  let savedArticles = undefined
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const { data: saves } = await supabase
      .from('saved_articles')
      .select('article:articles(id, title, url, summary, category, source)')
      .eq('user_id', user.id)
      .limit(20)

    if (saves) {
      savedArticles = saves.map((s: { article: unknown }) => s.article).filter(Boolean)
    }
  }

  const stream = await orchestrate({
    messages,
    articles: articles ?? [],
    savedArticles: savedArticles as typeof articles ?? undefined,
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}

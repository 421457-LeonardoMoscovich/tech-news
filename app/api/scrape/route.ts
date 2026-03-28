import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { scrapeArticles } from '@/agents/scraper'
import { enrichArticle } from '@/agents/enricher'

export const maxDuration = 300 // 5 min — Vercel Pro limit for long-running scrapes

// Vercel cron jobs call with GET; manual triggers use POST. Both paths share the same logic.
export async function GET(request: NextRequest) {
  return POST(request)
}

export async function POST(request: NextRequest) {
  // Verify cron secret
  const auth = request.headers.get('authorization')
  const expected = `Bearer ${process.env.CRON_SECRET}`
  if (!auth || auth !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Fetch existing URLs to avoid duplicates
  const { data: existing } = await supabase.from('articles').select('url')
  const existingUrls = (existing ?? []).map((r: { url: string }) => r.url)

  // Scrape new articles
  let rawArticles
  try {
    rawArticles = await scrapeArticles(existingUrls)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('Scraper error:', message)
    return NextResponse.json({ error: 'Scraper failed', detail: message }, { status: 500 })
  }

  let inserted = 0
  const skipped = existingUrls.length

  for (const raw of rawArticles) {
    let enrichment
    try {
      enrichment = await enrichArticle(raw)
    } catch (err) {
      console.error(`Enricher error for "${raw.title}":`, err instanceof Error ? err.message : err)
      continue
    }
    if (!enrichment) continue

    const { error } = await supabase.from('articles').insert({
      title: raw.title,
      url: raw.url,
      source: raw.source,
      published_at: raw.published_at,
      summary: enrichment.summary,
      category: enrichment.category,
      tags: enrichment.tags,
      relevance_score: enrichment.relevance_score,
      context: enrichment.context,
      key_points: enrichment.key_points,
      why_it_matters: enrichment.why_it_matters,
      related_topics: enrichment.related_topics,
    })

    if (!error) inserted++
    else console.error('Insert error for', raw.url, error.message)
  }

  return NextResponse.json({ inserted, skipped })
}

import type { RawArticle } from '@/types'

const NEWS_API_URL = 'https://newsapi.org/v2/top-headlines'
const TECH_QUERIES = [
  { q: 'artificial intelligence OR machine learning', category: 'technology' },
  { q: 'web development OR javascript OR typescript', category: 'technology' },
  { q: 'cybersecurity OR hacking OR data breach', category: 'technology' },
  { q: 'open source OR github OR linux', category: 'technology' },
  { q: 'hardware OR chip OR semiconductor', category: 'technology' },
]

export async function scrapeArticles(existingUrls: string[]): Promise<RawArticle[]> {
  const apiKey = process.env.NEWS_API_KEY
  if (!apiKey) throw new Error('NEWS_API_KEY is not set')

  const existingSet = new Set(existingUrls)
  const seen = new Set<string>()
  const articles: RawArticle[] = []

  // Fetch tech headlines + targeted queries in parallel
  const requests = [
    fetch(`${NEWS_API_URL}?category=technology&language=en&pageSize=20&apiKey=${apiKey}`),
    ...TECH_QUERIES.map(({ q }) =>
      fetch(
        `https://newsapi.org/v2/everything?q=${encodeURIComponent(q)}&language=en&sortBy=publishedAt&pageSize=10&apiKey=${apiKey}`
      )
    ),
  ]

  const responses = await Promise.all(requests)
  const bodies = await Promise.all(responses.map((r) => r.json()))

  for (const body of bodies) {
    if (body.status !== 'ok') continue
    for (const item of body.articles ?? []) {
      const url: string = item.url ?? ''
      if (!url || url === '[Removed]') continue
      if (existingSet.has(url) || seen.has(url)) continue
      seen.add(url)
      articles.push({
        title: item.title ?? 'Sin título',
        url,
        source: item.source?.name ?? 'Unknown',
        published_at: item.publishedAt ?? null,
      })
    }
  }

  return articles
}

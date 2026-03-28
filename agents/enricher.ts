import Groq from 'groq-sdk'
import type { RawArticle } from '@/types'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

type EnrichmentResult = {
  summary: string
  category: 'AI' | 'WebDev' | 'Security' | 'OpenSource' | 'Hardware' | 'Business'
  tags: string[]
  relevance_score: number
  context: string
  key_points: string[]
  why_it_matters: string
  related_topics: string[]
}

export async function enrichArticle(article: RawArticle): Promise<EnrichmentResult | null> {
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `Analyze this tech article and return a JSON object. Respond with ONLY the JSON, no other text.

Title: ${article.title}
URL: ${article.url}
Source: ${article.source}

Return this exact JSON shape:
{
  "summary": "2-3 sentence summary in Spanish explaining what the article is about and why it matters",
  "category": "one of: AI, WebDev, Security, OpenSource, Hardware, Business",
  "tags": ["3 to 5 relevant lowercase tags"],
  "relevance_score": <integer 1-10, where 10 is highly relevant breaking tech news>,
  "context": "2-3 sentences in Spanish with deeper background context about this story",
  "key_points": ["4 concise key points in Spanish about this article"],
  "why_it_matters": "1-2 sentences in Spanish explaining the broader impact or significance",
  "related_topics": ["3 to 5 related topic names as short strings"]
}`,
      },
    ],
  })

  const text = completion.choices[0]?.message?.content ?? ''

  try {
    const raw = text.replace(/```json\n?|\n?```/g, '').trim()
    const parsed = JSON.parse(raw) as EnrichmentResult

    const validCategories = ['AI', 'WebDev', 'Security', 'OpenSource', 'Hardware', 'Business']
    if (!validCategories.includes(parsed.category)) parsed.category = 'AI'
    parsed.relevance_score = Math.min(10, Math.max(1, Math.round(parsed.relevance_score)))
    if (!Array.isArray(parsed.key_points)) parsed.key_points = []
    if (!Array.isArray(parsed.related_topics)) parsed.related_topics = []

    return parsed
  } catch (err) {
    console.error(`Enricher: failed to parse response for "${article.title}"`, err)
    return null
  }
}

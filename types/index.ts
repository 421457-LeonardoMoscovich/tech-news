// Raw article as returned by the Scraper agent
export interface RawArticle {
  title: string
  url: string
  source: string
  published_at: string | null
}

// Output of the Enricher agent (before DB insert)
export interface EnrichedArticle extends RawArticle {
  summary: string
  category: 'AI' | 'WebDev' | 'Security' | 'OpenSource' | 'Hardware' | 'Business'
  tags: string[]
  relevance_score: number
  context: string
  key_points: string[]
  why_it_matters: string
  related_topics: string[]
}

// Full shape of the articles table
export interface Article {
  id: string
  title: string
  url: string
  summary: string | null
  category: 'AI' | 'WebDev' | 'Security' | 'OpenSource' | 'Hardware' | 'Business' | null
  tags: string[] | null
  relevance_score: number | null
  source: string | null
  published_at: string | null
  created_at: string
  // Detail fields (level 2 modal)
  context: string | null
  key_points: string[] | null
  why_it_matters: string | null
  related_topics: string[] | null
}

// saved_articles joined with article data
export interface SavedArticle {
  id: string
  user_id: string
  article_id: string
  saved_at: string
  article: Article
}

// votes table
export interface Vote {
  id: string
  user_id: string
  article_id: string
  value: number
  created_at: string
}

// comments table
export interface Comment {
  id: string
  user_id: string
  article_id: string
  body: string
  created_at: string
  author_email?: string
}

// Chat message for the Orchestrator agent
export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const article_id = request.nextUrl.searchParams.get('article_id')
  const category = request.nextUrl.searchParams.get('category')

  if (!article_id || !category) {
    return NextResponse.json({ error: 'article_id and category required' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('category', category)
    .neq('id', article_id)
    .order('relevance_score', { ascending: false })
    .limit(3)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

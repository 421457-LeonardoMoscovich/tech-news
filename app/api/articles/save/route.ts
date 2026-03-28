import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { article_id } = await request.json()
  if (!article_id) return NextResponse.json({ error: 'article_id required' }, { status: 400 })

  const { error } = await supabase.from('saved_articles').upsert(
    { user_id: user.id, article_id },
    { onConflict: 'user_id,article_id' }
  )

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { article_id } = await request.json()
  if (!article_id) return NextResponse.json({ error: 'article_id required' }, { status: 400 })

  const { error } = await supabase.from('saved_articles')
    .delete()
    .eq('user_id', user.id)
    .eq('article_id', article_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

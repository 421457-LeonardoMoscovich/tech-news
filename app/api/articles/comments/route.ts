import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const article_id = request.nextUrl.searchParams.get('article_id')
  if (!article_id) return NextResponse.json({ error: 'article_id required' }, { status: 400 })

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('comments')
    .select('id, body, created_at, user_id')
    .eq('article_id', article_id)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { article_id, body } = await request.json()
  if (!article_id || !body?.trim()) {
    return NextResponse.json({ error: 'article_id and body required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('comments')
    .insert({ user_id: user.id, article_id, body: body.trim() })
    .select('id, body, created_at, user_id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { comment_id } = await request.json()
  if (!comment_id) return NextResponse.json({ error: 'comment_id required' }, { status: 400 })

  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', comment_id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

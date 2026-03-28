-- ============================================================
-- Tech Blog — Schema completo
-- Ejecutar en: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- ── 1. TABLAS ─────────────────────────────────────────────

create table if not exists articles (
  id              uuid        primary key default gen_random_uuid(),
  title           text        not null,
  url             text        unique not null,
  summary         text,
  category        text        check (category in ('AI','WebDev','Security','OpenSource','Hardware','Business')),
  tags            text[],
  relevance_score int         check (relevance_score between 1 and 10),
  source          text,
  published_at    timestamptz,
  created_at      timestamptz default now()
);

create table if not exists saved_articles (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        references auth.users(id) on delete cascade,
  article_id uuid        references articles(id)   on delete cascade,
  saved_at   timestamptz default now(),
  unique(user_id, article_id)
);

create table if not exists votes (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        references auth.users(id) on delete cascade,
  article_id uuid        references articles(id)   on delete cascade,
  value      int         check (value between 1 and 5),
  created_at timestamptz default now(),
  unique(user_id, article_id)
);

create table if not exists comments (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        references auth.users(id) on delete cascade,
  article_id uuid        references articles(id)   on delete cascade,
  body       text        not null,
  created_at timestamptz default now()
);

-- ── 2. ÍNDICE FULL-TEXT SEARCH ────────────────────────────

create index if not exists articles_fts_idx
  on articles
  using gin (
    to_tsvector(
      'spanish',
      coalesce(title, '') || ' ' || coalesce(summary, '')
    )
  );

-- ── 3. RLS — HABILITAR ────────────────────────────────────

alter table articles       enable row level security;
alter table saved_articles enable row level security;
alter table votes          enable row level security;
alter table comments       enable row level security;

-- ── 4. RLS — POLÍTICAS ────────────────────────────────────

-- articles: lectura pública, sin escritura desde el cliente
drop policy if exists "Public read articles" on articles;
create policy "Public read articles" on articles
  for select using (true);

-- saved_articles: cada usuario gestiona los suyos
drop policy if exists "Users manage own saves" on saved_articles;
create policy "Users manage own saves" on saved_articles
  using     (auth.uid() = user_id)
  with check(auth.uid() = user_id);

-- votes: cada usuario gestiona los suyos
drop policy if exists "Users manage own votes" on votes;
create policy "Users manage own votes" on votes
  using     (auth.uid() = user_id)
  with check(auth.uid() = user_id);

-- comments: lectura pública
drop policy if exists "Public read comments" on comments;
create policy "Public read comments" on comments
  for select using (true);

-- comments: cada usuario escribe los suyos
drop policy if exists "Users write own comments" on comments;
create policy "Users write own comments" on comments
  for insert with check (auth.uid() = user_id);

-- comments: cada usuario borra los suyos
drop policy if exists "Users delete own comments" on comments;
create policy "Users delete own comments" on comments
  for delete using (auth.uid() = user_id);

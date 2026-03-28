# tasks/todo.md — Tech Blog Build Plan

## Phase 0: Project Setup ✓
- [x] Init Next.js 14 project with TypeScript and App Router (`npx create-next-app@latest`)
- [x] Install dependencies: `@supabase/supabase-js @supabase/ssr @anthropic-ai/sdk`
- [x] Install UI deps: `tailwindcss lucide-react clsx`
- [x] Create `.env.local` with all required variables (see CLAUDE.md)
- [x] Create `vercel.json` with cron job config
- [x] Create `types/index.ts` with shared TypeScript interfaces

## Phase 1: Database & Auth (Supabase)
- [x] Create Supabase project
- [x] Run SQL to create all 4 tables: `articles`, `saved_articles`, `votes`, `comments`
- [x] Apply all RLS policies for every table (see CLAUDE.md schema section)
- [x] Create full-text search index on `articles(title, summary)`
- [ ] Enable Google OAuth provider in Supabase dashboard
- [ ] Configure email templates for verification in Supabase dashboard
- [x] Create `lib/supabase/client.ts` (browser client)
- [x] Create `lib/supabase/server.ts` (server client with cookies)
- [x] Create `lib/auth/middleware.ts` — protect `/saved` and `/profile` routes

## Phase 2: Auth UI
- [x] Create `app/auth/login/page.tsx` — email + Google login
- [x] Create `app/auth/register/page.tsx` — email registration
- [x] Create `app/auth/callback/route.ts` — handles OAuth + email OTP redirects
- [x] Create `components/auth/LoginForm.tsx`
- [x] Create `components/auth/RegisterForm.tsx`
- [x] Update `app/layout.tsx` — metadata TechNews, lang=es
- [ ] Verify: register with email → receive verification mail → confirm → logged in
- [ ] Verify: login with Google → OAuth flow → logged in
- [ ] Verify: middleware blocks `/saved` and `/profile` for unauthenticated users

## Phase 3: AI Agents ✓
- [x] Create `agents/scraper.ts`
- [x] Create `agents/enricher.ts`
- [x] Create `agents/orchestrator.ts`
- [x] Create `app/api/scrape/route.ts`
- [x] Create `app/api/chat/route.ts`
- [ ] Verify: POST `/api/scrape` inserts enriched articles into DB

## Phase 4: Article Feed & Search
- [ ] Create `app/api/search/route.ts` — GET with `?q=` param, uses Supabase full-text search
- [ ] Create `components/articles/ArticleCard.tsx`
- [ ] Create `components/articles/ArticleFeed.tsx` — paginated, 20 per page
- [ ] Create `components/articles/CategoryFilter.tsx`
- [ ] Create `components/search/SearchBar.tsx`
- [ ] Create `app/page.tsx` — home feed with category filter + search bar
- [ ] Create `app/search/page.tsx` — search results page
- [ ] Create `components/layout/Header.tsx` — nav + SearchBar + auth status indicator
- [ ] Create `components/layout/Footer.tsx`
- [ ] Verify: feed loads articles, filter by category works, search returns results

## Phase 5: Social Features (Auth Required)
- [ ] Create `app/api/articles/save/route.ts` — POST to save, DELETE to unsave
- [ ] Create `app/api/articles/vote/route.ts` — POST `{ article_id, value }`
- [ ] Create `app/api/articles/comment/route.ts`
  - POST: runs moderation check via Claude before saving
  - DELETE: only allows user to delete their own comments
- [ ] Create `components/social/SaveButton.tsx` — toggle, shows saved state
- [ ] Create `components/social/VoteWidget.tsx` — 1-5 stars, shows avg + user's vote
- [ ] Create `components/social/CommentSection.tsx` — list + form
- [ ] Create `app/article/[id]/page.tsx` — full article + social components
- [ ] Create `app/saved/page.tsx` — user's saved articles
- [ ] Create `app/profile/page.tsx` — user's comment history + vote history
- [ ] Verify: save/unsave toggles correctly in DB
- [ ] Verify: vote persists and average updates
- [ ] Verify: comment moderation blocks harmful content, saves clean content
- [ ] Verify: only own comments can be deleted

## Phase 6: Chat Widget
- [ ] Create `components/chat/ChatWidget.tsx`
  - Floating button bottom-right corner
  - Opens chat panel
  - Streams response from `/api/chat`
  - Shows article context chips if relevant
- [ ] Integrate ChatWidget into root layout
- [ ] Verify: chat answers questions about recent articles
- [ ] Verify: chat for logged-in user references saved articles

## Phase 7: Polish & Deploy
- [ ] Run full auth flow end-to-end (email + Google)
- [ ] Run scraper manually and verify articles appear in feed
- [ ] Test all social features while logged in and logged out
- [ ] Test search with multiple queries
- [ ] Test chat with article-related and general tech questions
- [ ] Check all RLS policies are correctly blocking unauthorized access
- [ ] Deploy to Vercel
- [ ] Set all environment variables in Vercel dashboard
- [ ] Verify cron job is scheduled in Vercel
- [ ] Trigger first scrape manually in production

---

## Review Section
_(To be filled as phases are completed)_

---

## Known Risks
- Google OAuth requires correct redirect URL configured in both Supabase and Google Console
- Vercel cron jobs only run on Pro plan or with Hobby plan limits — verify before relying on them
- Anthropic `web_search` tool availability depends on model used — use `claude-sonnet-4-20250514`
- Supabase free tier has 500MB DB limit and 2GB bandwidth — sufficient for MVP

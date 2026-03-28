# TechNews

Agregador de noticias tech enriquecidas con IA. Scraping automático via NewsAPI, análisis y categorización con Groq (llama-3.3-70b), y chat de asistente en tiempo real.

## Stack

- **Frontend**: Next.js 16 (App Router), TypeScript, CSS variables
- **Backend**: Supabase (Postgres + Auth + RLS)
- **IA**: Groq SDK — llama-3.3-70b-versatile
- **Scraping**: NewsAPI
- **Deploy**: Vercel

## Variables de entorno

Crear `.env.local` con:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GROQ_API_KEY=
NEWS_API_KEY=
CRON_SECRET=          # string aleatorio, ej: openssl rand -hex 32
```

Las mismas variables deben estar configuradas en **Vercel → Settings → Environment Variables**.

## Scraping automático

El scraping corre de dos formas:

| Scheduler | Frecuencia | Configuración |
|-----------|-----------|---------------|
| Vercel Cron (plan Hobby) | 1× día a las 9:00 UTC | `vercel.json` |
| GitHub Actions | Cada 6 horas | `.github/workflows/scrape.yml` |

### Configurar GitHub Actions

1. Ir a **GitHub → Settings → Secrets and variables → Actions**
2. Agregar secret: `CRON_SECRET` con el mismo valor que en Vercel
3. Verificar que la URL en `.github/workflows/scrape.yml` sea la correcta:
   ```
   https://tech-news.vercel.app/api/scrape   ← reemplazar si la URL es distinta
   ```

El workflow también se puede disparar manualmente desde la pestaña **Actions** de GitHub.

## DB migrations

Ejecutar en **Supabase → SQL Editor** antes del primer deploy:

```sql
-- Campos para el modal expandido (nivel 2)
alter table articles add column if not exists context text;
alter table articles add column if not exists key_points text[];
alter table articles add column if not exists why_it_matters text;
alter table articles add column if not exists related_topics text[];
```

El archivo completo está en `database/add-detail-fields.sql`.

## Desarrollo local

```bash
npm install
npm run dev
```

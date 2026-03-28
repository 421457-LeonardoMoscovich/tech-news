-- Agregar campos de detalle para el nivel 2 del modal
-- Ejecutar en: Supabase Dashboard → SQL Editor

alter table articles add column if not exists context text;
alter table articles add column if not exists key_points text[];
alter table articles add column if not exists why_it_matters text;
alter table articles add column if not exists related_topics text[];

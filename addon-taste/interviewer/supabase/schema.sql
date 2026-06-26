-- Table de réception des fiches produites par l'intervieweur de goût.
-- À exécuter dans le SQL editor de ton projet Supabase.
-- (Le service role bypasse la RLS ; on garde RLS ON + zéro policy publique,
--  donc rien n'est lisible côté client — seul le serveur, via service role, écrit.)

create table if not exists public.fiches (
  id          uuid primary key default gen_random_uuid(),
  agent       text not null,
  interviewer text,
  fiche       text not null,
  transcript  text,
  created_at  timestamptz not null default now()
);

alter table public.fiches enable row level security;
-- Pas de policy => inaccessible via la clé publique. Le serveur écrit via service role.

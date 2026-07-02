-- Schéma de l'intervieweur de goût — modèle « espace perso » (une personne → N profils).
-- À jouer dans le SQL editor de Supabase, ou : psql "$POSTGRES_URL" -f supabase/schema.sql
-- (RLS ON + zéro policy publique → seul le serveur, via service role / connexion directe, accède.)

-- Migration depuis l'ancien modèle (tables vides à ce stade) :
drop table if exists public.fiches;
drop table if exists public.profiles;

-- 1) Personne = identité (prénom) + PIN. Le PIN ouvre l'espace de la personne.
create table if not exists public.persons (
  name       text primary key,
  pin_hash   text not null,
  created_at timestamptz not null default now()
);

-- 2) Profil = (personne × agent). Accumule les inputs des 3 temps + porte la dernière fiche.
--    Statut dérivé côté app : fiche_version>0 → fait ; inputs présents → en cours ; sinon vide.
create table if not exists public.profiles (
  person        text not null references public.persons(name) on delete cascade,
  agent         text not null,
  transcript    text not null default '',
  verdicts      jsonb not null default '[]'::jsonb,   -- classification (garde/jette/recombine + raison)
  injections    jsonb not null default '[]'::jsonb,   -- artefacts apportés (métadonnées, sans base64)
  fiche         text,
  fiche_version integer not null default 0,
  updated_at    timestamptz not null default now(),
  primary key (person, agent)
);

alter table public.persons  enable row level security;
alter table public.profiles enable row level security;

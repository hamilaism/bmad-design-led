-- Tables de l'intervieweur de goût. À exécuter dans le SQL editor de ton projet Supabase.
-- (Le service role bypasse la RLS ; on garde RLS ON + zéro policy publique,
--  donc rien n'est lisible côté client — seul le serveur, via service role, écrit/lit.)

-- 1) Réception des fiches produites.
create table if not exists public.fiches (
  id             uuid primary key default gen_random_uuid(),
  agent          text not null,
  interviewer    text,
  fiche          text not null,
  transcript     text,
  classification jsonb,        -- verdicts garde/jette/recombine sur les artefacts (révélé)
  injection      jsonb,        -- artefacts apportés par la personne (fétiche / bête-noire)
  created_at     timestamptz not null default now()
);
-- Migration si la table existe déjà (sans ces colonnes) :
alter table public.fiches add column if not exists classification jsonb;
alter table public.fiches add column if not exists injection jsonb;

-- 2) Verrou de profil : un PIN (hashé) par couple (agent, personne).
--    Identifie + protège une personnalité : rouvrir/enrichir exige le bon code.
create table if not exists public.profiles (
  agent      text not null,
  person     text not null,
  pin_hash   text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (agent, person)
);

alter table public.fiches   enable row level security;
alter table public.profiles enable row level security;
-- Pas de policy => inaccessible via la clé publique. Le serveur écrit/lit via service role.

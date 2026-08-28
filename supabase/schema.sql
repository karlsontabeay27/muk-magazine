-- =====================================================================
-- MUK — schéma Supabase
-- À coller dans Supabase > SQL Editor > New query, puis Run.
--
-- La table s'appelle `contenus` et non `articles` : MUK publie dix formats
-- (§10 de la fiche éditoriale), l'article n'en est qu'un. Le champ `format`
-- porte cette distinction, et `blocs` accueillera les données propres à
-- chaque format — pistes d'une playlist, date et lieu d'un événement,
-- questions d'une interview — sans jamais imposer de migration.
-- =====================================================================

create extension if not exists "pgcrypto";

create table if not exists public.contenus (
  id               uuid primary key default gen_random_uuid(),

  -- Bilingue : un contenu et sa traduction sont deux lignes distinctes,
  -- reliées par un même groupe_id. Un article peut donc sortir en français
  -- puis être traduit plus tard, avec un slug propre à chaque langue.
  langue           text not null default 'fr' check (langue in ('fr','en')),
  groupe_id        uuid not null default gen_random_uuid(),

  -- Le slug n'est unique qu'à l'intérieur d'une langue (contrainte plus bas).
  slug             text not null,
  titre            text not null,
  chapeau          text not null default '',
  contenu          text not null default '',
  couverture       text,
  galerie          text[] not null default '{}',

  rubrique         text not null default 'culture'
                     check (rubrique in ('culture','fashion','sound','ideas','people','city')),
  format           text not null default 'article'
                     check (format in ('article','interview','portrait','tribune','essai',
                                       'photo','ofotd','playlist','video','guide','evenement')),

  auteur           text not null default 'MUK',
  humeur           text,                     -- facultatif : null = aucun bitmoji
  statut           text not null default 'brouillon'
                     check (statut in ('brouillon','publie')),
  a_la_une         boolean not null default false,
  pieces_tenue     text[] not null default '{}',

  -- Réservé aux formats à venir (playlist, vidéo, événement…). Vide pour
  -- l'instant : la colonne existe pour que l'ajout d'un format ne demande
  -- aucune migration.
  blocs            jsonb not null default '{}'::jsonb,

  date_publication timestamptz not null default now(),
  date_creation    timestamptz not null default now(),
  date_maj         timestamptz not null default now()
);

-- Deux langues peuvent porter le même slug : ce sont deux URL distinctes.
create unique index if not exists contenus_slug_langue_idx
  on public.contenus (langue, slug);

-- Une seule traduction par langue et par groupe : sans cette contrainte, un
-- double clic sur « traduire » créerait deux versions anglaises du même texte.
create unique index if not exists contenus_groupe_langue_idx
  on public.contenus (groupe_id, langue);

-- La page d'accueil lit les contenus publiés d'une langue, triés par date.
create index if not exists contenus_publication_idx
  on public.contenus (langue, statut, date_publication desc);

-- Les pages de rubrique filtrent sur rubrique + langue + statut.
create index if not exists contenus_rubrique_idx
  on public.contenus (langue, rubrique, statut, date_publication desc);

-- RLS activé et AUCUNE politique : seule la clé secrète (côté serveur, dans
-- lib/db-supabase.js) traverse. La clé publique ne peut rien lire ni écrire
-- directement — tout passe par les routes d'API de Next.
alter table public.contenus enable row level security;

-- ---------------------------------------------------------------------
-- Newsletter (§11 — la communauté)
-- ---------------------------------------------------------------------
create table if not exists public.abonnes (
  id                uuid primary key default gen_random_uuid(),
  email             text not null unique,
  langue            text not null default 'fr' check (langue in ('fr','en')),
  -- Passe à true quand l'inscrit clique le lien de confirmation. Le double
  -- opt-in est obligatoire pour une liste de diffusion en France.
  confirme          boolean not null default false,
  date_inscription  timestamptz not null default now()
);

alter table public.abonnes enable row level security;

-- ---------------------------------------------------------------------
-- Stockage des images
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('medias', 'medias', true)
on conflict (id) do nothing;

-- Bucket public en lecture : les images d'un média sont faites pour être
-- vues. L'écriture reste réservée à la clé secrète.
drop policy if exists "Lecture publique des medias" on storage.objects;
create policy "Lecture publique des medias"
  on storage.objects for select
  using (bucket_id = 'medias');

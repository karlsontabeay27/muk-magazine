# MUK

Média culturel générationnel — site éditorial et back-office de rédaction,
dans un seul projet Next.js.

> MUK is not just a magazine. It is a cultural movement.

---

## Démarrer

```bash
npm install
cp .env.example .env.local
npm run dev
```

Le site tourne sur <http://localhost:3100>, la rédaction sur
<http://localhost:3100/admin> (mot de passe par défaut : `marilyse`, à changer
dans `.env.local`).

Neuf contenus de démonstration sont en place, au moins un par rubrique.
Pour les remettre à zéro : `npm run seed`.

---

## Le modèle de contenu

C'est la décision structurante du projet, prise pour répondre au §13 de la
fiche éditoriale : *« éviter de construire un site uniquement pensé pour
publier des articles »*.

Un contenu porte **deux axes indépendants** :

- une **rubrique** — de quoi ça parle : `culture`, `fashion`, `sound`, `ideas`,
  `people`, `city` (voir `lib/rubriques.js`) ;
- un **format** — comment ça se lit : article, interview, portrait, tribune,
  essai, photo story, tenue du jour, et plus tard playlist, vidéo, guide,
  événement (voir `lib/formats.js`).

Les deux sont contraints à une liste connue, jamais du texte libre : sinon la
navigation se remplit de doublons au bout de trois mois.

Ajouter un format se fait en trois gestes — une entrée dans `FORMATS`, un
gabarit d'affichage, une portion de formulaire — **sans aucune migration de
base**. La colonne `blocs` (JSONB) est prévue pour les données propres à
chaque format : pistes d'une playlist, date et lieu d'un événement.

### Rubriques masquées automatiquement

Les six rubriques sont déclarées dès maintenant, mais **une rubrique sans
contenu publié n'apparaît ni dans la navigation ni à son URL** (404). Rien ne
fait plus abandonné qu'un média dont la moitié des sections sont vides le jour
du lancement. Elles réapparaissent seules au premier contenu publié.

---

## Le logotype

`MUK.` en Archivo Black, accompagné d'un descripteur romain en Instrument
Serif. Le descripteur n'est **pas** dans le tracé : c'est du texte à côté, ce
qui permet de le faire suivre la rubrique consultée — `MUK. magazine` sur
l'accueil, `MUK. sounds` dans la rubrique Sound.

Les fichiers sont dans `public/marque/` : quatre SVG vectorisés (aucune
dépendance à une police) et cinq exports PNG. Le composant `components/Logo.js`
contient les tracés en dur, pour que le logo n'attende jamais le chargement
d'une fonte.

---

## Charte

Tout est en haut de `app/globals.css`, dans le bloc `@theme`.

| Jeton | Clair | Sombre |
| --- | --- | --- |
| `papier` | `#ffffff` | `#0b0b0d` |
| `encre` | `#0a0a0b` | `#f5f5f3` |
| `accent` | `#1b22cc` | `#6e75ff` |

Quatre typographies, trois rôles : **Archivo Black** pour le logo et les titres
massifs, **Archivo** pour l'interface, **Instrument Serif** italique pour les
chapôs et citations, **Newsreader** pour le corps des articles.

Le mode sombre ne redéfinit que les jetons sémantiques — les composants
écrivent `bg-papier` une fois et suivent le thème.

---

## Passer en production (Supabase + Vercel)

La marche à suivre pas à pas, dans l'ordre du soir de livraison :
[DEPLOIEMENT.md](DEPLOIEMENT.md). Ci-dessous, le rappel des seuls réglages.

### 1. Supabase

1. Créer un projet sur [supabase.com](https://supabase.com), région Europe.
2. **SQL Editor → New query** : coller `supabase/schema.sql`, puis **Run**.
   Cela crée les tables `contenus` et `abonnes`, leurs index, et le bucket
   `medias`.
3. **Project Settings → API Keys** : relever l'URL du projet et la clé
   **secrète** (`sb_secret_…`, ou `service_role` si le projet utilise encore
   les clés JWT).

### 2. Variables d'environnement

| Variable | Rôle |
| --- | --- |
| `ADMIN_PASSWORD` | Mot de passe de la rédaction |
| `SESSION_SECRET` | Signature du cookie de session |
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet, sans chemin ni slash final |
| `SUPABASE_SERVICE_ROLE_KEY` | La clé **secrète** — jamais préfixée `NEXT_PUBLIC_` |
| `NEXT_PUBLIC_SITE_URL` | L'adresse publique, ex. `https://muk.fr` |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Limiteur de débit partagé — voir § Anti-forçage brutal |

L'application **refuse la clé publique** (`sb_publishable_…`) : elle est bridée
par les politiques RLS et provoquerait des erreurs incompréhensibles en pleine
page. Elle reste alors en mode démonstration et le dit dans la console.

### 3. Vérifier

```bash
npm run supabase:verifier   # clés, tables, bucket
npm run supabase:migrer     # transfère le contenu local vers la base
```

### 4. Vercel

Importer le dépôt, ajouter les variables, déployer.

---

## Ce qui reste à construire

| Chantier | État |
| --- | --- |
| Traduction des pages légales | Les textes restent en français, avec un avis en tête pour le lecteur anglophone. Une version anglaise engagerait juridiquement — à faire relire si elle est produite |
| Formats playlist, vidéo, guide, événement | Déclarés dans `lib/formats.js` (`pret: false`), gabarits à écrire |
| Comptes rédacteurs | Un seul mot de passe aujourd'hui. Supabase Auth quand il y aura plusieurs plumes |
| Envoi de la newsletter | Les adresses sont collectées ; l'envoi et le double opt-in restent à brancher (Brevo ou équivalent) |
| Mentions légales et confidentialité | **Pages écrites et en ligne** — restent à compléter par la cliente (identité de l'éditeur, directeur de publication, coordonnées). Chercher « À COMPLÉTER » |
| Pages À propos et Community | Prévues au §09 de la fiche |

---

## Bilingue FR / EN

**Un contenu et sa traduction sont deux enregistrements distincts**, reliés par
un même `groupeId`. Ce choix permet à un article de sortir en français puis
d'être traduit trois jours plus tard, avec un slug propre à chaque langue —
indispensable au référencement. Des colonnes `titre_fr` / `titre_en`
obligeraient à tout écrire d'un coup.

Le slug n'est unique **qu'à l'intérieur d'une langue** : deux langues peuvent
porter le même, ce sont deux URL distinctes.

### Ce qui découle de ce choix

- Une rubrique nourrie en français peut être absente en anglais : `/fr/fashion`
  répond, `/en/fashion` renvoie 404 tant qu'aucun contenu anglais n'y est publié.
  La navigation s'adapte par langue.
- Le sélecteur de langue mène à la traduction quand elle existe, à l'accueil de
  l'autre langue sinon — jamais à une 404.
- Les balises `hreflang` relient les deux versions : sans elles, elles se
  concurrenceraient dans les résultats de recherche au lieu de se renforcer.

### Le routage

Tout le public vit sous `/fr` ou `/en`. Une URL sans préfixe est redirigée vers
la langue du navigateur (`Accept-Language`), sans dépôt de cookie — mémoriser ce
choix serait un traceur à déclarer. Le back-office reste hors du segment de
langue : c'est l'outil de la rédaction, pas une page publique.

La mise en page racine rend `<html lang>` mais ne voit pas les paramètres de
route ; le middleware lui transmet la langue par un en-tête (`x-muk-langue`).

### Les textes d'interface

Deux dictionnaires JSON dans `lib/dictionnaires/`, aucune bibliothèque. La
parité des clés se vérifie en une commande :

```bash
node -e "const p=o=>Object.entries(o).flatMap(([k,v])=>typeof v==='object'?p(v).map(x=>k+'.'+x):[k]);const a=p(require('./lib/dictionnaires/fr.json')),b=p(require('./lib/dictionnaires/en.json'));console.log(a.filter(k=>!b.includes(k)).concat(b.filter(k=>!a.includes(k))))"
```

### La traduction assistée

Le bouton **Traduire → EN** de l'admin appelle l'API Claude, qui reçoit la
charte de ton du §06 de la fiche, et produit une première version **en
brouillon**. Marilyse relit, corrige, publie.

Ce n'est pas un widget de traduction automatique servi au lecteur : ce choix a
été écarté parce qu'il coûte le référencement de la version anglaise et, plus
grave pour un média, publierait des citations d'interview que la personne
interrogée n'a jamais validées.

Le modèle renvoie aussi des `notes` — tournures intraduisibles, citations dont
la formulation compte — affichées à la rédaction après la traduction.

Sans `ANTHROPIC_API_KEY`, le bouton est désactivé et la traduction manuelle
reste possible. Rien d'autre ne change.

---

## Anti-forçage brutal

Deux routes limitent le nombre de tentatives par adresse IP : la connexion à
la rédaction (5 essais / 10 min) et l'inscription newsletter (3 / 10 min).

**Sur une infrastructure classique, un `Map()` en mémoire suffirait.** Pas sur
Vercel : chaque instance serverless a sa propre mémoire, un cold start ou une
deuxième instance en parallèle repart de zéro. Un compteur en mémoire n'y
protège quasiment pas contre un forçage distribué.

`lib/limiteur.js` utilise donc [Upstash Redis](https://console.upstash.com) —
un compteur partagé, joignable en HTTP (donc sans connexion persistante à
maintenir, adapté au serverless). Le plan gratuit (10 000 commandes/jour)
tient très largement pour ce volume.

### Mise en place (5 min)

1. [console.upstash.com](https://console.upstash.com) → créer une base
   **Redis** (région proche de celle de Vercel/Supabase).
2. Onglet **REST API** → copier `UPSTASH_REDIS_REST_URL` et
   `UPSTASH_REDIS_REST_TOKEN`.
3. Coller les deux dans `.env.local`, et dans **Vercel → Settings →
   Environment Variables**, puis redéployer.

Sans ces deux variables, l'application **fonctionne quand même** — elle
retombe sur le compteur en mémoire et le signale une fois dans les journaux
du serveur (`[MUK] UPSTASH_REDIS_REST_URL / ... absentes`). C'est voulu : le
développement local n'a pas besoin d'un compte Upstash.

---

## Structure

```
app/
  page.js                    Accueil : une, derniers contenus, rubriques, newsletter
  [rubrique]/page.js         Une rubrique et ses contenus
  article/[slug]/page.js     Lecture : sommaire ancré, galerie, à lire ensuite
  admin/                     Rédaction (protégée par middleware.js)
  api/                       Auth, CRUD contenus, upload, newsletter
components/
  Logo.js                    Logotype vectorisé + tampon
  admin/                     Formulaire, liste, sélecteur de bitmoji, téléversement
lib/
  rubriques.js  formats.js   Les deux axes du modèle de contenu
  db.js                      Aiguillage local / Supabase
  supabase-config.js         Détection et validation des clés — source unique
  markdown.js                Rendu éditorial + sommaire (échappe toute la saisie)
  auth.js  garde.js          Session signée, contrôle des routes d'API
public/marque/               Le logotype, SVG et PNG
supabase/schema.sql          Schéma à exécuter dans Supabase
```

---

## Sécurité

- Mot de passe en variable d'environnement, comparé en temps constant.
- Cookie de session `httpOnly`, signé HMAC-SHA256, 12 h.
- Cinq tentatives de connexion par IP toutes les dix minutes ; trois
  inscriptions newsletter.
- Le middleware protège `/admin`, **et** chaque route d'API revérifie la session.
- Tout le texte saisi est échappé avant rendu : un `<script>` collé dans un
  contenu s'affiche comme du texte.
- Les brouillons renvoient 404 en public, même avec l'URL exacte.
- L'inscription newsletter répond la même chose pour une adresse nouvelle ou
  déjà connue : la route ne permet pas de tester l'appartenance à la liste.
- **Aucun appel à un tiers depuis les pages publiques.** Les typographies sont
  auto-hébergées (`public/fontes/`, voir `scripts/fontes.md`) : l'adresse IP des
  lecteurs n'est transmise à personne pour les afficher. Aucune mesure
  d'audience, donc aucun bandeau cookies à afficher.

---

## Scripts

| Commande | Effet |
| --- | --- |
| `npm run dev` | Développement, port 3100 |
| `npm run build` | Build de production |
| `npm run seed` | Réécrit les contenus de démonstration |
| `npm run placeholders` | Régénère les visuels de remplacement |
| `npm run supabase:verifier` | Diagnostique la connexion Supabase |
| `npm run supabase:migrer` | Transfère le contenu local vers Supabase |

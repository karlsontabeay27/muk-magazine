# Mise en ligne — Supabase + Vercel

Ordre d'exécution du soir de la livraison. Chaque étape se vérifie avant de
passer à la suivante ; aucune ne demande de toucher au code.

Compter **une heure**, dont la moitié d'attente (propagation DNS, premier
déploiement).

---

## Avant de commencer — trois points à trancher avec la cliente

| Point | Pourquoi il se pose |
| --- | --- |
| **Adresse du site** | `muk.vercel.app` est gratuit et disponible tout de suite. Un nom à soi (`mukmagazine.com`, `muk.fr`) coûte **10 à 15 € par an** chez un bureau d'enregistrement : ce n'est pas compris dans l'hébergement gratuit |
| **Plan Vercel** | Le plan *Hobby*, gratuit, **exclut l'usage commercial** dans ses conditions. Un média avec régie, partenariats ou boutique relève du plan *Pro*, 20 $/mois. Tant que MUK est éditorial et sans recette, *Hobby* tient |
| **Mot de passe de la rédaction** | `marilyse` sert au développement. En ligne, il ouvre la publication à qui le devine — il change ce soir |

---

## 1. Supabase — la base (15 min)

Le projet existe déjà : `xceibgdsonjvqqfqsacd`. Il reste à créer les tables et
à récupérer la bonne clé.

1. **SQL Editor → New query** : coller tout `supabase/schema.sql`, **Run**.
   Attendu : `Success. No rows returned`. Tables `contenus` et `abonnes`,
   index, et bucket `medias` créés.
2. **Project Settings → API Keys** : copier la clé **secrète**.
   - clé neuve : commence par `sb_secret_`
   - projet ancien : ligne `service_role`, un JWT, à révéler d'un clic
   - la clé `sb_publishable_…` déjà collée dans `.env.local` **n'est pas
     celle-là** : elle est bridée par les politiques RLS et l'application la
     refuse volontairement
3. Dans `.env.local`, remplacer la valeur de `SUPABASE_SERVICE_ROLE_KEY`.
   La ligne `AMON_SUPERBASE_KEY` ne sert à rien, elle peut disparaître.

```bash
npm run supabase:verifier
```

Attendu : URL, clé, tables et bucket tous cochés. Tant qu'une croix subsiste,
ne pas continuer — l'application repasserait en mode démonstration sans le
dire autrement qu'en console.

---

## 2. Transférer le contenu (5 min)

```bash
npm run supabase:migrer
npm run dev
```

Ouvrir <http://localhost:3100> : les articles doivent s'afficher comme avant,
mais lus depuis la base. Publier un brouillon de test depuis `/admin` pour
vérifier l'écriture, puis le supprimer.

> Cette étape est obligatoire avant Vercel. En mode démonstration, les
> articles et les images s'écrivent dans des fichiers ; sur Vercel le disque
> est en lecture seule et remis à zéro à chaque déploiement. La rédaction
> croirait publier dans le vide.

---

## 3. Dépôt Git (10 min)

Le dossier est un dépôt local sans aucun commit. `.gitignore` protège déjà
`.env.local` — vérifier qu'aucune clé ne part :

```bash
git status --short | grep env
```

Attendu : seul `.env.example` apparaît. Puis premier commit, dépôt **privé**
sur GitHub, et `git push`.

---

## 4. Vercel (15 min + attente)

1. Se connecter avec le compte GitHub, **Add New → Project**, importer le
   dépôt. Next.js est détecté seul : ne rien changer aux réglages de build.
2. **Environment Variables** — les cinq, sur les trois environnements :

   | Variable | Valeur |
   | --- | --- |
   | `ADMIN_PASSWORD` | le nouveau mot de passe de la rédaction |
   | `SESSION_SECRET` | chaîne aléatoire, générée ci-dessous |
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://xceibgdsonjvqqfqsacd.supabase.co` |
   | `SUPABASE_SERVICE_ROLE_KEY` | la clé secrète de l'étape 1 |
   | `NEXT_PUBLIC_SITE_URL` | l'adresse finale, sans slash final |

   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

   `NEXT_PUBLIC_SITE_URL` sert aux images de partage et au plan du site : si
   elle est fausse, les liens partagés sur Instagram pointent ailleurs. En
   attendant le nom définitif, mettre l'adresse `.vercel.app`, et la corriger
   ensuite — la correction demande un redéploiement.

3. **Deploy**. Environ deux minutes.

## 4bis. Limiteur de débit (10 min, fortement conseillé)

Sans cette étape, la limite « 5 essais de connexion / 10 min » ne protège
presque rien sur Vercel — chaque instance serverless a sa propre mémoire.

1. [console.upstash.com](https://console.upstash.com) → créer une base Redis
   (plan gratuit, région proche de Vercel).
2. Onglet **REST API** → copier `UPSTASH_REDIS_REST_URL` et
   `UPSTASH_REDIS_REST_TOKEN`.
3. Vercel → **Environment Variables** → ajouter les deux, sur les trois
   environnements → **Redeploy**.

Vérifier : les journaux Vercel de la fonction `/api/auth/login` ne doivent
plus afficher l'avertissement `[MUK] UPSTASH_REDIS_REST_URL ... absentes`.

---

## 5. Nom de domaine (facultatif, 10 min + propagation)

Acheter chez un bureau d'enregistrement, puis **Vercel → Settings → Domains**,
ajouter le nom et suivre les enregistrements DNS indiqués. Le certificat HTTPS
est posé automatiquement.

Compter jusqu'à 24 h de propagation, en pratique quelques minutes. Une fois le
nom actif : corriger `NEXT_PUBLIC_SITE_URL` et redéployer.

---

## 6. Vérifications finales

- [ ] `/fr` et `/en` s'ouvrent, la bascule de langue conserve l'article
- [ ] Une rubrique vide dans une langue est bien absente de sa navigation
- [ ] `/admin` refuse l'ancien mot de passe, accepte le nouveau
- [ ] Publier un article depuis l'admin, avec une image : elle doit s'afficher
      depuis une URL `supabase.co`
- [ ] Inscription à la newsletter : l'adresse arrive dans la table `abonnes`
- [ ] `/sitemap.xml` et `/robots.txt` portent la bonne adresse
- [ ] Mode sombre, et affichage sur téléphone

---

## Ce que la mise en ligne ne règle pas

- **Envoi de la newsletter** : les adresses sont collectées, rien ne part
  encore. Le double opt-in reste à brancher (Brevo ou équivalent)
- **Mentions légales** : 16 champs « À COMPLÉTER » attendent l'identité de
  l'éditeur et le directeur de publication. Chercher `À COMPLÉTER` dans
  `app/[langue]/mentions-legales/` — une obligation légale, pas un détail
- **Bouton « Traduire »** : sans `ANTHROPIC_API_KEY`, il reste désactivé et la
  traduction se fait à la main. Ce chemin n'a jamais été exécuté en entier,
  faute de clé — à éprouver avant de le promettre
- **Veille Supabase** : sur le plan gratuit, un projet sans aucune requête
  pendant sept jours est mis en pause et se réveille à la main depuis le
  tableau de bord. Un site consulté ne s'endort pas

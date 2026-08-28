import Link from 'next/link';
import { notFound } from 'next/navigation';
import Entete from '@/components/Entete';
import PiedDePage from '@/components/PiedDePage';
import BadgeHumeur from '@/components/BadgeHumeur';
import Galerie from '@/components/Galerie';
import SommaireArticle from '@/components/SommaireArticle';
import CarteArticle from '@/components/CarteArticle';
import Apparition from '@/components/Apparition';
import BlocNewsletter from '@/components/BlocNewsletter';
import { lireArticleParSlug, lireTraductions, listerArticles } from '@/lib/db';
import { rendreArticle, tempsDeLecture } from '@/lib/markdown';
import { formaterDate } from '@/lib/dates';
import { nomRubrique, rubriquesVivantes, trouverRubrique } from '@/lib/rubriques';
import { nomFormat, trouverFormat } from '@/lib/formats';
import { estTenue } from '@/lib/article';
import { langueValide, traducteur } from '@/lib/i18n';
import { alternatesDepuis, liensArticle } from '@/lib/liens';

export const dynamic = 'force-dynamic';

/** Un brouillon n'existe pas pour le public, même avec l'URL exacte. */
async function contenuPublie(slug, langue) {
  const contenu = await lireArticleParSlug(slug, langue);
  return contenu && contenu.statut === 'publie' ? contenu : null;
}

export async function generateMetadata({ params }) {
  const { langue, slug } = await params;
  if (!langueValide(langue)) return { title: '404' };

  const contenu = await contenuPublie(slug, langue);
  if (!contenu) return { title: '404' };

  const traductions = await lireTraductions(contenu.groupeId, contenu.id);

  return {
    title: contenu.titre,
    description: contenu.chapeau,
    openGraph: {
      type: 'article',
      locale: langue === 'en' ? 'en_GB' : 'fr_FR',
      title: contenu.titre,
      description: contenu.chapeau,
      publishedTime: contenu.datePublication,
      authors: [contenu.auteur],
      images: contenu.couverture ? [{ url: contenu.couverture }] : undefined,
    },
    alternates: alternatesDepuis(liensArticle(contenu, traductions), langue),
  };
}

export default async function PageArticle({ params }) {
  const { langue, slug } = await params;
  if (!langueValide(langue)) notFound();

  const contenu = await contenuPublie(slug, langue);
  if (!contenu) notFound();

  const t = traducteur(langue);
  const { html, sommaire } = rendreArticle(contenu.contenu);
  const rubrique = trouverRubrique(contenu.rubrique);
  const format = trouverFormat(contenu.format);

  const traductions = await lireTraductions(contenu.groupeId, contenu.id);
  const tous = await listerArticles({ langue });

  // On propose d'abord la même rubrique : c'est là qu'est la suite naturelle
  // de la lecture, avant les contenus simplement récents.
  const associes = [
    ...tous.filter((c) => c.id !== contenu.id && c.rubrique === contenu.rubrique),
    ...tous.filter((c) => c.id !== contenu.id && c.rubrique !== contenu.rubrique),
  ].slice(0, 3);

  const donneesStructurees = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    inLanguage: langue,
    headline: contenu.titre,
    description: contenu.chapeau,
    datePublished: contenu.datePublication,
    dateModified: contenu.dateMaj,
    author: { '@type': 'Person', name: contenu.auteur },
    articleSection: nomRubrique(rubrique, langue),
    image: contenu.couverture ? [contenu.couverture] : undefined,
    publisher: { '@type': 'Organization', name: 'MUK' },
  };

  return (
    <>
      <Entete
        langue={langue}
        rubriques={rubriquesVivantes(tous)}
        descripteur={rubrique.descripteur}
        liensLangue={liensArticle(contenu, traductions)}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(donneesStructurees) }}
      />

      <main>
        {/* ------------------------------------------------------ Ouverture
            Le titre passe au-dessus de l'image plutôt que dessus : sur un
            média, le titre doit rester lisible quelle que soit la photo
            fournie par la rédaction. */}
        <header className="border-b border-filet">
          <div className="contenu py-12 md:py-16">
            <p className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <Link
                href={`/${langue}/${rubrique.id}`}
                className="surtitre text-accent hover:underline"
              >
                {nomRubrique(rubrique, langue)}
              </Link>
              {format.id !== 'article' ? (
                <span className="surtitre text-gris">{nomFormat(format, langue)}</span>
              ) : null}
            </p>

            <h1 className="massif mt-6 max-w-[20ch] text-[clamp(2.2rem,6.5vw,5rem)]">
              {contenu.titre}
            </h1>

            <p className="romain mt-7 max-w-3xl text-[clamp(1.2rem,2.4vw,1.75rem)] leading-snug text-encre-douce">
              {contenu.chapeau}
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-x-5 gap-y-3">
              {contenu.humeur ? (
                <BadgeHumeur humeur={contenu.humeur} taille="petit" decoratif />
              ) : null}
              <p className="surtitre text-gris">
                {contenu.auteur}
                <span aria-hidden="true" className="mx-2 text-gris-faible">·</span>
                <time dateTime={contenu.datePublication}>
                  {formaterDate(contenu.datePublication, langue)}
                </time>
                <span aria-hidden="true" className="mx-2 text-gris-faible">·</span>
                {t('article.lecture', { minutes: tempsDeLecture(contenu.contenu) })}
              </p>
            </div>
          </div>

          {contenu.couverture ? (
            <div className="aspect-[16/9] w-full overflow-hidden bg-papier-casse md:aspect-[21/9]">
              <img
                src={contenu.couverture}
                alt=""
                fetchPriority="high"
                className="h-full w-full object-cover"
              />
            </div>
          ) : null}
        </header>

        {/* -------------------------------------------------------- Contenu */}
        <div className="contenu py-14 md:py-20">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-14">
            <aside className="lg:col-span-3">
              <SommaireArticle sommaire={sommaire} langue={langue} />
            </aside>

            <div className="lg:col-span-8 lg:col-start-5">
              <div className="prose-muk" dangerouslySetInnerHTML={{ __html: html }} />

              {estTenue(contenu) && contenu.piecesTenue.length > 0 ? (
                <div className="mt-14 border-t border-filet pt-9">
                  <p className="surtitre text-accent">{t('article.piecesTenue')}</p>
                  <ul className="mt-6">
                    {contenu.piecesTenue.map((piece) => (
                      <li
                        key={piece}
                        className="flex gap-5 border-b border-filet py-4 text-encre-douce"
                      >
                        <span aria-hidden="true" className="mt-3 h-px w-5 shrink-0 bg-accent" />
                        {piece}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {contenu.galerie.length > 0 ? (
                <div className="mt-16">
                  <Galerie images={contenu.galerie} titre={contenu.titre} langue={langue} />
                </div>
              ) : null}

              <div className="mt-16 border-t border-filet pt-8">
                <Link
                  href={`/${langue}/${rubrique.id}`}
                  className="surtitre group inline-flex items-center gap-2 text-gris transition-colors hover:text-accent"
                >
                  <span
                    aria-hidden="true"
                    className="transition-transform duration-300 group-hover:-translate-x-1"
                  >
                    ←
                  </span>
                  {t('article.retour', { rubrique: rubrique.descripteur })}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ---------------------------------------------------- À lire aussi */}
        {associes.length > 0 ? (
          <section className="border-t border-filet bg-papier-casse py-16 md:py-20">
            <div className="contenu">
              <Apparition className="mb-10">
                <h2 className="massif text-[clamp(1.8rem,4vw,3rem)]">
                  {t('article.aLireEnsuite')}{' '}
                  <span className="romain lowercase tracking-normal">
                    {t('article.aLireEnsuiteItalique')}
                  </span>
                </h2>
              </Apparition>

              <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                {associes.map((c, i) => (
                  <Apparition key={c.id} delai={i * 90}>
                    <CarteArticle contenu={c} langue={langue} />
                  </Apparition>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <BlocNewsletter langue={langue} />
      </main>

      <PiedDePage langue={langue} rubriques={rubriquesVivantes(tous)} />
    </>
  );
}

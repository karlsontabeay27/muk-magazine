import Link from 'next/link';
import Apparition from '@/components/Apparition';
import CarteArticle from '@/components/CarteArticle';
import { resumeRubrique } from '@/lib/rubriques';
import { traducteur } from '@/lib/i18n';

/**
 * Une rubrique sur la page d'accueil.
 *
 * Composition asymétrique volontaire : un contenu large à gauche, deux plus
 * petits empilés à droite. C'est le chemin de fer d'un magazine — une pièce
 * qui domine, deux qui accompagnent — et non trois colonnes égales, qui
 * n'établissent aucune hiérarchie de lecture.
 */
export default function SectionRubrique({ rubrique, contenus, langue, fondCasse = false }) {
  if (contenus.length === 0) return null;

  const t = traducteur(langue);
  const [tete, ...suite] = contenus;

  return (
    <section
      id={rubrique.id}
      className={[
        'scroll-mt-24 border-t border-filet py-16 md:py-24',
        fondCasse ? 'bg-papier-casse' : '',
      ].join(' ')}
    >
      <div className="contenu">
        <Apparition className="mb-10 flex flex-wrap items-end justify-between gap-x-8 gap-y-4 md:mb-14">
          <div>
            <h2 className="massif text-[clamp(2rem,5vw,3.6rem)]">
              MUK <span className="romain lowercase tracking-normal">{rubrique.descripteur}</span>
            </h2>
            <p className="mt-3 max-w-xl text-encre-douce">{resumeRubrique(rubrique, langue)}</p>
          </div>

          <Link
            href={`/${langue}/${rubrique.id}`}
            className="surtitre group inline-flex items-center gap-2 border-b-2 border-encre pb-2 transition-colors hover:border-accent hover:text-accent"
          >
            {t('accueil.toutVoir')}
            <span
              aria-hidden="true"
              className="transition-transform duration-300 group-hover:translate-x-1"
            >
              →
            </span>
          </Link>
        </Apparition>

        <div className="grid grid-cols-1 gap-x-8 gap-y-12 lg:grid-cols-12">
          <Apparition className="lg:col-span-7">
            <CarteArticle contenu={tete} langue={langue} taille="une" />
          </Apparition>

          {suite.length > 0 ? (
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-1">
              {suite.slice(0, 2).map((c, i) => (
                <Apparition key={c.id} delai={(i + 1) * 90}>
                  <CarteArticle contenu={c} langue={langue} taille="liste" />
                </Apparition>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

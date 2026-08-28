import Apparition from '@/components/Apparition';
import CarteArticle from '@/components/CarteArticle';
import { traducteur } from '@/lib/i18n';

/**
 * LATEST — §08 de la fiche : les derniers contenus, toutes rubriques
 * confondues. C'est la section qui prouve qu'un média est vivant, donc elle
 * arrive juste après la une et avant les rubriques.
 */
export default function DerniersContenus({ contenus, langue }) {
  if (contenus.length === 0) return null;
  const t = traducteur(langue);

  return (
    <section id="latest" className="scroll-mt-24 py-16 md:py-24">
      <div className="contenu">
        <Apparition className="mb-10 md:mb-14">
          <h2 className="massif text-[clamp(2rem,5vw,3.6rem)]">
            {t('accueil.derniers')}{' '}
            <span className="romain lowercase tracking-normal">
              {t('accueil.derniersItalique')}
            </span>
          </h2>
        </Apparition>

        <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {contenus.map((c, i) => (
            <Apparition key={c.id} delai={(i % 4) * 80}>
              <CarteArticle contenu={c} langue={langue} />
            </Apparition>
          ))}
        </div>
      </div>
    </section>
  );
}

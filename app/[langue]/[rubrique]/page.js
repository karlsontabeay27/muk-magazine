import { notFound } from 'next/navigation';
import Entete from '@/components/Entete';
import PiedDePage from '@/components/PiedDePage';
import CarteArticle from '@/components/CarteArticle';
import Apparition from '@/components/Apparition';
import BlocNewsletter from '@/components/BlocNewsletter';
import { listerArticles } from '@/lib/db';
import {
  RUBRIQUES,
  resumeRubrique,
  rubriquesVivantes,
  trouverRubrique,
} from '@/lib/rubriques';
import { langueValide, traducteur } from '@/lib/i18n';
import { alternatesDepuis, liensDirects } from '@/lib/liens';

export const dynamic = 'force-dynamic';

const IDS = RUBRIQUES.map((r) => r.id);

export async function generateMetadata({ params }) {
  const { langue, rubrique } = await params;
  if (!langueValide(langue) || !IDS.includes(rubrique)) return { title: '404' };

  const r = trouverRubrique(rubrique);
  return {
    title: `MUK ${r.descripteur}`,
    description: resumeRubrique(r, langue),
    alternates: alternatesDepuis(liensDirects(`/${r.id}`), langue),
  };
}

export default async function PageRubrique({ params }) {
  const { langue, rubrique } = await params;
  if (!langueValide(langue) || !IDS.includes(rubrique)) notFound();

  const t = traducteur(langue);
  const r = trouverRubrique(rubrique);

  const tous = await listerArticles({ langue });
  const contenus = tous.filter((c) => c.rubrique === r.id);

  // Une rubrique sans contenu publié dans cette langue n'existe pas pour le
  // public : elle est déjà masquée de la navigation, son URL suit la même
  // règle. Une rubrique nourrie en français peut donc être absente en anglais.
  if (contenus.length === 0) notFound();

  const rubriques = rubriquesVivantes(tous);

  return (
    <>
      <Entete
        langue={langue}
        rubriques={rubriques}
        descripteur={r.descripteur}
        liensLangue={liensDirects(`/${r.id}`)}
      />

      <main>
        <header className="border-b border-filet py-14 md:py-20">
          <div className="contenu">
            <h1 className="massif text-[clamp(2.6rem,9vw,6.5rem)]">
              MUK <span className="romain lowercase tracking-normal">{r.descripteur}</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-encre-douce">
              {resumeRubrique(r, langue)}
            </p>
            <p className="surtitre mt-8 text-gris">
              {t(contenus.length > 1 ? 'rubrique.compteur_autre' : 'rubrique.compteur_un', {
                n: contenus.length,
              })}
            </p>
          </div>
        </header>

        <div className="contenu py-14 md:py-20">
          <div className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {contenus.map((c, i) => (
              <Apparition key={c.id} delai={(i % 3) * 80}>
                <CarteArticle contenu={c} langue={langue} priorite={i === 0} />
              </Apparition>
            ))}
          </div>
        </div>

        <BlocNewsletter langue={langue} />
      </main>

      <PiedDePage langue={langue} rubriques={rubriques} />
    </>
  );
}

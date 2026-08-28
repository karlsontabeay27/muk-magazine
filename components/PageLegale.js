import Entete from '@/components/Entete';
import PiedDePage from '@/components/PiedDePage';
import { listerArticles } from '@/lib/db';
import { rubriquesVivantes } from '@/lib/rubriques';
import { liensDirects } from '@/lib/liens';

/**
 * Gabarit des pages légales.
 *
 * Volontairement austère : une colonne étroite, pas d'image, pas d'animation.
 * Ces pages se consultent pour y chercher une information précise, elles ne
 * se parcourent pas. La navigation reste complète pour ne pas enfermer le
 * lecteur dans un cul-de-sac.
 */
export default async function PageLegale({ langue, chemin, titre, chapeau, majLe, children }) {
  const contenus = await listerArticles({ langue });
  const rubriques = rubriquesVivantes(contenus);

  return (
    <>
      <Entete langue={langue} rubriques={rubriques} liensLangue={liensDirects(chemin)} />

      <main>
        <header className="border-b border-filet py-14 md:py-20">
          <div className="contenu">
            <h1 className="massif text-[clamp(2.2rem,7vw,4.5rem)]">{titre}</h1>
            {chapeau ? (
              <p className="romain mt-6 max-w-2xl text-[clamp(1.1rem,2.2vw,1.5rem)] leading-snug text-encre-douce">
                {chapeau}
              </p>
            ) : null}
            {majLe ? (
              <p className="surtitre mt-8 text-gris">Dernière mise à jour : {majLe}</p>
            ) : null}
          </div>
        </header>

        <div className="contenu py-14 md:py-20">
          <div className="legal max-w-[68ch]">{children}</div>
        </div>
      </main>

      <PiedDePage langue={langue} rubriques={rubriques} />
    </>
  );
}

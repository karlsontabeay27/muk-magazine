import Link from 'next/link';
import BadgeHumeur from '@/components/BadgeHumeur';
import { nomRubrique, trouverRubrique } from '@/lib/rubriques';
import { nomFormat, trouverFormat } from '@/lib/formats';
import { formaterDate } from '@/lib/dates';

/**
 * Tuile de contenu.
 *
 * `taille` règle la place dans la grille : 'une' pour la pièce dominante,
 * 'standard' pour le chemin de fer, 'liste' pour les colonnes serrées où
 * l'image se réduit à une vignette.
 *
 * L'étiquette porte la rubrique ET le format quand le format n'est pas
 * l'article courant : sur un média à dix formats, savoir qu'on ouvre une
 * interview plutôt qu'un essai change la décision de cliquer.
 */
export default function CarteArticle({ contenu, langue, taille = 'standard', priorite = false }) {
  const rubrique = trouverRubrique(contenu.rubrique);
  const format = trouverFormat(contenu.format);
  const grand = taille === 'une';
  const liste = taille === 'liste';

  const proportions = grand ? 'aspect-[16/10]' : liste ? 'aspect-[4/3]' : 'aspect-[4/5]';

  return (
    <article className="group">
      <Link href={`/${langue}/article/${contenu.slug}`} className="block">
        <div className={`relative overflow-hidden bg-papier-casse ${proportions}`}>
          {contenu.couverture ? (
            <img
              src={contenu.couverture}
              alt=""
              loading={priorite ? 'eager' : 'lazy'}
              fetchPriority={priorite ? 'high' : 'auto'}
              className="h-full w-full object-cover transition-transform duration-700 ease-muk group-hover:scale-[1.03]"
            />
          ) : null}

          {contenu.humeur ? (
            <div className="absolute bottom-3 right-3">
              <BadgeHumeur humeur={contenu.humeur} taille="petit" decoratif />
            </div>
          ) : null}
        </div>

        <div className="mt-5">
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="surtitre text-accent">{nomRubrique(rubrique, langue)}</span>
            {format.id !== 'article' ? (
              <span className="surtitre text-gris">{nomFormat(format, langue)}</span>
            ) : null}
          </p>

          <h3
            className={[
              'titre mt-3 transition-colors duration-200 group-hover:text-accent',
              grand
                ? 'text-[clamp(1.8rem,3.4vw,3rem)]'
                : liste
                  ? 'text-[1.15rem]'
                  : 'text-[clamp(1.25rem,2vw,1.6rem)]',
            ].join(' ')}
          >
            {contenu.titre}
          </h3>

          {!liste ? (
            <p
              className={[
                'mt-3 leading-relaxed text-encre-douce',
                grand ? 'max-w-2xl text-lg' : 'text-[0.95rem]',
              ].join(' ')}
            >
              {contenu.chapeau}
            </p>
          ) : null}

          <p className="surtitre mt-4 text-gris">
            {contenu.auteur}
            <span aria-hidden="true" className="mx-2 text-gris-faible">·</span>
            <time dateTime={contenu.datePublication}>
              {formaterDate(contenu.datePublication, langue)}
            </time>
          </p>
        </div>
      </Link>
    </article>
  );
}

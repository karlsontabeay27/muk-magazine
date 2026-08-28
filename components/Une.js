import Link from 'next/link';
import { nomRubrique, trouverRubrique } from '@/lib/rubriques';
import { nomFormat, trouverFormat } from '@/lib/formats';
import { formaterDate } from '@/lib/dates';
import { tempsDeLecture } from '@/lib/markdown';
import { traducteur } from '@/lib/i18n';

/**
 * La une — §08 de la fiche : « HERO → article / portrait / dossier principal ».
 *
 * Ce n'est pas une bannière de marque : le premier écran de MUK est un
 * contenu. Une image plein cadre, un titre massif posé dessus, et rien
 * d'autre. Le nom du média est déjà dans le bandeau juste au-dessus.
 */
export default function Une({ contenu, langue }) {
  if (!contenu) return null;

  const t = traducteur(langue);
  const rubrique = trouverRubrique(contenu.rubrique);
  const format = trouverFormat(contenu.format);

  return (
    <section className="relative">
      <Link href={`/${langue}/article/${contenu.slug}`} className="group block">
        <div className="relative min-h-[78svh] overflow-hidden bg-encre md:min-h-[86svh]">
          {contenu.couverture ? (
            <img
              src={contenu.couverture}
              alt=""
              fetchPriority="high"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1400ms] ease-muk group-hover:scale-[1.02]"
            />
          ) : null}

          {/* Voile dégradé : garantit le contraste du titre quelle que soit
              la photo publiée par la rédaction. */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10"
          />

          <div className="contenu relative flex min-h-[78svh] flex-col justify-end pb-12 pt-28 md:min-h-[86svh] md:pb-20">
            <p className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <span className="surtitre bg-accent px-3 py-2 text-white">{t('accueil.aLaUne')}</span>
              <span className="surtitre text-white/85">{nomRubrique(rubrique, langue)}</span>
              {format.id !== 'article' ? (
                <span className="surtitre text-white/60">{nomFormat(format, langue)}</span>
              ) : null}
            </p>

            <h1 className="massif mt-6 max-w-[19ch] text-[clamp(2.4rem,7.5vw,6rem)] text-white">
              {contenu.titre}
            </h1>

            <p className="romain mt-6 max-w-2xl text-[clamp(1.15rem,2.2vw,1.6rem)] leading-snug text-white/85">
              {contenu.chapeau}
            </p>

            <p className="surtitre mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 text-white/65">
              {contenu.auteur}
              <span aria-hidden="true">·</span>
              <time dateTime={contenu.datePublication}>
                {formaterDate(contenu.datePublication, langue)}
              </time>
              <span aria-hidden="true">·</span>
              {t('article.lecture', { minutes: tempsDeLecture(contenu.contenu) })}
            </p>
          </div>
        </div>
      </Link>
    </section>
  );
}

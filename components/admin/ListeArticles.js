'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import BadgeHumeur from '@/components/BadgeHumeur';
import { formaterDateCourte } from '@/lib/dates';
import { trouverRubrique } from '@/lib/rubriques';
import { trouverFormat } from '@/lib/formats';
import { LANGUES } from '@/lib/i18n';

/**
 * Tableau de bord : tous les contenus, brouillons et deux langues compris.
 *
 * La liste est tenue en état local et mise à jour avec la réponse de l'API :
 * le changement est visible immédiatement. router.refresh() suit derrière pour
 * que le site public reparte des mêmes données.
 */
export default function ListeArticles({ articles, traductionActive }) {
  const router = useRouter();
  const [liste, setListe] = useState(articles);
  const [occupe, setOccupe] = useState(null);
  const [erreur, setErreur] = useState(null);
  const [note, setNote] = useState(null);
  const [filtre, setFiltre] = useState('tous');

  useEffect(() => setListe(articles), [articles]);

  /** Quelles langues existent déjà pour chaque groupe de traduction. */
  const languesParGroupe = useMemo(() => {
    const carte = new Map();
    for (const a of liste) {
      const deja = carte.get(a.groupeId) ?? new Set();
      deja.add(a.langue);
      carte.set(a.groupeId, deja);
    }
    return carte;
  }, [liste]);

  const visibles = liste.filter((a) => {
    if (filtre === 'tous') return true;
    if (filtre === 'une') return a.aLaUne;
    if (filtre === 'fr' || filtre === 'en') return a.langue === filtre;
    return a.statut === filtre;
  });

  async function appeler(article, url, options, appliquer) {
    setOccupe(article.id);
    setErreur(null);
    setNote(null);

    const reponse = await fetch(url, options);
    const donnees = await reponse.json().catch(() => ({}));

    if (!reponse.ok) {
      setErreur(donnees.erreurs?.join(' ') ?? donnees.erreur ?? 'L’opération a échoué.');
      setOccupe(null);
      return null;
    }

    appliquer(donnees);
    setOccupe(null);
    router.refresh();
    return donnees;
  }

  const basculerStatut = (article) =>
    appeler(
      article,
      `/api/articles/${article.id}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statut: article.statut === 'publie' ? 'brouillon' : 'publie' }),
      },
      ({ article: maj }) => setListe((l) => l.map((a) => (a.id === maj.id ? maj : a))),
    );

  function supprimer(article) {
    const sur = window.confirm(
      `Supprimer « ${article.titre} » ?\n\nLe contenu et ses images seront définitivement effacés. Ses traductions ne sont pas touchées.`,
    );
    if (!sur) return;

    appeler(article, `/api/articles/${article.id}`, { method: 'DELETE' }, () =>
      setListe((l) => l.filter((a) => a.id !== article.id)),
    );
  }

  async function traduire(article, versLangue) {
    const donnees = await appeler(
      article,
      `/api/articles/${article.id}/traduire`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ versLangue }),
      },
      ({ article: nouveau }) => setListe((l) => [nouveau, ...l]),
    );

    if (donnees?.notes) setNote(donnees.notes);
  }

  const filtres = [
    { id: 'tous', libelle: `Tous (${liste.length})` },
    { id: 'fr', libelle: `FR (${liste.filter((a) => a.langue === 'fr').length})` },
    { id: 'en', libelle: `EN (${liste.filter((a) => a.langue === 'en').length})` },
    { id: 'publie', libelle: `Publiés (${liste.filter((a) => a.statut === 'publie').length})` },
    {
      id: 'brouillon',
      libelle: `Brouillons (${liste.filter((a) => a.statut === 'brouillon').length})`,
    },
    { id: 'une', libelle: `À la une (${liste.filter((a) => a.aLaUne).length})` },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-7 gap-y-3 border-b border-encre/10 pb-5">
        {filtres.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFiltre(f.id)}
            className={[
              'surtitre border-b py-1 transition-colors',
              filtre === f.id
                ? 'border-accent text-encre'
                : 'border-transparent text-gris hover:text-encre',
            ].join(' ')}
          >
            {f.libelle}
          </button>
        ))}
      </div>

      {erreur ? (
        <p
          role="alert"
          className="mt-6 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {erreur}
        </p>
      ) : null}

      {/* Les remarques du traducteur : tournures intraduisibles, citations
          dont la formulation compte. C'est ce que la relecture doit vérifier. */}
      {note ? (
        <div className="mt-6 border-l-2 border-accent bg-accent-voile px-5 py-4 text-sm">
          <p className="surtitre text-accent">À vérifier dans la traduction</p>
          <p className="mt-2 text-encre-douce">{note}</p>
          <button
            type="button"
            onClick={() => setNote(null)}
            className="surtitre mt-3 text-gris hover:text-encre"
          >
            Masquer
          </button>
        </div>
      ) : null}

      {visibles.length === 0 ? (
        <p className="mt-14 text-gris">Aucun contenu dans cette vue.</p>
      ) : (
        <ul className="mt-2">
          {visibles.map((article) => {
            const bloque = occupe === article.id;
            const existantes = languesParGroupe.get(article.groupeId) ?? new Set();
            const manquantes = LANGUES.filter((l) => !existantes.has(l.code));

            return (
              <li
                key={article.id}
                className={`flex flex-wrap items-center gap-5 border-b border-encre/10 py-5 transition-opacity ${bloque ? 'opacity-40' : ''}`}
              >
                <div className="h-20 w-16 shrink-0 overflow-hidden bg-papier-casse">
                  {article.couverture ? (
                    <img src={article.couverture} alt="" className="h-full w-full object-cover" />
                  ) : null}
                </div>

                <div className="min-w-[14rem] flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="surtitre bg-papier-casse px-2 py-1 text-encre">
                      {article.langue.toUpperCase()}
                    </span>
                    <span
                      className={[
                        'surtitre px-2.5 py-1',
                        article.statut === 'publie'
                          ? 'bg-encre text-papier'
                          : 'bg-accent-voile text-accent',
                      ].join(' ')}
                    >
                      {article.statut === 'publie' ? 'En ligne' : 'Brouillon'}
                    </span>
                    <span className="surtitre text-accent">
                      {trouverRubrique(article.rubrique).nom}
                    </span>
                    <span className="surtitre text-gris">
                      {trouverFormat(article.format).nom}
                    </span>
                    {article.aLaUne ? (
                      <span className="surtitre px-2.5 py-1 text-accent ring-1 ring-accent">
                        À la une
                      </span>
                    ) : null}
                    {article.humeur ? (
                      <BadgeHumeur humeur={article.humeur} taille="petit" decoratif />
                    ) : null}
                  </div>

                  <p className="titre mt-2 text-xl">{article.titre}</p>
                  <p className="surtitre mt-2 text-gris">
                    {article.auteur} · {formaterDateCourte(article.datePublication)}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-5">
                  {article.statut === 'publie' ? (
                    <Link
                      href={`/${article.langue}/article/${article.slug}`}
                      target="_blank"
                      className="surtitre text-gris transition-colors hover:text-encre"
                    >
                      Voir ↗
                    </Link>
                  ) : null}

                  {/* Une seule langue manquante par contenu, en pratique. */}
                  {manquantes.map((l) => (
                    <button
                      key={l.code}
                      type="button"
                      onClick={() => traduire(article, l.code)}
                      disabled={bloque || !traductionActive}
                      title={
                        traductionActive
                          ? `Créer la version ${l.court} en brouillon, à relire`
                          : 'ANTHROPIC_API_KEY absente : traduction assistée désactivée'
                      }
                      className="surtitre text-accent transition-colors hover:underline disabled:cursor-not-allowed disabled:text-gris-faible disabled:no-underline"
                    >
                      {bloque ? 'Traduction…' : `Traduire → ${l.court}`}
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => basculerStatut(article)}
                    disabled={bloque}
                    className="surtitre text-gris transition-colors hover:text-encre disabled:cursor-wait"
                  >
                    {article.statut === 'publie' ? 'Dépublier' : 'Publier'}
                  </button>

                  <Link
                    href={`/admin/edition/${article.id}`}
                    className="surtitre border border-encre/20 px-5 py-2.5 transition-colors hover:border-encre hover:bg-encre hover:text-papier"
                  >
                    Modifier
                  </Link>

                  <button
                    type="button"
                    onClick={() => supprimer(article)}
                    disabled={bloque}
                    className="surtitre text-gris transition-colors hover:text-red-600 disabled:cursor-wait"
                  >
                    Supprimer
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

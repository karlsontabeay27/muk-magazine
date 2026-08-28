'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ChoixHumeur from '@/components/admin/ChoixHumeur';
import TeleverseurPhotos from '@/components/admin/TeleverseurPhotos';
import { RUBRIQUES, RUBRIQUE_DEFAUT } from '@/lib/rubriques';
import { FORMAT_DEFAUT, formatsDisponibles } from '@/lib/formats';
import { pourChampDate } from '@/lib/dates';
import { LANGUES, LANGUE_DEFAUT } from '@/lib/i18n';

const VIDE = {
  langue: LANGUE_DEFAUT,
  titre: '',
  chapeau: '',
  contenu: '',
  rubrique: RUBRIQUE_DEFAUT,
  format: FORMAT_DEFAUT,
  auteur: 'MUK',
  humeur: null,
  couverture: null,
  galerie: [],
  piecesTenue: [],
  aLaUne: false,
  statut: 'brouillon',
  datePublication: new Date().toISOString(),
};

/**
 * Écriture et modification d'un contenu.
 *
 * Une seule colonne de saisie à gauche, les réglages à droite, et deux
 * boutons — enregistrer, publier. Le champ « statut » n'est jamais présenté
 * comme un menu déroulant obscur.
 */
export default function FormulaireArticle({ article = null }) {
  const router = useRouter();
  const edition = Boolean(article);
  const formats = formatsDisponibles();

  const [valeurs, setValeurs] = useState(() => ({ ...VIDE, ...(article ?? {}) }));
  const [modifie, setModifie] = useState(false);
  const [envoi, setEnvoi] = useState(false);
  const [erreurs, setErreurs] = useState([]);
  const [nouvellePiece, setNouvellePiece] = useState('');

  const modifier = (champ, valeur) => {
    setValeurs((v) => ({ ...v, [champ]: valeur }));
    setModifie(true);
  };

  // Filet de sécurité : on ne quitte pas la page avec un contenu non enregistré.
  useEffect(() => {
    if (!modifie) return undefined;
    const avertir = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', avertir);
    return () => window.removeEventListener('beforeunload', avertir);
  }, [modifie]);

  async function enregistrer(statutForce = null) {
    setEnvoi(true);
    setErreurs([]);

    const charge = { ...valeurs, statut: statutForce ?? valeurs.statut };
    const reponse = await fetch(edition ? `/api/articles/${article.id}` : '/api/articles', {
      method: edition ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(charge),
    });

    if (!reponse.ok) {
      const donnees = await reponse.json().catch(() => ({}));
      setErreurs(donnees.erreurs ?? [donnees.erreur ?? 'L’enregistrement a échoué.']);
      setEnvoi(false);
      return;
    }

    setModifie(false);
    router.refresh();
    router.push('/admin');
  }

  function ajouterPiece() {
    const piece = nouvellePiece.trim();
    if (!piece) return;
    modifier('piecesTenue', [...valeurs.piecesTenue, piece]);
    setNouvellePiece('');
  }

  const champ =
    'mt-3 w-full border border-encre/15 bg-papier px-4 py-3 text-encre outline-none transition-colors focus:border-accent';

  return (
    <div className="contenu py-10">
      {erreurs.length > 0 ? (
        <ul
          role="alert"
          className="mb-8 space-y-1 border-l-2 border-red-500 bg-red-50 px-5 py-4 text-sm text-red-800"
        >
          {erreurs.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      ) : null}

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
        {/* ------------------------------------------------------- Rédaction */}
        <div className="lg:col-span-7">
          <label className="block">
            <span className="surtitre text-gris">Titre</span>
            <input
              type="text"
              value={valeurs.titre}
              onChange={(e) => modifier('titre', e.target.value)}
              placeholder="Ce que la rue portait avant les défilés"
              className={`${champ} titre text-2xl`}
            />
          </label>

          <label className="mt-8 block">
            <span className="surtitre text-gris">Chapeau</span>
            <span className="mt-2 block text-sm text-gris">
              Les deux ou trois lignes sous le titre. C’est ce qui s’affiche sur la carte
              et dans les résultats de recherche.
            </span>
            <textarea
              value={valeurs.chapeau}
              onChange={(e) => modifier('chapeau', e.target.value)}
              rows={3}
              className={champ}
            />
          </label>

          <label className="mt-8 block">
            <span className="surtitre text-gris">Le texte</span>
            <span className="mt-2 block text-sm text-gris">
              Une ligne vide sépare deux paragraphes. <code>## Titre</code> crée une
              section (et une entrée dans le sommaire), <code>### Titre</code> un
              sous-titre, <code>&gt; texte</code> une citation en gros,{' '}
              <code>**gras**</code>, <code>*italique*</code>, <code>---</code> un
              séparateur.
            </span>
            <textarea
              value={valeurs.contenu}
              onChange={(e) => modifier('contenu', e.target.value)}
              rows={22}
              spellCheck
              className={`${champ} font-mono text-[0.9rem] leading-relaxed`}
            />
          </label>

          <div className="mt-10">
            <TeleverseurPhotos
              libelle="Galerie photo"
              aide="Affichée en bas du contenu, en mosaïque cliquable. L’ordre est celui d’ici."
              valeur={valeurs.galerie}
              onChange={(v) => modifier('galerie', v)}
              multiple
            />
          </div>
        </div>

        {/* --------------------------------------------------------- Réglages */}
        <aside className="lg:col-span-5">
          <div className="space-y-9 border border-filet bg-papier p-6">
            <TeleverseurPhotos
              libelle="Image de couverture"
              aide="Obligatoire pour publier. C’est le visuel de la carte, de la une et des partages."
              valeur={valeurs.couverture}
              onChange={(v) => modifier('couverture', v)}
            />

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="surtitre text-gris">Langue</span>
                <select
                  value={valeurs.langue}
                  onChange={(e) => modifier('langue', e.target.value)}
                  className={champ}
                >
                  {LANGUES.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.nom}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="surtitre text-gris">Rubrique</span>
                <select
                  value={valeurs.rubrique}
                  onChange={(e) => modifier('rubrique', e.target.value)}
                  className={champ}
                >
                  {RUBRIQUES.map((r) => (
                    <option key={r.id} value={r.id}>
                      MUK {r.descripteur}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="surtitre text-gris">Format</span>
                <select
                  value={valeurs.format}
                  onChange={(e) => modifier('format', e.target.value)}
                  className={champ}
                >
                  {formats.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.nom}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="surtitre text-gris">Signature</span>
                <input
                  type="text"
                  value={valeurs.auteur}
                  onChange={(e) => modifier('auteur', e.target.value)}
                  placeholder="Prénom Nom"
                  className={champ}
                />
              </label>

              <label className="block">
                <span className="surtitre text-gris">Date</span>
                <input
                  type="date"
                  value={pourChampDate(valeurs.datePublication)}
                  onChange={(e) =>
                    modifier(
                      'datePublication',
                      e.target.value
                        ? new Date(`${e.target.value}T09:00:00`).toISOString()
                        : new Date().toISOString(),
                    )
                  }
                  className={champ}
                />
              </label>
            </div>

            <ChoixHumeur valeur={valeurs.humeur} onChange={(v) => modifier('humeur', v)} />

            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={valeurs.aLaUne}
                onChange={(e) => modifier('aLaUne', e.target.checked)}
                className="mt-1 h-4 w-4 accent-[#1b22cc]"
              />
              <span>
                <span className="surtitre text-encre">Mettre à la une</span>
                <span className="mt-1.5 block text-sm text-gris">
                  Ce contenu occupe le premier écran du site. Une seule une à la fois —
                  la plus récente l’emporte.
                </span>
              </span>
            </label>

            {/* Les pièces n'existent que pour le format « tenue du jour ». */}
            {valeurs.format === 'ofotd' ? (
              <div className="border-l-2 border-accent pl-5">
                <p className="surtitre text-gris">Les pièces portées</p>

                {valeurs.piecesTenue.length > 0 ? (
                  <ul className="mt-4 space-y-2">
                    {valeurs.piecesTenue.map((piece, index) => (
                      <li
                        key={`${piece}-${index}`}
                        className="flex items-start gap-3 text-sm text-encre-douce"
                      >
                        <span className="flex-1">{piece}</span>
                        <button
                          type="button"
                          onClick={() =>
                            modifier(
                              'piecesTenue',
                              valeurs.piecesTenue.filter((_, i) => i !== index),
                            )
                          }
                          className="shrink-0 text-gris transition-colors hover:text-red-600"
                          aria-label={`Retirer « ${piece} »`}
                        >
                          ✕
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}

                <div className="mt-4 flex gap-2">
                  <input
                    type="text"
                    value={nouvellePiece}
                    onChange={(e) => setNouvellePiece(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key !== 'Enter') return;
                      e.preventDefault();
                      ajouterPiece();
                    }}
                    placeholder="Trench en gabardine, ceinture nouée"
                    className="w-full border border-encre/15 bg-papier px-3 py-2.5 text-sm outline-none focus:border-accent"
                  />
                  <button
                    type="button"
                    onClick={ajouterPiece}
                    className="surtitre shrink-0 border border-encre/20 px-4 transition-colors hover:bg-encre hover:text-papier"
                  >
                    Ajouter
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          {/* --------------------------------------------------------- Actions
              Collante seulement à partir de `lg` : en dessous, la colonne des
              réglages passe sous le texte et une barre fixée en bas de l'écran
              recouvrirait les champs qu'on est en train de remplir. */}
          <div className="mt-8 border border-filet bg-papier p-6 lg:sticky lg:bottom-6 lg:z-10">
            <p className="surtitre text-gris">
              État :{' '}
              <span className="text-encre">
                {valeurs.statut === 'publie' ? 'en ligne' : 'brouillon'}
              </span>
              {modifie ? ' · non enregistré' : ''}
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => enregistrer('brouillon')}
                disabled={envoi}
                className="surtitre border border-encre/25 px-6 py-3.5 transition-colors hover:border-encre disabled:opacity-40"
              >
                {envoi ? 'Enregistrement…' : 'Brouillon'}
              </button>

              <button
                type="button"
                onClick={() => enregistrer('publie')}
                disabled={envoi}
                className="surtitre bg-encre px-6 py-3.5 text-papier transition-colors hover:bg-accent disabled:opacity-40"
              >
                {valeurs.statut === 'publie' ? 'Mettre à jour' : 'Publier'}
              </button>

              <Link
                href="/admin"
                className="surtitre px-2 py-3.5 text-gris transition-colors hover:text-encre"
              >
                Annuler
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

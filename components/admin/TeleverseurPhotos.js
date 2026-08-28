'use client';

import { useRef, useState } from 'react';

/**
 * Téléversement de photos.
 *
 * `multiple` distingue les deux usages : la couverture (une seule image) et la
 * galerie (autant qu'on veut, réordonnables). Les fichiers partent un par un
 * vers /api/upload — une photo trop lourde ne fait pas échouer les autres.
 */
export default function TeleverseurPhotos({
  libelle,
  aide,
  valeur,
  onChange,
  multiple = false,
}) {
  const champ = useRef(null);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState(null);
  const [survol, setSurvol] = useState(false);

  const images = multiple ? valeur : valeur ? [valeur] : [];

  async function envoyer(fichiers) {
    const liste = Array.from(fichiers ?? []);
    if (liste.length === 0) return;

    setEnvoi(true);
    setErreur(null);
    const reussies = [];
    const echecs = [];

    for (const fichier of liste) {
      const donnees = new FormData();
      donnees.append('fichier', fichier);

      const reponse = await fetch('/api/upload', { method: 'POST', body: donnees });
      if (reponse.ok) {
        const { url } = await reponse.json();
        reussies.push(url);
      } else {
        const { erreur: message } = await reponse.json().catch(() => ({}));
        echecs.push(`${fichier.name} : ${message ?? 'échec'}`);
      }
    }

    if (reussies.length > 0) {
      onChange(multiple ? [...valeur, ...reussies] : reussies[0]);
    }
    if (echecs.length > 0) setErreur(echecs.join(' · '));

    setEnvoi(false);
    if (champ.current) champ.current.value = ''; // réenvoyer le même fichier reste possible
  }

  function retirer(url) {
    // On retire seulement la référence : le fichier n'est effacé du stockage
    // qu'à la suppression de l'article, pour ne pas casser un enregistrement
    // en cours si Marilyse change d'avis.
    onChange(multiple ? valeur.filter((u) => u !== url) : null);
  }

  function deplacer(index, sens) {
    if (!multiple) return;
    const cible = index + sens;
    if (cible < 0 || cible >= valeur.length) return;
    const copie = [...valeur];
    [copie[index], copie[cible]] = [copie[cible], copie[index]];
    onChange(copie);
  }

  return (
    <div>
      <p className="surtitre text-gris">{libelle}</p>
      {aide ? <p className="mt-2 text-sm font-light text-gris">{aide}</p> : null}

      {images.length > 0 ? (
        <div className={`mt-4 grid gap-3 ${multiple ? 'grid-cols-3 sm:grid-cols-4' : 'grid-cols-2'}`}>
          {images.map((url, index) => (
            <div key={url} className="group relative aspect-[3/4] overflow-hidden bg-papier-casse">
              <img src={url} alt="" className="h-full w-full object-cover" />

              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-encre/70 opacity-0 transition-opacity group-hover:opacity-100">
                {multiple ? (
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => deplacer(index, -1)}
                      disabled={index === 0}
                      className="px-2 py-1 text-papier disabled:opacity-25"
                      aria-label="Déplacer vers la gauche"
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      onClick={() => deplacer(index, 1)}
                      disabled={index === images.length - 1}
                      className="px-2 py-1 text-papier disabled:opacity-25"
                      aria-label="Déplacer vers la droite"
                    >
                      →
                    </button>
                  </div>
                ) : null}

                <button
                  type="button"
                  onClick={() => retirer(url)}
                  className="surtitre text-papier hover:text-accent"
                >
                  Retirer
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <label
        onDragOver={(e) => {
          e.preventDefault();
          setSurvol(true);
        }}
        onDragLeave={() => setSurvol(false)}
        onDrop={(e) => {
          e.preventDefault();
          setSurvol(false);
          envoyer(e.dataTransfer.files);
        }}
        className={[
          'mt-4 flex cursor-pointer flex-col items-center justify-center border border-dashed px-6 py-8 text-center transition-colors',
          survol ? 'border-accent bg-accent/25' : 'border-encre/25 hover:border-accent',
        ].join(' ')}
      >
        <input
          ref={champ}
          type="file"
          accept="image/*"
          multiple={multiple}
          className="sr-only"
          onChange={(e) => envoyer(e.target.files)}
        />
        <span className="surtitre text-encre">
          {envoi ? 'Envoi en cours…' : multiple ? 'Ajouter des photos' : 'Choisir une photo'}
        </span>
        <span className="mt-2 text-sm font-light text-gris">
          Glissez vos fichiers ici — JPG, PNG ou WEBP, 8 Mo maximum
        </span>
      </label>

      {erreur ? (
        <p role="alert" className="mt-3 text-sm text-red-700">
          {erreur}
        </p>
      ) : null}
    </div>
  );
}

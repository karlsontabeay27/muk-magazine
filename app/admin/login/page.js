'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import BadgeHumeur from '@/components/BadgeHumeur';

function Formulaire() {
  const router = useRouter();
  const parametres = useSearchParams();
  const suite = parametres.get('suite') || '/admin';

  const [motDePasse, setMotDePasse] = useState('');
  const [erreur, setErreur] = useState(null);
  const [envoi, setEnvoi] = useState(false);

  async function connecter(e) {
    e.preventDefault();
    setEnvoi(true);
    setErreur(null);

    const reponse = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ motDePasse }),
    });

    if (reponse.ok) {
      // refresh() force le rendu serveur à reprendre en compte le cookie.
      router.replace(suite);
      router.refresh();
      return;
    }

    const { erreur: message } = await reponse.json().catch(() => ({}));
    setErreur(message ?? 'Connexion impossible.');
    setEnvoi(false);
  }

  return (
    <form onSubmit={connecter} className="w-full max-w-sm">
      <BadgeHumeur humeur="kiss" taille="signature" decoratif />

      <p className="surtitre mt-8 text-accent">Rédaction</p>
      <h1 className="titre mt-5 text-4xl">MUK</h1>
      <p className="mt-4 text-sm font-light text-encre-douce">
        Entrez le mot de passe pour accéder à la rédaction.
      </p>

      <label htmlFor="motDePasse" className="surtitre mt-10 block text-gris">
        Mot de passe
      </label>
      <input
        id="motDePasse"
        type="password"
        value={motDePasse}
        onChange={(e) => setMotDePasse(e.target.value)}
        autoFocus
        autoComplete="current-password"
        className="mt-3 w-full border border-encre/15 bg-papier px-4 py-3.5 font-light outline-none transition-colors focus:border-accent"
      />

      {erreur ? (
        <p role="alert" className="mt-4 text-sm text-red-700">
          {erreur}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={envoi || motDePasse.length === 0}
        className="surtitre mt-8 w-full bg-encre py-4 text-papier transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
      >
        {envoi ? 'Connexion…' : 'Entrer'}
      </button>
    </form>
  );
}

export default function PageConnexion() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-papier px-6">
      <Suspense fallback={null}>
        <Formulaire />
      </Suspense>
    </div>
  );
}

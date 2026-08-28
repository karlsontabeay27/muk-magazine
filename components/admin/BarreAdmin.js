'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

/** En-tête du back-office : repères, retour au site, déconnexion. */
export default function BarreAdmin({ titre, action = null }) {
  const router = useRouter();

  async function deconnecter() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.replace('/admin/login');
    router.refresh();
  }

  return (
    <header className="border-b border-encre/10 bg-papier">
      <div className="contenu flex flex-wrap items-center justify-between gap-4 py-5">
        <div>
          <Link href="/admin" className="surtitre text-accent">
            MUK · Rédaction
          </Link>
          <h1 className="titre mt-2 text-3xl">{titre}</h1>
        </div>

        <div className="flex items-center gap-6">
          <Link
            href="/"
            target="_blank"
            className="surtitre text-gris transition-colors hover:text-encre"
          >
            Voir le site ↗
          </Link>
          <button
            type="button"
            onClick={deconnecter}
            className="surtitre text-gris transition-colors hover:text-encre"
          >
            Déconnexion
          </button>
          {action}
        </div>
      </div>
    </header>
  );
}

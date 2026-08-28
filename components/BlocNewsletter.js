'use client';

import { useState } from 'react';
import { TamponMuk } from '@/components/Logo';
import { traducteur } from '@/lib/i18n';

/**
 * §11 de la fiche — la newsletter est l'entrée dans la communauté, pas un
 * encart de pied de page. Elle occupe donc un bloc pleine largeur en encre,
 * le seul renversement de contraste de la page d'accueil.
 *
 * Le formulaire enregistre l'adresse ; l'envoi sera confié à un prestataire
 * (Brevo ou équivalent) au moment du lancement, avec confirmation par e-mail.
 *
 * La langue de lecture part avec l'inscription : c'est elle qui déterminera
 * dans quelle langue la lettre est envoyée.
 */
export default function BlocNewsletter({ langue = 'fr' }) {
  const t = traducteur(langue);
  const [email, setEmail] = useState('');
  const [etat, setEtat] = useState('repos'); // repos | envoi | inscrit | erreur
  const [message, setMessage] = useState(null);

  async function inscrire(e) {
    e.preventDefault();
    setEtat('envoi');
    setMessage(null);

    const reponse = await fetch('/api/newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, langue }),
    });

    const donnees = await reponse.json().catch(() => ({}));

    if (!reponse.ok) {
      setEtat('erreur');
      setMessage(donnees.erreur ?? t('newsletter.erreurGenerique'));
      return;
    }

    setEtat('inscrit');
    setMessage(donnees.message);
    setEmail('');
  }

  return (
    <section id="newsletter" className="scroll-mt-24 bg-encre text-papier">
      <div className="contenu grid grid-cols-1 gap-10 py-16 md:py-24 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-7">
          <TamponMuk className="h-14 w-14" titre="MUK" />

          <h2 className="massif mt-8 text-[clamp(2.2rem,6vw,4.4rem)]">
            {t('newsletter.titre')}{' '}
            <span className="romain lowercase tracking-normal">
              {t('newsletter.titreItalique')}
            </span>
          </h2>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-papier/70">
            {t('newsletter.texte')}
          </p>
        </div>

        <div className="lg:col-span-5 lg:pt-4">
          <form onSubmit={inscrire} className="max-w-md">
            <label htmlFor="email-newsletter" className="surtitre text-papier/55">
              {t('newsletter.label')}
            </label>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <input
                id="email-newsletter"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('newsletter.exemple')}
                autoComplete="email"
                className="w-full border border-papier/25 bg-transparent px-4 py-3.5 text-papier outline-none transition-colors placeholder:text-papier/35 focus:border-accent"
              />
              <button
                type="submit"
                disabled={etat === 'envoi'}
                className="surtitre shrink-0 bg-papier px-7 py-3.5 text-encre transition-colors hover:bg-accent hover:text-white disabled:opacity-50"
              >
                {etat === 'envoi' ? t('newsletter.envoi') : t('newsletter.bouton')}
              </button>
            </div>

            {message ? (
              <p
                role={etat === 'erreur' ? 'alert' : 'status'}
                className={`mt-4 text-sm ${etat === 'erreur' ? 'text-red-300' : 'text-accent'}`}
              >
                {message}
              </p>
            ) : null}

            <p className="mt-6 text-xs leading-relaxed text-papier/45">
              {t('newsletter.mention')}
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}

import PageLegale from '@/components/PageLegale';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Mentions légales',
  description:
    'Éditeur, directeur de la publication, hébergeur et propriété intellectuelle du site MUK.',
  robots: { index: true, follow: true },
  alternates: { canonical: '/mentions-legales' },
};

/** Signale une information que seule la cliente peut fournir. */
function ACompleter({ children }) {
  return <span className="a-completer">À COMPLÉTER — {children}</span>;
}

/**
 * Les textes légaux ne sont pas traduits : ils engagent l'éditeur au regard du
 * droit français, et une version anglaise approximative créerait une ambiguïté
 * juridique. On prévient le lecteur anglophone plutôt que de le laisser
 * découvrir un bloc de français sans explication.
 */
function AvisLangue({ langue }) {
  if (langue !== 'en') return null;
  return (
    <p className="border-l-2 border-accent bg-accent-voile/40 py-3 pl-4 text-sm">
      This page is published in French, the language of the publisher and of the
      applicable law. An English summary is available on request at the contact
      address below.
    </p>
  );
}

export default async function MentionsLegales({ params }) {
  const { langue } = await params;

  return (
    <PageLegale
      langue={langue}
      chemin="/mentions-legales"
      titre="Mentions légales"
      chapeau="Qui édite ce site, qui l’héberge, et à qui s’adresser."
      majLe="29 août 2026"
    >
      <AvisLangue langue={langue} />

      <p>
        Conformément à l’article 6-III de la loi n° 2004-575 du 21 juin 2004 pour la
        confiance dans l’économie numérique, il est porté à la connaissance des
        utilisatrices et utilisateurs du site MUK les informations suivantes.
      </p>

      <h2 id="editeur">Éditeur du site</h2>

      <dl>
        <dt>Dénomination</dt>
        <dd>
          <ACompleter>
            nom de la structure, ou prénom et nom si le site est édité en nom propre
          </ACompleter>
        </dd>

        <dt>Forme juridique</dt>
        <dd>
          <ACompleter>
            association loi 1901, micro-entreprise, SAS… ou « particulier »
          </ACompleter>
        </dd>

        <dt>Siège social</dt>
        <dd>
          <ACompleter>adresse postale complète</ACompleter>
        </dd>

        <dt>Adresse électronique</dt>
        <dd>
          <ACompleter>adresse de contact publiée</ACompleter>
        </dd>

        <dt>Téléphone</dt>
        <dd>
          <ACompleter>numéro, obligatoire pour un éditeur professionnel</ACompleter>
        </dd>

        <dt>Immatriculation</dt>
        <dd>
          <ACompleter>
            numéro SIRET et RCS pour une société ; numéro RNA pour une association
          </ACompleter>
        </dd>

        <dt>TVA intracommunautaire</dt>
        <dd>
          <ACompleter>le cas échéant</ACompleter>
        </dd>
      </dl>

      <p>
        Une personne physique éditant un site à titre non professionnel peut
        n’indiquer publiquement que le nom de son hébergeur, à condition d’avoir
        communiqué à celui-ci ses coordonnées complètes. Dès lors que MUK exerce une
        activité professionnelle ou perçoit des recettes, l’identification complète
        devient obligatoire.
      </p>

      <h2 id="directeur">Directeur de la publication</h2>

      <p>
        <ACompleter>prénom et nom de la personne responsable du contenu</ACompleter>
      </p>

      <p>
        Le directeur de la publication est la personne juridiquement responsable des
        contenus mis en ligne. Pour un média édité par une personne morale, il s’agit
        du représentant légal.
      </p>

      <h2 id="hebergeur">Hébergeur</h2>

      <dl>
        <dt>Site</dt>
        <dd>Vercel Inc.</dd>
        <dt>Adresse</dt>
        <dd>
          340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis —{' '}
          <ACompleter>
            à confirmer sur la page légale de Vercel au moment de la mise en ligne
          </ACompleter>
        </dd>
        <dt>Site web</dt>
        <dd>
          <a href="https://vercel.com" rel="noopener noreferrer" target="_blank">
            vercel.com
          </a>
        </dd>

        <dt>Base de données et médias</dt>
        <dd>Supabase Inc.</dd>
        <dt>Région d’hébergement</dt>
        <dd>
          <ACompleter>région du projet Supabase, à choisir dans l’Union européenne</ACompleter>
        </dd>
      </dl>

      <h2 id="conception">Conception et développement</h2>

      <p>
        <ACompleter>nom ou raison sociale du prestataire, et lien éventuel</ACompleter>
      </p>

      <h2 id="propriete">Propriété intellectuelle</h2>

      <p>
        L’ensemble des contenus publiés sur ce site — textes, photographies,
        illustrations, identité visuelle, mise en page — est protégé par le droit
        d’auteur. Sauf mention contraire, ils sont la propriété de l’éditeur ou de
        leurs auteurs respectifs.
      </p>

      <p>
        Toute reproduction, représentation, adaptation ou exploitation, totale ou
        partielle, par quelque procédé que ce soit, sans autorisation écrite
        préalable, est interdite. La citation courte reste permise dans les
        conditions de l’article L.122-5 du code de la propriété intellectuelle, sous
        réserve d’indiquer clairement le nom de l’auteur et la source.
      </p>

      <h3>Crédits</h3>

      <ul>
        <li>
          Typographies : Archivo et Archivo Black (Omnibus-Type), Instrument Serif
          (Instrument), Newsreader (Production Type), toutes distribuées sous licence
          SIL Open Font License.
        </li>
        <li>
          Photographies : <ACompleter>crédits par auteur, ou banque d’images utilisée</ACompleter>
        </li>
      </ul>

      <h2 id="signalement">Signaler un contenu</h2>

      <p>
        Toute personne estimant qu’un contenu publié porte atteinte à ses droits peut
        le signaler à l’adresse de contact ci-dessus, en précisant l’adresse exacte de
        la page, la nature du contenu contesté et les motifs de la demande.
      </p>

      <p>
        Un droit de réponse peut être exercé dans les conditions prévues par
        l’article 6-IV de la loi du 21 juin 2004, dans un délai de trois mois à
        compter de la mise en ligne du contenu concerné.
      </p>

      <h2 id="donnees">Données personnelles</h2>

      <p>
        Le traitement des données personnelles est détaillé dans la{' '}
        <a href="/confidentialite">politique de confidentialité</a>.
      </p>
    </PageLegale>
  );
}

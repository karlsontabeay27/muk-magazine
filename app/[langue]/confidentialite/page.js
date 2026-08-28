import PageLegale from '@/components/PageLegale';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Politique de confidentialité',
  description:
    'Quelles données MUK collecte, pourquoi, combien de temps, et comment exercer ses droits.',
  robots: { index: true, follow: true },
  alternates: { canonical: '/confidentialite' },
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

export default async function Confidentialite({ params }) {
  const { langue } = await params;

  return (
    <PageLegale
      langue={langue}
      chemin="/confidentialite"
      titre="Confidentialité"
      chapeau="Ce que MUK collecte, pourquoi, combien de temps — et comment vous y opposer."
      majLe="29 août 2026"
    >
      <AvisLangue langue={langue} />

      <p>
        MUK collecte le strict nécessaire à son fonctionnement. Concrètement : une
        adresse e-mail si vous vous inscrivez à la newsletter, et rien d’autre.
      </p>

      <h2 id="responsable">Responsable du traitement</h2>

      <dl>
        <dt>Responsable</dt>
        <dd>
          <ACompleter>identité de l’éditeur, identique aux mentions légales</ACompleter>
        </dd>
        <dt>Contact</dt>
        <dd>
          <ACompleter>adresse e-mail dédiée aux demandes, ex. privacy@…</ACompleter>
        </dd>
        <dt>Délégué à la protection des données</dt>
        <dd>
          Non désigné. Cette désignation n’est pas obligatoire au vu du volume et de
          la nature des données traitées.
        </dd>
      </dl>

      <h2 id="ce-que-nous-ne-faisons-pas">Ce que ce site ne fait pas</h2>

      <p>
        Cette section vient en premier parce qu’elle répond à la plupart des
        questions. Ce site :
      </p>

      <ul>
        <li>n’utilise <strong>aucun outil de mesure d’audience</strong> — ni Google Analytics, ni équivalent ;</li>
        <li>ne dépose <strong>aucun traceur publicitaire</strong> et ne fait pas de profilage ;</li>
        <li>n’intègre <strong>aucun bouton de réseau social</strong> susceptible de vous suivre ;</li>
        <li>
          héberge ses propres typographies : contrairement à l’usage courant, elles ne
          sont pas chargées depuis les serveurs de Google, votre adresse IP n’est donc
          transmise à aucun tiers pour les afficher ;
        </li>
        <li>ne revend, ne loue et n’échange aucune donnée.</li>
      </ul>

      <p>
        Aucun cookie de mesure ni de publicité n’étant déposé, <strong>ce site n’a pas
        besoin d’afficher de bandeau de consentement</strong>. Le seul cookie existant
        est celui de connexion de la rédaction, décrit plus bas.
      </p>

      <h2 id="donnees">Données collectées</h2>

      <h3>Inscription à la newsletter</h3>

      <dl>
        <dt>Données</dt>
        <dd>Adresse e-mail, langue choisie, date d’inscription.</dd>
        <dt>Finalité</dt>
        <dd>Vous envoyer la lettre d’information de MUK.</dd>
        <dt>Base légale</dt>
        <dd>Votre consentement (article 6.1.a du RGPD).</dd>
        <dt>Conservation</dt>
        <dd>
          Jusqu’à votre désinscription, et au plus tard trois ans après votre dernière
          interaction avec nos envois.
        </dd>
      </dl>

      <p>
        Un lien de désinscription figure dans chaque message. Vous pouvez retirer
        votre consentement à tout moment, sans avoir à vous justifier ; ce retrait ne
        remet pas en cause les envois déjà effectués.
      </p>

      <h3>Journaux de connexion</h3>

      <dl>
        <dt>Données</dt>
        <dd>
          Adresse IP, type de navigateur, pages consultées, date et heure — enregistrés
          automatiquement par l’hébergeur.
        </dd>
        <dt>Finalité</dt>
        <dd>
          Assurer le fonctionnement du site, sa sécurité et détecter les abus
          (tentatives de connexion répétées, inondation du formulaire).
        </dd>
        <dt>Base légale</dt>
        <dd>Intérêt légitime à protéger le service (article 6.1.f du RGPD).</dd>
        <dt>Conservation</dt>
        <dd>Durée courte, définie par l’hébergeur, sans exploitation commerciale.</dd>
      </dl>

      <h3>Cookie de connexion à la rédaction</h3>

      <p>
        Un unique cookie, nommé <code>muk_session</code>, est déposé lorsqu’un membre
        de la rédaction se connecte à l’espace d’administration. Il est strictement
        nécessaire au fonctionnement de cet espace, expire au bout de douze heures et
        n’est jamais déposé pour les lectrices et lecteurs du site.
      </p>

      <h2 id="destinataires">Qui a accès à ces données</h2>

      <p>
        Les données ne sont accessibles qu’à l’éditeur et aux prestataires techniques
        strictement nécessaires, qui agissent sur instruction et ne peuvent en faire
        aucun autre usage.
      </p>

      <dl>
        <dt>Vercel Inc.</dt>
        <dd>
          Hébergement du site. États-Unis. Transferts encadrés par les clauses
          contractuelles types de la Commission européenne.
        </dd>
        <dt>Supabase Inc.</dt>
        <dd>
          Base de données et stockage des images.{' '}
          <ACompleter>préciser la région, à choisir dans l’Union européenne</ACompleter>
        </dd>
        <dt>Envoi des lettres</dt>
        <dd>
          <ACompleter>
            prestataire retenu — Brevo, Beehiiv ou équivalent — et pays d’hébergement
          </ACompleter>
        </dd>
      </dl>

      <h2 id="droits">Vos droits</h2>

      <p>
        Vous disposez à tout moment d’un droit d’accès, de rectification, d’effacement,
        de limitation, d’opposition et de portabilité sur vos données, ainsi que du
        droit de retirer votre consentement.
      </p>

      <p>
        Pour les exercer, écrivez à l’adresse de contact indiquée en haut de cette
        page. Une réponse vous sera apportée dans un délai d’un mois. Il pourra vous
        être demandé de justifier de votre identité en cas de doute raisonnable.
      </p>

      <p>
        Si la réponse ne vous satisfait pas, vous pouvez introduire une réclamation
        auprès de la Commission nationale de l’informatique et des libertés :
        3 place de Fontenoy, TSA 80715, 75334 Paris Cedex 07 —{' '}
        <a href="https://www.cnil.fr" rel="noopener noreferrer" target="_blank">
          cnil.fr
        </a>
        .
      </p>

      <h2 id="securite">Sécurité</h2>

      <ul>
        <li>Le site est servi exclusivement en HTTPS.</li>
        <li>
          L’espace de rédaction est protégé par mot de passe, avec limitation du nombre
          de tentatives ; le mot de passe n’est stocké dans aucune base de données.
        </li>
        <li>
          Le cookie de session est inaccessible au JavaScript de la page et signé
          cryptographiquement.
        </li>
        <li>
          Le formulaire d’inscription répond de la même façon que l’adresse soit
          nouvelle ou déjà enregistrée : il ne permet pas de vérifier si une adresse
          figure dans la liste.
        </li>
      </ul>

      <h2 id="mineurs">Mineurs</h2>

      <p>
        L’inscription à la newsletter n’est pas destinée aux personnes de moins de
        quinze ans sans l’accord de leur représentant légal. Aucune donnée n’est
        collectée sciemment auprès d’un public plus jeune ; si une telle inscription
        nous est signalée, elle est supprimée.
      </p>

      <h2 id="modifications">Modifications</h2>

      <p>
        Cette politique peut évoluer, notamment lorsqu’un nouveau service est ajouté.
        La date de dernière mise à jour figure en tête de page. En cas de changement
        substantiel touchant la newsletter, les personnes inscrites en sont informées
        par e-mail.
      </p>
    </PageLegale>
  );
}

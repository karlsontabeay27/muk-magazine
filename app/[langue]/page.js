import { notFound } from 'next/navigation';
import Entete from '@/components/Entete';
import Une from '@/components/Une';
import DerniersContenus from '@/components/DerniersContenus';
import SectionRubrique from '@/components/SectionRubrique';
import BlocNewsletter from '@/components/BlocNewsletter';
import PiedDePage from '@/components/PiedDePage';
import { listerArticles } from '@/lib/db';
import { rubriquesVivantes } from '@/lib/rubriques';
import { CODES, langueValide, traducteur } from '@/lib/i18n';
import { alternatesDepuis, liensDirects } from '@/lib/liens';
import { SITE_URL } from '@/lib/site';

// La page se recalcule à chaque visite : un contenu publié apparaît sans
// redéploiement ni délai de cache.
export const dynamic = 'force-dynamic';

/** Les deux langues sont connues d'avance : Next peut préparer les routes. */
export function generateStaticParams() {
  return CODES.map((langue) => ({ langue }));
}

export async function generateMetadata({ params }) {
  const { langue } = await params;
  if (!langueValide(langue)) return {};

  const t = traducteur(langue);
  return {
    // `absolute` court-circuite le gabarit « %s — MUK » de la mise en page
    // racine : sans ça l'accueil s'appellerait « MUK — media culturel — MUK ».
    title: { absolute: t('meta.titre') },
    description: t('meta.description'),
    alternates: alternatesDepuis(liensDirects(''), langue),
  };
}

export default async function Accueil({ params }) {
  const { langue } = await params;
  if (!langueValide(langue)) notFound();

  const contenus = await listerArticles({ langue });

  // La une est celle que la rédaction a marquée ; à défaut, la plus récente.
  const une = contenus.find((c) => c.aLaUne) ?? contenus[0] ?? null;
  const reste = contenus.filter((c) => c.id !== une?.id);

  const rubriques = rubriquesVivantes(contenus);

  // Organisation + site : hors de generateMetadata (qui ne rend que des
  // balises <meta>), donc posé ici en JSON-LD. C'est ce schéma que Google
  // utilise pour le logo affiché à côté du nom du site dans les résultats.
  const donneesStructurees = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        name: 'MUK',
        url: SITE_URL,
        logo: `${SITE_URL}/marque/muk-tampon-512.png`,
      },
      {
        '@type': 'WebSite',
        name: 'MUK',
        url: SITE_URL,
      },
    ],
  };

  return (
    <>
      <Entete langue={langue} rubriques={rubriques} liensLangue={liensDirects('')} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(donneesStructurees) }}
      />

      <main>
        <Une contenu={une} langue={langue} />

        <DerniersContenus contenus={reste.slice(0, 4)} langue={langue} />

        {/* Une section par rubrique vivante, dans l'ordre de la fiche.
            Les fonds alternent pour découper la page sans ajouter de trait. */}
        {rubriques.map((rubrique, index) => (
          <SectionRubrique
            key={rubrique.id}
            rubrique={rubrique}
            langue={langue}
            contenus={reste.filter((c) => c.rubrique === rubrique.id).slice(0, 3)}
            fondCasse={index % 2 === 1}
          />
        ))}

        <BlocNewsletter langue={langue} />
      </main>

      <PiedDePage langue={langue} rubriques={rubriques} />
    </>
  );
}

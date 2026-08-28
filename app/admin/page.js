import Link from 'next/link';
import BarreAdmin from '@/components/admin/BarreAdmin';
import ListeArticles from '@/components/admin/ListeArticles';
import { listerArticles, utiliseSupabase } from '@/lib/db';
import { traductionDisponible } from '@/lib/traduction';

export const dynamic = 'force-dynamic';

export default async function TableauDeBord() {
  const articles = await listerArticles({ inclureBrouillons: true });

  return (
    <>
      <BarreAdmin
        titre="Les contenus"
        action={
          <Link
            href="/admin/nouveau"
            className="surtitre bg-encre px-6 py-3.5 text-papier transition-colors hover:bg-accent"
          >
            + Nouveau contenu
          </Link>
        }
      />

      <main className="contenu py-12">
        {!utiliseSupabase ? (
          <p className="mb-10 border-l-2 border-accent bg-papier px-5 py-4 text-sm font-light text-encre-douce">
            <strong className="font-medium">Mode démonstration.</strong> Les articles sont
            enregistrés dans <code>data/articles.json</code> et les photos dans{' '}
            <code>public/uploads/</code>. Renseignez les deux variables Supabase dans{' '}
            <code>.env.local</code> pour basculer sur la vraie base — sans rien changer d’autre.
          </p>
        ) : null}

        <ListeArticles articles={articles} traductionActive={traductionDisponible()} />
      </main>
    </>
  );
}

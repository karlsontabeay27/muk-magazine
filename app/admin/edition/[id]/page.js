import { notFound } from 'next/navigation';
import BarreAdmin from '@/components/admin/BarreAdmin';
import FormulaireArticle from '@/components/admin/FormulaireArticle';
import { lireArticle } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function EditionArticle({ params }) {
  const { id } = await params;
  const article = await lireArticle(id);
  if (!article) notFound();

  return (
    <>
      <BarreAdmin titre="Modifier le contenu" />
      <FormulaireArticle article={article} />
    </>
  );
}

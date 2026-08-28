import BarreAdmin from '@/components/admin/BarreAdmin';
import FormulaireArticle from '@/components/admin/FormulaireArticle';

export default function NouvelArticle() {
  return (
    <>
      <BarreAdmin titre="Nouveau contenu" />
      <FormulaireArticle />
    </>
  );
}

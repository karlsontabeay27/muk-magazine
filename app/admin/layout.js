export const metadata = {
  title: 'Rédaction',
  // Le back-office ne doit jamais remonter dans les résultats de recherche.
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }) {
  return <div className="min-h-svh bg-papier-casse/50">{children}</div>;
}

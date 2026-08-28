import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ancre la racine sur ce dossier : un package-lock.json traîne plus haut
  // dans l'arborescence et Next choisirait ce dossier-là par défaut.
  outputFileTracingRoot: dirname(fileURLToPath(import.meta.url)),

  // Pas d'export statique ici : l'admin et l'upload ont besoin d'un serveur.
  images: {
    remotePatterns: [
      // Les photos servies par Supabase Storage une fois le projet branché.
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
};

export default nextConfig;

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

  // En-têtes de sécurité, sur toutes les routes. `/admin` est le seul
  // vrai point sensible (accès en écriture à la base), mais les poser
  // partout ne coûte rien et protège aussi les pages publiques.
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Empêche d'encapsuler le site dans une <iframe> tierce : sans ça,
          // /admin/login est chargeable en clickjacking pour piéger un clic
          // de la rédaction déjà connectée.
          { key: 'X-Frame-Options', value: 'DENY' },
          // Interdit au navigateur de deviner un type MIME différent de
          // celui déclaré — bloque une classe de contournements de filtre.
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Ne transmet jamais l'URL complète à un site tiers référencé.
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Le site n'a besoin d'aucun capteur ni permission matérielle.
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;

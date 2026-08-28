/**
 * Le logotype MUK, en tracés vectoriels.
 *
 * Les lettres sont vectorisées (voir public/marque/) : le logo ne dépend
 * d'aucune police chargée, donc il ne saute pas pendant le chargement de la
 * page. `fill="currentColor"` le rend noir ou blanc selon le contexte.
 *
 * Le descripteur romain n'est jamais dans le tracé : c'est du texte à côté,
 * ce qui permet de le changer selon la rubrique consultée sans toucher au
 * fichier du logo.
 */
export function LogoMuk({ className = '', titre = 'MUK' }) {
  return (
    <svg
      viewBox="0.000 -137.600 567.600 140.000"
      className={className}
      fill="currentColor"
      role="img"
      aria-label={titre}
    >
      <path d="M665 0V248Q665 294 668.5 342.5Q672 391 676.0 424.0Q680 457 681 466H677L550 0H377L249 465H245Q246 456 250.5 423.5Q255 391 259.0 342.5Q263 294 263 248V0H60V688H372L476 291H480L583 688H884V0Z" transform="translate(0.0000 0.0000) scale(0.200000 -0.200000)" />
  <path d="M417 -12Q253 -12 163.5 62.0Q74 136 74 277V688H295V280Q295 222 326.0 187.5Q357 153 416 153Q475 153 506.5 188.0Q538 223 538 280V688H759V277Q759 136 670.0 62.0Q581 -12 417 -12Z" transform="translate(181.8000 0.0000) scale(0.200000 -0.200000)" />
  <path d="M540 688H814L567 405L819 0H558L415 252L295 154V0H74V688H295V394Z" transform="translate(341.4000 0.0000) scale(0.200000 -0.200000)" />
  <path className="muk-point" d="M61 0V199H273V0Z" transform="translate(501.0000 0.0000) scale(0.200000 -0.200000)" />
    </svg>
  );
}

/** Le tampon carré : avatar, favicon, marquage d'image. */
export function TamponMuk({ className = '', titre = 'MUK' }) {
  return (
    <svg
      viewBox="0.000 0.000 767.027 767.027"
      className={className}
      fill="currentColor"
      role="img"
      aria-label={titre}
    >
      <rect x="0" y="0" width="767.027" height="767.027" />
  <g transform="translate(99.714 451.114)" fill="var(--color-papier)">
    <path d="M665 0V248Q665 294 668.5 342.5Q672 391 676.0 424.0Q680 457 681 466H677L550 0H377L249 465H245Q246 456 250.5 423.5Q255 391 259.0 342.5Q263 294 263 248V0H60V688H372L476 291H480L583 688H884V0Z" transform="translate(0.0000 0.0000) scale(0.200000 -0.200000)" />
    <path d="M417 -12Q253 -12 163.5 62.0Q74 136 74 277V688H295V280Q295 222 326.0 187.5Q357 153 416 153Q475 153 506.5 188.0Q538 223 538 280V688H759V277Q759 136 670.0 62.0Q581 -12 417 -12Z" transform="translate(181.8000 0.0000) scale(0.200000 -0.200000)" />
    <path d="M540 688H814L567 405L819 0H558L415 252L295 154V0H74V688H295V394Z" transform="translate(341.4000 0.0000) scale(0.200000 -0.200000)" />
    <path className="muk-point" d="M61 0V199H273V0Z" transform="translate(501.0000 0.0000) scale(0.200000 -0.200000)" />
  </g>
    </svg>
  );
}

/**
 * Verrouillage complet : le mot-symbole et son descripteur, alignés sur la
 * ligne de base. `descripteur` suit la rubrique consultée — c'est le système
 * modulaire arrêté avec le client (magazine, sounds, people…).
 */
export default function Logo({ descripteur = 'magazine', className = '', tailleMot = 'h-6 md:h-7' }) {
  return (
    <span className={`inline-flex items-baseline gap-[0.42em] ${className}`}>
      <LogoMuk className={`${tailleMot} w-auto`} titre={`MUK ${descripteur}`} />
      {descripteur ? (
        <span
          aria-hidden="true"
          className="romain text-[0.98rem] leading-none md:text-[1.15rem]"
        >
          {descripteur}
        </span>
      ) : null}
    </span>
  );
}

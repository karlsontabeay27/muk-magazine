/**
 * Bibliothèque de bitmojis / humeurs.
 *
 * Les illustrations de Marilyse vivent dans /public/bitmoji/. Le champ `image`
 * reprend le nom de fichier tel qu'elle l'exporte (d'où `you.png` et
 * `bisous.png`) : c'est le code qui s'aligne sur ses fichiers, pas l'inverse.
 *
 * Chaque humeur garde un emoji de repli : si un fichier manque, le badge
 * affiche l'emoji plutôt qu'une image cassée.
 *
 * Ajouter une variante = ajouter une entrée dans ce tableau et déposer le PNG
 * correspondant. Rien d'autre à toucher dans le projet — le sélecteur de
 * l'admin et les badges du site se mettent à jour tout seuls.
 *
 * `zoom` et `decalage` cadrent le bitmoji dans le disque, tous deux
 * optionnels. Les illustrations sont carrées comme le badge : par défaut
 * l'image remplit exactement le disque et seuls les coins du carré (tresses,
 * sac) sont rognés par le masque rond. Un zoom > 1 resserre sur le visage ;
 * `decalage` ('-6%' par exemple) remonte ce que l'on garde.
 */
export const HUMEURS = [
  {
    id: 'cool',
    label: 'Posée / Confiante',
    emoji: '😎',
    image: '/bitmoji/you.png',
    zoom: 1,
    decalage: '0%',
    description: 'Tendances, lifestyle, pièces qui en jettent.',
  },
  {
    id: 'kiss',
    label: 'Bisou / Coup de cœur',
    emoji: '💋',
    image: '/bitmoji/bisous.png',
    zoom: 1,
    decalage: '0%',
    description: 'Coups de cœur, articles feel-good, pièces qu’on adore.',
  },
  {
    id: 'surprise',
    label: 'Surprise / Waouh',
    emoji: '😮',
    image: '/bitmoji/surprise.png',
    zoom: 1,
    decalage: '0%',
    description: 'Nouveautés, découvertes, « qu’est-ce que c’est que ça ? ».',
  },
  {
    id: 'balcon',
    label: 'Au balcon / En observation',
    emoji: '👀',
    image: '/bitmoji/balcon.png',
    zoom: 1,
    decalage: '0%',
    description: 'Reportages, street style, ce que j’ai vu passer dans la rue.',
  },
];

/**
 * Aucun bitmoji est un choix valide, et c'est le défaut sur MUK : le badge
 * sert les contenus personnels, pas les reportages. Un identifiant absent ou
 * inconnu ne déclenche donc aucun repli — il n'affiche simplement rien.
 */
export function trouverHumeur(id) {
  return id ? (HUMEURS.find((h) => h.id === id) ?? null) : null;
}

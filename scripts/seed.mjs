/**
 * Remplit data/articles.json avec le contenu de démonstration de MUK.
 * Écrase le fichier existant :  npm run seed
 *
 * Chaque rubrique a au moins un contenu : c'est la condition pour qu'elle
 * apparaisse dans la navigation (voir lib/rubriques.js) et pour que la
 * maquette montre le média tel qu'il sera, pas une coquille à moitié vide.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const contenus = [
  {
    titre: 'Ceux qui font danser Paris à 6 h du matin',
    chapeau:
      "Ils programment des salles de cent personnes, ne vivent pas de la musique et tiennent la scène électronique parisienne à bout de bras. Trois nuits avec les collectifs qui refusent de choisir entre l'exigence et la fête.",
    rubrique: 'sound',
    format: 'portrait',
    auteur: 'Marilyse',
    aLaUne: true,
    couverture: '/placeholders/editorial-2.svg',
    galerie: ['/placeholders/editorial-5.svg', '/placeholders/large-2.svg'],
    datePublication: '2026-08-26T08:00:00.000Z',
    contenu: `Il est six heures du matin et personne ne regarde l'heure. C'est peut-être la seule définition utile d'une bonne soirée.

## Une économie de la débrouille

Aucun des collectifs rencontrés ne vit de la musique. Ils sont graphistes, infirmiers, étudiants en droit. La billetterie paie la salle, la salle paie l'ingénieur son, et ce qui reste part dans le prochain événement. Personne ne s'en plaint, mais personne ne s'en cache non plus.

> On ne construit pas une scène avec des budgets. On la construit avec des gens qui reviennent.

## Ce que la fermeture des lieux a produit

Chaque salle qui ferme déplace une communauté. Depuis trois ans, cette communauté-là s'est répartie dans des lieux qui n'étaient pas prévus pour elle : friches, sous-sols associatifs, péniches. La contrainte a produit une esthétique, et l'esthétique a produit un public.

## La question qui revient

Faut-il grossir ? Tous répondent non, et tous préparent une date plus grande. C'est la contradiction ordinaire des scènes qui marchent.`,
  },
  {
    titre: 'La diaspora n’est pas un décor',
    chapeau:
      "On lui demande de raconter ses origines à chaque interview. Elle voudrait qu'on parle de son travail. Sur l'assignation à l'identité dans les milieux culturels.",
    rubrique: 'ideas',
    format: 'essai',
    auteur: 'Nadia K.',
    couverture: '/placeholders/editorial-3.svg',
    galerie: [],
    datePublication: '2026-08-24T09:30:00.000Z',
    contenu: `Il existe une question qu'on pose aux artistes issus de la diaspora et qu'on ne pose jamais aux autres : « d'où venez-vous, vraiment ? »

## Le compliment qui assigne

On appelle ça de la curiosité, parfois de la valorisation. C'est souvent une manière polie de rappeler à quelqu'un qu'il est invité, pas chez lui. Le mécanisme est d'autant plus efficace qu'il se présente comme bienveillant.

> Être visible et être compris sont deux choses différentes. La première se négocie, la seconde se mérite.

## Ce que produit l'assignation

Un créateur assigné à son origine finit par produire ce qu'on attend de lui, ou par produire contre cette attente. Dans les deux cas, il ne travaille plus librement : il répond.

## Sortir du dilemme

Il n'y a pas de solution individuelle à un problème collectif. Il y a des rédactions qui changent leurs questions, des institutions qui changent leurs commandes, et des médias qui décident de parler du travail avant de parler de la trajectoire. C'est le pari de cette rubrique.`,
  },
  {
    titre: 'Le tailleur oversize, nouvelle seconde peau',
    chapeau:
      "Épaules marquées, pantalon fluide, rien en dessous qu'un débardeur de coton : le tailleur a quitté le bureau et ne compte pas y revenir.",
    rubrique: 'fashion',
    format: 'article',
    auteur: 'Marilyse',
    humeur: 'cool',
    couverture: '/placeholders/editorial-1.svg',
    galerie: ['/placeholders/editorial-4.svg', '/placeholders/large-1.svg'],
    datePublication: '2026-08-22T09:00:00.000Z',
    contenu: `Il y a des vêtements qu'on emprunte et qu'on ne rend jamais. Le tailleur oversize est de ceux-là : trop grand par principe, jamais par accident.

## D'où vient cette coupe

On la doit à une décennie qui n'avait peur de rien : les années 80, leurs épaulettes, leur goût du volume. La différence tient dans la matière. Là où l'on empesait, on laisse tomber.

> Le vrai luxe, ce n'est pas la coupe ajustée. C'est la place qu'on se laisse dedans.

## Comment le porter sans se noyer

Un seul volume à la fois. Veste ample, alors bas près du corps. Pantalon large, alors haut ajusté. Le déséquilibre est ce qui rend l'ensemble lisible.

## La pièce qui change tout

Une ceinture fine, portée à même la veste. Elle redessine une taille et fait passer l'ensemble du vestiaire emprunté à la pièce pensée pour soi.`,
  },
  {
    titre: 'Trois heures dans l’atelier de Sablé Diop',
    chapeau:
      "Elle coud depuis ses quatorze ans, expose depuis ses vingt-trois, et refuse toujours de parler de « mode africaine ». Rencontre dans son atelier du 19e.",
    rubrique: 'people',
    format: 'interview',
    auteur: 'Marilyse',
    couverture: '/placeholders/editorial-7.svg',
    galerie: ['/placeholders/editorial-9.svg'],
    datePublication: '2026-08-20T10:00:00.000Z',
    contenu: `L'atelier fait vingt mètres carrés et contient quatre machines, deux mannequins et environ six cents chutes de tissu classées par couleur.

## Sur les débuts

### Vous avez appris seule ?

Avec ma mère, puis contre elle. Elle voulait des finitions parfaites, je voulais aller vite. Il m'a fallu dix ans pour comprendre qu'elle avait raison.

### Pourquoi refuser l'étiquette « mode africaine » ?

Parce qu'on ne dit jamais « mode européenne ». On dit une maison, un créateur, une saison. L'étiquette réduit un continent à un motif.

> Quand on me demande d'où viennent mes tissus, je réponds : d'un grossiste à Château Rouge. Ça déçoit beaucoup de monde.

## Sur la suite

### Une collection cette année ?

Six pièces, pas plus. Je préfère six pièces que je peux défendre à trente que je subis.`,
  },
  {
    titre: 'Marseille, la scène que Paris regarde enfin',
    chapeau:
      "Labels, galeries, friches : la ville a construit en dix ans un écosystème culturel qui n'attend plus la validation de la capitale. Reportage.",
    rubrique: 'city',
    format: 'photo',
    auteur: 'Yanis B.',
    couverture: '/placeholders/large-3.svg',
    galerie: [
      '/placeholders/editorial-6.svg',
      '/placeholders/editorial-8.svg',
      '/placeholders/editorial-3.svg',
    ],
    datePublication: '2026-08-18T08:15:00.000Z',
    contenu: `La première chose qu'on remarque, c'est que personne ne parle de Paris.

## Une économie parallèle

Les loyers ont permis ce que Paris interdit : des ateliers grands, des collectifs stables, des projets qui durent plus qu'une saison. La précarité existe, mais elle n'est plus le seul horizon.

> Ici, on n'a pas monté une scène contre Paris. On a monté une scène sans y penser.

## Ce qui change vraiment

Les institutions suivent. Les grandes maisons repèrent. Le risque est connu et déjà nommé par tout le monde : que la ville devienne une ressource et non un lieu.`,
  },
  {
    titre: 'Le cinéma d’auteur a-t-il encore un public de vingt ans ?',
    chapeau:
      "Salles vides en semaine, files d'attente le samedi soir pour une rétrospective : le public jeune n'a pas disparu, il a changé de rythme.",
    rubrique: 'culture',
    format: 'article',
    auteur: 'Marilyse',
    couverture: '/placeholders/editorial-4.svg',
    galerie: [],
    datePublication: '2026-08-14T09:00:00.000Z',
    contenu: `Le constat revient chaque année : les jeunes désertent les salles. Les chiffres disent autre chose de plus intéressant.

## Ils ne désertent pas, ils se regroupent

Une séance ordinaire un mardi soir attire quinze personnes. La même œuvre, programmée en rétrospective un samedi, avec une présentation et un verre après, en attire deux cents.

> Ce n'est pas le film qui a changé. C'est ce qu'on met autour.

## L'événement contre le catalogue

Face à des plateformes qui offrent tout, tout le temps, la salle ne peut plus gagner sur la disponibilité. Elle gagne sur ce que le streaming ne fera jamais : une heure précise, un lieu précis, des gens.`,
  },
  {
    titre: 'Trench beige, bottes hautes et un sac trop petit',
    chapeau: "Le premier jour où l'air sent l'automne — on a toutes une tenue pour ça.",
    rubrique: 'fashion',
    format: 'ofotd',
    auteur: 'Marilyse',
    humeur: 'kiss',
    piecesTenue: [
      'Trench en gabardine de coton, ceinture nouée jamais bouclée',
      'Maille côtelée crème, col montant',
      'Pantalon droit chocolat, ourlet au-dessus de la cheville',
      'Bottes en cuir souple, talon carré 5 cm',
      'Sac baguette, assez grand pour un téléphone et rien d’autre',
    ],
    couverture: '/placeholders/editorial-5.svg',
    galerie: ['/placeholders/editorial-1.svg'],
    datePublication: '2026-08-12T06:30:00.000Z',
    contenu: `Il a fait quatorze degrés ce matin et j'ai su exactement quoi mettre. C'est le seul jour de l'année où la garde-robe s'organise toute seule.

## Le trench, ceinture nouée

Bouclée, elle fait uniforme. Nouée, elle fait vivant. Un détail de trois secondes qui change tout le reste.

## Le camaïeu chocolat et crème

Deux tons chauds, aucune couleur franche. On croit que c'est discret ; c'est en réalité ce qui se remarque le plus dans une rue grise.`,
  },
  {
    titre: 'J’ai quitté l’école d’art et je ne le regrette pas',
    chapeau:
      "Trois ans d'études, deux ans de doute, une décision. Ce que je voudrais dire à celles et ceux qui hésitent en ce moment.",
    rubrique: 'people',
    format: 'tribune',
    auteur: 'Léa Mensah',
    couverture: '/placeholders/editorial-6.svg',
    galerie: [],
    datePublication: '2026-08-08T11:00:00.000Z',
    contenu: `On m'avait prévenue que ce serait dur. Personne ne m'avait dit que ce serait vide.

## Ce qui manquait

Pas les moyens, pas les professeurs. Le sens. Je produisais pour des rendus, jamais pour quelqu'un. Au bout de trois ans, j'avais un portfolio et aucune idée de ce que je voulais dire.

> Partir n'est pas renoncer. C'est refuser de continuer par habitude.

## Ce qui s'est passé après

J'ai travaillé dans une galerie, mal payée, et j'ai appris en six mois plus qu'en trois ans : comment un projet se monte, se finance, se défend. Je dessine toujours. Simplement, je sais maintenant pourquoi.

## À celles et ceux qui hésitent

Ne partez pas parce que c'est dur. Partez si vous ne savez plus répondre à la question : qu'est-ce que je fais là.`,
  },
  {
    titre: 'Ce que la rue portait avant les défilés',
    chapeau:
      'Trois jours à guetter les trottoirs du Marais. Les podiums diront ce qu’ils veulent — la vraie tendance était dehors.',
    rubrique: 'fashion',
    format: 'photo',
    auteur: 'Marilyse',
    humeur: 'balcon',
    statut: 'brouillon',
    couverture: '/placeholders/editorial-8.svg',
    galerie: ['/placeholders/editorial-2.svg'],
    datePublication: '2026-08-28T12:00:00.000Z',
    contenu: `Brouillon en cours — les images sont sélectionnées, le texte arrive.

## Le retour du beige

Un beige profond, chaud, presque doré, porté ton sur ton du col aux chaussures.`,
  },
];

const maintenant = new Date().toISOString();

function slugifier(texte) {
  return texte
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

// Le groupe relie un contenu à ses traductions. On le fixe ici pour que les
// versions anglaises plus bas puissent s'y rattacher.
const groupes = contenus.map(() => crypto.randomUUID());

const enregistrements = contenus.map((c, i) => ({
  id: crypto.randomUUID(),
  langue: 'fr',
  groupeId: groupes[i],
  slug: slugifier(c.titre),
  titre: c.titre,
  chapeau: c.chapeau,
  contenu: c.contenu,
  couverture: c.couverture ?? null,
  galerie: c.galerie ?? [],
  humeur: c.humeur ?? null,
  rubrique: c.rubrique,
  format: c.format,
  auteur: c.auteur ?? 'MUK',
  statut: c.statut ?? 'publie',
  aLaUne: Boolean(c.aLaUne),
  piecesTenue: c.piecesTenue ?? [],
  datePublication: c.datePublication,
  dateCreation: maintenant,
  dateMaj: maintenant,
}));


/**
 * Trois traductions anglaises, rattachées à leur original par le groupe.
 *
 * Elles montrent le cas réel : le site anglais est plus maigre que le
 * français, et le sélecteur de langue ne propose la bascule que là où la
 * traduction existe. `source` est l'index du contenu français traduit.
 */
const traductions = [
  {
    source: 0,
    titre: 'The people keeping Paris dancing at 6am',
    chapeau:
      'They book hundred-capacity rooms, do not live off music, and hold up the Paris electronic scene on their own. Three nights with the collectives refusing to choose between rigour and joy.',
    contenu: `It is six in the morning and nobody is checking the time. That may be the only useful definition of a good night out.

## An economy of improvisation

None of the collectives we met live off music. They are graphic designers, nurses, law students. Ticket sales pay for the room, the room pays the sound engineer, and whatever is left goes into the next event. Nobody complains about it, but nobody hides it either.

> You do not build a scene with budgets. You build it with people who come back.

## What the closures produced

Every venue that shuts displaces a community. For three years that community has scattered into places never designed for it: wastelands, basement clubs, barges. The constraint produced an aesthetic, and the aesthetic produced an audience.

## The question that keeps coming back

Should they grow? Everyone says no, and everyone is preparing a bigger date. That is the ordinary contradiction of scenes that work.`,
  },
  {
    source: 1,
    titre: 'The diaspora is not a backdrop',
    chapeau:
      'She is asked to explain her origins in every interview. She would rather talk about her work. On being assigned an identity in cultural circles.',
    contenu: `There is a question put to artists from the diaspora and never to anyone else: where are you really from?

## The compliment that assigns

We call it curiosity, sometimes appreciation. More often it is a polite way of reminding someone they are a guest rather than at home. The mechanism works all the better for presenting itself as kindness.

> Being visible and being understood are two different things. The first is negotiated, the second is earned.

## What assignment produces

An artist reduced to their origin ends up making what is expected of them, or making work against that expectation. Either way they are no longer working freely: they are answering.

## Leaving the dilemma

There is no individual solution to a collective problem. There are newsrooms that change their questions, institutions that change their commissions, and media that decide to discuss the work before the trajectory. That is this section wager.`,
  },
  {
    source: 5,
    titre: 'Does arthouse cinema still have a twenty-year-old audience?',
    chapeau:
      'Empty rooms midweek, queues on Saturday night for a retrospective: the young audience has not vanished, it has changed rhythm.',
    contenu: `The claim comes back every year: young people are deserting cinemas. The figures say something more interesting.

## They are not deserting, they are gathering

An ordinary Tuesday screening draws fifteen people. The same film, programmed as a retrospective on a Saturday, with an introduction and a drink afterwards, draws two hundred.

> The film has not changed. What changed is everything placed around it.

## The event against the catalogue

Against platforms offering everything, always, the cinema can no longer win on availability. It wins on what streaming will never do: a precise hour, a precise place, other people.`,
  },
];

for (const t of traductions) {
  const original = enregistrements[t.source];
  enregistrements.push({
    ...original,
    id: crypto.randomUUID(),
    langue: 'en',
    slug: slugifier(t.titre),
    titre: t.titre,
    chapeau: t.chapeau,
    contenu: t.contenu,
    piecesTenue: [],
  });
}

const cible = path.join(process.cwd(), 'data', 'articles.json');
await fs.mkdir(path.dirname(cible), { recursive: true });
await fs.writeFile(cible, `${JSON.stringify(enregistrements, null, 2)}\n`, 'utf8');
const parLangue = enregistrements.reduce((n, c) => ({ ...n, [c.langue]: (n[c.langue] ?? 0) + 1 }), {});
console.log(`${enregistrements.length} contenus écrits dans data/articles.json`, parLangue);

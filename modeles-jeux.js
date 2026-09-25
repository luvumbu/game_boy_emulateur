/**
 * Les modèles de jeux : un jeu entier, prêt à jouer — et à changer.
 *
 * Chacun est fabriqué avec les MÊMES outils que l'atelier : des cartes
 * (editeur-carte.js), des scènes avec leurs murs, leurs événements et leurs
 * acteurs (editeur-scene.js), des palettes (editeur-couleurs.js). Rien n'est
 * écrit à la main : ouvrir un modèle, c'est trouver dans l'onglet La carte
 * exactement ce qu'on aurait pu poser soi-même, et pouvoir tout y changer.
 *
 * Le moteur des scènes fait des jeux VUS DE DESSUS — on se déplace dans les
 * quatre directions, sans pesanteur. Les modèles sont donc de ce genre-là.
 */

import { ecrireCarte } from './editeur-carte.js'
import { ecrireScene, ecrireReglagesDuJeu, faireDeLaSceneLeJeu, mursVides, HEROS_PAR_DEFAUT, MONSTRE_PAR_DEFAUT } from './editeur-scene.js'
import { ecrireCouleurs, lireCouleurs, PALETTES_PROPOSEES, PALETTES_LUTINS_PROPOSEES } from './editeur-couleurs.js'

const SAUT = String.fromCharCode(10)

/* ------------------------------------------------------------ les dessins */

const HEROS2 = HEROS_PAR_DEFAUT.replace('Perso HEROS', 'Perso HEROS2')
  .replace('"0003322003223000"', '"0033220000322300"').replace('"0003220000223000"', '"0032200000022300"')

const PNJ = [
  'Perso PNJ = {',
  '  "0000033333300000",', '  "0000311111130000",', '  "0003111111113000",', '  "0003113113113000",',
  '  "0003111111113000",', '  "0000311331130000",', '  "0000033333300000",', '  "0003322222233000",',
  '  "0032222222222300",', '  "0321222222221230",', '  "0321222222221230",', '  "0032222222222300",',
  '  "0003222222223000",', '  "0003220000223000",', '  "0003220000223000",', '  "0033330000333300",',
  '};',
].join(SAUT)

const PIECE = [
  'Tuile PIECE = {',
  '  "00333300",', '  "03111130",', '  "31122113",', '  "31211213",',
  '  "31211213",', '  "31122113",', '  "03111130",', '  "00333300",',
  '};',
].join(SAUT)

const PIECE2 = [
  'Tuile PIECE2 = {',
  '  "00033000",', '  "00311300",', '  "03122130",', '  "03121130",',
  '  "03121130",', '  "03122130",', '  "00311300",', '  "00033000",',
  '};',
].join(SAUT)

const MONSTRE2 = MONSTRE_PAR_DEFAUT.replace('Perso MONSTRE', 'Perso MONSTRE2').replace('"0003203203203000"', '"0030230230230300"')

const THEME = 'Air THEME = { "DO4 10", "==", "MI4 10", "==", "SOL4 10", "==", "MI4 10", "==", "FA4 10", "==", "LA4 10", "==", "SOL4 10", "==", "--", "--" };'

/* ------------------------------------------------------- dessiner une carte */

/**
 * Une carte en pixels, à partir d'un plan en cases : '#' mur (des briques),
 * '.' sol (de l'herbe), 'P' porte, 'C' coffre, 'S' sortie.
 */
function carteDepuisUnPlan(plan) {
  const lignes = plan.length
  const colonnes = plan[0].length
  const grille = Array.from({ length: lignes * 8 }, () => Array(colonnes * 8).fill(0))
  const dessins = {
    '#': ['33333333', '12221222', '12221222', '33333333', '22122212', '22122212', '33333333', '12221222'],
    /* Le sol est VIDE : une case vide ne coûte rien — ni code, ni tuile. Poser l'herbe sur les 768
       cases d'une grande carte remplissait la cartouche avant même qu'on ait écrit le jeu. */
    '.': ['00000000', '00000000', '00000000', '00000000', '00000000', '00000000', '00000000', '00000000'],
    'P': ['33333333', '32222223', '32222223', '32222123', '32222223', '32222223', '32222223', '32222223'],
    'C': ['00000000', '03333330', '32222223', '33333333', '32211223', '32222223', '33333333', '00000000'],
    'S': ['11111111', '12222221', '12111121', '12122121', '12122121', '12111121', '12222221', '11111111'],
  }
  plan.forEach((rangee, l) => [...rangee].forEach((signe, c) => {
    const d = dessins[signe] ?? dessins['.']
    for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) grille[l * 8 + y][c * 8 + x] = Number(d[y][x])
  }))
  return grille
}

const mursDepuisUnPlan = (plan) => plan.map((rangee) => [...rangee].map((s) => (s === '#' ? 1 : 0)))
const casesDe = (plan, signe) => plan.flatMap((rangee, l) => [...rangee].flatMap((s, c) => (s === signe ? [{ c, l }] : [])))

/* --------------------------------------------------------------- l'assemblage */

/** Le programme de départ : les dessins, un main vide — les scènes s'y ajoutent. */
const programmeDeDepart = (dessins) => [...dessins, 'int main() {', '  while (true) {', '    image();', '  }', '}', ''].join(SAUT + SAUT)

/** Les seize palettes, et chaque case teinte dans une palette du décor. */
function habiller(source, couleur) {
  if (!couleur) return source
  const fond = lireCouleurs(source, false)
  const lutins = lireCouleurs(source, true)
  /* Les 4 palettes du jeu : la Game Boy (le sol), puis forêt, glace et volcan (les murs). */
  const choisies = [0, 4, 5, 6]
  for (let p = 0; p < 8; p++) for (let t = 0; t < 4; t++) {
    fond[p][t] = [...PALETTES_PROPOSEES[p < 4 ? choisies[p] : p][t]]
    lutins[p][t] = [...PALETTES_LUTINS_PROPOSEES[p][t]]
  }
  return ecrireCouleurs(source, fond, lutins)
}
/* Seuls les murs, portes et coffres prennent une palette : le sol garde la palette 0 (les verts
   de la Game Boy), ce qui épargne un « teindre » par case — des centaines sur une grande carte. */
const teintes = (plan, palette = 1) => plan.map((rangee) => [...rangee].map((s) => (s === '.' ? 0 : palette)))

/**
 * Une place libre pour un personnage de seize, au plus près de (x, y) : les quatre cases
 * qu'il couvre ne doivent pas être des murs. Un monstre posé dans un mur ne bougerait jamais.
 */
function placeLibre(plan, x, y) {
  const libre = (c, l) => plan[l]?.[c] !== undefined && plan[l][c] !== '#'
  const essais = []
  for (let l = 0; l < plan.length - 1; l++) for (let c = 0; c < plan[0].length - 1; c++) {
    if (libre(c, l) && libre(c + 1, l) && libre(c, l + 1) && libre(c + 1, l + 1)) essais.push({ x: c * 8, y: l * 8 })
  }
  essais.sort((a, b) => Math.abs(a.x - x) + Math.abs(a.y - y) - Math.abs(b.x - x) - Math.abs(b.y - y))
  return essais[0] ?? { x, y }
}

/* ------------------------------------------------------------------ les modèles */

export const MODELES = [
  {
    nom: '🗝 Aventure',
    dit: 'Deux scènes : un gardien qui parle, une clé, une porte fermée, un monstre, un coffre.',
    construire(couleur) {
      const village = [
        '####################',
        '#..................#',
        '#..................#',
        '#....####....#######',
        '#....#..#....#.....#',
        '#.......#....#.....#',
        '#....####....###.###',
        '#..................#',
        '#..................P',
        '#..................#',
        '#.......#####......#',
        '#.......#...#......#',
        '#.......#...#......#',
        '#..................#',
        '#..................#',
        '#..................#',
        '#..................#',
        '####################',
      ]
      const maison = [
        '####################',
        '#..................#',
        '#..................#',
        '#.........C........#',
        '#..................#',
        '#..................#',
        '#......######......#',
        '#..................#',
        '#..................#',
        'P..................#',
        '#..................#',
        '#..................#',
        '#..................#',
        '#......######......#',
        '#..................#',
        '#..................#',
        '#..................#',
        '####################',
      ]
      let s = habiller(programmeDeDepart([HEROS_PAR_DEFAUT, HEROS2, PNJ, MONSTRE_PAR_DEFAUT, MONSTRE2, THEME]), couleur)
      s = ecrireCarte(s, 'VILLAGE', carteDepuisUnPlan(village), false, couleur ? teintes(village) : undefined)
      s = ecrireCarte(s, 'MAISON', carteDepuisUnPlan(maison), false, couleur ? teintes(maison, 2) : undefined)
      const commun = { dessin: 'HEROS', cote: 16, couleur, animation: { images: ['HEROS', 'HEROS2'], vitesse: 8 }, retourner: true }
      s = ecrireScene(s, 'VILLAGE', {
        ...commun, murs: mursDepuisUnPlan(village), x: 24, y: 64, musique: { air: 'THEME', vitesse: 10 },
        evenements: [
          { c: 19, l: 8, quand: 'arrive', si: { nom: 'CLE', comp: '==', valeur: 1 },
            actions: [{ type: 'bruitage', son: 'porte' }, { type: 'scene', carte: 'MAISON', c: 2, l: 9 }] },
          { c: 19, l: 8, quand: 'arrive', si: { nom: 'CLE', comp: '==', valeur: 0 },
            actions: [{ type: 'message', texte: 'C EST FERME' }] },
        ],
        acteurs: [
          { x: 48, y: 88, dessin: 'PNJ', mouvement: 'immobile', quand: 'bouton',
            actions: [{ type: 'dialogue', lignes: ['BONJOUR !', 'VOICI LA CLE', 'DE LA MAISON.'] }, { type: 'variable', nom: 'CLE', op: '=', valeur: 1 }, { type: 'bruitage', son: 'piece' }] },
          { x: 104, y: 112, dessin: 'MONSTRE', images: ['MONSTRE2'], vitesse: 12, mouvement: 'horizontal', quand: 'touche',
            actions: [{ type: 'bruitage', son: 'degats' }, { type: 'perdreVie' }] },
        ],
      })
      s = ecrireScene(s, 'MAISON', {
        ...commun, murs: mursDepuisUnPlan(maison), x: 16, y: 68,
        evenements: [
          { c: 10, l: 4, quand: 'bouton', actions: [{ type: 'dialogue', lignes: ['LE TRESOR !', 'TU AS GAGNE.', ''] }, { type: 'victoire' }] },
          { c: 0, l: 9, quand: 'arrive', actions: [{ type: 'scene', carte: 'VILLAGE', c: 18, l: 8 }] },
        ],
      })
      s = ecrireReglagesDuJeu(s, { titre: 'LA CLE PERDUE', sousTitre: 'APPUIE SUR START', vies: 3, hud: true })
      return faireDeLaSceneLeJeu(s, 'VILLAGE')
    },
  },
  {
    nom: '🪙 Chasse aux pièces',
    dit: 'Une grande carte qui défile : ramasse les 6 pièces, puis va à la sortie.',
    construire(couleur) {
      const plan = [
        '################################',
        '#..............................#',
        '#..............................#',
        '#....####..........####........#',
        '#.......#..........#...........#',
        '#.......#..........#......###..#',
        '#..........................#...#',
        '#..........##########......#...#',
        '#..............................#',
        '#..............................#',
        '#....#.................#.......#',
        '#....#.................#.......#',
        '#....#######.......#####.......#',
        '#..............................#',
        '#..............................#',
        '#..............................#',
        '#.........#######..............#',
        '#..............................#',
        '#..............................#',
        '#......................####....#',
        '#.........................#...S#',
        '#.........................#....#',
        '#..............................#',
        '################################',
      ]
      const pieces = [[48, 16], [200, 24], [96, 88], [232, 72], [40, 160], [176, 144]]
      let s = habiller(programmeDeDepart([HEROS_PAR_DEFAUT, HEROS2, PIECE, PIECE2, MONSTRE_PAR_DEFAUT, MONSTRE2, THEME]), couleur)
      s = ecrireCarte(s, 'PLAINE', carteDepuisUnPlan(plan), false, couleur ? teintes(plan) : undefined)
      const sortie = casesDe(plan, 'S')[0]
      s = ecrireScene(s, 'PLAINE', {
        dessin: 'HEROS', cote: 16, couleur, animation: { images: ['HEROS', 'HEROS2'], vitesse: 8 }, retourner: true,
        murs: mursDepuisUnPlan(plan), x: 16, y: 16, musique: { air: 'THEME', vitesse: 8 },
        evenements: [
          { c: sortie.c, l: sortie.l, quand: 'arrive', si: { nom: 'SCORE', comp: '>=', valeur: pieces.length },
            actions: [{ type: 'bruitage', son: 'porte' }, { type: 'victoire' }] },
          { c: sortie.c, l: sortie.l, quand: 'arrive', si: { nom: 'SCORE', comp: '<', valeur: pieces.length },
            actions: [{ type: 'message', texte: 'IL EN MANQUE' }] },
        ],
        acteurs: [
          ...pieces.map(([x, y]) => ({ x, y, dessin: 'PIECE', images: ['PIECE2'], vitesse: 15, mouvement: 'immobile', quand: 'touche', unique: true,
            actions: [{ type: 'bruitage', son: 'piece' }, { type: 'score', valeur: 1 }, { type: 'disparaitre' }] })),
          { x: 120, y: 120, dessin: 'MONSTRE', images: ['MONSTRE2'], vitesse: 12, mouvement: 'horizontal', quand: 'touche',
            actions: [{ type: 'bruitage', son: 'degats' }, { type: 'perdreVie' }] },
        ],
      })
      s = ecrireReglagesDuJeu(s, { titre: 'CHASSE AUX PIECES', sousTitre: 'APPUIE SUR START', vies: 3, hud: true })
      return faireDeLaSceneLeJeu(s, 'PLAINE')
    },
  },
  {
    nom: '🍄 Plateformes',
    dit: 'Un niveau qui défile : saute avec A, évite les trous et les ennemis, ramasse les pièces, touche le drapeau.',
    construire(couleur) {
      /* Vu de côté : le sol en bas, des trous, des plateformes en l'air. '#' mur, 'S' le drapeau. */
      const plan = [
        '................................',
        '................................',
        '................................',
        '................................',
        '................................',
        '................................',
        '................................',
        '.........####..............S....',
        '...........................#....',
        '....................####...#....',
        '...........................#....',
        '..............#............#....',
        '.....###.....##............#....',
        '............###............#....',
        '...........####.................',
        '..........#####.................',
        '################...#######...###',
        '################...#######...###',
      ]
      const pieces = [[48, 80], [80, 40], [120, 64], [168, 56], [200, 96], [224, 40]]
      let s = habiller(programmeDeDepart([HEROS_PAR_DEFAUT, HEROS2, PIECE, PIECE2, MONSTRE_PAR_DEFAUT, MONSTRE2, THEME]), couleur)
      s = ecrireCarte(s, 'MONDE', carteDepuisUnPlan(plan), false, couleur ? teintes(plan, 3) : undefined)
      const drapeau = casesDe(plan, 'S')[0]
      /* Les trous : tomber tout en bas, c'est perdre une vie. */
      const trous = [16, 17, 18, 26, 27, 28].map((c) => ({ c, l: 17, quand: 'arrive',
        actions: [{ type: 'bruitage', son: 'degats' }, { type: 'perdreVie' }] }))
      s = ecrireScene(s, 'MONDE', {
        dessin: 'HEROS', cote: 16, couleur, animation: { images: ['HEROS', 'HEROS2'], vitesse: 6 }, retourner: true,
        genre: 'plateforme', saut: 24,
        murs: mursDepuisUnPlan(plan), x: 8, y: 96, musique: { air: 'THEME', vitesse: 8 },
        evenements: [
          ...trous,
          { c: drapeau.c, l: drapeau.l, quand: 'arrive', actions: [{ type: 'bruitage', son: 'porte' }, { type: 'victoire' }] },
        ],
        acteurs: [
          ...pieces.map(([x, y]) => ({ x, y, dessin: 'PIECE', images: ['PIECE2'], vitesse: 15, mouvement: 'immobile', quand: 'touche', unique: true,
            actions: [{ type: 'bruitage', son: 'piece' }, { type: 'score', valeur: 1 }, { type: 'disparaitre' }] })),
          { x: 160, y: 56, dessin: 'MONSTRE', images: ['MONSTRE2'], vitesse: 12, mouvement: 'horizontal', quand: 'touche',
            actions: [{ type: 'bruitage', son: 'degats' }, { type: 'perdreVie' }] },
          { x: 184, y: 112, dessin: 'MONSTRE', images: ['MONSTRE2'], vitesse: 12, mouvement: 'horizontal', quand: 'touche',
            actions: [{ type: 'bruitage', son: 'degats' }, { type: 'perdreVie' }] },
        ],
      })
      s = ecrireReglagesDuJeu(s, { titre: 'LE GRAND SAUT', sousTitre: 'A POUR SAUTER', vies: 3, hud: true })
      return faireDeLaSceneLeJeu(s, 'MONDE')
    },
  },
  {
    nom: '🌀 Labyrinthe',
    dit: 'Un grand labyrinthe, des monstres qui te suivent, trois vies : trouve la sortie.',
    construire(couleur) {
      const plan = [
        '################################',
        '#......#.........#.............#',
        '#......#.........#.............#',
        '#..#####..#####..#..#######....#',
        '#.........#......#........#....#',
        '#.........#......####.....#....#',
        '#####..####...............#....#',
        '#.........#######..########....#',
        '#..............................#',
        '#..#######.........#......######',
        '#........#.........#...........#',
        '#........#..########...........#',
        '#..###...#.................##..#',
        '#....#...######....#########...#',
        '#....#.............#...........#',
        '#....#######.......#...........#',
        '#..........#...#####...#####...#',
        '#..........#.......#.......#...#',
        '####...............#.......#...#',
        '#......######......#...#####...#',
        '#...........#......#...........#',
        '#...........#..................#',
        '#.....................#......S.#',
        '################################',
      ]
      let s = habiller(programmeDeDepart([HEROS_PAR_DEFAUT, HEROS2, MONSTRE_PAR_DEFAUT, MONSTRE2]), couleur)
      s = ecrireCarte(s, 'DEDALE', carteDepuisUnPlan(plan), false, couleur ? teintes(plan, 3) : undefined)
      const sortie = casesDe(plan, 'S')[0]
      const monstre = (x, y) => ({ ...placeLibre(plan, x, y), dessin: 'MONSTRE', images: ['MONSTRE2'], vitesse: 10, mouvement: 'suivre', quand: 'touche',
        actions: [{ type: 'bruitage', son: 'explosion' }, { type: 'perdreVie' }] })
      s = ecrireScene(s, 'DEDALE', {
        dessin: 'HEROS', cote: 16, couleur, animation: { images: ['HEROS', 'HEROS2'], vitesse: 8 }, retourner: true,
        murs: mursDepuisUnPlan(plan), ...placeLibre(plan, 8, 8),
        evenements: [{ c: sortie.c, l: sortie.l, quand: 'arrive', actions: [{ type: 'bruitage', son: 'porte' }, { type: 'victoire' }] }],
        acteurs: [monstre(200, 16), monstre(40, 150), monstre(150, 100)],
      })
      s = ecrireReglagesDuJeu(s, { titre: 'LE LABYRINTHE', sousTitre: 'APPUIE SUR START', vies: 3, hud: true })
      return faireDeLaSceneLeJeu(s, 'DEDALE')
    },
  },
]

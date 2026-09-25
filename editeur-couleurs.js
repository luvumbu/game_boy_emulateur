/**
 * L'atelier des couleurs : huit palettes, à la souris.
 *
 * Une tuile ne porte pas de couleurs — elle porte quatre NUMÉROS de teinte. La
 * couleur vient de la palette de la case où on la pose. Sans un endroit pour
 * définir ces palettes, l'atelier montrait éternellement le vert d'origine
 * pendant que le jeu tournait en couleur : on croyait que la couleur ne
 * marchait pas, alors qu'on regardait simplement une palette que personne
 * n'avait remplie.
 *
 * Comme l'atelier des tuiles, celui-ci ÉCRIT dans le programme. Les lignes
 * qu'il pose sont exactement celles qu'on écrirait à la main :
 *
 *   couleurFond(0, 1, 31, 24, 8);
 *
 * Elles vivent dans un bloc marqué, au début de « main » — c'est le seul
 * endroit qui les rende relisibles et réécrivables sans toucher au reste.
 */

import { lireDessins, nuanceDe } from './editeur-tuiles.js'

const SAUT = String.fromCharCode(10)

const DEBUT = '  /* --- les couleurs de l’atelier --- */'
const FIN = '  /* --- fin des couleurs --- */'

/** Les quatre nuances d'origine, en composantes de 0 à 31. */
export const PALETTE_ORIGINE = [
  [28, 31, 26],
  [17, 24, 14],
  [6, 13, 10],
  [1, 3, 4],
]

/*
 * Huit palettes toutes prêtes, à prendre ou à laisser.
 *
 * Une console couleur dont les huit palettes sont au vert d'origine n'a l'air
 * de rien : on ouvre l'atelier, on ne voit que du vert, et l'on croit que la
 * couleur ne marche pas. Proposer un point de départ vaut mieux que proposer
 * une page blanche — on garde ce qui va, on change le reste.
 *
 * Chacune descend du clair au sombre, dans cet ordre : c'est ce qu'une tuile
 * attend, ses signes « . - + # » allant du plus clair au plus foncé. Une
 * palette qui remonterait au milieu rendrait tous les dessins illisibles.
 *
 * La PREMIÈRE est la principale : un gris légèrement bleuté, lisible sur
 * n'importe quoi, et celle qu'un programme neuf reçoit.
 */
export const PALETTES_PROPOSEES = [
  /* 0 — Game Boy : les quatre verts d'origine, ceux de la console normale */
  [[28, 31, 26], [17, 24, 14], [6, 13, 10], [1, 3, 4]],
  /* 1 — campagne : ciel, herbe, terre, noir */
  [[20, 28, 31], [10, 26, 6], [16, 8, 2], [2, 2, 2]],
  /* 2 — bonbon : rose, orange, violet, nuit */
  [[31, 22, 26], [31, 16, 4], [16, 4, 22], [2, 2, 10]],
  /* 3 — plage : sable, turquoise, corail, marine */
  [[31, 29, 20], [4, 24, 24], [28, 10, 8], [2, 4, 12]],
  /* 4 — forêt : feuille, or, écorce, sous-bois */
  [[22, 31, 14], [26, 24, 2], [18, 6, 2], [0, 6, 2]],
  /* 5 — glace : givre, cyan, violet, nuit */
  [[28, 31, 31], [8, 24, 31], [14, 8, 26], [2, 2, 10]],
  /* 6 — volcan : jaune, orange, rouge, cendre */
  [[31, 30, 12], [31, 14, 0], [22, 2, 2], [4, 0, 0]],
  /* 7 — nuit : lavande, vert d'eau, magenta, noir */
  [[24, 22, 31], [8, 22, 16], [22, 4, 18], [1, 1, 4]],
]

/*
 * QUATRE COULEURS DIFFÉRENTES DANS CHAQUE PALETTE, et huit palettes qui ne se
 * ressemblent pas.
 *
 * Les premières propositions étaient des dégradés d'une seule teinte — quatre
 * oranges pour la brique, quatre verts pour l'herbe : une tuile n'y avait
 * jamais qu'une couleur. Chacune mêle maintenant des teintes franches (un
 * ciel, une herbe, une terre…), comme les palettes des vrais jeux.
 *
 * La palette 0 reste celle de la Game Boy D'ORIGINE : c'est celle de toute
 * case qu'on ne teint pas, et du texte — le jeu garde ainsi l'allure de la
 * console normale tant qu'on ne choisit rien d'autre.
 *
 * UNE règle est gardée : chaque palette va du plus CLAIR (numéro 0) au plus
 * SOMBRE (numéro 3). Le .gb montre ces mêmes numéros en quatre nuances : une
 * palette dans le désordre y rendrait les dessins illisibles.
 */
export const NOMS_PROPOSES = [
  'Game Boy', 'campagne', 'bonbon', 'plage',
  'forêt', 'glace', 'volcan', 'nuit',
]

/*
 * Huit palettes pour les PERSONNAGES, pensées pour eux.
 *
 * Un personnage n'a que trois couleurs visibles — le numéro 0 est transparent
 * — et doit se détacher du décor. Chaque palette mêle trois teintes franches,
 * de la plus claire (1) à la plus sombre (3) : la peau, les habits, le contour.
 */
export const PALETTES_LUTINS_PROPOSEES = [
  /* 0 — Game Boy : les verts d'origine */
  [[28, 31, 26], [17, 24, 14], [6, 13, 10], [1, 3, 4]],
  /* 1 — héros : peau, rouge, bleu */
  [[31, 31, 31], [31, 26, 20], [30, 4, 2], [4, 6, 22]],
  /* 2 — ennemi : jaune, vert, violet */
  [[31, 31, 31], [31, 28, 8], [6, 22, 4], [12, 2, 16]],
  /* 3 — princesse : rose, jaune, bordeaux */
  [[31, 31, 31], [31, 24, 28], [30, 24, 4], [14, 2, 10]],
  /* 4 — robot : cyan, gris, rouge */
  [[31, 31, 31], [18, 30, 31], [14, 14, 18], [18, 2, 2]],
  /* 5 — fantôme : blanc, bleu, noir */
  [[31, 31, 31], [30, 30, 31], [10, 14, 31], [2, 2, 6]],
  /* 6 — elfe : vert clair, brun, vert sombre */
  [[31, 31, 31], [20, 31, 14], [18, 10, 4], [2, 10, 4]],
  /* 7 — flamme : jaune, orange, rouge sombre */
  [[31, 31, 31], [31, 31, 12], [31, 14, 0], [14, 0, 0]],
]

/*
 * Les VARIÉTÉS : des palettes toutes prêtes, de 0 à 10 — la 0 est la normale
 * (les verts de la Game Boy). On en met une dans n'importe laquelle des 8
 * palettes du jeu d'un clic (« 🎨 Variétés »). Chacune va du plus clair au plus
 * sombre, comme toutes les palettes : le .gb en quatre nuances reste lisible.
 */
export const VARIETES = [
  ...PALETTES_PROPOSEES.map((palette, i) => ({ nom: ['normale', 'campagne', 'bonbon', 'plage', 'forêt', 'glace', 'volcan', 'nuit'][i], palette })),
  { nom: 'désert', palette: [[31, 29, 22], [28, 22, 10], [20, 12, 4], [8, 4, 2]] },
  { nom: 'océan', palette: [[26, 31, 31], [8, 24, 30], [2, 12, 24], [0, 3, 10]] },
  { nom: 'automne', palette: [[31, 28, 12], [30, 18, 4], [22, 6, 2], [8, 2, 2]] },
]
export const VARIETES_LUTINS = [
  ...PALETTES_LUTINS_PROPOSEES.map((palette, i) => ({ nom: ['normale', 'héros', 'ennemi', 'princesse', 'robot', 'fantôme', 'elfe', 'flamme'][i], palette })),
  { nom: 'pirate', palette: [[31, 31, 31], [31, 24, 18], [26, 4, 4], [2, 2, 6]] },
  { nom: 'chevalier', palette: [[31, 31, 31], [26, 26, 28], [8, 10, 28], [4, 4, 8]] },
  { nom: 'gelée', palette: [[31, 31, 31], [18, 31, 18], [4, 22, 10], [0, 8, 4]] },
]

/*
 * Les THÈMES : des palettes QUI VONT ENSEMBLE, pour tout le jeu d'un coup — les
 * 8 du décor et les 8 des personnages.
 *
 * Elles sont calculées plutôt que choisies une à une : chaque palette part
 * d'une teinte, et descend du clair au sombre par les MÊMES quatre marches de
 * lumière. Des teintes voisines, des clartés alignées : c'est ce qui les fait
 * s'accorder — et le .gb en quatre nuances reste lisible, puisque toutes les
 * palettes y ont la même échelle.
 *
 *   teinte    0 à 360 (0 rouge, 60 jaune, 120 vert, 200 bleu, 280 violet)
 *   vivacite  0 (gris) à 1 (couleur franche)
 */
const CLARTES = [0.90, 0.66, 0.40, 0.13]
function rampe(teinte, vivacite) {
  return CLARTES.map((l, i) => {
    /* Les tons sombres un peu moins vifs, comme une ombre ; le clair un peu moins aussi. */
    const s = vivacite * (i === 0 ? 0.7 : i === 3 ? 0.6 : 1)
    const k = (n) => (n + teinte / 30) % 12
    const a = s * Math.min(l, 1 - l)
    const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1))
    return [f(0), f(8), f(4)].map((v) => Math.round(v * 31))
  })
}
/* Une palette de personnage : le n° 0 transparent, puis la peau ou la matière, la couleur, le contour. */
function rampeLutin(teinte, vivacite) {
  const r = rampe(teinte, vivacite)
  return [[31, 31, 31], r[0], r[1], r[3]]
}
const PEAU = [[31, 31, 31], [31, 26, 20], [26, 14, 8], [6, 3, 2]]

/* Chaque thème : ses 8 teintes de décor (la 0 est le sol, le fond), et ses 8 de personnages. */
const recette = (nom, fond, lutins) => ({
  nom,
  fond: fond.map(([t, v]) => rampe(t, v)),
  lutins: lutins.map((x) => (x === 'peau' ? PEAU.map((c) => [...c]) : rampeLutin(x[0], x[1]))),
})
export const THEMES = [
  { nom: 'normale', fond: Array.from({ length: 8 }, () => PALETTE_ORIGINE.map((c) => [...c])), lutins: Array.from({ length: 8 }, () => PALETTE_ORIGINE.map((c) => [...c])) },
  recette('forêt',
    [[95, 0.45], [30, 0.55], [120, 0.6], [40, 0.5], [195, 0.55], [75, 0.6], [10, 0.7], [280, 0.5]],
    [[120, 0.6], 'peau', [10, 0.8], [270, 0.6], [45, 0.7], [180, 0.6], [95, 0.7], [0, 0]]),
  recette('désert',
    [[42, 0.5], [30, 0.6], [20, 0.55], [55, 0.6], [190, 0.5], [10, 0.6], [35, 0.4], [300, 0.45]],
    [[45, 0.7], 'peau', [20, 0.8], [200, 0.6], [60, 0.8], [0, 0.7], [280, 0.5], [30, 0.3]]),
  recette('glace',
    [[200, 0.35], [190, 0.55], [215, 0.6], [175, 0.5], [235, 0.55], [260, 0.45], [205, 0.25], [300, 0.4]],
    [[200, 0.7], 'peau', [220, 0.8], [260, 0.6], [180, 0.7], [0, 0.6], [290, 0.5], [210, 0.2]]),
  recette('volcan',
    [[15, 0.4], [0, 0.7], [28, 0.8], [45, 0.8], [350, 0.6], [270, 0.35], [20, 0.25], [55, 0.9]],
    [[20, 0.8], 'peau', [0, 0.9], [45, 0.9], [270, 0.5], [30, 0.3], [350, 0.7], [60, 0.8]]),
  recette('océan',
    [[195, 0.45], [180, 0.6], [210, 0.65], [160, 0.5], [45, 0.55], [230, 0.55], [170, 0.35], [330, 0.5]],
    [[190, 0.7], 'peau', [210, 0.8], [160, 0.7], [20, 0.8], [330, 0.6], [240, 0.5], [50, 0.7]]),
  recette('hanté',
    [[260, 0.3], [280, 0.5], [240, 0.45], [300, 0.45], [120, 0.45], [200, 0.35], [320, 0.5], [50, 0.5]],
    [[270, 0.5], 'peau', [120, 0.6], [300, 0.6], [200, 0.4], [0, 0.6], [240, 0.3], [50, 0.6]]),
  recette('bonbon',
    [[330, 0.55], [300, 0.6], [20, 0.7], [50, 0.75], [180, 0.55], [270, 0.55], [0, 0.65], [100, 0.55]],
    [[330, 0.8], 'peau', [300, 0.8], [180, 0.7], [50, 0.9], [20, 0.8], [270, 0.7], [100, 0.7]]),
]

export const NOMS_LUTINS_PROPOSES = [
  'Game Boy', 'héros', 'ennemi', 'princesse',
  'robot', 'fantôme', 'elfe', 'flamme',
]

/*
 * Combien on en propose d'emblée : les HUIT.
 *
 * On en posait quatre, pour ne pas allonger le programme. Mais les quatre
 * autres restaient dans le même vert d'origine : quatre palettes identiques,
 * et des aperçus qui se répétaient d'une carte à l'autre. Huit familles
 * différentes dès le départ — pour le décor ET pour les personnages — valent
 * mieux que quelques lignes de moins.
 */
export const PROPOSEES_PAR_DEFAUT = 8

/*
 * Cinq bits par composante, et non huit.
 *
 * Un sélecteur de couleur du navigateur rend du 0-255 ; la console n'en garde
 * que les cinq bits du haut. Arrondir plutôt que tronquer évite qu'un blanc
 * choisi à 255 ressorte à 248 — visible, et agaçant.
 */
export const versCinq = (huit) => Math.min(31, Math.round(huit / 255 * 31))
export const versHuit = (cinq) => (cinq << 3) | (cinq >> 2)

/** « #a1b2c3 » à partir de trois composantes de 0 à 31. */
export function versDiese([r, v, b]) {
  const deux = (n) => versHuit(n).toString(16).padStart(2, '0')
  return `#${deux(r)}${deux(v)}${deux(b)}`
}

/** Trois composantes de 0 à 31 à partir de « #a1b2c3 ». */
export function depuisDiese(diese) {
  const n = parseInt(diese.slice(1), 16)
  return [versCinq(n >> 16 & 255), versCinq(n >> 8 & 255), versCinq(n & 255)]
}

/**
 * Lit les palettes écrites en clair dans le programme.
 *
 * Seuls les appels dont les cinq arguments sont des nombres sont relus : ceux
 * qui calculent leurs composantes — une boucle, un fondu — ne se ramènent pas
 * à une case de sélecteur, et l'atelier ne prétend pas les gouverner.
 */
export function lireCouleurs(source, pourLesLutins = false) {
  const nom = pourLesLutins ? 'couleurLutin' : 'couleurFond'
  const palettes = Array.from({ length: 8 }, () =>
    PALETTE_ORIGINE.map((c) => [...c]))

  const motif = new RegExp(`${nom}\\s*\\(\\s*(\\d+)\\s*,\\s*(\\d+)\\s*,\\s*(\\d+)\\s*,\\s*(\\d+)\\s*,\\s*(\\d+)\\s*\\)`, 'g')
  for (const trouve of source.matchAll(motif)) {
    const [, p, t, r, v, b] = trouve.map(Number)
    if (p > 7 || t > 3) continue
    palettes[p][t] = [Math.min(31, r), Math.min(31, v), Math.min(31, b)]
  }
  return palettes
}

/** Deux couleurs [rouge, vert, bleu] identiques ? */
export const memeCouleur = (a, b) => Boolean(a && b) && a[0] === b[0] && a[1] === b[1] && a[2] === b[2]

/** La clarté d'une couleur, pour ranger une palette du clair au sombre. */
export const clarte = ([r, v, b]) => 0.299 * r + 0.587 * v + 0.114 * b

const sansDoublons = (couleurs) => {
  const vues = []
  for (const c of couleurs) if (!vues.some((v) => memeCouleur(v, c))) vues.push([...c])
  return vues
}

const MARQUE_NUANCIER = '  /* nuancier :'

/** Les couleurs du nuancier écrit dans le programme, dans son ordre. */
export function lireNuancier(source) {
  const couleurs = []
  for (const ligne of source.matchAll(/\/\* nuancier :([^*]*)\*\//g)) {
    for (const [, r, v, b] of ligne[1].matchAll(/(\d+),(\d+),(\d+)/g)) {
      couleurs.push([Math.min(31, Number(r)), Math.min(31, Number(v)), Math.min(31, Number(b))])
    }
  }
  return couleurs
}

/**
 * TOUTES les couleurs, en une seule liste — le nuancier.
 *
 * On ne choisit plus « la palette 3, n° 2 » : on choisit UNE COULEUR, et
 * l'atelier la range lui-même dans une palette de la console (voir
 * « nuancier.js »). La liste garde son ordre — celui du nuancier écrit dans
 * le programme, puis les couleurs des palettes qui n'y sont pas encore : une
 * pastille ne saute pas de place parce qu'une palette a été réarrangée.
 */
export function toutesLesCouleurs(source) {
  const ecrites = sansDoublons([
    ...lireNuancier(source),
    ...lireCouleurs(source, false).flat(),
    ...lireCouleurs(source, true).flatMap((palette) => palette.slice(1)),
  ])
  /*
   * Un programme qui n'a encore AUCUNE couleur (les quatre verts d'origine, pas de
   * nuancier) : on lui propose d'emblée celles des palettes toutes prêtes — ciel,
   * herbe, brique, peau… En couleur, la rangée doit offrir des couleurs, pas quatre
   * verts et un « ＋ ». Rien n'est écrit dans le programme tant qu'on ne peint pas.
   */
  if (ecrites.length <= PALETTE_ORIGINE.length) {
    return sansDoublons([
      ...ecrites,
      ...PALETTES_PROPOSEES.flat(),
      ...PALETTES_LUTINS_PROPOSEES.flatMap((palette) => palette.slice(1)),
    ])
  }
  return ecrites
}

/** Le programme pose-t-il déjà des couleurs, écrites en clair ? */
export const aDesCouleurs = (source) => /\bcouleur(?:Fond|Lutin)\s*\(\s*\d/.test(source)

/*
 * Les palettes à MONTRER : celles du programme, ou — tant qu'il n'en pose aucune —
 * les palettes toutes prêtes. Quatre fois le même vert n'aide personne à choisir.
 */
export function palettesMontrees(source, pourLesLutins = false) {
  if (aDesCouleurs(source)) return lireCouleurs(source, pourLesLutins)
  return (pourLesLutins ? PALETTES_LUTINS_PROPOSEES : PALETTES_PROPOSEES).map((p) => p.map((c) => [...c]))
}

/* Au premier coup de pinceau en couleur, les palettes montrées entrent dans le programme. */
export function assurerLesPalettes(source) {
  if (aDesCouleurs(source)) return source
  return ecrireCouleurs(source, palettesMontrees(source, false), palettesMontrees(source, true))
}

/**
 * Réécrit le bloc des couleurs dans le programme.
 *
 * Le bloc est repéré par ses deux marques, et REMPLACÉ. S'il n'y est pas, il
 * est posé juste après « int main() { » — les palettes doivent être en place
 * avant qu'on dessine quoi que ce soit, sinon la première image sort dans les
 * couleurs d'avant.
 *
 * Seules les palettes qui S'ÉCARTENT de l'origine sont écrites : poser
 * trente-deux lignes dont vingt-quatre ne changent rien allongerait le
 * programme et la cartouche pour rien.
 */
export function ecrireCouleurs(source, fond, lutins, ajout = []) {
  const lignes = []

  const ajouter = (nom, palettes) => {
    palettes.forEach((palette, p) => {
      palette.forEach((couleur, t) => {
        const origine = PALETTE_ORIGINE[t]
        if (couleur[0] === origine[0] && couleur[1] === origine[1] && couleur[2] === origine[2]) return
        lignes.push(`  ${nom}(${p}, ${t}, ${couleur[0]}, ${couleur[1]}, ${couleur[2]});`)
      })
    })
  }

  ajouter('couleurFond', fond)
  if (lutins) ajouter('couleurLutin', lutins)

  /* Le nuancier : TOUTES les couleurs qu'on a eues en main, rangées dans un
     commentaire du bloc. Voir « toutesLesCouleurs ». Une couleur qui sort
     d'une palette y reste : on ne perd pas ce qu'on a choisi. */
  const nuancier = sansDoublons([
    ...toutesLesCouleurs(source),
    ...ajout,
    ...fond.flat(),
    ...(lutins ?? []).flatMap((palette) => palette.slice(1)),
  ])
  if (nuancier.some((c) => !PALETTE_ORIGINE.some((o) => memeCouleur(o, c)))) {
    for (let i = 0; i < nuancier.length; i += 8) {
      lignes.push(`${MARQUE_NUANCIER} ${nuancier.slice(i, i + 8).map((c) => c.join(',')).join(' ')} */`)
    }
  }

  const bloc = lignes.length ? [DEBUT, ...lignes, FIN, ''].join(SAUT) : ''

  /*
   * L'atelier POSSÈDE les appels écrits en clair.
   *
   * Il ne suffit pas d'ajouter un bloc en tête de « main » : un
   * « couleurFond(0, 1, …) » écrit plus bas dans le programme s'exécute APRÈS
   * et écrase le choix qu'on vient de faire à la souris. On choisit une
   * couleur, rien ne bouge, et l'on croit l'atelier cassé.
   *
   * Les lignes dont les cinq arguments sont des nombres sont donc retirées
   * partout, puis réécrites dans le bloc — un seul endroit, qui gagne. Celles
   * qui CALCULENT leurs arguments (une boucle, un fondu) ne sont pas touchées :
   * l'atelier ne sait pas les représenter, et prétendre les gouverner ferait
   * disparaître du code que personne ne lui a demandé d'effacer.
   */
  const litteral = /^[ \t]*couleur(?:Fond|Lutin)\s*\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)\s*;[ \t]*\r?\n?/gm

  const iDebut = source.indexOf(DEBUT)
  if (iDebut >= 0) {
    const iFin = source.indexOf(FIN, iDebut)
    if (iFin >= 0) {
      const avant = source.slice(0, iDebut).replace(litteral, '')
      const apres = source.slice(iFin + FIN.length).replace(/^\r?\n/, '').replace(litteral, '')
      return avant + bloc + apres
    }
  }

  source = source.replace(litteral, '')

  if (!bloc) return source

  /* Sinon, juste après l'ouverture de « main ». */
  const main = source.search(/int\s+main\s*\([^)]*\)\s*\{/)
  if (main < 0) return source
  const ouvre = source.indexOf('{', main) + 1
  return source.slice(0, ouvre) + SAUT + bloc + source.slice(ouvre).replace(/^\r?\n/, '')
}

/**
 * Installe l'atelier des couleurs.
 *
 * Comme les autres, il ne connaît ni le champ de texte ni l'émulateur : il
 * demande le programme, le réécrit, et prévient quand il a changé.
 *
 * CE QU'IL DOIT FAIRE COMPRENDRE, avant tout le reste : une tuile ne porte
 * pas de couleurs, elle porte quatre NUMÉROS ; une palette donne une couleur
 * à chaque numéro ; chaque case de l'écran choisit sa palette. Huit rangées de
 * pastilles sans ce fil laissaient deviner le lien — le bandeau du haut le
 * montre avec les dessins du programme, et chaque palette les montre à son
 * tour, dans ses couleurs.
 */
export function installer({
  zone, lireSource, ecrireSource, surChangement,
  /*
   * La console visée accepte-t-elle la couleur ?
   *
   * L'atelier l'ignorait, et proposait de peindre des palettes qu'une Game Boy
   * d'origine refuse : on cliquait une teinte, et le programme cessait de
   * compiler sur un « couleurFond() demande une Game Boy Color ». Un atelier
   * qui offre un geste interdit n'est pas un atelier, c'est un piège.
   */
  couleurPossible = () => true,
  /* « gb » ou « gbc » : pour DIRE ce que deviendront les couleurs. */
  consoleVisee = () => 'gbc',
  /* Passer la console sur « En couleur » — le bouton du message « Game Boy d'origine ». */
  passerEnCouleur = null,
}) {
  let pourLesLutins = false
  let choisie = 0 // la palette que le bandeau explique

  const element = (balise, classe, texte) => {
    const e = document.createElement(balise)
    if (classe) e.className = classe
    if (texte !== undefined) e.textContent = texte
    return e
  }

  /* Les dessins du programme — ou, faute de mieux, un dessin d'exemple qui
     emploie les quatre numéros. */
  const EXEMPLE = {
    nom: 'exemple', cote: 8,
    rangees: ['00000000', '01111110', '01222210', '01233210', '01233210', '01222210', '01111110', '00000000'],
  }
  const dessinsDuProgramme = () => {
    const dessins = lireDessins(lireSource())
    return dessins.length ? dessins : [EXEMPLE]
  }

  /** Un dessin, peint avec les quatre couleurs d'une palette. */
  function apercu(dessin, palette, taille, transparent0 = false) {
    const toile = element('canvas', 'couleurs-apercu')
    toile.width = dessin.cote
    toile.height = dessin.cote
    toile.style.width = toile.style.height = `${taille}px`
    toile.title = dessin.nom
    const ctx = toile.getContext('2d')
    dessin.rangees.forEach((rangee, y) => {
      ;[...rangee].forEach((signe, x) => {
        const indice = nuanceDe(signe)
        if (transparent0 && indice === 0) return // le damier du fond se voit au travers
        ctx.fillStyle = versDiese(palette[indice])
        ctx.fillRect(x, y, 1, 1)
      })
    })
    return toile
  }

  /** Le même dessin, montré en NUMÉROS : du plus clair au plus sombre, en gris. */
  const GRIS = [[31, 31, 31], [21, 21, 21], [11, 11, 11], [2, 2, 2]]

  /* ------------------------------------------------ le bandeau explicatif */

  function bandeau(palettes) {
    /* Pour les personnages, on montre un personnage (un Perso de seize) s'il
       y en a un : le sol du décor ne parlerait à personne. */
    const dessins = dessinsDuProgramme()
    const dessin = (pourLesLutins && dessins.find((d) => d.cote === 16)) || dessins[0]
    const palette = palettes[choisie]
    const nom = nomDeLaPalette(palette, choisie, pourLesLutins)

    const cadre = element('div', 'couleurs-etapes')

    const etape = (numero, titre, contenu, legende) => {
      const bloc = element('div', 'couleurs-etape')
      bloc.append(element('b', 'couleurs-numero', numero), element('strong', '', titre), contenu, element('small', 'aide', legende))
      cadre.append(bloc)
    }

    /* 1 — le dessin, en numéros */
    const numeros = element('div', 'couleurs-ligne')
    numeros.append(apercu(dessin, GRIS, 48))
    const chiffres = element('div', 'couleurs-chiffres')
    GRIS.forEach((g, i) => {
      const puce = element('span', '', String(i))
      puce.style.background = versDiese(g)
      puce.style.color = i < 2 ? '#111' : '#eee'
      chiffres.append(puce)
    })
    numeros.append(chiffres)
    etape('1', 'Ton dessin', numeros, `« ${dessin.nom} » ne porte que des numéros, de 0 à 3 — pas de couleur`)

    cadre.append(element('span', 'couleurs-fleche', '→'))

    /* 2 — la palette */
    const pastilles = element('div', 'couleurs-chiffres')
    palette.forEach((c, i) => {
      const puce = element('span', '', String(i))
      if (pourLesLutins && i === 0) {
        puce.className = 'vide'
        puce.title = 'transparent : le décor se voit au travers'
      } else {
        puce.style.background = versDiese(c)
        puce.style.color = (c[0] + c[1] + c[2]) > 45 ? '#111' : '#eee'
      }
      pastilles.append(puce)
    })
    etape('2', `Une palette${nom ? ` — ${nom}` : ''}`, pastilles,
      pourLesLutins ? `palette ${choisie} des personnages : une couleur par numéro (0 est transparent)`
        : `palette ${choisie} du décor : une couleur par numéro`)

    cadre.append(element('span', 'couleurs-fleche', '→'))

    /* 3 — à l'écran */
    const ecran = element('div', 'couleurs-ligne')
    ecran.append(apercu(dessin, palette, 48, pourLesLutins))
    const code = element('code', 'couleurs-code', pourLesLutins
      ? `teindreLutin(numero, ${choisie});`
      : choisie === 0 ? '(rien à écrire)' : `teindre(colonne, ligne, ${choisie});`)
    ecran.append(code)
    etape('3', 'À l’écran', ecran, pourLesLutins
      ? 'chaque personnage choisit sa palette — à rappeler après chaque sprite()'
      : choisie === 0
        ? 'la palette 0 est celle de toutes les cases qu’on n’a pas teintes, et du texte'
        : 'chaque case de la carte choisit sa palette')

    return cadre
  }

  /* ------------------------------------------------ ce que devient le jeu */

  function phraseDeConsole() {
    const quelle = consoleVisee()
    if (quelle === 'gb') return 'Console : Game Boy — quatre nuances, rien de plus.'
    return 'Console : 🌈 en couleur — la cartouche Game Boy Color prend ces couleurs.'
  }

  /* --------------------------------------------------------- l'atelier */

  function rafraichir() {
    /*
     * Tout se construit À CÔTÉ, puis remplace l'ancien contenu d'un seul coup.
     *
     * Vider la zone d'abord la faisait retomber à zéro pixel de haut un
     * instant : la page remontait, et l'on se retrouvait devant une autre
     * palette que celle qu'on venait de toucher.
     */
    const page = document.createDocumentFragment()

    if (!couleurPossible()) {
      const carte = element('div', 'couleurs-console')
      carte.innerHTML =
        '<strong>Console : Game Boy d’origine — quatre nuances, pas de couleur.</strong><br>' +
        'Tes dessins s’affichent avec leurs numéros : 0 le plus clair, 3 le plus sombre. ' +
        'Pour changer ces nuances pendant le jeu (fondu, clignotement), écris ' +
        '<code>paletteFond()</code> et <code>paletteLutins()</code> — le chapitre 7 du MODE COURS les explique.<br>' +
        'Les couleurs ne sont pas perdues : la liste en haut à gauche est sur <b>« Game Boy »</b>. ' +
        '<b>« 🌈 En couleur »</b>, le jeu est une cartouche Game Boy Color, avec toutes ses couleurs.'
      page.append(carte)
      /* Le geste, plutôt que l'explication du geste : un clic, et les palettes reviennent. */
      if (passerEnCouleur) {
        const bouton = element('button', 'principal', '🌈 Passer en couleur')
        bouton.type = 'button'
        bouton.addEventListener('click', () => { passerEnCouleur(); rafraichir() })
        page.append(bouton)
      }
      zone.replaceChildren(page)
      return
    }

    const source = lireSource()
    const fond = lireCouleurs(source, false)
    const lutins = lireCouleurs(source, true)
    const palettes = pourLesLutins ? lutins : fond

    const ecrire = () => {
      ecrireSource(ecrireCouleurs(lireSource(), fond, lutins))
      surChangement()
    }

    /* --- en tête : pour qui, et quoi --- */
    page.append(element('p', 'couleurs-console', phraseDeConsole()))

    const haut = element('div', 'rangee couleurs-barre')
    for (const [etiquette, valeur, detail] of [
      ['🧱 Le décor', false, 'les cases de la carte, et le texte'],
      ['🧍 Les personnages', true, 'les lutins : sprite(), sprite16()'],
    ]) {
      const bouton = element('button', pourLesLutins === valeur ? 'principal' : '', etiquette)
      bouton.type = 'button'
      bouton.title = detail
      bouton.addEventListener('click', () => { pourLesLutins = valeur; rafraichir() })
      haut.append(bouton)
    }

    /*
     * Un point de départ, plutôt qu'une page blanche.
     *
     * Les palettes qu'un programme ne pose pas gardent le vert d'origine :
     * on ouvre l'atelier, on ne voit que du vert, et l'on croit que la couleur
     * ne marche pas. Le bouton en pose seize d'un coup — de quoi habiller un
     * décor entier — et laisse les quatre dernières palettes libres.
     */
    /* Les huit d'un coup, chacune d'une famille différente — celles du décor
       ou celles des personnages, selon ce qu'on regarde. */
    const proposer = element('button', '', '✦ Remplir les 16 palettes')
    proposer.type = 'button'
    proposer.title = 'le décor : ' + NOMS_PROPOSES.join(', ') + ' — les personnages : ' + NOMS_LUTINS_PROPOSES.join(', ')
    proposer.addEventListener('click', () => {
      /* Les deux d'un coup : remplir le décor puis devoir revenir remplir les
         personnages, c'était un clic qu'on oubliait. */
      for (let p = 0; p < 8; p++) {
        for (let t = 0; t < 4; t++) {
          fond[p][t] = [...PALETTES_PROPOSEES[p][t]]
          lutins[p][t] = [...PALETTES_LUTINS_PROPOSEES[p][t]]
        }
      }
      ecrire()
      rafraichir()
    })
    haut.append(proposer)
    page.append(haut)

    /*
     * Les palettes encore VERTES, dites franchement — et comblées d'un clic.
     *
     * Un programme ouvert avant qu'on propose les huit familles gardait ses
     * palettes jamais choisies dans le vert d'origine : quatre cartes pareilles,
     * et des aperçus qui se répétaient. Le bouton ne touche QUE celles-là, au
     * décor comme aux personnages : une palette qu'on a réglée soi-même reste
     * comme on l'a laissée.
     */
    const estVerte = (palette, lutin) => palette.every((c, t) =>
      (lutin && t === 0) || c.every((v, k) => v === PALETTE_ORIGINE[t][k]))
    /* La palette 0 est celle de la Game Boy d'origine : verte exprès. */
    const vertesFond = fond.map((p, i) => (i > 0 && estVerte(p, false) ? i : -1)).filter((i) => i >= 0)
    const vertesLutins = lutins.map((p, i) => (i > 0 && estVerte(p, true) ? i : -1)).filter((i) => i >= 0)
    if (vertesFond.length || vertesLutins.length) {
      const alerte = element('div', 'couleurs-alerte')
      const dire = []
      if (vertesFond.length) dire.push(`décor : ${vertesFond.join(', ')}`)
      if (vertesLutins.length) dire.push(`personnages : ${vertesLutins.join(', ')}`)
      alerte.append(element('span', '', `⚠ Ces palettes sont encore toutes vertes, donc identiques — ${dire.join(' · ')}.`))
      const completer = element('button', 'principal', '✦ Leur donner des couleurs')
      completer.type = 'button'
      completer.title = 'chaque palette verte reçoit sa famille : brique, herbe, ciel… et héros, ennemi, glace… — les autres ne bougent pas'
      completer.addEventListener('click', () => {
        for (const p of vertesFond) for (let t = 0; t < 4; t++) fond[p][t] = [...PALETTES_PROPOSEES[p][t]]
        for (const p of vertesLutins) for (let t = 0; t < 4; t++) lutins[p][t] = [...PALETTES_LUTINS_PROPOSEES[p][t]]
        ecrire()
        rafraichir()
      })
      alerte.append(completer)
      page.append(alerte)
    }

    /* --- le fil : dessin → palette → écran --- */
    page.append(bandeau(palettes))

    /* --- les 8 palettes du jeu, en cartes (numérotées de 0 à 7, comme dans les ateliers) --- */
    const grille = element('div', 'couleurs-grille')
    const dessins = dessinsDuProgramme().slice(0, 6)

    palettes.slice(0, 8).forEach((palette, p) => {
      const carte = element('div', 'couleurs-carte' + (p === choisie ? ' choisie' : ''))
      carte.addEventListener('click', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON') return
        choisie = p
        rafraichir()
      })

      /* L'en-tête : le numéro qu'on écrit, le nom qu'on retient. */
      const tete = element('div', 'couleurs-tete')
      const nom = nomDeLaPalette(palette, p, pourLesLutins)
      tete.append(element('b', '', `Palette ${p}`), element('span', 'aide', nom || (p === 0 && !pourLesLutins ? 'celle par défaut' : '')))
      carte.append(tete)

      /* Les quatre couleurs, chacune sous son numéro. */
      const teintes = element('div', 'couleurs-teintes')
      palette.forEach((couleur, t) => {
        const case_ = element('label', 'couleurs-teinte')
        const choix = document.createElement('input')
        choix.type = 'color'
        choix.value = versDiese(couleur)
        choix.title = `palette ${p}, numéro ${t} — rouge ${couleur[0]}, vert ${couleur[1]}, bleu ${couleur[2]} (de 0 à 31)`
        /* Le numéro 0 d'un personnage ne s'affiche jamais : le montrer
           modifiable serait promettre un effet qui n'arrivera pas. */
        if (pourLesLutins && t === 0) {
          choix.disabled = true
          choix.title = 'le numéro 0 d’un personnage est transparent : le décor se voit au travers'
        }
        choix.addEventListener('input', () => {
          palettes[p][t] = depuisDiese(choix.value)
          ecrire()
        })
        /* Au relâché du sélecteur, les aperçus se mettent à jour — mais la
           palette sélectionnée reste celle qu'on avait choisie : retoucher une
           couleur ne doit pas emmener ailleurs. */
        choix.addEventListener('change', () => rafraichir())
        case_.append(choix, element('small', '', pourLesLutins && t === 0 ? 'vide' : String(t)))
        teintes.append(case_)
      })
      carte.append(teintes)

      /* Tes dessins, dans ces couleurs : c'est ce qu'on veut vraiment voir. */
      const vus = element('div', 'couleurs-dessins')
      for (const dessin of dessins) vus.append(apercu(dessin, palette, 30, pourLesLutins))
      carte.append(vus)

      /* Revenir au vert d'origine, palette par palette. */
      const aLOrigine = palette.every((c, t) => c.every((v, k) => v === PALETTE_ORIGINE[t][k]))
      if (!aLOrigine) {
        const remettre = element('button', 'petit couleurs-remettre', '↺ vert d’origine')
        remettre.type = 'button'
        remettre.title = 'retirer cette palette du programme'
        remettre.addEventListener('click', () => {
          for (let t = 0; t < 4; t++) palettes[p][t] = [...PALETTE_ORIGINE[t]]
          ecrire()
          rafraichir()
        })
        carte.append(remettre)
      }

      grille.append(carte)
    })
    page.append(grille)
    zone.replaceChildren(page)
  }

  /*
   * Poser les couleurs proposées, sans passer par le bouton.
   *
   * C'est ce dont « Nouveau » se sert : un jeu neuf part avec ses seize
   * couleurs, plutôt qu'avec huit palettes vertes qu'il faudrait remplir avant
   * de voir quoi que ce soit.
   */
  function proposer() {
    /* Sur une console d'origine, proposer des couleurs, c'est écrire des
       lignes que le compilateur refusera. Mieux vaut n'en écrire aucune. */
    if (!couleurPossible()) return
    const source = lireSource()
    const fond = lireCouleurs(source, false)
    const lutins = lireCouleurs(source, true)
    for (let p = 0; p < PROPOSEES_PAR_DEFAUT; p++) {
      for (let t = 0; t < 4; t++) {
        fond[p][t] = [...PALETTES_PROPOSEES[p][t]]
        lutins[p][t] = [...PALETTES_LUTINS_PROPOSEES[p][t]]
      }
    }
    ecrireSource(ecrireCouleurs(source, fond, lutins))
  }

  return { rafraichir, proposer }
}

/**
 * Le nom d'une palette, quand elle est encore celle qu'on a proposée.
 *
 * Le nom sert à choisir, le numéro à écrire : « teindre(c, l, 2) » veut un
 * NUMÉRO. Le nom s'efface dès qu'on s'écarte de la proposition, puisqu'il ne
 * décrit alors plus rien.
 */
export function nomDeLaPalette(palette, p, pourLesLutins = false) {
  const attendue = (pourLesLutins ? PALETTES_LUTINS_PROPOSEES : PALETTES_PROPOSEES)[p]
  /* Le numéro 0 d'un personnage ne se voit pas : il ne compte pas pour le nom. */
  const pareille = palette.every((c, t) => (pourLesLutins && t === 0) || c.every((v, k) => v === attendue[t][k]))
  return pareille ? (pourLesLutins ? NOMS_LUTINS_PROPOSES : NOMS_PROPOSES)[p] : ''
}

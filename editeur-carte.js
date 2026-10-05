/**
 * Dessiner tout l'écran d'un coup, au pixel — une méga-tuile, par son nom.
 *
 * L'atelier des tuiles dessine un carré de huit ou seize pixels à la fois ;
 * celui-ci dessine les CENT SOIXANTE sur CENT QUARANTE-QUATRE pixels de
 * l'écran entier, comme une seule grande image. Sous le capot, rien de
 * nouveau : chaque carré de huit devient un « poser(colonne, ligne, {…}) »
 * ordinaire, avec son dessin écrit sur place — exactement ce que l'atelier
 * des tuiles écrit déjà pour un dessin sans nom. Deux carrés identiques ne
 * coûtent qu'UNE tuile : c'est le compilateur qui le fait, pas cet atelier.
 *
 * Une carte porte un NOM, comme une tuile ou un air, et devient une fonction
 * de ce nom : « FOND(); » l'affiche, où et quand le programme le décide.
 * L'atelier n'appelle rien tout seul — on peut vouloir dessiner une carte
 * pour le menu, une autre pour le jeu, une troisième pour la fin, et choisir
 * soi-même laquelle appeler, et quand.
 */

import { lireDessins, NUANCES, nuanceDe, peindre, paletteDUneTuile } from './editeur-tuiles.js'
import { poserDansLeProgramme } from './programme.js'
import { NUANCES_ECRITES } from './compilateur/emetteur.js'
import { nuanceDuPixel } from './importer-image.js'
import { lireCouleurs, ecrireCouleurs, versDiese, nomDeLaPalette, memeCouleur, palettesMontrees, aDesCouleurs } from './editeur-couleurs.js'
import { barrePaint, NOMBRE_DE_PALETTES } from './barre-paint.js'
import { placesDuDecor, compterLaCase, trouverUnePalette, differentes, ramenerA, usagesDuDecor, palettePourLui, enUneListe } from './nuancier.js'
import {
  lireScene, ecrireScene, faireDeLaSceneLeJeu, mursVides, HEROS_PAR_DEFAUT, MONSTRE_PAR_DEFAUT,
  mainAUnContenuPropre, ACTIONS, ACTIONS_ACTEUR, MOUVEMENTS, messageLisible, nomDeVariable, ETATS_DU_JOUEUR,
  BRUITAGES, lireReglagesDuJeu, ecrireReglagesDuJeu, listerLesScenes, lirePalettesDuPerso,
} from './editeur-scene.js'

const SAUT = String.fromCharCode(10)

export const COLONNES = 20
export const LIGNES = 18
export const LARGEUR_PX = COLONNES * 8
export const HAUTEUR_PX = LIGNES * 8

/** La carte matérielle fait 32 colonnes ; le dessin, vingt, s'y répète une fois et demie. */
const COLONNES_MATERIELLES = 32

/*
 * Les signes valides dans une rangée, prêts à entrer dans une classe de
 * caractères — le tiret part À LA FIN : au milieu, « 1-2 » serait lu comme un
 * intervalle, et la classe voudrait dire autre chose que ce qu'on croit.
 */
const CLASSE = Object.keys(NUANCES_ECRITES).filter((s) => s !== '-').join('') + '-'

function grilleVide(colonnes = COLONNES, lignes = LIGNES) {
  return Array.from({ length: lignes * 8 }, () => Array(colonnes * 8).fill(0))
}

/*
 * La taille d'une carte, en cases : de 20 × 18 (un écran) à 32 × 32 (toute la
 * carte matérielle de la console, 256 × 256 pixels). Plus grande que l'écran,
 * la scène se joue avec une CAMÉRA qui suit le joueur.
 *
 * Elle est écrite dans la fonction de la carte, sur une ligne à elle :
 * « // taille = 32 x 18 ». Sans cette ligne : un écran.
 */
export const TAILLE_MAXI = 32
export function lireTailleDeCarte(source, nom) {
  const i = nom ? source.indexOf(debutCarte(nom)) : -1
  if (i < 0) return { colonnes: COLONNES, lignes: LIGNES }
  const j = source.indexOf(finCarte(nom), i)
  const m = source.slice(i, j >= 0 ? j : undefined).match(/\/\/ taille = (\d+) x (\d+)/)
  if (!m) return { colonnes: COLONNES, lignes: LIGNES }
  return {
    colonnes: Math.max(COLONNES, Math.min(TAILLE_MAXI, Number(m[1]))),
    lignes: Math.max(LIGNES, Math.min(TAILLE_MAXI, Number(m[2]))),
  }
}

/** La même grille, agrandie ou rognée — ce qui dépasse est perdu, ce qui manque est vide. */
export function redimensionner(grille, colonnes, lignes) {
  const neuve = grilleVide(colonnes, lignes)
  for (let y = 0; y < neuve.length && y < grille.length; y++) {
    for (let x = 0; x < neuve[0].length && x < grille[0].length; x++) neuve[y][x] = grille[y][x]
  }
  return neuve
}

/**
 * L'écran entier, tel qu'une image le remplirait — une grille de pixels, pas
 * une tuile : la carte est CENT SOIXANTE sur CENT QUARANTE-QUATRE, bien plus
 * grande qu'un seul carré de huit, et c'est exactement là qu'une image
 * détaillée a sa place plutôt que dans une tuile qui l'écraserait.
 *
 * Prise en ENTIER et déformée s'il le faut, comme pour une tuile : mieux vaut
 * la voir entière et corriger ensuite au pixel, que d'en perdre un bord à
 * rogner.
 */
async function grilleDepuisUneImage(fichier, LARGEUR_PX = COLONNES * 8, HAUTEUR_PX = LIGNES * 8) {
  const image = new Image()
  const adresse = URL.createObjectURL(fichier)

  try {
    await new Promise((fait, rate) => {
      image.onload = fait
      image.onerror = () => rate(new Error(`« ${fichier.name} » n'est pas une image que le navigateur sache lire`))
      image.src = adresse
    })

    const toile = document.createElement('canvas')
    toile.width = LARGEUR_PX
    toile.height = HAUTEUR_PX
    const ctx = toile.getContext('2d', { willReadFrequently: true })
    ctx.drawImage(image, 0, 0, LARGEUR_PX, HAUTEUR_PX)

    const pixels = ctx.getImageData(0, 0, LARGEUR_PX, HAUTEUR_PX).data
    const nouvelle = grilleVide(LARGEUR_PX / 8, HAUTEUR_PX / 8)
    for (let y = 0; y < HAUTEUR_PX; y++) {
      for (let x = 0; x < LARGEUR_PX; x++) {
        const i = (y * LARGEUR_PX + x) * 4
        nouvelle[y][x] = nuanceDuPixel(pixels[i], pixels[i + 1], pixels[i + 2], pixels[i + 3])
      }
    }
    return nouvelle
  } finally {
    /* Le navigateur garde le fichier en mémoire tant qu'on ne rend pas
       l'adresse — voir « importer-image.js », qui fait la même chose. */
    URL.revokeObjectURL(adresse)
  }
}

/* -------------------------------------------------------------- les marques */

/*
 * Chaque carte porte ses propres marques, à SON nom — deux cartes doivent
 * pouvoir vivre côte à côte dans le même programme sans se marcher dessus.
 */
const debutCarte = (nom) => `/* --- carte "${nom}" --- */`
const finCarte = (nom) => `/* --- fin de la carte "${nom}" --- */`
const debutDefile = (nom) => `/* --- défilement "${nom}" --- */`
const finDefile = (nom) => `/* --- fin du défilement "${nom}" --- */`

const MOTIF_LISTE = /\/\* --- carte "([A-Za-z_]\w*)" --- \*\/[\s\S]*?\/\* --- fin de la carte "\1" --- \*\//g

/** Les noms de toutes les cartes du programme, dans l'ordre où elles y sont écrites. */
export function listerLesCartes(source) {
  const noms = []
  MOTIF_LISTE.lastIndex = 0
  let coup
  while ((coup = MOTIF_LISTE.exec(source)) !== null) noms.push(coup[1])
  return noms
}

/* ---------------------------------------------------------------- lecture */

/**
 * Lit une carte, par son nom.
 *
 * Seuls les « poser(colonne, ligne, {…}) » DE SA fonction sont relus — ceux
 * que le reste du programme écrit ailleurs, dans une boucle ou un calcul, ne
 * se ramènent pas à une case de cette grille, et cet atelier ne prétend pas
 * les gouverner ni les effacer.
 */
export function lireGrilleDeCarte(source, nom) {
  const taille = lireTailleDeCarte(source, nom)
  const grille = grilleVide(taille.colonnes, taille.lignes)
  if (!nom) return grille

  const debut = debutCarte(nom)
  const iDebut = source.indexOf(debut)
  if (iDebut < 0) return grille
  const fin = finCarte(nom)
  const iFin = source.indexOf(fin, iDebut)
  const bloc = iFin >= 0 ? source.slice(iDebut, iFin + fin.length) : source.slice(iDebut)

  const motif = new RegExp(
    `poser\\s*\\(\\s*(\\d+)\\s*,\\s*(\\d+)\\s*,\\s*\\{([\\s\\S]*?)\\}\\s*\\)\\s*;`, 'g')
  const motifRangee = new RegExp(`'([${CLASSE}]{8})'|"([${CLASSE}]{8})"`, 'g')

  let coup
  while ((coup = motif.exec(bloc)) !== null) {
    const colonne = Number(coup[1])
    const ligne = Number(coup[2])
    /* Au-delà de la colonne 20, ce n'est pas dessiné — c'est RÉPÉTÉ pour que
       le tapis boucle sans coupure. Le relire écrirait le même carré deux
       fois, une fois lu tel quel et une fois par la répétition elle-même. */
    if (colonne >= taille.colonnes || ligne >= taille.lignes) continue

    const rangees = [...coup[3].matchAll(motifRangee)].map((m) => m[1] ?? m[2])
    if (rangees.length !== 8) continue // un bloc mal formé est laissé au compilateur

    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        grille[ligne * 8 + y][colonne * 8 + x] = nuanceDe(rangees[y][x])
      }
    }
  }

  return grille
}

/**
 * La palette de chaque case de la carte — 0 partout, sauf là où la fonction
 * de la carte écrit « teindre(colonne, ligne, palette); ».
 *
 * Seuls les appels DE SA fonction sont relus, écrits en clair : comme pour
 * les « poser », ce que le reste du programme teint ailleurs ne se ramène pas
 * à une case de cette grille.
 */
export function lireTeintesDeCarte(source, nom) {
  const taille = lireTailleDeCarte(source, nom)
  const teintes = Array.from({ length: taille.lignes }, () => Array(taille.colonnes).fill(0))
  if (!nom) return teintes

  const iDebut = source.indexOf(debutCarte(nom))
  if (iDebut < 0) return teintes
  const iFin = source.indexOf(finCarte(nom), iDebut)
  const bloc = iFin >= 0 ? source.slice(iDebut, iFin) : source.slice(iDebut)

  for (const coup of bloc.matchAll(/teindre\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:\|\s*DEVANT\s*)?\)\s*;/g)) {
    const [colonne, ligne, palette] = [Number(coup[1]), Number(coup[2]), Number(coup[3])]
    if (colonne < taille.colonnes && ligne < taille.lignes && palette <= 7) teintes[ligne][colonne] = palette
  }
  return teintes
}

/*
 * Les cases qui passent DEVANT les personnages (Game Boy Color) : écrites
 * « teindre(c, l, p | DEVANT) » dans la fonction de la carte. Un ensemble de
 * « colonne,ligne ».
 */
export function lireDevantDeCarte(source, nom) {
  const devant = new Set()
  if (!nom) return devant
  const iDebut = source.indexOf(debutCarte(nom))
  if (iDebut < 0) return devant
  const iFin = source.indexOf(finCarte(nom), iDebut)
  const bloc = iFin >= 0 ? source.slice(iDebut, iFin) : source.slice(iDebut)
  for (const coup of bloc.matchAll(/teindre\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*\d+\s*\|\s*DEVANT\s*\)\s*;/g)) devant.add(`${coup[1]},${coup[2]}`)
  return devant
}

/** Cette carte défile-t-elle déjà, d'après ce que le programme porte ? */
export function lireDefilementDeCarte(source, nom) {
  return Boolean(nom) && source.includes(debutDefile(nom))
}

/* --------------------------------------------------------------- écriture */

/** Le carré de huit à cette colonne, cette ligne — huit rangées de chiffres. */
function blocDeTuile(grille, colonne, ligne) {
  const rangees = []
  let vide = true
  for (let y = 0; y < 8; y++) {
    let rangee = ''
    for (let x = 0; x < 8; x++) {
      const n = grille[ligne * 8 + y][colonne * 8 + x]
      if (n !== 0) vide = false
      rangee += String(n)
    }
    rangees.push(rangee)
  }
  return vide ? null : rangees
}

/** Combien de carrés DIFFÉRENTS cette carte dessine — c'est ce que ça coûte en tuiles. */
export function compterLesTuiles(grille) {
  const vus = new Set()
  for (let ligne = 0; ligne < grille.length / 8; ligne++) {
    for (let colonne = 0; colonne < grille[0].length / 8; colonne++) {
      const rangees = blocDeTuile(grille, colonne, ligne)
      if (rangees) vus.add(rangees.join(''))
    }
  }
  return vus.size
}

/*
 * Combien de colonnes dessiner : vingt pour une carte fixe, trente-deux — la
 * carte matérielle entière — pour un tapis qui doit boucler sans coupure.
 * Au-delà de la colonne vingt, on relit le dessin depuis son début :
 * « colonne % COLONNES » fait recommencer le motif, une fois et demie sur
 * trente-deux cases.
 */
function construireFonction(nom, grille, defileActif, teintes, devant = new Set()) {
  const colonnes = grille[0].length / 8
  const hauteur = grille.length / 8
  /* Le tapis qui boucle n'a de sens que pour une carte d'un écran. */
  const largeur = defileActif && colonnes === COLONNES ? COLONNES_MATERIELLES : colonnes
  const lignes = [`void ${nom}() {`]
  if (colonnes !== COLONNES || hauteur !== LIGNES) lignes.push(`  // taille = ${colonnes} x ${hauteur}`)
  for (let ligne = 0; ligne < hauteur; ligne++) {
    for (let colonne = 0; colonne < largeur; colonne++) {
      const rangees = blocDeTuile(grille, colonne % colonnes, ligne)
      if (!rangees) continue // un carré resté vide garde le fond effacé — gratuit
      lignes.push(`  poser(${colonne}, ${ligne}, {`)
      for (const r of rangees) lignes.push(`    "${r}",`)
      lignes.push('  });')
    }
  }

  /* Les palettes des cases, sur Game Boy Color. La palette 0 est celle de
     toute case qu'on ne teint pas : inutile de l'écrire. */
  const teintees = []
  for (let ligne = 0; ligne < hauteur; ligne++) {
    for (let colonne = 0; colonne < largeur; colonne++) {
      const palette = teintes?.[ligne]?.[colonne % colonnes] ?? 0
      const avant = devant.has(`${colonne % colonnes},${ligne}`)
      if (palette || avant) teintees.push(`  teindre(${colonne}, ${ligne}, ${palette}${avant ? ' | DEVANT' : ''});${avant ? '   // devant les personnages' : ''}`)
    }
  }
  if (teintees.length) lignes.push('  /* les palettes des cases — Game Boy Color */', ...teintees)
  lignes.push('}')
  return [debutCarte(nom), ...lignes, finCarte(nom), ''].join(SAUT)
}

/** La variable qui avance et la fonction qui la fait avancer, appelées par le programme lui-même. */
function construireDefile(nom) {
  return [
    debutDefile(nom),
    `uint8_t ${nom}_defileX = 0;`,
    `void ${nom}_avancer() {`,
    `  ${nom}_defileX = ${nom}_defileX + 1;`,
    `  defiler(${nom}_defileX, 0);`,
    '}',
    finDefile(nom),
    '',
  ].join(SAUT)
}

/**
 * Réécrit une carte — et son tapis, s'il défile — dans le programme.
 *
 * Chaque carte est une fonction de son nom : « NOM() ». Rien ne l'appelle
 * ici — ce n'est pas à l'atelier de décider quand une carte s'affiche, ni
 * même si elle s'affiche à toutes les images ou une seule fois. C'est écrit
 * comme une tuile ou un air : posé à la suite des autres, prêt à être appelé.
 *
 * Les deux blocs sont repérés par leurs marques et REMPLACÉS ; sinon posés à
 * la suite de la dernière tuile — les fonctions sont vues de partout, quel
 * que soit l'endroit du texte où elles vivent, donc l'ordre ne compte pas
 * pour la compilation ; seulement pour qu'on les retrouve à la même place
 * d'une fois sur l'autre.
 */
/*
 * Où finit la dernière déclaration du programme — tuile, perso, carte ou
 * tapis — pour poser la suivante juste après.
 *
 * « apresLEnTete » seul s'y laisse prendre : la toute première marque d'une
 * carte, écrite en haut d'un fichier sans la moindre tuile, est un
 * commentaire comme un autre — il la prend pour de l'EN-TÊTE, et pose la
 * carte suivante EN PLEIN MILIEU de la première, entre sa marque et sa
 * fonction. Chercher aussi la fin des cartes et des tapis déjà écrits évite
 * ce piège dès la deuxième carte.
 */
const MOTIF_DEFILE_TOUTES = /\/\* --- défilement "([A-Za-z_]\w*)" --- \*\/[\s\S]*?\/\* --- fin du défilement "\1" --- \*\//g

function finDeLaDerniereDeclaration(source) {
  let position = null
  const repousser = (fin) => { if (position === null || fin > position) position = fin }

  const dessins = lireDessins(source)
  if (dessins.length) repousser(dessins[dessins.length - 1].fin)

  MOTIF_LISTE.lastIndex = 0
  for (let coup = MOTIF_LISTE.exec(source); coup; coup = MOTIF_LISTE.exec(source)) {
    repousser(coup.index + coup[0].length)
  }

  MOTIF_DEFILE_TOUTES.lastIndex = 0
  for (let coup = MOTIF_DEFILE_TOUTES.exec(source); coup; coup = MOTIF_DEFILE_TOUTES.exec(source)) {
    repousser(coup.index + coup[0].length)
  }

  return position
}

export function ecrireCarte(source, nom, grille, defileActif, teintes = lireTeintesDeCarte(source, nom), devant = lireDevantDeCarte(source, nom)) {
  /* Sans teintes données, on garde celles que la carte porte déjà : redessiner
     un pixel ne doit pas effacer les palettes posées à côté (ni les cases « devant »). */
  const fonction = construireFonction(nom, grille, defileActif, teintes, devant)

  const iDebut = source.indexOf(debutCarte(nom))
  if (iDebut >= 0) {
    const fin = finCarte(nom)
    const iFin = source.indexOf(fin, iDebut)
    source = iFin >= 0
      ? source.slice(0, iDebut) + fonction + source.slice(iFin + fin.length).replace(/^\r?\n/, '')
      : source
  } else {
    source = poserDansLeProgramme(source, fonction.trimEnd(), finDeLaDerniereDeclaration(source))
  }

  const dDebut = debutDefile(nom)
  const dFin = finDefile(nom)
  const jDebut = source.indexOf(dDebut)
  if (jDebut >= 0) {
    const jFin = source.indexOf(dFin, jDebut)
    if (jFin >= 0) {
      const avant = source.slice(0, jDebut)
      const apres = source.slice(jFin + dFin.length).replace(/^\r?\n/, '')
      source = defileActif
        ? avant + construireDefile(nom) + apres
        : (avant + apres).replace(/\n{3,}/g, '\n\n')
    }
  } else if (defileActif) {
    source = poserDansLeProgramme(source, construireDefile(nom).trimEnd(), finDeLaDerniereDeclaration(source))
  }

  return source
}

/* --------------------------------------------------------------- les outils */

/** Une case est-elle dans l'ellipse inscrite dans son rectangle ? */
function dansLEllipse(x, y, cx, cy, rx, ry) {
  if (rx <= 0 || ry <= 0) return Math.round(cx) === x && Math.round(cy) === y
  const dx = (x - cx) / (rx + 0.5)
  const dy = (y - cy) / (ry + 0.5)
  return dx * dx + dy * dy <= 1
}

/**
 * Les cases que dessine un outil, du point de départ au point d'arrivée.
 *
 * Le crayon n'y passe pas : il pose une case à la fois, tout de suite, au
 * fil du geste — les trois autres attendent la fin du geste pour savoir quoi
 * dessiner, un rectangle ou un cercle n'ayant de sens qu'une fois ses deux
 * coins connus.
 */
export function pixelsDeForme(outil, x0, y0, x1, y1, rempli) {
  const points = []

  if (outil === 'ligne') {
    /* Bresenham : la droite entre deux cases, sans jamais sauter une case. */
    let x = x0
    let y = y0
    const dx = Math.abs(x1 - x0)
    const sx = x0 < x1 ? 1 : -1
    const dy = -Math.abs(y1 - y0)
    const sy = y0 < y1 ? 1 : -1
    let erreur = dx + dy
    while (true) {
      points.push([x, y])
      if (x === x1 && y === y1) break
      const e2 = 2 * erreur
      if (e2 >= dy) { erreur += dy; x += sx }
      if (e2 <= dx) { erreur += dx; y += sy }
    }
    return points
  }

  const xMin = Math.min(x0, x1)
  const xMax = Math.max(x0, x1)
  const yMin = Math.min(y0, y1)
  const yMax = Math.max(y0, y1)

  if (outil === 'rectangle') {
    for (let y = yMin; y <= yMax; y++) {
      for (let x = xMin; x <= xMax; x++) {
        if (rempli || x === xMin || x === xMax || y === yMin || y === yMax) points.push([x, y])
      }
    }
    return points
  }

  if (outil === 'cercle') {
    const cx = (xMin + xMax) / 2
    const cy = (yMin + yMax) / 2
    const rx = (xMax - xMin) / 2
    const ry = (yMax - yMin) / 2
    for (let y = yMin; y <= yMax; y++) {
      for (let x = xMin; x <= xMax; x++) {
        if (!dansLEllipse(x, y, cx, cy, rx, ry)) continue
        if (rempli) { points.push([x, y]); continue }
        /* Le contour : dedans, avec au moins un voisin dehors. */
        const dehors = [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]]
          .some(([nx, ny]) => !dansLEllipse(nx, ny, cx, cy, rx, ry))
        if (dehors) points.push([x, y])
      }
    }
    return points
  }

  return [[x1, y1]] // 'crayon' isolé — un seul point, celui d'arrivée
}

/* -------------------------------------------------------------- l'atelier */

const ZOOM_MINI = 2
const ZOOM_MAXI = 12

/**
 * Installe l'atelier des cartes.
 *
 * Comme les autres, il ne connaît ni le champ de texte ni l'émulateur : il
 * demande le programme, le réécrit, et prévient quand il a changé.
 */
export function installer({
  bande, grille: zoneGrille, lireSource, ecrireSource, surChangement, demanderUnNom,
  /* La visite guidée vit dans la page : elle seule sait faire clignoter un
     élément et placer une bulle par-dessus tout le reste. L'atelier se
     contente de proposer le bouton qui la démarre. */
  visiteGuidee = null,
  /* La console visée accepte-t-elle la couleur ? Sans elle, pas de palettes
     de cases : la carte se dessine en quatre nuances, comme avant. */
  couleurPossible = () => false,
  /* Compiler et lancer, quoi que disent les réglages : « Jouer la scène » est
     une demande explicite de voir le jeu tourner. */
  lancer = null,
  /* Montrer un morceau du programme dans l'éditeur de code : « voir le C++ ». */
  montrerLeCode = null,
}) {
  let carteChoisie = null // le nom de la carte en cours d'édition
  /*
   * Deux gestes, et un seul à la fois : DESSINER les pixels (des numéros de
   * 0 à 3), ou COLORIER les cases (la palette de chaque carré de huit). Les
   * mêler dans une seule barre laissait croire qu'on peignait une couleur au
   * pixel — ce que la console ne sait pas faire.
   */
  let geste = 'dessiner'
  let paletteChoisie = 1
  let devantEnMain = false   // 🔝 : colorier met les cases DEVANT les personnages, au lieu d'une palette
  let modeDevant = null      // ce geste ajoute (true) ou retire (false) des cases « devant »
  let paletteEnMain = 0     // la palette de la couleur en main (0 à 3) ; « nuance » est son numéro
  let poseDeMur = 1 // 1 : on pose des murs ; 0 : on les enlève
  let evenementChoisi = null // le numéro de l'événement qu'on règle
  let acteurChoisi = null    // le numéro de l'acteur qu'on règle
  let dessinAPoser = null    // le dessin que prendra le prochain acteur posé (la galerie)
  let derniereSouris = null  // où était la souris sur la carte : le curseur y revient après une recompilation
  let aligner = true         // 🧲 les acteurs et le joueur se calent sur les cases de 8 × 8
  let glisse = null          // l'acteur qu'on déplace à la souris : { i, dx, dy }
  let nuance = 3
  let outil = 'crayon'
  let outilAvant = 'crayon'  // la pipette rend la main à l'outil d'avant
  let selection = null       // { x, y, w, h } : le rectangle choisi à la souris
  let pressePapiers = null   // { w, h, pixels, enCouleur, grille } : ce qu'on a copié
  let tailleSelection = 'libre' // ⬚ la sélection : un rectangle libre, ou UN carré de 8 × 8, ou un bloc de 16 × 16
  let deplaceSel = null       // { dx, dy } : la sélection qu'on glisse (attrapée à dx, dy de son coin)
  let actionsClavier = {}    // Ctrl+C, Ctrl+X, Ctrl+V, Suppr — posées par la carte affichée
  let rempli = true
  let peint = false
  let debutForme = null // { x, y } au départ d'un tracé de ligne, rectangle ou cercle
  let pas = 3 // pixels d'écran par pixel de la console — le zoom
  let pasAvantPleinEcran = null

  const noms = () => listerLesCartes(lireSource())

  addEventListener('keydown', (e) => {
    const ici = document.activeElement?.tagName
    if (ici === 'INPUT' || ici === 'TEXTAREA' || ici === 'SELECT') return
    if (!zoneGrille.isConnected || zoneGrille.offsetParent === null) return // la carte n'est pas à l'écran
    const touche = e.key.toLowerCase()
    const action = (e.ctrlKey || e.metaKey) ? actionsClavier[touche] : (e.key === 'Delete' ? actionsClavier.suppr : e.key === 'Escape' ? actionsClavier.echap : null)
    if (!action) return
    e.preventDefault()
    action()
  })

  /* --- la bande des cartes --- */

  function rafraichirBande() {
    const liste = noms()
    if (carteChoisie === null && liste.length > 0) carteChoisie = liste[0]
    if (carteChoisie && !liste.includes(carteChoisie)) carteChoisie = liste[0] ?? null

    bande.textContent = ''

    if (liste.length === 0) {
      const vide = document.createElement('p')
      vide.className = 'aide'
      vide.textContent =
        'Aucune carte créée. Le bouton ci-dessous en ajoute une, appelable par son nom dans ton programme.'
      bande.append(vide)
    }

    for (const nom of liste) {
      const bouton = document.createElement('button')
      bouton.type = 'button'
      bouton.className = 'tuile' + (nom === carteChoisie ? ' choisie' : '')
      bouton.title = `${nom}() — à appeler soi-même, où et quand on veut l’afficher`
      const etiquette = document.createElement('span')
      etiquette.textContent = nom
      bouton.append(etiquette)
      bouton.addEventListener('click', () => {
        carteChoisie = nom
        rafraichirBande()
        rafraichirGrille()
      })
      bande.append(bouton)
    }

    const boutonNeuf = document.createElement('button')
    boutonNeuf.type = 'button'
    boutonNeuf.id = 'carte-bouton-neuf'
    boutonNeuf.className = 'tuile neuve'
    boutonNeuf.textContent = '+ Nouvelle carte'
    boutonNeuf.addEventListener('click', async () => {
      const pris = new Set(liste)
      let n = 1
      while (pris.has('CARTE' + n)) n++

      const nom = demanderUnNom
        ? await demanderUnNom({ quoi: 'cette carte — ce sera son nom, à appeler dans ton programme', propose: 'CARTE' + n, pris })
        : 'CARTE' + n
      if (!nom) return

      ecrireSource(ecrireCarte(lireSource(), nom, grilleVide(), false))
      carteChoisie = nom
      surChangement()
      rafraichirBande()
      rafraichirGrille()
    })
    bande.append(boutonNeuf)
  }

  /* --- la grille de dessin --- */

  let boutonPleinEcran = null
  let tailleVue = { W: LARGEUR_PX, H: HAUTEUR_PX } // la taille de la carte affichée, en pixels
  const etiquetteDuBouton = () =>
    document.fullscreenElement === zoneGrille ? '⛶ Quitter le plein écran' : '⛶ Plein écran'
  zoneGrille.addEventListener('fullscreenchange', () => {
    if (boutonPleinEcran) boutonPleinEcran.textContent = etiquetteDuBouton()

    /*
     * Le plein écran agrandit LA PAGE, pas le dessin dedans.
     *
     * À un zoom resté petit, l'atelier prenait tout l'écran autour d'une
     * toile minuscule — on aurait juré que « plein écran » ne faisait rien.
     * On calcule donc, en entrant, le plus grand zoom entier qui tient dans
     * l'écran ; et l'on rend le zoom d'avant en sortant.
     */
    if (document.fullscreenElement === zoneGrille) {
      pasAvantPleinEcran = pas
      /* La carte ENTIÈRE, quelle que soit sa taille : un écran, ou jusqu'à 256 × 256. */
      const zoomX = Math.floor((window.innerWidth - 40) / tailleVue.W)
      const zoomY = Math.floor((window.innerHeight - 260) / tailleVue.H) // 260 : la barre d'outils et les couleurs
      pas = Math.max(ZOOM_MINI, Math.min(ZOOM_MAXI, Math.min(zoomX, zoomY)))
    } else if (pasAvantPleinEcran !== null) {
      pas = pasAvantPleinEcran
      pasAvantPleinEcran = null
    }
    rafraichirGrille()
    if (document.fullscreenElement !== zoneGrille) return

    /*
     * Puis on AJUSTE sur la place vraiment libre : les barres d'outils et les
     * couleurs, au-dessus, prennent plus ou moins de hauteur selon l'écran —
     * on mesure où le dessin commence, et on le fait tenir dessous. Enfin on
     * l'amène sous les yeux.
     */
    requestAnimationFrame(() => {
      const toile = zoneGrille.querySelector('.toile-carte')
      if (!toile) return
      const haut = toile.getBoundingClientRect().top - zoneGrille.getBoundingClientRect().top + zoneGrille.scrollTop
      const juste = Math.max(ZOOM_MINI, Math.min(ZOOM_MAXI,
        Math.floor((zoneGrille.clientWidth - 40) / tailleVue.W),
        Math.floor((zoneGrille.clientHeight - haut - 24) / tailleVue.H)))
      if (juste !== pas) {
        pas = juste
        rafraichirGrille()
      }
      zoneGrille.querySelector('.toile-carte')?.scrollIntoView({ block: 'nearest' })
    })
  })

  function rafraichirGrille() {
    const source = lireSource()
    const grille = lireGrilleDeCarte(source, carteChoisie)
    /* La taille de CETTE carte, en pixels : un écran, ou jusqu'à 256 × 256. */
    const W = grille[0].length
    const H = grille.length
    tailleVue = { W, H }
    const teintes = lireTeintesDeCarte(source, carteChoisie)
    const devant = lireDevantDeCarte(source, carteChoisie)
    let defileActif = lireDefilementDeCarte(source, carteChoisie)

    /* En couleur, la toile montre les VRAIES couleurs : chaque pixel prend son
       numéro dans la palette de sa case. Sinon, les quatre nuances. */
    const enCouleur = couleurPossible()
    if (!enCouleur && geste === 'colorier') geste = 'dessiner'
    const palettes = enCouleur ? palettesMontrees(source, false) : null
    const couleurDe = (x, y, indice) => enCouleur
      ? versDiese(palettes[teintes[y >> 3][x >> 3]][indice])
      : NUANCES[indice]

    /*
     * Combien de pixels se servent de chaque place de chaque palette — dans
     * TOUT le programme : les autres cartes, les tuiles, et celle-ci. Une place
     * prise ne change jamais de couleur ; c'est ce qui permet de ranger une
     * couleur neuve sans repeindre un dessin voisin. Voir « nuancier.js ».
     */
    let places = null
    let palettesChangees = false
    let barre = null // la barre de couleurs, posée plus bas : elle dit pourquoi un pixel est refusé
    if (enCouleur) {
      places = placesDuDecor(source, { sansCarte: carteChoisie })
      for (let l = 0; l < teintes.length; l++) {
        for (let c = 0; c < teintes[0].length; c++) compterLaCase(places, grille, teintes, c, l)
      }
    }
    /* La couleur de ce qu'on POSE : celle du nuancier en main, ou la nuance. */
    const couleurPosee = enCouleur ? () => versDiese(palettes[paletteEnMain][nuance]) : couleurDe

    /*
     * La scène de cette carte : ses murs et son joueur. Voir « editeur-scene.js »
     * — l'atelier ne fait que peindre ; c'est ce module qui écrit le C++.
     */
    const dessins = lireDessins(source)
    const scene = lireScene(source, carteChoisie) ?? { murs: mursVides(), x: 72, y: 64, dessin: null, evenements: [], acteurs: [] }
    scene.acteurs ??= []
    if (acteurChoisi !== null && !scene.acteurs[acteurChoisi]) acteurChoisi = null
    if (evenementChoisi !== null && !scene.evenements[evenementChoisi]) evenementChoisi = null
    const dessinDuJoueur = () =>
      dessins.find((d) => d.nom === scene.dessin) ?? dessins.find((d) => d.cote === 16) ?? dessins[0] ?? null
    const coteDuJoueur = () => dessinDuJoueur()?.cote ?? 16

    /* Écrit la scène — et, s'il n'y a encore aucun dessin, un héros tout prêt. */
    function ecrireLaScene(texte) {
      /* Les dessins sont relus DANS le texte qu'on va écrire, et non dans
         celui du dernier affichage : sinon le héros tout prêt, ajouté au
         premier geste, l'était une seconde fois au suivant — « HEROS est
         déjà déclaré ». */
      const presents = lireDessins(texte)
      let dessin = presents.find((d) => d.nom === scene.dessin) ??
        presents.find((d) => d.cote === 16) ?? presents[0] ?? null
      if (!dessin) {
        texte = HEROS_PAR_DEFAUT + SAUT + SAUT + texte
        dessin = { nom: 'HEROS', cote: 16 }
      }
      scene.dessin = dessin.nom
      return ecrireScene(texte, carteChoisie, { ...scene, cote: dessin.cote, couleur: enCouleur })
    }

    zoneGrille.textContent = ''

    /* Toujours visible, même sans carte choisie : c'est justement la
       première étape de la visite qui apprend à en créer une. */
    if (visiteGuidee) {
      const barreVisite = document.createElement('div')
      barreVisite.className = 'rangee'
      const boutonVisite = document.createElement('button')
      boutonVisite.type = 'button'
      boutonVisite.className = 'petit'
      boutonVisite.textContent = '🎓 Visite guidée'
      boutonVisite.title = 'montre, pas à pas, où cliquer pour dessiner une carte'
      boutonVisite.addEventListener('click', () => visiteGuidee())
      barreVisite.append(boutonVisite)
      zoneGrille.append(barreVisite)
    }

    if (!carteChoisie) {
      const aide = document.createElement('p')
      aide.className = 'aide'
      aide.textContent = 'Choisis une carte ci-dessus, ou crée-en une.'
      zoneGrille.append(aide)
      return
    }

    const titre = document.createElement('div')
    titre.className = 'rangee'
    const nomEtCompte = document.createElement('strong')
    nomEtCompte.textContent = carteChoisie
    const info = document.createElement('span')
    info.className = 'aide'
    info.textContent = `${carteChoisie}() — ${compterLesTuiles(grille)} tuiles utilisées`
    titre.append(nomEtCompte, info)

    const zoomer = (delta) => {
      const nouveau = Math.max(ZOOM_MINI, Math.min(ZOOM_MAXI, pas + delta))
      if (nouveau === pas) return
      pas = nouveau
      rafraichirGrille()
    }
    const moinsZoom = document.createElement('button')
    moinsZoom.type = 'button'
    moinsZoom.className = 'petit'
    moinsZoom.textContent = '− zoom'
    moinsZoom.title = 'plus petit, pour voir tout l’écran d’un coup'
    moinsZoom.addEventListener('click', () => zoomer(-1))

    const etiquetteZoom = document.createElement('span')
    etiquetteZoom.className = 'aide'
    etiquetteZoom.textContent = `${pas}×`

    const plusZoom = document.createElement('button')
    plusZoom.type = 'button'
    plusZoom.className = 'petit'
    plusZoom.textContent = '+ zoom'
    plusZoom.title = 'plus grand, pour viser un pixel précis'
    plusZoom.addEventListener('click', () => zoomer(1))

    boutonPleinEcran = document.createElement('button')
    boutonPleinEcran.type = 'button'
    boutonPleinEcran.className = 'petit'
    boutonPleinEcran.textContent = etiquetteDuBouton()
    boutonPleinEcran.title = 'l’atelier prend tout l’écran, pour dessiner sans distraction'
    boutonPleinEcran.addEventListener('click', () => {
      if (document.fullscreenElement) document.exitFullscreen()
      else zoneGrille.requestFullscreen()
    })

    const effacerTout = document.createElement('button')
    effacerTout.type = 'button'
    effacerTout.className = 'petit'
    effacerTout.textContent = '🗑 Effacer la carte'
    effacerTout.title = 'vide tout le dessin de cette carte — ↶ (Ctrl+Z) le fait revenir'
    effacerTout.addEventListener('click', () => {
      /* On demande quand même : c'est tout un dessin d'un coup. Mais il revient
         avec ↶ — l'historique de la page garde chaque version du programme. */
      if (!confirm(`Effacer tout le dessin de la carte « ${carteChoisie} » ?\n\n↶ (Ctrl+Z) le fera revenir si tu changes d’avis.`)) return
      /* Les pixels ET les palettes des cases : une carte vide repart de la palette 0. */
      const sansTeintes = Array.from({ length: H / 8 }, () => Array(W / 8).fill(0))
      ecrireSource(ecrireCarte(lireSource(), carteChoisie, grilleVide(W / 8, H / 8), defileActif, sansTeintes))
      surChangement()
      rafraichirGrille()
    })

    /*
     * Importer une image directement sur la carte, plutôt que sur une seule
     * tuile : l'écran entier lui appartient, une image détaillée y garde donc
     * bien plus de ses pixels que dans un carré de huit.
     */
    const champImage = document.createElement('input')
    champImage.type = 'file'
    champImage.accept = 'image/*'
    champImage.hidden = true
    champImage.addEventListener('change', async () => {
      const fichier = champImage.files[0]
      champImage.value = '' // pour qu'un même fichier rouvert refasse le travail
      if (!fichier) return

      /* Comme pour « Tout effacer » : ce qui était dessiné disparaît, et ne
         revient pas — on le dit avant, pas après. */
      if (!confirm(`Remplacer toute la carte « ${carteChoisie} » par cette image ?\n\nCe qui y était dessiné ne revient pas.`)) {
        return
      }

      let importee
      try {
        importee = await grilleDepuisUneImage(fichier, W, H)
      } catch (erreur) {
        alert(erreur.message)
        return
      }

      ecrireSource(ecrireCarte(lireSource(), carteChoisie, importee, defileActif))
      surChangement()
      rafraichirGrille()
    })

    const importerImage = document.createElement('button')
    importerImage.type = 'button'
    importerImage.className = 'petit'
    importerImage.textContent = '📥 Importer une image'
    importerImage.title = 'remplit toute la carte avec une image, ramenée aux quatre nuances — remplace le dessin en cours'
    importerImage.addEventListener('click', () => champImage.click())

    /*
     * La taille de la carte : un écran, ou plus — jusqu'à 32 × 32 cases, toute
     * la carte de la console. Plus grande que l'écran, la scène a une caméra
     * qui suit le joueur. Agrandir ajoute du vide ; rétrécir rogne.
     */
    const taille = document.createElement('span')
    taille.className = 'aide carte-taille'
    const choixTaille = (valeurs, actuelle, quoi) => {
      const s = document.createElement('select')
      for (const v of valeurs) {
        const o = document.createElement('option')
        o.value = String(v)
        o.textContent = String(v)
        s.append(o)
      }
      s.value = String(actuelle)
      s.title = quoi
      return s
    }
    const choixColonnes = choixTaille([20, 24, 28, 32], W / 8, 'colonnes : 20 = un écran de large')
    const choixLignes = choixTaille([18, 24, 28, 32], H / 8, 'lignes : 18 = un écran de haut')
    const changerDeTaille = () => {
      const c = Number(choixColonnes.value)
      const l = Number(choixLignes.value)
      if (c * 8 < W || l * 8 < H) {
        if (!confirm('Rétrécir la carte efface ce qui dépasse. Continuer ?')) { choixColonnes.value = String(W / 8); choixLignes.value = String(H / 8); return }
      }
      const neuves = Array.from({ length: l }, (_, y) => Array.from({ length: c }, (_, x) => teintes[y]?.[x] ?? 0))
      let texte = ecrireCarte(lireSource(), carteChoisie, redimensionner(grille, c, l), defileActif && c === COLONNES, neuves)
      /* La scène suit : ses murs prennent la nouvelle taille, sa caméra aussi. */
      if (lireScene(texte, carteChoisie)) texte = ecrireScene(texte, carteChoisie, { ...lireScene(texte, carteChoisie), cote: coteDuJoueur(), couleur: enCouleur })
      ecrireSource(texte)
      surChangement()
      rafraichirGrille()
    }
    choixColonnes.addEventListener('change', changerDeTaille)
    choixLignes.addEventListener('change', changerDeTaille)
    taille.append(document.createTextNode('taille '), choixColonnes, document.createTextNode(' × '), choixLignes,
      document.createTextNode(W > LARGEUR_PX || H > HAUTEUR_PX ? ' cases — plus grande que l’écran : la caméra suit le joueur' : ' cases — un écran'))

    titre.append(moinsZoom, etiquetteZoom, plusZoom, boutonPleinEcran, importerImage, effacerTout, champImage, taille)
    zoneGrille.append(titre)

    /*
     * Les outils, pour dessiner plus vite qu'au pixel.
     *
     * Le crayon pose une case à la fois, au fil du geste. Les trois autres
     * attendent le relâché : on voit la forme se dessiner en suivant la
     * souris, et elle ne s'écrit qu'une fois sûre.
     */
    {
      const gestes = document.createElement('div')
      gestes.className = 'carte-gestes'
      for (const [id, etiquette, detail] of [
        ['dessiner', '✏ Dessiner les pixels', 'les numéros 0 à 3 de chaque pixel'],
        ...(enCouleur ? [['colorier', '🎨 Colorier les cases', 'la palette de chaque carré de 8 × 8']] : []),
        ['murs', '🧱 Les murs', 'les cases où l’on ne passe pas'],
        ['joueur', '🧍 Le joueur', 'où il part, et avec quel dessin'],
        ['evenements', '⚡ Les événements', 'QUAND le joueur … ALORS …'],
        ['acteurs', '👾 Les acteurs', 'PNJ, ennemis, objets qui bougent'],
        ['jeu', '🏁 Le jeu', 'titre, vies, départ, musique'],
      ]) {
        const bouton = document.createElement('button')
        bouton.type = 'button'
        bouton.className = geste === id ? 'principal' : ''
        bouton.id = `geste-${id}`   // le didacticiel les montre par leur nom
        bouton.innerHTML = `${etiquette}<small>${detail}</small>`
        bouton.addEventListener('click', () => { geste = id; rafraichirGrille() })
        gestes.append(bouton)
      }
      zoneGrille.append(gestes)

      /* L'aimant : pour poser le joueur et les acteurs pile sur les cases de 8 × 8. */
      if (geste === 'joueur' || geste === 'acteurs') {
        const aimant = document.createElement('label')
        aimant.className = 'aide reglage carte-aimant'
        const caseAimant = document.createElement('input')
        caseAimant.type = 'checkbox'
        caseAimant.checked = aligner
        caseAimant.id = 'carte-aimant'
        caseAimant.addEventListener('change', () => { aligner = caseAimant.checked })
        aimant.title = 'coché : le dessin se cale sur la grille des cases, comme les murs ; décoché : au pixel près'
        aimant.append(caseAimant, document.createTextNode(' 🧲 aligner sur la grille (cases de 8 × 8) — l’aperçu sous la souris montre exactement où il sera posé'))
        zoneGrille.append(aimant)
      }
    }

    const barreOutils = document.createElement('div')
    barreOutils.id = 'carte-outils'
    barreOutils.className = 'rangee'
    if (geste !== 'dessiner') barreOutils.style.display = 'none' // « hidden » perd contre le « display: flex » de .rangee

    for (const [id, etiquette, titreOutil] of [
      ['crayon', '✏ Crayon', 'pose une case à la fois, au fil du geste'],
      ['gomme', '🧽 Gomme', 'efface : le pixel redevient le fond (le n° 0), sans changer la palette du carré'],
      ['auto', '🧩 Auto-tuiles', 'peint des carrés de 8 × 8 qui se raccordent : leurs bords se dessinent tout seuls, selon les carrés voisins — un chemin, un mur, une rivière'],
      ['ligne', '／ Ligne', 'glisse d’un point à l’autre pour une ligne droite'],
      ['rectangle', '▭ Rectangle', 'glisse pour un rectangle, d’un coin à l’autre'],
      ['cercle', '◯ Cercle', 'glisse pour un cercle, inscrit dans son rectangle'],
      ['pot', '🪣 Remplir', 'remplit toute la zone de la même couleur autour du pixel cliqué'],
      ['pipette', '💧 Pipette', 'prend la couleur d’un pixel de la carte (Alt + clic avec le crayon fait pareil)'],
      ['selection', '⬚ Sélection', 'trace un rectangle, puis copie (Ctrl+C), coupe (Ctrl+X) et colle (Ctrl+V)'],
    ]) {
      const bouton = document.createElement('button')
      bouton.type = 'button'
      bouton.className = 'outil' + (outil === id ? ' choisi' : '')
      bouton.textContent = etiquette
      bouton.title = titreOutil
      bouton.addEventListener('click', () => {
        if (id === 'pipette' && outil !== 'pipette') outilAvant = outil
        if (id !== 'selection' && id !== 'coller') selection = null
        outil = id
        rafraichirGrille()
      })
      barreOutils.append(bouton)
    }

    /* La sélection : ce qu'on peut en faire. */
    const boutonsSelection = []
    if (outil === 'selection' || outil === 'coller') {
      const action = (texte, titre, faire, actif = true) => {
        const b = document.createElement('button')
        b.type = 'button'
        b.className = 'petit'
        b.textContent = texte
        b.title = titre
        b.disabled = !actif
        b.addEventListener('click', faire)
        boutonsSelection.push(b)
        barreOutils.append(b)
      }
      /*
       * La taille de la sélection : un rectangle libre, tracé à la souris — ou
       * UN carré de 8 × 8, ou un bloc de 16 × 16, calé sur la grille : un clic
       * suffit, et le collage retombe pile sur les cases.
       */
      for (const [valeur, texte, titre] of [
        ['libre', '▭ libre', 'glisse pour tracer un rectangle de la taille voulue'],
        [8, '▦ 8 × 8', 'un clic choisit UN carré de 8 × 8, calé sur la grille'],
        [16, '▦ 16 × 16', 'un clic choisit un bloc de 16 × 16 (quatre carrés), calé sur la grille'],
      ]) {
        const b = document.createElement('button')
        b.type = 'button'
        b.className = 'petit' + (tailleSelection === valeur ? ' principal' : '')
        b.textContent = texte
        b.title = titre
        b.addEventListener('click', () => { tailleSelection = valeur; selection = null; outil = 'selection'; rafraichirGrille() })
        barreOutils.append(b)
      }
      action('📋 Copier', 'copier la sélection — Ctrl+C', () => actionsClavier.c?.(), Boolean(selection))
      action('✂ Couper', 'copier la sélection, puis la vider — Ctrl+X', () => actionsClavier.x?.(), Boolean(selection))
      action('📌 Coller', 'coller : l’aperçu suit la souris, un clic le pose — Ctrl+V', () => actionsClavier.v?.(), Boolean(pressePapiers))
      action('⇆ Miroir', 'retourne la sélection gauche-droite', () => transformerLaSelection('h'), Boolean(selection))
      action('⇅ Miroir', 'retourne la sélection haut-bas', () => transformerLaSelection('v'), Boolean(selection))
      action('↻ Tourner', 'un quart de tour, dans le sens des aiguilles d’une montre', () => transformerLaSelection('r'), Boolean(selection))
      const dit = document.createElement('span')
      dit.className = 'aide'
      dit.textContent = outil === 'coller'
        ? `clique pour poser les ${pressePapiers.w} × ${pressePapiers.h} pixels copiés — Échap pour annuler`
        : selection ? `sélection : ${selection.w} × ${selection.h} pixels` : tailleSelection === 'libre' ? 'glisse sur la carte pour choisir un rectangle' : `clique sur la carte pour choisir un carré de ${tailleSelection} × ${tailleSelection}`
      barreOutils.append(dit)
    }

    if (outil === 'rectangle' || outil === 'cercle') {
      const remplissage = document.createElement('label')
      remplissage.className = 'aide reglage'
      const caseRemplissage = document.createElement('input')
      caseRemplissage.type = 'checkbox'
      caseRemplissage.checked = rempli
      caseRemplissage.addEventListener('change', () => { rempli = caseRemplissage.checked })
      remplissage.append(caseRemplissage, document.createTextNode(' rempli'))
      barreOutils.append(remplissage)
    }

    zoneGrille.append(barreOutils)

    /* Le tapis qui défile, en boucle sur toute la largeur matérielle. */
    const ligneDefile = document.createElement('label')
    ligneDefile.id = 'carte-defile-ligne'
    ligneDefile.className = 'aide reglage'
    const caseDefile = document.createElement('input')
    caseDefile.type = 'checkbox'
    caseDefile.checked = defileActif
    caseDefile.addEventListener('change', () => {
      defileActif = caseDefile.checked
      ecrireSource(ecrireCarte(lireSource(), carteChoisie, grille, defileActif))
      surChangement()
      rafraichirGrille()
    })
    ligneDefile.append(
      caseDefile,
      document.createTextNode(` faire défiler ${carteChoisie}, à l’horizontale — ${carteChoisie}_avancer() à appeler soi-même`),
    )
    zoneGrille.append(ligneDefile)

    const aide = document.createElement('p')
    aide.className = 'aide'
    aide.textContent = geste === 'jeu'
      ? 'Les réglages du jeu entier : l’écran titre, le nombre de vies, la scène où la partie commence — et la musique de CETTE scène. « perdre une vie », « gagner la partie » se choisissent ensuite dans les événements et les acteurs.'
      : geste === 'acteurs'
      ? `Clique sur la carte pour poser un acteur — un PNJ qui parle, un ennemi qui patrouille, un objet à ramasser. Glisse-le pour le déplacer. Règle-le ci-dessous : son dessin, sa façon de bouger, et QUAND le joueur le touche → ALORS… L’atelier écrit ${carteChoisie}_acteurs().`
      : geste === 'evenements'
      ? `Clique une case pour y poser un événement — ou pour régler celui qui y est. Il se règle ci-dessous, sans écrire de code : QUAND le joueur arrive sur la case (ou y appuie sur A), ALORS afficher un message, ajouter des points, jouer un son… L’atelier écrit ${carteChoisie}_evenements() dans ton programme.`
      : geste === 'murs'
      ? `Peins les cases où le joueur ne doit pas passer : elles se voient en rouge. L’atelier écrit les tables ${carteChoisie}_MURS_HAUT et ${carteChoisie}_MURS_BAS, et la fonction ${carteChoisie}_mur(colonne, ligne) qui les lit.`
      : geste === 'joueur'
      ? `Clique où le joueur doit partir, et choisis son dessin ci-dessous. Les flèches le déplaceront ; les murs l’arrêteront — c’est ${carteChoisie}_joueur(), dans ton programme.`
      : geste === 'colorier'
      ? `Choisis une palette ci-dessous, puis peins les cases : chaque carré de 8 × 8 prend les quatre couleurs de sa palette. L’atelier écrit les « teindre(colonne, ligne, palette); » dans ${carteChoisie}(). Les couleurs se règlent dans l’onglet 🎨 Les couleurs.`
      : `Dessine au pixel, comme sur une tuile — mais sur l’écran entier. Rien ne l’affiche tout seul : appelle « ${carteChoisie}(); » dans ton programme.`
    zoneGrille.append(aide)

    const cadreDeLaToile = document.createElement('div')
    cadreDeLaToile.id = 'carte-toile-cadre'
    cadreDeLaToile.className = 'cadre-toile-carte'

    const canevas = document.createElement('canvas')
    canevas.width = W
    canevas.height = H
    canevas.className = 'toile-carte'
    canevas.style.width = W * pas + 'px'
    canevas.style.height = H * pas + 'px'
    /* Ctrl + molette : zoomer et dézoomer, comme dans Paint. */
    canevas.addEventListener('wheel', (e) => {
      if (!e.ctrlKey) return
      e.preventDefault()
      zoomer(e.deltaY < 0 ? 1 : -1)
    }, { passive: false })
    dessinerFond(canevas, grille, couleurDe)

    /*
     * Un curseur qui montre la nuance qu'on va poser, pas une flèche noire.
     *
     * À trois pixels d'écran par pixel de la console, le curseur du système
     * ne dit pas où l'on va peindre ni avec quoi — un carré de la couleur
     * choisie, posé sur la case visée, répond aux deux questions d'un coup.
     */
    const curseur = document.createElement('div')
    curseur.className = 'curseur-carte'
    curseur.style.width = pas + 'px'
    curseur.style.height = pas + 'px'
    curseur.hidden = true

    cadreDeLaToile.append(canevas, curseur)

    /* Les murs et le joueur, PAR-DESSUS le dessin, sans y toucher. */
    const calque = document.createElement('canvas')
    calque.width = W
    calque.height = H
    calque.className = 'calque-scene'
    calque.style.width = W * pas + 'px'
    calque.style.height = H * pas + 'px'
    const dessinerCalque = () => {
      const ctx = calque.getContext('2d')
      ctx.clearRect(0, 0, W, H)
      if (geste !== 'murs' && geste !== 'joueur' && geste !== 'evenements' && geste !== 'acteurs') return
      ctx.fillStyle = 'rgba(229, 60, 60, .45)'
      scene.murs.forEach((rangee, l) => rangee.forEach((mur, c) => { if (mur) ctx.fillRect(c * 8, l * 8, 8, 8) }))
      const dessin = dessinDuJoueur()
      const cote = coteDuJoueur()
      if (dessin) {
        dessin.rangees.forEach((rangee, dy) => [...rangee].forEach((signe, dx) => {
          const n = NUANCES_ECRITES[signe] ?? 0
          if (!n) return // le numéro 0 d'un lutin est transparent
          ctx.fillStyle = NUANCES[n]
          ctx.fillRect(scene.x + dx, scene.y + dy, 1, 1)
        }))
      }
      ctx.strokeStyle = '#f5c542'
      ctx.lineWidth = 1
      ctx.strokeRect(scene.x + 0.5, scene.y + 0.5, cote - 1, cote - 1)

      /* Les acteurs : leur dessin, et un cadre cyan (plus vif pour celui qu'on règle). */
      scene.acteurs.forEach((a, i) => {
        const leDessin = dessins.find((d) => d.nom === a.dessin)
        const cote = leDessin?.cote ?? 16
        if (leDessin) {
          leDessin.rangees.forEach((rangee, dy) => [...rangee].forEach((signe, dx) => {
            const n = NUANCES_ECRITES[signe] ?? 0
            if (!n) return
            ctx.fillStyle = NUANCES[n]
            ctx.fillRect(a.x + dx, a.y + dy, 1, 1)
          }))
        }
        ctx.strokeStyle = i === acteurChoisi ? '#3ff0ff' : 'rgba(63, 240, 255, .6)'
        ctx.strokeRect(a.x + 0.5, a.y + 0.5, cote - 1, cote - 1)
      })

      /* Les événements : une case bleue, plus vive pour celui qu'on règle. */
      scene.evenements.forEach((e, i) => {
        ctx.fillStyle = i === evenementChoisi ? 'rgba(80, 170, 255, .75)' : 'rgba(80, 170, 255, .45)'
        ctx.fillRect(e.c * 8, e.l * 8, 8, 8)
        ctx.strokeStyle = '#ffffff'
        ctx.strokeRect(e.c * 8 + 0.5, e.l * 8 + 0.5, 7, 7)
      })
    }
    dessinerCalque()
    cadreDeLaToile.append(calque)

    /* En coloriant, la grille des cases se voit : c'est elle qu'on peint. */
    if (geste === 'colorier' || geste === 'murs') {
      const quadrillage = document.createElement('div')
      quadrillage.className = 'quadrillage-cases'
      quadrillage.style.backgroundSize = `${pas * 8}px ${pas * 8}px`
      cadreDeLaToile.append(quadrillage)
    }

    /*
     * Le pixel sous la souris — mesuré sur la SURFACE du dessin, bordure
     * exclue. La bordure d'un pixel, comptée avec le dessin, décalait tout
     * d'un cheveu : on peignait à côté du carré qu'on voyait.
     */
    function coordonnees(evenement) {
      const cadre = canevas.getBoundingClientRect()
      const x = Math.floor(((evenement.clientX - cadre.left - canevas.clientLeft) / canevas.clientWidth) * W)
      const y = Math.floor(((evenement.clientY - cadre.top - canevas.clientTop) / canevas.clientHeight) * H)
      return { x, y }
    }

    /*
     * Poser le carré du curseur sur des pixels de la feuille : mesuré sur le
     * dessin TEL QU'IL EST AFFICHÉ, pas sur le zoom demandé — à n'importe quel
     * zoom, en plein écran ou non, le carré couvre exactement les pixels
     * qu'on va peindre.
     */
    function placerLeCurseur(x, y, largeur, hauteur = largeur) {
      const tx = canevas.clientWidth / W
      const ty = canevas.clientHeight / H
      curseur.style.left = canevas.offsetLeft + canevas.clientLeft + x * tx + 'px'
      curseur.style.top = canevas.offsetTop + canevas.clientTop + y * ty + 'px'
      curseur.style.width = largeur * tx + 'px'
      curseur.style.height = hauteur * ty + 'px'
    }

    /* Les pastilles suivent la case survolée — voir plus bas. */
    let suivreLaCase = () => {}

    /*
     * OÙ va un élément (acteur, joueur) de ce côté, la souris étant en (x, y) :
     * centré sous elle, calé sur les cases de 8 × 8 si l'aimant est mis, et
     * jamais hors de la carte. UNE règle pour l'aperçu, la pose et le
     * déplacement : ce qu'on voit sous la souris est exactement ce qui sera posé.
     */
    function ancrer(x, y, cote, dx = cote >> 1, dy = cote >> 1) {
      let ax = x - dx
      let ay = y - dy
      if (aligner) {
        ax = Math.round(ax / 8) * 8
        ay = Math.round(ay / 8) * 8
      }
      return { x: Math.max(0, Math.min(W - cote, ax)), y: Math.max(0, Math.min(H - cote, ay)) }
    }

    /* Le fantôme d'un dessin : ses vraies couleurs, le transparent laissé transparent. */
    const fantomes = new Map()
    function fantomeDe(nom) {
      if (fantomes.has(nom)) return fantomes.get(nom)
      const texte = lireSource()
      const dessin = lireDessins(texte).find((d) => d.nom === nom)
      if (!dessin) return null
      const toile = document.createElement('canvas')
      toile.width = toile.height = dessin.cote
      const ctx = toile.getContext('2d')
      const lutin = dessin.cote === 16
      const pal = enCouleur ? lireCouleurs(texte, lutin) : null
      const defaut = nom === scene.dessin ? 1 : 2 // le héros : la palette 1 ; les autres : la 2 — comme la scène
      const quarts = enCouleur && lutin ? (lirePalettesDuPerso(texte, nom) ?? [defaut, defaut, defaut, defaut]) : null
      for (let y = 0; y < dessin.cote; y++) {
        for (let x = 0; x < dessin.cote; x++) {
          const n = nuanceDe(dessin.rangees[y][x])
          if (lutin && n === 0) continue
          ctx.fillStyle = enCouleur ? versDiese(pal[quarts ? quarts[(y >> 3) * 2 + (x >> 3)] : 0][n]) : NUANCES[n]
          ctx.fillRect(x, y, 1, 1)
        }
      }
      const url = toile.toDataURL()
      fantomes.set(nom, url)
      return url
    }

    /* Le curseur devient l'aperçu du dessin, là où il sera posé. */
    function montrerLeFantome(nom, p, cote, couleurCadre) {
      placerLeCurseur(p.x, p.y, cote)
      const url = nom ? fantomeDe(nom) : null
      curseur.classList.add('fantome')
      curseur.style.background = url ? `url(${url}) 0 0 / 100% 100% no-repeat` : 'rgba(63, 240, 255, .25)'
      curseur.style.setProperty('--cadre', couleurCadre)
    }

    function deplacerLeCurseur(x, y) {
      curseur.classList.remove('fantome')
      if (x < 0 || x >= W || y < 0 || y >= H) { curseur.hidden = true; return }
      curseur.hidden = false
      if (geste === 'dessiner') suivreLaCase(teintes[y >> 3][x >> 3])
      if (geste === 'dessiner' && enCouleur) montrerLeCarre(x, y)
      if (geste === 'joueur') {
        /* Le héros lui-même, à sa place d'arrivée. */
        const cote = coteDuJoueur()
        montrerLeFantome(scene.dessin, ancrer(x, y, cote), cote, '#f5c542')
        return
      }
      if (geste === 'acteurs') {
        /* Sur un acteur : le cadre de CET acteur (clic = le choisir, glisser = le déplacer). */
        const i = glisse ? glisse.i : acteurSous(x, y)
        if (i >= 0 && scene.acteurs[i]) {
          const a = scene.acteurs[i]
          const cote = dessins.find((d) => d.nom === a.dessin)?.cote ?? 16
          if (glisse) montrerLeFantome(a.dessin, { x: a.x, y: a.y }, cote, '#3ff0ff')
          else {
            placerLeCurseur(a.x, a.y, cote)
            curseur.style.background = 'rgba(63, 240, 255, .18)'
          }
          return
        }
        /* Ailleurs : le dessin du PROCHAIN acteur, exactement là où un clic le posera. */
        const nom = dessinAPoser ?? dessins.find((d) => d.nom !== scene.dessin && d.cote === 16)?.nom
        const cote = dessins.find((d) => d.nom === nom)?.cote ?? 16
        montrerLeFantome(nom, ancrer(x, y, cote), cote, '#3ff0ff')
        return
      }
      if (geste === 'evenements') {
        placerLeCurseur((x & ~7), (y & ~7), 8)
        curseur.style.background = 'rgba(80, 170, 255, .45)'
        return
      }
      if (geste === 'murs') {
        placerLeCurseur((x & ~7), (y & ~7), 8)
        curseur.style.background = poseDeMur ? 'rgba(229, 60, 60, .6)' : 'rgba(255, 255, 255, .35)'
        return
      }
      if (geste === 'colorier') {
        /* Le curseur couvre la CASE entière : c'est elle qui changera. */
        placerLeCurseur((x & ~7), (y & ~7), 8)
        curseur.style.background = versDiese(palettes[paletteChoisie][2]) + '88'
        return
      }
      if (geste === 'dessiner' && outil === 'selection') {
        const dedans = selection && x >= selection.x && x < selection.x + selection.w && y >= selection.y && y < selection.y + selection.h
        canevas.style.cursor = dedans || deplaceSel ? 'move' : ''
        if (dedans || deplaceSel) { curseur.hidden = true; return }
      }
      if (geste === 'dessiner' && outil === 'selection' && tailleSelection !== 'libre') {
        const t = tailleSelection
        placerLeCurseur(Math.min(W - t, Math.floor(x / t) * t), Math.min(H - t, Math.floor(y / t) * t), t)
        curseur.style.background = 'rgba(255, 255, 255, .25)'
        return
      }
      placerLeCurseur(x, y, 1)
      curseur.style.background = couleurPosee(x, y, nuance)
    }

    function peindreMur(x, y) {
      if (x < 0 || x >= W || y < 0 || y >= H) return
      const rangee = scene.murs[y >> 3]
      if (rangee[x >> 3] === poseDeMur) return
      rangee[x >> 3] = poseDeMur
      dessinerCalque()
    }

    function choisirOuCreerEvenement(x, y) {
      if (x < 0 || x >= W || y < 0 || y >= H) return
      const c = x >> 3
      const l = y >> 3
      let i = scene.evenements.findIndex((e) => e.c === c && e.l === l)
      if (i < 0) {
        scene.evenements.push({ c, l, quand: 'arrive', unique: false, actions: [{ type: 'message', texte: 'BONJOUR' }] })
        i = scene.evenements.length - 1
        ecrireSource(ecrireLaScene(lireSource()))
        surChangement()
      }
      evenementChoisi = i
      rafraichirGrille()
    }

    function placerJoueur(x, y) {
      const p = ancrer(x, y, coteDuJoueur())
      scene.x = p.x
      scene.y = p.y
      dessinerCalque()
    }

    /*
     * Les réglages en phrases : QUAND … SI … ALORS …
     *
     * Événements et acteurs partagent les mêmes morceaux — la ligne « SI » et
     * la liste des actions. Chaque liste et chaque champ réécrit la scène, donc
     * le C++, dès qu'on le change. On ne tape jamais de code ; on peut toujours
     * aller le voir.
     */
    const el = (balise, classe, texte) => {
      const e = document.createElement(balise)
      if (classe) e.className = classe
      if (texte !== undefined) e.textContent = texte
      return e
    }
    const ecrireEtRedessiner = () => {
      ecrireSource(ecrireLaScene(lireSource()))
      surChangement()
    }
    const choix = (valeurs, actuelle, surChangement) => {
      const s = el('select')
      for (const [v, t] of Object.entries(valeurs)) {
        const o = el('option', '', t)
        o.value = v
        s.append(o)
      }
      s.value = actuelle
      s.addEventListener('change', () => surChangement(s.value))
      return s
    }
    const nombre = (valeur, min, max, surChangement) => {
      const champ = el('input')
      champ.type = 'number'
      champ.min = min
      champ.max = max
      champ.value = valeur ?? min
      champ.style.width = '4.5em'
      champ.addEventListener('change', () => { surChangement(Math.max(min, Math.min(max, Number(champ.value) || 0))); ecrireEtRedessiner() })
      return champ
    }
    const texteLisible = (valeur, longueur, surChangement, largeur = longueur) => {
      const champ = el('input', 'champ-texte')
      champ.maxLength = longueur
      champ.value = valeur ?? ''
      champ.style.width = `${largeur + 3}ch`
      champ.title = 'A à Z, 0 à 9, ! ? . - : # | et l’espace'
      champ.addEventListener('input', () => {
        const propre = messageLisible(champ.value, longueur)
        if (propre !== champ.value) champ.value = propre
      })
      champ.addEventListener('change', () => { surChangement(messageLisible(champ.value, longueur)); ecrireEtRedessiner() })
      return champ
    }
    const nomVariable = (valeur, surChangement) => {
      const champ = el('input', 'champ-texte')
      champ.value = valeur ?? ''
      champ.placeholder = 'CLE'
      champ.style.width = '10ch'
      champ.title = 'le nom d’une variable du jeu : CLE, VIES, PORTE… (lettres, chiffres, _)'
      champ.addEventListener('change', () => { champ.value = nomDeVariable(champ.value); surChangement(champ.value); ecrireEtRedessiner() })
      return champ
    }

    /* SI : seulement quand une variable le permet. */
    function ligneSi(chose) {
      const ligne = el('div', 'evenements-phrase')
      ligne.append(el('b', 'evenements-mot', 'SI'))
      const coche = el('label', 'aide')
      const caseSi = el('input')
      caseSi.type = 'checkbox'
      caseSi.checked = Boolean(chose.si?.nom)
      caseSi.addEventListener('change', () => {
        chose.si = caseSi.checked ? { nom: 'CLE', comp: '==', valeur: 1 } : null
        ecrireEtRedessiner()
        rafraichirGrille()
      })
      coche.append(caseSi, document.createTextNode(' seulement si…'))
      ligne.append(coche)
      if (chose.si?.nom) {
        ligne.append(
          nomVariable(chose.si.nom, (v) => { chose.si.nom = v }),
          choix({ '==': 'vaut', '!=': 'ne vaut pas', '>=': 'vaut au moins', '<': 'vaut moins de' }, chose.si.comp ?? '==',
            (v) => { chose.si.comp = v; ecrireEtRedessiner() }),
          nombre(chose.si.valeur, 0, 255, (v) => { chose.si.valeur = v }),
        )
      }
      return ligne
    }

    /* ALORS : une ligne par action, avec ses réglages. */
    function lignesDActions(chose, catalogue) {
      const alors = el('div', 'evenements-actions')
      alors.append(el('b', 'evenements-mot', 'ALORS'))
      chose.actions ??= []
      chose.actions.forEach((action, k) => {
        const ligne = el('div', 'evenements-phrase')
        ligne.append(el('span', 'aide', `${k + 1}.`))
        ligne.append(choix(catalogue, action.type, (v) => {
          chose.actions[k] = { type: v, texte: 'BONJOUR', valeur: 1, c: 0, l: 0, nom: v === 'choix' ? 'REPONSE' : v === 'menu' ? 'CHOIX' : 'CLE', op: '=',
            lignes: v === 'choix' ? ['VEUX-TU ENTRER ?', ''] : v === 'menu' ? ['OU VAS-TU ?'] : ['BONJOUR !', '', ''], carte: '',
            ...(v === 'menu' ? { options: ['AU NORD', 'AU SUD', '', ''] } : {}) }
          ecrireEtRedessiner()
          rafraichirGrille()
        }))

        if (action.type === 'message') ligne.append(el('span', '', '«'), texteLisible(action.texte, 13, (v) => { action.texte = v }), el('span', '', '»'))
        if (action.type === 'dialogue') {
          const bloc = el('div', 'evenements-dialogue')
          action.lignes ??= ['', '', '']
          const large = action.portrait ? 15 : 18
          for (let i = 0; i < 3; i++) bloc.append(texteLisible(action.lignes[i], large, (v) => { action.lignes[i] = v }))
          /* Qui parle — son nom en haut du dialogue — et son portrait (un dessin de 16 × 16). */
          const qui = el('div', 'evenements-phrase')
          const portraits = { '': '— pas de portrait —', ...Object.fromEntries(lireDessins(lireSource()).filter((d) => d.cote === 16).map((d) => [d.nom, d.nom])) }
          qui.append(el('span', 'aide', 'qui parle'), texteLisible(action.qui ?? '', 12, (v) => { action.qui = v }),
            el('span', 'aide', 'portrait'), choix(portraits, action.portrait ?? '', (v) => { action.portrait = v; ecrireEtRedessiner(); rafraichirGrille() }))
          bloc.append(qui)
          ligne.append(bloc)
        }
        if (action.type === 'menu') {
          const bloc = el('div', 'evenements-dialogue')
          action.lignes ??= ['OU VAS-TU ?']
          action.options ??= ['OUI', 'NON', '', '']
          bloc.append(texteLisible(action.lignes[0], 18, (v) => { action.lignes[0] = v }))
          for (let i = 0; i < 4; i++) {
            const r = el('div', 'evenements-phrase')
            r.append(el('span', 'aide', `réponse ${i + 1}`), texteLisible(action.options[i] ?? '', 16, (v) => { action.options[i] = v }))
            bloc.append(r)
          }
          bloc.append(el('span', 'aide', 'HAUT et BAS déplacent le curseur « > », A choisit'))
          ligne.append(bloc, el('span', 'aide', 'réponse dans'), nomVariable(action.nom || 'CHOIX', (v) => { action.nom = v }),
            el('span', 'aide', '(1 à 4 : « SI … == 2 »)'))
        }
        if (action.type === 'choix') {
          const bloc = el('div', 'evenements-dialogue')
          action.lignes ??= ['', '']
          for (let i = 0; i < 2; i++) bloc.append(texteLisible(action.lignes[i], 18, (v) => { action.lignes[i] = v }))
          bloc.append(el('span', 'aide', 'A OUI  ·  B NON'))
          ligne.append(bloc, el('span', 'aide', 'réponse dans'), nomVariable(action.nom || 'REPONSE', (v) => { action.nom = v }),
            el('span', 'aide', '(1 = oui, 0 = non : « SI … == 1 »)'))
        }
        if (action.type === 'objetPrendre' || action.type === 'objetPerdre') {
          ligne.append(el('span', 'aide', 'l’objet'), nomVariable(action.nom || 'CLE', (v) => { action.nom = v }),
            el('span', 'aide', `START montre l’inventaire · « SI OBJ_${nomDeVariable(action.nom || 'CLE')} == 1 »`))
        }
        if (action.type === 'bruitage') {
          ligne.append(choix(Object.fromEntries(Object.entries(BRUITAGES).map(([k, [nomDuSon]]) => [k, nomDuSon])), action.son ?? 'piece',
            (v) => { action.son = v; ecrireEtRedessiner() }))
        }
        if (action.type === 'score') ligne.append(el('span', '', '+'), nombre(action.valeur, 1, 255, (v) => { action.valeur = v }), el('span', 'aide', 'points'))
        if (action.type === 'variable') {
          ligne.append(nomVariable(action.nom, (v) => { action.nom = v }),
            choix({ '=': 'prend la valeur', '+': 'augmente de', '-': 'diminue de' }, action.op ?? '=', (v) => { action.op = v; ecrireEtRedessiner() }),
            nombre(action.valeur, 0, 255, (v) => { action.valeur = v }))
        }
        if (action.type === 'afficherVariable') ligne.append(nomVariable(action.nom, (v) => { action.nom = v }))
        if (action.type === 'aller' || action.type === 'scene') {
          if (action.type === 'scene') {
            const cartes = Object.fromEntries(listerLesCartes(lireSource()).map((n) => [n, n]))
            if (!action.carte) action.carte = Object.keys(cartes).find((n) => n !== carteChoisie) ?? carteChoisie
            ligne.append(choix(cartes, action.carte, (v) => { action.carte = v; ecrireEtRedessiner() }))
          }
          ligne.append(el('span', 'aide', 'colonne'), nombre(action.c, 0, 19, (v) => { action.c = v }),
            el('span', 'aide', 'ligne'), nombre(action.l, 0, 17, (v) => { action.l = v }))
        }

        const enlever = el('button', 'petit', '✕')
        enlever.type = 'button'
        enlever.title = 'retirer cette action'
        enlever.addEventListener('click', () => { chose.actions.splice(k, 1); ecrireEtRedessiner(); rafraichirGrille() })
        ligne.append(enlever)
        alors.append(ligne)
      })
      return alors
    }

    /* Les boutons du bas : ajouter une action, supprimer, voir le C++. */
    function rangeeDuBas(chose, surSupprimer, motifDuCode) {
      const bas = el('div', 'rangee')
      const ajouter = el('button', '', '+ ajouter une action')
      ajouter.type = 'button'
      ajouter.addEventListener('click', () => { chose.actions.push({ type: 'son' }); ecrireEtRedessiner(); rafraichirGrille() })
      const supprimer = el('button', '', '🗑 supprimer')
      supprimer.type = 'button'
      supprimer.addEventListener('click', () => { surSupprimer(); ecrireEtRedessiner(); rafraichirGrille() })
      bas.append(ajouter, supprimer)
      if (montrerLeCode) {
        const voir = el('button', '', '👁 Voir le C++')
        voir.type = 'button'
        voir.title = 'le code que l’atelier vient d’écrire'
        voir.addEventListener('click', () => montrerLeCode(motifDuCode))
        bas.append(voir)
      }
      return bas
    }

    function panneauDesEvenements() {
      const boite = el('div', 'evenements')
      const liste = el('div', 'rangee evenements-liste')
      if (!scene.evenements.length) liste.append(el('span', 'aide', 'Aucun événement : clique une case de la carte pour en poser un.'))
      scene.evenements.forEach((e, i) => {
        const b = el('button', 'petit' + (i === evenementChoisi ? ' principal' : ''), `⚡ ${i + 1} · case (${e.c}, ${e.l})`)
        b.type = 'button'
        b.addEventListener('click', () => { evenementChoisi = i; rafraichirGrille() })
        liste.append(b)
      })
      boite.append(liste)

      const e = scene.evenements[evenementChoisi]
      if (!e) return boite

      const quand = el('div', 'evenements-phrase')
      quand.append(el('b', 'evenements-mot', 'QUAND'), el('span', '', 'le joueur'),
        choix({ arrive: 'arrive sur la case', bouton: 'est sur la case et appuie sur A' }, e.quand, (v) => { e.quand = v; ecrireEtRedessiner() }),
        el('span', '', `(${e.c}, ${e.l})`))
      const unique = el('label', 'aide')
      const caseUnique = el('input')
      caseUnique.type = 'checkbox'
      caseUnique.checked = Boolean(e.unique)
      caseUnique.addEventListener('change', () => { e.unique = caseUnique.checked; ecrireEtRedessiner() })
      unique.append(caseUnique, document.createTextNode(' une seule fois'))
      quand.append(unique)

      boite.append(quand, ligneSi(e), lignesDActions(e, ACTIONS),
        rangeeDuBas(e, () => { scene.evenements.splice(evenementChoisi, 1); evenementChoisi = null }, `/* ${evenementChoisi + 1}. QUAND le joueur`))
      return boite
    }

    /*
     * Une vignette : le dessin tel qu'il sera à l'écran — ses vraies couleurs
     * en Game Boy Color (chaque quart d'un personnage dans sa palette, le
     * transparent en damier), les quatre nuances sinon.
     */
    function vignette(dessin, texte) {
      const toile = document.createElement('canvas')
      toile.width = toile.height = dessin.cote
      let couleurDe = null
      if (enCouleur && dessin.cote === 16) {
        const pal = lireCouleurs(texte, true)
        const quarts = lirePalettesDuPerso(texte, dessin.nom) ?? [2, 2, 2, 2]
        couleurDe = (x, y, n) => n === 0 ? ((x + y) & 1 ? '#c8c8c8' : '#ececec') : versDiese(pal[quarts[(y >> 3) * 2 + (x >> 3)]][n])
      } else if (enCouleur) {
        const pal = lireCouleurs(texte, false)[paletteDUneTuile(texte, dessin.nom) ?? 0]
        couleurDe = (x, y, n) => versDiese(pal[n])
      }
      peindre(toile, dessin.rangees, dessin.cote, couleurDe)
      return toile
    }

    /*
     * La galerie des dessins : on CHOISIT celui de l'acteur, en le voyant.
     *
     * Sans acteur sélectionné, elle dit avec quoi le prochain acteur sera posé ;
     * avec un acteur sélectionné, elle change SON dessin. Celui qui est pris est
     * entouré — on sait toujours lequel c'est.
     */
    function galerieDesDessins(a) {
      const texte = lireSource()
      const dessins = lireDessins(texte).filter((d) => d.nom !== scene.dessin || a?.dessin === d.nom)
      const zone = el('div', 'evenements-phrase galerie-acteurs')
      zone.append(el('b', 'evenements-mot', 'DESSIN'),
        el('span', 'aide', a ? `celui de l’acteur ${acteurChoisi + 1} — clique pour le changer` : 'celui du prochain acteur — choisis-le, puis clique sur la carte'))
      if (!dessinAPoser || !dessins.some((d) => d.nom === dessinAPoser)) {
        dessinAPoser = (dessins.find((d) => d.cote === 16) ?? dessins[0])?.nom ?? null
      }
      const choisi = a ? a.dessin : dessinAPoser
      const rangee = el('div', 'galerie-rangee')
      for (const d of dessins) {
        const b = el('button', 'galerie-dessin' + (d.nom === choisi ? ' choisi' : ''))
        b.type = 'button'
        b.title = `${d.nom} — ${d.cote} × ${d.cote}${d.nom === choisi ? ' (choisi)' : ''}`
        b.setAttribute('aria-pressed', String(d.nom === choisi))
        b.append(vignette(d, texte), el('span', '', d.nom))
        b.addEventListener('click', () => {
          dessinAPoser = d.nom
          if (a) {
            a.dessin = d.nom
            /* Une animation garde des dessins de la même taille : les autres s'en vont. */
            a.images = (a.images ?? []).filter((n) => lireDessins(lireSource()).find((x) => x.nom === n)?.cote === d.cote && n !== d.nom)
            ecrireEtRedessiner()
          }
          rafraichirGrille()
        })
        rangee.append(b)
      }
      if (!dessins.length) rangee.append(el('span', 'aide', 'Aucun dessin : un monstre tout prêt sera ajouté au premier acteur. Tu peux aussi en dessiner un dans ▦ Les tuiles.'))
      zone.append(rangee)
      if (a) {
        /* Revenir au choix du PROCHAIN acteur, sans toucher à celui-ci. */
        const lacher = el('button', 'petit', '✕ ne plus régler cet acteur')
        lacher.type = 'button'
        lacher.title = 'la galerie choisit alors le dessin du prochain acteur que tu poseras'
        lacher.addEventListener('click', () => { acteurChoisi = null; rafraichirGrille() })
        zone.append(lacher)
      }
      return zone
    }

    function panneauDesActeurs() {
      const boite = el('div', 'evenements')
      boite.append(galerieDesDessins(scene.acteurs[acteurChoisi]))
      const liste = el('div', 'rangee evenements-liste')
      if (!scene.acteurs.length) liste.append(el('span', 'aide', 'Aucun acteur : clique sur la carte pour en poser un — PNJ, ennemi ou objet. Glisse-le pour le déplacer.'))
      scene.acteurs.forEach((a, i) => {
        const b = el('button', 'petit' + (i === acteurChoisi ? ' principal' : ''), `👾 ${i + 1} · ${a.dessin}`)
        b.type = 'button'
        b.addEventListener('click', () => { acteurChoisi = i; rafraichirGrille() })
        liste.append(b)
      })
      boite.append(liste)

      const a = scene.acteurs[acteurChoisi]
      if (!a) return boite

      const qui = el('div', 'evenements-phrase')
      qui.append(el('b', 'evenements-mot', 'ACTEUR'),
        el('span', '', `${acteurChoisi + 1} · ${a.dessin}`),
        choix(MOUVEMENTS, a.mouvement ?? 'immobile', (v) => { a.mouvement = v; ecrireEtRedessiner() }),
        el('span', 'aide', `départ : x = ${a.x}, y = ${a.y}`))

      const quand = el('div', 'evenements-phrase')
      quand.append(el('b', 'evenements-mot', 'QUAND'), el('span', '', 'le joueur'),
        choix({ touche: 'le touche', bouton: 'le touche et appuie sur A' }, a.quand ?? 'touche', (v) => { a.quand = v; ecrireEtRedessiner() }))
      const unique = el('label', 'aide')
      const caseUnique = el('input')
      caseUnique.type = 'checkbox'
      caseUnique.checked = Boolean(a.unique)
      caseUnique.title = 'coché : une fois disparu, il ne revient pas — même en rentrant dans la scène'
      caseUnique.addEventListener('change', () => { a.unique = caseUnique.checked; ecrireEtRedessiner() })
      unique.append(caseUnique, document.createTextNode(' disparu, il ne revient pas'))
      quand.append(unique)

      /* L'animation : jusqu'à deux dessins de plus, de la même taille, qui alternent sans cesse. */
      const anime = el('div', 'evenements-phrase')
      const coteActeur = lireDessins(lireSource()).find((d) => d.nom === a.dessin)?.cote ?? 16
      const memes = { '': '—', ...Object.fromEntries(lireDessins(lireSource()).filter((d) => d.cote === coteActeur && d.nom !== a.dessin).map((d) => [d.nom, d.nom])) }
      a.images ??= []
      anime.append(el('b', 'evenements-mot', 'ANIMÉ'), el('span', 'aide', 'alterne avec'))
      for (const k of [0, 1]) {
        anime.append(choix(memes, a.images[k] ?? '', (v) => {
          const images = [a.images[0] ?? '', a.images[1] ?? '']
          images[k] = v
          a.images = images.filter(Boolean)
          ecrireEtRedessiner()
        }))
      }
      anime.append(el('span', 'aide', 'vitesse'), nombre(a.vitesse ?? 12, 2, 60, (v) => { a.vitesse = v }))

      /* QUAND le joueur l'ATTAQUE : son coup (la hitbox, devant lui) touche l'acteur. */
      a.attaque ??= { actions: [] }
      const quandAttaque = el('div', 'evenements-phrase')
      quandAttaque.append(el('b', 'evenements-mot', 'QUAND'), el('span', '', 'le joueur l’attaque'),
        el('span', 'aide', '(son coup le touche — la touche d’attaque se règle dans 🧍 Le joueur)'))
      boite.append(qui, anime, quand, ligneSi(a), lignesDActions(a, ACTIONS_ACTEUR), quandAttaque, lignesDActions(a.attaque, ACTIONS_ACTEUR),
        rangeeDuBas(a, () => { scene.acteurs.splice(acteurChoisi, 1); acteurChoisi = null }, `/* Acteur ${acteurChoisi + 1} :`))
      return boite
    }

    /* Le jeu entier : titre, vies, scène de départ — et la musique de cette scène. */
    function panneauDuJeu() {
      const reglages = lireReglagesDuJeu(lireSource())
      const boite = el('div', 'evenements')
      const changer = (quoi) => {
        let texte = lireSource()
        /* Les réglages vivent dans le bloc commun : il faut au moins une scène. */
        if (!listerLesScenes(texte).includes(carteChoisie)) texte = ecrireLaScene(texte)
        ecrireSource(ecrireReglagesDuJeu(texte, quoi))
        surChangement()
      }

      const titre = el('div', 'evenements-phrase')
      titre.append(el('b', 'evenements-mot', 'TITRE'),
        texteLisible(reglages.titre, 18, (v) => changer({ titre: v })),
        el('span', 'aide', 'vide : pas d’écran titre'))
      const sous = el('div', 'evenements-phrase')
      sous.append(el('b', 'evenements-mot', 'EN DESSOUS'), texteLisible(reglages.sousTitre, 18, (v) => changer({ sousTitre: v })))
      const vies = el('div', 'evenements-phrase')
      vies.append(el('b', 'evenements-mot', 'VIES'), nombre(reglages.vies, 0, 99, (v) => changer({ vies: v })),
        el('span', 'aide', 'au départ — 0 : pas de vies. « perdre une vie » les retire, et à zéro : « PERDU ! »'))
      const depart = el('div', 'evenements-phrase')
      const scenes = Object.fromEntries(listerLesScenes(lireSource()).map((n) => [n, n]))
      if (!Object.keys(scenes).length) scenes[carteChoisie] = carteChoisie
      depart.append(el('b', 'evenements-mot', 'DÉPART'),
        choix(scenes, reglages.depart ?? carteChoisie, (v) => changer({ depart: v })),
        el('span', 'aide', 'la scène où la partie commence'))

      /* La musique de CETTE scène : un Air du programme, en boucle. */
      const musique = el('div', 'evenements-phrase')
      const airs = [...lireSource().matchAll(/\bAir\s+([A-Za-z_]\w*)/g)].map((m) => m[1])
      const lesAirs = { '': '— aucune —', ...Object.fromEntries(airs.map((a) => [a, a])) }
      musique.append(el('b', 'evenements-mot', 'MUSIQUE'),
        choix(lesAirs, scene.musique?.air ?? '', (v) => {
          scene.musique = v ? { air: v, vitesse: scene.musique?.vitesse ?? 8 } : null
          ecrireEtRedessiner()
          rafraichirGrille()
        }))
      if (scene.musique?.air) {
        musique.append(el('span', 'aide', 'vitesse'), nombre(scene.musique.vitesse, 1, 30, (v) => { scene.musique.vitesse = v }))
      }
      musique.append(el('span', 'aide', airs.length ? `de la scène ${carteChoisie}` : 'compose un air dans l’onglet ♪ Les airs, il apparaîtra ici'))

      /* Le HUD : les vies et le score, toujours visibles en bas de l'écran. */
      const hud = el('div', 'evenements-phrase')
      const caseHud = el('input')
      caseHud.type = 'checkbox'
      caseHud.checked = reglages.hud !== false
      caseHud.addEventListener('change', () => changer({ hud: caseHud.checked }))
      const ditHud = el('label', 'aide')
      ditHud.append(caseHud, document.createTextNode(' montrer les vies et le score sur la dernière ligne de l’écran (le HUD)'))
      hud.append(el('b', 'evenements-mot', 'HUD'), ditHud)

      const caseA = (valeur, texte, surChange) => {
        const etiquette = el('label', 'aide')
        const c = el('input')
        c.type = 'checkbox'
        c.checked = valeur
        c.addEventListener('change', () => surChange(c.checked))
        etiquette.append(c, document.createTextNode(' ' + texte))
        return etiquette
      }
      hud.append(caseA(Boolean(reglages.coeurs), 'les vies en cœurs ♥', (v) => changer({ coeurs: v })))
      /* Une barre sur le HUD : de mana, d'énergie… — une variable, de 0 à son maximum. */
      const barre = el('div', 'evenements-phrase')
      barre.append(el('b', 'evenements-mot', 'BARRE'),
        caseA(Boolean(reglages.barre?.nom), 'une barre sur le HUD', (v) => changer({ barre: v ? { nom: reglages.barre?.nom || 'MANA', max: reglages.barre?.max ?? 8 } : null })))
      if (reglages.barre?.nom) {
        barre.append(el('span', 'aide', 'la variable'), nomVariable(reglages.barre.nom, (v) => changer({ barre: { ...reglages.barre, nom: v } })),
          el('span', 'aide', 'jusqu’à'), nombre(reglages.barre.max ?? 8, 1, 10, (v) => changer({ barre: { ...reglages.barre, max: v } })),
          el('span', 'aide', 'cases — « changer une variable » la remplit ou la vide'))
      }
      const pause = el('div', 'evenements-phrase')
      pause.append(el('b', 'evenements-mot', 'PAUSE'), caseA(reglages.pause !== false, 'SELECT met le jeu en pause (SELECT encore : il reprend)', (v) => changer({ pause: v })))
      const fins = el('div', 'evenements-phrase')
      fins.append(el('b', 'evenements-mot', 'FIN'),
        el('span', 'aide', 'perdu :'), texteLisible(reglages.textePerdu ?? 'PERDU !', 18, (v) => changer({ textePerdu: v })),
        el('span', 'aide', 'gagné :'), texteLisible(reglages.texteBravo ?? 'BRAVO !', 18, (v) => changer({ texteBravo: v })))

      /* Le menu principal : l'écran titre avec JOUER et COMMENT JOUER. */
      const menu = el('div', 'evenements-phrase')
      menu.append(el('b', 'evenements-mot', 'MENU'),
        caseA(Boolean(reglages.menu), 'l’écran titre devient un menu : JOUER, COMMENT JOUER (il faut un titre)', (v) => changer({ menu: v })))
      if (reglages.menu) {
        const aide = el('div', 'evenements-dialogue')
        const lignes = [...(reglages.aide ?? []), '', '', '', ''].slice(0, 4)
        lignes.forEach((l, i) => aide.append(texteLisible(l, 18, (v) => { const n = [...lignes]; n[i] = v; changer({ aide: n }) })))
        menu.append(el('span', 'aide', 'COMMENT JOUER :'), aide)
      }
      /* La palette du panneau : le HUD, les dialogues et les menus. */
      const paletteHud = el('div', 'evenements-phrase')
      paletteHud.append(el('b', 'evenements-mot', 'PANNEAU'), el('span', 'aide', 'palette'),
        nombre(reglages.paletteHud ?? 0, 0, 7, (v) => changer({ paletteHud: v })),
        el('span', 'aide', 'le HUD, les dialogues et les menus (en couleur) — 0 : la normale'))

      boite.append(titre, sous, menu, vies, depart, hud, barre, pause, fins, paletteHud, musique)
      return boite
    }

    /* Un acteur sous ce point de la carte — ou -1. */
    function acteurSous(x, y) {
      for (let i = scene.acteurs.length - 1; i >= 0; i--) {
        const a = scene.acteurs[i]
        const cote = lireDessins(lireSource()).find((d) => d.nom === a.dessin)?.cote ?? 16
        if (x >= a.x && x < a.x + cote && y >= a.y && y < a.y + cote) return i
      }
      return -1
    }

    /* Poser un acteur neuf là où l'on clique — avec un dessin qui n'est pas celui du joueur. */
    function poserUnActeur(x, y) {
      let texte = lireSource()
      const presents = lireDessins(texte)
      let dessin = presents.find((d) => d.nom === dessinAPoser) ??
        presents.find((d) => d.nom !== scene.dessin && d.cote === 16) ?? presents.find((d) => d.nom !== scene.dessin)
      if (!dessin) {
        if (!/\bPerso\s+MONSTRE\b/.test(texte)) texte = MONSTRE_PAR_DEFAUT + SAUT + SAUT + texte
        dessin = { nom: 'MONSTRE', cote: 16 }
      }
      const cote = dessin.cote
      scene.acteurs.push({
        ...ancrer(x, y, cote),
        dessin: dessin.nom, mouvement: 'immobile', quand: 'touche', unique: false,
        actions: [{ type: 'dialogue', lignes: ['BONJOUR !', '', ''] }],
      })
      acteurChoisi = scene.acteurs.length - 1
      ecrireSource(ecrireLaScene(texte))
      surChangement()
    }

    /* Colorier une case : sa palette change, et ses 64 pixels se repeignent. */
    function colorierCase(x, y) {
      if (x < 0 || x >= W || y < 0 || y >= H) return
      const colonne = x >> 3
      const ligne = y >> 3
      if (devantEnMain) {
        const cle = `${colonne},${ligne}`
        if (modeDevant === null) modeDevant = !devant.has(cle)
        if (modeDevant) devant.add(cle)
        else devant.delete(cle)
        montrerLesCasesDevant()
        return
      }
      if (teintes[ligne][colonne] === paletteChoisie) return
      teintes[ligne][colonne] = paletteChoisie
      for (let dy = 0; dy < 8; dy++) {
        for (let dx = 0; dx < 8; dx++) {
          const px = colonne * 8 + dx
          const py = ligne * 8 + dy
          dessinerPixel(canevas, px, py, grille[py][px], couleurDe)
        }
      }
    }

    /*
     * Peindre en couleur : LE NUMÉRO de la couleur, et LA PALETTE de la case.
     *
     * Le décor a 8 palettes de 4 couleurs, et chaque carré de 8 × 8 en prend
     * une — c'est ainsi que fonctionne la console. Peindre avec la couleur 3 de
     * la palette 2 pose le numéro 3, et donne la palette 2 au carré : ses autres
     * pixels prennent les couleurs de la palette 2. On le voit, on le dit ;
     * rien n'est refusé, rien n'est rangé en cachette.
     *
     * « points » : [{ x, y, n, p }] — le numéro, et la palette (en couleur).
     * En Game Boy d'origine, seul « n » compte.
     */
    function peindreDesPixels(points) {
      if (!enCouleur) {
        for (const { x, y, n } of points) {
          if (x < 0 || x >= W || y < 0 || y >= H) continue
          grille[y][x] = n
          dessinerPixel(canevas, x, y, n, couleurDe)
        }
        return 0
      }
      /* Les palettes montrées entrent dans le programme au premier coup de pinceau. */
      if (!aDesCouleurs(lireSource())) palettesChangees = true
      const parCarre = new Map()
      for (const pt of points) {
        if (pt.x < 0 || pt.x >= W || pt.y < 0 || pt.y >= H) continue
        const cle = (pt.y >> 3) * 64 + (pt.x >> 3)
        if (!parCarre.has(cle)) parCarre.set(cle, [])
        parCarre.get(cle).push(pt)
      }
      let changees = 0
      for (const [cle, liste] of parCarre) {
        const colonne = cle & 63
        const ligne = cle >> 6
        /* La palette que prend le carré : celle de la plupart des pixels qu'on y pose. */
        const compte = new Map()
        for (const pt of liste) compte.set(pt.p, (compte.get(pt.p) ?? 0) + 1)
        const p = [...compte].sort((a, b) => b[1] - a[1])[0][0]
        if (teintes[ligne][colonne] !== p) { teintes[ligne][colonne] = p; changees++ }
        for (const pt of liste) grille[pt.y][pt.x] = pt.n
        for (let i = 0; i < 64; i++) {
          const px = colonne * 8 + (i & 7)
          const py = ligne * 8 + (i >> 3)
          dessinerPixel(canevas, px, py, grille[py][px], couleurDe)
        }
      }
      if (changees === 1 && parCarre.size === 1) {
        const [cle] = parCarre.keys()
        barre?.dire(`Ce carré prend la palette ${teintes[cle >> 6][cle & 63]} : ses autres pixels prennent ses couleurs.`, 'info')
      } else if (changees > 1) {
        barre?.dire(`${changees} carrés de 8 × 8 prennent la palette de la couleur posée.`, 'info')
      }
      return 0
    }

    /* Un pixel, au crayon. */
    function peindreEnCouleur(x, y) {
      peindreDesPixels([{ x, y, n: nuance, p: paletteEnMain }])
      montrerLeCarre(x, y)
      return true
    }

    /* La couleur d'un pixel tel qu'on le voit : [r, v, b] en couleur, le numéro de nuance sinon. */
    const couleurVue = (x, y) => enCouleur ? palettes[teintes[y >> 3][x >> 3]][grille[y][x]] : grille[y][x]
    const pareil = (a, b) => enCouleur ? memeCouleur(a, b) : a === b

    /* 💧 La pipette : la couleur du pixel passe en main, et l'outil d'avant revient. */
    function prendreLaCouleur(x, y) {
      if (x < 0 || x >= W || y < 0 || y >= H) return
      nuance = grille[y][x]
      if (enCouleur) paletteEnMain = Math.min(NOMBRE_DE_PALETTES - 1, teintes[y >> 3][x >> 3])
      if (outil === 'pipette') outil = outilAvant === 'pipette' ? 'crayon' : outilAvant
      rafraichirGrille()
    }

    /*
     * 🪣 Remplir : toute la zone d'un seul tenant, de la même couleur que le
     * pixel cliqué — ses voisins de gauche, de droite, du haut et du bas, et
     * ainsi de suite. Peinte carré par carré, comme une forme.
     */
    function remplir(x, y) {
      if (x < 0 || x >= W || y < 0 || y >= H) return
      const depart = couleurVue(x, y)
      const voulue = enCouleur ? palettes[paletteEnMain][nuance] : nuance
      if (pareil(depart, voulue)) return
      const vus = new Uint8Array(W * H)
      const pile = [[x, y]]
      const points = []
      vus[y * W + x] = 1
      while (pile.length) {
        const [px, py] = pile.pop()
        points.push({ x: px, y: py, n: nuance, p: paletteEnMain })
        for (const [qx, qy] of [[px + 1, py], [px - 1, py], [px, py + 1], [px, py - 1]]) {
          if (qx < 0 || qx >= W || qy < 0 || qy >= H || vus[qy * W + qx]) continue
          vus[qy * W + qx] = 1
          if (pareil(couleurVue(qx, qy), depart)) pile.push([qx, qy])
        }
      }
      peindreDesPixels(points)
    }

    /* Un rectangle entre deux coins, dans la carte. */
    function rectangleEntre(a, b) {
      const x0 = Math.max(0, Math.min(a.x, b.x))
      const y0 = Math.max(0, Math.min(a.y, b.y))
      const x1 = Math.min(W - 1, Math.max(a.x, b.x))
      const y1 = Math.min(H - 1, Math.max(a.y, b.y))
      return { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 }
    }

    /* Le cadre pointillé de la sélection, sur la carte. */
    const cadreSelection = document.createElement('div')
    cadreSelection.className = 'carte-selection'
    cadreSelection.hidden = true
    cadreDeLaToile.append(cadreSelection)
    requestAnimationFrame(() => montrerLaSelection()) // une sélection garde sa place d'un rafraîchissement à l'autre
    function montrerLaSelection() {
      cadreSelection.hidden = !selection
      if (!selection) return
      const t = canevas.clientWidth / W
      cadreSelection.style.left = canevas.offsetLeft + canevas.clientLeft + selection.x * t + 'px'
      cadreSelection.style.top = canevas.offsetTop + canevas.clientTop + selection.y * t + 'px'
      cadreSelection.style.width = selection.w * t + 'px'
      cadreSelection.style.height = selection.h * t + 'px'
    }

    /*
     * ✥ Déplacer la sélection : on l'attrape, elle suit la souris, et la place
     * qu'elle quitte redevient le fond (la couleur 0 de la palette 0). Le
     * presse-papiers d'avant est gardé : déplacer n'efface pas ce qu'on avait copié.
     */
    function commencerLeDeplacement(x, y) {
      const avant = pressePapiers
      const pixels = []
      for (let j = selection.y; j < selection.y + selection.h; j++) {
        for (let i = selection.x; i < selection.x + selection.w; i++) pixels.push(enCouleur ? { n: grille[j][i], p: teintes[j >> 3][i >> 3] } : grille[j][i])
      }
      const cale = selection.x % 8 === 0 && selection.y % 8 === 0 && selection.w % 8 === 0 && selection.h % 8 === 0
      pressePapiers = { w: selection.w, h: selection.h, pixels, enCouleur, grille: cale }
      const vide = []
      for (let j = selection.y; j < selection.y + selection.h; j++) {
        for (let i = selection.x; i < selection.x + selection.w; i++) vide.push({ x: i, y: j, n: 0, p: 0 })
      }
      peindreDesPixels(vide)
      deplaceSel = { dx: x - selection.x, dy: y - selection.y, avant }
      apercuCollage.width = 0 // l'aperçu se refait avec les pixels attrapés
      montrerLeCollage(selection.x, selection.y)
      cadreSelection.hidden = true
    }

    /*
     * ⇆ ⇅ ↻ Retourner ou tourner la sélection, sur place. Chaque pixel emporte
     * sa palette : une sélection calée sur les carrés de 8 × 8 garde ses couleurs.
     */
    function transformerLaSelection(genre) {
      if (!selection) return
      const { x, y, w, h } = selection
      const sous = Array.from({ length: h }, (_, j) => Array.from({ length: w }, (_, i) => ({ n: grille[y + j][x + i], p: teintes[(y + j) >> 3][(x + i) >> 3] })))
      const neuve = genre === 'h' ? sous.map((l) => [...l].reverse())
        : genre === 'v' ? [...sous].reverse()
          : Array.from({ length: w }, (_, i) => Array.from({ length: h }, (_, j) => sous[h - 1 - j][i]))
      const points = []
      for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) points.push({ x: x + i, y: y + j, n: 0, p: sous[j][i].p })
      peindreDesPixels(points)
      const nh = neuve.length
      const nw = neuve[0].length
      const poses = []
      for (let j = 0; j < nh; j++) for (let i = 0; i < nw; i++) poses.push({ x: x + i, y: y + j, ...neuve[j][i] })
      peindreDesPixels(poses)
      selection = { x, y, w: Math.min(nw, W - x), h: Math.min(nh, H - y) }
      barre?.dire(genre === 'h' ? 'Sélection retournée gauche-droite.' : genre === 'v' ? 'Sélection retournée haut-bas.' : 'Sélection tournée d’un quart de tour.', 'info')
      ecrireLeDessin()
    }

    /*
     * 🧩 Les auto-tuiles : on peint des CARRÉS entiers de la couleur en main,
     * et chacun se dessine selon ses voisins — un bord sombre du côté où il n'a
     * pas de voisin du même terrain, un coin là où la diagonale manque. Un
     * chemin, un mur, une rivière se raccordent tout seuls, dans tous les sens.
     *
     * Un carré « est du terrain » quand son pixel du milieu a la couleur en
     * main : rien à retenir ailleurs, le dessin lui-même le dit.
     */
    const bordDe = (n) => (n === 3 ? 1 : 3)
    function membre(c, l) {
      if (c < 0 || l < 0 || c >= W / 8 || l >= H / 8) return true // le bord de la carte ne fait pas de bordure
      if (grille[l * 8 + 4][c * 8 + 4] !== nuance) return false
      return !enCouleur || teintes[l][c] === paletteEnMain
    }
    function dessinerLAutoCase(c, l, points) {
      const b = bordDe(nuance)
      const haut = membre(c, l - 1); const bas = membre(c, l + 1)
      const gauche = membre(c - 1, l); const droite = membre(c + 1, l)
      for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
          let bord = (y === 0 && !haut) || (y === 7 && !bas) || (x === 0 && !gauche) || (x === 7 && !droite)
          /* Les coins intérieurs : les deux côtés sont là, mais pas la diagonale. */
          if (!bord && x === 0 && y === 0 && !membre(c - 1, l - 1)) bord = true
          if (!bord && x === 7 && y === 0 && !membre(c + 1, l - 1)) bord = true
          if (!bord && x === 0 && y === 7 && !membre(c - 1, l + 1)) bord = true
          if (!bord && x === 7 && y === 7 && !membre(c + 1, l + 1)) bord = true
          points.push({ x: c * 8 + x, y: l * 8 + y, n: bord ? b : nuance, p: paletteEnMain })
        }
      }
    }
    function autoTuile(x, y) {
      if (x < 0 || x >= W || y < 0 || y >= H) return
      const c = x >> 3
      const l = y >> 3
      /* D'abord le milieu, pour que le carré compte comme terrain… */
      const points = []
      for (let j = 0; j < 8; j++) for (let i = 0; i < 8; i++) points.push({ x: c * 8 + i, y: l * 8 + j, n: nuance, p: paletteEnMain })
      peindreDesPixels(points)
      /* …puis lui et ses huit voisins de terrain se redessinent. */
      const refaits = []
      for (let dl = -1; dl <= 1; dl++) {
        for (let dc = -1; dc <= 1; dc++) {
          const cc = c + dc; const ll = l + dl
          if (cc < 0 || ll < 0 || cc >= W / 8 || ll >= H / 8) continue
          if (grille[ll * 8 + 4][cc * 8 + 4] !== nuance || (enCouleur && teintes[ll][cc] !== paletteEnMain)) continue
          dessinerLAutoCase(cc, ll, refaits)
        }
      }
      peindreDesPixels(refaits)
    }

    /* 🧽 La gomme : le pixel redevient le n° 0, dans la palette de son carré. */
    function gommer(x, y) {
      if (x < 0 || x >= W || y < 0 || y >= H || grille[y][x] === 0) return
      if (enCouleur) peindreDesPixels([{ x, y, n: 0, p: teintes[y >> 3][x >> 3] }])
      else {
        grille[y][x] = 0
        dessinerPixel(canevas, x, y, 0, couleurDe)
      }
    }

    function copier() {
      if (!selection) return false
      const pixels = []
      for (let y = selection.y; y < selection.y + selection.h; y++) {
        for (let x = selection.x; x < selection.x + selection.w; x++) pixels.push(enCouleur ? { n: grille[y][x], p: teintes[y >> 3][x >> 3] } : grille[y][x])
      }
      pressePapiers = { w: selection.w, h: selection.h, pixels, enCouleur, grille: selection.x % 8 === 0 && selection.y % 8 === 0 && selection.w % 8 === 0 && selection.h % 8 === 0 }
      barre?.dire?.(`Copié : ${selection.w} × ${selection.h} pixels. « 📌 Coller » ou Ctrl+V, puis clique où le poser.`, 'info')
      return true
    }

    function couper() {
      if (!copier()) return
      /* Le trou prend le fond : la couleur 1 de la palette 1 (ou la nuance la plus claire). */
      const points = []
      for (let y = selection.y; y < selection.y + selection.h; y++) {
        for (let x = selection.x; x < selection.x + selection.w; x++) points.push({ x, y, n: 0, p: 0 })
      }
      peindreDesPixels(points)
      ecrireLeDessin()
    }

    /* L'aperçu du collage, qui suit la souris : un canevas sous le curseur. */
    const apercuCollage = document.createElement('canvas')
    apercuCollage.className = 'carte-apercu-collage'
    apercuCollage.hidden = true
    cadreDeLaToile.append(apercuCollage)

    /* 🔝 Les cases « devant les personnages », hachurées par-dessus la carte quand on colorie. */
    let dernierAuto = null // le carré que l'auto-tuile vient de peindre, dans ce geste
    const calqueDevant = document.createElement('canvas')
    calqueDevant.className = 'carte-devant'
    cadreDeLaToile.append(calqueDevant)
    function montrerLesCasesDevant() {
      calqueDevant.hidden = geste !== 'colorier' || !devant.size
      if (calqueDevant.hidden) return
      calqueDevant.width = W * 2
      calqueDevant.height = H * 2
      calqueDevant.style.left = canevas.offsetLeft + canevas.clientLeft + 'px'
      calqueDevant.style.top = canevas.offsetTop + canevas.clientTop + 'px'
      calqueDevant.style.width = canevas.clientWidth + 'px'
      calqueDevant.style.height = canevas.clientHeight + 'px'
      const ctx = calqueDevant.getContext('2d')
      ctx.strokeStyle = '#ff3fd0'
      ctx.lineWidth = 1
      for (const cle of devant) {
        const [c, l] = cle.split(',').map(Number)
        ctx.strokeRect(c * 16 + 0.5, l * 16 + 0.5, 15, 15)
        ctx.beginPath(); ctx.moveTo(c * 16, l * 16 + 16); ctx.lineTo(c * 16 + 16, l * 16); ctx.stroke()
      }
    }
    requestAnimationFrame(montrerLesCasesDevant)
    /* Là où tombe un collage : calé sur les cases de 8 × 8 si la copie l'était. */
    function ouColler(x, y) {
      if (!pressePapiers?.grille) return { x, y }
      /* La case la PLUS PROCHE de l'endroit où l'on lâche, et jamais hors de la carte. */
      return { x: Math.max(0, Math.min(W - 8, Math.round(x / 8) * 8)), y: Math.max(0, Math.min(H - 8, Math.round(y / 8) * 8)) }
    }

    function montrerLeCollage(x, y) {
      if (!pressePapiers) return
      ;({ x, y } = ouColler(x, y))
      const { w, h, pixels } = pressePapiers
      if (apercuCollage.width !== w || apercuCollage.height !== h) {
        apercuCollage.width = w
        apercuCollage.height = h
        const ctx = apercuCollage.getContext('2d')
        pixels.forEach((c, i) => {
          ctx.fillStyle = pressePapiers.enCouleur ? versDiese((palettes ?? palettesMontrees(lireSource(), false))[c.p]?.[c.n] ?? [0, 0, 0]) : NUANCES[c]
          ctx.fillRect(i % w, Math.floor(i / w), 1, 1)
        })
      }
      const t = canevas.clientWidth / W
      apercuCollage.hidden = false
      apercuCollage.style.left = canevas.offsetLeft + canevas.clientLeft + x * t + 'px'
      apercuCollage.style.top = canevas.offsetTop + canevas.clientTop + y * t + 'px'
      apercuCollage.style.width = w * t + 'px'
      apercuCollage.style.height = h * t + 'px'
    }

    function collerA(x, y) {
      if (!pressePapiers) return
      ;({ x, y } = ouColler(x, y))
      const { w, h, pixels } = pressePapiers
      const points = []
      for (let j = 0; j < h; j++) {
        for (let i = 0; i < w; i++) {
          let c = pixels[j * w + i]
          /* Copié dans l'autre mode : le numéro seul passe, dans la palette 1. */
          if (pressePapiers.enCouleur !== enCouleur) c = enCouleur ? { n: c, p: 0 } : c.n
          points.push(enCouleur ? { x: x + i, y: y + j, n: c.n, p: c.p } : { x: x + i, y: y + j, n: c })
        }
      }
      peindreDesPixels(points)
      /* Le collage devient la sélection ; l'outil repasse en « sélection » au relâché, une fois écrit. */
      selection = { x, y, w: Math.min(w, W - x), h: Math.min(h, H - y) }
      apercuCollage.hidden = true
    }

    /*
     * Changer une palette SANS changer tout le reste : si d'autres (des tuiles,
     * une autre carte, le texte pour la palette 0) s'en servent, la carte en
     * reçoit une COPIE dans une palette libre — ses cases de la palette p
     * passent à la copie, et les autres gardent l'ancienne.
     */
    function changerPourCetteCarte(p, fabriquer) {
      let texte = lireSource()
      const fond = palettesMontrees(texte, false)
      const lui = 'la carte ' + carteChoisie
      const choix = palettePourLui(usagesDuDecor(texte), p, [lui])
      /* La palette 0 : la carte s'en sert dès qu'une de ses cases n'est pas teinte. */
      const siennes = lireTeintesDeCarte(texte, carteChoisie).map((r) => [...r])
      const sesCases = siennes.some((r) => r.includes(p))
      let q = sesCases ? choix.q : p
      let dit = null
      if (q === null) {
        if (!confirm(`Les 8 palettes sont déjà prises. Changer la palette ${p} pour tout le monde (${enUneListe(choix.autres)} aussi) ?`)) return
        q = p
      } else if (q !== p) {
        dit = `Pour ne changer que la carte ${carteChoisie}, ses cases de la palette ${p} passent dans une copie, la palette ${q} (libre), et c’est elle qui change. ${enUneListe(choix.autres)} gardent la palette ${p}.`
      } else if (!sesCases && choix.autres.length) {
        dit = `La carte ${carteChoisie} ne se sert pas de la palette ${p} : elle change pour ${enUneListe(choix.autres)}.`
      }
      fond[q] = fabriquer(fond[p].map((c) => [...c]))
      if (q !== p) {
        for (const r of siennes) for (let i = 0; i < r.length; i++) if (r[i] === p) r[i] = q
        texte = ecrireCarte(texte, carteChoisie, lireGrilleDeCarte(texte, carteChoisie), defileActif, siennes)
        if (paletteEnMain === p) paletteEnMain = q
      }
      /* Le message d'abord : la barre est refaite juste après, et le reprend. */
      if (dit) barre?.dire(dit, 'info')
      ecrireSource(ecrireCouleurs(texte, fond, palettesMontrees(texte, true)))
      surChangement()
      rafraichirGrille()
    }

    /* Écrire la carte dans le programme (ce que fait le relâché d'un trait). */
    function ecrireLeDessin() {
      let texte = ecrireCarte(lireSource(), carteChoisie, grille, defileActif, teintes)
      if (palettesChangees) {
        texte = ecrireCouleurs(texte, palettes, palettesMontrees(texte, true))
        palettesChangees = false
      }
      ecrireSource(texte)
      surChangement()
      rafraichirGrille()
    }

    actionsClavier = geste === 'dessiner' ? {
      c: () => { if (copier()) rafraichirGrille() },
      x: () => couper(),
      v: () => { if (!pressePapiers) return; outil = 'coller'; rafraichirGrille() },
      suppr: () => {
        if (!selection) return
        const points = []
        for (let y = selection.y; y < selection.y + selection.h; y++) for (let x = selection.x; x < selection.x + selection.w; x++) points.push({ x, y, n: 0, p: 0 })
        peindreDesPixels(points)
        ecrireLeDessin()
      },
      echap: () => { if (outil === 'coller') { outil = 'selection'; rafraichirGrille() } else if (selection) { selection = null; rafraichirGrille() } },
    } : {}

    function poserCase(x, y) {
      if (x < 0 || x >= W || y < 0 || y >= H) return
      if (enCouleur) { peindreEnCouleur(x, y); return }
      if (grille[y][x] === nuance) return

      grille[y][x] = nuance
      dessinerPixel(canevas, x, y, nuance, couleurDe)
    }

    /* Un aperçu de la forme, par-dessus le fond déjà posé — sans y toucher
       tant que le geste n'est pas terminé. */
    function apercevoirLaForme(x, y) {
      if (!debutForme) return
      dessinerFond(canevas, grille, couleurDe)
      for (const [px, py] of pixelsDeForme(outil, debutForme.x, debutForme.y, x, y, rempli)) {
        if (px >= 0 && px < W && py >= 0 && py < H) dessinerPixel(canevas, px, py, nuance, couleurPosee)
      }
    }

    canevas.addEventListener('pointerdown', (e) => {
      peint = true
      canevas.setPointerCapture(e.pointerId)
      const { x, y } = coordonnees(e)
      if (geste === 'evenements') { peint = false; choisirOuCreerEvenement(x, y); return }
      if (geste === 'acteurs') {
        const i = acteurSous(x, y)
        if (i >= 0) {
          acteurChoisi = i
          glisse = { i, dx: x - scene.acteurs[i].x, dy: y - scene.acteurs[i].y }
          dessinerCalque()
        } else {
          peint = false
          poserUnActeur(x, y)
          rafraichirGrille()
        }
        return
      }
      if (geste === 'murs') peindreMur(x, y)
      else if (geste === 'joueur') placerJoueur(x, y)
      else if (geste === 'colorier') colorierCase(x, y)
      else if (outil === 'pipette' || (outil === 'crayon' && e.altKey)) { peint = false; prendreLaCouleur(x, y); return }
      else if (outil === 'pot') { remplir(x, y); peint = true }
      else if (outil === 'selection' && selection && x >= selection.x && x < selection.x + selection.w && y >= selection.y && y < selection.y + selection.h) {
        commencerLeDeplacement(x, y)
      }
      else if (outil === 'selection' && tailleSelection !== 'libre') {
        const t = tailleSelection
        selection = { x: Math.min(W - t, Math.floor(x / t) * t), y: Math.min(H - t, Math.floor(y / t) * t), w: t, h: t }
        debutForme = null
        montrerLaSelection()
      }
      else if (outil === 'selection') { debutForme = { x, y }; selection = null; montrerLaSelection() }
      else if (outil === 'coller') { peint = true; collerA(x, y) }
      else if (outil === 'crayon') poserCase(x, y)
      else if (outil === 'gomme') gommer(x, y)
      else if (outil === 'auto') autoTuile(x, y)
      else debutForme = { x, y }
      deplacerLeCurseur(x, y)
    })
    canevas.addEventListener('pointermove', (e) => {
      const { x, y } = coordonnees(e)
      if (peint && geste === 'acteurs' && glisse) {
        const a = scene.acteurs[glisse.i]
        const cote = dessins.find((d) => d.nom === a.dessin)?.cote ?? 16
        const p = ancrer(x, y, cote, glisse.dx, glisse.dy)
        a.x = p.x
        a.y = p.y
        dessinerCalque()
      }
      if (peint) {
        if (geste === 'murs') peindreMur(x, y)
        else if (geste === 'joueur') placerJoueur(x, y)
        else if (geste === 'colorier') colorierCase(x, y)
        else if (outil === 'selection' && deplaceSel) montrerLeCollage(x - deplaceSel.dx, y - deplaceSel.dy)
        else if (outil === 'selection') { if (debutForme) { selection = rectangleEntre(debutForme, { x, y }); montrerLaSelection() } }
        else if (outil === 'pot' || outil === 'coller' || outil === 'pipette') { /* un seul clic */ }
        else if (outil === 'crayon') poserCase(x, y)
        else if (outil === 'gomme') gommer(x, y)
        else if (outil === 'auto') { if ((x >> 3) !== dernierAuto?.c || (y >> 3) !== dernierAuto?.l) { dernierAuto = { c: x >> 3, l: y >> 3 }; autoTuile(x, y) } }
        else apercevoirLaForme(x, y)
      }
      if (geste === 'dessiner' && outil === 'coller') montrerLeCollage(x, y)
      deplacerLeCurseur(x, y)
    })
    canevas.addEventListener('pointerleave', () => { curseur.hidden = true; derniereSouris = null; barre?.ici(null) })
    canevas.addEventListener('pointermove', (e) => { derniereSouris = { clientX: e.clientX, clientY: e.clientY } })

    /*
     * Après une recompilation, la carte est redessinée — et le curseur restait
     * caché jusqu'au prochain mouvement de souris. Il revient là où elle est.
     */
    requestAnimationFrame(() => {
      if (!derniereSouris || !canevas.isConnected) return
      const r = canevas.getBoundingClientRect()
      if (derniereSouris.clientX < r.left || derniereSouris.clientX > r.right || derniereSouris.clientY < r.top || derniereSouris.clientY > r.bottom) return
      const { x, y } = coordonnees(derniereSouris)
      deplacerLeCurseur(x, y)
    })

    /* Les couleurs du carré sous la souris : combien, et lesquelles (entourées dans la rangée). */
    function montrerLeCarre(x, y) {
      if (!barre) return
      const colonne = x >> 3
      const ligne = y >> 3
      barre.ici(`ce carré (${colonne}, ${ligne}) → palette ${teintes[ligne][colonne]}`)
    }

    /* Combien de couleurs le décor emploie déjà, sur les 32 de la console. */
    function montrerLeTotal() {
      if (!barre || !places) return
      let n = 0
      for (const p of places) for (const k of p) if (k > 0) n++
      barre.total('Décor', n, 32)
    }
    const relacher = (e) => {
      if (!peint) return
      peint = false

      if (geste === 'acteurs') {
        if (glisse) {
          glisse = null
          ecrireSource(ecrireLaScene(lireSource()))
          surChangement()
          rafraichirGrille()
        }
        return
      }

      if (geste === 'murs' || geste === 'joueur') {
        ecrireSource(ecrireLaScene(lireSource()))
        surChangement()
        if (!dessins.length) rafraichirGrille() // le héros tout prêt vient d'arriver : le montrer
        return
      }

      if (geste === 'colorier') {
        modeDevant = null
        ecrireSource(ecrireCarte(lireSource(), carteChoisie, grille, defileActif, teintes, devant))
        surChangement()
        if (devantEnMain) rafraichirGrille()   // le compte des cases « devant »
        return
      }

      if (outil === 'coller') {
        outil = 'selection'
        ecrireLeDessin()
        return
      }
      /* Lâcher une sélection qu'on déplaçait : elle se pose là (calée sur les cases si elle l'était). */
      if (outil === 'selection' && deplaceSel) {
        const { x, y } = coordonnees(e)
        collerA(x - deplaceSel.dx, y - deplaceSel.dy)
        pressePapiers = deplaceSel.avant
        deplaceSel = null
        barre?.dire('Zone déplacée. Ctrl+Z pour revenir en arrière.', 'info')
        ecrireLeDessin()
        return
      }
      if (outil === 'selection') {
        if (debutForme) {
          const { x, y } = coordonnees(e)
          selection = rectangleEntre(debutForme, { x, y })
        }
        debutForme = null
        rafraichirGrille() // les boutons Copier / Couper s'allument
        return
      }
      dernierAuto = null
      if (outil !== 'crayon' && outil !== 'gomme' && outil !== 'auto' && outil !== 'pot' && outil !== 'coller' && debutForme) {
        const { x, y } = coordonnees(e)
        /* Toute la forme d'un coup, carré par carré : bien plus vite, et un seul message s'il y a des refus. */
        peindreDesPixels(pixelsDeForme(outil, debutForme.x, debutForme.y, x, y, rempli)
          .map(([px, py]) => ({ x: px, y: py, n: nuance, p: paletteEnMain })))
        dessinerFond(canevas, grille, couleurDe)
      }
      debutForme = null

      /*
       * On n'écrit dans le programme qu'au relâché — et non à chaque pixel.
       *
       * Vingt fois dix-huit carrés, ça fait vite des centaines de lignes à
       * reconstruire : l'écrire à chaque pixel d'un trait ferait traîner la
       * main. Le canevas, lui, suit déjà chaque pixel : rien ne manque à
       * l'œil pendant qu'on dessine.
       */
      let texte = ecrireCarte(lireSource(), carteChoisie, grille, defileActif, teintes)
      /* Une couleur neuve a pris une place libre dans une palette : l'écrire aussi. */
      if (palettesChangees) {
        texte = ecrireCouleurs(texte, palettes, palettesMontrees(texte, true))
        palettesChangees = false
      }
      ecrireSource(texte)
      surChangement()
      info.textContent = `${carteChoisie}() — ${compterLesTuiles(grille)} tuiles utilisées`
    }
    canevas.addEventListener('pointerup', relacher)
    canevas.addEventListener('pointercancel', () => { peint = false; debutForme = null })

    const enveloppe = document.createElement('div')
    enveloppe.className = 'partition'
    enveloppe.append(cadreDeLaToile)
    zoneGrille.append(enveloppe)

    /*
     * ▶ Jouer la scène : la carte, ses murs et son joueur deviennent LE jeu.
     *
     * « main » est réécrit pour afficher la carte et faire tourner le joueur.
     * S'il contient autre chose que ce que l'atelier y a mis, on DEMANDE : ce
     * serait le travail de quelqu'un.
     */
    const rangeeJeu = document.createElement('div')
    rangeeJeu.className = 'rangee carte-jouer'
    const jouer = document.createElement('button')
    jouer.type = 'button'
    jouer.className = 'principal'
    jouer.id = 'carte-jouer'
    jouer.textContent = '▶ Jouer la scène'
    jouer.title = `main() affiche ${carteChoisie} et fait tourner le joueur — clique ensuite dans la console, puis les flèches`
    jouer.addEventListener('click', () => {
      let texte = ecrireLaScene(lireSource())
      if (mainAUnContenuPropre(texte) &&
          !confirm('main() contient déjà ton propre code.\n\nLe remplacer par le jeu de cette scène ? (les couleurs de l’atelier sont gardées)')) return
      texte = faireDeLaSceneLeJeu(texte, carteChoisie)
      ecrireSource(texte)
      ;(lancer ?? surChangement)()
      rafraichirGrille()
    })
    const aideJeu = document.createElement('span')
    aideJeu.className = 'aide'
    aideJeu.textContent = 'puis clique dans la console et joue avec les flèches'
    rangeeJeu.append(jouer, aideJeu)
    zoneGrille.append(rangeeJeu)

    if (geste === 'evenements') {
      zoneGrille.append(panneauDesEvenements())
      return
    }

    if (geste === 'acteurs') {
      zoneGrille.append(panneauDesActeurs())
      return
    }

    if (geste === 'murs') {
      const choix = document.createElement('div')
      choix.className = 'rangee'
      for (const [valeur, etiquette] of [[1, '🧱 Poser des murs'], [0, '🧽 Enlever des murs']]) {
        const bouton = document.createElement('button')
        bouton.type = 'button'
        bouton.className = poseDeMur === valeur ? 'principal' : ''
        bouton.textContent = etiquette
        bouton.addEventListener('click', () => { poseDeMur = valeur; rafraichirGrille() })
        choix.append(bouton)
      }
      const compte = document.createElement('span')
      compte.className = 'aide'
      compte.textContent = `${scene.murs.flat().filter(Boolean).length} cases de murs`
      choix.append(compte)
      zoneGrille.append(choix)
      return
    }

    if (geste === 'joueur') {
      const choix = document.createElement('div')
      choix.className = 'rangee'
      const etiquette = document.createElement('span')
      etiquette.className = 'aide'
      etiquette.textContent = 'le dessin du joueur :'
      const liste = document.createElement('select')
      if (!dessins.length) {
        const option = document.createElement('option')
        option.textContent = 'HEROS — tout prêt (aucun dessin dans le programme)'
        liste.append(option)
      }
      for (const d of dessins) {
        const option = document.createElement('option')
        option.value = d.nom
        option.textContent = `${d.nom} — ${d.cote} × ${d.cote}`
        liste.append(option)
      }
      liste.value = dessinDuJoueur()?.nom ?? ''
      liste.addEventListener('change', () => {
        scene.dessin = liste.value
        ecrireSource(ecrireLaScene(lireSource()))
        surChangement()
        rafraichirGrille()
      })
      const ou = document.createElement('span')
      ou.className = 'aide'
      ou.textContent = `départ : x = ${scene.x}, y = ${scene.y} (en pixels)`
      choix.append(etiquette, liste, ou)
      zoneGrille.append(choix)

      /*
       * L'animation : jusqu'à deux dessins de plus, qui alternent avec le
       * premier tant qu'il marche — et le retournement vers la gauche.
       */
      const anim = document.createElement('div')
      anim.className = 'rangee'
      const dit = document.createElement('span')
      dit.className = 'aide'
      dit.textContent = 'quand il marche, alterner avec :'
      anim.append(dit)
      scene.animation ??= { images: [scene.dessin], vitesse: 8 }
      for (const k of [1, 2]) {
        const autre = document.createElement('select')
        for (const [v, t] of [['', '—'], ...dessins.filter((d) => d.cote === coteDuJoueur()).map((d) => [d.nom, d.nom])]) {
          const o = document.createElement('option')
          o.value = v
          o.textContent = t
          autre.append(o)
        }
        autre.value = scene.animation.images?.[k] ?? ''
        autre.addEventListener('change', () => {
          const images = [scene.dessin, scene.animation.images?.[1] ?? '', scene.animation.images?.[2] ?? '']
          images[k] = autre.value
          scene.animation.images = images.filter(Boolean)
          ecrireSource(ecrireLaScene(lireSource()))
          surChangement()
        })
        anim.append(autre)
      }
      const vitesse = document.createElement('input')
      vitesse.type = 'number'
      vitesse.min = 2
      vitesse.max = 30
      vitesse.value = scene.animation.vitesse ?? 8
      vitesse.style.width = '4.5em'
      vitesse.title = 'combien d’images dure chaque dessin : petit = rapide'
      vitesse.addEventListener('change', () => {
        scene.animation.vitesse = Math.max(2, Math.min(30, Number(vitesse.value) || 8))
        ecrireSource(ecrireLaScene(lireSource()))
        surChangement()
      })
      const retour = document.createElement('label')
      retour.className = 'aide'
      const caseRetour = document.createElement('input')
      caseRetour.type = 'checkbox'
      caseRetour.checked = Boolean(scene.retourner)
      caseRetour.addEventListener('change', () => {
        scene.retourner = caseRetour.checked
        ecrireSource(ecrireLaScene(lireSource()))
        surChangement()
      })
      retour.append(caseRetour, document.createTextNode(' se retourne vers la gauche'))
      anim.append(document.createTextNode(' vitesse '), vitesse, retour)
      zoneGrille.append(anim)

      /*
       * 🎭 Les états du joueur : un dessin (ou trois, qui alternent) pour
       * l'attente, la course, l'attaque, la blessure, la mort, la victoire,
       * de dos et de face — et une animation personnalisée. Un état laissé
       * vide garde les dessins de la marche.
       */
      const ecrire = () => { ecrireSource(ecrireLaScene(lireSource())); surChangement() }
      const memes = dessins.filter((d) => d.cote === coteDuJoueur())
      const listeDe = (valeur, surChange) => {
        const l = document.createElement('select')
        for (const [v, t] of [['', '—'], ...memes.map((d) => [d.nom, d.nom])]) l.append(new Option(t, v))
        l.value = valeur ?? ''
        l.addEventListener('change', () => surChange(l.value))
        return l
      }
      const etats = document.createElement('details')
      etats.className = 'joueur-etats'
      etats.open = Object.keys(scene.etats ?? {}).length > 0
      const resume = document.createElement('summary')
      resume.textContent = '🎭 Ses états : attente, course, attaque, blessure, mort, victoire…'
      etats.append(resume)
      scene.etats ??= {}
      for (const [cle, etat] of Object.entries(ETATS_DU_JOUEUR)) {
        if (scene.genre === 'plateforme' && (cle === 'haut' || cle === 'bas')) continue
        const ligne = document.createElement('div')
        ligne.className = 'rangee'
        const nomEtat = document.createElement('b')
        nomEtat.textContent = etat.nom
        nomEtat.style.minWidth = '7.5em'
        const actuel = scene.etats[cle] ?? { images: [] }
        ligne.append(nomEtat)
        for (const k of [0, 1, 2]) {
          ligne.append(listeDe(actuel.images?.[k], (v) => {
            const images = [0, 1, 2].map((i) => (i === k ? v : actuel.images?.[i] ?? ''))
            scene.etats[cle] = { ...actuel, images: images.filter(Boolean) }
            if (!scene.etats[cle].images.length) delete scene.etats[cle]
            ecrire()
            rafraichirGrille()
          }))
        }
        const aide = document.createElement('span')
        aide.className = 'aide'
        aide.textContent = etat.dit
        ligne.append(aide)
        etats.append(ligne)
      }
      /* Les touches, la hurtbox (sa marge) et la hitbox (la portée du coup). */
      const plateforme = scene.genre === 'plateforme'
      const touches = { ...(plateforme ? { attaque: 'B', course: '' } : { attaque: 'A', course: 'B' }), ...(scene.touches ?? {}) }
      const reglages = document.createElement('div')
      reglages.className = 'rangee'
      const toucheDe = (quoi, texte) => {
        const l = document.createElement('select')
        const offertes = plateforme ? [['', 'aucune'], ['B', 'B']] : [['', 'aucune'], ['A', 'A'], ['B', 'B']]
        for (const [v, t] of offertes) l.append(new Option(t, v))
        l.value = touches[quoi] ?? ''
        l.addEventListener('change', () => { scene.touches = { ...touches, [quoi]: l.value }; ecrire(); rafraichirGrille() })
        const e = document.createElement('span')
        e.className = 'aide'
        e.textContent = texte
        reglages.append(e, l)
      }
      toucheDe('attaque', 'attaquer avec')
      toucheDe('course', 'courir (maintenir)')
      const nombreDe = (valeur, min, max, titre, surChange) => {
        const n = document.createElement('input')
        n.type = 'number'
        n.min = min
        n.max = max
        n.value = valeur
        n.style.width = '4.5em'
        n.title = titre
        n.addEventListener('change', () => surChange(Math.max(min, Math.min(max, Number(n.value) || min))))
        return n
      }
      const aideMarge = document.createElement('span')
      aideMarge.className = 'aide'
      aideMarge.textContent = 'hurtbox : marge'
      const aidePortee = document.createElement('span')
      aidePortee.className = 'aide'
      aidePortee.textContent = 'hitbox du coup'
      reglages.append(
        aideMarge, nombreDe(scene.marge ?? 0, 0, 7, 'de combien de pixels son carré est réduit, de chaque côté, pour les coups qu’il reçoit : un ennemi qui frôle le bord ne le blesse pas', (v) => { scene.marge = v; ecrire() }),
        aidePortee, nombreDe(scene.portee ?? 12, 4, 24, 'la taille du carré de son coup, devant lui, en pixels', (v) => { scene.portee = v; ecrire() }),
      )
      if (touches.attaque && touches.attaque === touches.course) {
        const conflit = document.createElement('span')
        conflit.className = 'aide alerte'
        conflit.textContent = 'la même touche ne peut pas attaquer ET courir : la course est coupée'
        reglages.append(conflit)
      }
      etats.append(reglages)
      zoneGrille.append(etats)

      /*
       * Le genre du jeu : vu de dessus (les quatre flèches), ou de plateforme
       * (gauche, droite, la pesanteur, et A pour sauter — comme Mario).
       */
      const genre = document.createElement('div')
      genre.className = 'rangee'
      const ditGenre = document.createElement('span')
      ditGenre.className = 'aide'
      ditGenre.textContent = 'le genre :'
      const choixGenre = document.createElement('select')
      for (const [v, t] of [['dessus', 'vu de dessus — les quatre flèches'], ['plateforme', 'plateforme — la pesanteur, A pour sauter']]) {
        const o = document.createElement('option')
        o.value = v
        o.textContent = t
        choixGenre.append(o)
      }
      choixGenre.value = scene.genre ?? 'dessus'
      choixGenre.addEventListener('change', () => {
        scene.genre = choixGenre.value
        ecrireSource(ecrireLaScene(lireSource()))
        surChangement()
        rafraichirGrille()
      })
      genre.append(ditGenre, choixGenre)
      if (scene.genre === 'plateforme') {
        const saut = document.createElement('input')
        saut.type = 'number'
        saut.min = 6
        saut.max = 40
        saut.value = scene.saut ?? 22
        saut.style.width = '4.5em'
        saut.title = 'combien d’images dure la montée : plus grand = saute plus haut'
        saut.addEventListener('change', () => {
          scene.saut = Math.max(6, Math.min(40, Number(saut.value) || 22))
          ecrireSource(ecrireLaScene(lireSource()))
          surChangement()
        })
        const ditSaut = document.createElement('span')
        ditSaut.className = 'aide'
        ditSaut.textContent = 'hauteur du saut'
        genre.append(ditSaut, saut)
      }
      zoneGrille.append(genre)
      return
    }

    if (geste === 'jeu') {
      zoneGrille.append(panneauDuJeu())
      return
    }

    if (geste === 'colorier') {
      /* Les 8 palettes du décor (0 à 7), chacune avec ses quatre couleurs. */
      const choixPalettes = document.createElement('div')
      choixPalettes.id = 'carte-palettes'
      choixPalettes.className = 'carte-palettes'
      if (paletteChoisie >= NOMBRE_DE_PALETTES) paletteChoisie = 0
      palettes.slice(0, NOMBRE_DE_PALETTES).forEach((couleurs, p) => {
        const bouton = document.createElement('button')
        bouton.type = 'button'
        bouton.className = 'carte-palette' + (p === paletteChoisie ? ' choisie' : '')
        const nom = nomDeLaPalette(couleurs, p)
        bouton.title = `palette ${p}${nom ? ' — ' + nom : ''}${p === 0 ? ' : celle des cases qu’on ne teint pas' : ''}`
        const bandes = document.createElement('span')
        bandes.className = 'carte-palette-bandes'
        for (const c of couleurs) {
          const b = document.createElement('i')
          b.style.background = versDiese(c)
          bandes.append(b)
        }
        const texte = document.createElement('span')
        texte.textContent = `palette ${p}${nom ? ' ' + nom : ''}`
        bouton.append(bandes, texte)
        bouton.addEventListener('click', () => { paletteChoisie = p; devantEnMain = false; rafraichirGrille() })
        if (devantEnMain) bouton.classList.remove('choisie')
        choixPalettes.append(bouton)
      })
      /* 🔝 La priorité : ces cases cachent les personnages qui passent dessous (un buisson, un pont). */
      const boutonDevant = document.createElement('button')
      boutonDevant.type = 'button'
      boutonDevant.className = 'carte-palette' + (devantEnMain ? ' choisie' : '')
      boutonDevant.title = 'un clic sur une case la met DEVANT les personnages (ou l’en retire) : ils passent dessous, comme sous un buisson ou un pont — Game Boy Color'
      boutonDevant.textContent = `🔝 devant les personnages (${devant.size})`
      boutonDevant.addEventListener('click', () => { devantEnMain = !devantEnMain; rafraichirGrille() })
      choixPalettes.append(boutonDevant)
      zoneGrille.append(choixPalettes)
      return
    }

    /*
     * La barre de couleurs, comme dans Paint (voir « barre-paint.js ») : toutes
     * les palettes au-dessus de la carte. Un clic sur une pastille : on dessine
     * avec ce numéro, et la case prend cette palette. « Autre couleur… » change
     * la pastille elle-même, dans sa palette.
     */
    barre = barrePaint({
      couleur: enCouleur,
      palettes: palettes ?? [],
      choix: { p: paletteEnMain, n: nuance },
      cle: 'carte',
      surChoix: (p, n) => {
        nuance = n
        if (enCouleur) paletteEnMain = p
        rafraichirGrille()
      },
      /* Un thème : les 8 palettes du décor et des personnages, d'un coup. */
      surTheme: (theme) => {
        ecrireSource(ecrireCouleurs(lireSource(), theme.fond, theme.lutins))
        surChangement()
        barre?.dire(`Thème « ${theme.nom} » posé : les 8 palettes du décor et des personnages. Ctrl+Z pour revenir en arrière.`, 'info')
        rafraichirGrille()
      },
      /* Une variété toute prête, mise dans la palette p — pour cette carte seulement. */
      surVariete: (p, palette) => changerPourCetteCarte(p, () => palette.map((c) => [...c])),
      /* Changer une couleur d'une palette — pour cette carte seulement. */
      surChangerCouleur: (p, n, rvb) => changerPourCetteCarte(p, (anciennes) => anciennes.map((c, i) => (i === n ? rvb : c))),
    })
    barre.id = 'carte-palette'
    if (enCouleur) montrerLeTotal()
    zoneGrille.insertBefore(barre, enveloppe)

    /* Sous la carte : la palette de la case survolée. */
    const palette = document.createElement('p')
    palette.className = 'aide'
    if (enCouleur) {
      let montree = null
      suivreLaCase = (p) => {
        if (p === montree) return
        montree = p
        const nom = nomDeLaPalette(palettes[p], p)
        palette.textContent = `cette case : palette ${p}${nom ? ' — ' + nom : ''} · y peindre avec une couleur de la palette ${paletteEnMain} lui donnera la palette ${paletteEnMain}`
      }
      suivreLaCase(0)
    }
    zoneGrille.append(palette)
  }

  return {
    rafraichir() {
      rafraichirBande()
      rafraichirGrille()
    },
    /* Ouvrir une carte (ou sa scène) par son nom (l'onglet « Tout le jeu »). */
    choisir(nom) {
      if (listerLesCartes(lireSource()).includes(nom)) carteChoisie = nom
      rafraichirBande()
      rafraichirGrille()
    },
  }
}

/* `couleurDe(x, y, numero)` dit la couleur d'un pixel : une nuance d'origine,
   ou la couleur de ce numéro dans la palette de sa case. */
const enNuances = (x, y, numero) => NUANCES[numero]

function dessinerFond(canevas, grille, couleurDe = enNuances) {
  const ctx = canevas.getContext('2d')
  for (let y = 0; y < grille.length; y++) {
    for (let x = 0; x < grille[0].length; x++) {
      ctx.fillStyle = couleurDe(x, y, grille[y][x])
      ctx.fillRect(x, y, 1, 1)
    }
  }
}

function dessinerPixel(canevas, x, y, nuance, couleurDe = enNuances) {
  const ctx = canevas.getContext('2d')
  ctx.fillStyle = couleurDe(x, y, nuance)
  ctx.fillRect(x, y, 1, 1)
}

/**
 * Une seule palette pour tout, et la console qui suit.
 *
 * On choisit UNE COULEUR dans le nuancier — toutes les couleurs réunies — et
 * l'on dessine avec. La console, elle, ne connaît que huit palettes de quatre
 * couleurs, et chaque carré de 8 × 8 n'en prend qu'une. Ce module fait le
 * pont : pour chaque carré, il trouve (ou fabrique) une palette qui porte
 * toutes les couleurs du carré, sans toucher aux couleurs dont les AUTRES
 * carrés se servent.
 *
 * Deux refus, et seulement deux, parce que la console ne peut pas mieux :
 *   - un carré de 8 × 8 qui voudrait une cinquième couleur ;
 *   - huit palettes déjà pleines, sans place pour une couleur de plus.
 */

import { memeCouleur, clarte } from './editeur-couleurs.js'
import { listerLesCartes, lireGrilleDeCarte, lireTeintesDeCarte } from './editeur-carte.js'
import { lireDessins, nuanceDe, paletteDUneTuile } from './editeur-tuiles.js'
import { lirePalettesDuPerso } from './editeur-scene.js'

/** Une table vide : combien de pixels se servent de chaque place, palette par palette. */
export const placesVides = () => Array.from({ length: 8 }, () => [0, 0, 0, 0])

/** Ajoute (ou retire, avec -1) les pixels d'une case de carte à la table. */
export function compterLaCase(places, grille, teintes, colonne, ligne, signe = 1) {
  const p = teintes[ligne][colonne]
  for (let y = 0; y < 8; y++) {
    const rangee = grille[ligne * 8 + y]
    for (let x = 0; x < 8; x++) places[p][rangee[colonne * 8 + x]] += signe
  }
}

/**
 * Les places du DÉCOR déjà prises dans tout le programme : les cases de
 * toutes les cartes, et les tuiles posées avec leur palette.
 *
 *   sansCarte   une carte à ne pas compter (celle qu'on dessine : l'atelier
 *               la compte lui-même, à jour à chaque pixel)
 *   sansTuile   une tuile à ne pas compter (celle qu'on dessine)
 */
export function placesDuDecor(source, { sansCarte = null, sansTuile = null } = {}) {
  const places = placesVides()
  for (const nom of listerLesCartes(source)) {
    if (nom === sansCarte) continue
    const grille = lireGrilleDeCarte(source, nom)
    const teintes = lireTeintesDeCarte(source, nom)
    for (let ligne = 0; ligne < teintes.length; ligne++) {
      for (let colonne = 0; colonne < teintes[0].length; colonne++) compterLaCase(places, grille, teintes, colonne, ligne)
    }
  }
  for (const dessin of lireDessins(source)) {
    if (dessin.cote !== 8 || dessin.nom === sansTuile) continue
    const p = paletteDUneTuile(source, dessin.nom) ?? 0
    for (const rangee of dessin.rangees) for (const signe of rangee) places[p][nuanceDe(signe)]++
  }
  return places
}

/**
 * Les places des PERSONNAGES déjà prises : chaque quart de chaque « Perso »,
 * avec la palette de sa table (la 1 s'il n'en a pas encore). Le n° 0, le
 * transparent, n'occupe rien.
 */
export function placesDesLutins(source, { sansPerso = null } = {}) {
  const places = placesVides()
  for (const dessin of lireDessins(source)) {
    if (dessin.cote !== 16 || dessin.nom === sansPerso) continue
    compterLePerso(places, dessin.rangees, lirePalettesDuPerso(source, dessin.nom) ?? [1, 1, 1, 1])
  }
  return places
}

/** Ajoute (ou retire, avec -1) les pixels d'un personnage, quart par quart — sauf le quart « sauf ». */
export function compterLePerso(places, rangees, quarts, signe = 1, sauf = -1) {
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      const q = (y >> 3) * 2 + (x >> 3)
      if (q === sauf) continue
      const n = nuanceDe(rangees[y][x])
      if (n) places[quarts[q]][n] += signe
    }
  }
}

/**
 * Trouve une palette pour ces couleurs.
 *
 *   palettes   les huit palettes, quatre [r, v, b] chacune
 *   voulues    les couleurs (différentes) qu'il faut, quatre au plus
 *   places     combien d'AUTRES pixels se servent de chaque place — une
 *              place prise ne change pas de couleur, sinon un autre dessin
 *              changerait sous nos yeux
 *   preferee   la palette déjà là : à égalité, on la garde
 *   depuis     la première place utilisable (1 pour les personnages : la 0
 *              est transparente)
 *   seulement  ne chercher que dans ces palettes
 *   eviter     palettes à ne modifier qu'en dernier (la 0 : celle du texte)
 *
 * Rend { p, palette, indice(couleur), change } ou null s'il n'y a pas de place.
 */
export function trouverUnePalette(palettes, voulues, places, {
  preferee = 0, depuis = 0, seulement = null, eviter = [0],
} = {}) {
  let meilleure = null

  for (let q = 0; q < palettes.length; q++) {
    if (seulement && !seulement.includes(q)) continue
    const palette = palettes[q].map((c) => [...c])
    const attribuees = new Set()
    const manquantes = []

    for (const couleur of voulues) {
      let trouvee = -1
      for (let s = depuis; s < 4; s++) {
        if (!attribuees.has(s) && memeCouleur(palette[s], couleur)) { trouvee = s; break }
      }
      if (trouvee >= 0) attribuees.add(trouvee)
      else manquantes.push(couleur)
    }

    const libres = []
    for (let s = depuis; s < 4; s++) if (!attribuees.has(s) && !places[q][s]) libres.push(s)
    if (manquantes.length > libres.length) continue

    /* Les nouvelles couleurs vont du clair au sombre, dans l'ordre des places
       libres : le .gb montre les numéros en quatre nuances, et une palette à
       peu près rangée y reste lisible. */
    manquantes.sort((a, b) => clarte(b) - clarte(a))
    manquantes.forEach((c, i) => { palette[libres[i]] = [...c] })

    const cout = manquantes.length * 10 +
      (manquantes.length && eviter.includes(q) ? 100 : 0) +
      (q === preferee ? 0 : 1)
    if (!meilleure || cout < meilleure.cout) meilleure = { p: q, palette, cout, change: manquantes.length > 0 }
  }

  if (!meilleure) return null
  const { p, palette, change } = meilleure
  return {
    p, palette, change,
    indice: (couleur) => {
      for (let s = depuis; s < 4; s++) if (memeCouleur(palette[s], couleur)) return s
      return -1
    },
  }
}

/** Les couleurs différentes d'une liste, dans l'ordre. */
export function differentes(couleurs) {
  const vues = []
  for (const c of couleurs) if (c && !vues.some((v) => memeCouleur(v, c))) vues.push(c)
  return vues
}

const ecart = (a, b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2

/*
 * Ramener un carré à « max » couleurs, SANS REFUSER le pixel qu'on vient de peindre.
 *
 * La console n'en affiche que 4 dans un carré de 8 × 8 : refuser la cinquième
 * bloquait le dessin à chaque fois. On fait donc de la place — la couleur la
 * MOINS employée du carré (hors celles qu'on vient de poser, « gardees ») se
 * fond dans la couleur restante qui lui ressemble le plus. `couleurs` est
 * modifié sur place (null, le transparent, n'est jamais fondu ni employé).
 * Rend la liste des fusions faites : [{ de, vers, pixels }].
 */
export function ramenerA(couleurs, max, gardees = []) {
  const fusions = []
  for (;;) {
    const presentes = differentes(couleurs)
    if (presentes.length <= max) return fusions
    const combien = (c) => couleurs.filter((x) => x && memeCouleur(x, c)).length
    const candidates = presentes.filter((c) => !gardees.some((g) => memeCouleur(g, c)))
    /*
     * La fusion qui CHANGE LE MOINS l'image : pixels touchés × écart de couleur.
     * « La moins employée » seule faisait virer tout un fond de 15 pixels au
     * magenta pour un seul pixel posé ; une couleur proche d'une autre se fond
     * d'abord, presque sans se voir.
     */
    let aFondre = null
    let vers = null
    let meilleur = Infinity
    /* La couleur qu'on vient de poser ne va que là où l'on peint : elle ne reçoit pas de fusion. */
    const cibles = presentes.filter((c) => !gardees.some((g) => memeCouleur(g, c)))
    for (const a of candidates.length ? candidates : presentes) {
      for (const b of cibles.length > 1 ? cibles : presentes) {
        if (memeCouleur(a, b)) continue
        const cout = combien(a) * ecart(a, b)
        if (cout < meilleur) { meilleur = cout; aFondre = a; vers = b }
      }
    }
    const pixels = combien(aFondre)
    for (let i = 0; i < couleurs.length; i++) if (couleurs[i] && memeCouleur(couleurs[i], aFondre)) couleurs[i] = vers
    fusions.push({ de: aFondre, vers, pixels })
  }
}

/*
 * QUI se sert de chaque palette — pour changer une couleur SANS changer tout le reste.
 *
 * Changer une couleur d'une palette la change partout où la palette sert : c'est
 * ainsi que fonctionne la console. Mais on voulait changer UN dessin, et tout
 * l'écran changeait avec lui — presque tout est dans la palette 0 au départ.
 * L'atelier regarde donc qui partage la palette ; s'il n'est pas seul, il fait
 * une COPIE de la palette dans une place libre, et ne la donne qu'à lui.
 *
 * Rend 8 ensembles de noms : les tuiles, les cartes (« la carte VILLAGE »), et,
 * pour la palette 0 du décor, « le texte » — tout ce qui n'est pas teint.
 */
export function usagesDuDecor(source) {
  const usages = Array.from({ length: 8 }, () => new Set())
  usages[0].add('le texte et tout ce qui n’est pas teint')
  for (const dessin of lireDessins(source)) {
    if (dessin.cote === 8) usages[paletteDUneTuile(source, dessin.nom) ?? 0].add(dessin.nom)
  }
  for (const nom of listerLesCartes(source)) {
    for (const rangee of lireTeintesDeCarte(source, nom)) for (const p of rangee) usages[p].add('la carte ' + nom)
  }
  /* Un « teindre » écrit à la main, que l'atelier ne rattache à rien : la palette est prise. */
  for (const m of source.matchAll(/teindre\s*\([^,()]+,[^,()]+,\s*(\d+)\s*\)/g)) {
    const p = Number(m[1])
    if (p <= 7 && !usages[p].size) usages[p].add('un teindre du programme')
  }
  return usages
}

/** Les palettes des personnages : chaque quart de chaque « Perso » (la 1 s'il n'a pas de table). */
export function usagesDesLutins(source) {
  const usages = Array.from({ length: 8 }, () => new Set())
  for (const dessin of lireDessins(source)) {
    if (dessin.cote !== 16) continue
    for (const p of lirePalettesDuPerso(source, dessin.nom) ?? [1, 1, 1, 1]) usages[p].add(dessin.nom)
  }
  return usages
}

/** Une palette que personne n'emploie (la 0 n'est jamais libre : c'est la normale). */
export function paletteLibre(usages) {
  for (let q = 1; q < usages.length; q++) if (!usages[q].size) return q
  return null
}

/*
 * Changer une palette POUR UN SEUL élément (une tuile, un personnage, une carte).
 *
 *   usages   ce que rend usagesDuDecor / usagesDesLutins
 *   p        la palette qu'on change
 *   lui      les noms de l'élément dans « usages » (« BRIQUE », « la carte VILLAGE »)
 *
 * Rend { autres, q } : les AUTRES qui se servent de p, et la palette où mettre la
 * copie — p elle-même quand il est seul à s'en servir (ou qu'il ne s'en sert pas :
 * on change alors la palette qu'on a montrée du doigt), null quand il faudrait une
 * copie et que les huit palettes sont prises.
 */
export function palettePourLui(usages, p, lui) {
  const siens = new Set(lui)
  const autres = [...usages[p]].filter((nom) => !siens.has(nom))
  const ilSenSert = [...usages[p]].some((nom) => siens.has(nom))
  if (!autres.length || !ilSenSert) return { autres, q: p }
  return { autres, q: paletteLibre(usages) }
}

/** « BRIQUE, SOL et la carte VILLAGE » — pour les messages. */
export function enUneListe(noms) {
  if (noms.length <= 1) return noms.join('')
  const montres = noms.slice(0, 4)
  const reste = noms.length - montres.length
  if (reste) return montres.join(', ') + ` et ${reste} autre${reste > 1 ? 's' : ''}`
  return montres.slice(0, -1).join(', ') + ' et ' + montres.at(-1)
}

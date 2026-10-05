/**
 * Supprimer un élément du jeu — seulement s'il ne sert nulle part.
 *
 * « 🗑 Vider » efface le DESSIN d'une tuile mais garde son nom ; supprimer,
 * c'est ôter l'élément du programme : sa déclaration et ce qui l'accompagne
 * (table de palettes, marques d'étiquettes, de palette, de verrou). Un nom
 * ôté alors qu'une ligne s'en sert encore — « poser(5, 5, SOL); » — casserait
 * le programme : la suppression est donc REFUSÉE tant que l'élément est
 * utilisé, n'importe où dans le projet (tous les onglets), et la page dit où.
 *
 * Elle est refusée aussi pour un élément verrouillé (voir verrous.js) : un
 * modèle ne se modifie pas, il ne se supprime pas non plus.
 *
 * « Utilisé » veut dire : le nom (ou sa table « NOM_PALETTES ») apparaît dans
 * le CODE en dehors de l'élément lui-même. Les commentaires et les textes
 * entre guillemets ne comptent pas — « // le décor SOL » ne sert à rien.
 *
 * Éléments pris en charge : Tuile, Perso, Grand, Air, et les cartes (le bloc
 * « carte » et son défilement). Les scènes et les couleurs ne se suppriment
 * pas ici : une scène est tissée dans tout le jeu.
 *
 * Fonctions PURES : elles reçoivent les fichiers (paires [nom, texte]) et
 * rendent ce qu'il faut ; la page pose le résultat et garde de quoi annuler.
 */

import { lireDessins } from './editeur-tuiles.js'
import { lireAirs } from './editeur-airs.js'
import { estVerrouille } from './verrous.js'

const SAUT = '\n'
const echapper = (nom) => nom.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/**
 * Le texte où les commentaires et les textes entre guillemets sont remplacés
 * par des espaces — même longueur, mêmes sauts de ligne : une position y
 * désigne la même place que dans le vrai texte.
 */
export function sansCommentaires(texte) {
  let sortie = ''
  let i = 0
  const blanc = (morceau) => morceau.replace(/[^\n]/g, ' ')
  while (i < texte.length) {
    if (texte.startsWith('//', i)) {
      const fin = texte.indexOf(SAUT, i)
      const j = fin < 0 ? texte.length : fin
      sortie += blanc(texte.slice(i, j)); i = j
    } else if (texte.startsWith('/*', i)) {
      const fin = texte.indexOf('*/', i + 2)
      const j = fin < 0 ? texte.length : fin + 2
      sortie += blanc(texte.slice(i, j)); i = j
    } else if (texte[i] === '"' || texte[i] === "'") {
      const q = texte[i]
      let j = i + 1
      while (j < texte.length && texte[j] !== q && texte[j] !== SAUT) j += texte[j] === '\\' ? 2 : 1
      j = Math.min(texte.length, j + 1)
      sortie += blanc(texte.slice(i, j)); i = j
    } else {
      sortie += texte[i]; i++
    }
  }
  return sortie
}

/** Du début de la ligne de `debut` jusqu'après la ligne de `fin`, et les lignes qui l'accompagnent. */
function etendre(texte, debut, fin, nom) {
  const a = texte.lastIndexOf(SAUT, debut - 1) + 1
  let b = texte.indexOf(SAUT, fin)
  b = b < 0 ? texte.length : b + 1
  const n = echapper(nom)
  const accompagne = new RegExp(`^[ \\t]*(?:const\\s+uint8_t\\s+${n}_PALETTES\\b|/\\* ${n} : (?:étiquettes|palette|verrouillé)(?=[\\s*]))`)
  for (;;) {
    const finLigne = texte.indexOf(SAUT, b)
    const ligne = texte.slice(b, finLigne < 0 ? texte.length : finLigne)
    if (b >= texte.length || !accompagne.test(ligne)) break
    b = finLigne < 0 ? texte.length : finLigne + 1
  }
  return { debut: a, fin: b }
}

/**
 * Où l'élément est écrit dans ce texte : { debut, fin } (lignes entières), ou null.
 * `genre` : 'dessin' (Tuile, Perso, Grand), 'air', 'carte'.
 */
export function placeDeLElement(texte, nom, genre) {
  if (genre === 'dessin') {
    const d = lireDessins(texte).find((x) => x.nom === nom)
    return d ? etendre(texte, d.debut, d.fin, nom) : null
  }
  if (genre === 'air') {
    const a = lireAirs(texte).find((x) => x.nom === nom)
    return a ? etendre(texte, a.debut, a.fin, nom) : null
  }
  if (genre === 'carte') {
    const debut = texte.indexOf(`/* --- carte "${nom}" --- */`)
    const marqueFin = `/* --- fin de la carte "${nom}" --- */`
    const fin = texte.indexOf(marqueFin, debut)
    if (debut < 0 || fin < 0) return null
    return etendre(texte, debut, fin + marqueFin.length, nom)
  }
  return null
}

/** Le bloc de défilement d'une carte, s'il y en a un. */
function placeDuDefilement(texte, nom) {
  const debut = texte.indexOf(`/* --- défilement "${nom}" --- */`)
  const marqueFin = `/* --- fin du défilement "${nom}" --- */`
  const fin = texte.indexOf(marqueFin, debut)
  if (debut < 0 || fin < 0) return null
  return etendre(texte, debut, fin + marqueFin.length, nom)
}

/**
 * Chaque endroit du projet qui se sert de cet élément, hors de lui-même.
 * Rend [{ fichier, ligne, texte }] — la ligne de code, telle qu'écrite.
 */
export function utilisations(fichiers, nom, genre) {
  const trouvees = []
  const motif = new RegExp(`(?<![\\w])(?:${echapper(nom)}|${echapper(nom)}_PALETTES)(?![\\w])`, 'g')
  for (const [fichier, texte] of fichiers) {
    const propre = sansCommentaires(texte)
    const exclues = [placeDeLElement(texte, nom, genre), genre === 'carte' ? placeDuDefilement(texte, nom) : null].filter(Boolean)
    for (const coup of propre.matchAll(motif)) {
      if (exclues.some((z) => coup.index >= z.debut && coup.index < z.fin)) continue
      const ligne = propre.slice(0, coup.index).split(SAUT).length
      trouvees.push({ fichier, ligne, texte: texte.split(SAUT)[ligne - 1].trim() })
    }
  }
  return trouvees
}

/**
 * Compter les utilisations de BEAUCOUP d'éléments d'un coup (« 📦 Tout le
 * jeu ») : chaque fichier est nettoyé UNE fois, ses noms relevés une fois.
 * Rend une fonction (nom, genre) => nombre d'utilisations.
 */
export function compteurDUtilisations(fichiers) {
  const tous = [...fichiers]
  const parNom = new Map() // nom → [{ fichier, position }]
  for (const [fichier, texte] of tous) {
    const propre = sansCommentaires(texte)
    for (const coup of propre.matchAll(/[A-Za-z_]\w*/g)) {
      if (!parNom.has(coup[0])) parNom.set(coup[0], [])
      parNom.get(coup[0]).push({ fichier, position: coup.index })
    }
  }
  const textes = new Map(tous)
  return (nom, genre) => {
    const places = new Map()
    for (const [fichier, texte] of textes) {
      places.set(fichier, [placeDeLElement(texte, nom, genre), genre === 'carte' ? placeDuDefilement(texte, nom) : null].filter(Boolean))
    }
    return [...(parNom.get(nom) ?? []), ...(parNom.get(`${nom}_PALETTES`) ?? [])]
      .filter(({ fichier, position }) => !places.get(fichier).some((z) => position >= z.debut && position < z.fin))
      .length
  }
}

/**
 * Pourquoi on ne peut pas supprimer cet élément — ou null si on le peut.
 * Rend { pourquoi, utilisations } : la phrase, et la liste des endroits.
 */
export function refusDeSuppression(fichiers, nom, genre) {
  const tous = [...fichiers]
  const ou = tous.find(([, texte]) => placeDeLElement(texte, nom, genre))
  if (!ou) return { pourquoi: `« ${nom} » n’est écrit nulle part dans le programme.`, utilisations: [] }
  if (genre === 'dessin' && estVerrouille(ou[1], nom)) {
    return { pourquoi: `🔒 ${nom} est verrouillé : un modèle ne se supprime pas. « 🔓 Déverrouiller » d’abord.`, utilisations: [] }
  }
  const emplois = utilisations(tous, nom, genre)
  if (emplois.length) {
    const premiers = emplois.slice(0, 3).map((e) => `${e.fichier}, ligne ${e.ligne} : ${e.texte}`).join(' ; ')
    return {
      pourquoi: `${nom} est utilisé ${emplois.length} fois dans le projet — impossible de le supprimer sans casser le jeu. ` +
        `${premiers}${emplois.length > 3 ? ' ; …' : ''}. Retire d’abord ces lignes.`,
      utilisations: emplois,
    }
  }
  return null
}

/**
 * Supprime l'élément s'il ne sert à rien. Rend { fichiers: Map, refus } —
 * `refus` est null quand c'est fait, sinon le refus et rien ne change.
 */
export function supprimerLElement(fichiers, nom, genre) {
  const tous = new Map(fichiers)
  const refus = refusDeSuppression(tous, nom, genre)
  if (refus) return { fichiers: tous, refus }
  for (const [fichier, texte] of tous) {
    let reste = texte
    for (const place of [genre === 'carte' ? placeDuDefilement(reste, nom) : null].filter(Boolean)) {
      reste = reste.slice(0, place.debut) + reste.slice(place.fin)
    }
    const place = placeDeLElement(reste, nom, genre)
    if (!place) continue
    reste = reste.slice(0, place.debut) + reste.slice(place.fin)
    tous.set(fichier, reste)
  }
  return { fichiers: tous, refus: null }
}

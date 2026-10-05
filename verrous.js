/**
 * Verrouiller un dessin : on s'en sert, on ne le modifie plus.
 *
 * Un personnage (ou une tuile) bien fini devient un MODÈLE — comme une
 * classe : chaque « sprite16(numero, x, y, MARIO) » en fait un exemplaire à
 * l'écran, et l'original, lui, ne doit plus bouger. Le verrou le garantit
 * dans l'atelier :
 *
 *   Perso MARIO = { … };
 *   /* MARIO : verrouillé *\/
 *
 * La marque est écrite DANS le code, juste sous le dessin, comme les marques
 * d'étiquettes et de palette : elle s'enregistre avec le projet, voyage avec
 * le dessin quand on le range dans personnages.cpp, et se relit à l'œil.
 *
 * Ce que le verrou protège — « le texte protégé » d'un dessin :
 *   - sa déclaration, rangées comprises ;
 *   - sa table de palettes (« MARIO_PALETTES »), s'il en a une.
 *
 * Ce module est PUR : il compare deux textes et dit ce qui serait refusé.
 * C'est la page qui refuse (l'éditeur de code, les ateliers), et elle seule
 * pose ou ôte la marque (🔒 / 🔓), sans passer par ce garde.
 *
 * Ce n'est pas une sécurité : un fichier ouvert dans le Bloc-notes, hors de
 * l'atelier, reste modifiable. C'est un garde-fou contre les erreurs.
 */

import { lireDessins } from './editeur-tuiles.js'

const SAUT = '\n'
const echapper = (nom) => nom.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const motifMarque = (nom) => new RegExp(`^[ \\t]*/\\* ${echapper(nom)} : verrouillé \\*/.*$`, 'm')
const MOTIF_TOUTES = /^[ \t]*\/\* ([A-Za-z_]\w*) : verrouillé \*\//gm
const motifPalettes = (nom) => new RegExp(`^[ \\t]*const\\s+uint8_t\\s+${echapper(nom)}_PALETTES\\b.*$`, 'm')

/** Les noms verrouillés de ce texte. */
export function nomsVerrouilles(texte) {
  return new Set([...texte.matchAll(MOTIF_TOUTES)].map((m) => m[1]))
}

export const estVerrouille = (texte, nom) => motifMarque(nom).test(texte)

/**
 * Pose (oui) ou ôte (non) la marque de verrou d'un dessin.
 * La marque se place juste sous le dessin — et sous sa table de palettes,
 * s'il en a une, pour ne pas la séparer de lui.
 */
export function verrouiller(texte, nom, oui) {
  const marque = motifMarque(nom)
  if (!oui) return texte.replace(new RegExp(marque.source + '\\n?', 'm'), '')
  if (marque.test(texte)) return texte
  const dessin = lireDessins(texte).find((d) => d.nom === nom)
  if (!dessin) return texte
  let fin = texte.indexOf(SAUT, dessin.fin)
  fin = fin < 0 ? texte.length : fin + 1
  /* Les lignes qui accompagnent le dessin restent collées à lui : la marque vient après. */
  for (;;) {
    const finLigne = texte.indexOf(SAUT, fin)
    const ligne = texte.slice(fin, finLigne < 0 ? texte.length : finLigne)
    const accompagne = new RegExp(`^[ \\t]*(?:const\\s+uint8_t\\s+${echapper(nom)}_PALETTES\\b|/\\* ${echapper(nom)} : (?:étiquettes|palette)\\b)`)
    if (fin >= texte.length || !accompagne.test(ligne)) break
    fin = finLigne < 0 ? texte.length : finLigne + 1
  }
  const avant = texte.slice(0, fin)
  const ligne = `/* ${nom} : verrouillé */   // 🔒 on s'en sert, on ne le modifie plus — 🔓 dans l'atelier pour le changer`
  return (avant.endsWith(SAUT) || avant === '' ? avant : avant + SAUT) + ligne + SAUT + texte.slice(fin)
}

/** Le texte protégé d'un dessin : sa déclaration, et sa table de palettes. */
function texteProtege(texte, nom) {
  const dessin = lireDessins(texte).find((d) => d.nom === nom)
  if (!dessin) return null
  const palettes = texte.match(motifPalettes(nom))?.[0].trim() ?? ''
  return texte.slice(dessin.debut, dessin.fin) + SAUT + palettes
}

/**
 * Ce que ce changement ferait aux dessins verrouillés de `avant`.
 *
 *   modifies  : présents avant et après, mais changés     → toujours refusé
 *   disparus  : présents avant, absents après              → refusé à la frappe
 *   deverrouilles : le dessin est intact, la marque a disparu → refusé à la frappe
 *
 * Rend { modifies: [noms], disparus: [noms], deverrouilles: [noms] }.
 */
export function atteintesAuxVerrous(avant, apres) {
  const resultat = { modifies: [], disparus: [], deverrouilles: [] }
  if (avant === apres) return resultat
  for (const nom of nomsVerrouilles(avant)) {
    const a = texteProtege(avant, nom)
    if (a === null) continue // marque orpheline : rien à protéger
    const b = texteProtege(apres, nom)
    if (b === null) resultat.disparus.push(nom)
    else if (a !== b) resultat.modifies.push(nom)
    else if (!estVerrouille(apres, nom)) resultat.deverrouilles.push(nom)
  }
  return resultat
}

/** La phrase à montrer quand un changement est refusé. */
export function phraseDuRefus({ modifies, disparus, deverrouilles }) {
  const noms = [...new Set([...modifies, ...disparus, ...deverrouilles])]
  if (!noms.length) return ''
  const liste = noms.join(', ')
  const un = noms.length === 1
  return `🔒 ${liste} ${un ? 'est verrouillé' : 'sont verrouillés'} : on ${un ? 's’en' : 's’en'} sert, on ne ${un ? 'le' : 'les'} modifie pas. ` +
    `Pour ${un ? 'le' : 'les'} changer, « 🔓 Déverrouiller » (▦ Les tuiles ou 📦 Tout le jeu) ; ` +
    'pour une version différente, « ⧉ Créer une variante ».'
}

/**
 * Écrire les « #include » qu'un programme emploie sans les avoir écrits.
 *
 *   avecLesInclusions('int main() { texte(1, 1, "A"); … }')
 *     →  #include <texte>   // écrit un texte à l’écran
 *
 *        int main() { texte(1, 1, "A"); … }
 *
 * Le compilateur sait ce qui manque : on le compile en lui demandant de
 * RELEVER au lieu de refuser, et l'on écrit une ligne par nom, dans l'ordre où
 * le programme les emploie. Rien n'est deviné, rien n'est en trop.
 *
 * Les lignes vont en tête, après le commentaire d'ouverture s'il y en a un :
 * c'est là qu'on les cherche en lisant un programme.
 */

import { analyser } from './analyseur.js'
import { compiler } from './emetteur.js'
import { assemblerAvec, BIBLIOTHEQUES } from './inclusion.js'

/** Les noms à inclure qui manquent, dans l'ordre du programme. */
export function inclusionsQuiManquent(code, fichiers = {}) {
  const { texte } = assemblerAvec(code, fichiers)
  const rendu = compiler(analyser(texte), { releverInclusions: true })
  return rendu.inclusionsManquantes.map((m) => m.nom)
}

/**
 * Les lignes « #include <nom> », alignées, chacune avec ce qu'elle apporte en
 * commentaire — sans commentaire si `commentaires` est faux.
 */
export function lignesDInclusion(noms, commentaires = true) {
  const largeur = Math.max(...noms.map((nom) => nom.length))
  return noms.map((nom) => (commentaires
    ? `#include <${nom}>${' '.repeat(largeur - nom.length)}   // ${BIBLIOTHEQUES[nom]}`
    : `#include <${nom}>`))
}

/** Où écrire les lignes : après le commentaire d'ouverture et les lignes vides. */
function pointDInsertion(lignes) {
  let i = 0
  let dansUnBloc = false
  for (; i < lignes.length; i++) {
    const ligne = lignes[i].trim()
    if (dansUnBloc) {
      if (ligne.includes('*/')) dansUnBloc = false
      continue
    }
    if (ligne === '' || ligne.startsWith('//')) continue
    if (ligne.startsWith('/*')) {
      dansUnBloc = !ligne.includes('*/', 2)
      continue
    }
    break
  }
  /* Les lignes vides juste avant le code restent après les « #include ». */
  while (i > 0 && lignes[i - 1].trim() === '') i--
  return i
}

/**
 * Le programme, avec ses « #include » manquants écrits en tête. Rend le texte
 * tel quel s'il ne manque rien.
 */
export function avecLesInclusions(code, fichiers = {}, { commentaires = true } = {}) {
  const noms = inclusionsQuiManquent(code, fichiers)
  if (!noms.length) return code
  const finDeLigne = code.includes('\r\n') ? '\r\n' : '\n'
  const lignes = code.split(/\r?\n/)
  const ou = pointDInsertion(lignes)
  const bloc = lignesDInclusion(noms, commentaires)
  const avant = lignes.slice(0, ou)
  const apres = lignes.slice(ou)
  /* Une ligne vide sépare le commentaire d'ouverture, les « #include » et le code. */
  if (avant.length) bloc.unshift('')
  if (apres.length && apres[0].trim() !== '' && !/^\s*#\s*include/.test(apres[0])) bloc.push('')
  return [...avant, ...bloc, ...apres].join(finDeLigne)
}

/**
 * Les « #include » manquants, écrits TOUT EN HAUT du programme — première
 * ligne, avant même le commentaire d'ouverture. C'est ce que font la question
 * « Il manque … : l'ajouter ? » et le bouton rouge, dans l'atelier et le
 * tuto. Rend { texte, noms } ; `noms` est vide s'il ne manque rien.
 */
export function inclusionsEnTete(code, fichiers = {}) {
  const noms = inclusionsQuiManquent(code, fichiers)
  if (!noms.length) return { texte: code, noms }
  const finDeLigne = code.includes('\r\n') ? '\r\n' : '\n'
  return { texte: lignesDInclusion(noms).join(finDeLigne) + finDeLigne + code, noms }
}

/*
 * Le test rapide, sur le texte seul : un nom de la console écrit quelque part
 * (« texte(», « Tuile », « ALPHABET »…) sans sa ligne « #include ». Faux
 * positif possible (un mot dans un commentaire) : on compile alors pour rien,
 * c'est tout. Il évite de recompiler à chaque pixel peint dans l'atelier.
 */
const CALCULS = new Set(['multiplier', 'diviser', 'reste', 'decaler'])
export function peutManquer(code) {
  for (const nom of Object.keys(BIBLIOTHEQUES)) {
    if (CALCULS.has(nom)) continue
    if (!new RegExp(`\\b${nom}\\b`).test(code)) continue
    if (!new RegExp(`#\\s*include\\s*<\\s*${nom}\\s*>`).test(code)) return true
  }
  return false
}

/**
 * Pour l'atelier : ce que ses éditeurs viennent d'écrire (un dessin, un air,
 * une scène) reçoit ses « #include ». Un programme qui ne compile pas pour
 * une autre raison reste tel quel : le compilateur dira pourquoi.
 */
export function completerLesInclusions(code, fichiers = {}) {
  if (!peutManquer(code) && !Object.values(fichiers).some(peutManquer)) return code
  try {
    return avecLesInclusions(code, fichiers)
  } catch {
    return code
  }
}

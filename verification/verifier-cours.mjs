/**
 * Le cours « Apprendre à programmer » : chaque leçon compile-t-elle, et
 * fait-elle ce qu'elle promet ?
 *
 *   node verification/verifier-cours.mjs
 *
 * Le même banc que `verifier-tuto.mjs`, sur les leçons de
 * `tuto/programmation.js` : compiler, faire tourner dans l'émulateur, appuyer
 * sur de vraies touches, contrôler.
 */

import { COURS, CHAPITRES } from '../tuto/programmation.js'
import { consoleDuProgramme } from '../tuto/console.mjs'

let echecs = 0
let controles = 0
let chapitre = 0

for (const [index, lecon] of COURS.entries()) {
  if (lecon.difficulte !== chapitre) {
    chapitre = lecon.difficulte
    console.log()
    console.log(`  CHAPITRE ${chapitre} — ${CHAPITRES[chapitre]}`)
  }

  console.log()
  console.log(`  ${index + 1}. ${lecon.titre}`)

  let laConsole
  let octets
  try {
    const bati = consoleDuProgramme(lecon.code, lecon.titre, true, lecon.fichiers ?? {})   // ses fichiers voisins aussi (chapitre 15)
    laConsole = bati.laConsole
    octets = bati.octets
  } catch (erreur) {
    console.log(`     NON elle ne compile pas — ${erreur.message}`)
    echecs++
    controles++
    continue
  }

  let resultats
  try {
    resultats = lecon.controle(laConsole)
  } catch (erreur) {
    console.log(`     NON le contrôle a échoué — ${erreur.message}`)
    echecs++
    controles++
    continue
  }

  console.log(`     (${octets.length} octets)`)

  for (const [quoi, bon, detail] of resultats) {
    console.log(`     ${bon ? 'OK ' : 'NON'} ${quoi}${detail ? ' ' + detail : ''}`)
    controles++
    if (!bon) echecs++
  }
}

console.log()
console.log(`  ${COURS.length} leçons, ${controles} contrôles`)
console.log(echecs ? `${echecs} en échec` : 'tout est vert')
process.exit(echecs ? 1 : 0)

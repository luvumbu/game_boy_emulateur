/**
 * Chaque leçon du tutoriel compile-t-elle, et fait-elle ce qu'elle promet ?
 *
 *   node verifier-tuto.mjs
 *
 * On ne relit pas les explications : on compile le programme de chaque leçon,
 * on le fait tourner dans l'émulateur du projet, on appuie sur de vraies
 * touches, et on contrôle ce que la leçon annonce.
 *
 * Un tutoriel dont le code ne marche pas est pire qu'aucun tutoriel : le
 * lecteur croit avoir mal compris.
 */

import { LECONS } from '../tuto/lecons.js'
import { consoleDuProgramme } from '../tuto/console.mjs'

let echecs = 0
let controles = 0

for (const [index, lecon] of LECONS.entries()) {
  console.log()
  console.log(`  ${index + 1}. ${lecon.titre}`)

  /* --- elle doit d'abord compiler, puis tourner --- */
  let laConsole
  let octets
  let variables
  try {
    const bati = consoleDuProgramme(lecon.code, lecon.titre)
    laConsole = bati.laConsole
    octets = bati.octets
    variables = bati.variables
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

  console.log(`     (${octets.length} octets, ${variables.size} variable${variables.size > 1 ? 's' : ''})`)

  for (const [quoi, bon, detail] of resultats) {
    console.log(`     ${bon ? 'OK ' : 'NON'} ${quoi}${detail ? ' ' + detail : ''}`)
    controles++
    if (!bon) echecs++
  }
}

console.log()
console.log(`  ${LECONS.length} leçons, ${controles} contrôles`)
console.log(echecs ? `${echecs} en échec` : 'tout est vert')
process.exit(echecs ? 1 : 0)

/**
 * Relire une cartouche, en ligne de commande.
 *
 *   node desassembler.mjs exemples/minimal.gb
 *   node desassembler.mjs exemples/minimal.cpp        (compilé au passage)
 *   node desassembler.mjs exemples/mario.gb 0x0150 200
 *
 * Un `.cpp` est compilé avant d'être relu — et alors le désassemblage porte
 * **les noms du programme** : « ld a, [posX] », « call fn_dessinerColonne ».
 * Un `.gb` venu d'ailleurs n'a plus ces noms : personne ne les a gardés.
 */

import { readFileSync } from 'node:fs'
import { basename, dirname, join, extname } from 'node:path'

import { analyser } from '../compilateur/analyseur.js'
import { compiler } from '../compilateur/emetteur.js'
import { fabriquer } from '../compilateur/cartouche.js'
import { rassembler } from '../compilateur/inclusion.js'
import { desassembler, enTete } from '../desassembleur.js'

const chemin = process.argv[2]
if (!chemin) {
  console.error('usage : node desassembler.mjs <cartouche.gb | programme.cpp> [depuis] [combien]')
  process.exit(1)
}

/* --- la cartouche, et ce qu'on sait d'elle --- */

let octets
let noms = new Map()

if (extname(chemin) === '.cpp') {
  const dossier = dirname(chemin)
  const lire = (nom) => readFileSync(nom === basename(chemin) ? chemin : join(dossier, nom), 'utf8')
  const assemble = rassembler(lire, basename(chemin))
  const rendu = compiler(analyser(assemble.texte))
  octets = fabriquer(rendu.octets, rendu.base, basename(chemin, '.cpp'), rendu.vecteurVBlank)

  /*
   * Les noms du programme, rendus aux adresses.
   *
   * C'est toute la différence : le compilateur vient d'attribuer ces adresses,
   * il sait donc que $FF8B est « posX ». Une cartouche relue sans cette table
   * ne peut que montrer des nombres — non parce que le désassembleur est
   * faible, mais parce que le nom n'existe nulle part dans les octets.
   */
  for (const [nom, adresse] of rendu.variables) noms.set(adresse, nom)

  /* Les routines de la console — « EcrireTexte », « AttendreImage », « Notes ».
     Elles ne viennent pas du programme, mais elles disent ce qu'il demande à
     la machine, et c'est souvent la ligne la plus parlante du listing. */
  for (const [etiquette, ou] of rendu.etiquettes ?? []) noms.set(rendu.base + ou, etiquette)

  /* Les fonctions écrites par l'utilisateur passent en dernier : leur nom vaut
     mieux que l'étiquette « fn_… » que le compilateur leur a donnée. */
  for (const [nom, signature] of rendu.fonctions) {
    const ou = rendu.etiquettes?.get(signature.etiquette)
    if (ou !== undefined) noms.set(rendu.base + ou, nom + '()')
  }
} else {
  octets = new Uint8Array(readFileSync(chemin))
}

const entete = enTete(octets)
console.log(`${chemin}`)
console.log(`  « ${entete.titre} » — ${entete.romKo} Ko, ${entete.type}`)
console.log(`  le programme commence en $${entete.point.toString(16).padStart(4, '0')}`)
console.log(`  ${noms.size ? noms.size + ' noms retrouvés (la cartouche vient d’être compilée)' : 'aucun nom : la cartouche ne les porte pas'}`)
console.log()

/* --- le désassemblage --- */

const depuis = process.argv[3] ? Number(process.argv[3]) : entete.point
const combien = process.argv[4] ? Number(process.argv[4]) : 60

const lignes = desassembler(octets, {
  depuis,
  jusqu: Math.min(octets.length, depuis + combien * 3),
  base: 0,
  noms,
})

for (const ligne of lignes.slice(0, combien)) {
  if (ligne.etiquette) console.log(`\n${ligne.etiquette} :`)
  const bruts = ligne.octets.map((o) => o.toString(16).padStart(2, '0')).join(' ')
  const dit = ligne.veutDire ? '   ; ≈ ' + ligne.veutDire : ''
  console.log(`  ${ligne.adresse.toString(16).padStart(4, '0')}  ${bruts.padEnd(9)}  ${ligne.texte.padEnd(24)}${dit}`)
}

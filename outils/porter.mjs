/**
 * Porter un programme gameboy2 vers gameboy3, en ligne de commande.
 *
 *   node porter.mjs ../gameboy2/exemples/tetris.js exemples/tetris.cpp
 *
 * Le travail est fait par `traduction.js` ; ici on lit, on assemble les
 * fichiers inclus, et on écrit.
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { basename, dirname, join } from 'node:path'
import { rassembler } from '../../gameboy2/compilateur/inclusion.js'
import { versCpp } from './traduction.js'

const entree = process.argv[2]
const sortie = process.argv[3]
if (!entree || !sortie) {
  console.error('usage : node porter.mjs <programme.js> <programme.cpp>')
  process.exit(1)
}

const dossier = dirname(entree)
const lire = (nom) => readFileSync(nom === basename(entree) ? entree : join(dossier, nom), 'utf8')

const texte = versCpp(rassembler(lire, basename(entree)).texte, [
  `// Porté depuis ${basename(entree)} par « node porter.mjs ».`,
  '//',
  '// Le portage est littéral : il donne un programme juste, non un programme',
  "// idiomatique. Les variables globales qui servaient d'arguments faute de",
  '// mieux méritent de redevenir des arguments, et les portées de reprendre',
  "// leur place — c'est là tout l'intérêt d'être passé au C++.",
])

writeFileSync(sortie, texte)
console.log(`${sortie}`)
console.log(`  ${texte.split(String.fromCharCode(10)).length} lignes de C++`)

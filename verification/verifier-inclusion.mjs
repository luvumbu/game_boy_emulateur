/**
 * Écrire sur plusieurs fichiers change-t-il quelque chose à la cartouche ?
 *
 *   node verifier-inclusion.mjs
 *
 * La réponse doit être **non**, et c'est tout l'intérêt : `#include` est une
 * directive de texte, résolue avant le lexeur, comme le préprocesseur de C++. Un programme découpé en quatre
 * fichiers doit rendre la même cartouche que le fichier collé — à l'octet
 * près. Si ce n'était pas le cas, découper un programme deviendrait un pari.
 *
 * On le vérifie en découpant vraiment `exemples/ecrans.cpp`, puis en comparant
 * les 32 768 octets des deux cartouches.
 */

import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { analyser } from '../compilateur/analyseur.js'
import { compiler } from '../compilateur/emetteur.js'
import { fabriquer } from '../compilateur/cartouche.js'
import { rassembler, traduire, fichiersDemandes } from '../compilateur/inclusion.js'

let echecs = 0
const controle = (quoi, bon, detail = '') => {
  console.log('  ' + (bon ? 'OK ' : 'NON') + ' ' + quoi + detail)
  if (!bon) echecs++
}

console.log('PLUSIEURS FICHIERS, UNE SEULE CARTOUCHE')
console.log()

const dossier = 'exemples/decoupe'
rmSync(dossier, { recursive: true, force: true })
mkdirSync(dossier, { recursive: true })

/* --- on découpe « ecrans.js » en quatre --- */

const entier = readFileSync('exemples/ecrans.cpp', 'utf8').replace(/\r\n/g, '\n')

const coupe = (debut, fin) => {
  const i = entier.indexOf(debut)
  const j = fin ? entier.indexOf(fin) : entier.length
  if (i < 0 || j < 0) throw new Error(`découpe impossible : « ${debut} » ou « ${fin} » introuvable`)
  return entier.slice(i, j)
}

/*
 * Quatre morceaux, plus « principal.cpp » : cinq fichiers.
 *
 * Le découpage suivait autrefois la frontière « void effacer() », que
 * l'exemple écrivait à la main. Cette fonction est devenue une fonction de la
 * console — « effacer() » sans argument vide toute la carte —, et l'exemple
 * n'a plus à l'écrire. On coupe donc sur l'écran de titre, qui est une
 * frontière du même genre : un fichier, un rôle.
 */
const morceaux = {
  'mesures.cpp': coupe('uint8_t TITRE', 'void dessinerTitre()'),
  'titre.cpp': coupe('void dessinerTitre()', 'void dessinerJeu()'),
  'dessins.cpp': coupe('void dessinerJeu()', 'void allerA()'),
  'jeu.cpp': coupe('void allerA()'),
}

for (const [nom, texte] of Object.entries(morceaux)) {
  writeFileSync(join(dossier, nom), texte)
}

writeFileSync(join(dossier, 'principal.cpp'), [
  '// Le même programme que « ecrans.cpp », mais sur cinq fichiers.',
  '//',
  '//   node outils/gb3.mjs exemples/decoupe/principal.cpp',
  '//',
  '// « #include » verse le fichier voisin à cet endroit, avant que le',
  '// compilateur ne voie quoi que ce soit — c’est ce que fait le préprocesseur',
  '// de C++. L’ordre compte pour les variables : une globale doit être versée',
  '// avant la fonction qui la nomme, comme si tout était collé bout à bout.',
  '',
  /* Les fonctions de la console que l'exemple inclut : elles restent ici, en tête. */
  ...entier.split('\n').filter((ligne) => /^#include </.test(ligne)),
  '',
  '#include "mesures.cpp"',
  '#include "titre.cpp"',
  '#include "dessins.cpp"',
  '#include "jeu.cpp"',
  '',
].join('\n'))

/* --- on compile les deux --- */

const lire = (nom) => readFileSync(join(dossier, nom), 'utf8')

const romDe = (texte) => {
  const { octets, base, vecteurVBlank } = compiler(analyser(texte))
  return { rom: fabriquer(octets, base, 'ECRANS', vecteurVBlank), octets: octets.length }
}

const seul = romDe(entier)

const assemble = rassembler(lire, 'principal.cpp')
const decoupe = romDe(assemble.texte)

controle('le programme d’un seul fichier compile', seul.octets > 0, ` (${seul.octets} octets)`)
controle('celui de cinq fichiers aussi', decoupe.octets > 0, ` (${decoupe.octets} octets)`)
controle('les cinq fichiers sont bien tous lus',
  new Set(assemble.origine.map((o) => o.fichier)).size === 5,
  ` (${[...new Set(assemble.origine.map((o) => o.fichier))].join(', ')})`)

const pareil = seul.rom.length === decoupe.rom.length && seul.rom.every((v, i) => v === decoupe.rom[i])
controle('les deux cartouches sont IDENTIQUES, octet pour octet', pareil,
  pareil ? ` (${seul.rom.length} octets)` : ` (${seul.rom.findIndex((v, i) => v !== decoupe.rom[i])} : premier écart)`)

/* --- ce que la directive sait faire d'autre --- */

controle('les fichiers demandés se lisent d’avance',
  fichiersDemandes(lire('principal.cpp')).join(' ') === 'mesures.cpp titre.cpp dessins.cpp jeu.cpp')

/* Inclure deux fois ne verse qu'une fois : sans cela, deux fichiers qui
   partagent une même dépendance déclareraient tout en double. */
writeFileSync(join(dossier, '_deuxfois.cpp'), [
  '#include "mesures.cpp"',
  '#include "mesures.cpp"',
  '#include "titre.cpp"',
  '#include "dessins.cpp"',
  '#include "jeu.cpp"',
  '',
].join('\n'))
const deuxFois = rassembler(lire, '_deuxfois.cpp')
const lignesMesures = lire('mesures.cpp').split(String.fromCharCode(10)).length
const versees = deuxFois.origine.filter((o) => o.fichier === 'mesures.cpp').length
controle('un fichier inclus deux fois n’est versé qu’une fois', versees === lignesMesures,
  ` (${versees} lignes versées, le fichier en compte ${lignesMesures})`)

/*
 * Un cycle ne doit pas faire tourner le compilateur pour toujours.
 *
 * Ce n'est PAS un refus, et c'est une leçon : j'avais écrit un garde-fou
 * séparé contre les cycles, et le contrôle a montré qu'il n'était jamais
 * atteint. La règle « versé une seule fois » les casse déjà : un fichier
 * qui reviendrait sur lui-même est déjà dans la liste. Le garde-fou a été
 * retiré plutôt que gardé comme décoration.
 */
writeFileSync(join(dossier, '_boucleA.cpp'), '#include "_boucleB.cpp"\n')
writeFileSync(join(dossier, '_boucleB.cpp'), '#include "_boucleA.cpp"\n')
const cycle = rassembler(lire, '_boucleA.cpp')
const fichiersDuCycle = new Set(cycle.origine.map((o) => o.fichier))
controle('un cycle entre deux fichiers ne boucle pas', fichiersDuCycle.size <= 2,
  ` (${fichiersDuCycle.size} fichier(s) lus, chacun une fois)`)

/* Une erreur doit désigner le BON fichier et la BONNE ligne. */
writeFileSync(join(dossier, '_faute.cpp'), 'int main() {\n  dessiner(1, 2);\n}\n')
writeFileSync(join(dossier, '_avecFaute.cpp'), '#include "mesures.cpp"\n#include "_faute.cpp"\n')
const avecFaute = rassembler(lire, '_avecFaute.cpp')
let messageFaute = ''
try {
  compiler(analyser(avecFaute.texte))
} catch (erreur) {
  messageFaute = traduire(erreur.message, avecFaute.origine)
}
controle('une faute désigne son fichier et sa ligne', messageFaute.includes('_faute.cpp, ligne 2'),
  `\n      « ${messageFaute.slice(0, 96)}… »`)

/* Un fichier manquant se dit clairement. */
let messageManque = ''
try {
  rassembler((nom) => {
    if (nom === 'principal.cpp') return '#include "absent.cpp"\n'
    throw new Error(`fichier introuvable : « ${nom} »`)
  }, 'principal.cpp')
} catch (erreur) {
  messageManque = erreur.message
}
controle('un fichier manquant est nommé', messageManque.includes('absent.cpp'), `\n      « ${messageManque} »`)

/* On laisse la découpe sur le disque : elle sert d'exemple. */
for (const jetable of ['_deuxfois.cpp', '_boucleA.cpp', '_boucleB.cpp', '_faute.cpp', '_avecFaute.cpp']) {
  rmSync(join(dossier, jetable), { force: true })
}

console.log()
console.log(echecs ? echecs + ' contrôle(s) en échec' : 'tout est vert')
process.exit(echecs ? 1 : 0)

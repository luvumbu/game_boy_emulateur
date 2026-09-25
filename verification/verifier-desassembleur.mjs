/**
 * Le désassembleur relit-il vraiment ce que le compilateur a écrit ?
 *
 *   node verifier-desassembleur.mjs
 *
 * Un désassembleur a un seul vrai piège : la LONGUEUR des instructions. Se
 * tromper d'un octet, et tout ce qui suit devient du charabia — mais un
 * charabia plausible, fait d'instructions valides, qu'on peut lire longtemps
 * sans se douter de rien.
 *
 * Le contrôle est donc celui-ci : on compile un programme, on le relit d'un
 * bout à l'autre, et l'on exige de **tomber exactement sur la fin**. Un octet
 * de décalage et la marche s'arrête ailleurs.
 *
 * On vérifie aussi qu'aucune instruction n'est inconnue : tout ce que
 * `emetteur.js` sait écrire, `desassembleur.js` doit savoir le lire.
 */

import { readFileSync } from 'node:fs'

import { analyser } from '../compilateur/analyseur.js'
import { compiler } from '../compilateur/emetteur.js'
import { fabriquer } from '../compilateur/cartouche.js'
import { bulletin } from '../outils/controle.mjs'
import { desassembler, instruction, enTete } from '../desassembleur.js'

const b = bulletin('le désassembleur : relire une cartouche')

/* ------------------------------------------------ la marche ne se décale pas */

const PROGRAMMES = [
  'exemples/minimal.cpp',
  'exemples/lutin.cpp',
  'exemples/langage.cpp',
  'exemples/musique.cpp',
  'exemples/mario.cpp',
  'exemples/tetris.cpp',
]

for (const chemin of PROGRAMMES) {
  const rendu = compiler(analyser(readFileSync(chemin, 'utf8')))
  const octets = rendu.octets

  /*
   * On marche d'instruction en instruction, du début du programme à sa fin.
   *
   * Les tables de données — les tuiles, les textes, les notes — sont du code
   * aux yeux d'un désassembleur : elles se lisent comme des instructions et
   * n'ont aucune raison de finir juste. On s'arrête donc à la première étiquette
   * de données, celle des tuiles, qui vient après tout le code.
   */
  const finDuCode = rendu.etiquettes.get('Tuiles') ?? octets.length

  let ou = 0
  let inconnues = 0
  let combien = 0
  while (ou < finDuCode) {
    const { texte, taille } = instruction(octets, ou)
    if (texte.startsWith('???')) inconnues++
    ou += taille
    combien++
  }

  const nom = chemin.replace('exemples/', '')
  b.egal(`${nom} : la marche tombe juste, au dernier octet`, ou, finDuCode)
  b.egal(`${nom} : aucune instruction inconnue (${combien} lues)`, inconnues, 0)
}

/* ------------------------------------------------ ce qu'on doit reconnaître */

const rendu = compiler(analyser(readFileSync('exemples/minimal.cpp', 'utf8')))
const rom = fabriquer(rendu.octets, rendu.base, 'MINIMAL', rendu.vecteurVBlank)

const entete = enTete(rom)
b.egal('l’entête donne le titre écrit dans la cartouche', entete.titre, 'MINIMAL')
b.egal('et la taille de la cartouche', entete.romKo, 32)
b.egal('et par où le programme commence', entete.point, 0x0150)

/* Les premières instructions sont connues d'avance : c'est la mise en route
   que « compiler() » écrit toujours en premier. */
const debut = desassembler(rom, { depuis: 0x0150, jusqu: 0x0160 })
b.egal('la première instruction coupe les interruptions', debut[0].texte, 'di')
b.egal('la seconde installe la pile', debut[1].texte, 'ld sp, $dfff')
b.verifier('la troisième appelle une routine', debut[2].texte.startsWith('call'), ` (${debut[2].texte})`)

/* ------------------------------------------- les noms rendus aux adresses */

const avecNoms = compiler(analyser(readFileSync('exemples/perso16.cpp', 'utf8')))
const noms = new Map()
for (const [nom, adresse] of avecNoms.variables) noms.set(adresse, nom)
for (const [etiquette, ou] of avecNoms.etiquettes) noms.set(avecNoms.base + ou, etiquette)

const lu = desassembler(new Uint8Array(avecNoms.octets), {
  depuis: 0,
  jusqu: avecNoms.etiquettes.get('Tuiles'),
  base: avecNoms.base,
  noms,
})

const textes = lu.map((l) => l.texte)

/*
 * Le point qui compte.
 *
 * Sans la table du compilateur, la cartouche ne dit que « ldh a, [$80] » — et
 * personne ne peut retrouver « x », ce nom n'entre pas dans les octets. Avec
 * elle, on relit son propre programme.
 */
b.verifier('une variable retrouve son nom', textes.includes('ldh a, [x]'),
  ` (${textes.filter((t) => t.includes('[x]')).length} fois)`)
b.verifier('une routine de la console aussi', textes.some((t) => t === 'call LireManette'))
b.verifier('et les sauts portent une étiquette',
  lu.some((l) => l.etiquette && !l.etiquette.startsWith('$')),
  ` (par exemple « ${lu.find((l) => l.etiquette && !l.etiquette.startsWith('$'))?.etiquette} »)`)

/* Ce qu'une instruction laisse deviner du C++ d'origine. */
b.verifier('un appel dit à quoi il correspond en C++',
  lu.some((l) => l.veutDire === 'bouton(…)'),
  ` (${lu.filter((l) => l.veutDire).length} instructions annotées)`)

/* ------------------------------------------------ chaque forme d'opcode */

/*
 * Les longueurs, une par une.
 *
 * « nop » contient un « n » et ne prend pourtant aucun octet derrière ; c'est
 * exactement le genre de détail qui décale tout un listing sans rien casser
 * d'apparent.
 */
const LONGUEURS = [
  [[0x00], 1, 'nop'],
  [[0x3e, 0x2a], 2, 'ld a, 42'],
  [[0x21, 0x34, 0x12], 3, 'ld hl, $1234'],
  [[0xcd, 0x00, 0x02], 3, 'call $0200'],
  [[0x18, 0xfe], 2, 'jr $0000'],
  [[0xcb, 0x37], 2, 'swap a'],
  [[0x76], 1, 'halt'],
  [[0xe0, 0x40], 2, 'ldh [ECRAN], a'],
  [[0x2a], 1, 'ld a, [hl+]'],
  [[0xc7], 1, 'rst $00'],
]

for (const [octets, taille, attendu] of LONGUEURS) {
  const lue = desassembler(new Uint8Array(octets), {})[0]
  b.egal(`« ${attendu} » se lit en ${taille} octet${taille > 1 ? 's' : ''}`, lue.octets.length, taille)
  b.egal(`et se dit « ${attendu} »`, lue.texte, attendu)
}

b.fin()

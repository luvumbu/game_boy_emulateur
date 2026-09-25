/**
 * Le langage fait-il ce qu'il dit ?
 *
 *   node verifier-langage.mjs
 *
 * `exemples/langage.cpp` calcule vingt-neuf choses et les range dans un
 * tableau. Ici on fait tourner la cartouche dans l'émulateur et l'on relit ce
 * tableau, case par case. Un « switch » qui compile n'aiguille pas forcément ;
 * un « ++ » suffixé peut rendre la valeur d'après sans que rien ne le signale.
 * C'est ce qui se voit ici, et nulle part ailleurs.
 */

import { demarrer, bulletin } from '../outils/controle.mjs'
import { numeroDe, ORDRE } from '../compilateur/police.js'

const b = bulletin('exemples/langage.cpp')
const jeu = demarrer('exemples/langage.cpp', 20)

/* Ce que chaque case doit contenir, dans l'ordre où le programme les écrit. */
const ATTENDU = [
  ['un argument arrive, une valeur repart', 42],
  ['une fonction qui rend deux choses selon un « if »', 7],
  ['une table gravée se lit', 16],
  ['un tableau reçoit son contenu de départ', 9],
  ['« for » et « += »', 10],
  ['« continue » saute un tour, « break » sort', 6],
  ['« do … while » tourne au moins une fois', 4],
  ['« switch » aiguille sur le bon « case »', 1],
  ['un « enum » enchaîne ses valeurs', 101],
  ['et par bits', 8],
  ['ou par bits', 14],
  ['ou exclusif', 6],
  ['décalage à gauche, connu d\'avance', 32],
  ['décalage à droite, connu d\'avance', 25],
  ['décalage d\'une valeur calculée', 32],
  ['complément', 255],
  ['négation', 1],
  ['« ? : »', 11],
  ['les priorités sont celles de C++', 8],
  ['« && » n\'évalue pas sa droite pour rien', 0],
  ['un champ d\'un tableau de « struct »', 20],
  ['un autre champ, une autre case', 2],
  ['« -- » sur un champ', 2],
  ['sizeof d\'une struct', 3],
  ['sizeof d\'une table, divisé par celui d\'une case', 6],
  ['« k++ » rend la valeur d\'AVANT', 5],
  ['et laisse k incrémenté', 6],
  ['« ++k » rend celle d\'APRÈS', 7],
  ['un caractère est un nombre', 1],
  ['« t[i] += n » lit et écrit la même case', 108],
]

ATTENDU.forEach(([quoi, valeur], i) => b.egal(quoi, jeu.caseDe('resultat', i), valeur))

b.egal('le curseur a bien avancé de trente cases', jeu.valeurDe('curseur'), ATTENDU.length)

const mot = [...'TOUT VA BIEN'].map(numeroDe)
b.verifier(
  '« TOUT VA BIEN » est à l\'écran',
  jeu.ecran(4, 8, mot.length).every((v, i) => v === mot[i]),
)

/*
 * Un texte peut porter un nom, et un nombre calculé s'écrire en base dix.
 *
 * Les deux finissent en tuiles à l'écran : c'est là qu'on les relit, et non
 * dans les tables du compilateur. Un « const char » qui serait bien gravé mais
 * mal affiché passerait autrement pour juste.
 */
const lu = (colonne, ligne, combien) => jeu.ecran(colonne, ligne, combien).map((v) => ORDRE[v] ?? '?').join('')

b.egal('un « const char NOM[] » s\'écrit comme des guillemets', lu(4, 10, 11), 'TEXTE NOMME')
b.egal('nombre() écrit les zéros de tête', lu(4, 12, 3), '042')
b.egal('et une valeur calculée', lu(8, 12, 3), '108')
b.egal('un seul chiffre quand on le demande', lu(12, 12, 1), '7')

/*
 * Une colonne ET une ligne lues dans des tables.
 *
 * « poser(XS[i], YS[i], t) » écrivait à une adresse quelconque : le calcul de
 * la colonne se sert de « hl », qui portait déjà l'adresse de la ligne. La
 * tuile n'arrivait nulle part, et rien ne le disait — la case visée restait
 * simplement vide, et l'on cherchait la faute dans son propre programme.
 */
b.egal('poser() prend sa colonne et sa ligne dans deux tables', jeu.ecran(2, 16, 1)[0], 42)
b.egal('et la seconde position aussi', jeu.ecran(17, 16, 1)[0], 42)

/*
 * Effacer, sans compter les lettres.
 *
 * On relit l'ÉCRAN, et non une variable : c'est le nombre de cases vraiment
 * blanchies qui compte. Une longueur juste à un près ne se voit nulle part
 * ailleurs — le programme continue, et il manque une lettre.
 */
b.egal('effacer("…") ôte exactement la longueur du texte', lu(1, 14, 9), '         ')
b.egal('et ne déborde pas sur la case d\'après', lu(1, 15, 5), 'GARDE')
b.egal('effacer() ôte un mot au milieu d\'une ligne', lu(7, 15, 3), '   ')
b.egal('un nombre calculé ôte ce nombre de cases', lu(1, 13, 6), '   DEF')
b.egal('effacer(…, 0) n\'efface AUCUNE case', lu(12, 13, 6), 'INTACT')

b.verifier('l\'écran est allumé', (jeu.gb.mmu.read(0xff40) & 0x80) !== 0)

b.fin()

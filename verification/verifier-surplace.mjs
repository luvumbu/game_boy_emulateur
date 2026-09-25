/**
 * Un dessin écrit là où on le pose arrive-t-il vraiment à l'écran ?
 *
 *   node verifier-surplace.mjs
 *
 * « poser(4, 6, {"########", …}) » demande au compilateur trois choses d'un
 * coup : graver les seize octets de la tuile, lui trouver un numéro, et écrire
 * ce numéro dans la carte de fond. Qu'il compile ne prouve aucune des trois.
 *
 * On fait donc tourner `exemples/surplace.cpp` dans l'émulateur du projet, et
 * l'on relit, dans la console :
 *
 *   1. la CARTE DE FOND — quel numéro de tuile est posé à quelle case ;
 *   2. la MÉMOIRE VIDÉO — les seize octets de cette tuile, comparés à ceux que
 *      le dessin écrit dans le programme doit donner ;
 *   3. la TABLE DES LUTINS — le dessin d'un « sprite », et les quatre quarts
 *      d'un « sprite16 », dans le bon ordre.
 *
 * Et l'on vérifie qu'un même dessin écrit deux fois ne dépense qu'UNE tuile :
 * le matériel n'en tient que 256, et les gaspiller ne se verrait qu'au jour où
 * il n'y en aurait plus.
 */

import { demarrer, bulletin, CARTE_FOND } from '../outils/controle.mjs'
import { analyser } from '../compilateur/analyseur.js'
import { compiler, NUANCES_ECRITES } from '../compilateur/emetteur.js'

const b = bulletin('le dessin écrit sur place')
const jeu = demarrer('exemples/surplace.cpp', 20)

const CARTE_PANNEAU = 0x9c00
const MEMOIRE_TUILES = 0x8000

/**
 * Les deux octets d'une rangée, calculés ICI.
 *
 * On ne demande pas au compilateur ce qu'il aurait dû écrire : on le recalcule
 * depuis les signes du programme, et l'on compare à ce que la console a
 * réellement en mémoire. Réutiliser sa fonction ne prouverait que sa cohérence
 * avec elle-même.
 */
const octetsDeLaRangee = (rangee) => {
  let bas = 0
  let haut = 0
  for (let x = 0; x < 8; x++) {
    const nuance = NUANCES_ECRITES[rangee[x]]
    bas = (bas << 1) | (nuance & 1)
    haut = (haut << 1) | ((nuance >> 1) & 1)
  }
  return [bas, haut]
}

/** Les seize octets d'une tuile, tels qu'ils sont dans la console. */
const tuileEnMemoire = (numero) =>
  Array.from({ length: 16 }, (_, i) => jeu.gb.mmu.read(MEMOIRE_TUILES + numero * 16 + i))

/** Ce que huit rangées de signes doivent donner. */
const tuileAttendue = (rangees) => rangees.flatMap(octetsDeLaRangee)

const caseDuFond = (colonne, ligne) => jeu.gb.mmu.read(CARTE_FOND + ligne * 32 + colonne)
const caseDuPanneau = (colonne, ligne) => jeu.gb.mmu.read(CARTE_PANNEAU + ligne * 32 + colonne)
const lutin = (n) => jeu.gb.mmu.read(0xfe00 + n * 4 + 2)

/** La case (colonne, ligne) montre-t-elle bien CE dessin-là ? */
const montre = (quoi, colonne, ligne, rangees) => {
  const numero = caseDuFond(colonne, ligne)
  const attendu = tuileAttendue(rangees)
  const trouve = tuileEnMemoire(numero)
  const pareil = attendu.every((o, i) => o === trouve[i])
  return b.verifier(quoi, pareil, pareil ? ` (tuile ${numero})` : ` — tuile ${numero} : ${trouve.join(' ')}`)
}

/* ------------------------------------------------------- ce qui est à l'écran */

const NUAGE = [
  '........',
  '..####..',
  '.######.',
  '########',
  '.######.',
  '........',
  '........',
  '........',
]

const TOIT_GAUCHE = [
  '......##',
  '....####',
  '..######',
  '########',
  '########',
  '........',
  '........',
  '........',
]

const TOIT_DROIT = [
  '##......',
  '####....',
  '######..',
  '########',
  '########',
  '........',
  '........',
  '........',
]

const PORTE = [
  '########',
  '#------#',
  '#-####-#',
  '#-#--#-#',
  '#-#--#-#',
  '#-#--#-#',
  '#-#--#-#',
  '########',
]

const SOL = [
  '22222222',
  '21111112',
  '21111112',
  '21111112',
  '21111112',
  '21111112',
  '21111112',
  '22222222',
]

montre('un dessin écrit dans « poser » arrive à l\'écran', 2, 3, NUAGE)
montre('et ce n\'est pas un hasard : la pente gauche du toit aussi', 8, 10, TOIT_GAUCHE)
montre('et la pente droite, qui est un autre dessin', 9, 10, TOIT_DROIT)
montre('et la porte, écrite juste en dessous', 9, 11, PORTE)

/*
 * Le même dessin, écrit deux fois : une seule tuile.
 *
 * Les deux nuages sont à douze lignes d'écart dans le programme. Si chacun
 * dépensait sa tuile, rien ne se verrait à l'écran — et l'on découvrirait le
 * gaspillage le jour où un décor de trente cases n'entrerait plus.
 */
b.egal('deux fois le même dessin, une seule tuile', caseDuFond(14, 3), caseDuFond(2, 3))

/*
 * Le dessin de SOL, redit dans l'autre alphabet.
 *
 * « 21111112 » et « +------+ » sont les mêmes pixels. Comparer les rangées
 * telles qu'elles sont écrites les aurait crus différents ; c'est aux NUANCES
 * qu'on les compare, c'est-à-dire à ce que le matériel verra.
 */
b.egal('un dessin sur place retrouve la « Tuile » qui le disait déjà',
  caseDuFond(3, 14), caseDuFond(0, 13))
montre('et ce sont bien les pixels de SOL', 3, 14, SOL)

/* Le nom reste le nom : « poser(x, 13, SOL) » dans une boucle marche comme
   avant, et ce sont les vingt cases du sol. */
const leSol = Array.from({ length: 20 }, (_, x) => caseDuFond(x, 13))
b.verifier('le sol posé par son nom couvre toujours ses vingt cases',
  leSol.every((t) => t === leSol[0]), ` (tuile ${leSol[0]})`)

/* --------------------------------------------------------------- les lutins */

const BALLE = [
  '..####..',
  '.#----#.',
  '#--++--#',
  '#-+##+-#',
  '#-+##+-#',
  '#--++--#',
  '.#----#.',
  '..####..',
]

const balle = tuileAttendue(BALLE)
const enMemoire = tuileEnMemoire(lutin(0))
b.verifier('un dessin écrit dans « sprite » devient le dessin du lutin',
  balle.every((o, i) => o === enMemoire[i]), ` (tuile ${lutin(0)})`)

/*
 * Le personnage de seize : quatre lutins, quatre tuiles QUI SE SUIVENT.
 *
 * L'ordre compte — haut-gauche, haut-droite, bas-gauche, bas-droite. Une
 * inversion donnerait un visage recomposé de travers, ce qui compile
 * parfaitement.
 */
b.verifier('un dessin de seize donne quatre lutins, sur quatre tuiles qui se suivent',
  lutin(2) === lutin(1) + 1 && lutin(3) === lutin(1) + 2 && lutin(4) === lutin(1) + 3,
  ` (${lutin(1)}, ${lutin(2)}, ${lutin(3)}, ${lutin(4)})`)

/*
 * Le quart HAUT-GAUCHE du géant : les huit premiers signes des huit premières
 * rangées. C'est ce que la première des quatre tuiles doit contenir.
 */
const GEANT_HAUT_GAUCHE = [
  '....####',
  '..######',
  '.#######',
  '###..###',
  '###..###',
  '########',
  '########',
  '##..####',
]
const quart = tuileEnMemoire(lutin(1))
const attenduQuart = tuileAttendue(GEANT_HAUT_GAUCHE)
b.verifier('et le premier quart est bien le coin haut-gauche du dessin',
  attenduQuart.every((o, i) => o === quart[i]),
  ` (${quart.join(' ')})`)

/* --------------------------------------------------------------- le panneau */

const ETOILE = [
  '...##...',
  '..####..',
  '#######.',
  '.#####..',
  '..####..',
  '.##..##.',
  '##....##',
  '........',
]
const surLePanneau = caseDuPanneau(1, 0)
const octetsPanneau = tuileEnMemoire(surLePanneau)
const attenduPanneau = tuileAttendue(ETOILE)
b.verifier('« poserPanneau » accepte aussi un dessin écrit sur place',
  attenduPanneau.every((o, i) => o === octetsPanneau[i]), ` (tuile ${surLePanneau})`)

/* ------------------------------------------- ce que le compilateur a gravé */

/*
 * Onze dessins écrits, neuf tuiles gravées.
 *
 * Deux se répètent : le second nuage, et le pavé qui redit SOL dans l'autre
 * alphabet. Le compte est ici pour que le jour où la reconnaissance casserait,
 * quelque chose le dise — un décor qui s'affiche bien peut dépenser deux fois
 * ce qu'il faut sans que personne ne s'en aperçoive.
 */
b.egal('onze dessins écrits, neuf tuiles gravées', jeu.dessins.size, 9)

/*
 * Les numéros des tuiles NOMMÉES ne bougent pas.
 *
 * L'atelier de la page compte les « Tuile » et les « Perso » dans l'ordre du
 * texte, en partant de 44. Si un dessin écrit sur place prenait son numéro au
 * passage, la tuile nommée qui le suit serait décalée — et l'atelier
 * montrerait le mauvais dessin sans qu'aucun contrôle ne tombe.
 */
b.egal('la première tuile nommée garde le numéro 44', jeu.dessins.get('SOL').numero, 44)

const apres = compiler(analyser(
  'Tuile PREMIERE = { "00000000", "00000000", "00000000", "00000000", "00000000", "00000000", "00000000", "00000000" };\n' +
  'int main() {\n' +
  '  poser(0, 0, { "33333333", "33333333", "33333333", "33333333", "33333333", "33333333", "33333333", "33333333" });\n' +
  '  Tuile SECONDE = { "11111111", "11111111", "11111111", "11111111", "11111111", "11111111", "11111111", "11111111" };\n' +
  '  poser(1, 0, SECONDE);\n' +
  '  return 0;\n' +
  '}\n',
))
b.egal('une tuile nommée APRÈS un dessin sur place garde son rang',
  apres.dessins.get('SECONDE').numero, 45)

/* ------------------------------------------------------------- les refus */

const refuser = (source) => () => compiler(analyser(`int main() {\n${source}\n  return 0;\n}\n`))
const HUIT = '"########", "########", "########", "########", "########", "########", "########", "########"'

b.refuse('un dessin de sept rangées',
  refuser('  poser(0, 0, { "########", "########", "########", "########", "########", "########", "########" });'),
  'en veut exactement 8')

b.refuse('une rangée trop courte',
  refuser('  poser(0, 0, { "#######", "########", "########", "########", "########", "########", "########", "########" });'),
  'doit faire 8 signes')

b.refuse('un dessin qui mélange les deux écritures',
  refuser(`  poser(0, 0, { "3#######", ${'"########", '.repeat(6)}"########" });`),
  'mélange les chiffres et les signes')

b.refuse('une rangée qui n\'est pas entre guillemets',
  refuser('  poser(0, 0, { 3, "########", "########", "########", "########", "########", "########", "########" });'),
  's\'écrit entre guillemets')

b.refuse('un dessin de huit là où il en faut seize',
  refuser(`  sprite16(0, 0, 0, { ${HUIT} });`),
  'en veut exactement 16')

b.refuse('des accolades là où aucune tuile n\'est attendue',
  refuser(`  texte(0, 0, { ${HUIT} });`),
  'dessin posé sur place')

b.refuse('des accolades dans un calcul',
  refuser(`  uint8_t x = 1 + { ${HUIT} };`),
  'dessin posé sur place')

b.fin()

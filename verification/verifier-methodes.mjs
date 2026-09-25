/**
 * Les méthodes font-elles ce qu'elles disent ?
 *
 *   node verifier-methodes.mjs
 *
 * `exemples/methodes.cpp` range ses résultats dans un tableau ; ici on fait
 * tourner la cartouche dans l'émulateur et l'on relit ce tableau, case par
 * case. C'est le seul endroit où l'on voie qu'une méthode a écrit dans le BON
 * objet : « troupe[0].avancer() » et « troupe[1].avancer() » produisent des
 * octets presque identiques, et une adresse calculée de travers ne se trahit
 * qu'à l'exécution.
 *
 * La seconde moitié éprouve les refus : ce qui n'est pas traduisible doit être
 * nommé, avec son numéro de ligne, plutôt que silencieusement mal traduit.
 */

import { writeFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { demarrer, batir, bulletin } from '../outils/controle.mjs'

const b = bulletin('exemples/methodes.cpp')
const jeu = demarrer('exemples/methodes.cpp', 20)

/* Ce que chaque case doit contenir, dans l'ordre où le programme les écrit. */
const ATTENDU = [
  ['une méthode écrit dans l\'objet nommé', 11],
  ['elle lit deux champs à la fois', 16],
  ['elle rend une valeur', 1],
  ['deux appels de suite', 9],

  ['une case de tableau, index connu', 201],
  ['le voisin de gauche n\'a pas bougé', 100],
  ['ni celui de droite', 50],

  ['index calculé : le premier avance', 101],
  ['le mort reste immobile', 201],
  ['le dernier avance', 51],

  ['une méthode en appelle une autre sur le même objet', 2],
  ['et le « if » qu\'elle contient protège du débordement', 0],

  ['la valeur rendue sert dans un calcul', 102],
  ['et dans une addition', 15],

  ['un champ tableau écrit par « this »', 4],
  ['sa première case', 0],
  ['sa troisième', 6],
  ['sa dernière', 9],

  ['un appel imbriqué ne perd pas l\'objet en cours', 4],
  ['et ne touche pas à ses autres champs', 9],
]

ATTENDU.forEach(([quoi, attendu], i) => b.egal(quoi, jeu.caseDe('pile', i), attendu))
b.egal('rien de plus n\'a été noté', jeu.valeurDe('combien'), ATTENDU.length)

/*
 * Chaque méthode a ses deux octets pour « this ».
 *
 * C'est ce qui permet à « blesser() » d'appeler « vivant() » sans perdre son
 * propre objet. Les partager aurait marché sur les exemples simples, et
 * échoué exactement là où c'est le plus dur à voir.
 */
const pointeurs = ['Ennemi::avancer', 'Ennemi::vivant', 'Ennemi::blesser']
  .map((nom) => jeu.adresseDe(`${nom}.this`))
b.verifier(
  'chaque méthode a son propre « this »',
  new Set(pointeurs).size === pointeurs.length,
  ` — ${pointeurs.map((a) => '$' + a.toString(16)).join(', ')}`,
)

/* ------------------------------------------------------------- les refus */

const dossier = tmpdir()
let numero = 0

/** Compile un bout de programme, et rend l'erreur s'il y en a une. */
const compiler = (corps) => () => {
  const chemin = join(dossier, `refus-methode-${numero++}.cpp`)
  writeFileSync(chemin, corps)
  try { batir(chemin) } finally { rmSync(chemin, { force: true }) }
}

const AVEC = (dedans, dans_main = '') => `
struct Ennemi {
  uint8_t x, y;
${dedans}
};
Ennemi troupe[2];
int main() { ${dans_main} return 0; }
`

b.refuse(
  '« class » reste refusé',
  compiler('class Ennemi { uint8_t x; };\nint main() { return 0; }'),
  'trouvé « class »',
)

b.refuse(
  'une méthode ne prend pas d\'argument',
  compiler(AVEC('  void poser(uint8_t nx) { x = nx; }')),
  'ne prend pas d\'argument',
)

b.refuse(
  'une méthode annoncée sans son corps',
  compiler(AVEC('  void avancer();')),
  'sans son corps',
)

b.refuse(
  'une méthode inconnue est nommée, avec celles qui existent',
  compiler(AVEC('  void avancer() { x++; }', 'troupe[0].sauter();')),
  'n\'a pas de méthode « sauter »',
)

b.refuse(
  'un argument à l\'appel est refusé sur le nom',
  compiler(AVEC('  void avancer() { x++; }', 'troupe[0].avancer(3);')),
  'ne prend pas d\'argument',
)

b.refuse(
  'une méthode « void » ne rend pas de valeur',
  compiler(AVEC('  void avancer() { x++; }', 'uint8_t v = troupe[0].avancer();')),
  'ne rend aucune valeur',
)

b.refuse(
  '« .methode() » sur ce qui n\'est pas une struct',
  compiler(AVEC('  void avancer() { x++; }', 'uint8_t n = 0; n.avancer();')),
  'ne s\'écrit qu\'après une « struct »',
)

b.refuse(
  'un champ et une méthode ne partagent pas un nom',
  compiler(AVEC('  void x() { y++; }')),
  'a déjà un champ « x »',
)

b.refuse(
  'une méthode qui s\'appelle elle-même',
  compiler(AVEC('  void avancer() { x++; avancer(); }')),
  'une méthode vit à une place fixe',
)

b.refuse(
  'deux méthodes qui s\'appellent en rond',
  compiler(AVEC('  void a() { b(); }\n  void b() { a(); }')),
  'Ennemi::a → Ennemi::b → Ennemi::a',
)

b.refuse(
  'une méthode sur une table « const »',
  compiler(
    'struct Ennemi { uint8_t x, y; void avancer() { x++; } };\n' +
    'const Ennemi FIXES[] = { { 1, 2 }, { 3, 4 } };\n' +
    'int main() { FIXES[0].avancer(); return 0; }',
  ),
  'const',
)

b.refuse(
  'une méthode annoncée sur une struct sans champ',
  compiler('struct Vide { void rien() { } };\nint main() { return 0; }'),
  'n\'a aucun champ',
)

b.fin()

/**
 * Ce qui doit être refusé l'est-il, et le message dit-il quoi faire ?
 *
 *   node verifier-refus.mjs
 *
 * La moitié de la promesse du compilateur est là. Accepter tout C++ serait
 * impossible ; en accepter un morceau sans le dire serait pire — un `long`
 * traduit en douce sur un octet donne un jeu qui compte faux à partir de 256,
 * et personne n'a été prévenu. Chaque refus est donc éprouvé ici, avec le mot
 * qui doit se trouver dans le message.
 */

import { analyser } from '../compilateur/analyseur.js'
import { compiler } from '../compilateur/emetteur.js'
import { bulletin } from '../outils/controle.mjs'

const b = bulletin('les refus du compilateur')

/** Compile un texte, et lève si le programme n'est pas compris. */
const batir = (source) => compiler(analyser(source))

const NL = String.fromCharCode(10)

const AVEC_MAIN = (dedans) => `int main() {\n${dedans}\n  return 0;\n}\n`

const cas = [
  [
    'un entier de seize bits',
    'uint16_t x = 300;\n' + AVEC_MAIN('  x = 1;'),
    'ne va que jusqu\'à 255',
  ],
  [
    'un nombre à virgule',
    'float vitesse = 1;\n' + AVEC_MAIN('  vitesse = 2;'),
    'ne sait pas compter à virgule',
  ],
  [
    'un pointeur',
    'uint8_t* p;\n' + AVEC_MAIN('  p = 0;'),
    'pas de pointeurs',
  ],
  [
    'la bibliothèque standard',
    AVEC_MAIN('  std::cout;'),
    'pas de bibliothèque standard',
  ],
  [
    'un programme sans main()',
    'uint8_t x = 3;\n',
    'il manque « int main() »',
  ],
  [
    'un nom jamais déclaré',
    AVEC_MAIN('  score = 3;'),
    'n\'est pas déclaré ici',
  ],
  [
    'une fonction qui s\'appelle elle-même',
    'uint8_t f(uint8_t n) { if (n == 0) return 0; return f(n - 1); }\n' + AVEC_MAIN('  f(3);'),
    's\'appeler elle-même',
  ],
  [
    'une récursion par un détour',
    'void a();\nvoid b() { a(); }\nvoid a() { b(); }\n' + AVEC_MAIN('  a();'),
    's\'appeler elle-même',
  ],
  [
    'trop d\'arguments',
    'uint8_t f(uint8_t n) { return n; }\n' + AVEC_MAIN('  f(1, 2);'),
    'prend 1 argument',
  ],
  [
    'une fonction « void » dont on prend la valeur',
    'void f() { }\n' + AVEC_MAIN('  uint8_t x = f();'),
    'elle ne rend aucune valeur',
  ],
  [
    'une fonction qui annonce un retour sans le faire',
    'uint8_t f() { }\n' + AVEC_MAIN('  f();'),
    'aucun « return »',
  ],
  [
    'écrire dans une table gravée',
    'const uint8_t T[] = {1, 2, 3};\n' + AVEC_MAIN('  T[0] = 5;'),
    'ne change pas',
  ],
  [
    'une « struct » affectée d\'un bloc',
    'struct P { uint8_t x; uint8_t y; };\nP a;\nP c;\n' + AVEC_MAIN('  a = c;'),
    'ne se lit ni ne s\'écrit d\'un bloc',
  ],
  [
    'un champ qui n\'existe pas',
    'struct P { uint8_t x; };\nP a;\n' + AVEC_MAIN('  a.z = 1;'),
    'pas de champ',
  ],
  [
    'un tableau sans taille ni contenu',
    'uint8_t t[];\n' + AVEC_MAIN('  t[0] = 1;'),
    'sans taille ni valeurs',
  ],
  [
    'une taille de tableau qui n\'est pas connue d\'avance',
    'uint8_t n = 4;\nuint8_t t[n];\n' + AVEC_MAIN('  t[0] = 1;'),
    's\'écrit en clair',
  ],
  [
    'une constante dont la valeur ne l\'est pas',
    'uint8_t n = 4;\nconst uint8_t C = n;\n' + AVEC_MAIN('  n = C;'),
    'n\'est pas connue à la compilation',
  ],
  [
    'un point-virgule oublié',
    AVEC_MAIN('  uint8_t x = 1\n  x = 2;'),
    '« ; » attendu',
  ],
  [
    'une accolade jamais refermée',
    'int main() {\n  uint8_t x = 1;\n',
    'accolade fermante manquante',
  ],
  [
    '« == » à la place de « = »',
    AVEC_MAIN('  uint8_t x = 0;\n  x == 3;'),
    'compare, il n\'affecte pas',
  ],
  [
    'deux fois le même nom',
    AVEC_MAIN('  uint8_t x = 0;\n  uint8_t x = 1;'),
    'est déjà déclaré',
  ],
  [
    'un texte rangé dans un octet',
    AVEC_MAIN('  uint8_t x = "ABC";'),
    'ne se range pas dans un octet',
  ],
  [
    'une tuile qui n\'a pas ses huit rangées',
    'Tuile SOL = { "33333333", "33333333" };\n' + AVEC_MAIN('  poser(0, 0, SOL);'),
    'en veut exactement 8',
  ],
  [
    'une rangée de tuile mal écrite',
    'Tuile SOL = {\n"33333333","33333333","33333333","33333333",\n' +
      '"33333333","33333333","33333333","3333333X" };\n' + AVEC_MAIN('  poser(0, 0, SOL);'),
    'les chiffres 0 à 3',
  ],
  [
    'un lutin au-delà du quarantième',
    AVEC_MAIN('  sprite(60, 0, 0, 1);'),
    'quarante lutins',
  ],
  [
    'du texte hors de l\'écran',
    AVEC_MAIN('  texte(30, 2, "TROP LOIN");'),
    '20 colonnes',
  ],
  [
    'une fonction inconnue',
    AVEC_MAIN('  dessiner(1, 2);'),
    'fonction inconnue',
  ],
  [
    'un nom qui écrase une fonction de la console',
    'void texte() { }\n' + AVEC_MAIN('  texte();'),
    'déjà une fonction fournie',
  ],
  [
    '« break » hors de toute boucle',
    AVEC_MAIN('  break;'),
    'ne s\'écrit que dans une boucle',
  ],
  [
    'un « goto »',
    AVEC_MAIN('  goto fin;'),
    '« goto » n\'existe pas ici',
  ],
  [
    'un tableau de plus de 256 cases',
    'uint8_t t[300];' + NL + AVEC_MAIN('  t[0] = 1;'),
    'va jusqu' + String.fromCharCode(39) + 'à 256 cases',
  ],
  [
    'une grille trop grande',
    'uint8_t g[18][20];' + NL + AVEC_MAIN('  g[0][0] = 1;'),
    'va jusqu' + String.fromCharCode(39) + 'à 256 cases',
  ],
  [
    'une grille lue avec un seul index',
    'uint8_t g[4][5];' + NL + AVEC_MAIN('  g[1] = 1;'),
    'il faut deux index',
  ],
  [
    'un argument obligatoire apres un argument par defaut',
    'uint8_t f(uint8_t a = 1, uint8_t b) { return a + b; }' + NL + AVEC_MAIN('  f(1, 2);'),
    'suit un argument qui en a une',
  ],
  [
    'trop peu d arguments malgre les defauts',
    'uint8_t f(uint8_t a, uint8_t b = 2) { return a + b; }' + NL + AVEC_MAIN('  f();'),
    'prend de 1 à 2 arguments',
  ],
  [
    'une note sur une voix qui n existe pas',
    AVEC_MAIN('  note(3, 0, 10, 10);'),
    'la voix 1 ou 2',
  ],
  [
    'une palette au-dela de trois nuances',
    AVEC_MAIN('  paletteFond(0, 1, 2, 9);'),
    'une nuance va de 0 à 3',
  ],
  [
    'une palette de lutins qui n existe pas',
    AVEC_MAIN('  paletteLutins(2, 0, 1, 2, 3);'),
    'que deux palettes de lutins',
  ],
  [
    'effacer() sans dire combien',
    AVEC_MAIN('  effacer(2, 4);'),
    'prend trois arguments',
  ],
  [
    'effacer() avec un argument de trop',
    AVEC_MAIN('  effacer(2, 4, "A", 3);'),
    'prend trois arguments',
  ],
  [
    'effacer() hors de l ecran',
    AVEC_MAIN('  effacer(2, 30, "A");'),
    '2,30 est dehors',
  ],
]

/*
 * Un texte nommé et un nombre affiché : deux écritures neuves, donc deux
 * façons neuves de se tromper. Chacune doit être expliquée, et non traduite
 * de travers.
 */
cas.push(
  [
    'un nom que la console porte déjà',
    'const uint8_t HAUT = 14;' + NL + AVEC_MAIN('  poser(0, HAUT, 42);'),
    'est déjà un bouton de la manette',
  ],
  [
    'une tuile qui mélange les chiffres et les signes',
    'Tuile SOL = {' + NL + '"3.222203","33333333","33333333","33333333",' + NL +
      '"33333333","33333333","33333333","33333333" };' + NL + AVEC_MAIN('  poser(0, 0, SOL);'),
    'mélange les chiffres et les signes',
  ],
  [
    'un signe qui ne désigne aucune nuance',
    'Tuile SOL = {' + NL + '"3333333Z","33333333","33333333","33333333",' + NL +
      '"33333333","33333333","33333333","33333333" };' + NL + AVEC_MAIN('  poser(0, 0, SOL);'),
    'les chiffres 0 à 3',
  ],
  [
    'un texte nommé sans « const »',
    'char TITRE[] = "SALUT";\n' + AVEC_MAIN('  texte(1, 1, TITRE);'),
    'gravé dans la cartouche',
  ],
  [
    'un nombre passé à texte()',
    'uint8_t score = 5;\n' + AVEC_MAIN('  texte(1, 1, score);'),
    'nombre(colonne, ligne, valeur)',
  ],
  [
    'plus de trois chiffres',
    AVEC_MAIN('  nombre(1, 1, 200, 4);'),
    'de 1 à 3 chiffres',
  ],
  [
    'des chiffres qui débordent de l’écran',
    AVEC_MAIN('  nombre(19, 1, 200);'),
    'dépassent',
  ],
)

for (const [quoi, source, motif] of cas) {
  b.refuse(quoi, () => batir(source), motif)
}

/* Et ce qui doit passer doit passer : un refus trop large est un bogue aussi. */
const acceptes = [
  ['le plus court des programmes', 'int main() { return 0; }'],
  ['une déclaration annoncée puis écrite', 'uint8_t f();\nuint8_t f() { return 1; }\nint main() { return f(); }'],
  ['« unsigned char » et « auto »', 'int main() { unsigned char a = 1; auto b = a; return b; }'],
  ['un « for » sans rien dedans', 'int main() { for (;;) { break; } return 0; }'],
  ['plusieurs variables sur une ligne', 'int main() { uint8_t a = 1, b = 2; return a + b; }'],
  ['un texte nommé, écrit à l’écran',
    'const char T[] = "SALUT";' + NL + 'int main() { texte(1, 1, T); return 0; }'],
  ['un nombre écrit en base dix', 'int main() { uint8_t s = 42; nombre(1, 1, s); return 0; }'],
  ['une tuile écrite en signes',
    'Tuile BLOC = {' + NL + '"########","#......#","#.++++.#","#.++++.#",' + NL +
      '"#.++++.#","#.++++.#","#......#","########" };' + NL + 'int main() { poser(0, 0, BLOC); return 0; }'],
  ['une colonne calculée, comme pour poser()',
    'int main() { uint8_t x = 2; texte(x, 4, "SALUT"); nombre(x + 8, 4, x); return 0; }'],
  ['deux boucles qui nomment toutes deux « i »',
    'int main() {\n  for (uint8_t i = 0; i < 3; i++) { }\n  for (uint8_t i = 0; i < 3; i++) { }\n  return 0;\n}'],

  /* Les trois façons de dire COMBIEN effacer, et les deux formes du panneau.
     C'est là que la longueur est comptée par le compilateur plutôt que par la
     personne qui écrit — et c'est tout l'intérêt de la fonction. */
  ['effacer() la longueur d’un texte écrit sur place',
    'int main() { effacer(2, 4, "BONJOUR"); return 0; }'],
  ['effacer() la longueur d’un texte nommé',
    'const char T[] = "SALUT";' + NL + 'int main() { effacer(1, 1, T); return 0; }'],
  ['effacer() un nombre de cases calculé',
    'int main() { uint8_t n = 4; effacer(1, 1, n); return 0; }'],
  ['effacer() à une position calculée',
    'int main() { uint8_t x = 3; effacer(x, x + 1, "AB"); return 0; }'],
  ['effacerPanneau() sans rien vide tout le panneau',
    'int main() { effacerPanneau(); return 0; }'],
  ['effacerPanneau() à trois arguments n’ôte qu’un mot',
    'int main() { effacerPanneau(1, 1, "SCORE"); return 0; }'],
]

for (const [quoi, source] of acceptes) {
  let erreur = null
  try { batir(source) } catch (e) { erreur = e.message }
  b.verifier(quoi + ' est accepté', erreur === null, erreur ? ` — refusé : « ${erreur} »` : '')
}

b.fin()

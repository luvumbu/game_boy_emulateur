/*
 * Tout ce que le compilateur comprend, en un fichier.
 *
 *   node gb3.mjs exemples/langage.cpp
 *   node verifier-langage.mjs
 *
 * Ce programme ne joue rien : il calcule, et range chaque résultat dans
 * « resultat ». Le contrôle relit ensuite ce tableau dans la mémoire de la
 * console émulée, et compare case par case. C'est la seule façon de savoir
 * qu'un « switch » aiguille vraiment, et pas seulement qu'il compile.
 */

const uint8_t COMBIEN = 32;

uint8_t resultat[COMBIEN];
uint8_t curseur = 0;

void noter(uint8_t v) {
  resultat[curseur] = v;
  curseur++;
}

/* --- des fonctions, avec leurs arguments et leur valeur de retour --- */

uint8_t plus(uint8_t a, uint8_t b) {
  return a + b;
}

uint8_t distance(uint8_t a, uint8_t b) {
  if (a > b) return a - b;
  return b - a;
}

/* --- une table gravée dans la cartouche : elle ne coûte pas de mémoire --- */

const uint8_t CARRES[] = { 0, 1, 4, 9, 16, 25 };

/* --- un tableau en mémoire de travail, avec son contenu de départ --- */

uint8_t pile[4] = { 7, 8, 9, 10 };

/* --- des constantes nommées --- */

enum Nuance { NOIR, GRIS, BLANC };
enum { DEPART = 100, SUITE };

/* --- un enregistrement, et un tableau d'enregistrements --- */

struct Ennemi {
  uint8_t x;
  uint8_t y;
  uint8_t vie;
};

Ennemi troupe[3];

/* Un texte nommé : gravé dans la cartouche, comme les guillemets écrits sur
   place, et pas un octet de mémoire de travail. */
const char MESSAGE[] = "TEXTE NOMME";

/* Deux tables de positions, pour éprouver le calcul d'adresse. */
const uint8_t GRILLE_X[] = { 2, 17 };
const uint8_t GRILLE_Y[] = { 16, 16 };

int main() {
  noter(plus(20, 22));              // 42 — les arguments arrivent bien
  noter(distance(3, 10));           //  7 — et le retour repart
  noter(CARRES[4]);                 // 16 — lecture d'une table gravée
  noter(pile[2]);                   //  9 — lecture d'un tableau recopié

  uint8_t somme = 0;
  for (uint8_t i = 0; i < 5; i++) somme += i;
  noter(somme);                     // 10

  /* « continue » saute le pas, « break » sort : 0, 1, 2, 4, 5, 6 */
  uint8_t compte = 0;
  for (uint8_t i = 0; i < 10; i++) {
    if (i == 3) continue;
    if (i == 7) break;
    compte++;
  }
  noter(compte);                    //  6

  uint8_t n = 0;
  do { n++; } while (n < 4);
  noter(n);                         //  4

  uint8_t etat = GRIS;
  switch (etat) {
    case NOIR: noter(0); break;
    case GRIS: noter(1); break;
    default:   noter(2); break;
  }                                 //  1
  noter(SUITE);                     // 101 — la suite d'un enum

  /* --- les opérateurs --- */
  noter(0b1100 & 0b1010);           //  8
  noter(0b1100 | 0b1010);           // 14
  noter(0b1100 ^ 0b1010);           //  6
  noter(1 << 5);                    // 32
  noter(200 >> 3);                  // 25
  uint8_t huit = 8;
  noter(huit << 2);                 // 32 — décalage d'une valeur calculée
  noter((uint8_t)~0);               // 255
  noter(!0);                        //  1
  noter(5 > 3 ? 11 : 22);           // 11
  noter(20 - 3 * 4);                //  8 — les priorités sont celles de C++

  /*
   * Le court-circuit n'est pas un raffinement : « i < n && t[i] == 0 »
   * compte dessus pour ne pas lire une case hors du tableau.
   */
  uint8_t temoin = 0;
  uint8_t faux = 0;
  if (faux && ++temoin) { }
  noter(temoin);                    //  0 — la droite n'a pas été évaluée

  /* --- les enregistrements --- */
  for (uint8_t i = 0; i < 3; i++) {
    troupe[i].x = i * 10;
    troupe[i].y = i + 1;
    troupe[i].vie = 3;
  }
  troupe[2].vie--;
  noter(troupe[2].x);               // 20
  noter(troupe[1].y);               //  2
  noter(troupe[2].vie);             //  2
  noter(sizeof(Ennemi));            //  3
  noter(sizeof(CARRES) / sizeof(CARRES[0])); // 6

  /* --- suffixe et préfixe : deux valeurs différentes --- */
  uint8_t k = 5;
  uint8_t avant = k++;
  noter(avant);                     //  5 — la valeur d'AVANT
  noter(k);                         //  6
  noter(++k);                       //  7 — celle d'APRÈS

  noter('B' - 'A');                 //  1 — un caractère est un nombre

  /* Une case calculée, lue et réécrite en une fois. */
  uint8_t ou = 1;
  pile[ou] += 100;
  noter(pile[1]);                   // 108

  /*
   * Effacer sans compter les lettres.
   *
   * Les trois façons de dire combien : le texte lui-même, une table nommée,
   * un nombre calculé. Ce qui compte ici est qu'il en efface EXACTEMENT
   * autant — un de moins laisse une lettre orpheline, un de plus mange la
   * case d'à côté, et ni l'un ni l'autre n'est signalé.
   */
  texte(1, 14, "EFFACEMOI");
  effacer(1, 14, "EFFACEMOI");

  texte(1, 15, "GARDE");
  texte(7, 15, "OTE");
  effacer(7, 15, "OTE");

  uint8_t combienEffacer = 3;
  texte(1, 13, "ABCDEF");
  effacer(1, 13, combienEffacer);

  /* Zéro case n'en efface aucune — et surtout pas deux cent cinquante-six. */
  uint8_t aucun = 0;
  texte(12, 13, "INTACT");
  effacer(11, 13, aucun);

  texte(4, 8, "TOUT VA BIEN");

  /* Un texte qui porte un nom, et des nombres écrits en base dix. Le même
     message répété trois fois, c'est trois occasions de le changer à deux
     endroits ; et un score s'affichait jusqu'ici chiffre par chiffre. */
  /* Une colonne ET une ligne lues dans des tables : le calcul d'adresse doit
     mettre la ligne à l'abri pendant qu'il calcule la colonne. */
  poser(GRILLE_X[0], GRILLE_Y[0], 42);
  poser(GRILLE_X[1], GRILLE_Y[1], 42);

  texte(4, 10, MESSAGE);
  nombre(4, 12, 42);
  nombre(8, 12, pile[1]);
  nombre(12, 12, 7, 1);

  return 0;
}

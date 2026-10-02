/*
 * Un jeu SANS UN SEUL DESSIN.
 *
 *   node gb3.mjs exemples/sans-dessin.cpp
 *
 * Pas de « Tuile », pas de « Perso » : tout ce qui est à l'écran vient des
 * quarante-quatre tuiles que la console porte déjà — les lettres, les chiffres
 * et six signes. Leur numéro est connu d'avance :
 *
 *     0        l'espace
 *     1 à 26   A jusqu'à Z
 *    27 à 36   les chiffres 0 à 9
 *    37 « ! »  38 « ? »  39 « . »  40 « - »  41 « : »  42 « # »  43 « | »
 *
 * On leur donne un nom, et l'on s'en sert exactement comme d'un dessin à soi :
 * « poser(x, y, MUR) » ne sait pas d'où vient la tuile 42, et n'a pas à le
 * savoir. Un dessin qu'on ajoute plus tard prendra le numéro 44, après
 * celles-ci — c'est tout ce qui les distingue.
 */

#include <poser>    // pose une tuile sur une case du fond
#include <lire>     // lit la tuile posée sur une case
#include <texte>    // écrit un texte à l’écran
#include <bouton>   // lit un bouton de la manette
#include <nombre>   // écrit un nombre en chiffres

const uint8_t VIDE = 0;
const uint8_t HEROS = 15;   // la lettre O
const uint8_t MUR = 42;     // le signe #
const uint8_t PIECE = 27;   // le chiffre 0
const uint8_t BARRE = 43;   // le signe |

/* « HAUT » et « BAS » sont des boutons : une constante ne peut pas les
   reprendre, et le compilateur le dit là où on l'écrit. */
const uint8_t LARGE = 20;
const uint8_t PLANCHER = 14;

/* Sept pièces : une table pour les colonnes, une pour les lignes. */
const uint8_t PIECES_X[] = { 3, 8, 14, 17, 5, 11, 16 };
const uint8_t PIECES_Y[] = { 3, 5, 4, 9, 10, 8, 12 };

uint8_t x = 2;
uint8_t y = 2;
uint8_t pieces = 0;
uint8_t reste = 7;

uint8_t hAvant = 0;
uint8_t bAvant = 0;
uint8_t gAvant = 0;
uint8_t dAvant = 0;

void dessinerLeCadre() {
  uint8_t i = 0;
  while (i < LARGE) {
    poser(i, 1, MUR);
    poser(i, PLANCHER, MUR);
    i = i + 1;
  }

  uint8_t l = 1;
  while (l <= PLANCHER) {
    poser(0, l, BARRE);
    poser(LARGE - 1, l, BARRE);
    l = l + 1;
  }
}

void dessinerLesMurs() {
  uint8_t i = 0;
  while (i < 6) {
    poser(4 + i, 6, MUR);
    poser(10 + i, 11, MUR);
    i = i + 1;
  }

  uint8_t l = 0;
  while (l < 4) {
    poser(15, 2 + l, MUR);
    poser(6, 8 + l, MUR);
    l = l + 1;
  }
}

void poserLesPieces() {
  uint8_t i = 0;
  while (i < 7) {
    poser(PIECES_X[i], PIECES_Y[i], PIECE);
    i = i + 1;
  }
}

/*
 * Aller d'une case, si ce n'est pas un mur.
 *
 * C'est « lire() » qui décide : la carte de fond EST le niveau, et il n'y a
 * pas de second tableau à tenir à jour à côté. Une case vaut ce qu'on y voit.
 */
void allerA(uint8_t versX, uint8_t versY) {
  uint8_t la = lire(versX, versY);
  if (la == MUR) return;
  if (la == BARRE) return;

  if (la == PIECE) {
    pieces = pieces + 1;
    reste = reste - 1;
  }

  poser(x, y, VIDE);
  x = versX;
  y = versY;
  poser(x, y, HEROS);
}

int main() {
  texte(1, 0, "PIECES");
  texte(12, 0, "RESTE");

  dessinerLeCadre();
  dessinerLesMurs();
  poserLesPieces();
  poser(x, y, HEROS);

  while (true) {
    image();

    uint8_t h = bouton(HAUT);
    uint8_t b = bouton(BAS);
    uint8_t g = bouton(GAUCHE);
    uint8_t d = bouton(DROITE);

    /* Au front : un appui dure cinq images, et l'on traverserait la salle. */
    if (h && !hAvant) allerA(x, y - 1);
    if (b && !bAvant) allerA(x, y + 1);
    if (g && !gAvant) allerA(x - 1, y);
    if (d && !dAvant) allerA(x + 1, y);

    hAvant = h;
    bAvant = b;
    gAvant = g;
    dAvant = d;

    nombre(8, 0, pieces, 1);
    nombre(18, 0, reste, 1);

    if (reste == 0) texte(4, 16, "TOUT PRIS !");
  }

  return 0;
}

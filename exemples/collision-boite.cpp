/*
 * Une collision, la plus simple qui vaille : avant de bouger, on demande à la
 * carte ce qu'il y a devant.
 *
 *   node gb3.mjs exemples/collision-boite.cpp --capture 120 --grossir 3
 *
 * Le héros avance case par case, sur la grille du décor. « lire(colonne,
 * ligne) » rend le numéro de la tuile posée là — 0 est vide, tout le reste
 * est un mur. Grâce aux fonctions à arguments et à valeur de retour de
 * gameboy3, la règle s'écrit une fois et sert dans les quatre directions,
 * plutôt que d'être recopiée quatre fois comme dans un langage sans elles.
 */

#include <lire>     // lit la tuile posée sur une case
#include <poser>    // pose une tuile sur une case du fond
#include <bouton>   // lit un bouton de la manette
#include <Tuile>    // un dessin de 8 × 8 pixels

const uint8_t LARGEUR = 20;
const uint8_t HAUTEUR = 18;
const uint8_t MUR = 42;

uint8_t col = 5;
uint8_t lig = 5;
uint8_t avantHaut = 0;
uint8_t avantBas = 0;
uint8_t avantGauche = 0;
uint8_t avantDroite = 0;

// Vrai si la case visée est un mur, ou hors de la pièce.
uint8_t estMur(uint8_t c, uint8_t l) {
  if (c >= LARGEUR || l >= HAUTEUR) return 1;
  return lire(c, l) == MUR;
}

void dessinerLaPiece() {
  for (uint8_t c = 0; c < LARGEUR; c++) {
    poser(c, 0, MUR);
    poser(c, HAUTEUR - 1, MUR);
  }
  for (uint8_t l = 0; l < HAUTEUR; l++) {
    poser(0, l, MUR);
    poser(LARGEUR - 1, l, MUR);
  }
  // Un pilier planté au milieu de la pièce, pour heurter autre chose qu'un
  // bord.
  poser(10, 9, MUR);
  poser(11, 9, MUR);
}

void allerA(uint8_t c, uint8_t l) {
  poser(col, lig, 0);
  col = c;
  lig = l;
  poser(col, lig, {
    "01111110",
    "11111111",
    "11211121",
    "11111111",
    "11122111",
    "11111111",
    "01111110",
    "00111100",
  });
}

int main() {
  dessinerLaPiece();
  allerA(col, lig);

  while (true) {
    uint8_t haut = bouton(HAUT);
    uint8_t bas = bouton(BAS);
    uint8_t gauche = bouton(GAUCHE);
    uint8_t droite = bouton(DROITE);

    if (haut && !avantHaut && !estMur(col, lig - 1)) allerA(col, lig - 1);
    if (bas && !avantBas && !estMur(col, lig + 1)) allerA(col, lig + 1);
    if (gauche && !avantGauche && !estMur(col - 1, lig)) allerA(col - 1, lig);
    if (droite && !avantDroite && !estMur(col + 1, lig)) allerA(col + 1, lig);

    avantHaut = haut;
    avantBas = bas;
    avantGauche = gauche;
    avantDroite = droite;

    image();
  }

  return 0;
}

// Le puits de Tetris, construit sur le module « bloc.cpp ».
//
//   node outils/gb3.mjs exemples/module-bloc/principal.cpp
//
// Comparé à « exemples/puits.cpp », ce fichier ne connaît plus le détail du
// puits ou de la pièce : il n'appelle que ce que le module expose, et se
// concentre sur ce qu'un autre jeu changerait — la croix, le tempo, et
// compte les pièces posées à l'écran.

#include "bloc.cpp"

uint8_t posees = 0;

int main() {
  texte(1, 0, "PUITS");
  texte(16, 3, "POSE");

  ecran(0); // écran éteint : on a le temps de tout dessiner
  blocInitialiser();
  ecran(1);

  blocDessinerPiece();

  /*
   * L'état de la croix à l'image précédente : sans lui, maintenir GAUCHE
   * traverse le puits en quatre images. On agit au FRONT, c'est-à-dire au
   * moment précis où le bouton passe de relâché à enfoncé.
   */
  uint8_t gaucheAvant = 0;
  uint8_t droiteAvant = 0;
  uint8_t attente = 0;

  while (true) {
    image();

    uint8_t gauche = bouton(GAUCHE);
    uint8_t droite = bouton(DROITE);

    if (gauche && !gaucheAvant) blocAGauche();
    if (droite && !droiteAvant) blocADroite();

    gaucheAvant = gauche;
    droiteAvant = droite;

    // La descente, une fois toutes les vingt images — ou tout de suite si BAS.
    attente++;
    if (bouton(BAS)) attente = 20;

    if (attente > 19) {
      attente = 0;

      if (blocDescendre()) {
        posees++;
        nombre(16, 4, posees, 2);
      }
    }

    blocEffacerAncienne();
    blocDessinerPiece();
  }

  return 0;
}

/*
 * La caméra : le monde glisse, le héros ne bouge pas.
 *
 *   node gb3.mjs exemples/camera-defilement.cpp --capture 90 --grossir 3
 *
 * La carte de fond fait 256 pixels de côté, soit 32 cases de huit — le double
 * de ce que montre l'écran. « defiler(x, y) » ne bouge aucune tuile : il
 * déplace la fenêtre qui regarde la carte, et revient tout seul à zéro passé
 * 256, sans qu'on ait à s'en soucier.
 *
 * Le lutin, lui, reste posé au même endroit à l'écran d'un bout à l'autre —
 * c'est le principe qui donne l'illusion d'avancer : dans un vrai jeu, seul
 * le décor défile tant que le héros est loin des deux bords de la carte.
 */

#include <Tuile>     // un dessin de 8 × 8 pixels
#include <poser>     // pose une tuile sur une case du fond
#include <texte>     // écrit un texte à l’écran
#include <sprite>    // place un lutin de 8 × 8 au pixel près
#include <defiler>   // fait glisser tout le fond

Tuile POTEAU = {
  "00111100",
  "00111100",
  "00011000",
  "00011000",
  "00011000",
  "00011000",
  "00011000",
  "00111100",
};

Tuile HEROS = {
  "00111100",
  "00111100",
  "00011000",
  "01111110",
  "11111111",
  "00111100",
  "00100100",
  "01000010",
};

uint8_t x = 0;

// Un poteau tous les quatre tuiles, sur les trente-deux colonnes de la carte —
// de quoi voir le défilement d'un seul coup d'œil. « DEPART » n'est écrit
// qu'une fois, tout au début de la carte : le voir glisser hors de l'écran,
// puis revenir par la droite, est la preuve que la carte boucle à 256 pixels.
void dessinerLeMonde() {
  for (uint8_t c = 0; c < 32; c++) {
    poser(c, 10, c % 4 == 0 ? POTEAU : 0);
  }
  texte(0, 6, "DEPART");
}

int main() {
  dessinerLeMonde();
  sprite(0, 76, 64, HEROS);

  while (true) {
    x++;
    defiler(x, 0);
    image();
  }

  return 0;
}

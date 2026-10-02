/* Les quatre nuances de l'écran, et la palette qui les échange. */

#include <Tuile>         // un dessin de 8 × 8 pixels
#include <texte>         // écrit un texte à l’écran
#include <poser>         // pose une tuile sur une case du fond
#include <bouton>        // lit un bouton de la manette
#include <paletteFond>   // choisit les quatre nuances du fond

Tuile BANDE = { "........", "--------", "++++++++", "########", "........", "--------", "++++++++", "########" };

uint8_t sombre = 0;

int main() {
  texte(2, 2, "A INVERSE");

  for (uint8_t x = 4; x < 16; x++) {
    poser(x, 8, BANDE);
  }

  while (true) {
    image();

    if (bouton(A)) sombre = 1;
    if (bouton(B)) sombre = 0;

    if (sombre) paletteFond(3, 2, 1, 0);
    else paletteFond(0, 1, 2, 3);
  }

  return 0;
}

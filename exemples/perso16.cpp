/* Un personnage de SEIZE : quatre tuiles, un seul appel. */

#include <Perso>      // un personnage : un dessin de 16 × 16 ou de 32 × 32 pixels
#include <texte>      // écrit un texte à l’écran
#include <bouton>     // lit un bouton de la manette
#include <sprite16>   // place un lutin de 16 × 16 au pixel près

Perso ROBOT = {
  "....######......",
  "...########.....",
  "..##..##..##....",
  "..##..##..##....",
  "...########.....",
  "....######......",
  "..############..",
  ".##.########.##.",
  ".##.########.##.",
  ".##.########.##.",
  "..############..",
  "....##....##....",
  "....##....##....",
  "...####..####...",
  "..######.######.",
  "................",
};

uint8_t x = 72;

int main() {
  texte(3, 2, "GAUCHE DROITE");

  while (true) {
    image();

    if (bouton(DROITE) && x < 144) x++;
    if (bouton(GAUCHE) && x > 0) x--;

    sprite16(0, x, 80, ROBOT);
  }

  return 0;
}

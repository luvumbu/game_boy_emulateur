/* Un point qui suit une onde — A bascule entre sinus et cosinus.

   Pas de type signe, pas de sin()/cos() ici : deux tables gravées, ou plutot
   UNE table gravée relue avec un décalage — cos(angle) = sin(angle + 90°),
   et 90° fait un quart de tour, donc 8 pas sur les 32 de la table. */

#include <Tuile>    // un dessin de 8 × 8 pixels
#include <bouton>   // lit un bouton de la manette
#include <texte>    // écrit un texte à l’écran
#include <sprite>   // place un lutin de 8 × 8 au pixel près

Tuile BALLE = { "..####..", ".#----#.", "#--++--#", "#-+##+-#", "#-+##+-#", "#--++--#", ".#----#.", "..####.." };

/* Chaque valeur vaut 40 + 40*sin(angle) : toujours entre 0 et 80, jamais de
   negatif — donc jamais besoin d'un type qui n'existe pas ici. */
const uint8_t SINUS[] = {
  40, 48, 55, 62, 68, 73, 77, 79,
  80, 79, 77, 73, 68, 62, 55, 48,
  40, 32, 25, 18, 12,  7,  3,  1,
   0,  1,  3,  7, 12, 18, 25, 32,
};

uint8_t x = 0;
uint8_t angle = 0;
uint8_t cosinus = 0;
uint8_t aAvant = 0;

int main() {
  while (true) {
    image();

    uint8_t a = bouton(A);
    if (a && !aAvant) cosinus = !cosinus;
    aAvant = a;

    if (cosinus) texte(1, 1, "A : COSINUS");
    else texte(1, 1, "A : SINUS  ");

    uint8_t indice = cosinus ? (angle + 8) % 32 : angle;
    uint8_t y = 28 + SINUS[indice];

    sprite(0, x, y, BALLE);

    x++;
    if (x > 152) x = 0;

    angle++;
    if (angle >= sizeof(SINUS)) angle = 0;
  }

  return 0;
}

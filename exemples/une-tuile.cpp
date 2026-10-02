/*
 * Le plus court des programmes qui dessine.
 *
 *   node gb3.mjs exemples/une-tuile.cpp
 *
 * Une tuile, et un appel. C'est tout ce qu'il faut.
 */

#include <Tuile>   // un dessin de 8 × 8 pixels
#include <poser>   // pose une tuile sur une case du fond

Tuile COEUR = {
  ".##..##.",
  "########",
  "########",
  "########",
  ".######.",
  "..####..",
  "...##...",
  "........",
};

int main() {
  poser(9, 8, COEUR);

  while (true) {
    image();
  }

  return 0;
}

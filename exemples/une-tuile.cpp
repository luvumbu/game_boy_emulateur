/*
 * Le plus court des programmes qui dessine.
 *
 *   node gb3.mjs exemples/une-tuile.cpp
 *
 * Une tuile, et un appel. C'est tout ce qu'il faut.
 */

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

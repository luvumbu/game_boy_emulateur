/*
 * La COULEUR, sur Game Boy Color.
 *
 *   node gb3.mjs exemples/couleur.cpp
 *   node verifier-couleur.mjs
 *
 * Le même programme tourne sur une Game Boy d'origine : elle ignore les
 * registres de couleur, et rend les quatre nuances de toujours. C'est le sens
 * du drapeau $80 en $0143 — profiter de la couleur, sans l'exiger.
 *
 *   couleurFond(palette, teinte, rouge, vert, bleu)   0-7, 0-3, 0-31 chacune
 *   teindre(colonne, ligne, palette)                  quelle palette pour la case
 */

Tuile BRIQUE = {
  "########", "#..#..#.", "########", "..#..#..",
  "########", "#..#..#.", "########", "..#..#..",
};

Tuile HERBE = {
  "........", "..#...#.", ".#.#.#.#", "#...#...",
  "########", "########", "########", "########",
};

Tuile HEROS = {
  "..####..", ".#-##-#.", "########", "#.####.#",
  "########", "..#..#..", ".#....#.", "##....##",
};

int main() {
  /* Palette 0 — le ciel : du bleu clair au bleu profond. */
  couleurFond(0, 0, 20, 28, 31);
  couleurFond(0, 1, 12, 20, 31);
  couleurFond(0, 2,  6, 12, 26);
  couleurFond(0, 3,  2,  4, 14);

  /* Palette 1 — la brique : de l'ocre au brun. */
  couleurFond(1, 0, 31, 26, 18);
  couleurFond(1, 1, 28, 16,  8);
  couleurFond(1, 2, 20,  9,  3);
  couleurFond(1, 3,  9,  3,  0);

  /* Palette 2 — l'herbe. */
  couleurFond(2, 0, 22, 31, 16);
  couleurFond(2, 1, 12, 26,  8);
  couleurFond(2, 2,  4, 16,  4);
  couleurFond(2, 3,  1,  7,  1);

  /* Palette 0 des lutins — le héros en rouge. */
  couleurLutin(0, 1, 31, 24, 20);
  couleurLutin(0, 2, 31,  6,  4);
  couleurLutin(0, 3, 12,  0,  0);

  /* Le ciel : toutes les cases du haut prennent la palette 0. */
  for (uint8_t l = 0; l < 10; l++)
    for (uint8_t c = 0; c < 20; c++)
      teindre(c, l, 0);

  /* Un mur de briques, en palette 1. */
  for (uint8_t c = 0; c < 20; c++) {
    poser(c, 10, BRIQUE);
    teindre(c, 10, 1);
  }

  /* De l'herbe en dessous, en palette 2. */
  for (uint8_t l = 11; l < 18; l++)
    for (uint8_t c = 0; c < 20; c++) {
      poser(c, l, HERBE);
      teindre(c, l, 2);
    }

  texte(4, 4, "EN COULEUR");
  for (uint8_t c = 4; c < 14; c++) teindre(c, 4, 0);

  sprite(0, 76, 68, HEROS);

  while (true) {
    image();
  }
}

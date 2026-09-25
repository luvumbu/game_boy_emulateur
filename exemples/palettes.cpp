/*
 * TOUTES les couleurs que la Game Boy Color tient à la fois.
 *
 *   node gb3.mjs exemples/palettes.cpp --capture 40 --grossir 3
 *   node verifier-couleur.mjs
 *
 * Deux nombres, souvent confondus :
 *
 *   32 768   les couleurs entre lesquelles CHOISIR — cinq bits par composante
 *       56   celles qu'on peut afficher EN MÊME TEMPS
 *
 * Le second se décompose ainsi : huit palettes de fond de quatre teintes, soit
 * trente-deux ; plus huit palettes de lutins de quatre teintes, dont la
 * première est TRANSPARENTE et ne s'affiche donc jamais — vingt-quatre. C'est
 * le plafond du matériel, et ce programme le touche.
 *
 * Les composantes sont lues dans des tables, et non écrites en clair : c'est
 * ce qui permet une boucle sur les cinquante-six.
 */

/* Trente-deux couleurs de fond, toutes différentes. */
const uint8_t FOND_R[] = {
  31, 24, 16,  8,   31, 26, 18, 10,   31, 28, 20, 12,   28, 21, 14,  7,
   4,  3,  2,  1,    2,  6, 10, 14,   20, 15, 11,  6,   31, 23, 15,  9,
};
const uint8_t FOND_V[] = {
   6,  4,  3,  2,   18, 14, 10,  6,   31, 25, 18, 11,   31, 26, 20, 13,
  31, 24, 17, 10,   22, 17, 12,  8,    5,  4,  3,  2,   31, 27, 21, 16,
};
const uint8_t FOND_B[] = {
   4,  3,  2,  1,    2,  1,  1,  0,    8,  6,  4,  2,   12,  9,  6,  3,
  27, 21, 15,  9,   31, 26, 20, 15,   28, 22, 16, 11,   31, 29, 25, 20,
};

/* Vingt-quatre couleurs de lutins : trois par palette, la teinte 0 ne
   s'affiche pas — c'est par elle que le décor se voit derrière. */
const uint8_t LUTIN_R[] = {
  31, 22, 13,   31, 25, 16,   14,  9,  4,    6,  4,  2,
  27, 19, 11,   31, 30, 29,   17, 12,  7,   30, 25, 19,
};
const uint8_t LUTIN_V[] = {
  31, 23, 14,   17, 11,  5,   31, 24, 16,   26, 19, 12,
   9,  6,  3,   28, 20, 13,   16, 11,  6,    2,  1,  0,
};
const uint8_t LUTIN_B[] = {
   0,  0,  0,   31, 25, 18,   12,  8,  5,   31, 26, 21,
  25, 18, 12,    5,  3,  1,   31, 25, 18,   16, 12,  8,
};

/* Quatre bandes de deux rangées : les quatre teintes d'une palette, à l'œil. */
Tuile QUATRE = {
  "00000000", "00000000", "11111111", "11111111",
  "22222222", "22222222", "33333333", "33333333",
};

/* Un pion qui n'emploie QUE les teintes 1, 2 et 3 : la 0 laisse voir le fond. */
Tuile PION = {
  "00111100", "01222210", "12333321", "12333321",
  "12333321", "12333321", "01222210", "00111100",
};

int main() {
  /* Les trente-deux teintes de fond : huit palettes de quatre. */
  for (uint8_t i = 0; i < 32; i++) {
    couleurFond(i / 4, i % 4, FOND_R[i], FOND_V[i], FOND_B[i]);
  }

  /* Les vingt-quatre teintes de lutins : huit palettes, teintes 1 à 3. */
  for (uint8_t i = 0; i < 24; i++) {
    couleurLutin(i / 3, i % 3 + 1, LUTIN_R[i], LUTIN_V[i], LUTIN_B[i]);
  }

  /* Huit bandes de deux rangées, une par palette de fond. Chaque bande montre
     ses quatre teintes d'un coup. */
  for (uint8_t p = 0; p < 8; p++) {
    for (uint8_t c = 0; c < 20; c++) {
      poser(c, p * 2, QUATRE);
      teindre(c, p * 2, p);
      poser(c, p * 2 + 1, QUATRE);
      teindre(c, p * 2 + 1, p);
    }
  }

  /* Huit pions en bas, un par palette de lutin. */
  for (uint8_t p = 0; p < 8; p++) {
    sprite(p, 12 + p * 18, 130, PION);
    teindreLutin(p, p);
  }

  while (true) {
    image();
  }
}

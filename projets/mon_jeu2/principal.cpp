/*
 * MON JEU
 *
 * Un programme neuf. Tout part de « int main() » — c'est là que la console
 * arrive, et nulle part ailleurs.
 */

Perso ENNEMI = {
  "..........##....",
  "..####.##.####..",
  "#.###.########..",
  "#.#+###.######..",
  "..#+#######++#..",
  ".###+++++###+##.",
  ".##+##-#####+##.",
  "###+#--##-###+#.",
  ".##+++##+++#+###",
  ".#+##########+##",
  ".#+#-#-##-######",
  ".##+++++++#++###",
  ".#############.#",
  "..####...#.##..#",
  "..###....#.####.",
  "........#.....#.",
};

int main() {
  /* --- les couleurs de l’atelier --- */
  couleurFond(0, 0, 31, 31, 31);
  couleurFond(0, 1, 20, 22, 26);
  couleurFond(0, 2, 10, 12, 16);
  couleurFond(0, 3, 2, 3, 5);
  couleurFond(1, 0, 31, 26, 18);
  couleurFond(1, 1, 28, 16, 8);
  couleurFond(1, 2, 20, 9, 3);
  couleurFond(1, 3, 9, 3, 0);
  couleurFond(2, 0, 22, 31, 16);
  couleurFond(2, 1, 12, 26, 8);
  couleurFond(2, 2, 4, 16, 4);
  couleurFond(2, 3, 1, 7, 1);
  couleurFond(3, 0, 20, 28, 31);
  couleurFond(3, 1, 12, 20, 31);
  couleurFond(3, 2, 6, 12, 26);
  couleurFond(3, 3, 2, 4, 14);
  /* --- fin des couleurs --- */
  texte(4, 6, "MON JEU");

  while (true) {
    image();
  }
}
// essai
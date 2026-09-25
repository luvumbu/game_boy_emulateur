Tuile SOL = {
  "22222222",
  "21111112",
  "21111112",
  "21111112",
  "21111112",
  "21111112",
  "21111112",
  "22222222",
};

Tuile TUILE1 = {
  "00000000",
  "00000000",
  "00000000",
  "22222222",
  "00000000",
  "00000000",
  "00000000",
  "00000000",
};
/* TUILE1 : palette 0 */   // la palette de l'atelier ; en jeu, c'est « teindre(colonne, ligne, 0) » qui la donne

int main() {
  /* --- les couleurs de l’atelier --- */
  couleurFond(1, 0, 20, 28, 31);
  couleurFond(1, 1, 10, 26, 6);
  couleurFond(1, 2, 16, 8, 2);
  couleurFond(1, 3, 2, 2, 2);
  couleurFond(2, 0, 31, 22, 26);
  couleurFond(2, 1, 31, 16, 4);
  couleurFond(2, 2, 16, 4, 22);
  couleurFond(2, 3, 2, 2, 10);
  couleurFond(3, 0, 31, 29, 20);
  couleurFond(3, 1, 4, 24, 24);
  couleurFond(3, 2, 28, 10, 8);
  couleurFond(3, 3, 2, 4, 12);
  couleurFond(4, 0, 22, 31, 14);
  couleurFond(4, 1, 26, 24, 2);
  couleurFond(4, 2, 18, 6, 2);
  couleurFond(4, 3, 0, 6, 2);
  couleurFond(5, 0, 28, 31, 31);
  couleurFond(5, 1, 8, 24, 31);
  couleurFond(5, 2, 14, 8, 26);
  couleurFond(5, 3, 2, 2, 10);
  couleurFond(6, 0, 31, 30, 12);
  couleurFond(6, 1, 31, 14, 0);
  couleurFond(6, 2, 22, 2, 2);
  couleurFond(6, 3, 4, 0, 0);
  couleurFond(7, 0, 24, 22, 31);
  couleurFond(7, 1, 8, 22, 16);
  couleurFond(7, 2, 22, 4, 18);
  couleurFond(7, 3, 1, 1, 4);
  couleurLutin(1, 0, 31, 31, 31);
  couleurLutin(1, 1, 31, 26, 20);
  couleurLutin(1, 2, 30, 4, 2);
  couleurLutin(1, 3, 4, 6, 22);
  couleurLutin(2, 0, 31, 31, 31);
  couleurLutin(2, 1, 31, 28, 8);
  couleurLutin(2, 2, 6, 22, 4);
  couleurLutin(2, 3, 12, 2, 16);
  couleurLutin(3, 0, 31, 31, 31);
  couleurLutin(3, 1, 31, 24, 28);
  couleurLutin(3, 2, 30, 24, 4);
  couleurLutin(3, 3, 14, 2, 10);
  couleurLutin(4, 0, 31, 31, 31);
  couleurLutin(4, 1, 18, 30, 31);
  couleurLutin(4, 2, 14, 14, 18);
  couleurLutin(4, 3, 18, 2, 2);
  couleurLutin(5, 0, 31, 31, 31);
  couleurLutin(5, 1, 30, 30, 31);
  couleurLutin(5, 2, 10, 14, 31);
  couleurLutin(5, 3, 2, 2, 6);
  couleurLutin(6, 0, 31, 31, 31);
  couleurLutin(6, 1, 20, 31, 14);
  couleurLutin(6, 2, 18, 10, 4);
  couleurLutin(6, 3, 2, 10, 4);
  couleurLutin(7, 0, 31, 31, 31);
  couleurLutin(7, 1, 31, 31, 12);
  couleurLutin(7, 2, 31, 14, 0);
  couleurLutin(7, 3, 14, 0, 0);
  /* nuancier : 28,31,26 17,24,14 6,13,10 1,3,4 20,28,31 10,26,6 16,8,2 2,2,2 */
  /* nuancier : 31,22,26 31,16,4 16,4,22 2,2,10 31,29,20 4,24,24 28,10,8 2,4,12 */
  /* nuancier : 22,31,14 26,24,2 18,6,2 0,6,2 28,31,31 8,24,31 14,8,26 31,30,12 */
  /* nuancier : 31,14,0 22,2,2 4,0,0 24,22,31 8,22,16 22,4,18 1,1,4 31,26,20 */
  /* nuancier : 30,4,2 4,6,22 31,28,8 6,22,4 12,2,16 31,24,28 30,24,4 14,2,10 */
  /* nuancier : 18,30,31 14,14,18 18,2,2 30,30,31 10,14,31 2,2,6 20,31,14 18,10,4 */
  /* nuancier : 2,10,4 31,31,12 14,0,0 */
  /* --- fin des couleurs --- */
  texte(4, 2, "SUR PLACE");

  // Le sol sert partout : il garde son nom.
  for (uint8_t x = 0; x < 20; x++) {
    poser(x, 12, TUILE1 );
    teindre(x, 12, 0);
  }

  // La porte ne sert qu'ici : ses huit rangées sont ici.
  poser(9, 11, {
    "########",
    "#------#",
    "#-####-#",
    "#-#--#-#",
    "#-#--#-#",
    "#-#--#-#",
    "#-#--#-#",
    "########",
  });

  // Le dessin de SOL, redit dans l'autre écriture : aucune tuile de plus.
  poser(3, 10, {
    "++++++++",
    "+------+",
    "+------+",
    "+------+",
    "+------+",
    "+------+",
    "+------+",
    "++++++++",
  });

  while (true) {
    image();
  }

  return 0;
}

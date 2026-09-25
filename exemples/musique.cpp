/*
 * Une MUSIQUE qui joue toute seule pendant que le jeu tourne.
 *
 *   node gb3.mjs exemples/musique.cpp
 *   node verifier-airs.mjs
 *
 * Un air s'écrit comme une tuile se dessine : une suite de pas, dans le
 * programme, et rien ailleurs. « jouer() » le lance ; il avance ensuite tout
 * seul, une fois par « image() ». La boucle du jeu n'a rien à tenir — c'est ce
 * qui permet d'avoir une musique de fond sans y penser à chaque tour.
 *
 *   "DO4 12"   une note, et son volume de 0 à 15
 *   "=="       on ne touche à rien : la note d'avant continue
 *   "--"       la voix se tait
 *
 * Dans la page, l'atelier des airs écrit ces lignes à la souris, et les fait
 * entendre avant même de compiler.
 */

/* La mélodie : deux mesures qui montent, deux qui redescendent. */
Air THEME = {
  "DO4 12",  "==",      "MI4 12",  "==",      "SOL4 12", "==",      "DO5 13",  "==",
  "SI4 11",  "==",      "SOL4 11", "==",      "MI4 11",  "==",      "--",      "--",
  "FA4 12",  "==",      "LA4 12",  "==",      "DO5 12",  "==",      "MI5 13",  "==",
  "RE5 11",  "==",      "DO5 11",  "==",      "LA4 11",  "==",      "--",      "--",
};

/* La basse : la même chose, deux octaves plus bas, une note par mesure. */
Air BASSE = {
  "DO2 9",   "==",      "==",      "==",      "SOL2 9",  "==",      "==",      "==",
  "MI2 9",   "==",      "==",      "==",      "--",      "--",      "--",      "--",
  "FA2 9",   "==",      "==",      "==",      "DO3 9",   "==",      "==",      "==",
  "LA2 9",   "==",      "==",      "==",      "--",      "--",      "--",      "--",
};

/* Une petite fanfare, celle qu'on entend en gagnant : elle ne boucle pas. */
Air FANFARE = {
  "DO5 14",  "MI5 14",  "SOL5 14", "DO6 15",  "==",      "==",      "--",      "--",
};

Tuile NOTE = {
  "00033000",
  "00033300",
  "00030300",
  "00030300",
  "03330300",
  "33330300",
  "33300000",
  "01100000",
};

uint8_t joue = 0;
uint8_t barre = 0;
uint8_t ancienA = 0;
uint8_t ancienB = 0;
uint8_t ancienEtat = 2; /* ni joué ni arrêté : le premier tour écrira */

/* Un témoin qui bat au rythme de la musique : de quoi VOIR qu'elle avance. */
void montrerLeBattement() {
  uint8_t colonne = 0;
  while (colonne < 20) {
    poser(colonne, 10, colonne < barre ? NOTE : 0);
    colonne++;
  }
}

int main() {
  texte(3, 2, "MUSIQUE");
  texte(1, 5, "A  JOUER OU ARRETER");
  texte(1, 6, "B  LA FANFARE");
  texte(1, 14, "ELLE AVANCE SEULE");
  texte(1, 15, "A CHAQUE IMAGE");

  /* Les deux voix partent ensemble, et bouclent : le quatrième argument. */
  jouer(1, THEME, 8, 1);
  jouer(2, BASSE, 8, 1);
  joue = 1;

  while (true) {
    image();

    uint8_t a = bouton(A);
    if (a && !ancienA) {
      if (joue) {
        silence(1);
        silence(2);
        joue = 0;
      } else {
        jouer(1, THEME, 8, 1);
        jouer(2, BASSE, 8, 1);
        joue = 1;
      }
    }
    ancienA = a;

    /*
     * La fanfare prend la voix 1 : elle interrompt la mélodie, la joue une
     * fois, et l'on rend la voix au thème quand « airFini » le dit. C'est le
     * même geste que dans un vrai jeu — un bruit de victoire par-dessus la
     * musique de fond.
     */
    uint8_t b = bouton(B);
    if (b && !ancienB && joue) {
      jouer(1, FANFARE, 6);
    }
    ancienB = b;

    if (joue && airFini(1)) jouer(1, THEME, 8, 1);

    /* Le témoin avance d'une case toutes les huit images — le pas de l'air. */
    if (images() % 8 == 0) {
      barre = barre + 1;
      if (barre > 20) barre = 0;
      montrerLeBattement();
    }

    /*
     * L'état ne se réécrit QUE lorsqu'il change.
     *
     * Vingt lettres par image suffisent à faire rater le VBlank : le jeu tombe
     * à trente images par seconde, « retard() » s'allume, et le témoin bat deux
     * fois trop lentement. La musique, elle, ne bronche pas — elle avance dans
     * l'interruption, et c'est précisément pour cela qu'elle y est.
     */
    if (joue != ancienEtat) {
      if (joue) texte(1, 12, "EN TRAIN DE JOUER ");
      else texte(1, 12, "SILENCE           ");
      ancienEtat = joue;
    }
  }

  return 0;
}

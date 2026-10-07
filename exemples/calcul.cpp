/*
 * MARIO CALCUL — une petite démo : un personnage à la Mario, et des calculs.
 *
 *   node outils/gb3.mjs exemples/calcul.cpp
 *
 * L'idée du jeu, en une phrase : le héros marche vers la droite, mais trois
 * portes « ? » lui barrent la route. Pour ouvrir une porte, il faut trouver le
 * résultat d'une addition ou d'une soustraction.
 *
 * Les touches :
 *   - GAUCHE / DROITE : marcher ;
 *   - A               : sauter (quand il n'y a pas de question) ;
 *   - HAUT / BAS      : changer la réponse (pendant une question) ;
 *   - A               : donner la réponse (pendant une question).
 *
 * Une bonne réponse ouvre la porte et donne une étoile. Une mauvaise réponse
 * ne fait rien perdre : on essaie encore, sur le même calcul.
 *
 * Ce n'est qu'un début : un seul écran, pas de défilement, pas d'ennemi. Tout
 * est écrit le plus simplement possible pour qu'on puisse le lire et le changer.
 */

#include <Tuile>      // un dessin de 8 × 8 pixels
#include <Perso>      // un personnage : un dessin de 16 × 16 pixels
#include <poser>      // pose une tuile sur une case du fond
#include <bande>      // pose la même tuile plusieurs fois d'affilée
#include <sprite16>   // place un personnage de 16 × 16 au pixel près
#include <texte>      // écrit un texte à l’écran
#include <effacer>    // efface un texte
#include <nombre>     // écrit un nombre en chiffres
#include <bouton>     // lit un bouton de la manette
#include <hasard>     // un nombre imprévisible
#include <ecran>      // éteint ou rallume l’écran pendant le gros dessin

/* ------------------------------------------------------------ les dessins */

/* Le sol : une brique, comme dans Mario. */
Tuile SOL = {
  "33333333",
  "32222223",
  "32122123",
  "32222223",
  "32221223",
  "32122223",
  "32222223",
  "33333333",
};

/* Une porte : un bloc « ? ». Empilés, ils font un mur qu'on ne peut pas sauter. */
Tuile PORTE = {
  "33333333",
  "31111113",
  "31133113",
  "31311313",
  "31113113",
  "31111113",
  "31131113",
  "33333333",
};

/* Le drapeau d'arrivée, et son mât. */
Tuile DRAPEAU = {
  "33000000",
  "33333300",
  "33333333",
  "33333300",
  "33000000",
  "33000000",
  "33000000",
  "33000000",
};
Tuile MAT = {
  "33000000",
  "33000000",
  "33000000",
  "33000000",
  "33000000",
  "33000000",
  "33000000",
  "33000000",
};

/* La police de la console n'a ni « + » ni « = » : on les dessine. */
Tuile PLUS = {
  "00000000",
  "00033000",
  "00033000",
  "03333330",
  "03333330",
  "00033000",
  "00033000",
  "00000000",
};
Tuile EGAL = {
  "00000000",
  "00000000",
  "03333330",
  "00000000",
  "00000000",
  "03333330",
  "00000000",
  "00000000",
};

/* Le héros, seize pixels sur seize. */
Perso HEROS = {
  "0000333333000000",
  "0003333333300000",
  "0003333333300000",
  "0002211131111000",
  "0021113111111000",
  "0021113111111000",
  "0022211111110000",
  "0000111111110000",
  "0003333333300000",
  "0033333333330000",
  "0011333333110000",
  "0011333333110000",
  "0011133331110000",
  "0002220022200000",
  "0022220022220000",
  "0022220022220000",
};

/* ------------------------------------------------------------ le décor */

/* Les colonnes des trois portes. Une case fait 8 pixels : la porte 0 commence
   au pixel 6 × 8 = 48. */
const uint8_t PORTES[] = { 6, 11, 16 };
const uint8_t NB_PORTES = 3;

const uint8_t HAUT_PORTE = 5;   // la première ligne du mur (trop haut pour sauter)
const uint8_t LIGNE_SOL = 16;   // le sol occupe les lignes 16 et 17
const uint8_t COL_DRAPEAU = 19;

/* Le héros a les pieds sur le sol : 16 × 8 = 128, moins sa taille, 16. */
const uint8_t Y_SOL = 112;

/* ------------------------------------------------------------ l'état du jeu */

uint8_t x = 8;            // la position du héros, en pixels
uint8_t y = Y_SOL;
uint8_t gauche = 0;       // 1 : il regarde à gauche
uint8_t saut = 0;         // les images de saut qui restent (0 : au sol)

uint8_t prochaine = 0;    // la porte qui barre la route (3 : toutes ouvertes)
uint8_t etoiles = 0;
uint8_t fini = 0;

uint8_t enQuestion = 0;   // 1 : une question est posée, le héros ne bouge plus
uint8_t a = 0;            // le calcul : a + b ou a - b
uint8_t b = 0;
uint8_t moins = 0;        // 0 : addition, 1 : soustraction
uint8_t juste = 0;        // le bon résultat
uint8_t reponse = 0;      // ce que le joueur propose

/* Pour réagir quand on APPUIE, et non tant qu'on tient le bouton : on garde
   l'état de l'image d'avant. */
uint8_t aAvant = 0;
uint8_t hautAvant = 0;
uint8_t basAvant = 0;

/* ------------------------------------------------------------ dessiner */

void dessinerDecor() {
  ecran(0);   // on éteint l'écran le temps de tout poser : pas de scintillement

  /* le sol, deux lignes */
  bande(0, LIGNE_SOL, SOL, 20);
  bande(0, LIGNE_SOL + 1, SOL, 20);

  /* les trois portes : chacune est une colonne de blocs « ? » */
  for (uint8_t p = 0; p < NB_PORTES; p++) {
    for (uint8_t l = HAUT_PORTE; l < LIGNE_SOL; l++) {
      poser(PORTES[p], l, PORTE);
    }
  }

  /* le drapeau, au bout */
  poser(COL_DRAPEAU, 11, DRAPEAU);
  for (uint8_t l = 12; l < LIGNE_SOL; l++) {
    poser(COL_DRAPEAU, l, MAT);
  }

  texte(1, 0, "ETOILES");
  nombre(9, 0, etoiles, 1);

  ecran(1);
}

/* Écrit un résultat (0 à 18) sur deux cases, sans zéro devant : « 7 » et non « 07 ». */
void ecrireReponse() {
  if (reponse < 10) {
    nombre(13, 2, reponse, 1);
    texte(14, 2, " ");
  } else {
    nombre(13, 2, reponse, 2);
  }
}

/* ------------------------------------------------------------ les questions */

void poserQuestion() {
  /* deux nombres de 1 à 9 : « % 8 » donne 0 à 7, « + 1 » donne 1 à 8,
     et on ajoute encore 0 ou 1 pour aller jusqu'à 9 */
  a = hasard() % 8 + 1 + hasard() % 2;
  b = hasard() % 8 + 1 + hasard() % 2;
  moins = hasard() % 2;

  /* Une soustraction ne doit jamais passer sous zéro : la console ne connaît
     pas les nombres négatifs. Si a est le plus petit, on échange a et b. */
  if (moins == 1 && a < b) {
    uint8_t t = a;
    a = b;
    b = t;
  }

  if (moins == 1) {
    juste = a - b;
  } else {
    juste = a + b;
  }

  /* La question s'écrit sur la ligne 2 :  « 7 + 5 = 0 »
     colonnes :                              5 7 9 11 13  */
  nombre(5, 2, a, 1);
  if (moins == 1) {
    texte(7, 2, "-");
  } else {
    poser(7, 2, PLUS);
  }
  nombre(9, 2, b, 1);
  poser(11, 2, EGAL);

  reponse = 0;
  ecrireReponse();
  effacer(0, 4, 20);
  texte(2, 4, "HAUT BAS PUIS A");

  enQuestion = 1;
}

void verifierReponse() {
  if (reponse == juste) {
    /* Bonne réponse : la porte disparaît, une étoile de plus. */
    for (uint8_t l = HAUT_PORTE; l < LIGNE_SOL; l++) {
      poser(PORTES[prochaine], l, 0);   // la tuile 0 est vide
    }
    prochaine++;
    etoiles++;
    nombre(9, 0, etoiles, 1);

    effacer(0, 2, 20);
    effacer(0, 4, 20);
    texte(6, 4, "BRAVO !");
    enQuestion = 0;
  } else {
    /* Mauvaise réponse : on le dit, et on garde la même question. */
    effacer(0, 4, 20);
    texte(1, 4, "NON ESSAIE ENCORE");
  }
}

/* Pendant une question : HAUT et BAS changent la réponse, A la donne. */
void tourDeQuestion() {
  uint8_t h = bouton(HAUT);
  uint8_t bas = bouton(BAS);
  uint8_t boutonA = bouton(A);

  if (h && !hautAvant && reponse < 18) {
    reponse++;
    ecrireReponse();
  }
  if (bas && !basAvant && reponse > 0) {
    reponse--;
    ecrireReponse();
  }
  if (boutonA && !aAvant) {
    verifierReponse();
  }

  hautAvant = h;
  basAvant = bas;
  aAvant = boutonA;
}

/* ------------------------------------------------------------ marcher, sauter */

void tourDeMarche() {
  uint8_t boutonA = bouton(A);

  /* GAUCHE : un pixel par image, sans sortir de l'écran */
  if (bouton(GAUCHE) && x > 0) {
    x--;
    gauche = 1;
  }

  /* DROITE : un pixel par image… sauf si une porte est fermée juste devant */
  if (bouton(DROITE)) {
    gauche = 0;
    if (prochaine < NB_PORTES && x + 16 >= PORTES[prochaine] * 8) {
      /* le héros touche la porte : la question arrive */
      if (saut == 0) {
        poserQuestion();
      }
    } else if (x < 144) {
      x++;
    }
  }

  /* A : un saut, seulement si l'on est au sol, et seulement à l'appui */
  if (boutonA && !aAvant && saut == 0) {
    saut = 24;
  }
  aAvant = boutonA;

  /* Le saut dure 24 images : 12 pour monter, 12 pour redescendre,
     de 2 pixels à chaque fois. Le héros monte donc de 24 pixels. */
  if (saut > 0) {
    if (saut > 12) {
      y = y - 2;
    } else {
      y = y + 2;
    }
    saut--;
  }

  /* L'arrivée : toutes les portes ouvertes, et le drapeau atteint */
  if (prochaine == NB_PORTES && x >= 136) {
    effacer(0, 4, 20);
    texte(3, 6, "GAGNE ! BRAVO");
    texte(2, 8, "3 PORTES OUVERTES");
    fini = 1;
  }
}

/* ------------------------------------------------------------ main */

int main() {
  dessinerDecor();
  texte(2, 4, "VA VERS LA DROITE");

  while (true) {
    image();   // une image : 60 fois par seconde

    if (fini == 0) {
      if (enQuestion == 1) {
        tourDeQuestion();
      } else {
        tourDeMarche();
      }
    }

    if (gauche == 1) {
      sprite16(0, x, y, HEROS, MIROIR_X);
    } else {
      sprite16(0, x, y, HEROS);
    }
  }
}

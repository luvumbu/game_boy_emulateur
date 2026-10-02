/*
 * Un bruitage, pas une musique : quelques notes courtes, jouées une fois au
 * moment d'un appui, plutôt qu'un « Air » qui avance tout seul en boucle.
 *
 *   node gb3.mjs exemples/effet-sonore.cpp
 *
 * « note(voix, hauteur, duree, volume) » joue UNE note et rend la main tout
 * de suite — sans attendre la fin de sa durée. Pour enchaîner « pièce », le
 * bip qui monte, il faut donc écarter les trois notes dans le temps
 * soi-même, une par une, au fil des images : c'est exactement le travail
 * qu'un « Air » évite pour une vraie musique (voir musique.cpp), mais qui
 * reste raisonnable pour un bruitage de trois notes qui ne rejoue jamais.
 *
 * « coup » et « fin », eux, tiennent en un seul appel : la note part et le
 * jeu continue aussitôt, sans rien à écarter.
 */

#include <note>     // joue une note
#include <bruit>    // joue un bruit
#include <texte>    // écrit un texte à l’écran
#include <bouton>   // lit un bouton de la manette

uint8_t avantA = 0;
uint8_t avantB = 0;
uint8_t avantStart = 0;

// Où en est le bruitage « pièce » : 0 = arrêté, sinon le pas en cours.
uint8_t pasPiece = 0;
uint8_t depuisLePas = 0;
const uint8_t IMAGES_PAR_PAS = 6;

void lancerPiece() {
  pasPiece = 1;
  depuisLePas = 0;
  note(1, DO5, IMAGES_PAR_PAS, 12);
}

void avancerPiece() {
  if (pasPiece == 0) return;

  depuisLePas++;
  if (depuisLePas < IMAGES_PAR_PAS) return;
  depuisLePas = 0;

  pasPiece++;
  if (pasPiece == 2) note(1, MI5, IMAGES_PAR_PAS, 12);
  if (pasPiece == 3) note(1, SOL5, 10, 13);
  if (pasPiece == 4) pasPiece = 0;  // la troisième note s'éteint seule
}

// Un coup sourd sur la voix du bruit : le héros touché.
void bruitageCoup() {
  bruit(14, 14);
}

// Une note qui tombe, sur les deux voix à la fois : la fin de la partie.
void bruitageFin() {
  note(1, DO4, 20, 13);
  note(2, DO3, 20, 13);
}

int main() {
  texte(1, 2, "A: PIECE (TROIS NOTES)");
  texte(1, 4, "B: COUP");
  texte(1, 6, "START: FIN DE PARTIE");

  while (true) {
    uint8_t a = bouton(A);
    uint8_t b = bouton(B);
    uint8_t s = bouton(START);

    if (a && !avantA) lancerPiece();
    if (b && !avantB) bruitageCoup();
    if (s && !avantStart) bruitageFin();
    avancerPiece();

    avantA = a;
    avantB = b;
    avantStart = s;

    image();
  }

  return 0;
}

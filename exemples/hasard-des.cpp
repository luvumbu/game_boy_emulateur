/*
 * Le hasard : un dé qu'on relance à chaque appui.
 *
 *   node gb3.mjs exemples/hasard-des.cpp
 *
 * « hasard() » lit le compteur libre du matériel : imprévisible, mais pas
 * réparti d'avance sur 1-6 — il rend un octet, 0 à 255. Le reste d'une
 * division par 6 suffit ici ; un jeu qui tire beaucoup mélange le résultat à
 * lui-même (comme fait tetris.cpp) pour ne pas répéter le même petit motif.
 *
 * « semer(images()) » choisit un point de départ différent à chaque partie :
 * sans lui, la console rendrait toujours la même première valeur, l'horloge
 * du matériel n'ayant pas encore tourné au moment où le jeu commence.
 */

#include <hasard>    // tire un nombre au hasard
#include <effacer>   // efface des cases, ou tout le fond
#include <nombre>    // écrit un nombre en chiffres
#include <semer>     // choisit le départ du hasard
#include <texte>     // écrit un texte à l’écran
#include <bouton>    // lit un bouton de la manette
#include <reste>     // a % b, sauf par 1, 2, 4, 8, 16… écrits en clair

uint8_t de = 1;
uint8_t avantA = 0;
uint8_t lances = 0;

// Une face de 1 à 6, tirée du hasard du matériel.
uint8_t lancerDe() {
  return hasard() % 6 + 1;
}

void dessinerDe(uint8_t face) {
  effacer(8, 6, "0");
  nombre(8, 6, face, 1);
}

int main() {
  semer(images());

  texte(2, 2, "A: LANCER LE DE");
  texte(2, 4, "FACE:");
  texte(2, 9, "LANCES:");
  dessinerDe(de);

  while (true) {
    uint8_t a = bouton(A);

    if (a && !avantA) {
      de = lancerDe();
      dessinerDe(de);
      lances++;
      nombre(10, 9, lances);
    }
    avantA = a;

    image();
  }

  return 0;
}

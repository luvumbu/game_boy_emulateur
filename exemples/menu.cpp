// Porté depuis menu.js par « node porter.mjs ».
//
// Le portage est littéral : il donne un programme juste, non un programme
// idiomatique. Les variables globales qui servaient d'arguments faute de
// mieux méritent de redevenir des arguments, et les portées de reprendre
// leur place — c'est là tout l'intérêt d'être passé au C++.

#include <texte>     // écrit un texte à l’écran
#include <poser>     // pose une tuile sur une case du fond
#include <ecran>     // éteint ou rallume l’écran
#include <effacer>   // efface des cases, ou tout le fond
#include <bouton>    // lit un bouton de la manette

uint8_t MENU = 0;
uint8_t JOUER = 1;
uint8_t REGLAGES = 2;
uint8_t CREDITS = 3;
uint8_t scene = 0;
uint8_t choix = 0;
uint8_t LIGNE_UN = 7;
uint8_t FLECHE = 40;
uint8_t haut = 0;
uint8_t bas = 0;
uint8_t a = 0;
uint8_t b = 0;
uint8_t hautAvant = 0;
uint8_t basAvant = 0;
uint8_t aAvant = 0;
uint8_t bAvant = 0;
uint8_t x = 0;
uint8_t y = 0;

void dessinerMenu() {
  texte(6, 2, "MON JEU");
  texte(5, 7, "JOUER");
  texte(5, 9, "REGLAGES");
  texte(5, 11, "CREDITS");
  texte(2, 16, "A CHOISIT");
}

void dessinerJouer() {
  texte(4, 6, "C EST PARTI");
  texte(3, 12, "B POUR REVENIR");
}

void dessinerReglages() {
  texte(5, 6, "REGLAGES");
  texte(3, 12, "B POUR REVENIR");
}

void dessinerCredits() {
  texte(5, 6, "CREDITS");
  texte(4, 8, "ECRIT EN JS");
  texte(3, 12, "B POUR REVENIR");
}

void dessinerCurseur() {
  poser(3, LIGNE_UN, 0);
  poser(3, LIGNE_UN + 2, 0);
  poser(3, LIGNE_UN + 4, 0);
  poser(3, LIGNE_UN + choix * 2, FLECHE);
}

void allerA() {
  ecran(0);
  effacer();
  if (scene == MENU) {
    dessinerMenu();
    dessinerCurseur();
  }
  if (scene == JOUER) {
    dessinerJouer();
  }
  if (scene == REGLAGES) {
    dessinerReglages();
  }
  if (scene == CREDITS) {
    dessinerCredits();
  }
  ecran(1);
}

int main() {
  scene = MENU;
  allerA();
  while (true) {
    image();
    haut = bouton(HAUT);
    bas = bouton(BAS);
    a = bouton(A);
    b = bouton(B);
    if (scene == MENU) {
      if (haut == 1) {
        if (hautAvant == 0) {
          if (choix > 0) {
            choix = choix - 1;
            dessinerCurseur();
          }
        }
      }
      if (bas == 1) {
        if (basAvant == 0) {
          if (choix < 2) {
            choix = choix + 1;
            dessinerCurseur();
          }
        }
      }
      if (a == 1) {
        if (aAvant == 0) {
          scene = choix + 1;
          allerA();
        }
      }
    } else {
      if (b == 1) {
        if (bAvant == 0) {
          scene = MENU;
          allerA();
        }
      }
    }
    hautAvant = haut;
    basAvant = bas;
    aAvant = a;
    bAvant = b;
  }

  return 0;
}

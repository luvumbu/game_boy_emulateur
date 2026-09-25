// Porté depuis ecrans.js par « node porter.mjs ».
//
// Le portage est littéral : il donne un programme juste, non un programme
// idiomatique. Les variables globales qui servaient d'arguments faute de
// mieux méritent de redevenir des arguments, et les portées de reprendre
// leur place — c'est là tout l'intérêt d'être passé au C++.

uint8_t TITRE = 0;
uint8_t JEU = 1;
uint8_t FIN = 2;
uint8_t scene = 0;
uint8_t a = 0;
uint8_t aAvant = 0;
uint8_t x = 0;
uint8_t y = 0;

void dessinerTitre() {
  texte(6, 5, "MON JEU");
  texte(4, 10, "A POUR JOUER");
}

void dessinerJeu() {
  texte(5, 4, "C EST PARTI");
  texte(4, 10, "A POUR FINIR");
}

void dessinerFin() {
  texte(7, 5, "FINI");
  texte(3, 10, "A POUR REVENIR");
}

void allerA() {
  ecran(0);
  effacer();
  if (scene == TITRE) {
    dessinerTitre();
  }
  if (scene == JEU) {
    dessinerJeu();
  }
  if (scene == FIN) {
    dessinerFin();
  }
  ecran(1);
}

int main() {
  scene = TITRE;
  allerA();
  while (true) {
    image();
    a = bouton(A);
    if (a == 1) {
      if (aAvant == 0) {
        if (scene == TITRE) {
          scene = JEU;
        } else {
          if (scene == JEU) {
            scene = FIN;
          } else {
            scene = TITRE;
          }
        }
        allerA();
      }
    }
    aAvant = a;
  }

  return 0;
}

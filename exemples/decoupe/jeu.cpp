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

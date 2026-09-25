/*
 * Le FRONT d'un bouton : la différence entre « appuyé » et « vient d'être
 * appuyé ». C'est l'équivalent de btnp() dans d'autres consoles fantaisie —
 * ici, il n'y a pas de fonction toute faite : on la construit en une ligne,
 * avec l'état d'avant.
 *
 *   node gb3.mjs exemples/bouton-front.cpp
 *
 * bouton(A) seul reste à 1 tant que le doigt reste dessus : sans mémoire de
 * l'image d'avant, un appui d'une demi-seconde compterait trente fois à
 * soixante images par seconde. « front() » ne rend 1 qu'à l'image où l'état
 * change de 0 à 1 — une seule fois par appui, quelle que soit sa durée.
 */

uint8_t avantA = 0;
uint8_t avantB = 0;
uint8_t coups = 0;
uint8_t tenu = 0;

// Un front : vrai seulement à l'image où le bouton PASSE de relâché à appuyé.
uint8_t front(uint8_t maintenant, uint8_t avant) {
  return maintenant == 1 && avant == 0;
}

int main() {
  texte(2, 2, "A: UN COUP PAR APPUI");
  texte(2, 4, "B: TENU (COMPTE TANT QUE)");
  texte(2, 8, "COUPS");
  texte(2, 11, "IMAGES B TENU");

  while (true) {
    uint8_t a = bouton(A);
    uint8_t b = bouton(B);

    if (front(a, avantA)) {
      coups++;
      nombre(8, 8, coups);
    }

    if (b) {
      tenu++;
    } else {
      tenu = 0;
    }
    nombre(14, 11, tenu);

    avantA = a;
    avantB = b;
    image();
  }

  return 0;
}

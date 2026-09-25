/*
 * La mémoire de la cartouche : ce qui survit à l'extinction.
 *
 *   node gb3.mjs exemples/donnees-persistantes.cpp
 *
 * « sauver(numero, valeur) » écrit dans la pile de la cartouche,
 * « sauvegarde(numero) » y relit — 256 cases, chacune un octet, et elles sont
 * encore là après avoir éteint et rallumé la console. Le compilateur pose et
 * referme le verrou lui-même à chaque accès : rien à faire de plus ici que
 * lire et écrire.
 *
 * À la toute première partie, la mémoire contient n'importe quoi — d'où la
 * case 0 réservée à une marque : si elle ne vaut pas 42, personne n'a encore
 * écrit ici, et le record part de zéro plutôt que d'un nombre au hasard.
 */

const uint8_t CASE_MARQUE = 0;
const uint8_t CASE_RECORD = 1;
const uint8_t MARQUE = 42;

uint8_t score = 0;
uint8_t record = 0;
uint8_t avantA = 0;

void chargerLeRecord() {
  if (sauvegarde(CASE_MARQUE) == MARQUE) {
    record = sauvegarde(CASE_RECORD);
  } else {
    record = 0;
    sauver(CASE_MARQUE, MARQUE);
    sauver(CASE_RECORD, 0);
  }
}

int main() {
  chargerLeRecord();

  texte(2, 2, "A: UN POINT");
  texte(2, 5, "SCORE");
  texte(2, 7, "RECORD (ETEINDRE-RALLUMER)");
  nombre(9, 5, score);
  nombre(9, 7, record);

  while (true) {
    uint8_t a = bouton(A);

    if (a && !avantA) {
      score++;
      nombre(9, 5, score);

      if (score > record) {
        record = score;
        sauver(CASE_RECORD, record);
        nombre(9, 7, record);
      }
    }
    avantA = a;

    image();
  }

  return 0;
}

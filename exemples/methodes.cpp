/*
 * Les méthodes : ce que « objet.methode() » doit faire, et faire seul.
 *
 * Chaque cas s'écrit dans une case de « pile », que « verifier-methodes.mjs »
 * relit dans la console. Une méthode qui compile n'écrit pas forcément dans le
 * bon objet : « troupe[i].avancer() » et « troupe[j].avancer() » se ressemblent
 * beaucoup dans la cartouche, et une adresse calculée de travers ne se voit
 * qu'ici.
 */

uint8_t pile[24];
uint8_t combien = 0;

void noter(uint8_t v) {
  pile[combien] = v;
  combien++;
}

struct Ennemi {
  uint8_t x, y, vie;

  void avancer()      { x++; }
  void reculer()      { x--; }
  uint8_t vivant()    { return vie > 0; }
  uint8_t somme()     { return x + y; }
  void blesser()      { if (vivant()) vie--; }
  uint8_t double_x()  { return x * 2; }
};

/* Une struct dont un champ est un tableau, atteint par « this ». */
struct Sac {
  uint8_t taille;
  uint8_t cases[4];

  void remplir() {
    for (uint8_t i = 0; i < 4; i++) cases[i] = i * 3;
    taille = 4;
  }
};

Ennemi troupe[3];
Ennemi boss;
Sac sac;

int main() {
  /* --- un objet nommé --- */
  boss.x = 10; boss.y = 5; boss.vie = 2;
  boss.avancer();
  noter(boss.x);                    // 11 — la méthode a écrit dans boss
  noter(boss.somme());              // 16 — elle lit deux champs
  noter(boss.vivant());             //  1

  boss.reculer();
  boss.reculer();
  noter(boss.x);                    //  9

  /* --- une case de tableau, index connu --- */
  troupe[0].x = 100; troupe[0].y = 1; troupe[0].vie = 3;
  troupe[1].x = 200; troupe[1].y = 2; troupe[1].vie = 0;
  troupe[2].x =  50; troupe[2].y = 3; troupe[2].vie = 1;

  troupe[1].avancer();
  noter(troupe[1].x);               // 201
  noter(troupe[0].x);               // 100 — le voisin n'a pas bougé
  noter(troupe[2].x);               //  50

  /* --- une case de tableau, index CALCULÉ --- */
  for (uint8_t i = 0; i < 3; i++) {
    if (troupe[i].vivant()) troupe[i].avancer();
  }
  noter(troupe[0].x);               // 101 — vivant, avancé
  noter(troupe[1].x);               // 201 — mort, immobile
  noter(troupe[2].x);               //  51 — vivant, avancé

  /* --- une méthode qui en appelle une autre sur le même objet --- */
  troupe[0].blesser();
  noter(troupe[0].vie);             //  2
  troupe[1].blesser();
  noter(troupe[1].vie);             //  0 — déjà mort, pas de débordement à 255

  /* --- la valeur rendue sert dans un calcul --- */
  noter(troupe[2].double_x());      // 102
  noter(boss.somme() + 1);          //  15

  /* --- un champ tableau atteint par « this » --- */
  sac.remplir();
  noter(sac.taille);                //  4
  noter(sac.cases[0]);              //  0
  noter(sac.cases[2]);              //  6
  noter(sac.cases[3]);              //  9

  /* --- l'objet en cours n'est pas perdu par un appel imbriqué --- */
  boss.vie = 5;
  boss.blesser();
  noter(boss.vie);                  //  4
  noter(boss.x);                    //  9 — blesser() n'a pas touché x

  return 0;
}

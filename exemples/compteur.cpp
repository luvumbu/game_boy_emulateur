// Un compteur, pour montrer les variables, les comparaisons et les fonctions.
//
//   node gb3.mjs exemples/compteur.cpp

#include <texte>    // écrit un texte à l’écran
#include <bouton>   // lit un bouton de la manette

const uint8_t MAXIMUM = 9;

uint8_t valeur = 5;

// Une fonction qui prend un argument et rend une valeur : c'est ce que le C++
// apporte ici. Le même « borner » sert dans les deux sens.
uint8_t borner(uint8_t v) {
  if (v > MAXIMUM) return MAXIMUM;
  return v;
}

int main() {
  texte(4, 3, "COMPTEUR");
  texte(2, 7, "HAUT ET BAS");

  uint8_t attente = 0;

  while (true) {
    image();

    // Une petite attente, sinon le compteur file trop vite pour être lu.
    attente++;

    if (attente > 8) {
      attente = 0;

      if (bouton(HAUT) && valeur < MAXIMUM) valeur = borner(valeur + 1);
      if (bouton(BAS) && valeur > 0) valeur--;
    }
  }

  return 0;
}

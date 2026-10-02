// Une cartouche Game Boy, écrite en C++.
//
// Ce fichier est du vrai C++ : votre éditeur le colore, et il se lit comme
// n'importe quel autre. Il n'est pas compilé par g++ — il est traduit en code
// machine SM83 et gravé dans une cartouche de 32 Ko qui démarre sur une
// console d'origine.
//
//   node gb3.mjs exemples/bonjour.cpp

#include <texte>    // écrit un texte à l’écran
#include <bouton>   // lit un bouton de la manette

int main() {
  texte(6, 4, "BONJOUR");
  texte(3, 8, "APPUIE SUR A");

  uint8_t compte = 0;

  while (true) {
    image(); // attend l'image suivante : soixante fois par seconde

    if (bouton(A)) {
      texte(3, 8, "BRAVO       ");
      compte++;
    }

    if (bouton(B)) {
      texte(3, 8, "APPUIE SUR A");
    }
  }

  return 0;
}

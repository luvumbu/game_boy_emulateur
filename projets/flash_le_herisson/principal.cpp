// #include <texte> : « ce programme se sert de texte() ».
// Une fonction de la console prend de la place dans la cartouche :
// elle ne s'emploie que si on l'inclut, par son nom. Sans cette ligne,
// le compilateur refuse texte() — et dit quelle ligne écrire.
#include <texte>   // écrit un texte à l’écran

int main() {          // Le programme commence ici.
  texte(0, 0, "A",);   // colonne 0, ligne 0 : la case en haut à gauche
                      // texte(colonne, ligne, "LETTRES") écrit des lettres à l'écran.
                      // L'écran fait 20 colonnes (0 à 19) sur 18 lignes (0 à 17).
                      // Les lettres à écrire se mettent entre guillemets.
                      // Écrit AVANT la boucle : une seule fois, et le A reste affiché.

  while (true) {      // La boucle de jeu : recommence pour toujours...
    image();          // ... attendre l'image suivante (60 par seconde).
  }
}

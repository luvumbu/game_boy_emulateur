// Le même programme que « ecrans.cpp », mais sur cinq fichiers.
//
//   node outils/gb3.mjs exemples/decoupe/principal.cpp
//
// « #include » verse le fichier voisin à cet endroit, avant que le
// compilateur ne voie quoi que ce soit — c’est ce que fait le préprocesseur
// de C++. L’ordre compte pour les variables : une globale doit être versée
// avant la fonction qui la nomme, comme si tout était collé bout à bout.

#include <texte>     // écrit un texte à l’écran
#include <ecran>     // éteint ou rallume l’écran
#include <effacer>   // efface des cases, ou tout le fond
#include <bouton>    // lit un bouton de la manette

#include "mesures.cpp"
#include "titre.cpp"
#include "dessins.cpp"
#include "jeu.cpp"

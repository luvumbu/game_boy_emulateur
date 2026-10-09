// ─────────────────────────────────────────────────────────────
// LES VARIABLES : écrites AVANT main(), elles existent pendant
// tout le programme et gardent leur valeur d'un tour à l'autre.
// uint8_t = un nombre entier de 0 à 255.
// ─────────────────────────────────────────────────────────────

#include <ALPHABET>   // les lettres de la police : ALPHABET[0] est le A
#include <poser>      // pose une tuile sur une case du fond

uint8_t lente = 0;          // QUELLE lettre montre la lente : 0 = A, 1 = B … 25 = Z
uint8_t rapide = 0;         // QUELLE lettre montre la rapide : 0 = A, 1 = B … 25 = Z

uint8_t imagesLente = 0;    // le CHRONOMÈTRE de la lente :
                            // combien d'images depuis son dernier changement
uint8_t imagesRapide = 0;   // le CHRONOMÈTRE de la rapide, séparé de l'autre

int main() {

  // La boucle de jeu : elle ne s'arrête JAMAIS.
  // Chaque tour dure exactement une image, soit 1/60e de seconde.
  while (true) {

    image();                // attend l'image suivante (≈ 16,7 ms) :
                            // c'est ce qui cadence la boucle à 60 tours par seconde

    // À chaque tour, UNE image est passée : les deux chronomètres
    // avancent d'un cran, en même temps, chacun de son côté.
    imagesLente++;          // ++ veut dire « ajoute 1 »
    imagesRapide++;

    // ── LA LENTE : elle change toutes les 60 images = toutes les secondes ──
    if (imagesLente == 120) {                    // == veut dire « est égal à ? »
                                                // (un seul = voudrait dire « range »)
      imagesLente = 0;                          // son chronomètre repart de zéro
      lente++;                                  // elle passe à la lettre suivante
      if (lente == sizeof(ALPHABET)) lente = 0; // sizeof(ALPHABET) = 26 :
                                                // après Z (25), 26 n'existe pas → retour à A (0)
    }

    // ── LA RAPIDE : elle change toutes les 15 images = 4 fois par seconde ──
    // (60 images ÷ 15 = 4 changements par seconde)
    if (imagesRapide == 15) {
      imagesRapide = 0;                            // son chronomètre repart de zéro
      rapide++;                                    // elle passe à la lettre suivante
      if (rapide == sizeof(ALPHABET)) rapide = 0;  // après Z, retour à A
    }

    // ── L'AFFICHAGE : à CHAQUE tour, on repose les deux lettres ──
    // Si rien n'a changé, on repose la même lettre au même endroit : ça ne se voit pas.
    // Si l'indice a changé, la nouvelle lettre écrase l'ancienne (comme au 0.3).
    poser(0, 0, ALPHABET[lente]);    // colonne 0, ligne 0 : la lente
    poser(0, 2, ALPHABET[rapide]);   // colonne 0, ligne 2 : la rapide
                                     // (la ligne 1 reste vide pour les séparer)
  }
}

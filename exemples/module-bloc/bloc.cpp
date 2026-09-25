/**
 * Le bloc qui tombe, en module — la partie réutilisable de « puits.cpp ».
 *
 *   #include "bloc.cpp"
 *
 * Tout ce qui vient d'ici commence par « bloc » : les constantes, le
 * tableau, la pièce qui tombe, les fonctions. C'est le prix à payer pour
 * qu'un programme puisse inclure ce fichier sans que ses propres LARGEUR,
 * MUR ou dessinerPuits() ne se fassent écraser — et ce que rend possible le
 * fait que « #include » ne soit ici qu'un collage de texte, sans espace de
 * noms pour s'en protéger tout seul.
 *
 * Le module ne fait ni écran ni boucle de jeu : c'est au programme qui
 * l'inclut de décider quand éteindre l'écran, quand lire la croix, et ce
 * qu'il advient d'une ligne pleine. Voir « principal.cpp » à côté.
 */

const uint8_t blocLargeur = 10;
const uint8_t blocHauteur = 16;
const uint8_t blocColonne = 5; // où le puits commence à l'écran
const uint8_t blocLigne = 1;

const uint8_t blocVide = 0;
const uint8_t blocMur = 40;  // le « : », qui fait un mur convenable
const uint8_t blocPiece = 41; // le « - »

uint8_t blocPuits[blocLargeur * blocHauteur];

/* La pièce qui tombe, et là où elle était dessinée à l'image précédente. */
uint8_t blocX = 4;
uint8_t blocY = 0;
uint8_t blocAncienX = 4;
uint8_t blocAncienY = 0;

// --- le puits ---------------------------------------------------------------

/** Une case du puits, par sa colonne et sa ligne. */
uint8_t blocCase(uint8_t x, uint8_t y) {
  return blocPuits[y * blocLargeur + x];
}

void blocPoserDansPuits(uint8_t x, uint8_t y, uint8_t quoi) {
  blocPuits[y * blocLargeur + x] = quoi;
}

void blocViderPuits() {
  for (uint8_t i = 0; i < blocLargeur * blocHauteur; i++) blocPuits[i] = blocVide;
}

// --- le dessin ----------------------------------------------------------------

void blocDessinerCadre() {
  for (uint8_t y = 0; y < blocHauteur; y++) {
    poser(blocColonne - 1, blocLigne + y, blocMur);
    poser(blocColonne + blocLargeur, blocLigne + y, blocMur);
  }
  for (uint8_t x = 0; x < blocLargeur + 2; x++) {
    poser(blocColonne - 1 + x, blocLigne + blocHauteur, blocMur);
  }
}

/** Le puits en entier : une seule fois, écran éteint. */
void blocDessinerPuits() {
  for (uint8_t y = 0; y < blocHauteur; y++) {
    for (uint8_t x = 0; x < blocLargeur; x++) {
      poser(blocColonne + x, blocLigne + y, blocCase(x, y));
    }
  }
}

/** Prépare le puits : à appeler une fois, écran éteint. */
void blocInitialiser() {
  blocViderPuits();
  blocDessinerCadre();
  blocDessinerPuits();
}

/*
 * Rendre à l'écran la case que la pièce vient de quitter : ce qui s'y
 * trouve vraiment, c'est-à-dire le contenu du puits — un bloc posé, ou du
 * vide.
 */
void blocEffacerAncienne() {
  poser(blocColonne + blocAncienX, blocLigne + blocAncienY, blocCase(blocAncienX, blocAncienY));
}

void blocDessinerPiece() {
  poser(blocColonne + blocX, blocLigne + blocY, blocPiece);
  blocAncienX = blocX;
  blocAncienY = blocY;
}

// --- la pièce -------------------------------------------------------------

/** La case sous la pièce est-elle franchissable ? */
uint8_t blocPlaceLibreDessous() {
  if (blocY >= blocHauteur - 1) return 0;
  return blocCase(blocX, blocY + 1) == blocVide;
}

void blocAGauche() {
  if (blocX > 0) blocX--;
}

void blocADroite() {
  if (blocX < blocLargeur - 1) blocX++;
}

/**
 * Fait descendre la pièce d'une case si la place est libre ; sinon la pose
 * dans le puits et en relance une nouvelle du haut.
 *
 * Rend 1 la seule image où la pièce vient de se poser — c'est le signal que
 * le programme appelant attend pour vérifier une ligne pleine, marquer un
 * point, ou refuser une pièce posée trop haut.
 */
uint8_t blocDescendre() {
  if (blocPlaceLibreDessous()) {
    blocY++;
    return 0;
  }

  blocPoserDansPuits(blocX, blocY, blocPiece);
  blocX = 4;
  blocY = 0;
  return 1;
}

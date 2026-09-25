// Le puits de Tetris, en C++.
//
// Un bloc tombe, s'arrête sur le fond ou sur ce qui est déjà posé, et un
// nouveau repart du haut. C'est le cœur de Tetris : un tableau, des
// collisions, et un affichage qui suit.
//
//   node gb3.mjs exemples/puits.cpp
//
// Deux idées portent tout le fichier :
//
//   1. Le tableau « puits » ne contient QUE ce qui est posé. La pièce qui
//      tombe vit à côté, dans px et py. Mêler les deux obligerait à effacer la
//      pièce du tableau avant chaque test de collision — et un oubli ferait
//      qu'elle se heurte à elle-même.
//
//   2. On ne redessine que les cases qui changent. Repeindre les 160 cases à
//      chaque image demande bien plus de temps qu'une image n'en contient : la
//      descente devenait trois fois trop lente, sans que rien ne le signale.

const uint8_t LARGEUR = 10;
const uint8_t HAUTEUR = 16;
const uint8_t COLONNE = 5; // où le puits commence à l'écran
const uint8_t LIGNE = 1;

const uint8_t VIDE = 0;
const uint8_t MUR = 40;  // le « : », qui fait un mur convenable
const uint8_t BLOC = 41; // le « - »

uint8_t puits[LARGEUR * HAUTEUR];

/* La pièce qui tombe, et là où elle était dessinée à l'image précédente. */
uint8_t px = 4;
uint8_t py = 0;
uint8_t ax = 4;
uint8_t ay = 0;

// --- le puits ---------------------------------------------------------------

/*
 * Une case du puits, par sa colonne et sa ligne.
 *
 * Le calcul « ligne × largeur + colonne » n'est écrit qu'ici. Le recopier à
 * chaque accès finit par produire un « y * 10 + x » quelque part où la largeur
 * a changé — et le puits se lit alors de travers, sans une erreur.
 */
uint8_t caseDuPuits(uint8_t x, uint8_t y) {
  return puits[y * LARGEUR + x];
}

void poserDansLePuits(uint8_t x, uint8_t y, uint8_t quoi) {
  puits[y * LARGEUR + x] = quoi;
}

void viderPuits() {
  for (uint8_t i = 0; i < LARGEUR * HAUTEUR; i++) puits[i] = VIDE;
}

// --- le dessin --------------------------------------------------------------

void dessinerCadre() {
  for (uint8_t y = 0; y < HAUTEUR; y++) {
    poser(COLONNE - 1, LIGNE + y, MUR);
    poser(COLONNE + LARGEUR, LIGNE + y, MUR);
  }
  for (uint8_t x = 0; x < LARGEUR + 2; x++) {
    poser(COLONNE - 1 + x, LIGNE + HAUTEUR, MUR);
  }
}

/** Le puits en entier : une seule fois, écran éteint. */
void dessinerPuits() {
  for (uint8_t y = 0; y < HAUTEUR; y++) {
    for (uint8_t x = 0; x < LARGEUR; x++) {
      poser(COLONNE + x, LIGNE + y, caseDuPuits(x, y));
    }
  }
}

/*
 * Rendre à l'écran la case que la pièce vient de quitter : ce qui s'y trouve
 * vraiment, c'est-à-dire le contenu du puits — un bloc posé, ou du vide.
 */
void effacerAncienne() {
  poser(COLONNE + ax, LIGNE + ay, caseDuPuits(ax, ay));
}

void dessinerPiece() {
  poser(COLONNE + px, LIGNE + py, BLOC);
  ax = px;
  ay = py;
}

// --- la pièce ---------------------------------------------------------------

/** La case sous la pièce est-elle franchissable ? */
uint8_t placeDessous() {
  if (py >= HAUTEUR - 1) return 0;
  return caseDuPuits(px, py + 1) == VIDE;
}

// --- le jeu -----------------------------------------------------------------

int main() {
  texte(1, 0, "PUITS");

  ecran(0); // écran éteint : on a le temps de tout dessiner
  viderPuits();
  dessinerCadre();
  dessinerPuits();
  ecran(1);

  dessinerPiece();

  /*
   * L'état de la croix à l'image précédente : sans lui, maintenir GAUCHE
   * traverse le puits en quatre images. On agit au FRONT, c'est-à-dire au
   * moment précis où le bouton passe de relâché à enfoncé.
   */
  uint8_t gaucheAvant = 0;
  uint8_t droiteAvant = 0;
  uint8_t attente = 0;

  while (true) {
    image();

    uint8_t gauche = bouton(GAUCHE);
    uint8_t droite = bouton(DROITE);

    if (gauche && !gaucheAvant && px > 0) px--;
    if (droite && !droiteAvant && px < LARGEUR - 1) px++;

    gaucheAvant = gauche;
    droiteAvant = droite;

    // La descente, une fois toutes les vingt images — ou tout de suite si BAS.
    attente++;
    if (bouton(BAS)) attente = 20;

    if (attente > 19) {
      attente = 0;

      if (placeDessous()) {
        py++;
      } else {
        // La pièce se pose, et une nouvelle repart du haut.
        poserDansLePuits(px, py, BLOC);
        px = 4;
        py = 0;
      }
    }

    effacerAncienne();
    dessinerPiece();
  }

  return 0;
}

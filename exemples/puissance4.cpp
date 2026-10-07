// PUISSANCE 4 — le Père Noël contre le bonhomme de neige.
//
// Deux joueurs, chacun son tour, sur la même console. On choisit une colonne
// avec GAUCHE et DROITE, on lâche son jeton avec A : il tombe tout en bas de
// la colonne. Le premier qui en aligne QUATRE — en ligne, en colonne ou en
// diagonale — a gagné. START rejoue.
//
// Les jetons sont deux images de la série 3, dessinées UNE fois en 16 × 16 :
// le Père Noël et le bonhomme de neige. L'écran titre les montre quatre fois
// plus grands avec poser(…, 4) — le même dessin, agrandi par le compilateur.
//
// Le plateau est fait de cases de 16 × 16 : quatre tuiles du fond chacune.
// Chaque case a sa palette (Game Boy Color) : le même dessin de jeton prend
// les couleurs du Père Noël ou du bonhomme, sur le bleu du plateau.

#include <poser>          // pose une tuile sur une case du fond
#include <texte>          // écrit un texte à l’écran
#include <bouton>         // lit un bouton de la manette
#include <ecran>          // éteint ou rallume l’écran
#include <sprite16>       // le jeton qu’on tient, au-dessus du plateau
#include <Perso>          // un dessin de 16 × 16
#include <Tuile>          // un dessin de 8 × 8
#include <multiplier>     // a * b
#include <couleurFond>    // une couleur du décor
#include <couleurLutin>   // une couleur des lutins
#include <teindre>        // une case du fond prend une palette
#include <teindreLutin>   // un lutin prend une palette

// ------------------------------------------------------------- les dessins

// 3.01 Le Père Noël — style manga : grands yeux, bonnet, barbe (série 3)
Perso PERE_NOEL = {
  ".........###.##.",
  ".......##+++#--#",
  ".....##++++++##.",
  "....#+++++++++#.",
  "...#+++++++++++#",
  "..#------------#",
  "..#-##------##-#",
  "..#-##------##-#",
  "..#-+--------+-#",
  ".#---##-++-##--#",
  ".#--#--####--#-#",
  ".#-------------#",
  "..#-----------#.",
  "...#---------#..",
  "....##-----##...",
  "......#####.....",
};

// 3.02 Le bonhomme de neige — un chapeau, une écharpe, deux boules (série 3)
Perso BONHOMME_NEIGE = {
  ".....######.....",
  ".....#####+.....",
  "...##########...",
  ".....#----#.....",
  "....#-#--#-#....",
  "....#--++--#....",
  ".....#----#.....",
  "...##++++++##...",
  "..#-----+#---#..",
  ".#------+#----#.",
  ".#-----#------#.",
  "#------#-------#",
  "#--------------#",
  ".#-----#------#.",
  "..#----------#..",
  "...##########...",
};

// Une case vide du plateau : le bleu, et un trou rond.
Perso TROU = {
  "++++++++++++++++",
  "+++++######+++++",
  "+++##......##+++",
  "++#..........#++",
  "++#..........#++",
  "+#............#+",
  "+#............#+",
  "+#............#+",
  "+#............#+",
  "+#............#+",
  "+#............#+",
  "++#..........#++",
  "++#..........#++",
  "+++##......##+++",
  "+++++######+++++",
  "++++++++++++++++",
};

// Une case de l’écran sans rien.
Tuile VIDE = {
  "........",
  "........",
  "........",
  "........",
  "........",
  "........",
  "........",
  "........",
};

// -------------------------------------------------------- les constantes

const uint8_t COLONNES = 7;    // le plateau : 7 colonnes…
const uint8_t LIGNES = 6;      // … de 6 cases
const uint8_t BORD_X = 3;      // la case (0, 0) du plateau, en tuiles de l’écran
const uint8_t BORD_Y = 4;

const uint8_t P_ECRAN = 0;     // les palettes du fond
const uint8_t P_TROU = 1;
const uint8_t P_NOEL = 2;
const uint8_t P_NEIGE = 3;

const uint8_t PERSONNE = 0;    // ce qu’il y a dans une case
const uint8_t NOEL = 1;
const uint8_t NEIGE = 2;

// --------------------------------------------------------- les variables

uint8_t grille[42];            // 7 × 6 cases, rangée par rangée, celle du haut d’abord
uint8_t joueur = NOEL;         // à qui le tour
uint8_t colonne = 3;           // la colonne choisie
uint8_t coups = 0;             // les jetons posés
uint8_t fini = 0;              // 0 : on joue ; 1 : gagné ; 2 : plus de place
uint8_t gauche = 0;
uint8_t droite = 0;
uint8_t lacher = 0;
uint8_t debut = 0;
uint8_t gaucheAvant = 0;
uint8_t droiteAvant = 0;
uint8_t lacherAvant = 0;
uint8_t debutAvant = 0;

// --------------------------------------------------------- les couleurs

void couleurs() {
  // l’écran : un ciel pâle, du blanc, du rouge, du noir
  couleurFond(P_ECRAN, 0, 26, 29, 31);
  couleurFond(P_ECRAN, 1, 31, 31, 31);
  couleurFond(P_ECRAN, 2, 28, 4, 4);
  couleurFond(P_ECRAN, 3, 2, 2, 6);
  // le plateau : le trou bleu nuit, le bleu, le contour
  couleurFond(P_TROU, 0, 2, 3, 10);
  couleurFond(P_TROU, 1, 31, 31, 31);
  couleurFond(P_TROU, 2, 6, 10, 28);
  couleurFond(P_TROU, 3, 1, 2, 8);
  // le jeton du Père Noël, sur le bleu
  couleurFond(P_NOEL, 0, 6, 10, 28);
  couleurFond(P_NOEL, 1, 31, 31, 31);
  couleurFond(P_NOEL, 2, 30, 4, 4);
  couleurFond(P_NOEL, 3, 2, 2, 6);
  // le jeton du bonhomme de neige, sur le bleu
  couleurFond(P_NEIGE, 0, 6, 10, 28);
  couleurFond(P_NEIGE, 1, 31, 31, 31);
  couleurFond(P_NEIGE, 2, 31, 18, 0);
  couleurFond(P_NEIGE, 3, 2, 2, 6);
  // les jetons qu’on tient (la teinte 0 des lutins est transparente)
  couleurLutin(0, 1, 31, 31, 31);
  couleurLutin(0, 2, 30, 4, 4);
  couleurLutin(0, 3, 2, 2, 6);
  couleurLutin(1, 1, 31, 31, 31);
  couleurLutin(1, 2, 31, 18, 0);
  couleurLutin(1, 3, 2, 2, 6);
}

// ------------------------------------------------------- l’écran, case par case

/* Une image de 16 × 16 dans le fond : ses quatre tuiles se suivent (haut-gauche,
   haut-droite, bas-gauche, bas-droite), et chacune prend la palette. */
void poserImage(uint8_t c, uint8_t l, uint8_t dessin, uint8_t palette) {
  poser(c, l, dessin);
  poser(c + 1, l, dessin + 1);
  poser(c, l + 1, dessin + 2);
  poser(c + 1, l + 1, dessin + 3);
  teindre(c, l, palette);
  teindre(c + 1, l, palette);
  teindre(c, l + 1, palette);
  teindre(c + 1, l + 1, palette);
}

void effacerEcran() {
  for (uint8_t y = 0; y < 18; y++) {
    for (uint8_t x = 0; x < 20; x++) {
      poser(x, y, VIDE);
      teindre(x, y, P_ECRAN);
    }
  }
}

void dessinerCase(uint8_t c, uint8_t l) {
  uint8_t v = grille[l * COLONNES + c];
  uint8_t x = BORD_X + c * 2;
  uint8_t y = BORD_Y + l * 2;
  if (v == NOEL) {
    poserImage(x, y, PERE_NOEL, P_NOEL);
  } else if (v == NEIGE) {
    poserImage(x, y, BONHOMME_NEIGE, P_NEIGE);
  } else {
    poserImage(x, y, TROU, P_TROU);
  }
}

void dessinerPlateau() {
  for (uint8_t l = 0; l < LIGNES; l++) {
    for (uint8_t c = 0; c < COLONNES; c++) {
      dessinerCase(c, l);
    }
  }
}

/* Le jeton qu’on tient, au-dessus de la colonne choisie. */
void montrerJeton() {
  uint8_t x = (BORD_X + colonne * 2) * 8;
  if (joueur == NOEL) {
    sprite16(0, x, 16, PERE_NOEL);
  } else {
    sprite16(0, x, 16, BONHOMME_NEIGE);
  }
  for (uint8_t i = 0; i < 4; i++) {
    teindreLutin(i, joueur - 1);
  }
}

void direLeTour() {
  if (joueur == NOEL) {
    texte(1, 1, "AU PERE NOEL     ");
  } else {
    texte(1, 1, "AU BONHOMME      ");
  }
}

// ------------------------------------------------------------------ le jeu

/* Combien de jetons du joueur, à la suite, en partant de (c, l) dans une
   direction. Un pas de -1 s’écrit 255 : en uint8_t, 0 + 255 donne 255, qui
   n’est plus dans le plateau — la boucle s’arrête au bord toute seule. */
uint8_t compter(uint8_t c, uint8_t l, uint8_t dc, uint8_t dl) {
  uint8_t n = 0;
  uint8_t x = c + dc;
  uint8_t y = l + dl;
  while (x < COLONNES && y < LIGNES && grille[y * COLONNES + x] == joueur) {
    n = n + 1;
    x = x + dc;
    y = y + dl;
  }
  return n;
}

/* Quatre alignés, en passant par (c, l) ? Dans les quatre directions, on
   compte des deux côtés, plus le jeton lui-même. */
uint8_t gagne(uint8_t c, uint8_t l) {
  if (1 + compter(c, l, 1, 0) + compter(c, l, 255, 0) >= 4) return 1;      // en ligne
  if (1 + compter(c, l, 0, 1) + compter(c, l, 0, 255) >= 4) return 1;      // en colonne
  if (1 + compter(c, l, 1, 1) + compter(c, l, 255, 255) >= 4) return 1;    // en diagonale ↘
  if (1 + compter(c, l, 1, 255) + compter(c, l, 255, 1) >= 4) return 1;    // en diagonale ↗
  return 0;
}

/* Le jeton tombe dans la colonne choisie : la case vide la plus basse. */
void lacherJeton() {
  uint8_t l = LIGNES;
  uint8_t trouve = 0;
  while (l > 0 && trouve == 0) {
    l = l - 1;
    if (grille[l * COLONNES + colonne] == PERSONNE) trouve = 1;
  }
  if (trouve == 0) return;                // colonne pleine : rien ne se passe
  grille[l * COLONNES + colonne] = joueur;
  dessinerCase(colonne, l);
  coups = coups + 1;
  if (gagne(colonne, l) == 1) {
    fini = 1;
    if (joueur == NOEL) {
      texte(1, 1, "LE PERE NOEL GAGNE");
    } else {
      texte(1, 1, "LE BONHOMME GAGNE ");
    }
    texte(2, 16, "START : REJOUER");
    return;
  }
  if (coups == COLONNES * LIGNES) {
    fini = 2;
    texte(1, 1, "MATCH NUL         ");
    texte(2, 16, "START : REJOUER");
    return;
  }
  joueur = 3 - joueur;                    // NOEL (1) ↔ NEIGE (2)
  direLeTour();
}

void nouvellePartie() {
  ecran(0);
  for (uint8_t i = 0; i < 42; i++) grille[i] = PERSONNE;
  joueur = NOEL;
  colonne = 3;
  coups = 0;
  fini = 0;
  effacerEcran();
  dessinerPlateau();
  direLeTour();
  ecran(1);
}

/* L’écran titre : les deux images, quatre fois plus grandes (64 × 64). */
void titre() {
  ecran(0);
  effacerEcran();
  texte(4, 1, "PUISSANCE 4");
  poser(1, 4, PERE_NOEL, 4);
  poser(11, 4, BONHOMME_NEIGE, 4);
  texte(9, 7, "VS");
  texte(2, 14, "APPUIE SUR START");
  ecran(1);
  while (bouton(START) == 0) {
    image();
  }
  while (bouton(START) == 1) {
    image();
  }
}

int main() {
  couleurs();
  titre();
  nouvellePartie();
  while (true) {
    image();
    gauche = bouton(GAUCHE);
    droite = bouton(DROITE);
    lacher = bouton(A);
    debut = bouton(START);
    if (fini == 0) {
      if (gauche == 1 && gaucheAvant == 0 && colonne > 0) colonne = colonne - 1;
      if (droite == 1 && droiteAvant == 0 && colonne < COLONNES - 1) colonne = colonne + 1;
      if (lacher == 1 && lacherAvant == 0) lacherJeton();
      montrerJeton();
    } else if (debut == 1 && debutAvant == 0) {
      nouvellePartie();
    }
    gaucheAvant = gauche;
    droiteAvant = droite;
    lacherAvant = lacher;
    debutAvant = debut;
  }
  return 0;
}

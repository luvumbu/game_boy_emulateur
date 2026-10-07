// COULEURS — un jeu de cartes dans le style du UNO : toi contre la console.
//
// Chacun reçoit 7 cartes. À ton tour, pose une carte de la MÊME COULEUR ou du
// MÊME CHIFFRE que celle du dessus (au milieu) — ou un joker. GAUCHE et
// DROITE choisissent la carte, A la pose, B pioche (et passe la main). Le
// premier qui n'a plus de cartes a gagné.
//
//   - PASSE et INVERSE : l'autre passe son tour, tu rejoues ;
//   - +2 : l'autre pioche deux cartes et passe son tour ;
//   - JOKER : il se pose sur tout, et tu choisis la couleur (GAUCHE, DROITE, A).
//
// Les cartes spéciales sont des images de la série 3, dessinées UNE fois en
// 16 × 16 : passe, inverse, +2, joker. Le dos des cartes est le cadeau.
// L'écran titre montre le joker et le Père Noël quatre fois plus grands, avec
// poser(…, 4). Les chiffres des cartes sont dessinés ici, dans le programme.
// Chaque carte prend la palette de sa couleur (Game Boy Color).

#include <poser>          // pose une tuile sur une case du fond
#include <texte>          // écrit un texte à l’écran
#include <nombre>         // écrit un nombre
#include <bouton>         // lit un bouton de la manette
#include <ecran>          // éteint ou rallume l’écran
#include <hasard>         // tire un nombre au hasard
#include <sprite16>       // le cadre de la carte choisie
#include <Perso>          // un dessin de 16 × 16
#include <Tuile>          // un dessin de 8 × 8
#include <multiplier>     // a * b
#include <reste>          // a % b : le reste d’une division
#include <diviser>        // a / b
#include <couleurFond>    // une couleur du décor
#include <couleurLutin>   // une couleur des lutins
#include <teindre>        // une case du fond prend une palette
#include <teindreLutin>   // un lutin prend une palette

// ------------------------------------------------------------- les dessins

// 3.14 La carte « passe ton tour » — un rond barré (série 3)
Perso PASSE = {
  "................",
  ".....######.....",
  "...##------##...",
  "..#----------#..",
  "..#-------##-#..",
  ".#-------##---#.",
  ".#------##----#.",
  ".#-----##-----#.",
  ".#----##------#.",
  ".#---##-------#.",
  ".#--##--------#.",
  "..#-#--------#..",
  "..#----------#..",
  "...##------##...",
  ".....######.....",
  "................",
};

// 3.15 La carte « inverse » — deux flèches qui tournent (série 3)
Perso INVERSE = {
  "................",
  "......#.........",
  "......##........",
  "..#######.......",
  ".#------##......",
  ".#-######.......",
  ".#-#..##........",
  ".#-#..#.....#-#.",
  ".#-#.....#..#-#.",
  "........##..#-#.",
  ".......######-#.",
  "......##------#.",
  ".......#######..",
  "........##......",
  ".........#......",
  "................",
};

// 3.16 La carte « +2 » — deux cartes et un plus (série 3)
Perso PLUS2 = {
  "................",
  "................",
  "..........####..",
  "...##....##..##.",
  "...##........##.",
  ".######.....##..",
  ".######....##...",
  "...##.....##....",
  "...##....##.....",
  ".........######.",
  "................",
  "..############..",
  "..#----------#..",
  "..############..",
  "................",
  "................",
};

// 3.17 La carte « joker » — quatre couleurs, une étoile (série 3)
Perso JOKER = {
  "................",
  ".....######.....",
  "...##--##++##...",
  "..#----##++++#..",
  ".#-----##+++++#.",
  ".#----####++++#.",
  "#----##..##+++#.",
  "#########..####.",
  "#++++##..##----#",
  ".#+++####-----#.",
  ".#++++##------#.",
  "..#+++##-----#..",
  "...##+##--##....",
  ".....######.....",
  "................",
  "................",
};

// 3.04 Le cadeau — un paquet et son nœud (série 3)
Perso CADEAU = {
  "....##....##....",
  "...#--#..#--#...",
  "...#---##---#...",
  "....##-##-##....",
  ".##############.",
  ".#-----##-----#.",
  ".#-----##-----#.",
  ".##############.",
  "..#++++##++++#..",
  "..#++++##++++#..",
  "..#++++##++++#..",
  "..#++++##++++#..",
  "..#++++##++++#..",
  "..#++++##++++#..",
  "..############..",
  "................",
};

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

// Les cartes à chiffre : le fond de la carte prend la couleur (teinte 0), le
// chiffre est blanc (« - »), le bord noir (« # »).
Perso CARTE_0 = {
  ".##############.",
  "#..............#",
  "#..............#",
  "#....------....#",
  "#....------#...#",
  "#....--##--#...#",
  "#....--#.--#...#",
  "#....--#.--#...#",
  "#....--#.--#...#",
  "#....--#.--#...#",
  "#....--#.--#...#",
  "#....------#...#",
  "#....------#...#",
  "#.....######...#",
  "#..............#",
  ".##############.",
};

Perso CARTE_1 = {
  ".##############.",
  "#..............#",
  "#..............#",
  "#......--......#",
  "#......--#.....#",
  "#....----#.....#",
  "#....----#.....#",
  "#.....#--#.....#",
  "#......--#.....#",
  "#......--#.....#",
  "#......--#.....#",
  "#....------....#",
  "#....------#...#",
  "#.....######...#",
  "#..............#",
  ".##############.",
};

Perso CARTE_2 = {
  ".##############.",
  "#..............#",
  "#..............#",
  "#....------....#",
  "#....------#...#",
  "#.....###--#...#",
  "#........--#...#",
  "#....------#...#",
  "#....------#...#",
  "#....--#####...#",
  "#....--#.......#",
  "#....------....#",
  "#....------#...#",
  "#.....######...#",
  "#..............#",
  ".##############.",
};

Perso CARTE_3 = {
  ".##############.",
  "#..............#",
  "#..............#",
  "#....------....#",
  "#....------#...#",
  "#.....###--#...#",
  "#........--#...#",
  "#....------#...#",
  "#....------#...#",
  "#.....###--#...#",
  "#........--#...#",
  "#....------#...#",
  "#....------#...#",
  "#.....######...#",
  "#..............#",
  ".##############.",
};

Perso CARTE_4 = {
  ".##############.",
  "#..............#",
  "#..............#",
  "#....--..--....#",
  "#....--#.--#...#",
  "#....--#.--#...#",
  "#....--#.--#...#",
  "#....------#...#",
  "#....------#...#",
  "#.....###--#...#",
  "#........--#...#",
  "#........--#...#",
  "#........--#...#",
  "#.........##...#",
  "#..............#",
  ".##############.",
};

Perso CARTE_5 = {
  ".##############.",
  "#..............#",
  "#..............#",
  "#....------....#",
  "#....------#...#",
  "#....--#####...#",
  "#....--#.......#",
  "#....------....#",
  "#....------#...#",
  "#.....###--#...#",
  "#........--#...#",
  "#....------#...#",
  "#....------#...#",
  "#.....######...#",
  "#..............#",
  ".##############.",
};

Perso CARTE_6 = {
  ".##############.",
  "#..............#",
  "#..............#",
  "#....------....#",
  "#....------#...#",
  "#....--#####...#",
  "#....--#.......#",
  "#....------....#",
  "#....------#...#",
  "#....--##--#...#",
  "#....--#.--#...#",
  "#....------#...#",
  "#....------#...#",
  "#.....######...#",
  "#..............#",
  ".##############.",
};

Perso CARTE_7 = {
  ".##############.",
  "#..............#",
  "#..............#",
  "#....------....#",
  "#....------#...#",
  "#.....###--#...#",
  "#........--#...#",
  "#......--.##...#",
  "#......--#.....#",
  "#......--#.....#",
  "#......--#.....#",
  "#......--#.....#",
  "#......--#.....#",
  "#.......##.....#",
  "#..............#",
  ".##############.",
};

Perso CARTE_8 = {
  ".##############.",
  "#..............#",
  "#..............#",
  "#....------....#",
  "#....------#...#",
  "#....--##--#...#",
  "#....--#.--#...#",
  "#....------#...#",
  "#....------#...#",
  "#....--##--#...#",
  "#....--#.--#...#",
  "#....------#...#",
  "#....------#...#",
  "#.....######...#",
  "#..............#",
  ".##############.",
};

Perso CARTE_9 = {
  ".##############.",
  "#..............#",
  "#..............#",
  "#....------....#",
  "#....------#...#",
  "#....--##--#...#",
  "#....--#.--#...#",
  "#....------#...#",
  "#....------#...#",
  "#.....###--#...#",
  "#........--#...#",
  "#....------#...#",
  "#....------#...#",
  "#.....######...#",
  "#..............#",
  ".##############.",
};

Perso CADRE = {
  "####........####",
  "#..............#",
  "#..............#",
  "#..............#",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "#..............#",
  "#..............#",
  "#..............#",
  "####........####",
};

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

// une carte : sa couleur × 16 + sa valeur
const uint8_t ROUGE = 0;
const uint8_t JAUNE = 1;
const uint8_t VERT = 2;
const uint8_t BLEU = 3;
const uint8_t NOIRE = 4;        // la couleur des jokers
const uint8_t V_PASSE = 10;
const uint8_t V_INVERSE = 11;
const uint8_t V_PLUS2 = 12;
const uint8_t V_JOKER = 13;
const uint8_t RIEN = 255;

const uint8_t P_TABLE = 0;      // les palettes du fond : la table…
const uint8_t P_ROUGE = 1;      // … une par couleur de carte (P_ROUGE + couleur)
const uint8_t P_JAUNE = 2;
const uint8_t P_VERT = 3;
const uint8_t P_BLEU = 4;
const uint8_t P_JOKER = 5;
const uint8_t P_DOS = 6;
const uint8_t P_TITRE = 7;    // les deux grandes images de l’écran titre : un vrai noir

const uint8_t TOI = 1;
const uint8_t CONSOLE = 2;
const uint8_t MAX = 24;         // le plus de cartes qu’une main peut tenir
const uint8_t VUES = 8;         // les cartes de ta main qu’on voit à la fois

// --------------------------------------------------------- les variables

uint8_t mienne[24];             // ta main
uint8_t miennes = 0;
uint8_t sienne[24];             // la main de la console
uint8_t siennes = 0;
uint8_t dessus = 0;             // la carte du dessus
uint8_t couleur = 0;            // la couleur demandée (celle du dessus, ou celle du joker)
uint8_t tour = TOI;
uint8_t choix = 0;              // la carte choisie dans ta main
uint8_t premiere = 0;           // la première carte qu’on voit (ta main défile)
uint8_t choisirCouleur = 0;     // 1 : tu viens de poser un joker
uint8_t attente = 0;            // la console « réfléchit »
uint8_t fini = 0;
uint8_t gauche = 0;
uint8_t droite = 0;
uint8_t a = 0;
uint8_t b = 0;
uint8_t debut = 0;
uint8_t gaucheAvant = 0;
uint8_t droiteAvant = 0;
uint8_t aAvant = 0;
uint8_t bAvant = 0;
uint8_t debutAvant = 0;

// --------------------------------------------------------- les couleurs

void couleurs() {
  couleurFond(P_TABLE, 0, 3, 13, 6);      // la table : un tapis vert
  couleurFond(P_TABLE, 1, 31, 31, 31);
  couleurFond(P_TABLE, 2, 28, 4, 4);
  couleurFond(P_TABLE, 3, 31, 31, 31);    // le texte, blanc sur le vert
  couleurFond(P_ROUGE, 0, 28, 3, 3);
  couleurFond(P_ROUGE, 1, 31, 31, 31);
  couleurFond(P_ROUGE, 2, 16, 0, 0);
  couleurFond(P_ROUGE, 3, 3, 3, 4);
  couleurFond(P_JAUNE, 0, 31, 25, 0);
  couleurFond(P_JAUNE, 1, 31, 31, 31);
  couleurFond(P_JAUNE, 2, 20, 14, 0);
  couleurFond(P_JAUNE, 3, 3, 3, 4);
  couleurFond(P_VERT, 0, 3, 22, 6);
  couleurFond(P_VERT, 1, 31, 31, 31);
  couleurFond(P_VERT, 2, 0, 12, 2);
  couleurFond(P_VERT, 3, 3, 3, 4);
  couleurFond(P_BLEU, 0, 4, 10, 30);
  couleurFond(P_BLEU, 1, 31, 31, 31);
  couleurFond(P_BLEU, 2, 0, 4, 16);
  couleurFond(P_BLEU, 3, 3, 3, 4);
  couleurFond(P_JOKER, 0, 3, 3, 4);       // le joker : noir, jaune, rouge, blanc
  couleurFond(P_JOKER, 1, 31, 25, 0);
  couleurFond(P_JOKER, 2, 28, 3, 3);
  couleurFond(P_JOKER, 3, 31, 31, 31);
  couleurFond(P_DOS, 0, 18, 2, 6);        // le dos : le cadeau sur du bordeaux
  couleurFond(P_DOS, 1, 31, 31, 31);
  couleurFond(P_DOS, 2, 31, 22, 0);
  couleurFond(P_DOS, 3, 3, 3, 4);
  couleurFond(P_TITRE, 0, 3, 13, 6);      // le titre : le vert de la table…
  couleurFond(P_TITRE, 1, 31, 31, 31);
  couleurFond(P_TITRE, 2, 28, 3, 3);
  couleurFond(P_TITRE, 3, 3, 3, 4);       // … mais un vrai noir pour les contours et les yeux
  couleurLutin(0, 3, 31, 31, 0);          // le cadre : jaune
}

// ------------------------------------------------------- l’écran, case par case

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

void poserVide(uint8_t c, uint8_t l, uint8_t palette) {
  poser(c, l, VIDE);
  poser(c + 1, l, VIDE);
  poser(c, l + 1, VIDE);
  poser(c + 1, l + 1, VIDE);
  teindre(c, l, palette);
  teindre(c + 1, l, palette);
  teindre(c, l + 1, palette);
  teindre(c + 1, l + 1, palette);
}

void effacerEcran() {
  for (uint8_t y = 0; y < 18; y++) {
    for (uint8_t x = 0; x < 20; x++) {
      poser(x, y, VIDE);
      teindre(x, y, P_TABLE);
    }
  }
}

uint8_t dessinDuChiffre(uint8_t v) {
  if (v == 0) return CARTE_0;
  if (v == 1) return CARTE_1;
  if (v == 2) return CARTE_2;
  if (v == 3) return CARTE_3;
  if (v == 4) return CARTE_4;
  if (v == 5) return CARTE_5;
  if (v == 6) return CARTE_6;
  if (v == 7) return CARTE_7;
  if (v == 8) return CARTE_8;
  return CARTE_9;
}

/* Une carte, face visible, en (c, l) : 16 × 16, dans la palette de sa couleur. */
void dessinerCarte(uint8_t c, uint8_t l, uint8_t carte) {
  if (carte == RIEN) {
    poserVide(c, l, P_TABLE);
    return;
  }
  uint8_t coul = carte / 16;
  uint8_t v = carte & 15;
  uint8_t palette = P_ROUGE + coul;
  if (coul == NOIRE) palette = P_JOKER;
  if (v <= 9) {
    poserImage(c, l, dessinDuChiffre(v), palette);
  } else if (v == V_PASSE) {
    poserImage(c, l, PASSE, palette);
  } else if (v == V_INVERSE) {
    poserImage(c, l, INVERSE, palette);
  } else if (v == V_PLUS2) {
    poserImage(c, l, PLUS2, palette);
  } else {
    poserImage(c, l, JOKER, palette);
  }
}

void ecrireCouleur(uint8_t c, uint8_t l, uint8_t coul) {
  if (coul == ROUGE) texte(c, l, "ROUGE");
  if (coul == JAUNE) texte(c, l, "JAUNE");
  if (coul == VERT) texte(c, l, "VERT ");
  if (coul == BLEU) texte(c, l, "BLEU ");
}

/* Le milieu : la pioche (le dos), la carte du dessus, et la couleur demandée. */
void dessinerMilieu() {
  poserImage(5, 6, CADEAU, P_DOS);
  dessinerCarte(9, 6, dessus);
  poserVide(13, 6, P_ROUGE + couleur);    // un carré de la couleur demandée
  texte(4, 8, "PIOCHE");
  texte(12, 8, "      ");
  ecrireCouleur(12, 8, couleur);
}

/* La main de la console : des dos, et combien. */
void dessinerSienne() {
  texte(1, 0, "CONSOLE");
  nombre(9, 0, siennes, 2);
  for (uint8_t k = 0; k < VUES; k++) {
    if (k < siennes) {
      poserImage(2 + k * 2, 2, CADEAU, P_DOS);
    } else {
      poserVide(2 + k * 2, 2, P_TABLE);
    }
  }
}

/* Ta main : huit cartes à la fois, à partir de « premiere ». */
void dessinerMienne() {
  if (choix < premiere) premiere = choix;
  if (choix >= premiere + VUES) premiere = choix - VUES + 1;
  for (uint8_t k = 0; k < VUES; k++) {
    uint8_t i = premiere + k;
    if (i < miennes) {
      dessinerCarte(2 + k * 2, 12, mienne[i]);
    } else {
      dessinerCarte(2 + k * 2, 12, RIEN);
    }
  }
  texte(1, 10, "TOI");
  nombre(5, 10, miennes, 2);
}

void montrerCadre() {
  if (tour == TOI && fini == 0 && miennes > 0) {
    sprite16(0, (2 + (choix - premiere) * 2) * 8, 12 * 8, CADRE);
  } else {
    sprite16(0, 0, 160, CADRE);
  }
  for (uint8_t i = 0; i < 4; i++) teindreLutin(i, 0);
}

void dire(uint8_t quoi) {
  if (quoi == 0) texte(0, 15, " A POSE   B PIOCHE  ");
  if (quoi == 1) texte(0, 15, " LA CONSOLE JOUE    ");
  if (quoi == 2) texte(0, 15, " CETTE CARTE NON    ");
  if (quoi == 3) texte(0, 15, " CHOISIS LA COULEUR ");
  if (quoi == 4) texte(0, 15, " TU GAGNES          ");
  if (quoi == 5) texte(0, 15, " LA CONSOLE GAGNE   ");
  if (quoi == 6) texte(0, 15, " PLUS QU UNE CARTE  ");
}

// ------------------------------------------------------------------ les cartes

/* Une carte tirée au hasard, comme dans un vrai paquet de 56 : pour chaque
   couleur, les chiffres 0 à 9, un passe, un inverse, un +2 — et 4 jokers. */
uint8_t tirerCarte() {
  uint8_t n = hasard() % 56;
  if (n >= 52) return NOIRE * 16 + V_JOKER;
  return (n / 13) * 16 + (n % 13);
}

uint8_t jouable(uint8_t carte) {
  uint8_t v = carte & 15;
  if (v == V_JOKER) return 1;
  if (carte / 16 == couleur) return 1;
  if (v == (dessus & 15)) return 1;
  return 0;
}

void piocherPour(uint8_t qui) {
  if (qui == TOI && miennes < MAX) {
    mienne[miennes] = tirerCarte();
    miennes = miennes + 1;
  }
  if (qui == CONSOLE && siennes < MAX) {
    sienne[siennes] = tirerCarte();
    siennes = siennes + 1;
  }
}

/* La couleur la plus présente dans une main : ce que la console choisit avec un joker. */
uint8_t couleurPreferee(uint8_t qui) {
  uint8_t compte[4];
  for (uint8_t c = 0; c < 4; c++) compte[c] = 0;
  uint8_t n = siennes;
  if (qui == TOI) n = miennes;
  for (uint8_t i = 0; i < n; i++) {
    uint8_t coul = sienne[i] / 16;
    if (qui == TOI) coul = mienne[i] / 16;
    if (coul < 4) compte[coul] = compte[coul] + 1;
  }
  uint8_t meilleure = 0;
  for (uint8_t c = 1; c < 4; c++) {
    if (compte[c] > compte[meilleure]) meilleure = c;
  }
  return meilleure;
}

/* Ce que fait la carte qu’on vient de poser. Rend 1 si le même joueur rejoue. */
uint8_t effet(uint8_t carte, uint8_t qui) {
  uint8_t v = carte & 15;
  uint8_t autre = TOI;
  if (qui == TOI) autre = CONSOLE;
  if (v == V_PASSE || v == V_INVERSE) return 1;
  if (v == V_PLUS2) {
    piocherPour(autre);
    piocherPour(autre);
    return 1;
  }
  return 0;
}

void verifierFin() {
  if (miennes == 0) {
    fini = 1;
    dire(4);
  }
  if (siennes == 0) {
    fini = 1;
    dire(5);
  }
  if (fini == 1) texte(3, 17, "START REJOUE");
}

void passerA(uint8_t qui) {
  tour = qui;
  attente = 0;
  if (qui == TOI) {
    if (miennes == 1) {
      dire(6);
    } else {
      dire(0);
    }
  } else {
    dire(1);
  }
}

/* Tu poses la carte choisie. */
void poserMienne() {
  uint8_t carte = mienne[choix];
  if (jouable(carte) == 0) {
    dire(2);
    return;
  }
  for (uint8_t i = choix; i + 1 < miennes; i++) mienne[i] = mienne[i + 1];
  miennes = miennes - 1;
  if (choix >= miennes && choix > 0) choix = choix - 1;
  dessus = carte;
  couleur = carte / 16;
  uint8_t rejoue = effet(carte, TOI);
  verifierFin();
  if (fini == 0 && (carte & 15) == V_JOKER) {
    choisirCouleur = 1;                   // tu choisis la couleur avant la suite
    couleur = couleurPreferee(TOI);
    dire(3);
  } else if (fini == 0) {
    if (rejoue == 1) {
      passerA(TOI);
    } else {
      passerA(CONSOLE);
    }
  }
  dessinerMilieu();
  dessinerMienne();
  dessinerSienne();
}

/* La console joue : la première carte qui va (les jokers en dernier), sinon elle pioche. */
void consoleJoue() {
  uint8_t trouvee = RIEN;
  for (uint8_t i = 0; i < siennes; i++) {
    if (trouvee == RIEN && jouable(sienne[i]) == 1 && (sienne[i] & 15) != V_JOKER) trouvee = i;
  }
  for (uint8_t i = 0; i < siennes; i++) {
    if (trouvee == RIEN && jouable(sienne[i]) == 1) trouvee = i;
  }
  if (trouvee == RIEN) {
    piocherPour(CONSOLE);
    dessinerSienne();
    passerA(TOI);
    return;
  }
  uint8_t carte = sienne[trouvee];
  for (uint8_t i = trouvee; i + 1 < siennes; i++) sienne[i] = sienne[i + 1];
  siennes = siennes - 1;
  dessus = carte;
  couleur = carte / 16;
  if ((carte & 15) == V_JOKER) couleur = couleurPreferee(CONSOLE);
  uint8_t rejoue = effet(carte, CONSOLE);
  verifierFin();
  dessinerMilieu();
  dessinerSienne();
  dessinerMienne();
  if (fini == 0) {
    if (rejoue == 1) {
      passerA(CONSOLE);
    } else {
      passerA(TOI);
    }
  }
}

void nouvellePartie() {
  ecran(0);
  miennes = 0;
  siennes = 0;
  for (uint8_t k = 0; k < 7; k++) {
    piocherPour(TOI);
    piocherPour(CONSOLE);
  }
  dessus = tirerCarte();
  while ((dessus & 15) >= V_PASSE) dessus = tirerCarte();   // on commence sur un chiffre
  couleur = dessus / 16;
  choix = 0;
  premiere = 0;
  choisirCouleur = 0;
  fini = 0;
  effacerEcran();
  dessinerSienne();
  dessinerMilieu();
  dessinerMienne();
  passerA(TOI);
  ecran(1);
}

void titre() {
  ecran(0);
  effacerEcran();
  texte(6, 1, "COULEURS");
  texte(3, 2, "UN JEU DE CARTES");
  poser(1, 4, JOKER, 4);
  poser(11, 4, PERE_NOEL, 4);
  // sur le vert, le texte est blanc (teinte 3) : les images prennent la palette du titre
  for (uint8_t y = 4; y < 12; y++) {
    for (uint8_t x = 1; x < 19; x++) teindre(x, y, P_TITRE);
  }
  texte(2, 14, "APPUIE SUR START");
  ecran(1);
  while (bouton(START) == 0) image();
  while (bouton(START) == 1) image();
}

int main() {
  couleurs();
  titre();
  nouvellePartie();
  while (true) {
    image();
    gauche = bouton(GAUCHE);
    droite = bouton(DROITE);
    a = bouton(A);
    b = bouton(B);
    debut = bouton(START);
    if (fini == 1) {
      if (debut == 1 && debutAvant == 0) nouvellePartie();
    } else if (choisirCouleur == 1) {
      // le joker : GAUCHE et DROITE changent la couleur, A la garde
      if (gauche == 1 && gaucheAvant == 0) couleur = (couleur + 3) & 3;
      if (droite == 1 && droiteAvant == 0) couleur = (couleur + 1) & 3;
      if ((gauche == 1 && gaucheAvant == 0) || (droite == 1 && droiteAvant == 0)) dessinerMilieu();
      if (a == 1 && aAvant == 0) {
        choisirCouleur = 0;
        dessinerMilieu();
        passerA(CONSOLE);
      }
    } else if (tour == TOI) {
      if (gauche == 1 && gaucheAvant == 0 && choix > 0) {
        choix = choix - 1;
        dessinerMienne();
      }
      if (droite == 1 && droiteAvant == 0 && choix + 1 < miennes) {
        choix = choix + 1;
        dessinerMienne();
      }
      if (a == 1 && aAvant == 0) poserMienne();
      if (b == 1 && bAvant == 0) {
        piocherPour(TOI);
        dessinerMienne();
        passerA(CONSOLE);
      }
    } else {
      attente = attente + 1;
      if (attente == 40) consoleJoue();
    }
    montrerCadre();
    gaucheAvant = gauche;
    droiteAvant = droite;
    aAvant = a;
    bAvant = b;
    debutAvant = debut;
  }
  return 0;
}

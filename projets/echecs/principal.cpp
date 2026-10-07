// ÉCHECS — les blancs contre les noirs.
//
// Deux joueurs, chacun son tour. La croix déplace le cadre jaune ; A choisit
// une de ses pièces (cadre vert), puis A sur la case où l'aller ; B annule.
//
// Chaque pièce bouge selon sa règle, et le chemin doit être libre (sauf pour
// le cavalier, qui saute) :
//   - le PION avance d'une case (deux à son premier coup), prend en diagonale,
//     et devient REINE au bout du plateau ;
//   - la TOUR va droit, le FOU en diagonale, la REINE des deux façons ;
//   - le CAVALIER fait un « L » : deux cases, puis une sur le côté ;
//   - le ROI va d'une case, dans tous les sens.
// Quand un roi est menacé, l'écran le dit : ÉCHEC. La partie se gagne en
// PRENANT le roi adverse — la façon la plus simple d'apprendre les échecs (le
// roque, la prise en passant et le pat ne sont pas dans cette version).
//
// Les six pièces sont des images de la série 3, dessinées UNE fois en
// 16 × 16. Le même dessin sert aux deux camps et aux deux couleurs de case :
// chaque case du fond a sa palette (Game Boy Color). L'écran titre montre le
// roi et le cavalier quatre fois plus grands avec poser(…, 4).

#include <poser>          // pose une tuile sur une case du fond
#include <texte>          // écrit un texte à l’écran
#include <bouton>         // lit un bouton de la manette
#include <ecran>          // éteint ou rallume l’écran
#include <sprite16>       // les deux cadres
#include <Perso>          // un dessin de 16 × 16
#include <Tuile>          // un dessin de 8 × 8
#include <multiplier>     // a * b
#include <couleurFond>    // une couleur du décor
#include <couleurLutin>   // une couleur des lutins
#include <teindre>        // une case du fond prend une palette
#include <teindreLutin>   // un lutin prend une palette

// ------------------------------------------------------------- les dessins

// 3.08 Le roi — une croix sur la couronne (série 3)
Perso ROI = {
  ".......##.......",
  "......####......",
  ".......##.......",
  ".....######.....",
  "....#------#....",
  "...#--#--#--#...",
  "...#--------#...",
  "....#------#....",
  ".....#----#.....",
  ".....#----#.....",
  "....#------#....",
  "....#------#....",
  "...#--------#...",
  "..############..",
  "..#----------#..",
  "..############..",
};

// 3.09 La reine — une couronne à pointes (série 3)
Perso REINE = {
  "..#....#....#...",
  "..##..###..##...",
  "..#-#.#-#.#-#...",
  "..#--#---#--#...",
  "...#--------#...",
  "...#--#--#--#...",
  "....#------#....",
  ".....#----#.....",
  ".....#----#.....",
  ".....#----#.....",
  "....#------#....",
  "....#------#....",
  "...#--------#...",
  "..############..",
  "..#----------#..",
  "..############..",
};

// 3.10 La tour — un château et ses créneaux (série 3)
Perso TOUR = {
  "................",
  "..###.####.###..",
  "..#-#.#--#.#-#..",
  "..#-###--###-#..",
  "..#----------#..",
  "...##########...",
  "....#------#....",
  "....#------#....",
  "....#------#....",
  "....#------#....",
  "....#------#....",
  "...##########...",
  "..#----------#..",
  "..############..",
  "..#----------#..",
  "..############..",
};

// 3.11 Le fou — un bonnet pointu fendu (série 3)
Perso FOU = {
  ".......##.......",
  "......#--#......",
  ".......##.......",
  "......#--#......",
  ".....#--#-#.....",
  "....#--#---#....",
  "....#-#----#....",
  "....#------#....",
  ".....#----#.....",
  "......####......",
  ".....#----#.....",
  "....#------#....",
  "...#--------#...",
  "..############..",
  "..#----------#..",
  "..############..",
};

// 3.12 Le cavalier — une tête de cheval (série 3)
Perso CAVALIER = {
  "......#.#.......",
  ".....#-#-##.....",
  "....#-------#...",
  "...#--##-----#..",
  "..#----------#..",
  ".#-----------#..",
  "#--------#---#..",
  "#-#----##----#..",
  ".#.####.#----#..",
  ".......#-----#..",
  "......#------#..",
  ".....#-------#..",
  "....#---------#.",
  "..############..",
  "..#----------#..",
  "..############..",
};

// 3.13 Le pion des échecs — une boule sur un socle (série 3)
Perso PION_ECHECS = {
  "................",
  "................",
  "......####......",
  ".....#----#.....",
  "....#------#....",
  "....#------#....",
  ".....#----#.....",
  "......#--#......",
  ".....#----#.....",
  ".....#----#.....",
  "....#------#....",
  "...#--------#...",
  "...##########...",
  "..#----------#..",
  "..############..",
  "................",
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

const uint8_t BORD_X = 2;
const uint8_t BORD_Y = 1;

const uint8_t P_CLAIR = 0;        // case claire vide (et le texte)
const uint8_t P_FONCE = 1;        // case foncée vide
const uint8_t P_BLANC_CLAIR = 2;  // pièce blanche sur case claire
const uint8_t P_BLANC_FONCE = 3;  // pièce blanche sur case foncée
const uint8_t P_NOIR_CLAIR = 4;   // pièce noire sur case claire
const uint8_t P_NOIR_FONCE = 5;   // pièce noire sur case foncée

// une case : 0 vide, sinon le type de la pièce (1 à 6), plus 8 pour les noirs
const uint8_t T_PION = 1;
const uint8_t T_TOUR = 2;
const uint8_t T_CAVALIER = 3;
const uint8_t T_FOU = 4;
const uint8_t T_REINE = 5;
const uint8_t T_ROI = 6;
const uint8_t NOIR = 8;

const uint8_t BLANCS = 1;
const uint8_t NOIRS = 2;
const uint8_t AUCUNE = 255;

// la première rangée de chaque camp, de gauche à droite
const uint8_t RANGEE[] = { 2, 3, 4, 5, 6, 4, 3, 2 };

// --------------------------------------------------------- les variables

uint8_t plateau[64];
uint8_t joueur = BLANCS;
uint8_t curseurC = 4;
uint8_t curseurL = 6;
uint8_t choisieC = AUCUNE;
uint8_t choisieL = 0;
uint8_t fini = 0;
uint8_t haut = 0;
uint8_t bas = 0;
uint8_t gauche = 0;
uint8_t droite = 0;
uint8_t a = 0;
uint8_t b = 0;
uint8_t debut = 0;
uint8_t hautAvant = 0;
uint8_t basAvant = 0;
uint8_t gaucheAvant = 0;
uint8_t droiteAvant = 0;
uint8_t aAvant = 0;
uint8_t bAvant = 0;
uint8_t debutAvant = 0;

// --------------------------------------------------------- les couleurs

void couleurs() {
  couleurFond(P_CLAIR, 0, 29, 27, 22);
  couleurFond(P_CLAIR, 1, 31, 31, 31);
  couleurFond(P_CLAIR, 2, 16, 16, 16);
  couleurFond(P_CLAIR, 3, 3, 3, 4);
  couleurFond(P_FONCE, 0, 9, 15, 9);
  couleurFond(P_FONCE, 1, 31, 31, 31);
  couleurFond(P_FONCE, 2, 16, 16, 16);
  couleurFond(P_FONCE, 3, 3, 3, 4);
  // une pièce blanche : blanche, contour noir
  couleurFond(P_BLANC_CLAIR, 0, 29, 27, 22);
  couleurFond(P_BLANC_CLAIR, 1, 31, 31, 31);
  couleurFond(P_BLANC_CLAIR, 2, 20, 20, 22);
  couleurFond(P_BLANC_CLAIR, 3, 3, 3, 4);
  couleurFond(P_BLANC_FONCE, 0, 9, 15, 9);
  couleurFond(P_BLANC_FONCE, 1, 31, 31, 31);
  couleurFond(P_BLANC_FONCE, 2, 20, 20, 22);
  couleurFond(P_BLANC_FONCE, 3, 3, 3, 4);
  // une pièce noire : noire, contour clair
  couleurFond(P_NOIR_CLAIR, 0, 29, 27, 22);
  couleurFond(P_NOIR_CLAIR, 1, 5, 5, 7);
  couleurFond(P_NOIR_CLAIR, 2, 10, 10, 12);
  couleurFond(P_NOIR_CLAIR, 3, 24, 24, 26);
  couleurFond(P_NOIR_FONCE, 0, 9, 15, 9);
  couleurFond(P_NOIR_FONCE, 1, 5, 5, 7);
  couleurFond(P_NOIR_FONCE, 2, 10, 10, 12);
  couleurFond(P_NOIR_FONCE, 3, 24, 24, 26);
  couleurLutin(0, 3, 31, 28, 0);    // le curseur : jaune
  couleurLutin(1, 3, 31, 4, 4);     // la pièce choisie : rouge
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
      teindre(x, y, P_CLAIR);
    }
  }
}

/* Le dessin d’un type de pièce. */
uint8_t dessinDe(uint8_t t) {
  if (t == T_PION) return PION_ECHECS;
  if (t == T_TOUR) return TOUR;
  if (t == T_CAVALIER) return CAVALIER;
  if (t == T_FOU) return FOU;
  if (t == T_REINE) return REINE;
  return ROI;
}

void dessinerCase(uint8_t c, uint8_t l) {
  uint8_t v = plateau[l * 8 + c];
  uint8_t x = BORD_X + c * 2;
  uint8_t y = BORD_Y + l * 2;
  uint8_t foncee = (c + l) & 1;
  if (v == 0) {
    if (foncee == 1) {
      poserVide(x, y, P_FONCE);
    } else {
      poserVide(x, y, P_CLAIR);
    }
    return;
  }
  uint8_t palette = P_BLANC_CLAIR;
  if (v >= NOIR) palette = P_NOIR_CLAIR;
  palette = palette + foncee;          // la version « case foncée » suit toujours
  poserImage(x, y, dessinDe(v & 7), palette);
}

void dessinerPlateau() {
  for (uint8_t l = 0; l < 8; l++) {
    for (uint8_t c = 0; c < 8; c++) {
      dessinerCase(c, l);
    }
  }
}

void montrerCadres() {
  sprite16(0, (BORD_X + curseurC * 2) * 8, (BORD_Y + curseurL * 2) * 8, CADRE);
  for (uint8_t i = 0; i < 4; i++) teindreLutin(i, 0);
  if (choisieC == AUCUNE) {
    sprite16(4, 0, 160, CADRE);
  } else {
    sprite16(4, (BORD_X + choisieC * 2) * 8, (BORD_Y + choisieL * 2) * 8, CADRE);
  }
  for (uint8_t i = 4; i < 8; i++) teindreLutin(i, 1);
}

// ------------------------------------------------------------------ les règles

uint8_t camp(uint8_t v) {
  if (v == 0) return 0;
  if (v >= NOIR) return NOIRS;
  return BLANCS;
}

uint8_t ecart(uint8_t p, uint8_t q) {
  if (p > q) return p - q;
  return q - p;
}

/* Le pas de p vers q : 1, 0, ou 255 (c’est-à-dire -1 en uint8_t). */
uint8_t pas(uint8_t p, uint8_t q) {
  if (q > p) return 1;
  if (q < p) return 255;
  return 0;
}

/* Le chemin de (c0, l0) à (c1, l1), en ligne droite ou en diagonale, est-il
   libre ? Les deux bouts ne comptent pas. */
uint8_t cheminLibre(uint8_t c0, uint8_t l0, uint8_t c1, uint8_t l1) {
  uint8_t dc = pas(c0, c1);
  uint8_t dl = pas(l0, l1);
  uint8_t c = c0 + dc;
  uint8_t l = l0 + dl;
  while (c != c1 || l != l1) {
    if (plateau[l * 8 + c] != 0) return 0;
    c = c + dc;
    l = l + dl;
  }
  return 1;
}

/* La pièce en (c0, l0) peut-elle aller en (c1, l1) ? Sa règle, le chemin, et
   pas sur une pièce de son camp. */
uint8_t peutAller(uint8_t c0, uint8_t l0, uint8_t c1, uint8_t l1) {
  uint8_t v = plateau[l0 * 8 + c0];
  uint8_t cible = plateau[l1 * 8 + c1];
  if (v == 0) return 0;
  if (c0 == c1 && l0 == l1) return 0;
  if (cible != 0 && camp(cible) == camp(v)) return 0;
  uint8_t t = v & 7;
  uint8_t ec = ecart(c0, c1);
  uint8_t el = ecart(l0, l1);
  if (t == T_PION) {
    uint8_t avant = 255;               // les blancs montent…
    uint8_t depart = 6;
    if (camp(v) == NOIRS) {            // … les noirs descendent
      avant = 1;
      depart = 1;
    }
    if (ec == 0 && cible == 0) {
      if (l1 == l0 + avant) return 1;
      if (l0 == depart && l1 == l0 + avant + avant && plateau[(l0 + avant) * 8 + c0] == 0) return 1;
    }
    if (ec == 1 && l1 == l0 + avant && cible != 0) return 1;
    return 0;
  }
  if (t == T_CAVALIER) {
    if (ec == 1 && el == 2) return 1;
    if (ec == 2 && el == 1) return 1;
    return 0;
  }
  if (t == T_ROI) {
    if (ec <= 1 && el <= 1) return 1;
    return 0;
  }
  uint8_t droit = 0;
  uint8_t biais = 0;
  if (ec == 0 || el == 0) droit = 1;
  if (ec == el) biais = 1;
  if (t == T_TOUR && droit == 0) return 0;
  if (t == T_FOU && biais == 0) return 0;
  if (t == T_REINE && droit == 0 && biais == 0) return 0;
  return cheminLibre(c0, l0, c1, l1);
}

/* Le roi du camp est-il menacé par une pièce adverse ? */
uint8_t enEchec(uint8_t qui) {
  uint8_t roiC = AUCUNE;
  uint8_t roiL = 0;
  for (uint8_t i = 0; i < 64; i++) {
    if ((plateau[i] & 7) == T_ROI && camp(plateau[i]) == qui) {
      roiC = i & 7;
      roiL = i / 8;
    }
  }
  if (roiC == AUCUNE) return 0;
  for (uint8_t i = 0; i < 64; i++) {
    if (plateau[i] != 0 && camp(plateau[i]) != qui) {
      if (peutAller(i & 7, i / 8, roiC, roiL) == 1) return 1;
    }
  }
  return 0;
}

void direLeTour() {
  if (enEchec(joueur) == 1) {
    if (joueur == BLANCS) {
      texte(1, 17, "BLANCS : ECHEC   ");
    } else {
      texte(1, 17, "NOIRS : ECHEC    ");
    }
    return;
  }
  if (joueur == BLANCS) {
    texte(1, 17, "AUX BLANCS       ");
  } else {
    texte(1, 17, "AUX NOIRS        ");
  }
}

void appuyerA() {
  uint8_t ici = plateau[curseurL * 8 + curseurC];
  if (choisieC == AUCUNE || camp(ici) == joueur) {
    if (camp(ici) == joueur) {
      choisieC = curseurC;
      choisieL = curseurL;
    }
    return;
  }
  if (peutAller(choisieC, choisieL, curseurC, curseurL) == 0) return;
  uint8_t v = plateau[choisieL * 8 + choisieC];
  uint8_t pris = ici;
  plateau[choisieL * 8 + choisieC] = 0;
  // un pion au bout devient reine
  if ((v & 7) == T_PION && (curseurL == 0 || curseurL == 7)) v = v - T_PION + T_REINE;
  plateau[curseurL * 8 + curseurC] = v;
  dessinerCase(choisieC, choisieL);
  dessinerCase(curseurC, curseurL);
  choisieC = AUCUNE;
  if ((pris & 7) == T_ROI) {
    fini = 1;
    if (joueur == BLANCS) {
      texte(1, 17, "LES BLANCS GAGNENT");
    } else {
      texte(1, 17, "LES NOIRS GAGNENT ");
    }
    texte(4, 0, "START REJOUE");
    return;
  }
  joueur = 3 - joueur;
  direLeTour();
}

void nouvellePartie() {
  ecran(0);
  for (uint8_t i = 0; i < 64; i++) plateau[i] = 0;
  for (uint8_t c = 0; c < 8; c++) {
    plateau[c] = RANGEE[c] + NOIR;           // la rangée des noirs, en haut
    plateau[8 + c] = T_PION + NOIR;
    plateau[48 + c] = T_PION;                // les blancs, en bas
    plateau[56 + c] = RANGEE[c];
  }
  joueur = BLANCS;
  curseurC = 4;
  curseurL = 6;
  choisieC = AUCUNE;
  fini = 0;
  effacerEcran();
  texte(7, 0, "ECHECS");
  dessinerPlateau();
  direLeTour();
  ecran(1);
}

void titre() {
  ecran(0);
  effacerEcran();
  texte(7, 1, "ECHECS");
  poser(1, 4, ROI, 4);
  poser(11, 4, CAVALIER, 4);
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
    haut = bouton(HAUT);
    bas = bouton(BAS);
    gauche = bouton(GAUCHE);
    droite = bouton(DROITE);
    a = bouton(A);
    b = bouton(B);
    debut = bouton(START);
    if (fini == 0) {
      if (haut == 1 && hautAvant == 0 && curseurL > 0) curseurL = curseurL - 1;
      if (bas == 1 && basAvant == 0 && curseurL < 7) curseurL = curseurL + 1;
      if (gauche == 1 && gaucheAvant == 0 && curseurC > 0) curseurC = curseurC - 1;
      if (droite == 1 && droiteAvant == 0 && curseurC < 7) curseurC = curseurC + 1;
      if (a == 1 && aAvant == 0) appuyerA();
      if (b == 1 && bAvant == 0) choisieC = AUCUNE;
      montrerCadres();
    } else if (debut == 1 && debutAvant == 0) {
      nouvellePartie();
    }
    hautAvant = haut;
    basAvant = bas;
    gaucheAvant = gauche;
    droiteAvant = droite;
    aAvant = a;
    bAvant = b;
    debutAvant = debut;
  }
  return 0;
}

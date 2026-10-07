// DAMES — les blancs contre les rouges, sur un damier de 8 × 8.
//
// Seul contre la console (elle joue les rouges), ou à deux : on choisit sur
// l’écran titre. La croix déplace le cadre jaune ; A choisit
// une de ses pièces (cadre vert), puis A sur la case où l'aller ; B annule.
//
//   - un pion avance d'une case en diagonale, vers l'adversaire ;
//   - il PREND en sautant par-dessus une pièce adverse, en avant comme en
//     arrière, si la case d'après est libre ; s'il peut prendre encore, il
//     continue (la même pièce, le même tour) ;
//   - un pion qui atteint le bout devient une DAME : elle va d'une case dans
//     les quatre diagonales, et prend de même ;
//   - celui qui n'a plus de pièces a perdu.
//
// Les pièces sont deux images de la série 3, dessinées UNE fois en 16 × 16 :
// le pion et la dame. Le même dessin sert aux deux camps : chaque case a sa
// palette (Game Boy Color), blanche ou rouge. L'écran titre les montre quatre
// fois plus grands avec poser(…, 4).

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

// 3.06 Le pion de dames — un jeton rond, vu d’en haut (série 3)
Perso PION = {
  "................",
  ".....######.....",
  "...##------##...",
  "..#--++++++--#..",
  ".#--+------+--#.",
  ".#-+--++++--+-#.",
  "#--+-+----+-+--#",
  "#--+-+----+-+--#",
  "#--+-+----+-+--#",
  "#--+-+----+-+--#",
  ".#-+--++++--+-#.",
  ".#--+------+--#.",
  "..#--++++++--#..",
  "...##------##...",
  ".....######.....",
  "................",
};

// 3.07 La dame — le pion couronné (série 3)
Perso DAME = {
  "................",
  ".....######.....",
  "...##------##...",
  "..#----------#..",
  ".#--#--#--#---#.",
  ".#--##-##-##--#.",
  "#---########---#",
  "#---#++++++#---#",
  "#---#++++++#---#",
  "#---########---#",
  ".#------------#.",
  ".#------------#.",
  "..#----------#..",
  "...##------##...",
  ".....######.....",
  "................",
};

// Le cadre qui montre une case : le curseur (jaune) et la pièce choisie (verte).
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

const uint8_t BORD_X = 2;      // la case (0, 0) du damier, en tuiles de l’écran
const uint8_t BORD_Y = 1;

const uint8_t P_CLAIR = 0;     // les palettes du fond
const uint8_t P_FONCE = 1;
const uint8_t P_BLANC = 2;
const uint8_t P_ROUGE = 3;

const uint8_t RIEN = 0;        // ce qu’il y a sur une case
const uint8_t PION_BLANC = 1;
const uint8_t DAME_BLANCHE = 2;
const uint8_t PION_ROUGE = 3;
const uint8_t DAME_ROUGE = 4;

const uint8_t BLANCS = 1;      // les deux camps
const uint8_t ROUGES = 2;
const uint8_t AUCUNE = 255;    // pas de pièce choisie

// --------------------------------------------------------- les variables

uint8_t plateau[64];           // 8 × 8 cases, rangée par rangée, celle du haut d’abord
uint8_t joueur = BLANCS;
uint8_t curseurC = 0;
uint8_t curseurL = 5;
uint8_t choisieC = AUCUNE;
uint8_t choisieL = 0;
uint8_t enchaine = 0;          // 1 : la pièce vient de prendre, et peut reprendre
uint8_t blancs = 12;           // les pièces qui restent
uint8_t rouges = 12;
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
  couleurFond(P_CLAIR, 0, 30, 27, 20);   // une case claire : crème
  couleurFond(P_CLAIR, 1, 31, 31, 31);
  couleurFond(P_CLAIR, 2, 28, 4, 4);
  couleurFond(P_CLAIR, 3, 4, 3, 2);      // le texte
  couleurFond(P_FONCE, 0, 12, 7, 3);     // une case foncée : brun
  couleurFond(P_FONCE, 1, 31, 31, 31);
  couleurFond(P_FONCE, 2, 20, 12, 6);
  couleurFond(P_FONCE, 3, 4, 3, 2);
  couleurFond(P_BLANC, 0, 12, 7, 3);     // une pièce blanche, sur le brun
  couleurFond(P_BLANC, 1, 31, 31, 30);
  couleurFond(P_BLANC, 2, 22, 22, 24);
  couleurFond(P_BLANC, 3, 4, 3, 2);
  couleurFond(P_ROUGE, 0, 12, 7, 3);     // une pièce rouge, sur le brun
  couleurFond(P_ROUGE, 1, 31, 12, 10);
  couleurFond(P_ROUGE, 2, 22, 2, 2);
  couleurFond(P_ROUGE, 3, 6, 0, 0);
  couleurLutin(0, 3, 31, 28, 0);         // le curseur : jaune
  couleurLutin(1, 3, 4, 28, 6);          // la pièce choisie : vert
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

uint8_t caseFoncee(uint8_t c, uint8_t l) {
  return (c + l) & 1;
}

void dessinerCase(uint8_t c, uint8_t l) {
  uint8_t v = plateau[l * 8 + c];
  uint8_t x = BORD_X + c * 2;
  uint8_t y = BORD_Y + l * 2;
  if (caseFoncee(c, l) == 0) {
    poserVide(x, y, P_CLAIR);
  } else if (v == PION_BLANC) {
    poserImage(x, y, PION, P_BLANC);
  } else if (v == DAME_BLANCHE) {
    poserImage(x, y, DAME, P_BLANC);
  } else if (v == PION_ROUGE) {
    poserImage(x, y, PION, P_ROUGE);
  } else if (v == DAME_ROUGE) {
    poserImage(x, y, DAME, P_ROUGE);
  } else {
    poserVide(x, y, P_FONCE);
  }
}

void dessinerPlateau() {
  for (uint8_t l = 0; l < 8; l++) {
    for (uint8_t c = 0; c < 8; c++) {
      dessinerCase(c, l);
    }
  }
}

/* Les deux cadres. Une pièce non choisie : son cadre part sous l’écran. */
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

void direLeTour() {
  if (joueur == BLANCS) {
    texte(1, 17, "AUX BLANCS       ");
  } else {
    texte(1, 17, "AUX ROUGES       ");
  }
}


// ------------------------------------------------- 1 joueur ou 2 joueurs

uint8_t seul = 1;              // 1 : contre la console ; 0 : à deux sur la même console
uint8_t attente = 0;           // la console « réfléchit » un peu avant de jouer

void montrerChoix() {
  if (seul == 1) {
    texte(4, 13, "# 1 JOUEUR ");
    texte(4, 15, "  2 JOUEURS");
  } else {
    texte(4, 13, "  1 JOUEUR ");
    texte(4, 15, "# 2 JOUEURS");
  }
}

/* HAUT et BAS choisissent, START (ou A) commence. */
void choisirLesJoueurs() {
  uint8_t h = 0;
  uint8_t bb = 0;
  uint8_t go = 0;
  uint8_t hAvant = 1;
  uint8_t bAvant = 1;
  uint8_t goAvant = 1;
  montrerChoix();
  texte(2, 17, "START POUR JOUER");
  while (true) {
    image();
    h = bouton(HAUT);
    bb = bouton(BAS);
    go = bouton(START) | bouton(A);
    if (h == 1 && hAvant == 0) {
      seul = 1;
      montrerChoix();
    }
    if (bb == 1 && bAvant == 0) {
      seul = 0;
      montrerChoix();
    }
    if (go == 1 && goAvant == 0) break;
    hAvant = h;
    bAvant = bb;
    goAvant = go;
  }
  while (bouton(START) == 1 || bouton(A) == 1) image();
}

// ------------------------------------------------------------------ les règles

uint8_t camp(uint8_t v) {
  if (v == RIEN) return 0;
  if (v <= DAME_BLANCHE) return BLANCS;
  return ROUGES;
}

uint8_t estDame(uint8_t v) {
  if (v == DAME_BLANCHE || v == DAME_ROUGE) return 1;
  return 0;
}

uint8_t ecart(uint8_t p, uint8_t q) {
  if (p > q) return p - q;
  return q - p;
}

/* Une case dans le damier, pas une case hors du bord (255 = -1 en uint8_t). */
uint8_t dedans(uint8_t c, uint8_t l) {
  if (c < 8 && l < 8) return 1;
  return 0;
}

/* La pièce en (c, l) peut-elle prendre ? Les quatre diagonales : un adversaire
   juste à côté, et la case d’après libre. */
uint8_t peutPrendre(uint8_t c, uint8_t l) {
  uint8_t moi = camp(plateau[l * 8 + c]);
  for (uint8_t d = 0; d < 4; d++) {
    uint8_t dc = 1;
    uint8_t dl = 1;
    if (d == 1 || d == 3) dc = 255;
    if (d >= 2) dl = 255;
    uint8_t mc = c + dc;
    uint8_t ml = l + dl;
    uint8_t ac = mc + dc;
    uint8_t al = ml + dl;
    if (dedans(ac, al) == 1) {
      uint8_t milieu = camp(plateau[ml * 8 + mc]);
      if (milieu != 0 && milieu != moi && plateau[al * 8 + ac] == RIEN) return 1;
    }
  }
  return 0;
}

/* Aller de (c0, l0) à (c1, l1) : 0 interdit, 1 un pas, 2 une prise. */
uint8_t coup(uint8_t c0, uint8_t l0, uint8_t c1, uint8_t l1) {
  uint8_t v = plateau[l0 * 8 + c0];
  if (plateau[l1 * 8 + c1] != RIEN) return 0;
  uint8_t ec = ecart(c0, c1);
  uint8_t el = ecart(l0, l1);
  if (ec == 1 && el == 1 && enchaine == 0) {
    if (estDame(v) == 1) return 1;
    if (camp(v) == BLANCS && l1 < l0) return 1;    // les blancs montent
    if (camp(v) == ROUGES && l1 > l0) return 1;    // les rouges descendent
    return 0;
  }
  if (ec == 2 && el == 2) {
    uint8_t mc = (c0 + c1) / 2;
    uint8_t ml = (l0 + l1) / 2;
    uint8_t milieu = camp(plateau[ml * 8 + mc]);
    if (milieu != 0 && milieu != camp(v)) return 2;
  }
  return 0;
}

void finDuTour() {
  choisieC = AUCUNE;
  enchaine = 0;
  if (blancs == 0 || rouges == 0) {
    fini = 1;
    if (blancs == 0) {
      texte(1, 17, "LES ROUGES GAGNENT");
    } else {
      texte(1, 17, "LES BLANCS GAGNENT");
    }
    texte(5, 0, "START REJOUE");
    return;
  }
  joueur = 3 - joueur;
  direLeTour();
}

void appuyerA() {
  uint8_t ici = plateau[curseurL * 8 + curseurC];
  if (choisieC == AUCUNE) {
    if (camp(ici) == joueur) {
      choisieC = curseurC;
      choisieL = curseurL;
    }
    return;
  }
  // une autre de ses pièces : on change d’avis (sauf au milieu d’une prise)
  if (camp(ici) == joueur && enchaine == 0) {
    choisieC = curseurC;
    choisieL = curseurL;
    return;
  }
  uint8_t r = coup(choisieC, choisieL, curseurC, curseurL);
  if (r == 0) return;
  uint8_t v = plateau[choisieL * 8 + choisieC];
  plateau[choisieL * 8 + choisieC] = RIEN;
  dessinerCase(choisieC, choisieL);
  if (r == 2) {
    uint8_t mc = (choisieC + curseurC) / 2;
    uint8_t ml = (choisieL + curseurL) / 2;
    plateau[ml * 8 + mc] = RIEN;
    dessinerCase(mc, ml);
    if (joueur == BLANCS) {
      rouges = rouges - 1;
    } else {
      blancs = blancs - 1;
    }
  }
  // au bout, le pion devient dame
  uint8_t couronne = 0;
  if (v == PION_BLANC && curseurL == 0) {
    v = DAME_BLANCHE;
    couronne = 1;
  }
  if (v == PION_ROUGE && curseurL == 7) {
    v = DAME_ROUGE;
    couronne = 1;
  }
  plateau[curseurL * 8 + curseurC] = v;
  dessinerCase(curseurC, curseurL);
  if (r == 2 && couronne == 0 && peutPrendre(curseurC, curseurL) == 1) {
    enchaine = 1;                       // elle reprend : même pièce, même tour
    choisieC = curseurC;
    choisieL = curseurL;
    texte(1, 17, "ENCORE UNE PRISE ");
    return;
  }
  finDuTour();
}

void nouvellePartie() {
  ecran(0);
  for (uint8_t l = 0; l < 8; l++) {
    for (uint8_t c = 0; c < 8; c++) {
      uint8_t v = RIEN;
      if (caseFoncee(c, l) == 1 && l < 3) v = PION_ROUGE;
      if (caseFoncee(c, l) == 1 && l > 4) v = PION_BLANC;
      plateau[l * 8 + c] = v;
    }
  }
  joueur = BLANCS;
  curseurC = 0;
  curseurL = 5;
  choisieC = AUCUNE;
  enchaine = 0;
  blancs = 12;
  rouges = 12;
  fini = 0;
  effacerEcran();
  texte(7, 0, "DAMES");
  dessinerPlateau();
  direLeTour();
  ecran(1);
}

void titre() {
  ecran(0);
  effacerEcran();
  texte(7, 1, "DAMES");
  poser(1, 4, PION, 4);
  poser(11, 4, DAME, 4);
  ecran(1);
  choisirLesJoueurs();
}

/* ------------------------------------------------------------- l’IA
 *
 * Les rouges, quand on joue seul. Chaque coup possible reçoit une note
 * (100 : un coup ordinaire) :
 *   - une prise vaut beaucoup (+60), une prise qui couronne encore plus ;
 *   - devenir dame : +30 ;
 *   - arriver sur une case où un blanc pourra le prendre : -40 ;
 *   - avancer : un peu plus que reculer.
 * Le meilleur est joué. Au milieu d’une prise, la même pièce continue.
 */

/* La pièce de « moi » en (c, l) serait-elle prise au coup suivant ? Un
   adversaire collé en diagonale, et la case d’en face libre. */
uint8_t enPrise(uint8_t c, uint8_t l, uint8_t moi) {
  for (uint8_t d = 0; d < 4; d++) {
    uint8_t dc = 1;
    uint8_t dl = 1;
    if (d == 1 || d == 3) dc = 255;
    if (d >= 2) dl = 255;
    uint8_t ac = c + dc;
    uint8_t al = l + dl;
    uint8_t fc = c - dc;
    uint8_t fl = l - dl;
    if (dedans(ac, al) == 1 && dedans(fc, fl) == 1) {
      uint8_t v = camp(plateau[al * 8 + ac]);
      if (v != 0 && v != moi && plateau[fl * 8 + fc] == RIEN) return 1;
    }
  }
  return 0;
}

uint8_t noteDuCoup(uint8_t c0, uint8_t l0, uint8_t c1, uint8_t l1, uint8_t r) {
  uint8_t note = 100;
  uint8_t v = plateau[l0 * 8 + c0];
  if (r == 2) note = note + 60;
  if (v == PION_ROUGE && l1 == 7) note = note + 30;
  if (l1 > l0) note = note + 2;
  // essayer le coup pour voir s’il laisse la pièce en prise
  plateau[l0 * 8 + c0] = RIEN;
  plateau[l1 * 8 + c1] = v;
  uint8_t pris = 0;
  uint8_t mc = (c0 + c1) / 2;
  uint8_t ml = (l0 + l1) / 2;
  if (r == 2) {
    pris = plateau[ml * 8 + mc];
    plateau[ml * 8 + mc] = RIEN;
  }
  if (enPrise(c1, l1, ROUGES) == 1) note = note - 40;
  plateau[l1 * 8 + c1] = RIEN;
  plateau[l0 * 8 + c0] = v;
  if (r == 2) plateau[ml * 8 + mc] = pris;
  return note;
}

void iaJoue() {
  uint8_t meilleure = 0;
  uint8_t dc0 = 0;
  uint8_t dl0 = 0;
  uint8_t dc1 = 0;
  uint8_t dl1 = 0;
  for (uint8_t l0 = 0; l0 < 8; l0++) {
    for (uint8_t c0 = 0; c0 < 8; c0++) {
      if (camp(plateau[l0 * 8 + c0]) != ROUGES) continue;
      if (enchaine == 1 && (c0 != choisieC || l0 != choisieL)) continue;
      for (uint8_t d = 0; d < 8; d++) {
        uint8_t pas = 1;
        if (d >= 4) pas = 2;                   // un pas, ou un saut
        uint8_t dc = pas;
        uint8_t dl = pas;
        if ((d & 1) == 1) dc = 0 - pas;
        if ((d & 2) == 2) dl = 0 - pas;
        uint8_t c1 = c0 + dc;
        uint8_t l1 = l0 + dl;
        if (dedans(c1, l1) == 0) continue;
        uint8_t r = coup(c0, l0, c1, l1);
        if (r == 0) continue;
        uint8_t n = noteDuCoup(c0, l0, c1, l1, r);
        if (n > meilleure) {
          meilleure = n;
          dc0 = c0;
          dl0 = l0;
          dc1 = c1;
          dl1 = l1;
        }
      }
    }
  }
  if (meilleure == 0) {                        // plus aucun coup : les rouges ont perdu
    rouges = 0;
    finDuTour();
    return;
  }
  choisieC = dc0;
  choisieL = dl0;
  curseurC = dc1;
  curseurL = dl1;
  appuyerA();
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
    if (fini == 0 && seul == 1 && joueur == ROUGES) {
      attente = attente + 1;                   // la console réfléchit, puis joue
      if (attente == 30) {
        iaJoue();
        attente = 0;
      }
      montrerCadres();
    } else if (fini == 0) {
      if (haut == 1 && hautAvant == 0 && curseurL > 0) curseurL = curseurL - 1;
      if (bas == 1 && basAvant == 0 && curseurL < 7) curseurL = curseurL + 1;
      if (gauche == 1 && gaucheAvant == 0 && curseurC > 0) curseurC = curseurC - 1;
      if (droite == 1 && droiteAvant == 0 && curseurC < 7) curseurC = curseurC + 1;
      if (a == 1 && aAvant == 0) appuyerA();
      if (b == 1 && bAvant == 0 && enchaine == 0) choisieC = AUCUNE;
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

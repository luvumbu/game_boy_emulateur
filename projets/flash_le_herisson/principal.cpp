// FLASH LE HÉRISSON — un jeu de plateformes rapide, dans l'esprit des jeux de
// hérisson bleu des années 90 (un héros à nous, pas celui de SEGA).
//
//   DROITE / GAUCHE  courir : on prend de l'ÉLAN en tenant la croix, et l'on
//                    glisse un peu quand on la lâche ;
//   A                sauter — en l'air, le hérisson se met en BOULE.
//
// Ramasse les anneaux. Une coccinelle robot se détruit en lui tombant dessus
// en boule ; si elle te touche quand tu cours, tu perds tes anneaux — et sans
// anneau, une vie. Les pics font pareil. Un ressort t'envoie très haut. Le
// panneau, au bout du niveau, termine la course : le temps et les anneaux
// sont comptés. Trois vies.
//
// Le moteur — le niveau qui défile, la gravité, les collisions — est celui de
// SUPER MARIO (exemples/mario.cpp). Le héros, sa boule et la coccinelle sont
// des images de la série 3, dessinées UNE fois en 16 × 16 ; l'écran titre
// montre le hérisson quatre fois plus grand avec poser(…, 4).

#include <poser>          // pose une tuile sur une case du fond
#include <texte>          // écrit un texte à l’écran
#include <nombre>         // écrit un nombre
#include <bouton>         // lit un bouton de la manette
#include <ecran>          // éteint ou rallume l’écran
#include <defiler>        // fait glisser tout le fond
#include <sprite>         // un lutin de 8 × 8 (les compteurs)
#include <sprite16>       // le héros et les coccinelles
#include <cacher>         // ôte un lutin
#include <cacher16>       // ôte un personnage de 16 × 16
#include <Perso>          // un dessin de 16 × 16
#include <Tuile>          // un dessin de 8 × 8
#include <multiplier>     // a * b
#include <diviser>        // a / b
#include <reste>          // a % b
#include <couleurFond>    // une couleur du décor
#include <couleurLutin>   // une couleur des lutins
#include <teindre>        // une case du fond prend une palette
#include <teindreLutin>   // un lutin prend une palette

// ------------------------------------------------------------- les dessins

// 3.18 Le hérisson — un héros bleu qui court vite (série 3)
Perso HERISSON = {
  ".......#####....",
  ".....##+++++#...",
  "...##++++++++#..",
  "#####+++++-#-#..",
  ".##++++++-#--#..",
  "...#++++--#--##.",
  "..###++++-----#.",
  ".####++++----#..",
  "...#++++++###...",
  "....#++-----#...",
  "....#+------#...",
  ".....#+-----#...",
  "......##+##.....",
  ".....#--#--#....",
  "....###..###....",
  "...####..####...",
};

// 3.19 Le hérisson en boule — il saute en tournant (série 3)
Perso HERISSON_BOULE = {
  ".....######.....",
  "...##++++++##...",
  "..#+++#+++++##..",
  ".#+++#++++++++#.",
  ".#++#++++#+++-#.",
  "#++#++++#+++---#",
  "#+#++++#+++----#",
  "#+#+++#+++-----#",
  "#++++#+++------#",
  "#+++#+++-------#",
  "#++++++-------+#",
  ".#+++++------+#.",
  ".#++++++----++#.",
  "..##+++++++++#..",
  "...##+++++++#...",
  ".....######.....",
};

// 3.20 La coccinelle robot — l’ennemi : on lui saute dessus en boule (série 3)
Perso COCCINELLE = {
  "................",
  "......####......",
  "....##++++##....",
  "...#+##++##+#...",
  "..#++##++##++#..",
  "..#++++++++++#..",
  ".#+##++++++##+#.",
  ".#+##++++++##+#.",
  ".#++++++++++++#.",
  ".##############.",
  ".#-##------##-#.",
  "..#----------#..",
  "...##########...",
  "....#..##..#....",
  "...##..##..##...",
  "................",
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

// le haut du sol : de l’herbe, puis la terre en damier
Tuile HERBE = {
  "++#+++#+",
  "+#+#+#+#",
  "########",
  "....----",
  "....----",
  "....----",
  "----....",
  "----....",
};

Tuile TERRE = {
  "....----",
  "....----",
  "....----",
  "....----",
  "----....",
  "----....",
  "----....",
  "----....",
};

Tuile ANNEAU = {
  "..####..",
  ".#+--+#.",
  "#+-..-+#",
  "#-....-#",
  "#-....-#",
  "#+-..-+#",
  ".#+--+#.",
  "..####..",
};

Tuile PICS = {
  "........",
  "...#...#",
  "..#-#.#-",
  "..#+#.#+",
  ".#-++##-",
  ".#+++##+",
  "#-+++#-+",
  "########",
};

Tuile RESSORT = {
  "........",
  "########",
  "#++++++#",
  "########",
  ".#....#.",
  "..#..#..",
  ".#....#.",
  "########",
};

Tuile PANNEAU = {
  "########",
  "#------#",
  "#-++++-#",
  "#-++++-#",
  "#------#",
  "########",
  "...##...",
  "...##...",
};

// ------------------------------------------------------------- le niveau

// Pour chaque colonne : la hauteur du sol (en cases), et ce qu’il y a dessus —
// 1 un anneau, 3 le panneau, 4 un ressort, 5 des pics — à la ligne LIGNES_OBJET.
const uint8_t LARGEUR_NIVEAU = 160;

const uint8_t ARRIVEE = 152;          // la colonne du panneau

const uint8_t HAUTEURS[] = {
  3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 0, 0, 0, 3,
  3, 3, 3, 3, 5, 5, 5, 5, 5, 3, 3, 3, 3, 3, 3, 3, 3, 8, 8, 8,
  8, 8, 8, 8, 8, 8, 0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
  3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 6, 6, 6, 4, 4, 4,
  4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 3,
  3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 9, 9, 9, 9, 9, 9, 3,
  3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
  4, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3
};

const uint8_t OBJETS[] = {
  0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1,
  0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 4, 0, 0, 0, 1, 1,
  1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 0, 0, 0,
  1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 4, 0, 0, 1, 1, 1, 1, 1, 1, 0,
  0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 5, 5, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0
};

const uint8_t LIGNES_OBJET[] = {
  0, 0, 0, 0, 0, 0, 12, 12, 12, 12, 12, 12, 0, 0, 0, 10, 13, 13, 13, 10,
  0, 0, 0, 0, 10, 10, 10, 10, 10, 0, 0, 0, 0, 0, 14, 0, 0, 0, 7, 7,
  7, 7, 7, 7, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 14, 14, 0, 0, 0,
  12, 12, 12, 12, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 11, 11, 11, 11, 11, 11, 11, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 14, 0, 0, 0, 0, 14, 0, 0, 6, 6, 6, 6, 6, 6, 0,
  0, 0, 0, 0, 0, 0, 11, 11, 11, 11, 11, 11, 11, 11, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 14, 14, 0, 0, 0, 0, 14, 0, 0, 0, 0, 0, 0, 0
};

// les coccinelles : leur colonne de départ, puis les bornes de leur ronde
const uint8_t COCCINELLES[] = { 58, 57, 66, 86, 82, 93, 130, 124, 138 };

// -------------------------------------------------------- les constantes

const uint8_t LIGNES = 18;
const uint8_t CASES_VUES = 21;
const uint8_t MARGE = 7;          // le héros reste à 7 cases du bord gauche
const uint8_t ZEROV = 16;         // la vitesse verticale « nulle » (16 = immobile)
const uint8_t CHUTE_MAX = 5;
const uint8_t SAUT = 9;
const uint8_t BOND = 13;          // la force d’un ressort
const uint8_t ELAN_MAX = 3;       // pixels par image, à pleine vitesse
const uint8_t ZERO = 27;          // le chiffre 0 de la police

const uint8_t P_CIEL = 0;         // les palettes du fond
const uint8_t P_SOL = 1;
const uint8_t P_OR = 2;
const uint8_t P_PICS = 3;
const uint8_t P_RESSORT = 4;
const uint8_t P_PANNEAU = 5;

const uint8_t ANNEAU_ICI = 1;     // les objets du niveau
const uint8_t PANNEAU_ICI = 3;
const uint8_t RESSORT_ICI = 4;
const uint8_t PICS_ICI = 5;

// --------------------------------------------------------- les variables

uint8_t objet[160];               // les objets, recopiés (les anneaux pris disparaissent)
uint8_t camCol = 0;
uint8_t camPix = 0;
uint8_t dernierCam = 0;
uint8_t hCol = 2;                 // le héros : sa colonne, son pixel dans la colonne…
uint8_t hPix = 0;
uint8_t hY = 100;                 // … sa hauteur en pixels
uint8_t hVY = 16;                 // sa vitesse verticale (ZEROV = immobile)
uint8_t auSol = 0;
uint8_t sens = 0;                 // 0 : vers la droite ; 1 : vers la gauche
uint8_t elan = 0;                 // sa vitesse, de 0 à ELAN_MAX
uint8_t montee = 0;               // compte les images, pour l’élan
uint8_t anneaux = 0;
uint8_t vies = 3;
uint8_t blesse = 0;               // les images où il ne peut pas être touché
uint8_t secondes = 0;
uint8_t images = 0;
uint8_t fini = 0;                 // 0 : on court ; 1 : arrivé ; 2 : plus de vies
uint8_t eCol[3];                  // les coccinelles
uint8_t ePix[3];
uint8_t eDir[3];
uint8_t eVif[3];
uint8_t eY[3];
uint8_t eG[3];
uint8_t eD[3];
uint8_t tic = 0;
uint8_t heurte = 0;
uint8_t dur = 0;
uint8_t tcol = 0;
uint8_t tlig = 0;
uint8_t colG = 0;
uint8_t colD = 0;
uint8_t ligH = 0;
uint8_t ligB = 0;
uint8_t dcol = 0;
uint8_t sautAvant = 0;
uint8_t debutAvant = 0;

// --------------------------------------------------------- les couleurs

void couleurs() {
  couleurFond(P_CIEL, 0, 14, 22, 31);     // le ciel
  couleurFond(P_CIEL, 1, 31, 31, 31);
  couleurFond(P_CIEL, 2, 4, 10, 30);      // le bleu du héros (écran titre)
  couleurFond(P_CIEL, 3, 2, 2, 8);        // le texte, le contour
  couleurFond(P_SOL, 0, 30, 19, 9);       // la terre claire
  couleurFond(P_SOL, 1, 18, 9, 3);        // la terre foncée
  couleurFond(P_SOL, 2, 6, 24, 6);        // l’herbe
  couleurFond(P_SOL, 3, 2, 12, 2);        // l’herbe foncée
  couleurFond(P_OR, 0, 14, 22, 31);
  couleurFond(P_OR, 1, 31, 29, 10);
  couleurFond(P_OR, 2, 28, 19, 0);
  couleurFond(P_OR, 3, 12, 6, 0);
  couleurFond(P_PICS, 0, 14, 22, 31);
  couleurFond(P_PICS, 1, 31, 31, 31);
  couleurFond(P_PICS, 2, 18, 18, 20);
  couleurFond(P_PICS, 3, 4, 4, 6);
  couleurFond(P_RESSORT, 0, 14, 22, 31);
  couleurFond(P_RESSORT, 1, 31, 28, 0);
  couleurFond(P_RESSORT, 2, 28, 4, 4);
  couleurFond(P_RESSORT, 3, 4, 2, 2);
  couleurFond(P_PANNEAU, 0, 14, 22, 31);
  couleurFond(P_PANNEAU, 1, 31, 31, 31);
  couleurFond(P_PANNEAU, 2, 4, 10, 30);
  couleurFond(P_PANNEAU, 3, 4, 4, 6);
  couleurLutin(0, 1, 31, 24, 16);         // le héros : la peau…
  couleurLutin(0, 2, 4, 10, 30);          // … le bleu…
  couleurLutin(0, 3, 2, 2, 8);            // … le contour
  couleurLutin(1, 1, 31, 31, 31);         // la coccinelle
  couleurLutin(1, 2, 28, 4, 4);
  couleurLutin(1, 3, 3, 2, 2);
  couleurLutin(2, 1, 31, 29, 10);         // les compteurs : l’or
  couleurLutin(2, 2, 28, 19, 0);
  couleurLutin(2, 3, 2, 2, 8);
}

// ------------------------------------------------------- le niveau à l’écran

/* Une colonne du niveau, posée dans le fond (qui fait 32 cases de large et
   tourne en rond : la colonne 40 du niveau va dans la case 8). */
void dessinerColonne() {
  uint8_t dmap = dcol % 32;
  uint8_t h = 0;
  uint8_t quoi = 0;
  uint8_t ligneObjet = 0;
  if (dcol < LARGEUR_NIVEAU) {
    h = HAUTEURS[dcol];
    quoi = objet[dcol];
    ligneObjet = LIGNES_OBJET[dcol];
  }
  uint8_t premier = LIGNES - h;
  for (uint8_t y = 0; y < LIGNES; y++) {
    uint8_t t = VIDE;
    uint8_t p = P_CIEL;
    if (h > 0 && y >= premier) {
      t = TERRE;
      if (y == premier) t = HERBE;
      p = P_SOL;
    }
    if (quoi > 0 && y == ligneObjet) {
      if (quoi == ANNEAU_ICI) {
        t = ANNEAU;
        p = P_OR;
      }
      if (quoi == PANNEAU_ICI) {
        t = PANNEAU;
        p = P_PANNEAU;
      }
      if (quoi == RESSORT_ICI) {
        t = RESSORT;
        p = P_RESSORT;
      }
      if (quoi == PICS_ICI) {
        t = PICS;
        p = P_PICS;
      }
    }
    poser(dmap, y, t);
    teindre(dmap, y, p);
  }
}

void dessinerLaVue() {
  for (dcol = camCol; dcol < camCol + CASES_VUES; dcol++) dessinerColonne();
  dernierCam = camCol;
}

// ------------------------------------------------------------ les collisions

void estSolide() {
  dur = 0;
  if (tcol < LARGEUR_NIVEAU && tlig < LIGNES) {
    uint8_t h = HAUTEURS[tcol];
    if (h > 0 && tlig >= LIGNES - h) dur = 1;
  }
}

/* Les cases que le héros (16 × 16) occupe. */
void bornes() {
  colG = hCol;
  colD = hCol + 1;
  if (hPix > 0) colD = hCol + 2;
  ligH = hY / 8;
  ligB = (hY + 15) / 8;
}

void heurteSurLigne() {
  heurte = 0;
  tcol = colG;
  estSolide();
  if (dur == 1) heurte = 1;
  tcol = colD;
  estSolide();
  if (dur == 1) heurte = 1;
}

void heurteACote() {
  bornes();
  heurte = 0;
  for (uint8_t l = ligH; l <= ligB; l++) {
    tlig = l;
    estSolide();
    if (dur == 1) heurte = 1;
  }
}

void descendreUn() {
  hY = hY + 1;
  bornes();
  tlig = ligB;
  heurteSurLigne();
  if (heurte == 1) {
    hY = hY - 1;
    hVY = ZEROV;
    auSol = 1;
  }
}

void monterUn() {
  if (hY == 0) {
    hVY = ZEROV;
    return;
  }
  hY = hY - 1;
  bornes();
  tlig = ligH;
  heurteSurLigne();
  if (heurte == 1) {
    hY = hY + 1;
    hVY = ZEROV;
  }
}

void droiteUn() {
  uint8_t ancienCol = hCol;
  uint8_t ancienPix = hPix;
  hPix = hPix + 1;
  if (hPix > 7) {
    hPix = 0;
    hCol = hCol + 1;
  }
  bornes();
  tcol = colD;
  heurteACote();
  if (heurte == 1) {
    hCol = ancienCol;
    hPix = ancienPix;
  }
}

void gaucheUn() {
  heurte = 1;
  if (hCol == 0 && hPix == 0) return;
  uint8_t ancienCol = hCol;
  uint8_t ancienPix = hPix;
  if (hPix == 0) {
    hPix = 7;
    hCol = hCol - 1;
  } else {
    hPix = hPix - 1;
  }
  bornes();
  tcol = colG;
  heurteACote();
  if (heurte == 1) {
    hCol = ancienCol;
    hPix = ancienPix;
  }
}

// --------------------------------------------------------- les accidents

/* Remettre le héros au départ, ou à mi-parcours s’il l’a dépassé. */
void reprendre() {
  ecran(0);
  if (hCol >= 80) {
    hCol = 80;
  } else {
    hCol = 2;
  }
  hPix = 0;
  hY = (LIGNES - HAUTEURS[hCol] - 2) * 8;
  hVY = ZEROV;
  elan = 0;
  blesse = 90;
  camCol = 0;
  camPix = 0;
  if (hCol > MARGE) camCol = hCol - MARGE;
  dessinerLaVue();
  defiler(camCol * 8, 0);
  ecran(1);
}

void perdreUneVie() {
  vies = vies - 1;
  if (vies == 0) {
    fini = 2;
    return;
  }
  reprendre();
}

/* Touché par une coccinelle ou des pics : on perd ses anneaux — sans anneau, une vie. */
void blesser() {
  if (blesse > 0) return;
  if (anneaux > 0) {
    anneaux = 0;
    blesse = 90;                       // une seconde et demie sans être touché
    hVY = ZEROV - 5;                   // il rebondit en arrière
    auSol = 0;
    elan = 0;
    return;
  }
  perdreUneVie();
}

/* Les objets sous le héros : anneaux, ressorts, pics. */
void toucherLesObjets() {
  bornes();
  for (uint8_t l = ligH; l <= ligB; l++) {
    for (uint8_t n = colG; n <= colD; n++) {
      if (n < LARGEUR_NIVEAU && LIGNES_OBJET[n] == l) {
        if (objet[n] == ANNEAU_ICI) {
          objet[n] = 0;
          if (anneaux < 99) anneaux = anneaux + 1;
          poser(n % 32, l, VIDE);
          teindre(n % 32, l, P_CIEL);
        }
        if (objet[n] == RESSORT_ICI && hVY >= ZEROV) {
          hVY = ZEROV - BOND;           // le ressort l’envoie très haut
          auSol = 0;
        }
        if (objet[n] == PICS_ICI) blesser();
      }
    }
  }
}

// ---------------------------------------------------------- les coccinelles

void bougerCoccinelles() {
  for (uint8_t n = 0; n < 3; n++) {
    if (eVif[n] == 0) continue;
    if (eDir[n] == 0) {
      ePix[n] = ePix[n] + 1;
      if (ePix[n] > 7) {
        ePix[n] = 0;
        eCol[n] = eCol[n] + 1;
      }
      if (eCol[n] >= eD[n]) eDir[n] = 1;
    } else {
      if (ePix[n] == 0) {
        ePix[n] = 7;
        eCol[n] = eCol[n] - 1;
      } else {
        ePix[n] = ePix[n] - 1;
      }
      if (eCol[n] <= eG[n]) eDir[n] = 0;
    }
  }
}

/* En boule (en l’air), le héros détruit la coccinelle ; en courant, elle le blesse. */
void toucherCoccinelles() {
  for (uint8_t n = 0; n < 3; n++) {
    if (eVif[n] == 0) continue;
    if (hCol + 1 >= eCol[n] && eCol[n] + 1 >= hCol && hY + 15 >= eY[n] && eY[n] + 15 >= hY) {
      if (auSol == 0) {
        eVif[n] = 0;
        hVY = ZEROV - 6;                 // il rebondit dessus
      } else {
        blesser();
      }
    }
  }
}

// ----------------------------------------------------------------- l’affichage

void dessinerHeros() {
  uint8_t sx = (hCol - camCol) * 8 + hPix - camPix;
  // blessé, il clignote
  if (blesse > 0 && (blesse & 4) == 4) {
    cacher16(0);
    return;
  }
  if (auSol == 0) {
    // en boule : il tourne (le dessin retourné une image sur quatre)
    if ((images & 4) == 4) {
      sprite16(0, sx, hY, HERISSON_BOULE, 1);
    } else {
      sprite16(0, sx, hY, HERISSON_BOULE, 0);
    }
  } else if (sens == 1) {
    sprite16(0, sx, hY, HERISSON, 1);
  } else {
    sprite16(0, sx, hY, HERISSON, 0);
  }
  for (uint8_t i = 0; i < 4; i++) teindreLutin(i, 0);
}

void dessinerCoccinelles() {
  for (uint8_t n = 0; n < 3; n++) {
    uint8_t premier = 4 + n * 4;
    if (eVif[n] == 1 && eCol[n] >= camCol && eCol[n] < camCol + CASES_VUES) {
      uint8_t ex = (eCol[n] - camCol) * 8 + ePix[n];
      if (ex >= camPix) {
        ex = ex - camPix;
      } else {
        ex = 0;
      }
      // le sens s’écrit en clair : les deux cas dans un « if »
      if (eDir[n] == 1) {
        sprite16(premier, ex, eY[n], COCCINELLE, 1);
      } else {
        sprite16(premier, ex, eY[n], COCCINELLE, 0);
      }
      for (uint8_t i = 0; i < 4; i++) teindreLutin(premier + i, 1);
    } else {
      cacher16(premier);
    }
  }
}

/* En haut : les anneaux, et les vies (les chiffres de la police, en lutins). */
void dessinerCompteurs() {
  sprite(16, 8, 8, ANNEAU);
  sprite(17, 20, 8, ZERO + anneaux / 10);
  sprite(18, 28, 8, ZERO + anneaux % 10);
  sprite(19, 136, 8, 22);                 // la lettre V
  sprite(20, 144, 8, ZERO + vies);
  for (uint8_t i = 16; i < 21; i++) teindreLutin(i, 2);
}

void cacherTout() {
  cacher16(0);
  cacher16(4);
  cacher16(8);
  cacher16(12);
  for (uint8_t i = 16; i < 21; i++) cacher(i);
}

// --------------------------------------------------------------- une image

void courir() {
  uint8_t droite = bouton(DROITE);
  uint8_t gauche = bouton(GAUCHE);
  uint8_t saut = bouton(A);
  // l’élan : on accélère en tenant la croix, on freine en la lâchant
  montee = montee + 1;
  if (droite == 1 || gauche == 1) {
    uint8_t voulu = 0;
    if (gauche == 1) voulu = 1;
    if (voulu != sens && elan > 0) {
      if (montee >= 2) {                 // demi-tour : il freine d’abord
        elan = elan - 1;
        montee = 0;
      }
    } else {
      sens = voulu;
      if (elan == 0) elan = 1;
      if (montee >= 10 && elan < ELAN_MAX) {
        elan = elan + 1;
        montee = 0;
      }
    }
  } else if (montee >= 6 && elan > 0) {
    elan = elan - 1;                     // il glisse, puis s’arrête
    montee = 0;
  }
  for (uint8_t p = 0; p < elan; p++) {
    if (sens == 0) {
      droiteUn();
    } else {
      gaucheUn();
    }
    if (heurte == 1) elan = 0;           // un mur : il s’arrête net
  }
  // le saut
  if (saut == 1 && sautAvant == 0 && auSol == 1) {
    hVY = ZEROV - SAUT;
    auSol = 0;
  }
  sautAvant = saut;
  // la gravité
  hVY = hVY + 1;
  if (hVY > ZEROV + CHUTE_MAX) hVY = ZEROV + CHUTE_MAX;
  auSol = 0;
  if (hVY < ZEROV) {
    for (uint8_t p = ZEROV - hVY; p > 0; p--) monterUn();
  }
  if (hVY > ZEROV) {
    for (uint8_t p = hVY - ZEROV; p > 0; p--) descendreUn();
  }
  if (hVY == ZEROV) {
    // posé : un pixel plus bas est-il du sol ?
    descendreUn();
  }
  toucherLesObjets();
  tic = tic + 1;
  if (tic > 1) {
    tic = 0;
    bougerCoccinelles();
  }
  toucherCoccinelles();
  if (blesse > 0) blesse = blesse - 1;
  if (hY > 150) perdreUneVie();          // tombé dans un trou
  if (hCol >= ARRIVEE) fini = 1;
  // le temps
  images = images + 1;
  if (images >= 60) {
    images = 0;
    if (secondes < 255) secondes = secondes + 1;
  }
  // la caméra suit le héros
  camCol = 0;
  camPix = 0;
  if (hCol > MARGE) {
    camCol = hCol - MARGE;
    camPix = hPix;
  }
  if (camCol > LARGEUR_NIVEAU - CASES_VUES) {
    camCol = LARGEUR_NIVEAU - CASES_VUES;
    camPix = 0;
  }
  if (camCol != dernierCam) {
    if (camCol > dernierCam) {
      dcol = camCol + CASES_VUES - 1;
    } else {
      dcol = camCol;
    }
    dessinerColonne();
    dernierCam = camCol;
  }
  defiler(camCol * 8 + camPix, 0);
  dessinerHeros();
  dessinerCoccinelles();
  dessinerCompteurs();
}

// -------------------------------------------------------------- les écrans

void effacerEcran() {
  for (uint8_t y = 0; y < 18; y++) {
    for (uint8_t x = 0; x < 32; x++) {
      poser(x, y, VIDE);
      teindre(x, y, P_CIEL);
    }
  }
}

void commencer() {
  ecran(0);
  cacherTout();
  for (uint8_t i = 0; i < LARGEUR_NIVEAU; i++) objet[i] = OBJETS[i];
  anneaux = 0;
  vies = 3;
  secondes = 0;
  images = 0;
  fini = 0;
  blesse = 0;
  elan = 0;
  sens = 0;
  hCol = 2;
  hPix = 0;
  hY = (LIGNES - HAUTEURS[2] - 2) * 8;
  hVY = ZEROV;
  camCol = 0;
  camPix = 0;
  for (uint8_t n = 0; n < 3; n++) {
    eCol[n] = COCCINELLES[n * 3];
    eG[n] = COCCINELLES[n * 3 + 1];
    eD[n] = COCCINELLES[n * 3 + 2];
    ePix[n] = 0;
    eDir[n] = 0;
    eVif[n] = 1;
    eY[n] = (LIGNES - HAUTEURS[eCol[n]]) * 8 - 16;
  }
  dessinerLaVue();
  defiler(0, 0);
  ecran(1);
}

void ecranFin() {
  ecran(0);
  cacherTout();
  defiler(0, 0);
  effacerEcran();
  if (fini == 1) {
    texte(7, 3, "BRAVO");
    texte(3, 5, "COURSE TERMINEE");
  } else {
    texte(5, 4, "PLUS DE VIE");
  }
  texte(3, 8, "ANNEAUX");
  nombre(13, 8, anneaux, 2);
  texte(3, 10, "TEMPS");
  nombre(12, 10, secondes, 3);
  texte(16, 10, "S");
  texte(3, 14, "START : REJOUER");
  ecran(1);
}

void titre() {
  ecran(0);
  effacerEcran();
  texte(11, 3, "FLASH");
  texte(9, 5, "LE HERISSON");
  poser(1, 2, HERISSON, 4);
  texte(2, 14, "APPUIE SUR START");
  ecran(1);
  while (bouton(START) == 0) image();
  while (bouton(START) == 1) image();
}

int main() {
  couleurs();
  titre();
  commencer();
  while (true) {
    image();
    if (fini == 0) {
      courir();
      if (fini > 0) ecranFin();
    } else {
      uint8_t debut = bouton(START);
      if (debut == 1 && debutAvant == 0) commencer();
      debutAvant = debut;
    }
  }
  return 0;
}

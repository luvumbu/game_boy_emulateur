// Porté depuis mario.js par « node porter.mjs ».
//
// Le portage est littéral : il donne un programme juste, non un programme
// idiomatique. Les variables globales qui servaient d'arguments faute de
// mieux méritent de redevenir des arguments, et les portées de reprendre
// leur place — c'est là tout l'intérêt d'être passé au C++.

#include <Tuile>      // un dessin de 8 × 8 pixels
#include <Perso>      // un personnage : un dessin de 16 × 16 ou de 32 × 32 pixels
#include <poser>      // pose une tuile sur une case du fond
#include <sprite16>   // place un lutin de 16 × 16 au pixel près
#include <cacher16>   // cache un lutin de 16 × 16
#include <sprite>     // place un lutin de 8 × 8 au pixel près
#include <cacher>     // cache un lutin
#include <ecran>      // éteint ou rallume l’écran
#include <defiler>    // fait glisser tout le fond
#include <texte>      // écrit un texte à l’écran
#include <bouton>     // lit un bouton de la manette
#include <diviser>    // a / b, sauf par 1, 2, 4, 8, 16… écrits en clair
#include <reste>      // a % b, sauf par 1, 2, 4, 8, 16… écrits en clair

Tuile SOL = {
  "33333333",
  "32222223",
  "32122123",
  "32222223",
  "32221223",
  "32122223",
  "32222223",
  "33333333",
};
Tuile BRIQUE = {
  "33333333",
  "31113111",
  "31113111",
  "33333333",
  "11311131",
  "11311131",
  "33333333",
  "11111111",
};
Tuile PIECE = {
  "00333300",
  "03222230",
  "32133123",
  "32133123",
  "32133123",
  "03222230",
  "00333300",
  "00000000",
};
Tuile DRAPEAU = {
  "03300000",
  "03333330",
  "03333330",
  "03333330",
  "03300000",
  "03300000",
  "03300000",
  "03300000",
};
Perso MARIO = {
  "0000333333000000",
  "0003333333300000",
  "0003333333300000",
  "0002211131111000",
  "0021113111111000",
  "0021113111111000",
  "0022211111110000",
  "0000111111110000",
  "0003333333300000",
  "0033333333330000",
  "0011333333110000",
  "0011333333110000",
  "0011133331110000",
  "0002220022200000",
  "0022220022220000",
  "0022220022220000",
};
Perso ENNEMI = {
  "0000000000000000",
  "0000033333300000",
  "0003333333333000",
  "0033333333333300",
  "0033113311333300",
  "0033113311333300",
  "0033333333333300",
  "0033000000033300",
  "0033333333333300",
  "0033333333333300",
  "0003333333333000",
  "0000333333330000",
  "0022200000000220",
  "0222200000000222",
  "0222200000000222",
  "0022000000000020",
};
const uint8_t HAUTEURS[] = { 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 2, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 2, 2, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 2, 2, 2, 2, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 4, 4, 4, 4, 5, 5, 5, 5, 2, 2, 2, 2, 2, 0, 0, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 2, 2, 2, 2, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 2, 2, 2, 2 };
const uint8_t OBJETS_ROM[] = { 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 2, 2, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 1, 1, 1, 0, 0, 0, 0, 0, 2, 2, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 3, 0, 0 };
const uint8_t LIGNES_OBJET[] = { 0, 0, 0, 0, 0, 0, 0, 0, 0, 12, 12, 12, 0, 12, 12, 0, 0, 0, 0, 0, 0, 12, 12, 0, 0, 11, 11, 11, 0, 0, 0, 0, 0, 0, 0, 0, 11, 11, 12, 12, 12, 0, 0, 0, 0, 0, 10, 10, 0, 11, 11, 0, 0, 0, 0, 0, 0, 12, 12, 12, 0, 0, 0, 0, 0, 0, 0, 11, 11, 0, 0, 12, 12, 12, 0, 0, 0, 0, 0, 12, 12, 12, 0, 0, 0, 0, 0, 0, 0, 12, 12, 0, 0, 0, 0, 0, 0, 12, 12, 12, 0, 12, 12, 0, 0, 0, 0, 0, 0, 0, 10, 10, 10, 0, 0, 0, 0, 12, 0, 0 };
uint8_t LARGEUR_NIVEAU = 120;
uint8_t LIGNES = 18;
uint8_t CASES_VUES = 21;
uint8_t ZEROV = 16;
uint8_t CHUTE_MAX = 4;
uint8_t SAUT = 8;
uint8_t MARGE = 7;
uint8_t DRAPEAU_COL = 117;
uint8_t ZERO = 27;
uint8_t objet[120];
uint8_t camCol = 0;
uint8_t camPix = 0;
uint8_t dernierCam = 0;
uint8_t mCol = 2;
uint8_t mPix = 0;
uint8_t mY = 112;
uint8_t mVY = 16;
uint8_t auSol = 0;
uint8_t regarde = 0;
uint8_t pieces = 0;
uint8_t fini = 0;
uint8_t tic = 0;
uint8_t eCol[2];
uint8_t ePix[2];
uint8_t eDir[2];
uint8_t eVif[2];
uint8_t eY[2];
uint8_t eG[2];
uint8_t eD[2];
uint8_t dcol = 0;
uint8_t dmap = 0;
uint8_t h = 0;
uint8_t quoi = 0;
uint8_t ligneObjet = 0;
uint8_t premier = 0;
uint8_t t = 0;
uint8_t x = 0;
uint8_t y = 0;
uint8_t l = 0;
uint8_t n = 0;
uint8_t i = 0;
uint8_t d = 0;
uint8_t r = 0;
uint8_t tcol = 0;
uint8_t tlig = 0;
uint8_t dur = 0;
uint8_t heurte = 0;
uint8_t colG = 0;
uint8_t colD = 0;
uint8_t ligH = 0;
uint8_t ligB = 0;
uint8_t pas = 0;
uint8_t pasH = 0;
uint8_t vitesse = 0;
uint8_t ancienCol = 0;
uint8_t ancienPix = 0;
uint8_t sx = 0;
uint8_t sy = 0;
uint8_t ex = 0;
uint8_t ey = 0;
uint8_t visible = 0;
uint8_t proche = 0;
uint8_t gauche = 0;
uint8_t droite = 0;
uint8_t saut = 0;
uint8_t sautAvant = 0;
uint8_t debut = 0;
uint8_t debutAvant = 0;

void dessinerColonne() {
  dmap = dcol % 32;
  h = 0;
  quoi = 0;
  ligneObjet = 0;
  if (dcol < LARGEUR_NIVEAU) {
    h = HAUTEURS[dcol];
    quoi = objet[dcol];
    ligneObjet = LIGNES_OBJET[dcol];
  }
  premier = LIGNES - h;
  y = 0;
  while (y < LIGNES) {
    t = 0;
    if (h > 0) {
      if (y >= premier) {
        t = SOL;
      }
    }
    if (quoi > 0) {
      if (y == ligneObjet) {
        if (quoi == 1) {
          t = PIECE;
        }
        if (quoi == 2) {
          t = BRIQUE;
        }
        if (quoi == 3) {
          t = DRAPEAU;
        }
      }
    }
    poser(dmap, y, t);
    y = y + 1;
  }
}

void estSolide() {
  dur = 0;
  if (tcol < LARGEUR_NIVEAU) {
    if (tlig < LIGNES) {
      h = HAUTEURS[tcol];
      if (h > 0) {
        if (tlig >= LIGNES - h) {
          dur = 1;
        }
      }
      if (objet[tcol] == 2) {
        if (tlig == LIGNES_OBJET[tcol]) {
          dur = 1;
        }
      }
    }
  }
}

void bornes() {
  colG = mCol;
  colD = mCol + 1;
  if (mPix > 0) {
    colD = mCol + 2;
  }
  ligH = mY / 8;
  ligB = (mY + 15) / 8;
}

void heurteSurLigne() {
  heurte = 0;
  tcol = colG;
  estSolide();
  if (dur == 1) {
    heurte = 1;
  }
  tcol = colD;
  estSolide();
  if (dur == 1) {
    heurte = 1;
  }
}

void heurteACote() {
  bornes();
  heurte = 0;
  l = ligH;
  while (l <= ligB) {
    tlig = l;
    estSolide();
    if (dur == 1) {
      heurte = 1;
    }
    l = l + 1;
  }
}

void descendreUn() {
  mY = mY + 1;
  bornes();
  tlig = ligB;
  heurteSurLigne();
  if (heurte == 1) {
    mY = mY - 1;
    mVY = ZEROV;
    auSol = 1;
  }
}

void monterUn() {
  if (mY == 0) {
    mVY = ZEROV;
  } else {
    mY = mY - 1;
    bornes();
    tlig = ligH;
    heurteSurLigne();
    if (heurte == 1) {
      mY = mY + 1;
      mVY = ZEROV;
    }
  }
}

void droiteUn() {
  ancienCol = mCol;
  ancienPix = mPix;
  mPix = mPix + 1;
  if (mPix > 7) {
    mPix = 0;
    mCol = mCol + 1;
  }
  bornes();
  tcol = colD;
  heurteACote();
  if (heurte == 1) {
    mCol = ancienCol;
    mPix = ancienPix;
  }
}

void gaucheUn() {
  if (mCol > 0) {
    ancienCol = mCol;
    ancienPix = mPix;
    if (mPix == 0) {
      mPix = 7;
      mCol = mCol - 1;
    } else {
      mPix = mPix - 1;
    }
    bornes();
    tcol = colG;
    heurteACote();
    if (heurte == 1) {
      mCol = ancienCol;
      mPix = ancienPix;
    }
  }
}

void ramasser() {
  bornes();
  l = ligH;
  while (l <= ligB) {
    n = colG;
    while (n <= colD) {
      if (n < LARGEUR_NIVEAU) {
        if (objet[n] == 1) {
          if (LIGNES_OBJET[n] == l) {
            objet[n] = 0;
            pieces = pieces + 1;
            poser(n % 32, l, 0);
          }
        }
      }
      n = n + 1;
    }
    l = l + 1;
  }
}

void bougerEnnemis() {
  n = 0;
  while (n < 2) {
    if (eVif[n] == 1) {
      if (eDir[n] == 0) {
        ePix[n] = ePix[n] + 1;
        if (ePix[n] > 7) {
          ePix[n] = 0;
          eCol[n] = eCol[n] + 1;
        }
        if (eCol[n] >= eD[n]) {
          eDir[n] = 1;
        }
      } else {
        if (ePix[n] == 0) {
          ePix[n] = 7;
          eCol[n] = eCol[n] - 1;
        } else {
          ePix[n] = ePix[n] - 1;
        }
        if (eCol[n] <= eG[n]) {
          eDir[n] = 0;
        }
      }
    }
    n = n + 1;
  }
}

void toucherEnnemis() {
  n = 0;
  while (n < 2) {
    if (eVif[n] == 1) {
      proche = 0;
      if (mCol + 1 >= eCol[n]) {
        if (eCol[n] + 1 >= mCol) {
          proche = 1;
        }
      }
      if (proche == 1) {
        if (mY + 15 >= eY[n]) {
          if (eY[n] + 15 >= mY) {
            if (mVY > ZEROV) {
              eVif[n] = 0;
              mVY = ZEROV - 4;
              pieces = pieces + 1;
            } else {
              fini = 2;
            }
          }
        }
      }
    }
    n = n + 1;
  }
}

void placerEnnemi() {
  visible = 0;
  ex = 0;
  ey = 0;
  if (eVif[n] == 1) {
    if (eCol[n] >= camCol) {
      if (eCol[n] < camCol + CASES_VUES) {
        visible = 1;
        ex = (eCol[n] - camCol) * 8 + ePix[n];
        if (ex >= camPix) {
          ex = ex - camPix;
        } else {
          ex = 0;
        }
        ey = eY[n];
      }
    }
  }
}

void dessinerMario() {
  sx = (mCol - camCol) * 8 + mPix - camPix;
  sy = mY;
  if (regarde == 0) {
    sprite16(0, sx, sy, MARIO, 0);
  } else {
    sprite16(0, sx, sy, MARIO, 1);
  }
}

void dessinerEnnemis() {
  n = 0;
  placerEnnemi();
  if (visible == 1) {
    sprite16(4, ex, ey, ENNEMI, 0);
  } else {
    cacher16(4);
  }
  n = 1;
  placerEnnemi();
  if (visible == 1) {
    sprite16(8, ex, ey, ENNEMI, 0);
  } else {
    cacher16(8);
  }
}

void dessinerCompte() {
  d = pieces / 10;
  r = pieces % 10;
  sprite(12, 8, 8, PIECE, 0);
  sprite(13, 20, 8, ZERO + d, 0);
  sprite(14, 28, 8, ZERO + r, 0);
}

void cacherTout() {
  cacher16(0);
  cacher16(4);
  cacher16(8);
  cacher(12);
  cacher(13);
  cacher(14);
}

void commencer() {
  ecran(0);
  pieces = 0;
  fini = 0;
  tic = 0;
  mCol = 2;
  mPix = 0;
  mY = 112;
  mVY = ZEROV;
  auSol = 0;
  regarde = 0;
  camCol = 0;
  camPix = 0;
  dernierCam = 0;
  i = 0;
  while (i < LARGEUR_NIVEAU) {
    objet[i] = OBJETS_ROM[i];
    i = i + 1;
  }
  eCol[0] = 40;
  eG[0] = 36;
  eD[0] = 42;
  eCol[1] = 58;
  eG[1] = 56;
  eD[1] = 61;
  n = 0;
  while (n < 2) {
    ePix[n] = 0;
    eDir[n] = 0;
    eVif[n] = 1;
    eY[n] = (LIGNES - HAUTEURS[eCol[n]]) * 8 - 16;
    n = n + 1;
  }
  dcol = 0;
  while (dcol < CASES_VUES) {
    dessinerColonne();
    dcol = dcol + 1;
  }
  defiler(0, 0);
  cacherTout();
  ecran(1);
  dessinerMario();
  dessinerEnnemis();
  dessinerCompte();
}

void ecranFin() {
  ecran(0);
  cacherTout();
  defiler(0, 0);
  y = 0;
  while (y < LIGNES) {
    x = 0;
    while (x < 20) {
      poser(x, y, 0);
      x = x + 1;
    }
    y = y + 1;
  }
  if (fini == 1) {
    texte(6, 6, "BRAVO");
    texte(3, 8, "NIVEAU FINI");
  } else {
    texte(6, 6, "PERDU");
  }
  texte(2, 12, "PIECES");
  d = pieces / 10;
  r = pieces % 10;
  poser(9, 12, ZERO + d);
  poser(10, 12, ZERO + r);
  texte(5, 15, "START");
  ecran(1);
}

void jouerUneImage() {
  gauche = bouton(GAUCHE);
  droite = bouton(DROITE);
  saut = bouton(A);
  if (saut == 1) {
    if (sautAvant == 0) {
      if (auSol == 1) {
        mVY = ZEROV - SAUT;
        auSol = 0;
      }
    }
  }
  sautAvant = saut;
  vitesse = 1;
  if (bouton(B)) {
    vitesse = 2;
  }
  if (gauche == 1) {
    regarde = 1;
    pasH = vitesse;
    while (pasH > 0) {
      gaucheUn();
      pasH = pasH - 1;
    }
  }
  if (droite == 1) {
    regarde = 0;
    pasH = vitesse;
    while (pasH > 0) {
      droiteUn();
      pasH = pasH - 1;
    }
  }
  mVY = mVY + 1;
  if (mVY > ZEROV + CHUTE_MAX) {
    mVY = ZEROV + CHUTE_MAX;
  }
  auSol = 0;
  if (mVY < ZEROV) {
    pas = ZEROV - mVY;
    while (pas > 0) {
      monterUn();
      pas = pas - 1;
    }
  }
  if (mVY > ZEROV) {
    pas = mVY - ZEROV;
    while (pas > 0) {
      descendreUn();
      pas = pas - 1;
    }
  }
  ramasser();
  tic = tic + 1;
  if (tic > 1) {
    tic = 0;
    bougerEnnemis();
  }
  toucherEnnemis();
  if (mY > 160) {
    fini = 2;
  }
  if (mCol >= DRAPEAU_COL) {
    fini = 1;
  }
  camCol = 0;
  camPix = 0;
  if (mCol > MARGE) {
    camCol = mCol - MARGE;
    camPix = mPix;
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
  dessinerMario();
  dessinerEnnemis();
  dessinerCompte();
}

int main() {
  commencer();
  while (true) {
    image();
    if (fini == 0) {
      jouerUneImage();
      if (fini > 0) {
        ecranFin();
      }
    } else {
      debut = bouton(START);
      if (debut == 1) {
        if (debutAvant == 0) {
          commencer();
        }
      }
      debutAvant = debut;
    }
  }

  return 0;
}

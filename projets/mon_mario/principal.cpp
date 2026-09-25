/*
 * MEGA — un robot qui court, saute et tire, un seul niveau.
 *
 * Un jeu neuf, pas un décalque : le héros tire (B) au lieu d'écraser les
 * ennemis, il a une jauge d'énergie plutôt qu'une mort en un coup, et ses
 * jambes bougent vraiment quand il court — deux dessins de marche, échangés
 * au rythme des pas, plus un troisième pour le saut.
 */

Perso HEROS_DEBOUT = {
  "0000011111000000",
  "0000111111100000",
  "0001133333110000",
  "0001133113310000",
  "0001111111110000",
  "0000011111000000",
  "0011111111111000",
  "0111111333311133",
  "0122222333211133",
  "0122222222211100",
  "0011222222110000",
  "0001111111100000",
  "0001133333100000",
  "0001133333100000",
  "0001133333100000",
  "0011133333110000",
};
Perso HEROS_MARCHE1 = {
  "0000011111000000",
  "0000111111100000",
  "0001133333110000",
  "0001133113310000",
  "0001111111110000",
  "0000011111000000",
  "0011111111111000",
  "0111111333311133",
  "0122222333211133",
  "0122222222211100",
  "0011222222110000",
  "0001111111100000",
  "0001133331000000",
  "0011133330000000",
  "0111133300000011",
  "1111330000001111",
};
Perso HEROS_MARCHE2 = {
  "0000011111000000",
  "0000111111100000",
  "0001133333110000",
  "0001133113310000",
  "0001111111110000",
  "0000011111000000",
  "0011111111111000",
  "0111111333311133",
  "0122222333211133",
  "0122222222211100",
  "0011222222110000",
  "0001111111100000",
  "0000013333100000",
  "0000003333110000",
  "1100003333311000",
  "1111000000003311",
};
Perso HEROS_SAUT = {
  "0000011111000000",
  "0000111111100000",
  "0001133333110000",
  "0001133113310000",
  "0001111111110000",
  "0000011111000000",
  "0011111111111000",
  "0111111333311133",
  "0122222333211133",
  "0122222222211100",
  "0011222222110000",
  "0011111111000000",
  "0113333100000000",
  "0113333100000000",
  "0000000133310000",
  "0000000133310000",
};
Perso DRONE = {
  "0000000000000000",
  "0000111111110000",
  "0011222222221100",
  "0112233333322110",
  "0122311113322110",
  "0122333333322110",
  "0122333333322110",
  "0112233333322110",
  "0011222222221100",
  "0000111111110000",
  "0001100000011000",
  "0011000000001100",
  "0000000000000000",
  "0000000000000000",
  "0000000000000000",
  "0000000000000000",
};

Tuile SOL_METAL = {
  "33333333",
  "32222223",
  "32121213",
  "32111213",
  "32121213",
  "32111213",
  "32222223",
  "33333333",
};
Tuile BLOC_ENERGIE = {
  "33333333",
  "31111113",
  "31022013",
  "31022013",
  "31220213",
  "31022013",
  "31111113",
  "33333333",
};
Tuile CAPSULE = {
  "00033000",
  "00311300",
  "03122230",
  "31222213",
  "31222213",
  "03122230",
  "00311300",
  "00033000",
};
Tuile PORTAIL = {
  "00133100",
  "01322310",
  "13222231",
  "13222231",
  "13222231",
  "13222231",
  "01322310",
  "00133100",
};
Tuile CASE_PLEINE = {
  "00000000",
  "00333300",
  "03222230",
  "03211230",
  "03211230",
  "03222230",
  "00333300",
  "00000000",
};
Tuile CASE_VIDE = {
  "00000000",
  "00111100",
  "01000010",
  "01000010",
  "01000010",
  "01000010",
  "01111100",
  "00000000",
};
Tuile TIR = {
  "00000000",
  "00000000",
  "00133100",
  "01333310",
  "01333310",
  "00133100",
  "00000000",
  "00000000",
};

/* Le terrain : une hauteur de sol par colonne, et ce qui flotte au-dessus
   (0 rien, 1 capsule d'énergie, 2 bloc, 3 portail de sortie). */
const uint8_t HAUTEURS[] = { 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 2, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 2, 2, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 2, 2, 2, 2, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 4, 4, 4, 4, 5, 5, 5, 5, 2, 2, 2, 2, 2, 0, 0, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 2, 2, 2, 2, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 2, 2, 2, 2 };
const uint8_t OBJETS_ROM[] = { 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 2, 2, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 1, 1, 1, 0, 0, 0, 0, 0, 2, 2, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 3, 0, 0 };
const uint8_t LIGNES_OBJET[] = { 0, 0, 0, 0, 0, 0, 0, 0, 0, 12, 12, 12, 0, 12, 12, 0, 0, 0, 0, 0, 0, 12, 12, 0, 0, 11, 11, 11, 0, 0, 0, 0, 0, 0, 0, 0, 11, 11, 12, 12, 12, 0, 0, 0, 0, 0, 10, 10, 0, 11, 11, 0, 0, 0, 0, 0, 0, 12, 12, 12, 0, 0, 0, 0, 0, 0, 0, 11, 11, 0, 0, 12, 12, 12, 0, 0, 0, 0, 0, 12, 12, 12, 0, 0, 0, 0, 0, 0, 0, 12, 12, 0, 0, 0, 0, 0, 0, 12, 12, 12, 0, 12, 12, 0, 0, 0, 0, 0, 0, 0, 10, 10, 10, 0, 0, 0, 0, 12, 0, 0 };

const uint8_t LARGEUR_NIVEAU = 120;
const uint8_t LIGNES = 18;
const uint8_t CASES_VUES = 21;
const uint8_t ZEROV = 16;
const uint8_t CHUTE_MAX = 5;
const uint8_t SAUT = 11;
const uint8_t GRAVITE_MONTEE = 1;
const uint8_t GRAVITE_CHUTE = 1;
const uint8_t GRAVITE_COUPURE = 3;
const uint8_t MARGE = 7;
const uint8_t PORTAIL_COL = 117;
const uint8_t ZERO = 27;
const uint8_t ENERGIE_MAX = 5;
const uint8_t INV_TEMPS = 45;
const uint8_t ANIM_PAS = 3;
const uint8_t BALLE_VITESSE = 3;

struct Drone {
  uint8_t col, pix, y, dir, vif, limiteG, limiteD;

  void avancer() {
    if (!vif) return;
    if (dir == 0) {
      pix = pix + 1;
      if (pix > 7) { pix = 0; col = col + 1; }
      if (col >= limiteD) dir = 1;
    } else {
      if (pix == 0) { pix = 7; col = col - 1; } else { pix = pix - 1; }
      if (col <= limiteG) dir = 0;
    }
  }
};
Drone drones[2];

struct Balle {
  uint8_t vif, col, pix, dir, y;

  void avancerUn() {
    if (dir == 0) {
      pix = pix + 1;
      if (pix > 7) { pix = 0; col = col + 1; }
    } else {
      if (pix == 0) {
        if (col > 0) { pix = 7; col = col - 1; } else { vif = 0; }
      } else {
        pix = pix - 1;
      }
    }
  }
};
Balle balles[2];

uint8_t objet[LARGEUR_NIVEAU];
uint8_t camCol = 0;
uint8_t camPix = 0;
uint8_t colPreteJusque = 0;
uint8_t colEnPreparation = 0;
uint8_t lignePreparation = 0;

uint8_t hCol = 2;
uint8_t hPix = 0;
uint8_t hY = 112;
uint8_t hVY = 16;
uint8_t auSol = 0;
uint8_t regarde = 0;
uint8_t energie = 5;
uint8_t hInv = 0;
uint8_t etatAnim = 0;
uint8_t animTic = 0;

uint8_t puces = 0;
uint8_t fini = 0;
uint8_t tic = 0;

uint8_t sautAvant = 0;
uint8_t tirAvant = 0;
uint8_t debutAvant = 0;
uint8_t energieAffichee = 255;
uint8_t pucesAffichees = 255;

uint8_t estSolide(uint8_t col, uint8_t lig) {
  if (col >= LARGEUR_NIVEAU) return 0;
  if (lig >= LIGNES) return 0;
  uint8_t h = HAUTEURS[col];
  if (h > 0) { if (lig >= LIGNES - h) return 1; }
  if (objet[col] == 2) { if (lig == LIGNES_OBJET[col]) return 1; }
  return 0;
}

uint8_t heurteSurLigne(uint8_t colG, uint8_t colD, uint8_t lig) {
  if (estSolide(colG, lig)) return 1;
  if (estSolide(colD, lig)) return 1;
  return 0;
}

uint8_t heurteACote(uint8_t col, uint8_t ligH, uint8_t ligB) {
  for (uint8_t l = ligH; l <= ligB; l++) {
    if (estSolide(col, l)) return 1;
  }
  return 0;
}

void descendreUn() {
  hY = hY + 1;
  uint8_t colD = (hPix > 0) ? hCol + 2 : hCol + 1;
  uint8_t ligB = (hY + 15) / 8;
  if (heurteSurLigne(hCol, colD, ligB)) { hY = hY - 1; hVY = ZEROV; auSol = 1; }
}

void monterUn() {
  if (hY == 0) { hVY = ZEROV; return; }
  hY = hY - 1;
  uint8_t colD = (hPix > 0) ? hCol + 2 : hCol + 1;
  uint8_t ligH = hY / 8;
  if (heurteSurLigne(hCol, colD, ligH)) { hY = hY + 1; hVY = ZEROV; }
}

void droiteUn() {
  uint8_t ancienCol = hCol;
  uint8_t ancienPix = hPix;
  hPix = hPix + 1;
  if (hPix > 7) { hPix = 0; hCol = hCol + 1; }
  uint8_t colD = (hPix > 0) ? hCol + 2 : hCol + 1;
  uint8_t ligH = hY / 8;
  uint8_t ligB = (hY + 15) / 8;
  if (heurteACote(colD, ligH, ligB)) { hCol = ancienCol; hPix = ancienPix; }
}

void gaucheUn() {
  if (hCol == 0) return;
  uint8_t ancienCol = hCol;
  uint8_t ancienPix = hPix;
  if (hPix == 0) { hPix = 7; hCol = hCol - 1; } else { hPix = hPix - 1; }
  uint8_t ligH = hY / 8;
  uint8_t ligB = (hY + 15) / 8;
  if (heurteACote(hCol, ligH, ligB)) { hCol = ancienCol; hPix = ancienPix; }
}

void ramasserDonnees() {
  uint8_t colD = (hPix > 0) ? hCol + 2 : hCol + 1;
  uint8_t ligH = hY / 8;
  uint8_t ligB = (hY + 15) / 8;
  for (uint8_t l = ligH; l <= ligB; l++) {
    for (uint8_t n = hCol; n <= colD; n++) {
      if (n < LARGEUR_NIVEAU) {
        if (objet[n] == 1) {
          if (LIGNES_OBJET[n] == l) {
            objet[n] = 0;
            puces = puces + 1;
            poser(n % 32, l, 0);
          }
        }
      }
    }
  }
}

void avancerBalle(uint8_t m) {
  if (!balles[m].vif) return;
  for (uint8_t p = 0; p < BALLE_VITESSE; p++) { balles[m].avancerUn(); }
  if (!balles[m].vif) return;
  if (balles[m].col >= LARGEUR_NIVEAU) { balles[m].vif = 0; return; }
  if (estSolide(balles[m].col, balles[m].y / 8)) { balles[m].vif = 0; }
}

uint8_t droneToucheBalle(uint8_t n, uint8_t m) {
  if (!drones[n].vif) return 0;
  if (!balles[m].vif) return 0;
  uint8_t dist = (balles[m].col > drones[n].col) ? balles[m].col - drones[n].col : drones[n].col - balles[m].col;
  if (dist > 1) return 0;
  if (balles[m].y + 7 < drones[n].y) return 0;
  if (balles[m].y > drones[n].y + 15) return 0;
  return 1;
}

uint8_t droneToucheHeros(uint8_t n) {
  if (!drones[n].vif) return 0;
  uint8_t proche = 0;
  if (hCol + 1 >= drones[n].col) { if (drones[n].col + 1 >= hCol) proche = 1; }
  if (!proche) return 0;
  if (hY + 15 >= drones[n].y) { if (drones[n].y + 15 >= hY) return 1; }
  return 0;
}

/* Une seule ligne d'une colonne — de quoi étaler le dessin d'une colonne
   entière sur plusieurs images plutôt que de le faire d'un coup. */
void dessinerLigneColonne(uint8_t dcol, uint8_t y) {
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
  uint8_t t = 0;
  if (h > 0) { if (y >= premier) t = SOL_METAL; }
  if (quoi == 1) { if (y == ligneObjet) t = CAPSULE; }
  if (quoi == 2) { if (y == ligneObjet) t = BLOC_ENERGIE; }
  if (quoi == 3) { if (y == ligneObjet) t = PORTAIL; }
  poser(dmap, y, t);
}

void dessinerColonne(uint8_t dcol) {
  for (uint8_t y = 0; y < LIGNES; y++) dessinerLigneColonne(dcol, y);
}

/* Prépare, quelques lignes à la fois, la prochaine colonne dont la caméra
   aura besoin — pour ne jamais avoir à en écrire dix-huit lignes d'un coup
   pile au moment où elle doit apparaître.
   Le calcul qui fixe « 6 » : une colonne fait LIGNES(18) lignes, et à la
   vitesse du héros (2 pixels/image), la caméra en réclame une nouvelle
   toutes les 8/2 = 4 images. Il en faut donc au moins 18/4 = 4,5, arrondi à
   5, pour ne jamais prendre de retard — 6 laisse une image entière de
   marge en plus. Si la vitesse du héros change un jour, ce calcul doit
   être refait : sinon la préparation recommence à traîner derrière la
   caméra, et on retombe sur un gros dessin d'un coup. */
void preparerColonnesAVenir() {
  if (colEnPreparation > LARGEUR_NIVEAU + CASES_VUES) return;
  /* Sans cette limite, la préparation continuait à courir en avant même
     immobile — et au bout d'une trentaine de colonnes d'avance, elle
     revenait recouvrir, dans la carte de 32 colonnes qui boucle, des
     colonnes ENCORE À L'ÉCRAN avec le contenu d'une colonne bien plus
     loin. D'où l'écran qui « changeait tout seul » à l'arrêt : rien ne
     bougeait, mais la préparation, elle, ne s'arrêtait jamais. */
  if (colEnPreparation >= camCol + CASES_VUES + 8) return;
  for (uint8_t k = 0; k < 6; k++) {
    if (lignePreparation < LIGNES) {
      dessinerLigneColonne(colEnPreparation, lignePreparation);
      lignePreparation = lignePreparation + 1;
    }
  }
  if (lignePreparation >= LIGNES) {
    colPreteJusque = colEnPreparation;
    colEnPreparation = colEnPreparation + 1;
    lignePreparation = 0;
  }
}

void animerHeros(uint8_t gauche, uint8_t droite) {
  if (!auSol) return;
  if (gauche || droite) {
    animTic = animTic + 1;
    if (animTic >= ANIM_PAS) {
      animTic = 0;
      if (etatAnim == 1) { etatAnim = 2; } else { etatAnim = 1; }
    }
    if (etatAnim == 0) etatAnim = 1;
  } else {
    etatAnim = 0;
    animTic = 0;
  }
}

void dessinerHeros() {
  if (hInv > 0) { if ((hInv / 4) % 2 == 1) { cacher16(0); return; } }
  uint8_t sx = (hCol - camCol) * 8 + hPix - camPix;
  uint8_t frame = 0;
  if (!auSol) { frame = 3; } else if (etatAnim == 1) { frame = 1; } else if (etatAnim == 2) { frame = 2; }
  if (regarde == 0) {
    if (frame == 3) { sprite16(0, sx, hY, HEROS_SAUT, 0); return; }
    if (frame == 1) { sprite16(0, sx, hY, HEROS_MARCHE1, 0); return; }
    if (frame == 2) { sprite16(0, sx, hY, HEROS_MARCHE2, 0); return; }
    sprite16(0, sx, hY, HEROS_DEBOUT, 0);
  } else {
    if (frame == 3) { sprite16(0, sx, hY, HEROS_SAUT, MIROIR_X); return; }
    if (frame == 1) { sprite16(0, sx, hY, HEROS_MARCHE1, MIROIR_X); return; }
    if (frame == 2) { sprite16(0, sx, hY, HEROS_MARCHE2, MIROIR_X); return; }
    sprite16(0, sx, hY, HEROS_DEBOUT, MIROIR_X);
  }
}

void dessinerDrones() {
  for (uint8_t n = 0; n < 2; n++) {
    if (drones[n].vif) {
      if (drones[n].col >= camCol) {
        if (drones[n].col < camCol + CASES_VUES) {
          uint8_t ex = (drones[n].col - camCol) * 8 + drones[n].pix;
          if (ex >= camPix) { ex = ex - camPix; } else { ex = 0; }
          if (drones[n].dir == 0) { sprite16(4 + n * 4, ex, drones[n].y, DRONE, 0); } else { sprite16(4 + n * 4, ex, drones[n].y, DRONE, MIROIR_X); }
          continue;
        }
      }
    }
    cacher16(4 + n * 4);
  }
}

void dessinerBalles() {
  for (uint8_t m = 0; m < 2; m++) {
    if (balles[m].vif) {
      if (balles[m].col >= camCol) {
        if (balles[m].col < camCol + CASES_VUES) {
          uint8_t ex = (balles[m].col - camCol) * 8 + balles[m].pix;
          if (ex >= camPix) { ex = ex - camPix; } else { ex = 0; }
          sprite(16 + m, ex, balles[m].y, TIR);
          continue;
        }
      }
    }
    cacher(16 + m);
  }
}

void dessinerEnergie() {
  if (energie == energieAffichee) return;
  energieAffichee = energie;
  for (uint8_t i = 0; i < ENERGIE_MAX; i++) {
    if (i < energie) { sprite(20 + i, 8 + i * 8, 8, CASE_PLEINE); } else { sprite(20 + i, 8 + i * 8, 8, CASE_VIDE); }
  }
}

void dessinerDonnees() {
  if (puces == pucesAffichees) return;
  pucesAffichees = puces;
  uint8_t d = puces / 10;
  uint8_t r = puces % 10;
  sprite(28, 128, 8, CAPSULE);
  sprite(29, 140, 8, ZERO + d);
  sprite(30, 148, 8, ZERO + r);
}

void cacherTout() {
  cacher16(0);
  cacher16(4);
  cacher16(8);
  cacher(16);
  cacher(17);
  for (uint8_t i = 0; i < ENERGIE_MAX; i++) cacher(20 + i);
  cacher(28);
  cacher(29);
  cacher(30);
}

void commencer() {
  ecran(0);
  puces = 0;
  fini = 0;
  tic = 0;
  hCol = 2;
  hPix = 0;
  hY = 112;
  hVY = ZEROV;
  auSol = 0;
  regarde = 0;
  energie = ENERGIE_MAX;
  hInv = 0;
  etatAnim = 0;
  animTic = 0;
  sautAvant = 0;
  tirAvant = 0;
  energieAffichee = 255;
  pucesAffichees = 255;
  camCol = 0;
  camPix = 0;
  colPreteJusque = CASES_VUES - 1;
  colEnPreparation = CASES_VUES;
  lignePreparation = 0;

  for (uint8_t i = 0; i < LARGEUR_NIVEAU; i++) objet[i] = OBJETS_ROM[i];

  drones[0].col = 40;
  drones[0].limiteG = 36;
  drones[0].limiteD = 42;
  drones[1].col = 58;
  drones[1].limiteG = 56;
  drones[1].limiteD = 61;
  for (uint8_t n = 0; n < 2; n++) {
    drones[n].pix = 0;
    drones[n].dir = 0;
    drones[n].vif = 1;
    drones[n].y = (LIGNES - HAUTEURS[drones[n].col]) * 8 - 16;
  }
  for (uint8_t m = 0; m < 2; m++) balles[m].vif = 0;

  for (uint8_t dcol = 0; dcol < CASES_VUES; dcol++) dessinerColonne(dcol);
  defiler(0, 0);
  cacherTout();
  ecran(1);
  dessinerHeros();
  dessinerDrones();
  dessinerBalles();
  dessinerEnergie();
  dessinerDonnees();
}

void ecranFin() {
  ecran(0);
  cacherTout();
  defiler(0, 0);
  for (uint8_t y = 0; y < LIGNES; y++) {
    for (uint8_t x = 0; x < 20; x++) {
      poser(x, y, 0);
    }
  }
  if (fini == 1) {
    texte(5, 6, "REUSSI");
    texte(2, 8, "ZONE NETTOYEE");
  } else {
    texte(4, 6, "DETRUIT");
  }
  texte(2, 12, "DONNEES");
  uint8_t d = puces / 10;
  uint8_t r = puces % 10;
  poser(10, 12, ZERO + d);
  poser(11, 12, ZERO + r);
  texte(5, 15, "START");
  ecran(1);
}

void jouerUneImage() {
  uint8_t gauche = bouton(GAUCHE);
  uint8_t droite = bouton(DROITE);
  uint8_t saut = bouton(A);
  uint8_t tir = bouton(B);

  if (saut) { if (!sautAvant) { if (auSol) { hVY = ZEROV - SAUT; auSol = 0; } } }
  sautAvant = saut;

  /* Deux pixels par image : sans bouton « courir » séparé (B tire, ici), la
     vitesse de base doit rester celle qu'un Mario qui courait avait — sinon
     les trous du terrain, prévus pour cette vitesse-là, redeviennent
     injustes à négocier. */
  if (gauche) { regarde = 1; gaucheUn(); gaucheUn(); }
  if (droite) { regarde = 0; droiteUn(); droiteUn(); }

  if (tir) {
    if (!tirAvant) {
      for (uint8_t i = 0; i < 2; i++) {
        if (!balles[i].vif) {
          balles[i].vif = 1;
          balles[i].dir = regarde;
          balles[i].col = hCol;
          balles[i].pix = hPix;
          balles[i].y = hY + 6;
          balles[i].avancerUn();
          balles[i].avancerUn();
          break;
        }
      }
    }
  }
  tirAvant = tir;

  /* Gravité à la Mario : la montée est plus lente que la chute — pas la
     même valeur dans les deux sens, c'est ce qui donne la forme d'un saut
     de plombier et non d'une balle. Tenir A pendant la montée garde la
     gravité légère jusqu'en haut ; le relâcher tôt la rend immédiatement
     plus dure, d'où le petit hop quand on tapote au lieu de tenir. */
  uint8_t g = GRAVITE_CHUTE;
  if (hVY < ZEROV) { g = saut ? GRAVITE_MONTEE : GRAVITE_COUPURE; }
  hVY = hVY + g;
  if (hVY > ZEROV + CHUTE_MAX) hVY = ZEROV + CHUTE_MAX;
  auSol = 0;

  if (hVY < ZEROV) {
    uint8_t pas = ZEROV - hVY;
    for (uint8_t p = 0; p < pas; p++) monterUn();
  }
  if (hVY > ZEROV) {
    uint8_t pas = hVY - ZEROV;
    for (uint8_t p = 0; p < pas; p++) descendreUn();
  }

  ramasserDonnees();

  tic = tic + 1;
  if (tic > 1) {
    tic = 0;
    for (uint8_t n = 0; n < 2; n++) drones[n].avancer();
  }

  for (uint8_t m = 0; m < 2; m++) avancerBalle(m);

  for (uint8_t m = 0; m < 2; m++) {
    if (balles[m].vif) {
      for (uint8_t n = 0; n < 2; n++) {
        if (droneToucheBalle(n, m)) {
          drones[n].vif = 0;
          balles[m].vif = 0;
          puces = puces + 1;
        }
      }
    }
  }

  if (hInv > 0) hInv = hInv - 1;
  for (uint8_t n = 0; n < 2; n++) {
    if (droneToucheHeros(n)) {
      if (hInv == 0) {
        if (energie > 0) energie = energie - 1;
        hInv = INV_TEMPS;
        if (energie == 0) fini = 2;
      }
    }
  }

  if (hY > 160) fini = 2;
  if (hCol >= PORTAIL_COL) fini = 1;

  preparerColonnesAVenir();

  uint8_t camColCible = 0;
  uint8_t camPixCible = 0;
  if (hCol > MARGE) { camColCible = hCol - MARGE; camPixCible = hPix; }
  if (camColCible > LARGEUR_NIVEAU - CASES_VUES) { camColCible = LARGEUR_NIVEAU - CASES_VUES; camPixCible = 0; }

  if (camColCible > camCol) {
    /* La colonne a normalement déjà été préparée à l'avance ; ce
       « dessinerColonne » n'est qu'un filet de sécurité, au cas où la
       préparation n'aurait pas eu le temps de suivre. */
    if (colPreteJusque < camColCible + CASES_VUES - 1) {
      dessinerColonne(camColCible + CASES_VUES - 1);
      colPreteJusque = camColCible + CASES_VUES - 1;
    }
    camCol = camColCible;
  } else if (camColCible < camCol) {
    dessinerColonne(camColCible);
    camCol = camColCible;
  }
  camPix = camPixCible;
  defiler(camCol * 8 + camPix, 0);

  animerHeros(gauche, droite);
  dessinerHeros();
  dessinerDrones();
  dessinerBalles();
  dessinerEnergie();
  dessinerDonnees();
}

int main() {
  commencer();
  while (true) {
    image();
    if (fini == 0) {
      jouerUneImage();
      if (fini > 0) { ecranFin(); }
    } else {
      uint8_t debut = bouton(START);
      if (debut) { if (!debutAvant) { commencer(); } }
      debutAvant = debut;
    }
  }

  return 0;
}

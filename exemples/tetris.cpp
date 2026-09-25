// Porté depuis tetris.js par « node porter.mjs ».
//
// Le portage est littéral : il donne un programme juste, non un programme
// idiomatique. Les variables globales qui servaient d'arguments faute de
// mieux méritent de redevenir des arguments, et les portées de reprendre
// leur place — c'est là tout l'intérêt d'être passé au C++.

uint8_t LARGEUR = 10;
uint8_t HAUTEUR = 17;
uint8_t COLONNE = 1;
uint8_t LIGNE = 0;
uint8_t BORD = 4;
uint8_t PANNEAU = 13;
uint8_t VIDE = 0;
uint8_t BLOC = 42;
uint8_t MUR = 43;
uint8_t ZERO = 27;
const uint8_t FORMES[] = { 0, 1, 1, 1, 2, 1, 3, 1, 2, 0, 2, 1, 2, 2, 2, 3, 0, 2, 1, 2, 2, 2, 3, 2, 1, 0, 1, 1, 1, 2, 1, 3, 0, 0, 0, 1, 1, 1, 2, 1, 1, 0, 2, 0, 1, 1, 1, 2, 0, 1, 1, 1, 2, 1, 2, 2, 1, 0, 1, 1, 0, 2, 1, 2, 2, 0, 0, 1, 1, 1, 2, 1, 1, 0, 1, 1, 1, 2, 2, 2, 0, 1, 1, 1, 2, 1, 0, 2, 0, 0, 1, 0, 1, 1, 1, 2, 1, 0, 2, 0, 1, 1, 2, 1, 1, 0, 2, 0, 1, 1, 2, 1, 1, 0, 2, 0, 1, 1, 2, 1, 1, 0, 2, 0, 1, 1, 2, 1, 1, 0, 2, 0, 0, 1, 1, 1, 1, 0, 1, 1, 2, 1, 2, 2, 1, 1, 2, 1, 0, 2, 1, 2, 0, 0, 0, 1, 1, 1, 1, 2, 1, 0, 0, 1, 1, 1, 2, 1, 1, 0, 1, 1, 2, 1, 1, 2, 0, 1, 1, 1, 2, 1, 1, 2, 1, 0, 0, 1, 1, 1, 1, 2, 0, 0, 1, 0, 1, 1, 2, 1, 2, 0, 1, 1, 2, 1, 1, 2, 0, 1, 1, 1, 1, 2, 2, 2, 1, 0, 0, 1, 1, 1, 0, 2 };
uint8_t puits[170];
uint8_t piece = 0;
uint8_t rotation = 0;
uint8_t posX = 0;
uint8_t posY = 0;
uint8_t suivant = 0;
uint8_t essaiPiece = 0;
uint8_t essaiRotation = 0;
uint8_t essaiX = 0;
uint8_t essaiY = 0;
uint8_t heurte = 0;
uint8_t vuesX[4];
uint8_t vuesY[4];
uint8_t vues = 0;
uint8_t apercuX[4];
uint8_t apercuY[4];
uint8_t apercus = 0;
uint8_t refaireApercu = 0;
uint8_t lignes = 0;
uint8_t efface = 0;
uint8_t attente = 0;
uint8_t vitesse = 24;
uint8_t perdu = 0;
uint8_t graine = 7;
uint8_t x = 0;
uint8_t y = 0;
uint8_t yy = 0;
uint8_t c = 0;
uint8_t depart = 0;
uint8_t cx = 0;
uint8_t cy = 0;
uint8_t k = 0;
uint8_t pleine = 0;
uint8_t d = 0;
uint8_t r = 0;
uint8_t tire = 0;
uint8_t gauche = 0;
uint8_t droite = 0;
uint8_t tourner = 0;
uint8_t debut = 0;
uint8_t gaucheAvant = 0;
uint8_t droiteAvant = 0;
uint8_t tournerAvant = 0;
uint8_t debutAvant = 0;

void viderPuits() {
  k = 0;
  while (k < 170) {
    puits[k] = VIDE;
    k = k + 1;
  }
}

void dessinerDecor() {
  y = 0;
  while (y < HAUTEUR) {
    poser(COLONNE - 1, LIGNE + y, MUR);
    poser(COLONNE + LARGEUR, LIGNE + y, MUR);
    y = y + 1;
  }
  x = 0;
  while (x < LARGEUR + 2) {
    poser(COLONNE - 1 + x, LIGNE + HAUTEUR, MUR);
    x = x + 1;
  }
  texte(13, 1, "LIGNES");
  texte(13, 5, "SUIVANT");
}

void dessinerPuits() {
  y = 0;
  while (y < HAUTEUR) {
    x = 0;
    while (x < LARGEUR) {
      k = y * LARGEUR + x;
      poser(COLONNE + x, LIGNE + y, puits[k]);
      x = x + 1;
    }
    y = y + 1;
  }
}

void tester() {
  heurte = 0;
  c = 0;
  while (c < 4) {
    depart = (essaiPiece * 4 + essaiRotation) * 8 + c * 2;
    cx = essaiX + FORMES[depart];
    cy = essaiY + FORMES[depart + 1];
    if (cx < BORD) {
      heurte = 1;
    }
    if (cx >= BORD + LARGEUR) {
      heurte = 1;
    }
    if (cy >= HAUTEUR) {
      heurte = 1;
    }
    if (heurte == 0) {
      k = cy * LARGEUR + cx - BORD;
      if (puits[k] != VIDE) {
        heurte = 1;
      }
    }
    c = c + 1;
  }
}

void effacerPiece() {
  c = 0;
  while (c < vues) {
    cx = vuesX[c];
    cy = vuesY[c];
    k = cy * LARGEUR + cx;
    poser(COLONNE + cx, LIGNE + cy, puits[k]);
    c = c + 1;
  }
  vues = 0;
}

void dessinerPiece() {
  c = 0;
  vues = 0;
  while (c < 4) {
    depart = (piece * 4 + rotation) * 8 + c * 2;
    cx = posX + FORMES[depart] - BORD;
    cy = posY + FORMES[depart + 1];
    if (cy < HAUTEUR) {
      poser(COLONNE + cx, LIGNE + cy, BLOC);
      vuesX[vues] = cx;
      vuesY[vues] = cy;
      vues = vues + 1;
    }
    c = c + 1;
  }
}

void figerPiece() {
  c = 0;
  while (c < 4) {
    depart = (piece * 4 + rotation) * 8 + c * 2;
    cx = posX + FORMES[depart] - BORD;
    cy = posY + FORMES[depart + 1];
    if (cy < HAUTEUR) {
      k = cy * LARGEUR + cx;
      puits[k] = BLOC;
    }
    c = c + 1;
  }
}

void tirerSuivant() {
  tire = 7;
  while (tire > 6) {
    graine = graine * 5 + hasard() + 1;
    tire = graine & 7;
  }
  suivant = tire;
}

void dessinerApercu() {
  c = 0;
  while (c < apercus) {
    poser(apercuX[c], apercuY[c], VIDE);
    c = c + 1;
  }
  apercus = 0;
  c = 0;
  while (c < 4) {
    depart = suivant * 32 + c * 2;
    cx = PANNEAU + 1 + FORMES[depart];
    cy = 7 + FORMES[depart + 1];
    poser(cx, cy, BLOC);
    apercuX[apercus] = cx;
    apercuY[apercus] = cy;
    apercus = apercus + 1;
    c = c + 1;
  }
}

void nouvellePiece() {
  piece = suivant;
  tirerSuivant();
  refaireApercu = 1;
  rotation = 0;
  posX = BORD + 3;
  posY = 0;
  essaiPiece = piece;
  essaiRotation = rotation;
  essaiX = posX;
  essaiY = posY;
  tester();
  if (heurte == 1) {
    perdu = 1;
  }
}

void retirerLignes() {
  efface = 0;
  y = HAUTEUR;
  while (y > 0) {
    y = y - 1;
    pleine = 1;
    x = 0;
    while (x < LARGEUR) {
      k = y * LARGEUR + x;
      if (puits[k] == VIDE) {
        pleine = 0;
      }
      x = x + 1;
    }
    if (pleine == 1) {
      yy = y;
      while (yy > 0) {
        x = 0;
        while (x < LARGEUR) {
          k = yy * LARGEUR + x;
          puits[k] = puits[k - LARGEUR];
          x = x + 1;
        }
        yy = yy - 1;
      }
      x = 0;
      while (x < LARGEUR) {
        puits[x] = VIDE;
        x = x + 1;
      }
      lignes = lignes + 1;
      efface = 1;
      y = y + 1;
    }
  }
}

void afficherLignes() {
  r = lignes;
  d = 0;
  while (r > 9) {
    r = r - 10;
    d = d + 1;
  }
  poser(PANNEAU, 2, ZERO + d);
  poser(PANNEAU + 1, 2, ZERO + r);
}

void reglerVitesse() {
  vitesse = 24;
  if (lignes > 4) {
    vitesse = 18;
  }
  if (lignes > 9) {
    vitesse = 13;
  }
  if (lignes > 14) {
    vitesse = 9;
  }
  if (lignes > 19) {
    vitesse = 6;
  }
}

void commencer() {
  ecran(0);
  lignes = 0;
  perdu = 0;
  efface = 0;
  attente = 0;
  vitesse = 24;
  vues = 0;
  apercus = 0;
  viderPuits();
  dessinerDecor();
  dessinerPuits();
  afficherLignes();
  tirerSuivant();
  nouvellePiece();
  ecran(1);
  dessinerApercu();
  refaireApercu = 0;
  dessinerPiece();
}

int main() {
  commencer();
  while (true) {
    image();
    if (refaireApercu == 1) {
      dessinerApercu();
      refaireApercu = 0;
    }
    gauche = bouton(GAUCHE);
    droite = bouton(DROITE);
    tourner = bouton(A);
    debut = bouton(START);
    if (perdu == 0) {
      essaiPiece = piece;
      essaiRotation = rotation;
      essaiY = posY;
      if (gauche == 1) {
        if (gaucheAvant == 0) {
          essaiX = posX - 1;
          tester();
          if (heurte == 0) {
            posX = essaiX;
          }
        }
      }
      if (droite == 1) {
        if (droiteAvant == 0) {
          essaiX = posX + 1;
          tester();
          if (heurte == 0) {
            posX = essaiX;
          }
        }
      }
      if (tourner == 1) {
        if (tournerAvant == 0) {
          essaiX = posX;
          essaiRotation = rotation + 1;
          if (essaiRotation > 3) {
            essaiRotation = 0;
          }
          tester();
          if (heurte == 0) {
            rotation = essaiRotation;
          }
        }
      }
      attente = attente + 1;
      if (bouton(BAS)) {
        attente = vitesse;
      }
      if (attente >= vitesse) {
        attente = 0;
        essaiPiece = piece;
        essaiRotation = rotation;
        essaiX = posX;
        essaiY = posY + 1;
        tester();
        if (heurte == 0) {
          posY = posY + 1;
        } else {
          vues = 0;
          figerPiece();
          retirerLignes();
          reglerVitesse();
          afficherLignes();
          if (efface == 1) {
            ecran(0);
            dessinerPuits();
            ecran(1);
          }
          nouvellePiece();
        }
      }
      effacerPiece();
      dessinerPiece();
    }
    if (perdu == 1) {
      texte(3, 7, "PERDU");
      texte(2, 9, "START");
      if (debut == 1) {
        if (debutAvant == 0) {
          commencer();
        }
      }
    }
    gaucheAvant = gauche;
    droiteAvant = droite;
    tournerAvant = tourner;
    debutAvant = debut;
  }

  return 0;
}

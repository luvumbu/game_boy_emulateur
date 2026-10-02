// Un objet qui tombe — la pesanteur, en seizièmes de pixel.
//
//   node gb3.mjs exemples/chute.cpp
//
// Deux difficultés, et ce sont les mêmes dans tous les jeux de cette console :
//
// 1. LA CONSOLE NE CONNAÎT PAS LA VIRGULE. Un objet qui tombe accélère : il
//    avance de moins d'un pixel par image au début, de plusieurs à la fin.
//    Arrondir à chaque image donnerait une chute par saccades. On garde donc
//    la position en DEUX morceaux — les pixels dans `y`, les seizièmes de
//    pixel dans `frac` — et l'on ne montre à l'écran que les pixels.
//
// 2. LA CONSOLE NE CONNAÎT PAS LE MOINS. Une vitesse, elle, va dans les deux
//    sens. On la décale : `REPOS` (128) veut dire « immobile », au-dessus on
//    descend, en dessous on monte. Soustraire 128 rend le vrai nombre.
//
// Le reste est la physique de tout le monde : la vitesse s'ajoute à la
// position, la pesanteur s'ajoute à la vitesse, et le sol renvoie l'objet en
// lui prenant un quart de sa vitesse à chaque choc.

#include <Tuile>    // un dessin de 8 × 8 pixels
#include <bouton>   // lit un bouton de la manette
#include <texte>    // écrit un texte à l’écran
#include <poser>    // pose une tuile sur une case du fond
#include <nombre>   // écrit un nombre en chiffres
#include <ecran>    // éteint ou rallume l’écran
#include <sprite>   // place un lutin de 8 × 8 au pixel près

Tuile BALLE = {
  "00333300",
  "03222230",
  "32222223",
  "32222223",
  "32222223",
  "32222223",
  "03222230",
  "00333300",
};

Tuile TERRAIN = {
  "33333333",
  "32323232",
  "23232323",
  "32323232",
  "23232323",
  "32323232",
  "23232323",
  "32323232",
};

/* La vitesse décalée : 128 est l'immobilité, et non zéro. */
const uint8_t REPOS = 128;

/* Six pixels par tour. Sans cette limite, une longue chute finirait par
   traverser le sol d'un bond, entre deux tours, sans jamais le toucher. */
const uint8_t VMAX = 96;

const uint8_t DEPART = 16;   // le haut de la balle quand on la lâche
const uint8_t TERRE = 120;   // le haut de la balle quand elle touche le sol
const uint8_t PLAFOND = 8;   // au-dessus, on ne monte pas

/* En dessous d'un pixel et demi par tour, un rebond ne se voit plus : la balle
   tremblerait sur place indéfiniment. On la couche. */
const uint8_t SEUIL = 24;

uint8_t y = DEPART;
uint8_t frac = 0;       // les seizièmes de pixel — ce que `y` ne peut pas dire
uint8_t vy = REPOS;
uint8_t x = 132;
uint8_t g = 2;          // la pesanteur, en seizièmes de pixel par tour, par tour
uint8_t rebonds = 0;
uint8_t couchee = 0;
uint8_t aAvant = 0;
uint8_t hAvant = 0;
uint8_t bAvant = 0;
uint8_t tour = 0;       // lequel des quatre nombres on rafraîchit ce tour-ci
uint8_t pas = 0;        // les images, 0 puis 1 : la physique avance quand il revient à 0

/* ------------------------------------------------------- le déplacement */

/* Descendre de « d » seizièmes : les seizièmes débordent dans les pixels. */
void descendre(uint8_t d) {
  frac = frac + d;
  y = y + (frac >> 4);
  frac = frac & 15;
}

/*
 * Monter de « d » seizièmes.
 *
 * C'est la soustraction qui demande du soin : si les seizièmes ne suffisent
 * pas, il faut emprunter des pixels entiers — exactement comme une soustraction
 * posée à la main emprunte une dizaine.
 */
void monter(uint8_t d) {
  if (frac >= d) {
    frac = frac - d;
  } else {
    uint8_t manque = d - frac;
    uint8_t entiers = (manque + 15) >> 4;
    y = y - entiers;
    frac = (entiers << 4) - manque;
  }
}

/* ---------------------------------------------------------- la physique */

/* La pesanteur ajoute à la vitesse ; la vitesse ajoute à la position. */
void avancer() {
  vy = vy + g;
  if (vy > REPOS + VMAX) {
    vy = REPOS + VMAX;
  }

  if (vy > REPOS) {
    descendre(vy - REPOS);
  }
  if (vy < REPOS) {
    monter(REPOS - vy);
  }
}

/*
 * Le choc.
 *
 * La balle repart vers le haut avec les trois quarts de la vitesse qu'elle
 * avait en arrivant : c'est cette perte, et rien d'autre, qui fait que les
 * rebonds se tassent et finissent par s'arrêter.
 */
void toucherLeSol() {
  if (y >= TERRE) {
    uint8_t chute = vy - REPOS;
    uint8_t renvoi = chute - (chute >> 2);

    y = TERRE;
    frac = 0;

    if (renvoi < SEUIL) {
      vy = REPOS;
      couchee = 1;
    } else {
      vy = REPOS - renvoi;
      rebonds = rebonds + 1;
    }
  }
}

/*
 * Le plafond — un garde-fou, pas une règle du jeu.
 *
 * `y` est un octet : à zéro, un pixel de moins le renvoie à 255, et la balle
 * reparaîtrait par le bas de l'écran. Avec la pesanteur d'origine cela n'arrive
 * jamais ; on ne laisse pas pour autant le programme au bord du trou.
 */
void toucherLePlafond() {
  if (y < PLAFOND || y > 200) {
    y = PLAFOND;
    frac = 0;
    vy = REPOS;
  }
}

/* ---------------------------------------------------------- la commande */

void relancer() {
  y = DEPART;
  frac = 0;
  vy = REPOS;
  rebonds = 0;
  couchee = 0;
}

void lireLesTouches() {
  uint8_t a = bouton(A);
  if (a && !aAvant) {
    relancer();
  }
  aAvant = a;

  /* La pesanteur se règle au front, sinon un appui d'un dixième de seconde la
     ferait courir d'un bout à l'autre de son échelle. */
  uint8_t h = bouton(HAUT);
  if (h && !hAvant && g < 8) {
    g = g + 1;
  }
  hAvant = h;

  uint8_t b = bouton(BAS);
  if (b && !bAvant && g > 1) {
    g = g - 1;
  }
  bAvant = b;

  /* Pousser de côté, en revanche, se fait tant qu'on appuie. */
  if (bouton(GAUCHE) && x > 8) {
    x = x - 1;
  }
  if (bouton(DROITE) && x < 144) {
    x = x + 1;
  }
}

/* ----------------------------------------------------------- l'écriture */

void decor() {
  texte(0, 0, "CHUTE LIBRE");
  texte(0, 2, "HAUTEUR");
  texte(0, 3, "VITESSE");
  texte(0, 4, "PESANTEUR");
  texte(0, 5, "REBONDS");

  texte(0, 7, "A RELANCE");
  texte(0, 8, "HAUT BAS PESANTEUR");
  texte(0, 9, "GAUCHE DROITE POUSSE");

  for (uint8_t c = 0; c < 20; c++) {
    poser(c, 16, TERRAIN);
    poser(c, 17, TERRAIN);
  }
}

/*
 * UN SEUL NOMBRE PAR TOUR.
 *
 * Écrire dans la mémoire vidéo n'est possible que quand le balayage se repose.
 * Autrefois, `nombre()` attendait pour cela l'image suivante, et chaque tour de
 * boucle durait deux images : c'est sur ce rythme, trente pas par seconde, que
 * la pesanteur a été réglée. Aujourd'hui, `nombre()` n'attend plus qu'une
 * ligne ; la boucle tourne à soixante tours par seconde, et c'est `main()` qui
 * ne fait avancer la physique qu'une image sur deux — écrit en clair, au lieu
 * de dépendre d'une attente cachée.
 *
 * Un nombre par tour suffit : chacun est réécrit quinze fois par seconde.
 */
void mesures() {
  if (tour == 0) {
    nombre(11, 2, TERRE - y, 3);
  }
  if (tour == 1) {
    /* La vitesse est décalée : on la remet à l'endroit pour la montrer. Son
       sens ne s'écrit pas — la balle est à l'écran, on voit où elle va. */
    if (vy >= REPOS) {
      nombre(11, 3, vy - REPOS, 3);
    } else {
      nombre(11, 3, REPOS - vy, 3);
    }
  }
  if (tour == 2) {
    nombre(11, 4, g, 3);
  }
  if (tour == 3) {
    nombre(11, 5, rebonds, 3);
  }

  tour = tour + 1;
  if (tour > 3) {
    tour = 0;
  }
}

int main() {
  ecran(0);
  decor();
  ecran(1);

  while (true) {
    image();

    lireLesTouches();

    /* Un pas de physique toutes les DEUX images : trente par seconde, le
       rythme pour lequel la pesanteur est réglée (voir mesures()). */
    pas = pas + 1;
    if (pas == 2) {
      pas = 0;
      if (!couchee) {
        avancer();
        toucherLeSol();
        toucherLePlafond();
      }
    }

    mesures();
    sprite(0, x, y, BALLE);
  }

  return 0;
}

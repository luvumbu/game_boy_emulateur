/*
 * SPACE INVADERS — le jeu complet, pour Game Boy Color.
 *
 *   node outils/gb3.mjs projets/space_invaders/principal.cpp projets/space_invaders/space_invaders.gbc
 *
 * Ce qu'il y a dedans :
 *   - l'écran titre, avec le tableau des points et le record ;
 *   - une troupe de 5 rangs × 7 envahisseurs qui marche, descend au bord,
 *     et accélère à mesure qu'elle se vide — la « marche » à quatre notes
 *     aussi, qui accélère avec elle ;
 *   - trois sortes d'envahisseurs (30, 20 et 10 points), deux dessins chacun ;
 *   - le canon (croix gauche/droite, A pour tirer : un seul tir à la fois) ;
 *   - quatre abris qui s'effritent en trois coups, d'un côté comme de l'autre ;
 *   - les bombes des envahisseurs (trois au plus), qui visent souvent le canon,
 *     et qu'un tir peut détruire en vol ;
 *   - la soucoupe mystère (50, 100, 150 ou 300 points) ;
 *   - 3 vies, une vie en plus à 1 500 points, des vagues de plus en plus
 *     basses et rapides ;
 *   - PAUSE avec START, GAME OVER quand les vies manquent OU quand la troupe
 *     atteint la ligne du canon ;
 *   - le record, gardé dans la cartouche même console éteinte.
 *
 * Les couleurs sont celles de la borne de 1978 : l'écran était noir et blanc,
 * et des bandes de film collées sur la vitre coloraient le haut en rouge et le
 * bas en vert. Ici, ce sont les palettes de la Game Boy Color, posées une fois
 * pour toutes sur des bandes de l'écran (« teindre »). Le programme pose des
 * couleurs : c'est donc une cartouche Game Boy Color (« .gbc »).
 *
 * Toutes les valeurs tiennent sur un octet (0 à 255) : le score, qui va bien
 * plus loin, est compté en DIZAINES dans deux octets — voir ajouterPoints().
 */

#include <Tuile>          // un dessin de 8 × 8 pixels
#include <poser>          // pose une tuile sur une case du fond
#include <bande>          // pose la même tuile plusieurs fois d'affilée
#include <lire>           // rend la tuile posée sur une case
#include <changerDessin>  // un autre dessin pour une tuile, partout d'un coup
#include <texte>          // écrit un texte
#include <texteGrand>     // écrit un texte agrandi
#include <nombre>         // écrit un nombre
#include <effacer>        // efface un texte
#include <ecran>          // éteint / rallume l'écran pendant un gros dessin
#include <sprite>         // un lutin au pixel près
#include <cacher>         // ôte un lutin
#include <bouton>         // lit la manette
#include <hasard>         // un nombre au hasard
#include <semer>          // le point de départ du hasard
#include <note>           // une note sur la voix 1 ou 2
#include <bruit>          // un bruit sur la voix 4
#include <sauver>         // écrit dans la mémoire de la cartouche
#include <sauvegarde>     // y relit
#include <couleurFond>    // une couleur du décor
#include <couleurLutin>   // une couleur des lutins
#include <teindre>        // une case du décor prend une palette
#include <teindreLutin>   // un lutin prend une palette

/* =================================================================== dessins
 *
 * « . » est la teinte 0 (le noir de l'espace, transparent pour un lutin),
 * « # » la teinte 3 (la couleur pleine), « + » la teinte 2 (un peu plus sombre).
 */

/* Les envahisseurs : deux dessins chacun, échangés à chaque pas de la troupe. */
Tuile SEICHE = {
  "...##...",
  "..####..",
  ".######.",
  "##.##.##",
  "########",
  "..#..#..",
  ".#.##.#.",
  "........",
};
Tuile SEICHE_B = {
  "...##...",
  "..####..",
  ".######.",
  "##.##.##",
  "########",
  ".#.##.#.",
  "#.#..#.#",
  "........",
};
Tuile CRABE = {
  ".#....#.",
  "..#..#..",
  ".######.",
  "##.##.##",
  "########",
  "#.####.#",
  "#.#..#.#",
  "........",
};
Tuile CRABE_B = {
  ".#....#.",
  "#.#..#.#",
  "#.####.#",
  "##.##.##",
  "########",
  ".######.",
  ".#....#.",
  "........",
};
Tuile POULPE = {
  "..####..",
  ".######.",
  "########",
  "##.##.##",
  "########",
  "..#..#..",
  ".#.##.#.",
  "........",
};
Tuile POULPE_B = {
  "..####..",
  ".######.",
  "########",
  "##.##.##",
  "########",
  ".##..##.",
  "#......#",
  "........",
};

/* L'éclat d'un envahisseur touché, laissé une fraction de seconde. */
Tuile EXPLOSION = {
  "#..#..#.",
  ".#...#..",
  "..#.#...",
  "##....##",
  "..#.#...",
  ".#...#..",
  "#..#..#.",
  "........",
};

/* Le canon : 16 pixels de large, donc deux lutins côte à côte. */
Tuile CANON_G = {
  ".......#",
  "......##",
  "......##",
  "..######",
  ".#######",
  ".#######",
  ".#######",
  ".#######",
};
Tuile CANON_D = {
  "#.......",
  "##......",
  "##......",
  "######..",
  "#######.",
  "#######.",
  "#######.",
  "#######.",
};

/* Le canon qui explose : deux images, échangées pendant la chute. */
Tuile BOUM_G = {
  "....#...",
  ".#.....#",
  "...#.#..",
  ".....###",
  ".#.#####",
  "..######",
  "########",
  ".#######",
};
Tuile BOUM_D = {
  "...#....",
  "#.....#.",
  "..#.#...",
  "###.....",
  "#####.#.",
  "######..",
  "########",
  "#######.",
};
Tuile BOUM2_G = {
  ".#......",
  "....#..#",
  "..#...##",
  "....###.",
  "..######",
  ".#######",
  "########",
  ".#######",
};
Tuile BOUM2_D = {
  "#......#",
  "..#..#..",
  "#....#..",
  ".##.#...",
  "#######.",
  "########",
  "########",
  "#######.",
};

/* Le tir du canon : un trait fin, dans la colonne 3 du dessin. */
Tuile TIR = {
  "...#....",
  "...#....",
  "...#....",
  "...#....",
  "...#....",
  "........",
  "........",
  "........",
};

/* La bombe en zigzag : deux dessins, pour qu'elle se torde en tombant. */
Tuile BOMBE = {
  "...#....",
  "....#...",
  "...#....",
  "..#.....",
  "...#....",
  "....#...",
  "...#....",
  "........",
};
Tuile BOMBE_B = {
  "...#....",
  "..#.....",
  "...#....",
  "....#...",
  "...#....",
  "..#.....",
  "...#....",
  "........",
};

/* La soucoupe mystère : 16 pixels, deux lutins. */
Tuile SOUCOUPE_G = {
  ".....###",
  "...#####",
  "..######",
  ".##.##.#",
  "########",
  "..###..#",
  "...#....",
  "........",
};
Tuile SOUCOUPE_D = {
  "###.....",
  "#####...",
  "######..",
  "#.##.##.",
  "########",
  "#..###..",
  "....#...",
  "........",
};

/* Les abris : un abri fait 3 cases × 2, et chaque case s'effrite en trois coups
   (pleine → abîmée → en ruine → plus rien). */
Tuile ABRI_HG = {
  "....####",
  "..######",
  ".#######",
  "########",
  "########",
  "########",
  "########",
  "########",
};
Tuile ABRI_HD = {
  "####....",
  "######..",
  "#######.",
  "########",
  "########",
  "########",
  "########",
  "########",
};
Tuile ABRI_PLEIN = {
  "########",
  "########",
  "########",
  "########",
  "########",
  "########",
  "########",
  "########",
};
Tuile ABRI_ARCHE = {
  "########",
  "########",
  "###..###",
  "##....##",
  "#......#",
  "........",
  "........",
  "........",
};
Tuile ABRI_ABIME = {
  "##.###.#",
  "#.###.##",
  "###.###.",
  ".###.###",
  "##.###.#",
  "#.###.##",
  "###.###.",
  ".###.#.#",
};
Tuile ABRI_RUINE = {
  "#..#...#",
  "..#..#..",
  ".#....#.",
  "...#...#",
  "#...#...",
  "..#...#.",
  ".#...#..",
  "...#...#",
};

/* Le sol, sous le canon : un trait en haut de la case. */
Tuile SOL = {
  "########",
  "........",
  "........",
  "........",
  "........",
  "........",
  "........",
  "........",
};

/* ================================================================ réglages */

const uint8_t VIDE = 0;          // la case vide (l'espace de la police)

const uint8_t RANGS = 5;         // la troupe : 5 rangs…
const uint8_t COLONNES = 7;      // … de 7 envahisseurs, une case sur deux
const uint8_t BIAIS = 16;        // voir « colonneDe » plus bas

const uint8_t Y_CANON = 120;     // le canon, en pixels (la ligne 15)
const uint8_t LIGNE_CANON = 15;  // la troupe qui l'atteint a gagné
const uint8_t LIGNE_SOL = 16;
const uint8_t LIGNE_ABRIS = 12;  // les abris : lignes 12 et 13

/* Les lutins : qui porte quel numéro. */
const uint8_t L_CANON = 0;       // 0 et 1
const uint8_t L_TIR = 2;
const uint8_t L_BOMBE = 3;       // 3, 4 et 5
const uint8_t L_SOUCOUPE = 6;    // 6 et 7
const uint8_t BOMBES = 3;

/* Les palettes : décor 0 blanc, 1 rouge, 2 vert ; lutins 0 vert, 1 blanc, 2 rouge. */
const uint8_t P_BLANC = 0;
const uint8_t P_ROUGE = 1;
const uint8_t P_VERT = 2;
const uint8_t PL_VERT = 0;
const uint8_t PL_BLANC = 1;
const uint8_t PL_ROUGE = 2;

/* La scène : où en est le jeu. */
enum Scene { TITRE, JEU, MORT, VAGUE_FINIE, FIN };

/* ================================================================== l'état */

uint8_t scene = TITRE;
uint8_t enPause = 0;
uint8_t startAvant = 0;

/* Le score, en DIZAINES : « scoreH » centaines de dizaines, « scoreL » le reste
   (0 à 99). 1 230 points = 12 dizaines et 3 → scoreH 1, scoreL 23. */
uint8_t scoreH = 0;
uint8_t scoreL = 0;
uint8_t recordH = 0;
uint8_t recordL = 0;
uint8_t vies = 3;
uint8_t vieDonnee = 0;           // la vie en plus de 1 500 points, une fois
uint8_t vague = 0;

/* La troupe. « vivant[i] » : l'envahisseur i (rang × 7 + colonne) est-il là ? */
uint8_t vivant[35];
uint8_t ox = 0;                  // où est la troupe (voir colonneDe)
uint8_t oy = 0;                  // la ligne du premier rang
uint8_t versDroite = 1;
uint8_t pied = 0;                // quel dessin : 0 ou 1
uint8_t marche = 0;              // laquelle des quatre notes de la marche
uint8_t attentePas = 0;          // les images depuis le dernier pas
uint8_t vivants = 0;
uint8_t minC = 0;                // la colonne vivante la plus à gauche
uint8_t maxC = 0;                // … la plus à droite
uint8_t maxR = 0;                // le rang vivant le plus bas

/* L'éclat d'un envahisseur touché : sa case, et combien d'images il reste. */
uint8_t boomX = 0;
uint8_t boomY = 0;
uint8_t boomTemps = 0;

/* Le canon et son tir. */
uint8_t px = 72;
uint8_t tirActif = 0;
uint8_t tx = 0;
uint8_t ty = 0;

/* Les bombes. */
struct Bombe { uint8_t actif, x, y; };
Bombe bombes[3];
uint8_t attenteBombe = 60;

/* La soucoupe. */
uint8_t ufoActif = 0;
uint8_t ux = 0;
uint8_t uSens = 0;
uint8_t ufoAttente = 20;         // en secondes
uint8_t secondesImages = 0;      // les images de la seconde en cours
uint8_t textePoints = 0;         // les images qu'il reste au « 150 » affiché
uint8_t textePointsX = 0;

/* Les temps d'attente des scènes MORT et VAGUE_FINIE. */
uint8_t attente = 0;

/* =========================================================== les couleurs */

void preparerCouleurs() {
  /* Le décor : chaque palette garde le noir en teinte 0 — c'est l'espace. */
  couleurFond(P_BLANC, 0, 0, 0, 0);
  couleurFond(P_BLANC, 1, 10, 10, 12);
  couleurFond(P_BLANC, 2, 20, 20, 24);
  couleurFond(P_BLANC, 3, 31, 31, 31);

  couleurFond(P_ROUGE, 0, 0, 0, 0);
  couleurFond(P_ROUGE, 1, 12, 2, 2);
  couleurFond(P_ROUGE, 2, 22, 4, 4);
  couleurFond(P_ROUGE, 3, 31, 8, 8);

  couleurFond(P_VERT, 0, 0, 0, 0);
  couleurFond(P_VERT, 1, 2, 12, 2);
  couleurFond(P_VERT, 2, 4, 22, 4);
  couleurFond(P_VERT, 3, 8, 31, 8);

  /* Les lutins : la teinte 0 est transparente, on ne règle que 1 à 3. */
  couleurLutin(PL_VERT, 1, 2, 12, 2);
  couleurLutin(PL_VERT, 2, 4, 22, 4);
  couleurLutin(PL_VERT, 3, 8, 31, 8);

  couleurLutin(PL_BLANC, 1, 10, 10, 12);
  couleurLutin(PL_BLANC, 2, 20, 20, 24);
  couleurLutin(PL_BLANC, 3, 31, 31, 31);

  couleurLutin(PL_ROUGE, 1, 12, 2, 2);
  couleurLutin(PL_ROUGE, 2, 22, 4, 4);
  couleurLutin(PL_ROUGE, 3, 31, 8, 8);
}

/*
 * Les bandes de couleur, comme les films collés sur la vitre de la borne.
 *
 * Une palette appartient à une CASE de l'écran, pas à une tuile : un
 * envahisseur qui descend change donc de couleur en passant d'une bande à
 * l'autre — exactement comme en 1978.
 *
 *   ligne 0          le score, en blanc
 *   lignes 1 et 2    la soucoupe, en rouge
 *   lignes 3 à 11    la troupe, en blanc
 *   lignes 12 à 17   les abris, le canon, le sol et les vies, en vert
 */
void peindreLesBandes() {
  for (uint8_t l = 0; l < 18; l++) {
    uint8_t p = P_BLANC;
    if (l == 1 || l == 2) p = P_ROUGE;
    if (l >= LIGNE_ABRIS) p = P_VERT;
    for (uint8_t c = 0; c < 20; c++) {
      teindre(c, l, p);
    }
  }
}

/* ============================================================ les lutins */

void cacherLesLutins() {
  for (uint8_t n = 0; n < 8; n++) {
    cacher(n);
  }
}

/* sprite() remet la palette du lutin à 0 : teindreLutin() vient TOUJOURS après. */
void dessinerCanon() {
  sprite(L_CANON, px, Y_CANON, CANON_G);
  teindreLutin(L_CANON, PL_VERT);
  sprite(L_CANON + 1, px + 8, Y_CANON, CANON_D);
  teindreLutin(L_CANON + 1, PL_VERT);
}

/* ======================================================= score et record */

void afficherScore() {
  nombre(6, 0, scoreH, 2);
  nombre(8, 0, scoreL, 2);
  texte(10, 0, "0");               // le score est en dizaines : le zéro final
}

void afficherRecord() {
  texte(12, 0, "HI");
  nombre(15, 0, recordH, 2);
  nombre(17, 0, recordL, 2);
  texte(19, 0, "0");
}

/* Le record vit dans la mémoire de la cartouche. La case 2 porte une marque :
   une cartouche neuve n'a encore rien écrit, et ses octets ne veulent rien dire. */
void lireRecord() {
  if (sauvegarde(2) == 42) {
    recordH = sauvegarde(0);
    recordL = sauvegarde(1);
  }
}

void garderRecord() {
  if (scoreH > recordH || (scoreH == recordH && scoreL > recordL)) {
    recordH = scoreH;
    recordL = scoreL;
    sauver(0, recordH);
    sauver(1, recordL);
    sauver(2, 42);
  }
}

void afficherVies() {
  nombre(0, LIGNE_SOL + 1, vies, 1);
  /* Les canons de réserve : ceux qui ne sont pas en jeu, deux au plus. */
  bande(2, LIGNE_SOL + 1, VIDE, 6);
  if (vies >= 2) { poser(2, LIGNE_SOL + 1, CANON_G); poser(3, LIGNE_SOL + 1, CANON_D); }
  if (vies >= 3) { poser(5, LIGNE_SOL + 1, CANON_G); poser(6, LIGNE_SOL + 1, CANON_D); }
}

void afficherVague() {
  texte(12, LIGNE_SOL + 1, "VAGUE");
  nombre(18, LIGNE_SOL + 1, vague, 2);
}

/* Des points, en dizaines : 1 = 10 points, 30 = 300 points. */
void ajouterPoints(uint8_t dizaines) {
  scoreL = scoreL + dizaines;
  while (scoreL >= 100) {
    scoreL = scoreL - 100;
    if (scoreH < 99) scoreH++;
  }
  afficherScore();

  /* Une vie en plus à 1 500 points : 1 centaine de dizaines et 50. */
  if (!vieDonnee && (scoreH > 1 || (scoreH == 1 && scoreL >= 50))) {
    vieDonnee = 1;
    vies++;
    afficherVies();
    note(1, DO6, 20, 12);
  }
}

/* ============================================================== la troupe */

/*
 * La colonne d'écran d'un envahisseur : ox + 2 × c - BIAIS.
 *
 * Pourquoi un BIAIS ? Quand la colonne de gauche est détruite, la troupe doit
 * pouvoir aller plus loin vers la gauche, et « ox » descendrait sous zéro — ce
 * qu'un octet ne sait pas faire. On compte donc ox avec seize de plus : s'il
 * ne reste que la colonne 6, elle doit pouvoir atteindre la colonne 0 de
 * l'écran, et 2 × 6 = 12 ne dépasse pas 16.
 */
uint8_t colonneDe(uint8_t c) {
  return ox + c + c - BIAIS;
}

/* L'envahisseur du rang r, colonne c, dans le tableau : r × 7 + c. */
uint8_t indice(uint8_t r, uint8_t c) {
  uint8_t i = c;
  for (uint8_t k = 0; k < r; k++) {
    i = i + COLONNES;
  }
  return i;
}

uint8_t tuileDuRang(uint8_t r) {
  if (r == 0) return SEICHE;
  if (r < 3) return CRABE;
  return POULPE;
}

uint8_t pointsDuRang(uint8_t r) {
  if (r == 0) return 3;
  if (r < 3) return 2;
  return 1;
}

uint8_t estEnvahisseur(uint8_t t) {
  return t == SEICHE || t == CRABE || t == POULPE;
}

/* Pose toute la troupe — ou l'efface, avec « effacer » à 1. */
void dessinerTroupe(uint8_t effacer) {
  uint8_t i = 0;
  for (uint8_t r = 0; r < RANGS; r++) {
    uint8_t t = tuileDuRang(r);
    if (effacer) t = VIDE;
    for (uint8_t c = 0; c < COLONNES; c++) {
      if (vivant[i]) poser(colonneDe(c), oy + r, t);
      i++;
    }
  }
}

/* Combien il en reste, et jusqu'où va la troupe : à refaire après chaque coup. */
void mesurerTroupe() {
  vivants = 0;
  minC = 255;
  maxC = 0;
  maxR = 0;
  uint8_t i = 0;
  for (uint8_t r = 0; r < RANGS; r++) {
    for (uint8_t c = 0; c < COLONNES; c++) {
      if (vivant[i]) {
        vivants++;
        if (c < minC) minC = c;
        if (c > maxC) maxC = c;
        if (r > maxR) maxR = r;
      }
      i++;
    }
  }
}

/*
 * Le temps entre deux pas, en images : moins il en reste, plus ils vont vite.
 *
 *   35 envahisseurs → 62 images (une seconde)
 *   10 envahisseurs → 25 images
 *    1 envahisseur  → 11 images : le dernier file, mais le canon peut le suivre
 *
 * Chaque vague retire 3 images de plus (12 au plus), sans descendre sous 2.
 */
uint8_t delaiDuPas() {
  uint8_t d = vivants + (vivants >> 1) + 10;
  uint8_t presse = 0;
  if (vague > 1) presse = (vague - 1) * 3;
  if (presse > 12) presse = 12;
  if (d > presse + 2) return d - presse;
  return 2;
}

/* La marche : quatre notes graves qui descendent, une par pas. */
void jouerLaMarche() {
  if (marche == 0) note(2, LA2, 6, 11);
  if (marche == 1) note(2, SOL2, 6, 11);
  if (marche == 2) note(2, FA2, 6, 11);
  if (marche == 3) note(2, MI2, 6, 11);
  marche = (marche + 1) & 3;
}

/* Un pas de la troupe : effacer, avancer (ou descendre au bord), redessiner. */
void pasDeLaTroupe() {
  dessinerTroupe(1);

  if (versDroite) {
    if (ox + maxC + maxC - BIAIS >= 19) {
      oy++;
      versDroite = 0;
    } else {
      ox++;
    }
  } else {
    if (ox + minC + minC <= BIAIS) {
      oy++;
      versDroite = 1;
    } else {
      ox--;
    }
  }

  /* L'autre dessin, pour TOUS les envahisseurs d'un coup. */
  pied = 1 - pied;
  if (pied) {
    changerDessin(SEICHE, SEICHE_B);
    changerDessin(CRABE, CRABE_B);
    changerDessin(POULPE, POULPE_B);
  } else {
    changerDessin(SEICHE, SEICHE);
    changerDessin(CRABE, CRABE);
    changerDessin(POULPE, POULPE);
  }

  dessinerTroupe(0);
  jouerLaMarche();
}

/* L'éclat d'avant s'en va — s'il est encore là (un envahisseur a pu passer dessus). */
void eteindreExplosion() {
  if (boomTemps == 0) return;
  if (lire(boomX, boomY) == EXPLOSION) poser(boomX, boomY, VIDE);
  boomTemps = 0;
}

void finDeVague() {
  scene = VAGUE_FINIE;
  attente = 120;
  cacherLesLutins();
  tirActif = 0;
  ufoActif = 0;
  for (uint8_t b = 0; b < BOMBES; b++) bombes[b].actif = 0;
  texte(5, 8, "BIEN JOUE!");
  note(1, DO5, 30, 12);
}

/* Le tir a touché l'envahisseur de la case (cx, cy). */
void tuerEnvahisseur(uint8_t cx, uint8_t cy) {
  uint8_t r = cy - oy;
  uint8_t c = (cx + BIAIS - ox) >> 1;
  vivant[indice(r, c)] = 0;

  eteindreExplosion();
  poser(cx, cy, EXPLOSION);
  boomX = cx;
  boomY = cy;
  boomTemps = 12;

  bruit(10, 12);
  ajouterPoints(pointsDuRang(r));
  mesurerTroupe();
  if (vivants == 0) finDeVague();
}

/* ================================================================ les abris */

uint8_t estAbri(uint8_t t) {
  return t == ABRI_HG || t == ABRI_HD || t == ABRI_PLEIN || t == ABRI_ARCHE
      || t == ABRI_ABIME || t == ABRI_RUINE;
}

/* Une case d'abri prend un coup : pleine → abîmée → en ruine → plus rien. */
void abimer(uint8_t cx, uint8_t cy, uint8_t t) {
  if (t == ABRI_RUINE) poser(cx, cy, VIDE);
  else if (t == ABRI_ABIME) poser(cx, cy, ABRI_RUINE);
  else poser(cx, cy, ABRI_ABIME);
  bruit(3, 6);
}

void dessinerAbris() {
  for (uint8_t a = 0; a < 4; a++) {
    uint8_t c = 1 + a * 5;         // colonnes 1, 6, 11, 16
    poser(c, LIGNE_ABRIS, ABRI_HG);
    poser(c + 1, LIGNE_ABRIS, ABRI_PLEIN);
    poser(c + 2, LIGNE_ABRIS, ABRI_HD);
    poser(c, LIGNE_ABRIS + 1, ABRI_PLEIN);
    poser(c + 1, LIGNE_ABRIS + 1, ABRI_ARCHE);
    poser(c + 2, LIGNE_ABRIS + 1, ABRI_PLEIN);
  }
}

/* ============================================================ le canon */

void bougerCanon() {
  if (bouton(GAUCHE) && px > 4) px--;
  if (bouton(DROITE) && px < 140) px++;
  dessinerCanon();
}

/* A : un tir, s'il n'y en a pas déjà un en vol. */
void tirer() {
  if (!bouton(A) || tirActif) return;
  tirActif = 1;
  tx = px + 4;                     // le trait est dans la colonne 3 : px + 7
  ty = Y_CANON - 6;
  note(1, SOL5, 4, 9);
}

void finirTir() {
  tirActif = 0;
  cacher(L_TIR);
}

/* =========================================================== la soucoupe */

void finirSoucoupe() {
  ufoActif = 0;
  cacher(L_SOUCOUPE);
  cacher(L_SOUCOUPE + 1);
  ufoAttente = 15 + (hasard() & 15);
}

/* 50, 100, 150 ou 300 points, au hasard — écrits là où elle était. */
void toucherSoucoupe() {
  uint8_t tirage = hasard() & 3;
  uint8_t dizaines = 5;
  if (tirage == 1) dizaines = 10;
  if (tirage == 2) dizaines = 15;
  if (tirage == 3) dizaines = 30;
  ajouterPoints(dizaines);

  textePointsX = (ux >> 3);
  if (textePointsX > 16) textePointsX = 16;
  if (dizaines < 10) {
    nombre(textePointsX, 1, dizaines, 1);
    texte(textePointsX + 1, 1, "0");
  } else {
    nombre(textePointsX, 1, dizaines, 2);
    texte(textePointsX + 2, 1, "0");
  }
  textePoints = 60;

  finirSoucoupe();
  bruit(24, 15);
}

void avancerSoucoupe() {
  if (!ufoActif) {
    /* Elle revient toutes les 15 à 30 secondes, tant qu'il reste du monde. */
    secondesImages++;
    if (secondesImages < 60) return;
    secondesImages = 0;
    if (ufoAttente > 0) {
      ufoAttente--;
      return;
    }
    if (vivants < 8) return;
    ufoActif = 1;
    uSens = hasard() & 1;
    if (uSens) ux = 0; else ux = 144;
    return;
  }

  if (uSens) {
    ux++;
    if (ux >= 144) { finirSoucoupe(); return; }
  } else {
    if (ux == 0) { finirSoucoupe(); return; }
    ux--;
  }
  sprite(L_SOUCOUPE, ux, 8, SOUCOUPE_G);
  teindreLutin(L_SOUCOUPE, PL_ROUGE);
  sprite(L_SOUCOUPE + 1, ux + 8, 8, SOUCOUPE_D);
  teindreLutin(L_SOUCOUPE + 1, PL_ROUGE);

  /* Son chant : deux notes qui alternent. */
  if ((ux & 7) == 0) note(1, LA5, 4, 6);
  if ((ux & 7) == 4) note(1, MI5, 4, 6);
}

/* ============================================================== les bombes */

void finirBombe(uint8_t b) {
  bombes[b].actif = 0;
  cacher(L_BOMBE + b);
}

void toucherCanon() {
  scene = MORT;
  attente = 100;
  vies--;
  finirTir();
  for (uint8_t b = 0; b < BOMBES; b++) finirBombe(b);
  bruit(50, 15, 1);
}

/* Une bombe part du plus bas envahisseur d'une colonne — souvent celle du canon. */
void lancerBombe() {
  uint8_t b = BOMBES;
  for (uint8_t i = 0; i < BOMBES; i++) {
    if (!bombes[i].actif) b = i;
  }
  if (b == BOMBES) return;          // les trois sont déjà en vol

  uint8_t c = 0;
  if (hasard() & 1) {
    /* Viser : la colonne de la troupe qui est au-dessus du canon. */
    uint8_t sous = ((px + 7) >> 3) + BIAIS;
    if (sous > ox) c = (sous - ox) >> 1;
    if (c >= COLONNES) c = COLONNES - 1;
  } else {
    c = hasard() & 7;
    if (c >= COLONNES) c = 3;
  }

  /* Le plus bas vivant de cette colonne. */
  uint8_t r = RANGS;
  for (uint8_t k = 0; k < RANGS; k++) {
    uint8_t essai = RANGS - 1 - k;
    if (r == RANGS && vivant[indice(essai, c)]) r = essai;
  }
  if (r == RANGS) return;          // colonne vide : ce sera pour la prochaine fois

  bombes[b].actif = 1;
  bombes[b].x = colonneDe(c) << 3;
  bombes[b].y = (oy + r + 1) << 3;
}

void avancerBombes() {
  for (uint8_t b = 0; b < BOMBES; b++) {
    if (!bombes[b].actif) continue;
    bombes[b].y = bombes[b].y + 2;
    uint8_t bx = bombes[b].x;
    uint8_t pied = bombes[b].y + 7;   // la pointe de la bombe

    /* Le sol. */
    if (pied >= LIGNE_SOL * 8) { finirBombe(b); continue; }

    /* Le canon : sa largeur va de px + 1 à px + 14. */
    if (pied >= Y_CANON + 1 && bx + 3 >= px + 1 && bx + 3 <= px + 14) {
      finirBombe(b);
      toucherCanon();
      return;
    }

    /* Un abri. */
    uint8_t cx = (bx + 3) >> 3;
    uint8_t cy = pied >> 3;
    uint8_t t = lire(cx, cy);
    if (estAbri(t)) {
      abimer(cx, cy, t);
      finirBombe(b);
      continue;
    }

    sprite(L_BOMBE + b, bx, bombes[b].y, BOMBE);
    teindreLutin(L_BOMBE + b, PL_BLANC);
  }
}

/* ================================================================= le tir */

void avancerTir() {
  if (!tirActif) return;
  if (ty < 12) { finirTir(); return; }   // sorti par le haut
  ty = ty - 4;

  /* La soucoupe, en haut (pixels 8 à 15). */
  if (ufoActif && ty < 16 && tx + 3 >= ux && tx + 3 < ux + 16) {
    toucherSoucoupe();
    finirTir();
    return;
  }

  /* Une bombe croisée en vol : les deux disparaissent. */
  for (uint8_t b = 0; b < BOMBES; b++) {
    if (bombes[b].actif && tx + 2 >= bombes[b].x && bombes[b].x + 2 >= tx
        && ty <= bombes[b].y + 7 && bombes[b].y <= ty + 4) {
      finirBombe(b);
      finirTir();
      return;
    }
  }

  /* Ce qu'il y a sur la case de la pointe : un envahisseur, ou un abri. */
  uint8_t cx = (tx + 3) >> 3;
  uint8_t cy = ty >> 3;
  uint8_t t = lire(cx, cy);
  if (estEnvahisseur(t)) {
    tuerEnvahisseur(cx, cy);
    finirTir();
    return;
  }
  if (estAbri(t)) {
    abimer(cx, cy, t);
    finirTir();
    return;
  }

  sprite(L_TIR, tx, ty, TIR);
  teindreLutin(L_TIR, PL_BLANC);
}

/* ============================================================= les scènes */

void effacerLEcran() {
  for (uint8_t l = 0; l < 18; l++) {
    bande(0, l, VIDE, 20);
  }
}

void nouvelleVague() {
  vague++;
  scene = JEU;

  ecran(0);
  for (uint8_t l = 1; l < LIGNE_SOL; l++) bande(0, l, VIDE, 20);
  dessinerAbris();

  for (uint8_t i = 0; i < 35; i++) vivant[i] = 1;
  ox = BIAIS + 1;                  // la colonne 0 de la troupe sur la colonne 1
  oy = 3;
  if (vague > 1) oy = oy + vague - 1;   // chaque vague part un peu plus bas…
  if (oy > 6) oy = 6;                    // … jusqu'à la ligne 6
  versDroite = 1;
  pied = 0;
  changerDessin(SEICHE, SEICHE);
  changerDessin(CRABE, CRABE);
  changerDessin(POULPE, POULPE);
  attentePas = 0;
  boomTemps = 0;
  mesurerTroupe();
  dessinerTroupe(0);

  px = 72;
  tirActif = 0;
  for (uint8_t b = 0; b < BOMBES; b++) bombes[b].actif = 0;
  attenteBombe = 90;
  ufoActif = 0;
  ufoAttente = 15 + (hasard() & 15);
  textePoints = 0;

  afficherVague();
  ecran(1);
  dessinerCanon();
}

void nouvellePartie() {
  scoreH = 0;
  scoreL = 0;
  vies = 3;
  vieDonnee = 0;
  vague = 0;
  enPause = 0;

  ecran(0);
  effacerLEcran();
  texte(0, 0, "SCORE");
  afficherScore();
  afficherRecord();
  bande(0, LIGNE_SOL, SOL, 20);
  afficherVies();
  ecran(1);

  nouvelleVague();
}

void finDePartie() {
  scene = FIN;
  cacherLesLutins();
  /* La troupe s'efface, pour que « GAME OVER » se lise. */
  dessinerTroupe(1);
  eteindreExplosion();
  garderRecord();
  afficherRecord();
  texte(5, 8, "GAME OVER");
  texte(3, 10, "START : TITRE");
  note(1, DO4, 40, 13);
  note(2, DO3, 40, 13);
}

void ecranTitre() {
  scene = TITRE;
  cacherLesLutins();

  ecran(0);
  effacerLEcran();
  afficherRecord();
  texteGrand(5, 1, "SPACE", 1);      // lignes 1 et 2 : la bande rouge
  texteGrand(2, 4, "INVADERS", 1);   // lignes 4 et 5 : la bande blanche

  poser(4, 8, SEICHE);
  texte(6, 8, ": 30 POINTS");
  poser(4, 9, CRABE);
  texte(6, 9, ": 20 POINTS");
  poser(4, 10, POULPE);
  texte(6, 10, ": 10 POINTS");
  poser(3, 11, SOUCOUPE_G);
  poser(4, 11, SOUCOUPE_D);
  texte(6, 11, ": ? MYSTERE");

  texte(1, 13, "A:TIR  START:PAUSE");
  ecran(1);
}

/* =========================================================== un tour de jeu */

void tourDeJeu() {
  /* La bombe se tord en tombant : son dessin change toutes les 4 images. */
  if ((images() & 7) == 0) changerDessin(BOMBE, BOMBE_B);
  if ((images() & 7) == 4) changerDessin(BOMBE, BOMBE);

  /* L'éclat d'un envahisseur, puis les points de la soucoupe, s'effacent. */
  if (boomTemps > 0) {
    boomTemps--;
    if (boomTemps == 0) {
      boomTemps = 1;
      eteindreExplosion();
    }
  }
  if (textePoints > 0) {
    textePoints--;
    if (textePoints == 0) effacer(textePointsX, 1, 3);
  }

  if (scene == VAGUE_FINIE) {
    attente--;
    if (attente == 0) nouvelleVague();
    return;
  }

  if (scene == MORT) {
    /* Le canon explose : deux dessins qui alternent. */
    if ((attente & 4) != 0) {
      sprite(L_CANON, px, Y_CANON, BOUM_G);
      sprite(L_CANON + 1, px + 8, Y_CANON, BOUM_D);
    } else {
      sprite(L_CANON, px, Y_CANON, BOUM2_G);
      sprite(L_CANON + 1, px + 8, Y_CANON, BOUM2_D);
    }
    teindreLutin(L_CANON, PL_VERT);
    teindreLutin(L_CANON + 1, PL_VERT);
    attente--;
    if (attente == 0) {
      afficherVies();
      if (vies == 0) {
        finDePartie();
      } else {
        scene = JEU;
        px = 72;
        attenteBombe = 60;
        dessinerCanon();
      }
    }
    return;
  }

  /* scene == JEU */
  bougerCanon();
  tirer();
  avancerTir();
  if (scene != JEU) return;        // la dernière vient de tomber

  avancerBombes();
  if (scene != JEU) return;        // le canon vient d'être touché

  attenteBombe--;
  if (attenteBombe == 0) {
    lancerBombe();
    uint8_t base = 40;
    if (vague > 1) base = 40 - ((vague - 1) << 2);
    if (base < 16) base = 16;
    attenteBombe = base + (hasard() & 31);
  }

  avancerSoucoupe();

  attentePas++;
  if (attentePas >= delaiDuPas()) {
    attentePas = 0;
    pasDeLaTroupe();
    /* La troupe a atteint la ligne du canon : c'est perdu, vies ou pas. */
    if (oy + maxR >= LIGNE_CANON) {
      vies = 0;
      afficherVies();
      bruit(50, 15, 1);
      finDePartie();
    }
  }
}

/* ================================================================ le jeu */

int main() {
  preparerCouleurs();
  peindreLesBandes();
  lireRecord();
  ecranTitre();

  while (true) {
    image();

    /* START : un appui compte une fois, même tenu longtemps. */
    uint8_t start = bouton(START);
    uint8_t appui = start && !startAvant;
    startAvant = start;

    if (scene == TITRE) {
      /* « APPUIE SUR START » clignote : allumé une demi-seconde sur deux. */
      if ((images() & 63) == 0) texte(3, 15, "APPUIE SUR START");
      if ((images() & 63) == 32) effacer(3, 15, 16);
      if (appui) {
        semer(images());
        nouvellePartie();
      }
      continue;
    }

    if (scene == FIN) {
      if (appui) ecranTitre();
      continue;
    }

    /* La pause : tout s'arrête, le jeu reprend au même endroit. */
    if (appui && scene == JEU) {
      enPause = 1 - enPause;
      if (enPause) texte(7, 9, "PAUSE");
      else effacer(7, 9, 5);
    }
    if (enPause) continue;

    tourDeJeu();
  }

  return 0;
}

// LES BULLES GLOUTONNES — un jeu dans le style d'agar.io : tu es une bulle,
// dans un GRAND monde de 3000 × 3000 pixels. L'écran n'en montre qu'un petit
// morceau (160 × 136) : la caméra te suit partout.
//
// Mange les miettes pour grossir, mange les bulles plus petites que toi, et
// fuis les plus grosses !
//
//   LA CROIX   te diriger, dans les quatre directions ;
//   SELECT     la CARTE de tout le monde (le jeu attend) ; SELECT pour revenir ;
//   START      commencer, et recommencer.
//
// Sept bulles sont jouées par la console (des IA), chacune de SA couleur, et
// avec son caractère :
//   PEUREUSE   voit le danger de loin, et s'enfuit tôt ;
//   GOURMANDE  ne pense qu'aux miettes ;
//   CHASSEUSE  repère les petites bulles de loin, et leur court après.
// Quand elles n'ont rien en vue, elles rôdent — souvent vers toi.
//
// SE MANGER : une bulle en mange une autre si sa masse dépasse celle de
// l'autre d'AU MOINS UN QUART, et si le milieu de l'autre est dedans. Elle
// prend toute sa masse. Ça vaut pour tout le monde : toi, les IA entre elles,
// et les IA contre toi.
//
// GRANDIR PEU À PEU : une miette donne 1 de masse, et la bulle a DIX tailles
// (4, 6, 8, 10, 12, 14, 16, 18, 21 et 24 pixels) : elle grandit un peu toutes
// les quelques miettes. Et PLUS TU ES GROS, MOINS TU VAS VITE : 60 pixels par
// seconde au début, 24 à 99 de masse. Les IA, elles, commencent petites et
// grossissent au fil de la partie : le début est calme, la fin est dure.
//
// Atteins 99 de masse : tu es la plus grosse bulle, tu as gagné. Si une bulle
// te mange, c'est fini. Une IA mangée revient trois secondes plus tard, toute
// petite, loin de toi. Le record est gardé dans la cartouche. En bas, le
// panneau dit ta masse, le record, et ta zone dans le monde (de 00 à 11).
//
// ---------------------------------------------------------------------------
// COMMENT TENIR 3000 DANS UN OCTET ?
//
// Un uint8_t va de 0 à 255. Pour aller jusqu'à 2999, chaque place est faite de
// DEUX nombres : la ZONE (de 0 à 11) et le PIXEL dans la zone (de 0 à 255).
//     place = zone × 256 + pixel        2999 = 11 × 256 + 183
// C'est comme les dizaines et les unités, mais avec des « paquets » de 256.
// Avancer au-delà de 255 : pixel repart de 0, et la zone prend 1 (une retenue).
//
// Et l'écran ? La carte du fond de la Game Boy fait 256 × 256 pixels, et
// revient toute seule au début. Elle est couverte d'un quadrillage partout
// pareil : il suffit de la faire glisser du PIXEL de la caméra (defiler()),
// et le quadrillage a l'air de ne jamais finir. Les miettes, elles, ne sont
// posées sur la carte que près de toi (dans un carré de 256 autour de
// l'écran) : plus loin, elles reviendraient par l'autre bord.
//
// LES COULEURS (Game Boy Color) : huit palettes pour les lutins — la 0 pour
// toi, de 1 à 7 pour les IA : chacune la sienne. Et sept pour le fond : la 0
// pour le sol, de 1 à 6 pour les miettes.
// ---------------------------------------------------------------------------

#include <Tuile>          // un dessin de 8 × 8
#include <spriteTaille>   // une bulle : un dessin, agrandi 1, 2 ou 3 fois
#include <sprite>         // le repère, et les points de la carte
#include <cacher>         // ôter des lutins
#include <poser>          // le quadrillage, les miettes
#include <texte>          // écrire
#include <texteTitre>     // le titre en grosses lettres
#include <nombre>         // la masse, le record (écran de fin)
#include <effacer>        // changer d'écran
#include <bouton>         // la croix, START, SELECT
#include <hasard>         // la place des miettes et des IA
#include <chaque>         // une seconde : le retour des IA, leur croissance
#include <defiler>        // la caméra : faire glisser le fond
#include <panneau>        // la ligne du bas, qui ne défile pas
#include <cacherPanneau>
#include <effacerPanneau>
#include <textePanneau>
#include <nombrePanneau>
#include <couleurFond>    // les couleurs du sol et des miettes
#include <couleurLutin>   // les couleurs des bulles
#include <teindre>        // une miette prend sa palette
#include <teindreLutin>   // une bulle prend sa palette
#include <note>           // un petit son quand on mange
#include <meilleurScore>  // le record, gardé dans la cartouche

// ------------------------------------------------------------- les dessins

// Cinq ronds de 8 × 8, du plus petit au plus grand. Ils sont dessinés UNE
// fois ; spriteTaille() les agrandit (× 2, × 3) pour les grandes tailles.
//   #  le bord (la couleur foncée)    +  l'intérieur    -  un reflet (la claire)

Tuile ROND4 = {                   // 4 pixels de large
  "........",
  "........",
  "...##...",
  "..#-+#..",
  "..#++#..",
  "...##...",
  "........",
  "........",
};

Tuile ROND5 = {                   // 5 pixels
  "........",
  "..###...",
  ".#-++#..",
  ".#+++#..",
  ".#+++#..",
  "..###...",
  "........",
  "........",
};

Tuile ROND6 = {                   // 6 pixels
  "........",
  "..####..",
  ".#-+++#.",
  ".#++++#.",
  ".#++++#.",
  ".#++++#.",
  "..####..",
  "........",
};

Tuile ROND7 = {                   // 7 pixels
  "..###...",
  ".#-++#..",
  "#-++++#.",
  "#+++++#.",
  "#+++++#.",
  ".#+++#..",
  "..###...",
  "........",
};

Tuile ROND8 = {                   // 8 pixels
  "..####..",
  ".#-+++#.",
  "#-+++++#",
  "#++++++#",
  "#++++++#",
  "#++++++#",
  ".#++++#.",
  "..####..",
};

// Ta bulle, dès 6 pixels : la même, avec deux yeux.
Tuile MOI6 = {
  "........",
  "..####..",
  ".#-+++#.",
  ".#+#+##.",
  ".#++++#.",
  ".#++++#.",
  "..####..",
  "........",
};

Tuile MOI7 = {
  "..###...",
  ".#-++#..",
  "#-#+#+#.",
  "#+#+#+#.",
  "#+++++#.",
  ".#+++#..",
  "..###...",
  "........",
};

Tuile MOI8 = {
  "..####..",
  ".#-+++#.",
  "#-#++#+#",
  "#+#++#+#",
  "#++++++#",
  "#+#++#+#",
  ".#+##+#.",
  "..####..",
};

Tuile MIETTE = {                  // Une miette : un petit rond, sur le sol.
  "-.......",
  "........",
  "...##...",
  "..#++#..",
  "..#++#..",
  "...##...",
  "........",
  "........",
};

Tuile GRILLE = {                  // Le sol : un point clair à chaque coin.
  "-.......",
  "........",
  "........",
  "........",
  "........",
  "........",
  "........",
  "........",
};

Tuile BORD = {                    // Le cadre de la carte.
  "########",
  "########",
  "########",
  "########",
  "########",
  "########",
  "########",
  "########",
};

Tuile REPERE = {                  // Au bord de l'écran : « une bulle par là ».
  "........",
  "...##...",
  "..#++#..",
  ".#++++#.",
  ".#++++#.",
  "..#++#..",
  "...##...",
  "........",
};

Tuile POINT1 = {                  // Sur la carte : une petite bulle…
  "........",
  "........",
  "........",
  "...##...",
  "...##...",
  "........",
  "........",
  "........",
};

Tuile POINT2 = {                  // …une moyenne…
  "........",
  "........",
  "..####..",
  "..#++#..",
  "..#++#..",
  "..####..",
  "........",
  "........",
};

Tuile POINT3 = {                  // …une grosse.
  "........",
  ".######.",
  ".#++++#.",
  ".#++++#.",
  ".#++++#.",
  ".#++++#.",
  ".######.",
  "........",
};

// ------------------------------------------------------------- l'état du jeu

// Les huit bulles : la 0, c'est toi ; de 1 à 7, les IA.
// Chaque place : une zone et un pixel, en largeur (x) et en hauteur (y).
uint8_t zx[8];              // le coin en haut à gauche du rond
uint8_t px[8];
uint8_t zy[8];
uint8_t py[8];
uint8_t mzx[8];             // son MILIEU (recalculé quand elle bouge)
uint8_t mpx[8];
uint8_t mzy[8];
uint8_t mpy[8];
uint8_t masse[8];           // sa masse : sa taille et sa vitesse en dépendent
uint8_t taille[8];          // sa taille, de 0 (4 pixels) à 9 (24 pixels)
uint8_t cot[8];             // la largeur du rond, en pixels
uint8_t marge[8];           // le vide entre le bord du dessin et le rond
uint8_t lutins[8];          // combien de lutins il faut : 1, 4 ou 9
uint8_t vue[8];             // 1 : on la voit à l'écran (recalculé à chaque tour)
uint8_t vivante[8];         // 1 : dans le jeu ; 0 : mangée, elle attend
uint8_t attente[8];         // une IA mangée revient au bout de 3 secondes
uint8_t reste[8];           // pour la vitesse : les morceaux de pixel pas encore faits
uint8_t pres[8];            // 1 : près de l'écran (elle peut manger des miettes)

// Ce que chaque bulle vise : un coin.
uint8_t bzx[8];
uint8_t bpx[8];
uint8_t bzy[8];
uint8_t bpy[8];

// Le caractère de chaque IA, en deux nombres (en pixels) :
uint8_t peur[8];            // à quelle distance elle voit le danger
uint8_t faim[8];            // à quelle distance elle voit une proie

// Les miettes : 24, toujours près de toi. Le milieu de chacune.
uint8_t fzx[24];
uint8_t fpx[24];
uint8_t fzy[24];
uint8_t fpy[24];
uint8_t posee[24];          // 1 : elle est sur la carte
uint8_t fcoul[24];          // sa couleur : la palette 1 à 6
uint8_t prochaineMiette = 0; // la prochaine à surveiller
uint8_t couleurMiette = 1;  // la palette de la prochaine miette : 1 à 6, tour à tour
uint8_t debut = 0;          // 1 : la partie commence, les miettes peuvent tomber dans l’écran

// La caméra : le coin de l'écran dans le monde, et son milieu.
uint8_t czx = 0;
uint8_t cpx = 0;
uint8_t czy = 0;
uint8_t cpy = 0;
uint8_t ozx = 0;
uint8_t opx = 0;
uint8_t ozy = 0;
uint8_t opy = 0;

// Les lutins : donnés à la suite aux bulles qu'on voit (voir dessinerLesBulles).
uint8_t lutinsUtilises = 0; // combien en a pris le tour d'avant

uint8_t etat = 0;           // 0 le titre, 1 la partie, 2 la fin, 3 la carte
uint8_t gagne = 0;
uint8_t record = 0;
uint8_t qui = 1;            // l'IA qui réfléchit à ce tour-ci
uint8_t derniere = 0;       // l'horloge : l'image du tour d'avant
uint8_t ecoule = 0;         // combien d'images depuis le tour d'avant
uint8_t zr = 0;             // la zone rendue par pousser()
uint8_t plafond = 8;        // la masse que les IA loin de toi peuvent atteindre seules
uint8_t selectAvant = 0;    // SELECT était-il déjà appuyé au tour d'avant ?

// ------------------------------------------------------------- les couleurs

// Une couleur : rouge, vert, bleu, chacun de 0 à 31. Les teintes 0 et 1 des
// palettes de miettes sont celles du sol : une case de miette, une fois
// mangée, redevient du sol sans qu'on ait à la repeindre.
void lesCouleurs() {
  // Le sol (palette 0) : un fond très clair, les points du quadrillage, du
  // gris-bleu, et le foncé des lettres.
  couleurFond(0, 0, 29, 30, 31);
  couleurFond(0, 1, 21, 23, 27);
  couleurFond(0, 2, 12, 14, 20);
  couleurFond(0, 3, 3, 4, 9);
  // Les miettes : six couleurs.
  couleurFond(1, 0, 29, 30, 31);  couleurFond(1, 1, 21, 23, 27);  couleurFond(1, 2, 31, 8, 8);   couleurFond(1, 3, 18, 2, 2);
  couleurFond(2, 0, 29, 30, 31);  couleurFond(2, 1, 21, 23, 27);  couleurFond(2, 2, 31, 20, 4);  couleurFond(2, 3, 20, 10, 0);
  couleurFond(3, 0, 29, 30, 31);  couleurFond(3, 1, 21, 23, 27);  couleurFond(3, 2, 30, 27, 3);  couleurFond(3, 3, 17, 14, 0);
  couleurFond(4, 0, 29, 30, 31);  couleurFond(4, 1, 21, 23, 27);  couleurFond(4, 2, 6, 26, 6);   couleurFond(4, 3, 1, 14, 1);
  couleurFond(5, 0, 29, 30, 31);  couleurFond(5, 1, 21, 23, 27);  couleurFond(5, 2, 4, 26, 30);  couleurFond(5, 3, 0, 13, 18);
  couleurFond(6, 0, 29, 30, 31);  couleurFond(6, 1, 21, 23, 27);  couleurFond(6, 2, 22, 8, 30);  couleurFond(6, 3, 11, 2, 18);
  // Les bulles : teinte 1 le reflet, 2 l'intérieur, 3 le bord.
  couleurLutin(0, 1, 31, 31, 31);  couleurLutin(0, 2, 6, 14, 31);   couleurLutin(0, 3, 1, 3, 12);    // toi : bleu
  couleurLutin(1, 1, 31, 24, 24);  couleurLutin(1, 2, 28, 4, 4);    couleurLutin(1, 3, 12, 0, 0);    // rouge
  couleurLutin(2, 1, 31, 28, 20);  couleurLutin(2, 2, 31, 16, 0);   couleurLutin(2, 3, 14, 6, 0);    // orange
  couleurLutin(3, 1, 31, 31, 22);  couleurLutin(3, 2, 27, 24, 2);   couleurLutin(3, 3, 12, 10, 0);   // jaune
  couleurLutin(4, 1, 24, 31, 24);  couleurLutin(4, 2, 4, 24, 4);    couleurLutin(4, 3, 0, 10, 0);    // vert
  couleurLutin(5, 1, 24, 31, 31);  couleurLutin(5, 2, 2, 23, 27);   couleurLutin(5, 3, 0, 9, 12);    // turquoise
  couleurLutin(6, 1, 29, 24, 31);  couleurLutin(6, 2, 20, 6, 30);   couleurLutin(6, 3, 8, 0, 14);    // violet
  couleurLutin(7, 1, 31, 26, 30);  couleurLutin(7, 2, 31, 10, 22);  couleurLutin(7, 3, 14, 2, 8);    // rose
}

// ------------------------------------------------------------- les grandes places

// L'écart entre deux grandes places (zone, pixel), plafonné à 255 : au-delà,
// c'est « loin », et ça suffit pour décider.
uint8_t ecartGrand(uint8_t za, uint8_t pa, uint8_t zb, uint8_t pb) {
  if (za == zb) {
    if (pa > pb) return pa - pb;
    return pb - pa;
  }
  if (za == zb + 1) {               // a est dans la zone d'après
    if (pa >= pb) return 255;       // 256 ou plus : loin
    return pa - pb;                 // 256 + pa - pb, qui tient dans un octet
  }
  if (zb == za + 1) {
    if (pb >= pa) return 255;
    return pb - pa;
  }
  return 255;                       // deux zones d'écart, ou plus
}

// a est-il avant b (plus à gauche, ou plus haut) ?
uint8_t avant(uint8_t za, uint8_t pa, uint8_t zb, uint8_t pb) {
  if (za < zb) return 1;
  if (za > zb) return 0;
  if (pa < pb) return 1;
  return 0;
}

// Le point p est-il entre c et c + cote ?
uint8_t dedans(uint8_t zp, uint8_t pp, uint8_t zc, uint8_t pc, uint8_t cote) {
  if (zp == zc && pp >= pc) {
    if (pp - pc < cote) return 1;
    return 0;
  }
  if (zp == zc + 1 && pp < pc) {    // juste après la retenue
    uint8_t d = pp - pc;
    if (d < cote) return 1;
  }
  return 0;
}

// Avancer une grande place de n pixels : vers la droite (ou le bas) si sens
// vaut 1, sinon vers la gauche (ou le haut). Sans sortir du monde : pas plus
// loin que (zone 11, pixel « pmax »), pas avant 0. Rend le pixel ; la zone
// est rangée dans zr.
uint8_t pousser(uint8_t z, uint8_t p, uint8_t n, uint8_t sens, uint8_t pmax) {
  if (sens) {
    if (p > 255 - n) {              // ça dépasse 255 : la retenue
      z++;
      p = p - (255 - n) - 1;
    } else {
      p = p + n;
    }
    if (z > 11 || (z == 11 && p > pmax)) {
      z = 11;
      p = pmax;
    }
  } else {
    if (p < n) {
      if (z == 0) {
        p = 0;                      // le bord du monde
      } else {
        z--;                        // on emprunte 256 à la zone
        p = p + (255 - n) + 1;
      }
    } else {
      p = p - n;
    }
  }
  zr = z;
  return p;
}

// ------------------------------------------------------------- tailles et vitesses

// La taille qui va avec la masse de la bulle i — dix marches, de plus en plus
// longues : il faut de plus en plus de miettes pour grandir encore. Puis la
// largeur du rond (cot), le vide autour dans son dessin (marge) et le nombre
// de lutins qu'il prend (lutins).
//
//   taille   0  1  2   3   4   5   6   7   8   9
//   masse    3  4  7  11  16  22  30  40  53  70 et plus
//   pixels   4  6  8  10  12  14  16  18  21  24
void fixerTaille(uint8_t i) {
  uint8_t m = masse[i];
  uint8_t t = 9;
  if (m < 70) t = 8;
  if (m < 53) t = 7;
  if (m < 40) t = 6;
  if (m < 30) t = 5;
  if (m < 22) t = 4;
  if (m < 16) t = 3;
  if (m < 11) t = 2;
  if (m < 7) t = 1;
  if (m < 4) t = 0;
  taille[i] = t;
  if (t == 0) { cot[i] = 4;  marge[i] = 2; }    // ROND4, tel quel
  if (t == 1) { cot[i] = 6;  marge[i] = 1; }    // ROND6
  if (t == 2) { cot[i] = 8;  marge[i] = 0; }    // ROND8
  if (t == 3) { cot[i] = 10; marge[i] = 2; }    // ROND5 × 2
  if (t == 4) { cot[i] = 12; marge[i] = 2; }    // ROND6 × 2
  if (t == 5) { cot[i] = 14; marge[i] = 0; }    // ROND7 × 2
  if (t == 6) { cot[i] = 16; marge[i] = 0; }    // ROND8 × 2
  if (t == 7) { cot[i] = 18; marge[i] = 3; }    // ROND6 × 3
  if (t == 8) { cot[i] = 21; marge[i] = 0; }    // ROND7 × 3
  if (t == 9) { cot[i] = 24; marge[i] = 0; }    // ROND8 × 3
  lutins[i] = 1;
  if (t >= 3) lutins[i] = 4;
  if (t >= 7) lutins[i] = 9;
}

// Le dernier pixel de la zone 11 où peut aller le coin de la bulle i :
// 3000 - largeur = 11 × 256 + (184 - largeur).
uint8_t pmaxDe(uint8_t i) {
  return 184 - cot[i];
}

// PLUS GROS = PLUS LENT : 60 pixels par seconde, moins un peu par masse.
// (masse / 4 + masse / 8, c'est à peu près masse / 3 : à 99, il reste 24.)
// Les IA vont un tout petit peu moins vite que toi.
uint8_t vitesseDe(uint8_t i) {
  uint8_t v = 60 - masse[i] / 4 - masse[i] / 8;
  if (i != 0) v = v - 2;
  return v;
}

// Combien de pixels la bulle i fait à ce tour-ci, à sa vitesse. Une vitesse
// de 60, c'est un pixel par image ; de 30, un pixel toutes les deux images :
// on ajoute la vitesse à chaque image passée, et chaque fois que ça fait 60,
// c'est un pixel.
uint8_t pas(uint8_t i) {
  uint8_t v = vitesseDe(i);
  uint8_t n = 0;
  for (uint8_t k = 0; k < ecoule; k++) {
    reste[i] = reste[i] + v;          // jamais plus de 59 + 60 : ça tient dans un octet
    if (reste[i] >= 60) {
      reste[i] = reste[i] - 60;
      n++;
    }
  }
  return n;
}

// Le milieu de la bulle i : son coin, plus la moitié de sa largeur.
void centrer(uint8_t i) {
  uint8_t h = cot[i] / 2;
  mpx[i] = pousser(zx[i], px[i], h, 1, 255);
  mzx[i] = zr;
  mpy[i] = pousser(zy[i], py[i], h, 1, 255);
  mzy[i] = zr;
}

// Garder la bulle i dans le monde (une bulle qui grossit au bord dépasserait).
void dansLeMonde(uint8_t i) {
  uint8_t m = pmaxDe(i);
  if (zx[i] == 11 && px[i] > m) px[i] = m;
  if (zy[i] == 11 && py[i] > m) py[i] = m;
  centrer(i);
}

// La masse de la bulle i a changé : sa taille aussi, peut-être.
void grossir(uint8_t i) {
  fixerTaille(i);
  dansLeMonde(i);
}

// La distance entre les milieux de deux bulles : le plus grand des deux
// écarts, en largeur et en hauteur.
uint8_t distance(uint8_t i, uint8_t j) {
  uint8_t dx = ecartGrand(mzx[i], mpx[i], mzx[j], mpx[j]);
  uint8_t dy = ecartGrand(mzy[i], mpy[i], mzy[j], mpy[j]);
  if (dx > dy) return dx;
  return dy;
}

// La bulle i est-elle assez grosse pour manger la bulle j ? Sa masse doit
// dépasser celle de j d'au moins un quart (j / 4), et d'au moins 1.
uint8_t plusGrosse(uint8_t i, uint8_t j) {
  if (masse[i] >= masse[j] + masse[j] / 4 + 1) return 1;
  return 0;
}

// La bulle i peut-elle manger la bulle j ? Assez grosse, et le milieu de j
// DANS i.
uint8_t mange(uint8_t i, uint8_t j) {
  if (plusGrosse(i, j) == 0) return 0;
  if (dedans(mzx[j], mpx[j], zx[i], px[i], cot[i]) == 0) return 0;
  if (dedans(mzy[j], mpy[j], zy[i], py[i], cot[i]) == 0) return 0;
  return 1;
}

// Deux bulles se rencontrent : la plus grosse mange l'autre, si elle peut.
// (Pas la peine de regarder deux bulles dans des zones éloignées.)
void rencontre(uint8_t i, uint8_t j) {
  if (vivante[i] == 0 || vivante[j] == 0) return;
  if (ecartGrand(zx[i], 0, zx[j], 0) > 1 || ecartGrand(zy[i], 0, zy[j], 0) > 1) return;
  uint8_t mangeuse = 255;
  uint8_t mangee = 255;
  if (mange(i, j)) { mangeuse = i;  mangee = j; }
  if (mange(j, i)) { mangeuse = j;  mangee = i; }
  if (mangeuse == 255) return;
  if (masse[mangeuse] + masse[mangee] > 99) masse[mangeuse] = 99;   // deux chiffres
  else masse[mangeuse] = masse[mangeuse] + masse[mangee];
  grossir(mangeuse);
  vivante[mangee] = 0;
  attente[mangee] = 3;
  if (mangeuse == 0) note(1, SOL5, 8, 12);
  if (mangee == 0) note(1, DO4, 20, 12);
}

// La bulle i va vers son but, de n pixels au plus, en largeur et en hauteur.
void allerVers(uint8_t i, uint8_t n) {
  uint8_t m = pmaxDe(i);
  if (ecartGrand(zx[i], px[i], bzx[i], bpx[i]) <= n) {
    zx[i] = bzx[i];                 // assez près : elle y est
    px[i] = bpx[i];
  } else {
    px[i] = pousser(zx[i], px[i], n, avant(zx[i], px[i], bzx[i], bpx[i]), m);
    zx[i] = zr;
  }
  if (ecartGrand(zy[i], py[i], bzy[i], bpy[i]) <= n) {
    zy[i] = bzy[i];
    py[i] = bpy[i];
  } else {
    py[i] = pousser(zy[i], py[i], n, avant(zy[i], py[i], bzy[i], bpy[i]), m);
    zy[i] = zr;
  }
}

// ------------------------------------------------------------- la caméra

// La caméra suit ta bulle : ton milieu au milieu de l'écran (80, 68), sauf au
// bord du monde, où elle s'arrête (3000 - 160 = 11 × 256 + 24 ;
// 3000 - 136 = 11 × 256 + 48).
void suivreAvecLaCamera() {
  cpx = pousser(mzx[0], mpx[0], 80, 0, 255);
  czx = zr;
  if (czx > 11 || (czx == 11 && cpx > 24)) {
    czx = 11;
    cpx = 24;
  }
  cpy = pousser(mzy[0], mpy[0], 68, 0, 255);
  czy = zr;
  if (czy > 11 || (czy == 11 && cpy > 48)) {
    czy = 11;
    cpy = 48;
  }
  opx = pousser(czx, cpx, 80, 1, 255);
  ozx = zr;
  opy = pousser(czy, cpy, 68, 1, 255);
  ozy = zr;
  defiler(cpx, cpy);                // la carte glisse : seul le pixel compte
}

// La bulle i se voit-elle à l'écran ?
uint8_t visible(uint8_t i) {
  if (avant(zx[i], px[i], czx, cpx)) {             // elle commence à gauche de l'écran
    if (ecartGrand(zx[i], px[i], czx, cpx) >= cot[i]) return 0;
  } else {
    if (ecartGrand(zx[i], px[i], czx, cpx) >= 160) return 0;
  }
  if (avant(zy[i], py[i], czy, cpy)) {
    if (ecartGrand(zy[i], py[i], czy, cpy) >= cot[i]) return 0;
  } else {
    if (ecartGrand(zy[i], py[i], czy, cpy) >= 136) return 0;
  }
  return 1;
}

// ------------------------------------------------------------- les miettes

// Poser une miette sur la carte, dans sa couleur. La case de la carte, c'est
// son pixel / 8 (la carte a 32 cases de 8 pixels, et revient au début tous
// les 256 pixels).
void poserMiette(uint8_t k) {
  poser(fpx[k] / 8, fpy[k] / 8, MIETTE);
  teindre(fpx[k] / 8, fpy[k] / 8, fcoul[k]);
}

void effacerMiette(uint8_t k) {
  poser(fpx[k] / 8, fpy[k] / 8, GRILLE);
  teindre(fpx[k] / 8, fpy[k] / 8, 0);
  posee[k] = 0;
}

// Une miette nouvelle, au hasard dans le carré de 256 autour de l'écran —
// mais pas DANS l'écran : on ne la verrait pas apparaître de nulle part.
void nouvelleMiette(uint8_t k) {
  uint8_t rx = hasard();
  uint8_t ry = hasard();
  // L'écran va de 48 à 207 en largeur, de 60 à 195 en hauteur, dans ce
  // carré : si elle tombe dedans, on la remonte tout en haut du carré.
  // (Au tout début de la partie, elles peuvent tomber dans l’écran : il est vide.)
  if (debut == 0 && rx >= 48 && rx < 208 && ry >= 60 && ry < 196) ry = ry & 31;
  uint8_t p = pousser(ozx, opx, 128, 0, 255);      // le coin du carré…
  uint8_t z = zr;
  p = pousser(z, p, rx, 1, 175);                   // …plus le hasard
  fzx[k] = zr;
  fpx[k] = p / 8 * 8 + 4;                          // au milieu d'une case
  p = pousser(ozy, opy, 128, 0, 255);
  z = zr;
  p = pousser(z, p, ry, 1, 175);
  fzy[k] = zr;
  fpy[k] = p / 8 * 8 + 4;
  posee[k] = 1;
  fcoul[k] = couleurMiette;
  couleurMiette++;                                 // la couleur suivante : 1 à 6
  if (couleurMiette > 6) couleurMiette = 1;
  poserMiette(k);
}

// Les miettes trop loin de l'écran s'en vont, et repoussent près de toi.
// Six miettes par tour (0 à 5, puis 6 à 11…) : les 24 en quatre tours, ça
// suffit, et ça laisse du temps à la console.
void garderLesMiettesPres() {
  for (uint8_t n = 0; n < 6; n++) {
    uint8_t k = prochaineMiette;
    prochaineMiette++;
    if (prochaineMiette >= 24) prochaineMiette = 0;
    if (posee[k]) {
      if (ecartGrand(fzx[k], fpx[k], ozx, opx) >= 128 || ecartGrand(fzy[k], fpy[k], ozy, opy) >= 128) {
        effacerMiette(k);
      }
    }
    if (posee[k] == 0) nouvelleMiette(k);
  }
}

// La bulle i mange les miettes qui sont sous elle.
void mangerLesMiettes(uint8_t i) {
  for (uint8_t k = 0; k < 24; k++) {
    if (posee[k] && dedans(fzx[k], fpx[k], zx[i], px[i], cot[i]) && dedans(fzy[k], fpy[k], zy[i], py[i], cot[i])) {
      effacerMiette(k);             // elle repoussera dans quelques tours
      if (masse[i] < 99) masse[i]++;
      grossir(i);
      if (i == 0) note(1, DO5, 3, 8);
    }
  }
}

// Le sol entier : le quadrillage sur toute la carte (32 × 32 cases), puis les
// miettes posées.
void dessinerLeSol() {
  for (uint8_t l = 0; l < 32; l++) {
    for (uint8_t c = 0; c < 32; c++) poser(c, l, GRILLE);
  }
  for (uint8_t k = 0; k < 24; k++) {
    if (posee[k]) poserMiette(k);
  }
}

// ------------------------------------------------------------- dessiner

// Dessiner la bulle i à la place de lutins « premier », au pixel (sx, sy) de
// l'écran. Le dessin et son agrandissement dépendent de sa taille : c'est le
// tableau de fixerTaille(). Ta bulle a des yeux.
void dessinerUneBulle(uint8_t i, uint8_t premier, uint8_t sx, uint8_t sy) {
  uint8_t t = taille[i];
  if (i == 0) {
    if (t == 0) spriteTaille(0, sx, sy, ROND4, 1);
    if (t == 1) spriteTaille(0, sx, sy, MOI6, 1);
    if (t == 2) spriteTaille(0, sx, sy, MOI8, 1);
    if (t == 3) spriteTaille(0, sx, sy, ROND5, 2);
    if (t == 4) spriteTaille(0, sx, sy, MOI6, 2);
    if (t == 5) spriteTaille(0, sx, sy, MOI7, 2);
    if (t == 6) spriteTaille(0, sx, sy, MOI8, 2);
    if (t == 7) spriteTaille(0, sx, sy, MOI6, 3);
    if (t == 8) spriteTaille(0, sx, sy, MOI7, 3);
    if (t == 9) spriteTaille(0, sx, sy, MOI8, 3);
  } else {
    if (t == 0) spriteTaille(premier, sx, sy, ROND4, 1);
    if (t == 1) spriteTaille(premier, sx, sy, ROND6, 1);
    if (t == 2) spriteTaille(premier, sx, sy, ROND8, 1);
    if (t == 3) spriteTaille(premier, sx, sy, ROND5, 2);
    if (t == 4) spriteTaille(premier, sx, sy, ROND6, 2);
    if (t == 5) spriteTaille(premier, sx, sy, ROND7, 2);
    if (t == 6) spriteTaille(premier, sx, sy, ROND8, 2);
    if (t == 7) spriteTaille(premier, sx, sy, ROND6, 3);
    if (t == 8) spriteTaille(premier, sx, sy, ROND7, 3);
    if (t == 9) spriteTaille(premier, sx, sy, ROND8, 3);
  }
  // Sa couleur : la palette i (toi la 0, chaque IA la sienne), sur ses lutins.
  for (uint8_t k = 0; k < lutins[i]; k++) teindreLutin(premier + k, i);
}

// Dessiner les bulles qu'on voit : la tienne d'abord (elle se voit toujours),
// puis les autres, dans les places de lutins libres. Leur place à l'écran,
// c'est leur pixel moins celui de la caméra (moins la marge du dessin) : un
// octet qui « tourne » en passant 255 donne juste ce qu'il faut, même à
// moitié hors de l'écran.
//
// Les lutins sont donnés à la suite : une petite bulle en prend 1, une
// moyenne 4, une grosse 9 — tant qu'il en reste (36 ; le 36e est le repère).
void dessinerLesBulles() {
  uint8_t premier = 0;
  for (uint8_t i = 0; i < 8; i++) {
    vue[i] = 0;
    if (vivante[i] && visible(i)) vue[i] = 1;
    if (vue[i] && premier + lutins[i] <= 36) {
      uint8_t sx = px[i] - cpx - marge[i];
      uint8_t sy = py[i] - cpy - marge[i];
      dessinerUneBulle(i, premier, sx, sy);
      premier = premier + lutins[i];
    }
  }
  // Les lutins qui servaient au tour d'avant et plus maintenant : cachés.
  for (uint8_t k = premier; k < lutinsUtilises; k++) cacher(k);
  lutinsUtilises = premier;
}

// Le repère : la bulle la plus proche qui n'est PAS à l'écran, montrée au
// bord, de son côté, dans sa couleur. Il clignote si elle peut te manger.
void dessinerLeRepere() {
  uint8_t laquelle = 255;
  uint8_t mieux = 255;
  for (uint8_t i = 1; i < 8; i++) {
    if (vivante[i] && vue[i] == 0) {
      uint8_t d = distance(0, i);
      if (d < mieux) {
        mieux = d;
        laquelle = i;
      }
    }
  }
  if (laquelle == 255 || (plusGrosse(laquelle, 0) && (images() / 8) % 2)) {
    cacher(36);
    return;
  }
  uint8_t ax = 0;
  uint8_t ay = 0;
  if (avant(czx, cpx, mzx[laquelle], mpx[laquelle])) {
    ax = ecartGrand(czx, cpx, mzx[laquelle], mpx[laquelle]);
    if (ax > 152) ax = 152;
  }
  if (avant(czy, cpy, mzy[laquelle], mpy[laquelle])) {
    ay = ecartGrand(czy, cpy, mzy[laquelle], mpy[laquelle]);
    if (ay > 128) ay = 128;
  }
  sprite(36, ax, ay, REPERE);
  teindreLutin(36, laquelle);
}

// Le panneau du bas : MASSE 05 REC 00  X05 Y05
void ecrireLePanneau() {
  nombrePanneau(5, 0, masse[0], 2);
  nombrePanneau(15, 0, mzx[0], 2);
  nombrePanneau(18, 0, mzy[0], 2);
}

// ------------------------------------------------------------- la carte

// Une grande place sur la carte : 1 pixel de carte pour 32 du monde.
// zone × 8 + pixel / 32 : de 0 à 93. La carte commence au pixel (32, 24).
uint8_t surLaCarte(uint8_t z, uint8_t p) {
  return z * 8 + p / 32;
}

// Ouvrir la carte : le jeu attend, l'écran montre tout le monde, chaque
// bulle un point de sa couleur (plus gros si elle est grosse).
void ouvrirLaCarte() {
  for (uint8_t k = 0; k < 37; k++) cacher(k);
  lutinsUtilises = 0;
  cacherPanneau();
  defiler(0, 0);
  // Les cases des miettes reprennent la palette du sol, le temps de la carte
  // (chaque miette garde sa couleur dans fcoul : elle la retrouvera après).
  for (uint8_t k = 0; k < 24; k++) {
    if (posee[k]) teindre(fpx[k] / 8, fpy[k] / 8, 0);
  }
  effacer();
  texte(6, 0, "LA CARTE");
  // Le cadre, autour du monde : 12 × 12 cases de 8 pixels, de la case 4 à
  // la case 15 en largeur, de la case 3 à la case 14 en hauteur.
  for (uint8_t c = 3; c < 17; c++) {
    poser(c, 2, BORD);
    poser(c, 15, BORD);
  }
  for (uint8_t l = 2; l < 16; l++) {
    poser(3, l, BORD);
    poser(16, l, BORD);
  }
  texte(1, 17, "SELECT : REVENIR");
}

// Les points de la carte (redessinés à chaque tour : le tien clignote).
void dessinerLaCarte() {
  for (uint8_t i = 0; i < 8; i++) {
    if (vivante[i] == 0 || (i == 0 && (images() / 8) % 2)) {
      cacher(i);
    } else {
      uint8_t x = surLaCarte(mzx[i], mpx[i]) + 28;   // + 32, moins 4 : le point est au milieu de son dessin
      uint8_t y = surLaCarte(mzy[i], mpy[i]) + 20;   // + 24, moins 4
      if (taille[i] < 3) sprite(i, x, y, POINT1);
      else if (taille[i] < 7) sprite(i, x, y, POINT2);
      else sprite(i, x, y, POINT3);
      teindreLutin(i, i);
    }
  }
}

// Fermer la carte : le sol, les miettes, le panneau reviennent.
void fermerLaCarte() {
  for (uint8_t k = 0; k < 8; k++) cacher(k);
  effacer();
  dessinerLeSol();
  panneau(0, 136);
  suivreAvecLaCamera();
  derniere = images();              // l'horloge ne compte pas le temps passé sur la carte
}

// ------------------------------------------------------------- les IA

// Une place au hasard près d'une autre (jusqu'à 127 pixels de chaque côté).
void butAuHasardPres(uint8_t i, uint8_t z1, uint8_t p1, uint8_t z2, uint8_t p2) {
  uint8_t m = pmaxDe(i);
  bpx[i] = pousser(z1, p1, hasard() & 127, hasard() & 1, m);
  bzx[i] = zr;
  bpy[i] = pousser(z2, p2, hasard() & 127, hasard() & 1, m);
  bzy[i] = zr;
}

// Ce que décide l'IA i : fuir, chasser, manger une miette, ou rôder.
void decider(uint8_t i) {
  uint8_t danger = 255;               // la bulle qui peut la manger (255 : aucune)
  uint8_t proie = 255;                // la bulle qu'elle peut manger
  uint8_t dDanger = 255;
  uint8_t dProie = 255;

  // 1. Regarder les autres bulles.
  for (uint8_t j = 0; j < 8; j++) {
    if (j != i && vivante[j]) {
      uint8_t d = distance(i, j);
      if (d < peur[i] && d < dDanger && plusGrosse(j, i)) {
        danger = j;
        dDanger = d;
      }
      if (d < faim[i] && d < dProie && plusGrosse(i, j)) {
        proie = j;
        dProie = d;
      }
    }
  }

  // 2. Un danger : filer à l'opposé (100 pixels plus loin, et ainsi de suite).
  if (danger != 255) {
    uint8_t m = pmaxDe(i);
    bpx[i] = pousser(zx[i], px[i], 100, avant(mzx[danger], mpx[danger], mzx[i], mpx[i]), m);
    bzx[i] = zr;
    bpy[i] = pousser(zy[i], py[i], 100, avant(mzy[danger], mpy[danger], mzy[i], mpy[i]), m);
    bzy[i] = zr;
    return;
  }

  // 3. Une proie : viser son milieu avec son propre milieu.
  if (proie != 255) {
    uint8_t h = cot[i] / 2;
    bpx[i] = pousser(mzx[proie], mpx[proie], h, 0, 255);
    bzx[i] = zr;
    bpy[i] = pousser(mzy[proie], mpy[proie], h, 0, 255);
    bzy[i] = zr;
    return;
  }

  // 4. Une miette pas trop loin : la plus proche. (Les miettes sont toutes
  //    autour de l’écran : une IA loin de l’écran n’a pas à les chercher.)
  uint8_t mieux = 120;
  uint8_t loin = 0;
  if (ecartGrand(mzx[i], mpx[i], ozx, opx) > 240 || ecartGrand(mzy[i], mpy[i], ozy, opy) > 240) loin = 1;
  uint8_t laquelle = 255;
  for (uint8_t k = 0; k < 24 && loin == 0; k++) {
    if (posee[k]) {
      uint8_t d = ecartGrand(fzx[k], fpx[k], mzx[i], mpx[i]);
      uint8_t dy = ecartGrand(fzy[k], fpy[k], mzy[i], mpy[i]);
      if (dy > d) d = dy;
      if (d < mieux) {
        mieux = d;
        laquelle = k;
      }
    }
  }
  if (laquelle != 255) {
    uint8_t h = cot[i] / 2;            // le but est un milieu : on vise le coin
    bpx[i] = pousser(fzx[laquelle], fpx[laquelle], h, 0, 255);
    bzx[i] = zr;
    bpy[i] = pousser(fzy[laquelle], fpy[laquelle], h, 0, 255);
    bzy[i] = zr;
    return;
  }

  // 5. Rien en vue : rôder. Arrivée à son but, elle en choisit un autre —
  //    une fois sur deux près de TOI (elle « sent » où tu es).
  if (zx[i] == bzx[i] && px[i] == bpx[i] && zy[i] == bzy[i] && py[i] == bpy[i]) {
    if (hasard() & 1) butAuHasardPres(i, zx[0], px[0], zy[0], py[0]);
    else butAuHasardPres(i, zx[i], px[i], zy[i], py[i]);
  }
}

// Une IA (ré)apparaît, toute petite, au hasard dans le monde — mais jamais
// dans les zones autour de toi.
void apparaitre(uint8_t i) {
  zx[i] = (hasard() & 7) + (hasard() & 3);        // de 0 à 10
  zy[i] = (hasard() & 7) + (hasard() & 3);
  px[i] = hasard();
  py[i] = hasard();
  if (ecartGrand(zx[i], 0, zx[0], 0) < 2 && ecartGrand(zy[i], 0, zy[0], 0) < 2) {
    if (zx[i] < 6) zx[i] = zx[i] + 4;
    else zx[i] = zx[i] - 4;
  }
  masse[i] = 3;
  fixerTaille(i);
  vivante[i] = 1;
  reste[i] = 0;
  bzx[i] = zx[i];
  bpx[i] = px[i];
  bzy[i] = zy[i];
  bpy[i] = py[i];
  centrer(i);
}

// ------------------------------------------------------------- les écrans

void toutCacher() {
  for (uint8_t k = 0; k < 37; k++) cacher(k);
  lutinsUtilises = 0;
}

// Les cases des miettes reprennent la palette du sol (sinon, les lettres de
// l'écran suivant y seraient en couleur).
void repeindreLesMiettes() {
  for (uint8_t k = 0; k < 24; k++) {
    if (posee[k]) teindre(fpx[k] / 8, fpy[k] / 8, 0);
    posee[k] = 0;
  }
}

void ecranTitre() {
  cacherPanneau();
  defiler(0, 0);
  effacer();
  texteTitre(1, 1, "BULLES", 3);      // BULLES en grosses lettres : 6 lettres de 3 cases
  texte(4, 6, "GLOUTONNES");
  spriteTaille(0, 72, 60, MOI8, 2);   // ta bulle, en moyenne, en bleu
  for (uint8_t k = 0; k < 4; k++) teindreLutin(k, 0);
  texte(1, 10, "UN MONDE DE 3000");
  texte(1, 11, "MANGE LES MIETTES");
  texte(1, 12, "ET LES PETITES");
  texte(1, 13, "BULLES. FUIS LES");
  texte(1, 14, "GROSSES !");
  texte(1, 15, "SELECT : LA CARTE");
  texte(7, 17, "START");
}

void nouvellePartie() {
  toutCacher();
  effacer();
  for (uint8_t k = 0; k < 24; k++) posee[k] = 0;
  dessinerLeSol();
  // Le panneau, en bas : il ne défile pas.
  effacerPanneau();
  textePanneau(0, 0, "MASSE");
  textePanneau(8, 0, "REC");
  record = meilleurScore(0);          // relire le record (0 ne le bat jamais)
  nombrePanneau(11, 0, record, 2);
  textePanneau(14, 0, "X");
  textePanneau(17, 0, "Y");
  panneau(0, 136);

  // Toi, au milieu du monde.
  zx[0] = 5;  px[0] = 200;  zy[0] = 5;  py[0] = 200;
  masse[0] = 3;
  fixerTaille(0);
  vivante[0] = 1;
  reste[0] = 0;
  centrer(0);

  // Les sept IA, au hasard, avec leur caractère tour à tour :
  // (voit le danger à, voit une proie à), en pixels.
  for (uint8_t i = 1; i < 8; i++) {
    apparaitre(i);
    attente[i] = 0;
    uint8_t sorte = i;
    while (sorte > 3) sorte = sorte - 3;
    if (sorte == 1) { peur[i] = 96;  faim[i] = 32;  }   // PEUREUSE
    if (sorte == 2) { peur[i] = 40;  faim[i] = 40;  }   // GOURMANDE : les miettes avant tout
    if (sorte == 3) { peur[i] = 48;  faim[i] = 120; }   // CHASSEUSE
  }
  plafond = 8;                        // les IA commencent petites

  suivreAvecLaCamera();
  debut = 1;                          // les 24 miettes, tout de suite (6 par appel)
  for (uint8_t n = 0; n < 4; n++) garderLesMiettesPres();
  debut = 0;
  derniere = images();
  selectAvant = 1;
  gagne = 0;
}

void finDePartie() {
  record = meilleurScore(masse[0]);   // le record, sauvé dans la cartouche
  toutCacher();
  cacherPanneau();
  repeindreLesMiettes();
  defiler(0, 0);
  effacer();
  if (gagne) {
    texte(2, 4, "TU ES LA PLUS");
    texte(2, 5, "GROSSE BULLE !");
  } else {
    texte(3, 4, "TU T ES FAIT");
    texte(3, 5, "MANGER !");
  }
  texte(4, 8, "MASSE");
  nombre(12, 8, masse[0], 2);
  texte(4, 10, "RECORD");
  nombre(12, 10, record, 2);
  texte(2, 15, "START : REJOUER");
}

// ------------------------------------------------------------- la partie

void unTourDeJeu() {
  // 0. L’horloge : combien d’images depuis le tour d’avant (8 au plus).
  uint8_t maintenant = images();
  ecoule = maintenant - derniere;
  derniere = maintenant;
  if (ecoule > 8) ecoule = 8;

  // 1. Toi : la croix. Ton but est le bord du monde dans la direction
  //    appuyée ; sans bouton, tu restes où tu es.
  bzx[0] = zx[0];  bpx[0] = px[0];
  bzy[0] = zy[0];  bpy[0] = py[0];
  if (bouton(DROITE)) { bzx[0] = 11;  bpx[0] = pmaxDe(0); }
  if (bouton(GAUCHE)) { bzx[0] = 0;   bpx[0] = 0; }
  if (bouton(BAS))    { bzy[0] = 11;  bpy[0] = pmaxDe(0); }
  if (bouton(HAUT))   { bzy[0] = 0;   bpy[0] = 0; }
  allerVers(0, pas(0));
  centrer(0);

  // 2. Les IA : une seule réfléchit à chaque tour, chacune son tour (1, 2,
  //    … 7, 1, 2…) — ça laisse du temps à la console. Toutes bougent.
  qui++;
  if (qui > 7) qui = 1;
  if (vivante[qui]) decider(qui);
  for (uint8_t i = 1; i < 8; i++) {
    if (vivante[i]) {
      allerVers(i, pas(i));
      centrer(i);
    }
  }

  // 3. La caméra suit, et les miettes restent autour de l'écran.
  suivreAvecLaCamera();
  garderLesMiettesPres();

  // 4. Manger les miettes : toi à chaque tour ; l'IA qui a réfléchi, si
  //    elle est près de l'écran (les autres, à leur tour).
  mangerLesMiettes(0);
  pres[qui] = 0;
  if (vivante[qui] && ecartGrand(mzx[qui], mpx[qui], ozx, opx) < 160 && ecartGrand(mzy[qui], mpy[qui], ozy, opy) < 160) {
    pres[qui] = 1;
    mangerLesMiettes(qui);
  }

  // 5. Les bulles se mangent : toi contre chaque IA, et l'IA qui a réfléchi
  //    contre les autres IA — à chaque tour, ce qui compte le plus.
  for (uint8_t j = 1; j < 8; j++) {
    rencontre(0, j);
    if (j != qui) rencontre(qui, j);
  }

  // 6. Chaque seconde : les IA mangées reviennent au bout de 3 secondes ; les
  //    IA loin de toi grossissent un peu toutes seules (elles mangent des
  //    miettes qu’on ne voit pas), jusqu’au PLAFOND — qui monte d'un toutes
  //    les deux secondes environ, jusqu'à 70 : au fil de la partie, il y a de
  //    plus en plus de grosses bulles.
  if (chaque(1000)) {
    if (plafond < 70 && (images() & 1)) plafond++;
    for (uint8_t i = 1; i < 8; i++) {
      if (vivante[i] == 0) {
        if (attente[i] > 0) attente[i]--;
        if (attente[i] == 0) apparaitre(i);
      } else if (pres[i] == 0 && masse[i] < plafond) {
        masse[i]++;
        grossir(i);
      }
    }
  }

  // 7. Gagné : 99 de masse, le plus que la bulle puisse avoir.
  if (masse[0] >= 99) gagne = 1;

  // 8. Dessiner (le repère et le panneau, un tour sur trois : ils changent peu).
  dessinerLesBulles();
  if (qui == 1 || qui == 4 || qui == 7) dessinerLeRepere();
  if (qui == 2 || qui == 5) ecrireLePanneau();
}

// ------------------------------------------------------------- le programme

int main() {
  lesCouleurs();
  ecranTitre();

  while (true) {
    image();

    // SELECT vient d'être appuyé (et pas tenu depuis le tour d'avant) ?
    uint8_t select = bouton(SELECT);
    uint8_t selectNouveau = 0;
    if (select && selectAvant == 0) selectNouveau = 1;
    selectAvant = select;

    if (etat == 0 || etat == 2) {     // le titre, ou la fin : START lance une partie
      if (bouton(START)) {
        nouvellePartie();
        etat = 1;
      }
    } else if (etat == 3) {           // la carte : le jeu attend
      dessinerLaCarte();
      if (selectNouveau) {
        fermerLaCarte();
        etat = 1;
      }
    } else {
      if (selectNouveau) {
        ouvrirLaCarte();
        etat = 3;
      } else {
        unTourDeJeu();
        if (gagne || vivante[0] == 0) {
          finDePartie();
          etat = 2;
          while (bouton(START)) image();   // on attend que START soit relâché
        }
      }
    }
  }
}

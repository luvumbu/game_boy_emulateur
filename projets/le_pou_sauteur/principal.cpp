// LE POU SAUTEUR — tu es un pou. Saute de tête en tête et donne des poux à
// tout le monde !
//
//   A                sauter — plus tu tiens A, plus tu sautes haut ;
//   GAUCHE / DROITE  te diriger, en l'air comme sur une tête ;
//   START            commencer, et recommencer.
//
// Quatre personnes marchent dans la rue, chacune à sa vitesse : deux enfants
// et deux adultes (leur tête est plus haute : dose ton saut). Retombe sur une
// tête : la personne a des poux — un point — et se met à se gratter. (La
// tête où tu apparais est un refuge : elle n'attrape rien tant que tu ne l'as
// pas quittée.) Elle
// guérit au bout de huit secondes : reviens l'infecter. Rate ton saut et
// tombe par terre : une vie de moins (trois en tout). Si les quatre ont des
// poux EN MÊME TEMPS, tu as gagné (vingt points de bonus). Sinon, la partie
// dure soixante secondes. Le record est gardé dans la cartouche.
//
// Tout ce qui bouge vient du chapitre 26 (« Le héros bouge ») et des fonctions
// de la console : sauter() pour le saut dosé, gaucheDroite() pour la manette,
// navette() pour les passants, chaque() pour le chrono, meilleurScore() pour
// le record. Le pou se pose sur une tête parce que le SOL de sauter() change :
// au-dessus d'une tête, le sol, c'est elle.

#include <Tuile>          // un dessin de 8 × 8
#include <Perso>          // un dessin de 16 × 16
#include <sprite>         // le pou : un lutin de 8 × 8
#include <sprite16>       // les passants : 16 × 16
#include <cacher>         // ôter le pou
#include <cacher16>       // ôter un passant
#include <bande>          // le trottoir
#include <poser>          // le pou géant de l'écran titre
#include <texte>          // écrire
#include <texteTitre>     // le titre en grosses lettres
#include <nombre>         // le score, le temps, les vies
#include <effacer>        // changer d'écran
#include <bouton>         // START
#include <chaque>         // le chrono : une seconde
#include <gaucheDroite>   // la manette : gauche, droite
#include <sauter>         // le saut, dosé par A
#include <navette>        // les passants vont et viennent
#include <meilleurScore>  // le record, gardé dans la cartouche

// ------------------------------------------------------------- les dessins

Tuile POU = {                     // Le pou : six pattes, deux antennes.
  "#......#",
  ".#....#.",
  "..####..",
  "#-####-#",
  ".######.",
  "#-####-#",
  ".######.",
  "#.#..#.#",
};

Tuile TROTTOIR = {                // Le trottoir : des pavés.
  "33333333",
  "21112111",
  "21112111",
  "22222222",
  "11211121",
  "11211121",
  "22222222",
  "33333333",
};

Perso ENFANT = {                  // Un enfant, en entier (16 pixels de haut).
  "....######......",
  "...########.....",
  "...#-#--#-#.....",
  "...#------#.....",
  "...#-#--#-#.....",
  "....#----#......",
  ".....####.......",
  "....######......",
  "...#++++++#.....",
  "..#+#++++#+#....",
  "..#+#++++#+#....",
  "....#++++#......",
  "....##..##......",
  "....#....#......",
  "....#....#......",
  "...##....##.....",
};

Perso ENFANT_GRATTE = {           // Il a des poux : il se gratte la tête.
  "..#.######......",
  "..##########....",
  "...#-#--#-#.#...",
  "...#------#.#...",
  "...#-#--#-#.#...",
  "....#----##.....",
  ".....####.......",
  "....######......",
  "...#++++++#.....",
  "..#+#++++#......",
  "..#+#++++#......",
  "....#++++#......",
  "....##..##......",
  "....#....#......",
  "....#....#......",
  "...##....##.....",
};

Perso ADULTE = {                  // Le haut d'un adulte : la tête et le buste.
  "....######......",
  "...########.....",
  "...#-#--#-#.....",
  "...#------#.....",
  "...#-#--#-#.....",
  "...#--##--#.....",
  "....#----#......",
  ".....####.......",
  "...########.....",
  "..#++++++++#....",
  ".#+#++++++#+#...",
  ".#+#++++++#+#...",
  ".#+#++++++#+#...",
  ".#+#++++++#+#...",
  "..#.#++++#.#....",
  "....#++++#......",
};

Perso ADULTE_GRATTE = {           // Le haut d'un adulte qui se gratte.
  "....######.##...",
  "...########.#...",
  "...#-#--#-#.#...",
  "...#------#.#...",
  "...#-#--#-#.#...",
  "...#--##--###...",
  "....#----#.#....",
  ".....####.#.....",
  "...########.....",
  "..#++++++++#....",
  ".#+#++++++#.....",
  ".#+#++++++#.....",
  ".#+#++++++#.....",
  ".#+#++++++#.....",
  "..#.#++++#......",
  "....#++++#......",
};

Perso JAMBES = {                  // Le bas d'un adulte : les jambes.
  "....#++++#......",
  "....######......",
  "....##..##......",
  "....#....#......",
  "....#....#......",
  "....#....#......",
  "....#....#......",
  "....#....#......",
  "....#....#......",
  "....#....#......",
  "....#....#......",
  "....#....#......",
  "....#....#......",
  "....#....#......",
  "....#....#......",
  "...##....##.....",
};

// ------------------------------------------------------------- l'état du jeu

uint8_t etat = 0;           // 0 l'écran titre, 1 la partie, 2 la fin
uint8_t gx[4];              // la place de chaque passant, en pixels
uint8_t solTete[4];         // où se pose le pou sur sa tête : 104 (enfant), 88 (adulte)
uint8_t infecte[4];         // 1 : il a des poux
uint8_t depuis[4];          // depuis combien de secondes (au bout de 8, il guérit)
uint8_t px = 0;             // le pou
uint8_t py = 0;
uint8_t hauteurMax = 56;    // la hauteur max du saut, en pixels
uint8_t gravite = 4;        // la gravité du saut : 4 normale, 2 faible, 1 très faible, 8 forte
uint8_t sur = 255;          // la tête où il est posé (0 à 3), 255 : en l'air
uint8_t refuge = 255;       // la tête où il (ré)apparaît : pas de poux tant qu'il ne l'a pas quittée
uint8_t score = 0;
uint8_t temps = 60;         // les secondes qui restent
uint8_t vies = 3;
uint8_t gagne = 0;
uint8_t record = 0;

// ------------------------------------------------------------- les écrans

void ecranTitre() {
  effacer();
  texteTitre(2, 1, "POU", 5);         // POU en grosses lettres : 3 lettres de 5 cases
  texte(3, 7, "LE POU SAUTEUR");
  poser(8, 9, POU, 4);                // le pou, quatre fois plus grand
  texte(1, 14, "SAUTE DE TETE EN");
  texte(1, 15, "TETE !  A : SAUTER");
  texte(5, 17, "START");
}

void nouvellePartie() {
  effacer();
  bande(0, 16, TROTTOIR, 20);         // le trottoir : lignes 16 et 17
  bande(0, 17, TROTTOIR, 20);
  texte(0, 0, "PTS");                 // la ligne du haut : PTS 000  TEMPS 60  V3
  texte(8, 0, "TEMPS");
  texte(17, 0, "V");
  gx[0] = 4;   solTete[0] = 104;      // deux enfants…
  gx[1] = 120; solTete[1] = 104;
  gx[2] = 50;  solTete[2] = 88;       // …et deux adultes, plus grands
  gx[3] = 144; solTete[3] = 88;
  for (uint8_t i = 0; i < 4; i++) {
    infecte[i] = 0;
    depuis[i] = 0;
  }
  px = gx[0] + 4;                     // le pou part sur la tête du premier enfant :
  refuge = 0;                         // c'est son refuge, pas une tête à infecter (encore)
  py = 104;
  sur = 0;
  score = 0;
  temps = 60;
  vies = 3;
  gagne = 0;
}

void finDePartie() {
  record = meilleurScore(score);      // le record, sauvé dans la cartouche
  cacher(0);
  cacher16(4);
  cacher16(8);
  cacher16(12);
  cacher16(16);
  cacher16(20);
  cacher16(24);
  effacer();
  if (gagne) {
    texte(2, 4, "TOUT LE MONDE A");
    texte(2, 5, "DES POUX ! BRAVO");
  } else {
    texte(5, 4, "FIN DU JEU");
  }
  texte(4, 8, "SCORE");
  nombre(12, 8, score);
  texte(4, 10, "RECORD");
  nombre(12, 10, record);
  texte(2, 15, "START : REJOUER");
}

// ------------------------------------------------------------- la partie

// Le pou est-il au-dessus de la tête du passant i ? (le milieu du pou, px + 4,
// entre les pixels 1 et 14 du passant : sa tête, et un pixel de marge)
uint8_t dessus(uint8_t i) {
  if (px + 4 >= gx[i] + 1 && px + 4 < gx[i] + 15) return 1;
  return 0;
}

void dessinerLesGens() {
  // Un passant qui a des poux se gratte : son dessin change toutes les 8 images.
  uint8_t gratte = (images() / 8) % 2;
  if (infecte[0] && gratte) sprite16(4, gx[0], 112, ENFANT_GRATTE);
  else sprite16(4, gx[0], 112, ENFANT);
  if (infecte[1] && gratte) sprite16(8, gx[1], 112, ENFANT_GRATTE);
  else sprite16(8, gx[1], 112, ENFANT);
  if (infecte[2] && gratte) sprite16(12, gx[2], 96, ADULTE_GRATTE);
  else sprite16(12, gx[2], 96, ADULTE);
  sprite16(16, gx[2], 112, JAMBES);
  if (infecte[3] && gratte) sprite16(20, gx[3], 96, ADULTE_GRATTE);
  else sprite16(20, gx[3], 96, ADULTE);
  sprite16(24, gx[3], 112, JAMBES);
}

void unTourDeJeu() {
  // 1. Les passants marchent. Celui qui porte le pou l'emporte avec lui :
  //    le pou avance d'autant que lui (« apres - avant »).
  uint8_t avant = 0;
  if (sur < 4) avant = gx[sur];
  gx[0] = navette(gx[0], 25, 4, 56);      // chacun sa portion de rue,
  gx[1] = navette(gx[1], 40, 70, 130);    // chacun sa vitesse
  gx[2] = navette(gx[2], 18, 20, 90);
  gx[3] = navette(gx[3], 32, 96, 144);
  if (sur < 4) px = px + (gx[sur] - avant);

  // 2. La manette : gauche, droite — assez vite : en l’air,
  //    le pou doit pouvoir rattraper une tête qui s’en va (70 pixels par seconde).
  px = gaucheDroite(px, 70);

  // 3. Le sol sous le pou : la plus haute tête qui est sous lui, sinon la rue.
  uint8_t sol = 120;                  // la rue : 128 - 8
  for (uint8_t i = 0; i < 4; i++) {
    if (dessus(i) && py <= solTete[i] && solTete[i] < sol) sol = solTete[i];
  }

  // 4. Le saut : A, plus ou moins longtemps.
  py = sauter(py, hauteurMax, sol, gravite);

  // 5. Où est-il posé ? Sur une tête nouvelle : elle a des poux, un point.
  sur = 255;
  for (uint8_t i = 0; i < 4; i++) {
    if (dessus(i) && py == solTete[i]) {
      sur = i;
      if (infecte[i] == 0 && i != refuge) {
        infecte[i] = 1;
        depuis[i] = 0;
        score++;
      }
    }
  }

  if (sur != refuge) refuge = 255;    // il a quitté son refuge : c'est une tête comme les autres

  // 6. Tombé par terre : une vie de moins, et il repart sur une tête.
  if (py == 120 && sur == 255) {
    vies--;
    uint8_t k = images() % 4;
    px = gx[k] + 4;
    py = solTete[k];
    sur = k;
    refuge = k;                       // il réapparaît sur un refuge : pas de point en tombant
  }

  // 7. Chaque seconde : le chrono descend, les malades guérissent au bout de 8.
  if (chaque(1000)) {
    if (temps > 0) temps--;
    for (uint8_t i = 0; i < 4; i++) {
      if (infecte[i]) {
        depuis[i]++;
        if (depuis[i] >= 8) infecte[i] = 0;
      }
    }
  }

  // 8. Les quatre ont des poux en même temps : gagné !
  if (infecte[0] && infecte[1] && infecte[2] && infecte[3]) {
    gagne = 1;
    score = score + 20;
  }

  // 9. Dessiner.
  nombre(4, 0, score);
  nombre(14, 0, temps, 2);
  nombre(18, 0, vies, 1);
  dessinerLesGens();
  sprite(0, px, py, POU);
}

// ------------------------------------------------------------- le programme

int main() {
  ecranTitre();

  while (true) {
    image();

    if (etat == 0 || etat == 2) {     // le titre, ou la fin : START lance une partie
      if (bouton(START)) {
        nouvellePartie();
        etat = 1;
      }
    } else {
      unTourDeJeu();
      if (gagne || temps == 0 || vies == 0) {
        finDePartie();
        etat = 2;
        while (bouton(START)) image();   // on attend que START soit relâché
      }
    }
  }
}

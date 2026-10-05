/*
 * Le dessin écrit LÀ OÙ ON LE POSE.
 *
 * Une case de l'écran, c'est huit rangées de huit pixels — jamais autre chose.
 * On peut leur donner un nom, « Tuile SOL = {…} », puis poser ce nom ; on peut
 * aussi écrire les huit rangées dans le « poser » lui-même, et c'est ce que
 * fait presque tout ce programme.
 *
 * Nommer vaut le coup pour ce qui sert PARTOUT : SOL est posé vingt fois, et
 * son nom le dit à chaque ligne. Pour la porte de la maison, qui ne sert
 * qu'une seule fois, le nom n'apprend rien que le dessin ne dise mieux — et il
 * oblige à lire deux endroits pour comprendre un seul.
 *
 * Le compilateur ne grave qu'UNE tuile par dessin. Les deux nuages, écrits à
 * douze lignes d'écart, n'en dépensent qu'une ; et le pavé du bas, qui redit
 * le dessin de SOL dans l'autre alphabet, n'en dépense aucune de plus.
 */

/* Celui-là sert partout : il garde son nom. */

#include <Tuile>          // un dessin de 8 × 8 pixels
#include <texte>          // écrit un texte à l’écran
#include <poser>          // pose une tuile sur une case du fond
#include <sprite>         // place un lutin de 8 × 8 au pixel près
#include <sprite16>       // place un lutin de 16 × 16 au pixel près
#include <panneau>        // montre le panneau, à une place choisie
#include <poserPanneau>   // pose une tuile sur le panneau
#include <Perso>          // un personnage : un dessin de 16 × 16 ou de 32 × 32 pixels

Tuile SOL = {
  "22222222",
  "21111112",
  "21111112",
  "21111112",
  "21111112",
  "21111112",
  "21111112",
  "22222222",
};

int main() {
  texte(5, 1, "SUR PLACE");

  /* Deux nuages, le même dessin — une seule tuile gravée. */
  poser(2, 3, {
    "........",
    "..####..",
    ".######.",
    "########",
    ".######.",
    "........",
    "........",
    "........",
  });

  /* La maison. Rien de tout cela ne porte de nom : chaque dessin est à la
     place qu'il occupe, et l'on voit la maison en lisant le programme. */
  poser(8, 10, {
    "......##",
    "....####",
    "..######",
    "########",
    "########",
    "........",
    "........",
    "........",
  });
  poser(9, 10, {
    "##......",
    "####....",
    "######..",
    "########",
    "########",
    "........",
    "........",
    "........",
  });
  poser(8, 11, {
    "########",
    "#++++++#",
    "#++##++#",
    "#++##++#",
    "#++++++#",
    "#++++++#",
    "#++++++#",
    "########",
  });
  poser(9, 11, {
    "########",
    "#------#",
    "#-####-#",
    "#-#--#-#",
    "#-#--#-#",
    "#-#--#-#",
    "#-#--#-#",
    "########",
  });

  /* Le même nuage, douze lignes plus bas. Le compilateur le reconnaît. */
  poser(14, 3, {
    "........",
    "..####..",
    ".######.",
    "########",
    ".######.",
    "........",
    "........",
    "........",
  });

  /* Le sol, posé par son nom : vingt cases, un seul dessin, et le nom dit
     lequel sans qu'on ait à le relire. */
  for (uint8_t x = 0; x < 20; x++) {
    poser(x, 13, SOL);
  }

  /* Le dessin de SOL, redit dans l'AUTRE alphabet. Les mêmes pixels : le
     compilateur ne grave pas une tuile de plus pour l'écriture. */
  poser(3, 14, {
    "++++++++",
    "+------+",
    "+------+",
    "+------+",
    "+------+",
    "+------+",
    "+------+",
    "++++++++",
  });

  /* Un lutin se pose au pixel près, et son dessin s'écrit là aussi. */
  sprite(0, 120, 40, {
    "..####..",
    ".#----#.",
    "#--++--#",
    "#-+##+-#",
    "#-+##+-#",
    "#--++--#",
    ".#----#.",
    "..####..",
  });

  /* Un personnage de seize sur seize : seize rangées de seize signes, et le
     compilateur les découpe lui-même en quatre tuiles. */
  sprite16(1, 24, 32, {
    "....########....",
    "..############..",
    ".##############.",
    "###..######..###",
    "###..######..###",
    "################",
    "################",
    "##..########..##",
    "##...######...##",
    "###..######..###",
    ".##############.",
    "..############..",
    "....########....",
    "...##########...",
    "..###..##..###..",
    ".###...##...###.",
  });

  /* Le panneau aussi : c'est la même carte, et le même geste. */
  panneau(0, 128);
  poserPanneau(1, 0, {
    "...##...",
    "..####..",
    "#######.",
    ".#####..",
    "..####..",
    ".##..##.",
    "##....##",
    "........",
  });

  while (true) {
    image();
  }

  return 0;
}

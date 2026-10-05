/*
 * Tout ce que la CONSOLE sait faire, et que le langage expose.
 *
 *   node gb3.mjs exemples/console.cpp
 *   node verifier-console.mjs
 *
 * Le fichier « langage.cpp » éprouve le langage : les boucles, les calculs,
 * les « struct ». Celui-ci éprouve le matériel — le panneau qui ne défile pas,
 * les palettes, les options d'un lutin, le son, l'horloge des images, et la
 * mémoire qui survit à l'extinction.
 *
 * Chacun de ces réglages était présent dans la puce depuis 1989 et resté hors
 * d'atteinte. Ce programme les met tous à l'écran en même temps, ce qu'aucun
 * jeu raisonnable ne ferait — mais c'est la seule façon de vérifier qu'ils
 * fonctionnent tous, et qu'ils ne se gênent pas.
 */

#include <Tuile>          // un dessin de 8 × 8 pixels
#include <Perso>          // un personnage : un dessin de 16 × 16 ou de 32 × 32 pixels
#include <poser>          // pose une tuile sur une case du fond
#include <ecran>          // éteint ou rallume l’écran
#include <textePanneau>   // écrit un texte sur le panneau
#include <panneau>        // montre le panneau, à une place choisie
#include <poserPanneau>   // pose une tuile sur le panneau
#include <sauvegarde>     // relit un nombre gardé dans la cartouche
#include <sauver>         // garde un nombre dans la cartouche, même éteinte
#include <semer>          // choisit le départ du hasard
#include <sprite16>       // place un lutin de 16 × 16 au pixel près
#include <sprite>         // place un lutin de 8 × 8 au pixel près
#include <defiler>        // fait glisser tout le fond
#include <note>           // joue une note
#include <bruit>          // joue un bruit
#include <paletteFond>    // choisit les quatre nuances du fond
#include <bouton>         // lit un bouton de la manette
#include <silence>        // fait taire une voix
#include <diviser>        // a / b, sauf par 1, 2, 4, 8, 16… écrits en clair
#include <reste>          // a % b, sauf par 1, 2, 4, 8, 16… écrits en clair

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

Perso HEROS = {
  "0000333333000000",
  "0003222223300000",
  "0032133123230000",
  "0032222222230000",
  "0032211112230000",
  "0003222222300000",
  "0000333333000000",
  "0003333333300000",
  "0032222222230000",
  "0322222222223000",
  "0322233332223000",
  "0032222222230000",
  "0003300003300000",
  "0032200002230000",
  "0032200002230000",
  "0033300003330000",
};

/* La marque qui dit que la cartouche a déjà servi. */
const uint8_t MARQUE = 42;

/* Un décor décrit en grille : deux dimensions, comme on l'écrirait en C++. */
const uint8_t LARGEUR = 20;
const uint8_t MOTIF[4][LARGEUR] = {
  { 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0 },
  { 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0 },
  { 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0 },
  { 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1 },
};

/* Une petite mélodie, gravée dans la cartouche. */
const uint8_t AIR[] = { DO4, MI4, SOL4, DO5, SOL4, MI4, RE4, SOL4 };

uint8_t defilement = 0;
uint8_t pasDeLAir = 0;
uint8_t attente = 0;
uint8_t nuanceDuFond = 0;
uint8_t meilleur = 0;
uint8_t premiereFois = 0;
uint8_t imagesRatees = 0;

/*
 * Un argument par défaut : la plupart des appels veulent le SOL, et ceux qui
 * veulent autre chose le disent.
 */
void poserRangee(uint8_t ligne, uint8_t tuile = SOL) {
  for (uint8_t x = 0; x < 32; x++) poser(x, ligne, tuile);
}

/* Le décor, dessiné une fois, écran éteint. */
void dessinerDecor() {
  ecran(0);

  poserRangee(14);
  poserRangee(15);

  for (uint8_t l = 0; l < 4; l++) {
    for (uint8_t c = 0; c < LARGEUR; c++) {
      if (MOTIF[l][c]) poser(c, 4 + l, SOL);
    }
  }

  ecran(1);
}

/* Le panneau : il ne défile pas avec le décor, et c'est tout son intérêt. */
void dessinerPanneau() {
  textePanneau(1, 0, "RECORD");
  panneau(0, 120);
}

/* Le chiffre du record, deux tuiles, dans le panneau. */
void afficherRecord() {
  poserPanneau(8, 0, 27 + meilleur / 10);
  poserPanneau(9, 0, 27 + meilleur % 10);
}

int main() {
  /* La mémoire de la cartouche : marquée à la première partie seulement. */
  if (sauvegarde(0) != MARQUE) {
    sauver(0, MARQUE);
    sauver(1, 0);
    premiereFois = 1;
  }

  meilleur = sauvegarde(1);
  if (meilleur < 99) {
    meilleur++;
    sauver(1, meilleur);
  }

  dessinerDecor();
  dessinerPanneau();
  afficherRecord();

  /* Le tirage est semé avec l'horloge : deux parties ne se ressemblent pas. */
  semer(images());

  while (true) {
    image();

    if (retard()) imagesRatees++;

    /* Quatre lutins, chacun avec ses options — dont trois qui n'existaient
       pas : le miroir vertical, la priorité derrière le décor, la seconde
       palette. */
    sprite16(0, 24, 40, HEROS);
    sprite16(4, 56, 40, HEROS, MIROIR_X);
    sprite16(8, 88, 40, HEROS, MIROIR_Y);
    sprite16(12, 120, 40, HEROS, MIROIR_X | MIROIR_Y);
    sprite(16, 76, 100, SOL, DERRIERE);
    sprite(17, 92, 100, SOL, PALETTE1);

    /* Le décor glisse ; le panneau, lui, ne bouge pas d'un pixel. */
    defilement++;
    defiler(defilement, 0);

    attente++;

    if (attente > 24) {
      attente = 0;

      note(1, AIR[pasDeLAir], 20, 10);
      note(2, AIR[pasDeLAir] - 12, 20, 5);
      pasDeLAir++;

      if (pasDeLAir >= sizeof(AIR)) {
        pasDeLAir = 0;
        bruit(6, 12);

        /* Les nuances changent : sans palette réglable, rien de tout cela
           n'était possible — ni fondu, ni clignotement. */
        nuanceDuFond++;
        if (nuanceDuFond > 3) nuanceDuFond = 0;
        paletteFond(nuanceDuFond, 1, 2, 3);
      }
    }

    if (bouton(START)) {
      silence(1);
      silence(2);
      paletteFond(0, 1, 2, 3);
    }
  }

  return 0;
}

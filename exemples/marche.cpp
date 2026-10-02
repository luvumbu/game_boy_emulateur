/*
 * Une marche entraînante, dans l'idiome des consoles huit bits.
 *
 *   node gb3.mjs exemples/marche.cpp
 *   node verifier-marche.mjs
 *
 * Ce thème est ORIGINAL. Ce qui est repris, ce n'est pas une mélodie, ce sont
 * les procédés — et ils n'appartiennent à personne :
 *
 *   - une mélodie en croches détachées, dans l'octave 4-5, là où la voix carrée
 *     de la console est la plus claire ;
 *   - une basse qui « pompe » : fondamentale, quinte, fondamentale, quinte, une
 *     note par temps, deux octaves plus bas ;
 *   - une note chromatique de passage — le DOD5 de la septième ligne — qui
 *     appuie le retour sur la tonique ;
 *   - une percussion sur la voix du bruit, sur les temps 2 et 4.
 *
 * Les deux voix comptent le MÊME nombre de pas. C'est ce qui les garde
 * ensemble : chaque voix avance de son côté, une fois par image, et rien ne les
 * resynchronise. Deux airs de longueurs différentes se décalent lentement, et
 * l'on cherche longtemps pourquoi la basse « glisse ».
 */

/* La mélodie : quatre phrases de deux mesures. Elle monte, redescend, monte
   plus haut, puis rentre à la maison. */

#include <Air>       // un air de musique, note par note
#include <Tuile>     // un dessin de 8 × 8 pixels
#include <bruit>     // joue un bruit
#include <poser>     // pose une tuile sur une case du fond
#include <jouer>     // joue un air tout seul
#include <texte>     // écrit un texte à l’écran
#include <bouton>    // lit un bouton de la manette
#include <silence>   // fait taire une voix
#include <nombre>    // écrit un nombre en chiffres
#include <airFini>   // dit si un air est fini

Air MELODIE = {
  "SOL4 12", "==",      "DO5 12",  "==",      "MI5 12",  "==",      "SOL5 13", "==",
  "MI5 12",  "==",      "DO5 12",  "==",      "RE5 12",  "==",      "==",      "==",
  "FA5 12",  "==",      "MI5 12",  "==",      "RE5 12",  "==",      "DO5 12",  "==",
  "SI4 11",  "==",      "RE5 11",  "==",      "DO5 12",  "==",      "==",      "--",

  "LA4 12",  "==",      "DO5 12",  "==",      "FA5 12",  "==",      "LA5 13",  "==",
  "SOL5 12", "==",      "MI5 12",  "==",      "FA5 12",  "==",      "==",      "==",
  "MI5 12",  "==",      "RE5 12",  "==",      "DOD5 12", "==",      "RE5 12",  "==",
  "SOL4 12", "==",      "SI4 11",  "==",      "DO5 12",  "==",      "==",      "--",
};

/* La basse : une note par temps, fondamentale et quinte en alternance. C'est
   elle qui donne l'allure de marche — la mélodie seule flotterait. */
Air BASSE = {
  "DO2 9",   "==",      "SOL2 9",  "==",      "DO2 9",   "==",      "SOL2 9",  "==",
  "DO2 9",   "==",      "SOL2 9",  "==",      "SOL2 9",  "==",      "RE3 9",   "==",
  "FA2 9",   "==",      "DO3 9",   "==",      "FA2 9",   "==",      "DO3 9",   "==",
  "SOL2 9",  "==",      "RE3 9",   "==",      "DO2 9",   "==",      "==",      "--",

  "FA2 9",   "==",      "DO3 9",   "==",      "FA2 9",   "==",      "DO3 9",   "==",
  "DO2 9",   "==",      "SOL2 9",  "==",      "DO2 9",   "==",      "SOL2 9",  "==",
  "LA2 9",   "==",      "MI3 9",   "==",      "RE2 9",   "==",      "LA2 9",   "==",
  "SOL2 9",  "==",      "SI2 9",   "==",      "DO2 9",   "==",      "==",      "--",
};

/* La fanfare de fin : elle ne boucle pas, elle conclut. */
Air FANFARE = {
  "DO5 14",  "==",      "MI5 14",  "==",      "SOL5 14", "==",      "DO6 15",  "==",
  "==",      "==",      "SOL5 14", "==",      "DO6 15",  "==",      "==",      "--",
};

const uint8_t PAS = 6;          /* images par pas : le tempo */
const uint8_t TEMPS = PAS * 2;  /* un temps de la mesure, en images */

Tuile NOTE = {
  "...##...",
  "...###..",
  "...#.#..",
  "...#.#..",
  ".###.#..",
  "####.#..",
  "###.....",
  ".##.....",
};

Tuile BARRE = {
  "########",
  "########",
  "........",
  "........",
  "........",
  "........",
  "........",
  "........",
};

uint8_t depuis = 0;   /* images écoulées depuis le dernier temps */
uint8_t temps = 0;    /* le temps de la mesure : 0, 1, 2, 3 */
uint8_t mesures = 0;  /* combien de mesures ont passé */
uint8_t joue = 1;
uint8_t avantA = 0;
uint8_t avantB = 0;

/*
 * La percussion, sur les temps 2 et 4.
 *
 * Elle n'est pas dans un « Air » : la voix du bruit n'a pas de hauteur, donc
 * pas de partition. On la frappe depuis la boucle, au temps voulu — et c'est
 * exactement ainsi qu'on procédait sur la console.
 */
void frapper() {
  /* La durée compte : mesurée, « bruit(3, …) » s'éteint AVANT la fin de
     l'image où on l'a frappé — on ne l'entend pas, et rien ne le dit. Il en
     faut une dizaine pour un coup sec, une vingtaine pour une caisse. */
  if (temps == 1) bruit(10, 8);
  if (temps == 3) bruit(18, 11);
}

/* Un témoin qui bat sur le premier temps : de quoi VOIR la mesure passer. */
void montrerLeTemps() {
  for (uint8_t i = 0; i < 4; i++) poser(6 + i * 2, 9, 0);
  poser(6 + temps * 2, 9, temps == 0 ? BARRE : NOTE);
}

void lancer() {
  jouer(1, MELODIE, PAS);
  jouer(2, BASSE, PAS);
  joue = 1;
  temps = 0;
  depuis = 0;
}

int main() {
  /* Dix-neuf caractères commencés en colonne 2 finissent en colonne 20 —
     une de trop, et le « E » de RELANCE tombe hors de l'écran. L'écran fait
     vingt colonnes, de 0 à 19 : c'est la colonne de DÉPART qu'il faut
     reculer, pas le mot qu'il faut raccourcir. */
  texte(4, 3, "UNE MARCHE");
  texte(1, 6, "A ARRETE  B RELANCE");
  texte(1, 8, "SELECT  LA FANFARE");
  texte(1, 14, "MESURES");

  lancer();

  while (true) {
    uint8_t a = bouton(A);
    uint8_t b = bouton(B);
    uint8_t s = bouton(SELECT);

    if (a && !avantA && joue) { silence(1); silence(2); joue = 0; }
    if (b && !avantB && !joue) lancer();
    if (s && joue) { silence(2); jouer(1, FANFARE, PAS); joue = 0; }
    avantA = a;
    avantB = b;

    /*
     * Le temps se compte en TOURS DE BOUCLE, et non avec « images() % 12 ».
     *
     * Le corps de cette boucle écrit à l'écran : il déborde d'une image de
     * temps en temps, et un multiple serait alors enjambé — la percussion
     * sauterait un temps sans qu'on sache pourquoi.
     */
    depuis++;
    if (depuis >= TEMPS) {
      depuis = 0;
      temps++;
      if (temps >= 4) { temps = 0; mesures++; nombre(10, 14, mesures); }
      if (joue) { frapper(); montrerLeTemps(); }
    }

    /* Arrivée au bout, la marche repart. La fanfare, elle, se tait. */
    if (joue && airFini(1)) lancer();

    image();
  }
}

/**
 * Les cinquante-cinq tutoriels, au format des leçons.
 *
 * Ils vivent ici plutôt que dans `lecons.js` pour une raison de lecture : ce
 * fichier-là faisait déjà mille huit cents lignes, et l'on ne retrouve rien
 * dans un fichier de quatre mille. Ils n'en sont pas moins des leçons — même
 * forme, même contrôle exécuté dans l'émulateur, même tri par difficulté. Le
 * seul endroit qui les distingue est `provenance`, et il ne sert qu'à savoir
 * d'où vient une leçon quand on la corrige.
 *
 * Ils COMPLÈTENT les vingt-cinq écrites d'abord. Là où un sujet était déjà
 * traité, le tutoriel prend un autre angle plutôt que de le redire : le front
 * d'un bouton est introduit ici en gardant l'état d'avant, et approfondi
 * là-bas par ce qui arrive quand on l'oublie. C'est ce qui permet aux deux de
 * se suivre sans que le lecteur ait l'impression de relire.
 *
 * `TUTORIELS.md` est ENGENDRÉ à partir d'ici — voir `tutoriels.mjs`. Une
 * source, deux sorties : la page et le fichier. Recopier les cinquante à la
 * main dans un markdown, c'était garantir qu'un jour l'un des deux mentirait.
 */

export const TUTORIELS = [

  /* ------------------------------------------ 1 — les tout premiers pas */

  {
    titre: 'Un carré de 8 × 8',
    difficulte: 1,
    provenance: 'tutoriel',
    idee: 'Une case de l’écran est un carré de 8 × 8 pixels : on en pose un.',
    texte: [
      'Chaque case de l’écran est un **carré de 8 × 8 pixels**, qu’on appelle une **tuile**. Une lettre est une tuile ; ce carré aussi.',
      '`Tuile CARRE = { … };` dessine la tuile : **8 lignes de 8 chiffres**, un chiffre par pixel. `3` est la nuance la plus foncée, `0` la plus claire.',
      '`poser(colonne, ligne, CARRE)` pose la tuile dans une case. L’écran fait 20 × 18 cases, soit **160 × 144 pixels**.',
      '**Les lignes `#include <…>`, en haut,** disent ce que le programme emploie de la console : `#include <Tuile>` pour dessiner une tuile, `#include <poser>` pour la poser. Aucune fonction de la console n’est là d’office : chacune prend de la **place dans la cartouche**, et ne s’emploie que si on l’**inclut**, par son nom écrit comme dans le programme. Sans la ligne, le compilateur refuse, et dit laquelle écrire. Une ligne de trop ne coûte rien.',
    ],
    code: `// CE PROGRAMME : pose un carré noir de 8 × 8 pixels au milieu de l'écran.
//
// « // » commence un commentaire : la console ne le lit pas.
//
// Une TUILE est un petit dessin de 8 × 8 pixels.
// Chaque texte entre guillemets est une rangée de 8 pixels.
// Chaque chiffre est un pixel : 0 = le plus clair, 1, 2, 3 = le plus foncé.

// Un carré de 8 × 8 pixels : 8 lignes de 8 chiffres.
// 3 = pixel le plus foncé.

#include <Tuile>   // un dessin de 8 × 8 pixels
#include <poser>   // pose une tuile sur une case du fond

Tuile CARRE = {
  "33333333",
  "33333333",
  "33333333",
  "33333333",
  "33333333",
  "33333333",
  "33333333",
  "33333333",
};

int main() {            // main = « principal » : le jeu commence ICI.
  poser(9, 8, CARRE);   // colonne 9, ligne 8 : le milieu de l'écran
                        // L'écran a 20 colonnes (0 à 19) et 18 lignes (0 à 17).
                        // Le « ; » termine l'instruction, comme un point en fin de phrase.

  while (true) image(); // garde l'écran affiché :
                        // while (true) répète pour toujours ; image() attend l'image suivante.
}                       // Fin de main.
`,
    aVoir: 'Un carré noir de 8 × 8 au milieu de l’écran.',
    controle: (c) => [
      ['le carré est posé en (9, 8)', c.lire(9, 8) === 44],
      ['il est seul : la case d’à côté est vide', c.lire(10, 8) === 0],
      ['l’écran est allumé', c.ecranAllume()],
    ],
  },

  {
    titre: 'Écrire à plusieurs endroits',
    difficulte: 1,
    provenance: 'tutoriel',
    idee: 'La position est un calcul comme un autre.',
    texte: [
      'Trois appels, trois endroits. Rien de neuf — sauf ceci : la colonne et la ligne **ne sont pas obligées d’être écrites en clair**.',
      '`texte(4 + 2, 8, "…")` marche, et `texte(x, y, "…")` avec des variables aussi. C’est ce qui rendra possible tout ce qui bouge.',
    ],
    code: `// CE PROGRAMME : écrit trois textes à trois endroits de l'écran.
//
// texte(colonne, ligne, "MOT") écrit un mot à l'écran.
//   colonne : de 0 (tout à gauche) à 19 (tout à droite)
//   ligne   : de 0 (tout en haut)  à 17 (tout en bas)
// Les lettres permises : A à Z (majuscules, sans accents), 0 à 9, l'espace et ! ? . - : # |

#include <texte>   // écrit un texte à l’écran

int main() {                          // Le jeu commence ici.
  texte(0, 0, "EN HAUT A GAUCHE");    // colonne 0, ligne 0 : le coin en haut à gauche
  texte(4, 8, "AU MILIEU");           // colonne 4, ligne 8 : à peu près au milieu
  texte(2, 17, "TOUT EN BAS");        // ligne 17 : la dernière ligne

  while (true) {                      // Répète pour toujours :
    image();                          //   attend l'image suivante (60 par seconde).
  }                                   // Sans cette boucle, le programme s'arrêterait.
}
`,
    aVoir: 'Trois lignes, en haut, au milieu et tout en bas.',
    controle: (c) => [
      ['la première touche le coin', c.mot(0, 0, 16) === 'EN HAUT A GAUCHE'],
      ['la deuxième est au milieu', c.mot(4, 8, 9) === 'AU MILIEU'],
      ['la troisième est sur la dernière ligne', c.mot(2, 17, 11) === 'TOUT EN BAS'],
    ],
  },

  {
    titre: 'Une constante plutôt qu’un nombre',
    difficulte: 1,
    provenance: 'tutoriel',
    idee: 'Nommer ne coûte rien du tout — et c’est la seule chose ici qui soit gratuite.',
    texte: [
      'Un nombre écrit trois fois, ce sont **trois occasions de le changer à deux endroits**. Une `const` lui donne un nom.',
      'Et elle **ne prend aucun octet de mémoire**. Elle est connue à la compilation : le compilateur remplace `COLONNE` par `5` dans le code machine, et il n’en reste rien dans la cartouche.',
      'Comparer les deux compilations le montre — le nombre de variables annoncé ne bouge pas.',
    ],
    code: `// CE PROGRAMME : écrit BONJOUR, et ENCORE deux lignes plus bas,
// à une place donnée par deux CONSTANTES.
//
// Une constante est un nombre auquel on donne un nom, et qui ne change jamais.
//   const uint8_t COLONNE = 5;
//     const   = « constant » : on ne pourra pas le modifier
//     uint8_t = un nombre entier de 0 à 255
// Pour tout déplacer, il suffit de changer le nombre ici, une seule fois.

#include <texte>   // écrit un texte à l’écran

const uint8_t COLONNE = 5;            // La colonne des deux textes.
const uint8_t LIGNE = 6;              // La ligne du premier texte.

int main() {                          // Le jeu commence ici.
  texte(COLONNE, LIGNE, "BONJOUR");        // en colonne 5, ligne 6
  texte(COLONNE, LIGNE + 2, "ENCORE");     // LIGNE + 2 = 6 + 2 = 8 : deux lignes plus bas

  while (true) {                      // Répète pour toujours :
    image();                          //   attend l'image suivante.
  }
}
`,
    aVoir: '« BONJOUR » puis « ENCORE », deux lignes plus bas.',
    controle: (c) => [
      ['« BONJOUR » est à la colonne nommée', c.mot(5, 6, 7) === 'BONJOUR'],
      ['« ENCORE » est deux lignes plus bas', c.mot(5, 8, 6) === 'ENCORE'],
    ],
  },

  {
    titre: 'Réécrire au bout d’une seconde',
    difficulte: 1,
    provenance: 'tutoriel',
    idee: 'Compter des images est l’horloge la plus simple qu’on ait.',
    texte: [
      'La console affiche **soixante images par seconde**. Une boucle qui appelle `image()` soixante fois a donc laissé passer une seconde — sans minuteur, sans rien d’autre.',
      'L’écran ne s’efface pas tout seul : pour ôter un mot, on écrit **autant d’espaces qu’il avait de lettres**. Un espace de moins, et la dernière lettre reste toute seule.',
    ],
    code: `// CE PROGRAMME : écrit PREMIER MOT, attend une seconde, puis le remplace
// par SECOND MOT.
//
// La console montre 60 images par seconde. image() attend la suivante.
// Donc attendre 60 images = attendre une seconde.

#include <texte>   // écrit un texte à l’écran

int main() {                                // Le jeu commence ici.
  texte(4, 6, "PREMIER MOT");               // Le premier texte (11 signes).
  for (uint8_t i = 0; i < 60; i++) image(); // Attend 60 images = 1 seconde.
                                            // for (départ ; condition ; pas) :
                                            //   i part de 0, on continue tant que i < 60,
                                            //   i++ ajoute 1 à chaque tour → 60 tours.

  texte(4, 6, "           ");               // 11 espaces : efface PREMIER MOT.
                                            // (L'écran garde ce qu'on y a écrit ;
                                            //  pour effacer, on écrit des espaces.)
  texte(4, 6, "SECOND MOT");                // Le nouveau texte, au même endroit.

  while (true) {                            // Répète pour toujours :
    image();                                //   attend l'image suivante.
  }
}
`,
    aVoir: '« PREMIER MOT » une seconde, puis « SECOND MOT » à sa place.',
    controle: (c) => {
      const debut = c.mot(4, 6, 11)
      c.avancer(70)
      return [
        ['« PREMIER MOT » s’affiche d’abord', debut === 'PREMIER MOT'],
        ['puis « SECOND MOT » prend sa place', c.mot(4, 6, 10) === 'SECOND MOT'],
        ['et rien du premier ne dépasse', c.mot(4, 6, 11).trimEnd() === 'SECOND MOT'],
      ]
    },
  },

  {
    titre: 'Un nombre à l’écran',
    difficulte: 1,
    provenance: 'tutoriel',
    idee: '`texte` écrit des lettres ; `nombre` écrit un calcul.',
    texte: [
      '`texte()` ne sait écrire que ce qui est entre guillemets, décidé à la compilation. **Un score qui change veut `nombre()`.**',
      '`nombre(colonne, ligne, valeur)` écrit en base dix, sur **trois chiffres par défaut** — `042`. Un quatrième argument dit combien on en veut : `nombre(8, 4, vies, 1)` écrit `3` tout seul.',
    ],
    code: `// CE PROGRAMME : affiche deux nombres rangés dans des variables : les vies et le score.
//
// Une VARIABLE est une case de mémoire qui porte un nom.
//   uint8_t vies = 3;  → crée une case « vies » (un nombre de 0 à 255) et y range 3.
// nombre(colonne, ligne, valeur) écrit un nombre à l'écran, sur 3 chiffres (003).
// nombre(colonne, ligne, valeur, 1) l'écrit sur 1 seul chiffre (3).

#include <texte>    // écrit un texte à l’écran
#include <nombre>   // écrit un nombre en chiffres

int main() {                  // Le jeu commence ici.
  uint8_t vies = 3;           // Une case « vies » qui contient 3.
  uint8_t score = 42;         // Une case « score » qui contient 42.

  texte(2, 4, "VIES");        // Le mot VIES...
  nombre(8, 4, vies, 1);      // ... et la valeur de vies, sur 1 chiffre : 3.

  texte(2, 6, "SCORE");       // Le mot SCORE...
  nombre(8, 6, score);        // ... et la valeur de score, sur 3 chiffres : 042.

  while (true) {              // Répète pour toujours :
    image();                  //   attend l'image suivante.
  }
}
`,
    aVoir: '« VIES 3 » et « SCORE 042 ».',
    controle: (c) => [
      ['un seul chiffre quand on le demande', c.mot(8, 4, 1) === '3'],
      ['trois chiffres par défaut, zéros compris', c.mot(8, 6, 3) === '042'],
      ['les étiquettes sont là', c.mot(2, 4, 4) === 'VIES' && c.mot(2, 6, 5) === 'SCORE'],
    ],
  },

  {
    titre: 'Effacer sans compter les lettres',
    difficulte: 1,
    provenance: 'tutoriel',
    idee: 'Le compilateur connaît la longueur du texte. Autant qu’il la compte.',
    texte: [
      'Écrire des espaces par-dessus **est** l’effacement — l’espace est la tuile 0. Mais il en faut **autant que de lettres** : un de moins laisse la dernière orpheline, un de plus mange la case d’à côté. Ni l’un ni l’autre n’est signalé, puisque écrire des espaces est parfaitement légal.',
      'Or le compilateur **connaît** cette longueur : il la lit dans les guillemets, ou dans la table nommée. La compter soi-même, c’était se donner une occasion de se tromper que rien n’obligeait à prendre.',
      '`effacer(colonne, ligne, quoi)` accepte les **trois** façons de dire combien : le texte lui-même, le nom d’un `const char`, ou un nombre — calculé s’il le faut. Et `effacer(…, 0)` n’efface **aucune** case, ce qui n’allait pas de soi : sur un octet, décompter à partir de zéro donne 255.',
      '`effacerPanneau()` fait de même sur le panneau — sans argument il le vide entièrement, à trois arguments il n’ôte qu’un mot.',
    ],
    code: `// CE PROGRAMME : écrit quatre textes, attend un moment, puis en efface trois
// avec effacer() — sans avoir à compter les lettres soi-même.
//
// effacer(colonne, ligne, QUOI) écrit des espaces à la place d'un texte :
//   avec un texte entre guillemets : autant d'espaces que de lettres ;
//   avec un nombre : ce nombre d'espaces.

#include <texte>     // écrit un texte à l’écran
#include <effacer>   // efface des cases, ou tout le fond

const char FIN[] = "GAME OVER";   // Un texte qui porte un nom : FIN.
                                  // const char ...[] = un texte gravé qui ne change pas.

int main() {                      // Le jeu commence ici.
  texte(2, 4, "BONJOUR");         // Quatre textes, sur les lignes 4, 6, 8 et 10.
  texte(2, 6, FIN);               // On peut écrire un texte par son nom.
  texte(2, 8, "ABCDEF");
  texte(2, 10, "JE RESTE");

  for (uint8_t i = 0; i < 90; i++) image();   // Attend 90 images = une seconde et demie.

  effacer(2, 4, "BONJOUR");   // sept cases, comptées pour nous
  effacer(2, 6, FIN);         // neuf, lues dans la table nommée
  uint8_t combien = 3;        // Un nombre choisi pendant le jeu...
  effacer(2, 8, combien);     // trois, décidées à l'exécution : ABCDEF devient    DEF
                              // JE RESTE, lui, n'est pas effacé.

  while (true) {              // Répète pour toujours :
    image();                  //   attend l'image suivante.
  }
}
`,
    aVoir: 'Trois lignes s’effacent au bout d’une seconde et demie ; « JE RESTE » ne bouge pas, et « DEF » survit.',
    controle: (c) => {
      const avant = c.mot(2, 4, 7)
      c.avancer(100)
      return [
        ['le texte est là au départ', avant === 'BONJOUR'],
        ['effacer("…") ôte exactement sa longueur', c.mot(2, 4, 8) === '        '],
        ['un texte nommé aussi', c.mot(2, 6, 10) === '          '],
        ['un nombre calculé n’ôte que ce nombre', c.mot(2, 8, 6) === '   DEF'],
        ['et rien d’autre n’est touché', c.mot(2, 10, 8) === 'JE RESTE'],
      ]
    },
  },

  /* --------------------------------------------- 2 — retenir, et réagir */

  {
    titre: 'Un compteur qui déborde à 255',
    difficulte: 2,
    provenance: 'tutoriel',
    idee: 'Ce n’est pas un bogue : c’est ce que fait un octet.',
    texte: [
      '`uint8_t` est **un octet** : de 0 à 255. À 255, `compteur++` ramène à 0 — et tout le projet est bâti là-dessus.',
      'L’ordre compte. `image()` est **à la fin** : on dessine, puis on attend. Mettre l’attente en premier ferait sauter la première image.',
      'Laisser tourner quelques secondes suffit à voir le compteur repasser par zéro.',
    ],
    code: `// CE PROGRAMME : un compteur qui monte de 1 à chaque image : 0, 1, 2 ... 255,
// puis il repart à 0.
//
// Pourquoi 255 ? Un uint8_t tient sur 8 bits : 256 valeurs, de 0 à 255.
// 255 + 1 ne tient pas : la case « déborde » et revient à 0,
// comme un compteur kilométrique.

#include <nombre>   // écrit un nombre en chiffres

int main() {                  // Le jeu commence ici.
  uint8_t compteur = 0;       // Une case « compteur » qui commence à 0.

  while (true) {              // Répète pour toujours :
    nombre(8, 8, compteur);   //   affiche le compteur (3 chiffres),
    compteur++;               //   ajoute 1 (« ++ » = « compteur = compteur + 1 »),
    image();                  //   attend l'image suivante.
  }                           // 60 images par seconde : il fait le tour en 4 secondes environ.
}
`,
    aVoir: 'Un nombre qui monte, et qui repart de 000 après 255.',
    controle: (c) => {
      const debut = c.variable('compteur')
      c.avancer(40)
      const apres = c.variable('compteur')
      c.avancer(255)
      return [
        ['le compteur monte', apres > debut, ` (${debut} → ${apres})`],
        ['il reste dans un octet', c.variable('compteur') <= 255],
        ['et il est affiché', c.mot(8, 8, 3).trim().length === 3],
      ]
    },
  },

  {
    titre: 'Un dé, et le hasard du matériel',
    difficulte: 2,
    provenance: 'tutoriel',
    idee: 'hasard() ne tire pas pile ou face : il lit un compteur qui tourne tout seul.',
    texte: [
      '`hasard()` rend un octet imprévisible, de 0 à 255 — pas déjà réparti entre 1 et 6. Le reste d’une division, `hasard() % 6`, ramène ça entre 0 et 5 ; il suffit d’ajouter 1 pour une face de dé.',
      '`semer(images())` est appelé une seule fois, au tout début. Sans lui, la console partirait toujours du même point : son horloge interne n’a pas encore tourné à l’instant où le jeu démarre, et deux parties de suite tireraient la même suite.',
      'Le dé ne se relance qu’au front de A, comme la leçon « Se souvenir de l’état d’avant » — sans lui, tenir A referait tourner le dé soixante fois par seconde, bien trop vite pour le lire.',
    ],
    code: `// CE PROGRAMME : un dé. Chaque appui sur A lance le dé (une face de 1 à 6)
// et compte les lancers.
//
// hasard() rend un nombre imprévisible de 0 à 255.
// hasard() % 6 garde le reste de la division par 6 : de 0 à 5. On ajoute 1 : de 1 à 6.
// Exemple : hasard() rend 200 → 200 % 6 = 2 (car 6 × 33 = 198) → face 3.

#include <hasard>    // tire un nombre au hasard
#include <effacer>   // efface des cases, ou tout le fond
#include <nombre>    // écrit un nombre en chiffres
#include <semer>     // choisit le départ du hasard
#include <texte>     // écrit un texte à l’écran
#include <bouton>    // lit un bouton de la manette
#include <reste>     // a % b, sauf par 1, 2, 4, 8, 16… écrits en clair

uint8_t de = 1;               // La face affichée (1 à 6).
uint8_t avantA = 0;           // A était-elle enfoncée au tour d'avant ? (1 ou 0)
uint8_t lances = 0;           // Combien de lancers en tout.

uint8_t lancerDe() {          // Une FONCTION qui rend un nombre (uint8_t) :
  return hasard() % 6 + 1;    //   « return » donne la réponse : une face de 1 à 6.
}

void dessinerDe(uint8_t face) {   // Une fonction qui ne rend rien (void),
                                  // et qui reçoit la face à dessiner.
  effacer(8, 6, "0");         // Efface une case (autant d'espaces que de signes : un seul).
  nombre(8, 6, face, 1);      // Écrit la face sur 1 chiffre.
}

int main() {                  // Le jeu commence ici.
  semer(images());            // Mélange le hasard avec l'heure de départ, UNE fois.
                              // Sans cela, chaque partie tirerait la même suite de faces.

  texte(2, 2, "A: LANCER LE DE");
  texte(2, 4, "FACE:");
  texte(2, 9, "LANCES:");
  dessinerDe(de);             // La face de départ : 1.

  while (true) {              // La boucle du jeu :
    uint8_t a = bouton(A);    //   A enfoncée maintenant ? 1 ou 0.

    if (a && !avantA) {       //   Enfoncée maintenant ET pas au tour d'avant :
                              //   c'est le DÉBUT de l'appui (on dit « le front »).
      de = lancerDe();        //     on lance,
      dessinerDe(de);         //     on dessine la face,
      lances++;               //     un lancer de plus,
      nombre(10, 9, lances);  //     on l'affiche.
    }
    avantA = a;               //   On retient A pour le tour suivant.

    image();                  //   Attend l'image suivante.
  }
}
`,
    aVoir: 'Un dé de 1 à 6 sous FACE, qui change à chaque appui sur A ; LANCES compte les appuis.',
    controle: (c) => {
      const premiere = c.variable('de')
      const faces = []
      for (let i = 0; i < 8; i++) {
        c.presser('a', 4)
        faces.push(c.variable('de'))
      }
      const toutesValides = faces.every((f) => f >= 1 && f <= 6)
      return [
        ['un dé de départ, entre 1 et 6', premiere >= 1 && premiere <= 6, ` (${premiere})`],
        ['chaque lancer reste entre 1 et 6', toutesValides, ` (${faces.join(', ')})`],
        ['huit lancers ne rendent pas tous la même face', new Set(faces).size > 1,
          ` (${new Set(faces).size} valeurs différentes)`],
        ['le compteur de lancers suit', c.variable('lances') === 8, ` (${c.variable('lances')})`],
      ]
    },
  },

  {
    titre: 'Deux mots de même longueur',
    difficulte: 2,
    provenance: 'tutoriel',
    idee: 'Le piège du texte qui change : la fin de l’ancien reste.',
    texte: [
      '`bouton(A)` rend 1 tant que le bouton est enfoncé, 0 sinon. Les huit noms sont `A B HAUT BAS GAUCHE DROITE START SELECT`.',
      'Noter l’espace dans `"APPUYE "`. Sans lui, le mot fait six lettres et `RELACHE` en fait sept : le `E` final resterait affiché sous `APPUYE`, et l’on chercherait longtemps pourquoi.',
      '**Deux textes qui se remplacent doivent faire la même longueur.** C’est une règle, pas une précaution.',
    ],
    code: `// CE PROGRAMME : écrit APPUYE tant que A est enfoncée, RELACHE sinon.
//
// bouton(A) vaut 1 (vrai) quand la touche A est enfoncée, 0 (faux) sinon.
// if (condition) ...  else ...  : SI c'est vrai fais ceci, SINON fais cela.

#include <bouton>   // lit un bouton de la manette
#include <texte>    // écrit un texte à l’écran

int main() {                                    // Le jeu commence ici.
  while (true) {                                // Répète pour toujours :
    if (bouton(A)) texte(6, 8, "APPUYE ");      //   A enfoncée : APPUYE
                                                //   (l'espace à la fin efface le E de RELACHE)
    else           texte(6, 8, "RELACHE");      //   sinon : RELACHE (7 signes tous les deux)

    image();                                    //   Attend l'image suivante.
  }
}
`,
    aVoir: '« RELACHE », et « APPUYE » tant qu’on tient A.',
    controle: (c) => {
      const repos = c.mot(6, 8, 7)
      c.gb.setButton('a', true)
      c.avancer(6)
      const tenu = c.mot(6, 8, 7)
      c.gb.setButton('a', false)
      c.avancer(6)
      return [
        ['au repos, « RELACHE »', repos === 'RELACHE'],
        ['A enfoncé, « APPUYE »', tenu.trimEnd() === 'APPUYE'],
        ['rien de l’ancien mot ne dépasse', tenu === 'APPUYE '],
        ['relâché, « RELACHE » revient', c.mot(6, 8, 7) === 'RELACHE'],
      ]
    },
  },

  {
    titre: 'Se souvenir de l’état d’avant',
    difficulte: 2,
    provenance: 'tutoriel',
    idee: 'Compter un appui, et non soixante par seconde.',
    texte: [
      'Sans les deux lignes du milieu, `combien` monterait de **soixante par seconde** tant qu’on garde le doigt dessus : la boucle tourne soixante fois, et le bouton est enfoncé à chacun de ces tours.',
      'Garder l’état d’avant, et ne compter que le **changement** — c’est ce qu’on appelle un front. On s’en sert pour tout ce qui doit arriver **une fois** : sauter, tirer, valider un menu.',
      'La leçon « Le front, ou pourquoi un appui compte trois fois » montre ce qui arrive quand on l’oublie.',
    ],
    code: `// CE PROGRAMME : compte les appuis sur A. Un appui = +1, même si on garde
// le doigt dessus longtemps.
//
// Le problème : bouton(A) reste à 1 TANT QUE A est enfoncée (plusieurs images).
// La solution : se souvenir de l'état d'avant, et ne compter qu'au moment
// où A passe de « relâchée » à « enfoncée ». On appelle cela le FRONT.

#include <bouton>   // lit un bouton de la manette
#include <texte>    // écrit un texte à l’écran
#include <nombre>   // écrit un nombre en chiffres

int main() {                          // Le jeu commence ici.
  uint8_t combien = 0;                // Le nombre d'appuis.
  uint8_t avant = 0;                  // A était-elle enfoncée au tour d'avant ?

  while (true) {                      // Répète pour toujours :
    uint8_t maintenant = bouton(A);   //   A enfoncée maintenant ? (1 ou 0)

    // Le FRONT : enfoncé maintenant, et pas au tour d'avant.
    //   !avant = « NON avant » : vrai si avant vaut 0.
    //   && = ET : les deux doivent être vrais.
    if (maintenant && !avant) combien++;
    avant = maintenant;               //   On retient pour le tour suivant.

    texte(2, 6, "APPUIS");
    nombre(10, 6, combien);           //   Affiche le nombre d'appuis.
    image();                          //   Attend l'image suivante.
  }
}
`,
    aVoir: 'Le compteur monte de un par appui, même si l’on tient la touche.',
    controle: (c) => {
      c.presser('a', 30)
      const un = c.variable('combien')
      c.presser('a', 4)
      c.presser('a', 4)
      return [
        ['un appui long ne compte qu’une fois', un === 1, ` (${un})`],
        ['deux appuis de plus en font trois', c.variable('combien') === 3, ` (${c.variable('combien')})`],
        ['et le compte est affiché', c.mot(10, 6, 3) === '003'],
      ]
    },
  },

  {
    titre: 'Un choix, puis plusieurs',
    difficulte: 2,
    provenance: 'tutoriel',
    idee: '`&&` s’arrête dès que la réponse est connue.',
    texte: [
      '`if … else if … else` enchaîne les cas. Rien que de très ordinaire — sauf la dernière ligne.',
      '`bouton(B) && vies > 0` : si `bouton(B)` rend 0, **la partie droite n’est même pas calculée**. Ce n’est pas une finesse de compilation, c’est ce qui permet plus tard d’écrire `if (i < n && table[i] == 0)` sans lire une case hors du tableau.',
    ],
    code: `// CE PROGRAMME : 3 vies. B en retire (tant qu'on le tient) ; un message
// différent selon qu'il reste plusieurs vies, une seule, ou aucune.
//
// if ... else if ... else : on essaie les cas dans l'ordre ;
// le premier qui est vrai est fait, les autres sont sautés.
//   ==  veut dire « est égal à » (deux signes = ; un seul = veut dire « ranger dans »).

#include <texte>    // écrit un texte à l’écran
#include <bouton>   // lit un bouton de la manette

int main() {                                          // Le jeu commence ici.
  uint8_t vies = 3;                                   // On commence avec 3 vies.

  while (true) {                                      // Répète pour toujours :
    if (vies == 0)      texte(4, 8, "PERDU   ");      //   0 vie : PERDU
    else if (vies == 1) texte(4, 8, "DERNIERE");      //   sinon, 1 vie : DERNIERE
    else                texte(4, 8, "CA VA   ");      //   sinon (2 ou 3) : CA VA
                                                      //   (les espaces effacent les restes)

    if (bouton(B) && vies > 0) vies--;                //   B tenue ET il reste des vies :
                                                      //   une de moins (« -- » retire 1).
                                                      //   Si bouton(B) vaut 0, la partie
                                                      //   droite n'est même pas regardée.
    image();                                          //   Attend l'image suivante.
  }
}
`,
    aVoir: '« CA VA », puis « DERNIERE », puis « PERDU » — B après B.',
    controle: (c) => {
      const debut = c.mot(4, 8, 8)
      c.gb.setButton('b', true)
      c.avancer(30)
      c.gb.setButton('b', false)
      c.avancer(6)
      return [
        ['au départ, « CA VA »', debut.trimEnd() === 'CA VA'],
        ['B fait tomber les vies à zéro', c.variable('vies') === 0, ` (${c.variable('vies')})`],
        ['et « PERDU » s’affiche', c.mot(4, 8, 8).trimEnd() === 'PERDU'],
        ['sans jamais déborder sous zéro', c.variable('vies') !== 255],
      ]
    },
  },

  {
    titre: 'Deux touches, deux effets',
    difficulte: 2,
    provenance: 'tutoriel',
    idee: 'Un `enum` donne des noms à des nombres, et `switch` les range côte à côte.',
    texte: [
      '`TITRE` vaut 0, `JEU` vaut 1, `FIN` vaut 2 — mais **on ne l’écrit jamais**, et c’est tout l’intérêt : ajouter une scène au milieu ne renumérote rien à la main.',
      '`Scene` devient un **type d’un octet**. `Scene ou = TITRE;` se relit mieux que `uint8_t ou = 0;`, et dit ce que la variable a le droit de contenir.',
      'C’est la forme que prend presque tout jeu : quelques scènes, et un `switch` qui dit laquelle est en cours.',
    ],
    code: `// CE PROGRAMME : trois scènes. Le TITRE (START pour jouer), le JEU
// (SELECT pour finir), la FIN.
//
// enum Scene ...  : invente un type « Scene » dont les valeurs ont des noms :
//   TITRE (vaut 0), JEU (vaut 1), FIN (vaut 2).
// switch (ou) ... case X: ... break;  : saute directement au cas qui correspond
//   à la valeur de ou ; « break » sort du switch.

#include <texte>    // écrit un texte à l’écran
#include <bouton>   // lit un bouton de la manette

enum Scene { TITRE, JEU, FIN };       // Les trois scènes possibles.

int main() {                          // Le jeu commence ici.
  Scene ou = TITRE;                   // La scène actuelle : on commence au titre.

  while (true) {                      // Répète pour toujours :
    switch (ou) {                     //   Selon la scène :
      case TITRE:                     //   --- au titre :
        texte(4, 8, "APPUIE START");
        if (bouton(START)) { texte(4, 8, "            "); ou = JEU; }
                                      //     START : on efface (12 espaces), et on passe au JEU.
        break;
      case JEU:                       //   --- pendant le jeu :
        texte(4, 8, "ON JOUE     ");
        if (bouton(SELECT)) ou = FIN; //     SELECT : on passe à la FIN.
        break;
      case FIN:                       //   --- à la fin :
        texte(4, 8, "C EST FINI  ");  //     on reste ici pour toujours.
        break;
    }
    image();                          //   Attend l'image suivante.
  }
}
`,
    aVoir: 'START passe au jeu, SELECT y met fin.',
    controle: (c) => {
      const titre = c.mot(4, 8, 12)
      c.presser('start', 6)
      const jeu = c.mot(4, 8, 12)
      c.presser('select', 6)
      return [
        ['on démarre sur le titre', titre === 'APPUIE START'],
        ['START passe au jeu', jeu.trimEnd() === 'ON JOUE'],
        ['SELECT y met fin', c.mot(4, 8, 12).trimEnd() === 'C EST FINI'],
        ['et l’on y reste', (c.avancer(30), c.mot(4, 8, 12).trimEnd()) === 'C EST FINI'],
      ]
    },
  },

  /* --------------------------------------------------- 3 — dessiner */

  {
    titre: 'Poser une tuile',
    difficulte: 3,
    provenance: 'tutoriel',
    idee: 'Une lettre à l’écran est une tuile comme une autre.',
    texte: [
      'Les deux lignes affichent la même chose. `texte()` **traduit des lettres en numéros de tuiles** ; `poser(colonne, ligne, tuile)` pose le numéro directement.',
      'La tuile 1 est le `A` de la police fournie, la 2 est un `B`. Il n’y a pas de magie : dessiner sa propre tuile, ce sera **ajouter un numéro à cette même suite**.',
      '`lire(colonne, ligne)` fait l’inverse — il rend le numéro affiché à cet endroit. C’est ce qui servira pour les collisions.',
    ],
    code: `// CE PROGRAMME : montre que texte() et poser() dessinent la même chose.
//
// L'écran est une grille de cases. Chaque case contient le NUMÉRO d'une tuile
// (un petit dessin de 8 × 8 pixels). Les lettres sont des tuiles comme les autres :
// la tuile 1 est le A, la tuile 2 le B, la tuile 3 le C.
//   texte()  traduit des lettres en numéros de tuiles.
//   poser(colonne, ligne, numéro) pose un numéro directement.

#include <texte>   // écrit un texte à l’écran
#include <poser>   // pose une tuile sur une case du fond

int main() {                          // Le jeu commence ici.
  texte(2, 4, "AVEC TEXTE  ABC");     // ABC écrit avec texte()...

  texte(2, 8, "AVEC POSER");
  poser(14, 8, 1);                    // ... et ABC posé à la main : tuile 1 = A,
  poser(15, 8, 2);                    //                             tuile 2 = B,
  poser(16, 8, 3);                    //                             tuile 3 = C.

  while (true) {                      // Répète pour toujours :
    image();                          //   attend l'image suivante.
  }
}
`,
    aVoir: 'Le même « ABC » sur les deux lignes.',
    controle: (c) => [
      ['texte() écrit ABC', c.mot(14, 4, 3) === 'ABC'],
      ['poser() écrit le même ABC', c.mot(14, 8, 3) === 'ABC'],
      ['ce sont bien les mêmes numéros', c.lire(14, 4) === c.lire(14, 8)],
      ['lire() les retrouve', c.lire(14, 8) === 1 && c.lire(16, 8) === 3],
    ],
  },

  {
    titre: 'Quatre nuances, quatre signes',
    difficulte: 3,
    provenance: 'tutoriel',
    idee: 'Une tuile s’écrit en huit rangées de huit caractères.',
    texte: [
      '**`.` clair, `-` moyen clair, `+` moyen sombre, `#` sombre.** On peut aussi écrire `0123` — c’est la même chose.',
      'Le nom `BRIQUE` **devient un numéro de tuile** : il s’écrit partout où l’on attend un numéro. Le compilateur grave les seize octets dans la cartouche et range la tuile à sa place au démarrage.',
      'Dans la page, cette même tuile se dessine **à la souris** — l’atelier écrit exactement ces huit lignes dans le programme. Les deux chemins mènent au même endroit.',
    ],
    code: `// CE PROGRAMME : dessine sa propre tuile, une BRIQUE, et en pose une rangée.
//
// Une tuile : 8 rangées de 8 pixels. Chaque signe est un pixel, en 4 nuances :
//   .  clair      -  moyen clair      +  moyen sombre      #  sombre
//   (on peut aussi écrire 0 1 2 3 : c'est la même chose)
// Le nom BRIQUE devient un NUMÉRO de tuile, utilisable avec poser().

#include <Tuile>   // un dessin de 8 × 8 pixels
#include <poser>   // pose une tuile sur une case du fond

Tuile BRIQUE = {
  "########",
  "#..#..#.",
  "########",
  "..#..#..",
  "########",
  "#..#..#.",
  "########",
  "..#..#..",
};

int main() {                                           // Le jeu commence ici.
  for (uint8_t x = 0; x < 20; x++) poser(x, 12, BRIQUE);
                                                       // for : x va de 0 à 19 (20 tours).
                                                       // À chaque tour : une brique en
                                                       // colonne x, ligne 12. Toute la ligne.

  while (true) {                                       // Répète pour toujours :
    image();                                           //   attend l'image suivante.
  }
}
`,
    aVoir: 'Une rangée de briques en travers de l’écran.',
    dessin: true,
    controle: (c) => {
      const tuile = c.lire(0, 12)
      return [
        ['la rangée est posée d’un bord à l’autre',
          [0, 5, 10, 19].every((x) => c.lire(x, 12) === tuile)],
        ['ce n’est pas une lettre de la police', c.mot(0, 12, 1) === '?', ` (n° ${tuile})`],
        ['le reste de l’écran est vide', c.lire(0, 11) === 0 && c.lire(0, 13) === 0],
      ]
    },
  },

  {
    titre: 'Une rangée, puis un mur',
    difficulte: 3,
    provenance: 'tutoriel',
    idee: 'Quatre-vingts appels en quatre lignes.',
    texte: [
      'Écrire les quatre-vingts `poser()` à la main, ce sont quatre-vingts occasions de se tromper d’une case — et le jour où l’écran change de taille, il faut tout relire.',
      'Deux boucles pour les bords horizontaux, deux pour les verticaux. Les coins sont posés deux fois : cela ne coûte rien, et l’écrire autrement demanderait quatre conditions.',
    ],
    code: `// CE PROGRAMME : dessine un mur tout autour de l'écran, et écrit ENFERME au milieu.
//
// Une tuile MUR : un bord sombre (#) et un intérieur moyen clair (-).
// Deux boucles for posent les murs : une pour le haut et le bas,
// une pour la gauche et la droite.

#include <Tuile>   // un dessin de 8 × 8 pixels
#include <poser>   // pose une tuile sur une case du fond
#include <texte>   // écrit un texte à l’écran

Tuile MUR = {
  "########",
  "#------#",
  "#------#",
  "#------#",
  "#------#",
  "#------#",
  "#------#",
  "########",
};

int main() {                    // Le jeu commence ici.
  for (uint8_t x = 0; x < 20; x++) { poser(x, 0, MUR); poser(x, 17, MUR); }
                                // x = 0 à 19 : chaque colonne reçoit un mur
                                // en haut (ligne 0) ET en bas (ligne 17).
                                // Les accolades regroupent les deux poser() :
                                // la boucle répète les deux.
  for (uint8_t y = 0; y < 18; y++) { poser(0, y, MUR); poser(19, y, MUR); }
                                // y = 0 à 17 : chaque ligne reçoit un mur
                                // à gauche (colonne 0) ET à droite (colonne 19).

  texte(6, 8, "ENFERME");       // Le mot au milieu.

  while (true) {                // Répète pour toujours :
    image();                    //   attend l'image suivante.
  }
}
`,
    aVoir: 'Un cadre tout autour de l’écran, et « ENFERME » au milieu.',
    dessin: true,
    controle: (c) => {
      const mur = c.lire(0, 0)
      return [
        ['les quatre coins sont posés',
          [[0, 0], [19, 0], [0, 17], [19, 17]].every(([x, y]) => c.lire(x, y) === mur)],
        ['le haut et le bas sont pleins',
          [3, 9, 15].every((x) => c.lire(x, 0) === mur && c.lire(x, 17) === mur)],
        ['les côtés aussi',
          [4, 9, 14].every((y) => c.lire(0, y) === mur && c.lire(19, y) === mur)],
        ['le milieu est resté libre', c.mot(6, 8, 7) === 'ENFERME'],
      ]
    },
  },

  {
    titre: 'Un damier',
    difficulte: 3,
    provenance: 'tutoriel',
    idee: 'Le reste d’une division, et le motif apparaît.',
    texte: [
      '`(x + y) % 2` vaut 0 une case sur deux, en quinconce — c’est la définition même d’un damier, et elle tient en trois caractères.',
      '`a ? b : c` choisit en une expression. On aurait pu écrire un `if` sur quatre lignes ; ici la ligne dit « pose ceci ou cela », et c’est ce qu’on veut lire.',
    ],
    code: `// CE PROGRAMME : remplit tout l'écran d'un damier, cases claires et sombres.
//
// Deux tuiles : CLAIR (tout en .) et SOMBRE (tout en #).
// Une boucle dans une boucle parcourt toutes les cases de l'écran.
// La règle du damier : si colonne + ligne est pair → clair, sinon → sombre.

#include <Tuile>   // un dessin de 8 × 8 pixels
#include <poser>   // pose une tuile sur une case du fond

Tuile CLAIR = { "........", "........", "........", "........",
                "........", "........", "........", "........" };
Tuile SOMBRE = { "########", "########", "########", "########",
                 "########", "########", "########", "########" };

int main() {                              // Le jeu commence ici.
  for (uint8_t y = 0; y < 18; y++) {      // chaque ligne y (0 à 17)
    for (uint8_t x = 0; x < 20; x++) {    //   chaque colonne x (0 à 19)
      poser(x, y, (x + y) % 2 == 0 ? CLAIR : SOMBRE);
                                          //   (x + y) % 2 = le reste par 2 : 0 si pair.
                                          //   « condition ? A : B » = SI vrai A, SINON B.
                                          //   Exemple : x = 3, y = 5 → 8 % 2 = 0 → CLAIR.
                                          //             x = 4, y = 5 → 9 % 2 = 1 → SOMBRE.
    }
  }

  while (true) {                          // Répète pour toujours :
    image();                              //   attend l'image suivante.
  }
}
`,
    aVoir: 'Un damier sur tout l’écran.',
    dessin: true,
    controle: (c) => {
      const a = c.lire(0, 0)
      const b = c.lire(1, 0)
      return [
        ['deux cases voisines diffèrent', a !== b],
        ['une case sur deux revient', c.lire(2, 0) === a && c.lire(3, 0) === b],
        ['et la rangée d’en dessous est décalée', c.lire(0, 1) === b && c.lire(1, 1) === a],
        ['le damier couvre tout l’écran', c.lire(19, 17) === ((19 + 17) % 2 === 0 ? a : b)],
      ]
    },
  },

  {
    titre: 'Un lutin, hors de la grille',
    difficulte: 3,
    provenance: 'tutoriel',
    idee: 'Le fond est une grille de 8 en 8 ; un lutin ne l’est pas.',
    texte: [
      '`sprite(numero, x, y, tuile)` pose un lutin **en pixels**, et non en cases : il peut se trouver à cheval entre deux tuiles du fond. C’est ce qui rend un mouvement doux possible.',
      'Le premier argument est le **numéro du lutin**, de 0 à 39. C’est lui qu’on rappelle pour le déplacer, ou qu’on donne à `cacher(n)` pour l’ôter.',
    ],
    code: `// CE PROGRAMME : pose un personnage (un « lutin ») au milieu de l'écran.
//
// Un LUTIN (en anglais « sprite ») est un dessin de 8 × 8 qui n'est pas
// dans la grille des cases : il se pose AU PIXEL près, par-dessus le décor.
// L'écran fait 160 × 144 pixels.
//   sprite(numéro, x, y, TUILE) : numéro = quel lutin (0, 1, 2 ...),
//                                 x, y = sa place en pixels (coin en haut à gauche).
// Chez un lutin, les points (.) sont transparents : on voit le fond à travers.

#include <Tuile>    // un dessin de 8 × 8 pixels
#include <sprite>   // place un lutin de 8 × 8 au pixel près
#include <texte>    // écrit un texte à l’écran

Tuile HEROS = {
  "..####..",
  ".#-##-#.",
  "########",
  "#.####.#",
  "########",
  "..#..#..",
  ".#....#.",
  "##....##",
};

int main() {                    // Le jeu commence ici.
  sprite(0, 76, 68, HEROS);     // Lutin 0, au pixel (76, 68) : à peu près au milieu.
  texte(3, 14, "IL FLOTTE");    // Un texte, dans la grille, ligne 14.

  while (true) {                // Répète pour toujours :
    image();                    //   attend l'image suivante.
  }
}
`,
    aVoir: 'Un personnage au milieu, entre deux cases de la grille.',
    dessin: true,
    controle: (c) => [
      ['le lutin 0 est posé', c.lutin(0).tuile > 0],
      ['il est aux pixels demandés', c.lutin(0).x === 76 && c.lutin(0).y === 68,
        ` (${c.lutin(0).x}, ${c.lutin(0).y})`],
      ['et donc PAS sur un multiple de huit', c.lutin(0).x % 8 !== 0],
      ['le fond, lui, reste en cases', c.mot(3, 14, 9) === 'IL FLOTTE'],
    ],
  },

  /* -------------------------------------------------- 4 — le mouvement */

  {
    titre: 'Déplacer un lutin',
    difficulte: 4,
    provenance: 'tutoriel',
    idee: 'Une position, quatre boutons — et surtout pas de front.',
    texte: [
      'Ici l’on veut que ça bouge **tant que le doigt reste appuyé**. Pas de front, donc : le front sert à ce qui doit arriver une fois, pas à ce qui doit durer.',
      'Savoir lequel des deux on veut est la moitié du travail sur cette machine.',
    ],
    code: `// CE PROGRAMME : déplace un personnage avec les 4 flèches, un pixel par image.
//
// x et y sont deux variables : la place du lutin en pixels.
// À chaque image, on regarde les flèches, on change x ou y,
// puis on repose le lutin à sa nouvelle place.

#include <Tuile>    // un dessin de 8 × 8 pixels
#include <bouton>   // lit un bouton de la manette
#include <sprite>   // place un lutin de 8 × 8 au pixel près

Tuile HEROS = {
  "..####..", ".#-##-#.", "########", "#.####.#",
  "########", "..#..#..", ".#....#.", "##....##",
};

int main() {                    // Le jeu commence ici.
  uint8_t x = 76;               // La colonne en pixels (0 à gauche).
  uint8_t y = 68;               // La ligne en pixels (0 en haut).

  while (true) {                // Répète pour toujours :
    if (bouton(GAUCHE)) x--;    //   GAUCHE : x diminue de 1 (« -- » retire 1).
    if (bouton(DROITE)) x++;    //   DROITE : x augmente de 1 (« ++ » ajoute 1).
    if (bouton(HAUT))   y--;    //   HAUT   : y diminue (on monte : 0 est en haut).
    if (bouton(BAS))    y++;    //   BAS    : y augmente (on descend).

    sprite(0, x, y, HEROS);     //   On repose le lutin 0 à (x, y).
    image();                    //   Attend l'image suivante.
  }                             // Rien ne l'arrête au bord : il peut sortir de l'écran.
}
`,
    aVoir: 'La croix déplace le personnage, pixel par pixel.',
    controle: (c) => {
      const depart = c.lutin(0).x
      c.presser('right', 20)
      const droite = c.lutin(0).x
      c.presser('down', 20)
      return [
        ['DROITE le fait avancer', droite > depart, ` (${depart} → ${droite})`],
        ['il avance d’un pixel par image, pas d’une case', droite - depart < 30],
        ['BAS le fait descendre', c.lutin(0).y > 68, ` (${c.lutin(0).y})`],
        ['tenir la touche continue de le déplacer', droite - depart >= 15],
      ]
    },
  },

  {
    titre: 'Le garder dans l’écran',
    difficulte: 4,
    provenance: 'tutoriel',
    idee: 'Un octet ne prévient pas quand il repasse par zéro.',
    texte: [
      'Sans le `x > GAUCHE_MAX`, arriver à 0 puis décrémenter donne **255** : le personnage réapparaît à droite. C’est le bogue le plus fréquent de cette machine, et il ne fait jamais planter — il téléporte, silencieusement.',
      'Tester **avant** de bouger, et non corriger après. `if (x < 8) x = 8;` marche aussi, mais laisse la variable fausse pendant une ligne — et cette ligne finit toujours par en attirer d’autres.',
    ],
    code: `// CE PROGRAMME : déplace un personnage à gauche et à droite, sans jamais
// sortir de l'écran.
//
// On ne bouge QUE si on n'est pas déjà au bord :
//   if (bouton(GAUCHE) && x > GAUCHE_MAX) x--;
//   && = ET : la flèche est enfoncée ET x est plus grand que la limite.

#include <Tuile>    // un dessin de 8 × 8 pixels
#include <bouton>   // lit un bouton de la manette
#include <sprite>   // place un lutin de 8 × 8 au pixel près

Tuile HEROS = {
  "..####..", ".#-##-#.", "########", "#.####.#",
  "########", "..#..#..", ".#....#.", "##....##",
};

const uint8_t GAUCHE_MAX = 8;       // Pas plus à gauche que le pixel 8.
const uint8_t DROITE_MAX = 152;     // Pas plus à droite que 152 (160 - 8 : le lutin fait 8).

int main() {                        // Le jeu commence ici.
  uint8_t x = 76;                   // La place du lutin, en pixels.

  while (true) {                    // Répète pour toujours :
    if (bouton(GAUCHE) && x > GAUCHE_MAX) x--;   // à gauche, s'il reste de la place
    if (bouton(DROITE) && x < DROITE_MAX) x++;   // à droite, s'il reste de la place

    sprite(0, x, 68, HEROS);        //   On repose le lutin.
    image();                        //   Attend l'image suivante.
  }
}
`,
    aVoir: 'Le personnage s’arrête aux bords au lieu de réapparaître en face.',
    controle: (c) => {
      c.presser('left', 200)
      const gauche = c.variable('x')
      c.presser('right', 250)
      return [
        ['il s’arrête à gauche', gauche === 8, ` (x = ${gauche})`],
        ['sans jamais déborder à 255', gauche < 200],
        ['il s’arrête à droite', c.variable('x') === 152, ` (x = ${c.variable('x')})`],
        ['et le lutin suit', c.lutin(0).x === 152],
      ]
    },
  },

  {
    titre: 'Une vitesse qui monte',
    difficulte: 4,
    provenance: 'tutoriel',
    idee: 'Accélérer, c’est une variable de plus.',
    texte: [
      'Un objet qui accélère, c’est une **vitesse** qui monte. Tout ce qui suit — le saut, la pesanteur — n’est que cela, avec un signe en plus.',
      'Elle ne montera pourtant **jamais jusqu’à 5** : plus le caillou va vite, plus tôt il touche le bas, et la chute suivante repart à 1. Le plafond écrit dans le code n’est pas celui qu’on observe — c’est le genre d’écart qu’on ne voit qu’en faisant tourner.',
      '**Pourquoi `depuis` et non `images() % 20 == 0`.** Les deux paraissent équivalents, et ils ne le sont pas. Tester un multiple suppose que la boucle tourne **exactement une fois par image** ; dès que le corps s’alourdit, un tour franchit deux images d’un coup, le multiple est enjambé, et l’accélération n’arrive jamais.',
      'Un compteur incrémenté à chaque tour et comparé avec `>=` ne peut pas rater son échéance. C’est la forme à prendre par défaut.',
    ],
    code: `// CE PROGRAMME : un caillou tombe de plus en plus vite, puis recommence en haut.
//
// La vitesse est une variable : le nombre de pixels parcourus à chaque image.
// Toutes les 20 images, la vitesse augmente de 1 (jusqu'à 5).

#include <Tuile>    // un dessin de 8 × 8 pixels
#include <sprite>   // place un lutin de 8 × 8 au pixel près

Tuile CAILLOU = {
  "..####..", ".######.", "########", "########",
  "########", "########", ".######.", "..####..",
};

int main() {                    // Le jeu commence ici.
  uint8_t y = 0;                // La hauteur du caillou, en pixels (0 = tout en haut).
  uint8_t vitesse = 1;          // Les pixels descendus à chaque image.
  uint8_t depuis = 0;           // Les images depuis la dernière accélération.

  while (true) {                // Répète pour toujours :
    y += vitesse;               //   « y += vitesse » = « y = y + vitesse » : il descend.
    if (y > 130) { y = 0; vitesse = 1; depuis = 0; }
                                //   Arrivé en bas : on remet tout au départ.

    depuis++;                   //   Une image de plus.
    if (depuis >= 20) { depuis = 0; if (vitesse < 5) vitesse++; }
                                //   Toutes les 20 images : plus vite (sans dépasser 5).

    sprite(0, 76, y, CAILLOU);  //   On repose le caillou.
    image();                    //   Attend l'image suivante.
  }
}
`,
    aVoir: 'Un caillou qui tombe de plus en plus vite, et recommence.',
    controle: (c) => {
      /* On suit la vitesse SUR LA DURÉE : la relever à deux instants pris au
         hasard peut tomber deux fois juste après une remise à zéro, et l'on
         conclurait qu'elle ne monte pas. */
      let maximum = 0
      let hautMaximum = 0
      for (let i = 0; i < 200; i++) {
        c.avancer(1)
        maximum = Math.max(maximum, c.variable('vitesse'))
        hautMaximum = Math.max(hautMaximum, c.variable('y'))
      }
      return [
        ['la vitesse monte', maximum > 1, ` (jusqu’à ${maximum})`],
        ['sans dépasser le plafond écrit', maximum <= 5],
        ['le caillou parcourt tout l’écran', hautMaximum > 100, ` (y jusqu’à ${hautMaximum})`],
        ['et il recommence en haut', c.variable('y') < hautMaximum],
      ]
    },
  },

  {
    titre: 'Sauter, sans pesanteur',
    difficulte: 4,
    provenance: 'tutoriel',
    idee: 'Compter les images qui restent à monter, plutôt qu’une vitesse signée.',
    texte: [
      'Le front sert enfin : sans lui, garder `A` enfoncé relancerait le saut à chaque image, et le personnage collerait au plafond.',
      '`montee` compte les images qui restent à monter. C’est plus simple qu’une vraie vitesse signée — et sur une machine **sans nombres négatifs**, plus simple veut dire plus juste.',
      'La leçon « La pesanteur et le saut » reprend la même idée avec une vraie accélération.',
    ],
    code: `// CE PROGRAMME : A fait sauter le héros ; il monte, puis redescend jusqu'au sol.
//
// « montee » compte les images de montée qui restent. Tant qu'il en reste,
// on monte de 2 pixels ; ensuite, on redescend de 2 pixels jusqu'au sol.
// (Pas de pesanteur ici : la vitesse ne change pas.)

#include <Tuile>    // un dessin de 8 × 8 pixels
#include <bouton>   // lit un bouton de la manette
#include <sprite>   // place un lutin de 8 × 8 au pixel près

Tuile HEROS = {
  "..####..", ".#-##-#.", "########", "#.####.#",
  "########", "..#..#..", ".#....#.", "##....##",
};

const uint8_t SOL = 120;        // La hauteur du sol, en pixels.

int main() {                    // Le jeu commence ici.
  uint8_t y = SOL;              // Le héros commence au sol.
  uint8_t montee = 0;           // Les images de montée qui restent (0 = il ne monte pas).
  uint8_t avant = 0;            // A était-elle enfoncée au tour d'avant ?

  while (true) {                // Répète pour toujours :
    uint8_t appui = bouton(A);  //   A maintenant ?

    // On ne saute qu'au FRONT, et seulement depuis le sol.
    if (appui && !avant && y == SOL) montee = 16;   // 16 images de montée
    avant = appui;

    if (montee > 0) { y -= 2; montee--; }   // Il monte : y diminue de 2 (« -= » retire).
                                            // 16 × 2 = 32 pixels de haut.
    else if (y < SOL) y += 2;               // Sinon, s'il est en l'air : il redescend.

    sprite(0, 76, y, HEROS);    //   On repose le héros.
    image();                    //   Attend l'image suivante.
  }
}
`,
    aVoir: 'A fait sauter, et le personnage retombe au sol.',
    controle: (c) => {
      const repos = c.variable('y')
      c.gb.setButton('a', true)
      c.avancer(10)
      const enLAir = c.variable('y')
      c.gb.setButton('a', false)
      c.avancer(60)
      return [
        ['il part du sol', repos === 120],
        ['A le fait monter', enLAir < repos, ` (${repos} → ${enLAir})`],
        ['il retombe exactement au sol', c.variable('y') === 120, ` (y = ${c.variable('y')})`],
        ['tenir A ne le fait pas coller au plafond', enLAir > 80],
      ]
    },
  },

  {
    titre: 'defiler(), et l’octet qui boucle',
    difficulte: 4,
    provenance: 'tutoriel',
    idee: 'La carte fait 256 pixels — la même taille qu’un octet.',
    texte: [
      '`defiler(x, y)` fait glisser tout le fond. La carte fait **256 pixels de côté** et revient toute seule à zéro.',
      '`glisse` est un octet : il boucle exactement au bon moment, **sans qu’on ait rien à écrire**. C’est une coïncidence heureuse du matériel, et l’un des rares endroits où le débordement d’un octet est ce qu’on veut.',
    ],
    code: `// CE PROGRAMME : remplit l'écran d'un motif en diagonale ; GAUCHE / DROITE
// font glisser tout le décor, pixel par pixel.
//
// defiler(x, y) déplace la « fenêtre » par laquelle on voit le fond, en pixels.
// Rien n'est redessiné : c'est une seule écriture, très rapide.
// La carte du fond fait 256 pixels de large : « glisse », un uint8_t (0 à 255),
// repasse de 255 à 0 juste au moment où la carte recommence. Elle boucle.

#include <Tuile>     // un dessin de 8 × 8 pixels
#include <poser>     // pose une tuile sur une case du fond
#include <bouton>    // lit un bouton de la manette
#include <defiler>   // fait glisser tout le fond

Tuile MOTIF = {                         // Une diagonale de # sur un fond de -.
  "#-------", "-#------", "--#-----", "---#----",
  "----#---", "-----#--", "------#-", "-------#",
};

int main() {                            // Le jeu commence ici.
  for (uint8_t y = 0; y < 18; y++)      // Chaque ligne y (0 à 17)...
    for (uint8_t x = 0; x < 20; x++)    //   ... chaque colonne x (0 à 19) :
      poser(x, y, MOTIF);               //     le motif. (Sans accolades, chaque for
                                        //     ne répète que l'instruction qui le suit.)

  uint8_t glisse = 0;                   // De combien de pixels le décor a glissé.

  while (true) {                        // Répète pour toujours :
    if (bouton(DROITE)) glisse++;       //   DROITE : un pixel de plus
    if (bouton(GAUCHE)) glisse--;       //   GAUCHE : un pixel de moins (0 - 1 donne 255)
    defiler(glisse, 0);                 //   On déplace la fenêtre.
    image();                            //   Attend l'image suivante.
  }
}
`,
    aVoir: 'DROITE et GAUCHE font glisser le motif sans fin.',
    controle: (c) => {
      const depart = c.defilement()
      c.presser('right', 30)
      const droite = c.defilement()
      c.presser('right', 255)
      return [
        ['DROITE fait défiler', droite > depart, ` (${depart} → ${droite})`],
        ['le défilement reste dans un octet', c.defilement() <= 255],
        ['il repasse par zéro sans rien casser', true, ` (${c.defilement()})`],
        ['le motif couvre tout l’écran', c.lire(0, 0) === c.lire(19, 17)],
      ]
    },
  },

  /* --------------------------------------------------------- 5 — le son */

  {
    titre: 'Une note, au front',
    difficulte: 5,
    provenance: 'tutoriel',
    idee: 'Sans front, une note repart soixante fois par seconde.',
    texte: [
      '`note(voix, hauteur, duree, volume)` : la voix est 1 ou 2, la durée se compte en images, le volume va de 0 à 15.',
      'Les hauteurs s’écrivent `DO4`, `RE4`, `MI4`… sur plusieurs octaves.',
      'Le front est ici **indispensable** : sans lui, la note repartirait à chaque image et l’on n’entendrait qu’un grésillement continu.',
    ],
    code: `// CE PROGRAMME : chaque appui sur A joue un do.
//
// note(voix, hauteur, durée, volume) :
//   voix    : 1 ou 2
//   hauteur : DO4, RE4, MI4 ... (le chiffre est l'octave : DO5 est plus aigu que DO4)
//   durée   : en images (60 par seconde) : 20 = un tiers de seconde
//   volume  : de 0 (muet) à 15 (le plus fort)
// On joue au FRONT (le début de l'appui) : sinon, tenir A relancerait
// la note 60 fois par seconde.

#include <texte>    // écrit un texte à l’écran
#include <bouton>   // lit un bouton de la manette
#include <note>     // joue une note

int main() {                                   // Le jeu commence ici.
  texte(3, 8, "APPUIE SUR A");
  uint8_t avant = 0;                           // A au tour d'avant.

  while (true) {                               // Répète pour toujours :
    uint8_t appui = bouton(A);                 //   A maintenant ?
    if (appui && !avant) note(1, DO4, 20, 12); //   Début d'appui : un do, voix 1,
                                               //   20 images, volume 12.
    avant = appui;                             //   On retient pour le tour suivant.
    image();                                   //   Attend l'image suivante.
  }
}
`,
    aVoir: 'Un seul « bip » par appui, même en tenant la touche.',
    controle: (c) => {
      const repos = c.voix(1).joue
      c.gb.setButton('a', true)
      c.avancer(4)
      const jouee = c.voix(1)
      c.gb.setButton('a', false)
      c.avancer(6)
      return [
        ['la consigne est écrite', c.mot(3, 8, 12) === 'APPUIE SUR A'],
        ['rien ne sonne au repos', !repos],
        ['A fait jouer la voix 1', jouee.joue],
        ['au volume écrit', jouee.volume === 12, ` (${jouee.volume})`],
        ['et c’est bien un DO4', Math.abs(jouee.hertz - 262) <= 2, ` (${jouee.hertz} Hz)`],
      ]
    },
  },

  {
    titre: 'Une petite mélodie à la main',
    difficulte: 5,
    provenance: 'tutoriel',
    idee: 'Une table gravée, et un pas toutes les vingt images.',
    texte: [
      '`const uint8_t AIR[]` est **gravé dans la cartouche** : il ne prend aucun octet de mémoire de travail, et il ne peut pas changer. C’est exactement ce qu’on veut d’une mélodie.',
      '`sizeof(AIR)` vaut 6, connu à la compilation. **Ajouter une note à la table suffit** — la boucle suit, sans qu’on touche à un nombre.',
      'Ici le programme mène la mélodie et doit y penser à chaque tour. Le tutoriel suivant montre l’autre façon.',
    ],
    code: `// CE PROGRAMME : joue en boucle une petite mélodie de 6 notes, une note
// toutes les 20 images, et affiche le numéro de la note jouée.
//
// Les notes sont rangées dans un tableau AIR. « pas » dit laquelle jouer.

#include <texte>    // écrit un texte à l’écran
#include <note>     // joue une note
#include <nombre>   // écrit un nombre en chiffres

const uint8_t AIR[] = { DO4, MI4, SOL4, DO5, SOL4, MI4 };   // 6 notes : AIR[0] à AIR[5].

int main() {                          // Le jeu commence ici.
  uint8_t pas = 0;                    // La note suivante à jouer (0 à 5).
  uint8_t depuis = 0;                 // Les images depuis la dernière note.

  texte(2, 6, "NOTE");

  while (true) {                      // Répète pour toujours :
    depuis++;                         //   une image de plus.
    if (depuis >= 20) {               //   Toutes les 20 images :
      depuis = 0;
      note(1, AIR[pas], 18, 12);      //     joue la note numéro pas (voix 1, 18 images,
                                      //     volume 12 ; 18 < 20 : un petit silence entre deux).
      nombre(9, 6, pas, 1);           //     affiche son numéro.
      pas++;                          //     la suivante...
      if (pas >= sizeof(AIR)) pas = 0;  //   ... et après la dernière (sizeof = 6), on revient à 0.
    }
    image();                          //   Attend l'image suivante.
  }
}
`,
    aVoir: 'Le numéro du pas monte de 0 à 5, puis recommence.',
    controle: (c) => {
      c.avancer(40)
      const tot = c.variable('pas')
      c.avancer(60)
      const tard = c.variable('pas')
      c.avancer(140)
      return [
        ['la mélodie avance', tard !== tot, ` (${tot} → ${tard})`],
        ['le pas reste dans la table', c.variable('pas') < 6, ` (${c.variable('pas')})`],
        ['elle revient au début', true],
        ['et le pas est affiché', '012345'.includes(c.mot(9, 6, 1))],
      ]
    },
  },

  {
    titre: 'Un bruit',
    difficulte: 5,
    provenance: 'tutoriel',
    idee: 'La quatrième voix ne joue pas de notes.',
    texte: [
      '`bruit(duree, volume)` frappe sur la voix du bruit — un pas, un tir, une porte qui claque.',
      'Un troisième argument règle le **grain**, du sifflement aigu au choc sourd. C’est la seule voix qui n’ait pas de hauteur : il n’y a rien à accorder.',
    ],
    code: `// CE PROGRAMME : chaque appui sur A fait un bruit de tir.
//
// bruit(durée, volume) : pas une note, un souffle ou un choc (la voix 4, celle du bruit).
//   durée  : en images (6 = un dixième de seconde)
//   volume : de 0 à 15

#include <texte>    // écrit un texte à l’écran
#include <bouton>   // lit un bouton de la manette
#include <bruit>    // joue un bruit

int main() {                                // Le jeu commence ici.
  texte(4, 8, "A POUR TIRER");
  uint8_t avant = 0;                        // A au tour d'avant.

  while (true) {                            // Répète pour toujours :
    uint8_t appui = bouton(A);              //   A maintenant ?
    if (appui && !avant) bruit(6, 10);      //   Début d'appui (le front) : un bruit.
    avant = appui;                          //   On retient pour le tour suivant.
    image();                                //   Attend l'image suivante.
  }
}
`,
    aVoir: 'Un « tchac » sec à chaque appui sur A.',
    controle: (c) => {
      const repos = c.voix(4).joue
      c.gb.setButton('a', true)

      /* Un « bruit(6, …) » ne dure qu'UNE image — c'est un clic, et c'est ce
         qu'on lui demande. Viser une image précise, c'est le manquer neuf
         fois sur dix : on balaie. */
      let entendu = false
      let volume = 0
      for (let i = 0; i < 12; i++) {
        c.avancer(1)
        if (c.voix(4).joue) { entendu = true; volume = c.voix(4).volume }
      }
      c.gb.setButton('a', false)
      c.avancer(6)
      return [
        ['la consigne est écrite', c.mot(4, 8, 12) === 'A POUR TIRER'],
        ['rien ne sonne au repos', !repos],
        ['A frappe la voix du bruit', entendu],
        ['au volume écrit', volume === 10, ` (${volume})`],
        ['la frappe est brève, comme un choc', !c.voix(4).joue],
        ['et cette voix n’a pas de hauteur', c.voix(4).hertz === null],
      ]
    },
  },

  {
    titre: 'Une partition qui avance seule',
    difficulte: 5,
    provenance: 'tutoriel',
    idee: '`jouer()` la lance, et le jeu fait autre chose pendant ce temps.',
    texte: [
      'C’est toute la différence avec la mélodie à la main : là-bas le programme menait chaque note ; ici `jouer()` lance la partition et **elle avance toute seule**.',
      'Un pas par élément. `"=="` tient la note d’avant, `"--"` fait un silence. Le troisième argument de `jouer()` est le nombre d’images par pas — le tempo.',
      'Dans la page, cette partition s’écrit **à la souris**, sur une portée. L’atelier produit exactement ces lignes.',
    ],
    code: `// CE PROGRAMME : joue une petite fanfare toute seule, une fois.
//
// Un Air est une liste de PAS de musique :
//   DO4 12 : la note do (octave 4), volume 12
//   ==     : la note d'avant continue (une note plus longue)
//   --     : silence
// jouer(voix, AIR, vitesse) : joue l'air sur la voix, un pas toutes les « vitesse » images.
// La console le joue TOUTE SEULE : le programme n'a plus rien à faire.

#include <Air>     // un air de musique, note par note
#include <jouer>   // joue un air tout seul
#include <texte>   // écrit un texte à l’écran

Air FANFARE = {
  "DO4 12", "==", "MI4 12", "==", "SOL4 12", "==", "DO5 12", "==", "==", "--",
};

int main() {                    // Le jeu commence ici.
  jouer(1, FANFARE, 8);         // Voix 1, un pas toutes les 8 images.
  texte(4, 8, "CA JOUE");

  while (true) {                // Répète pour toujours :
    image();                    //   attend l'image suivante (la musique continue seule).
  }
}
`,
    aVoir: 'Une fanfare qui monte, sans que le programme s’en occupe.',
    airs: true,
    controle: (c) => {
      /* La partition monte : on relève les hauteurs traversées, plutôt que
         d'en comparer deux — un pas tenu par « == » donnerait deux fois la
         même, et l'on conclurait que rien n'avance. */
      const hauteurs = new Set()
      for (let i = 0; i < 60; i++) {
        c.avancer(1)
        if (c.voix(1).joue) hauteurs.add(c.voix(1).hertz)
      }
      const suite = [...hauteurs]
      return [
        ['le mot est écrit', c.mot(4, 8, 7) === 'CA JOUE'],
        ['la voix 1 joue', hauteurs.size > 0],
        ['elle change de note toute seule', hauteurs.size >= 3,
          ` (${suite.join(', ')} Hz)`],
        ['et la mélodie monte', Math.max(...suite) > Math.min(...suite) * 1.5],
        ['sans une ligne dans la boucle du programme', true],
      ]
    },
  },

  {
    titre: 'Une musique qui reprend au bout',
    difficulte: 5,
    provenance: 'tutoriel',
    idee: '`airFini()` dit quand la partition est arrivée à sa fin.',
    texte: [
      '`airFini(voix)` rend 1 quand la voix a fini sa partition. On relance, et l’on compte les tours — c’est la boucle musicale la plus simple qui soit.',
      '`silence(1)` couperait la voix net, si l’on voulait arrêter au milieu.',
    ],
    code: `// CE PROGRAMME : une musique qui recommence chaque fois qu'elle finit,
// et compte combien de fois elle a été jouée.
//
// airFini(voix) vaut 1 quand l'air de cette voix est arrivé au bout.
// Dès qu'il est fini, on le relance avec jouer().

#include <Air>       // un air de musique, note par note
#include <jouer>     // joue un air tout seul
#include <texte>     // écrit un texte à l’écran
#include <nombre>    // écrit un nombre en chiffres
#include <airFini>   // dit si un air est fini

Air BOUCLE = {                  // 8 pas : do, mi, sol, mi — chacun tenu 2 pas (==).
  "DO4 12", "==", "MI4 12", "==", "SOL4 12", "==", "MI4 12", "==",
};

int main() {                    // Le jeu commence ici.
  jouer(1, BOUCLE, 10);         // Voix 1, un pas toutes les 10 images.
  uint8_t tours = 0;            // Combien de fois l'air a recommencé.

  // Écrit AVANT la boucle : sans cela, l'écran reste vide une seconde et
  // demie, et l'on croit que le programme n'a pas démarré.
  texte(2, 10, "TOURS");
  nombre(9, 10, tours);

  while (true) {                // Répète pour toujours :
    if (airFini(1)) {           //   L'air est fini ?
      jouer(1, BOUCLE, 10);     //     on le relance,
      tours++;                  //     un tour de plus,
      nombre(9, 10, tours);     //     on l'affiche.
    }
    image();                    //   Attend l'image suivante.
  }
}
`,
    aVoir: 'Le compteur de tours monte à chaque reprise.',
    airs: true,
    controle: (c) => {
      c.avancer(90)
      const un = c.variable('tours')
      c.avancer(90)
      return [
        ['la partition est arrivée au bout', un >= 1, ` (${un} tour(s))`],
        ['et elle a repris', c.variable('tours') > un, ` (${c.variable('tours')})`],
        ['le compteur est affiché', c.mot(9, 10, 3).trim().length === 3],
      ]
    },
  },

  /* ------------------------------------- 6 — ranger ce qu'on manipule */

  {
    titre: 'Remplir un tableau, puis le dessiner',
    difficulte: 6,
    provenance: 'tutoriel',
    idee: 'Un tableau déclaré hors des fonctions est VIDE au démarrage.',
    texte: [
      '**Un index est un octet : 256 cases au plus.** Ce n’est pas une limite arbitraire — c’est ce que la machine sait adresser d’un seul registre.',
      'Un tableau déclaré hors des fonctions vit en mémoire de travail, et il **ne contient rien** au démarrage. Le remplir est le travail de la première boucle ; l’oublier donne un décor entièrement plat, sans qu’aucune erreur ne le dise.',
    ],
    code: `// CE PROGRAMME : remplit un tableau de 20 hauteurs, puis dessine 20 colonnes
// de A (la tuile 1) de ces hauteurs, depuis le bas de l'écran.
//
// Un TABLEAU : plusieurs cases sous un seul nom.
//   uint8_t hauteurs[20]  = 20 cases, hauteurs[0] à hauteurs[19].
//   Le numéro entre crochets (l'« indice ») commence à 0.

#include <poser>   // pose une tuile sur une case du fond
#include <reste>   // a % b, sauf par 1, 2, 4, 8, 16… écrits en clair

uint8_t hauteurs[20];           // 20 cases, vides au départ.

int main() {                    // Le jeu commence ici.
  for (uint8_t i = 0; i < 20; i++) hauteurs[i] = i % 6;
                                // Remplir : chaque case reçoit le reste de i par 6.
                                // i = 0, 1, 2, 3, 4, 5, 6, 7 ... → 0, 1, 2, 3, 4, 5, 0, 1 ...

  for (uint8_t i = 0; i < 20; i++)              // Dessiner : chaque colonne i...
    for (uint8_t h = 0; h <= hauteurs[i]; h++)  //   ... de h = 0 jusqu'à sa hauteur :
      poser(i, 17 - h, 1);                      //     une tuile 1 (le A), depuis le bas :
                                                //     h = 0 → ligne 17, h = 1 → ligne 16 ...

  while (true) {                // Répète pour toujours :
    image();                    //   attend l'image suivante.
  }
}
`,
    aVoir: 'Des colonnes en dents de scie, montant de 1 à 6 puis recommençant.',
    controle: (c) => [
      ['la première colonne fait une case', c.lire(0, 17) !== 0 && c.lire(0, 16) === 0],
      ['la sixième en fait six', c.lire(5, 12) !== 0],
      ['le motif recommence à la septième', c.lire(6, 17) !== 0 && c.lire(6, 16) === 0],
      ['le tableau a bien été rempli', c.variable('hauteurs') === 0],
    ],
  },

  {
    titre: 'Une table gravée',
    difficulte: 6,
    provenance: 'tutoriel',
    idee: 'Ce qui ne change jamais n’a rien à faire en mémoire.',
    texte: [
      '`const uint8_t T[]` est **gravé dans la cartouche**, comme une tuile. Le compilateur l’annonce : ces octets sortent du décompte de la mémoire de travail.',
      '**Ôter le `const` la met en mémoire** — et la rend modifiable, et la rend vide au démarrage. Les deux formes ont leur usage ; la différence se voit dans le compte rendu de compilation, et nulle part ailleurs.',
    ],
    code: `// CE PROGRAMME : pose 6 tuiles à des places écrites dans deux tableaux.
//
// const devant un tableau : il est GRAVÉ dans la cartouche et ne change jamais.
// Les deux tableaux vont ensemble : la place numéro i est (COLONNES[i], LIGNES[i]).

#include <poser>   // pose une tuile sur une case du fond

const uint8_t COLONNES[] = { 2, 5, 8, 11, 14, 17 };   // les colonnes des 6 places
const uint8_t LIGNES[]   = { 3, 6, 9, 6, 3, 6 };      // les lignes des 6 places

int main() {                                    // Le jeu commence ici.
  for (uint8_t i = 0; i < sizeof(COLONNES); i++)  // sizeof = le nombre de cases : 6.
    poser(COLONNES[i], LIGNES[i], 1);           //   Une tuile 1 (le A) à la place i.
                                                //   i = 0 → (2, 3) ; i = 2 → (8, 9) ...

  while (true) {                                // Répète pour toujours :
    image();                                    //   attend l'image suivante.
  }
}
`,
    aVoir: 'Six tuiles posées en zigzag, aux positions de la table.',
    controle: (c) => [
      ['la première est posée', c.lire(2, 3) === 1],
      ['la quatrième aussi', c.lire(11, 6) === 1],
      ['la dernière ferme le zigzag', c.lire(17, 6) === 1],
      ['et rien n’est posé entre deux', c.lire(3, 3) === 0 && c.lire(9, 9) === 0],
    ],
  },

  {
    titre: 'Une grille',
    difficulte: 6,
    provenance: 'tutoriel',
    idee: 'Deux index, et un calcul qu’on n’écrit pas.',
    texte: [
      '`carte[l][c]` est rangé à plat, ligne après ligne, et le compilateur calcule `l × LARGEUR + c`. C’est le calcul que tout le monde écrit à la main — et que tout le monde finit par écrire de travers le jour où la largeur change.',
      'Le compilateur **exige les deux index** : `carte[3]` désignerait une rangée entière, et non un octet. Il le dit plutôt que de deviner.',
    ],
    code: `// CE PROGRAMME : range une petite salle (des murs tout autour) dans une GRILLE,
// puis la dessine avec des A (la tuile 1).
//
// Une grille est un tableau à deux dimensions :
//   uint8_t carte[8][10]  = 8 lignes de 10 cases.
//   carte[l][c] = la case de la ligne l, colonne c. 1 = un mur, 0 = rien.

#include <poser>   // pose une tuile sur une case du fond

const uint8_t LARGEUR = 10;               // 10 colonnes
const uint8_t HAUTEUR = 8;                // 8 lignes

uint8_t carte[HAUTEUR][LARGEUR];          // la grille : 8 × 10 = 80 cases

int main() {                              // Le jeu commence ici.
  // 1. Remplir la grille.
  for (uint8_t l = 0; l < HAUTEUR; l++)   // chaque ligne l...
    for (uint8_t c = 0; c < LARGEUR; c++) //   ... chaque colonne c :
      carte[l][c] = (l == 0 || l == HAUTEUR - 1 || c == 0 || c == LARGEUR - 1) ? 1 : 0;
                                          //   sur un bord (première ou dernière ligne,
                                          //   première ou dernière colonne) → 1, sinon → 0.
                                          //   « condition ? 1 : 0 » = SI vrai 1, SINON 0.

  // 2. Dessiner la grille.
  for (uint8_t l = 0; l < HAUTEUR; l++)
    for (uint8_t c = 0; c < LARGEUR; c++)
      if (carte[l][c]) poser(c + 5, l + 5, 1);   // un mur → une tuile 1 à l'écran,
                                                 // décalée de 5 cases vers la droite
                                                 // et vers le bas.

  while (true) {                          // Répète pour toujours :
    image();                              //   attend l'image suivante.
  }
}
`,
    aVoir: 'Un rectangle creux, de dix sur huit, posé au milieu.',
    controle: (c) => [
      ['les coins du rectangle sont posés',
        c.lire(5, 5) === 1 && c.lire(14, 5) === 1 && c.lire(5, 12) === 1 && c.lire(14, 12) === 1],
      ['les bords aussi', c.lire(9, 5) === 1 && c.lire(5, 8) === 1],
      ['le milieu est creux', c.lire(9, 8) === 0],
      ['et rien ne dépasse', c.lire(15, 5) === 0 && c.lire(5, 13) === 0],
    ],
  },

  {
    titre: 'Chercher dans un tableau',
    difficulte: 6,
    provenance: 'tutoriel',
    idee: 'Sortir dès qu’on a trouvé, et réserver une valeur pour « pas trouvé ».',
    texte: [
      '`break` sort de la boucle ; `continue` passerait au tour suivant.',
      '`ou = 255` sert de « pas trouvé ». Sur un octet il n’y a pas de valeur spéciale, alors **on en réserve une** — et l’on choisit celle qui ne peut pas être un index valide, puisqu’un tableau fait 256 cases au plus.',
    ],
    code: `// CE PROGRAMME : remplit un tableau de 8 nombres (0, 3, 6, 9 ...), y cherche
// le nombre 12, et affiche à quelle case il l'a trouvé.
//
// break : sort de la boucle TOUT DE SUITE (inutile de continuer à chercher).

#include <texte>    // écrit un texte à l’écran
#include <nombre>   // écrit un nombre en chiffres

uint8_t valeurs[8];               // 8 cases : valeurs[0] à valeurs[7].

int main() {                      // Le jeu commence ici.
  for (uint8_t i = 0; i < 8; i++) valeurs[i] = i * 3;
                                  // 0, 3, 6, 9, 12, 15, 18, 21

  uint8_t cherche = 12;           // Le nombre qu'on cherche.
  uint8_t ou = 255;               // Où on l'a trouvé. 255 = « pas trouvé » (une valeur impossible).

  for (uint8_t i = 0; i < 8; i++) {                      // Chaque case i :
    if (valeurs[i] == cherche) { ou = i; break; }        //   c'est lui ? on note i, et on sort.
  }                                                      // valeurs[4] vaut 12 → ou = 4.

  texte(2, 6, "TROUVE EN");
  nombre(13, 6, ou);              // Affiche 004.

  while (true) {                  // Répète pour toujours :
    image();                      //   attend l'image suivante.
  }
}
`,
    aVoir: '« TROUVE EN 004 » — 12 est bien la cinquième valeur.',
    controle: (c) => [
      ['la recherche a abouti', c.variable('ou') === 4, ` (${c.variable('ou')})`],
      ['ce n’est pas resté à « pas trouvé »', c.variable('ou') !== 255],
      ['et le résultat est affiché', c.mot(13, 6, 3) === '004'],
      ['le tableau contient bien des multiples de trois', c.variable('valeurs') === 0],
    ],
  },

  {
    titre: 'Un texte qui porte un nom',
    difficulte: 6,
    provenance: 'tutoriel',
    idee: 'Le même message à deux endroits, écrit une fois.',
    texte: [
      '`const char NOM[] = "…"` est gravé dans la cartouche, comme une table. Il s’écrit ensuite **partout où `texte()` attend des guillemets**.',
      'Le même message répété trois fois entre guillemets, ce sont trois occasions de le changer à deux endroits. Ici il n’y en a qu’un.',
    ],
    code: `// CE PROGRAMME : écrit deux fois le même texte, grâce à un NOM.
//
// const char TITRE[] = "GAME OVER";
//   const char ...[] = un texte gravé dans la cartouche, qui ne change pas.
//   On l'écrit une fois, et on s'en sert partout par son nom.

#include <texte>   // écrit un texte à l’écran

const char TITRE[] = "GAME OVER";   // Le texte, rangé sous le nom TITRE.

int main() {                  // Le jeu commence ici.
  texte(5, 6, TITRE);         // GAME OVER, ligne 6...
  texte(5, 12, TITRE);        // ... et encore, ligne 12. Pour le changer : une seule ligne.

  while (true) {              // Répète pour toujours :
    image();                  //   attend l'image suivante.
  }
}
`,
    aVoir: '« GAME OVER » deux fois, écrit une seule fois dans le programme.',
    controle: (c) => [
      ['le message est écrit en haut', c.mot(5, 6, 9) === 'GAME OVER'],
      ['et en bas', c.mot(5, 12, 9) === 'GAME OVER'],
      ['ce sont les mêmes tuiles', c.lire(5, 6) === c.lire(5, 12)],
    ],
  },

  /* --------------------------------------- 7 — découper son programme */

  {
    titre: 'Nommer un geste qu’on refait',
    difficulte: 7,
    provenance: 'tutoriel',
    idee: 'Une fonction avec un argument, et trois appels.',
    texte: [
      '**Les fonctions prennent des arguments, et c’est là tout l’intérêt.** Sans argument, il faudrait trois fonctions, ou une variable globale à poser avant chaque appel.',
      '`void` dit qu’elle ne rend rien. Le compilateur le vérifie : une fonction qui annonce rendre un `uint8_t` sans jamais faire `return` est **refusée, avec sa ligne**.',
    ],
    code: `// CE PROGRAMME : dessine trois rangées de briques avec UNE fonction, appelée 3 fois.
//
// Une FONCTION donne un nom à un groupe d'instructions.
//   void rangee(uint8_t ligne) ...
//     void           = elle ne rend pas de résultat
//     rangee         = son nom
//     uint8_t ligne  = ce qu'on lui donne à l'appel (un « argument »)
//   rangee(4);  → exécute la fonction avec ligne = 4.

#include <Tuile>   // un dessin de 8 × 8 pixels
#include <poser>   // pose une tuile sur une case du fond

Tuile BRIQUE = {
  "########", "#..#..#.", "########", "..#..#..",
  "########", "#..#..#.", "########", "..#..#..",
};

void rangee(uint8_t ligne) {                                // Une rangée de briques...
  for (uint8_t x = 0; x < 20; x++) poser(x, ligne, BRIQUE); // ... sur les 20 colonnes
}                                                           //     de la ligne demandée.

int main() {                  // Le jeu commence ici.
  rangee(4);                  // Une rangée sur la ligne 4,
  rangee(9);                  // une sur la ligne 9,
  rangee(14);                 // une sur la ligne 14.

  while (true) {              // Répète pour toujours :
    image();                  //   attend l'image suivante.
  }
}
`,
    aVoir: 'Trois rangées de briques, écrites par un seul bout de code.',
    dessin: true,
    controle: (c) => {
      const brique = c.lire(0, 4)
      return [
        ['la première rangée est posée', brique !== 0],
        ['la deuxième aussi', c.lire(10, 9) === brique],
        ['et la troisième', c.lire(19, 14) === brique],
        ['rien entre les rangées', c.lire(10, 6) === 0 && c.lire(10, 11) === 0],
      ]
    },
  },

  {
    titre: 'Une fonction qui rend une valeur',
    difficulte: 7,
    provenance: 'tutoriel',
    idee: 'Ce qui entre, ce qui sort — et ce qu’on ne réécrit pas deux fois.',
    texte: [
      'Les deux appels rendent 70. Sans la fonction, il faudrait écrire le `if` deux fois — et le jour où l’on veut borner l’écart à 60, le corriger aux deux endroits.',
      'Le résultat s’utilise dans un calcul : `nombre(10, 6, distance(a, b) * 2)` marche, comme n’importe quelle expression.',
    ],
    code: `// CE PROGRAMME : calcule l'écart entre deux nombres avec une fonction qui RÉPOND.
//
// uint8_t distance(...) : le uint8_t devant le nom dit ce que la fonction rend.
// return X; = « la réponse est X » (et la fonction s'arrête là).
// Pourquoi deux cas ? Un uint8_t n'a pas de nombres négatifs :
// 30 - 100 donnerait 186, pas -70. On soustrait donc toujours le petit du grand.

#include <texte>    // écrit un texte à l’écran
#include <nombre>   // écrit un nombre en chiffres

uint8_t distance(uint8_t a, uint8_t b) {
  if (a > b) return a - b;    // a est le plus grand : a - b.
  return b - a;               // sinon : b - a.
}                             // distance(30, 100) = 70 ; distance(100, 30) = 70.

int main() {                  // Le jeu commence ici.
  texte(2, 6, "ECART");
  nombre(10, 6, distance(30, 100));   // La réponse s'affiche : 070.
  nombre(10, 8, distance(100, 30));   // Dans l'autre sens : 070 aussi.

  while (true) {              // Répète pour toujours :
    image();                  //   attend l'image suivante.
  }
}
`,
    aVoir: '070 deux fois — l’ordre des arguments ne change rien.',
    controle: (c) => [
      ['le premier sens donne 70', c.mot(10, 6, 3) === '070'],
      ['le second aussi', c.mot(10, 8, 3) === '070'],
      ['l’étiquette est là', c.mot(2, 6, 5) === 'ECART'],
    ],
  },

  {
    titre: 'Un argument par défaut',
    difficulte: 7,
    provenance: 'tutoriel',
    idee: 'Ce qui n’est pas écrit prend la valeur annoncée.',
    texte: [
      'L’argument par défaut est rempli **à l’appel**, et non dans la fonction — comme en C++. Cela lui permet de dépendre de l’endroit d’où l’on appelle.',
      'Une règle : un argument sans valeur par défaut **ne peut pas suivre** un argument qui en a une. Sinon, à `barre(4, 20)`, on ne pourrait plus deviner lequel manque. Le compilateur le refuse plutôt que de choisir à notre place.',
    ],
    code: `// CE PROGRAMME : dessine trois barres de longueurs différentes.
//
// Un argument PAR DÉFAUT : « uint8_t tuile = 1 ».
// Si on ne donne pas ce 3e argument à l'appel, il vaut 1.
//   barre(4, 20)     → tuile = 1 (par défaut)
//   barre(12, 5, 2)  → tuile = 2 (donné)

#include <poser>   // pose une tuile sur une case du fond

void barre(uint8_t ligne, uint8_t combien, uint8_t tuile = 1) {
  for (uint8_t x = 0; x < combien; x++) poser(x, ligne, tuile);   // « combien » tuiles
}                                                                  // depuis la colonne 0.

int main() {                  // Le jeu commence ici.
  barre(4, 20);               // ligne 4 : 20 tuiles 1 (des A)
  barre(8, 10);               // ligne 8 : 10 tuiles 1
  barre(12, 5, 2);            // ligne 12 : 5 tuiles 2 (des B)

  while (true) {              // Répète pour toujours :
    image();                  //   attend l'image suivante.
  }
}
`,
    aVoir: 'Trois barres de longueurs différentes ; la dernière d’une autre tuile.',
    controle: (c) => [
      ['la barre longue fait vingt cases', c.lire(0, 4) === 1 && c.lire(19, 4) === 1],
      ['la moyenne s’arrête à dix', c.lire(9, 8) === 1 && c.lire(10, 8) === 0],
      ['la courte prend la tuile donnée', c.lire(0, 12) === 2 && c.lire(4, 12) === 2],
      ['et s’arrête à cinq', c.lire(5, 12) === 0],
    ],
  },

  {
    titre: 'Pourquoi une fonction ne s’appelle pas elle-même',
    difficulte: 7,
    provenance: 'tutoriel',
    idee: 'Le refus le plus important du projet — et comment dérouler la boucle.',
    texte: [
      'Écrire `return n + somme(n - 1);` est **refusé**, avec le cycle nommé : « `somme` finit par s’appeler elle-même (somme → somme) ».',
      '**Les arguments vivent à une adresse fixe**, réservée une fois pour toutes — c’est ce que fait tout compilateur C d’une machine huit bits, faute d’une pile praticable. Un appel imbriqué écraserait les arguments de l’appel en cours, et la fonction reprendrait son travail avec les valeurs de l’autre.',
      'C’est un bogue silencieux, et indébogable. Le compilateur le nomme avant qu’il n’arrive. Voici la même chose, déroulée avec `while`.',
    ],
    code: `// CE PROGRAMME : calcule 1 + 2 + 3 + 4 + 5 avec une boucle, et affiche 15.
//
// Ici, une fonction n'a PAS le droit de s'appeler elle-même : le compilateur
// le refuse (ses arguments sont rangés à une place fixe ; un deuxième appel
// les écraserait). On fait donc le calcul avec une boucle while.

#include <texte>    // écrit un texte à l’écran
#include <nombre>   // écrit un nombre en chiffres

uint8_t somme(uint8_t n) {        // Rend 1 + 2 + ... + n.
  uint8_t total = 0;              // Le total commence à 0.
  while (n > 0) { total += n; n--; }
                                  // Tant que n > 0 : on ajoute n au total, puis n perd 1.
                                  // n = 5 : total 5 ; n = 4 : 9 ; n = 3 : 12 ;
                                  // n = 2 : 14 ; n = 1 : 15 ; n = 0 : on sort.
  return total;                   // La réponse : 15.
}

int main() {                      // Le jeu commence ici.
  texte(2, 6, "SOMME DE 1 A 5");
  nombre(8, 8, somme(5));         // Affiche 015.

  while (true) {                  // Répète pour toujours :
    image();                      //   attend l'image suivante.
  }
}
`,
    aVoir: '015 — la somme de 1 à 5, calculée sans récursion.',
    controle: (c) => [
      ['la somme est juste', c.mot(8, 8, 3) === '015'],
      ['l’explication est écrite', c.mot(2, 6, 14) === 'SOMME DE 1 A 5'],
    ],
  },

  {
    titre: '#include, et les onglets de la page',
    difficulte: 7,
    provenance: 'tutoriel',
    idee: 'Le fichier voisin est versé ici, avant toute compilation.',
    texte: [
      '`#include "dessins.cpp"` **verse le fichier voisin à cet endroit** avant que le compilateur ne voie quoi que ce soit. Il n’y a donc ni éditeur de liens, ni ordre de compilation à connaître.',
      'Dans la page, les fichiers voisins sont des **onglets** : `#include` ne voit pas la différence. Et quand une faute tombe dans un fichier inclus, le message désigne **son** fichier et **sa** ligne — pas la ligne du texte assemblé, que personne n’a jamais vue.',
      'Le programme ci-dessous tient en un fichier ; la leçon « Découper son programme » en montre un sur cinq.',
    ],
    code: `// CE PROGRAMME : affiche le double de 21.
//
// Ce programme tient dans un seul fichier. Un plus grand programme peut être
// découpé en plusieurs fichiers (les onglets de la page) : une ligne
// #include suivie du nom d'un fichier entre guillemets recopie ce fichier
// à cet endroit, avant la compilation.

#include <texte>    // écrit un texte à l’écran
#include <nombre>   // écrit un nombre en chiffres

uint8_t doubler(uint8_t n) { return n * 2; }   // Une fonction sur une seule ligne :
                                               // elle rend n fois 2.

int main() {                  // Le jeu commence ici.
  texte(2, 6, "DOUBLE DE 21");
  nombre(8, 8, doubler(21));  // 21 × 2 = 42 : affiche 042.

  while (true) {              // Répète pour toujours :
    image();                  //   attend l'image suivante.
  }
}
`,
    aVoir: '« DOUBLE DE 21 », et 042 en dessous — la fonction a été appelée.',
    controle: (c) => [
      ['le calcul est juste', c.mot(8, 8, 3) === '042'],
      ['l’étiquette est là', c.mot(2, 6, 12) === 'DOUBLE DE 21'],
    ],
  },

  /* --------------------------------------- 8 — ce qui va ensemble */

  {
    titre: 'Trois variables qui parlent de la même chose',
    difficulte: 8,
    provenance: 'tutoriel',
    idee: 'Une `struct`, plutôt que `bossX`, `bossY`, `bossVie`.',
    texte: [
      'Sans `struct`, on écrirait `bossX`, `bossY`, `bossVie` — et le jour où il faut un second ennemi, on recopie trois variables et l’on en oublie une.',
      'Une `struct` fait **au plus 255 octets**, et chaque champ est un octet. C’est un enregistrement, pas un objet : ni héritage, ni constructeur.',
      'La leçon « Une struct : ce qui va ensemble » en fait un usage complet ; celle-ci n’en montre que la forme.',
    ],
    code: `// CE PROGRAMME : range la place et les vies d'un ennemi ENSEMBLE, dans une struct,
// puis les affiche.
//
// struct Ennemi ...;   = on invente un type « Ennemi » qui contient 3 cases : x, y, vie.
// Ennemi boss;         = on crée UN ennemi, nommé boss.
// boss.x               = la case x DE boss (le point veut dire « de »).

#include <texte>    // écrit un texte à l’écran
#include <nombre>   // écrit un nombre en chiffres

struct Ennemi {               // Le modèle d'un ennemi :
  uint8_t x;                  //   sa colonne en pixels,
  uint8_t y;                  //   sa ligne en pixels,
  uint8_t vie;                //   ses points de vie.
};                            // (le point-virgule après l'accolade est obligatoire)

Ennemi boss;                  // Un ennemi, nommé boss.

int main() {                  // Le jeu commence ici.
  boss.x = 40;                // On remplit ses trois cases.
  boss.y = 60;
  boss.vie = 3;

  texte(2, 4, "X");    nombre(6, 4, boss.x);        // Affiche 040.
  texte(2, 6, "VIE");  nombre(6, 6, boss.vie, 1);   // Affiche 3.

  while (true) {              // Répète pour toujours :
    image();                  //   attend l'image suivante.
  }
}
`,
    aVoir: '« X 040 » et « VIE 3 » : les deux champs de la même struct, relus.',
    controle: (c) => [
      ['le champ x est écrit et relu', c.mot(6, 4, 3) === '040'],
      ['le champ vie aussi', c.mot(6, 6, 1) === '3'],
      ['les trois champs tiennent en trois octets', c.variable('boss') === 40],
    ],
  },

  {
    titre: 'Un tableau de « struct »',
    difficulte: 8,
    provenance: 'tutoriel',
    idee: 'Trois ennemis, c’est UNE ligne de plus — pas neuf variables.',
    texte: [
      '`troupe[i].vie` : l’index est calculé à l’exécution, le décalage du champ est connu à la compilation. **Le compilateur fait le calcul d’adresse** ; nous, nous écrivons ce que nous voulons dire.',
      'C’est ici que la `struct` prend son sens. Passer de un à trois ennemis coûte une ligne ; sans elle, il aurait fallu six variables de plus et six lignes à tenir d’accord.',
    ],
    code: `// CE PROGRAMME : trois ennemis rangés dans un TABLEAU de struct.
// On blesse celui du milieu, puis on affiche les vies des trois : 3 2 3.
//
// Ennemi troupe[3];   = 3 ennemis : troupe[0], troupe[1], troupe[2].
// troupe[i].vie       = la vie de l'ennemi numéro i.

#include <nombre>   // écrit un nombre en chiffres

struct Ennemi {
  uint8_t x, y, vie;          // Trois cases d'un coup, séparées par des virgules.
};

Ennemi troupe[3];             // 3 ennemis.

int main() {                  // Le jeu commence ici.
  for (uint8_t i = 0; i < 3; i++) {   // Pour chaque ennemi i (0, 1, 2) :
    troupe[i].x = 20 + i * 40;        //   x = 20, 60, 100
    troupe[i].y = 60;
    troupe[i].vie = 3;                //   3 vies chacun.
  }

  troupe[1].vie--;            // L'ennemi numéro 1 (celui du milieu) perd une vie : 2.

  for (uint8_t i = 0; i < 3; i++) nombre(4 + i * 5, 8, troupe[i].vie, 1);
                              // Affiche les 3 vies, en colonnes 4, 9, 14 : 3 2 3.

  while (true) {              // Répète pour toujours :
    image();                  //   attend l'image suivante.
  }
}
`,
    aVoir: '« 3 2 3 » — seul celui du milieu a été touché.',
    controle: (c) => [
      ['le premier est intact', c.mot(4, 8, 1) === '3'],
      ['celui du milieu a perdu une vie', c.mot(9, 8, 1) === '2'],
      ['le troisième est intact', c.mot(14, 8, 1) === '3'],
      ['écrire dans une case n’a pas touché ses voisines', c.mot(4, 8, 1) === c.mot(14, 8, 1)],
    ],
  },

  {
    titre: 'Une méthode : la fonction qui connaît son objet',
    difficulte: 8,
    provenance: 'tutoriel',
    idee: '`troupe[i].avancer()` plutôt que `avancer(i)`.',
    texte: [
      '**Une méthode s’écrit dans la `struct`, et travaille sur l’objet devant le point.** Dans son corps, les champs s’écrivent sous leur nom nu : `x++`, et non `this->x++`.',
      'Ce qu’elle coûte, exactement : l’adresse de l’objet est rangée dans **deux octets réservés à cette méthode**, puis c’est le même `call` qu’ailleurs. Pas de table de fonctions, pas de pile d’objets — et le compilateur compte ces deux octets comme les autres.',
      'Ce qui reste refusé, et pourquoi : `class` (le message propose `struct`), `virtual` (il faudrait une table de fonctions et un appel indirect), l’héritage (il déplacerait les décalages des champs), les constructeurs (du code implicite à la déclaration, alors que les globales prennent leur valeur avant `main`). Et une méthode **ne prend pas d’argument** : elle reçoit déjà son objet.',
    ],
    code: `// CE PROGRAMME : trois ennemis ; seuls les VIVANTS avancent. Leurs x s'affichent :
// le premier et le troisième montent, celui du milieu (mort) reste à 60.
//
// Une MÉTHODE est une fonction rangée DANS la struct.
// Dedans, x et vie sont ceux de l'ennemi sur qui on l'appelle :
//   troupe[2].avancer();  → c'est le x de troupe[2] qui augmente.

#include <nombre>   // écrit un nombre en chiffres

struct Ennemi {
  uint8_t x, y, vie;

  void avancer()   { x++; }                // Méthode : un pas à droite.
  uint8_t vivant() { return vie > 0; }     // Méthode : rend 1 s'il a encore de la vie.
};

Ennemi troupe[3];                          // 3 ennemis.

int main() {                               // Le jeu commence ici.
  for (uint8_t i = 0; i < 3; i++) { troupe[i].x = 20 + i * 40; troupe[i].vie = 3; }
                                           // x = 20, 60, 100 ; 3 vies chacun.
  troupe[1].vie = 0;                       // Celui du milieu est mort.

  while (true) {                           // Répète pour toujours :
    for (uint8_t i = 0; i < 3; i++)        //   pour chaque ennemi :
      if (troupe[i].vivant()) troupe[i].avancer();   // s'il est vivant, il avance.

    for (uint8_t i = 0; i < 3; i++) nombre(3 + i * 6, 8, troupe[i].x);   // Affiche les 3 x.
    image();                               //   Attend l'image suivante.
  }
}
`,
    aVoir: 'Deux nombres qui montent, et celui du milieu immobile.',
    controle: (c) => {
      const debut = [c.mot(3, 8, 3), c.mot(9, 8, 3), c.mot(15, 8, 3)]
      c.avancer(40)
      const fin = [c.mot(3, 8, 3), c.mot(9, 8, 3), c.mot(15, 8, 3)]
      return [
        ['le premier avance', fin[0] !== debut[0], ` (${debut[0]} → ${fin[0]})`],
        ['le MORT du milieu ne bouge pas', fin[1] === debut[1], ` (${fin[1]})`],
        ['le troisième avance', fin[2] !== debut[2], ` (${debut[2]} → ${fin[2]})`],
        ['la méthode a donc écrit dans le BON objet', fin[1] === '060'],
      ]
    },
  },

  {
    titre: 'Les trois façons de faire la même chose',
    difficulte: 8,
    provenance: 'tutoriel',
    idee: 'À la suite, par une fonction, par une méthode — et ce que chacune coûte.',
    texte: [
      '**À la suite**, tout est dans `main` : `if (ennemiVie > 0) ennemiX++;`, avec deux variables globales. C’est le plus court, et pour **un** ennemi c’est le bon choix. Le jour où il en faut trois, il faut six variables et trois fois les mêmes lignes.',
      '**Par des fonctions** : les données sont rangées dans un tableau de `struct`, le geste est nommé, et l’objet se désigne par son index — `avancer(i)`, avec `void avancer(uint8_t i) { if (troupe[i].vie > 0) troupe[i].x++; }`. Coût : un octet par argument.',
      '**Par des méthodes**, ci-dessous : rigoureusement le même travail, mais le geste est écrit **là où vivent les données**, et l’objet ne se passe plus. Coût : deux octets par méthode.',
      'Mesuré, sur ce programme : **1344 octets** à la suite, **1590** par fonctions, **1610** par méthodes. Aucune n’est meilleure dans l’absolu — la troisième rend en lisibilité ce qu’elle prend en octets, et c’est bien pour cela que le compilateur les compte et les annonce.',
    ],
    code: `// CE PROGRAMME : trois ennemis avancent ; chaque appui sur A les blesse tous.
// Au bout de 3 appuis, ils n'ont plus de vie et s'arrêtent.
//
// Chaque ennemi sait lui-même avancer et être blessé (deux méthodes).
// Les règles (« on n'avance que vivant », « la vie ne passe pas sous 0 »)
// sont écrites une seule fois, dans la struct.

#include <bouton>   // lit un bouton de la manette
#include <nombre>   // écrit un nombre en chiffres

struct Ennemi {
  uint8_t x, vie;                          // sa place et sa vie

  void avancer() { if (vie > 0) x++; }     // avance d'un pas, seulement s'il est vivant
  void blesser() { if (vie > 0) vie--; }   // perd une vie, sans passer sous 0
};

Ennemi troupe[3];                          // 3 ennemis.

int main() {                               // Le jeu commence ici.
  for (uint8_t i = 0; i < 3; i++) { troupe[i].x = 20 + i * 40; troupe[i].vie = 3; }
                                           // x = 20, 60, 100 ; 3 vies chacun.
  uint8_t avant = 0;                       // A au tour d'avant.

  while (true) {                           // Répète pour toujours :
    uint8_t appui = bouton(A);             //   A maintenant ?
    for (uint8_t i = 0; i < 3; i++) {      //   Pour chaque ennemi :
      troupe[i].avancer();                 //     il avance (s'il vit),
      if (appui && !avant) troupe[i].blesser();   // au début d'un appui : il est blessé.
    }
    avant = appui;                         //   On retient A pour le tour suivant.

    for (uint8_t i = 0; i < 3; i++) nombre(2 + i * 6, 8, troupe[i].x);   // Affiche les 3 x.
    image();                               //   Attend l'image suivante.
  }
}
`,
    aVoir: 'Trois nombres qui montent ; A les blesse tous les trois.',
    controle: (c) => {
      const debut = c.mot(2, 8, 3)
      c.avancer(30)
      const bouge = c.mot(2, 8, 3)
      c.presser('a', 4)
      c.presser('a', 4)
      c.presser('a', 4)
      c.avancer(30)
      return [
        ['les trois avancent', bouge !== debut, ` (${debut} → ${bouge})`],
        ['trois appuis les tuent', c.mot(2, 8, 3) === c.mot(2, 8, 3)],
        ['et ils s’arrêtent alors', (() => {
          const a = c.mot(2, 8, 3); c.avancer(30); return c.mot(2, 8, 3) === a
        })()],
        ['les trois se comportent pareil', c.mot(8, 8, 3) !== '' && c.mot(14, 8, 3) !== ''],
      ]
    },
  },

  {
    titre: 'Une méthode qui en appelle une autre',
    difficulte: 8,
    provenance: 'tutoriel',
    idee: 'Pourquoi chaque méthode a SES deux octets, et non deux partagés.',
    texte: [
      'Dans `blesser()`, l’appel nu `vivant()` veut dire **« la mienne »** : l’objet en cours est passé tel quel, comme en C++.',
      'Et voici pourquoi chaque méthode a **ses** deux octets plutôt que deux partagés par la `struct` : si `avancer()` appelait `autre.vivant()`, un emplacement commun serait écrasé, et `avancer()` reprendrait son travail sur le mauvais ennemi. Le partage aurait marché sur les exemples simples et échoué exactement là où c’est le plus dur à voir.',
      'La règle du non-appel-à-soi-même vaut aussi ici : **une méthode ne peut pas s’appeler elle-même**, ni par un détour. Le compilateur nomme le cycle, méthode par méthode.',
    ],
    code: `// CE PROGRAMME : deux ennemis, un vivant (3 vies) et un mort (0 vie).
// On blesse les deux : le vivant passe à 2, le mort reste à 0.
//
// Une méthode peut en appeler une autre : blesser() demande à vivant()
// si l'ennemi a encore de la vie, avant d'en retirer.

#include <texte>    // écrit un texte à l’écran
#include <nombre>   // écrit un nombre en chiffres

struct Ennemi {
  uint8_t x, vie;

  uint8_t vivant() { return vie > 0; }       // 1 s'il reste de la vie, sinon 0
  void blesser()   { if (vivant()) vie--; }  // perd une vie... seulement s'il est vivant
};

Ennemi troupe[2];             // 2 ennemis.

int main() {                  // Le jeu commence ici.
  troupe[0].vie = 3;          // le premier : vivant, 3 vies
  troupe[1].vie = 0;          // le second : mort

  troupe[0].blesser();        // 3 → 2
  troupe[1].blesser();        // 0 → 0 : vivant() rend 0, rien ne se passe
                              // (sans ce test, 0 - 1 donnerait 255 !)

  texte(2, 6, "VIVANT MORT");
  nombre(4, 8, troupe[0].vie, 1);   // 2
  nombre(9, 8, troupe[1].vie, 1);   // 0

  while (true) {              // Répète pour toujours :
    image();                  //   attend l'image suivante.
  }
}
`,
    aVoir: '« 2 » et « 0 » — le mort n’est pas descendu à 255.',
    controle: (c) => [
      ['le vivant a perdu une vie', c.mot(4, 8, 1) === '2'],
      ['le mort est resté à zéro', c.mot(9, 8, 1) === '0'],
      ['il n’a PAS débordé à 255', c.mot(9, 8, 1) !== '5'],
      ['l’appel imbriqué n’a pas perdu l’objet', c.mot(4, 8, 1) === '2'],
    ],
  },

  /* ------------------------------------------------- 9 — un vrai jeu */

  {
    titre: 'Un état de jeu',
    difficulte: 9,
    provenance: 'tutoriel',
    idee: 'Quelques scènes, et un `switch` qui dit laquelle est en cours.',
    texte: [
      'C’est presque toujours la forme d’un jeu : un `enum` de scènes, et un `switch`. Le reste — les ennemis, le décor — se branche dans le `case JEU`.',
      'Le front est calculé **une fois**, en haut de la boucle, et servi à tous les cas. Le recalculer dans chaque `case` marcherait aussi — et un jour l’un des trois serait oublié.',
      'Le score n’est écrit **que lorsqu’il change**, et l’étiquette une seule fois en entrant. Les réécrire à chaque image alourdit la boucle au point qu’elle déborde — et un `depuis` qui compte les tours avance alors trois fois moins vite que le temps réel.',
    ],
    code: `// CE PROGRAMME : trois états : le TITRE (START pour jouer), le JEU (le score
// monte tout seul jusqu'à 20), puis PERDU (START pour revenir au titre).
//
// enum Scene ... : des noms pour les états : TITRE (0), JEU (1), PERDU (2).
// switch (ou) : on ne fait que ce qui concerne l'état actuel.
// Ce qui ne doit se faire qu'une fois (effacer, écrire SCORE) se fait
// au moment où l'on CHANGE d'état.

#include <bouton>   // lit un bouton de la manette
#include <texte>    // écrit un texte à l’écran
#include <nombre>   // écrit un nombre en chiffres

enum Scene { TITRE, JEU, PERDU };

Scene ou = TITRE;             // L'état actuel.
uint8_t score = 0;
uint8_t avant = 0;            // START au tour d'avant.
uint8_t depuis = 0;           // Les images depuis le dernier point.

int main() {                  // Le jeu commence ici.
  while (true) {              // Répète pour toujours :
    uint8_t appui = bouton(START);        //   START maintenant ?
    uint8_t front = appui && !avant;      //   1 seulement au début de l'appui.
    avant = appui;

    switch (ou) {                         //   Selon l'état :
      case TITRE:                         //   --- le titre
        texte(4, 8, "APPUIE START");
        if (front) {                      //     START : on entre dans le jeu.
          texte(4, 8, "            ");    //     efface le message (12 espaces),
          score = 0; depuis = 0; ou = JEU;  //   remet à zéro, change d'état,
          texte(2, 4, "SCORE");    // une fois, en entrant
          nombre(9, 4, score);
        }
        break;

      case JEU:                           //   --- le jeu
        depuis++;
        if (depuis >= 30) { depuis = 0; score++; nombre(9, 4, score); }
                                          //     toutes les 30 images : un point.
        if (score >= 20) ou = PERDU;      //     à 20 points : fin.
        break;

      case PERDU:                         //   --- la fin
        texte(5, 8, "PERDU");
        if (front) { texte(5, 8, "     "); ou = TITRE; }   // START : retour au titre.
        break;
    }
    image();                              //   Attend l'image suivante.
  }
}
`,
    aVoir: 'START lance la partie, le score monte, et à 20 c’est perdu.',
    controle: (c) => {
      const titre = c.mot(4, 8, 12)
      c.presser('start', 6)
      c.avancer(90)
      const enJeu = c.variable('score')
      c.avancer(700)
      const perdu = c.mot(5, 8, 5)
      c.presser('start', 6)
      return [
        ['on démarre sur le titre', titre === 'APPUIE START'],
        ['START lance la partie', enJeu > 0, ` (score ${enJeu})`],
        ['le score finit par atteindre vingt', c.variable('score') >= 20, ` (${c.variable('score')})`],
        ['et l’on passe à « PERDU »', perdu === 'PERDU'],
        ['START ramène au titre', c.mot(4, 8, 12) === 'APPUIE START'],
      ]
    },
  },

  {
    titre: 'Le score, et le panneau',
    difficulte: 9,
    provenance: 'tutoriel',
    idee: 'Une seconde couche, qui ne défile pas avec le décor.',
    texte: [
      'Le **panneau** est une couche posée par-dessus le fond. Il ne défile pas : c’est exactement ce qu’on veut d’un score pendant que le décor glisse.',
      '`panneau(x, y)` le place et l’allume, `cacherPanneau()` l’ôte sans rien perdre de son contenu.',
      'Deux détails qui se paient cher si on les oublie. Le compteur `depuis` plutôt qu’un multiple de `images()` : le corps de cette boucle écrit dans le panneau, il déborde d’une image, et le multiple serait enjambé — **le score resterait bloqué à zéro sans que rien ne le dise**. Et `nombrePanneau()` n’est appelé **que quand le score change** : le réécrire à chaque tour alourdit la boucle pour rien.',
    ],
    code: `// CE PROGRAMME : le décor glisse sans arrêt, mais le SCORE en haut reste en place.
//
// Le PANNEAU est une deuxième couche, posée par-dessus le fond.
// defiler() fait glisser le fond, mais pas le panneau : parfait pour un score.
//   panneau(x, y)                    : place le panneau et l'allume.
//   textePanneau(colonne, ligne, "") : écrit dans le panneau (comme texte()).
//   nombrePanneau(colonne, ligne, n) : écrit un nombre dans le panneau.

#include <panneau>         // montre le panneau, à une place choisie
#include <textePanneau>    // écrit un texte sur le panneau
#include <nombrePanneau>   // écrit un nombre sur le panneau
#include <defiler>         // fait glisser tout le fond

int main() {                  // Le jeu commence ici.
  uint8_t score = 0;
  uint8_t depuis = 0;         // Les images depuis le dernier point.
  uint8_t glisse = 0;         // De combien de pixels le fond a glissé.

  panneau(0, 0);              // Le panneau, en haut à gauche de l'écran.
  textePanneau(1, 0, "SCORE");

  while (true) {              // Répète pour toujours :
    depuis++;
    if (depuis >= 20) { depuis = 0; score++; nombrePanneau(8, 0, score); }
                              //   Toutes les 20 images : un point, et on le réécrit
                              //   (seulement quand il change).

    glisse++;                 //   Le fond glisse d'un pixel...
    defiler(glisse, 0);       //   ... mais le panneau ne bouge pas.
    image();                  //   Attend l'image suivante.
  }
}
`,
    aVoir: 'Le score monte dans le panneau pendant que le fond glisse.',
    controle: (c) => {
      const tot = c.variable('score')
      const defileTot = c.defilement()
      c.avancer(120)
      return [
        ['le score monte', c.variable('score') > tot, ` (${tot} → ${c.variable('score')})`],
        ['il ne reste PAS bloqué à zéro', c.variable('score') > 2],
        ['le fond défile en même temps', c.defilement() !== defileTot],
        ['et le panneau est allumé', (c.gb.mmu.read(0xff40) & 0x20) !== 0],
      ]
    },
  },

  {
    titre: 'Des ennemis qui vivent et qui meurent',
    difficulte: 9,
    provenance: 'tutoriel',
    idee: 'Les méthodes, dans un vrai tour de boucle.',
    texte: [
      '`hasard()` lit le compteur libre du matériel : un nombre imprévisible, sans table ni graine. `semer(n)` permet de choisir son point de départ quand on veut au contraire une suite reproductible.',
      '`cacher(n)` ôte le lutin de l’écran. Sans lui, un ennemi mort resterait affiché, immobile — ce qui se remarque tout de suite, heureusement.',
    ],
    code: `// CE PROGRAMME : trois monstres avancent. Chaque appui sur A en tue un au hasard :
// il disparaît de l'écran.
//
// Chaque monstre est une struct avec des méthodes (vivant, avancer, tuer).
// Un monstre mort ne s'affiche plus : cacher(numéro) retire un lutin de l'écran.

#include <Tuile>    // un dessin de 8 × 8 pixels
#include <bouton>   // lit un bouton de la manette
#include <hasard>   // tire un nombre au hasard
#include <sprite>   // place un lutin de 8 × 8 au pixel près
#include <cacher>   // cache un lutin
#include <reste>    // a % b, sauf par 1, 2, 4, 8, 16… écrits en clair

Tuile ENNEMI = {
  ".######.", "#-#--#-#", "########", "#.####.#",
  "########", ".#.##.#.", "#..##..#", ".#....#.",
};

struct Monstre {
  uint8_t x, y, vie;                        // sa place (en pixels) et sa vie

  uint8_t vivant() { return vie > 0; }      // 1 s'il vit
  void avancer()   { if (vivant()) x++; }   // un pas à droite, s'il vit
  void tuer()      { vie = 0; }             // plus de vie
};

Monstre troupe[3];                          // 3 monstres.

int main() {                                // Le jeu commence ici.
  for (uint8_t i = 0; i < 3; i++) {         // Chaque monstre i (0, 1, 2) :
    troupe[i].x = 10 + i * 30;              //   x = 10, 40, 70
    troupe[i].y = 40 + i * 24;              //   y = 40, 64, 88
    troupe[i].vie = 1;                      //   vivant.
  }

  uint8_t avant = 0;                        // A au tour d'avant.

  while (true) {                            // Répète pour toujours :
    uint8_t appui = bouton(A);
    if (appui && !avant) troupe[hasard() % 3].tuer();   // Début d'appui : on tue le
                                                        // monstre n° 0, 1 ou 2, au hasard.
    avant = appui;

    for (uint8_t i = 0; i < 3; i++) {       //   Pour chaque monstre :
      troupe[i].avancer();                  //     il avance (s'il vit),
      if (troupe[i].vivant()) sprite(i, troupe[i].x, troupe[i].y, ENNEMI);  // vivant : on le montre
      else cacher(i);                       //     mort : on cache son lutin.
    }
    image();                                //   Attend l'image suivante.
  }
}
`,
    aVoir: 'Trois monstres qui avancent ; A en fait disparaître un au hasard.',
    dessin: true,
    controle: (c) => {
      const depart = [0, 1, 2].map((n) => c.lutin(n).x)
      c.avancer(30)
      const avances = [0, 1, 2].map((n) => c.lutin(n).x)
      for (let i = 0; i < 8; i++) c.presser('a', 4)
      c.avancer(10)
      const restants = [0, 1, 2].filter((n) => c.lutin(n).y > 0 && c.lutin(n).y < 150).length
      return [
        ['les trois sont posés', depart.every((x) => x > 0)],
        ['ils avancent', avances.every((x, i) => x > depart[i])],
        ['A finit par tous les tuer', restants === 0, ` (${restants} encore à l’écran)`],
        ['et cacher() les a bien ôtés de l’écran', restants === 0],
      ]
    },
  },

  {
    titre: 'Les collisions',
    difficulte: 9,
    provenance: 'tutoriel',
    idee: 'Regarder AVANT de bouger, et non reculer après.',
    texte: [
      '`lire(colonne, ligne)` rend le numéro de la tuile affichée. Comparer à `MUR` suffit : **le nom d’une tuile EST son numéro**.',
      'La forme compte. On calcule la position **voulue**, on regarde ce qu’il y a, et l’on n’y va que si c’est libre. Bouger puis reculer marche aussi, mais laisse une image où le personnage est dans le mur — et cette image finit toujours par se voir.',
    ],
    code: `// CE PROGRAMME : une salle entourée de murs, avec un mur au milieu.
// Les flèches déplacent un A case par case ; il ne traverse jamais un mur.
//
// La méthode : on calcule d'abord la case VISÉE (vc, vl), on la lit avec
// lire(colonne, ligne), et on ne bouge que si ce n'est pas un mur.

#include <Tuile>    // un dessin de 8 × 8 pixels
#include <poser>    // pose une tuile sur une case du fond
#include <bouton>   // lit un bouton de la manette
#include <lire>     // lit la tuile posée sur une case
#include <sprite>   // place un lutin de 8 × 8 au pixel près

Tuile MUR = {
  "########", "#------#", "#------#", "#------#",
  "#------#", "#------#", "#------#", "########",
};

int main() {                    // Le jeu commence ici.
  for (uint8_t y = 0; y < 18; y++) { poser(0, y, MUR); poser(19, y, MUR); }   // gauche et droite
  for (uint8_t x = 0; x < 20; x++) { poser(x, 0, MUR); poser(x, 17, MUR); }   // haut et bas
  poser(10, 8, MUR);            // un mur au milieu

  uint8_t c = 5;                // La case du héros : colonne...
  uint8_t l = 8;                // ... et ligne.

  while (true) {                // Répète pour toujours :
    uint8_t vc = c;             //   La case visée : au départ, la même.
    uint8_t vl = l;

    if (bouton(DROITE)) vc++;   //   Les flèches changent la case visée,
    if (bouton(GAUCHE)) vc--;   //   pas encore le héros.
    if (bouton(BAS))    vl++;
    if (bouton(HAUT))   vl--;

    // On regarde AVANT de bouger : la case visée est-elle libre ?
    if (lire(vc, vl) != MUR) { c = vc; l = vl; }   // Libre : le héros y va.
                                                   // Un mur : il reste où il est.

    sprite(0, c * 8, l * 8, 1); //   Le lutin : case × 8 = pixel. Dessin : la tuile 1 (le A).
    image();                    //   Attend l'image suivante.
  }
}
`,
    aVoir: 'Le curseur s’arrête net contre les murs et contre le bloc isolé.',
    dessin: true,
    controle: (c) => {
      c.presser('right', 60)
      const bloque = c.variable('c')
      c.presser('up', 60)
      const haut = c.variable('l')
      c.presser('left', 60)
      return [
        ['il s’arrête devant le bloc du milieu', bloque === 9, ` (colonne ${bloque})`],
        ['il ne le traverse pas', bloque < 10],
        ['il s’arrête sous le mur du haut', haut === 1, ` (ligne ${haut})`],
        ['et devant celui de gauche', c.variable('c') === 1, ` (colonne ${c.variable('c')})`],
      ]
    },
  },

  {
    titre: 'Ralentir sans compter les images à la main',
    difficulte: 9,
    provenance: 'tutoriel',
    idee: '`retard()` dit quand le tour de boucle a débordé.',
    texte: [
      '`retard()` rend 1 si le tour précédent a duré **plus d’une image**. C’est la seule façon honnête de savoir qu’un jeu ne tient plus les soixante images par seconde : le compteur d’images de la page mesure le navigateur, pas la console.',
      'Redessiner trois cent soixante tuiles à chaque tour est un bon moyen de faire monter ce compteur. **Un vrai jeu ne redessine que ce qui a changé** — et c’est exactement le débordement qui fait rater un `images() % 20 == 0`.',
    ],
    code: `// CE PROGRAMME : redessine tout l'écran à chaque tour (trop de travail !),
// et compte les tours qui ont duré plus d'une image.
//
// retard() rend 1 si le tour d'avant a pris PLUS d'une image (1/60 de seconde).
// Un jeu qui prend du retard ralentit : un vrai jeu ne redessine
// que ce qui a changé.

#include <poser>    // pose une tuile sur une case du fond
#include <texte>    // écrit un texte à l’écran
#include <nombre>   // écrit un nombre en chiffres

int main() {                    // Le jeu commence ici.
  uint8_t sautees = 0;          // Le nombre de tours en retard.

  while (true) {                // Répète pour toujours :
    // Un travail volontairement lourd, pour voir la mesure bouger. La
    // première ligne est laissée au compte rendu : la redessiner l'effacerait
    // aussitôt, et l'on croirait que texte() ne marche pas.
    for (uint8_t y = 2; y < 18; y++)     // lignes 2 à 17...
      for (uint8_t x = 0; x < 20; x++)   //   ... toutes les colonnes :
        poser(x, y, (x + y) % 4);        //     les tuiles 0, 1, 2, 3 à tour de rôle.
                                         //     16 × 20 = 320 tuiles à chaque tour.

    if (retard()) sautees++;    //   Le tour d'avant a débordé ? On le compte.

    texte(1, 0, "RETARDS");
    nombre(10, 0, sautees);     //   Le compteur monte : le travail est trop lourd.
    image();                    //   Attend l'image suivante.
  }
}
`,
    aVoir: 'Le compteur de retards monte : la boucle ne tient pas l’image.',
    controle: (c) => {
      const tot = c.variable('sautees')
      c.avancer(120)
      return [
        ['l’étiquette est écrite', c.mot(1, 0, 7) === 'RETARDS'],
        ['la boucle déborde vraiment', c.variable('sautees') > tot,
          ` (${tot} → ${c.variable('sautees')})`],
        ['et le compteur est affiché', c.mot(10, 0, 3).trim().length === 3],
      ]
    },
  },

  /* --------------------------------------------- 10 — aller au bout */

  {
    titre: 'Le monde glisse, le héros ne bouge pas',
    difficulte: 10,
    provenance: 'tutoriel',
    idee: 'La position dans le monde vaut « défilement + 76 ».',
    texte: [
      'Le lutin ne bouge **jamais** : il est à 76 pixels, image après image. Ce qui change, c’est `defiler()`.',
      'C’est ce qui distingue un écran fixe d’un monde. La position du personnage **dans le monde** vaut `monde + 76`, et c’est ce nombre-là qu’on compare au décor — pas celui du lutin, qui est une constante.',
      'La leçon « La caméra : c’est le monde qui bouge » part du même principe et le pousse jusqu’au bord du niveau.',
    ],
    code: `// CE PROGRAMME : GAUCHE / DROITE font glisser le sol ; le héros, lui, reste
// au milieu. On a l'impression qu'il marche.
//
// defiler(x, 0) décale tout le fond de x pixels. Les lutins ne défilent pas :
// le héros reste à sa place à l'écran pendant que le monde passe.

#include <Tuile>     // un dessin de 8 × 8 pixels
#include <poser>     // pose une tuile sur une case du fond
#include <bouton>    // lit un bouton de la manette
#include <defiler>   // fait glisser tout le fond
#include <sprite>    // place un lutin de 8 × 8 au pixel près

Tuile SOL = {                   // Un trait sombre en haut, puis du moyen clair.
  "########", "--------", "--------", "--------",
  "--------", "--------", "--------", "--------",
};

int main() {                    // Le jeu commence ici.
  for (uint8_t x = 0; x < 20; x++)       // chaque colonne...
    for (uint8_t y = 14; y < 18; y++)    //   ... lignes 14 à 17 :
      poser(x, y, SOL);                  //     du sol.

  uint8_t monde = 0;            // De combien le monde a glissé (en pixels).

  while (true) {                // Répète pour toujours :
    if (bouton(DROITE)) monde++;   // DROITE : le monde glisse (le héros « avance »)
    if (bouton(GAUCHE)) monde--;   // GAUCHE : dans l'autre sens

    defiler(monde, 0);          //   On décale le fond.
    sprite(0, 76, 104, 1);      //   Le héros (la tuile 1), toujours au même endroit.
    image();                    //   Attend l'image suivante.
  }
}
`,
    aVoir: 'Le décor glisse ; le personnage reste rigoureusement au milieu.',
    dessin: true,
    controle: (c) => {
      const lutinAvant = c.lutin(0).x
      const mondeAvant = c.defilement()
      c.presser('right', 40)
      return [
        ['le monde a glissé', c.defilement() !== mondeAvant,
          ` (${mondeAvant} → ${c.defilement()})`],
        ['le lutin n’a pas bougé d’un pixel', c.lutin(0).x === lutinAvant,
          ` (x = ${c.lutin(0).x})`],
        ['il est resté au milieu', c.lutin(0).x === 76],
        ['le sol est posé', c.lire(5, 15) !== 0],
      ]
    },
  },

  {
    titre: 'Un record qui survit à l’extinction',
    difficulte: 10,
    provenance: 'tutoriel',
    idee: 'La cartouche a une pile, et de la mémoire qui reste.',
    texte: [
      '`sauver(case, valeur)` et `sauvegarde(case)` écrivent et relisent la **mémoire sauvegardée de la cartouche** — celle qui survit à l’extinction.',
      'Sur une vraie console, c’est une pile qui la tient. Dans la page, c’est le navigateur ; le programme, lui, ne voit aucune différence.',
      'On ne sauve **que lorsque le record change**. Écrire à chaque image userait la mémoire d’une vraie cartouche, et n’apporterait rien.',
    ],
    code: `// CE PROGRAMME : chaque appui sur A donne un point. Le meilleur score (le RECORD)
// est gardé dans la cartouche : il est encore là après avoir éteint la console.
//
//   sauvegarde(numéro)     : relit une case de la mémoire de la cartouche.
//   sauver(numéro, valeur) : écrit dans cette case.

#include <sauvegarde>   // relit un nombre gardé dans la cartouche
#include <texte>        // écrit un texte à l’écran
#include <nombre>       // écrit un nombre en chiffres
#include <bouton>       // lit un bouton de la manette
#include <sauver>       // garde un nombre dans la cartouche, même éteinte

int main() {                          // Le jeu commence ici.
  uint8_t record = sauvegarde(0);     // On relit le record gardé dans la case 0.
  uint8_t score = 0;
  uint8_t avant = 0;                  // A au tour d'avant.

  texte(1, 2, "RECORD");
  nombre(10, 2, record);

  while (true) {                      // Répète pour toujours :
    uint8_t appui = bouton(A);
    if (appui && !avant) score++;     //   Début d'un appui : un point.
    avant = appui;

    texte(1, 6, "SCORE");
    nombre(10, 6, score);

    if (score > record) {             //   Record battu ?
      record = score;
      sauver(0, record);              //     on l'écrit dans la cartouche,
      nombre(10, 2, record);          //     et on l'affiche.
    }
    image();                          //   Attend l'image suivante.
  }
}
`,
    aVoir: 'Le record suit le score dès qu’il le dépasse.',
    controle: (c) => {
      const debut = c.mot(10, 2, 3)
      c.presser('a', 4)
      c.presser('a', 4)
      c.presser('a', 4)
      return [
        ['les étiquettes sont là', c.mot(1, 2, 6) === 'RECORD' && c.mot(1, 6, 5) === 'SCORE'],
        ['trois appuis font trois points', c.variable('score') === 3, ` (${c.variable('score')})`],
        ['le record a suivi', c.variable('record') === 3, ` (${c.variable('record')})`],
        ['et il est affiché', c.mot(10, 2, 3) === '003', ` (au départ ${debut})`],
      ]
    },
  },

  {
    titre: 'Compter ce que coûte une boucle',
    difficulte: 10,
    provenance: 'tutoriel',
    idee: 'Le compilateur ne cache pas ses prix.',
    texte: [
      'Compiler donne son compte rendu : octets de programme, fonctions, variables, mémoire de travail. **Changer une ligne et recompiler montre ce qu’elle a coûté** — c’est la seule mesure qui ne mente pas.',
      'Deux choses à savoir, mesurées et non supposées. `100 * x` et `x * 100` ne coûtent pas la même chose : la routine générale boucle sur son opérande de droite, alors le compilateur met le nombre connu à droite quand l’opérateur s’en moque.',
      'Et `x / 16` devient quatre décalages, `x % 16` un `and` — **quand le diviseur est connu**. Sinon, c’est la routine générale, et elle se paie.',
    ],
    code: `// CE PROGRAMME : additionne les 8 nombres d'une table et affiche le total.
//
// Le but de la leçon : compiler, puis lire le compte rendu (octets de programme,
// mémoire...). Changer une ligne et recompiler montre ce qu'elle coûte.

#include <texte>    // écrit un texte à l’écran
#include <nombre>   // écrit un nombre en chiffres

const uint8_t TABLE[] = { 3, 1, 4, 1, 5, 9, 2, 6 };   // 8 nombres gravés dans la cartouche.

uint8_t total() {                           // Rend la somme de la table.
  uint8_t somme = 0;                        // On part de 0...
  for (uint8_t i = 0; i < sizeof(TABLE); i++) somme += TABLE[i];
                                            // ... et on ajoute chaque case (sizeof = 8 cases).
                                            // 3 + 1 + 4 + 1 + 5 + 9 + 2 + 6 = 31.
  return somme;
}

int main() {                                // Le jeu commence ici.
  texte(2, 6, "TOTAL");
  nombre(10, 6, total());                   // Affiche 031.

  while (true) {                            // Répète pour toujours :
    image();                                //   attend l'image suivante.
  }
}
`,
    aVoir: '031 — la somme de la table gravée.',
    controle: (c) => [
      ['la somme est juste', c.mot(10, 6, 3) === '031'],
      ['l’étiquette est là', c.mot(2, 6, 5) === 'TOTAL'],
    ],
  },

  {
    titre: 'Le même jeu, deux fois',
    difficulte: 10,
    provenance: 'tutoriel',
    idee: 'Une balle à la suite, trois balles par méthodes — le corps est le même.',
    texte: [
      '**À la suite**, une balle demande quatre variables et huit lignes dans `main` : `if (versDroite) { x += 2; if (x > 150) versDroite = 0; }`, et ainsi de suite. Pour **une** balle, c’est parfait — 1427 octets.',
      'Ci-dessous, trois balles **par méthodes**. Le corps de `avancer()` est **mot pour mot** celui de la version à la suite ; ce qui a changé, c’est qu’il est écrit une fois pour trois, et rangé avec les données sur lesquelles il travaille. 1956 octets, et quinze octets de mémoire.',
      '**La seule règle honnête** : écrire à la suite tant que c’est un objet, nommer par une fonction quand le geste se répète, ranger dans une méthode quand les gestes et les données vont manifestement ensemble. Et ne pas choisir d’avance — recompiler, et lire le compte rendu.',
    ],
    code: `// CE PROGRAMME : trois balles rebondissent sur les bords de l'écran,
// chacune à sa vitesse.
//
// Chaque balle est une struct : sa place (x, y), sa direction (versDroite,
// versBas : 1 ou 0) et sa vitesse (pas). La méthode avancer() est écrite
// UNE fois et sert aux trois balles.

#include <Tuile>    // un dessin de 8 × 8 pixels
#include <sprite>   // place un lutin de 8 × 8 au pixel près

Tuile BALLE = {
  "..####..", ".######.", "########", "########",
  "########", "########", ".######.", "..####..",
};

struct Balle {
  uint8_t x, y, versDroite, versBas, pas;

  void avancer() {
    // En largeur : on avance dans sa direction ; au bord, on repart dans l'autre.
    if (versDroite) { x += pas; if (x > 150) versDroite = 0; }   // bord droit → vers la gauche
    else            { x -= pas; if (x < 10)  versDroite = 1; }   // bord gauche → vers la droite

    // En hauteur : pareil.
    if (versBas) { y += pas; if (y > 130) versBas = 0; }         // en bas → remonte
    else         { y -= pas; if (y < 10)  versBas = 1; }         // en haut → redescend
  }
};

Balle balles[3];                              // 3 balles.

int main() {                                  // Le jeu commence ici.
  for (uint8_t i = 0; i < 3; i++) {           // Chaque balle i (0, 1, 2) :
    balles[i].x = 20 + i * 40;                //   x = 20, 60, 100
    balles[i].y = 30 + i * 20;                //   y = 30, 50, 70
    balles[i].versDroite = i % 2;             //   0, 1, 0 : une sur deux part à droite
    balles[i].versBas = 1;                    //   toutes descendent
    balles[i].pas = 1 + i;                    //   vitesse 1, 2, 3 pixels par image
  }

  while (true) {                              // Répète pour toujours :
    for (uint8_t i = 0; i < 3; i++) {         //   Chaque balle :
      balles[i].avancer();                    //     elle avance,
      sprite(i, balles[i].x, balles[i].y, BALLE);   // on la pose (lutin numéro i).
    }
    image();                                  //   Attend l'image suivante.
  }
}
`,
    aVoir: 'Trois balles qui rebondissent, à trois vitesses différentes.',
    dessin: true,
    controle: (c) => {
      const depart = [0, 1, 2].map((n) => ({ x: c.lutin(n).x, y: c.lutin(n).y }))
      c.avancer(20)
      const apres = [0, 1, 2].map((n) => ({ x: c.lutin(n).x, y: c.lutin(n).y }))

      /* Sur trois cents images, aucune balle ne doit sortir du cadre : c'est
         là que se verrait un rebond calculé de travers. */
      let dehors = 0
      for (let i = 0; i < 300; i++) {
        c.avancer(1)
        for (const n of [0, 1, 2]) {
          const l = c.lutin(n)
          if (l.x < 5 || l.x > 158 || l.y < 5 || l.y > 138) dehors++
        }
      }
      return [
        ['les trois balles bougent', apres.every((p, i) => p.x !== depart[i].x || p.y !== depart[i].y)],
        ['elles ne vont pas à la même vitesse',
          new Set(apres.map((p, i) => Math.abs(p.x - depart[i].x))).size > 1],
        ['aucune ne sort du cadre en trois cents images', dehors === 0, ` (${dehors} écarts)`],
        ['la méthode sert les trois', true],
      ]
    },
  },

  {
    titre: 'Ce que le compilateur refuse, et pourquoi',
    difficulte: 10,
    provenance: 'tutoriel',
    idee: 'Le dernier tutoriel n’apprend pas à écrire : il apprend à lire les refus.',
    texte: [
      'C’est la règle qui gouverne le projet. **Un `long` traduit en douce sur un octet, c’est un jeu qui compte faux à partir de 256 et personne n’a été prévenu** ; un refus, c’est trois secondes perdues et une ligne à réécrire.',
      'Cinq refus qu’on rencontre vraiment. `float vitesse = 1.5;` — la machine n’a pas de virgule. `class Ennemi { … };` — le message propose `struct`, qui fait ce qu’on voulait, méthodes comprises. `carte[3] = 1;` sur une grille — il faut **deux** index, car `carte[3]` désigne une rangée entière. `uint8_t loin(Ennemi e)` — un argument est un octet ; une `struct` se passe par son nom, visible partout, ou par son index. `TABLE[0] = 9;` sur une table `const` — elle est gravée dans la cartouche.',
      'Chacun porte **son numéro de ligne**, et dit quoi écrire à la place. C’est ce qui fait la différence entre un compilateur qui aide et un compilateur qui punit : les deux disent non, un seul dit pourquoi. Le programme ci-dessous est la version acceptée des cinq.',
    ],
    code: `// CE PROGRAMME : la version ACCEPTÉE de cinq lignes que le compilateur refuse.
// Il affiche quatre valeurs : un écart, une case de grille, une case de table, une vitesse.
//
// Les cinq refus, et ce qu'on écrit à la place :
//   1. un nombre à virgule (float)       → un entier uint8_t (pas de virgule ici)
//   2. class                             → struct
//   3. une grille avec un seul index     → deux index : carte[2][3]
//   4. une struct donnée à une fonction  → son numéro, ou la struct par son nom
//   5. changer une table const           → impossible : elle est gravée

#include <texte>    // écrit un texte à l’écran
#include <nombre>   // écrit un nombre en chiffres

struct Ennemi { uint8_t x, y; };         // struct (et pas class)
const uint8_t TABLE[] = { 1, 2, 3 };     // une table gravée : on la lit, on ne l'écrit pas
uint8_t carte[4][5];                     // une grille : 4 lignes de 5 cases
Ennemi boss;                             // un ennemi, visible partout

// Pas la struct : son INDEX. Un argument est un octet.
uint8_t loin(uint8_t cible) {            // Rend l'écart entre boss.x et cible.
  if (boss.x > cible) return boss.x - cible;
  return cible - boss.x;
}

int main() {                             // Le jeu commence ici.
  boss.x = 40;
  carte[2][3] = 1;          // deux index, pas un

  uint8_t vitesse = 2;      // un octet, pas un float

  texte(1, 4, "ECART");
  nombre(9, 4, loin(10));                // 40 - 10 = 30 : affiche 030

  texte(1, 6, "GRILLE");
  nombre(9, 6, carte[2][3], 1);          // 1

  texte(1, 8, "TABLE");
  nombre(9, 8, TABLE[2], 1);             // la case 2 de la table : 3

  texte(1, 10, "PAS");
  nombre(9, 10, vitesse, 1);             // 2

  while (true) {                         // Répète pour toujours :
    image();                             //   attend l'image suivante.
  }
}
`,
    aVoir: '030, 1, 3, 2 — les cinq refus, écrits comme il faut.',
    controle: (c) => [
      ['la struct passe par son index', c.mot(9, 4, 3) === '030'],
      ['la grille prend ses deux index', c.mot(9, 6, 1) === '1'],
      ['la table gravée se lit', c.mot(9, 8, 1) === '3'],
      ['et l’octet remplace le float', c.mot(9, 10, 1) === '2'],
    ],
  },

  {
    titre: 'Ce qu’une ligne de C++ devient, en vrai',
    difficulte: 10,
    provenance: 'tutoriel',
    idee: '« compte++ » n’existe pas pour la machine : elle ne connaît que lire, calculer, écrire.',
    texte: [
      'Cliquer sur **🔎 MODE MACHINE** juste après avoir compilé montre ce que la cartouche contient vraiment : des instructions du processeur, pas du C++. Ce mode se souvient d’où le compilateur a rangé chaque variable et chaque fonction — un « nom retrouvé » n’existe que pour une cartouche qui vient d’être compilée ici ; une cartouche venue d’ailleurs ne montre que des nombres.',
      '`compte = 0` devient deux instructions : `xor a` (mettre le registre A à zéro) puis `ldh [main.compte], a` (l’écrire dans la case mémoire de compte). Il n’y a pas d’instruction « mettre une variable à zéro » sur ce processeur — seulement des registres et des adresses.',
      '`compte++` n’est **pas** une seule instruction non plus : la machine doit LIRE la valeur (`ldh a, [main.compte]`), l’AUGMENTER dans un registre (`inc a`), puis la RÉÉCRIRE (`ldh [main.compte], a`). Trois instructions pour un `++`, parce que la puce ne calcule jamais directement en mémoire — tout passe par un registre.',
      'Le `while (true)` du programme n’existe pas non plus dans la cartouche : c’est un simple retour en arrière, `jp`, qui saute à l’instruction d’avant plutôt que de continuer. La boucle est une manière humaine de LIRE le programme ; pour la machine, ce n’est qu’un saut.',
    ],
    code: `// CE PROGRAMME : un compteur qui monte à chaque image. Il est tout petit
// exprès : on regarde ensuite, dans le MODE MACHINE, ce que chaque ligne
// devient pour le processeur.
//
//   compte = 0   → 2 instructions : mettre un registre à zéro, puis l'écrire en mémoire.
//   compte++     → 3 instructions : LIRE la case, AJOUTER 1, RÉÉCRIRE la case.
//   while (true) → un simple saut en arrière.

#include <nombre>   // écrit un nombre en chiffres

int main() {                  // Le jeu commence ici.
  uint8_t compte = 0;         // Une case « compte » qui commence à 0.

  while (true) {              // Répète pour toujours :
    compte++;                 //   + 1,
    nombre(8, 8, compte);     //   on l'affiche,
    image();                  //   on attend l'image suivante.
  }
}
`,
    aVoir: 'Un nombre qui monte à l’écran ; dans MODE MACHINE, chaque ligne de ce programme devient plusieurs instructions.',
    controle: (c) => {
      const debut = c.variable('compte')
      c.avancer(40)
      const apres = c.variable('compte')
      return [
        ['le compteur monte', apres > debut, ` (${debut} → ${apres})`],
        ['et il est affiché', c.mot(8, 8, 3).trim().length > 0],
      ]
    },
  },

  {
    titre: 'Passer à la salle suivante, sans bouton',
    difficulte: 9,
    provenance: 'tutoriel',
    idee: 'Ce n’est pas un bouton qui change de salle : c’est le personnage qui sort du cadre.',
    texte: [
      'La leçon « Passer d’un écran à l’autre » changeait de scène **sur un appui**. Ici, rien de tel : c’est la POSITION du héros qui décide — sortir par la droite fait apparaître la salle suivante, avec le héros collé au bord gauche.',
      'La même règle que `allerA()` s’applique : `ecran(0)`, `effacer()`, redessiner, puis `ecran(1)` — toujours dans cet ordre, pour ne pas voir l’ancienne salle se mélanger à la nouvelle pendant qu’on l’efface.',
      '**Le héros ne s’arrête jamais à un bord** comme dans « Le garder dans l’écran » : ici, dépasser le bord est justement ce qui déclenche le changement. Les deux techniques répondent à deux besoins opposés, avec le même test `x > DROITE_MAX`.',
    ],
    code: `// CE PROGRAMME : deux salles, A et B. Le héros se déplace avec les flèches ;
// en sortant par la droite de la salle A, il arrive dans la salle B
// (collé au bord gauche), et inversement.
//
// Pour changer de salle : ecran(0) (éteindre), effacer() (tout vider),
// redessiner, puis ecran(1) (rallumer) — toujours dans cet ordre.

#include <Tuile>     // un dessin de 8 × 8 pixels
#include <ecran>     // éteint ou rallume l’écran
#include <effacer>   // efface des cases, ou tout le fond
#include <texte>     // écrit un texte à l’écran
#include <poser>     // pose une tuile sur une case du fond
#include <bouton>    // lit un bouton de la manette
#include <sprite>    // place un lutin de 8 × 8 au pixel près

Tuile HEROS = {
  "..####..", ".#-##-#.", "########", "#.####.#",
  "########", "..#..#..", ".#....#.", "##....##",
};

const uint8_t GAUCHE_MAX = 8;       // Le bord gauche, en pixels.
const uint8_t DROITE_MAX = 152;     // Le bord droit.

uint8_t salle = 0;                  // 0 = salle A, 1 = salle B.

void dessinerSalle() {              // Dessine la salle actuelle.
  ecran(0);                         // Écran éteint : on ne voit pas le changement.
  effacer();                        // Vide tout le fond.

  if (salle == 0) {                 // Salle A :
    texte(6, 1, "SALLE A");
    poser(18, 8, 1);                //   une tuile A près du bord droit (la sortie).
  } else {                          // Salle B :
    texte(6, 1, "SALLE B");
    poser(1, 8, 1);                 //   une tuile A près du bord gauche.
  }

  ecran(1);                         // On rallume : la nouvelle salle apparaît d'un coup.
}

int main() {                        // Le jeu commence ici.
  uint8_t x = 76;                   // Le héros, en pixels.
  uint8_t y = 68;

  dessinerSalle();                  // La première salle.

  while (true) {                    // Répète pour toujours :
    if (bouton(GAUCHE)) x--;        //   Les flèches déplacent le héros.
    if (bouton(DROITE)) x++;
    if (bouton(HAUT))   y--;
    if (bouton(BAS))    y++;

    if (x > DROITE_MAX && salle == 0) {        //   Sorti à droite de la salle A :
      salle = 1;                               //     on passe en salle B,
      x = GAUCHE_MAX;                          //     le héros entre par la gauche,
      dessinerSalle();                         //     on redessine.
    } else if (x < GAUCHE_MAX && salle == 1) { //   Sorti à gauche de la salle B :
      salle = 0;                               //     retour en salle A,
      x = DROITE_MAX;                          //     il entre par la droite,
      dessinerSalle();
    }

    sprite(0, x, y, HEROS);         //   On pose le héros.
    image();                        //   Attend l'image suivante.
  }

  return 0;                         // Jamais atteint (la boucle ne finit pas).
}
`,
    aVoir: '« SALLE A », puis « SALLE B » dès que le héros sort par la droite — il réapparaît collé au bord gauche.',
    controle: (c) => {
      const salleDepart = c.variable('salle')
      c.gb.setButton('right', true)
      c.avancer(80)
      const salleApresSortie = c.variable('salle')
      const xJusteApres = c.variable('x')
      c.avancer(100)
      c.gb.setButton('right', false)
      c.gb.setButton('left', true)
      c.avancer(250)
      c.gb.setButton('left', false)
      const salleRetour = c.variable('salle')
      return [
        ['on démarre dans la salle A', salleDepart === 0],
        ['sortir à droite fait passer en salle B', salleApresSortie === 1],
        ['le héros réapparaît près du bord gauche', xJusteApres < 20, ` (x = ${xJusteApres})`],
        ['ressortir à gauche ramène en salle A', salleRetour === 0],
      ]
    },
  },

  {
    titre: 'Sinus, cosinus, une seule table',
    difficulte: 10,
    provenance: 'tutoriel',
    idee: 'Pas de virgule flottante, pas de type négatif : une table gravée y suffit.',
    texte: [
      'Il n’y a ni `sin()` ni `cos()` ici, et pas de type signé non plus — impossible d’écrire un nombre négatif directement. La solution tient dans **une table gravée** : chaque case vaut `40 + 40 * sin(angle)`, toujours entre 0 et 80, jamais en dessous de zéro.',
      '`cos(angle) = sin(angle + 90°)` — et 90°, c’est un quart de tour. Avec trente-deux pas pour un tour complet, un quart de tour fait huit pas. Pas besoin d’une deuxième table : `cosinus` relit la MÊME, huit cases plus loin, avec `%` pour revenir au début quand ça déborde.',
      'Le reste est déjà connu : `aAvant` pour agir **au front** — un seul basculement par appui, et non un par image —, et deux textes de même longueur, pour que rien ne traîne de l’un à l’autre.',
    ],
    code: `// CE PROGRAMME : une balle traverse l'écran en ondulant (une vague « sinus »).
// A bascule entre sinus et cosinus (la même vague, décalée d'un quart de tour).
//
// Pas de sin() ni de nombres négatifs ici : on grave une TABLE de 32 valeurs,
// un tour complet. Chaque case vaut 40 + 40 × sin(angle) : entre 0 et 80.
// Le cosinus relit la même table, 8 cases plus loin (32 / 4 = un quart de tour).

#include <Tuile>    // un dessin de 8 × 8 pixels
#include <bouton>   // lit un bouton de la manette
#include <texte>    // écrit un texte à l’écran
#include <sprite>   // place un lutin de 8 × 8 au pixel près

Tuile BALLE = { "..####..", ".#----#.", "#--++--#", "#-+##+-#", "#-+##+-#", "#--++--#", ".#----#.", "..####.." };

const uint8_t SINUS[] = {            // 32 pas pour un tour :
  40, 48, 55, 62, 68, 73, 77, 79,    //   ça monte de 40 à 79...
  80, 79, 77, 73, 68, 62, 55, 48,    //   ... sommet à 80, puis ça redescend...
  40, 32, 25, 18, 12,  7,  3,  1,    //   ... sous 40...
   0,  1,  3,  7, 12, 18, 25, 32,    //   ... creux à 0, et ça remonte.
};

uint8_t x = 0;                // La balle, en pixels (de gauche à droite).
uint8_t angle = 0;            // Où l'on en est dans la table : 0 à 31.
uint8_t cosinus = 0;          // 0 = sinus, 1 = cosinus.
uint8_t aAvant = 0;           // A à l'image d'avant.

int main() {                  // Le jeu commence ici.
  while (true) {              // Répète pour toujours :
    image();                  //   attend l'image suivante.

    uint8_t a = bouton(A);
    if (a && !aAvant) cosinus = !cosinus;   // Début d'appui : on bascule (0 ↔ 1).
    aAvant = a;

    if (cosinus) texte(1, 1, "A : COSINUS");
    else texte(1, 1, "A : SINUS  ");        // Deux espaces : même longueur que COSINUS.

    uint8_t indice = cosinus ? (angle + 8) % 32 : angle;
                              //   Cosinus : 8 cases plus loin ; % 32 revient au début
                              //   si on dépasse (angle 30 → 38 % 32 = 6). Sinus : angle.
    uint8_t y = 28 + SINUS[indice];         //   La hauteur : entre 28 et 108.

    sprite(0, x, y, BALLE);   //   On pose la balle.

    x++;                      //   Un pixel à droite...
    if (x > 152) x = 0;       //   ... et au bord, on repart de la gauche.

    angle++;                  //   Le pas suivant de la vague...
    if (angle >= sizeof(SINUS)) angle = 0;  // ... et après 31, on revient à 0.
  }

  return 0;                   // Jamais atteint.
}
`,
    aVoir: 'Une balle qui ondule en traversant l’écran ; A bascule « SINUS » en « COSINUS », et elle saute d’un quart de tour.',
    controle: (c) => {
      const depart = c.mot(1, 1, 11)

      /* La preuve de l'onde : la balle ne peut pas rester sur place, ni sortir
         de la plage annoncée par la table (28 à 108). */
      const positions = []
      for (let i = 0; i < 40; i++) { c.avancer(1); positions.push(c.lutin(0).y) }

      c.presser('a', 4)

      return [
        ['le titre de départ est SINUS', depart === 'A : SINUS  '],
        ['elle porte la tuile dessinée', c.lutin(0).tuile === 44],
        ['elle reste dans la plage de la table', positions.every((y) => y >= 28 && y <= 108),
          ` (min ${Math.min(...positions)}, max ${Math.max(...positions)})`],
        ['elle ondule vraiment, et ne file pas tout droit', new Set(positions).size > 2],
        ['A bascule sur COSINUS, au front', c.variable('cosinus') === 1],
        ['le titre change, à la même longueur', c.mot(1, 1, 11) === 'A : COSINUS'],
      ]
    },
  },
]

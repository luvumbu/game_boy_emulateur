/**
 * Apprendre à programmer — le cours, chapitre après chapitre.
 *
 * Les leçons de `lecons.js` et `tutoriels.js` sont triées par difficulté :
 * c'est le bon ordre pour apprendre la CONSOLE, mais les notions de
 * programmation s'y retrouvent éparpillées — une première boucle à la leçon
 * 22, la boucle « for » à la 41, son coût à la 76.
 *
 * Ce cours-ci fait l'inverse. Il suit les notions DANS L'ORDRE où l'on en a
 * besoin, et chaque chapitre va au fond de la sienne avant de passer à la
 * suivante :
 *
 *   1. les variables     — la mémoire de la console
 *   2. les conditions    — choisir
 *   3. les boucles       — répéter (le cœur de tout jeu)
 *   4. les tableaux      — ranger beaucoup de valeurs
 *   5. les fonctions     — nommer un geste
 *   6. les struct        — ce qui va ensemble, jusqu'au petit jeu complet
 *   7. les 4 nuances     — dessiner et animer sur la Game Boy d'origine
 *   8. la couleur        — les palettes de la Game Boy Color
 *   9. le mouvement      — les lutins au pixel près, la vitesse, l’animation
 *  10. les collisions    — deux boîtes, un mur, glisser le long
 *  11. le hasard, le temps — une plage, une place libre, le chrono
 *  12. les états du jeu  — enum, switch, le record gardé
 *  13. le son            — une note, un bruit, un air
 *  14. le défilement     — defiler(), la caméra
 *  15. tes propres #include — ranger ses fonctions, en ajouter à la console
 *
 * L'ORDRE EST CELUI DU FICHIER : rien n'est trié. Le champ `difficulte` porte
 * ici le numéro du CHAPITRE, pour que les outils des leçons (la page, le
 * livret) s'en servent sans rien changer.
 *
 * Les leçons ont exactement la forme de celles du tutoriel : chacune est
 * compilée, exécutée dans l'émulateur, et contrôlée par
 * `verification/verifier-cours.mjs`. Un cours de programmation dont un
 * exemple ne marche pas apprend surtout à douter de soi.
 *
 * La police de la console ne connaît que A–Z, 0–9, l'espace et ! ? . - : # |
 * — c'est pourquoi les programmes n'écrivent jamais « + » ni « = » à l'écran.
 */

export const CHAPITRES = {
  1: 'Les variables : la mémoire de la console',
  2: 'Les conditions : choisir',
  3: 'Les boucles : répéter',
  4: 'Les tableaux : ranger beaucoup de valeurs',
  5: 'Les fonctions : nommer un geste',
  6: 'Les struct : ce qui va ensemble',
  7: 'Les quatre nuances : la Game Boy d’origine',
  8: 'La couleur : la Game Boy Color',
  9: 'Le mouvement : les lutins au pixel près',
  10: 'Les collisions : se toucher, se cogner',
  11: 'Le hasard et le temps',
  12: 'Les états du jeu : titre, partie, fin',
  13: 'Le son : notes, bruits, airs',
  14: 'Le défilement : un monde plus grand que l’écran',
  15: 'Tes propres #include : ajouter une fonction',
}

/** La nuance (0 à 3) d'un pixel de l'écran, sur la Game Boy d'origine. */
const nuance = (c, x, y) => c.gb.framebuffer[y * 160 + x]

/** La couleur d'un pixel sur Game Boy Color : « r/v/b », chacune de 0 à 31. */
const couleur = (c, x, y) => {
  const v = c.gb.ppu.couleurs[y * 160 + x]
  return `${v & 31}/${v >> 5 & 31}/${v >> 10 & 31}`
}

/** Tenir un bouton quelques images, mesurer, puis le lâcher. */
const pendant = (c, bouton, mesure, images = 4) => {
  c.gb.setButton(bouton, true)
  c.avancer(images)
  const vu = mesure()
  c.gb.setButton(bouton, false)
  c.avancer(4)
  return vu
}

/** Les n tuiles d'un mot, sans les espaces de droite. */
const net = (s) => s.trimEnd()

/**
 * Tenir un bouton jusqu'à ce que `fini()` soit vrai (ou `max` images), puis
 * le lâcher et laisser l'écran se mettre à jour.
 *
 * Une boucle de jeu ne fait pas toujours un tour par image : écrire attend une
 * pause de la console (voir la leçon sur le VBlank), un gros dessin ou un long
 * calcul prennent du temps. Compter les images d'avance serait mesurer le
 * rythme du programme, et non ce qu'il fait ; on attend donc le résultat.
 */
const tenir = (c, bouton, fini, max = 600) => {
  c.gb.setButton(bouton, true)
  for (let i = 0; i < max && !fini(); i++) c.avancer(1)
  c.gb.setButton(bouton, false)
  c.avancer(20)
}

/** Avancer image par image jusqu'à ce que `fini()` soit vrai. */
const attendre = (c, fini, max = 2000) => {
  for (let i = 0; i < max && !fini(); i++) c.avancer(1)
}

/**
 * Regarder une troupe d'ennemis pendant une quinzaine de secondes.
 *
 * Une ligne peut être prise entre l'effacement et le nouveau dessin : un
 * instantané isolé mentirait. On regarde donc longtemps, et l'on retient ce
 * qui compte — jamais deux X à la fois, des positions variées, un demi-tour.
 */
const observerLaTroupe = (c, lignes) => {
  const vues = lignes.map(() => [])
  let jamaisDeux = true
  for (let k = 0; k < 900; k++) {
    c.avancer(1)
    lignes.forEach((l, i) => {
      const rangee = c.mot(0, l, 20)
      if (rangee.split('X').length - 1 > 1) jamaisDeux = false
      const x = rangee.indexOf('X')
      if (x >= 0 && vues[i].at(-1) !== x) vues[i].push(x)
    })
  }
  return {
    jamaisDeux,
    parcours: vues.map((v) => new Set(v).size),
    /* Un demi-tour : on a vu le bord, puis une case qui s'en éloigne. */
    demiTour: vues.map((v) => v.some((x, j) => (x === 0 || x === 19) && j + 1 < v.length && v[j + 1] !== x)),
  }
}


export const COURS = [

  /* ================================================ 1 — les variables */

  {
    titre: 'Une variable, une case qui porte un nom',
    difficulte: 1,
    provenance: 'cours',
    idee: 'Le programme se souvient de quelque chose : c’est tout ce qu’est une variable.',
    texte: [
      'Une **variable** est une case de la mémoire de la console, à laquelle on donne un nom. `uint8_t vies = 3;` fait trois choses d’un coup : il **réserve** une case, il la **nomme** `vies`, et il y **range** 3.',
      '`uint8_t` est le **type** de la case : un nombre entier, sans signe, sur **8 bits** — un octet. C’est le seul type de la Game Boy : son processeur ne manipule qu’un octet à la fois, et la console n’a que 8 Ko de mémoire de travail pour tout le jeu.',
      '`vies = vies + 2;` se lit **de droite à gauche** : on calcule d’abord `vies + 2` avec la valeur actuelle (3), puis on range le résultat (5) dans la case. Le signe `=` n’est pas une égalité de mathématiques, c’est une **flèche** : « ranger dans ».',
      '`nombre(colonne, ligne, valeur)` écrit la valeur **au moment de l’appel**. Le premier `nombre` a écrit 003 ; changer `vies` ensuite ne le réécrit pas — l’écran ne suit pas la variable tout seul. Dans un jeu, c’est pourquoi on redessine le score après chaque changement.',
      '**Les lignes `#include <…>`, en haut,** disent ce que le programme emploie de la console : `#include <texte>` pour `texte()`, `#include <nombre>` pour `nombre()`. Aucune fonction de la console n’est là d’office : chacune prend de la **place dans la cartouche**, et ne s’emploie que si on l’**inclut**, par son nom écrit comme dans le programme. Sans la ligne, le compilateur refuse, et dit laquelle écrire. Une ligne de trop ne coûte rien.',
      '**À toi :** ajoute une variable `pieces`, donne-lui 10, retire-lui 4, et affiche-la sur la ligne 8.',
    ],
    code: `// CE PROGRAMME : range un nombre dans une variable, l'affiche,
// le change, puis l'affiche encore.
//
// Tout ce qui suit deux barres « // » est un COMMENTAIRE :
// la console ne le lit pas, il est là seulement pour toi.

#include <texte>    // écrit un texte à l’écran
#include <nombre>   // écrit un nombre en chiffres

int main() {                  // main = « principal » : le jeu commence ICI.
                              // Tout ce qui est entre cette accolade ouvrante
                              // et la dernière accolade fermante fait partie de main.

  uint8_t vies = 3;           // Crée une case de mémoire nommée « vies » et y range 3.
                              // uint8_t = le TYPE de la case : un nombre entier de 0 à 255.
                              // Le point-virgule « ; » termine chaque instruction,
                              // comme le point termine une phrase.

  texte(2, 4, "VIES:");       // Écrit le mot VIES: à l'écran.
                              // 2 = la colonne (de 0 à 19, de gauche à droite)
                              // 4 = la ligne   (de 0 à 17, de haut en bas)
                              // Le texte à écrire se met entre guillemets.
  nombre(8, 4, vies);         // Écrit la VALEUR de vies (3) en colonne 8, ligne 4.
                              // nombre() écrit toujours 3 chiffres : on voit 003.

  vies = vies + 2;            // Se lit de DROITE à GAUCHE :
                              //   1) on calcule vies + 2, soit 3 + 2 = 5
                              //   2) on range 5 dans la case vies.
                              // Le signe « = » veut dire « ranger dans »,
                              // ce n'est pas le « égal » des mathématiques.

  texte(2, 6, "APRES LE BONUS:");  // Un deuxième texte, deux lignes plus bas (ligne 6).
  nombre(17, 6, vies);        // vies vaut maintenant 5 : on voit 005.
                              // Le 003 de la ligne 4 NE change PAS : l'écran garde
                              // ce qu'on y a écrit, il ne suit pas la variable tout seul.

  while (true) {              // while (true) = « tant que vrai » : répète pour TOUJOURS
                              // ce qui est entre les accolades.
    image();                  // Attend la prochaine image de l'écran (60 par seconde).
  }                           // Sans cette boucle, main finirait et le jeu s'arrêterait.
}                             // Fin de main.
`,
    aVoir: '« VIES: 003 », puis « APRES LE BONUS: 005 » deux lignes plus bas.',
    controle: (c) => [
      ['la première valeur écrite est 3', c.mot(8, 4, 3) === '003'],
      ['après le bonus, l’écran montre 5', c.mot(17, 6, 3) === '005'],
      ['la case « vies » contient bien 5', c.variable('vies') === 5, ` (lu : ${c.variable('vies')})`],
    ],
  },

  {
    titre: 'Calculer : + - * / et %',
    difficulte: 1,
    provenance: 'cours',
    idee: 'Diviser des entiers laisse un reste — et ce reste est souvent ce qu’on cherche.',
    texte: [
      'Les cinq opérations de base : `+` `-` `*` `/` et `%`. Les trois premières sont celles de l’école. Les deux dernières demandent de l’attention, parce qu’une variable ne contient que des **entiers**.',
      '`/` est la **division entière** : `200 / 60` vaut **3**, pas 3,33. Ce qui dépasse est jeté. La console n’a pas de nombres à virgule ; un jeu Game Boy compte en entiers, et en petites unités (des pixels, des images) plutôt qu’en fractions.',
      '`%` (« modulo ») donne **le reste** de cette division : `200 % 60` vaut **20**. Deux cents images, c’est 3 secondes **et** 20 images. Le modulo sert partout dans un jeu : « une fois sur quatre » (`n % 4 == 0`), « tourner en rond » dans une liste, séparer des chiffres.',
      'Les **priorités** sont celles des mathématiques : `*` `/` `%` passent avant `+` `-`. `2 + 3 * 4` vaut 14. Les parenthèses décident quand on veut autre chose : `(2 + 3) * 4` vaut 20.',
      '**À toi :** calcule combien de minutes et de secondes font 150 secondes — avec `/` et `%` sur 60.',
    ],
    code: `// CE PROGRAMME : fait des calculs avec + - * / et %, puis affiche les résultats.
//
// Rappel : « // » commence un commentaire, que la console ignore.
// uint8_t = une case de mémoire qui garde un nombre entier de 0 à 255.

#include <texte>        // écrit un texte à l’écran
#include <nombre>       // écrit un nombre en chiffres
#include <diviser>      // a / b, sauf par 1, 2, 4, 8, 16… écrits en clair
#include <reste>        // a % b, sauf par 1, 2, 4, 8, 16… écrits en clair
#include <multiplier>   // a * b, quand les deux se calculent

int main() {                      // Le jeu commence ici.
  uint8_t duree = 200;            // 200 images. La console en montre 60 par seconde.

  uint8_t secondes = duree / 60;  // « / » = la DIVISION ENTIÈRE : 200 / 60 = 3.
                                  // (3 fois 60 = 180 ; ce qui dépasse est jeté,
                                  //  il n'y a pas de nombres à virgule.)
  uint8_t reste = duree % 60;     // « % » = le RESTE de cette division (on dit « modulo ») :
                                  // 200 - 180 = 20. Donc 200 images = 3 secondes et 20 images.

  uint8_t pieces = 7;             // 7 pièces...
  uint8_t prix = 12;              // ... à 12 chacune...
  uint8_t total = pieces * prix;  // ... « * » = multiplier : 7 fois 12 = 84.

  uint8_t calcul = 2 + 3 * 4;     // La multiplication passe AVANT l'addition :
                                  // 3 * 4 = 12, puis 2 + 12 = 14.
  uint8_t autre = (2 + 3) * 4;    // Les parenthèses passent avant tout :
                                  // 2 + 3 = 5, puis 5 * 4 = 20.

  // On affiche tout. texte(colonne, ligne, "MOT") écrit un mot ;
  // nombre(colonne, ligne, valeur) écrit un nombre sur 3 chiffres.
  // On peut mettre deux instructions sur la même ligne : chacune finit par « ; ».
  texte(1, 2, "IMAGES:");     nombre(14, 2, duree);     // 200
  texte(1, 4, "SECONDES:");   nombre(14, 4, secondes);  // 003
  texte(1, 5, "ET IMAGES:");  nombre(14, 5, reste);     // 020
  texte(1, 8, "TOTAL:");      nombre(14, 8, total);     // 084
  texte(1, 11, "SANS PAR.:"); nombre(14, 11, calcul);   // 014
  texte(1, 12, "AVEC PAR.:"); nombre(14, 12, autre);    // 020

  while (true) {                  // Répète pour toujours...
    image();                      // ... attendre l'image suivante. Le jeu reste allumé.
  }
}
`,
    aVoir: '200 images = 3 secondes et 20 images ; 7 × 12 = 84 ; 14 sans parenthèses, 20 avec.',
    controle: (c) => [
      ['200 / 60 donne 3 (division entière)', c.mot(14, 4, 3) === '003'],
      ['200 % 60 donne le reste, 20', c.mot(14, 5, 3) === '020'],
      ['7 * 12 donne 84', c.mot(14, 8, 3) === '084'],
      ['2 + 3 * 4 donne 14', c.mot(14, 11, 3) === '014'],
      ['(2 + 3) * 4 donne 20', c.mot(14, 12, 3) === '020'],
    ],
  },

  {
    titre: 'Un octet s’arrête à 255',
    difficulte: 1,
    provenance: 'cours',
    idee: 'Après 255 vient 0, et avant 0 vient 255 : la variable fait le tour.',
    texte: [
      'Un octet, ce sont **8 bits** : 2 × 2 × 2 × 2 × 2 × 2 × 2 × 2 = **256 valeurs**, de 0 à 255. Il n’y a pas de 256 : la case n’a pas la place de l’écrire.',
      '`250 + 10` devrait faire 260. La case garde **260 − 256 = 4**. On dit qu’elle **déborde** — comme un compteur kilométrique qui repasse à zéro. Et dans l’autre sens, `3 − 5` ne donne pas −2 mais **254** : il n’y a pas de nombres négatifs dans un `uint8_t`.',
      'Ce n’est pas une panne, c’est la règle — et beaucoup de bogues de jeux Game Boy viennent de là : un personnage à x = 0 qui recule d’un pas se retrouve à x = 255, tout à droite. **Avant de retirer, on vérifie qu’il reste de quoi retirer** — ce sera le travail des conditions, au chapitre suivant.',
      'Le compteur du bas avance d’un à chaque tour de boucle : après 255, il repasse par 000. Regarde-le faire le tour.',
      '**À toi :** que vaut `0 - 1` ? Et `128 + 128` ? Devine d’abord, puis affiche-les.',
    ],
    code: `// CE PROGRAMME : montre qu'une case uint8_t ne va que de 0 à 255.
// Au-dessus de 255, elle repart de 0 ; en dessous de 0, elle repart de 255.
// On dit qu'elle « déborde », comme un compteur kilométrique.

#include <texte>    // écrit un texte à l’écran
#include <nombre>   // écrit un nombre en chiffres

int main() {                // Le jeu commence ici.
  uint8_t score = 250;      // Une case « score » qui contient 250.
  score = score + 10;       // 250 + 10 devrait faire 260, mais 260 ne tient pas :
                            // la case garde 260 - 256 = 4.

  uint8_t vies = 3;         // Une case « vies » qui contient 3.
  vies = vies - 5;          // 3 - 5 devrait faire -2, mais il n'y a pas de nombres
                            // négatifs dans un uint8_t : la case garde 256 - 2 = 254.

  texte(1, 2, "250 PLUS 10:");  nombre(15, 2, score);   // affiche 004
  texte(1, 4, "3 MOINS 5:");    nombre(15, 4, vies);    // affiche 254

  uint8_t compteur = 0;     // Un compteur qui commence à 0.
  texte(1, 9, "COMPTEUR:"); // Son nom, écrit une seule fois avant la boucle.

  while (true) {            // Répète pour toujours :
    image();                //   attend l'image suivante (60 fois par seconde),
    compteur++;             //   « ++ » ajoute 1 : c'est la même chose que
                            //   compteur = compteur + 1.
                            //   On voit : ... 253, 254, 255, 0, 1, 2 ...
    nombre(15, 9, compteur);  // réécrit la valeur à chaque image.
  }
}
`,
    aVoir: '250 + 10 affiche 004, 3 − 5 affiche 254, et le compteur tourne de 000 à 255 puis recommence.',
    controle: (c) => {
      /* On le regarde jusqu'à ce qu'il redescende : c'est le tour. */
      let avant = c.variable('compteur')
      let tour = null
      for (let i = 0; i < 1200 && tour === null; i++) {
        c.avancer(1)
        const maintenant = c.variable('compteur')
        if (maintenant < avant) tour = [avant, maintenant]
        avant = maintenant
      }
      return [
        ['250 + 10 garde 4', c.mot(15, 2, 3) === '004'],
        ['3 - 5 garde 254', c.mot(15, 4, 3) === '254'],
        ['le compteur passe de 255 à 0', tour !== null && tour[0] === 255 && tour[1] === 0,
          tour ? ` (${tour[0]} puis ${tour[1]})` : ''],
      ]
    },
  },

  {
    titre: 'Où vit une variable : avant la boucle, ou dedans',
    difficulte: 1,
    provenance: 'cours',
    idee: 'Une variable déclarée DANS la boucle renaît à chaque tour — et oublie tout.',
    texte: [
      'Une variable existe à partir de sa déclaration, et **jusqu’à l’accolade qui ferme son bloc**. C’est sa **portée**. Hors de ses accolades, son nom ne veut plus rien dire.',
      '`tours` est déclarée **avant** `while (true)` : elle naît une seule fois, et garde sa valeur d’un tour à l’autre. Elle compte : 1, 2, 3…',
      '`neuve` est déclarée **dans** la boucle : à chaque tour, la ligne `uint8_t neuve = 0;` est exécutée de nouveau, et remet la case à zéro. On a beau faire `neuve++`, elle vaut toujours **1** à l’écran.',
      'C’est **le bogue le plus fréquent du débutant** : « mon compteur ne compte pas ». Règle simple : **ce qui doit durer d’une image à l’autre** (un score, une position, une vie) se déclare **avant** la boucle du jeu. Ce qui ne sert que le temps d’un calcul se déclare dedans — c’est même plus clair, car on voit qu’elle ne sert qu’ici.',
      '**À toi :** déplace la déclaration de `neuve` au-dessus de `while (true)`, et regarde-la compter à son tour.',
    ],
    code: `// CE PROGRAMME : compare deux variables.
//   - « tours » est créée AVANT la boucle : elle garde sa valeur d'un tour à l'autre.
//   - « neuve » est créée DANS la boucle : elle est recréée à 0 à chaque tour.

#include <texte>    // écrit un texte à l’écran
#include <nombre>   // écrit un nombre en chiffres

int main() {                  // Le jeu commence ici.
  uint8_t tours = 0;          // Créée UNE seule fois, avant la boucle : elle se souvient.

  texte(1, 4, "AVANT LA BOUCLE:");  // Le nom de la première ligne.
  texte(1, 6, "DANS LA BOUCLE:");   // Le nom de la deuxième ligne.

  while (true) {              // Répète pour toujours ce qui est entre les accolades.
    image();                  // Attend l'image suivante.

    uint8_t neuve = 0;        // Recréée à CHAQUE tour, et remise à 0 : elle oublie.
    tours++;                  // tours gagne 1 : 1, 2, 3, 4 ... (elle monte)
    neuve++;                  // neuve gagne 1 : elle passe de 0 à 1, à chaque tour.

    nombre(17, 4, tours);     // Affiche tours : le nombre grandit sans arrêt.
    nombre(17, 6, neuve);     // Affiche neuve : toujours 001.
  }
}
`,
    aVoir: 'Le compteur du haut monte ; celui du bas reste bloqué sur 001.',
    controle: (c) => {
      const t1 = Number(c.mot(17, 4, 3))
      c.avancer(30)
      const t2 = Number(c.mot(17, 4, 3))
      return [
        ['la variable déclarée avant la boucle compte', t2 > t1, ` (${t1} puis ${t2})`],
        ['celle déclarée dedans vaut toujours 1', c.mot(17, 6, 3) === '001'],
      ]
    },
  },

  /* ================================================ 2 — les conditions */

  {
    titre: 'if et else : deux chemins',
    difficulte: 2,
    provenance: 'cours',
    idee: 'Le programme ne fait pas tout : il choisit ce qu’il fait, image après image.',
    texte: [
      '`if (condition) { … }` exécute le bloc **seulement si** la condition est vraie. `else { … }` donne le chemin **sinon**. Un seul des deux blocs s’exécute, jamais les deux.',
      '`bouton(A)` rend 1 quand A est enfoncé, 0 sinon. Pour `if`, **0 veut dire faux, et tout le reste veut dire vrai** — il n’y a pas d’autre définition de « vrai » dans la machine.',
      '**Les huit touches de la Game Boy**, toutes lues par `bouton()` : `A` et `B` (les deux boutons ronds), `HAUT`, `BAS`, `GAUCHE` et `DROITE` (la croix), `START` et `SELECT` (les deux petits boutons du milieu). Chacune a sa ligne à l’écran, avec son nom.',
      '**Tant qu’on tient une touche, son nom clignote**, et il reste affiché dès qu’on la lâche. Pour clignoter, il faut une horloge : `images()` compte les images depuis l’allumage, soixante par seconde. `images() / 16` avance d’un toutes les seize images, et `% 2` n’en garde que le reste : **0, 1, 0, 1…** — c’est le rythme du clignotement.',
      'C’est un **`if` dans un `if`** : le premier demande si la touche est tenue ; le second, seulement dans ce cas, choisit entre des espaces (autant que de lettres : quatre pour « HAUT », six pour « GAUCHE ») et le nom. 1 veut dire vrai, 0 faux : on n’a rien à comparer. Le `else` du premier réécrit le nom — sans lui, une touche lâchée au mauvais moment laisserait son nom effacé.',
      'Les huit `if` sont **indépendants** : on peut tenir plusieurs touches à la fois — la croix et A, par exemple, comme pour sauter en courant — et plusieurs noms clignotent en même temps.',
      'Le test est refait **à chaque image**, soixante fois par seconde, parce qu’il est dans la boucle du jeu. C’est ce qui rend le programme réactif : il repose sans cesse la même question, et la réponse change quand le joueur agit.',
      'Au clavier de l’ordinateur : les **flèches** pour la croix, **X** pour A, **Z** pour B (ou l’inverse, dans les réglages), **Entrée** pour START et **Maj** pour SELECT — et chacune se change dans ⚙ Options, « Les touches du clavier ».',
      '**Chaque `texte()` attend son moment** : la console n’écrit à l’écran que pendant un court instant à chaque image — le chapitre 12 l’explique. Huit touches, huit écritures : un tour de boucle dure donc **huit images**, et l’on voit un tout petit retard entre l’appui et le premier clignotement. Le chapitre 12 montre comment n’écrire que ce qui change.',
      '**À toi :** fais clignoter la touche A deux fois plus vite. Que faut-il changer dans `images() / 16` ?',
    ],
    code: `// CE PROGRAMME : écrit le nom des 8 touches de la console.
// Quand tu TIENS une touche, son nom clignote. Quand tu la lâches, il reste affiché.
//
// Ce qui est nouveau : if et else.
//   if (condition) ...   = « SI la condition est vraie, fais ceci »
//   else ...             = « SINON, fais cela »
// Un seul des deux chemins est pris, jamais les deux.

#include <texte>    // écrit un texte à l’écran
#include <bouton>   // lit un bouton de la manette

int main() {                            // Le jeu commence ici.
  texte(1, 2, "TIENS UNE TOUCHE");      // La consigne, écrite une fois.

  while (true) {                        // Répète pour toujours :
    image();                            // attend l'image suivante (60 par seconde).

    // Tenue : son nom clignote. Lâchée : il reste affiché.

    // ---- La touche A (colonne 4, ligne 5). Expliquée en détail ;
    //      les 7 autres touches plus bas font exactement la même chose.
    if (bouton(A)) {                    // SI la touche A est enfoncée en ce moment...
                                        // bouton(A) vaut 1 (vrai) quand elle est tenue,
                                        // 0 (faux) sinon.
      if ((images() / 16) % 2) {        //   ... alors on choisit selon l'heure :
                                        //   images() compte les images depuis le début.
                                        //   / 16 : ce nombre change toutes les 16 images.
                                        //   % 2  : le reste de la division par 2, 0 ou 1.
                                        //   Exemple : image 40 : 40 / 16 = 2, 2 % 2 = 0.
                                        //             image 50 : 50 / 16 = 3, 3 % 2 = 1.
                                        //   Donc : 16 images à 1, 16 images à 0, etc.
        texte(4, 5, " ");               //   à 1 : on efface la lettre (un espace).
      } else {                          //   à 0 :
        texte(4, 5, "A");               //   on la réécrit. Effacer, écrire... : ça clignote.
      }
    } else {                            // SINON (A n'est pas enfoncée) :
      texte(4, 5, "A");                 //   la lettre reste simplement écrite.
    }

    // ---- La touche B (ligne 6) : même chose.
    if (bouton(B)) {
      if ((images() / 16) % 2) {
        texte(4, 6, " ");               // 1 espace pour effacer 1 lettre
      } else {
        texte(4, 6, "B");
      }
    } else {
      texte(4, 6, "B");
    }
    // ---- HAUT (ligne 7).
    if (bouton(HAUT)) {
      if ((images() / 16) % 2) {
        texte(4, 7, "    ");            // 4 espaces pour effacer les 4 lettres de HAUT
      } else {
        texte(4, 7, "HAUT");
      }
    } else {
      texte(4, 7, "HAUT");
    }
    // ---- BAS (ligne 8).
    if (bouton(BAS)) {
      if ((images() / 16) % 2) {
        texte(4, 8, "   ");             // 3 espaces pour BAS
      } else {
        texte(4, 8, "BAS");
      }
    } else {
      texte(4, 8, "BAS");
    }
    // ---- GAUCHE (ligne 9).
    if (bouton(GAUCHE)) {
      if ((images() / 16) % 2) {
        texte(4, 9, "      ");          // 6 espaces pour GAUCHE
      } else {
        texte(4, 9, "GAUCHE");
      }
    } else {
      texte(4, 9, "GAUCHE");
    }
    // ---- DROITE (ligne 10).
    if (bouton(DROITE)) {
      if ((images() / 16) % 2) {
        texte(4, 10, "      ");         // 6 espaces pour DROITE
      } else {
        texte(4, 10, "DROITE");
      }
    } else {
      texte(4, 10, "DROITE");
    }
    // ---- START (ligne 11).
    if (bouton(START)) {
      if ((images() / 16) % 2) {
        texte(4, 11, "     ");          // 5 espaces pour START
      } else {
        texte(4, 11, "START");
      }
    } else {
      texte(4, 11, "START");
    }
    // ---- SELECT (ligne 12).
    if (bouton(SELECT)) {
      if ((images() / 16) % 2) {
        texte(4, 12, "      ");         // 6 espaces pour SELECT
      } else {
        texte(4, 12, "SELECT");
      }
    } else {
      texte(4, 12, "SELECT");
    }
  }                                     // fin de la boucle : on repart à image()
}                                       // fin de main
`,
    aVoir: 'Les huit noms à l’écran ; une touche tenue fait clignoter le sien, relâchée il reste affiché.',
    controle: (c) => {
      const TOUCHES = [{"nom":"A","emu":"a","l":5},{"nom":"B","emu":"b","l":6},{"nom":"HAUT","emu":"up","l":7},{"nom":"BAS","emu":"down","l":8},{"nom":"GAUCHE","emu":"left","l":9},{"nom":"DROITE","emu":"right","l":10},{"nom":"START","emu":"start","l":11},{"nom":"SELECT","emu":"select","l":12}]
      const nomVu = (t) => net(c.mot(4, t.l, t.nom.length))
      c.avancer(20)
      const resultats = [['au repos, les huit noms sont à l’écran', TOUCHES.every((t) => nomVu(t) === t.nom)]]
      for (const t of TOUCHES) {
        /* Tenue : on regarde pendant un moment — le nom doit être tantôt là, tantôt vide. */
        c.gb.setButton(t.emu, true)
        const vus = new Set()
        let autres = true
        for (let k = 0; k < 16; k++) {
          c.avancer(4)
          vus.add(nomVu(t))
          autres = autres && TOUCHES.filter((u) => u !== t).every((u) => nomVu(u) === u.nom)
        }
        c.gb.setButton(t.emu, false)
        c.avancer(40)
        resultats.push([`${t.nom} tenu : son nom clignote — tantôt là, tantôt vide — et lui seul`, vus.has(t.nom) && vus.has('') && autres])
        resultats.push([`${t.nom} lâché : son nom reste affiché`, nomVu(t) === t.nom])
      }
      /* Deux touches à la fois : deux if indépendants, deux noms qui clignotent. */
      c.gb.setButton('right', true)
      c.gb.setButton('a', true)
      const ensemble = new Set()
      for (let k = 0; k < 16; k++) { c.avancer(4); ensemble.add(nomVu(TOUCHES[5]) + '|' + nomVu(TOUCHES[0])) }
      resultats.push(['DROITE et A ensemble : les deux clignotent', ensemble.has('|') && ensemble.has('DROITE|A')])
      c.gb.setButton('right', false)
      c.gb.setButton('a', false)
      c.avancer(40)
      return resultats
    },
  },

  {
    titre: 'Une comparaison est un nombre',
    difficulte: 2,
    provenance: 'cours',
    idee: '« x == 7 » n’est pas une question posée dans le vide : c’est un calcul qui donne 1 ou 0.',
    texte: [
      'Les six comparaisons : `==` (égal), `!=` (différent), `<` `>` (plus petit, plus grand), `<=` `>=` (plus petit **ou égal**, plus grand **ou égal**).',
      'Chacune **se calcule** comme une addition, et donne un nombre : **1 si c’est vrai, 0 si c’est faux**. On peut donc l’afficher avec `nombre()`, la ranger dans une variable, l’additionner. `if` ne fait rien d’autre que regarder si ce nombre vaut 0.',
      '**Le piège** : `=` range, `==` compare. `if (x = 7)` **range** 7 dans x, et comme 7 n’est pas zéro, la condition est toujours vraie. C’est l’erreur de frappe la plus sournoise du C++ : le programme compile, et fait autre chose.',
      '`x < 10` et `x <= 9` disent la même chose sur des entiers. Choisis celle qui se lit le mieux : « tant que x est plus petit que la largeur » s’écrit `x < LARGEUR`.',
      '**À toi :** change la valeur de `x` en 10 et prédis chaque ligne avant de compiler.',
    ],
    code: `// CE PROGRAMME : pose des questions sur x (x vaut 7) et affiche les réponses.
// Une comparaison donne un NOMBRE : 1 si c'est vrai, 0 si c'est faux.
//
//   ==  égal à            (DEUX signes « = » : un seul « = » veut dire « ranger dans »)
//   !=  différent de
//   <   plus petit que        >   plus grand que
//   <=  plus petit ou égal    >=  plus grand ou égal

#include <texte>    // écrit un texte à l’écran
#include <nombre>   // écrit un nombre en chiffres

int main() {                        // Le jeu commence ici.
  uint8_t x = 7;                    // On range 7 dans x.

  texte(1, 1, "X VAUT 7");          // Rappel à l'écran.

  // nombre(colonne, ligne, valeur, 1) : le dernier 1 veut dire « écris 1 seul chiffre ».
  texte(1, 4, "X EGAL 7");        nombre(18, 4, x == 7, 1);   // 7 égal à 7 ?        oui : 1
  texte(1, 5, "X DIFFERENT DE 7"); nombre(18, 5, x != 7, 1);  // 7 différent de 7 ?  non : 0
  texte(1, 6, "X PLUS PETIT 10");  nombre(18, 6, x < 10, 1);  // 7 plus petit que 10 ? 1
  texte(1, 7, "X PLUS GRAND 10");  nombre(18, 7, x > 10, 1);  // 7 plus grand que 10 ? 0
  texte(1, 8, "X AU PLUS 7");      nombre(18, 8, x <= 7, 1);  // 7 au plus 7 ?       oui : 1
  texte(1, 9, "X AU MOINS 8");     nombre(18, 9, x >= 8, 1);  // 7 au moins 8 ?      non : 0

  // Puisqu'une réponse est un nombre, on peut les additionner :
  // (x == 7) vaut 1, (x < 10) vaut 1, (x <= 7) vaut 1  →  1 + 1 + 1 = 3.
  uint8_t vraies = (x == 7) + (x < 10) + (x <= 7);
  texte(1, 12, "VRAIES ADDITIONNEES");
  nombre(18, 13, vraies, 1);        // affiche 3

  while (true) {                    // Répète pour toujours :
    image();                        // attend l'image suivante.
  }
}
`,
    aVoir: 'Une colonne de 1 et de 0 : 1, 0, 1, 0, 1, 0 — et 3 quand on additionne trois comparaisons vraies.',
    controle: (c) => {
      const colonne = [4, 5, 6, 7, 8, 9].map((l) => c.mot(18, l, 1)).join('')
      return [
        ['chaque comparaison a donné 1 ou 0', colonne === '101010', ` (${colonne})`],
        ['trois comparaisons vraies s’additionnent en 3', c.mot(18, 13, 1) === '3'],
      ]
    },
  },

  {
    titre: 'Et, ou, non : && || !',
    difficulte: 2,
    provenance: 'cours',
    idee: 'Une vraie question de jeu se pose rarement en une seule comparaison.',
    texte: [
      '« Le héros est-il dans la zone ? » veut dire : x est **au moins** 8, **et** x est **au plus** 12. Deux comparaisons, reliées par `&&` (**et**) : c’est vrai seulement si les **deux** le sont.',
      '`||` (**ou**) est vrai si **l’une au moins** l’est : « au bord » veut dire x vaut 0 **ou** x vaut 19. `!` (**non**) retourne une réponse : `!dans` est vrai quand `dans` est faux.',
      'Ces opérateurs **s’arrêtent dès que la réponse est connue**. Dans `x > 0 && …`, si x vaut 0, la droite n’est même pas calculée. Ce n’est pas un détail : c’est ce qui permet d’écrire `if (x > 0 && …)` sans jamais lire une case avant le début d’un tableau.',
      'Regarde aussi la ligne qui déplace : `bouton(DROITE) && x < 19`. On n’avance que si la touche est enfoncée **et** qu’il reste de la place. C’est la garde du chapitre précédent : jamais de x = 255 par accident.',
      'Ranger une condition dans une variable nommée (`dans`) rend le code lisible : `if (dans)` se lit comme une phrase.',
      'Dernier détail : on ne réécrit l’écran **que si x a changé** (`x != ancien`). Écrire à l’écran prend du temps sur cette console — le chapitre des boucles dira exactement pourquoi.',
      '**À toi :** ajoute une seconde zone, de 15 à 17, et affiche « ZONE 2 ».',
    ],
    code: `// CE PROGRAMME : un # se déplace avec GAUCHE et DROITE sur la ligne 10.
// L'écran dit s'il est DANS la zone (colonnes 8 à 12) et s'il est AU BORD.
//
// Ce qui est nouveau : combiner des conditions.
//   &&  = ET   : vrai seulement si les DEUX côtés sont vrais
//   ||  = OU   : vrai si AU MOINS UN des deux côtés est vrai
//   !   = NON  : retourne la réponse (vrai devient faux, faux devient vrai)

#include <texte>    // écrit un texte à l’écran
#include <bouton>   // lit un bouton de la manette

int main() {                    // Le jeu commence ici.
  uint8_t x = 2;                // La colonne du #, de 0 à 19. Il part de la colonne 2.
  uint8_t ancien = 0;           // La colonne où le # était dessiné avant.
                                // Elle est différente de x : cela force le premier dessin.

  texte(1, 1, "GAUCHE DROITE"); // La consigne.
  texte(8, 12, "|   |");       // Dessine la zone : les barres sont en colonnes 8 et 12.

  while (true) {                // Répète pour toujours :
    image();                    // attend l'image suivante.

    // Bouger, sans sortir de l'écran :
    if (bouton(DROITE) && x < 19) x++;   // DROITE tenue ET pas déjà au bord droit (19) :
                                          // x gagne 1. Si x vaut 19, rien ne se passe.
    if (bouton(GAUCHE) && x > 0) x--;    // GAUCHE tenue ET pas déjà au bord gauche (0) :
                                          // x perd 1 (« -- » retire 1).

    if (x != ancien) {          // On ne redessine QUE si le # a bougé (x différent d'avant).
      uint8_t dans = x >= 8 && x <= 12;  // 1 si x est entre 8 et 12, sinon 0.
                                          // Exemple : x = 10 → 10 >= 8 (vrai) ET 10 <= 12 (vrai) → 1.
                                          //           x = 14 → 14 <= 12 est faux → 0.
      uint8_t bord = x == 0 || x == 19;  // 1 si x vaut 0 OU vaut 19, sinon 0.

      texte(ancien, 10, " ");   // Efface le # à son ancienne place (un espace).
      texte(x, 10, "#");        // Le dessine à sa nouvelle place.

      if (dans) texte(1, 4, "DANS LA ZONE");   // Si dans vaut 1.
      if (!dans) texte(1, 4, "HORS ZONE   ");  // Si dans vaut 0 : « !dans » vaut 1.
                                               // Les espaces effacent la fin de l'ancien texte.

      if (bord) texte(1, 6, "AU BORD");        // Au bord : on l'écrit...
      else texte(1, 6, "       ");             // ... sinon : 7 espaces pour effacer AU BORD.

      ancien = x;               // On retient où le # est maintenant, pour le prochain tour.
    }
  }
}
`,
    aVoir: 'Un # qui glisse avec GAUCHE et DROITE ; « DANS LA ZONE » entre les deux barres, « AU BORD » aux extrémités.',
    controle: (c) => {
      c.avancer(20)
      const auDepart = c.mot(1, 4, 12)
      tenir(c, 'right', () => c.variable('x') >= 9)
      const entre = c.mot(1, 4, 12)
      const x1 = c.variable('x')
      tenir(c, 'right', () => false, 400)   // jusqu'au bord droit, et au-delà
      const bord = c.mot(1, 6, 7)
      const x2 = c.variable('x')
      return [
        ['au départ, hors de la zone', net(auDepart) === 'HORS ZONE'],
        ['après quelques pas, dans la zone', entre === 'DANS LA ZONE', ` (x = ${x1})`],
        ['la garde && l’arrête au bord, sans déborder', x2 === 19, ` (x = ${x2})`],
        ['|| reconnaît le bord', bord === 'AU BORD'],
      ]
    },
  },

  {
    titre: 'Plusieurs cas : else if, puis switch',
    difficulte: 2,
    provenance: 'cours',
    idee: '« else if » range des intervalles ; « switch » aiguille sur des valeurs exactes.',
    texte: [
      'Une chaîne `if … else if … else` teste **dans l’ordre**, et s’arrête au **premier** cas vrai. C’est ce qui permet d’écrire `score < 120` sans répéter `score >= 60` : si l’on arrive là, c’est que le premier test a déjà échoué.',
      'L’ordre compte donc. Mets `score < 120` en premier, et « BRONZE » ne s’affichera plus jamais : un score de 10 est aussi plus petit que 120.',
      '`switch (valeur)` compare **une** valeur à des cas **exacts** : `case 0:`, `case 1:`. On saute directement au bon cas, puis `break;` sort du `switch`. **Oublier `break`** fait tomber dans le cas suivant — c’est permis en C++, et c’est presque toujours un bogue. `default:` attrape tout ce qui n’a pas de case.',
      'Quand choisir lequel ? `else if` pour des **intervalles** (moins de 60, moins de 120…), `switch` pour une liste de **valeurs précises** — un numéro de monde, un écran de jeu, une direction.',
      'Toutes les réponses font **six lettres**, espaces compris : « OR    ». Chacune recouvre exactement la précédente.',
      '**À toi :** ajoute une médaille « PLATINE » au-dessus de 200.',
    ],
    code: `// CE PROGRAMME : un score monte tout seul. Selon sa valeur, on affiche
// une médaille (BRONZE, ARGENT, OR) et un monde (PLAINE, GROTTE, CHATEAU).
//
// Ce qui est nouveau :
//   else if  = « sinon, si ... » : on essaie les cas l'un après l'autre.
//   switch   = on saute directement au « case » qui a la bonne valeur.

#include <texte>     // écrit un texte à l’écran
#include <nombre>    // écrit un nombre en chiffres
#include <diviser>   // a / b, sauf par 1, 2, 4, 8, 16… écrits en clair

int main() {                          // Le jeu commence ici.
  uint8_t score = 0;                  // Le score part de 0.

  texte(1, 2, "SCORE:");              // Les trois titres, écrits une fois.
  texte(1, 5, "MEDAILLE:");
  texte(1, 8, "MONDE:");

  while (true) {                      // Répète pour toujours :
    image();                          // attend l'image suivante (60 par seconde).
    score++;                          // Le score monte tout seul : + 1 à chaque image.
    nombre(12, 2, score);             // On l'affiche.

    // Des intervalles : else if, dans l'ordre.
    // On lit de haut en bas ; dès qu'un test est vrai, on fait son bloc et on s'arrête.
    if (score < 60) {                 // De 0 à 59 :
      texte(12, 5, "BRONZE");
    } else if (score < 120) {         // Sinon, de 60 à 119 (on sait déjà qu'il est >= 60) :
      texte(12, 5, "ARGENT");
    } else {                          // Sinon, tout le reste (120 et plus) :
      texte(12, 5, "OR    ");         // Les espaces effacent la fin de ARGENT.
    }

    // Des valeurs exactes : switch.
    // score / 60 vaut 0 (score 0 à 59), 1 (60 à 119), 2 (120 à 179), 3 (180 à 239) ou 4.
    switch (score / 60) {
      case 0:  texte(12, 8, "PLAINE"); break;   // si ça vaut 0. « break » = sortir du switch.
      case 1:  texte(12, 8, "GROTTE"); break;   // si ça vaut 1.
      case 2:  texte(12, 8, "CHATEAU"); break;  // si ça vaut 2.
      default: texte(12, 8, "?      "); break;  // default = « aucun des cas au-dessus ».
    }
    // Après 255, le score repart à 0 (un uint8_t ne va que jusqu'à 255) :
    // on retombe sur BRONZE et PLAINE.
  }
}
`,
    aVoir: 'Le score monte : BRONZE/PLAINE, puis ARGENT/GROTTE, puis OR/CHATEAU.',
    controle: (c) => {
      attendre(c, () => c.variable('score') >= 20)
      c.avancer(12)
      const d = [c.mot(12, 5, 6), c.mot(12, 8, 7)]
      attendre(c, () => c.variable('score') >= 80)
      c.avancer(12)
      const m = [c.mot(12, 5, 6), c.mot(12, 8, 7)]
      attendre(c, () => c.variable('score') >= 140)
      c.avancer(12)
      const f = [c.mot(12, 5, 6), c.mot(12, 8, 7)]
      return [
        ['au début : BRONZE, PLAINE', d[0] === 'BRONZE' && net(d[1]) === 'PLAINE', ` (${d.join(', ')})`],
        ['une seconde plus tard : ARGENT, GROTTE', m[0] === 'ARGENT' && net(m[1]) === 'GROTTE', ` (${m.join(', ')})`],
        ['encore une : OR, CHATEAU', net(f[0]) === 'OR' && f[1] === 'CHATEAU', ` (${f.join(', ')})`],
      ]
    },
  },

  /* ================================================ 3 — les boucles */

  {
    titre: 'La boucle du jeu : while (true)',
    difficulte: 3,
    provenance: 'cours',
    idee: 'Tout jeu est une boucle : lire, calculer, dessiner, attendre — soixante fois par seconde.',
    texte: [
      'Une **boucle** répète un bloc de code. `while (condition) { … }` le répète **tant que** la condition est vraie. `while (true)` ne s’arrête **jamais** : c’est voulu. Une console n’a pas de « fin de programme » — si `main` se terminait, le processeur partirait lire n’importe quoi.',
      'Chaque passage dans le bloc s’appelle un **tour** (on dit aussi une **itération**). `image()` attend que l’écran ait fini de se dessiner : un tour dure donc exactement **une image**, soit 1/60 de seconde. C’est l’**horloge** du jeu.',
      'Tous les jeux Game Boy ont cette forme : **lire les touches → faire évoluer le monde → dessiner → attendre l’image suivante**, et recommencer. Tetris, Zelda, Pokémon : même boucle, plus de choses dedans.',
      'Ici, on s’en sert pour faire une **montre**. `imagesVues` compte les tours ; quand il atteint 60, une seconde est passée : on le remet à zéro et on ajoute une seconde. C’est ainsi que l’on compte plus loin que 255 — avec **deux** variables, comme les heures et les minutes.',
      'Remarque qu’on n’écrit les secondes à l’écran **qu’au moment où elles changent**, une fois par seconde. Écrire à l’écran n’est pas gratuit : chaque lettre doit attendre un moment précis, une courte pause de la console. On n’écrit donc que ce qui change. La leçon « L’écran ne s’écrit que pendant le VBlank », un peu plus loin, explique pourquoi.',
      '**À toi :** ajoute les minutes : quand `secondes` atteint 60, remets-le à 0 et augmente `minutes`.',
    ],
    code: `// CE PROGRAMME : compte les secondes qui passent, grâce à la boucle du jeu.
//
// Ce qui est important : while (true) ... image(); est LA boucle de tout jeu.
// La console montre 60 images par seconde ; image() attend la suivante.
// Donc un tour de boucle = une image = 1/60 de seconde.

#include <texte>    // écrit un texte à l’écran
#include <nombre>   // écrit un nombre en chiffres

int main() {                  // Le jeu commence ici.
  uint8_t imagesVues = 0;     // Combien d'images depuis la dernière seconde (0 à 59).
  uint8_t secondes = 0;       // Combien de secondes en tout.

  texte(1, 5, "SECONDES:");   // Le titre...
  nombre(12, 5, secondes);    // ... et la valeur de départ : 000.

  while (true) {              // Répète pour toujours :
    image();                  // un tour de boucle = une image

    imagesVues++;             // Une image de plus : + 1.
    if (imagesVues == 60) {   // Arrivée à 60 ? (« == » compare ; un seul « = » rangerait)
                              // Si oui, une seconde est passée :
      imagesVues = 0;         //   on recommence à compter les images à 0,
      secondes++;             //   on ajoute une seconde,
      nombre(12, 5, secondes);  // et on l'affiche.
    }                         // Sinon (moins de 60), on ne fait rien de plus.
  }
}
`,
    aVoir: 'Les secondes avancent d’une à chaque seconde : 001, 002, 003…',
    controle: (c) => {
      const s1 = c.variable('secondes')
      c.avancer(125)
      const s2 = c.variable('secondes')
      c.avancer(10)
      return [
        ['à peu près 120 images font 2 secondes de plus', s2 === s1 + 2, ` (${s1} puis ${s2})`],
        ['le compteur d’images ne dépasse jamais 59', c.variable('imagesVues') < 60],
        ['l’écran montre les secondes', Number(c.mot(12, 5, 3)) === c.variable('secondes')],
      ]
    },
  },

  {
    titre: 'while avec une condition : la boucle qui s’arrête',
    difficulte: 3,
    provenance: 'cours',
    idee: 'La condition est posée AVANT chaque tour : quand elle devient fausse, on sort.',
    texte: [
      'Un `while` ordinaire a une vraie condition : `while (reste > 0)`. Avant **chaque** tour, la console la calcule. Vraie : elle exécute le bloc, puis revient la poser. Fausse : elle **saute** après l’accolade fermante et continue le programme.',
      'Pour qu’une boucle s’arrête, **quelque chose dans le bloc doit rapprocher la condition du faux**. Ici, c’est `reste--`. Oublie-le, et la boucle tourne pour toujours : l’écran reste bloqué sur 5. C’est la **boucle infinie** involontaire.',
      'Si la condition est fausse dès le départ (essaie `reste = 0`), le bloc ne s’exécute **pas une seule fois** : on passe directement au décollage.',
      'À l’intérieur, une **seconde boucle** fait attendre une demi-seconde : trente tours, un `image()` chacun. Une boucle dans une boucle, c’est permis — on y reviendra.',
      '**À toi :** fais partir le compte à rebours de 9, et accélère-le en attendant 15 images au lieu de 30.',
    ],
    code: `// CE PROGRAMME : un compte à rebours 5, 4, 3, 2, 1, puis DECOLLAGE!
//
// Ce qui est nouveau : une boucle while qui S'ARRÊTE.
//   while (condition) ... : répète TANT QUE la condition est vraie.
//   Avant chaque tour, on teste la condition ; dès qu'elle est fausse, on sort.

#include <texte>    // écrit un texte à l’écran
#include <nombre>   // écrit un nombre en chiffres

int main() {                    // Le jeu commence ici.
  uint8_t reste = 5;            // Le nombre affiché. Il part de 5.

  texte(3, 3, "COMPTE A REBOURS");

  while (reste > 0) {           // Tant que reste est plus grand que 0 :
    nombre(9, 7, reste, 1);     //   affiche reste sur 1 chiffre (5, puis 4, ...).

    uint8_t attente = 0;        //   Un petit compteur pour attendre.
    while (attente < 30) {      //   Une boucle DANS la boucle : 30 tours...
      image();                  //   ... de une image chacun :
      attente++;                //   30 images = une demi-seconde.
    }

    reste--;                    //   reste perd 1. Sans lui, la boucle ne finit jamais.
  }                             // Déroulé : 5, 4, 3, 2, 1. Quand reste vaut 0,
                                // « 0 > 0 » est faux : on sort de la boucle.

  texte(5, 7, "DECOLLAGE!");    // Écrit par-dessus le dernier chiffre.

  while (true) {                // La boucle de fin : on garde l'écran allumé.
    image();
  }
}
`,
    aVoir: '5, 4, 3, 2, 1 toutes les demi-secondes, puis « DECOLLAGE! ».',
    controle: (c) => {
      const debut = c.mot(9, 7, 1)
      c.avancer(40)
      const ensuite = c.mot(9, 7, 1)
      c.avancer(150)
      return [
        ['on part de 5', debut === '5'],
        ['un peu plus tard, on a décompté', Number(ensuite) < 5, ` (${ensuite})`],
        ['la boucle s’est arrêtée, le programme a continué', c.mot(5, 7, 10) === 'DECOLLAGE!'],
        ['« reste » a bien fini à zéro', c.variable('reste') === 0],
      ]
    },
  },

  {
    titre: 'for : la boucle qui compte',
    difficulte: 3,
    provenance: 'cours',
    idee: 'Départ, condition, pas : les trois morceaux d’une boucle qui compte, sur une seule ligne.',
    texte: [
      'Compter est si fréquent que le C++ lui donne sa boucle : `for (uint8_t i = 0; i < 20; i++)`. Trois morceaux, séparés par des **points-virgules** :',
      '**1. le départ** `uint8_t i = 0` — exécuté une fois, avant tout. **2. la condition** `i < 20` — posée avant chaque tour, comme dans `while`. **3. le pas** `i++` — exécuté à la fin de chaque tour. Le `for` est **exactement** ce `while`-ci, rangé sur une ligne :',
      '`uint8_t i = 0; while (i < 20) { …; i++; }` — tout ce qui concerne le comptage est au même endroit, et on ne risque plus d’oublier le `i++` en bas du bloc.',
      '`i < 20` fait **20 tours**, de 0 à 19 — pas de 1 à 20. L’écran a 20 colonnes, numérotées de 0 à 19 : la boucle et l’écran parlent la même langue. `i` n’existe **que dans la boucle** : après l’accolade, le nom est libre.',
      'Le pas n’est pas forcément `i++` : `i += 2` saute une case sur deux. Et `i` sert dans des calculs : `nombre(i * 2, …)` écarte les chiffres.',
      '**Une question** : la boucle n’appelle jamais `image()`, et pourtant elle ne va pas aussi vite que le processeur le pourrait. C’est **l’écriture à l’écran** qui attend, pas la boucle : chaque `texte()` attend la courte pause entre deux images. La leçon suivante explique pourquoi — c’est **la** règle de la Game Boy.',
      '**À toi :** trace une colonne de # (la ligne varie, la colonne est fixe) de la ligne 12 à la ligne 17.',
    ],
    code: `// CE PROGRAMME : dessine deux rangées de # et une rangée de chiffres, avec « for ».
//
// Ce qui est nouveau : la boucle for, la boucle qui COMPTE.
//   for (DÉPART ; CONDITION ; PAS) ...
//     DÉPART    : fait une fois, au début       (uint8_t i = 0 : i commence à 0)
//     CONDITION : testée avant chaque tour      (i < 20 : on continue tant que i < 20)
//     PAS       : fait à la fin de chaque tour  (i++ : i gagne 1)

#include <texte>    // écrit un texte à l’écran
#include <nombre>   // écrit un nombre en chiffres

int main() {                              // Le jeu commence ici.
  // Vingt tours : i vaut 0, 1, 2 ... 19.
  for (uint8_t i = 0; i < 20; i++) {
    texte(i, 3, "#");                     // Un # en colonne i, ligne 3 : toute la ligne.
  }                                       // Quand i vaut 20, « 20 < 20 » est faux : fini.

  // Un pas de deux : 0, 2, 4 ... 18.
  for (uint8_t i = 0; i < 20; i += 2) {   // « i += 2 » = « i = i + 2 ».
    texte(i, 5, "#");                     // Un # une colonne sur deux.
  }

  // i sert aussi dans le calcul.
  for (uint8_t i = 0; i < 10; i++) {      // i vaut 0, 1, 2 ... 9.
    nombre(i * 2, 8, i, 1);               // En colonne i * 2 : 0, 2, 4 ... 18,
                                          // on écrit i sur 1 chiffre : 0 1 2 3 ... 9.
  }

  while (true) {                          // La boucle du jeu : l'écran reste allumé.
    image();
  }
}
`,
    aVoir: 'Une ligne pleine de #, une ligne d’un # sur deux, et les chiffres de 0 à 9 espacés — qui se dessinent sous tes yeux.',
    controle: (c) => {
      c.avancer(80)
      return [
        ['20 tours : la ligne est pleine', c.mot(0, 3, 20) === '#'.repeat(20)],
        ['un pas de 2 : une case sur deux', c.mot(0, 5, 20) === '# '.repeat(10)],
        ['i vaut 0 au premier tour, 9 au dernier', c.mot(0, 8, 19) === '0 1 2 3 4 5 6 7 8 9'],
      ]
    },
  },

  {
    titre: 'L’écran ne s’écrit que pendant le VBlank',
    difficulte: 3,
    provenance: 'cours',
    idee: 'La console dessine l’écran ligne par ligne, soixante fois par seconde ; on ne peut lui écrire que pendant ses pauses : le VBlank, et la toute petite pause au bout de chaque ligne.',
    texte: [
      'L’écran de la Game Boy est dessiné **ligne par ligne**, de haut en bas : 144 lignes, puis une pause de 10 lignes avant de recommencer. Cette pause s’appelle le **VBlank** (« vertical blank »). Elle dure à peine plus d’**une milliseconde**, soixante fois par seconde. Et au bout de **chaque ligne**, il y a aussi une toute petite pause, le temps de revenir à gauche.',
      'Pendant que la console dessine une ligne, la puce graphique **occupe la mémoire vidéo** : le processeur n’a pas le droit d’y écrire. `texte()`, `effacer()` et `nombre()` attendent donc, **avant chaque lettre**, une pause : celle du bout de la ligne, ou le VBlank. Au pire, ils attendent **une ligne** d’écran : un dixième de milliseconde. Une lettre ne coûte presque rien.',
      'Presque rien, mais pas rien. Le programme le **mesure** avec `images()`, l’horloge de la console, qui avance à chaque VBlank. Il remplit **16 lignes** de « # », écran allumé, et recommence **trois fois** : 48 tours, 48 × 20 = **960 lettres**. `i % 16` (le reste, leçon 2) ramène la ligne à 0 après la 15 : 0, 1 … 15, puis 0, 1 … 15 encore. Pendant le VBlank, plusieurs lettres passent d’un coup ; entre deux lignes, une ou deux. La mesure donne **3 images** : environ 320 lettres par image. Pour vingt lettres, on ne verrait rien ; pour redessiner tout un décor, ça compte.',
      '**Première solution : éteindre l’écran.** `ecran(0)` l’éteint ; la mémoire vidéo est alors libre **tout le temps**, et les 960 écritures se font d’un trait, sans attendre. `ecran(1)` le rallume. La mesure donne **1 image** : c’est `ecran(0)` qui l’a prise, car il attend lui-même un VBlank (éteindre l’écran pendant qu’il se dessine peut abîmer une vraie console). L’écran clignote en blanc un instant : on le fait donc aux moments où ça ne gêne pas — au début d’un niveau, entre deux écrans. **À partir d’ici, les leçons dessinent leur décor écran éteint.**',
      '**Seconde solution, dans la boucle du jeu : n’écrire que ce qui change.** Déplacer un personnage, c’est effacer **une** case et en écrire **une** — pas redessiner toute la ligne. Un jeu qui redessinerait tout l’écran à chaque image passerait une image entière par tour à attendre, et tournerait deux fois moins vite. C’est pourquoi les programmes du chapitre 2 gardaient `ancien`.',
      'Les vrais jeux Game Boy vivent avec cette règle : le décor est posé écran éteint, et chaque image ne change que quelques cases. Ce qui bouge beaucoup est confié aux **lutins**, que le tutoriel présente dans ses leçons sur les sprites.',
      '**À toi :** remplace le 48 par 16 dans la boucle écran allumé (l’écran rempli une seule fois) : combien d’images, maintenant ? Et avec 1 ?',
    ],
    code: `// CE PROGRAMME : mesure combien de temps il faut pour remplir l'écran,
// d'abord écran ALLUMÉ, puis écran ÉTEINT. Éteint, c'est beaucoup plus rapide.
//
// Pourquoi : écran allumé, la console ne peut écrire dans l'image que pendant
// une courte pause entre deux images (le « VBlank »). texte() attend cette pause.
// Écran éteint, rien n'est affiché : on peut écrire à tout moment.

#include <texte>    // écrit un texte à l’écran
#include <ecran>    // éteint ou rallume l’écran
#include <nombre>   // écrit un nombre en chiffres

int main() {                          // Le jeu commence ici.
  // Écran allumé : avant chaque lettre, texte() attend une pause.
  uint8_t debut = images();           // images() = combien d'images depuis le démarrage.
                                      // On note l'heure de départ.
  for (uint8_t i = 0; i < 48; i++) {  // 48 tours...
    texte(0, i % 16, "####################");   // 20 lettres ; 3 fois l'écran
                                      // i % 16 = le reste par 16 : 0 à 15, puis encore
                                      // 0 à 15, 3 fois : 3 fois les 16 premières lignes.
  }
  uint8_t allume = images() - debut;  // Heure d'arrivée moins heure de départ :
                                      // le nombre d'images que ça a pris.

  // Écran éteint : la mémoire vidéo est libre.
  debut = images();                   // Nouvelle heure de départ.
  ecran(0);                           // ecran(0) ÉTEINT l'écran.
  for (uint8_t i = 0; i < 48; i++) {  // Le même travail...
    texte(0, i % 16, "::::::::::::::::::::");  // ... avec des « : » pour voir le changement.
  }
  ecran(1);                           // ecran(1) le RALLUME.
  uint8_t eteint = images() - debut;  // Le temps que ça a pris cette fois.

  texte(0, 16, "ALLUME:");  nombre(8, 16, allume);   // Les deux mesures, en bas.
  texte(12, 16, "IMAGES");
  texte(0, 17, "ETEINT:");  nombre(8, 17, eteint);   // Beaucoup plus petit.
  texte(12, 17, "IMAGES");

  while (true) {                      // La boucle du jeu.
    image();
  }
}
`,
    aVoir: 'Seize lignes de « : » ; en bas, la mesure : 3 images écran allumé pour 960 lettres, 1 écran éteint.',
    controle: (c) => {
      c.avancer(40)
      const allume = c.variable('allume')
      const eteint = c.variable('eteint')
      let lignes = true
      for (let l = 0; l < 16; l++) if (c.mot(0, l, 20) !== ':'.repeat(20)) lignes = false
      return [
        ['les seize lignes sont dessinées', lignes],
        /* 960 lettres, environ 320 par image : plusieurs images. */
        ['écran allumé : plusieurs images pour 960 lettres', allume >= 2, ` (${allume} images)`],
        ['écran éteint : presque rien', eteint <= 1 && eteint < allume, ` (${eteint})`],
        ['l’écran affiche la mesure', Number(c.mot(8, 16, 3)) === allume && Number(c.mot(8, 17, 3)) === eteint],
      ]
    },
  },

  {
    titre: 'Compter à l’envers, et le piège du zéro',
    difficulte: 3,
    provenance: 'cours',
    idee: 'Un octet n’est jamais plus petit que zéro : « i >= 0 » est toujours vrai.',
    texte: [
      'Compter à l’envers change les trois morceaux : partir **du haut**, continuer **tant qu’on est au-dessus** du bas, et **retirer** un à chaque tour : `for (uint8_t i = 9; i > 0; i--)` donne 9, 8 … 1.',
      'Et zéro ? Le réflexe est d’écrire `i >= 0`. **C’est une boucle infinie.** Un `uint8_t` ne descend jamais sous zéro : après 0, `i--` donne **255**, qui est `>= 0`, et l’on repart pour 256 tours… à l’infini. Le compilateur ne dit rien — la ligne est parfaitement correcte en C++.',
      'La bonne façon : compter de 10 à 1, et **se servir de `i - 1`**. Quand `i` vaut 1, on travaille sur 0, puis `i` devient 0 et la condition `i > 0` arrête tout proprement.',
      '`tours` compte les passages : **10** exactement. Compter les tours est la meilleure façon de vérifier une boucle qu’on n’est pas sûr d’avoir bien écrite.',
      '**À toi :** avec une boucle `for` qui monte, affiche 9 à 0 quand même (indice : `9 - i`).',
    ],
    code: `// CE PROGRAMME : compte à l'envers avec for : de 9 à 1, puis de 9 à 0.
//
// Le piège : un uint8_t ne descend jamais sous 0 (après 0, il revient à 255).
// Donc « i >= 0 » est TOUJOURS vrai, et une boucle qui s'arrête sur « i >= 0 »
// ne s'arrête jamais.

#include <ecran>    // éteint ou rallume l’écran
#include <texte>    // écrit un texte à l’écran
#include <nombre>   // écrit un nombre en chiffres

int main() {                          // Le jeu commence ici.
  ecran(0);                           // Tout le dessin se fait écran éteint (plus rapide).

  texte(1, 1, "DE 9 A 1");
  for (uint8_t i = 9; i > 0; i--) {   // i part de 9 ; on continue tant que i > 0 ;
                                      // « i-- » retire 1 à chaque tour : 9, 8, ... 1.
    nombre((9 - i) * 2, 3, i, 1);     // La colonne : (9 - i) * 2.
                                      // i = 9 → colonne 0 ; i = 8 → colonne 2 ; ...
  }

  // for (uint8_t i = 9; i >= 0; i--)  ne s'arrête JAMAIS
  // (0 - 1 donne 255, qui est encore >= 0).

  // La bonne façon d'aller jusqu'à 0 : compter de 10 à 1, et afficher i - 1.
  texte(1, 7, "DE 9 A 0");
  uint8_t tours = 0;                  // Combien de tours la boucle a faits.
  for (uint8_t i = 10; i > 0; i--) {  // i = 10, 9, ... 1 : dix tours.
    nombre((10 - i) * 2, 9, i - 1, 1);  // On affiche i - 1 : 9, 8, ... 0.
    tours++;                          // Un tour de plus.
  }

  texte(1, 13, "TOURS:");
  nombre(8, 13, tours);               // Affiche 010 : la boucle a bien fini.

  ecran(1);                           // On rallume l'écran : tout apparaît d'un coup.

  while (true) {                      // La boucle du jeu.
    image();
  }
}
`,
    aVoir: '9 8 7 … 1 sur la première ligne, 9 8 7 … 0 sur la seconde, et 010 tours.',
    controle: (c) => [
      ['de 9 à 1', c.mot(0, 3, 17) === '9 8 7 6 5 4 3 2 1'],
      ['de 9 à 0, sans boucle infinie', c.mot(0, 9, 19) === '9 8 7 6 5 4 3 2 1 0'],
      ['exactement dix tours', c.mot(8, 13, 3) === '010'],
    ],
  },

  {
    titre: 'Une boucle dans une boucle : la grille',
    difficulte: 3,
    provenance: 'cours',
    idee: 'Pour chaque ligne, toutes les colonnes : c’est ainsi qu’on remplit un écran.',
    texte: [
      'Mettre un `for` **dans** un `for` : la boucle du dedans fait **tous ses tours** pour **chaque** tour de celle du dehors. 4 lignes × 8 colonnes = **32** passages dans le bloc le plus profond.',
      'Suis-la à la main : `ligne` vaut 0, et `colonne` va de 0 à 7 — la première rangée est finie. Puis `ligne` vaut 1, `colonne` **repart de 0** (sa déclaration est rejouée), et ainsi de suite. On lit l’écran comme un livre : de gauche à droite, puis la ligne suivante.',
      'Les noms comptent : `ligne` et `colonne` se relisent mieux que `i` et `j`, et on voit tout de suite que `texte(colonne, ligne, …)` est dans le bon ordre. Inverser les deux est une erreur classique : le rectangle se retrouve couché.',
      'Le triangle montre la vraie puissance : la **limite du dedans dépend du dehors** — `colonne <= ligne`. La première rangée a 1 case, la deuxième 2, la sixième 6. 1 + 2 + 3 + 4 + 5 + 6 = **21**.',
      'Tout décor de jeu Game Boy est une grille de tuiles de 8 × 8 pixels : ce double `for` est **la** boucle du dessinateur de niveaux.',
      '**À toi :** retourne le triangle — la pointe en bas — en changeant seulement la condition du dedans.',
    ],
    code: `// CE PROGRAMME : dessine un rectangle puis un triangle de #, et compte les cases.
//
// Ce qui est nouveau : une boucle DANS une boucle.
// La boucle du dehors choisit la ligne ; pour CHAQUE ligne, la boucle du
// dedans parcourt toutes les colonnes.

#include <ecran>    // éteint ou rallume l’écran
#include <texte>    // écrit un texte à l’écran
#include <nombre>   // écrit un nombre en chiffres

int main() {                              // Le jeu commence ici.
  ecran(0);                               // On dessine écran éteint (plus rapide).
  uint8_t cases = 0;                      // Le nombre de # posés.

  // Un rectangle : 4 lignes de 8 colonnes.
  for (uint8_t ligne = 0; ligne < 4; ligne++) {         // ligne = 0, 1, 2, 3
    for (uint8_t colonne = 0; colonne < 8; colonne++) { //   colonne = 0 à 7, pour chaque ligne
      texte(1 + colonne, 1 + ligne, "#");               //   « 1 + » décale d'une case
                                                        //   pour ne pas coller au bord.
      cases++;                                          //   un # de plus.
    }
  }
  nombre(12, 2, cases);                   // 4 lignes × 8 colonnes = 32 : affiche 032.

  // Un triangle : la ligne n a n + 1 cases.
  uint8_t triangle = 0;
  for (uint8_t ligne = 0; ligne < 6; ligne++) {             // 6 lignes : 0 à 5
    for (uint8_t colonne = 0; colonne <= ligne; colonne++) { // la colonne va jusqu'à ligne :
                                                             // ligne 0 → 1 case, ligne 1 → 2 ...
      texte(1 + colonne, 7 + ligne, "#");                    // le triangle commence ligne 7.
      triangle++;
    }
  }
  nombre(12, 10, triangle);               // 1 + 2 + 3 + 4 + 5 + 6 = 21 : affiche 021.
  ecran(1);                               // On rallume : tout apparaît.

  while (true) {                          // La boucle du jeu.
    image();
  }
}
`,
    aVoir: 'Un rectangle de 4 × 8 (032 cases), et en dessous un triangle en escalier (021 cases).',
    controle: (c) => {
      const rect = [1, 2, 3, 4].every((l) => c.mot(1, l, 8) === '########')
      const tri = [0, 1, 2, 3, 4, 5].every((n) => net(c.mot(1, 7 + n, 8)) === '#'.repeat(n + 1))
      return [
        ['le rectangle est plein', rect],
        ['32 passages dans le bloc du dedans', c.mot(12, 2, 3) === '032'],
        ['le triangle monte d’une case par ligne', tri],
        ['1 + 2 + 3 + 4 + 5 + 6 = 21', c.mot(12, 10, 3) === '021'],
      ]
    },
  },

  {
    titre: 'break et continue : sortir, ou sauter un tour',
    difficulte: 3,
    provenance: 'cours',
    idee: 'On n’est pas obligé de finir tous les tours : on sort dès qu’on a trouvé.',
    texte: [
      '`break;` **sort** de la boucle immédiatement, sans finir le tour ni faire les suivants. C’est l’outil de la **recherche** : on parcourt jusqu’à trouver, puis on s’arrête.',
      'Ici, on cherche la **première case vide** d’une rangée — là où un jeu poserait une nouvelle pièce, un nouvel ennemi. `lire(colonne, ligne)` rend le numéro de la tuile affichée ; l’espace est la tuile **0**. Dès qu’on la trouve : on retient la colonne, et `break`.',
      '`tours` le prouve : la boucle prévoyait 20 tours, elle n’en a fait que **5**. Sur une grande grille, s’arrêter tôt, c’est du temps de gagné — et sur une console à 4 MHz, le temps est compté.',
      '`continue;` fait l’inverse : il **abandonne ce tour-ci** et passe **au suivant**. Ici, il saute les multiples de 3 (`i % 3 == 0`) : 0, 3, 6 et 9 ne sont pas écrits.',
      'Le `libre = 255` de départ est une **valeur témoin** : si la rangée était pleine, la boucle finirait sans rien trouver, et 255 le dirait (aucune colonne ne porte ce numéro).',
      '**À toi :** remplis toute la rangée de # et vérifie que l’écran affiche 255.',
    ],
    code: `// CE PROGRAMME : cherche la première case vide d'une ligne (avec break),
// puis écrit des chiffres en sautant les multiples de 3 (avec continue).
//
// Ce qui est nouveau :
//   break    = sortir de la boucle TOUT DE SUITE, sans finir les tours.
//   continue = sauter la FIN de ce tour, et passer au tour suivant.

#include <ecran>    // éteint ou rallume l’écran
#include <texte>    // écrit un texte à l’écran
#include <lire>     // lit la tuile posée sur une case
#include <nombre>   // écrit un nombre en chiffres
#include <reste>    // a % b, sauf par 1, 2, 4, 8, 16… écrits en clair

int main() {                              // Le jeu commence ici.
  ecran(0);                               // Dessin écran éteint.
  texte(0, 3, "####  ##  ##########");    // Une ligne avec des trous :
                                          // colonnes 0 à 3 = #, 4 et 5 = vides, ...

  uint8_t libre = 255;        // 255 : pas encore trouvé (une valeur « impossible »)
  uint8_t tours = 0;          // Combien de cases on a regardées.

  for (uint8_t colonne = 0; colonne < 20; colonne++) {  // colonne = 0 à 19
    tours++;                                            // une case de plus regardée
    if (lire(colonne, 3) == 0) {    // lire(colonne, ligne) rend ce qui est écrit
                                    // dans la case ; 0 veut dire « vide ».
      libre = colonne;              // On note la colonne vide...
      break;                  // trouvé : inutile de continuer
    }
  }
  // Déroulé : colonnes 0, 1, 2, 3 : un # ; colonne 4 : vide → libre = 4, break.
  // tours vaut 5 : on a regardé 5 cases au lieu de 20.

  texte(0, 5, "CASE LIBRE:");  nombre(14, 5, libre);   // affiche 004
  texte(0, 6, "TOURS FAITS:"); nombre(14, 6, tours);   // affiche 005

  // continue : on saute les multiples de 3.
  for (uint8_t i = 0; i < 10; i++) {      // i = 0 à 9
    if (i % 3 == 0) continue;             // reste de i par 3 égal à 0 ? (0, 3, 6, 9)
                                          // alors on saute la ligne suivante.
    nombre(i * 2, 10, i, 1);              // Écrit : 1 2 . 4 5 . 7 8 (pas de 0, 3, 6, 9).
  }
  ecran(1);                               // On rallume.

  while (true) {                          // La boucle du jeu.
    image();
  }
}
`,
    aVoir: 'La case libre est la 004, trouvée en 005 tours ; puis 1 2 4 5 7 8, sans 0, 3, 6 ni 9.',
    controle: (c) => [
      ['la première case vide est la colonne 4', c.mot(14, 5, 3) === '004'],
      ['break a arrêté la boucle après 5 tours', c.mot(14, 6, 3) === '005'],
      ['continue a sauté 0, 3, 6 et 9', c.mot(0, 10, 19) === '  1 2   4 5   7 8  '],
    ],
  },

  {
    titre: 'do … while : au moins une fois',
    difficulte: 3,
    provenance: 'cours',
    idee: 'Quand il faut d’abord essayer pour savoir si c’est bon, la condition se pose APRÈS.',
    texte: [
      '`do { … } while (condition);` exécute le bloc **d’abord**, puis pose la question. Le bloc tourne donc **au moins une fois** — même si la condition est fausse dès le départ. Attention au **point-virgule** final, obligatoire ici.',
      'C’est la boucle du **tirage** : on ne peut pas savoir si un dé est bon avant de l’avoir lancé. Ici, on veut un dé qui **ne donne jamais deux fois de suite** la même face. On relance **tant que** la face est la même que l’ancienne.',
      'Avec un `while` ordinaire, il faudrait tirer une première fois avant la boucle, puis écrire le même tirage dedans : **deux copies** du même code. `do … while` n’en a qu’une.',
      '`hasard() % 6` donne un reste de 0 à 5 — le modulo du chapitre 1 — et `+ 1` en fait une face de 1 à 6. `essais` compte les relances : parfois 1, parfois 2 ou 3.',
      'Un nouveau lancer toutes les demi-secondes : la boucle `for` du début de tour attend 30 images, comme au compte à rebours.',
      '**À toi :** empêche aussi le 6 : `while (de == ancien || de == 6)`.',
    ],
    code: `// CE PROGRAMME : lance un dé toutes les demi-secondes, sans jamais retomber
// sur la même face que la fois d'avant.
//
// Ce qui est nouveau : do ... while.
//   do ... while (condition);  fait le bloc AU MOINS UNE FOIS,
//   puis le recommence TANT QUE la condition est vraie.
//   (Un while normal teste AVANT ; do ... while teste APRÈS.)

#include <texte>    // écrit un texte à l’écran
#include <hasard>   // tire un nombre au hasard
#include <nombre>   // écrit un nombre en chiffres
#include <reste>    // a % b, sauf par 1, 2, 4, 8, 16… écrits en clair

int main() {                    // Le jeu commence ici.
  uint8_t de = 1;               // La face actuelle (1 à 6).
  uint8_t ancien = 1;           // La face d'avant.
  uint8_t essais = 0;           // Combien de lancers il a fallu cette fois.

  texte(1, 3, "DE:");           // Les trois titres.
  texte(1, 5, "AVANT:");
  texte(1, 7, "ESSAIS:");

  while (true) {                // La boucle du jeu :
    for (uint8_t i = 0; i < 30; i++) image();   // attend 30 images = une demi-seconde.
                                // (Sans accolades, le for ne répète que image().)

    ancien = de;                // On retient la face d'avant.
    essais = 0;                 // On recommence à compter les essais.
    do {                        // FAIS (au moins une fois) :
      de = hasard() % 6 + 1;    //   hasard() rend un nombre au hasard de 0 à 255.
                                //   % 6 garde le reste par 6 : 0 à 5 ; + 1 : 1 à 6.
      essais++;                 //   un essai de plus.
    } while (de == ancien);     // la même face : on relance

    nombre(9, 3, de, 1);        // La nouvelle face.
    nombre(9, 5, ancien, 1);    // L'ancienne : jamais la même.
    nombre(9, 7, essais, 1);    // Souvent 1, parfois 2 ou plus.
  }
}
`,
    aVoir: 'Une face de 1 à 6 toutes les demi-secondes, jamais la même que la précédente.',
    controle: (c) => {
      const tirages = []
      let jamaisPareil = true
      let toujoursUnASix = true
      for (let k = 0; k < 12; k++) {
        c.avancer(30)
        const de = c.variable('de')
        const ancien = c.variable('ancien')
        tirages.push(de)
        if (de === ancien) jamaisPareil = false
        if (de < 1 || de > 6) toujoursUnASix = false
      }
      return [
        ['chaque face est entre 1 et 6', toujoursUnASix, ` (${tirages.join(' ')})`],
        ['jamais deux fois de suite la même', jamaisPareil],
        ['au moins un essai à chaque lancer', c.variable('essais') >= 1],
      ]
    },
  },

  {
    titre: 'Une boucle qui dure plusieurs images',
    difficulte: 3,
    provenance: 'cours',
    idee: 'Un « for » se fait d’un coup ; pour qu’on VOIE quelque chose se construire, la boucle du jeu doit porter le compte.',
    texte: [
      'C’est la leçon la plus importante du chapitre pour un jeu. Un `for` **ne rend pas la main** avant son dernier tour : tant qu’il tourne, rien d’autre ne se passe. Le `for` du haut pose ses 20 # écran éteint, **avant** que le jeu commence : c’est le bon moment pour tout faire d’un coup.',
      'La ligne du bas se construit **une case toutes les 4 images**. Il n’y a **pas de `for`** : c’est la boucle du jeu elle-même qui fait les tours. La variable `pose` — déclarée **avant** la boucle, voir le chapitre 1 — retient **où l’on en est** d’une image à l’autre.',
      'Toute animation d’un jeu est faite ainsi : une porte qui s’ouvre, une barre de vie qui descend, un texte qui s’écrit lettre par lettre. **On ne met jamais un long `for` qui attend au milieu du jeu** : pendant qu’il tourne, les touches ne sont plus lues, les ennemis ne bougent plus — le jeu est gelé. Même un `for` court à écrire se paie en images de jeu gelé s’il attend.',
      'À retenir : un `for` sert à **tout faire maintenant** (dessiner un décor écran éteint, parcourir un tableau, calculer). Une **variable + la boucle du jeu** sert à **faire un peu à chaque image**.',
      'Et même sans écrire à l’écran, un `for` trop long dans la boucle du jeu coûte cher : s’il ne tient plus dans 1/60 de seconde, le jeu **ralentit**. La leçon 76 du tutoriel mesure ce coût.',
      '**À toi :** écris « BONJOUR » lettre par lettre, une toutes les 10 images, avec la même méthode.',
    ],
    code: `// CE PROGRAMME : dessine une ligne de # d'un coup, puis une autre PETIT À PETIT,
// une case toutes les 4 images, pendant que le jeu tourne.
//
// L'idée : un travail long (une animation) ne se fait pas dans une boucle for
// qui bloque tout ; on en fait un petit morceau à chaque image.

#include <ecran>   // éteint ou rallume l’écran
#include <texte>   // écrit un texte à l’écran

int main() {                            // Le jeu commence ici.
  // D'un coup : écran éteint, avant que le jeu commence.
  ecran(0);                             // Écran éteint.
  texte(0, 2, "D UN COUP:");
  for (uint8_t i = 0; i < 20; i++) {    // 20 tours, i = 0 à 19 :
    texte(i, 4, "#");                   // les 20 # de la ligne 4.
  }
  texte(0, 8, "PETIT A PETIT:");
  ecran(1);                             // On rallume : la ligne 4 apparaît entière.

  // Petit à petit : une case toutes les 4 images.
  uint8_t pose = 0;                     // Combien de # déjà posés sur la ligne 10 (0 à 20).
  uint8_t attente = 0;                  // Les images attendues depuis le dernier #.

  while (true) {                        // La boucle du jeu :
    image();                            // une image.

    attente++;                          // Une image de plus.
    if (attente == 4 && pose < 20) {    // 4 images passées ET la ligne pas encore finie ?
      texte(pose, 10, "#");             //   pose un # à la colonne pose (0, puis 1, ...),
      pose++;                           //   un de plus de posé,
      attente = 0;                      //   et on recommence à attendre 4 images.
    }
  }                                     // 20 cases × 4 images = 80 images ≈ 1,3 seconde.
}
`,
    aVoir: 'La ligne du haut est pleine d’emblée ; celle du bas se remplit case par case, en deux secondes environ.',
    controle: (c) => {
      const hautDebut = c.mot(0, 4, 20)
      const basDebut = net(c.mot(0, 10, 20)).length
      c.avancer(20)
      const basMilieu = net(c.mot(0, 10, 20)).length
      attendre(c, () => c.mot(0, 10, 20) === '#'.repeat(20), 400)
      return [
        ['le for a tout posé dès les premières images', hautDebut === '#'.repeat(20)],
        ['en bas, seulement quelques cases au début', basDebut > 0 && basDebut < 20, ` (${basDebut} cases)`],
        ['la ligne du bas grandit avec le temps', basMilieu > basDebut, ` (${basDebut} puis ${basMilieu})`],
        ['elle finit par être pleine', c.mot(0, 10, 20) === '#'.repeat(20)],
      ]
    },
  },

  /* ================================================ 4 — les tableaux */

  {
    titre: 'Un tableau : plusieurs cases sous un seul nom',
    difficulte: 4,
    provenance: 'cours',
    idee: 'Cinq scores, ce n’est pas cinq variables : c’est un tableau de cinq cases, et une boucle.',
    texte: [
      '`uint8_t scores[5]` réserve **cinq cases qui se suivent** en mémoire, sous un seul nom. On en désigne une par son **indice**, entre crochets : `scores[0]`, `scores[1]`… jusqu’à `scores[4]`.',
      '**Le premier indice est 0.** Un tableau de 5 cases va de 0 à 4 ; `scores[5]` n’existe pas — et la console ne t’arrêtera pas : elle lira ou écrira la case d’après, qui appartient à une autre variable. C’est pour cela que la boucle s’écrit `i < 5`, et jamais `i <= 5`.',
      'L’indice peut être **calculé** : `scores[i]`. C’est tout l’intérêt. Avec cinq variables `score0`… `score4`, il faudrait cinq lignes d’affichage ; avec un tableau, **une boucle** — et elle marcherait pareil pour 50 joueurs.',
      '`= { 12, 40, 7, 99, 25 }` donne les valeurs de départ, dans l’ordre des indices. Plus tard, `scores[2] = 50;` change une seule case, sans toucher aux autres.',
      '`sizeof(scores)` donne la taille du tableau en octets : 5. On l’utilise pour ne pas écrire le 5 deux fois.',
      '**À toi :** ajoute un sixième joueur. Grâce à `sizeof`, la boucle n’a pas besoin de changer.',
    ],
    code: `// CE PROGRAMME : range 5 scores dans UN tableau, en change un, et les affiche tous.
//
// Ce qui est nouveau : le TABLEAU. Plusieurs cases sous un seul nom.
//   uint8_t scores[5]   = 5 cases uint8_t, nommées scores[0], scores[1] ... scores[4].
//   Le numéro entre crochets s'appelle l'INDICE. Il commence à 0, pas à 1 !

#include <ecran>    // éteint ou rallume l’écran
#include <texte>    // écrit un texte à l’écran
#include <nombre>   // écrit un nombre en chiffres

uint8_t scores[5] = { 12, 40, 7, 99, 25 };  // Les 5 valeurs de départ, dans l'ordre :
                                            // scores[0] = 12, scores[1] = 40,
                                            // scores[2] = 7,  scores[3] = 99, scores[4] = 25.
                                            // Écrit HORS de main : le tableau existe
                                            // pendant tout le jeu.

int main() {                  // Le jeu commence ici.
  ecran(0);                   // Dessin écran éteint.
  scores[2] = 50;             // la troisième case : l'indice 2. Elle passe de 7 à 50.

  for (uint8_t i = 0; i < sizeof(scores); i++) {  // sizeof(scores) = la taille du tableau : 5.
                                                  // Donc i = 0, 1, 2, 3, 4 : une fois par case.
    texte(2, 3 + i * 2, "JOUEUR");                // La ligne : 3 + i * 2 → 3, 5, 7, 9, 11
                                                  // (une ligne vide entre deux joueurs).
    nombre(9, 3 + i * 2, i, 1);                   // Le numéro du joueur : i.
    nombre(13, 3 + i * 2, scores[i]);             // scores[i] : la case numéro i.
                                                  // i = 0 → 12 ; i = 2 → 50 ; i = 4 → 25.
  }

  ecran(1);                   // On rallume : tout apparaît.

  while (true) {              // La boucle du jeu.
    image();
  }
}
`,
    aVoir: 'Cinq lignes JOUEUR 0 à JOUEUR 4, avec 012, 040, 050, 099, 025.',
    controle: (c) => {
      const lus = [0, 1, 2, 3, 4].map((i) => c.mot(13, 3 + i * 2, 3)).join(' ')
      return [
        ['les cinq cases sont affichées dans l’ordre', lus === '012 040 050 099 025', ` (${lus})`],
        ['le premier joueur porte l’indice 0', c.mot(9, 3, 1) === '0'],
        ['le dernier, l’indice 4', c.mot(9, 11, 1) === '4'],
      ]
    },
  },

  {
    titre: 'Parcourir : le total, le plus grand, le plus petit',
    difficulte: 4,
    provenance: 'cours',
    idee: 'Une boucle qui passe sur chaque case, et une variable qui retient ce qu’on a vu.',
    texte: [
      'Presque tout ce qu’on fait avec un tableau suit le même modèle : **une variable de résultat, préparée avant la boucle**, puis **une boucle qui la met à jour à chaque case**.',
      '**Le total** : on part de 0, et on ajoute chaque case. Attention au chapitre 1 : si le total dépasse 255, il déborde. Ici 12 + 40 + 7 + 99 + 25 = 183, ça tient.',
      '**Le plus grand** : on part de la **première case** (et pas de 0 !), puis on la remplace chaque fois qu’on trouve plus grand. On retient aussi **où** on l’a trouvé : `ouMax` — dans un jeu, c’est « quel joueur a gagné ».',
      '**Le plus petit** : même chose avec `<`. Si l’on partait de 0 comme pour le total, aucune case ne serait jamais plus petite, et le résultat serait faux : **la valeur de départ est une vraie décision**.',
      'Une seule boucle suffit pour les trois : on peut mettre à jour plusieurs résultats au même passage.',
      '**À toi :** calcule la **moyenne** (le total divisé par le nombre de cases — division entière).',
    ],
    code: `// CE PROGRAMME : parcourt un tableau de 5 scores pour trouver
// le total, le plus grand (et qui l'a fait), et le plus petit.
//
// La méthode : une seule boucle passe sur chaque case, et met à jour
// trois « résultats en cours ».

#include <ecran>    // éteint ou rallume l’écran
#include <texte>    // écrit un texte à l’écran
#include <nombre>   // écrit un nombre en chiffres

uint8_t scores[5] = { 12, 40, 7, 99, 25 };  // scores[0] = 12 ... scores[4] = 25.

int main() {                        // Le jeu commence ici.
  ecran(0);                         // Dessin écran éteint.
  uint8_t total = 0;                // La somme, qui commence à 0.
  uint8_t plusGrand = scores[0];    // Le plus grand VU JUSQU'ICI : au départ, le premier.
  uint8_t ouMax = 0;                // L'indice (le numéro) du plus grand.
  uint8_t plusPetit = scores[0];    // Le plus petit vu jusqu'ici : au départ, le premier.

  for (uint8_t i = 0; i < 5; i++) { // i = 0 à 4 : chaque case, une fois.
    total = total + scores[i];      // On ajoute la case au total.
                                    // 0 + 12 = 12, + 40 = 52, + 7 = 59, + 99 = 158, + 25 = 183.

    if (scores[i] > plusGrand) {    // Cette case bat-elle le record ?
      plusGrand = scores[i];        //   oui : c'est le nouveau plus grand,
      ouMax = i;                    //   et on retient où il est.
    }                               // (40 bat 12 ; puis 99 bat 40 : ouMax = 3.)
    if (scores[i] < plusPetit) {    // Plus petit que le plus petit vu ?
      plusPetit = scores[i];        //   oui : on le garde. (7 bat 12.)
    }
  }

  texte(1, 3, "TOTAL:");       nombre(14, 3, total);      // 183
  texte(1, 5, "PLUS GRAND:");  nombre(14, 5, plusGrand);  // 099
  texte(1, 6, "PAR LE JOUEUR"); nombre(16, 6, ouMax, 1);  // 3
  texte(1, 8, "PLUS PETIT:");  nombre(14, 8, plusPetit);  // 007

  ecran(1);                         // On rallume.

  while (true) {                    // La boucle du jeu.
    image();
  }
}
`,
    aVoir: 'Total 183, plus grand 099 (joueur 3), plus petit 007.',
    controle: (c) => [
      ['le total est 183', c.mot(14, 3, 3) === '183'],
      ['le plus grand est 99', c.mot(14, 5, 3) === '099'],
      ['trouvé chez le joueur 3', c.mot(16, 6, 1) === '3'],
      ['le plus petit est 7', c.mot(14, 8, 3) === '007'],
    ],
  },

  {
    titre: 'Une table gravée : dessiner un niveau',
    difficulte: 4,
    provenance: 'cours',
    idee: 'Le niveau est une liste de nombres ; deux boucles en font un paysage.',
    texte: [
      '`const uint8_t HAUTEURS[] = { … };` est un tableau **constant** : il est **gravé dans la cartouche**, comme le programme. Il ne prend **aucun octet** des 8 Ko de mémoire de travail — et il ne peut plus changer. C’est la place naturelle des **données d’un niveau**.',
      'Les crochets vides `[]` laissent le compilateur compter les valeurs. `sizeof(HAUTEURS)` rend ce nombre : ajouter une colonne ne demande de changer **rien d’autre**.',
      'Le dessin combine tout ce qu’on a vu : **pour chaque colonne** (le `for` du dehors), **on empile autant de blocs que la hauteur** (le `for` du dedans, dont la limite vient du tableau). C’est le triangle du chapitre 3 — mais la limite est lue dans des données, au lieu d’être calculée.',
      '`17 - h` : l’écran compte ses lignes **vers le bas**, alors qu’on empile **vers le haut**. La ligne 17 est tout en bas ; un bloc de hauteur 0 s’y pose, le suivant sur la 16…',
      'C’est ainsi que sont faits les niveaux de beaucoup de jeux : **le code ne change pas, seules les données changent**. Un nouveau niveau, c’est un nouveau tableau.',
      '**À toi :** dessine un second niveau en changeant seulement les nombres.',
    ],
    code: `// CE PROGRAMME : dessine un paysage de collines à partir d'une liste de hauteurs.
//
// Ce qui est nouveau : const devant un tableau.
//   const = « constant » : le tableau ne changera jamais. Il est gravé dans
//   la cartouche et ne prend pas de place dans la petite mémoire de travail.
//   [] vide : le compilateur compte lui-même les valeurs (ici 20).

#include <ecran>    // éteint ou rallume l’écran
#include <texte>    // écrit un texte à l’écran
#include <nombre>   // écrit un nombre en chiffres

const uint8_t HAUTEURS[] = {      // La hauteur de chaque colonne, de gauche à droite :
  2, 2, 3, 5, 5, 4, 2, 1, 1, 3,   // colonnes 0 à 9
  6, 6, 3, 2, 2, 4, 4, 2, 1, 1,   // colonnes 10 à 19
};

int main() {                      // Le jeu commence ici.
  ecran(0);                       // Dessin écran éteint.
  uint8_t blocs = 0;              // Combien de # posés en tout.

  for (uint8_t colonne = 0; colonne < sizeof(HAUTEURS); colonne++) {  // colonne = 0 à 19
    for (uint8_t h = 0; h < HAUTEURS[colonne]; h++) {  // h = 0 jusqu'à la hauteur - 1
      texte(colonne, 17 - h, "#");  // On empile depuis le BAS : la ligne 17 est la
                                    // dernière de l'écran. h = 0 → ligne 17, h = 1 → 16...
                                    // Colonne 3 (hauteur 5) : lignes 17, 16, 15, 14, 13.
      blocs++;                      // un # de plus.
    }
  }

  texte(1, 1, "COLONNES:"); nombre(12, 1, sizeof(HAUTEURS));  // 020
  texte(1, 2, "BLOCS:");    nombre(12, 2, blocs);             // la somme des hauteurs : 59

  ecran(1);                       // On rallume : le paysage apparaît.

  while (true) {                  // La boucle du jeu.
    image();
  }
}
`,
    aVoir: 'Un paysage de collines au bas de l’écran, 20 colonnes, 59 blocs.',
    controle: (c) => {
      const hauteurs = [2, 2, 3, 5, 5, 4, 2, 1, 1, 3, 6, 6, 3, 2, 2, 4, 4, 2, 1, 1]
      let juste = true
      for (let col = 0; col < 20; col++) {
        for (let l = 0; l < 18; l++) {
          const plein = c.mot(col, l, 1) === '#'
          const attendu = l > 17 - hauteurs[col] && l >= 3
          if (l >= 3 && plein !== attendu) juste = false
        }
      }
      return [
        ['chaque colonne a la hauteur lue dans le tableau', juste],
        ['sizeof compte 20 colonnes', c.mot(12, 1, 3) === '020'],
        ['59 blocs posés', c.mot(12, 2, 3) === '059'],
      ]
    },
  },

  {
    titre: 'Chercher et changer une case',
    difficulte: 4,
    provenance: 'cours',
    idee: 'Ramasser une pièce, c’est trouver sa case dans le tableau, et la mettre à zéro.',
    texte: [
      'Un tableau en mémoire de travail (sans `const`) **peut changer** pendant le jeu. Ici, `pieces[i]` vaut 1 s’il y a une pièce en colonne i, 0 si elle a été ramassée. L’écran n’est qu’un **reflet** du tableau : on modifie les données, puis on redessine.',
      'À chaque appui sur A, on **cherche la première pièce** : une boucle, un `if`, un `break` — la recherche du chapitre 3, mais dans un tableau plutôt qu’à l’écran. On la met à 0.',
      'Puis on **compte** ce qui reste : une boucle, un compteur. Remarque qu’on ne tient pas un compteur à part qu’il faudrait penser à diminuer : on **recompte** dans le tableau, qui est la seule vérité — et seulement **quand une pièce est ramassée**. Le comptage apparaît deux fois dans le programme (au premier dessin, puis après chaque ramassage) : c’est exactement le genre de répétition que les **fonctions**, au chapitre suivant, feront disparaître.',
      'Le dessin complet se fait une fois, écran éteint. Ensuite, ramasser une pièce ne réécrit **qu’une case** : celle de la pièce. C’est la règle du VBlank — n’écrire que ce qui change.',
      '`avant` sert à détecter **le moment où A s’enfonce** — le « front ». Sans lui, tenir A une demi-seconde ramasserait trente pièces d’un coup : une par image. On agit seulement quand A est enfoncé **maintenant** et ne l’était **pas** à l’image d’avant.',
      '**À toi :** ramasse plutôt la **dernière** pièce (fais tourner la boucle de 9 vers 0).',
    ],
    code: `// CE PROGRAMME : une rangée de pièces O. Chaque appui sur A ramasse la
// première pièce qui reste (elle devient un point), et le compteur baisse.
//
// Ce qui est nouveau : CHERCHER une case dans un tableau, puis la CHANGER.
// Le tableau est la vérité du jeu ; l'écran ne fait que la montrer.

#include <ecran>    // éteint ou rallume l’écran
#include <texte>    // écrit un texte à l’écran
#include <nombre>   // écrit un nombre en chiffres
#include <bouton>   // lit un bouton de la manette

uint8_t pieces[10] = { 1, 0, 1, 1, 0, 1, 1, 1, 0, 1 };  // 10 cases : 1 = une pièce,
                                                        // 0 = rien. Il y a 7 pièces.

int main() {                            // Le jeu commence ici.
  // Le dessin complet, une fois, écran éteint.
  ecran(0);
  texte(1, 2, "A: RAMASSER");           // La consigne.
  texte(1, 11, "RESTE:");
  uint8_t reste = 0;                    // Combien de pièces restent.
  for (uint8_t i = 0; i < 10; i++) {    // Pour chaque case i (0 à 9) :
    if (pieces[i] == 1) {               //   une pièce ?
      texte(1 + i * 2, 7, "O");         //   on dessine un O (colonnes 1, 3, 5 ... 19),
      reste++;                          //   et on la compte.
    } else {                            //   pas de pièce :
      texte(1 + i * 2, 7, ".");         //   un point.
    }
  }
  nombre(8, 11, reste);                 // Affiche 007.
  ecran(1);                             // On rallume.

  uint8_t avant = 0;                    // A était-elle enfoncée à l'image d'avant ?

  while (true) {                        // La boucle du jeu :
    image();                            // une image.

    uint8_t maintenant = bouton(A);     // A enfoncée maintenant ? (1 ou 0)
    if (maintenant && !avant) {         // Enfoncée maintenant ET pas avant :
                                        // c'est le tout début de l'appui.
                                        // (Sinon, une pièce partirait à CHAQUE image
                                        //  tant que le doigt reste sur A.)
      // Chercher la première pièce.
      for (uint8_t i = 0; i < 10; i++) {  // On regarde les cases dans l'ordre :
        if (pieces[i] == 1) {           //   la première qui contient une pièce...
          pieces[i] = 0;            // ramassée : la case passe à 0 dans le tableau,
          texte(1 + i * 2, 7, ".");  // une seule case change à l'écran,
          break;                    // et on s'arrête : une seule pièce par appui.
        }
      }

      // Recompter dans le tableau.
      reste = 0;                        // On repart de 0...
      for (uint8_t i = 0; i < 10; i++) {
        if (pieces[i] == 1) reste++;    // ... et on ajoute 1 par pièce restante.
      }
      nombre(8, 11, reste);             // 006, puis 005, ... jusqu'à 000.
    }
    avant = maintenant;                 // On retient A pour l'image suivante.
  }
}
`,
    aVoir: 'Une rangée de O et de points ; chaque appui sur A change le premier O en point, et le compte descend.',
    controle: (c) => {
      const avant = c.mot(8, 11, 3)
      c.presser('a', 6)
      c.avancer(10)
      const un = c.mot(8, 11, 3)
      const premiere = c.mot(1, 7, 1)
      c.presser('a', 30)
      c.avancer(10)
      const deux = c.mot(8, 11, 3)
      return [
        ['au départ, 7 pièces', avant === '007'],
        ['un appui ramasse une pièce', un === '006'],
        ['c’est bien la première qui a disparu', premiere === '.'],
        ['tenir A longtemps n’en ramasse qu’une de plus', deux === '005', ` (${deux})`],
      ]
    },
  },

  {
    titre: 'Une grille : un tableau à deux dimensions',
    difficulte: 4,
    provenance: 'cours',
    idee: 'Une carte de jeu, c’est des lignes de cases : carte[ligne][colonne].',
    texte: [
      '`uint8_t carte[8][12]` est une **grille** de 8 lignes de 12 colonnes : 96 cases. On en désigne une avec **deux** indices : `carte[ligne][colonne]`. En mémoire, les lignes sont rangées **l’une après l’autre** ; le compilateur calcule `ligne × 12 + colonne` pour toi.',
      'On la **remplit** avec deux boucles imbriquées et une condition : une case est un mur si elle est **sur le bord** — première ou dernière ligne, **ou** première ou dernière colonne. Les `||` du chapitre 2 disent exactement cela.',
      'Puis on ajoute quelques murs à la main, et l’on **dessine** avec une seconde double boucle : un # pour 1, un point pour 0.',
      'Séparer **remplir** et **dessiner** est important : la grille est le **monde** du jeu, l’écran n’est qu’une **image** de ce monde. Pour savoir si un héros peut avancer, on demande à `carte[l][c]` — pas à l’écran. C’est ce que font les collisions de tous les jeux en grille : Zelda, Pokémon, Boulder Dash.',
      '**À toi :** ajoute une porte (un 0) au milieu du mur du bas.',
    ],
    code: `// CE PROGRAMME : une petite carte de 8 lignes sur 12 colonnes, rangée dans une
// GRILLE (un tableau à deux dimensions), puis dessinée avec des # et des points.
//
// Ce qui est nouveau : carte[8][12]
//   = 8 rangées de 12 cases. carte[l][c] = la case de la ligne l, colonne c.
//   l va de 0 à 7, c va de 0 à 11.

#include <ecran>    // éteint ou rallume l’écran
#include <texte>    // écrit un texte à l’écran
#include <nombre>   // écrit un nombre en chiffres

uint8_t carte[8][12];             // 8 × 12 = 96 cases. 1 = un mur, 0 = du sol.

int main() {                      // Le jeu commence ici.
  ecran(0);                       // Dessin écran éteint.
  // Remplir : les bords sont des murs.
  for (uint8_t l = 0; l < 8; l++) {         // chaque ligne l (0 à 7)
    for (uint8_t c = 0; c < 12; c++) {      //   chaque colonne c (0 à 11)
      if (l == 0 || l == 7 || c == 0 || c == 11) carte[l][c] = 1;
                                  //   première ou dernière ligne, OU première ou
                                  //   dernière colonne : c'est un bord → mur (1).
      else carte[l][c] = 0;       //   sinon : du sol (0).
    }
  }

  // Quelques murs à la main.
  carte[3][4] = 1;                // ligne 3, colonne 4
  carte[4][4] = 1;                // ligne 4, colonne 4
  carte[4][8] = 1;                // ligne 4, colonne 8

  // Dessiner, et compter les murs.
  uint8_t murs = 0;
  for (uint8_t l = 0; l < 8; l++) {
    for (uint8_t c = 0; c < 12; c++) {
      if (carte[l][c] == 1) {     // un mur ?
        texte(4 + c, 3 + l, "#"); //   un # ; « 4 + c » et « 3 + l » placent la carte
                                  //   à partir de la colonne 4, ligne 3 de l'écran.
        murs++;
      } else {                    // du sol :
        texte(4 + c, 3 + l, "."); //   un point.
      }
    }
  }

  texte(4, 13, "MURS:");
  nombre(10, 13, murs);           // Les bords : 12 + 12 + 6 + 6 = 36, plus 3 à la main = 39.

  ecran(1);                       // On rallume.

  while (true) {                  // La boucle du jeu.
    image();
  }
}
`,
    aVoir: 'Une salle fermée de 12 × 8, trois murs à l’intérieur, et 039 murs comptés.',
    controle: (c) => [
      ['le mur du haut est plein', c.mot(4, 3, 12) === '#'.repeat(12)],
      ['une ligne du milieu : bord, sol, bord', c.mot(4, 4, 12) === '#' + '.'.repeat(10) + '#'],
      ['les murs posés à la main sont là', c.mot(4, 7, 12) === '#...#...#..#'],
      ['36 de bord et 3 dedans : 39', c.mot(10, 13, 3) === '039'],
    ],
  },

  /* ================================================ 5 — les fonctions */

  {
    titre: 'Une fonction : donner un nom à un geste',
    difficulte: 5,
    provenance: 'cours',
    idee: 'Quand un bloc de code fait UNE chose, on lui donne un nom, et main() se lit comme une histoire.',
    texte: [
      'Une **fonction** est un bloc de code qui porte un nom. `void cadre() { … }` le **définit** : rien ne s’exécute encore. `cadre();` l’**appelle** : la console saute dans la fonction, exécute son bloc, puis **revient** juste après l’appel.',
      '`void` veut dire « ne rend rien » : la fonction **fait** quelque chose, elle ne **calcule** pas de réponse (ce sera la leçon d’après).',
      'Regarde `main()` : trois lignes qui disent **ce que** fait le programme, sans dire **comment**. Le « comment » est rangé dans les fonctions. C’est la première raison d’exister des fonctions : **la lisibilité**.',
      'La seconde : **ne pas répéter**. `cadre()` est appelée deux fois, avec un effacement entre les deux ; son code n’est écrit qu’une fois. Corriger un bogue dedans le corrige partout.',
      '`appels` est une variable **globale** — déclarée hors de toute fonction : `main` et `cadre` la voient toutes les deux. Chaque appel l’augmente : on **voit** combien de fois on est passé dans la fonction.',
      '**À toi :** écris une fonction `titre()` qui écrit le nom de ton jeu au milieu, et appelle-la après `cadre()`.',
    ],
    code: `// CE PROGRAMME : dessine un cadre, efface l'écran, redessine le cadre,
// et affiche combien de fois on a dessiné le cadre.
//
// Ce qui est nouveau : la FONCTION. On donne un nom à un groupe d'instructions,
// puis on l'« appelle » par son nom, autant de fois qu'on veut.
//   void cadre() ...   = on DÉFINIT la fonction cadre.
//                        void = « rien » : elle ne rend pas de résultat.
//                        () vides = on ne lui donne rien.
//   cadre();           = on l'APPELLE : ses instructions s'exécutent.

#include <texte>    // écrit un texte à l’écran
#include <ecran>    // éteint ou rallume l’écran
#include <nombre>   // écrit un nombre en chiffres

uint8_t appels = 0;               // Combien de fois cadre() a été appelée.
                                  // Déclarée hors des fonctions : toutes la voient.

void cadre() {                    // DÉFINITION de cadre : dessine un bord de # tout autour.
  for (uint8_t i = 0; i < 20; i++) {  // Les 20 colonnes :
    texte(i, 0, "#");             //   en haut (ligne 0)
    texte(i, 17, "#");            //   et en bas (ligne 17).
  }
  for (uint8_t l = 1; l < 17; l++) {  // Les lignes 1 à 16 :
    texte(0, l, "#");             //   à gauche (colonne 0)
    texte(19, l, "#");            //   et à droite (colonne 19).
  }
  appels++;                       // Un appel de plus.
}                                 // Fin de cadre : on retourne là où on l'a appelée.

void toutEffacer() {              // DÉFINITION de toutEffacer : vide tout l'écran.
  for (uint8_t l = 0; l < 18; l++) {    // Chaque ligne 0 à 17...
    texte(0, l, "                    ");  // ... est recouverte de 20 espaces.
  }
}

int main() {                      // Le jeu commence ici (pas dans cadre !).
  ecran(0);                       // Dessin écran éteint.
  cadre();                        // 1er appel : le cadre est dessiné. appels = 1.
  toutEffacer();                  // Tout est effacé.
  cadre();                        // 2e appel : le cadre revient. appels = 2.

  texte(4, 8, "APPELS:");
  nombre(12, 8, appels);          // Affiche 002.

  ecran(1);                       // On rallume.

  while (true) {                  // La boucle du jeu.
    image();
  }
}
`,
    aVoir: 'Un cadre de # tout autour de l’écran, et « APPELS: 002 » au milieu.',
    controle: (c) => [
      ['le bord du haut est dessiné', c.mot(0, 0, 20) === '#'.repeat(20)],
      ['le bord du bas aussi', c.mot(0, 17, 20) === '#'.repeat(20)],
      ['les côtés', c.mot(0, 5, 1) === '#' && c.mot(19, 5, 1) === '#'],
      ['la fonction a été appelée deux fois', c.mot(12, 8, 3) === '002'],
    ],
  },

  {
    titre: 'Des arguments : le même geste, ailleurs',
    difficulte: 5,
    provenance: 'cours',
    idee: 'Une fonction qui dessine UNE boîte n’a servi qu’une fois ; avec des arguments, elle en dessine autant qu’on veut.',
    texte: [
      'Les **paramètres** sont des variables qui reçoivent leur valeur **à l’appel** : `void boite(uint8_t x, uint8_t y, uint8_t largeur, uint8_t hauteur)`. Dans `boite(1, 1, 8, 4)`, x reçoit 1, y 1, largeur 8, hauteur 4 — **dans l’ordre**.',
      'Les valeurs données à l’appel s’appellent les **arguments**. Ce peuvent être des nombres, des variables, des calculs : `boite(2 + 9, 1, …)` marche aussi.',
      'Dans la fonction, les paramètres sont des variables **locales** : ils n’existent que pendant l’appel, et un `x` ici n’a rien à voir avec un `x` de `main`.',
      'Le corps mélange tout ce qu’on sait : une double boucle sur la surface, et une condition qui décide si la case est **au bord** (#) ou **dedans** (espace). C’est la grille de la leçon précédente — rendue **réutilisable**.',
      'Quatre boîtes, **une** seule définition. Un menu, une fenêtre de dialogue, un inventaire : toutes les interfaces de jeu sont faites d’un geste répété avec d’autres arguments.',
      '**À toi :** ajoute un cinquième argument, le caractère à écrire au milieu de la boîte.',
    ],
    code: `// CE PROGRAMME : dessine quatre boîtes de tailles différentes avec UNE fonction.
//
// Ce qui est nouveau : les ARGUMENTS (ou « paramètres »).
// On donne des valeurs à la fonction entre les parenthèses ; elle fait le même
// geste, mais à un autre endroit, avec une autre taille.
//   void boite(uint8_t x, uint8_t y, uint8_t largeur, uint8_t hauteur)
//   → boite(1, 1, 8, 4) : x = 1, y = 1, largeur = 8, hauteur = 4.

#include <texte>   // écrit un texte à l’écran
#include <ecran>   // éteint ou rallume l’écran

void boite(uint8_t x, uint8_t y, uint8_t largeur, uint8_t hauteur) {
                                      // x, y = le coin en haut à gauche de la boîte.
  for (uint8_t l = 0; l < hauteur; l++) {       // chaque ligne l de la boîte
    for (uint8_t c = 0; c < largeur; c++) {     //   chaque colonne c de la boîte
      uint8_t bord = l == 0 || l == hauteur - 1 || c == 0 || c == largeur - 1;
                                      // 1 si la case est sur le bord : première ligne,
                                      // dernière ligne (hauteur - 1), première colonne
                                      // ou dernière colonne (largeur - 1).
      if (bord) texte(x + c, y + l, "#");  // le bord : un #
      else texte(x + c, y + l, " ");       // l'intérieur : un espace (la boîte est vide)
    }
  }
}

int main() {                          // Le jeu commence ici.
  ecran(0);                           // Dessin écran éteint.
  boite(1, 1, 8, 4);                  // en (1, 1), 8 de large, 4 de haut
  boite(11, 1, 8, 6);                 // en (11, 1), 8 de large, 6 de haut
  boite(1, 8, 18, 3);                 // une longue boîte plate
  boite(6, 12, 8, 5);                 // la boîte du menu

  texte(8, 14, "MENU");               // Un mot au milieu de la dernière boîte.

  ecran(1);                           // On rallume.

  while (true) {                      // La boucle du jeu.
    image();
  }
}
`,
    aVoir: 'Quatre boîtes de tailles différentes, et « MENU » dans la dernière.',
    controle: (c) => [
      ['la première boîte : 8 de large', c.mot(1, 1, 8) === '########' && c.mot(1, 2, 8) === '#      #'],
      ['la deuxième : 6 de haut', c.mot(11, 6, 8) === '########' && c.mot(11, 5, 8) === '#      #'],
      ['la troisième : 18 de large', c.mot(1, 8, 18) === '#'.repeat(18)],
      ['la dernière entoure MENU', c.mot(6, 14, 8) === '# MENU #'],
    ],
  },

  {
    titre: 'Une valeur de retour : la fonction qui répond',
    difficulte: 5,
    provenance: 'cours',
    idee: 'Certaines fonctions font ; d’autres calculent, et « return » rapporte le résultat.',
    texte: [
      'Remplace `void` par un type — `uint8_t` — et la fonction **rend une valeur**. `return valeur;` fait deux choses : il **termine** la fonction tout de suite, et **rapporte** la valeur à l’endroit de l’appel. `plusGrand(3, 8)` **devient** 8, comme si on l’avait écrit.',
      'On peut donc mettre un appel **partout où un nombre est permis** : dans un calcul, dans un `nombre()`, dans un `if`, dans un autre appel.',
      '`limiter(x, 2, 17)` rend x **ramené entre 2 et 17**. Il y a deux `return` : le premier qui s’exécute termine la fonction, les lignes d’après ne sont pas lues. C’est un style courant : **traiter les cas particuliers d’abord**, et sortir.',
      '`dansLaZone(x)` rend 1 ou 0 : c’est une **question**, et son nom le dit. `if (dansLaZone(x))` se lit comme une phrase. Tout ce qu’on écrivait en ligne au chapitre 2 peut ainsi prendre un nom.',
      'Dans le jeu, `x` avance **sans garde** : c’est `limiter` qui empêche de sortir. La règle est écrite **une fois**, à un seul endroit.',
      '**À toi :** écris `uint8_t plusPetit(uint8_t a, uint8_t b)` et affiche `plusPetit(3, 8)`.',
    ],
    code: `// CE PROGRAMME : un # bouge avec GAUCHE et DROITE, sans sortir des colonnes 2 à 17 ;
// ZONE s'affiche quand il est entre les colonnes 8 et 12.
//
// Ce qui est nouveau : une fonction qui RÉPOND (une « valeur de retour »).
//   uint8_t plusGrand(...) : le mot devant le nom (uint8_t) dit ce qu'elle rend.
//   return a;  = « la réponse est a » ; la fonction s'arrête tout de suite.

#include <texte>    // écrit un texte à l’écran
#include <nombre>   // écrit un nombre en chiffres
#include <bouton>   // lit un bouton de la manette

uint8_t plusGrand(uint8_t a, uint8_t b) {   // Rend le plus grand de a et b.
  if (a > b) return a;                      // a est plus grand : on rend a (et on s'arrête).
  return b;                                 // Sinon, on arrive ici : on rend b.
}                                           // plusGrand(3, 8) → 3 > 8 est faux → rend 8.

uint8_t limiter(uint8_t v, uint8_t mini, uint8_t maxi) {  // Garde v entre mini et maxi.
  if (v < mini) return mini;                // Trop petit : on rend mini.
  if (v > maxi) return maxi;                // Trop grand : on rend maxi.
  return v;                                 // Entre les deux : v ne change pas.
}                                           // limiter(20, 2, 17) → 17 ; limiter(1, 2, 17) → 2.

uint8_t dansLaZone(uint8_t x) {             // Rend 1 si x est entre 8 et 12, sinon 0.
  return x >= 8 && x <= 12;                 // La comparaison elle-même est la réponse.
}

int main() {                                // Le jeu commence ici.
  texte(1, 1, "PLUS GRAND 3 8:");
  nombre(17, 1, plusGrand(3, 8));           // La réponse de la fonction s'affiche : 008.

  uint8_t x = 5;                            // La colonne du #.
  uint8_t ancien = 0;                       // Où il était dessiné avant.

  while (true) {                            // La boucle du jeu :
    image();                                // une image.

    if (bouton(DROITE)) x++;                // DROITE tenue : un pas à droite.
    if (bouton(GAUCHE)) x--;                // GAUCHE tenue : un pas à gauche.
    x = limiter(x, 2, 17);                  // On range dans x la réponse de limiter :
                                            // x reste entre 2 et 17.

    if (x != ancien) {                      // Le # a bougé ?
      texte(ancien, 9, " ");                //   efface l'ancien,
      texte(x, 9, "#");                     //   dessine le nouveau,
      nombre(1, 5, x);                      //   affiche la colonne.

      if (dansLaZone(x)) texte(6, 5, "ZONE");  // La réponse sert de condition : 1 ou 0.
      else texte(6, 5, "    ");                // 4 espaces pour effacer ZONE.

      ancien = x;                           // On retient la place.
    }
  }
}
`,
    aVoir: '« PLUS GRAND 3 8: 008 », et un # que GAUCHE et DROITE déplacent sans qu’il sorte de 2..17.',
    controle: (c) => {
      tenir(c, 'right', () => false, 300)
      const droite = c.variable('x')
      tenir(c, 'left', () => false, 300)
      const gauche = c.variable('x')
      tenir(c, 'right', () => c.variable('x') >= 9)
      return [
        ['plusGrand(3, 8) vaut 8', c.mot(17, 1, 3) === '008'],
        ['limiter l’arrête à 17 à droite', droite === 17, ` (x = ${droite})`],
        ['et à 2 à gauche, sans passer par 255', gauche === 2, ` (x = ${gauche})`],
        ['dansLaZone répond', c.mot(6, 5, 4) === 'ZONE', ` (x = ${c.variable('x')})`],
      ]
    },
  },

  {
    titre: 'Découper la boucle du jeu en fonctions',
    difficulte: 5,
    provenance: 'cours',
    idee: 'lire, faire évoluer, dessiner : la boucle du jeu tient en trois appels.',
    texte: [
      'Un vrai jeu a des centaines de lignes dans sa boucle. Les ranger dans des fonctions aux noms clairs rend `main` **lisible d’un coup d’œil** : `lireTouches(); evoluer(); dessiner();` — la boucle du chapitre 3, écrite en français.',
      'Les fonctions partagent l’**état du jeu** : `energie` est **globale**, elle survit d’une image à l’autre et toutes les fonctions la voient. Chaque fonction a **un seul rôle** : `lireTouches` ne dessine pas, `dessiner` ne change pas l’énergie.',
      '`jauge(ligne, valeur)` est une fonction **avec une boucle**, appelée **dans la boucle** du jeu : elle écrit `valeur` # puis complète avec des espaces jusqu’à 10 — sinon, quand l’énergie baisse, les anciens # resteraient à l’écran.',
      '`dessiner` ne fait rien si l’énergie n’a pas changé depuis le dernier dessin : `affichee` retient la valeur montrée. Sans ce test, la jauge serait réécrite à chaque image — onze écritures pour rien, chacune attendant sa pause (chapitre 3) : du temps que le jeu passerait à attendre au lieu de jouer.',
      '`evoluer` fait baisser l’énergie d’un point tous les 20 tours : un compteur, une remise à zéro — la montre du chapitre 3. Et la garde `energie > 0` évite le 255 du chapitre 1. Tous les chapitres se retrouvent ici.',
      '**À toi :** ajoute une seconde jauge, pour la magie, qui remonte toute seule.',
    ],
    code: `// CE PROGRAMME : une jauge d'énergie qui se vide toute seule ; A la recharge.
//
// Ce qui est nouveau : découper la boucle du jeu en fonctions.
// Chaque image, un jeu fait toujours les trois mêmes choses, dans cet ordre :
//   1. lireTouches() : ce que le joueur demande
//   2. evoluer()     : le monde avance (temps, règles)
//   3. dessiner()    : l'écran montre le nouvel état

#include <texte>    // écrit un texte à l’écran
#include <bouton>   // lit un bouton de la manette
#include <nombre>   // écrit un nombre en chiffres

uint8_t energie = 10;        // L'énergie, de 0 à 10.
uint8_t affichee = 255;      // rien n'est encore dessiné (255 : aucune énergie ne vaut ça)
uint8_t minuteur = 0;        // Compte les images jusqu'à 20.

void jauge(uint8_t ligne, uint8_t valeur) {   // Dessine « valeur » # sur 10 cases.
  for (uint8_t i = 0; i < 10; i++) {          // les 10 cases, colonnes 8 à 17
    if (i < valeur) texte(8 + i, ligne, "#"); // avant la valeur : plein
    else texte(8 + i, ligne, " ");            // après : vide
  }
}                                             // jauge(5, 3) → ###       (3 pleins, 7 vides)

void lireTouches() {
  if (bouton(A)) energie = 10;       // on recharge
}

void evoluer() {
  minuteur++;                        // Une image de plus.
  if (minuteur == 20) {              // Toutes les 20 images (1/3 de seconde) :
    minuteur = 0;                    //   on recommence à compter,
    if (energie > 0) energie--;      //   et l'énergie perd 1, sans passer sous 0.
  }
}

void dessiner() {
  if (energie == affichee) return;   // rien n'a changé : on sort tout de suite.
                                     // (return dans une fonction void = « c'est fini ».)
  jauge(5, energie);                 // Redessine la jauge sur la ligne 5,
  nombre(1, 5, energie);             // et le nombre à gauche.
  affichee = energie;                // On retient ce qui est à l'écran.
}

int main() {                         // Le jeu commence ici.
  texte(1, 2, "A: RECHARGER");       // La consigne.

  while (true) {                     // La boucle du jeu, maintenant très courte :
    image();                         //   attendre l'image,
    lireTouches();                   //   1. les touches,
    evoluer();                       //   2. le monde,
    dessiner();                      //   3. l'écran.
  }
}
`,
    aVoir: 'Une jauge de dix # qui fond toute seule ; A la remplit de nouveau.',
    controle: (c) => {
      attendre(c, () => c.variable('energie') <= 7)
      c.avancer(14)                               // le temps d'écrire la jauge
      const bas = c.variable('affichee')
      const barre = net(c.mot(8, 5, 10)).length
      attendre(c, () => c.variable('energie') === 0)
      c.avancer(200)
      const vide = c.variable('energie')
      c.presser('a', 3)
      return [
        ['l’énergie baisse avec le temps', bas < 10, ` (${bas})`],
        ['la jauge montre autant de # que d’énergie', barre === bas, ` (${barre} #)`],
        ['elle s’arrête à 0 sans déborder', vide === 0, ` (${vide})`],
        ['A la recharge', c.variable('energie') >= 9, ` (${c.variable('energie')})`],
      ]
    },
  },

  /* ================================================ 6 — les struct */

  {
    titre: 'Une struct : ce qui va ensemble',
    difficulte: 6,
    provenance: 'cours',
    idee: 'La position, la direction et les vies d’un héros ne sont pas trois choses : c’est UN héros.',
    texte: [
      '`struct Heros { uint8_t x; uint8_t y; uint8_t vies; };` **invente un type**. Il ne réserve rien : c’est un **plan**. `Heros joueur;` construit une variable de ce type — trois octets qui se suivent.',
      'On atteint chaque **champ** avec un point : `joueur.x`, `joueur.vies`. Ce sont des variables ordinaires : `joueur.x++`, `if (joueur.y > 2)`, tout marche.',
      'Pourquoi pas trois variables `herosX`, `herosY`, `herosVies` ? Pour un héros, ce serait pareil. Mais dès qu’il y en a **deux** — un second joueur, un ennemi — les noms se multiplient, et rien ne dit plus que `herosX` et `herosVies` parlent de la même chose. La `struct` le **dit** : c’est le code qui porte le sens.',
      'Ici, le héros se déplace dans les quatre directions, en gardant sa position d’avant pour **effacer** l’ancienne case — et seulement s’il a bougé (la règle du VBlank). Un déplacement ne se fait qu’un tour sur quatre, grâce au compteur `attente` — sinon il traverserait l’écran en un tiers de seconde.',
      '**À toi :** ajoute un champ `pas` (le nombre de pas faits), augmente-le à chaque déplacement, et affiche-le.',
    ],
    code: `// CE PROGRAMME : un héros # qui se déplace avec les 4 flèches.
// Sa position et ses vies sont rangées ENSEMBLE, dans une struct.
//
// Ce qui est nouveau : la STRUCT.
//   struct Heros ... ;  = on invente un nouveau type, « Heros »,
//                         qui contient plusieurs cases (x, y, vies).
//   Heros joueur;       = on crée une variable de ce type.
//   joueur.x            = la case x DE joueur (le point veut dire « de »).

#include <texte>    // écrit un texte à l’écran
#include <nombre>   // écrit un nombre en chiffres
#include <bouton>   // lit un bouton de la manette

struct Heros {                  // Le modèle d'un héros :
  uint8_t x;                    //   sa colonne,
  uint8_t y;                    //   sa ligne,
  uint8_t vies;                 //   ses vies.
};                              // (Le point-virgule après l'accolade est obligatoire.)

Heros joueur;                   // UN héros, nommé joueur.

int main() {                    // Le jeu commence ici.
  joueur.x = 9;                 // On remplit ses cases.
  joueur.y = 9;
  joueur.vies = 3;

  texte(1, 1, "VIES:");
  nombre(7, 1, joueur.vies, 1); // Affiche 3.
  texte(joueur.x, joueur.y, "#");  // Dessine le héros en (9, 9).

  uint8_t attente = 0;          // Pour ralentir : on ne bouge qu'une image sur 4.

  while (true) {                // La boucle du jeu :
    image();

    attente++;
    if (attente < 4) continue;      // un tour sur quatre : sinon on saute la suite du tour
    attente = 0;

    uint8_t ancienX = joueur.x; // On retient la place d'avant...
    uint8_t ancienY = joueur.y;

    // ... puis on bouge, sans sortir de l'écran :
    if (bouton(DROITE) && joueur.x < 19) joueur.x++;  // droite, pas plus loin que 19
    if (bouton(GAUCHE) && joueur.x > 0)  joueur.x--;  // gauche, pas moins que 0
    if (bouton(BAS) && joueur.y < 17)    joueur.y++;  // bas : y grandit vers le bas
    if (bouton(HAUT) && joueur.y > 3)    joueur.y--;  // haut, pas au-dessus de la ligne 3
                                                      // (les lignes 0 à 2 sont pour VIES)

    if (joueur.x != ancienX || joueur.y != ancienY) { // A-t-il bougé ?
      texte(ancienX, ancienY, " ");                   //   efface l'ancienne place,
      texte(joueur.x, joueur.y, "#");                 //   dessine la nouvelle.
    }
  }
}
`,
    aVoir: 'Un # au milieu de l’écran, que les quatre flèches promènent, et « VIES: 3 » en haut.',
    controle: (c) => {
      const x0 = c.variable('joueur') // le premier champ : x
      tenir(c, 'right', () => c.variable('joueur') >= 13)
      c.presser('down', 30)
      c.avancer(10)
      const ecran = []
      for (let l = 3; l < 18; l++) for (let col = 0; col < 20; col++) if (c.mot(col, l, 1) === '#') ecran.push([col, l])
      return [
        ['les vies sont affichées', c.mot(7, 1, 1) === '3'],
        ['le héros part de x = 9', x0 === 9],
        ['un seul # à l’écran : l’ancienne case est effacée', ecran.length === 1, ` (${ecran.length})`],
        ['il s’est déplacé vers la droite et vers le bas',
          ecran.length === 1 && ecran[0][0] > 9 && ecran[0][1] > 9, ecran.length ? ` (${ecran[0].join(', ')})` : ''],
      ]
    },
  },

  {
    titre: 'Un tableau de struct, parcouru par une boucle',
    difficulte: 6,
    provenance: 'cours',
    idee: 'Quatre ennemis, un tableau, une boucle : le code d’un seul, appliqué à tous.',
    texte: [
      '`Ennemi troupe[4];` : un **tableau** dont chaque case est une **struct**. On écrit `troupe[i].x` — **d’abord** la case, **puis** le champ.',
      'Le code d’**un** ennemi est écrit **une** fois, dans une boucle `for` sur `i`. Qu’il y ait 4 ennemis ou 40, le code est le même : on change `COMBIEN`, c’est tout. C’est là que tout le cours se rejoint — variables, conditions, boucles, tableaux et struct dans le même bloc.',
      'Chaque ennemi a son **sens** : 1 vers la droite, 0 vers la gauche. Quand il touche un bord, on **retourne** son sens. Deux `if` pour avancer, deux pour faire demi-tour.',
      'Les ennemis ne bougent qu’**une image sur huit** — une seule condition autour de toute la boucle suffit. Et chacun est initialisé par une **boucle aussi** : sa ligne et sa colonne de départ se **calculent** à partir de `i`.',
      '**À toi :** donne à chaque ennemi sa propre vitesse — un champ `lenteur`, et `images() % troupe[i].lenteur`.',
    ],
    code: `// CE PROGRAMME : quatre ennemis X font des allers-retours sur l'écran.
//
// Ce qui est nouveau : un TABLEAU de struct.
//   Ennemi troupe[4]   = 4 ennemis ; chacun a son x, son y et son sens.
//   troupe[i].x        = la case x de l'ennemi numéro i.
// Une seule boucle for s'occupe de tous les ennemis.

#include <texte>   // écrit un texte à l’écran

const uint8_t COMBIEN = 4;      // Le nombre d'ennemis. const : il ne change jamais.

struct Ennemi {                 // Le modèle d'un ennemi :
  uint8_t x;                    //   sa colonne,
  uint8_t y;                    //   sa ligne,
  uint8_t sens;       // 1 : vers la droite, 0 : vers la gauche
};

Ennemi troupe[COMBIEN];         // 4 ennemis : troupe[0] à troupe[3].

int main() {                    // Le jeu commence ici.
  for (uint8_t i = 0; i < COMBIEN; i++) {  // Pour chaque ennemi i (0 à 3) :
    troupe[i].x = 2 + i * 4;    //   colonne 2, 6, 10, 14
    troupe[i].y = 4 + i * 3;    //   ligne   4, 7, 10, 13
    troupe[i].sens = i % 2;     //   reste par 2 : 0, 1, 0, 1 (un sur deux part à droite)
  }

  while (true) {                // La boucle du jeu :
    image();
    if (images() % 8 != 0) continue;    // une image sur huit (sinon, on saute la suite)

    for (uint8_t i = 0; i < COMBIEN; i++) {   // Pour chaque ennemi :
      texte(troupe[i].x, troupe[i].y, " ");   //   efface-le à sa place actuelle,

      if (troupe[i].sens == 1) troupe[i].x++; //   avance dans son sens,
      else troupe[i].x--;

      if (troupe[i].x == 19) troupe[i].sens = 0;  // au bord droit : repart à gauche,
      if (troupe[i].x == 0)  troupe[i].sens = 1;  // au bord gauche : repart à droite,

      texte(troupe[i].x, troupe[i].y, "X");   //   dessine-le à sa nouvelle place.
    }
  }
}
`,
    aVoir: 'Quatre X sur quatre lignes, qui vont et viennent d’un bord à l’autre, chacun dans son sens.',
    controle: (c) => {
      const vu = observerLaTroupe(c, [4, 7, 10, 13])
      return [
        ['jamais deux X sur une ligne : l’ancienne case est effacée', vu.jamaisDeux],
        ['chacun a parcouru plusieurs cases', vu.parcours.every((n) => n >= 5), ` (${vu.parcours.join(', ')} cases)`],
        ['chacun a touché un bord, et a fait demi-tour', vu.demiTour.every(Boolean)],
      ]
    },
  },

  {
    titre: 'Une méthode : la fonction qui connaît son objet',
    difficulte: 6,
    provenance: 'cours',
    idee: 'Ce que fait un ennemi peut s’écrire DANS l’ennemi : troupe[i].avancer().',
    texte: [
      'Une `struct` peut porter des **fonctions** : on les appelle des **méthodes**. Elles s’écrivent **dans** les accolades de la struct, et s’appellent avec un point : `troupe[i].avancer();`.',
      'Dans une méthode, les champs s’écrivent **sous leur nom nu** : `x++`, et non `troupe[i].x++`. La méthode travaille sur **l’objet placé devant le point**. Le code se raccourcit, et surtout il dit **à qui** appartient chaque geste.',
      'Compare avec la leçon précédente : la boucle du jeu devient **trois lignes** — effacer, avancer, dessiner. Tout le détail du mouvement est rangé dans `avancer()`, là où on le cherchera.',
      'Une méthode peut en appeler une autre de **son** objet : `avancer()` appelle `auBord()` sans rien devant — ça veut dire « le mien ».',
      'Sur cette console, une méthode n’a **pas d’arguments** : elle reçoit déjà son objet. Ce qui vient d’ailleurs se passe par une fonction ordinaire.',
      '**À toi :** ajoute une méthode `dessiner()` qui écrit le X, et une `effacer()`.',
    ],
    code: `// CE PROGRAMME : quatre ennemis X font des allers-retours ; cette fois, c'est
// l'ennemi LUI-MÊME qui sait avancer et faire demi-tour.
//
// Ce qui est nouveau : la MÉTHODE, une fonction rangée DANS la struct.
//   Dedans, x, y et sens sont ceux de l'ennemi sur qui on l'appelle.
//   troupe[2].avancer();  → fait avancer l'ennemi numéro 2, et lui seul.

#include <texte>   // écrit un texte à l’écran

const uint8_t COMBIEN = 4;      // Le nombre d'ennemis.

struct Ennemi {                 // Le modèle d'un ennemi :
  uint8_t x;                    //   sa colonne,
  uint8_t y;                    //   sa ligne,
  uint8_t sens;                 //   1 = vers la droite, 0 = vers la gauche.

  uint8_t auBord() {            // Méthode : rend 1 si CET ennemi touche un bord.
    return x == 0 || x == 19;   //   colonne 0 OU colonne 19.
  }

  void avancer() {              // Méthode : un pas dans son sens.
    if (sens == 1) x++;         //   vers la droite,
    else x--;                   //   ou vers la gauche.
    if (auBord()) sens = !sens;     // demi-tour : « !sens » change 1 en 0 et 0 en 1.
  }
};

Ennemi troupe[COMBIEN];         // 4 ennemis : troupe[0] à troupe[3].

int main() {                    // Le jeu commence ici.
  for (uint8_t i = 0; i < COMBIEN; i++) {  // Pour chaque ennemi i :
    troupe[i].x = 2 + i * 4;    //   colonne 2, 6, 10, 14
    troupe[i].y = 4 + i * 3;    //   ligne   4, 7, 10, 13
    troupe[i].sens = 1;         //   tous partent vers la droite.
  }

  while (true) {                // La boucle du jeu :
    image();
    if (images() % 8 != 0) continue;   // on ne bouge qu'une image sur huit.

    for (uint8_t i = 0; i < COMBIEN; i++) {
      texte(troupe[i].x, troupe[i].y, " ");  // efface l'ennemi,
      troupe[i].avancer();                   // lui demande d'avancer (sa méthode),
      texte(troupe[i].x, troupe[i].y, "X");  // le redessine.
    }
  }
}
`,
    aVoir: 'La même troupe de quatre X qui va et vient — le code du mouvement est rangé dans l’ennemi.',
    controle: (c) => {
      const vu = observerLaTroupe(c, [4, 7, 10, 13])
      return [
        ['jamais deux X sur une ligne : l’ancienne case est effacée', vu.jamaisDeux],
        ['chacun a parcouru plusieurs cases', vu.parcours.every((n) => n >= 5), ` (${vu.parcours.join(', ')} cases)`],
        ['chacun a touché un bord, et a fait demi-tour', vu.demiTour.every(Boolean)],
      ]
    },
  },

  {
    titre: 'Le petit jeu : tout ensemble',
    difficulte: 6,
    provenance: 'cours',
    idee: 'Variables, conditions, boucles, tableaux, fonctions, struct : un vrai jeu, et rien d’autre.',
    texte: [
      'Des objets tombent du ciel ; le panier (`|#|`) les attrape. Chaque objet attrapé rapporte un point ; chaque objet manqué coûte une vie. Toutes les notions du cours y sont, **à leur place** :',
      '**Variables** : `score`, `vies`, la position du panier. **Conditions** : attrapé ou manqué ? partie finie ? **Boucles** : la boucle du jeu, et un `for` sur les objets. **Tableau de struct** : les trois `Chute`. **Fonctions** : `lancer`, `attrape`, `dessinerPanier`, `dessinerScore`. **Méthode** : `tomber()`. **VBlank** : le décor posé écran éteint, et chaque image n’écrit que ce qui a changé.',
      'Un objet n’est jamais créé ni détruit : il est **recyclé**. Quand il arrive en bas, `lancer(i)` le renvoie en haut, à une colonne tirée au hasard. C’est la technique de presque tous les jeux Game Boy : **un nombre fixe de places**, qu’on réutilise.',
      '`attrape(i)` est une fonction qui **répond** : l’objet est-il sur la ligne du panier, **et** entre ses deux bords ? Sa condition se lit comme la règle du jeu.',
      'Le panier se redessine **seulement s’il a bougé**, le score **seulement quand il change**, et les objets **un tour sur huit** : c’est ce qui permet au panier de rester vif pendant que la pluie tombe.',
      'Quand `vies` tombe à 0, on sort de la boucle du jeu par `break`, et le programme continue : « PERDU! ». Le `while (true)` de la fin garde l’écran affiché.',
      '**À toi :** accélère la chute quand le score augmente (indice : remplace le 8 de `attente == 8` par une variable qui diminue).',
    ],
    code: `// CE PROGRAMME : LE PETIT JEU. Des gouttes O tombent ; un panier |#| en bas
// les attrape. Chaque goutte attrapée = 1 point ; chaque goutte ratée = 1 vie en moins.
// À 0 vie : PERDU!
//
// Tout ce qu'on a vu sert ici : variables, conditions, boucles, tableaux,
// fonctions et struct.

#include <hasard>   // tire un nombre au hasard
#include <texte>    // écrit un texte à l’écran
#include <nombre>   // écrit un nombre en chiffres
#include <ecran>    // éteint ou rallume l’écran
#include <bouton>   // lit un bouton de la manette
#include <reste>    // a % b, sauf par 1, 2, 4, 8, 16… écrits en clair

const uint8_t COMBIEN = 3;      // 3 gouttes à la fois.
const uint8_t SOL = 16;         // La ligne du panier.

struct Chute {                  // Une goutte :
  uint8_t x;                    //   sa colonne,
  uint8_t y;                    //   sa ligne.

  void tomber() { y++; }        //   Méthode : descendre d'une ligne (y grandit vers le bas).
};

Chute pluie[COMBIEN];           // Les 3 gouttes.
uint8_t panier = 8;             // La colonne de la gauche du panier (il fait 3 cases).
uint8_t ancienPanier = 8;       // Où le panier est dessiné.
uint8_t score = 0;
uint8_t vies = 3;

void lancer(uint8_t i) {        // (Re)met la goutte i en haut, à une colonne au hasard.
  pluie[i].x = 1 + hasard() % 18;   // hasard() % 18 : 0 à 17 ; + 1 : colonnes 1 à 18.
  pluie[i].y = 2;                   // Elle repart de la ligne 2.
}

uint8_t attrape(uint8_t i) {    // Rend 1 si la goutte i tombe DANS le panier.
  return pluie[i].y == SOL && pluie[i].x >= panier && pluie[i].x <= panier + 2;
                                // Elle est à la ligne du panier ET dans ses 3 colonnes :
                                // panier, panier + 1 ou panier + 2.
                                // Exemple : panier = 8 → colonnes 8, 9, 10.
}

void dessinerPanier() {         // Déplace le panier à l'écran.
  texte(ancienPanier, SOL, "   ");  // 3 espaces : efface l'ancien panier,
  texte(panier, SOL, "|#|");        // dessine le nouveau,
  ancienPanier = panier;            // et retient où il est.
}

void dessinerScore() {          // Réécrit le score et les vies en haut.
  nombre(7, 0, score);
  nombre(18, 0, vies, 1);
}

int main() {                    // Le jeu commence ici.
  ecran(0);                     // Préparation, écran éteint :
  texte(0, 0, "SCORE:");
  texte(12, 0, "VIES:");
  texte(0, 17, "GAUCHE    DROITE");
  for (uint8_t i = 0; i < COMBIEN; i++) {
    lancer(i);                  //   chaque goutte à une colonne au hasard,
    pluie[i].y = 2 + i * 4;     //   mais à des hauteurs différentes : 2, 6, 10
  }                             //   (pour qu'elles n'arrivent pas toutes ensemble).
  dessinerPanier();
  dessinerScore();
  ecran(1);                     // On rallume : le jeu commence.

  uint8_t attente = 0;          // Pour ralentir la pluie.

  while (true) {                // La boucle du jeu :
    image();

    // Le joueur : à chaque image (le panier est rapide).
    if (bouton(DROITE) && panier < 17) panier++;  // 17 + 2 = 19 : le bord droit.
    if (bouton(GAUCHE) && panier > 0) panier--;
    if (panier != ancienPanier) dessinerPanier(); // Ne redessine que s'il a bougé.

    // La pluie : un tour sur huit (elle est lente).
    attente++;
    if (attente < 8) continue;  // Pas encore 8 images : on saute la suite du tour.
    attente = 0;

    for (uint8_t i = 0; i < COMBIEN; i++) {   // Pour chaque goutte :
      texte(pluie[i].x, pluie[i].y, " ");     //   efface-la,
      pluie[i].tomber();                      //   fais-la descendre d'une ligne.

      if (attrape(i)) {                       //   Dans le panier ?
        score++;                              //     un point,
        lancer(i);                            //     elle repart d'en haut,
        dessinerScore();
      } else if (pluie[i].y >= SOL) {         //   Sinon, arrivée en bas, à côté ?
        vies--;                               //     une vie en moins,
        lancer(i);                            //     elle repart d'en haut,
        dessinerScore();
      }

      texte(pluie[i].x, pluie[i].y, "O");     //   Redessine-la.
    }

    if (vies == 0) break;       // Plus de vies : on SORT de la boucle du jeu.
  }

  // On arrive ici seulement après le break : la partie est finie.
  texte(6, 8, "PERDU!");
  texte(4, 10, "SCORE:");
  nombre(11, 10, score);

  while (true) {                // Une dernière boucle pour garder l'écran allumé.
    image();
  }
}
`,
    aVoir: 'Trois O qui tombent, un panier |#| que GAUCHE et DROITE déplacent ; sans rien faire, « PERDU! » s’affiche au bout de quelques secondes.',
    controle: (c) => {
      const p0 = c.variable('panier')
      tenir(c, 'left', () => c.variable('panier') < p0)
      const p1 = c.variable('panier')
      const panierVu = c.mot(0, 16, 20).includes('|#|')
      const pluie = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].some((l) => c.mot(0, l, 20).includes('O'))

      /* Sans toucher à rien, les objets finissent par tomber à côté. */
      let images = 0
      while (images < 6000 && c.variable('vies') > 0) { c.avancer(10); images += 10 }
      c.avancer(20)
      return [
        ['le panier est à l’écran', panierVu],
        ['des objets tombent', pluie],
        ['GAUCHE déplace le panier', p1 < p0, ` (${p0} puis ${p1})`],
        ['chaque objet manqué coûte une vie : on tombe à 0', c.variable('vies') === 0, ` (après ${images} images)`],
        ['la boucle du jeu se termine par break : PERDU!', c.mot(6, 8, 6) === 'PERDU!'],
      ]
    },
  },
  /* ================================================ 7 — les quatre nuances */

  {
    titre: 'Quatre nuances, deux bits par pixel',
    difficulte: 7,
    provenance: 'cours',
    idee: 'Sur la Game Boy d’origine, un pixel n’est pas une couleur : c’est un nombre de 0 à 3.',
    texte: [
      'L’écran de la Game Boy d’origine ne connaît que **quatre nuances** : du plus clair au plus sombre. Tout ce que tu as vu dans les jeux — Tetris, Zelda, Pokémon Rouge — est fait avec ces quatre-là, et rien d’autre.',
      'Quatre valeurs, c’est **deux bits** par pixel (00, 01, 10, 11 : 0, 1, 2, 3). Une tuile de 8 × 8 pixels pèse donc 64 × 2 = 128 bits = **16 octets**. La console range ces deux bits dans deux octets séparés par rangée : le premier porte le bit du bas de chaque pixel, le second le bit du haut. Le compilateur fait ce rangement pour toi.',
      'Dans le programme, une tuile s’écrit en **huit rangées de huit caractères**. Deux alphabets, au choix : les **chiffres** `0 1 2 3`, ou les **signes** `. - + #` — le point est le plus clair, le dièse le plus sombre. Les signes se lisent mieux d’un coup d’œil ; les chiffres disent exactement le nombre rangé.',
      'Retiens le mot juste : le 0–3 écrit dans la tuile est un **indice**, pas encore une nuance. C’est la **palette** qui décide quelle nuance l’écran montre pour chaque indice. D’origine, la palette est « 0 → 0, 1 → 1, 2 → 2, 3 → 3 », et l’on ne voit pas la différence. La leçon d’après la fera apparaître.',
      '**À toi :** dessine une tuile en damier (une case sur deux en 0 et en 3), et pose-la sur toute une ligne.',
    ],
    code: `// CE PROGRAMME : dessine deux fois le même carré de 8 × 8 pixels, écrit de deux
// façons, et en remplit deux lignes de l'écran.
//
// Ce qui est nouveau : la TUILE, un petit dessin de 8 × 8 pixels.
//   Chaque texte entre guillemets est une RANGÉE de 8 pixels (8 rangées en tout).
//   Chaque pixel a une des 4 nuances de la Game Boy d'origine :
//     0 = le plus clair   1 = clair   2 = sombre   3 = le plus sombre
//   Deux bits par pixel suffisent : 4 valeurs possibles.
//   poser(colonne, ligne, TUILE) pose la tuile dans une case de l'écran.

// Les quatre nuances, en chiffres : 0 le plus clair, 3 le plus sombre.
// Deux rangées de chaque nuance : 2 de 0, 2 de 1, 2 de 2, 2 de 3.

#include <Tuile>   // un dessin de 8 × 8 pixels
#include <ecran>   // éteint ou rallume l’écran
#include <texte>   // écrit un texte à l’écran
#include <poser>   // pose une tuile sur une case du fond

Tuile CHIFFRES = {
  "00000000", "00000000",
  "11111111", "11111111",
  "22222222", "22222222",
  "33333333", "33333333",
};

// Exactement le même dessin, en signes : . - + #
// (. vaut 0, - vaut 1, + vaut 2, # vaut 3 : on choisit ce qui se lit le mieux.)
Tuile SIGNES = {
  "........", "........",
  "--------", "--------",
  "++++++++", "++++++++",
  "########", "########",
};

int main() {                        // Le jeu commence ici.
  ecran(0);                         // Dessin écran éteint.
  texte(1, 1, "EN CHIFFRES");
  texte(1, 8, "EN SIGNES");
  for (uint8_t c = 0; c < 20; c++) {  // Les 20 colonnes :
    poser(c, 3, CHIFFRES);          //   une tuile CHIFFRES sur la ligne 3,
    poser(c, 10, SIGNES);           //   une tuile SIGNES sur la ligne 10.
  }                                 // Les deux bandes sont identiques.
  ecran(1);                         // On rallume.

  while (true) {                    // La boucle du jeu.
    image();
  }
}
`,
    aVoir: 'Deux bandes identiques de quatre nuances, du clair en haut au sombre en bas.',
    controle: (c) => {
      const bande = (ligne) => [0, 2, 4, 6].map((k) => nuance(c, 40, ligne * 8 + k)).join('')
      return [
        ['les chiffres donnent les nuances 0, 1, 2, 3', bande(3) === '0123', ` (${bande(3)})`],
        ['les signes donnent exactement les mêmes', bande(10) === '0123', ` (${bande(10)})`],
        ['la console est en mode d’origine, sans couleur', c.gb.ppu.couleur === false],
      ]
    },
  },

  {
    titre: 'Dessiner avec quatre nuances : lumière et ombre',
    difficulte: 7,
    provenance: 'cours',
    idee: 'Quatre nuances suffisent à faire du relief, si chacune a un rôle.',
    texte: [
      'Avec si peu de nuances, les graphistes de la Game Boy donnaient **un rôle** à chacune : **0** pour le fond et les reflets, **1** et **2** pour les surfaces, **3** pour les contours et les ombres.',
      'Le relief vient d’une convention : **la lumière arrive d’en haut à gauche**. Le bord haut et le bord gauche d’un bloc sont donc clairs, le bord bas et le bord droit sombres. L’œil comprend aussitôt : le bloc **sort** de l’écran. Inverse les bords, et le même carré devient un **trou**.',
      'Le **tramage** fabrique une nuance qui n’existe pas : un damier de 1 et de 2, vu de loin, se lit comme une nuance intermédiaire. C’est une ruse très utilisée sur Game Boy pour les dégradés et les ombres douces.',
      'Un conseil qui vaut pour toute la suite, **même en couleur** : un dessin doit rester lisible en quatre nuances. Si ton héros et ton décor emploient les mêmes nuances aux mêmes endroits, ils se confondent — on ne sait plus qui est où.',
      '**À toi :** dessine une brique avec un joint clair (0) et une face en 2, puis un mur entier.',
    ],
    code: `// CE PROGRAMME : trois bandes de tuiles : des blocs en relief, des trous, et une trame.
//
// L'astuce du relief : la lumière vient d'en haut à gauche.
//   Bords CLAIRS en haut et à gauche + bords SOMBRES en bas et à droite → ça sort.
//   L'inverse → ça s'enfonce.
// Rappel des nuances : 0 le plus clair, 1 clair, 2 sombre, 3 le plus sombre.

// Un bloc qui sort de l'écran : lumière en haut à gauche.
// Rangée du haut : 0 (clair) puis un 3 au bout ; la dernière rangée : tout en 3 (ombre).

#include <Tuile>   // un dessin de 8 × 8 pixels
#include <ecran>   // éteint ou rallume l’écran
#include <texte>   // écrit un texte à l’écran
#include <poser>   // pose une tuile sur une case du fond

Tuile BLOC = {
  "00000003",
  "01111123",
  "01222223",
  "01222223",
  "01222223",
  "01222223",
  "02222223",
  "33333333",
};

// Le même carré, bords inversés : il s'enfonce.
// Sombre en haut à gauche, clair en bas à droite.
Tuile TROU = {
  "33333330",
  "32222210",
  "32111110",
  "32111110",
  "32111110",
  "32111110",
  "31111110",
  "00000000",
};

// Le tramage : un damier de 1 et de 2, lu comme une nuance entre les deux.
// De loin, l'œil mélange les pixels : on croit voir une 5e nuance.
Tuile TRAME = {
  "12121212", "21212121", "12121212", "21212121",
  "12121212", "21212121", "12121212", "21212121",
};

int main() {                        // Le jeu commence ici.
  ecran(0);                         // Dessin écran éteint.
  texte(1, 1, "BLOCS");
  texte(1, 6, "TROUS");
  texte(1, 11, "TRAME");
  for (uint8_t c = 0; c < 20; c++) {  // Les 20 colonnes :
    poser(c, 3, BLOC);              //   une rangée de blocs (ligne 3),
    poser(c, 8, TROU);              //   une rangée de trous (ligne 8),
    poser(c, 13, TRAME);            //   une rangée de trame (ligne 13).
  }
  ecran(1);                         // On rallume.

  while (true) {                    // La boucle du jeu.
    image();
  }
}
`,
    aVoir: 'Une rangée de blocs en relief, une rangée de trous, et une bande tramée.',
    controle: (c) => [
      ['le bloc est clair en haut à gauche', nuance(c, 16, 24) === 0],
      ['et sombre en bas à droite', nuance(c, 23, 31) === 3],
      ['le trou est l’inverse', nuance(c, 16, 64) === 3 && nuance(c, 23, 71) === 0],
      ['la trame alterne 1 et 2', [0, 1, 2, 3].map((k) => nuance(c, 16 + k, 104)).join('') === '1212'],
    ],
  },

  {
    titre: 'La palette : un indice n’est pas une nuance',
    difficulte: 7,
    provenance: 'cours',
    idee: 'Changer la palette change TOUT l’écran d’un coup — sans toucher à une seule tuile.',
    texte: [
      'Entre la tuile et l’écran, il y a la **palette** : une table de quatre cases qui dit, pour chaque indice 0–3, quelle nuance montrer. `paletteFond(n0, n1, n2, n3)` la remplit : l’indice 0 prendra la nuance `n0`, l’indice 1 la nuance `n1`, et ainsi de suite.',
      'D’origine, c’est `paletteFond(0, 1, 2, 3)`. `paletteFond(3, 2, 1, 0)` **inverse** tout : le clair devient sombre, comme un négatif. `paletteFond(0, 0, 3, 3)` écrase les nuances du milieu : un contraste brutal.',
      'Remarque ce qui change **aussi** : le texte. Les lettres sont des tuiles comme les autres, dessinées en indice 3 sur un fond d’indice 0. Tout ce qui est sur le fond passe par la même palette.',
      'La palette tient dans **un seul octet** de la console — deux bits par indice : `11 10 01 00` en binaire, soit 228, pour la palette d’origine. La changer, c’est écrire un octet : ça ne coûte presque rien, et **ça n’attend rien** : `texte()`, lui, attend une pause de la console avant chaque lettre (chapitre 3). On peut donc la changer à chaque image sans ralentir le jeu.',
      'C’est la clé de tous les effets de la leçon suivante : on ne redessine rien, on change la **lecture** du dessin.',
      '**À toi :** avec SELECT, fais `paletteFond(0, 0, 0, 0)` — que reste-t-il à l’écran ?',
    ],
    code: `// CE PROGRAMME : une bande de 4 nuances. Tiens A : elle passe en négatif.
// Tiens B : il ne reste que 2 nuances. Rien : les nuances d'origine.
//
// Ce qui est nouveau : la PALETTE du fond.
//   Une tuile ne contient pas des nuances, mais des INDICES (0 à 3).
//   La palette dit quelle nuance montrer pour chaque indice :
//   paletteFond(n0, n1, n2, n3) → l'indice 0 montre la nuance n0,
//                                  l'indice 1 la nuance n1, etc.
//   On change la palette : tout l'écran change, sans redessiner une seule tuile.

// La bande : 2 rangées d'indice 0, 2 de 1, 2 de 2, 2 de 3.

#include <Tuile>         // un dessin de 8 × 8 pixels
#include <ecran>         // éteint ou rallume l’écran
#include <texte>         // écrit un texte à l’écran
#include <poser>         // pose une tuile sur une case du fond
#include <bouton>        // lit un bouton de la manette
#include <paletteFond>   // choisit les quatre nuances du fond

Tuile BANDES = {
  "00000000", "00000000", "11111111", "11111111",
  "22222222", "22222222", "33333333", "33333333",
};

int main() {                          // Le jeu commence ici.
  ecran(0);                           // Dessin écran éteint.
  texte(1, 1, "A: NEGATIF");
  texte(1, 2, "B: CONTRASTE");
  for (uint8_t c = 0; c < 20; c++) {  // Les 20 colonnes de la ligne 7 :
    poser(c, 7, BANDES);              //   la bande de nuances.
  }
  ecran(1);                           // On rallume.

  while (true) {                      // La boucle du jeu :
    image();

    if (bouton(A)) {                  // A tenue :
      paletteFond(3, 2, 1, 0);      // le négatif : 0 devient 3, 1 devient 2, ...
                                    // (le clair devient sombre ; le texte aussi s'inverse)
    } else if (bouton(B)) {           // sinon, B tenue :
      paletteFond(0, 0, 3, 3);      // deux nuances seulement : 0 et 1 → clair, 2 et 3 → sombre
    } else {                          // sinon, aucune des deux :
      paletteFond(0, 1, 2, 3);      // la palette d'origine : chaque indice montre sa nuance
    }
  }
}
`,
    aVoir: 'Quatre bandes ; A les inverse (et le texte avec), B n’en garde que deux nuances.',
    controle: (c) => {
      const bande = () => [0, 2, 4, 6].map((k) => nuance(c, 40, 56 + k)).join('')
      const repos = bande()
      const negatif = pendant(c, 'a', bande)
      const texteNegatif = pendant(c, 'a', () => nuance(c, 4, 4))
      const contraste = pendant(c, 'b', bande)
      c.avancer(4)
      return [
        ['au repos : 0, 1, 2, 3', repos === '0123', ` (${repos})`],
        ['A inverse tout : 3, 2, 1, 0', negatif === '3210', ` (${negatif})`],
        ['le fond du texte s’inverse aussi', texteNegatif === 3],
        ['B écrase les nuances du milieu : 0, 0, 3, 3', contraste === '0033', ` (${contraste})`],
        ['au relâché, la palette d’origine revient', bande() === '0123'],
      ]
    },
  },

  {
    titre: 'Un fondu au noir, et retour',
    difficulte: 7,
    provenance: 'cours',
    idee: 'Quatre palettes à la suite, et l’écran s’éteint en douceur.',
    texte: [
      'Un **fondu au noir** — entre deux niveaux, quand on perd — n’est qu’une suite de palettes, chacune un peu plus sombre que la précédente : chaque indice avance d’une nuance vers 3, jusqu’à ce que tout soit à 3.',
      'Comme il n’y a que quatre nuances, le fondu n’a que **quatre pas**. On range les palettes dans des **tables gravées** (chapitre 4) : `N0[pas]` est la nuance de l’indice 0 au pas `pas`. Pas 0 : la palette d’origine ; pas 3 : tout noir.',
      'Le fondu s’étale sur plusieurs images : c’est la **boucle qui dure plusieurs images** du chapitre 3. `sens` dit où l’on va, `attente` fait patienter 8 tours entre deux pas. A lance le fondu au noir, B le fait revenir.',
      '`paletteFond` est appelé **à chaque image**, avec des valeurs lues dans les tables : on peut, puisqu’écrire la palette ne coûte presque rien. Le compilateur assemble l’octet à l’exécution quand les nuances ne sont pas connues d’avance.',
      'Le **fondu au blanc** est le même avec des tables qui vont vers 0 : c’est l’effet de l’écran qui « flashe » quand une bombe explose.',
      '**À toi :** écris les tables d’un fondu au blanc et branche-le sur SELECT.',
    ],
    code: `// CE PROGRAMME : A fait un fondu au noir (l'écran s'assombrit par étapes),
// B le fait revenir.
//
// L'idée : on ne redessine rien. On change seulement la palette, en 4 pas.
// Les trois tables N0, N1, N2 disent, pour chaque pas, quelle nuance montrer
// pour l'indice 0, l'indice 1 et l'indice 2 (l'indice 3 reste toujours 3, noir).

#include <Tuile>         // un dessin de 8 × 8 pixels
#include <ecran>         // éteint ou rallume l’écran
#include <texte>         // écrit un texte à l’écran
#include <poser>         // pose une tuile sur une case du fond
#include <bouton>        // lit un bouton de la manette
#include <paletteFond>   // choisit les quatre nuances du fond

Tuile BANDES = {                // La bande des 4 indices, pour voir le fondu.
  "00000000", "00000000", "11111111", "11111111",
  "22222222", "22222222", "33333333", "33333333",
};

// Les quatre pas du fondu : chaque indice avance vers le noir.
//                      pas :  0  1  2  3
const uint8_t N0[] = { 0, 1, 2, 3 };    // l'indice 0 : 0, puis 1, puis 2, puis 3
const uint8_t N1[] = { 1, 2, 3, 3 };    // l'indice 1 : 1, 2, 3, 3
const uint8_t N2[] = { 2, 3, 3, 3 };    // l'indice 2 : 2, 3, 3, 3
                                        // Au pas 3, tout vaut 3 : l'écran est noir.

uint8_t pas = 0;     // 0 : normal ... 3 : tout noir
uint8_t sens = 0;    // 0 : on ne bouge pas ; 1 : on assombrit ; 2 : on éclaircit

int main() {                          // Le jeu commence ici.
  ecran(0);                           // Dessin écran éteint.
  texte(1, 1, "A: FONDU AU NOIR");
  texte(1, 2, "B: RETOUR");
  for (uint8_t c = 0; c < 20; c++) {
    poser(c, 7, BANDES);              // La bande, sur toute la ligne 7.
  }
  ecran(1);                           // On rallume.

  uint8_t attente = 0;                // Pour ne changer de pas que toutes les 8 images.

  while (true) {                      // La boucle du jeu :
    image();

    if (bouton(A)) sens = 1;          // A : on va vers le noir.
    if (bouton(B)) sens = 2;          // B : on revient.

    attente++;
    if (attente >= 8) {               // Toutes les 8 images :
      attente = 0;
      if (sens == 1 && pas < 3) pas++;  // un pas vers le noir (sans dépasser 3),
      if (sens == 2 && pas > 0) pas--;  // ou un pas vers la lumière (sans passer sous 0).
    }

    paletteFond(N0[pas], N1[pas], N2[pas], 3);  // On applique le pas actuel.
                                                // pas = 1 → paletteFond(1, 2, 3, 3).
  }
}
`,
    aVoir: 'A : l’écran s’assombrit en quatre pas jusqu’au noir complet. B : il revient.',
    controle: (c) => {
      const bande = () => [0, 2, 4, 6].map((k) => nuance(c, 40, 56 + k)).join('')
      const debut = bande()
      c.presser('a', 3)
      c.avancer(10)
      const milieu = bande()
      c.avancer(40)
      const noir = bande()
      const pasNoir = c.variable('pas')
      c.presser('b', 3)
      c.avancer(50)
      return [
        ['au départ, les quatre nuances', debut === '0123'],
        ['en route, l’écran s’assombrit', milieu !== '0123' && milieu !== '3333', ` (${milieu})`],
        ['au bout, tout est noir', noir === '3333' && pasNoir === 3],
        ['B ramène la palette d’origine', bande() === '0123' && c.variable('pas') === 0],
      ]
    },
  },

  {
    titre: 'Les lutins : trois nuances et la transparence',
    difficulte: 7,
    provenance: 'cours',
    idee: 'Un lutin n’a que trois nuances : l’indice 0 est un trou, par où l’on voit le décor.',
    texte: [
      'Les **lutins** (les sprites) ont leurs propres palettes — **deux** sur la Game Boy d’origine — réglées par `paletteLutins(numero, n0, n1, n2, n3)`.',
      'Mais chez eux, **l’indice 0 ne s’affiche jamais** : il est **transparent**. Quelle que soit la palette, un pixel 0 laisse voir le décor derrière. C’est ce qui permet à un personnage rond de ne pas se promener dans un carré blanc. Un lutin n’a donc que **trois** nuances visibles : 1, 2 et 3.',
      'Le premier lutin prend la palette 0 (celle par défaut). Le second demande la palette 1 avec l’option `PALETTE1` de `sprite()`. **Le même dessin**, deux palettes : deux personnages différents pour le prix d’une tuile. Les jeux Game Boy s’en servent pour distinguer un ennemi fort d’un faible, ou le joueur 1 du joueur 2.',
      'Le décor est tramé exprès : regarde les coins des deux pions — on y voit le décor, pas un fond uni.',
      '**À toi :** fais `paletteLutins(1, 0, 1, 1, 1)` : que devient le second pion ?',
    ],
    code: `// CE PROGRAMME : deux pions ronds posés sur un décor gris.
// Même dessin, mais deux palettes différentes : ils n'ont pas les mêmes nuances.
//
// Ce qui est nouveau : le LUTIN (en anglais « sprite »).
//   Un lutin est un dessin de 8 × 8 qui se pose AU PIXEL près, par-dessus le décor.
//   sprite(numero, x, y, TUILE) : numero = quel lutin (0 à 39),
//                                 x, y = sa place en pixels (l'écran fait 160 × 144).
//   Chez les lutins, l'indice 0 est TRANSPARENT : on voit le décor à travers.
//   paletteLutins(numero de palette, n0, n1, n2, n3) : comme paletteFond,
//   pour les lutins. Il y en a deux : la palette 0 et la palette 1.

// Le pion : les coins en 0, donc transparents.

#include <Tuile>           // un dessin de 8 × 8 pixels
#include <ecran>           // éteint ou rallume l’écran
#include <poser>           // pose une tuile sur une case du fond
#include <texte>           // écrit un texte à l’écran
#include <paletteLutins>   // choisit les quatre nuances des lutins
#include <sprite>          // place un lutin de 8 × 8 au pixel près

Tuile PION = {
  "00111100",
  "01222210",
  "12333321",
  "12333321",
  "12333321",
  "12333321",
  "01222210",
  "00111100",
};

// Le décor : une tuile toute en indice 2 (gris sombre).
Tuile DECOR = {
  "22222222", "22222222", "22222222", "22222222",
  "22222222", "22222222", "22222222", "22222222",
};

int main() {                          // Le jeu commence ici.
  ecran(0);                           // Dessin écran éteint.
  for (uint8_t l = 7; l < 13; l++) {  // Les lignes 7 à 12...
    for (uint8_t c = 0; c < 20; c++) {  // ... sur toute la largeur :
      poser(c, l, DECOR);             //   du décor gris.
    }
  }
  texte(1, 2, "PALETTE 0   PALETTE 1");
  ecran(1);                           // On rallume.

  // La palette 1 des lutins : les indices 1, 2, 3 deviennent 3, 1, 0.
  // (Le 0 du début est l'indice 0 : il reste transparent quoi qu'on mette.)
  paletteLutins(1, 0, 3, 1, 0);

  sprite(0, 40, 72, PION);             // Lutin 0, au pixel (40, 72), palette 0 : celle d'origine.
  sprite(1, 112, 72, PION, PALETTE1);  // Lutin 1 : le même dessin, palette 1.
                                       // 72 = 9 × 8 : les deux sont au milieu du décor.

  while (true) {                      // La boucle du jeu.
    image();
  }
}
`,
    aVoir: 'Deux pions identiques de forme, posés sur un décor gris : l’un sombre au centre, l’autre clair.',
    controle: (c) => [
      ['le coin du premier pion laisse voir le décor', nuance(c, 40, 72) === 2],
      ['le coin du second aussi', nuance(c, 112, 72) === 2],
      ['le centre du premier : indice 3, nuance 3', nuance(c, 43, 75) === 3],
      ['le centre du second : indice 3, nuance 0 par sa palette', nuance(c, 115, 75) === 0],
    ],
  },

  {
    titre: 'Faire clignoter un personnage touché',
    difficulte: 7,
    provenance: 'cours',
    idee: 'Touché : le héros clignote une seconde. Une palette qui s’allume et s’éteint, rien de plus.',
    texte: [
      'Dans presque tous les jeux, un héros touché **clignote** un moment : il est invincible tant qu’il clignote. On pourrait le cacher et le remontrer avec `cacher()` et `sprite()` ; il y a plus simple.',
      '`paletteLutins(0, 0, 0, 0, 0)` fait de ses trois nuances visibles… la nuance 0, le blanc du fond : le héros **disparaît**, sans bouger d’un pixel. `paletteLutins(0, 0, 1, 2, 3)` le fait revenir. Alterner les deux toutes les quatre images, c’est le clignotement.',
      '`touche` compte les images d’invincibilité qui restent : 60 au moment du coup, puis un de moins à chaque image. `touche % 8 < 4` est vrai quatre images sur huit : le modulo du chapitre 1 fait le rythme. Quand `touche` retombe à 0, la palette normale revient pour de bon.',
      'La garde `touche == 0` dans le `if` du bouton empêche de relancer le clignotement tant qu’il dure — c’est exactement la règle « invincible pendant une seconde ».',
      'Attention : la palette s’applique à **tous** les lutins qui l’emploient. Pour que seul le héros clignote, ses ennemis prennent l’autre palette (`PALETTE1`).',
      '**À toi :** fais clignoter l’écran entier à la place, avec `paletteFond`.',
    ],
    code: `// CE PROGRAMME : un héros au milieu de l'écran. Appuie sur A : il est « touché »
// et clignote pendant une seconde (60 images).
//
// L'astuce : pour le cacher, on ne l'efface pas. On met toutes les nuances
// de sa palette à 0 (le blanc du fond) : il devient invisible, sans bouger.

// Le héros, en signes : . = 0 (transparent), - = 1, # = 3.

#include <Tuile>           // un dessin de 8 × 8 pixels
#include <texte>           // écrit un texte à l’écran
#include <sprite>          // place un lutin de 8 × 8 au pixel près
#include <bouton>          // lit un bouton de la manette
#include <paletteLutins>   // choisit les quatre nuances des lutins

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

int main() {                          // Le jeu commence ici.
  texte(1, 1, "A: TOUCHE");
  sprite(0, 76, 70, HEROS);           // Lutin 0, au pixel (76, 70) : au milieu.

  uint8_t touche = 0;          // les images d'invincibilité qui restent (0 = pas touché)

  while (true) {                      // La boucle du jeu :
    image();

    if (bouton(A) && touche == 0) touche = 60;   // A, et pas déjà en train de clignoter :
                                                 // 60 images d'invincibilité (1 seconde).

    if (touche > 0 && touche % 8 < 4) {   // Pendant le clignotement, 4 images sur 8 :
                                          // touche % 8 = le reste par 8 (0 à 7) ;
                                          // < 4 est vrai pour 0, 1, 2, 3.
      paletteLutins(0, 0, 0, 0, 0);   // invisible : toutes ses nuances = 0 (le fond)
    } else {                          // Les 4 autres images, ou quand ce n'est pas touché :
      paletteLutins(0, 0, 1, 2, 3);   // visible : la palette normale
    }

    if (touche > 0) touche--;         // Une image de moins à attendre (sans passer sous 0).
  }
}
`,
    aVoir: 'Un petit héros au milieu ; A le fait clignoter une seconde, puis il reste visible.',
    controle: (c) => {
      const avant = nuance(c, 78, 72)
      c.presser('a', 3)
      const vus = new Set()
      for (let k = 0; k < 40; k++) { c.avancer(1); vus.add(nuance(c, 78, 72)) }
      c.avancer(60)
      const apres = []
      for (let k = 0; k < 20; k++) { c.avancer(1); apres.push(nuance(c, 78, 72)) }
      return [
        ['au repos, le héros est visible', avant === 3],
        ['touché, il apparaît et disparaît', vus.has(0) && vus.has(3), ` (nuances vues : ${[...vus].join(', ')})`],
        ['une seconde plus tard, il reste visible', apres.every((n) => n === 3)],
      ]
    },
  },
  /* ================================================ 8 — la couleur */

  {
    titre: 'Allumer la couleur : rouge, vert, bleu',
    difficulte: 8,
    provenance: 'cours',
    idee: 'Sur Game Boy Color, chaque indice 0–3 d’une tuile devient une vraie couleur, que tu choisis.',
    texte: [
      'La Game Boy Color garde **exactement les mêmes tuiles** : deux bits par pixel, des indices de 0 à 3. Ce qui change, c’est la palette. Au lieu de dire « indice 2 → nuance 2 », elle dit « indice 2 → **ce rouge-là** ».',
      '`couleurFond(palette, teinte, rouge, vert, bleu)` règle **une** teinte : la palette (0 à 7, on en parle plus loin), l’indice concerné (0 à 3), puis trois **composantes** de **0 à 31**. 0 : la lumière de cette couleur est éteinte ; 31 : elle est à fond.',
      'Cinq bits par composante : 32 × 32 × 32 = **32 768 couleurs** au choix. `31, 31, 31` est le blanc, `0, 0, 0` le noir, `31, 0, 0` le rouge pur.',
      'Le texte est dessiné en indice 3 sur un fond d’indice 0 : ici, il prend donc le bleu nuit de la teinte 3 sur le blanc de la teinte 0.',
      '**Dans l’atelier**, la liste en haut à gauche choisit la console, l’une **ou** l’autre : **« En couleur »** (une cartouche `.gbc` pour la Game Boy Color) ou **« Game Boy »** (un `.gb`, les quatre nuances, rien de plus). En « Game Boy », `couleurFond()` est **refusé** — une Game Boy d’origine n’a pas de registre de couleur, et le compilateur préfère le dire.',
      '**À toi :** change les quatre teintes pour faire un dégradé du jaune au rouge.',
    ],
    code: `// CE PROGRAMME (Game Boy Color) : la même bande de 4 indices qu'en nuances,
// mais chaque indice reçoit une vraie couleur : blanc, orange, prune, bleu nuit.
//
// Ce qui est nouveau : couleurFond(palette, indice, rouge, vert, bleu)
//   palette : laquelle des 8 palettes du fond (0 à 7) ; ici la 0.
//   indice  : lequel des 4 indices de la tuile on colore (0 à 3).
//   rouge, vert, bleu : trois lumières, de 0 (éteinte) à 31 (à fond).
//   Exemples : 31, 31, 31 = blanc ; 0, 0, 0 = noir ; 31, 0, 0 = rouge pur.
// Attention : il faut choisir la console « En couleur » dans l'atelier.

#include <Tuile>         // un dessin de 8 × 8 pixels
#include <couleurFond>   // choisit une couleur d’une palette du fond
#include <ecran>         // éteint ou rallume l’écran
#include <texte>         // écrit un texte à l’écran
#include <poser>         // pose une tuile sur une case du fond

Tuile BANDES = {                  // 2 rangées de chaque indice : 0, 1, 2, 3.
  "00000000", "00000000", "11111111", "11111111",
  "22222222", "22222222", "33333333", "33333333",
};

int main() {                      // Le jeu commence ici.
  // La palette 0 : quatre teintes, de 0 à 31 pour rouge, vert, bleu.
  couleurFond(0, 0, 31, 31, 31);   // indice 0 : blanc   (les trois lumières à fond)
  couleurFond(0, 1, 31, 20,  0);   // indice 1 : orange  (beaucoup de rouge, un peu de vert)
  couleurFond(0, 2, 20,  0, 10);   // indice 2 : prune   (rouge et un peu de bleu)
  couleurFond(0, 3,  0,  0, 12);   // indice 3 : bleu nuit (un peu de bleu seulement)

  ecran(0);                       // Dessin écran éteint.
  texte(2, 2, "EN COULEUR");      // Les lettres sont en indice 3 sur un fond d'indice 0 :
                                  // du bleu nuit sur du blanc.
  for (uint8_t c = 0; c < 20; c++) {
    poser(c, 7, BANDES);          // La bande, sur toute la ligne 7.
  }
  ecran(1);                       // On rallume.

  while (true) {                  // La boucle du jeu.
    image();
  }
}
`,
    aVoir: 'Quatre bandes : blanc, orange, prune, bleu nuit — et le texte en bleu nuit sur blanc.',
    controle: (c) => {
      const bandes = [0, 2, 4, 6].map((k) => couleur(c, 40, 56 + k))
      return [
        ['la console est passée en couleur', c.gb.ppu.couleur === true],
        ['chaque indice a pris sa couleur', bandes.join(' ') === '31/31/31 31/20/0 20/0/10 0/0/12', ` (${bandes.join('  ')})`],
        ['le texte prend la teinte 3', couleur(c, 2 * 8 + 1, 2 * 8 + 3) === '0/0/12' || couleur(c, 2 * 8 + 2, 2 * 8 + 3) === '0/0/12'],
      ]
    },
  },

  {
    titre: 'Mélanger la lumière',
    difficulte: 8,
    provenance: 'cours',
    idee: 'Rouge et vert donnent du jaune : sur un écran, les couleurs s’ADDITIONNENT.',
    texte: [
      'Un écran fabrique ses couleurs avec de la **lumière**, pas avec de la peinture. Les trois lumières **s’additionnent** : rouge + vert = **jaune**, rouge + bleu = **magenta**, vert + bleu = **cyan**, les trois à fond = **blanc**. Rien du tout = noir.',
      'Ce mélangeur le montre : GAUCHE et DROITE choisissent la composante (le `#` sous la lettre), HAUT et BAS la changent, de 0 à 31. Le grand carré prend la couleur à chaque image.',
      '`couleurFond(1, 3, r, v, b)` reçoit ici des **variables** : la couleur se calcule pendant le jeu. Le carré est teint en palette 1 (la leçon d’après explique `teindre`), pour que le reste de l’écran garde sa palette 0.',
      '`valeurs[choix]` : les trois composantes sont rangées dans un **tableau** (chapitre 4), et `choix` dit laquelle on règle. C’est ce qui permet un seul `if` pour HAUT et un seul pour BAS, au lieu de trois de chaque.',
      'On ne réécrit les nombres **que s’ils ont changé** : la règle du VBlank tient toujours, en couleur comme en quatre nuances.',
      '**À toi :** trouve le orange, le rose et le marron. (Indice pour le marron : un orange sombre.)',
    ],
    code: `// CE PROGRAMME (Game Boy Color) : un mélangeur de couleurs.
// GAUCHE / DROITE choisissent la lumière (R rouge, V vert, B bleu),
// HAUT la monte, BAS la baisse. Le grand carré prend la couleur obtenue.
//
// Les lumières s'ADDITIONNENT : rouge + vert = jaune, rouge + bleu = magenta,
// vert + bleu = cyan, les trois à fond = blanc.

// Une tuile toute en indice 3 : le carré sera de la couleur de l'indice 3.

#include <Tuile>         // un dessin de 8 × 8 pixels
#include <nombre>        // écrit un nombre en chiffres
#include <texte>         // écrit un texte à l’écran
#include <ecran>         // éteint ou rallume l’écran
#include <poser>         // pose une tuile sur une case du fond
#include <teindre>       // met une case du fond dans une palette
#include <bouton>        // lit un bouton de la manette
#include <couleurFond>   // choisit une couleur d’une palette du fond

Tuile PLEIN = {
  "33333333", "33333333", "33333333", "33333333",
  "33333333", "33333333", "33333333", "33333333",
};

uint8_t valeurs[3] = { 31, 16, 0 };   // rouge, vert, bleu (0 à 31 chacun)
uint8_t choix = 0;                    // 0 : rouge, 1 : vert, 2 : bleu

void ecrireValeurs() {                // Affiche les 3 valeurs, et ## sous celle choisie.
  for (uint8_t i = 0; i < 3; i++) {   // i = 0 (rouge), 1 (vert), 2 (bleu)
    nombre(2 + i * 6, 14, valeurs[i], 2);        // en colonne 2, 8, 14 ; 2 chiffres
    if (i == choix) texte(2 + i * 6, 15, "##");  // la choisie : ## dessous
    else texte(2 + i * 6, 15, "  ");             // les autres : on efface
  }
}

int main() {                          // Le jeu commence ici.
  ecran(0);                           // Dessin écran éteint.
  for (uint8_t l = 2; l < 10; l++) {  // Un carré : lignes 2 à 9,
    for (uint8_t c = 4; c < 16; c++) {  //          colonnes 4 à 15.
      poser(c, l, PLEIN);             //   la tuile pleine,
      teindre(c, l, 1);               //   en palette 1 : teindre(colonne, ligne, palette).
    }                                 //   (Le reste de l'écran garde la palette 0.)
  }
  texte(2, 12, "R     V     B");
  ecrireValeurs();
  ecran(1);                           // On rallume.

  uint8_t avant = 0;                  // Une flèche était-elle tenue à l'image d'avant ?

  while (true) {                      // La boucle du jeu :
    image();

    uint8_t maintenant = bouton(GAUCHE) || bouton(DROITE) || bouton(HAUT) || bouton(BAS);
                                      // 1 si au moins une des 4 flèches est enfoncée.
    if (maintenant && !avant) {       // Le début d'un appui (un seul changement par appui) :
      if (bouton(DROITE) && choix < 2) choix++;   // lumière suivante
      if (bouton(GAUCHE) && choix > 0) choix--;   // lumière précédente
      if (bouton(HAUT) && valeurs[choix] < 31) valeurs[choix] += 4;  // + 4 (« += » ajoute)
      if (bouton(BAS) && valeurs[choix] > 0) valeurs[choix] -= 1;    // - 1 (« -= » retire)
      if (valeurs[choix] > 31) valeurs[choix] = 31;  // 28 + 4 = 32 : trop, on garde 31.
      ecrireValeurs();                // On réécrit les nombres (seulement s'ils ont changé).
    }
    avant = maintenant;               // On retient pour l'image suivante.

    couleurFond(1, 3, valeurs[0], valeurs[1], valeurs[2]);
                                      // L'indice 3 de la palette 1 = le mélange actuel :
                                      // le carré change de couleur.
  }
}
`,
    aVoir: 'Un grand carré orange ; les flèches règlent son rouge, son vert et son bleu, et il change de couleur aussitôt.',
    controle: (c) => {
      const depart = couleur(c, 80, 40)
      c.presser('right', 3); c.avancer(10)         // on passe au vert
      for (let k = 0; k < 4; k++) { c.presser('up', 3); c.avancer(10) }
      const plusVert = couleur(c, 80, 40)
      c.presser('right', 3); c.avancer(10)         // on passe au bleu
      for (let k = 0; k < 10; k++) { c.presser('up', 3); c.avancer(10) }
      const blanc = couleur(c, 80, 40)
      return [
        ['au départ, un orange : beaucoup de rouge, un peu de vert', depart === '31/16/0', ` (${depart})`],
        ['plus de vert : on va vers le jaune', plusVert === '31/31/0', ` (${plusVert})`],
        ['les trois à fond : du blanc', blanc === '31/31/31', ` (${blanc})`],
        ['l’écran affiche les valeurs', c.mot(2, 14, 2) === '31' && c.mot(14, 14, 2) === '31'],
      ]
    },
  },

  {
    titre: 'Huit palettes, et teindre chaque case',
    difficulte: 8,
    provenance: 'cours',
    idee: 'Le ciel en bleu, le mur en brique, l’herbe en vert : chaque case de l’écran choisit sa palette.',
    texte: [
      'Une palette n’a que **quatre** teintes. Pour un ciel, un mur et de l’herbe, il en faut plus : la Game Boy Color en a **huit** pour le décor, numérotées de 0 à 7. Huit palettes de quatre : **32 couleurs** à l’écran en même temps pour le fond.',
      '`teindre(colonne, ligne, palette)` dit quelle palette emploie **une case** de l’écran. Le choix est rangé dans une **seconde carte**, cachée derrière la première : pour chaque case, l’une dit **quelle tuile**, l’autre dit **quelle palette**. C’est le seul ajout de la couleur à la façon de dessiner — les tuiles, elles, ne changent pas.',
      'La contrainte à retenir : **une case = une palette = quatre couleurs**. On ne peut pas mettre cinq couleurs dans une même tuile de 8 × 8. Les graphistes découpent donc leurs dessins en tuiles qui tiennent chacune dans une palette.',
      'Et une même tuile peut servir avec **des palettes différentes** : l’herbe et le buisson ci-dessous sont le même dessin, `TOUFFE`, en palette 2 puis en palette 3. Une tuile, deux objets.',
      'Toutes ces écritures se font écran éteint (le VBlank, chapitre 3).',
      '**À toi :** ajoute une rangée d’eau en palette 4, avec des bleus.',
    ],
    code: `// CE PROGRAMME (Game Boy Color) : un paysage : un ciel, un mur de briques,
// une rangée d'herbe et de buissons, et encore des briques.
//
// Ce qui est nouveau : plusieurs palettes, et teindre(colonne, ligne, palette).
//   Le fond a 8 palettes (0 à 7) de 4 couleurs chacune.
//   Chaque case de l'écran choisit SA palette avec teindre().
//   Règle : une case = une palette = 4 couleurs au plus.

#include <Tuile>         // un dessin de 8 × 8 pixels
#include <couleurFond>   // choisit une couleur d’une palette du fond
#include <ecran>         // éteint ou rallume l’écran
#include <poser>         // pose une tuile sur une case du fond
#include <teindre>       // met une case du fond dans une palette
#include <texte>         // écrit un texte à l’écran

Tuile CIEL = {                    // Tout en indice 0.
  "00000000", "00000000", "00000000", "00000000",
  "00000000", "00000000", "00000000", "00000000",
};

Tuile BRIQUE = {                  // Des joints en 3, des briques en 1.
  "33333333", "11131111", "11131111", "33333333",
  "13111113", "13111113", "33333333", "11131111",
};

Tuile TOUFFE = {                  // Une touffe : du 0 en haut (le ciel), 1 2 3 en bas.
  "00000000", "00100100", "01201210", "12212221",
  "22222222", "22322232", "23333333", "33333333",
};

int main() {                      // Le jeu commence ici.
  // couleurFond(palette, indice, rouge, vert, bleu), chaque lumière de 0 à 31.
  // Palette 0 : le ciel.
  couleurFond(0, 0, 18, 26, 31);  // indice 0 : bleu ciel
  couleurFond(0, 3,  2,  4, 14);  // indice 3 : bleu sombre (pour le texte)
  // Palette 1 : la brique.
  couleurFond(1, 1, 26, 12,  6);  // indice 1 : brique
  couleurFond(1, 3, 10,  4,  2);  // indice 3 : joints sombres
  // Palette 2 : l'herbe.  Palette 3 : un buisson plus sombre.
  couleurFond(2, 0, 18, 26, 31);  // le ciel derrière l'herbe
  couleurFond(2, 1, 20, 31, 10);  // vert clair
  couleurFond(2, 2,  8, 24,  4);  // vert
  couleurFond(2, 3,  2, 12,  2);  // vert sombre
  couleurFond(3, 0, 18, 26, 31);  // le ciel derrière le buisson
  couleurFond(3, 1, 10, 20, 16);  // des verts plus froids et plus sombres
  couleurFond(3, 2,  4, 14,  8);
  couleurFond(3, 3,  0,  6,  4);

  ecran(0);                       // Dessin écran éteint.
  for (uint8_t c = 0; c < 20; c++) {   // Pour chaque colonne c :
    for (uint8_t l = 0; l < 10; l++) poser(c, l, CIEL);      // lignes 0 à 9 : le ciel, palette 0
    for (uint8_t l = 10; l < 14; l++) {                      // lignes 10 à 13 :
      poser(c, l, BRIQUE);                                   //   des briques,
      teindre(c, l, 1);                                      //   en palette 1.
    }
    poser(c, 14, TOUFFE);                                    // ligne 14 : une touffe,
    teindre(c, 14, c < 10 ? 2 : 3);    // le même dessin, deux palettes
                                       // « c < 10 ? 2 : 3 » se lit : SI c < 10 ALORS 2
                                       // SINON 3. Moitié gauche : herbe ; droite : buisson.
    for (uint8_t l = 15; l < 18; l++) {                      // lignes 15 à 17 :
      poser(c, l, BRIQUE);                                   //   encore des briques.
      teindre(c, l, 1);
    }
  }
  texte(4, 3, "HUIT PALETTES");
  ecran(1);                       // On rallume.

  while (true) {                  // La boucle du jeu.
    image();
  }
}
`,
    aVoir: 'Un ciel bleu clair, un mur de briques, et une bande d’herbe : verte à gauche, plus sombre à droite.',
    controle: (c) => {
      const ciel = couleur(c, 4, 60)
      const brique = couleur(c, 4, 10 * 8 + 1)
      const herbe = couleur(c, 3, 14 * 8 + 4)
      const buisson = couleur(c, 15 * 8 + 3, 14 * 8 + 4)
      return [
        ['le ciel prend la palette 0', ciel === '18/26/31', ` (${ciel})`],
        ['la brique prend la palette 1', brique === '26/12/6', ` (${brique})`],
        ['l’herbe, à gauche, la palette 2', herbe === '8/24/4', ` (${herbe})`],
        ['le même dessin à droite, la palette 3', buisson === '4/14/8', ` (${buisson})`],
      ]
    },
  },

  {
    titre: 'Les lutins en couleur',
    difficulte: 8,
    provenance: 'cours',
    idee: 'Le même personnage en rouge et en vert : deux joueurs pour une seule tuile.',
    texte: [
      'Les lutins ont **huit palettes à eux**, réglées par `couleurLutin(palette, teinte, rouge, vert, bleu)`. Comme en quatre nuances, **l’indice 0 est transparent** : il ne reste que trois couleurs visibles par lutin — on règle donc les teintes 1, 2 et 3.',
      '`teindreLutin(numero, palette)` choisit la palette d’un lutin. Ici, le même `HEROS` est dessiné deux fois : en palette 0 (rouge) et en palette 1 (vert) — un joueur et son frère, comme dans les jeux de plateforme.',
      '**Le piège** : `sprite()` **remet la palette du lutin à 0** chaque fois qu’on l’appelle. Pour un lutin qui bouge — donc qu’on repose à chaque image —, il faut rappeler `teindreLutin()` **juste après** `sprite()`. Oublie-le, et le frère vert redevient rouge dès qu’il fait un pas.',
      'Ici, le héros vert avance tout seul : son `teindreLutin` est dans la boucle, juste après son `sprite`.',
      'Huit palettes de lutins, trois couleurs visibles chacune : **24 couleurs** pour les personnages, en plus des 32 du décor — **56** à l’écran en même temps, le plafond de la console.',
      '**À toi :** ajoute un troisième héros en bleu, palette 2, qui avance dans l’autre sens.',
    ],
    code: `// CE PROGRAMME (Game Boy Color) : deux héros du même dessin, l'un rouge et
// immobile, l'autre vert qui avance tout seul vers la droite.
//
// Ce qui est nouveau :
//   couleurLutin(palette, indice, rouge, vert, bleu) : les couleurs des lutins
//     (8 palettes à eux). L'indice 0 est transparent : on règle 1, 2 et 3.
//   teindreLutin(numero du lutin, palette) : quelle palette ce lutin emploie.
//   LE PIÈGE : sprite() remet la palette du lutin à 0. Il faut donc rappeler
//   teindreLutin() juste APRÈS chaque sprite().

#include <Tuile>          // un dessin de 8 × 8 pixels
#include <couleurLutin>   // choisit une couleur d’une palette des lutins
#include <texte>          // écrit un texte à l’écran
#include <sprite>         // place un lutin de 8 × 8 au pixel près
#include <teindreLutin>   // met un lutin dans une palette

Tuile HEROS = {                   // 0 = transparent, 1 clair, 2 moyen, 3 contour.
  "00333300",
  "03222230",
  "32122123",
  "32222223",
  "03222230",
  "00333300",
  "03300330",
  "33000033",
};

int main() {                      // Le jeu commence ici.
  // Palette 0 des lutins : le rouge. Palette 1 : le vert.
  couleurLutin(0, 1, 31, 28, 20); // palette 0, indice 1 : rose clair
  couleurLutin(0, 2, 31,  4,  2); // palette 0, indice 2 : rouge
  couleurLutin(0, 3, 10,  0,  0); // palette 0, indice 3 : rouge très sombre
  couleurLutin(1, 1, 28, 31, 20); // palette 1, indice 1 : vert pâle
  couleurLutin(1, 2,  4, 26,  2); // palette 1, indice 2 : vert
  couleurLutin(1, 3,  0,  8,  0); // palette 1, indice 3 : vert très sombre

  texte(1, 1, "DEUX FRERES");

  sprite(0, 40, 70, HEROS);       // Lutin 0 au pixel (40, 70)...
  teindreLutin(0, 0);             // ... en palette 0 : rouge. Il ne bougera plus.

  uint8_t x = 60;                 // La place du frère vert, en pixels.

  while (true) {                  // La boucle du jeu :
    image();

    if (images() % 4 == 0 && x < 150) x++;   // Une image sur 4, et pas trop loin : + 1 pixel.
    sprite(1, x, 70, HEROS);      // Lutin 1, reposé à sa place à chaque image...
    teindreLutin(1, 1);          // après CHAQUE sprite() : sinon il redevient rouge
  }
}
`,
    aVoir: 'Deux petits personnages : un rouge immobile, un vert qui avance — et qui reste vert.',
    controle: (c) => {
      const rouge = couleur(c, 43, 72)     // rangée 2, colonne 3 : un indice 2
      c.avancer(60)
      const x = c.lutin(1).x
      const vert = couleur(c, x + 3, 72)
      return [
        ['le premier est rouge', rouge === '31/4/2', ` (${rouge})`],
        ['le second a bougé', x > 60, ` (x = ${x})`],
        ['et il est toujours vert', vert === '4/26/2', ` (${vert})`],
        ['le coin reste transparent', couleur(c, 40, 70) === couleur(c, 30, 70)],
      ]
    },
  },

  {
    titre: 'Animer les couleurs : l’eau qui scintille',
    difficulte: 8,
    provenance: 'cours',
    idee: 'Faire tourner trois couleurs d’une palette, et toute une mer ondule — sans redessiner une tuile.',
    texte: [
      'Toutes les cases teintes en palette 1 changent **ensemble** quand on change la palette 1. C’est la ruse de l’**animation de palette** : une mer de 60 cases ondule, et l’on n’a écrit que **trois couleurs**.',
      'Les trois bleus sont rangés dans trois tables, `ROUGES`, `VERTS` et `BLEUS` — pas `R`, `V`, `B` : `B` est déjà le nom du bouton B, et le compilateur le refuse. Tous les 10 tours, `decalage` avance d’un cran, et chaque indice prend la couleur **suivante** : `(i + decalage) % 3`. Le modulo fait tourner la liste en rond — le bleu clair passe à l’indice 2, le moyen à l’indice 3, le sombre revient à l’indice 1.',
      'Redessiner 60 tuiles demanderait 60 écritures, chacune attendant sa pause (chapitre 3), et cela à chaque image de l’animation. Changer trois couleurs n’en coûte presque rien. C’est ainsi que les jeux font scintiller l’eau, luire la lave, clignoter un néon ou tomber la nuit.',
      'Même idée qu’au fondu du chapitre 7 : **on ne touche pas au dessin, on change sa lecture.**',
      '**À toi :** fais un coucher de soleil — le ciel qui passe lentement du bleu à l’orange, puis au violet.',
    ],
    code: `// CE PROGRAMME (Game Boy Color) : une mer de vagues qui scintille.
//
// L'astuce (« animation de palette ») : on ne redessine AUCUNE tuile.
// On fait tourner trois bleus entre les indices 1, 2 et 3 de la palette 1 :
// toutes les cases teintes en palette 1 changent ensemble.

#include <Tuile>         // un dessin de 8 × 8 pixels
#include <couleurFond>   // choisit une couleur d’une palette du fond
#include <ecran>         // éteint ou rallume l’écran
#include <texte>         // écrit un texte à l’écran
#include <poser>         // pose une tuile sur une case du fond
#include <teindre>       // met une case du fond dans une palette
#include <reste>         // a % b, sauf par 1, 2, 4, 8, 16… écrits en clair

Tuile VAGUE = {                   // Des bandes en diagonale d'indices 1, 2, 3.
  "11112222", "11222233", "12223333", "22233331",
  "22333311", "23333111", "33331112", "33311122",
};

// Trois bleus, du clair au sombre. Chaque table donne une lumière :
//                          bleu 0  bleu 1  bleu 2
const uint8_t ROUGES[] = {  8,  2,  0 };
const uint8_t VERTS[]  = { 24, 14,  6 };
const uint8_t BLEUS[]  = { 31, 28, 18 };
// (Pas R, V, B : B est déjà le nom du bouton B, le compilateur refuserait.)

int main() {                          // Le jeu commence ici.
  couleurFond(1, 0, 31, 31, 31);      // Palette 1, indice 0 : blanc.

  ecran(0);                           // Dessin écran éteint.
  texte(3, 2, "LA MER BOUGE");
  for (uint8_t l = 6; l < 12; l++) {  // Lignes 6 à 11,
    for (uint8_t c = 0; c < 20; c++) {  // toute la largeur :
      poser(c, l, VAGUE);             //   une vague,
      teindre(c, l, 1);               //   en palette 1. 6 × 20 = 120 cases.
    }
  }
  ecran(1);                           // On rallume.

  uint8_t decalage = 0;               // De combien on fait tourner les bleus : 0, 1 ou 2.
  uint8_t attente = 0;                // Compte les images jusqu'à 10.

  while (true) {                      // La boucle du jeu :
    image();

    attente++;
    if (attente == 10) {              // Toutes les 10 images :
      attente = 0;
      decalage = (decalage + 1) % 3;  // 0 → 1 → 2 → 0 → 1 ... (le reste par 3 tourne en rond)
    }

    // Les teintes 1, 2, 3 prennent les trois bleus, décalés.
    for (uint8_t i = 0; i < 3; i++) {       // i = 0, 1, 2
      uint8_t k = (i + decalage) % 3;       // quel bleu pour cet indice.
                                            // decalage = 1 : i = 0 → k = 1 ; i = 1 → 2 ; i = 2 → 0.
      couleurFond(1, i + 1, ROUGES[k], VERTS[k], BLEUS[k]);  // l'indice i + 1 (1, 2, 3)
    }                                                         // reçoit le bleu numéro k.
  }
}
`,
    aVoir: 'Une mer de vagues bleues qui scintille : les bleus tournent, les tuiles ne bougent pas.',
    controle: (c) => {
      const vus = new Set()
      const tuile = c.lire(5, 8)
      for (let k = 0; k < 40; k++) { c.avancer(1); vus.add(couleur(c, 40, 48)) }
      return [
        ['le même pixel passe par les trois bleus', vus.size === 3, ` (${[...vus].join('  ')})`],
        ['ce sont bien les bleus de la table', [...vus].every((v) => ['8/24/31', '2/14/28', '0/6/18'].includes(v))],
        ['la tuile, elle, n’a pas changé', c.lire(5, 8) === tuile],
      ]
    },
  },

  {
    titre: 'Un jeu lisible en couleur comme en nuances',
    difficulte: 8,
    provenance: 'cours',
    idee: 'Dessiner d’abord en quatre nuances, colorier ensuite : un jeu qui se lit toujours.',
    texte: [
      'On choisit **une** console en haut de l’atelier : **« En couleur »** donne une cartouche `.gbc`, **« Game Boy »** un `.gb` en quatre nuances. Mais les couleurs ne changent rien aux **dessins** : une tuile garde ses indices de 0 à 3, et la palette seule dit quelle couleur montre chaque indice.',
      'D’où la règle d’or : **dessine d’abord en quatre nuances**, avec des contrastes qui se lisent (chapitre 7), **puis** choisis les couleurs. Un rouge et un vert de même clarté se confondent pour qui voit mal les couleurs, sur un écran terne, ou en photo noir et blanc : un jeu qui ne se lit qu’en couleur est un jeu fragile.',
      'Ici, le héros est dessiné avec un contour en 3, le sol avec une surface en 1 et 2 : il se détache du décor par la **clarté**, pas seulement par la couleur. En couleur, il est rouge sur un sol vert ; en nuances, sombre sur clair.',
      'Pour vérifier **sans** changer de console : les **réglages** de l’atelier (⚙) ont une case « Voir en quatre nuances », qui montre la cartouche couleur telle qu’une Game Boy d’origine l’afficherait.',
      'Une vraie **Game Boy Advance** lit aussi les cartouches `.gbc`, en couleur.',
      '**À toi :** active « Voir en quatre nuances » et vérifie que ton héros se distingue toujours du sol.',
    ],
    code: `// CE PROGRAMME : un héros rouge sur un sol vert, qu'on déplace avec GAUCHE / DROITE.
// Il reste lisible même sans couleurs : il est SOMBRE (contour en 3) sur un
// sol CLAIR (1 et 2). La règle d'or : dessiner d'abord en 4 nuances, puis colorer.

#include <Tuile>          // un dessin de 8 × 8 pixels
#include <couleurFond>    // choisit une couleur d’une palette du fond
#include <couleurLutin>   // choisit une couleur d’une palette des lutins
#include <ecran>          // éteint ou rallume l’écran
#include <texte>          // écrit un texte à l’écran
#include <poser>          // pose une tuile sur une case du fond
#include <teindre>        // met une case du fond dans une palette
#include <bouton>         // lit un bouton de la manette
#include <sprite>         // place un lutin de 8 × 8 au pixel près
#include <teindreLutin>   // met un lutin dans une palette

Tuile HEROS = {                   // 0 transparent, 3 = le contour sombre.
  "00333300",
  "03222230",
  "32122123",
  "32222223",
  "03222230",
  "00333300",
  "03300330",
  "33000033",
};

Tuile SOL = {                     // Une surface claire (1), puis du 2.
  "11111111", "12121212", "22222222", "22222222",
  "22222222", "22222222", "22222222", "22222222",
};

int main() {                      // Le jeu commence ici.
  // La couleur : les palettes de la Game Boy Color
  // (sur une Game Boy d'origine, on verrait les 4 nuances à la place).
  couleurFond(0, 0, 20, 28, 31);          // le ciel     (palette 0, indice 0)
  couleurFond(0, 3,  2,  4, 12);          // le texte    (palette 0, indice 3)
  couleurFond(1, 1, 16, 30,  8);          // le sol      (palette 1, indice 1 : vert clair)
  couleurFond(1, 2,  4, 18,  2);          //             (palette 1, indice 2 : vert)
  couleurLutin(0, 1, 31, 28, 20);         // le héros    (palette 0 des lutins)
  couleurLutin(0, 2, 31,  4,  2);         //             rouge
  couleurLutin(0, 3, 10,  0,  0);         //             contour très sombre

  ecran(0);                       // Dessin écran éteint.
  texte(1, 1, "GAUCHE DROITE");
  for (uint8_t c = 0; c < 20; c++) {      // Toute la largeur,
    for (uint8_t l = 12; l < 18; l++) {   // lignes 12 à 17 :
      poser(c, l, SOL);                   //   le sol,
      teindre(c, l, 1);                   //   en palette 1.
    }
  }
  ecran(1);                       // On rallume.

  uint8_t x = 76;                 // La place du héros, en pixels.

  while (true) {                  // La boucle du jeu :
    image();

    if (bouton(DROITE) && x < 152) x++;   // à droite, jusqu'au pixel 152
    if (bouton(GAUCHE) && x > 8) x--;     // à gauche, jusqu'au pixel 8

    sprite(0, x, 88, HEROS);      // Le héros, posé juste au-dessus du sol (88 = 11 × 8).
    teindreLutin(0, 0);           // Après sprite() : sa palette (0).
  }
}
`,
    aVoir: 'Un héros rouge sur un sol vert, que GAUCHE et DROITE déplacent ; avec « Voir en quatre nuances », un héros sombre sur un sol clair.',
    controle: (c) => {
      const x0 = c.lutin(0).x
      c.presser('right', 20)
      const x1 = c.lutin(0).x
      const heros = couleur(c, x1 + 3, 91)
      const sol = couleur(c, 20, 12 * 8 + 3)
      return [
        ['la cartouche est en couleur', c.gb.ppu.couleur === true],
        ['DROITE déplace le héros', x1 > x0, ` (${x0} puis ${x1})`],
        ['le héros est rouge', heros === '31/4/2', ` (${heros})`],
        ['le sol est vert', sol === '4/18/2', ` (${sol})`],
      ]
    },
  },
  /* ================================================ 9 — le mouvement et les lutins */

  {
    titre: 'Au pixel près : le lutin glisse',
    difficulte: 9,
    provenance: 'cours',
    idee: 'Une lettre saute de case en case, 8 pixels d’un coup ; un lutin avance d’un seul pixel.',
    texte: [
      'Jusqu’ici, presque tout bougeait **case par case** : `texte()` et `poser()` écrivent dans la grille du fond, 20 colonnes sur 18 lignes. Une case fait **8 × 8 pixels** : passer d’une case à la suivante, c’est un saut de 8 pixels. À l’œil, ça **saute**.',
      'Un **lutin** (chapitre 7) ne vit pas dans la grille. `sprite(0, x, y, HEROS)` le pose **au pixel près** : `x` va de 0 (tout à gauche) à 152 (tout à droite : 160 pixels de large, moins les 8 du lutin), `y` de 0 à 136. Ajouter 1 à `x`, c’est avancer d’**un seul pixel** : le mouvement devient doux.',
      '**Ce qui est nouveau ici : une seule variable, deux façons de la montrer.** `x` compte en pixels. Le lutin est posé à `x`. Le O, lui, est écrit à la colonne `x / 8` : la division entière du chapitre 1 range le pixel dans sa case. De 0 à 7 → case 0 ; de 8 à 15 → case 1 ; 76 / 8 = 9 (reste 4) → case 9.',
      'Pousse DROITE et regarde : le lutin glisse, et le O ne bouge qu’**un pas sur huit**, d’un bloc. C’est toute la différence entre un jeu de cases (le snake, un jeu de plateau) et un jeu d’action (Mario, Zelda).',
      '`case_o` retient la colonne où le O est écrit. On ne réécrit le O **que quand `x / 8` change** : `texte()` attend une pause de la console (chapitre 3), et le lutin, lui, n’attend rien. Réécrire le O à chaque image, ce serait du travail pour rien.',
      '**À toi :** ajoute HAUT et BAS, avec `y`, et fais suivre le O sur les lignes avec `y / 8`.',
    ],
    code: `// CE PROGRAMME : GAUCHE / DROITE déplacent un héros AU PIXEL près (il glisse),
// et un O qui, lui, avance CASE par case (il saute de 8 pixels d'un coup).
//
// Rappel : l'écran fait 160 × 144 pixels, soit 20 × 18 cases de 8 × 8.
// Ce qui est nouveau : une seule variable x (en pixels), montrée de deux façons :
//   le lutin est posé à x ; le O est écrit à la colonne x / 8.

// Le héros : un lutin de 8 x 8 pixels.
// Les points sont l'indice 0 : chez un lutin, ils sont TRANSPARENTS.

#include <Tuile>    // un dessin de 8 × 8 pixels
#include <texte>    // écrit un texte à l’écran
#include <bouton>   // lit un bouton de la manette
#include <sprite>   // place un lutin de 8 × 8 au pixel près

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

uint8_t x = 76;        // la position du lutin, EN PIXELS : 0 à gauche ... 152 à droite
                       // (160 pixels de large, moins les 8 du lutin)
uint8_t case_o = 9;    // la colonne où le O est écrit en ce moment : 76 / 8 = 9

int main() {                   // Le jeu commence ici.
  texte(1, 1, "EN CASES : 8 PIXELS");
  texte(1, 7, "EN PIXELS : 1 PIXEL");
  texte(case_o, 4, "O");       // le O, dans la grille du fond (ligne 4)

  while (true) {               // La boucle du jeu :
    image();                   // une image : 60 par seconde

    // Le pixel : un de plus, ou un de moins, à chaque image.
    if (bouton(DROITE) && x < 152) x++;
    if (bouton(GAUCHE) && x > 0) x--;

    // Le lutin suit x au pixel près (ligne de pixels 80 : sous le texte).
    sprite(0, x, 80, HEROS);

    // La case : x / 8 (division entière). Le O ne change de place que quand elle change.
    // x de 72 à 79 → case 9 ; x de 80 à 87 → case 10 ; etc.
    if (x / 8 != case_o) {
      texte(case_o, 4, " ");   // on efface l'ancien O
      case_o = x / 8;          // la nouvelle case : 77 / 8 = 9, 80 / 8 = 10 ...
      texte(case_o, 4, "O");   // et on l'écrit là
    }
  }
}
`,
    aVoir: 'Un O dans la grille, un petit héros en dessous. DROITE et GAUCHE : le héros glisse pixel par pixel, le O saute de case en case.',
    controle: (c) => {
      const x0 = c.lutin(0).x
      c.gb.setButton('right', true)
      const xs = []
      for (let k = 0; k < 24; k++) { c.avancer(1); xs.push(c.lutin(0).x) }
      c.gb.setButton('right', false)
      c.avancer(10)
      const pasDeUn = xs.slice(1).every((x, k) => x - xs[k] <= 1)
      const x1 = c.variable('x')
      const o = c.mot(0, 4, 20).indexOf('O')
      return [
        ['le lutin part du pixel 76', x0 === 76],
        ['il avance d’un pixel à la fois', pasDeUn && x1 > x0 + 10, ` (${x0} puis ${x1})`],
        ['le lutin est bien à x', c.lutin(0).x === x1],
        ['le O est dans la case x / 8', o === Math.floor(x1 / 8), ` (case ${o}, x ${x1})`],
      ]
    },
  },

  {
    titre: 'La vitesse : un pas toutes les N images',
    difficulte: 9,
    provenance: 'cours',
    idee: 'Un pixel par image, c’est 60 pixels par seconde. Pour aller moins vite, on n’avance pas à chaque image.',
    texte: [
      'La leçon d’avant avançait d’un pixel **à chaque image** : 60 pixels par seconde, l’écran traversé en moins de trois secondes. C’est vif. Un personnage qui marche lentement, une tortue, un nuage, doivent aller **moins vite**.',
      'On ne peut pas avancer d’un demi-pixel. Alors on **saute des images** : on n’avance qu’**une image sur N**. Une sur 2 : 30 pixels par seconde. Une sur 4 : 15.',
      '**Ce qui est nouveau ici : `lenteur`, une variable qui règle la vitesse.** `attente` compte les images ; quand elle atteint `lenteur`, on la remet à 0 et on fait **un pas**. C’est la montre du chapitre 3 (« une boucle qui dure plusieurs images »), mise au service du mouvement.',
      'Déroulons avec `lenteur = 4` : image 1, `attente` vaut 1 → rien. Image 2 → 2, rien. Image 3 → 3, rien. Image 4 → 4 : **un pas**, et `attente` revient à 0. Un pas toutes les 4 images.',
      'A règle `lenteur` à 1 (le plus rapide : un pas par image), B à 4 (quatre fois plus lent). Pour aller **plus vite** qu’un pixel par image, on ferait `x = x + 2` : deux pixels d’un coup. Au-delà de 3 ou 4 pixels, l’œil recommence à voir des sauts.',
      '**À toi :** donne à GAUCHE et DROITE deux lenteurs différentes — un personnage qui recule plus lentement qu’il n’avance.',
    ],
    code: `// CE PROGRAMME : GAUCHE / DROITE déplacent un héros ; A le rend rapide,
// B le rend lent.
//
// Ce qui est nouveau : régler la VITESSE. On ne peut pas avancer d'un demi-pixel ;
// alors on n'avance qu'une image sur « lenteur ».
//   lenteur = 1 : un pas par image          → 60 pixels par seconde
//   lenteur = 4 : un pas toutes les 4 images → 15 pixels par seconde

#include <Tuile>    // un dessin de 8 × 8 pixels
#include <texte>    // écrit un texte à l’écran
#include <bouton>   // lit un bouton de la manette
#include <sprite>   // place un lutin de 8 × 8 au pixel près

Tuile HEROS = {               // . = transparent, - = clair, # = sombre
  "..####..",
  ".#-##-#.",
  "########",
  "#.####.#",
  "########",
  "..#..#..",
  ".#....#.",
  "##....##",
};

uint8_t x = 20;          // la position, en pixels
uint8_t lenteur = 4;     // un pas toutes les 4 images, au départ
uint8_t attente = 0;     // les images comptées depuis le dernier pas

int main() {                           // Le jeu commence ici.
  texte(1, 1, "A: RAPIDE  1");
  texte(1, 2, "B: LENT    4");

  while (true) {                       // La boucle du jeu :
    image();

    if (bouton(A)) lenteur = 1;        // un pas à chaque image : 60 pixels par seconde
    if (bouton(B)) lenteur = 4;        // un pas toutes les 4 images : 15 par seconde

    attente++;                         // une image de plus
    if (attente >= lenteur) {          // c'est le moment d'un pas ?
                                       // Avec lenteur = 4 : images 1, 2, 3 → non ; 4 → oui.
      attente = 0;                     // oui : on recommence à compter
      if (bouton(DROITE) && x < 152) x++;   // un pixel à droite
      if (bouton(GAUCHE) && x > 0) x--;     // un pixel à gauche
    }

    sprite(0, x, 72, HEROS);           // On pose le héros à sa place, à chaque image.
  }
}
`,
    aVoir: 'Un héros que DROITE et GAUCHE déplacent lentement ; après A, il file quatre fois plus vite ; B le ralentit de nouveau.',
    controle: (c) => {
      const mesurer = () => {
        const avant = c.variable('x')
        c.gb.setButton('right', true)
        c.avancer(40)
        c.gb.setButton('right', false)
        c.avancer(2)
        return c.variable('x') - avant
      }
      const lent = mesurer()
      c.presser('a', 3)
      const rapide = mesurer()
      c.presser('b', 3)
      const denouveau = mesurer()
      return [
        ['lent : environ un pixel toutes les 4 images', lent >= 9 && lent <= 11, ` (${lent} pixels en 40 images)`],
        ['après A : un pixel par image', rapide >= 38 && rapide <= 40, ` (${rapide} pixels en 40 images)`],
        ['B le ralentit de nouveau', denouveau >= 9 && denouveau <= 11, ` (${denouveau})`],
      ]
    },
  },

  {
    titre: 'Animer : deux dessins pour marcher',
    difficulte: 9,
    provenance: 'cours',
    idee: 'Un personnage qui glisse sans bouger les jambes a l’air d’un meuble. Deux dessins, alternés, et il marche.',
    texte: [
      'Une animation, au cinéma comme sur Game Boy, n’est qu’une suite d’images fixes montrées vite. Pour marcher, **deux dessins** suffisent : jambes écartées, jambes serrées.',
      '**Ce qui est nouveau ici : le lutin change de dessin.** `sprite(0, x, y, PAS1)` ou `sprite(0, x, y, PAS2)` : le même lutin n° 0, au même endroit, mais une autre tuile. La console ne redessine rien : elle lit simplement une autre tuile.',
      '`dessin` vaut 0 ou 1 : lequel des deux montrer. `compte` compte les images ; toutes les 8 images, `dessin = 1 - dessin` le fait **basculer** : 1 - 0 = 1, puis 1 - 1 = 0, puis 1 - 0 = 1… Un interrupteur en une ligne.',
      'Quand aucune flèche n’est enfoncée, on remet `dessin` à 0 : le héros s’arrête **debout**, sur son premier dessin, et pas figé au milieu d’un pas.',
      'Pourquoi 8 images ? À chaque image, les jambes battraient 30 fois par seconde : un tremblement. Toutes les 30 images, le héros aurait l’air de glisser entre deux pas. Entre 6 et 12 images, l’œil voit une marche.',
      '**À toi :** ajoute un troisième dessin (`PAS3`) et fais tourner `dessin` de 0 à 2 avec `dessin = (dessin + 1) % 3`.',
    ],
    code: `// CE PROGRAMME : un héros qui MARCHE : quand il avance, ses jambes s'animent
// (deux dessins qui alternent) ; à l'arrêt, il est debout.
//
// Ce qui est nouveau : changer le dessin d'un lutin. Le même lutin n° 0,
// au même endroit, reçoit tantôt la tuile PAS1, tantôt la tuile PAS2.

// Deux dessins : jambes écartées, jambes serrées. Le haut est le même.

#include <Tuile>    // un dessin de 8 × 8 pixels
#include <texte>    // écrit un texte à l’écran
#include <bouton>   // lit un bouton de la manette
#include <sprite>   // place un lutin de 8 × 8 au pixel près

Tuile PAS1 = {
  "..####..",
  ".#-##-#.",
  "########",
  "#.####.#",
  "########",
  "..#..#..",
  ".#....#.",
  "##....##",
};

Tuile PAS2 = {
  "..####..",
  ".#-##-#.",
  "########",
  "#.####.#",
  "########",
  "..#..#..",
  "..#..#..",
  "..##.##.",
};

uint8_t x = 76;         // La place du héros, en pixels.
uint8_t dessin = 0;     // 0 : PAS1, 1 : PAS2
uint8_t compte = 0;     // les images depuis le dernier changement de dessin

int main() {                                   // Le jeu commence ici.
  texte(1, 1, "GAUCHE  DROITE");

  while (true) {                               // La boucle du jeu :
    image();

    uint8_t bouge = 0;                         // 1 si le héros avance cette image
    if (bouton(DROITE) && x < 152) { x++; bouge = 1; }   // Deux instructions entre
    if (bouton(GAUCHE) && x > 0)   { x--; bouge = 1; }   // accolades : les deux se font.

    if (bouge) {                 // Il marche :
      compte++;
      if (compte >= 8) {         // toutes les 8 images ...
        compte = 0;
        dessin = 1 - dessin;     // ... on bascule : 0 -> 1 -> 0 -> 1
                                 // (1 - 0 = 1, puis 1 - 1 = 0 : un interrupteur)
      }
    } else {                     // Il ne marche pas :
      dessin = 0;                // à l'arrêt : debout, sur le premier dessin
      compte = 0;
    }

    if (dessin == 0) {           // On pose le lutin avec le bon dessin.
      sprite(0, x, 72, PAS1);
    } else {
      sprite(0, x, 72, PAS2);
    }
  }
}
`,
    aVoir: 'Un héros immobile ; avec DROITE ou GAUCHE, ses jambes battent pendant qu’il avance.',
    controle: (c) => {
      const auRepos = c.lutin(0).tuile
      c.gb.setButton('right', true)
      const tuiles = new Set()
      for (let k = 0; k < 40; k++) { c.avancer(1); tuiles.add(c.lutin(0).tuile) }
      c.gb.setButton('right', false)
      c.avancer(5)
      return [
        ['en marchant, le lutin montre deux dessins', tuiles.size === 2, ` (${tuiles.size})`],
        ['à l’arrêt, il revient à son premier dessin', c.lutin(0).tuile === auRepos && c.variable('dessin') === 0],
      ]
    },
  },

  {
    titre: 'Regarder à gauche ou à droite : le miroir',
    difficulte: 9,
    provenance: 'cours',
    idee: 'Un seul dessin, tourné vers la droite ; la console le retourne pour aller à gauche.',
    texte: [
      'Un héros qui recule **de face** et avance de face a l’air de reculer. Il doit **regarder** où il va. On pourrait dessiner une seconde tuile, tournée vers la gauche ; il y a mieux : la console sait **retourner** un lutin, sans rien dessiner.',
      '**Ce qui est nouveau ici : le 5e argument de `sprite()`, `MIROIR_X`.** `sprite(0, x, y, HEROS, MIROIR_X)` montre le dessin **retourné de gauche à droite**, comme dans un miroir. `MIROIR_Y` le retourne de haut en bas (un personnage qui tombe la tête en bas).',
      'On range ce choix dans une **variable**, `regard` : `0` pour « tel quel » (vers la droite), `MIROIR_X` pour « retourné » (vers la gauche). GAUCHE met `regard = MIROIR_X`, DROITE le remet à 0. On le passe à `sprite()` à chaque image.',
      'Remarque ce qui se passe quand on **lâche** la flèche : rien ne remet `regard` à 0. Le héros reste tourné **du côté où il allait**. C’est ce que font tous les jeux : une variable retient la dernière direction.',
      'Le retournement ne coûte rien : c’est un bit dans les quatre octets qui décrivent chaque lutin à la console. Un seul dessin sert aux deux côtés, la moitié de la mémoire à dessiner.',
      '**À toi :** avec HAUT, mets `regard = MIROIR_Y` et regarde ton héros la tête en bas.',
    ],
    code: `// CE PROGRAMME : un héros qui regarde du côté où il va : à droite avec DROITE,
// à gauche avec GAUCHE. Quand on lâche, il garde la dernière direction.
//
// Ce qui est nouveau : le 5e argument de sprite(), MIROIR_X.
//   sprite(0, x, y, HEROS, MIROIR_X) montre le dessin retourné de gauche à droite.
//   Un seul dessin sert donc pour les deux côtés.

// Le héros regarde à DROITE : son œil et son nez sont du côté droit.

#include <Tuile>    // un dessin de 8 × 8 pixels
#include <texte>    // écrit un texte à l’écran
#include <bouton>   // lit un bouton de la manette
#include <sprite>   // place un lutin de 8 × 8 au pixel près

Tuile HEROS = {
  "..####..",
  ".######.",
  ".####-#.",
  ".#######",
  ".####...",
  "..###...",
  "..#.#...",
  ".##.##..",
};

uint8_t x = 76;         // La place du héros, en pixels.
uint8_t regard = 0;     // 0 : vers la droite (tel quel), MIROIR_X : vers la gauche

int main() {                  // Le jeu commence ici.
  texte(1, 1, "GAUCHE  DROITE");

  while (true) {              // La boucle du jeu :
    image();

    if (bouton(DROITE) && x < 152) {
      x++;
      regard = 0;             // tel quel : il regarde à droite
    }
    if (bouton(GAUCHE) && x > 0) {
      x--;
      regard = MIROIR_X;      // retourné : il regarde à gauche
    }
    // Aucune flèche : rien ne change regard. Il garde la dernière direction.

    // Le 5e argument : 0 ou MIROIR_X, selon la dernière direction.
    sprite(0, x, 72, HEROS, regard);
  }
}
`,
    aVoir: 'Un héros tourné vers la droite ; GAUCHE le retourne, et il reste tourné vers la gauche quand on lâche.',
    controle: (c) => {
      const attributs = () => c.gb.mmu.read(0xfe03)
      const auDebut = attributs() & 0x20
      c.presser('left', 10)
      const aGauche = attributs() & 0x20
      c.avancer(20)
      const resteAGauche = attributs() & 0x20
      c.presser('right', 10)
      const aDroite = attributs() & 0x20
      return [
        ['au départ, le héros est tel quel', auDebut === 0],
        ['GAUCHE le retourne', aGauche === 0x20],
        ['il reste retourné quand on lâche', resteAGauche === 0x20],
        ['DROITE le remet tel quel', aDroite === 0],
      ]
    },
  },
  /* ================================================ 10 — les collisions */

  {
    titre: 'Deux boîtes qui se touchent',
    difficulte: 10,
    provenance: 'cours',
    idee: 'Deux lutins se touchent si leurs carrés se chevauchent : quatre comparaisons, pas une de plus.',
    texte: [
      'Ramasser une pièce, se faire toucher par un ennemi, recevoir une flèche : c’est toujours la même question. **Deux lutins se touchent-ils ?** Au pixel près, on ne peut plus demander « sont-ils dans la même case ? » : il faut comparer des **boîtes**.',
      'Chaque lutin occupe un carré de 8 × 8 pixels. Le héros va de `x` à `x + 7` en largeur, la pièce de `px` à `px + 7`. Ils se chevauchent en largeur **si aucun des deux n’est entièrement à côté de l’autre** : le héros commence avant la fin de la pièce (`x < px + 8`) **et** la pièce commence avant la fin du héros (`px < x + 8`).',
      'Exemple chiffré : héros en `x = 60`, pièce en `px = 66`. 60 < 74 : oui. 66 < 68 : oui. Ils se chevauchent (sur 2 pixels, de 66 à 67). Héros en `x = 50` : 66 < 58 ? non — la pièce commence après la fin du héros. Pas de contact.',
      '**Ce qui est nouveau ici : `touche()`, quatre comparaisons liées par `&&`.** Deux pour la largeur, deux pour la hauteur, avec les mêmes règles sur `y` et `py`. Les quatre doivent être vraies : si une seule est fausse, les boîtes sont séparées par au moins une ligne ou une colonne de pixels.',
      'Quand ça touche, `score` augmente et la pièce **saute** à la place suivante d’une table gravée (chapitre 4). `(i + 1) % 3` fait tourner `i` sur 0, 1, 2, 0, 1… : le modulo du chapitre 1.',
      '**À toi :** rétrécis la boîte de la pièce (compare avec `px + 2` et `px + 6`) : il faut alors vraiment marcher dessus. Beaucoup de jeux donnent aux objets une boîte plus petite que leur dessin, pour être justes avec le joueur.',
    ],
    code: `// CE PROGRAMME : un héros qu'on déplace avec les 4 flèches ramasse une pièce.
// Quand il la touche, le score monte et la pièce saute à une autre place.
//
// Ce qui est nouveau : la collision de deux BOÎTES.
//   Chaque lutin est un carré de 8 × 8 pixels : le héros va de x à x + 7.
//   Deux carrés se touchent en largeur si CHACUN commence avant la fin de l'autre :
//     x < px + 8   ET   px < x + 8
//   Pareil en hauteur avec y. Il faut les 4 conditions vraies.
//   Exemple : héros x = 60, pièce px = 66 : 60 < 74 oui, 66 < 68 oui → contact.
//             héros x = 50 : 66 < 58 ? non → pas de contact.

#include <Tuile>    // un dessin de 8 × 8 pixels
#include <texte>    // écrit un texte à l’écran
#include <nombre>   // écrit un nombre en chiffres
#include <bouton>   // lit un bouton de la manette
#include <sprite>   // place un lutin de 8 × 8 au pixel près
#include <reste>    // a % b, sauf par 1, 2, 4, 8, 16… écrits en clair

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

Tuile PIECE = {
  "..####..",
  ".#----#.",
  "#-#--#-#",
  "#-#--#-#",
  "#-#--#-#",
  "#-#--#-#",
  ".#----#.",
  "..####..",
};

// Les trois places de la pièce, l'une après l'autre (en pixels).
//                     place 0  1    2
const uint8_t PX[] = { 120,  24,  80 };   // x de chaque place
const uint8_t PY[] = {  72, 104,  40 };   // y de chaque place

uint8_t x = 40;          // le héros, en pixels
uint8_t y = 72;
uint8_t i = 0;           // la place de la pièce en ce moment : 0, 1 ou 2
uint8_t score = 0;

// 1 si la boîte du héros chevauche celle de la pièce, 0 sinon.
uint8_t touche() {
  return x < PX[i] + 8 && PX[i] < x + 8     // en largeur
      && y < PY[i] + 8 && PY[i] < y + 8;    // et en hauteur
}

int main() {                   // Le jeu commence ici.
  texte(1, 1, "SCORE");
  nombre(7, 1, score);

  while (true) {               // La boucle du jeu :
    image();

    if (bouton(DROITE) && x < 152) x++;   // les 4 flèches, sans sortir de l'écran
    if (bouton(GAUCHE) && x > 0) x--;
    if (bouton(BAS) && y < 136) y++;
    if (bouton(HAUT) && y > 16) y--;      // pas plus haut que 16 : la ligne du score

    if (touche()) {            // Contact ?
      score++;
      i = (i + 1) % 3;         // la pièce saute à la place suivante : 0 → 1 → 2 → 0 ...
      nombre(7, 1, score);     // on n'écrit le score QUE quand il change
    }

    sprite(0, x, y, HEROS);           // lutin 0 : le héros
    sprite(1, PX[i], PY[i], PIECE);   // lutin 1 : la pièce, à sa place actuelle
  }
}
`,
    aVoir: 'Un héros et une pièce sur la même ligne ; en marchant dessus, le score monte et la pièce saute ailleurs.',
    controle: (c) => {
      const avant = c.variable('score')
      let contactX = null
      c.gb.setButton('right', true)
      for (let k = 0; k < 200 && c.variable('score') === avant; k++) { c.avancer(1); contactX = c.variable('x') }
      c.gb.setButton('right', false)
      c.avancer(5)
      return [
        ['au départ, le score est 0', avant === 0],
        ['en marchant sur la pièce, le score monte', c.variable('score') === 1],
        ['le contact arrive quand les boîtes se chevauchent : x = 113', contactX === 113, ` (x = ${contactX})`],
        ['la pièce a sauté à sa deuxième place', c.lutin(1).x === 24 && c.lutin(1).y === 104],
      ]
    },
  },

  {
    titre: 'Lire la case devant soi : le mur',
    difficulte: 10,
    provenance: 'cours',
    idee: 'Avant de faire un pas, on regarde quelle tuile il y a là où l’on va.',
    texte: [
      'Les murs ne sont pas des lutins : ils sont **dans le décor**, posés avec `poser()`. Pour savoir si le héros peut avancer, on ne compare donc pas des boîtes : on **lit la case** où il va entrer, avec `lire(colonne, ligne)` qui rend la tuile posée là.',
      'Le héros compte en **pixels**, la grille en **cases**. Le pont entre les deux est la division de la leçon « au pixel près » : le pixel `p` est dans la case `p / 8`.',
      '**Ce qui est nouveau ici : lire la case du pixel qu’on va toucher.** Le héros occupe les pixels `x` à `x + 7`. Un pas à droite le fait entrer dans le pixel `x + 8` : on lit la case `(x + 8) / 8`. Un pas à gauche, dans le pixel `x - 1` : on lit la case `(x - 1) / 8`.',
      'Déroulons à droite. Le mur est en colonne 16, qui couvre les pixels 128 à 135. Héros en `x = 119` : son prochain pixel est 127, case 127 / 8 = 15, vide — il avance. En `x = 120` : prochain pixel 128, case 16 : **le mur**. Il s’arrête, collé contre lui, sans le traverser d’un seul pixel.',
      'À gauche, le mur est en colonne 3 (pixels 24 à 31). Le héros s’arrête en `x = 32` : son prochain pixel serait 31, dans le mur.',
      'Le héros est posé sur la ligne de pixels 64 = 8 × 8 : il est **pile** dans la ligne de cases 8. Il n’y a donc qu’une ligne de cases à regarder. La leçon suivante le libère de haut en bas.',
      '**À toi :** pose un deuxième mur en colonne 10 et vérifie que le héros s’y arrête des deux côtés.',
    ],
    code: `// CE PROGRAMME : un héros va à gauche et à droite entre deux murs,
// et s'arrête collé contre eux, sans les traverser.
//
// Ce qui est nouveau : lire la case du décor où l'on va entrer.
//   lire(colonne, ligne) rend la tuile posée dans cette case.
//   Le héros compte en PIXELS, le décor en CASES : le pixel p est dans la case p / 8.
//   Le héros occupe les pixels x à x + 7 :
//     un pas à droite le fait entrer dans le pixel x + 8 → la case (x + 8) / 8 ;
//     un pas à gauche dans le pixel x - 1 → la case (x - 1) / 8.

#include <Tuile>    // un dessin de 8 × 8 pixels
#include <texte>    // écrit un texte à l’écran
#include <poser>    // pose une tuile sur une case du fond
#include <bouton>   // lit un bouton de la manette
#include <lire>     // lit la tuile posée sur une case
#include <sprite>   // place un lutin de 8 × 8 au pixel près

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

// Un bloc de mur, dessiné en quatre nuances.
Tuile MUR = {
  "33333333",
  "31111113",
  "31222213",
  "31222213",
  "31222213",
  "31222213",
  "31111113",
  "33333333",
};

uint8_t x = 76;      // en pixels ; le héros occupe les pixels x à x + 7
uint8_t y = 64;      // 64 = 8 x 8 : pile sur la ligne de cases 8

int main() {                 // Le jeu commence ici.
  texte(1, 1, "GAUCHE  DROITE");
  poser(3, 8, MUR);      // colonne 3 : les pixels 24 à 31
  poser(16, 8, MUR);     // colonne 16 : les pixels 128 à 135

  while (true) {             // La boucle du jeu :
    image();

    // À droite : le prochain pixel est x + 8, dans la case (x + 8) / 8.
    // x = 119 : pixel 127, case 15, vide → il avance.
    // x = 120 : pixel 128, case 16 : le MUR → il s'arrête.
    if (bouton(DROITE) && lire((x + 8) / 8, 8) != MUR) x++;

    // À gauche : le prochain pixel est x - 1, dans la case (x - 1) / 8.
    // x = 32 : pixel 31, case 3 : le MUR → il s'arrête.
    if (bouton(GAUCHE) && lire((x - 1) / 8, 8) != MUR) x--;

    sprite(0, x, y, HEROS);  // On pose le héros à sa place.
  }
}
`,
    aVoir: 'Un héros entre deux blocs de mur ; il avance jusqu’à les toucher, et s’arrête pile contre eux.',
    controle: (c) => {
      tenir(c, 'right', () => false, 120)
      const droite = c.variable('x')
      tenir(c, 'left', () => false, 150)
      const gauche = c.variable('x')
      return [
        ['à droite, il s’arrête contre le mur : x = 120', droite === 120, ` (${droite})`],
        ['à gauche aussi : x = 32', gauche === 32, ` (${gauche})`],
        ['les murs sont toujours là', c.lire(3, 8) !== 0 && c.lire(16, 8) !== 0],
      ]
    },
  },

  {
    titre: 'Glisser le long d’un mur : un axe à la fois',
    difficulte: 10,
    provenance: 'cours',
    idee: 'Tester la largeur, puis la hauteur, séparément : le héros bloqué d’un côté continue de l’autre.',
    texte: [
      'Maintenant le héros va partout, et en diagonale. Il occupe un carré de pixels qui peut chevaucher **deux lignes** de cases, ou **deux colonnes**. Avant d’avancer, on regarde donc **deux coins** : ceux qui vont entrer les premiers dans la case suivante.',
      'Pour ne pas écrire quatre fois `lire(p / 8, q / 8) != MUR`, on en fait une fonction, `libre(px, py)` : « le pixel (px, py) est-il hors d’un mur ? ». Le chapitre 5 dans toute sa force : un nom clair, et chaque test tient en une ligne.',
      'À droite, les deux coins qui entrent sont **en haut à droite** et **en bas à droite** du prochain pas : `(x + 8, y)` et `(x + 8, y + 7)`. À gauche, `(x - 1, y)` et `(x - 1, y + 7)`. En bas, `(x, y + 8)` et `(x + 7, y + 8)`. En haut, `(x, y - 1)` et `(x + 7, y - 1)`.',
      '**Ce qui est nouveau ici : un axe à la fois.** On essaie d’abord le pas en largeur, **puis** le pas en hauteur, chacun avec son test. Pousse DROITE et BAS contre le mur vertical : le pas à droite est refusé, mais le pas vers le bas est accepté. Le héros **glisse** le long du mur au lieu de s’y coller.',
      'Si l’on testait la diagonale d’un coup (« le coin en bas à droite, en `(x + 8, y + 8)`, est-il libre ? »), le moindre mur arrêterait **les deux** mouvements : le héros resterait collé dès qu’il frôle quelque chose. C’est la sensation « poisseuse » des jeux mal réglés.',
      '**À toi :** retire le test des deux coins à droite pour n’en garder qu’un (`libre(x + 8, y)`), et regarde le héros entrer à moitié dans le mur par le bas.',
    ],
    code: `// CE PROGRAMME : un héros se déplace dans les 4 directions, et GLISSE le long
// des murs : bloqué d'un côté, il peut encore avancer de l'autre.
//
// Ce qui est nouveau : tester un axe à la fois.
//   1. d'abord la largeur (gauche / droite),
//   2. puis la hauteur (haut / bas), à part.
// Et pour chaque direction, on teste les DEUX coins du côté où l'on va
// (le héros fait 8 pixels : un seul coin ne suffit pas).

#include <Tuile>    // un dessin de 8 × 8 pixels
#include <lire>     // lit la tuile posée sur une case
#include <ecran>    // éteint ou rallume l’écran
#include <texte>    // écrit un texte à l’écran
#include <poser>    // pose une tuile sur une case du fond
#include <bouton>   // lit un bouton de la manette
#include <sprite>   // place un lutin de 8 × 8 au pixel près

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

Tuile MUR = {
  "33333333", "31111113", "31222213", "31222213",
  "31222213", "31222213", "31111113", "33333333",
};

uint8_t x = 40;             // Le héros, en pixels (coin en haut à gauche).
uint8_t y = 40;

// 1 si le PIXEL (px, py) n'est pas dans un mur.
// Exemple : libre(100, 40) → lire(12, 5) : la colonne 12 est un mur → rend 0.
uint8_t libre(uint8_t px, uint8_t py) {
  return lire(px / 8, py / 8) != MUR;
}

int main() {                // Le jeu commence ici.
  ecran(0);                 // Dessin écran éteint.
  texte(1, 1, "DROITE ET BAS");
  for (uint8_t l = 3; l < 17; l++) poser(12, l, MUR);    // un mur debout, colonne 12
  for (uint8_t c = 0; c < 20; c++) poser(c, 16, MUR);    // le sol, ligne 16
  ecran(1);                 // On rallume.

  while (true) {            // La boucle du jeu :
    image();

    // 1. La largeur : les deux coins du côté où l'on va.
    //    À droite : le coin haut (x + 8, y) et le coin bas (x + 8, y + 7).
    if (bouton(DROITE) && libre(x + 8, y) && libre(x + 8, y + 7)) x++;
    //    À gauche : les deux pixels juste à gauche (x - 1) ; x > 0 évite de passer sous 0.
    if (bouton(GAUCHE) && x > 0 && libre(x - 1, y) && libre(x - 1, y + 7)) x--;

    // 2. Puis la hauteur, à part : bloqué d'un côté, on avance de l'autre.
    //    En bas : les deux pixels juste dessous (y + 8), à gauche (x) et à droite (x + 7).
    if (bouton(BAS) && libre(x, y + 8) && libre(x + 7, y + 8)) y++;
    //    En haut : les deux pixels juste dessus (y - 1) ; pas plus haut que 16.
    if (bouton(HAUT) && y > 16 && libre(x, y - 1) && libre(x + 7, y - 1)) y--;

    sprite(0, x, y, HEROS); // On pose le héros.
  }
}
`,
    aVoir: 'Un mur debout et un sol ; en poussant DROITE et BAS, le héros descend en frôlant le mur, puis s’arrête sur le sol.',
    controle: (c) => {
      c.gb.setButton('right', true)
      c.gb.setButton('down', true)
      c.avancer(60)
      const xColle = c.variable('x')
      const yEnRoute = c.variable('y')
      c.avancer(80)
      c.gb.setButton('right', false)
      c.gb.setButton('down', false)
      c.avancer(5)
      return [
        ['le mur arrête le pas à droite : x = 88', xColle === 88, ` (${xColle})`],
        ['mais le héros continue de descendre', yEnRoute > 60, ` (y = ${yEnRoute})`],
        ['il s’arrête sur le sol : y = 120', c.variable('y') === 120, ` (${c.variable('y')})`],
        ['sans entrer dans le mur', c.variable('x') === 88],
      ]
    },
  },
  /* ================================================ 11 — le hasard et le temps */

  {
    titre: 'Le hasard dans une plage choisie',
    difficulte: 11,
    provenance: 'cours',
    idee: 'hasard() rend 0 à 255 ; « début + hasard() % combien » le range entre deux bornes.',
    texte: [
      '`hasard()` rend un nombre imprévisible de **0 à 255**. On ne veut presque jamais ça : on veut un dé de 1 à 6, une colonne de 2 à 17, une chance sur quatre.',
      '**Ce qui est nouveau ici : la formule `debut + hasard() % combien`.** Le modulo (chapitre 1) rend un reste **de 0 à combien - 1** ; on ajoute le début. Pour un dé : `1 + hasard() % 6` → reste de 0 à 5, plus 1 → **1 à 6**. Pour une colonne de 2 à 17 : il y a 16 colonnes, donc `2 + hasard() % 16` → **2 à 17**.',
      'Exemples chiffrés : si `hasard()` rend 200, 200 % 6 = 2 (car 6 × 33 = 198, reste 2) → face 3. S’il rend 17 : 17 % 6 = 5 → face 6. S’il rend 0 : face 1.',
      '**Un appui, un tirage.** `bouton(A)` reste vrai **tant que** A est enfoncé : plusieurs images de suite, donc plusieurs tirages. On veut un tirage **au moment où on appuie**. `avant` retient l’état de A à l’image d’avant ; `a && !avant` n’est vrai qu’à la première image de l’appui (enfoncé maintenant, relâché avant). On appelle cela un **front**.',
      'Un détail honnête : 256 n’est pas divisible par 6 (256 = 6 × 42 + 4). Les faces 1 à 4 sortent donc 43 fois sur 256, les faces 5 et 6 seulement 42 fois. La différence est minuscule pour un jeu ; elle compterait pour un casino.',
      '**À toi :** tire une chance sur quatre (`hasard() % 4 == 0`) et affiche « BONUS! » quand elle tombe.',
    ],
    code: `// CE PROGRAMME : chaque appui sur A lance un dé (1 à 6) et pose un P
// à une place au hasard sur une piste (colonnes 2 à 17).
//
// Ce qui est nouveau : le hasard DANS UNE PLAGE choisie.
//   hasard() rend un nombre de 0 à 255. La formule :
//     début + hasard() % combien   → un nombre de début à début + combien - 1
//   Un dé : 1 + hasard() % 6   → reste de 0 à 5, plus 1 → 1 à 6.
//   Exemple : hasard() rend 200 → 200 % 6 = 2 (6 × 33 = 198, reste 2) → face 3.

#include <texte>    // écrit un texte à l’écran
#include <nombre>   // écrit un nombre en chiffres
#include <bouton>   // lit un bouton de la manette
#include <hasard>   // tire un nombre au hasard
#include <reste>    // a % b, sauf par 1, 2, 4, 8, 16… écrits en clair

uint8_t de = 1;         // le dernier dé tiré : 1 à 6
uint8_t colonne = 2;    // la dernière colonne tirée : 2 à 17
uint8_t avant = 0;      // A était-il enfoncé à l'image d'avant ?

int main() {                      // Le jeu commence ici.
  texte(1, 1, "A: LANCER");
  texte(1, 4, "DE");
  texte(1, 8, "|                  |");    // la piste : colonnes 1 et 18 sont les bords
  nombre(5, 4, de, 1);            // Le dé, sur 1 chiffre.
  texte(colonne, 8, "P");         // Le P à sa place de départ.

  while (true) {                  // La boucle du jeu :
    image();

    uint8_t a = bouton(A);        // A, maintenant
    if (a && !avant) {            // enfoncé maintenant, pas avant : un FRONT
                                  // (un seul tirage par appui, même si on garde le doigt)
      de = 1 + hasard() % 6;      // reste 0 à 5, plus 1 : 1 à 6
      nombre(5, 4, de, 1);

      texte(colonne, 8, " ");     // efface l'ancien P
      colonne = 2 + hasard() % 16;  // reste 0 à 15, plus 2 : 2 à 17
      texte(colonne, 8, "P");     // dessine le nouveau
    }
    avant = a;                    // on retient A pour l'image suivante
  }
}
`,
    aVoir: 'Un dé et un P sur une piste ; chaque appui sur A tire une face de 1 à 6 et une nouvelle place pour le P, toujours entre les deux bords.',
    controle: (c) => {
      const des = []
      const colonnes = []
      for (let k = 0; k < 40; k++) {
        c.presser('a', 3)
        c.avancer(3)
        des.push(c.variable('de'))
        colonnes.push(c.variable('colonne'))
      }
      const pistes = c.mot(0, 8, 20)
      return [
        ['chaque dé est entre 1 et 6', des.every((d) => d >= 1 && d <= 6), ` (${[...new Set(des)].sort().join(' ')})`],
        ['plusieurs faces sortent', new Set(des).size >= 4],
        ['chaque colonne est entre 2 et 17', colonnes.every((x) => x >= 2 && x <= 17)],
        ['un seul P sur la piste, à sa colonne', pistes.split('P').length === 2 && pistes.indexOf('P') === c.variable('colonne')],
      ]
    },
  },

  {
    titre: 'Une place libre : tirer encore',
    difficulte: 11,
    provenance: 'cours',
    idee: 'Le hasard ne sait pas où sont les murs. On tire, on regarde, et on recommence tant que c’est pris.',
    texte: [
      'On veut semer quinze pièces P dans une salle. Tirer une colonne et une ligne au hasard ne suffit pas : le hasard ne sait rien de l’écran. Il peut tomber **sur un mur**, ou **sur une pièce déjà posée** — on en verrait alors quatorze, et le jeu ne se finirait jamais.',
      '**Ce qui est nouveau ici : tirer jusqu’à trouver une case vide.** C’est exactement le travail de `do … while` (chapitre 3) : **au moins un** tirage, puis on recommence **tant que** la case n’est pas vide. Une case vide, c’est la tuile 0 : `lire(c, l) != 0` veut dire « déjà prise ».',
      'Déroulons une pièce. Premier tirage : (0, 5). `lire(0, 5)` rend un X, le bord : ce n’est pas 0, on retire. Deuxième tirage : (7, 9) : vide. On sort du `do … while` et on pose le P. La pièce suivante ne pourra plus tomber en (7, 9) : `lire` y trouve un P.',
      'Pourquoi ça finit ? Parce qu’il reste beaucoup de cases vides : sur 20 × 18 = 360 cases, il y a une soixantaine de murs et quinze pièces. Même au pire, un tirage sur deux ou trois tombe bien. **Si la salle était pleine, la boucle ne finirait jamais** : un jeu doit toujours garder de la place pour ce qu’il sème.',
      'Tout se fait **écran éteint** (`ecran(0)`) : les quinze pièces et les murs apparaissent d’un coup, sans attendre une pause à chaque écriture.',
      '**À toi :** remplace `do … while` par un seul tirage, et compte les P : de temps en temps, il en manque.',
    ],
    code: `// CE PROGRAMME : une salle bordée de X, avec un mur au milieu, et 15 pièces P
// semées au hasard — jamais sur un X, jamais deux sur la même case.
//
// Ce qui est nouveau : tirer ENCORE tant que la case est prise.
//   do ... while : on tire au moins une fois, puis on recommence
//   tant que lire(c, l) != 0 (0 = case vide ; autre chose = déjà prise).

#include <ecran>    // éteint ou rallume l’écran
#include <texte>    // écrit un texte à l’écran
#include <hasard>   // tire un nombre au hasard
#include <lire>     // lit la tuile posée sur une case
#include <reste>    // a % b, sauf par 1, 2, 4, 8, 16… écrits en clair

const uint8_t PIECES = 15;          // Le nombre de pièces à semer.

int main() {                        // Le jeu commence ici.
  ecran(0);                         // Tout se dessine écran éteint.

  // Le cadre : les bords de l'écran en X.
  for (uint8_t c = 0; c < 20; c++) {  // chaque colonne :
    texte(c, 0, "X");               //   en haut (ligne 0)
    texte(c, 17, "X");              //   en bas (ligne 17)
  }
  for (uint8_t l = 1; l < 17; l++) {  // chaque ligne de 1 à 16 :
    texte(0, l, "X");               //   à gauche (colonne 0)
    texte(19, l, "X");              //   à droite (colonne 19)
  }
  // Et un mur au milieu : ligne 8, colonnes 4 à 15.
  for (uint8_t c = 4; c < 16; c++) texte(c, 8, "X");

  // Quinze pièces, jamais sur un X, jamais sur un P.
  for (uint8_t i = 0; i < PIECES; i++) {  // Pour chaque pièce :
    uint8_t c = 0;                  //   sa colonne,
    uint8_t l = 0;                  //   sa ligne.
    do {                            //   FAIS :
      c = hasard() % 20;          // 0 à 19 : n'importe quelle colonne
      l = hasard() % 18;          // 0 à 17 : n'importe quelle ligne
    } while (lire(c, l) != 0);    // déjà prise ? on tire encore
                                  // Ex. : (0, 5) → un X → on retire ; (7, 9) → vide → on sort.
    texte(c, l, "P");             // ici, c'est vide : on pose
  }

  ecran(1);                         // On rallume : tout apparaît d'un coup.

  while (true) {                    // La boucle du jeu.
    image();
  }
}
`,
    aVoir: 'Une salle bordée de X, un mur au milieu, et quinze P semés au hasard — jamais sur un X.',
    controle: (c) => {
      let p = 0
      let x = 0
      for (let l = 0; l < 18; l++) {
        const ligne = c.mot(0, l, 20)
        p += ligne.split('P').length - 1
        x += ligne.split('X').length - 1
      }
      const murIntact = c.mot(4, 8, 12) === 'XXXXXXXXXXXX'
      return [
        ['exactement quinze P', p === 15, ` (${p})`],
        ['aucun X recouvert : 20 + 20 + 16 + 16 + 12 = 84', x === 84, ` (${x})`],
        ['le mur du milieu est entier', murIntact],
      ]
    },
  },

  {
    titre: 'Compter les secondes : un chronomètre',
    difficulte: 11,
    provenance: 'cours',
    idee: 'images() compte les images même quand la boucle prend du retard : c’est l’horloge fidèle.',
    texte: [
      'La console affiche **60 images par seconde**. Compter les secondes, c’est donc compter les images par paquets de 60. Mais **qui** compte ?',
      'Si l’on écrit `compte++` à chaque tour de boucle, on se trompe dès qu’un tour dure **plus d’une image** — un gros dessin ou un long calcul suffisent. Le chronomètre retarderait alors, sans prévenir.',
      '**Ce qui est nouveau ici : `images()`, l’horloge de la console.** Elle compte les images depuis l’allumage, **toute seule**, même quand la boucle est en retard. Elle tient dans un octet : après 255, elle repart à 0.',
      'On retient dans `top` le moment de la dernière seconde. `ecoule = images() - top` dit combien d’images ont passé depuis. Quand il atteint 60, une seconde est écoulée : `sec++`, et `top = top + 60` avance le repère d’**exactement** une seconde. On n’écrit pas `top = images()` : si le tour avait pris une image de retard, on la perdrait, et le chrono dériverait.',
      'Le passage de 255 à 0 ne gêne pas : un octet déborde aussi dans la soustraction. Si `top` vaut 250 et `images()` vaut 54 (il a fait le tour), `54 - 250` donne 60 : 54 + 256 - 250. C’est la règle de l’octet (chapitre 1), qui travaille enfin pour nous.',
      'Les minutes suivent la même idée : à 60 secondes, `sec` revient à 0 et `min` augmente. On n’écrit l’heure **qu’une fois par seconde**, quand elle change. A remet tout à zéro.',
      '**À toi :** ajoute un bouton B qui met le chrono en pause (indice : une variable `marche`, et on ne compte que si elle vaut 1 — sans oublier de recaler `top` à la reprise).',
    ],
    code: `// CE PROGRAMME : un chronomètre minutes : secondes. A le remet à 00:00.
//
// Ce qui est nouveau : mesurer le temps avec images().
//   images() compte les images depuis le démarrage (60 par seconde).
//   On note un repère « top » ; images() - top = les images écoulées depuis.
//   Même quand images() repasse de 255 à 0, la soustraction reste juste
//   (ex. : top = 250, images() = 4 → 4 - 250 donne 10 dans un uint8_t).

#include <nombre>   // écrit un nombre en chiffres
#include <texte>    // écrit un texte à l’écran
#include <bouton>   // lit un bouton de la manette

uint8_t top = 0;     // images() au début de la seconde en cours
uint8_t sec = 0;     // les secondes (0 à 59)
uint8_t min = 0;     // les minutes

void afficher() {            // Écrit « MM:SS » au milieu de l'écran.
  nombre(7, 6, min, 2);      // 2 chiffres : 00 à 99
  nombre(10, 6, sec, 2);
}

int main() {                 // Le jeu commence ici.
  texte(4, 3, "CHRONOMETRE");
  texte(9, 6, ":");          // Les deux-points, entre les minutes et les secondes.
  texte(3, 12, "A: REMETTRE A 0");
  afficher();                // 00:00
  top = images();            // le départ : maintenant

  while (true) {             // La boucle du jeu :
    image();

    uint8_t ecoule = images() - top;   // les images depuis le début de la seconde
    if (ecoule >= 60) {                // 60 images : une seconde
      top = top + 60;                  // le repère avance d'exactement une seconde
                                       // (pas « top = images() » : on perdrait les
                                       //  images en trop, et le chrono prendrait du retard)
      sec++;
      if (sec == 60) {                 // 60 secondes : une minute
        sec = 0;
        min++;
      }
      afficher();                      // on n'écrit que quand ça change
    }

    if (bouton(A)) {                   // A : tout à zéro.
      sec = 0;
      min = 0;
      top = images();                  // nouveau départ : maintenant
      afficher();
    }
  }
}
`,
    aVoir: 'Un chronomètre 00:00 qui avance d’une seconde par seconde ; A le remet à zéro.',
    controle: (c) => {
      c.avancer(600)
      const dix = c.variable('sec')
      const ecrit = c.mot(10, 6, 2)
      c.presser('a', 3)
      const zero = c.variable('sec')
      c.avancer(125)
      const deux = c.variable('sec')
      return [
        ['600 images plus tard : 10 secondes', dix === 10 || dix === 11, ` (${dix})`],
        ['l’écran dit la même chose', ecrit === String(dix).padStart(2, '0'), ` (${ecrit})`],
        ['A remet à zéro', zero === 0],
        ['puis il repart : 2 secondes après 125 images', deux === 2, ` (${deux})`],
      ]
    },
  },

  {
    titre: 'Un compte à rebours',
    difficulte: 11,
    provenance: 'cours',
    idee: 'Le chronomètre à l’envers : dix secondes, puis « FINI! » — sans jamais passer sous zéro.',
    texte: [
      'Beaucoup de jeux se jouent **contre la montre** : trouver la sortie avant la fin du temps. C’est le chronomètre de la leçon d’avant, à l’envers : `reste` part de 10 et perd une seconde à chaque paquet de 60 images.',
      'Le piège du zéro (chapitre 3) revient : un octet à 0 qui perd 1 devient **255**. Un compte à rebours sans garde affiche « FINI! », puis repart de 255 secondes. D’où la garde : on ne compte que **si `reste > 0`**.',
      '**Ce qui est nouveau ici : un événement, une seule fois.** Au moment précis où `reste` tombe à 0, on écrit « FINI! ». Ce `if` est **dans** celui de la seconde écoulée : il ne peut se déclencher qu’une fois, à la dernière seconde, et pas à chaque image pendant tout le reste du jeu.',
      'A relance : `reste` revient à 10, `top` repart de maintenant, et on efface « FINI! ». Le même programme sert donc à plusieurs parties : c’est l’idée qui mènera, au chapitre suivant, aux **états** du jeu.',
      '**À toi :** fais clignoter le nombre pendant les trois dernières secondes (le modulo du chapitre 1 et un `effacer`).',
    ],
    code: `// CE PROGRAMME : un compte à rebours de 10 secondes ; à 0, FINI!
// A le relance à 10.
//
// Comme le chronomètre, mais à l'envers — avec une GARDE : on ne descend
// que si reste > 0 (sinon, après 0 viendrait 255).

#include <texte>    // écrit un texte à l’écran
#include <nombre>   // écrit un nombre en chiffres
#include <bouton>   // lit un bouton de la manette

uint8_t top = 0;         // images() au début de la seconde en cours
uint8_t reste = 10;      // les secondes qui restent

int main() {                             // Le jeu commence ici.
  texte(3, 3, "COMPTE A REBOURS");
  texte(3, 12, "A: RELANCER");
  nombre(9, 6, reste, 2);                // 10
  top = images();                        // le départ : maintenant

  while (true) {                         // La boucle du jeu :
    image();

    uint8_t ecoule = images() - top;     // les images depuis le début de la seconde
    if (reste > 0 && ecoule >= 60) {     // la garde : jamais sous zéro
      top = top + 60;                    // le repère avance d'une seconde
      reste--;                           // une seconde de moins
      nombre(9, 6, reste, 2);
      if (reste == 0) {                  // la dernière seconde, une seule fois
        texte(7, 8, "FINI!");
      }
    }

    if (bouton(A)) {                     // A : on relance.
      reste = 10;
      top = images();
      nombre(9, 6, reste, 2);
      texte(7, 8, "     ");              // on efface FINI! (5 espaces pour 5 signes)
    }
  }
}
`,
    aVoir: 'Un nombre qui descend de 10 à 0, une seconde à la fois, puis « FINI! » ; A relance.',
    controle: (c) => {
      c.avancer(300)
      const cinq = c.variable('reste')
      c.avancer(400)
      const fin = c.variable('reste')
      const fini = c.mot(7, 8, 5)
      c.avancer(200)
      const resteAZero = c.variable('reste')
      c.presser('a', 3)
      c.avancer(5)
      return [
        ['en route, il descend', cinq >= 4 && cinq <= 6, ` (${cinq})`],
        ['au bout de dix secondes : 0', fin === 0],
        ['FINI! s’affiche', fini === 'FINI!'],
        ['et il ne passe jamais sous zéro', resteAZero === 0],
        ['A relance à 10, et efface FINI!', c.variable('reste') === 10 && c.mot(7, 8, 5) === '     '],
      ]
    },
  },
  /* ================================================ 12 — les états du jeu */

  {
    titre: 'enum : un nom pour chaque écran',
    difficulte: 12,
    provenance: 'cours',
    idee: 'Un jeu passe d’écran en écran : titre, partie, perdu. Une variable dit où l’on en est, et chaque valeur a un nom.',
    texte: [
      'Un vrai jeu n’est pas une seule boucle qui fait toujours la même chose. Il y a **l’écran titre**, qui attend START ; **la partie** ; **l’écran perdu**, qui attend qu’on recommence. Les mêmes boutons n’y font pas la même chose : START lance la partie au titre, et ramène au titre quand on a perdu.',
      'On range donc, dans **une variable**, l’écran où l’on est : son **état**. On pourrait écrire 0 pour le titre, 1 pour la partie, 2 pour perdu. Mais `if (etat == 2)`, dans trois semaines, ne dira plus rien à personne.',
      '**Ce qui est nouveau ici : `enum`.** `enum Etat { TITRE, JEU, PERDU };` crée **trois noms** pour les nombres 0, 1 et 2, dans l’ordre, et un **type** `Etat`. `Etat etat = TITRE;` déclare une variable de ce type. Pour la console, c’est un octet ; pour qui lit, `if (etat == PERDU)` se comprend tout seul.',
      'La boucle regarde l’état et ne fait **que ce qui le concerne** : au titre, elle attend START ; en jeu, A fait perdre (en attendant un vrai jeu) ; perdu, START ramène au titre.',
      '**Le front de START** (chapitre 11) est indispensable : sans lui, un appui de quelques images ferait TITRE → JEU, puis, dès qu’on perd, PERDU → TITRE → JEU d’un seul coup, trop vite pour être vu.',
      '`dessine` retient l’état **déjà montré** à l’écran. Quand `etat` change, les deux diffèrent : on redessine **une fois**, puis `dessine = etat`. C’est l’idée de toujours : n’écrire que ce qui change.',
      '**À toi :** ajoute un état `PAUSE`, où l’on entre et d’où l’on sort avec SELECT pendant la partie.',
    ],
    code: `// CE PROGRAMME : trois écrans : le TITRE (START pour jouer), la PARTIE
// (A pour perdre), et PERDU (START pour revenir au titre).
//
// Ce qui est nouveau : enum, des NOMS pour des nombres.
//   enum Etat ... = on invente un type « Etat » dont les valeurs ont des noms.
//   TITRE vaut 0, JEU vaut 1, PERDU vaut 2 — mais on n'a plus à s'en souvenir.
//   « etat == PERDU » se lit mieux que « etat == 2 ».

// Les trois écrans du jeu : TITRE vaut 0, JEU vaut 1, PERDU vaut 2.

#include <bouton>   // lit un bouton de la manette
#include <texte>    // écrit un texte à l’écran

enum Etat { TITRE, JEU, PERDU };

Etat etat = TITRE;       // où l'on en est : on commence au titre
uint8_t dessine = 255;   // l'état déjà montré : 255, aucun, pour dessiner au début
uint8_t avant = 0;       // START à l'image d'avant

int main() {                        // Le jeu commence ici.
  while (true) {                    // La boucle du jeu :
    image();

    // Le front de START : enfoncé maintenant, pas à l'image d'avant.
    uint8_t start = bouton(START);
    uint8_t appui = start && !avant;  // 1 seulement à la première image de l'appui
    avant = start;

    // Chaque état ne fait que ce qui le concerne.
    if (etat == TITRE) {            // Au titre :
      if (appui) etat = JEU;        //   START → la partie.
    } else if (etat == JEU) {       // Pendant la partie :
      if (bouton(A)) etat = PERDU;  //   A → perdu.
    } else if (etat == PERDU) {     // À l'écran perdu :
      if (appui) etat = TITRE;      //   START → retour au titre.
    }

    // L'état a changé ? On redessine l'écran, une seule fois.
    if (etat != dessine) {
      dessine = etat;               // On retient ce qu'on montre.
      texte(0, 8, "                    ");    // Efface les deux lignes de texte
      texte(0, 10, "                    ");   // (20 espaces chacune).
      if (etat == TITRE) {
        texte(6, 8, "MON JEU");
        texte(4, 10, "START: JOUER");
      } else if (etat == JEU) {
        texte(5, 8, "LA PARTIE");
        texte(3, 10, "A: FAIRE PERDRE");
      } else {                      // le seul autre cas : PERDU
        texte(7, 8, "PERDU");
        texte(4, 10, "START: TITRE");
      }
    }
  }
}
`,
    aVoir: 'MON JEU ; START passe à LA PARTIE ; A affiche PERDU ; START ramène au titre.',
    controle: (c) => {
      c.avancer(10)
      const titre = c.mot(6, 8, 7)
      const auDebut = c.variable('etat')
      c.presser('start', 4)
      c.avancer(10)
      const jeu = [c.variable('etat'), c.mot(5, 8, 9)]
      c.presser('a', 4)
      c.avancer(10)
      const perdu = [c.variable('etat'), c.mot(7, 8, 5)]
      c.presser('start', 4)
      c.avancer(10)
      return [
        ['au départ, l’écran titre : etat vaut TITRE (0)', auDebut === 0 && titre === 'MON JEU'],
        ['START lance la partie : etat vaut JEU (1)', jeu[0] === 1 && jeu[1] === 'LA PARTIE'],
        ['A fait perdre : PERDU (2)', perdu[0] === 2 && perdu[1] === 'PERDU'],
        ['START ramène au titre, et pas plus loin', c.variable('etat') === 0 && c.mot(6, 8, 7) === 'MON JEU'],
      ]
    },
  },

  {
    titre: 'Un switch, et une fonction par état',
    difficulte: 12,
    provenance: 'cours',
    idee: 'La boucle ne fait plus qu’aiguiller : chaque état a sa fonction, et une seule fonction change d’état.',
    texte: [
      'Avec un vrai jeu dans l’état `JEU`, le `if … else if` de la leçon d’avant grossirait jusqu’à ne plus tenir sur l’écran. On range donc **chaque état dans sa fonction** : `titre()`, `jeu()`, `perdu()`.',
      '**Ce qui est nouveau ici : le `switch` sur l’état, et `changer()`.** Le `switch` (chapitre 2) aiguille vers la fonction de l’état en cours ; `main` ne fait plus rien d’autre. Et **une seule** fonction, `changer(nouvel)`, a le droit de changer d’état : elle efface l’écran, dessine le nouveau, et prépare ses variables.',
      'Pourquoi une seule ? Parce que chaque état a quelque chose à faire **en entrant** : la partie remet le score à 0 et lance le chrono ; l’écran de fin affiche le score. Si trois endroits du programme changeaient `etat` à la main, on oublierait une fois sur deux de remettre le score à zéro.',
      '`changer(Etat nouvel)` prend un argument de type `Etat` : on ne peut lui passer que TITRE, JEU ou PERDU. Même le compilateur lit le programme plus facilement.',
      'La partie est un petit jeu : **appuyer sur A le plus de fois possible en cinq secondes**. Le front de A (un appui, un point), le compte à rebours du chapitre 11, et quand il tombe à 0 : `changer(PERDU)`.',
      'Le changement d’écran se fait **écran éteint** : `ecran(0)`, on efface et on écrit, `ecran(1)`. Rien ne se voit à moitié dessiné.',
      '**À toi :** ajoute l’état `PAUSE` avec sa fonction `pause()`, et vérifie que le temps ne s’écoule pas pendant la pause.',
    ],
    code: `// CE PROGRAMME : « LE JEU DU A ». Au titre, START lance la partie.
// Pendant 5 secondes, chaque appui sur A donne un point. Puis FINI!,
// et START ramène au titre.
//
// Ce qui est nouveau : une fonction par état, et UNE SEULE fonction, changer(),
// qui passe d'un état à l'autre. La boucle du jeu ne fait plus qu'aiguiller :
// switch (etat) appelle titre(), jeu() ou perdu().

#include <bouton>   // lit un bouton de la manette
#include <ecran>    // éteint ou rallume l’écran
#include <texte>    // écrit un texte à l’écran
#include <nombre>   // écrit un nombre en chiffres

enum Etat { TITRE, JEU, PERDU };   // Les trois écrans : TITRE = 0, JEU = 1, PERDU = 2.

Etat etat = TITRE;       // L'écran actuel.
uint8_t score = 0;       // Les points de la partie.
uint8_t reste = 5;       // les secondes de la partie
uint8_t top = 0;         // images() au début de la seconde en cours
uint8_t avantStart = 0;  // START à l'image d'avant
uint8_t avantA = 0;      // A à l'image d'avant

// 1 à la première image d'un appui sur START, 0 sinon (le front).
uint8_t appuiStart() {
  uint8_t s = bouton(START);         // START maintenant ?
  uint8_t front = s && !avantStart;  // maintenant ET pas avant
  avantStart = s;                    // on retient pour la prochaine fois
  return front;
}

// LA SEULE fonction qui change d'état : elle dessine le nouvel écran.
void changer(Etat nouvel) {
  etat = nouvel;                     // On passe au nouvel état.
  ecran(0);                          // Écran éteint pendant qu'on redessine.
  for (uint8_t l = 4; l < 14; l++) texte(0, l, "                    ");  // efface lignes 4 à 13

  switch (etat) {                    // Selon le nouvel état :
    case TITRE:                      // --- le titre
      texte(5, 6, "LE JEU DU A");
      texte(4, 10, "START: JOUER");
      break;                         // « break » : fin de ce cas.
    case JEU:                        // --- la partie
      score = 0;               // en entrant dans la partie : tout repart de zéro
      reste = 5;
      top = images();          // le chrono démarre maintenant
      texte(3, 6, "APPUIE SUR A!");
      texte(3, 9, "POINTS");
      nombre(10, 9, score);
      texte(3, 10, "TEMPS");
      nombre(10, 10, reste, 1);
      break;
    case PERDU:                      // --- la fin
      texte(7, 6, "FINI!");
      texte(3, 9, "POINTS");
      nombre(10, 9, score);
      texte(4, 12, "START: TITRE");
      break;
  }
  ecran(1);                          // On rallume.
}

void titre() {                       // Ce que fait le jeu, à chaque image, au titre :
  if (appuiStart()) changer(JEU);    //   START → la partie.
}

void jeu() {                         // À chaque image, pendant la partie :
  uint8_t a = bouton(A);
  if (a && !avantA) {          // un appui, un point (le front de A)
    score++;
    nombre(10, 9, score);
  }
  avantA = a;

  uint8_t ecoule = images() - top;   // images depuis le début de la seconde
  if (ecoule >= 60) {          // une seconde de moins
    top = top + 60;
    reste--;
    nombre(10, 10, reste, 1);
    if (reste == 0) changer(PERDU);  // le temps est écoulé → fin
  }
}

void perdu() {                       // À chaque image, à l'écran de fin :
  if (appuiStart()) changer(TITRE);  //   START → retour au titre.
}

int main() {                   // Le jeu commence ici.
  changer(TITRE);              // On dessine le titre.

  while (true) {               // La boucle du jeu :
    image();
    switch (etat) {            // la boucle ne fait plus qu'aiguiller
      case TITRE: titre(); break;
      case JEU:   jeu();   break;
      case PERDU: perdu(); break;
    }
  }
}
`,
    aVoir: 'LE JEU DU A ; START lance cinq secondes où chaque appui sur A marque un point ; puis FINI! et le score ; START revient au titre.',
    controle: (c) => {
      c.avancer(10)
      const titre = c.mot(5, 6, 11)
      c.presser('start', 4)
      c.avancer(5)
      for (let k = 0; k < 7; k++) c.presser('a', 3)
      const pendantLaPartie = c.variable('etat')
      attendre(c, () => c.variable('etat') === 2, 400)
      c.avancer(10)
      const score = c.variable('score')
      const fini = c.mot(7, 6, 5)
      const ecrit = c.mot(10, 9, 3)
      c.presser('start', 4)
      c.avancer(10)
      return [
        ['l’écran titre', titre === 'LE JEU DU A'],
        ['START lance la partie', pendantLaPartie === 1],
        ['sept appuis, sept points', score === 7, ` (${score})`],
        ['au bout de cinq secondes, FINI! et le score', fini === 'FINI!' && ecrit === '007', ` (${ecrit})`],
        ['START ramène au titre', c.variable('etat') === 0 && c.mot(5, 6, 11) === 'LE JEU DU A'],
      ]
    },
  },

  {
    titre: 'Le record, gardé dans la cartouche',
    difficulte: 12,
    provenance: 'cours',
    idee: 'Le meilleur score survit à l’extinction : la cartouche a une petite mémoire à pile.',
    texte: [
      'Toutes les variables vivent dans la mémoire de la console, qui s’efface quand on l’éteint. Un record qui disparaît à chaque extinction n’en est pas un.',
      'Certaines cartouches portent une **pile** et une petite mémoire à elles. **Ce qui est nouveau ici : `sauver(numero, valeur)` et `sauvegarde(numero)`.** `sauver(1, record)` écrit dans la case n° 1 de cette mémoire ; `sauvegarde(1)` la relit, même des mois plus tard.',
      'La toute première fois, cette mémoire contient **n’importe quoi**. On ne peut pas faire confiance à la case 1 : elle vaut peut-être 173, un record que personne n’a fait. D’où la **marque** : dans la case 0, le jeu écrit un nombre à lui, 42. Au démarrage, s’il ne retrouve pas 42, la mémoire est neuve : il y écrit la marque et un record de 0.',
      'Le record n’est comparé qu’à **un seul** endroit : en entrant dans l’état `PERDU`, dans `changer()`. La leçon d’avant y avait mis le dessin de l’écran de fin ; c’est aussi le bon moment pour dire « nouveau record! » et le sauver. Voilà pourquoi une seule fonction change d’état.',
      'On ne sauve **que** si le score bat le record : écrire dans cette mémoire est plus lent, et elle s’use un peu à chaque écriture.',
      '**À toi :** garde aussi le nombre de parties jouées, dans la case 2.',
    ],
    code: `// CE PROGRAMME : « LE JEU DU A », avec un RECORD qui reste même quand on
// éteint la console.
//
// Ce qui est nouveau : la mémoire de la cartouche (elle a une pile).
//   sauver(numero, valeur) : écrit valeur dans la case « numero » de la cartouche.
//   sauvegarde(numero)     : relit cette case, même des mois plus tard.
//   La toute première fois, cette mémoire contient n'importe quoi. On écrit donc
//   une MARQUE (42) dans la case 0 : si on ne la retrouve pas, la mémoire est neuve.

#include <bouton>       // lit un bouton de la manette
#include <ecran>        // éteint ou rallume l’écran
#include <texte>        // écrit un texte à l’écran
#include <nombre>       // écrit un nombre en chiffres
#include <sauver>       // garde un nombre dans la cartouche, même éteinte
#include <sauvegarde>   // relit un nombre gardé dans la cartouche

enum Etat { TITRE, JEU, PERDU };   // Les trois écrans.

const uint8_t MARQUE = 42;   // « cette cartouche a déjà servi à ce jeu »

Etat etat = TITRE;
uint8_t score = 0;
uint8_t record = 0;          // Le meilleur score, relu dans la cartouche au démarrage.
uint8_t reste = 5;           // Les secondes de la partie.
uint8_t top = 0;             // images() au début de la seconde en cours.
uint8_t avantStart = 0;      // START à l'image d'avant.
uint8_t avantA = 0;          // A à l'image d'avant.

// 1 à la première image d'un appui sur START (le front).
uint8_t appuiStart() {
  uint8_t s = bouton(START);
  uint8_t front = s && !avantStart;
  avantStart = s;
  return front;
}

// La seule fonction qui change d'état.
void changer(Etat nouvel) {
  etat = nouvel;
  ecran(0);
  for (uint8_t l = 4; l < 14; l++) texte(0, l, "                    ");  // efface lignes 4 à 13

  switch (etat) {
    case TITRE:
      texte(5, 6, "LE JEU DU A");
      texte(3, 8, "RECORD");
      nombre(10, 8, record);         // Le record s'affiche au titre.
      texte(4, 11, "START: JOUER");
      break;
    case JEU:
      score = 0;                     // Tout repart de zéro.
      reste = 5;
      top = images();
      texte(3, 6, "APPUIE SUR A!");
      texte(3, 9, "POINTS");
      nombre(10, 9, score);
      texte(3, 10, "TEMPS");
      nombre(10, 10, reste, 1);
      break;
    case PERDU:
      texte(7, 6, "FINI!");
      texte(3, 9, "POINTS");
      nombre(10, 9, score);
      if (score > record) {          // un nouveau record ?
        record = score;
        sauver(1, record);           // dans la cartouche (case 1) : il survivra
        texte(2, 11, "NOUVEAU RECORD!");
      }                              // (On ne sauve QUE s'il est battu : écrire
                                     //  dans la cartouche est lent et l'use un peu.)
      texte(4, 13, "START: TITRE");
      break;
  }
  ecran(1);
}

void titre() {                       // Au titre : START → la partie.
  if (appuiStart()) changer(JEU);
}

void jeu() {                         // Pendant la partie :
  uint8_t a = bouton(A);
  if (a && !avantA) {                // un appui sur A = un point
    score++;
    nombre(10, 9, score);
  }
  avantA = a;

  uint8_t ecoule = images() - top;
  if (ecoule >= 60) {                // une seconde est passée
    top = top + 60;
    reste--;
    nombre(10, 10, reste, 1);
    if (reste == 0) changer(PERDU);  // plus de temps → fin
  }
}

void perdu() {                       // À la fin : START → le titre.
  if (appuiStart()) changer(TITRE);
}

int main() {                 // Le jeu commence ici.
  // La cartouche a-t-elle déjà servi ?
  if (sauvegarde(0) != MARQUE) {
    sauver(0, MARQUE);       // non : on la marque
    sauver(1, 0);            // et le record part de 0
  }
  record = sauvegarde(1);    // on relit le record gardé

  changer(TITRE);            // On dessine le titre.

  while (true) {             // La boucle du jeu : elle aiguille selon l'état.
    image();
    switch (etat) {
      case TITRE: titre(); break;
      case JEU:   jeu();   break;
      case PERDU: perdu(); break;
    }
  }
}
`,
    aVoir: 'Le titre montre RECORD 000 ; après une partie, NOUVEAU RECORD! ; de retour au titre, le record est là — et il y serait encore après avoir éteint.',
    controle: (c) => {
      c.avancer(10)
      const marque = c.gb.mmu.externalRam[0]
      c.presser('start', 4)
      c.avancer(5)
      for (let k = 0; k < 5; k++) c.presser('a', 3)
      attendre(c, () => c.variable('etat') === 2, 400)
      c.avancer(10)
      const nouveau = c.mot(2, 11, 15)
      c.presser('start', 4)
      c.avancer(10)
      return [
        ['la marque 42 est écrite dans la cartouche', marque === 42],
        ['cinq points : NOUVEAU RECORD!', nouveau === 'NOUVEAU RECORD!'],
        ['le record est gardé dans la cartouche', c.gb.mmu.externalRam[1] === 5, ` (${c.gb.mmu.externalRam[1]})`],
        ['le titre l’affiche', c.mot(10, 8, 3) === '005'],
      ]
    },
  },
  /* ================================================ 13 — le son */

  {
    titre: 'Une note : sa hauteur, sa durée, son volume',
    difficulte: 13,
    provenance: 'cours',
    idee: 'note(voix, hauteur, duree, volume) joue une note toute seule, pendant que le jeu continue.',
    texte: [
      'La Game Boy a **quatre voix** : deux qui chantent des notes (la 1 et la 2), une troisième pour des sons dessinés, et la quatrième pour le **bruit** (un souffle, un choc). Ce chapitre se sert de la 1, de la 2 et de la 4.',
      '**Ce qui est nouveau ici : `note(voix, hauteur, duree, volume)`.** • La **voix** : 1 ou 2. • La **hauteur** : un nom de note suivi de son **octave**, `DO4`, `RE4`, `MI4`… jusqu’à `SI4`, puis `DO5` recommence un cran plus haut. `DO5` sonne deux fois plus aigu que `DO4` : 523 vibrations par seconde contre 262. • La **durée**, en images : 20 images, un tiers de seconde. • Le **volume**, de 0 (muet) à 15.',
      '**La note ne bloque pas.** `note()` lance le son et rend la main aussitôt : c’est la puce sonore qui le tient, et le coupe toute seule au bout de la durée. Le jeu continue pendant ce temps, sans le moindre retard.',
      'On joue la note sur le **front** du bouton (chapitre 11). Sans lui, tenir A relancerait la note à chaque image : 60 débuts de note par seconde, un grésillement au lieu d’un son.',
      'Les noms des notes suivent la gamme : DO, RE, MI, FA, SOL, LA, SI. `LA4` est le « la » du diapason, 440 vibrations par seconde. Les dièses s’écrivent avec un D : `DOD4` est le do dièse.',
      '**À toi :** donne à BAS la note `SOL4`, à GAUCHE `MI4`, à DROITE `DO5` : avec A (DO5) et B (DO4), tu as de quoi jouer « Au clair de la lune ».',
    ],
    code: `// CE PROGRAMME : A joue un do aigu, B joue un do grave.
//
// Ce qui est nouveau : note(voix, hauteur, durée, volume)
//   voix    : 1 ou 2 (les deux voix qui chantent des notes)
//   hauteur : le nom de la note + son octave : DO4, RE4, MI4 ... SI4, puis DO5.
//             DO5 est deux fois plus aigu que DO4 (523 vibrations par seconde contre 262).
//   durée   : en images (60 par seconde) : 20 images = un tiers de seconde.
//   volume  : de 0 (muet) à 15 (le plus fort).
// La note ne bloque pas : note() lance le son et le jeu continue tout de suite.

#include <texte>    // écrit un texte à l’écran
#include <bouton>   // lit un bouton de la manette
#include <note>     // joue une note

uint8_t avantA = 0;          // A à l'image d'avant
uint8_t avantB = 0;          // B à l'image d'avant

int main() {                 // Le jeu commence ici.
  texte(2, 3, "A: DO AIGU  DO5");
  texte(2, 5, "B: DO GRAVE DO4");

  while (true) {             // La boucle du jeu :
    image();

    uint8_t a = bouton(A);
    if (a && !avantA) {      // Le front de A : une note par appui
                             // (sans lui : 60 débuts de note par seconde, un grésillement).
      note(1, DO5, 20, 12);    // voix 1, do aigu, 20 images, volume 12
    }
    avantA = a;

    uint8_t b = bouton(B);
    if (b && !avantB) {      // Le front de B.
      note(1, DO4, 20, 12);    // le même do, une octave plus bas
    }
    avantB = b;
  }
}
`,
    aVoir: 'Rien ne bouge à l’écran — mais A joue un do aigu, B un do grave, un tiers de seconde chacun.',
    controle: (c) => {
      const silence = c.voix(1).joue
      c.gb.setButton('a', true)
      c.avancer(3)
      const aigu = c.voix(1)
      c.gb.setButton('a', false)
      c.avancer(40)
      const apres = c.voix(1).joue
      c.gb.setButton('b', true)
      c.avancer(3)
      const grave = c.voix(1)
      c.gb.setButton('b', false)
      c.avancer(10)
      return [
        ['au départ, silence', !silence],
        ['A joue un do aigu, vers 523 vibrations par seconde', aigu.joue && Math.abs(aigu.hertz - 523) <= 3, ` (${aigu.hertz})`],
        ['la note s’arrête toute seule', !apres],
        ['B joue le do grave, vers 262', grave.joue && Math.abs(grave.hertz - 262) <= 3, ` (${grave.hertz})`],
      ]
    },
  },

  {
    titre: 'Un son pour chaque action',
    difficulte: 13,
    provenance: 'cours',
    idee: 'Une note quand on ramasse, un « toc » quand on se cogne : le joueur entend ce qui se passe.',
    texte: [
      'Dans un jeu, le son **dit** ce qui arrive, avant même qu’on le voie : la pièce ramassée tinte, le mur fait « toc ». Ce programme reprend le mur de la leçon « lire la case devant soi » et la pièce de « deux boîtes qui se touchent », et donne à chacun son son.',
      '**Ce qui est nouveau ici : `bruit(duree, volume)`.** Il frappe sur la **voix 4**, celle du bruit : pas une note, un choc. `bruit(4, 10)` : une frappe très courte (durée 4), au volume 10. Un troisième argument, le **grain**, le rend plus sourd ou plus sifflant.',
      'La pièce joue sur la **voix 1**, le mur sur la **voix 4** : ils peuvent sonner **en même temps** sans se couper. Deux sons sur la même voix, c’est le second qui remplace le premier.',
      'Le « toc » n’est joué qu’**une fois par choc**. Tant qu’on pousse contre le mur, `bloque` reste vrai ; on ne joue le bruit qu’au **front** de `bloque` : vrai maintenant, faux à l’image d’avant. C’est le même front que pour un bouton — il marche pour **n’importe quelle** condition.',
      '**À toi :** donne au mur de gauche un grain différent (`bruit(4, 10, 3)`) : les deux murs ne sonnent plus pareil.',
    ],
    code: `// CE PROGRAMME : un héros va à gauche et à droite entre deux murs.
// Il ramasse une pièce (« ding ! ») et se cogne aux murs (« toc ! »).
//
// Ce qui est nouveau : bruit(durée, volume) : un choc sur la voix 4, celle
// du bruit (pas une note). bruit(4, 10) = une frappe très courte, volume 10.
// La pièce sonne sur la voix 1, le mur sur la voix 4 : ils peuvent sonner
// en même temps sans se couper.

#include <Tuile>    // un dessin de 8 × 8 pixels
#include <texte>    // écrit un texte à l’écran
#include <nombre>   // écrit un nombre en chiffres
#include <poser>    // pose une tuile sur une case du fond
#include <bouton>   // lit un bouton de la manette
#include <lire>     // lit la tuile posée sur une case
#include <bruit>    // joue un bruit
#include <note>     // joue une note
#include <sprite>   // place un lutin de 8 × 8 au pixel près

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

Tuile PIECE = {
  "..####..", ".#----#.", "#-#--#-#", "#-#--#-#",
  "#-#--#-#", "#-#--#-#", ".#----#.", "..####..",
};

Tuile MUR = {
  "33333333", "31111113", "31222213", "31222213",
  "31222213", "31222213", "31111113", "33333333",
};

const uint8_t PX[] = { 100, 48 };   // les deux places de la pièce (x en pixels)

uint8_t x = 60;             // le héros, en pixels
uint8_t i = 0;              // la place de la pièce : 0 ou 1
uint8_t score = 0;
uint8_t avantBloque = 0;    // poussait-on contre un mur à l'image d'avant ?

int main() {                // Le jeu commence ici.
  texte(1, 1, "SCORE");
  nombre(7, 1, score);
  poser(3, 8, MUR);         // un mur en colonne 3 (pixels 24 à 31)
  poser(16, 8, MUR);        // un mur en colonne 16 (pixels 128 à 135)

  while (true) {            // La boucle du jeu :
    image();

    uint8_t bloque = 0;     // 1 si on pousse contre un mur à cette image
    if (bouton(DROITE)) {
      if (lire((x + 8) / 8, 8) != MUR) x++; else bloque = 1;   // libre : on avance ;
    }                                                          // sinon : bloqué.
    if (bouton(GAUCHE)) {
      if (lire((x - 1) / 8, 8) != MUR) x--; else bloque = 1;
    }
    if (bloque && !avantBloque) {   // Le FRONT de « bloque » : bloqué maintenant,
                                    // pas avant → le tout début du choc.
      bruit(4, 10);             // toc : une fois par choc, sur la voix 4
    }
    avantBloque = bloque;

    if (x < PX[i] + 8 && PX[i] < x + 8) {   // la pièce est sur la même ligne :
      score++;                               // la largeur suffit
      i = 1 - i;                             // l'autre place : 0 → 1 → 0 ...
      nombre(7, 1, score);
      note(1, MI5, 8, 12);      // ding : sur la voix 1
    }

    sprite(0, x, 64, HEROS);       // le héros (ligne de pixels 64 = ligne de cases 8)
    sprite(1, PX[i], 64, PIECE);   // la pièce
  }
}
`,
    aVoir: 'Un héros entre deux murs et une pièce ; la pièce tinte quand on la ramasse, le mur fait « toc » à chaque choc.',
    controle: (c) => {
      c.gb.setButton('right', true)
      let ding = null
      for (let k = 0; k < 60 && c.variable('score') === 0; k++) c.avancer(1)
      ding = c.voix(1)
      /* La frappe est si brève qu'on la reconnaît à son volume : il passe de
         0 à 10 quand bruit() frappe, et y reste. */
      for (let k = 0; k < 80 && c.variable('x') < 120; k++) c.avancer(1)
      const avantLeMur = c.voix(4).volume
      c.avancer(2)
      const toc = c.voix(4).volume
      /* On remet le volume à 0 à la main : s'il remonte, c'est un 2e toc. */
      c.gb.apu.bruit.volume = 0
      c.avancer(40)
      const deuxieme = c.voix(4).volume
      c.gb.setButton('right', false)
      c.avancer(5)
      return [
        ['la pièce ramassée tinte sur la voix 1 (MI5, vers 659)', ding.joue && Math.abs(ding.hertz - 659) <= 4, ` (${ding.hertz})`],
        ['le mur fait toc sur la voix 4', avantLeMur === 0 && toc === 10],
        ['un seul toc, même en poussant encore', deuxieme === 0],
      ]
    },
  },

  {
    titre: 'Un petit air qui joue tout seul',
    difficulte: 13,
    provenance: 'cours',
    idee: 'Un Air s’écrit comme une tuile se dessine : une suite de pas, gravée dans le programme.',
    texte: [
      'Une mélodie, c’est une suite de notes. On pourrait appeler `note()` au bon moment, image après image, avec un compteur ; la console sait le faire toute seule.',
      '**Ce qui est nouveau ici : `Air`, et `jouer(voix, AIR, vitesse)`.** Un `Air` est une **liste de pas**, comme une tuile est une liste de rangées. Chaque pas est une note et son volume, `"DO4 12"`, ou l’un de ces deux signes : `"--"` fait taire la voix, `"=="` laisse la note d’avant continuer (c’est ce qui fait les notes longues).',
      '`jouer(1, CLAIR, 10)` joue l’air sur la voix 1, à raison d’un pas toutes les **10 images**. Ensuite, le programme n’a plus rien à faire : l’air avance tout seul, soixante fois par seconde, même si la boucle du jeu est en retard.',
      '`airFini(1)` rend 1 quand l’air de la voix 1 est arrivé au bout. On s’en sert ici pour écrire « FIN » **une fois** (la variable `fini` évite de le réécrire à chaque image), et A relance l’air depuis le début.',
      'Pour une musique de fond qui ne s’arrête jamais, on ajoute un 4e argument : `jouer(1, CLAIR, 10, 1)` recommence sans fin. Et une deuxième voix peut jouer un autre `Air` en même temps : une basse sous la mélodie.',
      '**À toi :** écris la suite de la chanson (« mon ami Pierrot ») à la fin de `CLAIR`.',
    ],
    code: `// CE PROGRAMME : joue « Au clair de la lune » tout seul, écrit FIN à la fin ;
// A la rejoue.
//
// Ce qui est nouveau : Air, une liste de pas de musique.
//   Chaque pas est une note et son volume : DO4 12 (do, octave 4, volume 12).
//   == : la note d'avant continue (une note longue).
//   -- : silence.
//   jouer(voix, AIR, vitesse) : joue l'air sur la voix, un pas toutes les « vitesse » images.
//   airFini(voix) : 1 quand l'air de cette voix est arrivé au bout.

// Au clair de la lune : chaque pas dure 10 images.
// « Au clair de la lu-ne, mon a-mi Pier-rot » : 16 pas.

#include <Air>       // un air de musique, note par note
#include <texte>     // écrit un texte à l’écran
#include <jouer>     // joue un air tout seul
#include <airFini>   // dit si un air est fini
#include <bouton>    // lit un bouton de la manette

Air CLAIR = {
  "DO4 12", "DO4 12", "DO4 12", "RE4 12",
  "MI4 12", "==",     "RE4 12", "==",
  "DO4 12", "MI4 12", "RE4 12", "RE4 12",
  "DO4 12", "==",     "==",     "--",
};

uint8_t fini = 0;      // 1 quand FIN est déjà écrit

int main() {                       // Le jeu commence ici.
  texte(2, 3, "AU CLAIR DE LA LUNE");
  texte(2, 10, "A: REJOUER");

  jouer(1, CLAIR, 10);       // voix 1, un pas toutes les 10 images.
                             // L'air avance TOUT SEUL : la boucle n'a rien à faire.

  while (true) {                   // La boucle du jeu :
    image();

    if (airFini(1) && !fini) {     // l'air vient de finir : une seule fois
      texte(8, 6, "FIN");
      fini = 1;                    // pour ne pas réécrire FIN à chaque image
    }

    if (bouton(A) && fini) {       // on ne relance qu'un air fini
      jouer(1, CLAIR, 10);         // depuis le début
      texte(8, 6, "   ");          // on efface FIN
      fini = 0;
    }
  }
}
`,
    aVoir: 'Au clair de la lune joue une fois, puis « FIN » ; A la rejoue.',
    controle: (c) => {
      c.avancer(5)
      const joue = c.voix(1).joue
      const debut = c.voix(1).hertz
      attendre(c, () => c.variable('fini') === 1, 400)
      c.avancer(3)
      const fin = c.mot(8, 6, 3)
      c.presser('a', 3)
      c.avancer(3)
      return [
        ['l’air commence par un do (DO4, vers 262)', joue && Math.abs(debut - 262) <= 3, ` (${debut})`],
        ['il finit tout seul : FIN', fin === 'FIN'],
        ['A le relance', c.voix(1).joue && c.variable('fini') === 0],
      ]
    },
  },
  /* ================================================ 14 — le défilement */

  {
    titre: 'Faire glisser le décor',
    difficulte: 14,
    provenance: 'cours',
    idee: 'L’écran ne montre qu’un morceau de la carte ; defiler() choisit lequel, au pixel près.',
    texte: [
      'L’écran fait **20 cases** de large. Mais la carte du fond, dans la console, en fait **32** : 256 pixels. On ne voit jamais qu’un **morceau** de cette carte, comme par une fenêtre.',
      '**Ce qui est nouveau ici : `defiler(x, y)`.** Elle dit à la console **où poser la fenêtre** sur la carte, en pixels. `defiler(0, 0)` : on voit les colonnes 0 à 19. `defiler(8, 0)` : la fenêtre a glissé d’une case, on voit les colonnes 1 à 20. `defiler(3, 0)` : trois pixels, entre deux cases — le glissement est doux.',
      'On ne redessine rien : le décor est posé **une fois**, écran éteint, sur les 32 colonnes (`c < 32`, et non `c < 20`). Faire défiler ne coûte qu’**une écriture** par image, comme la palette du chapitre 7. C’est pourquoi les jeux Game Boy défilent sans ralentir.',
      'Les chiffres 0 à 7, un toutes les 4 colonnes, disent où l’on est sur la carte. Pousse DROITE longtemps : après le 7, le 0 revient. `sx` est un octet : après 255, il repart à 0, et la carte, qui fait justement 256 pixels, **boucle** au même moment. La règle de l’octet (chapitre 1) et la taille de la carte vont ensemble.',
      'Le héros ne bouge pas : c’est un lutin, et les lutins ne défilent pas avec le fond. Rester au milieu pendant que le monde passe, c’est l’illusion de tous les jeux de course. En revanche, le texte du haut **défile avec le reste** : il est dans le fond. Pour un score qui reste en place, on se sert du **panneau** (`textePanneau`), une seconde couche que `defiler()` ne touche pas.',
      '**À toi :** fais défiler aussi en hauteur avec HAUT et BAS (`sy`, et `defiler(sx, sy)`).',
    ],
    code: `// CE PROGRAMME : GAUCHE / DROITE font glisser le décor ; le héros reste au milieu.
// Des chiffres 0 à 7 sur le sol disent où l'on est.
//
// Ce qui est nouveau : defiler(x, y).
//   L'écran montre 20 colonnes, mais la carte du fond en a 32 (256 pixels).
//   defiler(x, y) dit où poser la « fenêtre » sur la carte, en pixels.
//   defiler(0, 0) : on voit les colonnes 0 à 19. defiler(8, 0) : les colonnes 1 à 20.
//   Rien n'est redessiné : une seule écriture par image.

#include <Tuile>     // un dessin de 8 × 8 pixels
#include <ecran>     // éteint ou rallume l’écran
#include <texte>     // écrit un texte à l’écran
#include <poser>     // pose une tuile sur une case du fond
#include <nombre>    // écrit un nombre en chiffres
#include <bouton>    // lit un bouton de la manette
#include <defiler>   // fait glisser tout le fond
#include <sprite>    // place un lutin de 8 × 8 au pixel près

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

Tuile SOL = {
  "33333333", "12121212", "21212121", "22222222",
  "22222222", "22222222", "22222222", "22222222",
};

uint8_t sx = 0;      // où est la fenêtre sur la carte, en pixels : 0 à 255

int main() {                               // Le jeu commence ici.
  ecran(0);                                // Dessin écran éteint.
  texte(1, 1, "GAUCHE  DROITE");
  for (uint8_t c = 0; c < 32; c++) {       // TOUTE la carte : 32 colonnes (pas 20)
    poser(c, 12, SOL);                     // deux rangées de sol,
    poser(c, 13, SOL);
    if (c % 4 == 0) nombre(c, 10, c / 4, 1);  // 0 en colonne 0, 1 en 4, ... 7 en 28
  }
  ecran(1);                                // On rallume.

  while (true) {                           // La boucle du jeu :
    image();

    if (bouton(DROITE)) sx++;      // la fenêtre glisse vers la droite : le décor part à gauche
    if (bouton(GAUCHE)) sx--;      // 0 - 1 donne 255 : la carte boucle aussi à l'envers
                                   // (sx va de 0 à 255 et la carte fait 256 pixels :
                                   //  après 255, on revient pile au début)

    defiler(sx, 0);                // une seule écriture par image
    sprite(0, 76, 88, HEROS);      // le héros ne bouge pas : les lutins ne défilent pas
  }
}
`,
    aVoir: 'Un sol et des chiffres de 0 à 7 ; DROITE fait glisser le décor vers la gauche, et après le 7 le 0 revient.',
    controle: (c) => {
      const debut = c.defilement()
      c.gb.setButton('right', true)
      c.avancer(40)
      const quarante = c.defilement()
      c.avancer(230)
      const tour = c.defilement()
      c.gb.setButton('right', false)
      c.avancer(2)
      return [
        ['au départ, la fenêtre est en 0', debut === 0],
        ['DROITE la fait glisser d’un pixel par image', quarante >= 39 && quarante <= 41, ` (${quarante})`],
        ['après 255, elle repart à 0 : la carte boucle', tour < quarante, ` (${tour})`],
        ['le décor est posé jusqu’à la colonne 31', c.lire(31, 12) === c.lire(0, 12) && c.lire(28, 10) !== 0],
        ['le héros n’a pas bougé', c.lutin(0).x === 76],
      ]
    },
  },

  {
    titre: 'Une carte plus grande que l’écran : la caméra',
    difficulte: 14,
    provenance: 'cours',
    idee: 'Le héros a une place dans le monde ; la caméra le suit ; l’écran montre le monde moins la caméra.',
    texte: [
      'Dans un vrai jeu, le héros **marche** dans un monde plus large que l’écran, et le décor glisse pour le garder en vue. Il y a donc **deux** positions : celle du héros **dans le monde** (`wx`, de 0 à 248 sur une carte de 256 pixels), et celle de la **caméra**, `cam` : le bord gauche de ce qu’on voit.',
      '**Ce qui est nouveau ici : l’écran = le monde - la caméra.** Le décor, on le fait glisser de `cam` : `defiler(cam, 0)`. Le héros, on le pose à `wx - cam` sur l’écran. Exemple : héros en `wx = 150`, caméra en `cam = 74` : il est dessiné au pixel 150 - 74 = 76, le milieu de l’écran.',
      'La caméra **suit** le héros : elle veut le garder au milieu, donc `cam = wx - 76`. Mais elle ne doit pas sortir de la carte. À gauche, si `wx < 76`, `wx - 76` passerait sous zéro (pour `wx = 30`, 30 - 76 donnerait 210 : la règle de l’octet, chapitre 1) : on la bloque à 0. À droite, l’écran fait 160 pixels et la carte 256 : la caméra ne va pas plus loin que 256 - 160 = **96**.',
      'Déroulons. `wx = 30` : trop à gauche, `cam = 0`, le héros est à 30 sur l’écran — il marche, le décor ne bouge pas. `wx = 150` : `cam = 74`, héros au milieu, le décor défile. `wx = 240` : `wx - 76 = 164`, plus que 96, donc `cam = 96`, et le héros est à 240 - 96 = 144 : il marche de nouveau seul vers le bord.',
      'C’est la caméra de presque tous les jeux de plateforme. Les chiffres du sol disent où l’on est dans le monde.',
      '**À toi :** au lieu de garder le héros pile au milieu, laisse-le libre entre les pixels 60 et 92 de l’écran (une « zone morte ») : la caméra ne bouge que s’il en sort.',
    ],
    code: `// CE PROGRAMME : un héros marche dans un monde plus large que l'écran ;
// une « caméra » le suit, sans jamais sortir de la carte.
//
// Ce qui est nouveau : deux positions.
//   wx  = la place du héros DANS LE MONDE (0 à 248).
//   cam = le bord gauche de ce qu'on voit, dans le monde (0 à 96).
//   Sur l'écran, le héros est à : wx - cam  (le monde moins la caméra).
//   Exemple : wx = 150, cam = 74 → dessiné au pixel 150 - 74 = 76, le milieu.

#include <Tuile>     // un dessin de 8 × 8 pixels
#include <ecran>     // éteint ou rallume l’écran
#include <poser>     // pose une tuile sur une case du fond
#include <nombre>    // écrit un nombre en chiffres
#include <bouton>    // lit un bouton de la manette
#include <defiler>   // fait glisser tout le fond
#include <sprite>    // place un lutin de 8 × 8 au pixel près

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

Tuile SOL = {
  "33333333", "12121212", "21212121", "22222222",
  "22222222", "22222222", "22222222", "22222222",
};

const uint8_t MILIEU = 76;        // le pixel du milieu de l'écran, pour le héros
const uint8_t CAM_MAX = 96;       // 256 - 160 : la caméra ne va pas plus loin

uint8_t wx = 8;       // le héros, DANS LE MONDE : 0 à 248
uint8_t cam = 0;      // le bord gauche de ce qu'on voit, dans le monde : 0 à 96

int main() {                           // Le jeu commence ici.
  ecran(0);                            // Dessin écran éteint.
  for (uint8_t c = 0; c < 32; c++) {   // Toute la carte (32 colonnes) :
    poser(c, 12, SOL);                 //   deux rangées de sol,
    poser(c, 13, SOL);
    if (c % 4 == 0) nombre(c, 10, c / 4, 1);   //   et un chiffre toutes les 4 colonnes.
  }
  ecran(1);                            // On rallume.

  while (true) {                       // La boucle du jeu :
    image();

    if (bouton(DROITE) && wx < 248) wx++;   // le héros marche dans le monde
    if (bouton(GAUCHE) && wx > 0) wx--;

    // La caméra suit le héros, sans sortir de la carte.
    if (wx < MILIEU) {
      cam = 0;                      // trop à gauche : la caméra reste au bord
                                    // (wx - 76 passerait sous 0 et donnerait 200 et quelques)
    } else if (wx - MILIEU > CAM_MAX) {
      cam = CAM_MAX;                // trop à droite : elle s'arrête à 96
    } else {
      cam = wx - MILIEU;            // sinon : le héros au milieu
    }
    // Déroulé : wx = 30 → cam = 0, héros à 30 ; wx = 150 → cam = 74, héros à 76 ;
    //           wx = 240 → 164 > 96 → cam = 96, héros à 144.

    defiler(cam, 0);                // le décor : décalé de cam
    sprite(0, wx - cam, 88, HEROS); // le héros : le monde moins la caméra
  }
}
`,
    aVoir: 'Le héros part à gauche et marche seul ; au milieu de l’écran, c’est le décor qui défile ; au bout de la carte, il marche de nouveau seul jusqu’au bord.',
    controle: (c) => {
      const depart = [c.lutin(0).x, c.defilement()]
      tenir(c, 'right', () => c.variable('wx') >= 150)
      const milieu = [c.variable('wx'), c.variable('cam'), c.lutin(0).x, c.defilement()]
      tenir(c, 'right', () => c.variable('wx') >= 248)
      const bout = [c.variable('cam'), c.lutin(0).x, c.defilement()]
      return [
        ['au départ : pas de défilement, le héros à 8', depart[0] === 8 && depart[1] === 0],
        ['au milieu du monde, le héros reste au milieu de l’écran', milieu[2] === 76 && milieu[1] === milieu[0] - 76, ` (wx ${milieu[0]}, cam ${milieu[1]})`],
        ['et le décor défile de cam', milieu[3] === milieu[1]],
        ['au bout, la caméra s’arrête à 96', bout[0] === 96 && bout[2] === 96],
        ['et le héros va seul jusqu’au bord : 248 - 96 = 152', bout[1] === 152, ` (${bout[1]})`],
      ]
    },
  },

  /* ================================================ 15 — tes propres #include */

  /*
   * Le chapitre que l'élève a demandé : « comment faire si je voulais ajouter
   * moi-même un #include ». Une seule fonction le traverse, bande(), qui fait
   * le voyage complet : écrite dans le programme (15.1), réemployée (15.2),
   * rangée dans un fichier voisin (15.3, 15.4), accompagnée d'une seconde
   * (15.5), devenue une fonction de la console (15.6), remplacée par la
   * sienne (15.7), et enfin la marche à suivre pour en ajouter une soi-même
   * (15.8). Une seule chose change d'une étape à l'autre.
   */

  {
    titre: 'Une fonction à toi : bande()',
    difficulte: 15,
    provenance: 'cours',
    idee: 'Avant de parler d’#include, on écrit une fonction à soi : bande() pose la même tuile plusieurs fois, de gauche à droite.',
    texte: [
      '**Ce chapitre répond à une question : « comment ajouter moi-même un `#include` ? »** Il y a deux sortes d’`#include`, et on va les faire toutes les deux, avec **une seule fonction**, du début à la fin : `bande()`.',
      '**On part de ce qu’on sait déjà faire** (chapitre « Les fonctions : nommer un geste ») : écrire une fonction dans son programme. `bande(colonne, ligne, tuile, longueur)` pose la tuile `longueur` fois, une case plus à droite à chaque fois.',
      '**Lis la fonction ligne par ligne :** `void` dit qu’elle ne rend rien ; entre les parenthèses, ses **quatre paramètres**, quatre cases de mémoire remplies par l’appel. La boucle `for` compte `i` de 0 jusqu’à `longueur - 1`, et pose la tuile en `colonne + i`.',
      '**Déroulé de `bande(2, 5, ALPHABET[0], 10)` :** i = 0 → case (2, 5) ; i = 1 → case (3, 5) ; … ; i = 9 → case (11, 5). Puis i = 10 : `10 < 10` est faux, la boucle s’arrête. Dix A, des colonnes 2 à 11.',
      '**Pour l’instant, aucun `#include` nouveau :** la fonction est **dans** le programme, elle n’a rien à demander à la console. Elle se sert seulement de `poser()`, déjà incluse.',
    ],
    code: `// Une fonction à toi : bande().
// Elle est écrite ICI, dans le programme : pas besoin d'#include pour elle.

#include <poser>      // pose une tuile sur une case du fond (bande() s'en sert)
#include <ALPHABET>   // les lettres de la police : ALPHABET[0] est le A

// bande(colonne, ligne, tuile, longueur) : la même tuile, « longueur » fois,
// de gauche à droite. Exemple : bande(2, 5, ALPHABET[0], 10) → dix A,
// des colonnes 2 à 11, sur la ligne 5.
//
//   void         elle ne rend rien : elle agit, c'est tout
//   uint8_t ...  ses quatre paramètres : des nombres de 0 à 255
void bande(uint8_t colonne, uint8_t ligne, uint8_t tuile, uint8_t longueur) {
  // for (départ ; condition ; après chaque tour)
  //   i = 0 au départ ; on continue tant que i < longueur ; i++ ajoute 1.
  for (uint8_t i = 0; i < longueur; i++) {
    poser(colonne + i, ligne, tuile);   // une case plus à droite à chaque tour
  }
}

int main() {
  bande(2, 5, ALPHABET[0], 10);   // l'appel : dix A sur la ligne 5

  while (true) {   // la boucle du jeu
    image();       // attend l'image suivante (native : pas d'#include)
  }
}
`,
    aVoir: 'Dix A côte à côte sur la ligne 5, des colonnes 2 à 11.',
    controle: (c) => [
      ['dix A sur la ligne 5, de la colonne 2 à la 11', c.mot(2, 5, 10) === 'AAAAAAAAAA'],
      ['rien avant la colonne 2', c.mot(1, 5, 1) !== 'A'],
      ['et rien après la colonne 11', c.mot(12, 5, 1) !== 'A'],
    ],
  },

  {
    titre: 'La même fonction, trois fois',
    difficulte: 15,
    provenance: 'cours',
    idee: 'Une fonction s’écrit une fois et s’appelle autant qu’on veut : trois bandes, trois longueurs, trois lettres.',
    texte: [
      '**C’est le programme d’avant**, avec **deux appels de plus** dans `main()`. La fonction, elle, ne change pas d’une lettre.',
      '**Chaque appel remplit les paramètres autrement :** `bande(2, 7, ALPHABET[1], 6)` met 2 dans `colonne`, 7 dans `ligne`, le B dans `tuile`, 6 dans `longueur`. Six B, des colonnes 2 à 7.',
      '**C’est tout l’intérêt d’une fonction :** le geste (« poser une rangée ») est écrit **une seule fois**. C’est aussi ce qui va nous donner envie de la **ranger à part** : une fonction aussi utile, on voudrait la réemployer dans d’autres programmes, sans la recopier.',
      '**Essaie :** ajoute `bande(0, 11, ALPHABET[3], 20);` — une ligne entière de D, de la colonne 0 à la 19.',
    ],
    code: `// La même fonction, trois fois : seuls les appels de main() changent.

#include <poser>      // pose une tuile sur une case du fond
#include <ALPHABET>   // ALPHABET[0] = A, [1] = B, [2] = C…

// bande(colonne, ligne, tuile, longueur) : comme à l'étape d'avant.
void bande(uint8_t colonne, uint8_t ligne, uint8_t tuile, uint8_t longueur) {
  for (uint8_t i = 0; i < longueur; i++) {
    poser(colonne + i, ligne, tuile);
  }
}

int main() {
  bande(2, 5, ALPHABET[0], 10);   // dix A  : colonnes 2 à 11, ligne 5
  bande(2, 7, ALPHABET[1], 6);    // NOUVEAU : six B   : colonnes 2 à 7,  ligne 7
  bande(2, 9, ALPHABET[2], 3);    // NOUVEAU : trois C : colonnes 2 à 4,  ligne 9

  while (true) {
    image();
  }
}
`,
    aVoir: 'Trois rangées : dix A, six B, trois C, toutes calées à gauche sur la colonne 2.',
    controle: (c) => [
      ['dix A sur la ligne 5', c.mot(2, 5, 10) === 'AAAAAAAAAA'],
      ['six B sur la ligne 7', c.mot(2, 7, 6) === 'BBBBBB' && c.mot(8, 7, 1) !== 'B'],
      ['trois C sur la ligne 9', c.mot(2, 9, 3) === 'CCC' && c.mot(5, 9, 1) !== 'C'],
    ],
  },

  {
    titre: 'Ranger sa fonction dans un fichier voisin : #include "outils.cpp"',
    difficulte: 15,
    provenance: 'cours',
    idee: 'La première sorte d’#include, avec des guillemets : bande() déménage dans l’onglet outils.cpp, et principal.cpp le verse chez lui.',
    texte: [
      '**Ce qui est nouveau ici : la fonction a déménagé.** Elle n’est plus dans `principal.cpp` : elle est dans un **second onglet**, `outils.cpp`. Dans l’atelier, c’est le bouton **« + fichier »**, au-dessus de l’éditeur, qui crée un onglet comme celui-là.',
      '**`#include "outils.cpp"` veut dire « verse ici tout le texte d’`outils.cpp` ».** Avant de compiler, la console remplace cette ligne par le contenu du fichier, mot pour mot. Le compilateur voit donc **exactement** le programme de l’étape d’avant : même cartouche, même écran.',
      '**Les guillemets `"…"` désignent un fichier À TOI**, écrit à côté du programme. Retiens-le bien, car l’étape 15.6 montrera l’autre sorte, avec des chevrons `<…>`, qui désigne une fonction **de la console**.',
      '**Où placer la ligne :** l’habitude est de mettre tous les `#include` en haut, ensemble. Pour des **fonctions**, l’ordre ne compte pas : le compilateur relève toutes les fonctions avant de les traduire, et `main()` peut appeler `bande()` même si son texte est collé plus bas. Pour des **variables globales** ou des **dessins**, si : ils doivent être versés **avant** la fonction qui s’en sert.',
      '**Pourquoi l’extension `.cpp` et pas `.h` :** les deux marchent ici. Par habitude, un `.h` (« header ») contient des déclarations (des variables, des noms) ; un `.cpp` contient du code, des fonctions. `outils.cpp` contient une fonction.',
    ],
    fichiers: {
      'outils.cpp': `// outils.cpp : MES fonctions, rangées à part.
// Ce fichier ne fait rien tout seul : principal.cpp le verse chez lui
// avec #include "outils.cpp" (des GUILLEMETS : c'est un fichier à moi).

// bande(colonne, ligne, tuile, longueur) : la même tuile, « longueur » fois,
// de gauche à droite. Exemple : bande(2, 5, ALPHABET[0], 10) → dix A.
void bande(uint8_t colonne, uint8_t ligne, uint8_t tuile, uint8_t longueur) {
  for (uint8_t i = 0; i < longueur; i++) {
    poser(colonne + i, ligne, tuile);   // poser() : incluse par principal.cpp
  }
}
`,
    },
    code: `// Le changement : bande() n'est plus écrite ici, mais dans outils.cpp.
//
//   #include "outils.cpp"
//   |        |
//   |        +-- le fichier à verser : l'onglet « outils.cpp », à côté
//   +----------- « verse ici » : avant la compilation, cette ligne est
//                remplacée par tout le texte d'outils.cpp. Tout se passe
//                comme si bande() était écrite ici, comme à l'étape d'avant.

#include <poser>      // pose une tuile (c'est bande() qui s'en sert)
#include <ALPHABET>   // les lettres de la police
#include "outils.cpp" // NOUVEAU : mes fonctions à moi, versées ici

int main() {
  bande(2, 5, ALPHABET[0], 10);   // bande() vient d'outils.cpp
  bande(2, 7, ALPHABET[1], 6);
  bande(2, 9, ALPHABET[2], 3);

  while (true) {
    image();
  }
}
`,
    aVoir: 'Exactement l’écran d’avant : dix A, six B, trois C. Mais le programme est rangé en deux onglets.',
    controle: (c) => [
      ['bande() vient d’outils.cpp : dix A sur la ligne 5', c.mot(2, 5, 10) === 'AAAAAAAAAA'],
      ['six B, trois C : le même écran qu’avant', c.mot(2, 7, 6) === 'BBBBBB' && c.mot(2, 9, 3) === 'CCC'],
    ],
  },

  {
    titre: 'Le fichier voisin écrit ses propres #include <…>',
    difficulte: 15,
    provenance: 'cours',
    idee: 'outils.cpp se sert de poser() : c’est donc lui qui écrit #include <poser>. Le fichier se suffit à lui-même.',
    texte: [
      '**Le seul changement : la ligne `#include <poser>` a changé d’onglet.** Elle était dans `principal.cpp` ; elle est maintenant **en haut d’`outils.cpp`**.',
      '**Pourquoi c’est mieux :** c’est `bande()` qui se sert de `poser()`, pas `main()`. En écrivant la ligne **dans le fichier qui en a besoin**, `outils.cpp` se suffit à lui-même : un autre programme qui écrit `#include "outils.cpp"` n’a rien d’autre à penser.',
      '**Et si deux fichiers écrivent la même ligne ?** Si `principal.cpp` gardait aussi son `#include <poser>`, ce ne serait pas une erreur : une fonction de la console n’est gravée **qu’une fois**, et une ligne de trop ne coûte rien.',
      '**Le texte versé, en entier :** `#include <ALPHABET>`, puis tout `outils.cpp` (son `#include <poser>` et `bande()`), puis `main()`. Un `#include <…>` vaut pour **tout** le programme assemblé, où qu’il soit écrit : celui d’`outils.cpp` autorise `poser()` partout.',
    ],
    fichiers: {
      'outils.cpp': `// outils.cpp : MES fonctions, rangées à part.
// Il écrit LUI-MÊME ce dont il a besoin : il se suffit à lui-même.

#include <poser>   // NOUVEAU ICI : bande() se sert de poser()

// bande(colonne, ligne, tuile, longueur) : la même tuile, « longueur » fois,
// de gauche à droite. Exemple : bande(2, 5, ALPHABET[0], 10) → dix A.
void bande(uint8_t colonne, uint8_t ligne, uint8_t tuile, uint8_t longueur) {
  for (uint8_t i = 0; i < longueur; i++) {
    poser(colonne + i, ligne, tuile);
  }
}
`,
    },
    code: `// Le changement : « #include <poser> » est parti dans outils.cpp,
// le fichier qui s'en sert. main() n'appelle pas poser() lui-même.

#include <ALPHABET>   // les lettres : c'est main() qui s'en sert
#include "outils.cpp" // mes fonctions (et leurs #include à elles)

int main() {
  bande(2, 5, ALPHABET[0], 10);
  bande(2, 7, ALPHABET[1], 6);
  bande(2, 9, ALPHABET[2], 3);

  while (true) {
    image();
  }
}
`,
    aVoir: 'Toujours le même écran : dix A, six B, trois C.',
    controle: (c) => [
      ['outils.cpp inclut poser() lui-même : les bandes sont là', c.mot(2, 5, 10) === 'AAAAAAAAAA' && c.mot(2, 9, 3) === 'CCC'],
    ],
  },

  {
    titre: 'Une deuxième fonction dans outils.cpp : pile()',
    difficulte: 15,
    provenance: 'cours',
    idee: 'Un fichier d’outils grandit : pile() fait comme bande(), mais vers le bas. principal.cpp n’a rien à ajouter pour s’en servir.',
    texte: [
      '**Ce qui est nouveau ici : `pile(colonne, ligne, tuile, hauteur)`**, une deuxième fonction dans `outils.cpp`. C’est `bande()` tournée d’un quart de tour : la tuile est posée **vers le bas**, en `ligne + i`.',
      '**Déroulé de `pile(15, 4, ALPHABET[3], 6)` :** i = 0 → (15, 4) ; i = 1 → (15, 5) ; … ; i = 5 → (15, 9). Six D, l’un sous l’autre.',
      '**Aucune ligne ajoutée dans principal.cpp pour l’avoir :** le `#include "outils.cpp"` verse **tout** le fichier, donc toutes ses fonctions. Un fichier d’outils, c’est cela : une boîte où l’on range ses fonctions, et qu’on ouvre d’une seule ligne.',
      '**Essaie :** écris une troisième fonction dans `outils.cpp`, par exemple `void carreDe(colonne, ligne, tuile)` qui appelle `bande()` deux fois.',
    ],
    fichiers: {
      'outils.cpp': `// outils.cpp : MES fonctions, rangées à part.

#include <poser>   // bande() et pile() se servent de poser()

// bande(colonne, ligne, tuile, longueur) : vers la DROITE.
// Exemple : bande(2, 5, ALPHABET[0], 10) → dix A, colonnes 2 à 11.
void bande(uint8_t colonne, uint8_t ligne, uint8_t tuile, uint8_t longueur) {
  for (uint8_t i = 0; i < longueur; i++) {
    poser(colonne + i, ligne, tuile);   // la COLONNE avance
  }
}

// NOUVEAU : pile(colonne, ligne, tuile, hauteur) : vers le BAS.
// Exemple : pile(15, 4, ALPHABET[3], 6) → six D, lignes 4 à 9.
void pile(uint8_t colonne, uint8_t ligne, uint8_t tuile, uint8_t hauteur) {
  for (uint8_t i = 0; i < hauteur; i++) {
    poser(colonne, ligne + i, tuile);   // c'est la LIGNE qui avance
  }
}
`,
    },
    code: `// Le changement : main() appelle aussi pile(), la nouvelle fonction
// d'outils.cpp. Rien à ajouter en haut : outils.cpp est déjà versé.

#include <ALPHABET>
#include "outils.cpp" // bande() ET pile()

int main() {
  bande(2, 5, ALPHABET[0], 10);
  bande(2, 7, ALPHABET[1], 6);
  bande(2, 9, ALPHABET[2], 3);
  pile(15, 4, ALPHABET[3], 6);    // NOUVEAU : six D, de la ligne 4 à la 9

  while (true) {
    image();
  }
}
`,
    aVoir: 'Les trois bandes d’avant, et une colonne de six D à droite (colonne 15, lignes 4 à 9).',
    controle: (c) => {
      const colonne = [4, 5, 6, 7, 8, 9].map((l) => c.mot(15, l, 1)).join('')
      return [
        ['six D l’un sous l’autre, colonne 15', colonne === 'DDDDDD', ` (${colonne})`],
        ['rien en dessous, ligne 10', c.mot(15, 10, 1) !== 'D'],
        ['les bandes sont toujours là', c.mot(2, 5, 10) === 'AAAAAAAAAA'],
      ]
    },
  },

  {
    titre: 'bande() devient une fonction de la console : #include <bande>',
    difficulte: 15,
    provenance: 'cours',
    idee: 'La seconde sorte d’#include, avec des chevrons : bande() a été ajoutée à la console elle-même. On ne l’écrit plus, on la demande.',
    texte: [
      '**Ce qui est nouveau ici : `#include <bande>`**, avec des **chevrons**. `bande()` n’est plus dans `outils.cpp` (il n’y reste que `pile()`) : elle fait maintenant partie **de la console**, comme `poser()` ou `texte()`. On ne l’écrit plus, on la **demande**.',
      '**Guillemets ou chevrons, la différence en une phrase :** `#include "outils.cpp"` verse **ton fichier** ; `#include <bande>` demande **une fonction de la console**, que le compilateur connaît déjà et n’ajoute à la cartouche que si le programme l’appelle.',
      '**Sans la ligne, le compilateur refuse :** efface `#include <bande>` et lance. Le message dit : « il faut #include <bande> pour employer bande() ». C’est la règle de toute la console : ce qu’on emploie, on l’inclut par son nom.',
      '**Comment `bande()` est entrée dans la console.** Il a fallu toucher **trois fichiers du projet** (pas le programme : le compilateur lui-même). On les ouvre dans un éditeur de texte, à côté d’`index.html` :',
      '**1. `compilateur/emetteur.js` — le code de la fonction.** On y écrit sa source, **en C, exactement comme dans `outils.cpp`**, dans une constante, `SOURCE_BANDE`, entre deux accents graves (la touche AltGr + 7) : le texte de la fonction, mot pour mot. Puis on l’inscrit dans le tableau `FONCTIONS_EN_C`, juste en dessous : `bande: SOURCE_BANDE,`. Le compilateur ajoute ce texte au programme **seulement** s’il appelle `bande()`.',
      '**2. `compilateur/inclusion.js` — le nom à inclure.** Dans le tableau `BIBLIOTHEQUES`, une ligne : `bande: \'pose la même tuile plusieurs fois, de gauche à droite\',`. C’est elle qui rend `#include <bande>` valable, et la phrase sert de commentaire quand l’atelier écrit les `#include` tout seul.',
      '**3. `aide-fonctions.js` — l’aide de l’éditeur.** Dans `FONCTIONS` : `bande: { args: [\'colonne\', \'ligne\', \'tuile\', \'longueur\'], dit: \'…\' },`. L’éditeur propose alors `bande` quand on tape « ban… », et montre les arguments pendant qu’on les écrit.',
      '**Un détail : dans la console, `bande()` n’écrit pas `#include <poser>`.** Ce que la console ajoute elle-même n’a rien à inclure : le compilateur le sait (c’est le drapeau `deLaConsole`).',
      '**Après avoir changé ces fichiers :** recharge la page avec **Ctrl+F5**. Le compilateur est relu, et `#include <bande>` marche aussitôt.',
    ],
    fichiers: {
      'outils.cpp': `// outils.cpp : MES fonctions. bande() n'y est plus : elle est
// dans la console, demandée par #include <bande> dans principal.cpp.

#include <poser>   // pile() se sert de poser()

// pile(colonne, ligne, tuile, hauteur) : vers le BAS.
// Exemple : pile(15, 4, ALPHABET[3], 6) → six D, lignes 4 à 9.
void pile(uint8_t colonne, uint8_t ligne, uint8_t tuile, uint8_t hauteur) {
  for (uint8_t i = 0; i < hauteur; i++) {
    poser(colonne, ligne + i, tuile);
  }
}
`,
    },
    code: `// Le changement : bande() vient de la CONSOLE, plus d'outils.cpp.
//
//   #include <bande>     des CHEVRONS : une fonction de la console
//   #include "outils.cpp"  des GUILLEMETS : un fichier à moi

#include <ALPHABET>
#include <bande>      // NOUVEAU : pose la même tuile plusieurs fois, de gauche à droite
#include "outils.cpp" // il ne contient plus que pile()

int main() {
  bande(2, 5, ALPHABET[0], 10);   // la bande() de la console
  bande(2, 7, ALPHABET[1], 6);
  bande(2, 9, ALPHABET[2], 3);
  pile(15, 4, ALPHABET[3], 6);    // la pile() d'outils.cpp

  while (true) {
    image();
  }
}
`,
    aVoir: 'Le même écran : trois bandes et une pile. bande() vient maintenant de la console.',
    controle: (c) => [
      ['la bande() de la console pose dix A', c.mot(2, 5, 10) === 'AAAAAAAAAA'],
      ['six B, trois C', c.mot(2, 7, 6) === 'BBBBBB' && c.mot(2, 9, 3) === 'CCC'],
      ['et la pile() d’outils.cpp est toujours là', c.mot(15, 9, 1) === 'D'],
    ],
  },

  {
    titre: 'Ta fonction passe avant celle de la console',
    difficulte: 15,
    provenance: 'cours',
    idee: 'Si ton programme écrit une fonction du même nom qu’une fonction de la console, c’est la tienne qui compte.',
    texte: [
      '**Le seul changement : `outils.cpp` écrit de nouveau une `bande()`**, mais **en pointillés** : une case sur deux. `#include <bande>` est toujours là, dans `principal.cpp`.',
      '**Laquelle gagne ?** La tienne. Le compilateur ajoute une fonction de la console **seulement si le programme n’en a pas écrit une du même nom**. Ici, il voit ta `bande()` : il n’ajoute pas la sienne, et la ligne `#include <bande>` ne grave rien.',
      '**La boucle en pointillés :** `i = i + 2` au lieu de `i++`. Déroulé de `bande(2, 5, ALPHABET[0], 10)` : i = 0 → (2, 5) ; i = 2 → (4, 5) ; i = 4 → (6, 5) ; i = 6 → (8, 5) ; i = 8 → (10, 5) ; i = 10 : `10 < 10` est faux, fin. Cinq A, un trou entre chaque.',
      '**À quoi ça sert :** à **essayer une autre version** d’une fonction de la console sans toucher au compilateur. Si la tienne te plaît, tu sais maintenant comment la faire entrer dans la console (étape précédente).',
      '**Essaie :** supprime la `bande()` d’`outils.cpp` : celle de la console revient, et les bandes redeviennent pleines.',
    ],
    fichiers: {
      'outils.cpp': `// outils.cpp : MES fonctions.

#include <poser>

// NOUVEAU : MA bande(), en pointillés. Elle porte le même nom que celle de
// la console : c'est la mienne qui compte, la console n'ajoute pas la sienne.
// Exemple : bande(2, 5, ALPHABET[0], 10) → A aux colonnes 2, 4, 6, 8, 10.
void bande(uint8_t colonne, uint8_t ligne, uint8_t tuile, uint8_t longueur) {
  for (uint8_t i = 0; i < longueur; i = i + 2) {   // i = i + 2 : une case sur deux
    poser(colonne + i, ligne, tuile);
  }
}

// pile(colonne, ligne, tuile, hauteur) : vers le BAS.
void pile(uint8_t colonne, uint8_t ligne, uint8_t tuile, uint8_t hauteur) {
  for (uint8_t i = 0; i < hauteur; i++) {
    poser(colonne, ligne + i, tuile);
  }
}
`,
    },
    code: `// Le changement est dans outils.cpp : il écrit sa propre bande().
// principal.cpp garde « #include <bande> », mais c'est la mienne qui sert.

#include <ALPHABET>
#include <bande>      // la bande() de la console… qui ne servira pas ici
#include "outils.cpp" // MA bande() (en pointillés) et pile()

int main() {
  bande(2, 5, ALPHABET[0], 10);   // MA bande() : cinq A, un trou entre chaque
  bande(2, 7, ALPHABET[1], 6);    // trois B : colonnes 2, 4, 6
  bande(2, 9, ALPHABET[2], 3);    // deux C  : colonnes 2, 4
  pile(15, 4, ALPHABET[3], 6);

  while (true) {
    image();
  }
}
`,
    aVoir: 'Les bandes sont en pointillés : A A A A A, B B B, C C. La pile de D ne change pas.',
    controle: (c) => [
      ['ta bande() est en pointillés : un A, un trou, un A…', c.mot(2, 5, 9) === 'A A A A A', ` (${c.mot(2, 5, 9)})`],
      ['trois B, deux C, eux aussi en pointillés', c.mot(2, 7, 5) === 'B B B' && c.mot(2, 9, 3) === 'C C'],
      ['pile() n’a pas changé', c.mot(15, 4, 1) === 'D' && c.mot(15, 9, 1) === 'D'],
    ],
  },

  {
    titre: 'À toi : ajouter ta propre fonction de la console, pas à pas',
    difficulte: 15,
    provenance: 'cours',
    idee: 'La marche à suivre complète, de l’idée à « #include <ta_fonction> » — et un cadre dessiné avec bande() et pile().',
    texte: [
      '**On revient à la `bande()` de la console** (`outils.cpp` ne contient plus que `pile()`, comme au 15.6), et on s’en sert pour **un cadre** : deux bandes (le haut et le bas), deux piles (la gauche et la droite). C’est la seule nouveauté du programme.',
      '**Déroulé du cadre :** `bande(3, 3, …, 14)` → le haut, colonnes 3 à 16 ; `bande(3, 12, …, 14)` → le bas ; `pile(3, 4, …, 8)` → la gauche, lignes 4 à 11 ; `pile(16, 4, …, 8)` → la droite. Les coins appartiennent aux bandes : les piles commencent une ligne plus bas.',
      '**Et maintenant, pour faire entrer `pile()` dans la console à son tour, voici la marche à suivre — la même pour n’importe quelle fonction :**',
      '**Étape 1 — l’écrire et l’essayer dans ton programme.** D’abord dans `principal.cpp`, ou dans un fichier voisin comme `outils.cpp`. Tant qu’elle n’est pas parfaite, elle reste là : c’est plus facile à corriger.',
      '**Étape 2 — choisir son nom.** Un nom qu’aucune fonction de la console ne porte déjà (la liste est dans `compilateur/inclusion.js`, tableau `BIBLIOTHEQUES`). Le nom du `#include` sera exactement celui de la fonction : `pile` → `#include <pile>`.',
      '**Étape 3 — `compilateur/emetteur.js`.** Cherche `const FONCTIONS_EN_C`. Juste au-dessus, colle ta fonction dans une constante, `const SOURCE_PILE = …`, entre deux accents graves (AltGr + 7), comme `SOURCE_BANDE` juste à côté. Dans le tableau, ajoute `pile: SOURCE_PILE,`. Retire son `#include <poser>` : la console n’en a pas besoin.',
      '**Étape 4 — `compilateur/inclusion.js`.** Dans `BIBLIOTHEQUES`, ajoute une ligne : `pile: \'pose la même tuile plusieurs fois, vers le bas\',`. Sans elle, `#include <pile>` serait refusé : « je ne connais pas cette bibliothèque ».',
      '**Étape 5 — `aide-fonctions.js`.** Dans `FONCTIONS`, ajoute `pile: { args: [\'colonne\', \'ligne\', \'tuile\', \'hauteur\'], dit: \'…\' },` pour que l’éditeur la propose.',
      '**Étape 6 — essayer.** Recharge la page (**Ctrl+F5**), enlève `pile()` d’`outils.cpp`, écris `#include <pile>` dans `principal.cpp`, et lance. En ligne de commande : `node outils/gb3.mjs mon-essai.cpp` compile un fichier, et `npm run verifier` vérifie que rien d’autre n’est cassé.',
      '**Étape 7 — sa leçon.** Dans ce projet, chaque `#include` a son tuto : une leçon dans `tuto/lecons.js` dont le programme commence par `// ---- #include <pile> : …`. Le parcours la place tout seul juste avant la première étape qui emploie `pile()`. Copie celle de `bande()` et change ce qu’il faut.',
      '**Pour aller plus loin :** les fonctions qui parlent directement au matériel (l’écran, le son) ne sont pas écrites en C mais en instructions du processeur, dans `compilateur/emetteur.js` (cherche `if (nom === \'cacherPanneau\')`). C’est plus difficile : la façon en C suffit pour tout ce qu’on peut écrire avec les fonctions existantes.',
    ],
    fichiers: {
      'outils.cpp': `// outils.cpp : MES fonctions. pile() est la prochaine à faire entrer
// dans la console, en suivant les étapes 1 à 7 de cette leçon.

#include <poser>   // pile() se sert de poser()

// pile(colonne, ligne, tuile, hauteur) : vers le BAS.
// Exemple : pile(3, 4, ALPHABET[23], 8) → huit X, lignes 4 à 11.
void pile(uint8_t colonne, uint8_t ligne, uint8_t tuile, uint8_t hauteur) {
  for (uint8_t i = 0; i < hauteur; i++) {
    poser(colonne, ligne + i, tuile);
  }
}
`,
    },
    code: `// Un cadre de X : bande() (de la console) pour le haut et le bas,
// pile() (d'outils.cpp) pour les côtés.
//
//   colonnes 3 à 16, lignes 3 à 12 :
//
//     XXXXXXXXXXXXXX   ← bande(3, 3, X, 14)   le haut
//     X            X   ← pile(3, 4, X, 8)  et  pile(16, 4, X, 8)
//     X            X      les côtés, lignes 4 à 11
//     XXXXXXXXXXXXXX   ← bande(3, 12, X, 14)  le bas

#include <ALPHABET>
#include <bande>      // pose la même tuile plusieurs fois, de gauche à droite
#include "outils.cpp" // pile()

int main() {
  bande(3, 3, ALPHABET[23], 14);    // le haut  (ALPHABET[23] : le X, 24e lettre)
  bande(3, 12, ALPHABET[23], 14);   // le bas
  pile(3, 4, ALPHABET[23], 8);      // le côté gauche  : lignes 4 à 11
  pile(16, 4, ALPHABET[23], 8);     // le côté droit

  while (true) {
    image();
  }
}
`,
    aVoir: 'Un cadre de X au milieu de l’écran : colonnes 3 à 16, lignes 3 à 12, vide à l’intérieur.',
    controle: (c) => [
      ['le haut : quatorze X', c.mot(3, 3, 14) === 'XXXXXXXXXXXXXX'],
      ['le bas : quatorze X', c.mot(3, 12, 14) === 'XXXXXXXXXXXXXX'],
      ['les côtés : un X à chaque bout, rien entre les deux', c.mot(3, 7, 1) === 'X' && c.mot(16, 7, 1) === 'X' && !c.mot(4, 7, 12).includes('X')],
    ],
  },
]

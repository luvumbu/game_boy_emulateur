/**
 * Les leçons du tutoriel.
 *
 * Chacune porte son titre, sa DIFFICULTÉ de 1 à 10, son explication, son
 * programme, et **ce qu'on doit voir**. Ce dernier point n'est pas décoratif :
 * `verifier-tuto.mjs` compile chaque leçon, la fait tourner dans un vrai
 * émulateur, et contrôle que ce qu'elle promet arrive vraiment. Un tutoriel
 * dont le code ne marche pas est pire qu'aucun tutoriel.
 *
 * L'ORDRE N'EST PAS CELUI DU FICHIER : les leçons sortent triées par
 * difficulté. Écrire l'ordre à la main obligeait à déplacer cent lignes pour
 * insérer une leçon facile au milieu, et l'on finissait par la mettre au bout
 * — où personne ne la trouve au bon moment. Ici, il suffit de dire « celle-ci
 * vaut 4 ».
 *
 * Le tri est STABLE : deux leçons de même difficulté restent dans l'ordre où
 * elles sont écrites ici.
 *
 * `partie: 'Le temps'`, sur la leçon qui l'ouvre, coupe un niveau en parties
 * (A, B, C… comptées toutes seules, voir `partieDe`). Le chapitre 0 en a dix ;
 * les numéros des leçons n'en dépendent pas.
 *
 * `controle` est exécuté avec un objet qui sait lire la console :
 *
 *   lire(colonne, ligne)   la tuile affichée à cet endroit
 *   mot(colonne, ligne, n) les n tuiles à partir de là, en texte
 *   variable(nom)          la valeur d'une variable du programme
 *   lutin(n)               { x, y, tuile } du lutin numéro n
 *   presser(bouton, images)
 *   avancer(images)
 */

/**
 * Les dix niveaux, et ce qu'on y apprend.
 *
 * Un nombre tout seul ne dit rien — « difficulté 7 » ne se compare qu'à
 * lui-même. Le nom du niveau, lui, annonce ce qu'on va y faire, et c'est ce
 * qui permet de choisir par où revenir.
 */
export const NIVEAUX = {
  0: 'Avant tout',
  1: 'Les tout premiers pas',
  2: 'Retenir, et réagir',
  3: 'Dessiner',
  4: 'Le mouvement',
  5: 'Le son',
  6: 'Ranger ce qu’on manipule',
  7: 'Découper son programme',
  8: 'Ce qui va ensemble',
  9: 'Un vrai jeu',
  10: 'Aller au bout',
}

import { TUTORIELS } from './tutoriels.js'

/*
 * Pour les contrôles des leçons de déplacement : suivre des lettres.
 *
 * On avance image par image, et l'on note pour chaque lettre la liste de ses
 * places successives, « 10,8 » voulant dire colonne 10, ligne 8. Une place
 * n'est notée que quand elle change. « lignes » : combien de lignes fouiller
 * (17 quand la ligne 17 porte des nombres affichés).
 */
function suivre(c, lettres, images, lignes = 18) {
  const chemins = Object.fromEntries([...lettres].map((l) => [l, []]))
  for (let k = 0; k < images; k++) {
    c.avancer(1)
    for (let l = 0; l < lignes; l++) {
      const rangee = c.mot(0, l, 20)
      for (const lettre of lettres) {
        const i = rangee.indexOf(lettre)
        if (i >= 0 && chemins[lettre].at(-1) !== i + ',' + l) chemins[lettre].push(i + ',' + l)
      }
    }
  }
  return chemins
}

const ECRITES = [
  /*
   * Le chapitre 0 : « difficulte: 0 ». Ses leçons se numérotent 0.0, 0.1,
   * 0.2… dans l'ordre où elles sont écrites ici.
   */
  {
    titre: 'Le programme qui ne fait rien',
    difficulte: 0,
    partie: 'Écrire des lettres',
    idee: 'Le squelette de tout programme : int main(), et la boucle while.',
    texte: [
      '**`int main()`** est le point de départ. Quand la console s’allume, c’est là qu’elle arrive, et nulle part ailleurs. Tout ce que fait le programme s’écrit entre ses accolades `{ }`.',
      '**`while (true)`** veut dire « tant que vrai » : ce qui est entre ses accolades recommence **sans jamais s’arrêter**. C’est la **boucle de jeu**. Un jeu ne se termine pas tout seul : il attend le joueur.',
      '**`image()`** attend la prochaine image de l’écran. Il y en a **60 par seconde** : la boucle fait donc un tour tous les soixantièmes de seconde.',
      'Ce programme ne montre rien, mais il tourne. Tous les suivants partent de lui : on ajoutera des choses **avant** la boucle (ce qui se fait une fois) et **dedans** (ce qui se fait à chaque image).',
    ],
    code: `int main() {
  while (true) {
    image();
  }
}
`,
    aVoir: 'Rien : l’écran reste vide, mais la console tourne.',
    controle: (c) => {
      c.avancer(30)
      return [
        ['l’écran est allumé', c.ecranAllume()],
        ['et rien n’y est écrit', c.mot(0, 0, 20).trim() === ''],
      ]
    },
  },

  {
    titre: 'Afficher la lettre A',
    difficulte: 0,
    idee: 'Une seule lettre, dans la toute première case de l’écran.',
    texte: [
      'Les lettres sont **déjà dessinées** dans le programme : c’est la police, chargée au démarrage. Il suffit de dire laquelle afficher, et où.',
      '`texte(0, 0, "A")` écrit **A** dans la case de la colonne **0**, ligne **0** : celle en haut à gauche. L’écran fait 20 colonnes (0 à 19) sur 18 lignes (0 à 17).',
      'La ligne est écrite **avant** la boucle : on n’écrit le A qu’une fois, et il reste affiché.',
    ],
    code: `int main() {
  texte(0, 0, "A");   // colonne 0, ligne 0 : la case en haut à gauche

  while (true) {
    image();
  }
}
`,
    aVoir: 'Un A, tout en haut à gauche de l’écran.',
    controle: (c) => {
      c.avancer(10)
      return [
        ['le A est dans la case (0, 0)', c.mot(0, 0, 1) === 'A'],
        ['la case d’à côté est vide', c.mot(1, 0, 1) === ' '],
      ]
    },
  },

  {
    titre: 'Afficher la lettre A — de base, ailleurs',
    difficulte: 0,
    suite: true,
    idee: 'Le même A qu’au 0.1, mais au milieu de l’écran : texte(10, 8, "A").',
    texte: [
      '**C’est le 0.1**, avec un seul changement : la **place** du A. Il n’est plus en (0, 0), en haut à gauche, mais en **(10, 8)**, au milieu de l’écran.',
      '**Les deux premiers nombres de `texte`** sont la colonne (de 0 à 19, de gauche à droite) et la ligne (de 0 à 17, de haut en bas). Le milieu de l’écran est vers la colonne 10 et la ligne 8.',
      '**C’est la version de base** : une seule chose, à la deuxième place. Le 0.1.2 met les deux ensemble.',
    ],
    code: `int main() {
  // Le changement : la place. (0, 0) → (10, 8).
  //
  //   texte(10, 8, "A");
  //         |   |
  //         |   +-- ligne 8   : vers le milieu, de haut en bas (0 à 17)
  //         +------ colonne 10 : vers le milieu, de gauche à droite (0 à 19)
  texte(10, 8, "A");

  while (true) {
    image();
  }
}
`,
    aVoir: 'Un A au milieu de l’écran.',
    controle: (c) => {
      c.avancer(20)
      return [
        ['le A est au milieu, en (10, 8)', c.mot(10, 8, 1) === 'A'],
        ['et plus en haut à gauche', c.mot(0, 0, 1) === ' '],
      ]
    },
  },

  {
    titre: 'Afficher la lettre A — doublé, deux positions',
    difficulte: 0,
    suite: true,
    idee: 'Deux A : un en haut à gauche (0, 0), un au milieu (10, 8). Deux lignes texte, deux places.',
    texte: [
      '**C’est le 0.1 et le 0.1.1 réunis** : deux lignes `texte`, une par place.',
      '**Chaque appel écrit sa lettre à sa place**, et les deux restent à l’écran : elles ne sont pas au même endroit, donc aucune n’écrase l’autre (le 0.3 montre ce qui arrive quand elles le sont).',
    ],
    code: `int main() {
  texte(0, 0, "A");     // 1. en haut à gauche (le 0.1)
  texte(10, 8, "A");    // 2. au milieu (le 0.1.1)

  while (true) {
    image();
  }
}
`,
    aVoir: 'Deux A : un en haut à gauche, un au milieu de l’écran.',
    controle: (c) => {
      c.avancer(20)
      return [
        ['un A en haut à gauche', c.mot(0, 0, 1) === 'A'],
        ['un A au milieu', c.mot(10, 8, 1) === 'A'],
      ]
    },
  },

  {
    titre: 'A, pris dans ALPHABET à l’indice 0',
    difficulte: 0,
    idee: 'L’alphabet de la console est un tableau : sa première case est l’indice 0.',
    texte: [
      '**`ALPHABET`** est le tableau des 26 lettres de la console. Il existe déjà : on ne le crée pas, on s’en sert.',
      'En C++, un tableau commence à l’indice **0**. `ALPHABET[0]` est donc la **première** lettre, A ; `ALPHABET[25]` est la dernière, Z.',
      '`poser(0, 0, ALPHABET[0])` pose cette lettre dans la case (0, 0).',
      '**Pourquoi `poser()` et pas `texte()` ?** `ALPHABET[0]` n’est pas un texte : c’est un **nombre**, le numéro de la tuile du A (1). `texte()` n’accepte que des lettres entre guillemets ; pour mettre une tuile à partir de son numéro, c’est `poser()`. Écrire `texte(0, 0, ALPHABET[0])` est une erreur : le compilateur la refuse.',
    ],
    code: `int main() {
  poser(0, 0, ALPHABET[0]);   // l'indice 0 : la première lettre, A
  // (ne pas faire cette erreur : texte(0, 0, ALPHABET[0]) est refusé,
  //  car ALPHABET[0] est un numéro de tuile, pas un texte)

  while (true) {
    image();
  }
}
`,
    aVoir: 'Un A, tout en haut à gauche de l’écran.',
    controle: (c) => {
      c.avancer(10)
      return [
        ['ALPHABET[0] pose un A en (0, 0)', c.mot(0, 0, 1) === 'A'],
        ['la case d’à côté est vide', c.mot(1, 0, 1) === ' '],
      ]
    },
  },

  {
    titre: 'A, pris dans ALPHABET à l’indice 0 — de base, ailleurs',
    difficulte: 0,
    suite: true,
    idee: 'Le même poser(…, ALPHABET[0]) qu’au 0.2, au milieu de l’écran.',
    texte: [
      '**C’est le 0.2**, avec un seul changement : la **place** : (10, 8), le milieu de l’écran, au lieu de (0, 0).',
      '**`poser` prend la même place que `texte`** : la colonne d’abord (0 à 19), puis la ligne (0 à 17).',
      '**C’est la version de base** : une seule chose, à la deuxième place. Le 0.2.2 met les deux ensemble.',
    ],
    code: `int main() {
  // Le changement : la place. (0, 0) → (10, 8).
  poser(10, 8, ALPHABET[0]);   // l'indice 0 : A, au milieu de l'écran

  while (true) {
    image();
  }
}
`,
    aVoir: 'Un A au milieu de l’écran.',
    controle: (c) => {
      c.avancer(20)
      return [
        ['le A est au milieu, en (10, 8)', c.mot(10, 8, 1) === 'A'],
      ]
    },
  },

  {
    titre: 'A, pris dans ALPHABET à l’indice 0 — doublé, deux positions',
    difficulte: 0,
    suite: true,
    idee: 'Deux poser, deux places : ALPHABET[0] en haut à gauche et au milieu.',
    texte: [
      '**C’est le 0.2 et le 0.2.1 réunis** : deux lignes `poser`, une par place.',
    ],
    code: `int main() {
  poser(0, 0, ALPHABET[0]);    // 1. en haut à gauche (le 0.2)
  poser(10, 8, ALPHABET[0]);   // 2. au milieu (le 0.2.1)

  while (true) {
    image();
  }
}
`,
    aVoir: 'Deux A : un en haut à gauche, un au milieu.',
    controle: (c) => {
      c.avancer(20)
      return [
        ['un A en haut à gauche', c.mot(0, 0, 1) === 'A'],
        ['un A au milieu', c.mot(10, 8, 1) === 'A'],
      ]
    },
  },

  {
    titre: 'Écrire au même endroit écrase',
    difficulte: 0,
    idee: 'La même position, exprès : la nouvelle lettre remplace l’ancienne.',
    texte: [
      'Les deux lignes visent **exprès la même case**, (0, 0). Une case ne contient qu’**une seule lettre** : écrire le B au même endroit **efface** le A et prend sa place.',
      'Les lignes s’exécutent **de haut en bas** : le A d’abord, puis le B. C’est donc le B qui reste.',
      'Le A a bien été écrit, mais il est remplacé avant même la première image : on ne le voit jamais.',
    ],
    code: `int main() {
  texte(0, 0, "A");   // colonne 0, ligne 0 : la case en haut à gauche
  texte(0, 0, "B");   // même case : le B écrase le A

  while (true) {
    image();
  }
}
`,
    aVoir: 'Seulement un B, en haut à gauche : le A a été écrasé.',
    controle: (c) => {
      c.avancer(10)
      return [
        ['la case (0, 0) contient B', c.mot(0, 0, 1) === 'B'],
        ['aucune trace du A à côté', c.mot(1, 0, 1) === ' '],
      ]
    },
  },

  {
    titre: 'Écrire au même endroit écrase — de base, ailleurs',
    difficulte: 0,
    suite: true,
    idee: 'Le 0.3 au milieu de l’écran : le B écrase encore le A, en (10, 8).',
    texte: [
      '**C’est le 0.3**, avec un seul changement : la **place** : (10, 8) au lieu de (0, 0), pour les deux lignes.',
      '**La règle ne dépend pas de la place :** deux écritures dans la **même** case, la seconde efface la première. Ici, les deux sont en (10, 8) : on ne voit que le B.',
      '**C’est la version de base** : une seule chose, à la deuxième place. Le 0.3.2 met les deux ensemble.',
    ],
    code: `int main() {
  texte(10, 8, "A");   // au milieu…
  texte(10, 8, "B");   // …même case : le B écrase le A

  while (true) {
    image();
  }
}
`,
    aVoir: 'Un B au milieu de l’écran ; le A a été écrasé.',
    controle: (c) => {
      c.avancer(20)
      return [
        ['un B au milieu', c.mot(10, 8, 1) === 'B'],
        ['aucun A à l’écran', !c.mot(0, 8, 20).includes('A')],
      ]
    },
  },

  {
    titre: 'Écrire au même endroit écrase — doublé, deux positions',
    difficulte: 0,
    suite: true,
    idee: 'L’écrasement à deux places : en haut à gauche ET au milieu, le B écrase le A.',
    texte: [
      '**C’est le 0.3 et le 0.3.1 réunis** : les deux écrasements, chacun à sa place.',
      '**Chaque case est indépendante :** ce qui s’écrit en (0, 0) ne touche pas (10, 8). Aux deux endroits, le B écrase le A.',
    ],
    code: `int main() {
  texte(0, 0, "A");    // en haut à gauche (le 0.3)…
  texte(0, 0, "B");    // …écrasé par le B
  texte(10, 8, "A");   // au milieu (le 0.3.1)…
  texte(10, 8, "B");   // …écrasé par le B

  while (true) {
    image();
  }
}
`,
    aVoir: 'Deux B : en haut à gauche et au milieu. Aucun A.',
    controle: (c) => {
      c.avancer(20)
      return [
        ['un B en haut à gauche', c.mot(0, 0, 1) === 'B'],
        ['un B au milieu', c.mot(10, 8, 1) === 'B'],
      ]
    },
  },

  {
    titre: 'L’alphabet à la main, jusqu’au bout de la ligne',
    difficulte: 0,
    idee: 'Une lettre par case : au bout de 20, la ligne est pleine.',
    texte: [
      'Chaque lettre prend **une case de 8 pixels** de large. L’écran en fait 160 : **20 lettres** remplissent donc toute la ligne, de la colonne 0 à la colonne **19**.',
      'On s’arrête à **T**, la 20e lettre. Il n’y a **pas de colonne 20** : `texte(20, 0, "U")` est refusé par le compilateur, qui répond que l’écran fait 20 colonnes.',
      'Vingt lignes presque identiques : c’est long à écrire, et c’est exactement ce qu’une boucle saura faire à notre place.',
    ],
    code: `int main() {
  texte(0, 0, "A");
  texte(1, 0, "B");
  texte(2, 0, "C");
  texte(3, 0, "D");
  texte(4, 0, "E");
  texte(5, 0, "F");
  texte(6, 0, "G");
  texte(7, 0, "H");
  texte(8, 0, "I");
  texte(9, 0, "J");
  texte(10, 0, "K");
  texte(11, 0, "L");
  texte(12, 0, "M");
  texte(13, 0, "N");
  texte(14, 0, "O");
  texte(15, 0, "P");
  texte(16, 0, "Q");
  texte(17, 0, "R");
  texte(18, 0, "S");
  texte(19, 0, "T");   // colonne 19 : la dernière de la ligne
  // On s'arrête ici : l'écran fait 20 colonnes (de 0 à 19).
  // 20 lettres de 8 pixels = 160 pixels : toute la largeur de l'écran.
  // (si on dépasse : texte(20, 0, "U") est refusé par le compilateur,
  //  qui répond « l'écran fait 20 colonnes et 18 lignes ; 20,0 est dehors »)

  while (true) {
    image();
  }
}
`,
    aVoir: 'A à T sur toute la première ligne, d’un bord à l’autre de l’écran.',
    controle: (c) => {
      c.avancer(10)
      return [
        ['la ligne 0 est pleine : A à T', c.mot(0, 0, 20) === 'ABCDEFGHIJKLMNOPQRST'],
        ['rien ne déborde sur la ligne 1', c.mot(0, 1, 20).trim() === ''],
      ]
    },
  },

  {
    titre: 'L’alphabet à la main, jusqu’au bout de la ligne — de base, ailleurs',
    difficulte: 0,
    suite: true,
    idee: 'Les vingt lettres du 0.4, sur la ligne 5 au lieu de la ligne 0.',
    texte: [
      '**C’est le 0.4**, avec un seul changement : la **ligne** : 5 au lieu de 0, pour les vingt lignes de code.',
      '**Seul le deuxième nombre change**, dans chaque `texte` : c’est la ligne. Les colonnes restent 0 à 19 : la même ligne de lettres, plus bas.',
      '**C’est la version de base** : une seule chose, à la deuxième place. Le 0.4.2 met les deux ensemble.',
    ],
    code: `int main() {
  // Le changement : la ligne, 0 → 5, dans chaque texte.
  texte(0, 5, "A");
  texte(1, 5, "B");
  texte(2, 5, "C");
  texte(3, 5, "D");
  texte(4, 5, "E");
  texte(5, 5, "F");
  texte(6, 5, "G");
  texte(7, 5, "H");
  texte(8, 5, "I");
  texte(9, 5, "J");
  texte(10, 5, "K");
  texte(11, 5, "L");
  texte(12, 5, "M");
  texte(13, 5, "N");
  texte(14, 5, "O");
  texte(15, 5, "P");
  texte(16, 5, "Q");
  texte(17, 5, "R");
  texte(18, 5, "S");
  texte(19, 5, "T");

  while (true) {
    image();
  }
}
`,
    aVoir: 'A à T sur la ligne 5.',
    controle: (c) => {
      c.avancer(20)
      return [
        ['la ligne 5 : A à T', c.mot(0, 5, 20) === 'ABCDEFGHIJKLMNOPQRST'],
      ]
    },
  },

  {
    titre: 'L’alphabet à la main, jusqu’au bout de la ligne — doublé, deux positions',
    difficulte: 0,
    suite: true,
    idee: 'La ligne A à T deux fois : en ligne 0 et en ligne 5. Écrit à la main, c’est quarante lignes — la boucle du 0.5 va l’éviter.',
    texte: [
      '**C’est le 0.4 et le 0.4.1 réunis** : les vingt lettres en ligne 0, puis les vingt en ligne 5.',
      '**Quarante lignes presque pareilles :** c’est long, et facile de se tromper. C’est exactement ce que la boucle `for` du 0.5 va raccourcir.',
    ],
    code: `int main() {
  // 1. La ligne 0 (le 0.4)
  texte(0, 0, "A"); texte(1, 0, "B"); texte(2, 0, "C"); texte(3, 0, "D"); texte(4, 0, "E");
  texte(5, 0, "F"); texte(6, 0, "G"); texte(7, 0, "H"); texte(8, 0, "I"); texte(9, 0, "J");
  texte(10, 0, "K"); texte(11, 0, "L"); texte(12, 0, "M"); texte(13, 0, "N"); texte(14, 0, "O");
  texte(15, 0, "P"); texte(16, 0, "Q"); texte(17, 0, "R"); texte(18, 0, "S"); texte(19, 0, "T");
  // 2. La ligne 5 (le 0.4.1)
  texte(0, 5, "A"); texte(1, 5, "B"); texte(2, 5, "C"); texte(3, 5, "D"); texte(4, 5, "E");
  texte(5, 5, "F"); texte(6, 5, "G"); texte(7, 5, "H"); texte(8, 5, "I"); texte(9, 5, "J");
  texte(10, 5, "K"); texte(11, 5, "L"); texte(12, 5, "M"); texte(13, 5, "N"); texte(14, 5, "O");
  texte(15, 5, "P"); texte(16, 5, "Q"); texte(17, 5, "R"); texte(18, 5, "S"); texte(19, 5, "T");

  while (true) {
    image();
  }
}
`,
    aVoir: 'A à T deux fois : sur la ligne 0 et sur la ligne 5.',
    controle: (c) => {
      c.avancer(20)
      return [
        ['la ligne 0 : A à T', c.mot(0, 0, 20) === 'ABCDEFGHIJKLMNOPQRST'],
        ['la ligne 5 : A à T', c.mot(0, 5, 20) === 'ABCDEFGHIJKLMNOPQRST'],
      ]
    },
  },

  {
    titre: 'La même ligne, avec une boucle for',
    difficulte: 0,
    idee: 'Vingt lignes presque pareilles deviennent une seule, répétée vingt fois.',
    texte: [
      '**`for (uint8_t i = 0; i < 20; i++)`** répète ce qui est entre ses accolades **20 fois**. `i` vaut 0 au premier tour, puis 1, 2… jusqu’à 19.',
      '`i` sert **deux fois** : comme **colonne**, pour avancer de gauche à droite, et comme **indice** dans `ALPHABET`, pour passer de A à T.',
      '**`i < 20`** : on s’arrête avant la colonne 20, qui n’existe pas, exactement comme au 0.4. Le résultat est le même, en 3 lignes au lieu de 20, et le programme est plus léger.',
    ],
    code: `int main() {
  for (uint8_t i = 0; i < 20; i++) {   // 20 tours : les colonnes 0 à 19
    poser(i, 0, ALPHABET[i]);          // la lettre n° i, dans la colonne i
  }

  while (true) {
    image();
  }
}
`,
    aVoir: 'A à T sur toute la première ligne, comme au 0.4.',
    controle: (c) => {
      c.avancer(10)
      return [
        ['la ligne 0 est pleine : A à T', c.mot(0, 0, 20) === 'ABCDEFGHIJKLMNOPQRST'],
        ['rien ne déborde sur la ligne 1', c.mot(0, 1, 20).trim() === ''],
      ]
    },
  },

  {
    titre: 'La même ligne, avec une boucle for — de base, ailleurs',
    difficulte: 0,
    suite: true,
    idee: 'Le 0.5 sur la ligne 5 : un seul nombre change dans la boucle.',
    texte: [
      '**C’est le 0.5**, avec un seul changement : la **ligne** : 5 au lieu de 0, dans le `poser` de la boucle.',
      '**Un seul nombre à changer**, au lieu de vingt au 0.4.1 : la boucle écrit la ligne entière, et la ligne n’est dite qu’une fois.',
      '**C’est la version de base** : une seule chose, à la deuxième place. Le 0.5.2 met les deux ensemble.',
    ],
    code: `int main() {
  // Le changement : la ligne, 0 → 5.
  for (uint8_t i = 0; i < 20; i++) {   // 20 tours : les colonnes 0 à 19
    poser(i, 5, ALPHABET[i]);          // la lettre n° i, colonne i, ligne 5
  }

  while (true) {
    image();
  }
}
`,
    aVoir: 'A à T sur la ligne 5.',
    controle: (c) => {
      c.avancer(20)
      return [
        ['la ligne 5 : A à T', c.mot(0, 5, 20) === 'ABCDEFGHIJKLMNOPQRST'],
      ]
    },
  },

  {
    titre: 'La même ligne, avec une boucle for — doublé, deux positions',
    difficulte: 0,
    suite: true,
    idee: 'La boucle deux fois : la ligne 0 puis la ligne 5.',
    texte: [
      '**C’est le 0.5 et le 0.5.1 réunis** : la boucle du 0.5 (ligne 0), puis celle du 0.5.1 (ligne 5).',
      '**Deux boucles l’une après l’autre :** la première finit ses vingt tours, puis la seconde commence. Chaque `for` déclare son propre `i` : il n’existe que dans sa boucle.',
    ],
    code: `int main() {
  // 1. La ligne 0 (le 0.5)
  for (uint8_t i = 0; i < 20; i++) {   // 20 tours : les colonnes 0 à 19
    poser(i, 0, ALPHABET[i]);          // la lettre n° i, colonne i, ligne 0
  }
  // 2. La ligne 5 (le 0.5.1)
  for (uint8_t i = 0; i < 20; i++) {   // 20 tours : les colonnes 0 à 19
    poser(i, 5, ALPHABET[i]);          // la lettre n° i, colonne i, ligne 5
  }

  while (true) {
    image();
  }
}
`,
    aVoir: 'A à T sur la ligne 0 et sur la ligne 5.',
    controle: (c) => {
      c.avancer(20)
      return [
        ['la ligne 0 : A à T', c.mot(0, 0, 20) === 'ABCDEFGHIJKLMNOPQRST'],
        ['la ligne 5 : A à T', c.mot(0, 5, 20) === 'ABCDEFGHIJKLMNOPQRST'],
      ]
    },
  },

  {
    titre: 'La même ligne, avec une boucle while',
    difficulte: 0,
    idee: 'La boucle for, décomposée en ses trois morceaux.',
    texte: [
      '`while (i < 20)` répète **tant que** la condition est vraie. C’est la même boucle que `while (true)` du 0.0, mais celle-ci **s’arrête**.',
      'Les trois morceaux que `for` réunit sur une ligne sont ici écrits **séparément** : le départ `uint8_t i = 0;` avant la boucle, la condition `i < 20` dans le `while`, et `i++;` à la fin de chaque tour.',
      '**Le piège :** sans `i++`, `i` reste à 0, la condition reste vraie, et la boucle **ne s’arrête jamais**. Le programme reste bloqué dedans.',
    ],
    code: `int main() {
  uint8_t i = 0;                // 1. on part de la colonne 0

  while (i < 20) {              // 2. tant qu'on est dans l'écran
    poser(i, 0, ALPHABET[i]);   //    la lettre n° i, dans la colonne i
    i++;                        // 3. on passe à la suivante
  }

  while (true) {
    image();
  }
}
`,
    aVoir: 'A à T sur toute la première ligne, comme au 0.5.',
    controle: (c) => {
      c.avancer(10)
      return [
        ['la ligne 0 est pleine : A à T', c.mot(0, 0, 20) === 'ABCDEFGHIJKLMNOPQRST'],
        ['rien ne déborde sur la ligne 1', c.mot(0, 1, 20).trim() === ''],
      ]
    },
  },

  {
    titre: 'La même ligne, avec une boucle while — de base, ailleurs',
    difficulte: 0,
    suite: true,
    idee: 'Le 0.6 sur la ligne 5 : un seul nombre change dans la boucle.',
    texte: [
      '**C’est le 0.6**, avec un seul changement : la **ligne** : 5 au lieu de 0, dans le `poser` de la boucle.',
      '**Un seul nombre à changer**, au lieu de vingt au 0.4.1 : la boucle écrit la ligne entière, et la ligne n’est dite qu’une fois.',
      '**C’est la version de base** : une seule chose, à la deuxième place. Le 0.6.2 met les deux ensemble.',
    ],
    code: `int main() {
  // Le changement : la ligne, 0 → 5.
  uint8_t i = 0;                // on part de la colonne 0
  while (i < 20) {              // tant qu'on est dans l'écran
    poser(i, 5, ALPHABET[i]);   // la lettre n° i, colonne i, ligne 5
    i++;                        // la suivante
  }

  while (true) {
    image();
  }
}
`,
    aVoir: 'A à T sur la ligne 5.',
    controle: (c) => {
      c.avancer(20)
      return [
        ['la ligne 5 : A à T', c.mot(0, 5, 20) === 'ABCDEFGHIJKLMNOPQRST'],
      ]
    },
  },

  {
    titre: 'La même ligne, avec une boucle while — doublé, deux positions',
    difficulte: 0,
    suite: true,
    idee: 'La boucle deux fois : la ligne 0 puis la ligne 5.',
    texte: [
      '**C’est le 0.6 et le 0.6.1 réunis** : la boucle du 0.6 (ligne 0), puis celle du 0.6.1 (ligne 5).',
      '**Deux boucles l’une après l’autre**, avec la **même** variable `i` : déclarée une fois, elle est remise à 0 (`i = 0;`) avant la seconde boucle, sans `uint8_t` — on ne déclare pas deux fois le même nom.',
    ],
    code: `int main() {
  // 1. La ligne 0 (le 0.6)
  uint8_t i = 0;                // on part de la colonne 0
  while (i < 20) {              // tant qu'on est dans l'écran
    poser(i, 0, ALPHABET[i]);   // la lettre n° i, colonne i, ligne 0
    i++;                        // la suivante
  }
  // 2. La ligne 5 (le 0.6.1)
  i = 0;                        // on part de la colonne 0
  while (i < 20) {              // tant qu'on est dans l'écran
    poser(i, 5, ALPHABET[i]);   // la lettre n° i, colonne i, ligne 5
    i++;                        // la suivante
  }

  while (true) {
    image();
  }
}
`,
    aVoir: 'A à T sur la ligne 0 et sur la ligne 5.',
    controle: (c) => {
      c.avancer(20)
      return [
        ['la ligne 0 : A à T', c.mot(0, 0, 20) === 'ABCDEFGHIJKLMNOPQRST'],
        ['la ligne 5 : A à T', c.mot(0, 5, 20) === 'ABCDEFGHIJKLMNOPQRST'],
      ]
    },
  },

  {
    titre: 'La même ligne, avec do … while',
    difficulte: 0,
    idee: 'La boucle qui vérifie sa condition à la fin : elle fait toujours au moins un tour.',
    texte: [
      '`do { … } while (i < 20);` fait le tour **d’abord**, et vérifie la condition **ensuite**. Il fait donc **toujours au moins un tour**, même si la condition est fausse dès le départ.',
      'Ici, le résultat est le même qu’avec `for` et `while` : les trois boucles savent faire la même chose. On choisit celle qui se lit le mieux.',
      'Attention au **point-virgule** après `while (i < 20)` : il est obligatoire avec `do`, et seulement avec lui.',
    ],
    code: `int main() {
  uint8_t i = 0;

  do {
    poser(i, 0, ALPHABET[i]);   // la lettre n° i, dans la colonne i
    i++;
  } while (i < 20);             // la condition est vérifiée À LA FIN

  while (true) {
    image();
  }
}
`,
    aVoir: 'A à T sur toute la première ligne, comme au 0.5.',
    controle: (c) => {
      c.avancer(10)
      return [
        ['la ligne 0 est pleine : A à T', c.mot(0, 0, 20) === 'ABCDEFGHIJKLMNOPQRST'],
        ['rien ne déborde sur la ligne 1', c.mot(0, 1, 20).trim() === ''],
      ]
    },
  },

  {
    titre: 'La même ligne, avec do … while — de base, ailleurs',
    difficulte: 0,
    suite: true,
    idee: 'Le 0.7 sur la ligne 5 : un seul nombre change dans la boucle.',
    texte: [
      '**C’est le 0.7**, avec un seul changement : la **ligne** : 5 au lieu de 0, dans le `poser` de la boucle.',
      '**Un seul nombre à changer**, au lieu de vingt au 0.4.1 : la boucle écrit la ligne entière, et la ligne n’est dite qu’une fois.',
      '**C’est la version de base** : une seule chose, à la deuxième place. Le 0.7.2 met les deux ensemble.',
    ],
    code: `int main() {
  // Le changement : la ligne, 0 → 5.
  uint8_t i = 0;
  do {
    poser(i, 5, ALPHABET[i]);   // la lettre n° i, colonne i, ligne 5
    i++;
  } while (i < 20);             // la condition est vérifiée À LA FIN

  while (true) {
    image();
  }
}
`,
    aVoir: 'A à T sur la ligne 5.',
    controle: (c) => {
      c.avancer(20)
      return [
        ['la ligne 5 : A à T', c.mot(0, 5, 20) === 'ABCDEFGHIJKLMNOPQRST'],
      ]
    },
  },

  {
    titre: 'La même ligne, avec do … while — doublé, deux positions',
    difficulte: 0,
    suite: true,
    idee: 'La boucle deux fois : la ligne 0 puis la ligne 5.',
    texte: [
      '**C’est le 0.7 et le 0.7.1 réunis** : la boucle du 0.7 (ligne 0), puis celle du 0.7.1 (ligne 5).',
      '**Deux boucles l’une après l’autre**, avec la **même** variable `i` : déclarée une fois, elle est remise à 0 (`i = 0;`) avant la seconde boucle, sans `uint8_t` — on ne déclare pas deux fois le même nom.',
    ],
    code: `int main() {
  // 1. La ligne 0 (le 0.7)
  uint8_t i = 0;
  do {
    poser(i, 0, ALPHABET[i]);   // la lettre n° i, colonne i, ligne 0
    i++;
  } while (i < 20);             // la condition est vérifiée À LA FIN
  // 2. La ligne 5 (le 0.7.1)
  i = 0;        
  do {
    poser(i, 5, ALPHABET[i]);   // la lettre n° i, colonne i, ligne 5
    i++;
  } while (i < 20);             // la condition est vérifiée À LA FIN

  while (true) {
    image();
  }
}
`,
    aVoir: 'A à T sur la ligne 0 et sur la ligne 5.',
    controle: (c) => {
      c.avancer(20)
      return [
        ['la ligne 0 : A à T', c.mot(0, 0, 20) === 'ABCDEFGHIJKLMNOPQRST'],
        ['la ligne 5 : A à T', c.mot(0, 5, 20) === 'ABCDEFGHIJKLMNOPQRST'],
      ]
    },
  },

  {
    titre: 'Tout l’alphabet, avec deux boucles',
    difficulte: 0,
    idee: 'La ligne est pleine après T : une seconde boucle écrit U à Z sur la ligne d’en dessous.',
    texte: [
      'Il y a **26 lettres** et seulement **20 colonnes**. La première boucle écrit A à T sur la ligne 0 ; la seconde écrit les 6 dernières, U à Z, sur la ligne **1**.',
      'Dans la seconde boucle, `i` va de 20 à 25 : c’est le bon **indice** dans `ALPHABET` (U est à l’indice 20). Mais la **colonne** doit repartir à 0 : on écrit donc `i - 20`.',
    ],
    code: `int main() {
  for (uint8_t i = 0; i < 20; i++) {    // A à T : ligne 0, colonnes 0 à 19
    poser(i, 0, ALPHABET[i]);
  }

  for (uint8_t i = 20; i < 26; i++) {   // U à Z : ligne 1
    poser(i - 20, 1, ALPHABET[i]);      // la colonne repart à 0
  }

  while (true) {
    image();
  }
}
`,
    aVoir: 'A à T sur la ligne 0, U à Z en dessous.',
    controle: (c) => {
      c.avancer(10)
      return [
        ['la ligne 0 : A à T', c.mot(0, 0, 20) === 'ABCDEFGHIJKLMNOPQRST'],
        ['la ligne 1 : U à Z', c.mot(0, 1, 20) === 'UVWXYZ              '],
      ]
    },
  },

  {
    titre: 'Tout l’alphabet, avec deux boucles — de base, ailleurs',
    difficulte: 0,
    suite: true,
    idee: 'Le 0.8 trois lignes plus bas : tout l’alphabet sur les lignes 5 et 6.',
    texte: [
      '**C’est le 0.8**, avec un seul changement : les **lignes** : 5 et 6 au lieu de 0 et 1, dans les deux `poser`.',
      '**Le reste ne bouge pas :** A à T sur une ligne, U à Z sur la suivante.',
      '**C’est la version de base** : une seule chose, à la deuxième place. Le 0.8.2 met les deux ensemble.',
    ],
    code: `int main() {
  // Le changement : les lignes 0 et 1 → 5 et 6.
  for (uint8_t i = 0; i < 20; i++) {    // A à T : ligne 5
    poser(i, 5, ALPHABET[i]);
  }
  for (uint8_t i = 20; i < 26; i++) {   // U à Z : ligne 6
    poser(i - 20, 6, ALPHABET[i]);
  }

  while (true) {
    image();
  }
}
`,
    aVoir: 'Tout l’alphabet sur les lignes 5 et 6.',
    controle: (c) => {
      c.avancer(20)
      return [
        ['ligne 5 : A à T', c.mot(0, 5, 20) === 'ABCDEFGHIJKLMNOPQRST'],
        ['ligne 6 : U à Z', c.mot(0, 6, 6) === 'UVWXYZ'],
      ]
    },
  },

  {
    titre: 'Tout l’alphabet, avec deux boucles — doublé, deux positions',
    difficulte: 0,
    suite: true,
    idee: 'Tout l’alphabet deux fois : lignes 0 et 1, puis lignes 5 et 6.',
    texte: [
      '**C’est le 0.8 et le 0.8.1 réunis** : l’alphabet du 0.8 (lignes 0 et 1), puis celui du 0.8.1 (lignes 5 et 6).',
    ],
    code: `int main() {
  // 1. Lignes 0 et 1 (le 0.8)
  for (uint8_t i = 0; i < 20; i++) {    // A à T : ligne 0
    poser(i, 0, ALPHABET[i]);
  }
  for (uint8_t i = 20; i < 26; i++) {   // U à Z : ligne 1
    poser(i - 20, 1, ALPHABET[i]);
  }
  // 2. Lignes 5 et 6 (le 0.8.1)
  for (uint8_t i = 0; i < 20; i++) {    // A à T : ligne 5
    poser(i, 5, ALPHABET[i]);
  }
  for (uint8_t i = 20; i < 26; i++) {   // U à Z : ligne 6
    poser(i - 20, 6, ALPHABET[i]);
  }

  while (true) {
    image();
  }
}
`,
    aVoir: 'Tout l’alphabet deux fois : en haut, et trois lignes plus bas.',
    controle: (c) => {
      c.avancer(20)
      return [
        ['lignes 0 et 1', c.mot(0, 0, 20) === 'ABCDEFGHIJKLMNOPQRST' && c.mot(0, 1, 6) === 'UVWXYZ'],
        ['lignes 5 et 6', c.mot(0, 5, 20) === 'ABCDEFGHIJKLMNOPQRST' && c.mot(0, 6, 6) === 'UVWXYZ'],
      ]
    },
  },

  {
    titre: 'Tout l’alphabet, avec une seule boucle',
    difficulte: 0,
    idee: 'Le modulo donne la colonne, la division donne la ligne.',
    texte: [
      '**Ce qui est nouveau ici :** `sizeof`, le modulo `%` et la division `/`. Le reste (`for`, `poser`, `ALPHABET[i]`) vient des chapitres précédents.',
      '**`sizeof(ALPHABET)`** veut dire « la taille de ALPHABET » : le nombre de cases du tableau, **26**. On ne l’écrit plus à la main : si le tableau changeait de taille, la boucle suivrait toute seule. `i < sizeof(ALPHABET)` s’arrête donc après `i = 25`, la dernière lettre.',
      '**`i / 20`** est une **division entière** : elle garde le quotient et **jette les virgules**. 5 / 20 donne 0 (et non 0,25) ; 19 / 20 donne 0 ; 20 / 20 donne 1 ; 25 / 20 donne 1. Tant que `i` est plus petit que 20, le résultat est 0 : c’est la **ligne 0**. À partir de 20, c’est 1 : la **ligne 1**.',
      '**`i % 20`** se lit « i modulo 20 » : c’est le **reste** de cette même division. 5 % 20 donne 5 (20 ne rentre pas dans 5, tout reste) ; 19 % 20 donne 19 ; 20 % 20 donne 0 (la division tombe juste, il ne reste rien) ; 25 % 20 donne 5. Le reste monte de 0 à 19 puis **repart à 0** : c’est la **colonne**.',
      'Imagine **20 places par rang**, comme au cinéma : `i / 20` dit combien de rangs **complets** sont déjà remplis (le rang de la lettre), `i % 20` dit combien de places il **reste** une fois ces rangs retirés (sa place dans le rang).',
      'Tour par tour : **i = 0** → colonne 0, ligne 0, **A** · **i = 19** → colonne 19, ligne 0, **T** (la ligne est pleine) · **i = 20** → colonne **0**, ligne **1**, **U** (le reste repart à 0, le quotient passe à 1) · **i = 25** → colonne 5, ligne 1, **Z**.',
      'C’est compliqué à lire : le chapitre suivant montre `poserS`, qui fait ce calcul à notre place.',
    ],
    code: `int main() {
  // for : répète le bloc entre { } ; i part de 0 et augmente de 1 à chaque tour.
  // sizeof(ALPHABET) = 26, la taille du tableau : 26 tours, i va de 0 à 25.
  for (uint8_t i = 0; i < sizeof(ALPHABET); i++) {

    // poser(colonne, ligne, tuile) :
    //   i % 20      = le RESTE de i divisé par 20 : 0, 1 … 19, puis 0, 1 … 5
    //                 → la colonne, qui repart à 0 après la 19
    //   i / 20      = le QUOTIENT, sans virgule : 0 jusqu'à i = 19, puis 1
    //                 → la ligne : 0 pour A à T, 1 pour U à Z
    //   ALPHABET[i] = la lettre n° i : A pour i = 0, Z pour i = 25
    poser(i % 20, i / 20, ALPHABET[i]);
  }

  while (true) {
    image();
  }
}
`,
    aVoir: 'A à T sur la ligne 0, U à Z en dessous, comme au 0.8.',
    controle: (c) => {
      c.avancer(10)
      return [
        ['la ligne 0 : A à T', c.mot(0, 0, 20) === 'ABCDEFGHIJKLMNOPQRST'],
        ['la ligne 1 : U à Z', c.mot(0, 1, 20) === 'UVWXYZ              '],
      ]
    },
  },

  {
    titre: 'Tout l’alphabet, avec une seule boucle — de base, ailleurs',
    difficulte: 0,
    suite: true,
    idee: 'Le 0.9 trois lignes plus bas : tout l’alphabet sur les lignes 5 et 6.',
    texte: [
      '**C’est le 0.9**, avec un seul changement : la **ligne de départ** : `5 + i / 20` au lieu de `i / 20`. `i / 20` vaut 0 puis 1 ; en ajoutant 5, on obtient les lignes 5 puis 6.',
      '**Le reste ne bouge pas :** A à T sur une ligne, U à Z sur la suivante.',
      '**C’est la version de base** : une seule chose, à la deuxième place. Le 0.9.2 met les deux ensemble.',
    ],
    code: `int main() {
  // Le changement : les lignes 0 et 1 → 5 et 6.
  for (uint8_t i = 0; i < sizeof(ALPHABET); i++) {
    poser(i % 20, 5 + i / 20, ALPHABET[i]);   // 5 + i / 20 : la ligne 5, puis 6
  }

  while (true) {
    image();
  }
}
`,
    aVoir: 'Tout l’alphabet sur les lignes 5 et 6.',
    controle: (c) => {
      c.avancer(20)
      return [
        ['ligne 5 : A à T', c.mot(0, 5, 20) === 'ABCDEFGHIJKLMNOPQRST'],
        ['ligne 6 : U à Z', c.mot(0, 6, 6) === 'UVWXYZ'],
      ]
    },
  },

  {
    titre: 'Tout l’alphabet, avec une seule boucle — doublé, deux positions',
    difficulte: 0,
    suite: true,
    idee: 'Tout l’alphabet deux fois : lignes 0 et 1, puis lignes 5 et 6.',
    texte: [
      '**C’est le 0.9 et le 0.9.1 réunis** : l’alphabet du 0.9 (lignes 0 et 1), puis celui du 0.9.1 (lignes 5 et 6).',
    ],
    code: `int main() {
  // 1. Lignes 0 et 1 (le 0.9)
  for (uint8_t i = 0; i < sizeof(ALPHABET); i++) {
    poser(i % 20, 0 + i / 20, ALPHABET[i]);   // 0 + i / 20 : la ligne 0, puis 1
  }
  // 2. Lignes 5 et 6 (le 0.9.1)
  for (uint8_t i = 0; i < sizeof(ALPHABET); i++) {
    poser(i % 20, 5 + i / 20, ALPHABET[i]);   // 5 + i / 20 : la ligne 5, puis 6
  }

  while (true) {
    image();
  }
}
`,
    aVoir: 'Tout l’alphabet deux fois : en haut, et trois lignes plus bas.',
    controle: (c) => {
      c.avancer(20)
      return [
        ['lignes 0 et 1', c.mot(0, 0, 20) === 'ABCDEFGHIJKLMNOPQRST' && c.mot(0, 1, 6) === 'UVWXYZ'],
        ['lignes 5 et 6', c.mot(0, 5, 20) === 'ABCDEFGHIJKLMNOPQRST' && c.mot(0, 6, 6) === 'UVWXYZ'],
      ]
    },
  },

  {
    titre: 'Tout l’alphabet, avec poserS',
    difficulte: 0,
    idee: 'poserS passe à la ligne tout seul : une seule boucle pour les 26 lettres.',
    texte: [
      '**Ce qui est nouveau ici :** `poserS`. Le reste (`for`, `sizeof`, `ALPHABET[i]`) vient des chapitres précédents : c’est le programme du 0.9, en plus simple.',
      '**`sizeof(ALPHABET)`** veut dire « la taille de ALPHABET » : le nombre de cases du tableau, **26**. On ne l’écrit plus à la main : si le tableau changeait de taille, la boucle suivrait toute seule. `i < sizeof(ALPHABET)` s’arrête donc après `i = 25`, la dernière lettre.',
      '**`poserS(colonne, ligne, tuile)`** fait partie de la console, comme `ALPHABET` : on s’en sert sans rien déclarer. C’est `poser()`, mais qui **passe à la ligne tout seul** : une colonne trop grande (20 ou plus) repart à gauche, une ligne plus bas.',
      'On lui donne donc simplement `i` comme colonne, sur la ligne 0. Tour par tour : **i = 0** → A en (0, 0) · **i = 19** → T en (19, 0), la ligne est pleine · **i = 20** → la colonne 20 n’existe pas : `poserS` pose U en (**0**, **1**) · **i = 25** → Z en (5, 1).',
      '**Comment `poserS` trouve la place**, pour les curieux : la ligne est le nombre de rangées de 20 déjà pleines (20 / 20 = 1), et la colonne ce qui reste une fois ces rangées retirées (25 − 20 = 5). En C++ : `i / 20` et `i % 20`. `poserS` fait ce calcul à notre place.',
      'Le calcul du 0.9 a disparu du programme : `poserS` le fait à notre place.',
    ],
    code: `int main() {
  // for : répète le bloc entre { } ; i part de 0 et augmente de 1 à chaque tour.
  // sizeof(ALPHABET) = 26, la taille du tableau : 26 tours, i va de 0 à 25.
  for (uint8_t i = 0; i < sizeof(ALPHABET); i++) {

    // poserS(colonne, ligne, tuile) : comme poser(), mais passe à la ligne tout seul.
    //   i           = la colonne : de 0 à 19 elle tient sur la ligne 0 ;
    //                 à partir de 20, poserS repart à gauche une ligne plus bas
    //                 (i = 20 → U en (0, 1), i = 25 → Z en (5, 1))
    //   0           = la ligne de départ
    //   ALPHABET[i] = la lettre n° i : A pour i = 0, Z pour i = 25
    poserS(i, 0, ALPHABET[i]);
  }

  while (true) {
    image();
  }
}
`,
    aVoir: 'A à T sur la ligne 0, U à Z en dessous, comme au 0.8.',
    controle: (c) => {
      c.avancer(10)
      return [
        ['la ligne 0 : A à T', c.mot(0, 0, 20) === 'ABCDEFGHIJKLMNOPQRST'],
        ['la ligne 1 : U à Z', c.mot(0, 1, 20) === 'UVWXYZ              '],
      ]
    },
  },

  {
    titre: 'Tout l’alphabet, avec poserS — de base, ailleurs',
    difficulte: 0,
    suite: true,
    idee: 'Le 0.10 trois lignes plus bas : tout l’alphabet sur les lignes 5 et 6.',
    texte: [
      '**C’est le 0.10**, avec un seul changement : la **ligne** : 5 au lieu de 0. `poserS` passe tout seul à la ligne suivante, la 6.',
      '**Le reste ne bouge pas :** A à T sur une ligne, U à Z sur la suivante.',
      '**C’est la version de base** : une seule chose, à la deuxième place. Le 0.10.2 met les deux ensemble.',
    ],
    code: `int main() {
  // Le changement : les lignes 0 et 1 → 5 et 6.
  for (uint8_t i = 0; i < sizeof(ALPHABET); i++) {
    poserS(i, 5, ALPHABET[i]);   // poserS passe tout seul à la ligne 6
  }

  while (true) {
    image();
  }
}
`,
    aVoir: 'Tout l’alphabet sur les lignes 5 et 6.',
    controle: (c) => {
      c.avancer(20)
      return [
        ['ligne 5 : A à T', c.mot(0, 5, 20) === 'ABCDEFGHIJKLMNOPQRST'],
        ['ligne 6 : U à Z', c.mot(0, 6, 6) === 'UVWXYZ'],
      ]
    },
  },

  {
    titre: 'Tout l’alphabet, avec poserS — doublé, deux positions',
    difficulte: 0,
    suite: true,
    idee: 'Tout l’alphabet deux fois : lignes 0 et 1, puis lignes 5 et 6.',
    texte: [
      '**C’est le 0.10 et le 0.10.1 réunis** : l’alphabet du 0.10 (lignes 0 et 1), puis celui du 0.10.1 (lignes 5 et 6).',
    ],
    code: `int main() {
  // 1. Lignes 0 et 1 (le 0.10)
  for (uint8_t i = 0; i < sizeof(ALPHABET); i++) {
    poserS(i, 0, ALPHABET[i]);   // poserS passe tout seul à la ligne 1
  }
  // 2. Lignes 5 et 6 (le 0.10.1)
  for (uint8_t i = 0; i < sizeof(ALPHABET); i++) {
    poserS(i, 5, ALPHABET[i]);   // poserS passe tout seul à la ligne 6
  }

  while (true) {
    image();
  }
}
`,
    aVoir: 'Tout l’alphabet deux fois : en haut, et trois lignes plus bas.',
    controle: (c) => {
      c.avancer(20)
      return [
        ['lignes 0 et 1', c.mot(0, 0, 20) === 'ABCDEFGHIJKLMNOPQRST' && c.mot(0, 1, 6) === 'UVWXYZ'],
        ['lignes 5 et 6', c.mot(0, 5, 20) === 'ABCDEFGHIJKLMNOPQRST' && c.mot(0, 6, 6) === 'UVWXYZ'],
      ]
    },
  },

  {
    titre: 'Tout l’alphabet, avec textS',
    difficulte: 0,
    idee: 'textS passe à la ligne tout seul : plus de calcul à écrire.',
    texte: [
      '**`textS`** écrit comme `texte`, mais **passe à la ligne** quand la ligne est pleine : après la colonne 19, la suite reprend en colonne 0 de la ligne d’en dessous.',
      'Le calcul du 0.9 (`i % 20`, `i / 20`) est fait **à notre place**. `texte()`, lui, refuserait ce mot trop long.',
      'Après la ligne 17, `textS` repart **en haut**, à la ligne 0.',
    ],
    code: `int main() {
  textS(0, 0, "ABCDEFGHIJKLMNOPQRSTUVWXYZ");   // passe à la ligne après T

  while (true) {
    image();
  }
}
`,
    aVoir: 'A à T sur la ligne 0, U à Z en dessous, comme au 0.9.',
    controle: (c) => {
      c.avancer(10)
      return [
        ['la ligne 0 : A à T', c.mot(0, 0, 20) === 'ABCDEFGHIJKLMNOPQRST'],
        ['la ligne 1 : U à Z', c.mot(0, 1, 20) === 'UVWXYZ              '],
      ]
    },
  },

  {
    titre: 'Tout l’alphabet, avec textS — de base, ailleurs',
    difficulte: 0,
    suite: true,
    idee: 'Le 0.11 trois lignes plus bas : tout l’alphabet sur les lignes 5 et 6.',
    texte: [
      '**C’est le 0.11**, avec un seul changement : la **ligne** : 5 au lieu de 0. `textS` passe tout seul à la ligne 6 après le T.',
      '**Le reste ne bouge pas :** A à T sur une ligne, U à Z sur la suivante.',
      '**C’est la version de base** : une seule chose, à la deuxième place. Le 0.11.2 met les deux ensemble.',
    ],
    code: `int main() {
  // Le changement : les lignes 0 et 1 → 5 et 6.
  textS(0, 5, "ABCDEFGHIJKLMNOPQRSTUVWXYZ");   // passe à la ligne 6 après T

  while (true) {
    image();
  }
}
`,
    aVoir: 'Tout l’alphabet sur les lignes 5 et 6.',
    controle: (c) => {
      c.avancer(20)
      return [
        ['ligne 5 : A à T', c.mot(0, 5, 20) === 'ABCDEFGHIJKLMNOPQRST'],
        ['ligne 6 : U à Z', c.mot(0, 6, 6) === 'UVWXYZ'],
      ]
    },
  },

  {
    titre: 'Tout l’alphabet, avec textS — doublé, deux positions',
    difficulte: 0,
    suite: true,
    idee: 'Tout l’alphabet deux fois : lignes 0 et 1, puis lignes 5 et 6.',
    texte: [
      '**C’est le 0.11 et le 0.11.1 réunis** : l’alphabet du 0.11 (lignes 0 et 1), puis celui du 0.11.1 (lignes 5 et 6).',
    ],
    code: `int main() {
  // 1. Lignes 0 et 1 (le 0.11)
  textS(0, 0, "ABCDEFGHIJKLMNOPQRSTUVWXYZ");   // passe à la ligne 1 après T
  // 2. Lignes 5 et 6 (le 0.11.1)
  textS(0, 5, "ABCDEFGHIJKLMNOPQRSTUVWXYZ");   // passe à la ligne 6 après T

  while (true) {
    image();
  }
}
`,
    aVoir: 'Tout l’alphabet deux fois : en haut, et trois lignes plus bas.',
    controle: (c) => {
      c.avancer(20)
      return [
        ['lignes 0 et 1', c.mot(0, 0, 20) === 'ABCDEFGHIJKLMNOPQRST' && c.mot(0, 1, 6) === 'UVWXYZ'],
        ['lignes 5 et 6', c.mot(0, 5, 20) === 'ABCDEFGHIJKLMNOPQRST' && c.mot(0, 6, 6) === 'UVWXYZ'],
      ]
    },
  },

  {
    titre: 'Une lettre toutes les secondes',
    difficulte: 0,
    partie: 'Le temps',
    idee: 'Écrire DANS la boucle de jeu, et compter les images pour mesurer le temps.',
    texte: [
      'Jusqu’ici, on écrivait **avant** la boucle de jeu, une fois pour toutes. Ici, on écrit **dedans** : à chaque image, la case (0, 0) reçoit la lettre du moment.',
      '**La console ne connaît ni les secondes ni les millisecondes : elle compte les images.** Il y en a **60 par seconde** ; une image dure donc 1000 ÷ 60 ≈ **16,7 millisecondes**. `image()` attend l’image suivante : chaque tour de boucle dure une image.',
      '**`IMAGES_PAR_SECONDE`** et **`SECONDES`** donnent un nom à ces nombres. `SECONDES * IMAGES_PAR_SECONDE` vaut 1 × 60 = 60 : quand `images` atteint 60, une seconde est passée. Pour changer la vitesse, on ne touche qu’à `SECONDES`.',
      '**Limite :** `images` est un `uint8_t`, qui ne dépasse pas 255. On compte donc au plus 255 images, environ **4 secondes** : `SECONDES = 5` donnerait 300, trop grand. Le chapitre suivant montre `attendre()`, qui n’a pas cette limite.',
      'Chaque nouvelle lettre **écrase** la précédente, comme au 0.3. Après Z, `lettre` revient à 0 : on repart de A.',
    ],
    code: `const uint8_t IMAGES_PAR_SECONDE = 60;   // la console affiche 60 images par seconde
const uint8_t SECONDES = 1;              // le temps entre deux lettres, en secondes

uint8_t lettre = 0;   // l'indice de la lettre affichée
uint8_t images = 0;   // les images comptées depuis la dernière lettre

int main() {
  while (true) {
    image();          // attend l'image suivante : environ 16,7 ms
    images++;         // une image de plus

    if (images == SECONDES * IMAGES_PAR_SECONDE) {  // 1 × 60 = 60 images = 1 seconde
      images = 0;                                   // on recommence à compter
      lettre++;                                     // la lettre suivante
      if (lettre == sizeof(ALPHABET)) lettre = 0;   // après Z, on revient à A
    }

    poser(0, 0, ALPHABET[lettre]);   // la même case : la lettre écrase la précédente
  }
}
`,
    aVoir: 'En haut à gauche : A, puis B une seconde plus tard, puis C…',
    controle: (c) => {
      c.avancer(10)
      const debut = c.mot(0, 0, 1)
      c.avancer(60)
      const uneSeconde = c.mot(0, 0, 1)
      c.avancer(60)
      return [
        ['A au départ', debut === 'A'],
        ['B une seconde plus tard', uneSeconde === 'B'],
        ['C la seconde d’après', c.mot(0, 0, 1) === 'C'],
      ]
    },
  },

  {
    titre: 'Une lettre toutes les secondes — de base, ailleurs',
    difficulte: 0,
    suite: true,
    idee: 'Le 0.12 en colonne 10 : la lettre qui change chaque seconde, au milieu de la ligne.',
    texte: [
      '**C’est le 0.12**, avec un seul changement : la **colonne** du `poser` : 10 au lieu de 0.',
      '**Le chronomètre ne change pas :** seule la case où l’on affiche la lettre a bougé.',
      '**C’est la version de base** : une seule chose, à la deuxième place. Le 0.12.2 met les deux ensemble.',
    ],
    code: `const uint8_t IMAGES_PAR_SECONDE = 60;
const uint8_t SECONDES = 1;
uint8_t lettre = 0;
uint8_t images = 0;

int main() {
  while (true) {
    image();
    images++;
    if (images == SECONDES * IMAGES_PAR_SECONDE) {
      images = 0;
      lettre++;
      if (lettre == sizeof(ALPHABET)) lettre = 0;
    }
    // Le changement : la colonne, 0 → 10.
    poser(10, 0, ALPHABET[lettre]);
  }
}
`,
    aVoir: 'Une lettre en haut, au milieu de la ligne, qui change chaque seconde.',
    controle: (c) => {
      c.avancer(10)
      const avant = c.mot(10, 0, 1)
      c.avancer(130)
      return [
        ['une lettre en (10, 0)', /[A-Z]/.test(avant)],
        ['elle a changé depuis', c.mot(10, 0, 1) !== avant, ` (${avant} → ${c.mot(10, 0, 1)})`],
      ]
    },
  },

  {
    titre: 'Une lettre toutes les secondes — doublé, deux positions',
    difficulte: 0,
    suite: true,
    idee: 'La même lettre à deux places : colonne 0 et colonne 10. Un seul chronomètre, deux poser.',
    texte: [
      '**C’est le 0.12 et le 0.12.1 réunis** : deux `poser` de la même lettre, en colonne 0 et en colonne 10.',
      '**Les deux changent ensemble :** c’est la **même** variable `lettre`, affichée à deux endroits. Pour deux rythmes différents, il faut deux variables : c’est le 0.14.',
    ],
    code: `const uint8_t IMAGES_PAR_SECONDE = 60;
const uint8_t SECONDES = 1;
uint8_t lettre = 0;
uint8_t images = 0;

int main() {
  while (true) {
    image();
    images++;
    if (images == SECONDES * IMAGES_PAR_SECONDE) {
      images = 0;
      lettre++;
      if (lettre == sizeof(ALPHABET)) lettre = 0;
    }
    poser(0, 0, ALPHABET[lettre]);    // colonne 0 (le 0.12)
    poser(10, 0, ALPHABET[lettre]);   // colonne 10 (le 0.12.1) : la même lettre
  }
}
`,
    aVoir: 'Deux fois la même lettre, en colonne 0 et en colonne 10, qui changent ensemble chaque seconde.',
    controle: (c) => {
      c.avancer(130)
      return [
        ['la même lettre aux deux places', c.mot(0, 0, 1) === c.mot(10, 0, 1) && /[A-Z]/.test(c.mot(0, 0, 1)), ` (${c.mot(0, 0, 1)} et ${c.mot(10, 0, 1)})`],
      ]
    },
  },

  {
    titre: 'Une lettre toutes les secondes, avec attendre',
    difficulte: 0,
    idee: 'Le temps dit directement en secondes : attendre(1).',
    texte: [
      '**Ce qui est nouveau ici :** `attendre(secondes)`. Elle fait partie de la console, comme `ALPHABET` : on s’en sert sans rien déclarer.',
      '`attendre(1)` attend **une seconde**, puis le programme continue à la ligne suivante. À l’intérieur, elle compte les images à notre place : 1 × 60 = 60 images. On peut aller jusqu’à `attendre(255)`, plus de 4 minutes.',
      'Le programme se lit dans l’ordre : **afficher** la lettre, **attendre** une seconde, passer à la **suivante**. Il n’y a plus de compteur `images`, ni d’`image()` : `attendre` s’en occupe.',
      '**La différence avec le 0.12 :** pendant `attendre()`, le programme est **arrêté**. Rien d’autre ne se passe : la manette n’est pas lue. En comptant les images soi-même (0.12), la boucle de jeu continue de tourner pendant l’attente. Pour un jeu, c’est souvent ce qu’il faut ; pour faire patienter, `attendre` est plus simple.',
      '**La limite :** `attendre` ne sait pas **ce qui** doit attendre : il fige **tout** le programme. Avec `attendre(10)`, aucune autre chose ne peut bouger pendant 10 secondes. Pour que plusieurs choses aient chacune leur rythme, voir le chapitre suivant.',
    ],
    code: `uint8_t lettre = 0;   // l'indice de la lettre affichée

int main() {
  while (true) {
    poser(0, 0, ALPHABET[lettre]);   // 1. affiche la lettre en haut à gauche
    attendre(1);                     // 2. attend 1 seconde : le nombre entre ( ) est en SECONDES
                                     //    (tout le programme s'arrête pendant ce temps)

    lettre++;                                       // 3. la lettre suivante
    if (lettre == sizeof(ALPHABET)) lettre = 0;     //    après Z, on revient à A
  }
}
`,
    aVoir: 'En haut à gauche : A, puis B une seconde plus tard, puis C…, comme au 0.12.',
    controle: (c) => {
      c.avancer(10)
      const debut = c.mot(0, 0, 1)
      c.avancer(60)
      const uneSeconde = c.mot(0, 0, 1)
      c.avancer(60)
      return [
        ['A au départ', debut === 'A'],
        ['B une seconde plus tard', uneSeconde === 'B'],
        ['C la seconde d’après', c.mot(0, 0, 1) === 'C'],
      ]
    },
  },

  {
    titre: 'Une lettre toutes les secondes, avec attendre — de base, ailleurs',
    difficulte: 0,
    suite: true,
    idee: 'Le 0.13 en colonne 10.',
    texte: [
      '**C’est le 0.13**, avec un seul changement : la **colonne** du `poser` : 10 au lieu de 0.',
      '**`attendre(1)` ne change pas** : une seconde entre deux lettres.',
      '**C’est la version de base** : une seule chose, à la deuxième place. Le 0.13.2 met les deux ensemble.',
    ],
    code: `uint8_t lettre = 0;

int main() {
  while (true) {
    poser(10, 0, ALPHABET[lettre]);   // le changement : colonne 0 → 10
    attendre(1);
    lettre++;
    if (lettre == sizeof(ALPHABET)) lettre = 0;
  }
}
`,
    aVoir: 'Une lettre au milieu de la ligne du haut, qui change chaque seconde.',
    controle: (c) => {
      c.avancer(10)
      const avant = c.mot(10, 0, 1)
      c.avancer(130)
      return [
        ['une lettre en (10, 0)', /[A-Z]/.test(avant)],
        ['elle a changé depuis', c.mot(10, 0, 1) !== avant, ` (${avant} → ${c.mot(10, 0, 1)})`],
      ]
    },
  },

  {
    titre: 'Une lettre toutes les secondes, avec attendre — doublé, deux positions',
    difficulte: 0,
    suite: true,
    idee: 'Deux poser avant attendre : la même lettre en colonne 0 et en colonne 10.',
    texte: [
      '**C’est le 0.13 et le 0.13.1 réunis** : deux `poser`, avant le même `attendre(1)`.',
      '**`attendre` arrête tout :** les deux lettres sont posées, puis le programme attend une seconde, et recommence.',
    ],
    code: `uint8_t lettre = 0;

int main() {
  while (true) {
    poser(0, 0, ALPHABET[lettre]);    // colonne 0 (le 0.13)
    poser(10, 0, ALPHABET[lettre]);   // colonne 10 (le 0.13.1)
    attendre(1);
    lettre++;
    if (lettre == sizeof(ALPHABET)) lettre = 0;
  }
}
`,
    aVoir: 'La même lettre en colonne 0 et en colonne 10, qui change chaque seconde.',
    controle: (c) => {
      c.avancer(130)
      return [['la même lettre aux deux places', c.mot(0, 0, 1) === c.mot(10, 0, 1) && /[A-Z]/.test(c.mot(0, 0, 1))]]
    },
  },

  {
    titre: 'Deux choses, deux rythmes',
    difficulte: 0,
    idee: 'Un compteur par chose : chacune avance à son rythme, et rien ne s’arrête.',
    texte: [
      '**Le problème :** `attendre()` fige tout le programme. Impossible, avec lui, de faire changer une lettre toutes les secondes **et** une autre quatre fois par seconde : pendant que l’une attend, l’autre attend aussi.',
      '**La solution :** on n’arrête plus jamais le programme. La boucle tourne sans cesse, un tour par image (60 par seconde), et **chaque chose a son propre compteur** d’images. C’est la méthode du 0.12, faite deux fois.',
      '**La lettre lente** (ligne 0) : son compteur `imagesLente` avance d’un à chaque tour ; à **60**, une seconde est passée : elle change de lettre, et son compteur repart de 0.',
      '**La lettre rapide** (ligne 2) : son compteur `imagesRapide` avance en même temps ; à **15**, un quart de seconde est passé (60 ÷ 4 = 15) : elle change, et son compteur repart de 0. Elle change donc **4 fois** pendant que la lente change **une fois**.',
      'Les deux compteurs sont **indépendants** : on peut changer le 15 sans toucher au 60. Et comme la boucle ne s’arrête jamais, on pourrait lire la manette en même temps. C’est comme cela que tourne un jeu.',
      '**Le déroulé dans le temps :** **0 s** (tour 0) : A en haut, A en bas · **0,25 s** (tour 15) : `imagesRapide` atteint 15 et repart à 0, la rapide passe à **B** · **0,5 s** (tour 30) : la rapide passe à **C** · **0,75 s** (tour 45) : la rapide passe à **D** · **1 s** (tour 60) : `imagesLente` atteint 60 **et** `imagesRapide` atteint 15 : **les deux** changent, la lente passe à **B**, la rapide à **E**.',
      '**Rappels :** `++` veut dire « ajoute 1 » ; `==` compare (« est égal à ? »), alors qu’un seul `=` range une valeur ; `sizeof(ALPHABET)` vaut 26, le nombre de lettres.',
    ],
    code: `// ─────────────────────────────────────────────────────────────
// LES VARIABLES : écrites AVANT main(), elles existent pendant
// tout le programme et gardent leur valeur d'un tour à l'autre.
// uint8_t = un nombre entier de 0 à 255.
// ─────────────────────────────────────────────────────────────

uint8_t lente = 0;          // QUELLE lettre montre la lente : 0 = A, 1 = B … 25 = Z
uint8_t rapide = 0;         // QUELLE lettre montre la rapide : 0 = A, 1 = B … 25 = Z

uint8_t imagesLente = 0;    // le CHRONOMÈTRE de la lente :
                            // combien d'images depuis son dernier changement
uint8_t imagesRapide = 0;   // le CHRONOMÈTRE de la rapide, séparé de l'autre

int main() {

  // La boucle de jeu : elle ne s'arrête JAMAIS.
  // Chaque tour dure exactement une image, soit 1/60e de seconde.
  while (true) {

    image();                // attend l'image suivante (≈ 16,7 ms) :
                            // c'est ce qui cadence la boucle à 60 tours par seconde

    // À chaque tour, UNE image est passée : les deux chronomètres
    // avancent d'un cran, en même temps, chacun de son côté.
    imagesLente++;          // ++ veut dire « ajoute 1 »
    imagesRapide++;

    // ── LA LENTE : elle change toutes les 60 images = toutes les secondes ──
    if (imagesLente == 60) {                    // == veut dire « est égal à ? »
                                                // (un seul = voudrait dire « range »)
      imagesLente = 0;                          // son chronomètre repart de zéro
      lente++;                                  // elle passe à la lettre suivante
      if (lente == sizeof(ALPHABET)) lente = 0; // sizeof(ALPHABET) = 26 :
                                                // après Z (25), 26 n'existe pas → retour à A (0)
    }

    // ── LA RAPIDE : elle change toutes les 15 images = 4 fois par seconde ──
    // (60 images ÷ 15 = 4 changements par seconde)
    if (imagesRapide == 15) {
      imagesRapide = 0;                            // son chronomètre repart de zéro
      rapide++;                                    // elle passe à la lettre suivante
      if (rapide == sizeof(ALPHABET)) rapide = 0;  // après Z, retour à A
    }

    // ── L'AFFICHAGE : à CHAQUE tour, on repose les deux lettres ──
    // Si rien n'a changé, on repose la même lettre au même endroit : ça ne se voit pas.
    // Si l'indice a changé, la nouvelle lettre écrase l'ancienne (comme au 0.3).
    poser(0, 0, ALPHABET[lente]);    // colonne 0, ligne 0 : la lente
    poser(0, 2, ALPHABET[rapide]);   // colonne 0, ligne 2 : la rapide
                                     // (la ligne 1 reste vide pour les séparer)
  }
}
`,
    aVoir: 'Deux lettres : celle du bas change quatre fois pendant que celle du haut change une fois.',
    controle: (c) => {
      /* Neuf relevés, un tous les quarts de seconde : 8 intervalles, soit 2 secondes. */
      const vu = []
      for (let k = 0; k < 9; k++) { vu.push(c.mot(0, 0, 1) + c.mot(0, 2, 1)); c.avancer(15) }
      const changements = (rang) => vu.slice(1).filter((v, k) => v[rang] !== vu[k][rang]).length
      return [
        ['la rapide change à chaque quart de seconde (8 fois en 2 s)', changements(1) === 8, ` (${vu.join(' ')})`],
        ['la lente change toutes les secondes (2 fois en 2 s)', changements(0) === 2],
      ]
    },
  },

  {
    titre: 'Deux choses, deux rythmes — de base, ailleurs',
    difficulte: 0,
    suite: true,
    idee: 'Le 0.14 en colonne 10 : la lente et la rapide, au milieu de la ligne.',
    texte: [
      '**C’est le 0.14**, avec un seul changement : la **colonne** des deux `poser` : 10 au lieu de 0.',
      '**Les chronomètres ne changent pas :** seules les cases où l’on affiche les deux lettres ont bougé.',
      '**C’est la version de base** : une seule chose, à la deuxième place. Le 0.14.2 met les deux ensemble.',
    ],
    code: `// ─────────────────────────────────────────────────────────────
// LES VARIABLES : écrites AVANT main(), elles existent pendant
// tout le programme et gardent leur valeur d'un tour à l'autre.
// uint8_t = un nombre entier de 0 à 255.
// ─────────────────────────────────────────────────────────────

uint8_t lente = 0;          // QUELLE lettre montre la lente : 0 = A, 1 = B … 25 = Z
uint8_t rapide = 0;         // QUELLE lettre montre la rapide : 0 = A, 1 = B … 25 = Z

uint8_t imagesLente = 0;    // le CHRONOMÈTRE de la lente :
                            // combien d'images depuis son dernier changement
uint8_t imagesRapide = 0;   // le CHRONOMÈTRE de la rapide, séparé de l'autre

int main() {

  // La boucle de jeu : elle ne s'arrête JAMAIS.
  // Chaque tour dure exactement une image, soit 1/60e de seconde.
  while (true) {

    image();                // attend l'image suivante (≈ 16,7 ms) :
                            // c'est ce qui cadence la boucle à 60 tours par seconde

    // À chaque tour, UNE image est passée : les deux chronomètres
    // avancent d'un cran, en même temps, chacun de son côté.
    imagesLente++;          // ++ veut dire « ajoute 1 »
    imagesRapide++;

    // ── LA LENTE : elle change toutes les 60 images = toutes les secondes ──
    if (imagesLente == 60) {                    // == veut dire « est égal à ? »
                                                // (un seul = voudrait dire « range »)
      imagesLente = 0;                          // son chronomètre repart de zéro
      lente++;                                  // elle passe à la lettre suivante
      if (lente == sizeof(ALPHABET)) lente = 0; // sizeof(ALPHABET) = 26 :
                                                // après Z (25), 26 n'existe pas → retour à A (0)
    }

    // ── LA RAPIDE : elle change toutes les 15 images = 4 fois par seconde ──
    // (60 images ÷ 15 = 4 changements par seconde)
    if (imagesRapide == 15) {
      imagesRapide = 0;                            // son chronomètre repart de zéro
      rapide++;                                    // elle passe à la lettre suivante
      if (rapide == sizeof(ALPHABET)) rapide = 0;  // après Z, retour à A
    }

    // ── L'AFFICHAGE : à CHAQUE tour, on repose les deux lettres ──
    // Si rien n'a changé, on repose la même lettre au même endroit : ça ne se voit pas.
    // Si l'indice a changé, la nouvelle lettre écrase l'ancienne (comme au 0.3).
    poser(10, 0, ALPHABET[lente]);    // la lente : colonne 0 → 10
    poser(10, 2, ALPHABET[rapide]);   // la rapide : colonne 0 → 10
                                     // (la ligne 1 reste vide pour les séparer)
  }
}
`,
    aVoir: 'La lente et la rapide, en colonne 10.',
    controle: (c) => {
      c.avancer(10)
      const debut = [c.mot(10, 0, 1) + c.mot(10, 2, 1)]
      c.avancer(70)
      return [
        ['colonne 10 : la lente (ligne 0) et la rapide (ligne 2) changent', c.mot(10, 2, 1) !== debut[0][1] && /[A-Z]/.test(c.mot(10, 0, 1))],
      ]
    },
  },

  {
    titre: 'Deux choses, deux rythmes — doublé, deux positions',
    difficulte: 0,
    suite: true,
    idee: 'Les deux rythmes à deux places : en colonne 0 et en colonne 10.',
    texte: [
      '**C’est le 0.14 et le 0.14.1 réunis** : les deux `poser` du 0.14, et les deux du 0.14.1.',
      '**Quatre `poser`, deux variables :** la lente est la même en colonne 0 et en colonne 10, la rapide aussi.',
    ],
    code: `// ─────────────────────────────────────────────────────────────
// LES VARIABLES : écrites AVANT main(), elles existent pendant
// tout le programme et gardent leur valeur d'un tour à l'autre.
// uint8_t = un nombre entier de 0 à 255.
// ─────────────────────────────────────────────────────────────

uint8_t lente = 0;          // QUELLE lettre montre la lente : 0 = A, 1 = B … 25 = Z
uint8_t rapide = 0;         // QUELLE lettre montre la rapide : 0 = A, 1 = B … 25 = Z

uint8_t imagesLente = 0;    // le CHRONOMÈTRE de la lente :
                            // combien d'images depuis son dernier changement
uint8_t imagesRapide = 0;   // le CHRONOMÈTRE de la rapide, séparé de l'autre

int main() {

  // La boucle de jeu : elle ne s'arrête JAMAIS.
  // Chaque tour dure exactement une image, soit 1/60e de seconde.
  while (true) {

    image();                // attend l'image suivante (≈ 16,7 ms) :
                            // c'est ce qui cadence la boucle à 60 tours par seconde

    // À chaque tour, UNE image est passée : les deux chronomètres
    // avancent d'un cran, en même temps, chacun de son côté.
    imagesLente++;          // ++ veut dire « ajoute 1 »
    imagesRapide++;

    // ── LA LENTE : elle change toutes les 60 images = toutes les secondes ──
    if (imagesLente == 60) {                    // == veut dire « est égal à ? »
                                                // (un seul = voudrait dire « range »)
      imagesLente = 0;                          // son chronomètre repart de zéro
      lente++;                                  // elle passe à la lettre suivante
      if (lente == sizeof(ALPHABET)) lente = 0; // sizeof(ALPHABET) = 26 :
                                                // après Z (25), 26 n'existe pas → retour à A (0)
    }

    // ── LA RAPIDE : elle change toutes les 15 images = 4 fois par seconde ──
    // (60 images ÷ 15 = 4 changements par seconde)
    if (imagesRapide == 15) {
      imagesRapide = 0;                            // son chronomètre repart de zéro
      rapide++;                                    // elle passe à la lettre suivante
      if (rapide == sizeof(ALPHABET)) rapide = 0;  // après Z, retour à A
    }

    // ── L'AFFICHAGE : à CHAQUE tour, on repose les deux lettres ──
    // Si rien n'a changé, on repose la même lettre au même endroit : ça ne se voit pas.
    // Si l'indice a changé, la nouvelle lettre écrase l'ancienne (comme au 0.3).
    poser(0, 0, ALPHABET[lente]);    // colonne 0, ligne 0 : la lente
    poser(0, 2, ALPHABET[rapide]);   // colonne 0, ligne 2 : la rapide
    poser(10, 0, ALPHABET[lente]);    // la lente, en colonne 10 (le 0.14.1)
    poser(10, 2, ALPHABET[rapide]);   // la rapide, en colonne 10 (le 0.14.1)
                                     // (la ligne 1 reste vide pour les séparer)
  }
}
`,
    aVoir: 'La lente et la rapide, en colonne 0 et en colonne 10.',
    controle: (c) => {
      c.avancer(10)
      const debut = [c.mot(0, 0, 1) + c.mot(0, 2, 1), c.mot(10, 0, 1) + c.mot(10, 2, 1)]
      c.avancer(70)
      return [
        ['colonne 0 : la lente (ligne 0) et la rapide (ligne 2) changent', c.mot(0, 2, 1) !== debut[0][1] && /[A-Z]/.test(c.mot(0, 0, 1))],
        ['colonne 10 : la lente (ligne 0) et la rapide (ligne 2) changent', c.mot(10, 2, 1) !== debut[1][1] && /[A-Z]/.test(c.mot(10, 0, 1))],
      ]
    },
  },

  {
    titre: 'Deux rythmes, un seul chronomètre',
    difficulte: 0,
    idee: 'Le même programme en plus court : un seul compteur, et le modulo fait le reste.',
    texte: [
      '**C’est le programme du 0.14, en plus simple.** L’écran est exactement le même : la lettre du bas change quatre fois pendant que celle du haut change une fois.',
      '**Un seul chronomètre :** au lieu de deux compteurs, `images` compte de 0 à 59, puis repart à 0. Il fait donc un tour complet **chaque seconde**.',
      '**La lente** change quand le chronomètre repasse par **0** : une fois par tour, donc une fois par seconde.',
      '**La rapide** change quand `images % 15 == 0` : quand `images` est un **multiple de 15**, c’est-à-dire 0, 15, 30 ou 45. Le reste de la division par 15 ne vaut 0 que pour ces nombres : 30 % 15 = 0, mais 31 % 15 = 1. Cela fait **4 fois** par tour, donc 4 fois par seconde.',
      '**Le retour à A sans `if` :** `(rapide + 1) % sizeof(ALPHABET)` ajoute 1, puis garde le reste de la division par 26. Tant qu’on est sous 26, le reste est le nombre lui-même (7 % 26 = 7) ; à 26, il retombe à **0** (26 % 26 = 0) : après Z, A.',
      '**Ce qu’on gagne :** 3 variables au lieu de 4, deux `if` d’une ligne au lieu de deux blocs, et un programme plus léger. **Ce qu’on perd :** les deux rythmes sont liés au même chronomètre ; au 0.14, on pouvait choisir n’importe quelle durée pour chacun, sans rapport entre eux.',
    ],
    code: `uint8_t lente = 0;    // QUELLE lettre montre la lente : 0 = A … 25 = Z
uint8_t rapide = 0;   // QUELLE lettre montre la rapide : 0 = A … 25 = Z
uint8_t images = 0;   // UN SEUL chronomètre : il compte de 0 à 59, soit 1 seconde

int main() {
  while (true) {
    image();                        // attend l'image suivante : 60 tours par seconde

    // Le chronomètre avance d'une image, et repart à 0 après 59 :
    // il fait un tour complet chaque seconde.
    images++;
    if (images == 60) images = 0;

    // La RAPIDE : quand images vaut 0, 15, 30 ou 45 (4 fois par seconde).
    //   images % 15 = le reste de images divisé par 15 ;
    //   il vaut 0 seulement pour les multiples de 15.
    // (rapide + 1) % sizeof(ALPHABET) : la lettre suivante,
    //   et après Z (25 + 1 = 26), 26 % 26 = 0 : retour à A.
    if (images % 15 == 0) rapide = (rapide + 1) % sizeof(ALPHABET);

    // La LENTE : quand le chronomètre repasse par 0 (1 fois par seconde).
    if (images == 0) lente = (lente + 1) % sizeof(ALPHABET);

    poser(0, 0, ALPHABET[lente]);    // ligne 0 : la lente
    poser(0, 2, ALPHABET[rapide]);   // ligne 2 : la rapide
  }
}
`,
    aVoir: 'Comme au 0.14 : la lettre du bas change quatre fois pendant que celle du haut change une fois.',
    controle: (c) => {
      /* Neuf relevés, un tous les quarts de seconde : 8 intervalles, soit 2 secondes. */
      const vu = []
      for (let k = 0; k < 9; k++) { vu.push(c.mot(0, 0, 1) + c.mot(0, 2, 1)); c.avancer(15) }
      const changements = (rang) => vu.slice(1).filter((v, k) => v[rang] !== vu[k][rang]).length
      /* Assez longtemps pour que la rapide fasse le tour de l'alphabet : 26 changements. */
      c.avancer(15 * 26)
      return [
        ['la rapide change à chaque quart de seconde (8 fois en 2 s)', changements(1) === 8, ` (${vu.join(' ')})`],
        ['la lente change toutes les secondes (2 fois en 2 s)', changements(0) === 2],
        ['après Z, on revient bien à A (les lettres restent des lettres)', /^[A-Z]$/.test(c.mot(0, 2, 1))],
      ]
    },
  },

  {
    titre: 'Deux rythmes, un seul chronomètre — de base, ailleurs',
    difficulte: 0,
    suite: true,
    idee: 'Le 0.15 en colonne 10 : la lente et la rapide, au milieu de la ligne.',
    texte: [
      '**C’est le 0.15**, avec un seul changement : la **colonne** des deux `poser` : 10 au lieu de 0.',
      '**Les chronomètres ne changent pas :** seules les cases où l’on affiche les deux lettres ont bougé.',
      '**C’est la version de base** : une seule chose, à la deuxième place. Le 0.15.2 met les deux ensemble.',
    ],
    code: `uint8_t lente = 0;    // QUELLE lettre montre la lente : 0 = A … 25 = Z
uint8_t rapide = 0;   // QUELLE lettre montre la rapide : 0 = A … 25 = Z
uint8_t images = 0;   // UN SEUL chronomètre : il compte de 0 à 59, soit 1 seconde

int main() {
  while (true) {
    image();                        // attend l'image suivante : 60 tours par seconde

    // Le chronomètre avance d'une image, et repart à 0 après 59 :
    // il fait un tour complet chaque seconde.
    images++;
    if (images == 60) images = 0;

    // La RAPIDE : quand images vaut 0, 15, 30 ou 45 (4 fois par seconde).
    //   images % 15 = le reste de images divisé par 15 ;
    //   il vaut 0 seulement pour les multiples de 15.
    // (rapide + 1) % sizeof(ALPHABET) : la lettre suivante,
    //   et après Z (25 + 1 = 26), 26 % 26 = 0 : retour à A.
    if (images % 15 == 0) rapide = (rapide + 1) % sizeof(ALPHABET);

    // La LENTE : quand le chronomètre repasse par 0 (1 fois par seconde).
    if (images == 0) lente = (lente + 1) % sizeof(ALPHABET);

    poser(10, 0, ALPHABET[lente]);    // la lente : colonne 0 → 10
    poser(10, 2, ALPHABET[rapide]);   // la rapide : colonne 0 → 10
  }
}
`,
    aVoir: 'La lente et la rapide, en colonne 10.',
    controle: (c) => {
      c.avancer(10)
      const debut = [c.mot(10, 0, 1) + c.mot(10, 2, 1)]
      c.avancer(70)
      return [
        ['colonne 10 : la lente (ligne 0) et la rapide (ligne 2) changent', c.mot(10, 2, 1) !== debut[0][1] && /[A-Z]/.test(c.mot(10, 0, 1))],
      ]
    },
  },

  {
    titre: 'Deux rythmes, un seul chronomètre — doublé, deux positions',
    difficulte: 0,
    suite: true,
    idee: 'Les deux rythmes à deux places : en colonne 0 et en colonne 10.',
    texte: [
      '**C’est le 0.15 et le 0.15.1 réunis** : les deux `poser` du 0.15, et les deux du 0.15.1.',
      '**Quatre `poser`, deux variables :** la lente est la même en colonne 0 et en colonne 10, la rapide aussi.',
    ],
    code: `uint8_t lente = 0;    // QUELLE lettre montre la lente : 0 = A … 25 = Z
uint8_t rapide = 0;   // QUELLE lettre montre la rapide : 0 = A … 25 = Z
uint8_t images = 0;   // UN SEUL chronomètre : il compte de 0 à 59, soit 1 seconde

int main() {
  while (true) {
    image();                        // attend l'image suivante : 60 tours par seconde

    // Le chronomètre avance d'une image, et repart à 0 après 59 :
    // il fait un tour complet chaque seconde.
    images++;
    if (images == 60) images = 0;

    // La RAPIDE : quand images vaut 0, 15, 30 ou 45 (4 fois par seconde).
    //   images % 15 = le reste de images divisé par 15 ;
    //   il vaut 0 seulement pour les multiples de 15.
    // (rapide + 1) % sizeof(ALPHABET) : la lettre suivante,
    //   et après Z (25 + 1 = 26), 26 % 26 = 0 : retour à A.
    if (images % 15 == 0) rapide = (rapide + 1) % sizeof(ALPHABET);

    // La LENTE : quand le chronomètre repasse par 0 (1 fois par seconde).
    if (images == 0) lente = (lente + 1) % sizeof(ALPHABET);

    poser(0, 0, ALPHABET[lente]);    // ligne 0 : la lente
    poser(0, 2, ALPHABET[rapide]);   // ligne 2 : la rapide
    poser(10, 0, ALPHABET[lente]);    // la lente, en colonne 10 (le 0.15.1)
    poser(10, 2, ALPHABET[rapide]);   // la rapide, en colonne 10 (le 0.15.1)
  }
}
`,
    aVoir: 'La lente et la rapide, en colonne 0 et en colonne 10.',
    controle: (c) => {
      c.avancer(10)
      const debut = [c.mot(0, 0, 1) + c.mot(0, 2, 1), c.mot(10, 0, 1) + c.mot(10, 2, 1)]
      c.avancer(70)
      return [
        ['colonne 0 : la lente (ligne 0) et la rapide (ligne 2) changent', c.mot(0, 2, 1) !== debut[0][1] && /[A-Z]/.test(c.mot(0, 0, 1))],
        ['colonne 10 : la lente (ligne 0) et la rapide (ligne 2) changent', c.mot(10, 2, 1) !== debut[1][1] && /[A-Z]/.test(c.mot(10, 0, 1))],
      ]
    },
  },

  {
    titre: 'Deux rythmes, écrits en millisecondes',
    difficulte: 0,
    idee: 'ms(1000) et ms(250) : chaque durée s’écrit en millisecondes, la console la traduit en images.',
    texte: [
      '**C’est le programme du 0.14**, mais les durées ne sont plus des nombres d’images à calculer de tête : elles s’écrivent en **millisecondes** (millièmes de seconde). 1000 ms = 1 seconde ; 250 ms = un quart de seconde.',
      '**Ce qui est nouveau ici :** `ms(durée)`. Elle fait partie de la console, comme `ALPHABET` : on s’en sert sans rien déclarer. Elle **traduit** une durée en millisecondes en nombre d’images, car la console ne sait compter que les images.',
      '**La traduction :** une image dure 1000 ÷ 60 ≈ **16,7 ms**. `ms(1000)` donne donc 60 images, `ms(250)` donne 15 images, `ms(500)` donne 30 images. Le résultat est arrondi à l’image la plus proche : `ms(100)` donne 6 images, soit 100 ms environ.',
      '**Elle ne coûte rien :** la traduction est faite par le compilateur, avant que la cartouche existe. `ms(250)` est remplacé par 15, et la console ne voit qu’un nombre. C’est pour cela qu’il faut écrire la durée **en clair** : `ms(250)`, et non `ms(une_variable)`.',
      '**Les constantes `DUREE_LENTE` et `DUREE_RAPIDE`** rangent les deux durées en haut du programme : pour changer un rythme, on change un seul nombre, en millisecondes.',
      '**La limite :** les compteurs sont des `uint8_t`, qui s’arrêtent à 255 images. On peut donc aller jusqu’à `ms(4250)`, environ 4 secondes. Au-delà, le compilateur refuse et l’explique. En dessous de 17 ms (moins d’une image), il refuse aussi : la console ne sait pas compter plus fin.',
    ],
    code: `// ─────────────────────────────────────────────────────────────
// LES DURÉES, EN MILLISECONDES (1000 ms = 1 seconde).
// ms() les traduit en images (60 images = 1000 ms) :
// ms(1000) = 60 images, ms(250) = 15 images.
// ─────────────────────────────────────────────────────────────

const uint8_t DUREE_LENTE  = ms(1000);   // la lente change toutes les 1000 ms (1 seconde)
const uint8_t DUREE_RAPIDE = ms(250);    // la rapide change toutes les 250 ms (4 fois par seconde)

uint8_t lente = 0;          // QUELLE lettre montre la lente : 0 = A … 25 = Z
uint8_t rapide = 0;         // QUELLE lettre montre la rapide : 0 = A … 25 = Z

uint8_t imagesLente = 0;    // le CHRONOMÈTRE de la lente, en images
uint8_t imagesRapide = 0;   // le CHRONOMÈTRE de la rapide, en images

int main() {
  while (true) {
    image();                // attend l'image suivante : un tour ≈ 16,7 ms

    imagesLente++;          // une image de plus pour chaque chronomètre
    imagesRapide++;

    // ── LA LENTE : quand son chronomètre atteint DUREE_LENTE (1000 ms) ──
    if (imagesLente == DUREE_LENTE) {
      imagesLente = 0;                              // son chronomètre repart de zéro
      lente++;                                      // la lettre suivante
      if (lente == sizeof(ALPHABET)) lente = 0;     // après Z, retour à A
    }

    // ── LA RAPIDE : quand son chronomètre atteint DUREE_RAPIDE (250 ms) ──
    if (imagesRapide == DUREE_RAPIDE) {
      imagesRapide = 0;                             // son chronomètre repart de zéro
      rapide++;                                     // la lettre suivante
      if (rapide == sizeof(ALPHABET)) rapide = 0;   // après Z, retour à A
    }

    poser(0, 0, ALPHABET[lente]);    // ligne 0 : la lente (toutes les 1000 ms)
    poser(0, 2, ALPHABET[rapide]);   // ligne 2 : la rapide (toutes les 250 ms)
  }
}
`,
    aVoir: 'Comme au 0.14 : la lettre du bas change quatre fois pendant que celle du haut change une fois.',
    controle: (c) => {
      /* Neuf relevés, un tous les quarts de seconde : 8 intervalles, soit 2 secondes. */
      const vu = []
      for (let k = 0; k < 9; k++) { vu.push(c.mot(0, 0, 1) + c.mot(0, 2, 1)); c.avancer(15) }
      const changements = (rang) => vu.slice(1).filter((v, k) => v[rang] !== vu[k][rang]).length
      return [
        ['la rapide change toutes les 250 ms (8 fois en 2 s)', changements(1) === 8, ` (${vu.join(' ')})`],
        ['la lente change toutes les 1000 ms (2 fois en 2 s)', changements(0) === 2],
      ]
    },
  },

  {
    titre: 'Deux rythmes, écrits en millisecondes — de base, ailleurs',
    difficulte: 0,
    suite: true,
    idee: 'Le 0.16 en colonne 10 : la lente et la rapide, au milieu de la ligne.',
    texte: [
      '**C’est le 0.16**, avec un seul changement : la **colonne** des deux `poser` : 10 au lieu de 0.',
      '**Les chronomètres ne changent pas :** seules les cases où l’on affiche les deux lettres ont bougé.',
      '**C’est la version de base** : une seule chose, à la deuxième place. Le 0.16.2 met les deux ensemble.',
    ],
    code: `// ─────────────────────────────────────────────────────────────
// LES DURÉES, EN MILLISECONDES (1000 ms = 1 seconde).
// ms() les traduit en images (60 images = 1000 ms) :
// ms(1000) = 60 images, ms(250) = 15 images.
// ─────────────────────────────────────────────────────────────

const uint8_t DUREE_LENTE  = ms(1000);   // la lente change toutes les 1000 ms (1 seconde)
const uint8_t DUREE_RAPIDE = ms(250);    // la rapide change toutes les 250 ms (4 fois par seconde)

uint8_t lente = 0;          // QUELLE lettre montre la lente : 0 = A … 25 = Z
uint8_t rapide = 0;         // QUELLE lettre montre la rapide : 0 = A … 25 = Z

uint8_t imagesLente = 0;    // le CHRONOMÈTRE de la lente, en images
uint8_t imagesRapide = 0;   // le CHRONOMÈTRE de la rapide, en images

int main() {
  while (true) {
    image();                // attend l'image suivante : un tour ≈ 16,7 ms

    imagesLente++;          // une image de plus pour chaque chronomètre
    imagesRapide++;

    // ── LA LENTE : quand son chronomètre atteint DUREE_LENTE (1000 ms) ──
    if (imagesLente == DUREE_LENTE) {
      imagesLente = 0;                              // son chronomètre repart de zéro
      lente++;                                      // la lettre suivante
      if (lente == sizeof(ALPHABET)) lente = 0;     // après Z, retour à A
    }

    // ── LA RAPIDE : quand son chronomètre atteint DUREE_RAPIDE (250 ms) ──
    if (imagesRapide == DUREE_RAPIDE) {
      imagesRapide = 0;                             // son chronomètre repart de zéro
      rapide++;                                     // la lettre suivante
      if (rapide == sizeof(ALPHABET)) rapide = 0;   // après Z, retour à A
    }

    poser(10, 0, ALPHABET[lente]);    // la lente : colonne 0 → 10
    poser(10, 2, ALPHABET[rapide]);   // la rapide : colonne 0 → 10
  }
}
`,
    aVoir: 'La lente et la rapide, en colonne 10.',
    controle: (c) => {
      c.avancer(10)
      const debut = [c.mot(10, 0, 1) + c.mot(10, 2, 1)]
      c.avancer(70)
      return [
        ['colonne 10 : la lente (ligne 0) et la rapide (ligne 2) changent', c.mot(10, 2, 1) !== debut[0][1] && /[A-Z]/.test(c.mot(10, 0, 1))],
      ]
    },
  },

  {
    titre: 'Deux rythmes, écrits en millisecondes — doublé, deux positions',
    difficulte: 0,
    suite: true,
    idee: 'Les deux rythmes à deux places : en colonne 0 et en colonne 10.',
    texte: [
      '**C’est le 0.16 et le 0.16.1 réunis** : les deux `poser` du 0.16, et les deux du 0.16.1.',
      '**Quatre `poser`, deux variables :** la lente est la même en colonne 0 et en colonne 10, la rapide aussi.',
    ],
    code: `// ─────────────────────────────────────────────────────────────
// LES DURÉES, EN MILLISECONDES (1000 ms = 1 seconde).
// ms() les traduit en images (60 images = 1000 ms) :
// ms(1000) = 60 images, ms(250) = 15 images.
// ─────────────────────────────────────────────────────────────

const uint8_t DUREE_LENTE  = ms(1000);   // la lente change toutes les 1000 ms (1 seconde)
const uint8_t DUREE_RAPIDE = ms(250);    // la rapide change toutes les 250 ms (4 fois par seconde)

uint8_t lente = 0;          // QUELLE lettre montre la lente : 0 = A … 25 = Z
uint8_t rapide = 0;         // QUELLE lettre montre la rapide : 0 = A … 25 = Z

uint8_t imagesLente = 0;    // le CHRONOMÈTRE de la lente, en images
uint8_t imagesRapide = 0;   // le CHRONOMÈTRE de la rapide, en images

int main() {
  while (true) {
    image();                // attend l'image suivante : un tour ≈ 16,7 ms

    imagesLente++;          // une image de plus pour chaque chronomètre
    imagesRapide++;

    // ── LA LENTE : quand son chronomètre atteint DUREE_LENTE (1000 ms) ──
    if (imagesLente == DUREE_LENTE) {
      imagesLente = 0;                              // son chronomètre repart de zéro
      lente++;                                      // la lettre suivante
      if (lente == sizeof(ALPHABET)) lente = 0;     // après Z, retour à A
    }

    // ── LA RAPIDE : quand son chronomètre atteint DUREE_RAPIDE (250 ms) ──
    if (imagesRapide == DUREE_RAPIDE) {
      imagesRapide = 0;                             // son chronomètre repart de zéro
      rapide++;                                     // la lettre suivante
      if (rapide == sizeof(ALPHABET)) rapide = 0;   // après Z, retour à A
    }

    poser(0, 0, ALPHABET[lente]);    // ligne 0 : la lente (toutes les 1000 ms)
    poser(0, 2, ALPHABET[rapide]);   // ligne 2 : la rapide (toutes les 250 ms)
    poser(10, 0, ALPHABET[lente]);    // la lente, en colonne 10 (le 0.16.1)
    poser(10, 2, ALPHABET[rapide]);   // la rapide, en colonne 10 (le 0.16.1)
  }
}
`,
    aVoir: 'La lente et la rapide, en colonne 0 et en colonne 10.',
    controle: (c) => {
      c.avancer(10)
      const debut = [c.mot(0, 0, 1) + c.mot(0, 2, 1), c.mot(10, 0, 1) + c.mot(10, 2, 1)]
      c.avancer(70)
      return [
        ['colonne 0 : la lente (ligne 0) et la rapide (ligne 2) changent', c.mot(0, 2, 1) !== debut[0][1] && /[A-Z]/.test(c.mot(0, 0, 1))],
        ['colonne 10 : la lente (ligne 0) et la rapide (ligne 2) changent', c.mot(10, 2, 1) !== debut[1][1] && /[A-Z]/.test(c.mot(10, 0, 1))],
      ]
    },
  },

  {
    titre: 'Une lettre qui avance de 5 cases',
    difficulte: 0,
    idee: 'Bouger, c’est effacer la lettre à sa place, puis la réécrire un peu plus loin — et s’arrêter après le nombre de pas voulu.',
    texte: [
      'La lettre A avance d’une colonne toutes les **15 images**, soit quatre fois par seconde.',
      'Pour bouger, on **efface** d’abord l’ancienne place avec `effacer(x, 0, 1)`, une case ; puis on ajoute 1 à `x`, et la lettre est réécrite à sa nouvelle place. Sans l’effacement, elle laisserait une traînée de A derrière elle.',
      '**Ce qui est nouveau ici :** la variable `pas`. Elle range le **nombre de cases** à parcourir : 5. Pour que la lettre aille plus loin ou moins loin, on change ce seul nombre, en haut du programme, sans toucher au reste.',
      '**L’arrêt :** la condition `if (x < pas)` compare la colonne de la lettre au nombre de pas. Au départ `x` vaut 0 : 0 < 5 est vrai, le chronomètre tourne et la lettre avance. Après le cinquième pas, `x` vaut 5 : 5 < 5 est **faux**, on ne rentre plus dans le bloc, `x` ne change plus… et la lettre reste en colonne 5.',
      'La boucle `while (true)` continue pourtant de tourner : la lettre est simplement réécrite, à chaque image, à la même place.',
    ],
    code: `uint8_t pas = 5;      // le NOMBRE DE CASES à parcourir : change-le pour aller plus ou moins loin
uint8_t x = 0;        // la colonne de la lettre : elle part de 0 (tout à gauche)
uint8_t images = 0;   // le chronomètre, en images

int main() {
  while (true) {
    image();                  // attend l'image suivante (60 par seconde)

    if (x < pas) {            // tant que la lettre n'a pas fait tous ses pas…
      images++;               //   …le chronomètre tourne
      if (images == 15) {     //   4 fois par seconde :
        images = 0;           //     le chronomètre repart de zéro
        effacer(x, 0, 1);     //     1. efface l'ancienne place
        x++;                  //     2. une colonne plus loin
      }
    }                         // x vaut pas (5) : on ne rentre plus ici, elle s'arrête

    poser(x, 0, ALPHABET[0]); // 3. la lettre à sa place (nouvelle ou finale)
  }
}
`,
    aVoir: 'Un A qui avance de 5 cases vers la droite, puis s’arrête en colonne 5.',
    controle: (c) => {
      /* 5 pas de 15 images = 75 images : après 3 secondes, le voyage est fini. */
      c.avancer(180)
      const arrivee = c.variable('x')
      c.avancer(60)
      const ensuite = c.variable('x')
      return [
        ['la lettre a fait 5 pas', arrivee === 5, ` (x = ${arrivee})`],
        ['le A est en colonne 5', c.mot(5, 0, 1) === 'A'],
        ['un seul A sur la ligne', c.mot(0, 0, 20).trim() === 'A'],
        ['elle reste arrêtée', ensuite === 5, ` (x = ${ensuite})`],
      ]
    },
  },

  {
    titre: 'Une lettre qui avance de 5 cases — de base, ailleurs',
    difficulte: 0,
    suite: true,
    idee: 'Le 0.17 sur la ligne 8, avec le B.',
    texte: [
      '**C’est le 0.17**, avec une autre lettre, le **B** (`ALPHABET[1]`, la 2e lettre), et une autre place : la **ligne 8** au lieu de la ligne 0, dans `effacer` et dans `poser`.',
      '**C’est la version de base** : une seule lettre, à la deuxième place. Le 0.17.2 met les deux ensemble.',
    ],
    code: `uint8_t pas = 5;      // le nombre de cases à parcourir
uint8_t x = 0;        // la colonne de la lettre
uint8_t images = 0;   // le chronomètre, en images

int main() {
  while (true) {
    image();
    if (x < pas) {
      images++;
      if (images == 15) {
        images = 0;
        effacer(x, 8, 1);     // efface l'ancienne place, ligne 8
        x++;
      }
    }
    poser(x, 8, ALPHABET[1]);   // le B, ligne 8
  }
}
`,
    aVoir: 'Un B qui avance de 5 cases sur la ligne 8.',
    controle: (c) => {
      const { B } = suivre(c, 'B', 200, 18)
      return [
        ['le B passe par (3, 8)', B.includes('3,8')],
        ['le B finit en (5, 8)', B.at(-1) === '5,8', ` (${B.at(-1)})`],
      ]
    },
  },

  {
    titre: 'Une lettre qui avance de 5 cases — doublé, deux positions',
    difficulte: 0,
    suite: true,
    idee: 'Le A sur la ligne 0 et le B sur la ligne 8 avancent ensemble : la même variable x pour les deux.',
    texte: [
      '**C’est le 0.17 et le 0.17.1 réunis** : deux `effacer` et deux `poser`, un par ligne.',
      '**Une seule variable `x` pour les deux lettres :** elles sont toujours à la même colonne, donc elles avancent **ensemble**, au même pas.',
    ],
    code: `uint8_t pas = 5;      // le nombre de cases à parcourir
uint8_t x = 0;        // la colonne des deux lettres
uint8_t images = 0;   // le chronomètre, en images

int main() {
  while (true) {
    image();
    if (x < pas) {
      images++;
      if (images == 15) {
        images = 0;
        effacer(x, 0, 1);     // efface l'ancienne place, ligne 0
        effacer(x, 8, 1);     // efface l'ancienne place, ligne 8
        x++;
      }
    }
    poser(x, 0, ALPHABET[0]);   // le A, ligne 0
    poser(x, 8, ALPHABET[1]);   // le B, ligne 8
  }
}
`,
    aVoir: 'Le A et le B avancent ensemble de 5 cases, l’un sur la ligne 0, l’autre sur la ligne 8.',
    controle: (c) => {
      const { A, B } = suivre(c, 'AB', 200, 18)
      return [
        ['le A finit en (5, 0)', A.at(-1) === '5,0', ` (${A.at(-1)})`],
        ['le B finit en (5, 8)', B.at(-1) === '5,8', ` (${B.at(-1)})`],
      ]
    },
  },

  {
    titre: 'Avancer avec deplace_x',
    difficulte: 0,
    partie: 'Déplacer une lettre',
    idee: 'deplace_x(colonne, ligne, tuile, pas) fait tout le 0.17 en une ligne : la lettre avance de 5 cases.',
    texte: [
      '**C’est le programme du 0.17**, mais tout le travail (le chronomètre, l’effacement, le pas de plus, la lettre reposée) est fait par **une seule fonction de la console** : `deplace_x`.',
      '**Ce qui est nouveau ici :** `deplace_x(colonne, ligne, tuile, pas)`. Elle pose la tuile en (`colonne`, `ligne`), puis la fait avancer d’une case vers la droite tous les quarts de seconde (15 images), **`pas` fois**.',
      '**Pourquoi `x = deplace_x(…)` ?** Quand on écrit `deplace_x(x, …)`, la fonction ne reçoit pas la variable `x` elle-même, mais une **copie** de sa valeur (0). Elle fait bouger la lettre en changeant sa copie, jamais notre `x`. À la fin, elle **rend** (`return`) la colonne d’arrivée, 5, et `x = …` range ce 5 dans `x`.',
      '**Sans le `x =`**, en C ordinaire, la lettre bougerait bien à l’écran, mais `x` vaudrait encore 0 : le programme croirait la lettre toujours au départ. Le cours suivant montre quand cela pose problème.',
      '**Elle bloque**, comme `attendre()` : pendant le voyage, rien d’autre ne tourne. Au bord de l’écran (colonne 19), elle s’arrête au lieu de sortir.',
    ],
    code: `uint8_t pas = 5;      // le nombre de cases à parcourir
uint8_t x = 0;        // la colonne de la lettre : elle part de 0 (tout à gauche)

int main() {
  // La ligne, morceau par morceau :
  //
  //   x = deplace_x(x, 0, ALPHABET[0], pas);
  //   |   |         |  |  |            |
  //   |   |         |  |  |            +-- pas     : combien de cases (5)
  //   |   |         |  |  +--------------- tuile   : ce qui bouge, la lettre A
  //   |   |         |  +------------------ ligne   : 0, tout en haut
  //   |   |         +--------------------- colonne : d'où la lettre part.
  //   |   |                                          La fonction reçoit une COPIE
  //   |   |                                          de x (sa valeur, 0), pas x.
  //   |   +--- deplace_x fait avancer la lettre, puis REND (return) la
  //   |        colonne d'arrivée : 5.
  //   +------- « x = » range ce 5 dans x.
  //
  // POURQUOI « x = » ? Une fonction n'a qu'une COPIE de x : elle ne peut pas
  // le changer. Pour garder le résultat, on le RANGE nous-mêmes : x = …
  x = deplace_x(x, 0, ALPHABET[0], pas);    // après cette ligne : x vaut 5

  while (true) {
    image();          // le programme continue ; la lettre, elle, reste en colonne 5
  }
}
`,
    aVoir: 'Un A qui avance de 5 cases vers la droite, puis s’arrête en colonne 5.',
    controle: (c) => {
      c.avancer(150)
      return [
        ['x a reçu la colonne d’arrivée', c.variable('x') === 5, ` (x = ${c.variable('x')})`],
        ['le A est en colonne 5, seul sur sa ligne', c.mot(0, 0, 20) === '     A              ', ` (« ${c.mot(0, 0, 20)} »)`],
      ]
    },
  },

  {
    titre: 'Avancer avec deplace_x — de base, ailleurs',
    difficulte: 0,
    suite: true,
    idee: 'Le 0.18 sur la ligne 8, avec le B.',
    texte: [
      '**C’est le 0.18**, avec une autre lettre, le **B** (`ALPHABET[1]`, la 2e lettre), et une autre place : la **ligne 8** au lieu de 0 (2e réglage de `deplace_x`).',
      '**C’est la version de base** : une seule lettre, à la deuxième place. Le 0.18.2 met les deux ensemble.',
    ],
    code: `uint8_t pas = 5;
uint8_t x = 0;        // la colonne du B

int main() {
  // Les changements : la ligne (0 → 8) et la lettre (ALPHABET[1], le B).
  x = deplace_x(x, 8, ALPHABET[1], pas);    // x vaut 5

  while (true) {
    image();
  }
}
`,
    aVoir: 'Un B qui avance de 5 cases sur la ligne 8.',
    controle: (c) => {
      const { B } = suivre(c, 'B', 150, 18)
      return [
        ['le B finit en (5, 8)', B.at(-1) === '5,8', ` (${B.at(-1)})`],
        ['x vaut 5', c.variable('x') === 5],
      ]
    },
  },

  {
    titre: 'Avancer avec deplace_x — doublé, deux positions',
    difficulte: 0,
    suite: true,
    idee: 'Deux lettres, deux variables : le A (x) sur la ligne 0, puis le B (xb) sur la ligne 8.',
    texte: [
      '**C’est le 0.18 et le 0.18.1 réunis** : deux lignes `deplace_x`.',
      '**Chaque lettre a SA variable :** `x` pour le A, `xb` pour le B. Une seule variable ne suffirait pas : chaque `deplace_x` rend la colonne de SA lettre.',
      '**L’un après l’autre :** `deplace_x` bloque ; le B part quand le A est arrivé.',
    ],
    code: `uint8_t pas = 5;
uint8_t x = 0;        // la colonne du A
uint8_t xb = 0;       // la colonne du B : sa propre variable

int main() {
  x = deplace_x(x, 0, ALPHABET[0], pas);      // le A, ligne 0 (le 0.18)
  xb = deplace_x(xb, 8, ALPHABET[1], pas);    // puis le B, ligne 8 (le 0.18.1)

  while (true) {
    image();
  }
}
`,
    aVoir: 'Le A avance de 5 cases sur la ligne 0, puis le B sur la ligne 8.',
    controle: (c) => {
      const { A, B } = suivre(c, 'AB', 250, 18)
      return [
        ['le A finit en (5, 0)', A.at(-1) === '5,0', ` (${A.at(-1)})`],
        ['le B finit en (5, 8)', B.at(-1) === '5,8', ` (${B.at(-1)})`],
        ['x et xb valent 5', c.variable('x') === 5 && c.variable('xb') === 5],
      ]
    },
  },

  {
    titre: 'Revenir : un pas négatif',
    difficulte: 0,
    idee: 'Le 0.18, plus une ligne : deplace_x avec -pas fait revenir la lettre. C’est là que le « x = » sert.',
    texte: [
      '**C’est le 0.18, plus une ligne :** le retour.',
      '**Ce qui est nouveau ici : un pas négatif.** `-pas`, c’est -5 : la lettre **recule** de 5 cases vers la gauche. Le signe décide du sens : positif vers la droite, négatif vers la gauche.',
      '**Un octet ne connaît pourtant pas les nombres négatifs :** `-5` y est rangé comme 256 − 5 = **251**. `deplace_x` sait donc qu’au-delà de 127, c’est un recul.',
      '**Le retour part de `x`.** Grâce au `x =` du 0.18, `x` vaut 5 : le retour part bien de la colonne 5, et rend 0. Sans le `x =`, en C ordinaire, `x` vaudrait encore 0 : le retour partirait du bord gauche, buterait dessus, et **ne ferait rien**. Le `x =` sert à **garder en mémoire où est la lettre**.',
    ],
    code: `uint8_t pas = 5;      // +5 : avance de 5 cases ; -5 : recule de 5 cases
uint8_t x = 0;        // la colonne de la lettre : elle part de 0 (tout à gauche)

int main() {
  // L'ALLER (le 0.18) : 5 cases vers la droite ; x reçoit 5.
  x = deplace_x(x, 0, ALPHABET[0], pas);    // après cette ligne : x vaut 5

  // LE RETOUR, la ligne ajoutée :
  //
  //   x = deplace_x(x, 0, ALPHABET[0], -pas);
  //                 |                  |
  //                 |                  +-- -pas : -5, un pas NÉGATIF, donc vers
  //                 |                      la gauche. (Dans l'octet, -5 est rangé
  //                 |                      251 ; au-delà de 127, c'est un recul.)
  //                 +-- x vaut 5 grâce à l'aller : le retour part de la colonne 5
  //
  // deplace_x fait reculer la lettre et rend 0 ; « x = » range ce 0 dans x.
  x = deplace_x(x, 0, ALPHABET[0], -pas);   // après cette ligne : x vaut 0

  while (true) {
    image();          // la lettre reste en colonne 0
  }
}
`,
    aVoir: 'Un A qui avance de 5 cases vers la droite, puis revient de 5 cases vers la gauche, et s’arrête.',
    controle: (c) => {
      let aller = ''
      for (let k = 0; k < 150 && !aller; k++) {
        c.avancer(1)
        if (c.variable('x') === 5) aller = c.mot(0, 0, 20)
      }
      c.avancer(180)
      const retour = c.mot(0, 0, 20)
      return [
        ['à l’aller, le A arrive en colonne 5', aller === '     A              ', ` (« ${aller} »)`],
        ['au retour, le A revient en colonne 0', retour.trimEnd() === 'A', ` (« ${retour} »)`],
        ['x vaut la colonne rendue', c.variable('x') === 0, ` (x = ${c.variable('x')})`],
      ]
    },
  },

  {
    titre: 'Revenir : un pas négatif — de base, ailleurs',
    difficulte: 0,
    suite: true,
    idee: 'Le 0.19 sur la ligne 8, avec le B : aller et retour.',
    texte: [
      '**C’est le 0.19**, avec une autre lettre, le **B** (`ALPHABET[1]`, la 2e lettre), et une autre place : la **ligne 8**, dans les deux `deplace_x`.',
      '**C’est la version de base** : une seule lettre, à la deuxième place. Le 0.19.2 met les deux ensemble.',
    ],
    code: `uint8_t pas = 5;
uint8_t x = 0;

int main() {
  x = deplace_x(x, 8, ALPHABET[1], pas);     // l'aller, ligne 8 : x vaut 5
  x = deplace_x(x, 8, ALPHABET[1], -pas);    // le retour : x vaut 0

  while (true) {
    image();
  }
}
`,
    aVoir: 'Un B qui va et revient sur la ligne 8.',
    controle: (c) => {
      const { B } = suivre(c, 'B', 250, 18)
      return [
        ['le B passe par (5, 8)', B.includes('5,8')],
        ['le B finit en (0, 8)', B.at(-1) === '0,8', ` (${B.at(-1)})`],
      ]
    },
  },

  {
    titre: 'Revenir : un pas négatif — doublé, deux positions',
    difficulte: 0,
    suite: true,
    idee: 'L’aller-retour du A (ligne 0), puis celui du B (ligne 8), chacun avec sa variable.',
    texte: [
      '**C’est le 0.19 et le 0.19.1 réunis** : les deux allers-retours, chacun avec sa variable (`x`, `xb`).',
    ],
    code: `uint8_t pas = 5;
uint8_t x = 0;        // le A
uint8_t xb = 0;       // le B

int main() {
  x = deplace_x(x, 0, ALPHABET[0], pas);       // le A : aller…
  x = deplace_x(x, 0, ALPHABET[0], -pas);      // …et retour (le 0.19)
  xb = deplace_x(xb, 8, ALPHABET[1], pas);     // le B : aller…
  xb = deplace_x(xb, 8, ALPHABET[1], -pas);    // …et retour (le 0.19.1)

  while (true) {
    image();
  }
}
`,
    aVoir: 'Le A va et revient sur la ligne 0, puis le B sur la ligne 8.',
    controle: (c) => {
      const { A, B } = suivre(c, 'AB', 450, 18)
      return [
        ['le A passe par (5, 0)', A.includes('5,0')],
        ['le A finit en (0, 0)', A.at(-1) === '0,0', ` (${A.at(-1)})`],
        ['le B passe par (5, 8)', B.includes('5,8')],
        ['le B finit en (0, 8)', B.at(-1) === '0,8', ` (${B.at(-1)})`],
      ]
    },
  },

  {
    titre: 'Voir x à l’écran : nombre',
    difficulte: 0,
    idee: 'Le 0.19, plus nombre(0, 2, x) après chaque trajet : on VOIT la valeur de x changer, 005 puis 000.',
    texte: [
      '**C’est le 0.19, plus deux lignes identiques :** `nombre(0, 2, x);` après chaque trajet.',
      '**Ce qui est nouveau ici :** `nombre(colonne, ligne, valeur)`. Elle **écrit un nombre** à l’écran, à la case (`colonne`, `ligne`), en **trois chiffres** : 5 s’écrit `005`, 0 s’écrit `000`.',
      '**À quoi ça sert :** une variable ne se voit pas. `x` change dans la mémoire de la console, mais rien ne le montre. En l’écrivant à l’écran, on **voit** ce que vaut `x` : `005` après l’aller, `000` après le retour.',
      '**Pourquoi la ligne 2 :** la lettre bouge sur la ligne 0 ; le nombre, deux lignes plus bas, ne la gêne pas.',
    ],
    code: `uint8_t pas = 5;      // +5 : avance ; -5 : recule
uint8_t x = 0;        // la colonne de la lettre

int main() {
  x = deplace_x(x, 0, ALPHABET[0], pas);    // l'aller : x vaut 5

  // La ligne ajoutée :
  //
  //   nombre(0, 2, x);
  //          |  |  |
  //          |  |  +-- valeur  : ce qu'on écrit, la valeur de x
  //          |  +----- ligne   : 2, sous la lettre (qui est en ligne 0)
  //          +-------- colonne : 0, tout à gauche
  //
  // Le nombre s'écrit en 3 chiffres : 5 → « 005 ».
  nombre(0, 2, x);                          // on VOIT x : 005

  x = deplace_x(x, 0, ALPHABET[0], -pas);   // le retour : x vaut 0
  nombre(0, 2, x);                          // on VOIT x : 000

  while (true) {
    image();
  }
}
`,
    aVoir: 'Le A avance de 5 cases ; en dessous s’écrit 005. Il revient ; le nombre devient 000.',
    controle: (c) => {
      let vu5 = false
      for (let k = 0; k < 300; k++) {
        c.avancer(1)
        if (c.mot(0, 2, 3) === '005') vu5 = true
      }
      return [
        ['après l’aller, l’écran montre 005', vu5],
        ['après le retour, 000', c.mot(0, 2, 3) === '000', ` (« ${c.mot(0, 2, 3)} »)`],
        ['le A est revenu en colonne 0', c.mot(0, 0, 20).trimEnd() === 'A'],
      ]
    },
  },

  {
    titre: 'Voir x à l’écran : nombre — de base, ailleurs',
    difficulte: 0,
    suite: true,
    idee: 'Le 0.20 sur la ligne 8, avec le B ; son x s’affiche en ligne 10.',
    texte: [
      '**C’est le 0.20**, avec une autre lettre, le **B** (`ALPHABET[1]`, la 2e lettre), et une autre place : la **ligne 8** pour la lettre, et la **ligne 10** pour le nombre, juste en dessous.',
      '**C’est la version de base** : une seule lettre, à la deuxième place. Le 0.20.2 met les deux ensemble.',
    ],
    code: `uint8_t pas = 5;
uint8_t x = 0;

int main() {
  x = deplace_x(x, 8, ALPHABET[1], pas);     // le B, ligne 8
  nombre(0, 10, x);                          // son x, deux lignes plus bas : 005
  x = deplace_x(x, 8, ALPHABET[1], -pas);
  nombre(0, 10, x);                          // 000

  while (true) {
    image();
  }
}
`,
    aVoir: 'Le B va et revient sur la ligne 8 ; en dessous, 005 puis 000.',
    controle: (c) => {
      let vu5 = false
      for (let k = 0; k < 300; k++) { c.avancer(1); if (c.mot(0, 10, 3) === '005') vu5 = true }
      return [['005 s’est affiché en ligne 10', vu5], ['puis 000', c.mot(0, 10, 3) === '000']]
    },
  },

  {
    titre: 'Voir x à l’écran : nombre — doublé, deux positions',
    difficulte: 0,
    suite: true,
    idee: 'Les deux, chacun avec son nombre : x en ligne 2, xb en ligne 10.',
    texte: [
      '**C’est le 0.20 et le 0.20.1 réunis** : les deux lettres et leurs deux nombres.',
      '**Deux variables, deux nombres :** `x` s’affiche sous le A (ligne 2), `xb` sous le B (ligne 10).',
    ],
    code: `uint8_t pas = 5;
uint8_t x = 0;        // le A
uint8_t xb = 0;       // le B

int main() {
  x = deplace_x(x, 0, ALPHABET[0], pas);
  nombre(0, 2, x);                            // 005 sous le A
  x = deplace_x(x, 0, ALPHABET[0], -pas);
  nombre(0, 2, x);                            // 000
  xb = deplace_x(xb, 8, ALPHABET[1], pas);
  nombre(0, 10, xb);                          // 005 sous le B
  xb = deplace_x(xb, 8, ALPHABET[1], -pas);
  nombre(0, 10, xb);                          // 000

  while (true) {
    image();
  }
}
`,
    aVoir: 'Le A puis le B vont et reviennent ; sous chacun, son nombre passe à 005 puis 000.',
    controle: (c) => {
      let a5 = false, b5 = false
      for (let k = 0; k < 500; k++) { c.avancer(1); if (c.mot(0, 2, 3) === '005') a5 = true; if (c.mot(0, 10, 3) === '005') b5 = true }
      return [['005 sous le A', a5], ['005 sous le B', b5], ['puis 000 et 000', c.mot(0, 2, 3) === '000' && c.mot(0, 10, 3) === '000']]
    },
  },

  {
    titre: 'Descendre avec deplace_y',
    difficulte: 0,
    idee: 'deplace_y(colonne, ligne, tuile, pas) : comme deplace_x, mais sur l’axe Y. La lettre descend de 5 lignes.',
    texte: [
      '**C’est le 0.18, mais à la verticale.** L’écran a deux axes : **X**, l’horizontal (les colonnes, de 0 à gauche jusqu’à 19 à droite), et **Y**, le vertical (les lignes, de 0 en haut jusqu’à 17 en bas).',
      '**Ce qui est nouveau ici :** `deplace_y(colonne, ligne, tuile, pas)`. Les mêmes renseignements que `deplace_x`, dans le même ordre, mais c’est la **ligne** qui change : la lettre descend d’une ligne tous les quarts de seconde, **`pas` fois**. Un pas positif **descend**, car les numéros de ligne grandissent vers le bas.',
      '**Elle rend la nouvelle ligne**, d’où `y = deplace_y(…)`, pour la même raison qu’au 0.18 : la fonction n’a qu’une **copie** de `y`.',
      '**Au bord** (ligne 17), elle s’arrête au lieu de sortir de l’écran.',
    ],
    code: `uint8_t pas = 5;      // le nombre de lignes à parcourir
uint8_t y = 0;        // la LIGNE de la lettre : elle part de 0 (tout en haut)

int main() {
  // La ligne, morceau par morceau :
  //
  //   y = deplace_y(0, y, ALPHABET[0], pas);
  //   |   |         |  |  |            |
  //   |   |         |  |  |            +-- pas     : combien de lignes (5, vers le bas)
  //   |   |         |  |  +--------------- tuile   : la lettre A
  //   |   |         |  +------------------ ligne   : d'où elle part — une COPIE de y
  //   |   |         +--------------------- colonne : 0, tout à gauche (elle ne change pas)
  //   |   +--- deplace_y fait descendre la lettre, puis REND la ligne d'arrivée : 5
  //   +------- « y = » range ce 5 dans y
  y = deplace_y(0, y, ALPHABET[0], pas);    // après cette ligne : y vaut 5

  while (true) {
    image();          // la lettre reste en ligne 5
  }
}
`,
    aVoir: 'Un A qui descend de 5 lignes, puis s’arrête en ligne 5.',
    controle: (c) => {
      c.avancer(150)
      const colonne = Array.from({ length: 18 }, (_, l) => c.mot(0, l, 1)).join('')
      return [
        ['y a reçu la ligne d’arrivée', c.variable('y') === 5, ` (y = ${c.variable('y')})`],
        ['le A est en ligne 5, seul dans sa colonne', colonne === '     A            ', ` (« ${colonne} »)`],
      ]
    },
  },

  {
    titre: 'Descendre avec deplace_y — de base, ailleurs',
    difficulte: 0,
    suite: true,
    idee: 'Le 0.21 en colonne 10, avec le B.',
    texte: [
      '**C’est le 0.21**, avec une autre lettre, le **B** (`ALPHABET[1]`, la 2e lettre), et une autre place : la **colonne 10** au lieu de 0 (1er réglage de `deplace_y`).',
      '**C’est la version de base** : une seule lettre, à la deuxième place. Le 0.21.2 met les deux ensemble.',
    ],
    code: `uint8_t pas = 5;
uint8_t y = 0;

int main() {
  y = deplace_y(10, y, ALPHABET[1], pas);    // le B descend en colonne 10 : y vaut 5

  while (true) {
    image();
  }
}
`,
    aVoir: 'Un B qui descend de 5 lignes, en colonne 10.',
    controle: (c) => {
      const { B } = suivre(c, 'B', 150, 18)
      return [
        ['le B finit en (10, 5)', B.at(-1) === '10,5', ` (${B.at(-1)})`],
      ]
    },
  },

  {
    titre: 'Descendre avec deplace_y — doublé, deux positions',
    difficulte: 0,
    suite: true,
    idee: 'Le A descend en colonne 0 (y), puis le B en colonne 10 (yb).',
    texte: [
      '**C’est le 0.21 et le 0.21.1 réunis** : deux `deplace_y`, chacun avec sa variable (`y`, `yb`).',
    ],
    code: `uint8_t pas = 5;
uint8_t y = 0;        // le A
uint8_t yb = 0;       // le B

int main() {
  y = deplace_y(0, y, ALPHABET[0], pas);       // le A, colonne 0
  yb = deplace_y(10, yb, ALPHABET[1], pas);    // puis le B, colonne 10

  while (true) {
    image();
  }
}
`,
    aVoir: 'Le A descend en colonne 0, puis le B en colonne 10.',
    controle: (c) => {
      const { A, B } = suivre(c, 'AB', 250, 18)
      return [
        ['le A finit en (0, 5)', A.at(-1) === '0,5', ` (${A.at(-1)})`],
        ['le B finit en (10, 5)', B.at(-1) === '10,5', ` (${B.at(-1)})`],
      ]
    },
  },

  {
    titre: 'Remonter : deplace_y et un pas négatif',
    difficulte: 0,
    idee: 'Le 0.21, plus une ligne : -pas fait remonter la lettre. Et pourquoi deux fonctions, une par axe.',
    texte: [
      '**C’est le 0.21, plus une ligne :** la montée.',
      '**Ce qui est nouveau ici :** le pas négatif **sur Y**. `-pas` fait **monter** : les numéros de ligne diminuent vers le haut. Comme au 0.19, `-5` est rangé 251, et `deplace_y` lit tout ce qui dépasse 127 comme une montée.',
      '**La montée part de `y`**, qui vaut 5 grâce au `y =`. Elle rend 0, et `y =` le range.',
      '**Pourquoi deux fonctions, et pas une seule pour X et Y ?** Une fonction ne peut rendre qu’**une seule valeur**. `deplace_x` rend la colonne, `deplace_y` rend la ligne : chacune dit exactement où la lettre s’est arrêtée.',
    ],
    code: `uint8_t pas = 5;      // +5 : descend ; -5 : monte
uint8_t y = 0;        // la LIGNE de la lettre

int main() {
  y = deplace_y(0, y, ALPHABET[0], pas);    // la descente (le 0.21) : y vaut 5

  // La ligne ajoutée : le même appel avec -pas, donc vers le HAUT.
  // Elle part de y (5) et rend 0 ; « y = » range ce 0 dans y.
  y = deplace_y(0, y, ALPHABET[0], -pas);   // après cette ligne : y vaut 0

  while (true) {
    image();          // la lettre est revenue tout en haut
  }
}
`,
    aVoir: 'Un A qui descend de 5 lignes, puis remonte de 5 lignes, et s’arrête tout en haut.',
    controle: (c) => {
      const colonne = () => Array.from({ length: 18 }, (_, l) => c.mot(0, l, 1)).join('')
      let descente = ''
      for (let k = 0; k < 150 && !descente; k++) {
        c.avancer(1)
        if (c.variable('y') === 5) descente = colonne()
      }
      c.avancer(180)
      const montee = colonne()
      return [
        ['à la descente, le A arrive en ligne 5', descente === '     A            ', ` (« ${descente} »)`],
        ['à la montée, le A revient en ligne 0', montee.trimEnd() === 'A', ` (« ${montee} »)`],
        ['y vaut la ligne rendue', c.variable('y') === 0, ` (y = ${c.variable('y')})`],
      ]
    },
  },

  {
    titre: 'Remonter : deplace_y et un pas négatif — de base, ailleurs',
    difficulte: 0,
    suite: true,
    idee: 'Le 0.22 en colonne 10, avec le B : descente et montée.',
    texte: [
      '**C’est le 0.22**, avec une autre lettre, le **B** (`ALPHABET[1]`, la 2e lettre), et une autre place : la **colonne 10**, dans les deux `deplace_y`.',
      '**C’est la version de base** : une seule lettre, à la deuxième place. Le 0.22.2 met les deux ensemble.',
    ],
    code: `uint8_t pas = 5;
uint8_t y = 0;

int main() {
  y = deplace_y(10, y, ALPHABET[1], pas);     // descente : y vaut 5
  y = deplace_y(10, y, ALPHABET[1], -pas);    // montée : y vaut 0

  while (true) {
    image();
  }
}
`,
    aVoir: 'Un B qui descend puis remonte, en colonne 10.',
    controle: (c) => {
      const { B } = suivre(c, 'B', 250, 18)
      return [
        ['le B passe par (10, 5)', B.includes('10,5')],
        ['le B finit en (10, 0)', B.at(-1) === '10,0', ` (${B.at(-1)})`],
      ]
    },
  },

  {
    titre: 'Remonter : deplace_y et un pas négatif — doublé, deux positions',
    difficulte: 0,
    suite: true,
    idee: 'La descente et la montée du A (colonne 0), puis celles du B (colonne 10).',
    texte: [
      '**C’est le 0.22 et le 0.22.1 réunis** : les deux descentes-montées, chacune avec sa variable.',
    ],
    code: `uint8_t pas = 5;
uint8_t y = 0;        // le A
uint8_t yb = 0;       // le B

int main() {
  y = deplace_y(0, y, ALPHABET[0], pas);
  y = deplace_y(0, y, ALPHABET[0], -pas);       // le A (le 0.22)
  yb = deplace_y(10, yb, ALPHABET[1], pas);
  yb = deplace_y(10, yb, ALPHABET[1], -pas);    // le B (le 0.22.1)

  while (true) {
    image();
  }
}
`,
    aVoir: 'Le A descend et remonte en colonne 0, puis le B en colonne 10.',
    controle: (c) => {
      const { A, B } = suivre(c, 'AB', 450, 18)
      return [
        ['le A passe par (0, 5)', A.includes('0,5')],
        ['le A finit en (0, 0)', A.at(-1) === '0,0', ` (${A.at(-1)})`],
        ['le B passe par (10, 5)', B.includes('10,5')],
        ['le B finit en (10, 0)', B.at(-1) === '10,0', ` (${B.at(-1)})`],
      ]
    },
  },

  {
    titre: 'Sans « x = » : la console range la position',
    difficulte: 0,
    idee: 'Le 0.20 sans les « x = » : deplace_x(x, …); seul sur sa ligne, et x change quand même. Les nombres le montrent.',
    texte: [
      '**C’est le 0.20, avec un seul changement :** les deux `x =` ont disparu.',
      '**Ce qui est nouveau ici :** quand l’appel est **seul sur sa ligne** et que la position donnée est une **variable** (`x`), la console **range elle-même** la position d’arrivée dans cette variable. Le compilateur réécrit la ligne en `x = deplace_x(x, …);` : c’est exactement le 0.20, la même cartouche, octet pour octet.',
      '**La preuve :** les nombres affichent toujours `005` puis `000`. Personne n’a écrit `x =`, et pourtant `x` a changé.',
      '**C’est une exception, réservée à la console.** La règle du C ne change pas : une fonction reçoit une copie. Seules les fonctions de la console (`deplace_x`, `deplace_y`, et celles qui viendront) ont droit à ce rangement. Pour **tes** fonctions, il faut toujours `x =` (le 0.33 le montre).',
      '**Une condition :** la position doit être une **variable**. `deplace_x(3, 0, ALPHABET[0], 5);` fait bouger la lettre, mais il n’y a nulle part où ranger la colonne.',
    ],
    code: `uint8_t pas = 5;      // +5 : avance ; -5 : recule
uint8_t x = 0;        // la colonne de la lettre

int main() {
  // Le changement : plus de « x = » devant deplace_x.
  //
  //   deplace_x(x, 0, ALPHABET[0], pas);
  //             |
  //             +-- x est une VARIABLE : la console y range toute seule la
  //                 colonne d'arrivée. Le compilateur réécrit la ligne en
  //                     x = deplace_x(x, 0, ALPHABET[0], pas);
  //                 C'est le 0.20, écrit plus court.
  deplace_x(x, 0, ALPHABET[0], pas);    // x vaut 5 quand même…
  nombre(0, 2, x);                      // …la preuve : 005

  deplace_x(x, 0, ALPHABET[0], -pas);   // x vaut 0
  nombre(0, 2, x);                      // 000

  while (true) {
    image();
  }
}
`,
    aVoir: 'Exactement le 0.20 : le A avance, 005 s’écrit ; il revient, 000 s’écrit.',
    controle: (c) => {
      let vu5 = false
      for (let k = 0; k < 300; k++) {
        c.avancer(1)
        if (c.mot(0, 2, 3) === '005') vu5 = true
      }
      return [
        ['sans « x = », x a reçu 5 : 005 affiché', vu5],
        ['puis 0 : 000 affiché', c.mot(0, 2, 3) === '000' && c.variable('x') === 0, ` (x = ${c.variable('x')})`],
        ['le A est revenu en colonne 0', c.mot(0, 0, 20).trimEnd() === 'A'],
      ]
    },
  },

  {
    titre: 'Sans « x = » : la console range la position — de base, ailleurs',
    difficulte: 0,
    suite: true,
    idee: 'Le 0.23 sur la ligne 8, avec le B : toujours sans « x = ».',
    texte: [
      '**C’est le 0.23**, avec une autre lettre, le **B** (`ALPHABET[1]`, la 2e lettre), et une autre place : la **ligne 8** pour la lettre, la **ligne 10** pour le nombre.',
      '**C’est la version de base** : une seule lettre, à la deuxième place. Le 0.23.2 met les deux ensemble.',
    ],
    code: `uint8_t pas = 5;
uint8_t x = 0;

int main() {
  deplace_x(x, 8, ALPHABET[1], pas);     // sans « x = » : x vaut 5 quand même
  nombre(0, 10, x);                      // 005
  deplace_x(x, 8, ALPHABET[1], -pas);    // x vaut 0
  nombre(0, 10, x);                      // 000

  while (true) {
    image();
  }
}
`,
    aVoir: 'Le B va et revient sur la ligne 8 ; 005 puis 000 en dessous.',
    controle: (c) => {
      let vu5 = false
      for (let k = 0; k < 300; k++) { c.avancer(1); if (c.mot(0, 10, 3) === '005') vu5 = true }
      return [['sans « x = », x a reçu 5', vu5], ['puis 0', c.variable('x') === 0]]
    },
  },

  {
    titre: 'Sans « x = » : la console range la position — doublé, deux positions',
    difficulte: 0,
    suite: true,
    idee: 'Les deux, sans « = » : la console range x pour le A et xb pour le B.',
    texte: [
      '**C’est le 0.23 et le 0.23.1 réunis** : les deux lettres, sans aucun `=`.',
      '**La console range chaque position dans SA variable** : celle qu’on donne en premier à `deplace_x`, `x` pour le A, `xb` pour le B.',
    ],
    code: `uint8_t pas = 5;
uint8_t x = 0;        // le A
uint8_t xb = 0;       // le B

int main() {
  deplace_x(x, 0, ALPHABET[0], pas);      // x vaut 5
  deplace_x(xb, 8, ALPHABET[1], pas);     // xb vaut 5
  nombre(0, 2, x);
  nombre(0, 10, xb);

  while (true) {
    image();
  }
}
`,
    aVoir: 'Le A puis le B avancent de 5 cases ; sous chacun, 005.',
    controle: (c) => {
      const { A, B } = suivre(c, 'AB', 250, 18)
      return [
        ['le A finit en (5, 0)', A.at(-1) === '5,0', ` (${A.at(-1)})`],
        ['le B finit en (5, 8)', B.at(-1) === '5,8', ` (${B.at(-1)})`],
        ['005 et 005', c.mot(0, 2, 3) === '005' && c.mot(0, 10, 3) === '005'],
      ]
    },
  },

  {
    titre: 'Les deux axes à la suite',
    difficulte: 0,
    idee: 'deplace_x puis deplace_y, sans « = » : la lettre va à droite, puis descend depuis la colonne où elle est arrivée.',
    texte: [
      '**On garde la forme courte du 0.23**, et on utilise **les deux axes** : d’abord `deplace_x`, puis `deplace_y`.',
      '**Ce qui est nouveau ici :** deux variables, `x` **et** `y`, et chaque fonction reçoit **les deux**. `deplace_x(x, y, …)` avance sur la ligne `y` ; `deplace_y(x, y, …)` descend dans la colonne `x`.',
      '**C’est pour cela qu’il faut garder `x` à jour :** `deplace_y` part de la colonne `x`, celle où `deplace_x` a laissé la lettre (5). Si `x` était resté à 0, la descente partirait de la colonne 0, et la lettre sauterait d’un coup.',
      '**Les nombres**, en bas de l’écran (ligne 17) : `x` en colonne 0, `y` en colonne 4.',
    ],
    code: `uint8_t pas = 5;      // 5 cases, sur chaque axe
uint8_t x = 0;        // la COLONNE de la lettre (axe X)
uint8_t y = 0;        // la LIGNE de la lettre (axe Y)

int main() {
  // 1. À droite : deplace_x reçoit x ET y — elle avance sur la ligne y (0).
  deplace_x(x, y, ALPHABET[0], pas);    // x vaut 5
  nombre(0, 17, x);                     // en bas à gauche : 005

  // 2. En bas : deplace_y part de la colonne x — 5, là où la lettre est.
  //
  //   deplace_y(x, y, ALPHABET[0], pas);
  //             |  |
  //             |  +-- y : la ligne de départ (0) ; la console y range l'arrivée (5)
  //             +----- x : la colonne, 5 grâce à la ligne d'avant
  deplace_y(x, y, ALPHABET[0], pas);    // y vaut 5
  nombre(4, 17, y);                     // à côté : 005

  while (true) {
    image();          // la lettre est en (5, 5)
  }
}
`,
    aVoir: 'Un A qui va de 5 cases à droite, puis descend de 5 lignes. En bas, 005 et 005.',
    controle: (c) => {
      const { A } = suivre(c, 'A', 300, 17)
      return [
        ['à droite d’abord, jusqu’en (5, 0)', A.includes('5,0')],
        ['puis en bas depuis la colonne 5 : (5, 3)', A.includes('5,3') && !A.includes('0,3')],
        ['x et y valent 5', c.variable('x') === 5 && c.variable('y') === 5],
        ['005 et 005 affichés', c.mot(0, 17, 3) === '005' && c.mot(4, 17, 3) === '005', ` (« ${c.mot(0, 17, 7)} »)`],
      ]
    },
  },

  {
    titre: 'Les deux axes à la suite — de base, ailleurs',
    difficulte: 0,
    suite: true,
    idee: 'Le 0.24 à partir de (10, 0), avec le B.',
    texte: [
      '**C’est le 0.24**, avec une autre lettre, le **B** (`ALPHABET[1]`, la 2e lettre), et une autre place : le **départ (10, 0)** au lieu de (0, 0) : x part de 10.',
      '**La lettre va à droite jusqu’en (15, 0), puis descend jusqu’en (15, 5).**',
      '**C’est la version de base** : une seule lettre, à la deuxième place. Le 0.24.2 met les deux ensemble.',
    ],
    code: `uint8_t pas = 5;
uint8_t x = 10;       // la colonne du B
uint8_t y = 0;       // sa ligne

int main() {
  deplace_x(x, y, ALPHABET[1], pas);
  deplace_y(x, y, ALPHABET[1], pas);

  while (true) {
    image();
  }
}
`,
    aVoir: 'Un B qui va de (10, 0) à droite, puis descend.',
    controle: (c) => {
      const { B } = suivre(c, 'B', 250, 18)
      return [
        ['le B passe par (15, 0)', B.includes('15,0')],
        ['le B finit en (15, 5)', B.at(-1) === '15,5', ` (${B.at(-1)})`],
      ]
    },
  },

  {
    titre: 'Les deux axes à la suite — doublé, deux positions',
    difficulte: 0,
    suite: true,
    idee: 'Le A part de (0, 0), le B de (10, 0) : chacun ses deux variables.',
    texte: [
      '**C’est le 0.24 et le 0.24.1 réunis** : le A (x, y) puis le B (xb, yb).',
      '**Deux lettres, quatre variables :** chaque lettre a sa colonne et sa ligne.',
    ],
    code: `uint8_t pas = 5;
uint8_t x = 0;       // la colonne du A
uint8_t y = 0;       // sa ligne
uint8_t xb = 10;       // la colonne du B
uint8_t yb = 0;       // sa ligne

int main() {
  deplace_x(x, y, ALPHABET[0], pas);
  deplace_y(x, y, ALPHABET[0], pas);
  deplace_x(xb, yb, ALPHABET[1], pas);
  deplace_y(xb, yb, ALPHABET[1], pas);

  while (true) {
    image();
  }
}
`,
    aVoir: 'Le A fait son L à gauche, puis le B à droite.',
    controle: (c) => {
      const { A, B } = suivre(c, 'AB', 400, 18)
      return [
        ['le A finit en (5, 5)', A.at(-1) === '5,5', ` (${A.at(-1)})`],
        ['le B finit en (15, 5)', B.at(-1) === '15,5', ` (${B.at(-1)})`],
      ]
    },
  },

  {
    titre: 'Le carré, côté par côté',
    difficulte: 0,
    idee: 'Le 0.24, plus deux côtés : à gauche, puis en haut. La lettre fait un carré et revient à (0, 0).',
    texte: [
      '**C’est le 0.24, plus deux lignes** (et leurs nombres) : les deux côtés du retour.',
      '**Ce qui est nouveau ici :** rien de plus que des pas **négatifs** sur les deux axes : `-pas` sur X ramène à gauche, `-pas` sur Y ramène en haut. Quatre côtés : **un carré**.',
      '**Chaque côté part de là où le précédent s’est arrêté**, parce que `x` et `y` sont tenus à jour par la console.',
    ],
    code: `uint8_t pas = 5;      // 5 cases, sur chaque axe
uint8_t x = 0;        // la COLONNE de la lettre
uint8_t y = 0;        // la LIGNE de la lettre

int main() {
  deplace_x(x, y, ALPHABET[0], pas);    // 1. à droite : x vaut 5
  nombre(0, 17, x);
  deplace_y(x, y, ALPHABET[0], pas);    // 2. en bas   : y vaut 5
  nombre(4, 17, y);

  // Les deux lignes ajoutées : les mêmes, avec -pas.
  deplace_x(x, y, ALPHABET[0], -pas);   // 3. à gauche : x revient à 0
  nombre(0, 17, x);
  deplace_y(x, y, ALPHABET[0], -pas);   // 4. en haut  : y revient à 0
  nombre(4, 17, y);

  //   (0,0) → → → → → (5,0)
  //     ↑               ↓          le carré : 1 à droite, 2 en bas,
  //     ↑               ↓                     3 à gauche, 4 en haut
  //   (0,5) ← ← ← ← ← (5,5)

  while (true) {
    image();          // la lettre est revenue en (0, 0)
  }
}
`,
    aVoir: 'Un A qui fait un carré : 5 cases à droite, 5 en bas, 5 à gauche, 5 en haut. En bas, les nombres changent après chaque côté.',
    controle: (c) => {
      const { A } = suivre(c, 'A', 450, 17)
      const coins = A.filter((p) => ['5,0', '5,5', '0,5', '0,0'].includes(p))
      return [
        ['les coins dans l’ordre : (5, 0), (5, 5), (0, 5), (0, 0)', coins.slice(-4).join(' ') === '5,0 5,5 0,5 0,0', ` (${coins.join(' ')})`],
        ['x et y valent 0', c.variable('x') === 0 && c.variable('y') === 0],
        ['000 et 000 affichés', c.mot(0, 17, 3) === '000' && c.mot(4, 17, 3) === '000'],
      ]
    },
  },

  {
    titre: 'Le carré, côté par côté — de base, ailleurs',
    difficulte: 0,
    suite: true,
    idee: 'Le carré du 0.25 à partir de (10, 0), avec le B.',
    texte: [
      '**C’est le 0.25**, avec une autre lettre, le **B** (`ALPHABET[1]`, la 2e lettre), et une autre place : le **départ (10, 0)** : le carré va de la colonne 10 à 15.',
      '**C’est la version de base** : une seule lettre, à la deuxième place. Le 0.25.2 met les deux ensemble.',
    ],
    code: `uint8_t pas = 5;
uint8_t x = 10;       // la colonne du B
uint8_t y = 0;       // sa ligne

int main() {
  deplace_x(x, y, ALPHABET[1], pas);
  deplace_y(x, y, ALPHABET[1], pas);
  deplace_x(x, y, ALPHABET[1], -pas);
  deplace_y(x, y, ALPHABET[1], -pas);

  while (true) {
    image();
  }
}
`,
    aVoir: 'Un B qui fait un carré à partir de (10, 0).',
    controle: (c) => {
      const { B } = suivre(c, 'B', 450, 18)
      return [
        ['le B passe par (15, 5)', B.includes('15,5')],
        ['le B finit en (10, 0)', B.at(-1) === '10,0', ` (${B.at(-1)})`],
      ]
    },
  },

  {
    titre: 'Le carré, côté par côté — doublé, deux positions',
    difficulte: 0,
    suite: true,
    idee: 'Les deux carrés : le A à gauche, puis le B à droite.',
    texte: [
      '**C’est le 0.25 et le 0.25.1 réunis** : le carré du A, puis celui du B.',
    ],
    code: `uint8_t pas = 5;
uint8_t x = 0;       // la colonne du A
uint8_t y = 0;       // sa ligne
uint8_t xb = 10;       // la colonne du B
uint8_t yb = 0;       // sa ligne

int main() {
  deplace_x(x, y, ALPHABET[0], pas);
  deplace_y(x, y, ALPHABET[0], pas);
  deplace_x(x, y, ALPHABET[0], -pas);
  deplace_y(x, y, ALPHABET[0], -pas);
  deplace_x(xb, yb, ALPHABET[1], pas);
  deplace_y(xb, yb, ALPHABET[1], pas);
  deplace_x(xb, yb, ALPHABET[1], -pas);
  deplace_y(xb, yb, ALPHABET[1], -pas);

  while (true) {
    image();
  }
}
`,
    aVoir: 'Le A fait son carré à gauche, puis le B à droite.',
    controle: (c) => {
      const { A, B } = suivre(c, 'AB', 800, 18)
      return [
        ['le A passe par (5, 5)', A.includes('5,5')],
        ['le A finit en (0, 0)', A.at(-1) === '0,0', ` (${A.at(-1)})`],
        ['le B passe par (15, 5)', B.includes('15,5')],
        ['le B finit en (10, 0)', B.at(-1) === '10,0', ` (${B.at(-1)})`],
      ]
    },
  },

  {
    titre: 'En diagonale : deplace',
    difficulte: 0,
    idee: 'deplace(x, y, tuile, pasX, pasY) : les deux axes en une ligne. Avec 5 et 5, la lettre descend en biais.',
    texte: [
      '**Une seule ligne pour les deux axes :** `deplace`.',
      '**Ce qui est nouveau ici :** `deplace(colonne, ligne, tuile, pasX, pasY)`. Elle a **deux** nombres de pas : `pasX` pour l’horizontale (+ droite, - gauche) et `pasY` pour la verticale (+ bas, - haut).',
      '**La diagonale :** avec `5` et `5`, la lettre fait à chaque quart de seconde un pas sur X **et** un pas sur Y **en même temps** : elle descend en biais, (1, 1), (2, 2)… jusqu’à (5, 5). C’est impossible avec `deplace_x` puis `deplace_y`, qui font un axe après l’autre.',
      '**Deux positions à ranger :** une fonction ne rend qu’une valeur. `deplace` rend la colonne, et dépose la ligne dans une variable de la console. **Seule sur sa ligne**, la console range les deux : `x` **et** `y`. Écris-la toujours ainsi : `x = deplace(…)` ne rangerait que `x`.',
    ],
    code: `uint8_t x = 0;        // la COLONNE de la lettre
uint8_t y = 0;        // la LIGNE de la lettre

int main() {
  // La ligne, morceau par morceau :
  //
  //   deplace(x, y, ALPHABET[0], 5, 5);
  //           |  |  |            |  |
  //           |  |  |            |  +-- pasY : +5, vers le bas
  //           |  |  |            +----- pasX : +5, vers la droite
  //           |  |  +------------------ tuile : la lettre A
  //           +--+--------------------- x, y : d'où elle part ; la console y
  //                                     range l'arrivée : x = 5, y = 5
  //
  //   A                 (0, 0)
  //     ↘
  //       ↘             à chaque pas : +1 sur X ET +1 sur Y
  //         ↘
  //           ↘
  //             A       (5, 5)
  deplace(x, y, ALPHABET[0], 5, 5);
  nombre(0, 17, x);     // 005
  nombre(4, 17, y);     // 005

  while (true) {
    image();
  }
}
`,
    aVoir: 'Un A qui descend en diagonale, du coin en haut à gauche jusqu’en (5, 5). En bas, 005 et 005.',
    controle: (c) => {
      const { A } = suivre(c, 'A', 200, 17)
      return [
        ['en biais : (1, 1), (2, 2), (3, 3), (4, 4)', ['1,1', '2,2', '3,3', '4,4'].every((p) => A.includes(p))],
        ['jamais tout droit : ni (3, 0), ni (0, 3)', !A.includes('3,0') && !A.includes('0,3')],
        ['x et y rangés tout seuls : 5 et 5', c.variable('x') === 5 && c.variable('y') === 5],
        ['le A est en (5, 5)', A.at(-1) === '5,5', ` (${A.at(-1)})`],
      ]
    },
  },

  {
    titre: 'En diagonale : deplace — de base, ailleurs',
    difficulte: 0,
    suite: true,
    idee: 'La diagonale du 0.26 à partir de (10, 0), avec le B.',
    texte: [
      '**C’est le 0.26**, avec une autre lettre, le **B** (`ALPHABET[1]`, la 2e lettre), et une autre place : le **départ (10, 0)** : la diagonale finit en (15, 5).',
      '**C’est la version de base** : une seule lettre, à la deuxième place. Le 0.26.2 met les deux ensemble.',
    ],
    code: `uint8_t x = 10;       // la colonne du B
uint8_t y = 0;       // sa ligne

int main() {
  deplace(x, y, ALPHABET[1], 5, 5);

  while (true) {
    image();
  }
}
`,
    aVoir: 'Un B qui descend en biais de (10, 0) à (15, 5).',
    controle: (c) => {
      const { B } = suivre(c, 'B', 200, 18)
      return [
        ['le B passe par (12, 2)', B.includes('12,2')],
        ['le B finit en (15, 5)', B.at(-1) === '15,5', ` (${B.at(-1)})`],
      ]
    },
  },

  {
    titre: 'En diagonale : deplace — doublé, deux positions',
    difficulte: 0,
    suite: true,
    idee: 'Deux diagonales : le A de (0, 0), puis le B de (10, 0).',
    texte: [
      '**C’est le 0.26 et le 0.26.1 réunis** : deux `deplace`, chacun avec ses variables.',
    ],
    code: `uint8_t x = 0;       // la colonne du A
uint8_t y = 0;       // sa ligne
uint8_t xb = 10;       // la colonne du B
uint8_t yb = 0;       // sa ligne

int main() {
  deplace(x, y, ALPHABET[0], 5, 5);
  deplace(xb, yb, ALPHABET[1], 5, 5);

  while (true) {
    image();
  }
}
`,
    aVoir: 'Le A descend en biais à gauche, puis le B à droite.',
    controle: (c) => {
      const { A, B } = suivre(c, 'AB', 300, 18)
      return [
        ['le A finit en (5, 5)', A.at(-1) === '5,5', ` (${A.at(-1)})`],
        ['le B finit en (15, 5)', B.at(-1) === '15,5', ` (${B.at(-1)})`],
      ]
    },
  },

  {
    titre: 'Le carré avec deplace',
    difficulte: 0,
    idee: 'Le 0.26, plus quatre lignes : avec 0 sur un axe, deplace va tout droit. Un carré à partir de (5, 5).',
    texte: [
      '**C’est le 0.26, plus quatre lignes** : un carré, à partir de là où la diagonale s’est arrêtée.',
      '**Ce qui est nouveau ici :** un **0** comme pas. `deplace(x, y, …, 5, 0)` : 5 sur X, **rien** sur Y, donc tout droit vers la droite. `0, 5` : tout droit vers le bas. Avec un zéro, `deplace` fait ce que faisaient `deplace_x` ou `deplace_y`.',
      '**Le carré** part de (5, 5) : à droite jusqu’en (10, 5), en bas jusqu’en (10, 10), à gauche jusqu’en (5, 10), en haut jusqu’en (5, 5).',
    ],
    code: `uint8_t x = 0;        // la COLONNE de la lettre
uint8_t y = 0;        // la LIGNE de la lettre

int main() {
  deplace(x, y, ALPHABET[0], 5, 5);     // la diagonale (le 0.26) : (5, 5)

  // Les quatre lignes ajoutées. Un 0 : cet axe ne bouge pas.
  //
  //                    pasX  pasY
  deplace(x, y, ALPHABET[0], 5, 0);     // à droite : (10, 5)
  deplace(x, y, ALPHABET[0], 0, 5);     // en bas   : (10, 10)
  deplace(x, y, ALPHABET[0], -5, 0);    // à gauche : (5, 10)
  deplace(x, y, ALPHABET[0], 0, -5);    // en haut  : (5, 5)

  nombre(0, 17, x);     // 005
  nombre(4, 17, y);     // 005

  while (true) {
    image();          // la lettre est revenue en (5, 5)
  }
}
`,
    aVoir: 'Un A qui descend en diagonale jusqu’en (5, 5), puis fait un carré et revient en (5, 5).',
    controle: (c) => {
      const { A } = suivre(c, 'A', 500, 17)
      const coins = A.filter((p) => ['10,5', '10,10', '5,10'].includes(p))
      return [
        ['les coins dans l’ordre : (10, 5), (10, 10), (5, 10)', coins.join(' ') === '10,5 10,10 5,10', ` (${coins.join(' ')})`],
        ['retour en (5, 5), x et y valent 5', A.at(-1) === '5,5' && c.variable('x') === 5 && c.variable('y') === 5],
      ]
    },
  },

  {
    titre: 'Le carré avec deplace — de base, ailleurs',
    difficulte: 0,
    suite: true,
    idee: 'Le 0.27 à partir de (9, 0), avec le B : diagonale puis carré, à droite de l’écran.',
    texte: [
      '**C’est le 0.27**, avec une autre lettre, le **B** (`ALPHABET[1]`, la 2e lettre), et une autre place : le **départ (9, 0)** : la diagonale finit en (14, 5), le carré va jusqu’en (19, 10), le bord droit.',
      '**C’est la version de base** : une seule lettre, à la deuxième place. Le 0.27.2 met les deux ensemble.',
    ],
    code: `uint8_t x = 9;       // la colonne du B
uint8_t y = 0;       // sa ligne

int main() {
  deplace(x, y, ALPHABET[1], 5, 5);
  deplace(x, y, ALPHABET[1], 5, 0);
  deplace(x, y, ALPHABET[1], 0, 5);
  deplace(x, y, ALPHABET[1], -5, 0);
  deplace(x, y, ALPHABET[1], 0, -5);

  while (true) {
    image();
  }
}
`,
    aVoir: 'Un B qui descend en biais puis fait un carré, contre le bord droit.',
    controle: (c) => {
      const { B } = suivre(c, 'B', 500, 18)
      return [
        ['le B passe par (19, 10)', B.includes('19,10')],
        ['le B finit en (14, 5)', B.at(-1) === '14,5', ` (${B.at(-1)})`],
      ]
    },
  },

  {
    titre: 'Le carré avec deplace — doublé, deux positions',
    difficulte: 0,
    suite: true,
    idee: 'Les deux : le A à gauche (départ (0, 0)), puis le B à droite (départ (9, 0)).',
    texte: [
      '**C’est le 0.27 et le 0.27.1 réunis** : les dix lignes du A, puis les dix du B.',
      '**Les deux trajets ne se touchent pas :** le A reste dans les colonnes 0 à 10, le B dans les colonnes 9 à 19, sur d’autres cases.',
    ],
    code: `uint8_t x = 0;       // la colonne du A
uint8_t y = 0;       // sa ligne
uint8_t xb = 9;       // la colonne du B
uint8_t yb = 0;       // sa ligne

int main() {
  deplace(x, y, ALPHABET[0], 5, 5);
  deplace(x, y, ALPHABET[0], 5, 0);
  deplace(x, y, ALPHABET[0], 0, 5);
  deplace(x, y, ALPHABET[0], -5, 0);
  deplace(x, y, ALPHABET[0], 0, -5);
  deplace(xb, yb, ALPHABET[1], 5, 5);
  deplace(xb, yb, ALPHABET[1], 5, 0);
  deplace(xb, yb, ALPHABET[1], 0, 5);
  deplace(xb, yb, ALPHABET[1], -5, 0);
  deplace(xb, yb, ALPHABET[1], 0, -5);

  while (true) {
    image();
  }
}
`,
    aVoir: 'Le A fait sa diagonale et son carré à gauche, puis le B à droite.',
    controle: (c) => {
      const { A, B } = suivre(c, 'AB', 900, 18)
      return [
        ['le A finit en (5, 5)', A.at(-1) === '5,5', ` (${A.at(-1)})`],
        ['le B finit en (14, 5)', B.at(-1) === '14,5', ` (${B.at(-1)})`],
      ]
    },
  },

  {
    titre: 'Aller à une case : va_a',
    difficulte: 0,
    idee: 'va_a(x, y, tuile, colonne, ligne) : on ne compte plus les pas, on dit où aller.',
    texte: [
      '**Jusqu’ici, on comptait les pas.** Pour aller en (10, 5) depuis (3, 2), il faudrait calculer 10 − 3 = 7 et 5 − 2 = 3. `va_a` fait ce calcul pour nous.',
      '**Ce qui est nouveau ici :** `va_a(colonne, ligne, tuile, versColonne, versLigne)`. Les deux derniers nombres ne sont plus des pas, mais **la case d’arrivée**.',
      '**Le chemin :** à chaque quart de seconde, un pas vers la colonne voulue (si elle n’y est pas) **et** un pas vers la ligne voulue (si elle n’y est pas). De (0, 0) à (10, 5) : en **diagonale** jusqu’en (5, 5), où la ligne est bonne, puis **tout droit** jusqu’en (10, 5).',
      '**Les positions sont rangées toutes seules**, comme avec `deplace` : écris-la seule sur sa ligne.',
    ],
    code: `uint8_t x = 0;        // la COLONNE de la lettre
uint8_t y = 0;        // la LIGNE de la lettre

int main() {
  // La ligne, morceau par morceau :
  //
  //   va_a(x, y, ALPHABET[0], 10, 5);
  //        |  |  |            |   |
  //        |  |  |            |   +-- la LIGNE d'arrivée : 5
  //        |  |  |            +------ la COLONNE d'arrivée : 10
  //        |  |  +------------------- tuile : la lettre A
  //        +--+---------------------- d'où elle part ; la console y range
  //                                   l'arrivée : x = 10, y = 5
  //
  //   A                        (0, 0)
  //     ↘
  //       ↘                    la diagonale, tant que la ligne n'est pas bonne…
  //         ↘
  //           ↘
  //             → → → → → A    …puis tout droit : (5, 5) → (10, 5)
  va_a(x, y, ALPHABET[0], 10, 5);
  nombre(0, 17, x);     // 010
  nombre(4, 17, y);     // 005

  while (true) {
    image();
  }
}
`,
    aVoir: 'Un A qui descend en biais jusqu’en (5, 5), puis file tout droit jusqu’en (10, 5).',
    controle: (c) => {
      const { A } = suivre(c, 'A', 250, 17)
      return [
        ['la diagonale d’abord : (3, 3), (5, 5)', A.includes('3,3') && A.includes('5,5')],
        ['puis tout droit : (8, 5)', A.includes('8,5')],
        ['arrivé en (10, 5) ; x = 10, y = 5', A.at(-1) === '10,5' && c.variable('x') === 10 && c.variable('y') === 5, ` (${A.at(-1)})`],
      ]
    },
  },

  {
    titre: 'Aller à une case : va_a — de base, ailleurs',
    difficulte: 0,
    suite: true,
    idee: 'Le 0.28 dix lignes plus bas : le B part de (0, 10) et va en (10, 15).',
    texte: [
      '**C’est le 0.28**, avec une autre lettre, le **B** (`ALPHABET[1]`, la 2e lettre), et une autre place : le **départ (0, 10)** et l’**arrivée (10, 15)** : tout descend de 10 lignes.',
      '**C’est la version de base** : une seule lettre, à la deuxième place. Le 0.28.2 met les deux ensemble.',
    ],
    code: `uint8_t x = 0;       // la colonne du B
uint8_t y = 10;       // sa ligne

int main() {
  va_a(x, y, ALPHABET[1], 10, 15);

  while (true) {
    image();
  }
}
`,
    aVoir: 'Un B qui va de (0, 10) à (10, 15) : en biais, puis tout droit.',
    controle: (c) => {
      const { B } = suivre(c, 'B', 250, 18)
      return [
        ['le B passe par (5, 15)', B.includes('5,15')],
        ['le B finit en (10, 15)', B.at(-1) === '10,15', ` (${B.at(-1)})`],
      ]
    },
  },

  {
    titre: 'Aller à une case : va_a — doublé, deux positions',
    difficulte: 0,
    suite: true,
    idee: 'Le A va en (10, 5), puis le B en (10, 15).',
    texte: [
      '**C’est le 0.28 et le 0.28.1 réunis** : deux `va_a`, chacun avec ses variables.',
    ],
    code: `uint8_t x = 0;       // la colonne du A
uint8_t y = 0;       // sa ligne
uint8_t xb = 0;       // la colonne du B
uint8_t yb = 10;       // sa ligne

int main() {
  va_a(x, y, ALPHABET[0], 10, 5);
  va_a(xb, yb, ALPHABET[1], 10, 15);

  while (true) {
    image();
  }
}
`,
    aVoir: 'Le A va en (10, 5), puis le B en (10, 15).',
    controle: (c) => {
      const { A, B } = suivre(c, 'AB', 400, 18)
      return [
        ['le A finit en (10, 5)', A.at(-1) === '10,5', ` (${A.at(-1)})`],
        ['le B finit en (10, 15)', B.at(-1) === '10,15', ` (${B.at(-1)})`],
      ]
    },
  },

  {
    titre: 'Revenir au départ avec va_a',
    difficulte: 0,
    idee: 'Le 0.28, plus une ligne : va_a(x, y, …, 0, 0) ramène la lettre au coin, sans compter les pas du retour.',
    texte: [
      '**C’est le 0.28, plus une ligne :** le retour à (0, 0).',
      '**Ce qui est nouveau ici :** rien qu’une autre arrivée. Pour revenir, on ne calcule pas « -10 et -5 » : on dit simplement **où** : `0, 0`.',
      '**Le chemin du retour** suit la même règle : en diagonale tant que les deux axes avancent, de (10, 5) à (5, 0), puis tout droit jusqu’en (0, 0).',
    ],
    code: `uint8_t x = 0;        // la COLONNE de la lettre
uint8_t y = 0;        // la LIGNE de la lettre

int main() {
  va_a(x, y, ALPHABET[0], 10, 5);   // l'aller (le 0.28) : jusqu'en (10, 5)

  // La ligne ajoutée : l'arrivée est le coin (0, 0).
  //   de (10, 5), en diagonale jusqu'en (5, 0), puis tout droit jusqu'en (0, 0)
  va_a(x, y, ALPHABET[0], 0, 0);

  nombre(0, 17, x);     // 000
  nombre(4, 17, y);     // 000

  while (true) {
    image();
  }
}
`,
    aVoir: 'Le A va jusqu’en (10, 5), puis revient au coin (0, 0), en biais puis tout droit.',
    controle: (c) => {
      const { A } = suivre(c, 'A', 450, 17)
      return [
        ['l’aller jusqu’en (10, 5)', A.includes('10,5')],
        ['le retour en biais : (7, 2), puis tout droit : (3, 0)', A.includes('7,2') && A.includes('3,0')],
        ['revenu en (0, 0) ; x et y valent 0', A.at(-1) === '0,0' && c.variable('x') === 0 && c.variable('y') === 0],
      ]
    },
  },

  {
    titre: 'Revenir au départ avec va_a — de base, ailleurs',
    difficulte: 0,
    suite: true,
    idee: 'Le 0.29 dix lignes plus bas : le B va en (10, 15) et revient en (0, 10).',
    texte: [
      '**C’est le 0.29**, avec une autre lettre, le **B** (`ALPHABET[1]`, la 2e lettre), et une autre place : le **départ (0, 10)**, l’arrivée (10, 15), et le retour en **(0, 10)**.',
      '**C’est la version de base** : une seule lettre, à la deuxième place. Le 0.29.2 met les deux ensemble.',
    ],
    code: `uint8_t x = 0;       // la colonne du B
uint8_t y = 10;       // sa ligne

int main() {
  va_a(x, y, ALPHABET[1], 10, 15);
  va_a(x, y, ALPHABET[1], 0, 10);

  while (true) {
    image();
  }
}
`,
    aVoir: 'Un B qui va en (10, 15) et revient en (0, 10).',
    controle: (c) => {
      const { B } = suivre(c, 'B', 450, 18)
      return [
        ['le B passe par (10, 15)', B.includes('10,15')],
        ['le B finit en (0, 10)', B.at(-1) === '0,10', ` (${B.at(-1)})`],
      ]
    },
  },

  {
    titre: 'Revenir au départ avec va_a — doublé, deux positions',
    difficulte: 0,
    suite: true,
    idee: 'L’aller-retour du A (en haut), puis celui du B (en bas).',
    texte: [
      '**C’est le 0.29 et le 0.29.1 réunis** : les deux allers-retours.',
    ],
    code: `uint8_t x = 0;       // la colonne du A
uint8_t y = 0;       // sa ligne
uint8_t xb = 0;       // la colonne du B
uint8_t yb = 10;       // sa ligne

int main() {
  va_a(x, y, ALPHABET[0], 10, 5);
  va_a(x, y, ALPHABET[0], 0, 0);
  va_a(xb, yb, ALPHABET[1], 10, 15);
  va_a(xb, yb, ALPHABET[1], 0, 10);

  while (true) {
    image();
  }
}
`,
    aVoir: 'Le A va et revient en haut, puis le B en bas.',
    controle: (c) => {
      const { A, B } = suivre(c, 'AB', 800, 18)
      return [
        ['le A finit en (0, 0)', A.at(-1) === '0,0', ` (${A.at(-1)})`],
        ['le B passe par (10, 15)', B.includes('10,15')],
        ['le B finit en (0, 10)', B.at(-1) === '0,10', ` (${B.at(-1)})`],
      ]
    },
  },

  {
    titre: 'Un pas sans attendre : un_pas',
    difficulte: 0,
    idee: 'un_pas fait UN pas, tout de suite, sans bloquer. C’est la boucle qui donne le rythme.',
    texte: [
      '**Le défaut des fonctions d’avant :** `deplace_x`, `deplace_y`, `deplace` et `va_a` **bloquent**. Pendant le voyage, le programme attend : rien d’autre ne peut bouger.',
      '**Ce qui est nouveau ici :** `un_pas(colonne, ligne, tuile, sensX, sensY)`. Elle fait **un seul pas**, tout de suite, et rend la main aussitôt : elle efface la lettre et la pose une case plus loin. Elle **n’attend pas**.',
      '**Seul le signe compte :** `1` vers la droite (X) ou le bas (Y) ; `-1` vers la gauche ou le haut ; `0` ne bouge pas sur cet axe.',
      '**C’est la boucle qui donne le rythme**, avec le chronomètre du 0.17 : `images` compte les images, et tous les 15 (quatre fois par seconde), on fait un pas.',
      '**Au bord de l’écran** (colonne 19), un pas vers l’extérieur ne fait plus bouger la lettre.',
    ],
    code: `uint8_t x = 0;        // la colonne de la lettre
uint8_t y = 0;        // sa ligne
uint8_t images = 0;   // le chronomètre, en images (comme au 0.17)

int main() {
  poser(x, y, ALPHABET[0]);     // la lettre à sa place de départ

  while (true) {
    image();                    // attend l'image suivante (60 par seconde)
    images++;                   // le chronomètre avance d'une image
    if (images == 15) {         // 15 images : un quart de seconde
      images = 0;               // le chronomètre repart de zéro

      // La ligne, morceau par morceau :
      //
      //   un_pas(x, y, ALPHABET[0], 1, 0);
      //          |  |  |            |  |
      //          |  |  |            |  +-- sensY : 0, ne bouge pas sur Y
      //          |  |  |            +----- sensX : 1, un pas vers la droite
      //          |  |  +------------------ tuile : la lettre A
      //          +--+--------------------- où elle est ; la console y range
      //                                    sa nouvelle place
      //
      // un_pas N'ATTEND PAS : elle fait le pas et rend la main tout de suite.
      un_pas(x, y, ALPHABET[0], 1, 0);
    }
  }
}
`,
    aVoir: 'Un A qui avance d’une case tous les quarts de seconde vers la droite, et s’arrête au bord.',
    controle: (c) => {
      c.avancer(10)
      const debut = c.variable('x')
      c.avancer(60)
      const pas = c.variable('x') - debut
      c.avancer(15 * 25)
      return [
        ['un pas tous les quarts de seconde : 3 ou 4 en une seconde', pas >= 3 && pas <= 4, ` (${pas})`],
        ['le A est à sa place à l’écran', c.mot(c.variable('x'), 0, 1) === 'A'],
        ['il s’arrête au bord : colonne 19', c.variable('x') === 19, ` (x = ${c.variable('x')})`],
      ]
    },
  },

  {
    titre: 'Un pas sans attendre : un_pas — de base, ailleurs',
    difficulte: 0,
    suite: true,
    idee: 'Le 0.30 sur la ligne 8, avec le B.',
    texte: [
      '**C’est le 0.30**, avec une autre lettre, le **B** (`ALPHABET[1]`, la 2e lettre), et une autre place : la **ligne 8** : y part de 8.',
      '**C’est la version de base** : une seule lettre, à la deuxième place. Le 0.30.2 met les deux ensemble.',
    ],
    code: `uint8_t x = 0;       // la colonne du B
uint8_t y = 8;       // sa ligne
uint8_t images = 0;   // le chronomètre

int main() {
  poser(x, y, ALPHABET[1]);
  while (true) {
    image();
    images++;
    if (images == 15) {
      images = 0;
      un_pas(x, y, ALPHABET[1], 1, 0);
    }
  }
}
`,
    aVoir: 'Un B qui avance sur la ligne 8, un pas tous les quarts de seconde, jusqu’au bord.',
    controle: (c) => {
      c.avancer(450)
      return [
        ['le B va jusqu’au bord : x = 19', c.variable('x') === 19, ` (x = ${c.variable('x')})`],
        ['toujours sur la ligne 8', c.variable('y') === 8, ` (y = ${c.variable('y')})`],
      ]
    },
  },

  {
    titre: 'Un pas sans attendre : un_pas — doublé, deux positions',
    difficulte: 0,
    suite: true,
    idee: 'Le A (ligne 0) et le B (ligne 8) avancent EN MÊME TEMPS : deux un_pas dans la même image.',
    texte: [
      '**C’est le 0.30 et le 0.30.1 réunis** : deux `un_pas` dans la même boucle.',
      '**Ensemble, cette fois :** `un_pas` n’attend pas, les deux pas se font dans la même image. Les deux lettres avancent côte à côte.',
    ],
    code: `uint8_t x = 0;       // la colonne du A
uint8_t y = 0;       // sa ligne
uint8_t xb = 0;       // la colonne du B
uint8_t yb = 8;       // sa ligne
uint8_t images = 0;   // le chronomètre

int main() {
  poser(x, y, ALPHABET[0]);
  poser(xb, yb, ALPHABET[1]);
  while (true) {
    image();
    images++;
    if (images == 15) {
      images = 0;
      un_pas(x, y, ALPHABET[0], 1, 0);
      un_pas(xb, yb, ALPHABET[1], 1, 0);
    }
  }
}
`,
    aVoir: 'Le A et le B avancent ensemble, l’un sur la ligne 0, l’autre sur la ligne 8.',
    controle: (c) => {
      c.avancer(100)
      return [['ensemble : x et xb sont égaux', c.variable('x') === c.variable('xb') && c.variable('x') > 3, ` (${c.variable('x')} et ${c.variable('xb')})`]]
    },
  },

  {
    titre: 'Deux lettres à la fois',
    difficulte: 0,
    idee: 'Le 0.30, plus une deuxième lettre : deux un_pas dans la même boucle, et les deux bougent ensemble.',
    texte: [
      '**C’est le 0.30, plus une lettre**, le B, qui descend pendant que le A avance.',
      '**Ce qui est nouveau ici :** **deux appels à `un_pas`** dans la même boucle, l’un après l’autre. Comme `un_pas` n’attend pas, les deux se font **dans la même image** : les deux lettres bougent **ensemble**. Avec `deplace`, le B aurait attendu la fin du trajet du A.',
      '**Chaque lettre a ses deux variables :** `xa`, `ya` pour le A ; `xb`, `yb` pour le B.',
      '**Le B s’arrête en ligne 16** : le `if (yb < 16)` ne le laisse plus avancer après, pour qu’il ne touche pas les nombres de la ligne 17.',
    ],
    code: `uint8_t xa = 0;       // le A : sa colonne…
uint8_t ya = 0;       //       …et sa ligne. Il file vers la DROITE.
uint8_t xb = 0;       // le B : sa colonne…
uint8_t yb = 2;       //       …et sa ligne. Il file vers le BAS.
uint8_t images = 0;   // le chronomètre, en images

int main() {
  poser(xa, ya, ALPHABET[0]);   // les deux lettres à leur place de départ
  poser(xb, yb, ALPHABET[1]);   // ALPHABET[1] : la 2e lettre, B

  while (true) {
    image();
    images++;
    if (images == 15) {         // 4 fois par seconde :
      images = 0;
      un_pas(xa, ya, ALPHABET[0], 1, 0);                // le A : un pas à droite
      // La ligne ajoutée : le B, un pas en bas — DANS LA MÊME IMAGE que le A,
      // puisque un_pas n'attend pas. Tant que yb < 16 seulement.
      if (yb < 16) un_pas(xb, yb, ALPHABET[1], 0, 1);
      nombre(12, 17, xa);       // la colonne du A, pour la voir changer
      nombre(16, 17, yb);       // la ligne du B
    }
  }
}
`,
    aVoir: 'Un A qui file vers la droite sur la ligne du haut, et un B qui descend en même temps sur la gauche.',
    controle: (c) => {
      c.avancer(10)
      const departA = c.variable('xa')
      const departB = c.variable('yb')
      c.avancer(15 * 4)
      const pasA = c.variable('xa') - departA
      const pasB = c.variable('yb') - departB
      c.avancer(15 * 30)
      return [
        ['le A et le B avancent', pasA >= 3 && pasB >= 3, ` (${pasA} et ${pasB})`],
        ['du même nombre de pas', pasA === pasB],
        ['le A s’arrête au bord : colonne 19', c.variable('xa') === 19, ` (xa = ${c.variable('xa')})`],
        ['le B s’arrête en ligne 16', c.variable('yb') === 16 && c.mot(0, 16, 1) === 'B', ` (yb = ${c.variable('yb')})`],
      ]
    },
  },

  {
    titre: 'Deux lettres à la fois — de base, ailleurs',
    difficulte: 0,
    suite: true,
    idee: 'Le 0.31 déplacé : le A part de la colonne 10, le B descend en colonne 10.',
    texte: [
      '**C’est le 0.31**, avec une autre lettre, le **B** (`ALPHABET[1]`, la 2e lettre), et une autre place : la **colonne 10** : le A part de (10, 0) vers la droite, le B de (10, 2) vers le bas.',
      '**Leurs chemins ne se croisent pas :** le A reste sur la ligne 0, le B commence à la ligne 2.',
      '**C’est la version de base** : une seule lettre, à la deuxième place. Le 0.31.2 met les deux ensemble.',
    ],
    code: `uint8_t xa = 10;       // la colonne du A
uint8_t ya = 0;       // sa ligne
uint8_t xb = 10;       // la colonne du B
uint8_t yb = 2;       // sa ligne
uint8_t images = 0;   // le chronomètre

int main() {
  poser(xa, ya, ALPHABET[0]);
  poser(xb, yb, ALPHABET[1]);
  while (true) {
    image();
    images++;
    if (images == 15) {
      images = 0;
      un_pas(xa, ya, ALPHABET[0], 1, 0);
      if (yb < 16) un_pas(xb, yb, ALPHABET[1], 0, 1);
    }
  }
}
`,
    aVoir: 'Un A qui file à droite depuis le milieu de la ligne du haut, un B qui descend en colonne 10.',
    controle: (c) => {
      c.avancer(450)
      return [
        ['le A va jusqu’au bord : 19', c.variable('xa') === 19, ` (xa = ${c.variable('xa')})`],
        ['le B s’arrête en ligne 16', c.variable('yb') === 16, ` (yb = ${c.variable('yb')})`],
      ]
    },
  },

  {
    titre: 'Deux lettres à la fois — doublé, deux positions',
    difficulte: 0,
    suite: true,
    idee: 'Quatre lettres, EN MÊME TEMPS : A et B à gauche (le 0.31), C et D en colonne 10.',
    texte: [
      '**C’est le 0.31 et le 0.31.1 réunis** : les deux paires dans la même boucle.',
      '**Quatre `un_pas` dans la même image :** les quatre lettres avancent ensemble. `ALPHABET[2]` est le C, `ALPHABET[3]` le D.',
      '**Le A s’arrête en colonne 9** (`if (xa < 9)`) : sans cela, il rattraperait la place du C.',
    ],
    code: `uint8_t xa = 0;       // la colonne du A
uint8_t ya = 0;       // sa ligne
uint8_t xb = 0;       // la colonne du B
uint8_t yb = 2;       // sa ligne
uint8_t xc = 10;       // la colonne du C
uint8_t yc = 0;       // sa ligne
uint8_t xd = 10;       // la colonne du D
uint8_t yd = 2;       // sa ligne
uint8_t images = 0;   // le chronomètre

int main() {
  poser(xa, ya, ALPHABET[0]);
  poser(xb, yb, ALPHABET[1]);
  poser(xc, yc, ALPHABET[2]);
  poser(xd, yd, ALPHABET[3]);
  while (true) {
    image();
    images++;
    if (images == 15) {
      images = 0;
      if (xa < 9) un_pas(xa, ya, ALPHABET[0], 1, 0);
      if (yb < 16) un_pas(xb, yb, ALPHABET[1], 0, 1);
      un_pas(xc, yc, ALPHABET[2], 1, 0);
      if (yd < 16) un_pas(xd, yd, ALPHABET[3], 0, 1);
    }
  }
}
`,
    aVoir: 'Quatre lettres en même temps : deux vont à droite sur la ligne du haut, deux descendent.',
    controle: (c) => {
      c.avancer(450)
      return [
        ['le A s’arrête en 9', c.variable('xa') === 9, ` (xa = ${c.variable('xa')})`],
        ['le C va jusqu’au bord', c.variable('xc') === 19, ` (xc = ${c.variable('xc')})`],
        ['le B descend jusqu’en 16', c.variable('yb') === 16, ` (yb = ${c.variable('yb')})`],
        ['le D aussi', c.variable('yd') === 16, ` (yd = ${c.variable('yd')})`],
      ]
    },
  },

  {
    titre: 'Le trajet dans un tableau',
    difficulte: 0,
    idee: 'Les pas du trajet rangés dans deux tableaux : une boucle for les parcourt. On change le chemin sans toucher au code.',
    texte: [
      '**Le carré du 0.27 répétait quatre fois la même ligne**, avec d’autres nombres. Quand un programme répète la même chose avec des nombres différents, on range les **nombres** dans un tableau, et on écrit la ligne **une seule fois**, dans une boucle.',
      '**Ce qui est nouveau ici :** deux tableaux, `PAS_X` et `PAS_Y`. La case `i` de chacun dit le pas du côté `i` : `PAS_X[0]` et `PAS_Y[0]` pour le premier côté (5 et 0 : à droite), `PAS_X[1]` et `PAS_Y[1]` pour le deuxième (0 et 5 : en bas), et ainsi de suite.',
      '**Des nombres négatifs dans un tableau d’octets :** `-5` y est rangé comme 251, comme toujours. `deplace` sait le lire : au-delà de 127, c’est un pas en arrière.',
      '**`const`** devant le tableau veut dire qu’il ne change jamais : il est gravé dans la cartouche, et ne prend pas de place dans la mémoire de travail.',
      '**La boucle `for`** fait tourner `i` de 0 à 3 : `sizeof(PAS_X)` vaut 4, le nombre de cases (comme `sizeof(ALPHABET)` au 0.9). Et la boucle `while (true)` autour recommence le trajet sans fin.',
      '**Pour changer le chemin**, on ne touche qu’aux tableaux. Essaie `{ 3, 3, 3, -9 }` et `{ 3, -3, 3, 0 }` : un zigzag. Ajoute des cases, la boucle suit toute seule.',
    ],
    code: `// Le trajet : un côté par case. PAS_X[i] et PAS_Y[i] vont ensemble.
//                         côté 0   côté 1   côté 2   côté 3
//                         droite   bas      gauche   haut
const uint8_t PAS_X[] = {  5,       0,      -5,       0 };
const uint8_t PAS_Y[] = {  0,       5,       0,      -5 };

uint8_t x = 0;        // la colonne de la lettre
uint8_t y = 0;        // la ligne de la lettre

int main() {
  while (true) {                                // le trajet, sans fin
    for (uint8_t i = 0; i < sizeof(PAS_X); i++) {   // i = 0, 1, 2, 3 : un tour par côté
      // Le côté i : on lit ses deux pas dans les tableaux.
      //   i = 0 : deplace(x, y, ALPHABET[0],  5,  0);   à droite
      //   i = 1 : deplace(x, y, ALPHABET[0],  0,  5);   en bas
      //   i = 2 : deplace(x, y, ALPHABET[0], -5,  0);   à gauche
      //   i = 3 : deplace(x, y, ALPHABET[0],  0, -5);   en haut
      deplace(x, y, ALPHABET[0], PAS_X[i], PAS_Y[i]);
    }
  }
}
`,
    aVoir: 'Un A qui tourne en carré sans s’arrêter : droite, bas, gauche, haut, et on recommence.',
    controle: (c) => {
      const ou = () => {
        for (let l = 0; l < 18; l++) {
          const k = c.mot(0, l, 20).indexOf('A')
          if (k >= 0) return k + ',' + l
        }
        return ''
      }
      const vues = []
      for (let k = 0; k < 700; k++) {
        c.avancer(1)
        const ici = ou()
        if (ici !== vues.at(-1)) vues.push(ici)
      }
      const coins = vues.filter((v) => ['5,0', '5,5', '0,5', '0,0'].includes(v))
      return [
        ['les quatre coins, dans l’ordre', coins.slice(0, 4).join(' ') === '5,0 5,5 0,5 0,0', ` (${coins.slice(0, 4).join(' ')})`],
        ['et il recommence', coins.filter((v) => v === '5,0').length >= 2],
        ['un seul A à l’écran', vues.every((v) => v !== '')],
      ]
    },
  },

  {
    titre: 'Le trajet dans un tableau — de base, ailleurs',
    difficulte: 0,
    suite: true,
    idee: 'Le trajet du 0.32 à partir de (10, 0), avec le B.',
    texte: [
      '**C’est le 0.32**, avec une autre lettre, le **B** (`ALPHABET[1]`, la 2e lettre), et une autre place : le **départ (10, 0)** : les mêmes tableaux, le carré à droite.',
      '**C’est la version de base** : une seule lettre, à la deuxième place. Le 0.32.2 met les deux ensemble.',
    ],
    code: `const uint8_t PAS_X[] = {  5,  0, -5,  0 };
const uint8_t PAS_Y[] = {  0,  5,  0, -5 };

uint8_t x = 10;       // la colonne du B
uint8_t y = 0;       // sa ligne

int main() {
  while (true) {
    for (uint8_t i = 0; i < sizeof(PAS_X); i++) {
      deplace(x, y, ALPHABET[1], PAS_X[i], PAS_Y[i]);
    }
  }
}
`,
    aVoir: 'Un B qui tourne en carré sans fin, à partir de (10, 0).',
    controle: (c) => {
      const { B } = suivre(c, 'B', 400, 18)
      return [
        ['le B passe par (15, 0)', B.includes('15,0')],
        ['le B passe par (15, 5)', B.includes('15,5')],
        ['le B passe par (10, 5)', B.includes('10,5')],
      ]
    },
  },

  {
    titre: 'Le trajet dans un tableau — doublé, deux positions',
    difficulte: 0,
    suite: true,
    idee: 'Les deux carrés, avec les MÊMES tableaux : le A et le B font chacun le côté i, à tour de rôle.',
    texte: [
      '**C’est le 0.32 et le 0.32.1 réunis** : deux `deplace` dans la boucle, chacun avec ses variables.',
      '**Un seul trajet pour deux lettres :** les tableaux disent les pas ; chaque lettre les suit avec ses variables. Le A fait un côté, puis le B le même côté, et ainsi de suite.',
    ],
    code: `const uint8_t PAS_X[] = {  5,  0, -5,  0 };
const uint8_t PAS_Y[] = {  0,  5,  0, -5 };

uint8_t x = 0;       // la colonne du A
uint8_t y = 0;       // sa ligne
uint8_t xb = 10;       // la colonne du B
uint8_t yb = 0;       // sa ligne

int main() {
  while (true) {
    for (uint8_t i = 0; i < sizeof(PAS_X); i++) {
      deplace(x, y, ALPHABET[0], PAS_X[i], PAS_Y[i]);
      deplace(xb, yb, ALPHABET[1], PAS_X[i], PAS_Y[i]);
    }
  }
}
`,
    aVoir: 'Le A et le B font le même carré, chacun de son côté, à tour de rôle.',
    controle: (c) => {
      const { A, B } = suivre(c, 'AB', 700, 18)
      return [
        ['le A passe par (5, 5)', A.includes('5,5')],
        ['le B passe par (15, 5)', B.includes('15,5')],
      ]
    },
  },
  {
    titre: 'Écrire soi-même sa fonction',
    difficulte: 0,
    idee: 'mon_deplace_x, écrite à la main : le 0.17 rangé dans une fonction. C’est ce qu’il y a dans deplace_x.',
    texte: [
      '**Toutes ces fonctions sont écrites dans le même langage que tes programmes.** Ici, on écrit la nôtre, `mon_deplace_x` : c’est, ligne pour ligne, ce que la console a dans `deplace_x`.',
      '**Ce qui est nouveau ici : écrire une fonction.** `uint8_t mon_deplace_x(uint8_t colonne, uint8_t ligne, uint8_t tuile, uint8_t pas) { … }`. Le premier `uint8_t` dit ce que la fonction **rend** (un octet, la colonne) ; entre les parenthèses, ses **paramètres**, ce qu’elle reçoit ; entre les accolades, ce qu’elle fait.',
      '**Les paramètres sont des copies.** Quand on appelle `mon_deplace_x(x, 0, ALPHABET[0], 5)`, `colonne` reçoit une copie de `x` (0), `pas` reçoit 5. La fonction change `colonne` et `pas` tant qu’elle veut : `x`, lui, ne bouge pas.',
      '**`return colonne;`** rend la colonne d’arrivée, et termine la fonction. C’est cette valeur que `x = …` range dans `x`.',
      '**Ici, `x =` est obligatoire.** Le rangement automatique du 0.23 ne vaut que pour les fonctions de la console. `mon_deplace_x(x, …);` seule ferait bouger la lettre, mais `x` resterait à 0 : c’est la règle normale du C.',
      '**`break`** sort de la boucle `while` tout de suite : au bord de l’écran, il n’y a plus de pas possible.',
    ],
    code: `uint8_t x = 0;        // la colonne de la lettre

// NOTRE fonction : c'est le 0.17, rangé sous un nom.
//
//   uint8_t      mon_deplace_x(uint8_t colonne, uint8_t ligne, uint8_t tuile, uint8_t pas)
//   |            |             |
//   |            |             +-- les PARAMÈTRES : ce qu'elle reçoit. Des COPIES :
//   |            |                 changer colonne ne change pas x.
//   |            +---------------- son nom
//   +----------------------------- ce qu'elle REND : un octet (la colonne d'arrivée)
uint8_t mon_deplace_x(uint8_t colonne, uint8_t ligne, uint8_t tuile, uint8_t pas) {
  uint8_t recule = pas > 127;          // -5 est rangé 251 : au-delà de 127, on recule
  if (recule) pas = 0 - pas;           // 251 redevient 5 : le nombre de cases
  poser(colonne, ligne, tuile);        // la lettre à sa place de départ
  while (pas > 0) {                    // tant qu'il reste des pas
    for (uint8_t i = 0; i < 15; i++) image();   // un quart de seconde
    if (recule && colonne == 0) break;          // bord gauche : on sort de la boucle
    if (!recule && colonne == 19) break;        // bord droit  : on sort de la boucle
    effacer(colonne, ligne, 1);        // 1. efface l'ancienne place
    if (recule) colonne--;             // 2. une colonne plus à gauche…
    else colonne++;                    //    …ou plus à droite
    poser(colonne, ligne, tuile);      // 3. la lettre à sa nouvelle place
    pas--;                             // un pas de moins à faire
  }
  return colonne;                      // REND la colonne d'arrivée, et termine
}

int main() {
  // « x = » est OBLIGATOIRE ici : mon_deplace_x est à nous, pas à la console.
  // Elle reçoit une copie de x, et REND la colonne d'arrivée ; on la range.
  x = mon_deplace_x(x, 0, ALPHABET[0], 5);    // x vaut 5
  x = mon_deplace_x(x, 0, ALPHABET[0], -5);   // x vaut 0

  while (true) {
    image();
  }
}
`,
    aVoir: 'Exactement le 0.19 : un A qui avance de 5 cases, revient, et s’arrête. Mais cette fois, la fonction est écrite dans le programme.',
    controle: (c) => {
      let aller = ''
      for (let k = 0; k < 150 && !aller; k++) {
        c.avancer(1)
        if (c.variable('x') === 5) aller = c.mot(0, 0, 20)
      }
      c.avancer(180)
      const retour = c.mot(0, 0, 20)
      return [
        ['à l’aller, le A arrive en colonne 5', aller === '     A              ', ` (« ${aller} »)`],
        ['au retour, le A revient en colonne 0', retour.trimEnd() === 'A', ` (« ${retour} »)`],
        ['x vaut la colonne rendue', c.variable('x') === 0, ` (x = ${c.variable('x')})`],
      ]
    },
  },

  {
    titre: 'Écrire soi-même sa fonction — de base, ailleurs',
    difficulte: 0,
    suite: true,
    idee: 'La fonction du 0.33, appelée pour le B sur la ligne 8.',
    texte: [
      '**C’est le 0.33**, avec une autre lettre, le **B** (`ALPHABET[1]`, la 2e lettre), et une autre place : la **ligne 8** dans les deux appels.',
      '**La fonction ne change pas :** c’est tout l’intérêt d’une fonction. On lui donne d’autres renseignements (la ligne, la tuile), elle fait le même travail ailleurs.',
      '**C’est la version de base** : une seule lettre, à la deuxième place. Le 0.33.2 met les deux ensemble.',
    ],
    code: `uint8_t x = 0;

// Notre fonction, la même qu'au 0.33 (voir ses commentaires là-bas).
uint8_t mon_deplace_x(uint8_t colonne, uint8_t ligne, uint8_t tuile, uint8_t pas) {
  uint8_t recule = pas > 127;
  if (recule) pas = 0 - pas;
  poser(colonne, ligne, tuile);
  while (pas > 0) {
    for (uint8_t i = 0; i < 15; i++) image();
    if (recule && colonne == 0) break;
    if (!recule && colonne == 19) break;
    effacer(colonne, ligne, 1);
    if (recule) colonne--;
    else colonne++;
    poser(colonne, ligne, tuile);
    pas--;
  }
  return colonne;
}

int main() {
  x = mon_deplace_x(x, 8, ALPHABET[1], 5);    // le B, ligne 8 : x vaut 5
  x = mon_deplace_x(x, 8, ALPHABET[1], -5);   // retour : x vaut 0

  while (true) {
    image();
  }
}
`,
    aVoir: 'Un B qui va et revient sur la ligne 8, grâce à notre fonction.',
    controle: (c) => {
      const { B } = suivre(c, 'B', 400, 18)
      return [
        ['le B passe par (5, 8)', B.includes('5,8')],
        ['le B finit en (0, 8)', B.at(-1) === '0,8', ` (${B.at(-1)})`],
      ]
    },
  },

  {
    titre: 'Écrire soi-même sa fonction — doublé, deux positions',
    difficulte: 0,
    suite: true,
    idee: 'UNE fonction, DEUX lettres : mon_deplace_x sert pour le A (x) et pour le B (xb).',
    texte: [
      '**C’est le 0.33 et le 0.33.1 réunis** : quatre appels à la même fonction.',
      '**Écrite une fois, servie autant qu’on veut :** la fonction ne sait rien du A ni du B ; elle bouge ce qu’on lui donne, et rend la colonne. `x =` et `xb =` rangent chaque résultat dans la bonne variable.',
    ],
    code: `uint8_t x = 0;        // le A
uint8_t xb = 0;       // le B

// Notre fonction, la même qu'au 0.33.
uint8_t mon_deplace_x(uint8_t colonne, uint8_t ligne, uint8_t tuile, uint8_t pas) {
  uint8_t recule = pas > 127;
  if (recule) pas = 0 - pas;
  poser(colonne, ligne, tuile);
  while (pas > 0) {
    for (uint8_t i = 0; i < 15; i++) image();
    if (recule && colonne == 0) break;
    if (!recule && colonne == 19) break;
    effacer(colonne, ligne, 1);
    if (recule) colonne--;
    else colonne++;
    poser(colonne, ligne, tuile);
    pas--;
  }
  return colonne;
}

int main() {
  x = mon_deplace_x(x, 0, ALPHABET[0], 5);
  x = mon_deplace_x(x, 0, ALPHABET[0], -5);      // le A (le 0.33)
  xb = mon_deplace_x(xb, 8, ALPHABET[1], 5);
  xb = mon_deplace_x(xb, 8, ALPHABET[1], -5);    // le B (le 0.33.1)

  while (true) {
    image();
  }
}
`,
    aVoir: 'Le A va et revient sur la ligne 0, puis le B sur la ligne 8 : la même fonction pour les deux.',
    controle: (c) => {
      const { A, B } = suivre(c, 'AB', 700, 18)
      return [
        ['le A finit en (0, 0)', A.at(-1) === '0,0', ` (${A.at(-1)})`],
        ['le B passe par (5, 8)', B.includes('5,8')],
        ['le B finit en (0, 8)', B.at(-1) === '0,8', ` (${B.at(-1)})`],
      ]
    },
  },
  {
    titre: 'Un carré autour d’une lettre, avec carre',
    difficulte: 0,
    partie: 'Des formes',
    idee: 'Une ligne, une lettre : carre(10, 8, ALPHABET[0], 1, 1, 250, 1) fait faire au A un tour en carré autour de la case (10, 8).',
    texte: [
      '**Une seule lettre, une seule ligne.** Le A fait **un tour complet** autour de la case (10, 8), en carré, puis revient à sa place.',
      '**Ce qui est nouveau ici :** `carre(x, y, tuile, taille, sens, vitesse, tours)`. Elle a sept réglages, mais pour commencer, ne regarde que les **trois premiers** :',
      '• **`10, 8`** (`x`, `y`) : la case **autour de laquelle** on tourne, le **centre** du carré. La lettre part de là, et y revient.',
      '• **`ALPHABET[0]`** (`tuile`) : ce qui tourne, la lettre A.',
      '**Les quatre autres restent simples ici :** taille `1`, sens `1`, vitesse `250`, tours `1`. Ils veulent dire : le plus petit carré, dans le sens des aiguilles d’une montre, 4 pas par seconde, un seul tour. Les cours suivants les changent **un par un**.',
      '**Le trajet :** le A part du centre (10, 8), fait un pas en diagonale jusqu’au coin en haut à gauche (9, 7), fait le tour du carré de **3 × 3** cases (droite, bas, gauche, haut), puis revient en diagonale au centre.',
      '**`carre` ne rend rien :** la lettre finit exactement là où elle a commencé. Il n’y a ni `x =` ni variable à tenir.',
    ],
    code: `// main : le programme commence ici. Les lignes entre { et } s'exécutent
// dans l'ordre, de haut en bas.
int main() {
  // Une seule ligne fait tout le carré. Ses sept réglages, dans l'ordre :
  //
  //   carre(10, 8, ALPHABET[0], 1, 1, 250, 1);
  //         |   |  |            |  |  |    |
  //         |   |  |            |  |  |    +-- tours   : 1, un seul tour
  //         |   |  |            |  |  +------- vitesse : 250 millisecondes par pas,
  //         |   |  |            |  |                     soit 4 pas par seconde
  //         |   |  |            |  +---------- sens    : 1, comme les aiguilles
  //         |   |  |            |                        d'une montre
  //         |   |  |            +------------- taille  : 1, le plus petit carré (3 × 3)
  //         |   |  +-------------------------- tuile   : ce qui tourne ; ALPHABET[0]
  //         |   |                                        est la 1re lettre, A
  //         |   +----------------------------- y       : la LIGNE du centre, 8
  //         +--------------------------------- x       : la COLONNE du centre, 10
  //
  // Pour ce premier cours, regarde surtout x, y et la tuile. Les quatre
  // autres réglages seront changés un par un dans les cours suivants.
  //
  // Ce que fait le A, un pas tous les quarts de seconde :
  //
  //      colonne :   9    10    11
  //      ligne 7 :   2  →  3  →  4
  //                  ↑           ↓
  //      ligne 8 :   9     A     5
  //                  ↑           ↓
  //      ligne 9 :   8  ←  7  ←  6
  //
  //   1.     le A apparaît au centre (10, 8)
  //   2.     un pas en diagonale : le coin en haut à gauche (9, 7)
  //   3 à 9. le tour, une case à la fois : droite, bas, gauche, haut…
  //   10.    …jusqu'au coin (9, 7), d'où il était parti
  //   11.    un pas en diagonale : retour au centre (10, 8)
  carre(10, 8, ALPHABET[0], 1, 1, 250, 1);

  // Ici, carre a fini : le A est revenu au centre (10, 8), et il y reste.
  // while (true) tourne sans fin, pour que le programme ne s'arrête jamais.
  while (true) {
    image();          // attend l'image suivante (60 par seconde)
  }
}
`,
    aVoir: 'Un A qui fait un petit tour en carré autour de la case (10, 8), puis s’arrête au centre.',
    controle: (c) => {
      const chemin = []
      for (let k = 0; k < 400; k++) {
        c.avancer(1)
        for (let l = 0; l < 18; l++) {
          const i = c.mot(0, l, 20).indexOf('A')
          if (i >= 0 && chemin.at(-1) !== i + ',' + l) chemin.push(i + ',' + l)
        }
      }
      const coins = chemin.filter((p) => ['9,7', '11,7', '11,9', '9,9'].includes(p))
      return [
        ['les quatre coins, dans le sens des aiguilles d’une montre', coins.slice(0, 4).join(' ') === '9,7 11,7 11,9 9,9',
          ` (${coins.slice(0, 4).join(' ')})`],
        ['le A revient au centre (10, 8)', chemin.at(-1) === '10,8', ` (${chemin.at(-1)})`],
      ]
    },
  },
  {
    titre: 'Un carré autour d’une lettre, avec carre — de base, ailleurs',
    difficulte: 0,
    suite: true,
    idee: 'Le carré du 0.34, avec une seule lettre, le B, autour d’une deuxième position : (4, 4).',
    texte: [
      '**C’est le carré du 0.34**, mêmes réglages (taille 1, sens 1, vitesse 250, 1 tour), avec deux changements qui vont ensemble : **une autre lettre** et **une autre position**.',
      '**La lettre :** `ALPHABET[1]`, la 2e lettre de l’alphabet, le **B** (on compte à partir de 0 : A = 0, B = 1).',
      '**La position : (4, 4)** au lieu de (10, 8). Un carré de taille 1 tient entier si son centre est à au moins 1 cases de chaque bord : la colonne entre 1 et 19 − 1 = 18, la ligne entre 1 et 17 − 1 = 16. (4, 4) respecte ces limites : le carré de 3 × 3 tient entier, des colonnes 3 à 5 et des lignes 3 à 5.',
      '**C’est la version de base** : une seule lettre, un seul carré. Le 0.34.2 mettra les deux carrés ensemble.',
    ],
    code: `int main() {
  // Le carré du 0.34, ailleurs et avec le B :
  //
  //   carre(4, 4, ALPHABET[1], 1, 1, 250, 1);
  //         |  |  |
  //         |  |  +-- ALPHABET[1] : la 2e lettre, B
  //         +--+----- le centre (4, 4) : le carré de taille 1
  //                   y tient entier (colonnes 3 à 5, lignes 3 à 5)
  //
  // Les autres réglages sont ceux du 0.34 : taille 1, sens 1, vitesse 250, tours 1.
  carre(4, 4, ALPHABET[1], 1, 1, 250, 1);

  while (true) {
    image();          // le B est revenu à son centre
  }
}
`,
    aVoir: 'Le même carré qu’au 0.34, mais fait par un B, autour de (4, 4).',
    controle: (c) => {
      const { B } = suivre(c, 'B', 310)
      return [
        ['le B fait le tour autour de (4, 4) : coins (3, 3) et (5, 5)', B.includes('3,3') && B.includes('5,5')],
        ['le B revient à son centre (4, 4)', B.at(-1) === '4,4', ` (${B.at(-1)})`],
      ]
    },
  },

  {
    titre: 'Un carré autour d’une lettre, avec carre — doublé, deux positions',
    difficulte: 0,
    suite: true,
    idee: 'Les deux carrés dans le même programme : le A autour de (10, 8), puis le B autour de (4, 4).',
    texte: [
      '**C’est le 0.34 et le 0.34.1 réunis :** deux lignes, deux lettres, deux positions.',
      '**Ce qui est nouveau ici : deux carrés dans le même programme.** Le A tourne autour de (10, 8), comme au 0.34 ; puis le B autour de (4, 4), comme au 0.34.1.',
      '**L’un après l’autre :** `carre` attend la fin de son carré avant de rendre la main. Le B ne commence que quand le A est revenu à son centre.',
      '**Les deux carrés ne se touchent pas** : chacun a son coin de l’écran. À la fin, on voit les deux lettres, chacune à son centre.',
    ],
    code: `int main() {
  // 1. Le A, autour de (10, 8) : le 0.34.
  carre(10, 8, ALPHABET[0], 1, 1, 250, 1);

  // 2. Le B, autour de (4, 4) : le 0.34.1.
  //    Il commence quand le A a fini : carre attend la fin de son carré.
  carre(4, 4, ALPHABET[1], 1, 1, 250, 1);

  while (true) {
    image();
  }
}
`,
    aVoir: 'Le A fait son carré autour de (10, 8), puis le B fait le même autour de (4, 4).',
    controle: (c) => {
      const { A, B } = suivre(c, 'AB', 470)
      return [
        ['le A fait son tour autour de (10, 8) : coin (11, 9)', A.includes('11,9')],
        ['puis le B autour de (4, 4) : coin (3, 3)', B.includes('3,3')],
        ['le B revient à son centre (4, 4)', B.at(-1) === '4,4', ` (${B.at(-1)})`],
      ]
    },
  },

  {
    titre: 'Taille 2 : un carré de 5 × 5',
    difficulte: 0,
    idee: 'Le même carré qu’au 0.34, avec la taille 2 au lieu de 1 : 5 × 5 cases autour de (10, 8).',
    texte: [
      '**Un seul changement par rapport au 0.34 :** la taille, 4e réglage, passe de 1 à **2**.',
      '**Ce qui est nouveau ici : la taille 2.** La lettre tourne à **2 cases** du centre. La règle 2 × n + 1 donne 2 × 2 + 1 = **5** cases de côté : un carré de **5 × 5**.',
      '**Où il tombe dans l’écran :** autour de (10, 8), de la colonne 10 − 2 = **8** à 10 + 2 = **12**, et de la ligne 8 − 2 = **6** à 8 + 2 = **10**. L’écran va de la colonne 0 à 19 et de la ligne 0 à 17 : le carré tient entier.',
      '**Pourquoi le centre (10, 8) :** l’écran fait 20 colonnes et 18 lignes ; son milieu est vers la colonne 10 et la ligne 8. C’est le seul genre d’endroit où **toutes** les tailles, de 1 jusqu’à 8, tiennent entières. Toutes les leçons de carré qui suivent tournent donc autour de (10, 8), et l’on voit chaque carré grandir autour du même point.',
    ],
    code: `int main() {
  // Un seul changement par rapport au 0.34 : la taille, 1 → 2.
  //
  //   carre(10, 8, ALPHABET[0], 2, 1, 250, 1);
  //                             |
  //                             +-- taille 2 : à 2 cases du centre ;
  //                                 2 × 2 + 1 = 5 cases de côté
  //
  // Le carré, colonnes 8 à 12, lignes 6 à 10 (A : le centre, (10, 8)) :
  //
  //   ligne  6 :  → → → → ↓
  //   ligne  7 :  ↑ . . . ↓
  //   ligne  8 :  ↑ . A . ↓
  //   ligne  9 :  ↑ . . . ↓
  //   ligne 10 :  ↑ ← ← ← ←
  carre(10, 8, ALPHABET[0], 2, 1, 250, 1);

  while (true) {
    image();          // le tour est fini : le A reste au centre
  }
}
`,
    aVoir: 'Un A qui fait un tour en carré de 5 × 5 cases autour du milieu de l’écran, puis revient au centre.',
    controle: (c) => {
      const { A } = suivre(c, 'A', 440)
      return [
        ['les quatre coins : (8, 6), (12, 6), (12, 10), (8, 10)', ['8,6', '12,6', '12,10', '8,10'].every((p) => A.includes(p))],
        ['jamais plus loin que la taille 2', !A.some((p) => { const [x, y] = p.split(',').map(Number); return x < 8 || x > 12 || y < 6 || y > 10 })],
        ['sens 1 : du coin, il va à DROITE', A[A.indexOf('8,6') + 1] === '9,6'],
        ['le A revient au centre (10, 8)', A.at(-1) === '10,8', ` (${A.at(-1)})`],
      ]
    },
  },

  {
    titre: 'Taille 2 : un carré de 5 × 5 — de base, ailleurs',
    difficulte: 0,
    suite: true,
    idee: 'Le carré du 0.35, avec une seule lettre, le B, autour d’une deuxième position : (4, 4).',
    texte: [
      '**C’est le carré du 0.35**, mêmes réglages (taille 2, sens 1, vitesse 250, 1 tour), avec deux changements qui vont ensemble : **une autre lettre** et **une autre position**.',
      '**La lettre :** `ALPHABET[1]`, la 2e lettre de l’alphabet, le **B** (on compte à partir de 0 : A = 0, B = 1).',
      '**La position : (4, 4)** au lieu de (10, 8). Un carré de taille 2 tient entier si son centre est à au moins 2 cases de chaque bord : la colonne entre 2 et 19 − 2 = 17, la ligne entre 2 et 17 − 2 = 15. (4, 4) respecte ces limites : le carré de 5 × 5 tient entier, des colonnes 2 à 6 et des lignes 2 à 6.',
      '**C’est la version de base** : une seule lettre, un seul carré. Le 0.35.2 mettra les deux carrés ensemble.',
    ],
    code: `int main() {
  // Le carré du 0.35, ailleurs et avec le B :
  //
  //   carre(4, 4, ALPHABET[1], 2, 1, 250, 1);
  //         |  |  |
  //         |  |  +-- ALPHABET[1] : la 2e lettre, B
  //         +--+----- le centre (4, 4) : le carré de taille 2
  //                   y tient entier (colonnes 2 à 6, lignes 2 à 6)
  //
  // Les autres réglages sont ceux du 0.35 : taille 2, sens 1, vitesse 250, tours 1.
  carre(4, 4, ALPHABET[1], 2, 1, 250, 1);

  while (true) {
    image();          // le B est revenu à son centre
  }
}
`,
    aVoir: 'Le même carré qu’au 0.35, mais fait par un B, autour de (4, 4).',
    controle: (c) => {
      const { B } = suivre(c, 'B', 470)
      return [
        ['le B fait le tour autour de (4, 4) : coins (2, 2) et (6, 6)', B.includes('2,2') && B.includes('6,6')],
        ['le B revient à son centre (4, 4)', B.at(-1) === '4,4', ` (${B.at(-1)})`],
      ]
    },
  },

  {
    titre: 'Taille 2 : un carré de 5 × 5 — doublé, deux positions',
    difficulte: 0,
    suite: true,
    idee: 'Les deux carrés dans le même programme : le A autour de (10, 8), puis le B autour de (4, 4).',
    texte: [
      '**C’est le 0.35 et le 0.35.1 réunis :** deux lignes, deux lettres, deux positions.',
      '**Ce qui est nouveau ici : deux carrés dans le même programme.** Le A tourne autour de (10, 8), comme au 0.35 ; puis le B autour de (4, 4), comme au 0.35.1.',
      '**L’un après l’autre :** `carre` attend la fin de son carré avant de rendre la main. Le B ne commence que quand le A est revenu à son centre.',
      '**Les deux carrés ne se touchent pas** : chacun a son coin de l’écran. À la fin, on voit les deux lettres, chacune à son centre.',
    ],
    code: `int main() {
  // 1. Le A, autour de (10, 8) : le 0.35.
  carre(10, 8, ALPHABET[0], 2, 1, 250, 1);

  // 2. Le B, autour de (4, 4) : le 0.35.1.
  //    Il commence quand le A a fini : carre attend la fin de son carré.
  carre(4, 4, ALPHABET[1], 2, 1, 250, 1);

  while (true) {
    image();
  }
}
`,
    aVoir: 'Le A fait son carré autour de (10, 8), puis le B fait le même autour de (4, 4).',
    controle: (c) => {
      const { A, B } = suivre(c, 'AB', 790)
      return [
        ['le A fait son tour autour de (10, 8) : coin (12, 10)', A.includes('12,10')],
        ['puis le B autour de (4, 4) : coin (2, 2)', B.includes('2,2')],
        ['le B revient à son centre (4, 4)', B.at(-1) === '4,4', ` (${B.at(-1)})`],
      ]
    },
  },

  {
    titre: 'Taille 3 : un carré de 7 × 7',
    difficulte: 0,
    idee: 'Le même carré qu’au 0.35, avec la taille 3 au lieu de 2 : 7 × 7 cases autour de (10, 8).',
    texte: [
      '**Un seul changement par rapport au 0.35 :** la taille, 4e réglage, passe de 2 à **3**.',
      '**Ce qui est nouveau ici : la taille 3.** La lettre tourne à **3 cases** du centre. La règle 2 × n + 1 donne 2 × 3 + 1 = **7** cases de côté : un carré de **7 × 7**.',
      '**Où il tombe dans l’écran :** autour de (10, 8), de la colonne 10 − 3 = **7** à 10 + 3 = **13**, et de la ligne 8 − 3 = **5** à 8 + 3 = **11**. L’écran va de la colonne 0 à 19 et de la ligne 0 à 17 : le carré tient entier.',
    ],
    code: `int main() {
  // Un seul changement par rapport au 0.35 : la taille, 2 → 3.
  //
  //   carre(10, 8, ALPHABET[0], 3, 1, 250, 1);
  //                             |
  //                             +-- taille 3 : à 3 cases du centre ;
  //                                 2 × 3 + 1 = 7 cases de côté
  //
  // Le carré, colonnes 7 à 13, lignes 5 à 11 (A : le centre, (10, 8)) :
  //
  //   ligne  5 :  → → → → → → ↓
  //   ligne  6 :  ↑ . . . . . ↓
  //   ligne  7 :  ↑ . . . . . ↓
  //   ligne  8 :  ↑ . . A . . ↓
  //   ligne  9 :  ↑ . . . . . ↓
  //   ligne 10 :  ↑ . . . . . ↓
  //   ligne 11 :  ↑ ← ← ← ← ← ←
  carre(10, 8, ALPHABET[0], 3, 1, 250, 1);

  while (true) {
    image();          // le tour est fini : le A reste au centre
  }
}
`,
    aVoir: 'Un A qui fait un tour en carré de 7 × 7 cases autour du milieu de l’écran, puis revient au centre.',
    controle: (c) => {
      const { A } = suivre(c, 'A', 600)
      return [
        ['les quatre coins : (7, 5), (13, 5), (13, 11), (7, 11)', ['7,5', '13,5', '13,11', '7,11'].every((p) => A.includes(p))],
        ['jamais plus loin que la taille 3', !A.some((p) => { const [x, y] = p.split(',').map(Number); return x < 7 || x > 13 || y < 5 || y > 11 })],
        ['sens 1 : du coin, il va à DROITE', A[A.indexOf('7,5') + 1] === '8,5'],
        ['le A revient au centre (10, 8)', A.at(-1) === '10,8', ` (${A.at(-1)})`],
      ]
    },
  },

  {
    titre: 'Taille 3 : un carré de 7 × 7 — de base, ailleurs',
    difficulte: 0,
    suite: true,
    idee: 'Le carré du 0.36, avec une seule lettre, le B, autour d’une deuxième position : (4, 4).',
    texte: [
      '**C’est le carré du 0.36**, mêmes réglages (taille 3, sens 1, vitesse 250, 1 tour), avec deux changements qui vont ensemble : **une autre lettre** et **une autre position**.',
      '**La lettre :** `ALPHABET[1]`, la 2e lettre de l’alphabet, le **B** (on compte à partir de 0 : A = 0, B = 1).',
      '**La position : (4, 4)** au lieu de (10, 8). Un carré de taille 3 tient entier si son centre est à au moins 3 cases de chaque bord : la colonne entre 3 et 19 − 3 = 16, la ligne entre 3 et 17 − 3 = 14. (4, 4) respecte ces limites : le carré de 7 × 7 tient entier, des colonnes 1 à 7 et des lignes 1 à 7.',
      '**C’est la version de base** : une seule lettre, un seul carré. Le 0.36.2 mettra les deux carrés ensemble.',
    ],
    code: `int main() {
  // Le carré du 0.36, ailleurs et avec le B :
  //
  //   carre(4, 4, ALPHABET[1], 3, 1, 250, 1);
  //         |  |  |
  //         |  |  +-- ALPHABET[1] : la 2e lettre, B
  //         +--+----- le centre (4, 4) : le carré de taille 3
  //                   y tient entier (colonnes 1 à 7, lignes 1 à 7)
  //
  // Les autres réglages sont ceux du 0.36 : taille 3, sens 1, vitesse 250, tours 1.
  carre(4, 4, ALPHABET[1], 3, 1, 250, 1);

  while (true) {
    image();          // le B est revenu à son centre
  }
}
`,
    aVoir: 'Le même carré qu’au 0.36, mais fait par un B, autour de (4, 4).',
    controle: (c) => {
      const { B } = suivre(c, 'B', 630)
      return [
        ['le B fait le tour autour de (4, 4) : coins (1, 1) et (7, 7)', B.includes('1,1') && B.includes('7,7')],
        ['le B revient à son centre (4, 4)', B.at(-1) === '4,4', ` (${B.at(-1)})`],
      ]
    },
  },

  {
    titre: 'Taille 3 : un carré de 7 × 7 — doublé, deux positions',
    difficulte: 0,
    suite: true,
    idee: 'Les deux carrés dans le même programme : le A autour de (10, 8), puis le B autour de (4, 4).',
    texte: [
      '**C’est le 0.36 et le 0.36.1 réunis :** deux lignes, deux lettres, deux positions.',
      '**Ce qui est nouveau ici : deux carrés dans le même programme.** Le A tourne autour de (10, 8), comme au 0.36 ; puis le B autour de (4, 4), comme au 0.36.1.',
      '**L’un après l’autre :** `carre` attend la fin de son carré avant de rendre la main. Le B ne commence que quand le A est revenu à son centre.',
      '**Les deux carrés ne se touchent pas** : chacun a son coin de l’écran. À la fin, on voit les deux lettres, chacune à son centre.',
    ],
    code: `int main() {
  // 1. Le A, autour de (10, 8) : le 0.36.
  carre(10, 8, ALPHABET[0], 3, 1, 250, 1);

  // 2. Le B, autour de (4, 4) : le 0.36.1.
  //    Il commence quand le A a fini : carre attend la fin de son carré.
  carre(4, 4, ALPHABET[1], 3, 1, 250, 1);

  while (true) {
    image();
  }
}
`,
    aVoir: 'Le A fait son carré autour de (10, 8), puis le B fait le même autour de (4, 4).',
    controle: (c) => {
      const { A, B } = suivre(c, 'AB', 1110)
      return [
        ['le A fait son tour autour de (10, 8) : coin (13, 11)', A.includes('13,11')],
        ['puis le B autour de (4, 4) : coin (1, 1)', B.includes('1,1')],
        ['le B revient à son centre (4, 4)', B.at(-1) === '4,4', ` (${B.at(-1)})`],
      ]
    },
  },

  {
    titre: 'Taille 4 : un carré de 9 × 9',
    difficulte: 0,
    idee: 'Le même carré qu’au 0.36, avec la taille 4 au lieu de 3 : 9 × 9 cases autour de (10, 8).',
    texte: [
      '**Un seul changement par rapport au 0.36 :** la taille, 4e réglage, passe de 3 à **4**.',
      '**Ce qui est nouveau ici : la taille 4.** La lettre tourne à **4 cases** du centre. La règle 2 × n + 1 donne 2 × 4 + 1 = **9** cases de côté : un carré de **9 × 9**.',
      '**Où il tombe dans l’écran :** autour de (10, 8), de la colonne 10 − 4 = **6** à 10 + 4 = **14**, et de la ligne 8 − 4 = **4** à 8 + 4 = **12**. L’écran va de la colonne 0 à 19 et de la ligne 0 à 17 : le carré tient entier.',
    ],
    code: `int main() {
  // Un seul changement par rapport au 0.36 : la taille, 3 → 4.
  //
  //   carre(10, 8, ALPHABET[0], 4, 1, 250, 1);
  //                             |
  //                             +-- taille 4 : à 4 cases du centre ;
  //                                 2 × 4 + 1 = 9 cases de côté
  //
  // Le carré, colonnes 6 à 14, lignes 4 à 12 (A : le centre, (10, 8)) :
  //
  //   ligne  4 :  → → → → → → → → ↓
  //   ligne  5 :  ↑ . . . . . . . ↓
  //   ligne  6 :  ↑ . . . . . . . ↓
  //   ligne  7 :  ↑ . . . . . . . ↓
  //   ligne  8 :  ↑ . . . A . . . ↓
  //   ligne  9 :  ↑ . . . . . . . ↓
  //   ligne 10 :  ↑ . . . . . . . ↓
  //   ligne 11 :  ↑ . . . . . . . ↓
  //   ligne 12 :  ↑ ← ← ← ← ← ← ← ←
  carre(10, 8, ALPHABET[0], 4, 1, 250, 1);

  while (true) {
    image();          // le tour est fini : le A reste au centre
  }
}
`,
    aVoir: 'Un A qui fait un tour en carré de 9 × 9 cases autour du milieu de l’écran, puis revient au centre.',
    controle: (c) => {
      const { A } = suivre(c, 'A', 760)
      return [
        ['les quatre coins : (6, 4), (14, 4), (14, 12), (6, 12)', ['6,4', '14,4', '14,12', '6,12'].every((p) => A.includes(p))],
        ['jamais plus loin que la taille 4', !A.some((p) => { const [x, y] = p.split(',').map(Number); return x < 6 || x > 14 || y < 4 || y > 12 })],
        ['sens 1 : du coin, il va à DROITE', A[A.indexOf('6,4') + 1] === '7,4'],
        ['le A revient au centre (10, 8)', A.at(-1) === '10,8', ` (${A.at(-1)})`],
      ]
    },
  },

  {
    titre: 'Taille 4 : un carré de 9 × 9 — de base, ailleurs',
    difficulte: 0,
    suite: true,
    idee: 'Le carré du 0.37, avec une seule lettre, le B, autour d’une deuxième position : (4, 4).',
    texte: [
      '**C’est le carré du 0.37**, mêmes réglages (taille 4, sens 1, vitesse 250, 1 tour), avec deux changements qui vont ensemble : **une autre lettre** et **une autre position**.',
      '**La lettre :** `ALPHABET[1]`, la 2e lettre de l’alphabet, le **B** (on compte à partir de 0 : A = 0, B = 1).',
      '**La position : (4, 4)** au lieu de (10, 8). Un carré de taille 4 tient entier si son centre est à au moins 4 cases de chaque bord : la colonne entre 4 et 19 − 4 = 15, la ligne entre 4 et 17 − 4 = 13. (4, 4) respecte ces limites : le carré de 9 × 9 tient entier, des colonnes 0 à 8 et des lignes 0 à 8.',
      '**C’est la version de base** : une seule lettre, un seul carré. Le 0.37.2 mettra les deux carrés ensemble.',
    ],
    code: `int main() {
  // Le carré du 0.37, ailleurs et avec le B :
  //
  //   carre(4, 4, ALPHABET[1], 4, 1, 250, 1);
  //         |  |  |
  //         |  |  +-- ALPHABET[1] : la 2e lettre, B
  //         +--+----- le centre (4, 4) : le carré de taille 4
  //                   y tient entier (colonnes 0 à 8, lignes 0 à 8)
  //
  // Les autres réglages sont ceux du 0.37 : taille 4, sens 1, vitesse 250, tours 1.
  carre(4, 4, ALPHABET[1], 4, 1, 250, 1);

  while (true) {
    image();          // le B est revenu à son centre
  }
}
`,
    aVoir: 'Le même carré qu’au 0.37, mais fait par un B, autour de (4, 4).',
    controle: (c) => {
      const { B } = suivre(c, 'B', 790)
      return [
        ['le B fait le tour autour de (4, 4) : coins (0, 0) et (8, 8)', B.includes('0,0') && B.includes('8,8')],
        ['le B revient à son centre (4, 4)', B.at(-1) === '4,4', ` (${B.at(-1)})`],
      ]
    },
  },

  {
    titre: 'Taille 4 : un carré de 9 × 9 — doublé, deux positions',
    difficulte: 0,
    suite: true,
    idee: 'Les deux carrés dans le même programme : le A autour de (10, 8), puis le B autour de (4, 4).',
    texte: [
      '**C’est le 0.37 et le 0.37.1 réunis :** deux lignes, deux lettres, deux positions.',
      '**Ce qui est nouveau ici : deux carrés dans le même programme.** Le A tourne autour de (10, 8), comme au 0.37 ; puis le B autour de (4, 4), comme au 0.37.1.',
      '**L’un après l’autre :** `carre` attend la fin de son carré avant de rendre la main. Le B ne commence que quand le A est revenu à son centre.',
      '**Les deux carrés ne se touchent pas** : chacun a son coin de l’écran. À la fin, on voit les deux lettres, chacune à son centre.',
    ],
    code: `int main() {
  // 1. Le A, autour de (10, 8) : le 0.37.
  carre(10, 8, ALPHABET[0], 4, 1, 250, 1);

  // 2. Le B, autour de (4, 4) : le 0.37.1.
  //    Il commence quand le A a fini : carre attend la fin de son carré.
  carre(4, 4, ALPHABET[1], 4, 1, 250, 1);

  while (true) {
    image();
  }
}
`,
    aVoir: 'Le A fait son carré autour de (10, 8), puis le B fait le même autour de (4, 4).',
    controle: (c) => {
      const { A, B } = suivre(c, 'AB', 1430)
      return [
        ['le A fait son tour autour de (10, 8) : coin (14, 12)', A.includes('14,12')],
        ['puis le B autour de (4, 4) : coin (0, 0)', B.includes('0,0')],
        ['le B revient à son centre (4, 4)', B.at(-1) === '4,4', ` (${B.at(-1)})`],
      ]
    },
  },

  {
    titre: 'Taille 5 : un carré de 11 × 11',
    difficulte: 0,
    idee: 'Le même carré qu’au 0.37, avec la taille 5 au lieu de 4 : 11 × 11 cases autour de (10, 8).',
    texte: [
      '**Un seul changement par rapport au 0.37 :** la taille, 4e réglage, passe de 4 à **5**.',
      '**Ce qui est nouveau ici : la taille 5.** La lettre tourne à **5 cases** du centre. La règle 2 × n + 1 donne 2 × 5 + 1 = **11** cases de côté : un carré de **11 × 11**.',
      '**Où il tombe dans l’écran :** autour de (10, 8), de la colonne 10 − 5 = **5** à 10 + 5 = **15**, et de la ligne 8 − 5 = **3** à 8 + 5 = **13**. L’écran va de la colonne 0 à 19 et de la ligne 0 à 17 : le carré tient entier.',
    ],
    code: `int main() {
  // Un seul changement par rapport au 0.37 : la taille, 4 → 5.
  //
  //   carre(10, 8, ALPHABET[0], 5, 1, 250, 1);
  //                             |
  //                             +-- taille 5 : à 5 cases du centre ;
  //                                 2 × 5 + 1 = 11 cases de côté
  //
  // Le carré, colonnes 5 à 15, lignes 3 à 13 (A : le centre, (10, 8)) :
  //
  //   ligne  3 :  → → → → → → → → → → ↓
  //   ligne  4 :  ↑ . . . . . . . . . ↓
  //   ligne  5 :  ↑ . . . . . . . . . ↓
  //   ligne  6 :  ↑ . . . . . . . . . ↓
  //   ligne  7 :  ↑ . . . . . . . . . ↓
  //   ligne  8 :  ↑ . . . . A . . . . ↓
  //   ligne  9 :  ↑ . . . . . . . . . ↓
  //   ligne 10 :  ↑ . . . . . . . . . ↓
  //   ligne 11 :  ↑ . . . . . . . . . ↓
  //   ligne 12 :  ↑ . . . . . . . . . ↓
  //   ligne 13 :  ↑ ← ← ← ← ← ← ← ← ← ←
  carre(10, 8, ALPHABET[0], 5, 1, 250, 1);

  while (true) {
    image();          // le tour est fini : le A reste au centre
  }
}
`,
    aVoir: 'Un A qui fait un tour en carré de 11 × 11 cases autour du milieu de l’écran, puis revient au centre.',
    controle: (c) => {
      const { A } = suivre(c, 'A', 920)
      return [
        ['les quatre coins : (5, 3), (15, 3), (15, 13), (5, 13)', ['5,3', '15,3', '15,13', '5,13'].every((p) => A.includes(p))],
        ['jamais plus loin que la taille 5', !A.some((p) => { const [x, y] = p.split(',').map(Number); return x < 5 || x > 15 || y < 3 || y > 13 })],
        ['sens 1 : du coin, il va à DROITE', A[A.indexOf('5,3') + 1] === '6,3'],
        ['le A revient au centre (10, 8)', A.at(-1) === '10,8', ` (${A.at(-1)})`],
      ]
    },
  },

  {
    titre: 'Taille 5 : un carré de 11 × 11 — de base, ailleurs',
    difficulte: 0,
    suite: true,
    idee: 'Le carré du 0.38, avec une seule lettre, le B, autour d’une deuxième position : (5, 5).',
    texte: [
      '**C’est le carré du 0.38**, mêmes réglages (taille 5, sens 1, vitesse 250, 1 tour), avec deux changements qui vont ensemble : **une autre lettre** et **une autre position**.',
      '**La lettre :** `ALPHABET[1]`, la 2e lettre de l’alphabet, le **B** (on compte à partir de 0 : A = 0, B = 1).',
      '**La position : (5, 5)** au lieu de (10, 8). Un carré de taille 5 tient entier si son centre est à au moins 5 cases de chaque bord : la colonne entre 5 et 19 − 5 = 14, la ligne entre 5 et 17 − 5 = 12. (5, 5) respecte ces limites : le carré de 11 × 11 tient entier, des colonnes 0 à 10 et des lignes 0 à 10.',
      '**C’est la version de base** : une seule lettre, un seul carré. Le 0.38.2 mettra les deux carrés ensemble.',
    ],
    code: `int main() {
  // Le carré du 0.38, ailleurs et avec le B :
  //
  //   carre(5, 5, ALPHABET[1], 5, 1, 250, 1);
  //         |  |  |
  //         |  |  +-- ALPHABET[1] : la 2e lettre, B
  //         +--+----- le centre (5, 5) : le carré de taille 5
  //                   y tient entier (colonnes 0 à 10, lignes 0 à 10)
  //
  // Les autres réglages sont ceux du 0.38 : taille 5, sens 1, vitesse 250, tours 1.
  carre(5, 5, ALPHABET[1], 5, 1, 250, 1);

  while (true) {
    image();          // le B est revenu à son centre
  }
}
`,
    aVoir: 'Le même carré qu’au 0.38, mais fait par un B, autour de (5, 5).',
    controle: (c) => {
      const { B } = suivre(c, 'B', 950)
      return [
        ['le B fait le tour autour de (5, 5) : coins (0, 0) et (10, 10)', B.includes('0,0') && B.includes('10,10')],
        ['le B revient à son centre (5, 5)', B.at(-1) === '5,5', ` (${B.at(-1)})`],
      ]
    },
  },

  {
    titre: 'Taille 5 : un carré de 11 × 11 — doublé, deux positions',
    difficulte: 0,
    suite: true,
    idee: 'Les deux carrés dans le même programme : le A autour de (10, 8), puis le B autour de (5, 5).',
    texte: [
      '**C’est le 0.38 et le 0.38.1 réunis :** deux lignes, deux lettres, deux positions.',
      '**Ce qui est nouveau ici : deux carrés dans le même programme.** Le A tourne autour de (10, 8), comme au 0.38 ; puis le B autour de (5, 5), comme au 0.38.1.',
      '**L’un après l’autre :** `carre` attend la fin de son carré avant de rendre la main. Le B ne commence que quand le A est revenu à son centre.',
      '**Les deux carrés se croisent** (taille 5 : 11 × 11 chacun). En passant sur une case, `carre` l’**efface** en la quittant : si le chemin du B passe sur le A arrêté, il l’efface. C’est normal : chaque lettre ne s’occupe que d’elle-même.',
    ],
    code: `int main() {
  // 1. Le A, autour de (10, 8) : le 0.38.
  carre(10, 8, ALPHABET[0], 5, 1, 250, 1);

  // 2. Le B, autour de (5, 5) : le 0.38.1.
  //    Il commence quand le A a fini : carre attend la fin de son carré.
  carre(5, 5, ALPHABET[1], 5, 1, 250, 1);

  while (true) {
    image();
  }
}
`,
    aVoir: 'Le A fait son carré autour de (10, 8), puis le B fait le même autour de (5, 5).',
    controle: (c) => {
      const { A, B } = suivre(c, 'AB', 1750)
      return [
        ['le A fait son tour autour de (10, 8) : coin (15, 13)', A.includes('15,13')],
        ['puis le B autour de (5, 5) : coin (0, 0)', B.includes('0,0')],
        ['le B revient à son centre (5, 5)', B.at(-1) === '5,5', ` (${B.at(-1)})`],
      ]
    },
  },

  {
    titre: 'Taille 6 : un carré de 13 × 13',
    difficulte: 0,
    idee: 'Le même carré qu’au 0.38, avec la taille 6 au lieu de 5 : 13 × 13 cases autour de (10, 8).',
    texte: [
      '**Un seul changement par rapport au 0.38 :** la taille, 4e réglage, passe de 5 à **6**.',
      '**Ce qui est nouveau ici : la taille 6.** La lettre tourne à **6 cases** du centre. La règle 2 × n + 1 donne 2 × 6 + 1 = **13** cases de côté : un carré de **13 × 13**.',
      '**Où il tombe dans l’écran :** autour de (10, 8), de la colonne 10 − 6 = **4** à 10 + 6 = **16**, et de la ligne 8 − 6 = **2** à 8 + 6 = **14**. L’écran va de la colonne 0 à 19 et de la ligne 0 à 17 : le carré tient entier.',
    ],
    code: `int main() {
  // Un seul changement par rapport au 0.38 : la taille, 5 → 6.
  //
  //   carre(10, 8, ALPHABET[0], 6, 1, 250, 1);
  //                             |
  //                             +-- taille 6 : à 6 cases du centre ;
  //                                 2 × 6 + 1 = 13 cases de côté
  //
  // Le carré, colonnes 4 à 16, lignes 2 à 14 (A : le centre, (10, 8)) :
  //
  //   ligne  2 :  → → → → → → → → → → → → ↓
  //   ligne  3 :  ↑ . . . . . . . . . . . ↓
  //   ligne  4 :  ↑ . . . . . . . . . . . ↓
  //   ligne  5 :  ↑ . . . . . . . . . . . ↓
  //   ligne  6 :  ↑ . . . . . . . . . . . ↓
  //   ligne  7 :  ↑ . . . . . . . . . . . ↓
  //   ligne  8 :  ↑ . . . . . A . . . . . ↓
  //   ligne  9 :  ↑ . . . . . . . . . . . ↓
  //   ligne 10 :  ↑ . . . . . . . . . . . ↓
  //   ligne 11 :  ↑ . . . . . . . . . . . ↓
  //   ligne 12 :  ↑ . . . . . . . . . . . ↓
  //   ligne 13 :  ↑ . . . . . . . . . . . ↓
  //   ligne 14 :  ↑ ← ← ← ← ← ← ← ← ← ← ← ←
  carre(10, 8, ALPHABET[0], 6, 1, 250, 1);

  while (true) {
    image();          // le tour est fini : le A reste au centre
  }
}
`,
    aVoir: 'Un A qui fait un tour en carré de 13 × 13 cases autour du milieu de l’écran, puis revient au centre.',
    controle: (c) => {
      const { A } = suivre(c, 'A', 1080)
      return [
        ['les quatre coins : (4, 2), (16, 2), (16, 14), (4, 14)', ['4,2', '16,2', '16,14', '4,14'].every((p) => A.includes(p))],
        ['jamais plus loin que la taille 6', !A.some((p) => { const [x, y] = p.split(',').map(Number); return x < 4 || x > 16 || y < 2 || y > 14 })],
        ['sens 1 : du coin, il va à DROITE', A[A.indexOf('4,2') + 1] === '5,2'],
        ['le A revient au centre (10, 8)', A.at(-1) === '10,8', ` (${A.at(-1)})`],
      ]
    },
  },

  {
    titre: 'Taille 6 : un carré de 13 × 13 — de base, ailleurs',
    difficulte: 0,
    suite: true,
    idee: 'Le carré du 0.39, avec une seule lettre, le B, autour d’une deuxième position : (6, 6).',
    texte: [
      '**C’est le carré du 0.39**, mêmes réglages (taille 6, sens 1, vitesse 250, 1 tour), avec deux changements qui vont ensemble : **une autre lettre** et **une autre position**.',
      '**La lettre :** `ALPHABET[1]`, la 2e lettre de l’alphabet, le **B** (on compte à partir de 0 : A = 0, B = 1).',
      '**La position : (6, 6)** au lieu de (10, 8). Un carré de taille 6 tient entier si son centre est à au moins 6 cases de chaque bord : la colonne entre 6 et 19 − 6 = 13, la ligne entre 6 et 17 − 6 = 11. (6, 6) respecte ces limites : le carré de 13 × 13 tient entier, des colonnes 0 à 12 et des lignes 0 à 12.',
      '**C’est la version de base** : une seule lettre, un seul carré. Le 0.39.2 mettra les deux carrés ensemble.',
    ],
    code: `int main() {
  // Le carré du 0.39, ailleurs et avec le B :
  //
  //   carre(6, 6, ALPHABET[1], 6, 1, 250, 1);
  //         |  |  |
  //         |  |  +-- ALPHABET[1] : la 2e lettre, B
  //         +--+----- le centre (6, 6) : le carré de taille 6
  //                   y tient entier (colonnes 0 à 12, lignes 0 à 12)
  //
  // Les autres réglages sont ceux du 0.39 : taille 6, sens 1, vitesse 250, tours 1.
  carre(6, 6, ALPHABET[1], 6, 1, 250, 1);

  while (true) {
    image();          // le B est revenu à son centre
  }
}
`,
    aVoir: 'Le même carré qu’au 0.39, mais fait par un B, autour de (6, 6).',
    controle: (c) => {
      const { B } = suivre(c, 'B', 1110)
      return [
        ['le B fait le tour autour de (6, 6) : coins (0, 0) et (12, 12)', B.includes('0,0') && B.includes('12,12')],
        ['le B revient à son centre (6, 6)', B.at(-1) === '6,6', ` (${B.at(-1)})`],
      ]
    },
  },

  {
    titre: 'Taille 6 : un carré de 13 × 13 — doublé, deux positions',
    difficulte: 0,
    suite: true,
    idee: 'Les deux carrés dans le même programme : le A autour de (10, 8), puis le B autour de (6, 6).',
    texte: [
      '**C’est le 0.39 et le 0.39.1 réunis :** deux lignes, deux lettres, deux positions.',
      '**Ce qui est nouveau ici : deux carrés dans le même programme.** Le A tourne autour de (10, 8), comme au 0.39 ; puis le B autour de (6, 6), comme au 0.39.1.',
      '**L’un après l’autre :** `carre` attend la fin de son carré avant de rendre la main. Le B ne commence que quand le A est revenu à son centre.',
      '**Les deux carrés se croisent** (taille 6 : 13 × 13 chacun). En passant sur une case, `carre` l’**efface** en la quittant : si le chemin du B passe sur le A arrêté, il l’efface. C’est normal : chaque lettre ne s’occupe que d’elle-même.',
    ],
    code: `int main() {
  // 1. Le A, autour de (10, 8) : le 0.39.
  carre(10, 8, ALPHABET[0], 6, 1, 250, 1);

  // 2. Le B, autour de (6, 6) : le 0.39.1.
  //    Il commence quand le A a fini : carre attend la fin de son carré.
  carre(6, 6, ALPHABET[1], 6, 1, 250, 1);

  while (true) {
    image();
  }
}
`,
    aVoir: 'Le A fait son carré autour de (10, 8), puis le B fait le même autour de (6, 6).',
    controle: (c) => {
      const { A, B } = suivre(c, 'AB', 2070)
      return [
        ['le A fait son tour autour de (10, 8) : coin (16, 14)', A.includes('16,14')],
        ['puis le B autour de (6, 6) : coin (0, 0)', B.includes('0,0')],
        ['le B revient à son centre (6, 6)', B.at(-1) === '6,6', ` (${B.at(-1)})`],
      ]
    },
  },

  {
    titre: 'Taille 7 : un carré de 15 × 15',
    difficulte: 0,
    idee: 'Le même carré qu’au 0.39, avec la taille 7 au lieu de 6 : 15 × 15 cases autour de (10, 8).',
    texte: [
      '**Un seul changement par rapport au 0.39 :** la taille, 4e réglage, passe de 6 à **7**.',
      '**Ce qui est nouveau ici : la taille 7.** La lettre tourne à **7 cases** du centre. La règle 2 × n + 1 donne 2 × 7 + 1 = **15** cases de côté : un carré de **15 × 15**.',
      '**Où il tombe dans l’écran :** autour de (10, 8), de la colonne 10 − 7 = **3** à 10 + 7 = **17**, et de la ligne 8 − 7 = **1** à 8 + 7 = **15**. L’écran va de la colonne 0 à 19 et de la ligne 0 à 17 : le carré tient entier.',
    ],
    code: `int main() {
  // Un seul changement par rapport au 0.39 : la taille, 6 → 7.
  //
  //   carre(10, 8, ALPHABET[0], 7, 1, 250, 1);
  //                             |
  //                             +-- taille 7 : à 7 cases du centre ;
  //                                 2 × 7 + 1 = 15 cases de côté
  //
  // Le carré, colonnes 3 à 17, lignes 1 à 15 (A : le centre, (10, 8)) :
  //
  //   ligne  1 :  → → → → → → → → → → → → → → ↓
  //   ligne  2 :  ↑ . . . . . . . . . . . . . ↓
  //   ligne  3 :  ↑ . . . . . . . . . . . . . ↓
  //   ligne  4 :  ↑ . . . . . . . . . . . . . ↓
  //   ligne  5 :  ↑ . . . . . . . . . . . . . ↓
  //   ligne  6 :  ↑ . . . . . . . . . . . . . ↓
  //   ligne  7 :  ↑ . . . . . . . . . . . . . ↓
  //   ligne  8 :  ↑ . . . . . . A . . . . . . ↓
  //   ligne  9 :  ↑ . . . . . . . . . . . . . ↓
  //   ligne 10 :  ↑ . . . . . . . . . . . . . ↓
  //   ligne 11 :  ↑ . . . . . . . . . . . . . ↓
  //   ligne 12 :  ↑ . . . . . . . . . . . . . ↓
  //   ligne 13 :  ↑ . . . . . . . . . . . . . ↓
  //   ligne 14 :  ↑ . . . . . . . . . . . . . ↓
  //   ligne 15 :  ↑ ← ← ← ← ← ← ← ← ← ← ← ← ← ←
  carre(10, 8, ALPHABET[0], 7, 1, 250, 1);

  while (true) {
    image();          // le tour est fini : le A reste au centre
  }
}
`,
    aVoir: 'Un A qui fait un tour en carré de 15 × 15 cases autour du milieu de l’écran, puis revient au centre.',
    controle: (c) => {
      const { A } = suivre(c, 'A', 1240)
      return [
        ['les quatre coins : (3, 1), (17, 1), (17, 15), (3, 15)', ['3,1', '17,1', '17,15', '3,15'].every((p) => A.includes(p))],
        ['jamais plus loin que la taille 7', !A.some((p) => { const [x, y] = p.split(',').map(Number); return x < 3 || x > 17 || y < 1 || y > 15 })],
        ['sens 1 : du coin, il va à DROITE', A[A.indexOf('3,1') + 1] === '4,1'],
        ['le A revient au centre (10, 8)', A.at(-1) === '10,8', ` (${A.at(-1)})`],
      ]
    },
  },

  {
    titre: 'Taille 7 : un carré de 15 × 15 — de base, ailleurs',
    difficulte: 0,
    suite: true,
    idee: 'Le carré du 0.40, avec une seule lettre, le B, autour d’une deuxième position : (7, 7).',
    texte: [
      '**C’est le carré du 0.40**, mêmes réglages (taille 7, sens 1, vitesse 250, 1 tour), avec deux changements qui vont ensemble : **une autre lettre** et **une autre position**.',
      '**La lettre :** `ALPHABET[1]`, la 2e lettre de l’alphabet, le **B** (on compte à partir de 0 : A = 0, B = 1).',
      '**La position : (7, 7)** au lieu de (10, 8). Un carré de taille 7 tient entier si son centre est à au moins 7 cases de chaque bord : la colonne entre 7 et 19 − 7 = 12, la ligne entre 7 et 17 − 7 = 10. (7, 7) respecte ces limites : le carré de 15 × 15 tient entier, des colonnes 0 à 14 et des lignes 0 à 14.',
      '**C’est la version de base** : une seule lettre, un seul carré. Le 0.40.2 mettra les deux carrés ensemble.',
    ],
    code: `int main() {
  // Le carré du 0.40, ailleurs et avec le B :
  //
  //   carre(7, 7, ALPHABET[1], 7, 1, 250, 1);
  //         |  |  |
  //         |  |  +-- ALPHABET[1] : la 2e lettre, B
  //         +--+----- le centre (7, 7) : le carré de taille 7
  //                   y tient entier (colonnes 0 à 14, lignes 0 à 14)
  //
  // Les autres réglages sont ceux du 0.40 : taille 7, sens 1, vitesse 250, tours 1.
  carre(7, 7, ALPHABET[1], 7, 1, 250, 1);

  while (true) {
    image();          // le B est revenu à son centre
  }
}
`,
    aVoir: 'Le même carré qu’au 0.40, mais fait par un B, autour de (7, 7).',
    controle: (c) => {
      const { B } = suivre(c, 'B', 1270)
      return [
        ['le B fait le tour autour de (7, 7) : coins (0, 0) et (14, 14)', B.includes('0,0') && B.includes('14,14')],
        ['le B revient à son centre (7, 7)', B.at(-1) === '7,7', ` (${B.at(-1)})`],
      ]
    },
  },

  {
    titre: 'Taille 7 : un carré de 15 × 15 — doublé, deux positions',
    difficulte: 0,
    suite: true,
    idee: 'Les deux carrés dans le même programme : le A autour de (10, 8), puis le B autour de (7, 7).',
    texte: [
      '**C’est le 0.40 et le 0.40.1 réunis :** deux lignes, deux lettres, deux positions.',
      '**Ce qui est nouveau ici : deux carrés dans le même programme.** Le A tourne autour de (10, 8), comme au 0.40 ; puis le B autour de (7, 7), comme au 0.40.1.',
      '**L’un après l’autre :** `carre` attend la fin de son carré avant de rendre la main. Le B ne commence que quand le A est revenu à son centre.',
      '**Les deux carrés se croisent** (taille 7 : 15 × 15 chacun). En passant sur une case, `carre` l’**efface** en la quittant : si le chemin du B passe sur le A arrêté, il l’efface. C’est normal : chaque lettre ne s’occupe que d’elle-même.',
    ],
    code: `int main() {
  // 1. Le A, autour de (10, 8) : le 0.40.
  carre(10, 8, ALPHABET[0], 7, 1, 250, 1);

  // 2. Le B, autour de (7, 7) : le 0.40.1.
  //    Il commence quand le A a fini : carre attend la fin de son carré.
  carre(7, 7, ALPHABET[1], 7, 1, 250, 1);

  while (true) {
    image();
  }
}
`,
    aVoir: 'Le A fait son carré autour de (10, 8), puis le B fait le même autour de (7, 7).',
    controle: (c) => {
      const { A, B } = suivre(c, 'AB', 2390)
      return [
        ['le A fait son tour autour de (10, 8) : coin (17, 15)', A.includes('17,15')],
        ['puis le B autour de (7, 7) : coin (0, 0)', B.includes('0,0')],
        ['le B revient à son centre (7, 7)', B.at(-1) === '7,7', ` (${B.at(-1)})`],
      ]
    },
  },

  {
    titre: 'Taille 8 : un carré de 17 × 17',
    difficulte: 0,
    idee: 'Le même carré qu’au 0.40, avec la taille 8 au lieu de 7 : 17 × 17 cases autour de (10, 8).',
    texte: [
      '**Un seul changement par rapport au 0.40 :** la taille, 4e réglage, passe de 7 à **8**.',
      '**Ce qui est nouveau ici : la taille 8.** La lettre tourne à **8 cases** du centre. La règle 2 × n + 1 donne 2 × 8 + 1 = **17** cases de côté : un carré de **17 × 17**.',
      '**Où il tombe dans l’écran :** autour de (10, 8), de la colonne 10 − 8 = **2** à 10 + 8 = **18**, et de la ligne 8 − 8 = **0** à 8 + 8 = **16**. L’écran va de la colonne 0 à 19 et de la ligne 0 à 17 : le carré tient entier.',
      '**C’est le plus grand possible.** Avec la taille 9, le haut du carré serait à la ligne 8 − 9, au-dessus de l’écran : il n’existe pas de ligne -1. La taille 8 touche la ligne 0 en haut, la colonne 2 à gauche et la colonne 18 à droite.',
    ],
    code: `int main() {
  // Un seul changement par rapport au 0.40 : la taille, 7 → 8.
  //
  //   carre(10, 8, ALPHABET[0], 8, 1, 250, 1);
  //                             |
  //                             +-- taille 8 : à 8 cases du centre ;
  //                                 2 × 8 + 1 = 17 cases de côté
  //
  // Le carré, colonnes 2 à 18, lignes 0 à 16 (A : le centre, (10, 8)) :
  //
  //   ligne  0 :  → → → → → → → → → → → → → → → → ↓
  //   ligne  1 :  ↑ . . . . . . . . . . . . . . . ↓
  //   ligne  2 :  ↑ . . . . . . . . . . . . . . . ↓
  //   ligne  3 :  ↑ . . . . . . . . . . . . . . . ↓
  //   ligne  4 :  ↑ . . . . . . . . . . . . . . . ↓
  //   ligne  5 :  ↑ . . . . . . . . . . . . . . . ↓
  //   ligne  6 :  ↑ . . . . . . . . . . . . . . . ↓
  //   ligne  7 :  ↑ . . . . . . . . . . . . . . . ↓
  //   ligne  8 :  ↑ . . . . . . . A . . . . . . . ↓
  //   ligne  9 :  ↑ . . . . . . . . . . . . . . . ↓
  //   ligne 10 :  ↑ . . . . . . . . . . . . . . . ↓
  //   ligne 11 :  ↑ . . . . . . . . . . . . . . . ↓
  //   ligne 12 :  ↑ . . . . . . . . . . . . . . . ↓
  //   ligne 13 :  ↑ . . . . . . . . . . . . . . . ↓
  //   ligne 14 :  ↑ . . . . . . . . . . . . . . . ↓
  //   ligne 15 :  ↑ . . . . . . . . . . . . . . . ↓
  //   ligne 16 :  ↑ ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ←
  carre(10, 8, ALPHABET[0], 8, 1, 250, 1);

  while (true) {
    image();          // le tour est fini : le A reste au centre
  }
}
`,
    aVoir: 'Un A qui fait un tour en carré de 17 × 17 cases autour du milieu de l’écran, puis revient au centre.',
    controle: (c) => {
      const { A } = suivre(c, 'A', 1400)
      return [
        ['les quatre coins : (2, 0), (18, 0), (18, 16), (2, 16)', ['2,0', '18,0', '18,16', '2,16'].every((p) => A.includes(p))],
        ['jamais plus loin que la taille 8', !A.some((p) => { const [x, y] = p.split(',').map(Number); return x < 2 || x > 18 || y < 0 || y > 16 })],
        ['sens 1 : du coin, il va à DROITE', A[A.indexOf('2,0') + 1] === '3,0'],
        ['le A revient au centre (10, 8)', A.at(-1) === '10,8', ` (${A.at(-1)})`],
      ]
    },
  },

  {
    titre: 'Taille 8 : un carré de 17 × 17 — de base, ailleurs',
    difficulte: 0,
    suite: true,
    idee: 'Le carré du 0.41, avec une seule lettre, le B, autour d’une deuxième position : (8, 8).',
    texte: [
      '**C’est le carré du 0.41**, mêmes réglages (taille 8, sens 1, vitesse 250, 1 tour), avec deux changements qui vont ensemble : **une autre lettre** et **une autre position**.',
      '**La lettre :** `ALPHABET[1]`, la 2e lettre de l’alphabet, le **B** (on compte à partir de 0 : A = 0, B = 1).',
      '**La position : (8, 8)** au lieu de (10, 8). Un carré de taille 8 tient entier si son centre est à au moins 8 cases de chaque bord : la colonne entre 8 et 19 − 8 = 11, la ligne entre 8 et 17 − 8 = 9. (8, 8) respecte ces limites : le carré de 17 × 17 tient entier, des colonnes 0 à 16 et des lignes 0 à 16.',
      '**C’est la version de base** : une seule lettre, un seul carré. Le 0.41.2 mettra les deux carrés ensemble.',
    ],
    code: `int main() {
  // Le carré du 0.41, ailleurs et avec le B :
  //
  //   carre(8, 8, ALPHABET[1], 8, 1, 250, 1);
  //         |  |  |
  //         |  |  +-- ALPHABET[1] : la 2e lettre, B
  //         +--+----- le centre (8, 8) : le carré de taille 8
  //                   y tient entier (colonnes 0 à 16, lignes 0 à 16)
  //
  // Les autres réglages sont ceux du 0.41 : taille 8, sens 1, vitesse 250, tours 1.
  carre(8, 8, ALPHABET[1], 8, 1, 250, 1);

  while (true) {
    image();          // le B est revenu à son centre
  }
}
`,
    aVoir: 'Le même carré qu’au 0.41, mais fait par un B, autour de (8, 8).',
    controle: (c) => {
      const { B } = suivre(c, 'B', 1430)
      return [
        ['le B fait le tour autour de (8, 8) : coins (0, 0) et (16, 16)', B.includes('0,0') && B.includes('16,16')],
        ['le B revient à son centre (8, 8)', B.at(-1) === '8,8', ` (${B.at(-1)})`],
      ]
    },
  },

  {
    titre: 'Taille 8 : un carré de 17 × 17 — doublé, deux positions',
    difficulte: 0,
    suite: true,
    idee: 'Les deux carrés dans le même programme : le A autour de (10, 8), puis le B autour de (8, 8).',
    texte: [
      '**C’est le 0.41 et le 0.41.1 réunis :** deux lignes, deux lettres, deux positions.',
      '**Ce qui est nouveau ici : deux carrés dans le même programme.** Le A tourne autour de (10, 8), comme au 0.41 ; puis le B autour de (8, 8), comme au 0.41.1.',
      '**L’un après l’autre :** `carre` attend la fin de son carré avant de rendre la main. Le B ne commence que quand le A est revenu à son centre.',
      '**Les deux carrés se croisent** (taille 8 : 17 × 17 chacun). En passant sur une case, `carre` l’**efface** en la quittant : si le chemin du B passe sur le A arrêté, il l’efface. C’est normal : chaque lettre ne s’occupe que d’elle-même.',
    ],
    code: `int main() {
  // 1. Le A, autour de (10, 8) : le 0.41.
  carre(10, 8, ALPHABET[0], 8, 1, 250, 1);

  // 2. Le B, autour de (8, 8) : le 0.41.1.
  //    Il commence quand le A a fini : carre attend la fin de son carré.
  carre(8, 8, ALPHABET[1], 8, 1, 250, 1);

  while (true) {
    image();
  }
}
`,
    aVoir: 'Le A fait son carré autour de (10, 8), puis le B fait le même autour de (8, 8).',
    controle: (c) => {
      const { A, B } = suivre(c, 'AB', 2710)
      return [
        ['le A fait son tour autour de (10, 8) : coin (18, 16)', A.includes('18,16')],
        ['puis le B autour de (8, 8) : coin (0, 0)', B.includes('0,0')],
        ['le B revient à son centre (8, 8)', B.at(-1) === '8,8', ` (${B.at(-1)})`],
      ]
    },
  },

  {
    titre: 'Dans l’autre sens : sens -1',
    difficulte: 0,
    idee: 'Le carré de taille 2, avec un seul changement : le sens passe de 1 à -1. La lettre tourne dans l’autre sens.',
    texte: [
      '**On reprend le carré de taille 2 (le 0.35), avec un seul changement :** le 5e réglage, le **sens**, passe de `1` à `-1`.',
      '**Ce qui est nouveau ici : le sens.** `1` tourne comme les **aiguilles d’une montre** : droite, bas, gauche, haut. `-1` tourne dans **l’autre sens** : bas, droite, haut, gauche.',
      '**Le coin de départ ne change pas :** en haut à gauche. Seule la première direction change : avec `1`, la lettre part vers la **droite** ; avec `-1`, vers le **bas**.',
      '**-1 dans un octet** est rangé 255 : `carre` lit tout ce qui dépasse 127 comme « l’autre sens ».',
    ],
    code: `int main() {
  // Le carré de taille 2 (le 0.35), avec un seul changement : le sens, 1 → -1.
  //
  //   carre(10, 8, ALPHABET[0], 2, -1, 250, 1);
  //                                |
  //                                +-- sens : -1, dans l'autre sens (1 : comme les aiguilles)
  //
  // sens 1 (le 0.35) :      sens -1 (ici) :
  //
  //   → → → → ↓            ↓ ← ← ← ←
  //   ↑ . . . ↓            ↓ . . . ↑
  //   ↑ . A . ↓            ↓ . A . ↑
  //   ↑ . . . ↓            ↓ . . . ↑
  //   ↑ ← ← ← ←            → → → → ↑
  carre(10, 8, ALPHABET[0], 2, -1, 250, 1);

  while (true) {
    image();
  }
}
`,
    aVoir: 'Le carré de taille 2, mais la lettre part vers le bas et tourne dans l’autre sens.',
    controle: (c) => {
      const { A } = suivre(c, 'A', 450)
      return [
        ['les quatre coins : (8, 6), (12, 6), (12, 10), (8, 10)', ['8,6', '12,6', '12,10', '8,10'].every((p) => A.includes(p))],
        ['jamais plus loin que la taille 2', !A.some((p) => { const [x, y] = p.split(',').map(Number); return x < 8 || x > 12 || y < 6 || y > 10 })],
        ['sens -1 : du coin, il DESCEND', A[A.indexOf('8,6') + 1] === '8,7'],
        ['le A revient au centre (10, 8)', A.at(-1) === '10,8', ` (${A.at(-1)})`],
      ]
    },
  },

  {
    titre: 'Dans l’autre sens : sens -1 — de base, ailleurs',
    difficulte: 0,
    suite: true,
    idee: 'Le carré du 0.42, avec une seule lettre, le B, autour d’une deuxième position : (4, 4).',
    texte: [
      '**C’est le carré du 0.42**, mêmes réglages (taille 2, sens -1, vitesse 250, 1 tour), avec deux changements qui vont ensemble : **une autre lettre** et **une autre position**.',
      '**La lettre :** `ALPHABET[1]`, la 2e lettre de l’alphabet, le **B** (on compte à partir de 0 : A = 0, B = 1).',
      '**La position : (4, 4)** au lieu de (10, 8). Un carré de taille 2 tient entier si son centre est à au moins 2 cases de chaque bord : la colonne entre 2 et 19 − 2 = 17, la ligne entre 2 et 17 − 2 = 15. (4, 4) respecte ces limites : le carré de 5 × 5 tient entier, des colonnes 2 à 6 et des lignes 2 à 6.',
      '**C’est la version de base** : une seule lettre, un seul carré. Le 0.42.2 mettra les deux carrés ensemble.',
    ],
    code: `int main() {
  // Le carré du 0.42, ailleurs et avec le B :
  //
  //   carre(4, 4, ALPHABET[1], 2, -1, 250, 1);
  //         |  |  |
  //         |  |  +-- ALPHABET[1] : la 2e lettre, B
  //         +--+----- le centre (4, 4) : le carré de taille 2
  //                   y tient entier (colonnes 2 à 6, lignes 2 à 6)
  //
  // Les autres réglages sont ceux du 0.42 : taille 2, sens -1, vitesse 250, tours 1.
  carre(4, 4, ALPHABET[1], 2, -1, 250, 1);

  while (true) {
    image();          // le B est revenu à son centre
  }
}
`,
    aVoir: 'Le même carré qu’au 0.42, mais fait par un B, autour de (4, 4).',
    controle: (c) => {
      const { B } = suivre(c, 'B', 470)
      return [
        ['le B fait le tour autour de (4, 4) : coins (2, 2) et (6, 6)', B.includes('2,2') && B.includes('6,6')],
        ['le B revient à son centre (4, 4)', B.at(-1) === '4,4', ` (${B.at(-1)})`],
      ]
    },
  },

  {
    titre: 'Dans l’autre sens : sens -1 — doublé, deux positions',
    difficulte: 0,
    suite: true,
    idee: 'Les deux carrés dans le même programme : le A autour de (10, 8), puis le B autour de (4, 4).',
    texte: [
      '**C’est le 0.42 et le 0.42.1 réunis :** deux lignes, deux lettres, deux positions.',
      '**Ce qui est nouveau ici : deux carrés dans le même programme.** Le A tourne autour de (10, 8), comme au 0.42 ; puis le B autour de (4, 4), comme au 0.42.1.',
      '**L’un après l’autre :** `carre` attend la fin de son carré avant de rendre la main. Le B ne commence que quand le A est revenu à son centre.',
      '**Les deux carrés ne se touchent pas** : chacun a son coin de l’écran. À la fin, on voit les deux lettres, chacune à son centre.',
    ],
    code: `int main() {
  // 1. Le A, autour de (10, 8) : le 0.42.
  carre(10, 8, ALPHABET[0], 2, -1, 250, 1);

  // 2. Le B, autour de (4, 4) : le 0.42.1.
  //    Il commence quand le A a fini : carre attend la fin de son carré.
  carre(4, 4, ALPHABET[1], 2, -1, 250, 1);

  while (true) {
    image();
  }
}
`,
    aVoir: 'Le A fait son carré autour de (10, 8), puis le B fait le même autour de (4, 4).',
    controle: (c) => {
      const { A, B } = suivre(c, 'AB', 790)
      return [
        ['le A fait son tour autour de (10, 8) : coin (12, 10)', A.includes('12,10')],
        ['puis le B autour de (4, 4) : coin (2, 2)', B.includes('2,2')],
        ['le B revient à son centre (4, 4)', B.at(-1) === '4,4', ` (${B.at(-1)})`],
      ]
    },
  },

  {
    titre: 'Plus lentement : vitesse 500',
    difficulte: 0,
    idee: 'Le carré de taille 2, avec un seul changement : la vitesse passe de 250 à 500 millisecondes par pas. Deux fois plus lent.',
    texte: [
      '**On reprend le carré de taille 2 (le 0.35), avec un seul changement :** le 6e réglage, la **vitesse**, passe de `250` à `500`.',
      '**Ce qui est nouveau ici : la vitesse 500.** C’est le temps d’**un pas**, en **millisecondes** (millièmes de seconde). `500` : un pas toutes les demi-secondes, **2 pas par seconde**. C’est **deux fois plus lent** que 250.',
      '**Plus le nombre est petit, plus ça va vite**, puisque c’est le temps d’attente entre deux pas. 500 ms, c’est 30 images de la console (elle en montre 60 par seconde).',
      '**Elle s’écrit en clair** (`500`, pas une variable) : le compilateur la traduit en images avant le jeu, comme `ms(500)`.',
    ],
    code: `int main() {
  // Le carré de taille 2 (le 0.35), avec un seul changement : la vitesse, 250 → 500.
  //
  //   carre(10, 8, ALPHABET[0], 2, 1, 500, 1);
  //                                   |
  //                                   +-- vitesse : 500 ms par pas (30 images)
  //                                       500 → 2 pas par seconde ; 250 → 4 (le 0.35)
  //
  carre(10, 8, ALPHABET[0], 2, 1, 500, 1);

  while (true) {
    image();
  }
}
`,
    aVoir: 'Le carré de taille 2, deux fois plus lentement.',
    controle: (c) => {
      /* Un pas dure 30 images (500 ms) (on accepte une image de plus, par prudence). */
      const ecarts = []
      let avant = [...Array(18).keys()].map((l) => c.mot(0, l, 20)).join()
      let depuis = 0
      for (let k = 0; k < 680; k++) {
        c.avancer(1)
        depuis++
        const ici = [...Array(18).keys()].map((l) => c.mot(0, l, 20)).join()
        if (ici !== avant) { ecarts.push(depuis); depuis = 0; avant = ici }
      }
      const bons = ecarts.filter((e) => e === 30 || e === 31).length
      return [['un pas toutes les 30 ou 31 images (500 ms)', bons >= 5, ` (${ecarts.slice(0, 8).join(' ')}…)`]]
    },
  },

  {
    titre: 'Plus lentement : vitesse 500 — de base, ailleurs',
    difficulte: 0,
    suite: true,
    idee: 'Le carré du 0.43, avec une seule lettre, le B, autour d’une deuxième position : (4, 4).',
    texte: [
      '**C’est le carré du 0.43**, mêmes réglages (taille 2, sens 1, vitesse 500, 1 tour), avec deux changements qui vont ensemble : **une autre lettre** et **une autre position**.',
      '**La lettre :** `ALPHABET[1]`, la 2e lettre de l’alphabet, le **B** (on compte à partir de 0 : A = 0, B = 1).',
      '**La position : (4, 4)** au lieu de (10, 8). Un carré de taille 2 tient entier si son centre est à au moins 2 cases de chaque bord : la colonne entre 2 et 19 − 2 = 17, la ligne entre 2 et 17 − 2 = 15. (4, 4) respecte ces limites : le carré de 5 × 5 tient entier, des colonnes 2 à 6 et des lignes 2 à 6.',
      '**C’est la version de base** : une seule lettre, un seul carré. Le 0.43.2 mettra les deux carrés ensemble.',
    ],
    code: `int main() {
  // Le carré du 0.43, ailleurs et avec le B :
  //
  //   carre(4, 4, ALPHABET[1], 2, 1, 500, 1);
  //         |  |  |
  //         |  |  +-- ALPHABET[1] : la 2e lettre, B
  //         +--+----- le centre (4, 4) : le carré de taille 2
  //                   y tient entier (colonnes 2 à 6, lignes 2 à 6)
  //
  // Les autres réglages sont ceux du 0.43 : taille 2, sens 1, vitesse 500, tours 1.
  carre(4, 4, ALPHABET[1], 2, 1, 500, 1);

  while (true) {
    image();          // le B est revenu à son centre
  }
}
`,
    aVoir: 'Le même carré qu’au 0.43, mais fait par un B, autour de (4, 4).',
    controle: (c) => {
      const { B } = suivre(c, 'B', 770)
      return [
        ['le B fait le tour autour de (4, 4) : coins (2, 2) et (6, 6)', B.includes('2,2') && B.includes('6,6')],
        ['le B revient à son centre (4, 4)', B.at(-1) === '4,4', ` (${B.at(-1)})`],
      ]
    },
  },

  {
    titre: 'Plus lentement : vitesse 500 — doublé, deux positions',
    difficulte: 0,
    suite: true,
    idee: 'Les deux carrés dans le même programme : le A autour de (10, 8), puis le B autour de (4, 4).',
    texte: [
      '**C’est le 0.43 et le 0.43.1 réunis :** deux lignes, deux lettres, deux positions.',
      '**Ce qui est nouveau ici : deux carrés dans le même programme.** Le A tourne autour de (10, 8), comme au 0.43 ; puis le B autour de (4, 4), comme au 0.43.1.',
      '**L’un après l’autre :** `carre` attend la fin de son carré avant de rendre la main. Le B ne commence que quand le A est revenu à son centre.',
      '**Les deux carrés ne se touchent pas** : chacun a son coin de l’écran. À la fin, on voit les deux lettres, chacune à son centre.',
    ],
    code: `int main() {
  // 1. Le A, autour de (10, 8) : le 0.43.
  carre(10, 8, ALPHABET[0], 2, 1, 500, 1);

  // 2. Le B, autour de (4, 4) : le 0.43.1.
  //    Il commence quand le A a fini : carre attend la fin de son carré.
  carre(4, 4, ALPHABET[1], 2, 1, 500, 1);

  while (true) {
    image();
  }
}
`,
    aVoir: 'Le A fait son carré autour de (10, 8), puis le B fait le même autour de (4, 4).',
    controle: (c) => {
      const { A, B } = suivre(c, 'AB', 1390)
      return [
        ['le A fait son tour autour de (10, 8) : coin (12, 10)', A.includes('12,10')],
        ['puis le B autour de (4, 4) : coin (2, 2)', B.includes('2,2')],
        ['le B revient à son centre (4, 4)', B.at(-1) === '4,4', ` (${B.at(-1)})`],
      ]
    },
  },

  {
    titre: 'Plus vite : vitesse 100',
    difficulte: 0,
    idee: 'Le carré de taille 2, avec un seul changement : la vitesse passe de 250 à 100 millisecondes par pas. Deux fois et demie plus vite.',
    texte: [
      '**On reprend le carré de taille 2 (le 0.35), avec un seul changement :** le 6e réglage, la **vitesse**, passe de `250` à `100`.',
      '**Ce qui est nouveau ici : la vitesse 100.** C’est le temps d’**un pas**, en **millisecondes** (millièmes de seconde). `100` : un pas tous les dixièmes de seconde, **10 pas par seconde**. C’est **deux fois et demie plus vite** que 250.',
      '**Plus le nombre est petit, plus ça va vite**, puisque c’est le temps d’attente entre deux pas. 100 ms, c’est 6 images de la console (elle en montre 60 par seconde).',
      '**Elle s’écrit en clair** (`100`, pas une variable) : le compilateur la traduit en images avant le jeu, comme `ms(100)`.',
    ],
    code: `int main() {
  // Le carré de taille 2 (le 0.35), avec un seul changement : la vitesse, 250 → 100.
  //
  //   carre(10, 8, ALPHABET[0], 2, 1, 100, 1);
  //                                   |
  //                                   +-- vitesse : 100 ms par pas (6 images)
  //                                       100 → 10 pas par seconde ; 250 → 4 (le 0.35)
  //
  carre(10, 8, ALPHABET[0], 2, 1, 100, 1);

  while (true) {
    image();
  }
}
`,
    aVoir: 'Le carré de taille 2, deux fois et demie plus vite.',
    controle: (c) => {
      /* Un pas dure 6 images (100 ms) (on accepte une image de plus, par prudence). */
      const ecarts = []
      let avant = [...Array(18).keys()].map((l) => c.mot(0, l, 20)).join()
      let depuis = 0
      for (let k = 0; k < 200; k++) {
        c.avancer(1)
        depuis++
        const ici = [...Array(18).keys()].map((l) => c.mot(0, l, 20)).join()
        if (ici !== avant) { ecarts.push(depuis); depuis = 0; avant = ici }
      }
      const bons = ecarts.filter((e) => e === 6 || e === 7).length
      return [['un pas toutes les 6 ou 7 images (100 ms)', bons >= 5, ` (${ecarts.slice(0, 8).join(' ')}…)`]]
    },
  },

  {
    titre: 'Plus vite : vitesse 100 — de base, ailleurs',
    difficulte: 0,
    suite: true,
    idee: 'Le carré du 0.44, avec une seule lettre, le B, autour d’une deuxième position : (4, 4).',
    texte: [
      '**C’est le carré du 0.44**, mêmes réglages (taille 2, sens 1, vitesse 100, 1 tour), avec deux changements qui vont ensemble : **une autre lettre** et **une autre position**.',
      '**La lettre :** `ALPHABET[1]`, la 2e lettre de l’alphabet, le **B** (on compte à partir de 0 : A = 0, B = 1).',
      '**La position : (4, 4)** au lieu de (10, 8). Un carré de taille 2 tient entier si son centre est à au moins 2 cases de chaque bord : la colonne entre 2 et 19 − 2 = 17, la ligne entre 2 et 17 − 2 = 15. (4, 4) respecte ces limites : le carré de 5 × 5 tient entier, des colonnes 2 à 6 et des lignes 2 à 6.',
      '**C’est la version de base** : une seule lettre, un seul carré. Le 0.44.2 mettra les deux carrés ensemble.',
    ],
    code: `int main() {
  // Le carré du 0.44, ailleurs et avec le B :
  //
  //   carre(4, 4, ALPHABET[1], 2, 1, 100, 1);
  //         |  |  |
  //         |  |  +-- ALPHABET[1] : la 2e lettre, B
  //         +--+----- le centre (4, 4) : le carré de taille 2
  //                   y tient entier (colonnes 2 à 6, lignes 2 à 6)
  //
  // Les autres réglages sont ceux du 0.44 : taille 2, sens 1, vitesse 100, tours 1.
  carre(4, 4, ALPHABET[1], 2, 1, 100, 1);

  while (true) {
    image();          // le B est revenu à son centre
  }
}
`,
    aVoir: 'Le même carré qu’au 0.44, mais fait par un B, autour de (4, 4).',
    controle: (c) => {
      const { B } = suivre(c, 'B', 290)
      return [
        ['le B fait le tour autour de (4, 4) : coins (2, 2) et (6, 6)', B.includes('2,2') && B.includes('6,6')],
        ['le B revient à son centre (4, 4)', B.at(-1) === '4,4', ` (${B.at(-1)})`],
      ]
    },
  },

  {
    titre: 'Plus vite : vitesse 100 — doublé, deux positions',
    difficulte: 0,
    suite: true,
    idee: 'Les deux carrés dans le même programme : le A autour de (10, 8), puis le B autour de (4, 4).',
    texte: [
      '**C’est le 0.44 et le 0.44.1 réunis :** deux lignes, deux lettres, deux positions.',
      '**Ce qui est nouveau ici : deux carrés dans le même programme.** Le A tourne autour de (10, 8), comme au 0.44 ; puis le B autour de (4, 4), comme au 0.44.1.',
      '**L’un après l’autre :** `carre` attend la fin de son carré avant de rendre la main. Le B ne commence que quand le A est revenu à son centre.',
      '**Les deux carrés ne se touchent pas** : chacun a son coin de l’écran. À la fin, on voit les deux lettres, chacune à son centre.',
    ],
    code: `int main() {
  // 1. Le A, autour de (10, 8) : le 0.44.
  carre(10, 8, ALPHABET[0], 2, 1, 100, 1);

  // 2. Le B, autour de (4, 4) : le 0.44.1.
  //    Il commence quand le A a fini : carre attend la fin de son carré.
  carre(4, 4, ALPHABET[1], 2, 1, 100, 1);

  while (true) {
    image();
  }
}
`,
    aVoir: 'Le A fait son carré autour de (10, 8), puis le B fait le même autour de (4, 4).',
    controle: (c) => {
      const { A, B } = suivre(c, 'AB', 430)
      return [
        ['le A fait son tour autour de (10, 8) : coin (12, 10)', A.includes('12,10')],
        ['puis le B autour de (4, 4) : coin (2, 2)', B.includes('2,2')],
        ['le B revient à son centre (4, 4)', B.at(-1) === '4,4', ` (${B.at(-1)})`],
      ]
    },
  },

  {
    titre: 'Très vite : vitesse 50',
    difficulte: 0,
    idee: 'Le carré de taille 2, avec un seul changement : la vitesse passe de 250 à 50 millisecondes par pas. Cinq fois plus vite.',
    texte: [
      '**On reprend le carré de taille 2 (le 0.35), avec un seul changement :** le 6e réglage, la **vitesse**, passe de `250` à `50`.',
      '**Ce qui est nouveau ici : la vitesse 50.** C’est le temps d’**un pas**, en **millisecondes** (millièmes de seconde). `50` : un pas tous les vingtièmes de seconde, **20 pas par seconde**. C’est **cinq fois plus vite** que 250 : l’œil a du mal à suivre.',
      '**Plus le nombre est petit, plus ça va vite**, puisque c’est le temps d’attente entre deux pas. 50 ms, c’est 3 images de la console (elle en montre 60 par seconde).',
      '**Elle s’écrit en clair** (`50`, pas une variable) : le compilateur la traduit en images avant le jeu, comme `ms(50)`.',
    ],
    code: `int main() {
  // Le carré de taille 2 (le 0.35), avec un seul changement : la vitesse, 250 → 50.
  //
  //   carre(10, 8, ALPHABET[0], 2, 1, 50, 1);
  //                                   |
  //                                   +-- vitesse : 50 ms par pas (3 images)
  //                                       50 → 20 pas par seconde ; 250 → 4 (le 0.35)
  //
  carre(10, 8, ALPHABET[0], 2, 1, 50, 1);

  while (true) {
    image();
  }
}
`,
    aVoir: 'Le carré de taille 2, cinq fois plus vite : la lettre file.',
    controle: (c) => {
      /* Un pas dure 3 images (50 ms) (on accepte une image de plus, par prudence). */
      const ecarts = []
      let avant = [...Array(18).keys()].map((l) => c.mot(0, l, 20)).join()
      let depuis = 0
      for (let k = 0; k < 140; k++) {
        c.avancer(1)
        depuis++
        const ici = [...Array(18).keys()].map((l) => c.mot(0, l, 20)).join()
        if (ici !== avant) { ecarts.push(depuis); depuis = 0; avant = ici }
      }
      const bons = ecarts.filter((e) => e === 3 || e === 4).length
      return [['un pas toutes les 3 ou 4 images (50 ms)', bons >= 5, ` (${ecarts.slice(0, 8).join(' ')}…)`]]
    },
  },

  {
    titre: 'Très vite : vitesse 50 — de base, ailleurs',
    difficulte: 0,
    suite: true,
    idee: 'Le carré du 0.45, avec une seule lettre, le B, autour d’une deuxième position : (4, 4).',
    texte: [
      '**C’est le carré du 0.45**, mêmes réglages (taille 2, sens 1, vitesse 50, 1 tour), avec deux changements qui vont ensemble : **une autre lettre** et **une autre position**.',
      '**La lettre :** `ALPHABET[1]`, la 2e lettre de l’alphabet, le **B** (on compte à partir de 0 : A = 0, B = 1).',
      '**La position : (4, 4)** au lieu de (10, 8). Un carré de taille 2 tient entier si son centre est à au moins 2 cases de chaque bord : la colonne entre 2 et 19 − 2 = 17, la ligne entre 2 et 17 − 2 = 15. (4, 4) respecte ces limites : le carré de 5 × 5 tient entier, des colonnes 2 à 6 et des lignes 2 à 6.',
      '**C’est la version de base** : une seule lettre, un seul carré. Le 0.45.2 mettra les deux carrés ensemble.',
    ],
    code: `int main() {
  // Le carré du 0.45, ailleurs et avec le B :
  //
  //   carre(4, 4, ALPHABET[1], 2, 1, 50, 1);
  //         |  |  |
  //         |  |  +-- ALPHABET[1] : la 2e lettre, B
  //         +--+----- le centre (4, 4) : le carré de taille 2
  //                   y tient entier (colonnes 2 à 6, lignes 2 à 6)
  //
  // Les autres réglages sont ceux du 0.45 : taille 2, sens 1, vitesse 50, tours 1.
  carre(4, 4, ALPHABET[1], 2, 1, 50, 1);

  while (true) {
    image();          // le B est revenu à son centre
  }
}
`,
    aVoir: 'Le même carré qu’au 0.45, mais fait par un B, autour de (4, 4).',
    controle: (c) => {
      const { B } = suivre(c, 'B', 230)
      return [
        ['le B fait le tour autour de (4, 4) : coins (2, 2) et (6, 6)', B.includes('2,2') && B.includes('6,6')],
        ['le B revient à son centre (4, 4)', B.at(-1) === '4,4', ` (${B.at(-1)})`],
      ]
    },
  },

  {
    titre: 'Très vite : vitesse 50 — doublé, deux positions',
    difficulte: 0,
    suite: true,
    idee: 'Les deux carrés dans le même programme : le A autour de (10, 8), puis le B autour de (4, 4).',
    texte: [
      '**C’est le 0.45 et le 0.45.1 réunis :** deux lignes, deux lettres, deux positions.',
      '**Ce qui est nouveau ici : deux carrés dans le même programme.** Le A tourne autour de (10, 8), comme au 0.45 ; puis le B autour de (4, 4), comme au 0.45.1.',
      '**L’un après l’autre :** `carre` attend la fin de son carré avant de rendre la main. Le B ne commence que quand le A est revenu à son centre.',
      '**Les deux carrés ne se touchent pas** : chacun a son coin de l’écran. À la fin, on voit les deux lettres, chacune à son centre.',
    ],
    code: `int main() {
  // 1. Le A, autour de (10, 8) : le 0.45.
  carre(10, 8, ALPHABET[0], 2, 1, 50, 1);

  // 2. Le B, autour de (4, 4) : le 0.45.1.
  //    Il commence quand le A a fini : carre attend la fin de son carré.
  carre(4, 4, ALPHABET[1], 2, 1, 50, 1);

  while (true) {
    image();
  }
}
`,
    aVoir: 'Le A fait son carré autour de (10, 8), puis le B fait le même autour de (4, 4).',
    controle: (c) => {
      const { A, B } = suivre(c, 'AB', 310)
      return [
        ['le A fait son tour autour de (10, 8) : coin (12, 10)', A.includes('12,10')],
        ['puis le B autour de (4, 4) : coin (2, 2)', B.includes('2,2')],
        ['le B revient à son centre (4, 4)', B.at(-1) === '4,4', ` (${B.at(-1)})`],
      ]
    },
  },

  {
    titre: 'Deux tours',
    difficulte: 0,
    idee: 'Le carré de taille 2, avec un seul changement : 2 tours au lieu d’un, avant de revenir au centre.',
    texte: [
      '**On reprend le carré de taille 2 (le 0.35), avec un seul changement :** le 7e et dernier réglage, les **tours**, passe de `1` à `2`.',
      '**Ce qui est nouveau ici : 2 tours.** La lettre va au coin, fait **2 fois** le tour du carré d’affilée, puis revient au centre.',
      '**On le voit au coin en bas à droite** (12, 10) : la lettre y passe 2 fois.',
    ],
    code: `int main() {
  // Le carré de taille 2 (le 0.35), avec un seul changement : les tours, 1 → 2.
  //
  //   carre(10, 8, ALPHABET[0], 2, 1, 250, 2);
  //                                        |
  //                                        +-- tours : 2, le tour 2 fois d'affilée
  //
  carre(10, 8, ALPHABET[0], 2, 1, 250, 2);

  while (true) {
    image();
  }
}
`,
    aVoir: 'Le carré de taille 2, fait 2 fois d’affilée avant le retour au centre.',
    controle: (c) => {
      const { A } = suivre(c, 'A', 840)
      return [
        ['les quatre coins : (8, 6), (12, 6), (12, 10), (8, 10)', ['8,6', '12,6', '12,10', '8,10'].every((p) => A.includes(p))],
        ['jamais plus loin que la taille 2', !A.some((p) => { const [x, y] = p.split(',').map(Number); return x < 8 || x > 12 || y < 6 || y > 10 })],
        ['sens 1 : du coin, il va à DROITE', A[A.indexOf('8,6') + 1] === '9,6'],
        ['2 passages au coin (12, 10)', A.filter((p) => p === '12,10').length === 2, ` (${A.filter((p) => p === '12,10').length})`],
        ['le A revient au centre (10, 8)', A.at(-1) === '10,8', ` (${A.at(-1)})`],
      ]
    },
  },

  {
    titre: 'Deux tours — de base, ailleurs',
    difficulte: 0,
    suite: true,
    idee: 'Le carré du 0.46, avec une seule lettre, le B, autour d’une deuxième position : (4, 4).',
    texte: [
      '**C’est le carré du 0.46**, mêmes réglages (taille 2, sens 1, vitesse 250, 2 tours), avec deux changements qui vont ensemble : **une autre lettre** et **une autre position**.',
      '**La lettre :** `ALPHABET[1]`, la 2e lettre de l’alphabet, le **B** (on compte à partir de 0 : A = 0, B = 1).',
      '**La position : (4, 4)** au lieu de (10, 8). Un carré de taille 2 tient entier si son centre est à au moins 2 cases de chaque bord : la colonne entre 2 et 19 − 2 = 17, la ligne entre 2 et 17 − 2 = 15. (4, 4) respecte ces limites : le carré de 5 × 5 tient entier, des colonnes 2 à 6 et des lignes 2 à 6.',
      '**C’est la version de base** : une seule lettre, un seul carré. Le 0.46.2 mettra les deux carrés ensemble.',
    ],
    code: `int main() {
  // Le carré du 0.46, ailleurs et avec le B :
  //
  //   carre(4, 4, ALPHABET[1], 2, 1, 250, 2);
  //         |  |  |
  //         |  |  +-- ALPHABET[1] : la 2e lettre, B
  //         +--+----- le centre (4, 4) : le carré de taille 2
  //                   y tient entier (colonnes 2 à 6, lignes 2 à 6)
  //
  // Les autres réglages sont ceux du 0.46 : taille 2, sens 1, vitesse 250, tours 2.
  carre(4, 4, ALPHABET[1], 2, 1, 250, 2);

  while (true) {
    image();          // le B est revenu à son centre
  }
}
`,
    aVoir: 'Le même carré qu’au 0.46, mais fait par un B, autour de (4, 4).',
    controle: (c) => {
      const { B } = suivre(c, 'B', 726)
      return [
        ['le B fait le tour autour de (4, 4) : coins (2, 2) et (6, 6)', B.includes('2,2') && B.includes('6,6')],
        ['le B revient à son centre (4, 4)', B.at(-1) === '4,4', ` (${B.at(-1)})`],
      ]
    },
  },

  {
    titre: 'Deux tours — doublé, deux positions',
    difficulte: 0,
    suite: true,
    idee: 'Les deux carrés dans le même programme : le A autour de (10, 8), puis le B autour de (4, 4).',
    texte: [
      '**C’est le 0.46 et le 0.46.1 réunis :** deux lignes, deux lettres, deux positions.',
      '**Ce qui est nouveau ici : deux carrés dans le même programme.** Le A tourne autour de (10, 8), comme au 0.46 ; puis le B autour de (4, 4), comme au 0.46.1.',
      '**L’un après l’autre :** `carre` attend la fin de son carré avant de rendre la main. Le B ne commence que quand le A est revenu à son centre.',
      '**Les deux carrés ne se touchent pas** : chacun a son coin de l’écran. À la fin, on voit les deux lettres, chacune à son centre.',
    ],
    code: `int main() {
  // 1. Le A, autour de (10, 8) : le 0.46.
  carre(10, 8, ALPHABET[0], 2, 1, 250, 2);

  // 2. Le B, autour de (4, 4) : le 0.46.1.
  //    Il commence quand le A a fini : carre attend la fin de son carré.
  carre(4, 4, ALPHABET[1], 2, 1, 250, 2);

  while (true) {
    image();
  }
}
`,
    aVoir: 'Le A fait son carré autour de (10, 8), puis le B fait le même autour de (4, 4).',
    controle: (c) => {
      const { A, B } = suivre(c, 'AB', 1302)
      return [
        ['le A fait son tour autour de (10, 8) : coin (12, 10)', A.includes('12,10')],
        ['puis le B autour de (4, 4) : coin (2, 2)', B.includes('2,2')],
        ['le B revient à son centre (4, 4)', B.at(-1) === '4,4', ` (${B.at(-1)})`],
      ]
    },
  },

  {
    titre: 'Trois tours',
    difficulte: 0,
    idee: 'Le carré de taille 2, avec un seul changement : 3 tours au lieu d’un, avant de revenir au centre.',
    texte: [
      '**On reprend le carré de taille 2 (le 0.35), avec un seul changement :** le 7e et dernier réglage, les **tours**, passe de `1` à `3`.',
      '**Ce qui est nouveau ici : 3 tours.** La lettre va au coin, fait **3 fois** le tour du carré d’affilée, puis revient au centre.',
      '**On le voit au coin en bas à droite** (12, 10) : la lettre y passe 3 fois.',
    ],
    code: `int main() {
  // Le carré de taille 2 (le 0.35), avec un seul changement : les tours, 1 → 3.
  //
  //   carre(10, 8, ALPHABET[0], 2, 1, 250, 3);
  //                                        |
  //                                        +-- tours : 3, le tour 3 fois d'affilée
  //
  carre(10, 8, ALPHABET[0], 2, 1, 250, 3);

  while (true) {
    image();
  }
}
`,
    aVoir: 'Le carré de taille 2, fait 3 fois d’affilée avant le retour au centre.',
    controle: (c) => {
      const { A } = suivre(c, 'A', 1160)
      return [
        ['les quatre coins : (8, 6), (12, 6), (12, 10), (8, 10)', ['8,6', '12,6', '12,10', '8,10'].every((p) => A.includes(p))],
        ['jamais plus loin que la taille 2', !A.some((p) => { const [x, y] = p.split(',').map(Number); return x < 8 || x > 12 || y < 6 || y > 10 })],
        ['sens 1 : du coin, il va à DROITE', A[A.indexOf('8,6') + 1] === '9,6'],
        ['3 passages au coin (12, 10)', A.filter((p) => p === '12,10').length === 3, ` (${A.filter((p) => p === '12,10').length})`],
        ['le A revient au centre (10, 8)', A.at(-1) === '10,8', ` (${A.at(-1)})`],
      ]
    },
  },

  {
    titre: 'Trois tours — de base, ailleurs',
    difficulte: 0,
    suite: true,
    idee: 'Le carré du 0.47, avec une seule lettre, le B, autour d’une deuxième position : (4, 4).',
    texte: [
      '**C’est le carré du 0.47**, mêmes réglages (taille 2, sens 1, vitesse 250, 3 tours), avec deux changements qui vont ensemble : **une autre lettre** et **une autre position**.',
      '**La lettre :** `ALPHABET[1]`, la 2e lettre de l’alphabet, le **B** (on compte à partir de 0 : A = 0, B = 1).',
      '**La position : (4, 4)** au lieu de (10, 8). Un carré de taille 2 tient entier si son centre est à au moins 2 cases de chaque bord : la colonne entre 2 et 19 − 2 = 17, la ligne entre 2 et 17 − 2 = 15. (4, 4) respecte ces limites : le carré de 5 × 5 tient entier, des colonnes 2 à 6 et des lignes 2 à 6.',
      '**C’est la version de base** : une seule lettre, un seul carré. Le 0.47.2 mettra les deux carrés ensemble.',
    ],
    code: `int main() {
  // Le carré du 0.47, ailleurs et avec le B :
  //
  //   carre(4, 4, ALPHABET[1], 2, 1, 250, 3);
  //         |  |  |
  //         |  |  +-- ALPHABET[1] : la 2e lettre, B
  //         +--+----- le centre (4, 4) : le carré de taille 2
  //                   y tient entier (colonnes 2 à 6, lignes 2 à 6)
  //
  // Les autres réglages sont ceux du 0.47 : taille 2, sens 1, vitesse 250, tours 3.
  carre(4, 4, ALPHABET[1], 2, 1, 250, 3);

  while (true) {
    image();          // le B est revenu à son centre
  }
}
`,
    aVoir: 'Le même carré qu’au 0.47, mais fait par un B, autour de (4, 4).',
    controle: (c) => {
      const { B } = suivre(c, 'B', 982)
      return [
        ['le B fait le tour autour de (4, 4) : coins (2, 2) et (6, 6)', B.includes('2,2') && B.includes('6,6')],
        ['le B revient à son centre (4, 4)', B.at(-1) === '4,4', ` (${B.at(-1)})`],
      ]
    },
  },

  {
    titre: 'Trois tours — doublé, deux positions',
    difficulte: 0,
    suite: true,
    idee: 'Les deux carrés dans le même programme : le A autour de (10, 8), puis le B autour de (4, 4).',
    texte: [
      '**C’est le 0.47 et le 0.47.1 réunis :** deux lignes, deux lettres, deux positions.',
      '**Ce qui est nouveau ici : deux carrés dans le même programme.** Le A tourne autour de (10, 8), comme au 0.47 ; puis le B autour de (4, 4), comme au 0.47.1.',
      '**L’un après l’autre :** `carre` attend la fin de son carré avant de rendre la main. Le B ne commence que quand le A est revenu à son centre.',
      '**Les deux carrés ne se touchent pas** : chacun a son coin de l’écran. À la fin, on voit les deux lettres, chacune à son centre.',
    ],
    code: `int main() {
  // 1. Le A, autour de (10, 8) : le 0.47.
  carre(10, 8, ALPHABET[0], 2, 1, 250, 3);

  // 2. Le B, autour de (4, 4) : le 0.47.1.
  //    Il commence quand le A a fini : carre attend la fin de son carré.
  carre(4, 4, ALPHABET[1], 2, 1, 250, 3);

  while (true) {
    image();
  }
}
`,
    aVoir: 'Le A fait son carré autour de (10, 8), puis le B fait le même autour de (4, 4).',
    controle: (c) => {
      const { A, B } = suivre(c, 'AB', 1814)
      return [
        ['le A fait son tour autour de (10, 8) : coin (12, 10)', A.includes('12,10')],
        ['puis le B autour de (4, 4) : coin (2, 2)', B.includes('2,2')],
        ['le B revient à son centre (4, 4)', B.at(-1) === '4,4', ` (${B.at(-1)})`],
      ]
    },
  },

  {
    titre: 'Les réglages sous un nom : Carre',
    difficulte: 0,
    idee: 'Carre ronde = { … }; range les sept réglages sous un nom, en haut du programme ; carre(ronde); s’en sert.',
    texte: [
      '**Sept nombres à la suite se lisent mal** : lequel est la taille, lequel la vitesse ? On les range donc **sous un nom**, en haut du programme, comme `Mot` au chapitre 1.',
      '**Ce qui est nouveau ici :** le type **`Carre`**. `Carre ronde = { 10, 8, ALPHABET[0], 2, 1, 250, 2 };` range les sept réglages, **dans le même ordre** que `carre(…)`, sous le nom `ronde`.',
      '**`carre(ronde);`** fait le carré avec ces réglages. Le compilateur remplace `carre(ronde)` par `carre(10, 8, ALPHABET[0], 2, 1, 250, 2)` : rien n’est rangé en mémoire, c’est gratuit.',
      '**L’avantage :** pour changer le carré, on ne touche qu’à la ligne du haut, où chaque réglage a son titre au-dessus. Le programme, lui, ne dit plus que « fais le carré ronde ».',
      '**Il faut les sept réglages**, ni plus ni moins. Il en manque un ? Le compilateur le dit, et donne un exemple complet.',
    ],
    code: `// Carre : un type pour ranger les sept réglages d'un carré sous UN nom,
// comme Mot range la place et le texte d'un mot (chapitre 1).
//
//   Carre  ronde  =  { 10, 8, ALPHABET[0], 2, 1, 250, 2 };
//   |      |          |
//   |      |          +-- les sept réglages, DANS LE MÊME ORDRE que carre(…),
//   |      |              entre accolades { }, séparés par des virgules
//   |      +------------- le nom qu'on choisit : ronde
//   +-------------------- le type : Carre (avec une majuscule)
//
//               x   y  tuile        taille  sens  vitesse  tours
Carre ronde = { 10,  8, ALPHABET[0], 2,      1,    250,     2 };
// autour de (10, 8), la lettre A, 5 × 5, sens des aiguilles, 250 ms par pas, 2 tours

int main() {
  // carre(ronde) veut dire : « fais le carré avec les réglages de ronde ».
  // Le compilateur la remplace par carre(10, 8, ALPHABET[0], 2, 1, 250, 2) :
  // c'est exactement le même programme, mais plus facile à lire.
  carre(ronde);

  // Pour changer le carré, on ne touche QUE la ligne de « ronde », en haut :
  // chaque réglage a son titre juste au-dessus.
  while (true) {
    image();          // attend l'image suivante (60 par seconde)
  }
}
`,
    aVoir: 'Un A qui fait deux tours de 5 × 5 autour de (10, 8), et revient au centre.',
    controle: (c) => {
      const chemin = []
      for (let k = 0; k < 700; k++) {
        c.avancer(1)
        for (let l = 0; l < 18; l++) {
          const i = c.mot(0, l, 20).indexOf('A')
          if (i >= 0 && chemin.at(-1) !== i + ',' + l) chemin.push(i + ',' + l)
        }
      }
      const fois = chemin.filter((p) => p === '12,6').length
      return [
        ['deux tours de 5 × 5 : deux passages au coin (12, 6)', fois === 2, ` (${fois})`],
        ['le A revient au centre (10, 8)', chemin.at(-1) === '10,8', ` (${chemin.at(-1)})`],
      ]
    },
  },

  {
    titre: 'Les réglages sous un nom : Carre — de base, ailleurs',
    difficulte: 0,
    suite: true,
    idee: 'Un deuxième Carre, « coin », rangé sous son nom : le B autour de (4, 4).',
    texte: [
      '**C’est le 0.48**, avec un **autre** `Carre`, nommé `coin` : le B autour de (4, 4).',
      '**C’est la version de base** : la deuxième place, seule. Le 0.48.2 met les deux ensemble.',
    ],
    code: `//              x  y  tuile        taille  sens  vitesse  tours
Carre coin = {  4, 4, ALPHABET[1], 2,      1,    250,     2 };

int main() {
  carre(coin);       // le carré, avec les réglages de « coin »

  while (true) {
    image();
  }
}
`,
    aVoir: 'Le B fait deux tours de 5 × 5 autour de (4, 4).',
    controle: (c) => {
      const { B } = suivre(c, 'B', 700, 18)
      return [
        ['le B passe par (6, 6)', B.includes('6,6')],
        ['le B finit en (4, 4)', B.at(-1) === '4,4', ` (${B.at(-1)})`],
      ]
    },
  },

  {
    titre: 'Les réglages sous un nom : Carre — doublé, deux positions',
    difficulte: 0,
    suite: true,
    idee: 'Deux Carre, deux noms : ronde et coin.',
    texte: [
      '**C’est le 0.48 et le 0.48.1 réunis** : deux `Carre`, chacun avec son nom.',
      '**Chaque nom range ses sept réglages :** `carre(ronde)` et `carre(coin)` ne se mélangent pas.',
    ],
    code: `//               x   y  tuile        taille  sens  vitesse  tours
Carre ronde = { 10,  8, ALPHABET[0], 2,      1,    250,     2 };
Carre coin  = {  4,  4, ALPHABET[1], 2,      1,    250,     2 };

int main() {
  carre(ronde);      // le A, autour de (10, 8)
  carre(coin);       // puis le B, autour de (4, 4)

  while (true) {
    image();
  }
}
`,
    aVoir: 'Le A fait deux tours autour de (10, 8), puis le B autour de (4, 4).',
    controle: (c) => {
      const { A, B } = suivre(c, 'AB', 1300, 18)
      return [
        ['le A finit en (10, 8)', A.at(-1) === '10,8', ` (${A.at(-1)})`],
        ['le B finit en (4, 4)', B.at(-1) === '4,4', ` (${B.at(-1)})`],
      ]
    },
  },
  {
    titre: 'De plus en plus grand : 1, puis 2',
    difficulte: 0,
    idee: 'Deux carrés autour du même centre, le second un cran plus grand. Le centre (10, 8) est choisi pour que même le plus grand tienne dans l’écran.',
    texte: [
      '**Deux lignes, une seule différence :** la taille. D’abord `1`, puis `2`. Le second carré entoure le premier.',
      '**Ce qui est nouveau ici : le placement.** Pour des carrés de plus en plus grands, il faut un centre où **ils tiennent tous**. L’écran fait **20 colonnes** (de 0 à 19) et **18 lignes** (de 0 à 17). Son milieu est vers la colonne **10** et la ligne **8**.',
      '**Pourquoi (10, 8) est le meilleur endroit :** le plus grand carré possible a la taille **8** (17 × 17). Autour de (10, 8), il va de la colonne 10 − 8 = **2** à 10 + 8 = **18**, et de la ligne 8 − 8 = **0** à 8 + 8 = **16** : il tient **entier**. Tous les carrés, de la taille 1 à la taille 8, peuvent donc tourner autour du **même** centre, emboîtés comme des cadres.',
      '**Chaque carré revient au centre** avant que le suivant commence : le second repart donc bien de (10, 8).',
    ],
    code: `int main() {
  // LE CENTRE, pour tous les carrés : (10, 8), le milieu de l'écran.
  //
  //   l'écran : 20 colonnes (0 à 19), 18 lignes (0 à 17)
  //   le plus grand carré (taille 8) autour de (10, 8) :
  //     colonnes 10 - 8 = 2  à  10 + 8 = 18   → il tient (19 est le bord)
  //     lignes    8 - 8 = 0  à   8 + 8 = 16   → il tient (17 est le bord)
  //   Donc TOUTES les tailles, de 1 à 8, tiennent autour de ce centre.
  //
  //   Les deux carrés de ce programme, emboîtés :
  //
  //      colonne :  8  9 10 11 12
  //      ligne 6 :  2  2  2  2  2        1 : le carré de taille 1 (3 × 3)
  //      ligne 7 :  2  1  1  1  2        2 : le carré de taille 2 (5 × 5)
  //      ligne 8 :  2  1  A  1  2
  //      ligne 9 :  2  1  1  1  2
  //      ligne 10 : 2  2  2  2  2

  carre(10, 8, ALPHABET[0], 1, 1, 250, 1);   // taille 1 : 3 × 3
  carre(10, 8, ALPHABET[0], 2, 1, 250, 1);   // taille 2 : 5 × 5, un cran plus loin

  while (true) {
    image();          // le A est revenu au centre
  }
}
`,
    aVoir: 'Un A qui fait un petit tour autour du milieu de l’écran, puis un tour un peu plus grand autour du même point.',
    controle: (c) => {
      const { A } = suivre(c, 'A', 600)
      return [
        ['le carré de taille 1 : son coin (11, 9)', A.includes('11,9')],
        ['puis celui de taille 2 : son coin (12, 10)', A.includes('12,10') && A.indexOf('11,9') < A.indexOf('12,10')],
        ['le A revient au centre (10, 8)', A.at(-1) === '10,8', ` (${A.at(-1)})`],
      ]
    },
  },

  {
    titre: 'De plus en plus grand : 1, puis 2 — de base, ailleurs',
    difficulte: 0,
    suite: true,
    idee: 'Le 0.49 fait par le B, autour de (4, 4).',
    texte: [
      '**C’est le 0.49**, avec le **B**, autour de **(4, 4)** au lieu de (10, 8).',
      '**C’est la version de base** : la deuxième place, seule. Le 0.49.2 met les deux ensemble.',
    ],
    code: `int main() {
  // Le B, autour de (4, 4) :
  carre(4, 4, ALPHABET[1], 1, 1, 250, 1);
  carre(4, 4, ALPHABET[1], 2, 1, 250, 1);

  while (true) {
    image();
  }
}
`,
    aVoir: 'Les mêmes carrés qu’au 0.49, faits par le B autour de (4, 4).',
    controle: (c) => {
      const { B } = suivre(c, 'B', 1500, 18)
      return [
        ['le B finit en (4, 4)', B.at(-1) === '4,4', ` (${B.at(-1)})`],
      ]
    },
  },

  {
    titre: 'De plus en plus grand : 1, puis 2 — doublé, deux positions',
    difficulte: 0,
    suite: true,
    idee: 'Les carrés du A autour de (10, 8), puis ceux du B autour de (4, 4).',
    texte: [
      '**C’est le 0.49 et le 0.49.1 réunis** : les carrés du A, puis ceux du B.',
    ],
    code: `int main() {
  // 1. Le A, autour de (10, 8)
  carre(10, 8, ALPHABET[0], 1, 1, 250, 1);
  carre(10, 8, ALPHABET[0], 2, 1, 250, 1);
  // 2. Le B, autour de (4, 4)
  carre(4, 4, ALPHABET[1], 1, 1, 250, 1);
  carre(4, 4, ALPHABET[1], 2, 1, 250, 1);

  while (true) {
    image();
  }
}
`,
    aVoir: 'Les carrés du A, puis ceux du B.',
    controle: (c) => {
      const { A, B } = suivre(c, 'AB', 3000, 18)
      return [
        ['le A passe par (11, 9)', A.includes('11,9')],
        ['le B finit en (4, 4)', B.at(-1) === '4,4', ` (${B.at(-1)})`],
      ]
    },
  },

  {
    titre: 'De plus en plus grand : et 3',
    difficulte: 0,
    idee: 'Le 0.49, plus une ligne : un troisième carré, de taille 3, autour du même centre.',
    texte: [
      '**C’est le 0.49, plus une ligne :** le carré de taille 3 (7 × 7).',
      '**Ce qui est nouveau ici :** rien qu’une taille de plus. On voit la règle se répéter : chaque carré a **2 cases de plus** de côté que le précédent (3, 5, 7), puisqu’il gagne une case de chaque côté.',
      '**On pourrait continuer ainsi jusqu’à 8**, en écrivant huit lignes presque pareilles. Le cours suivant montre comment l’écrire une seule fois.',
    ],
    code: `int main() {
  // Toujours le même centre, (10, 8) : les tailles 1 à 8 y tiennent toutes.
  //
  //      colonne :  7  8  9 10 11 12 13
  //      ligne 5 :  3  3  3  3  3  3  3      chaque carré a 2 cases de plus
  //      ligne 6 :  3  2  2  2  2  2  3      de côté que le précédent :
  //      ligne 7 :  3  2  1  1  1  2  3        taille 1 : 3 × 3
  //      ligne 8 :  3  2  1  A  1  2  3        taille 2 : 5 × 5
  //      ligne 9 :  3  2  1  1  1  2  3        taille 3 : 7 × 7
  //      ligne 10 : 3  2  2  2  2  2  3
  //      ligne 11 : 3  3  3  3  3  3  3

  carre(10, 8, ALPHABET[0], 1, 1, 250, 1);   // taille 1 : 3 × 3
  carre(10, 8, ALPHABET[0], 2, 1, 250, 1);   // taille 2 : 5 × 5
  carre(10, 8, ALPHABET[0], 3, 1, 250, 1);   // la ligne ajoutée : taille 3, 7 × 7

  while (true) {
    image();
  }
}
`,
    aVoir: 'Trois tours autour du milieu de l’écran, chacun plus grand que le précédent.',
    controle: (c) => {
      const { A } = suivre(c, 'A', 1100)
      return [
        ['les trois coins, dans l’ordre : (11, 9), (12, 10), (13, 11)',
          A.indexOf('11,9') < A.indexOf('12,10') && A.indexOf('12,10') < A.indexOf('13,11') && A.indexOf('11,9') >= 0],
        ['pas plus loin que la taille 3', !A.some((p) => p.startsWith('14,') || p.startsWith('6,'))],
        ['le A revient au centre (10, 8)', A.at(-1) === '10,8', ` (${A.at(-1)})`],
      ]
    },
  },

  {
    titre: 'De plus en plus grand : et 3 — de base, ailleurs',
    difficulte: 0,
    suite: true,
    idee: 'Le 0.50 fait par le B, autour de (4, 4).',
    texte: [
      '**C’est le 0.50**, avec le **B**, autour de **(4, 4)** au lieu de (10, 8).',
      '**C’est la version de base** : la deuxième place, seule. Le 0.50.2 met les deux ensemble.',
    ],
    code: `int main() {
  // Le B, autour de (4, 4) :
  carre(4, 4, ALPHABET[1], 1, 1, 250, 1);
  carre(4, 4, ALPHABET[1], 2, 1, 250, 1);
  carre(4, 4, ALPHABET[1], 3, 1, 250, 1);

  while (true) {
    image();
  }
}
`,
    aVoir: 'Les mêmes carrés qu’au 0.50, faits par le B autour de (4, 4).',
    controle: (c) => {
      const { B } = suivre(c, 'B', 2000, 18)
      return [
        ['le B finit en (4, 4)', B.at(-1) === '4,4', ` (${B.at(-1)})`],
      ]
    },
  },

  {
    titre: 'De plus en plus grand : et 3 — doublé, deux positions',
    difficulte: 0,
    suite: true,
    idee: 'Les carrés du A autour de (10, 8), puis ceux du B autour de (4, 4).',
    texte: [
      '**C’est le 0.50 et le 0.50.1 réunis** : les carrés du A, puis ceux du B.',
    ],
    code: `int main() {
  // 1. Le A, autour de (10, 8)
  carre(10, 8, ALPHABET[0], 1, 1, 250, 1);
  carre(10, 8, ALPHABET[0], 2, 1, 250, 1);
  carre(10, 8, ALPHABET[0], 3, 1, 250, 1);
  // 2. Le B, autour de (4, 4)
  carre(4, 4, ALPHABET[1], 1, 1, 250, 1);
  carre(4, 4, ALPHABET[1], 2, 1, 250, 1);
  carre(4, 4, ALPHABET[1], 3, 1, 250, 1);

  while (true) {
    image();
  }
}
`,
    aVoir: 'Les carrés du A, puis ceux du B.',
    controle: (c) => {
      const { A, B } = suivre(c, 'AB', 4000, 18)
      return [
        ['le A passe par (11, 9)', A.includes('11,9')],
        ['le B finit en (4, 4)', B.at(-1) === '4,4', ` (${B.at(-1)})`],
      ]
    },
  },

  {
    titre: 'Jusqu’au plus grand : une boucle',
    difficulte: 0,
    idee: 'Une boucle for fait grandir la taille de 1 à 8 : huit carrés emboîtés, jusqu’au plus grand que l’écran tienne.',
    texte: [
      '**Le 0.50 répétait la même ligne**, avec une taille qui augmente de 1 à chaque fois. Quand seul un nombre change, et toujours de la même façon, on écrit la ligne **une seule fois**, dans une **boucle**.',
      '**Ce qui est nouveau ici :** la taille est une **variable**, `taille`, que la boucle `for` fait passer par 1, 2, 3… jusqu’à **8**. À chaque tour de boucle, `carre` reçoit la taille du moment.',
      '**`taille <= 8`** veut dire « tant que la taille est plus petite **ou égale** à 8 » : la boucle fait donc aussi le tour de taille 8, puis s’arrête.',
      '**Pourquoi 8 :** c’est le plus grand carré que l’écran tienne. Autour de (10, 8), il va de la colonne 2 à 18 et de la ligne 0 à 16. Le centre a été choisi pour ça (voir le 0.49).',
      '**La vitesse, 50 ms par pas**, est plus rapide : huit carrés à 250 ms dureraient plus d’une minute. Elle s’écrit toujours en clair ; la taille, elle, peut être une variable.',
    ],
    code: `int main() {
  // La boucle, morceau par morceau :
  //
  //   for (uint8_t taille = 1; taille <= 8; taille++)
  //        |                   |            |
  //        |                   |            +-- après chaque tour : taille + 1
  //        |                   +--------------- tant que taille ≤ 8 (8 compris)
  //        +----------------------------------- on commence à la taille 1
  //
  //   tour 1 : carre(10, 8, ALPHABET[0], 1, 1, 50, 1);    3 × 3
  //   tour 2 : carre(10, 8, ALPHABET[0], 2, 1, 50, 1);    5 × 5
  //   …
  //   tour 8 : carre(10, 8, ALPHABET[0], 8, 1, 50, 1);    17 × 17, le plus grand
  //
  // Le plus grand, autour du centre (10, 8) :
  //   colonnes 2 à 18, lignes 0 à 16 : il tient entier dans l'écran
  //   (20 colonnes de 0 à 19, 18 lignes de 0 à 17).
  for (uint8_t taille = 1; taille <= 8; taille++) {
    carre(10, 8, ALPHABET[0], taille, 1, 50, 1);   // 50 ms par pas : plus vite
  }

  while (true) {
    image();          // les huit carrés sont faits : le A est au centre
  }
}
`,
    aVoir: 'Huit tours autour du milieu de l’écran, de plus en plus grands, jusqu’à un carré qui touche presque les bords.',
    controle: (c) => {
      const { A } = suivre(c, 'A', 1700)
      return [
        /* Le premier petit carré, très rapide, est souvent fini avant que le
           contrôle ne commence : on regarde les suivants. */
        ['les coins grandissent : (12, 10), (14, 12), (18, 16)', ['12,10', '14,12', '18,16'].every((p) => A.includes(p))],
        ['le plus grand va jusqu’en haut à gauche (2, 0)', A.includes('2,0')],
        ['jamais hors de l’écran : ni colonne 19, ni ligne 17', !A.some((p) => p.startsWith('19,') || p.endsWith(',17'))],
        ['le A revient au centre (10, 8)', A.at(-1) === '10,8', ` (${A.at(-1)})`],
      ]
    },
  },

  {
    titre: 'Jusqu’au plus grand : une boucle — de base, ailleurs',
    difficulte: 0,
    suite: true,
    idee: 'Le 0.51 fait par le B, autour de (9, 9).',
    texte: [
      '**C’est le 0.51**, avec le **B**, autour de **(9, 9)** au lieu de (10, 8).',
      '**Pourquoi (9, 9) :** la taille 8 ne tient que si le centre est entre les colonnes 8 et 11 et les lignes 8 et 9. (9, 9) est l’un des rares autres centres possibles.',
      '**C’est la version de base** : la deuxième place, seule. Le 0.51.2 met les deux ensemble.',
    ],
    code: `int main() {
  // Le B, autour de (9, 9) :
  for (uint8_t taille = 1; taille <= 8; taille++) {
    carre(9, 9, ALPHABET[1], taille, 1, 50, 1);
  }

  while (true) {
    image();
  }
}
`,
    aVoir: 'Les mêmes carrés qu’au 0.51, faits par le B autour de (9, 9).',
    controle: (c) => {
      const { B } = suivre(c, 'B', 3200, 18)
      return [
        ['le B finit en (9, 9)', B.at(-1) === '9,9', ` (${B.at(-1)})`],
      ]
    },
  },

  {
    titre: 'Jusqu’au plus grand : une boucle — doublé, deux positions',
    difficulte: 0,
    suite: true,
    idee: 'Les carrés du A autour de (10, 8), puis ceux du B autour de (9, 9).',
    texte: [
      '**C’est le 0.51 et le 0.51.1 réunis** : les carrés du A, puis ceux du B.',
      '**Ils se croisent :** en passant, les carrés du B effacent le A resté au centre. Chaque lettre ne s’occupe que d’elle-même.',
    ],
    code: `int main() {
  // 1. Le A, autour de (10, 8)
  for (uint8_t taille = 1; taille <= 8; taille++) {
    carre(10, 8, ALPHABET[0], taille, 1, 50, 1);
  }
  // 2. Le B, autour de (9, 9)
  for (uint8_t taille = 1; taille <= 8; taille++) {
    carre(9, 9, ALPHABET[1], taille, 1, 50, 1);
  }

  while (true) {
    image();
  }
}
`,
    aVoir: 'Les carrés du A, puis ceux du B.',
    controle: (c) => {
      const { A, B } = suivre(c, 'AB', 6400, 18)
      return [
        ['le A passe par (12, 10), le coin de son 2e carré', A.includes('12,10')],
        ['le B finit en (9, 9)', B.at(-1) === '9,9', ` (${B.at(-1)})`],
      ]
    },
  },

  {
    titre: 'Deux carrés à la suite',
    difficulte: 0,
    idee: 'Deux appels à carre, l’un après l’autre : un petit carré lent, puis un grand carré rapide. Le second attend la fin du premier.',
    texte: [
      '**Deux carrés différents, l’un après l’autre.** Chacun a été vu seul dans les leçons d’avant ; on les enchaîne.',
      '**Ce qui est nouveau ici : deux `carre` l’un après l’autre.** `carre` **bloque** : elle attend la fin de son carré avant de rendre la main. La deuxième ligne ne commence donc que quand la lettre est revenue au centre.',
      '**Le premier** est celui du 0.34 (taille 1). **Le second** change quatre réglages, chacun vu dans sa leçon : taille 3 (le 0.36), sens -1 (le 0.42), vitesse 100 (le 0.44), 3 tours (le 0.47).',
    ],
    code: `int main() {
  // 1. Le petit carré (le 0.34) : taille 1, sens 1, 250 ms, 1 tour.
  carre(10, 8, ALPHABET[0], 1, 1, 250, 1);

  // 2. Le grand carré. Il commence quand le petit est FINI :
  //    carre attend la fin de son tour avant de passer à la ligne suivante.
  //    taille 3, sens -1, vitesse 100, 3 tours
  carre(10, 8, ALPHABET[0], 3, -1, 100, 3);

  while (true) {
    image();
  }
}
`,
    aVoir: 'Un A qui fait un petit tour lent autour de (10, 8), puis trois grands tours rapides dans l’autre sens.',
    controle: (c) => {
      const { A } = suivre(c, 'A', 900)
      return [
        ['le petit carré d’abord : son coin (11, 9)', A.includes('11,9') && A.indexOf('11,9') < A.indexOf('13,11')],
        ['puis trois grands tours : (13, 11) trois fois', A.filter((p) => p === '13,11').length === 3],
        ['le A revient au centre (10, 8)', A.at(-1) === '10,8', ` (${A.at(-1)})`],
      ]
    },
  },

  {
    titre: 'Deux carrés à la suite — de base, ailleurs',
    difficulte: 0,
    suite: true,
    idee: 'Le 0.52 fait par le B, autour de (4, 4).',
    texte: [
      '**C’est le 0.52**, avec le **B**, autour de **(4, 4)** au lieu de (10, 8).',
      '**C’est la version de base** : la deuxième place, seule. Le 0.52.2 met les deux ensemble.',
    ],
    code: `int main() {
  // Le B, autour de (4, 4) :
  carre(4, 4, ALPHABET[1], 1, 1, 250, 1);
  carre(4, 4, ALPHABET[1], 3, -1, 100, 3);

  while (true) {
    image();
  }
}
`,
    aVoir: 'Les mêmes carrés qu’au 0.52, faits par le B autour de (4, 4).',
    controle: (c) => {
      const { B } = suivre(c, 'B', 2000, 18)
      return [
        ['le B finit en (4, 4)', B.at(-1) === '4,4', ` (${B.at(-1)})`],
      ]
    },
  },

  {
    titre: 'Deux carrés à la suite — doublé, deux positions',
    difficulte: 0,
    suite: true,
    idee: 'Les carrés du A autour de (10, 8), puis ceux du B autour de (4, 4).',
    texte: [
      '**C’est le 0.52 et le 0.52.1 réunis** : les carrés du A, puis ceux du B.',
    ],
    code: `int main() {
  // 1. Le A, autour de (10, 8)
  carre(10, 8, ALPHABET[0], 1, 1, 250, 1);
  carre(10, 8, ALPHABET[0], 3, -1, 100, 3);
  // 2. Le B, autour de (4, 4)
  carre(4, 4, ALPHABET[1], 1, 1, 250, 1);
  carre(4, 4, ALPHABET[1], 3, -1, 100, 3);

  while (true) {
    image();
  }
}
`,
    aVoir: 'Les carrés du A, puis ceux du B.',
    controle: (c) => {
      const { A, B } = suivre(c, 'AB', 4000, 18)
      return [
        ['le A passe par (11, 9)', A.includes('11,9')],
        ['le B finit en (4, 4)', B.at(-1) === '4,4', ` (${B.at(-1)})`],
      ]
    },
  },

  {
    titre: 'Deux lettres, deux carrés',
    difficulte: 0,
    idee: 'Deux lettres, chacune autour de son propre centre : un A petit et lent, un B grand et rapide.',
    texte: [
      '**Deux lettres, deux centres.** Jusqu’ici, tous les carrés tournaient autour de (10, 8). Ici, le A tourne autour de (4, 4), le B autour de (9, 9).',
      '**Ce qui est nouveau ici :** une **deuxième lettre**, `ALPHABET[1]`, le **B**. Chaque appel à `carre` a sa propre tuile et son propre centre : les deux carrés ne se touchent pas.',
      '**Ils se font l’un après l’autre**, comme au 0.52 : le B commence quand le A est revenu à son centre. À la fin, on voit les deux lettres, chacune à sa place.',
    ],
    code: `int main() {
  // ALPHABET[0] est le A, ALPHABET[1] le B : on compte à partir de 0.

  // 1. Le A : autour de (4, 4), taille 1 (3 × 3), sens 1, 250 ms, 1 tour.
  carre(4, 4, ALPHABET[0], 1, 1, 250, 1);

  // 2. Le B, la ligne nouvelle : autour de (9, 9), taille 3 (7 × 7),
  //    l'autre sens, 100 ms, 1 tour. Il commence quand le A a fini.
  //
  //   colonne :  3  4  5  6 … 9 … 12
  //   ligne 4 :  .  A  .                  le carré du A : colonnes 3 à 5
  //   ligne 9 :           .   B   .       celui du B : colonnes 6 à 12
  //                                       — ils ne se touchent pas
  carre(9, 9, ALPHABET[1], 3, -1, 100, 1);

  while (true) {
    image();          // A en (4, 4), B en (9, 9)
  }
}
`,
    aVoir: 'Un A qui fait un petit carré autour de (4, 4), puis un B qui fait un grand carré rapide autour de (9, 9). Chacun reste à son centre.',
    controle: (c) => {
      const { A, B } = suivre(c, 'AB', 600)
      return [
        ['le A fait son tour : (3, 3), (5, 5)', A.includes('3,3') && A.includes('5,5')],
        ['le B fait le sien, dans l’autre sens : du coin (6, 6), il descend', B[B.indexOf('6,6') + 1] === '6,7'],
        ['chacun à son centre : A (4, 4), B (9, 9)', A.at(-1) === '4,4' && B.at(-1) === '9,9', ` (${A.at(-1)} ${B.at(-1)})`],
      ]
    },
  },

  {
    titre: 'Deux lettres, deux carrés — de base, ailleurs',
    difficulte: 0,
    suite: true,
    idee: 'Deux autres lettres, deux autres places : le C autour de (15, 4), le D autour de (14, 12).',
    texte: [
      '**C’est le 0.53**, avec deux **autres** lettres, le C et le D, à deux places libres de l’écran : (15, 4) et (14, 12).',
      '**C’est la version de base** : la deuxième place, seule. Le 0.53.2 met les deux ensemble.',
    ],
    code: `int main() {
  carre(15, 4, ALPHABET[2], 1, 1, 250, 1);     // le C, en haut à droite
  carre(14, 12, ALPHABET[3], 3, -1, 100, 1);   // le D, en bas à droite

  while (true) {
    image();
  }
}
`,
    aVoir: 'Le C fait un petit carré en haut à droite, puis le D un grand en bas à droite.',
    controle: (c) => {
      const { C, D } = suivre(c, 'CD', 700, 18)
      return [
        ['le C finit en (15, 4)', C.at(-1) === '15,4', ` (${C.at(-1)})`],
        ['le D finit en (14, 12)', D.at(-1) === '14,12', ` (${D.at(-1)})`],
      ]
    },
  },

  {
    titre: 'Deux lettres, deux carrés — doublé, deux positions',
    difficulte: 0,
    suite: true,
    idee: 'Quatre lettres, quatre carrés : A, B, C et D, chacun à sa place.',
    texte: [
      '**C’est le 0.53 et le 0.53.1 réunis** : les quatre carrés, l’un après l’autre.',
    ],
    code: `int main() {
  carre(4, 4, ALPHABET[0], 1, 1, 250, 1);      // le A
  carre(9, 9, ALPHABET[1], 3, -1, 100, 1);     // le B
  carre(15, 4, ALPHABET[2], 1, 1, 250, 1);     // le C
  carre(14, 12, ALPHABET[3], 3, -1, 100, 1);   // le D

  while (true) {
    image();
  }
}
`,
    aVoir: 'Quatre carrés, l’un après l’autre, aux quatre coins de l’écran.',
    controle: (c) => {
      const { A, B, C, D } = suivre(c, 'ABCD', 1300, 18)
      return [
        ['le A finit en (4, 4)', A.at(-1) === '4,4', ` (${A.at(-1)})`],
        ['le C finit en (15, 4)', C.at(-1) === '15,4', ` (${C.at(-1)})`],
        ['le D finit en (14, 12)', D.at(-1) === '14,12', ` (${D.at(-1)})`],
      ]
    },
  },

  {
    titre: 'Trois lettres, trois carrés',
    difficulte: 0,
    idee: 'Le 0.53, plus une ligne : un C, avec les réglages rangés sous le nom « ronde ».',
    texte: [
      '**C’est le 0.53, plus un carré :** le C, dont les réglages sont rangés en haut sous le nom `ronde`, comme au 0.48.',
      '**Ce qui est nouveau ici :** rien qu’on ne connaisse, mais **ensemble** : deux carrés écrits en entier, et un troisième par son nom. `carre(ronde);` est remplacé par `carre(15, 8, ALPHABET[2], 2, 1, 250, 2);`.',
      '**Les trois centres** sont assez loin l’un de l’autre pour que les carrés ne se touchent pas : (4, 4), (9, 9), (15, 8). À la fin, on voit les trois lettres.',
    ],
    code: `// Les réglages du C, rangés sous un nom (le 0.48) :
//               x   y   tuile        taille  sens  vitesse  tours
Carre ronde = { 15,  8,  ALPHABET[2], 2,      1,    250,     2 };
// autour de (15, 8), la lettre C, 5 × 5, sens des aiguilles, 250 ms par pas, 2 tours

int main() {
  // 1. Le A : autour de (4, 4) ; taille 1 (3 × 3) ; sens 1 ; 250 ms ; 1 tour.
  carre(4, 4, ALPHABET[0], 1, 1, 250, 1);

  // 2. Le B : autour de (9, 9) ; taille 3 (7 × 7) ; sens -1 ; 100 ms ; 1 tour.
  carre(9, 9, ALPHABET[1], 3, -1, 100, 1);

  // 3. La ligne ajoutée : le C, avec les réglages de « ronde ».
  //    Le compilateur la remplace par carre(15, 8, ALPHABET[2], 2, 1, 250, 2).
  carre(ronde);

  while (true) {
    image();          // A en (4, 4), B en (9, 9), C en (15, 8)
  }
}
`,
    aVoir: 'Le A fait un petit carré, le B un grand carré rapide, puis le C deux tours autour de (15, 8). Chacun reste à son centre.',
    controle: (c) => {
      const { A, B, C } = suivre(c, 'ABC', 1000)
      const fois = C.filter((p) => p === '17,6').length
      return [
        ['le A et le B à leur centre : (4, 4), (9, 9)', A.at(-1) === '4,4' && B.at(-1) === '9,9'],
        ['le C, réglé par « ronde » : deux tours 5 × 5', fois === 2, ` (${fois} passages au coin (17, 6))`],
        ['le C revient à son centre (15, 8)', C.at(-1) === '15,8', ` (${C.at(-1)})`],
      ]
    },
  },

  {
    titre: 'Trois lettres, trois carrés — de base, ailleurs',
    difficulte: 0,
    suite: true,
    idee: 'Un quatrième Carre, « bas », pour le D autour de (15, 14).',
    texte: [
      '**C’est le 0.54**, avec une **quatrième** lettre, le D, rangée dans un `Carre` nommé `bas`, autour de (15, 14).',
      '**C’est la version de base** : la deuxième place, seule. Le 0.54.2 met les deux ensemble.',
    ],
    code: `Carre bas = { 15, 14, ALPHABET[3], 2, 1, 250, 1 };   // le D, en bas à droite

int main() {
  carre(bas);

  while (true) {
    image();
  }
}
`,
    aVoir: 'Le D fait un tour autour de (15, 14).',
    controle: (c) => {
      const { D } = suivre(c, 'D', 450, 18)
      return [
        ['le D passe par (17, 16)', D.includes('17,16')],
        ['le D finit en (15, 14)', D.at(-1) === '15,14', ` (${D.at(-1)})`],
      ]
    },
  },

  {
    titre: 'Trois lettres, trois carrés — doublé, deux positions',
    difficulte: 0,
    suite: true,
    idee: 'Les trois carrés du 0.54, puis celui du D : quatre lettres.',
    texte: [
      '**C’est le 0.54 et le 0.54.1 réunis** : les trois carrés, puis le quatrième.',
    ],
    code: `Carre ronde = { 15,  8, ALPHABET[2], 2, 1, 250, 2 };   // le C
Carre bas   = { 15, 14, ALPHABET[3], 2, 1, 250, 1 };   // le D

int main() {
  carre(4, 4, ALPHABET[0], 1, 1, 250, 1);     // le A
  carre(9, 9, ALPHABET[1], 3, -1, 100, 1);    // le B
  carre(ronde);                              // le C
  carre(bas);                                // le D

  while (true) {
    image();
  }
}
`,
    aVoir: 'Le A, le B, le C, puis le D font leur carré.',
    controle: (c) => {
      const { A, B, C, D } = suivre(c, 'ABCD', 1500, 18)
      return [
        ['le A finit en (4, 4)', A.at(-1) === '4,4', ` (${A.at(-1)})`],
        ['le B finit en (9, 9)', B.at(-1) === '9,9', ` (${B.at(-1)})`],
        ['le D finit en (15, 14)', D.at(-1) === '15,14', ` (${D.at(-1)})`],
      ]
    },
  },

  {
    titre: 'La vitesse des déplacements : vitesse',
    difficulte: 0,
    idee: 'vitesse(ms) règle le temps d’un pas de deplace_x, deplace_y, deplace et va_a. vitesse(100) : 10 pas par seconde.',
    texte: [
      '**`carre` a sa vitesse, mais `deplace_x`, `deplace_y`, `deplace` et `va_a` n’en ont pas** : elles avancent toujours d’un pas tous les quarts de seconde (250 millisecondes).',
      '**Ce qui est nouveau ici :** `vitesse(ms)`. Elle règle **le temps d’un pas**, en millisecondes, pour **tous les déplacements qui viennent après elle**. Elle ne fait rien bouger elle-même : elle change le rythme.',
      '**Comme pour `carre` : plus le nombre est petit, plus ça va vite.** `vitesse(100)` : 10 pas par seconde. Le nombre s’écrit en clair.',
      '**Le reste est le 0.18 :** `deplace_x` fait avancer la lettre de 5 cases. Mais cette fois, deux fois et demie plus vite.',
    ],
    code: `uint8_t x = 0;        // la colonne de la lettre : 0, tout à gauche

int main() {
  // La ligne nouvelle :
  //
  //   vitesse(100);
  //           |
  //           +-- le temps d'UN pas, en millisecondes, pour tous les
  //               déplacements qui viennent APRÈS :
  //                 250 → 4 pas par seconde (sans vitesse(), c'est ce rythme)
  //                 100 → 10 pas par seconde (ici)
  //
  // vitesse() ne fait rien bouger : elle change le rythme.
  vitesse(100);

  deplace_x(x, 0, ALPHABET[0], 5);    // 5 cases à droite, à 100 ms par pas

  while (true) {
    image();
  }
}
`,
    aVoir: 'Un A qui file de 5 cases vers la droite, bien plus vite qu’au 0.18.',
    controle: (c) => {
      /* L'écart entre deux changements de case est la durée d'un pas.
         100 ms = 6 images (on accepte 7, par prudence). */
      const ecarts = []
      let avant = c.mot(0, 0, 20)
      let depuis = 0
      for (let k = 0; k < 100; k++) {
        c.avancer(1)
        depuis++
        const ici = c.mot(0, 0, 20)
        if (ici !== avant) { ecarts.push(depuis); depuis = 0; avant = ici }
      }
      return [
        ['un pas toutes les 6 ou 7 images (100 ms)', ecarts.slice(1).every((e) => e === 6 || e === 7) && ecarts.length >= 3, ` (${ecarts.join(' ')})`],
        ['le A arrive en colonne 5', c.variable('x') === 5, ` (x = ${c.variable('x')})`],
      ]
    },
  },

  {
    titre: 'La vitesse des déplacements : vitesse — de base, ailleurs',
    difficulte: 0,
    suite: true,
    idee: 'Le 0.55 sur la ligne 8, avec le B.',
    texte: [
      '**C’est le 0.55**, avec le **B**, sur la **ligne 8**.',
      '**C’est la version de base** : la deuxième place, seule. Le 0.55.2 met les deux ensemble.',
    ],
    code: `uint8_t x = 0;

int main() {
  vitesse(100);                       // 10 pas par seconde
  deplace_x(x, 8, ALPHABET[1], 5);    // le B, ligne 8

  while (true) {
    image();
  }
}
`,
    aVoir: 'Un B qui file de 5 cases sur la ligne 8.',
    controle: (c) => {
      const { B } = suivre(c, 'B', 100, 18)
      return [
        ['le B finit en (5, 8)', B.at(-1) === '5,8', ` (${B.at(-1)})`],
      ]
    },
  },

  {
    titre: 'La vitesse des déplacements : vitesse — doublé, deux positions',
    difficulte: 0,
    suite: true,
    idee: 'Un seul vitesse(100) pour les deux : il vaut pour tous les déplacements qui suivent.',
    texte: [
      '**C’est le 0.55 et le 0.55.1 réunis** : le A puis le B, avec le même `vitesse(100)`.',
      '**Un seul réglage suffit :** `vitesse` reste réglée jusqu’au suivant, pour toutes les lettres.',
    ],
    code: `uint8_t x = 0;        // le A
uint8_t xb = 0;       // le B

int main() {
  vitesse(100);                        // pour les deux
  deplace_x(x, 0, ALPHABET[0], 5);
  deplace_x(xb, 8, ALPHABET[1], 5);

  while (true) {
    image();
  }
}
`,
    aVoir: 'Le A file sur la ligne 0, puis le B sur la ligne 8, à la même vitesse.',
    controle: (c) => {
      const { A, B } = suivre(c, 'AB', 150, 18)
      return [
        ['le A finit en (5, 0)', A.at(-1) === '5,0', ` (${A.at(-1)})`],
        ['le B finit en (5, 8)', B.at(-1) === '5,8', ` (${B.at(-1)})`],
      ]
    },
  },

  {
    titre: 'Changer de vitesse en route',
    difficulte: 0,
    idee: 'Le 0.55, plus deux lignes : vitesse(500), puis le retour. La même lettre va vite, puis lentement.',
    texte: [
      '**C’est le 0.55, plus deux lignes :** une nouvelle vitesse, et le retour.',
      '**Ce qui est nouveau ici :** un **deuxième** `vitesse(…)`. La vitesse reste réglée **jusqu’au prochain `vitesse`** : l’aller se fait à 100, et après `vitesse(500)`, le retour se fait à 500 millisecondes par pas, 2 pas par seconde.',
      '**On peut changer de vitesse autant de fois qu’on veut**, entre deux déplacements.',
    ],
    code: `uint8_t x = 0;        // la colonne de la lettre

int main() {
  vitesse(100);                       // 10 pas par seconde…
  deplace_x(x, 0, ALPHABET[0], 5);    // …pour l'aller (le 0.55)

  // Les deux lignes ajoutées :
  vitesse(500);                       // désormais : 500 ms par pas, 2 par seconde
  deplace_x(x, 0, ALPHABET[0], -5);   // le retour, lentement

  while (true) {
    image();
  }
}
`,
    aVoir: 'Un A qui file vite vers la droite, puis revient lentement vers la gauche.',
    controle: (c) => {
      const ecarts = []
      let avant = c.mot(0, 0, 20)
      let depuis = 0
      for (let k = 0; k < 300; k++) {
        c.avancer(1)
        depuis++
        const ici = c.mot(0, 0, 20)
        if (ici !== avant) { ecarts.push(depuis); depuis = 0; avant = ici }
      }
      const combien = (n) => ecarts.filter((e) => e === n || e === n + 1).length
      return [
        ['à l’aller, un pas toutes les 6 ou 7 images', combien(6) >= 1, ` (${ecarts.join(' ')})`],
        ['au retour, toutes les 30 ou 31 images', combien(30) >= 4],
        ['le A est revenu en colonne 0', c.variable('x') === 0, ` (x = ${c.variable('x')})`],
      ]
    },
  },

  {
    titre: 'Changer de vitesse en route — de base, ailleurs',
    difficulte: 0,
    suite: true,
    idee: 'Le 0.56 sur la ligne 8, avec le B : vite à l’aller, lentement au retour.',
    texte: [
      '**C’est le 0.56**, avec le **B**, sur la **ligne 8**.',
      '**C’est la version de base** : la deuxième place, seule. Le 0.56.2 met les deux ensemble.',
    ],
    code: `uint8_t x = 0;

int main() {
  vitesse(100);
  deplace_x(x, 8, ALPHABET[1], 5);    // vite
  vitesse(500);
  deplace_x(x, 8, ALPHABET[1], -5);   // lentement

  while (true) {
    image();
  }
}
`,
    aVoir: 'Un B qui file à droite sur la ligne 8, puis revient lentement.',
    controle: (c) => {
      const { B } = suivre(c, 'B', 300, 18)
      return [
        ['le B passe par (5, 8)', B.includes('5,8')],
        ['le B finit en (0, 8)', B.at(-1) === '0,8', ` (${B.at(-1)})`],
      ]
    },
  },

  {
    titre: 'Changer de vitesse en route — doublé, deux positions',
    difficulte: 0,
    suite: true,
    idee: 'Le A vite puis lentement, et le B aussi : chaque vitesse vaut jusqu’à la suivante.',
    texte: [
      '**C’est le 0.56 et le 0.56.1 réunis** : les deux lettres, chacune avec ses deux vitesses.',
    ],
    code: `uint8_t x = 0;        // le A
uint8_t xb = 0;       // le B

int main() {
  vitesse(100);
  deplace_x(x, 0, ALPHABET[0], 5);
  deplace_x(xb, 8, ALPHABET[1], 5);    // toujours à 100
  vitesse(500);
  deplace_x(x, 0, ALPHABET[0], -5);
  deplace_x(xb, 8, ALPHABET[1], -5);   // toujours à 500

  while (true) {
    image();
  }
}
`,
    aVoir: 'Le A puis le B filent à droite ; puis le A et le B reviennent lentement.',
    controle: (c) => {
      const { A, B } = suivre(c, 'AB', 500, 18)
      return [
        ['le A finit en (0, 0)', A.at(-1) === '0,0', ` (${A.at(-1)})`],
        ['le B finit en (0, 8)', B.at(-1) === '0,8', ` (${B.at(-1)})`],
      ]
    },
  },

  {
    titre: 'Un carré sur la pointe : losange',
    difficulte: 0,
    idee: 'losange(x, y, tuile, taille, sens, vitesse, tours) : le carré tourné, ses côtés en diagonale. Les mêmes réglages que carre.',
    texte: [
      '**Un losange, c’est un carré posé sur la pointe.** Ses quatre côtés ne sont plus droits : ce sont des **diagonales**. À chaque pas, la lettre bouge d’une case sur X **et** d’une case sur Y en même temps, comme `deplace(x, y, …, 5, 5)` au 0.26.',
      '**Ce qui est nouveau ici :** `losange(x, y, tuile, taille, sens, vitesse, tours)`. Les **mêmes sept réglages que `carre`**, dans le même ordre.',
      '• **`x`, `y`** : le centre. **`taille`** : la distance du centre à chaque **pointe**. Avec 2, les pointes sont à 2 cases en haut, à droite, en bas et à gauche du centre.',
      '• **`sens`** : `1` part vers la droite depuis la pointe du haut (comme les aiguilles d’une montre) ; `-1` part vers la gauche.',
      '• **`vitesse`** en millisecondes par pas, **`tours`** : comme pour `carre`.',
      '**Le trajet :** du centre, la lettre monte **tout droit** jusqu’à la pointe du haut ; elle fait le tour en diagonale ; puis elle redescend tout droit au centre.',
      '**Un Carre marche aussi :** puisque les réglages sont les mêmes, `losange(ronde);` accepte un `Carre ronde = { … };`, comme `carre(ronde);`.',
    ],
    code: `int main() {
  // Un losange autour de la case (10, 8). Mêmes réglages que carre :
  //
  //   losange(10, 8, ALPHABET[0], 2, 1, 250, 1);
  //           |   |  |            |  |  |    |
  //           |   |  |            |  |  |    +-- tours   : 1 tour
  //           |   |  |            |  |  +------- vitesse : 250 ms par pas
  //           |   |  |            |  +---------- sens    : 1, vers la droite d'abord
  //           |   |  |            +------------- taille  : 2, les pointes à 2 cases
  //           |   |  +-------------------------- tuile   : la lettre A
  //           +---+----------------------------- x, y    : le centre (10, 8)
  //
  // Le chemin (sens 1). Chaque flèche est UN pas en diagonale :
  //
  //      colonne :   8   9  10  11  12
  //      ligne 6 :           2                2 : la pointe du haut
  //      ligne 7 :       ↗       ↘
  //      ligne 8 :   ↑       A       4        A : le centre, où tout commence
  //      ligne 9 :       ↖       ↙                et où tout finit
  //      ligne 10 :          6
  //
  //   1. du centre (10, 8), tout droit vers le haut, jusqu'à la pointe (10, 6)
  //   2. en diagonale, bas-droite, jusqu'à la pointe de droite (12, 8)
  //   3. bas-gauche, jusqu'à la pointe du bas (10, 10)
  //   4. haut-gauche, jusqu'à la pointe de gauche (8, 8)
  //   5. haut-droite, retour à la pointe du haut (10, 6)
  //   6. tout droit vers le bas, retour au centre (10, 8)
  losange(10, 8, ALPHABET[0], 2, 1, 250, 1);

  while (true) {
    image();          // le tour est fini : le A reste au centre
  }
}
`,
    aVoir: 'Un A qui monte de 2 cases, fait un tour en diagonale autour de (10, 8), puis revient au centre.',
    controle: (c) => {
      const chemin = []
      for (let k = 0; k < 300; k++) {
        c.avancer(1)
        for (let l = 0; l < 18; l++) {
          const i = c.mot(0, l, 20).indexOf('A')
          if (i >= 0 && chemin.at(-1) !== i + ',' + l) chemin.push(i + ',' + l)
        }
      }
      return [
        ['les quatre pointes : (10, 6), (12, 8), (10, 10), (8, 8)', ['10,6', '12,8', '10,10', '8,8'].every((p) => chemin.includes(p))],
        ['les côtés en diagonale : (11, 7), (11, 9), (9, 9), (9, 7)', ['11,7', '11,9', '9,9', '9,7'].every((p) => chemin.includes(p))],
        ['sens 1 : après la pointe du haut, vers la droite', chemin[chemin.indexOf('10,6') + 1] === '11,7'],
        ['le A revient au centre (10, 8)', chemin.at(-1) === '10,8', ` (${chemin.at(-1)})`],
      ]
    },
  },

  {
    titre: 'Un carré sur la pointe : losange — de base, ailleurs',
    difficulte: 0,
    suite: true,
    idee: 'Le 0.57 fait par le B, autour de (4, 4).',
    texte: [
      '**C’est le 0.57**, avec le **B**, autour de **(4, 4)** au lieu de (10, 8).',
      '**La forme tient entière** autour de (4, 4) : elle ne s’approche jamais à moins d’une case du bord.',
      '**C’est la version de base** : la deuxième place, seule. Le 0.57.2 met les deux ensemble.',
    ],
    code: `int main() {
  // Le B, en haut à gauche :
  losange(4, 4, ALPHABET[1], 2, 1, 250, 1);

  while (true) {
    image();
  }
}
`,
    aVoir: 'La même forme qu’au 0.57, faite par le B en haut à gauche.',
    controle: (c) => {
      const { B } = suivre(c, 'B', 400, 18)
      return [
        ['le B passe par (6, 4)', B.includes('6,4')],
        ['le B finit en (4, 4)', B.at(-1) === '4,4', ` (${B.at(-1)})`],
      ]
    },
  },

  {
    titre: 'Un carré sur la pointe : losange — doublé, deux positions',
    difficulte: 0,
    suite: true,
    idee: 'La forme du A autour de (10, 8), puis celle du B autour de (4, 4).',
    texte: [
      '**C’est le 0.57 et le 0.57.1 réunis** : la même forme à deux places, l’une après l’autre.',
    ],
    code: `int main() {
  // 1. Le A, au milieu
  losange(10, 8, ALPHABET[0], 2, 1, 250, 1);
  // 2. Le B, en haut à gauche
  losange(4, 4, ALPHABET[1], 2, 1, 250, 1);

  while (true) {
    image();
  }
}
`,
    aVoir: 'La forme du A au milieu, puis celle du B en haut à gauche.',
    controle: (c) => {
      const { A, B } = suivre(c, 'AB', 800, 18)
      return [
        ['le A finit en (10, 8)', A.at(-1) === '10,8', ` (${A.at(-1)})`],
        ['le B finit en (4, 4)', B.at(-1) === '4,4', ` (${B.at(-1)})`],
      ]
    },
  },
  {
    titre: 'Plus large que haut : rectangle',
    difficulte: 0,
    idee: 'rectangle(x, y, tuile, largeur, hauteur, sens, vitesse, tours) : un carré avec deux tailles, une pour X et une pour Y.',
    texte: [
      '**Un rectangle, c’est un carré qui n’a pas la même taille sur les deux axes.** Au lieu d’une `taille`, il en a **deux** : la **largeur** (sur X) et la **hauteur** (sur Y).',
      '**Ce qui est nouveau ici :** `rectangle(x, y, tuile, largeur, hauteur, sens, vitesse, tours)`, **huit** réglages : ceux de `carre`, avec `largeur` et `hauteur` à la place de `taille`.',
      '• **`largeur`** et **`hauteur`** se comptent comme la taille d’un carré : la distance du centre au bord. La règle 2 × n + 1 vaut pour chacune : largeur 4 donne **9** cases de large, hauteur 2 donne **5** cases de haut, un rectangle de **9 × 5**.',
      '• Avec la même largeur et la même hauteur, `rectangle` fait **un carré** : `rectangle(10, 8, A, 2, 2, …)` fait le même tour que `carre(10, 8, A, 2, …)`.',
      '**Le trajet :** du centre, en diagonale, puis tout droit jusqu’au coin en haut à gauche ; le tour ; puis le même chemin à l’envers.',
      '**Les plus grandes tailles :** largeur 9 (19 colonnes) et hauteur 8 (17 lignes).',
    ],
    code: `int main() {
  // Un rectangle autour de la case (10, 8) :
  //
  //   rectangle(10, 8, ALPHABET[0], 4, 2, 1, 250, 1);
  //             |   |  |            |  |  |  |    |
  //             |   |  |            |  |  |  |    +-- tours   : 1 tour
  //             |   |  |            |  |  |  +------- vitesse : 250 ms par pas
  //             |   |  |            |  |  +---------- sens    : 1, comme les aiguilles
  //             |   |  |            |  +------------- hauteur : 2 → 2 × 2 + 1 = 5 cases de haut
  //             |   |  |            +---------------- largeur : 4 → 2 × 4 + 1 = 9 cases de large
  //             |   |  +----------------------------- tuile   : la lettre A
  //             +---+-------------------------------- x, y    : le centre (10, 8)
  //
  //      colonne :   6  7  8  9 10 11 12 13 14
  //      ligne 6 :   → → → → → → → → ↓          les côtés du haut et du bas :
  //      ligne 7 :   ↑                 ↓          8 pas (2 × largeur)
  //      ligne 8 :   ↑         A       ↓
  //      ligne 9 :   ↑                 ↓          les côtés de gauche et de droite :
  //      ligne 10 :  ↑ ← ← ← ← ← ← ← ←          4 pas (2 × hauteur)
  //
  // Le coin de départ est en haut à gauche, (6, 6) : le A y va du centre en
  // diagonale (2 pas), puis tout droit (2 pas), et en revient de même.
  rectangle(10, 8, ALPHABET[0], 4, 2, 1, 250, 1);

  while (true) {
    image();          // le tour est fini : le A reste au centre
  }
}
`,
    aVoir: 'Un A qui fait le tour d’un rectangle de 9 cases de large et 5 de haut autour de (10, 8), puis revient au centre.',
    controle: (c) => {
      const chemin = []
      for (let k = 0; k < 600; k++) {
        c.avancer(1)
        for (let l = 0; l < 18; l++) {
          const i = c.mot(0, l, 20).indexOf('A')
          if (i >= 0 && chemin.at(-1) !== i + ',' + l) chemin.push(i + ',' + l)
        }
      }
      return [
        ['les quatre coins : (6, 6), (14, 6), (14, 10), (6, 10)', ['6,6', '14,6', '14,10', '6,10'].every((p) => chemin.includes(p))],
        ['9 de large, 5 de haut : jamais plus loin', !chemin.some((p) => p.startsWith('15,') || p.endsWith(',11'))],
        ['le A revient au centre (10, 8)', chemin.at(-1) === '10,8', ` (${chemin.at(-1)})`],
      ]
    },
  },

  {
    titre: 'Plus large que haut : rectangle — de base, ailleurs',
    difficulte: 0,
    suite: true,
    idee: 'Le 0.58 fait par le B, autour de (4, 4).',
    texte: [
      '**C’est le 0.58**, avec le **B**, autour de **(4, 4)** au lieu de (10, 8).',
      '**La forme tient entière** autour de (4, 4) : elle ne s’approche jamais à moins d’une case du bord.',
      '**C’est la version de base** : la deuxième place, seule. Le 0.58.2 met les deux ensemble.',
    ],
    code: `int main() {
  // Le B, en haut à gauche :
  rectangle(4, 4, ALPHABET[1], 4, 2, 1, 250, 1);

  while (true) {
    image();
  }
}
`,
    aVoir: 'La même forme qu’au 0.58, faite par le B en haut à gauche.',
    controle: (c) => {
      const { B } = suivre(c, 'B', 700, 18)
      return [
        ['le B passe par (8, 6)', B.includes('8,6')],
        ['le B finit en (4, 4)', B.at(-1) === '4,4', ` (${B.at(-1)})`],
      ]
    },
  },

  {
    titre: 'Plus large que haut : rectangle — doublé, deux positions',
    difficulte: 0,
    suite: true,
    idee: 'La forme du A autour de (10, 8), puis celle du B autour de (4, 4).',
    texte: [
      '**C’est le 0.58 et le 0.58.1 réunis** : la même forme à deux places, l’une après l’autre.',
    ],
    code: `int main() {
  // 1. Le A, au milieu
  rectangle(10, 8, ALPHABET[0], 4, 2, 1, 250, 1);
  // 2. Le B, en haut à gauche
  rectangle(4, 4, ALPHABET[1], 4, 2, 1, 250, 1);

  while (true) {
    image();
  }
}
`,
    aVoir: 'La forme du A au milieu, puis celle du B en haut à gauche.',
    controle: (c) => {
      const { A, B } = suivre(c, 'AB', 1400, 18)
      return [
        ['le A finit en (10, 8)', A.at(-1) === '10,8', ` (${A.at(-1)})`],
        ['le B finit en (4, 4)', B.at(-1) === '4,4', ` (${B.at(-1)})`],
      ]
    },
  },
  {
    titre: 'Tourner en s’éloignant : spirale',
    difficulte: 0,
    idee: 'spirale(x, y, tuile, taille, sens, vitesse) : la lettre part du centre et tourne en s’éloignant, jusqu’au bord d’un carré de cette taille.',
    texte: [
      '**Une spirale tourne en s’éloignant du centre.** Chaque branche est un peu plus longue que la précédente.',
      '**Ce qui est nouveau ici :** `spirale(x, y, tuile, taille, sens, vitesse)`, **six** réglages : ceux de `carre`, sans les `tours` (une spirale ne se répète pas : elle s’élargit jusqu’au bout).',
      '**La règle des branches :** 1 pas, 1 pas, 2 pas, 2 pas, 3 pas, 3 pas… La longueur **augmente d’un pas toutes les deux branches**. La spirale s’arrête quand elle a atteint le bord du carré de `taille`, soit des branches de 2 × taille pas, et une dernière branche ferme le carré.',
      '**Le sens :** `1` tourne comme les aiguilles d’une montre (droite, bas, gauche, haut, et on recommence) ; `-1` dans l’autre sens (bas, droite, haut, gauche).',
      '**À la fin**, la lettre revient au centre en diagonale.',
    ],
    code: `int main() {
  // Une spirale autour de la case (10, 8) :
  //
  //   spirale(10, 8, ALPHABET[0], 3, 1, 250);
  //           |   |  |            |  |  |
  //           |   |  |            |  |  +-- vitesse : 250 ms par pas
  //           |   |  |            |  +----- sens    : 1, droite, bas, gauche, haut…
  //           |   |  |            +-------- taille  : 3, jusqu'au bord d'un carré 7 × 7
  //           |   |  +--------------------- tuile   : la lettre A
  //           +---+------------------------ x, y    : le centre (10, 8)
  //
  // Les branches, avec taille 3 (le plus long : 2 × 3 = 6 pas) :
  //
  //   branche :  1  2  3  4  5  6  7  8  9  10  11  12  13
  //   longueur : 1  1  2  2  3  3  4  4  5  5   6   6   6
  //   vers :     →  ↓  ←  ↑  →  ↓  ←  ↑  →  ↓   ←   ↑   →
  //
  // Le début, chaque case marquée du numéro de sa branche :
  //
  //      colonne :   9  10  11  12
  //      ligne 7 :   4   5   5   5     A : le centre (10, 8)
  //      ligne 8 :   4   A   1   .     1 : un pas à droite
  //      ligne 9 :   3   3   2   .     2 : un pas en bas
  //                                    3 : deux pas à gauche
  //                                    4 : deux pas en haut
  //                                    5 : trois pas à droite… et ça grandit
  spirale(10, 8, ALPHABET[0], 3, 1, 250);

  while (true) {
    image();          // la spirale est finie : le A est revenu au centre
  }
}
`,
    aVoir: 'Un A qui tourne autour de (10, 8) en s’éloignant un peu plus à chaque tour, puis revient au centre.',
    controle: (c) => {
      const chemin = []
      for (let k = 0; k < 900; k++) {
        c.avancer(1)
        for (let l = 0; l < 18; l++) {
          const i = c.mot(0, l, 20).indexOf('A')
          if (i >= 0 && chemin.at(-1) !== i + ',' + l) chemin.push(i + ',' + l)
        }
      }
      return [
        ['le premier petit tour : (11, 8), (11, 9), (9, 9), (9, 7)', ['11,8', '11,9', '9,9', '9,7'].every((p) => chemin.includes(p))],
        ['le deuxième, plus grand : (12, 10), (8, 10)', chemin.includes('12,10') && chemin.includes('8,10')],
        ['jusqu’au bord du 7 × 7 : (7, 5), (13, 5)', chemin.includes('7,5') && chemin.includes('13,5')],
        ['pas plus loin que la taille 3', !chemin.some((p) => p.startsWith('14,') || p.startsWith('6,'))],
        ['le A revient au centre (10, 8)', chemin.at(-1) === '10,8', ` (${chemin.at(-1)})`],
      ]
    },
  },

  {
    titre: 'Tourner en s’éloignant : spirale — de base, ailleurs',
    difficulte: 0,
    suite: true,
    idee: 'Le 0.59 fait par le B, autour de (4, 4).',
    texte: [
      '**C’est le 0.59**, avec le **B**, autour de **(4, 4)** au lieu de (10, 8).',
      '**La forme tient entière** autour de (4, 4) : elle ne s’approche jamais à moins d’une case du bord.',
      '**C’est la version de base** : la deuxième place, seule. Le 0.59.2 met les deux ensemble.',
    ],
    code: `int main() {
  // Le B, en haut à gauche :
  spirale(4, 4, ALPHABET[1], 3, 1, 250);

  while (true) {
    image();
  }
}
`,
    aVoir: 'La même forme qu’au 0.59, faite par le B en haut à gauche.',
    controle: (c) => {
      const { B } = suivre(c, 'B', 1000, 18)
      return [
        ['le B passe par (7, 1)', B.includes('7,1')],
        ['le B finit en (4, 4)', B.at(-1) === '4,4', ` (${B.at(-1)})`],
      ]
    },
  },

  {
    titre: 'Tourner en s’éloignant : spirale — doublé, deux positions',
    difficulte: 0,
    suite: true,
    idee: 'La forme du A autour de (10, 8), puis celle du B autour de (4, 4).',
    texte: [
      '**C’est le 0.59 et le 0.59.1 réunis** : la même forme à deux places, l’une après l’autre.',
    ],
    code: `int main() {
  // 1. Le A, au milieu
  spirale(10, 8, ALPHABET[0], 3, 1, 250);
  // 2. Le B, en haut à gauche
  spirale(4, 4, ALPHABET[1], 3, 1, 250);

  while (true) {
    image();
  }
}
`,
    aVoir: 'La forme du A au milieu, puis celle du B en haut à gauche.',
    controle: (c) => {
      const { A, B } = suivre(c, 'AB', 2000, 18)
      return [
        ['le A finit en (10, 8)', A.at(-1) === '10,8', ` (${A.at(-1)})`],
        ['le B finit en (4, 4)', B.at(-1) === '4,4', ` (${B.at(-1)})`],
      ]
    },
  },
  {
    titre: 'Aller et revenir : aller_retour',
    difficulte: 0,
    idee: 'aller_retour(x, y, tuile, pasX, pasY, vitesse, fois) : aller jusqu’à un point, revenir, et recommencer.',
    texte: [
      '**Un va-et-vient :** la lettre va jusqu’à un point, revient à sa place, et recommence.',
      '**Ce qui est nouveau ici :** `aller_retour(x, y, tuile, pasX, pasY, vitesse, fois)`.',
      '• **`x`, `y`** : la place de départ, où la lettre revient à chaque fois.',
      '• **`pasX`, `pasY`** : où est l’autre bout, comme pour `deplace` : `5, 0` veut dire 5 cases à droite, rien sur Y.',
      '• **`vitesse`** : en millisecondes par pas, comme pour `carre`. **`fois`** : combien d’allers-retours.',
      '**Au bord de l’écran**, l’autre bout est ramené dans l’écran.',
    ],
    code: `int main() {
  // La ligne, morceau par morceau :
  //
  //   aller_retour(10, 8, ALPHABET[0], 5, 0, 250, 2);
  //                |   |  |            |  |  |    |
  //                |   |  |            |  |  |    +-- fois    : 2 allers-retours
  //                |   |  |            |  |  +------- vitesse : 250 ms par pas
  //                |   |  |            |  +---------- pasY    : 0, ne bouge pas sur Y
  //                |   |  |            +------------- pasX    : 5, l'autre bout est
  //                |   |  |                                     5 cases à droite
  //                |   |  +-------------------------- tuile   : la lettre A
  //                +---+----------------------------- x, y    : le départ (10, 8)
  //
  //      colonne :  10 11 12 13 14 15
  //      ligne 8 :   A → → → → →        l'aller : de (10, 8) à (15, 8)
  //                  ← ← ← ← ← ←        le retour : de (15, 8) à (10, 8)
  aller_retour(10, 8, ALPHABET[0], 5, 0, 250, 2);

  while (true) {
    image();          // le A est revenu à (10, 8)
  }
}
`,
    aVoir: 'Un A qui fait deux allers-retours de 5 cases vers la droite, et s’arrête à sa place.',
    controle: (c) => {
      const { A } = suivre(c, 'A', 400)
      const fois = A.filter((p) => p === '15,8').length
      return [
        ['deux fois au bout de droite (15, 8)', fois === 2, ` (${fois})`],
        ['jamais plus loin', !A.includes('16,8')],
        ['le A revient à sa place (10, 8)', A.at(-1) === '10,8', ` (${A.at(-1)})`],
      ]
    },
  },

  {
    titre: 'Aller et revenir : aller_retour — de base, ailleurs',
    difficulte: 0,
    suite: true,
    idee: 'Le 0.60 fait par le B, autour de (4, 4).',
    texte: [
      '**C’est le 0.60**, avec le **B**, autour de **(4, 4)** au lieu de (10, 8).',
      '**La forme tient entière** autour de (4, 4) : elle ne s’approche jamais à moins d’une case du bord.',
      '**C’est la version de base** : la deuxième place, seule. Le 0.60.2 met les deux ensemble.',
    ],
    code: `int main() {
  // Le B, en haut à gauche :
  aller_retour(4, 4, ALPHABET[1], 5, 0, 250, 2);

  while (true) {
    image();
  }
}
`,
    aVoir: 'La même forme qu’au 0.60, faite par le B en haut à gauche.',
    controle: (c) => {
      const { B } = suivre(c, 'B', 450, 18)
      return [
        ['le B passe par (9, 4)', B.includes('9,4')],
        ['le B finit en (4, 4)', B.at(-1) === '4,4', ` (${B.at(-1)})`],
      ]
    },
  },

  {
    titre: 'Aller et revenir : aller_retour — doublé, deux positions',
    difficulte: 0,
    suite: true,
    idee: 'La forme du A autour de (10, 8), puis celle du B autour de (4, 4).',
    texte: [
      '**C’est le 0.60 et le 0.60.1 réunis** : la même forme à deux places, l’une après l’autre.',
    ],
    code: `int main() {
  // 1. Le A, au milieu
  aller_retour(10, 8, ALPHABET[0], 5, 0, 250, 2);
  // 2. Le B, en haut à gauche
  aller_retour(4, 4, ALPHABET[1], 5, 0, 250, 2);

  while (true) {
    image();
  }
}
`,
    aVoir: 'La forme du A au milieu, puis celle du B en haut à gauche.',
    controle: (c) => {
      const { A, B } = suivre(c, 'AB', 900, 18)
      return [
        ['le A finit en (10, 8)', A.at(-1) === '10,8', ` (${A.at(-1)})`],
        ['le B finit en (4, 4)', B.at(-1) === '4,4', ` (${B.at(-1)})`],
      ]
    },
  },

  {
    titre: 'Aller et revenir en diagonale',
    difficulte: 0,
    idee: 'Le 0.60, plus une ligne : aller_retour avec 4 et 4, un va-et-vient en biais.',
    texte: [
      '**C’est le 0.60, plus une ligne :** un aller-retour **en diagonale**.',
      '**Ce qui est nouveau ici :** `pasX` **et** `pasY` à la fois : `4, 4`. L’autre bout est 4 cases à droite **et** 4 cases en bas, en (14, 12). À chaque pas, la lettre avance d’une case sur X et d’une case sur Y : elle va **en biais**, comme `deplace` au 0.26.',
      '**Plus vite, et une seule fois :** vitesse `100`, fois `1`.',
    ],
    code: `int main() {
  aller_retour(10, 8, ALPHABET[0], 5, 0, 250, 2);   // tout droit (le 0.60)

  // La ligne ajoutée : 4 à droite ET 4 en bas → en diagonale.
  //
  //      A                  de (10, 8)…
  //        ↘
  //          ↘              à chaque pas : +1 sur X ET +1 sur Y
  //            ↘
  //              ↘          …à (14, 12), puis retour par le même chemin
  aller_retour(10, 8, ALPHABET[0], 4, 4, 100, 1);

  while (true) {
    image();          // le A est revenu à (10, 8)
  }
}
`,
    aVoir: 'Deux allers-retours vers la droite, puis un aller-retour rapide en diagonale vers le bas.',
    controle: (c) => {
      const { A } = suivre(c, 'A', 500)
      return [
        ['la diagonale : (12, 10), puis le bout (14, 12)', A.includes('12,10') && A.includes('14,12')],
        ['jamais tout droit vers le bas : pas de (10, 12)', !A.includes('10,12')],
        ['le A revient à sa place (10, 8)', A.at(-1) === '10,8', ` (${A.at(-1)})`],
      ]
    },
  },

  {
    titre: 'Aller et revenir en diagonale — de base, ailleurs',
    difficulte: 0,
    suite: true,
    idee: 'Le 0.61 fait par le B, autour de (4, 4).',
    texte: [
      '**C’est le 0.61**, avec le **B**, autour de **(4, 4)** au lieu de (10, 8).',
      '**La forme tient entière** autour de (4, 4) : elle ne s’approche jamais à moins d’une case du bord.',
      '**C’est la version de base** : la deuxième place, seule. Le 0.61.2 met les deux ensemble.',
    ],
    code: `int main() {
  // Le B, en haut à gauche :
  aller_retour(4, 4, ALPHABET[1], 5, 0, 250, 2);
  aller_retour(4, 4, ALPHABET[1], 4, 4, 100, 1);

  while (true) {
    image();
  }
}
`,
    aVoir: 'La même forme qu’au 0.61, faite par le B en haut à gauche.',
    controle: (c) => {
      const { B } = suivre(c, 'B', 550, 18)
      return [
        ['le B passe par (8, 8)', B.includes('8,8')],
        ['le B finit en (4, 4)', B.at(-1) === '4,4', ` (${B.at(-1)})`],
      ]
    },
  },

  {
    titre: 'Aller et revenir en diagonale — doublé, deux positions',
    difficulte: 0,
    suite: true,
    idee: 'La forme du A autour de (10, 8), puis celle du B autour de (4, 4).',
    texte: [
      '**C’est le 0.61 et le 0.61.1 réunis** : la même forme à deux places, l’une après l’autre.',
    ],
    code: `int main() {
  // 1. Le A, au milieu
  aller_retour(10, 8, ALPHABET[0], 5, 0, 250, 2);
  aller_retour(10, 8, ALPHABET[0], 4, 4, 100, 1);
  // 2. Le B, en haut à gauche
  aller_retour(4, 4, ALPHABET[1], 5, 0, 250, 2);
  aller_retour(4, 4, ALPHABET[1], 4, 4, 100, 1);

  while (true) {
    image();
  }
}
`,
    aVoir: 'La forme du A au milieu, puis celle du B en haut à gauche.',
    controle: (c) => {
      const { A, B } = suivre(c, 'AB', 1100, 18)
      return [
        ['le A finit en (10, 8)', A.at(-1) === '10,8', ` (${A.at(-1)})`],
        ['le B finit en (4, 4)', B.at(-1) === '4,4', ` (${B.at(-1)})`],
      ]
    },
  },

  {
    titre: 'Deux formes ensemble',
    difficulte: 0,
    idee: 'Un losange et un rectangle : deux lettres, deux formes, chacune dans son coin de l’écran.',
    texte: [
      '**On commence à réunir les formes** : un losange (le 0.57) pour le A, un rectangle (le 0.58) pour le B.',
      '**Ce qui est nouveau ici :** deux formes **différentes** dans le même programme, avec des centres choisis pour qu’elles ne se touchent pas : le A en haut à gauche, le B en haut à droite.',
      '**Elles se font l’une après l’autre** : le B commence quand le A est revenu à son centre. Toutes deux à `100` ms par pas, pour que le tout ne dure pas trop.',
    ],
    code: `int main() {
  //   colonnes 2 à 6            colonnes 10 à 18
  //   +----------------+        +---------------------+
  //   |   A : losange  |        |   B : rectangle     |   lignes 2 à 6
  //   |  autour (4, 4) |        |   autour (14, 4)    |
  //   +----------------+        +---------------------+

  // 1. Le A : un losange, taille 2, sens 1, 100 ms par pas, 1 tour.
  losange(4, 4, ALPHABET[0], 2, 1, 100, 1);

  // 2. Le B : un rectangle de 9 × 5 (largeur 4, hauteur 2), dans l'autre
  //    sens (-1), 100 ms par pas, 1 tour.
  rectangle(14, 4, ALPHABET[1], 4, 2, -1, 100, 1);

  while (true) {
    image();          // A en (4, 4), B en (14, 4)
  }
}
`,
    aVoir: 'Le A fait un losange en haut à gauche, puis le B un rectangle en haut à droite.',
    controle: (c) => {
      const { A, B } = suivre(c, 'AB', 400)
      return [
        ['A : le losange, pointe de droite (6, 4)', A.includes('6,4') && A.includes('5,3')],
        ['B : le rectangle, coins (10, 2) et (18, 6)', B.includes('10,2') && B.includes('18,6')],
        ['chacun à sa place : A (4, 4), B (14, 4)', A.at(-1) === '4,4' && B.at(-1) === '14,4', ` (${A.at(-1)} ${B.at(-1)})`],
      ]
    },
  },

  {
    titre: 'Deux formes ensemble — de base, ailleurs',
    difficulte: 0,
    suite: true,
    idee: 'Les deux formes du 0.62, en bas de l’écran, faites par le C et le D.',
    texte: [
      '**C’est le 0.62**, avec les deux mêmes formes **en bas** de l’écran, par le C et le D.',
      '**C’est la version de base** : la deuxième place, seule. Le 0.62.2 met les deux ensemble.',
    ],
    code: `int main() {
  losange(4, 12, ALPHABET[2], 2, 1, 100, 1);           // le C, en bas à gauche
  rectangle(14, 12, ALPHABET[3], 4, 2, -1, 100, 1);   // le D, en bas à droite

  while (true) {
    image();
  }
}
`,
    aVoir: 'Un losange en bas à gauche, puis un rectangle en bas à droite.',
    controle: (c) => {
      const { C, D } = suivre(c, 'CD', 450, 18)
      return [
        ['le C finit en (4, 12)', C.at(-1) === '4,12', ` (${C.at(-1)})`],
        ['le D finit en (14, 12)', D.at(-1) === '14,12', ` (${D.at(-1)})`],
      ]
    },
  },

  {
    titre: 'Deux formes ensemble — doublé, deux positions',
    difficulte: 0,
    suite: true,
    idee: 'Quatre formes : les deux du haut, puis les deux du bas.',
    texte: [
      '**C’est le 0.62 et le 0.62.1 réunis** : les formes du haut, puis celles du bas.',
    ],
    code: `int main() {
  losange(4, 4, ALPHABET[0], 2, 1, 100, 1);            // le A, en haut à gauche
  rectangle(14, 4, ALPHABET[1], 4, 2, -1, 100, 1);    // le B, en haut à droite
  losange(4, 12, ALPHABET[2], 2, 1, 100, 1);           // le C, en bas à gauche
  rectangle(14, 12, ALPHABET[3], 4, 2, -1, 100, 1);   // le D, en bas à droite

  while (true) {
    image();
  }
}
`,
    aVoir: 'Losange et rectangle en haut, puis losange et rectangle en bas.',
    controle: (c) => {
      const { A, B, C, D } = suivre(c, 'ABCD', 800, 18)
      return [
        ['le A finit en (4, 4)', A.at(-1) === '4,4', ` (${A.at(-1)})`],
        ['le B finit en (14, 4)', B.at(-1) === '14,4', ` (${B.at(-1)})`],
        ['le C finit en (4, 12)', C.at(-1) === '4,12', ` (${C.at(-1)})`],
        ['le D finit en (14, 12)', D.at(-1) === '14,12', ` (${D.at(-1)})`],
      ]
    },
  },

  {
    titre: 'Trois formes ensemble',
    difficulte: 0,
    idee: 'Le 0.62, plus une spirale : le C tourne en bas à gauche.',
    texte: [
      '**C’est le 0.62, plus une ligne :** une spirale (le 0.59) pour le C, en bas à gauche de l’écran.',
      '**Ce qui est nouveau ici :** une troisième forme, sous les deux autres. `ALPHABET[2]` est la 3e lettre, le **C**.',
    ],
    code: `int main() {
  //   +----------------+        +---------------------+
  //   |   A : losange  |        |   B : rectangle     |   lignes 2 à 6
  //   +----------------+        +---------------------+
  //   +----------------+
  //   |   C : spirale  |                                  lignes 10 à 14
  //   |  autour (4,12) |
  //   +----------------+

  losange(4, 4, ALPHABET[0], 2, 1, 100, 1);           // 1. le A (le 0.62)
  rectangle(14, 4, ALPHABET[1], 4, 2, -1, 100, 1);    // 2. le B (le 0.62)

  // 3. La ligne ajoutée : le C, une spirale jusqu'à la taille 2 (5 × 5),
  //    sens des aiguilles, 100 ms par pas.
  spirale(4, 12, ALPHABET[2], 2, 1, 100);

  while (true) {
    image();          // A en (4, 4), B en (14, 4), C en (4, 12)
  }
}
`,
    aVoir: 'Le losange du A, le rectangle du B, puis la spirale du C en bas à gauche.',
    controle: (c) => {
      const { A, B, C } = suivre(c, 'ABC', 600)
      return [
        ['C : la spirale, jusqu’au coin (6, 10)', C.includes('6,10') && C.includes('3,13')],
        ['chacun à sa place : A (4, 4), B (14, 4), C (4, 12)',
          A.at(-1) === '4,4' && B.at(-1) === '14,4' && C.at(-1) === '4,12', ` (${A.at(-1)} ${B.at(-1)} ${C.at(-1)})`],
      ]
    },
  },

  {
    titre: 'Trois formes ensemble — de base, ailleurs',
    difficulte: 0,
    suite: true,
    idee: 'Une spirale de plus, en bas à droite : le D autour de (14, 12).',
    texte: [
      '**C’est le 0.63**, avec une spirale **en bas à droite**, par le D.',
      '**C’est la version de base** : la deuxième place, seule. Le 0.63.2 met les deux ensemble.',
    ],
    code: `int main() {
  spirale(14, 12, ALPHABET[3], 2, 1, 100);            // le D, en bas à droite

  while (true) {
    image();
  }
}
`,
    aVoir: 'Une spirale en bas à droite.',
    controle: (c) => {
      const { D } = suivre(c, 'D', 250, 18)
      return [
        ['le D passe par (16, 10)', D.includes('16,10')],
        ['le D finit en (14, 12)', D.at(-1) === '14,12', ` (${D.at(-1)})`],
      ]
    },
  },

  {
    titre: 'Trois formes ensemble — doublé, deux positions',
    difficulte: 0,
    suite: true,
    idee: 'Les trois formes du 0.63, puis la spirale du D.',
    texte: [
      '**C’est le 0.63 et le 0.63.1 réunis** : quatre formes, dont deux spirales.',
    ],
    code: `int main() {
  losange(4, 4, ALPHABET[0], 2, 1, 100, 1);            // le A, en haut à gauche
  rectangle(14, 4, ALPHABET[1], 4, 2, -1, 100, 1);    // le B, en haut à droite
  spirale(4, 12, ALPHABET[2], 2, 1, 100);             // le C, en bas à gauche
  spirale(14, 12, ALPHABET[3], 2, 1, 100);            // le D, en bas à droite

  while (true) {
    image();
  }
}
`,
    aVoir: 'Losange, rectangle, spirale, puis une seconde spirale en bas à droite.',
    controle: (c) => {
      const { A, B, C, D } = suivre(c, 'ABCD', 800, 18)
      return [
        ['le C finit en (4, 12)', C.at(-1) === '4,12', ` (${C.at(-1)})`],
        ['le D finit en (14, 12)', D.at(-1) === '14,12', ` (${D.at(-1)})`],
      ]
    },
  },

  {
    titre: 'Quatre formes ensemble',
    difficulte: 0,
    idee: 'Le 0.63, plus un aller-retour : le D va et vient en bas à droite. Quatre lettres, quatre formes.',
    texte: [
      '**C’est le 0.63, plus une ligne :** un aller-retour (le 0.60) pour le D, en bas à droite.',
      '**Ce qui est nouveau ici :** la quatrième forme. `ALPHABET[3]` est la 4e lettre, le **D** : on compte à partir de 0 (A = 0, B = 1, C = 2, D = 3).',
      '**Change un nombre et relance :** chaque forme a sa taille, son sens et sa vitesse. Tout ce qu’on a vu depuis le 0.34 est là.',
    ],
    code: `int main() {
  //   colonnes 2 à 6            colonnes 10 à 18
  //   +----------------+        +---------------------+
  //   |   A : losange  |        |   B : rectangle     |   lignes 2 à 6
  //   +----------------+        +---------------------+
  //   +----------------+        +---------------------+
  //   |   C : spirale  |        |   D : aller-retour  |   lignes 10 à 14
  //   +----------------+        +---------------------+

  losange(4, 4, ALPHABET[0], 2, 1, 100, 1);           // 1. le A
  rectangle(14, 4, ALPHABET[1], 4, 2, -1, 100, 1);    // 2. le B
  spirale(4, 12, ALPHABET[2], 2, 1, 100);             // 3. le C (le 0.63)

  // 4. La ligne ajoutée : le D (ALPHABET[3], la 4e lettre), un aller-retour
  //    de 7 cases vers la droite, 100 ms par pas, 1 fois.
  aller_retour(10, 13, ALPHABET[3], 7, 0, 100, 1);

  while (true) {
    image();          // les quatre lettres sont revenues à leur place
  }
}
`,
    aVoir: 'Le A fait un losange, le B un rectangle, le C une spirale, le D un aller-retour. Chacun finit à sa place.',
    controle: (c) => {
      const { A, B, C, D } = suivre(c, 'ABCD', 700)
      return [
        ['D : l’aller-retour jusqu’à (17, 13)', D.includes('17,13')],
        ['chacun à sa place : A (4, 4), B (14, 4), C (4, 12), D (10, 13)',
          A.at(-1) === '4,4' && B.at(-1) === '14,4' && C.at(-1) === '4,12' && D.at(-1) === '10,13',
          ` (${A.at(-1)} ${B.at(-1)} ${C.at(-1)} ${D.at(-1)})`],
      ]
    },
  },

  {
    titre: 'Quatre formes ensemble — de base, ailleurs',
    difficulte: 0,
    suite: true,
    idee: 'Un aller-retour de plus, sur la ligne 8 : le E, de (3, 8) à (17, 8).',
    texte: [
      '**C’est le 0.64**, avec un aller-retour **sur la ligne 8**, entre les formes du haut et celles du bas, par le E (`ALPHABET[4]`).',
      '**C’est la version de base** : la deuxième place, seule. Le 0.64.2 met les deux ensemble.',
    ],
    code: `int main() {
  aller_retour(3, 8, ALPHABET[4], 14, 0, 100, 1);     // le E, ligne 8

  while (true) {
    image();
  }
}
`,
    aVoir: 'Un E qui va de (3, 8) à (17, 8) et revient.',
    controle: (c) => {
      const { E } = suivre(c, 'E', 250, 18)
      return [
        ['le E passe par (17, 8)', E.includes('17,8')],
        ['le E finit en (3, 8)', E.at(-1) === '3,8', ` (${E.at(-1)})`],
      ]
    },
  },

  {
    titre: 'Quatre formes ensemble — doublé, deux positions',
    difficulte: 0,
    suite: true,
    idee: 'Cinq lettres, cinq formes : les quatre du 0.64 et l’aller-retour du E au milieu.',
    texte: [
      '**C’est le 0.64 et le 0.64.1 réunis** : les quatre formes, puis le E au milieu.',
    ],
    code: `int main() {
  losange(4, 4, ALPHABET[0], 2, 1, 100, 1);            // le A, en haut à gauche
  rectangle(14, 4, ALPHABET[1], 4, 2, -1, 100, 1);    // le B, en haut à droite
  spirale(4, 12, ALPHABET[2], 2, 1, 100);             // le C, en bas à gauche
  aller_retour(10, 13, ALPHABET[3], 7, 0, 100, 1);    // le D, en bas à droite
  aller_retour(3, 8, ALPHABET[4], 14, 0, 100, 1);     // le E, ligne 8

  while (true) {
    image();
  }
}
`,
    aVoir: 'Les quatre formes, puis le E fait un aller-retour au milieu de l’écran.',
    controle: (c) => {
      const { A, B, C, D, E } = suivre(c, 'ABCDE', 1000, 18)
      return [
        ['le D finit en (10, 13)', D.at(-1) === '10,13', ` (${D.at(-1)})`],
        ['le E finit en (3, 8)', E.at(-1) === '3,8', ` (${E.at(-1)})`],
      ]
    },
  },

  {
    titre: 'Une lettre qui avance',
    difficulte: 0,
    partie: 'La croix : le joueur',
    idee: 'Bouger, c’est effacer la lettre à sa place, puis la réécrire un peu plus loin.',
    texte: [
      '**Maintenant, la lettre ne s’arrête plus :** il n’y a plus de `pas`, elle avance tant que la console tourne.',
      'La lettre A avance d’une colonne toutes les **15 images**, soit quatre fois par seconde.',
      'Pour bouger, on **efface** d’abord l’ancienne place avec `effacer(x, 0, 1)`, une case ; puis on change `x`, et la lettre est réécrite à sa nouvelle place. Sans l’effacement, elle laisserait une traînée de A derrière elle.',
      'Au bout de la ligne, `x` revient à 0 : la lettre repart de la gauche.',
    ],
    code: `uint8_t x = 0;        // la colonne de la lettre
uint8_t images = 0;

int main() {
  while (true) {
    image();
    images++;

    if (images == 15) {       // 4 fois par seconde
      images = 0;
      effacer(x, 0, 1);       // 1. efface l'ancienne place
      x++;                    // 2. une colonne plus loin
      if (x == 20) x = 0;     //    au bout de la ligne, retour à gauche
    }

    poser(x, 0, ALPHABET[0]); // 3. la lettre à sa nouvelle place
  }
}
`,
    aVoir: 'Un A qui avance vers la droite, et repart de la gauche au bout de la ligne.',
    controle: (c) => {
      c.avancer(10)
      const debut = c.variable('x')
      c.avancer(60)
      const apres = c.variable('x')
      return [
        ['le A avance', apres > debut],
        ['il est à sa nouvelle place', c.mot(apres, 0, 1) === 'A'],
        ['et plus à l’ancienne', c.mot(debut, 0, 1) === ' '],
        ['un seul A sur la ligne', c.mot(0, 0, 20).trim() === 'A'],
      ]
    },
  },

  {
    titre: 'Une lettre qui avance — de base, ailleurs',
    difficulte: 0,
    suite: true,
    idee: 'Le 0.65 sur la ligne 8, avec le B.',
    texte: [
      '**C’est le 0.65**, avec le **B**, sur la **ligne 8**.',
      '**C’est la version de base** : la deuxième place, seule. Le 0.65.2 met les deux ensemble.',
    ],
    code: `uint8_t x = 0;        // la colonne de la lettre
uint8_t images = 0;

int main() {
  while (true) {
    image();
    images++;
    if (images == 15) {
      images = 0;
      effacer(x, 8, 1);
      x++;
      if (x == 20) x = 0;
    }
    poser(x, 8, ALPHABET[1]);   // le B, ligne 8
  }
}
`,
    aVoir: 'Un B qui avance sans fin sur la ligne 8.',
    controle: (c) => { c.avancer(10); const a = c.variable('x'); c.avancer(60); return [['le B avance', c.variable('x') !== a], ['sur la ligne 8', c.mot(c.variable('x'), 8, 1) === 'B']] },
  },

  {
    titre: 'Une lettre qui avance — doublé, deux positions',
    difficulte: 0,
    suite: true,
    idee: 'Le A et le B avancent ensemble : la même x, deux lignes.',
    texte: [
      '**C’est le 0.65 et le 0.65.1 réunis** : deux `effacer`, deux `poser`, la même `x`.',
    ],
    code: `uint8_t x = 0;        // la colonne des deux lettres
uint8_t images = 0;

int main() {
  while (true) {
    image();
    images++;
    if (images == 15) {
      images = 0;
      effacer(x, 0, 1);
      effacer(x, 8, 1);
      x++;
      if (x == 20) x = 0;
    }
    poser(x, 0, ALPHABET[0]);   // le A, ligne 0
    poser(x, 8, ALPHABET[1]);   // le B, ligne 8
  }
}
`,
    aVoir: 'Le A et le B avancent ensemble, sur la ligne 0 et sur la ligne 8.',
    controle: (c) => { c.avancer(70); const x = c.variable('x'); return [['le A et le B à la même colonne', c.mot(x, 0, 1) === 'A' && c.mot(x, 8, 1) === 'B', ` (x = ${x})`]] },
  },

  {
    titre: 'Une lettre qui avance — en simple',
    difficulte: 0,
    suite: true,
    idee: 'Le 0.65 en une ligne : defile(0, 0, 0, ALPHABET[0], 1, 250). La lettre file à droite et repart de la gauche, sans fin.',
    texte: [
      '**C’est le 0.65, en plus simple :** le chronomètre, l’effacement, `x++` et le retour à 0 sont remplacés par une seule ligne, `defile`.',
      '**`defile(numero, x, y, tuile, sens, vitesse)`**, une fonction de la console (voir le 0.76.12) : au premier appel, la lettre apparaît en (`x`, `y`) ; ensuite, un pas toutes les `vitesse` ms, à droite (`sens` 1) ou à gauche (-1). Au bord, elle repart de l’autre côté : exactement le `if (x == 20) x = 0;` du 0.65.',
      '**Plus de variables à déclarer :** la console retient elle-même où en est la lettre, grâce au numéro 0.',
    ],
    code: `int main() {
  while (true) {
    image();
    // Tout le 0.65 en une ligne :
    //   numero 0, départ (0, 0), le A, vers la droite (1), 250 ms par pas
    defile(0, 0, 0, ALPHABET[0], 1, 250);
  }
}
`,
    aVoir: 'Comme au 0.65 : un A qui avance vers la droite et repart de la gauche.',
    controle: (c) => {
      const { A } = suivre(c, 'A', 120)
      const cols = A.map((p) => Number(p.split(',')[0]))
      return [['le A avance vers la droite', cols.length >= 5 && cols[1] === cols[0] + 1], ['sur la ligne 0', A.every((p) => p.endsWith(',0'))]]
    },
  },

  {
    titre: 'La lettre bouge avec la croix',
    difficulte: 0,
    idee: 'Le joueur agit, l’écran répond : c’est déjà un jeu.',
    texte: [
      '`bouton(DROITE)` vaut vrai **tant que** la flèche droite est enfoncée. Même chose pour `GAUCHE`, `HAUT` et `BAS`.',
      'Bouger à chaque image ferait traverser l’écran en un tiers de seconde. `attente` impose donc **8 images** entre deux pas : en gardant la flèche enfoncée, la lettre avance d’une case environ sept fois par seconde.',
      'Les conditions `x < 19`, `x > 0`, `y < 17` et `y > 0` empêchent de sortir de l’écran.',
      'Voilà les trois ingrédients d’un jeu : la **boucle**, le **joueur qui agit**, et l’**écran qui répond**.',
    ],
    code: `uint8_t x = 9;        // la lettre part du milieu de l'écran
uint8_t y = 8;
uint8_t attente = 0;  // les images à attendre avant le prochain pas

int main() {
  while (true) {
    image();

    if (attente > 0) attente--;

    if (attente == 0) {
      effacer(x, y, 1);                               // efface l'ancienne place
      if (bouton(DROITE) && x < 19) { x++; attente = 8; }
      if (bouton(GAUCHE) && x > 0)  { x--; attente = 8; }
      if (bouton(BAS) && y < 17)    { y++; attente = 8; }
      if (bouton(HAUT) && y > 0)    { y--; attente = 8; }
    }

    poser(x, y, ALPHABET[0]);                         // la lettre à sa place
  }
}
`,
    aVoir: 'Un A au milieu de l’écran, qui se déplace avec les flèches.',
    controle: (c) => {
      c.avancer(10)
      const depart = c.mot(9, 8, 1)
      c.presser('right', 20)
      const x = c.variable('x')
      c.presser('down', 20)
      const y = c.variable('y')
      c.avancer(5)
      return [
        ['le A part du milieu', depart === 'A'],
        ['la flèche droite le déplace', x > 9],
        ['la flèche bas aussi', y > 8],
        ['il est à sa nouvelle place', c.mot(x, y, 1) === 'A'],
        ['et plus au départ', c.mot(9, 8, 1) === ' '],
      ]
    },
  },

  {
    titre: 'La lettre bouge avec la croix — de base, ailleurs',
    difficulte: 0,
    suite: true,
    idee: 'Le 0.66 avec le B, qui part de (4, 4).',
    texte: [
      '**C’est le 0.66**, avec le **B**, qui part de **(4, 4)** au lieu du milieu.',
      '**C’est la version de base** : la deuxième place, seule. Le 0.66.2 met les deux ensemble.',
    ],
    code: `uint8_t x = 4;        // la colonne du B
uint8_t y = 4;        // sa ligne
uint8_t attente = 0;

int main() {
  while (true) {
    image();
    if (attente > 0) attente--;
    if (attente == 0) {
      effacer(x, y, 1);
      if (bouton(DROITE)) { if (x < 19) x++; attente = 8; }
      if (bouton(GAUCHE)) { if (x > 0) x--; attente = 8; }
      if (bouton(BAS))    { if (y < 17) y++; attente = 8; }
      if (bouton(HAUT))   { if (y > 0) y--; attente = 8; }
    }
    poser(x, y, ALPHABET[1]);
  }
}
`,
    aVoir: 'Un B en haut à gauche, qui se déplace avec les flèches.',
    controle: (c) => {
      c.avancer(10)
      c.presser('right', 20)
      c.presser('down', 20)
      c.avancer(5)
      return [
        ['le B a bougé à droite et en bas', c.variable('x') > 4 && c.variable('y') > 4],
        ['il est à sa place', c.mot(c.variable('x'), c.variable('y'), 1) === 'B'],
      ]
    },
  },

  {
    titre: 'La lettre bouge avec la croix — doublé, deux positions',
    difficulte: 0,
    suite: true,
    idee: 'Le A et le B suivent la MÊME croix : ils bougent ensemble, chacun depuis sa place.',
    texte: [
      '**C’est le 0.66 et le 0.66.1 réunis** : les deux lettres, commandées par la même croix.',
      '**Une flèche, deux pas :** chaque bouton fait avancer les deux lettres ; chacune garde sa place et s’arrête à SON bord.',
    ],
    code: `uint8_t x = 9;        // la colonne du A
uint8_t y = 8;        // sa ligne
uint8_t xb = 4;        // la colonne du B
uint8_t yb = 4;        // sa ligne
uint8_t attente = 0;

int main() {
  while (true) {
    image();
    if (attente > 0) attente--;
    if (attente == 0) {
      effacer(x, y, 1);
      effacer(xb, yb, 1);
      if (bouton(DROITE)) { if (x < 19) x++; if (xb < 19) xb++; attente = 8; }
      if (bouton(GAUCHE)) { if (x > 0) x--; if (xb > 0) xb--; attente = 8; }
      if (bouton(BAS))    { if (y < 17) y++; if (yb < 17) yb++; attente = 8; }
      if (bouton(HAUT))   { if (y > 0) y--; if (yb > 0) yb--; attente = 8; }
    }
    poser(x, y, ALPHABET[0]);
    poser(xb, yb, ALPHABET[1]);
  }
}
`,
    aVoir: 'Le A et le B bougent ensemble avec les flèches.',
    controle: (c) => {
      c.avancer(10)
      c.presser('right', 20)
      c.presser('down', 20)
      c.avancer(5)
      return [
        ['le A et le B ont fait les mêmes pas', c.variable('x') - 9 === c.variable('xb') - 4 && c.variable('x') > 9],
        ['chacun à sa place', c.mot(c.variable('x'), c.variable('y'), 1) === 'A' && c.mot(c.variable('xb'), c.variable('yb'), 1) === 'B'],
      ]
    },
  },

  {
    titre: 'La lettre bouge avec la croix — en simple',
    difficulte: 0,
    suite: true,
    idee: 'Le 0.66 en une ligne : deplace_croix(x, y, ALPHABET[0], 133). Plus d’attente ni d’effacer à écrire.',
    texte: [
      '**C’est le 0.66, en plus simple :** tout le bloc de la croix (l’attente, l’effacement, les quatre `if`, le `poser`) est remplacé par une ligne, `deplace_croix` (le 0.71).',
      '**La vitesse, 133 ms :** c’est 8 images, exactement l’`attente = 8` du 0.66. La lettre va donc à la même vitesse.',
      '**Et elle ne clignote plus :** `deplace_croix` n’efface l’ancienne case que si la lettre a bougé. Le 0.66 effaçait et reposait à chaque pas possible.',
    ],
    code: `uint8_t x = 9;        // la lettre part du milieu de l'écran
uint8_t y = 8;

int main() {
  while (true) {
    image();
    deplace_croix(x, y, ALPHABET[0], 133);   // tout le bloc du 0.66 : 133 ms = 8 images
  }
}
`,
    aVoir: 'Comme au 0.66 : un A au milieu, qui se déplace avec les flèches.',
    controle: (c) => {
      c.avancer(10)
      c.presser('right', 20)
      c.presser('down', 20)
      c.avancer(5)
      return [['la croix le déplace', c.variable('x') > 9 && c.variable('y') > 8], ['il est à sa place', c.mot(c.variable('x'), c.variable('y'), 1) === 'A']]
    },
  },

  {
    titre: 'Les variables de la lettre dans leur propre fichier',
    difficulte: 0,
    idee: 'Le 0.66, rangé en deux : x, y et attente déménagent dans « variables.h » ; principal.cpp n’a plus que la boucle du jeu.',
    texte: [
      '**C’est exactement le programme du 0.66**, avec un seul changement : les **trois variables** du haut (`x`, `y`, `attente`) ne sont plus dans `principal.cpp`. Elles sont dans un **second fichier**, `variables.h` : c’est l’**onglet** à côté de `principal.cpp`, au-dessus du code.',
      '**Ce qui est nouveau ici : un programme en deux fichiers.** `principal.cpp` est le fichier **principal** : c’est par lui que la compilation commence. `variables.h` est un fichier **voisin** : il ne fait rien tout seul, il attend qu’on le verse quelque part.',
      '**`#include "variables.h"`** veut dire : « **verse ici** tout ce qu’il y a dans `variables.h` ». Avant de compiler, la console remplace cette ligne par le contenu du fichier, mot pour mot. Le programme compilé est donc **exactement le même** qu’au 0.66 : il est seulement rangé en deux.',
      '**Pourquoi tout en haut :** une variable doit être déclarée **avant** qu’on s’en serve. `main()` utilise `x`, `y` et `attente` : le `#include` qui les apporte vient donc avant `main()`.',
      '**Le `.h`** est une habitude du C : il veut dire « *header* », en-tête, un fichier fait pour être versé en haut d’un autre. Les guillemets autour du nom disent que le fichier est **à côté** du programme.',
      '**À quoi ça sert :** d’un côté **l’état du jeu** (où est la lettre, combien attendre), de l’autre **ce qu’on en fait** (la boucle, les boutons). Pour changer la place de départ de la lettre, on n’ouvre que `variables.h`, sans toucher à la boucle.',
    ],
    fichiers: {
      'variables.h': `// variables.h : l'ÉTAT de la lettre qui bouge.
// Ce fichier ne fait rien tout seul : principal.cpp le verse chez lui
// avec #include "variables.h", tout en haut, avant main().

uint8_t x = 9;        // la COLONNE de la lettre : elle part du milieu (9)
uint8_t y = 8;        // la LIGNE de la lettre   : elle part du milieu (8)
uint8_t attente = 0;  // les images à attendre avant le prochain pas (0 : tout de suite)
`,
    },
    code: `// Le changement : les trois variables ne sont plus ici.
//
//   #include "variables.h"
//   |         |
//   |         +-- le fichier à verser : l'onglet « variables.h », à côté
//   +------------ « verse ici » : avant la compilation, cette ligne est
//                 remplacée par tout le contenu de variables.h. Tout se passe
//                 comme si x, y et attente étaient écrits ici, comme au 0.66.
#include "variables.h"

int main() {
  // La boucle du jeu : exactement celle du 0.66. Elle se sert de x, y et
  // attente, qui viennent de variables.h.
  while (true) {
    image();                                          // attend l'image suivante

    if (attente > 0) attente--;                       // le temps passe

    if (attente == 0) {                               // on peut faire un pas
      effacer(x, y, 1);                               // efface l'ancienne place
      if (bouton(DROITE) && x < 19) { x++; attente = 8; }
      if (bouton(GAUCHE) && x > 0)  { x--; attente = 8; }
      if (bouton(BAS) && y < 17)    { y++; attente = 8; }
      if (bouton(HAUT) && y > 0)    { y--; attente = 8; }
    }

    poser(x, y, ALPHABET[0]);                         // la lettre à sa place
  }
}
`,
    aVoir: 'Exactement le 0.66 : un A au milieu de l’écran, qui se déplace avec les flèches. Mais le programme est rangé en deux onglets.',
    controle: (c) => {
      c.avancer(10)
      const depart = c.mot(9, 8, 1)
      c.presser('right', 20)
      const x = c.variable('x')
      c.presser('down', 20)
      const y = c.variable('y')
      c.avancer(5)
      return [
        ['x et y viennent de variables.h : le A part du milieu (9, 8)', depart === 'A'],
        ['la flèche droite le déplace', x > 9],
        ['la flèche bas aussi', y > 8],
        ['il est à sa nouvelle place', c.mot(x, y, 1) === 'A'],
      ]
    },
  },

  {
    titre: 'Les variables de la lettre dans leur propre fichier — de base, ailleurs',
    difficulte: 0,
    suite: true,
    idee: 'Le 0.67 avec le B : seul variables.h change (le départ en (4, 4)).',
    texte: [
      '**C’est le 0.67**, avec le **B**, qui part de (4, 4) : le départ change dans `variables.h`.',
      '**C’est l’intérêt du fichier à part :** pour changer la place de départ, on n’a touché que `variables.h`.',
      '**C’est la version de base** : la deuxième place, seule. Le 0.67.2 met les deux ensemble.',
    ],
    fichiers: {
      'variables.h': `// variables.h : l'ÉTAT des lettres qui bougent.
uint8_t x = 4;       // la colonne du B
uint8_t y = 4;       // sa ligne
uint8_t attente = 0;
`,
    },
    code: `// voir l'onglet variables.h
#include "variables.h"

int main() {
  while (true) {
    image();
    if (attente > 0) attente--;
    if (attente == 0) {
      effacer(x, y, 1);
      if (bouton(DROITE)) { if (x < 19) x++; attente = 8; }
      if (bouton(GAUCHE)) { if (x > 0) x--; attente = 8; }
      if (bouton(BAS))    { if (y < 17) y++; attente = 8; }
      if (bouton(HAUT))   { if (y > 0) y--; attente = 8; }
    }
    poser(x, y, ALPHABET[1]);
  }
}
`,
    aVoir: 'Un B qui part de (4, 4) et se déplace avec les flèches.',
    controle: (c) => {
      c.avancer(10)
      c.presser('right', 20)
      c.presser('down', 20)
      c.avancer(5)
      return [
        ['le B a bougé', c.variable('x') > 4],
        ['il est à sa place', c.mot(c.variable('x'), c.variable('y'), 1) === 'B'],
      ]
    },
  },

  {
    titre: 'Les variables de la lettre dans leur propre fichier — doublé, deux positions',
    difficulte: 0,
    suite: true,
    idee: 'Deux lettres, et leurs quatre variables dans variables.h.',
    texte: [
      '**C’est le 0.67 et le 0.67.1 réunis** : les deux lettres ; `variables.h` porte leurs quatre variables.',
    ],
    fichiers: {
      'variables.h': `// variables.h : l'ÉTAT des lettres qui bougent.
uint8_t x = 9;       // la colonne du A
uint8_t y = 8;       // sa ligne
uint8_t xb = 4;       // la colonne du B
uint8_t yb = 4;       // sa ligne
uint8_t attente = 0;
`,
    },
    code: `// voir l'onglet variables.h
#include "variables.h"

int main() {
  while (true) {
    image();
    if (attente > 0) attente--;
    if (attente == 0) {
      effacer(x, y, 1);
      effacer(xb, yb, 1);
      if (bouton(DROITE)) { if (x < 19) x++; if (xb < 19) xb++; attente = 8; }
      if (bouton(GAUCHE)) { if (x > 0) x--; if (xb > 0) xb--; attente = 8; }
      if (bouton(BAS))    { if (y < 17) y++; if (yb < 17) yb++; attente = 8; }
      if (bouton(HAUT))   { if (y > 0) y--; if (yb > 0) yb--; attente = 8; }
    }
    poser(x, y, ALPHABET[0]);
    poser(xb, yb, ALPHABET[1]);
  }
}
`,
    aVoir: 'Le A et le B bougent ensemble avec les flèches.',
    controle: (c) => {
      c.avancer(10)
      c.presser('right', 20)
      c.presser('down', 20)
      c.avancer(5)
      return [
        ['les deux ont bougé', c.variable('x') > 9 && c.variable('xb') > 4],
      ]
    },
  },

  {
    titre: 'Les variables de la lettre dans leur propre fichier — en simple',
    difficulte: 0,
    suite: true,
    idee: 'Le 0.67 en simple : variables.h ne garde que x et y ; principal.cpp, une ligne dans la boucle.',
    texte: [
      '**C’est le 0.67, en plus simple :** la boucle de la croix est remplacée par une ligne, `deplace_croix`.',
      '**`variables.h` rétrécit aussi :** plus besoin d’`attente`, la console la tient elle-même. Il ne reste que `x` et `y`, la place de la lettre.',
    ],
    fichiers: {
      'variables.h': `// variables.h : la place de la lettre. L'attente, la console la tient.
uint8_t x = 9;
uint8_t y = 8;
`,
    },
    code: `// x et y : voir l'onglet variables.h
#include "variables.h"

int main() {
  while (true) {
    image();
    deplace_croix(x, y, ALPHABET[0], 133);
  }
}
`,
    aVoir: 'Comme au 0.67 : un A qui se déplace avec les flèches, programme en deux onglets.',
    controle: (c) => {
      c.avancer(10)
      c.presser('right', 20)
      c.avancer(5)
      return [['la croix le déplace', c.variable('x') > 9], ['il est à sa place', c.mot(c.variable('x'), 8, 1) === 'A']]
    },
  },

  {
    titre: 'Voir la position du A en direct',
    difficulte: 0,
    idee: 'Le 0.67, plus deux lignes dans la boucle : nombre(0, 17, x) et nombre(4, 17, y). La position du A s’affiche à chaque image, pendant qu’on le déplace.',
    texte: [
      '**C’est le 0.67, plus deux lignes** dans la boucle : `nombre(0, 17, x);` et `nombre(4, 17, y);`.',
      '**Ce qui est nouveau ici : `nombre()` DANS la boucle.** Au 0.20, `nombre()` était appelé une fois, après un trajet : il montrait la valeur à ce moment-là. Ici, il est dans `while (true)` : il est rappelé à **chaque image**, 60 fois par seconde. L’écran montre donc toujours la valeur **du moment** : c’est de l’affichage **en temps réel**.',
      '**Ce qu’on voit :** en bas à gauche, trois chiffres pour `x` (la colonne du A), et à côté, trois chiffres pour `y` (sa ligne). Appuie sur les flèches : les nombres changent en même temps que la lettre bouge. Au départ, `009` et `008`, le milieu de l’écran.',
      '**Pourquoi avant `poser` :** si le A va sur la ligne 17, il passe **par-dessus** les nombres, parce qu’il est posé après eux. Les nombres sont réécrits à l’image suivante, dès que le A repart.',
      '**Sans rien écrire, la page le montre aussi :** sous la console, ouvre « 🔬 Inspecteur », onglet **Variables** : `x`, `y` et `attente` y sont, par leur nom, mis à jour 4 fois par seconde.',
    ],
    fichiers: {
      'variables.h': `// variables.h : l'ÉTAT de la lettre qui bouge (comme au 0.67).

uint8_t x = 9;        // la COLONNE de la lettre : elle part du milieu (9)
uint8_t y = 8;        // la LIGNE de la lettre   : elle part du milieu (8)
uint8_t attente = 0;  // les images à attendre avant le prochain pas
`,
    },
    code: `// x, y, attente : voir l'onglet variables.h. (#include veut être seul sur sa ligne.)
#include "variables.h"

int main() {
  while (true) {
    image();                                          // attend l'image suivante

    if (attente > 0) attente--;

    if (attente == 0) {
      effacer(x, y, 1);                               // efface l'ancienne place
      if (bouton(DROITE) && x < 19) { x++; attente = 8; }
      if (bouton(GAUCHE) && x > 0)  { x--; attente = 8; }
      if (bouton(BAS) && y < 17)    { y++; attente = 8; }
      if (bouton(HAUT) && y > 0)    { y--; attente = 8; }
    }

    // Les deux lignes ajoutées : la position du A, réécrite à CHAQUE image.
    //
    //   nombre(0, 17, x);        nombre(4, 17, y);
    //          |  |   |                 |  |   |
    //          |  |   +-- x : la colonne |  |   +-- y : la ligne du A
    //          |  +------ ligne 17 : tout en bas de l'écran
    //          +--------- colonne 0 et colonne 4 : côte à côte
    //
    //   En bas de l'écran :  009 008   ← le A au départ, en (9, 8)
    //                        012 010   ← après 3 pas à droite et 2 en bas
    nombre(0, 17, x);                                 // la colonne, en direct
    nombre(4, 17, y);                                 // la ligne, en direct

    poser(x, y, ALPHABET[0]);                         // la lettre, par-dessus tout
  }
}
`,
    aVoir: 'Le A qui se déplace avec les flèches ; en bas à gauche, sa colonne et sa ligne changent en même temps.',
    controle: (c) => {
      c.avancer(10)
      const auDepart = c.mot(0, 17, 7)
      c.presser('right', 30)
      c.presser('up', 20)
      c.avancer(5)
      const x = c.variable('x')
      const y = c.variable('y')
      return [
        ['au départ, 009 et 008', auDepart === '009 008', ` (« ${auDepart} »)`],
        ['le A a bougé', x > 9 && y < 8, ` (x = ${x}, y = ${y})`],
        ['l’écran montre sa colonne', Number(c.mot(0, 17, 3)) === x, ` (« ${c.mot(0, 17, 3)} »)`],
        ['et sa ligne', Number(c.mot(4, 17, 3)) === y, ` (« ${c.mot(4, 17, 3)} »)`],
      ]
    },
  },

  {
    titre: 'Voir la position du A en direct — de base, ailleurs',
    difficulte: 0,
    suite: true,
    idee: 'Le 0.68 avec le B, parti de (4, 4) : sa position en direct.',
    texte: [
      '**C’est le 0.68**, avec le **B**, parti de (4, 4) ; ses nombres en bas à gauche.',
      '**C’est la version de base** : la deuxième place, seule. Le 0.68.2 met les deux ensemble.',
    ],
    fichiers: {
      'variables.h': `// variables.h : l'ÉTAT des lettres qui bougent.
uint8_t x = 4;       // la colonne du B
uint8_t y = 4;       // sa ligne
uint8_t attente = 0;
`,
    },
    code: `// voir l'onglet variables.h
#include "variables.h"

int main() {
  while (true) {
    image();
    if (attente > 0) attente--;
    if (attente == 0) {
      effacer(x, y, 1);
      if (bouton(DROITE)) { if (x < 19) x++; attente = 8; }
      if (bouton(GAUCHE)) { if (x > 0) x--; attente = 8; }
      if (bouton(BAS))    { if (y < 17) y++; attente = 8; }
      if (bouton(HAUT))   { if (y > 0) y--; attente = 8; }
    }
    nombre(0, 17, x);
    nombre(4, 17, y);
    poser(x, y, ALPHABET[1]);
  }
}
`,
    aVoir: 'Un B qui bouge avec les flèches ; sa colonne et sa ligne en bas à gauche.',
    controle: (c) => {
      c.avancer(10)
      c.presser('right', 20)
      c.presser('down', 20)
      c.avancer(5)
      return [
        ['l’écran montre la colonne du B', Number(c.mot(0, 17, 3)) === c.variable('x')],
        ['et sa ligne', Number(c.mot(4, 17, 3)) === c.variable('y')],
      ]
    },
  },

  {
    titre: 'Voir la position du A en direct — doublé, deux positions',
    difficulte: 0,
    suite: true,
    idee: 'Les deux positions en direct : le A à gauche, le B à droite de la ligne 17.',
    texte: [
      '**C’est le 0.68 et le 0.68.1 réunis** : deux lettres, quatre nombres.',
    ],
    fichiers: {
      'variables.h': `// variables.h : l'ÉTAT des lettres qui bougent.
uint8_t x = 9;       // la colonne du A
uint8_t y = 8;       // sa ligne
uint8_t xb = 4;       // la colonne du B
uint8_t yb = 4;       // sa ligne
uint8_t attente = 0;
`,
    },
    code: `// voir l'onglet variables.h
#include "variables.h"

int main() {
  while (true) {
    image();
    if (attente > 0) attente--;
    if (attente == 0) {
      effacer(x, y, 1);
      effacer(xb, yb, 1);
      if (bouton(DROITE)) { if (x < 19) x++; if (xb < 19) xb++; attente = 8; }
      if (bouton(GAUCHE)) { if (x > 0) x--; if (xb > 0) xb--; attente = 8; }
      if (bouton(BAS))    { if (y < 17) y++; if (yb < 17) yb++; attente = 8; }
      if (bouton(HAUT))   { if (y > 0) y--; if (yb > 0) yb--; attente = 8; }
    }
    nombre(0, 17, x);
    nombre(4, 17, y);
    nombre(10, 17, xb);
    nombre(14, 17, yb);
    poser(x, y, ALPHABET[0]);
    poser(xb, yb, ALPHABET[1]);
  }
}
`,
    aVoir: 'Le A et le B bougent ; en bas, leurs deux positions.',
    controle: (c) => {
      c.avancer(10)
      c.presser('right', 20)
      c.presser('down', 20)
      c.avancer(5)
      return [
        ['la position du A', Number(c.mot(0, 17, 3)) === c.variable('x')],
        ['celle du B', Number(c.mot(10, 17, 3)) === c.variable('xb')],
      ]
    },
  },

  {
    titre: 'Voir la position du A en direct — en simple',
    difficulte: 0,
    suite: true,
    idee: 'Le 0.68 en simple : deplace_croix, puis les deux nombre. Trois lignes dans la boucle.',
    texte: [
      '**C’est le 0.68, en plus simple :** la croix tient en une ligne, `deplace_croix` ; il reste les deux `nombre` qui montrent la position.',
      '**Trois lignes font tout :** bouger, montrer la colonne, montrer la ligne.',
    ],
    fichiers: {
      'variables.h': `uint8_t x = 9;
uint8_t y = 8;
`,
    },
    code: `// x et y : voir l'onglet variables.h
#include "variables.h"

int main() {
  while (true) {
    image();
    deplace_croix(x, y, ALPHABET[0], 133);   // bouger
    nombre(0, 17, x);                        // la colonne, en direct
    nombre(4, 17, y);                        // la ligne, en direct
  }
}
`,
    aVoir: 'Comme au 0.68 : le A bouge, sa position s’affiche en bas.',
    controle: (c) => {
      c.avancer(10)
      c.presser('right', 30)
      c.avancer(5)
      return [['l’écran montre la colonne', Number(c.mot(0, 17, 3)) === c.variable('x') && c.variable('x') > 9], ['et la ligne', Number(c.mot(4, 17, 3)) === c.variable('y')]]
    },
  },

  {
    titre: 'Chercher le A sur l’écran : lire',
    difficulte: 0,
    idee: 'Le 0.68, plus une recherche : quand on appuie sur A, le programme regarde chaque case de l’écran avec lire(), et affiche où il a trouvé la lettre.',
    texte: [
      '**C’est le 0.68, plus un bloc** : quand on appuie sur le bouton **A**, le programme **cherche** la lettre sur l’écran, case par case, et affiche où il l’a trouvée.',
      '**Ce qui est nouveau ici : `lire(colonne, ligne)`.** Elle **rend la tuile affichée** dans une case de l’écran. `lire(9, 8) == ALPHABET[0]` est vrai si la case (9, 8) montre un A.',
      '**La recherche :** deux boucles `for`, l’une dans l’autre, passent sur **toutes les cases** : `l` fait les 18 lignes (0 à 17), et pour chaque ligne, `c` fait les 20 colonnes (0 à 19). Soit 18 × 20 = **360 cases**. Quand une case contient le A, on retient sa colonne dans `trouveX` et sa ligne dans `trouveY`.',
      '**Deux façons de connaître la position.** `x` et `y` : le programme la **retient** lui-même, à chaque pas. `lire()` : il la **retrouve** en regardant l’écran, sans rien avoir retenu. Les deux nombres affichés (en bas à gauche, et à droite après avoir appuyé sur A) sont **les mêmes** : c’est la preuve que les deux façons s’accordent.',
      '**À quoi sert `lire()` :** à savoir **ce qu’il y a à un endroit**, pas seulement où est sa propre lettre. Plus tard, c’est ainsi qu’on saura si une case est un mur, une pièce, un ennemi.',
      '**Pourquoi seulement quand on appuie sur A :** regarder 360 cases prend du temps. Le faire à chaque image ralentirait le jeu ; on ne le fait que quand on le demande.',
    ],
    fichiers: {
      'variables.h': `// variables.h : l'ÉTAT de la lettre qui bouge, et ce que la recherche a trouvé.

uint8_t x = 9;        // la COLONNE de la lettre : elle part du milieu (9)
uint8_t y = 8;        // la LIGNE de la lettre   : elle part du milieu (8)
uint8_t attente = 0;  // les images à attendre avant le prochain pas

uint8_t trouveX = 0;  // la colonne où lire() a trouvé le A (nouveau)
uint8_t trouveY = 0;  // la ligne où lire() a trouvé le A (nouveau)
`,
    },
    code: `// x, y, attente, trouveX, trouveY : voir l'onglet variables.h
#include "variables.h"

int main() {
  while (true) {
    image();

    if (attente > 0) attente--;

    if (attente == 0) {
      effacer(x, y, 1);
      if (bouton(DROITE) && x < 19) { x++; attente = 8; }
      if (bouton(GAUCHE) && x > 0)  { x--; attente = 8; }
      if (bouton(BAS) && y < 17)    { y++; attente = 8; }
      if (bouton(HAUT) && y > 0)    { y--; attente = 8; }
    }

    nombre(0, 17, x);                   // ce que le programme RETIENT : x…
    nombre(4, 17, y);                   // …et y (le 0.68)
    poser(x, y, ALPHABET[0]);

    // Le bloc ajouté : quand on appuie sur A, on CHERCHE la lettre sur l'écran.
    if (bouton(A)) {
      for (uint8_t l = 0; l < 18; l++) {        // chaque ligne, de 0 à 17…
        for (uint8_t c = 0; c < 20; c++) {      // …et dans chaque ligne, chaque colonne
          // lire(c, l) : la tuile affichée dans la case (c, l).
          //
          //   if (lire(c, l) == ALPHABET[0])
          //       |    |  |     |
          //       |    |  |     +-- la tuile du A
          //       |    +--+-------- la case regardée : colonne c, ligne l
          //       +---------------- rend ce que l'écran montre là
          if (lire(c, l) == ALPHABET[0]) {
            trouveX = c;                // trouvé : on retient la colonne…
            trouveY = l;                // …et la ligne
          }
        }
      }
      nombre(10, 17, trouveX);          // ce que lire() a TROUVÉ, à droite :
      nombre(14, 17, trouveY);          // les mêmes nombres que x et y
    }
  }
}
`,
    aVoir: 'Le A se déplace avec les flèches. Quand on appuie sur A, sa position trouvée sur l’écran s’affiche à droite, en bas : la même que celle de gauche.',
    controle: (c) => {
      c.avancer(10)
      c.presser('right', 25)
      c.presser('down', 12)
      c.avancer(5)
      const x = c.variable('x')
      const y = c.variable('y')
      c.presser('a', 10)
      c.avancer(5)
      return [
        ['le A a bougé', x > 9 && y > 8, ` (x = ${x}, y = ${y})`],
        ['lire() l’a trouvé à la bonne colonne', c.variable('trouveX') === x, ` (trouveX = ${c.variable('trouveX')})`],
        ['et à la bonne ligne', c.variable('trouveY') === y, ` (trouveY = ${c.variable('trouveY')})`],
        ['les deux affichages s’accordent', c.mot(0, 17, 3) === c.mot(10, 17, 3) && c.mot(4, 17, 3) === c.mot(14, 17, 3),
          ` (« ${c.mot(0, 17, 17)} »)`],
      ]
    },
  },

  {
    titre: 'Chercher le A sur l’écran : lire — de base, ailleurs',
    difficulte: 0,
    suite: true,
    idee: 'On cherche le B, cette fois : lire(c, l) == ALPHABET[1].',
    texte: [
      '**C’est le 0.69**, avec le **B**, parti de (4, 4) ; la recherche compare à `ALPHABET[1]`.',
      '**C’est la version de base** : la deuxième place, seule. Le 0.69.2 met les deux ensemble.',
    ],
    fichiers: {
      'variables.h': `// variables.h : l'ÉTAT des lettres qui bougent.
uint8_t x = 4;       // la colonne du B
uint8_t y = 4;       // sa ligne
uint8_t attente = 0;
uint8_t trouveX = 0;
uint8_t trouveY = 0;
`,
    },
    code: `// voir l'onglet variables.h
#include "variables.h"

int main() {
  while (true) {
    image();
    if (attente > 0) attente--;
    if (attente == 0) {
      effacer(x, y, 1);
      if (bouton(DROITE)) { if (x < 19) x++; attente = 8; }
      if (bouton(GAUCHE)) { if (x > 0) x--; attente = 8; }
      if (bouton(BAS))    { if (y < 17) y++; attente = 8; }
      if (bouton(HAUT))   { if (y > 0) y--; attente = 8; }
    }
    nombre(0, 17, x);
    nombre(4, 17, y);
    poser(x, y, ALPHABET[1]);
    if (bouton(A)) {
      for (uint8_t l = 0; l < 18; l++) {
        for (uint8_t c = 0; c < 20; c++) {
          if (lire(c, l) == ALPHABET[1]) { trouveX = c; trouveY = l; }   // cherche le B
        }
      }
      nombre(10, 17, trouveX);
      nombre(14, 17, trouveY);
    }
  }
}
`,
    aVoir: 'Un B qui bouge ; avec A, sa position trouvée s’affiche à droite.',
    controle: (c) => { c.avancer(10); c.presser('right', 25); c.presser('a', 10); c.avancer(5); return [['lire() a trouvé le B à sa colonne', c.variable('trouveX') === c.variable('x')], ['et à sa ligne', c.variable('trouveY') === c.variable('y')]] },
  },

  {
    titre: 'Chercher le A sur l’écran : lire — doublé, deux positions',
    difficulte: 0,
    suite: true,
    idee: 'Deux lettres, et la recherche du B : lire() distingue les lettres.',
    texte: [
      '**C’est le 0.69 et le 0.69.1 réunis** : le A et le B bougent ; la recherche ne trouve que le B.',
      '**`lire` compare des tuiles :** `ALPHABET[1]` n’est égal qu’au B. Le A, sur une autre case, est ignoré.',
    ],
    fichiers: {
      'variables.h': `// variables.h : l'ÉTAT des lettres qui bougent.
uint8_t x = 9;       // la colonne du A
uint8_t y = 8;       // sa ligne
uint8_t xb = 4;       // la colonne du B
uint8_t yb = 4;       // sa ligne
uint8_t attente = 0;
uint8_t trouveX = 0;
uint8_t trouveY = 0;
`,
    },
    code: `// voir l'onglet variables.h
#include "variables.h"

int main() {
  while (true) {
    image();
    if (attente > 0) attente--;
    if (attente == 0) {
      effacer(x, y, 1);
      effacer(xb, yb, 1);
      if (bouton(DROITE)) { if (x < 19) x++; if (xb < 19) xb++; attente = 8; }
      if (bouton(GAUCHE)) { if (x > 0) x--; if (xb > 0) xb--; attente = 8; }
      if (bouton(BAS))    { if (y < 17) y++; if (yb < 17) yb++; attente = 8; }
      if (bouton(HAUT))   { if (y > 0) y--; if (yb > 0) yb--; attente = 8; }
    }
    nombre(0, 17, x);
    nombre(4, 17, y);
    poser(x, y, ALPHABET[0]);
    poser(xb, yb, ALPHABET[1]);
    if (bouton(A)) {
      for (uint8_t l = 0; l < 18; l++) {
        for (uint8_t c = 0; c < 20; c++) {
          if (lire(c, l) == ALPHABET[1]) { trouveX = c; trouveY = l; }   // cherche le B
        }
      }
      nombre(10, 17, trouveX);
      nombre(14, 17, trouveY);
    }
  }
}
`,
    aVoir: 'Le A et le B bougent ; avec A, c’est la position du B qui s’affiche à droite.',
    controle: (c) => { c.avancer(10); c.presser('right', 25); c.presser('a', 10); c.avancer(5); return [['lire() a trouvé le B, pas le A', c.variable('trouveX') === c.variable('xb') && c.variable('trouveY') === c.variable('yb')]] },
  },

  {
    titre: 'Chercher le A sur l’écran : lire — en simple',
    difficulte: 0,
    suite: true,
    idee: 'Le 0.69 en simple : la croix en une ligne ; la recherche avec lire() reste, c’est elle qu’on apprend ici.',
    texte: [
      '**C’est le 0.69, en plus simple :** la croix est remplacée par `deplace_croix`.',
      '**La recherche, elle, reste écrite à la main :** c’est ce que la leçon apprend, `lire()` et les deux boucles. Simplifier, ce n’est pas tout cacher : on ne cache que ce qu’on sait déjà faire.',
    ],
    fichiers: {
      'variables.h': `uint8_t x = 9;
uint8_t y = 8;
uint8_t trouveX = 0;  // la colonne où lire() a trouvé le A
uint8_t trouveY = 0;  // sa ligne
`,
    },
    code: `// x, y, trouveX, trouveY : voir l'onglet variables.h
#include "variables.h"

int main() {
  while (true) {
    image();
    deplace_croix(x, y, ALPHABET[0], 133);
    nombre(0, 17, x);
    nombre(4, 17, y);

    if (bouton(A)) {                             // on cherche le A sur l'écran
      for (uint8_t l = 0; l < 18; l++) {
        for (uint8_t c = 0; c < 20; c++) {
          if (lire(c, l) == ALPHABET[0]) {
            trouveX = c;
            trouveY = l;
          }
        }
      }
      nombre(10, 17, trouveX);
      nombre(14, 17, trouveY);
    }
  }
}
`,
    aVoir: 'Comme au 0.69 : avec A, la position trouvée s’affiche à droite, la même qu’à gauche.',
    controle: (c) => {
      c.avancer(10)
      c.presser('right', 25)
      c.presser('a', 10)
      c.avancer(5)
      return [['lire() a trouvé le A', c.variable('trouveX') === c.variable('x') && c.variable('trouveY') === c.variable('y')]]
    },
  },

  {
    titre: 'Plus fluide : la lettre au pixel près',
    difficulte: 0,
    idee: 'sprite(0, px, py, ALPHABET[0]) : la lettre devient un lutin, qui avance d’UN pixel par image au lieu de sauter d’une case. Le mouvement devient fluide.',
    texte: [
      '**Pourquoi la lettre saute :** jusqu’ici, elle était **posée sur la grille** avec `poser`. Une case fait **8 × 8 pixels** : chaque pas la faisait donc sauter de 8 pixels d’un coup, environ 7 fois par seconde. L’œil voit des sauts.',
      '**Ce qui est nouveau ici : un lutin**, avec `sprite(numero, x, y, tuile)`. Un lutin n’est **pas** sur la grille : il flotte au-dessus du décor, et se place **au pixel près**. On le fait avancer d’**un seul pixel par image**, 60 fois par seconde : le mouvement devient **fluide**.',
      '• **`numero`** : le numéro du lutin, de 0 à 39 (la console en a 40). Ici, `0`, le premier.',
      '• **`px`, `py`** : sa place **en pixels**, et plus en cases. L’écran fait **160 pixels** de large et **144** de haut. Le milieu, pour une lettre de 8 pixels : (160 − 8) ÷ 2 = **76**, et (144 − 8) ÷ 2 = **68**.',
      '• **`tuile`** : ce qu’il montre, `ALPHABET[0]`, le A.',
      '**Plus besoin d’`effacer` ni d’`attente` :** un lutin se **déplace**, il ne se réécrit pas. On lui donne sa nouvelle place à chaque image, et la console le dessine là, sans rien laisser derrière. Et comme un pixel est petit, on peut avancer à chaque image, sans attendre.',
      '**Les bords :** `px` va de 0 à **152** (160 − 8, pour que la lettre reste entière), `py` de 0 à **136** (144 − 8).',
    ],
    fichiers: {
      'variables.h': `// variables.h : la place de la lettre, maintenant EN PIXELS.

uint8_t px = 76;      // la colonne en pixels : 76 = le milieu ((160 - 8) / 2)
uint8_t py = 68;      // la ligne en pixels   : 68 = le milieu ((144 - 8) / 2)
`,
    },
    code: `// px, py : voir l'onglet variables.h
#include "variables.h"

int main() {
  while (true) {
    image();                                  // 60 fois par seconde

    // UN pixel par image, tant que la flèche est tenue : 60 pixels par
    // seconde, sans à-coups. (Avec poser, c'était 8 pixels d'un coup.)
    if (bouton(DROITE) && px < 152) px++;     // 152 = 160 - 8 : le bord droit
    if (bouton(GAUCHE) && px > 0)   px--;
    if (bouton(BAS) && py < 136)    py++;     // 136 = 144 - 8 : le bord du bas
    if (bouton(HAUT) && py > 0)     py--;

    // Le lutin, morceau par morceau :
    //
    //   sprite(0, px, py, ALPHABET[0]);
    //          |  |   |   |
    //          |  |   |   +-- tuile  : ce qu'il montre, la lettre A
    //          |  +---+------ px, py : sa place EN PIXELS (et non en cases)
    //          +------------- numero : le lutin n° 0 (la console en a 40, de 0 à 39)
    //
    // Pas d'effacer : un lutin se DÉPLACE, il ne laisse rien derrière lui.
    sprite(0, px, py, ALPHABET[0]);
  }
}
`,
    aVoir: 'Un A au milieu de l’écran, qui glisse doucement avec les flèches, pixel par pixel, sans sauter de case en case.',
    controle: (c) => {
      c.avancer(10)
      const depart = c.lutin(0)
      c.presser('right', 30)
      const apresDroite = c.lutin(0)
      c.presser('down', 20)
      const apresBas = c.lutin(0)
      c.presser('left', 200)
      const auBord = c.lutin(0)
      return [
        ['le lutin A part du milieu (76, 68)', depart.x === 76 && depart.y === 68 && depart.tuile === 1,
          ` (${depart.x}, ${depart.y})`],
        ['30 images à droite : 30 pixels, un par image', apresDroite.x - depart.x === 30, ` (${apresDroite.x - depart.x})`],
        ['20 images en bas : 20 pixels', apresBas.y - apresDroite.y === 20, ` (${apresBas.y - apresDroite.y})`],
        ['il s’arrête au bord gauche (0)', auBord.x === 0, ` (x = ${auBord.x})`],
      ]
    },
  },

  {
    titre: 'Plus fluide : la lettre au pixel près — de base, ailleurs',
    difficulte: 0,
    suite: true,
    idee: 'Le 0.70 avec le B, parti de (20, 20).',
    texte: [
      '**C’est le 0.70**, avec le **B**, parti de **(20, 20)** pixels, en haut à gauche.',
      '**C’est la version de base** : la deuxième place, seule. Le 0.70.2 met les deux ensemble.',
    ],
    code: `uint8_t px = 20;      // le B, en pixels
uint8_t py = 20;

int main() {
  while (true) {
    image();
    if (bouton(DROITE) && px < 152) px++;
    if (bouton(GAUCHE) && px > 0)   px--;
    if (bouton(BAS) && py < 136)    py++;
    if (bouton(HAUT) && py > 0)     py--;
    sprite(0, px, py, ALPHABET[1]);   // le lutin n° 0
  }
}
`,
    aVoir: 'Un B en haut à gauche, qui glisse avec les flèches.',
    controle: (c) => { c.avancer(10); const d = [c.lutin(0).x]; c.presser('right', 30); return [['le lutin 0 a glissé de 30 pixels', c.lutin(0).x - d[0] === 30]] },
  },

  {
    titre: 'Plus fluide : la lettre au pixel près — doublé, deux positions',
    difficulte: 0,
    suite: true,
    idee: 'Deux lutins, 0 et 1 : le A et le B glissent ensemble.',
    texte: [
      '**C’est le 0.70 et le 0.70.1 réunis** : deux lutins, chacun avec son numéro (0 et 1).',
      '**Chaque lutin a son numéro :** le même numéro ferait bouger le même lutin. Ici, 0 pour le A, 1 pour le B.',
    ],
    code: `uint8_t px = 76;      // le A, en pixels
uint8_t py = 68;
uint8_t pxb = 20;      // le B, en pixels
uint8_t pyb = 20;

int main() {
  while (true) {
    image();
    if (bouton(DROITE) && px < 152) px++;
    if (bouton(GAUCHE) && px > 0)   px--;
    if (bouton(BAS) && py < 136)    py++;
    if (bouton(HAUT) && py > 0)     py--;
    if (bouton(DROITE) && pxb < 152) pxb++;
    if (bouton(GAUCHE) && pxb > 0)   pxb--;
    if (bouton(BAS) && pyb < 136)    pyb++;
    if (bouton(HAUT) && pyb > 0)     pyb--;
    sprite(0, px, py, ALPHABET[0]);   // le lutin n° 0
    sprite(1, pxb, pyb, ALPHABET[1]);   // le lutin n° 1
  }
}
`,
    aVoir: 'Le A et le B glissent ensemble avec les flèches.',
    controle: (c) => { c.avancer(10); const d = [c.lutin(0).x, c.lutin(1).x]; c.presser('right', 30); return [['le lutin 0 a glissé de 30 pixels', c.lutin(0).x - d[0] === 30], ['le lutin 1 a glissé de 30 pixels', c.lutin(1).x - d[1] === 30]] },
  },

  {
    titre: 'Plus fluide : la lettre au pixel près — en simple',
    difficulte: 0,
    suite: true,
    idee: 'Le 0.70 en une ligne : glisse_croix(0, px, py, ALPHABET[0], 1).',
    texte: [
      '**C’est le 0.70, en plus simple :** les quatre `if` des flèches et le `sprite` sont remplacés par une ligne, `glisse_croix` (le 0.73).',
      '**La vitesse, 1 :** un pixel par image, comme au 0.70.',
    ],
    code: `uint8_t px = 76;      // en pixels : le milieu
uint8_t py = 68;

int main() {
  while (true) {
    image();
    glisse_croix(0, px, py, ALPHABET[0], 1);   // tout le 0.70
  }
}
`,
    aVoir: 'Comme au 0.70 : un A qui glisse pixel par pixel avec les flèches.',
    controle: (c) => {
      c.avancer(10)
      const d = c.lutin(0).x
      c.presser('right', 30)
      return [['30 pixels en 30 images', c.lutin(0).x - d === 30]]
    },
  },

  {
    titre: 'La croix en une ligne : deplace_croix',
    difficulte: 0,
    idee: 'deplace_croix(x, y, tuile, vitesse), fonction de la console : tout le bloc de la croix du 0.66 en une seule ligne, dans la boucle, à la vitesse qu’on choisit.',
    texte: [
      '**C’est le programme du 0.66**, avec un seul changement : tout le bloc qui lisait la croix (l’attente, l’effacement, les quatre `if`, le `poser`) est remplacé par **une ligne**.',
      '**Ce qui est nouveau ici : `deplace_croix(x, y, tuile, vitesse)`.** C’est une fonction **de la console**, comme `ALPHABET` est un tableau de la console : on s’en sert **sans rien déclarer**, et elle n’est ajoutée à la cartouche que si on l’appelle.',
      '**La vitesse, 4e réglage, est obligatoire :** c’est le temps entre deux pas, en **millisecondes**. `250` : un pas tous les quarts de seconde, **4 cases par seconde**. Plus le nombre est petit, plus la lettre va vite (le 0.72 essaie `100`). Il s’écrit **en clair** : le compilateur le traduit en images avant le jeu, comme `ms(250)` = 15 images.',
      '**Ce qu’elle fait, à chaque appel :** elle lit la croix ; si une flèche est tenue et que le temps d’attente est passé, elle fait **un pas** d’une case (en restant dans l’écran), efface l’ancienne case, et attend le temps de la vitesse avant le pas suivant. Puis elle pose la lettre à sa place.',
      '**Elle ne bloque pas :** un appel, au plus un pas, et elle rend la main. On l’appelle donc **dans la boucle**, une fois par image, après `image()`.',
      '**Pas de `x =` :** comme `deplace` au 0.26, elle est seule sur sa ligne, et la console range la nouvelle colonne dans `x` et la nouvelle ligne dans `y`.',
      '**Elle ne clignote pas :** elle n’efface l’ancienne case **que si la lettre a bougé**. Immobile, la lettre est simplement reposée à la même place.',
    ],
    code: `uint8_t x = 9;        // la COLONNE de la lettre : elle part du milieu
uint8_t y = 8;        // la LIGNE de la lettre

int main() {
  while (true) {
    image();          // une fois par image, 60 fois par seconde

    // La ligne qui remplace tout le bloc du 0.66 :
    //
    //   deplace_croix(x, y, ALPHABET[0], 250);
    //                 |  |  |            |
    //                 |  |  |            +-- vitesse : 250 ms entre deux pas,
    //                 |  |  |                          soit 4 cases par seconde
    //                 |  |  +--------------- tuile   : ce qui bouge, la lettre A
    //                 +--+------------------ x, y    : où elle est ; la console
    //                                                  y range sa nouvelle place
    //
    // Ce qu'elle fait pour nous, à chaque image :
    //   - lit la croix (DROITE, GAUCHE, HAUT, BAS)
    //   - au plus UN pas d'une case, puis attend 250 ms
    //   - reste dans l'écran (colonnes 0 à 19, lignes 0 à 17)
    //   - efface l'ancienne case, SEULEMENT si la lettre a bougé
    //   - pose la lettre à sa place
    deplace_croix(x, y, ALPHABET[0], 250);
  }
}
`,
    aVoir: 'Un A au milieu de l’écran, qui se déplace case par case avec les flèches, 4 cases par seconde. Le programme tient en quelques lignes.',
    controle: (c) => {
      c.avancer(10)
      const depart = c.mot(9, 8, 1)
      c.presser('right', 60)
      const x = c.variable('x')
      c.presser('down', 30)
      const y = c.variable('y')
      c.avancer(5)
      return [
        ['le A part du milieu (9, 8)', depart === 'A'],
        ['60 images à droite : 4 pas, un tous les quarts de seconde', x === 13, ` (x = ${x})`],
        ['la flèche bas aussi : y rangé tout seul', y > 8, ` (y = ${y})`],
        ['il est à sa nouvelle place', c.mot(x, y, 1) === 'A'],
        ['et plus au départ', c.mot(9, 8, 1) === ' '],
      ]
    },
  },

  {
    titre: 'La croix en une ligne : deplace_croix — de base, ailleurs',
    difficulte: 0,
    suite: true,
    idee: 'Le 0.71 avec le B, parti de (4, 4).',
    texte: [
      '**C’est le 0.71**, avec le **B**, parti de **(4, 4)**.',
      '**C’est la version de base** : la deuxième place, seule. Le 0.71.2 met les deux ensemble.',
    ],
    code: `uint8_t x = 4;        // le B
uint8_t y = 4;

int main() {
  while (true) {
    image();
    deplace_croix(x, y, ALPHABET[1], 250);
  }
}
`,
    aVoir: 'Un B qui suit la croix, depuis le haut à gauche.',
    controle: (c) => { c.avancer(10); c.presser('right', 60); return [['le B a fait 4 pas', c.variable('x') === 8]] },
  },

  {
    titre: 'La croix en une ligne : deplace_croix — doublé, deux positions',
    difficulte: 0,
    suite: true,
    idee: 'Deux lettres, la même croix : deux appels, dans la même image.',
    texte: [
      '**C’est le 0.71 et le 0.71.1 réunis** : deux appels, un par lettre.',
      '**Les deux bougent dans la même image :** la console ne fait passer le temps d’attente qu’une fois par image ; chaque appel de cette image a le droit de faire son pas.',
    ],
    code: `uint8_t x = 9;        // le A
uint8_t y = 8;
uint8_t xb = 4;        // le B
uint8_t yb = 4;

int main() {
  while (true) {
    image();
    deplace_croix(x, y, ALPHABET[0], 250);
    deplace_croix(xb, yb, ALPHABET[1], 250);
  }
}
`,
    aVoir: 'Le A et le B suivent la croix ensemble.',
    controle: (c) => { c.avancer(10); c.presser('right', 60); return [['le A a fait 4 pas', c.variable('x') === 13], ['le B aussi, dans la même image', c.variable('xb') === 8]] },
  },

  {
    titre: 'Plus vite sur la grille : deplace_croix à 100',
    difficulte: 0,
    idee: 'Le 0.71 avec un seul nombre changé : la vitesse passe de 250 à 100 millisecondes. La lettre fait 10 cases par seconde au lieu de 4.',
    texte: [
      '**C’est le 0.71, avec un seul changement :** la vitesse, 4e réglage de `deplace_croix`, passe de `250` à `100`.',
      '**Ce qui est nouveau ici : choisir sa vitesse.** `100` millisecondes entre deux pas : **10 cases par seconde**, deux fois et demie plus vite qu’au 0.71. `500` ferait 2 cases par seconde, très lentement.',
      '**Plus le nombre est petit, plus ça va vite**, puisque c’est le temps d’attente entre deux pas.',
      '**Trop vite, c’est difficile à diriger :** à `50` (20 cases par seconde), la lettre traverse l’écran en une seconde, et il devient dur de s’arrêter sur la bonne case. Essaie, et choisis ce qui convient à ton jeu.',
    ],
    code: `uint8_t x = 9;        // la COLONNE de la lettre
uint8_t y = 8;        // la LIGNE de la lettre

int main() {
  while (true) {
    image();

    // Le changement : la vitesse, 250 → 100.
    //
    //   deplace_croix(x, y, ALPHABET[0], 100);
    //                                    |
    //                                    +-- vitesse : le temps entre deux pas.
    //                                        Plus PETIT = plus VITE :
    //                                          500 → 2 cases par seconde
    //                                          250 → 4 cases par seconde (le 0.71)
    //                                          100 → 10 cases par seconde (ici)
    //                                           50 → 20 cases par seconde
    deplace_croix(x, y, ALPHABET[0], 100);
  }
}
`,
    aVoir: 'Le même A qu’au 0.71, mais qui file sur la grille : 10 cases par seconde.',
    controle: (c) => {
      c.avancer(10)
      c.presser('right', 30)
      return [
        ['30 images à droite : 5 pas, un toutes les 6 images', c.variable('x') === 14, ` (x = ${c.variable('x')})`],
        ['le A est à sa nouvelle place', c.mot(c.variable('x'), 8, 1) === 'A'],
      ]
    },
  },

  {
    titre: 'Plus vite sur la grille : deplace_croix à 100 — de base, ailleurs',
    difficulte: 0,
    suite: true,
    idee: 'Le 0.72 avec le B, parti de (4, 4).',
    texte: [
      '**C’est le 0.72**, avec le **B**, parti de **(4, 4)**.',
      '**C’est la version de base** : la deuxième place, seule. Le 0.72.2 met les deux ensemble.',
    ],
    code: `uint8_t x = 4;        // le B
uint8_t y = 4;

int main() {
  while (true) {
    image();
    deplace_croix(x, y, ALPHABET[1], 100);
  }
}
`,
    aVoir: 'Un B qui suit la croix, depuis le haut à gauche.',
    controle: (c) => { c.avancer(10); c.presser('right', 30); return [['le B a fait 5 pas', c.variable('x') === 9]] },
  },

  {
    titre: 'Plus vite sur la grille : deplace_croix à 100 — doublé, deux positions',
    difficulte: 0,
    suite: true,
    idee: 'Deux lettres, la même croix : deux appels, dans la même image.',
    texte: [
      '**C’est le 0.72 et le 0.72.1 réunis** : deux appels, un par lettre.',
      '**Les deux bougent dans la même image :** la console ne fait passer le temps d’attente qu’une fois par image ; chaque appel de cette image a le droit de faire son pas.',
    ],
    code: `uint8_t x = 9;        // le A
uint8_t y = 8;
uint8_t xb = 4;        // le B
uint8_t yb = 4;

int main() {
  while (true) {
    image();
    deplace_croix(x, y, ALPHABET[0], 100);
    deplace_croix(xb, yb, ALPHABET[1], 100);
  }
}
`,
    aVoir: 'Le A et le B suivent la croix ensemble.',
    controle: (c) => { c.avancer(10); c.presser('right', 30); return [['le A et le B ont fait 5 pas', c.variable('x') === 14 && c.variable('xb') === 9]] },
  },

  {
    titre: 'Glisser en une ligne : glisse_croix',
    difficulte: 0,
    idee: 'glisse_croix(0, px, py, tuile, vitesse), fonction de la console : la lettre-lutin du 0.70 suit la croix au pixel près, en une seule ligne.',
    texte: [
      '**C’est le programme du 0.70**, avec un seul changement : les quatre `if` des flèches et le `sprite` sont remplacés par **une ligne**.',
      '**Ce qui est nouveau ici : `glisse_croix(numero, px, py, tuile, vitesse)`.** La même idée que `deplace_croix` au 0.71, mais **au pixel près**, avec un lutin.',
      '• **`numero`** : le numéro du lutin, `0`. • **`px`, `py`** : sa place en pixels ; la console y range la nouvelle place. • **`tuile`** : ce qu’il montre.',
      '• **`vitesse`**, obligatoire : combien de **pixels par image** tant qu’une flèche est tenue. `1` : un pixel par image, **60 pixels par seconde**, le mouvement le plus doux. Ce n’est pas une durée comme pour `deplace_croix` : ici, **plus le nombre est grand, plus ça va vite** (le 0.74 essaie `3`).',
      '**Elle reste dans l’écran :** `px` de 0 à 152, `py` de 0 à 136, pour que la lettre de 8 pixels reste entière dans l’écran de 160 × 144.',
      '**Laquelle choisir ?** `deplace_croix` pour un jeu **sur la grille** (un labyrinthe, un plateau), où l’on avance case par case. `glisse_croix` pour un personnage **qui glisse** librement.',
    ],
    code: `uint8_t px = 76;      // la colonne en PIXELS : le milieu
uint8_t py = 68;      // la ligne en PIXELS   : le milieu

int main() {
  while (true) {
    image();          // une fois par image, 60 fois par seconde

    // La ligne qui remplace les quatre if et le sprite du 0.70 :
    //
    //   glisse_croix(0, px, py, ALPHABET[0], 1);
    //                |  |   |   |            |
    //                |  |   |   |            +-- vitesse : 1 pixel par image,
    //                |  |   |   |                          60 pixels par seconde
    //                |  |   |   +--------------- tuile   : la lettre A
    //                |  +---+------------------- px, py  : sa place EN PIXELS ; la
    //                |                                     console y range la nouvelle
    //                +-------------------------- numero  : le lutin n° 0
    glisse_croix(0, px, py, ALPHABET[0], 1);
  }
}
`,
    aVoir: 'Exactement le 0.70 : un A qui glisse doucement avec les flèches, pixel par pixel. Mais en une ligne.',
    controle: (c) => {
      c.avancer(10)
      const depart = c.lutin(0)
      c.presser('right', 30)
      const apresDroite = c.lutin(0)
      c.presser('up', 20)
      const apresHaut = c.lutin(0)
      return [
        ['le lutin A part du milieu (76, 68)', depart.x === 76 && depart.y === 68 && depart.tuile === 1],
        ['30 images à droite : 30 pixels', apresDroite.x - depart.x === 30, ` (${apresDroite.x - depart.x})`],
        ['20 images en haut : 20 pixels', apresDroite.y - apresHaut.y === 20, ` (${apresDroite.y - apresHaut.y})`],
        ['px et py rangés tout seuls', c.variable('px') === apresHaut.x && c.variable('py') === apresHaut.y],
      ]
    },
  },

  {
    titre: 'Glisser en une ligne : glisse_croix — de base, ailleurs',
    difficulte: 0,
    suite: true,
    idee: 'Le 0.73 avec le B, parti de (20, 20) pixels.',
    texte: [
      '**C’est le 0.73**, avec le **B**, parti de **(20, 20)** pixels.',
      '**C’est la version de base** : la deuxième place, seule. Le 0.73.2 met les deux ensemble.',
    ],
    code: `uint8_t px = 20;      // le B, en pixels
uint8_t py = 20;

int main() {
  while (true) {
    image();
    glisse_croix(0, px, py, ALPHABET[1], 1);
  }
}
`,
    aVoir: 'Un B qui suit la croix, depuis le haut à gauche.',
    controle: (c) => { c.avancer(10); const d = [c.lutin(0).x]; c.presser('right', 30); return [['le lutin 0 a glissé de 30 pixels', c.lutin(0).x - d[0] === 30]] },
  },

  {
    titre: 'Glisser en une ligne : glisse_croix — doublé, deux positions',
    difficulte: 0,
    suite: true,
    idee: 'Deux lettres, la même croix : deux appels, dans la même image.',
    texte: [
      '**C’est le 0.73 et le 0.73.1 réunis** : deux appels, un par lettre.',
      '**Deux lutins, deux numéros** (0 et 1) : ils glissent ensemble.',
    ],
    code: `uint8_t px = 76;      // le A, en pixels
uint8_t py = 68;
uint8_t pxb = 20;      // le B, en pixels
uint8_t pyb = 20;

int main() {
  while (true) {
    image();
    glisse_croix(0, px, py, ALPHABET[0], 1);
    glisse_croix(1, pxb, pyb, ALPHABET[1], 1);
  }
}
`,
    aVoir: 'Le A et le B suivent la croix ensemble.',
    controle: (c) => { c.avancer(10); const d = [c.lutin(0).x, c.lutin(1).x]; c.presser('right', 30); return [['le lutin 0 a glissé de 30 pixels', c.lutin(0).x - d[0] === 30], ['le lutin 1 a glissé de 30 pixels', c.lutin(1).x - d[1] === 30]] },
  },

  {
    titre: 'Glisser plus vite : glisse_croix à 3',
    difficulte: 0,
    idee: 'Le 0.73 avec un seul nombre changé : la vitesse passe de 1 à 3 pixels par image. La lettre glisse trois fois plus vite.',
    texte: [
      '**C’est le 0.73, avec un seul changement :** la vitesse, 5e réglage de `glisse_croix`, passe de `1` à `3`.',
      '**Ce qui est nouveau ici : plusieurs pixels par image.** `3` : trois pixels à chaque image, **180 pixels par seconde**. La lettre traverse l’écran (152 pixels) en moins d’une seconde.',
      '**Toujours fluide :** le lutin se déplace à **chaque** image, 60 fois par seconde ; il fait seulement des pas un peu plus grands. Au-delà de 4 ou 5, l’œil commence à voir des sauts.',
      '**Au bord,** un pas qui dépasserait s’arrête pile au bord : la lettre ne sort jamais de l’écran.',
      '**Elle peut être une variable :** contrairement à la vitesse de `deplace_croix`, celle-ci n’est pas une durée. On pourra la changer en plein jeu, par exemple aller plus vite tant qu’on tient **B**.',
    ],
    code: `uint8_t px = 76;      // la colonne en PIXELS
uint8_t py = 68;      // la ligne en PIXELS

int main() {
  while (true) {
    image();

    // Le changement : la vitesse, 1 → 3.
    //
    //   glisse_croix(0, px, py, ALPHABET[0], 3);
    //                                        |
    //                                        +-- vitesse : pixels par image.
    //                                            Plus GRAND = plus VITE :
    //                                              1 →  60 pixels par seconde (le 0.73)
    //                                              3 → 180 pixels par seconde (ici)
    glisse_croix(0, px, py, ALPHABET[0], 3);
  }
}
`,
    aVoir: 'Le même A qu’au 0.73, mais qui glisse trois fois plus vite, toujours sans à-coups.',
    controle: (c) => {
      c.avancer(10)
      const depart = c.lutin(0)
      c.presser('right', 20)
      const apres = c.lutin(0)
      c.presser('right', 60)
      return [
        ['20 images à droite : 60 pixels, trois par image', apres.x - depart.x === 60, ` (${apres.x - depart.x})`],
        ['il s’arrête pile au bord droit (152)', c.lutin(0).x === 152, ` (x = ${c.lutin(0).x})`],
      ]
    },
  },

  {
    titre: 'Glisser plus vite : glisse_croix à 3 — de base, ailleurs',
    difficulte: 0,
    suite: true,
    idee: 'Le 0.74 avec le B, parti de (20, 20) pixels.',
    texte: [
      '**C’est le 0.74**, avec le **B**, parti de **(20, 20)** pixels.',
      '**C’est la version de base** : la deuxième place, seule. Le 0.74.2 met les deux ensemble.',
    ],
    code: `uint8_t px = 20;      // le B, en pixels
uint8_t py = 20;

int main() {
  while (true) {
    image();
    glisse_croix(0, px, py, ALPHABET[1], 3);
  }
}
`,
    aVoir: 'Un B qui suit la croix, depuis le haut à gauche.',
    controle: (c) => { c.avancer(10); const d = c.lutin(0).x; c.presser('right', 20); return [['60 pixels en 20 images', c.lutin(0).x - d === 60]] },
  },

  {
    titre: 'Glisser plus vite : glisse_croix à 3 — doublé, deux positions',
    difficulte: 0,
    suite: true,
    idee: 'Deux lettres, la même croix : deux appels, dans la même image.',
    texte: [
      '**C’est le 0.74 et le 0.74.1 réunis** : deux appels, un par lettre.',
      '**Deux lutins, deux numéros** (0 et 1) : ils glissent ensemble.',
    ],
    code: `uint8_t px = 76;      // le A, en pixels
uint8_t py = 68;
uint8_t pxb = 20;      // le B, en pixels
uint8_t pyb = 20;

int main() {
  while (true) {
    image();
    glisse_croix(0, px, py, ALPHABET[0], 3);
    glisse_croix(1, pxb, pyb, ALPHABET[1], 3);
  }
}
`,
    aVoir: 'Le A et le B suivent la croix ensemble.',
    controle: (c) => { c.avancer(10); const a = c.lutin(0).x, b = c.lutin(1).x; c.presser('right', 20); return [['les deux : 60 pixels', c.lutin(0).x - a === 60 && c.lutin(1).x - b === 60]] },
  },

  {
    titre: 'Arrivé en (0, 0), le A devient B',
    difficulte: 0,
    idee: 'Le A part de (10, 0) et suit la croix ; sa position s’affiche en direct. Quand il arrive en (0, 0), il se transforme en B : if (x == 0 && y == 0).',
    texte: [
      '**Le A part de (10, 0)**, en haut de l’écran, et se déplace avec la croix, comme au 0.71. Sa position s’affiche **en direct** en bas de l’écran, comme au 0.68 : `x` à gauche, `y` à côté.',
      '**Ce qui est nouveau ici : une condition sur la position.** `if (x == 0 && y == 0)` veut dire : « si `x` vaut 0 **ET** si `y` vaut 0 ». `&&` se lit « et » : il faut que **les deux** soient vrais en même temps. En (0, 5), `x == 0` est vrai mais `y == 0` est faux : rien ne se passe. En (0, 0), les deux sont vrais : la condition est vraie.',
      '**La lettre dans une variable :** `lettre` vaut 0 au départ, et la croix pose `ALPHABET[lettre]`, donc `ALPHABET[0]`, le A. Quand la condition est vraie, `lettre = 1;` : à l’image suivante, `deplace_croix` pose `ALPHABET[1]`, le **B**.',
      '**Le B reste un B :** rien ne remet `lettre` à 0. Même en quittant la case (0, 0), la lettre reste transformée.',
      '**Deux façons d’écrire le `if` :** sur une ligne, `if (x == 0 && y == 0) lettre = 1;`, ou **avec des accolades** : `if (x == 0 && y == 0) { lettre = 1; }`. Les deux font exactement la même chose. Sans accolades, le `if` ne commande **qu’une seule** instruction, celle qui le suit. Avec des accolades, il commande **tout ce qui est entre elles** : on peut y mettre plusieurs lignes (changer la lettre ET jouer un son, par exemple). Le programme l’écrit avec des accolades, et montre l’autre forme en commentaire juste au-dessus.',
      '**Pour y arriver :** la flèche **gauche**, dix pas. Les nombres en bas montrent `x` qui descend : 010, 009… jusqu’à 000. Et la lettre change.',
    ],
    code: `uint8_t x = 10;       // la COLONNE : le A part de la colonne 10…
uint8_t y = 0;        // …et de la ligne 0, en haut de l'écran
uint8_t lettre = 0;   // QUELLE lettre : 0 = A, 1 = B

int main() {
  while (true) {
    image();

    // La croix déplace la lettre ; ALPHABET[lettre] : le A, puis le B.
    deplace_croix(x, y, ALPHABET[lettre], 250);

    // Le contrôleur de position : x et y, en direct, en bas de l'écran.
    nombre(0, 17, x);
    nombre(4, 17, y);

    // La condition, morceau par morceau :
    //
    //   if (x == 0 && y == 0) lettre = 1;
    //       |      |  |       |
    //       |      |  |       +-- alors : la lettre devient ALPHABET[1], le B
    //       |      |  +---------- y vaut-il 0 ? (tout en haut)
    //       |      +------------- && : ET — les DEUX doivent être vrais
    //       +-------------------- x vaut-il 0 ? (tout à gauche)
    //
    //   en (10, 0) : x == 0 faux              → rien
    //   en (0, 5)  : x == 0 vrai, y == 0 faux → rien
    //   en (0, 0)  : les deux vrais           → le A devient B
    // Sur une ligne :  if (x == 0 && y == 0) lettre = 1;
    // Avec des accolades, la même chose :
    if (x == 0 && y == 0) {
      lettre = 1;
    }
  }
}
`,
    aVoir: 'Un A en haut de l’écran ; avec la flèche gauche, il va jusqu’au coin (0, 0), et là il devient un B. En bas, sa position en direct.',
    controle: (c) => {
      c.avancer(10)
      const depart = c.mot(10, 0, 1)
      c.presser('left', 60)
      const enRoute = c.mot(c.variable('x'), 0, 1)
      c.presser('left', 160)
      c.avancer(5)
      const arrive = c.mot(0, 0, 1)
      c.presser('down', 40)
      c.avancer(5)
      return [
        ['le A part de (10, 0)', depart === 'A'],
        ['en route, c’est encore un A', enRoute === 'A', ` (x = ${c.variable('x')})`],
        ['en (0, 0), il est devenu B', arrive === 'B' && c.variable('lettre') === 1],
        ['il reste un B en repartant', c.mot(c.variable('x'), c.variable('y'), 1) === 'B', ` (en (${c.variable('x')}, ${c.variable('y')}))`],
        ['la position s’affiche', Number(c.mot(0, 17, 3)) === c.variable('x') && Number(c.mot(4, 17, 3)) === c.variable('y')],
      ]
    },
  },

  {
    titre: 'Arrivé en (0, 0), le A devient B — de base, ailleurs',
    difficulte: 0,
    suite: true,
    idee: 'Le 0.75 avec un autre départ : le A part de (10, 8), et devient toujours B en (0, 0). Il faut aller à gauche, puis monter.',
    texte: [
      '**C’est le 0.75**, avec un seul changement : le **départ**. Le A part de **(10, 8)**, au milieu de l’écran, au lieu de (10, 0).',
      '**La case de transformation ne change pas : (0, 0)**, le coin en haut à gauche. La condition est la même : `if (x == 0 && y == 0)`.',
      '**Le chemin est plus long :** la flèche **gauche** amène le A en (0, 8), au bord gauche. Là, `x == 0` est vrai, mais `y == 0` est faux (y vaut 8) : il reste un A. Puis la flèche **haut** le fait monter : 7, 6… et en (0, 0), les deux sont vrais. Il devient B.',
      '**C’est ce que montre `&&` :** arriver dans la bonne colonne ne suffit pas, il faut aussi la bonne ligne. Regarde les nombres en bas : `000 008` au bord gauche, encore un A ; `000 000` au coin, un B.',
      '**C’est la version de base** : une seule lettre, un autre départ. Le 0.75.2 met les deux ensemble.',
    ],
    code: `uint8_t x = 10;       // le changement : le départ, (10, 8), au milieu
uint8_t y = 8;
uint8_t lettre = 0;   // 0 = A, 1 = B

int main() {
  while (true) {
    image();
    deplace_croix(x, y, ALPHABET[lettre], 250);
    nombre(0, 17, x);                     // la position, en direct
    nombre(4, 17, y);

    // La même case qu'au 0.75 : (0, 0), le coin en haut à gauche.
    //
    //   en (0, 8) : x == 0 vrai, y == 0 faux → encore un A (il faut monter)
    //   en (0, 0) : les deux vrais           → le A devient B
    // Sur une ligne :  if (x == 0 && y == 0) lettre = 1;
    // Avec des accolades, la même chose :
    if (x == 0 && y == 0) {
      lettre = 1;
    }
  }
}
`,
    aVoir: 'Un A au milieu de l’écran ; la flèche gauche l’amène au bord (0, 8), encore un A ; la flèche haut le fait monter jusqu’au coin (0, 0), où il devient B.',
    controle: (c) => {
      c.avancer(10)
      c.presser('left', 220)
      c.avancer(5)
      const auBord = c.mot(0, 8, 1)
      const lettreAuBord = c.variable('lettre')
      c.presser('up', 150)
      c.avancer(5)
      return [
        ['au bord (0, 8), c’est encore un A', auBord === 'A' && lettreAuBord === 0],
        ['en (0, 0), il est devenu B', c.mot(0, 0, 1) === 'B' && c.variable('lettre') === 1],
        ['la position s’affiche : 000 000', c.mot(0, 17, 7) === '000 000', ` (« ${c.mot(0, 17, 7)} »)`],
      ]
    },
  },

  {
    titre: 'Arrivé en (0, 0), le A devient B — doublé, deux positions',
    difficulte: 0,
    suite: true,
    idee: 'Deux A, deux départs, la même case d’arrivée : chacun devient B en arrivant en (0, 0).',
    texte: [
      '**C’est le 0.75 et le 0.75.1 réunis :** deux A, l’un parti de (10, 0), l’autre de (10, 8). La même croix les déplace ensemble.',
      '**Chacun a ses variables :** `x`, `y`, `lettre` pour le premier ; `xb`, `yb`, `lettreB` pour le second. Et chacun a **sa condition**, sur **sa** position, mais vers la **même** case : (0, 0).',
      '**Ils n’y arrivent pas en même temps.** Avec la flèche gauche, le premier arrive en (0, 0) et devient B ; le second, en (0, 8), reste un A. Avec la flèche haut, le premier ne peut plus monter (il est déjà en haut) ; le second monte, arrive en (0, 0), et devient B à son tour.',
      '**À la fin, les deux B sont sur la même case**, (0, 0) : on n’en voit qu’un. Chaque lettre ne connaît que sa propre position ; rien ne les empêche de se retrouver au même endroit.',
    ],
    code: `uint8_t x = 10;        // le premier A : départ (10, 0)
uint8_t y = 0;
uint8_t lettre = 0;
uint8_t xb = 10;       // le second A : départ (10, 8)
uint8_t yb = 8;
uint8_t lettreB = 0;

int main() {
  while (true) {
    image();
    deplace_croix(x, y, ALPHABET[lettre], 250);       // le premier
    deplace_croix(xb, yb, ALPHABET[lettreB], 250);    // le second, dans la même image
    nombre(0, 17, x);                                 // la position du premier
    nombre(4, 17, y);
    nombre(10, 17, xb);                               // celle du second
    nombre(14, 17, yb);

    // La même case pour les deux : (0, 0). Chacun regarde SA position.
    // 1. Le premier devient B quand il arrive en (0, 0).
    // Sur une ligne :  if (x == 0 && y == 0) lettre = 1;
    // Avec des accolades, la même chose :
    if (x == 0 && y == 0) {
      lettre = 1;
    }
    // 2. Le second aussi, quand il y arrive à son tour.
    // Sur une ligne :  if (xb == 0 && yb == 0) lettreB = 1;
    // Avec des accolades, la même chose :
    if (xb == 0 && yb == 0) {
      lettreB = 1;
    }
  }
}
`,
    aVoir: 'Deux A ; à gauche, le premier arrive en (0, 0) et devient B ; en montant, le second y arrive aussi et devient B.',
    controle: (c) => {
      c.avancer(10)
      c.presser('left', 220)
      c.avancer(5)
      const premier = c.variable('lettre')
      const second = c.variable('lettreB')
      c.presser('up', 150)
      c.avancer(5)
      return [
        ['à gauche : le premier est B, le second encore A', premier === 1 && second === 0 && c.mot(0, 8, 1) !== 'B'],
        ['en montant, le second devient B en (0, 0)', c.variable('lettreB') === 1 && c.variable('xb') === 0 && c.variable('yb') === 0],
        ['un B en (0, 0)', c.mot(0, 0, 1) === 'B'],
      ]
    },
  },

  {
    titre: 'Un déclencheur en (0, 0) : actif',
    difficulte: 0,
    idee: 'Le A suit la croix depuis (10, 0) ; en arrivant en (0, 0), la variable actif passe de 0 à 1. C’est un déclencheur : il servira aux leçons 0.76.1 à 0.76.6.',
    texte: [
      '**Le A part de (10, 0)** et suit la croix, avec sa position en direct, comme au 0.75. Mais cette fois, il ne se transforme pas : en arrivant en (0, 0), il **déclenche** quelque chose.',
      '**Ce qui est nouveau ici : un drapeau, `actif`.** C’est une variable qui dit **oui ou non** : 0 = « pas encore », 1 = « le A est passé par (0, 0) ». On la voit à l’écran, en bas, à la colonne 10 : `000`, puis `001`.',
      '**Une condition à trois morceaux :** `if (x == 0 && y == 0 && actif == 0)`. Le A est en (0, 0) **et** le drapeau vaut encore 0. La troisième partie fait que le bloc ne s’exécute **qu’une seule fois** : dès qu’`actif` vaut 1, elle devient fausse, même si le A reste sur la case.',
      '**Pourquoi un drapeau :** les leçons suivantes font apparaître des lettres et les mettent en mouvement **à partir de ce moment-là**. Le drapeau retient que le moment est passé.',
    ],
    code: `uint8_t x = 10;       // le A part de (10, 0)
uint8_t y = 0;
uint8_t actif = 0;    // 0 : pas encore ; 1 : le A est passé par (0, 0)

int main() {
  while (true) {
    image();
    deplace_croix(x, y, ALPHABET[0], 250);   // le A suit la croix
    nombre(0, 17, x);                        // sa position, en direct
    nombre(4, 17, y);
    nombre(10, 17, actif);                   // le drapeau : 000, puis 001

    // Le déclencheur : le A arrive en (0, 0), et actif vaut encore 0.
    if (x == 0 && y == 0 && actif == 0) {
      actif = 1;                             // une seule fois : ensuite actif vaut 1
    }
  }
}
`,
    aVoir: 'Le A suit la croix ; en bas, sa position et le drapeau. En (0, 0), le drapeau passe à 001.',
    controle: (c) => {
      c.avancer(10)
      const avant = c.variable('actif')
      c.presser('left', 170)
      c.avancer(5)
      return [
        ['au départ, actif vaut 0', avant === 0],
        ['en (0, 0), actif vaut 1', c.variable('actif') === 1 && c.variable('x') === 0],
        ['l’écran le montre : 001', c.mot(10, 17, 3) === '001'],
      ]
    },
  },

  {
    titre: 'Un déclencheur en (0, 0) : le B apparaît au milieu',
    difficulte: 0,
    suite: true,
    idee: 'Le 0.76, plus une ligne dans le bloc du déclencheur : poser(10, 8, ALPHABET[1]). En (0, 0), un B apparaît au milieu de l’écran.',
    texte: [
      '**C’est le 0.76, plus une ligne** dans le bloc du déclencheur.',
      '**Ce qui est nouveau ici : une action déclenchée.** `poser(10, 8, ALPHABET[1]);` pose un B au milieu de l’écran. Comme le bloc ne s’exécute **qu’une fois** (grâce à `actif == 0`), le B n’est posé qu’une fois, au moment où le A arrive en (0, 0).',
      '**Avant, le milieu est vide ;** après, le B y reste. Le A, lui, continue de suivre la croix.',
    ],
    code: `uint8_t x = 10;       // le A part de (10, 0)
uint8_t y = 0;
uint8_t actif = 0;    // 0 : pas encore ; 1 : le A est passé par (0, 0)

int main() {
  while (true) {
    image();
    deplace_croix(x, y, ALPHABET[0], 250);   // le A suit la croix
    nombre(0, 17, x);                        // sa position, en direct
    nombre(4, 17, y);

    // Le déclencheur : le A arrive en (0, 0), et actif vaut encore 0.
    if (x == 0 && y == 0 && actif == 0) {
      actif = 1;                             // une seule fois : ensuite actif vaut 1
      poser(10, 8, ALPHABET[1]);             // le B apparaît au milieu
    }
  }
}
`,
    aVoir: 'Le A suit la croix ; quand il arrive en (0, 0), un B apparaît au milieu de l’écran.',
    controle: (c) => {
      c.avancer(10)
      const avant = c.mot(10, 8, 1)
      c.presser('left', 170)
      c.avancer(5)
      return [
        ['avant, le milieu est vide', avant === ' '],
        ['en (0, 0), un B apparaît au milieu', c.mot(10, 8, 1) === 'B'],
      ]
    },
  },

  {
    titre: 'Un déclencheur en (0, 0) : le B tourne en carré',
    difficulte: 0,
    suite: true,
    idee: 'Le 0.76.1, plus un bloc : une fois apparu, le B fait un carré sans fin à partir du milieu, un pas tous les quarts de seconde, sans bloquer le A.',
    texte: [
      '**C’est le 0.76.1, plus un bloc :** les mouvements, qui ne commencent que quand `actif` vaut 1.',
      '**Pourquoi pas `carre` :** `carre` bloque. Pendant son tour, le A ne pourrait plus bouger. On fait donc le carré **pas à pas**, avec `un_pas`, qui n’attend pas (le 0.30).',
      '**Le tour, compté par `bpas` :** un carré de 4 cases de côté, c’est 16 pas. `bpas` va de 0 à 15 : de 0 à 3, un pas **à droite** ; de 4 à 7, **en bas** ; de 8 à 11, **à gauche** ; de 12 à 15, **en haut**. Après le pas 15, `bpas` revient à 0 : le tour recommence, sans fin.',
      '**`else if`** enchaîne les cas : on ne teste le suivant que si le précédent était faux. Un seul des quatre `un_pas` est fait à chaque pas.',
      '**Le rythme :** `bimages` compte les images ; à 15 (un quart de seconde), un pas, et on recompte. Le B part du milieu (10, 8) et tourne : (14, 8), (14, 12), (10, 12), puis retour au milieu.',
    ],
    code: `uint8_t x = 10;       // le A part de (10, 0)
uint8_t y = 0;
uint8_t actif = 0;    // 0 : pas encore ; 1 : le A est passé par (0, 0)
uint8_t bx = 10;      // le B : sa colonne…
uint8_t by = 8;       // …et sa ligne. Il apparaît au milieu, (10, 8).
uint8_t bpas = 0;     // où il en est dans son tour : du pas 0 au pas 15
uint8_t bimages = 0;  // le chronomètre du B, en images

int main() {
  while (true) {
    image();
    deplace_croix(x, y, ALPHABET[0], 250);   // le A suit la croix
    nombre(0, 17, x);                        // sa position, en direct
    nombre(4, 17, y);

    // Le déclencheur : le A arrive en (0, 0), et actif vaut encore 0.
    if (x == 0 && y == 0 && actif == 0) {
      actif = 1;                             // une seule fois : ensuite actif vaut 1
      poser(10, 8, ALPHABET[1]);             // le B apparaît au milieu
    }

    // Les mouvements, une fois le déclencheur passé.
    if (actif == 1) {
      bimages++;                             // le chronomètre avance
      if (bimages == 15) {                   // toutes les 15 images : un pas
        bimages = 0;
        if (bpas < 4) { un_pas(bx, by, ALPHABET[1], 1, 0); }          // pas 0 à 3 : à droite
        else if (bpas < 8) { un_pas(bx, by, ALPHABET[1], 0, 1); }     // pas 4 à 7 : en bas
        else if (bpas < 12) { un_pas(bx, by, ALPHABET[1], -1, 0); }   // pas 8 à 11 : à gauche
        else { un_pas(bx, by, ALPHABET[1], 0, -1); }                   // pas 12 à 15 : en haut
        bpas++;
        if (bpas == 16) { bpas = 0; }     // le tour est fini : on recommence
      }
    }
  }
}
`,
    aVoir: 'En (0, 0), le B apparaît au milieu, puis tourne en carré sans fin, pendant que le A suit toujours la croix.',
    controle: (c) => {
      c.avancer(10)
      c.presser('left', 170)
      const { B } = suivre(c, 'B', 800)
      return [
        ['le B tourne : (14, 8), (14, 12), (10, 12)', ['14,8', '14,12', '10,12'].every((p) => B.includes(p))],
        ['et revient au milieu, (10, 8), après le tour', B.lastIndexOf('10,8') > B.indexOf('10,12')],
      ]
    },
  },

  {
    titre: 'Un déclencheur en (0, 0) : le carré plus rapide',
    difficulte: 0,
    suite: true,
    idee: 'Le 0.76.2 avec un seul nombre changé : le B fait un pas toutes les 5 images au lieu de 15. Son carré va trois fois plus vite.',
    texte: [
      '**C’est le 0.76.2, avec un seul changement :** `if (bimages == 5)` au lieu de 15.',
      '**Ce qui est nouveau ici : la vitesse du chronomètre.** Un pas toutes les **5 images**, c’est 12 pas par seconde, **trois fois plus vite**. Le tour de 16 pas dure alors moins d’une seconde et demie.',
      '**Plus le nombre est petit, plus ça va vite**, comme pour toutes les vitesses vues jusqu’ici : c’est le temps d’attente entre deux pas.',
    ],
    code: `uint8_t x = 10;       // le A part de (10, 0)
uint8_t y = 0;
uint8_t actif = 0;    // 0 : pas encore ; 1 : le A est passé par (0, 0)
uint8_t bx = 10;      // le B : sa colonne…
uint8_t by = 8;       // …et sa ligne. Il apparaît au milieu, (10, 8).
uint8_t bpas = 0;     // où il en est dans son tour : du pas 0 au pas 15
uint8_t bimages = 0;  // le chronomètre du B, en images

int main() {
  while (true) {
    image();
    deplace_croix(x, y, ALPHABET[0], 250);   // le A suit la croix
    nombre(0, 17, x);                        // sa position, en direct
    nombre(4, 17, y);

    // Le déclencheur : le A arrive en (0, 0), et actif vaut encore 0.
    if (x == 0 && y == 0 && actif == 0) {
      actif = 1;                             // une seule fois : ensuite actif vaut 1
      poser(10, 8, ALPHABET[1]);             // le B apparaît au milieu
    }

    // Les mouvements, une fois le déclencheur passé.
    if (actif == 1) {
      bimages++;                             // le chronomètre avance
      if (bimages == 5) {                   // toutes les 5 images : un pas
        bimages = 0;
        if (bpas < 4) { un_pas(bx, by, ALPHABET[1], 1, 0); }          // pas 0 à 3 : à droite
        else if (bpas < 8) { un_pas(bx, by, ALPHABET[1], 0, 1); }     // pas 4 à 7 : en bas
        else if (bpas < 12) { un_pas(bx, by, ALPHABET[1], -1, 0); }   // pas 8 à 11 : à gauche
        else { un_pas(bx, by, ALPHABET[1], 0, -1); }                   // pas 12 à 15 : en haut
        bpas++;
        if (bpas == 16) { bpas = 0; }     // le tour est fini : on recommence
      }
    }
  }
}
`,
    aVoir: 'Le même carré qu’au 0.76.2, mais trois fois plus rapide.',
    controle: (c) => {
      c.avancer(10)
      c.presser('left', 170)
      const { B } = suivre(c, 'B', 120)
      return [
        ['en 120 images, le B a déjà fait un tour entier', ['14,8', '14,12', '10,12'].every((p) => B.includes(p))],
      ]
    },
  },

  {
    titre: 'Un déclencheur en (0, 0) : deux B',
    difficulte: 0,
    suite: true,
    idee: 'Le 0.76.3, plus un second B : il part du coin opposé du carré, et les deux B se poursuivent.',
    texte: [
      '**C’est le 0.76.3, plus un second B.**',
      '**Ce qui est nouveau ici : deux lettres sur le même carré.** Le second B a **ses** variables (`bx2`, `by2`, `bpas2`). Il apparaît au coin opposé, (14, 12), avec `bpas2 = 8` : il est déjà à mi-tour, donc il commence par aller **à gauche**.',
      '**Le même chronomètre** fait avancer les deux : à chaque tic, un pas pour chacun. Toujours à 8 pas l’un de l’autre, ils se poursuivent sans jamais se rattraper.',
    ],
    code: `uint8_t x = 10;       // le A part de (10, 0)
uint8_t y = 0;
uint8_t actif = 0;    // 0 : pas encore ; 1 : le A est passé par (0, 0)
uint8_t bx = 10;      // le B : sa colonne…
uint8_t by = 8;       // …et sa ligne. Il apparaît au milieu, (10, 8).
uint8_t bpas = 0;     // où il en est dans son tour : du pas 0 au pas 15
uint8_t bimages = 0;  // le chronomètre du B, en images
uint8_t bx2 = 14;     // le second B : il part du coin opposé, (14, 12)…
uint8_t by2 = 12;
uint8_t bpas2 = 8;    // …donc déjà à mi-tour : il commence par aller à gauche

int main() {
  while (true) {
    image();
    deplace_croix(x, y, ALPHABET[0], 250);   // le A suit la croix
    nombre(0, 17, x);                        // sa position, en direct
    nombre(4, 17, y);

    // Le déclencheur : le A arrive en (0, 0), et actif vaut encore 0.
    if (x == 0 && y == 0 && actif == 0) {
      actif = 1;                             // une seule fois : ensuite actif vaut 1
      poser(10, 8, ALPHABET[1]);             // le B apparaît au milieu
      poser(14, 12, ALPHABET[1]);            // le second B, au coin opposé
    }

    // Les mouvements, une fois le déclencheur passé.
    if (actif == 1) {
      bimages++;                             // le chronomètre avance
      if (bimages == 5) {                   // toutes les 5 images : un pas
        bimages = 0;
        if (bpas < 4) { un_pas(bx, by, ALPHABET[1], 1, 0); }          // pas 0 à 3 : à droite
        else if (bpas < 8) { un_pas(bx, by, ALPHABET[1], 0, 1); }     // pas 4 à 7 : en bas
        else if (bpas < 12) { un_pas(bx, by, ALPHABET[1], -1, 0); }   // pas 8 à 11 : à gauche
        else { un_pas(bx, by, ALPHABET[1], 0, -1); }                   // pas 12 à 15 : en haut
        bpas++;
        if (bpas == 16) { bpas = 0; }     // le tour est fini : on recommence
        if (bpas2 < 4) { un_pas(bx2, by2, ALPHABET[1], 1, 0); }          // pas 0 à 3 : à droite
        else if (bpas2 < 8) { un_pas(bx2, by2, ALPHABET[1], 0, 1); }     // pas 4 à 7 : en bas
        else if (bpas2 < 12) { un_pas(bx2, by2, ALPHABET[1], -1, 0); }   // pas 8 à 11 : à gauche
        else { un_pas(bx2, by2, ALPHABET[1], 0, -1); }                   // pas 12 à 15 : en haut
        bpas2++;
        if (bpas2 == 16) { bpas2 = 0; }     // le tour est fini : on recommence
      }
    }
  }
}
`,
    aVoir: 'En (0, 0), deux B apparaissent, au milieu et au coin opposé, et tournent ensemble en se poursuivant.',
    controle: (c) => {
      c.avancer(10)
      c.presser('left', 170)
      c.avancer(60)
      let bs = 0
      for (let l = 0; l < 17; l++) bs += [...c.mot(0, l, 20)].filter((ch) => ch === 'B').length
      return [
        ['deux B à l’écran', bs === 2, ` (${bs})`],
        ['toujours à mi-tour l’un de l’autre', (c.variable('bpas2') - c.variable('bpas') + 16) % 16 === 8],
      ]
    },
  },

  {
    titre: 'Un déclencheur en (0, 0) : le C file à gauche',
    difficulte: 0,
    suite: true,
    idee: 'Le 0.76.4, plus un C : il apparaît au bord droit, sur la ligne 3, et file vers la gauche ; au bord, il repart de droite.',
    texte: [
      '**C’est le 0.76.4, plus un C** (`ALPHABET[2]`).',
      '**Ce qui est nouveau ici : un mouvement vers la GAUCHE, qui recommence.** À chaque tic du chronomètre, le C efface sa case, recule d’une colonne (`cx--`), et se repose. Arrivé à la colonne 0, il **repart de la colonne 19** : `if (cx == 0) { cx = 19; } else { cx--; }`.',
      '**`if … else` avec accolades :** si `cx` vaut 0, on fait le premier bloc (repartir à droite) ; sinon, le second (reculer d’une case). Jamais les deux.',
    ],
    code: `uint8_t x = 10;       // le A part de (10, 0)
uint8_t y = 0;
uint8_t actif = 0;    // 0 : pas encore ; 1 : le A est passé par (0, 0)
uint8_t bx = 10;      // le B : sa colonne…
uint8_t by = 8;       // …et sa ligne. Il apparaît au milieu, (10, 8).
uint8_t bpas = 0;     // où il en est dans son tour : du pas 0 au pas 15
uint8_t bimages = 0;  // le chronomètre du B, en images
uint8_t bx2 = 14;     // le second B : il part du coin opposé, (14, 12)…
uint8_t by2 = 12;
uint8_t bpas2 = 8;    // …donc déjà à mi-tour : il commence par aller à gauche
uint8_t cx = 19;      // le C : il apparaît en (19, 3), au bord droit
uint8_t cy = 3;

int main() {
  while (true) {
    image();
    deplace_croix(x, y, ALPHABET[0], 250);   // le A suit la croix
    nombre(0, 17, x);                        // sa position, en direct
    nombre(4, 17, y);

    // Le déclencheur : le A arrive en (0, 0), et actif vaut encore 0.
    if (x == 0 && y == 0 && actif == 0) {
      actif = 1;                             // une seule fois : ensuite actif vaut 1
      poser(10, 8, ALPHABET[1]);             // le B apparaît au milieu
      poser(14, 12, ALPHABET[1]);            // le second B, au coin opposé
      poser(19, 3, ALPHABET[2]);             // le C apparaît au bord droit
    }

    // Les mouvements, une fois le déclencheur passé.
    if (actif == 1) {
      bimages++;                             // le chronomètre avance
      if (bimages == 5) {                   // toutes les 5 images : un pas
        bimages = 0;
        if (bpas < 4) { un_pas(bx, by, ALPHABET[1], 1, 0); }          // pas 0 à 3 : à droite
        else if (bpas < 8) { un_pas(bx, by, ALPHABET[1], 0, 1); }     // pas 4 à 7 : en bas
        else if (bpas < 12) { un_pas(bx, by, ALPHABET[1], -1, 0); }   // pas 8 à 11 : à gauche
        else { un_pas(bx, by, ALPHABET[1], 0, -1); }                   // pas 12 à 15 : en haut
        bpas++;
        if (bpas == 16) { bpas = 0; }     // le tour est fini : on recommence
        if (bpas2 < 4) { un_pas(bx2, by2, ALPHABET[1], 1, 0); }          // pas 0 à 3 : à droite
        else if (bpas2 < 8) { un_pas(bx2, by2, ALPHABET[1], 0, 1); }     // pas 4 à 7 : en bas
        else if (bpas2 < 12) { un_pas(bx2, by2, ALPHABET[1], -1, 0); }   // pas 8 à 11 : à gauche
        else { un_pas(bx2, by2, ALPHABET[1], 0, -1); }                   // pas 12 à 15 : en haut
        bpas2++;
        if (bpas2 == 16) { bpas2 = 0; }     // le tour est fini : on recommence
        effacer(cx, cy, 1);                  // le C : un pas à GAUCHE…
        if (cx == 0) { cx = 19; } else { cx--; }   // …et au bord gauche, il repart de droite
        poser(cx, cy, ALPHABET[2]);
      }
    }
  }
}
`,
    aVoir: 'En (0, 0), les deux B tournent, et un C file vers la gauche en haut de l’écran, sans fin.',
    controle: (c) => {
      c.avancer(10)
      c.presser('left', 170)
      c.avancer(5)
      const depart = c.variable('cx')
      c.avancer(40)
      const ensuite = c.variable('cx')
      return [
        ['le C est apparu', /C/.test(c.mot(0, 3, 20))],
        ['il va vers la GAUCHE', ensuite < depart || (depart < 8 && ensuite > 12), ` (${depart} → ${ensuite})`],
        ['à sa place, ligne 3', c.mot(ensuite, 3, 1) === 'C'],
      ]
    },
  },

  {
    titre: 'Un déclencheur en (0, 0) : le D file à droite',
    difficulte: 0,
    suite: true,
    idee: 'Le 0.76.5, plus un D : il apparaît au bord gauche, sur la ligne 14, et file vers la droite ; au bord, il repart de gauche.',
    texte: [
      '**C’est le 0.76.5, plus un D** (`ALPHABET[3]`).',
      '**Ce qui est nouveau ici : le mouvement inverse du C.** Le D avance d’une colonne (`dx++`) à chaque tic, et arrivé à la colonne 19, il **repart de la colonne 0** : `if (dx == 19) { dx = 0; } else { dx++; }`.',
      '**Tout part du même déclencheur :** en (0, 0), le A fait apparaître quatre lettres, et chacune a son mouvement. Le A, lui, suit toujours la croix.',
    ],
    code: `uint8_t x = 10;       // le A part de (10, 0)
uint8_t y = 0;
uint8_t actif = 0;    // 0 : pas encore ; 1 : le A est passé par (0, 0)
uint8_t bx = 10;      // le B : sa colonne…
uint8_t by = 8;       // …et sa ligne. Il apparaît au milieu, (10, 8).
uint8_t bpas = 0;     // où il en est dans son tour : du pas 0 au pas 15
uint8_t bimages = 0;  // le chronomètre du B, en images
uint8_t bx2 = 14;     // le second B : il part du coin opposé, (14, 12)…
uint8_t by2 = 12;
uint8_t bpas2 = 8;    // …donc déjà à mi-tour : il commence par aller à gauche
uint8_t cx = 19;      // le C : il apparaît en (19, 3), au bord droit
uint8_t cy = 3;
uint8_t dx = 0;       // le D : il apparaît en (0, 14), au bord gauche
uint8_t dy = 14;

int main() {
  while (true) {
    image();
    deplace_croix(x, y, ALPHABET[0], 250);   // le A suit la croix
    nombre(0, 17, x);                        // sa position, en direct
    nombre(4, 17, y);

    // Le déclencheur : le A arrive en (0, 0), et actif vaut encore 0.
    if (x == 0 && y == 0 && actif == 0) {
      actif = 1;                             // une seule fois : ensuite actif vaut 1
      poser(10, 8, ALPHABET[1]);             // le B apparaît au milieu
      poser(14, 12, ALPHABET[1]);            // le second B, au coin opposé
      poser(19, 3, ALPHABET[2]);             // le C apparaît au bord droit
      poser(0, 14, ALPHABET[3]);             // le D apparaît au bord gauche
    }

    // Les mouvements, une fois le déclencheur passé.
    if (actif == 1) {
      bimages++;                             // le chronomètre avance
      if (bimages == 5) {                   // toutes les 5 images : un pas
        bimages = 0;
        if (bpas < 4) { un_pas(bx, by, ALPHABET[1], 1, 0); }          // pas 0 à 3 : à droite
        else if (bpas < 8) { un_pas(bx, by, ALPHABET[1], 0, 1); }     // pas 4 à 7 : en bas
        else if (bpas < 12) { un_pas(bx, by, ALPHABET[1], -1, 0); }   // pas 8 à 11 : à gauche
        else { un_pas(bx, by, ALPHABET[1], 0, -1); }                   // pas 12 à 15 : en haut
        bpas++;
        if (bpas == 16) { bpas = 0; }     // le tour est fini : on recommence
        if (bpas2 < 4) { un_pas(bx2, by2, ALPHABET[1], 1, 0); }          // pas 0 à 3 : à droite
        else if (bpas2 < 8) { un_pas(bx2, by2, ALPHABET[1], 0, 1); }     // pas 4 à 7 : en bas
        else if (bpas2 < 12) { un_pas(bx2, by2, ALPHABET[1], -1, 0); }   // pas 8 à 11 : à gauche
        else { un_pas(bx2, by2, ALPHABET[1], 0, -1); }                   // pas 12 à 15 : en haut
        bpas2++;
        if (bpas2 == 16) { bpas2 = 0; }     // le tour est fini : on recommence
        effacer(cx, cy, 1);                  // le C : un pas à GAUCHE…
        if (cx == 0) { cx = 19; } else { cx--; }   // …et au bord gauche, il repart de droite
        poser(cx, cy, ALPHABET[2]);
        effacer(dx, dy, 1);                  // le D : un pas à DROITE…
        if (dx == 19) { dx = 0; } else { dx++; }   // …et au bord droit, il repart de gauche
        poser(dx, dy, ALPHABET[3]);
      }
    }
  }
}
`,
    aVoir: 'En (0, 0), deux B tournent, un C file à gauche en haut, un D file à droite en bas.',
    controle: (c) => {
      c.avancer(10)
      c.presser('left', 170)
      c.avancer(5)
      const depart = c.variable('dx')
      c.avancer(40)
      const ensuite = c.variable('dx')
      return [
        ['le D est apparu', /D/.test(c.mot(0, 14, 20))],
        ['il va vers la DROITE', ensuite > depart || (depart > 12 && ensuite < 8), ` (${depart} → ${ensuite})`],
        ['et le C va toujours à gauche', /C/.test(c.mot(0, 3, 20))],
      ]
    },
  },

  {
    titre: 'Un déclencheur en (0, 0) : actif — en simple',
    difficulte: 0,
    suite: true,
    idee: 'Le 0.76 en plus simple : if (x == 0 && y == 0) { actif = 1; }, sans le troisième morceau.',
    texte: [
      '**C’est le 0.76, écrit plus simplement.** La condition perd son troisième morceau : `if (x == 0 && y == 0) { actif = 1; }`.',
      '**Pourquoi on peut l’enlever :** au 0.76, `&& actif == 0` servait à ne faire le bloc **qu’une fois**. Mais ici, le bloc ne fait que mettre `actif` à 1 : le refaire à chaque image ne change rien, puisqu’il vaut déjà 1. Le troisième morceau n’est utile que si le bloc fait quelque chose qu’on ne veut **pas** répéter.',
      '**La règle pour simplifier :** une condition qui ne change rien au résultat peut disparaître. Moins de code, moins d’erreurs.',
    ],
    code: `uint8_t x = 10;       // le A part de (10, 0)
uint8_t y = 0;
uint8_t actif = 0;    // 0 : pas encore ; 1 : le A est passé par (0, 0)

int main() {
  while (true) {
    image();
    deplace_croix(x, y, ALPHABET[0], 250);   // le A suit la croix
    nombre(0, 17, x);                        // sa position
    nombre(4, 17, y);

    // Le déclencheur, en simple : pas besoin de « && actif == 0 ».
    // Remettre actif à 1 quand il vaut déjà 1 ne change rien.
    if (x == 0 && y == 0) {
      actif = 1;
    }
    nombre(10, 17, actif);                   // le drapeau : 000, puis 001
  }
}
`,
    aVoir: 'Comme au 0.76 : en (0, 0), le drapeau passe à 001.',
    controle: (c) => {
      c.avancer(10)
      c.presser('left', 170)
      c.avancer(5)
      return [['en (0, 0), actif vaut 1 : 001', c.variable('actif') === 1 && c.mot(10, 17, 3) === '001']]
    },
  },

  {
    titre: 'Un déclencheur en (0, 0) : le B apparaît au milieu — en simple',
    difficulte: 0,
    suite: true,
    idee: 'Le 0.76.1 en plus simple : tant qu’actif vaut 1, on pose le B au milieu, à chaque image.',
    texte: [
      '**C’est le 0.76.1, écrit plus simplement.** Au lieu de poser le B **une fois**, au moment exact du déclencheur, on le pose **à chaque image** tant qu’`actif` vaut 1 : `if (actif == 1) { poser(10, 8, ALPHABET[1]); }`.',
      '**Pourquoi ça marche :** poser la même lettre à la même place ne se voit pas, et ne clignote pas (rien ne l’efface). Le résultat à l’écran est le même, et il n’y a plus besoin de penser au « une seule fois ».',
    ],
    code: `uint8_t x = 10;       // le A part de (10, 0)
uint8_t y = 0;
uint8_t actif = 0;    // 0 : pas encore ; 1 : le A est passé par (0, 0)

int main() {
  while (true) {
    image();
    deplace_croix(x, y, ALPHABET[0], 250);   // le A suit la croix
    nombre(0, 17, x);                        // sa position
    nombre(4, 17, y);

    // Le déclencheur, en simple : pas besoin de « && actif == 0 ».
    // Remettre actif à 1 quand il vaut déjà 1 ne change rien.
    if (x == 0 && y == 0) {
      actif = 1;
    }

    // Tout ce qui se passe après le déclencheur, une ligne par lettre :
    if (actif == 1) {
      poser(10, 8, ALPHABET[1]);                    // le B au milieu, à chaque image
    }
  }
}
`,
    aVoir: 'Comme au 0.76.1 : en (0, 0), un B apparaît au milieu.',
    controle: (c) => {
      c.avancer(10)
      const avant = c.mot(10, 8, 1)
      c.presser('left', 170)
      c.avancer(5)
      return [['avant, le milieu est vide', avant === ' '], ['après, un B au milieu', c.mot(10, 8, 1) === 'B']]
    },
  },

  {
    titre: 'Un déclencheur en (0, 0) : le B tourne en carré — en simple',
    difficulte: 0,
    suite: true,
    idee: 'Le 0.76.2 en une ligne : tourne_carre(0, 10, 8, ALPHABET[1], 4, 250). Plus de bpas, bx, bimages : la console s’en occupe.',
    texte: [
      '**C’est le 0.76.2, en une ligne.** Tout le bloc des mouvements (le chronomètre `bimages`, le compteur de tour `bpas`, les quatre `un_pas`, `bx`, `by`) est remplacé par **une fonction de la console**.',
      '**Ce qui est nouveau ici : `tourne_carre(numero, x, y, tuile, cote, vitesse)`.** À appeler **à chaque image**. Au premier appel, la lettre apparaît en (`x`, `y`), un coin du carré ; ensuite, toutes les `vitesse` millisecondes, elle fait **un pas** : `cote` pas à droite, puis en bas, puis à gauche, puis en haut, et elle recommence, sans fin.',
      '• **`numero`** (0 à 3) : la console retient, pour chaque numéro, **où en est** la lettre (sa place, son pas dans le tour, son attente). C’est ce qui remplace `bx`, `by`, `bpas` et `bimages`.',
      '• **`cote`** : 4, un côté de 4 pas, comme au 0.76.2. • **`vitesse`** : 250 ms par pas, écrite en clair.',
      '**Elle ne bloque pas :** comme `un_pas`, elle fait au plus un pas et rend la main. Le A suit toujours la croix.',
      '**Elle remplace aussi le `poser` du 0.76.1 :** c’est son premier appel qui fait apparaître le B.',
    ],
    code: `uint8_t x = 10;       // le A part de (10, 0)
uint8_t y = 0;
uint8_t actif = 0;    // 0 : pas encore ; 1 : le A est passé par (0, 0)

int main() {
  while (true) {
    image();
    deplace_croix(x, y, ALPHABET[0], 250);   // le A suit la croix
    nombre(0, 17, x);                        // sa position
    nombre(4, 17, y);

    // Le déclencheur, en simple : pas besoin de « && actif == 0 ».
    // Remettre actif à 1 quand il vaut déjà 1 ne change rien.
    if (x == 0 && y == 0) {
      actif = 1;
    }

    // Tout ce qui se passe après le déclencheur, une ligne par lettre :
    if (actif == 1) {
      tourne_carre(0, 10, 8, ALPHABET[1], 4, 250);    // le B tourne en carré
    }
  }
}
`,
    aVoir: 'Comme au 0.76.2 : en (0, 0), le B apparaît au milieu et tourne en carré.',
    controle: (c) => {
      c.avancer(10)
      c.presser('left', 170)
      const { B } = suivre(c, 'B', 600)
      return [['le B tourne : (14, 8), (14, 12), (10, 12)', ['14,8', '14,12', '10,12'].every((p) => B.includes(p))]]
    },
  },

  {
    titre: 'Un déclencheur en (0, 0) : le carré plus rapide — en simple',
    difficulte: 0,
    suite: true,
    idee: 'Le 0.76.3 en simple : un seul nombre change, la vitesse de tourne_carre, 250 → 80.',
    texte: [
      '**C’est le 0.76.3, en simple :** la vitesse, 6e réglage de `tourne_carre`, passe de `250` à `80` millisecondes.',
      '**80 ms, c’est 5 images :** exactement la vitesse du 0.76.3 (`bimages == 5`). Mais ici, on la dit en millisecondes, comme partout ailleurs.',
    ],
    code: `uint8_t x = 10;       // le A part de (10, 0)
uint8_t y = 0;
uint8_t actif = 0;    // 0 : pas encore ; 1 : le A est passé par (0, 0)

int main() {
  while (true) {
    image();
    deplace_croix(x, y, ALPHABET[0], 250);   // le A suit la croix
    nombre(0, 17, x);                        // sa position
    nombre(4, 17, y);

    // Le déclencheur, en simple : pas besoin de « && actif == 0 ».
    // Remettre actif à 1 quand il vaut déjà 1 ne change rien.
    if (x == 0 && y == 0) {
      actif = 1;
    }

    // Tout ce qui se passe après le déclencheur, une ligne par lettre :
    if (actif == 1) {
      tourne_carre(0, 10, 8, ALPHABET[1], 4, 80);    // le B tourne en carré
    }
  }
}
`,
    aVoir: 'Comme au 0.76.3 : le carré tourne trois fois plus vite.',
    controle: (c) => {
      c.avancer(10)
      c.presser('left', 170)
      const { B } = suivre(c, 'B', 150)
      return [['en 150 images, un tour entier', ['14,8', '14,12', '10,12'].every((p) => B.includes(p))]]
    },
  },

  {
    titre: 'Un déclencheur en (0, 0) : deux B — en simple',
    difficulte: 0,
    suite: true,
    idee: 'Le 0.76.4 en simple : une ligne de plus, tourne_carre(1, 14, 12, ALPHABET[1], -4, 80). Un côté négatif part du coin opposé.',
    texte: [
      '**C’est le 0.76.4, en simple :** une ligne de plus, pour le second B.',
      '**Ce qui est nouveau ici : le numéro 1, et un côté négatif.** Le **numéro 1** : la console retient cette lettre à part de celle du numéro 0. Le **côté `-4`** : le même carré de 4, mais la lettre part vers la **gauche** puis vers le haut, comme le second B du 0.76.4, qui partait du coin opposé (14, 12).',
    ],
    code: `uint8_t x = 10;       // le A part de (10, 0)
uint8_t y = 0;
uint8_t actif = 0;    // 0 : pas encore ; 1 : le A est passé par (0, 0)

int main() {
  while (true) {
    image();
    deplace_croix(x, y, ALPHABET[0], 250);   // le A suit la croix
    nombre(0, 17, x);                        // sa position
    nombre(4, 17, y);

    // Le déclencheur, en simple : pas besoin de « && actif == 0 ».
    // Remettre actif à 1 quand il vaut déjà 1 ne change rien.
    if (x == 0 && y == 0) {
      actif = 1;
    }

    // Tout ce qui se passe après le déclencheur, une ligne par lettre :
    if (actif == 1) {
      tourne_carre(0, 10, 8, ALPHABET[1], 4, 80);    // le B tourne en carré
      tourne_carre(1, 14, 12, ALPHABET[1], -4, 80);   // le second B, depuis le coin opposé
    }
  }
}
`,
    aVoir: 'Comme au 0.76.4 : deux B tournent sur le même carré, en se poursuivant.',
    controle: (c) => {
      c.avancer(10)
      c.presser('left', 170)
      c.avancer(60)
      let bs = 0
      for (let l = 0; l < 17; l++) bs += [...c.mot(0, l, 20)].filter((ch) => ch === 'B').length
      const { B } = suivre(c, 'B', 150)
      return [['deux B à l’écran', bs === 2, ` (${bs})`], ['toujours sur le carré', B.every((p) => { const [a, b] = p.split(',').map(Number); return a >= 10 && a <= 14 && b >= 8 && b <= 12 })]]
    },
  },

  {
    titre: 'Un déclencheur en (0, 0) : le C file à gauche — en simple',
    difficulte: 0,
    suite: true,
    idee: 'Le 0.76.5 en simple : une ligne de plus, defile(0, 19, 3, ALPHABET[2], -1, 80). Le C file à gauche, sans fin.',
    texte: [
      '**C’est le 0.76.5, en simple :** une ligne de plus, pour le C.',
      '**Ce qui est nouveau ici : `defile(numero, x, y, tuile, sens, vitesse)`.** Au premier appel, la lettre apparaît en (`x`, `y`) ; ensuite, toutes les `vitesse` ms, elle fait un pas sur sa ligne : **`sens` -1 vers la gauche**, 1 vers la droite. Au bord, elle repart de l’autre côté, comme au 0.76.5.',
      '**Son numéro, 0, est à elle :** les numéros de `defile` et ceux de `tourne_carre` sont séparés. Le C est le numéro 0 de `defile`, le B le numéro 0 de `tourne_carre`.',
    ],
    code: `uint8_t x = 10;       // le A part de (10, 0)
uint8_t y = 0;
uint8_t actif = 0;    // 0 : pas encore ; 1 : le A est passé par (0, 0)

int main() {
  while (true) {
    image();
    deplace_croix(x, y, ALPHABET[0], 250);   // le A suit la croix
    nombre(0, 17, x);                        // sa position
    nombre(4, 17, y);

    // Le déclencheur, en simple : pas besoin de « && actif == 0 ».
    // Remettre actif à 1 quand il vaut déjà 1 ne change rien.
    if (x == 0 && y == 0) {
      actif = 1;
    }

    // Tout ce qui se passe après le déclencheur, une ligne par lettre :
    if (actif == 1) {
      tourne_carre(0, 10, 8, ALPHABET[1], 4, 80);    // le B tourne en carré
      tourne_carre(1, 14, 12, ALPHABET[1], -4, 80);   // le second B, depuis le coin opposé
      defile(0, 19, 3, ALPHABET[2], -1, 80);          // le C file à gauche
    }
  }
}
`,
    aVoir: 'Comme au 0.76.5 : deux B tournent, un C file à gauche.',
    controle: (c) => {
      c.avancer(10)
      c.presser('left', 170)
      const { C } = suivre(c, 'C', 120)
      const cols = C.map((p) => Number(p.split(',')[0]))
      return [['le C va vers la gauche', cols.length > 3 && cols[1] < cols[0]], ['sur la ligne 3', C.every((p) => p.endsWith(',3'))]]
    },
  },

  {
    titre: 'Un déclencheur en (0, 0) : le D file à droite — en simple',
    difficulte: 0,
    suite: true,
    idee: 'Le 0.76.6 en simple : une ligne de plus, defile(1, 0, 14, ALPHABET[3], 1, 80). Tout le 0.76.6, en quelques lignes.',
    texte: [
      '**C’est le 0.76.6, en simple :** une ligne de plus, pour le D : `defile` avec le **numéro 1** et le **sens 1**, vers la droite.',
      '**Compare avec le 0.76.6 :** là-bas, plus de cinquante lignes, onze variables, trois chronomètres cachés dans les `if`. Ici, quatre lignes dans le bloc `if (actif == 1)`, une par lettre. C’est le même jeu, à l’écran.',
      '**Pourquoi avoir appris la version longue :** pour savoir ce que ces fonctions font **pour nous**. `tourne_carre` et `defile` contiennent exactement ce qu’on a écrit à la main : un chronomètre, un compteur, des pas.',
    ],
    code: `uint8_t x = 10;       // le A part de (10, 0)
uint8_t y = 0;
uint8_t actif = 0;    // 0 : pas encore ; 1 : le A est passé par (0, 0)

int main() {
  while (true) {
    image();
    deplace_croix(x, y, ALPHABET[0], 250);   // le A suit la croix
    nombre(0, 17, x);                        // sa position
    nombre(4, 17, y);

    // Le déclencheur, en simple : pas besoin de « && actif == 0 ».
    // Remettre actif à 1 quand il vaut déjà 1 ne change rien.
    if (x == 0 && y == 0) {
      actif = 1;
    }

    // Tout ce qui se passe après le déclencheur, une ligne par lettre :
    if (actif == 1) {
      tourne_carre(0, 10, 8, ALPHABET[1], 4, 80);    // le B tourne en carré
      tourne_carre(1, 14, 12, ALPHABET[1], -4, 80);   // le second B, depuis le coin opposé
      defile(0, 19, 3, ALPHABET[2], -1, 80);          // le C file à gauche
      defile(1, 0, 14, ALPHABET[3], 1, 80);           // le D file à droite
    }
  }
}
`,
    aVoir: 'Comme au 0.76.6 : deux B tournent, un C file à gauche, un D file à droite.',
    controle: (c) => {
      c.avancer(10)
      c.presser('left', 170)
      const { C, D } = suivre(c, 'CD', 120)
      const cc = C.map((p) => Number(p.split(',')[0])), dd = D.map((p) => Number(p.split(',')[0]))
      return [['le C va à gauche', cc[1] < cc[0]], ['le D va à droite, sur la ligne 14', dd[1] > dd[0] && D.every((p) => p.endsWith(',14'))]]
    },
  },

  {
    titre: 'Plusieurs rythmes sans compteur : chaque',
    difficulte: 0,
    idee: 'if (chaque(250)) { … } : le bloc se fait toutes les 250 ms, sans rien arrêter et sans chronomètre à écrire. Le 0.16 en quatre lignes.',
    texte: [
      '**C’est le 0.16** (la lente et la rapide), **sans les chronomètres.** Au 0.16, chaque lettre avait sa variable qui comptait les images, et son `if` pour la remettre à zéro. Ici, une fonction de la console fait tout ça.',
      '**Ce qui est nouveau ici : `chaque(ms)`.** Elle répond **1 (oui)** quand le temps est passé depuis la dernière fois, **0 (non)** le reste du temps. `if (chaque(1000)) { … }` : le bloc se fait **une fois par seconde**. `if (chaque(250)) { … }` : **quatre fois par seconde**.',
      '**Elle n’arrête rien**, contrairement à `attendre()` : le reste de la boucle continue de tourner à chaque image. On peut donc avoir **plusieurs rythmes** dans le même programme.',
      '**Chaque `chaque` a son propre chronomètre :** la console les distingue toute seule, par leur place dans le programme. Les deux lignes ci-dessous ne se gênent pas. On peut en écrire jusqu’à huit.',
      '**`(lente + 1) % sizeof(ALPHABET)`** passe à la lettre suivante, et revient à 0 après la 26e (le Z) : le `%` du 0.9.',
    ],
    code: `uint8_t lente = 0;    // la lettre de la lente : 0 = A … 25 = Z
uint8_t rapide = 0;   // la lettre de la rapide

int main() {
  while (true) {
    image();

    // La fonction, morceau par morceau :
    //
    //   if (chaque(1000)) { … }
    //       |      |
    //       |      +-- toutes les 1000 millisecondes (1 seconde)
    //       +--------- répond 1 quand c'est l'heure, 0 sinon : le bloc
    //                  ne se fait qu'aux bons moments, rien n'est arrêté
    if (chaque(1000)) {
      lente = (lente + 1) % sizeof(ALPHABET);     // la lente : 1 fois par seconde
    }
    if (chaque(250)) {
      rapide = (rapide + 1) % sizeof(ALPHABET);   // la rapide : 4 fois par seconde
    }

    poser(0, 0, ALPHABET[lente]);    // ligne 0 : la lente
    poser(0, 2, ALPHABET[rapide]);   // ligne 2 : la rapide
  }
}
`,
    aVoir: 'Comme au 0.16 : en haut, une lettre change chaque seconde ; en dessous, une autre quatre fois plus vite.',
    controle: (c) => {
      c.avancer(10)
      const l0 = c.variable('lente'), r0 = c.variable('rapide')
      c.avancer(240)
      const dl = c.variable('lente') - l0, dr = c.variable('rapide') - r0
      return [
        ['en 4 secondes, la lente a changé 4 fois', dl === 4, ` (${dl})`],
        ['la rapide 16 fois', dr === 16, ` (${dr})`],
      ]
    },
  },

  {
    titre: 'Le rebond : une vitesse qui change de signe',
    difficulte: 0,
    idee: 'Une lettre qui va et vient d’un bord à l’autre, toute seule : x = x + vx, et au bord, vx change de signe.',
    texte: [
      '**Une balle qui rebondit :** la lettre O avance vers la droite ; au bord droit, elle repart vers la gauche ; au bord gauche, vers la droite. Sans fin, et sans compter les pas.',
      '**Ce qui est nouveau ici : une VITESSE, `vx`.** Elle dit de combien bouge la lettre à chaque pas : `1`, une case à droite ; `-1`, une case à gauche. À chaque pas, `x = x + vx;`.',
      '**Le rebond :** au bord droit, `vx = -1;` ; au bord gauche, `vx = 1;`. On ne change **pas** la position, seulement la **direction** : le pas suivant se fait dans l’autre sens.',
      '**-1 dans un octet :** il est rangé 255. `x + 255` « tourne » et revient à `x - 1` : c’est pour cela que `x = x + vx;` recule quand `vx` vaut -1.',
      '**Le rythme, avec `chaque(50)`** (le 0.77) : un pas toutes les 50 ms, 20 cases par seconde.',
      '**C’est la base des jeux de balle** : Pong, casse-briques. Le 0.78.1 fait rebondir sur les deux axes.',
    ],
    code: `uint8_t x = 0;        // la colonne de la balle
uint8_t vx = 1;       // sa VITESSE : 1 = vers la droite, -1 = vers la gauche

int main() {
  while (true) {
    image();
    if (chaque(50)) {                 // 20 fois par seconde
      effacer(x, 5, 1);               // 1. efface l'ancienne place
      x = x + vx;                     // 2. avance de vx : +1 ou -1

      // 3. Le rebond : au bord, la vitesse change de signe.
      //
      //   0  1  2 ... 18 19
      //   O → → → → → → O      au bord droit (19) : vx = -1, elle repart à gauche
      //   O ← ← ← ← ← ← O      au bord gauche (0)  : vx = 1, elle repart à droite
      if (x == 19) {
        vx = -1;
      }
      if (x == 0) {
        vx = 1;
      }

      poser(x, 5, ALPHABET[14]);      // 4. la balle : ALPHABET[14], le O
    }
  }
}
`,
    aVoir: 'Un O qui file d’un bord à l’autre sur la ligne 5, et rebondit sans fin.',
    controle: (c) => {
      const xs = []
      for (let k = 0; k < 200; k++) { c.avancer(1); xs.push(c.variable('x')) }
      return [
        ['la balle touche le bord droit (19)', Math.max(...xs) === 19],
        ['et repart à gauche', xs.indexOf(19) >= 0 && xs.at(-1) < 19 && c.variable('vx') === 255],
        ['le O est à sa place', c.mot(c.variable('x'), 5, 1) === 'O'],
      ]
    },
  },

  {
    titre: 'Le rebond : une vitesse qui change de signe — en diagonale',
    difficulte: 0,
    suite: true,
    idee: 'Le 0.78 sur les deux axes : vx ET vy. La balle rebondit sur les quatre bords.',
    texte: [
      '**C’est le 0.78, sur les deux axes :** une vitesse `vy` pour la ligne, en plus de `vx` pour la colonne.',
      '**Ce qui est nouveau ici : deux vitesses.** À chaque pas, `x = x + vx;` et `y = y + vy;` : la balle va **en diagonale**. Chaque axe rebondit **à part** : aux bords gauche et droit, `vx` change de signe ; en haut et en bas, `vy`.',
      '**La balle part de (0, 0)** et ne s’arrête jamais : elle rebondit dans tout l’écran (lignes 0 à 16, pour laisser la ligne 17 libre).',
    ],
    code: `uint8_t x = 0;        // la colonne de la balle
uint8_t y = 0;        // sa ligne
uint8_t vx = 1;       // vitesse en colonne : 1 à droite, -1 à gauche
uint8_t vy = 1;       // vitesse en ligne   : 1 en bas,   -1 en haut

int main() {
  while (true) {
    image();
    if (chaque(50)) {
      effacer(x, y, 1);
      x = x + vx;                     // un pas en diagonale :
      y = y + vy;                     // une colonne ET une ligne
      if (x == 19) { vx = -1; }       // les bords gauche et droit : vx
      if (x == 0)  { vx = 1; }
      if (y == 16) { vy = -1; }       // les bords haut et bas : vy
      if (y == 0)  { vy = 1; }
      poser(x, y, ALPHABET[14]);
    }
  }
}
`,
    aVoir: 'Un O qui rebondit en diagonale sur les quatre bords de l’écran.',
    controle: (c) => {
      const pos = []
      for (let k = 0; k < 400; k++) { c.avancer(1); pos.push([c.variable('x'), c.variable('y')]) }
      return [
        ['il touche le bas (16)', pos.some(([, y]) => y === 16)],
        ['et le bord droit (19)', pos.some(([x]) => x === 19)],
        ['toujours en diagonale : x et y changent ensemble', c.mot(c.variable('x'), c.variable('y'), 1) === 'O'],
      ]
    },
  },

  {
    titre: 'Suivre une autre lettre',
    difficulte: 0,
    idee: 'Le A suit la croix ; le B le poursuit tout seul : à chaque pas, il avance vers le A, de ±1 sur chaque axe.',
    texte: [
      '**Un poursuivant :** tu déplaces le A avec la croix ; le **B** avance tout seul **vers le A**, un pas tous les **600 ms**. C’est le premier « ennemi ».',
      '**Ce qui est nouveau ici : choisir la direction en comparant.** Pour la colonne : si le A est plus à droite (`x > bx`), un pas à droite (`sx = 1`) ; plus à gauche, un pas à gauche (`sx = -1`) ; même colonne, rien (`sx = 0`). Pareil pour la ligne avec `sy`.',
      '**`un_pas(bx, by, ALPHABET[1], sx, sy)`** (le 0.30) fait ce pas. Avec `sx` et `sy` à la fois, le B va **en diagonale** vers le A.',
      '**Attrapé :** quand le B arrive sur la case du A, le mot `PRIS` s’écrit en bas.',
      '**Pourquoi 600 ms :** le A fait un pas tous les 250 ms, plus de **deux fois plus vite** que le B. On peut donc lui échapper. Mais le B avance aussi en diagonale : dans un coin, il finit par nous coincer. Plus rapide (300 ms), il serait presque impossible à fuir. Le 0.79.1 le fait accélérer peu à peu.',
      '**L’ordre compte :** le B bouge **avant** que la croix ne repose le A. Ainsi le A est dessiné par-dessus, et reste visible même quand le B le touche.',
    ],
    code: `uint8_t x = 10;       // le A (la croix)
uint8_t y = 8;
uint8_t bx = 0;       // le B (le poursuivant) : il part du coin (0, 0)
uint8_t by = 0;
uint8_t sx = 0;       // la direction du prochain pas du B, en colonne…
uint8_t sy = 0;       // …et en ligne : 1, -1 ou 0

int main() {
  while (true) {
    image();

    if (chaque(600)) {                // un pas du B tous les 600 ms : plus lent que le A
      // La direction : vers le A, sur chaque axe.
      sx = 0;
      if (x > bx) { sx = 1; }         // le A est à droite : un pas à droite
      if (x < bx) { sx = -1; }        // à gauche : un pas à gauche
      sy = 0;
      if (y > by) { sy = 1; }         // plus bas : un pas en bas
      if (y < by) { sy = -1; }        // plus haut : un pas en haut
      if (sx != 0 || sy != 0) {       // pas déjà sur lui (|| : OU)
        un_pas(bx, by, ALPHABET[1], sx, sy);
      }
    }

    deplace_croix(x, y, ALPHABET[0], 250);   // le A, dessiné après : par-dessus

    if (bx == x && by == y) {         // le B est sur la case du A
      texte(0, 17, "PRIS");
    }
  }
}
`,
    aVoir: 'Un A au milieu, un B dans le coin qui s’approche tout seul ; déplace le A avec les flèches pour lui échapper. S’il t’attrape, PRIS.',
    controle: (c) => {
      c.avancer(10)
      const d0 = Math.abs(c.variable('x') - c.variable('bx')) + Math.abs(c.variable('y') - c.variable('by'))
      c.avancer(100)
      const d1 = Math.abs(c.variable('x') - c.variable('bx')) + Math.abs(c.variable('y') - c.variable('by'))
      c.avancer(400)
      return [
        ['le B se rapproche du A', d1 < d0, ` (distance ${d0} → ${d1})`],
        ['immobile, le A finit attrapé : PRIS', c.mot(0, 17, 4) === 'PRIS'],
      ]
    },
  },

  {
    titre: 'Suivre une autre lettre — de plus en plus vite',
    difficulte: 0,
    suite: true,
    idee: 'Le 0.79, mais le B accélère : toutes les 3 secondes, il attend un peu moins entre deux pas. Facile au début, de plus en plus dur.',
    texte: [
      '**C’est le 0.79, avec un B qui accélère.** Au début, il est lent (600 ms par pas) : on lui échappe facilement. Toutes les 3 secondes, il devient un peu plus rapide, jusqu’à 200 ms par pas : là, il est presque impossible à fuir.',
      '**Ce qui est nouveau ici : une vitesse qui CHANGE pendant le jeu.** `chaque(600)` ne peut pas le faire : son nombre est écrit en clair, traduit avant le jeu, et ne bouge plus. On compte donc les images nous-mêmes : `compte` augmente à chaque image, et quand il atteint `lenteur`, le B fait un pas.',
      '**`lenteur`** est le nombre d’images entre deux pas : 36 au départ (600 ms). Toutes les 3 secondes, `if (chaque(3000))`, on lui retire 6 : 30, 24, 18… jusqu’à 12 (200 ms), le plus rapide. Le `if (lenteur > 12)` empêche de descendre plus bas.',
      '**`compte >= lenteur`** (plus grand **ou égal**) : si `lenteur` diminue juste quand `compte` était déjà plus grand, le pas se fait quand même, au lieu d’attendre que `compte` fasse le tour des 255.',
      '**En bas à droite,** `lenteur` s’affiche : on la voit descendre, 036, 030, 024…',
    ],
    code: `uint8_t x = 10;       // le A (la croix)
uint8_t y = 8;
uint8_t bx = 0;       // le B (le poursuivant)
uint8_t by = 0;
uint8_t sx = 0;       // la direction du prochain pas du B
uint8_t sy = 0;
uint8_t lenteur = 36; // les images entre deux pas du B : 36 = 600 ms au départ
uint8_t compte = 0;   // les images comptées depuis son dernier pas

int main() {
  while (true) {
    image();

    // Toutes les 3 secondes, le B accélère : 6 images de moins entre deux pas.
    if (chaque(3000)) {
      if (lenteur > 12) {             // 12 images (200 ms) : le plus rapide
        lenteur = lenteur - 6;
      }
    }

    // Le pas du B, quand compte atteint lenteur.
    compte++;
    if (compte >= lenteur) {
      compte = 0;
      sx = 0;
      if (x > bx) { sx = 1; }
      if (x < bx) { sx = -1; }
      sy = 0;
      if (y > by) { sy = 1; }
      if (y < by) { sy = -1; }
      if (sx != 0 || sy != 0) {
        un_pas(bx, by, ALPHABET[1], sx, sy);
      }
    }

    deplace_croix(x, y, ALPHABET[0], 250);   // le A, par-dessus
    nombre(17, 17, lenteur);                 // la lenteur du B : elle descend

    if (bx == x && by == y) {
      texte(0, 17, "PRIS");
    }
  }
}
`,
    aVoir: 'Comme au 0.79, mais le B accélère toutes les 3 secondes ; en bas à droite, sa lenteur descend de 036 à 012.',
    controle: (c) => {
      c.avancer(10)
      const l0 = c.variable('lenteur')
      c.avancer(400)
      const l1 = c.variable('lenteur')
      c.avancer(600)
      return [
        ['au départ, 36 images entre deux pas', l0 === 36],
        ['elle diminue avec le temps', l1 < l0, ` (${l0} → ${l1})`],
        ['elle s’arrête à 12, le plus rapide', c.variable('lenteur') === 12],
        ['immobile, le A finit attrapé', c.mot(0, 17, 4) === 'PRIS'],
      ]
    },
  },

  {
    titre: 'x et y rangés ensemble : struct',
    difficulte: 0,
    idee: 'struct Position { uint8_t x, y; } : la colonne et la ligne d’une lettre sous un seul nom, joueur.x et joueur.y.',
    texte: [
      '**Deux variables qui vont toujours ensemble** — la colonne et la ligne d’une lettre — peuvent être rangées **sous un seul nom**.',
      '**Ce qui est nouveau ici : `struct`.** `struct Position { uint8_t x, y; };` crée un **nouveau type**, `Position`, qui contient deux octets : `x` et `y`. Puis `Position joueur;` crée une variable de ce type.',
      '**Le point `.`** atteint une partie : `joueur.x` est la colonne du joueur, `joueur.y` sa ligne. On s’en sert comme de n’importe quelle variable : `joueur.x = 10;`, `deplace_croix(joueur.x, joueur.y, …)`.',
      '**Pourquoi c’est utile :** avec plusieurs lettres, `Position joueur;` et `Position ennemi;` se lisent mieux que `x`, `y`, `xb`, `yb`. On ne mélange plus les variables d’une lettre avec celles d’une autre.',
      '**La console range toujours la position** dans `joueur.x` et `joueur.y` : ce qu’elle sait faire avec une variable (le 0.23), elle le sait avec une partie de `struct`.',
    ],
    code: `// Le nouveau type, morceau par morceau :
//
//   struct Position { uint8_t x, y; };
//   |      |           |
//   |      |           +-- ses parties : deux octets, x et y
//   |      +-------------- son nom : Position
//   +--------------------- « struct » : on crée un type à nous
struct Position { uint8_t x, y; };

Position joueur;      // une variable de type Position : joueur.x et joueur.y

int main() {
  joueur.x = 10;      // le point atteint une partie : la colonne…
  joueur.y = 0;       // …et la ligne. Départ : (10, 0).

  while (true) {
    image();
    deplace_croix(joueur.x, joueur.y, ALPHABET[0], 250);   // la console range dans joueur.x, joueur.y
    nombre(0, 17, joueur.x);
    nombre(4, 17, joueur.y);
  }
}
`,
    aVoir: 'Un A en haut de l’écran, qui suit la croix ; sa position, joueur.x et joueur.y, en bas.',
    controle: (c) => {
      c.avancer(10)
      const depart = c.mot(10, 0, 1)
      c.presser('left', 60)
      c.presser('down', 30)
      c.avancer(5)
      const x = Number(c.mot(0, 17, 3)), y = Number(c.mot(4, 17, 3))
      return [
        ['le A part de (10, 0)', depart === 'A'],
        ['la croix le déplace : joueur.x diminue, joueur.y augmente', x < 10 && y > 0, ` (${x}, ${y})`],
        ['il est à la place que disent joueur.x et joueur.y', c.mot(x, y, 1) === 'A'],
      ]
    },
  },

  {
    titre: 'x et y rangés ensemble : struct — la boucle dans un fichier',
    difficulte: 0,
    suite: true,
    idee: 'Le 0.80, avec l’intérieur du while dans un autre fichier, boucle.h, versé au milieu de la boucle par #include.',
    texte: [
      '**C’est le 0.80, avec un seul changement :** les trois lignes qui étaient **dans** le `while` (`image`, `deplace_croix`, les `nombre`) sont maintenant dans un **second fichier**, `boucle.h` : l’onglet à côté de `principal.cpp`.',
      '**Ce qui est nouveau ici : un `#include` au MILIEU du programme.** Au 0.67, il était tout en haut. Mais `#include "boucle.h"` veut seulement dire « **verse ici** le contenu de ce fichier ». On peut donc le mettre **entre les accolades du `while`** : avant la compilation, la ligne est remplacée par les trois lignes de `boucle.h`, exactement là.',
      '**Le programme compilé est le même qu’au 0.80,** au mot près : il est seulement rangé en deux.',
      '**`#include` doit être seul sur sa ligne**, sans rien avant ni après : c’est pour cela qu’il est collé au bord gauche, et que son commentaire est au-dessus.',
      '**C’est possible, mais ce n’est pas la meilleure façon :** en lisant `boucle.h` seul, on ne sait pas qu’il est versé dans une boucle, ni d’où vient `joueur`. Le 0.80.2 montre la façon propre, avec une fonction.',
    ],
    fichiers: {
      'boucle.h': `// boucle.h : l'intérieur de la boucle du jeu.
// Ces lignes sont versées DANS le while de principal.cpp, par #include.
image();                                               // attend l'image suivante
deplace_croix(joueur.x, joueur.y, ALPHABET[0], 250);   // le A suit la croix
nombre(0, 17, joueur.x);                               // sa position, en direct
nombre(4, 17, joueur.y);
`,
    },
    code: `// Le nouveau type : la colonne et la ligne sous un seul nom (le 0.80).
struct Position { uint8_t x, y; };

Position joueur;      // joueur.x et joueur.y

int main() {
  joueur.x = 10;      // départ : (10, 0)
  joueur.y = 0;

  while (true) {
    // Le changement : l'intérieur de la boucle est dans l'onglet boucle.h.
    // #include le verse ICI, à chaque tour, comme si ses lignes étaient
    // écrites entre ces accolades. (#include veut être seul sur sa ligne.)
#include "boucle.h"
  }
}
`,
    aVoir: 'Exactement le 0.80 : un A qui suit la croix, sa position en bas. Mais la boucle est dans l’onglet boucle.h.',
    controle: (c) => {
      c.avancer(10)
      const depart = c.mot(10, 0, 1)
      c.presser('left', 60)
      c.presser('down', 30)
      c.avancer(5)
      const x = Number(c.mot(0, 17, 3)), y = Number(c.mot(4, 17, 3))
      return [
        ['le A part de (10, 0)', depart === 'A'],
        ['la croix le déplace, depuis l’autre fichier', x < 10 && y > 0, ` (${x}, ${y})`],
        ['il est à la place que disent joueur.x et joueur.y', c.mot(x, y, 1) === 'A'],
      ]
    },
  },

  {
    titre: 'x et y rangés ensemble : struct — une fonction dans un fichier',
    difficulte: 0,
    suite: true,
    idee: 'Le 0.80.1, en mieux : l’intérieur de la boucle devient une fonction, tour_de_jeu(), rangée dans jeu.h. La boucle n’a plus qu’une ligne.',
    texte: [
      '**C’est le 0.80.1, en mieux :** au lieu de verser des lignes en vrac au milieu de la boucle, on les range dans une **fonction**, `tour_de_jeu()`, dans le fichier `jeu.h`.',
      '**Ce qui est nouveau ici : `void`.** Au 0.33, notre fonction **rendait** une valeur (`uint8_t`, puis `return colonne;`). Celle-ci ne rend rien : elle **fait** quelque chose. On l’écrit `void tour_de_jeu() { … }` : `void` veut dire « rien », et les parenthèses vides veulent dire qu’elle ne reçoit rien.',
      '**Le `#include "jeu.h"` revient tout en haut**, avant `main`, comme au 0.67 : il apporte la **définition** de la fonction. La boucle, elle, se contente de l’**appeler** : `tour_de_jeu();`, une ligne.',
      '**Pourquoi c’est mieux :** en ouvrant `jeu.h`, on voit une fonction complète, avec son nom et ses accolades : on sait ce qu’elle est. Et `main` se lit comme une phrase : « tant que le jeu tourne, fais un tour de jeu ».',
      '**L’ordre compte :** `joueur` est déclaré **avant** le `#include "jeu.h"`, parce que la fonction s’en sert. Une variable doit exister avant qu’on écrive quelque chose qui l’utilise.',
    ],
    fichiers: {
      'jeu.h': `// jeu.h : un tour de jeu, rangé dans une fonction.
//
//   void tour_de_jeu() { … }
//   |    |          |
//   |    |          +-- () : elle ne reçoit rien
//   |    +------------- son nom
//   +------------------ void : elle ne rend rien, elle FAIT quelque chose
void tour_de_jeu() {
  image();                                               // attend l'image suivante
  deplace_croix(joueur.x, joueur.y, ALPHABET[0], 250);   // le A suit la croix
  nombre(0, 17, joueur.x);                               // sa position, en direct
  nombre(4, 17, joueur.y);
}
`,
    },
    code: `// Le nouveau type : la colonne et la ligne sous un seul nom (le 0.80).
struct Position { uint8_t x, y; };

Position joueur;      // joueur.x et joueur.y

// La fonction tour_de_jeu : voir l'onglet jeu.h. Elle se sert de joueur,
// déclaré juste au-dessus : l'ordre compte.
#include "jeu.h"

int main() {
  joueur.x = 10;      // départ : (10, 0)
  joueur.y = 0;

  while (true) {
    tour_de_jeu();    // le changement : UNE ligne, l'appel de la fonction
  }
}
`,
    aVoir: 'Exactement le 0.80 : un A qui suit la croix. La boucle ne contient plus qu’un appel : tour_de_jeu().',
    controle: (c) => {
      c.avancer(10)
      const depart = c.mot(10, 0, 1)
      c.presser('left', 60)
      c.presser('down', 30)
      c.avancer(5)
      const x = Number(c.mot(0, 17, 3)), y = Number(c.mot(4, 17, 3))
      return [
        ['le A part de (10, 0)', depart === 'A'],
        ['la croix le déplace, depuis l’autre fichier', x < 10 && y > 0, ` (${x}, ${y})`],
        ['il est à la place que disent joueur.x et joueur.y', c.mot(x, y, 1) === 'A'],
      ]
    },
  },

  {
    titre: 'Ramasser une pièce : le P',
    difficulte: 0,
    partie: 'Un premier jeu',
    idee: 'Une pièce, la lettre P, en (15, 8). Quand le A arrive dessus, le score augmente de 1, et la pièce s’en va.',
    texte: [
      '**La pièce est une lettre, le P** (`ALPHABET[15]`, la 16e lettre). On la pose une fois, au début, en (15, 8).',
      '**Ce qui est nouveau ici : comparer DEUX positions.** Au 0.75, on comparait la position du A à une case fixe, (0, 0). Ici, on la compare à celle de la pièce, rangée dans `px` et `py` : `if (x == px && y == py)`. Le A est sur la pièce quand sa colonne **et** sa ligne sont celles de la pièce.',
      '**Ramassée :** le score augmente (`score = score + 1;`), et la pièce part **hors de l’écran**, `px = 20;` (il n’y a pas de colonne 20). Ainsi le A, en restant sur la case, ne la ramasse pas une deuxième fois.',
      '**Elle disparaît de l’écran toute seule :** en arrivant sur la case, `deplace_croix` pose le A **par-dessus** le P ; en repartant, il efface la case. Il ne reste rien.',
      '**Le score** s’affiche en bas, après le mot SCORE.',
    ],
    code: `// ---- LES VARIABLES : tout ce que le jeu doit retenir ----

uint8_t x = 5;        // la COLONNE du A (0 à gauche … 19 à droite) : il part de la colonne 5
uint8_t y = 8;        // la LIGNE du A (0 en haut … 17 en bas) : il part de la ligne 8

uint8_t px = 15;      // la colonne de la PIÈCE. La pièce est une LETTRE : le P.
uint8_t py = 8;       // sa ligne. Elle est donc en (15, 8), sur la même ligne que le A.

uint8_t score = 0;    // combien de pièces on a ramassées : 0 au départ

int main() {
  // ---- AVANT LA BOUCLE : ce qui ne se fait qu'une fois ----

  // La pièce est posée une seule fois, au départ.
  //   poser(px, py, ALPHABET[15]);
  //         |   |   |
  //         |   |   +-- ALPHABET[15] : la 16e lettre (on compte à partir de 0), le P
  //         +---+------ sa place : (px, py) = (15, 8)
  poser(px, py, ALPHABET[15]);

  texte(0, 17, "SCORE");                // le mot SCORE, en bas à gauche (ligne 17)

  // ---- LA BOUCLE DU JEU : 60 fois par seconde ----
  while (true) {
    image();                            // 1. attend l'image suivante

    deplace_croix(x, y, ALPHABET[0], 250);   // 2. le A suit la croix (le 0.71)

    // 3. Le A est-il sur la pièce ?
    //
    //   if (x == px && y == py)
    //       |          |
    //       |          +-- la LIGNE du A est-elle celle du P ?
    //       +------------- la COLONNE du A est-elle celle du P ?
    //   Les DEUX doivent être vraies (&&) : le A est alors sur la case du P.
    //
    //   A en (14, 8) : x == px faux (14 ≠ 15)           → rien
    //   A en (15, 8) : x == px vrai ET y == py vrai     → ramassée !
    if (x == px && y == py) {
      score = score + 1;                // le score augmente de 1 : 0 → 1

      // La pièce part HORS de l'écran : la colonne 20 n'existe pas (0 à 19).
      // Sans cette ligne, le A resté sur la case la ramasserait encore à
      // l'image suivante, et le score monterait sans fin.
      px = 20;
    }

    // Le P a déjà disparu de l'écran : en arrivant, deplace_croix a posé le A
    // PAR-DESSUS ; en repartant, il a effacé la case. Il ne reste rien.

    nombre(6, 17, score);               // 4. le score, après le mot SCORE : 000, 001…
  }
}
`,
    aVoir: 'Un A à gauche, un P à droite. Avec la flèche droite, le A ramasse le P : SCORE 001.',
    controle: (c) => {
      c.avancer(10)
      const piece = c.mot(15, 8, 1)
      for (let k = 0; k < 200; k++) { c.gb.setButton('right', true); c.avancer(1) } c.gb.setButton('right', false); c.avancer(3)
      return [
        ['la pièce est un P, en (15, 8)', piece === 'P'],
        ['ramassée : le score vaut 1', c.variable('score') === 1 && c.mot(6, 17, 3) === '001'],
        ['une seule fois, même en passant dessus', c.variable('px') === 20],
      ]
    },
  },

  {
    titre: 'Ramasser une pièce : le P — elle réapparaît ailleurs',
    difficulte: 0,
    suite: true,
    idee: 'Le 0.81, mais la pièce ramassée réapparaît à la place suivante d’un tableau : on peut en ramasser sans fin.',
    texte: [
      '**C’est le 0.81,** mais au lieu de partir hors de l’écran, la pièce **réapparaît ailleurs**.',
      '**Ce qui est nouveau ici : des places rangées dans deux tableaux,** `PX` et `PY` (comme les pas du 0.32). La pièce n° `k` est en (`PX[k]`, `PY[k]`). Ramassée, on passe à la suivante : `k = (k + 1) % 5;` — après la 5e, on revient à la 1re.',
      '**On la repose aussitôt** à sa nouvelle place, avec `poser`.',
    ],
    code: `// ---- LES VARIABLES : tout ce que le jeu doit retenir ----

uint8_t x = 5;        // la COLONNE du A (0 à gauche … 19 à droite) : il part de la colonne 5
uint8_t y = 8;        // la LIGNE du A (0 en haut … 17 en bas) : il part de la ligne 8

uint8_t px = 15;      // la colonne de la PIÈCE. La pièce est une LETTRE : le P.
uint8_t py = 8;       // sa ligne. Elle est donc en (15, 8), sur la même ligne que le A.

uint8_t score = 0;    // combien de pièces on a ramassées : 0 au départ

// Les places des pièces, l'une après l'autre, dans deux tableaux (le 0.32) :
//
//   pièce n° :     0   1   2   3   4
//   PX (colonne): 15,  3, 17,  8, 12
//   PY (ligne) :   8,  2, 14,  5, 11
//
//   la pièce n° 0 est en (15, 8), la n° 1 en (3, 2), la n° 2 en (17, 14)…
const uint8_t PX[] = { 15,  3, 17,  8, 12 };
const uint8_t PY[] = {  8,  2, 14,  5, 11 };

uint8_t k = 0;        // le numéro de la pièce EN COURS : 0, 1, 2, 3, 4, puis de nouveau 0

int main() {
  poser(px, py, ALPHABET[15]);
  texte(0, 17, "SCORE");

  while (true) {
    image();
    deplace_croix(x, y, ALPHABET[0], 250);

    if (x == px && y == py) {           // le A est sur la pièce (le 0.81)
      score = score + 1;                // une pièce de plus

      // La pièce SUIVANTE du tableau :
      //
      //   k = (k + 1) % 5;
      //        |       |
      //        |       +-- % 5 : le reste de la division par 5. 5 % 5 = 0 :
      //        |           après la pièce n° 4, on revient à la n° 0.
      //        +---------- k + 1 : le numéro suivant
      //
      //   k : 0 → 1 → 2 → 3 → 4 → 0 → 1 …  sans fin
      k = (k + 1) % 5;

      px = PX[k];                       // la colonne de la pièce n° k…
      py = PY[k];                       // …et sa ligne
      poser(px, py, ALPHABET[15]);      // on y pose le P : la nouvelle pièce apparaît
    }

    nombre(6, 17, score);
  }
}
`,
    aVoir: 'Le A ramasse le P ; un autre P apparaît aussitôt ailleurs, et ainsi de suite.',
    controle: (c) => {
      c.avancer(10)
      for (let k = 0; k < 180; k++) { c.gb.setButton('right', true); c.avancer(1) } c.gb.setButton('right', false); c.avancer(3)
      return [
        ['la première pièce est ramassée', c.variable('score') === 1],
        ['une nouvelle pièce en (3, 2)', c.mot(3, 2, 1) === 'P' && c.variable('px') === 3],
      ]
    },
  },

  {
    titre: 'Ramasser une pièce : le P — au hasard',
    difficulte: 0,
    suite: true,
    idee: 'Le 0.81.1, mais la nouvelle place est tirée au hasard : hasard() % 20 pour la colonne, hasard() % 17 pour la ligne.',
    texte: [
      '**C’est le 0.81.1,** sans le tableau : la nouvelle place est tirée **au hasard**.',
      '**Ce qui est nouveau ici : `hasard()`.** Elle rend un nombre imprévisible, de 0 à 255. `hasard() % 20` en garde le **reste** de la division par 20 : un nombre de 0 à 19, une colonne. `hasard() % 17` : une ligne de 0 à 16 (la ligne 17 est celle du score).',
      '**On ne sait jamais où la pièce va tomber :** c’est ce qui rend un jeu différent à chaque partie.',
    ],
    code: `// ---- LES VARIABLES : tout ce que le jeu doit retenir ----

uint8_t x = 5;        // la COLONNE du A (0 à gauche … 19 à droite) : il part de la colonne 5
uint8_t y = 8;        // la LIGNE du A (0 en haut … 17 en bas) : il part de la ligne 8

uint8_t px = 15;      // la colonne de la PIÈCE. La pièce est une LETTRE : le P.
uint8_t py = 8;       // sa ligne. Elle est donc en (15, 8), sur la même ligne que le A.

uint8_t score = 0;    // combien de pièces on a ramassées : 0 au départ

int main() {
  poser(px, py, ALPHABET[15]);
  texte(0, 17, "SCORE");

  while (true) {
    image();
    deplace_croix(x, y, ALPHABET[0], 250);

    if (x == px && y == py) {           // le A est sur la pièce (le 0.81)
      score = score + 1;

      // La nouvelle place, AU HASARD :
      //
      //   px = hasard() % 20;
      //        |        |
      //        |        +-- % 20 : le reste de la division par 20, de 0 à 19.
      //        |            Exemple : hasard() rend 137 ; 137 = 6 × 20 + 17 ;
      //        |            le reste est 17 → la colonne 17.
      //        +----------- un nombre imprévisible, de 0 à 255
      px = hasard() % 20;               // une colonne : 0 à 19
      py = hasard() % 17;               // une ligne : 0 à 16 (la 17, c'est le score)

      poser(px, py, ALPHABET[15]);      // la nouvelle pièce apparaît là
    }

    nombre(6, 17, score);
  }
}
`,
    aVoir: 'Le A ramasse le P ; un autre P apparaît quelque part au hasard.',
    controle: (c) => {
      c.avancer(10)
      for (let k = 0; k < 180; k++) { c.gb.setButton('right', true); c.avancer(1) } c.gb.setButton('right', false); c.avancer(3)
      let p = 0
      for (let l = 0; l < 17; l++) p += [...c.mot(0, l, 20)].filter((ch) => ch === 'P').length
      return [
        ['la première pièce est ramassée', c.variable('score') >= 1],
        ['une nouvelle pièce est quelque part', p === 1 || (c.variable('px') === c.variable('x') && c.variable('py') === c.variable('y'))],
        ['dans l’écran', c.variable('px') < 20 && c.variable('py') < 17],
      ]
    },
  },

  {
    titre: 'Un mur qu’on ne traverse pas : le M',
    difficulte: 0,
    idee: 'Un mur de M en colonne 10. Avant chaque pas, lire() regarde la case d’arrivée : si c’est un M, on ne bouge pas.',
    texte: [
      '**Le mur est fait de lettres M** (`ALPHABET[12]`), posées l’une sous l’autre en colonne 10, des lignes 4 à 12.',
      '**Ce qui est nouveau ici : regarder AVANT de bouger.** `deplace_croix` ne connaît pas les murs : on refait donc le déplacement à la main. On calcule d’abord la case d’arrivée, `nx` et `ny`. Puis `lire(nx, ny)` (le 0.69) dit ce qu’il y a dessus. Si ce n’est **pas** un M (`!=`), on avance ; sinon, on reste.',
      '**`!=`** veut dire « n’est pas égal à ». C’est le contraire de `==`.',
      '**`chaque(250)`** (le 0.77) donne le rythme : au plus un pas tous les 250 ms.',
      '**Pour passer, il faut contourner :** le mur s’arrête à la ligne 12. En descendant jusqu’à la ligne 13, on peut passer de l’autre côté.',
    ],
    code: `// ---- LES VARIABLES ----
uint8_t x = 3;        // la colonne du A : il part de (3, 8), à GAUCHE du mur
uint8_t y = 8;        // sa ligne
uint8_t nx = 0;       // la colonne d'ARRIVÉE : où le A irait s'il bougeait
uint8_t ny = 0;       // la ligne d'arrivée. On la calcule AVANT de bouger.

int main() {
  // ---- LE MUR : des lettres M, posées l'une sous l'autre ----
  //
  //   colonne :   3 … 9  10
  //   ligne 4 :          M
  //   ligne 5 :          M
  //   …                  M        le mur : colonne 10, lignes 4 à 12
  //   ligne 8 :   A      M        le A part à gauche du mur
  //   …                  M
  //   ligne 12 :         M
  //   ligne 13 :                  ← sous le mur, la ligne 13 est libre : on passe
  //
  // l va de 4 à 12 (<= : « plus petit OU ÉGAL », donc 12 compris).
  for (uint8_t l = 4; l <= 12; l++) {
    poser(10, l, ALPHABET[12]);         // ALPHABET[12] : la 13e lettre, le M
  }

  poser(x, y, ALPHABET[0]);             // le A à sa place de départ

  // ---- LA BOUCLE DU JEU ----
  while (true) {
    image();                            // attend l'image suivante
    if (chaque(250)) {                  // au plus un pas tous les 250 ms (le 0.77)

      // ÉTAPE 1 : calculer la case d'ARRIVÉE, sans encore bouger.
      // On part de la case actuelle : si aucune flèche n'est tenue,
      // l'arrivée reste la case où l'on est.
      nx = x;
      ny = y;
      if (bouton(DROITE) && x < 19) { nx = x + 1; }   // une colonne à droite
      if (bouton(GAUCHE) && x > 0)  { nx = x - 1; }   // une colonne à gauche
      if (bouton(BAS) && y < 16)    { ny = y + 1; }   // une ligne plus bas
      if (bouton(HAUT) && y > 0)    { ny = y - 1; }   // une ligne plus haut

      // ÉTAPE 2 : REGARDER ce qu'il y a sur la case d'arrivée, avec lire() :
      //
      //   lire(nx, ny) != ALPHABET[12]
      //   |            |  |
      //   |            |  +-- le M, la lettre des murs
      //   |            +----- != : « n'est pas »
      //   +------------------ ce que montre l'écran à la case d'arrivée
      //
      //   Exemple : le A est en (9, 8), la flèche droite est tenue.
      //   L'arrivée est (10, 8). lire(10, 8) rend le M du mur :
      //   « n'est pas un M » est FAUX → le A ne bouge pas.
      if (nx != x || ny != y) {         // une flèche est tenue (|| : OU)
        if (lire(nx, ny) != ALPHABET[12]) {

          // ÉTAPE 3 : ce n'est pas un mur, on avance.
          effacer(x, y, 1);             // efface le A à l'ancienne case
          x = nx;                       // la case d'arrivée devient
          y = ny;                       //   la case du A
          poser(x, y, ALPHABET[0]);     // pose le A à la nouvelle case
        }
      }
    }
  }
}
`,
    aVoir: 'Un A à gauche d’un mur de M. La flèche droite le bloque contre le mur ; en descendant sous le mur, on passe.',
    controle: (c) => {
      c.avancer(10)
      for (let k = 0; k < 200; k++) { c.gb.setButton('right', true); c.avancer(1) } c.gb.setButton('right', false); c.avancer(3)
      const bloque = c.variable('x')
      for (let k = 0; k < 150; k++) { c.gb.setButton('down', true); c.avancer(1) } c.gb.setButton('down', false); c.avancer(3)
      for (let k = 0; k < 100; k++) { c.gb.setButton('right', true); c.avancer(1) } c.gb.setButton('right', false); c.avancer(3)
      return [
        ['le mur l’arrête en colonne 9', bloque === 9, ` (x = ${bloque})`],
        ['le mur est intact', c.mot(10, 8, 1) === 'M'],
        ['par-dessous, il passe de l’autre côté', c.variable('x') > 10, ` (x = ${c.variable('x')})`],
      ]
    },
  },

  {
    titre: 'Un mur qu’on ne traverse pas : le M — un labyrinthe',
    difficulte: 0,
    suite: true,
    idee: 'Des M tout autour et un mur au milieu : un labyrinthe. La pièce P est derrière le mur ; il faut faire le tour pour l’attraper.',
    texte: [
      '**C’est le 0.82, avec plus de murs :** un cadre de M tout autour, et le mur du milieu, ouvert en bas. La pièce P (le 0.81) attend derrière.',
      '**Ce qui est nouveau ici : dessiner des murs avec `texte`.** Une ligne de vingt M, c’est `texte(0, 2, "MMMMMMMMMMMMMMMMMMMM");` : un seul appel. Les côtés, eux, se posent un par un dans une boucle.',
      '**Le déplacement ne change pas :** c’est `lire()` qui fait tout le travail. Il ne sait pas où sont les murs à l’avance : il **regarde l’écran**. Ajoute des M où tu veux, le A ne les traversera pas.',
      '**Le chemin :** descendre sous le mur (lignes 11 à 13), passer à droite, remonter jusqu’au P.',
    ],
    code: `// ---- LES VARIABLES ----
uint8_t x = 3;        // le A : il part de (3, 5), à gauche du mur du milieu
uint8_t y = 5;
uint8_t nx = 0;       // la case d'arrivée, calculée avant chaque pas (le 0.82)
uint8_t ny = 0;
uint8_t score = 0;

int main() {
  // ---- LE LABYRINTHE : tout en lettres M ----
  //
  //   ligne 2  :  M M M M M M M M M M M M M M M M M M M M   le haut
  //   ligne 3  :  M                   M                 M
  //   ligne 5  :  M     A             M         P       M   A : départ, P : la pièce
  //   …           M                   M                 M
  //   ligne 10 :  M                   M                 M   le mur du milieu s'arrête ici…
  //   ligne 11 :  M                                     M   …les lignes 11 à 13
  //   ligne 13 :  M                                     M      sont libres : on passe
  //   ligne 14 :  M M M M M M M M M M M M M M M M M M M M   le bas

  // Le haut et le bas : une ligne de 20 M, en UN seul texte.
  texte(0, 2, "MMMMMMMMMMMMMMMMMMMM");
  texte(0, 14, "MMMMMMMMMMMMMMMMMMMM");

  // Les deux côtés : un M par ligne, à gauche (colonne 0) et à droite (colonne 19).
  for (uint8_t l = 3; l < 14; l++) {
    poser(0, l, ALPHABET[12]);
    poser(19, l, ALPHABET[12]);
  }

  // Le mur du milieu, en colonne 10, des lignes 3 à 10 seulement : ouvert en bas.
  for (uint8_t l = 3; l <= 10; l++) {
    poser(10, l, ALPHABET[12]);
  }

  poser(16, 5, ALPHABET[15]);           // la pièce P, de l'autre côté du mur
  poser(x, y, ALPHABET[0]);             // le A, à son départ
  texte(0, 17, "SCORE");

  // ---- LA BOUCLE DU JEU ----
  while (true) {
    image();
    if (chaque(250)) {                  // au plus un pas tous les 250 ms (le 0.77)

      // ÉTAPE 1 : calculer la case d'ARRIVÉE, sans encore bouger.
      // On part de la case actuelle : si aucune flèche n'est tenue,
      // l'arrivée reste la case où l'on est.
      nx = x;
      ny = y;
      if (bouton(DROITE) && x < 19) { nx = x + 1; }   // une colonne à droite
      if (bouton(GAUCHE) && x > 0)  { nx = x - 1; }   // une colonne à gauche
      if (bouton(BAS) && y < 16)    { ny = y + 1; }   // une ligne plus bas
      if (bouton(HAUT) && y > 0)    { ny = y - 1; }   // une ligne plus haut

      // ÉTAPE 2 : REGARDER ce qu'il y a sur la case d'arrivée, avec lire() :
      //
      //   lire(nx, ny) != ALPHABET[12]
      //   |            |  |
      //   |            |  +-- le M, la lettre des murs
      //   |            +----- != : « n'est pas »
      //   +------------------ ce que montre l'écran à la case d'arrivée
      //
      //   Exemple : le A est en (9, 8), la flèche droite est tenue.
      //   L'arrivée est (10, 8). lire(10, 8) rend le M du mur :
      //   « n'est pas un M » est FAUX → le A ne bouge pas.
      if (nx != x || ny != y) {         // une flèche est tenue (|| : OU)
        if (lire(nx, ny) != ALPHABET[12]) {

          // ÉTAPE 3 : ce n'est pas un mur, on avance.
          effacer(x, y, 1);             // efface le A à l'ancienne case
          x = nx;                       // la case d'arrivée devient
          y = ny;                       //   la case du A
          poser(x, y, ALPHABET[0]);     // pose le A à la nouvelle case
        }
      }
    }

    // La pièce, en (16, 5) : le A est dessus ?
    if (x == 16 && y == 5) {
      if (score == 0) {                 // seulement la première fois :
        score = 1;                      //   le score passe à 1, une fois pour toutes
      }
    }
    nombre(6, 17, score);
  }
}
`,
    aVoir: 'Un labyrinthe de M ; le A doit descendre, passer sous le mur, et remonter jusqu’au P.',
    controle: (c) => {
      c.avancer(10)
      for (let k = 0; k < 150; k++) { c.gb.setButton('right', true); c.avancer(1) } c.gb.setButton('right', false); c.avancer(3)
      const bloque = c.variable('x')
      for (let k = 0; k < 150; k++) { c.gb.setButton('down', true); c.avancer(1) } c.gb.setButton('down', false); c.avancer(3)
      for (let k = 0; k < 200; k++) { c.gb.setButton('right', true); c.avancer(1) } c.gb.setButton('right', false); c.avancer(3)
      for (let k = 0; k < 150; k++) { c.gb.setButton('up', true); c.avancer(1) } c.gb.setButton('up', false); c.avancer(3)
      for (let k = 0; k < 50; k++) { c.gb.setButton('left', true); c.avancer(1) } c.gb.setButton('left', false); c.avancer(3)
      return [
        ['le mur du milieu l’arrête', bloque === 9],
        ['les murs du cadre aussi : jamais dans un M', c.mot(c.variable('x'), c.variable('y'), 1) === 'A'],
        ['il est passé de l’autre côté', c.variable('x') > 10],
      ]
    },
  },

  {
    titre: 'Un son quand on ramasse : note',
    difficulte: 0,
    idee: 'Le 0.81.1, plus une note : note(1, DO5, 10, 12) quand le A ramasse la pièce.',
    texte: [
      '**C’est le 0.81.1** (la pièce qui réapparaît), **plus un son** au moment où on la ramasse.',
      '**Ce qui est nouveau ici : `note(voix, hauteur, duree, volume)`.** Elle joue une note sur la **voix 1** (la console en a deux qui chantent, 1 et 2).',
      '• **`DO5`** : la hauteur, un do aigu (5 : la 5e octave). • **`10`** : la durée, en images, un sixième de seconde. • **`12`** : le volume, de 0 (muet) à 15 (le plus fort).',
      '**Elle ne bloque pas :** la note joue toute seule pendant que le jeu continue.',
    ],
    code: `// ---- LES VARIABLES : tout ce que le jeu doit retenir ----

uint8_t x = 5;        // la COLONNE du A (0 à gauche … 19 à droite) : il part de la colonne 5
uint8_t y = 8;        // la LIGNE du A (0 en haut … 17 en bas) : il part de la ligne 8

uint8_t px = 15;      // la colonne de la PIÈCE. La pièce est une LETTRE : le P.
uint8_t py = 8;       // sa ligne. Elle est donc en (15, 8), sur la même ligne que le A.

uint8_t score = 0;    // combien de pièces on a ramassées : 0 au départ

// Les places des pièces, l'une après l'autre, dans deux tableaux (le 0.32) :
//
//   pièce n° :     0   1   2   3   4
//   PX (colonne): 15,  3, 17,  8, 12
//   PY (ligne) :   8,  2, 14,  5, 11
//
//   la pièce n° 0 est en (15, 8), la n° 1 en (3, 2), la n° 2 en (17, 14)…
const uint8_t PX[] = { 15,  3, 17,  8, 12 };
const uint8_t PY[] = {  8,  2, 14,  5, 11 };

uint8_t k = 0;        // le numéro de la pièce EN COURS : 0, 1, 2, 3, 4, puis de nouveau 0

int main() {
  poser(px, py, ALPHABET[15]);
  texte(0, 17, "SCORE");

  while (true) {
    image();
    deplace_croix(x, y, ALPHABET[0], 250);

    if (x == px && y == py) {
      score = score + 1;
      // Le son, morceau par morceau :
      //
      //   note(1, DO5, 10, 12);
      //        |  |    |   |
      //        |  |    |   +-- volume : 12 (de 0, muet, à 15, le plus fort)
      //        |  |    +------ durée : 10 images, un sixième de seconde
      //        |  +----------- hauteur : DO5, un do aigu (5 : la 5e octave)
      //        +-------------- voix : la 1 (la console en a deux qui chantent, 1 et 2)
      //
      // La note joue TOUTE SEULE : le jeu continue pendant qu'elle sonne.
      note(1, DO5, 10, 12);

      k = (k + 1) % 5;                  // la pièce suivante (le 0.81.1)
      px = PX[k];
      py = PY[k];
      poser(px, py, ALPHABET[15]);
    }

    nombre(6, 17, score);
  }
}
`,
    aVoir: 'Comme au 0.81.1, mais chaque pièce ramassée fait « ding ».',
    controle: (c) => {
      c.avancer(10)
      let entendu = false
      for (let k = 0; k < 200; k++) {
        c.gb.setButton('right', true); c.avancer(1)
        if (c.variable('score') === 1 && c.voix(1).joue) entendu = true
      }
      c.gb.setButton('right', false)
      return [['la pièce ramassée', c.variable('score') === 1], ['la voix 1 a joué la note', entendu]]
    },
  },

  {
    titre: 'Un son quand on ramasse : note — et un bruit contre le mur',
    difficulte: 0,
    suite: true,
    idee: 'Le labyrinthe du 0.82.1, plus un bruit quand on se cogne : bruit(4, 8), sur la voix du bruit.',
    texte: [
      '**C’est le labyrinthe du 0.82.1, plus un son** quand le A se **cogne** contre un mur.',
      '**Ce qui est nouveau ici : `bruit(duree, volume)`.** Elle frappe sur la **voix du bruit** (la 4e) : pas une note, un « toc ». `bruit(4, 8)` : 4 images, volume 8.',
      '**Où le mettre :** dans le `else` du test du mur. Si la case d’arrivée **n’est pas** un M, on avance ; **sinon** (`else`), c’en est un : on reste, et on fait « toc ».',
      '**Et une note** quand on ramasse la pièce, comme au 0.83.',
    ],
    code: `// ---- LES VARIABLES : les mêmes qu'au 0.82.1 ----
uint8_t x = 3;
uint8_t y = 5;
uint8_t nx = 0;
uint8_t ny = 0;
uint8_t score = 0;

int main() {
  // ---- LE LABYRINTHE : tout en lettres M ----
  //
  //   ligne 2  :  M M M M M M M M M M M M M M M M M M M M   le haut
  //   ligne 3  :  M                   M                 M
  //   ligne 5  :  M     A             M         P       M   A : départ, P : la pièce
  //   …           M                   M                 M
  //   ligne 10 :  M                   M                 M   le mur du milieu s'arrête ici…
  //   ligne 11 :  M                                     M   …les lignes 11 à 13
  //   ligne 13 :  M                                     M      sont libres : on passe
  //   ligne 14 :  M M M M M M M M M M M M M M M M M M M M   le bas

  // Le haut et le bas : une ligne de 20 M, en UN seul texte.
  texte(0, 2, "MMMMMMMMMMMMMMMMMMMM");
  texte(0, 14, "MMMMMMMMMMMMMMMMMMMM");

  // Les deux côtés : un M par ligne, à gauche (colonne 0) et à droite (colonne 19).
  for (uint8_t l = 3; l < 14; l++) {
    poser(0, l, ALPHABET[12]);
    poser(19, l, ALPHABET[12]);
  }

  // Le mur du milieu, en colonne 10, des lignes 3 à 10 seulement : ouvert en bas.
  for (uint8_t l = 3; l <= 10; l++) {
    poser(10, l, ALPHABET[12]);
  }

  poser(16, 5, ALPHABET[15]);           // la pièce P, de l'autre côté du mur
  poser(x, y, ALPHABET[0]);             // le A, à son départ
  texte(0, 17, "SCORE");

  // ---- LA BOUCLE DU JEU ----
  while (true) {
    image();
    if (chaque(250)) {                  // au plus un pas tous les 250 ms (le 0.77)

      // ÉTAPE 1 : calculer la case d'ARRIVÉE, sans encore bouger.
      // On part de la case actuelle : si aucune flèche n'est tenue,
      // l'arrivée reste la case où l'on est.
      nx = x;
      ny = y;
      if (bouton(DROITE) && x < 19) { nx = x + 1; }   // une colonne à droite
      if (bouton(GAUCHE) && x > 0)  { nx = x - 1; }   // une colonne à gauche
      if (bouton(BAS) && y < 16)    { ny = y + 1; }   // une ligne plus bas
      if (bouton(HAUT) && y > 0)    { ny = y - 1; }   // une ligne plus haut

      // ÉTAPE 2 : REGARDER ce qu'il y a sur la case d'arrivée, avec lire() :
      //
      //   lire(nx, ny) != ALPHABET[12]
      //   |            |  |
      //   |            |  +-- le M, la lettre des murs
      //   |            +----- != : « n'est pas »
      //   +------------------ ce que montre l'écran à la case d'arrivée
      //
      //   Exemple : le A est en (9, 8), la flèche droite est tenue.
      //   L'arrivée est (10, 8). lire(10, 8) rend le M du mur :
      //   « n'est pas un M » est FAUX → le A ne bouge pas.
      if (nx != x || ny != y) {         // une flèche est tenue (|| : OU)
        if (lire(nx, ny) != ALPHABET[12]) {

          // ÉTAPE 3 : ce n'est pas un mur, on avance.
          effacer(x, y, 1);             // efface le A à l'ancienne case
          x = nx;                       // la case d'arrivée devient
          y = ny;                       //   la case du A
          poser(x, y, ALPHABET[0]);     // pose le A à la nouvelle case
        } else {
          // ÉTAPE 3 bis : c'EST un mur. Le A ne bouge pas, et on fait « toc ».
          //
          //   bruit(4, 8);
          //         |  |
          //         |  +-- volume : 8 (de 0 à 15)
          //         +----- durée : 4 images, un bruit très court
          //
          // bruit joue sur la VOIX DU BRUIT, la 4e : pas une note, un choc.
          bruit(4, 8);
        }
      }
    }

    // La pièce : une seule fois (score == 0), avec un « ding » (le 0.83).
    if (x == 16 && y == 5 && score == 0) {
      score = 1;
      note(1, DO5, 10, 12);
    }
    nombre(6, 17, score);
  }
}
`,
    aVoir: 'Le labyrinthe ; contre un mur, un « toc » ; sur la pièce, un « ding ».',
    controle: (c) => {
      c.avancer(10)
      let toc = false
      for (let k = 0; k < 200; k++) { c.gb.setButton('right', true); c.avancer(1); if (c.voix(4).volume > 0) toc = true }   // la voix du bruit : son volume monte quand elle frappe
      c.gb.setButton('right', false)
      return [['contre le mur, la voix du bruit a frappé', toc], ['le A est resté devant le mur', c.variable('x') === 9]]
    },
  },

  {
    titre: 'Des vies et une fin de partie',
    difficulte: 0,
    idee: 'Le poursuivant du 0.79, et 3 vies. Attrapé : une vie de moins, et tout le monde repart. À 0 : PERDU, et START pour recommencer.',
    texte: [
      '**C’est le poursuivant du 0.79, avec des vies.** On en a 3. Chaque fois que le B nous attrape, on en perd une, et le A comme le B **repartent de leur place de départ**.',
      '**Ce qui est nouveau ici : l’ÉTAT du jeu.** La variable `etat` dit **où on en est** : 0, on joue ; 1, on a perdu. Tout le programme est coupé en deux par `if (etat == 0) { … } else { … }` : en jeu, on bouge ; perdu, on attend.',
      '**Perdu :** quand `vies` arrive à 0, `etat = 1;` et le mot PERDU s’écrit au milieu. Dans l’état 1, plus rien ne bouge.',
      '**Recommencer :** dans l’état 1, le bouton **START** remet 3 vies et `etat = 0;` : on rejoue.',
      '**Repartir du départ** après une prise : on efface la case (le A et le B y sont tous les deux), puis on remet `x`, `y`, `bx`, `by` à leurs valeurs de départ.',
    ],
    code: `// ---- LES VARIABLES ----
uint8_t x = 10;       // le A : il part du milieu, (10, 8)
uint8_t y = 8;
uint8_t bx = 0;       // le B, le poursuivant : il part du coin, (0, 0)
uint8_t by = 0;
uint8_t sx = 0;       // la direction du prochain pas du B (le 0.79)
uint8_t sy = 0;
uint8_t vies = 3;     // les vies qui restent : 3 au départ
uint8_t etat = 0;     // L'ÉTAT DU JEU : 0 = on joue, 1 = perdu

int main() {
  texte(0, 17, "VIES");                       // le mot VIES, en bas à gauche

  while (true) {
    image();

    // ---- LE PROGRAMME EST COUPÉ EN DEUX PAR L'ÉTAT ----
    //
    //   if (etat == 0) { … on joue … } else { … perdu : on attend START … }
    //
    // Un seul des deux blocs se fait à chaque image, jamais les deux.
    if (etat == 0) {                          // ================ ON JOUE

      // Le B avance vers le A, un pas tous les 600 ms (le 0.79).
      if (chaque(600)) {
        sx = 0;
        if (x > bx) { sx = 1; }               // le A est à droite : un pas à droite
        if (x < bx) { sx = -1; }              // à gauche : un pas à gauche
        sy = 0;
        if (y > by) { sy = 1; }               // plus bas : un pas en bas
        if (y < by) { sy = -1; }              // plus haut : un pas en haut
        if (sx != 0 || sy != 0) {             // pas déjà sur lui
          un_pas(bx, by, ALPHABET[1], sx, sy);
        }
      }

      deplace_croix(x, y, ALPHABET[0], 250);  // le A suit la croix

      // ATTRAPÉ : le B est sur la case du A.
      if (bx == x && by == y) {
        vies = vies - 1;                      // 1. une vie de moins : 3 → 2 → 1 → 0
        effacer(x, y, 1);                     // 2. efface la case (le A et le B y sont)
        x = 10;                               // 3. tout le monde repart du départ :
        y = 8;                                //    le A au milieu…
        bx = 0;                               //    …le B dans le coin
        by = 0;

        if (vies == 0) {                      // 4. plus aucune vie ?
          etat = 1;                           //    on passe dans l'état « perdu »…
          texte(7, 8, "PERDU");               //    …et on l'écrit au milieu
        }
      }

      nombre(5, 17, vies);                    // les vies, après le mot VIES

    } else {                                  // ================ PERDU
      // Plus rien ne bouge : on attend seulement le bouton START.
      if (bouton(START)) {
        effacer(7, 8, 5);                     // efface les 5 lettres de PERDU
        vies = 3;                             // de nouveau 3 vies…
        etat = 0;                             // …et on rejoue
      }
    }
  }
}
`,
    aVoir: 'Le B poursuit le A ; à chaque prise, une vie de moins et tout repart. Au bout de trois : PERDU. START relance la partie.',
    controle: (c) => {
      c.avancer(1500)
      const perdu = c.variable('etat') === 1 && c.mot(7, 8, 5) === 'PERDU'
      c.presser('start', 6)
      c.avancer(5)
      return [
        ['immobile, on perd les 3 vies : PERDU', perdu],
        ['START fait recommencer : 3 vies, en jeu', c.variable('etat') === 0 && c.variable('vies') === 3],
        ['PERDU est effacé', c.mot(7, 8, 5).trim() !== 'PERDU'],
      ]
    },
  },

  {
    titre: 'Plusieurs ennemis : un tableau de struct',
    difficulte: 0,
    idee: 'Trois B, rangés dans Position ennemis[3], partis d’un endroit au hasard ; une boucle for les fait tous avancer vers le A.',
    texte: [
      '**Trois poursuivants au lieu d’un.** Plutôt que `bx`, `by`, `bx2`, `by2`, `bx3`, `by3`, on les range dans **un tableau de `struct`** : `Position ennemis[3];` (le type `Position` du 0.80).',
      '**Ce qui est nouveau ici : `ennemis[i].x`.** D’abord la **case** du tableau (`[i]`, l’ennemi n° i), **puis** la partie (`.x`, sa colonne). `ennemis[0].x` est la colonne du premier, `ennemis[2].y` la ligne du troisième.',
      '**Une boucle `for`** passe sur les trois : le même code fait avancer chacun vers le A (le 0.79). Pour quatre ennemis, on changerait seulement le 3 en 4.',
      '**Au départ, au hasard** (le 0.81.2) : chaque ennemi prend une colonne `hasard() % 20` sur les lignes du haut. Chaque partie commence différemment.',
      '**Ils finissent par se rejoindre** sur le A : ils visent tous la même case.',
    ],
    code: `// ---- LE TYPE Position (le 0.80) : une colonne et une ligne ----
struct Position { uint8_t x, y; };

// ---- UN TABLEAU DE Position : trois ennemis ----
//
//   Position ennemis[3];
//   |        |       |
//   |        |       +-- [3] : trois cases, numérotées 0, 1 et 2
//   |        +---------- le nom du tableau
//   +------------------- chaque case est une Position (un x et un y)
//
//   ennemis[0].x  ennemis[0].y   ← le 1er ennemi
//   ennemis[1].x  ennemis[1].y   ← le 2e
//   ennemis[2].x  ennemis[2].y   ← le 3e
Position ennemis[3];

uint8_t x = 10;       // le A : en bas, (10, 12)
uint8_t y = 12;
uint8_t sx = 0;       // la direction du prochain pas d'un ennemi
uint8_t sy = 0;

int main() {
  // ---- LE DÉPART : chaque ennemi au hasard, en haut de l'écran ----
  // i vaut 0, puis 1, puis 2 : la boucle s'occupe de chaque ennemi à son tour.
  for (uint8_t i = 0; i < 3; i++) {
    ennemis[i].x = hasard() % 20;       // sa colonne : de 0 à 19 (le 0.81.2)
    ennemis[i].y = hasard() % 3;        // sa ligne : de 0 à 2, tout en haut
    poser(ennemis[i].x, ennemis[i].y, ALPHABET[1]);   // on l'y pose : un B
  }

  // ---- LA BOUCLE DU JEU ----
  while (true) {
    image();

    if (chaque(700)) {                        // tous les 700 ms…
      for (uint8_t i = 0; i < 3; i++) {       // …chaque ennemi fait un pas vers le A
        // ennemis[i].x se lit en deux temps :
        //   ennemis[i] : d'abord la CASE du tableau, l'ennemi n° i
        //   .x         : puis la PARTIE, sa colonne
        //
        // La direction, comme au 0.79, mais avec les parties de ennemis[i] :
        sx = 0;
        if (x > ennemis[i].x) { sx = 1; }
        if (x < ennemis[i].x) { sx = -1; }
        sy = 0;
        if (y > ennemis[i].y) { sy = 1; }
        if (y < ennemis[i].y) { sy = -1; }
        if (sx != 0 || sy != 0) {
          // un_pas range la nouvelle place dans ennemis[i].x et ennemis[i].y :
          // la console sait ranger dans une partie de struct (le 0.80).
          un_pas(ennemis[i].x, ennemis[i].y, ALPHABET[1], sx, sy);
        }
      }
    }

    deplace_croix(x, y, ALPHABET[0], 250);    // le A, dessiné en dernier : par-dessus
  }
}
`,
    aVoir: 'Trois B partis d’en haut, à des places différentes à chaque partie, qui descendent tous vers le A.',
    controle: (c) => {
      c.avancer(5)
      let bs = 0
      for (let l = 0; l < 17; l++) bs += [...c.mot(0, l, 20)].filter((ch) => ch === 'B').length
      c.avancer(300)   // plus tard, ils ont rejoint le A et sont cachés sous lui
      return [
        ['des B à l’écran au départ', bs >= 1, ` (${bs})`],
        ['ils sont descendus vers le A (ligne 8 ou plus bas)', [8, 9, 10, 11, 12].some((l) => c.mot(0, l, 20).includes('B'))],
      ]
    },
  },

  {
    titre: 'L’alphabet en gras, avec poserS',
    difficulte: 0,
    partie: 'Les lettres et l’écran titre',
    idee: 'ALPHABET_GRAS, un second alphabet de la console, aux traits épais. Le 0.10 avec ALPHABET_GRAS à la place d’ALPHABET : A à T sur la ligne 0, U à Z sur la ligne 1.',
    texte: [
      '**C’est le 0.10, avec un autre alphabet.** Même boucle, même `poserS` : seul le nom du tableau change, `ALPHABET_GRAS` au lieu d’`ALPHABET`.',
      '**Ce qui est nouveau ici : `ALPHABET_GRAS`.** Un second tableau de la console, comme `ALPHABET` : 26 cases, de `ALPHABET_GRAS[0]` (le A) à `ALPHABET_GRAS[25]` (le Z). Les lettres sont les mêmes, mais leurs traits font **2 pixels d’épaisseur** au lieu d’un.',
      '**L’ancien alphabet ne change pas :** `ALPHABET` est toujours là, et tous les cours d’avant gardent leurs lettres. Les deux peuvent se mélanger dans un même programme.',
      '**`sizeof(ALPHABET_GRAS)`** vaut 26, comme `sizeof(ALPHABET)` (le 0.9) : la boucle fait 26 tours, de A à Z.',
      '**`poserS`** passe tout seul à la ligne suivante (le 0.10) : A à T sur la ligne 0, puis U à Z sur la ligne 1.',
      '**Gratuit si on ne s’en sert pas :** les 26 lettres grasses ne sont ajoutées à la cartouche que si le programme écrit `ALPHABET_GRAS`.',
    ],
    code: `int main() {
  // La boucle, morceau par morceau :
  //
  //   poserS(i, 0, ALPHABET_GRAS[i]);
  //          |  |  |
  //          |  |  +-- ALPHABET_GRAS[i] : la lettre n° i, EN GRAS
  //          |  |      (0 = A, 1 = B … 25 = Z), comme ALPHABET[i]
  //          |  +----- la ligne 0 ; poserS passe tout seul à la ligne 1
  //          +-------- la colonne i : après la colonne 19, poserS repart en 0
  //
  //   i = 0 : A gras en (0, 0)      i = 19 : T gras en (19, 0)
  //   i = 20 : U gras en (0, 1)     i = 25 : Z gras en (5, 1)
  // sizeof(ALPHABET_GRAS) vaut 26 : i va de 0 (A) à 25 (Z).
  for (uint8_t i = 0; i < sizeof(ALPHABET_GRAS); i++) {
    poserS(i, 0, ALPHABET_GRAS[i]);
  }

  while (true) {
    image();
  }
}
`,
    aVoir: 'Tout l’alphabet en gras, de A à Z : A à T sur la première ligne, U à Z sur la deuxième.',
    controle: (c) => {
      c.avancer(10)
      const cases = []
      for (let x = 0; x < 20; x++) cases.push(c.lire(x, 0))
      for (let x = 0; x < 6; x++) cases.push(c.lire(x, 1))
      const par = 1
      return [
        ['26 lettres grasses, toutes différentes', new Set(cases).size === 26, ` (${new Set(cases).size})`],
        ['ce ne sont pas les lettres d’ALPHABET', cases.every((t) => t > 26)],
      ]
    },
  },

  {
    titre: 'L’alphabet en gras, avec poserS — de base, ailleurs',
    difficulte: 0,
    suite: true,
    idee: 'Le 0.86 cinq lignes plus bas : poserS(i, 5, ALPHABET_GRAS[i]).',
    texte: [
      '**C’est le 0.86, cinq lignes plus bas :** la ligne de départ est 5 au lieu de 0. `poserS` passe tout seul à la ligne 6 après le T.',
      '**Un seul nombre change**, dans `poserS` : c’est la ligne.',
      '**C’est la version de base.** Le 0.86.2 met l’ancien et le nouvel alphabet l’un au-dessus de l’autre.',
    ],
    code: `int main() {
  // Le changement : la ligne, 0 → 5. U à Z iront sur la ligne 6.
  for (uint8_t i = 0; i < sizeof(ALPHABET_GRAS); i++) {
    poserS(i, 5, ALPHABET_GRAS[i]);
  }

  while (true) {
    image();
  }
}
`,
    aVoir: 'L’alphabet en gras, sur les lignes 5 et 6.',
    controle: (c) => {
      c.avancer(10)
      const cases = []
      for (let x = 0; x < 20; x++) cases.push(c.lire(x, 5))
      for (let x = 0; x < 6; x++) cases.push(c.lire(x, 6))
      const par = 1
      return [
        ['26 lettres grasses, toutes différentes', new Set(cases).size === 26, ` (${new Set(cases).size})`],
        ['ce ne sont pas les lettres d’ALPHABET', cases.every((t) => t > 26)],
      ]
    },
  },

  {
    titre: 'L’alphabet en gras, avec poserS — doublé, deux positions',
    difficulte: 0,
    suite: true,
    idee: 'L’ancien alphabet en haut, le nouveau en dessous : ALPHABET sur les lignes 0 et 1, ALPHABET_GRAS sur les lignes 3 et 4. On compare.',
    texte: [
      '**Les deux alphabets l’un au-dessus de l’autre**, pour comparer : `ALPHABET`, celui de toujours, sur les lignes 0 et 1 ; `ALPHABET_GRAS` sur les lignes 3 et 4.',
      '**Deux boucles, deux tableaux :** la première lit `ALPHABET[i]`, la seconde `ALPHABET_GRAS[i]`. Chaque `for` a son propre `i`.',
      '**Regarde le M, le N et le W :** leurs traits étaient trop serrés pour être simplement épaissis. Ils ont été redessinés un peu plus larges, pour garder leurs creux.',
    ],
    code: `int main() {
  // 1. L'alphabet de toujours, sur les lignes 0 et 1.
  for (uint8_t i = 0; i < sizeof(ALPHABET); i++) {
    poserS(i, 0, ALPHABET[i]);
  }

  // 2. L’alphabet en gras, sur les lignes 3 et 4 : on compare.
  for (uint8_t i = 0; i < sizeof(ALPHABET_GRAS); i++) {
    poserS(i, 3, ALPHABET_GRAS[i]);
  }

  while (true) {
    image();
  }
}
`,
    aVoir: 'En haut, l’alphabet habituel ; en dessous, le même en gras.',
    controle: (c) => {
      c.avancer(10)
      return [
        ['en haut, l’alphabet habituel', c.mot(0, 0, 20) === 'ABCDEFGHIJKLMNOPQRST' && c.mot(0, 1, 6) === 'UVWXYZ'],
        ['en dessous, 26 lettres grasses', new Set([...Array(20).keys()].map((x) => c.lire(x, 3)).concat([...Array(6).keys()].map((x) => c.lire(x, 4)))).size === 26 && c.lire(0, 3) > 26],
      ]
    },
  },

  {
    titre: 'Agrandir une lettre : texteGrand',
    difficulte: 0,
    idee: 'texteGrand(x, y, "A", 3) : le A trois fois plus grand, sans rien dessiner. Chaque pixel devient un carré de 3 × 3 pixels ; les proportions sont gardées.',
    texte: [
      '**Une lettre plus grande, sans la dessiner.** La Game Boy n’a pas de zoom, mais la console peut **calculer** une lettre agrandie à partir de la police : chaque pixel devient un carré.',
      '**Ce qui est nouveau ici : `texteGrand(x, y, "TEXTE", taille)`.** La **taille** va de **1 à 20** : c’est combien de fois plus grand. Avec `3`, chaque pixel de la lettre devient un carré de **3 × 3 pixels**. La lettre garde **exactement ses proportions**.',
      '**La place qu’elle prend :** une lettre normale tient dans **1 case** (8 × 8 pixels). Agrandie 3 fois, elle en prend **3 × 3 = 9** (24 × 24 pixels). À la taille *n*, une lettre prend *n* cases de large et *n* de haut.',
      '**Le texte et la taille s’écrivent en clair** (`"A"`, `3`), comme pour `ms()` : le compilateur fabrique les tuiles agrandies **avant le jeu**, et seulement celles dont le programme a besoin.',
      '**Ce qu’elle coûte :** quelques tuiles de plus dans la cartouche. Deux tuiles identiques (souvent toutes pleines aux grandes tailles) ne sont fabriquées qu’une fois.',
    ],
    code: `int main() {
  // La ligne, morceau par morceau :
  //
  //   texteGrand(2, 2, "A", 3);
  //              |  |  |    |
  //              |  |  |    +-- la TAILLE : 3 fois plus grand (de 1 à 20)
  //              |  |  +------- le texte, entre guillemets
  //              +--+---------- la case en haut à gauche du grand A : (2, 2)
  //
  // Chaque pixel du A devient un carré de 3 × 3 pixels :
  //
  //   le A normal (8 × 8)      le A × 3 (24 × 24 pixels = 3 × 3 cases)
  //   ··███···                 ······█████████·········
  //   ·█···█··                 ······█████████·········
  //   ·█···█··                 ······█████████·········
  //   ·█████··                 ···███·········███······
  //   …                        …
  texteGrand(2, 2, "A", 3);

  while (true) {
    image();
  }
}
`,
    aVoir: 'Un grand A, trois fois plus grand qu’une lettre normale, en haut à gauche.',
    controle: (c) => {
      c.avancer(10)
      return [
        ['le grand A occupe ses 3 × 3 cases', (() => { let n = 0; for (let j = 2; j < 5; j++) for (let i = 2; i < 5; i++) if (c.lire(i, j) !== 0) n++; return n })() >= 6],
        ['rien à côté', (() => { let n = 0; for (let j = 2; j < 5; j++) for (let i = 5; i < 8; i++) if (c.lire(i, j) !== 0) n++; return n })() === 0],
      ]
    },
  },

  {
    titre: 'Agrandir une lettre : texteGrand — toutes les tailles',
    difficulte: 0,
    suite: true,
    idee: 'Le même A, aux tailles 1, 2, 3 et 4, côte à côte : un seul nombre change d’une ligne à l’autre.',
    texte: [
      '**Quatre lignes, un seul nombre qui change :** la taille, 1, 2, 3, puis 4. On voit le A grandir.',
      '**Tu choisis la taille, la console s’adapte :** aucune taille n’est dessinée à l’avance. Chaque `texteGrand` fait calculer les tuiles de SA taille.',
      '**La place :** taille 1, 1 case ; taille 2, 2 × 2 ; taille 3, 3 × 3 ; taille 4, 4 × 4. Les colonnes de départ (0, 2, 5, 9) laissent juste la place à chacun.',
    ],
    code: `int main() {
  texteGrand(0, 0, "A", 1);     // taille 1 : 1 case, comme une lettre normale
  texteGrand(2, 0, "A", 2);     // taille 2 : 2 × 2 cases
  texteGrand(5, 0, "A", 3);     // taille 3 : 3 × 3 cases
  texteGrand(9, 0, "A", 4);     // taille 4 : 4 × 4 cases

  while (true) {
    image();
  }
}
`,
    aVoir: 'Quatre A côte à côte, de plus en plus grands : tailles 1, 2, 3 et 4.',
    controle: (c) => {
      c.avancer(10)
      return [
        ['taille 1 : une case', (() => { let n = 0; for (let j = 0; j < 1; j++) for (let i = 0; i < 1; i++) if (c.lire(i, j) !== 0) n++; return n })() === 1],
        ['taille 4 : dans ses 4 × 4 cases', (() => { let n = 0; for (let j = 0; j < 4; j++) for (let i = 9; i < 13; i++) if (c.lire(i, j) !== 0) n++; return n })() >= 10],
        ['chacun plus grand que le précédent', (() => { let n = 0; for (let j = 0; j < 2; j++) for (let i = 2; i < 4; i++) if (c.lire(i, j) !== 0) n++; return n })() < (() => { let n = 0; for (let j = 0; j < 3; j++) for (let i = 5; i < 8; i++) if (c.lire(i, j) !== 0) n++; return n })() && (() => { let n = 0; for (let j = 0; j < 3; j++) for (let i = 5; i < 8; i++) if (c.lire(i, j) !== 0) n++; return n })() < (() => { let n = 0; for (let j = 0; j < 4; j++) for (let i = 9; i < 13; i++) if (c.lire(i, j) !== 0) n++; return n })()],
      ]
    },
  },

  {
    titre: 'Agrandir une lettre : texteGrand — dix fois',
    difficulte: 0,
    suite: true,
    idee: 'Le plus grand : texteGrand(5, 4, "A", 10). Un A de 80 × 80 pixels, 10 × 10 cases, la moitié de l’écran.',
    texte: [
      '**La taille la plus grande, 10 :** chaque pixel devient un carré de 10 × 10 pixels. Le A fait **80 × 80 pixels**, soit **10 × 10 cases** : la moitié de la largeur de l’écran (20 cases).',
      '**La moitié de l’écran :** l’écran fait 20 × 18 cases ; à la taille 10, une lettre en prend 10 × 10. La plus grande taille, 20, remplit l’écran entier : c’est le 0.87.4.',
      '**Ça ne coûte presque rien de plus :** aux grandes tailles, beaucoup de tuiles sont **toutes pleines** ou **toutes vides**. Les tuiles identiques ne sont fabriquées qu’une fois.',
    ],
    code: `int main() {
  // Le A dix fois plus grand : 10 × 10 cases, de (5, 4) à (14, 13).
  texteGrand(5, 4, "A", 10);

  while (true) {
    image();
  }
}
`,
    aVoir: 'Un A géant au milieu de l’écran, dix fois plus grand qu’une lettre normale.',
    controle: (c) => {
      c.avancer(10)
      return [
        ['le A géant remplit une bonne part de ses 10 × 10 cases', (() => { let n = 0; for (let j = 4; j < 14; j++) for (let i = 5; i < 15; i++) if (c.lire(i, j) !== 0) n++; return n })() >= 40, ` (${(() => { let n = 0; for (let j = 4; j < 14; j++) for (let i = 5; i < 15; i++) if (c.lire(i, j) !== 0) n++; return n })()})`],
        ['il ne déborde pas', (() => { let n = 0; for (let j = 4; j < 14; j++) for (let i = 15; i < 20; i++) if (c.lire(i, j) !== 0) n++; return n })() === 0],
      ]
    },
  },

  {
    titre: 'Agrandir une lettre : texteGrand — un mot',
    difficulte: 0,
    suite: true,
    idee: 'Un mot entier agrandi : texteGrand(3, 7, "JEU", 4). Chaque lettre prend 4 × 4 cases ; le mot, 12 × 4.',
    texte: [
      '**Pas seulement une lettre :** `texteGrand` agrandit un **mot entier**. Les lettres se suivent, chacune agrandie.',
      '**La largeur du mot :** 3 lettres × 4 cases = **12 cases**. Il faut qu’elle tienne dans les 20 colonnes de l’écran : `"BONJOUR"` (7 lettres) tient à la taille 2 (14 cases), pas à la taille 3 (21 cases).',
      '**Un titre de jeu,** c’est exactement ça : un mot en grand, au milieu de l’écran.',
    ],
    code: `int main() {
  // 3 lettres × 4 cases = 12 cases de large, 4 de haut : de (3, 7) à (14, 10).
  texteGrand(3, 7, "JEU", 4);

  while (true) {
    image();
  }
}
`,
    aVoir: 'Le mot JEU en grandes lettres, au milieu de l’écran.',
    controle: (c) => {
      c.avancer(10)
      return [
        ['le J, le E et le U, chacun dans ses 4 × 4 cases', (() => { let n = 0; for (let j = 7; j < 11; j++) for (let i = 3; i < 7; i++) if (c.lire(i, j) !== 0) n++; return n })() > 4 && (() => { let n = 0; for (let j = 7; j < 11; j++) for (let i = 7; i < 11; i++) if (c.lire(i, j) !== 0) n++; return n })() > 4 && (() => { let n = 0; for (let j = 7; j < 11; j++) for (let i = 11; i < 15; i++) if (c.lire(i, j) !== 0) n++; return n })() > 4],
        ['rien après le mot', (() => { let n = 0; for (let j = 7; j < 11; j++) for (let i = 15; i < 20; i++) if (c.lire(i, j) !== 0) n++; return n })() === 0],
      ]
    },
  },

  {
    titre: 'Agrandir une lettre : texteGrand — vingt fois',
    difficulte: 0,
    suite: true,
    idee: 'La plus grande taille : texteGrand(0, 0, "A", 20). Le A remplit tout l’écran, 160 × 140 pixels.',
    texte: [
      '**La taille la plus grande, 20 :** chaque pixel du A devient un carré de 20 × 20 pixels. La lettre fait **160 pixels de large** (toute la largeur de l’écran) et **140 de haut** : elle remplit l’écran.',
      '**Pourquoi 20 au plus :** une lettre de la police fait **7 pixels de haut**, et l’écran **144**. 7 × 20 = 140 : elle tient encore entière. À 21, 7 × 21 = 147 : le bas du A sortirait de l’écran. Le compilateur refuse donc au-delà de 20, et dit pourquoi.',
      '**En largeur aussi, tout juste :** une case de lettre fait 8 pixels ; 8 × 20 = 160, la largeur exacte de l’écran. Pour tenir, le A géant commence en (0, 0).',
      '**Ça ne coûte presque rien en dessins :** à cette taille, presque toutes les tuiles sont toutes pleines ou toutes vides. Le A géant n’en demande que 9 différentes.',
    ],
    code: `int main() {
  // La plus grande taille : 20. Le A fait 20 × 20 cases, tout l'écran.
  //   8 pixels × 20 = 160 : toute la largeur
  //   7 pixels × 20 = 140 : presque toute la hauteur (144)
  texteGrand(0, 0, "A", 20);

  while (true) {
    image();
  }
}
`,
    aVoir: 'Un A immense, qui remplit tout l’écran.',
    controle: (c) => {
      c.avancer(10)
      let n = 0
      for (let j = 0; j < 18; j++) for (let i = 0; i < 20; i++) if (c.lire(i, j) !== 0) n++
      return [['le A géant occupe une grande part de l’écran', n >= 100, ` (${n} cases pleines)`]]
    },
  },

  {
    titre: 'Agrandir une lettre : texteGrand — aller à la ligne, texteGrandS',
    difficulte: 0,
    suite: true,
    idee: 'texteGrandS(0, 0, "BONJOUR", 3) : comme texteGrand, mais les lettres qui ne tiennent plus dans la largeur passent à la ligne, comme textS.',
    texte: [
      '**Avec `texteGrand`, un mot trop long sort de l’écran par la droite.** « BONJOUR » en taille 3 demande 7 × 3 = 21 cases de large ; l’écran n’en a que 20 : le R disparaît.',
      '**Ce qui est nouveau ici : `texteGrandS`,** le `S` de `textS` (le 0.11). Même réglages que `texteGrand`, mais les lettres qui ne tiennent plus **passent à la ligne** : elles reprennent en colonne 0, une rangée de lettres plus bas (3 cases, à la taille 3).',
      '**Le découpage :** à la taille 3, une ligne tient 20 ÷ 3 = 6 lettres (18 cases). « BONJOU » sur la première, « R » sur la deuxième.',
      '**Trop haut, c’est une erreur :** l’écran a 18 cases de haut. Si le texte en demande plus (« BONJOUR » en taille 7 : 4 lignes de 7 cases, 28), le compilateur refuse, et dit combien il en faudrait.',
      '**Tout s’écrit en clair,** même la place : le découpage en lignes se fait avant le jeu.',
    ],
    code: `int main() {
  // Comme texteGrand, mais qui VA À LA LIGNE :
  //
  //   texteGrandS(0, 0, "BONJOUR", 3);
  //   la taille 3 : 3 cases par lettre ; une ligne de 20 cases en tient 6.
  //
  //   ligne 1, cases 0 à 2 :   B O N J O U     (6 lettres × 3 = 18 cases)
  //   ligne 2, cases 3 à 5 :   R               (repart en colonne 0)
  texteGrandS(0, 0, "BONJOUR", 3);

  while (true) {
    image();
  }
}
`,
    aVoir: 'BONJOU en grandes lettres sur la première ligne, et le R en dessous, à gauche.',
    controle: (c) => {
      c.avancer(10)
      const plein = (x, y, l, h) => { let n = 0; for (let j = y; j < y + h; j++) for (let i = x; i < x + l; i++) if (c.lire(i, j) !== 0) n++; return n }
      return [
        ['BONJOU sur la première ligne (cases 0 à 2)', plein(0, 0, 18, 3) > 20],
        ['le R est passé à la ligne, en colonne 0', plein(0, 3, 3, 3) > 2],
        ['rien après le R', plein(3, 3, 17, 3) === 0],
      ]
    },
  },

  {
    titre: 'Des lettres en couleur : couleurTexte',
    difficulte: 0,
    idee: 'couleurTexte(31, 0, 0) : toutes les lettres deviennent rouges. Trois nombres de 0 à 31 : le rouge, le vert, le bleu.',
    texte: [
      '**Les lettres peuvent changer de couleur.** Une ligne suffit : `couleurTexte(rouge, vert, bleu);`.',
      '**Ce qui est nouveau ici : une couleur, en trois nombres.** L’écran mélange du **rouge**, du **vert** et du **bleu**, chacun de **0** (rien) à **31** (le plus fort). `31, 0, 0` : tout le rouge, pas de vert, pas de bleu → **rouge**. `0, 0, 31` : bleu. `31, 31, 0` : rouge + vert = **jaune**. `31, 31, 31` : blanc.',
      '**Toutes les lettres changent ensemble**, même celles écrites avant ou après : `couleurTexte` règle la couleur **de l’encre**, pas d’un mot.',
      '**Sur la Game Boy Color seulement :** la Game Boy d’origine n’a que 4 gris-verts. Le programme passe tout seul en mode couleur ; choisis « En couleur » en haut de la page.',
    ],
    code: `int main() {
  // La couleur, morceau par morceau :
  //
  //   couleurTexte(31, 0, 0);
  //                |   |  |
  //                |   |  +-- le BLEU  : 0 (rien)
  //                |   +----- le VERT  : 0 (rien)
  //                +--------- le ROUGE : 31 (le plus fort) → du rouge
  //
  //   quelques mélanges :   31, 0, 0 rouge     0, 31, 0 vert     0, 0, 31 bleu
  //                         31, 31, 0 jaune    31, 16, 0 orange  31, 31, 31 blanc
  couleurTexte(31, 0, 0);

  texte(9, 8, "A");         // un A… rouge

  while (true) {
    image();
  }
}
`,
    aVoir: 'Un A rouge au milieu de l’écran (sur « En couleur »).',
    controle: (c) => {
      c.avancer(10)
      const coul = (p, t) => { const i = p * 8 + t * 2, v = c.gb.ppu.bgPalettes[i] | (c.gb.ppu.bgPalettes[i + 1] << 8); return [v & 31, (v >> 5) & 31, (v >> 10) & 31].join(',') }
      const pal = (x, y) => c.gb.ppu.vram[0x2000 + 0x1800 + y * 32 + x] & 7
      return [
        ['le A est écrit', c.mot(9, 8, 1) === 'A'],
        ['l’encre des lettres est rouge : 31, 0, 0', coul(0, 3) === '31,0,0', ` (${coul(0, 3)})`],
      ]
    },
  },

  {
    titre: 'Des lettres en couleur : couleurTexte — un mot en bleu',
    difficulte: 0,
    suite: true,
    idee: 'Le 0.88 avec une autre couleur et un mot entier : couleurTexte(0, 0, 31), puis BONJOUR.',
    texte: [
      '**C’est le 0.88, avec un mot et du bleu :** `couleurTexte(0, 0, 31)` (seulement du bleu), puis `texte(6, 8, "BONJOUR")`.',
      '**Toutes les lettres du mot** prennent la couleur : c’est la même encre pour tout le texte.',
    ],
    code: `int main() {
  couleurTexte(0, 0, 31);   // rouge 0, vert 0, bleu 31 : du bleu
  texte(6, 8, "BONJOUR");   // tout le mot, en bleu

  while (true) {
    image();
  }
}
`,
    aVoir: 'BONJOUR en bleu, au milieu de l’écran.',
    controle: (c) => {
      c.avancer(10)
      const coul = (p, t) => { const i = p * 8 + t * 2, v = c.gb.ppu.bgPalettes[i] | (c.gb.ppu.bgPalettes[i + 1] << 8); return [v & 31, (v >> 5) & 31, (v >> 10) & 31].join(',') }
      const pal = (x, y) => c.gb.ppu.vram[0x2000 + 0x1800 + y * 32 + x] & 7
      return [['BONJOUR en bleu : 0, 0, 31', c.mot(6, 8, 7) === 'BONJOUR' && coul(0, 3) === '0,0,31', ` (${coul(0, 3)})`]]
    },
  },

  {
    titre: 'Des lettres en couleur : couleurTexte — changer en route',
    difficulte: 0,
    suite: true,
    idee: 'La couleur change toute seule, toutes les demi-secondes : rouge, vert, bleu, et on recommence. chaque(500) et une étape de 0 à 2.',
    texte: [
      '**La couleur peut changer pendant le jeu :** il suffit de rappeler `couleurTexte` avec d’autres nombres. Le mot déjà écrit change de couleur **tout de suite**, sans être réécrit.',
      '**Toutes les demi-secondes** (`chaque(500)`, le 0.77), `etape` avance : 0, 1, 2, puis 0. Selon l’étape, une couleur : rouge, vert, bleu.',
      '**Le mot n’est écrit qu’une fois**, avant la boucle : seule l’encre change.',
    ],
    code: `uint8_t etape = 0;        // 0 = rouge, 1 = vert, 2 = bleu

int main() {
  texte(6, 8, "BONJOUR");   // écrit UNE fois : ensuite, seule l'encre change

  while (true) {
    image();
    if (chaque(500)) {                 // toutes les demi-secondes…
      etape = (etape + 1) % 3;         // …l'étape suivante : 0, 1, 2, 0…
      if (etape == 0) { couleurTexte(31, 0, 0); }   // rouge
      if (etape == 1) { couleurTexte(0, 31, 0); }   // vert
      if (etape == 2) { couleurTexte(0, 0, 31); }   // bleu
    }
  }
}
`,
    aVoir: 'BONJOUR qui change de couleur toutes les demi-secondes : rouge, vert, bleu.',
    controle: (c) => {
      const coul = (p, t) => { const i = p * 8 + t * 2, v = c.gb.ppu.bgPalettes[i] | (c.gb.ppu.bgPalettes[i + 1] << 8); return [v & 31, (v >> 5) & 31, (v >> 10) & 31].join(',') }
      const pal = (x, y) => c.gb.ppu.vram[0x2000 + 0x1800 + y * 32 + x] & 7
      const vues = new Set()
      for (let k = 0; k < 150; k++) { c.avancer(1); vues.add(coul(0, 3)) }
      return [['les trois couleurs, l’une après l’autre', ['31,0,0', '0,31,0', '0,0,31'].every((v) => vues.has(v)), ` (${[...vues].join(' / ')})`]]
    },
  },

  {
    titre: 'Chaque mot sa couleur : texteCouleur',
    difficulte: 0,
    idee: 'texteCouleur(x, y, "MOT", palette) : le mot, dans la couleur de SA palette. Trois palettes, trois couleurs, trois mots.',
    texte: [
      '**`couleurTexte` teint TOUT le texte.** Pour des mots de couleurs différentes, il faut dire **quelle couleur à quel mot**.',
      '**Ce qui est nouveau ici : les palettes.** La console en a **8**, numérotées de 0 à 7 : 8 boîtes de couleurs. `couleurFond(1, 3, 31, 0, 0)` met du rouge dans la **teinte 3** (celle des lettres) de la **palette 1**. On remplit ainsi la palette 1 en rouge, la 2 en vert, la 3 en bleu.',
      '**Ce qui est nouveau aussi : `texteCouleur(x, y, "MOT", palette)`.** Il écrit le mot, **et** met chacune de ses cases dans cette palette. Le mot prend la couleur de la palette.',
      '**La palette 0** est celle de toutes les cases qu’on n’a pas teintes : c’est elle que `couleurTexte` règle.',
      '**Sur la Game Boy Color seulement :** la Game Boy d’origine n’a que 4 gris-verts. Le programme passe tout seul en mode couleur ; choisis « En couleur » en haut de la page.',
    ],
    code: `int main() {
  // Trois palettes, trois couleurs pour la teinte 3 (celle des lettres) :
  //
  //   couleurFond(1, 3, 31, 0, 0);
  //               |  |  |
  //               |  |  +-- la couleur : rouge, vert, bleu (0 à 31)
  //               |  +----- la teinte 3 : celle des lettres
  //               +-------- la palette n° 1 (il y en a 8, de 0 à 7)
  couleurFond(1, 3, 31, 0, 0);    // palette 1 : rouge
  couleurFond(2, 3, 0, 31, 0);    // palette 2 : vert
  couleurFond(3, 3, 0, 0, 31);    // palette 3 : bleu

  // Chaque mot, dans sa palette :
  //
  //   texteCouleur(6, 4, "ROUGE", 1);
  //                |  |  |        |
  //                |  |  |        +-- la palette : 1, la rouge
  //                |  |  +----------- le mot
  //                +--+-------------- sa place
  texteCouleur(6, 4, "ROUGE", 1);
  texteCouleur(6, 8, "VERT", 2);
  texteCouleur(6, 12, "BLEU", 3);

  while (true) {
    image();
  }
}
`,
    aVoir: 'ROUGE en rouge, VERT en vert, BLEU en bleu, l’un sous l’autre.',
    controle: (c) => {
      c.avancer(10)
      const coul = (p, t) => { const i = p * 8 + t * 2, v = c.gb.ppu.bgPalettes[i] | (c.gb.ppu.bgPalettes[i + 1] << 8); return [v & 31, (v >> 5) & 31, (v >> 10) & 31].join(',') }
      const pal = (x, y) => c.gb.ppu.vram[0x2000 + 0x1800 + y * 32 + x] & 7
      return [
        ['les trois mots', c.mot(6, 4, 5) === 'ROUGE' && c.mot(6, 8, 4) === 'VERT' && c.mot(6, 12, 4) === 'BLEU'],
        ['ROUGE dans la palette 1, rouge', pal(6, 4) === 1 && pal(10, 4) === 1 && coul(1, 3) === '31,0,0'],
        ['VERT dans la 2, BLEU dans la 3', pal(6, 8) === 2 && pal(6, 12) === 3 && coul(2, 3) === '0,31,0' && coul(3, 3) === '0,0,31'],
      ]
    },
  },

  {
    titre: 'Chaque mot sa couleur : texteCouleur — un arc-en-ciel',
    difficulte: 0,
    suite: true,
    idee: 'Chaque LETTRE sa couleur : six palettes, et teindre(x + i, y, 1 + i % 6) dans une boucle. BONJOUR en arc-en-ciel.',
    texte: [
      '**Plus fin que le mot : la lettre.** `teindre(colonne, ligne, palette)` met **une seule case** dans une palette. Dans une boucle, chaque lettre du mot prend la sienne.',
      '**Six couleurs d’arc-en-ciel,** dans les palettes 1 à 6 : rouge, orange, jaune, vert, bleu, violet.',
      '**`1 + i % 6`** : pour la lettre n° i, la palette 1, 2 … 6, puis de nouveau 1 (le `%` du 0.9). BONJOUR a 7 lettres : la 7e (le R) reprend le rouge.',
    ],
    code: `int main() {
  // Six couleurs, dans les palettes 1 à 6 (teinte 3, celle des lettres) :
  couleurFond(1, 3, 31, 0, 0);    // 1 : rouge
  couleurFond(2, 3, 31, 16, 0);   // 2 : orange (rouge + un peu de vert)
  couleurFond(3, 3, 31, 31, 0);   // 3 : jaune  (rouge + vert)
  couleurFond(4, 3, 0, 31, 0);    // 4 : vert
  couleurFond(5, 3, 0, 0, 31);    // 5 : bleu
  couleurFond(6, 3, 20, 0, 31);   // 6 : violet (bleu + un peu de rouge)

  texte(6, 8, "BONJOUR");

  // Chaque lettre, sa palette :
  //   i = 0 (B) : 1 + 0 % 6 = 1 rouge     i = 3 (J) : 4 vert
  //   i = 1 (O) : 2 orange                i = 5 (U) : 6 violet
  //   i = 6 (R) : 1 + 6 % 6 = 1 : de nouveau rouge
  for (uint8_t i = 0; i < 7; i++) {
    teindre(6 + i, 8, 1 + i % 6);
  }

  while (true) {
    image();
  }
}
`,
    aVoir: 'BONJOUR en arc-en-ciel : chaque lettre de sa couleur.',
    controle: (c) => {
      c.avancer(10)
      const coul = (p, t) => { const i = p * 8 + t * 2, v = c.gb.ppu.bgPalettes[i] | (c.gb.ppu.bgPalettes[i + 1] << 8); return [v & 31, (v >> 5) & 31, (v >> 10) & 31].join(',') }
      const pal = (x, y) => c.gb.ppu.vram[0x2000 + 0x1800 + y * 32 + x] & 7
      const pals = [0, 1, 2, 3, 4, 5, 6].map((i) => pal(6 + i, 8))
      return [
        ['chaque lettre sa palette : 1 à 6, puis 1', pals.join('') === '1234561', ` (${pals.join('')})`],
        ['la 3 est jaune', coul(3, 3) === '31,31,0'],
      ]
    },
  },

  {
    titre: 'Un titre agrandi, en couleur',
    difficulte: 0,
    idee: 'texteGrand (le 0.87) et couleurTexte ensemble : un grand JEU orange, comme l’écran titre d’un jeu.',
    texte: [
      '**On réunit deux choses déjà vues :** `texteGrand` (le 0.87), qui agrandit, et `couleurTexte` (le 0.88), qui colore.',
      '**Ce qui est nouveau ici :** rien de plus, mais ensemble. Les lettres agrandies sont dessinées dans la **même teinte** que les lettres normales, la teinte 3 : `couleurTexte` les colore aussi.',
      '**L’orange,** c’est `31, 16, 0` : tout le rouge, la moitié du vert, pas de bleu.',
      '**C’est un écran titre :** un mot en grand et en couleur, au milieu. Il ne reste qu’à écrire en dessous « APPUIE SUR START ».',
    ],
    code: `int main() {
  couleurTexte(31, 16, 0);          // de l'orange : tout le rouge, la moitié du vert
  texteGrand(4, 5, "JEU", 4);       // le titre, 4 fois plus grand (le 0.87)
  texte(2, 12, "APPUIE SUR START"); // en dessous, en petit : orange aussi

  while (true) {
    image();
  }
}
`,
    aVoir: 'Un grand JEU orange au milieu de l’écran, et en dessous APPUIE SUR START.',
    controle: (c) => {
      c.avancer(10)
      const coul = (p, t) => { const i = p * 8 + t * 2, v = c.gb.ppu.bgPalettes[i] | (c.gb.ppu.bgPalettes[i + 1] << 8); return [v & 31, (v >> 5) & 31, (v >> 10) & 31].join(',') }
      const pal = (x, y) => c.gb.ppu.vram[0x2000 + 0x1800 + y * 32 + x] & 7
      let pleines = 0
      for (let j = 5; j < 9; j++) for (let i = 4; i < 16; i++) if (c.lire(i, j) !== 0) pleines++
      return [
        ['le grand JEU est là', pleines > 15],
        ['et APPUIE SUR START', c.mot(2, 12, 16) === 'APPUIE SUR START'],
        ['en orange : 31, 16, 0', coul(0, 3) === '31,16,0', ` (${coul(0, 3)})`],
      ]
    },
  },

  {
    titre: 'L’écran titre — START, un autre écran',
    difficulte: 0,
    suite: true,
    idee: 'Le titre du 0.90, et START qui le fait disparaître : l’écran se vide, un autre apparaît. Une variable retient sur quel écran on est.',
    texte: [
      '**C’est le 0.90, avec une seule chose en plus :** quand on appuie sur **START**, le titre s’en va et un **autre écran** apparaît (ici, « C EST PARTI »).',
      '**`bouton(START)`** rend 1 tant que START est enfoncé. On le regarde **à chaque image**, dans la boucle.',
      '**Ce qui est nouveau ici : une variable qui dit sur quel écran on est.** `ecranTitre` vaut **1** tant qu’on est sur le titre, **0** ensuite. Pourquoi ? Un appui sur START dure plusieurs images. Sans cette variable, l’écran serait vidé et réécrit **à chaque image** où le doigt reste sur le bouton. Avec elle, le changement se fait **une seule fois** : dès la première image, `ecranTitre` passe à 0, et la condition `ecranTitre == 1 && bouton(START)` n’est plus jamais vraie.',
      '**`&&` veut dire « et » :** il faut les deux à la fois, être sur le titre **et** appuyer sur START.',
      '**Vider l’écran :** il n’y a pas de fonction qui efface tout d’un coup. On le fait ligne par ligne : une boucle `for` sur les **18 lignes** (0 à 17), et sur chacune `effacer(0, y, 20)` efface **20 cases** à partir de la colonne 0, toute la largeur.',
      '**La couleur reste :** `couleurTexte` a réglé l’encre de toutes les lettres ; le nouvel écran est orange aussi.',
    ],
    code: `uint8_t ecranTitre = 1;   // sur quel écran on est : 1 = le titre, 0 = l'écran d'après

int main() {
  // Le titre du 0.90 :
  couleurTexte(31, 16, 0);          // de l'orange
  texteGrand(4, 5, "JEU", 4);       // le grand titre
  texte(2, 12, "APPUIE SUR START"); // la consigne

  while (true) {
    image();

    // On change d'écran si on est SUR LE TITRE  ET  que START est appuyé.
    //
    //   ecranTitre == 1    &&    bouton(START)
    //   |                  |     |
    //   |                  |     +-- START est enfoncé (1), ou pas (0)
    //   |                  +-------- « et » : il faut les deux à la fois
    //   +--------------------------- on est encore sur le titre
    if (ecranTitre == 1 && bouton(START)) {
      ecranTitre = 0;               // tout de suite : ce bloc ne se refera plus jamais,
                                    // même si le doigt reste sur START

      // Vider l'écran : 18 lignes (0 à 17), 20 cases chacune.
      //   y = 0 : effacer(0, 0, 20)   la ligne du haut
      //   y = 1 : effacer(0, 1, 20)   celle d'en dessous
      //   …
      //   y = 17 : effacer(0, 17, 20) la ligne du bas
      for (uint8_t y = 0; y < 18; y++) {
        effacer(0, y, 20);
      }

      texte(5, 8, "C EST PARTI");   // le nouvel écran
    }
  }
}
`,
    aVoir: 'Le grand JEU orange et APPUIE SUR START ; appuie sur START (touche Entrée) : l’écran se vide et C EST PARTI apparaît.',
    controle: (c) => {
      c.avancer(10)
      const avant = c.mot(2, 12, 16) === 'APPUIE SUR START'
      const titre = c.variable('ecranTitre') === 1
      c.presser('start', 6)
      c.avancer(5)
      let pleines = 0
      for (let j = 5; j < 8; j++) for (let i = 4; i < 16; i++) if (c.lire(i, j) !== 0) pleines++   // lignes 5 à 7 : la ligne 8 porte le nouveau texte
      return [
        ['avant START : le titre et sa consigne', avant && titre],
        ['après START : la consigne et le grand JEU ont disparu', c.mot(2, 12, 16).trim() === '' && pleines === 0, ` (${pleines} cases du titre restent)`],
        ['le nouvel écran : C EST PARTI', c.mot(5, 8, 11) === 'C EST PARTI'],
        ['ecranTitre est passé à 0', c.variable('ecranTitre') === 0],
      ]
    },
  },

  {
    titre: 'L’écran titre — une lettre qui file',
    difficulte: 0,
    suite: true,
    idee: 'Sur l’écran d’après START, un B qui file de gauche à droite, sans fin : defile(0, 0, 12, ALPHABET[1], 1, 150).',
    texte: [
      '**C’est le 0.90.1, avec une chose en plus :** sur l’écran d’après START, un **B** traverse l’écran **de gauche à droite**, et recommence.',
      '**`defile` (le 0.65.3)** fait filer une lettre sur sa ligne : un pas toutes les « vitesse » millisecondes ; arrivée au bord droit, elle repart du bord gauche. Elle **ne bloque rien** : le reste de la boucle continue.',
      '**Il faut l’appeler à chaque image**, dans la boucle : chaque appel regarde si c’est le moment de faire un pas.',
      '**Seulement après START :** `if (ecranTitre == 0)`. Sur le titre, `ecranTitre` vaut 1 : le B ne vient pas encore.',
      '**Le B, pas un A :** « C EST PARTI » contient déjà un A ; un B se distingue mieux.',
    ],
    code: `uint8_t ecranTitre = 1;   // 1 = le titre, 0 = l'écran d'après

int main() {
  couleurTexte(31, 16, 0);          // le titre du 0.90, en orange
  texteGrand(4, 5, "JEU", 4);
  texte(2, 12, "APPUIE SUR START");

  while (true) {
    image();

    // Le changement d'écran du 0.90.1 : une seule fois, au premier appui sur START.
    if (ecranTitre == 1 && bouton(START)) {
      ecranTitre = 0;
      for (uint8_t y = 0; y < 18; y++) {
        effacer(0, y, 20);          // on vide les 18 lignes
      }
      texte(5, 8, "C EST PARTI");
    }

    // ---- NOUVEAU : une lettre qui file, seulement sur l'écran d'après
    //
    //   defile(0, 0, 12, ALPHABET[1], 1, 150);
    //          |  |  |   |           |  |
    //          |  |  |   |           |  +-- la VITESSE : un pas toutes les 150 ms
    //          |  |  |   |           +----- le SENS : 1 = vers la droite (-1 = vers la gauche)
    //          |  |  |   +----------------- la lettre : ALPHABET[1], le B
    //          |  +--+--------------------- le départ : colonne 0, ligne 12
    //          +--------------------------- son numéro (0 à 3) : jusqu'à 4 lettres qui filent
    if (ecranTitre == 0) {
      defile(0, 0, 12, ALPHABET[1], 1, 150);
    }
  }
}
`,
    aVoir: 'Après START : C EST PARTI, et un B qui file de gauche à droite sur la ligne 12, sans fin.',
    controle: (c) => {
      c.avancer(10)
      const avant = c.mot(0, 12, 20).includes('B')
      c.presser('start', 6)
      const { B } = suivre(c, 'B', 200)
      const xs = B.map((p) => Number(p.split(',')[0]))
      return [
        ['pas de B sur le titre', !avant],
        ['après START, le B avance vers la droite', xs.length > 5 && xs[1] > xs[0], ` (${xs.slice(0, 8).join(' → ')})`],
        ['toujours sur la ligne 12', B.every((p) => p.endsWith(',12'))],
      ]
    },
  },

  {
    titre: 'L’écran titre — tout l’écran glisse',
    difficulte: 0,
    suite: true,
    idee: 'On repart du 0.90.1 : cette fois, c’est TOUT l’écran qui glisse vers la droite. defiler(d, 0), et d qui diminue à chaque image.',
    texte: [
      '**On repart du 0.90.1** (sans le B du 0.90.2), avec une seule chose en plus : **tout l’écran** glisse de gauche à droite, « C EST PARTI » compris.',
      '**Ce qui est nouveau ici : `defiler(x, y)`.** Il ne bouge pas une lettre : il déplace **la caméra** qui regarde le décor. `x` dit de combien de **pixels** la caméra est poussée vers la droite.',
      '**Pour que le décor aille à DROITE, la caméra va à GAUCHE :** comme dans un train, quand tu avances, le paysage recule. Alors `d` **diminue** : `d--`, un pixel à chaque image.',
      '**`d` passe sous 0 ?** C’est un `uint8_t` : après 0 vient **255**, puis 254… (l’octet qui boucle, la leçon 35). Et le décor fait justement **256 pixels** de large : il revient tout seul, sans fin. Ce qui sort par la droite réapparaît à gauche.',
      '**60 images par seconde, un pixel chaque fois :** le texte traverse l’écran (160 pixels) en moins de 3 secondes, tout en douceur.',
    ],
    code: `uint8_t ecranTitre = 1;   // 1 = le titre, 0 = l'écran d'après
uint8_t d = 0;            // la caméra : 0 = elle regarde le début du décor

int main() {
  couleurTexte(31, 16, 0);          // le titre du 0.90, en orange
  texteGrand(4, 5, "JEU", 4);
  texte(2, 12, "APPUIE SUR START");

  while (true) {
    image();

    // Le changement d'écran du 0.90.1 : une seule fois, au premier appui sur START.
    if (ecranTitre == 1 && bouton(START)) {
      ecranTitre = 0;
      for (uint8_t y = 0; y < 18; y++) {
        effacer(0, y, 20);          // on vide les 18 lignes
      }
      texte(5, 8, "C EST PARTI");
    }

    // ---- NOUVEAU : tout l'écran glisse, seulement sur l'écran d'après
    //
    //   d--          la caméra recule d'un pixel : 0, 255, 254, 253…
    //   defiler(d, 0);
    //           |  |
    //           |  +-- vers le bas : 0, on ne bouge pas en hauteur
    //           +----- vers la droite : d pixels
    //
    //   la caméra recule → le décor semble avancer vers la DROITE
    if (ecranTitre == 0) {
      d--;
      defiler(d, 0);
    }
  }
}
`,
    aVoir: 'Après START : C EST PARTI glisse vers la droite, sort de l’écran et revient par la gauche, sans fin.',
    controle: (c) => {
      c.avancer(10)
      const avant = c.defilement()
      c.avancer(30)
      const toujours = c.defilement()
      c.presser('start', 6)
      c.avancer(20)
      const d = c.variable('d')
      return [
        ['sur le titre, rien ne glisse', avant === toujours],
        ['après START, la caméra recule : d est passé sous 0 (255, 254…)', d > 200, ` (d = ${d})`],
        ['et l’écran glisse vraiment', c.defilement() !== avant, ` (${avant} vers ${c.defilement()})`],
      ]
    },
  },

  {
    titre: 'L’écran titre — un bandeau qui passe',
    difficulte: 0,
    suite: true,
    idee: 'On repart du 0.90.1 : une seule ligne bouge, les autres restent en place. BONJOUR passe en bas, de gauche à droite : effacer, avancer, réécrire.',
    texte: [
      '**`defiler` bouge TOUT l’écran** (le 0.90.3). Pour un **bandeau**, comme les informations qui passent en bas d’une télé, il faut qu’**une seule ligne** bouge et que « C EST PARTI » reste en place.',
      '**Ce qui est nouveau ici : déplacer un mot soi-même,** en trois gestes, toutes les 150 ms (`chaque(150)`, le 0.77) : **effacer** le mot là où il est, **avancer** sa position d’une case, le **réécrire** à la nouvelle place.',
      '**`effacer(p, 16, "BONJOUR")`** : quand on lui donne le texte lui-même, `effacer` efface exactement autant de cases que le texte a de lettres (7).',
      '**`p = (p + 1) % 20`** : p va de 0 à 19, puis revient à 0 (le `%` du 0.9). À droite, les dernières lettres passent **hors de l’écran** : la carte du décor fait 32 cases de large, l’écran n’en montre que 20. Elles existent, mais on ne les voit pas.',
      '**Le mot n’est écrit qu’après START :** p commence à 0 ; au premier coup après START, on efface en 0 (rien à effacer), p passe à 1, et BONJOUR s’écrit en (1, 16).',
    ],
    code: `uint8_t ecranTitre = 1;   // 1 = le titre, 0 = l'écran d'après
uint8_t p = 0;            // la colonne du bandeau

int main() {
  couleurTexte(31, 16, 0);          // le titre du 0.90, en orange
  texteGrand(4, 5, "JEU", 4);
  texte(2, 12, "APPUIE SUR START");

  while (true) {
    image();

    // Le changement d'écran du 0.90.1 : une seule fois, au premier appui sur START.
    if (ecranTitre == 1 && bouton(START)) {
      ecranTitre = 0;
      for (uint8_t y = 0; y < 18; y++) {
        effacer(0, y, 20);          // on vide les 18 lignes
      }
      texte(5, 8, "C EST PARTI");
    }

    // ---- NOUVEAU : un bandeau qui passe, seulement sur l'écran d'après
    //   toutes les 150 ms, trois gestes :
    //     1. effacer le mot à sa place       effacer(p, 16, "BONJOUR");
    //     2. avancer d'une case              p = (p + 1) % 20;   0, 1, … 19, puis 0
    //     3. l'écrire à la nouvelle place    texte(p, 16, "BONJOUR");
    //
    //   p = 0 :  BONJOUR.............
    //   p = 1 :  .BONJOUR............
    //   p = 15 : ...............BONJO   (UR : hors de l'écran, à droite)
    if (ecranTitre == 0 && chaque(150)) {
      effacer(p, 16, "BONJOUR");
      p = (p + 1) % 20;
      texte(p, 16, "BONJOUR");
    }
  }
}
`,
    aVoir: 'Après START : C EST PARTI reste au milieu ; en bas, BONJOUR passe de gauche à droite, et recommence.',
    controle: (c) => {
      c.avancer(10)
      c.presser('start', 6)
      c.avancer(5)
      const p1 = c.variable('p')
      c.avancer(40)
      const p2 = c.variable('p')
      return [
        ['le bandeau avance', p2 > p1, ` (p : ${p1} → ${p2})`],
        ['BONJOUR est à sa place, sur la ligne 16', c.mot(p2, 16, 7).startsWith('BONJOUR'.slice(0, 20 - p2))],
        ['une seule case derrière lui est vide : pas de traînée', p2 === 0 || c.mot(p2 - 1, 16, 1).trim() === ''],
        ['C EST PARTI ne bouge pas', c.mot(5, 8, 11) === 'C EST PARTI' && c.defilement() === 0],
      ]
    },
  },

  {
    titre: 'L’écran titre — la consigne qui clignote',
    difficulte: 0,
    suite: true,
    idee: 'On repart du 0.90.1 : APPUIE SUR START clignote, comme dans les vrais jeux. Toutes les demi-secondes, on l’écrit ou on l’efface.',
    texte: [
      '**On repart du 0.90.1** (le titre, START, l’écran d’après), avec une chose en plus : sur le titre, « APPUIE SUR START » **clignote**.',
      '**Ce qui est nouveau ici : une variable qui retient si le texte est affiché.** `visible` vaut **1** quand la consigne est à l’écran, **0** quand elle est effacée. Toutes les demi-secondes (`chaque(500)`, le 0.77), on regarde : visible ? on l’**efface** ; effacée ? on l’**écrit**. Et `visible` change de valeur.',
      '**`visible = 1 - visible`** : une astuce pour basculer. 1 - 1 = **0**, et 1 - 0 = **1**. À chaque fois, la valeur passe de l’une à l’autre.',
      '**Seulement sur le titre :** `ecranTitre == 1 && chaque(500)`. Après START, la consigne ne revient plus.',
    ],
    code: `uint8_t ecranTitre = 1;   // 1 = le titre, 0 = l'écran d'après
uint8_t visible = 1;      // 1 = la consigne est à l'écran, 0 = elle est effacée

int main() {
  couleurTexte(31, 16, 0);
  texteGrand(4, 5, "JEU", 4);
  texte(2, 12, "APPUIE SUR START");   // au départ, elle est là : visible = 1

  while (true) {
    image();

    // ---- NOUVEAU : sur le titre, toutes les demi-secondes, la consigne bascule.
    //
    //   visible = 1 → on l'efface, visible devient 0
    //   visible = 0 → on l'écrit,  visible devient 1
    //   …et ainsi de suite : écrite, effacée, écrite, effacée…
    if (ecranTitre == 1 && chaque(500)) {
      if (visible == 1) {
        effacer(2, 12, "APPUIE SUR START");   // efface autant de cases que le texte
      } else {
        texte(2, 12, "APPUIE SUR START");
      }
      visible = 1 - visible;                  // 1 - 1 = 0 ;  1 - 0 = 1 : ça bascule
    }

    // Le changement d'écran du 0.90.1.
    if (ecranTitre == 1 && bouton(START)) {
      ecranTitre = 0;
      for (uint8_t y = 0; y < 18; y++) {
        effacer(0, y, 20);
      }
      texte(5, 8, "C EST PARTI");
    }
  }
}
`,
    aVoir: 'Le grand JEU orange, et APPUIE SUR START qui clignote. START : C EST PARTI, et plus rien ne clignote.',
    controle: (c) => {
      c.avancer(5)
      const vus = new Set()
      for (let k = 0; k < 90; k++) { c.avancer(1); vus.add(c.mot(2, 12, 16).trim()) }
      c.presser('start', 6)
      let revient = false
      for (let k = 0; k < 90; k++) { c.avancer(1); if (c.mot(2, 12, 16).trim() !== '') revient = true }
      return [
        ['la consigne clignote : tantôt là, tantôt effacée', vus.has('APPUIE SUR START') && vus.has('')],
        ['après START, elle ne revient plus', !revient && c.mot(5, 8, 11) === 'C EST PARTI'],
      ]
    },
  },

  {
    titre: 'L’écran titre — SELECT, retour au titre',
    difficulte: 0,
    suite: true,
    idee: 'Le 0.90.5, et SELECT qui ramène au titre. Le titre se dessine alors deux fois : on le range dans une fonction, dessinerTitre().',
    texte: [
      '**C’est le 0.90.5, avec une chose en plus :** sur l’écran d’après, **SELECT** ramène au titre. `ecranTitre` repasse à **1**, et le titre se redessine.',
      '**Ce qui est nouveau ici : ranger des lignes dans une fonction** (comme `tour_de_jeu` au 0.80.2). Le titre doit être dessiné **au départ**, et **à chaque retour**. Plutôt que d’écrire les mêmes lignes deux fois, on les met dans `void dessinerTitre() { … }`, et on écrit juste `dessinerTitre();` là où il faut.',
      '**Même chose pour vider l’écran :** `viderEcran()` range la boucle des 18 lignes. Elle sert pour aller sur l’écran d’après, et pour en revenir.',
      '**`void`** veut dire que la fonction ne rend rien : elle **fait** quelque chose (elle dessine, elle efface), c’est tout.',
      '**Au retour, `visible` repasse à 1 :** dessinerTitre() vient d’écrire la consigne, elle est donc à l’écran.',
    ],
    code: `uint8_t ecranTitre = 1;   // 1 = le titre, 0 = l'écran d'après
uint8_t visible = 1;      // la consigne : 1 = à l'écran, 0 = effacée

// ---- NOUVEAU : des lignes rangées sous un nom, pour s'en servir plusieurs fois ----

// Dessiner le titre : au départ, ET à chaque retour avec SELECT.
void dessinerTitre() {
  texteGrand(4, 5, "JEU", 4);
  texte(2, 12, "APPUIE SUR START");
}

// On vide l'écran : 18 lignes (0 à 17), 20 cases chacune.
void viderEcran() {
  for (uint8_t y = 0; y < 18; y++) {
    effacer(0, y, 20);
  }
}

int main() {
  couleurTexte(31, 16, 0);
  dessinerTitre();                  // la première fois : toutes les lignes de la fonction

  while (true) {
    image();

    // La consigne qui clignote (le 0.90.5).
    if (ecranTitre == 1 && chaque(500)) {
      if (visible == 1) {
        effacer(2, 12, "APPUIE SUR START");
      } else {
        texte(2, 12, "APPUIE SUR START");
      }
      visible = 1 - visible;
    }

    // Titre → écran d'après, avec START.
    if (ecranTitre == 1 && bouton(START)) {
      ecranTitre = 0;
      viderEcran();                 // la boucle des 18 lignes, rangée dans sa fonction
      texte(5, 8, "C EST PARTI");
      texte(1, 16, "SELECT : LE TITRE");
    }

    // ---- NOUVEAU : écran d'après → titre, avec SELECT.
    if (ecranTitre == 0 && bouton(SELECT)) {
      ecranTitre = 1;               // on est de nouveau sur le titre
      viderEcran();
      dessinerTitre();              // la deuxième fois : les mêmes lignes, sans les réécrire
      visible = 1;                  // la consigne vient d'être écrite : elle est là
    }
  }
}
`,
    aVoir: 'Le titre ; START : C EST PARTI ; SELECT : le titre revient, et la consigne clignote de nouveau.',
    controle: (c) => {
      c.avancer(10)
      c.presser('start', 6)
      c.avancer(5)
      const apres = c.mot(5, 8, 11) === 'C EST PARTI' && c.variable('ecranTitre') === 0
      c.presser('select', 6)
      c.avancer(5)
      let pleines = 0
      for (let j = 5; j < 9; j++) for (let i = 4; i < 16; i++) if (c.lire(i, j) !== 0) pleines++
      return [
        ['START : l’écran d’après', apres],
        ['SELECT : retour au titre (ecranTitre = 1)', c.variable('ecranTitre') === 1],
        ['le grand JEU est redessiné, C EST PARTI a disparu', pleines > 15 && !c.mot(0, 16, 20).includes('SELECT')],
      ]
    },
  },

  {
    titre: 'L’écran titre — trois écrans',
    difficulte: 0,
    suite: true,
    idee: 'Le 0.90.6 avec un troisième écran : ecranTitre devient ecran, qui vaut 0 (le titre), 1 (le jeu) ou 2 (la fin). B mène à la fin, START fait rejouer.',
    texte: [
      '**Un jeu a presque toujours trois écrans :** le **titre**, le **jeu**, la **fin**. Deux valeurs (1 ou 0) ne suffisent plus.',
      '**Ce qui est nouveau ici : une variable qui compte les écrans.** `ecranTitre` devient `ecran`, et vaut **0** (le titre), **1** (le jeu) ou **2** (la fin). Chaque `if` commence par regarder sur quel écran on est : `ecran == 0 && …`, `ecran == 1 && …`, `ecran == 2 && …`.',
      '**Les chemins :** titre → **START** → jeu ; jeu → **B** → fin (plus tard, ce sera « perdu » ou « le temps est fini ») ; fin → **START** → le jeu, de nouveau ; jeu → **SELECT** → le titre.',
      '**Pourquoi la fin ramène au JEU, et pas au titre ?** Un appui sur START dure plusieurs images. Si la fin menait au titre, l’image suivante, START encore enfoncé, ferait aussitôt passer du titre au jeu : on ne verrait pas le titre. Aller droit au jeu, c’est « rejouer ».',
      '**Les numéros sont une convention :** 0, 1, 2, c’est nous qui décidons ce qu’ils veulent dire. Les commentaires le rappellent.',
    ],
    code: `// ---- NOUVEAU : une variable pour TROIS écrans ----
//   ecran = 0 : le TITRE    ecran = 1 : le JEU    ecran = 2 : la FIN
uint8_t ecran = 0;
uint8_t visible = 1;      // la consigne du titre : 1 = à l'écran, 0 = effacée

void dessinerTitre() {
  texteGrand(4, 5, "JEU", 4);
  texte(2, 12, "APPUIE SUR START");
}

// L'écran du jeu (pour l'instant, deux mots) : depuis le titre, ET depuis la fin.
void dessinerJeu() {
  texte(5, 8, "C EST PARTI");
  texte(3, 14, "B : LA FIN");
  texte(1, 16, "SELECT : LE TITRE");
}

// On vide l'écran : 18 lignes (0 à 17), 20 cases chacune.
void viderEcran() {
  for (uint8_t y = 0; y < 18; y++) {
    effacer(0, y, 20);
  }
}

int main() {
  couleurTexte(31, 16, 0);
  dessinerTitre();

  while (true) {
    image();

    // ---- ÉCRAN 0 : LE TITRE ----
    if (ecran == 0 && chaque(500)) {          // la consigne qui clignote
      if (visible == 1) {
        effacer(2, 12, "APPUIE SUR START");
      } else {
        texte(2, 12, "APPUIE SUR START");
      }
      visible = 1 - visible;
    }
    if (ecran == 0 && bouton(START)) {        // titre → jeu
      ecran = 1;
      viderEcran();
      dessinerJeu();
    }

    // ---- ÉCRAN 1 : LE JEU ----
    if (ecran == 1 && bouton(B)) {            // jeu → fin
      ecran = 2;
      viderEcran();
      texte(8, 8, "FIN");
      texte(2, 12, "START : REJOUER");
    }
    if (ecran == 1 && bouton(SELECT)) {       // jeu → titre
      ecran = 0;
      viderEcran();
      dessinerTitre();
      visible = 1;
    }

    // ---- ÉCRAN 2 : LA FIN ----
    if (ecran == 2 && bouton(START)) {        // fin → jeu : on rejoue
      ecran = 1;
      viderEcran();
      dessinerJeu();
    }
  }
}
`,
    aVoir: 'Le titre ; START : le jeu ; B : FIN ; START : le jeu de nouveau ; SELECT : le titre.',
    controle: (c) => {
      c.avancer(10)
      const e = []
      e.push(c.variable('ecran'))
      c.presser('start', 6); c.avancer(5); e.push(c.variable('ecran'))
      c.presser('b', 6); c.avancer(5); e.push(c.variable('ecran'))
      const fin = c.mot(8, 8, 3) === 'FIN'
      c.presser('start', 6); c.avancer(5); e.push(c.variable('ecran'))
      const rejoue = c.mot(5, 8, 11) === 'C EST PARTI'
      c.presser('select', 6); c.avancer(5); e.push(c.variable('ecran'))
      return [
        ['le chemin : titre 0 → jeu 1 → fin 2 → jeu 1 → titre 0', e.join(' ') === '0 1 2 1 0', ` (${e.join(' → ')})`],
        ['la fin affiche FIN', fin],
        ['START sur la fin : on rejoue', rejoue],
      ]
    },
  },

  {
    titre: 'Le titre, puis le jeu',
    difficulte: 0,
    partie: 'Du titre au snake',
    idee: 'On réunit l’écran titre (le 0.90) et le jeu du 0.81 : START fait disparaître le titre, pose le P, et la partie commence.',
    texte: [
      '**Deux programmes qu’on connaît, réunis en un :** l’**écran titre** (le 0.90.1) et le **jeu de la pièce** (le 0.81 : le A suit la croix et ramasse le P).',
      '**Ce qui est nouveau ici : le jeu n’existe qu’après START.** Tout ce que faisait la boucle du 0.81 est rangé dans `if (ecran == 1) { … }`. Sur le titre (`ecran == 0`), le A n’est pas là, la croix ne fait rien.',
      '**Ce que le 0.81 faisait avant la boucle** (poser le P, écrire SCORE) se fait maintenant **au moment de START** : c’est là que l’écran du jeu commence.',
      '**Deux fois `if`, pas `if … else`,** pour rester comme au 0.90.1 : le premier regarde START sur le titre, le second fait tourner le jeu.',
    ],
    code: `uint8_t ecran = 0;        // 0 = le TITRE, 1 = le JEU

// Les variables du jeu du 0.81 :
uint8_t x = 5;            // le A : sa colonne…
uint8_t y = 8;            // …et sa ligne (le 0.81)
uint8_t px = 15;          // la pièce, le P : sa colonne…
uint8_t py = 8;           // …et sa ligne
uint8_t score = 0;        // les pièces ramassées

void viderEcran() {
  for (uint8_t l = 0; l < 18; l++) {
    effacer(0, l, 20);
  }
}

int main() {
  couleurTexte(31, 16, 0);            // le titre du 0.90
  texteGrand(4, 5, "JEU", 4);
  texte(2, 12, "APPUIE SUR START");

  while (true) {
    image();

    // ---- ÉCRAN 0 : LE TITRE. START : on prépare le jeu, une seule fois.
    if (ecran == 0 && bouton(START)) {
      ecran = 1;
      viderEcran();
      poser(px, py, ALPHABET[15]);    // le P (ce que le 0.81 faisait AVANT la boucle)
      texte(0, 17, "SCORE");
    }

    // ---- ÉCRAN 1 : LE JEU. La boucle du 0.81, seulement sur cet écran.
    if (ecran == 1) {
      deplace_croix(x, y, ALPHABET[0], 250);   // le A suit la croix
      if (x == px && y == py) {                // le A sur le P : ramassée (le 0.81)
        score = score + 1;
        px = 20;                               // la pièce part hors de l'écran
      }
      nombre(6, 17, score);
    }
  }
}
`,
    aVoir: 'Le titre ; START : le titre disparaît, le A et le P apparaissent, et on ramasse le P avec la croix.',
    controle: (c) => {
      c.avancer(10)
      const pasDeP = c.mot(15, 8, 1) !== 'P'
      c.presser('start', 6)
      c.avancer(5)
      const piece = c.mot(15, 8, 1) === 'P'
      for (let k = 0; k < 200; k++) { c.gb.setButton('right', true); c.avancer(1) } c.gb.setButton('right', false); c.avancer(3)
      return [
        ['sur le titre, pas de pièce', pasDeP],
        ['après START, le P est posé', piece],
        ['on le ramasse : le score vaut 1', c.variable('score') === 1 && c.mot(6, 17, 3) === '001'],
      ]
    },
  },

  {
    titre: 'Le titre, puis le jeu — trente secondes',
    difficulte: 0,
    suite: true,
    idee: 'Le 0.91 avec un chronomètre : 30 secondes, une de moins chaque seconde (chaque(1000)). À 0 : l’écran FIN.',
    texte: [
      '**C’est le 0.91, avec une chose en plus : le temps.** La partie dure **30 secondes**. Le reste s’affiche en bas à droite, après TEMPS.',
      '**Ce qui est nouveau ici : un compte à rebours.** `temps` part de **30**. Toutes les secondes (`chaque(1000)`), il perd 1 : 30, 29, 28… À **0**, la partie s’arrête : on passe à un troisième écran, `ecran = 2`, la **fin** (le 0.90.7).',
      '**Seulement pendant le jeu :** `ecran == 1 && chaque(1000)`. Sur le titre, le temps ne bouge pas.',
      '**Sur l’écran de fin, plus rien ne bouge :** la boucle du jeu est dans `if (ecran == 1)`. Avec `ecran == 2`, le A ne suit plus la croix.',
    ],
    code: `uint8_t ecran = 0;        // 0 = le TITRE, 1 = le JEU, 2 = la FIN

uint8_t x = 5;            // le A : sa colonne…
uint8_t y = 8;            // …et sa ligne (le 0.81)
uint8_t px = 15;          // la pièce, le P : sa colonne…
uint8_t py = 8;           // …et sa ligne
uint8_t score = 0;        // les pièces ramassées
uint8_t temps = 30;       // NOUVEAU : les secondes qui restent

void viderEcran() {
  for (uint8_t l = 0; l < 18; l++) {
    effacer(0, l, 20);
  }
}

int main() {
  couleurTexte(31, 16, 0);
  texteGrand(4, 5, "JEU", 4);
  texte(2, 12, "APPUIE SUR START");

  while (true) {
    image();

    if (ecran == 0 && bouton(START)) {
      ecran = 1;
      viderEcran();
      poser(px, py, ALPHABET[15]);
      texte(0, 17, "SCORE");
      texte(11, 17, "TEMPS");         // NOUVEAU : le mot TEMPS, en bas à droite
    }

    if (ecran == 1) {
      deplace_croix(x, y, ALPHABET[0], 250);   // le A suit la croix
      if (x == px && y == py) {                // le A sur le P : ramassée (le 0.81)
        score = score + 1;
        px = 20;                               // la pièce part hors de l'écran
      }
      nombre(6, 17, score);
      nombre(17, 17, temps);          // NOUVEAU : les secondes, après TEMPS
    }

    // ---- NOUVEAU : le compte à rebours, une seconde de moins toutes les 1000 ms.
    //   30 → 29 → … → 1 → 0 : c'est fini, écran 2.
    if (ecran == 1 && chaque(1000)) {
      temps = temps - 1;
      if (temps == 0) {
        ecran = 2;                    // la FIN
        viderEcran();
        texte(8, 8, "FIN");
      }
    }
  }
}
`,
    aVoir: 'START : le jeu, et TEMPS qui descend de 030 à 000. À 0, l’écran se vide et FIN s’affiche.',
    controle: (c) => {
      c.avancer(10)
      c.presser('start', 6)
      c.avancer(300)
      const t = c.variable('temps')
      c.avancer(1600)
      return [
        ['le temps descend, une seconde à la fois', t >= 23 && t <= 26, ` (après 5 secondes : ${t})`],
        ['au bout de 30 secondes : FIN', c.variable('ecran') === 2 && c.variable('temps') === 0 && c.mot(8, 8, 3) === 'FIN'],
      ]
    },
  },

  {
    titre: 'Le titre, puis le jeu — le score et rejouer',
    difficulte: 0,
    suite: true,
    idee: 'Le 0.91.1, et sur l’écran FIN : le score de la partie, et START pour rejouer. Tout se remet au départ : une fonction nouvellePartie().',
    texte: [
      '**C’est le 0.91.1, avec une chose en plus :** l’écran de fin montre le **score**, et **START** relance une partie.',
      '**Ce qui est nouveau ici : tout remettre au départ.** Une nouvelle partie, c’est le A en (5, 8), le P en (15, 8), le score à 0, le temps à 30, et l’écran du jeu redessiné. Ces lignes servent **deux fois** : depuis le titre, et depuis la fin. On les range dans **`nouvellePartie()`** (le 0.90.6).',
      '**Remettre les variables, c’est indispensable :** sans `score = 0`, la deuxième partie commencerait avec le score de la première ; sans `px = 15`, le P resterait hors de l’écran (en 20), et on ne pourrait plus le ramasser.',
      '**La fin mène au jeu, pas au titre** (le 0.90.7) : START encore enfoncé ferait sauter le titre aussitôt.',
      '**La première seconde de la nouvelle partie est un peu courte :** le chronomètre de `chaque(1000)` a continué de tourner pendant l’écran de fin. Au retour dans le jeu, il est déjà « à l’heure » : 30 devient 29 tout de suite.',
    ],
    code: `uint8_t ecran = 0;        // 0 = le TITRE, 1 = le JEU, 2 = la FIN

uint8_t x = 5;            // le A : sa colonne…
uint8_t y = 8;            // …et sa ligne (le 0.81)
uint8_t px = 15;          // la pièce, le P : sa colonne…
uint8_t py = 8;           // …et sa ligne
uint8_t score = 0;        // les pièces ramassées
uint8_t temps = 30;       // les secondes qui restent

void viderEcran() {
  for (uint8_t l = 0; l < 18; l++) {
    effacer(0, l, 20);
  }
}

// ---- NOUVEAU : une partie qui commence, TOUT au départ ----
// Depuis le titre, ET depuis la fin (START : rejouer).
void nouvellePartie() {
  x = 5;                          // le A revient à sa place
  y = 8;
  px = 15;                        // le P aussi (il était peut-être en 20, ramassé)
  py = 8;
  score = 0;                      // pas encore de pièce
  temps = 30;                     // 30 secondes de nouveau
  ecran = 1;                      // on est sur le JEU
  viderEcran();
  poser(px, py, ALPHABET[15]);
  texte(0, 17, "SCORE");
  texte(11, 17, "TEMPS");
}

int main() {
  couleurTexte(31, 16, 0);
  texteGrand(4, 5, "JEU", 4);
  texte(2, 12, "APPUIE SUR START");

  while (true) {
    image();

    if (ecran == 0 && bouton(START)) {
      nouvellePartie();               // la première partie
    }

    if (ecran == 1) {
      deplace_croix(x, y, ALPHABET[0], 250);   // le A suit la croix
      if (x == px && y == py) {                // le A sur le P : ramassée (le 0.81)
        score = score + 1;
        px = 20;                               // la pièce part hors de l'écran
      }
      nombre(6, 17, score);
      nombre(17, 17, temps);
    }

    if (ecran == 1 && chaque(1000)) {
      temps = temps - 1;
      if (temps == 0) {
        ecran = 2;
        viderEcran();
        texte(8, 6, "FIN");
        texte(5, 9, "SCORE");         // NOUVEAU : le score de la partie
        nombre(11, 9, score);
        texte(2, 13, "START : REJOUER");
      }
    }

    // ---- NOUVEAU : sur la fin, START relance une partie.
    if (ecran == 2 && bouton(START)) {
      nouvellePartie();               // la même fonction : tout au départ
    }
  }
}
`,
    aVoir: 'Une partie de 30 secondes ; à la fin : FIN, le score, START : REJOUER. START : une nouvelle partie, score 0, temps 30.',
    controle: (c) => {
      c.avancer(10)
      c.presser('start', 6)
      for (let k = 0; k < 200; k++) { c.gb.setButton('right', true); c.avancer(1) } c.gb.setButton('right', false)
      c.avancer(1700)
      const fin = c.variable('ecran') === 2 && c.mot(8, 6, 3) === 'FIN' && c.mot(11, 9, 3) === '001'
      c.presser('start', 6)
      c.avancer(10)
      return [
        ['la fin montre le score : 001', fin],
        ['START : une nouvelle partie (écran 1, score 0, temps 30 ou 29)', c.variable('ecran') === 1 && c.variable('score') === 0 && c.variable('temps') >= 29, ` (temps = ${c.variable('temps')})`],
        ['le P est revenu en (15, 8), et le A en (5, 8)', c.mot(15, 8, 1) === 'P' && c.mot(5, 8, 1) === 'A'],
      ]
    },
  },

  {
    titre: 'Le titre, puis le jeu — un cadre de murs X',
    difficulte: 0,
    suite: true,
    idee: 'Le 0.91.2, et des murs tout autour du terrain : un cadre de X. Le A qui y entre revient aussitôt à sa place d’avant.',
    texte: [
      '**C’est le 0.91.2, avec une chose en plus : un cadre de murs.** Les murs sont des **lettres**, comme le M du 0.82 ; ici, le **X**. Il fait le tour du terrain : le haut (ligne 0), le bas (ligne 16), la gauche (colonne 0), la droite (colonne 19).',
      '**Le dessiner : deux boucles.** La première pose les X du haut et du bas, colonne par colonne (0 à 19). La seconde, ceux des côtés, ligne par ligne (1 à 15 : les coins sont déjà posés).',
      '**La ligne 17 reste aux nombres :** le cadre s’arrête à la ligne 16, SCORE et TEMPS restent en dessous.',
      '**Ce qui est nouveau ici : revenir en arrière.** `deplace_croix` ne connaît pas les murs : elle fait le pas. Alors on retient la place du A **avant** (`ax`, `ay`), et **après** le pas on regarde : sur le cadre ? On remet le X (le A l’avait recouvert) et le A revient à sa place d’avant. Tout se passe dans la même image : on ne voit pas le A entrer dans le mur.',
      '**`||` veut dire « ou » :** `x == 0 || x == 19 || y == 0 || y >= 16` est vrai dès qu’**une** des quatre l’est. `y >= 16` (plus grand ou égal) compte aussi la ligne 17 : le A ne descend jamais sur les nombres.',
      '**Le cadre est redessiné à chaque partie,** dans `nouvellePartie()` : après le titre et après la fin, l’écran a été vidé.',
    ],
    code: `uint8_t ecran = 0;        // 0 = le TITRE, 1 = le JEU, 2 = la FIN

uint8_t x = 5;            // le A : sa colonne…
uint8_t y = 8;            // …et sa ligne (le 0.81)
uint8_t px = 15;          // la pièce, le P : sa colonne…
uint8_t py = 8;           // …et sa ligne
uint8_t score = 0;        // les pièces ramassées
uint8_t temps = 30;       // les secondes qui restent
uint8_t ax = 5;           // NOUVEAU : la place du A AVANT son pas…
uint8_t ay = 8;           // …pour l'y remettre s'il entre dans un mur

void viderEcran() {
  for (uint8_t l = 0; l < 18; l++) {
    effacer(0, l, 20);
  }
}

// ---- NOUVEAU : une partie qui commence, TOUT au départ ----
// Depuis le titre, ET depuis la fin (START : rejouer).
void nouvellePartie() {
  x = 5;                          // le A revient à sa place
  y = 8;
  px = 15;                        // le P aussi (il était peut-être en 20, ramassé)
  py = 8;
  ax = 5;                         // et sa place d'avant, la même
  ay = 8;
  score = 0;                      // pas encore de pièce
  temps = 30;                     // 30 secondes de nouveau
  ecran = 1;                      // on est sur le JEU
  viderEcran();
  poser(px, py, ALPHABET[15]);

  // ---- NOUVEAU : le cadre de murs, des X tout autour du terrain ----
  //
  //   colonne : 0 1 2 …           19
  //   ligne 0 : X X X X X X … X X X     le haut : ligne 0, colonnes 0 à 19
  //   ligne 1 : X                 X
  //   …         X   A        P    X     les côtés : colonnes 0 et 19
  //   ligne 15: X                 X
  //   ligne 16: X X X X X X … X X X     le bas : ligne 16
  //   ligne 17: SCORE 000  TEMPS 030    la ligne 17 reste aux nombres
  //
  // ALPHABET[23] : la 24e lettre (on compte depuis 0), le X.
  for (uint8_t c = 0; c < 20; c++) {
    poser(c, 0, ALPHABET[23]);        // le haut
    poser(c, 16, ALPHABET[23]);       // le bas
  }
  for (uint8_t l = 1; l < 16; l++) {
    poser(0, l, ALPHABET[23]);        // le côté gauche
    poser(19, l, ALPHABET[23]);       // le côté droit
  }

  texte(0, 17, "SCORE");
  texte(11, 17, "TEMPS");
}

int main() {
  couleurTexte(31, 16, 0);
  texteGrand(4, 5, "JEU", 4);
  texte(2, 12, "APPUIE SUR START");

  while (true) {
    image();

    if (ecran == 0 && bouton(START)) {
      nouvellePartie();               // la première partie
    }

    if (ecran == 1) {
      ax = x;                                  // NOUVEAU : on retient où est le A…
      ay = y;
      deplace_croix(x, y, ALPHABET[0], 250);   // …il fait peut-être un pas…

      // …et s'il est arrivé SUR le cadre (colonne 0 ou 19, ligne 0 ou 16) :
      //   1. on remet le X, que le A venait de recouvrir ;
      //   2. le A revient à sa place d'avant, et s'y pose.
      // || veut dire « OU » : une seule des quatre suffit.
      if (x == 0 || x == 19 || y == 0 || y >= 16) {
        poser(x, y, ALPHABET[23]);             // le mur revient
        x = ax;                                // le A recule
        y = ay;
        poser(x, y, ALPHABET[0]);
      }
      if (x == px && y == py) {                // le A sur le P : ramassée (le 0.81)
        score = score + 1;
        px = 20;                               // la pièce part hors de l'écran
      }
      nombre(6, 17, score);
      nombre(17, 17, temps);
    }

    if (ecran == 1 && chaque(1000)) {
      temps = temps - 1;
      if (temps == 0) {
        ecran = 2;
        viderEcran();
        texte(8, 6, "FIN");
        texte(5, 9, "SCORE");         // NOUVEAU : le score de la partie
        nombre(11, 9, score);
        texte(2, 13, "START : REJOUER");
      }
    }

    // ---- NOUVEAU : sur la fin, START relance une partie.
    if (ecran == 2 && bouton(START)) {
      nouvellePartie();               // la même fonction : tout au départ
    }
  }
}
`,
    aVoir: 'START : le terrain entouré de X ; le A se cogne au cadre et ne le traverse pas.',
    controle: (c) => {
      c.avancer(10)
      c.presser('start', 6)
      c.avancer(5)
      const cadre = c.mot(0, 0, 20) === 'X'.repeat(20) && c.mot(0, 16, 20) === 'X'.repeat(20) && c.mot(0, 8, 1) === 'X' && c.mot(19, 8, 1) === 'X'
      c.presser('left', 120)
      const gauche = c.variable('x')
      c.presser('up', 120)
      const haut = c.variable('y')
      c.avancer(3)
      return [
        ['le cadre de X fait le tour du terrain', cadre],
        ['à gauche, le A s’arrête en colonne 1', gauche === 1, ` (x = ${gauche})`],
        ['en haut, il s’arrête en ligne 1', haut === 1, ` (y = ${haut})`],
        ['les murs sont intacts, le A est à sa place', c.mot(0, 1, 1) === 'X' && c.mot(1, 0, 1) === 'X' && c.mot(1, 1, 1) === 'A'],
      ]
    },
  },

  {
    titre: 'Le titre, puis le jeu — la pièce revient au hasard',
    difficulte: 0,
    suite: true,
    idee: 'Le 0.91.3, mais la pièce ramassée ne disparaît plus : elle réapparaît au hasard, dans le cadre. 1 + hasard() % 18 pour la colonne, 1 + hasard() % 15 pour la ligne.',
    texte: [
      '**C’est le 0.91.3, avec une chose en plus :** quand le A prend le P, le P ne part plus hors de l’écran (`px = 20`). Il **réapparaît ailleurs, au hasard**, et on peut le ramasser encore et encore pendant les 30 secondes.',
      '**`hasard()`, on la connaît (le 0.81.2) :** elle rend un nombre imprévisible, de 0 à 255. Au 0.81.2, `hasard() % 20` donnait une colonne de 0 à 19 : tout l’écran.',
      '**Ce qui est nouveau ici : rester DANS le cadre.** Les colonnes 0 et 19 sont des murs X : une pièce posée là effacerait le mur, et le A ne pourrait jamais l’atteindre. La pièce doit donc tomber entre la colonne **1** et la colonne **18** : 18 colonnes possibles.',
      '**`hasard() % 18`** garde le **reste** de la division par 18 : un nombre de **0 à 17**. Exemples : 137 = 7 × 18 + 11, le reste est **11** ; 36 = 2 × 18 + 0, le reste est **0** ; 17 = 0 × 18 + 17, le reste est **17**.',
      '**Le `1 +` décale tout d’une case :** 0 devient 1, 17 devient 18. `1 + hasard() % 18` donne donc une colonne de **1 à 18** : jamais sur un mur. Avec 137 : 1 + 11 = **12**.',
      '**Pour la ligne, pareil :** les lignes 0 et 16 sont des murs, la pièce va de la ligne **1** à la ligne **15** : 15 lignes possibles. `hasard() % 15` donne 0 à 14, et `1 + hasard() % 15` donne **1 à 15**.',
      '**Le calcul se fait dans l’ordre des maths :** `%` passe avant `+`, comme × avant +. `1 + hasard() % 18`, c’est « le reste d’abord, puis on ajoute 1 ».',
      '**Puis `poser(px, py, ALPHABET[15])`** dessine le nouveau P à sa place. L’ancien n’a pas besoin d’être effacé : le A est dessus.',
      '**Dans `nouvellePartie()`,** rien ne change : le P revient en (15, 8), d’où qu’il soit.',
    ],
    code: `uint8_t ecran = 0;        // 0 = le TITRE, 1 = le JEU, 2 = la FIN

uint8_t x = 5;            // le A : sa colonne…
uint8_t y = 8;            // …et sa ligne (le 0.81)
uint8_t px = 15;          // la pièce, le P : sa colonne…
uint8_t py = 8;           // …et sa ligne
uint8_t score = 0;        // les pièces ramassées
uint8_t temps = 30;       // les secondes qui restent
uint8_t ax = 5;           // la place du A AVANT son pas… (le 0.91.3)
uint8_t ay = 8;           // …pour l'y remettre s'il entre dans un mur

void viderEcran() {
  for (uint8_t l = 0; l < 18; l++) {
    effacer(0, l, 20);
  }
}

// ---- Une partie qui commence, TOUT au départ (le 0.91.2) ----
// Depuis le titre, ET depuis la fin (START : rejouer).
void nouvellePartie() {
  x = 5;                          // le A revient à sa place
  y = 8;
  px = 15;                        // le P revient en (15, 8), d'où qu'il soit
  py = 8;
  ax = 5;                         // et sa place d'avant, la même
  ay = 8;
  score = 0;                      // pas encore de pièce
  temps = 30;                     // 30 secondes de nouveau
  ecran = 1;                      // on est sur le JEU
  viderEcran();
  poser(px, py, ALPHABET[15]);

  // ---- Le cadre de murs, des X tout autour du terrain (le 0.91.3) ----
  //
  //   colonne : 0 1 2 …           19
  //   ligne 0 : X X X X X X … X X X     le haut : ligne 0, colonnes 0 à 19
  //   ligne 1 : X                 X
  //   …         X   A        P    X     les côtés : colonnes 0 et 19
  //   ligne 15: X                 X
  //   ligne 16: X X X X X X … X X X     le bas : ligne 16
  //   ligne 17: SCORE 000  TEMPS 030    la ligne 17 reste aux nombres
  //
  // ALPHABET[23] : la 24e lettre (on compte depuis 0), le X.
  for (uint8_t c = 0; c < 20; c++) {
    poser(c, 0, ALPHABET[23]);        // le haut
    poser(c, 16, ALPHABET[23]);       // le bas
  }
  for (uint8_t l = 1; l < 16; l++) {
    poser(0, l, ALPHABET[23]);        // le côté gauche
    poser(19, l, ALPHABET[23]);       // le côté droit
  }

  texte(0, 17, "SCORE");
  texte(11, 17, "TEMPS");
}

int main() {
  couleurTexte(31, 16, 0);
  texteGrand(4, 5, "JEU", 4);
  texte(2, 12, "APPUIE SUR START");

  while (true) {
    image();

    if (ecran == 0 && bouton(START)) {
      nouvellePartie();               // la première partie
    }

    if (ecran == 1) {
      ax = x;                                  // on retient où est le A… (le 0.91.3)
      ay = y;
      deplace_croix(x, y, ALPHABET[0], 250);   // …il fait peut-être un pas…

      // …et s'il est arrivé SUR le cadre (colonne 0 ou 19, ligne 0 ou 16) :
      //   1. on remet le X, que le A venait de recouvrir ;
      //   2. le A revient à sa place d'avant, et s'y pose.
      // || veut dire « OU » : une seule des quatre suffit.
      if (x == 0 || x == 19 || y == 0 || y >= 16) {
        poser(x, y, ALPHABET[23]);             // le mur revient
        x = ax;                                // le A recule
        y = ay;
        poser(x, y, ALPHABET[0]);
      }
      if (x == px && y == py) {                // le A sur le P : ramassée (le 0.81)
        score = score + 1;

        // ---- NOUVEAU : la pièce réapparaît AU HASARD, mais DANS le cadre ----
        //
        //   px = 1 + hasard() % 18;
        //        |   |        |
        //        |   |        +-- % 18 : le reste de la division par 18, de 0 à 17.
        //        |   |            Exemple : hasard() rend 137 ; 137 = 7 × 18 + 11 ;
        //        |   |            le reste est 11.
        //        |   +----------- un nombre imprévisible, de 0 à 255 (le 0.81.2)
        //        +--------------- + 1 : on décale de 0…17 à 1…18 → 11 + 1 = 12.
        //
        // Pourquoi pas % 20 comme au 0.81.2 ? Les colonnes 0 et 19 sont des murs X :
        // la pièce doit rester de 1 à 18. Les lignes 0 et 16 aussi sont des murs :
        // la pièce doit rester de 1 à 15, d'où 1 + hasard() % 15.
        px = 1 + hasard() % 18;                // une colonne : 1 à 18
        py = 1 + hasard() % 15;                // une ligne : 1 à 15
        poser(px, py, ALPHABET[15]);           // le nouveau P apparaît là
      }
      nombre(6, 17, score);
      nombre(17, 17, temps);
    }

    if (ecran == 1 && chaque(1000)) {
      temps = temps - 1;
      if (temps == 0) {
        ecran = 2;
        viderEcran();
        texte(8, 6, "FIN");
        texte(5, 9, "SCORE");         // le score de la partie (le 0.91.2)
        nombre(11, 9, score);
        texte(2, 13, "START : REJOUER");
      }
    }

    // ---- Sur la fin, START relance une partie (le 0.91.2).
    if (ecran == 2 && bouton(START)) {
      nouvellePartie();               // la même fonction : tout au départ
    }
  }
}
`,
    aVoir: 'START : le A prend le P ; un autre P apparaît aussitôt ailleurs, toujours à l’intérieur du cadre de X.',
    controle: (c) => {
      c.avancer(10)
      c.presser('start', 6)
      c.avancer(5)
      for (let k = 0; k < 200; k++) { c.gb.setButton('right', true); c.avancer(1) } c.gb.setButton('right', false)
      c.avancer(3)
      let p = 0
      for (let l = 0; l < 17; l++) p += [...c.mot(0, l, 20)].filter((ch) => ch === 'P').length
      const px = c.variable('px'), py = c.variable('py')
      const surA = px === c.variable('x') && py === c.variable('y')
      return [
        ['la pièce est ramassée', c.variable('score') >= 1, ` (score = ${c.variable('score')})`],
        ['un nouveau P est à l’écran', p === 1 || surA],
        ['dans le cadre : colonne 1 à 18, ligne 1 à 15', px >= 1 && px <= 18 && py >= 1 && py <= 15, ` (px = ${px}, py = ${py})`],
        ['le cadre de X est intact', c.mot(0, 0, 20) === 'X'.repeat(20) && c.mot(0, 16, 20) === 'X'.repeat(20)],
      ]
    },
  },

  {
    titre: 'Le snake — une queue qui suit le A',
    difficulte: 0,
    suite: true,
    idee: 'Le 0.91.4, et le A a une queue : un O, toujours sur la case que le A vient de quitter. Le début d’un serpent.',
    texte: [
      '**C’est le 0.91.4, avec une chose en plus : une queue.** Derrière le A, il y a un **O** (`ALPHABET[14]`, la 15e lettre). Quand le A fait un pas, le O le suit : il prend **la case que le A vient de quitter**. C’est le début d’un jeu de serpent, le « snake ».',
      '**Deux nouvelles variables, `qx` et `qy` :** la colonne et la ligne de la queue. Au départ, (4, 8) : juste à gauche du A, qui est en (5, 8). `nouvellePartie()` les remet là, et y pose le O.',
      '**Où était le A avant son pas ? On le sait déjà :** au 0.91.3, on a rangé sa place d’avant dans `ax` et `ay`, pour le faire reculer devant un mur. On s’en sert une deuxième fois : c’est exactement là que la queue doit aller.',
      '**Ce qui est nouveau ici : savoir si le A a bougé.** `deplace_croix` ne fait un pas que toutes les 250 ms ; les autres images, le A ne bouge pas. Et contre un mur, il est revenu en (`ax`, `ay`). Il a bougé si sa place n’est **plus** celle d’avant : `x != ax || y != ay`. **`!=`** veut dire « n’est pas égal à » (le 0.82), **`||`** veut dire « ou » (le 0.91.3) : une seule des deux différences suffit (un pas à gauche ou à droite change `x`, un pas en haut ou en bas change `y`).',
      '**Quand il a bougé, quatre étapes, dans cet ordre :** 1. `effacer(qx, qy, 1)` efface l’ancien O (le `1` : une seule case). 2. `qx = ax;` et `qy = ay;` : la queue prend la case quittée par le A. 3. `poser(qx, qy, ALPHABET[14])` dessine le O à sa nouvelle place. 4. `poser(x, y, ALPHABET[0])` redessine le A.',
      '**Pourquoi redessiner le A ?** Pour le demi-tour. Le A est en (5, 8), sa queue en (4, 8). Il va à gauche : il arrive en (4, 8), **sur** sa queue. L’étape 1 efface (4, 8)… et efface donc le A ! L’étape 3 pose le O en (5, 8), la case quittée. L’étape 4 remet le A en (4, 8). Le A et sa queue ont échangé leurs places.',
      '**Déroulons un pas à droite :** A en (5, 8), O en (4, 8). `deplace_croix` : A en (6, 8), et (5, 8) est effacée. `x` vaut 6, `ax` vaut 5 : il a bougé. 1. (4, 8) est effacée. 2. `qx` = 5, `qy` = 8. 3. O en (5, 8). 4. A en (6, 8). Résultat : **O A**, un cran plus loin.',
      '**Encore un défaut, pour plus tard :** si le P réapparaît juste sur la queue, le O l’efface au pas suivant ; on ne le voit plus, mais il est toujours là, dans `px` et `py`.',
    ],
    code: `uint8_t ecran = 0;        // 0 = le TITRE, 1 = le JEU, 2 = la FIN

uint8_t x = 5;            // le A : sa colonne…
uint8_t y = 8;            // …et sa ligne (le 0.81)
uint8_t px = 15;          // la pièce, le P : sa colonne…
uint8_t py = 8;           // …et sa ligne
uint8_t score = 0;        // les pièces ramassées
uint8_t temps = 30;       // les secondes qui restent
uint8_t ax = 5;           // la place du A AVANT son pas… (le 0.91.3)
uint8_t ay = 8;           // …pour l'y remettre s'il entre dans un mur
uint8_t qx = 4;           // NOUVEAU : la QUEUE, un O : sa colonne…
uint8_t qy = 8;           // …et sa ligne. Elle part juste à gauche du A.

void viderEcran() {
  for (uint8_t l = 0; l < 18; l++) {
    effacer(0, l, 20);
  }
}

// ---- Une partie qui commence, TOUT au départ (le 0.91.2) ----
// Depuis le titre, ET depuis la fin (START : rejouer).
void nouvellePartie() {
  x = 5;                          // le A revient à sa place
  y = 8;
  px = 15;                        // le P revient en (15, 8), d'où qu'il soit
  py = 8;
  ax = 5;                         // et sa place d'avant, la même
  ay = 8;
  qx = 4;                         // NOUVEAU : la queue, juste à gauche du A
  qy = 8;
  score = 0;                      // pas encore de pièce
  temps = 30;                     // 30 secondes de nouveau
  ecran = 1;                      // on est sur le JEU
  viderEcran();
  poser(px, py, ALPHABET[15]);
  poser(qx, qy, ALPHABET[14]);    // NOUVEAU : le O de la queue

  // ---- Le cadre de murs, des X tout autour du terrain (le 0.91.3) ----
  //
  //   colonne : 0 1 2 …           19
  //   ligne 0 : X X X X X X … X X X     le haut : ligne 0, colonnes 0 à 19
  //   ligne 1 : X                 X
  //   …         X   A        P    X     les côtés : colonnes 0 et 19
  //   ligne 15: X                 X
  //   ligne 16: X X X X X X … X X X     le bas : ligne 16
  //   ligne 17: SCORE 000  TEMPS 030    la ligne 17 reste aux nombres
  //
  // ALPHABET[23] : la 24e lettre (on compte depuis 0), le X.
  for (uint8_t c = 0; c < 20; c++) {
    poser(c, 0, ALPHABET[23]);        // le haut
    poser(c, 16, ALPHABET[23]);       // le bas
  }
  for (uint8_t l = 1; l < 16; l++) {
    poser(0, l, ALPHABET[23]);        // le côté gauche
    poser(19, l, ALPHABET[23]);       // le côté droit
  }

  texte(0, 17, "SCORE");
  texte(11, 17, "TEMPS");
}

int main() {
  couleurTexte(31, 16, 0);
  texteGrand(4, 5, "JEU", 4);
  texte(2, 12, "APPUIE SUR START");

  while (true) {
    image();

    if (ecran == 0 && bouton(START)) {
      nouvellePartie();               // la première partie
    }

    if (ecran == 1) {
      ax = x;                                  // on retient où est le A… (le 0.91.3)
      ay = y;
      deplace_croix(x, y, ALPHABET[0], 250);   // …il fait peut-être un pas…

      // …et s'il est arrivé SUR le cadre (colonne 0 ou 19, ligne 0 ou 16) :
      //   1. on remet le X, que le A venait de recouvrir ;
      //   2. le A revient à sa place d'avant, et s'y pose.
      // || veut dire « OU » : une seule des quatre suffit.
      if (x == 0 || x == 19 || y == 0 || y >= 16) {
        poser(x, y, ALPHABET[23]);             // le mur revient
        x = ax;                                // le A recule
        y = ay;
        poser(x, y, ALPHABET[0]);
      }

      // ---- NOUVEAU : la queue suit le A ----
      // Le A a-t-il bougé ? Sa place n'est plus celle d'avant (ax, ay).
      // (Pas de pas cette image-ci, ou un mur : il est toujours en (ax, ay).)
      // != veut dire « n'est pas égal », || veut dire « OU ».
      if (x != ax || y != ay) {
        effacer(qx, qy, 1);                    // 1. l'ancien O disparaît (1 : une case)
        qx = ax;                               // 2. la queue prend la case
        qy = ay;                               //    que le A vient de quitter
        poser(qx, qy, ALPHABET[14]);           // 3. le O s'y dessine (la 15e lettre)
        poser(x, y, ALPHABET[0]);              // 4. le A par-dessus : au demi-tour,
      }                                        //    l'étape 1 venait de l'effacer
      if (x == px && y == py) {                // le A sur le P : ramassée (le 0.81)
        score = score + 1;

        // ---- La pièce réapparaît AU HASARD, mais DANS le cadre (le 0.91.4) ----
        //
        //   px = 1 + hasard() % 18;
        //        |   |        |
        //        |   |        +-- % 18 : le reste de la division par 18, de 0 à 17.
        //        |   |            Exemple : hasard() rend 137 ; 137 = 7 × 18 + 11 ;
        //        |   |            le reste est 11.
        //        |   +----------- un nombre imprévisible, de 0 à 255 (le 0.81.2)
        //        +--------------- + 1 : on décale de 0…17 à 1…18 → 11 + 1 = 12.
        //
        // Pourquoi pas % 20 comme au 0.81.2 ? Les colonnes 0 et 19 sont des murs X :
        // la pièce doit rester de 1 à 18. Les lignes 0 et 16 aussi sont des murs :
        // la pièce doit rester de 1 à 15, d'où 1 + hasard() % 15.
        px = 1 + hasard() % 18;                // une colonne : 1 à 18
        py = 1 + hasard() % 15;                // une ligne : 1 à 15
        poser(px, py, ALPHABET[15]);           // le nouveau P apparaît là
      }
      nombre(6, 17, score);
      nombre(17, 17, temps);
    }

    if (ecran == 1 && chaque(1000)) {
      temps = temps - 1;
      if (temps == 0) {
        ecran = 2;
        viderEcran();
        texte(8, 6, "FIN");
        texte(5, 9, "SCORE");         // le score de la partie (le 0.91.2)
        nombre(11, 9, score);
        texte(2, 13, "START : REJOUER");
      }
    }

    // ---- Sur la fin, START relance une partie (le 0.91.2).
    if (ecran == 2 && bouton(START)) {
      nouvellePartie();               // la même fonction : tout au départ
    }
  }
}
`,
    aVoir: 'START : un O suit le A partout, un cran derrière lui ; au demi-tour, les deux échangent leurs places.',
    controle: (c) => {
      const lesO = () => {
        let n = 0
        for (let l = 1; l < 16; l++) n += [...c.mot(0, l, 20)].filter((ch) => ch === 'O').length
        return n
      }
      c.avancer(10)
      c.presser('start', 6)
      c.avancer(5)
      const depart = c.mot(4, 8, 2) === 'OA'
      c.presser('right', 60)
      c.avancer(3)
      const x = c.variable('x')
      const droite = x > 5 && c.mot(x - 1, 8, 2) === 'OA' && lesO() === 1
      c.presser('up', 30)
      c.avancer(3)
      const y = c.variable('y')
      const haut = y < 8 && c.mot(x, y, 1) === 'A' && c.variable('qx') === x && c.variable('qy') === y + 1 && c.mot(x, y + 1, 1) === 'O' && lesO() === 1
      return [
        ['au départ : O A, en (4, 8) et (5, 8)', depart],
        ['à droite, le O suit, un cran derrière', droite, ` (x = ${x})`],
        ['en haut, le O est juste sous le A, et il n’y a qu’un O', haut, ` (y = ${y})`],
      ]
    },
  },

  {
    titre: 'Le snake — la queue grandit à chaque pièce',
    difficulte: 0,
    suite: true,
    idee: 'Le 0.91.5, mais la queue est un tableau de cases O. Au début, le A est tout seul ; chaque pièce ramassée ajoute un O. Le serpent grandit.',
    texte: [
      '**C’est le 0.91.5, avec une chose en plus : la queue grandit.** Au début, le A est **tout seul**. À chaque P ramassé, il gagne **une case O**. Au bout de dix pièces, le A traîne dix O derrière lui.',
      '**Une queue de plusieurs cases, c’est plusieurs places : un tableau.** `uint8_t qx[50];` réserve **50** colonnes, de `qx[0]` à `qx[49]` ; `qy[50]`, les 50 lignes. La case `i` de la queue est en (`qx[i]`, `qy[i]`). **`qx[0]`** est la case collée au A ; la dernière est le **bout** de la queue.',
      '**`longueur` compte les cases utilisées :** **0** au départ, le A est tout seul ; `nouvellePartie()` la remet à 0 et ne pose aucun O. Les cases utilisées vont de `0` à `longueur - 1` : avec `longueur` = 3, ce sont `qx[0]`, `qx[1]` et `qx[2]`. Le bout est donc toujours `qx[longueur - 1]`.',
      '**Un piège : `longueur - 1` quand `longueur` vaut 0.** On attendrait -1. Mais un `uint8_t` ne connaît que 0 à 255 : sous 0, il repart de l’autre côté, et 0 - 1 donne **255**. `qx[255]` n’existe pas (le tableau s’arrête à `qx[49]`), et la boucle ferait 255 tours. D’où la condition `longueur > 0 && (x != ax || y != ay)` : **`&&`** veut dire « et » (le 0.75) ; **les deux** doivent être vraies. Sans queue, on ne la déplace pas.',
      '**Les parenthèses** autour de `x != ax || y != ay` : elles se calculent d’abord, comme en maths. « Il y a une queue » ET « le A a bougé (en x ou en y) ».',
      '**Ce qui est nouveau ici : faire avancer toute la queue.** Chaque case prend la place de **celle de devant** : `qx[2]` prend la place de `qx[1]`, puis `qx[1]` celle de `qx[0]`, puis `qx[0]` celle que le A vient de quitter (`ax`, `ay`). Comme les wagons d’un train.',
      '**Pourquoi en partant du bout ?** Si l’on commençait par `qx[1] = qx[0];`, l’ancienne place de `qx[1]` serait perdue avant que `qx[2]` ne la prenne. En partant du bout, chaque case est lue **avant** d’être écrasée.',
      '**La boucle qui recule :** `for (uint8_t i = longueur - 1; i > 0; i--)`. **`i--`** retire 1 à `i` à chaque tour (le contraire de `i++`). Avec `longueur` = 3 : `i` vaut 2, puis 1, et s’arrête avant 0 (`i > 0` est faux). Tour `i` = 2 : `qx[2] = qx[1]`. Tour `i` = 1 : `qx[1] = qx[0]`. Avec `longueur` = 1, `i` part de 0 : `0 > 0` est faux, la boucle ne tourne pas du tout.',
      '**Le bout est effacé avant, toute la queue est redessinée après :** `effacer(qx[longueur - 1], qy[longueur - 1], 1)` gomme l’ancien bout, puis une boucle `for` pose un O sur chaque case, de `0` à `longueur - 1`. Et le A par-dessus, comme au 0.91.5.',
      '**Grandir, quand on ramasse le P :** la nouvelle case naît **sur le bout de la queue** : `qx[longueur] = qx[longueur - 1];`, puis `longueur = longueur + 1;`. Au pas suivant, toute la queue avance d’un cran, sauf la nouvelle case, qui prend la place de l’ancien bout : **elle reste derrière**, et la queue a une case de plus.',
      '**La toute première case, elle, n’a pas de bout sur lequel naître** (et `qx[longueur - 1]` serait encore `qx[255]`). Elle naît donc **sous le A** : `qx[0] = x;` et `qy[0] = y;`. Au pas suivant, le A s’en va, et le O apparaît sur la case qu’il a quittée. `else` (le 0.83.1) : « sinon », quand la queue a déjà au moins une case.',
      '**Pourquoi redessiner toute la queue ?** Juste après la pièce, le bout et la nouvelle case sont sur la même place. Au pas suivant, on efface le bout… donc aussi la nouvelle case, qui doit y rester. Redessiner toutes les cases la fait réapparaître.',
      '**`if (longueur < 50)` :** le tableau n’a que 50 cases. Au-delà, `qx[50]` écrirait en dehors, sur d’autres variables. Après 49 pièces, la queue ne grandit plus.',
      '**Pour plus tard :** le A traverse sa propre queue sans rien dire, et le P peut tomber sur la queue. Dans un vrai serpent, toucher sa queue fait perdre.',
    ],
    code: `uint8_t ecran = 0;        // 0 = le TITRE, 1 = le JEU, 2 = la FIN

uint8_t x = 5;            // le A : sa colonne…
uint8_t y = 8;            // …et sa ligne (le 0.81)
uint8_t px = 15;          // la pièce, le P : sa colonne…
uint8_t py = 8;           // …et sa ligne
uint8_t score = 0;        // les pièces ramassées
uint8_t temps = 30;       // les secondes qui restent
uint8_t ax = 5;           // la place du A AVANT son pas… (le 0.91.3)
uint8_t ay = 8;           // …pour l'y remettre s'il entre dans un mur
uint8_t qx[50];           // NOUVEAU : la queue, un TABLEAU de 50 cases O : les colonnes…
uint8_t qy[50];           // …et les lignes. qx[0] : la case collée au A.
uint8_t longueur = 0;     // NOUVEAU : combien de cases la queue utilise (0 : le A seul)

void viderEcran() {
  for (uint8_t l = 0; l < 18; l++) {
    effacer(0, l, 20);
  }
}

// ---- Une partie qui commence, TOUT au départ (le 0.91.2) ----
// Depuis le titre, ET depuis la fin (START : rejouer).
void nouvellePartie() {
  x = 5;                          // le A revient à sa place
  y = 8;
  px = 15;                        // le P revient en (15, 8), d'où qu'il soit
  py = 8;
  ax = 5;                         // et sa place d'avant, la même
  ay = 8;
  longueur = 0;                   // NOUVEAU : pas de queue, le A est tout seul
  score = 0;                      // pas encore de pièce
  temps = 30;                     // 30 secondes de nouveau
  ecran = 1;                      // on est sur le JEU
  viderEcran();
  poser(px, py, ALPHABET[15]);

  // ---- Le cadre de murs, des X tout autour du terrain (le 0.91.3) ----
  //
  //   colonne : 0 1 2 …           19
  //   ligne 0 : X X X X X X … X X X     le haut : ligne 0, colonnes 0 à 19
  //   ligne 1 : X                 X
  //   …         X   A        P    X     les côtés : colonnes 0 et 19
  //   ligne 15: X                 X
  //   ligne 16: X X X X X X … X X X     le bas : ligne 16
  //   ligne 17: SCORE 000  TEMPS 030    la ligne 17 reste aux nombres
  //
  // ALPHABET[23] : la 24e lettre (on compte depuis 0), le X.
  for (uint8_t c = 0; c < 20; c++) {
    poser(c, 0, ALPHABET[23]);        // le haut
    poser(c, 16, ALPHABET[23]);       // le bas
  }
  for (uint8_t l = 1; l < 16; l++) {
    poser(0, l, ALPHABET[23]);        // le côté gauche
    poser(19, l, ALPHABET[23]);       // le côté droit
  }

  texte(0, 17, "SCORE");
  texte(11, 17, "TEMPS");
}

int main() {
  couleurTexte(31, 16, 0);
  texteGrand(4, 5, "JEU", 4);
  texte(2, 12, "APPUIE SUR START");

  while (true) {
    image();

    if (ecran == 0 && bouton(START)) {
      nouvellePartie();               // la première partie
    }

    if (ecran == 1) {
      ax = x;                                  // on retient où est le A… (le 0.91.3)
      ay = y;
      deplace_croix(x, y, ALPHABET[0], 250);   // …il fait peut-être un pas…

      // …et s'il est arrivé SUR le cadre (colonne 0 ou 19, ligne 0 ou 16) :
      //   1. on remet le X, que le A venait de recouvrir ;
      //   2. le A revient à sa place d'avant, et s'y pose.
      // || veut dire « OU » : une seule des quatre suffit.
      if (x == 0 || x == 19 || y == 0 || y >= 16) {
        poser(x, y, ALPHABET[23]);             // le mur revient
        x = ax;                                // le A recule
        y = ay;
        poser(x, y, ALPHABET[0]);
      }

      // ---- La queue suit le A (le 0.91.5) ----
      // Le A a-t-il bougé ? Sa place n'est plus celle d'avant (ax, ay).
      // NOUVEAU : longueur > 0 d'abord. Sans queue, rien à déplacer, et
      // longueur - 1 vaudrait 255 (un uint8_t ne descend pas sous 0).
      // && veut dire « ET » : il faut une queue ET que le A ait bougé.
      if (longueur > 0 && (x != ax || y != ay)) {
        // 1. le BOUT de la queue disparaît : la dernière case, longueur - 1
        effacer(qx[longueur - 1], qy[longueur - 1], 1);

        // ---- NOUVEAU : 2. chaque case prend la place de celle de devant ----
        // En partant du BOUT, et en reculant (i-- : i = i - 1).
        // Avec longueur = 3 :  i = 2 : qx[2] = qx[1]
        //                      i = 1 : qx[1] = qx[0]
        //                      i = 0 : 0 > 0 est faux, la boucle s'arrête.
        for (uint8_t i = longueur - 1; i > 0; i--) {
          qx[i] = qx[i - 1];
          qy[i] = qy[i - 1];
        }

        // 3. la première case prend la case que le A vient de quitter
        qx[0] = ax;
        qy[0] = ay;

        // 4. toute la queue redessinée, de la case 0 à la case longueur - 1
        //    (après une pièce, la nouvelle case venait d'être effacée avec le bout)
        for (uint8_t i = 0; i < longueur; i++) {
          poser(qx[i], qy[i], ALPHABET[14]);
        }
        poser(x, y, ALPHABET[0]);              // 5. le A par-dessus (le 0.91.5)
      }
      if (x == px && y == py) {                // le A sur le P : ramassée (le 0.81)
        score = score + 1;

        // ---- La pièce réapparaît AU HASARD, mais DANS le cadre (le 0.91.4) ----
        //
        //   px = 1 + hasard() % 18;
        //        |   |        |
        //        |   |        +-- % 18 : le reste de la division par 18, de 0 à 17.
        //        |   |            Exemple : hasard() rend 137 ; 137 = 7 × 18 + 11 ;
        //        |   |            le reste est 11.
        //        |   +----------- un nombre imprévisible, de 0 à 255 (le 0.81.2)
        //        +--------------- + 1 : on décale de 0…17 à 1…18 → 11 + 1 = 12.
        //
        // Pourquoi pas % 20 comme au 0.81.2 ? Les colonnes 0 et 19 sont des murs X :
        // la pièce doit rester de 1 à 18. Les lignes 0 et 16 aussi sont des murs :
        // la pièce doit rester de 1 à 15, d'où 1 + hasard() % 15.
        px = 1 + hasard() % 18;                // une colonne : 1 à 18
        py = 1 + hasard() % 15;                // une ligne : 1 à 15
        poser(px, py, ALPHABET[15]);           // le nouveau P apparaît là

        // ---- NOUVEAU : la queue grandit d'une case ----
        // La nouvelle case naît SUR le bout de la queue. Au prochain pas, toutes
        // les autres avancent, elle non : elle reste derrière.
        // La toute première n'a pas de bout : elle naît SOUS le A.
        // < 50 : le tableau n'a que 50 cases, qx[0] à qx[49].
        if (longueur < 50) {
          if (longueur == 0) {
            qx[0] = x;                         // la première case : sous le A
            qy[0] = y;
          } else {
            qx[longueur] = qx[longueur - 1];   // la case d'après le bout…
            qy[longueur] = qy[longueur - 1];   // …à la même place que le bout
          }
          longueur = longueur + 1;             // une case de plus
        }
      }
      nombre(6, 17, score);
      nombre(17, 17, temps);
    }

    if (ecran == 1 && chaque(1000)) {
      temps = temps - 1;
      if (temps == 0) {
        ecran = 2;
        viderEcran();
        texte(8, 6, "FIN");
        texte(5, 9, "SCORE");         // le score de la partie (le 0.91.2)
        nombre(11, 9, score);
        texte(2, 13, "START : REJOUER");
      }
    }

    // ---- Sur la fin, START relance une partie (le 0.91.2).
    if (ecran == 2 && bouton(START)) {
      nouvellePartie();               // la même fonction : tout au départ
    }
  }
}
`,
    aVoir: 'START : le A tout seul ; à chaque P ramassé, un O de plus derrière lui.',
    controle: (c) => {
      const lesO = () => {
        let n = 0
        for (let l = 1; l < 16; l++) n += [...c.mot(0, l, 20)].filter((ch) => ch === 'O').length
        return n
      }
      c.avancer(10)
      c.presser('start', 6)
      c.avancer(5)
      const depart = c.variable('longueur') === 0 && c.mot(4, 8, 2) === ' A' && lesO() === 0
      c.presser('right', 160)
      const score = c.variable('score')
      c.presser('up', 45)
      c.avancer(3)
      const longueur = c.variable('longueur')
      return [
        ['au départ : le A tout seul, aucun O', depart],
        ['le P est ramassé', score >= 1, ` (score = ${score})`],
        ['la queue a grandi : une case par pièce', longueur === score && longueur >= 1, ` (longueur = ${longueur})`],
        ['autant de O à l’écran que de cases', lesO() === longueur, ` (${lesO()} O)`],
      ]
    },
  },

  {
    titre: 'Le snake — le A avance tout seul',
    difficulte: 0,
    suite: true,
    idee: 'Le 0.91.6, mais le A ne s’arrête plus : il avance tout seul, un pas toutes les 250 ms. La croix ne fait que choisir la direction. Comme un vrai snake.',
    texte: [
      '**C’est le 0.91.6, avec une chose en plus : le A avance tout seul.** Même sans toucher à rien, il fait un pas toutes les 250 ms. La croix ne le fait plus avancer : elle **choisit sa direction**. C’est comme ça que bouge un vrai serpent, dans un vrai snake.',
      '**`deplace_croix` s’en va.** Elle faisait un pas seulement quand on appuyait. On la remplace par deux morceaux écrits à la main : **choisir** la direction, puis **avancer**.',
      '**Ce qui est nouveau ici : retenir une direction dans un nombre.** `uint8_t sens = 0;` Il y a quatre directions ; on leur donne un numéro : **0 = droite, 1 = bas, 2 = gauche, 3 = haut**. Le programme ne retient que ce numéro. Au départ, 0 : le A part vers la droite. `nouvellePartie()` le remet à 0.',
      '**Choisir :** `if (bouton(DROITE)) sens = 0;`, et de même pour les trois autres. Il suffit d’**appuyer une fois**, même très court : `sens` change, et **il le reste** quand on lâche. Rien ne remet `sens` à zéro : le A continue dans la dernière direction choisie.',
      '**Avancer :** `if (chaque(250)) { … }` (le 0.77) : quatre fois par seconde. `effacer(x, y, 1)` enlève le A de sa case. Puis **un seul** des quatre `if` est vrai, celui du `sens` : il change `x` ou `y` d’une case. Enfin `poser(x, y, ALPHABET[0])` dessine le A sur sa nouvelle case.',
      '**Pourquoi `+ 1` et `- 1` ?** Les colonnes grandissent vers la droite : droite, c’est `x + 1` ; gauche, `x - 1`. Les lignes grandissent vers le **bas** (la ligne 0 est en haut) : bas, c’est `y + 1` ; haut, `y - 1`.',
      '**Deux `chaque()` dans le même programme ?** Oui : `chaque(250)` pour les pas, `chaque(1000)` pour le chronomètre. Chacun a **son propre chronomètre** : ils ne se gênent pas.',
      '**Déroulons :** A en (5, 8), `sens` = 0. 250 ms : `x` = 6. 250 ms : `x` = 7. On touche BAS : `sens` = 1. 250 ms : `y` = 9, `x` reste 7. Le A descend maintenant, tout seul, jusqu’à ce qu’on choisisse autre chose.',
      '**Le reste ne change pas :** le mur fait reculer le A (le 0.91.3) ; il reste donc collé au mur tant qu’on ne choisit pas une autre direction. La queue le suit, le P le fait grandir (le 0.91.6). Le A doit maintenant être **posé** dans `nouvellePartie()` : `deplace_croix` le faisait à sa place.',
      '**Pour plus tard :** en snake, on ne peut pas faire demi-tour d’un coup, sur sa propre queue ; et toucher un mur ou sa queue fait perdre.',
    ],
    code: `uint8_t ecran = 0;        // 0 = le TITRE, 1 = le JEU, 2 = la FIN

uint8_t x = 5;            // le A : sa colonne…
uint8_t y = 8;            // …et sa ligne (le 0.81)
uint8_t px = 15;          // la pièce, le P : sa colonne…
uint8_t py = 8;           // …et sa ligne
uint8_t score = 0;        // les pièces ramassées
uint8_t temps = 30;       // les secondes qui restent
uint8_t ax = 5;           // la place du A AVANT son pas… (le 0.91.3)
uint8_t ay = 8;           // …pour l'y remettre s'il entre dans un mur
uint8_t qx[50];           // la queue (le 0.91.6), un TABLEAU de 50 cases O : les colonnes…
uint8_t qy[50];           // …et les lignes. qx[0] : la case collée au A.
uint8_t longueur = 0;     // combien de cases la queue utilise (0 : le A seul)
uint8_t sens = 0;         // NOUVEAU : où va le A. 0 = droite, 1 = bas, 2 = gauche, 3 = haut

void viderEcran() {
  for (uint8_t l = 0; l < 18; l++) {
    effacer(0, l, 20);
  }
}

// ---- Une partie qui commence, TOUT au départ (le 0.91.2) ----
// Depuis le titre, ET depuis la fin (START : rejouer).
void nouvellePartie() {
  x = 5;                          // le A revient à sa place
  y = 8;
  px = 15;                        // le P revient en (15, 8), d'où qu'il soit
  py = 8;
  ax = 5;                         // et sa place d'avant, la même
  ay = 8;
  longueur = 0;                   // pas de queue, le A est tout seul (le 0.91.6)
  sens = 0;                       // NOUVEAU : le A repart vers la droite
  score = 0;                      // pas encore de pièce
  temps = 30;                     // 30 secondes de nouveau
  ecran = 1;                      // on est sur le JEU
  viderEcran();
  poser(px, py, ALPHABET[15]);
  poser(x, y, ALPHABET[0]);       // NOUVEAU : le A (deplace_croix ne le pose plus)

  // ---- Le cadre de murs, des X tout autour du terrain (le 0.91.3) ----
  //
  //   colonne : 0 1 2 …           19
  //   ligne 0 : X X X X X X … X X X     le haut : ligne 0, colonnes 0 à 19
  //   ligne 1 : X                 X
  //   …         X   A        P    X     les côtés : colonnes 0 et 19
  //   ligne 15: X                 X
  //   ligne 16: X X X X X X … X X X     le bas : ligne 16
  //   ligne 17: SCORE 000  TEMPS 030    la ligne 17 reste aux nombres
  //
  // ALPHABET[23] : la 24e lettre (on compte depuis 0), le X.
  for (uint8_t c = 0; c < 20; c++) {
    poser(c, 0, ALPHABET[23]);        // le haut
    poser(c, 16, ALPHABET[23]);       // le bas
  }
  for (uint8_t l = 1; l < 16; l++) {
    poser(0, l, ALPHABET[23]);        // le côté gauche
    poser(19, l, ALPHABET[23]);       // le côté droit
  }

  texte(0, 17, "SCORE");
  texte(11, 17, "TEMPS");
}

int main() {
  couleurTexte(31, 16, 0);
  texteGrand(4, 5, "JEU", 4);
  texte(2, 12, "APPUIE SUR START");

  while (true) {
    image();

    if (ecran == 0 && bouton(START)) {
      nouvellePartie();               // la première partie
    }

    if (ecran == 1) {
      // ---- NOUVEAU : la croix ne fait plus avancer, elle CHOISIT la direction ----
      // On appuie une fois, même très court : sens change, et il le reste.
      if (bouton(DROITE)) sens = 0;
      if (bouton(BAS))    sens = 1;
      if (bouton(GAUCHE)) sens = 2;
      if (bouton(HAUT))   sens = 3;

      ax = x;                                  // on retient où est le A… (le 0.91.3)
      ay = y;

      // ---- NOUVEAU : le A avance TOUT SEUL, un pas toutes les 250 ms ----
      // chaque(250) : vrai 4 fois par seconde (le 0.77). Ce chronomètre-ci
      // n'est pas celui de chaque(1000), plus bas : chacun a le sien.
      //
      //   sens :   3
      //            ↑           colonne : x - 1 à gauche, x + 1 à droite
      //        2 ← A → 0       ligne   : y - 1 en haut,  y + 1 en bas
      //            ↓
      //            1
      if (chaque(250)) {
        effacer(x, y, 1);                      // le A quitte sa case
        if (sens == 0) x = x + 1;              // à droite
        if (sens == 1) y = y + 1;              // en bas
        if (sens == 2) x = x - 1;              // à gauche
        if (sens == 3) y = y - 1;              // en haut
        poser(x, y, ALPHABET[0]);              // et se pose sur la suivante
      }

      // …et s'il est arrivé SUR le cadre (colonne 0 ou 19, ligne 0 ou 16) :
      //   1. on remet le X, que le A venait de recouvrir ;
      //   2. le A revient à sa place d'avant, et s'y pose.
      // || veut dire « OU » : une seule des quatre suffit.
      if (x == 0 || x == 19 || y == 0 || y >= 16) {
        poser(x, y, ALPHABET[23]);             // le mur revient
        x = ax;                                // le A recule
        y = ay;
        poser(x, y, ALPHABET[0]);
      }

      // ---- La queue suit le A (le 0.91.5) ----
      // Le A a-t-il bougé ? Sa place n'est plus celle d'avant (ax, ay).
      // longueur > 0 d'abord (le 0.91.6). Sans queue, rien à déplacer, et
      // longueur - 1 vaudrait 255 (un uint8_t ne descend pas sous 0).
      // && veut dire « ET » : il faut une queue ET que le A ait bougé.
      if (longueur > 0 && (x != ax || y != ay)) {
        // 1. le BOUT de la queue disparaît : la dernière case, longueur - 1
        effacer(qx[longueur - 1], qy[longueur - 1], 1);

        // ---- 2. chaque case prend la place de celle de devant ----
        // En partant du BOUT, et en reculant (i-- : i = i - 1).
        // Avec longueur = 3 :  i = 2 : qx[2] = qx[1]
        //                      i = 1 : qx[1] = qx[0]
        //                      i = 0 : 0 > 0 est faux, la boucle s'arrête.
        for (uint8_t i = longueur - 1; i > 0; i--) {
          qx[i] = qx[i - 1];
          qy[i] = qy[i - 1];
        }

        // 3. la première case prend la case que le A vient de quitter
        qx[0] = ax;
        qy[0] = ay;

        // 4. toute la queue redessinée, de la case 0 à la case longueur - 1
        //    (après une pièce, la nouvelle case venait d'être effacée avec le bout)
        for (uint8_t i = 0; i < longueur; i++) {
          poser(qx[i], qy[i], ALPHABET[14]);
        }
        poser(x, y, ALPHABET[0]);              // 5. le A par-dessus (le 0.91.5)
      }
      if (x == px && y == py) {                // le A sur le P : ramassée (le 0.81)
        score = score + 1;

        // ---- La pièce réapparaît AU HASARD, mais DANS le cadre (le 0.91.4) ----
        //
        //   px = 1 + hasard() % 18;
        //        |   |        |
        //        |   |        +-- % 18 : le reste de la division par 18, de 0 à 17.
        //        |   |            Exemple : hasard() rend 137 ; 137 = 7 × 18 + 11 ;
        //        |   |            le reste est 11.
        //        |   +----------- un nombre imprévisible, de 0 à 255 (le 0.81.2)
        //        +--------------- + 1 : on décale de 0…17 à 1…18 → 11 + 1 = 12.
        //
        // Pourquoi pas % 20 comme au 0.81.2 ? Les colonnes 0 et 19 sont des murs X :
        // la pièce doit rester de 1 à 18. Les lignes 0 et 16 aussi sont des murs :
        // la pièce doit rester de 1 à 15, d'où 1 + hasard() % 15.
        px = 1 + hasard() % 18;                // une colonne : 1 à 18
        py = 1 + hasard() % 15;                // une ligne : 1 à 15
        poser(px, py, ALPHABET[15]);           // le nouveau P apparaît là

        // ---- La queue grandit d'une case (le 0.91.6) ----
        // La nouvelle case naît SUR le bout de la queue. Au prochain pas, toutes
        // les autres avancent, elle non : elle reste derrière.
        // La toute première n'a pas de bout : elle naît SOUS le A.
        // < 50 : le tableau n'a que 50 cases, qx[0] à qx[49].
        if (longueur < 50) {
          if (longueur == 0) {
            qx[0] = x;                         // la première case : sous le A
            qy[0] = y;
          } else {
            qx[longueur] = qx[longueur - 1];   // la case d'après le bout…
            qy[longueur] = qy[longueur - 1];   // …à la même place que le bout
          }
          longueur = longueur + 1;             // une case de plus
        }
      }
      nombre(6, 17, score);
      nombre(17, 17, temps);
    }

    if (ecran == 1 && chaque(1000)) {
      temps = temps - 1;
      if (temps == 0) {
        ecran = 2;
        viderEcran();
        texte(8, 6, "FIN");
        texte(5, 9, "SCORE");         // le score de la partie (le 0.91.2)
        nombre(11, 9, score);
        texte(2, 13, "START : REJOUER");
      }
    }

    // ---- Sur la fin, START relance une partie (le 0.91.2).
    if (ecran == 2 && bouton(START)) {
      nouvellePartie();               // la même fonction : tout au départ
    }
  }
}
`,
    aVoir: 'START : le A part tout seul vers la droite ; un appui sur la croix change sa direction, et il continue sans s’arrêter.',
    controle: (c) => {
      c.avancer(10)
      c.presser('start', 6)
      c.avancer(5)
      const x0 = c.variable('x')
      c.avancer(60)
      const x1 = c.variable('x')
      const seul = x1 > x0 && c.variable('y') === 8
      c.presser('down', 3)
      c.avancer(60)
      const x2 = c.variable('x'), y2 = c.variable('y')
      const bas = c.variable('sens') === 1 && y2 > 8 && x2 === x1 && c.mot(x2, y2, 1) === 'A'
      return [
        ['sans rien toucher, le A avance à droite', seul, ` (x : ${x0} → ${x1})`],
        ['un appui court sur BAS : il descend, et continue tout seul', bas, ` (x = ${x2}, y = ${y2})`],
      ]
    },
  },

  {
    titre: 'Le snake — le mur fait perdre',
    difficulte: 0,
    suite: true,
    idee: 'Le 0.91.7, mais toucher le cadre de X arrête la partie : l’écran FIN, comme quand le temps est écoulé. Une fonction finPartie() pour les deux.',
    texte: [
      '**C’est le 0.91.7, avec une chose en plus : le mur fait perdre.** Avant, le A qui entrait dans un X reculait, et restait collé au mur. Maintenant, **la partie s’arrête** : l’écran FIN, le score, et START pour rejouer. Comme dans un vrai snake : le A avance tout seul, c’est à toi de tourner à temps.',
      '**Deux façons de finir, un seul écran FIN :** le temps écoulé (le 0.91.1), et maintenant le mur. Plutôt que d’écrire l’écran FIN deux fois, on le range dans une fonction, **`finPartie()`**, comme `nouvellePartie()` au 0.91.2. Elle met `ecran` à 2, vide l’écran et écrit FIN, le score et « START : REJOUER ». Le chronomètre l’appelle quand `temps` arrive à 0 ; le mur aussi.',
      '**Le test du mur ne change pas :** `x == 0 || x == 19 || y == 0 || y >= 16` (le 0.91.3), vrai dès que le A est sur une colonne ou une ligne du cadre. Ce qui change, c’est ce qu’on fait : plus de recul, plus de X à reposer (l’écran va être vidé), juste `finPartie();`.',
      '**Ce qui est nouveau ici : `continue;`.** Il saute **tout le reste du tour** de la boucle `while (true)`, et repart au début : à `image()`. Pourquoi ? Juste après le mur, la suite de ce tour ferait encore bouger la queue, redessiner le A, tester le P et écrire le score en bas… **par-dessus** l’écran FIN, qu’on vient d’écrire. Avec `continue;`, rien de tout ça n’arrive.',
      '**Au tour suivant,** `ecran` vaut 2 : le bloc `if (ecran == 1)` ne se fait plus, le A ne bouge plus. Seul reste `if (ecran == 2 && bouton(START))` : START relance une partie, avec `nouvellePartie()` (le 0.91.2).',
      '**Déroulons, sans rien toucher :** le A part de (5, 8) vers la droite. Il passe sur le P en (15, 8) : score 1, une case de queue. Il continue… (18, 8)… puis (19, 8) : colonne 19, le mur. `finPartie()` : FIN, SCORE 001. `continue;` : on repart à `image()`.',
      '**Pour plus tard :** le A peut encore faire demi-tour sur sa queue, et la traverser sans perdre.',
    ],
    code: `uint8_t ecran = 0;        // 0 = le TITRE, 1 = le JEU, 2 = la FIN

uint8_t x = 5;            // le A : sa colonne…
uint8_t y = 8;            // …et sa ligne (le 0.81)
uint8_t px = 15;          // la pièce, le P : sa colonne…
uint8_t py = 8;           // …et sa ligne
uint8_t score = 0;        // les pièces ramassées
uint8_t temps = 30;       // les secondes qui restent
uint8_t ax = 5;           // la place du A AVANT son pas… (le 0.91.3)
uint8_t ay = 8;           // …pour l'y remettre s'il entre dans un mur
uint8_t qx[50];           // la queue (le 0.91.6), un TABLEAU de 50 cases O : les colonnes…
uint8_t qy[50];           // …et les lignes. qx[0] : la case collée au A.
uint8_t longueur = 0;     // combien de cases la queue utilise (0 : le A seul)
uint8_t sens = 0;         // où va le A (le 0.91.7). 0 = droite, 1 = bas, 2 = gauche, 3 = haut

void viderEcran() {
  for (uint8_t l = 0; l < 18; l++) {
    effacer(0, l, 20);
  }
}

// ---- Une partie qui commence, TOUT au départ (le 0.91.2) ----
// Depuis le titre, ET depuis la fin (START : rejouer).
void nouvellePartie() {
  x = 5;                          // le A revient à sa place
  y = 8;
  px = 15;                        // le P revient en (15, 8), d'où qu'il soit
  py = 8;
  ax = 5;                         // et sa place d'avant, la même
  ay = 8;
  longueur = 0;                   // pas de queue, le A est tout seul (le 0.91.6)
  sens = 0;                       // le A repart vers la droite (le 0.91.7)
  score = 0;                      // pas encore de pièce
  temps = 30;                     // 30 secondes de nouveau
  ecran = 1;                      // on est sur le JEU
  viderEcran();
  poser(px, py, ALPHABET[15]);
  poser(x, y, ALPHABET[0]);       // le A (le 0.91.7)

  // ---- Le cadre de murs, des X tout autour du terrain (le 0.91.3) ----
  //
  //   colonne : 0 1 2 …           19
  //   ligne 0 : X X X X X X … X X X     le haut : ligne 0, colonnes 0 à 19
  //   ligne 1 : X                 X
  //   …         X   A        P    X     les côtés : colonnes 0 et 19
  //   ligne 15: X                 X
  //   ligne 16: X X X X X X … X X X     le bas : ligne 16
  //   ligne 17: SCORE 000  TEMPS 030    la ligne 17 reste aux nombres
  //
  // ALPHABET[23] : la 24e lettre (on compte depuis 0), le X.
  for (uint8_t c = 0; c < 20; c++) {
    poser(c, 0, ALPHABET[23]);        // le haut
    poser(c, 16, ALPHABET[23]);       // le bas
  }
  for (uint8_t l = 1; l < 16; l++) {
    poser(0, l, ALPHABET[23]);        // le côté gauche
    poser(19, l, ALPHABET[23]);       // le côté droit
  }

  texte(0, 17, "SCORE");
  texte(11, 17, "TEMPS");
}

// ---- NOUVEAU : une partie qui s'arrête, l'écran FIN ----
// Deux raisons de perdre : le temps est écoulé, ou le A touche un mur.
// Les deux appellent cette fonction : l'écran FIN n'est écrit qu'une fois.
void finPartie() {
  ecran = 2;                      // on est sur la FIN
  viderEcran();
  texte(8, 6, "FIN");
  texte(5, 9, "SCORE");           // le score de la partie (le 0.91.2)
  nombre(11, 9, score);
  texte(2, 13, "START : REJOUER");
}

int main() {
  couleurTexte(31, 16, 0);
  texteGrand(4, 5, "JEU", 4);
  texte(2, 12, "APPUIE SUR START");

  while (true) {
    image();

    if (ecran == 0 && bouton(START)) {
      nouvellePartie();               // la première partie
    }

    if (ecran == 1) {
      // ---- La croix CHOISIT la direction (le 0.91.7) ----
      // On appuie une fois, même très court : sens change, et il le reste.
      if (bouton(DROITE)) sens = 0;
      if (bouton(BAS))    sens = 1;
      if (bouton(GAUCHE)) sens = 2;
      if (bouton(HAUT))   sens = 3;

      ax = x;                                  // on retient où est le A… (le 0.91.3)
      ay = y;

      // ---- Le A avance TOUT SEUL, un pas toutes les 250 ms (le 0.91.7) ----
      // chaque(250) : vrai 4 fois par seconde (le 0.77). Ce chronomètre-ci
      // n'est pas celui de chaque(1000), plus bas : chacun a le sien.
      //
      //   sens :   3
      //            ↑           colonne : x - 1 à gauche, x + 1 à droite
      //        2 ← A → 0       ligne   : y - 1 en haut,  y + 1 en bas
      //            ↓
      //            1
      if (chaque(250)) {
        effacer(x, y, 1);                      // le A quitte sa case
        if (sens == 0) x = x + 1;              // à droite
        if (sens == 1) y = y + 1;              // en bas
        if (sens == 2) x = x - 1;              // à gauche
        if (sens == 3) y = y - 1;              // en haut
        poser(x, y, ALPHABET[0]);              // et se pose sur la suivante
      }

      // ---- NOUVEAU : le A touche le cadre ? La partie s'arrête ----
      // Avant (le 0.91.3), le A reculait. Maintenant, il a PERDU.
      // || veut dire « OU » : une seule des quatre suffit.
      if (x == 0 || x == 19 || y == 0 || y >= 16) {
        finPartie();                           // l'écran FIN, avec le score
        continue;                              // on saute TOUT le reste de ce tour
      }                                        // de boucle : retour à image()

      // ---- La queue suit le A (le 0.91.5) ----
      // Le A a-t-il bougé ? Sa place n'est plus celle d'avant (ax, ay).
      // longueur > 0 d'abord (le 0.91.6). Sans queue, rien à déplacer, et
      // longueur - 1 vaudrait 255 (un uint8_t ne descend pas sous 0).
      // && veut dire « ET » : il faut une queue ET que le A ait bougé.
      if (longueur > 0 && (x != ax || y != ay)) {
        // 1. le BOUT de la queue disparaît : la dernière case, longueur - 1
        effacer(qx[longueur - 1], qy[longueur - 1], 1);

        // ---- 2. chaque case prend la place de celle de devant ----
        // En partant du BOUT, et en reculant (i-- : i = i - 1).
        // Avec longueur = 3 :  i = 2 : qx[2] = qx[1]
        //                      i = 1 : qx[1] = qx[0]
        //                      i = 0 : 0 > 0 est faux, la boucle s'arrête.
        for (uint8_t i = longueur - 1; i > 0; i--) {
          qx[i] = qx[i - 1];
          qy[i] = qy[i - 1];
        }

        // 3. la première case prend la case que le A vient de quitter
        qx[0] = ax;
        qy[0] = ay;

        // 4. toute la queue redessinée, de la case 0 à la case longueur - 1
        //    (après une pièce, la nouvelle case venait d'être effacée avec le bout)
        for (uint8_t i = 0; i < longueur; i++) {
          poser(qx[i], qy[i], ALPHABET[14]);
        }
        poser(x, y, ALPHABET[0]);              // 5. le A par-dessus (le 0.91.5)
      }
      if (x == px && y == py) {                // le A sur le P : ramassée (le 0.81)
        score = score + 1;

        // ---- La pièce réapparaît AU HASARD, mais DANS le cadre (le 0.91.4) ----
        //
        //   px = 1 + hasard() % 18;
        //        |   |        |
        //        |   |        +-- % 18 : le reste de la division par 18, de 0 à 17.
        //        |   |            Exemple : hasard() rend 137 ; 137 = 7 × 18 + 11 ;
        //        |   |            le reste est 11.
        //        |   +----------- un nombre imprévisible, de 0 à 255 (le 0.81.2)
        //        +--------------- + 1 : on décale de 0…17 à 1…18 → 11 + 1 = 12.
        //
        // Pourquoi pas % 20 comme au 0.81.2 ? Les colonnes 0 et 19 sont des murs X :
        // la pièce doit rester de 1 à 18. Les lignes 0 et 16 aussi sont des murs :
        // la pièce doit rester de 1 à 15, d'où 1 + hasard() % 15.
        px = 1 + hasard() % 18;                // une colonne : 1 à 18
        py = 1 + hasard() % 15;                // une ligne : 1 à 15
        poser(px, py, ALPHABET[15]);           // le nouveau P apparaît là

        // ---- La queue grandit d'une case (le 0.91.6) ----
        // La nouvelle case naît SUR le bout de la queue. Au prochain pas, toutes
        // les autres avancent, elle non : elle reste derrière.
        // La toute première n'a pas de bout : elle naît SOUS le A.
        // < 50 : le tableau n'a que 50 cases, qx[0] à qx[49].
        if (longueur < 50) {
          if (longueur == 0) {
            qx[0] = x;                         // la première case : sous le A
            qy[0] = y;
          } else {
            qx[longueur] = qx[longueur - 1];   // la case d'après le bout…
            qy[longueur] = qy[longueur - 1];   // …à la même place que le bout
          }
          longueur = longueur + 1;             // une case de plus
        }
      }
      nombre(6, 17, score);
      nombre(17, 17, temps);
    }

    if (ecran == 1 && chaque(1000)) {
      temps = temps - 1;
      if (temps == 0) {
        finPartie();                  // NOUVEAU : la même fonction que pour le mur
      }
    }

    // ---- Sur la fin, START relance une partie (le 0.91.2).
    if (ecran == 2 && bouton(START)) {
      nouvellePartie();               // la même fonction : tout au départ
    }
  }
}
`,
    aVoir: 'START : le A file tout seul ; s’il touche le cadre de X, la partie s’arrête sur FIN et le score. START : on rejoue.',
    controle: (c) => {
      c.avancer(10)
      c.presser('start', 6)
      c.avancer(5)
      c.avancer(280)
      const ecran = c.variable('ecran')
      const fin = ecran === 2 && c.mot(8, 6, 3) === 'FIN' && c.mot(11, 9, 3) === '001'
      const propre = c.mot(0, 17, 20).trim() === '' && c.mot(0, 8, 20).trim() === ''
      c.presser('start', 6)
      c.avancer(10)
      return [
        ['sans rien toucher, le A va au mur : FIN, SCORE 001', fin, ` (ecran = ${ecran})`],
        ['rien n’est dessiné par-dessus l’écran FIN', propre],
        ['START : une nouvelle partie', c.variable('ecran') === 1 && c.variable('score') === 0 && c.variable('longueur') === 0],
      ]
    },
  },

  {
    titre: 'Le snake — sans limite de temps',
    difficulte: 0,
    suite: true,
    idee: 'Le 0.91.8, sans le chronomètre : plus de 30 secondes, plus de TEMPS. La partie dure tant que le A ne touche pas un mur.',
    texte: [
      '**C’est le 0.91.8, avec une chose en moins : le temps.** Plus de 30 secondes, plus de TEMPS en bas à droite. La partie dure **tant que le A ne touche pas un mur**. C’est la règle d’un vrai snake : on joue jusqu’à perdre.',
      '**Ce qui change ici : on enlève, on n’ajoute rien.** Tout ce que le 0.91.1 avait mis pour le temps s’en va, morceau par morceau :',
      '• la variable **`temps`** (`uint8_t temps = 30;`), et sa remise à 30 dans `nouvellePartie()` ;',
      '• le mot **TEMPS** (`texte(11, 17, "TEMPS")`) et son nombre (`nombre(17, 17, temps)`), sur la ligne 17 ;',
      '• le bloc du **chronomètre**, `if (ecran == 1 && chaque(1000)) { … }`, qui retirait une seconde et appelait `finPartie()` à 0.',
      '**Enlever, c’est aussi de la programmation :** si l’on oubliait une seule de ces lignes, par exemple `nombre(17, 17, temps)` en gardant la variable effacée, le compilateur dirait que `temps` n’existe pas. Chaque ligne qui parlait du temps doit partir avec lui.',
      '**`finPartie()` reste,** mais n’a plus qu’une raison d’être appelée : le mur (le 0.91.8). La fonction ne change pas : elle écrit toujours FIN, le score et « START : REJOUER ».',
      '**`chaque(250)`, lui, reste :** c’est lui qui fait avancer le A (le 0.91.7). Il n’avait rien à voir avec le chronomètre ; chaque `chaque()` a son propre chronomètre.',
      '**Pour plus tard :** le A peut encore faire demi-tour sur sa queue, et la traverser sans perdre. Sans limite de temps, c’est maintenant le seul vrai défaut du jeu.',
    ],
    code: `uint8_t ecran = 0;        // 0 = le TITRE, 1 = le JEU, 2 = la FIN

uint8_t x = 5;            // le A : sa colonne…
uint8_t y = 8;            // …et sa ligne (le 0.81)
uint8_t px = 15;          // la pièce, le P : sa colonne…
uint8_t py = 8;           // …et sa ligne
uint8_t score = 0;        // les pièces ramassées
uint8_t ax = 5;           // la place du A AVANT son pas… (le 0.91.3)
uint8_t ay = 8;           // …pour l'y remettre s'il entre dans un mur
uint8_t qx[50];           // la queue (le 0.91.6), un TABLEAU de 50 cases O : les colonnes…
uint8_t qy[50];           // …et les lignes. qx[0] : la case collée au A.
uint8_t longueur = 0;     // combien de cases la queue utilise (0 : le A seul)
uint8_t sens = 0;         // où va le A (le 0.91.7). 0 = droite, 1 = bas, 2 = gauche, 3 = haut

void viderEcran() {
  for (uint8_t l = 0; l < 18; l++) {
    effacer(0, l, 20);
  }
}

// ---- Une partie qui commence, TOUT au départ (le 0.91.2) ----
// Depuis le titre, ET depuis la fin (START : rejouer).
void nouvellePartie() {
  x = 5;                          // le A revient à sa place
  y = 8;
  px = 15;                        // le P revient en (15, 8), d'où qu'il soit
  py = 8;
  ax = 5;                         // et sa place d'avant, la même
  ay = 8;
  longueur = 0;                   // pas de queue, le A est tout seul (le 0.91.6)
  sens = 0;                       // le A repart vers la droite (le 0.91.7)
  score = 0;                      // pas encore de pièce
  ecran = 1;                      // on est sur le JEU
  viderEcran();
  poser(px, py, ALPHABET[15]);
  poser(x, y, ALPHABET[0]);       // le A (le 0.91.7)

  // ---- Le cadre de murs, des X tout autour du terrain (le 0.91.3) ----
  //
  //   colonne : 0 1 2 …           19
  //   ligne 0 : X X X X X X … X X X     le haut : ligne 0, colonnes 0 à 19
  //   ligne 1 : X                 X
  //   …         X   A        P    X     les côtés : colonnes 0 et 19
  //   ligne 15: X                 X
  //   ligne 16: X X X X X X … X X X     le bas : ligne 16
  //   ligne 17: SCORE 000               la ligne 17 reste au score
  //
  // ALPHABET[23] : la 24e lettre (on compte depuis 0), le X.
  for (uint8_t c = 0; c < 20; c++) {
    poser(c, 0, ALPHABET[23]);        // le haut
    poser(c, 16, ALPHABET[23]);       // le bas
  }
  for (uint8_t l = 1; l < 16; l++) {
    poser(0, l, ALPHABET[23]);        // le côté gauche
    poser(19, l, ALPHABET[23]);       // le côté droit
  }

  texte(0, 17, "SCORE");         // NOUVEAU : plus de TEMPS à côté
}

// ---- Une partie qui s'arrête, l'écran FIN (le 0.91.8) ----
// NOUVEAU : une seule raison de perdre maintenant, le mur.
void finPartie() {
  ecran = 2;                      // on est sur la FIN
  viderEcran();
  texte(8, 6, "FIN");
  texte(5, 9, "SCORE");           // le score de la partie (le 0.91.2)
  nombre(11, 9, score);
  texte(2, 13, "START : REJOUER");
}

int main() {
  couleurTexte(31, 16, 0);
  texteGrand(4, 5, "JEU", 4);
  texte(2, 12, "APPUIE SUR START");

  while (true) {
    image();

    if (ecran == 0 && bouton(START)) {
      nouvellePartie();               // la première partie
    }

    if (ecran == 1) {
      // ---- La croix CHOISIT la direction (le 0.91.7) ----
      // On appuie une fois, même très court : sens change, et il le reste.
      if (bouton(DROITE)) sens = 0;
      if (bouton(BAS))    sens = 1;
      if (bouton(GAUCHE)) sens = 2;
      if (bouton(HAUT))   sens = 3;

      ax = x;                                  // on retient où est le A… (le 0.91.3)
      ay = y;

      // ---- Le A avance TOUT SEUL, un pas toutes les 250 ms (le 0.91.7) ----
      // chaque(250) : vrai 4 fois par seconde (le 0.77).
      //
      //   sens :   3
      //            ↑           colonne : x - 1 à gauche, x + 1 à droite
      //        2 ← A → 0       ligne   : y - 1 en haut,  y + 1 en bas
      //            ↓
      //            1
      if (chaque(250)) {
        effacer(x, y, 1);                      // le A quitte sa case
        if (sens == 0) x = x + 1;              // à droite
        if (sens == 1) y = y + 1;              // en bas
        if (sens == 2) x = x - 1;              // à gauche
        if (sens == 3) y = y - 1;              // en haut
        poser(x, y, ALPHABET[0]);              // et se pose sur la suivante
      }

      // ---- Le A touche le cadre ? La partie s'arrête (le 0.91.8) ----
      // Avant (le 0.91.3), le A reculait. Maintenant, il a PERDU.
      // || veut dire « OU » : une seule des quatre suffit.
      if (x == 0 || x == 19 || y == 0 || y >= 16) {
        finPartie();                           // l'écran FIN, avec le score
        continue;                              // on saute TOUT le reste de ce tour
      }                                        // de boucle : retour à image()

      // ---- La queue suit le A (le 0.91.5) ----
      // Le A a-t-il bougé ? Sa place n'est plus celle d'avant (ax, ay).
      // longueur > 0 d'abord (le 0.91.6). Sans queue, rien à déplacer, et
      // longueur - 1 vaudrait 255 (un uint8_t ne descend pas sous 0).
      // && veut dire « ET » : il faut une queue ET que le A ait bougé.
      if (longueur > 0 && (x != ax || y != ay)) {
        // 1. le BOUT de la queue disparaît : la dernière case, longueur - 1
        effacer(qx[longueur - 1], qy[longueur - 1], 1);

        // ---- 2. chaque case prend la place de celle de devant ----
        // En partant du BOUT, et en reculant (i-- : i = i - 1).
        // Avec longueur = 3 :  i = 2 : qx[2] = qx[1]
        //                      i = 1 : qx[1] = qx[0]
        //                      i = 0 : 0 > 0 est faux, la boucle s'arrête.
        for (uint8_t i = longueur - 1; i > 0; i--) {
          qx[i] = qx[i - 1];
          qy[i] = qy[i - 1];
        }

        // 3. la première case prend la case que le A vient de quitter
        qx[0] = ax;
        qy[0] = ay;

        // 4. toute la queue redessinée, de la case 0 à la case longueur - 1
        //    (après une pièce, la nouvelle case venait d'être effacée avec le bout)
        for (uint8_t i = 0; i < longueur; i++) {
          poser(qx[i], qy[i], ALPHABET[14]);
        }
        poser(x, y, ALPHABET[0]);              // 5. le A par-dessus (le 0.91.5)
      }
      if (x == px && y == py) {                // le A sur le P : ramassée (le 0.81)
        score = score + 1;

        // ---- La pièce réapparaît AU HASARD, mais DANS le cadre (le 0.91.4) ----
        //
        //   px = 1 + hasard() % 18;
        //        |   |        |
        //        |   |        +-- % 18 : le reste de la division par 18, de 0 à 17.
        //        |   |            Exemple : hasard() rend 137 ; 137 = 7 × 18 + 11 ;
        //        |   |            le reste est 11.
        //        |   +----------- un nombre imprévisible, de 0 à 255 (le 0.81.2)
        //        +--------------- + 1 : on décale de 0…17 à 1…18 → 11 + 1 = 12.
        //
        // Pourquoi pas % 20 comme au 0.81.2 ? Les colonnes 0 et 19 sont des murs X :
        // la pièce doit rester de 1 à 18. Les lignes 0 et 16 aussi sont des murs :
        // la pièce doit rester de 1 à 15, d'où 1 + hasard() % 15.
        px = 1 + hasard() % 18;                // une colonne : 1 à 18
        py = 1 + hasard() % 15;                // une ligne : 1 à 15
        poser(px, py, ALPHABET[15]);           // le nouveau P apparaît là

        // ---- La queue grandit d'une case (le 0.91.6) ----
        // La nouvelle case naît SUR le bout de la queue. Au prochain pas, toutes
        // les autres avancent, elle non : elle reste derrière.
        // La toute première n'a pas de bout : elle naît SOUS le A.
        // < 50 : le tableau n'a que 50 cases, qx[0] à qx[49].
        if (longueur < 50) {
          if (longueur == 0) {
            qx[0] = x;                         // la première case : sous le A
            qy[0] = y;
          } else {
            qx[longueur] = qx[longueur - 1];   // la case d'après le bout…
            qy[longueur] = qy[longueur - 1];   // …à la même place que le bout
          }
          longueur = longueur + 1;             // une case de plus
        }
      }
      nombre(6, 17, score);
    }

    // NOUVEAU : ici, il y avait le chronomètre, chaque(1000). Il n'y est plus :
    // la partie dure tant que le A ne touche pas un mur.

    // ---- Sur la fin, START relance une partie (le 0.91.2).
    if (ecran == 2 && bouton(START)) {
      nouvellePartie();               // la même fonction : tout au départ
    }
  }
}
`,
    aVoir: 'START : plus de TEMPS en bas ; le A file tout seul, aussi longtemps qu’il évite les murs.',
    controle: (c) => {
      c.avancer(10)
      c.presser('start', 6)
      c.avancer(5)
      const bas = c.mot(0, 17, 20)
      // de (5, 8), vers la droite, puis en bas, à gauche, en haut… : un tour
      // du terrain qui ne touche jamais le cadre, plus long que 30 secondes
      const tour = [['down', 90], ['left', 90], ['up', 90], ['right', 90]]
      c.avancer(60)
      let t = 60
      while (t < 2100) {
        for (const [b, n] of tour) { c.presser(b, 3); c.avancer(n - 3); t += n }
      }
      const vivant = c.variable('ecran') === 1
      return [
        ['en bas, SCORE seul, plus de TEMPS', bas.startsWith('SCORE') && !bas.includes('TEMPS'), ` (« ${bas.trim()} »)`],
        ['après plus de 30 secondes, la partie continue', vivant, ` (ecran = ${c.variable('ecran')})`],
      ]
    },
  },

  {
    titre: 'Le snake, avec un menu — la couleur du serpent',
    difficulte: 0,
    idee: 'Le jeu du 0.91.9, et un MENU entre le titre et la partie : GAUCHE et DROITE choisissent la couleur du serpent, A lance la partie.',
    texte: [
      '**C’est le jeu du 0.91.9 (le snake sans limite de temps), avec une chose en plus : un menu.** Après le titre, START n’ouvre plus directement la partie : il ouvre le **MENU**. On y choisit la **couleur du serpent** avec GAUCHE et DROITE, puis **A** lance la partie. À la fin, START ramène au menu : on peut changer de couleur avant de rejouer.',
      '**Un quatrième écran :** `ecran` valait 0 (titre), 1 (jeu) ou 2 (fin) ; il vaut maintenant aussi **3, le MENU**. La fonction `ouvrirMenu()` le dessine, comme `nouvellePartie()` dessine le jeu et `finPartie()` la fin.',
      '**Ce qui est nouveau ici : colorer le serpent, et lui seul.** `couleurTexte()` colore **toutes** les lettres : les X et le P changeraient aussi. On se sert donc des **palettes** du 0.89 : le serpent va dans la **palette 1**, tout le reste reste dans la palette 0. Après chaque `poser()` du A ou d’un O, un `teindre(colonne, ligne, 1)` (le 0.89.1) met cette case dans la palette 1.',
      '**Changer de couleur, c’est changer la palette, pas les cases.** `couleurFond(1, 3, rouge, vert, bleu)` change la **teinte 3** de la palette 1, celle des lettres (le 0.89). Toutes les cases de la palette 1 prennent la nouvelle couleur **d’un coup**, sans rien redessiner. C’est ce que fait `choisirCouleur()` : un `if` par couleur, et le nom de la couleur écrit dans le menu.',
      '**La couleur est un numéro :** `uint8_t couleur = 0;` 0 = vert, 1 = rouge, 2 = bleu, 3 = violet. Comme `sens` au 0.91.7 : on retient un numéro, et des `if` disent ce qu’il veut dire.',
      '**Les noms ont des espaces derrière :** `"VERT  "`, `"ROUGE "`, `"VIOLET"` ont tous 6 cases. Si l’on passait de VIOLET à VERT sans espaces, il resterait « VERTET » : les 2 dernières lettres de VIOLET : on efface avec des espaces, comme au chapitre 1.',
      '**DROITE : la couleur suivante.** `couleur = (couleur + 1) % 4;` : 0 → 1 → 2 → 3, puis 3 + 1 = 4, et 4 % 4 = **0** : on revient au vert (le `%` du 0.9).',
      '**GAUCHE : la couleur d’avant.** On voudrait `couleur - 1`, mais un `uint8_t` ne descend pas sous 0 : 0 - 1 donnerait 255 (le 0.91.6). L’astuce : **`(couleur + 3) % 4`**. Ajouter 3 puis garder le reste par 4, c’est reculer d’un. 2 : (2 + 3) % 4 = 5 % 4 = **1**. 0 : (0 + 3) % 4 = **3**, le violet.',
      '**`chaque(200)` dans le menu :** un appui sur la croix dure plusieurs images. Si l’on regardait la croix à chaque image, un seul appui ferait tourner toutes les couleurs. On ne la regarde donc que 5 fois par seconde. Ce `chaque(200)` a son chronomètre à lui : il ne gêne pas le `chaque(250)` du serpent.',
      '**Le petit serpent du menu :** trois O et un A, en (8, 9) à (11, 9), dans la palette 1. En changeant de couleur, on le voit changer tout de suite.',
      '**Deux précautions, parce qu’une case garde sa palette :** `effacer()` enlève la **lettre**, pas la **palette** de la case. 1. `viderEcran()` remet toutes les cases dans la palette 0 (une boucle de plus, sur les 20 colonnes) : sinon, FIN ou MENU seraient à moitié de la couleur du serpent. 2. Quand le P réapparaît au hasard, `teindre(px, py, 0)` : la case a pu être celle du serpent.',
    ],
    code: `uint8_t ecran = 0;        // 0 = le TITRE, 1 = le JEU, 2 = la FIN, 3 = le MENU (NOUVEAU)

uint8_t x = 5;            // le A : sa colonne…
uint8_t y = 8;            // …et sa ligne (le 0.81)
uint8_t px = 15;          // la pièce, le P : sa colonne…
uint8_t py = 8;           // …et sa ligne
uint8_t score = 0;        // les pièces ramassées
uint8_t ax = 5;           // la place du A AVANT son pas… (le 0.91.3)
uint8_t ay = 8;           // …pour l'y remettre s'il entre dans un mur
uint8_t qx[50];           // la queue (le 0.91.6), un TABLEAU de 50 cases O : les colonnes…
uint8_t qy[50];           // …et les lignes. qx[0] : la case collée au A.
uint8_t longueur = 0;     // combien de cases la queue utilise (0 : le A seul)
uint8_t sens = 0;         // où va le A (le 0.91.7). 0 = droite, 1 = bas, 2 = gauche, 3 = haut
uint8_t couleur = 0;      // NOUVEAU : la couleur du serpent. 0 = vert, 1 = rouge, 2 = bleu, 3 = violet

void viderEcran() {
  for (uint8_t l = 0; l < 18; l++) {
    effacer(0, l, 20);
    // NOUVEAU : chaque case de la ligne revient dans la palette 0.
    // effacer() enlève la lettre, pas la palette de la case : sans ça,
    // le FIN et le MENU seraient en partie de la couleur du serpent.
    for (uint8_t c = 0; c < 20; c++) {
      teindre(c, l, 0);
    }
  }
}

// ---- Une partie qui commence, TOUT au départ (le 0.91.2) ----
// Depuis le titre, ET depuis la fin (START : rejouer).
void nouvellePartie() {
  x = 5;                          // le A revient à sa place
  y = 8;
  px = 15;                        // le P revient en (15, 8), d'où qu'il soit
  py = 8;
  ax = 5;                         // et sa place d'avant, la même
  ay = 8;
  longueur = 0;                   // pas de queue, le A est tout seul (le 0.91.6)
  sens = 0;                       // le A repart vers la droite (le 0.91.7)
  score = 0;                      // pas encore de pièce
  ecran = 1;                      // on est sur le JEU
  viderEcran();
  poser(px, py, ALPHABET[15]);
  poser(x, y, ALPHABET[0]);       // le A (le 0.91.7)…
  teindre(x, y, 1);               // NOUVEAU : …dans la palette 1, celle du serpent

  // ---- Le cadre de murs, des X tout autour du terrain (le 0.91.3) ----
  //
  //   colonne : 0 1 2 …           19
  //   ligne 0 : X X X X X X … X X X     le haut : ligne 0, colonnes 0 à 19
  //   ligne 1 : X                 X
  //   …         X   A        P    X     les côtés : colonnes 0 et 19
  //   ligne 15: X                 X
  //   ligne 16: X X X X X X … X X X     le bas : ligne 16
  //   ligne 17: SCORE 000               la ligne 17 reste au score
  //
  // ALPHABET[23] : la 24e lettre (on compte depuis 0), le X.
  for (uint8_t c = 0; c < 20; c++) {
    poser(c, 0, ALPHABET[23]);        // le haut
    poser(c, 16, ALPHABET[23]);       // le bas
  }
  for (uint8_t l = 1; l < 16; l++) {
    poser(0, l, ALPHABET[23]);        // le côté gauche
    poser(19, l, ALPHABET[23]);       // le côté droit
  }

  texte(0, 17, "SCORE");         // plus de TEMPS à côté (le 0.91.9)
}

// ---- Une partie qui s'arrête, l'écran FIN (le 0.91.8) ----
// Une seule raison de perdre : le mur (le 0.91.9).
void finPartie() {
  ecran = 2;                      // on est sur la FIN
  viderEcran();
  texte(8, 6, "FIN");
  texte(5, 9, "SCORE");           // le score de la partie (le 0.91.2)
  nombre(11, 9, score);
  texte(2, 13, "START : LE MENU"); // NOUVEAU : on repasse par le menu
}

// ---- NOUVEAU : la couleur du serpent ----
// Le serpent (le A et ses O) est dans la PALETTE 1 (teindre, le 0.89.1).
// Changer la couleur, c'est changer la teinte 3 de la palette 1 (celle des
// lettres) : TOUTES les cases de la palette 1 changent d'un coup.
// Et on écrit le nom de la couleur dans le menu, avec des espaces derrière
// pour recouvrir un nom plus long (VIOLET a 6 lettres, VERT n'en a que 4).
void choisirCouleur() {
  if (couleur == 0) {
    couleurFond(1, 3, 0, 24, 0);      // rouge 0, vert 24, bleu 0 : VERT
    texte(11, 6, "VERT  ");
  }
  if (couleur == 1) {
    couleurFond(1, 3, 31, 0, 0);      // tout rouge : ROUGE
    texte(11, 6, "ROUGE ");
  }
  if (couleur == 2) {
    couleurFond(1, 3, 0, 8, 31);      // surtout du bleu : BLEU
    texte(11, 6, "BLEU  ");
  }
  if (couleur == 3) {
    couleurFond(1, 3, 20, 0, 31);     // bleu + un peu de rouge : VIOLET
    texte(11, 6, "VIOLET");
  }
}

// ---- NOUVEAU : l'écran du MENU ----
//
//   ligne 2 :         MENU
//   ligne 6 :  COULEUR : VERT
//   ligne 9 :         OOOA          un petit serpent, pour voir la couleur
//   ligne 12:   GAUCHE - DROITE
//   ligne 13:  LA COULEUR CHANGE
//   ligne 16:      A : JOUER
void ouvrirMenu() {
  ecran = 3;                          // on est sur le MENU
  viderEcran();
  texte(8, 2, "MENU");
  texte(1, 6, "COULEUR :");

  // le petit serpent d'exemple : trois O et un A, tous dans la palette 1
  for (uint8_t c = 8; c < 11; c++) {
    poser(c, 9, ALPHABET[14]);
    teindre(c, 9, 1);
  }
  poser(11, 9, ALPHABET[0]);
  teindre(11, 9, 1);

  texte(2, 12, "GAUCHE - DROITE");
  texte(1, 13, "LA COULEUR CHANGE");
  texte(5, 16, "A : JOUER");
  choisirCouleur();                   // la couleur choisie, et son nom
}

int main() {
  couleurTexte(31, 16, 0);
  texteGrand(4, 5, "JEU", 4);
  texte(2, 12, "APPUIE SUR START");

  while (true) {
    image();

    if (ecran == 0 && bouton(START)) {
      ouvrirMenu();                   // NOUVEAU : le titre mène au MENU
    }

    // ---- NOUVEAU : dans le MENU, la croix choisit la couleur ----
    // chaque(200) : on ne regarde la croix que 5 fois par seconde. Sans lui,
    // un appui (qui dure plusieurs images) ferait défiler toutes les couleurs.
    if (ecran == 3 && chaque(200)) {
      if (bouton(DROITE)) {
        couleur = (couleur + 1) % 4;  // la suivante : 0 1 2 3, puis 0
        choisirCouleur();
      }
      if (bouton(GAUCHE)) {
        couleur = (couleur + 3) % 4;  // la précédente : 3 2 1 0, puis 3
        choisirCouleur();             // (+ 3 puis % 4 : comme - 1, sans passer sous 0)
      }
    }
    if (ecran == 3 && bouton(A)) {
      nouvellePartie();               // A : on joue, avec cette couleur
    }


    if (ecran == 1) {
      // ---- La croix CHOISIT la direction (le 0.91.7) ----
      // On appuie une fois, même très court : sens change, et il le reste.
      if (bouton(DROITE)) sens = 0;
      if (bouton(BAS))    sens = 1;
      if (bouton(GAUCHE)) sens = 2;
      if (bouton(HAUT))   sens = 3;

      ax = x;                                  // on retient où est le A… (le 0.91.3)
      ay = y;

      // ---- Le A avance TOUT SEUL, un pas toutes les 250 ms (le 0.91.7) ----
      // chaque(250) : vrai 4 fois par seconde (le 0.77).
      //
      //   sens :   3
      //            ↑           colonne : x - 1 à gauche, x + 1 à droite
      //        2 ← A → 0       ligne   : y - 1 en haut,  y + 1 en bas
      //            ↓
      //            1
      if (chaque(250)) {
        effacer(x, y, 1);                      // le A quitte sa case
        if (sens == 0) x = x + 1;              // à droite
        if (sens == 1) y = y + 1;              // en bas
        if (sens == 2) x = x - 1;              // à gauche
        if (sens == 3) y = y - 1;              // en haut
        poser(x, y, ALPHABET[0]);              // et se pose sur la suivante,
        teindre(x, y, 1);                      // NOUVEAU : dans la palette 1
      }

      // ---- Le A touche le cadre ? La partie s'arrête (le 0.91.8) ----
      // Avant (le 0.91.3), le A reculait. Maintenant, il a PERDU.
      // || veut dire « OU » : une seule des quatre suffit.
      if (x == 0 || x == 19 || y == 0 || y >= 16) {
        finPartie();                           // l'écran FIN, avec le score
        continue;                              // on saute TOUT le reste de ce tour
      }                                        // de boucle : retour à image()

      // ---- La queue suit le A (le 0.91.5) ----
      // Le A a-t-il bougé ? Sa place n'est plus celle d'avant (ax, ay).
      // longueur > 0 d'abord (le 0.91.6). Sans queue, rien à déplacer, et
      // longueur - 1 vaudrait 255 (un uint8_t ne descend pas sous 0).
      // && veut dire « ET » : il faut une queue ET que le A ait bougé.
      if (longueur > 0 && (x != ax || y != ay)) {
        // 1. le BOUT de la queue disparaît : la dernière case, longueur - 1
        effacer(qx[longueur - 1], qy[longueur - 1], 1);

        // ---- 2. chaque case prend la place de celle de devant ----
        // En partant du BOUT, et en reculant (i-- : i = i - 1).
        // Avec longueur = 3 :  i = 2 : qx[2] = qx[1]
        //                      i = 1 : qx[1] = qx[0]
        //                      i = 0 : 0 > 0 est faux, la boucle s'arrête.
        for (uint8_t i = longueur - 1; i > 0; i--) {
          qx[i] = qx[i - 1];
          qy[i] = qy[i - 1];
        }

        // 3. la première case prend la case que le A vient de quitter
        qx[0] = ax;
        qy[0] = ay;

        // 4. toute la queue redessinée, de la case 0 à la case longueur - 1
        //    (après une pièce, la nouvelle case venait d'être effacée avec le bout)
        for (uint8_t i = 0; i < longueur; i++) {
          poser(qx[i], qy[i], ALPHABET[14]);
          teindre(qx[i], qy[i], 1);            // NOUVEAU : chaque O dans la palette 1
        }
        poser(x, y, ALPHABET[0]);              // 5. le A par-dessus (le 0.91.5)
        teindre(x, y, 1);
      }
      if (x == px && y == py) {                // le A sur le P : ramassée (le 0.81)
        score = score + 1;

        // ---- La pièce réapparaît AU HASARD, mais DANS le cadre (le 0.91.4) ----
        //
        //   px = 1 + hasard() % 18;
        //        |   |        |
        //        |   |        +-- % 18 : le reste de la division par 18, de 0 à 17.
        //        |   |            Exemple : hasard() rend 137 ; 137 = 7 × 18 + 11 ;
        //        |   |            le reste est 11.
        //        |   +----------- un nombre imprévisible, de 0 à 255 (le 0.81.2)
        //        +--------------- + 1 : on décale de 0…17 à 1…18 → 11 + 1 = 12.
        //
        // Pourquoi pas % 20 comme au 0.81.2 ? Les colonnes 0 et 19 sont des murs X :
        // la pièce doit rester de 1 à 18. Les lignes 0 et 16 aussi sont des murs :
        // la pièce doit rester de 1 à 15, d'où 1 + hasard() % 15.
        px = 1 + hasard() % 18;                // une colonne : 1 à 18
        py = 1 + hasard() % 15;                // une ligne : 1 à 15
        poser(px, py, ALPHABET[15]);           // le nouveau P apparaît là,
        teindre(px, py, 0);                    // NOUVEAU : palette 0. La case a pu être
                                               // au serpent : le P serait de sa couleur.

        // ---- La queue grandit d'une case (le 0.91.6) ----
        // La nouvelle case naît SUR le bout de la queue. Au prochain pas, toutes
        // les autres avancent, elle non : elle reste derrière.
        // La toute première n'a pas de bout : elle naît SOUS le A.
        // < 50 : le tableau n'a que 50 cases, qx[0] à qx[49].
        if (longueur < 50) {
          if (longueur == 0) {
            qx[0] = x;                         // la première case : sous le A
            qy[0] = y;
          } else {
            qx[longueur] = qx[longueur - 1];   // la case d'après le bout…
            qy[longueur] = qy[longueur - 1];   // …à la même place que le bout
          }
          longueur = longueur + 1;             // une case de plus
        }
      }
      nombre(6, 17, score);
    }

    // ---- Sur la fin, START (le 0.91.2) : NOUVEAU, retour au MENU.
    if (ecran == 2 && bouton(START)) {
      ouvrirMenu();                   // on peut changer de couleur avant de rejouer
    }
  }
}
`,
    aVoir: 'START : le MENU ; GAUCHE et DROITE changent la couleur du petit serpent ; A : on joue, le serpent a cette couleur, le reste non.',
    controle: (c) => {
      const coul = (p, t) => { const i = p * 8 + t * 2, v = c.gb.ppu.bgPalettes[i] | (c.gb.ppu.bgPalettes[i + 1] << 8); return [v & 31, (v >> 5) & 31, (v >> 10) & 31].join(',') }
      const pal = (x, y) => c.gb.ppu.vram[0x2000 + 0x1800 + y * 32 + x] & 7
      c.avancer(10)
      c.presser('start', 6)
      c.avancer(20)                     // le menu se dessine en une dizaine d'images
      const menu = c.variable('ecran') === 3 && c.mot(8, 2, 4) === 'MENU' && c.mot(11, 6, 4) === 'VERT' && [8, 9, 10, 11].every((x) => pal(x, 9) === 1)
      c.presser('right', 12)
      c.avancer(3)
      const rouge = c.variable('couleur') === 1 && c.mot(11, 6, 6) === 'ROUGE ' && coul(1, 3) === '31,0,0'
      c.presser('left', 12)
      c.presser('left', 12)
      c.avancer(3)
      const violet = c.variable('couleur') === 3 && c.mot(11, 6, 6) === 'VIOLET'
      c.presser('right', 12)
      c.avancer(3)
      c.presser('a', 3)
      for (let t = 0; t < 400 && c.variable('score') < 1; t++) c.avancer(1)
      c.avancer(20)
      const x = c.variable('x')
      const jeu = c.variable('ecran') === 1 && c.variable('score') === 1 && pal(x, 8) === 1 && pal(x - 1, 8) === 1 && pal(c.variable('px'), c.variable('py')) === 0 && pal(0, 8) === 0
      for (let t = 0; t < 300 && c.variable('ecran') !== 2; t++) c.avancer(1)
      c.avancer(20)
      const fin = c.variable('ecran') === 2 && c.mot(8, 6, 3) === 'FIN' && [15, 16, 17, 18].every((x) => pal(x, 8) === 0)
      return [
        ['START : le MENU, VERT, le petit serpent dans la palette 1', menu],
        ['DROITE : ROUGE, et la palette 1 devient rouge', rouge],
        ['GAUCHE deux fois : de 1 à 0, puis de 0 à 3, VIOLET', violet],
        ['A : le jeu ; le A et sa queue dans la palette 1, le P et les X dans la 0', jeu, ` (x = ${x})`],
        ['au mur : FIN, et plus aucune case dans la palette 1', fin],
        ['le fond de la palette 1 est celui de la palette 0', coul(1, 0) === coul(0, 0), ` (${coul(1, 0)} / ${coul(0, 0)})`],
      ]
    },
  },

  {
    titre: 'Le snake, avec un menu — le pas compté en images',
    difficulte: 0,
    suite: true,
    idee: 'Le 0.92, mais le pas du A n’est plus donné par chaque(250) : on compte les images nous-mêmes, dans compte, jusqu’à attente. Même vitesse — mais attente est une variable.',
    texte: [
      '**C’est le 0.92, écrit d’une autre façon.** À l’écran, **presque rien ne change** : le A fait toujours un pas à peu près tous les quarts de seconde. Ce qui change, c’est **comment** le programme le sait. C’est une autre méthode pour arriver au même résultat.',
      '**Pourquoi changer ce qui marche ?** Pour la leçon suivante : on veut un A qui **accélère**. Or `chaque(250)` ne prend qu’un **nombre écrit en clair** : `chaque(attente)` est refusé, parce que le compilateur traduit 250 ms en images **avant** que le jeu tourne. Il faut donc un temps qu’on peut **changer pendant la partie** : une variable.',
      '**Ce qui est nouveau ici : compter les images soi-même.** `image()` revient **60 fois par seconde** : une image, 1/60 de seconde. Deux variables : **`compte`**, les images passées depuis le dernier pas, et **`attente`**, combien il en faut pour un pas : **15**.',
      '**À chaque image :** `compte = compte + 1;`. Puis `if (compte >= attente)` : si l’on a attendu assez, on remet **`compte = 0;`** et le A fait son pas. **`>=`** veut dire « plus grand ou égal » (le 0.91.3).',
      '**Déroulons :** image 1 : `compte` = 1, pas de pas. Image 2 : 2… Image 15 : `compte` = 15, 15 >= 15 est vrai : **un pas**, et `compte` repart à 0. Image 16 : 1… Image 30 : un pas. Un pas toutes les **15 images**.',
      '**15 images, combien de temps ?** 60 images font une seconde ; 15, c’est un quart : **250 ms**. Ce que donnait `chaque(250)`… presque.',
      '**Pourquoi « presque » ?** `compte` compte les **tours de boucle**, pas le vrai temps. D’habitude, un tour dure une image. Mais le tour où le A fait son pas doit tout redessiner (le A, la queue, les palettes) : il déborde un peu sur l’image suivante. Un pas prend donc 16 images au lieu de 15, environ 267 ms au lieu de 250 : l’œil ne voit pas la différence. `chaque()`, lui, regarde la vraie horloge de la console : il ne prend pas de retard.',
      '**`nouvellePartie()` remet `compte` à 0 :** chaque partie commence par une attente complète.',
      '**Pour la suite :** `attente` est une **variable**. Si elle passe à 14, le A fait un pas toutes les 14 images : un peu plus vite. C’est le 0.92.2.',
    ],
    code: `uint8_t ecran = 0;        // 0 = le TITRE, 1 = le JEU, 2 = la FIN, 3 = le MENU (le 0.92)

uint8_t x = 5;            // le A : sa colonne…
uint8_t y = 8;            // …et sa ligne (le 0.81)
uint8_t px = 15;          // la pièce, le P : sa colonne…
uint8_t py = 8;           // …et sa ligne
uint8_t score = 0;        // les pièces ramassées
uint8_t ax = 5;           // la place du A AVANT son pas… (le 0.91.3)
uint8_t ay = 8;           // …pour l'y remettre s'il entre dans un mur
uint8_t qx[50];           // la queue (le 0.91.6), un TABLEAU de 50 cases O : les colonnes…
uint8_t qy[50];           // …et les lignes. qx[0] : la case collée au A.
uint8_t longueur = 0;     // combien de cases la queue utilise (0 : le A seul)
uint8_t sens = 0;         // où va le A (le 0.91.7). 0 = droite, 1 = bas, 2 = gauche, 3 = haut
uint8_t attente = 15;     // NOUVEAU : combien d'images entre deux pas du A (15 = 250 ms)
uint8_t compte = 0;       // NOUVEAU : les images comptées depuis le dernier pas
uint8_t couleur = 0;      // la couleur du serpent (le 0.92). 0 = vert, 1 = rouge, 2 = bleu, 3 = violet

void viderEcran() {
  for (uint8_t l = 0; l < 18; l++) {
    effacer(0, l, 20);
    // Chaque case de la ligne revient dans la palette 0 (le 0.92).
    // effacer() enlève la lettre, pas la palette de la case : sans ça,
    // le FIN et le MENU seraient en partie de la couleur du serpent.
    for (uint8_t c = 0; c < 20; c++) {
      teindre(c, l, 0);
    }
  }
}

// ---- Une partie qui commence, TOUT au départ (le 0.91.2) ----
// Depuis le titre, ET depuis la fin (START : rejouer).
void nouvellePartie() {
  x = 5;                          // le A revient à sa place
  y = 8;
  px = 15;                        // le P revient en (15, 8), d'où qu'il soit
  py = 8;
  ax = 5;                         // et sa place d'avant, la même
  ay = 8;
  longueur = 0;                   // pas de queue, le A est tout seul (le 0.91.6)
  sens = 0;                       // le A repart vers la droite (le 0.91.7)
  compte = 0;                     // NOUVEAU : on recommence à compter
  score = 0;                      // pas encore de pièce
  ecran = 1;                      // on est sur le JEU
  viderEcran();
  poser(px, py, ALPHABET[15]);
  poser(x, y, ALPHABET[0]);       // le A (le 0.91.7)…
  teindre(x, y, 1);               // …dans la palette 1, celle du serpent (le 0.92)

  // ---- Le cadre de murs, des X tout autour du terrain (le 0.91.3) ----
  //
  //   colonne : 0 1 2 …           19
  //   ligne 0 : X X X X X X … X X X     le haut : ligne 0, colonnes 0 à 19
  //   ligne 1 : X                 X
  //   …         X   A        P    X     les côtés : colonnes 0 et 19
  //   ligne 15: X                 X
  //   ligne 16: X X X X X X … X X X     le bas : ligne 16
  //   ligne 17: SCORE 000               la ligne 17 reste au score
  //
  // ALPHABET[23] : la 24e lettre (on compte depuis 0), le X.
  for (uint8_t c = 0; c < 20; c++) {
    poser(c, 0, ALPHABET[23]);        // le haut
    poser(c, 16, ALPHABET[23]);       // le bas
  }
  for (uint8_t l = 1; l < 16; l++) {
    poser(0, l, ALPHABET[23]);        // le côté gauche
    poser(19, l, ALPHABET[23]);       // le côté droit
  }

  texte(0, 17, "SCORE");         // plus de TEMPS à côté (le 0.91.9)
}

// ---- Une partie qui s'arrête, l'écran FIN (le 0.91.8) ----
// Une seule raison de perdre : le mur (le 0.91.9).
void finPartie() {
  ecran = 2;                      // on est sur la FIN
  viderEcran();
  texte(8, 6, "FIN");
  texte(5, 9, "SCORE");           // le score de la partie (le 0.91.2)
  nombre(11, 9, score);
  texte(2, 13, "START : LE MENU"); // on repasse par le menu (le 0.92)
}

// ---- La couleur du serpent (le 0.92) ----
// Le serpent (le A et ses O) est dans la PALETTE 1 (teindre, le 0.89.1).
// Changer la couleur, c'est changer la teinte 3 de la palette 1 (celle des
// lettres) : TOUTES les cases de la palette 1 changent d'un coup.
// Et on écrit le nom de la couleur dans le menu, avec des espaces derrière
// pour recouvrir un nom plus long (VIOLET a 6 lettres, VERT n'en a que 4).
void choisirCouleur() {
  if (couleur == 0) {
    couleurFond(1, 3, 0, 24, 0);      // rouge 0, vert 24, bleu 0 : VERT
    texte(11, 6, "VERT  ");
  }
  if (couleur == 1) {
    couleurFond(1, 3, 31, 0, 0);      // tout rouge : ROUGE
    texte(11, 6, "ROUGE ");
  }
  if (couleur == 2) {
    couleurFond(1, 3, 0, 8, 31);      // surtout du bleu : BLEU
    texte(11, 6, "BLEU  ");
  }
  if (couleur == 3) {
    couleurFond(1, 3, 20, 0, 31);     // bleu + un peu de rouge : VIOLET
    texte(11, 6, "VIOLET");
  }
}

// ---- L'écran du MENU (le 0.92) ----
//
//   ligne 2 :         MENU
//   ligne 6 :  COULEUR : VERT
//   ligne 9 :         OOOA          un petit serpent, pour voir la couleur
//   ligne 12:   GAUCHE - DROITE
//   ligne 13:  LA COULEUR CHANGE
//   ligne 16:      A : JOUER
void ouvrirMenu() {
  ecran = 3;                          // on est sur le MENU
  viderEcran();
  texte(8, 2, "MENU");
  texte(1, 6, "COULEUR :");

  // le petit serpent d'exemple : trois O et un A, tous dans la palette 1
  for (uint8_t c = 8; c < 11; c++) {
    poser(c, 9, ALPHABET[14]);
    teindre(c, 9, 1);
  }
  poser(11, 9, ALPHABET[0]);
  teindre(11, 9, 1);

  texte(2, 12, "GAUCHE - DROITE");
  texte(1, 13, "LA COULEUR CHANGE");
  texte(5, 16, "A : JOUER");
  choisirCouleur();                   // la couleur choisie, et son nom
}

int main() {
  couleurTexte(31, 16, 0);
  texteGrand(4, 5, "JEU", 4);
  texte(2, 12, "APPUIE SUR START");

  while (true) {
    image();

    if (ecran == 0 && bouton(START)) {
      ouvrirMenu();                   // le titre mène au MENU (le 0.92)
    }

    // ---- Dans le MENU, la croix choisit la couleur (le 0.92) ----
    // chaque(200) : on ne regarde la croix que 5 fois par seconde. Sans lui,
    // un appui (qui dure plusieurs images) ferait défiler toutes les couleurs.
    if (ecran == 3 && chaque(200)) {
      if (bouton(DROITE)) {
        couleur = (couleur + 1) % 4;  // la suivante : 0 1 2 3, puis 0
        choisirCouleur();
      }
      if (bouton(GAUCHE)) {
        couleur = (couleur + 3) % 4;  // la précédente : 3 2 1 0, puis 3
        choisirCouleur();             // (+ 3 puis % 4 : comme - 1, sans passer sous 0)
      }
    }
    if (ecran == 3 && bouton(A)) {
      nouvellePartie();               // A : on joue, avec cette couleur
    }


    if (ecran == 1) {
      // ---- La croix CHOISIT la direction (le 0.91.7) ----
      // On appuie une fois, même très court : sens change, et il le reste.
      if (bouton(DROITE)) sens = 0;
      if (bouton(BAS))    sens = 1;
      if (bouton(GAUCHE)) sens = 2;
      if (bouton(HAUT))   sens = 3;

      ax = x;                                  // on retient où est le A… (le 0.91.3)
      ay = y;

      // ---- Le A avance TOUT SEUL (le 0.91.7) : NOUVEAU, on compte les images ----
      // image() revient 60 fois par seconde : compte gagne 1 à chaque image.
      // Quand il atteint attente (15), on remet compte à 0, et le A fait un pas.
      // 15 images sur 60 : un quart de seconde, 250 ms, comme chaque(250).
      // Mais attente est une VARIABLE : on pourra la changer (le 0.92.2).
      // chaque(), lui, ne prend qu'un nombre écrit en clair.
      //
      //   sens :   3
      //            ↑           colonne : x - 1 à gauche, x + 1 à droite
      //        2 ← A → 0       ligne   : y - 1 en haut,  y + 1 en bas
      //            ↓
      //            1
      compte = compte + 1;
      if (compte >= attente) {
        compte = 0;                            // on recommence à compter
        effacer(x, y, 1);                      // le A quitte sa case
        if (sens == 0) x = x + 1;              // à droite
        if (sens == 1) y = y + 1;              // en bas
        if (sens == 2) x = x - 1;              // à gauche
        if (sens == 3) y = y - 1;              // en haut
        poser(x, y, ALPHABET[0]);              // et se pose sur la suivante,
        teindre(x, y, 1);                      // dans la palette 1 (le 0.92)
      }

      // ---- Le A touche le cadre ? La partie s'arrête (le 0.91.8) ----
      // Avant (le 0.91.3), le A reculait. Maintenant, il a PERDU.
      // || veut dire « OU » : une seule des quatre suffit.
      if (x == 0 || x == 19 || y == 0 || y >= 16) {
        finPartie();                           // l'écran FIN, avec le score
        continue;                              // on saute TOUT le reste de ce tour
      }                                        // de boucle : retour à image()

      // ---- La queue suit le A (le 0.91.5) ----
      // Le A a-t-il bougé ? Sa place n'est plus celle d'avant (ax, ay).
      // longueur > 0 d'abord (le 0.91.6). Sans queue, rien à déplacer, et
      // longueur - 1 vaudrait 255 (un uint8_t ne descend pas sous 0).
      // && veut dire « ET » : il faut une queue ET que le A ait bougé.
      if (longueur > 0 && (x != ax || y != ay)) {
        // 1. le BOUT de la queue disparaît : la dernière case, longueur - 1
        effacer(qx[longueur - 1], qy[longueur - 1], 1);

        // ---- 2. chaque case prend la place de celle de devant ----
        // En partant du BOUT, et en reculant (i-- : i = i - 1).
        // Avec longueur = 3 :  i = 2 : qx[2] = qx[1]
        //                      i = 1 : qx[1] = qx[0]
        //                      i = 0 : 0 > 0 est faux, la boucle s'arrête.
        for (uint8_t i = longueur - 1; i > 0; i--) {
          qx[i] = qx[i - 1];
          qy[i] = qy[i - 1];
        }

        // 3. la première case prend la case que le A vient de quitter
        qx[0] = ax;
        qy[0] = ay;

        // 4. toute la queue redessinée, de la case 0 à la case longueur - 1
        //    (après une pièce, la nouvelle case venait d'être effacée avec le bout)
        for (uint8_t i = 0; i < longueur; i++) {
          poser(qx[i], qy[i], ALPHABET[14]);
          teindre(qx[i], qy[i], 1);            // chaque O dans la palette 1 (le 0.92)
        }
        poser(x, y, ALPHABET[0]);              // 5. le A par-dessus (le 0.91.5)
        teindre(x, y, 1);
      }
      if (x == px && y == py) {                // le A sur le P : ramassée (le 0.81)
        score = score + 1;

        // ---- La pièce réapparaît AU HASARD, mais DANS le cadre (le 0.91.4) ----
        //
        //   px = 1 + hasard() % 18;
        //        |   |        |
        //        |   |        +-- % 18 : le reste de la division par 18, de 0 à 17.
        //        |   |            Exemple : hasard() rend 137 ; 137 = 7 × 18 + 11 ;
        //        |   |            le reste est 11.
        //        |   +----------- un nombre imprévisible, de 0 à 255 (le 0.81.2)
        //        +--------------- + 1 : on décale de 0…17 à 1…18 → 11 + 1 = 12.
        //
        // Pourquoi pas % 20 comme au 0.81.2 ? Les colonnes 0 et 19 sont des murs X :
        // la pièce doit rester de 1 à 18. Les lignes 0 et 16 aussi sont des murs :
        // la pièce doit rester de 1 à 15, d'où 1 + hasard() % 15.
        px = 1 + hasard() % 18;                // une colonne : 1 à 18
        py = 1 + hasard() % 15;                // une ligne : 1 à 15
        poser(px, py, ALPHABET[15]);           // le nouveau P apparaît là,
        teindre(px, py, 0);                    // palette 0 (le 0.92). La case a pu être
                                               // au serpent : le P serait de sa couleur.

        // ---- La queue grandit d'une case (le 0.91.6) ----
        // La nouvelle case naît SUR le bout de la queue. Au prochain pas, toutes
        // les autres avancent, elle non : elle reste derrière.
        // La toute première n'a pas de bout : elle naît SOUS le A.
        // < 50 : le tableau n'a que 50 cases, qx[0] à qx[49].
        if (longueur < 50) {
          if (longueur == 0) {
            qx[0] = x;                         // la première case : sous le A
            qy[0] = y;
          } else {
            qx[longueur] = qx[longueur - 1];   // la case d'après le bout…
            qy[longueur] = qy[longueur - 1];   // …à la même place que le bout
          }
          longueur = longueur + 1;             // une case de plus
        }
      }
      nombre(6, 17, score);
    }

    // ---- Sur la fin, START (le 0.91.2) : retour au MENU (le 0.92).
    if (ecran == 2 && bouton(START)) {
      ouvrirMenu();                   // on peut changer de couleur avant de rejouer
    }
  }
}
`,
    aVoir: 'Comme au 0.92 : le A avance d’un pas tous les quarts de seconde. Le changement est dans le code.',
    controle: (c) => {
      c.avancer(10)
      c.presser('start', 6)
      c.avancer(20)                     // le menu se dessine
      c.presser('a', 3)
      c.avancer(30)                     // puis le terrain
      const x0 = c.variable('x')
      c.avancer(150)
      const x1 = c.variable('x')
      return [
        ['attente vaut 15', c.variable('attente') === 15],
        ['150 images : 9 ou 10 pas (environ un toutes les 15 images)', x1 - x0 === 9 || x1 - x0 === 10, ` (x : ${x0} → ${x1})`],
        ['compte reste sous attente', c.variable('compte') < 15],
      ]
    },
  },

  {
    titre: 'Le snake, avec un menu — la vitesse qui monte',
    difficulte: 0,
    suite: true,
    idee: 'Le 0.92.1, et une deuxième ligne au menu : B choisit VITESSE FIXE ou MONTE. En MONTE, chaque P ramassé retire une image d’attente : le A va de plus en plus vite.',
    texte: [
      '**C’est le 0.92.1, avec une chose en plus : un mode vitesse.** Dans le menu, une deuxième ligne : **VITESSE : FIXE** ou **MONTE**. Le bouton **B** passe de l’un à l’autre. En FIXE, le jeu est celui du 0.92.1. En MONTE, **chaque P ramassé rend le A un peu plus rapide**.',
      '**Ce qui est nouveau ici : `monte`, un interrupteur.** `uint8_t monte = 0;` 0 veut dire FIXE, 1 veut dire MONTE. Une variable qui ne vaut que 0 ou 1, c’est un **interrupteur** : éteint ou allumé.',
      '**B l’inverse :** `monte = 1 - monte;`. Si `monte` vaut 0 : 1 - 0 = **1**. S’il vaut 1 : 1 - 1 = **0**. Une seule ligne, dans les deux sens. Puis `choisirVitesse()` écrit FIXE ou MONTE, comme `choisirCouleur()` écrit le nom de la couleur. `"FIXE "` a un espace derrière : MONTE a une lettre de plus.',
      '**B est lu dans le même `chaque(200)` que la croix :** sinon, un appui (plusieurs images) allumerait et éteindrait l’interrupteur plusieurs fois.',
      '**Aller plus vite, c’est attendre moins.** Au 0.92.1, le A fait un pas toutes les `attente` images (15). Quand il ramasse un P, en mode MONTE : `attente = attente - 1;`. 15, puis 14, 13, 12… **Moins d’images entre deux pas, plus de pas par seconde.**',
      '**Les deux conditions à la fois :** `if (monte == 1 && attente > 5)` (`&&`, le 0.75). **`monte == 1`** : seulement en mode MONTE ; en FIXE, `attente` reste à 15. **`attente > 5`** : on s’arrête à 5 images par pas, soit 12 pas par seconde. Sans cette limite, le jeu deviendrait injouable ; et à 0, `attente - 1` donnerait 255 (le 0.91.6) : le A presque arrêté !',
      '**Les chiffres :** 15 images, 4 pas par seconde (60 / 15). Après 5 P : 10 images, **6** pas par seconde. Après 10 P : 5 images, **12** pas par seconde. La vitesse a triplé.',
      '**`nouvellePartie()` remet `attente` à 15 :** chaque partie repart lentement, même après une partie très rapide. `monte`, lui, n’est **pas** remis à 0 : c’est un réglage du menu, il reste choisi d’une partie à l’autre, comme la couleur.',
    ],
    code: `uint8_t ecran = 0;        // 0 = le TITRE, 1 = le JEU, 2 = la FIN, 3 = le MENU (le 0.92)

uint8_t x = 5;            // le A : sa colonne…
uint8_t y = 8;            // …et sa ligne (le 0.81)
uint8_t px = 15;          // la pièce, le P : sa colonne…
uint8_t py = 8;           // …et sa ligne
uint8_t score = 0;        // les pièces ramassées
uint8_t ax = 5;           // la place du A AVANT son pas… (le 0.91.3)
uint8_t ay = 8;           // …pour l'y remettre s'il entre dans un mur
uint8_t qx[50];           // la queue (le 0.91.6), un TABLEAU de 50 cases O : les colonnes…
uint8_t qy[50];           // …et les lignes. qx[0] : la case collée au A.
uint8_t longueur = 0;     // combien de cases la queue utilise (0 : le A seul)
uint8_t sens = 0;         // où va le A (le 0.91.7). 0 = droite, 1 = bas, 2 = gauche, 3 = haut
uint8_t attente = 15;     // combien d'images entre deux pas du A (15 = 250 ms) (le 0.92.1)
uint8_t compte = 0;       // les images comptées depuis le dernier pas
uint8_t monte = 0;        // NOUVEAU : le mode vitesse. 0 = FIXE, 1 = MONTE (plus vite à chaque P)
uint8_t couleur = 0;      // la couleur du serpent (le 0.92). 0 = vert, 1 = rouge, 2 = bleu, 3 = violet

void viderEcran() {
  for (uint8_t l = 0; l < 18; l++) {
    effacer(0, l, 20);
    // Chaque case de la ligne revient dans la palette 0 (le 0.92).
    // effacer() enlève la lettre, pas la palette de la case : sans ça,
    // le FIN et le MENU seraient en partie de la couleur du serpent.
    for (uint8_t c = 0; c < 20; c++) {
      teindre(c, l, 0);
    }
  }
}

// ---- Une partie qui commence, TOUT au départ (le 0.91.2) ----
// Depuis le titre, ET depuis la fin (START : rejouer).
void nouvellePartie() {
  x = 5;                          // le A revient à sa place
  y = 8;
  px = 15;                        // le P revient en (15, 8), d'où qu'il soit
  py = 8;
  ax = 5;                         // et sa place d'avant, la même
  ay = 8;
  longueur = 0;                   // pas de queue, le A est tout seul (le 0.91.6)
  sens = 0;                       // le A repart vers la droite (le 0.91.7)
  compte = 0;                     // on recommence à compter (le 0.92.1)
  attente = 15;                   // NOUVEAU : la vitesse du départ, 250 ms par pas
  score = 0;                      // pas encore de pièce
  ecran = 1;                      // on est sur le JEU
  viderEcran();
  poser(px, py, ALPHABET[15]);
  poser(x, y, ALPHABET[0]);       // le A (le 0.91.7)…
  teindre(x, y, 1);               // …dans la palette 1, celle du serpent (le 0.92)

  // ---- Le cadre de murs, des X tout autour du terrain (le 0.91.3) ----
  //
  //   colonne : 0 1 2 …           19
  //   ligne 0 : X X X X X X … X X X     le haut : ligne 0, colonnes 0 à 19
  //   ligne 1 : X                 X
  //   …         X   A        P    X     les côtés : colonnes 0 et 19
  //   ligne 15: X                 X
  //   ligne 16: X X X X X X … X X X     le bas : ligne 16
  //   ligne 17: SCORE 000               la ligne 17 reste au score
  //
  // ALPHABET[23] : la 24e lettre (on compte depuis 0), le X.
  for (uint8_t c = 0; c < 20; c++) {
    poser(c, 0, ALPHABET[23]);        // le haut
    poser(c, 16, ALPHABET[23]);       // le bas
  }
  for (uint8_t l = 1; l < 16; l++) {
    poser(0, l, ALPHABET[23]);        // le côté gauche
    poser(19, l, ALPHABET[23]);       // le côté droit
  }

  texte(0, 17, "SCORE");         // plus de TEMPS à côté (le 0.91.9)
}

// ---- Une partie qui s'arrête, l'écran FIN (le 0.91.8) ----
// Une seule raison de perdre : le mur (le 0.91.9).
void finPartie() {
  ecran = 2;                      // on est sur la FIN
  viderEcran();
  texte(8, 6, "FIN");
  texte(5, 9, "SCORE");           // le score de la partie (le 0.91.2)
  nombre(11, 9, score);
  texte(2, 13, "START : LE MENU"); // on repasse par le menu (le 0.92)
}

// ---- La couleur du serpent (le 0.92) ----
// Le serpent (le A et ses O) est dans la PALETTE 1 (teindre, le 0.89.1).
// Changer la couleur, c'est changer la teinte 3 de la palette 1 (celle des
// lettres) : TOUTES les cases de la palette 1 changent d'un coup.
// Et on écrit le nom de la couleur dans le menu, avec des espaces derrière
// pour recouvrir un nom plus long (VIOLET a 6 lettres, VERT n'en a que 4).
void choisirCouleur() {
  if (couleur == 0) {
    couleurFond(1, 3, 0, 24, 0);      // rouge 0, vert 24, bleu 0 : VERT
    texte(11, 6, "VERT  ");
  }
  if (couleur == 1) {
    couleurFond(1, 3, 31, 0, 0);      // tout rouge : ROUGE
    texte(11, 6, "ROUGE ");
  }
  if (couleur == 2) {
    couleurFond(1, 3, 0, 8, 31);      // surtout du bleu : BLEU
    texte(11, 6, "BLEU  ");
  }
  if (couleur == 3) {
    couleurFond(1, 3, 20, 0, 31);     // bleu + un peu de rouge : VIOLET
    texte(11, 6, "VIOLET");
  }
}

// ---- NOUVEAU : le nom du mode vitesse, dans le menu ----
// FIXE  : le A garde toujours la même vitesse.
// MONTE : chaque P ramassé le rend un peu plus rapide.
void choisirVitesse() {
  if (monte == 0) {
    texte(11, 7, "FIXE ");            // un espace derrière : MONTE a 5 lettres
  }
  if (monte == 1) {
    texte(11, 7, "MONTE");
  }
}

// ---- L'écran du MENU (le 0.92) ----
//
//   ligne 2 :         MENU
//   ligne 6 :  COULEUR : VERT
//   ligne 7 :  VITESSE : FIXE       NOUVEAU
//   ligne 9 :         OOOA          un petit serpent, pour voir la couleur
//   ligne 12:   GAUCHE - DROITE
//   ligne 13:  LA COULEUR CHANGE
//   ligne 14:   B : LA VITESSE      NOUVEAU
//   ligne 16:      A : JOUER
void ouvrirMenu() {
  ecran = 3;                          // on est sur le MENU
  viderEcran();
  texte(8, 2, "MENU");
  texte(1, 6, "COULEUR :");

  // le petit serpent d'exemple : trois O et un A, tous dans la palette 1
  for (uint8_t c = 8; c < 11; c++) {
    poser(c, 9, ALPHABET[14]);
    teindre(c, 9, 1);
  }
  poser(11, 9, ALPHABET[0]);
  teindre(11, 9, 1);

  texte(2, 12, "GAUCHE - DROITE");
  texte(1, 13, "LA COULEUR CHANGE");
  texte(3, 14, "B : LA VITESSE");      // NOUVEAU
  texte(1, 7, "VITESSE :");           // NOUVEAU
  texte(5, 16, "A : JOUER");
  choisirCouleur();                   // la couleur choisie, et son nom
  choisirVitesse();                   // NOUVEAU : le mode vitesse, et son nom
}

int main() {
  couleurTexte(31, 16, 0);
  texteGrand(4, 5, "JEU", 4);
  texte(2, 12, "APPUIE SUR START");

  while (true) {
    image();

    if (ecran == 0 && bouton(START)) {
      ouvrirMenu();                   // le titre mène au MENU (le 0.92)
    }

    // ---- Dans le MENU, la croix choisit la couleur (le 0.92) ----
    // chaque(200) : on ne regarde la croix que 5 fois par seconde. Sans lui,
    // un appui (qui dure plusieurs images) ferait défiler toutes les couleurs.
    if (ecran == 3 && chaque(200)) {
      if (bouton(DROITE)) {
        couleur = (couleur + 1) % 4;  // la suivante : 0 1 2 3, puis 0
        choisirCouleur();
      }
      if (bouton(GAUCHE)) {
        couleur = (couleur + 3) % 4;  // la précédente : 3 2 1 0, puis 3
        choisirCouleur();             // (+ 3 puis % 4 : comme - 1, sans passer sous 0)
      }
      // NOUVEAU : B passe de FIXE à MONTE, et de MONTE à FIXE.
      //   1 - monte : si monte vaut 0, 1 - 0 = 1 ; s'il vaut 1, 1 - 1 = 0.
      if (bouton(B)) {
        monte = 1 - monte;
        choisirVitesse();
      }
    }
    if (ecran == 3 && bouton(A)) {
      nouvellePartie();               // A : on joue, avec cette couleur
    }


    if (ecran == 1) {
      // ---- La croix CHOISIT la direction (le 0.91.7) ----
      // On appuie une fois, même très court : sens change, et il le reste.
      if (bouton(DROITE)) sens = 0;
      if (bouton(BAS))    sens = 1;
      if (bouton(GAUCHE)) sens = 2;
      if (bouton(HAUT))   sens = 3;

      ax = x;                                  // on retient où est le A… (le 0.91.3)
      ay = y;

      // ---- Le A avance TOUT SEUL (le 0.91.7), en comptant les images (le 0.92.1) ----
      // image() revient 60 fois par seconde : compte gagne 1 à chaque image.
      // Quand il atteint attente (15), on remet compte à 0, et le A fait un pas.
      // 15 images sur 60 : un quart de seconde, 250 ms, comme chaque(250).
      // attente est une VARIABLE : en mode MONTE, elle diminue (voir le P).
      //
      //   sens :   3
      //            ↑           colonne : x - 1 à gauche, x + 1 à droite
      //        2 ← A → 0       ligne   : y - 1 en haut,  y + 1 en bas
      //            ↓
      //            1
      compte = compte + 1;
      if (compte >= attente) {
        compte = 0;                            // on recommence à compter
        effacer(x, y, 1);                      // le A quitte sa case
        if (sens == 0) x = x + 1;              // à droite
        if (sens == 1) y = y + 1;              // en bas
        if (sens == 2) x = x - 1;              // à gauche
        if (sens == 3) y = y - 1;              // en haut
        poser(x, y, ALPHABET[0]);              // et se pose sur la suivante,
        teindre(x, y, 1);                      // dans la palette 1 (le 0.92)
      }

      // ---- Le A touche le cadre ? La partie s'arrête (le 0.91.8) ----
      // Avant (le 0.91.3), le A reculait. Maintenant, il a PERDU.
      // || veut dire « OU » : une seule des quatre suffit.
      if (x == 0 || x == 19 || y == 0 || y >= 16) {
        finPartie();                           // l'écran FIN, avec le score
        continue;                              // on saute TOUT le reste de ce tour
      }                                        // de boucle : retour à image()

      // ---- La queue suit le A (le 0.91.5) ----
      // Le A a-t-il bougé ? Sa place n'est plus celle d'avant (ax, ay).
      // longueur > 0 d'abord (le 0.91.6). Sans queue, rien à déplacer, et
      // longueur - 1 vaudrait 255 (un uint8_t ne descend pas sous 0).
      // && veut dire « ET » : il faut une queue ET que le A ait bougé.
      if (longueur > 0 && (x != ax || y != ay)) {
        // 1. le BOUT de la queue disparaît : la dernière case, longueur - 1
        effacer(qx[longueur - 1], qy[longueur - 1], 1);

        // ---- 2. chaque case prend la place de celle de devant ----
        // En partant du BOUT, et en reculant (i-- : i = i - 1).
        // Avec longueur = 3 :  i = 2 : qx[2] = qx[1]
        //                      i = 1 : qx[1] = qx[0]
        //                      i = 0 : 0 > 0 est faux, la boucle s'arrête.
        for (uint8_t i = longueur - 1; i > 0; i--) {
          qx[i] = qx[i - 1];
          qy[i] = qy[i - 1];
        }

        // 3. la première case prend la case que le A vient de quitter
        qx[0] = ax;
        qy[0] = ay;

        // 4. toute la queue redessinée, de la case 0 à la case longueur - 1
        //    (après une pièce, la nouvelle case venait d'être effacée avec le bout)
        for (uint8_t i = 0; i < longueur; i++) {
          poser(qx[i], qy[i], ALPHABET[14]);
          teindre(qx[i], qy[i], 1);            // chaque O dans la palette 1 (le 0.92)
        }
        poser(x, y, ALPHABET[0]);              // 5. le A par-dessus (le 0.91.5)
        teindre(x, y, 1);
      }
      if (x == px && y == py) {                // le A sur le P : ramassée (le 0.81)
        score = score + 1;

        // ---- La pièce réapparaît AU HASARD, mais DANS le cadre (le 0.91.4) ----
        //
        //   px = 1 + hasard() % 18;
        //        |   |        |
        //        |   |        +-- % 18 : le reste de la division par 18, de 0 à 17.
        //        |   |            Exemple : hasard() rend 137 ; 137 = 7 × 18 + 11 ;
        //        |   |            le reste est 11.
        //        |   +----------- un nombre imprévisible, de 0 à 255 (le 0.81.2)
        //        +--------------- + 1 : on décale de 0…17 à 1…18 → 11 + 1 = 12.
        //
        // Pourquoi pas % 20 comme au 0.81.2 ? Les colonnes 0 et 19 sont des murs X :
        // la pièce doit rester de 1 à 18. Les lignes 0 et 16 aussi sont des murs :
        // la pièce doit rester de 1 à 15, d'où 1 + hasard() % 15.
        px = 1 + hasard() % 18;                // une colonne : 1 à 18
        py = 1 + hasard() % 15;                // une ligne : 1 à 15
        poser(px, py, ALPHABET[15]);           // le nouveau P apparaît là,
        teindre(px, py, 0);                    // palette 0 (le 0.92). La case a pu être
                                               // au serpent : le P serait de sa couleur.

        // ---- La queue grandit d'une case (le 0.91.6) ----
        // La nouvelle case naît SUR le bout de la queue. Au prochain pas, toutes
        // les autres avancent, elle non : elle reste derrière.
        // La toute première n'a pas de bout : elle naît SOUS le A.
        // < 50 : le tableau n'a que 50 cases, qx[0] à qx[49].
        if (longueur < 50) {
          if (longueur == 0) {
            qx[0] = x;                         // la première case : sous le A
            qy[0] = y;
          } else {
            qx[longueur] = qx[longueur - 1];   // la case d'après le bout…
            qy[longueur] = qy[longueur - 1];   // …à la même place que le bout
          }
          longueur = longueur + 1;             // une case de plus
        }

        // ---- NOUVEAU : en mode MONTE, le A va plus vite ----
        // Une image d'attente en moins à chaque P : 15, 14, 13… jusqu'à 5.
        // attente > 5 : on s'arrête à 5 images par pas (12 pas par seconde),
        // sinon le jeu deviendrait injouable, puis attente passerait sous 0.
        if (monte == 1 && attente > 5) {
          attente = attente - 1;
        }
      }
      nombre(6, 17, score);
    }

    // ---- Sur la fin, START (le 0.91.2) : retour au MENU (le 0.92).
    if (ecran == 2 && bouton(START)) {
      ouvrirMenu();                   // on peut changer de couleur avant de rejouer
    }
  }
}
`,
    aVoir: 'Le MENU : B change VITESSE FIXE / MONTE. En MONTE, le A accélère à chaque P ramassé.',
    controle: (c) => {
      c.avancer(10)
      c.presser('start', 6)
      c.avancer(20)                     // le menu se dessine
      const fixe = c.mot(1, 7, 15) === 'VITESSE : FIXE ' && c.variable('monte') === 0
      c.presser('b', 12)
      c.avancer(3)
      const monte = c.mot(11, 7, 5) === 'MONTE' && c.variable('monte') === 1
      c.presser('a', 3)
      c.avancer(20)                     // le terrain se dessine
      const depart = c.variable('attente')
      for (let t = 0; t < 400 && c.variable('score') < 1; t++) c.avancer(1)
      c.avancer(3)
      const apres = c.variable('attente')
      return [
        ['le menu dit VITESSE : FIXE', fixe],
        ['B : MONTE', monte],
        ['la partie part à 15 images par pas', depart === 15],
        ['un P ramassé : 14 images par pas, un peu plus vite', c.variable('score') === 1 && apres === 14, ` (score = ${c.variable('score')}, attente = ${apres})`],
      ]
    },
  },

  {
    titre: 'Un jeu de bombes — le terrain',
    difficulte: 0,
    partie: 'Le jeu de bombes',
    idee: 'Un nouveau jeu, façon Bomberman. D’abord le terrain : un cadre de X, et des piliers X sur une case sur deux (colonne ET ligne paires). Le joueur, le O, en (1, 1).',
    texte: [
      '**Un nouveau jeu : des bombes, comme dans Bomberman.** Le joueur est un **O**, les ennemis seront des **W**, les murs sont des **X**. On le construit leçon après leçon ; ici, **seulement le terrain**, et le O posé à sa place de départ.',
      '**Le terrain :** un **cadre** de X tout autour (comme au 0.91.3), et à l’intérieur, des **piliers** X, un sur deux, en quadrillage. Entre les piliers, des **couloirs** : c’est là qu’on se déplacera, et que les flammes des bombes passeront.',
      '**19 colonnes, de 0 à 18,** et 17 lignes, de 0 à 16. Pourquoi 19 et pas 20 ? Pour que le cadre de droite (colonne 18) soit **pair**, comme celui de gauche (colonne 0). Ainsi, il y a un couloir des deux côtés de chaque pilier. La colonne 19 reste vide ; la ligne 17 servira au score.',
      '**Ce qui est nouveau ici : une case sur deux, avec `% 2`.** `c % 2` est le **reste de la division par 2** (le `%` du 0.9) : 0 pour un nombre **pair** (0, 2, 4…), 1 pour un nombre **impair** (1, 3, 5…). Exemples : 6 % 2 = 0, car 6 = 3 × 2 + 0 ; 7 % 2 = 1, car 7 = 3 × 2 + 1.',
      '**Un pilier, c’est colonne paire ET ligne paire :** `c % 2 == 0 && l % 2 == 0` (`&&`, « et », le 0.75). En (2, 2) : oui, pilier. En (2, 3) : la ligne 3 est impaire, non : couloir. En (3, 2) : la colonne 3 est impaire, non : couloir. En (1, 1) : ni l’une ni l’autre, c’est la place du O.',
      '**Le cadre :** `l == 0 || l == 16 || c == 0 || c == 18` (`||`, « ou », le 0.91.3) : la première ou la dernière ligne, la première ou la dernière colonne.',
      '**Deux boucles, l’une dans l’autre (le 0.69.1) :** la boucle des lignes (`l`, de 0 à 16) contient celle des colonnes (`c`, de 0 à 18). Pour **chaque** ligne, on passe sur **toutes** les colonnes : 17 × 19 = **323 cases**, une par une. Déroulons : `l` = 0 : `c` = 0, 1, 2 … 18, tout est cadre. `l` = 1 : `c` = 0 cadre, 1 à 17 rien (ligne impaire), 18 cadre. `l` = 2 : `c` = 0 cadre, 1 rien, 2 pilier, 3 rien, 4 pilier… 18 cadre.',
      '**Sur le cadre, certaines cases sont aussi des piliers** (par exemple (0, 0), ou (4, 16) : colonne et ligne paires). Le X y est posé deux fois : ce n’est pas grave, c’est le même X au même endroit.',
      '**Le compte :** 68 X pour le cadre (19 en haut, 19 en bas, 15 à gauche, 15 à droite) et 56 piliers à l’intérieur (8 colonnes paires, de 2 à 16, × 7 lignes paires, de 2 à 14) : **124 X**.',
    ],
    code: `// ---- UN JEU DE BOMBES : le terrain ----
//
//   colonne : 0 1 2 3 4 …            18
//   ligne 0 : X X X X X X X … X X X X X     le cadre
//   ligne 1 : X O                     X     une ligne impaire : un couloir
//   ligne 2 : X   X   X   X   …   X   X     une ligne paire : des piliers
//   ligne 3 : X                       X
//   …
//   ligne 16: X X X X X X X … X X X X X     le cadre
//
// ALPHABET[23] : le X (la 24e lettre, on compte depuis 0).
// ALPHABET[14] : le O (la 15e lettre).

int main() {
  // Deux boucles, l'une dans l'autre : chaque LIGNE, et dans chaque ligne,
  // chaque COLONNE. 17 lignes × 19 colonnes = 323 cases.
  for (uint8_t l = 0; l < 17; l++) {
    for (uint8_t c = 0; c < 19; c++) {

      // Le cadre : la première ou la dernière ligne, OU (||) la première
      // ou la dernière colonne.
      if (l == 0 || l == 16 || c == 0 || c == 18) {
        poser(c, l, ALPHABET[23]);
      }

      // NOUVEAU : les piliers. c % 2 : le reste de c divisé par 2.
      //   0 si c est PAIR (0, 2, 4…), 1 s'il est IMPAIR (1, 3, 5…).
      // Colonne paire ET (&&) ligne paire : un pilier.
      //   (2, 2) : pilier    (2, 3) : couloir    (3, 2) : couloir
      if (c % 2 == 0 && l % 2 == 0) {
        poser(c, l, ALPHABET[23]);
      }
    }
  }

  // Le joueur, le O, dans le coin en haut à gauche : (1, 1).
  poser(1, 1, ALPHABET[14]);

  while (true) {
    image();
  }
}
`,
    aVoir: 'Un cadre de X, des piliers X en quadrillage à l’intérieur, et le O en haut à gauche.',
    controle: (c) => {
      c.avancer(20)
      let x = 0
      for (let l = 0; l < 17; l++) x += [...c.mot(0, l, 20)].filter((ch) => ch === 'X').length
      return [
        ['le cadre : lignes 0 et 16, colonnes 0 et 18', c.mot(0, 0, 19) === 'X'.repeat(19) && c.mot(0, 16, 19) === 'X'.repeat(19) && c.mot(0, 7, 1) === 'X' && c.mot(18, 7, 1) === 'X'],
        ['la colonne 19 reste vide', c.mot(19, 0, 1) === ' ' && c.mot(19, 8, 1) === ' '],
        ['la ligne 2 : un pilier sur deux', c.mot(0, 2, 19) === 'X X X X X X X X X X'],
        ['les lignes impaires sont des couloirs', c.mot(0, 3, 19) === 'X' + ' '.repeat(17) + 'X'],
        ['124 X en tout', x === 124, ` (${x})`],
        ['le O en (1, 1)', c.mot(1, 1, 1) === 'O'],
      ]
    },
  },

  {
    titre: 'Un jeu de bombes — le O bouge, les X l’arrêtent',
    difficulte: 0,
    suite: true,
    idee: 'Le 0.93, et le O bouge avec la croix, un pas toutes les 150 ms. Avant chaque pas, lire() regarde la case d’arrivée : un X, et le O reste où il est.',
    texte: [
      '**C’est le 0.93, avec une chose en plus : le O bouge.** La croix le déplace d’une case, dans les couloirs. Les X (le cadre et les piliers) l’arrêtent.',
      '**Deux variables pour le O :** `ox` et `oy`, sa colonne et sa ligne. Il part de (1, 1). Et deux autres, `nx` et `ny` : la case d’**arrivée**, là où il irait s’il bougeait. C’est la méthode du mur M (le 0.82) : **on calcule d’abord, on regarde, et seulement après on bouge.**',
      '**`chaque(150)`** (le 0.77) : au plus un pas toutes les 150 ms, un peu plus vite que le serpent.',
      '**Étape 1, la case d’arrivée.** On part de la case actuelle (`nx = ox; ny = oy;`), puis la flèche tenue change `nx` ou `ny` d’une case. **Ce qui est nouveau ici : `else if`.** `if (…) { … } else if (…) { … }` : « sinon, si… ». Dès qu’une flèche est trouvée, les suivantes ne sont **pas** regardées. Avec DROITE et BAS tenues ensemble, seule DROITE compte : **pas de pas en diagonale** (en diagonale, le O passerait entre deux piliers). `else` seul, on l’a vu au 0.83.1.',
      '**Étape 2 : une flèche est-elle tenue ?** Si aucune ne l’est, l’arrivée est la case où l’on est déjà : `nx != ox || ny != oy` est faux, on ne fait rien.',
      '**Étape 3 : regarder l’arrivée.** `lire(nx, ny) != ALPHABET[23]` (le 0.82) : « la case d’arrivée n’est pas un X ». Alors on efface le O, on change `ox` et `oy`, et on le pose sur sa nouvelle case.',
      '**Déroulons :** O en (1, 1), DROITE : l’arrivée est (2, 1). `lire(2, 1)` : un espace, pas un X. Le O va en (2, 1). Puis BAS : l’arrivée est (2, 2), un **pilier** (colonne et ligne paires, le 0.93). `lire(2, 2)` rend le X : le O ne bouge pas. Il faut revenir en colonne 1 ou aller en colonne 3 pour descendre.',
    ],
    code: `// ---- UN JEU DE BOMBES ----
// Les lettres : X = un mur, O = le joueur, B = une bombe, W = un ennemi.
// ALPHABET[23] : le X    ALPHABET[14] : le O
// ALPHABET[1]  : le B    ALPHABET[22] : le W

uint8_t ox = 1;           // NOUVEAU : le O, le joueur : sa colonne…
uint8_t oy = 1;           // …et sa ligne. Il part du coin (1, 1).
uint8_t nx = 0;           // la case d'ARRIVÉE, calculée AVANT de bouger (le 0.82)
uint8_t ny = 0;

int main() {
  // ---- Le terrain : le cadre et les piliers X (le 0.93) ----
  for (uint8_t l = 0; l < 17; l++) {
    for (uint8_t c = 0; c < 19; c++) {
      if (l == 0 || l == 16 || c == 0 || c == 18) {   // le cadre
        poser(c, l, ALPHABET[23]);
      }
      if (c % 2 == 0 && l % 2 == 0) {                 // les piliers : colonne ET ligne paires
        poser(c, l, ALPHABET[23]);
      }
    }
  }

  poser(ox, oy, ALPHABET[14]);            // le O à sa place (le 0.93)

  while (true) {
    image();

    // ---- NOUVEAU : le O bouge avec la croix, un pas toutes les 150 ms ----
    if (chaque(150)) {
      // 1. la case d'ARRIVÉE : on part de la case actuelle (le 0.82).
      //    else if : une seule flèche à la fois, pas de pas en diagonale.
      nx = ox;
      ny = oy;
      if (bouton(DROITE)) {
        nx = ox + 1;
      } else if (bouton(GAUCHE)) {
        nx = ox - 1;
      } else if (bouton(BAS)) {
        ny = oy + 1;
      } else if (bouton(HAUT)) {
        ny = oy - 1;
      }

      // 2. une flèche est tenue (l'arrivée n'est pas la case où l'on est)…
      if (nx != ox || ny != oy) {
        // 3. …et l'arrivée n'est pas un X : le O y va.
        if (lire(nx, ny) != ALPHABET[23]) {
          effacer(ox, oy, 1);                 // le O quitte sa case…
          ox = nx;                            // …et va sur la case d'arrivée
          oy = ny;
          poser(ox, oy, ALPHABET[14]);
        }
      }
    }
  }
}
`,
    aVoir: 'Le O se déplace avec la croix dans les couloirs ; il ne traverse ni le cadre, ni les piliers.',
    controle: (c) => {
      const tenir = (b, cond, max = 300) => { let t = 0; while (t < max && !cond()) { c.gb.setButton(b, true); c.avancer(1); t++ } c.gb.setButton(b, false); c.avancer(1) }
      c.avancer(20)
      tenir('right', () => c.variable('ox') === 2)
      c.presser('down', 30)
      const bas = c.variable('oy')
      c.presser('up', 30)
      const haut = c.variable('oy')
      return [
        ['à droite : le O va en (2, 1)', c.variable('ox') === 2 && c.mot(2, 1, 1) === 'O' && c.mot(1, 1, 1) === ' '],
        ['en bas, le pilier (2, 2) l’arrête', bas === 1 && c.mot(2, 2, 1) === 'X', ` (oy = ${bas})`],
        ['en haut, le cadre l’arrête', haut === 1 && c.mot(2, 0, 1) === 'X', ` (oy = ${haut})`],
      ]
    },
  },

  {
    titre: 'Un jeu de bombes — A pose une bombe',
    difficulte: 0,
    suite: true,
    idee: 'Le 0.93.1, et le bouton A pose une bombe B sous le O. Une seule à la fois. Elle ne se voit que quand le O s’en va ; ensuite, elle lui barre le chemin.',
    texte: [
      '**C’est le 0.93.1, avec une chose en plus : la bombe.** Le bouton **A** pose une bombe, une **B**, là où est le O. Pour l’instant, elle n’explose pas : ce sera le 0.93.3.',
      '**Trois variables :** `bombe` vaut 1 quand une bombe est posée, 0 sinon ; `bx` et `by` retiennent sa place.',
      '**Poser :** `if (bouton(A) && bombe == 0)` (`&&`, le 0.75). **`bombe == 0`** : une seule bombe à la fois. Tant qu’elle est là, A ne fait plus rien. Alors `bombe = 1;`, et la bombe prend la place du O : `bx = ox; by = oy;`.',
      '**On ne la voit pas tout de suite :** le O est encore dessus, et c’est lui qu’on voit. **Ce qui est nouveau ici : la B apparaît quand le O s’en va.** Au moment du pas, on efface la case du O, puis : `if (bombe == 1 && ox == bx && oy == by)` : si le O était **sur** la bombe, on pose la B à cette place. Sans ça, `effacer()` effacerait aussi la bombe.',
      '**Ensuite, la bombe barre le chemin.** Au 0.93.1, le O allait partout sauf sur un X. Il faudrait maintenant dire « ni un X, ni une B »… et bientôt « ni un W, ni une flamme ». Plus simple : **le O ne va que sur une case VIDE.** Une case vide, c’est un espace, la **tuile 0** : `lire(nx, ny) == 0`. X, B, et tout ce qui viendra plus tard, l’arrêtent d’un coup.',
      '**Déroulons :** O en (3, 1), A : `bombe` = 1, `bx` = 3, `by` = 1. DROITE : `lire(4, 1)` vaut 0, vide. On efface (3, 1) ; le O était sur la bombe (3 == 3 et 1 == 1) : la B est posée en (3, 1). Le O va en (4, 1). GAUCHE : `lire(3, 1)` rend la B, pas 0 : le O ne bouge pas.',
    ],
    code: `// ---- UN JEU DE BOMBES ----
// Les lettres : X = un mur, O = le joueur, B = une bombe, W = un ennemi.
// ALPHABET[23] : le X    ALPHABET[14] : le O
// ALPHABET[1]  : le B    ALPHABET[22] : le W

uint8_t ox = 1;           // le O, le joueur : sa colonne… (le 0.93.1)
uint8_t oy = 1;           // …et sa ligne. Il part du coin (1, 1).
uint8_t nx = 0;           // la case d'ARRIVÉE, calculée AVANT de bouger (le 0.82)
uint8_t ny = 0;
uint8_t bombe = 0;        // NOUVEAU : 1 : une bombe est posée ; 0 : pas de bombe
uint8_t bx = 0;           // la place de la bombe : sa colonne…
uint8_t by = 0;           // …et sa ligne

int main() {
  // ---- Le terrain : le cadre et les piliers X (le 0.93) ----
  for (uint8_t l = 0; l < 17; l++) {
    for (uint8_t c = 0; c < 19; c++) {
      if (l == 0 || l == 16 || c == 0 || c == 18) {   // le cadre
        poser(c, l, ALPHABET[23]);
      }
      if (c % 2 == 0 && l % 2 == 0) {                 // les piliers : colonne ET ligne paires
        poser(c, l, ALPHABET[23]);
      }
    }
  }

  poser(ox, oy, ALPHABET[14]);            // le O à sa place (le 0.93)

  while (true) {
    image();

    // ---- le O bouge avec la croix, un pas toutes les 150 ms (le 0.93.1) ----
    if (chaque(150)) {
      // 1. la case d'ARRIVÉE : on part de la case actuelle (le 0.82).
      //    else if : une seule flèche à la fois, pas de pas en diagonale.
      nx = ox;
      ny = oy;
      if (bouton(DROITE)) {
        nx = ox + 1;
      } else if (bouton(GAUCHE)) {
        nx = ox - 1;
      } else if (bouton(BAS)) {
        ny = oy + 1;
      } else if (bouton(HAUT)) {
        ny = oy - 1;
      }

      // 2. une flèche est tenue (l'arrivée n'est pas la case où l'on est)…
      if (nx != ox || ny != oy) {
        // 3. NOUVEAU : …et l'arrivée est VIDE : ni X, ni B.
        //    lire() rend 0 pour une case vide : c'est l'espace, la tuile 0.
        if (lire(nx, ny) == 0) {
          effacer(ox, oy, 1);                 // le O quitte sa case…
          if (bombe == 1 && ox == bx && oy == by) {
            poser(bx, by, ALPHABET[1]);         // NOUVEAU : …mais s'il était sur la bombe, la B apparaît
          }
          ox = nx;                            // …et va sur la case d'arrivée
          oy = ny;
          poser(ox, oy, ALPHABET[14]);
        }
      }
    }

    // ---- NOUVEAU : A : poser une bombe, là où est le O ----
    // bombe == 0 : une seule bombe à la fois.
    if (bouton(A) && bombe == 0) {
      bombe = 1;
      bx = ox;                              // la bombe est sous le O
      by = oy;
    }
  }
}
`,
    aVoir: 'A pose une B sous le O ; elle apparaît quand il s’en va, et il ne peut plus repasser dessus.',
    controle: (c) => {
      const tenir = (b, cond, max = 300) => { let t = 0; while (t < max && !cond()) { c.gb.setButton(b, true); c.avancer(1); t++ } c.gb.setButton(b, false); c.avancer(1) }
      c.avancer(20)
      tenir('right', () => c.variable('ox') === 3)
      c.presser('a', 3)
      tenir('right', () => c.variable('ox') === 4)
      c.presser('left', 30)
      c.presser('a', 3)
      return [
        ['A : une bombe en (3, 1)', c.variable('bombe') === 1 && c.variable('bx') === 3 && c.variable('by') === 1],
        ['le O parti, la B apparaît : B O', c.mot(3, 1, 2) === 'BO'],
        ['la B barre le chemin : le O reste en (4, 1)', c.variable('ox') === 4],
        ['une seule bombe à la fois', c.variable('bx') === 3],
      ]
    },
  },

  {
    titre: 'Un jeu de bombes — la bombe explose',
    difficulte: 0,
    suite: true,
    idee: 'Le 0.93.2, et la bombe explose au bout de 2 secondes : des flammes - et | sur sa case et une case autour, sauf dans les X. Une demi-seconde plus tard, elles s’éteignent.',
    texte: [
      '**C’est le 0.93.2, avec une chose en plus : l’explosion.** Deux secondes après la pose, la B disparaît et des **flammes** apparaissent : sur sa case, et **une case** à droite, à gauche, en bas, en haut. Une demi-seconde après, elles s’éteignent.',
      '**Les flammes sont des signes :** `-` pour les flammes couchées (à gauche, à droite, et le centre), **`|`** pour les flammes debout (en haut, en bas). `texte(c, l, "-")` les écrit, comme un mot d’une lettre.',
      '**Compter le temps :** `bdelai` compte les images depuis la pose (`bdelai = 0;` quand on pose). À chaque image : `bdelai = bdelai + 1;`. `image()` revient 60 fois par seconde : à **120**, deux secondes ont passé, la bombe explose. Les flammes, elles, comptent dans `fdelai` jusqu’à **30** : une demi-seconde.',
      '**Au moment d’exploser :** `bombe = 0;` (plus de bombe), le centre de l’explosion est rangé dans `fx` et `fy`, `feu = 1;` (les flammes sont là), et `flammes(1);` les dessine.',
      '**Ce qui est nouveau ici : une fonction qui dessine OU efface.** `flammes(allume)` passe sur les cases de l’explosion ; pour chacune, elle appelle `caseFeu(c, l, allume, debout)`. Si `allume` vaut 1, `caseFeu` écrit la flamme ; s’il vaut 0, elle efface la case. **Pourquoi une seule fonction ?** Pour être sûr que `flammes(0)` efface **exactement** les cases que `flammes(1)` a dessinées. Des fonctions avec des paramètres : le 0.33.',
      '**Le X arrête la flamme :** avant chaque case autour du centre, `if (lire(fx + 1, fy) != ALPHABET[23])`. Un pilier ou le cadre ne brûle pas. Le centre, lui, est toujours brûlé : c’est la case de la bombe.',
      '**`debout` :** le 4e paramètre de `caseFeu`. 1 : `|` ; 0 : `-`. En bas et en haut, on passe 1 ; au centre, à droite et à gauche, 0.',
      '**Deux précautions :** 1. On ne pose pas de nouvelle bombe tant que les flammes sont là (`&& feu == 0`) : sinon `fx` et `fy` changeraient, et `flammes(0)` effacerait au mauvais endroit. 2. Après `flammes(0)`, on **redessine le O** : s’il était resté dans une flamme, l’effacement l’a effacé aussi.',
      '**Le O ne marche pas dans les flammes :** elles ne sont pas une case vide (le 0.93.2). Pour l’instant, elles ne lui font rien s’il est dessus ; au 0.93.8, elles le feront perdre.',
    ],
    code: `// ---- UN JEU DE BOMBES ----
// Les lettres : X = un mur, O = le joueur, B = une bombe, W = un ennemi.
// ALPHABET[23] : le X    ALPHABET[14] : le O
// ALPHABET[1]  : le B    ALPHABET[22] : le W

uint8_t ox = 1;           // le O, le joueur : sa colonne… (le 0.93.1)
uint8_t oy = 1;           // …et sa ligne. Il part du coin (1, 1).
uint8_t nx = 0;           // la case d'ARRIVÉE, calculée AVANT de bouger (le 0.82)
uint8_t ny = 0;
uint8_t bombe = 0;        // 1 : une bombe est posée ; 0 : pas de bombe (le 0.93.2)
uint8_t bx = 0;           // la place de la bombe : sa colonne…
uint8_t by = 0;           // …et sa ligne
uint8_t bdelai = 0;       // NOUVEAU : les images passées depuis la pose de la bombe
uint8_t feu = 0;          // 1 : les flammes sont à l'écran ; 0 : non
uint8_t fdelai = 0;       // les images passées depuis l'explosion
uint8_t fx = 0;           // le centre de l'explosion : sa colonne…
uint8_t fy = 0;           // …et sa ligne

// ---- NOUVEAU : UNE case de flamme ----
// allume = 1 : on dessine la flamme ; allume = 0 : on l'efface.
// debout = 1 : une flamme verticale, le | ; debout = 0 : horizontale, le -.
void caseFeu(uint8_t c, uint8_t l, uint8_t allume, uint8_t debout) {
  if (allume == 0) {
    effacer(c, l, 1);                   // la flamme s'éteint : la case est vide
  } else {
    if (debout == 1) {
      texte(c, l, "|");
    } else {
      texte(c, l, "-");
    }
  }
}

// ---- NOUVEAU : toute l'explosion, le centre et une case de chaque côté ----
//
//        |              le centre : là où était la B
//      - - -            une case à droite, à gauche, en bas, en haut…
//        |              …sauf si c'est un X : le mur arrête la flamme
//
// flammes(1) dessine, flammes(0) efface : les MÊMES cases, forcément.
void flammes(uint8_t allume) {
  caseFeu(fx, fy, allume, 0);                     // le centre
  if (lire(fx + 1, fy) != ALPHABET[23]) {         // à droite, si ce n'est pas un X
    caseFeu(fx + 1, fy, allume, 0);
  }
  if (lire(fx - 1, fy) != ALPHABET[23]) {         // à gauche
    caseFeu(fx - 1, fy, allume, 0);
  }
  if (lire(fx, fy + 1) != ALPHABET[23]) {         // en bas : une flamme debout
    caseFeu(fx, fy + 1, allume, 1);
  }
  if (lire(fx, fy - 1) != ALPHABET[23]) {         // en haut
    caseFeu(fx, fy - 1, allume, 1);
  }
}

int main() {
  // ---- Le terrain : le cadre et les piliers X (le 0.93) ----
  for (uint8_t l = 0; l < 17; l++) {
    for (uint8_t c = 0; c < 19; c++) {
      if (l == 0 || l == 16 || c == 0 || c == 18) {   // le cadre
        poser(c, l, ALPHABET[23]);
      }
      if (c % 2 == 0 && l % 2 == 0) {                 // les piliers : colonne ET ligne paires
        poser(c, l, ALPHABET[23]);
      }
    }
  }

  poser(ox, oy, ALPHABET[14]);            // le O à sa place (le 0.93)

  while (true) {
    image();

    // ---- le O bouge avec la croix, un pas toutes les 150 ms (le 0.93.1) ----
    if (chaque(150)) {
      // 1. la case d'ARRIVÉE : on part de la case actuelle (le 0.82).
      //    else if : une seule flèche à la fois, pas de pas en diagonale.
      nx = ox;
      ny = oy;
      if (bouton(DROITE)) {
        nx = ox + 1;
      } else if (bouton(GAUCHE)) {
        nx = ox - 1;
      } else if (bouton(BAS)) {
        ny = oy + 1;
      } else if (bouton(HAUT)) {
        ny = oy - 1;
      }

      // 2. une flèche est tenue (l'arrivée n'est pas la case où l'on est)…
      if (nx != ox || ny != oy) {
        // 3. …et l'arrivée est VIDE : ni X, ni B, ni flamme. (le 0.93.2)
        //    lire() rend 0 pour une case vide : c'est l'espace, la tuile 0.
        if (lire(nx, ny) == 0) {
          effacer(ox, oy, 1);                 // le O quitte sa case…
          if (bombe == 1 && ox == bx && oy == by) {
            poser(bx, by, ALPHABET[1]);         // …mais s'il était sur la bombe, la B apparaît (le 0.93.2)
          }
          ox = nx;                            // …et va sur la case d'arrivée
          oy = ny;
          poser(ox, oy, ALPHABET[14]);
        }
      }
    }

    // ---- A : poser une bombe, là où est le O (le 0.93.2) ----
    // bombe == 0 : une seule bombe à la fois.
    // feu == 0 : pas pendant les flammes (le 0.93.3).
    if (bouton(A) && bombe == 0 && feu == 0) {
      bombe = 1;
      bx = ox;                              // la bombe est sous le O
      by = oy;
      bdelai = 0;                           // on commence à compter (le 0.93.3)
    }

    // ---- NOUVEAU : la bombe explose au bout de 2 secondes ----
    // image() revient 60 fois par seconde : 120 images, 2 secondes.
    if (bombe == 1) {
      bdelai = bdelai + 1;
      if (bdelai == 120) {
        bombe = 0;                          // plus de bombe…
        fx = bx;                            // …elle explose, là où elle était
        fy = by;
        feu = 1;
        fdelai = 0;
        flammes(1);                         // on dessine les flammes
      }
    }

    // ---- NOUVEAU : les flammes s'éteignent au bout d'une demi-seconde (30 images) ----
    if (feu == 1) {
      fdelai = fdelai + 1;
      if (fdelai == 30) {
        feu = 0;
        flammes(0);                         // on efface les MÊMES cases
        poser(ox, oy, ALPHABET[14]);        // le O était peut-être dans une flamme : on le remet
      }
    }
  }
}
`,
    aVoir: 'A, puis on s’écarte : deux secondes après, la bombe explose en croix (- et |), puis les flammes s’éteignent.',
    controle: (c) => {
      const tenir = (b, cond, max = 300) => { let t = 0; while (t < max && !cond()) { c.gb.setButton(b, true); c.avancer(1); t++ } c.gb.setButton(b, false); c.avancer(1) }
      c.avancer(20)
      c.presser('a', 3)
      tenir('right', () => c.variable('ox') === 3)
      tenir('b', () => c.variable('feu') === 1, 200)
      c.avancer(2)
      const feu = c.mot(1, 1, 2) === '--' && c.mot(1, 2, 1) === '|' && c.mot(0, 1, 1) === 'X' && c.mot(1, 0, 1) === 'X'
      tenir('b', () => c.variable('feu') === 0, 100)
      c.avancer(2)
      return [
        ['l’explosion : - en (1, 1) et (2, 1), | en (1, 2)', feu],
        ['les X du cadre ne brûlent pas', c.mot(0, 1, 1) === 'X' && c.mot(1, 0, 1) === 'X'],
        ['les flammes s’éteignent, le O est toujours là', c.mot(1, 1, 2) === '  ' && c.mot(1, 2, 1) === ' ' && c.mot(3, 1, 1) === 'O'],
      ]
    },
  },

  {
    titre: 'Un jeu de bombes — des flammes plus longues',
    difficulte: 0,
    suite: true,
    idee: 'Le 0.93.3, mais chaque bras de flamme va jusqu’à 2 cases, et s’arrête au premier X : une boucle for et break.',
    texte: [
      '**C’est le 0.93.3, avec une chose en plus : des bras de deux cases.** L’explosion fait maintenant une croix plus grande : jusqu’à 2 cases de chaque côté.',
      '**Ce qui est nouveau ici : un bras est une boucle.** Pour la droite : `for (uint8_t k = 1; k <= 2; k++)`. `k` vaut 1, puis 2 : la case `fx + 1`, puis la case `fx + 2`. `<=` : « plus petit ou égal », donc 2 compris.',
      '**`break` : le mur arrête le bras.** Dans la boucle, d’abord : `if (lire(fx + k, fy) == ALPHABET[23]) break;`. **`break`** sort de la boucle tout de suite (le 0.33) : les cases suivantes ne sont même pas regardées. La flamme ne **traverse** pas un pilier.',
      '**Déroulons, bombe en (1, 1) :** à droite, `k` = 1 : (2, 1) vide, flamme. `k` = 2 : (3, 1) vide, flamme. À gauche, `k` = 1 : (0, 1), le cadre : `break`, rien. En bas, `k` = 1 : (1, 2), flamme. `k` = 2 : (1, 3), flamme. En haut : (1, 0), le cadre : rien.',
      '**Et bombe en (2, 1) ?** En bas, `k` = 1 : (2, 2), un pilier : `break` tout de suite. Rien en dessous.',
      '**Pourquoi `break` protège aussi les nombres :** à gauche, `fx - k`. Si `fx` vaut 1, `fx - 2` ne donnerait pas -1 mais 255 (le 0.91.6). Mais (0, 1) est toujours un X : `break` arrive avant `k` = 2. Le cadre garde les calculs dans le terrain.',
      '**Le reste ne change pas :** `flammes(0)` fait les mêmes boucles, avec les mêmes `break` : elle efface exactement les mêmes cases.',
    ],
    code: `// ---- UN JEU DE BOMBES ----
// Les lettres : X = un mur, O = le joueur, B = une bombe, W = un ennemi.
// ALPHABET[23] : le X    ALPHABET[14] : le O
// ALPHABET[1]  : le B    ALPHABET[22] : le W

uint8_t ox = 1;           // le O, le joueur : sa colonne… (le 0.93.1)
uint8_t oy = 1;           // …et sa ligne. Il part du coin (1, 1).
uint8_t nx = 0;           // la case d'ARRIVÉE, calculée AVANT de bouger (le 0.82)
uint8_t ny = 0;
uint8_t bombe = 0;        // 1 : une bombe est posée ; 0 : pas de bombe (le 0.93.2)
uint8_t bx = 0;           // la place de la bombe : sa colonne…
uint8_t by = 0;           // …et sa ligne
uint8_t bdelai = 0;       // les images passées depuis la pose de la bombe (le 0.93.3)
uint8_t feu = 0;          // 1 : les flammes sont à l'écran ; 0 : non
uint8_t fdelai = 0;       // les images passées depuis l'explosion
uint8_t fx = 0;           // le centre de l'explosion : sa colonne…
uint8_t fy = 0;           // …et sa ligne

// ---- UNE case de flamme (le 0.93.3) ----
// allume = 1 : on dessine la flamme ; allume = 0 : on l'efface.
// debout = 1 : une flamme verticale, le | ; debout = 0 : horizontale, le -.
void caseFeu(uint8_t c, uint8_t l, uint8_t allume, uint8_t debout) {
  if (allume == 0) {
    effacer(c, l, 1);                   // la flamme s'éteint : la case est vide
  } else {
    if (debout == 1) {
      texte(c, l, "|");
    } else {
      texte(c, l, "-");
    }
  }
}

// ---- Toute l'explosion (le 0.93.3) : NOUVEAU : des bras de DEUX cases ----
//
//          |
//          |            chaque bras : jusqu'à 2 cases,
//      - - - - -        mais il s'arrête au premier X.
//          |            break : on sort de la boucle, tout de suite.
//          |
void flammes(uint8_t allume) {
  caseFeu(fx, fy, allume, 0);                     // le centre
  for (uint8_t k = 1; k <= 2; k++) {              // à droite : fx + 1, puis fx + 2
    if (lire(fx + k, fy) == ALPHABET[23]) break;  // un X : le bras s'arrête là
    caseFeu(fx + k, fy, allume, 0);
  }
  for (uint8_t k = 1; k <= 2; k++) {              // à gauche : fx - 1, puis fx - 2
    if (lire(fx - k, fy) == ALPHABET[23]) break;
    caseFeu(fx - k, fy, allume, 0);
  }
  for (uint8_t k = 1; k <= 2; k++) {              // en bas
    if (lire(fx, fy + k) == ALPHABET[23]) break;
    caseFeu(fx, fy + k, allume, 1);
  }
  for (uint8_t k = 1; k <= 2; k++) {              // en haut
    if (lire(fx, fy - k) == ALPHABET[23]) break;
    caseFeu(fx, fy - k, allume, 1);
  }
}

int main() {
  // ---- Le terrain : le cadre et les piliers X (le 0.93) ----
  for (uint8_t l = 0; l < 17; l++) {
    for (uint8_t c = 0; c < 19; c++) {
      if (l == 0 || l == 16 || c == 0 || c == 18) {   // le cadre
        poser(c, l, ALPHABET[23]);
      }
      if (c % 2 == 0 && l % 2 == 0) {                 // les piliers : colonne ET ligne paires
        poser(c, l, ALPHABET[23]);
      }
    }
  }

  poser(ox, oy, ALPHABET[14]);            // le O à sa place (le 0.93)

  while (true) {
    image();

    // ---- le O bouge avec la croix, un pas toutes les 150 ms (le 0.93.1) ----
    if (chaque(150)) {
      // 1. la case d'ARRIVÉE : on part de la case actuelle (le 0.82).
      //    else if : une seule flèche à la fois, pas de pas en diagonale.
      nx = ox;
      ny = oy;
      if (bouton(DROITE)) {
        nx = ox + 1;
      } else if (bouton(GAUCHE)) {
        nx = ox - 1;
      } else if (bouton(BAS)) {
        ny = oy + 1;
      } else if (bouton(HAUT)) {
        ny = oy - 1;
      }

      // 2. une flèche est tenue (l'arrivée n'est pas la case où l'on est)…
      if (nx != ox || ny != oy) {
        // 3. …et l'arrivée est VIDE : ni X, ni B, ni flamme. (le 0.93.2)
        //    lire() rend 0 pour une case vide : c'est l'espace, la tuile 0.
        if (lire(nx, ny) == 0) {
          effacer(ox, oy, 1);                 // le O quitte sa case…
          if (bombe == 1 && ox == bx && oy == by) {
            poser(bx, by, ALPHABET[1]);         // …mais s'il était sur la bombe, la B apparaît (le 0.93.2)
          }
          ox = nx;                            // …et va sur la case d'arrivée
          oy = ny;
          poser(ox, oy, ALPHABET[14]);
        }
      }
    }

    // ---- A : poser une bombe, là où est le O (le 0.93.2) ----
    // bombe == 0 : une seule bombe à la fois.
    // feu == 0 : pas pendant les flammes (le 0.93.3).
    if (bouton(A) && bombe == 0 && feu == 0) {
      bombe = 1;
      bx = ox;                              // la bombe est sous le O
      by = oy;
      bdelai = 0;                           // on commence à compter (le 0.93.3)
    }

    // ---- la bombe explose au bout de 2 secondes (le 0.93.3) ----
    // image() revient 60 fois par seconde : 120 images, 2 secondes.
    if (bombe == 1) {
      bdelai = bdelai + 1;
      if (bdelai == 120) {
        bombe = 0;                          // plus de bombe…
        fx = bx;                            // …elle explose, là où elle était
        fy = by;
        feu = 1;
        fdelai = 0;
        flammes(1);                         // on dessine les flammes
      }
    }

    // ---- les flammes s'éteignent au bout d'une demi-seconde (30 images) (le 0.93.3) ----
    if (feu == 1) {
      fdelai = fdelai + 1;
      if (fdelai == 30) {
        feu = 0;
        flammes(0);                         // on efface les MÊMES cases
        poser(ox, oy, ALPHABET[14]);        // le O était peut-être dans une flamme : on le remet
      }
    }
  }
}
`,
    aVoir: 'L’explosion fait une croix de 2 cases de chaque côté ; un X arrête le bras.',
    controle: (c) => {
      const tenir = (b, cond, max = 300) => { let t = 0; while (t < max && !cond()) { c.gb.setButton(b, true); c.avancer(1); t++ } c.gb.setButton(b, false); c.avancer(1) }
      c.avancer(20)
      c.presser('a', 3)
      tenir('right', () => c.variable('ox') === 5)
      tenir('b', () => c.variable('feu') === 1, 200)
      c.avancer(2)
      return [
        ['à droite : 2 cases, - - -, puis rien', c.mot(1, 1, 4) === '--- '],
        ['en bas : | en (1, 2) et (1, 3), puis rien', c.mot(1, 2, 1) === '|' && c.mot(1, 3, 1) === '|' && c.mot(1, 4, 1) === ' '],
        ['le cadre arrête le bras de gauche et du haut', c.mot(0, 1, 1) === 'X' && c.mot(1, 0, 1) === 'X'],
        ['le O, à 4 cases, n’est pas touché', c.mot(5, 1, 1) === 'O'],
      ]
    },
  },

  {
    titre: 'Un jeu de bombes — un ennemi W',
    difficulte: 0,
    suite: true,
    idee: 'Le 0.93.4, et un ennemi W, en bas à droite. Toutes les 400 ms, il tire une direction au hasard (hasard() % 4) et y va, si la case est vide.',
    texte: [
      '**C’est le 0.93.4, avec une chose en plus : un ennemi.** Un **W** part du coin en bas à droite, (17, 15), et se promène **au hasard**.',
      '**Ce qui est nouveau ici : une direction tirée au hasard.** `d = hasard() % 4;` : `hasard()` rend un nombre de 0 à 255 (le 0.81.2) ; `% 4` en garde le reste par 4 : **0, 1, 2 ou 3**. Comme `sens` au 0.91.7 : 0 droite, 1 bas, 2 gauche, 3 haut. Exemple : `hasard()` rend 201 ; 201 = 50 × 4 + 1 : `d` vaut 1, le W veut descendre.',
      '**Puis la même méthode que pour le O :** la case d’arrivée dans `nx` et `ny` (`nx` et `ny` servent pour le O, puis pour le W : chacun les calcule juste avant de s’en servir). Si `lire(nx, ny) == 0`, une case **vide**, le W y va. Sinon, il reste ; il tirera une autre direction au pas suivant.',
      '**Une case vide seulement :** comme le O (le 0.93.2), le W ne va ni dans les X, ni sur la bombe, ni dans les flammes, ni sur le O.',
      '**`chaque(400)`** : un pas toutes les 400 ms. Le W est plus lent que le O (150 ms) : on peut le fuir. Ce chronomètre est à lui : il ne gêne pas le `chaque(150)` du O.',
      '**Après les flammes, on redessine aussi le W :** comme le O, il a pu être sous une flamme (pour l’instant, elle ne lui fait rien ; au 0.93.7, si).',
    ],
    code: `// ---- UN JEU DE BOMBES ----
// Les lettres : X = un mur, O = le joueur, B = une bombe, W = un ennemi.
// ALPHABET[23] : le X    ALPHABET[14] : le O
// ALPHABET[1]  : le B    ALPHABET[22] : le W

uint8_t ox = 1;           // le O, le joueur : sa colonne… (le 0.93.1)
uint8_t oy = 1;           // …et sa ligne. Il part du coin (1, 1).
uint8_t nx = 0;           // la case d'ARRIVÉE, calculée AVANT de bouger (le 0.82)
uint8_t ny = 0;
uint8_t bombe = 0;        // 1 : une bombe est posée ; 0 : pas de bombe (le 0.93.2)
uint8_t bx = 0;           // la place de la bombe : sa colonne…
uint8_t by = 0;           // …et sa ligne
uint8_t bdelai = 0;       // les images passées depuis la pose de la bombe (le 0.93.3)
uint8_t feu = 0;          // 1 : les flammes sont à l'écran ; 0 : non
uint8_t fdelai = 0;       // les images passées depuis l'explosion
uint8_t fx = 0;           // le centre de l'explosion : sa colonne…
uint8_t fy = 0;           // …et sa ligne
uint8_t ex = 17;          // NOUVEAU : le W, l'ennemi : sa colonne…
uint8_t ey = 15;          // …et sa ligne. Il part du coin en bas à droite.
uint8_t d = 0;            // NOUVEAU : la direction tirée au hasard, 0 à 3

// ---- UNE case de flamme (le 0.93.3) ----
// allume = 1 : on dessine la flamme ; allume = 0 : on l'efface.
// debout = 1 : une flamme verticale, le | ; debout = 0 : horizontale, le -.
void caseFeu(uint8_t c, uint8_t l, uint8_t allume, uint8_t debout) {
  if (allume == 0) {
    effacer(c, l, 1);                   // la flamme s'éteint : la case est vide
  } else {
    if (debout == 1) {
      texte(c, l, "|");
    } else {
      texte(c, l, "-");
    }
  }
}

// ---- Toute l'explosion (le 0.93.3) : des bras de DEUX cases (le 0.93.4) ----
//
//          |
//          |            chaque bras : jusqu'à 2 cases,
//      - - - - -        mais il s'arrête au premier X.
//          |            break : on sort de la boucle, tout de suite.
//          |
void flammes(uint8_t allume) {
  caseFeu(fx, fy, allume, 0);                     // le centre
  for (uint8_t k = 1; k <= 2; k++) {              // à droite : fx + 1, puis fx + 2
    if (lire(fx + k, fy) == ALPHABET[23]) break;  // un X : le bras s'arrête là
    caseFeu(fx + k, fy, allume, 0);
  }
  for (uint8_t k = 1; k <= 2; k++) {              // à gauche : fx - 1, puis fx - 2
    if (lire(fx - k, fy) == ALPHABET[23]) break;
    caseFeu(fx - k, fy, allume, 0);
  }
  for (uint8_t k = 1; k <= 2; k++) {              // en bas
    if (lire(fx, fy + k) == ALPHABET[23]) break;
    caseFeu(fx, fy + k, allume, 1);
  }
  for (uint8_t k = 1; k <= 2; k++) {              // en haut
    if (lire(fx, fy - k) == ALPHABET[23]) break;
    caseFeu(fx, fy - k, allume, 1);
  }
}

int main() {
  // ---- Le terrain : le cadre et les piliers X (le 0.93) ----
  for (uint8_t l = 0; l < 17; l++) {
    for (uint8_t c = 0; c < 19; c++) {
      if (l == 0 || l == 16 || c == 0 || c == 18) {   // le cadre
        poser(c, l, ALPHABET[23]);
      }
      if (c % 2 == 0 && l % 2 == 0) {                 // les piliers : colonne ET ligne paires
        poser(c, l, ALPHABET[23]);
      }
    }
  }

  poser(ox, oy, ALPHABET[14]);            // le O à sa place (le 0.93)
  poser(ex, ey, ALPHABET[22]);            // NOUVEAU : le W, en bas à droite

  while (true) {
    image();

    // ---- le O bouge avec la croix, un pas toutes les 150 ms (le 0.93.1) ----
    if (chaque(150)) {
      // 1. la case d'ARRIVÉE : on part de la case actuelle (le 0.82).
      //    else if : une seule flèche à la fois, pas de pas en diagonale.
      nx = ox;
      ny = oy;
      if (bouton(DROITE)) {
        nx = ox + 1;
      } else if (bouton(GAUCHE)) {
        nx = ox - 1;
      } else if (bouton(BAS)) {
        ny = oy + 1;
      } else if (bouton(HAUT)) {
        ny = oy - 1;
      }

      // 2. une flèche est tenue (l'arrivée n'est pas la case où l'on est)…
      if (nx != ox || ny != oy) {
        // 3. …et l'arrivée est VIDE : ni X, ni B, ni W, ni flamme. (le 0.93.2)
        //    lire() rend 0 pour une case vide : c'est l'espace, la tuile 0.
        if (lire(nx, ny) == 0) {
          effacer(ox, oy, 1);                 // le O quitte sa case…
          if (bombe == 1 && ox == bx && oy == by) {
            poser(bx, by, ALPHABET[1]);         // …mais s'il était sur la bombe, la B apparaît (le 0.93.2)
          }
          ox = nx;                            // …et va sur la case d'arrivée
          oy = ny;
          poser(ox, oy, ALPHABET[14]);
        }
      }
    }

    // ---- A : poser une bombe, là où est le O (le 0.93.2) ----
    // bombe == 0 : une seule bombe à la fois.
    // feu == 0 : pas pendant les flammes (le 0.93.3).
    if (bouton(A) && bombe == 0 && feu == 0) {
      bombe = 1;
      bx = ox;                              // la bombe est sous le O
      by = oy;
      bdelai = 0;                           // on commence à compter (le 0.93.3)
    }

    // ---- la bombe explose au bout de 2 secondes (le 0.93.3) ----
    // image() revient 60 fois par seconde : 120 images, 2 secondes.
    if (bombe == 1) {
      bdelai = bdelai + 1;
      if (bdelai == 120) {
        bombe = 0;                          // plus de bombe…
        fx = bx;                            // …elle explose, là où elle était
        fy = by;
        feu = 1;
        fdelai = 0;
        flammes(1);                         // on dessine les flammes
      }
    }

    // ---- les flammes s'éteignent au bout d'une demi-seconde (30 images) (le 0.93.3) ----
    if (feu == 1) {
      fdelai = fdelai + 1;
      if (fdelai == 30) {
        feu = 0;
        flammes(0);                         // on efface les MÊMES cases
        poser(ox, oy, ALPHABET[14]);        // le O était peut-être dans une flamme : on le remet
        poser(ex, ey, ALPHABET[22]);        // et le W
      }
    }

    // ---- NOUVEAU : le W se promène au hasard, un pas toutes les 400 ms ----
    if (chaque(400)) {
      d = hasard() % 4;                     // 0 droite, 1 bas, 2 gauche, 3 haut (le 0.81.2)
      nx = ex;
      ny = ey;
      if (d == 0) nx = ex + 1;
      if (d == 1) ny = ey + 1;
      if (d == 2) nx = ex - 1;
      if (d == 3) ny = ey - 1;
      if (lire(nx, ny) == 0) {              // seulement sur une case VIDE
        effacer(ex, ey, 1);
        ex = nx;
        ey = ny;
        poser(ex, ey, ALPHABET[22]);
      }
    }
  }
}
`,
    aVoir: 'Un W se promène au hasard dans les couloirs, sans traverser les X.',
    controle: (c) => {
      c.avancer(20)
      const places = new Set()
      for (let t = 0; t < 20; t++) { c.avancer(24); places.add(c.variable('ex') + ',' + c.variable('ey')) }
      let w = 0
      for (let l = 0; l < 17; l++) w += [...c.mot(0, l, 20)].filter((ch) => ch === 'W').length
      const ex = c.variable('ex'), ey = c.variable('ey')
      return [
        ['il se promène : plusieurs places en 8 secondes', places.size > 1, ` (${places.size} places)`],
        ['un seul W, dans un couloir', w === 1 && c.mot(ex, ey, 1) === 'W' && (ex % 2 === 1 || ey % 2 === 1)],
      ]
    },
  },

  {
    titre: 'Un jeu de bombes — trois ennemis',
    difficulte: 0,
    suite: true,
    idee: 'Le 0.93.5, mais trois W, dans trois coins : leurs places sont dans deux tableaux, ex[3] et ey[3], et une boucle les fait bouger l’un après l’autre.',
    texte: [
      '**C’est le 0.93.5, avec une chose en plus : trois W.** Un en bas à droite, un en haut à droite, un en bas à gauche.',
      '**Ce qui est nouveau ici : les places dans des tableaux.** `uint8_t ex[3];` : trois colonnes, `ex[0]`, `ex[1]` et `ex[2]` ; `ey[3]` : trois lignes. Le W n° `i` est en (`ex[i]`, `ey[i]`). Les tableaux, on les a vus au 0.32 ; plusieurs ennemis dans un tableau, au 0.85.',
      '**Au départ,** on remplit les tableaux une case à la fois : `ex[0] = 17; ey[0] = 15;` (en bas à droite), `ex[1] = 17; ey[1] = 1;` (en haut à droite), `ex[2] = 1; ey[2] = 15;` (en bas à gauche). Puis une boucle pose les trois W.',
      '**Les faire bouger :** le code du 0.93.5, à l’intérieur de `for (uint8_t i = 0; i < 3; i++)`. Partout où il y avait `ex`, on écrit `ex[i]`. Tour `i` = 0 : le W n° 0 tire sa direction et fait son pas ; tour `i` = 1 : le n° 1 ; tour `i` = 2 : le n° 2.',
      '**Chacun tire sa propre direction :** `hasard()` est appelé une fois par W, et rend à chaque fois un autre nombre. Les trois W ne vont donc pas du même côté.',
      '**Un W ne marche pas sur un autre :** la case d’un W n’est pas vide. S’ils se croisent dans un couloir, l’un attend que l’autre parte.',
      '**Pourquoi trois et pas plus ?** Pour ajouter un W, il suffirait d’agrandir les tableaux et de changer le `3` des boucles. On garde trois : assez pour que ce soit difficile.',
    ],
    code: `// ---- UN JEU DE BOMBES ----
// Les lettres : X = un mur, O = le joueur, B = une bombe, W = un ennemi.
// ALPHABET[23] : le X    ALPHABET[14] : le O
// ALPHABET[1]  : le B    ALPHABET[22] : le W

uint8_t ox = 1;           // le O, le joueur : sa colonne… (le 0.93.1)
uint8_t oy = 1;           // …et sa ligne. Il part du coin (1, 1).
uint8_t nx = 0;           // la case d'ARRIVÉE, calculée AVANT de bouger (le 0.82)
uint8_t ny = 0;
uint8_t bombe = 0;        // 1 : une bombe est posée ; 0 : pas de bombe (le 0.93.2)
uint8_t bx = 0;           // la place de la bombe : sa colonne…
uint8_t by = 0;           // …et sa ligne
uint8_t bdelai = 0;       // les images passées depuis la pose de la bombe (le 0.93.3)
uint8_t feu = 0;          // 1 : les flammes sont à l'écran ; 0 : non
uint8_t fdelai = 0;       // les images passées depuis l'explosion
uint8_t fx = 0;           // le centre de l'explosion : sa colonne…
uint8_t fy = 0;           // …et sa ligne
uint8_t ex[3];            // NOUVEAU : les TROIS W : leurs colonnes…
uint8_t ey[3];            // …et leurs lignes. Le W n° i est en (ex[i], ey[i]).
uint8_t d = 0;            // la direction tirée au hasard, 0 à 3 (le 0.93.5)

// ---- UNE case de flamme (le 0.93.3) ----
// allume = 1 : on dessine la flamme ; allume = 0 : on l'efface.
// debout = 1 : une flamme verticale, le | ; debout = 0 : horizontale, le -.
void caseFeu(uint8_t c, uint8_t l, uint8_t allume, uint8_t debout) {
  if (allume == 0) {
    effacer(c, l, 1);                   // la flamme s'éteint : la case est vide
  } else {
    if (debout == 1) {
      texte(c, l, "|");
    } else {
      texte(c, l, "-");
    }
  }
}

// ---- Toute l'explosion (le 0.93.3) : des bras de DEUX cases (le 0.93.4) ----
//
//          |
//          |            chaque bras : jusqu'à 2 cases,
//      - - - - -        mais il s'arrête au premier X.
//          |            break : on sort de la boucle, tout de suite.
//          |
void flammes(uint8_t allume) {
  caseFeu(fx, fy, allume, 0);                     // le centre
  for (uint8_t k = 1; k <= 2; k++) {              // à droite : fx + 1, puis fx + 2
    if (lire(fx + k, fy) == ALPHABET[23]) break;  // un X : le bras s'arrête là
    caseFeu(fx + k, fy, allume, 0);
  }
  for (uint8_t k = 1; k <= 2; k++) {              // à gauche : fx - 1, puis fx - 2
    if (lire(fx - k, fy) == ALPHABET[23]) break;
    caseFeu(fx - k, fy, allume, 0);
  }
  for (uint8_t k = 1; k <= 2; k++) {              // en bas
    if (lire(fx, fy + k) == ALPHABET[23]) break;
    caseFeu(fx, fy + k, allume, 1);
  }
  for (uint8_t k = 1; k <= 2; k++) {              // en haut
    if (lire(fx, fy - k) == ALPHABET[23]) break;
    caseFeu(fx, fy - k, allume, 1);
  }
}

int main() {
  // ---- Le terrain : le cadre et les piliers X (le 0.93) ----
  for (uint8_t l = 0; l < 17; l++) {
    for (uint8_t c = 0; c < 19; c++) {
      if (l == 0 || l == 16 || c == 0 || c == 18) {   // le cadre
        poser(c, l, ALPHABET[23]);
      }
      if (c % 2 == 0 && l % 2 == 0) {                 // les piliers : colonne ET ligne paires
        poser(c, l, ALPHABET[23]);
      }
    }
  }

  poser(ox, oy, ALPHABET[14]);            // le O à sa place (le 0.93)

  // NOUVEAU : les trois W, dans trois coins
  ex[0] = 17;                             // le n° 0 : en bas à droite
  ey[0] = 15;
  ex[1] = 17;                             // le n° 1 : en haut à droite
  ey[1] = 1;
  ex[2] = 1;                              // le n° 2 : en bas à gauche
  ey[2] = 15;
  for (uint8_t i = 0; i < 3; i++) {
    poser(ex[i], ey[i], ALPHABET[22]);
  }

  while (true) {
    image();

    // ---- le O bouge avec la croix, un pas toutes les 150 ms (le 0.93.1) ----
    if (chaque(150)) {
      // 1. la case d'ARRIVÉE : on part de la case actuelle (le 0.82).
      //    else if : une seule flèche à la fois, pas de pas en diagonale.
      nx = ox;
      ny = oy;
      if (bouton(DROITE)) {
        nx = ox + 1;
      } else if (bouton(GAUCHE)) {
        nx = ox - 1;
      } else if (bouton(BAS)) {
        ny = oy + 1;
      } else if (bouton(HAUT)) {
        ny = oy - 1;
      }

      // 2. une flèche est tenue (l'arrivée n'est pas la case où l'on est)…
      if (nx != ox || ny != oy) {
        // 3. …et l'arrivée est VIDE : ni X, ni B, ni W, ni flamme. (le 0.93.2)
        //    lire() rend 0 pour une case vide : c'est l'espace, la tuile 0.
        if (lire(nx, ny) == 0) {
          effacer(ox, oy, 1);                 // le O quitte sa case…
          if (bombe == 1 && ox == bx && oy == by) {
            poser(bx, by, ALPHABET[1]);         // …mais s'il était sur la bombe, la B apparaît (le 0.93.2)
          }
          ox = nx;                            // …et va sur la case d'arrivée
          oy = ny;
          poser(ox, oy, ALPHABET[14]);
        }
      }
    }

    // ---- A : poser une bombe, là où est le O (le 0.93.2) ----
    // bombe == 0 : une seule bombe à la fois.
    // feu == 0 : pas pendant les flammes (le 0.93.3).
    if (bouton(A) && bombe == 0 && feu == 0) {
      bombe = 1;
      bx = ox;                              // la bombe est sous le O
      by = oy;
      bdelai = 0;                           // on commence à compter (le 0.93.3)
    }

    // ---- la bombe explose au bout de 2 secondes (le 0.93.3) ----
    // image() revient 60 fois par seconde : 120 images, 2 secondes.
    if (bombe == 1) {
      bdelai = bdelai + 1;
      if (bdelai == 120) {
        bombe = 0;                          // plus de bombe…
        fx = bx;                            // …elle explose, là où elle était
        fy = by;
        feu = 1;
        fdelai = 0;
        flammes(1);                         // on dessine les flammes
      }
    }

    // ---- les flammes s'éteignent au bout d'une demi-seconde (30 images) (le 0.93.3) ----
    if (feu == 1) {
      fdelai = fdelai + 1;
      if (fdelai == 30) {
        feu = 0;
        flammes(0);                         // on efface les MÊMES cases
        poser(ox, oy, ALPHABET[14]);        // le O était peut-être dans une flamme : on le remet
        for (uint8_t i = 0; i < 3; i++) {   // et les W
          poser(ex[i], ey[i], ALPHABET[22]);
        }
      }
    }

    // ---- les W se promènent au hasard (le 0.93.5) : NOUVEAU : les TROIS, un par un ----
    if (chaque(400)) {
      for (uint8_t i = 0; i < 3; i++) {
        d = hasard() % 4;                     // sa direction, au hasard (le 0.93.5)
        nx = ex[i];
        ny = ey[i];
        if (d == 0) nx = ex[i] + 1;
        if (d == 1) ny = ey[i] + 1;
        if (d == 2) nx = ex[i] - 1;
        if (d == 3) ny = ey[i] - 1;
        if (lire(nx, ny) == 0) {              // seulement sur une case VIDE
          effacer(ex[i], ey[i], 1);
          ex[i] = nx;
          ey[i] = ny;
          poser(ex[i], ey[i], ALPHABET[22]);
        }
      }
    }
  }
}
`,
    aVoir: 'Trois W partent de trois coins et se promènent chacun de son côté.',
    controle: (c) => {
      const lesW = () => {
        let w = 0
        for (let l = 0; l < 17; l++) w += [...c.mot(0, l, 20)].filter((ch) => ch === 'W').length
        return w
      }
      c.avancer(20)
      const debut = lesW()
      c.avancer(400)
      const w = lesW()
      return [
        ['au départ, trois W', debut === 3, ` (${debut})`],
        ['après un moment, toujours trois W à l’écran', w === 3, ` (${w})`],
      ]
    },
  },

  {
    titre: 'Un jeu de bombes — la flamme détruit les W',
    difficulte: 0,
    suite: true,
    idee: 'Le 0.93.6, et une flamme qui tombe sur un W le détruit : vivant[i] passe à 0, le score gagne 1. Un W détruit ne bouge plus.',
    texte: [
      '**C’est le 0.93.6, avec une chose en plus : détruire les W.** Si une flamme tombe sur un W, il disparaît, et le **score** gagne 1. Le score s’affiche sous le terrain, ligne 17.',
      '**Un troisième tableau, `vivant[3]` :** `vivant[i]` vaut 1 si le W n° `i` est là, 0 s’il a été détruit. Au départ, les trois valent 1.',
      '**Ce qui est nouveau ici : chercher QUEL W est sous la flamme.** Dans `caseFeu`, juste avant d’écrire une flamme : `if (lire(c, l) == ALPHABET[22])` : « y a-t-il un W sur cette case ? ». L’écran dit **qu’il y a** un W, mais pas **lequel**. La fonction `toucheW(c, l)` le cherche : elle passe sur les trois, et celui qui est **vivant ET** en (`c`, `l`) est détruit : `vivant[i] = 0;`, `score = score + 1;`.',
      '**`vivant[i] == 1 && ex[i] == c && ey[i] == l` :** trois conditions, toutes vraies à la fois (`&&`, le 0.75). `vivant[i] == 1` évite de compter deux fois un W déjà détruit qui aurait gardé la même place.',
      '**La flamme recouvre le W :** `texte()` écrit la flamme **par-dessus** la lettre W. Quand la flamme s’éteint, `effacer()` vide la case : le W a disparu de l’écran.',
      '**Un W détruit ne fait plus rien :** dans la boucle des W, `if (vivant[i] == 1)` entoure tout son pas. Après les flammes, on ne redessine que les W vivants.',
      '**Le score :** `texte(0, 17, "SCORE")` une fois au départ, puis `nombre(6, 17, score)` à chaque image, comme dans le serpent.',
      '**`toucheW` est écrite avant `caseFeu` :** en C++, une fonction doit être écrite **avant** celles qui l’appellent.',
    ],
    code: `// ---- UN JEU DE BOMBES ----
// Les lettres : X = un mur, O = le joueur, B = une bombe, W = un ennemi.
// ALPHABET[23] : le X    ALPHABET[14] : le O
// ALPHABET[1]  : le B    ALPHABET[22] : le W

uint8_t ox = 1;           // le O, le joueur : sa colonne… (le 0.93.1)
uint8_t oy = 1;           // …et sa ligne. Il part du coin (1, 1).
uint8_t nx = 0;           // la case d'ARRIVÉE, calculée AVANT de bouger (le 0.82)
uint8_t ny = 0;
uint8_t bombe = 0;        // 1 : une bombe est posée ; 0 : pas de bombe (le 0.93.2)
uint8_t bx = 0;           // la place de la bombe : sa colonne…
uint8_t by = 0;           // …et sa ligne
uint8_t bdelai = 0;       // les images passées depuis la pose de la bombe (le 0.93.3)
uint8_t feu = 0;          // 1 : les flammes sont à l'écran ; 0 : non
uint8_t fdelai = 0;       // les images passées depuis l'explosion
uint8_t fx = 0;           // le centre de l'explosion : sa colonne…
uint8_t fy = 0;           // …et sa ligne
uint8_t ex[3];            // les TROIS W : leurs colonnes… (le 0.93.6)
uint8_t ey[3];            // …et leurs lignes. Le W n° i est en (ex[i], ey[i]).
uint8_t d = 0;            // la direction tirée au hasard, 0 à 3 (le 0.93.5)
uint8_t vivant[3];        // NOUVEAU : vivant[i] : 1 si le W n° i est là, 0 s'il est détruit
uint8_t score = 0;        // les W détruits

// ---- NOUVEAU : une flamme sur la case (c, l) : y a-t-il un W ? ----
// On cherche le W n° i qui est vivant ET sur cette case. S'il y en a un,
// il est détruit (vivant[i] = 0) et le score gagne 1.
void toucheW(uint8_t c, uint8_t l) {
  for (uint8_t i = 0; i < 3; i++) {
    if (vivant[i] == 1 && ex[i] == c && ey[i] == l) {
      vivant[i] = 0;
      score = score + 1;
    }
  }
}

// ---- UNE case de flamme (le 0.93.3) ----
// allume = 1 : on dessine la flamme ; allume = 0 : on l'efface.
// debout = 1 : une flamme verticale, le | ; debout = 0 : horizontale, le -.
void caseFeu(uint8_t c, uint8_t l, uint8_t allume, uint8_t debout) {
  if (allume == 0) {
    effacer(c, l, 1);                   // la flamme s'éteint : la case est vide
  } else {
    if (lire(c, l) == ALPHABET[22]) {   // NOUVEAU : un W sous la flamme ?
      toucheW(c, l);
    }
    if (debout == 1) {
      texte(c, l, "|");
    } else {
      texte(c, l, "-");
    }
  }
}

// ---- Toute l'explosion (le 0.93.3) : des bras de DEUX cases (le 0.93.4) ----
//
//          |
//          |            chaque bras : jusqu'à 2 cases,
//      - - - - -        mais il s'arrête au premier X.
//          |            break : on sort de la boucle, tout de suite.
//          |
void flammes(uint8_t allume) {
  caseFeu(fx, fy, allume, 0);                     // le centre
  for (uint8_t k = 1; k <= 2; k++) {              // à droite : fx + 1, puis fx + 2
    if (lire(fx + k, fy) == ALPHABET[23]) break;  // un X : le bras s'arrête là
    caseFeu(fx + k, fy, allume, 0);
  }
  for (uint8_t k = 1; k <= 2; k++) {              // à gauche : fx - 1, puis fx - 2
    if (lire(fx - k, fy) == ALPHABET[23]) break;
    caseFeu(fx - k, fy, allume, 0);
  }
  for (uint8_t k = 1; k <= 2; k++) {              // en bas
    if (lire(fx, fy + k) == ALPHABET[23]) break;
    caseFeu(fx, fy + k, allume, 1);
  }
  for (uint8_t k = 1; k <= 2; k++) {              // en haut
    if (lire(fx, fy - k) == ALPHABET[23]) break;
    caseFeu(fx, fy - k, allume, 1);
  }
}

int main() {
  // ---- Le terrain : le cadre et les piliers X (le 0.93) ----
  for (uint8_t l = 0; l < 17; l++) {
    for (uint8_t c = 0; c < 19; c++) {
      if (l == 0 || l == 16 || c == 0 || c == 18) {   // le cadre
        poser(c, l, ALPHABET[23]);
      }
      if (c % 2 == 0 && l % 2 == 0) {                 // les piliers : colonne ET ligne paires
        poser(c, l, ALPHABET[23]);
      }
    }
  }

  poser(ox, oy, ALPHABET[14]);            // le O à sa place (le 0.93)

  // les trois W, dans trois coins (le 0.93.6)
  ex[0] = 17;                             // le n° 0 : en bas à droite
  ey[0] = 15;
  ex[1] = 17;                             // le n° 1 : en haut à droite
  ey[1] = 1;
  ex[2] = 1;                              // le n° 2 : en bas à gauche
  ey[2] = 15;
  for (uint8_t i = 0; i < 3; i++) {
    vivant[i] = 1;                        // NOUVEAU : au départ, les trois sont vivants
    poser(ex[i], ey[i], ALPHABET[22]);
  }
  texte(0, 17, "SCORE");                  // NOUVEAU : le score, sous le terrain

  while (true) {
    image();

    // ---- le O bouge avec la croix, un pas toutes les 150 ms (le 0.93.1) ----
    if (chaque(150)) {
      // 1. la case d'ARRIVÉE : on part de la case actuelle (le 0.82).
      //    else if : une seule flèche à la fois, pas de pas en diagonale.
      nx = ox;
      ny = oy;
      if (bouton(DROITE)) {
        nx = ox + 1;
      } else if (bouton(GAUCHE)) {
        nx = ox - 1;
      } else if (bouton(BAS)) {
        ny = oy + 1;
      } else if (bouton(HAUT)) {
        ny = oy - 1;
      }

      // 2. une flèche est tenue (l'arrivée n'est pas la case où l'on est)…
      if (nx != ox || ny != oy) {
        // 3. …et l'arrivée est VIDE : ni X, ni B, ni W, ni flamme. (le 0.93.2)
        //    lire() rend 0 pour une case vide : c'est l'espace, la tuile 0.
        if (lire(nx, ny) == 0) {
          effacer(ox, oy, 1);                 // le O quitte sa case…
          if (bombe == 1 && ox == bx && oy == by) {
            poser(bx, by, ALPHABET[1]);         // …mais s'il était sur la bombe, la B apparaît (le 0.93.2)
          }
          ox = nx;                            // …et va sur la case d'arrivée
          oy = ny;
          poser(ox, oy, ALPHABET[14]);
        }
      }
    }

    // ---- A : poser une bombe, là où est le O (le 0.93.2) ----
    // bombe == 0 : une seule bombe à la fois.
    // feu == 0 : pas pendant les flammes (le 0.93.3).
    if (bouton(A) && bombe == 0 && feu == 0) {
      bombe = 1;
      bx = ox;                              // la bombe est sous le O
      by = oy;
      bdelai = 0;                           // on commence à compter (le 0.93.3)
    }

    // ---- la bombe explose au bout de 2 secondes (le 0.93.3) ----
    // image() revient 60 fois par seconde : 120 images, 2 secondes.
    if (bombe == 1) {
      bdelai = bdelai + 1;
      if (bdelai == 120) {
        bombe = 0;                          // plus de bombe…
        fx = bx;                            // …elle explose, là où elle était
        fy = by;
        feu = 1;
        fdelai = 0;
        flammes(1);                         // on dessine les flammes
      }
    }

    // ---- les flammes s'éteignent au bout d'une demi-seconde (30 images) (le 0.93.3) ----
    if (feu == 1) {
      fdelai = fdelai + 1;
      if (fdelai == 30) {
        feu = 0;
        flammes(0);                         // on efface les MÊMES cases
        poser(ox, oy, ALPHABET[14]);        // le O était peut-être dans une flamme : on le remet
        for (uint8_t i = 0; i < 3; i++) {   // et les W encore vivants
          if (vivant[i] == 1) {
            poser(ex[i], ey[i], ALPHABET[22]);
          }
        }
      }
    }

    // ---- les W se promènent au hasard (le 0.93.5) : les TROIS, un par un (le 0.93.6) ----
    if (chaque(400)) {
      for (uint8_t i = 0; i < 3; i++) {
        if (vivant[i] == 1) {               // NOUVEAU : un W détruit ne bouge plus
          d = hasard() % 4;                     // sa direction, au hasard (le 0.93.5)
          nx = ex[i];
          ny = ey[i];
          if (d == 0) nx = ex[i] + 1;
          if (d == 1) ny = ey[i] + 1;
          if (d == 2) nx = ex[i] - 1;
          if (d == 3) ny = ey[i] - 1;
          if (lire(nx, ny) == 0) {              // seulement sur une case VIDE
            effacer(ex[i], ey[i], 1);
            ex[i] = nx;
            ey[i] = ny;
            poser(ex[i], ey[i], ALPHABET[22]);
          }
        }
      }
    }

    nombre(6, 17, score);                   // NOUVEAU : le score, à chaque image
  }
}
`,
    aVoir: 'Pose des bombes sur le chemin des W : une flamme qui en touche un le détruit, et le SCORE monte.',
    controle: (c) => {
      const tenir = (b, cond, max = 300) => { let t = 0; while (t < max && !cond()) { c.gb.setButton(b, true); c.avancer(1); t++ } c.gb.setButton(b, false); c.avancer(1) }
      c.avancer(20)
      const depart = c.mot(0, 17, 9) === 'SCORE 000'
      // le robot : il pose une bombe en (9, 7), s'abrite en (11, 8), attend la fin des flammes, et revient
      const v = (n) => c.variable(n)
      const fini = () => false
      tenir('right', () => v('ox') === 9)
      tenir('down', () => v('oy') === 7)
      for (let tour = 0; tour < 40 && !v('score') >= 1 && !fini(); tour++) {
        c.presser('a', 3)
        tenir('right', () => v('ox') === 11 || fini(), 60)
        tenir('down', () => v('oy') === 8 || fini(), 60)
        tenir('b', () => v('feu') === 1 || fini(), 200)
        tenir('b', () => v('feu') === 0 || fini(), 100)
        tenir('up', () => v('oy') === 7 || fini(), 60)
        tenir('left', () => v('ox') === 9 || fini(), 60)
      }
      let w = 0
      for (let l = 0; l < 17; l++) w += [...c.mot(0, l, 20)].filter((ch) => ch === 'W').length
      return [
        ['au départ : SCORE 000', depart],
        ['à force de bombes, un W est détruit', v('score') >= 1, ` (score = ${v('score')})`],
        ['il ne reste que les W vivants à l’écran', w === 3 - v('score'), ` (${w} W)`],
      ]
    },
  },

  {
    titre: 'Un jeu de bombes — touché : la partie s’arrête',
    difficulte: 0,
    suite: true,
    idee: 'Le 0.93.7, et le O peut perdre : touché par un W, ou par une flamme. L’écran FIN montre le score ; START relance une partie (nouvellePartie(), comme au 0.91.2).',
    texte: [
      '**C’est le 0.93.7, avec une chose en plus : on peut perdre.** Le O est **touché** si un W arrive sur lui, s’il marche sur un W ou dans une flamme, ou si une flamme tombe sur lui (attention à sa propre bombe !). Alors, l’écran **FIN** et le score ; **START** : on rejoue.',
      '**Ce qui est nouveau ici : `mort`, un drapeau.** `uint8_t mort = 0;` passe à 1 dès que le O est touché, **où que ce soit** dans le programme. On ne s’arrête pas tout de suite : à la **fin** du tour, `if (mort == 1) finPartie();`. Ainsi, on n’écrit jamais l’écran FIN au milieu d’une explosion.',
      '**Les trois façons d’être touché :** 1. Dans `caseFeu` : la flamme tombe sur le O (`c == ox && l == oy`). 2. Dans la boucle des W : l’arrivée du W est la case du O (`nx == ox && ny == oy`). 3. Quand le O bouge : l’arrivée n’est pas vide, **et** ce n’est ni un X, ni une B. Qu’est-ce qui reste ? **Un W ou une flamme.** `else if (lire(nx, ny) != ALPHABET[23] && lire(nx, ny) != ALPHABET[1])`.',
      '**Deux écrans :** `ecran` vaut 0 pour le JEU, 1 pour la FIN, comme dans le serpent (le 0.91). Tout le jeu est dans `if (ecran == 0) { … }` ; sur la fin, seul START compte.',
      '**Rejouer : tout remettre au départ.** Le début de `main()` (le terrain, le O, les W, le SCORE) devient la fonction **`nouvellePartie()`**, avec en plus les remises à zéro : le O en (1, 1), pas de bombe, pas de flammes, le score à 0, `mort` à 0. `main()` l’appelle une fois au début, et START l’appelle à chaque nouvelle partie. `viderEcran()` et `finPartie()` sont celles du serpent.',
      '**Déroulons : A, et on ne bouge pas.** La bombe est sous le O. 2 secondes après, `flammes(1)` : le centre est la case du O : `mort = 1`. À la fin du tour : `finPartie()`, FIN, SCORE 000.',
    ],
    code: `// ---- UN JEU DE BOMBES ----
// Les lettres : X = un mur, O = le joueur, B = une bombe, W = un ennemi.
// ALPHABET[23] : le X    ALPHABET[14] : le O
// ALPHABET[1]  : le B    ALPHABET[22] : le W

uint8_t ox = 1;           // le O, le joueur : sa colonne… (le 0.93.1)
uint8_t oy = 1;           // …et sa ligne. Il part du coin (1, 1).
uint8_t nx = 0;           // la case d'ARRIVÉE, calculée AVANT de bouger (le 0.82)
uint8_t ny = 0;
uint8_t bombe = 0;        // 1 : une bombe est posée ; 0 : pas de bombe (le 0.93.2)
uint8_t bx = 0;           // la place de la bombe : sa colonne…
uint8_t by = 0;           // …et sa ligne
uint8_t bdelai = 0;       // les images passées depuis la pose de la bombe (le 0.93.3)
uint8_t feu = 0;          // 1 : les flammes sont à l'écran ; 0 : non
uint8_t fdelai = 0;       // les images passées depuis l'explosion
uint8_t fx = 0;           // le centre de l'explosion : sa colonne…
uint8_t fy = 0;           // …et sa ligne
uint8_t ex[3];            // les TROIS W : leurs colonnes… (le 0.93.6)
uint8_t ey[3];            // …et leurs lignes. Le W n° i est en (ex[i], ey[i]).
uint8_t d = 0;            // la direction tirée au hasard, 0 à 3 (le 0.93.5)
uint8_t vivant[3];        // vivant[i] : 1 si le W n° i est là, 0 s'il est détruit (le 0.93.7)
uint8_t score = 0;        // les W détruits
uint8_t ecran = 0;        // NOUVEAU : 0 = le JEU, 1 = la FIN
uint8_t mort = 0;         // 1 : le O vient d'être touché

// ---- une flamme sur la case (c, l) : y a-t-il un W ? (le 0.93.7) ----
// On cherche le W n° i qui est vivant ET sur cette case. S'il y en a un,
// il est détruit (vivant[i] = 0) et le score gagne 1.
void toucheW(uint8_t c, uint8_t l) {
  for (uint8_t i = 0; i < 3; i++) {
    if (vivant[i] == 1 && ex[i] == c && ey[i] == l) {
      vivant[i] = 0;
      score = score + 1;
    }
  }
}

// ---- UNE case de flamme (le 0.93.3) ----
// allume = 1 : on dessine la flamme ; allume = 0 : on l'efface.
// debout = 1 : une flamme verticale, le | ; debout = 0 : horizontale, le -.
void caseFeu(uint8_t c, uint8_t l, uint8_t allume, uint8_t debout) {
  if (allume == 0) {
    effacer(c, l, 1);                   // la flamme s'éteint : la case est vide
  } else {
    if (lire(c, l) == ALPHABET[22]) {   // un W sous la flamme ? (le 0.93.7)
      toucheW(c, l);
    }
    if (c == ox && l == oy) {           // NOUVEAU : le O sous la flamme : perdu
      mort = 1;
    }
    if (debout == 1) {
      texte(c, l, "|");
    } else {
      texte(c, l, "-");
    }
  }
}

// ---- Toute l'explosion (le 0.93.3) : des bras de DEUX cases (le 0.93.4) ----
//
//          |
//          |            chaque bras : jusqu'à 2 cases,
//      - - - - -        mais il s'arrête au premier X.
//          |            break : on sort de la boucle, tout de suite.
//          |
void flammes(uint8_t allume) {
  caseFeu(fx, fy, allume, 0);                     // le centre
  for (uint8_t k = 1; k <= 2; k++) {              // à droite : fx + 1, puis fx + 2
    if (lire(fx + k, fy) == ALPHABET[23]) break;  // un X : le bras s'arrête là
    caseFeu(fx + k, fy, allume, 0);
  }
  for (uint8_t k = 1; k <= 2; k++) {              // à gauche : fx - 1, puis fx - 2
    if (lire(fx - k, fy) == ALPHABET[23]) break;
    caseFeu(fx - k, fy, allume, 0);
  }
  for (uint8_t k = 1; k <= 2; k++) {              // en bas
    if (lire(fx, fy + k) == ALPHABET[23]) break;
    caseFeu(fx, fy + k, allume, 1);
  }
  for (uint8_t k = 1; k <= 2; k++) {              // en haut
    if (lire(fx, fy - k) == ALPHABET[23]) break;
    caseFeu(fx, fy - k, allume, 1);
  }
}

// ---- NOUVEAU : vider l'écran, comme dans le serpent ----
void viderEcran() {
  for (uint8_t l = 0; l < 18; l++) {
    effacer(0, l, 20);
  }
}

// ---- NOUVEAU : une partie qui commence, TOUT au départ ----
// C'était le début de main() ; c'est maintenant une fonction, pour pouvoir
// la rappeler quand on rejoue.
void nouvellePartie() {
  ox = 1;                               // le O revient dans son coin
  oy = 1;
  bombe = 0;                            // pas de bombe
  feu = 0;                              // pas de flammes
  score = 0;
  mort = 0;
  ecran = 0;                            // on est sur le JEU
  viderEcran();

  // ---- Le terrain : le cadre et les piliers X (le 0.93) ----
  for (uint8_t l = 0; l < 17; l++) {
    for (uint8_t c = 0; c < 19; c++) {
      if (l == 0 || l == 16 || c == 0 || c == 18) {   // le cadre
        poser(c, l, ALPHABET[23]);
      }
      if (c % 2 == 0 && l % 2 == 0) {                 // les piliers : colonne ET ligne paires
        poser(c, l, ALPHABET[23]);
      }
    }
  }

  poser(ox, oy, ALPHABET[14]);            // le O à sa place (le 0.93)

  // les trois W, dans trois coins (le 0.93.6)
  ex[0] = 17;                             // le n° 0 : en bas à droite
  ey[0] = 15;
  ex[1] = 17;                             // le n° 1 : en haut à droite
  ey[1] = 1;
  ex[2] = 1;                              // le n° 2 : en bas à gauche
  ey[2] = 15;
  for (uint8_t i = 0; i < 3; i++) {
    vivant[i] = 1;                        // au départ, les trois sont vivants
    poser(ex[i], ey[i], ALPHABET[22]);
  }
  texte(0, 17, "SCORE");                  // le score, sous le terrain (le 0.93.7)
}

// ---- NOUVEAU : la partie s'arrête : l'écran FIN ----
void finPartie() {
  ecran = 1;                            // on est sur la FIN
  viderEcran();
  texte(8, 6, "FIN");
  texte(5, 9, "SCORE");
  nombre(11, 9, score);
  texte(2, 13, "START : REJOUER");
}

int main() {
  nouvellePartie();                     // NOUVEAU : la première partie

  while (true) {
    image();

    if (ecran == 0) {                   // NOUVEAU : le JEU
      // ---- le O bouge avec la croix, un pas toutes les 150 ms (le 0.93.1) ----
      if (chaque(150)) {
        // 1. la case d'ARRIVÉE : on part de la case actuelle (le 0.82).
        //    else if : une seule flèche à la fois, pas de pas en diagonale.
        nx = ox;
        ny = oy;
        if (bouton(DROITE)) {
          nx = ox + 1;
        } else if (bouton(GAUCHE)) {
          nx = ox - 1;
        } else if (bouton(BAS)) {
          ny = oy + 1;
        } else if (bouton(HAUT)) {
          ny = oy - 1;
        }

        // 2. une flèche est tenue (l'arrivée n'est pas la case où l'on est)…
        if (nx != ox || ny != oy) {
          // 3. l'arrivée est VIDE (le 0.93.2) : le O y va.
          if (lire(nx, ny) == 0) {
            effacer(ox, oy, 1);                 // le O quitte sa case…
            if (bombe == 1 && ox == bx && oy == by) {
              poser(bx, by, ALPHABET[1]);         // …mais s'il était sur la bombe, la B apparaît (le 0.93.2)
            }
            ox = nx;                            // …et va sur la case d'arrivée
            oy = ny;
            poser(ox, oy, ALPHABET[14]);
          } else if (lire(nx, ny) != ALPHABET[23] && lire(nx, ny) != ALPHABET[1]) {
            mort = 1;                         // NOUVEAU : ni vide, ni X, ni B : un W ou une flamme !
          }
        }
      }

      // ---- A : poser une bombe, là où est le O (le 0.93.2) ----
      // bombe == 0 : une seule bombe à la fois.
      // feu == 0 : pas pendant les flammes (le 0.93.3).
      if (bouton(A) && bombe == 0 && feu == 0) {
        bombe = 1;
        bx = ox;                              // la bombe est sous le O
        by = oy;
        bdelai = 0;                           // on commence à compter (le 0.93.3)
      }

      // ---- la bombe explose au bout de 2 secondes (le 0.93.3) ----
      // image() revient 60 fois par seconde : 120 images, 2 secondes.
      if (bombe == 1) {
        bdelai = bdelai + 1;
        if (bdelai == 120) {
          bombe = 0;                          // plus de bombe…
          fx = bx;                            // …elle explose, là où elle était
          fy = by;
          feu = 1;
          fdelai = 0;
          flammes(1);                         // on dessine les flammes
        }
      }

      // ---- les flammes s'éteignent au bout d'une demi-seconde (30 images) (le 0.93.3) ----
      if (feu == 1) {
        fdelai = fdelai + 1;
        if (fdelai == 30) {
          feu = 0;
          flammes(0);                         // on efface les MÊMES cases
          poser(ox, oy, ALPHABET[14]);        // le O était peut-être dans une flamme : on le remet
          for (uint8_t i = 0; i < 3; i++) {   // et les W encore vivants
            if (vivant[i] == 1) {
              poser(ex[i], ey[i], ALPHABET[22]);
            }
          }
        }
      }

      // ---- les W se promènent au hasard (le 0.93.5) : les TROIS, un par un (le 0.93.6) ----
      if (chaque(400)) {
        for (uint8_t i = 0; i < 3; i++) {
          if (vivant[i] == 1) {               // un W détruit ne bouge plus (le 0.93.7)
            d = hasard() % 4;                     // sa direction, au hasard (le 0.93.5)
            nx = ex[i];
            ny = ey[i];
            if (d == 0) nx = ex[i] + 1;
            if (d == 1) ny = ey[i] + 1;
            if (d == 2) nx = ex[i] - 1;
            if (d == 3) ny = ey[i] - 1;
            if (nx == ox && ny == oy) {
              mort = 1;                           // NOUVEAU : le W arrive sur le O : perdu
            }
            if (lire(nx, ny) == 0) {              // seulement sur une case VIDE
              effacer(ex[i], ey[i], 1);
              ex[i] = nx;
              ey[i] = ny;
              poser(ex[i], ey[i], ALPHABET[22]);
            }
          }
        }
      }

      nombre(6, 17, score);                   // le score, à chaque image (le 0.93.7)

      // ---- NOUVEAU : touché (par un W ou une flamme) : la partie s'arrête ----
      if (mort == 1) {
        finPartie();
      }
    }

    // ---- NOUVEAU : sur la FIN, START : on rejoue ----
    if (ecran == 1 && bouton(START)) {
      nouvellePartie();
    }
  }
}
`,
    aVoir: 'Touché par un W ou par une flamme : FIN et le score. START : une nouvelle partie.',
    controle: (c) => {
      c.avancer(20)
      c.presser('a', 3)
      c.avancer(150)
      const ecran = c.variable('ecran')
      const fin = ecran === 1 && c.mot(8, 6, 3) === 'FIN' && c.mot(11, 9, 3) === '000'
      c.presser('start', 6)
      c.avancer(30)
      return [
        ['sa propre bombe, sans bouger : FIN, SCORE 000', fin, ` (ecran = ${ecran})`],
        ['START : une nouvelle partie', c.variable('ecran') === 0 && c.variable('mort') === 0 && c.mot(1, 1, 1) === 'O' && c.mot(0, 0, 19) === 'X'.repeat(19)],
        ['les trois W sont revenus', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].reduce((n, l) => n + [...c.mot(0, l, 20)].filter((ch) => ch === 'W').length, 0) === 3],
      ]
    },
  },

  {
    titre: 'Un jeu de bombes — les trois W détruits : gagné',
    difficulte: 0,
    suite: true,
    idee: 'Le 0.93.8, et une façon de gagner : quand le score arrive à 3, les trois W sont détruits. L’écran FIN, avec BRAVO ! au-dessus.',
    texte: [
      '**C’est le 0.93.8, avec une chose en plus : gagner.** Quand les **trois** W sont détruits, la partie s’arrête sur **BRAVO !**, au-dessus de FIN et du score.',
      '**Ce qui est nouveau ici : savoir qu’il ne reste plus de W.** On pourrait regarder `vivant[0]`, `vivant[1]` et `vivant[2]`. Plus simple : chaque W détruit ajoute **1** au score, et un W ne peut être détruit qu’une fois (le `vivant[i] == 1` du 0.93.7). Donc **`score == 3`** veut dire : les trois sont détruits.',
      '**À la fin du tour, avec `mort` :** `if (mort == 1) { … } else if (score == 3) { … }`. **Perdre passe d’abord :** si la dernière flamme détruit le dernier W **et** touche le O, c’est perdu.',
      '**Gagner réutilise `finPartie()` :** le même écran FIN, le score (003), START pour rejouer. On ajoute juste `texte(6, 3, "BRAVO !")` au-dessus. Le point d’exclamation fait partie des signes de la console.',
      '**Le jeu est complet :** se déplacer, poser des bombes, fuir les flammes et les W, les détruire tous. **Pour aller plus loin :** des briques qu’une bombe peut casser, plusieurs bombes à la fois, des flammes plus longues en bonus, des W plus rapides à chaque niveau…',
    ],
    code: `// ---- UN JEU DE BOMBES ----
// Les lettres : X = un mur, O = le joueur, B = une bombe, W = un ennemi.
// ALPHABET[23] : le X    ALPHABET[14] : le O
// ALPHABET[1]  : le B    ALPHABET[22] : le W

uint8_t ox = 1;           // le O, le joueur : sa colonne… (le 0.93.1)
uint8_t oy = 1;           // …et sa ligne. Il part du coin (1, 1).
uint8_t nx = 0;           // la case d'ARRIVÉE, calculée AVANT de bouger (le 0.82)
uint8_t ny = 0;
uint8_t bombe = 0;        // 1 : une bombe est posée ; 0 : pas de bombe (le 0.93.2)
uint8_t bx = 0;           // la place de la bombe : sa colonne…
uint8_t by = 0;           // …et sa ligne
uint8_t bdelai = 0;       // les images passées depuis la pose de la bombe (le 0.93.3)
uint8_t feu = 0;          // 1 : les flammes sont à l'écran ; 0 : non
uint8_t fdelai = 0;       // les images passées depuis l'explosion
uint8_t fx = 0;           // le centre de l'explosion : sa colonne…
uint8_t fy = 0;           // …et sa ligne
uint8_t ex[3];            // les TROIS W : leurs colonnes… (le 0.93.6)
uint8_t ey[3];            // …et leurs lignes. Le W n° i est en (ex[i], ey[i]).
uint8_t d = 0;            // la direction tirée au hasard, 0 à 3 (le 0.93.5)
uint8_t vivant[3];        // vivant[i] : 1 si le W n° i est là, 0 s'il est détruit (le 0.93.7)
uint8_t score = 0;        // les W détruits
uint8_t ecran = 0;        // 0 = le JEU, 1 = la FIN (le 0.93.8)
uint8_t mort = 0;         // 1 : le O vient d'être touché

// ---- une flamme sur la case (c, l) : y a-t-il un W ? (le 0.93.7) ----
// On cherche le W n° i qui est vivant ET sur cette case. S'il y en a un,
// il est détruit (vivant[i] = 0) et le score gagne 1.
void toucheW(uint8_t c, uint8_t l) {
  for (uint8_t i = 0; i < 3; i++) {
    if (vivant[i] == 1 && ex[i] == c && ey[i] == l) {
      vivant[i] = 0;
      score = score + 1;
    }
  }
}

// ---- UNE case de flamme (le 0.93.3) ----
// allume = 1 : on dessine la flamme ; allume = 0 : on l'efface.
// debout = 1 : une flamme verticale, le | ; debout = 0 : horizontale, le -.
void caseFeu(uint8_t c, uint8_t l, uint8_t allume, uint8_t debout) {
  if (allume == 0) {
    effacer(c, l, 1);                   // la flamme s'éteint : la case est vide
  } else {
    if (lire(c, l) == ALPHABET[22]) {   // un W sous la flamme ? (le 0.93.7)
      toucheW(c, l);
    }
    if (c == ox && l == oy) {           // le O sous la flamme : perdu (le 0.93.8)
      mort = 1;
    }
    if (debout == 1) {
      texte(c, l, "|");
    } else {
      texte(c, l, "-");
    }
  }
}

// ---- Toute l'explosion (le 0.93.3) : des bras de DEUX cases (le 0.93.4) ----
//
//          |
//          |            chaque bras : jusqu'à 2 cases,
//      - - - - -        mais il s'arrête au premier X.
//          |            break : on sort de la boucle, tout de suite.
//          |
void flammes(uint8_t allume) {
  caseFeu(fx, fy, allume, 0);                     // le centre
  for (uint8_t k = 1; k <= 2; k++) {              // à droite : fx + 1, puis fx + 2
    if (lire(fx + k, fy) == ALPHABET[23]) break;  // un X : le bras s'arrête là
    caseFeu(fx + k, fy, allume, 0);
  }
  for (uint8_t k = 1; k <= 2; k++) {              // à gauche : fx - 1, puis fx - 2
    if (lire(fx - k, fy) == ALPHABET[23]) break;
    caseFeu(fx - k, fy, allume, 0);
  }
  for (uint8_t k = 1; k <= 2; k++) {              // en bas
    if (lire(fx, fy + k) == ALPHABET[23]) break;
    caseFeu(fx, fy + k, allume, 1);
  }
  for (uint8_t k = 1; k <= 2; k++) {              // en haut
    if (lire(fx, fy - k) == ALPHABET[23]) break;
    caseFeu(fx, fy - k, allume, 1);
  }
}

// ---- vider l'écran, comme dans le serpent (le 0.93.8) ----
void viderEcran() {
  for (uint8_t l = 0; l < 18; l++) {
    effacer(0, l, 20);
  }
}

// ---- une partie qui commence, TOUT au départ (le 0.93.8) ----
// C'était le début de main() ; c'est maintenant une fonction, pour pouvoir
// la rappeler quand on rejoue.
void nouvellePartie() {
  ox = 1;                               // le O revient dans son coin
  oy = 1;
  bombe = 0;                            // pas de bombe
  feu = 0;                              // pas de flammes
  score = 0;
  mort = 0;
  ecran = 0;                            // on est sur le JEU
  viderEcran();

  // ---- Le terrain : le cadre et les piliers X (le 0.93) ----
  for (uint8_t l = 0; l < 17; l++) {
    for (uint8_t c = 0; c < 19; c++) {
      if (l == 0 || l == 16 || c == 0 || c == 18) {   // le cadre
        poser(c, l, ALPHABET[23]);
      }
      if (c % 2 == 0 && l % 2 == 0) {                 // les piliers : colonne ET ligne paires
        poser(c, l, ALPHABET[23]);
      }
    }
  }

  poser(ox, oy, ALPHABET[14]);            // le O à sa place (le 0.93)

  // les trois W, dans trois coins (le 0.93.6)
  ex[0] = 17;                             // le n° 0 : en bas à droite
  ey[0] = 15;
  ex[1] = 17;                             // le n° 1 : en haut à droite
  ey[1] = 1;
  ex[2] = 1;                              // le n° 2 : en bas à gauche
  ey[2] = 15;
  for (uint8_t i = 0; i < 3; i++) {
    vivant[i] = 1;                        // au départ, les trois sont vivants
    poser(ex[i], ey[i], ALPHABET[22]);
  }
  texte(0, 17, "SCORE");                  // le score, sous le terrain (le 0.93.7)
}

// ---- la partie s'arrête : l'écran FIN (le 0.93.8) ----
void finPartie() {
  ecran = 1;                            // on est sur la FIN
  viderEcran();
  texte(8, 6, "FIN");
  texte(5, 9, "SCORE");
  nombre(11, 9, score);
  texte(2, 13, "START : REJOUER");
}

int main() {
  nouvellePartie();                     // la première partie (le 0.93.8)

  while (true) {
    image();

    if (ecran == 0) {                   // le JEU (le 0.93.8)
      // ---- le O bouge avec la croix, un pas toutes les 150 ms (le 0.93.1) ----
      if (chaque(150)) {
        // 1. la case d'ARRIVÉE : on part de la case actuelle (le 0.82).
        //    else if : une seule flèche à la fois, pas de pas en diagonale.
        nx = ox;
        ny = oy;
        if (bouton(DROITE)) {
          nx = ox + 1;
        } else if (bouton(GAUCHE)) {
          nx = ox - 1;
        } else if (bouton(BAS)) {
          ny = oy + 1;
        } else if (bouton(HAUT)) {
          ny = oy - 1;
        }

        // 2. une flèche est tenue (l'arrivée n'est pas la case où l'on est)…
        if (nx != ox || ny != oy) {
          // 3. l'arrivée est VIDE (le 0.93.2) : le O y va.
          if (lire(nx, ny) == 0) {
            effacer(ox, oy, 1);                 // le O quitte sa case…
            if (bombe == 1 && ox == bx && oy == by) {
              poser(bx, by, ALPHABET[1]);         // …mais s'il était sur la bombe, la B apparaît (le 0.93.2)
            }
            ox = nx;                            // …et va sur la case d'arrivée
            oy = ny;
            poser(ox, oy, ALPHABET[14]);
          } else if (lire(nx, ny) != ALPHABET[23] && lire(nx, ny) != ALPHABET[1]) {
            mort = 1;                         // ni vide, ni X, ni B : un W ou une flamme ! (le 0.93.8)
          }
        }
      }

      // ---- A : poser une bombe, là où est le O (le 0.93.2) ----
      // bombe == 0 : une seule bombe à la fois.
      // feu == 0 : pas pendant les flammes (le 0.93.3).
      if (bouton(A) && bombe == 0 && feu == 0) {
        bombe = 1;
        bx = ox;                              // la bombe est sous le O
        by = oy;
        bdelai = 0;                           // on commence à compter (le 0.93.3)
      }

      // ---- la bombe explose au bout de 2 secondes (le 0.93.3) ----
      // image() revient 60 fois par seconde : 120 images, 2 secondes.
      if (bombe == 1) {
        bdelai = bdelai + 1;
        if (bdelai == 120) {
          bombe = 0;                          // plus de bombe…
          fx = bx;                            // …elle explose, là où elle était
          fy = by;
          feu = 1;
          fdelai = 0;
          flammes(1);                         // on dessine les flammes
        }
      }

      // ---- les flammes s'éteignent au bout d'une demi-seconde (30 images) (le 0.93.3) ----
      if (feu == 1) {
        fdelai = fdelai + 1;
        if (fdelai == 30) {
          feu = 0;
          flammes(0);                         // on efface les MÊMES cases
          poser(ox, oy, ALPHABET[14]);        // le O était peut-être dans une flamme : on le remet
          for (uint8_t i = 0; i < 3; i++) {   // et les W encore vivants
            if (vivant[i] == 1) {
              poser(ex[i], ey[i], ALPHABET[22]);
            }
          }
        }
      }

      // ---- les W se promènent au hasard (le 0.93.5) : les TROIS, un par un (le 0.93.6) ----
      if (chaque(400)) {
        for (uint8_t i = 0; i < 3; i++) {
          if (vivant[i] == 1) {               // un W détruit ne bouge plus (le 0.93.7)
            d = hasard() % 4;                     // sa direction, au hasard (le 0.93.5)
            nx = ex[i];
            ny = ey[i];
            if (d == 0) nx = ex[i] + 1;
            if (d == 1) ny = ey[i] + 1;
            if (d == 2) nx = ex[i] - 1;
            if (d == 3) ny = ey[i] - 1;
            if (nx == ox && ny == oy) {
              mort = 1;                           // le W arrive sur le O : perdu (le 0.93.8)
            }
            if (lire(nx, ny) == 0) {              // seulement sur une case VIDE
              effacer(ex[i], ey[i], 1);
              ex[i] = nx;
              ey[i] = ny;
              poser(ex[i], ey[i], ALPHABET[22]);
            }
          }
        }
      }

      nombre(6, 17, score);                   // le score, à chaque image (le 0.93.7)

      // ---- touché (par un W ou une flamme) : la partie s'arrête (le 0.93.8) ----
      if (mort == 1) {
        finPartie();
      } else if (score == 3) {
        // ---- NOUVEAU : les trois W détruits : GAGNÉ ----
        finPartie();                          // le même écran FIN, avec le score…
        texte(6, 3, "BRAVO !");               // …et BRAVO au-dessus
      }
    }

    // ---- sur la FIN, START : on rejoue (le 0.93.8) ----
    if (ecran == 1 && bouton(START)) {
      nouvellePartie();
    }
  }
}
`,
    aVoir: 'Détruis les trois W sans te faire toucher : BRAVO ! au-dessus de FIN et du score.',
    controle: (c) => {
      const tenir = (b, cond, max = 300) => { let t = 0; while (t < max && !cond()) { c.gb.setButton(b, true); c.avancer(1); t++ } c.gb.setButton(b, false); c.avancer(1) }
      c.avancer(69)                     // ce départ-là mène le robot à la victoire
      // le robot : il pose une bombe en (9, 7), s'abrite en (11, 8), attend la fin des flammes, et revient
      const v = (n) => c.variable(n)
      const fini = () => v('ecran') !== 0
      tenir('right', () => v('ox') === 9)
      tenir('down', () => v('oy') === 7)
      for (let tour = 0; tour < 60 && !false && !fini(); tour++) {
        c.presser('a', 3)
        tenir('right', () => v('ox') === 11 || fini(), 60)
        tenir('down', () => v('oy') === 8 || fini(), 60)
        tenir('b', () => v('feu') === 1 || fini(), 200)
        tenir('b', () => v('feu') === 0 || fini(), 100)
        tenir('up', () => v('oy') === 7 || fini(), 60)
        tenir('left', () => v('ox') === 9 || fini(), 60)
      }
      c.avancer(30)
      return [
        ['le robot détruit les trois W : BRAVO !, FIN, SCORE 003', v('ecran') === 1 && c.mot(6, 3, 7) === 'BRAVO !' && c.mot(8, 6, 3) === 'FIN' && c.mot(11, 9, 3) === '003', ` (score = ${v('score')})`],
      ]
    },
  },

  {
    titre: 'Un jeu de bombes, avec des briques — des briques M',
    difficulte: 0,
    idee: 'Le jeu du 0.93.9, et des briques M, posées au hasard dans les couloirs, une case sur trois environ. Elles bloquent le O, les W et les flammes, comme les X. Le coin du départ reste libre.',
    texte: [
      '**C’est le jeu du 0.93.9, avec une chose en plus : des briques.** Des **M** remplissent une partie des couloirs, au hasard : quand on rejoue, le terrain change. Pour l’instant, elles sont aussi dures que les X ; au 0.94.1, les bombes les casseront.',
      '**Ce qui est nouveau ici : poser les briques au hasard.** Deux boucles passent sur l’intérieur du terrain (lignes 1 à 15, colonnes 1 à 17), comme pour les piliers (le 0.93). Une brique est posée si **trois** conditions sont vraies à la fois (`&&`, le 0.75).',
      '**1. C’est un couloir :** `c % 2 == 1 || l % 2 == 1`. Un pilier a sa colonne **et** sa ligne paires ; un couloir a sa colonne **ou** sa ligne impaire (`% 2 == 1`). Les **parenthèses** autour de cette condition la calculent d’abord, comme au 0.91.6 : « couloir » ET le reste.',
      '**2. Ce n’est pas le coin du départ :** `c + l > 5`. En (1, 1), 1 + 1 = 2 ; en (3, 1), 4 ; en (3, 2), 5 ; en (1, 4), 5 : jamais de brique. En (5, 1), 6 : une brique possible. Ce coin libre, c’est de la place pour poser sa première bombe et s’abriter : de (1, 1), on peut aller en (3, 2), hors des bras de la flamme.',
      '**3. Une fois sur trois :** `hasard() % 3 == 0`. Le reste par 3 vaut 0, 1 ou 2 : il vaut 0 une fois sur trois environ. Exemple : `hasard()` rend 201, 201 = 67 × 3 + 0 : une brique. 202 : reste 1, pas de brique.',
      '**Les briques sont posées AVANT le O et les W.** Si le hasard met un M dans le coin d’un W, le W est posé par-dessus : il est là, mais enfermé jusqu’à ce qu’une bombe le libère.',
      '**Le M bloque tout le monde :** les W ne vont que sur une case vide (le 0.93.5) ; le O aussi (le 0.93.2). Mais attention au 0.93.8 : quand le O essayait d’aller sur une case « ni vide, ni X, ni B », c’était un W ou une flamme, et il **perdait**. Un M n’est ni l’un ni l’autre : on ajoute **`&& lire(nx, ny) != ALPHABET[12]`**, sinon toucher une brique ferait perdre.',
      '**Le M arrête les flammes, comme un X :** dans `flammes`, `if (lire(…) == ALPHABET[23] || lire(…) == ALPHABET[12]) break;` (`||`, « ou »). Une brique **protège** ce qu’il y a derrière elle.',
      '**Le jeu devient plus dur :** les W sont souvent enfermés, et il faut faire son chemin entre les briques. Au 0.94.1, on pourra le **creuser** avec les bombes.',
    ],
    code: `// ---- UN JEU DE BOMBES ----
// Les lettres : X = un mur, O = le joueur, B = une bombe, W = un ennemi,
// M = une brique (NOUVEAU).
// ALPHABET[23] : le X    ALPHABET[14] : le O
// ALPHABET[1]  : le B    ALPHABET[22] : le W
// ALPHABET[12] : le M

uint8_t ox = 1;           // le O, le joueur : sa colonne… (le 0.93.1)
uint8_t oy = 1;           // …et sa ligne. Il part du coin (1, 1).
uint8_t nx = 0;           // la case d'ARRIVÉE, calculée AVANT de bouger (le 0.82)
uint8_t ny = 0;
uint8_t bombe = 0;        // 1 : une bombe est posée ; 0 : pas de bombe (le 0.93.2)
uint8_t bx = 0;           // la place de la bombe : sa colonne…
uint8_t by = 0;           // …et sa ligne
uint8_t bdelai = 0;       // les images passées depuis la pose de la bombe (le 0.93.3)
uint8_t feu = 0;          // 1 : les flammes sont à l'écran ; 0 : non
uint8_t fdelai = 0;       // les images passées depuis l'explosion
uint8_t fx = 0;           // le centre de l'explosion : sa colonne…
uint8_t fy = 0;           // …et sa ligne
uint8_t ex[3];            // les TROIS W : leurs colonnes… (le 0.93.6)
uint8_t ey[3];            // …et leurs lignes. Le W n° i est en (ex[i], ey[i]).
uint8_t d = 0;            // la direction tirée au hasard, 0 à 3 (le 0.93.5)
uint8_t vivant[3];        // vivant[i] : 1 si le W n° i est là, 0 s'il est détruit (le 0.93.7)
uint8_t score = 0;        // les W détruits
uint8_t ecran = 0;        // 0 = le JEU, 1 = la FIN (le 0.93.8)
uint8_t mort = 0;         // 1 : le O vient d'être touché

// ---- une flamme sur la case (c, l) : y a-t-il un W ? (le 0.93.7) ----
// On cherche le W n° i qui est vivant ET sur cette case. S'il y en a un,
// il est détruit (vivant[i] = 0) et le score gagne 1.
void toucheW(uint8_t c, uint8_t l) {
  for (uint8_t i = 0; i < 3; i++) {
    if (vivant[i] == 1 && ex[i] == c && ey[i] == l) {
      vivant[i] = 0;
      score = score + 1;
    }
  }
}

// ---- UNE case de flamme (le 0.93.3) ----
// allume = 1 : on dessine la flamme ; allume = 0 : on l'efface.
// debout = 1 : une flamme verticale, le | ; debout = 0 : horizontale, le -.
void caseFeu(uint8_t c, uint8_t l, uint8_t allume, uint8_t debout) {
  if (allume == 0) {
    effacer(c, l, 1);                   // la flamme s'éteint : la case est vide
  } else {
    if (lire(c, l) == ALPHABET[22]) {   // un W sous la flamme ? (le 0.93.7)
      toucheW(c, l);
    }
    if (c == ox && l == oy) {           // le O sous la flamme : perdu (le 0.93.8)
      mort = 1;
    }
    if (debout == 1) {
      texte(c, l, "|");
    } else {
      texte(c, l, "-");
    }
  }
}

// ---- Toute l'explosion (le 0.93.3) : des bras de DEUX cases (le 0.93.4) ----
//
//          |
//          |            chaque bras : jusqu'à 2 cases,
//      - - - - -        mais il s'arrête au premier X.
//          |            break : on sort de la boucle, tout de suite.
//          |
void flammes(uint8_t allume) {
  caseFeu(fx, fy, allume, 0);                     // le centre
  for (uint8_t k = 1; k <= 2; k++) {              // à droite : fx + 1, puis fx + 2
    if (lire(fx + k, fy) == ALPHABET[23] || lire(fx + k, fy) == ALPHABET[12]) break;  // un X ou un M (NOUVEAU) : le bras s'arrête
    caseFeu(fx + k, fy, allume, 0);
  }
  for (uint8_t k = 1; k <= 2; k++) {              // à gauche : fx - 1, puis fx - 2
    if (lire(fx - k, fy) == ALPHABET[23] || lire(fx - k, fy) == ALPHABET[12]) break;
    caseFeu(fx - k, fy, allume, 0);
  }
  for (uint8_t k = 1; k <= 2; k++) {              // en bas
    if (lire(fx, fy + k) == ALPHABET[23] || lire(fx, fy + k) == ALPHABET[12]) break;
    caseFeu(fx, fy + k, allume, 1);
  }
  for (uint8_t k = 1; k <= 2; k++) {              // en haut
    if (lire(fx, fy - k) == ALPHABET[23] || lire(fx, fy - k) == ALPHABET[12]) break;
    caseFeu(fx, fy - k, allume, 1);
  }
}

// ---- vider l'écran, comme dans le serpent (le 0.93.8) ----
void viderEcran() {
  for (uint8_t l = 0; l < 18; l++) {
    effacer(0, l, 20);
  }
}

// ---- une partie qui commence, TOUT au départ (le 0.93.8) ----
// C'était le début de main() ; c'est maintenant une fonction, pour pouvoir
// la rappeler quand on rejoue.
void nouvellePartie() {
  ox = 1;                               // le O revient dans son coin
  oy = 1;
  bombe = 0;                            // pas de bombe
  feu = 0;                              // pas de flammes
  score = 0;
  mort = 0;
  ecran = 0;                            // on est sur le JEU
  viderEcran();

  // ---- Le terrain : le cadre et les piliers X (le 0.93) ----
  for (uint8_t l = 0; l < 17; l++) {
    for (uint8_t c = 0; c < 19; c++) {
      if (l == 0 || l == 16 || c == 0 || c == 18) {   // le cadre
        poser(c, l, ALPHABET[23]);
      }
      if (c % 2 == 0 && l % 2 == 0) {                 // les piliers : colonne ET ligne paires
        poser(c, l, ALPHABET[23]);
      }
    }
  }

  // ---- NOUVEAU : les briques M, au hasard, dans les couloirs ----
  // Une case est un couloir si sa colonne OU sa ligne est impaire
  // (% 2 == 1) : ce n'est pas un pilier (le 0.93).
  // c + l > 5 : le coin du départ reste libre. (1, 1), (2, 1), (3, 1),
  //   (4, 1), (1, 2), (3, 2), (1, 3)… ont c + l <= 5 : jamais de brique.
  //   Sans ça, le O pourrait être enfermé, et sa première bombe le tuerait.
  // hasard() % 3 == 0 : le reste par 3 vaut 0, 1 ou 2 ; 0 une fois sur trois.
  for (uint8_t l = 1; l < 16; l++) {
    for (uint8_t c = 1; c < 18; c++) {
      if ((c % 2 == 1 || l % 2 == 1) && c + l > 5 && hasard() % 3 == 0) {
        poser(c, l, ALPHABET[12]);
      }
    }
  }

  poser(ox, oy, ALPHABET[14]);            // le O à sa place (le 0.93)

  // les trois W, dans trois coins (le 0.93.6)
  ex[0] = 17;                             // le n° 0 : en bas à droite
  ey[0] = 15;
  ex[1] = 17;                             // le n° 1 : en haut à droite
  ey[1] = 1;
  ex[2] = 1;                              // le n° 2 : en bas à gauche
  ey[2] = 15;
  for (uint8_t i = 0; i < 3; i++) {
    vivant[i] = 1;                        // au départ, les trois sont vivants
    poser(ex[i], ey[i], ALPHABET[22]);
  }
  texte(0, 17, "SCORE");                  // le score, sous le terrain (le 0.93.7)
}

// ---- la partie s'arrête : l'écran FIN (le 0.93.8) ----
void finPartie() {
  ecran = 1;                            // on est sur la FIN
  viderEcran();
  texte(8, 6, "FIN");
  texte(5, 9, "SCORE");
  nombre(11, 9, score);
  texte(2, 13, "START : REJOUER");
}

int main() {
  nouvellePartie();                     // la première partie (le 0.93.8)

  while (true) {
    image();

    if (ecran == 0) {                   // le JEU (le 0.93.8)
      // ---- le O bouge avec la croix, un pas toutes les 150 ms (le 0.93.1) ----
      if (chaque(150)) {
        // 1. la case d'ARRIVÉE : on part de la case actuelle (le 0.82).
        //    else if : une seule flèche à la fois, pas de pas en diagonale.
        nx = ox;
        ny = oy;
        if (bouton(DROITE)) {
          nx = ox + 1;
        } else if (bouton(GAUCHE)) {
          nx = ox - 1;
        } else if (bouton(BAS)) {
          ny = oy + 1;
        } else if (bouton(HAUT)) {
          ny = oy - 1;
        }

        // 2. une flèche est tenue (l'arrivée n'est pas la case où l'on est)…
        if (nx != ox || ny != oy) {
          // 3. l'arrivée est VIDE (le 0.93.2) : le O y va.
          if (lire(nx, ny) == 0) {
            effacer(ox, oy, 1);                 // le O quitte sa case…
            if (bombe == 1 && ox == bx && oy == by) {
              poser(bx, by, ALPHABET[1]);         // …mais s'il était sur la bombe, la B apparaît (le 0.93.2)
            }
            ox = nx;                            // …et va sur la case d'arrivée
            oy = ny;
            poser(ox, oy, ALPHABET[14]);
          } else if (lire(nx, ny) != ALPHABET[23] && lire(nx, ny) != ALPHABET[1] && lire(nx, ny) != ALPHABET[12]) {
            mort = 1;                         // ni vide, ni X, ni B, ni M (NOUVEAU) : un W ou une flamme ! (le 0.93.8)
          }
        }
      }

      // ---- A : poser une bombe, là où est le O (le 0.93.2) ----
      // bombe == 0 : une seule bombe à la fois.
      // feu == 0 : pas pendant les flammes (le 0.93.3).
      if (bouton(A) && bombe == 0 && feu == 0) {
        bombe = 1;
        bx = ox;                              // la bombe est sous le O
        by = oy;
        bdelai = 0;                           // on commence à compter (le 0.93.3)
      }

      // ---- la bombe explose au bout de 2 secondes (le 0.93.3) ----
      // image() revient 60 fois par seconde : 120 images, 2 secondes.
      if (bombe == 1) {
        bdelai = bdelai + 1;
        if (bdelai == 120) {
          bombe = 0;                          // plus de bombe…
          fx = bx;                            // …elle explose, là où elle était
          fy = by;
          feu = 1;
          fdelai = 0;
          flammes(1);                         // on dessine les flammes
        }
      }

      // ---- les flammes s'éteignent au bout d'une demi-seconde (30 images) (le 0.93.3) ----
      if (feu == 1) {
        fdelai = fdelai + 1;
        if (fdelai == 30) {
          feu = 0;
          flammes(0);                         // on efface les MÊMES cases
          poser(ox, oy, ALPHABET[14]);        // le O était peut-être dans une flamme : on le remet
          for (uint8_t i = 0; i < 3; i++) {   // et les W encore vivants
            if (vivant[i] == 1) {
              poser(ex[i], ey[i], ALPHABET[22]);
            }
          }
        }
      }

      // ---- les W se promènent au hasard (le 0.93.5) : les TROIS, un par un (le 0.93.6) ----
      if (chaque(400)) {
        for (uint8_t i = 0; i < 3; i++) {
          if (vivant[i] == 1) {               // un W détruit ne bouge plus (le 0.93.7)
            d = hasard() % 4;                     // sa direction, au hasard (le 0.93.5)
            nx = ex[i];
            ny = ey[i];
            if (d == 0) nx = ex[i] + 1;
            if (d == 1) ny = ey[i] + 1;
            if (d == 2) nx = ex[i] - 1;
            if (d == 3) ny = ey[i] - 1;
            if (nx == ox && ny == oy) {
              mort = 1;                           // le W arrive sur le O : perdu (le 0.93.8)
            }
            if (lire(nx, ny) == 0) {              // seulement sur une case VIDE
              effacer(ex[i], ey[i], 1);
              ex[i] = nx;
              ey[i] = ny;
              poser(ex[i], ey[i], ALPHABET[22]);
            }
          }
        }
      }

      nombre(6, 17, score);                   // le score, à chaque image (le 0.93.7)

      // ---- touché (par un W ou une flamme) : la partie s'arrête (le 0.93.8) ----
      if (mort == 1) {
        finPartie();
      } else if (score == 3) {
        // ---- les trois W détruits : GAGNÉ (le 0.93.9) ----
        finPartie();                          // le même écran FIN, avec le score…
        texte(6, 3, "BRAVO !");               // …et BRAVO au-dessus
      }
    }

    // ---- sur la FIN, START : on rejoue (le 0.93.8) ----
    if (ecran == 1 && bouton(START)) {
      nouvellePartie();
    }
  }
}
`,
    aVoir: 'Des briques M au hasard dans les couloirs ; le coin du départ est libre ; ni le O, ni les W, ni les flammes ne passent.',
    controle: (c) => {
      c.avancer(40)
      let m = 0, mauvais = 0, coin = 0
      for (let l = 0; l < 17; l++) {
        for (let x = 0; x < 19; x++) {
          if (c.mot(x, l, 1) !== 'M') continue
          m++
          if (x % 2 === 0 && l % 2 === 0) mauvais++
          if (x + l <= 5) coin++
        }
      }
      const ox = c.variable('ox')
      c.presser('right', 200)
      const devant = c.mot(c.variable('ox') + 1, 1, 1)
      return [
        ['des briques M dans le terrain', m > 10, ` (${m} M)`],
        ['jamais sur un pilier ni dans le coin du départ', mauvais === 0 && coin === 0],
        ['à droite, le O s’arrête devant un M ou un X, sans perdre', c.variable('ecran') === 0 && (devant === 'M' || devant === 'X'), ` (devant lui : « ${devant} »)`],
      ]
    },
  },

  {
    titre: 'Un jeu de bombes, avec des briques — la flamme casse les briques',
    difficulte: 0,
    suite: true,
    idee: 'Le 0.94, et une flamme qui atteint une brique M la casse : le bras s’arrête sur elle, et quand les flammes s’éteignent, la brique disparaît avec elles.',
    texte: [
      '**C’est le 0.94, avec une chose en plus : casser les briques.** Une bombe posée près d’un M le détruit. On peut maintenant **se creuser un chemin**, et aller chercher les W enfermés.',
      '**La brique arrête le bras, puis brûle.** Comme dans le vrai Bomberman : la flamme **ne passe pas** au-delà de la brique (ce qu’il y a derrière est protégé), mais la brique, elle, est détruite.',
      '**Ce qui est nouveau ici : la brique disparaît QUAND les flammes s’éteignent.** Dans chaque bras de `flammes`, on regarde d’abord le X (`break`, comme avant). Puis : `if (lire(…) == ALPHABET[12])` : une brique. Si `allume == 0` (les flammes s’éteignent), on l’efface. Et dans les deux cas, `break` : le bras s’arrête là.',
      '**Pourquoi pas tout de suite, pendant l’explosion ?** Parce que `flammes(0)` doit effacer **exactement** les cases que `flammes(1)` a dessinées (le 0.93.3). Si la brique disparaissait à l’explosion, `flammes(0)` ne la trouverait plus : le bras ne s’arrêterait plus au même endroit, et il effacerait la case d’après… peut-être un W, ou une autre brique ! En laissant la brique jusqu’à la fin, les deux passages s’arrêtent **sur la même case**.',
      '**Déroulons : une bombe en (3, 1), un M en (5, 1).** `flammes(1)`, à droite : `k` = 1, (4, 1) est vide, flamme. `k` = 2, (5, 1) est un M : `allume` vaut 1, on ne l’efface pas ; `break`. Pendant une demi-seconde, on voit `- - M`. Puis `flammes(0)`, à droite : (4, 1) est effacée ; (5, 1) est toujours un M : `allume` vaut 0, on l’**efface** ; `break`. Il ne reste rien.',
      '**Une brique à la fois par bras :** le bras s’arrête sur la première. Deux briques l’une derrière l’autre demandent deux bombes.',
      '**Le reste du jeu ne change pas :** trois W à détruire, attention aux flammes et aux W, BRAVO ! quand les trois sont détruits.',
    ],
    code: `// ---- UN JEU DE BOMBES ----
// Les lettres : X = un mur, O = le joueur, B = une bombe, W = un ennemi,
// M = une brique (le 0.94).
// ALPHABET[23] : le X    ALPHABET[14] : le O
// ALPHABET[1]  : le B    ALPHABET[22] : le W
// ALPHABET[12] : le M

uint8_t ox = 1;           // le O, le joueur : sa colonne… (le 0.93.1)
uint8_t oy = 1;           // …et sa ligne. Il part du coin (1, 1).
uint8_t nx = 0;           // la case d'ARRIVÉE, calculée AVANT de bouger (le 0.82)
uint8_t ny = 0;
uint8_t bombe = 0;        // 1 : une bombe est posée ; 0 : pas de bombe (le 0.93.2)
uint8_t bx = 0;           // la place de la bombe : sa colonne…
uint8_t by = 0;           // …et sa ligne
uint8_t bdelai = 0;       // les images passées depuis la pose de la bombe (le 0.93.3)
uint8_t feu = 0;          // 1 : les flammes sont à l'écran ; 0 : non
uint8_t fdelai = 0;       // les images passées depuis l'explosion
uint8_t fx = 0;           // le centre de l'explosion : sa colonne…
uint8_t fy = 0;           // …et sa ligne
uint8_t ex[3];            // les TROIS W : leurs colonnes… (le 0.93.6)
uint8_t ey[3];            // …et leurs lignes. Le W n° i est en (ex[i], ey[i]).
uint8_t d = 0;            // la direction tirée au hasard, 0 à 3 (le 0.93.5)
uint8_t vivant[3];        // vivant[i] : 1 si le W n° i est là, 0 s'il est détruit (le 0.93.7)
uint8_t score = 0;        // les W détruits
uint8_t ecran = 0;        // 0 = le JEU, 1 = la FIN (le 0.93.8)
uint8_t mort = 0;         // 1 : le O vient d'être touché

// ---- une flamme sur la case (c, l) : y a-t-il un W ? (le 0.93.7) ----
// On cherche le W n° i qui est vivant ET sur cette case. S'il y en a un,
// il est détruit (vivant[i] = 0) et le score gagne 1.
void toucheW(uint8_t c, uint8_t l) {
  for (uint8_t i = 0; i < 3; i++) {
    if (vivant[i] == 1 && ex[i] == c && ey[i] == l) {
      vivant[i] = 0;
      score = score + 1;
    }
  }
}

// ---- UNE case de flamme (le 0.93.3) ----
// allume = 1 : on dessine la flamme ; allume = 0 : on l'efface.
// debout = 1 : une flamme verticale, le | ; debout = 0 : horizontale, le -.
void caseFeu(uint8_t c, uint8_t l, uint8_t allume, uint8_t debout) {
  if (allume == 0) {
    effacer(c, l, 1);                   // la flamme s'éteint : la case est vide
  } else {
    if (lire(c, l) == ALPHABET[22]) {   // un W sous la flamme ? (le 0.93.7)
      toucheW(c, l);
    }
    if (c == ox && l == oy) {           // le O sous la flamme : perdu (le 0.93.8)
      mort = 1;
    }
    if (debout == 1) {
      texte(c, l, "|");
    } else {
      texte(c, l, "-");
    }
  }
}

// ---- Toute l'explosion (le 0.93.3) : des bras de DEUX cases (le 0.93.4) ----
//
//          |
//          |            chaque bras : jusqu'à 2 cases,
//      - - - - -        mais il s'arrête au premier X.
//          |            break : on sort de la boucle, tout de suite.
//          |
// NOUVEAU : un M arrête aussi le bras, mais il BRÛLE. Pendant les flammes,
// il reste là (le bras s'arrête devant) ; quand elles s'éteignent
// (allume == 0), on l'efface avec elles. Ainsi, flammes(1) et flammes(0)
// s'arrêtent toujours sur la même case : le M est encore là pour les deux.
void flammes(uint8_t allume) {
  caseFeu(fx, fy, allume, 0);                     // le centre
  for (uint8_t k = 1; k <= 2; k++) {              // à droite : fx + 1, puis fx + 2
    if (lire(fx + k, fy) == ALPHABET[23]) break;
    if (lire(fx + k, fy) == ALPHABET[12]) {           // NOUVEAU : une brique
      if (allume == 0) {                              // les flammes s'éteignent :
        effacer(fx + k, fy, 1);                   // la brique disparaît avec elles
      }
      break;                                        // et le bras s'arrête là
    }
    caseFeu(fx + k, fy, allume, 0);
  }
  for (uint8_t k = 1; k <= 2; k++) {              // à gauche : fx - 1, puis fx - 2
    if (lire(fx - k, fy) == ALPHABET[23]) break;
    if (lire(fx - k, fy) == ALPHABET[12]) {
      if (allume == 0) {
        effacer(fx - k, fy, 1);
      }
      break;
    }
    caseFeu(fx - k, fy, allume, 0);
  }
  for (uint8_t k = 1; k <= 2; k++) {              // en bas
    if (lire(fx, fy + k) == ALPHABET[23]) break;
    if (lire(fx, fy + k) == ALPHABET[12]) {
      if (allume == 0) {
        effacer(fx, fy + k, 1);
      }
      break;
    }
    caseFeu(fx, fy + k, allume, 1);
  }
  for (uint8_t k = 1; k <= 2; k++) {              // en haut
    if (lire(fx, fy - k) == ALPHABET[23]) break;
    if (lire(fx, fy - k) == ALPHABET[12]) {
      if (allume == 0) {
        effacer(fx, fy - k, 1);
      }
      break;
    }
    caseFeu(fx, fy - k, allume, 1);
  }
}

// ---- vider l'écran, comme dans le serpent (le 0.93.8) ----
void viderEcran() {
  for (uint8_t l = 0; l < 18; l++) {
    effacer(0, l, 20);
  }
}

// ---- une partie qui commence, TOUT au départ (le 0.93.8) ----
// C'était le début de main() ; c'est maintenant une fonction, pour pouvoir
// la rappeler quand on rejoue.
void nouvellePartie() {
  ox = 1;                               // le O revient dans son coin
  oy = 1;
  bombe = 0;                            // pas de bombe
  feu = 0;                              // pas de flammes
  score = 0;
  mort = 0;
  ecran = 0;                            // on est sur le JEU
  viderEcran();

  // ---- Le terrain : le cadre et les piliers X (le 0.93) ----
  for (uint8_t l = 0; l < 17; l++) {
    for (uint8_t c = 0; c < 19; c++) {
      if (l == 0 || l == 16 || c == 0 || c == 18) {   // le cadre
        poser(c, l, ALPHABET[23]);
      }
      if (c % 2 == 0 && l % 2 == 0) {                 // les piliers : colonne ET ligne paires
        poser(c, l, ALPHABET[23]);
      }
    }
  }

  // ---- Les briques M, au hasard, dans les couloirs (le 0.94) ----
  // Une case est un couloir si sa colonne OU sa ligne est impaire
  // (% 2 == 1) : ce n'est pas un pilier (le 0.93).
  // c + l > 5 : le coin du départ reste libre. (1, 1), (2, 1), (3, 1),
  //   (4, 1), (1, 2), (3, 2), (1, 3)… ont c + l <= 5 : jamais de brique.
  //   Sans ça, le O pourrait être enfermé, et sa première bombe le tuerait.
  // hasard() % 3 == 0 : le reste par 3 vaut 0, 1 ou 2 ; 0 une fois sur trois.
  for (uint8_t l = 1; l < 16; l++) {
    for (uint8_t c = 1; c < 18; c++) {
      if ((c % 2 == 1 || l % 2 == 1) && c + l > 5 && hasard() % 3 == 0) {
        poser(c, l, ALPHABET[12]);
      }
    }
  }

  poser(ox, oy, ALPHABET[14]);            // le O à sa place (le 0.93)

  // les trois W, dans trois coins (le 0.93.6)
  ex[0] = 17;                             // le n° 0 : en bas à droite
  ey[0] = 15;
  ex[1] = 17;                             // le n° 1 : en haut à droite
  ey[1] = 1;
  ex[2] = 1;                              // le n° 2 : en bas à gauche
  ey[2] = 15;
  for (uint8_t i = 0; i < 3; i++) {
    vivant[i] = 1;                        // au départ, les trois sont vivants
    poser(ex[i], ey[i], ALPHABET[22]);
  }
  texte(0, 17, "SCORE");                  // le score, sous le terrain (le 0.93.7)
}

// ---- la partie s'arrête : l'écran FIN (le 0.93.8) ----
void finPartie() {
  ecran = 1;                            // on est sur la FIN
  viderEcran();
  texte(8, 6, "FIN");
  texte(5, 9, "SCORE");
  nombre(11, 9, score);
  texte(2, 13, "START : REJOUER");
}

int main() {
  nouvellePartie();                     // la première partie (le 0.93.8)

  while (true) {
    image();

    if (ecran == 0) {                   // le JEU (le 0.93.8)
      // ---- le O bouge avec la croix, un pas toutes les 150 ms (le 0.93.1) ----
      if (chaque(150)) {
        // 1. la case d'ARRIVÉE : on part de la case actuelle (le 0.82).
        //    else if : une seule flèche à la fois, pas de pas en diagonale.
        nx = ox;
        ny = oy;
        if (bouton(DROITE)) {
          nx = ox + 1;
        } else if (bouton(GAUCHE)) {
          nx = ox - 1;
        } else if (bouton(BAS)) {
          ny = oy + 1;
        } else if (bouton(HAUT)) {
          ny = oy - 1;
        }

        // 2. une flèche est tenue (l'arrivée n'est pas la case où l'on est)…
        if (nx != ox || ny != oy) {
          // 3. l'arrivée est VIDE (le 0.93.2) : le O y va.
          if (lire(nx, ny) == 0) {
            effacer(ox, oy, 1);                 // le O quitte sa case…
            if (bombe == 1 && ox == bx && oy == by) {
              poser(bx, by, ALPHABET[1]);         // …mais s'il était sur la bombe, la B apparaît (le 0.93.2)
            }
            ox = nx;                            // …et va sur la case d'arrivée
            oy = ny;
            poser(ox, oy, ALPHABET[14]);
          } else if (lire(nx, ny) != ALPHABET[23] && lire(nx, ny) != ALPHABET[1] && lire(nx, ny) != ALPHABET[12]) {
            mort = 1;                         // ni vide, ni X, ni B, ni M (le 0.94) : un W ou une flamme ! (le 0.93.8)
          }
        }
      }

      // ---- A : poser une bombe, là où est le O (le 0.93.2) ----
      // bombe == 0 : une seule bombe à la fois.
      // feu == 0 : pas pendant les flammes (le 0.93.3).
      if (bouton(A) && bombe == 0 && feu == 0) {
        bombe = 1;
        bx = ox;                              // la bombe est sous le O
        by = oy;
        bdelai = 0;                           // on commence à compter (le 0.93.3)
      }

      // ---- la bombe explose au bout de 2 secondes (le 0.93.3) ----
      // image() revient 60 fois par seconde : 120 images, 2 secondes.
      if (bombe == 1) {
        bdelai = bdelai + 1;
        if (bdelai == 120) {
          bombe = 0;                          // plus de bombe…
          fx = bx;                            // …elle explose, là où elle était
          fy = by;
          feu = 1;
          fdelai = 0;
          flammes(1);                         // on dessine les flammes
        }
      }

      // ---- les flammes s'éteignent au bout d'une demi-seconde (30 images) (le 0.93.3) ----
      if (feu == 1) {
        fdelai = fdelai + 1;
        if (fdelai == 30) {
          feu = 0;
          flammes(0);                         // on efface les MÊMES cases
          poser(ox, oy, ALPHABET[14]);        // le O était peut-être dans une flamme : on le remet
          for (uint8_t i = 0; i < 3; i++) {   // et les W encore vivants
            if (vivant[i] == 1) {
              poser(ex[i], ey[i], ALPHABET[22]);
            }
          }
        }
      }

      // ---- les W se promènent au hasard (le 0.93.5) : les TROIS, un par un (le 0.93.6) ----
      if (chaque(400)) {
        for (uint8_t i = 0; i < 3; i++) {
          if (vivant[i] == 1) {               // un W détruit ne bouge plus (le 0.93.7)
            d = hasard() % 4;                     // sa direction, au hasard (le 0.93.5)
            nx = ex[i];
            ny = ey[i];
            if (d == 0) nx = ex[i] + 1;
            if (d == 1) ny = ey[i] + 1;
            if (d == 2) nx = ex[i] - 1;
            if (d == 3) ny = ey[i] - 1;
            if (nx == ox && ny == oy) {
              mort = 1;                           // le W arrive sur le O : perdu (le 0.93.8)
            }
            if (lire(nx, ny) == 0) {              // seulement sur une case VIDE
              effacer(ex[i], ey[i], 1);
              ex[i] = nx;
              ey[i] = ny;
              poser(ex[i], ey[i], ALPHABET[22]);
            }
          }
        }
      }

      nombre(6, 17, score);                   // le score, à chaque image (le 0.93.7)

      // ---- touché (par un W ou une flamme) : la partie s'arrête (le 0.93.8) ----
      if (mort == 1) {
        finPartie();
      } else if (score == 3) {
        // ---- les trois W détruits : GAGNÉ (le 0.93.9) ----
        finPartie();                          // le même écran FIN, avec le score…
        texte(6, 3, "BRAVO !");               // …et BRAVO au-dessus
      }
    }

    // ---- sur la FIN, START : on rejoue (le 0.93.8) ----
    if (ecran == 1 && bouton(START)) {
      nouvellePartie();
    }
  }
}
`,
    aVoir: 'Une bombe près d’un M : la flamme s’arrête dessus, puis la brique disparaît avec les flammes.',
    controle: (c) => {
      const tenir = (b, cond, max = 300) => { let t = 0; while (t < max && !cond()) { c.gb.setButton(b, true); c.avancer(1); t++ } c.gb.setButton(b, false); c.avancer(1) }
      const lesM = () => { let m = 0; for (let l = 0; l < 17; l++) m += [...c.mot(0, l, 20)].filter((ch) => ch === 'M').length; return m }
      c.avancer(40)                     // le terrain du démarrage a un M en (6, 1)
      const v = (n) => c.variable(n)
      const avant = lesM()
      const brique = c.mot(6, 1, 1) === 'M'
      tenir('right', () => v('ox') === 4)
      c.presser('a', 3)                 // la bombe en (4, 1)
      tenir('left', () => v('ox') === 3, 60)
      tenir('down', () => v('oy') === 2, 60)   // à l'abri en (3, 2)
      tenir('b', () => v('feu') === 1, 200)
      c.avancer(2)
      const pendant = c.mot(3, 1, 4) === '---M'
      tenir('b', () => v('feu') === 0, 100)
      c.avancer(2)
      return [
        ['un M en (6, 1), à 2 cases de la bombe posée en (4, 1)', brique],
        ['pendant les flammes, le bras s’arrête sur le M : - - - M', pendant],
        ['les flammes éteintes, le M a disparu', c.mot(6, 1, 1) === ' ' && lesM() === avant - 1, ` (${avant} M, puis ${lesM()})`],
        ['le O, à l’abri en (3, 2), n’a rien', v('ecran') === 0 && c.mot(3, 2, 1) === 'O'],
      ]
    },
  },

  {
    titre: 'Un micro Zelda — des salles, des murs, deux portes',
    difficulte: 0,
    partie: 'Un micro Zelda',
    idee: 'Un autre jeu : le A se promène dans un monde de quatre salles. Il passe d’un écran à l’autre par les ouvertures du cadre ; les murs X l’arrêtent ; deux portes P l’envoient d’une salle à l’autre.',
    texte: [
      '**Un nouveau jeu, façon Zelda.** Le héros, c’est le **A**. Le monde est plus grand que l’écran : **quatre salles**, deux de large et deux de haut. L’écran n’en montre qu’une à la fois. Quand le A sort par un bord, la salle d’à côté **remplace** celle-ci, et le A y entre par le bord opposé.',
      '**Ce qui vient d’avant :** le pas toutes les 150 ms avec `chaque(150)`, la case d’arrivée `nx`, `ny` calculée avant de bouger (le 0.82), `lire()` pour savoir ce qu’il y a sur une case, « seulement sur une case vide » (`lire(nx, ny) == 0`, le 0.93.2), et `viderEcran()` (le 0.93.8).',
      '**Ce qui est nouveau ici (1) : où est-on dans le monde ?** Deux variables : `sx`, la colonne de la salle (0 à gauche, 1 à droite), et `sy`, sa ligne (0 en haut, 1 en bas). Le numéro de la salle se calcule : `salle = sx + sy + sy`. Salle en haut à gauche : 0 + 0 + 0 = **0**. En haut à droite : 1 + 0 + 0 = **1**. En bas à gauche : 0 + 1 + 1 = **2**. En bas à droite : 1 + 1 + 1 = **3**. `ax` et `ay`, eux, disent où est le A **dans** la salle : colonne 0 à 19, ligne 0 à 16.',
      '**Ce qui est nouveau ici (2) : deux fonctions pour les murs.** `mur(c, l, n)` pose **n** X à la suite vers la droite : `mur(4, 4, 12)` pose des X de (4, 4) à (15, 4). `murDebout(c, l, n)` fait pareil vers le bas : `murDebout(6, 3, 11)` pose des X de (6, 3) à (6, 13). Dans la boucle `for`, `i` vaut 0, 1, 2… jusqu’à n - 1, et chaque tour pose un X en `c + i` (ou en `l + i`).',
      '**Ce qui est nouveau ici (3) : dessiner la salle.** `dessinerSalle()` vide l’écran, puis : 1. le cadre en entier (lignes 0 et 16, colonnes 0 et 19) ; 2. **les ouvertures** : on efface le cadre là où une salle voisine existe. `sx == 0` : il y a une salle à droite, on ouvre les lignes 7, 8, 9 de la colonne 19. `sy == 0` : une salle en bas, on ouvre les colonnes 9 et 10 de la ligne 16. Et pareil à gauche et en haut. Une salle au bord du monde reste fermée de ce côté : le A ne peut pas sortir du monde. 3. les murs **propres à chaque salle**, avec des `if (salle == …)`, et les deux portes ; 4. le numéro de la salle, sous le cadre.',
      '**Ce qui est nouveau ici (4) : sortir de l’écran.** L’écran a les colonnes 0 à 19, et le terrain les lignes 0 à 16. Si l’arrivée est la colonne **20**, le A sort à droite : `sx = sx + 1`, et il entre dans la nouvelle salle en colonne **0**. Si l’arrivée est la ligne **17**, il sort en bas : `sy = sy + 1`, et il entre en ligne **0**.',
      '**Et à gauche ? Pourquoi 255 ?** Un `uint8_t` va de 0 à 255, jamais en dessous. Quand `ax` vaut 0, `ax - 1` ne donne pas -1 : le nombre **fait le tour** et donne **255**, comme un compteur qui repart de la fin. Donc `nx == 255`, c’est « sorti à gauche » : `sx = sx - 1`, et il entre en colonne **19**. De même, `ny == 255`, c’est « sorti en haut » : il entre en ligne **16**. Ensuite, dans tous les cas : `dessinerSalle()`, et le A posé à sa nouvelle place.',
      '**Ce qui est nouveau ici (5) : les deux portes.** Une porte **P** dans la salle 0, en (3, 12), et une dans la salle 3, en (15, 4). Marcher sur un P, c’est `lire(nx, ny) == ALPHABET[15]`. Si l’on est dans la salle 0, on part dans la salle 3 (`sx = 1`, `sy = 1`) ; sinon, on revient dans la salle 0. C’est un **raccourci** : à pied, il faut passer par la salle 1 ou la salle 2.',
      '**Pourquoi arriver À CÔTÉ de la porte, et pas dessus ?** Sur le P, le A le cacherait : on ne verrait plus la porte. En (14, 4), juste à gauche du P en (15, 4), on la voit, et c’est au joueur de décider d’y retourner (DROITE).',
      '**L’ordre des tests compte.** Dans la boucle : d’abord « hors de l’écran ? », car `lire(20, 8)` n’a pas de sens : la case n’existe pas. Puis « une porte ? ». Puis « une case vide ? ». Un X n’est dans aucun de ces cas : **il ne se passe rien**, le A reste où il est. C’est tout ce qu’il faut pour les murs.',
      '**Déroulons.** Le A part de (9, 8), salle 0. DROITE : (10, 8), (11, 8)… jusqu’à (19, 8), l’ouverture du cadre. Encore DROITE : l’arrivée est (20, 8), hors de l’écran. `sx` passe à 1, `nx` à 0 : on est dans la **salle 1**, en (0, 8), et l’écran la montre. GAUCHE : l’arrivée est 0 - 1 = **255** : `sx` redevient 0, `nx` devient 19 : retour dans la salle 0, en (19, 8). Puis GAUCHE jusqu’en (4, 12), et encore GAUCHE : (3, 12) est la porte. On arrive dans la **salle 3**, en (14, 4). DROITE : (15, 4) est l’autre porte : retour dans la salle 0, en (4, 12).',
      '**Essaie :** ajoute un mur dans la salle 2 avec `mur()` ou `murDebout()`, ou déplace une porte (change aussi la place d’arrivée, à côté d’elle).',
    ],
    code: `// ---- UN MICRO ZELDA ----
// Tout ce qui suit « // » sur une ligne est un COMMENTAIRE : la console
// ne le lit pas. Il n'est là que pour toi, pour expliquer le code.
//
// Les lettres : A = le héros, X = un mur, P = une porte.
// ALPHABET[0]  : le A    ALPHABET[23] : le X    ALPHABET[15] : le P
// ALPHABET[n] : la n-ième lettre, en comptant à partir de 0 (pas de 1) :
//   A = 0, B = 1, C = 2, D = 3… O = 14, P = 15… W = 22, X = 23.
//
// Le monde : QUATRE salles, deux de large, deux de haut.
// L'écran n'en montre qu'une à la fois, comme dans Zelda.
//
//      sx = 0      sx = 1
//   +---------+---------+
//   | salle 0 | salle 1 |   sy = 0
//   +---------+---------+
//   | salle 2 | salle 3 |   sy = 1
//   +---------+---------+
//
// sx : la colonne de la salle dans le monde (0 = à gauche, 1 = à droite).
// sy : la ligne de la salle dans le monde   (0 = en haut,  1 = en bas).
// Le numéro de la salle se calcule :
//   salle = sx + sy + sy
//   en haut à gauche : 0 + 0 + 0 = 0
//   en haut à droite : 1 + 0 + 0 = 1
//   en bas à gauche  : 0 + 1 + 1 = 2
//   en bas à droite  : 1 + 1 + 1 = 3
//
// Dans UNE salle, les cases vont :
//   colonne 0 (à gauche) à 19 (à droite) : 20 colonnes, toute la largeur de l'écran ;
//   ligne   0 (en haut)  à 16 (en bas)   : 17 lignes pour le terrain.
//   La ligne 17, tout en bas de l'écran, sert à écrire le numéro de la salle.
// Une case s'écrit (colonne, ligne) : (9, 8), c'est la colonne 9, la ligne 8.

// ---- Les variables ----
// Une variable, c'est une boîte qui garde un nombre, et qu'on peut changer.
// uint8_t : le genre de la boîte. Elle garde un nombre de 0 à 255,
//   jamais en dessous de 0, jamais au-dessus de 255.
// « = 9 » : le nombre qu'elle a au départ.
// Elles sont écrites ICI, hors de toute fonction : tout le programme les voit.
uint8_t ax = 9;           // le A, le héros : sa colonne…
uint8_t ay = 8;           // …et sa ligne, DANS la salle où il est. Il part de (9, 8).
uint8_t nx = 0;           // la case d'ARRIVÉE, calculée AVANT de bouger (le 0.82) :
uint8_t ny = 0;           // on regarde ce qu'il y a dessus, PUIS on décide de bouger ou non.
uint8_t sx = 0;           // la salle : sa colonne dans le monde (0 ou 1)…
uint8_t sy = 0;           // …et sa ligne (0 ou 1). On part de la salle 0, en haut à gauche.
uint8_t salle = 0;        // son numéro, 0 à 3, calculé dans dessinerSalle()

// ---- n murs X à la suite, vers la DROITE, à partir de (c, l) ----
// void : la fonction fait quelque chose, mais ne rend pas de nombre.
// (uint8_t c, uint8_t l, uint8_t n) : ce qu'on lui donne en l'appelant.
//   c : la colonne du premier X, l : sa ligne, n : combien de X.
// Exemple : mur(4, 4, 3) pose un X en (4, 4), (5, 4) et (6, 4).
void mur(uint8_t c, uint8_t l, uint8_t n) {
  // for (départ ; tant que… ; après chaque tour) :
  //   uint8_t i = 0 : i commence à 0 ;
  //   i < n         : on continue tant que i est plus petit que n ;
  //   i++           : après chaque tour, i gagne 1.
  // Avec n = 3 : i vaut 0, puis 1, puis 2. À 3, « 3 < 3 » est faux : on s'arrête.
  // La boucle fait donc n tours : n X.
  for (uint8_t i = 0; i < n; i++) {
    poser(c + i, l, ALPHABET[23]);      // un X, i cases à droite du départ ; la ligne ne change pas
    // mur(4, 4, 3) : i = 0 → (4, 4) ; i = 1 → (5, 4) ; i = 2 → (6, 4)
  }
}

// ---- n murs X à la suite, vers le BAS, à partir de (c, l) ----
// Exemple : murDebout(6, 3, 3) pose un X en (6, 3), (6, 4) et (6, 5).
void murDebout(uint8_t c, uint8_t l, uint8_t n) {
  for (uint8_t i = 0; i < n; i++) {     // la même boucle que dans mur()…
    poser(c, l + i, ALPHABET[23]);      // …mais c'est la LIGNE qui avance, pas la colonne
    // murDebout(6, 3, 3) : i = 0 → (6, 3) ; i = 1 → (6, 4) ; i = 2 → (6, 5)
  }
}

// ---- vider l'écran, comme dans le serpent (le 0.93.8) ----
// Les 18 lignes de l'écran (0 à 17) : chacune est effacée sur ses 20 cases.
void viderEcran() {
  for (uint8_t l = 0; l < 18; l++) {    // l vaut 0, 1, 2… jusqu'à 17
    effacer(0, l, 20);                  // effacer(colonne, ligne, combien de cases) :
                                        // 20 cases à partir de la colonne 0 : toute la ligne
  }
}

// ---- dessiner la salle (sx, sy) : tout l'écran ----
// On l'appelle au départ, et chaque fois que le A change de salle :
// l'ancienne salle disparaît, la nouvelle est dessinée à sa place.
// Elle ne dessine PAS le A : c'est fait après l'appel, là où on l'appelle.
void dessinerSalle() {
  viderEcran();                         // on part d'un écran vide
  salle = sx + sy + sy;                 // le numéro de la salle (voir le dessin, tout en haut)

  // 1. le cadre, en entier : les lignes 0 et 16, les colonnes 0 et 19
  mur(0, 0, 20);                        // en haut : 20 X, de (0, 0) à (19, 0)
  mur(0, 16, 20);                       // en bas : 20 X, de (0, 16) à (19, 16)
  murDebout(0, 0, 17);                  // à gauche : 17 X, de (0, 0) à (0, 16)
  murDebout(19, 0, 17);                 // à droite : 17 X, de (19, 0) à (19, 16)
  // Les coins, comme (0, 0), reçoivent deux X : l'un sur l'autre, on n'en voit qu'un.

  // 2. les OUVERTURES : on efface le cadre du côté où il y a une salle voisine.
  //    Du côté où il n'y en a pas, le cadre reste : on ne sort pas du monde.
  //    « == » compare deux nombres (est-ce égal ?) ;
  //    « = » tout seul, lui, range un nombre dans une variable.
  if (sx == 0) {                // on est à gauche du monde : il y a une salle À DROITE
    effacer(19, 7, 1);          // 3 cases ouvertes dans la colonne 19 :
    effacer(19, 8, 1);          // les lignes 7, 8 et 9
    effacer(19, 9, 1);          // (une case à la fois : effacer() va vers la droite, pas vers le bas)
  }
  if (sx == 1) {                // on est à droite du monde : il y a une salle À GAUCHE
    effacer(0, 7, 1);           // les mêmes lignes, dans la colonne 0 :
    effacer(0, 8, 1);           // les deux ouvertures sont en face l'une de l'autre,
    effacer(0, 9, 1);           // le A sort par l'une et entre par l'autre
  }
  if (sy == 0) {                // on est en haut du monde : il y a une salle EN BAS
    effacer(9, 16, 2);          // 2 cases ouvertes dans la ligne 16 : les colonnes 9 et 10
  }
  if (sy == 1) {                // on est en bas du monde : il y a une salle EN HAUT
    effacer(9, 0, 2);           // les mêmes colonnes, dans la ligne 0
  }
  // Exemple : la salle 0 (sx = 0, sy = 0) est ouverte à droite et en bas ;
  // la salle 3 (sx = 1, sy = 1) est ouverte à gauche et en haut.

  // 3. les murs DANS la salle : chaque salle a les siens.
  //    Un seul de ces quatre « if » est vrai : celui de la salle où l'on est.
  if (salle == 0) {
    mur(4, 4, 12);              // une barre en haut : 12 X, de (4, 4) à (15, 4)
    poser(3, 12, ALPHABET[15]); // la PORTE de la salle 0, un P en (3, 12)
  }
  if (salle == 1) {
    murDebout(6, 3, 11);        // une colonne de (6, 3) à (6, 13) : on passe en haut ou en bas…
    murDebout(13, 1, 11);       // …une autre de (13, 1) à (13, 11) : on passe en bas seulement
  }
  if (salle == 2) {
    mur(3, 5, 6);               // une barre de (3, 5) à (8, 5)…
    mur(11, 11, 6);             // …et une autre de (11, 11) à (16, 11)
  }
  if (salle == 3) {
    mur(3, 8, 12);              // une barre au milieu : de (3, 8) à (14, 8)
    poser(15, 4, ALPHABET[15]); // la PORTE de la salle 3, un P en (15, 4)
  }

  // 4. sous le cadre, sur la ligne 17 : le numéro de la salle
  texte(0, 17, "SALLE");                // le mot, à partir de la case (0, 17)
  nombre(6, 17, salle);                 // le nombre, à partir de la case (6, 17)
}

// ---- main() : c'est ICI que la console commence ----
int main() {
  // ---- Le départ ----
  dessinerSalle();                        // la salle 0 (sx = 0, sy = 0)
  poser(ax, ay, ALPHABET[0]);             // le A à sa place, en (9, 8)

  // while (true) : « tant que vrai » : la boucle ne s'arrête jamais.
  // Tout ce qui est entre ses accolades { } recommence, encore et encore.
  while (true) {
    image();                              // on attend l'image suivante : 60 par seconde

    // ---- le A bouge avec la croix, un pas toutes les 150 ms (le 0.93.1) ----
    // chaque(150) est vrai une fois toutes les 150 millisecondes,
    // faux le reste du temps : le A fait environ 6 pas par seconde.
    if (chaque(150)) {
      // 1. la case d'ARRIVÉE (le 0.82). On part de la case où l'on est…
      nx = ax;
      ny = ay;
      // …et une flèche la change d'une case.
      // bouton(DROITE) est vrai tant que la flèche droite est tenue.
      // else if : « sinon, si… ». Dès qu'une flèche est trouvée, on ne
      // regarde pas les autres : une seule à la fois, pas de pas en diagonale.
      if (bouton(DROITE)) {
        nx = ax + 1;                      // une colonne à droite
      } else if (bouton(GAUCHE)) {
        nx = ax - 1;                      // une colonne à gauche (et 0 - 1 donne 255 !)
      } else if (bouton(BAS)) {
        ny = ay + 1;                      // une ligne plus bas
      } else if (bouton(HAUT)) {
        ny = ay - 1;                      // une ligne plus haut (et 0 - 1 donne 255 !)
      }
      // Pourquoi 255 ? Un uint8_t ne descend jamais sous 0 : 0 - 1 « fait
      // le tour » et donne 255, comme un compteur qui repart de la fin.

      // 2. une flèche est tenue : l'arrivée n'est pas la case où l'on est.
      //    « != » veut dire « différent de ». Sans flèche, nx == ax et
      //    ny == ay : rien à faire, on saute tout ce bloc.
      if (nx != ax || ny != ay) {
        // « || » veut dire « ou » : il suffit d'UNE des quatre conditions.
        if (nx == 20 || nx == 255 || ny == 17 || ny == 255) {
          // 3. …et l'arrivée est HORS de la salle : on change de SALLE.
          //    Ce test vient EN PREMIER : lire(20, 8) n'aurait pas de sens,
          //    la case (20, 8) n'existe pas.
          //    On ne peut sortir que par une ouverture : ailleurs, le cadre
          //    X est sur le chemin, et le A s'arrête avant (le cas 6).
          if (nx == 20) {       // sorti à droite (19 + 1 = 20) :
            sx = sx + 1;        //   la salle de droite (sx : 0 → 1)…
            nx = 0;             //   …où l'on entre par la gauche, en colonne 0
          }
          if (nx == 255) {      // sorti à gauche (0 - 1 = 255) :
            sx = sx - 1;        //   la salle de gauche (sx : 1 → 0)…
            nx = 19;            //   …où l'on entre par la droite, en colonne 19
          }
          if (ny == 17) {       // sorti en bas (16 + 1 = 17) :
            sy = sy + 1;        //   la salle d'en bas (sy : 0 → 1)…
            ny = 0;             //   …où l'on entre par le haut, en ligne 0
          }
          if (ny == 255) {      // sorti en haut (0 - 1 = 255) :
            sy = sy - 1;        //   la salle d'en haut (sy : 1 → 0)…
            ny = 16;            //   …où l'on entre par le bas, en ligne 16
          }
          // La ligne (ou la colonne) qui ne change pas reste la même :
          // sorti à droite en ligne 8, on entre à gauche… en ligne 8.
          ax = nx;                          // le A prend sa place dans la nouvelle salle
          ay = ny;
          dessinerSalle();                  // la nouvelle salle remplace l'ancienne
          poser(ax, ay, ALPHABET[0]);       // et le A y est dessiné
        } else if (lire(nx, ny) == ALPHABET[15]) {
          // 4. …l'arrivée est une PORTE P : elle mène à l'autre porte.
          //    lire(colonne, ligne) rend la lettre posée sur cette case.
          //    On n'arrive pas SUR la porte, mais à côté : on la voit encore,
          //    et c'est au joueur de décider d'y retourner.
          if (salle == 0) {     // la porte de la salle 0 mène à la salle 3…
            sx = 1;             //   (sx = 1, sy = 1 : en bas à droite)
            sy = 1;
            ax = 14;            // …à côté de sa porte, en (15, 4) : une case à gauche
            ay = 4;
          } else {              // sinon, on est dans la salle 3 : sa porte ramène à la salle 0…
            sx = 0;             //   (sx = 0, sy = 0 : en haut à gauche)
            sy = 0;
            ax = 4;             // …à côté de sa porte, en (3, 12) : une case à droite
            ay = 12;
          }
          // C'est un RACCOURCI : à pied, de la salle 0 à la salle 3, il faut
          // passer par la salle 1 ou par la salle 2.
          dessinerSalle();                  // l'autre salle remplace celle-ci
          poser(ax, ay, ALPHABET[0]);       // et le A y est dessiné
        } else if (lire(nx, ny) == 0) {
          // 5. …l'arrivée est VIDE (la tuile 0, un espace) : le A y va.
          effacer(ax, ay, 1);               // le A quitte sa case (elle redevient vide)…
          ax = nx;                          // …prend la case d'arrivée…
          ay = ny;
          poser(ax, ay, ALPHABET[0]);       // …et y est dessiné
        }
        // 6. …sinon, l'arrivée est un X : aucun des cas du dessus.
        //    Il ne se passe rien, le A reste où il est. C'est ça, un mur :
        //    il n'y a même pas besoin d'écrire un « if » pour lui.
      }
    }
  }
}
`,
    aVoir: 'Le A passe d’une salle à l’autre par les ouvertures du cadre ; les X l’arrêtent ; le P de la salle 0 mène à la salle 3, et celui de la salle 3 ramène à la salle 0.',
    controle: (c) => {
      const tenir = (b, cond, max = 400) => { let t = 0; while (t < max && !cond()) { c.gb.setButton(b, true); c.avancer(1); t++ } c.gb.setButton(b, false); c.avancer(30) }
      const v = (n) => c.variable(n)
      c.avancer(30)
      const depart = c.mot(0, 17, 5) === 'SALLE' && c.mot(9, 8, 1) === 'A' && c.mot(3, 12, 1) === 'P'
      tenir('up', () => false, 200)
      const ligne = v('ay')
      const arrete = ligne === 5 && c.mot(9, 4, 1) === 'X'
      tenir('down', () => v('ay') === 8)
      tenir('right', () => v('salle') === 1)
      const droite = v('salle') === 1 && v('ax') === 0 && c.mot(0, 8, 1) === 'A'
      tenir('left', () => v('salle') === 0)
      const gauche = v('salle') === 0 && v('ax') === 19 && c.mot(19, 8, 1) === 'A'
      tenir('left', () => v('ax') === 4)
      tenir('down', () => v('ay') === 12)
      tenir('left', () => v('salle') === 3)
      const porte1 = v('salle') === 3 && v('ax') === 14 && v('ay') === 4 && c.mot(14, 4, 2) === 'AP'
      tenir('right', () => v('salle') === 0)
      const porte2 = v('salle') === 0 && v('ax') === 4 && v('ay') === 12 && c.mot(3, 12, 2) === 'PA'
      return [
        ['la salle 0 : le cadre, le A en (9, 8), la porte P en (3, 12)', depart],
        ['HAUT : le mur X en (9, 4) arrête le A en (9, 5)', arrete, ` (le A en ligne ${ligne})`],
        ['sorti à droite, le A entre dans la salle 1 par la gauche', droite],
        ['sorti à gauche (255), il revient dans la salle 0, en colonne 19', gauche],
        ['la porte de la salle 0 mène à la salle 3, à côté de sa porte', porte1],
        ['la porte de la salle 3 ramène à la salle 0', porte2],
      ]
    },
  },

  {
    titre: 'Un micro Zelda — l’écran glisse dans le sens du A',
    difficulte: 0,
    suite: true,
    idee: 'Le 0.95, et à chaque passage d’une salle à une autre, l’écran GLISSE dans le sens où va le A : de gauche à droite, de droite à gauche, de haut en bas, de bas en haut. Avec defiler(x, y), 2 pixels par image.',
    texte: [
      '**C’est le 0.95, avec une chose en plus : le glissement.** Quand le A passe d’une salle à une autre, la nouvelle salle n’apparaît plus d’un coup : l’écran **glisse**, comme dans Zelda, **dans le sens où va le A**. Il va à **gauche** : l’ancienne salle part vers la droite, la nouvelle arrive par la gauche. À **droite** : l’ancienne part vers la gauche, la nouvelle arrive par la droite. En **haut** : l’ancienne descend, la nouvelle arrive par le haut. En **bas** : l’ancienne monte, la nouvelle arrive par le bas. Les **portes**, elles, téléportent : d’un coup, comme au 0.95.',
      '**Ce qui vient d’avant :** tout le 0.95 (les quatre salles, `sx`, `sy`, les murs, les portes, le 255 d’un `uint8_t` qui fait le tour), et `defiler(x, y)` du 0.90.3 : il ne bouge pas une lettre, il déplace **la caméra** qui regarde le décor, au pixel près. `x` la pousse vers la droite, `y` vers le bas.',
      '**Ce qui est nouveau ici (1) : le monde fait le tour.** Chaque salle a maintenant **quatre sorties** : à gauche, à droite, en haut, en bas. À droite de la salle 1, on revient à la salle 0 ; à gauche de la salle 0, on arrive à la salle 1 ; en haut de la salle 0, on arrive à la salle 2. Ainsi, **chaque** sortie mène à une salle, et l’écran glisse à chaque fois, dès le départ. Avec deux colonnes de salles, changer de colonne s’écrit `sx = 1 - sx` : 1 - 0 = **1**, 1 - 1 = **0**. Pareil pour les lignes : `sy = 1 - sy`.',
      '**Ce qui est nouveau ici (2) : le décor est plus grand que l’écran.** Le décor de la console fait **32 colonnes sur 32 lignes** (256 × 256 pixels) ; l’écran n’en montre que **20 sur 18** (160 × 144 pixels). Le reste attend, caché. Et le décor est un **ruban**, dans les deux sens : après la colonne 31 revient la colonne 0, après la ligne 31 revient la ligne 0.',
      '**Ce qui est nouveau ici (3) : la salle n’est plus toujours dans le coin (0, 0) du décor.** Deux variables le retiennent : `bord`, la colonne du décor où commence la salle, et `haut`, la ligne. Une case (c, l) **de la salle** est la case `((c + bord) % 32, (l + haut) % 32)` **du décor**. `% 32`, le reste de la division par 32, fait le tour du ruban : avec `bord` = 12, la colonne 19 de la salle est (19 + 12) % 32 = **31** ; une colonne 20 serait (20 + 12) % 32 = 32 % 32 = **0**. La caméra suit : `camx = bord × 8`, `camy = haut × 8` (8 pixels par case).',
      '**Ce qui est nouveau ici (4) : poserSalle() et lireSalle().** Elles font ce calcul pour nous : `poserSalle(c, l, tuile)` au lieu de `poser()`, `lireSalle(c, l)` au lieu de `lire()`. Tout le programme passe par elles, et `ax`, `ay` restent des cases **de la salle**. `lireSalle()` **rend** un nombre : `uint8_t` devant son nom, et `return` pour dire lequel. Pour effacer, on pose la tuile **0** (une case vide). Et « SALLE n » s’écrit maintenant lettre par lettre avec `poserSalle()` (le chiffre n est la tuile `27 + n`) : `texte()` et `nombre()` ne savent pas ajouter `bord` et `haut`.',
      '**Ce qui est nouveau ici (5) : dessiner une seule colonne, ou une seule ligne.** Le dessin de la salle (cadre, ouvertures, murs, portes, « SALLE n ») devient la fonction `dessinerMurs()`. Deux variables disent ce qu’elle dessine : `seule` (une colonne) et `seuleL` (une ligne) ; **255** veut dire « toutes ». C’est `poserSalle()` qui trie : `(seule == 255 || c == seule) && (seuleL == 255 || l == seuleL)`. `&&` veut dire « et » : les deux doivent être vrais. `colonneSalle(c)` vide la colonne c, puis la dessine, elle seule ; `ligneSalle(l)` fait pareil pour une ligne.',
      '**Ce qui est nouveau ici (6) : les quatre glissements.** Quand le A sort à **gauche**, `glisserAGauche()` : la nouvelle salle se met 20 colonnes plus à gauche (`bord + 12`, car 32 - 20 = 12 sur le ruban). Puis 20 tours : on dessine la colonne qui va entrer par la gauche (19, puis 18… jusqu’à 0), et la caméra **recule** d’une case en **4 petits pas de 2 pixels**, un par image : `camx = camx - 2`, `defiler(camx, camy)`. À **droite**, `glisserADroite()` : 20 colonnes plus à droite (`bord + 20`), on dessine les colonnes 0, 1… 19, et la caméra **avance** : `camx = camx + 2`. En **haut** et en **bas**, c’est pareil, mais debout : ligne par ligne avec `ligneSalle()`, et c’est `camy` qui bouge. La salle a 18 lignes : 18 lignes plus haut, c’est `haut + 14` (32 - 18 = 14) ; plus bas, `haut + 18`.',
      '**Déroulons, à gauche, depuis le départ** (`bord` = 0, caméra à 0). Le A va jusqu’en (0, 8), l’ouverture, puis encore GAUCHE : l’arrivée est 0 - 1 = **255**, sorti à gauche. `sx` devient 1 - 0 = 1, `bord` devient 12. Tour 0 : la colonne 19 de la salle 1 va dans la colonne (19 + 12) % 32 = **31** du décor, cachée ; la caméra passe à 0 - 2 = **254** (elle fait le tour), puis 252, 250, 248 : la colonne 31 entre par la gauche, 2 pixels à chaque image. … Tour 11 : la colonne 8 va dans la colonne **20**, la dernière colonne cachée. Tour 12 : la colonne 7 va dans la colonne **19**. C’était l’ancienne salle ! Mais elle vient de sortir de l’écran par la droite : on peut la remplacer. … Tour 19 : la colonne 0 va dans la colonne 12 ; la caméra est à **96** (12 × 8) : l’écran montre les colonnes 12 à 31, toute la salle 1. Le A est posé en (19, 8).',
      '**Pourquoi 4 petits pas de 2 pixels ?** 8 pixels d’un coup à chaque image, c’est trop rapide : les 20 colonnes passeraient en 20 images, un tiers de seconde, et l’œil ne verrait pas glisser. Avec 2 pixels par image : 20 × 4 = **80 images** à gauche et à droite, 18 × 4 = **72** en haut et en bas, un peu plus d’une seconde.',
      '**Pourquoi vider la colonne (ou la ligne) avant de la dessiner ?** Au milieu du glissement, elle contient encore l’ancienne salle. `dessinerMurs()` ne pose que des X, des P, des lettres et quelques cases vides : un X de l’ancienne salle, là où la nouvelle n’en a pas, resterait.',
      '**Le A pendant le glissement :** on le retire avant (sinon, il partirait avec l’ancienne salle), et on le pose après, du côté par où il entre : sorti à gauche, il entre à droite, en colonne 19 ; sorti en haut, il entre en bas, en ligne 16. L’autre coordonnée ne change pas.',
      '**Et les portes ?** `dessinerSalle()` redessine d’un coup, et remet tout à zéro : `bord` = 0, `haut` = 0, la caméra à (0, 0). `viderEcran()` efface maintenant **tout** le décor, 32 lignes de 32 cases : les parties cachées doivent être vides, car un glissement va les montrer.',
      '**Essaie :** pour glisser plus vite, fais 2 petits pas de 4 pixels : `p < 2` et `camx = camx - 4` (2 × 4 = 8, toujours une case). Plus lentement : 8 petits pas de 1 pixel. La règle : le nombre de pas × les pixels par pas = 8.',
    ],
    code: `// ---- UN MICRO ZELDA : L'ÉCRAN GLISSE DANS LE SENS DU A ----
// C'est le 0.95, avec une chose en plus : à CHAQUE passage d'une salle
// à une autre, la nouvelle salle n'apparaît plus d'un coup. L'écran
// GLISSE, dans le sens où va le A :
//   le A va à GAUCHE : l'ancienne salle part vers la droite, la nouvelle arrive par la gauche ;
//   le A va à DROITE : l'ancienne salle part vers la gauche, la nouvelle arrive par la droite ;
//   le A va en HAUT  : l'ancienne salle part vers le bas, la nouvelle arrive par le haut ;
//   le A va en BAS   : l'ancienne salle part vers le haut, la nouvelle arrive par le bas.
// Les portes, elles, téléportent : elles redessinent d'un coup, comme au 0.95.
//
// Tout ce qui suit « // » sur une ligne est un COMMENTAIRE : la console
// ne le lit pas. Il n'est là que pour toi, pour expliquer le code.
//
// Les lettres : A = le héros, X = un mur, P = une porte.
// ALPHABET[0]  : le A    ALPHABET[23] : le X    ALPHABET[15] : le P
// ALPHABET[n] : la n-ième lettre, en comptant à partir de 0 (pas de 1) :
//   A = 0, B = 1, C = 2, D = 3, E = 4… L = 11… P = 15, S = 18… X = 23.
// La tuile 0, c'est une case VIDE (un espace).
// La tuile 27, c'est le chiffre 0 ; 28 le 1, 29 le 2, 30 le 3 : 27 + n, le chiffre n.
//
// Le monde : QUATRE salles, deux de large, deux de haut (le 0.95).
//
//      sx = 0      sx = 1
//   +---------+---------+
//   | salle 0 | salle 1 |   sy = 0
//   +---------+---------+
//   | salle 2 | salle 3 |   sy = 1
//   +---------+---------+
//
// salle = sx + sy + sy   (0 + 0 + 0 = 0, 1 + 0 + 0 = 1, 0 + 1 + 1 = 2, 1 + 1 + 1 = 3)
//
// NOUVEAU : LE MONDE FAIT LE TOUR, dans les deux sens.
// Chaque salle a une sortie de chaque côté : à gauche, à droite, en haut,
// en bas. À droite de la salle 1, on revient à la salle 0 ; à gauche de la
// salle 0, on arrive à la salle 1. En bas de la salle 2, on revient à la
// salle 0 ; en haut de la salle 0, on arrive à la salle 2. Ainsi, CHAQUE
// sortie mène à une salle, et l'écran glisse à chaque fois.
// Avec deux colonnes de salles, changer de colonne, c'est : sx = 1 - sx
//   1 - 0 = 1 (on passe de la colonne 0 à la colonne 1),
//   1 - 1 = 0 (on passe de la colonne 1 à la colonne 0).
// Et changer de ligne de salles : sy = 1 - sy.
//
// NOUVEAU : LE DÉCOR EST PLUS GRAND QUE L'ÉCRAN.
// Le décor de la console fait 32 colonnes sur 32 lignes (256 × 256 pixels) ;
// l'écran n'en montre que 20 colonnes sur 18 lignes (160 × 144 pixels).
// defiler(x, y) choisit QUEL morceau on regarde : x et y sont la place de
// la « caméra », en pixels (8 pixels = 1 case).
//
//   colonnes du décor :  0 ............ 19 20 ...... 31
//                        [    l'écran, camx = 0  ][ caché ]
//   (et pareil en hauteur : les lignes 0 à 17 à l'écran, 18 à 31 cachées)
//
// Le décor est un RUBAN, dans les deux sens : après la colonne 31 revient
// la colonne 0 ; après la ligne 31 revient la ligne 0.
//
// La salle, elle, garde ses colonnes 0 à 19 et ses lignes 0 à 17 :
// les lignes 0 à 16 pour le terrain, la ligne 17 pour « SALLE n ».
// bord dit dans quelle colonne DU DÉCOR est sa colonne 0 ;
// haut dit dans quelle ligne DU DÉCOR est sa ligne 0 :
//   colonne du décor = (colonne de la salle + bord) % 32
//   ligne du décor   = (ligne de la salle + haut) % 32
// % 32 : le reste de la division par 32 ; il fait « le tour du ruban ».
//   Exemple, bord = 12 : la colonne 19 de la salle est (19 + 12) % 32 = 31,
//   et s'il y avait une colonne 20 : (20 + 12) % 32 = 32 % 32 = 0.
// La caméra regarde toujours la salle : camx = bord × 8, camy = haut × 8.

// ---- Les variables ----
// uint8_t : une boîte qui garde un nombre de 0 à 255, jamais en dessous de 0.
uint8_t ax = 9;           // le A, le héros : sa colonne DANS LA SALLE (0 à 19)…
uint8_t ay = 8;           // …et sa ligne (0 à 16). Il part de (9, 8).
uint8_t nx = 0;           // la case d'ARRIVÉE, calculée AVANT de bouger (le 0.82)
uint8_t ny = 0;
uint8_t sx = 0;           // la salle : sa colonne dans le monde (0 ou 1)…
uint8_t sy = 0;           // …et sa ligne (0 ou 1). On part de la salle 0.
uint8_t salle = 0;        // son numéro, 0 à 3
uint8_t bord = 0;         // NOUVEAU : la colonne du décor où commence la salle (0 à 31)
uint8_t haut = 0;         // NOUVEAU : la ligne du décor où commence la salle (0 à 31)
uint8_t camx = 0;         // NOUVEAU : la place de la caméra, en pixels : de gauche à droite…
uint8_t camy = 0;         // …et de haut en bas. defiler(camx, camy).
uint8_t seule = 255;      // NOUVEAU : 255 = toutes les colonnes ; 0 à 19 = CETTE colonne seulement
uint8_t seuleL = 255;     // NOUVEAU : 255 = toutes les lignes ;   0 à 17 = CETTE ligne seulement

// ---- NOUVEAU : poser une lettre sur une case DE LA SALLE ----
// Au 0.95, on écrivait poser(c, l, …) : la salle était toujours dans les
// colonnes 0 à 19 et les lignes 0 à 17 du décor. Maintenant, elle peut être
// ailleurs : on ajoute bord et haut, et % 32 fait le tour du ruban.
// Et si seule (ou seuleL) n'est pas 255, on ne pose QUE dans cette colonne
// (ou cette ligne) : le reste n'est pas touché (c'est pour le glissement).
// && : « et ». Il faut que les DEUX conditions soient vraies.
void poserSalle(uint8_t c, uint8_t l, uint8_t t) {
  if ((seule == 255 || c == seule) && (seuleL == 255 || l == seuleL)) {
    poser((c + bord) % 32, (l + haut) % 32, t);  // t : une lettre, un chiffre, ou 0 pour vide
  }
}

// ---- NOUVEAU : lire la lettre d'une case DE LA SALLE ----
// Même calcul que poserSalle(). « uint8_t » devant le nom : cette fonction
// REND un nombre (la tuile lue). « return » dit lequel.
uint8_t lireSalle(uint8_t c, uint8_t l) {
  return lire((c + bord) % 32, (l + haut) % 32);
}

// ---- n murs X à la suite, vers la DROITE, à partir de (c, l) (le 0.95) ----
// Exemple : mur(4, 4, 3) pose un X en (4, 4), (5, 4) et (6, 4).
// Seul changement : poserSalle() au lieu de poser().
void mur(uint8_t c, uint8_t l, uint8_t n) {
  for (uint8_t i = 0; i < n; i++) {     // i vaut 0, puis 1, puis 2… jusqu'à n - 1
    poserSalle(c + i, l, ALPHABET[23]); // un X, i cases à droite du départ
  }
}

// ---- n murs X à la suite, vers le BAS, à partir de (c, l) (le 0.95) ----
// Exemple : murDebout(6, 3, 3) pose un X en (6, 3), (6, 4) et (6, 5).
void murDebout(uint8_t c, uint8_t l, uint8_t n) {
  for (uint8_t i = 0; i < n; i++) {
    poserSalle(c, l + i, ALPHABET[23]); // c'est la LIGNE qui avance, pas la colonne
  }
}

// ---- vider TOUT le décor ----
// Les 32 lignes, sur leurs 32 colonnes (et plus 18 × 20 comme au 0.95) :
// les parties cachées doivent être vides elles aussi, car le glissement
// va les montrer.
void viderEcran() {
  for (uint8_t l = 0; l < 32; l++) {    // l vaut 0, 1, 2… jusqu'à 31
    effacer(0, l, 32);                  // 32 cases à partir de la colonne 0 : toute la ligne du décor
  }
}

// ---- NOUVEAU : toute la salle (sx, sy) : murs, portes, et « SALLE n » ----
// C'était le milieu de dessinerSalle() au 0.95. On le met à part pour
// pouvoir l'appeler de plusieurs façons :
//   seule = 255, seuleL = 255 : toute la salle est dessinée ;
//   seule = 7                 : seule la colonne 7 est dessinée ;
//   seuleL = 5                : seule la ligne 5 est dessinée.
// C'est poserSalle() qui trie : les autres cases sont ignorées.
// Les ouvertures s'écrivent poserSalle(…, 0) : poser une case vide, c'est
// effacer. (effacer() ne sait pas qu'il faut ajouter bord et haut.)
void dessinerMurs() {
  salle = sx + sy + sy;                 // le numéro de la salle

  // 1. le cadre, en entier : les lignes 0 et 16, les colonnes 0 et 19
  mur(0, 0, 20);                        // en haut : de (0, 0) à (19, 0)
  mur(0, 16, 20);                       // en bas : de (0, 16) à (19, 16)
  murDebout(0, 0, 17);                  // à gauche : de (0, 0) à (0, 16)
  murDebout(19, 0, 17);                 // à droite : de (19, 0) à (19, 16)

  // 2. NOUVEAU : les OUVERTURES, de chaque côté, TOUJOURS (le monde fait le tour).
  //    Plus besoin de « if » : chaque salle a ses quatre sorties.
  poserSalle(0, 7, 0);                  // à gauche : les lignes 7, 8, 9 de la colonne 0
  poserSalle(0, 8, 0);
  poserSalle(0, 9, 0);
  poserSalle(19, 7, 0);                 // à droite : les lignes 7, 8, 9 de la colonne 19
  poserSalle(19, 8, 0);
  poserSalle(19, 9, 0);
  poserSalle(9, 0, 0);                  // en haut : les colonnes 9 et 10 de la ligne 0
  poserSalle(10, 0, 0);
  poserSalle(9, 16, 0);                 // en bas : les colonnes 9 et 10 de la ligne 16
  poserSalle(10, 16, 0);

  // 3. les murs DANS la salle : chaque salle a les siens (le 0.95)
  if (salle == 0) {
    mur(4, 4, 12);                      // une barre en haut : de (4, 4) à (15, 4)
    poserSalle(3, 12, ALPHABET[15]);    // la PORTE de la salle 0, en (3, 12)
  }
  if (salle == 1) {
    murDebout(6, 3, 11);                // une colonne de (6, 3) à (6, 13)…
    murDebout(13, 1, 11);               // …une autre de (13, 1) à (13, 11)
  }
  if (salle == 2) {
    mur(3, 5, 6);                       // une barre de (3, 5) à (8, 5)…
    mur(11, 11, 6);                     // …et une autre de (11, 11) à (16, 11)
  }
  if (salle == 3) {
    mur(3, 8, 12);                      // une barre au milieu : de (3, 8) à (14, 8)
    poserSalle(15, 4, ALPHABET[15]);    // la PORTE de la salle 3, en (15, 4)
  }

  // 4. NOUVEAU : « SALLE » et son numéro, sur la ligne 17, lettre par lettre.
  //    texte() et nombre() ne savent pas ajouter bord et haut ; poserSalle(), si.
  //    Et comme ça, la ligne 17 glisse avec la salle.
  poserSalle(0, 17, ALPHABET[18]);      // S
  poserSalle(1, 17, ALPHABET[0]);       // A
  poserSalle(2, 17, ALPHABET[11]);      // L
  poserSalle(3, 17, ALPHABET[11]);      // L
  poserSalle(4, 17, ALPHABET[4]);       // E
  poserSalle(6, 17, 27 + salle);        // le chiffre : 27 + 0 = le 0, 27 + 3 = le 3
}

// ---- dessiner la salle D'UN COUP (le 0.95) ----
// Au départ, et pour les portes. On remet tout à zéro : la salle revient
// dans les colonnes 0 à 19 et les lignes 0 à 17 du décor, la caméra aussi.
void dessinerSalle() {
  viderEcran();                         // le décor vide, en entier
  bord = 0;                             // la salle commence à la colonne 0…
  haut = 0;                             // …et à la ligne 0 du décor
  camx = 0;                             // la caméra la regarde depuis le coin (0, 0)
  camy = 0;
  defiler(camx, camy);
  seule = 255;                          // toute la salle
  seuleL = 255;
  dessinerMurs();
}

// ---- NOUVEAU : UNE colonne de la nouvelle salle ----
// D'abord, on la vide, lignes 0 à 17 : l'ancienne salle y avait peut-être
// un X, que la nouvelle n'a pas. Puis on y dessine la colonne c, et elle seule.
void colonneSalle(uint8_t c) {
  seule = c;                            // on ne touche QUE la colonne c
  for (uint8_t l = 0; l < 18; l++) {
    poserSalle(c, l, 0);                // vider, du haut (0) au bas (17)
  }
  dessinerMurs();                       // puis dessiner : seule la colonne c est posée
  seule = 255;                          // de nouveau toutes les colonnes
}

// ---- NOUVEAU : UNE ligne de la nouvelle salle ----
// La même chose, couchée : on vide la ligne l, colonnes 0 à 19, puis on la dessine.
void ligneSalle(uint8_t l) {
  seuleL = l;                           // on ne touche QUE la ligne l
  for (uint8_t c = 0; c < 20; c++) {
    poserSalle(c, l, 0);                // vider, de la gauche (0) à la droite (19)
  }
  dessinerMurs();
  seuleL = 255;
}

// ---- NOUVEAU : le GLISSEMENT quand le A sort à GAUCHE ----
//
// La nouvelle salle se met 20 colonnes à GAUCHE de l'ancienne :
//   bord - 20, sur le ruban de 32, c'est bord + 12 (32 - 20 = 12).
//   Exemple : bord = 0 → la nouvelle salle commence en colonne 12 du décor.
// La caméra RECULE (camx diminue) : l'ancienne salle part vers la droite.
// Juste avant chaque pas, on dessine la colonne qui va entrer par la GAUCHE :
// la 19, puis la 18… jusqu'à la 0.
//   tour 0  : la colonne 19 de la salle, dans la colonne (19 + 12) % 32 = 31 du décor, cachée
//   tour 11 : la colonne 8, dans la colonne 20 (la dernière colonne cachée)
//   tour 12 : la colonne 7, dans la colonne 19. C'était l'ancienne salle, mais
//             elle vient de sortir de l'écran par la droite : on peut la remplacer.
//   tour 19 : la colonne 0, dans la colonne 12. Fini : camx = 96, l'écran montre 12 à 31.
// Chaque colonne entre en 4 PETITS PAS de 2 pixels, un par image (4 × 2 = 8 pixels) :
// 20 colonnes × 4 images = 80 images, un peu plus d'une seconde.
void glisserAGauche() {
  sx = 1 - sx;                          // l'autre colonne du monde (0 → 1, 1 → 0)
  bord = (bord + 12) % 32;              // la nouvelle salle : 20 colonnes plus à gauche
  for (uint8_t k = 0; k < 20; k++) {    // 20 tours : une colonne par tour
    colonneSalle(19 - k);               // la colonne qui va entrer à gauche : 19, 18… 0
    for (uint8_t p = 0; p < 4; p++) {   // 4 petits pas de 2 pixels (p vaut 0, 1, 2, 3)
      image();                          // un petit pas par image
      camx = camx - 2;                  // la caméra RECULE : 0, 254, 252… (0 - 2 fait le tour : 254)
      defiler(camx, camy);              // le décor glisse vers la DROITE
    }
  }
}

// ---- NOUVEAU : le GLISSEMENT quand le A sort à DROITE ----
// Le même, dans l'autre sens.
// La nouvelle salle se met 20 colonnes à DROITE de l'ancienne : bord + 20.
//   Exemple : bord = 0 → la nouvelle salle commence en colonne 20 du décor
//   (les colonnes 20 à 31, puis 0 à 7 : le ruban fait le tour).
// La caméra AVANCE (camx augmente) : l'ancienne salle part vers la gauche.
// On dessine la colonne qui va entrer par la DROITE : la 0, puis la 1… jusqu'à la 19.
//   tour 0  : la colonne 0 de la salle, dans la colonne (0 + 20) % 32 = 20 du décor, cachée
//   tour 12 : la colonne 12, dans la colonne (12 + 20) % 32 = 0. C'était l'ancienne
//             salle, mais elle vient de sortir de l'écran par la gauche.
void glisserADroite() {
  sx = 1 - sx;                          // l'autre colonne du monde
  bord = (bord + 20) % 32;              // la nouvelle salle : 20 colonnes plus à droite
  for (uint8_t k = 0; k < 20; k++) {
    colonneSalle(k);                    // la colonne qui va entrer à droite : 0, 1… 19
    for (uint8_t p = 0; p < 4; p++) {
      image();
      camx = camx + 2;                  // la caméra AVANCE : 0, 2, 4… (254 + 2 fait le tour : 0)
      defiler(camx, camy);              // le décor glisse vers la GAUCHE
    }
  }
}

// ---- NOUVEAU : le GLISSEMENT quand le A sort en HAUT ----
// Pareil, mais debout : on travaille ligne par ligne, et c'est camy qui bouge.
// La salle a 18 lignes (0 à 17) ; le décor en a 32.
// La nouvelle salle se met 18 lignes AU-DESSUS : haut - 18, sur le ruban de 32,
// c'est haut + 14 (32 - 18 = 14).
// On dessine la ligne qui va entrer par le HAUT : la 17, puis la 16… jusqu'à la 0.
// 18 lignes × 4 images = 72 images.
void glisserEnHaut() {
  sy = 1 - sy;                          // l'autre ligne du monde (0 → 1, 1 → 0)
  haut = (haut + 14) % 32;              // la nouvelle salle : 18 lignes plus haut
  for (uint8_t k = 0; k < 18; k++) {    // 18 tours : une ligne par tour
    ligneSalle(17 - k);                 // la ligne qui va entrer en haut : 17, 16… 0
    for (uint8_t p = 0; p < 4; p++) {
      image();
      camy = camy - 2;                  // la caméra MONTE : le décor glisse vers le BAS
      defiler(camx, camy);
    }
  }
}

// ---- NOUVEAU : le GLISSEMENT quand le A sort en BAS ----
// La nouvelle salle se met 18 lignes AU-DESSOUS : haut + 18.
// On dessine la ligne qui va entrer par le BAS : la 0, puis la 1… jusqu'à la 17.
void glisserEnBas() {
  sy = 1 - sy;
  haut = (haut + 18) % 32;              // la nouvelle salle : 18 lignes plus bas
  for (uint8_t k = 0; k < 18; k++) {
    ligneSalle(k);                      // la ligne qui va entrer en bas : 0, 1… 17
    for (uint8_t p = 0; p < 4; p++) {
      image();
      camy = camy + 2;                  // la caméra DESCEND : le décor glisse vers le HAUT
      defiler(camx, camy);
    }
  }
}

// ---- main() : c'est ICI que la console commence ----
int main() {
  dessinerSalle();                        // la salle 0, d'un coup
  poserSalle(ax, ay, ALPHABET[0]);        // le A à sa place, en (9, 8)

  while (true) {                          // la boucle ne s'arrête jamais
    image();                              // on attend l'image suivante : 60 par seconde

    // ---- le A bouge avec la croix, un pas toutes les 150 ms (le 0.93.1) ----
    if (chaque(150)) {
      // 1. la case d'ARRIVÉE (le 0.82) ; une seule flèche à la fois (else if)
      nx = ax;
      ny = ay;
      if (bouton(DROITE)) {
        nx = ax + 1;                      // une colonne à droite
      } else if (bouton(GAUCHE)) {
        nx = ax - 1;                      // une colonne à gauche (0 - 1 donne 255 !)
      } else if (bouton(BAS)) {
        ny = ay + 1;                      // une ligne plus bas
      } else if (bouton(HAUT)) {
        ny = ay - 1;                      // une ligne plus haut (0 - 1 donne 255 !)
      }

      // 2. une flèche est tenue : l'arrivée n'est pas la case où l'on est (!= : « différent de »)
      if (nx != ax || ny != ay) {
        // 3. NOUVEAU : l'arrivée est HORS de la salle : l'écran GLISSE vers la nouvelle.
        //    Ces tests viennent en premier : lireSalle(255, 8) n'aurait pas de sens.
        //    Avant de glisser, on retire le A de l'ancienne salle (sinon, il
        //    partirait avec elle) ; après, on le pose, du côté par où il entre.
        if (nx == 255) {                  // sorti à GAUCHE (0 - 1 = 255)
          poserSalle(ax, ay, 0);
          glisserAGauche();
          ax = 19;                        // il entre par la DROITE, sur la même ligne
          poserSalle(ax, ay, ALPHABET[0]);
        } else if (nx == 20) {            // sorti à DROITE (19 + 1 = 20)
          poserSalle(ax, ay, 0);
          glisserADroite();
          ax = 0;                         // il entre par la GAUCHE
          poserSalle(ax, ay, ALPHABET[0]);
        } else if (ny == 255) {           // sorti en HAUT (0 - 1 = 255)
          poserSalle(ax, ay, 0);
          glisserEnHaut();
          ay = 16;                        // il entre par le BAS, dans la même colonne
          poserSalle(ax, ay, ALPHABET[0]);
        } else if (ny == 17) {            // sorti en BAS (16 + 1 = 17)
          poserSalle(ax, ay, 0);
          glisserEnBas();
          ay = 0;                         // il entre par le HAUT
          poserSalle(ax, ay, ALPHABET[0]);
        } else if (lireSalle(nx, ny) == ALPHABET[15]) {
          // 4. …l'arrivée est une PORTE P : elle mène à l'autre porte (le 0.95)
          if (salle == 0) {     // la porte de la salle 0 mène à la salle 3…
            sx = 1;
            sy = 1;
            ax = 14;            // …à côté de sa porte, en (15, 4) : une case à gauche
            ay = 4;
          } else {              // sinon, la porte de la salle 3 ramène à la salle 0…
            sx = 0;
            sy = 0;
            ax = 4;             // …à côté de sa porte, en (3, 12) : une case à droite
            ay = 12;
          }
          dessinerSalle();                  // une porte téléporte : d'un coup
          poserSalle(ax, ay, ALPHABET[0]);
        } else if (lireSalle(nx, ny) == 0) {
          // 5. …l'arrivée est VIDE : le A y va.
          poserSalle(ax, ay, 0);            // le A quitte sa case (on y pose du vide)…
          ax = nx;                          // …prend la case d'arrivée…
          ay = ny;
          poserSalle(ax, ay, ALPHABET[0]);  // …et y est dessiné
        }
        // 6. …sinon, l'arrivée est un X : il ne se passe rien. C'est ça, un mur.
      }
    }
  }
}
`,
    aVoir: 'À chaque sortie, l’écran glisse dans le sens du A : à gauche, à droite, en haut, en bas. Les portes P téléportent d’un coup.',
    controle: (c) => {
      const v = (n) => c.variable(n)
      const cle = () => v('camx') + 256 * v('camy')
      /* On tient la flèche jusqu'à ce que la caméra bouge, puis on compte
         les places par où elle passe pendant le glissement. */
      const glisse = (b) => {
        c.gb.setButton(b, true)
        let t = 0
        const depart = cle()
        while (cle() === depart && t < 400) { c.avancer(1); t++ }
        c.gb.setButton(b, false)
        const places = new Set([cle()])
        for (let i = 0; i < 100; i++) { c.avancer(1); places.add(cle()) }
        return places.size
      }
      const aller = (b, cond) => { let t = 0; c.gb.setButton(b, true); while (t < 300 && !cond()) { c.avancer(1); t++ } c.gb.setButton(b, false); c.avancer(20) }
      const leA = () => c.mot((v('ax') + v('bord')) % 32, (v('ay') + v('haut')) % 32, 1) === 'A'
      c.avancer(30)
      const g = glisse('left')
      const gauche = v('salle') === 1 && v('bord') === 12 && v('camx') === 96 && v('ax') === 19 && leA()
      const d = glisse('right')
      const droite = v('salle') === 0 && v('bord') === 0 && v('camx') === 0 && v('ax') === 0 && leA()
      aller('right', () => v('ax') === 9)
      const b = glisse('down')
      const bas = v('salle') === 2 && v('haut') === 18 && v('camy') === 144 && v('ay') === 0 && leA()
      const murs2 = c.mot(3, 23, 6) === 'XXXXXX'
      const h = glisse('up')
      const enHaut = v('salle') === 0 && v('haut') === 0 && v('camy') === 0 && v('ay') === 16 && leA()
      return [
        ['sorti à GAUCHE : l’écran glisse, 2 pixels par image, vers la salle 1', g >= 78 && gauche, ` (${g} places de caméra)`],
        ['sorti à DROITE : il glisse dans l’autre sens, retour à la salle 0', d >= 78 && droite, ` (${d} places)`],
        ['sorti en BAS : il glisse vers le haut, la salle 2 arrive par le bas', b >= 70 && bas && murs2, ` (${b} places)`],
        ['sorti en HAUT : il glisse vers le bas, retour à la salle 0', h >= 70 && enHaut, ` (${h} places)`],
      ]
    },
  },

  /*
   * Le chapitre 1 va par paires : une leçon AFFICHE le mot, la suivante
   * l'EFFACE. D'une paire à l'autre, une seule chose change — la façon de
   * dire le mot et sa place : en clair, sous un nom, dans x et y, dans un Mot.
   *
   * « suite » : la leçon prolonge la précédente au lieu d'ouvrir la suivante.
   * Elle s'affiche « 1.1 », et les leçons d'après gardent leur numéro.
   */
  {
    titre: 'Écrire à l’écran',
    difficulte: 1,
    idee: 'Une cartouche qui affiche un mot, et rien d’autre.',
    texte: [
      'Le plus petit programme qui fait quelque chose. Comme tout programme C++, il commence à **`int main()`** : c’est là que la console arrive.',
      '`texte(colonne, ligne, "…")` écrit à partir d’une case : l’écran en fait **20 de large sur 18 de haut**, et la case (0, 0) est en haut à gauche.',
      '`while (true) image();` n’est pas décoratif. Un programme qui se termine laisse le processeur partir n’importe où ; ici, il attend l’image suivante, soixante fois par seconde, et l’écran reste affiché.',
    ],
    code: `int main() {
  texte(5, 6, "BONJOUR");

  while (true) image();
}
`,
    aVoir: '« BONJOUR » à la colonne 5, ligne 6.',
    controle: (c) => [
      ['« BONJOUR » est écrit en (5, 6)', c.mot(5, 6, 7) === 'BONJOUR'],
      ['l’écran est allumé', c.ecranAllume()],
    ],
  },

  {
    titre: 'Effacer avec des espaces',
    difficulte: 1,
    suite: true,
    idee: 'Il n’y a pas de gomme : on écrit du vide par-dessus.',
    texte: [
      '**L’espace est une case vide.** Écrire des espaces par-dessus un mot, c’est l’effacer.',
      'Il en faut **autant que de lettres** : `BONJOUR` en a sept, donc sept espaces. Un de moins laisse le `R` tout seul.',
    ],
    code: `int main() {
  texte(5, 6, "BONJOUR");
  texte(5, 6, "       ");

  while (true) image();
}
`,
    aVoir: '« BONJOUR » est écrit puis recouvert d’espaces : l’écran reste vide.',
    controle: (c) => {
      c.avancer(10)
      return [
        ['les sept cases de BONJOUR sont vides', c.mot(5, 6, 7) === '       '],
        ['et l’écran est allumé', c.ecranAllume()],
      ]
    },
  },

  {
    titre: 'Effacer sans compter',
    difficulte: 1,
    suite: true,
    idee: 'effacer() compte les lettres à ta place.',
    texte: [
      '`effacer(5, 6, "BONJOUR")` efface **autant de cases que le mot a de lettres** : sept. Plus d’espaces à compter.',
      'Il faut effacer **à la même place** qu’on a écrit : ici, (5, 6) deux fois.',
    ],
    code: `int main() {
  texte(5, 6, "BONJOUR");
  effacer(5, 6, "BONJOUR");

  while (true) image();
}
`,
    aVoir: '« BONJOUR » est écrit puis effacé : l’écran reste vide.',
    controle: (c) => {
      c.avancer(10)
      return [
        ['les sept cases de BONJOUR sont vides', c.mot(5, 6, 7) === '       '],
        ['et l’écran est allumé', c.ecranAllume()],
      ]
    },
  },

  {
    titre: 'Ranger le mot sous un nom',
    difficulte: 1,
    suite: true,
    idee: 'Le mot est écrit une seule fois, en haut, et porte un nom.',
    texte: [
      '`const char MOT[] = "BONJOUR";` range le mot sous le nom `MOT`, au-dessus de `int main()`. C’est la chaîne de caractères de cette console.',
      '`texte(5, 6, MOT)` écrit ce que `MOT` contient.',
    ],
    code: `const char MOT[] = "BONJOUR";

int main() {
  texte(5, 6, MOT);

  while (true) image();
}
`,
    aVoir: '« BONJOUR » à la colonne 5, ligne 6.',
    controle: (c) => {
      c.avancer(10)
      return [
        ['« BONJOUR » est écrit en (5, 6)', c.mot(5, 6, 7) === 'BONJOUR'],
      ]
    },
  },

  {
    titre: 'Effacer le mot rangé sous un nom',
    difficulte: 1,
    suite: true,
    idee: 'Le compilateur connaît la longueur de MOT : on l’efface par son nom.',
    texte: [
      '`effacer(5, 6, MOT)` efface les sept cases de `MOT`. Si l’on change le mot, l’effacement suit tout seul.',
    ],
    code: `const char MOT[] = "BONJOUR";

int main() {
  texte(5, 6, MOT);
  effacer(5, 6, MOT);

  while (true) image();
}
`,
    aVoir: '« BONJOUR » est écrit puis effacé : l’écran reste vide.',
    controle: (c) => {
      c.avancer(10)
      return [
        ['les sept cases de BONJOUR sont vides', c.mot(5, 6, 7) === '       '],
        ['et l’écran est allumé', c.ecranAllume()],
      ]
    },
  },

  {
    titre: 'La place du mot dans deux variables',
    difficulte: 1,
    suite: true,
    idee: 'La colonne et la ligne sont rangées, elles aussi, sous un nom.',
    texte: [
      '`uint8_t x = 5;` range un nombre sous le nom `x` : la **colonne**. La **ligne** va dans `y`.',
      '`texte(x, y, MOT)` écrit le mot à cette place. Pour le déplacer, on ne change que `x` ou `y`.',
    ],
    code: `const char MOT[] = "BONJOUR";
uint8_t x = 5;
uint8_t y = 6;

int main() {
  texte(x, y, MOT);

  while (true) image();
}
`,
    aVoir: '« BONJOUR » en (x, y) : colonne 5, ligne 6.',
    controle: (c) => {
      c.avancer(10)
      return [
        ['x vaut 5 et y vaut 6', c.variable('x') === 5 && c.variable('y') === 6],
        ['« BONJOUR » est écrit en (5, 6)', c.mot(5, 6, 7) === 'BONJOUR'],
      ]
    },
  },

  {
    titre: 'Effacer à la place rangée',
    difficulte: 1,
    suite: true,
    idee: 'texte() et effacer() lisent les mêmes x et y : ils visent forcément la même case.',
    texte: [
      '`effacer(x, y, MOT)` efface là où `texte(x, y, MOT)` a écrit : les deux lisent les mêmes variables.',
    ],
    code: `const char MOT[] = "BONJOUR";
uint8_t x = 5;
uint8_t y = 6;

int main() {
  texte(x, y, MOT);
  effacer(x, y, MOT);

  while (true) image();
}
`,
    aVoir: '« BONJOUR » est écrit puis effacé en (x, y) : l’écran reste vide.',
    controle: (c) => {
      c.avancer(10)
      return [
        ['x vaut 5 et y vaut 6', c.variable('x') === 5 && c.variable('y') === 6],
        ['les sept cases de BONJOUR sont vides', c.mot(5, 6, 7) === '       '],
        ['et l’écran est allumé', c.ecranAllume()],
      ]
    },
  },

  {
    titre: 'Le mot et sa place sous un seul nom',
    difficulte: 1,
    suite: true,
    idee: 'Mot range la colonne, la ligne et le texte : on n’écrit plus que le nom.',
    texte: [
      '`Mot mot_xy = { 5, 6, "BONJOUR" };` range **trois choses sous un seul nom** : la colonne, la ligne, et le texte.',
      '`texte(mot_xy)` l’écrit. Plus rien à répéter : ni la place, ni le mot.',
    ],
    code: `Mot mot_xy = { 5, 6, "BONJOUR" };

int main() {
  texte(mot_xy);

  while (true) image();
}
`,
    aVoir: '« BONJOUR » à la colonne 5, ligne 6.',
    controle: (c) => {
      c.avancer(10)
      return [
        ['« BONJOUR » est écrit en (5, 6)', c.mot(5, 6, 7) === 'BONJOUR'],
      ]
    },
  },

  {
    titre: 'Effacer un Mot',
    difficulte: 1,
    suite: true,
    idee: 'effacer(mot_xy) : le nom suffit.',
    texte: [
      '`effacer(mot_xy)` efface la place et la longueur que `mot_xy` retient : exactement ce que `texte(mot_xy)` a écrit.',
    ],
    code: `Mot mot_xy = { 5, 6, "BONJOUR" };

int main() {
  texte(mot_xy);
  effacer(mot_xy);

  while (true) image();
}
`,
    aVoir: '« BONJOUR » est écrit puis effacé : l’écran reste vide.',
    controle: (c) => {
      c.avancer(10)
      return [
        ['les sept cases de BONJOUR sont vides', c.mot(5, 6, 7) === '       '],
        ['et l’écran est allumé', c.ecranAllume()],
      ]
    },
  },

  {
    titre: 'Un Mot fait de variables créées d’avance',
    difficulte: 1,
    suite: true,
    idee: 'x, y et le texte sont créés d’abord ; le Mot les rassemble sous un seul nom.',
    texte: [
      'On crée d’abord `x`, `y` et `MOT`, **avant** le `Mot` : il ne peut se servir que de ce qui existe déjà.',
      '`Mot mot_xy = { x, y, MOT };` ne recopie pas 5 et 6 : il **relit** `x` et `y` à chaque `texte()`. Changer `x` déplace donc le mot.',
    ],
    code: `uint8_t x = 5;
uint8_t y = 6;
const char MOT[] = "BONJOUR";
Mot mot_xy = { x, y, MOT };

int main() {
  texte(mot_xy);

  while (true) image();
}
`,
    aVoir: '« BONJOUR » en (x, y) : colonne 5, ligne 6.',
    controle: (c) => {
      c.avancer(10)
      return [
        ['x vaut 5 et y vaut 6', c.variable('x') === 5 && c.variable('y') === 6],
        ['« BONJOUR » est écrit en (5, 6)', c.mot(5, 6, 7) === 'BONJOUR'],
      ]
    },
  },

  {
    titre: 'Effacer un Mot fait de variables',
    difficulte: 1,
    suite: true,
    idee: 'Le même Mot, effacé par son seul nom.',
    texte: [
      '`effacer(mot_xy)` relit `x`, `y` et `MOT` : il efface exactement ce que `texte(mot_xy)` a écrit.',
    ],
    code: `uint8_t x = 5;
uint8_t y = 6;
const char MOT[] = "BONJOUR";
Mot mot_xy = { x, y, MOT };

int main() {
  texte(mot_xy);
  effacer(mot_xy);

  while (true) image();
}
`,
    aVoir: '« BONJOUR » est écrit puis effacé en (x, y) : l’écran reste vide.',
    controle: (c) => {
      c.avancer(10)
      return [
        ['x vaut 5 et y vaut 6', c.variable('x') === 5 && c.variable('y') === 6],
        ['les sept cases de BONJOUR sont vides', c.mot(5, 6, 7) === '       '],
        ['et l’écran est allumé', c.ecranAllume()],
      ]
    },
  },

  {
    titre: 'Les variables dans leur propre fichier',
    difficulte: 1,
    suite: true,
    idee: 'x, y, MOT et le Mot déménagent dans « variables.h » ; main() n’a plus que les gestes.',
    texte: [
      'Les quatre lignes du haut de la 1.10 sont maintenant dans un **second fichier**, `variables.h` : c’est l’onglet à côté de `principal.cpp`.',
      '`#include "variables.h"` **verse ce fichier à cet endroit**, avant la compilation. Le programme est exactement le même que celui de la 1.10 ; il est seulement rangé en deux.',
      'D’un côté ce qu’on affiche et où, de l’autre ce qu’on en fait. Pour changer le mot ou sa place, on n’ouvre que `variables.h`.',
    ],
    fichiers: {
      'variables.h': `uint8_t x = 5;
uint8_t y = 6;
const char MOT[] = "BONJOUR";
Mot mot_xy = { x, y, MOT };
`,
    },
    code: `#include "variables.h"

int main() {
  texte(mot_xy);
  effacer(mot_xy);

  while (true) image();
}
`,
    aVoir: '« BONJOUR » est écrit puis effacé en (x, y) : l’écran reste vide.',
    controle: (c) => {
      c.avancer(10)
      return [
        ['x et y viennent de variables.h : 5 et 6', c.variable('x') === 5 && c.variable('y') === 6],
        ['les sept cases de BONJOUR sont vides', c.mot(5, 6, 7) === '       '],
        ['et l’écran est allumé', c.ecranAllume()],
      ]
    },
  },

  /* Le chapitre 2 : les mêmes gestes, déclenchés par les boutons. */
  {
    titre: 'Effacer quand on appuie sur A',
    difficulte: 1,
    idee: 'Le même effacement, déclenché par un bouton.',
    texte: [
      '`if (bouton(A))` exécute ce qui suit **tant que A est enfoncé**. On y recouvre la ligne d’espaces.',
      '« BONJOUR APPUIE SUR A » fait vingt caractères, espaces compris : il faut donc vingt espaces. C’est toute la largeur de l’écran.',
    ],
    code: `int main() {
  texte(0, 4, "BONJOUR APPUIE SUR A");
  texte(3, 8, "APPUIE SUR A");

  while (true) {
    image();

    if (bouton(A)) {
      texte(0, 4, "                    "); // vingt espaces, autant que la phrase
    }
  }

  return 0;
}
`,
    aVoir: 'A efface la ligne du haut ; « APPUIE SUR A » reste.',
    controle: (c) => {
      const avant = c.mot(0, 4, 20)
      c.presser('a', 6)
      return [
        ['la phrase est écrite au départ', avant === 'BONJOUR APPUIE SUR A'],
        ['A efface ses vingt cases', c.mot(0, 4, 20) === ' '.repeat(20)],
        ['la consigne du bas n’est pas touchée', c.mot(3, 8, 12) === 'APPUIE SUR A'],
      ]
    },
  },

  {
    titre: 'Changer de message avec A et B',
    difficulte: 1,
    suite: true,
    idee: 'Écrire un mot par-dessus un autre le remplace.',
    texte: [
      'B écrit « APPUIE SUR A », A remet « APPUIE SUR B ». Chaque message **recouvre** le précédent, à la même place.',
      'Les deux font **douze** caractères : le nouveau couvre exactement l’ancien, et il ne reste aucune lettre de trop.',
    ],
    code: `int main() {

   texte(1, 8, "APPUIE SUR B");
  while (true) {
    image();
    if (bouton(A)) {
      texte(6, 4, "       "); // sept espaces, autant que BONJOUR
      texte(1, 8, "APPUIE SUR B");
    }

    if (bouton(B)) {

     texte(1, 8, "APPUIE SUR A");
    }
  }

  return 0;
}
`,
    aVoir: 'B affiche « APPUIE SUR A » ; A remet « APPUIE SUR B ».',
    controle: (c) => {
      const depart = c.mot(1, 8, 12)
      c.presser('b', 6)
      const apresB = c.mot(1, 8, 12)
      c.presser('a', 6)
      return [
        ['« APPUIE SUR B » au départ', depart === 'APPUIE SUR B'],
        ['B le remplace par « APPUIE SUR A »', apresB === 'APPUIE SUR A'],
        ['A remet « APPUIE SUR B »', c.mot(1, 8, 12) === 'APPUIE SUR B'],
      ]
    },
  },

  {
    titre: 'Effacer ce qu’on a écrit',
    difficulte: 1,
    suite: true,
    idee: 'Il n’y a pas de gomme : on écrit du vide par-dessus.',
    texte: [
      'La carte de fond garde ce qu’on y a mis, tant qu’on ne le remplace pas. **L’espace est la tuile 0**, c’est-à-dire du vide : écrire des espaces par-dessus **est** l’effacement. C’est ce que fait ce programme, et c’est ce qu’il faut avoir compris une fois.',
      'Le piège tient en un mot : il faut **autant d’espaces que de lettres**. `BONJOUR` en compte sept ; six espaces laisseraient un `R` tout seul au bout, et cette lettre orpheline est l’erreur la plus courante du débutant.',
      'C’est pour cela que **`effacer(6, 4, "BONJOUR")` existe** : il ôte exactement la longueur du texte, comptée par le compilateur. Les deux lignes font la même chose, mais l’une ne peut pas se tromper d’un espace. La leçon « Effacer sans compter les lettres » y revient.',
      'Pour effacer une zone plus large, `poser(colonne, ligne, 0)` fait la même chose case par case, et se met dans une boucle.',
    ],
    code: `int main() {
  texte(6, 4, "BONJOUR");
  texte(3, 8, "APPUIE SUR A");

  while (true) {
    image();

    if (bouton(A)) {
      texte(6, 4, "       "); // sept espaces, autant que BONJOUR
      texte(3, 8, "MERCI       ");
    }

    if (bouton(B)) {
      texte(6, 4, "BONJOUR");
      texte(3, 8, "APPUIE SUR A");
    }
  }

  return 0;
}
`,
    aVoir: 'A efface « BONJOUR » ; B le remet.',
    controle: (c) => {
      const avant = c.mot(6, 4, 7)
      c.presser('a', 6)
      const efface = c.mot(6, 4, 7)
      const merci = c.mot(3, 8, 5)
      c.presser('b', 6)
      return [
        ['« BONJOUR » est là au départ', avant === 'BONJOUR'],
        ['A l’efface entièrement', efface.trim() === ''],
        ['A écrit « MERCI »', merci === 'MERCI'],
        ['B le remet', c.mot(6, 4, 7) === 'BONJOUR'],
        ['et la consigne aussi', c.mot(3, 8, 12) === 'APPUIE SUR A'],
      ]
    },
  },

  {
    titre: 'Les messages dans leur propre fichier',
    difficulte: 1,
    suite: true,
    idee: 'Les messages et leur place vont dans « variables.h » ; main() ne garde que les boutons.',
    texte: [
      'Comme en 1.11 : chaque message devient un `Mot`, rangé dans `variables.h`. C’est l’onglet à côté de `principal.cpp`.',
      '`principal.cpp` ne parle plus que des **boutons** : A efface `bonjour`, B le remet. Les places et les textes ne s’y écrivent plus du tout.',
    ],
    fichiers: {
      'variables.h': `Mot bonjour = { 6, 4, "BONJOUR" };
Mot consigne = { 3, 8, "APPUIE SUR A" };
`,
    },
    code: `#include "variables.h"

int main() {
  texte(bonjour);
  texte(consigne);

  while (true) {
    image();

    if (bouton(A)) effacer(bonjour);
    if (bouton(B)) texte(bonjour);
  }
}
`,
    aVoir: 'A efface « BONJOUR » ; B le remet. La consigne reste.',
    controle: (c) => {
      const avant = c.mot(6, 4, 7)
      c.presser('a', 6)
      const efface = c.mot(6, 4, 7)
      c.presser('b', 6)
      return [
        ['« BONJOUR » est là au départ', avant === 'BONJOUR'],
        ['A l’efface entièrement', efface === '       '],
        ['B le remet', c.mot(6, 4, 7) === 'BONJOUR'],
        ['la consigne ne bouge pas', c.mot(3, 8, 12) === 'APPUIE SUR A'],
      ]
    },
  },

  {
    titre: 'Une variable, un octet',
    difficulte: 2,
    idee: 'Retenir un nombre, et le montrer.',
    texte: [
      'Une variable s’écrit **`uint8_t`** : un entier non signé de huit bits. C’est le seul nombre que cette machine connaisse — de 0 à 255, pas de virgule, pas de négatif. `int`, `char` et `auto` sont acceptés, et désignent la même chose ; `uint16_t`, `long` ou `float` sont **refusés avec leur numéro de ligne**, plutôt que traduits en douce sur un octet.',
      '`attente++` est la façon C++ d’écrire `attente = attente + 1`. `+=`, `--`, `%=` existent aussi.',
      'Pour afficher un chiffre calculé, on ne peut pas se servir de `texte()`, qui ne prend que des mots écrits en clair. On pose la **tuile** du chiffre : celle du 0 porte le numéro 27, et les neuf suivantes se suivent. D’où `27 + compte`.',
    ],
    code: `int main() {
  uint8_t compte = 0;
  uint8_t attente = 0;

  texte(4, 4, "COMPTE");

  while (true) {
    image();

    attente++;

    if (attente > 30) {
      attente = 0;

      if (compte < 9) compte++;
    }

    poser(11, 4, 27 + compte);
  }

  return 0;
}
`,
    aVoir: 'Un chiffre qui monte de 0 à 9, une fois par demi-seconde.',
    controle: (c) => {
      const depart = c.variable('compte')
      c.avancer(120)
      const apres = c.variable('compte')
      c.avancer(400)
      return [
        ['le compte part de zéro', depart === 0],
        ['il monte tout seul', apres > depart],
        ['il s’arrête à neuf', c.variable('compte') === 9],
        ['et le chiffre est à l’écran', c.lire(11, 4) === 27 + c.variable('compte')],
      ]
    },
  },

  {
    titre: 'Lire un bouton',
    difficulte: 2,
    idee: 'Réagir à la manette.',
    texte: [
      '`bouton(A)` rend 1 tant que le bouton est enfoncé. Les huit noms existent : `A B HAUT BAS GAUCHE DROITE START SELECT`.',
      'Ici on lit le **niveau** : tant que A est tenu, le texte change. C’est ce qu’on veut pour courir ou viser — mais pas pour un menu : c’est la leçon « le front » qui règle ce cas.',
      '`&&`, `||` et `!` s’écrivent comme en C++, et **s’arrêtent dès que la réponse est connue** : dans `i < n && t[i] == 0`, la case n’est pas lue si l’index est hors du tableau.',
    ],
    code: `int main() {
  texte(3, 5, "APPUIE SUR A");

  while (true) {
    image();

    if (bouton(A) && !bouton(B)) {
      texte(3, 5, "BRAVO       ");
    }

    if (bouton(B)) {
      texte(3, 5, "APPUIE SUR A");
    }
  }

  return 0;
}
`,
    aVoir: '« BRAVO » pendant qu’on tient A ; B remet le texte de départ.',
    controle: (c) => {
      const avant = c.mot(3, 5, 12)
      c.presser('a', 6)
      const pendant = c.mot(3, 5, 5)
      c.presser('b', 6)
      return [
        ['le texte de départ est là', avant.trim() === 'APPUIE SUR A'],
        ['A écrit « BRAVO »', pendant === 'BRAVO'],
        ['B le remet comme avant', c.mot(3, 5, 12).trim() === 'APPUIE SUR A'],
      ]
    },
  },

  {
    titre: 'Le front, ou pourquoi un appui compte trois fois',
    difficulte: 4,
    idee: 'Agir au moment précis où le bouton s’enfonce.',
    texte: [
      'Un jeu tourne à **soixante images par seconde**. Un appui dure au moins cinq images : lu au niveau, il compte cinq fois. Sur un menu, on traverse trois lignes sans rien voir.',
      'La réponse tient en une variable : l’état du bouton à l’image **précédente**. On agit quand il vaut 1 maintenant et valait 0 avant — ce qu’on appelle agir **au front**.',
      'Le programme montre les deux compteurs côte à côte. Tiens A : celui du haut s’emballe, celui du bas monte d’un seul cran.',
    ],
    code: `int main() {
  uint8_t aAvant = 0;
  uint8_t niveau = 0;
  uint8_t front = 0;

  texte(1, 4, "NIVEAU");
  texte(1, 8, "FRONT");

  while (true) {
    image();

    uint8_t a = bouton(A);

    if (a && niveau < 9) niveau++;
    if (a && !aAvant && front < 9) front++;

    aAvant = a;

    poser(10, 4, 27 + niveau);
    poser(10, 8, 27 + front);
  }

  return 0;
}
`,
    aVoir: 'Un appui sur A : le compteur « NIVEAU » saute, « FRONT » avance d’un.',
    controle: (c) => {
      c.presser('a', 8)
      const n1 = c.variable('niveau')
      const f1 = c.variable('front')
      c.presser('a', 8)
      return [
        ['le niveau compte plusieurs fois', n1 > 1, `(${n1} pour un seul appui)`],
        ['le front ne compte qu’une fois', f1 === 1],
        ['un second appui donne deux', c.variable('front') === 2],
      ]
    },
  },

  {
    titre: 'Passer d’un écran à l’autre',
    difficulte: 9,
    idee: 'Un titre, une partie, une fin.',
    texte: [
      'Le squelette de n’importe quel jeu. Deux règles, et il n’y en a pas d’autres.',
      '**Une variable dit où l’on est.** Un `enum` lui donne ses valeurs possibles, et leur donne des noms : `TITRE`, `JEU`, `FIN`. Le nom de l’`enum` devient un type d’un octet, et `Scene scene` se lit mieux que `uint8_t scene`.',
      '**Un seul endroit change d’écran.** `allerA()` éteint, efface, redessine, rallume — toujours dans cet ordre. Si chaque bouton faisait son propre ménage, l’un finirait par oublier d’effacer, et deux écrans se mélangeraient.',
      'Le `switch` aiguille sur la scène. Il fonctionne comme en C++, **`break` compris** : sans lui, l’exécution tombe dans le cas suivant. C’est un piège célèbre, mais c’est le sens du langage, et le trahir en douce serait pire.',
      'On éteint l’écran pour effacer parce que repeindre toute la carte demande bien plus de temps qu’une image n’en contient. `effacer()` sans argument vide les 32 × 32 de la carte d’un coup — cette leçon écrivait autrefois ses deux boucles à la main, et n’effaçait alors que les 20 × 18 visibles : le décor qui défilait ramenait l’écran d’avant.',
    ],
    code: `enum Scene { TITRE, JEU, FIN };

Scene scene = TITRE;

void allerA(Scene ou) {
  scene = ou;

  ecran(0);
  effacer();

  switch (scene) {
    case TITRE:
      texte(6, 5, "MON JEU");
      texte(4, 10, "A POUR JOUER");
      break;

    case JEU:
      texte(5, 4, "C EST PARTI");
      texte(4, 10, "A POUR FINIR");
      break;

    case FIN:
      texte(7, 5, "FINI");
      texte(3, 10, "A POUR REVENIR");
      break;
  }

  ecran(1);
}

int main() {
  uint8_t aAvant = 0;

  allerA(TITRE);

  while (true) {
    image();

    uint8_t a = bouton(A);

    if (a && !aAvant) {
      if (scene == TITRE) allerA(JEU);
      else if (scene == JEU) allerA(FIN);
      else allerA(TITRE);
    }

    aAvant = a;
  }

  return 0;
}
`,
    aVoir: '« MON JEU », puis A change d’écran à chaque appui.',
    controle: (c) => {
      const titre = c.mot(6, 5, 7)
      c.presser('a', 6)
      const jeu = c.mot(5, 4, 11)
      c.presser('a', 6)
      const fin = c.mot(7, 5, 4)
      c.presser('a', 6)
      return [
        ['on démarre sur le titre', titre === 'MON JEU'],
        ['A mène à la partie', jeu === 'C EST PARTI'],
        ['puis à la fin', fin === 'FINI'],
        ['et on revient au titre', c.mot(6, 5, 7) === 'MON JEU'],
        ['l’ancien écran est effacé', c.mot(7, 5, 4).trim() !== 'FINI'],
      ]
    },
  },

  {
    titre: 'Dessiner sa propre tuile',
    difficulte: 3,
    idee: 'Sortir des lettres — en chiffres, ou à la souris.',
    dessin: true,
    texte: [
      'La police suffit à écrire, pas à jouer. Un **`Tuile`** prend **huit rangées de huit chiffres** : la nuance de chaque pixel, de 0 (le plus clair) à 3 (le plus sombre). Un **`Perso`** en prend seize sur seize.',
      '**Ce qui détermine le numéro d’une tuile, c’est l’ordre des déclarations.** La police occupe les numéros 0 à 43 — les lettres, les chiffres, le carré plein. Le premier dessin du programme prend donc le **44**, le suivant le 45, et ainsi de suite. Le compilateur l’annonce à chaque fois, et l’atelier l’écrit sous la grille.',
      'Le nom sert partout où un numéro est attendu : `poser(x, y, BLOC)` sur le fond, `sprite(n, x, y, BLOC)` en lutin, `lire(x, y) == BLOC` pour relire ce qui est affiché, et jusque dans une table de décor — `const uint8_t LIGNE[] = { BLOC, 0, BLOC };`. Il se calcule aussi : `BLOC + 1` est la tuile d’à côté. **Un `Perso` de seize, lui, compte pour quatre numéros** — c’est l’objet de la leçon suivante.',
      'C’est exactement **pourquoi on écrit le nom et jamais le numéro**. Ajoute un `Perso` avant ta tuile, et elle passe de 44 à 48 : un `poser(2, 2, 44)` écrit à la main afficherait soudain autre chose, sans que rien ne le signale. Le nom, lui, reste juste — c’est le compilateur qui traduit, et c’est son travail.',
      '**Les deux façons de faire, et c’est la même chose.** En code : change un `0` en `3` dans le programme, et le bloc change. À la souris : clique un pixel dans la grille ci-dessous. Le programme se réécrit tout seul sous tes yeux — c’est le même texte, écrit autrement.',
      '**Les chiffres ne sont pas la seule écriture.** Huit chiffres à la file ne ressemblent pas à un dessin ; les signes `. - + #` disent exactement la même chose — le point est le vide, le dièse est le plein — et se relisent de loin : `"#.++++.#"`. Les deux donnent les mêmes octets. On n’en mélange pas deux dans une même tuile, et l’atelier rend à chacune la sienne quand tu peins.',
      'C’est vrai partout dans ce projet : **le programme reste la seule vérité**. L’atelier ne garde aucun dessin de son côté ; il lit les `Tuile NOM = {…}` du texte, et il les réécrit. Un éditeur graphique qui tiendrait ses propres dessins finirait par ne plus dire la même chose que le code.',
    ],
    code: `Tuile BLOC = {
  "33333333",
  "30000003",
  "30222203",
  "30222203",
  "30222203",
  "30222203",
  "30000003",
  "33333333",
};

int main() {
  texte(4, 2, "MA TUILE");

  for (uint8_t x = 0; x < 8; x++) {
    poser(6 + x, 8, BLOC);
  }

  while (true) {
    image();
  }

  return 0;
}
`,
    aVoir: 'Une rangée de huit blocs à cadre noir, au milieu de l’écran.',
    controle: (c) => [
      ['la tuile est posée huit fois', [0, 1, 2, 3, 4, 5, 6, 7].every((i) => c.lire(6 + i, 8) === 44)],
      ['elle porte le numéro 44, après la police', c.lire(6, 8) === 44],
      ['et l’écran montre plus d’une nuance', c.nuances() > 1],
    ],
  },

  {
    titre: 'Le dessin écrit là où on le pose',
    difficulte: 3,
    idee: 'Les huit rangées dans le « poser » lui-même — sans nom, et sans numéro.',
    dessin: true,
    texte: [
      'Une case de l’écran, c’est **huit rangées de huit pixels**, jamais autre chose. La leçon d’avant leur donnait un nom — `Tuile BLOC = {…}` — puis posait ce nom. Mais un nom, à l’arrivée, **c’est un numéro** : `poser(2, 2, BLOC)` écrit 44 dans la carte de fond.',
      'Ces huit rangées peuvent s’écrire **dans le `poser` lui-même**. Le compilateur grave la tuile, lui trouve son numéro, et l’écrit à la case demandée — il n’y a plus ni nom à inventer ni numéro à suivre, et le dessin est **là où il apparaît**.',
      '**Ce n’est pas un remplacement, c’est un choix.** Ce qui sert PARTOUT mérite son nom : le sol ci-dessous est posé vingt fois, et `SOL` le dit à chaque ligne. Ce qui ne sert QU’À UN ENDROIT n’apprend rien de plus en s’appelant `TUILE3`, et oblige à lire deux endroits pour en comprendre un seul.',
      '**Le même dessin ne se grave qu’une fois.** Écris deux fois le même nuage à dix lignes d’écart : le compilateur reconnaît qu’il l’a déjà, et ne dépense qu’une tuile. Il reconnaît aussi un dessin déjà déclaré en `Tuile`, **à travers les deux écritures** — `"21111112"` et `"+------+"` sont les mêmes pixels. La console n’en tient que 256 : les gaspiller ne se verrait qu’au jour où il n’y en aurait plus.',
      'Cela marche aux quatre endroits où un numéro de tuile est attendu : `poser`, `poserPanneau`, `sprite`, et `sprite16` — qui veut alors **seize rangées de seize signes**, et les découpe lui-même en quatre tuiles. Ailleurs, des accolades restent une faute, et le compilateur le dit avec sa ligne.',
      'Une chose que le dessin sur place ne fait pas : **il n’apparaît pas dans l’atelier**. Celui-ci lit les `Tuile NOM = {…}` du texte, et il ne saurait pas où réécrire un dessin qui n’a pas de nom. Ce qu’on veut peindre à la souris, on le nomme.',
    ],
    code: `Tuile SOL = {
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
  texte(4, 2, "SUR PLACE");

  // Le sol sert partout : il garde son nom.
  for (uint8_t x = 0; x < 20; x++) {
    poser(x, 12, SOL);
  }

  // La porte ne sert qu'ici : ses huit rangées sont ici.
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

  // Le dessin de SOL, redit dans l'autre écriture : aucune tuile de plus.
  poser(3, 10, {
    "++++++++",
    "+------+",
    "+------+",
    "+------+",
    "+------+",
    "+------+",
    "+------+",
    "++++++++",
  });

  while (true) {
    image();
  }

  return 0;
}
`,
    aVoir: 'Un sol de vingt cases, une porte posée au-dessus, et à gauche un pavé qui reprend le dessin du sol.',
    controle: (c) => [
      ['le titre est écrit', c.mot(4, 2, 9) === 'SUR PLACE'],
      ['le sol posé par son nom couvre ses vingt cases',
        [...Array(20).keys()].every((x) => c.lire(x, 12) === 44)],
      ['la porte écrite sur place a sa propre tuile', c.lire(9, 11) === 45,
        ` (tuile ${c.lire(9, 11)})`],
      ['et le dessin redit dans l’autre écriture retrouve SOL', c.lire(3, 10) === 44,
        ` (tuile ${c.lire(3, 10)})`],
    ],
  },

  {
    titre: 'Intégrer une carte dans son projet',
    difficulte: 3,
    idee: 'Une carte dessinée à la souris est une fonction du programme : on l’appelle, et le décor apparaît.',
    carte: true,
    texte: [
      '**Ce programme a les trois sortes de dessins du jeu :** une **tuile de 8 × 8** (`Tuile ARBRE`), un **personnage de 16 × 16** (`Perso HEROS` — quatre tuiles d’un coup), et une **carte** (`VILLAGE`, tout un écran). Les deux premiers se peignent dans ▦ **Les tuiles** ; la carte, dans 🗺 **La carte**. Essaie sur chacun les palettes, la sélection et le déplacement.',
      'Une **carte**, c’est un décor entier dessiné à la souris, dans l’onglet 🗺 La carte. L’atelier ne la garde pas de son côté : il l’**écrit dans ton programme**, sous la forme d’une **fonction** — ici `void VILLAGE()`, entre deux commentaires `/* --- carte "VILLAGE" --- */` qui la marquent. C’est grâce à eux qu’il la retrouve et la réécrit quand tu dessines.',
      '**La créer :** onglet 🗺 La carte, « + carte », et un nom en majuscules — VILLAGE, MAISON, NIVEAU1… Puis dessine : chaque carré de 8 × 8 que tu remplis devient une ligne `poser(colonne, ligne, {…})`, avec ses huit rangées. Un carré laissé vide n’est pas écrit : il ne coûte rien.',
      '**Lire le code de la carte :** dans `poser(9, 10, {…})`, **9 est la colonne** (0 tout à gauche, 19 tout à droite) et **10 la ligne** (0 tout en haut, 17 tout en bas). Une case fait 8 × 8 pixels : la case (9, 10) commence donc au pixel x = 72, y = 80. Les **huit textes entre accolades** sont les huit rangées de pixels du carré, de haut en bas, et **chaque chiffre est un pixel** : 0 le plus clair, 1, 2, puis 3 le plus sombre. Regarde le toit, case (9, 9) : ses « 3 » dessinent la pente, rangée après rangée. En couleur, une ligne `teindre(colonne, ligne, palette)` dit en plus quelle palette prend la case.',
      '**Lire la carte pendant le jeu :** `lire(colonne, ligne)` rend le **numéro de la tuile** affichée à cet endroit — 0 si la case est vide. C’est ainsi qu’un jeu sait si le joueur arrive sur un mur, sur le sol ou dans le vide. Le programme le montre en bas de l’écran : il relit la case (9, 11), du sol, et l’écrit avec `nombre()` ; la case (5, 11), vide, donne 0.',
      '**Une fonction ne fait rien tant qu’on ne l’appelle pas.** C’est l’oubli le plus fréquent : la carte est dessinée, le programme compile, et l’écran reste vide. Il manque `VILLAGE();` dans `main`, **avant** la boucle du jeu — une seule fois : un décor reste à l’écran tant qu’on ne l’efface pas.',
      '**Essaie :** mets `//` devant `VILLAGE();`. Le titre reste, la maison disparaît. Enlève-le : elle revient. Tout le décor tient dans cette seule ligne.',
      '**Plusieurs cartes :** chacune a sa fonction. Pour passer de l’une à l’autre, on efface puis on appelle l’autre : `effacer();` puis `MAISON();`. Les huit carrés du sol, identiques, ne prennent **qu’une tuile** : le compilateur reconnaît un dessin qu’il a déjà.',
      '**Copier, déplacer :** dans l’atelier de la carte, l’outil **⬚ Sélection** choisit une zone — un rectangle **libre** tracé à la souris, ou d’un clic **un carré de 8 × 8** ou **un bloc de 16 × 16**, calés sur la grille. **Attrape** la zone et **glisse-la** : elle se déplace, et retombe sur la case la plus proche ; sa place redevient le fond. **Ctrl+C**, **Ctrl+X** et **Ctrl+V** la copient, la coupent et la collent. Dans l’atelier des tuiles, **⬚ Sélectionner et déplacer** fait de même à l’intérieur d’une tuile de 8 × 8 ou d’un personnage de 16 × 16, et **📋 Copier le dessin**, **📌 Coller ici** et **⧉ Dupliquer** copient un dessin entier. Chaque geste s’annule avec **Ctrl+Z**.',
      '**Un jeu, sans écrire la boucle :** dans 🗺 La carte, « ▶ Jouer la scène » écrit `main` pour toi — la carte, les murs, le joueur qui bouge, les acteurs et les événements. Tes propres lignes de `main` sont alors remplacées ; l’atelier demande avant de le faire.',
      '**Poser une tuile, poser un personnage :** `poser(6, 10, ARBRE);` met l’arbre dans la case (6, 10), et `teindre(6, 10, 1);` lui donne la palette 1 — celle de la forêt. `sprite16(0, 60, 72, HEROS);` pose le personnage **au pixel près**, en x = 60, y = 72 : un personnage n’est pas sur la grille, il se déplace librement par-dessus le décor.',
      '**À toi :** descends à l’atelier de la carte, dessine un arbre à côté de la maison, et regarde un nouveau `poser(…)` apparaître dans `VILLAGE()`.',
    ],
    code: `/* Une TUILE de 8 × 8 : un arbre. Elle se peint dans ▦ Les tuiles. */
Tuile ARBRE = {
  "00111100",
  "01122110",
  "11222211",
  "12222221",
  "11222211",
  "01133110",
  "00033000",
  "00333300",
};

/* Un PERSONNAGE de 16 × 16 : quatre tuiles de 8 × 8 d'un coup. */
Perso HEROS = {
  "0000033333300000",
  "0000322222230000",
  "0003222222223000",
  "0003211221123000",
  "0003211221123000",
  "0003222222223000",
  "0000322332230000",
  "0000033333300000",
  "0003333333333000",
  "0032222222222300",
  "0321222222221230",
  "0321222222221230",
  "0003222222223000",
  "0003322003223000",
  "0003220000223000",
  "0033330000333300",
};

/* --- carte "VILLAGE" --- */
void VILLAGE() {
  poser(9, 9, {
    "00000033",
    "00003322",
    "00332222",
    "33222222",
    "32222222",
    "33333333",
    "31111113",
    "31111113",
  });
  poser(10, 9, {
    "33000000",
    "22330000",
    "22223300",
    "22222233",
    "22222223",
    "33333333",
    "31111113",
    "31111113",
  });
  poser(9, 10, {
    "31111113",
    "31133113",
    "31133113",
    "31111113",
    "31111333",
    "31111311",
    "31111311",
    "33333311",
  });
  poser(10, 10, {
    "31111113",
    "31111113",
    "33311113",
    "11311113",
    "11311113",
    "11311113",
    "11311113",
    "11333333",
  });
  poser(6, 11, {
    "33333333",
    "21212121",
    "12121212",
    "21212121",
    "12121212",
    "21212121",
    "12121212",
    "21212121",
  });
  poser(7, 11, {
    "33333333",
    "21212121",
    "12121212",
    "21212121",
    "12121212",
    "21212121",
    "12121212",
    "21212121",
  });
  poser(8, 11, {
    "33333333",
    "21212121",
    "12121212",
    "21212121",
    "12121212",
    "21212121",
    "12121212",
    "21212121",
  });
  poser(9, 11, {
    "33333333",
    "21212121",
    "12121212",
    "21212121",
    "12121212",
    "21212121",
    "12121212",
    "21212121",
  });
  poser(10, 11, {
    "33333333",
    "21212121",
    "12121212",
    "21212121",
    "12121212",
    "21212121",
    "12121212",
    "21212121",
  });
  poser(11, 11, {
    "33333333",
    "21212121",
    "12121212",
    "21212121",
    "12121212",
    "21212121",
    "12121212",
    "21212121",
  });
  poser(12, 11, {
    "33333333",
    "21212121",
    "12121212",
    "21212121",
    "12121212",
    "21212121",
    "12121212",
    "21212121",
  });
  poser(13, 11, {
    "33333333",
    "21212121",
    "12121212",
    "21212121",
    "12121212",
    "21212121",
    "12121212",
    "21212121",
  });
}
/* --- fin de la carte "VILLAGE" --- */

int main() {
  /* Les couleurs : la palette 1 pour l'arbre (une forêt). */
  couleurFond(1, 0, 22, 31, 14);
  couleurFond(1, 1, 10, 24, 6);
  couleurFond(1, 2, 4, 14, 2);
  couleurFond(1, 3, 12, 6, 2);

  texte(4, 3, "MON VILLAGE");

  VILLAGE();   // la carte : SANS CET APPEL, RIEN NE S'AFFICHE

  /* La tuile ARBRE, posée à côté de la maison, dans la palette 1. */
  poser(6, 10, ARBRE);
  teindre(6, 10, 1);
  poser(13, 10, ARBRE);
  teindre(13, 10, 1);

  /* Le personnage HEROS, au pixel près : un lutin de 16 × 16. */
  sprite16(0, 60, 72, HEROS);

  /* Relire la carte : le numéro de la tuile à une case, 0 si elle est vide. */
  texte(1, 15, "SOL");
  nombre(6, 15, lire(9, 11));
  texte(1, 16, "VIDE");
  nombre(6, 16, lire(3, 11));

  while (true) {
    image();
  }

  return 0;
}
`,
    aVoir: 'Le titre « MON VILLAGE », la maison sur huit carrés de sol, un arbre de chaque côté (dans la palette de la forêt), le personnage devant la maison, et en bas « SOL 053 » et « VIDE 000 ».',
    controle: (c) => {
      const paletteDe = (colonne, ligne) => c.gb.ppu.vram[0x2000 + 0x1800 + ligne * 32 + colonne] & 7
      const heros = c.lutin(0)
      return [
        ['le titre est écrit', c.mot(4, 3, 11) === 'MON VILLAGE'],
        ['la carte : la maison et ses quatre carrés', [[9, 9], [10, 9], [9, 10], [10, 10]].every(([x, y]) => c.lire(x, y) !== 0)],
        ['le sol, sur huit cases, ne prend qu’une tuile', [6, 7, 8, 9, 10, 11, 12, 13].every((x) => c.lire(x, 11) !== 0) && new Set([6, 7, 8, 9, 10, 11, 12, 13].map((x) => c.lire(x, 11))).size === 1],
        ['la tuile ARBRE (8 × 8) est posée deux fois, la même', c.lire(6, 10) !== 0 && c.lire(6, 10) === c.lire(13, 10)],
        ['dans la palette 1, par teindre()', !c.gb.ppu.couleur || (paletteDe(6, 10) === 1 && paletteDe(13, 10) === 1)],
        ['le personnage HEROS (16 × 16) est à l’écran, au pixel près', heros.x === 60 && heros.y === 72, ` (x = ${heros.x}, y = ${heros.y})`],
        ['lire(9, 11) relit la tuile du sol', c.mot(6, 15, 3) === String(c.lire(9, 11)).padStart(3, '0'), ` (${c.mot(6, 15, 3)})`],
        ['lire(3, 11), une case vide, donne 000', c.mot(6, 16, 3) === '000'],
      ]
    },
  },

  {
    titre: 'Les couleurs : palettes, variétés et thèmes',
    difficulte: 3,
    idee: 'Une tuile porte des numéros ; la palette de sa case leur donne leurs couleurs — la même tuile peut être de trois couleurs à la fois.',
    dessin: true,
    texte: [
      '**La règle de la console :** un carré de 8 × 8 — une tuile — n’a que **4 couleurs**. Pas une de plus, même sur Game Boy Color : chaque carré prend **une palette** de 4 couleurs. Le carré d’à côté peut en prendre une autre : c’est ainsi qu’un écran entier affiche bien plus de 4 couleurs.',
      '**Le jeu a 8 palettes, numérotées de 0 à 7**, et la **0 est la normale** (les verts de la Game Boy). Une tuile ne contient pas de couleurs : elle contient des **numéros**, de 0 à 3. C’est la palette de la case où on la pose qui dit de quelle couleur est chaque numéro.',
      '**Le programme le montre :** la même tuile `BRIQUE`, posée trois fois. `teindre(colonne, ligne, palette)` donne sa palette à une case : la palette 1 (désert), la palette 2 (océan), et la dernière n’a pas de `teindre` — elle reste dans la palette 0, la normale. **Une seule tuile, trois couleurs** : c’est tout l’intérêt des palettes.',
      '`couleurFond(palette, numéro, rouge, vert, bleu)` choisit une couleur : chaque composante va de 0 à 31. Chaque palette va du plus **clair** (numéro 0) au plus **sombre** (numéro 3) — le jeu garde ainsi une version lisible en quatre nuances.',
      '**Dans l’atelier, sans écrire de code :** les 8 palettes sont en haut de l’atelier des tuiles et de la carte. Clique une couleur, peins : ce que tu peins **prend sa palette**. « 🎨 Changer cette couleur » change une couleur **pour ce dessin seulement** : si d’autres tuiles (ou le texte) partagent sa palette, l’atelier lui en donne une copie dans une palette libre. **« 🎨 Variétés »** met dans une palette l’une des 11 palettes toutes prêtes (0 normale, campagne, bonbon, plage, forêt, glace, volcan, nuit, désert, océan, automne).',
      '**« 🎨 Thèmes »** change d’un coup les 8 palettes du décor **et** les 8 des personnages, avec des couleurs **qui vont ensemble** : forêt, désert, glace, volcan, océan, hanté, bonbon — ou 0, la normale. Elles sont calculées : chaque palette part d’une teinte, et toutes descendent du clair au sombre par les mêmes quatre marches de lumière. **Ctrl+Z** revient en arrière.',
      '**Les personnages** ont leurs 8 palettes à eux, de **3 couleurs + le transparent** (le numéro 0 ne s’affiche jamais : le décor se voit au travers). Un personnage de 16 × 16 est fait de 4 carrés : chacun peut avoir sa palette — jusqu’à 12 couleurs.',
      '**À toi :** ajoute une quatrième brique en (10, 8) avec `teindre(10, 8, 1);` — elle prend les couleurs du désert. Puis, dans l’atelier, essaie « 🎨 Thèmes » et regarde les trois briques changer ensemble.',
    ],
    code: `/* Une seule tuile : quatre NUMÉROS de couleur, de 0 (clair) à 3 (sombre). */
Tuile BRIQUE = {
  "33333333",
  "21112111",
  "21112111",
  "33333333",
  "11121112",
  "11121112",
  "33333333",
  "00000000",
};

int main() {
  /* La palette 1 : le désert — du plus clair au plus sombre. */
  couleurFond(1, 0, 31, 29, 22);
  couleurFond(1, 1, 28, 22, 10);
  couleurFond(1, 2, 20, 12, 4);
  couleurFond(1, 3, 8, 4, 2);
  /* La palette 2 : l'océan. */
  couleurFond(2, 0, 26, 31, 31);
  couleurFond(2, 1, 8, 24, 30);
  couleurFond(2, 2, 2, 12, 24);
  couleurFond(2, 3, 0, 3, 10);

  texte(3, 3, "UNE TUILE");
  texte(3, 4, "TROIS PALETTES");

  poser(4, 8, BRIQUE);
  teindre(4, 8, 1);   // la case (4, 8) prend la palette 1 : le désert
  poser(6, 8, BRIQUE);
  teindre(6, 8, 2);   // la même tuile, dans la palette 2 : l'océan
  poser(8, 8, BRIQUE); // pas de teindre : la palette 0, la normale

  while (true) {
    image();
  }

  return 0;
}
`,
    aVoir: 'Trois fois la même brique : couleur sable (palette 1), bleue (palette 2), et verte (palette 0, la normale).',
    controle: (c) => {
      /* La palette d'une case : dans la seconde banque de la mémoire vidéo (les attributs de la carte). */
      const paletteDe = (colonne, ligne) => c.gb.ppu.vram[0x2000 + 0x1800 + ligne * 32 + colonne] & 7
      const couleur = (p, n) => c.gb.ppu.bgPalettes[p * 8 + n * 2] | c.gb.ppu.bgPalettes[p * 8 + n * 2 + 1] << 8
      return [
        ['la cartouche tourne en couleur', c.gb.ppu.couleur === true],
        ['la même tuile est posée trois fois', c.lire(4, 8) !== 0 && c.lire(4, 8) === c.lire(6, 8) && c.lire(6, 8) === c.lire(8, 8)],
        ['la première case a la palette 1', paletteDe(4, 8) === 1, ` (${paletteDe(4, 8)})`],
        ['la deuxième la palette 2', paletteDe(6, 8) === 2, ` (${paletteDe(6, 8)})`],
        ['la troisième, sans teindre, la palette 0', paletteDe(8, 8) === 0, ` (${paletteDe(8, 8)})`],
        ['la palette 1 porte bien le sable du désert', couleur(1, 0) === (31 | 29 << 5 | 22 << 10)],
      ]
    },
  },

  {
    titre: 'Un lutin, au pixel près',
    difficulte: 4,
    idee: 'Ce qui sépare un jeu d’action d’un jeu de cases.',
    texte: [
      'Le décor vit sur une grille de huit pixels. Un personnage, non : s’il ne pouvait s’arrêter que sur des multiples de huit, il ne sauterait pas, il **se téléporterait**.',
      '`sprite(numero, x, y, tuile)` pose un carré de huit sur huit **où l’on veut**. Le matériel en a quarante, numérotés de 0 à 39.',
      'Il n’y a rien à faire pour l’effacer : on le repose ailleurs à chaque image, et il a bougé.',
    ],
    code: `Tuile BALLE = {
  "00333300",
  "03222230",
  "32222223",
  "32222223",
  "32222223",
  "32222223",
  "03222230",
  "00333300",
};

int main() {
  uint8_t x = 20;
  uint8_t y = 60;

  texte(3, 2, "CROIX POUR BOUGER");

  while (true) {
    image();

    if (bouton(DROITE) && x < 150) x += 2;
    if (bouton(GAUCHE) && x > 2) x -= 2;
    if (bouton(BAS) && y < 135) y += 2;
    if (bouton(HAUT) && y > 2) y -= 2;

    sprite(0, x, y, BALLE);
  }

  return 0;
}
`,
    aVoir: 'Une boule qu’on déplace à la croix, sans à-coups.',
    controle: (c) => {
      const depart = c.lutin(0)

      /* On avance image par image et on note toutes les positions prises : la
         preuve qu il vit hors de la grille, c est qu il S ARRETE ailleurs que
         sur un multiple de huit — pas que son trajet total en soit un. */
      const positions = []
      c.gb.setButton('right', true)
      for (let i = 0; i < 12; i++) { c.avancer(1); positions.push(c.lutin(0).x) }
      c.gb.setButton('right', false)
      c.avancer(3)

      const droite = c.lutin(0)
      c.presser('down', 20)

      return [
        ['le lutin est à l’écran', depart.y > 0 && depart.y < 144],
        ['il porte la tuile dessinée', depart.tuile === 44],
        ['DROITE le déplace', droite.x > depart.x, `(${depart.x} vers ${droite.x})`],
        ['BAS aussi', c.lutin(0).y > droite.y],
        ['il se pose HORS de la grille de huit', positions.some((x) => x % 8 !== 0),
          `(positions prises : ${positions.join(', ')})`],
      ]
    },
  },

  {
    titre: 'Un objet qui tombe',
    difficulte: 4,
    idee: 'La pesanteur, en seizièmes de pixel.',
    texte: [
      'Un objet qui tombe ne descend pas à vitesse constante : il **accélère**. Toute la physique tient en deux additions — la pesanteur s’ajoute à la vitesse, la vitesse s’ajoute à la position — et c’est de les faire **dans cet ordre**, à chaque image, qui fabrique la courbe d’une chute.',
      'Reste un ennui : la console **ne connaît pas la virgule**. Au premier instant, la balle avance de deux seizièmes de pixel — arrondi, cela fait zéro, et elle ne partirait jamais.',
      'On garde donc la position en **deux morceaux** : les pixels dans `y`, et les seizièmes de pixel dans `frac`. Seul `y` est montré ; `frac` est la mémoire de ce qui n’est pas encore un pixel entier, et qui le deviendra.',
      '`frac >> 4` est une division par seize, `frac & 15` en est le reste. Le processeur ne sait pas diviser ; décaler de quatre bits, en revanche, lui coûte un seul tour d’horloge.',
      'La chute dure **trois quarts de seconde**. Une démonstration qui ne se joue qu’une fois ne se voit pas : on compte donc les images passées au sol, et **au bout de quarante la balle est renvoyée en haut**. Elle tombe en boucle, et l’on peut la regarder tomber autant qu’on veut.',
      'La relance remet **les trois** : la hauteur, les seizièmes et la vitesse. Le sol vient de les mettre à zéro une ligne plus haut — mais un départ qui compte sur le ménage fait par quelqu’un d’autre n’est pas un départ, et le jour où l’on relancera d’ailleurs la balle partira du ciel avec la vitesse qu’elle avait en s’écrasant.',
      '`G` vaut 2, et ce nombre est le seul réglage : à 1 la balle flotte comme sur la Lune, à 6 elle tombe comme une enclume. C’est là, et nulle part ailleurs, que se décide ce qu’on ressent.',
      '**Et 9,81 dans tout ça ?** Elle est dans `G`. Le processeur n’a ni virgule ni mètres : `G` se compte en seizièmes de pixel par image, par image, soit 450 pixels par seconde carrée à soixante images par seconde. Décidez qu’un mètre fait 46 pixels, et ces 450 pixels deviennent **9,81 m/s²** — l’écran mesure alors 3,10 m de haut, et la chute de 2,60 m dure les trois quarts de seconde que la vraie physique annonce. La pesanteur est la bonne ; c’est l’unité qui a changé.',
    ],
    code: `Tuile BALLE = {
  "00333300",
  "03222230",
  "32222223",
  "32222223",
  "32222223",
  "32222223",
  "03222230",
  "00333300",
};

const uint8_t CIEL = 8;    // le haut de la balle quand on la lâche
const uint8_t SOL = 128;   // le haut de la balle quand elle touche terre
const uint8_t G = 2;       // la pesanteur, en seizièmes de pixel par image
const uint8_t ATTENTE = 40; // les images passées au sol avant de recommencer

int main() {
  uint8_t y = CIEL;  // les pixels — ce que l’écran montre
  uint8_t frac = 0;  // les seizièmes — ce qu’il ne sait pas montrer
  uint8_t vy = 0;    // la vitesse, en seizièmes de pixel par image
  uint8_t pose = 0;  // depuis combien d’images elle est posée

  texte(4, 2, "CHUTE LIBRE");
  texte(2, 4, "ET CA RECOMMENCE");
  texte(0, 17, "####################");

  while (true) {
    image();

    vy = vy + G;

    frac = frac + vy;
    y = y + (frac >> 4);
    frac = frac & 15;

    if (y >= SOL) {
      y = SOL;
      frac = 0;
      vy = 0;
      pose = pose + 1;
    }

    if (pose > ATTENTE) {
      y = CIEL;
      frac = 0;
      vy = 0;
      pose = 0;
    }

    sprite(0, 76, y, BALLE);
  }

  return 0;
}
`,
    aVoir: 'La balle part lentement, prend de la vitesse, s’arrête net sur le sol — puis remonte d’un coup et recommence.',
    controle: (c) => {
      /* Deux cents images : plus d’un aller-retour complet. On ne regarde pas
         une position, on regarde TOUT le trajet. */
      const suite = []
      for (let i = 0; i < 200; i++) { c.avancer(1); suite.push(c.variable('y')) }

      /* Une remontée, c’est la seule image où « y » diminue. */
      const remontees = suite.filter((v, i) => i > 0 && v < suite[i - 1]).length
      const depart = suite.findIndex((v, i) => i > 0 && v < suite[i - 1])
      const chute = suite.slice(depart)

      /* La preuve d’une accélération n’est pas qu’elle descend : c’est qu’elle
         descend PLUS LOIN pendant les huit images suivantes que pendant les
         huit premières. Une vitesse constante donnerait deux fois le même
         nombre. */
      const debut = chute[8] - chute[0]
      const ensuite = chute[16] - chute[8]

      return [
        ['elle part du haut de l’écran', Math.min(...suite) === 8],
        ['elle descend jusqu’au sol', Math.max(...suite) === 128],
        ['elle accélère en tombant', ensuite > debut, `(${debut} pixels, puis ${ensuite})`],
        ['elle marque un temps d’arrêt', suite.filter((v) => v === 128).length > 30,
          `(${suite.filter((v) => v === 128).length} images au sol)`],
        ['et elle recommence toute seule', remontees >= 2, `(${remontees} chutes en 200 images)`],
      ]
    },
  },

  {
    titre: 'La pesanteur et le saut',
    difficulte: 9,
    idee: 'Tomber, et retomber.',
    texte: [
      'Le processeur ne connaît **pas les nombres négatifs** : `0 - 1` vaut 255. Une vitesse qui doit monter *et* descendre ne peut donc pas s’écrire directement.',
      'On la décale : `ZEROV` vaut 16, et la vitesse vit autour. **Moins de 16, on monte ; plus de 16, on tombe.** Sans ce décalage, un saut deviendrait une chute de 240 pixels par image.',
      '`const uint8_t ZEROV = 16;` ne coûte rien : la valeur est connue à la compilation, et le compilateur l’écrit directement dans le code. Un `const` n’occupe pas d’octet de mémoire.',
      'La pesanteur ajoute 1 à chaque image. Sauter, c’est poser une vitesse bien en dessous de 16 : elle remonte d’elle-même, le mouvement s’inverse, et la courbe est celle d’un vrai saut.',
    ],
    code: `Tuile BALLE = {
  "00333300",
  "03222230",
  "32222223",
  "32222223",
  "32222223",
  "32222223",
  "03222230",
  "00333300",
};

const uint8_t ZEROV = 16;
const uint8_t SOL = 120;

int main() {
  uint8_t x = 76;
  uint8_t y = SOL;
  uint8_t vy = ZEROV;
  uint8_t auSol = 1;
  uint8_t aAvant = 0;

  texte(4, 2, "A POUR SAUTER");

  while (true) {
    image();

    uint8_t a = bouton(A);

    if (a && !aAvant && auSol) {
      vy = ZEROV - 7;
      auSol = 0;
    }

    aAvant = a;

    vy++;
    if (vy > ZEROV + 4) vy = ZEROV + 4;

    if (vy < ZEROV) y = y - ZEROV + vy;
    if (vy > ZEROV) y = y + vy - ZEROV;

    if (y >= SOL) {
      y = SOL;
      vy = ZEROV;
      auSol = 1;
    }

    sprite(0, x, y, BALLE);
  }

  return 0;
}
`,
    aVoir: 'La boule saute, ralentit en l’air, et retombe sur le sol.',
    controle: (c) => {
      const sol = c.variable('y')
      c.presser('a', 3)
      let plusHaut = 255
      for (let i = 0; i < 40; i++) { c.avancer(1); plusHaut = Math.min(plusHaut, c.variable('y')) }
      c.avancer(60)
      return [
        ['elle part posée au sol', sol === 120],
        ['A la fait monter', plusHaut < sol, `(${sol} vers ${plusHaut})`],
        ['de plusieurs cases', sol - plusHaut > 16, `(${sol - plusHaut} pixels)`],
        ['et elle retombe exactement au sol', c.variable('y') === 120],
      ]
    },
  },

  {
    titre: 'Le verre qui se brise',
    difficulte: 9,
    idee: 'Quatre éclats, et trois variables.',
    texte: [
      'La chute est celle de la leçon du même nom : les pixels dans `y`, les seizièmes dans `frac`, la pesanteur qui s’ajoute à la vitesse. Ce qui change ici, c’est **ce qui arrive au contact**.',
      'Un objet qui se brise ne disparaît pas : il est **remplacé par ses morceaux**. Au choc, le verre part se cacher et quatre éclats prennent sa place, exactement à l’endroit où il s’est posé.',
      '**Cacher un lutin ne demande aucune fonction** : on l’écrit à 160, hors des 144 lignes de l’écran. Il existe toujours — les quarante existent toujours — on choisit simplement de ne pas le voir. C’est pour cela que les cinq `sprite()` de la fin sont écrits une fois pour toutes, sans un seul `if` : ce sont les variables qui décident qui est visible.',
      '**On ne simule pas quatre éclats.** Une image plus tôt ils étaient un seul objet : ils partent donc ensemble, à la même hauteur, et ne diffèrent que par ce qu’ils prennent de côté. Une seule hauteur `ey`, un seul compteur `t`, et les quatre positions se calculent — `76 - 3 * t`, `76 - t`, `76 + t`, `76 + 3 * t`. **Trois variables au lieu de douze.**',
      'Leur envol est la vitesse décalée du saut : `ZEROV - 6` les projette vers le haut, la pesanteur les rattrape. Les deux éclats rapides retombent trois fois plus loin que les lents, sans qu’on ait rien à écrire pour ça — même temps de vol, vitesse triple.',
      '`t` n’avance **que tant qu’ils volent**. Posés, il s’arrête, et les éclats restent exactement où ils sont tombés. C’est cette ligne-là, et aucune autre, qui fait la différence entre du verre brisé et quatre morceaux qui glissent à l’infini.',
    ],
    code: `Tuile VERRE = {
  "00333300",
  "03211230",
  "32112223",
  "32122223",
  "32222223",
  "32222223",
  "03222230",
  "00333300",
};

Tuile ECLAT = {
  "00000000",
  "00000300",
  "00003130",
  "00031230",
  "00312300",
  "03123000",
  "03330000",
  "00000000",
};

const uint8_t CIEL = 8;
const uint8_t SOL = 128;
const uint8_t CACHE = 160;  // hors de l’écran : un lutin écrit là ne se voit pas
const uint8_t G = 2;
const uint8_t ZEROV = 16;   // la vitesse d’un éclat, décalée : 16 est l’immobilité
const uint8_t ATTENTE = 60;

int main() {
  uint8_t y = CIEL;
  uint8_t frac = 0;
  uint8_t vy = 0;

  uint8_t brise = 0;
  uint8_t t = 0;        // images de vol — c’est lui qui écarte les éclats
  uint8_t ey = CACHE;   // leur hauteur, la même pour les quatre
  uint8_t evy = ZEROV;
  uint8_t pose = 0;

  texte(0, 2, "IL TOMBE ET IL CASSE");
  texte(0, 17, "####################");

  while (true) {
    image();

    if (brise) {
      evy = evy + 1;
      if (evy < ZEROV) ey = ey - ZEROV + evy;
      if (evy > ZEROV) ey = ey + evy - ZEROV;

      if (ey >= SOL) {
        ey = SOL;
        evy = ZEROV;
      } else {
        t = t + 1;
      }

      pose = pose + 1;
      if (pose > ATTENTE) {
        brise = 0;
        pose = 0;
        t = 0;
        ey = CACHE;
        y = CIEL;
        frac = 0;
        vy = 0;
      }
    } else {
      vy = vy + G;
      frac = frac + vy;
      y = y + (frac >> 4);
      frac = frac & 15;

      if (y >= SOL) {
        brise = 1;
        y = CACHE;
        ey = SOL;
        evy = ZEROV - 6;
      }
    }

    sprite(0, 76, y, VERRE);
    sprite(1, 76 - 3 * t, ey, ECLAT);
    sprite(2, 76 - t, ey, ECLAT);
    sprite(3, 76 + t, ey, ECLAT);
    sprite(4, 76 + 3 * t, ey, ECLAT);
  }

  return 0;
}
`,
    aVoir: 'Le verre tombe, éclate en quatre morceaux qui s’envolent et retombent éparpillés — puis tout recommence.',
    controle: (c) => {
      /* On avance jusqu’au choc : il se reconnaît à ce que le verre s’efface. */
      let images = 0
      while (c.lutin(0).y !== 160 && images < 120) { c.avancer(1); images++ }

      c.avancer(3)
      const enVol = c.lutin(1).y

      c.avancer(40)
      const g2 = c.lutin(1)
      const g1 = c.lutin(2)
      const d1 = c.lutin(3)
      const d2 = c.lutin(4)

      return [
        ['le verre tombe, puis s’efface au choc', images > 20 && images < 120, `(${images} images de chute)`],
        ['quatre éclats prennent sa place', [1, 2, 3, 4].every((n) => c.lutin(n).tuile === 45)],
        ['ils s’envolent au-dessus du sol', enVol < 128, `(y = ${enVol})`],
        ['ils s’écartent des deux côtés', g2.x < g1.x && g1.x < 76 && 76 < d1.x && d1.x < d2.x,
          `(${g2.x}, ${g1.x}, ${d1.x}, ${d2.x})`],
        ['les rapides retombent trois fois plus loin', 76 - g2.x === 3 * (76 - g1.x),
          `(${76 - g1.x} et ${76 - g2.x} pixels)`],
        ['et tout se pose au sol', g2.y === 128 && d2.y === 128],
      ]
    },
  },

  {
    titre: 'Un tableau, et une boucle « for »',
    difficulte: 6,
    idee: 'Ranger beaucoup de choses.',
    texte: [
      '`uint8_t cases[20];` réserve vingt octets en mémoire de travail — de quoi tenir un puits, une carte, un inventaire. Ils vivent hors de la page rapide, qui ne contient que les variables.',
      'Un tableau **`const`** est différent : il est **gravé dans la cartouche**. Il ne prend pas un octet de mémoire, et ne peut plus changer — le compilateur refuse d’y écrire. C’est ce qu’on veut pour une table de formes, un niveau, une courbe.',
      'Le `for` de C++ tient sur une ligne ce que le `while` demandait en quatre, et **la variable du compteur n’existe que dans la boucle**. Deux boucles voisines peuvent toutes deux nommer leur compteur `i` sans se marcher dessus : c’est la portée du langage, et le compilateur la tient vraiment.',
    ],
    code: `const uint8_t TABLE[] = { 1, 1, 2, 3, 5, 8, 3, 1, 4, 5 };

uint8_t cases[20];

int main() {
  texte(3, 3, "UN TABLEAU");
  texte(3, 11, "ET UNE TABLE");

  for (uint8_t i = 0; i < 20; i++) {
    cases[i] = i % 10;
  }

  for (uint8_t i = 0; i < 20; i++) {
    poser(i, 6, 27 + cases[i]);
  }

  for (uint8_t i = 0; i < 10; i++) {
    poser(i * 2, 14, 27 + TABLE[i]);
  }

  while (true) {
    image();
  }

  return 0;
}
`,
    aVoir: 'Les chiffres 0 à 9 deux fois, puis la table gravée, un chiffre sur deux.',
    controle: (c) => [
      ['le tableau est rempli', c.mot(0, 6, 10) === '0123456789'],
      ['et il recommence après dix', c.mot(10, 6, 10) === '0123456789'],
      ['la table gravée se lit', [1, 1, 2, 3, 5, 8, 3, 1, 4, 5].every((v, i) => c.lire(i * 2, 14) === 27 + v)],
      ['le titre est là', c.mot(3, 3, 10) === 'UN TABLEAU'],
    ],
  },

  {
    titre: 'Une fonction qui prend des arguments',
    difficulte: 7,
    idee: 'Écrire une fois ce qu’on fera dix fois.',
    texte: [
      'Voici ce que le C++ apporte de plus visible. Une fonction prend des **arguments**, et rend une **valeur** : `uint8_t distance(uint8_t a, uint8_t b)`. On l’écrit une fois, on l’appelle partout, et l’endroit où l’on écrit `barre(2, 6, 5)` dit exactement ce qui va se passer.',
      'Une fonction qui ne rend rien s’écrit **`void`**. Une fonction qui annonce rendre un `uint8_t` **doit** le faire : si aucun `return` ne rend de valeur, le compilateur refuse le fichier, plutôt que de laisser la fonction rendre ce qui traînait dans le processeur.',
      'Un prix à payer, et il est dit franchement : **une fonction ne peut pas s’appeler elle-même**. Les arguments vivent à une place fixe, réservée une fois pour toutes — faute d’une pile praticable sur cette machine. Un appel imbriqué écraserait les arguments de l’appel en cours ; le compilateur nomme le cycle et s’arrête là.',
    ],
    code: `Tuile BLOC = {
  "33333333",
  "30000003",
  "30222203",
  "30222203",
  "30222203",
  "30222203",
  "30000003",
  "33333333",
};

// Une fonction qui rend une valeur.
uint8_t distance(uint8_t a, uint8_t b) {
  if (a > b) return a - b;
  return b - a;
}

// Une fonction qui n'en rend aucune : « void ».
void barre(uint8_t colonne, uint8_t ligne, uint8_t longueur) {
  for (uint8_t i = 0; i < longueur; i++) {
    poser(colonne + i, ligne, BLOC);
  }
}

int main() {
  texte(2, 2, "DES ARGUMENTS");

  barre(2, 6, 5);
  barre(2, 8, 12);
  barre(2, 10, distance(3, 20));

  while (true) {
    image();
  }

  return 0;
}
`,
    aVoir: 'Trois barres de longueurs différentes : 5, 12, puis 17 cases.',
    controle: (c) => {
      const longueur = (ligne) => {
        let n = 0
        while (n < 20 && c.lire(2 + n, ligne) === 44) n++
        return n
      }
      return [
        ['la première barre fait 5 cases', longueur(6) === 5, ` (${longueur(6)})`],
        ['la deuxième en fait 12', longueur(8) === 12, ` (${longueur(8)})`],
        ['la troisième vaut distance(3, 20), soit 17', longueur(10) === 17, ` (${longueur(10)})`],
        ['le titre est écrit', c.mot(2, 2, 13) === 'DES ARGUMENTS'],
      ]
    },
  },

  {
    titre: 'Une « struct » : ce qui va ensemble',
    difficulte: 8,
    idee: 'Une troupe d’ennemis, et non six tableaux parallèles.',
    texte: [
      'Un ennemi a une position, une vitesse, une santé. Sans `struct`, cela fait trois tableaux qu’il faut penser à garder alignés — et le jour où l’on en trie un sans trier les autres, les vies changent de propriétaire.',
      'Une **`struct`** range ces champs ensemble. `Etoile etoiles[4];` réserve quatre enregistrements ; `etoiles[i].x` en désigne un champ. Le compilateur calcule le décalage lui-même, et `sizeof(Etoile)` dit ce qu’un enregistrement pèse.',
      'Le numéro d’un lutin peut être **calculé** : `sprite(i, …)` dans une boucle affiche toute la troupe, chacun avec ses valeurs à lui. C’est ce qui rend la `struct` utile plutôt que décorative.',
      'Une `struct` peut en contenir une autre : `struct Ennemi { Point ou; uint8_t vie; };`, et l’on écrit `troupe[i].ou.x`. Le compilateur additionne les décalages lui-même.',
      'Ce qu’elle ne sait pas faire : s’affecter d’un bloc, se passer en argument, se rendre par une fonction. On nomme le champ qu’on veut lire ou écrire — et le compilateur le dit plutôt que de traduire à peu près.',
    ],
    code: `Tuile CORPS = {
  "00333300",
  "03222230",
  "32222223",
  "32122123",
  "32222223",
  "32211223",
  "03222230",
  "00333300",
};

struct Etoile {
  uint8_t x;
  uint8_t y;
  uint8_t vitesse;
};

const uint8_t COMBIEN = 4;

Etoile etoiles[COMBIEN];

void placer() {
  for (uint8_t i = 0; i < COMBIEN; i++) {
    etoiles[i].x = 20 + i * 30;
    etoiles[i].y = 32 + i * 24;
    etoiles[i].vitesse = 1 + i;
  }
}

void avancerToutes() {
  for (uint8_t i = 0; i < COMBIEN; i++) {
    etoiles[i].x += etoiles[i].vitesse;

    if (etoiles[i].x > 152) etoiles[i].x = 0;

    sprite(i, etoiles[i].x, etoiles[i].y, CORPS);
  }
}

int main() {
  texte(2, 1, "UNE TROUPE");

  placer();

  while (true) {
    image();
    avancerToutes();
  }

  return 0;
}
`,
    aVoir: 'Quatre boules qui traversent l’écran, chacune à sa vitesse.',
    controle: (c) => {
      const depart = [0, 1, 2, 3].map((n) => c.lutin(n))
      c.avancer(30)
      const apres = [0, 1, 2, 3].map((n) => c.lutin(n))
      const parcouru = depart.map((d, i) => (apres[i].x - d.x + 256) % 256)
      return [
        ['les quatre lutins portent la tuile dessinée', depart.every((l) => l.tuile === 44)],
        ['ils sont sur quatre lignes différentes', new Set(depart.map((l) => l.y)).size === 4],
        ['tous avancent', parcouru.every((p) => p > 0), ` (${parcouru.join(', ')})`],
        ['et chacun à sa vitesse', new Set(parcouru).size === 4, ` (${parcouru.join(', ')})`],
        ['le titre est écrit', c.mot(2, 1, 10) === 'UNE TROUPE'],
      ]
    },
  },

  {
    titre: 'Le décor qui défile',
    difficulte: 8,
    idee: 'Un monde plus large que l’écran.',
    texte: [
      'La carte de fond fait **32 cases sur 32**, soit 256 pixels de côté ; l’écran n’en montre que 20 sur 18. Le reste attend hors-champ.',
      '`defiler(x, y)` fait glisser la fenêtre. Au-delà de 255, le compte revient tout seul à zéro : le décor est un **ruban sans fin**.',
      'C’est ce qui permet un niveau aussi long qu’on veut : quand la caméra franchit une case, on redessine la colonne qui va entrer par la droite, à la place de celle qui vient de sortir par la gauche.',
    ],
    code: `Tuile MUR = {
  "33333333",
  "32222223",
  "32122123",
  "32222223",
  "32221223",
  "32122223",
  "32222223",
  "33333333",
};

int main() {
  uint8_t d = 0;

  texte(2, 2, "DROITE POUR AVANCER");

  for (uint8_t x = 0; x < 32; x++) {
    poser(x, 14, MUR);
    poser(x, 15, MUR);
  }

  while (true) {
    image();

    if (bouton(DROITE)) d++;
    if (bouton(GAUCHE)) d--;

    defiler(d, 0);
  }

  return 0;
}
`,
    aVoir: 'Le sol glisse sous l’écran quand on pousse la croix.',
    controle: (c) => {
      const depart = c.defilement()
      c.presser('right', 20)
      const apres = c.defilement()
      return [
        ['le sol est dessiné', c.lire(0, 14) === 44],
        ['sur toute la carte, hors-champ compris', c.lire(25, 14) === 44],
        ['DROITE fait défiler', apres > depart, `(${depart} vers ${apres})`],
      ]
    },
  },

  {
    titre: 'La caméra : c’est le monde qui bouge',
    difficulte: 8,
    idee: 'Le héros ne se déplace pas — comme dans Mario.',
    texte: [
      'Dans un jeu qui défile, le personnage **ne bouge pas à l’écran**. Il reste au milieu, et c’est le décor qui passe derrière lui. Mario n’avance pas : il piétine au centre pendant qu’un monde de plusieurs écrans glisse vers la gauche.',
      'Il y a donc **deux espaces** : l’écran, qui fait 160 pixels de large, et le monde, qui fait ce qu’on veut. `defiler(camera, 0)` dit simplement **quel morceau du monde on regarde**.',
      'Et voici pourquoi cela tient en si peu de lignes : **les lutins ne défilent pas**. `defiler()` ne déplace que le fond ; un `sprite()` est posé sur l’écran, à la place où on l’écrit. Le héros au milieu, c’est une ligne, toujours la même : `sprite(0, 76, 112, HEROS);`',
      'Une seule variable suffit pour les deux rôles. `camera` est la fenêtre **et** la position du héros dans le monde : il est en `camera + 76`. Le jour où un ennemi arrive, lui vit dans le monde, et c’est à lui de se convertir — `sprite(1, xEnnemi - camera, 112, ENNEMI)`.',
      'La preuve est à l’écran, et elle est gratuite : **même la consigne s’en va**. Elle est écrite dans le décor, donc elle voyage avec lui. Le bonhomme, lui, ne bouge pas d’un pixel.',
    ],
    code: `Tuile HEROS = {
  "00333300",
  "03222230",
  "32122123",
  "32222223",
  "03222230",
  "03333330",
  "00300300",
  "03300330",
};

Tuile SOL = {
  "33333333",
  "32323232",
  "23232323",
  "32323232",
  "23232323",
  "32323232",
  "23232323",
  "32323232",
};

Tuile ARBRE = {
  "00033000",
  "00333300",
  "03333330",
  "33333333",
  "03333330",
  "00033000",
  "00033000",
  "00033000",
};

int main() {
  uint8_t camera = 0;

  texte(1, 2, "IL NE BOUGE PAS");
  texte(1, 4, "CEST LE MONDE QUI");
  texte(1, 5, "PASSE DERRIERE LUI");

  for (uint8_t c = 0; c < 32; c++) {
    poser(c, 15, SOL);
    poser(c, 16, SOL);
    poser(c, 17, SOL);
  }

  poser(3, 14, ARBRE);
  poser(12, 14, ARBRE);
  poser(25, 14, ARBRE);

  while (true) {
    image();

    if (bouton(DROITE)) camera = camera + 1;
    if (bouton(GAUCHE)) camera = camera - 1;

    defiler(camera, 0);
    sprite(0, 76, 112, HEROS);
  }

  return 0;
}
`,
    aVoir: 'Le bonhomme reste planté au milieu ; les arbres, le sol et même la consigne passent derrière lui.',
    controle: (c) => {
      const avant = c.lutin(0)
      const vue = c.defilement()

      c.presser('right', 40)
      const apres = c.lutin(0)
      const pousse = c.defilement()

      c.presser('left', 20)
      const revenu = c.defilement()

      return [
        ['le héros est posé au milieu de l’écran', avant.x === 76 && avant.y === 112, `(${avant.x}, ${avant.y})`],
        ['le monde est plus large que l’écran', c.lire(0, 15) === 45 && c.lire(28, 15) === 45],
        ['des arbres le jalonnent', c.lire(3, 14) === 46 && c.lire(25, 14) === 46],
        ['DROITE fait glisser le monde', pousse > vue, `(${vue} vers ${pousse})`],
        ['GAUCHE le ramène', revenu < pousse, `(${pousse} vers ${revenu})`],
        ['et le héros n’a pas bougé d’un pixel', apres.x === avant.x && apres.y === avant.y,
          `(${apres.x}, ${apres.y})`],
      ]
    },
  },

  {
    titre: 'Le son',
    difficulte: 5,
    idee: 'Quatre voix, dont trois qu’on peut jouer.',
    texte: [
      'La console a une puce sonore depuis toujours, et rien ne lui parlait. `note(voix, hauteur, duree, volume)` joue une note sur la voix **1** ou **2** — deux signaux carrés — et `bruit(duree, volume)` frappe sur la quatrième, celle du bruit : une explosion, un pas, un tir.',
      'Les hauteurs portent des noms : `DO4`, `RED4`, `MI4`… de `DO2` à `SI6`, cinq octaves. Un nom se relit ; un numéro de fréquence, non. La table est calculée à la compilation et gravée dans la cartouche — 120 octets pour tout le clavier.',
      'La **durée** se compte en 256ᵉ de seconde, de 1 à 64. Une durée de `0` veut dire « sans fin » : la note tient jusqu’à `silence(voix)`. Le **volume** va de 0 à 15.',
      'Deux voix, c’est une mélodie et son accompagnement. Ici la voix 2 double la voix 1 une octave plus bas — `MELODIE[pas] - 12`, puisqu’une octave fait douze demi-tons.',
    ],
    code: `const uint8_t MELODIE[] = { DO4, MI4, SOL4, DO5, SOL4, MI4, RE4, SOL4 };

uint8_t pas = 0;
uint8_t attente = 0;

int main() {
  texte(3, 5, "A POUR UN BRUIT");

  while (true) {
    image();

    attente++;

    if (attente > 24) {
      attente = 0;

      note(1, MELODIE[pas], 20, 12);
      note(2, MELODIE[pas] - 12, 20, 6);

      pas++;
      if (pas >= sizeof(MELODIE)) pas = 0;
    }

    if (bouton(A)) bruit(6, 12);
    if (bouton(START)) { silence(1); silence(2); }
  }

  return 0;
}
`,
    aVoir: 'Une mélodie qui tourne en boucle ; A frappe un bruit sec.',
    controle: (c) => {
      /* On ne regarde pas l’écran : on écoute. La hauteur se lit dans la voix
         de l’émulateur — les registres de fréquence ne se relisent pas sur
         cette console, ils ne servent qu’à écrire. */
      const hertz = (voix) => Math.round(131072 / (2048 - voix.periode))
      const voix1 = new Set()
      const voix2 = new Set()
      let sonores = 0

      for (let i = 0; i < 260; i++) {
        c.avancer(1)
        const ech = c.gb.apu.drain()
        let fort = 0
        for (const v of ech) fort = Math.max(fort, Math.abs(v))
        if (fort > 0.05) sonores++
        if (c.gb.apu.canal1.joue) voix1.add(hertz(c.gb.apu.canal1))
        if (c.gb.apu.canal2.joue) voix2.add(hertz(c.gb.apu.canal2))
      }

      const proche = (ou, quoi) => [...ou].some((h) => Math.abs(h - quoi) <= 2)

      return [
        ['la puce sonore est allumée', (c.gb.mmu.read(0xff26) & 0x80) !== 0],
        ['la console produit vraiment du son', sonores > 20, `(${sonores} images sur 260)`],
        ['la voix 1 joue le DO4 et le DO5', proche(voix1, 262) && proche(voix1, 523),
          `(${[...voix1].sort((a, b) => a - b).join(', ')} Hz)`],
        ['la voix 2 double une octave plus bas', proche(voix2, 131) && proche(voix2, 262),
          `(${[...voix2].sort((a, b) => a - b).join(', ')} Hz)`],
      ]
    },
  },

  {
    titre: 'Le panneau, et les nuances',
    difficulte: 6,
    idee: 'Un score qui reste en place pendant que le décor glisse.',
    texte: [
      'Le décor défile ; le score, lui, ne doit pas bouger. Sans une seconde couche, il faudrait le redessiner à chaque image à la position que le défilement lui a donnée — et le moindre décalage se verrait.',
      'Le **panneau** est cette couche : le matériel l’appelle la fenêtre, il la pose par-dessus le décor, et **elle ne défile pas**. `panneau(x, y)` la place, en pixels, et l’allume. On y écrit avec `textePanneau()` et `poserPanneau()`, exactement comme sur le fond.',
      'Il n’y a que **deux cartes de fond** dans la console : le décor prend la première, le panneau la seconde. C’est un choix, et il vaut mieux le savoir que le découvrir.',
      '`paletteFond(n0, n1, n2, n3)` choisit les quatre nuances, de la plus claire à la plus sombre — chaque nombre va de 0 à 3. Elles étaient posées une fois pour toutes à l’allumage ; ici on s’en sert pour assombrir le fond par paliers.',
    ],
    code: `Tuile SOL = {
  "33333333",
  "32222223",
  "32122123",
  "32222223",
  "32221223",
  "32122223",
  "32222223",
  "33333333",
};

uint8_t d = 0;
uint8_t attente = 0;
uint8_t noirceur = 0;

int main() {
  for (uint8_t x = 0; x < 32; x++) {
    poser(x, 12, SOL);
    poser(x, 13, SOL);
  }

  textePanneau(1, 0, "SCORE 00");
  panneau(0, 128);

  while (true) {
    image();

    d++;
    defiler(d, 0);

    attente++;

    if (attente > 40) {
      attente = 0;
      noirceur++;
      if (noirceur > 3) noirceur = 0;

      // le fond s'assombrit, puis revient
      paletteFond(noirceur, noirceur + 1, 2, 3);
    }
  }

  return 0;
}
`,
    aVoir: 'Le sol glisse ; « SCORE 00 » reste collé en bas, et les nuances changent.',
    controle: (c) => {
      const lcdc = c.gb.mmu.read(0xff40)
      const rangee = (y) => c.gb.framebuffer.slice(y * 160, (y + 1) * 160).join(',')

      const panneauAvant = rangee(132)
      const decorAvant = rangee(100)
      const paletteAvant = c.gb.mmu.read(0xff47)

      /*
       * Dix images seulement.
       *
       * Le décor a déjà glissé de dix pixels, ce qui suffit à le voir bouger —
       * et les nuances, elles, ne changent que toutes les quarante images. En
       * comparant plus loin, le contrôle échouait pour la mauvaise raison : le
       * panneau n'avait pas bougé, il avait changé de COULEUR, comme tout le
       * reste de l'écran. Une palette s'applique aussi à lui.
       */
      c.avancer(10)
      const panneauApres = rangee(132)
      const decorApres = rangee(100)

      c.avancer(90) // le temps qu'un palier de nuance passe

      return [
        ['le panneau est allumé', (lcdc & 0x20) !== 0],
        ['il lit la seconde carte de fond', (lcdc & 0x40) !== 0],
        ['il est posé à la ligne 128', c.gb.mmu.read(0xff4a) === 128],
        ['le décor défile', decorApres !== decorAvant],
        ['mais le panneau ne bouge pas', panneauApres === panneauAvant],
        ['et il n’est pas vide', new Set(panneauAvant.split(',')).size > 1],
        ['les nuances ont changé', c.gb.mmu.read(0xff47) !== paletteAvant,
          `($${paletteAvant.toString(16)} vers $${c.gb.mmu.read(0xff47).toString(16)})`],
      ]
    },
  },

  {
    titre: 'Se souvenir d’une partie à l’autre',
    difficulte: 10,
    idee: 'Un meilleur score qui survit à l’extinction.',
    texte: [
      'La cartouche porte une pile et une petite mémoire. `sauver(numero, valeur)` y écrit, `sauvegarde(numero)` y relit — 256 cases, et elles sont encore là après avoir éteint la console.',
      'Cette mémoire n’est pas ouverte en permanence : il faut la **déverrouiller** avant d’y toucher et la refermer aussitôt. Le compilateur pose le verrou lui-même à chaque accès. Ce n’est pas de la prudence excessive : laissée ouverte, une coupure de courant au mauvais moment la corrompt.',
      'À la toute première partie, cette mémoire contient n’importe quoi. Un jeu y écrit donc **une marque à lui** et ne fait confiance au reste que s’il la retrouve. C’est ce que fait la première ligne de `main()`.',
    ],
    code: `const uint8_t MARQUE = 42;

uint8_t meilleur = 0;
uint8_t score = 0;
uint8_t attente = 0;

int main() {
  // La cartouche a-t-elle déjà servi ?
  if (sauvegarde(0) != MARQUE) {
    sauver(0, MARQUE);
    sauver(1, 0);
  }

  meilleur = sauvegarde(1);

  texte(2, 4, "SCORE");
  texte(2, 8, "RECORD");

  while (true) {
    image();

    attente++;

    if (attente > 30) {
      attente = 0;

      if (score < 9) score++;

      if (score > meilleur) {
        meilleur = score;
        sauver(1, meilleur);
      }
    }

    poser(10, 4, 27 + score);
    poser(10, 8, 27 + meilleur);
  }

  return 0;
}
`,
    aVoir: 'Le score monte, et le record le suit — puis lui survit.',
    controle: (c) => {
      c.avancer(200)
      const score = c.variable('score')
      const record = c.variable('meilleur')

      return [
        ['la cartouche annonce une mémoire à pile', c.gb.mmu.mbc === 'mbc1'],
        ['la marque est écrite', c.gb.mmu.externalRam[0] === 42],
        ['le score monte', score > 0, `(${score})`],
        ['le record le suit', record === score, `(${record})`],
        ['et il est bien dans la mémoire de la cartouche', c.gb.mmu.externalRam[1] === record],
        ['la mémoire est refermée après chaque accès', c.gb.mmu.ramEnabled === false],
      ]
    },
  },

  {
    titre: 'Poser tes tuiles à la souris',
    difficulte: 3,
    idee: 'Voir les carrés, tracer une zone — et le code s’écrit tout seul.',
    plan: true,
    texte: [
      'Jusqu’ici il fallait écrire `poser(6, 12, MUR);` à la main, case par case. Pour un sol de vingt cases, c’est vingt lignes, et une faute de frappe ne se voit pas.',
      'Le **plan** ci-dessous montre les tuiles du programme telles qu’elles sont — des carrés, pas des numéros. On en choisit une, on **trace une zone** sur l’écran, et le programme reçoit ses `poser()`. La gomme remet du vide.',
      'Le code écrit porte le **nom** de la tuile, jamais son numéro. C’est ce qui compte : un numéro devient faux le jour où l’on ajoute un dessin avant lui, alors qu’un nom reste juste. C’est le compilateur qui traduit, et c’est son travail.',
      'L’outil ne possède que le bloc entre `// PLAN` et `// FIN DU PLAN`. Tout ce que tu écris ailleurs est à toi, et il n’y touche pas.',
    ],
    code: `Tuile MUR = {
  "33333333",
  "32222223",
  "32122123",
  "32222223",
  "32221223",
  "32122223",
  "32222223",
  "33333333",
};

Tuile CAISSE = {
  "33333333",
  "31133113",
  "31133113",
  "33333333",
  "33333333",
  "31133113",
  "31133113",
  "33333333",
};

int main() {
  texte(4, 1, "TRACE UNE ZONE");

  // PLAN
  poser(0, 16, MUR);
  poser(1, 16, MUR);
  poser(2, 16, MUR);
  poser(3, 16, MUR);
  poser(9, 12, CAISSE);
  poser(10, 12, CAISSE);
  // FIN DU PLAN

  while (true) {
    image();
  }

  return 0;
}
`,
    aVoir: 'Un bout de sol et deux caisses — puis ce que tu traces toi-même.',
    controle: (c) => [
      ['le sol posé est à l’écran', [0, 1, 2, 3].every((x) => c.lire(x, 16) === 44),
        `(tuiles ${[0, 1, 2, 3].map((x) => c.lire(x, 16)).join(', ')})`],
      ['les caisses aussi, et ce n’est pas la même tuile', c.lire(9, 12) === 45 && c.lire(10, 12) === 45],
      ['rien n’est posé ailleurs', c.lire(5, 8) === 0],
      ['le titre est écrit', c.mot(4, 1, 14) === 'TRACE UNE ZONE'],
    ],
  },

  {
    titre: 'Écrire une musique',
    difficulte: 5,
    idee: 'Une mélodie qui joue toute seule, pendant que le jeu tourne.',
    airs: true,
    texte: [
      'Un `Air` s’écrit comme une tuile se dessine : une suite de pas, dans le programme. Chaque pas est une note et son volume — `"DO4 12"` —, ou l’un des deux pas qui n’en sont pas : `"--"` fait taire la voix, `"=="` laisse la note d’avant continuer.',
      'C’est `"=="` qui fait les notes longues. Sans lui, une blanche s’écrirait en rejouant la même note à chaque pas, et l’oreille entendrait quatre coups au lieu d’une note tenue.',
      '`jouer(voix, AIR, vitesse)` le lance. La **vitesse** est le nombre d’images que dure un pas : huit images font un peu moins de huit pas par seconde. Un quatrième argument, `1`, le fait recommencer sans fin.',
      'Ensuite, **le programme n’a plus rien à tenir**. L’air avance tout seul, soixante fois par seconde, dans l’interruption de la console — même si le jeu, lui, est en retard. Un tempo qui ralentirait avec la charge du jeu ne serait pas un tempo.',
      'La **partition ci-dessous** écrit ces lignes à la souris, et le bouton « Écouter » la fait entendre sans même compiler. Les deux voix chantantes sont la 1 et la 2 ; la quatrième, celle du bruit, se frappe avec `bruit(6, 10)`.',
    ],
    code: `Air THEME = {
  "DO4 12", "==",      "MI4 12",  "==",      "SOL4 12", "==",      "DO5 13",  "==",
  "SI4 11",  "==",     "SOL4 11", "==",      "MI4 11",  "==",      "--",      "--",
};

Air BASSE = {
  "DO3 8",   "==",     "==",      "==",      "SOL3 8",  "==",      "==",      "==",
  "MI3 8",   "==",     "==",      "==",      "--",      "--",      "--",      "--",
};

uint8_t joue = 0;

int main() {
  texte(4, 5, "LA MUSIQUE");
  texte(1, 8, "A  ARRETER OU JOUER");

  jouer(1, THEME, 8, 1);
  jouer(2, BASSE, 8, 1);
  joue = 1;

  while (true) {
    image();

    if (bouton(A) && joue) {
      silence(1);
      silence(2);
      joue = 0;
    }
  }

  return 0;
}
`,
    aVoir: 'Rien de neuf à l’écran — mais deux voix qui jouent, et « A » qui les arrête.',
    controle: (c) => {
      /* Ce qui compte ici ne se voit pas : il faut écouter la puce. On relève
         les hauteurs que les deux voix ont vraiment jouées. */
      const entendues = new Set()
      const dansLaBasse = new Set()
      /* 140 images : un tour complet de l'air (16 pas de 8 images) et un peu
         plus. Le DO4 du début peut être passé avant qu'on écoute ; l'air
         recommence, et on l'entend au tour suivant. */
      for (let i = 0; i < 140; i++) {
        c.avancer(1)
        if (c.gb.apu.canal1.joue) entendues.add(Math.round(131072 / (2048 - c.gb.apu.canal1.periode)))
        if (c.gb.apu.canal2.joue) dansLaBasse.add(Math.round(131072 / (2048 - c.gb.apu.canal2.periode)))
      }
      const proche = (mesurees, hertz) => [...mesurees].some((h) => Math.abs(h - hertz) <= 2)

      return [
        ['le titre est écrit', c.mot(4, 5, 10) === 'LA MUSIQUE'],
        ['la voix 1 joue le DO4 du début', proche(entendues, 262), `(${[...entendues].join(', ')} Hz)`],
        ['puis le MI4 et le SOL4 — l’air avance tout seul',
          proche(entendues, 330) && proche(entendues, 392)],
        ['la voix 2 tient la basse', proche(dansLaBasse, 131), `(${[...dansLaBasse].join(', ')} Hz)`],
        ['« A » fait taire les deux voix', (() => {
          c.presser('a', 6)
          c.avancer(4)
          return !c.gb.apu.canal1.joue && !c.gb.apu.canal2.joue
        })()],
      ]
    },
  },


  {
    titre: 'Découper son programme',
    difficulte: 7,
    dessin: true,
    idee: 'Le même travail, écrit pour être relu dans trois jours.',
    texte: [
      'Tout ce que fait ce programme tiendrait dans `main()`. Ce serait plus court à taper — et illisible dès qu’il grandit. Une boucle de jeu de deux cents lignes, on ne la relit pas : on la contourne, on lui ajoute une rustine à côté, et le désordre s’installe.',
      '**Une fonction est d’abord un nom.** `dessinerLeSol()` dit ce qu’elle fait ; le lecteur n’a pas besoin d’ouvrir la boucle qui pose vingt tuiles pour le savoir. Une fonction sans argument ni retour reste utile — c’est même là qu’elle sert le plus.',
      '**Un nombre écrit en clair au milieu du code ne dit rien.** `poser(colonne, 14, HERBE)` : pourquoi 14 ? `const uint8_t LIGNE_DU_SOL = 14;` répond, et le jour où le sol descend, il n’y a qu’un seul endroit à changer. Une `const` ne coûte **aucun octet** : sa valeur est connue à la compilation.',
      '**`return;` au milieu d’une fonction** évite d’imbriquer trois `if`. `fairePasserLeTemps()` s’arrête tout de suite quand ce n’est pas encore l’heure, et la suite se lit à plat.',
      '**Un programme peut tenir sur plusieurs fichiers.** `#include "dessins.cpp"` verse un autre fichier à cet endroit, avant toute compilation — et une faute y est signalée **avec le nom de son vrai fichier**, pas avec la ligne du texte collé. C’est ainsi qu’est écrit `exemples/decoupe/` : cinq fichiers, une seule cartouche, au dernier octet près.',
      'Dans l’atelier, les fichiers sont les **onglets sous le titre** : « + fichier » en ajoute un, et il suffit de l’inclure. L’exemple « Un programme sur CINQ fichiers » les ouvre tous les cinq d’un coup, pour voir à quoi ça ressemble.',
    ],
    code: `/*
 * Le même décor, écrit pour être RELU.
 *
 * Tout ce qui suit tiendrait dans main(). Ce serait plus court à taper, et
 * illisible trois jours plus tard.
 */

const uint8_t LIGNE_DU_SOL = 14;
const uint8_t LIGNE_DU_CIEL = 3;
const uint8_t COLONNES = 20;

Tuile HERBE = {
  "01100110",
  "11111111",
  "22222222",
  "22322322",
  "22222222",
  "23223223",
  "22222222",
  "33333333",
};

Tuile NUAGE = {
  "00000000",
  "00011100",
  "00111110",
  "01111111",
  "11111111",
  "01111110",
  "00000000",
  "00000000",
};

uint8_t nuage = 3;
uint8_t attente = 0;

/* Chaque fonction porte un nom qui DIT ce qu'elle fait. */
void ecrireLeTitre() {
  texte(5, 1, "MON DECOR");
}

void dessinerLeSol() {
  for (uint8_t colonne = 0; colonne < COLONNES; colonne++) {
    poser(colonne, LIGNE_DU_SOL, HERBE);
  }
}

void effacerLeCiel() {
  for (uint8_t colonne = 0; colonne < COLONNES; colonne++) {
    poser(colonne, LIGNE_DU_CIEL, 0);
  }
}

void dessinerLeCiel() {
  effacerLeCiel();
  poser(nuage, LIGNE_DU_CIEL, NUAGE);
}

void fairePasserLeTemps() {
  attente++;
  if (attente < 20) return;

  attente = 0;
  nuage++;
  if (nuage >= COLONNES) nuage = 0;
  dessinerLeCiel();
}

int main() {
  ecrireLeTitre();
  dessinerLeSol();
  dessinerLeCiel();

  while (true) {
    image();
    fairePasserLeTemps();
  }

  return 0;
}
`,
    aVoir: 'Un titre, un sol d’herbe sur toute la largeur, et un nuage qui traverse le ciel.',
    controle: (c) => {
      const ouEstLeNuage = () => {
        for (let colonne = 0; colonne < 20; colonne++) if (c.lire(colonne, 3) === 45) return colonne
        return -1
      }
      const avant = ouEstLeNuage()
      c.avancer(25)
      const apres = ouEstLeNuage()

      return [
        ['le sol couvre les vingt colonnes',
          Array.from({ length: 20 }, (_, x) => x).every((x) => c.lire(x, 14) === 44)],
        ['le titre est écrit', c.mot(5, 1, 9) === 'MON DECOR'],
        ['un nuage est en l’air, et un seul', avant >= 0, ` (colonne ${avant})`],
        /* On ne compte pas les cases parcourues : le nombre d'images écoulées
           avant que le contrôle ne regarde dépend du banc d'essai, et un
           contrôle qui dépend de cela se met à clignoter. Ce qu'il faut
           prouver, c'est qu'il bouge. */
        ['et il avance tout seul', apres >= 0 && apres !== avant, ` (de ${avant} à ${apres})`],
      ]
    },
  },

  {
    titre: 'La musique d’un jeu',
    difficulte: 10,
    airs: true,
    idee: 'Tout ensemble : un lutin qu’on déplace, une pièce à attraper, et un air qui ne s’arrête jamais.',
    texte: [
      'Voici les dix niveaux réunis dans un seul programme : des tuiles dessinées, des lutins au pixel près, des boutons lus à chaque image, un score — et **deux airs**.',
      '`jouer(1, MUSIQUE, 8, 1)` lance la musique de fond ; le quatrième argument, `1`, la fait **recommencer sans fin**. Ensuite le programme n’a plus rien à tenir : l’air avance tout seul dans l’interruption de la console, soixante fois par seconde, **même quand le jeu est en retard**.',
      'Attraper la pièce lance `jouer(1, VICTOIRE, 5)` : la fanfare **prend la voix 1**, par-dessus la musique, exactement comme dans un vrai jeu. Elle, elle ne boucle pas.',
      '`airFini(1)` dit quand la fanfare est arrivée au bout. C’est là qu’on relance la musique de fond — sans cela, la voix resterait muette après la victoire, et l’on chercherait longtemps pourquoi.',
      'La **partition ci-dessous** écrit les deux airs à la souris, et « Écouter » les fait entendre sans compiler. Change une note : le programme se réécrit, la cartouche se refait, et la console joue ta version dans la seconde.',
    ],
    code: `/* La musique tourne pendant que le jeu tourne. */

Air MUSIQUE = {
  "DO4 10",  "==",      "SOL4 10", "==",      "MI4 10",  "==",      "SOL4 10", "==",
  "FA4 10",  "==",      "LA4 10",  "==",      "SOL4 10", "==",      "--",      "--",
};

Air VICTOIRE = {
  "DO5 14",  "MI5 14",  "SOL5 15", "==",      "--",
};

Tuile HEROS = {
  "00333300",
  "03222330",
  "32122123",
  "32222223",
  "33222233",
  "03333330",
  "00300300",
  "03300330",
};

Tuile PIECE = {
  "00033000",
  "00311300",
  "03133130",
  "03133130",
  "03133130",
  "00311300",
  "00033000",
  "00000000",
};

uint8_t x = 40;
uint8_t piece = 60;
uint8_t score = 0;

int main() {
  texte(1, 1, "SCORE");
  jouer(1, MUSIQUE, 8, 1);

  while (true) {
    image();

    if (bouton(DROITE) && x < 152) x++;
    if (bouton(GAUCHE) && x > 8) x--;

    sprite(0, x, 80, HEROS);
    sprite(1, piece, 80, PIECE);

    /* Attrapée ? On avance le score, on joue la fanfare par-dessus la
       musique, et la pièce repart plus loin. */
    if (x + 6 > piece && piece + 6 > x) {
      if (score < 9) score++;
      poser(7, 1, 27 + score);
      jouer(1, VICTOIRE, 5);
      piece = piece + 40;
      if (piece > 150) piece = 20;
    }

    /* La fanfare finie, la musique reprend là où elle en était : au début. */
    if (airFini(1)) jouer(1, MUSIQUE, 8, 1);
  }

  return 0;
}
`,
    aVoir: 'DROITE et GAUCHE déplacent le héros. La pièce attrapée fait monter le score et sonner une fanfare.',
    controle: (c) => {
      const hauteurDe = (voix) => Math.round(131072 / (2048 - voix.periode))

      const auDepart = new Set()
      for (let i = 0; i < 24; i++) {
        c.avancer(1)
        if (c.gb.apu.canal1.joue) auDepart.add(hauteurDe(c.gb.apu.canal1))
      }

      const depart = c.lutin(0).x

      /* On tient DROITE, et l'on écoute pendant ce temps : la pièce attrapée
         doit faire monter le score ET sonner plus aigu que la musique. */
      const pendant = new Set()
      c.gb.setButton('right', true)
      for (let i = 0; i < 40; i++) {
        c.avancer(1)
        if (c.gb.apu.canal1.joue) pendant.add(hauteurDe(c.gb.apu.canal1))
      }
      c.gb.setButton('right', false)
      c.avancer(4)

      const aigus = [...pendant].filter((h) => h > 480).sort((a, b) => a - b)

      return [
        ['le héros est un lutin, hors de la grille', c.lutin(0).tuile === 44],
        ['la musique tourne dès le départ', auDepart.size >= 2,
          ` (${[...auDepart].sort((a, b) => a - b).join(', ')} Hz)`],
        ['DROITE le déplace au pixel près', c.lutin(0).x > depart,
          ` (de ${depart} à ${c.lutin(0).x})`],
        ['la pièce attrapée fait monter le score', c.variable('score') >= 1,
          ` (score ${c.variable('score')})`],
        ['et la fanfare sonne par-dessus, plus aigu', aigus.length > 0,
          ` (${aigus.join(', ')} Hz)`],
      ]
    },
  },


  {
    titre: 'Un personnage de seize',
    difficulte: 4,
    dessin: true,
    idee: 'Huit pixels de côté, c’est petit pour un héros.',
    texte: [
      'Une `Tuile` fait huit pixels de côté. C’est la taille d’une case du décor, et c’est bien pour un mur ou une pièce — mais un personnage y tient mal. Un **`Perso`** en fait **seize sur seize** : seize rangées de seize signes, écrites comme celles d’une tuile.',
      '**Le matériel, lui, ne connaît que des carrés de huit.** Un `Perso` occupe donc QUATRE numéros de tuile, dans cet ordre : haut-gauche, haut-droite, bas-gauche, bas-droite. Si `HEROS` vaut 44, il tient les numéros 44, 45, 46 et 47 — et le dessin suivant du programme commence à 48.',
      '`sprite16(n, x, y, HEROS)` pose les **quatre lutins en un seul appel**, en carré, au pixel près. Le prix est dit franchement : il coûte quatre lutins des quarante, là où un `sprite()` n’en coûte qu’un. Une troupe de dix personnages de seize, c’est déjà tout le matériel. `cacher16(n)` les ôte tous les quatre.',
      '**Sur le fond, il n’y a pas de `poser16()`** — une case du décor fait huit pixels, et le personnage en couvre quatre. On pose donc ses quarts un par un, et l’ordre est celui des numéros : `poser(10, 8, HEROS); poser(11, 8, HEROS + 1); poser(10, 9, HEROS + 2); poser(11, 9, HEROS + 3);`. C’est ce que fait le programme ci-dessous, en plus du lutin.',
      'Dans l’atelier, **« + perso 16 × 16 »** en ajoute un, et la grille passe à seize sur seize. Le reste ne change pas : on peint, et le programme se réécrit.',
    ],
    code: `Perso HEROS = {
  "....####........",
  "..##++++##......",
  ".#++++++++#.....",
  ".#+#--#+#+#.....",
  ".#+#--#+#+#.....",
  ".#++++++++#.....",
  ".#++++++++#.....",
  ".#++++++++#.....",
  ".#++++++++#.....",
  ".#+#+#+#+#+#....",
  "..#.#.#.#.#.....",
  "................",
  "................",
  "................",
  "................",
  "................",
};

uint8_t x = 60;


int main() {
  texte(1, 1, "GAUCHE DROITE");

  /* Le même personnage, POSÉ sur le fond : ses quatre quarts, un par case. */
  poser(10, 8, HEROS);
  poser(11, 8, HEROS + 1);
  poser(10, 9, HEROS + 2);
  poser(11, 9, HEROS + 3);

  while (true) {
    image();

    if (bouton(DROITE) && x < 144) x++;
    if (bouton(GAUCHE) && x > 8) x--;

    /* En lutin : quatre lutins posés en carré, en un seul appel. */
    sprite16(0, x, 100, HEROS);
  }

  return 0;
}
`,
    aVoir: 'Un héros posé sur le décor, et le même en lutin plus bas — GAUCHE et DROITE le déplacent au pixel près.',
    controle: (c) => {
      /* Les quatre quarts, sur le fond : leurs numéros doivent se suivre dans
         l'ordre haut-gauche, haut-droite, bas-gauche, bas-droite. */
      const quarts = [c.lire(10, 8), c.lire(11, 8), c.lire(10, 9), c.lire(11, 9)]

      const depart = c.lutin(0).x
      c.presser('right', 20)

      return [
        ['le titre est écrit', c.mot(1, 1, 13) === 'GAUCHE DROITE'],
        ['les quatre quarts sont posés sur le fond, dans l’ordre',
          quarts.every((t, i) => t === quarts[0] + i), ` (tuiles ${quarts.join(', ')})`],
        ['sprite16() a rempli QUATRE lutins',
          [0, 1, 2, 3].every((n) => c.lutin(n).tuile === quarts[0] + n),
          ` (tuiles ${[0, 1, 2, 3].map((n) => c.lutin(n).tuile).join(', ')})`],
        ['ils sont posés en carré',
          c.lutin(1).x === c.lutin(0).x + 8 && c.lutin(2).y === c.lutin(0).y + 8],
        ['DROITE déplace le personnage entier', c.lutin(0).x > depart,
          ` (de ${depart} à ${c.lutin(0).x})`],
      ]
    },
  },

]


/*
 * Triées de la plus facile à la plus difficile.
 *
 * « sort » de JavaScript est stable depuis longtemps : les leçons d'une même
 * difficulté gardent l'ordre dans lequel elles sont écrites plus haut.
 */
/*
 * Les cinquante-cinq tutoriels rejoignent les vingt-cinq leçons ici, et non dans
 * la page : un lecteur ne doit pas avoir à savoir dans quel fichier une leçon
 * a été écrite pour la trouver. Le tri par difficulté les entremêle, ce qui
 * est exactement le but — on avance par niveau, pas par provenance.
 */
export const LECONS = [...ECRITES, ...TUTORIELS].sort((a, b) => a.difficulte - b.difficulte)

/**
 * Le numéro qu'on AFFICHE, pour chaque leçon d'une liste.
 *
 * Une leçon « suite » prend celui de la précédente, plus un point : 1, 1.1,
 * 2… Compter sur l'index aurait décalé toutes les leçons suivantes d'un cran.
 * Toutes les pages et le livret passent par ici, pour dire le même numéro.
 */
export function numeros(liste) {
  let n = 0
  let s = 0
  let zero = 0 // le chapitre 0 compte à part : 0.0, 0.1, 0.2…
  /* Dans le chapitre 0, une leçon « suite » est un intermédiaire de la
     précédente : après le 0.35 viennent le 0.35.1, le 0.35.2, et le numéro
     suivant reste 0.36 — les renvois « le 0.36 » ne bougent pas. */
  return liste.map((l) => {
    if (l.difficulte === 0) return l.suite ? `0.${zero - 1}.${++s}` : (s = 0, `0.${zero++}`)
    return l.suite ? `${n}.${++s}` : (s = 0, String(++n))
  })
}

/**
 * La partie d'une leçon, dans un niveau : { lettre, nom }, ou null.
 *
 * Le chapitre 0 compte près de trois cents leçons : sous un seul titre, on
 * ne s'y retrouve plus. Il est donc coupé en parties — « Écrire des lettres »,
 * « Le temps », « Déplacer une lettre »… Comme le niveau, la partie n'est
 * écrite que sur la leçon qui l'OUVRE (`partie: 'Le temps'`) : on remonte
 * jusqu'à elle, sans sortir du niveau. Les lettres A, B, C… se comptent
 * toutes seules ; les numéros des leçons, eux, ne changent pas.
 */
export function partieDe(liste, index) {
  // Le niveau de la leçon demandée (0 pour le chapitre 0, 1 à 10 ensuite).
  // On ne cherchera sa partie QUE dans ce niveau.
  const niveau = liste[index].difficulte

  // 1. Trouver la leçon qui OUVRE la partie : on part de la leçon demandée
  //    et l'on recule d'une leçon à la fois (ouverture--), tant que
  //    - on n'est pas sorti du début de la liste (ouverture >= 0),
  //    - on est encore dans le même niveau,
  //    - et la leçon regardée ne porte pas de « partie: '…' ».
  //    Exemple : pour le 0.13.2, on recule 0.13.1, 0.13, 0.12.2, 0.12.1,
  //    puis on s'arrête sur le 0.12, qui porte « partie: 'Le temps' ».
  let ouverture = index
  while (ouverture >= 0 && liste[ouverture].difficulte === niveau && !liste[ouverture].partie) ouverture--

  // Si l'on est sorti de la liste, ou du niveau, sans rien trouver, ce
  // niveau n'est pas coupé en parties (les niveaux 1 à 10) : pas de partie.
  if (ouverture < 0 || liste[ouverture].difficulte !== niveau) return null

  // 2. La lettre : combien de parties s'ouvrent AVANT celle-ci, dans le
  //    même niveau ? 0 → A, 1 → B, 2 → C… On recule encore depuis la leçon
  //    d'ouverture, et l'on compte chaque « partie: » rencontrée.
  //    Exemple : avant « Le temps » (0.12), il n'y a que « Écrire des
  //    lettres » (0.0) : rang = 1, donc la lettre B.
  let rang = 0
  for (let i = ouverture - 1; i >= 0 && liste[i].difficulte === niveau; i--) if (liste[i].partie) rang++

  // 65 est le code de la lettre A : 65 + 0 = « A », 65 + 1 = « B »…
  // Le nom est celui écrit sur la leçon d'ouverture.
  return { lettre: String.fromCharCode(65 + rang), nom: liste[ouverture].partie }
}

/** Combien de leçons « pleines » : le « sur N » de « leçon 3 sur N ». */
export const principales = (liste) => liste.filter((l) => !l.suite && l.difficulte !== 0).length

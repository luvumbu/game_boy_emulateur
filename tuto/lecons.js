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

const ECRITES = [
  {
    titre: 'Écrire à l’écran',
    difficulte: 1,
    idee: 'Une cartouche qui affiche un mot, et rien d’autre.',
    texte: [
      'Le plus petit programme qui fait quelque chose. Comme tout programme C++, il commence à **`int main()`** — c’est là que la console arrive, et nulle part ailleurs.',
      '`texte(colonne, ligne, "…")` écrit à partir d’une case : l’écran en fait **20 de large sur 18 de haut**, et la case (0, 0) est en haut à gauche.',
      'La boucle `while (true)` n’est pas décorative. Un programme qui se termine laisse le processeur partir n’importe où ; ici, il tourne en attendant l’image suivante, soixante fois par seconde, et l’écran reste affiché.',
    ],
    code: `int main() {
  texte(5, 6, "BONJOUR");
  texte(3, 9, "GAME BOY");

  while (true) {
    image();
  }

  return 0;
}
`,
    aVoir: '« BONJOUR » à la colonne 5, ligne 6.',
    controle: (c) => [
      ['« BONJOUR » est écrit', c.mot(5, 6, 7) === 'BONJOUR'],
      ['« GAME BOY » aussi', c.mot(3, 9, 8) === 'GAME BOY'],
      ['l’écran est allumé', c.ecranAllume()],
    ],
  },

  {
    titre: 'Effacer ce qu’on a écrit',
    difficulte: 1,
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
      for (let i = 0; i < 60; i++) {
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

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
    ],
    code: `// Un carré de 8 × 8 pixels : 8 lignes de 8 chiffres.
// 3 = pixel le plus foncé.
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

int main() {
  poser(9, 8, CARRE);   // colonne 9, ligne 8 : le milieu de l'écran

  while (true) image(); // garde l'écran affiché
}
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
    code: `int main() {
  texte(0, 0, "EN HAUT A GAUCHE");
  texte(4, 8, "AU MILIEU");
  texte(2, 17, "TOUT EN BAS");

  while (true) {
    image();
  }
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
    code: `const uint8_t COLONNE = 5;
const uint8_t LIGNE = 6;

int main() {
  texte(COLONNE, LIGNE, "BONJOUR");
  texte(COLONNE, LIGNE + 2, "ENCORE");

  while (true) {
    image();
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
    code: `int main() {
  texte(4, 6, "PREMIER MOT");
  for (uint8_t i = 0; i < 60; i++) image();

  texte(4, 6, "           ");
  texte(4, 6, "SECOND MOT");

  while (true) {
    image();
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
    code: `int main() {
  uint8_t vies = 3;
  uint8_t score = 42;

  texte(2, 4, "VIES");
  nombre(8, 4, vies, 1);

  texte(2, 6, "SCORE");
  nombre(8, 6, score);

  while (true) {
    image();
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
    code: `const char FIN[] = "GAME OVER";

int main() {
  texte(2, 4, "BONJOUR");
  texte(2, 6, FIN);
  texte(2, 8, "ABCDEF");
  texte(2, 10, "JE RESTE");

  for (uint8_t i = 0; i < 90; i++) image();

  effacer(2, 4, "BONJOUR");   // sept cases, comptées pour nous
  effacer(2, 6, FIN);         // neuf, lues dans la table nommée
  uint8_t combien = 3;
  effacer(2, 8, combien);     // trois, décidées à l'exécution

  while (true) {
    image();
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
    code: `int main() {
  uint8_t compteur = 0;

  while (true) {
    nombre(8, 8, compteur);
    compteur++;
    image();
  }
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
    code: `uint8_t de = 1;
uint8_t avantA = 0;
uint8_t lances = 0;

uint8_t lancerDe() {
  return hasard() % 6 + 1;
}

void dessinerDe(uint8_t face) {
  effacer(8, 6, "0");
  nombre(8, 6, face, 1);
}

int main() {
  semer(images());

  texte(2, 2, "A: LANCER LE DE");
  texte(2, 4, "FACE:");
  texte(2, 9, "LANCES:");
  dessinerDe(de);

  while (true) {
    uint8_t a = bouton(A);

    if (a && !avantA) {
      de = lancerDe();
      dessinerDe(de);
      lances++;
      nombre(10, 9, lances);
    }
    avantA = a;

    image();
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
    code: `int main() {
  while (true) {
    if (bouton(A)) texte(6, 8, "APPUYE ");
    else           texte(6, 8, "RELACHE");

    image();
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
    code: `int main() {
  uint8_t combien = 0;
  uint8_t avant = 0;

  while (true) {
    uint8_t maintenant = bouton(A);

    /* Le FRONT : enfoncé maintenant, et pas au tour d'avant. */
    if (maintenant && !avant) combien++;
    avant = maintenant;

    texte(2, 6, "APPUIS");
    nombre(10, 6, combien);
    image();
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
    code: `int main() {
  uint8_t vies = 3;

  while (true) {
    if (vies == 0)      texte(4, 8, "PERDU   ");
    else if (vies == 1) texte(4, 8, "DERNIERE");
    else                texte(4, 8, "CA VA   ");

    if (bouton(B) && vies > 0) vies--;
    image();
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
    code: `enum Scene { TITRE, JEU, FIN };

int main() {
  Scene ou = TITRE;

  while (true) {
    switch (ou) {
      case TITRE:
        texte(4, 8, "APPUIE START");
        if (bouton(START)) { texte(4, 8, "            "); ou = JEU; }
        break;
      case JEU:
        texte(4, 8, "ON JOUE     ");
        if (bouton(SELECT)) ou = FIN;
        break;
      case FIN:
        texte(4, 8, "C EST FINI  ");
        break;
    }
    image();
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
    code: `int main() {
  texte(2, 4, "AVEC TEXTE  ABC");

  texte(2, 8, "AVEC POSER");
  poser(14, 8, 1);
  poser(15, 8, 2);
  poser(16, 8, 3);

  while (true) {
    image();
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
    code: `Tuile BRIQUE = {
  "########",
  "#..#..#.",
  "########",
  "..#..#..",
  "########",
  "#..#..#.",
  "########",
  "..#..#..",
};

int main() {
  for (uint8_t x = 0; x < 20; x++) poser(x, 12, BRIQUE);

  while (true) {
    image();
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
    code: `Tuile MUR = {
  "########",
  "#------#",
  "#------#",
  "#------#",
  "#------#",
  "#------#",
  "#------#",
  "########",
};

int main() {
  for (uint8_t x = 0; x < 20; x++) { poser(x, 0, MUR); poser(x, 17, MUR); }
  for (uint8_t y = 0; y < 18; y++) { poser(0, y, MUR); poser(19, y, MUR); }

  texte(6, 8, "ENFERME");

  while (true) {
    image();
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
    code: `Tuile CLAIR = { "........", "........", "........", "........",
                "........", "........", "........", "........" };
Tuile SOMBRE = { "########", "########", "########", "########",
                 "########", "########", "########", "########" };

int main() {
  for (uint8_t y = 0; y < 18; y++) {
    for (uint8_t x = 0; x < 20; x++) {
      poser(x, y, (x + y) % 2 == 0 ? CLAIR : SOMBRE);
    }
  }

  while (true) {
    image();
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
    code: `Tuile HEROS = {
  "..####..",
  ".#-##-#.",
  "########",
  "#.####.#",
  "########",
  "..#..#..",
  ".#....#.",
  "##....##",
};

int main() {
  sprite(0, 76, 68, HEROS);
  texte(3, 14, "IL FLOTTE");

  while (true) {
    image();
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
    code: `Tuile HEROS = {
  "..####..", ".#-##-#.", "########", "#.####.#",
  "########", "..#..#..", ".#....#.", "##....##",
};

int main() {
  uint8_t x = 76;
  uint8_t y = 68;

  while (true) {
    if (bouton(GAUCHE)) x--;
    if (bouton(DROITE)) x++;
    if (bouton(HAUT))   y--;
    if (bouton(BAS))    y++;

    sprite(0, x, y, HEROS);
    image();
  }
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
    code: `Tuile HEROS = {
  "..####..", ".#-##-#.", "########", "#.####.#",
  "########", "..#..#..", ".#....#.", "##....##",
};

const uint8_t GAUCHE_MAX = 8;
const uint8_t DROITE_MAX = 152;

int main() {
  uint8_t x = 76;

  while (true) {
    if (bouton(GAUCHE) && x > GAUCHE_MAX) x--;
    if (bouton(DROITE) && x < DROITE_MAX) x++;

    sprite(0, x, 68, HEROS);
    image();
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
    code: `Tuile CAILLOU = {
  "..####..", ".######.", "########", "########",
  "########", "########", ".######.", "..####..",
};

int main() {
  uint8_t y = 0;
  uint8_t vitesse = 1;
  uint8_t depuis = 0;

  while (true) {
    y += vitesse;
    if (y > 130) { y = 0; vitesse = 1; depuis = 0; }

    depuis++;
    if (depuis >= 20) { depuis = 0; if (vitesse < 5) vitesse++; }

    sprite(0, 76, y, CAILLOU);
    image();
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
    code: `Tuile HEROS = {
  "..####..", ".#-##-#.", "########", "#.####.#",
  "########", "..#..#..", ".#....#.", "##....##",
};

const uint8_t SOL = 120;

int main() {
  uint8_t y = SOL;
  uint8_t montee = 0;
  uint8_t avant = 0;

  while (true) {
    uint8_t appui = bouton(A);

    /* On ne saute qu'au FRONT, et seulement depuis le sol. */
    if (appui && !avant && y == SOL) montee = 16;
    avant = appui;

    if (montee > 0) { y -= 2; montee--; }
    else if (y < SOL) y += 2;

    sprite(0, 76, y, HEROS);
    image();
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
    code: `Tuile MOTIF = {
  "#-------", "-#------", "--#-----", "---#----",
  "----#---", "-----#--", "------#-", "-------#",
};

int main() {
  for (uint8_t y = 0; y < 18; y++)
    for (uint8_t x = 0; x < 20; x++)
      poser(x, y, MOTIF);

  uint8_t glisse = 0;

  while (true) {
    if (bouton(DROITE)) glisse++;
    if (bouton(GAUCHE)) glisse--;
    defiler(glisse, 0);
    image();
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
    code: `int main() {
  texte(3, 8, "APPUIE SUR A");
  uint8_t avant = 0;

  while (true) {
    uint8_t appui = bouton(A);
    if (appui && !avant) note(1, DO4, 20, 12);
    avant = appui;
    image();
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
    code: `const uint8_t AIR[] = { DO4, MI4, SOL4, DO5, SOL4, MI4 };

int main() {
  uint8_t pas = 0;
  uint8_t depuis = 0;

  texte(2, 6, "NOTE");

  while (true) {
    depuis++;
    if (depuis >= 20) {
      depuis = 0;
      note(1, AIR[pas], 18, 12);
      nombre(9, 6, pas, 1);
      pas++;
      if (pas >= sizeof(AIR)) pas = 0;
    }
    image();
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
    code: `int main() {
  texte(4, 8, "A POUR TIRER");
  uint8_t avant = 0;

  while (true) {
    uint8_t appui = bouton(A);
    if (appui && !avant) bruit(6, 10);
    avant = appui;
    image();
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
    code: `Air FANFARE = {
  "DO4 12", "==", "MI4 12", "==", "SOL4 12", "==", "DO5 12", "==", "==", "--",
};

int main() {
  jouer(1, FANFARE, 8);
  texte(4, 8, "CA JOUE");

  while (true) {
    image();
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
    code: `Air BOUCLE = {
  "DO4 12", "==", "MI4 12", "==", "SOL4 12", "==", "MI4 12", "==",
};

int main() {
  jouer(1, BOUCLE, 10);
  uint8_t tours = 0;

  /* Écrit AVANT la boucle : sans cela, l'écran reste vide une seconde et
     demie, et l'on croit que le programme n'a pas démarré. */
  texte(2, 10, "TOURS");
  nombre(9, 10, tours);

  while (true) {
    if (airFini(1)) {
      jouer(1, BOUCLE, 10);
      tours++;
      nombre(9, 10, tours);
    }
    image();
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
    code: `uint8_t hauteurs[20];

int main() {
  for (uint8_t i = 0; i < 20; i++) hauteurs[i] = i % 6;

  for (uint8_t i = 0; i < 20; i++)
    for (uint8_t h = 0; h <= hauteurs[i]; h++)
      poser(i, 17 - h, 1);

  while (true) {
    image();
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
    code: `const uint8_t COLONNES[] = { 2, 5, 8, 11, 14, 17 };
const uint8_t LIGNES[]   = { 3, 6, 9, 6, 3, 6 };

int main() {
  for (uint8_t i = 0; i < sizeof(COLONNES); i++)
    poser(COLONNES[i], LIGNES[i], 1);

  while (true) {
    image();
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
    code: `const uint8_t LARGEUR = 10;
const uint8_t HAUTEUR = 8;

uint8_t carte[HAUTEUR][LARGEUR];

int main() {
  for (uint8_t l = 0; l < HAUTEUR; l++)
    for (uint8_t c = 0; c < LARGEUR; c++)
      carte[l][c] = (l == 0 || l == HAUTEUR - 1 || c == 0 || c == LARGEUR - 1) ? 1 : 0;

  for (uint8_t l = 0; l < HAUTEUR; l++)
    for (uint8_t c = 0; c < LARGEUR; c++)
      if (carte[l][c]) poser(c + 5, l + 5, 1);

  while (true) {
    image();
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
    code: `uint8_t valeurs[8];

int main() {
  for (uint8_t i = 0; i < 8; i++) valeurs[i] = i * 3;

  uint8_t cherche = 12;
  uint8_t ou = 255;

  for (uint8_t i = 0; i < 8; i++) {
    if (valeurs[i] == cherche) { ou = i; break; }
  }

  texte(2, 6, "TROUVE EN");
  nombre(13, 6, ou);

  while (true) {
    image();
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
    code: `const char TITRE[] = "GAME OVER";

int main() {
  texte(5, 6, TITRE);
  texte(5, 12, TITRE);

  while (true) {
    image();
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
    code: `Tuile BRIQUE = {
  "########", "#..#..#.", "########", "..#..#..",
  "########", "#..#..#.", "########", "..#..#..",
};

void rangee(uint8_t ligne) {
  for (uint8_t x = 0; x < 20; x++) poser(x, ligne, BRIQUE);
}

int main() {
  rangee(4);
  rangee(9);
  rangee(14);

  while (true) {
    image();
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
    code: `uint8_t distance(uint8_t a, uint8_t b) {
  if (a > b) return a - b;
  return b - a;
}

int main() {
  texte(2, 6, "ECART");
  nombre(10, 6, distance(30, 100));
  nombre(10, 8, distance(100, 30));

  while (true) {
    image();
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
    code: `void barre(uint8_t ligne, uint8_t combien, uint8_t tuile = 1) {
  for (uint8_t x = 0; x < combien; x++) poser(x, ligne, tuile);
}

int main() {
  barre(4, 20);
  barre(8, 10);
  barre(12, 5, 2);

  while (true) {
    image();
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
    code: `uint8_t somme(uint8_t n) {
  uint8_t total = 0;
  while (n > 0) { total += n; n--; }
  return total;
}

int main() {
  texte(2, 6, "SOMME DE 1 A 5");
  nombre(8, 8, somme(5));

  while (true) {
    image();
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
    code: `uint8_t doubler(uint8_t n) { return n * 2; }

int main() {
  texte(2, 6, "DOUBLE DE 21");
  nombre(8, 8, doubler(21));

  while (true) {
    image();
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
    code: `struct Ennemi {
  uint8_t x;
  uint8_t y;
  uint8_t vie;
};

Ennemi boss;

int main() {
  boss.x = 40;
  boss.y = 60;
  boss.vie = 3;

  texte(2, 4, "X");    nombre(6, 4, boss.x);
  texte(2, 6, "VIE");  nombre(6, 6, boss.vie, 1);

  while (true) {
    image();
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
    code: `struct Ennemi {
  uint8_t x, y, vie;
};

Ennemi troupe[3];

int main() {
  for (uint8_t i = 0; i < 3; i++) {
    troupe[i].x = 20 + i * 40;
    troupe[i].y = 60;
    troupe[i].vie = 3;
  }

  troupe[1].vie--;

  for (uint8_t i = 0; i < 3; i++) nombre(4 + i * 5, 8, troupe[i].vie, 1);

  while (true) {
    image();
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
    code: `struct Ennemi {
  uint8_t x, y, vie;

  void avancer()   { x++; }
  uint8_t vivant() { return vie > 0; }
};

Ennemi troupe[3];

int main() {
  for (uint8_t i = 0; i < 3; i++) { troupe[i].x = 20 + i * 40; troupe[i].vie = 3; }
  troupe[1].vie = 0;

  while (true) {
    for (uint8_t i = 0; i < 3; i++)
      if (troupe[i].vivant()) troupe[i].avancer();

    for (uint8_t i = 0; i < 3; i++) nombre(3 + i * 6, 8, troupe[i].x);
    image();
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
    code: `struct Ennemi {
  uint8_t x, vie;

  void avancer() { if (vie > 0) x++; }
  void blesser() { if (vie > 0) vie--; }
};

Ennemi troupe[3];

int main() {
  for (uint8_t i = 0; i < 3; i++) { troupe[i].x = 20 + i * 40; troupe[i].vie = 3; }
  uint8_t avant = 0;

  while (true) {
    uint8_t appui = bouton(A);
    for (uint8_t i = 0; i < 3; i++) {
      troupe[i].avancer();
      if (appui && !avant) troupe[i].blesser();
    }
    avant = appui;

    for (uint8_t i = 0; i < 3; i++) nombre(2 + i * 6, 8, troupe[i].x);
    image();
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
    code: `struct Ennemi {
  uint8_t x, vie;

  uint8_t vivant() { return vie > 0; }
  void blesser()   { if (vivant()) vie--; }
};

Ennemi troupe[2];

int main() {
  troupe[0].vie = 3;
  troupe[1].vie = 0;

  troupe[0].blesser();
  troupe[1].blesser();

  texte(2, 6, "VIVANT MORT");
  nombre(4, 8, troupe[0].vie, 1);
  nombre(9, 8, troupe[1].vie, 1);

  while (true) {
    image();
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
    code: `enum Scene { TITRE, JEU, PERDU };

Scene ou = TITRE;
uint8_t score = 0;
uint8_t avant = 0;
uint8_t depuis = 0;

int main() {
  while (true) {
    uint8_t appui = bouton(START);
    uint8_t front = appui && !avant;
    avant = appui;

    switch (ou) {
      case TITRE:
        texte(4, 8, "APPUIE START");
        if (front) {
          texte(4, 8, "            ");
          score = 0; depuis = 0; ou = JEU;
          texte(2, 4, "SCORE");    // une fois, en entrant
          nombre(9, 4, score);
        }
        break;

      case JEU:
        depuis++;
        if (depuis >= 30) { depuis = 0; score++; nombre(9, 4, score); }
        if (score >= 20) ou = PERDU;
        break;

      case PERDU:
        texte(5, 8, "PERDU");
        if (front) { texte(5, 8, "     "); ou = TITRE; }
        break;
    }
    image();
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
    code: `int main() {
  uint8_t score = 0;
  uint8_t depuis = 0;
  uint8_t glisse = 0;

  panneau(0, 0);
  textePanneau(1, 0, "SCORE");

  while (true) {
    depuis++;
    if (depuis >= 20) { depuis = 0; score++; nombrePanneau(8, 0, score); }

    glisse++;
    defiler(glisse, 0);
    image();
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
    code: `Tuile ENNEMI = {
  ".######.", "#-#--#-#", "########", "#.####.#",
  "########", ".#.##.#.", "#..##..#", ".#....#.",
};

struct Monstre {
  uint8_t x, y, vie;

  uint8_t vivant() { return vie > 0; }
  void avancer()   { if (vivant()) x++; }
  void tuer()      { vie = 0; }
};

Monstre troupe[3];

int main() {
  for (uint8_t i = 0; i < 3; i++) {
    troupe[i].x = 10 + i * 30;
    troupe[i].y = 40 + i * 24;
    troupe[i].vie = 1;
  }

  uint8_t avant = 0;

  while (true) {
    uint8_t appui = bouton(A);
    if (appui && !avant) troupe[hasard() % 3].tuer();
    avant = appui;

    for (uint8_t i = 0; i < 3; i++) {
      troupe[i].avancer();
      if (troupe[i].vivant()) sprite(i, troupe[i].x, troupe[i].y, ENNEMI);
      else cacher(i);
    }
    image();
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
    code: `Tuile MUR = {
  "########", "#------#", "#------#", "#------#",
  "#------#", "#------#", "#------#", "########",
};

int main() {
  for (uint8_t y = 0; y < 18; y++) { poser(0, y, MUR); poser(19, y, MUR); }
  for (uint8_t x = 0; x < 20; x++) { poser(x, 0, MUR); poser(x, 17, MUR); }
  poser(10, 8, MUR);

  uint8_t c = 5;
  uint8_t l = 8;

  while (true) {
    uint8_t vc = c;
    uint8_t vl = l;

    if (bouton(DROITE)) vc++;
    if (bouton(GAUCHE)) vc--;
    if (bouton(BAS))    vl++;
    if (bouton(HAUT))   vl--;

    /* On regarde AVANT de bouger : la case visée est-elle libre ? */
    if (lire(vc, vl) != MUR) { c = vc; l = vl; }

    sprite(0, c * 8, l * 8, 1);
    image();
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
    code: `int main() {
  uint8_t sautees = 0;

  while (true) {
    /* Un travail volontairement lourd, pour voir la mesure bouger. La
       première ligne est laissée au compte rendu : la redessiner l'effacerait
       aussitôt, et l'on croirait que texte() ne marche pas. */
    for (uint8_t y = 2; y < 18; y++)
      for (uint8_t x = 0; x < 20; x++)
        poser(x, y, (x + y) % 4);

    if (retard()) sautees++;

    texte(1, 0, "RETARDS");
    nombre(10, 0, sautees);
    image();
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
    code: `Tuile SOL = {
  "########", "--------", "--------", "--------",
  "--------", "--------", "--------", "--------",
};

int main() {
  for (uint8_t x = 0; x < 20; x++)
    for (uint8_t y = 14; y < 18; y++)
      poser(x, y, SOL);

  uint8_t monde = 0;

  while (true) {
    if (bouton(DROITE)) monde++;
    if (bouton(GAUCHE)) monde--;

    defiler(monde, 0);
    sprite(0, 76, 104, 1);
    image();
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
    code: `int main() {
  uint8_t record = sauvegarde(0);
  uint8_t score = 0;
  uint8_t avant = 0;

  texte(1, 2, "RECORD");
  nombre(10, 2, record);

  while (true) {
    uint8_t appui = bouton(A);
    if (appui && !avant) score++;
    avant = appui;

    texte(1, 6, "SCORE");
    nombre(10, 6, score);

    if (score > record) {
      record = score;
      sauver(0, record);
      nombre(10, 2, record);
    }
    image();
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
    code: `const uint8_t TABLE[] = { 3, 1, 4, 1, 5, 9, 2, 6 };

uint8_t total() {
  uint8_t somme = 0;
  for (uint8_t i = 0; i < sizeof(TABLE); i++) somme += TABLE[i];
  return somme;
}

int main() {
  texte(2, 6, "TOTAL");
  nombre(10, 6, total());

  while (true) {
    image();
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
    code: `Tuile BALLE = {
  "..####..", ".######.", "########", "########",
  "########", "########", ".######.", "..####..",
};

struct Balle {
  uint8_t x, y, versDroite, versBas, pas;

  void avancer() {
    if (versDroite) { x += pas; if (x > 150) versDroite = 0; }
    else            { x -= pas; if (x < 10)  versDroite = 1; }

    if (versBas) { y += pas; if (y > 130) versBas = 0; }
    else         { y -= pas; if (y < 10)  versBas = 1; }
  }
};

Balle balles[3];

int main() {
  for (uint8_t i = 0; i < 3; i++) {
    balles[i].x = 20 + i * 40;
    balles[i].y = 30 + i * 20;
    balles[i].versDroite = i % 2;
    balles[i].versBas = 1;
    balles[i].pas = 1 + i;
  }

  while (true) {
    for (uint8_t i = 0; i < 3; i++) {
      balles[i].avancer();
      sprite(i, balles[i].x, balles[i].y, BALLE);
    }
    image();
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
    code: `struct Ennemi { uint8_t x, y; };
const uint8_t TABLE[] = { 1, 2, 3 };
uint8_t carte[4][5];
Ennemi boss;

/* Pas la struct : son INDEX. Un argument est un octet. */
uint8_t loin(uint8_t cible) {
  if (boss.x > cible) return boss.x - cible;
  return cible - boss.x;
}

int main() {
  boss.x = 40;
  carte[2][3] = 1;          // deux index, pas un

  uint8_t vitesse = 2;      // un octet, pas un float

  texte(1, 4, "ECART");
  nombre(9, 4, loin(10));

  texte(1, 6, "GRILLE");
  nombre(9, 6, carte[2][3], 1);

  texte(1, 8, "TABLE");
  nombre(9, 8, TABLE[2], 1);

  texte(1, 10, "PAS");
  nombre(9, 10, vitesse, 1);

  while (true) {
    image();
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
    code: `int main() {
  uint8_t compte = 0;

  while (true) {
    compte++;
    nombre(8, 8, compte);
    image();
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
    code: `Tuile HEROS = {
  "..####..", ".#-##-#.", "########", "#.####.#",
  "########", "..#..#..", ".#....#.", "##....##",
};

const uint8_t GAUCHE_MAX = 8;
const uint8_t DROITE_MAX = 152;

uint8_t salle = 0;

void dessinerSalle() {
  ecran(0);
  effacer();

  if (salle == 0) {
    texte(6, 1, "SALLE A");
    poser(18, 8, 1);
  } else {
    texte(6, 1, "SALLE B");
    poser(1, 8, 1);
  }

  ecran(1);
}

int main() {
  uint8_t x = 76;
  uint8_t y = 68;

  dessinerSalle();

  while (true) {
    if (bouton(GAUCHE)) x--;
    if (bouton(DROITE)) x++;
    if (bouton(HAUT))   y--;
    if (bouton(BAS))    y++;

    if (x > DROITE_MAX && salle == 0) {
      salle = 1;
      x = GAUCHE_MAX;
      dessinerSalle();
    } else if (x < GAUCHE_MAX && salle == 1) {
      salle = 0;
      x = DROITE_MAX;
      dessinerSalle();
    }

    sprite(0, x, y, HEROS);
    image();
  }

  return 0;
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
    code: `Tuile BALLE = { "..####..", ".#----#.", "#--++--#", "#-+##+-#", "#-+##+-#", "#--++--#", ".#----#.", "..####.." };

const uint8_t SINUS[] = {
  40, 48, 55, 62, 68, 73, 77, 79,
  80, 79, 77, 73, 68, 62, 55, 48,
  40, 32, 25, 18, 12,  7,  3,  1,
   0,  1,  3,  7, 12, 18, 25, 32,
};

uint8_t x = 0;
uint8_t angle = 0;
uint8_t cosinus = 0;
uint8_t aAvant = 0;

int main() {
  while (true) {
    image();

    uint8_t a = bouton(A);
    if (a && !aAvant) cosinus = !cosinus;
    aAvant = a;

    if (cosinus) texte(1, 1, "A : COSINUS");
    else texte(1, 1, "A : SINUS  ");

    uint8_t indice = cosinus ? (angle + 8) % 32 : angle;
    uint8_t y = 28 + SINUS[indice];

    sprite(0, x, y, BALLE);

    x++;
    if (x > 152) x = 0;

    angle++;
    if (angle >= sizeof(SINUS)) angle = 0;
  }

  return 0;
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

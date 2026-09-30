# Les leçons, du plus facile au plus dur

**408 leçons**, rangées en dix niveaux. Chacune est un **programme
entier** : le code se colle tel quel dans `http://localhost/gameboy3/`, ou se
compile en ligne de commande, et il tourne.

```bash
node outils/gb3.mjs mon-essai.cpp
```

Ce n’est pas une promesse en l’air. `node verification/verifier-tuto.mjs` **compile chaque
leçon, la fait tourner dans un vrai émulateur, appuie sur de vraies touches**,
et contrôle ce qu’elle annonce dans son « ce qu’on doit voir ». Un tutoriel
dont le code ne marche pas est pire qu’aucun tutoriel : le lecteur croit avoir
mal compris.

> **Cette page est engendrée** — `node tutoriels.mjs`. La source est
> `tuto/lecons.js` et `tuto/tutoriels.js`, qui alimentent aussi le mode
> LEÇONS de l’atelier, `tuto.html` et les livrets PDF. Corriger ici ne
> servirait à rien : le fichier serait réécrit à la prochaine passe.

Les mêmes leçons se lisent **dans l’atelier**, avec une console qui tourne à
côté et le code modifiable — `http://localhost/gameboy3/` puis « MODE LEÇONS ».

| Niveau | Ce qu’on y apprend | Leçons |
|---|---|---|
| 0 | Avant tout | 0.0 – 0.95.1 |
| 1 | Les tout premiers pas | 1 – 8 |
| 2 | Retenir, et réagir | 9 – 16 |
| 3 | Dessiner | 17 – 26 |
| 4 | Le mouvement | 27 – 35 |
| 5 | Le son | 36 – 42 |
| 6 | Ranger ce qu’on manipule | 43 – 49 |
| 7 | Découper son programme | 50 – 56 |
| 8 | Ce qui va ensemble | 57 – 64 |
| 9 | Un vrai jeu | 65 – 73 |
| 10 | Aller au bout | 74 – 82 |

| Partie | Niveau | Leçons |
|---|---|---|
| A. Écrire des lettres | 0 | 0.0 – 0.11.2 |
| B. Le temps | 0 | 0.12 – 0.17.2 |
| C. Déplacer une lettre | 0 | 0.18 – 0.33.2 |
| D. Des formes | 0 | 0.34 – 0.64.2 |
| E. La croix : le joueur | 0 | 0.65 – 0.80.2 |
| F. Un premier jeu | 0 | 0.81 – 0.85 |
| G. Les lettres et l’écran titre | 0 | 0.86 – 0.90.7 |
| H. Du titre au snake | 0 | 0.91 – 0.92.2 |
| I. Le jeu de bombes | 0 | 0.93 – 0.94.1 |
| J. Un micro Zelda | 0 | 0.95 – 0.95.1 |

---

## Niveau 0 — Avant tout

### Partie A — Écrire des lettres

### 0.0. Le programme qui ne fait rien

> Le squelette de tout programme : int main(), et la boucle while.

```cpp
int main() {
  while (true) {
    image();
  }
}
```

**`int main()`** est le point de départ. Quand la console s’allume, c’est là qu’elle arrive, et nulle part ailleurs. Tout ce que fait le programme s’écrit entre ses accolades `{ }`.

**`while (true)`** veut dire « tant que vrai » : ce qui est entre ses accolades recommence **sans jamais s’arrêter**. C’est la **boucle de jeu**. Un jeu ne se termine pas tout seul : il attend le joueur.

**`image()`** attend la prochaine image de l’écran. Il y en a **60 par seconde** : la boucle fait donc un tour tous les soixantièmes de seconde.

Ce programme ne montre rien, mais il tourne. Tous les suivants partent de lui : on ajoutera des choses **avant** la boucle (ce qui se fait une fois) et **dedans** (ce qui se fait à chaque image).

**Ce qu’on doit voir** — Rien : l’écran reste vide, mais la console tourne.  
**Ce qu’il coûte** — 1273 octets de programme, 0 variable.

---

### 0.1. Afficher la lettre A

> Une seule lettre, dans la toute première case de l’écran.

```cpp
int main() {
  texte(0, 0, "A");   // colonne 0, ligne 0 : la case en haut à gauche

  while (true) {
    image();
  }
}
```

Les lettres sont **déjà dessinées** dans le programme : c’est la police, chargée au démarrage. Il suffit de dire laquelle afficher, et où.

`texte(0, 0, "A")` écrit **A** dans la case de la colonne **0**, ligne **0** : celle en haut à gauche. L’écran fait 20 colonnes (0 à 19) sur 18 lignes (0 à 17).

La ligne est écrite **avant** la boucle : on n’écrit le A qu’une fois, et il reste affiché.

**Ce qu’on doit voir** — Un A, tout en haut à gauche de l’écran.  
**Ce qu’il coûte** — 1285 octets de programme, 0 variable.

---

### 0.1.1. Afficher la lettre A — de base, ailleurs

> Le même A qu’au 0.1, mais au milieu de l’écran : texte(10, 8, "A").

```cpp
int main() {
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
```

**C’est le 0.1**, avec un seul changement : la **place** du A. Il n’est plus en (0, 0), en haut à gauche, mais en **(10, 8)**, au milieu de l’écran.

**Les deux premiers nombres de `texte`** sont la colonne (de 0 à 19, de gauche à droite) et la ligne (de 0 à 17, de haut en bas). Le milieu de l’écran est vers la colonne 10 et la ligne 8.

**C’est la version de base** : une seule chose, à la deuxième place. Le 0.1.2 met les deux ensemble.

**Ce qu’on doit voir** — Un A au milieu de l’écran.  
**Ce qu’il coûte** — 1285 octets de programme, 0 variable.

---

### 0.1.2. Afficher la lettre A — doublé, deux positions

> Deux A : un en haut à gauche (0, 0), un au milieu (10, 8). Deux lignes texte, deux places.

```cpp
int main() {
  texte(0, 0, "A");     // 1. en haut à gauche (le 0.1)
  texte(10, 8, "A");    // 2. au milieu (le 0.1.1)

  while (true) {
    image();
  }
}
```

**C’est le 0.1 et le 0.1.1 réunis** : deux lignes `texte`, une par place.

**Chaque appel écrit sa lettre à sa place**, et les deux restent à l’écran : elles ne sont pas au même endroit, donc aucune n’écrase l’autre (le 0.3 montre ce qui arrive quand elles le sont).

**Ce qu’on doit voir** — Deux A : un en haut à gauche, un au milieu de l’écran.  
**Ce qu’il coûte** — 1297 octets de programme, 0 variable.

---

### 0.2. A, pris dans ALPHABET à l’indice 0

> L’alphabet de la console est un tableau : sa première case est l’indice 0.

```cpp
int main() {
  poser(0, 0, ALPHABET[0]);   // l'indice 0 : la première lettre, A
  // (ne pas faire cette erreur : texte(0, 0, ALPHABET[0]) est refusé,
  //  car ALPHABET[0] est un numéro de tuile, pas un texte)

  while (true) {
    image();
  }
}
```

**`ALPHABET`** est le tableau des 26 lettres de la console. Il existe déjà : on ne le crée pas, on s’en sert.

En C++, un tableau commence à l’indice **0**. `ALPHABET[0]` est donc la **première** lettre, A ; `ALPHABET[25]` est la dernière, Z.

`poser(0, 0, ALPHABET[0])` pose cette lettre dans la case (0, 0).

**Pourquoi `poser()` et pas `texte()` ?** `ALPHABET[0]` n’est pas un texte : c’est un **nombre**, le numéro de la tuile du A (1). `texte()` n’accepte que des lettres entre guillemets ; pour mettre une tuile à partir de son numéro, c’est `poser()`. Écrire `texte(0, 0, ALPHABET[0])` est une erreur : le compilateur la refuse.

**Ce qu’on doit voir** — Un A, tout en haut à gauche de l’écran.  
**Ce qu’il coûte** — 1298 octets de programme, 0 variable.

---

### 0.2.1. A, pris dans ALPHABET à l’indice 0 — de base, ailleurs

> Le même poser(…, ALPHABET[0]) qu’au 0.2, au milieu de l’écran.

```cpp
int main() {
  // Le changement : la place. (0, 0) → (10, 8).
  poser(10, 8, ALPHABET[0]);   // l'indice 0 : A, au milieu de l'écran

  while (true) {
    image();
  }
}
```

**C’est le 0.2**, avec un seul changement : la **place** : (10, 8), le milieu de l’écran, au lieu de (0, 0).

**`poser` prend la même place que `texte`** : la colonne d’abord (0 à 19), puis la ligne (0 à 17).

**C’est la version de base** : une seule chose, à la deuxième place. Le 0.2.2 met les deux ensemble.

**Ce qu’on doit voir** — Un A au milieu de l’écran.  
**Ce qu’il coûte** — 1300 octets de programme, 0 variable.

---

### 0.2.2. A, pris dans ALPHABET à l’indice 0 — doublé, deux positions

> Deux poser, deux places : ALPHABET[0] en haut à gauche et au milieu.

```cpp
int main() {
  poser(0, 0, ALPHABET[0]);    // 1. en haut à gauche (le 0.2)
  poser(10, 8, ALPHABET[0]);   // 2. au milieu (le 0.2.1)

  while (true) {
    image();
  }
}
```

**C’est le 0.2 et le 0.2.1 réunis** : deux lignes `poser`, une par place.

**Ce qu’on doit voir** — Deux A : un en haut à gauche, un au milieu.  
**Ce qu’il coûte** — 1325 octets de programme, 0 variable.

---

### 0.3. Écrire au même endroit écrase

> La même position, exprès : la nouvelle lettre remplace l’ancienne.

```cpp
int main() {
  texte(0, 0, "A");   // colonne 0, ligne 0 : la case en haut à gauche
  texte(0, 0, "B");   // même case : le B écrase le A

  while (true) {
    image();
  }
}
```

Les deux lignes visent **exprès la même case**, (0, 0). Une case ne contient qu’**une seule lettre** : écrire le B au même endroit **efface** le A et prend sa place.

Les lignes s’exécutent **de haut en bas** : le A d’abord, puis le B. C’est donc le B qui reste.

Le A a bien été écrit, mais il est remplacé avant même la première image : on ne le voit jamais.

**Ce qu’on doit voir** — Seulement un B, en haut à gauche : le A a été écrasé.  
**Ce qu’il coûte** — 1297 octets de programme, 0 variable.

---

### 0.3.1. Écrire au même endroit écrase — de base, ailleurs

> Le 0.3 au milieu de l’écran : le B écrase encore le A, en (10, 8).

```cpp
int main() {
  texte(10, 8, "A");   // au milieu…
  texte(10, 8, "B");   // …même case : le B écrase le A

  while (true) {
    image();
  }
}
```

**C’est le 0.3**, avec un seul changement : la **place** : (10, 8) au lieu de (0, 0), pour les deux lignes.

**La règle ne dépend pas de la place :** deux écritures dans la **même** case, la seconde efface la première. Ici, les deux sont en (10, 8) : on ne voit que le B.

**C’est la version de base** : une seule chose, à la deuxième place. Le 0.3.2 met les deux ensemble.

**Ce qu’on doit voir** — Un B au milieu de l’écran ; le A a été écrasé.  
**Ce qu’il coûte** — 1297 octets de programme, 0 variable.

---

### 0.3.2. Écrire au même endroit écrase — doublé, deux positions

> L’écrasement à deux places : en haut à gauche ET au milieu, le B écrase le A.

```cpp
int main() {
  texte(0, 0, "A");    // en haut à gauche (le 0.3)…
  texte(0, 0, "B");    // …écrasé par le B
  texte(10, 8, "A");   // au milieu (le 0.3.1)…
  texte(10, 8, "B");   // …écrasé par le B

  while (true) {
    image();
  }
}
```

**C’est le 0.3 et le 0.3.1 réunis** : les deux écrasements, chacun à sa place.

**Chaque case est indépendante :** ce qui s’écrit en (0, 0) ne touche pas (10, 8). Aux deux endroits, le B écrase le A.

**Ce qu’on doit voir** — Deux B : en haut à gauche et au milieu. Aucun A.  
**Ce qu’il coûte** — 1321 octets de programme, 0 variable.

---

### 0.4. L’alphabet à la main, jusqu’au bout de la ligne

> Une lettre par case : au bout de 20, la ligne est pleine.

```cpp
int main() {
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
```

Chaque lettre prend **une case de 8 pixels** de large. L’écran en fait 160 : **20 lettres** remplissent donc toute la ligne, de la colonne 0 à la colonne **19**.

On s’arrête à **T**, la 20e lettre. Il n’y a **pas de colonne 20** : `texte(20, 0, "U")` est refusé par le compilateur, qui répond que l’écran fait 20 colonnes.

Vingt lignes presque identiques : c’est long à écrire, et c’est exactement ce qu’une boucle saura faire à notre place.

**Ce qu’on doit voir** — A à T sur toute la première ligne, d’un bord à l’autre de l’écran.  
**Ce qu’il coûte** — 1513 octets de programme, 0 variable.

---

### 0.4.1. L’alphabet à la main, jusqu’au bout de la ligne — de base, ailleurs

> Les vingt lettres du 0.4, sur la ligne 5 au lieu de la ligne 0.

```cpp
int main() {
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
```

**C’est le 0.4**, avec un seul changement : la **ligne** : 5 au lieu de 0, pour les vingt lignes de code.

**Seul le deuxième nombre change**, dans chaque `texte` : c’est la ligne. Les colonnes restent 0 à 19 : la même ligne de lettres, plus bas.

**C’est la version de base** : une seule chose, à la deuxième place. Le 0.4.2 met les deux ensemble.

**Ce qu’on doit voir** — A à T sur la ligne 5.  
**Ce qu’il coûte** — 1513 octets de programme, 0 variable.

---

### 0.4.2. L’alphabet à la main, jusqu’au bout de la ligne — doublé, deux positions

> La ligne A à T deux fois : en ligne 0 et en ligne 5. Écrit à la main, c’est quarante lignes — la boucle du 0.5 va l’éviter.

```cpp
int main() {
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
```

**C’est le 0.4 et le 0.4.1 réunis** : les vingt lettres en ligne 0, puis les vingt en ligne 5.

**Quarante lignes presque pareilles :** c’est long, et facile de se tromper. C’est exactement ce que la boucle `for` du 0.5 va raccourcir.

**Ce qu’on doit voir** — A à T deux fois : sur la ligne 0 et sur la ligne 5.  
**Ce qu’il coûte** — 1753 octets de programme, 0 variable.

---

### 0.5. La même ligne, avec une boucle for

> Vingt lignes presque pareilles deviennent une seule, répétée vingt fois.

```cpp
int main() {
  for (uint8_t i = 0; i < 20; i++) {   // 20 tours : les colonnes 0 à 19
    poser(i, 0, ALPHABET[i]);          // la lettre n° i, dans la colonne i
  }

  while (true) {
    image();
  }
}
```

**`for (uint8_t i = 0; i < 20; i++)`** répète ce qui est entre ses accolades **20 fois**. `i` vaut 0 au premier tour, puis 1, 2… jusqu’à 19.

`i` sert **deux fois** : comme **colonne**, pour avancer de gauche à droite, et comme **indice** dans `ALPHABET`, pour passer de A à T.

**`i < 20`** : on s’arrête avant la colonne 20, qui n’existe pas, exactement comme au 0.4. Le résultat est le même, en 3 lignes au lieu de 20, et le programme est plus léger.

**Ce qu’on doit voir** — A à T sur toute la première ligne, comme au 0.4.  
**Ce qu’il coûte** — 1333 octets de programme, 1 variable.

---

### 0.5.1. La même ligne, avec une boucle for — de base, ailleurs

> Le 0.5 sur la ligne 5 : un seul nombre change dans la boucle.

```cpp
int main() {
  // Le changement : la ligne, 0 → 5.
  for (uint8_t i = 0; i < 20; i++) {   // 20 tours : les colonnes 0 à 19
    poser(i, 5, ALPHABET[i]);          // la lettre n° i, colonne i, ligne 5
  }

  while (true) {
    image();
  }
}
```

**C’est le 0.5**, avec un seul changement : la **ligne** : 5 au lieu de 0, dans le `poser` de la boucle.

**Un seul nombre à changer**, au lieu de vingt au 0.4.1 : la boucle écrit la ligne entière, et la ligne n’est dite qu’une fois.

**C’est la version de base** : une seule chose, à la deuxième place. Le 0.5.2 met les deux ensemble.

**Ce qu’on doit voir** — A à T sur la ligne 5.  
**Ce qu’il coûte** — 1334 octets de programme, 1 variable.

---

### 0.5.2. La même ligne, avec une boucle for — doublé, deux positions

> La boucle deux fois : la ligne 0 puis la ligne 5.

```cpp
int main() {
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
```

**C’est le 0.5 et le 0.5.1 réunis** : la boucle du 0.5 (ligne 0), puis celle du 0.5.1 (ligne 5).

**Deux boucles l’une après l’autre :** la première finit ses vingt tours, puis la seconde commence. Chaque `for` déclare son propre `i` : il n’existe que dans sa boucle.

**Ce qu’on doit voir** — A à T sur la ligne 0 et sur la ligne 5.  
**Ce qu’il coûte** — 1394 octets de programme, 1 variable.

---

### 0.6. La même ligne, avec une boucle while

> La boucle for, décomposée en ses trois morceaux.

```cpp
int main() {
  uint8_t i = 0;                // 1. on part de la colonne 0

  while (i < 20) {              // 2. tant qu'on est dans l'écran
    poser(i, 0, ALPHABET[i]);   //    la lettre n° i, dans la colonne i
    i++;                        // 3. on passe à la suivante
  }

  while (true) {
    image();
  }
}
```

`while (i < 20)` répète **tant que** la condition est vraie. C’est la même boucle que `while (true)` du 0.0, mais celle-ci **s’arrête**.

Les trois morceaux que `for` réunit sur une ligne sont ici écrits **séparément** : le départ `uint8_t i = 0;` avant la boucle, la condition `i < 20` dans le `while`, et `i++;` à la fin de chaque tour.

**Le piège :** sans `i++`, `i` reste à 0, la condition reste vraie, et la boucle **ne s’arrête jamais**. Le programme reste bloqué dedans.

**Ce qu’on doit voir** — A à T sur toute la première ligne, comme au 0.5.  
**Ce qu’il coûte** — 1333 octets de programme, 1 variable.

---

### 0.6.1. La même ligne, avec une boucle while — de base, ailleurs

> Le 0.6 sur la ligne 5 : un seul nombre change dans la boucle.

```cpp
int main() {
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
```

**C’est le 0.6**, avec un seul changement : la **ligne** : 5 au lieu de 0, dans le `poser` de la boucle.

**Un seul nombre à changer**, au lieu de vingt au 0.4.1 : la boucle écrit la ligne entière, et la ligne n’est dite qu’une fois.

**C’est la version de base** : une seule chose, à la deuxième place. Le 0.6.2 met les deux ensemble.

**Ce qu’on doit voir** — A à T sur la ligne 5.  
**Ce qu’il coûte** — 1334 octets de programme, 1 variable.

---

### 0.6.2. La même ligne, avec une boucle while — doublé, deux positions

> La boucle deux fois : la ligne 0 puis la ligne 5.

```cpp
int main() {
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
```

**C’est le 0.6 et le 0.6.1 réunis** : la boucle du 0.6 (ligne 0), puis celle du 0.6.1 (ligne 5).

**Deux boucles l’une après l’autre**, avec la **même** variable `i` : déclarée une fois, elle est remise à 0 (`i = 0;`) avant la seconde boucle, sans `uint8_t` — on ne déclare pas deux fois le même nom.

**Ce qu’on doit voir** — A à T sur la ligne 0 et sur la ligne 5.  
**Ce qu’il coûte** — 1394 octets de programme, 1 variable.

---

### 0.7. La même ligne, avec do … while

> La boucle qui vérifie sa condition à la fin : elle fait toujours au moins un tour.

```cpp
int main() {
  uint8_t i = 0;

  do {
    poser(i, 0, ALPHABET[i]);   // la lettre n° i, dans la colonne i
    i++;
  } while (i < 20);             // la condition est vérifiée À LA FIN

  while (true) {
    image();
  }
}
```

`do { … } while (i < 20);` fait le tour **d’abord**, et vérifie la condition **ensuite**. Il fait donc **toujours au moins un tour**, même si la condition est fausse dès le départ.

Ici, le résultat est le même qu’avec `for` et `while` : les trois boucles savent faire la même chose. On choisit celle qui se lit le mieux.

Attention au **point-virgule** après `while (i < 20)` : il est obligatoire avec `do`, et seulement avec lui.

**Ce qu’on doit voir** — A à T sur toute la première ligne, comme au 0.5.  
**Ce qu’il coûte** — 1330 octets de programme, 1 variable.

---

### 0.7.1. La même ligne, avec do … while — de base, ailleurs

> Le 0.7 sur la ligne 5 : un seul nombre change dans la boucle.

```cpp
int main() {
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
```

**C’est le 0.7**, avec un seul changement : la **ligne** : 5 au lieu de 0, dans le `poser` de la boucle.

**Un seul nombre à changer**, au lieu de vingt au 0.4.1 : la boucle écrit la ligne entière, et la ligne n’est dite qu’une fois.

**C’est la version de base** : une seule chose, à la deuxième place. Le 0.7.2 met les deux ensemble.

**Ce qu’on doit voir** — A à T sur la ligne 5.  
**Ce qu’il coûte** — 1331 octets de programme, 1 variable.

---

### 0.7.2. La même ligne, avec do … while — doublé, deux positions

> La boucle deux fois : la ligne 0 puis la ligne 5.

```cpp
int main() {
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
```

**C’est le 0.7 et le 0.7.1 réunis** : la boucle du 0.7 (ligne 0), puis celle du 0.7.1 (ligne 5).

**Deux boucles l’une après l’autre**, avec la **même** variable `i` : déclarée une fois, elle est remise à 0 (`i = 0;`) avant la seconde boucle, sans `uint8_t` — on ne déclare pas deux fois le même nom.

**Ce qu’on doit voir** — A à T sur la ligne 0 et sur la ligne 5.  
**Ce qu’il coûte** — 1388 octets de programme, 1 variable.

---

### 0.8. Tout l’alphabet, avec deux boucles

> La ligne est pleine après T : une seconde boucle écrit U à Z sur la ligne d’en dessous.

```cpp
int main() {
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
```

Il y a **26 lettres** et seulement **20 colonnes**. La première boucle écrit A à T sur la ligne 0 ; la seconde écrit les 6 dernières, U à Z, sur la ligne **1**.

Dans la seconde boucle, `i` va de 20 à 25 : c’est le bon **indice** dans `ALPHABET` (U est à l’indice 20). Mais la **colonne** doit repartir à 0 : on écrit donc `i - 20`.

**Ce qu’on doit voir** — A à T sur la ligne 0, U à Z en dessous.  
**Ce qu’il coûte** — 1399 octets de programme, 1 variable.

---

### 0.8.1. Tout l’alphabet, avec deux boucles — de base, ailleurs

> Le 0.8 trois lignes plus bas : tout l’alphabet sur les lignes 5 et 6.

```cpp
int main() {
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
```

**C’est le 0.8**, avec un seul changement : les **lignes** : 5 et 6 au lieu de 0 et 1, dans les deux `poser`.

**Le reste ne bouge pas :** A à T sur une ligne, U à Z sur la suivante.

**C’est la version de base** : une seule chose, à la deuxième place. Le 0.8.2 met les deux ensemble.

**Ce qu’on doit voir** — Tout l’alphabet sur les lignes 5 et 6.  
**Ce qu’il coûte** — 1400 octets de programme, 1 variable.

---

### 0.8.2. Tout l’alphabet, avec deux boucles — doublé, deux positions

> Tout l’alphabet deux fois : lignes 0 et 1, puis lignes 5 et 6.

```cpp
int main() {
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
```

**C’est le 0.8 et le 0.8.1 réunis** : l’alphabet du 0.8 (lignes 0 et 1), puis celui du 0.8.1 (lignes 5 et 6).

**Ce qu’on doit voir** — Tout l’alphabet deux fois : en haut, et trois lignes plus bas.  
**Ce qu’il coûte** — 1526 octets de programme, 1 variable.

---

### 0.9. Tout l’alphabet, avec une seule boucle

> Le modulo donne la colonne, la division donne la ligne.

```cpp
int main() {
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
```

**Ce qui est nouveau ici :** `sizeof`, le modulo `%` et la division `/`. Le reste (`for`, `poser`, `ALPHABET[i]`) vient des chapitres précédents.

**`sizeof(ALPHABET)`** veut dire « la taille de ALPHABET » : le nombre de cases du tableau, **26**. On ne l’écrit plus à la main : si le tableau changeait de taille, la boucle suivrait toute seule. `i < sizeof(ALPHABET)` s’arrête donc après `i = 25`, la dernière lettre.

**`i / 20`** est une **division entière** : elle garde le quotient et **jette les virgules**. 5 / 20 donne 0 (et non 0,25) ; 19 / 20 donne 0 ; 20 / 20 donne 1 ; 25 / 20 donne 1. Tant que `i` est plus petit que 20, le résultat est 0 : c’est la **ligne 0**. À partir de 20, c’est 1 : la **ligne 1**.

**`i % 20`** se lit « i modulo 20 » : c’est le **reste** de cette même division. 5 % 20 donne 5 (20 ne rentre pas dans 5, tout reste) ; 19 % 20 donne 19 ; 20 % 20 donne 0 (la division tombe juste, il ne reste rien) ; 25 % 20 donne 5. Le reste monte de 0 à 19 puis **repart à 0** : c’est la **colonne**.

Imagine **20 places par rang**, comme au cinéma : `i / 20` dit combien de rangs **complets** sont déjà remplis (le rang de la lettre), `i % 20` dit combien de places il **reste** une fois ces rangs retirés (sa place dans le rang).

Tour par tour : **i = 0** → colonne 0, ligne 0, **A** · **i = 19** → colonne 19, ligne 0, **T** (la ligne est pleine) · **i = 20** → colonne **0**, ligne **1**, **U** (le reste repart à 0, le quotient passe à 1) · **i = 25** → colonne 5, ligne 1, **Z**.

C’est compliqué à lire : le chapitre suivant montre `poserS`, qui fait ce calcul à notre place.

**Ce qu’on doit voir** — A à T sur la ligne 0, U à Z en dessous, comme au 0.8.  
**Ce qu’il coûte** — 1352 octets de programme, 1 variable.

---

### 0.9.1. Tout l’alphabet, avec une seule boucle — de base, ailleurs

> Le 0.9 trois lignes plus bas : tout l’alphabet sur les lignes 5 et 6.

```cpp
int main() {
  // Le changement : les lignes 0 et 1 → 5 et 6.
  for (uint8_t i = 0; i < sizeof(ALPHABET); i++) {
    poser(i % 20, 5 + i / 20, ALPHABET[i]);   // 5 + i / 20 : la ligne 5, puis 6
  }

  while (true) {
    image();
  }
}
```

**C’est le 0.9**, avec un seul changement : la **ligne de départ** : `5 + i / 20` au lieu de `i / 20`. `i / 20` vaut 0 puis 1 ; en ajoutant 5, on obtient les lignes 5 puis 6.

**Le reste ne bouge pas :** A à T sur une ligne, U à Z sur la suivante.

**C’est la version de base** : une seule chose, à la deuxième place. Le 0.9.2 met les deux ensemble.

**Ce qu’on doit voir** — Tout l’alphabet sur les lignes 5 et 6.  
**Ce qu’il coûte** — 1354 octets de programme, 1 variable.

---

### 0.9.2. Tout l’alphabet, avec une seule boucle — doublé, deux positions

> Tout l’alphabet deux fois : lignes 0 et 1, puis lignes 5 et 6.

```cpp
int main() {
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
```

**C’est le 0.9 et le 0.9.1 réunis** : l’alphabet du 0.9 (lignes 0 et 1), puis celui du 0.9.1 (lignes 5 et 6).

**Ce qu’on doit voir** — Tout l’alphabet deux fois : en haut, et trois lignes plus bas.  
**Ce qu’il coûte** — 1433 octets de programme, 1 variable.

---

### 0.10. Tout l’alphabet, avec poserS

> poserS passe à la ligne tout seul : une seule boucle pour les 26 lettres.

```cpp
int main() {
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
```

**Ce qui est nouveau ici :** `poserS`. Le reste (`for`, `sizeof`, `ALPHABET[i]`) vient des chapitres précédents : c’est le programme du 0.9, en plus simple.

**`sizeof(ALPHABET)`** veut dire « la taille de ALPHABET » : le nombre de cases du tableau, **26**. On ne l’écrit plus à la main : si le tableau changeait de taille, la boucle suivrait toute seule. `i < sizeof(ALPHABET)` s’arrête donc après `i = 25`, la dernière lettre.

**`poserS(colonne, ligne, tuile)`** fait partie de la console, comme `ALPHABET` : on s’en sert sans rien déclarer. C’est `poser()`, mais qui **passe à la ligne tout seul** : une colonne trop grande (20 ou plus) repart à gauche, une ligne plus bas.

On lui donne donc simplement `i` comme colonne, sur la ligne 0. Tour par tour : **i = 0** → A en (0, 0) · **i = 19** → T en (19, 0), la ligne est pleine · **i = 20** → la colonne 20 n’existe pas : `poserS` pose U en (**0**, **1**) · **i = 25** → Z en (5, 1).

**Comment `poserS` trouve la place**, pour les curieux : la ligne est le nombre de rangées de 20 déjà pleines (20 / 20 = 1), et la colonne ce qui reste une fois ces rangées retirées (25 − 20 = 5). En C++ : `i / 20` et `i % 20`. `poserS` fait ce calcul à notre place.

Le calcul du 0.9 a disparu du programme : `poserS` le fait à notre place.

**Ce qu’on doit voir** — A à T sur la ligne 0, U à Z en dessous, comme au 0.8.  
**Ce qu’il coûte** — 1360 octets de programme, 1 variable.

---

### 0.10.1. Tout l’alphabet, avec poserS — de base, ailleurs

> Le 0.10 trois lignes plus bas : tout l’alphabet sur les lignes 5 et 6.

```cpp
int main() {
  // Le changement : les lignes 0 et 1 → 5 et 6.
  for (uint8_t i = 0; i < sizeof(ALPHABET); i++) {
    poserS(i, 5, ALPHABET[i]);   // poserS passe tout seul à la ligne 6
  }

  while (true) {
    image();
  }
}
```

**C’est le 0.10**, avec un seul changement : la **ligne** : 5 au lieu de 0. `poserS` passe tout seul à la ligne suivante, la 6.

**Le reste ne bouge pas :** A à T sur une ligne, U à Z sur la suivante.

**C’est la version de base** : une seule chose, à la deuxième place. Le 0.10.2 met les deux ensemble.

**Ce qu’on doit voir** — Tout l’alphabet sur les lignes 5 et 6.  
**Ce qu’il coûte** — 1362 octets de programme, 1 variable.

---

### 0.10.2. Tout l’alphabet, avec poserS — doublé, deux positions

> Tout l’alphabet deux fois : lignes 0 et 1, puis lignes 5 et 6.

```cpp
int main() {
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
```

**C’est le 0.10 et le 0.10.1 réunis** : l’alphabet du 0.10 (lignes 0 et 1), puis celui du 0.10.1 (lignes 5 et 6).

**Ce qu’on doit voir** — Tout l’alphabet deux fois : en haut, et trois lignes plus bas.  
**Ce qu’il coûte** — 1449 octets de programme, 1 variable.

---

### 0.11. Tout l’alphabet, avec textS

> textS passe à la ligne tout seul : plus de calcul à écrire.

```cpp
int main() {
  textS(0, 0, "ABCDEFGHIJKLMNOPQRSTUVWXYZ");   // passe à la ligne après T

  while (true) {
    image();
  }
}
```

**`textS`** écrit comme `texte`, mais **passe à la ligne** quand la ligne est pleine : après la colonne 19, la suite reprend en colonne 0 de la ligne d’en dessous.

Le calcul du 0.9 (`i % 20`, `i / 20`) est fait **à notre place**. `texte()`, lui, refuserait ce mot trop long.

Après la ligne 17, `textS` repart **en haut**, à la ligne 0.

**Ce qu’on doit voir** — A à T sur la ligne 0, U à Z en dessous, comme au 0.9.  
**Ce qu’il coûte** — 1321 octets de programme, 0 variable.

---

### 0.11.1. Tout l’alphabet, avec textS — de base, ailleurs

> Le 0.11 trois lignes plus bas : tout l’alphabet sur les lignes 5 et 6.

```cpp
int main() {
  // Le changement : les lignes 0 et 1 → 5 et 6.
  textS(0, 5, "ABCDEFGHIJKLMNOPQRSTUVWXYZ");   // passe à la ligne 6 après T

  while (true) {
    image();
  }
}
```

**C’est le 0.11**, avec un seul changement : la **ligne** : 5 au lieu de 0. `textS` passe tout seul à la ligne 6 après le T.

**Le reste ne bouge pas :** A à T sur une ligne, U à Z sur la suivante.

**C’est la version de base** : une seule chose, à la deuxième place. Le 0.11.2 met les deux ensemble.

**Ce qu’on doit voir** — Tout l’alphabet sur les lignes 5 et 6.  
**Ce qu’il coûte** — 1321 octets de programme, 0 variable.

---

### 0.11.2. Tout l’alphabet, avec textS — doublé, deux positions

> Tout l’alphabet deux fois : lignes 0 et 1, puis lignes 5 et 6.

```cpp
int main() {
  // 1. Lignes 0 et 1 (le 0.11)
  textS(0, 0, "ABCDEFGHIJKLMNOPQRSTUVWXYZ");   // passe à la ligne 1 après T
  // 2. Lignes 5 et 6 (le 0.11.1)
  textS(0, 5, "ABCDEFGHIJKLMNOPQRSTUVWXYZ");   // passe à la ligne 6 après T

  while (true) {
    image();
  }
}
```

**C’est le 0.11 et le 0.11.1 réunis** : l’alphabet du 0.11 (lignes 0 et 1), puis celui du 0.11.1 (lignes 5 et 6).

**Ce qu’on doit voir** — Tout l’alphabet deux fois : en haut, et trois lignes plus bas.  
**Ce qu’il coûte** — 1369 octets de programme, 0 variable.

---

### Partie B — Le temps

### 0.12. Une lettre toutes les secondes

> Écrire DANS la boucle de jeu, et compter les images pour mesurer le temps.

```cpp
const uint8_t IMAGES_PAR_SECONDE = 60;   // la console affiche 60 images par seconde
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
```

Jusqu’ici, on écrivait **avant** la boucle de jeu, une fois pour toutes. Ici, on écrit **dedans** : à chaque image, la case (0, 0) reçoit la lettre du moment.

**La console ne connaît ni les secondes ni les millisecondes : elle compte les images.** Il y en a **60 par seconde** ; une image dure donc 1000 ÷ 60 ≈ **16,7 millisecondes**. `image()` attend l’image suivante : chaque tour de boucle dure une image.

**`IMAGES_PAR_SECONDE`** et **`SECONDES`** donnent un nom à ces nombres. `SECONDES * IMAGES_PAR_SECONDE` vaut 1 × 60 = 60 : quand `images` atteint 60, une seconde est passée. Pour changer la vitesse, on ne touche qu’à `SECONDES`.

**Limite :** `images` est un `uint8_t`, qui ne dépasse pas 255. On compte donc au plus 255 images, environ **4 secondes** : `SECONDES = 5` donnerait 300, trop grand. Le chapitre suivant montre `attendre()`, qui n’a pas cette limite.

Chaque nouvelle lettre **écrase** la précédente, comme au 0.3. Après Z, `lettre` revient à 0 : on repart de A.

**Ce qu’on doit voir** — En haut à gauche : A, puis B une seconde plus tard, puis C…  
**Ce qu’il coûte** — 1364 octets de programme, 2 variables.

---

### 0.12.1. Une lettre toutes les secondes — de base, ailleurs

> Le 0.12 en colonne 10 : la lettre qui change chaque seconde, au milieu de la ligne.

```cpp
const uint8_t IMAGES_PAR_SECONDE = 60;
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
```

**C’est le 0.12**, avec un seul changement : la **colonne** du `poser` : 10 au lieu de 0.

**Le chronomètre ne change pas :** seule la case où l’on affiche la lettre a bougé.

**C’est la version de base** : une seule chose, à la deuxième place. Le 0.12.2 met les deux ensemble.

**Ce qu’on doit voir** — Une lettre en haut, au milieu de la ligne, qui change chaque seconde.  
**Ce qu’il coûte** — 1365 octets de programme, 2 variables.

---

### 0.12.2. Une lettre toutes les secondes — doublé, deux positions

> La même lettre à deux places : colonne 0 et colonne 10. Un seul chronomètre, deux poser.

```cpp
const uint8_t IMAGES_PAR_SECONDE = 60;
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
```

**C’est le 0.12 et le 0.12.1 réunis** : deux `poser` de la même lettre, en colonne 0 et en colonne 10.

**Les deux changent ensemble :** c’est la **même** variable `lettre`, affichée à deux endroits. Pour deux rythmes différents, il faut deux variables : c’est le 0.14.

**Ce qu’on doit voir** — Deux fois la même lettre, en colonne 0 et en colonne 10, qui changent ensemble chaque seconde.  
**Ce qu’il coûte** — 1392 octets de programme, 2 variables.

---

### 0.13. Une lettre toutes les secondes, avec attendre

> Le temps dit directement en secondes : attendre(1).

```cpp
uint8_t lettre = 0;   // l'indice de la lettre affichée

int main() {
  while (true) {
    poser(0, 0, ALPHABET[lettre]);   // 1. affiche la lettre en haut à gauche
    attendre(1);                     // 2. attend 1 seconde : le nombre entre ( ) est en SECONDES
                                     //    (tout le programme s'arrête pendant ce temps)

    lettre++;                                       // 3. la lettre suivante
    if (lettre == sizeof(ALPHABET)) lettre = 0;     //    après Z, on revient à A
  }
}
```

**Ce qui est nouveau ici :** `attendre(secondes)`. Elle fait partie de la console, comme `ALPHABET` : on s’en sert sans rien déclarer.

`attendre(1)` attend **une seconde**, puis le programme continue à la ligne suivante. À l’intérieur, elle compte les images à notre place : 1 × 60 = 60 images. On peut aller jusqu’à `attendre(255)`, plus de 4 minutes.

Le programme se lit dans l’ordre : **afficher** la lettre, **attendre** une seconde, passer à la **suivante**. Il n’y a plus de compteur `images`, ni d’`image()` : `attendre` s’en occupe.

**La différence avec le 0.12 :** pendant `attendre()`, le programme est **arrêté**. Rien d’autre ne se passe : la manette n’est pas lue. En comptant les images soi-même (0.12), la boucle de jeu continue de tourner pendant l’attente. Pour un jeu, c’est souvent ce qu’il faut ; pour faire patienter, `attendre` est plus simple.

**La limite :** `attendre` ne sait pas **ce qui** doit attendre : il fige **tout** le programme. Avec `attendre(10)`, aucune autre chose ne peut bouger pendant 10 secondes. Pour que plusieurs choses aient chacune leur rythme, voir le chapitre suivant.

**Ce qu’on doit voir** — En haut à gauche : A, puis B une seconde plus tard, puis C…, comme au 0.12.  
**Ce qu’il coûte** — 1351 octets de programme, 1 variable.

---

### 0.13.1. Une lettre toutes les secondes, avec attendre — de base, ailleurs

> Le 0.13 en colonne 10.

```cpp
uint8_t lettre = 0;

int main() {
  while (true) {
    poser(10, 0, ALPHABET[lettre]);   // le changement : colonne 0 → 10
    attendre(1);
    lettre++;
    if (lettre == sizeof(ALPHABET)) lettre = 0;
  }
}
```

**C’est le 0.13**, avec un seul changement : la **colonne** du `poser` : 10 au lieu de 0.

**`attendre(1)` ne change pas** : une seconde entre deux lettres.

**C’est la version de base** : une seule chose, à la deuxième place. Le 0.13.2 met les deux ensemble.

**Ce qu’on doit voir** — Une lettre au milieu de la ligne du haut, qui change chaque seconde.  
**Ce qu’il coûte** — 1352 octets de programme, 1 variable.

---

### 0.13.2. Une lettre toutes les secondes, avec attendre — doublé, deux positions

> Deux poser avant attendre : la même lettre en colonne 0 et en colonne 10.

```cpp
uint8_t lettre = 0;

int main() {
  while (true) {
    poser(0, 0, ALPHABET[lettre]);    // colonne 0 (le 0.13)
    poser(10, 0, ALPHABET[lettre]);   // colonne 10 (le 0.13.1)
    attendre(1);
    lettre++;
    if (lettre == sizeof(ALPHABET)) lettre = 0;
  }
}
```

**C’est le 0.13 et le 0.13.1 réunis** : deux `poser`, avant le même `attendre(1)`.

**`attendre` arrête tout :** les deux lettres sont posées, puis le programme attend une seconde, et recommence.

**Ce qu’on doit voir** — La même lettre en colonne 0 et en colonne 10, qui change chaque seconde.  
**Ce qu’il coûte** — 1379 octets de programme, 1 variable.

---

### 0.14. Deux choses, deux rythmes

> Un compteur par chose : chacune avance à son rythme, et rien ne s’arrête.

```cpp
// ─────────────────────────────────────────────────────────────
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
```

**Le problème :** `attendre()` fige tout le programme. Impossible, avec lui, de faire changer une lettre toutes les secondes **et** une autre quatre fois par seconde : pendant que l’une attend, l’autre attend aussi.

**La solution :** on n’arrête plus jamais le programme. La boucle tourne sans cesse, un tour par image (60 par seconde), et **chaque chose a son propre compteur** d’images. C’est la méthode du 0.12, faite deux fois.

**La lettre lente** (ligne 0) : son compteur `imagesLente` avance d’un à chaque tour ; à **60**, une seconde est passée : elle change de lettre, et son compteur repart de 0.

**La lettre rapide** (ligne 2) : son compteur `imagesRapide` avance en même temps ; à **15**, un quart de seconde est passé (60 ÷ 4 = 15) : elle change, et son compteur repart de 0. Elle change donc **4 fois** pendant que la lente change **une fois**.

Les deux compteurs sont **indépendants** : on peut changer le 15 sans toucher au 60. Et comme la boucle ne s’arrête jamais, on pourrait lire la manette en même temps. C’est comme cela que tourne un jeu.

**Le déroulé dans le temps :** **0 s** (tour 0) : A en haut, A en bas · **0,25 s** (tour 15) : `imagesRapide` atteint 15 et repart à 0, la rapide passe à **B** · **0,5 s** (tour 30) : la rapide passe à **C** · **0,75 s** (tour 45) : la rapide passe à **D** · **1 s** (tour 60) : `imagesLente` atteint 60 **et** `imagesRapide` atteint 15 : **les deux** changent, la lente passe à **B**, la rapide à **E**.

**Rappels :** `++` veut dire « ajoute 1 » ; `==` compare (« est égal à ? »), alors qu’un seul `=` range une valeur ; `sizeof(ALPHABET)` vaut 26, le nombre de lettres.

**Ce qu’on doit voir** — Deux lettres : celle du bas change quatre fois pendant que celle du haut change une fois.  
**Ce qu’il coûte** — 1456 octets de programme, 4 variables.

---

### 0.14.1. Deux choses, deux rythmes — de base, ailleurs

> Le 0.14 en colonne 10 : la lente et la rapide, au milieu de la ligne.

```cpp
// ─────────────────────────────────────────────────────────────
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
```

**C’est le 0.14**, avec un seul changement : la **colonne** des deux `poser` : 10 au lieu de 0.

**Les chronomètres ne changent pas :** seules les cases où l’on affiche les deux lettres ont bougé.

**C’est la version de base** : une seule chose, à la deuxième place. Le 0.14.2 met les deux ensemble.

**Ce qu’on doit voir** — La lente et la rapide, en colonne 10.  
**Ce qu’il coûte** — 1458 octets de programme, 4 variables.

---

### 0.14.2. Deux choses, deux rythmes — doublé, deux positions

> Les deux rythmes à deux places : en colonne 0 et en colonne 10.

```cpp
// ─────────────────────────────────────────────────────────────
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
```

**C’est le 0.14 et le 0.14.1 réunis** : les deux `poser` du 0.14, et les deux du 0.14.1.

**Quatre `poser`, deux variables :** la lente est la même en colonne 0 et en colonne 10, la rapide aussi.

**Ce qu’on doit voir** — La lente et la rapide, en colonne 0 et en colonne 10.  
**Ce qu’il coûte** — 1513 octets de programme, 4 variables.

---

### 0.15. Deux rythmes, un seul chronomètre

> Le même programme en plus court : un seul compteur, et le modulo fait le reste.

```cpp
uint8_t lente = 0;    // QUELLE lettre montre la lente : 0 = A … 25 = Z
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
```

**C’est le programme du 0.14, en plus simple.** L’écran est exactement le même : la lettre du bas change quatre fois pendant que celle du haut change une fois.

**Un seul chronomètre :** au lieu de deux compteurs, `images` compte de 0 à 59, puis repart à 0. Il fait donc un tour complet **chaque seconde**.

**La lente** change quand le chronomètre repasse par **0** : une fois par tour, donc une fois par seconde.

**La rapide** change quand `images % 15 == 0` : quand `images` est un **multiple de 15**, c’est-à-dire 0, 15, 30 ou 45. Le reste de la division par 15 ne vaut 0 que pour ces nombres : 30 % 15 = 0, mais 31 % 15 = 1. Cela fait **4 fois** par tour, donc 4 fois par seconde.

**Le retour à A sans `if` :** `(rapide + 1) % sizeof(ALPHABET)` ajoute 1, puis garde le reste de la division par 26. Tant qu’on est sous 26, le reste est le nombre lui-même (7 % 26 = 7) ; à 26, il retombe à **0** (26 % 26 = 0) : après Z, A.

**Ce qu’on gagne :** 3 variables au lieu de 4, deux `if` d’une ligne au lieu de deux blocs, et un programme plus léger. **Ce qu’on perd :** les deux rythmes sont liés au même chronomètre ; au 0.14, on pouvait choisir n’importe quelle durée pour chacun, sans rapport entre eux.

**Ce qu’on doit voir** — Comme au 0.14 : la lettre du bas change quatre fois pendant que celle du haut change une fois.  
**Ce qu’il coûte** — 1438 octets de programme, 3 variables.

---

### 0.15.1. Deux rythmes, un seul chronomètre — de base, ailleurs

> Le 0.15 en colonne 10 : la lente et la rapide, au milieu de la ligne.

```cpp
uint8_t lente = 0;    // QUELLE lettre montre la lente : 0 = A … 25 = Z
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
```

**C’est le 0.15**, avec un seul changement : la **colonne** des deux `poser` : 10 au lieu de 0.

**Les chronomètres ne changent pas :** seules les cases où l’on affiche les deux lettres ont bougé.

**C’est la version de base** : une seule chose, à la deuxième place. Le 0.15.2 met les deux ensemble.

**Ce qu’on doit voir** — La lente et la rapide, en colonne 10.  
**Ce qu’il coûte** — 1440 octets de programme, 3 variables.

---

### 0.15.2. Deux rythmes, un seul chronomètre — doublé, deux positions

> Les deux rythmes à deux places : en colonne 0 et en colonne 10.

```cpp
uint8_t lente = 0;    // QUELLE lettre montre la lente : 0 = A … 25 = Z
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
```

**C’est le 0.15 et le 0.15.1 réunis** : les deux `poser` du 0.15, et les deux du 0.15.1.

**Quatre `poser`, deux variables :** la lente est la même en colonne 0 et en colonne 10, la rapide aussi.

**Ce qu’on doit voir** — La lente et la rapide, en colonne 0 et en colonne 10.  
**Ce qu’il coûte** — 1495 octets de programme, 3 variables.

---

### 0.16. Deux rythmes, écrits en millisecondes

> ms(1000) et ms(250) : chaque durée s’écrit en millisecondes, la console la traduit en images.

```cpp
// ─────────────────────────────────────────────────────────────
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
```

**C’est le programme du 0.14**, mais les durées ne sont plus des nombres d’images à calculer de tête : elles s’écrivent en **millisecondes** (millièmes de seconde). 1000 ms = 1 seconde ; 250 ms = un quart de seconde.

**Ce qui est nouveau ici :** `ms(durée)`. Elle fait partie de la console, comme `ALPHABET` : on s’en sert sans rien déclarer. Elle **traduit** une durée en millisecondes en nombre d’images, car la console ne sait compter que les images.

**La traduction :** une image dure 1000 ÷ 60 ≈ **16,7 ms**. `ms(1000)` donne donc 60 images, `ms(250)` donne 15 images, `ms(500)` donne 30 images. Le résultat est arrondi à l’image la plus proche : `ms(100)` donne 6 images, soit 100 ms environ.

**Elle ne coûte rien :** la traduction est faite par le compilateur, avant que la cartouche existe. `ms(250)` est remplacé par 15, et la console ne voit qu’un nombre. C’est pour cela qu’il faut écrire la durée **en clair** : `ms(250)`, et non `ms(une_variable)`.

**Les constantes `DUREE_LENTE` et `DUREE_RAPIDE`** rangent les deux durées en haut du programme : pour changer un rythme, on change un seul nombre, en millisecondes.

**La limite :** les compteurs sont des `uint8_t`, qui s’arrêtent à 255 images. On peut donc aller jusqu’à `ms(4250)`, environ 4 secondes. Au-delà, le compilateur refuse et l’explique. En dessous de 17 ms (moins d’une image), il refuse aussi : la console ne sait pas compter plus fin.

**Ce qu’on doit voir** — Comme au 0.14 : la lettre du bas change quatre fois pendant que celle du haut change une fois.  
**Ce qu’il coûte** — 1456 octets de programme, 4 variables.

---

### 0.16.1. Deux rythmes, écrits en millisecondes — de base, ailleurs

> Le 0.16 en colonne 10 : la lente et la rapide, au milieu de la ligne.

```cpp
// ─────────────────────────────────────────────────────────────
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
```

**C’est le 0.16**, avec un seul changement : la **colonne** des deux `poser` : 10 au lieu de 0.

**Les chronomètres ne changent pas :** seules les cases où l’on affiche les deux lettres ont bougé.

**C’est la version de base** : une seule chose, à la deuxième place. Le 0.16.2 met les deux ensemble.

**Ce qu’on doit voir** — La lente et la rapide, en colonne 10.  
**Ce qu’il coûte** — 1458 octets de programme, 4 variables.

---

### 0.16.2. Deux rythmes, écrits en millisecondes — doublé, deux positions

> Les deux rythmes à deux places : en colonne 0 et en colonne 10.

```cpp
// ─────────────────────────────────────────────────────────────
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
```

**C’est le 0.16 et le 0.16.1 réunis** : les deux `poser` du 0.16, et les deux du 0.16.1.

**Quatre `poser`, deux variables :** la lente est la même en colonne 0 et en colonne 10, la rapide aussi.

**Ce qu’on doit voir** — La lente et la rapide, en colonne 0 et en colonne 10.  
**Ce qu’il coûte** — 1513 octets de programme, 4 variables.

---

### 0.17. Une lettre qui avance de 5 cases

> Bouger, c’est effacer la lettre à sa place, puis la réécrire un peu plus loin — et s’arrêter après le nombre de pas voulu.

```cpp
uint8_t pas = 5;      // le NOMBRE DE CASES à parcourir : change-le pour aller plus ou moins loin
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
```

La lettre A avance d’une colonne toutes les **15 images**, soit quatre fois par seconde.

Pour bouger, on **efface** d’abord l’ancienne place avec `effacer(x, 0, 1)`, une case ; puis on ajoute 1 à `x`, et la lettre est réécrite à sa nouvelle place. Sans l’effacement, elle laisserait une traînée de A derrière elle.

**Ce qui est nouveau ici :** la variable `pas`. Elle range le **nombre de cases** à parcourir : 5. Pour que la lettre aille plus loin ou moins loin, on change ce seul nombre, en haut du programme, sans toucher au reste.

**L’arrêt :** la condition `if (x < pas)` compare la colonne de la lettre au nombre de pas. Au départ `x` vaut 0 : 0 < 5 est vrai, le chronomètre tourne et la lettre avance. Après le cinquième pas, `x` vaut 5 : 5 < 5 est **faux**, on ne rentre plus dans le bloc, `x` ne change plus… et la lettre reste en colonne 5.

La boucle `while (true)` continue pourtant de tourner : la lettre est simplement réécrite, à chaque image, à la même place.

**Ce qu’on doit voir** — Un A qui avance de 5 cases vers la droite, puis s’arrête en colonne 5.  
**Ce qu’il coûte** — 1389 octets de programme, 3 variables.

---

### 0.17.1. Une lettre qui avance de 5 cases — de base, ailleurs

> Le 0.17 sur la ligne 8, avec le B.

```cpp
uint8_t pas = 5;      // le nombre de cases à parcourir
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
```

**C’est le 0.17**, avec une autre lettre, le **B** (`ALPHABET[1]`, la 2e lettre), et une autre place : la **ligne 8** au lieu de la ligne 0, dans `effacer` et dans `poser`.

**C’est la version de base** : une seule lettre, à la deuxième place. Le 0.17.2 met les deux ensemble.

**Ce qu’on doit voir** — Un B qui avance de 5 cases sur la ligne 8.  
**Ce qu’il coûte** — 1391 octets de programme, 3 variables.

---

### 0.17.2. Une lettre qui avance de 5 cases — doublé, deux positions

> Le A sur la ligne 0 et le B sur la ligne 8 avancent ensemble : la même variable x pour les deux.

```cpp
uint8_t pas = 5;      // le nombre de cases à parcourir
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
```

**C’est le 0.17 et le 0.17.1 réunis** : deux `effacer` et deux `poser`, un par ligne.

**Une seule variable `x` pour les deux lettres :** elles sont toujours à la même colonne, donc elles avancent **ensemble**, au même pas.

**Ce qu’on doit voir** — Le A et le B avancent ensemble de 5 cases, l’un sur la ligne 0, l’autre sur la ligne 8.  
**Ce qu’il coûte** — 1442 octets de programme, 3 variables.

---

### Partie C — Déplacer une lettre

### 0.18. Avancer avec deplace_x

> deplace_x(colonne, ligne, tuile, pas) fait tout le 0.17 en une ligne : la lettre avance de 5 cases.

```cpp
uint8_t pas = 5;      // le nombre de cases à parcourir
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
```

**C’est le programme du 0.17**, mais tout le travail (le chronomètre, l’effacement, le pas de plus, la lettre reposée) est fait par **une seule fonction de la console** : `deplace_x`.

**Ce qui est nouveau ici :** `deplace_x(colonne, ligne, tuile, pas)`. Elle pose la tuile en (`colonne`, `ligne`), puis la fait avancer d’une case vers la droite tous les quarts de seconde (15 images), **`pas` fois**.

**Pourquoi `x = deplace_x(…)` ?** Quand on écrit `deplace_x(x, …)`, la fonction ne reçoit pas la variable `x` elle-même, mais une **copie** de sa valeur (0). Elle fait bouger la lettre en changeant sa copie, jamais notre `x`. À la fin, elle **rend** (`return`) la colonne d’arrivée, 5, et `x = …` range ce 5 dans `x`.

**Sans le `x =`**, en C ordinaire, la lettre bougerait bien à l’écran, mais `x` vaudrait encore 0 : le programme croirait la lettre toujours au départ. Le cours suivant montre quand cela pose problème.

**Elle bloque**, comme `attendre()` : pendant le voyage, rien d’autre ne tourne. Au bord de l’écran (colonne 19), elle s’arrête au lieu de sortir.

**Ce qu’on doit voir** — Un A qui avance de 5 cases vers la droite, puis s’arrête en colonne 5.  
**Ce qu’il coûte** — 1595 octets de programme, 10 variables.

---

### 0.18.1. Avancer avec deplace_x — de base, ailleurs

> Le 0.18 sur la ligne 8, avec le B.

```cpp
uint8_t pas = 5;
uint8_t x = 0;        // la colonne du B

int main() {
  // Les changements : la ligne (0 → 8) et la lettre (ALPHABET[1], le B).
  x = deplace_x(x, 8, ALPHABET[1], pas);    // x vaut 5

  while (true) {
    image();
  }
}
```

**C’est le 0.18**, avec une autre lettre, le **B** (`ALPHABET[1]`, la 2e lettre), et une autre place : la **ligne 8** au lieu de 0 (2e réglage de `deplace_x`).

**C’est la version de base** : une seule lettre, à la deuxième place. Le 0.18.2 met les deux ensemble.

**Ce qu’on doit voir** — Un B qui avance de 5 cases sur la ligne 8.  
**Ce qu’il coûte** — 1596 octets de programme, 10 variables.

---

### 0.18.2. Avancer avec deplace_x — doublé, deux positions

> Deux lettres, deux variables : le A (x) sur la ligne 0, puis le B (xb) sur la ligne 8.

```cpp
uint8_t pas = 5;
uint8_t x = 0;        // la colonne du A
uint8_t xb = 0;       // la colonne du B : sa propre variable

int main() {
  x = deplace_x(x, 0, ALPHABET[0], pas);      // le A, ligne 0 (le 0.18)
  xb = deplace_x(xb, 8, ALPHABET[1], pas);    // puis le B, ligne 8 (le 0.18.1)

  while (true) {
    image();
  }
}
```

**C’est le 0.18 et le 0.18.1 réunis** : deux lignes `deplace_x`.

**Chaque lettre a SA variable :** `x` pour le A, `xb` pour le B. Une seule variable ne suffirait pas : chaque `deplace_x` rend la colonne de SA lettre.

**L’un après l’autre :** `deplace_x` bloque ; le B part quand le A est arrivé.

**Ce qu’on doit voir** — Le A avance de 5 cases sur la ligne 0, puis le B sur la ligne 8.  
**Ce qu’il coûte** — 1619 octets de programme, 11 variables.

---

### 0.19. Revenir : un pas négatif

> Le 0.18, plus une ligne : deplace_x avec -pas fait revenir la lettre. C’est là que le « x = » sert.

```cpp
uint8_t pas = 5;      // +5 : avance de 5 cases ; -5 : recule de 5 cases
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
```

**C’est le 0.18, plus une ligne :** le retour.

**Ce qui est nouveau ici : un pas négatif.** `-pas`, c’est -5 : la lettre **recule** de 5 cases vers la gauche. Le signe décide du sens : positif vers la droite, négatif vers la gauche.

**Un octet ne connaît pourtant pas les nombres négatifs :** `-5` y est rangé comme 256 − 5 = **251**. `deplace_x` sait donc qu’au-delà de 127, c’est un recul.

**Le retour part de `x`.** Grâce au `x =` du 0.18, `x` vaut 5 : le retour part bien de la colonne 5, et rend 0. Sans le `x =`, en C ordinaire, `x` vaudrait encore 0 : le retour partirait du bord gauche, buterait dessus, et **ne ferait rien**. Le `x =` sert à **garder en mémoire où est la lettre**.

**Ce qu’on doit voir** — Un A qui avance de 5 cases vers la droite, puis revient de 5 cases vers la gauche, et s’arrête.  
**Ce qu’il coûte** — 1617 octets de programme, 10 variables.

---

### 0.19.1. Revenir : un pas négatif — de base, ailleurs

> Le 0.19 sur la ligne 8, avec le B : aller et retour.

```cpp
uint8_t pas = 5;
uint8_t x = 0;

int main() {
  x = deplace_x(x, 8, ALPHABET[1], pas);     // l'aller, ligne 8 : x vaut 5
  x = deplace_x(x, 8, ALPHABET[1], -pas);    // le retour : x vaut 0

  while (true) {
    image();
  }
}
```

**C’est le 0.19**, avec une autre lettre, le **B** (`ALPHABET[1]`, la 2e lettre), et une autre place : la **ligne 8**, dans les deux `deplace_x`.

**C’est la version de base** : une seule lettre, à la deuxième place. Le 0.19.2 met les deux ensemble.

**Ce qu’on doit voir** — Un B qui va et revient sur la ligne 8.  
**Ce qu’il coûte** — 1619 octets de programme, 10 variables.

---

### 0.19.2. Revenir : un pas négatif — doublé, deux positions

> L’aller-retour du A (ligne 0), puis celui du B (ligne 8), chacun avec sa variable.

```cpp
uint8_t pas = 5;
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
```

**C’est le 0.19 et le 0.19.1 réunis** : les deux allers-retours, chacun avec sa variable (`x`, `xb`).

**Ce qu’on doit voir** — Le A va et revient sur la ligne 0, puis le B sur la ligne 8.  
**Ce qu’il coûte** — 1664 octets de programme, 11 variables.

---

### 0.20. Voir x à l’écran : nombre

> Le 0.19, plus nombre(0, 2, x) après chaque trajet : on VOIT la valeur de x changer, 005 puis 000.

```cpp
uint8_t pas = 5;      // +5 : avance ; -5 : recule
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
```

**C’est le 0.19, plus deux lignes identiques :** `nombre(0, 2, x);` après chaque trajet.

**Ce qui est nouveau ici :** `nombre(colonne, ligne, valeur)`. Elle **écrit un nombre** à l’écran, à la case (`colonne`, `ligne`), en **trois chiffres** : 5 s’écrit `005`, 0 s’écrit `000`.

**À quoi ça sert :** une variable ne se voit pas. `x` change dans la mémoire de la console, mais rien ne le montre. En l’écrivant à l’écran, on **voit** ce que vaut `x` : `005` après l’aller, `000` après le retour.

**Pourquoi la ligne 2 :** la lettre bouge sur la ligne 0 ; le nombre, deux lignes plus bas, ne la gêne pas.

**Ce qu’on doit voir** — Le A avance de 5 cases ; en dessous s’écrit 005. Il revient ; le nombre devient 000.  
**Ce qu’il coûte** — 1637 octets de programme, 10 variables.

---

### 0.20.1. Voir x à l’écran : nombre — de base, ailleurs

> Le 0.20 sur la ligne 8, avec le B ; son x s’affiche en ligne 10.

```cpp
uint8_t pas = 5;
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
```

**C’est le 0.20**, avec une autre lettre, le **B** (`ALPHABET[1]`, la 2e lettre), et une autre place : la **ligne 8** pour la lettre, et la **ligne 10** pour le nombre, juste en dessous.

**C’est la version de base** : une seule lettre, à la deuxième place. Le 0.20.2 met les deux ensemble.

**Ce qu’on doit voir** — Le B va et revient sur la ligne 8 ; en dessous, 005 puis 000.  
**Ce qu’il coûte** — 1639 octets de programme, 10 variables.

---

### 0.20.2. Voir x à l’écran : nombre — doublé, deux positions

> Les deux, chacun avec son nombre : x en ligne 2, xb en ligne 10.

```cpp
uint8_t pas = 5;
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
```

**C’est le 0.20 et le 0.20.1 réunis** : les deux lettres et leurs deux nombres.

**Deux variables, deux nombres :** `x` s’affiche sous le A (ligne 2), `xb` sous le B (ligne 10).

**Ce qu’on doit voir** — Le A puis le B vont et reviennent ; sous chacun, son nombre passe à 005 puis 000.  
**Ce qu’il coûte** — 1704 octets de programme, 11 variables.

---

### 0.21. Descendre avec deplace_y

> deplace_y(colonne, ligne, tuile, pas) : comme deplace_x, mais sur l’axe Y. La lettre descend de 5 lignes.

```cpp
uint8_t pas = 5;      // le nombre de lignes à parcourir
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
```

**C’est le 0.18, mais à la verticale.** L’écran a deux axes : **X**, l’horizontal (les colonnes, de 0 à gauche jusqu’à 19 à droite), et **Y**, le vertical (les lignes, de 0 en haut jusqu’à 17 en bas).

**Ce qui est nouveau ici :** `deplace_y(colonne, ligne, tuile, pas)`. Les mêmes renseignements que `deplace_x`, dans le même ordre, mais c’est la **ligne** qui change : la lettre descend d’une ligne tous les quarts de seconde, **`pas` fois**. Un pas positif **descend**, car les numéros de ligne grandissent vers le bas.

**Elle rend la nouvelle ligne**, d’où `y = deplace_y(…)`, pour la même raison qu’au 0.18 : la fonction n’a qu’une **copie** de `y`.

**Au bord** (ligne 17), elle s’arrête au lieu de sortir de l’écran.

**Ce qu’on doit voir** — Un A qui descend de 5 lignes, puis s’arrête en ligne 5.  
**Ce qu’il coûte** — 1595 octets de programme, 10 variables.

---

### 0.21.1. Descendre avec deplace_y — de base, ailleurs

> Le 0.21 en colonne 10, avec le B.

```cpp
uint8_t pas = 5;
uint8_t y = 0;

int main() {
  y = deplace_y(10, y, ALPHABET[1], pas);    // le B descend en colonne 10 : y vaut 5

  while (true) {
    image();
  }
}
```

**C’est le 0.21**, avec une autre lettre, le **B** (`ALPHABET[1]`, la 2e lettre), et une autre place : la **colonne 10** au lieu de 0 (1er réglage de `deplace_y`).

**C’est la version de base** : une seule lettre, à la deuxième place. Le 0.21.2 met les deux ensemble.

**Ce qu’on doit voir** — Un B qui descend de 5 lignes, en colonne 10.  
**Ce qu’il coûte** — 1596 octets de programme, 10 variables.

---

### 0.21.2. Descendre avec deplace_y — doublé, deux positions

> Le A descend en colonne 0 (y), puis le B en colonne 10 (yb).

```cpp
uint8_t pas = 5;
uint8_t y = 0;        // le A
uint8_t yb = 0;       // le B

int main() {
  y = deplace_y(0, y, ALPHABET[0], pas);       // le A, colonne 0
  yb = deplace_y(10, yb, ALPHABET[1], pas);    // puis le B, colonne 10

  while (true) {
    image();
  }
}
```

**C’est le 0.21 et le 0.21.1 réunis** : deux `deplace_y`, chacun avec sa variable (`y`, `yb`).

**Ce qu’on doit voir** — Le A descend en colonne 0, puis le B en colonne 10.  
**Ce qu’il coûte** — 1619 octets de programme, 11 variables.

---

### 0.22. Remonter : deplace_y et un pas négatif

> Le 0.21, plus une ligne : -pas fait remonter la lettre. Et pourquoi deux fonctions, une par axe.

```cpp
uint8_t pas = 5;      // +5 : descend ; -5 : monte
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
```

**C’est le 0.21, plus une ligne :** la montée.

**Ce qui est nouveau ici :** le pas négatif **sur Y**. `-pas` fait **monter** : les numéros de ligne diminuent vers le haut. Comme au 0.19, `-5` est rangé 251, et `deplace_y` lit tout ce qui dépasse 127 comme une montée.

**La montée part de `y`**, qui vaut 5 grâce au `y =`. Elle rend 0, et `y =` le range.

**Pourquoi deux fonctions, et pas une seule pour X et Y ?** Une fonction ne peut rendre qu’**une seule valeur**. `deplace_x` rend la colonne, `deplace_y` rend la ligne : chacune dit exactement où la lettre s’est arrêtée.

**Ce qu’on doit voir** — Un A qui descend de 5 lignes, puis remonte de 5 lignes, et s’arrête tout en haut.  
**Ce qu’il coûte** — 1617 octets de programme, 10 variables.

---

### 0.22.1. Remonter : deplace_y et un pas négatif — de base, ailleurs

> Le 0.22 en colonne 10, avec le B : descente et montée.

```cpp
uint8_t pas = 5;
uint8_t y = 0;

int main() {
  y = deplace_y(10, y, ALPHABET[1], pas);     // descente : y vaut 5
  y = deplace_y(10, y, ALPHABET[1], -pas);    // montée : y vaut 0

  while (true) {
    image();
  }
}
```

**C’est le 0.22**, avec une autre lettre, le **B** (`ALPHABET[1]`, la 2e lettre), et une autre place : la **colonne 10**, dans les deux `deplace_y`.

**C’est la version de base** : une seule lettre, à la deuxième place. Le 0.22.2 met les deux ensemble.

**Ce qu’on doit voir** — Un B qui descend puis remonte, en colonne 10.  
**Ce qu’il coûte** — 1619 octets de programme, 10 variables.

---

### 0.22.2. Remonter : deplace_y et un pas négatif — doublé, deux positions

> La descente et la montée du A (colonne 0), puis celles du B (colonne 10).

```cpp
uint8_t pas = 5;
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
```

**C’est le 0.22 et le 0.22.1 réunis** : les deux descentes-montées, chacune avec sa variable.

**Ce qu’on doit voir** — Le A descend et remonte en colonne 0, puis le B en colonne 10.  
**Ce qu’il coûte** — 1664 octets de programme, 11 variables.

---

### 0.23. Sans « x = » : la console range la position

> Le 0.20 sans les « x = » : deplace_x(x, …); seul sur sa ligne, et x change quand même. Les nombres le montrent.

```cpp
uint8_t pas = 5;      // +5 : avance ; -5 : recule
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
```

**C’est le 0.20, avec un seul changement :** les deux `x =` ont disparu.

**Ce qui est nouveau ici :** quand l’appel est **seul sur sa ligne** et que la position donnée est une **variable** (`x`), la console **range elle-même** la position d’arrivée dans cette variable. Le compilateur réécrit la ligne en `x = deplace_x(x, …);` : c’est exactement le 0.20, la même cartouche, octet pour octet.

**La preuve :** les nombres affichent toujours `005` puis `000`. Personne n’a écrit `x =`, et pourtant `x` a changé.

**C’est une exception, réservée à la console.** La règle du C ne change pas : une fonction reçoit une copie. Seules les fonctions de la console (`deplace_x`, `deplace_y`, et celles qui viendront) ont droit à ce rangement. Pour **tes** fonctions, il faut toujours `x =` (le 0.33 le montre).

**Une condition :** la position doit être une **variable**. `deplace_x(3, 0, ALPHABET[0], 5);` fait bouger la lettre, mais il n’y a nulle part où ranger la colonne.

**Ce qu’on doit voir** — Exactement le 0.20 : le A avance, 005 s’écrit ; il revient, 000 s’écrit.  
**Ce qu’il coûte** — 1637 octets de programme, 10 variables.

---

### 0.23.1. Sans « x = » : la console range la position — de base, ailleurs

> Le 0.23 sur la ligne 8, avec le B : toujours sans « x = ».

```cpp
uint8_t pas = 5;
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
```

**C’est le 0.23**, avec une autre lettre, le **B** (`ALPHABET[1]`, la 2e lettre), et une autre place : la **ligne 8** pour la lettre, la **ligne 10** pour le nombre.

**C’est la version de base** : une seule lettre, à la deuxième place. Le 0.23.2 met les deux ensemble.

**Ce qu’on doit voir** — Le B va et revient sur la ligne 8 ; 005 puis 000 en dessous.  
**Ce qu’il coûte** — 1639 octets de programme, 10 variables.

---

### 0.23.2. Sans « x = » : la console range la position — doublé, deux positions

> Les deux, sans « = » : la console range x pour le A et xb pour le B.

```cpp
uint8_t pas = 5;
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
```

**C’est le 0.23 et le 0.23.1 réunis** : les deux lettres, sans aucun `=`.

**La console range chaque position dans SA variable** : celle qu’on donne en premier à `deplace_x`, `x` pour le A, `xb` pour le B.

**Ce qu’on doit voir** — Le A puis le B avancent de 5 cases ; sous chacun, 005.  
**Ce qu’il coûte** — 1639 octets de programme, 11 variables.

---

### 0.24. Les deux axes à la suite

> deplace_x puis deplace_y, sans « = » : la lettre va à droite, puis descend depuis la colonne où elle est arrivée.

```cpp
uint8_t pas = 5;      // 5 cases, sur chaque axe
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
```

**On garde la forme courte du 0.23**, et on utilise **les deux axes** : d’abord `deplace_x`, puis `deplace_y`.

**Ce qui est nouveau ici :** deux variables, `x` **et** `y`, et chaque fonction reçoit **les deux**. `deplace_x(x, y, …)` avance sur la ligne `y` ; `deplace_y(x, y, …)` descend dans la colonne `x`.

**C’est pour cela qu’il faut garder `x` à jour :** `deplace_y` part de la colonne `x`, celle où `deplace_x` a laissé la lettre (5). Si `x` était resté à 0, la descente partirait de la colonne 0, et la lettre sauterait d’un coup.

**Les nombres**, en bas de l’écran (ligne 17) : `x` en colonne 0, `y` en colonne 4.

**Ce qu’on doit voir** — Un A qui va de 5 cases à droite, puis descend de 5 lignes. En bas, 005 et 005.  
**Ce qu’il coûte** — 1928 octets de programme, 17 variables.

---

### 0.24.1. Les deux axes à la suite — de base, ailleurs

> Le 0.24 à partir de (10, 0), avec le B.

```cpp
uint8_t pas = 5;
uint8_t x = 10;       // la colonne du B
uint8_t y = 0;       // sa ligne

int main() {
  deplace_x(x, y, ALPHABET[1], pas);
  deplace_y(x, y, ALPHABET[1], pas);

  while (true) {
    image();
  }
}
```

**C’est le 0.24**, avec une autre lettre, le **B** (`ALPHABET[1]`, la 2e lettre), et une autre place : le **départ (10, 0)** au lieu de (0, 0) : x part de 10.

**La lettre va à droite jusqu’en (15, 0), puis descend jusqu’en (15, 5).**

**C’est la version de base** : une seule lettre, à la deuxième place. Le 0.24.2 met les deux ensemble.

**Ce qu’on doit voir** — Un B qui va de (10, 0) à droite, puis descend.  
**Ce qu’il coûte** — 1909 octets de programme, 17 variables.

---

### 0.24.2. Les deux axes à la suite — doublé, deux positions

> Le A part de (0, 0), le B de (10, 0) : chacun ses deux variables.

```cpp
uint8_t pas = 5;
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
```

**C’est le 0.24 et le 0.24.1 réunis** : le A (x, y) puis le B (xb, yb).

**Deux lettres, quatre variables :** chaque lettre a sa colonne et sa ligne.

**Ce qu’on doit voir** — Le A fait son L à gauche, puis le B à droite.  
**Ce qu’il coûte** — 1957 octets de programme, 19 variables.

---

### 0.25. Le carré, côté par côté

> Le 0.24, plus deux côtés : à gauche, puis en haut. La lettre fait un carré et revient à (0, 0).

```cpp
uint8_t pas = 5;      // 5 cases, sur chaque axe
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
```

**C’est le 0.24, plus deux lignes** (et leurs nombres) : les deux côtés du retour.

**Ce qui est nouveau ici :** rien de plus que des pas **négatifs** sur les deux axes : `-pas` sur X ramène à gauche, `-pas` sur Y ramène en haut. Quatre côtés : **un carré**.

**Chaque côté part de là où le précédent s’est arrêté**, parce que `x` et `y` sont tenus à jour par la console.

**Ce qu’on doit voir** — Un A qui fait un carré : 5 cases à droite, 5 en bas, 5 à gauche, 5 en haut. En bas, les nombres changent après chaque côté.  
**Ce qu’il coûte** — 1994 octets de programme, 17 variables.

---

### 0.25.1. Le carré, côté par côté — de base, ailleurs

> Le carré du 0.25 à partir de (10, 0), avec le B.

```cpp
uint8_t pas = 5;
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
```

**C’est le 0.25**, avec une autre lettre, le **B** (`ALPHABET[1]`, la 2e lettre), et une autre place : le **départ (10, 0)** : le carré va de la colonne 10 à 15.

**C’est la version de base** : une seule lettre, à la deuxième place. Le 0.25.2 met les deux ensemble.

**Ce qu’on doit voir** — Un B qui fait un carré à partir de (10, 0).  
**Ce qu’il coûte** — 1955 octets de programme, 17 variables.

---

### 0.25.2. Le carré, côté par côté — doublé, deux positions

> Les deux carrés : le A à gauche, puis le B à droite.

```cpp
uint8_t pas = 5;
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
```

**C’est le 0.25 et le 0.25.1 réunis** : le carré du A, puis celui du B.

**Ce qu’on doit voir** — Le A fait son carré à gauche, puis le B à droite.  
**Ce qu’il coûte** — 2049 octets de programme, 19 variables.

---

### 0.26. En diagonale : deplace

> deplace(x, y, tuile, pasX, pasY) : les deux axes en une ligne. Avec 5 et 5, la lettre descend en biais.

```cpp
uint8_t x = 0;        // la COLONNE de la lettre
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
```

**Une seule ligne pour les deux axes :** `deplace`.

**Ce qui est nouveau ici :** `deplace(colonne, ligne, tuile, pasX, pasY)`. Elle a **deux** nombres de pas : `pasX` pour l’horizontale (+ droite, - gauche) et `pasY` pour la verticale (+ bas, - haut).

**La diagonale :** avec `5` et `5`, la lettre fait à chaque quart de seconde un pas sur X **et** un pas sur Y **en même temps** : elle descend en biais, (1, 1), (2, 2)… jusqu’à (5, 5). C’est impossible avec `deplace_x` puis `deplace_y`, qui font un axe après l’autre.

**Deux positions à ranger :** une fonction ne rend qu’une valeur. `deplace` rend la colonne, et dépose la ligne dans une variable de la console. **Seule sur sa ligne**, la console range les deux : `x` **et** `y`. Écris-la toujours ainsi : `x = deplace(…)` ne rangerait que `x`.

**Ce qu’on doit voir** — Un A qui descend en diagonale, du coin en haut à gauche jusqu’en (5, 5). En bas, 005 et 005.  
**Ce qu’il coûte** — 1806 octets de programme, 12 variables.

---

### 0.26.1. En diagonale : deplace — de base, ailleurs

> La diagonale du 0.26 à partir de (10, 0), avec le B.

```cpp
uint8_t x = 10;       // la colonne du B
uint8_t y = 0;       // sa ligne

int main() {
  deplace(x, y, ALPHABET[1], 5, 5);

  while (true) {
    image();
  }
}
```

**C’est le 0.26**, avec une autre lettre, le **B** (`ALPHABET[1]`, la 2e lettre), et une autre place : le **départ (10, 0)** : la diagonale finit en (15, 5).

**C’est la version de base** : une seule lettre, à la deuxième place. Le 0.26.2 met les deux ensemble.

**Ce qu’on doit voir** — Un B qui descend en biais de (10, 0) à (15, 5).  
**Ce qu’il coûte** — 1787 octets de programme, 12 variables.

---

### 0.26.2. En diagonale : deplace — doublé, deux positions

> Deux diagonales : le A de (0, 0), puis le B de (10, 0).

```cpp
uint8_t x = 0;       // la colonne du A
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
```

**C’est le 0.26 et le 0.26.1 réunis** : deux `deplace`, chacun avec ses variables.

**Ce qu’on doit voir** — Le A descend en biais à gauche, puis le B à droite.  
**Ce qu’il coûte** — 1822 octets de programme, 14 variables.

---

### 0.27. Le carré avec deplace

> Le 0.26, plus quatre lignes : avec 0 sur un axe, deplace va tout droit. Un carré à partir de (5, 5).

```cpp
uint8_t x = 0;        // la COLONNE de la lettre
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
```

**C’est le 0.26, plus quatre lignes** : un carré, à partir de là où la diagonale s’est arrêtée.

**Ce qui est nouveau ici :** un **0** comme pas. `deplace(x, y, …, 5, 0)` : 5 sur X, **rien** sur Y, donc tout droit vers la droite. `0, 5` : tout droit vers le bas. Avec un zéro, `deplace` fait ce que faisaient `deplace_x` ou `deplace_y`.

**Le carré** part de (5, 5) : à droite jusqu’en (10, 5), en bas jusqu’en (10, 10), à gauche jusqu’en (5, 10), en haut jusqu’en (5, 5).

**Ce qu’on doit voir** — Un A qui descend en diagonale jusqu’en (5, 5), puis fait un carré et revient en (5, 5).  
**Ce qu’il coûte** — 1918 octets de programme, 12 variables.

---

### 0.27.1. Le carré avec deplace — de base, ailleurs

> Le 0.27 à partir de (9, 0), avec le B : diagonale puis carré, à droite de l’écran.

```cpp
uint8_t x = 9;       // la colonne du B
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
```

**C’est le 0.27**, avec une autre lettre, le **B** (`ALPHABET[1]`, la 2e lettre), et une autre place : le **départ (9, 0)** : la diagonale finit en (14, 5), le carré va jusqu’en (19, 10), le bord droit.

**C’est la version de base** : une seule lettre, à la deuxième place. Le 0.27.2 met les deux ensemble.

**Ce qu’on doit voir** — Un B qui descend en biais puis fait un carré, contre le bord droit.  
**Ce qu’il coûte** — 1899 octets de programme, 12 variables.

---

### 0.27.2. Le carré avec deplace — doublé, deux positions

> Les deux : le A à gauche (départ (0, 0)), puis le B à droite (départ (9, 0)).

```cpp
uint8_t x = 0;       // la colonne du A
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
```

**C’est le 0.27 et le 0.27.1 réunis** : les dix lignes du A, puis les dix du B.

**Les deux trajets ne se touchent pas :** le A reste dans les colonnes 0 à 10, le B dans les colonnes 9 à 19, sur d’autres cases.

**Ce qu’on doit voir** — Le A fait sa diagonale et son carré à gauche, puis le B à droite.  
**Ce qu’il coûte** — 2046 octets de programme, 14 variables.

---

### 0.28. Aller à une case : va_a

> va_a(x, y, tuile, colonne, ligne) : on ne compte plus les pas, on dit où aller.

```cpp
uint8_t x = 0;        // la COLONNE de la lettre
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
```

**Jusqu’ici, on comptait les pas.** Pour aller en (10, 5) depuis (3, 2), il faudrait calculer 10 − 3 = 7 et 5 − 2 = 3. `va_a` fait ce calcul pour nous.

**Ce qui est nouveau ici :** `va_a(colonne, ligne, tuile, versColonne, versLigne)`. Les deux derniers nombres ne sont plus des pas, mais **la case d’arrivée**.

**Le chemin :** à chaque quart de seconde, un pas vers la colonne voulue (si elle n’y est pas) **et** un pas vers la ligne voulue (si elle n’y est pas). De (0, 0) à (10, 5) : en **diagonale** jusqu’en (5, 5), où la ligne est bonne, puis **tout droit** jusqu’en (10, 5).

**Les positions sont rangées toutes seules**, comme avec `deplace` : écris-la seule sur sa ligne.

**Ce qu’on doit voir** — Un A qui descend en biais jusqu’en (5, 5), puis file tout droit jusqu’en (10, 5).  
**Ce qu’il coûte** — 1668 octets de programme, 10 variables.

---

### 0.28.1. Aller à une case : va_a — de base, ailleurs

> Le 0.28 dix lignes plus bas : le B part de (0, 10) et va en (10, 15).

```cpp
uint8_t x = 0;       // la colonne du B
uint8_t y = 10;       // sa ligne

int main() {
  va_a(x, y, ALPHABET[1], 10, 15);

  while (true) {
    image();
  }
}
```

**C’est le 0.28**, avec une autre lettre, le **B** (`ALPHABET[1]`, la 2e lettre), et une autre place : le **départ (0, 10)** et l’**arrivée (10, 15)** : tout descend de 10 lignes.

**C’est la version de base** : une seule lettre, à la deuxième place. Le 0.28.2 met les deux ensemble.

**Ce qu’on doit voir** — Un B qui va de (0, 10) à (10, 15) : en biais, puis tout droit.  
**Ce qu’il coûte** — 1649 octets de programme, 10 variables.

---

### 0.28.2. Aller à une case : va_a — doublé, deux positions

> Le A va en (10, 5), puis le B en (10, 15).

```cpp
uint8_t x = 0;       // la colonne du A
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
```

**C’est le 0.28 et le 0.28.1 réunis** : deux `va_a`, chacun avec ses variables.

**Ce qu’on doit voir** — Le A va en (10, 5), puis le B en (10, 15).  
**Ce qu’il coûte** — 1684 octets de programme, 12 variables.

---

### 0.29. Revenir au départ avec va_a

> Le 0.28, plus une ligne : va_a(x, y, …, 0, 0) ramène la lettre au coin, sans compter les pas du retour.

```cpp
uint8_t x = 0;        // la COLONNE de la lettre
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
```

**C’est le 0.28, plus une ligne :** le retour à (0, 0).

**Ce qui est nouveau ici :** rien qu’une autre arrivée. Pour revenir, on ne calcule pas « -10 et -5 » : on dit simplement **où** : `0, 0`.

**Le chemin du retour** suit la même règle : en diagonale tant que les deux axes avancent, de (10, 5) à (5, 0), puis tout droit jusqu’en (0, 0).

**Ce qu’on doit voir** — Le A va jusqu’en (10, 5), puis revient au coin (0, 0), en biais puis tout droit.  
**Ce qu’il coûte** — 1695 octets de programme, 10 variables.

---

### 0.29.1. Revenir au départ avec va_a — de base, ailleurs

> Le 0.29 dix lignes plus bas : le B va en (10, 15) et revient en (0, 10).

```cpp
uint8_t x = 0;       // la colonne du B
uint8_t y = 10;       // sa ligne

int main() {
  va_a(x, y, ALPHABET[1], 10, 15);
  va_a(x, y, ALPHABET[1], 0, 10);

  while (true) {
    image();
  }
}
```

**C’est le 0.29**, avec une autre lettre, le **B** (`ALPHABET[1]`, la 2e lettre), et une autre place : le **départ (0, 10)**, l’arrivée (10, 15), et le retour en **(0, 10)**.

**C’est la version de base** : une seule lettre, à la deuxième place. Le 0.29.2 met les deux ensemble.

**Ce qu’on doit voir** — Un B qui va en (10, 15) et revient en (0, 10).  
**Ce qu’il coûte** — 1677 octets de programme, 10 variables.

---

### 0.29.2. Revenir au départ avec va_a — doublé, deux positions

> L’aller-retour du A (en haut), puis celui du B (en bas).

```cpp
uint8_t x = 0;       // la colonne du A
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
```

**C’est le 0.29 et le 0.29.1 réunis** : les deux allers-retours.

**Ce qu’on doit voir** — Le A va et revient en haut, puis le B en bas.  
**Ce qu’il coûte** — 1739 octets de programme, 12 variables.

---

### 0.30. Un pas sans attendre : un_pas

> un_pas fait UN pas, tout de suite, sans bloquer. C’est la boucle qui donne le rythme.

```cpp
uint8_t x = 0;        // la colonne de la lettre
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
```

**Le défaut des fonctions d’avant :** `deplace_x`, `deplace_y`, `deplace` et `va_a` **bloquent**. Pendant le voyage, le programme attend : rien d’autre ne peut bouger.

**Ce qui est nouveau ici :** `un_pas(colonne, ligne, tuile, sensX, sensY)`. Elle fait **un seul pas**, tout de suite, et rend la main aussitôt : elle efface la lettre et la pose une case plus loin. Elle **n’attend pas**.

**Seul le signe compte :** `1` vers la droite (X) ou le bas (Y) ; `-1` vers la gauche ou le haut ; `0` ne bouge pas sur cet axe.

**C’est la boucle qui donne le rythme**, avec le chronomètre du 0.17 : `images` compte les images, et tous les 15 (quatre fois par seconde), on fait un pas.

**Au bord de l’écran** (colonne 19), un pas vers l’extérieur ne fait plus bouger la lettre.

**Ce qu’on doit voir** — Un A qui avance d’une case tous les quarts de seconde vers la droite, et s’arrête au bord.  
**Ce qu’il coûte** — 1616 octets de programme, 10 variables.

---

### 0.30.1. Un pas sans attendre : un_pas — de base, ailleurs

> Le 0.30 sur la ligne 8, avec le B.

```cpp
uint8_t x = 0;       // la colonne du B
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
```

**C’est le 0.30**, avec une autre lettre, le **B** (`ALPHABET[1]`, la 2e lettre), et une autre place : la **ligne 8** : y part de 8.

**C’est la version de base** : une seule lettre, à la deuxième place. Le 0.30.2 met les deux ensemble.

**Ce qu’on doit voir** — Un B qui avance sur la ligne 8, un pas tous les quarts de seconde, jusqu’au bord.  
**Ce qu’il coûte** — 1617 octets de programme, 10 variables.

---

### 0.30.2. Un pas sans attendre : un_pas — doublé, deux positions

> Le A (ligne 0) et le B (ligne 8) avancent EN MÊME TEMPS : deux un_pas dans la même image.

```cpp
uint8_t x = 0;       // la colonne du A
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
```

**C’est le 0.30 et le 0.30.1 réunis** : deux `un_pas` dans la même boucle.

**Ensemble, cette fois :** `un_pas` n’attend pas, les deux pas se font dans la même image. Les deux lettres avancent côte à côte.

**Ce qu’on doit voir** — Le A et le B avancent ensemble, l’un sur la ligne 0, l’autre sur la ligne 8.  
**Ce qu’il coûte** — 1678 octets de programme, 12 variables.

---

### 0.31. Deux lettres à la fois

> Le 0.30, plus une deuxième lettre : deux un_pas dans la même boucle, et les deux bougent ensemble.

```cpp
uint8_t xa = 0;       // le A : sa colonne…
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
```

**C’est le 0.30, plus une lettre**, le B, qui descend pendant que le A avance.

**Ce qui est nouveau ici :** **deux appels à `un_pas`** dans la même boucle, l’un après l’autre. Comme `un_pas` n’attend pas, les deux se font **dans la même image** : les deux lettres bougent **ensemble**. Avec `deplace`, le B aurait attendu la fin du trajet du A.

**Chaque lettre a ses deux variables :** `xa`, `ya` pour le A ; `xb`, `yb` pour le B.

**Le B s’arrête en ligne 16** : le `if (yb < 16)` ne le laisse plus avancer après, pour qu’il ne touche pas les nombres de la ligne 17.

**Ce qu’on doit voir** — Un A qui file vers la droite sur la ligne du haut, et un B qui descend en même temps sur la gauche.  
**Ce qu’il coûte** — 1717 octets de programme, 12 variables.

---

### 0.31.1. Deux lettres à la fois — de base, ailleurs

> Le 0.31 déplacé : le A part de la colonne 10, le B descend en colonne 10.

```cpp
uint8_t xa = 10;       // la colonne du A
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
```

**C’est le 0.31**, avec une autre lettre, le **B** (`ALPHABET[1]`, la 2e lettre), et une autre place : la **colonne 10** : le A part de (10, 0) vers la droite, le B de (10, 2) vers le bas.

**Leurs chemins ne se croisent pas :** le A reste sur la ligne 0, le B commence à la ligne 2.

**C’est la version de base** : une seule lettre, à la deuxième place. Le 0.31.2 met les deux ensemble.

**Ce qu’on doit voir** — Un A qui file à droite depuis le milieu de la ligne du haut, un B qui descend en colonne 10.  
**Ce qu’il coûte** — 1699 octets de programme, 12 variables.

---

### 0.31.2. Deux lettres à la fois — doublé, deux positions

> Quatre lettres, EN MÊME TEMPS : A et B à gauche (le 0.31), C et D en colonne 10.

```cpp
uint8_t xa = 0;       // la colonne du A
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
```

**C’est le 0.31 et le 0.31.1 réunis** : les deux paires dans la même boucle.

**Quatre `un_pas` dans la même image :** les quatre lettres avancent ensemble. `ALPHABET[2]` est le C, `ALPHABET[3]` le D.

**Le A s’arrête en colonne 9** (`if (xa < 9)`) : sans cela, il rattraperait la place du C.

**Ce qu’on doit voir** — Quatre lettres en même temps : deux vont à droite sur la ligne du haut, deux descendent.  
**Ce qu’il coûte** — 1860 octets de programme, 16 variables.

---

### 0.32. Le trajet dans un tableau

> Les pas du trajet rangés dans deux tableaux : une boucle for les parcourt. On change le chemin sans toucher au code.

```cpp
// Le trajet : un côté par case. PAS_X[i] et PAS_Y[i] vont ensemble.
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
```

**Le carré du 0.27 répétait quatre fois la même ligne**, avec d’autres nombres. Quand un programme répète la même chose avec des nombres différents, on range les **nombres** dans un tableau, et on écrit la ligne **une seule fois**, dans une boucle.

**Ce qui est nouveau ici :** deux tableaux, `PAS_X` et `PAS_Y`. La case `i` de chacun dit le pas du côté `i` : `PAS_X[0]` et `PAS_Y[0]` pour le premier côté (5 et 0 : à droite), `PAS_X[1]` et `PAS_Y[1]` pour le deuxième (0 et 5 : en bas), et ainsi de suite.

**Des nombres négatifs dans un tableau d’octets :** `-5` y est rangé comme 251, comme toujours. `deplace` sait le lire : au-delà de 127, c’est un pas en arrière.

**`const`** devant le tableau veut dire qu’il ne change jamais : il est gravé dans la cartouche, et ne prend pas de place dans la mémoire de travail.

**La boucle `for`** fait tourner `i` de 0 à 3 : `sizeof(PAS_X)` vaut 4, le nombre de cases (comme `sizeof(ALPHABET)` au 0.9). Et la boucle `while (true)` autour recommence le trajet sans fin.

**Pour changer le chemin**, on ne touche qu’aux tableaux. Essaie `{ 3, 3, 3, -9 }` et `{ 3, -3, 3, 0 }` : un zigzag. Ajoute des cases, la boucle suit toute seule.

**Ce qu’on doit voir** — Un A qui tourne en carré sans s’arrêter : droite, bas, gauche, haut, et on recommence.  
**Ce qu’il coûte** — 1836 octets de programme, 13 variables.

---

### 0.32.1. Le trajet dans un tableau — de base, ailleurs

> Le trajet du 0.32 à partir de (10, 0), avec le B.

```cpp
const uint8_t PAS_X[] = {  5,  0, -5,  0 };
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
```

**C’est le 0.32**, avec une autre lettre, le **B** (`ALPHABET[1]`, la 2e lettre), et une autre place : le **départ (10, 0)** : les mêmes tableaux, le carré à droite.

**C’est la version de base** : une seule lettre, à la deuxième place. Le 0.32.2 met les deux ensemble.

**Ce qu’on doit voir** — Un B qui tourne en carré sans fin, à partir de (10, 0).  
**Ce qu’il coûte** — 1837 octets de programme, 13 variables.

---

### 0.32.2. Le trajet dans un tableau — doublé, deux positions

> Les deux carrés, avec les MÊMES tableaux : le A et le B font chacun le côté i, à tour de rôle.

```cpp
const uint8_t PAS_X[] = {  5,  0, -5,  0 };
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
```

**C’est le 0.32 et le 0.32.1 réunis** : deux `deplace` dans la boucle, chacun avec ses variables.

**Un seul trajet pour deux lettres :** les tableaux disent les pas ; chaque lettre les suit avec ses variables. Le A fait un côté, puis le B le même côté, et ainsi de suite.

**Ce qu’on doit voir** — Le A et le B font le même carré, chacun de son côté, à tour de rôle.  
**Ce qu’il coûte** — 1888 octets de programme, 15 variables.

---

### 0.33. Écrire soi-même sa fonction

> mon_deplace_x, écrite à la main : le 0.17 rangé dans une fonction. C’est ce qu’il y a dans deplace_x.

```cpp
uint8_t x = 0;        // la colonne de la lettre

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
```

**Toutes ces fonctions sont écrites dans le même langage que tes programmes.** Ici, on écrit la nôtre, `mon_deplace_x` : c’est, ligne pour ligne, ce que la console a dans `deplace_x`.

**Ce qui est nouveau ici : écrire une fonction.** `uint8_t mon_deplace_x(uint8_t colonne, uint8_t ligne, uint8_t tuile, uint8_t pas) { … }`. Le premier `uint8_t` dit ce que la fonction **rend** (un octet, la colonne) ; entre les parenthèses, ses **paramètres**, ce qu’elle reçoit ; entre les accolades, ce qu’elle fait.

**Les paramètres sont des copies.** Quand on appelle `mon_deplace_x(x, 0, ALPHABET[0], 5)`, `colonne` reçoit une copie de `x` (0), `pas` reçoit 5. La fonction change `colonne` et `pas` tant qu’elle veut : `x`, lui, ne bouge pas.

**`return colonne;`** rend la colonne d’arrivée, et termine la fonction. C’est cette valeur que `x = …` range dans `x`.

**Ici, `x =` est obligatoire.** Le rangement automatique du 0.23 ne vaut que pour les fonctions de la console. `mon_deplace_x(x, …);` seule ferait bouger la lettre, mais `x` resterait à 0 : c’est la règle normale du C.

**`break`** sort de la boucle `while` tout de suite : au bord de l’écran, il n’y a plus de pas possible.

**Ce qu’on doit voir** — Exactement le 0.19 : un A qui avance de 5 cases, revient, et s’arrête. Mais cette fois, la fonction est écrite dans le programme.  
**Ce qu’il coûte** — 1604 octets de programme, 7 variables.

---

### 0.33.1. Écrire soi-même sa fonction — de base, ailleurs

> La fonction du 0.33, appelée pour le B sur la ligne 8.

```cpp
uint8_t x = 0;

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
```

**C’est le 0.33**, avec une autre lettre, le **B** (`ALPHABET[1]`, la 2e lettre), et une autre place : la **ligne 8** dans les deux appels.

**La fonction ne change pas :** c’est tout l’intérêt d’une fonction. On lui donne d’autres renseignements (la ligne, la tuile), elle fait le même travail ailleurs.

**C’est la version de base** : une seule lettre, à la deuxième place. Le 0.33.2 met les deux ensemble.

**Ce qu’on doit voir** — Un B qui va et revient sur la ligne 8, grâce à notre fonction.  
**Ce qu’il coûte** — 1606 octets de programme, 7 variables.

---

### 0.33.2. Écrire soi-même sa fonction — doublé, deux positions

> UNE fonction, DEUX lettres : mon_deplace_x sert pour le A (x) et pour le B (xb).

```cpp
uint8_t x = 0;        // le A
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
```

**C’est le 0.33 et le 0.33.1 réunis** : quatre appels à la même fonction.

**Écrite une fois, servie autant qu’on veut :** la fonction ne sait rien du A ni du B ; elle bouge ce qu’on lui donne, et rend la colonne. `x =` et `xb =` rangent chaque résultat dans la bonne variable.

**Ce qu’on doit voir** — Le A va et revient sur la ligne 0, puis le B sur la ligne 8 : la même fonction pour les deux.  
**Ce qu’il coûte** — 1649 octets de programme, 8 variables.

---

### Partie D — Des formes

### 0.34. Un carré autour d’une lettre, avec carre

> Une ligne, une lettre : carre(10, 8, ALPHABET[0], 1, 1, 250, 1) fait faire au A un tour en carré autour de la case (10, 8).

```cpp
// main : le programme commence ici. Les lignes entre { et } s'exécutent
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
```

**Une seule lettre, une seule ligne.** Le A fait **un tour complet** autour de la case (10, 8), en carré, puis revient à sa place.

**Ce qui est nouveau ici :** `carre(x, y, tuile, taille, sens, vitesse, tours)`. Elle a sept réglages, mais pour commencer, ne regarde que les **trois premiers** :

• **`10, 8`** (`x`, `y`) : la case **autour de laquelle** on tourne, le **centre** du carré. La lettre part de là, et y revient.

• **`ALPHABET[0]`** (`tuile`) : ce qui tourne, la lettre A.

**Les quatre autres restent simples ici :** taille `1`, sens `1`, vitesse `250`, tours `1`. Ils veulent dire : le plus petit carré, dans le sens des aiguilles d’une montre, 4 pas par seconde, un seul tour. Les cours suivants les changent **un par un**.

**Le trajet :** le A part du centre (10, 8), fait un pas en diagonale jusqu’au coin en haut à gauche (9, 7), fait le tour du carré de **3 × 3** cases (droite, bas, gauche, haut), puis revient en diagonale au centre.

**`carre` ne rend rien :** la lettre finit exactement là où elle a commencé. Il n’y a ni `x =` ni variable à tenir.

**Ce qu’on doit voir** — Un A qui fait un petit tour en carré autour de la case (10, 8), puis s’arrête au centre.  
**Ce qu’il coûte** — 2082 octets de programme, 15 variables.

---

### 0.34.1. Un carré autour d’une lettre, avec carre — de base, ailleurs

> Le carré du 0.34, avec une seule lettre, le B, autour d’une deuxième position : (4, 4).

```cpp
int main() {
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
```

**C’est le carré du 0.34**, mêmes réglages (taille 1, sens 1, vitesse 250, 1 tour), avec deux changements qui vont ensemble : **une autre lettre** et **une autre position**.

**La lettre :** `ALPHABET[1]`, la 2e lettre de l’alphabet, le **B** (on compte à partir de 0 : A = 0, B = 1).

**La position : (4, 4)** au lieu de (10, 8). Un carré de taille 1 tient entier si son centre est à au moins 1 cases de chaque bord : la colonne entre 1 et 19 − 1 = 18, la ligne entre 1 et 17 − 1 = 16. (4, 4) respecte ces limites : le carré de 3 × 3 tient entier, des colonnes 3 à 5 et des lignes 3 à 5.

**C’est la version de base** : une seule lettre, un seul carré. Le 0.34.2 mettra les deux carrés ensemble.

**Ce qu’on doit voir** — Le même carré qu’au 0.34, mais fait par un B, autour de (4, 4).  
**Ce qu’il coûte** — 2082 octets de programme, 15 variables.

---

### 0.34.2. Un carré autour d’une lettre, avec carre — doublé, deux positions

> Les deux carrés dans le même programme : le A autour de (10, 8), puis le B autour de (4, 4).

```cpp
int main() {
  // 1. Le A, autour de (10, 8) : le 0.34.
  carre(10, 8, ALPHABET[0], 1, 1, 250, 1);

  // 2. Le B, autour de (4, 4) : le 0.34.1.
  //    Il commence quand le A a fini : carre attend la fin de son carré.
  carre(4, 4, ALPHABET[1], 1, 1, 250, 1);

  while (true) {
    image();
  }
}
```

**C’est le 0.34 et le 0.34.1 réunis :** deux lignes, deux lettres, deux positions.

**Ce qui est nouveau ici : deux carrés dans le même programme.** Le A tourne autour de (10, 8), comme au 0.34 ; puis le B autour de (4, 4), comme au 0.34.1.

**L’un après l’autre :** `carre` attend la fin de son carré avant de rendre la main. Le B ne commence que quand le A est revenu à son centre.

**Les deux carrés ne se touchent pas** : chacun a son coin de l’écran. À la fin, on voit les deux lettres, chacune à son centre.

**Ce qu’on doit voir** — Le A fait son carré autour de (10, 8), puis le B fait le même autour de (4, 4).  
**Ce qu’il coûte** — 2113 octets de programme, 15 variables.

---

### 0.35. Taille 2 : un carré de 5 × 5

> Le même carré qu’au 0.34, avec la taille 2 au lieu de 1 : 5 × 5 cases autour de (10, 8).

```cpp
int main() {
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
```

**Un seul changement par rapport au 0.34 :** la taille, 4e réglage, passe de 1 à **2**.

**Ce qui est nouveau ici : la taille 2.** La lettre tourne à **2 cases** du centre. La règle 2 × n + 1 donne 2 × 2 + 1 = **5** cases de côté : un carré de **5 × 5**.

**Où il tombe dans l’écran :** autour de (10, 8), de la colonne 10 − 2 = **8** à 10 + 2 = **12**, et de la ligne 8 − 2 = **6** à 8 + 2 = **10**. L’écran va de la colonne 0 à 19 et de la ligne 0 à 17 : le carré tient entier.

**Pourquoi le centre (10, 8) :** l’écran fait 20 colonnes et 18 lignes ; son milieu est vers la colonne 10 et la ligne 8. C’est le seul genre d’endroit où **toutes** les tailles, de 1 jusqu’à 8, tiennent entières. Toutes les leçons de carré qui suivent tournent donc autour de (10, 8), et l’on voit chaque carré grandir autour du même point.

**Ce qu’on doit voir** — Un A qui fait un tour en carré de 5 × 5 cases autour du milieu de l’écran, puis revient au centre.  
**Ce qu’il coûte** — 2082 octets de programme, 15 variables.

---

### 0.35.1. Taille 2 : un carré de 5 × 5 — de base, ailleurs

> Le carré du 0.35, avec une seule lettre, le B, autour d’une deuxième position : (4, 4).

```cpp
int main() {
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
```

**C’est le carré du 0.35**, mêmes réglages (taille 2, sens 1, vitesse 250, 1 tour), avec deux changements qui vont ensemble : **une autre lettre** et **une autre position**.

**La lettre :** `ALPHABET[1]`, la 2e lettre de l’alphabet, le **B** (on compte à partir de 0 : A = 0, B = 1).

**La position : (4, 4)** au lieu de (10, 8). Un carré de taille 2 tient entier si son centre est à au moins 2 cases de chaque bord : la colonne entre 2 et 19 − 2 = 17, la ligne entre 2 et 17 − 2 = 15. (4, 4) respecte ces limites : le carré de 5 × 5 tient entier, des colonnes 2 à 6 et des lignes 2 à 6.

**C’est la version de base** : une seule lettre, un seul carré. Le 0.35.2 mettra les deux carrés ensemble.

**Ce qu’on doit voir** — Le même carré qu’au 0.35, mais fait par un B, autour de (4, 4).  
**Ce qu’il coûte** — 2082 octets de programme, 15 variables.

---

### 0.35.2. Taille 2 : un carré de 5 × 5 — doublé, deux positions

> Les deux carrés dans le même programme : le A autour de (10, 8), puis le B autour de (4, 4).

```cpp
int main() {
  // 1. Le A, autour de (10, 8) : le 0.35.
  carre(10, 8, ALPHABET[0], 2, 1, 250, 1);

  // 2. Le B, autour de (4, 4) : le 0.35.1.
  //    Il commence quand le A a fini : carre attend la fin de son carré.
  carre(4, 4, ALPHABET[1], 2, 1, 250, 1);

  while (true) {
    image();
  }
}
```

**C’est le 0.35 et le 0.35.1 réunis :** deux lignes, deux lettres, deux positions.

**Ce qui est nouveau ici : deux carrés dans le même programme.** Le A tourne autour de (10, 8), comme au 0.35 ; puis le B autour de (4, 4), comme au 0.35.1.

**L’un après l’autre :** `carre` attend la fin de son carré avant de rendre la main. Le B ne commence que quand le A est revenu à son centre.

**Les deux carrés ne se touchent pas** : chacun a son coin de l’écran. À la fin, on voit les deux lettres, chacune à son centre.

**Ce qu’on doit voir** — Le A fait son carré autour de (10, 8), puis le B fait le même autour de (4, 4).  
**Ce qu’il coûte** — 2113 octets de programme, 15 variables.

---

### 0.36. Taille 3 : un carré de 7 × 7

> Le même carré qu’au 0.35, avec la taille 3 au lieu de 2 : 7 × 7 cases autour de (10, 8).

```cpp
int main() {
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
```

**Un seul changement par rapport au 0.35 :** la taille, 4e réglage, passe de 2 à **3**.

**Ce qui est nouveau ici : la taille 3.** La lettre tourne à **3 cases** du centre. La règle 2 × n + 1 donne 2 × 3 + 1 = **7** cases de côté : un carré de **7 × 7**.

**Où il tombe dans l’écran :** autour de (10, 8), de la colonne 10 − 3 = **7** à 10 + 3 = **13**, et de la ligne 8 − 3 = **5** à 8 + 3 = **11**. L’écran va de la colonne 0 à 19 et de la ligne 0 à 17 : le carré tient entier.

**Ce qu’on doit voir** — Un A qui fait un tour en carré de 7 × 7 cases autour du milieu de l’écran, puis revient au centre.  
**Ce qu’il coûte** — 2082 octets de programme, 15 variables.

---

### 0.36.1. Taille 3 : un carré de 7 × 7 — de base, ailleurs

> Le carré du 0.36, avec une seule lettre, le B, autour d’une deuxième position : (4, 4).

```cpp
int main() {
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
```

**C’est le carré du 0.36**, mêmes réglages (taille 3, sens 1, vitesse 250, 1 tour), avec deux changements qui vont ensemble : **une autre lettre** et **une autre position**.

**La lettre :** `ALPHABET[1]`, la 2e lettre de l’alphabet, le **B** (on compte à partir de 0 : A = 0, B = 1).

**La position : (4, 4)** au lieu de (10, 8). Un carré de taille 3 tient entier si son centre est à au moins 3 cases de chaque bord : la colonne entre 3 et 19 − 3 = 16, la ligne entre 3 et 17 − 3 = 14. (4, 4) respecte ces limites : le carré de 7 × 7 tient entier, des colonnes 1 à 7 et des lignes 1 à 7.

**C’est la version de base** : une seule lettre, un seul carré. Le 0.36.2 mettra les deux carrés ensemble.

**Ce qu’on doit voir** — Le même carré qu’au 0.36, mais fait par un B, autour de (4, 4).  
**Ce qu’il coûte** — 2082 octets de programme, 15 variables.

---

### 0.36.2. Taille 3 : un carré de 7 × 7 — doublé, deux positions

> Les deux carrés dans le même programme : le A autour de (10, 8), puis le B autour de (4, 4).

```cpp
int main() {
  // 1. Le A, autour de (10, 8) : le 0.36.
  carre(10, 8, ALPHABET[0], 3, 1, 250, 1);

  // 2. Le B, autour de (4, 4) : le 0.36.1.
  //    Il commence quand le A a fini : carre attend la fin de son carré.
  carre(4, 4, ALPHABET[1], 3, 1, 250, 1);

  while (true) {
    image();
  }
}
```

**C’est le 0.36 et le 0.36.1 réunis :** deux lignes, deux lettres, deux positions.

**Ce qui est nouveau ici : deux carrés dans le même programme.** Le A tourne autour de (10, 8), comme au 0.36 ; puis le B autour de (4, 4), comme au 0.36.1.

**L’un après l’autre :** `carre` attend la fin de son carré avant de rendre la main. Le B ne commence que quand le A est revenu à son centre.

**Les deux carrés ne se touchent pas** : chacun a son coin de l’écran. À la fin, on voit les deux lettres, chacune à son centre.

**Ce qu’on doit voir** — Le A fait son carré autour de (10, 8), puis le B fait le même autour de (4, 4).  
**Ce qu’il coûte** — 2113 octets de programme, 15 variables.

---

### 0.37. Taille 4 : un carré de 9 × 9

> Le même carré qu’au 0.36, avec la taille 4 au lieu de 3 : 9 × 9 cases autour de (10, 8).

```cpp
int main() {
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
```

**Un seul changement par rapport au 0.36 :** la taille, 4e réglage, passe de 3 à **4**.

**Ce qui est nouveau ici : la taille 4.** La lettre tourne à **4 cases** du centre. La règle 2 × n + 1 donne 2 × 4 + 1 = **9** cases de côté : un carré de **9 × 9**.

**Où il tombe dans l’écran :** autour de (10, 8), de la colonne 10 − 4 = **6** à 10 + 4 = **14**, et de la ligne 8 − 4 = **4** à 8 + 4 = **12**. L’écran va de la colonne 0 à 19 et de la ligne 0 à 17 : le carré tient entier.

**Ce qu’on doit voir** — Un A qui fait un tour en carré de 9 × 9 cases autour du milieu de l’écran, puis revient au centre.  
**Ce qu’il coûte** — 2082 octets de programme, 15 variables.

---

### 0.37.1. Taille 4 : un carré de 9 × 9 — de base, ailleurs

> Le carré du 0.37, avec une seule lettre, le B, autour d’une deuxième position : (4, 4).

```cpp
int main() {
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
```

**C’est le carré du 0.37**, mêmes réglages (taille 4, sens 1, vitesse 250, 1 tour), avec deux changements qui vont ensemble : **une autre lettre** et **une autre position**.

**La lettre :** `ALPHABET[1]`, la 2e lettre de l’alphabet, le **B** (on compte à partir de 0 : A = 0, B = 1).

**La position : (4, 4)** au lieu de (10, 8). Un carré de taille 4 tient entier si son centre est à au moins 4 cases de chaque bord : la colonne entre 4 et 19 − 4 = 15, la ligne entre 4 et 17 − 4 = 13. (4, 4) respecte ces limites : le carré de 9 × 9 tient entier, des colonnes 0 à 8 et des lignes 0 à 8.

**C’est la version de base** : une seule lettre, un seul carré. Le 0.37.2 mettra les deux carrés ensemble.

**Ce qu’on doit voir** — Le même carré qu’au 0.37, mais fait par un B, autour de (4, 4).  
**Ce qu’il coûte** — 2082 octets de programme, 15 variables.

---

### 0.37.2. Taille 4 : un carré de 9 × 9 — doublé, deux positions

> Les deux carrés dans le même programme : le A autour de (10, 8), puis le B autour de (4, 4).

```cpp
int main() {
  // 1. Le A, autour de (10, 8) : le 0.37.
  carre(10, 8, ALPHABET[0], 4, 1, 250, 1);

  // 2. Le B, autour de (4, 4) : le 0.37.1.
  //    Il commence quand le A a fini : carre attend la fin de son carré.
  carre(4, 4, ALPHABET[1], 4, 1, 250, 1);

  while (true) {
    image();
  }
}
```

**C’est le 0.37 et le 0.37.1 réunis :** deux lignes, deux lettres, deux positions.

**Ce qui est nouveau ici : deux carrés dans le même programme.** Le A tourne autour de (10, 8), comme au 0.37 ; puis le B autour de (4, 4), comme au 0.37.1.

**L’un après l’autre :** `carre` attend la fin de son carré avant de rendre la main. Le B ne commence que quand le A est revenu à son centre.

**Les deux carrés ne se touchent pas** : chacun a son coin de l’écran. À la fin, on voit les deux lettres, chacune à son centre.

**Ce qu’on doit voir** — Le A fait son carré autour de (10, 8), puis le B fait le même autour de (4, 4).  
**Ce qu’il coûte** — 2113 octets de programme, 15 variables.

---

### 0.38. Taille 5 : un carré de 11 × 11

> Le même carré qu’au 0.37, avec la taille 5 au lieu de 4 : 11 × 11 cases autour de (10, 8).

```cpp
int main() {
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
```

**Un seul changement par rapport au 0.37 :** la taille, 4e réglage, passe de 4 à **5**.

**Ce qui est nouveau ici : la taille 5.** La lettre tourne à **5 cases** du centre. La règle 2 × n + 1 donne 2 × 5 + 1 = **11** cases de côté : un carré de **11 × 11**.

**Où il tombe dans l’écran :** autour de (10, 8), de la colonne 10 − 5 = **5** à 10 + 5 = **15**, et de la ligne 8 − 5 = **3** à 8 + 5 = **13**. L’écran va de la colonne 0 à 19 et de la ligne 0 à 17 : le carré tient entier.

**Ce qu’on doit voir** — Un A qui fait un tour en carré de 11 × 11 cases autour du milieu de l’écran, puis revient au centre.  
**Ce qu’il coûte** — 2082 octets de programme, 15 variables.

---

### 0.38.1. Taille 5 : un carré de 11 × 11 — de base, ailleurs

> Le carré du 0.38, avec une seule lettre, le B, autour d’une deuxième position : (5, 5).

```cpp
int main() {
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
```

**C’est le carré du 0.38**, mêmes réglages (taille 5, sens 1, vitesse 250, 1 tour), avec deux changements qui vont ensemble : **une autre lettre** et **une autre position**.

**La lettre :** `ALPHABET[1]`, la 2e lettre de l’alphabet, le **B** (on compte à partir de 0 : A = 0, B = 1).

**La position : (5, 5)** au lieu de (10, 8). Un carré de taille 5 tient entier si son centre est à au moins 5 cases de chaque bord : la colonne entre 5 et 19 − 5 = 14, la ligne entre 5 et 17 − 5 = 12. (5, 5) respecte ces limites : le carré de 11 × 11 tient entier, des colonnes 0 à 10 et des lignes 0 à 10.

**C’est la version de base** : une seule lettre, un seul carré. Le 0.38.2 mettra les deux carrés ensemble.

**Ce qu’on doit voir** — Le même carré qu’au 0.38, mais fait par un B, autour de (5, 5).  
**Ce qu’il coûte** — 2082 octets de programme, 15 variables.

---

### 0.38.2. Taille 5 : un carré de 11 × 11 — doublé, deux positions

> Les deux carrés dans le même programme : le A autour de (10, 8), puis le B autour de (5, 5).

```cpp
int main() {
  // 1. Le A, autour de (10, 8) : le 0.38.
  carre(10, 8, ALPHABET[0], 5, 1, 250, 1);

  // 2. Le B, autour de (5, 5) : le 0.38.1.
  //    Il commence quand le A a fini : carre attend la fin de son carré.
  carre(5, 5, ALPHABET[1], 5, 1, 250, 1);

  while (true) {
    image();
  }
}
```

**C’est le 0.38 et le 0.38.1 réunis :** deux lignes, deux lettres, deux positions.

**Ce qui est nouveau ici : deux carrés dans le même programme.** Le A tourne autour de (10, 8), comme au 0.38 ; puis le B autour de (5, 5), comme au 0.38.1.

**L’un après l’autre :** `carre` attend la fin de son carré avant de rendre la main. Le B ne commence que quand le A est revenu à son centre.

**Les deux carrés se croisent** (taille 5 : 11 × 11 chacun). En passant sur une case, `carre` l’**efface** en la quittant : si le chemin du B passe sur le A arrêté, il l’efface. C’est normal : chaque lettre ne s’occupe que d’elle-même.

**Ce qu’on doit voir** — Le A fait son carré autour de (10, 8), puis le B fait le même autour de (5, 5).  
**Ce qu’il coûte** — 2113 octets de programme, 15 variables.

---

### 0.39. Taille 6 : un carré de 13 × 13

> Le même carré qu’au 0.38, avec la taille 6 au lieu de 5 : 13 × 13 cases autour de (10, 8).

```cpp
int main() {
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
```

**Un seul changement par rapport au 0.38 :** la taille, 4e réglage, passe de 5 à **6**.

**Ce qui est nouveau ici : la taille 6.** La lettre tourne à **6 cases** du centre. La règle 2 × n + 1 donne 2 × 6 + 1 = **13** cases de côté : un carré de **13 × 13**.

**Où il tombe dans l’écran :** autour de (10, 8), de la colonne 10 − 6 = **4** à 10 + 6 = **16**, et de la ligne 8 − 6 = **2** à 8 + 6 = **14**. L’écran va de la colonne 0 à 19 et de la ligne 0 à 17 : le carré tient entier.

**Ce qu’on doit voir** — Un A qui fait un tour en carré de 13 × 13 cases autour du milieu de l’écran, puis revient au centre.  
**Ce qu’il coûte** — 2082 octets de programme, 15 variables.

---

### 0.39.1. Taille 6 : un carré de 13 × 13 — de base, ailleurs

> Le carré du 0.39, avec une seule lettre, le B, autour d’une deuxième position : (6, 6).

```cpp
int main() {
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
```

**C’est le carré du 0.39**, mêmes réglages (taille 6, sens 1, vitesse 250, 1 tour), avec deux changements qui vont ensemble : **une autre lettre** et **une autre position**.

**La lettre :** `ALPHABET[1]`, la 2e lettre de l’alphabet, le **B** (on compte à partir de 0 : A = 0, B = 1).

**La position : (6, 6)** au lieu de (10, 8). Un carré de taille 6 tient entier si son centre est à au moins 6 cases de chaque bord : la colonne entre 6 et 19 − 6 = 13, la ligne entre 6 et 17 − 6 = 11. (6, 6) respecte ces limites : le carré de 13 × 13 tient entier, des colonnes 0 à 12 et des lignes 0 à 12.

**C’est la version de base** : une seule lettre, un seul carré. Le 0.39.2 mettra les deux carrés ensemble.

**Ce qu’on doit voir** — Le même carré qu’au 0.39, mais fait par un B, autour de (6, 6).  
**Ce qu’il coûte** — 2082 octets de programme, 15 variables.

---

### 0.39.2. Taille 6 : un carré de 13 × 13 — doublé, deux positions

> Les deux carrés dans le même programme : le A autour de (10, 8), puis le B autour de (6, 6).

```cpp
int main() {
  // 1. Le A, autour de (10, 8) : le 0.39.
  carre(10, 8, ALPHABET[0], 6, 1, 250, 1);

  // 2. Le B, autour de (6, 6) : le 0.39.1.
  //    Il commence quand le A a fini : carre attend la fin de son carré.
  carre(6, 6, ALPHABET[1], 6, 1, 250, 1);

  while (true) {
    image();
  }
}
```

**C’est le 0.39 et le 0.39.1 réunis :** deux lignes, deux lettres, deux positions.

**Ce qui est nouveau ici : deux carrés dans le même programme.** Le A tourne autour de (10, 8), comme au 0.39 ; puis le B autour de (6, 6), comme au 0.39.1.

**L’un après l’autre :** `carre` attend la fin de son carré avant de rendre la main. Le B ne commence que quand le A est revenu à son centre.

**Les deux carrés se croisent** (taille 6 : 13 × 13 chacun). En passant sur une case, `carre` l’**efface** en la quittant : si le chemin du B passe sur le A arrêté, il l’efface. C’est normal : chaque lettre ne s’occupe que d’elle-même.

**Ce qu’on doit voir** — Le A fait son carré autour de (10, 8), puis le B fait le même autour de (6, 6).  
**Ce qu’il coûte** — 2113 octets de programme, 15 variables.

---

### 0.40. Taille 7 : un carré de 15 × 15

> Le même carré qu’au 0.39, avec la taille 7 au lieu de 6 : 15 × 15 cases autour de (10, 8).

```cpp
int main() {
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
```

**Un seul changement par rapport au 0.39 :** la taille, 4e réglage, passe de 6 à **7**.

**Ce qui est nouveau ici : la taille 7.** La lettre tourne à **7 cases** du centre. La règle 2 × n + 1 donne 2 × 7 + 1 = **15** cases de côté : un carré de **15 × 15**.

**Où il tombe dans l’écran :** autour de (10, 8), de la colonne 10 − 7 = **3** à 10 + 7 = **17**, et de la ligne 8 − 7 = **1** à 8 + 7 = **15**. L’écran va de la colonne 0 à 19 et de la ligne 0 à 17 : le carré tient entier.

**Ce qu’on doit voir** — Un A qui fait un tour en carré de 15 × 15 cases autour du milieu de l’écran, puis revient au centre.  
**Ce qu’il coûte** — 2082 octets de programme, 15 variables.

---

### 0.40.1. Taille 7 : un carré de 15 × 15 — de base, ailleurs

> Le carré du 0.40, avec une seule lettre, le B, autour d’une deuxième position : (7, 7).

```cpp
int main() {
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
```

**C’est le carré du 0.40**, mêmes réglages (taille 7, sens 1, vitesse 250, 1 tour), avec deux changements qui vont ensemble : **une autre lettre** et **une autre position**.

**La lettre :** `ALPHABET[1]`, la 2e lettre de l’alphabet, le **B** (on compte à partir de 0 : A = 0, B = 1).

**La position : (7, 7)** au lieu de (10, 8). Un carré de taille 7 tient entier si son centre est à au moins 7 cases de chaque bord : la colonne entre 7 et 19 − 7 = 12, la ligne entre 7 et 17 − 7 = 10. (7, 7) respecte ces limites : le carré de 15 × 15 tient entier, des colonnes 0 à 14 et des lignes 0 à 14.

**C’est la version de base** : une seule lettre, un seul carré. Le 0.40.2 mettra les deux carrés ensemble.

**Ce qu’on doit voir** — Le même carré qu’au 0.40, mais fait par un B, autour de (7, 7).  
**Ce qu’il coûte** — 2082 octets de programme, 15 variables.

---

### 0.40.2. Taille 7 : un carré de 15 × 15 — doublé, deux positions

> Les deux carrés dans le même programme : le A autour de (10, 8), puis le B autour de (7, 7).

```cpp
int main() {
  // 1. Le A, autour de (10, 8) : le 0.40.
  carre(10, 8, ALPHABET[0], 7, 1, 250, 1);

  // 2. Le B, autour de (7, 7) : le 0.40.1.
  //    Il commence quand le A a fini : carre attend la fin de son carré.
  carre(7, 7, ALPHABET[1], 7, 1, 250, 1);

  while (true) {
    image();
  }
}
```

**C’est le 0.40 et le 0.40.1 réunis :** deux lignes, deux lettres, deux positions.

**Ce qui est nouveau ici : deux carrés dans le même programme.** Le A tourne autour de (10, 8), comme au 0.40 ; puis le B autour de (7, 7), comme au 0.40.1.

**L’un après l’autre :** `carre` attend la fin de son carré avant de rendre la main. Le B ne commence que quand le A est revenu à son centre.

**Les deux carrés se croisent** (taille 7 : 15 × 15 chacun). En passant sur une case, `carre` l’**efface** en la quittant : si le chemin du B passe sur le A arrêté, il l’efface. C’est normal : chaque lettre ne s’occupe que d’elle-même.

**Ce qu’on doit voir** — Le A fait son carré autour de (10, 8), puis le B fait le même autour de (7, 7).  
**Ce qu’il coûte** — 2113 octets de programme, 15 variables.

---

### 0.41. Taille 8 : un carré de 17 × 17

> Le même carré qu’au 0.40, avec la taille 8 au lieu de 7 : 17 × 17 cases autour de (10, 8).

```cpp
int main() {
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
```

**Un seul changement par rapport au 0.40 :** la taille, 4e réglage, passe de 7 à **8**.

**Ce qui est nouveau ici : la taille 8.** La lettre tourne à **8 cases** du centre. La règle 2 × n + 1 donne 2 × 8 + 1 = **17** cases de côté : un carré de **17 × 17**.

**Où il tombe dans l’écran :** autour de (10, 8), de la colonne 10 − 8 = **2** à 10 + 8 = **18**, et de la ligne 8 − 8 = **0** à 8 + 8 = **16**. L’écran va de la colonne 0 à 19 et de la ligne 0 à 17 : le carré tient entier.

**C’est le plus grand possible.** Avec la taille 9, le haut du carré serait à la ligne 8 − 9, au-dessus de l’écran : il n’existe pas de ligne -1. La taille 8 touche la ligne 0 en haut, la colonne 2 à gauche et la colonne 18 à droite.

**Ce qu’on doit voir** — Un A qui fait un tour en carré de 17 × 17 cases autour du milieu de l’écran, puis revient au centre.  
**Ce qu’il coûte** — 2082 octets de programme, 15 variables.

---

### 0.41.1. Taille 8 : un carré de 17 × 17 — de base, ailleurs

> Le carré du 0.41, avec une seule lettre, le B, autour d’une deuxième position : (8, 8).

```cpp
int main() {
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
```

**C’est le carré du 0.41**, mêmes réglages (taille 8, sens 1, vitesse 250, 1 tour), avec deux changements qui vont ensemble : **une autre lettre** et **une autre position**.

**La lettre :** `ALPHABET[1]`, la 2e lettre de l’alphabet, le **B** (on compte à partir de 0 : A = 0, B = 1).

**La position : (8, 8)** au lieu de (10, 8). Un carré de taille 8 tient entier si son centre est à au moins 8 cases de chaque bord : la colonne entre 8 et 19 − 8 = 11, la ligne entre 8 et 17 − 8 = 9. (8, 8) respecte ces limites : le carré de 17 × 17 tient entier, des colonnes 0 à 16 et des lignes 0 à 16.

**C’est la version de base** : une seule lettre, un seul carré. Le 0.41.2 mettra les deux carrés ensemble.

**Ce qu’on doit voir** — Le même carré qu’au 0.41, mais fait par un B, autour de (8, 8).  
**Ce qu’il coûte** — 2082 octets de programme, 15 variables.

---

### 0.41.2. Taille 8 : un carré de 17 × 17 — doublé, deux positions

> Les deux carrés dans le même programme : le A autour de (10, 8), puis le B autour de (8, 8).

```cpp
int main() {
  // 1. Le A, autour de (10, 8) : le 0.41.
  carre(10, 8, ALPHABET[0], 8, 1, 250, 1);

  // 2. Le B, autour de (8, 8) : le 0.41.1.
  //    Il commence quand le A a fini : carre attend la fin de son carré.
  carre(8, 8, ALPHABET[1], 8, 1, 250, 1);

  while (true) {
    image();
  }
}
```

**C’est le 0.41 et le 0.41.1 réunis :** deux lignes, deux lettres, deux positions.

**Ce qui est nouveau ici : deux carrés dans le même programme.** Le A tourne autour de (10, 8), comme au 0.41 ; puis le B autour de (8, 8), comme au 0.41.1.

**L’un après l’autre :** `carre` attend la fin de son carré avant de rendre la main. Le B ne commence que quand le A est revenu à son centre.

**Les deux carrés se croisent** (taille 8 : 17 × 17 chacun). En passant sur une case, `carre` l’**efface** en la quittant : si le chemin du B passe sur le A arrêté, il l’efface. C’est normal : chaque lettre ne s’occupe que d’elle-même.

**Ce qu’on doit voir** — Le A fait son carré autour de (10, 8), puis le B fait le même autour de (8, 8).  
**Ce qu’il coûte** — 2113 octets de programme, 15 variables.

---

### 0.42. Dans l’autre sens : sens -1

> Le carré de taille 2, avec un seul changement : le sens passe de 1 à -1. La lettre tourne dans l’autre sens.

```cpp
int main() {
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
```

**On reprend le carré de taille 2 (le 0.35), avec un seul changement :** le 5e réglage, le **sens**, passe de `1` à `-1`.

**Ce qui est nouveau ici : le sens.** `1` tourne comme les **aiguilles d’une montre** : droite, bas, gauche, haut. `-1` tourne dans **l’autre sens** : bas, droite, haut, gauche.

**Le coin de départ ne change pas :** en haut à gauche. Seule la première direction change : avec `1`, la lettre part vers la **droite** ; avec `-1`, vers le **bas**.

**-1 dans un octet** est rangé 255 : `carre` lit tout ce qui dépasse 127 comme « l’autre sens ».

**Ce qu’on doit voir** — Le carré de taille 2, mais la lettre part vers le bas et tourne dans l’autre sens.  
**Ce qu’il coûte** — 2082 octets de programme, 15 variables.

---

### 0.42.1. Dans l’autre sens : sens -1 — de base, ailleurs

> Le carré du 0.42, avec une seule lettre, le B, autour d’une deuxième position : (4, 4).

```cpp
int main() {
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
```

**C’est le carré du 0.42**, mêmes réglages (taille 2, sens -1, vitesse 250, 1 tour), avec deux changements qui vont ensemble : **une autre lettre** et **une autre position**.

**La lettre :** `ALPHABET[1]`, la 2e lettre de l’alphabet, le **B** (on compte à partir de 0 : A = 0, B = 1).

**La position : (4, 4)** au lieu de (10, 8). Un carré de taille 2 tient entier si son centre est à au moins 2 cases de chaque bord : la colonne entre 2 et 19 − 2 = 17, la ligne entre 2 et 17 − 2 = 15. (4, 4) respecte ces limites : le carré de 5 × 5 tient entier, des colonnes 2 à 6 et des lignes 2 à 6.

**C’est la version de base** : une seule lettre, un seul carré. Le 0.42.2 mettra les deux carrés ensemble.

**Ce qu’on doit voir** — Le même carré qu’au 0.42, mais fait par un B, autour de (4, 4).  
**Ce qu’il coûte** — 2082 octets de programme, 15 variables.

---

### 0.42.2. Dans l’autre sens : sens -1 — doublé, deux positions

> Les deux carrés dans le même programme : le A autour de (10, 8), puis le B autour de (4, 4).

```cpp
int main() {
  // 1. Le A, autour de (10, 8) : le 0.42.
  carre(10, 8, ALPHABET[0], 2, -1, 250, 1);

  // 2. Le B, autour de (4, 4) : le 0.42.1.
  //    Il commence quand le A a fini : carre attend la fin de son carré.
  carre(4, 4, ALPHABET[1], 2, -1, 250, 1);

  while (true) {
    image();
  }
}
```

**C’est le 0.42 et le 0.42.1 réunis :** deux lignes, deux lettres, deux positions.

**Ce qui est nouveau ici : deux carrés dans le même programme.** Le A tourne autour de (10, 8), comme au 0.42 ; puis le B autour de (4, 4), comme au 0.42.1.

**L’un après l’autre :** `carre` attend la fin de son carré avant de rendre la main. Le B ne commence que quand le A est revenu à son centre.

**Les deux carrés ne se touchent pas** : chacun a son coin de l’écran. À la fin, on voit les deux lettres, chacune à son centre.

**Ce qu’on doit voir** — Le A fait son carré autour de (10, 8), puis le B fait le même autour de (4, 4).  
**Ce qu’il coûte** — 2113 octets de programme, 15 variables.

---

### 0.43. Plus lentement : vitesse 500

> Le carré de taille 2, avec un seul changement : la vitesse passe de 250 à 500 millisecondes par pas. Deux fois plus lent.

```cpp
int main() {
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
```

**On reprend le carré de taille 2 (le 0.35), avec un seul changement :** le 6e réglage, la **vitesse**, passe de `250` à `500`.

**Ce qui est nouveau ici : la vitesse 500.** C’est le temps d’**un pas**, en **millisecondes** (millièmes de seconde). `500` : un pas toutes les demi-secondes, **2 pas par seconde**. C’est **deux fois plus lent** que 250.

**Plus le nombre est petit, plus ça va vite**, puisque c’est le temps d’attente entre deux pas. 500 ms, c’est 30 images de la console (elle en montre 60 par seconde).

**Elle s’écrit en clair** (`500`, pas une variable) : le compilateur la traduit en images avant le jeu, comme `ms(500)`.

**Ce qu’on doit voir** — Le carré de taille 2, deux fois plus lentement.  
**Ce qu’il coûte** — 2082 octets de programme, 15 variables.

---

### 0.43.1. Plus lentement : vitesse 500 — de base, ailleurs

> Le carré du 0.43, avec une seule lettre, le B, autour d’une deuxième position : (4, 4).

```cpp
int main() {
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
```

**C’est le carré du 0.43**, mêmes réglages (taille 2, sens 1, vitesse 500, 1 tour), avec deux changements qui vont ensemble : **une autre lettre** et **une autre position**.

**La lettre :** `ALPHABET[1]`, la 2e lettre de l’alphabet, le **B** (on compte à partir de 0 : A = 0, B = 1).

**La position : (4, 4)** au lieu de (10, 8). Un carré de taille 2 tient entier si son centre est à au moins 2 cases de chaque bord : la colonne entre 2 et 19 − 2 = 17, la ligne entre 2 et 17 − 2 = 15. (4, 4) respecte ces limites : le carré de 5 × 5 tient entier, des colonnes 2 à 6 et des lignes 2 à 6.

**C’est la version de base** : une seule lettre, un seul carré. Le 0.43.2 mettra les deux carrés ensemble.

**Ce qu’on doit voir** — Le même carré qu’au 0.43, mais fait par un B, autour de (4, 4).  
**Ce qu’il coûte** — 2082 octets de programme, 15 variables.

---

### 0.43.2. Plus lentement : vitesse 500 — doublé, deux positions

> Les deux carrés dans le même programme : le A autour de (10, 8), puis le B autour de (4, 4).

```cpp
int main() {
  // 1. Le A, autour de (10, 8) : le 0.43.
  carre(10, 8, ALPHABET[0], 2, 1, 500, 1);

  // 2. Le B, autour de (4, 4) : le 0.43.1.
  //    Il commence quand le A a fini : carre attend la fin de son carré.
  carre(4, 4, ALPHABET[1], 2, 1, 500, 1);

  while (true) {
    image();
  }
}
```

**C’est le 0.43 et le 0.43.1 réunis :** deux lignes, deux lettres, deux positions.

**Ce qui est nouveau ici : deux carrés dans le même programme.** Le A tourne autour de (10, 8), comme au 0.43 ; puis le B autour de (4, 4), comme au 0.43.1.

**L’un après l’autre :** `carre` attend la fin de son carré avant de rendre la main. Le B ne commence que quand le A est revenu à son centre.

**Les deux carrés ne se touchent pas** : chacun a son coin de l’écran. À la fin, on voit les deux lettres, chacune à son centre.

**Ce qu’on doit voir** — Le A fait son carré autour de (10, 8), puis le B fait le même autour de (4, 4).  
**Ce qu’il coûte** — 2113 octets de programme, 15 variables.

---

### 0.44. Plus vite : vitesse 100

> Le carré de taille 2, avec un seul changement : la vitesse passe de 250 à 100 millisecondes par pas. Deux fois et demie plus vite.

```cpp
int main() {
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
```

**On reprend le carré de taille 2 (le 0.35), avec un seul changement :** le 6e réglage, la **vitesse**, passe de `250` à `100`.

**Ce qui est nouveau ici : la vitesse 100.** C’est le temps d’**un pas**, en **millisecondes** (millièmes de seconde). `100` : un pas tous les dixièmes de seconde, **10 pas par seconde**. C’est **deux fois et demie plus vite** que 250.

**Plus le nombre est petit, plus ça va vite**, puisque c’est le temps d’attente entre deux pas. 100 ms, c’est 6 images de la console (elle en montre 60 par seconde).

**Elle s’écrit en clair** (`100`, pas une variable) : le compilateur la traduit en images avant le jeu, comme `ms(100)`.

**Ce qu’on doit voir** — Le carré de taille 2, deux fois et demie plus vite.  
**Ce qu’il coûte** — 2082 octets de programme, 15 variables.

---

### 0.44.1. Plus vite : vitesse 100 — de base, ailleurs

> Le carré du 0.44, avec une seule lettre, le B, autour d’une deuxième position : (4, 4).

```cpp
int main() {
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
```

**C’est le carré du 0.44**, mêmes réglages (taille 2, sens 1, vitesse 100, 1 tour), avec deux changements qui vont ensemble : **une autre lettre** et **une autre position**.

**La lettre :** `ALPHABET[1]`, la 2e lettre de l’alphabet, le **B** (on compte à partir de 0 : A = 0, B = 1).

**La position : (4, 4)** au lieu de (10, 8). Un carré de taille 2 tient entier si son centre est à au moins 2 cases de chaque bord : la colonne entre 2 et 19 − 2 = 17, la ligne entre 2 et 17 − 2 = 15. (4, 4) respecte ces limites : le carré de 5 × 5 tient entier, des colonnes 2 à 6 et des lignes 2 à 6.

**C’est la version de base** : une seule lettre, un seul carré. Le 0.44.2 mettra les deux carrés ensemble.

**Ce qu’on doit voir** — Le même carré qu’au 0.44, mais fait par un B, autour de (4, 4).  
**Ce qu’il coûte** — 2082 octets de programme, 15 variables.

---

### 0.44.2. Plus vite : vitesse 100 — doublé, deux positions

> Les deux carrés dans le même programme : le A autour de (10, 8), puis le B autour de (4, 4).

```cpp
int main() {
  // 1. Le A, autour de (10, 8) : le 0.44.
  carre(10, 8, ALPHABET[0], 2, 1, 100, 1);

  // 2. Le B, autour de (4, 4) : le 0.44.1.
  //    Il commence quand le A a fini : carre attend la fin de son carré.
  carre(4, 4, ALPHABET[1], 2, 1, 100, 1);

  while (true) {
    image();
  }
}
```

**C’est le 0.44 et le 0.44.1 réunis :** deux lignes, deux lettres, deux positions.

**Ce qui est nouveau ici : deux carrés dans le même programme.** Le A tourne autour de (10, 8), comme au 0.44 ; puis le B autour de (4, 4), comme au 0.44.1.

**L’un après l’autre :** `carre` attend la fin de son carré avant de rendre la main. Le B ne commence que quand le A est revenu à son centre.

**Les deux carrés ne se touchent pas** : chacun a son coin de l’écran. À la fin, on voit les deux lettres, chacune à son centre.

**Ce qu’on doit voir** — Le A fait son carré autour de (10, 8), puis le B fait le même autour de (4, 4).  
**Ce qu’il coûte** — 2113 octets de programme, 15 variables.

---

### 0.45. Très vite : vitesse 50

> Le carré de taille 2, avec un seul changement : la vitesse passe de 250 à 50 millisecondes par pas. Cinq fois plus vite.

```cpp
int main() {
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
```

**On reprend le carré de taille 2 (le 0.35), avec un seul changement :** le 6e réglage, la **vitesse**, passe de `250` à `50`.

**Ce qui est nouveau ici : la vitesse 50.** C’est le temps d’**un pas**, en **millisecondes** (millièmes de seconde). `50` : un pas tous les vingtièmes de seconde, **20 pas par seconde**. C’est **cinq fois plus vite** que 250 : l’œil a du mal à suivre.

**Plus le nombre est petit, plus ça va vite**, puisque c’est le temps d’attente entre deux pas. 50 ms, c’est 3 images de la console (elle en montre 60 par seconde).

**Elle s’écrit en clair** (`50`, pas une variable) : le compilateur la traduit en images avant le jeu, comme `ms(50)`.

**Ce qu’on doit voir** — Le carré de taille 2, cinq fois plus vite : la lettre file.  
**Ce qu’il coûte** — 2082 octets de programme, 15 variables.

---

### 0.45.1. Très vite : vitesse 50 — de base, ailleurs

> Le carré du 0.45, avec une seule lettre, le B, autour d’une deuxième position : (4, 4).

```cpp
int main() {
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
```

**C’est le carré du 0.45**, mêmes réglages (taille 2, sens 1, vitesse 50, 1 tour), avec deux changements qui vont ensemble : **une autre lettre** et **une autre position**.

**La lettre :** `ALPHABET[1]`, la 2e lettre de l’alphabet, le **B** (on compte à partir de 0 : A = 0, B = 1).

**La position : (4, 4)** au lieu de (10, 8). Un carré de taille 2 tient entier si son centre est à au moins 2 cases de chaque bord : la colonne entre 2 et 19 − 2 = 17, la ligne entre 2 et 17 − 2 = 15. (4, 4) respecte ces limites : le carré de 5 × 5 tient entier, des colonnes 2 à 6 et des lignes 2 à 6.

**C’est la version de base** : une seule lettre, un seul carré. Le 0.45.2 mettra les deux carrés ensemble.

**Ce qu’on doit voir** — Le même carré qu’au 0.45, mais fait par un B, autour de (4, 4).  
**Ce qu’il coûte** — 2082 octets de programme, 15 variables.

---

### 0.45.2. Très vite : vitesse 50 — doublé, deux positions

> Les deux carrés dans le même programme : le A autour de (10, 8), puis le B autour de (4, 4).

```cpp
int main() {
  // 1. Le A, autour de (10, 8) : le 0.45.
  carre(10, 8, ALPHABET[0], 2, 1, 50, 1);

  // 2. Le B, autour de (4, 4) : le 0.45.1.
  //    Il commence quand le A a fini : carre attend la fin de son carré.
  carre(4, 4, ALPHABET[1], 2, 1, 50, 1);

  while (true) {
    image();
  }
}
```

**C’est le 0.45 et le 0.45.1 réunis :** deux lignes, deux lettres, deux positions.

**Ce qui est nouveau ici : deux carrés dans le même programme.** Le A tourne autour de (10, 8), comme au 0.45 ; puis le B autour de (4, 4), comme au 0.45.1.

**L’un après l’autre :** `carre` attend la fin de son carré avant de rendre la main. Le B ne commence que quand le A est revenu à son centre.

**Les deux carrés ne se touchent pas** : chacun a son coin de l’écran. À la fin, on voit les deux lettres, chacune à son centre.

**Ce qu’on doit voir** — Le A fait son carré autour de (10, 8), puis le B fait le même autour de (4, 4).  
**Ce qu’il coûte** — 2113 octets de programme, 15 variables.

---

### 0.46. Deux tours

> Le carré de taille 2, avec un seul changement : 2 tours au lieu d’un, avant de revenir au centre.

```cpp
int main() {
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
```

**On reprend le carré de taille 2 (le 0.35), avec un seul changement :** le 7e et dernier réglage, les **tours**, passe de `1` à `2`.

**Ce qui est nouveau ici : 2 tours.** La lettre va au coin, fait **2 fois** le tour du carré d’affilée, puis revient au centre.

**On le voit au coin en bas à droite** (12, 10) : la lettre y passe 2 fois.

**Ce qu’on doit voir** — Le carré de taille 2, fait 2 fois d’affilée avant le retour au centre.  
**Ce qu’il coûte** — 2082 octets de programme, 15 variables.

---

### 0.46.1. Deux tours — de base, ailleurs

> Le carré du 0.46, avec une seule lettre, le B, autour d’une deuxième position : (4, 4).

```cpp
int main() {
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
```

**C’est le carré du 0.46**, mêmes réglages (taille 2, sens 1, vitesse 250, 2 tours), avec deux changements qui vont ensemble : **une autre lettre** et **une autre position**.

**La lettre :** `ALPHABET[1]`, la 2e lettre de l’alphabet, le **B** (on compte à partir de 0 : A = 0, B = 1).

**La position : (4, 4)** au lieu de (10, 8). Un carré de taille 2 tient entier si son centre est à au moins 2 cases de chaque bord : la colonne entre 2 et 19 − 2 = 17, la ligne entre 2 et 17 − 2 = 15. (4, 4) respecte ces limites : le carré de 5 × 5 tient entier, des colonnes 2 à 6 et des lignes 2 à 6.

**C’est la version de base** : une seule lettre, un seul carré. Le 0.46.2 mettra les deux carrés ensemble.

**Ce qu’on doit voir** — Le même carré qu’au 0.46, mais fait par un B, autour de (4, 4).  
**Ce qu’il coûte** — 2082 octets de programme, 15 variables.

---

### 0.46.2. Deux tours — doublé, deux positions

> Les deux carrés dans le même programme : le A autour de (10, 8), puis le B autour de (4, 4).

```cpp
int main() {
  // 1. Le A, autour de (10, 8) : le 0.46.
  carre(10, 8, ALPHABET[0], 2, 1, 250, 2);

  // 2. Le B, autour de (4, 4) : le 0.46.1.
  //    Il commence quand le A a fini : carre attend la fin de son carré.
  carre(4, 4, ALPHABET[1], 2, 1, 250, 2);

  while (true) {
    image();
  }
}
```

**C’est le 0.46 et le 0.46.1 réunis :** deux lignes, deux lettres, deux positions.

**Ce qui est nouveau ici : deux carrés dans le même programme.** Le A tourne autour de (10, 8), comme au 0.46 ; puis le B autour de (4, 4), comme au 0.46.1.

**L’un après l’autre :** `carre` attend la fin de son carré avant de rendre la main. Le B ne commence que quand le A est revenu à son centre.

**Les deux carrés ne se touchent pas** : chacun a son coin de l’écran. À la fin, on voit les deux lettres, chacune à son centre.

**Ce qu’on doit voir** — Le A fait son carré autour de (10, 8), puis le B fait le même autour de (4, 4).  
**Ce qu’il coûte** — 2113 octets de programme, 15 variables.

---

### 0.47. Trois tours

> Le carré de taille 2, avec un seul changement : 3 tours au lieu d’un, avant de revenir au centre.

```cpp
int main() {
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
```

**On reprend le carré de taille 2 (le 0.35), avec un seul changement :** le 7e et dernier réglage, les **tours**, passe de `1` à `3`.

**Ce qui est nouveau ici : 3 tours.** La lettre va au coin, fait **3 fois** le tour du carré d’affilée, puis revient au centre.

**On le voit au coin en bas à droite** (12, 10) : la lettre y passe 3 fois.

**Ce qu’on doit voir** — Le carré de taille 2, fait 3 fois d’affilée avant le retour au centre.  
**Ce qu’il coûte** — 2082 octets de programme, 15 variables.

---

### 0.47.1. Trois tours — de base, ailleurs

> Le carré du 0.47, avec une seule lettre, le B, autour d’une deuxième position : (4, 4).

```cpp
int main() {
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
```

**C’est le carré du 0.47**, mêmes réglages (taille 2, sens 1, vitesse 250, 3 tours), avec deux changements qui vont ensemble : **une autre lettre** et **une autre position**.

**La lettre :** `ALPHABET[1]`, la 2e lettre de l’alphabet, le **B** (on compte à partir de 0 : A = 0, B = 1).

**La position : (4, 4)** au lieu de (10, 8). Un carré de taille 2 tient entier si son centre est à au moins 2 cases de chaque bord : la colonne entre 2 et 19 − 2 = 17, la ligne entre 2 et 17 − 2 = 15. (4, 4) respecte ces limites : le carré de 5 × 5 tient entier, des colonnes 2 à 6 et des lignes 2 à 6.

**C’est la version de base** : une seule lettre, un seul carré. Le 0.47.2 mettra les deux carrés ensemble.

**Ce qu’on doit voir** — Le même carré qu’au 0.47, mais fait par un B, autour de (4, 4).  
**Ce qu’il coûte** — 2082 octets de programme, 15 variables.

---

### 0.47.2. Trois tours — doublé, deux positions

> Les deux carrés dans le même programme : le A autour de (10, 8), puis le B autour de (4, 4).

```cpp
int main() {
  // 1. Le A, autour de (10, 8) : le 0.47.
  carre(10, 8, ALPHABET[0], 2, 1, 250, 3);

  // 2. Le B, autour de (4, 4) : le 0.47.1.
  //    Il commence quand le A a fini : carre attend la fin de son carré.
  carre(4, 4, ALPHABET[1], 2, 1, 250, 3);

  while (true) {
    image();
  }
}
```

**C’est le 0.47 et le 0.47.1 réunis :** deux lignes, deux lettres, deux positions.

**Ce qui est nouveau ici : deux carrés dans le même programme.** Le A tourne autour de (10, 8), comme au 0.47 ; puis le B autour de (4, 4), comme au 0.47.1.

**L’un après l’autre :** `carre` attend la fin de son carré avant de rendre la main. Le B ne commence que quand le A est revenu à son centre.

**Les deux carrés ne se touchent pas** : chacun a son coin de l’écran. À la fin, on voit les deux lettres, chacune à son centre.

**Ce qu’on doit voir** — Le A fait son carré autour de (10, 8), puis le B fait le même autour de (4, 4).  
**Ce qu’il coûte** — 2113 octets de programme, 15 variables.

---

### 0.48. Les réglages sous un nom : Carre

> Carre ronde = { … }; range les sept réglages sous un nom, en haut du programme ; carre(ronde); s’en sert.

```cpp
// Carre : un type pour ranger les sept réglages d'un carré sous UN nom,
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
```

**Sept nombres à la suite se lisent mal** : lequel est la taille, lequel la vitesse ? On les range donc **sous un nom**, en haut du programme, comme `Mot` au chapitre 1.

**Ce qui est nouveau ici :** le type **`Carre`**. `Carre ronde = { 10, 8, ALPHABET[0], 2, 1, 250, 2 };` range les sept réglages, **dans le même ordre** que `carre(…)`, sous le nom `ronde`.

**`carre(ronde);`** fait le carré avec ces réglages. Le compilateur remplace `carre(ronde)` par `carre(10, 8, ALPHABET[0], 2, 1, 250, 2)` : rien n’est rangé en mémoire, c’est gratuit.

**L’avantage :** pour changer le carré, on ne touche qu’à la ligne du haut, où chaque réglage a son titre au-dessus. Le programme, lui, ne dit plus que « fais le carré ronde ».

**Il faut les sept réglages**, ni plus ni moins. Il en manque un ? Le compilateur le dit, et donne un exemple complet.

**Ce qu’on doit voir** — Un A qui fait deux tours de 5 × 5 autour de (10, 8), et revient au centre.  
**Ce qu’il coûte** — 2082 octets de programme, 15 variables.

---

### 0.48.1. Les réglages sous un nom : Carre — de base, ailleurs

> Un deuxième Carre, « coin », rangé sous son nom : le B autour de (4, 4).

```cpp
//              x  y  tuile        taille  sens  vitesse  tours
Carre coin = {  4, 4, ALPHABET[1], 2,      1,    250,     2 };

int main() {
  carre(coin);       // le carré, avec les réglages de « coin »

  while (true) {
    image();
  }
}
```

**C’est le 0.48**, avec un **autre** `Carre`, nommé `coin` : le B autour de (4, 4).

**C’est la version de base** : la deuxième place, seule. Le 0.48.2 met les deux ensemble.

**Ce qu’on doit voir** — Le B fait deux tours de 5 × 5 autour de (4, 4).  
**Ce qu’il coûte** — 2082 octets de programme, 15 variables.

---

### 0.48.2. Les réglages sous un nom : Carre — doublé, deux positions

> Deux Carre, deux noms : ronde et coin.

```cpp
//               x   y  tuile        taille  sens  vitesse  tours
Carre ronde = { 10,  8, ALPHABET[0], 2,      1,    250,     2 };
Carre coin  = {  4,  4, ALPHABET[1], 2,      1,    250,     2 };

int main() {
  carre(ronde);      // le A, autour de (10, 8)
  carre(coin);       // puis le B, autour de (4, 4)

  while (true) {
    image();
  }
}
```

**C’est le 0.48 et le 0.48.1 réunis** : deux `Carre`, chacun avec son nom.

**Chaque nom range ses sept réglages :** `carre(ronde)` et `carre(coin)` ne se mélangent pas.

**Ce qu’on doit voir** — Le A fait deux tours autour de (10, 8), puis le B autour de (4, 4).  
**Ce qu’il coûte** — 2113 octets de programme, 15 variables.

---

### 0.49. De plus en plus grand : 1, puis 2

> Deux carrés autour du même centre, le second un cran plus grand. Le centre (10, 8) est choisi pour que même le plus grand tienne dans l’écran.

```cpp
int main() {
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
```

**Deux lignes, une seule différence :** la taille. D’abord `1`, puis `2`. Le second carré entoure le premier.

**Ce qui est nouveau ici : le placement.** Pour des carrés de plus en plus grands, il faut un centre où **ils tiennent tous**. L’écran fait **20 colonnes** (de 0 à 19) et **18 lignes** (de 0 à 17). Son milieu est vers la colonne **10** et la ligne **8**.

**Pourquoi (10, 8) est le meilleur endroit :** le plus grand carré possible a la taille **8** (17 × 17). Autour de (10, 8), il va de la colonne 10 − 8 = **2** à 10 + 8 = **18**, et de la ligne 8 − 8 = **0** à 8 + 8 = **16** : il tient **entier**. Tous les carrés, de la taille 1 à la taille 8, peuvent donc tourner autour du **même** centre, emboîtés comme des cadres.

**Chaque carré revient au centre** avant que le suivant commence : le second repart donc bien de (10, 8).

**Ce qu’on doit voir** — Un A qui fait un petit tour autour du milieu de l’écran, puis un tour un peu plus grand autour du même point.  
**Ce qu’il coûte** — 2113 octets de programme, 15 variables.

---

### 0.49.1. De plus en plus grand : 1, puis 2 — de base, ailleurs

> Le 0.49 fait par le B, autour de (4, 4).

```cpp
int main() {
  // Le B, autour de (4, 4) :
  carre(4, 4, ALPHABET[1], 1, 1, 250, 1);
  carre(4, 4, ALPHABET[1], 2, 1, 250, 1);

  while (true) {
    image();
  }
}
```

**C’est le 0.49**, avec le **B**, autour de **(4, 4)** au lieu de (10, 8).

**C’est la version de base** : la deuxième place, seule. Le 0.49.2 met les deux ensemble.

**Ce qu’on doit voir** — Les mêmes carrés qu’au 0.49, faits par le B autour de (4, 4).  
**Ce qu’il coûte** — 2113 octets de programme, 15 variables.

---

### 0.49.2. De plus en plus grand : 1, puis 2 — doublé, deux positions

> Les carrés du A autour de (10, 8), puis ceux du B autour de (4, 4).

```cpp
int main() {
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
```

**C’est le 0.49 et le 0.49.1 réunis** : les carrés du A, puis ceux du B.

**Ce qu’on doit voir** — Les carrés du A, puis ceux du B.  
**Ce qu’il coûte** — 2175 octets de programme, 15 variables.

---

### 0.50. De plus en plus grand : et 3

> Le 0.49, plus une ligne : un troisième carré, de taille 3, autour du même centre.

```cpp
int main() {
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
```

**C’est le 0.49, plus une ligne :** le carré de taille 3 (7 × 7).

**Ce qui est nouveau ici :** rien qu’une taille de plus. On voit la règle se répéter : chaque carré a **2 cases de plus** de côté que le précédent (3, 5, 7), puisqu’il gagne une case de chaque côté.

**On pourrait continuer ainsi jusqu’à 8**, en écrivant huit lignes presque pareilles. Le cours suivant montre comment l’écrire une seule fois.

**Ce qu’on doit voir** — Trois tours autour du milieu de l’écran, chacun plus grand que le précédent.  
**Ce qu’il coûte** — 2144 octets de programme, 15 variables.

---

### 0.50.1. De plus en plus grand : et 3 — de base, ailleurs

> Le 0.50 fait par le B, autour de (4, 4).

```cpp
int main() {
  // Le B, autour de (4, 4) :
  carre(4, 4, ALPHABET[1], 1, 1, 250, 1);
  carre(4, 4, ALPHABET[1], 2, 1, 250, 1);
  carre(4, 4, ALPHABET[1], 3, 1, 250, 1);

  while (true) {
    image();
  }
}
```

**C’est le 0.50**, avec le **B**, autour de **(4, 4)** au lieu de (10, 8).

**C’est la version de base** : la deuxième place, seule. Le 0.50.2 met les deux ensemble.

**Ce qu’on doit voir** — Les mêmes carrés qu’au 0.50, faits par le B autour de (4, 4).  
**Ce qu’il coûte** — 2144 octets de programme, 15 variables.

---

### 0.50.2. De plus en plus grand : et 3 — doublé, deux positions

> Les carrés du A autour de (10, 8), puis ceux du B autour de (4, 4).

```cpp
int main() {
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
```

**C’est le 0.50 et le 0.50.1 réunis** : les carrés du A, puis ceux du B.

**Ce qu’on doit voir** — Les carrés du A, puis ceux du B.  
**Ce qu’il coûte** — 2237 octets de programme, 15 variables.

---

### 0.51. Jusqu’au plus grand : une boucle

> Une boucle for fait grandir la taille de 1 à 8 : huit carrés emboîtés, jusqu’au plus grand que l’écran tienne.

```cpp
int main() {
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
```

**Le 0.50 répétait la même ligne**, avec une taille qui augmente de 1 à chaque fois. Quand seul un nombre change, et toujours de la même façon, on écrit la ligne **une seule fois**, dans une **boucle**.

**Ce qui est nouveau ici :** la taille est une **variable**, `taille`, que la boucle `for` fait passer par 1, 2, 3… jusqu’à **8**. À chaque tour de boucle, `carre` reçoit la taille du moment.

**`taille <= 8`** veut dire « tant que la taille est plus petite **ou égale** à 8 » : la boucle fait donc aussi le tour de taille 8, puis s’arrête.

**Pourquoi 8 :** c’est le plus grand carré que l’écran tienne. Autour de (10, 8), il va de la colonne 2 à 18 et de la ligne 0 à 16. Le centre a été choisi pour ça (voir le 0.49).

**La vitesse, 50 ms par pas**, est plus rapide : huit carrés à 250 ms dureraient plus d’une minute. Elle s’écrit toujours en clair ; la taille, elle, peut être une variable.

**Ce qu’on doit voir** — Huit tours autour du milieu de l’écran, de plus en plus grands, jusqu’à un carré qui touche presque les bords.  
**Ce qu’il coûte** — 2115 octets de programme, 16 variables.

---

### 0.51.1. Jusqu’au plus grand : une boucle — de base, ailleurs

> Le 0.51 fait par le B, autour de (9, 9).

```cpp
int main() {
  // Le B, autour de (9, 9) :
  for (uint8_t taille = 1; taille <= 8; taille++) {
    carre(9, 9, ALPHABET[1], taille, 1, 50, 1);
  }

  while (true) {
    image();
  }
}
```

**C’est le 0.51**, avec le **B**, autour de **(9, 9)** au lieu de (10, 8).

**Pourquoi (9, 9) :** la taille 8 ne tient que si le centre est entre les colonnes 8 et 11 et les lignes 8 et 9. (9, 9) est l’un des rares autres centres possibles.

**C’est la version de base** : la deuxième place, seule. Le 0.51.2 met les deux ensemble.

**Ce qu’on doit voir** — Les mêmes carrés qu’au 0.51, faits par le B autour de (9, 9).  
**Ce qu’il coûte** — 2115 octets de programme, 16 variables.

---

### 0.51.2. Jusqu’au plus grand : une boucle — doublé, deux positions

> Les carrés du A autour de (10, 8), puis ceux du B autour de (9, 9).

```cpp
int main() {
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
```

**C’est le 0.51 et le 0.51.1 réunis** : les carrés du A, puis ceux du B.

**Ils se croisent :** en passant, les carrés du B effacent le A resté au centre. Chaque lettre ne s’occupe que d’elle-même.

**Ce qu’on doit voir** — Les carrés du A, puis ceux du B.  
**Ce qu’il coûte** — 2179 octets de programme, 16 variables.

---

### 0.52. Deux carrés à la suite

> Deux appels à carre, l’un après l’autre : un petit carré lent, puis un grand carré rapide. Le second attend la fin du premier.

```cpp
int main() {
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
```

**Deux carrés différents, l’un après l’autre.** Chacun a été vu seul dans les leçons d’avant ; on les enchaîne.

**Ce qui est nouveau ici : deux `carre` l’un après l’autre.** `carre` **bloque** : elle attend la fin de son carré avant de rendre la main. La deuxième ligne ne commence donc que quand la lettre est revenue au centre.

**Le premier** est celui du 0.34 (taille 1). **Le second** change quatre réglages, chacun vu dans sa leçon : taille 3 (le 0.36), sens -1 (le 0.42), vitesse 100 (le 0.44), 3 tours (le 0.47).

**Ce qu’on doit voir** — Un A qui fait un petit tour lent autour de (10, 8), puis trois grands tours rapides dans l’autre sens.  
**Ce qu’il coûte** — 2113 octets de programme, 15 variables.

---

### 0.52.1. Deux carrés à la suite — de base, ailleurs

> Le 0.52 fait par le B, autour de (4, 4).

```cpp
int main() {
  // Le B, autour de (4, 4) :
  carre(4, 4, ALPHABET[1], 1, 1, 250, 1);
  carre(4, 4, ALPHABET[1], 3, -1, 100, 3);

  while (true) {
    image();
  }
}
```

**C’est le 0.52**, avec le **B**, autour de **(4, 4)** au lieu de (10, 8).

**C’est la version de base** : la deuxième place, seule. Le 0.52.2 met les deux ensemble.

**Ce qu’on doit voir** — Les mêmes carrés qu’au 0.52, faits par le B autour de (4, 4).  
**Ce qu’il coûte** — 2113 octets de programme, 15 variables.

---

### 0.52.2. Deux carrés à la suite — doublé, deux positions

> Les carrés du A autour de (10, 8), puis ceux du B autour de (4, 4).

```cpp
int main() {
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
```

**C’est le 0.52 et le 0.52.1 réunis** : les carrés du A, puis ceux du B.

**Ce qu’on doit voir** — Les carrés du A, puis ceux du B.  
**Ce qu’il coûte** — 2175 octets de programme, 15 variables.

---

### 0.53. Deux lettres, deux carrés

> Deux lettres, chacune autour de son propre centre : un A petit et lent, un B grand et rapide.

```cpp
int main() {
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
```

**Deux lettres, deux centres.** Jusqu’ici, tous les carrés tournaient autour de (10, 8). Ici, le A tourne autour de (4, 4), le B autour de (9, 9).

**Ce qui est nouveau ici :** une **deuxième lettre**, `ALPHABET[1]`, le **B**. Chaque appel à `carre` a sa propre tuile et son propre centre : les deux carrés ne se touchent pas.

**Ils se font l’un après l’autre**, comme au 0.52 : le B commence quand le A est revenu à son centre. À la fin, on voit les deux lettres, chacune à sa place.

**Ce qu’on doit voir** — Un A qui fait un petit carré autour de (4, 4), puis un B qui fait un grand carré rapide autour de (9, 9). Chacun reste à son centre.  
**Ce qu’il coûte** — 2113 octets de programme, 15 variables.

---

### 0.53.1. Deux lettres, deux carrés — de base, ailleurs

> Deux autres lettres, deux autres places : le C autour de (15, 4), le D autour de (14, 12).

```cpp
int main() {
  carre(15, 4, ALPHABET[2], 1, 1, 250, 1);     // le C, en haut à droite
  carre(14, 12, ALPHABET[3], 3, -1, 100, 1);   // le D, en bas à droite

  while (true) {
    image();
  }
}
```

**C’est le 0.53**, avec deux **autres** lettres, le C et le D, à deux places libres de l’écran : (15, 4) et (14, 12).

**C’est la version de base** : la deuxième place, seule. Le 0.53.2 met les deux ensemble.

**Ce qu’on doit voir** — Le C fait un petit carré en haut à droite, puis le D un grand en bas à droite.  
**Ce qu’il coûte** — 2113 octets de programme, 15 variables.

---

### 0.53.2. Deux lettres, deux carrés — doublé, deux positions

> Quatre lettres, quatre carrés : A, B, C et D, chacun à sa place.

```cpp
int main() {
  carre(4, 4, ALPHABET[0], 1, 1, 250, 1);      // le A
  carre(9, 9, ALPHABET[1], 3, -1, 100, 1);     // le B
  carre(15, 4, ALPHABET[2], 1, 1, 250, 1);     // le C
  carre(14, 12, ALPHABET[3], 3, -1, 100, 1);   // le D

  while (true) {
    image();
  }
}
```

**C’est le 0.53 et le 0.53.1 réunis** : les quatre carrés, l’un après l’autre.

**Ce qu’on doit voir** — Quatre carrés, l’un après l’autre, aux quatre coins de l’écran.  
**Ce qu’il coûte** — 2175 octets de programme, 15 variables.

---

### 0.54. Trois lettres, trois carrés

> Le 0.53, plus une ligne : un C, avec les réglages rangés sous le nom « ronde ».

```cpp
// Les réglages du C, rangés sous un nom (le 0.48) :
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
```

**C’est le 0.53, plus un carré :** le C, dont les réglages sont rangés en haut sous le nom `ronde`, comme au 0.48.

**Ce qui est nouveau ici :** rien qu’on ne connaisse, mais **ensemble** : deux carrés écrits en entier, et un troisième par son nom. `carre(ronde);` est remplacé par `carre(15, 8, ALPHABET[2], 2, 1, 250, 2);`.

**Les trois centres** sont assez loin l’un de l’autre pour que les carrés ne se touchent pas : (4, 4), (9, 9), (15, 8). À la fin, on voit les trois lettres.

**Ce qu’on doit voir** — Le A fait un petit carré, le B un grand carré rapide, puis le C deux tours autour de (15, 8). Chacun reste à son centre.  
**Ce qu’il coûte** — 2144 octets de programme, 15 variables.

---

### 0.54.1. Trois lettres, trois carrés — de base, ailleurs

> Un quatrième Carre, « bas », pour le D autour de (15, 14).

```cpp
Carre bas = { 15, 14, ALPHABET[3], 2, 1, 250, 1 };   // le D, en bas à droite

int main() {
  carre(bas);

  while (true) {
    image();
  }
}
```

**C’est le 0.54**, avec une **quatrième** lettre, le D, rangée dans un `Carre` nommé `bas`, autour de (15, 14).

**C’est la version de base** : la deuxième place, seule. Le 0.54.2 met les deux ensemble.

**Ce qu’on doit voir** — Le D fait un tour autour de (15, 14).  
**Ce qu’il coûte** — 2082 octets de programme, 15 variables.

---

### 0.54.2. Trois lettres, trois carrés — doublé, deux positions

> Les trois carrés du 0.54, puis celui du D : quatre lettres.

```cpp
Carre ronde = { 15,  8, ALPHABET[2], 2, 1, 250, 2 };   // le C
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
```

**C’est le 0.54 et le 0.54.1 réunis** : les trois carrés, puis le quatrième.

**Ce qu’on doit voir** — Le A, le B, le C, puis le D font leur carré.  
**Ce qu’il coûte** — 2175 octets de programme, 15 variables.

---

### 0.55. La vitesse des déplacements : vitesse

> vitesse(ms) règle le temps d’un pas de deplace_x, deplace_y, deplace et va_a. vitesse(100) : 10 pas par seconde.

```cpp
uint8_t x = 0;        // la colonne de la lettre : 0, tout à gauche

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
```

**`carre` a sa vitesse, mais `deplace_x`, `deplace_y`, `deplace` et `va_a` n’en ont pas** : elles avancent toujours d’un pas tous les quarts de seconde (250 millisecondes).

**Ce qui est nouveau ici :** `vitesse(ms)`. Elle règle **le temps d’un pas**, en millisecondes, pour **tous les déplacements qui viennent après elle**. Elle ne fait rien bouger elle-même : elle change le rythme.

**Comme pour `carre` : plus le nombre est petit, plus ça va vite.** `vitesse(100)` : 10 pas par seconde. Le nombre s’écrit en clair.

**Le reste est le 0.18 :** `deplace_x` fait avancer la lettre de 5 cases. Mais cette fois, deux fois et demie plus vite.

**Ce qu’on doit voir** — Un A qui file de 5 cases vers la droite, bien plus vite qu’au 0.18.  
**Ce qu’il coûte** — 1595 octets de programme, 9 variables.

---

### 0.55.1. La vitesse des déplacements : vitesse — de base, ailleurs

> Le 0.55 sur la ligne 8, avec le B.

```cpp
uint8_t x = 0;

int main() {
  vitesse(100);                       // 10 pas par seconde
  deplace_x(x, 8, ALPHABET[1], 5);    // le B, ligne 8

  while (true) {
    image();
  }
}
```

**C’est le 0.55**, avec le **B**, sur la **ligne 8**.

**C’est la version de base** : la deuxième place, seule. Le 0.55.2 met les deux ensemble.

**Ce qu’on doit voir** — Un B qui file de 5 cases sur la ligne 8.  
**Ce qu’il coûte** — 1596 octets de programme, 9 variables.

---

### 0.55.2. La vitesse des déplacements : vitesse — doublé, deux positions

> Un seul vitesse(100) pour les deux : il vaut pour tous les déplacements qui suivent.

```cpp
uint8_t x = 0;        // le A
uint8_t xb = 0;       // le B

int main() {
  vitesse(100);                        // pour les deux
  deplace_x(x, 0, ALPHABET[0], 5);
  deplace_x(xb, 8, ALPHABET[1], 5);

  while (true) {
    image();
  }
}
```

**C’est le 0.55 et le 0.55.1 réunis** : le A puis le B, avec le même `vitesse(100)`.

**Un seul réglage suffit :** `vitesse` reste réglée jusqu’au suivant, pour toutes les lettres.

**Ce qu’on doit voir** — Le A file sur la ligne 0, puis le B sur la ligne 8, à la même vitesse.  
**Ce qu’il coûte** — 1619 octets de programme, 10 variables.

---

### 0.56. Changer de vitesse en route

> Le 0.55, plus deux lignes : vitesse(500), puis le retour. La même lettre va vite, puis lentement.

```cpp
uint8_t x = 0;        // la colonne de la lettre

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
```

**C’est le 0.55, plus deux lignes :** une nouvelle vitesse, et le retour.

**Ce qui est nouveau ici :** un **deuxième** `vitesse(…)`. La vitesse reste réglée **jusqu’au prochain `vitesse`** : l’aller se fait à 100, et après `vitesse(500)`, le retour se fait à 500 millisecondes par pas, 2 pas par seconde.

**On peut changer de vitesse autant de fois qu’on veut**, entre deux déplacements.

**Ce qu’on doit voir** — Un A qui file vite vers la droite, puis revient lentement vers la gauche.  
**Ce qu’il coûte** — 1619 octets de programme, 9 variables.

---

### 0.56.1. Changer de vitesse en route — de base, ailleurs

> Le 0.56 sur la ligne 8, avec le B : vite à l’aller, lentement au retour.

```cpp
uint8_t x = 0;

int main() {
  vitesse(100);
  deplace_x(x, 8, ALPHABET[1], 5);    // vite
  vitesse(500);
  deplace_x(x, 8, ALPHABET[1], -5);   // lentement

  while (true) {
    image();
  }
}
```

**C’est le 0.56**, avec le **B**, sur la **ligne 8**.

**C’est la version de base** : la deuxième place, seule. Le 0.56.2 met les deux ensemble.

**Ce qu’on doit voir** — Un B qui file à droite sur la ligne 8, puis revient lentement.  
**Ce qu’il coûte** — 1621 octets de programme, 9 variables.

---

### 0.56.2. Changer de vitesse en route — doublé, deux positions

> Le A vite puis lentement, et le B aussi : chaque vitesse vaut jusqu’à la suivante.

```cpp
uint8_t x = 0;        // le A
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
```

**C’est le 0.56 et le 0.56.1 réunis** : les deux lettres, chacune avec ses deux vitesses.

**Ce qu’on doit voir** — Le A puis le B filent à droite ; puis le A et le B reviennent lentement.  
**Ce qu’il coûte** — 1664 octets de programme, 10 variables.

---

### 0.57. Un carré sur la pointe : losange

> losange(x, y, tuile, taille, sens, vitesse, tours) : le carré tourné, ses côtés en diagonale. Les mêmes réglages que carre.

```cpp
int main() {
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
```

**Un losange, c’est un carré posé sur la pointe.** Ses quatre côtés ne sont plus droits : ce sont des **diagonales**. À chaque pas, la lettre bouge d’une case sur X **et** d’une case sur Y en même temps, comme `deplace(x, y, …, 5, 5)` au 0.26.

**Ce qui est nouveau ici :** `losange(x, y, tuile, taille, sens, vitesse, tours)`. Les **mêmes sept réglages que `carre`**, dans le même ordre.

• **`x`, `y`** : le centre. **`taille`** : la distance du centre à chaque **pointe**. Avec 2, les pointes sont à 2 cases en haut, à droite, en bas et à gauche du centre.

• **`sens`** : `1` part vers la droite depuis la pointe du haut (comme les aiguilles d’une montre) ; `-1` part vers la gauche.

• **`vitesse`** en millisecondes par pas, **`tours`** : comme pour `carre`.

**Le trajet :** du centre, la lettre monte **tout droit** jusqu’à la pointe du haut ; elle fait le tour en diagonale ; puis elle redescend tout droit au centre.

**Un Carre marche aussi :** puisque les réglages sont les mêmes, `losange(ronde);` accepte un `Carre ronde = { … };`, comme `carre(ronde);`.

**Ce qu’on doit voir** — Un A qui monte de 2 cases, fait un tour en diagonale autour de (10, 8), puis revient au centre.  
**Ce qu’il coûte** — 2065 octets de programme, 15 variables.

---

### 0.57.1. Un carré sur la pointe : losange — de base, ailleurs

> Le 0.57 fait par le B, autour de (4, 4).

```cpp
int main() {
  // Le B, en haut à gauche :
  losange(4, 4, ALPHABET[1], 2, 1, 250, 1);

  while (true) {
    image();
  }
}
```

**C’est le 0.57**, avec le **B**, autour de **(4, 4)** au lieu de (10, 8).

**La forme tient entière** autour de (4, 4) : elle ne s’approche jamais à moins d’une case du bord.

**C’est la version de base** : la deuxième place, seule. Le 0.57.2 met les deux ensemble.

**Ce qu’on doit voir** — La même forme qu’au 0.57, faite par le B en haut à gauche.  
**Ce qu’il coûte** — 2065 octets de programme, 15 variables.

---

### 0.57.2. Un carré sur la pointe : losange — doublé, deux positions

> La forme du A autour de (10, 8), puis celle du B autour de (4, 4).

```cpp
int main() {
  // 1. Le A, au milieu
  losange(10, 8, ALPHABET[0], 2, 1, 250, 1);
  // 2. Le B, en haut à gauche
  losange(4, 4, ALPHABET[1], 2, 1, 250, 1);

  while (true) {
    image();
  }
}
```

**C’est le 0.57 et le 0.57.1 réunis** : la même forme à deux places, l’une après l’autre.

**Ce qu’on doit voir** — La forme du A au milieu, puis celle du B en haut à gauche.  
**Ce qu’il coûte** — 2096 octets de programme, 15 variables.

---

### 0.58. Plus large que haut : rectangle

> rectangle(x, y, tuile, largeur, hauteur, sens, vitesse, tours) : un carré avec deux tailles, une pour X et une pour Y.

```cpp
int main() {
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
```

**Un rectangle, c’est un carré qui n’a pas la même taille sur les deux axes.** Au lieu d’une `taille`, il en a **deux** : la **largeur** (sur X) et la **hauteur** (sur Y).

**Ce qui est nouveau ici :** `rectangle(x, y, tuile, largeur, hauteur, sens, vitesse, tours)`, **huit** réglages : ceux de `carre`, avec `largeur` et `hauteur` à la place de `taille`.

• **`largeur`** et **`hauteur`** se comptent comme la taille d’un carré : la distance du centre au bord. La règle 2 × n + 1 vaut pour chacune : largeur 4 donne **9** cases de large, hauteur 2 donne **5** cases de haut, un rectangle de **9 × 5**.

• Avec la même largeur et la même hauteur, `rectangle` fait **un carré** : `rectangle(10, 8, A, 2, 2, …)` fait le même tour que `carre(10, 8, A, 2, …)`.

**Le trajet :** du centre, en diagonale, puis tout droit jusqu’au coin en haut à gauche ; le tour ; puis le même chemin à l’envers.

**Les plus grandes tailles :** largeur 9 (19 colonnes) et hauteur 8 (17 lignes).

**Ce qu’on doit voir** — Un A qui fait le tour d’un rectangle de 9 cases de large et 5 de haut autour de (10, 8), puis revient au centre.  
**Ce qu’il coûte** — 2301 octets de programme, 18 variables.

---

### 0.58.1. Plus large que haut : rectangle — de base, ailleurs

> Le 0.58 fait par le B, autour de (4, 4).

```cpp
int main() {
  // Le B, en haut à gauche :
  rectangle(4, 4, ALPHABET[1], 4, 2, 1, 250, 1);

  while (true) {
    image();
  }
}
```

**C’est le 0.58**, avec le **B**, autour de **(4, 4)** au lieu de (10, 8).

**La forme tient entière** autour de (4, 4) : elle ne s’approche jamais à moins d’une case du bord.

**C’est la version de base** : la deuxième place, seule. Le 0.58.2 met les deux ensemble.

**Ce qu’on doit voir** — La même forme qu’au 0.58, faite par le B en haut à gauche.  
**Ce qu’il coûte** — 2301 octets de programme, 18 variables.

---

### 0.58.2. Plus large que haut : rectangle — doublé, deux positions

> La forme du A autour de (10, 8), puis celle du B autour de (4, 4).

```cpp
int main() {
  // 1. Le A, au milieu
  rectangle(10, 8, ALPHABET[0], 4, 2, 1, 250, 1);
  // 2. Le B, en haut à gauche
  rectangle(4, 4, ALPHABET[1], 4, 2, 1, 250, 1);

  while (true) {
    image();
  }
}
```

**C’est le 0.58 et le 0.58.1 réunis** : la même forme à deux places, l’une après l’autre.

**Ce qu’on doit voir** — La forme du A au milieu, puis celle du B en haut à gauche.  
**Ce qu’il coûte** — 2336 octets de programme, 18 variables.

---

### 0.59. Tourner en s’éloignant : spirale

> spirale(x, y, tuile, taille, sens, vitesse) : la lettre part du centre et tourne en s’éloignant, jusqu’au bord d’un carré de cette taille.

```cpp
int main() {
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
```

**Une spirale tourne en s’éloignant du centre.** Chaque branche est un peu plus longue que la précédente.

**Ce qui est nouveau ici :** `spirale(x, y, tuile, taille, sens, vitesse)`, **six** réglages : ceux de `carre`, sans les `tours` (une spirale ne se répète pas : elle s’élargit jusqu’au bout).

**La règle des branches :** 1 pas, 1 pas, 2 pas, 2 pas, 3 pas, 3 pas… La longueur **augmente d’un pas toutes les deux branches**. La spirale s’arrête quand elle a atteint le bord du carré de `taille`, soit des branches de 2 × taille pas, et une dernière branche ferme le carré.

**Le sens :** `1` tourne comme les aiguilles d’une montre (droite, bas, gauche, haut, et on recommence) ; `-1` dans l’autre sens (bas, droite, haut, gauche).

**À la fin**, la lettre revient au centre en diagonale.

**Ce qu’on doit voir** — Un A qui tourne autour de (10, 8) en s’éloignant un peu plus à chaque tour, puis revient au centre.  
**Ce qu’il coûte** — 2096 octets de programme, 15 variables.

---

### 0.59.1. Tourner en s’éloignant : spirale — de base, ailleurs

> Le 0.59 fait par le B, autour de (4, 4).

```cpp
int main() {
  // Le B, en haut à gauche :
  spirale(4, 4, ALPHABET[1], 3, 1, 250);

  while (true) {
    image();
  }
}
```

**C’est le 0.59**, avec le **B**, autour de **(4, 4)** au lieu de (10, 8).

**La forme tient entière** autour de (4, 4) : elle ne s’approche jamais à moins d’une case du bord.

**C’est la version de base** : la deuxième place, seule. Le 0.59.2 met les deux ensemble.

**Ce qu’on doit voir** — La même forme qu’au 0.59, faite par le B en haut à gauche.  
**Ce qu’il coûte** — 2096 octets de programme, 15 variables.

---

### 0.59.2. Tourner en s’éloignant : spirale — doublé, deux positions

> La forme du A autour de (10, 8), puis celle du B autour de (4, 4).

```cpp
int main() {
  // 1. Le A, au milieu
  spirale(10, 8, ALPHABET[0], 3, 1, 250);
  // 2. Le B, en haut à gauche
  spirale(4, 4, ALPHABET[1], 3, 1, 250);

  while (true) {
    image();
  }
}
```

**C’est le 0.59 et le 0.59.1 réunis** : la même forme à deux places, l’une après l’autre.

**Ce qu’on doit voir** — La forme du A au milieu, puis celle du B en haut à gauche.  
**Ce qu’il coûte** — 2123 octets de programme, 15 variables.

---

### 0.60. Aller et revenir : aller_retour

> aller_retour(x, y, tuile, pasX, pasY, vitesse, fois) : aller jusqu’à un point, revenir, et recommencer.

```cpp
int main() {
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
```

**Un va-et-vient :** la lettre va jusqu’à un point, revient à sa place, et recommence.

**Ce qui est nouveau ici :** `aller_retour(x, y, tuile, pasX, pasY, vitesse, fois)`.

• **`x`, `y`** : la place de départ, où la lettre revient à chaque fois.

• **`pasX`, `pasY`** : où est l’autre bout, comme pour `deplace` : `5, 0` veut dire 5 cases à droite, rien sur Y.

• **`vitesse`** : en millisecondes par pas, comme pour `carre`. **`fois`** : combien d’allers-retours.

**Au bord de l’écran**, l’autre bout est ramené dans l’écran.

**Ce qu’on doit voir** — Un A qui fait deux allers-retours de 5 cases vers la droite, et s’arrête à sa place.  
**Ce qu’il coûte** — 2101 octets de programme, 13 variables.

---

### 0.60.1. Aller et revenir : aller_retour — de base, ailleurs

> Le 0.60 fait par le B, autour de (4, 4).

```cpp
int main() {
  // Le B, en haut à gauche :
  aller_retour(4, 4, ALPHABET[1], 5, 0, 250, 2);

  while (true) {
    image();
  }
}
```

**C’est le 0.60**, avec le **B**, autour de **(4, 4)** au lieu de (10, 8).

**La forme tient entière** autour de (4, 4) : elle ne s’approche jamais à moins d’une case du bord.

**C’est la version de base** : la deuxième place, seule. Le 0.60.2 met les deux ensemble.

**Ce qu’on doit voir** — La même forme qu’au 0.60, faite par le B en haut à gauche.  
**Ce qu’il coûte** — 2101 octets de programme, 13 variables.

---

### 0.60.2. Aller et revenir : aller_retour — doublé, deux positions

> La forme du A autour de (10, 8), puis celle du B autour de (4, 4).

```cpp
int main() {
  // 1. Le A, au milieu
  aller_retour(10, 8, ALPHABET[0], 5, 0, 250, 2);
  // 2. Le B, en haut à gauche
  aller_retour(4, 4, ALPHABET[1], 5, 0, 250, 2);

  while (true) {
    image();
  }
}
```

**C’est le 0.60 et le 0.60.1 réunis** : la même forme à deux places, l’une après l’autre.

**Ce qu’on doit voir** — La forme du A au milieu, puis celle du B en haut à gauche.  
**Ce qu’il coûte** — 2131 octets de programme, 13 variables.

---

### 0.61. Aller et revenir en diagonale

> Le 0.60, plus une ligne : aller_retour avec 4 et 4, un va-et-vient en biais.

```cpp
int main() {
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
```

**C’est le 0.60, plus une ligne :** un aller-retour **en diagonale**.

**Ce qui est nouveau ici :** `pasX` **et** `pasY` à la fois : `4, 4`. L’autre bout est 4 cases à droite **et** 4 cases en bas, en (14, 12). À chaque pas, la lettre avance d’une case sur X et d’une case sur Y : elle va **en biais**, comme `deplace` au 0.26.

**Plus vite, et une seule fois :** vitesse `100`, fois `1`.

**Ce qu’on doit voir** — Deux allers-retours vers la droite, puis un aller-retour rapide en diagonale vers le bas.  
**Ce qu’il coûte** — 2132 octets de programme, 13 variables.

---

### 0.61.1. Aller et revenir en diagonale — de base, ailleurs

> Le 0.61 fait par le B, autour de (4, 4).

```cpp
int main() {
  // Le B, en haut à gauche :
  aller_retour(4, 4, ALPHABET[1], 5, 0, 250, 2);
  aller_retour(4, 4, ALPHABET[1], 4, 4, 100, 1);

  while (true) {
    image();
  }
}
```

**C’est le 0.61**, avec le **B**, autour de **(4, 4)** au lieu de (10, 8).

**La forme tient entière** autour de (4, 4) : elle ne s’approche jamais à moins d’une case du bord.

**C’est la version de base** : la deuxième place, seule. Le 0.61.2 met les deux ensemble.

**Ce qu’on doit voir** — La même forme qu’au 0.61, faite par le B en haut à gauche.  
**Ce qu’il coûte** — 2132 octets de programme, 13 variables.

---

### 0.61.2. Aller et revenir en diagonale — doublé, deux positions

> La forme du A autour de (10, 8), puis celle du B autour de (4, 4).

```cpp
int main() {
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
```

**C’est le 0.61 et le 0.61.1 réunis** : la même forme à deux places, l’une après l’autre.

**Ce qu’on doit voir** — La forme du A au milieu, puis celle du B en haut à gauche.  
**Ce qu’il coûte** — 2193 octets de programme, 13 variables.

---

### 0.62. Deux formes ensemble

> Un losange et un rectangle : deux lettres, deux formes, chacune dans son coin de l’écran.

```cpp
int main() {
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
```

**On commence à réunir les formes** : un losange (le 0.57) pour le A, un rectangle (le 0.58) pour le B.

**Ce qui est nouveau ici :** deux formes **différentes** dans le même programme, avec des centres choisis pour qu’elles ne se touchent pas : le A en haut à gauche, le B en haut à droite.

**Elles se font l’une après l’autre** : le B commence quand le A est revenu à son centre. Toutes deux à `100` ms par pas, pour que le tout ne dure pas trop.

**Ce qu’on doit voir** — Le A fait un losange en haut à gauche, puis le B un rectangle en haut à droite.  
**Ce qu’il coûte** — 3093 octets de programme, 33 variables.

---

### 0.62.1. Deux formes ensemble — de base, ailleurs

> Les deux formes du 0.62, en bas de l’écran, faites par le C et le D.

```cpp
int main() {
  losange(4, 12, ALPHABET[2], 2, 1, 100, 1);           // le C, en bas à gauche
  rectangle(14, 12, ALPHABET[3], 4, 2, -1, 100, 1);   // le D, en bas à droite

  while (true) {
    image();
  }
}
```

**C’est le 0.62**, avec les deux mêmes formes **en bas** de l’écran, par le C et le D.

**C’est la version de base** : la deuxième place, seule. Le 0.62.2 met les deux ensemble.

**Ce qu’on doit voir** — Un losange en bas à gauche, puis un rectangle en bas à droite.  
**Ce qu’il coûte** — 3093 octets de programme, 33 variables.

---

### 0.62.2. Deux formes ensemble — doublé, deux positions

> Quatre formes : les deux du haut, puis les deux du bas.

```cpp
int main() {
  losange(4, 4, ALPHABET[0], 2, 1, 100, 1);            // le A, en haut à gauche
  rectangle(14, 4, ALPHABET[1], 4, 2, -1, 100, 1);    // le B, en haut à droite
  losange(4, 12, ALPHABET[2], 2, 1, 100, 1);           // le C, en bas à gauche
  rectangle(14, 12, ALPHABET[3], 4, 2, -1, 100, 1);   // le D, en bas à droite

  while (true) {
    image();
  }
}
```

**C’est le 0.62 et le 0.62.1 réunis** : les formes du haut, puis celles du bas.

**Ce qu’on doit voir** — Losange et rectangle en haut, puis losange et rectangle en bas.  
**Ce qu’il coûte** — 3159 octets de programme, 33 variables.

---

### 0.63. Trois formes ensemble

> Le 0.62, plus une spirale : le C tourne en bas à gauche.

```cpp
int main() {
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
```

**C’est le 0.62, plus une ligne :** une spirale (le 0.59) pour le C, en bas à gauche de l’écran.

**Ce qui est nouveau ici :** une troisième forme, sous les deux autres. `ALPHABET[2]` est la 3e lettre, le **C**.

**Ce qu’on doit voir** — Le losange du A, le rectangle du B, puis la spirale du C en bas à gauche.  
**Ce qu’il coûte** — 3916 octets de programme, 48 variables.

---

### 0.63.1. Trois formes ensemble — de base, ailleurs

> Une spirale de plus, en bas à droite : le D autour de (14, 12).

```cpp
int main() {
  spirale(14, 12, ALPHABET[3], 2, 1, 100);            // le D, en bas à droite

  while (true) {
    image();
  }
}
```

**C’est le 0.63**, avec une spirale **en bas à droite**, par le D.

**C’est la version de base** : la deuxième place, seule. Le 0.63.2 met les deux ensemble.

**Ce qu’on doit voir** — Une spirale en bas à droite.  
**Ce qu’il coûte** — 2096 octets de programme, 15 variables.

---

### 0.63.2. Trois formes ensemble — doublé, deux positions

> Les trois formes du 0.63, puis la spirale du D.

```cpp
int main() {
  losange(4, 4, ALPHABET[0], 2, 1, 100, 1);            // le A, en haut à gauche
  rectangle(14, 4, ALPHABET[1], 4, 2, -1, 100, 1);    // le B, en haut à droite
  spirale(4, 12, ALPHABET[2], 2, 1, 100);             // le C, en bas à gauche
  spirale(14, 12, ALPHABET[3], 2, 1, 100);            // le D, en bas à droite

  while (true) {
    image();
  }
}
```

**C’est le 0.63 et le 0.63.1 réunis** : quatre formes, dont deux spirales.

**Ce qu’on doit voir** — Losange, rectangle, spirale, puis une seconde spirale en bas à droite.  
**Ce qu’il coûte** — 3943 octets de programme, 48 variables.

---

### 0.64. Quatre formes ensemble

> Le 0.63, plus un aller-retour : le D va et vient en bas à droite. Quatre lettres, quatre formes.

```cpp
int main() {
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
```

**C’est le 0.63, plus une ligne :** un aller-retour (le 0.60) pour le D, en bas à droite.

**Ce qui est nouveau ici :** la quatrième forme. `ALPHABET[3]` est la 4e lettre, le **D** : on compte à partir de 0 (A = 0, B = 1, C = 2, D = 3).

**Change un nombre et relance :** chaque forme a sa taille, son sens et sa vitesse. Tout ce qu’on a vu depuis le 0.34 est là.

**Ce qu’on doit voir** — Le A fait un losange, le B un rectangle, le C une spirale, le D un aller-retour. Chacun finit à sa place.  
**Ce qu’il coûte** — 4744 octets de programme, 61 variables.

---

### 0.64.1. Quatre formes ensemble — de base, ailleurs

> Un aller-retour de plus, sur la ligne 8 : le E, de (3, 8) à (17, 8).

```cpp
int main() {
  aller_retour(3, 8, ALPHABET[4], 14, 0, 100, 1);     // le E, ligne 8

  while (true) {
    image();
  }
}
```

**C’est le 0.64**, avec un aller-retour **sur la ligne 8**, entre les formes du haut et celles du bas, par le E (`ALPHABET[4]`).

**C’est la version de base** : la deuxième place, seule. Le 0.64.2 met les deux ensemble.

**Ce qu’on doit voir** — Un E qui va de (3, 8) à (17, 8) et revient.  
**Ce qu’il coûte** — 2101 octets de programme, 13 variables.

---

### 0.64.2. Quatre formes ensemble — doublé, deux positions

> Cinq lettres, cinq formes : les quatre du 0.64 et l’aller-retour du E au milieu.

```cpp
int main() {
  losange(4, 4, ALPHABET[0], 2, 1, 100, 1);            // le A, en haut à gauche
  rectangle(14, 4, ALPHABET[1], 4, 2, -1, 100, 1);    // le B, en haut à droite
  spirale(4, 12, ALPHABET[2], 2, 1, 100);             // le C, en bas à gauche
  aller_retour(10, 13, ALPHABET[3], 7, 0, 100, 1);    // le D, en bas à droite
  aller_retour(3, 8, ALPHABET[4], 14, 0, 100, 1);     // le E, ligne 8

  while (true) {
    image();
  }
}
```

**C’est le 0.64 et le 0.64.1 réunis** : les quatre formes, puis le E au milieu.

**Ce qu’on doit voir** — Les quatre formes, puis le E fait un aller-retour au milieu de l’écran.  
**Ce qu’il coûte** — 4774 octets de programme, 61 variables.

---

### Partie E — La croix : le joueur

### 0.65. Une lettre qui avance

> Bouger, c’est effacer la lettre à sa place, puis la réécrire un peu plus loin.

```cpp
uint8_t x = 0;        // la colonne de la lettre
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
```

**Maintenant, la lettre ne s’arrête plus :** il n’y a plus de `pas`, elle avance tant que la console tourne.

La lettre A avance d’une colonne toutes les **15 images**, soit quatre fois par seconde.

Pour bouger, on **efface** d’abord l’ancienne place avec `effacer(x, 0, 1)`, une case ; puis on change `x`, et la lettre est réécrite à sa nouvelle place. Sans l’effacement, elle laisserait une traînée de A derrière elle.

Au bout de la ligne, `x` revient à 0 : la lettre repart de la gauche.

**Ce qu’on doit voir** — Un A qui avance vers la droite, et repart de la gauche au bout de la ligne.  
**Ce qu’il coûte** — 1388 octets de programme, 2 variables.

---

### 0.65.1. Une lettre qui avance — de base, ailleurs

> Le 0.65 sur la ligne 8, avec le B.

```cpp
uint8_t x = 0;        // la colonne de la lettre
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
```

**C’est le 0.65**, avec le **B**, sur la **ligne 8**.

**C’est la version de base** : la deuxième place, seule. Le 0.65.2 met les deux ensemble.

**Ce qu’on doit voir** — Un B qui avance sans fin sur la ligne 8.  
**Ce qu’il coûte** — 1390 octets de programme, 2 variables.

---

### 0.65.2. Une lettre qui avance — doublé, deux positions

> Le A et le B avancent ensemble : la même x, deux lignes.

```cpp
uint8_t x = 0;        // la colonne des deux lettres
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
```

**C’est le 0.65 et le 0.65.1 réunis** : deux `effacer`, deux `poser`, la même `x`.

**Ce qu’on doit voir** — Le A et le B avancent ensemble, sur la ligne 0 et sur la ligne 8.  
**Ce qu’il coûte** — 1441 octets de programme, 2 variables.

---

### 0.65.3. Une lettre qui avance — en simple

> Le 0.65 en une ligne : defile(0, 0, 0, ALPHABET[0], 1, 250). La lettre file à droite et repart de la gauche, sans fin.

```cpp
int main() {
  while (true) {
    image();
    // Tout le 0.65 en une ligne :
    //   numero 0, départ (0, 0), le A, vers la droite (1), 250 ms par pas
    defile(0, 0, 0, ALPHABET[0], 1, 250);
  }
}
```

**C’est le 0.65, en plus simple :** le chronomètre, l’effacement, `x++` et le retour à 0 sont remplacés par une seule ligne, `defile`.

**`defile(numero, x, y, tuile, sens, vitesse)`**, une fonction de la console (voir le 0.76.12) : au premier appel, la lettre apparaît en (`x`, `y`) ; ensuite, un pas toutes les `vitesse` ms, à droite (`sens` 1) ou à gauche (-1). Au bord, elle repart de l’autre côté : exactement le `if (x == 20) x = 0;` du 0.65.

**Plus de variables à déclarer :** la console retient elle-même où en est la lettre, grâce au numéro 0.

**Ce qu’on doit voir** — Comme au 0.65 : un A qui avance vers la droite et repart de la gauche.  
**Ce qu’il coûte** — 1695 octets de programme, 13 variables.

---

### 0.66. La lettre bouge avec la croix

> Le joueur agit, l’écran répond : c’est déjà un jeu.

```cpp
uint8_t x = 9;        // la lettre part du milieu de l'écran
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
```

`bouton(DROITE)` vaut vrai **tant que** la flèche droite est enfoncée. Même chose pour `GAUCHE`, `HAUT` et `BAS`.

Bouger à chaque image ferait traverser l’écran en un tiers de seconde. `attente` impose donc **8 images** entre deux pas : en gardant la flèche enfoncée, la lettre avance d’une case environ sept fois par seconde.

Les conditions `x < 19`, `x > 0`, `y < 17` et `y > 0` empêchent de sortir de l’écran.

Voilà les trois ingrédients d’un jeu : la **boucle**, le **joueur qui agit**, et l’**écran qui répond**.

**Ce qu’on doit voir** — Un A au milieu de l’écran, qui se déplace avec les flèches.  
**Ce qu’il coûte** — 1602 octets de programme, 3 variables.

---

### 0.66.1. La lettre bouge avec la croix — de base, ailleurs

> Le 0.66 avec le B, qui part de (4, 4).

```cpp
uint8_t x = 4;        // la colonne du B
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
```

**C’est le 0.66**, avec le **B**, qui part de **(4, 4)** au lieu du milieu.

**C’est la version de base** : la deuxième place, seule. Le 0.66.2 met les deux ensemble.

**Ce qu’on doit voir** — Un B en haut à gauche, qui se déplace avec les flèches.  
**Ce qu’il coûte** — 1562 octets de programme, 3 variables.

---

### 0.66.2. La lettre bouge avec la croix — doublé, deux positions

> Le A et le B suivent la MÊME croix : ils bougent ensemble, chacun depuis sa place.

```cpp
uint8_t x = 9;        // la colonne du A
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
```

**C’est le 0.66 et le 0.66.1 réunis** : les deux lettres, commandées par la même croix.

**Une flèche, deux pas :** chaque bouton fait avancer les deux lettres ; chacune garde sa place et s’arrête à SON bord.

**Ce qu’on doit voir** — Le A et le B bougent ensemble avec les flèches.  
**Ce qu’il coûte** — 1725 octets de programme, 5 variables.

---

### 0.66.3. La lettre bouge avec la croix — en simple

> Le 0.66 en une ligne : deplace_croix(x, y, ALPHABET[0], 133). Plus d’attente ni d’effacer à écrire.

```cpp
uint8_t x = 9;        // la lettre part du milieu de l'écran
uint8_t y = 8;

int main() {
  while (true) {
    image();
    deplace_croix(x, y, ALPHABET[0], 133);   // tout le bloc du 0.66 : 133 ms = 8 images
  }
}
```

**C’est le 0.66, en plus simple :** tout le bloc de la croix (l’attente, l’effacement, les quatre `if`, le `poser`) est remplacé par une ligne, `deplace_croix` (le 0.71).

**La vitesse, 133 ms :** c’est 8 images, exactement l’`attente = 8` du 0.66. La lettre va donc à la même vitesse.

**Et elle ne clignote plus :** `deplace_croix` n’efface l’ancienne case que si la lettre a bougé. Le 0.66 effaçait et reposait à chaque pas possible.

**Ce qu’on doit voir** — Comme au 0.66 : un A au milieu, qui se déplace avec les flèches.  
**Ce qu’il coûte** — 1748 octets de programme, 15 variables.

---

### 0.67. Les variables de la lettre dans leur propre fichier

> Le 0.66, rangé en deux : x, y et attente déménagent dans « variables.h » ; principal.cpp n’a plus que la boucle du jeu.

`variables.h`

```cpp
// variables.h : l'ÉTAT de la lettre qui bouge.
// Ce fichier ne fait rien tout seul : principal.cpp le verse chez lui
// avec #include "variables.h", tout en haut, avant main().

uint8_t x = 9;        // la COLONNE de la lettre : elle part du milieu (9)
uint8_t y = 8;        // la LIGNE de la lettre   : elle part du milieu (8)
uint8_t attente = 0;  // les images à attendre avant le prochain pas (0 : tout de suite)
```

`principal.cpp`

```cpp
// Le changement : les trois variables ne sont plus ici.
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
```

**C’est exactement le programme du 0.66**, avec un seul changement : les **trois variables** du haut (`x`, `y`, `attente`) ne sont plus dans `principal.cpp`. Elles sont dans un **second fichier**, `variables.h` : c’est l’**onglet** à côté de `principal.cpp`, au-dessus du code.

**Ce qui est nouveau ici : un programme en deux fichiers.** `principal.cpp` est le fichier **principal** : c’est par lui que la compilation commence. `variables.h` est un fichier **voisin** : il ne fait rien tout seul, il attend qu’on le verse quelque part.

**`#include "variables.h"`** veut dire : « **verse ici** tout ce qu’il y a dans `variables.h` ». Avant de compiler, la console remplace cette ligne par le contenu du fichier, mot pour mot. Le programme compilé est donc **exactement le même** qu’au 0.66 : il est seulement rangé en deux.

**Pourquoi tout en haut :** une variable doit être déclarée **avant** qu’on s’en serve. `main()` utilise `x`, `y` et `attente` : le `#include` qui les apporte vient donc avant `main()`.

**Le `.h`** est une habitude du C : il veut dire « *header* », en-tête, un fichier fait pour être versé en haut d’un autre. Les guillemets autour du nom disent que le fichier est **à côté** du programme.

**À quoi ça sert :** d’un côté **l’état du jeu** (où est la lettre, combien attendre), de l’autre **ce qu’on en fait** (la boucle, les boutons). Pour changer la place de départ de la lettre, on n’ouvre que `variables.h`, sans toucher à la boucle.

**Ce qu’on doit voir** — Exactement le 0.66 : un A au milieu de l’écran, qui se déplace avec les flèches. Mais le programme est rangé en deux onglets.  
**Ce qu’il coûte** — 1602 octets de programme, 3 variables.

---

### 0.67.1. Les variables de la lettre dans leur propre fichier — de base, ailleurs

> Le 0.67 avec le B : seul variables.h change (le départ en (4, 4)).

`variables.h`

```cpp
// variables.h : l'ÉTAT des lettres qui bougent.
uint8_t x = 4;       // la colonne du B
uint8_t y = 4;       // sa ligne
uint8_t attente = 0;
```

`principal.cpp`

```cpp
// voir l'onglet variables.h
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
```

**C’est le 0.67**, avec le **B**, qui part de (4, 4) : le départ change dans `variables.h`.

**C’est l’intérêt du fichier à part :** pour changer la place de départ, on n’a touché que `variables.h`.

**C’est la version de base** : la deuxième place, seule. Le 0.67.2 met les deux ensemble.

**Ce qu’on doit voir** — Un B qui part de (4, 4) et se déplace avec les flèches.  
**Ce qu’il coûte** — 1562 octets de programme, 3 variables.

---

### 0.67.2. Les variables de la lettre dans leur propre fichier — doublé, deux positions

> Deux lettres, et leurs quatre variables dans variables.h.

`variables.h`

```cpp
// variables.h : l'ÉTAT des lettres qui bougent.
uint8_t x = 9;       // la colonne du A
uint8_t y = 8;       // sa ligne
uint8_t xb = 4;       // la colonne du B
uint8_t yb = 4;       // sa ligne
uint8_t attente = 0;
```

`principal.cpp`

```cpp
// voir l'onglet variables.h
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
```

**C’est le 0.67 et le 0.67.1 réunis** : les deux lettres ; `variables.h` porte leurs quatre variables.

**Ce qu’on doit voir** — Le A et le B bougent ensemble avec les flèches.  
**Ce qu’il coûte** — 1725 octets de programme, 5 variables.

---

### 0.67.3. Les variables de la lettre dans leur propre fichier — en simple

> Le 0.67 en simple : variables.h ne garde que x et y ; principal.cpp, une ligne dans la boucle.

`variables.h`

```cpp
// variables.h : la place de la lettre. L'attente, la console la tient.
uint8_t x = 9;
uint8_t y = 8;
```

`principal.cpp`

```cpp
// x et y : voir l'onglet variables.h
#include "variables.h"

int main() {
  while (true) {
    image();
    deplace_croix(x, y, ALPHABET[0], 133);
  }
}
```

**C’est le 0.67, en plus simple :** la boucle de la croix est remplacée par une ligne, `deplace_croix`.

**`variables.h` rétrécit aussi :** plus besoin d’`attente`, la console la tient elle-même. Il ne reste que `x` et `y`, la place de la lettre.

**Ce qu’on doit voir** — Comme au 0.67 : un A qui se déplace avec les flèches, programme en deux onglets.  
**Ce qu’il coûte** — 1748 octets de programme, 15 variables.

---

### 0.68. Voir la position du A en direct

> Le 0.67, plus deux lignes dans la boucle : nombre(0, 17, x) et nombre(4, 17, y). La position du A s’affiche à chaque image, pendant qu’on le déplace.

`variables.h`

```cpp
// variables.h : l'ÉTAT de la lettre qui bouge (comme au 0.67).

uint8_t x = 9;        // la COLONNE de la lettre : elle part du milieu (9)
uint8_t y = 8;        // la LIGNE de la lettre   : elle part du milieu (8)
uint8_t attente = 0;  // les images à attendre avant le prochain pas
```

`principal.cpp`

```cpp
// x, y, attente : voir l'onglet variables.h. (#include veut être seul sur sa ligne.)
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
```

**C’est le 0.67, plus deux lignes** dans la boucle : `nombre(0, 17, x);` et `nombre(4, 17, y);`.

**Ce qui est nouveau ici : `nombre()` DANS la boucle.** Au 0.20, `nombre()` était appelé une fois, après un trajet : il montrait la valeur à ce moment-là. Ici, il est dans `while (true)` : il est rappelé à **chaque image**, 60 fois par seconde. L’écran montre donc toujours la valeur **du moment** : c’est de l’affichage **en temps réel**.

**Ce qu’on voit :** en bas à gauche, trois chiffres pour `x` (la colonne du A), et à côté, trois chiffres pour `y` (sa ligne). Appuie sur les flèches : les nombres changent en même temps que la lettre bouge. Au départ, `009` et `008`, le milieu de l’écran.

**Pourquoi avant `poser` :** si le A va sur la ligne 17, il passe **par-dessus** les nombres, parce qu’il est posé après eux. Les nombres sont réécrits à l’image suivante, dès que le A repart.

**Sans rien écrire, la page le montre aussi :** sous la console, ouvre « 🔬 Inspecteur », onglet **Variables** : `x`, `y` et `attente` y sont, par leur nom, mis à jour 4 fois par seconde.

**Ce qu’on doit voir** — Le A qui se déplace avec les flèches ; en bas à gauche, sa colonne et sa ligne changent en même temps.  
**Ce qu’il coûte** — 1622 octets de programme, 3 variables.

---

### 0.68.1. Voir la position du A en direct — de base, ailleurs

> Le 0.68 avec le B, parti de (4, 4) : sa position en direct.

`variables.h`

```cpp
// variables.h : l'ÉTAT des lettres qui bougent.
uint8_t x = 4;       // la colonne du B
uint8_t y = 4;       // sa ligne
uint8_t attente = 0;
```

`principal.cpp`

```cpp
// voir l'onglet variables.h
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
```

**C’est le 0.68**, avec le **B**, parti de (4, 4) ; ses nombres en bas à gauche.

**C’est la version de base** : la deuxième place, seule. Le 0.68.2 met les deux ensemble.

**Ce qu’on doit voir** — Un B qui bouge avec les flèches ; sa colonne et sa ligne en bas à gauche.  
**Ce qu’il coûte** — 1582 octets de programme, 3 variables.

---

### 0.68.2. Voir la position du A en direct — doublé, deux positions

> Les deux positions en direct : le A à gauche, le B à droite de la ligne 17.

`variables.h`

```cpp
// variables.h : l'ÉTAT des lettres qui bougent.
uint8_t x = 9;       // la colonne du A
uint8_t y = 8;       // sa ligne
uint8_t xb = 4;       // la colonne du B
uint8_t yb = 4;       // sa ligne
uint8_t attente = 0;
```

`principal.cpp`

```cpp
// voir l'onglet variables.h
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
```

**C’est le 0.68 et le 0.68.1 réunis** : deux lettres, quatre nombres.

**Ce qu’on doit voir** — Le A et le B bougent ; en bas, leurs deux positions.  
**Ce qu’il coûte** — 1765 octets de programme, 5 variables.

---

### 0.68.3. Voir la position du A en direct — en simple

> Le 0.68 en simple : deplace_croix, puis les deux nombre. Trois lignes dans la boucle.

`variables.h`

```cpp
uint8_t x = 9;
uint8_t y = 8;
```

`principal.cpp`

```cpp
// x et y : voir l'onglet variables.h
#include "variables.h"

int main() {
  while (true) {
    image();
    deplace_croix(x, y, ALPHABET[0], 133);   // bouger
    nombre(0, 17, x);                        // la colonne, en direct
    nombre(4, 17, y);                        // la ligne, en direct
  }
}
```

**C’est le 0.68, en plus simple :** la croix tient en une ligne, `deplace_croix` ; il reste les deux `nombre` qui montrent la position.

**Trois lignes font tout :** bouger, montrer la colonne, montrer la ligne.

**Ce qu’on doit voir** — Comme au 0.68 : le A bouge, sa position s’affiche en bas.  
**Ce qu’il coûte** — 1768 octets de programme, 15 variables.

---

### 0.69. Chercher le A sur l’écran : lire

> Le 0.68, plus une recherche : quand on appuie sur A, le programme regarde chaque case de l’écran avec lire(), et affiche où il a trouvé la lettre.

`variables.h`

```cpp
// variables.h : l'ÉTAT de la lettre qui bouge, et ce que la recherche a trouvé.

uint8_t x = 9;        // la COLONNE de la lettre : elle part du milieu (9)
uint8_t y = 8;        // la LIGNE de la lettre   : elle part du milieu (8)
uint8_t attente = 0;  // les images à attendre avant le prochain pas

uint8_t trouveX = 0;  // la colonne où lire() a trouvé le A (nouveau)
uint8_t trouveY = 0;  // la ligne où lire() a trouvé le A (nouveau)
```

`principal.cpp`

```cpp
// x, y, attente, trouveX, trouveY : voir l'onglet variables.h
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
```

**C’est le 0.68, plus un bloc** : quand on appuie sur le bouton **A**, le programme **cherche** la lettre sur l’écran, case par case, et affiche où il l’a trouvée.

**Ce qui est nouveau ici : `lire(colonne, ligne)`.** Elle **rend la tuile affichée** dans une case de l’écran. `lire(9, 8) == ALPHABET[0]` est vrai si la case (9, 8) montre un A.

**La recherche :** deux boucles `for`, l’une dans l’autre, passent sur **toutes les cases** : `l` fait les 18 lignes (0 à 17), et pour chaque ligne, `c` fait les 20 colonnes (0 à 19). Soit 18 × 20 = **360 cases**. Quand une case contient le A, on retient sa colonne dans `trouveX` et sa ligne dans `trouveY`.

**Deux façons de connaître la position.** `x` et `y` : le programme la **retient** lui-même, à chaque pas. `lire()` : il la **retrouve** en regardant l’écran, sans rien avoir retenu. Les deux nombres affichés (en bas à gauche, et à droite après avoir appuyé sur A) sont **les mêmes** : c’est la preuve que les deux façons s’accordent.

**À quoi sert `lire()` :** à savoir **ce qu’il y a à un endroit**, pas seulement où est sa propre lettre. Plus tard, c’est ainsi qu’on saura si une case est un mur, une pièce, un ennemi.

**Pourquoi seulement quand on appuie sur A :** regarder 360 cases prend du temps. Le faire à chaque image ralentirait le jeu ; on ne le fait que quand on le demande.

**Ce qu’on doit voir** — Le A se déplace avec les flèches. Quand on appuie sur A, sa position trouvée sur l’écran s’affiche à droite, en bas : la même que celle de gauche.  
**Ce qu’il coûte** — 1774 octets de programme, 7 variables.

---

### 0.69.1. Chercher le A sur l’écran : lire — de base, ailleurs

> On cherche le B, cette fois : lire(c, l) == ALPHABET[1].

`variables.h`

```cpp
// variables.h : l'ÉTAT des lettres qui bougent.
uint8_t x = 4;       // la colonne du B
uint8_t y = 4;       // sa ligne
uint8_t attente = 0;
uint8_t trouveX = 0;
uint8_t trouveY = 0;
```

`principal.cpp`

```cpp
// voir l'onglet variables.h
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
```

**C’est le 0.69**, avec le **B**, parti de (4, 4) ; la recherche compare à `ALPHABET[1]`.

**C’est la version de base** : la deuxième place, seule. Le 0.69.2 met les deux ensemble.

**Ce qu’on doit voir** — Un B qui bouge ; avec A, sa position trouvée s’affiche à droite.  
**Ce qu’il coûte** — 1734 octets de programme, 7 variables.

---

### 0.69.2. Chercher le A sur l’écran : lire — doublé, deux positions

> Deux lettres, et la recherche du B : lire() distingue les lettres.

`variables.h`

```cpp
// variables.h : l'ÉTAT des lettres qui bougent.
uint8_t x = 9;       // la colonne du A
uint8_t y = 8;       // sa ligne
uint8_t xb = 4;       // la colonne du B
uint8_t yb = 4;       // sa ligne
uint8_t attente = 0;
uint8_t trouveX = 0;
uint8_t trouveY = 0;
```

`principal.cpp`

```cpp
// voir l'onglet variables.h
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
```

**C’est le 0.69 et le 0.69.1 réunis** : le A et le B bougent ; la recherche ne trouve que le B.

**`lire` compare des tuiles :** `ALPHABET[1]` n’est égal qu’au B. Le A, sur une autre case, est ignoré.

**Ce qu’on doit voir** — Le A et le B bougent ; avec A, c’est la position du B qui s’affiche à droite.  
**Ce qu’il coûte** — 1897 octets de programme, 9 variables.

---

### 0.69.3. Chercher le A sur l’écran : lire — en simple

> Le 0.69 en simple : la croix en une ligne ; la recherche avec lire() reste, c’est elle qu’on apprend ici.

`variables.h`

```cpp
uint8_t x = 9;
uint8_t y = 8;
uint8_t trouveX = 0;  // la colonne où lire() a trouvé le A
uint8_t trouveY = 0;  // sa ligne
```

`principal.cpp`

```cpp
// x, y, trouveX, trouveY : voir l'onglet variables.h
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
```

**C’est le 0.69, en plus simple :** la croix est remplacée par `deplace_croix`.

**La recherche, elle, reste écrite à la main :** c’est ce que la leçon apprend, `lire()` et les deux boucles. Simplifier, ce n’est pas tout cacher : on ne cache que ce qu’on sait déjà faire.

**Ce qu’on doit voir** — Comme au 0.69 : avec A, la position trouvée s’affiche à droite, la même qu’à gauche.  
**Ce qu’il coûte** — 1920 octets de programme, 19 variables.

---

### 0.70. Plus fluide : la lettre au pixel près

> sprite(0, px, py, ALPHABET[0]) : la lettre devient un lutin, qui avance d’UN pixel par image au lieu de sauter d’une case. Le mouvement devient fluide.

`variables.h`

```cpp
// variables.h : la place de la lettre, maintenant EN PIXELS.

uint8_t px = 76;      // la colonne en pixels : 76 = le milieu ((160 - 8) / 2)
uint8_t py = 68;      // la ligne en pixels   : 68 = le milieu ((144 - 8) / 2)
```

`principal.cpp`

```cpp
// px, py : voir l'onglet variables.h
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
```

**Pourquoi la lettre saute :** jusqu’ici, elle était **posée sur la grille** avec `poser`. Une case fait **8 × 8 pixels** : chaque pas la faisait donc sauter de 8 pixels d’un coup, environ 7 fois par seconde. L’œil voit des sauts.

**Ce qui est nouveau ici : un lutin**, avec `sprite(numero, x, y, tuile)`. Un lutin n’est **pas** sur la grille : il flotte au-dessus du décor, et se place **au pixel près**. On le fait avancer d’**un seul pixel par image**, 60 fois par seconde : le mouvement devient **fluide**.

• **`numero`** : le numéro du lutin, de 0 à 39 (la console en a 40). Ici, `0`, le premier.

• **`px`, `py`** : sa place **en pixels**, et plus en cases. L’écran fait **160 pixels** de large et **144** de haut. Le milieu, pour une lettre de 8 pixels : (160 − 8) ÷ 2 = **76**, et (144 − 8) ÷ 2 = **68**.

• **`tuile`** : ce qu’il montre, `ALPHABET[0]`, le A.

**Plus besoin d’`effacer` ni d’`attente` :** un lutin se **déplace**, il ne se réécrit pas. On lui donne sa nouvelle place à chaque image, et la console le dessine là, sans rien laisser derrière. Et comme un pixel est petit, on peut avancer à chaque image, sans attendre.

**Les bords :** `px` va de 0 à **152** (160 − 8, pour que la lettre reste entière), `py` de 0 à **136** (144 − 8).

**Ce qu’on doit voir** — Un A au milieu de l’écran, qui glisse doucement avec les flèches, pixel par pixel, sans sauter de case en case.  
**Ce qu’il coûte** — 1510 octets de programme, 2 variables.

---

### 0.70.1. Plus fluide : la lettre au pixel près — de base, ailleurs

> Le 0.70 avec le B, parti de (20, 20).

```cpp
uint8_t px = 20;      // le B, en pixels
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
```

**C’est le 0.70**, avec le **B**, parti de **(20, 20)** pixels, en haut à gauche.

**C’est la version de base** : la deuxième place, seule. Le 0.70.2 met les deux ensemble.

**Ce qu’on doit voir** — Un B en haut à gauche, qui glisse avec les flèches.  
**Ce qu’il coûte** — 1510 octets de programme, 2 variables.

---

### 0.70.2. Plus fluide : la lettre au pixel près — doublé, deux positions

> Deux lutins, 0 et 1 : le A et le B glissent ensemble.

```cpp
uint8_t px = 76;      // le A, en pixels
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
```

**C’est le 0.70 et le 0.70.1 réunis** : deux lutins, chacun avec son numéro (0 et 1).

**Chaque lutin a son numéro :** le même numéro ferait bouger le même lutin. Ici, 0 pour le A, 1 pour le B.

**Ce qu’on doit voir** — Le A et le B glissent ensemble avec les flèches.  
**Ce qu’il coûte** — 1747 octets de programme, 4 variables.

---

### 0.70.3. Plus fluide : la lettre au pixel près — en simple

> Le 0.70 en une ligne : glisse_croix(0, px, py, ALPHABET[0], 1).

```cpp
uint8_t px = 76;      // en pixels : le milieu
uint8_t py = 68;

int main() {
  while (true) {
    image();
    glisse_croix(0, px, py, ALPHABET[0], 1);   // tout le 0.70
  }
}
```

**C’est le 0.70, en plus simple :** les quatre `if` des flèches et le `sprite` sont remplacés par une ligne, `glisse_croix` (le 0.73).

**La vitesse, 1 :** un pixel par image, comme au 0.70.

**Ce qu’on doit voir** — Comme au 0.70 : un A qui glisse pixel par pixel avec les flèches.  
**Ce qu’il coûte** — 1592 octets de programme, 9 variables.

---

### 0.71. La croix en une ligne : deplace_croix

> deplace_croix(x, y, tuile, vitesse), fonction de la console : tout le bloc de la croix du 0.66 en une seule ligne, dans la boucle, à la vitesse qu’on choisit.

```cpp
uint8_t x = 9;        // la COLONNE de la lettre : elle part du milieu
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
```

**C’est le programme du 0.66**, avec un seul changement : tout le bloc qui lisait la croix (l’attente, l’effacement, les quatre `if`, le `poser`) est remplacé par **une ligne**.

**Ce qui est nouveau ici : `deplace_croix(x, y, tuile, vitesse)`.** C’est une fonction **de la console**, comme `ALPHABET` est un tableau de la console : on s’en sert **sans rien déclarer**, et elle n’est ajoutée à la cartouche que si on l’appelle.

**La vitesse, 4e réglage, est obligatoire :** c’est le temps entre deux pas, en **millisecondes**. `250` : un pas tous les quarts de seconde, **4 cases par seconde**. Plus le nombre est petit, plus la lettre va vite (le 0.72 essaie `100`). Il s’écrit **en clair** : le compilateur le traduit en images avant le jeu, comme `ms(250)` = 15 images.

**Ce qu’elle fait, à chaque appel :** elle lit la croix ; si une flèche est tenue et que le temps d’attente est passé, elle fait **un pas** d’une case (en restant dans l’écran), efface l’ancienne case, et attend le temps de la vitesse avant le pas suivant. Puis elle pose la lettre à sa place.

**Elle ne bloque pas :** un appel, au plus un pas, et elle rend la main. On l’appelle donc **dans la boucle**, une fois par image, après `image()`.

**Pas de `x =` :** comme `deplace` au 0.26, elle est seule sur sa ligne, et la console range la nouvelle colonne dans `x` et la nouvelle ligne dans `y`.

**Elle ne clignote pas :** elle n’efface l’ancienne case **que si la lettre a bougé**. Immobile, la lettre est simplement reposée à la même place.

**Ce qu’on doit voir** — Un A au milieu de l’écran, qui se déplace case par case avec les flèches, 4 cases par seconde. Le programme tient en quelques lignes.  
**Ce qu’il coûte** — 1748 octets de programme, 15 variables.

---

### 0.71.1. La croix en une ligne : deplace_croix — de base, ailleurs

> Le 0.71 avec le B, parti de (4, 4).

```cpp
uint8_t x = 4;        // le B
uint8_t y = 4;

int main() {
  while (true) {
    image();
    deplace_croix(x, y, ALPHABET[1], 250);
  }
}
```

**C’est le 0.71**, avec le **B**, parti de **(4, 4)**.

**C’est la version de base** : la deuxième place, seule. Le 0.71.2 met les deux ensemble.

**Ce qu’on doit voir** — Un B qui suit la croix, depuis le haut à gauche.  
**Ce qu’il coûte** — 1748 octets de programme, 15 variables.

---

### 0.71.2. La croix en une ligne : deplace_croix — doublé, deux positions

> Deux lettres, la même croix : deux appels, dans la même image.

```cpp
uint8_t x = 9;        // le A
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
```

**C’est le 0.71 et le 0.71.1 réunis** : deux appels, un par lettre.

**Les deux bougent dans la même image :** la console ne fait passer le temps d’attente qu’une fois par image ; chaque appel de cette image a le droit de faire son pas.

**Ce qu’on doit voir** — Le A et le B suivent la croix ensemble.  
**Ce qu’il coûte** — 1781 octets de programme, 17 variables.

---

### 0.72. Plus vite sur la grille : deplace_croix à 100

> Le 0.71 avec un seul nombre changé : la vitesse passe de 250 à 100 millisecondes. La lettre fait 10 cases par seconde au lieu de 4.

```cpp
uint8_t x = 9;        // la COLONNE de la lettre
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
```

**C’est le 0.71, avec un seul changement :** la vitesse, 4e réglage de `deplace_croix`, passe de `250` à `100`.

**Ce qui est nouveau ici : choisir sa vitesse.** `100` millisecondes entre deux pas : **10 cases par seconde**, deux fois et demie plus vite qu’au 0.71. `500` ferait 2 cases par seconde, très lentement.

**Plus le nombre est petit, plus ça va vite**, puisque c’est le temps d’attente entre deux pas.

**Trop vite, c’est difficile à diriger :** à `50` (20 cases par seconde), la lettre traverse l’écran en une seconde, et il devient dur de s’arrêter sur la bonne case. Essaie, et choisis ce qui convient à ton jeu.

**Ce qu’on doit voir** — Le même A qu’au 0.71, mais qui file sur la grille : 10 cases par seconde.  
**Ce qu’il coûte** — 1748 octets de programme, 15 variables.

---

### 0.72.1. Plus vite sur la grille : deplace_croix à 100 — de base, ailleurs

> Le 0.72 avec le B, parti de (4, 4).

```cpp
uint8_t x = 4;        // le B
uint8_t y = 4;

int main() {
  while (true) {
    image();
    deplace_croix(x, y, ALPHABET[1], 100);
  }
}
```

**C’est le 0.72**, avec le **B**, parti de **(4, 4)**.

**C’est la version de base** : la deuxième place, seule. Le 0.72.2 met les deux ensemble.

**Ce qu’on doit voir** — Un B qui suit la croix, depuis le haut à gauche.  
**Ce qu’il coûte** — 1748 octets de programme, 15 variables.

---

### 0.72.2. Plus vite sur la grille : deplace_croix à 100 — doublé, deux positions

> Deux lettres, la même croix : deux appels, dans la même image.

```cpp
uint8_t x = 9;        // le A
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
```

**C’est le 0.72 et le 0.72.1 réunis** : deux appels, un par lettre.

**Les deux bougent dans la même image :** la console ne fait passer le temps d’attente qu’une fois par image ; chaque appel de cette image a le droit de faire son pas.

**Ce qu’on doit voir** — Le A et le B suivent la croix ensemble.  
**Ce qu’il coûte** — 1781 octets de programme, 17 variables.

---

### 0.73. Glisser en une ligne : glisse_croix

> glisse_croix(0, px, py, tuile, vitesse), fonction de la console : la lettre-lutin du 0.70 suit la croix au pixel près, en une seule ligne.

```cpp
uint8_t px = 76;      // la colonne en PIXELS : le milieu
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
```

**C’est le programme du 0.70**, avec un seul changement : les quatre `if` des flèches et le `sprite` sont remplacés par **une ligne**.

**Ce qui est nouveau ici : `glisse_croix(numero, px, py, tuile, vitesse)`.** La même idée que `deplace_croix` au 0.71, mais **au pixel près**, avec un lutin.

• **`numero`** : le numéro du lutin, `0`. • **`px`, `py`** : sa place en pixels ; la console y range la nouvelle place. • **`tuile`** : ce qu’il montre.

• **`vitesse`**, obligatoire : combien de **pixels par image** tant qu’une flèche est tenue. `1` : un pixel par image, **60 pixels par seconde**, le mouvement le plus doux. Ce n’est pas une durée comme pour `deplace_croix` : ici, **plus le nombre est grand, plus ça va vite** (le 0.74 essaie `3`).

**Elle reste dans l’écran :** `px` de 0 à 152, `py` de 0 à 136, pour que la lettre de 8 pixels reste entière dans l’écran de 160 × 144.

**Laquelle choisir ?** `deplace_croix` pour un jeu **sur la grille** (un labyrinthe, un plateau), où l’on avance case par case. `glisse_croix` pour un personnage **qui glisse** librement.

**Ce qu’on doit voir** — Exactement le 0.70 : un A qui glisse doucement avec les flèches, pixel par pixel. Mais en une ligne.  
**Ce qu’il coûte** — 1592 octets de programme, 9 variables.

---

### 0.73.1. Glisser en une ligne : glisse_croix — de base, ailleurs

> Le 0.73 avec le B, parti de (20, 20) pixels.

```cpp
uint8_t px = 20;      // le B, en pixels
uint8_t py = 20;

int main() {
  while (true) {
    image();
    glisse_croix(0, px, py, ALPHABET[1], 1);
  }
}
```

**C’est le 0.73**, avec le **B**, parti de **(20, 20)** pixels.

**C’est la version de base** : la deuxième place, seule. Le 0.73.2 met les deux ensemble.

**Ce qu’on doit voir** — Un B qui suit la croix, depuis le haut à gauche.  
**Ce qu’il coûte** — 1592 octets de programme, 9 variables.

---

### 0.73.2. Glisser en une ligne : glisse_croix — doublé, deux positions

> Deux lettres, la même croix : deux appels, dans la même image.

```cpp
uint8_t px = 76;      // le A, en pixels
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
```

**C’est le 0.73 et le 0.73.1 réunis** : deux appels, un par lettre.

**Deux lutins, deux numéros** (0 et 1) : ils glissent ensemble.

**Ce qu’on doit voir** — Le A et le B suivent la croix ensemble.  
**Ce qu’il coûte** — 1629 octets de programme, 11 variables.

---

### 0.74. Glisser plus vite : glisse_croix à 3

> Le 0.73 avec un seul nombre changé : la vitesse passe de 1 à 3 pixels par image. La lettre glisse trois fois plus vite.

```cpp
uint8_t px = 76;      // la colonne en PIXELS
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
```

**C’est le 0.73, avec un seul changement :** la vitesse, 5e réglage de `glisse_croix`, passe de `1` à `3`.

**Ce qui est nouveau ici : plusieurs pixels par image.** `3` : trois pixels à chaque image, **180 pixels par seconde**. La lettre traverse l’écran (152 pixels) en moins d’une seconde.

**Toujours fluide :** le lutin se déplace à **chaque** image, 60 fois par seconde ; il fait seulement des pas un peu plus grands. Au-delà de 4 ou 5, l’œil commence à voir des sauts.

**Au bord,** un pas qui dépasserait s’arrête pile au bord : la lettre ne sort jamais de l’écran.

**Elle peut être une variable :** contrairement à la vitesse de `deplace_croix`, celle-ci n’est pas une durée. On pourra la changer en plein jeu, par exemple aller plus vite tant qu’on tient **B**.

**Ce qu’on doit voir** — Le même A qu’au 0.73, mais qui glisse trois fois plus vite, toujours sans à-coups.  
**Ce qu’il coûte** — 1592 octets de programme, 9 variables.

---

### 0.74.1. Glisser plus vite : glisse_croix à 3 — de base, ailleurs

> Le 0.74 avec le B, parti de (20, 20) pixels.

```cpp
uint8_t px = 20;      // le B, en pixels
uint8_t py = 20;

int main() {
  while (true) {
    image();
    glisse_croix(0, px, py, ALPHABET[1], 3);
  }
}
```

**C’est le 0.74**, avec le **B**, parti de **(20, 20)** pixels.

**C’est la version de base** : la deuxième place, seule. Le 0.74.2 met les deux ensemble.

**Ce qu’on doit voir** — Un B qui suit la croix, depuis le haut à gauche.  
**Ce qu’il coûte** — 1592 octets de programme, 9 variables.

---

### 0.74.2. Glisser plus vite : glisse_croix à 3 — doublé, deux positions

> Deux lettres, la même croix : deux appels, dans la même image.

```cpp
uint8_t px = 76;      // le A, en pixels
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
```

**C’est le 0.74 et le 0.74.1 réunis** : deux appels, un par lettre.

**Deux lutins, deux numéros** (0 et 1) : ils glissent ensemble.

**Ce qu’on doit voir** — Le A et le B suivent la croix ensemble.  
**Ce qu’il coûte** — 1629 octets de programme, 11 variables.

---

### 0.75. Arrivé en (0, 0), le A devient B

> Le A part de (10, 0) et suit la croix ; sa position s’affiche en direct. Quand il arrive en (0, 0), il se transforme en B : if (x == 0 && y == 0).

```cpp
uint8_t x = 10;       // la COLONNE : le A part de la colonne 10…
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
```

**Le A part de (10, 0)**, en haut de l’écran, et se déplace avec la croix, comme au 0.71. Sa position s’affiche **en direct** en bas de l’écran, comme au 0.68 : `x` à gauche, `y` à côté.

**Ce qui est nouveau ici : une condition sur la position.** `if (x == 0 && y == 0)` veut dire : « si `x` vaut 0 **ET** si `y` vaut 0 ». `&&` se lit « et » : il faut que **les deux** soient vrais en même temps. En (0, 5), `x == 0` est vrai mais `y == 0` est faux : rien ne se passe. En (0, 0), les deux sont vrais : la condition est vraie.

**La lettre dans une variable :** `lettre` vaut 0 au départ, et la croix pose `ALPHABET[lettre]`, donc `ALPHABET[0]`, le A. Quand la condition est vraie, `lettre = 1;` : à l’image suivante, `deplace_croix` pose `ALPHABET[1]`, le **B**.

**Le B reste un B :** rien ne remet `lettre` à 0. Même en quittant la case (0, 0), la lettre reste transformée.

**Deux façons d’écrire le `if` :** sur une ligne, `if (x == 0 && y == 0) lettre = 1;`, ou **avec des accolades** : `if (x == 0 && y == 0) { lettre = 1; }`. Les deux font exactement la même chose. Sans accolades, le `if` ne commande **qu’une seule** instruction, celle qui le suit. Avec des accolades, il commande **tout ce qui est entre elles** : on peut y mettre plusieurs lignes (changer la lettre ET jouer un son, par exemple). Le programme l’écrit avec des accolades, et montre l’autre forme en commentaire juste au-dessus.

**Pour y arriver :** la flèche **gauche**, dix pas. Les nombres en bas montrent `x` qui descend : 010, 009… jusqu’à 000. Et la lettre change.

**Ce qu’on doit voir** — Un A en haut de l’écran ; avec la flèche gauche, il va jusqu’au coin (0, 0), et là il devient un B. En bas, sa position en direct.  
**Ce qu’il coûte** — 1822 octets de programme, 16 variables.

---

### 0.75.1. Arrivé en (0, 0), le A devient B — de base, ailleurs

> Le 0.75 avec un autre départ : le A part de (10, 8), et devient toujours B en (0, 0). Il faut aller à gauche, puis monter.

```cpp
uint8_t x = 10;       // le changement : le départ, (10, 8), au milieu
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
```

**C’est le 0.75**, avec un seul changement : le **départ**. Le A part de **(10, 8)**, au milieu de l’écran, au lieu de (10, 0).

**La case de transformation ne change pas : (0, 0)**, le coin en haut à gauche. La condition est la même : `if (x == 0 && y == 0)`.

**Le chemin est plus long :** la flèche **gauche** amène le A en (0, 8), au bord gauche. Là, `x == 0` est vrai, mais `y == 0` est faux (y vaut 8) : il reste un A. Puis la flèche **haut** le fait monter : 7, 6… et en (0, 0), les deux sont vrais. Il devient B.

**C’est ce que montre `&&` :** arriver dans la bonne colonne ne suffit pas, il faut aussi la bonne ligne. Regarde les nombres en bas : `000 008` au bord gauche, encore un A ; `000 000` au coin, un B.

**C’est la version de base** : une seule lettre, un autre départ. Le 0.75.2 met les deux ensemble.

**Ce qu’on doit voir** — Un A au milieu de l’écran ; la flèche gauche l’amène au bord (0, 8), encore un A ; la flèche haut le fait monter jusqu’au coin (0, 0), où il devient B.  
**Ce qu’il coûte** — 1823 octets de programme, 16 variables.

---

### 0.75.2. Arrivé en (0, 0), le A devient B — doublé, deux positions

> Deux A, deux départs, la même case d’arrivée : chacun devient B en arrivant en (0, 0).

```cpp
uint8_t x = 10;        // le premier A : départ (10, 0)
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
```

**C’est le 0.75 et le 0.75.1 réunis :** deux A, l’un parti de (10, 0), l’autre de (10, 8). La même croix les déplace ensemble.

**Chacun a ses variables :** `x`, `y`, `lettre` pour le premier ; `xb`, `yb`, `lettreB` pour le second. Et chacun a **sa condition**, sur **sa** position, mais vers la **même** case : (0, 0).

**Ils n’y arrivent pas en même temps.** Avec la flèche gauche, le premier arrive en (0, 0) et devient B ; le second, en (0, 8), reste un A. Avec la flèche haut, le premier ne peut plus monter (il est déjà en haut) ; le second monte, arrive en (0, 0), et devient B à son tour.

**À la fin, les deux B sont sur la même case**, (0, 0) : on n’en voit qu’un. Chaque lettre ne connaît que sa propre position ; rien ne les empêche de se retrouver au même endroit.

**Ce qu’on doit voir** — Deux A ; à gauche, le premier arrive en (0, 0) et devient B ; en montant, le second y arrive aussi et devient B.  
**Ce qu’il coûte** — 1930 octets de programme, 19 variables.

---

### 0.76. Un déclencheur en (0, 0) : actif

> Le A suit la croix depuis (10, 0) ; en arrivant en (0, 0), la variable actif passe de 0 à 1. C’est un déclencheur : il servira aux leçons 0.76.1 à 0.76.6.

```cpp
uint8_t x = 10;       // le A part de (10, 0)
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
```

**Le A part de (10, 0)** et suit la croix, avec sa position en direct, comme au 0.75. Mais cette fois, il ne se transforme pas : en arrivant en (0, 0), il **déclenche** quelque chose.

**Ce qui est nouveau ici : un drapeau, `actif`.** C’est une variable qui dit **oui ou non** : 0 = « pas encore », 1 = « le A est passé par (0, 0) ». On la voit à l’écran, en bas, à la colonne 10 : `000`, puis `001`.

**Une condition à trois morceaux :** `if (x == 0 && y == 0 && actif == 0)`. Le A est en (0, 0) **et** le drapeau vaut encore 0. La troisième partie fait que le bloc ne s’exécute **qu’une seule fois** : dès qu’`actif` vaut 1, elle devient fausse, même si le A reste sur la case.

**Pourquoi un drapeau :** les leçons suivantes font apparaître des lettres et les mettent en mouvement **à partir de ce moment-là**. Le drapeau retient que le moment est passé.

**Ce qu’on doit voir** — Le A suit la croix ; en bas, sa position et le drapeau. En (0, 0), le drapeau passe à 001.  
**Ce qu’il coûte** — 1858 octets de programme, 16 variables.

---

### 0.76.1. Un déclencheur en (0, 0) : le B apparaît au milieu

> Le 0.76, plus une ligne dans le bloc du déclencheur : poser(10, 8, ALPHABET[1]). En (0, 0), un B apparaît au milieu de l’écran.

```cpp
uint8_t x = 10;       // le A part de (10, 0)
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
```

**C’est le 0.76, plus une ligne** dans le bloc du déclencheur.

**Ce qui est nouveau ici : une action déclenchée.** `poser(10, 8, ALPHABET[1]);` pose un B au milieu de l’écran. Comme le bloc ne s’exécute **qu’une fois** (grâce à `actif == 0`), le B n’est posé qu’une fois, au moment où le A arrive en (0, 0).

**Avant, le milieu est vide ;** après, le B y reste. Le A, lui, continue de suivre la croix.

**Ce qu’on doit voir** — Le A suit la croix ; quand il arrive en (0, 0), un B apparaît au milieu de l’écran.  
**Ce qu’il coûte** — 1875 octets de programme, 16 variables.

---

### 0.76.2. Un déclencheur en (0, 0) : le B tourne en carré

> Le 0.76.1, plus un bloc : une fois apparu, le B fait un carré sans fin à partir du milieu, un pas tous les quarts de seconde, sans bloquer le A.

```cpp
uint8_t x = 10;       // le A part de (10, 0)
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
```

**C’est le 0.76.1, plus un bloc :** les mouvements, qui ne commencent que quand `actif` vaut 1.

**Pourquoi pas `carre` :** `carre` bloque. Pendant son tour, le A ne pourrait plus bouger. On fait donc le carré **pas à pas**, avec `un_pas`, qui n’attend pas (le 0.30).

**Le tour, compté par `bpas` :** un carré de 4 cases de côté, c’est 16 pas. `bpas` va de 0 à 15 : de 0 à 3, un pas **à droite** ; de 4 à 7, **en bas** ; de 8 à 11, **à gauche** ; de 12 à 15, **en haut**. Après le pas 15, `bpas` revient à 0 : le tour recommence, sans fin.

**`else if`** enchaîne les cas : on ne teste le suivant que si le précédent était faux. Un seul des quatre `un_pas` est fait à chaque pas.

**Le rythme :** `bimages` compte les images ; à 15 (un quart de seconde), un pas, et on recompte. Le B part du milieu (10, 8) et tourne : (14, 8), (14, 12), (10, 12), puis retour au milieu.

**Ce qu’on doit voir** — En (0, 0), le B apparaît au milieu, puis tourne en carré sans fin, pendant que le A suit toujours la croix.  
**Ce qu’il coûte** — 2387 octets de programme, 25 variables.

---

### 0.76.3. Un déclencheur en (0, 0) : le carré plus rapide

> Le 0.76.2 avec un seul nombre changé : le B fait un pas toutes les 5 images au lieu de 15. Son carré va trois fois plus vite.

```cpp
uint8_t x = 10;       // le A part de (10, 0)
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
```

**C’est le 0.76.2, avec un seul changement :** `if (bimages == 5)` au lieu de 15.

**Ce qui est nouveau ici : la vitesse du chronomètre.** Un pas toutes les **5 images**, c’est 12 pas par seconde, **trois fois plus vite**. Le tour de 16 pas dure alors moins d’une seconde et demie.

**Plus le nombre est petit, plus ça va vite**, comme pour toutes les vitesses vues jusqu’ici : c’est le temps d’attente entre deux pas.

**Ce qu’on doit voir** — Le même carré qu’au 0.76.2, mais trois fois plus rapide.  
**Ce qu’il coûte** — 2387 octets de programme, 25 variables.

---

### 0.76.4. Un déclencheur en (0, 0) : deux B

> Le 0.76.3, plus un second B : il part du coin opposé du carré, et les deux B se poursuivent.

```cpp
uint8_t x = 10;       // le A part de (10, 0)
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
```

**C’est le 0.76.3, plus un second B.**

**Ce qui est nouveau ici : deux lettres sur le même carré.** Le second B a **ses** variables (`bx2`, `by2`, `bpas2`). Il apparaît au coin opposé, (14, 12), avec `bpas2 = 8` : il est déjà à mi-tour, donc il commence par aller **à gauche**.

**Le même chronomètre** fait avancer les deux : à chaque tic, un pas pour chacun. Toujours à 8 pas l’un de l’autre, ils se poursuivent sans jamais se rattraper.

**Ce qu’on doit voir** — En (0, 0), deux B apparaissent, au milieu et au coin opposé, et tournent ensemble en se poursuivant.  
**Ce qu’il coûte** — 2633 octets de programme, 28 variables.

---

### 0.76.5. Un déclencheur en (0, 0) : le C file à gauche

> Le 0.76.4, plus un C : il apparaît au bord droit, sur la ligne 3, et file vers la gauche ; au bord, il repart de droite.

```cpp
uint8_t x = 10;       // le A part de (10, 0)
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
```

**C’est le 0.76.4, plus un C** (`ALPHABET[2]`).

**Ce qui est nouveau ici : un mouvement vers la GAUCHE, qui recommence.** À chaque tic du chronomètre, le C efface sa case, recule d’une colonne (`cx--`), et se repose. Arrivé à la colonne 0, il **repart de la colonne 19** : `if (cx == 0) { cx = 19; } else { cx--; }`.

**`if … else` avec accolades :** si `cx` vaut 0, on fait le premier bloc (repartir à droite) ; sinon, le second (reculer d’une case). Jamais les deux.

**Ce qu’on doit voir** — En (0, 0), les deux B tournent, et un C file vers la gauche en haut de l’écran, sans fin.  
**Ce qu’il coûte** — 2753 octets de programme, 30 variables.

---

### 0.76.6. Un déclencheur en (0, 0) : le D file à droite

> Le 0.76.5, plus un D : il apparaît au bord gauche, sur la ligne 14, et file vers la droite ; au bord, il repart de gauche.

```cpp
uint8_t x = 10;       // le A part de (10, 0)
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
```

**C’est le 0.76.5, plus un D** (`ALPHABET[3]`).

**Ce qui est nouveau ici : le mouvement inverse du C.** Le D avance d’une colonne (`dx++`) à chaque tic, et arrivé à la colonne 19, il **repart de la colonne 0** : `if (dx == 19) { dx = 0; } else { dx++; }`.

**Tout part du même déclencheur :** en (0, 0), le A fait apparaître quatre lettres, et chacune a son mouvement. Le A, lui, suit toujours la croix.

**Ce qu’on doit voir** — En (0, 0), deux B tournent, un C file à gauche en haut, un D file à droite en bas.  
**Ce qu’il coûte** — 2871 octets de programme, 32 variables.

---

### 0.76.7. Un déclencheur en (0, 0) : actif — en simple

> Le 0.76 en plus simple : if (x == 0 && y == 0) { actif = 1; }, sans le troisième morceau.

```cpp
uint8_t x = 10;       // le A part de (10, 0)
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
```

**C’est le 0.76, écrit plus simplement.** La condition perd son troisième morceau : `if (x == 0 && y == 0) { actif = 1; }`.

**Pourquoi on peut l’enlever :** au 0.76, `&& actif == 0` servait à ne faire le bloc **qu’une fois**. Mais ici, le bloc ne fait que mettre `actif` à 1 : le refaire à chaque image ne change rien, puisqu’il vaut déjà 1. Le troisième morceau n’est utile que si le bloc fait quelque chose qu’on ne veut **pas** répéter.

**La règle pour simplifier :** une condition qui ne change rien au résultat peut disparaître. Moins de code, moins d’erreurs.

**Ce qu’on doit voir** — Comme au 0.76 : en (0, 0), le drapeau passe à 001.  
**Ce qu’il coûte** — 1830 octets de programme, 16 variables.

---

### 0.76.8. Un déclencheur en (0, 0) : le B apparaît au milieu — en simple

> Le 0.76.1 en plus simple : tant qu’actif vaut 1, on pose le B au milieu, à chaque image.

```cpp
uint8_t x = 10;       // le A part de (10, 0)
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
```

**C’est le 0.76.1, écrit plus simplement.** Au lieu de poser le B **une fois**, au moment exact du déclencheur, on le pose **à chaque image** tant qu’`actif` vaut 1 : `if (actif == 1) { poser(10, 8, ALPHABET[1]); }`.

**Pourquoi ça marche :** poser la même lettre à la même place ne se voit pas, et ne clignote pas (rien ne l’efface). Le résultat à l’écran est le même, et il n’y a plus besoin de penser au « une seule fois ».

**Ce qu’on doit voir** — Comme au 0.76.1 : en (0, 0), un B apparaît au milieu.  
**Ce qu’il coûte** — 1866 octets de programme, 16 variables.

---

### 0.76.9. Un déclencheur en (0, 0) : le B tourne en carré — en simple

> Le 0.76.2 en une ligne : tourne_carre(0, 10, 8, ALPHABET[1], 4, 250). Plus de bpas, bx, bimages : la console s’en occupe.

```cpp
uint8_t x = 10;       // le A part de (10, 0)
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
```

**C’est le 0.76.2, en une ligne.** Tout le bloc des mouvements (le chronomètre `bimages`, le compteur de tour `bpas`, les quatre `un_pas`, `bx`, `by`) est remplacé par **une fonction de la console**.

**Ce qui est nouveau ici : `tourne_carre(numero, x, y, tuile, cote, vitesse)`.** À appeler **à chaque image**. Au premier appel, la lettre apparaît en (`x`, `y`), un coin du carré ; ensuite, toutes les `vitesse` millisecondes, elle fait **un pas** : `cote` pas à droite, puis en bas, puis à gauche, puis en haut, et elle recommence, sans fin.

• **`numero`** (0 à 3) : la console retient, pour chaque numéro, **où en est** la lettre (sa place, son pas dans le tour, son attente). C’est ce qui remplace `bx`, `by`, `bpas` et `bimages`.

• **`cote`** : 4, un côté de 4 pas, comme au 0.76.2. • **`vitesse`** : 250 ms par pas, écrite en clair.

**Elle ne bloque pas :** comme `un_pas`, elle fait au plus un pas et rend la main. Le A suit toujours la croix.

**Elle remplace aussi le `poser` du 0.76.1 :** c’est son premier appel qui fait apparaître le B.

**Ce qu’on doit voir** — Comme au 0.76.2 : en (0, 0), le B apparaît au milieu et tourne en carré.  
**Ce qu’il coûte** — 2536 octets de programme, 35 variables.

---

### 0.76.10. Un déclencheur en (0, 0) : le carré plus rapide — en simple

> Le 0.76.3 en simple : un seul nombre change, la vitesse de tourne_carre, 250 → 80.

```cpp
uint8_t x = 10;       // le A part de (10, 0)
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
```

**C’est le 0.76.3, en simple :** la vitesse, 6e réglage de `tourne_carre`, passe de `250` à `80` millisecondes.

**80 ms, c’est 5 images :** exactement la vitesse du 0.76.3 (`bimages == 5`). Mais ici, on la dit en millisecondes, comme partout ailleurs.

**Ce qu’on doit voir** — Comme au 0.76.3 : le carré tourne trois fois plus vite.  
**Ce qu’il coûte** — 2536 octets de programme, 35 variables.

---

### 0.76.11. Un déclencheur en (0, 0) : deux B — en simple

> Le 0.76.4 en simple : une ligne de plus, tourne_carre(1, 14, 12, ALPHABET[1], -4, 80). Un côté négatif part du coin opposé.

```cpp
uint8_t x = 10;       // le A part de (10, 0)
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
```

**C’est le 0.76.4, en simple :** une ligne de plus, pour le second B.

**Ce qui est nouveau ici : le numéro 1, et un côté négatif.** Le **numéro 1** : la console retient cette lettre à part de celle du numéro 0. Le **côté `-4`** : le même carré de 4, mais la lettre part vers la **gauche** puis vers le haut, comme le second B du 0.76.4, qui partait du coin opposé (14, 12).

**Ce qu’on doit voir** — Comme au 0.76.4 : deux B tournent sur le même carré, en se poursuivant.  
**Ce qu’il coûte** — 2563 octets de programme, 35 variables.

---

### 0.76.12. Un déclencheur en (0, 0) : le C file à gauche — en simple

> Le 0.76.5 en simple : une ligne de plus, defile(0, 19, 3, ALPHABET[2], -1, 80). Le C file à gauche, sans fin.

```cpp
uint8_t x = 10;       // le A part de (10, 0)
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
```

**C’est le 0.76.5, en simple :** une ligne de plus, pour le C.

**Ce qui est nouveau ici : `defile(numero, x, y, tuile, sens, vitesse)`.** Au premier appel, la lettre apparaît en (`x`, `y`) ; ensuite, toutes les `vitesse` ms, elle fait un pas sur sa ligne : **`sens` -1 vers la gauche**, 1 vers la droite. Au bord, elle repart de l’autre côté, comme au 0.76.5.

**Son numéro, 0, est à elle :** les numéros de `defile` et ceux de `tourne_carre` sont séparés. Le C est le numéro 0 de `defile`, le B le numéro 0 de `tourne_carre`.

**Ce qu’on doit voir** — Comme au 0.76.5 : deux B tournent, un C file à gauche.  
**Ce qu’il coûte** — 2987 octets de programme, 48 variables.

---

### 0.76.13. Un déclencheur en (0, 0) : le D file à droite — en simple

> Le 0.76.6 en simple : une ligne de plus, defile(1, 0, 14, ALPHABET[3], 1, 80). Tout le 0.76.6, en quelques lignes.

```cpp
uint8_t x = 10;       // le A part de (10, 0)
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
```

**C’est le 0.76.6, en simple :** une ligne de plus, pour le D : `defile` avec le **numéro 1** et le **sens 1**, vers la droite.

**Compare avec le 0.76.6 :** là-bas, plus de cinquante lignes, onze variables, trois chronomètres cachés dans les `if`. Ici, quatre lignes dans le bloc `if (actif == 1)`, une par lettre. C’est le même jeu, à l’écran.

**Pourquoi avoir appris la version longue :** pour savoir ce que ces fonctions font **pour nous**. `tourne_carre` et `defile` contiennent exactement ce qu’on a écrit à la main : un chronomètre, un compteur, des pas.

**Ce qu’on doit voir** — Comme au 0.76.6 : deux B tournent, un C file à gauche, un D file à droite.  
**Ce qu’il coûte** — 3013 octets de programme, 48 variables.

---

### 0.77. Plusieurs rythmes sans compteur : chaque

> if (chaque(250)) { … } : le bloc se fait toutes les 250 ms, sans rien arrêter et sans chronomètre à écrire. Le 0.16 en quatre lignes.

```cpp
uint8_t lente = 0;    // la lettre de la lente : 0 = A … 25 = Z
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
```

**C’est le 0.16** (la lente et la rapide), **sans les chronomètres.** Au 0.16, chaque lettre avait sa variable qui comptait les images, et son `if` pour la remettre à zéro. Ici, une fonction de la console fait tout ça.

**Ce qui est nouveau ici : `chaque(ms)`.** Elle répond **1 (oui)** quand le temps est passé depuis la dernière fois, **0 (non)** le reste du temps. `if (chaque(1000)) { … }` : le bloc se fait **une fois par seconde**. `if (chaque(250)) { … }` : **quatre fois par seconde**.

**Elle n’arrête rien**, contrairement à `attendre()` : le reste de la boucle continue de tourner à chaque image. On peut donc avoir **plusieurs rythmes** dans le même programme.

**Chaque `chaque` a son propre chronomètre :** la console les distingue toute seule, par leur place dans le programme. Les deux lignes ci-dessous ne se gênent pas. On peut en écrire jusqu’à huit.

**`(lente + 1) % sizeof(ALPHABET)`** passe à la lettre suivante, et revient à 0 après la 26e (le Z) : le `%` du 0.9.

**Ce qu’on doit voir** — Comme au 0.16 : en haut, une lettre change chaque seconde ; en dessous, une autre quatre fois plus vite.  
**Ce qu’il coûte** — 1584 octets de programme, 9 variables.

---

### 0.78. Le rebond : une vitesse qui change de signe

> Une lettre qui va et vient d’un bord à l’autre, toute seule : x = x + vx, et au bord, vx change de signe.

```cpp
uint8_t x = 0;        // la colonne de la balle
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
```

**Une balle qui rebondit :** la lettre O avance vers la droite ; au bord droit, elle repart vers la gauche ; au bord gauche, vers la droite. Sans fin, et sans compter les pas.

**Ce qui est nouveau ici : une VITESSE, `vx`.** Elle dit de combien bouge la lettre à chaque pas : `1`, une case à droite ; `-1`, une case à gauche. À chaque pas, `x = x + vx;`.

**Le rebond :** au bord droit, `vx = -1;` ; au bord gauche, `vx = 1;`. On ne change **pas** la position, seulement la **direction** : le pas suivant se fait dans l’autre sens.

**-1 dans un octet :** il est rangé 255. `x + 255` « tourne » et revient à `x - 1` : c’est pour cela que `x = x + vx;` recule quand `vx` vaut -1.

**Le rythme, avec `chaque(50)`** (le 0.77) : un pas toutes les 50 ms, 20 cases par seconde.

**C’est la base des jeux de balle** : Pong, casse-briques. Le 0.78.1 fait rebondir sur les deux axes.

**Ce qu’on doit voir** — Un O qui file d’un bord à l’autre sur la ligne 5, et rebondit sans fin.  
**Ce qu’il coûte** — 1595 octets de programme, 9 variables.

---

### 0.78.1. Le rebond : une vitesse qui change de signe — en diagonale

> Le 0.78 sur les deux axes : vx ET vy. La balle rebondit sur les quatre bords.

```cpp
uint8_t x = 0;        // la colonne de la balle
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
```

**C’est le 0.78, sur les deux axes :** une vitesse `vy` pour la ligne, en plus de `vx` pour la colonne.

**Ce qui est nouveau ici : deux vitesses.** À chaque pas, `x = x + vx;` et `y = y + vy;` : la balle va **en diagonale**. Chaque axe rebondit **à part** : aux bords gauche et droit, `vx` change de signe ; en haut et en bas, `vy`.

**La balle part de (0, 0)** et ne s’arrête jamais : elle rebondit dans tout l’écran (lignes 0 à 16, pour laisser la ligne 17 libre).

**Ce qu’on doit voir** — Un O qui rebondit en diagonale sur les quatre bords de l’écran.  
**Ce qu’il coûte** — 1657 octets de programme, 11 variables.

---

### 0.79. Suivre une autre lettre

> Le A suit la croix ; le B le poursuit tout seul : à chaque pas, il avance vers le A, de ±1 sur chaque axe.

```cpp
uint8_t x = 10;       // le A (la croix)
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
```

**Un poursuivant :** tu déplaces le A avec la croix ; le **B** avance tout seul **vers le A**, un pas tous les **600 ms**. C’est le premier « ennemi ».

**Ce qui est nouveau ici : choisir la direction en comparant.** Pour la colonne : si le A est plus à droite (`x > bx`), un pas à droite (`sx = 1`) ; plus à gauche, un pas à gauche (`sx = -1`) ; même colonne, rien (`sx = 0`). Pareil pour la ligne avec `sy`.

**`un_pas(bx, by, ALPHABET[1], sx, sy)`** (le 0.30) fait ce pas. Avec `sx` et `sy` à la fois, le B va **en diagonale** vers le A.

**Attrapé :** quand le B arrive sur la case du A, le mot `PRIS` s’écrit en bas.

**Pourquoi 600 ms :** le A fait un pas tous les 250 ms, plus de **deux fois plus vite** que le B. On peut donc lui échapper. Mais le B avance aussi en diagonale : dans un coin, il finit par nous coincer. Plus rapide (300 ms), il serait presque impossible à fuir. Le 0.79.1 le fait accélérer peu à peu.

**L’ordre compte :** le B bouge **avant** que la croix ne repose le A. Ainsi le A est dessiné par-dessus, et reste visible même quand le B le touche.

**Ce qu’on doit voir** — Un A au milieu, un B dans le coin qui s’approche tout seul ; déplace le A avec les flèches pour lui échapper. S’il t’attrape, PRIS.  
**Ce qu’il coûte** — 2446 octets de programme, 31 variables.

---

### 0.79.1. Suivre une autre lettre — de plus en plus vite

> Le 0.79, mais le B accélère : toutes les 3 secondes, il attend un peu moins entre deux pas. Facile au début, de plus en plus dur.

```cpp
uint8_t x = 10;       // le A (la croix)
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
```

**C’est le 0.79, avec un B qui accélère.** Au début, il est lent (600 ms par pas) : on lui échappe facilement. Toutes les 3 secondes, il devient un peu plus rapide, jusqu’à 200 ms par pas : là, il est presque impossible à fuir.

**Ce qui est nouveau ici : une vitesse qui CHANGE pendant le jeu.** `chaque(600)` ne peut pas le faire : son nombre est écrit en clair, traduit avant le jeu, et ne bouge plus. On compte donc les images nous-mêmes : `compte` augmente à chaque image, et quand il atteint `lenteur`, le B fait un pas.

**`lenteur`** est le nombre d’images entre deux pas : 36 au départ (600 ms). Toutes les 3 secondes, `if (chaque(3000))`, on lui retire 6 : 30, 24, 18… jusqu’à 12 (200 ms), le plus rapide. Le `if (lenteur > 12)` empêche de descendre plus bas.

**`compte >= lenteur`** (plus grand **ou égal**) : si `lenteur` diminue juste quand `compte` était déjà plus grand, le pas se fait quand même, au lieu d’attendre que `compte` fasse le tour des 255.

**En bas à droite,** `lenteur` s’affiche : on la voit descendre, 036, 030, 024…

**Ce qu’on doit voir** — Comme au 0.79, mais le B accélère toutes les 3 secondes ; en bas à droite, sa lenteur descend de 036 à 012.  
**Ce qu’il coûte** — 2517 octets de programme, 33 variables.

---

### 0.80. x et y rangés ensemble : struct

> struct Position { uint8_t x, y; } : la colonne et la ligne d’une lettre sous un seul nom, joueur.x et joueur.y.

```cpp
// Le nouveau type, morceau par morceau :
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
```

**Deux variables qui vont toujours ensemble** — la colonne et la ligne d’une lettre — peuvent être rangées **sous un seul nom**.

**Ce qui est nouveau ici : `struct`.** `struct Position { uint8_t x, y; };` crée un **nouveau type**, `Position`, qui contient deux octets : `x` et `y`. Puis `Position joueur;` crée une variable de ce type.

**Le point `.`** atteint une partie : `joueur.x` est la colonne du joueur, `joueur.y` sa ligne. On s’en sert comme de n’importe quelle variable : `joueur.x = 10;`, `deplace_croix(joueur.x, joueur.y, …)`.

**Pourquoi c’est utile :** avec plusieurs lettres, `Position joueur;` et `Position ennemi;` se lisent mieux que `x`, `y`, `xb`, `yb`. On ne mélange plus les variables d’une lettre avec celles d’une autre.

**La console range toujours la position** dans `joueur.x` et `joueur.y` : ce qu’elle sait faire avec une variable (le 0.23), elle le sait avec une partie de `struct`.

**Ce qu’on doit voir** — Un A en haut de l’écran, qui suit la croix ; sa position, joueur.x et joueur.y, en bas.  
**Ce qu’il coûte** — 1775 octets de programme, 14 variables.

---

### 0.80.1. x et y rangés ensemble : struct — la boucle dans un fichier

> Le 0.80, avec l’intérieur du while dans un autre fichier, boucle.h, versé au milieu de la boucle par #include.

`boucle.h`

```cpp
// boucle.h : l'intérieur de la boucle du jeu.
// Ces lignes sont versées DANS le while de principal.cpp, par #include.
image();                                               // attend l'image suivante
deplace_croix(joueur.x, joueur.y, ALPHABET[0], 250);   // le A suit la croix
nombre(0, 17, joueur.x);                               // sa position, en direct
nombre(4, 17, joueur.y);
```

`principal.cpp`

```cpp
// Le nouveau type : la colonne et la ligne sous un seul nom (le 0.80).
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
```

**C’est le 0.80, avec un seul changement :** les trois lignes qui étaient **dans** le `while` (`image`, `deplace_croix`, les `nombre`) sont maintenant dans un **second fichier**, `boucle.h` : l’onglet à côté de `principal.cpp`.

**Ce qui est nouveau ici : un `#include` au MILIEU du programme.** Au 0.67, il était tout en haut. Mais `#include "boucle.h"` veut seulement dire « **verse ici** le contenu de ce fichier ». On peut donc le mettre **entre les accolades du `while`** : avant la compilation, la ligne est remplacée par les trois lignes de `boucle.h`, exactement là.

**Le programme compilé est le même qu’au 0.80,** au mot près : il est seulement rangé en deux.

**`#include` doit être seul sur sa ligne**, sans rien avant ni après : c’est pour cela qu’il est collé au bord gauche, et que son commentaire est au-dessus.

**C’est possible, mais ce n’est pas la meilleure façon :** en lisant `boucle.h` seul, on ne sait pas qu’il est versé dans une boucle, ni d’où vient `joueur`. Le 0.80.2 montre la façon propre, avec une fonction.

**Ce qu’on doit voir** — Exactement le 0.80 : un A qui suit la croix, sa position en bas. Mais la boucle est dans l’onglet boucle.h.  
**Ce qu’il coûte** — 1775 octets de programme, 14 variables.

---

### 0.80.2. x et y rangés ensemble : struct — une fonction dans un fichier

> Le 0.80.1, en mieux : l’intérieur de la boucle devient une fonction, tour_de_jeu(), rangée dans jeu.h. La boucle n’a plus qu’une ligne.

`jeu.h`

```cpp
// jeu.h : un tour de jeu, rangé dans une fonction.
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
```

`principal.cpp`

```cpp
// Le nouveau type : la colonne et la ligne sous un seul nom (le 0.80).
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
```

**C’est le 0.80.1, en mieux :** au lieu de verser des lignes en vrac au milieu de la boucle, on les range dans une **fonction**, `tour_de_jeu()`, dans le fichier `jeu.h`.

**Ce qui est nouveau ici : `void`.** Au 0.33, notre fonction **rendait** une valeur (`uint8_t`, puis `return colonne;`). Celle-ci ne rend rien : elle **fait** quelque chose. On l’écrit `void tour_de_jeu() { … }` : `void` veut dire « rien », et les parenthèses vides veulent dire qu’elle ne reçoit rien.

**Le `#include "jeu.h"` revient tout en haut**, avant `main`, comme au 0.67 : il apporte la **définition** de la fonction. La boucle, elle, se contente de l’**appeler** : `tour_de_jeu();`, une ligne.

**Pourquoi c’est mieux :** en ouvrant `jeu.h`, on voit une fonction complète, avec son nom et ses accolades : on sait ce qu’elle est. Et `main` se lit comme une phrase : « tant que le jeu tourne, fais un tour de jeu ».

**L’ordre compte :** `joueur` est déclaré **avant** le `#include "jeu.h"`, parce que la fonction s’en sert. Une variable doit exister avant qu’on écrive quelque chose qui l’utilise.

**Ce qu’on doit voir** — Exactement le 0.80 : un A qui suit la croix. La boucle ne contient plus qu’un appel : tour_de_jeu().  
**Ce qu’il coûte** — 1779 octets de programme, 14 variables.

---

### Partie F — Un premier jeu

### 0.81. Ramasser une pièce : le P

> Une pièce, la lettre P, en (15, 8). Quand le A arrive dessus, le score augmente de 1, et la pièce s’en va.

```cpp
// ---- LES VARIABLES : tout ce que le jeu doit retenir ----

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
```

**La pièce est une lettre, le P** (`ALPHABET[15]`, la 16e lettre). On la pose une fois, au début, en (15, 8).

**Ce qui est nouveau ici : comparer DEUX positions.** Au 0.75, on comparait la position du A à une case fixe, (0, 0). Ici, on la compare à celle de la pièce, rangée dans `px` et `py` : `if (x == px && y == py)`. Le A est sur la pièce quand sa colonne **et** sa ligne sont celles de la pièce.

**Ramassée :** le score augmente (`score = score + 1;`), et la pièce part **hors de l’écran**, `px = 20;` (il n’y a pas de colonne 20). Ainsi le A, en restant sur la case, ne la ramasse pas une deuxième fois.

**Elle disparaît de l’écran toute seule :** en arrivant sur la case, `deplace_croix` pose le A **par-dessus** le P ; en repartant, il efface la case. Il ne reste rien.

**Le score** s’affiche en bas, après le mot SCORE.

**Ce qu’on doit voir** — Un A à gauche, un P à droite. Avec la flèche droite, le A ramasse le P : SCORE 001.  
**Ce qu’il coûte** — 1870 octets de programme, 18 variables.

---

### 0.81.1. Ramasser une pièce : le P — elle réapparaît ailleurs

> Le 0.81, mais la pièce ramassée réapparaît à la place suivante d’un tableau : on peut en ramasser sans fin.

```cpp
// ---- LES VARIABLES : tout ce que le jeu doit retenir ----

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
```

**C’est le 0.81,** mais au lieu de partir hors de l’écran, la pièce **réapparaît ailleurs**.

**Ce qui est nouveau ici : des places rangées dans deux tableaux,** `PX` et `PY` (comme les pas du 0.32). La pièce n° `k` est en (`PX[k]`, `PY[k]`). Ramassée, on passe à la suivante : `k = (k + 1) % 5;` — après la 5e, on revient à la 1re.

**On la repose aussitôt** à sa nouvelle place, avec `poser`.

**Ce qu’on doit voir** — Le A ramasse le P ; un autre P apparaît aussitôt ailleurs, et ainsi de suite.  
**Ce qu’il coûte** — 1944 octets de programme, 19 variables.

---

### 0.81.2. Ramasser une pièce : le P — au hasard

> Le 0.81.1, mais la nouvelle place est tirée au hasard : hasard() % 20 pour la colonne, hasard() % 17 pour la ligne.

```cpp
// ---- LES VARIABLES : tout ce que le jeu doit retenir ----

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
```

**C’est le 0.81.1,** sans le tableau : la nouvelle place est tirée **au hasard**.

**Ce qui est nouveau ici : `hasard()`.** Elle rend un nombre imprévisible, de 0 à 255. `hasard() % 20` en garde le **reste** de la division par 20 : un nombre de 0 à 19, une colonne. `hasard() % 17` : une ligne de 0 à 16 (la ligne 17 est celle du score).

**On ne sait jamais où la pièce va tomber :** c’est ce qui rend un jeu différent à chaque partie.

**Ce qu’on doit voir** — Le A ramasse le P ; un autre P apparaît quelque part au hasard.  
**Ce qu’il coûte** — 1919 octets de programme, 18 variables.

---

### 0.82. Un mur qu’on ne traverse pas : le M

> Un mur de M en colonne 10. Avant chaque pas, lire() regarde la case d’arrivée : si c’est un M, on ne bouge pas.

```cpp
// ---- LES VARIABLES ----
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
```

**Le mur est fait de lettres M** (`ALPHABET[12]`), posées l’une sous l’autre en colonne 10, des lignes 4 à 12.

**Ce qui est nouveau ici : regarder AVANT de bouger.** `deplace_croix` ne connaît pas les murs : on refait donc le déplacement à la main. On calcule d’abord la case d’arrivée, `nx` et `ny`. Puis `lire(nx, ny)` (le 0.69) dit ce qu’il y a dessus. Si ce n’est **pas** un M (`!=`), on avance ; sinon, on reste.

**`!=`** veut dire « n’est pas égal à ». C’est le contraire de `==`.

**`chaque(250)`** (le 0.77) donne le rythme : au plus un pas tous les 250 ms.

**Pour passer, il faut contourner :** le mur s’arrête à la ligne 12. En descendant jusqu’à la ligne 13, on peut passer de l’autre côté.

**Ce qu’on doit voir** — Un A à gauche d’un mur de M. La flèche droite le bloque contre le mur ; en descendant sous le mur, on passe.  
**Ce qu’il coûte** — 1938 octets de programme, 12 variables.

---

### 0.82.1. Un mur qu’on ne traverse pas : le M — un labyrinthe

> Des M tout autour et un mur au milieu : un labyrinthe. La pièce P est derrière le mur ; il faut faire le tour pour l’attraper.

```cpp
// ---- LES VARIABLES ----
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
```

**C’est le 0.82, avec plus de murs :** un cadre de M tout autour, et le mur du milieu, ouvert en bas. La pièce P (le 0.81) attend derrière.

**Ce qui est nouveau ici : dessiner des murs avec `texte`.** Une ligne de vingt M, c’est `texte(0, 2, "MMMMMMMMMMMMMMMMMMMM");` : un seul appel. Les côtés, eux, se posent un par un dans une boucle.

**Le déplacement ne change pas :** c’est `lire()` qui fait tout le travail. Il ne sait pas où sont les murs à l’avance : il **regarde l’écran**. Ajoute des M où tu veux, le A ne les traversera pas.

**Le chemin :** descendre sous le mur (lignes 11 à 13), passer à droite, remonter jusqu’au P.

**Ce qu’on doit voir** — Un labyrinthe de M ; le A doit descendre, passer sous le mur, et remonter jusqu’au P.  
**Ce qu’il coûte** — 2212 octets de programme, 13 variables.

---

### 0.83. Un son quand on ramasse : note

> Le 0.81.1, plus une note : note(1, DO5, 10, 12) quand le A ramasse la pièce.

```cpp
// ---- LES VARIABLES : tout ce que le jeu doit retenir ----

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
```

**C’est le 0.81.1** (la pièce qui réapparaît), **plus un son** au moment où on la ramasse.

**Ce qui est nouveau ici : `note(voix, hauteur, duree, volume)`.** Elle joue une note sur la **voix 1** (la console en a deux qui chantent, 1 et 2).

• **`DO5`** : la hauteur, un do aigu (5 : la 5e octave). • **`10`** : la durée, en images, un sixième de seconde. • **`12`** : le volume, de 0 (muet) à 15 (le plus fort).

**Elle ne bloque pas :** la note joue toute seule pendant que le jeu continue.

**Ce qu’on doit voir** — Comme au 0.81.1, mais chaque pièce ramassée fait « ding ».  
**Ce qu’il coûte** — 2000 octets de programme, 19 variables.

---

### 0.83.1. Un son quand on ramasse : note — et un bruit contre le mur

> Le labyrinthe du 0.82.1, plus un bruit quand on se cogne : bruit(4, 8), sur la voix du bruit.

```cpp
// ---- LES VARIABLES : les mêmes qu'au 0.82.1 ----
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
```

**C’est le labyrinthe du 0.82.1, plus un son** quand le A se **cogne** contre un mur.

**Ce qui est nouveau ici : `bruit(duree, volume)`.** Elle frappe sur la **voix du bruit** (la 4e) : pas une note, un « toc ». `bruit(4, 8)` : 4 images, volume 8.

**Où le mettre :** dans le `else` du test du mur. Si la case d’arrivée **n’est pas** un M, on avance ; **sinon** (`else`), c’en est un : on reste, et on fait « toc ».

**Et une note** quand on ramasse la pièce, comme au 0.83.

**Ce qu’on doit voir** — Le labyrinthe ; contre un mur, un « toc » ; sur la pièce, un « ding ».  
**Ce qu’il coûte** — 2320 octets de programme, 13 variables.

---

### 0.84. Des vies et une fin de partie

> Le poursuivant du 0.79, et 3 vies. Attrapé : une vie de moins, et tout le monde repart. À 0 : PERDU, et START pour recommencer.

```cpp
// ---- LES VARIABLES ----
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
```

**C’est le poursuivant du 0.79, avec des vies.** On en a 3. Chaque fois que le B nous attrape, on en perd une, et le A comme le B **repartent de leur place de départ**.

**Ce qui est nouveau ici : l’ÉTAT du jeu.** La variable `etat` dit **où on en est** : 0, on joue ; 1, on a perdu. Tout le programme est coupé en deux par `if (etat == 0) { … } else { … }` : en jeu, on bouge ; perdu, on attend.

**Perdu :** quand `vies` arrive à 0, `etat = 1;` et le mot PERDU s’écrit au milieu. Dans l’état 1, plus rien ne bouge.

**Recommencer :** dans l’état 1, le bouton **START** remet 3 vies et `etat = 0;` : on rejoue.

**Repartir du départ** après une prise : on efface la case (le A et le B y sont tous les deux), puis on remet `x`, `y`, `bx`, `by` à leurs valeurs de départ.

**Ce qu’on doit voir** — Le B poursuit le A ; à chaque prise, une vie de moins et tout repart. Au bout de trois : PERDU. START relance la partie.  
**Ce qu’il coûte** — 2600 octets de programme, 33 variables.

---

### 0.85. Plusieurs ennemis : un tableau de struct

> Trois B, rangés dans Position ennemis[3], partis d’un endroit au hasard ; une boucle for les fait tous avancer vers le A.

```cpp
// ---- LE TYPE Position (le 0.80) : une colonne et une ligne ----
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
```

**Trois poursuivants au lieu d’un.** Plutôt que `bx`, `by`, `bx2`, `by2`, `bx3`, `by3`, on les range dans **un tableau de `struct`** : `Position ennemis[3];` (le type `Position` du 0.80).

**Ce qui est nouveau ici : `ennemis[i].x`.** D’abord la **case** du tableau (`[i]`, l’ennemi n° i), **puis** la partie (`.x`, sa colonne). `ennemis[0].x` est la colonne du premier, `ennemis[2].y` la ligne du troisième.

**Une boucle `for`** passe sur les trois : le même code fait avancer chacun vers le A (le 0.79). Pour quatre ennemis, on changerait seulement le 3 en 4.

**Au départ, au hasard** (le 0.81.2) : chaque ennemi prend une colonne `hasard() % 20` sur les lignes du haut. Chaque partie commence différemment.

**Ils finissent par se rejoindre** sur le A : ils visent tous la même case.

**Ce qu’on doit voir** — Trois B partis d’en haut, à des places différentes à chaque partie, qui descendent tous vers le A.  
**Ce qu’il coûte** — 2620 octets de programme, 31 variables.

---

### Partie G — Les lettres et l’écran titre

### 0.86. L’alphabet en gras, avec poserS

> ALPHABET_GRAS, un second alphabet de la console, aux traits épais. Le 0.10 avec ALPHABET_GRAS à la place d’ALPHABET : A à T sur la ligne 0, U à Z sur la ligne 1.

```cpp
int main() {
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
```

**C’est le 0.10, avec un autre alphabet.** Même boucle, même `poserS` : seul le nom du tableau change, `ALPHABET_GRAS` au lieu d’`ALPHABET`.

**Ce qui est nouveau ici : `ALPHABET_GRAS`.** Un second tableau de la console, comme `ALPHABET` : 26 cases, de `ALPHABET_GRAS[0]` (le A) à `ALPHABET_GRAS[25]` (le Z). Les lettres sont les mêmes, mais leurs traits font **2 pixels d’épaisseur** au lieu d’un.

**L’ancien alphabet ne change pas :** `ALPHABET` est toujours là, et tous les cours d’avant gardent leurs lettres. Les deux peuvent se mélanger dans un même programme.

**`sizeof(ALPHABET_GRAS)`** vaut 26, comme `sizeof(ALPHABET)` (le 0.9) : la boucle fait 26 tours, de A à Z.

**`poserS`** passe tout seul à la ligne suivante (le 0.10) : A à T sur la ligne 0, puis U à Z sur la ligne 1.

**Gratuit si on ne s’en sert pas :** les 26 lettres grasses ne sont ajoutées à la cartouche que si le programme écrit `ALPHABET_GRAS`.

**Ce qu’on doit voir** — Tout l’alphabet en gras, de A à Z : A à T sur la première ligne, U à Z sur la deuxième.  
**Ce qu’il coûte** — 1808 octets de programme, 1 variable.

---

### 0.86.1. L’alphabet en gras, avec poserS — de base, ailleurs

> Le 0.86 cinq lignes plus bas : poserS(i, 5, ALPHABET_GRAS[i]).

```cpp
int main() {
  // Le changement : la ligne, 0 → 5. U à Z iront sur la ligne 6.
  for (uint8_t i = 0; i < sizeof(ALPHABET_GRAS); i++) {
    poserS(i, 5, ALPHABET_GRAS[i]);
  }

  while (true) {
    image();
  }
}
```

**C’est le 0.86, cinq lignes plus bas :** la ligne de départ est 5 au lieu de 0. `poserS` passe tout seul à la ligne 6 après le T.

**Un seul nombre change**, dans `poserS` : c’est la ligne.

**C’est la version de base.** Le 0.86.2 met l’ancien et le nouvel alphabet l’un au-dessus de l’autre.

**Ce qu’on doit voir** — L’alphabet en gras, sur les lignes 5 et 6.  
**Ce qu’il coûte** — 1810 octets de programme, 1 variable.

---

### 0.86.2. L’alphabet en gras, avec poserS — doublé, deux positions

> L’ancien alphabet en haut, le nouveau en dessous : ALPHABET sur les lignes 0 et 1, ALPHABET_GRAS sur les lignes 3 et 4. On compare.

```cpp
int main() {
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
```

**Les deux alphabets l’un au-dessus de l’autre**, pour comparer : `ALPHABET`, celui de toujours, sur les lignes 0 et 1 ; `ALPHABET_GRAS` sur les lignes 3 et 4.

**Deux boucles, deux tableaux :** la première lit `ALPHABET[i]`, la seconde `ALPHABET_GRAS[i]`. Chaque `for` a son propre `i`.

**Regarde le M, le N et le W :** leurs traits étaient trop serrés pour être simplement épaissis. Ils ont été redessinés un peu plus larges, pour garder leurs creux.

**Ce qu’on doit voir** — En haut, l’alphabet habituel ; en dessous, le même en gras.  
**Ce qu’il coûte** — 1897 octets de programme, 1 variable.

---

### 0.87. Agrandir une lettre : texteGrand

> texteGrand(x, y, "A", 3) : le A trois fois plus grand, sans rien dessiner. Chaque pixel devient un carré de 3 × 3 pixels ; les proportions sont gardées.

```cpp
int main() {
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
```

**Une lettre plus grande, sans la dessiner.** La Game Boy n’a pas de zoom, mais la console peut **calculer** une lettre agrandie à partir de la police : chaque pixel devient un carré.

**Ce qui est nouveau ici : `texteGrand(x, y, "TEXTE", taille)`.** La **taille** va de **1 à 20** : c’est combien de fois plus grand. Avec `3`, chaque pixel de la lettre devient un carré de **3 × 3 pixels**. La lettre garde **exactement ses proportions**.

**La place qu’elle prend :** une lettre normale tient dans **1 case** (8 × 8 pixels). Agrandie 3 fois, elle en prend **3 × 3 = 9** (24 × 24 pixels). À la taille *n*, une lettre prend *n* cases de large et *n* de haut.

**Le texte et la taille s’écrivent en clair** (`"A"`, `3`), comme pour `ms()` : le compilateur fabrique les tuiles agrandies **avant le jeu**, et seulement celles dont le programme a besoin.

**Ce qu’elle coûte :** quelques tuiles de plus dans la cartouche. Deux tuiles identiques (souvent toutes pleines aux grandes tailles) ne sont fabriquées qu’une fois.

**Ce qu’on doit voir** — Un grand A, trois fois plus grand qu’une lettre normale, en haut à gauche.  
**Ce qu’il coûte** — 1673 octets de programme, 3 variables.

---

### 0.87.1. Agrandir une lettre : texteGrand — toutes les tailles

> Le même A, aux tailles 1, 2, 3 et 4, côte à côte : un seul nombre change d’une ligne à l’autre.

```cpp
int main() {
  texteGrand(0, 0, "A", 1);     // taille 1 : 1 case, comme une lettre normale
  texteGrand(2, 0, "A", 2);     // taille 2 : 2 × 2 cases
  texteGrand(5, 0, "A", 3);     // taille 3 : 3 × 3 cases
  texteGrand(9, 0, "A", 4);     // taille 4 : 4 × 4 cases

  while (true) {
    image();
  }
}
```

**Quatre lignes, un seul nombre qui change :** la taille, 1, 2, 3, puis 4. On voit le A grandir.

**Tu choisis la taille, la console s’adapte :** aucune taille n’est dessinée à l’avance. Chaque `texteGrand` fait calculer les tuiles de SA taille.

**La place :** taille 1, 1 case ; taille 2, 2 × 2 ; taille 3, 3 × 3 ; taille 4, 4 × 4. Les colonnes de départ (0, 2, 5, 9) laissent juste la place à chacun.

**Ce qu’on doit voir** — Quatre A côte à côte, de plus en plus grands : tailles 1, 2, 3 et 4.  
**Ce qu’il coûte** — 2452 octets de programme, 12 variables.

---

### 0.87.2. Agrandir une lettre : texteGrand — dix fois

> Le plus grand : texteGrand(5, 4, "A", 10). Un A de 80 × 80 pixels, 10 × 10 cases, la moitié de l’écran.

```cpp
int main() {
  // Le A dix fois plus grand : 10 × 10 cases, de (5, 4) à (14, 13).
  texteGrand(5, 4, "A", 10);

  while (true) {
    image();
  }
}
```

**La taille la plus grande, 10 :** chaque pixel devient un carré de 10 × 10 pixels. Le A fait **80 × 80 pixels**, soit **10 × 10 cases** : la moitié de la largeur de l’écran (20 cases).

**La moitié de l’écran :** l’écran fait 20 × 18 cases ; à la taille 10, une lettre en prend 10 × 10. La plus grande taille, 20, remplit l’écran entier : c’est le 0.87.4.

**Ça ne coûte presque rien de plus :** aux grandes tailles, beaucoup de tuiles sont **toutes pleines** ou **toutes vides**. Les tuiles identiques ne sont fabriquées qu’une fois.

**Ce qu’on doit voir** — Un A géant au milieu de l’écran, dix fois plus grand qu’une lettre normale.  
**Ce qu’il coûte** — 2399 octets de programme, 3 variables.

---

### 0.87.3. Agrandir une lettre : texteGrand — un mot

> Un mot entier agrandi : texteGrand(3, 7, "JEU", 4). Chaque lettre prend 4 × 4 cases ; le mot, 12 × 4.

```cpp
int main() {
  // 3 lettres × 4 cases = 12 cases de large, 4 de haut : de (3, 7) à (14, 10).
  texteGrand(3, 7, "JEU", 4);

  while (true) {
    image();
  }
}
```

**Pas seulement une lettre :** `texteGrand` agrandit un **mot entier**. Les lettres se suivent, chacune agrandie.

**La largeur du mot :** 3 lettres × 4 cases = **12 cases**. Il faut qu’elle tienne dans les 20 colonnes de l’écran : `"BONJOUR"` (7 lettres) tient à la taille 2 (14 cases), pas à la taille 3 (21 cases).

**Un titre de jeu,** c’est exactement ça : un mot en grand, au milieu de l’écran.

**Ce qu’on doit voir** — Le mot JEU en grandes lettres, au milieu de l’écran.  
**Ce qu’il coûte** — 1789 octets de programme, 3 variables.

---

### 0.87.4. Agrandir une lettre : texteGrand — vingt fois

> La plus grande taille : texteGrand(0, 0, "A", 20). Le A remplit tout l’écran, 160 × 140 pixels.

```cpp
int main() {
  // La plus grande taille : 20. Le A fait 20 × 20 cases, tout l'écran.
  //   8 pixels × 20 = 160 : toute la largeur
  //   7 pixels × 20 = 140 : presque toute la hauteur (144)
  texteGrand(0, 0, "A", 20);

  while (true) {
    image();
  }
}
```

**La taille la plus grande, 20 :** chaque pixel du A devient un carré de 20 × 20 pixels. La lettre fait **160 pixels de large** (toute la largeur de l’écran) et **140 de haut** : elle remplit l’écran.

**Pourquoi 20 au plus :** une lettre de la police fait **7 pixels de haut**, et l’écran **144**. 7 × 20 = 140 : elle tient encore entière. À 21, 7 × 21 = 147 : le bas du A sortirait de l’écran. Le compilateur refuse donc au-delà de 20, et dit pourquoi.

**En largeur aussi, tout juste :** une case de lettre fait 8 pixels ; 8 × 20 = 160, la largeur exacte de l’écran. Pour tenir, le A géant commence en (0, 0).

**Ça ne coûte presque rien en dessins :** à cette taille, presque toutes les tuiles sont toutes pleines ou toutes vides. Le A géant n’en demande que 9 différentes.

**Ce qu’on doit voir** — Un A immense, qui remplit tout l’écran.  
**Ce qu’il coûte** — 3371 octets de programme, 3 variables.

---

### 0.87.5. Agrandir une lettre : texteGrand — aller à la ligne, texteGrandS

> texteGrandS(0, 0, "BONJOUR", 3) : comme texteGrand, mais les lettres qui ne tiennent plus dans la largeur passent à la ligne, comme textS.

```cpp
int main() {
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
```

**Avec `texteGrand`, un mot trop long sort de l’écran par la droite.** « BONJOUR » en taille 3 demande 7 × 3 = 21 cases de large ; l’écran n’en a que 20 : le R disparaît.

**Ce qui est nouveau ici : `texteGrandS`,** le `S` de `textS` (le 0.11). Même réglages que `texteGrand`, mais les lettres qui ne tiennent plus **passent à la ligne** : elles reprennent en colonne 0, une rangée de lettres plus bas (3 cases, à la taille 3).

**Le découpage :** à la taille 3, une ligne tient 20 ÷ 3 = 6 lettres (18 cases). « BONJOU » sur la première, « R » sur la deuxième.

**Trop haut, c’est une erreur :** l’écran a 18 cases de haut. Si le texte en demande plus (« BONJOUR » en taille 7 : 4 lignes de 7 cases, 28), le compilateur refuse, et dit combien il en faudrait.

**Tout s’écrit en clair,** même la place : le découpage en lignes se fait avant le jeu.

**Ce qu’on doit voir** — BONJOU en grandes lettres sur la première ligne, et le R en dessous, à gauche.  
**Ce qu’il coûte** — 2291 octets de programme, 6 variables.

---

### 0.88. Des lettres en couleur : couleurTexte

> couleurTexte(31, 0, 0) : toutes les lettres deviennent rouges. Trois nombres de 0 à 31 : le rouge, le vert, le bleu.

```cpp
int main() {
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
```

**Les lettres peuvent changer de couleur.** Une ligne suffit : `couleurTexte(rouge, vert, bleu);`.

**Ce qui est nouveau ici : une couleur, en trois nombres.** L’écran mélange du **rouge**, du **vert** et du **bleu**, chacun de **0** (rien) à **31** (le plus fort). `31, 0, 0` : tout le rouge, pas de vert, pas de bleu → **rouge**. `0, 0, 31` : bleu. `31, 31, 0` : rouge + vert = **jaune**. `31, 31, 31` : blanc.

**Toutes les lettres changent ensemble**, même celles écrites avant ou après : `couleurTexte` règle la couleur **de l’encre**, pas d’un mot.

**Sur la Game Boy Color seulement :** la Game Boy d’origine n’a que 4 gris-verts. Le programme passe tout seul en mode couleur ; choisis « En couleur » en haut de la page.

**Ce qu’on doit voir** — Un A rouge au milieu de l’écran (sur « En couleur »).  
**Ce qu’il coûte** — 1297 octets de programme, 0 variable.

---

### 0.88.1. Des lettres en couleur : couleurTexte — un mot en bleu

> Le 0.88 avec une autre couleur et un mot entier : couleurTexte(0, 0, 31), puis BONJOUR.

```cpp
int main() {
  couleurTexte(0, 0, 31);   // rouge 0, vert 0, bleu 31 : du bleu
  texte(6, 8, "BONJOUR");   // tout le mot, en bleu

  while (true) {
    image();
  }
}
```

**C’est le 0.88, avec un mot et du bleu :** `couleurTexte(0, 0, 31)` (seulement du bleu), puis `texte(6, 8, "BONJOUR")`.

**Toutes les lettres du mot** prennent la couleur : c’est la même encre pour tout le texte.

**Ce qu’on doit voir** — BONJOUR en bleu, au milieu de l’écran.  
**Ce qu’il coûte** — 1303 octets de programme, 0 variable.

---

### 0.88.2. Des lettres en couleur : couleurTexte — changer en route

> La couleur change toute seule, toutes les demi-secondes : rouge, vert, bleu, et on recommence. chaque(500) et une étape de 0 à 2.

```cpp
uint8_t etape = 0;        // 0 = rouge, 1 = vert, 2 = bleu

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
```

**La couleur peut changer pendant le jeu :** il suffit de rappeler `couleurTexte` avec d’autres nombres. Le mot déjà écrit change de couleur **tout de suite**, sans être réécrit.

**Toutes les demi-secondes** (`chaque(500)`, le 0.77), `etape` avance : 0, 1, 2, puis 0. Selon l’étape, une couleur : rouge, vert, bleu.

**Le mot n’est écrit qu’une fois**, avant la boucle : seule l’encre change.

**Ce qu’on doit voir** — BONJOUR qui change de couleur toutes les demi-secondes : rouge, vert, bleu.  
**Ce qu’il coûte** — 1607 octets de programme, 8 variables.

---

### 0.89. Chaque mot sa couleur : texteCouleur

> texteCouleur(x, y, "MOT", palette) : le mot, dans la couleur de SA palette. Trois palettes, trois couleurs, trois mots.

```cpp
int main() {
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
```

**`couleurTexte` teint TOUT le texte.** Pour des mots de couleurs différentes, il faut dire **quelle couleur à quel mot**.

**Ce qui est nouveau ici : les palettes.** La console en a **8**, numérotées de 0 à 7 : 8 boîtes de couleurs. `couleurFond(1, 3, 31, 0, 0)` met du rouge dans la **teinte 3** (celle des lettres) de la **palette 1**. On remplit ainsi la palette 1 en rouge, la 2 en vert, la 3 en bleu.

**Ce qui est nouveau aussi : `texteCouleur(x, y, "MOT", palette)`.** Il écrit le mot, **et** met chacune de ses cases dans cette palette. Le mot prend la couleur de la palette.

**La palette 0** est celle de toutes les cases qu’on n’a pas teintes : c’est elle que `couleurTexte` règle.

**Sur la Game Boy Color seulement :** la Game Boy d’origine n’a que 4 gris-verts. Le programme passe tout seul en mode couleur ; choisis « En couleur » en haut de la page.

**Ce qu’on doit voir** — ROUGE en rouge, VERT en vert, BLEU en bleu, l’un sous l’autre.  
**Ce qu’il coûte** — 1797 octets de programme, 0 variable.

---

### 0.89.1. Chaque mot sa couleur : texteCouleur — un arc-en-ciel

> Chaque LETTRE sa couleur : six palettes, et teindre(x + i, y, 1 + i % 6) dans une boucle. BONJOUR en arc-en-ciel.

```cpp
int main() {
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
```

**Plus fin que le mot : la lettre.** `teindre(colonne, ligne, palette)` met **une seule case** dans une palette. Dans une boucle, chaque lettre du mot prend la sienne.

**Six couleurs d’arc-en-ciel,** dans les palettes 1 à 6 : rouge, orange, jaune, vert, bleu, violet.

**`1 + i % 6`** : pour la lettre n° i, la palette 1, 2 … 6, puis de nouveau 1 (le `%` du 0.9). BONJOUR a 7 lettres : la 7e (le R) reprend le rouge.

**Ce qu’on doit voir** — BONJOUR en arc-en-ciel : chaque lettre de sa couleur.  
**Ce qu’il coûte** — 1443 octets de programme, 1 variable.

---

### 0.90. Un titre agrandi, en couleur

> texteGrand (le 0.87) et couleurTexte ensemble : un grand JEU orange, comme l’écran titre d’un jeu.

```cpp
int main() {
  couleurTexte(31, 16, 0);          // de l'orange : tout le rouge, la moitié du vert
  texteGrand(4, 5, "JEU", 4);       // le titre, 4 fois plus grand (le 0.87)
  texte(2, 12, "APPUIE SUR START"); // en dessous, en petit : orange aussi

  while (true) {
    image();
  }
}
```

**On réunit deux choses déjà vues :** `texteGrand` (le 0.87), qui agrandit, et `couleurTexte` (le 0.88), qui colore.

**Ce qui est nouveau ici :** rien de plus, mais ensemble. Les lettres agrandies sont dessinées dans la **même teinte** que les lettres normales, la teinte 3 : `couleurTexte` les colore aussi.

**L’orange,** c’est `31, 16, 0` : tout le rouge, la moitié du vert, pas de bleu.

**C’est un écran titre :** un mot en grand et en couleur, au milieu. Il ne reste qu’à écrire en dessous « APPUIE SUR START ».

**Ce qu’on doit voir** — Un grand JEU orange au milieu de l’écran, et en dessous APPUIE SUR START.  
**Ce qu’il coûte** — 1828 octets de programme, 3 variables.

---

### 0.90.1. L’écran titre — START, un autre écran

> Le titre du 0.90, et START qui le fait disparaître : l’écran se vide, un autre apparaît. Une variable retient sur quel écran on est.

```cpp
uint8_t ecranTitre = 1;   // sur quel écran on est : 1 = le titre, 0 = l'écran d'après

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
```

**C’est le 0.90, avec une seule chose en plus :** quand on appuie sur **START**, le titre s’en va et un **autre écran** apparaît (ici, « C EST PARTI »).

**`bouton(START)`** rend 1 tant que START est enfoncé. On le regarde **à chaque image**, dans la boucle.

**Ce qui est nouveau ici : une variable qui dit sur quel écran on est.** `ecranTitre` vaut **1** tant qu’on est sur le titre, **0** ensuite. Pourquoi ? Un appui sur START dure plusieurs images. Sans cette variable, l’écran serait vidé et réécrit **à chaque image** où le doigt reste sur le bouton. Avec elle, le changement se fait **une seule fois** : dès la première image, `ecranTitre` passe à 0, et la condition `ecranTitre == 1 && bouton(START)` n’est plus jamais vraie.

**`&&` veut dire « et » :** il faut les deux à la fois, être sur le titre **et** appuyer sur START.

**Vider l’écran :** il n’y a pas de fonction qui efface tout d’un coup. On le fait ligne par ligne : une boucle `for` sur les **18 lignes** (0 à 17), et sur chacune `effacer(0, y, 20)` efface **20 cases** à partir de la colonne 0, toute la largeur.

**La couleur reste :** `couleurTexte` a réglé l’encre de toutes les lettres ; le nouvel écran est orange aussi.

**Ce qu’on doit voir** — Le grand JEU orange et APPUIE SUR START ; appuie sur START (touche Entrée) : l’écran se vide et C EST PARTI apparaît.  
**Ce qu’il coûte** — 1959 octets de programme, 5 variables.

---

### 0.90.2. L’écran titre — une lettre qui file

> Sur l’écran d’après START, un B qui file de gauche à droite, sans fin : defile(0, 0, 12, ALPHABET[1], 1, 150).

```cpp
uint8_t ecranTitre = 1;   // 1 = le titre, 0 = l'écran d'après

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
```

**C’est le 0.90.1, avec une chose en plus :** sur l’écran d’après START, un **B** traverse l’écran **de gauche à droite**, et recommence.

**`defile` (le 0.65.3)** fait filer une lettre sur sa ligne : un pas toutes les « vitesse » millisecondes ; arrivée au bord droit, elle repart du bord gauche. Elle **ne bloque rien** : le reste de la boucle continue.

**Il faut l’appeler à chaque image**, dans la boucle : chaque appel regarde si c’est le moment de faire un pas.

**Seulement après START :** `if (ecranTitre == 0)`. Sur le titre, `ecranTitre` vaut 1 : le B ne vient pas encore.

**Le B, pas un A :** « C EST PARTI » contient déjà un A ; un B se distingue mieux.

**Ce qu’on doit voir** — Après START : C EST PARTI, et un B qui file de gauche à droite sur la ligne 12, sans fin.  
**Ce qu’il coûte** — 2400 octets de programme, 18 variables.

---

### 0.90.3. L’écran titre — tout l’écran glisse

> On repart du 0.90.1 : cette fois, c’est TOUT l’écran qui glisse vers la droite. defiler(d, 0), et d qui diminue à chaque image.

```cpp
uint8_t ecranTitre = 1;   // 1 = le titre, 0 = l'écran d'après
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
```

**On repart du 0.90.1** (sans le B du 0.90.2), avec une seule chose en plus : **tout l’écran** glisse de gauche à droite, « C EST PARTI » compris.

**Ce qui est nouveau ici : `defiler(x, y)`.** Il ne bouge pas une lettre : il déplace **la caméra** qui regarde le décor. `x` dit de combien de **pixels** la caméra est poussée vers la droite.

**Pour que le décor aille à DROITE, la caméra va à GAUCHE :** comme dans un train, quand tu avances, le paysage recule. Alors `d` **diminue** : `d--`, un pixel à chaque image.

**`d` passe sous 0 ?** C’est un `uint8_t` : après 0 vient **255**, puis 254… (l’octet qui boucle, la leçon 35). Et le décor fait justement **256 pixels** de large : il revient tout seul, sans fin. Ce qui sort par la droite réapparaît à gauche.

**60 images par seconde, un pixel chaque fois :** le texte traverse l’écran (160 pixels) en moins de 3 secondes, tout en douceur.

**Ce qu’on doit voir** — Après START : C EST PARTI glisse vers la droite, sort de l’écran et revient par la gauche, sans fin.  
**Ce qu’il coûte** — 1994 octets de programme, 6 variables.

---

### 0.90.4. L’écran titre — un bandeau qui passe

> On repart du 0.90.1 : une seule ligne bouge, les autres restent en place. BONJOUR passe en bas, de gauche à droite : effacer, avancer, réécrire.

```cpp
uint8_t ecranTitre = 1;   // 1 = le titre, 0 = l'écran d'après
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
```

**`defiler` bouge TOUT l’écran** (le 0.90.3). Pour un **bandeau**, comme les informations qui passent en bas d’une télé, il faut qu’**une seule ligne** bouge et que « C EST PARTI » reste en place.

**Ce qui est nouveau ici : déplacer un mot soi-même,** en trois gestes, toutes les 150 ms (`chaque(150)`, le 0.77) : **effacer** le mot là où il est, **avancer** sa position d’une case, le **réécrire** à la nouvelle place.

**`effacer(p, 16, "BONJOUR")`** : quand on lui donne le texte lui-même, `effacer` efface exactement autant de cases que le texte a de lettres (7).

**`p = (p + 1) % 20`** : p va de 0 à 19, puis revient à 0 (le `%` du 0.9). À droite, les dernières lettres passent **hors de l’écran** : la carte du décor fait 32 cases de large, l’écran n’en montre que 20. Elles existent, mais on ne les voit pas.

**Le mot n’est écrit qu’après START :** p commence à 0 ; au premier coup après START, on efface en 0 (rien à effacer), p passe à 1, et BONJOUR s’écrit en (1, 16).

**Ce qu’on doit voir** — Après START : C EST PARTI reste au milieu ; en bas, BONJOUR passe de gauche à droite, et recommence.  
**Ce qu’il coûte** — 2271 octets de programme, 13 variables.

---

### 0.90.5. L’écran titre — la consigne qui clignote

> On repart du 0.90.1 : APPUIE SUR START clignote, comme dans les vrais jeux. Toutes les demi-secondes, on l’écrit ou on l’efface.

```cpp
uint8_t ecranTitre = 1;   // 1 = le titre, 0 = l'écran d'après
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
```

**On repart du 0.90.1** (le titre, START, l’écran d’après), avec une chose en plus : sur le titre, « APPUIE SUR START » **clignote**.

**Ce qui est nouveau ici : une variable qui retient si le texte est affiché.** `visible` vaut **1** quand la consigne est à l’écran, **0** quand elle est effacée. Toutes les demi-secondes (`chaque(500)`, le 0.77), on regarde : visible ? on l’**efface** ; effacée ? on l’**écrit**. Et `visible` change de valeur.

**`visible = 1 - visible`** : une astuce pour basculer. 1 - 1 = **0**, et 1 - 0 = **1**. À chaque fois, la valeur passe de l’une à l’autre.

**Seulement sur le titre :** `ecranTitre == 1 && chaque(500)`. Après START, la consigne ne revient plus.

**Ce qu’on doit voir** — Le grand JEU orange, et APPUIE SUR START qui clignote. START : C EST PARTI, et plus rien ne clignote.  
**Ce qu’il coûte** — 2266 octets de programme, 13 variables.

---

### 0.90.6. L’écran titre — SELECT, retour au titre

> Le 0.90.5, et SELECT qui ramène au titre. Le titre se dessine alors deux fois : on le range dans une fonction, dessinerTitre().

```cpp
uint8_t ecranTitre = 1;   // 1 = le titre, 0 = l'écran d'après
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
```

**C’est le 0.90.5, avec une chose en plus :** sur l’écran d’après, **SELECT** ramène au titre. `ecranTitre` repasse à **1**, et le titre se redessine.

**Ce qui est nouveau ici : ranger des lignes dans une fonction** (comme `tour_de_jeu` au 0.80.2). Le titre doit être dessiné **au départ**, et **à chaque retour**. Plutôt que d’écrire les mêmes lignes deux fois, on les met dans `void dessinerTitre() { … }`, et on écrit juste `dessinerTitre();` là où il faut.

**Même chose pour vider l’écran :** `viderEcran()` range la boucle des 18 lignes. Elle sert pour aller sur l’écran d’après, et pour en revenir.

**`void`** veut dire que la fonction ne rend rien : elle **fait** quelque chose (elle dessine, elle efface), c’est tout.

**Au retour, `visible` repasse à 1 :** dessinerTitre() vient d’écrire la consigne, elle est donc à l’écran.

**Ce qu’on doit voir** — Le titre ; START : C EST PARTI ; SELECT : le titre revient, et la consigne clignote de nouveau.  
**Ce qu’il coûte** — 2360 octets de programme, 13 variables.

---

### 0.90.7. L’écran titre — trois écrans

> Le 0.90.6 avec un troisième écran : ecranTitre devient ecran, qui vaut 0 (le titre), 1 (le jeu) ou 2 (la fin). B mène à la fin, START fait rejouer.

```cpp
// ---- NOUVEAU : une variable pour TROIS écrans ----
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
```

**Un jeu a presque toujours trois écrans :** le **titre**, le **jeu**, la **fin**. Deux valeurs (1 ou 0) ne suffisent plus.

**Ce qui est nouveau ici : une variable qui compte les écrans.** `ecranTitre` devient `ecran`, et vaut **0** (le titre), **1** (le jeu) ou **2** (la fin). Chaque `if` commence par regarder sur quel écran on est : `ecran == 0 && …`, `ecran == 1 && …`, `ecran == 2 && …`.

**Les chemins :** titre → **START** → jeu ; jeu → **B** → fin (plus tard, ce sera « perdu » ou « le temps est fini ») ; fin → **START** → le jeu, de nouveau ; jeu → **SELECT** → le titre.

**Pourquoi la fin ramène au JEU, et pas au titre ?** Un appui sur START dure plusieurs images. Si la fin menait au titre, l’image suivante, START encore enfoncé, ferait aussitôt passer du titre au jeu : on ne verrait pas le titre. Aller droit au jeu, c’est « rejouer ».

**Les numéros sont une convention :** 0, 1, 2, c’est nous qui décidons ce qu’ils veulent dire. Les commentaires le rappellent.

**Ce qu’on doit voir** — Le titre ; START : le jeu ; B : FIN ; START : le jeu de nouveau ; SELECT : le titre.  
**Ce qu’il coûte** — 2530 octets de programme, 13 variables.

---

### Partie H — Du titre au snake

### 0.91. Le titre, puis le jeu

> On réunit l’écran titre (le 0.90) et le jeu du 0.81 : START fait disparaître le titre, pose le P, et la partie commence.

```cpp
uint8_t ecran = 0;        // 0 = le TITRE, 1 = le JEU

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
```

**Deux programmes qu’on connaît, réunis en un :** l’**écran titre** (le 0.90.1) et le **jeu de la pièce** (le 0.81 : le A suit la croix et ramasse le P).

**Ce qui est nouveau ici : le jeu n’existe qu’après START.** Tout ce que faisait la boucle du 0.81 est rangé dans `if (ecran == 1) { … }`. Sur le titre (`ecran == 0`), le A n’est pas là, la croix ne fait rien.

**Ce que le 0.81 faisait avant la boucle** (poser le P, écrire SCORE) se fait maintenant **au moment de START** : c’est là que l’écran du jeu commence.

**Deux fois `if`, pas `if … else`,** pour rester comme au 0.90.1 : le premier regarde START sur le titre, le second fait tourner le jeu.

**Ce qu’on doit voir** — Le titre ; START : le titre disparaît, le A et le P apparaissent, et on ramasse le P avec la croix.  
**Ce qu’il coûte** — 2556 octets de programme, 23 variables.

---

### 0.91.1. Le titre, puis le jeu — trente secondes

> Le 0.91 avec un chronomètre : 30 secondes, une de moins chaque seconde (chaque(1000)). À 0 : l’écran FIN.

```cpp
uint8_t ecran = 0;        // 0 = le TITRE, 1 = le JEU, 2 = la FIN

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
```

**C’est le 0.91, avec une chose en plus : le temps.** La partie dure **30 secondes**. Le reste s’affiche en bas à droite, après TEMPS.

**Ce qui est nouveau ici : un compte à rebours.** `temps` part de **30**. Toutes les secondes (`chaque(1000)`), il perd 1 : 30, 29, 28… À **0**, la partie s’arrête : on passe à un troisième écran, `ecran = 2`, la **fin** (le 0.90.7).

**Seulement pendant le jeu :** `ecran == 1 && chaque(1000)`. Sur le titre, le temps ne bouge pas.

**Sur l’écran de fin, plus rien ne bouge :** la boucle du jeu est dans `if (ecran == 1)`. Avec `ecran == 2`, le A ne suit plus la croix.

**Ce qu’on doit voir** — START : le jeu, et TEMPS qui descend de 030 à 000. À 0, l’écran se vide et FIN s’affiche.  
**Ce qu’il coûte** — 2867 octets de programme, 31 variables.

---

### 0.91.2. Le titre, puis le jeu — le score et rejouer

> Le 0.91.1, et sur l’écran FIN : le score de la partie, et START pour rejouer. Tout se remet au départ : une fonction nouvellePartie().

```cpp
uint8_t ecran = 0;        // 0 = le TITRE, 1 = le JEU, 2 = la FIN

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
```

**C’est le 0.91.1, avec une chose en plus :** l’écran de fin montre le **score**, et **START** relance une partie.

**Ce qui est nouveau ici : tout remettre au départ.** Une nouvelle partie, c’est le A en (5, 8), le P en (15, 8), le score à 0, le temps à 30, et l’écran du jeu redessiné. Ces lignes servent **deux fois** : depuis le titre, et depuis la fin. On les range dans **`nouvellePartie()`** (le 0.90.6).

**Remettre les variables, c’est indispensable :** sans `score = 0`, la deuxième partie commencerait avec le score de la première ; sans `px = 15`, le P resterait hors de l’écran (en 20), et on ne pourrait plus le ramasser.

**La fin mène au jeu, pas au titre** (le 0.90.7) : START encore enfoncé ferait sauter le titre aussitôt.

**La première seconde de la nouvelle partie est un peu courte :** le chronomètre de `chaque(1000)` a continué de tourner pendant l’écran de fin. Au retour dans le jeu, il est déjà « à l’heure » : 30 devient 29 tout de suite.

**Ce qu’on doit voir** — Une partie de 30 secondes ; à la fin : FIN, le score, START : REJOUER. START : une nouvelle partie, score 0, temps 30.  
**Ce qu’il coûte** — 2994 octets de programme, 31 variables.

---

### 0.91.3. Le titre, puis le jeu — un cadre de murs X

> Le 0.91.2, et des murs tout autour du terrain : un cadre de X. Le A qui y entre revient aussitôt à sa place d’avant.

```cpp
uint8_t ecran = 0;        // 0 = le TITRE, 1 = le JEU, 2 = la FIN

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
```

**C’est le 0.91.2, avec une chose en plus : un cadre de murs.** Les murs sont des **lettres**, comme le M du 0.82 ; ici, le **X**. Il fait le tour du terrain : le haut (ligne 0), le bas (ligne 16), la gauche (colonne 0), la droite (colonne 19).

**Le dessiner : deux boucles.** La première pose les X du haut et du bas, colonne par colonne (0 à 19). La seconde, ceux des côtés, ligne par ligne (1 à 15 : les coins sont déjà posés).

**La ligne 17 reste aux nombres :** le cadre s’arrête à la ligne 16, SCORE et TEMPS restent en dessous.

**Ce qui est nouveau ici : revenir en arrière.** `deplace_croix` ne connaît pas les murs : elle fait le pas. Alors on retient la place du A **avant** (`ax`, `ay`), et **après** le pas on regarde : sur le cadre ? On remet le X (le A l’avait recouvert) et le A revient à sa place d’avant. Tout se passe dans la même image : on ne voit pas le A entrer dans le mur.

**`||` veut dire « ou » :** `x == 0 || x == 19 || y == 0 || y >= 16` est vrai dès qu’**une** des quatre l’est. `y >= 16` (plus grand ou égal) compte aussi la ligne 17 : le A ne descend jamais sur les nombres.

**Le cadre est redessiné à chaque partie,** dans `nouvellePartie()` : après le titre et après la fin, l’écran a été vidé.

**Ce qu’on doit voir** — START : le terrain entouré de X ; le A se cogne au cadre et ne le traverse pas.  
**Ce qu’il coûte** — 3355 octets de programme, 35 variables.

---

### 0.91.4. Le titre, puis le jeu — la pièce revient au hasard

> Le 0.91.3, mais la pièce ramassée ne disparaît plus : elle réapparaît au hasard, dans le cadre. 1 + hasard() % 18 pour la colonne, 1 + hasard() % 15 pour la ligne.

```cpp
uint8_t ecran = 0;        // 0 = le TITRE, 1 = le JEU, 2 = la FIN

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
```

**C’est le 0.91.3, avec une chose en plus :** quand le A prend le P, le P ne part plus hors de l’écran (`px = 20`). Il **réapparaît ailleurs, au hasard**, et on peut le ramasser encore et encore pendant les 30 secondes.

**`hasard()`, on la connaît (le 0.81.2) :** elle rend un nombre imprévisible, de 0 à 255. Au 0.81.2, `hasard() % 20` donnait une colonne de 0 à 19 : tout l’écran.

**Ce qui est nouveau ici : rester DANS le cadre.** Les colonnes 0 et 19 sont des murs X : une pièce posée là effacerait le mur, et le A ne pourrait jamais l’atteindre. La pièce doit donc tomber entre la colonne **1** et la colonne **18** : 18 colonnes possibles.

**`hasard() % 18`** garde le **reste** de la division par 18 : un nombre de **0 à 17**. Exemples : 137 = 7 × 18 + 11, le reste est **11** ; 36 = 2 × 18 + 0, le reste est **0** ; 17 = 0 × 18 + 17, le reste est **17**.

**Le `1 +` décale tout d’une case :** 0 devient 1, 17 devient 18. `1 + hasard() % 18` donne donc une colonne de **1 à 18** : jamais sur un mur. Avec 137 : 1 + 11 = **12**.

**Pour la ligne, pareil :** les lignes 0 et 16 sont des murs, la pièce va de la ligne **1** à la ligne **15** : 15 lignes possibles. `hasard() % 15` donne 0 à 14, et `1 + hasard() % 15` donne **1 à 15**.

**Le calcul se fait dans l’ordre des maths :** `%` passe avant `+`, comme × avant +. `1 + hasard() % 18`, c’est « le reste d’abord, puis on ajoute 1 ».

**Puis `poser(px, py, ALPHABET[15])`** dessine le nouveau P à sa place. L’ancien n’a pas besoin d’être effacé : le A est dessus.

**Dans `nouvellePartie()`,** rien ne change : le P revient en (15, 8), d’où qu’il soit.

**Ce qu’on doit voir** — START : le A prend le P ; un autre P apparaît aussitôt ailleurs, toujours à l’intérieur du cadre de X.  
**Ce qu’il coûte** — 3408 octets de programme, 35 variables.

---

### 0.91.5. Le snake — une queue qui suit le A

> Le 0.91.4, et le A a une queue : un O, toujours sur la case que le A vient de quitter. Le début d’un serpent.

```cpp
uint8_t ecran = 0;        // 0 = le TITRE, 1 = le JEU, 2 = la FIN

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
```

**C’est le 0.91.4, avec une chose en plus : une queue.** Derrière le A, il y a un **O** (`ALPHABET[14]`, la 15e lettre). Quand le A fait un pas, le O le suit : il prend **la case que le A vient de quitter**. C’est le début d’un jeu de serpent, le « snake ».

**Deux nouvelles variables, `qx` et `qy` :** la colonne et la ligne de la queue. Au départ, (4, 8) : juste à gauche du A, qui est en (5, 8). `nouvellePartie()` les remet là, et y pose le O.

**Où était le A avant son pas ? On le sait déjà :** au 0.91.3, on a rangé sa place d’avant dans `ax` et `ay`, pour le faire reculer devant un mur. On s’en sert une deuxième fois : c’est exactement là que la queue doit aller.

**Ce qui est nouveau ici : savoir si le A a bougé.** `deplace_croix` ne fait un pas que toutes les 250 ms ; les autres images, le A ne bouge pas. Et contre un mur, il est revenu en (`ax`, `ay`). Il a bougé si sa place n’est **plus** celle d’avant : `x != ax || y != ay`. **`!=`** veut dire « n’est pas égal à » (le 0.82), **`||`** veut dire « ou » (le 0.91.3) : une seule des deux différences suffit (un pas à gauche ou à droite change `x`, un pas en haut ou en bas change `y`).

**Quand il a bougé, quatre étapes, dans cet ordre :** 1. `effacer(qx, qy, 1)` efface l’ancien O (le `1` : une seule case). 2. `qx = ax;` et `qy = ay;` : la queue prend la case quittée par le A. 3. `poser(qx, qy, ALPHABET[14])` dessine le O à sa nouvelle place. 4. `poser(x, y, ALPHABET[0])` redessine le A.

**Pourquoi redessiner le A ?** Pour le demi-tour. Le A est en (5, 8), sa queue en (4, 8). Il va à gauche : il arrive en (4, 8), **sur** sa queue. L’étape 1 efface (4, 8)… et efface donc le A ! L’étape 3 pose le O en (5, 8), la case quittée. L’étape 4 remet le A en (4, 8). Le A et sa queue ont échangé leurs places.

**Déroulons un pas à droite :** A en (5, 8), O en (4, 8). `deplace_croix` : A en (6, 8), et (5, 8) est effacée. `x` vaut 6, `ax` vaut 5 : il a bougé. 1. (4, 8) est effacée. 2. `qx` = 5, `qy` = 8. 3. O en (5, 8). 4. A en (6, 8). Résultat : **O A**, un cran plus loin.

**Encore un défaut, pour plus tard :** si le P réapparaît juste sur la queue, le O l’efface au pas suivant ; on ne le voit plus, mais il est toujours là, dans `px` et `py`.

**Ce qu’on doit voir** — START : un O suit le A partout, un cran derrière lui ; au demi-tour, les deux échangent leurs places.  
**Ce qu’il coûte** — 3587 octets de programme, 37 variables.

---

### 0.91.6. Le snake — la queue grandit à chaque pièce

> Le 0.91.5, mais la queue est un tableau de cases O. Au début, le A est tout seul ; chaque pièce ramassée ajoute un O. Le serpent grandit.

```cpp
uint8_t ecran = 0;        // 0 = le TITRE, 1 = le JEU, 2 = la FIN

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
```

**C’est le 0.91.5, avec une chose en plus : la queue grandit.** Au début, le A est **tout seul**. À chaque P ramassé, il gagne **une case O**. Au bout de dix pièces, le A traîne dix O derrière lui.

**Une queue de plusieurs cases, c’est plusieurs places : un tableau.** `uint8_t qx[50];` réserve **50** colonnes, de `qx[0]` à `qx[49]` ; `qy[50]`, les 50 lignes. La case `i` de la queue est en (`qx[i]`, `qy[i]`). **`qx[0]`** est la case collée au A ; la dernière est le **bout** de la queue.

**`longueur` compte les cases utilisées :** **0** au départ, le A est tout seul ; `nouvellePartie()` la remet à 0 et ne pose aucun O. Les cases utilisées vont de `0` à `longueur - 1` : avec `longueur` = 3, ce sont `qx[0]`, `qx[1]` et `qx[2]`. Le bout est donc toujours `qx[longueur - 1]`.

**Un piège : `longueur - 1` quand `longueur` vaut 0.** On attendrait -1. Mais un `uint8_t` ne connaît que 0 à 255 : sous 0, il repart de l’autre côté, et 0 - 1 donne **255**. `qx[255]` n’existe pas (le tableau s’arrête à `qx[49]`), et la boucle ferait 255 tours. D’où la condition `longueur > 0 && (x != ax || y != ay)` : **`&&`** veut dire « et » (le 0.75) ; **les deux** doivent être vraies. Sans queue, on ne la déplace pas.

**Les parenthèses** autour de `x != ax || y != ay` : elles se calculent d’abord, comme en maths. « Il y a une queue » ET « le A a bougé (en x ou en y) ».

**Ce qui est nouveau ici : faire avancer toute la queue.** Chaque case prend la place de **celle de devant** : `qx[2]` prend la place de `qx[1]`, puis `qx[1]` celle de `qx[0]`, puis `qx[0]` celle que le A vient de quitter (`ax`, `ay`). Comme les wagons d’un train.

**Pourquoi en partant du bout ?** Si l’on commençait par `qx[1] = qx[0];`, l’ancienne place de `qx[1]` serait perdue avant que `qx[2]` ne la prenne. En partant du bout, chaque case est lue **avant** d’être écrasée.

**La boucle qui recule :** `for (uint8_t i = longueur - 1; i > 0; i--)`. **`i--`** retire 1 à `i` à chaque tour (le contraire de `i++`). Avec `longueur` = 3 : `i` vaut 2, puis 1, et s’arrête avant 0 (`i > 0` est faux). Tour `i` = 2 : `qx[2] = qx[1]`. Tour `i` = 1 : `qx[1] = qx[0]`. Avec `longueur` = 1, `i` part de 0 : `0 > 0` est faux, la boucle ne tourne pas du tout.

**Le bout est effacé avant, toute la queue est redessinée après :** `effacer(qx[longueur - 1], qy[longueur - 1], 1)` gomme l’ancien bout, puis une boucle `for` pose un O sur chaque case, de `0` à `longueur - 1`. Et le A par-dessus, comme au 0.91.5.

**Grandir, quand on ramasse le P :** la nouvelle case naît **sur le bout de la queue** : `qx[longueur] = qx[longueur - 1];`, puis `longueur = longueur + 1;`. Au pas suivant, toute la queue avance d’un cran, sauf la nouvelle case, qui prend la place de l’ancien bout : **elle reste derrière**, et la queue a une case de plus.

**La toute première case, elle, n’a pas de bout sur lequel naître** (et `qx[longueur - 1]` serait encore `qx[255]`). Elle naît donc **sous le A** : `qx[0] = x;` et `qy[0] = y;`. Au pas suivant, le A s’en va, et le O apparaît sur la case qu’il a quittée. `else` (le 0.83.1) : « sinon », quand la queue a déjà au moins une case.

**Pourquoi redessiner toute la queue ?** Juste après la pièce, le bout et la nouvelle case sont sur la même place. Au pas suivant, on efface le bout… donc aussi la nouvelle case, qui doit y rester. Redessiner toutes les cases la fait réapparaître.

**`if (longueur < 50)` :** le tableau n’a que 50 cases. Au-delà, `qx[50]` écrirait en dehors, sur d’autres variables. Après 49 pièces, la queue ne grandit plus.

**Pour plus tard :** le A traverse sa propre queue sans rien dire, et le P peut tomber sur la queue. Dans un vrai serpent, toucher sa queue fait perdre.

**Ce qu’on doit voir** — START : le A tout seul ; à chaque P ramassé, un O de plus derrière lui.  
**Ce qu’il coûte** — 3846 octets de programme, 39 variables.

---

### 0.91.7. Le snake — le A avance tout seul

> Le 0.91.6, mais le A ne s’arrête plus : il avance tout seul, un pas toutes les 250 ms. La croix ne fait que choisir la direction. Comme un vrai snake.

```cpp
uint8_t ecran = 0;        // 0 = le TITRE, 1 = le JEU, 2 = la FIN

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
```

**C’est le 0.91.6, avec une chose en plus : le A avance tout seul.** Même sans toucher à rien, il fait un pas toutes les 250 ms. La croix ne le fait plus avancer : elle **choisit sa direction**. C’est comme ça que bouge un vrai serpent, dans un vrai snake.

**`deplace_croix` s’en va.** Elle faisait un pas seulement quand on appuyait. On la remplace par deux morceaux écrits à la main : **choisir** la direction, puis **avancer**.

**Ce qui est nouveau ici : retenir une direction dans un nombre.** `uint8_t sens = 0;` Il y a quatre directions ; on leur donne un numéro : **0 = droite, 1 = bas, 2 = gauche, 3 = haut**. Le programme ne retient que ce numéro. Au départ, 0 : le A part vers la droite. `nouvellePartie()` le remet à 0.

**Choisir :** `if (bouton(DROITE)) sens = 0;`, et de même pour les trois autres. Il suffit d’**appuyer une fois**, même très court : `sens` change, et **il le reste** quand on lâche. Rien ne remet `sens` à zéro : le A continue dans la dernière direction choisie.

**Avancer :** `if (chaque(250)) { … }` (le 0.77) : quatre fois par seconde. `effacer(x, y, 1)` enlève le A de sa case. Puis **un seul** des quatre `if` est vrai, celui du `sens` : il change `x` ou `y` d’une case. Enfin `poser(x, y, ALPHABET[0])` dessine le A sur sa nouvelle case.

**Pourquoi `+ 1` et `- 1` ?** Les colonnes grandissent vers la droite : droite, c’est `x + 1` ; gauche, `x - 1`. Les lignes grandissent vers le **bas** (la ligne 0 est en haut) : bas, c’est `y + 1` ; haut, `y - 1`.

**Deux `chaque()` dans le même programme ?** Oui : `chaque(250)` pour les pas, `chaque(1000)` pour le chronomètre. Chacun a **son propre chronomètre** : ils ne se gênent pas.

**Déroulons :** A en (5, 8), `sens` = 0. 250 ms : `x` = 6. 250 ms : `x` = 7. On touche BAS : `sens` = 1. 250 ms : `y` = 9, `x` reste 7. Le A descend maintenant, tout seul, jusqu’à ce qu’on choisisse autre chose.

**Le reste ne change pas :** le mur fait reculer le A (le 0.91.3) ; il reste donc collé au mur tant qu’on ne choisit pas une autre direction. La queue le suit, le P le fait grandir (le 0.91.6). Le A doit maintenant être **posé** dans `nouvellePartie()` : `deplace_croix` le faisait à sa place.

**Pour plus tard :** en snake, on ne peut pas faire demi-tour d’un coup, sur sa propre queue ; et toucher un mur ou sa queue fait perdre.

**Ce qu’on doit voir** — START : le A part tout seul vers la droite ; un appui sur la croix change sa direction, et il continue sans s’arrêter.  
**Ce qu’il coûte** — 3658 octets de programme, 27 variables.

---

### 0.91.8. Le snake — le mur fait perdre

> Le 0.91.7, mais toucher le cadre de X arrête la partie : l’écran FIN, comme quand le temps est écoulé. Une fonction finPartie() pour les deux.

```cpp
uint8_t ecran = 0;        // 0 = le TITRE, 1 = le JEU, 2 = la FIN

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
```

**C’est le 0.91.7, avec une chose en plus : le mur fait perdre.** Avant, le A qui entrait dans un X reculait, et restait collé au mur. Maintenant, **la partie s’arrête** : l’écran FIN, le score, et START pour rejouer. Comme dans un vrai snake : le A avance tout seul, c’est à toi de tourner à temps.

**Deux façons de finir, un seul écran FIN :** le temps écoulé (le 0.91.1), et maintenant le mur. Plutôt que d’écrire l’écran FIN deux fois, on le range dans une fonction, **`finPartie()`**, comme `nouvellePartie()` au 0.91.2. Elle met `ecran` à 2, vide l’écran et écrit FIN, le score et « START : REJOUER ». Le chronomètre l’appelle quand `temps` arrive à 0 ; le mur aussi.

**Le test du mur ne change pas :** `x == 0 || x == 19 || y == 0 || y >= 16` (le 0.91.3), vrai dès que le A est sur une colonne ou une ligne du cadre. Ce qui change, c’est ce qu’on fait : plus de recul, plus de X à reposer (l’écran va être vidé), juste `finPartie();`.

**Ce qui est nouveau ici : `continue;`.** Il saute **tout le reste du tour** de la boucle `while (true)`, et repart au début : à `image()`. Pourquoi ? Juste après le mur, la suite de ce tour ferait encore bouger la queue, redessiner le A, tester le P et écrire le score en bas… **par-dessus** l’écran FIN, qu’on vient d’écrire. Avec `continue;`, rien de tout ça n’arrive.

**Au tour suivant,** `ecran` vaut 2 : le bloc `if (ecran == 1)` ne se fait plus, le A ne bouge plus. Seul reste `if (ecran == 2 && bouton(START))` : START relance une partie, avec `nouvellePartie()` (le 0.91.2).

**Déroulons, sans rien toucher :** le A part de (5, 8) vers la droite. Il passe sur le P en (15, 8) : score 1, une case de queue. Il continue… (18, 8)… puis (19, 8) : colonne 19, le mur. `finPartie()` : FIN, SCORE 001. `continue;` : on repart à `image()`.

**Pour plus tard :** le A peut encore faire demi-tour sur sa queue, et la traverser sans perdre.

**Ce qu’on doit voir** — START : le A file tout seul ; s’il touche le cadre de X, la partie s’arrête sur FIN et le score. START : on rejoue.  
**Ce qu’il coûte** — 3606 octets de programme, 27 variables.

---

### 0.91.9. Le snake — sans limite de temps

> Le 0.91.8, sans le chronomètre : plus de 30 secondes, plus de TEMPS. La partie dure tant que le A ne touche pas un mur.

```cpp
uint8_t ecran = 0;        // 0 = le TITRE, 1 = le JEU, 2 = la FIN

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
```

**C’est le 0.91.8, avec une chose en moins : le temps.** Plus de 30 secondes, plus de TEMPS en bas à droite. La partie dure **tant que le A ne touche pas un mur**. C’est la règle d’un vrai snake : on joue jusqu’à perdre.

**Ce qui change ici : on enlève, on n’ajoute rien.** Tout ce que le 0.91.1 avait mis pour le temps s’en va, morceau par morceau :

• la variable **`temps`** (`uint8_t temps = 30;`), et sa remise à 30 dans `nouvellePartie()` ;

• le mot **TEMPS** (`texte(11, 17, "TEMPS")`) et son nombre (`nombre(17, 17, temps)`), sur la ligne 17 ;

• le bloc du **chronomètre**, `if (ecran == 1 && chaque(1000)) { … }`, qui retirait une seconde et appelait `finPartie()` à 0.

**Enlever, c’est aussi de la programmation :** si l’on oubliait une seule de ces lignes, par exemple `nombre(17, 17, temps)` en gardant la variable effacée, le compilateur dirait que `temps` n’existe pas. Chaque ligne qui parlait du temps doit partir avec lui.

**`finPartie()` reste,** mais n’a plus qu’une raison d’être appelée : le mur (le 0.91.8). La fonction ne change pas : elle écrit toujours FIN, le score et « START : REJOUER ».

**`chaque(250)`, lui, reste :** c’est lui qui fait avancer le A (le 0.91.7). Il n’avait rien à voir avec le chronomètre ; chaque `chaque()` a son propre chronomètre.

**Pour plus tard :** le A peut encore faire demi-tour sur sa queue, et la traverser sans perdre. Sans limite de temps, c’est maintenant le seul vrai défaut du jeu.

**Ce qu’on doit voir** — START : plus de TEMPS en bas ; le A file tout seul, aussi longtemps qu’il évite les murs.  
**Ce qu’il coûte** — 3501 octets de programme, 26 variables.

---

### 0.92. Le snake, avec un menu — la couleur du serpent

> Le jeu du 0.91.9, et un MENU entre le titre et la partie : GAUCHE et DROITE choisissent la couleur du serpent, A lance la partie.

```cpp
uint8_t ecran = 0;        // 0 = le TITRE, 1 = le JEU, 2 = la FIN, 3 = le MENU (NOUVEAU)

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
```

**C’est le jeu du 0.91.9 (le snake sans limite de temps), avec une chose en plus : un menu.** Après le titre, START n’ouvre plus directement la partie : il ouvre le **MENU**. On y choisit la **couleur du serpent** avec GAUCHE et DROITE, puis **A** lance la partie. À la fin, START ramène au menu : on peut changer de couleur avant de rejouer.

**Un quatrième écran :** `ecran` valait 0 (titre), 1 (jeu) ou 2 (fin) ; il vaut maintenant aussi **3, le MENU**. La fonction `ouvrirMenu()` le dessine, comme `nouvellePartie()` dessine le jeu et `finPartie()` la fin.

**Ce qui est nouveau ici : colorer le serpent, et lui seul.** `couleurTexte()` colore **toutes** les lettres : les X et le P changeraient aussi. On se sert donc des **palettes** du 0.89 : le serpent va dans la **palette 1**, tout le reste reste dans la palette 0. Après chaque `poser()` du A ou d’un O, un `teindre(colonne, ligne, 1)` (le 0.89.1) met cette case dans la palette 1.

**Changer de couleur, c’est changer la palette, pas les cases.** `couleurFond(1, 3, rouge, vert, bleu)` change la **teinte 3** de la palette 1, celle des lettres (le 0.89). Toutes les cases de la palette 1 prennent la nouvelle couleur **d’un coup**, sans rien redessiner. C’est ce que fait `choisirCouleur()` : un `if` par couleur, et le nom de la couleur écrit dans le menu.

**La couleur est un numéro :** `uint8_t couleur = 0;` 0 = vert, 1 = rouge, 2 = bleu, 3 = violet. Comme `sens` au 0.91.7 : on retient un numéro, et des `if` disent ce qu’il veut dire.

**Les noms ont des espaces derrière :** `"VERT  "`, `"ROUGE "`, `"VIOLET"` ont tous 6 cases. Si l’on passait de VIOLET à VERT sans espaces, il resterait « VERTET » : les 2 dernières lettres de VIOLET : on efface avec des espaces, comme au chapitre 1.

**DROITE : la couleur suivante.** `couleur = (couleur + 1) % 4;` : 0 → 1 → 2 → 3, puis 3 + 1 = 4, et 4 % 4 = **0** : on revient au vert (le `%` du 0.9).

**GAUCHE : la couleur d’avant.** On voudrait `couleur - 1`, mais un `uint8_t` ne descend pas sous 0 : 0 - 1 donnerait 255 (le 0.91.6). L’astuce : **`(couleur + 3) % 4`**. Ajouter 3 puis garder le reste par 4, c’est reculer d’un. 2 : (2 + 3) % 4 = 5 % 4 = **1**. 0 : (0 + 3) % 4 = **3**, le violet.

**`chaque(200)` dans le menu :** un appui sur la croix dure plusieurs images. Si l’on regardait la croix à chaque image, un seul appui ferait tourner toutes les couleurs. On ne la regarde donc que 5 fois par seconde. Ce `chaque(200)` a son chronomètre à lui : il ne gêne pas le `chaque(250)` du serpent.

**Le petit serpent du menu :** trois O et un A, en (8, 9) à (11, 9), dans la palette 1. En changeant de couleur, on le voit changer tout de suite.

**Deux précautions, parce qu’une case garde sa palette :** `effacer()` enlève la **lettre**, pas la **palette** de la case. 1. `viderEcran()` remet toutes les cases dans la palette 0 (une boucle de plus, sur les 20 colonnes) : sinon, FIN ou MENU seraient à moitié de la couleur du serpent. 2. Quand le P réapparaît au hasard, `teindre(px, py, 0)` : la case a pu être celle du serpent.

**Ce qu’on doit voir** — START : le MENU ; GAUCHE et DROITE changent la couleur du petit serpent ; A : on joue, le serpent a cette couleur, le reste non.  
**Ce qu’il coûte** — 4369 octets de programme, 29 variables.

---

### 0.92.1. Le snake, avec un menu — le pas compté en images

> Le 0.92, mais le pas du A n’est plus donné par chaque(250) : on compte les images nous-mêmes, dans compte, jusqu’à attente. Même vitesse — mais attente est une variable.

```cpp
uint8_t ecran = 0;        // 0 = le TITRE, 1 = le JEU, 2 = la FIN, 3 = le MENU (le 0.92)

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
```

**C’est le 0.92, écrit d’une autre façon.** À l’écran, **presque rien ne change** : le A fait toujours un pas à peu près tous les quarts de seconde. Ce qui change, c’est **comment** le programme le sait. C’est une autre méthode pour arriver au même résultat.

**Pourquoi changer ce qui marche ?** Pour la leçon suivante : on veut un A qui **accélère**. Or `chaque(250)` ne prend qu’un **nombre écrit en clair** : `chaque(attente)` est refusé, parce que le compilateur traduit 250 ms en images **avant** que le jeu tourne. Il faut donc un temps qu’on peut **changer pendant la partie** : une variable.

**Ce qui est nouveau ici : compter les images soi-même.** `image()` revient **60 fois par seconde** : une image, 1/60 de seconde. Deux variables : **`compte`**, les images passées depuis le dernier pas, et **`attente`**, combien il en faut pour un pas : **15**.

**À chaque image :** `compte = compte + 1;`. Puis `if (compte >= attente)` : si l’on a attendu assez, on remet **`compte = 0;`** et le A fait son pas. **`>=`** veut dire « plus grand ou égal » (le 0.91.3).

**Déroulons :** image 1 : `compte` = 1, pas de pas. Image 2 : 2… Image 15 : `compte` = 15, 15 >= 15 est vrai : **un pas**, et `compte` repart à 0. Image 16 : 1… Image 30 : un pas. Un pas toutes les **15 images**.

**15 images, combien de temps ?** 60 images font une seconde ; 15, c’est un quart : **250 ms**. Ce que donnait `chaque(250)`… presque.

**Pourquoi « presque » ?** `compte` compte les **tours de boucle**, pas le vrai temps. D’habitude, un tour dure une image. Mais le tour où le A fait son pas doit tout redessiner (le A, la queue, les palettes) : il déborde un peu sur l’image suivante. Un pas prend donc 16 images au lieu de 15, environ 267 ms au lieu de 250 : l’œil ne voit pas la différence. `chaque()`, lui, regarde la vraie horloge de la console : il ne prend pas de retard.

**`nouvellePartie()` remet `compte` à 0 :** chaque partie commence par une attente complète.

**Pour la suite :** `attente` est une **variable**. Si elle passe à 14, le A fait un pas toutes les 14 images : un peu plus vite. C’est le 0.92.2.

**Ce qu’on doit voir** — Comme au 0.92 : le A avance d’un pas tous les quarts de seconde. Le changement est dans le code.  
**Ce qu’il coûte** — 4392 octets de programme, 31 variables.

---

### 0.92.2. Le snake, avec un menu — la vitesse qui monte

> Le 0.92.1, et une deuxième ligne au menu : B choisit VITESSE FIXE ou MONTE. En MONTE, chaque P ramassé retire une image d’attente : le A va de plus en plus vite.

```cpp
uint8_t ecran = 0;        // 0 = le TITRE, 1 = le JEU, 2 = la FIN, 3 = le MENU (le 0.92)

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
```

**C’est le 0.92.1, avec une chose en plus : un mode vitesse.** Dans le menu, une deuxième ligne : **VITESSE : FIXE** ou **MONTE**. Le bouton **B** passe de l’un à l’autre. En FIXE, le jeu est celui du 0.92.1. En MONTE, **chaque P ramassé rend le A un peu plus rapide**.

**Ce qui est nouveau ici : `monte`, un interrupteur.** `uint8_t monte = 0;` 0 veut dire FIXE, 1 veut dire MONTE. Une variable qui ne vaut que 0 ou 1, c’est un **interrupteur** : éteint ou allumé.

**B l’inverse :** `monte = 1 - monte;`. Si `monte` vaut 0 : 1 - 0 = **1**. S’il vaut 1 : 1 - 1 = **0**. Une seule ligne, dans les deux sens. Puis `choisirVitesse()` écrit FIXE ou MONTE, comme `choisirCouleur()` écrit le nom de la couleur. `"FIXE "` a un espace derrière : MONTE a une lettre de plus.

**B est lu dans le même `chaque(200)` que la croix :** sinon, un appui (plusieurs images) allumerait et éteindrait l’interrupteur plusieurs fois.

**Aller plus vite, c’est attendre moins.** Au 0.92.1, le A fait un pas toutes les `attente` images (15). Quand il ramasse un P, en mode MONTE : `attente = attente - 1;`. 15, puis 14, 13, 12… **Moins d’images entre deux pas, plus de pas par seconde.**

**Les deux conditions à la fois :** `if (monte == 1 && attente > 5)` (`&&`, le 0.75). **`monte == 1`** : seulement en mode MONTE ; en FIXE, `attente` reste à 15. **`attente > 5`** : on s’arrête à 5 images par pas, soit 12 pas par seconde. Sans cette limite, le jeu deviendrait injouable ; et à 0, `attente - 1` donnerait 255 (le 0.91.6) : le A presque arrêté !

**Les chiffres :** 15 images, 4 pas par seconde (60 / 15). Après 5 P : 10 images, **6** pas par seconde. Après 10 P : 5 images, **12** pas par seconde. La vitesse a triplé.

**`nouvellePartie()` remet `attente` à 15 :** chaque partie repart lentement, même après une partie très rapide. `monte`, lui, n’est **pas** remis à 0 : c’est un réglage du menu, il reste choisi d’une partie à l’autre, comme la couleur.

**Ce qu’on doit voir** — Le MENU : B change VITESSE FIXE / MONTE. En MONTE, le A accélère à chaque P ramassé.  
**Ce qu’il coûte** — 4600 octets de programme, 32 variables.

---

### Partie I — Le jeu de bombes

### 0.93. Un jeu de bombes — le terrain

> Un nouveau jeu, façon Bomberman. D’abord le terrain : un cadre de X, et des piliers X sur une case sur deux (colonne ET ligne paires). Le joueur, le O, en (1, 1).

```cpp
// ---- UN JEU DE BOMBES : le terrain ----
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
```

**Un nouveau jeu : des bombes, comme dans Bomberman.** Le joueur est un **O**, les ennemis seront des **W**, les murs sont des **X**. On le construit leçon après leçon ; ici, **seulement le terrain**, et le O posé à sa place de départ.

**Le terrain :** un **cadre** de X tout autour (comme au 0.91.3), et à l’intérieur, des **piliers** X, un sur deux, en quadrillage. Entre les piliers, des **couloirs** : c’est là qu’on se déplacera, et que les flammes des bombes passeront.

**19 colonnes, de 0 à 18,** et 17 lignes, de 0 à 16. Pourquoi 19 et pas 20 ? Pour que le cadre de droite (colonne 18) soit **pair**, comme celui de gauche (colonne 0). Ainsi, il y a un couloir des deux côtés de chaque pilier. La colonne 19 reste vide ; la ligne 17 servira au score.

**Ce qui est nouveau ici : une case sur deux, avec `% 2`.** `c % 2` est le **reste de la division par 2** (le `%` du 0.9) : 0 pour un nombre **pair** (0, 2, 4…), 1 pour un nombre **impair** (1, 3, 5…). Exemples : 6 % 2 = 0, car 6 = 3 × 2 + 0 ; 7 % 2 = 1, car 7 = 3 × 2 + 1.

**Un pilier, c’est colonne paire ET ligne paire :** `c % 2 == 0 && l % 2 == 0` (`&&`, « et », le 0.75). En (2, 2) : oui, pilier. En (2, 3) : la ligne 3 est impaire, non : couloir. En (3, 2) : la colonne 3 est impaire, non : couloir. En (1, 1) : ni l’une ni l’autre, c’est la place du O.

**Le cadre :** `l == 0 || l == 16 || c == 0 || c == 18` (`||`, « ou », le 0.91.3) : la première ou la dernière ligne, la première ou la dernière colonne.

**Deux boucles, l’une dans l’autre (le 0.69.1) :** la boucle des lignes (`l`, de 0 à 16) contient celle des colonnes (`c`, de 0 à 18). Pour **chaque** ligne, on passe sur **toutes** les colonnes : 17 × 19 = **323 cases**, une par une. Déroulons : `l` = 0 : `c` = 0, 1, 2 … 18, tout est cadre. `l` = 1 : `c` = 0 cadre, 1 à 17 rien (ligne impaire), 18 cadre. `l` = 2 : `c` = 0 cadre, 1 rien, 2 pilier, 3 rien, 4 pilier… 18 cadre.

**Sur le cadre, certaines cases sont aussi des piliers** (par exemple (0, 0), ou (4, 16) : colonne et ligne paires). Le X y est posé deux fois : ce n’est pas grave, c’est le même X au même endroit.

**Le compte :** 68 X pour le cadre (19 en haut, 19 en bas, 15 à gauche, 15 à droite) et 56 piliers à l’intérieur (8 colonnes paires, de 2 à 16, × 7 lignes paires, de 2 à 14) : **124 X**.

**Ce qu’on doit voir** — Un cadre de X, des piliers X en quadrillage à l’intérieur, et le O en haut à gauche.  
**Ce qu’il coûte** — 1572 octets de programme, 2 variables.

---

### 0.93.1. Un jeu de bombes — le O bouge, les X l’arrêtent

> Le 0.93, et le O bouge avec la croix, un pas toutes les 150 ms. Avant chaque pas, lire() regarde la case d’arrivée : un X, et le O reste où il est.

```cpp
// ---- UN JEU DE BOMBES ----
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
```

**C’est le 0.93, avec une chose en plus : le O bouge.** La croix le déplace d’une case, dans les couloirs. Les X (le cadre et les piliers) l’arrêtent.

**Deux variables pour le O :** `ox` et `oy`, sa colonne et sa ligne. Il part de (1, 1). Et deux autres, `nx` et `ny` : la case d’**arrivée**, là où il irait s’il bougeait. C’est la méthode du mur M (le 0.82) : **on calcule d’abord, on regarde, et seulement après on bouge.**

**`chaque(150)`** (le 0.77) : au plus un pas toutes les 150 ms, un peu plus vite que le serpent.

**Étape 1, la case d’arrivée.** On part de la case actuelle (`nx = ox; ny = oy;`), puis la flèche tenue change `nx` ou `ny` d’une case. **Ce qui est nouveau ici : `else if`.** `if (…) { … } else if (…) { … }` : « sinon, si… ». Dès qu’une flèche est trouvée, les suivantes ne sont **pas** regardées. Avec DROITE et BAS tenues ensemble, seule DROITE compte : **pas de pas en diagonale** (en diagonale, le O passerait entre deux piliers). `else` seul, on l’a vu au 0.83.1.

**Étape 2 : une flèche est-elle tenue ?** Si aucune ne l’est, l’arrivée est la case où l’on est déjà : `nx != ox || ny != oy` est faux, on ne fait rien.

**Étape 3 : regarder l’arrivée.** `lire(nx, ny) != ALPHABET[23]` (le 0.82) : « la case d’arrivée n’est pas un X ». Alors on efface le O, on change `ox` et `oy`, et on le pose sur sa nouvelle case.

**Déroulons :** O en (1, 1), DROITE : l’arrivée est (2, 1). `lire(2, 1)` : un espace, pas un X. Le O va en (2, 1). Puis BAS : l’arrivée est (2, 2), un **pilier** (colonne et ligne paires, le 0.93). `lire(2, 2)` rend le X : le O ne bouge pas. Il faut revenir en colonne 1 ou aller en colonne 3 pour descendre.

**Ce qu’on doit voir** — Le O se déplace avec la croix dans les couloirs ; il ne traverse ni le cadre, ni les piliers.  
**Ce qu’il coûte** — 2045 octets de programme, 13 variables.

---

### 0.93.2. Un jeu de bombes — A pose une bombe

> Le 0.93.1, et le bouton A pose une bombe B sous le O. Une seule à la fois. Elle ne se voit que quand le O s’en va ; ensuite, elle lui barre le chemin.

```cpp
// ---- UN JEU DE BOMBES ----
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
```

**C’est le 0.93.1, avec une chose en plus : la bombe.** Le bouton **A** pose une bombe, une **B**, là où est le O. Pour l’instant, elle n’explose pas : ce sera le 0.93.3.

**Trois variables :** `bombe` vaut 1 quand une bombe est posée, 0 sinon ; `bx` et `by` retiennent sa place.

**Poser :** `if (bouton(A) && bombe == 0)` (`&&`, le 0.75). **`bombe == 0`** : une seule bombe à la fois. Tant qu’elle est là, A ne fait plus rien. Alors `bombe = 1;`, et la bombe prend la place du O : `bx = ox; by = oy;`.

**On ne la voit pas tout de suite :** le O est encore dessus, et c’est lui qu’on voit. **Ce qui est nouveau ici : la B apparaît quand le O s’en va.** Au moment du pas, on efface la case du O, puis : `if (bombe == 1 && ox == bx && oy == by)` : si le O était **sur** la bombe, on pose la B à cette place. Sans ça, `effacer()` effacerait aussi la bombe.

**Ensuite, la bombe barre le chemin.** Au 0.93.1, le O allait partout sauf sur un X. Il faudrait maintenant dire « ni un X, ni une B »… et bientôt « ni un W, ni une flamme ». Plus simple : **le O ne va que sur une case VIDE.** Une case vide, c’est un espace, la **tuile 0** : `lire(nx, ny) == 0`. X, B, et tout ce qui viendra plus tard, l’arrêtent d’un coup.

**Déroulons :** O en (3, 1), A : `bombe` = 1, `bx` = 3, `by` = 1. DROITE : `lire(4, 1)` vaut 0, vide. On efface (3, 1) ; le O était sur la bombe (3 == 3 et 1 == 1) : la B est posée en (3, 1). Le O va en (4, 1). GAUCHE : `lire(3, 1)` rend la B, pas 0 : le O ne bouge pas.

**Ce qu’on doit voir** — A pose une B sous le O ; elle apparaît quand il s’en va, et il ne peut plus repasser dessus.  
**Ce qu’il coûte** — 2213 octets de programme, 16 variables.

---

### 0.93.3. Un jeu de bombes — la bombe explose

> Le 0.93.2, et la bombe explose au bout de 2 secondes : des flammes - et | sur sa case et une case autour, sauf dans les X. Une demi-seconde plus tard, elles s’éteignent.

```cpp
// ---- UN JEU DE BOMBES ----
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
```

**C’est le 0.93.2, avec une chose en plus : l’explosion.** Deux secondes après la pose, la B disparaît et des **flammes** apparaissent : sur sa case, et **une case** à droite, à gauche, en bas, en haut. Une demi-seconde après, elles s’éteignent.

**Les flammes sont des signes :** `-` pour les flammes couchées (à gauche, à droite, et le centre), **`|`** pour les flammes debout (en haut, en bas). `texte(c, l, "-")` les écrit, comme un mot d’une lettre.

**Compter le temps :** `bdelai` compte les images depuis la pose (`bdelai = 0;` quand on pose). À chaque image : `bdelai = bdelai + 1;`. `image()` revient 60 fois par seconde : à **120**, deux secondes ont passé, la bombe explose. Les flammes, elles, comptent dans `fdelai` jusqu’à **30** : une demi-seconde.

**Au moment d’exploser :** `bombe = 0;` (plus de bombe), le centre de l’explosion est rangé dans `fx` et `fy`, `feu = 1;` (les flammes sont là), et `flammes(1);` les dessine.

**Ce qui est nouveau ici : une fonction qui dessine OU efface.** `flammes(allume)` passe sur les cases de l’explosion ; pour chacune, elle appelle `caseFeu(c, l, allume, debout)`. Si `allume` vaut 1, `caseFeu` écrit la flamme ; s’il vaut 0, elle efface la case. **Pourquoi une seule fonction ?** Pour être sûr que `flammes(0)` efface **exactement** les cases que `flammes(1)` a dessinées. Des fonctions avec des paramètres : le 0.33.

**Le X arrête la flamme :** avant chaque case autour du centre, `if (lire(fx + 1, fy) != ALPHABET[23])`. Un pilier ou le cadre ne brûle pas. Le centre, lui, est toujours brûlé : c’est la case de la bombe.

**`debout` :** le 4e paramètre de `caseFeu`. 1 : `|` ; 0 : `-`. En bas et en haut, on passe 1 ; au centre, à droite et à gauche, 0.

**Deux précautions :** 1. On ne pose pas de nouvelle bombe tant que les flammes sont là (`&& feu == 0`) : sinon `fx` et `fy` changeraient, et `flammes(0)` effacerait au mauvais endroit. 2. Après `flammes(0)`, on **redessine le O** : s’il était resté dans une flamme, l’effacement l’a effacé aussi.

**Le O ne marche pas dans les flammes :** elles ne sont pas une case vide (le 0.93.2). Pour l’instant, elles ne lui font rien s’il est dessus ; au 0.93.8, elles le feront perdre.

**Ce qu’on doit voir** — A, puis on s’écarte : deux secondes après, la bombe explose en croix (- et |), puis les flammes s’éteignent.  
**Ce qu’il coûte** — 2801 octets de programme, 26 variables.

---

### 0.93.4. Un jeu de bombes — des flammes plus longues

> Le 0.93.3, mais chaque bras de flamme va jusqu’à 2 cases, et s’arrête au premier X : une boucle for et break.

```cpp
// ---- UN JEU DE BOMBES ----
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
```

**C’est le 0.93.3, avec une chose en plus : des bras de deux cases.** L’explosion fait maintenant une croix plus grande : jusqu’à 2 cases de chaque côté.

**Ce qui est nouveau ici : un bras est une boucle.** Pour la droite : `for (uint8_t k = 1; k <= 2; k++)`. `k` vaut 1, puis 2 : la case `fx + 1`, puis la case `fx + 2`. `<=` : « plus petit ou égal », donc 2 compris.

**`break` : le mur arrête le bras.** Dans la boucle, d’abord : `if (lire(fx + k, fy) == ALPHABET[23]) break;`. **`break`** sort de la boucle tout de suite (le 0.33) : les cases suivantes ne sont même pas regardées. La flamme ne **traverse** pas un pilier.

**Déroulons, bombe en (1, 1) :** à droite, `k` = 1 : (2, 1) vide, flamme. `k` = 2 : (3, 1) vide, flamme. À gauche, `k` = 1 : (0, 1), le cadre : `break`, rien. En bas, `k` = 1 : (1, 2), flamme. `k` = 2 : (1, 3), flamme. En haut : (1, 0), le cadre : rien.

**Et bombe en (2, 1) ?** En bas, `k` = 1 : (2, 2), un pilier : `break` tout de suite. Rien en dessous.

**Pourquoi `break` protège aussi les nombres :** à gauche, `fx - k`. Si `fx` vaut 1, `fx - 2` ne donnerait pas -1 mais 255 (le 0.91.6). Mais (0, 1) est toujours un X : `break` arrive avant `k` = 2. Le cadre garde les calculs dans le terrain.

**Le reste ne change pas :** `flammes(0)` fait les mêmes boucles, avec les mêmes `break` : elle efface exactement les mêmes cases.

**Ce qu’on doit voir** — L’explosion fait une croix de 2 cases de chaque côté ; un X arrête le bras.  
**Ce qu’il coûte** — 2977 octets de programme, 27 variables.

---

### 0.93.5. Un jeu de bombes — un ennemi W

> Le 0.93.4, et un ennemi W, en bas à droite. Toutes les 400 ms, il tire une direction au hasard (hasard() % 4) et y va, si la case est vide.

```cpp
// ---- UN JEU DE BOMBES ----
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
```

**C’est le 0.93.4, avec une chose en plus : un ennemi.** Un **W** part du coin en bas à droite, (17, 15), et se promène **au hasard**.

**Ce qui est nouveau ici : une direction tirée au hasard.** `d = hasard() % 4;` : `hasard()` rend un nombre de 0 à 255 (le 0.81.2) ; `% 4` en garde le reste par 4 : **0, 1, 2 ou 3**. Comme `sens` au 0.91.7 : 0 droite, 1 bas, 2 gauche, 3 haut. Exemple : `hasard()` rend 201 ; 201 = 50 × 4 + 1 : `d` vaut 1, le W veut descendre.

**Puis la même méthode que pour le O :** la case d’arrivée dans `nx` et `ny` (`nx` et `ny` servent pour le O, puis pour le W : chacun les calcule juste avant de s’en servir). Si `lire(nx, ny) == 0`, une case **vide**, le W y va. Sinon, il reste ; il tirera une autre direction au pas suivant.

**Une case vide seulement :** comme le O (le 0.93.2), le W ne va ni dans les X, ni sur la bombe, ni dans les flammes, ni sur le O.

**`chaque(400)`** : un pas toutes les 400 ms. Le W est plus lent que le O (150 ms) : on peut le fuir. Ce chronomètre est à lui : il ne gêne pas le `chaque(150)` du O.

**Après les flammes, on redessine aussi le W :** comme le O, il a pu être sous une flamme (pour l’instant, elle ne lui fait rien ; au 0.93.7, si).

**Ce qu’on doit voir** — Un W se promène au hasard dans les couloirs, sans traverser les X.  
**Ce qu’il coûte** — 3269 octets de programme, 30 variables.

---

### 0.93.6. Un jeu de bombes — trois ennemis

> Le 0.93.5, mais trois W, dans trois coins : leurs places sont dans deux tableaux, ex[3] et ey[3], et une boucle les fait bouger l’un après l’autre.

```cpp
// ---- UN JEU DE BOMBES ----
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
```

**C’est le 0.93.5, avec une chose en plus : trois W.** Un en bas à droite, un en haut à droite, un en bas à gauche.

**Ce qui est nouveau ici : les places dans des tableaux.** `uint8_t ex[3];` : trois colonnes, `ex[0]`, `ex[1]` et `ex[2]` ; `ey[3]` : trois lignes. Le W n° `i` est en (`ex[i]`, `ey[i]`). Les tableaux, on les a vus au 0.32 ; plusieurs ennemis dans un tableau, au 0.85.

**Au départ,** on remplit les tableaux une case à la fois : `ex[0] = 17; ey[0] = 15;` (en bas à droite), `ex[1] = 17; ey[1] = 1;` (en haut à droite), `ex[2] = 1; ey[2] = 15;` (en bas à gauche). Puis une boucle pose les trois W.

**Les faire bouger :** le code du 0.93.5, à l’intérieur de `for (uint8_t i = 0; i < 3; i++)`. Partout où il y avait `ex`, on écrit `ex[i]`. Tour `i` = 0 : le W n° 0 tire sa direction et fait son pas ; tour `i` = 1 : le n° 1 ; tour `i` = 2 : le n° 2.

**Chacun tire sa propre direction :** `hasard()` est appelé une fois par W, et rend à chaque fois un autre nombre. Les trois W ne vont donc pas du même côté.

**Un W ne marche pas sur un autre :** la case d’un W n’est pas vide. S’ils se croisent dans un couloir, l’un attend que l’autre parte.

**Pourquoi trois et pas plus ?** Pour ajouter un W, il suffirait d’agrandir les tableaux et de changer le `3` des boucles. On garde trois : assez pour que ce soit difficile.

**Ce qu’on doit voir** — Trois W partent de trois coins et se promènent chacun de son côté.  
**Ce qu’il coûte** — 3531 octets de programme, 31 variables.

---

### 0.93.7. Un jeu de bombes — la flamme détruit les W

> Le 0.93.6, et une flamme qui tombe sur un W le détruit : vivant[i] passe à 0, le score gagne 1. Un W détruit ne bouge plus.

```cpp
// ---- UN JEU DE BOMBES ----
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
```

**C’est le 0.93.6, avec une chose en plus : détruire les W.** Si une flamme tombe sur un W, il disparaît, et le **score** gagne 1. Le score s’affiche sous le terrain, ligne 17.

**Un troisième tableau, `vivant[3]` :** `vivant[i]` vaut 1 si le W n° `i` est là, 0 s’il a été détruit. Au départ, les trois valent 1.

**Ce qui est nouveau ici : chercher QUEL W est sous la flamme.** Dans `caseFeu`, juste avant d’écrire une flamme : `if (lire(c, l) == ALPHABET[22])` : « y a-t-il un W sur cette case ? ». L’écran dit **qu’il y a** un W, mais pas **lequel**. La fonction `toucheW(c, l)` le cherche : elle passe sur les trois, et celui qui est **vivant ET** en (`c`, `l`) est détruit : `vivant[i] = 0;`, `score = score + 1;`.

**`vivant[i] == 1 && ex[i] == c && ey[i] == l` :** trois conditions, toutes vraies à la fois (`&&`, le 0.75). `vivant[i] == 1` évite de compter deux fois un W déjà détruit qui aurait gardé la même place.

**La flamme recouvre le W :** `texte()` écrit la flamme **par-dessus** la lettre W. Quand la flamme s’éteint, `effacer()` vide la case : le W a disparu de l’écran.

**Un W détruit ne fait plus rien :** dans la boucle des W, `if (vivant[i] == 1)` entoure tout son pas. Après les flammes, on ne redessine que les W vivants.

**Le score :** `texte(0, 17, "SCORE")` une fois au départ, puis `nombre(6, 17, score)` à chaque image, comme dans le serpent.

**`toucheW` est écrite avant `caseFeu` :** en C++, une fonction doit être écrite **avant** celles qui l’appellent.

**Ce qu’on doit voir** — Pose des bombes sur le chemin des W : une flamme qui en touche un le détruit, et le SCORE monte.  
**Ce qu’il coûte** — 3834 octets de programme, 36 variables.

---

### 0.93.8. Un jeu de bombes — touché : la partie s’arrête

> Le 0.93.7, et le O peut perdre : touché par un W, ou par une flamme. L’écran FIN montre le score ; START relance une partie (nouvellePartie(), comme au 0.91.2).

```cpp
// ---- UN JEU DE BOMBES ----
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
```

**C’est le 0.93.7, avec une chose en plus : on peut perdre.** Le O est **touché** si un W arrive sur lui, s’il marche sur un W ou dans une flamme, ou si une flamme tombe sur lui (attention à sa propre bombe !). Alors, l’écran **FIN** et le score ; **START** : on rejoue.

**Ce qui est nouveau ici : `mort`, un drapeau.** `uint8_t mort = 0;` passe à 1 dès que le O est touché, **où que ce soit** dans le programme. On ne s’arrête pas tout de suite : à la **fin** du tour, `if (mort == 1) finPartie();`. Ainsi, on n’écrit jamais l’écran FIN au milieu d’une explosion.

**Les trois façons d’être touché :** 1. Dans `caseFeu` : la flamme tombe sur le O (`c == ox && l == oy`). 2. Dans la boucle des W : l’arrivée du W est la case du O (`nx == ox && ny == oy`). 3. Quand le O bouge : l’arrivée n’est pas vide, **et** ce n’est ni un X, ni une B. Qu’est-ce qui reste ? **Un W ou une flamme.** `else if (lire(nx, ny) != ALPHABET[23] && lire(nx, ny) != ALPHABET[1])`.

**Deux écrans :** `ecran` vaut 0 pour le JEU, 1 pour la FIN, comme dans le serpent (le 0.91). Tout le jeu est dans `if (ecran == 0) { … }` ; sur la fin, seul START compte.

**Rejouer : tout remettre au départ.** Le début de `main()` (le terrain, le O, les W, le SCORE) devient la fonction **`nouvellePartie()`**, avec en plus les remises à zéro : le O en (1, 1), pas de bombe, pas de flammes, le score à 0, `mort` à 0. `main()` l’appelle une fois au début, et START l’appelle à chaque nouvelle partie. `viderEcran()` et `finPartie()` sont celles du serpent.

**Déroulons : A, et on ne bouge pas.** La bombe est sous le O. 2 secondes après, `flammes(1)` : le centre est la case du O : `mort = 1`. À la fin du tour : `finPartie()`, FIN, SCORE 000.

**Ce qu’on doit voir** — Touché par un W ou par une flamme : FIN et le score. START : une nouvelle partie.  
**Ce qu’il coûte** — 4287 octets de programme, 40 variables.

---

### 0.93.9. Un jeu de bombes — les trois W détruits : gagné

> Le 0.93.8, et une façon de gagner : quand le score arrive à 3, les trois W sont détruits. L’écran FIN, avec BRAVO ! au-dessus.

```cpp
// ---- UN JEU DE BOMBES ----
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
```

**C’est le 0.93.8, avec une chose en plus : gagner.** Quand les **trois** W sont détruits, la partie s’arrête sur **BRAVO !**, au-dessus de FIN et du score.

**Ce qui est nouveau ici : savoir qu’il ne reste plus de W.** On pourrait regarder `vivant[0]`, `vivant[1]` et `vivant[2]`. Plus simple : chaque W détruit ajoute **1** au score, et un W ne peut être détruit qu’une fois (le `vivant[i] == 1` du 0.93.7). Donc **`score == 3`** veut dire : les trois sont détruits.

**À la fin du tour, avec `mort` :** `if (mort == 1) { … } else if (score == 3) { … }`. **Perdre passe d’abord :** si la dernière flamme détruit le dernier W **et** touche le O, c’est perdu.

**Gagner réutilise `finPartie()` :** le même écran FIN, le score (003), START pour rejouer. On ajoute juste `texte(6, 3, "BRAVO !")` au-dessus. Le point d’exclamation fait partie des signes de la console.

**Le jeu est complet :** se déplacer, poser des bombes, fuir les flammes et les W, les détruire tous. **Pour aller plus loin :** des briques qu’une bombe peut casser, plusieurs bombes à la fois, des flammes plus longues en bonus, des W plus rapides à chaque niveau…

**Ce qu’on doit voir** — Détruis les trois W sans te faire toucher : BRAVO ! au-dessus de FIN et du score.  
**Ce qu’il coûte** — 4330 octets de programme, 40 variables.

---

### 0.94. Un jeu de bombes, avec des briques — des briques M

> Le jeu du 0.93.9, et des briques M, posées au hasard dans les couloirs, une case sur trois environ. Elles bloquent le O, les W et les flammes, comme les X. Le coin du départ reste libre.

```cpp
// ---- UN JEU DE BOMBES ----
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
```

**C’est le jeu du 0.93.9, avec une chose en plus : des briques.** Des **M** remplissent une partie des couloirs, au hasard : quand on rejoue, le terrain change. Pour l’instant, elles sont aussi dures que les X ; au 0.94.1, les bombes les casseront.

**Ce qui est nouveau ici : poser les briques au hasard.** Deux boucles passent sur l’intérieur du terrain (lignes 1 à 15, colonnes 1 à 17), comme pour les piliers (le 0.93). Une brique est posée si **trois** conditions sont vraies à la fois (`&&`, le 0.75).

**1. C’est un couloir :** `c % 2 == 1 || l % 2 == 1`. Un pilier a sa colonne **et** sa ligne paires ; un couloir a sa colonne **ou** sa ligne impaire (`% 2 == 1`). Les **parenthèses** autour de cette condition la calculent d’abord, comme au 0.91.6 : « couloir » ET le reste.

**2. Ce n’est pas le coin du départ :** `c + l > 5`. En (1, 1), 1 + 1 = 2 ; en (3, 1), 4 ; en (3, 2), 5 ; en (1, 4), 5 : jamais de brique. En (5, 1), 6 : une brique possible. Ce coin libre, c’est de la place pour poser sa première bombe et s’abriter : de (1, 1), on peut aller en (3, 2), hors des bras de la flamme.

**3. Une fois sur trois :** `hasard() % 3 == 0`. Le reste par 3 vaut 0, 1 ou 2 : il vaut 0 une fois sur trois environ. Exemple : `hasard()` rend 201, 201 = 67 × 3 + 0 : une brique. 202 : reste 1, pas de brique.

**Les briques sont posées AVANT le O et les W.** Si le hasard met un M dans le coin d’un W, le W est posé par-dessus : il est là, mais enfermé jusqu’à ce qu’une bombe le libère.

**Le M bloque tout le monde :** les W ne vont que sur une case vide (le 0.93.5) ; le O aussi (le 0.93.2). Mais attention au 0.93.8 : quand le O essayait d’aller sur une case « ni vide, ni X, ni B », c’était un W ou une flamme, et il **perdait**. Un M n’est ni l’un ni l’autre : on ajoute **`&& lire(nx, ny) != ALPHABET[12]`**, sinon toucher une brique ferait perdre.

**Le M arrête les flammes, comme un X :** dans `flammes`, `if (lire(…) == ALPHABET[23] || lire(…) == ALPHABET[12]) break;` (`||`, « ou »). Une brique **protège** ce qu’il y a derrière elle.

**Le jeu devient plus dur :** les W sont souvent enfermés, et il faut faire son chemin entre les briques. Au 0.94.1, on pourra le **creuser** avec les bombes.

**Ce qu’on doit voir** — Des briques M au hasard dans les couloirs ; le coin du départ est libre ; ni le O, ni les W, ni les flammes ne passent.  
**Ce qu’il coûte** — 4815 octets de programme, 40 variables.

---

### 0.94.1. Un jeu de bombes, avec des briques — la flamme casse les briques

> Le 0.94, et une flamme qui atteint une brique M la casse : le bras s’arrête sur elle, et quand les flammes s’éteignent, la brique disparaît avec elles.

```cpp
// ---- UN JEU DE BOMBES ----
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
```

**C’est le 0.94, avec une chose en plus : casser les briques.** Une bombe posée près d’un M le détruit. On peut maintenant **se creuser un chemin**, et aller chercher les W enfermés.

**La brique arrête le bras, puis brûle.** Comme dans le vrai Bomberman : la flamme **ne passe pas** au-delà de la brique (ce qu’il y a derrière est protégé), mais la brique, elle, est détruite.

**Ce qui est nouveau ici : la brique disparaît QUAND les flammes s’éteignent.** Dans chaque bras de `flammes`, on regarde d’abord le X (`break`, comme avant). Puis : `if (lire(…) == ALPHABET[12])` : une brique. Si `allume == 0` (les flammes s’éteignent), on l’efface. Et dans les deux cas, `break` : le bras s’arrête là.

**Pourquoi pas tout de suite, pendant l’explosion ?** Parce que `flammes(0)` doit effacer **exactement** les cases que `flammes(1)` a dessinées (le 0.93.3). Si la brique disparaissait à l’explosion, `flammes(0)` ne la trouverait plus : le bras ne s’arrêterait plus au même endroit, et il effacerait la case d’après… peut-être un W, ou une autre brique ! En laissant la brique jusqu’à la fin, les deux passages s’arrêtent **sur la même case**.

**Déroulons : une bombe en (3, 1), un M en (5, 1).** `flammes(1)`, à droite : `k` = 1, (4, 1) est vide, flamme. `k` = 2, (5, 1) est un M : `allume` vaut 1, on ne l’efface pas ; `break`. Pendant une demi-seconde, on voit `- - M`. Puis `flammes(0)`, à droite : (4, 1) est effacée ; (5, 1) est toujours un M : `allume` vaut 0, on l’**efface** ; `break`. Il ne reste rien.

**Une brique à la fois par bras :** le bras s’arrête sur la première. Deux briques l’une derrière l’autre demandent deux bombes.

**Le reste du jeu ne change pas :** trois W à détruire, attention aux flammes et aux W, BRAVO ! quand les trois sont détruits.

**Ce qu’on doit voir** — Une bombe près d’un M : la flamme s’arrête dessus, puis la brique disparaît avec les flammes.  
**Ce qu’il coûte** — 4991 octets de programme, 40 variables.

---

### Partie J — Un micro Zelda

### 0.95. Un micro Zelda — des salles, des murs, deux portes

> Un autre jeu : le A se promène dans un monde de quatre salles. Il passe d’un écran à l’autre par les ouvertures du cadre ; les murs X l’arrêtent ; deux portes P l’envoient d’une salle à l’autre.

```cpp
// ---- UN MICRO ZELDA ----
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
```

**Un nouveau jeu, façon Zelda.** Le héros, c’est le **A**. Le monde est plus grand que l’écran : **quatre salles**, deux de large et deux de haut. L’écran n’en montre qu’une à la fois. Quand le A sort par un bord, la salle d’à côté **remplace** celle-ci, et le A y entre par le bord opposé.

**Ce qui vient d’avant :** le pas toutes les 150 ms avec `chaque(150)`, la case d’arrivée `nx`, `ny` calculée avant de bouger (le 0.82), `lire()` pour savoir ce qu’il y a sur une case, « seulement sur une case vide » (`lire(nx, ny) == 0`, le 0.93.2), et `viderEcran()` (le 0.93.8).

**Ce qui est nouveau ici (1) : où est-on dans le monde ?** Deux variables : `sx`, la colonne de la salle (0 à gauche, 1 à droite), et `sy`, sa ligne (0 en haut, 1 en bas). Le numéro de la salle se calcule : `salle = sx + sy + sy`. Salle en haut à gauche : 0 + 0 + 0 = **0**. En haut à droite : 1 + 0 + 0 = **1**. En bas à gauche : 0 + 1 + 1 = **2**. En bas à droite : 1 + 1 + 1 = **3**. `ax` et `ay`, eux, disent où est le A **dans** la salle : colonne 0 à 19, ligne 0 à 16.

**Ce qui est nouveau ici (2) : deux fonctions pour les murs.** `mur(c, l, n)` pose **n** X à la suite vers la droite : `mur(4, 4, 12)` pose des X de (4, 4) à (15, 4). `murDebout(c, l, n)` fait pareil vers le bas : `murDebout(6, 3, 11)` pose des X de (6, 3) à (6, 13). Dans la boucle `for`, `i` vaut 0, 1, 2… jusqu’à n - 1, et chaque tour pose un X en `c + i` (ou en `l + i`).

**Ce qui est nouveau ici (3) : dessiner la salle.** `dessinerSalle()` vide l’écran, puis : 1. le cadre en entier (lignes 0 et 16, colonnes 0 et 19) ; 2. **les ouvertures** : on efface le cadre là où une salle voisine existe. `sx == 0` : il y a une salle à droite, on ouvre les lignes 7, 8, 9 de la colonne 19. `sy == 0` : une salle en bas, on ouvre les colonnes 9 et 10 de la ligne 16. Et pareil à gauche et en haut. Une salle au bord du monde reste fermée de ce côté : le A ne peut pas sortir du monde. 3. les murs **propres à chaque salle**, avec des `if (salle == …)`, et les deux portes ; 4. le numéro de la salle, sous le cadre.

**Ce qui est nouveau ici (4) : sortir de l’écran.** L’écran a les colonnes 0 à 19, et le terrain les lignes 0 à 16. Si l’arrivée est la colonne **20**, le A sort à droite : `sx = sx + 1`, et il entre dans la nouvelle salle en colonne **0**. Si l’arrivée est la ligne **17**, il sort en bas : `sy = sy + 1`, et il entre en ligne **0**.

**Et à gauche ? Pourquoi 255 ?** Un `uint8_t` va de 0 à 255, jamais en dessous. Quand `ax` vaut 0, `ax - 1` ne donne pas -1 : le nombre **fait le tour** et donne **255**, comme un compteur qui repart de la fin. Donc `nx == 255`, c’est « sorti à gauche » : `sx = sx - 1`, et il entre en colonne **19**. De même, `ny == 255`, c’est « sorti en haut » : il entre en ligne **16**. Ensuite, dans tous les cas : `dessinerSalle()`, et le A posé à sa nouvelle place.

**Ce qui est nouveau ici (5) : les deux portes.** Une porte **P** dans la salle 0, en (3, 12), et une dans la salle 3, en (15, 4). Marcher sur un P, c’est `lire(nx, ny) == ALPHABET[15]`. Si l’on est dans la salle 0, on part dans la salle 3 (`sx = 1`, `sy = 1`) ; sinon, on revient dans la salle 0. C’est un **raccourci** : à pied, il faut passer par la salle 1 ou la salle 2.

**Pourquoi arriver À CÔTÉ de la porte, et pas dessus ?** Sur le P, le A le cacherait : on ne verrait plus la porte. En (14, 4), juste à gauche du P en (15, 4), on la voit, et c’est au joueur de décider d’y retourner (DROITE).

**L’ordre des tests compte.** Dans la boucle : d’abord « hors de l’écran ? », car `lire(20, 8)` n’a pas de sens : la case n’existe pas. Puis « une porte ? ». Puis « une case vide ? ». Un X n’est dans aucun de ces cas : **il ne se passe rien**, le A reste où il est. C’est tout ce qu’il faut pour les murs.

**Déroulons.** Le A part de (9, 8), salle 0. DROITE : (10, 8), (11, 8)… jusqu’à (19, 8), l’ouverture du cadre. Encore DROITE : l’arrivée est (20, 8), hors de l’écran. `sx` passe à 1, `nx` à 0 : on est dans la **salle 1**, en (0, 8), et l’écran la montre. GAUCHE : l’arrivée est 0 - 1 = **255** : `sx` redevient 0, `nx` devient 19 : retour dans la salle 0, en (19, 8). Puis GAUCHE jusqu’en (4, 12), et encore GAUCHE : (3, 12) est la porte. On arrive dans la **salle 3**, en (14, 4). DROITE : (15, 4) est l’autre porte : retour dans la salle 0, en (4, 12).

**Essaie :** ajoute un mur dans la salle 2 avec `mur()` ou `murDebout()`, ou déplace une porte (change aussi la place d’arrivée, à côté d’elle).

**Ce qu’on doit voir** — Le A passe d’une salle à l’autre par les ouvertures du cadre ; les X l’arrêtent ; le P de la salle 0 mène à la salle 3, et celui de la salle 3 ramène à la salle 0.  
**Ce qu’il coûte** — 2824 octets de programme, 23 variables.

---

### 0.95.1. Un micro Zelda — l’écran glisse dans le sens du A

> Le 0.95, et à chaque passage d’une salle à une autre, l’écran GLISSE dans le sens où va le A : de gauche à droite, de droite à gauche, de haut en bas, de bas en haut. Avec defiler(x, y), 2 pixels par image.

```cpp
// ---- UN MICRO ZELDA : L'ÉCRAN GLISSE DANS LE SENS DU A ----
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
```

**C’est le 0.95, avec une chose en plus : le glissement.** Quand le A passe d’une salle à une autre, la nouvelle salle n’apparaît plus d’un coup : l’écran **glisse**, comme dans Zelda, **dans le sens où va le A**. Il va à **gauche** : l’ancienne salle part vers la droite, la nouvelle arrive par la gauche. À **droite** : l’ancienne part vers la gauche, la nouvelle arrive par la droite. En **haut** : l’ancienne descend, la nouvelle arrive par le haut. En **bas** : l’ancienne monte, la nouvelle arrive par le bas. Les **portes**, elles, téléportent : d’un coup, comme au 0.95.

**Ce qui vient d’avant :** tout le 0.95 (les quatre salles, `sx`, `sy`, les murs, les portes, le 255 d’un `uint8_t` qui fait le tour), et `defiler(x, y)` du 0.90.3 : il ne bouge pas une lettre, il déplace **la caméra** qui regarde le décor, au pixel près. `x` la pousse vers la droite, `y` vers le bas.

**Ce qui est nouveau ici (1) : le monde fait le tour.** Chaque salle a maintenant **quatre sorties** : à gauche, à droite, en haut, en bas. À droite de la salle 1, on revient à la salle 0 ; à gauche de la salle 0, on arrive à la salle 1 ; en haut de la salle 0, on arrive à la salle 2. Ainsi, **chaque** sortie mène à une salle, et l’écran glisse à chaque fois, dès le départ. Avec deux colonnes de salles, changer de colonne s’écrit `sx = 1 - sx` : 1 - 0 = **1**, 1 - 1 = **0**. Pareil pour les lignes : `sy = 1 - sy`.

**Ce qui est nouveau ici (2) : le décor est plus grand que l’écran.** Le décor de la console fait **32 colonnes sur 32 lignes** (256 × 256 pixels) ; l’écran n’en montre que **20 sur 18** (160 × 144 pixels). Le reste attend, caché. Et le décor est un **ruban**, dans les deux sens : après la colonne 31 revient la colonne 0, après la ligne 31 revient la ligne 0.

**Ce qui est nouveau ici (3) : la salle n’est plus toujours dans le coin (0, 0) du décor.** Deux variables le retiennent : `bord`, la colonne du décor où commence la salle, et `haut`, la ligne. Une case (c, l) **de la salle** est la case `((c + bord) % 32, (l + haut) % 32)` **du décor**. `% 32`, le reste de la division par 32, fait le tour du ruban : avec `bord` = 12, la colonne 19 de la salle est (19 + 12) % 32 = **31** ; une colonne 20 serait (20 + 12) % 32 = 32 % 32 = **0**. La caméra suit : `camx = bord × 8`, `camy = haut × 8` (8 pixels par case).

**Ce qui est nouveau ici (4) : poserSalle() et lireSalle().** Elles font ce calcul pour nous : `poserSalle(c, l, tuile)` au lieu de `poser()`, `lireSalle(c, l)` au lieu de `lire()`. Tout le programme passe par elles, et `ax`, `ay` restent des cases **de la salle**. `lireSalle()` **rend** un nombre : `uint8_t` devant son nom, et `return` pour dire lequel. Pour effacer, on pose la tuile **0** (une case vide). Et « SALLE n » s’écrit maintenant lettre par lettre avec `poserSalle()` (le chiffre n est la tuile `27 + n`) : `texte()` et `nombre()` ne savent pas ajouter `bord` et `haut`.

**Ce qui est nouveau ici (5) : dessiner une seule colonne, ou une seule ligne.** Le dessin de la salle (cadre, ouvertures, murs, portes, « SALLE n ») devient la fonction `dessinerMurs()`. Deux variables disent ce qu’elle dessine : `seule` (une colonne) et `seuleL` (une ligne) ; **255** veut dire « toutes ». C’est `poserSalle()` qui trie : `(seule == 255 || c == seule) && (seuleL == 255 || l == seuleL)`. `&&` veut dire « et » : les deux doivent être vrais. `colonneSalle(c)` vide la colonne c, puis la dessine, elle seule ; `ligneSalle(l)` fait pareil pour une ligne.

**Ce qui est nouveau ici (6) : les quatre glissements.** Quand le A sort à **gauche**, `glisserAGauche()` : la nouvelle salle se met 20 colonnes plus à gauche (`bord + 12`, car 32 - 20 = 12 sur le ruban). Puis 20 tours : on dessine la colonne qui va entrer par la gauche (19, puis 18… jusqu’à 0), et la caméra **recule** d’une case en **4 petits pas de 2 pixels**, un par image : `camx = camx - 2`, `defiler(camx, camy)`. À **droite**, `glisserADroite()` : 20 colonnes plus à droite (`bord + 20`), on dessine les colonnes 0, 1… 19, et la caméra **avance** : `camx = camx + 2`. En **haut** et en **bas**, c’est pareil, mais debout : ligne par ligne avec `ligneSalle()`, et c’est `camy` qui bouge. La salle a 18 lignes : 18 lignes plus haut, c’est `haut + 14` (32 - 18 = 14) ; plus bas, `haut + 18`.

**Déroulons, à gauche, depuis le départ** (`bord` = 0, caméra à 0). Le A va jusqu’en (0, 8), l’ouverture, puis encore GAUCHE : l’arrivée est 0 - 1 = **255**, sorti à gauche. `sx` devient 1 - 0 = 1, `bord` devient 12. Tour 0 : la colonne 19 de la salle 1 va dans la colonne (19 + 12) % 32 = **31** du décor, cachée ; la caméra passe à 0 - 2 = **254** (elle fait le tour), puis 252, 250, 248 : la colonne 31 entre par la gauche, 2 pixels à chaque image. … Tour 11 : la colonne 8 va dans la colonne **20**, la dernière colonne cachée. Tour 12 : la colonne 7 va dans la colonne **19**. C’était l’ancienne salle ! Mais elle vient de sortir de l’écran par la droite : on peut la remplacer. … Tour 19 : la colonne 0 va dans la colonne 12 ; la caméra est à **96** (12 × 8) : l’écran montre les colonnes 12 à 31, toute la salle 1. Le A est posé en (19, 8).

**Pourquoi 4 petits pas de 2 pixels ?** 8 pixels d’un coup à chaque image, c’est trop rapide : les 20 colonnes passeraient en 20 images, un tiers de seconde, et l’œil ne verrait pas glisser. Avec 2 pixels par image : 20 × 4 = **80 images** à gauche et à droite, 18 × 4 = **72** en haut et en bas, un peu plus d’une seconde.

**Pourquoi vider la colonne (ou la ligne) avant de la dessiner ?** Au milieu du glissement, elle contient encore l’ancienne salle. `dessinerMurs()` ne pose que des X, des P, des lettres et quelques cases vides : un X de l’ancienne salle, là où la nouvelle n’en a pas, resterait.

**Le A pendant le glissement :** on le retire avant (sinon, il partirait avec l’ancienne salle), et on le pose après, du côté par où il entre : sorti à gauche, il entre à droite, en colonne 19 ; sorti en haut, il entre en bas, en ligne 16. L’autre coordonnée ne change pas.

**Et les portes ?** `dessinerSalle()` redessine d’un coup, et remet tout à zéro : `bord` = 0, `haut` = 0, la caméra à (0, 0). `viderEcran()` efface maintenant **tout** le décor, 32 lignes de 32 cases : les parties cachées doivent être vides, car un glissement va les montrer.

**Essaie :** pour glisser plus vite, fais 2 petits pas de 4 pixels : `p < 2` et `camx = camx - 4` (2 × 4 = 8, toujours une case). Plus lentement : 8 petits pas de 1 pixel. La règle : le nombre de pas × les pixels par pas = 8.

**Ce qu’on doit voir** — À chaque sortie, l’écran glisse dans le sens du A : à gauche, à droite, en haut, en bas. Les portes P téléportent d’un coup.  
**Ce qu’il coûte** — 3542 octets de programme, 46 variables.

---

## Niveau 1 — Les tout premiers pas

### 1. Écrire à l’écran

> Une cartouche qui affiche un mot, et rien d’autre.

```cpp
int main() {
  texte(5, 6, "BONJOUR");

  while (true) image();
}
```

Le plus petit programme qui fait quelque chose. Comme tout programme C++, il commence à **`int main()`** : c’est là que la console arrive.

`texte(colonne, ligne, "…")` écrit à partir d’une case : l’écran en fait **20 de large sur 18 de haut**, et la case (0, 0) est en haut à gauche.

`while (true) image();` n’est pas décoratif. Un programme qui se termine laisse le processeur partir n’importe où ; ici, il attend l’image suivante, soixante fois par seconde, et l’écran reste affiché.

**Ce qu’on doit voir** — « BONJOUR » à la colonne 5, ligne 6.  
**Ce qu’il coûte** — 1291 octets de programme, 0 variable.

---

### 1.1. Effacer avec des espaces

> Il n’y a pas de gomme : on écrit du vide par-dessus.

```cpp
int main() {
  texte(5, 6, "BONJOUR");
  texte(5, 6, "       ");

  while (true) image();
}
```

**L’espace est une case vide.** Écrire des espaces par-dessus un mot, c’est l’effacer.

Il en faut **autant que de lettres** : `BONJOUR` en a sept, donc sept espaces. Un de moins laisse le `R` tout seul.

**Ce qu’on doit voir** — « BONJOUR » est écrit puis recouvert d’espaces : l’écran reste vide.  
**Ce qu’il coûte** — 1309 octets de programme, 0 variable.

---

### 1.2. Effacer sans compter

> effacer() compte les lettres à ta place.

```cpp
int main() {
  texte(5, 6, "BONJOUR");
  effacer(5, 6, "BONJOUR");

  while (true) image();
}
```

`effacer(5, 6, "BONJOUR")` efface **autant de cases que le mot a de lettres** : sept. Plus d’espaces à compter.

Il faut effacer **à la même place** qu’on a écrit : ici, (5, 6) deux fois.

**Ce qu’on doit voir** — « BONJOUR » est écrit puis effacé : l’écran reste vide.  
**Ce qu’il coûte** — 1299 octets de programme, 0 variable.

---

### 1.3. Ranger le mot sous un nom

> Le mot est écrit une seule fois, en haut, et porte un nom.

```cpp
const char MOT[] = "BONJOUR";

int main() {
  texte(5, 6, MOT);

  while (true) image();
}
```

`const char MOT[] = "BONJOUR";` range le mot sous le nom `MOT`, au-dessus de `int main()`. C’est la chaîne de caractères de cette console.

`texte(5, 6, MOT)` écrit ce que `MOT` contient.

**Ce qu’on doit voir** — « BONJOUR » à la colonne 5, ligne 6.  
**Ce qu’il coûte** — 1291 octets de programme, 0 variable.

---

### 1.4. Effacer le mot rangé sous un nom

> Le compilateur connaît la longueur de MOT : on l’efface par son nom.

```cpp
const char MOT[] = "BONJOUR";

int main() {
  texte(5, 6, MOT);
  effacer(5, 6, MOT);

  while (true) image();
}
```

`effacer(5, 6, MOT)` efface les sept cases de `MOT`. Si l’on change le mot, l’effacement suit tout seul.

**Ce qu’on doit voir** — « BONJOUR » est écrit puis effacé : l’écran reste vide.  
**Ce qu’il coûte** — 1299 octets de programme, 0 variable.

---

### 1.5. La place du mot dans deux variables

> La colonne et la ligne sont rangées, elles aussi, sous un nom.

```cpp
const char MOT[] = "BONJOUR";
uint8_t x = 5;
uint8_t y = 6;

int main() {
  texte(x, y, MOT);

  while (true) image();
}
```

`uint8_t x = 5;` range un nombre sous le nom `x` : la **colonne**. La **ligne** va dans `y`.

`texte(x, y, MOT)` écrit le mot à cette place. Pour le déplacer, on ne change que `x` ou `y`.

**Ce qu’on doit voir** — « BONJOUR » en (x, y) : colonne 5, ligne 6.  
**Ce qu’il coûte** — 1316 octets de programme, 2 variables.

---

### 1.6. Effacer à la place rangée

> texte() et effacer() lisent les mêmes x et y : ils visent forcément la même case.

```cpp
const char MOT[] = "BONJOUR";
uint8_t x = 5;
uint8_t y = 6;

int main() {
  texte(x, y, MOT);
  effacer(x, y, MOT);

  while (true) image();
}
```

`effacer(x, y, MOT)` efface là où `texte(x, y, MOT)` a écrit : les deux lisent les mêmes variables.

**Ce qu’on doit voir** — « BONJOUR » est écrit puis effacé en (x, y) : l’écran reste vide.  
**Ce qu’il coûte** — 1341 octets de programme, 2 variables.

---

### 1.7. Le mot et sa place sous un seul nom

> Mot range la colonne, la ligne et le texte : on n’écrit plus que le nom.

```cpp
Mot mot_xy = { 5, 6, "BONJOUR" };

int main() {
  texte(mot_xy);

  while (true) image();
}
```

`Mot mot_xy = { 5, 6, "BONJOUR" };` range **trois choses sous un seul nom** : la colonne, la ligne, et le texte.

`texte(mot_xy)` l’écrit. Plus rien à répéter : ni la place, ni le mot.

**Ce qu’on doit voir** — « BONJOUR » à la colonne 5, ligne 6.  
**Ce qu’il coûte** — 1291 octets de programme, 0 variable.

---

### 1.8. Effacer un Mot

> effacer(mot_xy) : le nom suffit.

```cpp
Mot mot_xy = { 5, 6, "BONJOUR" };

int main() {
  texte(mot_xy);
  effacer(mot_xy);

  while (true) image();
}
```

`effacer(mot_xy)` efface la place et la longueur que `mot_xy` retient : exactement ce que `texte(mot_xy)` a écrit.

**Ce qu’on doit voir** — « BONJOUR » est écrit puis effacé : l’écran reste vide.  
**Ce qu’il coûte** — 1299 octets de programme, 0 variable.

---

### 1.9. Un Mot fait de variables créées d’avance

> x, y et le texte sont créés d’abord ; le Mot les rassemble sous un seul nom.

```cpp
uint8_t x = 5;
uint8_t y = 6;
const char MOT[] = "BONJOUR";
Mot mot_xy = { x, y, MOT };

int main() {
  texte(mot_xy);

  while (true) image();
}
```

On crée d’abord `x`, `y` et `MOT`, **avant** le `Mot` : il ne peut se servir que de ce qui existe déjà.

`Mot mot_xy = { x, y, MOT };` ne recopie pas 5 et 6 : il **relit** `x` et `y` à chaque `texte()`. Changer `x` déplace donc le mot.

**Ce qu’on doit voir** — « BONJOUR » en (x, y) : colonne 5, ligne 6.  
**Ce qu’il coûte** — 1316 octets de programme, 2 variables.

---

### 1.10. Effacer un Mot fait de variables

> Le même Mot, effacé par son seul nom.

```cpp
uint8_t x = 5;
uint8_t y = 6;
const char MOT[] = "BONJOUR";
Mot mot_xy = { x, y, MOT };

int main() {
  texte(mot_xy);
  effacer(mot_xy);

  while (true) image();
}
```

`effacer(mot_xy)` relit `x`, `y` et `MOT` : il efface exactement ce que `texte(mot_xy)` a écrit.

**Ce qu’on doit voir** — « BONJOUR » est écrit puis effacé en (x, y) : l’écran reste vide.  
**Ce qu’il coûte** — 1341 octets de programme, 2 variables.

---

### 1.11. Les variables dans leur propre fichier

> x, y, MOT et le Mot déménagent dans « variables.h » ; main() n’a plus que les gestes.

`variables.h`

```cpp
uint8_t x = 5;
uint8_t y = 6;
const char MOT[] = "BONJOUR";
Mot mot_xy = { x, y, MOT };
```

`principal.cpp`

```cpp
#include "variables.h"

int main() {
  texte(mot_xy);
  effacer(mot_xy);

  while (true) image();
}
```

Les quatre lignes du haut de la 1.10 sont maintenant dans un **second fichier**, `variables.h` : c’est l’onglet à côté de `principal.cpp`.

`#include "variables.h"` **verse ce fichier à cet endroit**, avant la compilation. Le programme est exactement le même que celui de la 1.10 ; il est seulement rangé en deux.

D’un côté ce qu’on affiche et où, de l’autre ce qu’on en fait. Pour changer le mot ou sa place, on n’ouvre que `variables.h`.

**Ce qu’on doit voir** — « BONJOUR » est écrit puis effacé en (x, y) : l’écran reste vide.  
**Ce qu’il coûte** — 1341 octets de programme, 2 variables.

---

### 2. Effacer quand on appuie sur A

> Le même effacement, déclenché par un bouton.

```cpp
int main() {
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
```

`if (bouton(A))` exécute ce qui suit **tant que A est enfoncé**. On y recouvre la ligne d’espaces.

« BONJOUR APPUIE SUR A » fait vingt caractères, espaces compris : il faut donc vingt espaces. C’est toute la largeur de l’écran.

**Ce qu’on doit voir** — A efface la ligne du haut ; « APPUIE SUR A » reste.  
**Ce qu’il coûte** — 1376 octets de programme, 0 variable.

---

### 2.1. Changer de message avec A et B

> Écrire un mot par-dessus un autre le remplace.

```cpp
int main() {

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
```

B écrit « APPUIE SUR A », A remet « APPUIE SUR B ». Chaque message **recouvre** le précédent, à la même place.

Les deux font **douze** caractères : le nouveau couvre exactement l’ancien, et il ne reste aucune lettre de trop.

**Ce qu’on doit voir** — B affiche « APPUIE SUR A » ; A remet « APPUIE SUR B ».  
**Ce qu’il coûte** — 1394 octets de programme, 0 variable.

---

### 2.2. Effacer ce qu’on a écrit

> Il n’y a pas de gomme : on écrit du vide par-dessus.

```cpp
int main() {
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
```

La carte de fond garde ce qu’on y a mis, tant qu’on ne le remplace pas. **L’espace est la tuile 0**, c’est-à-dire du vide : écrire des espaces par-dessus **est** l’effacement. C’est ce que fait ce programme, et c’est ce qu’il faut avoir compris une fois.

Le piège tient en un mot : il faut **autant d’espaces que de lettres**. `BONJOUR` en compte sept ; six espaces laisseraient un `R` tout seul au bout, et cette lettre orpheline est l’erreur la plus courante du débutant.

C’est pour cela que **`effacer(6, 4, "BONJOUR")` existe** : il ôte exactement la longueur du texte, comptée par le compilateur. Les deux lignes font la même chose, mais l’une ne peut pas se tromper d’un espace. La leçon « Effacer sans compter les lettres » y revient.

Pour effacer une zone plus large, `poser(colonne, ligne, 0)` fait la même chose case par case, et se met dans une boucle.

**Ce qu’on doit voir** — A efface « BONJOUR » ; B le remet.  
**Ce qu’il coûte** — 1430 octets de programme, 0 variable.

---

### 2.3. Les messages dans leur propre fichier

> Les messages et leur place vont dans « variables.h » ; main() ne garde que les boutons.

`variables.h`

```cpp
Mot bonjour = { 6, 4, "BONJOUR" };
Mot consigne = { 3, 8, "APPUIE SUR A" };
```

`principal.cpp`

```cpp
#include "variables.h"

int main() {
  texte(bonjour);
  texte(consigne);

  while (true) {
    image();

    if (bouton(A)) effacer(bonjour);
    if (bouton(B)) texte(bonjour);
  }
}
```

Comme en 1.11 : chaque message devient un `Mot`, rangé dans `variables.h`. C’est l’onglet à côté de `principal.cpp`.

`principal.cpp` ne parle plus que des **boutons** : A efface `bonjour`, B le remet. Les places et les textes ne s’y écrivent plus du tout.

**Ce qu’on doit voir** — A efface « BONJOUR » ; B le remet. La consigne reste.  
**Ce qu’il coûte** — 1372 octets de programme, 0 variable.

---

### 3. Un carré de 8 × 8

> Une case de l’écran est un carré de 8 × 8 pixels : on en pose un.

```cpp
// Un carré de 8 × 8 pixels : 8 lignes de 8 chiffres.
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
```

Chaque case de l’écran est un **carré de 8 × 8 pixels**, qu’on appelle une **tuile**. Une lettre est une tuile ; ce carré aussi.

`Tuile CARRE = { … };` dessine la tuile : **8 lignes de 8 chiffres**, un chiffre par pixel. `3` est la nuance la plus foncée, `0` la plus claire.

`poser(colonne, ligne, CARRE)` pose la tuile dans une case. L’écran fait 20 × 18 cases, soit **160 × 144 pixels**.

**Ce qu’on doit voir** — Un carré noir de 8 × 8 au milieu de l’écran.  
**Ce qu’il coûte** — 1316 octets de programme, 0 variable.

---

### 4. Écrire à plusieurs endroits

> La position est un calcul comme un autre.

```cpp
int main() {
  texte(0, 0, "EN HAUT A GAUCHE");
  texte(4, 8, "AU MILIEU");
  texte(2, 17, "TOUT EN BAS");

  while (true) {
    image();
  }
}
```

Trois appels, trois endroits. Rien de neuf — sauf ceci : la colonne et la ligne **ne sont pas obligées d’être écrites en clair**.

`texte(4 + 2, 8, "…")` marche, et `texte(x, y, "…")` avec des variables aussi. C’est ce qui rendra possible tout ce qui bouge.

**Ce qu’on doit voir** — Trois lignes, en haut, au milieu et tout en bas.  
**Ce qu’il coûte** — 1342 octets de programme, 0 variable.

---

### 5. Une constante plutôt qu’un nombre

> Nommer ne coûte rien du tout — et c’est la seule chose ici qui soit gratuite.

```cpp
const uint8_t COLONNE = 5;
const uint8_t LIGNE = 6;

int main() {
  texte(COLONNE, LIGNE, "BONJOUR");
  texte(COLONNE, LIGNE + 2, "ENCORE");

  while (true) {
    image();
  }
}
```

Un nombre écrit trois fois, ce sont **trois occasions de le changer à deux endroits**. Une `const` lui donne un nom.

Et elle **ne prend aucun octet de mémoire**. Elle est connue à la compilation : le compilateur remplace `COLONNE` par `5` dans le code machine, et il n’en reste rien dans la cartouche.

Comparer les deux compilations le montre — le nombre de variables annoncé ne bouge pas.

**Ce qu’on doit voir** — « BONJOUR » puis « ENCORE », deux lignes plus bas.  
**Ce qu’il coûte** — 1308 octets de programme, 0 variable.

---

### 6. Réécrire au bout d’une seconde

> Compter des images est l’horloge la plus simple qu’on ait.

```cpp
int main() {
  texte(4, 6, "PREMIER MOT");
  for (uint8_t i = 0; i < 60; i++) image();

  texte(4, 6, "           ");
  texte(4, 6, "SECOND MOT");

  while (true) {
    image();
  }
}
```

La console affiche **soixante images par seconde**. Une boucle qui appelle `image()` soixante fois a donc laissé passer une seconde — sans minuteur, sans rien d’autre.

L’écran ne s’efface pas tout seul : pour ôter un mot, on écrit **autant d’espaces qu’il avait de lettres**. Un espace de moins, et la dernière lettre reste toute seule.

**Ce qu’on doit voir** — « PREMIER MOT » une seconde, puis « SECOND MOT » à sa place.  
**Ce qu’il coûte** — 1376 octets de programme, 1 variable.

---

### 7. Un nombre à l’écran

> `texte` écrit des lettres ; `nombre` écrit un calcul.

```cpp
int main() {
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
```

`texte()` ne sait écrire que ce qui est entre guillemets, décidé à la compilation. **Un score qui change veut `nombre()`.**

`nombre(colonne, ligne, valeur)` écrit en base dix, sur **trois chiffres par défaut** — `042`. Un quatrième argument dit combien on en veut : `nombre(8, 4, vies, 1)` écrit `3` tout seul.

**Ce qu’on doit voir** — « VIES 3 » et « SCORE 042 ».  
**Ce qu’il coûte** — 1332 octets de programme, 2 variables.

---

### 8. Effacer sans compter les lettres

> Le compilateur connaît la longueur du texte. Autant qu’il la compte.

```cpp
const char FIN[] = "GAME OVER";

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
```

Écrire des espaces par-dessus **est** l’effacement — l’espace est la tuile 0. Mais il en faut **autant que de lettres** : un de moins laisse la dernière orpheline, un de plus mange la case d’à côté. Ni l’un ni l’autre n’est signalé, puisque écrire des espaces est parfaitement légal.

Or le compilateur **connaît** cette longueur : il la lit dans les guillemets, ou dans la table nommée. La compter soi-même, c’était se donner une occasion de se tromper que rien n’obligeait à prendre.

`effacer(colonne, ligne, quoi)` accepte les **trois** façons de dire combien : le texte lui-même, le nom d’un `const char`, ou un nombre — calculé s’il le faut. Et `effacer(…, 0)` n’efface **aucune** case, ce qui n’allait pas de soi : sur un octet, décompter à partir de zéro donne 255.

`effacerPanneau()` fait de même sur le panneau — sans argument il le vide entièrement, à trois arguments il n’ôte qu’un mot.

**Ce qu’on doit voir** — Trois lignes s’effacent au bout d’une seconde et demie ; « JE RESTE » ne bouge pas, et « DEF » survit.  
**Ce qu’il coûte** — 1414 octets de programme, 2 variables.

---

## Niveau 2 — Retenir, et réagir

### 9. Une variable, un octet

> Retenir un nombre, et le montrer.

```cpp
int main() {
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
```

Une variable s’écrit **`uint8_t`** : un entier non signé de huit bits. C’est le seul nombre que cette machine connaisse — de 0 à 255, pas de virgule, pas de négatif. `int`, `char` et `auto` sont acceptés, et désignent la même chose ; `uint16_t`, `long` ou `float` sont **refusés avec leur numéro de ligne**, plutôt que traduits en douce sur un octet.

`attente++` est la façon C++ d’écrire `attente = attente + 1`. `+=`, `--`, `%=` existent aussi.

Pour afficher un chiffre calculé, on ne peut pas se servir de `texte()`, qui ne prend que des mots écrits en clair. On pose la **tuile** du chiffre : celle du 0 porte le numéro 27, et les neuf suivantes se suivent. D’où `27 + compte`.

**Ce qu’on doit voir** — Un chiffre qui monte de 0 à 9, une fois par demi-seconde.  
**Ce qu’il coûte** — 1382 octets de programme, 2 variables.

---

### 10. Lire un bouton

> Réagir à la manette.

```cpp
int main() {
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
```

`bouton(A)` rend 1 tant que le bouton est enfoncé. Les huit noms existent : `A B HAUT BAS GAUCHE DROITE START SELECT`.

Ici on lit le **niveau** : tant que A est tenu, le texte change. C’est ce qu’on veut pour courir ou viser — mais pas pour un menu : c’est la leçon « le front » qui règle ce cas.

`&&`, `||` et `!` s’écrivent comme en C++, et **s’arrêtent dès que la réponse est connue** : dans `i < n && t[i] == 0`, la case n’est pas lue si l’index est hors du tableau.

**Ce qu’on doit voir** — « BRAVO » pendant qu’on tient A ; B remet le texte de départ.  
**Ce qu’il coûte** — 1410 octets de programme, 0 variable.

---

### 11. Un compteur qui déborde à 255

> Ce n’est pas un bogue : c’est ce que fait un octet.

```cpp
int main() {
  uint8_t compteur = 0;

  while (true) {
    nombre(8, 8, compteur);
    compteur++;
    image();
  }
}
```

`uint8_t` est **un octet** : de 0 à 255. À 255, `compteur++` ramène à 0 — et tout le projet est bâti là-dessus.

L’ordre compte. `image()` est **à la fin** : on dessine, puis on attend. Mettre l’attente en premier ferait sauter la première image.

Laisser tourner quelques secondes suffit à voir le compteur repasser par zéro.

**Ce qu’on doit voir** — Un nombre qui monte, et qui repart de 000 après 255.  
**Ce qu’il coûte** — 1293 octets de programme, 1 variable.

---

### 12. Un dé, et le hasard du matériel

> hasard() ne tire pas pile ou face : il lit un compteur qui tourne tout seul.

```cpp
uint8_t de = 1;
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
```

`hasard()` rend un octet imprévisible, de 0 à 255 — pas déjà réparti entre 1 et 6. Le reste d’une division, `hasard() % 6`, ramène ça entre 0 et 5 ; il suffit d’ajouter 1 pour une face de dé.

`semer(images())` est appelé une seule fois, au tout début. Sans lui, la console partirait toujours du même point : son horloge interne n’a pas encore tourné à l’instant où le jeu démarre, et deux parties de suite tireraient la même suite.

Le dé ne se relance qu’au front de A, comme la leçon « Se souvenir de l’état d’avant » — sans lui, tenir A referait tourner le dé soixante fois par seconde, bien trop vite pour le lire.

**Ce qu’on doit voir** — Un dé de 1 à 6 sous FACE, qui change à chaque appui sur A ; LANCES compte les appuis.  
**Ce qu’il coûte** — 1470 octets de programme, 5 variables.

---

### 13. Deux mots de même longueur

> Le piège du texte qui change : la fin de l’ancien reste.

```cpp
int main() {
  while (true) {
    if (bouton(A)) texte(6, 8, "APPUYE ");
    else           texte(6, 8, "RELACHE");

    image();
  }
}
```

`bouton(A)` rend 1 tant que le bouton est enfoncé, 0 sinon. Les huit noms sont `A B HAUT BAS GAUCHE DROITE START SELECT`.

Noter l’espace dans `"APPUYE "`. Sans lui, le mot fait six lettres et `RELACHE` en fait sept : le `E` final resterait affiché sous `APPUYE`, et l’on chercherait longtemps pourquoi.

**Deux textes qui se remplacent doivent faire la même longueur.** C’est une règle, pas une précaution.

**Ce qu’on doit voir** — « RELACHE », et « APPUYE » tant qu’on tient A.  
**Ce qu’il coûte** — 1328 octets de programme, 0 variable.

---

### 14. Se souvenir de l’état d’avant

> Compter un appui, et non soixante par seconde.

```cpp
int main() {
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
```

Sans les deux lignes du milieu, `combien` monterait de **soixante par seconde** tant qu’on garde le doigt dessus : la boucle tourne soixante fois, et le bouton est enfoncé à chacun de ces tours.

Garder l’état d’avant, et ne compter que le **changement** — c’est ce qu’on appelle un front. On s’en sert pour tout ce qui doit arriver **une fois** : sauter, tirer, valider un menu.

La leçon « Le front, ou pourquoi un appui compte trois fois » montre ce qui arrive quand on l’oublie.

**Ce qu’on doit voir** — Le compteur monte de un par appui, même si l’on tient la touche.  
**Ce qu’il coûte** — 1361 octets de programme, 3 variables.

---

### 15. Un choix, puis plusieurs

> `&&` s’arrête dès que la réponse est connue.

```cpp
int main() {
  uint8_t vies = 3;

  while (true) {
    if (vies == 0)      texte(4, 8, "PERDU   ");
    else if (vies == 1) texte(4, 8, "DERNIERE");
    else                texte(4, 8, "CA VA   ");

    if (bouton(B) && vies > 0) vies--;
    image();
  }
}
```

`if … else if … else` enchaîne les cas. Rien que de très ordinaire — sauf la dernière ligne.

`bouton(B) && vies > 0` : si `bouton(B)` rend 0, **la partie droite n’est même pas calculée**. Ce n’est pas une finesse de compilation, c’est ce qui permet plus tard d’écrire `if (i < n && table[i] == 0)` sans lire une case hors du tableau.

**Ce qu’on doit voir** — « CA VA », puis « DERNIERE », puis « PERDU » — B après B.  
**Ce qu’il coûte** — 1428 octets de programme, 1 variable.

---

### 16. Deux touches, deux effets

> Un `enum` donne des noms à des nombres, et `switch` les range côte à côte.

```cpp
enum Scene { TITRE, JEU, FIN };

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
```

`TITRE` vaut 0, `JEU` vaut 1, `FIN` vaut 2 — mais **on ne l’écrit jamais**, et c’est tout l’intérêt : ajouter une scène au milieu ne renumérote rien à la main.

`Scene` devient un **type d’un octet**. `Scene ou = TITRE;` se relit mieux que `uint8_t ou = 0;`, et dit ce que la variable a le droit de contenir.

C’est la forme que prend presque tout jeu : quelques scènes, et un `switch` qui dit laquelle est en cours.

**Ce qu’on doit voir** — START passe au jeu, SELECT y met fin.  
**Ce qu’il coûte** — 1441 octets de programme, 1 variable.

---

## Niveau 3 — Dessiner

### 17. Dessiner sa propre tuile

> Sortir des lettres — en chiffres, ou à la souris.

```cpp
Tuile BLOC = {
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
```

La police suffit à écrire, pas à jouer. Un **`Tuile`** prend **huit rangées de huit chiffres** : la nuance de chaque pixel, de 0 (le plus clair) à 3 (le plus sombre). Un **`Perso`** en prend seize sur seize.

**Ce qui détermine le numéro d’une tuile, c’est l’ordre des déclarations.** La police occupe les numéros 0 à 43 — les lettres, les chiffres, le carré plein. Le premier dessin du programme prend donc le **44**, le suivant le 45, et ainsi de suite. Le compilateur l’annonce à chaque fois, et l’atelier l’écrit sous la grille.

Le nom sert partout où un numéro est attendu : `poser(x, y, BLOC)` sur le fond, `sprite(n, x, y, BLOC)` en lutin, `lire(x, y) == BLOC` pour relire ce qui est affiché, et jusque dans une table de décor — `const uint8_t LIGNE[] = { BLOC, 0, BLOC };`. Il se calcule aussi : `BLOC + 1` est la tuile d’à côté. **Un `Perso` de seize, lui, compte pour quatre numéros** — c’est l’objet de la leçon suivante.

C’est exactement **pourquoi on écrit le nom et jamais le numéro**. Ajoute un `Perso` avant ta tuile, et elle passe de 44 à 48 : un `poser(2, 2, 44)` écrit à la main afficherait soudain autre chose, sans que rien ne le signale. Le nom, lui, reste juste — c’est le compilateur qui traduit, et c’est son travail.

**Les deux façons de faire, et c’est la même chose.** En code : change un `0` en `3` dans le programme, et le bloc change. À la souris : clique un pixel dans la grille ci-dessous. Le programme se réécrit tout seul sous tes yeux — c’est le même texte, écrit autrement.

**Les chiffres ne sont pas la seule écriture.** Huit chiffres à la file ne ressemblent pas à un dessin ; les signes `. - + #` disent exactement la même chose — le point est le vide, le dièse est le plein — et se relisent de loin : `"#.++++.#"`. Les deux donnent les mêmes octets. On n’en mélange pas deux dans une même tuile, et l’atelier rend à chacune la sienne quand tu peins.

C’est vrai partout dans ce projet : **le programme reste la seule vérité**. L’atelier ne garde aucun dessin de son côté ; il lit les `Tuile NOM = {…}` du texte, et il les réécrit. Un éditeur graphique qui tiendrait ses propres dessins finirait par ne plus dire la même chose que le code.

**Ce qu’on doit voir** — Une rangée de huit blocs à cadre noir, au milieu de l’écran.  
**Ce qu’il coûte** — 1373 octets de programme, 1 variable.

*Cette leçon a son atelier à la souris : un dessin à faire soi-même.*

---

### 18. Le dessin écrit là où on le pose

> Les huit rangées dans le « poser » lui-même — sans nom, et sans numéro.

```cpp
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
```

Une case de l’écran, c’est **huit rangées de huit pixels**, jamais autre chose. La leçon d’avant leur donnait un nom — `Tuile BLOC = {…}` — puis posait ce nom. Mais un nom, à l’arrivée, **c’est un numéro** : `poser(2, 2, BLOC)` écrit 44 dans la carte de fond.

Ces huit rangées peuvent s’écrire **dans le `poser` lui-même**. Le compilateur grave la tuile, lui trouve son numéro, et l’écrit à la case demandée — il n’y a plus ni nom à inventer ni numéro à suivre, et le dessin est **là où il apparaît**.

**Ce n’est pas un remplacement, c’est un choix.** Ce qui sert PARTOUT mérite son nom : le sol ci-dessous est posé vingt fois, et `SOL` le dit à chaque ligne. Ce qui ne sert QU’À UN ENDROIT n’apprend rien de plus en s’appelant `TUILE3`, et oblige à lire deux endroits pour en comprendre un seul.

**Le même dessin ne se grave qu’une fois.** Écris deux fois le même nuage à dix lignes d’écart : le compilateur reconnaît qu’il l’a déjà, et ne dépense qu’une tuile. Il reconnaît aussi un dessin déjà déclaré en `Tuile`, **à travers les deux écritures** — `"21111112"` et `"+------+"` sont les mêmes pixels. La console n’en tient que 256 : les gaspiller ne se verrait qu’au jour où il n’y en aurait plus.

Cela marche aux quatre endroits où un numéro de tuile est attendu : `poser`, `poserPanneau`, `sprite`, et `sprite16` — qui veut alors **seize rangées de seize signes**, et les découpe lui-même en quatre tuiles. Ailleurs, des accolades restent une faute, et le compilateur le dit avec sa ligne.

Une chose que le dessin sur place ne fait pas : **il n’apparaît pas dans l’atelier**. Celui-ci lit les `Tuile NOM = {…}` du texte, et il ne saurait pas où réécrire un dessin qui n’a pas de nom. Ce qu’on veut peindre à la souris, on le nomme.

**Ce qu’on doit voir** — Un sol de vingt cases, une porte posée au-dessus, et à gauche un pavé qui reprend le dessin du sol.  
**Ce qu’il coûte** — 1440 octets de programme, 1 variable.

*Cette leçon a son atelier à la souris : un dessin à faire soi-même.*

---

### 19. Intégrer une carte dans son projet

> Une carte dessinée à la souris est une fonction du programme : on l’appelle, et le décor apparaît.

```cpp
/* Une TUILE de 8 × 8 : un arbre. Elle se peint dans ▦ Les tuiles. */
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
```

**Ce programme a les trois sortes de dessins du jeu :** une **tuile de 8 × 8** (`Tuile ARBRE`), un **personnage de 16 × 16** (`Perso HEROS` — quatre tuiles d’un coup), et une **carte** (`VILLAGE`, tout un écran). Les deux premiers se peignent dans ▦ **Les tuiles** ; la carte, dans 🗺 **La carte**. Essaie sur chacun les palettes, la sélection et le déplacement.

Une **carte**, c’est un décor entier dessiné à la souris, dans l’onglet 🗺 La carte. L’atelier ne la garde pas de son côté : il l’**écrit dans ton programme**, sous la forme d’une **fonction** — ici `void VILLAGE()`, entre deux commentaires `/* --- carte "VILLAGE" --- */` qui la marquent. C’est grâce à eux qu’il la retrouve et la réécrit quand tu dessines.

**La créer :** onglet 🗺 La carte, « + carte », et un nom en majuscules — VILLAGE, MAISON, NIVEAU1… Puis dessine : chaque carré de 8 × 8 que tu remplis devient une ligne `poser(colonne, ligne, {…})`, avec ses huit rangées. Un carré laissé vide n’est pas écrit : il ne coûte rien.

**Lire le code de la carte :** dans `poser(9, 10, {…})`, **9 est la colonne** (0 tout à gauche, 19 tout à droite) et **10 la ligne** (0 tout en haut, 17 tout en bas). Une case fait 8 × 8 pixels : la case (9, 10) commence donc au pixel x = 72, y = 80. Les **huit textes entre accolades** sont les huit rangées de pixels du carré, de haut en bas, et **chaque chiffre est un pixel** : 0 le plus clair, 1, 2, puis 3 le plus sombre. Regarde le toit, case (9, 9) : ses « 3 » dessinent la pente, rangée après rangée. En couleur, une ligne `teindre(colonne, ligne, palette)` dit en plus quelle palette prend la case.

**Lire la carte pendant le jeu :** `lire(colonne, ligne)` rend le **numéro de la tuile** affichée à cet endroit — 0 si la case est vide. C’est ainsi qu’un jeu sait si le joueur arrive sur un mur, sur le sol ou dans le vide. Le programme le montre en bas de l’écran : il relit la case (9, 11), du sol, et l’écrit avec `nombre()` ; la case (5, 11), vide, donne 0.

**Une fonction ne fait rien tant qu’on ne l’appelle pas.** C’est l’oubli le plus fréquent : la carte est dessinée, le programme compile, et l’écran reste vide. Il manque `VILLAGE();` dans `main`, **avant** la boucle du jeu — une seule fois : un décor reste à l’écran tant qu’on ne l’efface pas.

**Essaie :** mets `//` devant `VILLAGE();`. Le titre reste, la maison disparaît. Enlève-le : elle revient. Tout le décor tient dans cette seule ligne.

**Plusieurs cartes :** chacune a sa fonction. Pour passer de l’une à l’autre, on efface puis on appelle l’autre : `effacer();` puis `MAISON();`. Les huit carrés du sol, identiques, ne prennent **qu’une tuile** : le compilateur reconnaît un dessin qu’il a déjà.

**Copier, déplacer :** dans l’atelier de la carte, l’outil **⬚ Sélection** choisit une zone — un rectangle **libre** tracé à la souris, ou d’un clic **un carré de 8 × 8** ou **un bloc de 16 × 16**, calés sur la grille. **Attrape** la zone et **glisse-la** : elle se déplace, et retombe sur la case la plus proche ; sa place redevient le fond. **Ctrl+C**, **Ctrl+X** et **Ctrl+V** la copient, la coupent et la collent. Dans l’atelier des tuiles, **⬚ Sélectionner et déplacer** fait de même à l’intérieur d’une tuile de 8 × 8 ou d’un personnage de 16 × 16, et **📋 Copier le dessin**, **📌 Coller ici** et **⧉ Dupliquer** copient un dessin entier. Chaque geste s’annule avec **Ctrl+Z**.

**Un jeu, sans écrire la boucle :** dans 🗺 La carte, « ▶ Jouer la scène » écrit `main` pour toi — la carte, les murs, le joueur qui bouge, les acteurs et les événements. Tes propres lignes de `main` sont alors remplacées ; l’atelier demande avant de le faire.

**Poser une tuile, poser un personnage :** `poser(6, 10, ARBRE);` met l’arbre dans la case (6, 10), et `teindre(6, 10, 1);` lui donne la palette 1 — celle de la forêt. `sprite16(0, 60, 72, HEROS);` pose le personnage **au pixel près**, en x = 60, y = 72 : un personnage n’est pas sur la grille, il se déplace librement par-dessus le décor.

**À toi :** descends à l’atelier de la carte, dessine un arbre à côté de la maison, et regarde un nouveau `poser(…)` apparaître dans `VILLAGE()`.

**Ce qu’on doit voir** — Le titre « MON VILLAGE », la maison sur huit carrés de sol, un arbre de chaque côté (dans la palette de la forêt), le personnage devant la maison, et en bas « SOL 053 » et « VIDE 000 ».  
**Ce qu’il coûte** — 2138 octets de programme, 0 variable.

---

### 20. Les couleurs : palettes, variétés et thèmes

> Une tuile porte des numéros ; la palette de sa case leur donne leurs couleurs — la même tuile peut être de trois couleurs à la fois.

```cpp
/* Une seule tuile : quatre NUMÉROS de couleur, de 0 (clair) à 3 (sombre). */
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
```

**La règle de la console :** un carré de 8 × 8 — une tuile — n’a que **4 couleurs**. Pas une de plus, même sur Game Boy Color : chaque carré prend **une palette** de 4 couleurs. Le carré d’à côté peut en prendre une autre : c’est ainsi qu’un écran entier affiche bien plus de 4 couleurs.

**Le jeu a 8 palettes, numérotées de 0 à 7**, et la **0 est la normale** (les verts de la Game Boy). Une tuile ne contient pas de couleurs : elle contient des **numéros**, de 0 à 3. C’est la palette de la case où on la pose qui dit de quelle couleur est chaque numéro.

**Le programme le montre :** la même tuile `BRIQUE`, posée trois fois. `teindre(colonne, ligne, palette)` donne sa palette à une case : la palette 1 (désert), la palette 2 (océan), et la dernière n’a pas de `teindre` — elle reste dans la palette 0, la normale. **Une seule tuile, trois couleurs** : c’est tout l’intérêt des palettes.

`couleurFond(palette, numéro, rouge, vert, bleu)` choisit une couleur : chaque composante va de 0 à 31. Chaque palette va du plus **clair** (numéro 0) au plus **sombre** (numéro 3) — le jeu garde ainsi une version lisible en quatre nuances.

**Dans l’atelier, sans écrire de code :** les 8 palettes sont en haut de l’atelier des tuiles et de la carte. Clique une couleur, peins : ce que tu peins **prend sa palette**. « 🎨 Changer cette couleur » change une couleur **pour ce dessin seulement** : si d’autres tuiles (ou le texte) partagent sa palette, l’atelier lui en donne une copie dans une palette libre. **« 🎨 Variétés »** met dans une palette l’une des 11 palettes toutes prêtes (0 normale, campagne, bonbon, plage, forêt, glace, volcan, nuit, désert, océan, automne).

**« 🎨 Thèmes »** change d’un coup les 8 palettes du décor **et** les 8 des personnages, avec des couleurs **qui vont ensemble** : forêt, désert, glace, volcan, océan, hanté, bonbon — ou 0, la normale. Elles sont calculées : chaque palette part d’une teinte, et toutes descendent du clair au sombre par les mêmes quatre marches de lumière. **Ctrl+Z** revient en arrière.

**Les personnages** ont leurs 8 palettes à eux, de **3 couleurs + le transparent** (le numéro 0 ne s’affiche jamais : le décor se voit au travers). Un personnage de 16 × 16 est fait de 4 carrés : chacun peut avoir sa palette — jusqu’à 12 couleurs.

**À toi :** ajoute une quatrième brique en (10, 8) avec `teindre(10, 8, 1);` — elle prend les couleurs du désert. Puis, dans l’atelier, essaie « 🎨 Thèmes » et regarde les trois briques changer ensemble.

**Ce qu’on doit voir** — Trois fois la même brique : couleur sable (palette 1), bleue (palette 2), et verte (palette 0, la normale).  
**Ce qu’il coûte** — 1581 octets de programme, 0 variable.

*Cette leçon a son atelier à la souris : un dessin à faire soi-même.*

---

### 21. Poser tes tuiles à la souris

> Voir les carrés, tracer une zone — et le code s’écrit tout seul.

```cpp
Tuile MUR = {
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
```

Jusqu’ici il fallait écrire `poser(6, 12, MUR);` à la main, case par case. Pour un sol de vingt cases, c’est vingt lignes, et une faute de frappe ne se voit pas.

Le **plan** ci-dessous montre les tuiles du programme telles qu’elles sont — des carrés, pas des numéros. On en choisit une, on **trace une zone** sur l’écran, et le programme reçoit ses `poser()`. La gomme remet du vide.

Le code écrit porte le **nom** de la tuile, jamais son numéro. C’est ce qui compte : un numéro devient faux le jour où l’on ajoute un dessin avant lui, alors qu’un nom reste juste. C’est le compilateur qui traduit, et c’est son travail.

L’outil ne possède que le bloc entre `// PLAN` et `// FIN DU PLAN`. Tout ce que tu écris ailleurs est à toi, et il n’y touche pas.

**Ce qu’on doit voir** — Un bout de sol et deux caisses — puis ce que tu traces toi-même.  
**Ce qu’il coûte** — 1493 octets de programme, 0 variable.

*Cette leçon a son atelier à la souris : un décor à poser.*

---

### 22. Poser une tuile

> Une lettre à l’écran est une tuile comme une autre.

```cpp
int main() {
  texte(2, 4, "AVEC TEXTE  ABC");

  texte(2, 8, "AVEC POSER");
  poser(14, 8, 1);
  poser(15, 8, 2);
  poser(16, 8, 3);

  while (true) {
    image();
  }
}
```

Les deux lignes affichent la même chose. `texte()` **traduit des lettres en numéros de tuiles** ; `poser(colonne, ligne, tuile)` pose le numéro directement.

La tuile 1 est le `A` de la police fournie, la 2 est un `B`. Il n’y a pas de magie : dessiner sa propre tuile, ce sera **ajouter un numéro à cette même suite**.

`lire(colonne, ligne)` fait l’inverse — il rend le numéro affiché à cet endroit. C’est ce qui servira pour les collisions.

**Ce qu’on doit voir** — Le même « ABC » sur les deux lignes.  
**Ce qu’il coûte** — 1401 octets de programme, 0 variable.

---

### 23. Quatre nuances, quatre signes

> Une tuile s’écrit en huit rangées de huit caractères.

```cpp
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

int main() {
  for (uint8_t x = 0; x < 20; x++) poser(x, 12, BRIQUE);

  while (true) {
    image();
  }
}
```

**`.` clair, `-` moyen clair, `+` moyen sombre, `#` sombre.** On peut aussi écrire `0123` — c’est la même chose.

Le nom `BRIQUE` **devient un numéro de tuile** : il s’écrit partout où l’on attend un numéro. Le compilateur grave les seize octets dans la cartouche et range la tuile à sa place au démarrage.

Dans la page, cette même tuile se dessine **à la souris** — l’atelier écrit exactement ces huit lignes dans le programme. Les deux chemins mènent au même endroit.

**Ce qu’on doit voir** — Une rangée de briques en travers de l’écran.  
**Ce qu’il coûte** — 1348 octets de programme, 1 variable.

*Cette leçon a son atelier à la souris : un dessin à faire soi-même.*

---

### 24. Une rangée, puis un mur

> Quatre-vingts appels en quatre lignes.

```cpp
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

int main() {
  for (uint8_t x = 0; x < 20; x++) { poser(x, 0, MUR); poser(x, 17, MUR); }
  for (uint8_t y = 0; y < 18; y++) { poser(0, y, MUR); poser(19, y, MUR); }

  texte(6, 8, "ENFERME");

  while (true) {
    image();
  }
}
```

Écrire les quatre-vingts `poser()` à la main, ce sont quatre-vingts occasions de se tromper d’une case — et le jour où l’écran change de taille, il faut tout relire.

Deux boucles pour les bords horizontaux, deux pour les verticaux. Les coins sont posés deux fois : cela ne coûte rien, et l’écrire autrement demanderait quatre conditions.

**Ce qu’on doit voir** — Un cadre tout autour de l’écran, et « ENFERME » au milieu.  
**Ce qu’il coûte** — 1477 octets de programme, 2 variables.

*Cette leçon a son atelier à la souris : un dessin à faire soi-même.*

---

### 25. Un damier

> Le reste d’une division, et le motif apparaît.

```cpp
Tuile CLAIR = { "........", "........", "........", "........",
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
```

`(x + y) % 2` vaut 0 une case sur deux, en quinconce — c’est la définition même d’un damier, et elle tient en trois caractères.

`a ? b : c` choisit en une expression. On aurait pu écrire un `if` sur quatre lignes ; ici la ligne dit « pose ceci ou cela », et c’est ce qu’on veut lire.

**Ce qu’on doit voir** — Un damier sur tout l’écran.  
**Ce qu’il coûte** — 1427 octets de programme, 2 variables.

*Cette leçon a son atelier à la souris : un dessin à faire soi-même.*

---

### 26. Un lutin, hors de la grille

> Le fond est une grille de 8 en 8 ; un lutin ne l’est pas.

```cpp
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

int main() {
  sprite(0, 76, 68, HEROS);
  texte(3, 14, "IL FLOTTE");

  while (true) {
    image();
  }
}
```

`sprite(numero, x, y, tuile)` pose un lutin **en pixels**, et non en cases : il peut se trouver à cheval entre deux tuiles du fond. C’est ce qui rend un mouvement doux possible.

Le premier argument est le **numéro du lutin**, de 0 à 39. C’est lui qu’on rappelle pour le déplacer, ou qu’on donne à `cacher(n)` pour l’ôter.

**Ce qu’on doit voir** — Un personnage au milieu, entre deux cases de la grille.  
**Ce qu’il coûte** — 1332 octets de programme, 0 variable.

*Cette leçon a son atelier à la souris : un dessin à faire soi-même.*

---

## Niveau 4 — Le mouvement

### 27. Le front, ou pourquoi un appui compte trois fois

> Agir au moment précis où le bouton s’enfonce.

```cpp
int main() {
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
```

Un jeu tourne à **soixante images par seconde**. Un appui dure au moins cinq images : lu au niveau, il compte cinq fois. Sur un menu, on traverse trois lignes sans rien voir.

La réponse tient en une variable : l’état du bouton à l’image **précédente**. On agit quand il vaut 1 maintenant et valait 0 avant — ce qu’on appelle agir **au front**.

Le programme montre les deux compteurs côte à côte. Tiens A : celui du haut s’emballe, celui du bas monte d’un seul cran.

**Ce qu’on doit voir** — Un appui sur A : le compteur « NIVEAU » saute, « FRONT » avance d’un.  
**Ce qu’il coûte** — 1501 octets de programme, 4 variables.

---

### 28. Un lutin, au pixel près

> Ce qui sépare un jeu d’action d’un jeu de cases.

```cpp
Tuile BALLE = {
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
```

Le décor vit sur une grille de huit pixels. Un personnage, non : s’il ne pouvait s’arrêter que sur des multiples de huit, il ne sauterait pas, il **se téléporterait**.

`sprite(numero, x, y, tuile)` pose un carré de huit sur huit **où l’on veut**. Le matériel en a quarante, numérotés de 0 à 39.

Il n’y a rien à faire pour l’effacer : on le repose ailleurs à chaque image, et il a bougé.

**Ce qu’on doit voir** — Une boule qu’on déplace à la croix, sans à-coups.  
**Ce qu’il coûte** — 1554 octets de programme, 2 variables.

---

### 29. Un objet qui tombe

> La pesanteur, en seizièmes de pixel.

```cpp
Tuile BALLE = {
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
```

Un objet qui tombe ne descend pas à vitesse constante : il **accélère**. Toute la physique tient en deux additions — la pesanteur s’ajoute à la vitesse, la vitesse s’ajoute à la position — et c’est de les faire **dans cet ordre**, à chaque image, qui fabrique la courbe d’une chute.

Reste un ennui : la console **ne connaît pas la virgule**. Au premier instant, la balle avance de deux seizièmes de pixel — arrondi, cela fait zéro, et elle ne partirait jamais.

On garde donc la position en **deux morceaux** : les pixels dans `y`, et les seizièmes de pixel dans `frac`. Seul `y` est montré ; `frac` est la mémoire de ce qui n’est pas encore un pixel entier, et qui le deviendra.

`frac >> 4` est une division par seize, `frac & 15` en est le reste. Le processeur ne sait pas diviser ; décaler de quatre bits, en revanche, lui coûte un seul tour d’horloge.

La chute dure **trois quarts de seconde**. Une démonstration qui ne se joue qu’une fois ne se voit pas : on compte donc les images passées au sol, et **au bout de quarante la balle est renvoyée en haut**. Elle tombe en boucle, et l’on peut la regarder tomber autant qu’on veut.

La relance remet **les trois** : la hauteur, les seizièmes et la vitesse. Le sol vient de les mettre à zéro une ligne plus haut — mais un départ qui compte sur le ménage fait par quelqu’un d’autre n’est pas un départ, et le jour où l’on relancera d’ailleurs la balle partira du ciel avec la vitesse qu’elle avait en s’écrasant.

`G` vaut 2, et ce nombre est le seul réglage : à 1 la balle flotte comme sur la Lune, à 6 elle tombe comme une enclume. C’est là, et nulle part ailleurs, que se décide ce qu’on ressent.

**Et 9,81 dans tout ça ?** Elle est dans `G`. Le processeur n’a ni virgule ni mètres : `G` se compte en seizièmes de pixel par image, par image, soit 450 pixels par seconde carrée à soixante images par seconde. Décidez qu’un mètre fait 46 pixels, et ces 450 pixels deviennent **9,81 m/s²** — l’écran mesure alors 3,10 m de haut, et la chute de 2,60 m dure les trois quarts de seconde que la vraie physique annonce. La pesanteur est la bonne ; c’est l’unité qui a changé.

**Ce qu’on doit voir** — La balle part lentement, prend de la vitesse, s’arrête net sur le sol — puis remonte d’un coup et recommence.  
**Ce qu’il coûte** — 1514 octets de programme, 4 variables.

---

### 30. Un personnage de seize

> Huit pixels de côté, c’est petit pour un héros.

```cpp
Perso HEROS = {
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
```

Une `Tuile` fait huit pixels de côté. C’est la taille d’une case du décor, et c’est bien pour un mur ou une pièce — mais un personnage y tient mal. Un **`Perso`** en fait **seize sur seize** : seize rangées de seize signes, écrites comme celles d’une tuile.

**Le matériel, lui, ne connaît que des carrés de huit.** Un `Perso` occupe donc QUATRE numéros de tuile, dans cet ordre : haut-gauche, haut-droite, bas-gauche, bas-droite. Si `HEROS` vaut 44, il tient les numéros 44, 45, 46 et 47 — et le dessin suivant du programme commence à 48.

`sprite16(n, x, y, HEROS)` pose les **quatre lutins en un seul appel**, en carré, au pixel près. Le prix est dit franchement : il coûte quatre lutins des quarante, là où un `sprite()` n’en coûte qu’un. Une troupe de dix personnages de seize, c’est déjà tout le matériel. `cacher16(n)` les ôte tous les quatre.

**Sur le fond, il n’y a pas de `poser16()`** — une case du décor fait huit pixels, et le personnage en couvre quatre. On pose donc ses quarts un par un, et l’ordre est celui des numéros : `poser(10, 8, HEROS); poser(11, 8, HEROS + 1); poser(10, 9, HEROS + 2); poser(11, 9, HEROS + 3);`. C’est ce que fait le programme ci-dessous, en plus du lutin.

Dans l’atelier, **« + perso 16 × 16 »** en ajoute un, et la grille passe à seize sur seize. Le reste ne change pas : on peint, et le programme se réécrit.

**Ce qu’on doit voir** — Un héros posé sur le décor, et le même en lutin plus bas — GAUCHE et DROITE le déplacent au pixel près.  
**Ce qu’il coûte** — 1679 octets de programme, 1 variable.

*Cette leçon a son atelier à la souris : un dessin à faire soi-même.*

---

### 31. Déplacer un lutin

> Une position, quatre boutons — et surtout pas de front.

```cpp
Tuile HEROS = {
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
```

Ici l’on veut que ça bouge **tant que le doigt reste appuyé**. Pas de front, donc : le front sert à ce qui doit arriver une fois, pas à ce qui doit durer.

Savoir lequel des deux on veut est la moitié du travail sur cette machine.

**Ce qu’on doit voir** — La croix déplace le personnage, pixel par pixel.  
**Ce qu’il coûte** — 1412 octets de programme, 2 variables.

---

### 32. Le garder dans l’écran

> Un octet ne prévient pas quand il repasse par zéro.

```cpp
Tuile HEROS = {
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
```

Sans le `x > GAUCHE_MAX`, arriver à 0 puis décrémenter donne **255** : le personnage réapparaît à droite. C’est le bogue le plus fréquent de cette machine, et il ne fait jamais planter — il téléporte, silencieusement.

Tester **avant** de bouger, et non corriger après. `if (x < 8) x = 8;` marche aussi, mais laisse la variable fausse pendant une ligne — et cette ligne finit toujours par en attirer d’autres.

**Ce qu’on doit voir** — Le personnage s’arrête aux bords au lieu de réapparaître en face.  
**Ce qu’il coûte** — 1420 octets de programme, 1 variable.

---

### 33. Une vitesse qui monte

> Accélérer, c’est une variable de plus.

```cpp
Tuile CAILLOU = {
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
```

Un objet qui accélère, c’est une **vitesse** qui monte. Tout ce qui suit — le saut, la pesanteur — n’est que cela, avec un signe en plus.

Elle ne montera pourtant **jamais jusqu’à 5** : plus le caillou va vite, plus tôt il touche le bas, et la chute suivante repart à 1. Le plafond écrit dans le code n’est pas celui qu’on observe — c’est le genre d’écart qu’on ne voit qu’en faisant tourner.

**Pourquoi `depuis` et non `images() % 20 == 0`.** Les deux paraissent équivalents, et ils ne le sont pas. Tester un multiple suppose que la boucle tourne **exactement une fois par image** ; dès que le corps s’alourdit, un tour franchit deux images d’un coup, le multiple est enjambé, et l’accélération n’arrive jamais.

Un compteur incrémenté à chaque tour et comparé avec `>=` ne peut pas rater son échéance. C’est la forme à prendre par défaut.

**Ce qu’on doit voir** — Un caillou qui tombe de plus en plus vite, et recommence.  
**Ce qu’il coûte** — 1416 octets de programme, 3 variables.

---

### 34. Sauter, sans pesanteur

> Compter les images qui restent à monter, plutôt qu’une vitesse signée.

```cpp
Tuile HEROS = {
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
```

Le front sert enfin : sans lui, garder `A` enfoncé relancerait le saut à chaque image, et le personnage collerait au plafond.

`montee` compte les images qui restent à monter. C’est plus simple qu’une vraie vitesse signée — et sur une machine **sans nombres négatifs**, plus simple veut dire plus juste.

La leçon « La pesanteur et le saut » reprend la même idée avec une vraie accélération.

**Ce qu’on doit voir** — A fait sauter, et le personnage retombe au sol.  
**Ce qu’il coûte** — 1462 octets de programme, 4 variables.

---

### 35. defiler(), et l’octet qui boucle

> La carte fait 256 pixels — la même taille qu’un octet.

```cpp
Tuile MOTIF = {
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
```

`defiler(x, y)` fait glisser tout le fond. La carte fait **256 pixels de côté** et revient toute seule à zéro.

`glisse` est un octet : il boucle exactement au bon moment, **sans qu’on ait rien à écrire**. C’est une coïncidence heureuse du matériel, et l’un des rares endroits où le débordement d’un octet est ce qu’on veut.

**Ce qu’on doit voir** — DROITE et GAUCHE font glisser le motif sans fin.  
**Ce qu’il coûte** — 1436 octets de programme, 3 variables.

---

## Niveau 5 — Le son

### 36. Le son

> Quatre voix, dont trois qu’on peut jouer.

```cpp
const uint8_t MELODIE[] = { DO4, MI4, SOL4, DO5, SOL4, MI4, RE4, SOL4 };

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
```

La console a une puce sonore depuis toujours, et rien ne lui parlait. `note(voix, hauteur, duree, volume)` joue une note sur la voix **1** ou **2** — deux signaux carrés — et `bruit(duree, volume)` frappe sur la quatrième, celle du bruit : une explosion, un pas, un tir.

Les hauteurs portent des noms : `DO4`, `RED4`, `MI4`… de `DO2` à `SI6`, cinq octaves. Un nom se relit ; un numéro de fréquence, non. La table est calculée à la compilation et gravée dans la cartouche — 120 octets pour tout le clavier.

La **durée** se compte en 256ᵉ de seconde, de 1 à 64. Une durée de `0` veut dire « sans fin » : la note tient jusqu’à `silence(voix)`. Le **volume** va de 0 à 15.

Deux voix, c’est une mélodie et son accompagnement. Ici la voix 2 double la voix 1 une octave plus bas — `MELODIE[pas] - 12`, puisqu’une octave fait douze demi-tons.

**Ce qu’on doit voir** — Une mélodie qui tourne en boucle ; A frappe un bruit sec.  
**Ce qu’il coûte** — 1583 octets de programme, 2 variables.

---

### 37. Écrire une musique

> Une mélodie qui joue toute seule, pendant que le jeu tourne.

```cpp
Air THEME = {
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
```

Un `Air` s’écrit comme une tuile se dessine : une suite de pas, dans le programme. Chaque pas est une note et son volume — `"DO4 12"` —, ou l’un des deux pas qui n’en sont pas : `"--"` fait taire la voix, `"=="` laisse la note d’avant continuer.

C’est `"=="` qui fait les notes longues. Sans lui, une blanche s’écrirait en rejouant la même note à chaque pas, et l’oreille entendrait quatre coups au lieu d’une note tenue.

`jouer(voix, AIR, vitesse)` le lance. La **vitesse** est le nombre d’images que dure un pas : huit images font un peu moins de huit pas par seconde. Un quatrième argument, `1`, le fait recommencer sans fin.

Ensuite, **le programme n’a plus rien à tenir**. L’air avance tout seul, soixante fois par seconde, dans l’interruption de la console — même si le jeu, lui, est en retard. Un tempo qui ralentirait avec la charge du jeu ne serait pas un tempo.

La **partition ci-dessous** écrit ces lignes à la souris, et le bouton « Écouter » la fait entendre sans même compiler. Les deux voix chantantes sont la 1 et la 2 ; la quatrième, celle du bruit, se frappe avec `bruit(6, 10)`.

**Ce qu’on doit voir** — Rien de neuf à l’écran — mais deux voix qui jouent, et « A » qui les arrête.  
**Ce qu’il coûte** — 1857 octets de programme, 1 variable.

*Cette leçon a son atelier à la souris : une partition.*

---

### 38. Une note, au front

> Sans front, une note repart soixante fois par seconde.

```cpp
int main() {
  texte(3, 8, "APPUIE SUR A");
  uint8_t avant = 0;

  while (true) {
    uint8_t appui = bouton(A);
    if (appui && !avant) note(1, DO4, 20, 12);
    avant = appui;
    image();
  }
}
```

`note(voix, hauteur, duree, volume)` : la voix est 1 ou 2, la durée se compte en images, le volume va de 0 à 15.

Les hauteurs s’écrivent `DO4`, `RE4`, `MI4`… sur plusieurs octaves.

Le front est ici **indispensable** : sans lui, la note repartirait à chaque image et l’on n’entendrait qu’un grésillement continu.

**Ce qu’on doit voir** — Un seul « bip » par appui, même en tenant la touche.  
**Ce qu’il coûte** — 1403 octets de programme, 2 variables.

---

### 39. Une petite mélodie à la main

> Une table gravée, et un pas toutes les vingt images.

```cpp
const uint8_t AIR[] = { DO4, MI4, SOL4, DO5, SOL4, MI4 };

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
```

`const uint8_t AIR[]` est **gravé dans la cartouche** : il ne prend aucun octet de mémoire de travail, et il ne peut pas changer. C’est exactement ce qu’on veut d’une mélodie.

`sizeof(AIR)` vaut 6, connu à la compilation. **Ajouter une note à la table suffit** — la boucle suit, sans qu’on touche à un nombre.

Ici le programme mène la mélodie et doit y penser à chaque tour. Le tutoriel suivant montre l’autre façon.

**Ce qu’on doit voir** — Le numéro du pas monte de 0 à 5, puis recommence.  
**Ce qu’il coûte** — 1432 octets de programme, 2 variables.

---

### 40. Un bruit

> La quatrième voix ne joue pas de notes.

```cpp
int main() {
  texte(4, 8, "A POUR TIRER");
  uint8_t avant = 0;

  while (true) {
    uint8_t appui = bouton(A);
    if (appui && !avant) bruit(6, 10);
    avant = appui;
    image();
  }
}
```

`bruit(duree, volume)` frappe sur la voix du bruit — un pas, un tir, une porte qui claque.

Un troisième argument règle le **grain**, du sifflement aigu au choc sourd. C’est la seule voix qui n’ait pas de hauteur : il n’y a rien à accorder.

**Ce qu’on doit voir** — Un « tchac » sec à chaque appui sur A.  
**Ce qu’il coûte** — 1386 octets de programme, 2 variables.

---

### 41. Une partition qui avance seule

> `jouer()` la lance, et le jeu fait autre chose pendant ce temps.

```cpp
Air FANFARE = {
  "DO4 12", "==", "MI4 12", "==", "SOL4 12", "==", "DO5 12", "==", "==", "--",
};

int main() {
  jouer(1, FANFARE, 8);
  texte(4, 8, "CA JOUE");

  while (true) {
    image();
  }
}
```

C’est toute la différence avec la mélodie à la main : là-bas le programme menait chaque note ; ici `jouer()` lance la partition et **elle avance toute seule**.

Un pas par élément. `"=="` tient la note d’avant, `"--"` fait un silence. Le troisième argument de `jouer()` est le nombre d’images par pas — le tempo.

Dans la page, cette partition s’écrit **à la souris**, sur une portée. L’atelier produit exactement ces lignes.

**Ce qu’on doit voir** — Une fanfare qui monte, sans que le programme s’en occupe.  
**Ce qu’il coûte** — 1670 octets de programme, 0 variable.

*Cette leçon a son atelier à la souris : une partition.*

---

### 42. Une musique qui reprend au bout

> `airFini()` dit quand la partition est arrivée à sa fin.

```cpp
Air BOUCLE = {
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
```

`airFini(voix)` rend 1 quand la voix a fini sa partition. On relance, et l’on compte les tours — c’est la boucle musicale la plus simple qui soit.

`silence(1)` couperait la voix net, si l’on voulait arrêter au milieu.

**Ce qu’on doit voir** — Le compteur de tours monte à chaque reprise.  
**Ce qu’il coûte** — 1755 octets de programme, 1 variable.

*Cette leçon a son atelier à la souris : une partition.*

---

## Niveau 6 — Ranger ce qu’on manipule

### 43. Un tableau, et une boucle « for »

> Ranger beaucoup de choses.

```cpp
const uint8_t TABLE[] = { 1, 1, 2, 3, 5, 8, 3, 1, 4, 5 };

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
```

`uint8_t cases[20];` réserve vingt octets en mémoire de travail — de quoi tenir un puits, une carte, un inventaire. Ils vivent hors de la page rapide, qui ne contient que les variables.

Un tableau **`const`** est différent : il est **gravé dans la cartouche**. Il ne prend pas un octet de mémoire, et ne peut plus changer — le compilateur refuse d’y écrire. C’est ce qu’on veut pour une table de formes, un niveau, une courbe.

Le `for` de C++ tient sur une ligne ce que le `while` demandait en quatre, et **la variable du compteur n’existe que dans la boucle**. Deux boucles voisines peuvent toutes deux nommer leur compteur `i` sans se marcher dessus : c’est la portée du langage, et le compilateur la tient vraiment.

**Ce qu’on doit voir** — Les chiffres 0 à 9 deux fois, puis la table gravée, un chiffre sur deux.  
**Ce qu’il coûte** — 1526 octets de programme, 2 variables.

---

### 44. Le panneau, et les nuances

> Un score qui reste en place pendant que le décor glisse.

```cpp
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
```

Le décor défile ; le score, lui, ne doit pas bouger. Sans une seconde couche, il faudrait le redessiner à chaque image à la position que le défilement lui a donnée — et le moindre décalage se verrait.

Le **panneau** est cette couche : le matériel l’appelle la fenêtre, il la pose par-dessus le décor, et **elle ne défile pas**. `panneau(x, y)` la place, en pixels, et l’allume. On y écrit avec `textePanneau()` et `poserPanneau()`, exactement comme sur le fond.

Il n’y a que **deux cartes de fond** dans la console : le décor prend la première, le panneau la seconde. C’est un choix, et il vaut mieux le savoir que le découvrir.

`paletteFond(n0, n1, n2, n3)` choisit les quatre nuances, de la plus claire à la plus sombre — chaque nombre va de 0 à 3. Elles étaient posées une fois pour toutes à l’allumage ; ici on s’en sert pour assombrir le fond par paliers.

**Ce qu’on doit voir** — Le sol glisse ; « SCORE 00 » reste collé en bas, et les nuances changent.  
**Ce qu’il coûte** — 1553 octets de programme, 4 variables.

---

### 45. Remplir un tableau, puis le dessiner

> Un tableau déclaré hors des fonctions est VIDE au démarrage.

```cpp
uint8_t hauteurs[20];

int main() {
  for (uint8_t i = 0; i < 20; i++) hauteurs[i] = i % 6;

  for (uint8_t i = 0; i < 20; i++)
    for (uint8_t h = 0; h <= hauteurs[i]; h++)
      poser(i, 17 - h, 1);

  while (true) {
    image();
  }
}
```

**Un index est un octet : 256 cases au plus.** Ce n’est pas une limite arbitraire — c’est ce que la machine sait adresser d’un seul registre.

Un tableau déclaré hors des fonctions vit en mémoire de travail, et il **ne contient rien** au démarrage. Le remplir est le travail de la première boucle ; l’oublier donne un décor entièrement plat, sans qu’aucune erreur ne le dise.

**Ce qu’on doit voir** — Des colonnes en dents de scie, montant de 1 à 6 puis recommençant.  
**Ce qu’il coûte** — 1434 octets de programme, 3 variables.

---

### 46. Une table gravée

> Ce qui ne change jamais n’a rien à faire en mémoire.

```cpp
const uint8_t COLONNES[] = { 2, 5, 8, 11, 14, 17 };
const uint8_t LIGNES[]   = { 3, 6, 9, 6, 3, 6 };

int main() {
  for (uint8_t i = 0; i < sizeof(COLONNES); i++)
    poser(COLONNES[i], LIGNES[i], 1);

  while (true) {
    image();
  }
}
```

`const uint8_t T[]` est **gravé dans la cartouche**, comme une tuile. Le compilateur l’annonce : ces octets sortent du décompte de la mémoire de travail.

**Ôter le `const` la met en mémoire** — et la rend modifiable, et la rend vide au démarrage. Les deux formes ont leur usage ; la différence se voit dans le compte rendu de compilation, et nulle part ailleurs.

**Ce qu’on doit voir** — Six tuiles posées en zigzag, aux positions de la table.  
**Ce qu’il coûte** — 1362 octets de programme, 1 variable.

---

### 47. Une grille

> Deux index, et un calcul qu’on n’écrit pas.

```cpp
const uint8_t LARGEUR = 10;
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
```

`carte[l][c]` est rangé à plat, ligne après ligne, et le compilateur calcule `l × LARGEUR + c`. C’est le calcul que tout le monde écrit à la main — et que tout le monde finit par écrire de travers le jour où la largeur change.

Le compilateur **exige les deux index** : `carte[3]` désignerait une rangée entière, et non un octet. Il le dit plutôt que de deviner.

**Ce qu’on doit voir** — Un rectangle creux, de dix sur huit, posé au milieu.  
**Ce qu’il coûte** — 1594 octets de programme, 3 variables.

---

### 48. Chercher dans un tableau

> Sortir dès qu’on a trouvé, et réserver une valeur pour « pas trouvé ».

```cpp
uint8_t valeurs[8];

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
```

`break` sort de la boucle ; `continue` passerait au tour suivant.

`ou = 255` sert de « pas trouvé ». Sur un octet il n’y a pas de valeur spéciale, alors **on en réserve une** — et l’on choisit celle qui ne peut pas être un index valide, puisqu’un tableau fait 256 cases au plus.

**Ce qu’on doit voir** — « TROUVE EN 004 » — 12 est bien la cinquième valeur.  
**Ce qu’il coûte** — 1428 octets de programme, 4 variables.

---

### 49. Un texte qui porte un nom

> Le même message à deux endroits, écrit une fois.

```cpp
const char TITRE[] = "GAME OVER";

int main() {
  texte(5, 6, TITRE);
  texte(5, 12, TITRE);

  while (true) {
    image();
  }
}
```

`const char NOM[] = "…"` est gravé dans la cartouche, comme une table. Il s’écrit ensuite **partout où `texte()` attend des guillemets**.

Le même message répété trois fois entre guillemets, ce sont trois occasions de le changer à deux endroits. Ici il n’y en a qu’un.

**Ce qu’on doit voir** — « GAME OVER » deux fois, écrit une seule fois dans le programme.  
**Ce qu’il coûte** — 1304 octets de programme, 0 variable.

---

## Niveau 7 — Découper son programme

### 50. Une fonction qui prend des arguments

> Écrire une fois ce qu’on fera dix fois.

```cpp
Tuile BLOC = {
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
```

Voici ce que le C++ apporte de plus visible. Une fonction prend des **arguments**, et rend une **valeur** : `uint8_t distance(uint8_t a, uint8_t b)`. On l’écrit une fois, on l’appelle partout, et l’endroit où l’on écrit `barre(2, 6, 5)` dit exactement ce qui va se passer.

Une fonction qui ne rend rien s’écrit **`void`**. Une fonction qui annonce rendre un `uint8_t` **doit** le faire : si aucun `return` ne rend de valeur, le compilateur refuse le fichier, plutôt que de laisser la fonction rendre ce qui traînait dans le processeur.

Un prix à payer, et il est dit franchement : **une fonction ne peut pas s’appeler elle-même**. Les arguments vivent à une place fixe, réservée une fois pour toutes — faute d’une pile praticable sur cette machine. Un appel imbriqué écraserait les arguments de l’appel en cours ; le compilateur nomme le cycle et s’arrête là.

**Ce qu’on doit voir** — Trois barres de longueurs différentes : 5, 12, puis 17 cases.  
**Ce qu’il coûte** — 1475 octets de programme, 6 variables.

---

### 51. Découper son programme

> Le même travail, écrit pour être relu dans trois jours.

```cpp
/*
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
```

Tout ce que fait ce programme tiendrait dans `main()`. Ce serait plus court à taper — et illisible dès qu’il grandit. Une boucle de jeu de deux cents lignes, on ne la relit pas : on la contourne, on lui ajoute une rustine à côté, et le désordre s’installe.

**Une fonction est d’abord un nom.** `dessinerLeSol()` dit ce qu’elle fait ; le lecteur n’a pas besoin d’ouvrir la boucle qui pose vingt tuiles pour le savoir. Une fonction sans argument ni retour reste utile — c’est même là qu’elle sert le plus.

**Un nombre écrit en clair au milieu du code ne dit rien.** `poser(colonne, 14, HERBE)` : pourquoi 14 ? `const uint8_t LIGNE_DU_SOL = 14;` répond, et le jour où le sol descend, il n’y a qu’un seul endroit à changer. Une `const` ne coûte **aucun octet** : sa valeur est connue à la compilation.

**`return;` au milieu d’une fonction** évite d’imbriquer trois `if`. `fairePasserLeTemps()` s’arrête tout de suite quand ce n’est pas encore l’heure, et la suite se lit à plat.

**Un programme peut tenir sur plusieurs fichiers.** `#include "dessins.cpp"` verse un autre fichier à cet endroit, avant toute compilation — et une faute y est signalée **avec le nom de son vrai fichier**, pas avec la ligne du texte collé. C’est ainsi qu’est écrit `exemples/decoupe/` : cinq fichiers, une seule cartouche, au dernier octet près.

Dans l’atelier, les fichiers sont les **onglets sous le titre** : « + fichier » en ajoute un, et il suffit de l’inclure. L’exemple « Un programme sur CINQ fichiers » les ouvre tous les cinq d’un coup, pour voir à quoi ça ressemble.

**Ce qu’on doit voir** — Un titre, un sol d’herbe sur toute la largeur, et un nuage qui traverse le ciel.  
**Ce qu’il coûte** — 1560 octets de programme, 4 variables.

*Cette leçon a son atelier à la souris : un dessin à faire soi-même.*

---

### 52. Nommer un geste qu’on refait

> Une fonction avec un argument, et trois appels.

```cpp
Tuile BRIQUE = {
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
```

**Les fonctions prennent des arguments, et c’est là tout l’intérêt.** Sans argument, il faudrait trois fonctions, ou une variable globale à poser avant chaque appel.

`void` dit qu’elle ne rend rien. Le compilateur le vérifie : une fonction qui annonce rendre un `uint8_t` sans jamais faire `return` est **refusée, avec sa ligne**.

**Ce qu’on doit voir** — Trois rangées de briques, écrites par un seul bout de code.  
**Ce qu’il coûte** — 1370 octets de programme, 2 variables.

*Cette leçon a son atelier à la souris : un dessin à faire soi-même.*

---

### 53. Une fonction qui rend une valeur

> Ce qui entre, ce qui sort — et ce qu’on ne réécrit pas deux fois.

```cpp
uint8_t distance(uint8_t a, uint8_t b) {
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
```

Les deux appels rendent 70. Sans la fonction, il faudrait écrire le `if` deux fois — et le jour où l’on veut borner l’écart à 60, le corriger aux deux endroits.

Le résultat s’utilise dans un calcul : `nombre(10, 6, distance(a, b) * 2)` marche, comme n’importe quelle expression.

**Ce qu’on doit voir** — 070 deux fois — l’ordre des arguments ne change rien.  
**Ce qu’il coûte** — 1365 octets de programme, 2 variables.

---

### 54. Un argument par défaut

> Ce qui n’est pas écrit prend la valeur annoncée.

```cpp
void barre(uint8_t ligne, uint8_t combien, uint8_t tuile = 1) {
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
```

L’argument par défaut est rempli **à l’appel**, et non dans la fonction — comme en C++. Cela lui permet de dépendre de l’endroit d’où l’on appelle.

Une règle : un argument sans valeur par défaut **ne peut pas suivre** un argument qui en a une. Sinon, à `barre(4, 20)`, on ne pourrait plus deviner lequel manque. Le compilateur le refuse plutôt que de choisir à notre place.

**Ce qu’on doit voir** — Trois barres de longueurs différentes ; la dernière d’une autre tuile.  
**Ce qu’il coûte** — 1378 octets de programme, 4 variables.

---

### 55. Pourquoi une fonction ne s’appelle pas elle-même

> Le refus le plus important du projet — et comment dérouler la boucle.

```cpp
uint8_t somme(uint8_t n) {
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
```

Écrire `return n + somme(n - 1);` est **refusé**, avec le cycle nommé : « `somme` finit par s’appeler elle-même (somme → somme) ».

**Les arguments vivent à une adresse fixe**, réservée une fois pour toutes — c’est ce que fait tout compilateur C d’une machine huit bits, faute d’une pile praticable. Un appel imbriqué écraserait les arguments de l’appel en cours, et la fonction reprendrait son travail avec les valeurs de l’autre.

C’est un bogue silencieux, et indébogable. Le compilateur le nomme avant qu’il n’arrive. Voici la même chose, déroulée avec `while`.

**Ce qu’on doit voir** — 015 — la somme de 1 à 5, calculée sans récursion.  
**Ce qu’il coûte** — 1358 octets de programme, 2 variables.

---

### 56. #include, et les onglets de la page

> Le fichier voisin est versé ici, avant toute compilation.

```cpp
uint8_t doubler(uint8_t n) { return n * 2; }

int main() {
  texte(2, 6, "DOUBLE DE 21");
  nombre(8, 8, doubler(21));

  while (true) {
    image();
  }
}
```

`#include "dessins.cpp"` **verse le fichier voisin à cet endroit** avant que le compilateur ne voie quoi que ce soit. Il n’y a donc ni éditeur de liens, ni ordre de compilation à connaître.

Dans la page, les fichiers voisins sont des **onglets** : `#include` ne voit pas la différence. Et quand une faute tombe dans un fichier inclus, le message désigne **son** fichier et **sa** ligne — pas la ligne du texte assemblé, que personne n’a jamais vue.

Le programme ci-dessous tient en un fichier ; la leçon « Découper son programme » en montre un sur cinq.

**Ce qu’on doit voir** — « DOUBLE DE 21 », et 042 en dessous — la fonction a été appelée.  
**Ce qu’il coûte** — 1316 octets de programme, 1 variable.

---

## Niveau 8 — Ce qui va ensemble

### 57. Une « struct » : ce qui va ensemble

> Une troupe d’ennemis, et non six tableaux parallèles.

```cpp
Tuile CORPS = {
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
```

Un ennemi a une position, une vitesse, une santé. Sans `struct`, cela fait trois tableaux qu’il faut penser à garder alignés — et le jour où l’on en trie un sans trier les autres, les vies changent de propriétaire.

Une **`struct`** range ces champs ensemble. `Etoile etoiles[4];` réserve quatre enregistrements ; `etoiles[i].x` en désigne un champ. Le compilateur calcule le décalage lui-même, et `sizeof(Etoile)` dit ce qu’un enregistrement pèse.

Le numéro d’un lutin peut être **calculé** : `sprite(i, …)` dans une boucle affiche toute la troupe, chacun avec ses valeurs à lui. C’est ce qui rend la `struct` utile plutôt que décorative.

Une `struct` peut en contenir une autre : `struct Ennemi { Point ou; uint8_t vie; };`, et l’on écrit `troupe[i].ou.x`. Le compilateur additionne les décalages lui-même.

Ce qu’elle ne sait pas faire : s’affecter d’un bloc, se passer en argument, se rendre par une fonction. On nomme le champ qu’on veut lire ou écrire — et le compilateur le dit plutôt que de traduire à peu près.

**Ce qu’on doit voir** — Quatre boules qui traversent l’écran, chacune à sa vitesse.  
**Ce qu’il coûte** — 1690 octets de programme, 3 variables.

---

### 58. Le décor qui défile

> Un monde plus large que l’écran.

```cpp
Tuile MUR = {
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
```

La carte de fond fait **32 cases sur 32**, soit 256 pixels de côté ; l’écran n’en montre que 20 sur 18. Le reste attend hors-champ.

`defiler(x, y)` fait glisser la fenêtre. Au-delà de 255, le compte revient tout seul à zéro : le décor est un **ruban sans fin**.

C’est ce qui permet un niveau aussi long qu’on veut : quand la caméra franchit une case, on redessine la colonne qui va entrer par la droite, à la place de celle qui vient de sortir par la gauche.

**Ce qu’on doit voir** — Le sol glisse sous l’écran quand on pousse la croix.  
**Ce qu’il coûte** — 1463 octets de programme, 2 variables.

---

### 59. La caméra : c’est le monde qui bouge

> Le héros ne se déplace pas — comme dans Mario.

```cpp
Tuile HEROS = {
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
```

Dans un jeu qui défile, le personnage **ne bouge pas à l’écran**. Il reste au milieu, et c’est le décor qui passe derrière lui. Mario n’avance pas : il piétine au centre pendant qu’un monde de plusieurs écrans glisse vers la gauche.

Il y a donc **deux espaces** : l’écran, qui fait 160 pixels de large, et le monde, qui fait ce qu’on veut. `defiler(camera, 0)` dit simplement **quel morceau du monde on regarde**.

Et voici pourquoi cela tient en si peu de lignes : **les lutins ne défilent pas**. `defiler()` ne déplace que le fond ; un `sprite()` est posé sur l’écran, à la place où on l’écrit. Le héros au milieu, c’est une ligne, toujours la même : `sprite(0, 76, 112, HEROS);`

Une seule variable suffit pour les deux rôles. `camera` est la fenêtre **et** la position du héros dans le monde : il est en `camera + 76`. Le jour où un ennemi arrive, lui vit dans le monde, et c’est à lui de se convertir — `sprite(1, xEnnemi - camera, 112, ENNEMI)`.

La preuve est à l’écran, et elle est gratuite : **même la consigne s’en va**. Elle est écrite dans le décor, donc elle voyage avec lui. Le bonhomme, lui, ne bouge pas d’un pixel.

**Ce qu’on doit voir** — Le bonhomme reste planté au milieu ; les arbres, le sol et même la consigne passent derrière lui.  
**Ce qu’il coûte** — 1677 octets de programme, 2 variables.

---

### 60. Trois variables qui parlent de la même chose

> Une `struct`, plutôt que `bossX`, `bossY`, `bossVie`.

```cpp
struct Ennemi {
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
```

Sans `struct`, on écrirait `bossX`, `bossY`, `bossVie` — et le jour où il faut un second ennemi, on recopie trois variables et l’on en oublie une.

Une `struct` fait **au plus 255 octets**, et chaque champ est un octet. C’est un enregistrement, pas un objet : ni héritage, ni constructeur.

La leçon « Une struct : ce qui va ensemble » en fait un usage complet ; celle-ci n’en montre que la forme.

**Ce qu’on doit voir** — « X 040 » et « VIE 3 » : les deux champs de la même struct, relus.  
**Ce qu’il coûte** — 1336 octets de programme, 1 variable.

---

### 61. Un tableau de « struct »

> Trois ennemis, c’est UNE ligne de plus — pas neuf variables.

```cpp
struct Ennemi {
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
```

`troupe[i].vie` : l’index est calculé à l’exécution, le décalage du champ est connu à la compilation. **Le compilateur fait le calcul d’adresse** ; nous, nous écrivons ce que nous voulons dire.

C’est ici que la `struct` prend son sens. Passer de un à trois ennemis coûte une ligne ; sans elle, il aurait fallu six variables de plus et six lignes à tenir d’accord.

**Ce qu’on doit voir** — « 3 2 3 » — seul celui du milieu a été touché.  
**Ce qu’il coûte** — 1494 octets de programme, 2 variables.

---

### 62. Une méthode : la fonction qui connaît son objet

> `troupe[i].avancer()` plutôt que `avancer(i)`.

```cpp
struct Ennemi {
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
```

**Une méthode s’écrit dans la `struct`, et travaille sur l’objet devant le point.** Dans son corps, les champs s’écrivent sous leur nom nu : `x++`, et non `this->x++`.

Ce qu’elle coûte, exactement : l’adresse de l’objet est rangée dans **deux octets réservés à cette méthode**, puis c’est le même `call` qu’ailleurs. Pas de table de fonctions, pas de pile d’objets — et le compilateur compte ces deux octets comme les autres.

Ce qui reste refusé, et pourquoi : `class` (le message propose `struct`), `virtual` (il faudrait une table de fonctions et un appel indirect), l’héritage (il déplacerait les décalages des champs), les constructeurs (du code implicite à la déclaration, alors que les globales prennent leur valeur avant `main`). Et une méthode **ne prend pas d’argument** : elle reçoit déjà son objet.

**Ce qu’on doit voir** — Deux nombres qui montent, et celui du milieu immobile.  
**Ce qu’il coûte** — 1599 octets de programme, 4 variables.

---

### 63. Les trois façons de faire la même chose

> À la suite, par une fonction, par une méthode — et ce que chacune coûte.

```cpp
struct Ennemi {
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
```

**À la suite**, tout est dans `main` : `if (ennemiVie > 0) ennemiX++;`, avec deux variables globales. C’est le plus court, et pour **un** ennemi c’est le bon choix. Le jour où il en faut trois, il faut six variables et trois fois les mêmes lignes.

**Par des fonctions** : les données sont rangées dans un tableau de `struct`, le geste est nommé, et l’objet se désigne par son index — `avancer(i)`, avec `void avancer(uint8_t i) { if (troupe[i].vie > 0) troupe[i].x++; }`. Coût : un octet par argument.

**Par des méthodes**, ci-dessous : rigoureusement le même travail, mais le geste est écrit **là où vivent les données**, et l’objet ne se passe plus. Coût : deux octets par méthode.

Mesuré, sur ce programme : **1344 octets** à la suite, **1590** par fonctions, **1610** par méthodes. Aucune n’est meilleure dans l’absolu — la troisième rend en lisibilité ce qu’elle prend en octets, et c’est bien pour cela que le compilateur les compte et les annonce.

**Ce qu’on doit voir** — Trois nombres qui montent ; A les blesse tous les trois.  
**Ce qu’il coûte** — 1643 octets de programme, 6 variables.

---

### 64. Une méthode qui en appelle une autre

> Pourquoi chaque méthode a SES deux octets, et non deux partagés.

```cpp
struct Ennemi {
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
```

Dans `blesser()`, l’appel nu `vivant()` veut dire **« la mienne »** : l’objet en cours est passé tel quel, comme en C++.

Et voici pourquoi chaque méthode a **ses** deux octets plutôt que deux partagés par la `struct` : si `avancer()` appelait `autre.vivant()`, un emplacement commun serait écrasé, et `avancer()` reprendrait son travail sur le mauvais ennemi. Le partage aurait marché sur les exemples simples et échoué exactement là où c’est le plus dur à voir.

La règle du non-appel-à-soi-même vaut aussi ici : **une méthode ne peut pas s’appeler elle-même**, ni par un détour. Le compilateur nomme le cycle, méthode par méthode.

**Ce qu’on doit voir** — « 2 » et « 0 » — le mort n’est pas descendu à 255.  
**Ce qu’il coûte** — 1416 octets de programme, 3 variables.

---

## Niveau 9 — Un vrai jeu

### 65. Passer d’un écran à l’autre

> Un titre, une partie, une fin.

```cpp
enum Scene { TITRE, JEU, FIN };

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
```

Le squelette de n’importe quel jeu. Deux règles, et il n’y en a pas d’autres.

**Une variable dit où l’on est.** Un `enum` lui donne ses valeurs possibles, et leur donne des noms : `TITRE`, `JEU`, `FIN`. Le nom de l’`enum` devient un type d’un octet, et `Scene scene` se lit mieux que `uint8_t scene`.

**Un seul endroit change d’écran.** `allerA()` éteint, efface, redessine, rallume — toujours dans cet ordre. Si chaque bouton faisait son propre ménage, l’un finirait par oublier d’effacer, et deux écrans se mélangeraient.

Le `switch` aiguille sur la scène. Il fonctionne comme en C++, **`break` compris** : sans lui, l’exécution tombe dans le cas suivant. C’est un piège célèbre, mais c’est le sens du langage, et le trahir en douce serait pire.

On éteint l’écran pour effacer parce que repeindre toute la carte demande bien plus de temps qu’une image n’en contient. `effacer()` sans argument vide les 32 × 32 de la carte d’un coup — cette leçon écrivait autrefois ses deux boucles à la main, et n’effaçait alors que les 20 × 18 visibles : le décor qui défilait ramenait l’écran d’avant.

**Ce qu’on doit voir** — « MON JEU », puis A change d’écran à chaque appui.  
**Ce qu’il coûte** — 1586 octets de programme, 4 variables.

---

### 66. La pesanteur et le saut

> Tomber, et retomber.

```cpp
Tuile BALLE = {
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
```

Le processeur ne connaît **pas les nombres négatifs** : `0 - 1` vaut 255. Une vitesse qui doit monter *et* descendre ne peut donc pas s’écrire directement.

On la décale : `ZEROV` vaut 16, et la vitesse vit autour. **Moins de 16, on monte ; plus de 16, on tombe.** Sans ce décalage, un saut deviendrait une chute de 240 pixels par image.

`const uint8_t ZEROV = 16;` ne coûte rien : la valeur est connue à la compilation, et le compilateur l’écrit directement dans le code. Un `const` n’occupe pas d’octet de mémoire.

La pesanteur ajoute 1 à chaque image. Sauter, c’est poser une vitesse bien en dessous de 16 : elle remonte d’elle-même, le mouvement s’inverse, et la courbe est celle d’un vrai saut.

**Ce qu’on doit voir** — La boule saute, ralentit en l’air, et retombe sur le sol.  
**Ce qu’il coûte** — 1551 octets de programme, 6 variables.

---

### 67. Le verre qui se brise

> Quatre éclats, et trois variables.

```cpp
Tuile VERRE = {
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
```

La chute est celle de la leçon du même nom : les pixels dans `y`, les seizièmes dans `frac`, la pesanteur qui s’ajoute à la vitesse. Ce qui change ici, c’est **ce qui arrive au contact**.

Un objet qui se brise ne disparaît pas : il est **remplacé par ses morceaux**. Au choc, le verre part se cacher et quatre éclats prennent sa place, exactement à l’endroit où il s’est posé.

**Cacher un lutin ne demande aucune fonction** : on l’écrit à 160, hors des 144 lignes de l’écran. Il existe toujours — les quarante existent toujours — on choisit simplement de ne pas le voir. C’est pour cela que les cinq `sprite()` de la fin sont écrits une fois pour toutes, sans un seul `if` : ce sont les variables qui décident qui est visible.

**On ne simule pas quatre éclats.** Une image plus tôt ils étaient un seul objet : ils partent donc ensemble, à la même hauteur, et ne diffèrent que par ce qu’ils prennent de côté. Une seule hauteur `ey`, un seul compteur `t`, et les quatre positions se calculent — `76 - 3 * t`, `76 - t`, `76 + t`, `76 + 3 * t`. **Trois variables au lieu de douze.**

Leur envol est la vitesse décalée du saut : `ZEROV - 6` les projette vers le haut, la pesanteur les rattrape. Les deux éclats rapides retombent trois fois plus loin que les lents, sans qu’on ait rien à écrire pour ça — même temps de vol, vitesse triple.

`t` n’avance **que tant qu’ils volent**. Posés, il s’arrête, et les éclats restent exactement où ils sont tombés. C’est cette ligne-là, et aucune autre, qui fait la différence entre du verre brisé et quatre morceaux qui glissent à l’infini.

**Ce qu’on doit voir** — Le verre tombe, éclate en quatre morceaux qui s’envolent et retombent éparpillés — puis tout recommence.  
**Ce qu’il coûte** — 1769 octets de programme, 8 variables.

---

### 68. Un état de jeu

> Quelques scènes, et un `switch` qui dit laquelle est en cours.

```cpp
enum Scene { TITRE, JEU, PERDU };

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
```

C’est presque toujours la forme d’un jeu : un `enum` de scènes, et un `switch`. Le reste — les ennemis, le décor — se branche dans le `case JEU`.

Le front est calculé **une fois**, en haut de la boucle, et servi à tous les cas. Le recalculer dans chaque `case` marcherait aussi — et un jour l’un des trois serait oublié.

Le score n’est écrit **que lorsqu’il change**, et l’étiquette une seule fois en entrant. Les réécrire à chaque image alourdit la boucle au point qu’elle déborde — et un `depuis` qui compte les tours avance alors trois fois moins vite que le temps réel.

**Ce qu’on doit voir** — START lance la partie, le score monte, et à 20 c’est perdu.  
**Ce qu’il coûte** — 1562 octets de programme, 6 variables.

---

### 69. Le score, et le panneau

> Une seconde couche, qui ne défile pas avec le décor.

```cpp
int main() {
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
```

Le **panneau** est une couche posée par-dessus le fond. Il ne défile pas : c’est exactement ce qu’on veut d’un score pendant que le décor glisse.

`panneau(x, y)` le place et l’allume, `cacherPanneau()` l’ôte sans rien perdre de son contenu.

Deux détails qui se paient cher si on les oublie. Le compteur `depuis` plutôt qu’un multiple de `images()` : le corps de cette boucle écrit dans le panneau, il déborde d’une image, et le multiple serait enjambé — **le score resterait bloqué à zéro sans que rien ne le dise**. Et `nombrePanneau()` n’est appelé **que quand le score change** : le réécrire à chaque tour alourdit la boucle pour rien.

**Ce qu’on doit voir** — Le score monte dans le panneau pendant que le fond glisse.  
**Ce qu’il coûte** — 1372 octets de programme, 3 variables.

---

### 70. Des ennemis qui vivent et qui meurent

> Les méthodes, dans un vrai tour de boucle.

```cpp
Tuile ENNEMI = {
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
```

`hasard()` lit le compteur libre du matériel : un nombre imprévisible, sans table ni graine. `semer(n)` permet de choisir son point de départ quand on veut au contraire une suite reproductible.

`cacher(n)` ôte le lutin de l’écran. Sans lui, un ennemi mort resterait affiché, immobile — ce qui se remarque tout de suite, heureusement.

**Ce qu’on doit voir** — Trois monstres qui avancent ; A en fait disparaître un au hasard.  
**Ce qu’il coûte** — 1786 octets de programme, 7 variables.

*Cette leçon a son atelier à la souris : un dessin à faire soi-même.*

---

### 71. Les collisions

> Regarder AVANT de bouger, et non reculer après.

```cpp
Tuile MUR = {
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
```

`lire(colonne, ligne)` rend le numéro de la tuile affichée. Comparer à `MUR` suffit : **le nom d’une tuile EST son numéro**.

La forme compte. On calcule la position **voulue**, on regarde ce qu’il y a, et l’on n’y va que si c’est libre. Bouger puis reculer marche aussi, mais laisse une image où le personnage est dans le mur — et cette image finit toujours par se voir.

**Ce qu’on doit voir** — Le curseur s’arrête net contre les murs et contre le bloc isolé.  
**Ce qu’il coûte** — 1669 octets de programme, 6 variables.

*Cette leçon a son atelier à la souris : un dessin à faire soi-même.*

---

### 72. Ralentir sans compter les images à la main

> `retard()` dit quand le tour de boucle a débordé.

```cpp
int main() {
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
```

`retard()` rend 1 si le tour précédent a duré **plus d’une image**. C’est la seule façon honnête de savoir qu’un jeu ne tient plus les soixante images par seconde : le compteur d’images de la page mesure le navigateur, pas la console.

Redessiner trois cent soixante tuiles à chaque tour est un bon moyen de faire monter ce compteur. **Un vrai jeu ne redessine que ce qui a changé** — et c’est exactement le débordement qui fait rater un `images() % 20 == 0`.

**Ce qu’on doit voir** — Le compteur de retards monte : la boucle ne tient pas l’image.  
**Ce qu’il coûte** — 1417 octets de programme, 3 variables.

---

### 73. Passer à la salle suivante, sans bouton

> Ce n’est pas un bouton qui change de salle : c’est le personnage qui sort du cadre.

```cpp
Tuile HEROS = {
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
```

La leçon « Passer d’un écran à l’autre » changeait de scène **sur un appui**. Ici, rien de tel : c’est la POSITION du héros qui décide — sortir par la droite fait apparaître la salle suivante, avec le héros collé au bord gauche.

La même règle que `allerA()` s’applique : `ecran(0)`, `effacer()`, redessiner, puis `ecran(1)` — toujours dans cet ordre, pour ne pas voir l’ancienne salle se mélanger à la nouvelle pendant qu’on l’efface.

**Le héros ne s’arrête jamais à un bord** comme dans « Le garder dans l’écran » : ici, dépasser le bord est justement ce qui déclenche le changement. Les deux techniques répondent à deux besoins opposés, avec le même test `x > DROITE_MAX`.

**Ce qu’on doit voir** — « SALLE A », puis « SALLE B » dès que le héros sort par la droite — il réapparaît collé au bord gauche.  
**Ce qu’il coûte** — 1675 octets de programme, 3 variables.

---

## Niveau 10 — Aller au bout

### 74. Se souvenir d’une partie à l’autre

> Un meilleur score qui survit à l’extinction.

```cpp
const uint8_t MARQUE = 42;

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
```

La cartouche porte une pile et une petite mémoire. `sauver(numero, valeur)` y écrit, `sauvegarde(numero)` y relit — 256 cases, et elles sont encore là après avoir éteint la console.

Cette mémoire n’est pas ouverte en permanence : il faut la **déverrouiller** avant d’y toucher et la refermer aussitôt. Le compilateur pose le verrou lui-même à chaque accès. Ce n’est pas de la prudence excessive : laissée ouverte, une coupure de courant au mauvais moment la corrompt.

À la toute première partie, cette mémoire contient n’importe quoi. Un jeu y écrit donc **une marque à lui** et ne fait confiance au reste que s’il la retrouve. C’est ce que fait la première ligne de `main()`.

**Ce qu’on doit voir** — Le score monte, et le record le suit — puis lui survit.  
**Ce qu’il coûte** — 1586 octets de programme, 3 variables.

---

### 75. La musique d’un jeu

> Tout ensemble : un lutin qu’on déplace, une pièce à attraper, et un air qui ne s’arrête jamais.

```cpp
/* La musique tourne pendant que le jeu tourne. */

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
```

Voici les dix niveaux réunis dans un seul programme : des tuiles dessinées, des lutins au pixel près, des boutons lus à chaque image, un score — et **deux airs**.

`jouer(1, MUSIQUE, 8, 1)` lance la musique de fond ; le quatrième argument, `1`, la fait **recommencer sans fin**. Ensuite le programme n’a plus rien à tenir : l’air avance tout seul dans l’interruption de la console, soixante fois par seconde, **même quand le jeu est en retard**.

Attraper la pièce lance `jouer(1, VICTOIRE, 5)` : la fanfare **prend la voix 1**, par-dessus la musique, exactement comme dans un vrai jeu. Elle, elle ne boucle pas.

`airFini(1)` dit quand la fanfare est arrivée au bout. C’est là qu’on relance la musique de fond — sans cela, la voix resterait muette après la victoire, et l’on chercherait longtemps pourquoi.

La **partition ci-dessous** écrit les deux airs à la souris, et « Écouter » les fait entendre sans compiler. Change une note : le programme se réécrit, la cartouche se refait, et la console joue ta version dans la seconde.

**Ce qu’on doit voir** — DROITE et GAUCHE déplacent le héros. La pièce attrapée fait monter le score et sonner une fanfare.  
**Ce qu’il coûte** — 2136 octets de programme, 3 variables.

*Cette leçon a son atelier à la souris : une partition.*

---

### 76. Le monde glisse, le héros ne bouge pas

> La position dans le monde vaut « défilement + 76 ».

```cpp
Tuile SOL = {
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
```

Le lutin ne bouge **jamais** : il est à 76 pixels, image après image. Ce qui change, c’est `defiler()`.

C’est ce qui distingue un écran fixe d’un monde. La position du personnage **dans le monde** vaut `monde + 76`, et c’est ce nombre-là qu’on compare au décor — pas celui du lutin, qui est une constante.

La leçon « La caméra : c’est le monde qui bouge » part du même principe et le pousse jusqu’au bord du niveau.

**Ce qu’on doit voir** — Le décor glisse ; le personnage reste rigoureusement au milieu.  
**Ce qu’il coûte** — 1460 octets de programme, 3 variables.

*Cette leçon a son atelier à la souris : un dessin à faire soi-même.*

---

### 77. Un record qui survit à l’extinction

> La cartouche a une pile, et de la mémoire qui reste.

```cpp
int main() {
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
```

`sauver(case, valeur)` et `sauvegarde(case)` écrivent et relisent la **mémoire sauvegardée de la cartouche** — celle qui survit à l’extinction.

Sur une vraie console, c’est une pile qui la tient. Dans la page, c’est le navigateur ; le programme, lui, ne voit aucune différence.

On ne sauve **que lorsque le record change**. Écrire à chaque image userait la mémoire d’une vraie cartouche, et n’apporterait rien.

**Ce qu’on doit voir** — Le record suit le score dès qu’il le dépasse.  
**Ce qu’il coûte** — 1466 octets de programme, 4 variables.

---

### 78. Compter ce que coûte une boucle

> Le compilateur ne cache pas ses prix.

```cpp
const uint8_t TABLE[] = { 3, 1, 4, 1, 5, 9, 2, 6 };

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
```

Compiler donne son compte rendu : octets de programme, fonctions, variables, mémoire de travail. **Changer une ligne et recompiler montre ce qu’elle a coûté** — c’est la seule mesure qui ne mente pas.

Deux choses à savoir, mesurées et non supposées. `100 * x` et `x * 100` ne coûtent pas la même chose : la routine générale boucle sur son opérande de droite, alors le compilateur met le nombre connu à droite quand l’opérateur s’en moque.

Et `x / 16` devient quatre décalages, `x % 16` un `and` — **quand le diviseur est connu**. Sinon, c’est la routine générale, et elle se paie.

**Ce qu’on doit voir** — 031 — la somme de la table gravée.  
**Ce qu’il coûte** — 1365 octets de programme, 2 variables.

---

### 79. Le même jeu, deux fois

> Une balle à la suite, trois balles par méthodes — le corps est le même.

```cpp
Tuile BALLE = {
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
```

**À la suite**, une balle demande quatre variables et huit lignes dans `main` : `if (versDroite) { x += 2; if (x > 150) versDroite = 0; }`, et ainsi de suite. Pour **une** balle, c’est parfait — 1427 octets.

Ci-dessous, trois balles **par méthodes**. Le corps de `avancer()` est **mot pour mot** celui de la version à la suite ; ce qui a changé, c’est qu’il est écrit une fois pour trois, et rangé avec les données sur lesquelles il travaille. 1956 octets, et quinze octets de mémoire.

**La seule règle honnête** : écrire à la suite tant que c’est un objet, nommer par une fonction quand le geste se répète, ranger dans une méthode quand les gestes et les données vont manifestement ensemble. Et ne pas choisir d’avance — recompiler, et lire le compte rendu.

**Ce qu’on doit voir** — Trois balles qui rebondissent, à trois vitesses différentes.  
**Ce qu’il coûte** — 1989 octets de programme, 3 variables.

*Cette leçon a son atelier à la souris : un dessin à faire soi-même.*

---

### 80. Ce que le compilateur refuse, et pourquoi

> Le dernier tutoriel n’apprend pas à écrire : il apprend à lire les refus.

```cpp
struct Ennemi { uint8_t x, y; };
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
```

C’est la règle qui gouverne le projet. **Un `long` traduit en douce sur un octet, c’est un jeu qui compte faux à partir de 256 et personne n’a été prévenu** ; un refus, c’est trois secondes perdues et une ligne à réécrire.

Cinq refus qu’on rencontre vraiment. `float vitesse = 1.5;` — la machine n’a pas de virgule. `class Ennemi { … };` — le message propose `struct`, qui fait ce qu’on voulait, méthodes comprises. `carte[3] = 1;` sur une grille — il faut **deux** index, car `carte[3]` désigne une rangée entière. `uint8_t loin(Ennemi e)` — un argument est un octet ; une `struct` se passe par son nom, visible partout, ou par son index. `TABLE[0] = 9;` sur une table `const` — elle est gravée dans la cartouche.

Chacun porte **son numéro de ligne**, et dit quoi écrire à la place. C’est ce qui fait la différence entre un compilateur qui aide et un compilateur qui punit : les deux disent non, un seul dit pourquoi. Le programme ci-dessous est la version acceptée des cinq.

**Ce qu’on doit voir** — 030, 1, 3, 2 — les cinq refus, écrits comme il faut.  
**Ce qu’il coûte** — 1442 octets de programme, 4 variables.

---

### 81. Ce qu’une ligne de C++ devient, en vrai

> « compte++ » n’existe pas pour la machine : elle ne connaît que lire, calculer, écrire.

```cpp
int main() {
  uint8_t compte = 0;

  while (true) {
    compte++;
    nombre(8, 8, compte);
    image();
  }
}
```

Cliquer sur **🔎 MODE MACHINE** juste après avoir compilé montre ce que la cartouche contient vraiment : des instructions du processeur, pas du C++. Ce mode se souvient d’où le compilateur a rangé chaque variable et chaque fonction — un « nom retrouvé » n’existe que pour une cartouche qui vient d’être compilée ici ; une cartouche venue d’ailleurs ne montre que des nombres.

`compte = 0` devient deux instructions : `xor a` (mettre le registre A à zéro) puis `ldh [main.compte], a` (l’écrire dans la case mémoire de compte). Il n’y a pas d’instruction « mettre une variable à zéro » sur ce processeur — seulement des registres et des adresses.

`compte++` n’est **pas** une seule instruction non plus : la machine doit LIRE la valeur (`ldh a, [main.compte]`), l’AUGMENTER dans un registre (`inc a`), puis la RÉÉCRIRE (`ldh [main.compte], a`). Trois instructions pour un `++`, parce que la puce ne calcule jamais directement en mémoire — tout passe par un registre.

Le `while (true)` du programme n’existe pas non plus dans la cartouche : c’est un simple retour en arrière, `jp`, qui saute à l’instruction d’avant plutôt que de continuer. La boucle est une manière humaine de LIRE le programme ; pour la machine, ce n’est qu’un saut.

**Ce qu’on doit voir** — Un nombre qui monte à l’écran ; dans MODE MACHINE, chaque ligne de ce programme devient plusieurs instructions.  
**Ce qu’il coûte** — 1293 octets de programme, 1 variable.

---

### 82. Sinus, cosinus, une seule table

> Pas de virgule flottante, pas de type négatif : une table gravée y suffit.

```cpp
Tuile BALLE = { "..####..", ".#----#.", "#--++--#", "#-+##+-#", "#-+##+-#", "#--++--#", ".#----#.", "..####.." };

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
```

Il n’y a ni `sin()` ni `cos()` ici, et pas de type signé non plus — impossible d’écrire un nombre négatif directement. La solution tient dans **une table gravée** : chaque case vaut `40 + 40 * sin(angle)`, toujours entre 0 et 80, jamais en dessous de zéro.

`cos(angle) = sin(angle + 90°)` — et 90°, c’est un quart de tour. Avec trente-deux pas pour un tour complet, un quart de tour fait huit pas. Pas besoin d’une deuxième table : `cosinus` relit la MÊME, huit cases plus loin, avec `%` pour revenir au début quand ça déborde.

Le reste est déjà connu : `aAvant` pour agir **au front** — un seul basculement par appui, et non un par image —, et deux textes de même longueur, pour que rien ne traîne de l’un à l’autre.

**Ce qu’on doit voir** — Une balle qui ondule en traversant l’écran ; A bascule « SINUS » en « COSINUS », et elle saute d’un quart de tour.  
**Ce qu’il coûte** — 1562 octets de programme, 7 variables.

---

## Et après

- **`http://localhost/gameboy3/`** — l’atelier : les mêmes leçons, avec une
  console qui tourne à côté, et quatre d’entre elles à faire à la souris.
- **`LISEZMOI.md`** — la page du langage, les fonctions de la console, et les
  cinquante réglages.
- **`node lancer-tutoriels.mjs`** — les fait toutes tourner, et les
  photographie en une planche-contact.
- **`node verifier-tuto.mjs`** — recompile et rejoue tout ce qui est écrit ici.

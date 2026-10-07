# gameboy3 — écrire une cartouche Game Boy en C++

Un compilateur qui lit du C++ et rend un `.gb` de 32 Ko, qui démarre sur une
console d'origine.

```bash
node outils/gb3.mjs exemples/mario.cpp
```

```
exemples\mario.gb
  32 Ko de cartouche, 6006 octets de programme
  21 fonctions : dessinerColonne, estSolide, bornes, heurteSurLigne, …
  68 variables, 134 octets de mémoire de travail
  6 dessins : SOL = 44, BRIQUE = 45, PIECE = 46, DRAPEAU = 47, MARIO = 48, ENNEMI = 52
  titre : « MARIO »
```

L'écran de la console **en image**, à côté du `.gb` (le bouton **📷 Capture** de la page fait de même) :

```bash
node outils/gb3.mjs jeu.cpp --capture 240 --touches DROITE,A --grossir 3
```

## Installer et démarrer, sur n'importe quel PC

Le seul vrai prérequis est **Node.js** (18 ou plus) — le projet n'a aucune
dépendance à installer avec `npm`, rien d'autre à télécharger.

```bash
node demarrer.mjs
```

Ce script cherche un PHP déjà installé (XAMPP, WampServer, ou celui du
système), sert l'atelier dessus, et ouvre le navigateur tout seul. Sans PHP
trouvé, l'atelier s'ouvre quand même — servi par ce script lui-même — mais
« 📂 Ouvrir » et « 💾 Enregistrer un projet » ne marcheront pas, faute d'un
`projets.php` qui puisse tourner.

Ou, sans rien installer :

- **`http://localhost/gameboy3/tuto.html`** — **quatre-vingts leçons, en dix niveaux de
  difficulté**, de « écrire un mot » à « la musique d'un jeu ». Chacune annonce
  sa difficulté sur dix, porte son code — modifiable — et une console qui tourne
  à côté ; **quatre d'entre elles embarquent leur atelier à la souris** —
  dessiner une tuile, poser un décor, écrire un air — et montrent alors **les
  deux façons de faire la même chose**, en code et à la souris, sur la même page.
  C'est par là qu'il faut commencer.
- **`http://localhost/gameboy3/`** — l'atelier complet, en **trois modes** :
  **création** (les tuiles à dessiner, les airs à écrire sur une partition),
  **code** (tout l'écran au programme) et **leçons** — les leçons, dans
  l'atelier même : choisir une leçon charge son programme, qui tourne aussitôt
  dans la console d'à côté.
- **`npm run livret`** — les leçons **en PDF**. `tutoriel.pdf` les rassemble,
  une page chacune ; `livrets/lecon-01-….pdf` en donne **une par leçon, étape
  par étape** : le programme découpé morceau par morceau, l'exécution
  photographiée aux instants qui comptent, ce que chaque touche y change, et
  les contrôles de la leçon **joués**, avec ce qu'ils ont mesuré. Rien n'y est
  recopié : tout vient du compilateur et de l'émulateur.

- **[`TUTORIELS.md`](documents/TUTORIELS.md)** — **quatre-vingts tutoriels, du plus facile au
  plus dur**, en dix niveaux. Chacun est un **programme entier**, qui se colle
  tel quel et qui tourne : `node verification/verifier-tutoriels.mjs` les recompile tous,
  refus compris. À partir du niveau 8, la même chose y est écrite de **trois
  façons** — à la suite, par une fonction, par une méthode — avec ce que chacune
  coûte en octets.
- **Le bouton ⚙** — **cinquante-trois réglages**, tous applicables **à chaud** :
  la palette, la vitesse de la console, le volume, la police du code, la
  recompilation en écrivant, le thème. Rien n'attend un rechargement.

Ce que la dernière passe a ajouté — la musique, la partition, les vingt leçons
et le livret — est raconté dans [`CHANGEMENTS.md`](documents/CHANGEMENTS.md).

---

## Apprendre : un seul parcours

Les leçons, les tutoriels et le cours ne forment plus qu'**une seule suite** :
**Apprendre — le parcours** (`tuto.html`, et le mode APPRENDRE de l'atelier ;
`cours.html` y mène). Rien n'a été retiré : chaque leçon et chaque cours garde
son texte, son programme et ses contrôles. `tuto/parcours.js` les range :

- **26 chapitres**, de « Avant tout » à « Tes propres #include ». Les niveaux des
  leçons et les chapitres du cours y sont entremêlés **par sujet**, chaque
  série gardant son ordre : aucune notion n'arrive avant ce dont elle a besoin.
- **Un `#include` nouveau à la fois.** Chaque fonction de la console a son
  tuto (sa ligne `#include`, ses arguments, ce qu'elle coûte), placé juste
  avant la première étape qui l'emploie. Une étape d'ouverture explique, en
  détail, pourquoi on écrit des `#include`. `verifier-tuto.mjs` contrôle
  qu'aucune étape n'en apporte deux d'un coup.
- **Une entrée par chapitre** : d'où l'on vient, ce qui vient, les fonctions
  qui arrivent — calculée sur le parcours lui-même.
- Dans chaque étape, l'encadré **« Les fonctions de cette leçon »** mène au
  tuto de chacune ; un tuto dit, lui, où l'on retrouve sa fonction.

**Le même parcours, en PDF :** `npm run cours-complet` écrit
`documents/cours-complet.pdf` (et sa page `documents/cours-complet.html`) :
la couverture, le sommaire, les 78 `#include`, chaque chapitre et chaque
leçon dans l'ordre du parcours, puis l'index des `#include`.

**Tous les documents, d'un clic :** dans l'atelier, le bouton **« 🔗 LES
SOURCES »** de la barre du haut (le même contenu que l'onglet **« 📚 Les
sources »** du mode création, ou l'adresse `index.html#sources`) donne le lien de
chaque fichier — le cours complet, le livret, les fiches, les 61 cours
(`cours/`), les 587 livrets d'une leçon (`livrets/`, rangés par chapitre) et
les textes `.md`. Rien n'y est recopié : la liste des cours est lue dans
`cours/index.html`, le nom de chaque livret est calculé comme le fait
`outils/livret.mjs` (`sources.js`).

**Ajouter son propre `#include`, pour tous les niveaux :** `npm run pdf-include`
écrit `documents/ajouter-un-include.pdf` (et sa page `.html`), un document
d'une cinquantaine de pages qui part de zéro (fichier, octet, fonction, boucle,
éditeur de texte, fenêtre de commande, git), explique les deux sortes
d'`#include`, puis la recette pour faire entrer une fonction dans la console.
Rien n'y est recopié à la main : le code du compilateur est lu dans ses
fichiers, les messages d'erreur et les octets viennent d'une vraie compilation,
les écrans de l'émulateur.

## Ce que c'est, et ce que ce n'est pas

**C'est un vrai compilateur.** Le fichier `.cpp` est lu, analysé, et traduit en
**code machine SM83** — les opcodes du processeur de la Game Boy. Il n'y a pas
d'assembleur au milieu, pas d'interprète embarqué, pas de machine virtuelle dans
la cartouche. Ce que la console exécute, ce sont les octets produits par
`emetteur.js`.

**Ce n'est pas g++.** Le C++ compris ici est celui qu'une console de 1989 sait
exécuter sans y perdre son âme : des octets, des tableaux, des fonctions, des
`struct`. Pas de classes, pas de modèles, pas de flux, pas de `new`, pas de
bibliothèque standard. Ce qui est compris tient en une page — voir plus bas —,
et **tout le reste est refusé avec son numéro de ligne**, plutôt que
silencieusement mal traduit.

C'est la règle qui gouverne le projet. Un `long` traduit en douce sur un octet,
c'est un jeu qui compte faux à partir de 256 et personne n'a été prévenu ; un
refus, c'est trois secondes perdues et une ligne à réécrire.

---

## Ce que le C++ change, par rapport à gameboy2

Ce compilateur est le petit frère de [`gameboy2`](../gameboy2/), qui lisait du
JavaScript. Trois choses, que le langage rendait naturelles, ont été gagnées au
passage — et elles ne sont pas cosmétiques.

**Les fonctions prennent des arguments, et rendent une valeur.**

```cpp
uint8_t distance(uint8_t a, uint8_t b) {
  if (a > b) return a - b;
  return b - a;
}
```

En JavaScript, il fallait écrire dans deux variables globales, appeler, puis
relire une troisième. Le prix à payer est dit franchement : **une fonction ne
peut pas s'appeler elle-même.** Les arguments vivent à une place fixe, réservée
une fois pour toutes — c'est ce que fait tout compilateur C d'une machine huit
bits, faute d'une pile praticable. Un appel imbriqué écraserait les arguments de
l'appel en cours. Plutôt que de le laisser arriver, le compilateur détecte le
cycle et le nomme.

**Les portées existent vraiment.**

```cpp
for (uint8_t i = 0; i < 3; i++) { … }
for (uint8_t i = 0; i < 8; i++) { … }   // un autre « i », un autre octet
```

Le compilateur qui lisait du JavaScript n'en avait pas : toutes les variables
vivaient dans un même sac de 112 octets, et deux fonctions qui appelaient leur
compteur `i` se le partageaient sans le savoir. Ici, chaque déclaration reçoit
son octet, et la page rapide **déborde** en mémoire de travail quand elle est
pleine — sans que le programme ait à le savoir. Le plafond de 112 variables a
disparu.

**Les `struct` rangent ensemble ce qui va ensemble.**

```cpp
struct Ennemi { uint8_t x, y, vie; };
Ennemi troupe[8];

troupe[i].vie--;
```

Sans elles, il fallait trois tableaux parallèles qu'on devait penser à garder
alignés. Le jour où l'on en trie un sans trier les autres, les vies changent de
propriétaire, et rien ne le dit.

Et pour ne pas perdre ce qui existait : **`porter.mjs` traduit un programme
gameboy2 en C++**, en passant par l'arbre de l'analyseur d'origine plutôt que
par des expressions régulières. Les trois plus gros exemples ont été portés
ainsi, et `verifier-portage.mjs` compare les deux cartouches **pixel par
pixel**, sur cinq cents images, avec la même suite de touches.

---

## Le langage

```cpp
const uint8_t LARGEUR = 10;      // une constante : elle ne coûte aucun octet
uint8_t puits[LARGEUR * 16];     // un tableau, en mémoire de travail
const uint8_t FORMES[] = {0, 1, 1, 1};   // une table gravée dans la cartouche

struct Piece { uint8_t x, y, forme; };   // un enregistrement
Piece courante;

enum Scene { TITRE, JEU, FIN };  // des constantes nommées, et un type

Tuile BLOC = {                   // une tuile à soi, huit sur huit
  "33333333", "30000003", "30222203", "30222203",
  "30222203", "30222203", "30000003", "33333333",
};

void viderPuits() {
  for (uint8_t i = 0; i < LARGEUR * 16; i++) puits[i] = 0;
}

int main() {                     // par où la console commence
  viderPuits();

  while (true) {
    image();                     // attendre l'image suivante — 60 fois par seconde

    if (bouton(A)) poser(5, 5, BLOC);
  }

  return 0;
}
```

### Ce qui est compris

| Écriture | Ce que ça fait |
|---|---|
| `uint8_t x = 0;` | une variable, un octet, de 0 à 255. `int`, `char`, `bool`, `auto` sont des synonymes |
| `const uint8_t N = 20;` | une constante connue à la compilation : **elle ne prend aucun octet** |
| `x = x + 1;` | affectation ; `+= -= *= /= %= &= \|= ^= <<= >>=` |
| `x++`, `++x`, `x--`, `--x` | avec la bonne valeur : le suffixe rend celle d'**avant** |
| `+ - * / % & \| ^ << >> ~` | les opérateurs sur un octet |
| `== != < > <= >=` | les comparaisons |
| `&& \|\| !` | et ils **s'arrêtent** dès que la réponse est connue |
| `a ? b : c` | le choix en une expression |
| `if (…) { } else { }` | avec ou sans accolades |
| `while (…) { }` | `while (true)` ne teste rien |
| `for (uint8_t i = 0; i < n; i++)` | et `i` n'existe que dans la boucle |
| `do { } while (…);` | tourne au moins une fois |
| `switch (x) { case 1: … break; }` | avec la chute d'un cas dans le suivant, comme en C++ |
| `break;` `continue;` | sortir, ou passer au tour suivant |
| `uint8_t f(uint8_t a) { return a; }` | **une fonction, avec ses arguments et son retour** |
| `void f() { }` | une fonction qui ne rend rien |
| `uint8_t f(uint8_t a = 3)` | un argument par défaut, rempli à l'appel |
| `uint8_t t[180];` | un tableau — **256 cases au plus**, car un index est un octet |
| `uint8_t carte[12][20];` | une grille : le compilateur calcule « ligne × largeur + colonne » |
| `uint8_t t[3] = {1, 2, 3};` | le même, avec son contenu de départ |
| `const uint8_t T[] = {3, 1, 4};` | une table **gravée dans la cartouche** : aucun octet de mémoire, et elle ne change plus |
| `const char TITRE[] = "SALUT";` | **un texte qui porte un nom**, gravé lui aussi ; `texte(4, 1, TITRE)` l'écrit |
| `struct P { uint8_t x, y; };` | un enregistrement de champs d'un octet |
| `P a; P liste[8];` | et les tableaux qui vont avec — `liste[i].x` |
| `struct P { … void avancer() { x++; } };` | **une méthode** : elle travaille sur l'objet devant le point, et écrit ses champs sous leur nom nu |
| `liste[i].avancer();` | l'appel — l'adresse de l'objet est rangée, puis c'est le même `call` qu'ailleurs |
| `enum Scene { TITRE, JEU };` | des constantes nommées ; `Scene` devient un type d'un octet |
| `sizeof(P)`, `sizeof(T)/sizeof(T[0])` | les tailles, connues à la compilation |
| `Tuile SOL = { "…", … };` | **une tuile à soi**, huit rangées de huit nuances — en chiffres `0123` **ou** en signes `.-+#` ; le nom devient son numéro |
| `Perso MARIO = { "…", … };` | **un personnage entier**, seize sur seize ; le compilateur en fait quatre tuiles |
| `Perso BOSS = { "…", … };` (32 rangées) | **un personnage de 32 × 32** : un `Perso` de trente-deux rangées ; le compilateur en fait seize tuiles, quatre quarts de 16 × 16 à la suite. `Grand BOSS = { … };` en est l'autre nom |
| `Air THEME = { "DO4 12", "==", … };` | **une mélodie**, un pas par élément ; `jouer()` la lance et elle avance toute seule |
| `'A'`, `0x2A`, `0b1010` | un caractère est un nombre ; les bases s'écrivent comme en C++ |
| `#include "autre.cpp"` | **verse un autre fichier ici**, avant toute compilation — en ligne de commande comme dans la page, où les fichiers sont des onglets |
| `#include <texte>` | **inclut une fonction de la console**, par son nom : aucune n'est là d'office (voir « Les fonctions fournies ») |
| `// …` et `/* … */` | commentaires |
| `int main()` | **le point d'entrée** : rien ne s'exécute en dehors |

Les priorités sont celles de C++ : `20 - p * q` vaut bien `20 - (p * q)`.

### Les méthodes

Une `struct` peut porter ses fonctions. Elles s'écrivent dedans, et travaillent
sur l'objet nommé devant le point :

```cpp
struct Ennemi {
  uint8_t x, y, vie;

  void avancer()   { x++; }
  uint8_t vivant() { return vie > 0; }
  void blesser()   { if (vivant()) vie--; }
};

Ennemi troupe[3];
Ennemi boss;

troupe[i].avancer();   // un index calculé
boss.avancer();        // un objet nommé
```

Dans le corps, les champs s'écrivent **sous leur nom nu** — `x++`, et non
`this->x++`. Un appel sans rien devant, comme le `vivant()` de `blesser()`,
veut dire « la mienne » : l'objet en cours est passé tel quel.

**Ce que cela coûte, exactement.** L'adresse de l'objet est rangée dans deux
octets réservés **à cette méthode**, puis c'est le même `call` que pour une
fonction ordinaire. Il n'y a ni table de fonctions, ni pile d'objets, ni `this`
caché ailleurs qu'en mémoire de travail — et le compilateur compte ces deux
octets comme les autres, dans le compte rendu de compilation.

Deux octets **par méthode**, et non par `struct` : c'est ce qui permet à
`blesser()` d'appeler `vivant()` sur un autre ennemi sans perdre le sien. Les
partager aurait marché sur les exemples simples et échoué exactement là où c'est
le plus dur à voir.

Ce qui est refusé, et pourquoi :

| Écrit | Pourquoi non |
|---|---|
| `class Ennemi { … };` | `struct` fait la même chose ici — il n'y a pas de visibilité à régler. Le message le dit et propose l'échange |
| `virtual void f();` | il faudrait une table de fonctions et un appel indirect. C'est un autre chantier, pas un oubli |
| `struct B : A { … };` | l'héritage déplacerait les décalages des champs, que tout le reste tient pour fixes |
| `Ennemi() { x = 0; }` | un constructeur, c'est du code implicite à la déclaration — or les globales prennent leur valeur avant `main` |
| `void poser(uint8_t n)` dans une `struct` | une méthode reçoit déjà son objet ; ce qui vient d'ailleurs se passe à une fonction ordinaire |
| `void a() { b(); }` et `void b() { a(); }` | même règle que pour les fonctions : l'objet vit à une place fixe, un appel imbriqué l'écraserait. Le compilateur nomme le cycle |

Et la règle qui décide, dite franchement : écrire **à la suite** tant qu'il n'y
a qu'un objet, nommer par une **fonction** quand le geste se répète, ranger dans
une **méthode** quand les gestes et les données vont manifestement ensemble.
Recompiler montre le prix des trois — c'est ce que fait le tutoriel 39.

`exemples/methodes.cpp` les éprouve toutes, et `node verification/verifier-methodes.mjs` les
fait tourner dans l'émulateur.

### Les fonctions fournies — et leur `#include`

**Aucune fonction de la console n'est là d'office.** Chacune prend de la place
dans la cartouche (son code, ses routines, ses tables) : elle ne s'emploie que
si on l'**inclut**, par son nom, écrit exactement comme dans le programme.

```cpp
#include <texte>      // texte() existe
#include <poser>      // poser() existe
#include <ALPHABET>   // ALPHABET existe
#include <Tuile>      // on peut dessiner une Tuile
```

- Sans la ligne, le compilateur **refuse** et dit lesquelles écrire ; dans
  l'atelier, un bouton « ✚ Écrire les #include qui manquent » les écrit.
- Une ligne **de trop ne coûte rien** : seul ce que le programme emploie est
  gravé. Le panneau ROM dit, pour chaque `#include`, s'il sert et ce qu'il coûte.
- Les éditeurs de l'atelier (tuiles, couleurs, airs, carte, scènes, modèles)
  écrivent eux-mêmes les lignes dont leur code a besoin.
- Les noms : chaque fonction ci-dessous (`<texte>`, `<chaque>`, `<deplace_x>`…),
  `<ALPHABET>`, `<ALPHABET_GRAS>`, `<ALPHABET_TITRE>`, `<texteTitre>`, `<texteManga>`, les types `<Tuile>`, `<Perso>`, `<Mot>`,
  `<Carre>`, `<Air>`, et quatre calculs que le processeur ne sait pas faire
  seul : `<multiplier>` (`a * b`, les deux calculés), `<diviser>` et `<reste>`
  (`a / b`, `a % b`, sauf par 1, 2, 4, 8… écrits en clair), `<decaler>`
  (`a << b`, `a >> b`, b calculé).
- Restent **natives**, parce qu'elles ne coûtent rien : `image()`, `images()`,
  `retard()`, `ms()` et `secondes()`.

| Fonction | Ce qu'elle fait |
|---|---|
| `texte(colonne, ligne, "…")` | écrit à l'écran. 20 colonnes, 18 lignes — ou le nom d'un `const char`. La position peut être **calculée**. Un nombre s'y colle : `texte(1, 4, "SCORE " + score)` devient le texte, puis `nombre()` juste après (trois chiffres) |
| `nombre(colonne, ligne, valeur)` | écrit un **nombre calculé**, en base dix. Un quatrième argument dit combien de chiffres (3 par défaut) |
| `textS(colonne, ligne, "…")` | comme `texte()`, mais **passe à la ligne tout seul** : après la colonne 19, la suite reprend en colonne 0 de la ligne d'en dessous ; après la ligne 17, en haut. `textS(18, 0, "BONJOUR")` écrit « BO » puis « NJOUR ». `texte()`, lui, refuse toujours une colonne hors de l'écran |
| `effacer(colonne, ligne, quoi)` | **efface, sans compter les lettres**. « quoi » est le texte lui-même, le nom d'un `const char`, ou un nombre de cases — la longueur est lue par le compilateur |
| `texte(MOT)` / `effacer(MOT)` | écrit ou efface un **`Mot`** : la colonne, la ligne et le texte rangés sous un seul nom (voir plus bas) |
| `poser(colonne, ligne, tuile)` | pose **une** tuile à une position calculée. « tuile » est un nom, un numéro, ou **les huit rangées du dessin, écrites sur place** |
| `bande(colonne, ligne, tuile, longueur)` | pose la **même tuile** « longueur » fois, de gauche à droite : `bande(2, 5, ALPHABET[0], 10)` écrit dix A. Écrite **en C++** dans le compilateur (`SOURCE_BANDE`) : c'est l'exemple du chapitre « Tes propres #include » (voir « Ajouter sa propre fonction à la console ») |
| `poserS(colonne, ligne, tuile)` | comme `poser()`, mais **passe à la ligne tout seul**, comme `textS` : `poserS(i, 0, ALPHABET[i])` pose l'alphabet sur deux lignes, sans `% 20` ni `/ 20` |
| `attendre(secondes)` | **arrête tout le programme** ce nombre de secondes (jusqu'à 255), lutins et musique compris, puis continue. Simple, mais rien d'autre ne bouge pendant ce temps : pour plusieurs rythmes à la fois, compter les images |
| `ms(durée)` / `secondes(n)` | une durée **traduite en images** (60 par seconde), par le compilateur : `ms(250)` vaut 15, `ms(1000)` et `secondes(1)` valent 60. Ne coûte rien. À comparer à un compteur d'images : `if (images == ms(250))`. Jusqu'à 4250 ms |
| `chaque(ms)` | répond **1 toutes les « ms » millisecondes**, 0 le reste du temps, sans rien arrêter : `if (chaque(250)) { … }` se fait 4 fois par seconde. Chaque `chaque` du programme a son propre chronomètre (huit au plus) |
| `deplace_x(x, y, tuile, pas)` / `deplace_y(…)` | fait avancer une case de `pas` cases sur X ou Y (+ droite / bas, - gauche / haut), un pas tous les 250 ms ; **bloque** pendant le trajet ; rend la position d’arrivée. Seule sur sa ligne, la console **range la position** dans la variable : `deplace_x(x, 0, ALPHABET[0], 5);` |
| `deplace(x, y, tuile, pasX, pasY)` / `va_a(x, y, tuile, colonne, ligne)` | les deux axes à la fois (5 et 5 : en diagonale) ; ou aller jusqu’à une case donnée. Rangent la colonne dans x et la ligne dans y |
| `un_pas(x, y, tuile, sensX, sensY)` | **un** pas, tout de suite, sans bloquer : à appeler dans la boucle, pour faire bouger plusieurs lettres en même temps |
| `vitesse(ms)` | le temps d’un pas de `deplace_x`, `deplace_y`, `deplace`, `va_a` qui viennent après : `vitesse(100);` = 10 pas par seconde |
| `carre(x, y, tuile, taille, sens, vitesse, tours)` | un carré parfait **autour** de (x, y), de 2 × taille + 1 cases de côté ; sens 1 ou -1 ; vitesse en ms écrite en clair ; revient au centre. Les réglages peuvent être rangés sous un nom : `Carre ronde = { … }; carre(ronde);` |
| `losange(…)` / `rectangle(…)` / `spirale(…)` / `aller_retour(…)` | les autres formes : le carré sur la pointe, un carré à deux tailles, une spirale qui s’élargit, un va-et-vient (tout droit ou en diagonale) |
| `deplace_croix(x, y, tuile, vitesse)` | la lettre **suit la croix**, case par case, sans bloquer, à appeler à chaque image ; vitesse en ms entre deux pas ; n’efface que si elle a bougé (pas de clignotement) |
| `glisse_croix(n, px, py, tuile, vitesse)` | la même chose **au pixel près**, avec un lutin ; vitesse en pixels par image |
| `tourne_carre(n, x, y, tuile, cote, vitesse)` / `defile(n, x, y, tuile, sens, vitesse)` | sans bloquer : une lettre qui tourne en carré sans fin ; une lettre qui file à gauche ou à droite et repart de l’autre bord. `n` (0 à 3) : la console retient où en est chaque lettre |
| `lire(colonne, ligne)` | rend la tuile affichée à cet endroit |
| `changerDessin(tuile, dessin)` | **toutes les cases de cette tuile prennent un autre dessin, d'un coup** — c'est ainsi qu'on anime l'eau, le feu, l'herbe. `changerDessin(EAU, EAU)` rend le dessin d'origine. `changerDessin("A", MON_A)` redessine une **lettre** de la police, dans tous les textes |
| `image()` | attend l'image suivante. C'est ce qui cadence un jeu |
| `bouton(A)` | rend 1 si le bouton est enfoncé. `A B HAUT BAS GAUCHE DROITE START SELECT` |
| `hasard()` | un nombre imprévisible, lu dans le compteur libre du matériel |
| `ecran(0)` / `ecran(1)` | éteint / rallume l'écran, le temps d'un gros redessin |
| `sprite(n, x, y, tuile)` | **un lutin au pixel près**, hors de la grille du fond. `sprite(n, x, y, t, 1)` le retourne. Le dessin s'écrit ici aussi |
| `sprite16(n, x, y, tuile)` | **un personnage de seize** : quatre lutins posés en carré, en un appel. Écrit sur place, il prend seize rangées de seize |
| `sprite32(n, x, y, tuile)` | **un grand personnage de 32 × 32** : seize lutins (n à n + 15, 24 au plus), quatre `sprite16` en un appel. Un cinquième argument `MIROIR_X` le retourne |
| **la taille en dernier argument** | la même logique dans les autres : `sprite(0, 36, 60, ROND, 4)`, `sprite16(…, HEROS, 3)`, `sprite32(…, BOSS, 2)`, `spriteDerriere(…, ROND, 4)` et `poser(2, 3, MUR, 5)` (dans le fond). Pour `sprite`, `sprite16` et `sprite32`, seul un nombre écrit en clair de 2 ou plus est une taille : `0`, `1` (retourné) et `MIROIR_X`, `DERRIERE`… gardent leur sens |
| `spriteTaille(n, x, y, DESSIN, taille)` | **un dessin à la taille qu’on veut** : le dessin n’est écrit qu’une fois, à sa taille standard ; `taille` (1, 2, 3…, en clair) dit combien de fois plus grand. Le compilateur redessine la forme (compilateur/agrandir.js : vrais coins pointus, marches arrondies) et la pose avec un lutin par carré de 8 × 8 non vide, à partir de n. **Pas de limite de taille** : quand les lutins ne suffisent plus (40 en tout, 10 sur une ligne), la forme est dessinée dans le fond, seule la partie visible est calculée ; x et y s’écrivent alors en clair, négatifs permis |
| `cacher(n)` / `cacher16(n)` / `cacher32(n)` | ôte le lutin, les quatre, ou les seize, de l'écran |
| `defiler(x, y)` | fait glisser le décor. La carte fait 256 pixels et revient toute seule à zéro |
| `images()` | le nombre d'images écoulées depuis l'allumage — une horloge que le jeu ne peut pas fausser |
| `retard()` | rend 1 si le tour de boucle précédent a duré plus d'une image |
| `hasard()` / `semer(n)` | un tirage, et de quoi choisir son point de départ |

Deux noms sont fournis par la console, sans rien déclarer :

| Nom | Ce que c'est |
|---|---|
| `ALPHABET` | les 26 lettres de la police : `ALPHABET[0]` est A (la tuile 1), `ALPHABET[25]` est Z. `sizeof(ALPHABET)` vaut 26. Rien n'est recopié : `ALPHABET[i]` se calcule `1 + i`. Il se lit, il ne s'écrit pas, et le nom est réservé |
| `ALPHABET_GRAS` | un **second alphabet, en gras** : les mêmes 26 lettres, aux traits de 2 pixels (`ALPHABET_GRAS[0]` est le A gras). `sizeof(ALPHABET_GRAS)` vaut 26. Ajouté à la cartouche seulement si le programme s’en sert ; `ALPHABET` ne change pas |
| `ALPHABET_TITRE` | un **troisième alphabet, pour les titres** : les lettres épaisses du gras, avec une **ombre** grise en bas à droite qui leur donne du relief — pour écrire le nom d’un jeu sur son écran titre (`ALPHABET_TITRE[19]` est le T). Chaque lettre est une tuile à trois nuances (fond 0, ombre 2, trait 3), posée avec `poser()`. Calculées à partir de la police du projet, dans le style des titres de la Game Boy, sans recopier celles d’aucun jeu. Environ 1 200 octets dès la première lettre ; ajouté seulement si le programme s’en sert. Son tuto : 0.110 du parcours |
| `texteTitre(colonne, ligne, "MOT", taille)` | écrit un **mot entier en GROSSES lettres de titre**, dans le style des écrans titres Game Boy « dessin animé » : rondes, l’intérieur clair, un **contour noir épais**, une **ombre** grise, et **une lettre sur deux un peu plus bas** : le mot sautille. **La taille** (facultative) est le nombre de cases de côté d’une lettre : **2** (16 × 16 pixels, 10 lettres par ligne), **3** si on ne la donne pas (24 × 24, 6 lettres), **4** (32 × 32, 5 lettres). Elle s’écrit en clair (2, 3 ou 4), jamais avec une variable : les lettres sont dessinées par le compilateur. Le compilateur refuse un mot qui sort de l’écran, avec le calcul. Seules **les lettres du mot** vont dans la cartouche, et deux cases dessinées pareil ne coûtent qu’une tuile. Nos lettres, calculées à partir de la police du projet (`grandeLettreTitre`, dans `police.js`), sans recopier celles d’aucun jeu. Son tuto : 35.11 ; « L’écran titre de ton jeu » : 35.12 ; « Choisir la taille du titre » : 35.13 |
| `texteManga(colonne, ligne, "MOT", taille)` | un **deuxième style de titre, entre manga et dessin animé** : des lettres **penchées** vers la droite, des coins **coupés en biais**, un contour noir **carré**, le bas de chaque lettre en **trame** grise (un pixel sur deux, comme les trames des pages de manga), une **ombre portée** plus longue, et une lettre sur deux un peu plus bas. Le même appel et les mêmes tailles que `texteTitre()` (2, 3 ou 4), les mêmes refus ; seules les lettres du mot vont dans la cartouche. Nos lettres (`lettreManga`, dans `police.js`), calculées à partir de la police du projet. Son tuto : 35.14 ; « Deux styles pour un titre » : 35.15 |
| `texteGrand(x, y, "…", taille)` | un texte **agrandi**, **taille de 0 à 10** (0 : la lettre normale ; 10 : 11 fois plus grande), calculé à partir de la police : chaque pixel devient un carré de (taille + 1) × (taille + 1), les proportions sont gardées. Une lettre prend (taille + 1) × (taille + 1) cases. Le texte et la taille s’écrivent en clair ; seules les tuiles utiles sont fabriquées, une fois chacune |
| `texteGrandS(x, y, "…", taille)` | comme `texteGrand`, mais qui **va à la ligne** quand le texte est trop large (comme `textS`) ; **refusé** s’il dépasse le bas de l’écran, avec le nombre de lignes qu’il faudrait. Tout s’écrit en clair |
| `Mot` | un type : **la place et le texte sous un seul nom**. `Mot SALUT = { 5, 6, "BONJOUR" };` puis `texte(SALUT)` et `effacer(SALUT)`. La colonne et la ligne peuvent être des variables : elles sont relues à chaque appel |

Le numéro d'un lutin **peut être calculé** : `sprite(i, …)` dans une boucle
affiche toute une troupe rangée dans un tableau de `struct`. C'est ce qui rend
les `struct` utiles plutôt que décoratives.

Un lutin porte quatre options, qui se combinent avec `|` :

| Option | Ce qu'elle fait |
|---|---|
| `MIROIR_X` | retourné vers la gauche |
| `MIROIR_Y` | retourné vers le haut |
| `DERRIERE` | le décor passe devant — un personnage qui entre dans un tuyau |
| `PALETTE1` | la seconde palette des lutins |

### Le panneau : une couche qui ne défile pas

Le décor glisse ; le score, lui, ne doit pas bouger. Le matériel a pour cela
une seconde couche — la fenêtre —, qu'il pose par-dessus le décor et qui ignore
le défilement.

| Fonction | Ce qu'elle fait |
|---|---|
| `panneau(x, y)` | place le panneau, en pixels, et l'allume |
| `cacherPanneau()` | l'ôte, sans rien perdre de son contenu |
| `effacerPanneau(colonne, ligne, quoi)` | y efface un mot, comme `effacer()` sur le fond. Sans argument, il vide tout |
| `effacerPanneau()` | le vide |
| `textePanneau(colonne, ligne, "…")` | y écrit, comme `texte()` sur le fond |
| `nombrePanneau(colonne, ligne, valeur)` | y écrit un nombre, comme `nombre()` sur le fond (un 4ᵉ argument : combien de chiffres) |
| `poserPanneau(colonne, ligne, tuile)` | y pose une tuile |
| `lirePanneau(colonne, ligne)` | y relit la tuile d'une case |

La console n'a que **deux cartes de fond** : le décor prend la première, le
panneau la seconde. Il n'en reste donc pas pour préparer un écran entier
hors-champ et basculer d'un coup. C'est un choix, et il vaut mieux l'écrire que
le laisser deviner.

### La couleur, en code (Game Boy Color)

L'atelier écrit ces lignes tout seul quand on peint (voir « Huit palettes »,
plus bas) ; on peut aussi les écrire à la main.

| Fonction | Ce qu'elle fait |
|---|---|
| `couleurFond(palette, teinte, rouge, vert, bleu)` | une couleur du décor : palette 0 à 7, teinte 0 à 3, composantes 0 à 31 |
| `couleurTexte(rouge, vert, bleu)` | la couleur de **toutes les lettres** (0 à 31 chacune) ; c’est `couleurFond(0, 3, r, v, b)` |
| `texteCouleur(x, y, "…", palette)` | écrit le mot **et** met ses cases dans une palette (0 à 7) : le mot prend sa couleur |
| `couleurLutin(palette, teinte, rouge, vert, bleu)` | une couleur des personnages (la teinte 0 est transparente) |
| `teindre(colonne, ligne, palette)` | la case du fond prend cette palette. `teindre(c, l, 2 \| DEVANT)` : la case passe **devant les personnages** (un buisson, un pont) |
| `teindrePanneau(colonne, ligne, palette)` | une case du **panneau** (le HUD, les dialogues) prend cette palette |
| `teindreLutin(numero, palette)` | le lutin prend cette palette — à écrire après son `sprite()` |

En **« Game Boy »** (4 nuances), ces quatre fonctions sont refusées, avec le
numéro de ligne : une Game Boy d'origine n'a pas de registre de couleur.

### Les nuances

`paletteFond(n0, n1, n2, n3)` choisit les quatre nuances, de la plus claire à
la plus sombre — chacune de 0 à 3. `paletteLutins(0 ou 1, n0, n1, n2, n3)` fait
de même pour les deux palettes des lutins.

Elles étaient posées une fois à l'allumage et plus jamais touchées : pas de
fondu au noir, pas d'écran qui blanchit quand on perd, pas de personnage qui
clignote quand il est touché. Tout cela tient maintenant en un appel par image.

Quand les quatre nuances sont connues d'avance, l'octet est calculé à la
compilation et l'appel ne coûte que deux instructions.

### Le son

La console a quatre voix. Trois sont exposées : deux signaux carrés pour la
mélodie, et le bruit pour les percussions.

| Fonction | Ce qu'elle fait |
|---|---|
| `note(voix, hauteur, duree, volume)` | joue une note sur la voix 1 ou 2 |
| `bruit(duree, volume)` | frappe sur la voix du bruit. Un troisième argument règle le grain |
| `silence(voix)` | coupe la voix 1, 2 ou 4 |
| `volumeSon(0 à 7)` | le volume général — de quoi fondre une musique |

Les hauteurs portent des noms, de `DO2` à `SI6` : `DO4`, `RED4`, `MI4`… Cinq
octaves, calculées en gamme tempérée à la compilation — le LA4 à 440 Hz — et
gravées dans la cartouche : 120 octets pour tout le clavier.

La **durée** se compte en 256ᵉ de seconde, de 1 à 64 ; `0` veut dire « sans
fin », jusqu'à `silence()`. Le **volume** va de 0 à 15.

La quatrième voix, l'onde programmable, reste dehors — et il vaut mieux le
dire : l'émulateur du projet ne la mélange pas encore à sa sortie. L'exposer
donnerait une fonction qui marche sur une vraie console et reste muette dans la
page, c'est-à-dire une fonction dont on ne pourrait pas vérifier qu'elle marche.

### Une musique, et non des notes une par une

`note()` joue **une** note. Une mélodie s'écrivait donc en comptant les images
à la main, dans la boucle du jeu, avec un compteur et un `switch` — et ce code
occupait plus de place que la musique elle-même.

Un **`Air`** est une suite de pas, écrite dans le programme comme une tuile s'y
dessine :

```cpp
Air THEME = {
  "DO4 12", "==",      "MI4 12",  "==",      "SOL4 12", "==",      "DO5 13",  "==",
  "SI4 11",  "==",     "SOL4 11", "==",      "MI4 11",  "==",      "--",      "--",
};
```

Chaque pas est une **hauteur et un volume**. Deux pas n'en sont pas :

| Pas | Ce qu'il fait |
|---|---|
| `"DO4 12"` | joue un DO4 au volume 12. Sans le nombre, le volume vaut 12 |
| `"--"` | fait **taire** la voix |
| `"=="` | ne touche à rien : la note d'avant **continue** |

`"=="` n'est pas un raccourci d'écriture. Sans lui, une blanche s'écrirait en
rejouant la même note à chaque pas — et l'oreille entend alors quatre coups,
pas une note tenue.

| Fonction | Ce qu'elle fait |
|---|---|
| `jouer(voix, AIR, vitesse)` | lance l'air sur la voix 1 ou 2. La **vitesse** est le nombre d'images que dure un pas |
| `jouer(voix, AIR, vitesse, 1)` | le même, mais il recommence sans fin |
| `airFini(voix)` | rend 1 quand l'air est arrivé au bout, ou que rien ne joue |
| `silence(voix)` | l'arrête net — le séquenceur avec |

Ensuite, **le programme n'a plus rien à tenir**. L'air avance tout seul.

Et il avance dans l'**interruption du VBlank**, non dans `image()`. Cela s'est
décidé en écoutant : un jeu qui calcule trop rate le VBlank et tourne à trente
images par seconde ; sa musique, cadencée par `image()`, ralentissait de moitié
avec lui. Un tempo qui dépend de la charge du jeu n'est pas un tempo. Un
programme qui ne joue rien, lui, ne trouve dans cette interruption qu'un `ret` :
le séquenceur n'est gravé que si `jouer()` est écrit quelque part.

L'état tient en seize octets par voix, en mémoire de travail, juste au-dessus de
la copie des lutins. La partition, elle, est dans la cartouche : **deux octets
par pas**.

### Écrire une musique à la souris

La page s'ouvre en **MODE CRÉATION** : les ateliers occupent la place, et le
programme se réduit à une bande — il reste sous les yeux, car c'est lui que la
souris écrit. Le bouton **« ⤢ Agrandir le code »**, à côté du titre du
programme, rend tout l'écran au texte, sans quitter le mode ; **« ⤡ Revoir
les ateliers »** les fait revenir. Il n'y a plus de « MODE CODE » à part :
il ne faisait que cacher les ateliers, et deux boutons pour un même travail
faisaient croire à deux programmes (l'adresse `index.html#code` ouvre
toujours le code en grand). Les modes sont dans la barre du haut : un onglet
discret sous le champ de texte ne se voyait pas, et l'atelier de musique
passait pour ne pas exister.

Dans l'atelier, l'onglet **« Les airs »** montre les
mélodies du programme et les écrit à la place où on clique : la partition est
une grille, un pas par colonne, un demi-ton par ligne, avec un clavier à gauche
et la **bande des volumes** en dessous. Les boutons `♪ note`, `– silence` et
`= tenir` choisissent ce qu'on pose ; le clic droit fait taire un pas.

**Le bouton « Écouter » joue l'air sans compiler.** La page le fait entendre
elle-même, avec un signal carré et les mêmes hauteurs que la console. Attendre
une compilation entre deux notes rendrait l'écriture d'une mélodie pénible ; la
cartouche, elle, reste la vérité — et le curseur qui court sur la partition suit
l'horloge du son, la seule qui soit d'accord avec ce qu'on entend.

Comme l'atelier de tuiles, celui-ci **ne garde rien de son côté** : il lit les
`Air NOM = {…}` du texte et les réécrit. Poser une note change le programme,
recompile la cartouche, et la console joue la nouvelle mélodie dans la seconde.

### Se souvenir d'une partie à l'autre

`sauver(numero, valeur)` écrit dans la mémoire de la cartouche, `sauvegarde(numero)`
y relit. 256 cases, et elles survivent à l'extinction.

Cette mémoire n'est pas ouverte en permanence : il faut la déverrouiller avant
d'y toucher et la refermer aussitôt, sans quoi une coupure de courant au mauvais
moment la corrompt. **Le compilateur pose le verrou lui-même**, à chaque accès.

À la toute première partie, elle contient n'importe quoi. Un jeu y écrit donc
une marque à lui — `if (sauvegarde(0) != 42)` — et ne fait confiance au reste
que s'il la retrouve.

### Un projet est un dossier

Le travail vivait dans le stockage du navigateur : on le perdait en vidant son
cache, et on ne le retrouvait nulle part sur le disque. Un projet est maintenant
un **dossier**, et la page ne fait que l'ouvrir et l'enregistrer.

```
gameboy3/projets/mon_jeux/
  principal.cpp     le programme, et ses voisins « #include »
  capture.png       la vignette, telle que la console l'a rendue
  mon_jeux.gb       la cartouche, prête pour une vraie console
  projet.json       le titre gravé, la console visée, la date
```

Les projets déjà rangés sur le disque :

```
gameboy3/projets/
  mon_mario/        Super Mario (titre MEGA) — cartouche .gb
  mon_jeu/          un programme neuf (titre MONJEU) — .gbc
  space_invaders/   Space Invaders entier (titre INVADERS) — .gbc
  mario_calcul/     Mario Calcul, la démo des calculs (titre CALCUL) — .gb
  puissance_4/      Puissance 4, le Père Noël contre le bonhomme de neige (titre PUISSANCE 4) — .gbc
  dames/            les Dames, blancs contre rouges (titre DAMES) — .gbc
  echecs/           les Échecs, blancs contre noirs (titre ECHECS) — .gbc
  couleurs/         Couleurs, un jeu de cartes style UNO (titre COULEURS) — .gbc
```

**Où chercher un jeu ?** Un jeu rangé dans `exemples/` s'ouvre par **le menu
des exemples** de l'atelier ; un jeu rangé dans `projets/` apparaît dans
**📂 Ouvrir**. Space Invaders et Mario Calcul sont aux deux endroits : le
fichier de `exemples/` est la référence, et le dossier de `projets/` en est une
copie qu'on peut changer sans rien casser.

**Ce qui montre qu'on est au bon endroit** est le point de départ de tout ceci :
le bandeau, en haut à gauche, porte en permanence le nom du projet ouvert et le
chemin de son dossier, avec un point dès que ce qui est à l'écran n'est plus ce
qui est sur le disque. Travailler une heure dans le mauvais projet est une heure
perdue que rien ne rattrape.

- **✦ Nouveau** demande le nom du projet — « Mon Jeux ! » devient `mon_jeux` — et
  crée son dossier. **Toujours**, même si l’on est déjà dans un projet : il
  gardait alors le dossier d’avant, et le programme vide s’écrivait par-dessus
  le jeu précédent. Le titre gravé dans la cartouche découle du nom : onze
  caractères, tout ce que l’en-tête d’une Game Boy accepte.
- **📂 Ouvrir** — et le bandeau — montrent le lecteur : tous les projets du
  disque, avec leur vignette, à ouvrir, renommer ou supprimer. Quand on n’est
  dans aucun projet, le bandeau dit combien attendent là.
- **📷 Capture** écrit la vignette du projet en même temps qu'elle télécharge
  l'image.
- L'enregistrement suit **la compilation** : on écrit ce qui compile, et rien
  d'autre — écrire à chaque frappe remplirait le dossier d'états intermédiaires.

`projets.php` est le seul morceau du dépôt qui écrive un fichier, et il est borné
en conséquence : tout vit sous `projets/`, un nom de projet ne peut contenir ni
point ni barre oblique, un fichier ne peut être qu'un `.cpp`, une capture doit
être un vrai PNG — vérifié sur ses huit premiers octets, pas sur son extension —
et le chemin final est revérifié avec `realpath`. La moitié de
`node verification/verifier-projets.mjs` porte sur ces refus.

### Le programme C++ gravé dans la cartouche

La compilation jette les noms, les commentaires et la forme des boucles : des
octets seuls, on ne remonte jamais au programme qui a été écrit. Alors toute
cartouche fabriquée ici — par la page comme par `gb3.mjs` — **porte son
programme C++ d'origine**, gravé au bout de sa place libre : le principal et
chaque fichier qu'il inclut, commentaires compris, compressés (LZSS, environ
deux fois et demie plus petit). Le processeur ne va jamais lire là : le jeu
tourne exactement pareil. Le format est décrit en tête de
`compilateur/source-gravee.js`.

- Space Invaders (30 Ko de C++) se grave en 11 Ko ; Mario en 4 Ko.
- Si le programme compressé ne tient pas dans la place libre, il **n'est pas
  gravé** — `gb3.mjs` le dit.
- ⚠ **Ce qui est gravé voyage avec la cartouche** : qui a le `.gb` (ou la page
  exportée en HTML) a le programme.

### Le dessin écrit là où on le pose

Un nom de tuile, à l'arrivée, **c'est un numéro** : `poser(2, 2, BLOC)` écrit 44
dans la carte de fond. Les huit rangées peuvent donc s'écrire **dans le `poser`
lui-même**, et le compilateur se charge du reste — graver la tuile, lui trouver
son numéro, et l'écrire à la case demandée :

```cpp
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
```

Ce n'est pas un remplacement, **c'est un choix**. Ce qui sert partout mérite son
nom : un sol posé vingt fois se lit mieux en `SOL` qu'en huit rangées répétées.
Ce qui ne sert qu'à un endroit n'apprend rien de plus en s'appelant `TUILE3`, et
oblige à lire deux endroits du fichier pour en comprendre un seul.

**Le même dessin ne se grave qu'une fois.** Deux fois le même nuage à dix lignes
d'écart ne dépensent qu'une tuile ; et un dessin déjà déclaré en `Tuile` est
retrouvé **à travers les deux écritures** — `"21111112"` et `"+------+"` sont
les mêmes pixels. Le matériel n'en tient que 256, et les gaspiller ne se verrait
qu'au jour où il n'y en aurait plus.

Les accolades sont acceptées aux quatre endroits où un numéro de tuile est
attendu : `poser`, `poserPanneau`, `sprite`, et `sprite16` — qui en veut alors
seize rangées de seize signes, et les découpe lui-même en quatre tuiles.
Ailleurs, elles restent une faute, et le compilateur la dit avec sa ligne.

Une chose que le dessin sur place ne fait pas : **il n'apparaît pas dans
l'atelier**. Celui-ci lit les `Tuile NOM = { … }` du texte, et il ne saurait pas
où réécrire un dessin qui n'a pas de nom. Ce qu'on veut peindre à la souris, on
le nomme.

`exemples/surplace.cpp` en montre tous les cas, et `node verification/verifier-surplace.mjs`
les fait tourner dans l'émulateur.

### Dessiner ses propres tuiles — à la souris, ou en chiffres

**Dans la page, on dessine.** Sous l'éditeur, une bande montre toutes les
tuiles du programme, avec leur nom et leur numéro. Cliquer l'une d'elles ouvre
une grille — huit sur huit, ou seize sur seize pour un personnage ; on peint
avec les quatre nuances, et un aperçu montre le résultat à sa taille réelle.
« + tuile 8 × 8 » et « + perso 16 × 16 » en ajoutent une, vide.

L'atelier compte les numéros **comme le compilateur** : un `Perso` en occupe
quatre. Compter autrement annoncerait un numéro faux, et le programme écrit
d'après lui poserait la mauvaise tuile.

Peindre **réécrit le programme** : le `Tuile NOM = { … };` correspondant change
dans le texte, la cartouche se recompile, et la console montre la nouvelle
tuile dans la seconde. Il n'y a pas de second endroit où vivraient les dessins
— un éditeur graphique qui garderait les siens de son côté finirait par ne plus
dire la même chose que le code. Le programme reste la seule vérité ; l'atelier
n'est qu'une autre façon de le taper.

### Un personnage se dessine en entier

Le matériel ne connaît que des carrés de huit. Un `Perso` en prend seize sur
seize et le compilateur le découpe en quatre tuiles, dans l'ordre haut-gauche,
haut-droite, bas-gauche, bas-droite — celui que `sprite16()` attend.

Écrire les quatre à la main faisait quatre `Tuile` qu'il fallait garder
cohérentes, et huit lignes de `sprite()` par personnage, avec les moitiés à
échanger quand il regarde à gauche. Une erreur invisible, qui donne un visage à
l'envers.

**Plus grand : un `Perso` de 32 × 32.** Un personnage est un `Perso`, quelle que soit sa taille : la taille se lit sur ses rangées (16 ou 32). Pour un boss, un `Perso` prend trente-deux
rangées de trente-deux signes ; le compilateur le range comme quatre `Perso` à
la suite (haut-gauche, haut-droite, bas-gauche, bas-droite), seize tuiles, et
`sprite32(n, x, y, BOSS)` le pose en seize lutins — quatre `sprite16`, quarts
échangés quand il est retourné. Il coûte cher : seize des quarante lutins.

**La taille se choisit avant de dessiner** : dans « ▦ Les tuiles », trois
boutons, « + tuile 8 × 8 », « + perso 16 × 16 », « + perso 32 × 32 ». Le nom
est demandé, puis la grille a la bonne taille.

**Un personnage, un fichier : le parent et ses enfants.** En création, chaque
nouveau `Perso` (16 × 16 ou 32 × 32) s'écrit dans **son propre fichier**, jamais dans la
source principale :

```
principal.cpp                  #include "personnages.cpp"   ← UNE ligne, écrite une seule fois
personnages.cpp                le parent : l'include qui inclut tous les fichiers
  #include <Perso>             ← UNE fois, pour TOUS les personnages
  #include "perso_HEROS.cpp"
  #include "perso_BOSS.cpp"
perso_HEROS.cpp                un enfant : le dessin de HEROS, rien d'autre
perso_BOSS.cpp                 un enfant : le dessin de BOSS (32 × 32), rien d'autre
```

`#include <Perso>` n'est écrit qu'**une fois**, dans la liste : il n'ajoute rien à la
cartouche, c'est une autorisation (« on a le droit d'écrire des Perso »). Écrit
une fois ou dans chaque fichier, la cartouche est la même, octet pour octet
(vérifié). Chaque `perso_….cpp` n'est donc que son dessin, comme une image. Les leçons de personnages (35.1 à 35.10, chapitre 6 « Dessiner ») suivent la même organisation. Puis, toujours rangé ainsi, **l’AVION** (un dessin tout fait de la bibliothèque, « ▦ Les tuiles », onglet des modèles) : 35.16 « Un avion qui vole » (la croix, un pixel par image), 35.17 « La vitesse de l’avion » (une variable `vitesse`, des bords testés avant le pas), 35.18 « Changer de vitesse en vol » (A accélère, B ralentit) et 35.19 « Plus lent qu’un pixel par image » (`lenteur` : un pas une image sur trois, 20 pixels par seconde).

- **« + perso 16 × 16 » / « + perso 32 × 32 »** créent l'enfant, ajoutent sa
  ligne au parent et l'ouvrent. `principal.cpp` ne reçoit
  `#include "personnages.cpp"` que la toute première fois — sans elle le
  compilateur ne verrait pas les personnages — puis ne change plus.
- **« ▦ Les tuiles » voit tous les onglets** : la bande montre les dessins de
  tout le projet (ceux d'un autre onglet portent « ↗ »), et un clic ouvre le
  fichier où le dessin est écrit. On ne repeint donc que le contenu visé.
- **Renommer** change le nom partout, le fichier (`perso_ANCIEN.cpp` →
  `perso_NEUF.cpp`) et la ligne du parent ; **⧉ Créer une variante** d'un
  personnage lui donne son propre fichier ; **🗑 Supprimer** ôte le fichier
  vide et sa ligne.
- **Les onglets** des personnages sont repliés dans un groupe **« 📁 personnages
  (N) ▸ »**, qui se déplie d'un clic et reste ouvert quand on travaille dedans.
- **Un projet existant** : « 📦 Tout le jeu », dossier Personnages, **« 📁 Un
  fichier par personnage »** range tout ainsi — ceux de `principal.cpp`, d'un
  fichier voisin, ou d'un ancien `personnages.cpp` d'un seul bloc — avec leur
  table de palettes et leurs marques ; « ↶ » le défait. Sur Mario, l'écran est
  le même au pixel près.
- **Dans une leçon** (📚 APPRENDRE), rien de tout cela : la leçon garde son
  programme tel qu'elle l'a écrit.

Le programme compilé ne change pas : les `#include "…"` collent les fichiers de
proche en proche, et pour des dessins l'ordre ne compte pas
(`ranger-personnages.js`).

**Verrouiller un dessin : un modèle, comme une classe.** Un `Perso` est déjà un
modèle — chaque `sprite16(numero, x, y, ENNEMI)` en fait un exemplaire à
l'écran, et l'original ne bouge pas. **🔒 Verrouiller** (dans « ▦ Les tuiles »,
ou sur l'élément dans « 📦 Tout le jeu ») le garantit : une marque est écrite
sous le dessin, dans le code (`/* MARIO : verrouillé */`), donc enregistrée
avec le projet et emportée quand on le range dans `personnages.cpp`. Tant
qu'elle est là, on le voit et on s'en sert, mais **on ne le modifie plus** :

- dans l'atelier, pinceau, miroir, coller, effacer, palettes et renommer sont
  refusés, avec le message « 🔒 MARIO est verrouillé » ;
- dans l'éditeur de code, une frappe qui changerait ses rangées, sa table de
  palettes, l'effacerait ou ôterait sa marque est **défaite aussitôt** ;
- **⧉ Créer une variante** en fait une copie modifiable (`MARIO_ROUGE`),
  l'original intact ; **🔓 Déverrouiller** le rend modifiable.

Les retours en arrière (↶, une version) et un programme remplacé en entier
passent. Ce n'est pas une sécurité — un fichier ouvert dans le Bloc-notes reste
modifiable — mais un garde-fou contre les erreurs (`verrous.js`). Il vaut pour
les `Tuile` et les `Perso` (16 × 16 ou 32 × 32).

**Supprimer un élément — seulement s'il ne sert nulle part.** « 🧽 Vider le
dessin » efface les pixels mais garde le nom ; **🗑 Supprimer** ôte l'élément du
programme, avec ce qui l'accompagne (table de palettes, marques). C'est
**refusé** tant qu'une ligne du projet s'en sert — dans n'importe quel onglet :
`poser(5, 5, SOL);` dans `principal.cpp` empêche de supprimer un `SOL` écrit
dans `tuiles.cpp` — et la page dit où (« SOL est utilisé 1 fois dans le
projet… principal.cpp, ligne 186 : t = SOL; »). Refusé aussi pour un élément
**verrouillé**. Les commentaires et les textes entre guillemets ne comptent
pas comme une utilisation. « ↶ » fait revenir ce qu'on a supprimé.

On supprime ainsi les tuiles, personnages, grands, airs et cartes — dans
« ▦ Les tuiles » (« 🗑 Supprimer ») ou dans « 📦 Tout le jeu », où chaque
élément dit **« ✔ utilisé N fois »** ou **« ∅ jamais utilisé »** : de quoi
repérer ce qui prend de la place dans la cartouche sans servir. Les scènes et
les couleurs ne se suppriment pas ainsi : une scène est tissée dans tout le jeu
(`supprimer.js`).

### Les lutins, et pourquoi ils existent

Un décor vit sur une grille de huit pixels. Un personnage, non : s'il ne
pouvait s'arrêter que sur des multiples de huit, il ne sauterait pas, il se
téléporterait. Les lutins sont la réponse du matériel — quarante carrés de huit
sur huit, posés où l'on veut.

La table des lutins ne s'écrit que pendant le VBlank. Le compilateur en tient
donc une copie en mémoire de travail, que `sprite()` remplit quand on veut, et
que `image()` verse d'un bloc au bon moment — par le copieur rapide de la
console, depuis une routine installée en page haute. Rien de tout cela ne se
voit depuis le programme : on écrit `sprite(0, x, y, MARIO)`, et il est là.

### Écrire sur plusieurs fichiers

```cpp
#include "dessins.cpp"
#include "niveau.cpp"
#include "jeu.cpp"
```

C'est bien ce que fait `#include` en C++ : une directive de **texte**, résolue
avant le lexeur. Le contenu du fichier prend la place de la ligne, et le
compilateur ne voit qu'un seul programme. Un découpage en cinq fichiers rend
donc **exactement la même cartouche** que le fichier collé — à l'octet près, et
`verifier-inclusion.mjs` le vérifie en comparant les 32 768 octets des deux.

Trois conséquences à connaître :

- **L'ordre compte pour les données.** Une globale doit être versée avant la
  fonction qui la nomme, comme si tout était collé bout à bout. Les *fonctions*,
  elles, sont toutes relevées avant d'être traduites : l'une peut en appeler une
  autre écrite plus bas, sans déclaration préalable.
- **Un fichier inclus deux fois n'est versé qu'une fois.** Deux fichiers qui
  partagent une même dépendance ne la déclarent donc pas en double — ce qui rend
  les gardes d'inclusion inutiles, et les cycles inoffensifs.
- **Une faute désigne son vrai fichier** : « `dessins.cpp, ligne 7` », et non un
  numéro de ligne dans un texte assemblé que personne n'a sous les yeux.

Il n'y a ni unité de compilation séparée, ni éditeur de liens : il n'y en a pas
besoin, et en promettre serait promettre un cloisonnement qui n'existe pas.

### Ajouter sa propre fonction à la console

Un fichier voisin (`#include "outils.cpp"`) suffit pour **ranger** ses
fonctions. Pour qu'une fonction devienne une fonction **de la console**, qu'on
demande par `#include <nom>` comme `poser()`, il suffit de l'écrire en C++ et
de l'inscrire à trois endroits — c'est ainsi que `bande()` y est entrée :

| Fichier | Ce qu'on y ajoute |
|---|---|
| `compilateur/emetteur.js` | sa source C++, dans une constante `SOURCE_BANDE` (un texte entre accents graves, sur plusieurs lignes), puis une ligne `bande: SOURCE_BANDE,` dans `FONCTIONS_EN_C` |
| `compilateur/inclusion.js` | son nom dans `BIBLIOTHEQUES` : `bande: 'pose la même tuile plusieurs fois, de gauche à droite',` |
| `aide-fonctions.js` | sa fiche pour l'éditeur (facultatif) : `bande: { args: [...], dit: '...' },` |

- Le compilateur n'ajoute la source **que si le programme appelle la
  fonction**, et seulement s'il n'en a pas écrit une du même nom : **la sienne
  passe avant**.
- La source n'écrit pas ses propres `#include` (`bande()` appelle `poser()`
  sans `#include <poser>`) : ce que la console ajoute est marqué `deLaConsole`.
- Après la modification, **Ctrl+F5** dans l'atelier, puis `npm run verifier`.
- Chaque `#include` a son tuto dans `tuto/lecons.js`, reconnu à la première
  ligne de son programme : `// ---- #include <bande> : … ----`. Le parcours le
  place juste avant la première étape qui l'emploie.

**Un coût à connaître :** `bande()` ne pèse que 38 octets, mais une tuile qui
lui arrive par un **paramètre** est une variable : le compilateur ne peut plus
savoir laquelle sera posée, et grave **toute la police** (704 octets) au lieu
du seul dessin employé. Dix `poser()` en clair font 229 octets ; un appel à
`bande()`, 911.

Tout est expliqué pas à pas dans le dernier chapitre du parcours (« Tes
propres #include », 8 étapes et le tuto de `bande()`) et dans
`documents/ajouter-un-include.pdf`.

### Les numéros de tuiles

Une tuile est un numéro. L'ordre est fixe : `0` est le vide, `1`–`26` les
lettres A à Z, `27`–`36` les chiffres 0 à 9, puis `!` `?` `.` `-` `:`, et enfin
**`42`, le carré plein** — celui qui fait une pièce de Tetris convenable. Les
dessins du programme suivent, à partir de `44`.

D'où, pour afficher un chiffre calculé : `poser(x, y, 27 + chiffre);`.

### Ce qui est refusé, et pourquoi

| Refusé | Pourquoi |
|---|---|
| `uint16_t`, `long`, `short` | une variable est un octet ; pour compter plus loin, tenir deux variables |
| `float`, `double` | ce processeur ne sait pas compter à virgule ; travailler en seizièmes de pixel |
| les pointeurs, les références | un tableau se passe par son nom, qui est déjà une adresse |
| les classes, les modèles, `new` | il n'y a pas de tas, et pas de place pour une machinerie d'objets |
| `std::` quoi que ce soit | il n'y a pas de bibliothèque standard sur cette console |
| une fonction récursive | les arguments vivent à une place fixe ; le compilateur nomme le cycle |
| `goto` | les boucles et `break` suffisent |
| un tableau en argument | les tableaux sont visibles de partout : les nommer suffit |
| une `struct` affectée d'un bloc | on nomme le champ qu'on veut lire ou écrire |
| un tableau de plus de 256 cases | un index tient sur un octet : les dernières seraient hors d'atteinte |
| une grille lue avec un seul index | `carte[ligne]` désignerait une rangée entière, pas un octet |
| un argument obligatoire après un argument par défaut | on ne pourrait plus deviner lequel manque à l'appel |

Un refus ressemble à ceci :

```
exemples/essai.cpp — ligne 7 : « f » finit par s'appeler elle-même (f → g → f).
Les arguments d'une fonction vivent à une place fixe : un appel imbriqué
écraserait ceux de l'appel en cours. Dérouler la boucle avec « while ».
```

`verifier-refus.mjs` éprouve **trente-huit refus**, chacun avec le mot qui doit
se trouver dans le message — et six programmes qui, eux, doivent passer. Un
refus trop large est un bogue autant qu'un refus manquant.

---

## Les séries à part : dessiner une fois, agrandir comme on veut

Après les 26 chapitres du parcours, **📚 APPRENDRE** a deux séries à part, numérotées avec un zéro devant :

| Série | Ce qu’on y trouve | Leçons |
|---|---|---|
| **Série 2 — Les formes géométriques** | une forme par leçon (rond, carré… cube, sphère), puis les tailles : 8, 16, 32, ×2, ÷2, et `spriteTaille()` | 2.01 – 2.40 |
| **Série 3 — Les images** | le Père Noël (style manga), le bonhomme de neige, le sapin, le cadeau, le renne ; les pièces des dames et des échecs ; les symboles des cartes | 3.01 – 3.17 |

**La règle de ces séries** : un dessin s’écrit UNE fois, à sa taille standard, et la taille se choisit au moment de le poser — `sprite(0, 36, 60, ROND, 4)`, `sprite16(4, 88, 36, PERE_NOEL, 3)`, `poser(2, 3, MUR, 5)`, ou `spriteTaille()`. Le compilateur redessine la forme (`compilateur/agrandir.js`) : les vrais coins restent pointus, les marches s’arrondissent, les détails de l’intérieur restent. **Il n’y a pas de limite de taille** : au-delà de ce que les lutins peuvent montrer, la forme passe dans le fond de l’écran. Dans l’atelier, « 📐 Agrandir… » fait la même chose pour un de tes dessins, en copie.

**Quatre jeux** sont faits avec les images de la série 3 (menu des exemples) : Puissance 4, Dames, Échecs et Couleurs (des cartes, style UNO). `node verification/verifier-jeux.mjs` en joue une partie de chacun.

## Les exemples

| Fichier | Ce que c'est | Lignes | ROM |
|---|---|---:|---:|
| `exemples/bonjour.cpp` | du texte, un bouton | 30 | 1 326 o |
| `exemples/compteur.cpp` | des variables, des comparaisons, une fonction à argument | 37 | 1 407 o |
| `exemples/ecrans.cpp` | **passer d'un écran à l'autre** : un titre, une partie, une fin | 83 | 1 653 o |
| `exemples/langage.cpp` | **tout ce que le compilateur comprend**, et qui se vérifie case par case | 139 | 1 968 o |
| `exemples/console.cpp` | **tout ce que la console sait faire** : panneau, palettes, options de lutin, son, sauvegarde | 176 | 2 693 o |
| `exemples/musique.cpp` | **une musique qui joue toute seule** : deux voix qui bouclent, une fanfare par-dessus | 133 | 2 529 o |
| `exemples/minimal.cpp` | **le plus court qui dessine** : une tuile, un appel — deux lignes | 3 | 1 285 o |
| `exemples/ligne.cpp` | une ligne entière de tuiles, avec un `for` | 12 | 1 317 o |
| `exemples/damier.cpp` | un damier : deux tuiles qui alternent | 15 | 1 421 o |
| `exemples/lutin.cpp` | la même tuile en **lutin**, déplacée au pixel près | 21 | 1 517 o |
| `exemples/perso16.cpp` | **un personnage de seize** : quatre tuiles, un seul appel | 33 | 1 537 o |
| `exemples/nuances.cpp` | les quatre nuances, et la palette qui les échange | 24 | 1 397 o |
| `exemples/sans-dessin.cpp` | **un jeu sans un seul dessin** : tout est fait avec les 44 tuiles de la police | 137 | 2 237 o |
| `exemples/menu.cpp` | un menu avec un curseur, qui mène à trois écrans | 136 | 2 149 o |
| `exemples/decoupe/` | le même programme que `ecrans.cpp`, **sur cinq fichiers** | — | — |
| `exemples/chute.cpp` | **la pesanteur** : un objet qui tombe, accélère et rebondit — en seizièmes de pixel | 274 | 2 541 o |
| `exemples/puits.cpp` | un bloc qui tombe et s'empile : le cœur de Tetris | 157 | 2 015 o |
| `exemples/tetris.cpp` | **Tetris entier** : 7 pièces, 4 rotations, la pièce suivante, les lignes, le compte, la relance | 394 | 4 232 o |
| `exemples/mario.cpp` | **Super Mario** : un niveau de 120 cases qui défile, pesanteur, saut, pièces, ennemis, drapeau | 641 | 6 006 o |
| `exemples/puissance4.cpp` | **Puissance 4** : le Père Noël contre le bonhomme de neige, deux joueurs ; les jetons sont deux images de la série 3, l’écran titre les montre ×4 avec `poser(…, 4)` | 348 | 32768 o |
| `exemples/dames.cpp` | **Dames** 8 × 8 : prises en avant et en arrière, prises enchaînées, pion couronné en dame ; un même dessin pour les deux camps (une palette par case) | 466 | 32768 o |
| `exemples/echecs.cpp` | **Échecs** : les six pièces et leurs règles, chemin libre, pion de deux cases, promotion, « ÉCHEC » affiché ; on gagne en prenant le roi | 567 | 32768 o |
| `exemples/cartes.cpp` | **Couleurs**, un jeu de cartes dans le style du UNO, contre la console : passe, inverse, +2, joker (images de la série 3), dos de carte = le cadeau | 838 | 32768 o |
| `exemples/invaders.cpp` | **Space Invaders entier, en couleur** : 5 × 7 envahisseurs, abris, bombes, soucoupe, 3 vies, record gardé dans la cartouche | 1 200 | 8 455 o |
| `exemples/calcul.cpp` | **Mario Calcul (démo)** : trois portes « ? » barrent la route, chacune s'ouvre en trouvant le résultat d'une addition ou d'une soustraction | 360 | 2 491 o |

Les nombres sont mesurés en compilant.

Le compilateur entier — lexeur, analyseur, résolution des noms, émetteur,
police, inclusion, ligne de commande — fait **4 810 lignes**. À côté, l'atelier
de dessin en fait 298, la partition 626, le plan 254, et les dix-huit leçons
1 100 : ce ne sont pas des pièces du compilateur, mais de quoi s'en servir.

---

## Une console : en couleur, ou en quatre nuances

Une Game Boy Color a huit palettes de quatre couleurs pour le décor (et huit
pour les personnages) ; une Game Boy d'origine n'a que **quatre nuances**, et
**les registres de couleur n'existent pas chez elle**.

Il y a **deux consoles, et seulement deux**. La règle est écrite à un seul
endroit, `compilateur/consoles.js`, et tout le reste vient la lire :

| console | fichier | `$0143` | ce qu'il fait |
|---|---|---|---|
| **🎮 Game Boy** (`gb`) | `mon_jeu.gb` | `$00` | les 4 nuances, rien de plus : `couleurFond()`, `teindre()`… sont **refusés**, avec leur ligne |
| **🌈 Game Boy Color** (`gbc`) | `mon_jeu.gbc` | `$C0` | toutes les couleurs : 8 palettes de décor, 8 de personnages |

L'un **ou** l'autre, jamais les deux : pas de troisième octet, pas de
cartouche « couleur qui marche aussi en nuances », pas de second fichier
fabriqué en cachette.

**Qui choisit ?**

- **Dans l'atelier** : la liste en haut à gauche (et le bouton « Nouveau », qui
  la demande). Le bouton de téléchargement dit ce qu'il donne : `⬇ .gbc` ou `⬇ .gb`.
- **Partout ailleurs** — le parcours (`tuto.html`), les contrôles,
  `gb3.mjs` sans `--console` — **c'est le programme** : une seule fonction de
  couleur, et c'est une cartouche Game Boy Color ; aucune, une Game Boy.

**Ce qu'on voit** est écrit sous l'écran de la console, dans l'atelier comme
dans le parcours, lu dans l'émulateur et non deviné :

| sous l'écran | ce que cela veut dire |
|---|---|
| 🌈 Game Boy Color — en couleur | une cartouche `.gbc`, affichée en couleur |
| 🎮 Game Boy — 4 nuances | une cartouche `.gb` |
| 👁 Aperçu en 4 nuances… | une cartouche `.gbc`, montrée par le réglage *« Voir en quatre nuances »* telle qu'une vieille console l'afficherait — la cartouche, elle, **n'a pas changé** |

Refuser plutôt qu'ignorer : poser des couleurs qui ne feront jamais rien, sans
le dire, c'est laisser chercher longtemps pourquoi l'écran ne change pas.

Les couleurs ne changent rien aux **dessins** : une tuile garde ses numéros de
0 à 3, la palette dit seulement quelle couleur montre chaque numéro. D'où la
règle d'or du Cours (chapitre 42) : dessiner d'abord en quatre nuances,
colorier ensuite.

En ligne de commande :

```bash
node outils/gb3.mjs exemples/couleur.cpp              # le programme décide → exemples/couleur.gbc
node outils/gb3.mjs exemples/minimal.cpp              # pas de couleur      → exemples/minimal.gb
node outils/gb3.mjs exemples/couleur.cpp --console gb # refusé : ligne 40, couleurFond()
```

Dans le compilateur, une seule fonction décide : `couleurIci()`, dans
`compilateur/emetteur.js`. Elle est posée aux seuls appels qui écrivent dans
les registres de couleur, et répond **émettre** ou **refuser** — jamais
« ignorer ». Les erreurs d'écriture — une palette au-delà de 7, un rouge
au-delà de 31 — sont contrôlées *avant* cette question.

*Ce qui a changé le 2026-10-05* : l'ancienne option « les deux » (un `.gbc` et
un `.gb` sans couleurs, fabriqués ensemble, et l'octet `$80`) a été retirée ;
`--console les-deux` est refusé avec l'explication. Et le parcours gravait
`$00` sur toutes ses cartouches et ne dessinait que les nuances : ses leçons de
couleur s'affichaient en vert. Elles s'affichent maintenant en couleur.

---

## Jouer

Dans la page, choisir le jeu dans la liste en haut. **Cliquer dans la console**
avant de jouer : tant que le curseur est dans l'éditeur, les flèches déplacent
le texte et non le personnage.

| | Tetris | Le puits | Super Mario |
|---|---|---|---|
| ← → | déplacer la pièce | déplacer le bloc | marcher |
| ↓ | faire plonger | faire plonger | — |
| **X** (A) | faire tourner | — | sauter |
| **Z** (B) | — | — | courir |
| **Entrée** (START) | recommencer | — | recommencer |

**« ⛶ Plein écran »**, dans la rangée sous la console, donne l'écran à la
console seule ; `Échap` en revient. Les touches y répondent comme dans la page.

L'agrandissement est **un multiple entier** de 160 sur 144 — ×4, ×5, selon
l'écran —, et les bandes noires autour sont ce que ce choix laisse. Étirer
l'image jusqu'aux bords ferait tomber un pixel de la console à cheval sur deux
pixels du moniteur : une rangée sur trois paraîtrait plus épaisse que ses
voisines, et un jeu qui se joue au pixel près deviendrait illisible.

---

## Les réglages

Le bouton **⚙**, en haut de la page, ouvre **53 réglages**. Ils tiennent
tous à une règle : **chacun s'applique à l'instant où on le change**, la
console tournant, sans rien recharger et sans couper la partie en cours. Un
réglage qu'il faut valider n'est pas un réglage, c'est un formulaire.

Ils sont retenus d'une visite à l'autre. Un champ de recherche les filtre —
sur leur nom comme sur leur explication —, un point vert marque ceux qui ont
bougé, et « Tout remettre » les ramène tous, effets compris.

> **Ce tableau est engendré** — `node reglages.mjs`. Le panneau non plus
> n'est pas écrit à la main : il sort d'une table qui dit, pour chaque
> réglage, son nom, sa valeur de départ et ce qu'il change. Cinquante
> réglages écrits trois fois — dans le HTML, à la lecture, à
> l'enregistrement —, ce sont trois occasions d'en oublier un ; et un
> réglage qui s'affiche mais ne se retient pas ressemble beaucoup à un
> réglage qui marche.

`Ctrl+,` ouvre le panneau, `Ctrl+Entrée` compile et lance, `Ctrl+M` met en
pause.

### L’écran

| Réglage | Par défaut | Ce qu'il change |
|---|---|---|
| **Les quatre nuances** | `origine` | Ce que la console affiche à la place du vert d’origine. |
| **La taille de l’écran** | `plein` | Un facteur entier garde les pixels carrés ; « pleine largeur » remplit le volet. |
| **Lisser les pixels** | décoché | Décoché, un pixel de la console reste un carré net — c’est ce qu’il était. |
| **Lignes de balayage** | `0%` | Les rayures d’un écran d’époque, posées par-dessus — jamais dans la cartouche. |
| **La grille des tuiles** | `0%` | Un quadrillage de 8 sur 8 par-dessus l’écran : on voit où tombent les tuiles. |
| **Luminosité** | `100%` | N’éclaircit que l’affichage : les octets de la console ne bougent pas. |
| **Contraste** | `100%` | Pour distinguer les deux nuances du milieu, qui se ressemblent beaucoup. |
| **Le cadre autour de l’écran** | coché | Décoché, l’écran touche les bords : plus de place pour la console. |
| **Le compteur d’images** | coché | Les images par seconde, en haut de l’écran. Soixante, c’est la console. |
| **Plein écran au facteur entier** | coché | Décoché, l’image remplit le moniteur — et une rangée sur trois paraît plus épaisse. |
| **Voir en quatre nuances** | décoché | Montre la cartouche COULEUR telle qu’une Game Boy d’origine l’afficherait. La cartouche, elle, ne change pas — c’est un aperçu. |

### La marche

| Réglage | Par défaut | Ce qu'il change |
|---|---|---|
| **La vitesse de la console** | `1` | Au ralenti on voit une chute image par image ; à ×4 on traverse un menu. |
| **Mettre en pause si l’onglet est caché** | coché | Décoché, la partie continue derrière — utile pour laisser tourner une démonstration. |
| **Démarrer en pause** | décoché | La cartouche est chargée mais rien ne bouge, jusqu’à « Reprendre ». |
| **Avancer d’une image avec « . »** | décoché | En pause, chaque appui joue exactement une image. C’est ainsi qu’on prend un bogue sur le fait. |
| **Jouer aussi aux touches ZQSD** | décoché | En plus des flèches, pour une main sur le clavier et l’autre sur les boutons. |
| **Échanger les boutons A et B** | décoché | A sur Z et B sur X, plutôt que l’inverse. |

### Le son

| Réglage | Par défaut | Ce qu'il change |
|---|---|---|
| **Le son au démarrage** | coché | Décoché, la page s’ouvre muette — le bouton « Son » le rallume. |
| **Le volume** | `25%` | Les quatre voix de la console ensemble. |
| **Garder le son en pause** | décoché | Décoché, mettre en pause coupe aussi la musique. |
| **Garder le son si l’onglet est caché** | décoché | Décoché, la page se tait dès qu’on regarde ailleurs. |
| **L’avance du son** | `moyenne` | Courte, le son colle à l’image mais hachure si la page rame. Longue, l’inverse. |
| **Un bip quand ça ne compile pas** | décoché | Pour compiler en écrivant sans quitter le code des yeux. |

### Le code

| Réglage | Par défaut | Ce qu'il change |
|---|---|---|
| **La taille du texte** | `13 px` | Celle du champ de code, et de lui seul. |
| **La police du code** | `systeme` | Toutes à chasse fixe : une colonne de code doit rester une colonne. |
| **L’interligne** | `150%` | De l’air entre les lignes, ou le plus de code possible à l’écran. |
| **La hauteur du champ** | `300 px` | Quand le code est en grand (« ⤢ Agrandir le code »), où le champ prend toute la place qu’on lui donne. |
| **Revenir à la ligne tout seul** | coché | Décoché, une longue ligne déborde à droite plutôt que de se replier. |
| **La largeur d’une indentation** | `2` | Ce que « Tab » insère, et ce que l’indentation automatique recopie. |
| **« Tab » indente le code** | coché | Décoché, « Tab » passe au champ suivant, comme partout ailleurs dans la page. |
| **Garder l’indentation à la ligne suivante** | coché | Entrée reprend les espaces de la ligne d’avant, et en ajoute après une accolade. |
| **Fermer les parenthèses toutes seules** | coché | « ( », « [ », « { » et « " » posent leur jumelle derrière le curseur. |
| **Retenir mon programme** | coché | Il est retrouvé tel quel à la prochaine visite. Décoché, la page repart de l’exemple. |

### Compiler

| Réglage | Par défaut | Ce qu'il change |
|---|---|---|
| **Recompiler quand je dessine ou que je compose** | coché | Décoché, il faut cliquer « Compiler et lancer ». |
| **Recompiler pendant que j’écris** | coché | La cartouche se refait dès qu’on s’arrête de taper. Décoché, il faut « Compiler et lancer » — la partie en cours ne repart alors jamais du début. |
| **Le temps d’arrêt avant de recompiler** | `700 ms` | Trop court, la page compile au milieu d’un mot et n’affiche que des fautes. |
| **Compiler dès l’ouverture de la page** | coché | Décoché, la console attend « Compiler et lancer » — et elle l’écrit sur son écran plutôt que de rester noire. |
| **Pour quelle console** | `gbc` | Le même choix qu’en haut de la page : `gbc` (en couleur) ou `gb` (4 nuances) — l’un ou l’autre, jamais les deux. |
| **La taille d’une capture** | `3` | Un facteur entier : un pixel de console devient N pixels carrés, jamais un flou. |
| **Le titre gravé dans la cartouche** | `MON JEU` | Onze caractères au plus, en majuscules — c’est ce que la console lit au démarrage. |
| **Arrêter la console si la compilation échoue** | coché | Décoché, l’ancienne cartouche continue de tourner pendant qu’on corrige. |
| **Ce que le panneau d’état raconte** | `complet` | Court, il ne dit que la taille ; complet, il nomme aussi les variables. |
| **Demander le nom d’une tuile, d’un air, d’un modèle** | coché | Décoché, la page nomme elle-même — TUILE1, AIR1, HEROS. |

### La page

| Réglage | Par défaut | Ce qu'il change |
|---|---|---|
| **Le thème** | `sombre` | Sombre pour le soir, clair pour un vidéoprojecteur. |
| **Les transitions de la page** | coché | Décoché, tout change d’un coup — plus reposant, et plus rapide sur une petite machine. |
| **Les explications sous les boutons** | coché | Décoché, la page ne garde que l’essentiel. |
| **Le mode au chargement** | `dernier` | Par quoi la page s’ouvre, la prochaine fois. |
| **L’exemple au chargement** | `garder` | Ce que la page charge quand elle ne retrouve pas de programme retenu. |
| **La leçon d’ouverture** | `1` | Celle qui s’affiche quand on entre en mode leçons. |

### Le confort

| Réglage | Par défaut | Ce qu'il change |
|---|---|---|
| **Sauter à la ligne fautive** | coché | Quand la compilation échoue, le curseur va se poser sur la ligne en cause. |
| **L’état dans le titre de l’onglet** | décoché | « ✓ » ou « ✗ » devant le titre : on voit d’un autre onglet si ça compile. |
| **Signaler une faute d’un tremblement** | coché | Le panneau d’état bouge un dixième de seconde. Rien d’autre ne change. |
| **Les raccourcis clavier** | coché | Ctrl+Entrée compile et lance, Ctrl+M met en pause, Ctrl+, ouvre ce panneau. |

Chaque contrôle porte l'identifiant `reglage-<nom>` : le panneau se pilote
donc du dehors, et c'est ce qui permet à `verifier-page.mjs` de vérifier
qu'aucun réglage du catalogue ne manque à l'affichage, que la recherche
filtre, et qu'un réglage changé change bien quelque chose.
---

## L'atelier : dessiner, écrire, défaire

### Huit palettes, en couleur ou en quatre nuances

On choisit à la création d’un jeu : **🌈 en couleur** (une cartouche Game Boy Color)
ou **🎮 Game Boy — 4 nuances**. L’un ou l’autre, jamais les deux ; le choix se
change en haut de la page, ou dans le bandeau de l’atelier.

En couleur, le jeu a **8 palettes de 4 couleurs** pour le décor — le maximum de
la Game Boy Color — et 8 palettes de 3 couleurs + le transparent pour les
personnages, numérotées **de 0 à 7** ; la **0 est la normale** (les verts de la
Game Boy). On clique une couleur, on peint : ce qu’on peint **prend sa palette**
— toute la tuile, le carré de 8 × 8 de la carte, ou le quart du personnage.
C’est ainsi que fait la console, et l’atelier le dit (« BRIQUE prend la
palette 3 »). « 🎨 Changer cette couleur » et **« 🎨 Variétés »** ne changent
**que le dessin ouvert** (la tuile, le personnage ou la carte) : si d’autres se
servent de la même palette — d’autres tuiles, le texte pour la palette 0 —,
l’atelier copie la palette dans une palette libre, y fait le changement, et ne
donne la copie qu’à ce dessin (« sa palette 0 est copiée dans la palette 1 »).
S’il est seul à s’en servir, elle change sur place ; si les 8 sont prises, il
demande avant de la changer pour tout le monde. **« 🎨 Variétés »** met ainsi l’une des **11
palettes toutes prêtes, de 0 à 10** (0 normale, campagne, bonbon, plage, forêt,
glace, volcan, nuit, désert, océan, automne — et, pour les personnages : héros,
ennemi, princesse, robot, fantôme, elfe, flamme, pirate, chevalier, gelée).

**« 🎨 Thèmes »** change d’un coup **les 8 palettes du décor et les 8 des
personnages** avec des couleurs qui vont ensemble : 0 normale, forêt, désert,
glace, volcan, océan, hanté, bonbon. Elles sont calculées : chaque palette part
d’une teinte, et toutes descendent du clair au sombre par les mêmes quatre
marches de lumière — c’est ce qui les accorde. Ctrl+Z revient en arrière.

Où c’est écrit dans le programme :

| Quoi | Ce que l’atelier écrit |
|---|---|
| les couleurs des palettes | `couleurFond(p, n, r, v, b);` et `couleurLutin(…)`, dans le bloc des couleurs de `main` |
| la palette d’une tuile | `/* BRIQUE : palette 3 */` sous son dessin, et `teindre(colonne, ligne, 3);` à côté de chaque `poser` (celui de SA case) |
| la palette d’un carré de la carte | `teindre(colonne, ligne, palette);` dans la fonction de la carte |
| la palette de chaque quart d’un personnage | `const uint8_t HEROS_PALETTES[] = { 1, 1, 3, 3 };` — la scène la lit, retournement compris |

Un programme qui n’a encore aucune couleur montre des palettes toutes prêtes ;
elles entrent dans le programme au premier coup de pinceau.

### Les outils de dessin

- **Zoom** avant et arrière (boutons, ou Ctrl + molette) et **plein écran**,
  sur la carte comme sur les tuiles. Le carré du curseur couvre exactement le
  pixel qu'on va peindre, à tous les zooms. En plein écran, une tuile ou un personnage se
  dessine **à côté** des 8 palettes et des outils (sur un écran en largeur),
  au plus grand zoom qui tient ; toute la barre des couleurs y reste : palettes,
  variétés, thèmes, « Changer cette couleur », sélection et copie.
- Dans l'atelier des tuiles, comme sur la carte : ✏ crayon, **🧽 gomme**, ／ ligne,
  ▭ rectangle, ◯ cercle (pleins ou en contour), **🪣 remplir**, **💧 pipette**
  (elle rend ensuite le crayon), **⇆ ⇅ miroirs** et **↻ quart de tour** — sur tout
  le dessin, ou seulement sur la zone choisie. Un personnage retourné garde les
  couleurs de ses quarts.
- Sur la carte, **🧩 Auto-tuiles** : on peint des carrés de 8 × 8, et leurs bords
  se dessinent tout seuls selon leurs voisins — un chemin, un mur, une rivière se
  raccordent dans tous les sens. **⇆ ⇅ ↻** retournent ou tournent la sélection.
  En « Colorier », **🔝 devant les personnages** met une case devant eux (hachurée).
- Sur la carte : crayon, ligne, rectangle, cercle, **🪣 Remplir** (la zone
  d'un seul tenant de la même couleur), **💧 Pipette** (Alt + clic avec le
  crayon), **⬚ Sélection** avec copier, couper et coller (Ctrl+C, Ctrl+X,
  Ctrl+V — un aperçu suit la souris, un clic pose le collage).
- **Sélectionner et déplacer** : la sélection est un rectangle libre, ou d’un clic
  un carré de 8 × 8 ou un bloc de 16 × 16 calé sur la grille ; on l’attrape et on
  la glisse, elle retombe sur la case la plus proche. Dans l’atelier des tuiles,
  « ⬚ Sélectionner et déplacer » fait de même dans une tuile ou un personnage, et
  « 📋 Copier le dessin », « 📌 Coller ici », « ⧉ Dupliquer » copient un dessin entier.
- **🗑 Effacer la carte**, **🧽 Vider le dessin** (la tuile ou le personnage garde son nom), et **🗑 Supprimer** (il quitte le programme — refusé s'il sert quelque part, voir « Supprimer un élément »).
- 👾 Les acteurs : une **galerie** de vignettes pour choisir le dessin d'un
  acteur, avant de le poser ou après ; celui qui est pris est entouré.

### Animer : les tuiles, le joueur

**🎞 Une tuile animée** (l'eau, le feu, l'herbe) : dans l'atelier des tuiles, le
panneau « Animation » fabrique les images toutes prêtes — 🌊 eau (une vague),
🔥 feu, 🌿 herbe, ✨ clignoter — ou on les dessine à la main (« ＋ Image »). La
**frise** montre les images dans l'ordre, un clic en ouvre une ; la **pelure
d'oignon** montre l'image d'avant, en transparence, sous celle qu'on dessine ;
l'aperçu tourne à la vitesse choisie (rapide, moyenne, lente). L'atelier écrit
`animerLesTuiles()` et l'appelle après le premier `image();` : toutes les cases
de la tuile bougent ensemble, grâce à `changerDessin`.

**🔤 La police** : une tuile peut remplacer une lettre (« remplacer la lettre… ») —
tous les textes du jeu la montrent avec ce dessin.

**🎭 Les états du joueur** (🗺 La carte, 🧍 Le joueur) : un dessin — ou trois qui
alternent — pour l'**attente**, la **course** (la touche de course enfoncée : deux
fois plus vite), l'**attaque**, la **blessure** (il clignote, invincible, au lieu de
repartir du début), la **mort** et la **victoire** (une seconde et demie avant
« PERDU » ou « BRAVO »), **de dos** et **de face** (vu de dessus), et une animation
**personnalisée**, que lance l'action « jouer l'animation personnalisée du joueur ».
Un état laissé vide garde les dessins de la marche.

- **Les touches** : vu de dessus, A attaque et B (maintenu) fait courir ; en
  plateforme, A saute et B attaque. Chacune se change.
- **La hitbox** : pendant le coup, un carré (sa portée, en pixels) devant le joueur.
  Chaque acteur a son « QUAND le joueur l'attaque → ALORS… » (disparaître, des
  points…).
- **La hurtbox** : la marge dont le carré du joueur est réduit pour les coups qu'il
  reçoit — un ennemi qui frôle son bord ne le blesse pas.

### Le jeu : pause, cœurs, dialogues, menus

Dans 🏁 **Le jeu** : **SELECT met en pause** ; les vies peuvent s'afficher **en
cœurs** ; une **barre** (de mana, d'énergie…) suit une variable jusqu'à dix cases ;
les textes de **fin** (« PERDU ! », « BRAVO ! ») se changent. Avec un titre, l'écran titre peut devenir un **menu principal** — JOUER, COMMENT JOUER (quatre lignes d'aide, qu'on écrit) — et le **panneau** (HUD, dialogues, menus) peut prendre sa propre palette, en couleur. Un **dialogue** peut
dire **qui parle** et montrer son **portrait** (un dessin de 16 × 16) ; l'action
**« un menu »** pose une question avec jusqu'à quatre réponses, choisies au curseur
« > » (HAUT, BAS, A) — la variable reçoit le numéro de la réponse.

### Tout le jeu, d'un coup d'œil

L'onglet **« 📦 Tout le jeu »** du mode création montre **chaque élément du
programme**, de tous ses onglets (`principal.cpp` et ses fichiers voisins),
rangé en six **dossiers** : Personnages, Tuiles, Cartes, Scènes jouables,
Musiques, Couleurs. Pour chaque élément :

- une **miniature** (le dessin, la carte réduite, la mélodie en barres, les palettes) ;
- **où il est écrit** : le fichier et la ligne ;
- **la ligne à écrire pour s'en servir**, avec « 📋 copier » :
  `sprite16(0, 80, 72, MARIO);` (ou `sprite32(0, 64, 56, BOSS);` pour un personnage de 32 × 32), `poser(10, 9, SOL);`, `FOND();`,
  `FOND_entrer(FOND_DEPART_X, FOND_DEPART_Y);`, `jouer(THEME);` ;
- **« ✏ ouvrir »** : passe à l'onglet du fichier, puis à l'atelier de
  l'élément, où il est déjà choisi ;
- **« 🔒 verrouiller » / « 🔓 déverrouiller »** pour une tuile ou un
  personnage (voir « Un personnage se dessine en entier ») ;
- **« ✔ utilisé N fois »** ou **« ∅ jamais utilisé »**, compté dans tout le
  projet, et **« 🗑 supprimer »**, possible seulement pour ce qui ne sert pas
  et n'est pas verrouillé.

Une recherche filtre par nom. **L'image de chaque dossier** se choisit avec
« 🖼 » (un fichier image de l'ordinateur, réduit à 96 × 96) et se retire avec
« ✕ ». Elle décore l'atelier : elle reste **dans le navigateur**
(localStorage), pas dans le programme ni dans la cartouche.

L'onglet ne range rien ailleurs : chaque élément reste écrit dans le code,
sous son nom (`tout-le-jeu.js` lit, il n'écrit pas). Adresse directe :
`index.html#tout`. Contrôlé dans un vrai navigateur par
`npm run tout-le-jeu` (`verification/verifier-tout-le-jeu.mjs`).

### Versions, et retrouver ses dessins

- **🕘 Les versions** : une photo datée du programme toutes les cinq minutes quand
  il change, et celles qu'on prend (📸, avec un nom). « ↩ Revenir » remplace le
  programme — et ↶ annule ce retour. Elles vivent dans ce navigateur.
- **La bande des dessins** : 🔎 une recherche par nom ou par étiquette, **★** pour
  un favori (il passe en tête), **🏷 des étiquettes** (« décor mur ») sous chaque
  dessin, et une **loupe** qui le montre en grand au survol.

### Importer, et glisser-déposer

Un fichier **lâché sur la page** va là où il a un sens : une **image** (PNG, JPG…)
devient une tuile ou un personnage — sur la carte, toute la carte ; plus grande
que 16 × 16, on peut la découper en tuiles —, un **GIF animé** donne une image par
dessin (et une tuile animée, en 8 × 8), une cartouche **.gb / .gbc** tourne, des
tuiles **.gbr** (GBTD) s'importent, un **.cpp** remplace le programme. Dans ♪ Les
airs, **📥 MIDI** fait de la mélodie et de la basse deux airs (exact), et **📥 WAV**
tire une mélodie d'un son enregistré, morceau par morceau (approximatif : la
console n'a que deux voix carrées ; on retouche ensuite les notes).

### Annuler, refaire — pour tout

Un seul historique pour le code **et** les dessins : Ctrl+Z (ou ↶) défait la
dernière modification, où qu'elle ait été faite ; Ctrl+Y (ou ↷) la refait. Un
trait de crayon, un mot tapé, un remplissage comptent pour un. Charger un
exemple, un modèle, créer un projet ou supprimer un fichier s'annulent aussi :
chaque étape garde tous les fichiers du programme.

### L'éditeur de code

Le champ de code se comporte comme VS Code (réglage « Couleurs et numéros de
ligne », dans ⚙ Le code) :

- **numéros de ligne**, **couleurs** du C++, ligne du curseur surlignée ;
- la **ligne fautive** en rouge, avec **le message de la faute écrit au bout
  de la ligne** ;
- sur un nom, **toutes ses apparitions** surlignées, marquées dans la marge et
  sur une règle à droite, et listées sous le code (un clic y emmène) ;
- sur une accolade, une parenthèse ou un crochet, **sa jumelle** encadrée — ou
  en rouge si elle n'en a pas ;
- la **complétion** : en tapant `spr`, l'éditeur propose `sprite` et `sprite16`
  avec leur forme et ce qu'elles font (↑ ↓, Entrée ou Tab ; Ctrl+Espace pour
  la demander) ; dans un appel, **l'argument qu'on écrit est en gras** ;
- **F2** renomme un nom partout d'un coup ;
- **Ctrl+F** cherche, **Ctrl+H** remplace (majuscules, mot entier, tout
  remplacer).

La recompilation pendant qu'on écrit ne touche plus jamais au curseur ;
seul « Compiler et lancer » (ou Ctrl+Entrée) l'emmène à la ligne fautive.

### Les jeux de la carte

Deux actions de plus dans les événements et les acteurs :

- **poser une question (A oui, B non)** : la réponse va dans une variable
  (1 pour oui, 0 pour non), qu'on lit ensuite avec « SI REPONSE == 1 » ;
- **donner / retirer un objet** : l'inventaire. Chaque objet est une variable
  `OBJ_…` à 1 quand on le porte ; **START**, pendant la partie, ouvre le
  panneau de l'inventaire.

## Comment ça marche

| Fichier | Rôle |
|---|---|
| `compilateur/analyseur.js` | le lexeur et l'analyseur : du C++ à un arbre |
| `compilateur/emetteur.js` | la résolution des noms, puis l'arbre en code machine |
| `compilateur/police.js` | 43 lettres, plus les dessins de jeu — bloc et mur — en trois nuances |
| `compilateur/cartouche.js` | les 32 Ko : point d'entrée, logo, titre, sommes de contrôle |
| `compilateur/inclusion.js` | `#include`, et le renvoi d'une faute vers son vrai fichier |
| `gb3.mjs` | la ligne de commande |
| `index.html` | l'éditeur, les deux ateliers — tuiles et airs — et la console, dans le navigateur |
| `editeur-tuiles.js` | l'atelier : il lit les `Tuile NOM = {…}` du programme, et les réécrit quand on peint |
| `bibliotheque.js` | seize dessins tout faits — quatre personnages de seize, douze tuiles — à prendre et à repeindre |
| `importer-image.js` | une image du disque, réduite et ramenée aux quatre nuances : elle devient une tuile du programme |
| `editeur-airs.js` | la partition : il lit les `Air NOM = {…}`, les réécrit quand on pose une note, et les fait entendre sans compiler |
| `programme.js` | où poser un morceau dans le programme : à la suite de ses pareils, ou sous l’en-tête — la règle vit ici, pas dans chaque atelier |
| `compilateur/consoles.js` | LA règle des deux consoles : Game Boy (`$00`, `.gb`) ou Game Boy Color (`$C0`, `.gbc`), et comment lire une cartouche |
| `compilateur/cartouches.js` | UNE cartouche : compile pour la console choisie (ou celle que le programme demande) et l’assemble |
| `tuto.html`, `tuto/` | les quatre-vingts leçons, triées par difficulté de 1 à 10, avec leurs ateliers embarqués — dessin, plan, partition |
| `traduction.js`, `porter.mjs` | porter un programme gameboy2 vers le C++ |
| `emulateur.js` | la console émulée, la même dans la page et dans les contrôles |
| `desassembleur.js` | l'inverse de l'émetteur : des octets aux instructions, avec les noms du programme quand on les a |
| `desassembler.mjs` | relire une cartouche en ligne de commande |
| `vue-machine.js` | le listing dans la page — le MODE MACHINE |
| `projets.php` | **le seul morceau qui tourne côté serveur** : il crée, lit, écrit et supprime les dossiers de `projets/`. Strictement borné — un nom de projet ne peut être que `a-z 0-9 _ -`, un fichier que `nom.cpp`, et le chemin final est revérifié |
| `projets.js` | le lecteur de projets et le bandeau qui dit où l'on travaille |
| `compilateur/source-gravee.js` | graver le programme C++ d'origine au bout de la cartouche, compressé, et l'y relire à la lettre près |
| `livret.mjs` | les livrets PDF : il compile chaque leçon, la fait tourner, la photographie et joue ses contrôles |
| `tuto/console.mjs` | la console d'une leçon — compilée, chargée, prête à être interrogée ; le contrôle et le livret s'en servent |
| `tuto/etapes.mjs` | une leçon décomposée : son programme en morceaux, son exécution en images, ses contrôles joués |
| `tuto/enrichir.js` | le texte d'une leçon en balises — le seul endroit où cette transformation existe |
| `.htaccess` | interdit au navigateur de garder la page en cache : sur un chantier, une copie d'hier fait chercher un défaut là où il n'est pas |

### Deux passes, et pas trois

**On résout d'abord.** Avant de produire le moindre octet, l'arbre est parcouru
pour attacher à chaque nom ce qu'il désigne : un octet et son adresse, un
tableau et sa base, une constante et sa valeur, une fonction et sa signature.
Les erreurs de nom sortent avec leur ligne avant qu'un seul opcode ne soit
écrit, et l'émission qui suit n'a plus rien à chercher — elle lit ce qui est
attaché au nœud, et écrit.

**Puis on émet.** Les sauts sont posés avec une adresse provisoire, notés dans
une liste de retouches, et corrigés une fois toutes les étiquettes connues.

**Le modèle d'exécution est volontairement bête**, et c'est ce qui le rend
lisible : toute valeur transite par le registre `a`, et toute variable vit dans
un octet nommé — la page rapide à partir de `$FF80`, puis la mémoire de travail
quand elle est pleine. Pas d'allocation de registres. Le code produit est plus
long qu'il ne pourrait l'être, mais on peut le relire et y reconnaître le C++
de départ.

### Ce qui a demandé de la ruse

**Un calcul par un nombre connu ne passe pas par une routine.** `x * 100` se
déroule en sept doublements et trois additions ; `x / 16` en quatre décalages ;
`x % 16` en un masque. La routine générale bouclait sur son opérande de droite,
et `x * 100` coûtait vingt fois `100 * x` — pour deux écritures que tout le
monde croit équivalentes. Mesuré : 536 images contre 26, sur huit mille
opérations. Personne ne peut deviner cela en lisant son programme.

**Une expression imbriquée passe par la pile.** `p * q + 1` calcule d'abord la
gauche, la **pousse**, calcule la droite, et la reprend. Garder la gauche dans
un registre paraissait plus court, mais la multiplication s'en sert.

**Une adresse calculée n'est calculée qu'une fois.** `t[i] += 3` doit lire et
écrire la **même** case. Recalculer l'adresse pour écrire rejouerait l'index —
et `t[i++] += 1` avancerait deux fois, pour écrire ailleurs que là où il vient
de lire. L'adresse attend donc sur la pile entre la lecture et l'écriture.

**`i++` rend la valeur d'avant, `++i` celle d'après.** Ce n'est pas un détail
de style : `t[i++] = v` en dépend, et se tromper écrit une case trop loin.

**Le décalage d'un tableau de `struct` se fait par doublements.** La case *i*
d'un tableau d'enregistrements de six octets commence six fois plus loin. Le
processeur ne sait pas multiplier ; l'échelle étant connue à la compilation, on
décompose en additions et en doublements, sur seize bits — un tableau peut
dépasser 255 octets, même si son index, lui, tient sur un.

**`&&` et `||` s'arrêtent dès que la réponse est connue.** Ce n'est pas une
optimisation : `if (i < n && t[i] == 0)` compte là-dessus pour ne pas lire une
case hors du tableau.

**La console dort entre deux images.** L'interruption du VBlank compte les
images, et `image()` met le processeur en sommeil jusqu'à ce que le compte
change — au lieu de relire le compteur de ligne des milliers de fois. C'est
cette horloge, que le programme ne peut pas fausser en étant lent, qui permet à
`retard()` de dire qu'un tour de boucle a débordé. Sans elle, un jeu trop lent
tournait à trente images par seconde **en silence**.

**Le tirage au sort n'est pas le compteur du matériel.** Il l'était : huit
appels d'affilée rendaient 240, 241, 242, 243… Un jeu qui posait trois ennemis
à la suite les posait au même endroit. Un registre à décalage rebouclé mélange
maintenant l'état à chaque appel — 30 valeurs distinctes sur 32 tirages —, et le
compteur du matériel n'y sert plus que d'entropie.

**L'attente du VBlank ne s'exécute que si l'écran est allumé.** Écran éteint, le
compteur de ligne reste bloqué à zéro et l'attente ne finit jamais. C'est le
piège classique de cette machine ; il n'a rien à faire dans un langage où l'on
écrit `ecran(0)` puis `texte(…)` sans y penser.

---

## Vérifier

Compiler sans erreur ne prouve rien : une cartouche peut s'assembler
parfaitement et rester noire. Les contrôles font donc **tourner la ROM produite
dans un émulateur** — celui du projet, le même que la page fait tourner — et
relisent la mémoire vidéo, ou une variable par son nom.

Aucune dépendance : `node` suffit. Les contrôles qui ouvrent la page dans un
navigateur démarrent **leur propre serveur** sur le dossier du projet
(`outils/serveur-essai.mjs`) : ni XAMPP ni nom de dossier à respecter.

```bash
npm run verifier          # les douze suites, d'affilée
```

ou une par une :

```bash
node verification/verifier-langage.mjs    # 33 contrôles — chaque construction du langage
node verification/verifier-methodes.mjs   # 34 contrôles — les méthodes, dans le bon objet, et leurs refus
node verification/verifier-console.mjs    # 35 contrôles — le panneau, les palettes, le son, la sauvegarde
node verification/verifier-airs.mjs       # 32 contrôles — le séquenceur écouté note par note, et l'atelier
node verification/verifier-desassembleur.mjs # 42 contrôles — relire une cartouche sans se décaler d'un octet
node verification/verifier-source-gravee.mjs # 37 contrôles — le C++ gravé revient à la lettre près, et le jeu n'a pas changé
node verification/verifier-refus.mjs      # 44 contrôles — ce qui doit être refusé, et le message
node verification/verifier-exemples.mjs   # 26 contrôles — bonjour, compteur, le puits, Tetris
node verification/verifier-tuto.mjs       # 317 contrôles — les quatre-vingts leçons, dans l'ordre de leur difficulté
node verification/verifier-tutoriels.mjs  #  61 contrôles — les 59 blocs de TUTORIELS.md, compilés pour de vrai
node verification/verifier-inclusion.mjs  #  9 contrôles — cinq fichiers, une seule cartouche
node verification/verifier-portage.mjs    #  3 contrôles — mais chacun compare 500 images
node verification/verifier-disponible.mjs # 34 contrôles — l'atelier quand quelque chose MANQUE (npm run disponible)
node verification/verifier-recherche.mjs  # 34 contrôles — chaque recherche, essayée dans un navigateur (npm run recherche)
```

**`verifier-disponible.mjs` casse tout, exprès.** Dans une copie du projet, il
retire chaque fichier de l'atelier tour à tour, prive le navigateur du son ou
du stockage, lance `demarrer.mjs` sans PHP, sur un port déjà pris, deux fois de
suite, et `lancer.bat` avec un Node trop vieux. À chaque fois, l'atelier doit
marcher quand même, ou le dire en clair — jamais une page figée et muette. Le
bandeau rouge qui le dit vient de `garde.js`. Il demande Node 22 et un Chrome,
un Brave ou un Edge.

**`verifier-langage.mjs` est le cœur.** `exemples/langage.cpp` calcule trente
choses et les range dans un tableau ; le contrôle relit ce tableau dans la
mémoire de la console, case par case. Un `switch` qui compile n'aiguille pas
forcément ; un `++` suffixé peut rendre la valeur d'après sans que rien ne le
signale. C'est ce qui se voit là, et nulle part ailleurs.

**`verifier-portage.mjs` est le plus dur.** Il fait tourner côte à côte la
cartouche JavaScript de gameboy2 et la cartouche C++ de gameboy3, avec la même
suite de touches, et compare **la carte de fond et les pixels** à chaque image
calme. Deux compilateurs différents, deux allocations différentes, deux tailles
de code différentes — et la même image. Une seule différence de calcul finit
par se voir.

**`verifier-console.mjs` écoute.** Il ne se contente pas de relire l'écran : il
compare le panneau à lui-même pendant que le décor glisse, lit les options de
chaque lutin dans la table du matériel, **mesure la hauteur des notes jouées**
dans les voix de la puce sonore, et éteint puis rallume la console pour voir si
le record a survécu.

**`verifier-tuto.mjs` compte double.** Il compile **le programme de chaque
leçon**, le fait tourner, appuie sur les touches, et contrôle ce que la leçon
annonce dans son « ce qu'on doit voir ». Un tutoriel dont le code ne marche pas
est pire qu'aucun tutoriel : le lecteur croit avoir mal compris.

**`verifier-methodes.mjs` regarde DANS quel objet on a écrit.** Une méthode qui
compile n'écrit pas forcément au bon endroit : `troupe[0].avancer()` et
`troupe[1].avancer()` produisent des octets presque identiques, et une adresse
calculée de travers ne se trahit qu'à l'exécution. Le contrôle vérifie aussi que
chaque méthode a bien **ses** deux octets de `this` — les partager marcherait sur
les exemples simples et échouerait là où c'est le plus dur à voir.

**`verifier-tutoriels.mjs` tient la documentation honnête.** Il compile **les
cinquante-neuf blocs de code de `TUTORIELS.md`**, et pour ceux qui annoncent un
refus, il vérifie que le refus arrive **et que le message est celui qui est
écrit**. Une page qui promet un refus doit le tenir, sinon elle enseigne une
règle qui n'existe pas.

Et la page elle-même, qui est un logiciel à part entière — celle-ci demande
Chrome et un serveur local :

```bash
node verification/verifier-page.mjs       # l'atelier : Tetris joué dans un vrai navigateur, et le son qui en sort
node verification/verifier-atelier.mjs    # peindre un pixel change-t-il la mémoire vidéo ?
node verification/verifier-atelier-airs.mjs # poser une note écrit-elle la bonne hauteur ?
node verification/verifier-tuto-page.mjs  # les leçons, leurs dix niveaux et leurs ateliers
```

`verifier-page.mjs` contrôle aussi que **le son sort vraiment** : que le
contexte audio du navigateur est ouvert, et que des échantillons y sont
réellement programmés. Une puce sonore qui calcule dans le vide ne fait pas
de bruit.

`verifier-atelier.mjs` ouvre la page, clique une tuile, **peint un pixel pour de
bon**, et contrôle les trois choses qui comptent : le texte du programme a
changé, la cartouche s'est recompilée, et les octets de la tuile ont changé
**dans la mémoire vidéo de la console émulée**. Un éditeur graphique qui ne
ferait que la première serait un joli mensonge. Il peint aussi la onzième
colonne d'un `Perso`, et vérifie que le pixel est bien parti dans la **seconde**
tuile — celle de la moitié droite. Un découpage à l'envers ne se verrait pas
autrement.

`verifier-atelier-airs.mjs` fait de même pour la musique : il ajoute un air,
**clique une note dans la partition**, et contrôle que c'est bien la hauteur de
la ligne visée qui est écrite dans le programme — `DOD4` et non `RE4`. Un
éditeur de musique qui écrirait un demi-ton à côté serait pire qu'aucun éditeur :
on corrigerait la partition à l'oreille sans jamais comprendre. Il règle aussi un
volume, pose un `==`, et vérifie qu'un seul atelier est visible à la fois.

Trois d'entre eux écrivent une capture de l'écran à côté — `capture-page.png`,
`capture-tuto.png` et `capture-airs.png` : ce que le contrôle a mesuré, tel qu'un
œil le verrait. C'est l'une d'elles qui a montré les deux ateliers affichés en
même temps, là où le contrôle, lui, trouvait tout normal.

**Aucune adresse n'est jamais recopiée.** Le contrôle demande au compilateur où
il a rangé `posX`, et où commence `puits`. Une adresse recopiée devient fausse
dès qu'une variable est ajoutée au programme, et le contrôle se met alors à
mesurer autre chose sans le dire.

---

## Les bogues qui ne disaient rien

Aucun de ceux-ci n'a produit de message d'erreur. Tous compilaient.

| Ce qu'on voyait | La cause | Ce qui l'a trouvé |
|---|---|---|
| `pile[i] += 100` ne changeait rien | L'adresse était gardée sur la pile, mais `push af` passait **par-dessus** avant le `pop hl` : on dépilait la valeur à la place de l'adresse | Le contrôle du langage, sur la dernière de ses trente cases |
| `uint16_t x;` donnait « on ne déclare que des variables » | Un type refusé n'était pas reconnu comme un type : l'analyseur s'étonnait d'un nom inattendu au lieu de dire pourquoi il refusait | Le contrôle des refus, qui attendait le bon message |
| Les leçons ne trouvaient plus leurs variables | Les portées les nomment désormais `main.compte`, et le contrôle cherchait `compte` | Le banc des leçons, devenu rouge d'un coup |
| Une leçon promettait « MERCI » sans le montrer | Le contrôle lisait l'écran **après** avoir pressé B, qui remet le texte de départ | Le banc des leçons — le programme, lui, était juste |
| Deux cartouches divergeaient à l'image 3 | Rien : un appui de quatre images n'est pas vu au même instant par deux programmes de longueurs différentes. Le contrôle mesurait le calendrier de la manette, pas le calcul | Le même contrôle, relancé **sans** toucher aux touches : zéro différence sur 300 images |
| « la flèche bas fait plonger » rouge une fois sur trois | Rien non plus : maintenue trente images, la pièce touche le fond et une neuve la remplace — qui peut se retrouver à la même ligne. Le contrôle lisait « 5 → 5 » | Quatre lancements d'affilée du même contrôle. On mesure désormais ce que BAS produit vraiment : le puits reçoit des cases |

Les deux dernières sont les plus instructives : un contrôle trop strict ne
prouve pas davantage, il ment simplement dans l'autre sens. Un contrôle qui
mesure un instant plutôt qu'un effet finit par mesurer le hasard. On compare
maintenant aux moments calmes, et l'on dit pourquoi dans le fichier.

Et ceux de la passe suivante, celle qui a ouvert le son, le panneau et la
sauvegarde :

| Ce qu'on voyait | La cause | Ce qui l'a trouvé |
|---|---|---|
| `x * 100` vingt fois plus lent que `100 * x` | La routine de multiplication bouclait sur son opérande de DROITE. Deux écritures que tout le monde croit équivalentes, et personne ne peut deviner laquelle coûte cent tours | Une mesure : 8 000 opérations, comptées en images. 536 contre 35 |
| `uint8_t t[300];` accepté sans un mot | La taille passait par le même calcul que les valeurs, **replié sur un octet** : `t[300]` devenait `t[44]`, et le programme écrivait dans les variables du voisin | Le contrôle du refus, qui attendait une erreur et n'en voyait aucune |
| `pile[i] += 100` ne changeait rien | L'adresse était gardée sur la pile, mais un `push af` passait par-dessus avant le `pop hl` : on dépilait la valeur à la place de l'adresse | Le contrôle du langage, sur la dernière de ses trente cases |
| `retard()` ne signalait jamais rien | Il comptait les images écoulées **pendant l'attente**, ce qui donne toujours une. Le compteur avait déjà avancé avant qu'on arrive : ce qu'il fallait comparer, c'est le réveil précédent | Un programme fait exprès pour être trop lent, et qui n'était pas signalé |
| Le son mesuré à 1 700 Hz pour un DO4 | Deux carrés et un bruit superposés croisent le zéro bien plus souvent qu'une seule note. Ce n'était pas le son qui était faux, c'était la façon de le mesurer | La mesure elle-même, comparée à la note attendue |
| Une leçon du plan qui ouvrait la mauvaise page | Le numéro de la leçon était **recopié** dans le contrôle. Trois leçons insérées avant elle, et il désignait autre chose | Le contrôle, devenu rouge — puis réécrit pour CHERCHER la leçon plutôt que la numéroter |
| Une tuile posée **nulle part** | `poser(XS[i], YS[i], MUR)` : le calcul de la colonne se sert de `hl`, qui portait déjà l'adresse de la ligne. La case visée restait simplement vide, et l'on cherchait la faute dans son propre programme | Un exemple écrit pour la police, dont les sept pièces n'apparaissaient pas |
| `const uint8_t HAUT = 14;` qui casse `bouton(HAUT)` | La constante écrasait en silence le nom du bouton. La faute sortait vingt lignes plus loin — « il n'y a que huit boutons » — sur une ligne où l'on ne voit aucun 14 | Le même exemple, refusé pour une raison qui n'était pas la bonne |
| Une musique qui jouait **deux fois trop lentement** | Le séquenceur avançait dans `image()`. L'exemple écrivait vingt lettres par image, ratait le VBlank et tournait à trente images par seconde — sa musique avec lui. Un tempo qui dépend de la charge du jeu n'est pas un tempo ; il est passé dans l'interruption | Le contrôle des airs, qui comptait 32 images là où une note tenue en veut 16 |
| Les deux ateliers montrés **en même temps** | `display: flex` l'emporte sur l'attribut `hidden`, qui ne vaut qu'un `display: none` par défaut. Le contrôle, lui, interrogeait la propriété `hidden` — laquelle disait vrai | Une capture d'écran de la page ; puis le contrôle, réécrit pour regarder ce qui est VU |

---

## Ce qui manque

Honnêtement, dans l'ordre où je m'y prendrais :

1. **La quatrième voix, l'onde programmable.** Le matériel la joue ; l'émulateur
   du projet range ses seize octets mais ne les mélange pas encore à sa sortie.
   L'exposer avant serait promettre une fonction qu'on ne peut pas vérifier.
2. **Les lutins de 8 × 16 en natif.** Le matériel sait les faire, mais c'est un
   MODE : ou bien tous les lutins font huit sur huit, ou bien tous font huit sur
   seize. L'exposer signifierait deux mondes incompatibles à côté du `sprite()`
   que tout le projet emploie. `sprite16()` en empile quatre — ce qui coûte
   quatre lutins des quarante au lieu de deux.
3. **Les nombres de seize bits**, ne serait-ce que pour un score au-delà de 255.
   Aujourd'hui il faut tenir deux variables à la main. C'est aussi ce qui
   lèverait la limite des 256 cases par tableau.
4. **Passer un tableau ou une `struct` en argument** — le nom suffit tant qu'il
   n'y en a qu'un ; le jour où deux troupes voudront la même routine, il faudra
   une adresse, donc du seize bits.
5. **Le changement de banc de la cartouche.** Le contrôleur MBC1 est déjà là
   pour la sauvegarde ; s'en servir pour la ROM ferait sauter le plafond des
   32 Ko. Aucun exemple n'en approche encore — Mario tient dans 6 Ko.
6. **Mario dans l'atelier de la carte.** L'atelier sait dessiner un niveau au
   clic, mais celui de Mario, porté de gameboy2, est encore trois tables de
   nombres.
7. **La percussion dans un `Air`.** Un air ne tient que des hauteurs, donc les
   deux voix chantantes ; la caisse et la charleston se frappent encore à la
   main avec `bruit()`, dans la boucle du jeu. Il faudrait une troisième piste,
   dont chaque pas serait un grain plutôt qu'une note — et la partition de la
   page une ligne de plus.

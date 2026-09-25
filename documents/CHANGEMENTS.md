# Ce que cette passe a ajouté

> Ce fichier porte **toutes les passes**, dans l’ordre : celle-ci — la musique,
> les ateliers, le tutoriel —, puis chaque « passe d’après ». La dernière, tout
> en bas, est **« La passe des couleurs, et de l’atelier complet »** : huit
> palettes, et tout ce qui manquait à l’atelier.

Le compilateur savait faire du son : `note()` jouait **une** note. Une mélodie
s'écrivait donc en comptant les images à la main, dans la boucle du jeu, avec un
compteur et un `switch` — et ce code occupait plus de place que la musique.

Cette passe a ajouté **la musique**, l'atelier qui l'écrit à la souris, et le
tutoriel qui l'enseigne. Le détail de chaque fonction est dans
[`LISEZMOI.md`](LISEZMOI.md) ; ce qui suit est ce qui a changé, et pourquoi.

---

## 1. Le type `Air` — une mélodie dans le programme

```cpp
Air THEME = {
  "DO4 12", "==",      "MI4 12",  "==",      "SOL4 12", "==",      "DO5 13",  "==",
  "SI4 11",  "==",     "SOL4 11", "==",      "MI4 11",  "==",      "--",      "--",
};

jouer(1, THEME, 8, 1);   // voix 1, huit images par pas, sans fin
```

| Pas | Ce qu'il fait |
|---|---|
| `"DO4 12"` | une note, et son volume de 0 à 15 (12 par défaut) |
| `"--"` | fait taire la voix |
| `"=="` | ne touche à rien : la note d'avant **continue** |

`"=="` n'est pas un raccourci d'écriture. Sans lui, une blanche s'écrirait en
rejouant la même note à chaque pas — et l'oreille entend alors quatre coups, pas
une note tenue.

`jouer(voix, AIR, vitesse[, boucle])` lance l'air, `airFini(voix)` dit qu'il est
au bout, `silence(voix)` l'arrête net — le séquenceur avec.

**Deux octets par pas** dans la cartouche, **seize octets par voix** en mémoire
de travail, et le séquenceur n'est gravé que si `jouer()` est écrit quelque part.

### Le tempo vit dans l'interruption, pas dans `image()`

C'est le changement le moins visible et le plus important. Le séquenceur avançait
d'abord dans `image()` : un jeu qui calcule trop rate le VBlank et tourne à trente
images par seconde — **sa musique ralentissait de moitié avec lui**. Un tempo qui
dépend de la charge du jeu n'est pas un tempo.

Il est passé dans l'interruption du VBlank. Un programme qui ne joue rien n'y
trouve qu'un `ret` : la musique ne coûte que ce qu'on en fait.

C'est le contrôle qui l'a attrapé, en comptant 32 images là où une note tenue en
veut 16.

---

## 1 bis. Le texte et le nombre, mis en variable

Deux manques qui se voyaient dès la troisième leçon.

**Un texte qui porte un nom :**

```cpp
const char TITRE[] = "TRACE UNE ZONE";
texte(4, 1, TITRE);
```

Le même message écrit à trois endroits, c'est trois occasions de le changer à
deux endroits sur trois. Il est gravé dans la cartouche, exactement comme des
guillemets écrits sur place — **pas un octet de mémoire de travail**. La routine
qui écrit, elle, ne voit pas la différence : elle a toujours pris une adresse et
une longueur.

**Un nombre calculé, en base dix :**

```cpp
nombre(11, 4, score);      // « 042 » — trois chiffres, zéros de tête compris
nombre(11, 4, vies, 1);    // « 3 »   — un seul chiffre
```

Il fallait jusqu'ici poser les tuiles des chiffres soi-même, et diviser à la
main : `poser(11, 4, 27 + score / 10); poser(12, 4, 27 + score % 10);`. Deux
divisions écrites à chaque affichage, et un score à trois chiffres qu'on
renonçait à montrer.

Les zéros de tête sont écrits : c'est ce que fait une borne d'arcade, et cela
évite qu'un score passant de 9 à 10 déplace tout ce qui suit.

**La position peut être calculée** dans les deux cas :

```cpp
texte(ou, 4, MOT);          // « ou » est une variable
nombre(ou + 8, 4, score);
```

Elle devait s'écrire en clair, et cela se comprenait mal : `texte(x, 4, …)`
était refusé alors que `poser(x, 4, …)` passait, pour la seule raison que l'un
calculait son adresse à la compilation. Quand les deux nombres sont connus,
l'adresse l'est aussi et ne coûte rien ; sinon elle se calcule à l'exécution,
par la même route que `poser()`.

Le nombre s'écrit **de droite à gauche** — le chiffre des unités est le reste de
la division par dix, et le quotient donne la suite. De gauche à droite, il
faudrait savoir d'avance combien de chiffres le nombre occupe, donc diviser deux
fois.

---

## 1 ter. Une tuile qui ressemble à ce qu'elle dessine

Les chiffres 0 à 3 disent la nuance sans ambiguïté, mais huit chiffres à la
file ne ressemblent pas à un dessin. Les quatre signes `. - + #` disent la
même chose, et se relisent de loin :

```cpp
Tuile BLOC = {              Tuile BLOC = {
  "33333333",                 "########",
  "30000003",                 "#......#",
  "30222203",       ou        "#.++++.#",
  "30222203",                 "#.++++.#",
  "30000003",                 "#......#",
  "33333333",                 "########",
};                          };
```

Les deux donnent **exactement les mêmes octets** — c'est éprouvé en comparant
la mémoire vidéo des deux tuiles. Le point est le vide, le dièse est le plein.

Mélanger les deux écritures dans une même tuile est refusé : `"3.22+203"` est
peut-être voulu, mais c'est surtout ce qu'on obtient en corrigeant à moitié une
tuile écrite en chiffres.

**L'atelier rend à chaque tuile son écriture.** Repeindre un pixel d'un dessin
écrit en signes ne le convertit pas en chiffres : le programme reste la vérité,
et le style de celui qui l'a écrit aussi.

---

## 2. L'atelier des airs — écrire une mélodie à la souris

Une partition : un pas par colonne, un demi-ton par ligne, un clavier à gauche,
la bande des volumes en dessous. Les outils `♪ note`, `– silence` et `= tenir`
choisissent ce qu'on pose ; le clic droit fait taire un pas.

**Le bouton « Écouter » joue l'air sans compiler.** La page le fait entendre
elle-même, avec un signal carré et les mêmes hauteurs que la console. Attendre une
compilation entre deux notes rendrait l'écriture d'une mélodie pénible ; la
cartouche, elle, reste la vérité — et le curseur qui court sur la partition suit
l'horloge du son, la seule qui soit d'accord avec ce qu'on entend.

Comme l'atelier de tuiles, il **ne garde rien de son côté** : il lit les
`Air NOM = {…}` du texte et les réécrit.

---

## 3. La page : trois modes

```
🎨 MODE CRÉATION        ⌨ MODE CODE        📚 MODE LEÇONS
   dessiner, composer      écrire le programme   apprendre pas à pas
```

Les ateliers vivaient sous un onglet discret, sous le champ de texte : personne
ne les voyait, et l'atelier de musique passait pour ne pas exister. **Ce qui
change la page entière se commande depuis le haut de la page.**

- **CRÉATION** — les ateliers prennent la place ; le programme se réduit à une
  bande, mais reste sous les yeux : c'est lui que la souris écrit.
- **CODE** — les ateliers s'effacent, tout l'écran au programme.
- **LEÇONS** — voir plus bas.

Et la **taille du champ de code appartient à celui qui écrit** : la poignée en bas
à droite le tire à la hauteur voulue, retenue séparément pour chaque mode.

---

## 4. Le tutoriel : vingt leçons, dix niveaux

Les leçons sortent **triées par difficulté**, deux par niveau :

| Niveau | Les deux leçons |
|---|---|
| **1** Les tout premiers pas | Écrire à l'écran · Effacer ce qu'on a écrit |
| **2** Retenir, et réagir | Une variable, un octet · Lire un bouton |
| **3** Dessiner | Dessiner sa propre tuile 🎨 · Poser tes tuiles à la souris 🖱 |
| **4** Le mouvement | Le front · Un lutin, au pixel près |
| **5** Le son | Le son · Écrire une musique ♪ |
| **6** Ranger ce qu'on manipule | Un tableau et « for » · Le panneau et les nuances |
| **7** Découper son programme | Une fonction qui prend des arguments · **Découper son programme** 🎨 |
| **8** Ce qui va ensemble | Une « struct » · Le décor qui défile |
| **9** Un vrai jeu | Passer d'un écran à l'autre · La pesanteur et le saut |
| **10** Aller au bout | Se souvenir d'une partie à l'autre · **La musique d'un jeu** ♪ |

**L'ordre n'est plus écrit à la main.** Chaque leçon porte sa difficulté, et la
liste se trie toute seule — insérer une leçon facile au milieu ne demande plus de
déplacer cent lignes, ce qui faisait qu'on les mettait au bout, là où personne ne
les trouve au bon moment.

Quatre leçons **embarquent leur atelier** et montrent les deux façons de faire la
même chose : en code, et à la souris. Sur la leçon des tuiles, changer un `0` en
`3` ou cliquer un pixel produisent exactement le même texte.

---

## 5. Les leçons dans le programme

Un PDF se lit ; il ne se pratique pas. Le **MODE LEÇONS** met les vingt leçons
dans l'atelier même : choisir une leçon **charge son programme dans l'éditeur**,
qui tourne aussitôt dans la console d'à côté.

En bas de chaque leçon, le pas suivant est **annoncé par son nom** :

```
◀ Précédent            ensuite — niveau 1 sur 10   [ 2. Effacer ce qu'on a écrit ▶ ]
```

Une flèche seule oblige à cliquer pour savoir où l'on va ; un titre donne envie
d'y aller. Sur la dernière, le bouton dit `✓ Tu es au bout des vingt` et s'éteint
— il ne promet rien qui n'existe pas.

Une leçon qui se fait à la souris porte un bouton qui **ouvre son atelier** :
même programme, même console, l'outil en plus.

---

## 6. Le livret en PDF

```bash
npm run livret        # ou : node livret.mjs
```

Il écrit `tutoriel.pdf` — vingt et une pages, fond clair — et `livret.html`.

**Rien n'y est recopié à la main.** Les leçons viennent de `tuto/lecons.js`, leur
code est compilé pour de bon, la cartouche tourne dans l'émulateur du projet, et
l'image est son écran, pixel pour pixel. Quand l'écran bouge tout seul, il y a
deux images — à une demi-seconde, puis à trois secondes : c'est ce qui rend une
leçon d'animation lisible sur du papier, où rien ne bouge. Les quatre leçons à
outil montrent en plus une photo de leur atelier, prise dans la vraie page.

Un livret dont les captures seraient de vieilles images mentirait le jour où une
leçon change, et personne ne s'en apercevrait.

---

## 6 bis. Un livret par leçon, étape par étape

```bash
npm run livret
```

En plus du livret d'ensemble, **un PDF par leçon** dans `livrets/` :

1. **Ce qu'il faut comprendre** — les explications de la leçon.
2. **Le programme, morceau par morceau** — découpé comme l'œil le lit, chaque
   bloc nommé pour ce qu'il est : un dessin, une fonction, le point d'entrée.
   Une tuile est **montrée**, agrandie, à côté de ses chiffres : lire
   « 30222203 » ne dit pas ce qu'on verra.
3. **Ce qui se passe, étape par étape** — l'écran aux instants qui comptent
   (image 1, 20, 60, 180, 420). Une image identique à la précédente n'est pas
   montrée : un programme qui ne bouge pas n'a qu'une image, et c'est la vérité
   sur ce programme.
4. **Ce que les touches changent** — chaque bouton que le programme lit est
   enfoncé douze images, et l'écran d'après est photographié.
5. **Ce qu'on doit voir**, puis **ce que la console répond** : les contrôles que
   `verifier-tuto.mjs` exige de cette leçon, **joués**, avec leur mesure.

Rien n'y est rédigé à côté du code. Un livret « détaillé » écrit à la main
deviendrait faux à la première retouche, et personne ne s'en apercevrait — c'est
exactement ce que le détail rend le plus probable.

Le banc d'essai qui fait tourner une leçon a été sorti du contrôle
(`tuto/console.mjs`) : le livret en avait besoin du même. Deux copies auraient
fini par ne plus mesurer la même chose, chacune passant au vert sur sa propre
idée.

---

## 6 ter. Prendre un dessin tout fait, et ouvrir une cartouche

**L'onglet « 🖼 Les modèles »** montre seize dessins prêts — quatre personnages
de seize (héros, fantôme, ennemi, vaisseau) et douze tuiles (mur, caisse, pièce,
cœur, arbre, eau, échelle, clé, porte, étoile, sol, pointe). Cliquer l'un d'eux
**l'écrit dans le programme**, sous un nom libre, avec ses rangées — puis
l'atelier l'ouvre pour le repeindre.

Ce n'est pas « importer une image » : il n'y a toujours qu'un seul endroit où
vivent les dessins, et c'est le texte. Un modèle est un point de départ, pas une
bibliothèque fermée.

Dessiner son premier personnage pixel par pixel est une belle chose ; le faire
**avant** d'avoir vu un jeu bouger en décourage beaucoup.

**« 📂 Ouvrir un .gb »**, auprès de la console, fait tourner une cartouche venue
d'ailleurs — la sienne, compilée en ligne de commande, ou celle d'un autre.
L'émulateur de la page est un vrai émulateur ; rien ne l'oblige à ne jouer que
ce que le compilateur produit.

Un bandeau le dit alors en grand : **« la console joue une cartouche venue du
dehors — le programme à gauche n'est plus celui qui tourne »**, avec un bouton
pour revenir. Sans cela, on modifie son code, on recompile, et l'on ne comprend
pas pourquoi l'écran ne bouge pas. Le titre affiché est relu **dans la
cartouche**, en `$0134` — pas pris au nom du fichier : un fichier renommé ne
change pas ce qu'il contient.

---

## 6 quater. Relire une cartouche — le MODE MACHINE

```bash
node desassembler.mjs exemples/mario.cpp 0x0150 60
```

Et, dans la page, un quatrième mode : **🔎 MODE MACHINE**, qui montre ce que la
console exécute vraiment.

**Ce que ce n'est pas.** Le programme C++ n'est PAS dans la cartouche. La
compilation jette les noms, les commentaires, les portées, la forme des boucles.
Aucun outil ne peut les rendre — ils n'y sont jamais entrés. Promettre un
« décompilateur vers le C++ » serait mentir.

**Ce que c'est.** Les instructions, exactement, avec trois choses qui changent
tout :

```
$0154  cd 5f 12   call AttendreVBlank    ; ≈ on attend que l'écran ait fini sa passe
$0158  e0 40      ldh [ECRAN], a         ; ≈ ecran(0) ou ecran(1)
$01ea  f0 80      ldh a, [x]
$01f1  cd 9d 03   call LireManette       ; ≈ bouton(…)

presse_17 :
$01fb  3e 01      ld a, 1
```

- **les registres du matériel nommés** — `ldh [ECRAN], a` plutôt que `$FF40` ;
- **les noms du programme rendus aux adresses** — `ldh a, [x]`, `call
  fn_sauter` — parce que le compilateur, lui, sait où il vient de les ranger.
  Une cartouche venue du dehors n'a pas ces noms, et la page le dit ;
- **ce que chaque appel veut dire en C++** : `call EcrireTexte` vient forcément
  d'un `texte()`. C'est une ressemblance, d'où le `≈` — pas une traduction.

Le contrôle éprouve la seule chose qui compte pour un désassembleur : **la
longueur des instructions**. On relit six programmes d'un bout à l'autre et l'on
exige de tomber exactement sur le dernier octet — un octet de décalage, et tout
ce qui suit devient un charabia plausible, fait d'instructions valides, qu'on
peut lire longtemps sans se douter de rien. 2 689 instructions de Mario, aucune
inconnue.

---

## 6 quinquies. Le bouton « ⚠ CONVERSION »

Rouge, à côté de « Ouvrir un .gb », parce qu'il ne fait pas la même chose que
ses voisins : il **ajoute du code** au programme.

Il sépare les deux choses que tout le monde confond :

**Le code ne se convertit pas.** Le C++ n'entre jamais dans une cartouche. Le
bouton le dit, en toutes lettres, à chaque fois — un bouton qui promettrait une
conversion sans dire où elle s'arrête ferait chercher longtemps.

**Les dessins, si.** Une tuile est un format fixe — seize octets, deux plans de
bits, le même depuis 1989. Les dessins sont donc relus **dans la mémoire vidéo
de la console en train de tourner**, et non dans les octets de la cartouche : un
jeu range ses dessins où il veut, souvent compressés, et personne ne peut
deviner où. Une fois lancé, ce qu'il affiche est là, décompressé, à une adresse
connue.

Ils arrivent dans **leur propre onglet**, `tuiles-prises.cpp`, pour laisser le
programme lisible — et l'atelier les montre aussitôt, prêtes à repeindre. Les
tuiles vides et les doubles sont laissées de côté : un jeu recopie souvent le
même dessin à plusieurs numéros.

Éprouvé sur `tetris.gb` ouvert de l'extérieur : **43 dessins tirés**, et la
lettre A du jeu se retrouve dans l'atelier.

---

## 6 sexies. Le plein écran

**« ⛶ Plein écran »**, auprès de « Son », donne l'écran à la console seule.
`Échap` en revient, et le bouton le dit — c'est l'événement du navigateur qui
règle son libellé, non le dernier clic : on peut sortir par `F11` sans que le
bouton se mette à mentir.

Tout est là dedans :

```js
const facteur = Math.max(1, Math.floor(Math.min(innerWidth / 160, innerHeight / 144)))
```

**Le plus grand multiple ENTIER qui tient**, et les bandes noires que ce choix
laisse. C'est le seul endroit où ce bouton pouvait mal tourner. Étiré jusqu'aux
bords, un pixel de la console tombe à cheval sur deux pixels du moniteur : une
rangée sur trois paraît plus épaisse que ses voisines. La leçon « un lutin au
pixel près » deviendrait alors une leçon sur les défauts du navigateur.

Perdre trente pixels de haut vaut mieux que déformer les cent quarante-quatre
autres.

C'est le **cadre** qui passe en plein écran, et non le canevas : le canevas
seul serait étiré par le navigateur jusqu'aux bords, ce qu'on vient précisément
d'éviter.

---

## 7. Ce qui a été vérifié

Deux suites de plus, et deux existantes complétées :

```bash
node verifier-airs.mjs          # 32 contrôles — le séquenceur écouté note par note
node verifier-atelier-airs.mjs  # poser une note écrit-elle la bonne hauteur ?
```

`verifier-airs.mjs` ne regarde pas l'écran : il **écoute la voix de l'émulateur à
chaque image**. L'ordre des notes, les seize images d'une note tenue, le silence,
le rebouclage, l'arrêt — et les refus du compilateur, avec leur message.

`verifier-atelier-airs.mjs` clique dans la partition d'un vrai Chrome et contrôle
que la hauteur écrite est celle de la ligne visée — `DOD4`, et non `RE4`. Un
éditeur de musique qui écrirait un demi-ton à côté serait pire qu'aucun éditeur :
on corrigerait la partition à l'oreille sans jamais comprendre.

`verifier-page.mjs` ne se contente pas de trouver le bouton du plein écran : il
le **clique**, et il mesure la taille prise par le canevas.

```
✓ l’agrandissement est un multiple ENTIER — aucun pixel déformé (640×576, soit ×4, dans 800×600)
```

Le plein écran n'est accordé qu'à un geste du visiteur. `evaluer()` a donc reçu
un drapeau `geste` : sans lui, `requestFullscreen()` est refusé, et le contrôle
mesurerait la règle de sécurité de Chrome plutôt que la page — vert ou rouge
pour une raison qui n'a rien à voir avec le code.

**Au total : huit suites en ligne de commande, quatre dans un vrai navigateur.**

---

## 8. Les bogues que cette passe a trouvés

| Ce qu'on voyait | La cause | Ce qui l'a trouvé |
|---|---|---|
| Une musique **deux fois trop lente** | Le séquenceur avançait dans `image()`, que l'exemple ratait une image sur deux | Le contrôle des airs : 32 images pour une note qui en veut 16 |
| Les **deux ateliers affichés en même temps** | `display: flex` l'emporte sur l'attribut `hidden`, qui ne vaut qu'un `display: none` par défaut. Le contrôle interrogeait la propriété `hidden` — laquelle disait vrai | Une capture d'écran ; puis le contrôle, réécrit pour regarder ce qui est **vu** |
| Une capture d'atelier qui montrait **du texte au hasard** | Le découpage d'une capture part du haut du **document** ; `getBoundingClientRect` mesure depuis le haut de ce qu'on **voit** | L'image elle-même, regardée |
| « Un `Tuile` prend… », accents graves compris | Le rendu du texte des leçons existait en **trois copies**, et l'une ne savait pas lire ` **`code`** ` | Une capture de la leçon 7 — puis les trois copies réunies dans `tuto/enrichir.js` |
| Le menu « qui n'avait pas changé » | Le navigateur resservait sa copie en cache | `.htaccess` : plus rien de ce dossier n'est mis en cache |
| `nombre()` affichait toujours **144** | `AttendreVBlank` relit le registre de l'écran, donc écrase `a` — la valeur à afficher était perdue avant d'être écrite, et remplacée par le numéro de la ligne balayée. Un « 144 » parfaitement stable, qu'on prend d'abord pour un calcul faux | Le contrôle du langage, qui relisait « 042 » sur l'écran |

---

## Les fichiers ajoutés

| Fichier | Rôle |
|---|---|
| `editeur-airs.js` | la partition : lire, réécrire et faire entendre les `Air` du programme |
| `exemples/musique.cpp` | deux voix qui bouclent, une fanfare par-dessus |
| `livret.mjs` | le tutoriel en PDF, captures comprises |
| `tuto/enrichir.js` | le texte d'une leçon en balises — le seul endroit où cette transformation existe |
| `verifier-airs.mjs` | le séquenceur, écouté note par note |
| `verifier-atelier-airs.mjs` | la partition, pilotée dans un vrai navigateur |
| `.htaccess` | interdit au navigateur de garder ce chantier en cache |

---
---

# La passe d'après — séparer ce qui était mêlé

Quatre choses qui se ressemblent plus qu'il n'y paraît : à chaque fois, deux
choses tenaient dans une seule, et l'une écrasait l'autre en silence.

---

## 1. Deux consoles, deux cartouches

C'est le gros morceau, et le seul qui touche au compilateur.

Une Game Boy Color a seize teintes par palette. Une Game Boy d'origine en a
quatre, et **ses registres de couleur n'existent pas** — y écrire n'y fait rien
du tout.

Un programme qui pose des couleurs et qu'on veut jouable partout tenait dans
**un seul fichier** : la cartouche portait ses palettes, la vieille console les
ignorait poliment. Ça marche. Mais ça mêle les deux — le `.gb` emportait des
centaines d'octets d'écritures qui n'y faisaient rien, et l'on ne pouvait pas
dire ce que la Game Boy d'origine exécutait vraiment.

**« les deux » fabrique maintenant DEUX cartouches**, dès qu'une seule couleur
est posée :

| fichier | `$0143` | ce qu'il contient |
|---|---|---|
| `mon_jeu.gbc` | `$C0` | toutes les couleurs — une Game Boy Color est exigée |
| `mon_jeu.gb` | `$00` | **pas une seule instruction de couleur** |

Le même programme, compilé deux fois. Les dessins, le son, les boutons et la
logique sont identiques : c'est le seul côté couleur qui s'en va.

```
node gb3.mjs exemples/couleur.cpp
exemples/couleur.gbc   1923 octets de programme — en COULEUR
exemples/couleur.gb    1609 octets de programme — pour Game Boy
  → 314 octets de couleur en moins : la Game Boy ne les exécutait pas
```

**314 octets** que la vieille console transportait sans jamais les exécuter.

### La règle vit à un seul endroit

`exigerLaCouleur()` avait deux réponses. `couleurIci()` en a trois, et elle est
posée aux **trois seuls appels** du compilateur qui écrivent dans les registres
de couleur :

| | quand | ce qui sort |
|---|---|---|
| **ÉMETTRE** | la console visée a la couleur | les écritures en `$FF68`/`$FF69` |
| **OMETTRE** | on fabrique le `.gb` des deux | rien du tout |
| **REFUSER** | « Game Boy » demandée seule | la faute d'avant, mot pour mot |

Deux points sur lesquels il fallait être strict.

**Les contrôles d'écriture passent AVANT la question.** Une palette au-delà de
7, un rouge au-delà de 31 : refusés dans les deux compilations. Sans cela,
« les deux » voudrait dire « celle qui compile », et l'on découvrirait la faute
en branchant l'autre console.

**Un argument qui appelle une fonction est refusé** en mode omission, avec un
message qui dit où le mettre. L'omettre ôterait ce que cette fonction fait, et
les deux cartouches ne diraient plus la même chose — l'une jouerait un son,
l'autre non.

### Partout ailleurs

- **La page** : `⬇ .gbc` et `⬇ .gb` côte à côte. Deux boutons plutôt qu'un menu :
  on voit du premier coup d'œil qu'il y a deux fichiers. L'encadré de
  compilation dit ce qui les distingue, en octets.
- **Le projet** : son dossier garde les deux. Ôter la couleur d'un programme
  **efface** le `.gbc` — sinon il resterait là, plus vieux que tout le reste, et
  l'on croirait avoir encore une version en couleur jusqu'à la brancher.
  `renommer` déplace les deux.
- **Un programme sans couleur ne donne qu'un seul fichier.** Deux cartouches
  identiques n'apprendraient rien à personne.
- `--console gb` et `--console gbc` seules : inchangées.

---

## 2. « ✦ Nouveau » écrasait le projet ouvert

Le plus grave de la passe, et il ne se voyait pas.

`index.html` ne créait le dossier du nouveau projet **que si aucun projet
n'était ouvert** :

```js
if (typeof projets !== 'undefined' && !projets.courant) {   // ← le bogue
  projets.creerDirect(nom, propre)                          // ← et pas d'await
}
```

Avec un projet ouvert, on tapait un nom, et :

- **aucun dossier n'était créé** — le jeu n'entrait dans aucune liste ;
- le bandeau continuait de nommer le projet d'avant ;
- et la compilation qui suit — elle enregistre dans le projet ouvert — écrivait
  le programme vide **par-dessus le travail de la veille**.

Deux pertes d'un seul clic : le jeu qu'on croyait créer, et celui qu'on avait.

La correction tient en deux gestes, et leur **ordre** est tout : on met à l'abri
ce qui est à l'écran, on **quitte** le projet d'avant, *puis* on efface. Rester
dedans une ligne de plus, c'est laisser la compilation suivante écrire dans le
mauvais dossier.

`creerDirect` ne se tait plus non plus sur un refus : serveur absent = silence,
la page marche seule ; serveur qui refuse = on le dit, au lieu de laisser croire
que le dossier existe.

Et le bandeau compte : **« 3 projets sur le disque — clique pour en ouvrir un »**
au lieu du muet « aucun projet ». Un bouton **📂 Ouvrir** ouvre le lecteur : il
n'avait qu'une porte, le bandeau, dont rien ne disait qu'il se clique.

---

## 3. Le premier dessin passait devant l'en-tête

```js
if (dessins.length === 0) return bloc + '\n\n' + source   // tout en haut
```

Sur un programme neuf — le seul qui n'a encore aucun dessin — la tuile se
collait **avant le commentaire qui nomme le jeu**. Le programme ne s'ouvrait
plus sur ce qu'il fait, mais sur seize rangées de guillemets, et sa propre
présentation se retrouvait enterrée au milieu.

`editeur-airs.js` avait la même ligne : le premier **air** faisait pareil.

La règle vit maintenant dans `programme.js`, **une seule fois pour les deux
ateliers** : à la suite de ses pareils quand il y en a, sous l'en-tête sinon —
lignes vides, commentaires et `#include` compris.

---

## 4. « + fichier » ne demandait pas de nom

C'était la **seule création de la page** qui ne demandait rien : elle posait
`fichier2.cpp`, `fichier3.cpp` en silence, pendant que tuiles, persos, airs,
modèles, images et projets passaient tous par `demanderUnNom()`.

Un programme découpé se relit pourtant par les noms de ses fichiers :
`dessins.cpp` dit ce qu'il y a dedans, `fichier3.cpp` ne dit rien.

Un genre `fichier` est venu dans `REGLES_DU_NOM`. Il ramène ce qu'on tape à ce
que **le disque** accepte — `projets.php` ne prend que `[A-Za-z0-9_-]` suivi de
`.cpp` : « Mes Dessins ! » devient `mes_dessins.cpp`. Et le numéro d'un doublon
se glisse **avant** l'extension : `mes_dessins2.cpp`, et non `mes_dessins.cpp2`,
qui ne serait plus un fichier C++ ni pour le `#include` ni pour le service.

Le nom proposé reste celui d'avant : valider sans rien changer rend exactement
l'ancien comportement.

---

## 5. Ce qui a été vérifié

Rien de ce qui précède n'a été jugé sur relecture. Chaque correction a son
contrôle, et la plus grave a d'abord été **reproduite** dans un vrai Chrome
piloté :

```
projet ouvert : mon_jeu2
« ✦ Nouveau », on tape « tout_neuf » →
  dossiers       : mon_jeu, mon_jeu2, mon_jeux    ← aucun « tout_neuf »
  mon_jeu2 dedans: /* TOUT NEUF ... */            ← ÉCRASÉ
```

puis rejouée après correction, avec un marqueur dans le projet d'avant :

```
  dossiers       : mon_jeu, mon_jeu2, mon_jeux, tout_neuf
  mon_jeu2 dedans: // LE TRAVAIL DE LA VEILLE — ne doit pas disparaître   ← intact
```

**647 contrôles** : 378 en ligne de commande, **242 dans un vrai Chrome piloté**,
et 27 en appelant le service par HTTP, comme la page le fait.

```bash
npm run verifier               # 378 contrôles, 15 suites en ligne de commande
node verifier-page.mjs         # 111 — la page, pilotée dans un vrai Chrome
node verifier-atelier.mjs      # 102 — les ateliers, les projets, les noms
node verifier-projets.mjs      #  27 — le service qui écrit sur le disque
node verifier-atelier-airs.mjs #  19 — la partition, à la souris
node verifier-frappe.mjs       #  10 — le programme tapé touche par touche
```

Trois contrôles valent d'être cités, parce qu'ils portent sur ce qu'on ne peut
pas voir à l'écran :

```
✓ et elle est PLUS COURTE : les octets de couleur n’y sont pas
    (1923 octets contre 1609 — 314 de moins)
✓ le projet d’avant est INTACT — rien n’a été écrit par-dessus
✓ les noms que la PAGE fabrique, le disque les accepte
    (mes_dessins.cpp, decor_du_niveau_3.cpp, porte.cpp, 3_cailloux.cpp)
```

Le dernier lit la règle de nommage **dans `index.html`**, lui fait nommer les
pires noms qu'on puisse taper, et demande au service de les écrire. Les deux
règles vivent à deux endroits ; c'est là qu'on saura le jour où elles
divergeront.

Le contrôle de l'atelier **range derrière lui** : il relève les projets présents
avant de commencer, et n'ôte à la fin que ceux qui sont nés pendant. Il en crée
huit — « Nouveau » écrit un dossier à chaque nom qu'on lui donne, et c'est
justement ce qu'il vérifie.

---

## 6. Les bogues que cette passe a trouvés

| Ce qu'on voyait | La cause | Ce qui l'a trouvé |
|---|---|---|
| Un projet **écrasé** en en créant un autre | « Nouveau » gardait le dossier d'avant, et la compilation suivante y écrivait le programme vide | Le scénario rejoué dans un vrai Chrome — pas la relecture |
| Un projet en couleur **ineffaçable** depuis la page | `supprimer` n'efface que ce qu'il sait avoir écrit, et sa liste blanche ne connaissait pas `.gbc` | Le nettoyage du contrôle de l'atelier, qui n'arrivait plus à ranger |
| Une tuile **en tête de fichier**, avant le titre du jeu | Le premier dessin n'avait aucun pareil derrière lequel se ranger | Le programme collé par qui s'en servait |
| Huit dossiers **laissés** dans `projets/` par la suite de contrôles | Elle créait un projet à chaque nom essayé et n'avait jamais rangé — la correction du bogue 1 l'a rendu visible | Un `ls` après la passe |
| Un contrôle **faux** sur le placement du premier dessin | Il cherchait `int main()` par `indexOf`, or l'en-tête du programme neuf **cite** « int main() » dans sa phrase | Le contrôle lui-même, rouge sur un code juste |

Le dernier mérite d'être gardé : un contrôle rouge n'accuse pas toujours le
code.

---

## Les fichiers ajoutés

| Fichier | Rôle |
|---|---|
| `compilateur/cartouches.js` | une cartouche, ou DEUX : le `.gbc` avec ses couleurs, le `.gb` sans une seule |
| `programme.js` | où poser un morceau dans le programme — la règle, hors des ateliers |

---

# La passe d'après — trois leçons, un parcours, et le PDF réparé

Cette passe n'a touché aucun moteur. Elle a rempli des trous précis du
tutoriel, écrit le chemin pour y arriver, et réparé l'outil qui imprime tout
ça — sur une machine qui n'avait pas Chrome.

## 1. Sécurité d'abord : le dépôt n'était sous aucun contrôle de version

`gameboy3` n'avait jamais eu de `.git`. Premier geste, avant tout le reste :
`git init`, commit de l'existant tel quel, puis un commit par changement
ensuite. Rien de fonctionnel, mais c'est ce qui rend tout ce qui suit
réversible.

## 2. Six exemples inspirés du manuel PICO-8

`exemples/bouton-front.cpp`, `hasard-des.cpp`, `camera-defilement.cpp`,
`donnees-persistantes.cpp`, `collision-boite.cpp`, `effet-sonore.cpp` —
chacun isole une notion (front d'un bouton, aléatoire, caméra, sauvegarde,
collision, bruitage court) et compile sans erreur. Le sélecteur du Mode Code,
dans `index.html`, les propose désormais.

À l'usage, cinq des six se sont révélés être des doublons de leçons déjà
écrites (le front, la caméra, la sauvegarde, les collisions et le bruitage
étaient déjà enseignés ailleurs) — seul `hasard-des.cpp` comblait un vrai
trou. Un exemple qui compile n'est pas la même chose qu'une notion qui manque
au tutoriel ; les deux ont fini par être vérifiés séparément.

## 3. Trois nouvelles leçons, écrites à la main

| # | Titre | Niveau | Ce qu'elle comble |
|---|---|---|---|
| 12 | Un dé, et le hasard du matériel | 2 | `hasard()`/`semer()` — jamais isolés, seulement mentionnés en passant dans une autre leçon |
| 71 | Passer à la salle suivante, sans bouton | 9 | un changement de salle déclenché par la POSITION du héros, pas par un bouton — la leçon 63 ne couvrait que le second cas |
| 79 | Ce qu'une ligne de C++ devient, en vrai | 10 | le lien entre le code écrit et le **🔎 MODE MACHINE** de l'atelier, qui existait dans l'interface sans qu'aucune leçon n'en parle |

Chacune montre du désassemblage ou un comportement réellement produit par le
compilateur du projet — rien n'est un exemple inventé pour l'occasion.

## 4. `PARCOURS.md` — les chemins vers un jeu entier

Un nouveau fichier, à la racine, qui ne réenseigne rien : il pointe vers les
leçons existantes, dans l'ordre où les lire pour arriver à un jeu complet.

- **Pas à pas Tetris** et **Pas à pas Super Mario** — douze étapes chacun,
  jusqu'aux jeux déjà livrés dans `exemples/`.
- **Pas à pas Mega Man** — parcours théorique : ce qui existe déjà, et cinq
  mécaniques sans équivalent (un tir déclenché par le joueur, une jauge qui
  descend, l'invincibilité clignotante, plusieurs types d'ennemis, des
  salles fixes).
- **Sept autres genres jamais abordés** (RPG, shoot 'em up, aventure vue du
  dessus, course, sport, Sokoban, jeu de rythme), chacun avec ce qui est déjà
  là et ce qui manquerait pour de vrai.

Rien n'a été construit pour ces sept genres — le fichier dit où sont les
briques et où sont les trous, pas plus.

## 5. Le PDF ne s'imprimait plus : Chrome absent, remplacé par Brave

`livret.mjs`, `fiche-ecrans.mjs` et six autres scripts cherchaient Chrome à
trois chemins fixes, introuvables sur cette machine. Chacun cherche
maintenant aussi le chemin de Brave — un autre navigateur basé sur Chromium,
piloté par le même protocole. L'adresse que `livret.mjs` visitait
(`http://localhost/gameboy3/`, pensée pour un Apache) a aussi été changée pour
le serveur réellement lancé ici (`http://localhost:8000/`).

`tutoriel.pdf` (79 pages, une par leçon) et les 79 livrets détaillés dans
`livrets/` s'impriment de nouveau, avec les vraies captures de l'émulateur.

## 6. Ce qui a été vérifié

```
npm run verifier
  79 leçons, 79 qui compilent
  TUTORIELS.md à jour avec les leçons
  le portage depuis gameboy2 : ecrans, menu, mario — 500 images identiques
tout est vert
```

Chaque leçon ajoutée a été relue une fois compilée : `node verifier-tuto.mjs`
fait vraiment tourner son programme dans l'émulateur et joue les contrôles
annoncés, avant que la leçon ne soit committée.

## Les fichiers ajoutés

| Fichier | Rôle |
|---|---|
| `PARCOURS.md` | les chemins pas à pas vers Tetris, Mario, et neuf autres genres |
| `exemples/bouton-front.cpp` … `effet-sonore.cpp` | six exemples PICO-8, un par notion |
| trois leçons dans `tuto/tutoriels.js` | le hasard, la salle suivante, le C++ en machine |

# La passe d'après — MEGA, le premier jeu façon Mega Man

Cette passe n'a touché ni le compilateur ni l'émulateur. Elle a construit,
dans l'atelier et avec le langage tel quel, ce que `PARCOURS.md` appelait un
« parcours théorique » — et elle a trouvé, en le mettant sérieusement à
l'épreuve plutôt qu'en le relisant, deux bogues bien réels.

## 1. `projets/mon_mario` — un robot qui court, saute et tire

Un niveau entier, écrit à partir de zéro dans le style idiomatique que le
projet recommande plutôt qu'en reprenant `exemples/mario.cpp` tel quel : des
fonctions qui prennent des arguments et rendent une valeur (`estSolide`,
`heurteSurLigne`, `heurteACote`), et deux `struct` avec leurs méthodes
(`Drone`, `Balle`) plutôt que des tableaux parallèles.

Trois mécaniques que `PARCOURS.md` donnait comme manquantes pour un Mega Man
y tournent maintenant ensemble :

- **Un tir au bouton B** — une `Balle` prend la case libre d'un tableau de
  deux, avance à chaque image, se désactive contre un mur ou un ennemi
  touché.
- **Une jauge d'énergie** de cinq cases, qui ne se redessine que lorsque la
  valeur change plutôt qu'à chaque image.
- **Une invincibilité clignotante** après un coup reçu — un compteur
  d'images pendant lequel le dessin du héros est sauté un tour sur deux.

S'y ajoute une marche animée : trois dessins du héros (`HEROS_DEBOUT`,
`HEROS_MARCHE1`, `HEROS_MARCHE2`, plus `HEROS_SAUT` en l'air), échangés au
rythme des pas plutôt qu'un seul dessin figé qui glisse.

Ce projet reste dans `projets/`, pas dans `exemples/` : il n'est ni vérifié
par `verifier-exemples.mjs`, ni raccroché à une leçon du tutoriel. Le détail
de ce qui est prouvé et de ce qui manque encore (plusieurs types d'ennemis,
des salles fixes) est à jour dans `PARCOURS.md`.

## 2. Premier bogue trouvé : la vitesse perdue en enlevant le bouton « courir »

`exemples/mario.cpp` donnait deux vitesses : B faisait courir à deux pixels
par image, sans B on marchait à un seul. Le terrain — ses trous, la distance
entre deux appuis solides — avait été ajusté pour la vitesse de course.

MEGA a repris B pour le tir, laissant le héros bloqué à un pixel par image en
permanence. Résultat mesuré dans l'émulateur : le premier trou du niveau ne
se franchissait qu'en sautant pile au bord, sans aucune marge — un saut
lancé ne serait-ce qu'une colonne trop tôt échouait à chaque fois. Rien de
cassé dans la physique elle-même, juste un niveau qui n'avait plus la
vitesse pour laquelle il avait été pensé.

Correction : le déplacement de base est passé à deux pixels par image (le
héros appelle deux fois sa fonction d'avance par image plutôt qu'une), pour
retrouver la marge que le bouton course donnait avant.

## 3. Second bogue trouvé : l'écran qui changeait tout seul à l'arrêt

Pour répondre à un vrai décrochage pendant le défilement (dessiner dix-huit
lignes d'un coup, pile au moment où la caméra en avait besoin, prenait
parfois plus qu'une image), MEGA prépare désormais une colonne à l'avance,
quelques lignes par image, bien avant qu'elle soit visible.

Cette préparation n'avait d'abord aucune limite haute liée à la position
réelle de la caméra : immobile, elle continuait quand même à préparer des
colonnes de plus en plus loin. La carte de fond boucle sur trente-deux
colonnes ; au bout d'une trentaine de colonnes d'avance, la préparation
revenait recouvrir des colonnes **encore affichées à l'écran** avec le
contenu d'un endroit bien plus loin dans le niveau — d'où l'écran qui
« changeait tout seul » sans qu'aucune touche ne soit pressée.

Correction : la préparation s'arrête désormais dès qu'elle a une avance
suffisante sur la caméra, et attend que celle-ci avance pour de vrai avant
de continuer.

## 4. Ce qui a été vérifié

```
npm run verifier
  79 leçons, 311 contrôles, tout vert
  30 exemples compilent
  le portage depuis gameboy2 : 500 images identiques
tout est vert
```

Pour MEGA spécifiquement, dans l'émulateur du projet (pas juste à l'écran) :

- 20 000 images de déplacements aléatoires (avant, arrière, sauts, tirs,
  sans schéma prévisible) — zéro image de préparation en retard
- l'écran immobile reste identique, tuile pour tuile, sur 1 000 images sans
  aucune touche pressée
- une traversée complète du niveau jusqu'au drapeau, et un redémarrage
  propre après une mort ou une victoire

## Les fichiers ajoutés ou mis à jour

| Fichier | Rôle |
|---|---|
| `projets/mon_mario/principal.cpp` | MEGA : le jeu complet |
| `projets/mon_mario/projet.json`, `capture.png`, `mon_mario.gb`, `mega_jouable.html` | le projet dans l'atelier, et son export HTML autonome |
| `PARCOURS.md` | Mega Man : trois briques sur cinq désormais prouvées, deux encore manquantes |
| `valorisation.html`, `valorisation.pdf` | volume de lignes recompté, statut Mega Man mis à jour |

# La passe d'après — ranger la racine, et un bouton vers l'assembleur

Cette passe n'a touché ni le langage ni le compilateur. Elle a rangé un dépôt
devenu difficile à parcourir (une centaine de fichiers en vrac à la racine),
ajouté un vrai raccourci pour démarrer, et raccroché un bouton à une
fonctionnalité qui existait déjà sans être visible.

## 1. La racine — d'une centaine de fichiers en vrac à vingt-quatre

Quatre dossiers, chacun pour une seule sorte de chose :

| Dossier | Contenu |
|---|---|
| `outils/` | les scripts qu'on lance à la main (`gb3.mjs`, `livret.mjs`, `tutoriels.mjs`, `reglages.mjs`, `desassembler.mjs`, `porter.mjs`…) |
| `verification/` | les vingt-deux `verifier-*.mjs` |
| `documents/` | `TUTORIELS.md`, `PARCOURS.md`, `CHANGEMENTS.md`, `valorisation.html`/`.pdf`, `tutoriel.pdf`, `livret.html`, la fiche « passer d'un écran à l'autre » |
| `images/` | toutes les captures d'écran |

Restent volontairement à la racine `index.html`, `tuto.html` et tout ce
qu'ils chargent directement dans le navigateur (`compilateur/`,
`emulateur.js`, les `editeur-*.js`…) : ces fichiers sont trop imbriqués entre
eux, et trop référencés dans une page de 182 Ko, pour être déplacés sans
risque réel de casser l'atelier — le rapport risque/gain était mauvais.

Chaque `import` déplacé a été corrigé à la main (les chemins relatifs des
modules ES ne sont pas les chemins relatifs des lectures de fichiers : une
confusion entre les deux a d'abord cassé `verifier-tutoriels.mjs`, trouvée en
relançant `npm run verifier` juste après). `package.json` et `LISEZMOI.md`
ont été mis à jour avec les nouveaux chemins de commande.

Un fichier parasite, `-o` — une cartouche `.gb` de 32 Ko oubliée à la racine,
née d'un flag `-o` mal interprété par un shell, sans aucune référence dans le
dépôt — a été supprimé.

## 2. `lancer.bat` — un vrai bouton pour démarrer

Jusqu'ici, démarrer l'atelier demandait un terminal (`node demarrer.mjs`).
Double-cliquer `lancer.bat` fait la même chose, et affiche une explication
si Node.js manque au lieu de fermer la fenêtre en silence.

## 3. `sommaire.html` — une page qui pointe vers tout

Une seule page de liens vers l'atelier, les 24 leçons illustrées,
`TUTORIELS.md`, `PARCOURS.md`, le PDF, les livrets, la fiche « passer d'un
écran à l'autre », `LISEZMOI.md`, `valorisation.html`, `CHANGEMENTS.md`,
`exemples/` et `projets/` — pour ne plus avoir à savoir où chaque chose vit.

## 4. « 🔎 Voir l'assembleur » — un bouton, pas une fonctionnalité neuve

Le **MODE MACHINE** désassemblait déjà la cartouche compilée, avec les noms
du programme retrouvés — mais seulement pour qui savait cliquer l'onglet en
haut de page. Un bouton dans la barre de la console, à côté de « 📷
Capture », bascule directement dessus dès qu'un programme a compilé. Aucun
nouveau code de désassemblage : un raccourci vers ce qui tournait déjà.

## 5. Ce qui a été vérifié

Les vingt-deux `verifier-*.mjs`, un par un, pilotant un vrai navigateur :

```
npm run verifier
  79 leçons, 311 contrôles, tout vert
  le portage depuis gameboy2 : 500 images identiques
tout est vert

verifier-export, verifier-atelier, verifier-atelier-airs, verifier-frappe,
verifier-page, verifier-tuto-page, verifier-projets
  compilation, clics dans les ateliers tuiles/airs, frappe au clavier,
  export HTML autonome, sauvegarde et relecture de projets sur le disque
tout est vert, sans exception
```

Rien n'a été cassé par le rangement — vérifié en pilotant l'atelier réel,
pas en relisant seulement le code.

## 6. Où ça en est, comparé à PICO-8 — à hauteur d'une seule personne

Deux mesures différentes, à ne pas confondre :

- **Maturité du produit** — PICO-8 a dix ans, une communauté de milliers de
  créateurs, un éditeur SFX et une carte pilotée par indicateurs de sprite
  depuis toujours. `gameboy3` a un mois d'existence et zéro utilisateur
  externe. Sur cet axe, pas de comparaison possible — et ce n'est pas
  l'objectif.
- **Ce qu'une seule personne peut construire avec, aujourd'hui** — là, c'est
  déjà comparable. Tetris et Mario sont prouvés de bout en bout (douze
  leçons chacun, jeu entier livré) ; Mega Man tient trois briques sur cinq.
  Deux points restent plus lents ici qu'avec PICO-8 : les effets sonores
  courts (pas d'éditeur dédié — `bruit()` s'écrit à la main) et un décor qui
  réagit par tuile (pas d'indicateurs `fget`/`fset` — la logique se code par
  coordonnée). Un point que PICO-8 ne fait structurellement pas : une
  cartouche qui démarre sur une vraie Game Boy, pas une console fantôme.

Les deux trous identifiés (SFX dédié, indicateurs de sprite) restent dans
`PARCOURS.md`, à combler devant un besoin réel plutôt qu'en prévision.

## Les fichiers ajoutés ou déplacés

| Fichier | Rôle |
|---|---|
| `lancer.bat` | démarrer l'atelier d'un double-clic |
| `sommaire.html` | la page qui pointe vers toute la documentation et les tutoriels |
| `outils/`, `verification/`, `documents/`, `images/` | la racine rangée par nature de fichier |
| `index.html` | le bouton « 🔎 Voir l'assembleur » dans la barre de la console |

---
---

# La passe d'après — importer, sans écraser les pixels

Une seule porte d'entrée existait pour faire venir un dessin de l'extérieur :
**« 📥 Importer une image »**, dans l'onglet « Les modèles ». Elle prend
l'image entière et l'écrase dans **une seule** tuile, huit ou seize pixels de
côté — parfait pour une icône, mais une image qui a plus de détails que ça
perd alors la quasi-totalité de ses pixels, et le résultat ne ressemble plus à
rien.

Cette passe ajoute deux autres portes, chacune à la taille qui convient
réellement à ce qu'on y fait entrer.

---

## 1. « 🔳 Découper une image en tuiles » — une grille, pas une bouillie

Toujours dans « Les modèles ». Au lieu d'écraser l'image dans une tuile,
`importer-image.js` la **découpe en grille** de tuiles de huit pixels : un
pixel réel devient un pixel de tuile, sans être mélangé à ses voisins. Une
image de soixante-quatre pixels de côté, faite au pixel près, ressort donc en
soixante-quatre tuiles qui la reconstituent à l'identique — plafonné à seize
tuiles de large et de haut, pour ne pas tirer des centaines de dessins d'une
photo.

Comme pour un dessin tiré d'une cartouche (« ⚠ CONVERSION »), les tuiles
arrivent dans **leur propre onglet**, `tuiles-image.cpp`, nommées d'après le
fichier (`PHOTO01`, `PHOTO02`, …) — le programme principal reste lisible, et
l'on recopie ou repeint ensuite ce qui sert. Aucun `poser()` n'est écrit : ce
bouton découpe, il ne place pas.

## 2. « 📥 Importer un .gbr » — les tuiles du Game Boy Tile Designer

Toujours dans « Les modèles ». Un nouveau module, `importer-gbtd.js`, lit
directement le format binaire du logiciel de Harry Mulder : trois lettres
« GBO », un numéro de version, puis des blocs (type, identifiant, longueur,
données). Celui qui compte est le bloc `tile_data` — un nom, une largeur, une
hauteur, un compte de tuiles, et pour chacune un octet par pixel, de 0 (le
plus clair) à 3 (le plus sombre) : exactement la nuance qu'une
`Tuile NOM = {…}` de ce programme attend, sans rien à recalculer.

Seules les tailles 8 × 8 et 16 × 16 sont importées — les autres (32 × 32,
8 × 16…) sont listées à part, avec la raison, plutôt que silencieusement
ignorées. Les noms sont assainis pour le compilateur (lettres et chiffres,
jamais un chiffre en tête) et rendus uniques ; une planche de plusieurs tuiles
sous un même nom devient `NOM1`, `NOM2`, … Comme pour la grille d'image,
tout arrive dans son propre onglet, `tuiles-gbtd.cpp`.

## 3. « 📥 Importer une image », sur la carte cette fois — l'écran entier

Dans l'onglet **« 🗺 La carte »**, à côté de « 🗑 Tout effacer ». La carte n'est
pas une tuile : c'est déjà une grille de pixels grande comme l'écran entier,
cent soixante sur cent quarante-quatre — vingt tuiles sur dix-huit. Une image
importée là garde donc infiniment plus de détails que dans un carré de huit.

L'image remplace le dessin de la carte choisie (avec confirmation : ça ne se
défait pas, comme « Tout effacer »), ramenée aux quatre nuances pixel par
pixel, puis réécrite en `poser()` par le même chemin que le dessin à la
souris — `ecrireCarte()` ne voit aucune différence entre une carte peinte à
la main et une carte remplie d'un coup par une image.

---

## 4. Ce qui a été vérifié

```
node --check editeur-carte.js importer-image.js importer-gbtd.js index.html (script extrait)
  aucune erreur de syntaxe

lireGBR() sur des fichiers .gbr synthétiques (construits à la main, octet par octet)
  une tuile simple, un nom accentué assaini en « HEROS »
  une planche de trois tuiles sous un même nom → STRIP1, STRIP2, STRIP3
  un personnage 16 × 16
  une taille non prise en charge (32 × 32) → listée à part, jamais perdue en silence
  un en-tête invalide → rejeté avec un message clair

ecrireCarte() / lireGrilleDeCarte() sur une grille de pixels complète (160 × 144)
  aller-retour écriture puis relecture : identique, pixel pour pixel
```

Ce qui n'a **pas** été fait cette fois : un passage dans un vrai navigateur,
bouton par bouton, comme le font les `verifier-*.mjs` pour le reste de
l'atelier — seulement des vérifications unitaires, en ligne de commande, sur
la logique qui ne dépend pas du DOM. `npm run verifier` reste à lancer pour
la couverture complète.

---

## Les fichiers ajoutés ou mis à jour

| Fichier | Rôle |
|---|---|
| `importer-gbtd.js` | lit un fichier « .gbr » du Game Boy Tile Designer, en tire des tuiles |
| `importer-image.js` | `tuilesDepuisUneImageEnGrille()` — découpe une image en grille, au lieu de l'écraser dans une tuile |
| `editeur-carte.js` | `grilleDepuisUneImage()` et le bouton « 📥 Importer une image » de la carte |
| `index.html` | les boutons « 🔳 Découper une image en tuiles » et « 📥 Importer un .gbr », dans « Les modèles » |

---

# La passe d'après — des chemins qui mentaient, et une quatre-vingtième leçon

Un simple point : relire le projet à la recherche d'endroits qui ne
tiendraient plus debout. Il y en avait plus qu'il n'y paraît — pas dans le
compilateur, mais dans ce qui **parle** du projet, et dans un générateur
censé l'empêcher.

---

## 1. `outils/gb3.mjs` a déménagé, la documentation ne l'a pas suivi

Le script s'appelait `gb3.mjs` à la racine, et vit maintenant dans
`outils/`. `LISEZMOI.md`, `TUTORIELS.md`, `verification/verifier-inclusion.mjs`
et le générateur `outils/tutoriels.mjs` continuaient tous d'écrire
`node gb3.mjs …` — une commande qui échoue avec `Cannot find module`, copiée
telle quelle depuis le README. Le fichier lui-même se citait mal : ses
commentaires d'usage et son message d'erreur (`console.error('usage : node
gb3.mjs …')`) pointaient vers son ancien chemin.

Six foyers corrigés en `node outils/gb3.mjs`, dont deux dans le générateur de
`TUTORIELS.md` — sans quoi la prochaine régénération aurait réécrit l'erreur.

## 2. `outils/reglages.mjs` était cassé — et c'est pour ça que « 51 » ne bougeait plus

Le tableau des réglages du LISEZMOI se dit « engendré », pas tenu à la main.
En le relançant pour vérifier un chiffre, il plantait :

```
ReferenceError: LECONS is not defined
```

Le réglage `leconDepart` (ajouté à `index.html` à une passe récente) lit
`LECONS.length` pour sa borne — et personne ne l'avait ajouté aux « bouchons »
qui simulent la page pendant la génération. Le générateur était mort depuis
l'ajout de ce réglage, silencieusement : rien ne l'exécute jamais tout seul,
donc rien ne prévenait. **C'est très probablement pourquoi le compte de
réglages n'avait jamais suivi** — 53 à la relecture, 51 dans le texte.

Corrigé en import important `LECONS` depuis `tuto/lecons.js` et un bouchon
`const LECONS = { length: … }`. Le générateur tourne à nouveau, et
`node outils/reglages.mjs` réécrit désormais la section de lui-même.

## 3. `outils/gb3.mjs --capture` important les mauvais chemins

Trouvé en testant un nouvel exemple : `--capture` (photographier l'écran
après N images) importait `./emulateur.js` et `./compilateur/png.mjs` —
relatifs à `outils/`, où ni l'un ni l'autre n'existe. Corrigés en
`../emulateur.js` et `../compilateur/png.mjs`. La fonctionnalité n'avait
sans doute plus tourné depuis le déplacement du script dans `outils/`.

## 4. Les décomptes en toutes lettres, tous périmés d'un cran ou deux

`vingt-quatre leçons` (LISEZMOI, `sommaire.html`) pour un mode LEÇONS qui en
sert en réalité soixante-dix-neuf — les vingt-cinq écrites à la main et les
cinquante-quatre tutoriels sont fusionnés dans une seule liste, triée par
difficulté, depuis longtemps ; le chiffre en prose ne l'avait jamais suivi.
`cinquante tutoriels` pour un `TUTORIELS.md` qui en contient tout autant.
Corrigés partout où ils apparaissaient — LISEZMOI.md, `sommaire.html`,
`tuto/lecons.js`, `tuto/tutoriels.js` — vers les comptes réels, **mesurés en
relisant les tableaux**, pas recopiés d'un endroit à l'autre.

## 5. Une quatre-vingtième leçon : « Sinus, cosinus, une seule table »

Ce qui manquait le plus, comparé à un tutoriel PICO-8 : la trigonométrie.
Rien d'étonnant — pas de virgule flottante ici, et **pas de type signé du
tout** (voir « Ce qui est compris » du LISEZMOI). La leçon montre la
solution qu'un huit bits impose : une table gravée de trente-deux pas, où
chaque case vaut `40 + 40·sin(angle)` — toujours entre 0 et 80, jamais
négatif —, et un cosinus qui **relit la même table**, huit pas plus loin,
puisque 90° est un quart de tour.

```cpp
const uint8_t SINUS[] = { 40, 48, 55, 62, 68, 73, 77, 79, 80, 79, … };
uint8_t indice = cosinus ? (angle + 8) % 32 : angle;
uint8_t y = 28 + SINUS[indice];
```

Une balle traverse l'écran en ondulant ; A bascule — **au front**, pas à
chaque image — entre « A : SINUS » et « A : COSINUS », et elle saute d'un
quart de tour au changement.

Elle vit dans `TUTORIELS` (`tuto/tutoriels.js`), en difficulté 10 : la
dernière du tri, pour qu'on la retrouve tout au bout du mode LEÇONS plutôt
qu'égarée au milieu — un choix de rangement, pas une évaluation de sa
difficulté réelle, qui tient plutôt du niveau 6.

---

## 6. Ce qui a été vérifié

```
node outils/reglages.mjs
  53 réglages, 7 groupes — le générateur tourne, et LISEZMOI.md est réécrit avec

node outils/tutoriels.mjs
  80 leçons, 80 qui compilent — TUTORIELS.md réécrit avec

node verification/verifier-tuto.mjs
  80 leçons, 317 contrôles
  tout est vert — y compris les six contrôles de la nouvelle leçon

node verification/verifier-tutoriels.mjs
  ✓ il est à jour avec les leçons
  ✓ il porte toutes les leçons
  ✓ chaque leçon porte son programme (80 blocs pour 80 leçons)
  tout est vert
```

Compilé et capturé pour de vrai, avant d'écrire la leçon : `node
outils/gb3.mjs exemples/onde.cpp --capture 200 --touches A` — la balle
ondule, le texte bascule sur COSINUS après l'appui, exactement comme annoncé.

---

## Les fichiers ajoutés ou mis à jour

| Fichier | Rôle |
|---|---|
| `outils/reglages.mjs` | bouchon `LECONS` ajouté — le générateur ne plante plus |
| `outils/gb3.mjs` | chemins d'import de `--capture` corrigés ; usage et message d'erreur mis à jour |
| `outils/tutoriels.mjs` | chemins `gb3.mjs` et `verifier-tuto.mjs` corrigés dans le texte engendré |
| `tuto/tutoriels.js` | la leçon « Sinus, cosinus, une seule table » (difficulté 10), en-têtes de comptage corrigés |
| `tuto/lecons.js` | commentaire de comptage corrigé |
| `LISEZMOI.md`, `sommaire.html` | chemins `gb3.mjs`, et tous les décomptes (réglages, leçons, tutoriels) mis à jour |
| `documents/TUTORIELS.md` | régénéré — quatre-vingts leçons |
| `verification/verifier-inclusion.mjs` | chemin `gb3.mjs` corrigé dans le commentaire du fichier engendré |
| `exemples/onde.cpp` | l'exemple autonome, gardé à côté de la leçon |


---

# La passe des couleurs, et de l'atelier complet

> Cette passe fait deux choses. D'abord, les **couleurs** : huit palettes
> claires et un changement de couleur qui ne touche que le dessin ouvert.
> Ensuite, la **liste de fonctions** d'un vrai atelier de jeu. Tout ce qui y
> manquait est fait, en cinq lots, sauf ce que la console ne permet pas.
> Le détail de chaque geste est dans [`LISEZMOI.md`](../LISEZMOI.md).

## 1. Les couleurs

- **Huit palettes, numérotées de 0 à 7**, pour le décor comme pour les
  personnages. La 0 est la normale : les verts de la Game Boy.
- Peindre avec une couleur **donne sa palette** au dessin : la tuile entière,
  le carré de 8 × 8 de la carte, ou le quart du personnage. La console fait
  ainsi, et l'atelier le dit. Aucun pixel n'est refusé.
- **Un carré de 8 × 8 n'a que quatre couleurs** : c'est la limite de la Game Boy
  Color. Le carré voisin peut prendre une autre palette.
- **🎨 Variétés** : onze palettes toutes prêtes, de 0 à 10.
- **🎨 Thèmes** : les huit palettes d'un coup, qui vont ensemble (forêt, désert,
  glace, volcan…).
- **🎨 Changer cette couleur** ne change que le dessin ouvert, **Variétés**
  aussi. Si d'autres dessins se servent de la même palette, le dessin ouvert
  reçoit une *copie* dans une palette libre. Avant, changer une couleur de la
  palette 0 changeait tout l'écran.
- On choisit **une** console : **En couleur** (`.gbc`) **ou** **Game Boy**
  (4 nuances). Le choix « les deux » a disparu de la page et des textes
  (Cours 37 et 42, visite guidée, présentation, message du compilateur).
- **Les bogues corrigés :**
  - des tuiles se volaient leur palette : un `teindre` voisin comptait pour la
    mauvaise tuile ;
  - les vignettes de la bande prenaient toutes la palette de la tuile ouverte.

## 2. Sélectionner, déplacer, copier

- Sur la carte, la sélection peut être libre, un carré de 8 × 8 ou un bloc de
  16 × 16 calé sur la grille. On l'attrape, on la glisse : elle retombe sur la
  case la plus proche.
- Dans une tuile ou un personnage : « ⬚ Sélectionner et déplacer »,
  « 📋 Copier le dessin », « 📌 Coller ici », « ⧉ Dupliquer ».
- **Leçon 19** : « Intégrer une carte dans son projet ». Elle contient une tuile
  8 × 8, un personnage 16 × 16 et une carte.
- **Leçon 20** : « Les couleurs : palettes, variétés et thèmes ».

## 3. Le plein écran

- **Le clic peignait parfois le pixel du dessus.** Au survol, la ligne
  « ce carré → palette 0 » apparaissait et poussait le dessin de 1,6 px vers le
  bas. Les lignes de texte de la barre ont maintenant une hauteur fixe.
- **La barre des couleurs sortait de l'écran** : elle faisait 2 232 px de large
  en plein écran. Elle passe maintenant à la ligne.
- **Une tuile en plein écran** se dessine à côté des palettes, au plus grand
  zoom qui tient. Avant, elle était plus petite qu'hors du plein écran.

## 4. Lot 1 — les outils de dessin

- **Dans les tuiles et les personnages :**
  - 🧽 gomme, ／ ligne, ▭ rectangle, ◯ cercle (pleins ou en contour),
    🪣 remplir, 💧 pipette ;
  - ⇆ ⇅ **miroirs** et ↻ **quart de tour**, sur tout le dessin ou sur la zone
    choisie. Un personnage retourné garde les palettes de ses quarts.
- **Sur la carte :** 🧽 gomme, et ⇆ ⇅ ↻ sur la sélection.
- **Glisser-déposer** sur la page. Chaque fichier passe par le chemin de son
  bouton « Importer » :
  - image : une tuile ou un personnage, toute la carte si on la lâche sur la
    carte, ou des tuiles 8 × 8 si elle dépasse 16 × 16 ;
  - GIF animé : une image par dessin ;
  - `.gb` / `.gbc` : la cartouche tourne ;
  - `.gbr` : des tuiles GBTD ;
  - `.cpp` : il remplace le programme ;
  - `.mid` : une musique.

## 5. Lot 2 — l'animation

- **`changerDessin(tuile, dessin)`**, une nouvelle fonction du compilateur.
  - Elle réécrit les 16 octets d'une tuile en mémoire vidéo : toutes ses cases
    changent d'un coup, comme dans les vrais jeux.
  - Avant chaque octet, elle attend que l'écran rende la mémoire vidéo.
  - Le dessin vient de la cartouche : `changerDessin(EAU, EAU)` rend donc
    l'original.
- **🎞 Le panneau « Animation »** (nouveau module `animations-tuiles.js`) :
  - des animations toutes prêtes : 🌊 eau, 🔥 feu, 🌿 herbe, ✨ clignoter ;
  - la **frise** des images, la **pelure d'oignon**, un aperçu qui tourne,
    trois vitesses ;
  - l'atelier écrit `animerLesTuiles()` et l'appelle après le premier
    `image();`.
  - Pour un personnage, le panneau dit où l'animer : dans 🧍 Le joueur, ou dans
    👾 Les acteurs.
- **🎭 Les états du joueur** : attente, course (deux pas par image), attaque,
  blessure (il clignote, invincible), mort, victoire, de dos, de face, et une
  animation personnalisée (action « jouer l'animation personnalisée du
  joueur »).
- Chaque branche **choisit** son dessin, et un seul bloc le pose à la fin. Le
  code du joueur est ainsi deux à trois fois plus court qu'en répétant le
  dessin partout.

## 6. Lot 3 — l'interface du jeu

- **SELECT met en pause.** Les vies peuvent s'afficher **en cœurs**.
- Une **barre** (de mana, d'énergie…) suit une variable, jusqu'à dix cases.
- Les textes de **fin** se changent.
- **Un dialogue avec nom et portrait** : le portrait est un dessin de 16 × 16,
  posé avec les lutins 36 à 39. Les acteurs s'arrêtent donc au lutin 35.
- **« Un menu »** : une question et jusqu'à quatre réponses. HAUT et BAS
  déplacent le curseur, A choisit.
- **Le menu principal** : l'écran titre devient **JOUER / COMMENT JOUER**, avec
  quatre lignes d'aide qu'on écrit soi-même.
- **La palette du panneau** : `teindrePanneau(colonne, ligne, palette)`, une
  nouvelle fonction. Le HUD, les dialogues et les menus prennent leur palette.
- **La police personnalisée** : `changerDessin("A", MON_A)`. Une tuile remplace
  une lettre dans tous les textes (panneau « 🔤 Police »).
- **Bogue trouvé :** la police n'a pas de « > », donc le curseur des menus était
  invisible. Il est maintenant dessiné : c'est la tuile `JEU_CURSEUR`.

## 7. Lot 4 — le gameplay

- **La hitbox** : pendant un coup, un carré devant le joueur, dont on règle la
  portée. Chaque acteur a son « QUAND le joueur l'attaque → ALORS… ». Un coup
  ne compte qu'une fois.
- **La hurtbox** : le carré du joueur est réduit d'une marge pour les coups
  qu'il reçoit.
- **Les touches** :
  - vu de dessus : A attaque, B maintenu fait courir ;
  - en plateforme : A saute, B attaque.
- **`DEVANT`** : `teindre(c, l, 2 | DEVANT)` met une case **devant** les
  personnages (bit 7 de l'attribut, Game Boy Color). Dans « Colorier », c'est
  l'outil 🔝, et les cases concernées sont hachurées.
- **🧩 Auto-tuiles** : on peint des carrés de 8 × 8, et leurs bords et leurs
  coins se dessinent selon les voisins.

## 8. Lot 5 — le projet et les dessins

- **🕘 Versions** (nouveau module `versions.js`) :
  - une photo datée toutes les cinq minutes quand le programme change, et des
    photos nommées à la main ;
  - « ↩ Revenir » s'annule par ↶ ;
  - trente versions au plus, gardées dans ce navigateur.
- **La bande des dessins :** 🔎 recherche, ★ favoris (ils passent en tête),
  🏷 étiquettes (`/* NOM : étiquettes … */` sous le dessin), loupe au survol.
- **Import GIF** (`imagesDUnGif`, avec `ImageDecoder`) : une image par dessin,
  et une animation pour une tuile 8 × 8.
- **Import MIDI** (nouveau module `importer-son.js`) : la mélodie (la note la
  plus haute) et la basse (la plus basse) deviennent deux `Air`. La vitesse
  vient du tempo.
- **Import WAV** : la hauteur de chaque morceau de son, par autocorrélation.
  C'est approximatif, et on le dit.

## 9. La documentation

- **`LISEZMOI.md`** :
  - une nouvelle section « Une console : en couleur, ou en quatre nuances » ;
  - la table des fonctions de couleur (`couleurFond`, `couleurLutin`,
    `teindre`, `teindrePanneau`, `teindreLutin`) ;
  - `changerDessin` et `DEVANT` ;
  - les fonctions du panneau qui manquaient ;
  - la commande `--capture`, qui était perdue dans un tableau ;
  - de nouvelles sections : « Animer », « Le jeu : pause, cœurs, dialogues,
    menus », « Versions, et retrouver ses dessins », « Importer, et
    glisser-déposer ».
- **L'aide du MODE CODE** (`aide-fonctions.js`) connaît `changerDessin`,
  `teindrePanneau` et `DEVANT`. L'éditeur les colore.
- **La visite guidée (🎓)** : ses 57 étapes ont été vérifiées dans le navigateur.
  - De nouvelles étapes : Versions, Annuler, Retrouver un dessin, Les outils,
    Animer une tuile.
  - Les textes sont à jour pour la carte, le joueur, les acteurs, les
    événements, le jeu et les airs.
  - Le nombre de leçons est corrigé : 82.
- **Le Cours** : les chapitres 37 et 42 sont réécrits, et les livrets et
  `COURS.md` régénérés.
- **La présentation** (`valorisation.html` et son PDF) est mise à jour.

## 10. Ce qui n'est pas fait, et pourquoi

| Demandé | Pourquoi |
|---|---|
| Des calques sur la carte | La console n'a qu'**une** couche de décor, plus le panneau et les lutins. Des calques se fondraient en un seul dessin dans la cartouche. |
| La compression des tuiles | La console lit ses tuiles telles quelles. Et l'atelier fusionne déjà les tuiles identiques. |
| Un vrai son WAV | La 4ᵉ voix ne lit que 32 échantillons de 4 bits, et l'émulateur ne la joue pas encore. Le WAV devient donc des notes. |

## 11. Ce qui a été vérifié

- **Toutes les séries** `verification/verifier-*.mjs` passent, sauf
  `verifier-portage`, qui a besoin du projet gameboy2, absent ici.
- **Dans le navigateur**, sur Chrome sans fenêtre et une série à la fois :
  - la copie de palette ;
  - le plein écran, où le clic tombe au pixel près ;
  - les outils et le glisser-déposer ;
  - les tuiles animées ;
  - les états du joueur ;
  - les réglages du jeu et les menus ;
  - la case « devant » et les auto-tuiles ;
  - les imports MIDI et GIF ;
  - les versions, la recherche, les favoris et les étiquettes ;
  - chaque étape de la visite guidée.
- **Dans l'émulateur du projet, en jouant pour de vrai :**
  - l'attaque touche l'ennemi devant le joueur, qui disparaît et donne ses
    points ;
  - une blessure fait clignoter le joueur, invincible, sans le renvoyer au
    début ;
  - la pause fige le jeu ;
  - le portrait apparaît, puis s'en va ;
  - BAS, BAS, A choisit la troisième réponse d'un menu ;
  - le menu principal mène à « Comment jouer », puis à la partie ;
  - le panneau prend sa palette ;
  - une case `DEVANT` cache le personnage ;
  - l'eau change bien de dessin entre deux images.
- **Les quatre modèles**, en couleur et en nuances, compilent avec *tous* les
  états et toutes les attaques. Le plus gros fait 29 Ko, sur 32.

## Les fichiers ajoutés ou mis à jour

| Fichier | Rôle |
|---|---|
| `animations-tuiles.js` | **nouveau** — les tuiles animées, les images toutes prêtes, la police personnalisée |
| `importer-son.js` | **nouveau** — MIDI → deux airs, WAV → un air |
| `versions.js` | **nouveau** — les versions datées du programme |
| `compilateur/emetteur.js` | `changerDessin` (tuile ou lettre), `teindrePanneau`, la constante `DEVANT` ; le message « les deux » retiré |
| `barre-paint.js` | 8 palettes, variétés, thèmes, « Changer cette couleur » |
| `editeur-couleurs.js` | variétés, thèmes, palettes montrées |
| `nuancier.js` | qui se sert de quelle palette (`usagesDuDecor`, `usagesDesLutins`, `palettePourLui`) |
| `editeur-tuiles.js` | les outils, les miroirs, la rotation, l'animation, la police, les étiquettes, les favoris, la recherche, la loupe, le plein écran |
| `editeur-carte.js` | la gomme, les auto-tuiles, les miroirs de la sélection, la case « devant », les états du joueur, l'attaque des acteurs, les dialogues, le menu, les réglages du jeu |
| `editeur-scene.js` | les états du joueur, la hitbox et la hurtbox, la blessure, la mort, la victoire, la pause, les cœurs, la barre, le menu principal, la palette du panneau, le dialogue avec portrait, le menu à réponses |
| `editeur-airs.js` | 📥 MIDI, 📥 WAV |
| `importer-image.js` | les images d'un GIF |
| `aide-fonctions.js`, `editeur-code.js` | les nouvelles fonctions, dans l'aide et en couleur |
| `index.html` | le glisser-déposer, 🕘 Versions, l'import GIF, les styles, la visite guidée |
| `tuto/lecons.js` | les leçons 19 et 20 |
| `tuto/programmation.js`, `cours/`, `documents/COURS.md` | les chapitres 37 et 42 réécrits |
| `LISEZMOI.md`, `documents/valorisation.html` / `.pdf` | la documentation |

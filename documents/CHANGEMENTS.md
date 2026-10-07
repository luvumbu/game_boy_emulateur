# Ce que cette passe a ajouté

> Ce fichier porte **toutes les passes**, dans l’ordre : celle-ci — la musique,
> les ateliers, le tutoriel —, puis chaque « passe d’après ». La dernière, tout
> en bas, est **« La passe du chapitre 0 »** : apprendre depuis le programme qui
> ne fait rien, et ce que le langage a gagné pour cela.

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

---

# La passe du chapitre 0 : apprendre depuis le tout début

> 25 septembre 2026. Le tutoriel commençait par « Écrire à l’écran » : un
> programme qui supposait déjà `int main()`, `while` et `texte()` compris. Cette
> passe ajoute **le chapitre 0**, qui part du programme qui ne fait rien, et
> réorganise les chapitres 1 et 2 pour qu’ils avancent **une idée à la fois**.
> Le langage a gagné ce que ces leçons demandaient.
>
> **Ensuite, le même jour**, le chapitre 0 a grandi jusqu’à un premier petit jeu :
> le déplacement pas à pas (0.17 à 0.64, une seule nouveauté par leçon), la croix
> (0.65 à 0.75), un déclencheur (0.76), `chaque`, le rebond, la poursuite, la
> `struct` (0.77 à 0.80), puis les pièces, les murs, le son, les vies et les
> ennemis (0.81 à 0.85). Chaque leçon de 0.1 à 0.75 a ses intermédiaires (0.N.1
> « de base, ailleurs », 0.N.2 « doublé »), les leçons longues une version
> « en simple ». 359 leçons en tout. Les pièces et les murs sont des **lettres**.
>
> **Les fonctions natives ajoutées** (écrites en C, ajoutées à la cartouche
> seulement si le programme s’en sert) : `deplace_x`, `deplace_y`, `deplace`,
> `va_a`, `un_pas`, `vitesse`, `carre` (+ le type `Carre`), `losange`,
> `rectangle`, `spirale`, `aller_retour`, `deplace_croix`, `glisse_croix`,
> `tourne_carre`, `defile`, `chaque`. Seules sur leur ligne, celles qui bougent
> une lettre **rangent sa position** dans la variable donnée (sans `x =`).
>
> **Deux corrections du compilateur** : `AttendreVBlank` écrit tout de suite si
> le VBlank est déjà là (plus de clignotement, plus d’image de trop par pas) ;
> l’attente de `deplace_croix` compte les images réellement passées, une fois
> par image (deux lettres bougent ensemble, et une boucle lente garde la vitesse).

## 1. Les leçons se numérotent 1, 1.1, 1.2… et 0.0, 0.1…

Une leçon marquée `suite: true` **prolonge** la précédente au lieu d’ouvrir la
suivante : elle s’affiche « 1.1 », et les leçons d’après **gardent leur
numéro** — celui des livrets déjà imprimés. Le chapitre 0 (`difficulte: 0`)
compte à part : 0.0, 0.1, 0.2…

`numeros(liste)` et `principales(liste)` (dans `tuto/lecons.js`) donnent ce
numéro à **toutes** les pages : le tutoriel, l’atelier, le livret,
`TUTORIELS.md`, les captures (`tutoriels/01.1.png`).

## 2. Le chapitre 0 : de rien jusqu’au premier jeu

Toujours la même lettre, et une seule idée nouvelle par chapitre.

| N° | Chapitre | L’idée nouvelle |
|---|---|---|
| 0.0 | Le programme qui ne fait rien | `int main()`, `while (true)`, `image()` |
| 0.1 | Afficher la lettre A | `texte(0, 0, "A")` : la case en haut à gauche |
| 0.2 | A, pris dans ALPHABET à l’indice 0 | un tableau commence à 0 ; `poser` et non `texte` |
| 0.3 | Écrire au même endroit écrase | la même case, **exprès** : le B efface le A |
| 0.4 | L’alphabet à la main, jusqu’au bout de la ligne | 20 colonnes : on s’arrête à T, la colonne 20 est refusée |
| 0.5 | La même ligne, avec une boucle for | `for` |
| 0.6 | La même ligne, avec une boucle while | `while (condition)`, et le piège du `i++` oublié |
| 0.7 | La même ligne, avec do … while | la boucle qui fait toujours un tour |
| 0.8 | Tout l’alphabet, avec deux boucles | passer à la ligne à la main |
| 0.9 | Tout l’alphabet, avec une seule boucle | `sizeof`, le quotient `/` et le reste `%` |
| 0.10 | Tout l’alphabet, avec poserS | la fonction qui fait ce calcul |
| 0.11 | Tout l’alphabet, avec textS | la même chose pour un texte |
| 0.12 | Une lettre toutes les secondes | compter les images : 60 par seconde, ≈ 16,7 ms l’une |
| 0.13 | Une lettre toutes les secondes, avec attendre | `attendre(1)` — et sa limite : tout s’arrête |
| 0.14 | Deux choses, deux rythmes | un compteur par chose |
| 0.15 | Deux rythmes, un seul chronomètre | la version courte, avec `%` |
| 0.16 | Deux rythmes, écrits en millisecondes | `ms(1000)`, `ms(250)` |
| 0.17 | Une lettre qui avance de 5 cases | bouger = effacer puis réécrire ; `pas` pour s’arrêter |
| 0.18 | Avancer avec deplace_x | `x = deplace_x(x, 0, A, pas)` ; la copie, `return`, le `x =` |
| 0.19 | Revenir : un pas négatif | + une ligne : `-pas` (rangé 251) ; le retour part de x |
| 0.20 | Voir x à l’écran : nombre | + `nombre(0, 2, x)` : 005 puis 000 |
| 0.21 | Descendre avec deplace_y | l’axe Y, `y = deplace_y(…)` |
| 0.22 | Remonter : deplace_y et un pas négatif | + une ligne ; pourquoi deux fonctions |
| 0.23 | Sans « x = » : la console range la position | le 0.20 sans les `x =` : même cartouche |
| 0.24 | Les deux axes à la suite | deplace_x puis deplace_y, x et y affichés |
| 0.25 | Le carré, côté par côté | + les deux côtés du retour |
| 0.26 | En diagonale : deplace | `deplace(x, y, A, 5, 5)` |
| 0.27 | Le carré avec deplace | + quatre lignes, un 0 sur un axe |
| 0.28 | Aller à une case : va_a | `va_a(x, y, A, 10, 5)` |
| 0.29 | Revenir au départ avec va_a | + `va_a(x, y, A, 0, 0)` |
| 0.30 | Un pas sans attendre : un_pas | une lettre, le chronomètre du 0.17 |
| 0.31 | Deux lettres à la fois | + un deuxième `un_pas` |
| 0.32 | Le trajet dans un tableau | `PAS_X[]`, `PAS_Y[]`, boucle `for` |
| 0.33 | Écrire soi-même sa fonction | `mon_deplace_x` ; `x =` obligatoire |
| 0.34 | Un carré autour d’une lettre, avec carre | une ligne : `carre(10, 8, A, 1, 1, 250, 1)` |
| 0.35 | Taille 2 : un carré de 5 × 5 | un seul carré, taille 2, autour de (10, 8) : colonnes 8 à 12, lignes 6 à 10 |
| 0.36 | Taille 3 : un carré de 7 × 7 | un seul carré, taille 3, autour de (10, 8) : colonnes 7 à 13, lignes 5 à 11 |
| 0.37 | Taille 4 : un carré de 9 × 9 | un seul carré, taille 4, autour de (10, 8) : colonnes 6 à 14, lignes 4 à 12 |
| 0.38 | Taille 5 : un carré de 11 × 11 | un seul carré, taille 5, autour de (10, 8) : colonnes 5 à 15, lignes 3 à 13 |
| 0.39 | Taille 6 : un carré de 13 × 13 | un seul carré, taille 6, autour de (10, 8) : colonnes 4 à 16, lignes 2 à 14 |
| 0.40 | Taille 7 : un carré de 15 × 15 | un seul carré, taille 7, autour de (10, 8) : colonnes 3 à 17, lignes 1 à 15 |
| 0.41 | Taille 8 : un carré de 17 × 17 | un seul carré, taille 8, autour de (10, 8) : colonnes 2 à 18, lignes 0 à 16 ; le plus grand possible |
| 0.42 | Dans l’autre sens : sens -1 | le carré de taille 2, sens 1 → -1 |
| 0.43 | Plus lentement : vitesse 500 | le carré de taille 2, vitesse 250 → 500 |
| 0.44 | Plus vite : vitesse 100 | le carré de taille 2, vitesse 250 → 100 |
| 0.45 | Très vite : vitesse 50 | le carré de taille 2, vitesse 250 → 50 |
| 0.46 | Deux tours | le carré de taille 2, tours 1 → 2 |
| 0.47 | Trois tours | le carré de taille 2, tours 1 → 3 |
| 0.48 | Les réglages sous un nom : Carre | `Carre ronde = { … }; carre(ronde);` |
| 0.49 | De plus en plus grand : 1, puis 2 | taille 1 puis 2, même centre (10, 8) : le milieu, où tiennent les tailles 1 à 8 |
| 0.50 | De plus en plus grand : et 3 | + taille 3 |
| 0.51 | Jusqu’au plus grand : une boucle | `for (taille = 1; taille <= 8; …)` : huit carrés emboîtés, le plus grand touche presque les bords |
| 0.52 | Deux carrés à la suite | un petit carré, puis un grand (taille 3, sens -1, vitesse 100, 3 tours) |
| 0.53 | Deux lettres, deux carrés | A et B, deux centres |
| 0.54 | Trois lettres, trois carrés | + `carre(ronde)` pour le C |
| 0.55 | La vitesse des déplacements : vitesse | `vitesse(100);` puis deplace_x |
| 0.56 | Changer de vitesse en route | + `vitesse(500);` et le retour |
| 0.57 | Un carré sur la pointe : losange | `losange(…)` |
| 0.58 | Plus large que haut : rectangle | `rectangle(…)` |
| 0.59 | Tourner en s’éloignant : spirale | `spirale(…)` |
| 0.60 | Aller et revenir : aller_retour | `aller_retour(10, 8, A, 5, 0, 250, 2)` |
| 0.61 | Aller et revenir en diagonale | + `aller_retour(…, 4, 4, 100, 1)` |
| 0.62 | Deux formes ensemble | losange + rectangle |
| 0.63 | Trois formes ensemble | + spirale |
| 0.64 | Quatre formes ensemble | + aller-retour |
| 0.65 | Une lettre qui avance | le même mouvement, sans fin |
| 0.66 | La lettre bouge avec la croix | la manette : le premier jeu |
| 0.67 | Les variables de la lettre dans leur propre fichier | le 0.66 rangé en deux : `variables.h` et `#include` |
| 0.68 | Voir la position du A en direct | + `nombre(0, 17, x)` et `nombre(4, 17, y)` DANS la boucle ; l’Inspecteur, onglet Variables |
| 0.69 | Chercher le A sur l’écran : lire | + la recherche au bouton A : `lire(c, l) == ALPHABET[0]` sur les 360 cases |
| 0.70 | Plus fluide : la lettre au pixel près | `sprite(0, px, py, ALPHABET[0])` : un lutin, un pixel par image au lieu d’une case de 8 |
| 0.71 | La croix en une ligne : deplace_croix | `deplace_croix(x, y, ALPHABET[0], 250)` : tout le bloc du 0.66, natif, vitesse en ms |
| 0.72 | Plus vite sur la grille : deplace_croix à 100 | vitesse 250 → 100 : 10 cases par seconde |
| 0.73 | Glisser en une ligne : glisse_croix | `glisse_croix(0, px, py, ALPHABET[0], 1)` : le 0.70 en une ligne, vitesse en pixels par image |
| 0.74 | Glisser plus vite : glisse_croix à 3 | vitesse 1 → 3 : 180 pixels par seconde |
| 0.75 | Arrivé en (0, 0), le A devient B | départ (10, 0), `deplace_croix`, position en direct ; `if (x == 0 && y == 0) lettre = 1;` — `&&`, et la lettre dans une variable (`ALPHABET[lettre]`) ; + 0.75.1 (départ (10, 8), toujours B en (0, 0) : à gauche puis en haut) et 0.75.2 (les deux A, chacun B en arrivant en (0, 0)) |
| 0.76 | Un déclencheur en (0, 0) : actif | le drapeau `actif` (0 puis 1), condition à trois morceaux `x == 0 && y == 0 && actif == 0` : une seule fois. Puis 0.76.1 un B apparaît au milieu ; 0.76.2 il tourne en carré pas à pas (`un_pas`, `bpas` de 0 à 15, `else if`) sans bloquer le A ; 0.76.3 plus vite (5 images) ; 0.76.4 deux B à mi-tour ; 0.76.5 un C file à gauche ; 0.76.6 un D file à droite |
| 0.76.7 à 0.76.13 | la série 0.76 en simple | `tourne_carre(numero, x, y, tuile, cote, vitesse)` et `defile(numero, x, y, tuile, sens, vitesse)` : tout le 0.76.6 en quatre lignes |
| 0.77 | Plusieurs rythmes sans compteur : chaque | `if (chaque(250)) { … }` : le 0.16 sans chronomètres |
| 0.78 | Le rebond : une vitesse qui change de signe | `x = x + vx`, au bord `vx = -1` ; + 0.78.1 en diagonale (`vx`, `vy`) |
| 0.79 | Suivre une autre lettre | le B poursuit le A, un pas toutes les 600 ms (le A : 250) : on peut lui échapper ; `sx`, `sy` = 1, -1 ou 0 ; `PRIS` ; + 0.79.1 : il accélère (`lenteur` 36 → 12 images, `chaque(3000)`, `compte >= lenteur`) |
| 0.80 | x et y rangés ensemble : struct | `struct Position { uint8_t x, y; }; Position joueur;`, `joueur.x` ; + 0.80.1 : l’intérieur du `while` dans `boucle.h`, versé par un `#include` AU MILIEU de la boucle ; + 0.80.2 : la façon propre, `void tour_de_jeu()` dans `jeu.h`, la boucle n’a qu’un appel |
| 0.81 | Ramasser une pièce : le P | la pièce est une LETTRE (P) ; `x == px && y == py`, score ; + 0.81.1 réapparaît (tableaux PX, PY) ; + 0.81.2 au hasard (`hasard() % 20`) |
| 0.82 | Un mur qu’on ne traverse pas : le M | les murs sont des LETTRES (M) ; la case d’arrivée `nx`, `ny`, `lire(nx, ny) != ALPHABET[12]` ; + 0.82.1 un labyrinthe |
| 0.83 | Un son quand on ramasse : note | `note(1, DO5, 10, 12)` ; + 0.83.1 `bruit(4, 8)` contre un mur, dans le `else` |
| 0.84 | Des vies et une fin de partie | 3 vies, l’état du jeu (`etat` 0 / 1), PERDU, START pour recommencer |
| 0.85 | Plusieurs ennemis : un tableau de struct | `Position ennemis[3]`, `ennemis[i].x`, départ au hasard, une boucle `for` |
| 0.86 | L’alphabet en gras, avec poserS | `ALPHABET_GRAS` (26 lettres, traits de 2 pixels) avec `poserS` ; + 0.86.1 lignes 5 et 6 ; + 0.86.2 l’ancien et le gras l’un au-dessus de l’autre |
| 0.87 | Agrandir une lettre : texteGrand | `texteGrand(2, 2, "A", 3)` ; + 0.87.1 les tailles 1 à 4 côte à côte ; + 0.87.2 dix fois ; + 0.87.3 un mot, JEU ; + 0.87.4 vingt fois, tout l’écran ; + 0.87.5 `texteGrandS`, qui va à la ligne |
| 0.88 | Des lettres en couleur : couleurTexte | `couleurTexte(31, 0, 0)` : un A rouge ; + 0.88.1 un mot en bleu ; + 0.88.2 changer de couleur en route, avec `chaque(500)` |
| 0.89 | Chaque mot sa couleur : texteCouleur | trois palettes, trois mots ; + 0.89.1 un arc-en-ciel, une palette par lettre avec `teindre` |
| 0.90 | Un titre agrandi, en couleur | `texteGrand` + `couleurTexte` : un grand JEU orange ; + 0.90.1 START vide l’écran (boucle sur 18 lignes) et affiche un autre écran, une variable ecranTitre pour ne le faire qu’une fois ; + 0.90.2 un B qui file (`defile`) ; + 0.90.3 tout l’écran glisse (`defiler`, d-- et l’octet qui boucle) ; + 0.90.4 un bandeau : effacer, avancer, réécrire, une seule ligne bouge ; + 0.90.5 la consigne qui clignote (`visible = 1 - visible`) ; + 0.90.6 SELECT, retour au titre (`dessinerTitre()`, `viderEcran()`) ; + 0.90.7 trois écrans (`ecran` 0, 1, 2 ; la fin ramène au jeu) |
| 0.91 | Le titre, puis le jeu | le titre du 0.90 et le jeu du 0.81 : le jeu n’existe qu’après START ; + 0.91.1 trente secondes (`chaque(1000)`, écran FIN) ; + 0.91.2 le score à la fin, START rejoue (`nouvellePartie()`) ; + 0.91.3 un cadre de murs X, le A qui y entre revient à sa place d’avant ; + 0.91.4 la pièce ramassée réapparaît au hasard, dans le cadre (`1 + hasard() % 18`) ; + 0.91.5 une queue O qui suit le A (la case qu’il quitte, `x != ax \|\| y != ay`) ; + 0.91.6 la queue grandit à chaque pièce (tableaux `qx[50]`, `qy[50]`, boucle qui recule `i--` ; le A seul au départ, `longueur > 0 &&` contre le 0 − 1 = 255) ; + 0.91.7 le A avance tout seul, la croix choisit `sens` (0 à 3) ; + 0.91.8 le mur fait perdre (`finPartie()`, `continue;`) ; + 0.91.9 sans limite de temps (tout ce qui touchait au temps enlevé) |
| 0.92 | Le snake, avec un menu | un 4e écran, le MENU : GAUCHE / DROITE choisissent la couleur du serpent (palette 1, `teindre` après chaque `poser`, `couleurFond(1, 3, …)`, `(couleur + 3) % 4` pour reculer ; `viderEcran()` remet les cases en palette 0, `effacer()` ne le fait pas) ; + 0.92.1 le pas compté en images (`compte`, `attente` : `chaque()` n’accepte qu’un nombre en clair ; ~267 ms au lieu de 250, le tour qui dessine déborde) ; + 0.92.2 B : VITESSE FIXE / MONTE (`monte = 1 - monte`, une image d’attente de moins par P, jusqu’à 5) |
| 0.93 | Un jeu de bombes | le terrain façon Bomberman : cadre X et piliers X (`c % 2 == 0 && l % 2 == 0`), 19 colonnes, le O en (1, 1) ; + 0.93.1 le O bouge, `lire()` et les X l’arrêtent (`else if` : pas de diagonale) ; + 0.93.2 A pose une B, qui apparaît quand le O s’en va (le O ne va plus que sur une case vide, `lire() == 0`) ; + 0.93.3 l’explosion au bout de 120 images, flammes `-` et `\|` (`flammes(allume)` et `caseFeu`, la même fonction dessine et efface) ; + 0.93.4 des bras de 2 cases, `break` au premier X ; + 0.93.5 un W au hasard (`hasard() % 4`, `chaque(400)`) ; + 0.93.6 trois W (`ex[3]`, `ey[3]`) ; + 0.93.7 la flamme détruit les W (`vivant[3]`, `toucheW`, SCORE) ; + 0.93.8 touché par un W ou une flamme : FIN, START rejoue (le drapeau `mort`, `nouvellePartie()`) ; + 0.93.9 `score == 3` : BRAVO ! |
| 0.94 | Un jeu de bombes, avec des briques | le 0.93.9 et des briques M au hasard dans les couloirs (`(c % 2 == 1 \|\| l % 2 == 1) && c + l > 5 && hasard() % 3 == 0` : couloir, hors du coin de départ, une fois sur trois) ; elles bloquent le O, les W et les flammes, et le O qui s’y cogne ne perd pas (`!= ALPHABET[12]`) ; + 0.94.1 la flamme casse les briques : le bras s’arrête sur le M, qui disparaît quand les flammes s’éteignent (`flammes(1)` et `flammes(0)` s’arrêtent ainsi sur la même case) |
| 0.95 | Un micro Zelda | le A héros dans quatre salles (2 × 2, `sx`, `sy`), des murs (`mur()`, `murDebout()`), deux portes P qui téléportent, le monde qui fait le tour ; + 0.95.1 l’écran glisse dans le sens du A, dans les quatre sens, à chaque passage (anciennement 0.94.2 et 0.94.3) |

Les leçons 0.91.4 à 0.93.9 (2026-09-27) : chacune reprend le code de la précédente,
avec **une** nouveauté marquée « NOUVEAU » ; les anciennes portent « (le 0.x) ».
Quand une demande contenait plusieurs choses (la couleur ET la vitesse au 0.92, le
Bomberman entier au 0.93), elle a été coupée en plusieurs leçons. Les contrôles des
bombes font jouer un petit robot (poser en (9, 7), s’abriter en (11, 8)) ; celui du
0.93.9 part après 69 images, un départ qui le mène à la victoire — si le code du jeu
change, ce nombre est à rechercher.

La série du déplacement (0.18 à 0.64) est **progressive** : chaque leçon reprend
le code de la précédente et n’ajoute **qu’une chose** — une ligne, ou un réglage
changé. Beaucoup de leçons, mais jamais deux nouveautés à la fois. Pour carre :
un seul carré par leçon (taille 1 à 8, sens -1, vitesses 500 / 100 / 50, 2 et
3 tours), tous autour de (10, 8) ; les leçons à plusieurs carrés viennent après.

Chaque élément nouveau est **expliqué en détail**, dans les commentaires du code
et dans le texte de la leçon — d’autant plus que le code se complique.

## 3. Les chapitres 1 et 2, réorganisés

Le chapitre 1 va **par paires** : une leçon affiche BONJOUR en (5, 6), la
suivante l’efface. D’une paire à l’autre, une seule chose change.

| N° | Afficher | N° | Effacer |
|---|---|---|---|
| 1 | en clair | 1.1 / 1.2 | avec des espaces / avec `effacer()` |
| 1.3 | sous un nom (`const char MOT[]`) | 1.4 | par ce nom |
| 1.5 | à une place rangée dans `x` et `y` | 1.6 | à la même place |
| 1.7 | dans un `Mot` | 1.8 | par le `Mot` |
| 1.9 | un `Mot` fait de variables | 1.10 | le même |
| | | 1.11 | les variables dans `variables.h` |

Le chapitre 2 fait les mêmes gestes **avec les boutons** : 2 (A efface), 2.1
(A et B changent le message), 2.2 (A efface, B remet), 2.3 (les messages dans
`variables.h`). La leçon 3 est devenue **« Un carré de 8 × 8 »**, dessiné pixel
par pixel avec `Tuile`.

## 4. Ce que le langage a gagné

Tout est **natif** : on s’en sert sans rien déclarer, dans n’importe quel
programme.

| Ajout | Exemple | Ce qu’il fait |
|---|---|---|
| `ALPHABET` | `poser(0, 0, ALPHABET[0])` | les 26 lettres de la police ; `ALPHABET[i]` vaut `1 + i`, rien n’est recopié ; `sizeof(ALPHABET)` vaut 26 ; nom réservé |
| `Mot` | `Mot SALUT = { 5, 6, "BONJOUR" };` | la place et le texte sous un seul nom : `texte(SALUT)`, `effacer(SALUT)` |
| `textS` | `textS(18, 0, "BONJOUR")` | `texte()` qui passe à la ligne tout seul (axes X et Y) |
| `poserS` | `poserS(i, 0, ALPHABET[i])` | `poser()` qui passe à la ligne tout seul |
| `attendre` | `attendre(1)` | arrête **tout** le programme ce nombre de secondes |
| `ms`, `secondes` | `if (images == ms(250))` | une durée traduite en images par le compilateur : gratuit |
| `deplace_x`, `deplace_y` | `x = deplace_x(x, 0, ALPHABET[0], 5)` | fait bouger une case de `pas` cases (X) ou lignes (Y), +5 ou -5, et rend la position d’arrivée ; deux fonctions car une fonction ne rend qu’une valeur (`deplacer` a été renommée `deplace_x`). Seul sur sa ligne, avec une variable, `deplace_x(x, …);` est réécrit par le compilateur en `x = deplace_x(x, …);` : même cartouche, octet pour octet ; une fonction `deplace_x` écrite par l’élève suit la règle ordinaire du C |
| `deplace`, `va_a`, `un_pas` | `deplace(x, y, ALPHABET[0], 5, 5);` | les deux axes à la fois ; rendent la colonne (`return`) et déposent la ligne dans `deplace_ligne_rendue` ; seules sur leur ligne, le compilateur les réécrit en `{ x = …; y = deplace_ligne_rendue; }`. `un_pas` ne bloque pas |
| `carre`, `Carre` | `carre(10, 8, ALPHABET[0], 2, 1, 250, 3)` ; `Carre ronde = { … }; carre(ronde);` | un carré parfait autour de (x, y), de 2 × taille + 1 cases de côté ; sens 1 / -1 ; vitesse en ms écrite en clair (traduite comme `ms()`) ; revient au centre ; près du bord, le centre est poussé vers l’intérieur (taille 8 au plus). `Carre` est déplié à la compilation, comme `Mot` : rien en mémoire |
| `losange`, `rectangle`, `spirale`, `aller_retour` | `losange(10, 8, ALPHABET[0], 2, 1, 250, 1)` | les autres formes, vitesse en ms écrite en clair (traduite comme `ms()`), retour à la place de départ, centre poussé vers l’intérieur près du bord ; `losange` accepte un `Carre` |
| `vitesse` | `vitesse(100);` | devient `deplace_images = ms(100);` : le pas de deplace_x, deplace_y, deplace et va_a (15 images au départ). |
| `deplace_croix`, `glisse_croix` | `deplace_croix(x, y, ALPHABET[0]);` | la croix en une ligne, dans la boucle, AVEC SA VITESSE (obligatoire) : case par case (vitesse en ms écrites en clair, traduite comme `ms()`, `croix_attente` tenue par la console, efface seulement si la lettre a bougé) ou au pixel près avec un lutin (vitesse en pixels par image, variable permise) ; ne bloquent pas ; seules sur leur ligne, rangent la place dans x et y |

Aucune fonction existante n’a changé : `texte()` refuse toujours la colonne 20,
`image()` et le comptage d’images restent la façon de faire plusieurs rythmes.
Chaque faute a son message : `ALPHABET[26]`, `ALPHABET[0] = 3`, `ms(5000)`,
`ms(5)`, `attendre(300)`, `Mot m = { 5, "X" }`…

Les routines de `textS` (position calculée) et d’`attendre` ne sont ajoutées à
la cartouche **que si** le programme s’en sert.

## 5. Une leçon peut avoir plusieurs fichiers

Une leçon porte `fichiers: { 'variables.h': '…' }`, que le programme inclut par
`#include "variables.h"`. Le tutoriel montre des **onglets** au-dessus de
l’éditeur, l’atelier les ouvre dans ses onglets de fichiers, le livret et
`TUTORIELS.md` les impriment, et une faute y est signalée « variables.h,
ligne 2 ». (`assemblerAvec` dans `compilateur/inclusion.js`.)

## 6. Le dessin et le renommage

- **Tout carré écrit dans le code se montre en dessin** : le tutoriel ouvre
  l’atelier de dessin dès que le code d’une leçon contient une `Tuile` ou un
  `Perso`.
- **✎ sur chaque tuile** : renommer partout où le nom est écrit (déclaration,
  `poser`, marques de palette et d’étiquettes, `NOM_PALETTES`), sans toucher aux
  textes entre guillemets. **Un nom déjà pris est refusé**, avec la raison — la
  boîte « Quel nom pour… » a un mode `prevenir` qui ne renumérote plus en
  silence.
- **F2 dans l’éditeur de code** : un nom déjà utilisé est signalé, et la boîte
  reste ouverte.

## 7. Rafraîchir ramène au même endroit

Avant, un rafraîchissement renvoyait ailleurs : le mode Leçons rouvrait la
leçon 1 (le réglage « La leçon d’ouverture »), le mode Cours la première, et
le code de la leçon écrasait celui qu’on avait modifié. Maintenant, chaque page
retient **la dernière chose ouverte** :

| Page | Ce qui est retenu | Clé du navigateur |
|---|---|---|
| `index.html` | la leçon de chaque série (leçons, cours), par son **titre** | `gameboy3-lecon` |
| `index.html` | le code modifié de la leçon, gardé au lieu d’être remplacé | `gameboy3-programme` (déjà là) |
| `index.html` | l’onglet de l’atelier (tuiles, airs, couleurs, carte, modèles) | `gameboy3-atelier` |
| `index.html` | la hauteur de la fenêtre et des deux volets | `gameboy3-defilement` |
| `tuto.html`, `cours.html` | la leçon (titre et place) et la hauteur de lecture | `gameboy3-tuto`, `gameboy3-cours` |

La leçon est retrouvée par son **titre**, pas par sa place : quand une leçon est
insérée avant elle (le 0.19 `deplace_y`), l’ancienne adresse `#lecon-20`
pointerait une autre leçon. Une adresse différente de celle que la page avait
écrite garde le dernier mot. Le réglage « La leçon d’ouverture » s’appelle
désormais `leconOuverture` : 0 (« la dernière lue ») par défaut, et 1, 2, 3…
impose une leçon, avec son code d’origine. « ⟲ Remettre le code » revient au
code de la leçon.

### Les leçons intermédiaires : 0.N.1 et 0.N.2

Chaque leçon de 0.1 à 0.74 a deux intermédiaires, juste après elle (148 en tout) :

- **0.N.1 — de base, ailleurs** : la même chose, à une deuxième place (souvent
  avec le B, `ALPHABET[1]`). Le texte dit pourquoi cette place : où la forme tient.
- **0.N.2 — doublé, deux positions** : les deux ensemble dans le même programme.
  Avec les fonctions qui bloquent (`carre`, `deplace_x`…), l’une après l’autre ;
  dans une boucle (`un_pas`, la croix, les lutins), en même temps.

Elles portent `suite: true` ; `numeros()` leur donne le numéro du parent suivi de
« .1 », « .2 ». Les leçons principales **gardent leur numéro** : aucun renvoi n’a
bougé. Pour les leçons qui avaient déjà plusieurs lettres (0.53, 0.54, 0.62 à
0.64), le .1 ajoute une lettre à une place libre, et le .2 réunit tout.

`deplace_croix` a changé pour le doublé : son attente ne s’écoule plus qu’**une
fois par image** (`croix_image`, `croix_pret`, avec `images()`). Deux appels dans la
même image — deux lettres — font donc chacun leur pas ; avant, la première
relançait l’attente et la seconde ne bougeait jamais. Et l’attente compte les images
**réellement écoulées** (`images()` − la dernière fois) : une boucle chargée qui dure
deux images par tour garde la même vitesse de lettre.

### Les versions « en simple » et les nouvelles fonctions

- **0.65.3 à 0.70.3** : les leçons longues (la lettre qui avance, la croix, variables.h,
  la position en direct, lire, le lutin), réécrites avec `defile`, `deplace_croix`,
  `glisse_croix`.
- **`tourne_carre`**, **`defile`** : sans bloquer, à appeler à chaque image ; la console
  retient l’état de chaque lettre par son numéro (0 à 3), dans des tableaux
  `tour_x[4]`, `file_x[4]`… Un côté négatif fait partir `tourne_carre` vers la gauche.
- **`chaque(ms)`** : réécrit en `chaque_minuteur(k, ms(…))`, k étant son rang dans le
  programme (huit au plus) ; il compte les images réellement passées.

## 8. Ce qui reste à faire

- ~~**`chaque(ms)`**~~ **fait** : le 0.77.
- ~~**`nombre()` juste après `image()` ralentit la boucle de moitié**~~ **réglé** :
  `AttendreVBlank` écrit tout de suite si le VBlank est déjà là (lignes 144 à 151),
  et n’attend le suivant que sur les lignes 152 et 153. Trois leçons du cours de
  programmation (la montre, `for`, le VBlank) disaient l’ancien comportement :
  leur texte a suivi.
- ~~**`verifier-page.mjs` attendait la leçon « 1. »**~~ **réglé** : ses contrôles
  cherchent maintenant les deux premières leçons dans la liste, au lieu de les
  écrire en dur. `verifier-tutoriels.mjs` compte les numéros à trois niveaux
  (0.35.1).
- **Les autres chapitres en millisecondes** (0.12, 0.13, et des leçons de 0.17 à
  0.85 parlent encore d’images).
- **Le ✎ pour les airs et les cartes**, comme pour les tuiles.
- **Le contrôle « la console tourne »** de `verifier-page.mjs` peut échouer :
  il relève le compteur d’images par seconde au bout de 1,2 s.
- **`#include` refuse un commentaire sur sa ligne** (« # n’est compris que dans
  #include, seul sur sa ligne ») : on pourrait l’accepter.
- **`ALPHABET_GRAS`** (fait) : `lettresGrasses()` dans `police.js` épaissit chaque lettre d’un pixel vers la droite ; M, N et W sont redessinés à la main (8 colonnes) pour garder leurs creux. Le compilateur ajoute 26 `Tuile GRAS_A…Z` et le tableau `ALPHABET_GRAS` seulement si le programme le nomme. `ALPHABET` n’a pas changé.
- **`texteGrand`** (fait) : `pixelsDe()` dans `police.js` ; `preparerLesTextesGrands` calcule, pour chaque appel, les tuiles du texte agrandi (le pixel (px, py) vient de (px / n, py / n)), n’en garde qu’un exemplaire (une tuile vide = la tuile 0), et remplace la ligne par un bloc : la place dans deux variables, puis une fonction qui pose les tuiles depuis un tableau gravé. Taille de 1 à 20 (7 pixels × 20 = 140, la lettre tient dans les 144 de l’écran), texte et taille en clair ; une table par rangée de cases, pour dépasser les 255 cases d’un octet.
- **La couleur des lettres** (fait) : `couleurTexte(r, v, b)` devient `couleurFond(0, 3, r, v, b)` (les lettres de la police sont en teinte 3, les cases en palette 0) ; `texteCouleur(x, y, "MOT", p)` devient `texte(…)` suivi d’un `teindre` par case. Réécrits avant le jeu, dans `preparerLesFormes`.
- **`texteGrandS`** (fait) : découpe le texte en lignes avant le jeu (une ligne de 20 cases tient 20 ÷ taille lettres ; la suite repart en colonne 0), chaque ligne devenant un `texteGrand` ; refus si le bas dépasse la case 18.
- **« ⟲ Reset »** (réglé) : en mode leçons, il remet le code d’ORIGINE de la leçon et la relance (avant, il relançait la cartouche du code modifié). **Minuscules et accents** : `normaliser()` dans `police.js` (é, è → E ; a → A) sert à `texte`, `textS`, `Mot` et `texteGrand`.
- **Le plein écran** (fait) : le bouton « ⛶ Plein écran » existe maintenant aussi sur `tuto.html` et `cours.html` (même agrandissement entier que la page principale) ; la touche **F** entre et sort sur les trois pages, sauf quand on écrit dans un champ, et sur la page principale sauf si F est la touche d’un bouton de la console dans les réglages. Un `favicon.svg` (un A en pixels, vert Game Boy) sur les quatre pages.
- **La suite du jeu**, proposée : un écran titre (`enum`), des niveaux, un temps
  limité, tirer, le record, des portes et des clés, le jeu complet en fichiers.
- **Le snake (0.91.4 à 0.92.2), ses défauts connus**, pour de prochaines leçons :
  le A peut faire demi-tour sur sa queue et la traverser sans perdre ; le P peut
  réapparaître sur la queue (on ne le voit plus) ou sur la case du A (compté deux
  fois).
- **Le jeu de bombes (0.93 à 0.94.1), la suite proposée** : ~~des briques qu’une
  bombe casse~~ **fait** (0.94, 0.94.1) ; un bonus F caché sous une brique (des
  flammes plus longues), plusieurs bombes à la fois, des W plus rapides à chaque
  niveau. À savoir : au premier allumage, `hasard()` donne toujours le même
  terrain (l’émulateur démarre toujours pareil) ; il change
  quand on rejoue. Le contrôle du 0.94.1 compte sur la brique en (6, 1) de ce
  premier terrain.
- **Le bilan des leçons 0.91.4 à 0.94.1** : seul `verifier-tuto` a tourné (406
  leçons, 1118 contrôles, tout vert). Restent à faire ensemble : les autres
  vérifications, `TUTORIELS.md`, les livrets, les captures, et l’envoi sur GitHub.

### Le bilan de la séance

Toutes les vérifications ont tourné (`verifier-tuto`, `verifier-cours`,
`verifier-page`, `verifier-tuto-page` et les autres) ; `TUTORIELS.md`, les
livrets et les captures sont régénérés ; tout est envoyé sur GitHub.
`verifier-portage.mjs` échoue seul : il cherche `../gameboy2/exemples/ecrans.gb`,
un dossier voisin qui n’est pas sur ce disque.

## 9. Le chapitre 0 rangé en dix parties

> 29 septembre 2026. Le chapitre 0 comptait 298 leçons sous un seul titre,
> « Niveau 0 — Avant tout », du programme vide jusqu’au Zelda. On ne s’y
> retrouvait plus.

Il est coupé en **dix parties**. **Aucun numéro de leçon ne change**, sauf celui
du Zelda :

| Partie | Leçons | Ce qu’on y fait |
|---|---|---|
| A. Écrire des lettres | 0.0 – 0.11.2 | une lettre, ALPHABET, les boucles, `poserS`, `textS` |
| B. Le temps | 0.12 – 0.17.2 | les secondes, `attendre`, deux rythmes, les millisecondes |
| C. Déplacer une lettre | 0.18 – 0.33.2 | `deplace_x`, `deplace_y`, `deplace`, `va_a`, `un_pas`, sa fonction |
| D. Des formes | 0.34 – 0.64.2 | `carre` et ses réglages, `Carre`, losange, rectangle, spirale, aller-retour |
| E. La croix : le joueur | 0.65 – 0.80.2 | la manette, `lire`, le lutin, `deplace_croix`, `glisse_croix`, déclencheurs, `chaque`, `struct` |
| F. Un premier jeu | 0.81 – 0.85 | pièces, murs, son, vies, ennemis |
| G. Les lettres et l’écran titre | 0.86 – 0.90.7 | gras, `texteGrand`, couleur, l’écran titre |
| H. Du titre au snake | 0.91 – 0.92.2 | le titre puis le jeu, le snake, son menu |
| I. Le jeu de bombes | 0.93 – 0.94.1 | le jeu façon Bomberman, les briques |
| J. Un micro Zelda | 0.95 – 0.95.1 | les salles, les portes, l’écran qui glisse |

- **Où c’est écrit.** `partie: 'Le temps'` sur la leçon qui ouvre la partie,
  rien sur les autres. `partieDe(liste, index)` (dans `tuto/lecons.js`) remonte
  jusqu’à elle et compte la lettre : insérer une leçon ne demande rien d’autre.
- **Où ça se voit.** Le sommaire de `tuto.html` (un titre sous celui du niveau),
  le menu des leçons de l’atelier (un groupe par partie), les repères de la
  leçon (« Partie D — Des formes »), `TUTORIELS.md` (un tableau des parties, puis
  un titre par partie) et les livrets.
- **Le Zelda** avait pris les numéros 0.94.2 et 0.94.3, comme s’il prolongeait
  les briques : il devient **0.95** et **0.95.1**, et ses quinze renvois au
  « 0.94.2 » sont devenus « 0.95 ».
- **Des titres remis à leur place** : les 0.90.1 à 0.90.7 s’appellent
  « L’écran titre — … » (au lieu de « Un titre agrandi, en couleur — … ») ; les
  0.91.5 à 0.91.9, où naît le serpent, s’appellent « Le snake — … ». Le 0.91.4 (la
  pièce qui revient au hasard) reste « Le titre, puis le jeu ».
- **Un défaut réglé au passage** : le sommaire du livret complet ne montrait pas
  le titre « Niveau 0 » (il partait de `niveau = 0`).
- **Vérifié** : 22 vérificateurs sont verts (408 leçons, 1128 contrôles) ;
  `verifier-portage` n’a pas tourné (il cherche `../gameboy2`, absent) ;
  `verifier-tuto-page` contrôle en plus que le sommaire montre les dix parties.
  `TUTORIELS.md` est régénéré. **Restent à faire au bilan** : les livrets (ils
  s’arrêtent au 0.85) et l’envoi sur GitHub.
- **Tout le code des parties est commenté ligne par ligne** (demandé ensuite :
  « le plus de commentaires possible ») : `partieDe` avec des exemples chiffrés
  (du 0.13.2 on remonte au 0.12 ; une partie avant « Le temps », donc la lettre
  B ; 65 + 1 = « B »), la clé des groupes du menu de l’atelier (« 0 B », « 3 »),
  le titre de partie du sommaire et sa feuille de style, le tableau des parties
  de `TUTORIELS.md` (du 0.12 jusqu’au 0.17.2), les livrets, et le calcul
  11 + 10 − 1 = 20 groupes du contrôle de `verifier-page`. Le code C++ des
  leçons n’a pas été touché par cette passe.

## 10. L’atelier disponible, quelles que soient les conditions

> 29 septembre 2026. Un grand contrôle : que se passe-t-il quand quelque chose
> MANQUE ? Un module effacé, un navigateur sans son, un stockage bloqué, PHP
> absent, Node trop vieux, un port pris, la page ouverte par un double-clic…
> L’atelier doit marcher quand même, ou DIRE ce qui ne va pas. Jamais une
> page figée et muette.

**Ce que le contrôle a trouvé, et ce qui est corrigé :**

| Situation | Avant | Maintenant |
|---|---|---|
| Un fichier .js de l’atelier manque (39 modules essayés, 78 cas) | la page restait figée, sans un mot | un bandeau rouge nomme le fichier et celui qui le demande (`garde.js`) |
| Une faute de frappe dans un module | page figée | le bandeau donne le fichier et la ligne |
| `index.html` ouvert par un double-clic (`file://`) | page figée | le bandeau dit d’utiliser `lancer.bat` |
| Navigateur sans son (pas de Web Audio) | **les trois pages** ne démarraient pas | la console tourne, muette |
| Stockage interdit (navigation privée stricte) | l’atelier ne démarrait pas | il démarre (`lireLeStockage`) |
| `lancer.bat` lancé deux fois | « Une erreur est survenue » (Node plantait sur `process.exit` après `fetch`) | « L’atelier tourne déjà », proprement |
| `lancer.bat` lancé deux fois, **avec PHP** (XAMPP) | « Un ANCIEN atelier tourne encore » : le serveur PHP ne connaît pas `__atelier` et répond par la page d’accueil | reconnu comme un atelier à jour (PHP lit le disque à chaque demande) : la page s’ouvre |
| `node …\demarrer.mjs` lancé depuis un autre dossier | servait ce mauvais dossier | sert toujours le dossier du projet |
| `projets-serveur.mjs` absent | le lanceur plantait avant de dire un mot | l’atelier démarre, et dit que les projets ne s’enregistreront pas |
| Un fichier de l’atelier manque, au lancement | rien | la fenêtre noire le nomme tout de suite |
| Node 16 installé | erreur incompréhensible | `lancer.bat` dit « trop ancien » et propose la mise à jour |
| `demarrer.mjs` absent | erreur de Node | `lancer.bat` dit que le dossier est incomplet |
| Les pages `cours/*.html` | pas d’icône : un `favicon.ico` introuvable (404) | l’icône du projet |
| Le navigateur ne s’ouvre pas tout seul | le serveur pouvait planter | il affiche l’adresse à ouvrir |

**Ce qui marchait déjà**, et qui est maintenant contrôlé : sans PHP comme avec
celui de XAMPP ; le port pris par un autre programme ; un dossier au nom
difficile (espaces, accents) ; `projets.php` injoignable ; le dossier `projets/`
absent ; pas de plein écran ; aucune ressource prise sur Internet (tout marche
hors ligne) ; aucune dépendance npm ; tous les liens ont la bonne casse (un
serveur Linux la respecte, Windows non).

**`garde.js`** : un petit script chargé en premier par `index.html`, `tuto.html`
et `cours.html`, sans « module », pour tourner même quand tout le reste échoue.
Si la page n’a pas appelé `window.atelierPret()` (dernière ligne de son
programme) peu après une erreur, il suit lui-même les `import`, trouve le
fichier qui manque, et l’affiche.

**`verification/verifier-disponible.mjs`** (`npm run disponible`) refait tout
cela à chaque fois, dans une copie du projet (le vrai n’est jamais touché) :
le lanceur lancé pour de vrai, `lancer.bat` avec un Node qui ment sur sa
version, les 47 pages, les navigateurs privés de quelque chose, chaque module
retiré tour à tour. Il demande Node 22 (pour parler au navigateur) ; l’atelier,
lui, Node 18. `demarrer.mjs` accepte pour cela `--port`, `--sans-navigateur`
et `--sans-php` ; un double-clic n’en donne aucun.

**Vérifié** : `verifier-disponible` tout vert (34 contrôles, dont 78 essais de modules retirés), et les 22 autres
vérificateurs verts.

**Ce qui reste, connu** : `verifier-portage.mjs` et deux outils de portage
(`outils/porter.mjs`, `outils/traduction.js`) visent le projet voisin
`../gameboy2`, absent de ce disque — ce ne sont pas des morceaux de l’atelier.
Et, déjà noté : la page fait une image de console par rafraîchissement de
l’écran, si bien qu’un écran à 120 ou 144 Hz fait tourner les jeux plus vite.

## 11. Chercher, partout

> 29 septembre 2026. 408 leçons, 42 cours, 27 exemples, des projets, des
> modèles, 62 réglages : il fallait faire défiler pour trouver quoi que ce soit.

Chaque liste a maintenant son champ de recherche, et **tous se comportent
pareil**, parce qu’ils passent par un seul module, `recherche.js` :

- **sans accents ni majuscules** : « lecon » trouve « Leçon » ;
- **plusieurs mots** : « snake menu » ne garde que ce qui contient les deux ;
- **un numéro** : « 0.93 » trouve le 0.93 et ses intermédiaires, pas le 0.930 ;
- **dans le code** : « texteGrand » trouve les leçons qui APPELLENT cette
  fonction (les commentaires ne comptent pas : « mur » y est partout) ;
- **au clavier** : `/` amène dans la recherche, Entrée ouvre le premier
  résultat, Échap efface ; un compteur, et « rien ne contient … » sinon.

| Où | Ce qu’on y cherche |
|---|---|
| `tuto.html`, `cours.html` : le sommaire | numéro, titre, idée, niveau, partie, fonctions utilisées ; les titres de niveau et de partie restent au-dessus de leurs résultats |
| l’atelier, mode Leçons et Cours | pareil, dans une recherche à côté du menu des leçons |
| l’atelier : les exemples, 🖼 les modèles, 📂 les projets, 🧩 les modèles de jeux | leurs noms et leurs descriptions |
| l’atelier : ⚙ les réglages | déjà là ; désormais sans accents et à plusieurs mots, comme les autres |
| **🔎 Tout chercher** (`Ctrl+K`, ou le bouton 🔎) | tout à la fois : leçons, cours, exemples, projets, fonctions, réglages, modèles. Une fonction emmène aux leçons qui l’utilisent |
| `sommaire.html`, `cours/index.html` | leurs cartes et leurs cours (`recherche-page.js`, un script ordinaire : il marche même ouvert par un double-clic) |

**Deux défauts réglés au passage :**
- dans le sommaire de `tuto.html` et de `cours.html`, chaque ligne héritait des
  marges de la grande zone de la leçon (même classe `lecon`) : 95 px de haut au
  lieu de 33, et de grands trous entre les leçons ;
- la pastille numérotée d’une leçon était comptée par la feuille de style :
  une recherche l’aurait renumérotée 1, 2, 3… Le numéro est maintenant écrit
  sur chaque ligne (`data-rang`).

**Vérifié** : `verification/verifier-recherche.mjs` (`npm run recherche`)
tape dans chaque champ, dans un vrai navigateur, et contrôle les résultats —
calculés depuis les leçons, jamais écrits à la main ; 34 contrôles verts. Les
autres vérificateurs restent verts.

## Les fichiers ajoutés ou mis à jour

| Fichier | Rôle |
|---|---|
| `compilateur/emetteur.js` | `Mot`, `ALPHABET`, `textS`, `poserS`, `attendre`, `ms`, `secondes` ; le message des noms réservés |
| `compilateur/analyseur.js` | le type `Mot` |
| `compilateur/inclusion.js` | `assemblerAvec` : un programme et ses fichiers voisins donnés d’avance |
| `tuto/lecons.js` | le chapitre 0, les chapitres 1 et 2 réorganisés, `numeros`, `principales` |
| `tuto/tutoriels.js` | la leçon 3, « Un carré de 8 × 8 » |
| `tuto/console.mjs`, `tuto/etapes.mjs` | les fichiers voisins d’une leçon |
| `tuto.html` | les numéros 1.1, les onglets de fichiers, le dessin automatique, le ✎ |
| `index.html` | les numéros, les fichiers d’une leçon, le mode `prevenir` |
| `editeur-tuiles.js` | ✎ renommer, `renommerPartout`, `nomsDuProgramme` |
| `editeur-code.js` | F2 prévient d’un nom déjà pris ; `Mot` en couleur |
| `aide-fonctions.js` | les nouvelles fonctions dans l’aide |
| `outils/livret.mjs`, `outils/tutoriels.mjs`, `outils/lancer-tutoriels.mjs` | les numéros et les fichiers voisins |
| `verification/verifier-*.mjs` | adaptés à la nouvelle numérotation |
| `LISEZMOI.md` | les nouvelles fonctions ; `documents/TUTORIELS.md` régénéré |

Ajoutés ou mis à jour le 29 septembre 2026 (§9 et §10) :

| Fichier | Rôle |
|---|---|
| `tuto/lecons.js` | `partie:` sur dix leçons, `partieDe()` ; le Zelda en 0.95 ; titres « L’écran titre — … » et « Le snake — … » |
| `tuto.html` | les parties dans le sommaire et les repères ; le son facultatif ; `garde.js` |
| `index.html` | un groupe par partie dans le menu des leçons ; le son facultatif ; `lireLeStockage` ; `garde.js` |
| `cours.html` | le son facultatif ; `garde.js` |
| `garde.js` | **nouveau** : le bandeau qui dit pourquoi une page ne démarre pas |
| `demarrer.mjs` | le dossier du script ; `projets-serveur.mjs` facultatif ; la liste des fichiers manquants ; `demander()` au lieu de `fetch` ; `--port`, `--sans-navigateur`, `--sans-php` |
| `lancer.bat` | Node trop ancien ; `demarrer.mjs` absent |
| `outils/tutoriels.mjs`, `outils/livret.mjs` | les parties ; le titre « Niveau 0 » du livret complet |
| `outils/cours.mjs`, `cours/*.html` | l’icône du projet |
| `verification/verifier-disponible.mjs` | **nouveau** : le grand contrôle (`npm run disponible`) |
| `verification/verifier-page.mjs`, `verification/verifier-tuto-page.mjs` | les parties comptées à part des niveaux |
| `package.json` | le script `disponible` |
| `documents/TUTORIELS.md` | régénéré, avec les parties |
| `recherche.js` | **nouveau** (§11) : la recherche commune — comparer, le champ, filtrer un sommaire, un menu, une grille |
| `recherche-globale.js` | **nouveau** (§11) : la fenêtre « Tout chercher » (Ctrl+K) |
| `recherche-page.js` | **nouveau** (§11) : la recherche de `sommaire.html` et `cours/index.html` |
| `projets.js` | `apresLaListe` : la page réapplique sa recherche quand la grille est refaite |
| `verification/verifier-recherche.mjs` | **nouveau** (§11) : chaque recherche essayée dans un navigateur (`npm run recherche`) |

---

# La passe des #include, et du parcours unique

> 30 septembre – 2 octobre 2026. Deux changements de fond. **Aucune fonction
> de la console n'est plus là d'office** : chacune s'inclut par son nom,
> `#include <texte>`, comme en C. Et **les leçons, les tutoriels et le cours ne
> font plus qu'une seule suite**, le parcours, où chaque fonction est
> présentée seule, juste avant de servir.

## 1. `#include <nom>` : une fonction de la console s'inclut

Une fonction de la console prend de la place dans la cartouche (son code, ses
routines, ses tables). La règle est donc celle du C : ce qu'on emploie, on
l'inclut.

```cpp
#include <texte>      // texte() existe
#include <ALPHABET>   // ALPHABET existe
#include <Tuile>      // on peut dessiner une Tuile
```

- **71 noms** possibles, rangés dans `BIBLIOTHEQUES` (`compilateur/inclusion.js`),
  chacun avec une phrase qui dit ce qu'il apporte. Ce sont les fonctions, les
  types `Tuile`, `Perso`, `Mot`, `Carre`, `Air`, les deux alphabets, et quatre
  calculs que le processeur ne sait pas faire seul : `<multiplier>`,
  `<diviser>`, `<reste>`, `<decaler>`.
- **Sans la ligne, le compilateur refuse** et dit laquelle écrire, avec sa
  ligne (« il faut « #include <texte> » pour employer texte() »). Un nom mal
  écrit (`<Texte>`) est corrigé dans le message.
- **Une ligne de trop ne coûte rien** : seul ce qui est employé est gravé.
- **Restent natives**, parce qu'elles ne coûtent rien : `image()`, `images()`,
  `retard()`, `ms()`, `secondes()`. Un calcul écrit par le compilateur
  lui-même (par 1, 2, 4, 8… en clair, ou `x % 20` dans `textS`) ne demande rien.
- La ligne accepte un commentaire après elle (`#include <poser>   // …`).

**Écrire les lignes à sa place.** `compilateur/inclusions-auto.js` (nouveau)
compile le programme en lui demandant de **relever** au lieu de refuser, et
écrit les lignes qui manquent en tête, dans l'ordre d'emploi, chacune
commentée. Il sert :
- au bouton **« ✚ Écrire les #include qui manquent »** de l'atelier et de
  `tuto.html`, qui apparaît sous l'erreur ;
- aux éditeurs (tuiles, couleurs, airs, carte, scènes, modèles de jeux), qui
  écrivent eux-mêmes les lignes dont leur code a besoin ;
- à `retour-cpp.js` (la traduction d'une cartouche en C++).

Les 31 exemples (`exemples/*.cpp`), `projets/mon_mario` et les modèles de jeux
ont reçu leurs lignes.

## 2. Le parcours : une seule suite

`tuto/parcours.js` (nouveau) range les leçons (`tuto/lecons.js`, par niveau)
et le cours (`tuto/programmation.js`, par notion) en **25 chapitres**, de
« Avant tout » à « Aller au bout ». Rien n'est retiré : chaque étape garde son
texte, son programme et ses contrôles ; seuls changent sa place et son numéro.

- Les deux séries sont **entremêlées par sujet**, chacune dans son ordre :
  aucune notion n'arrive avant ce dont elle a besoin (`CHAPITRES_DU_PARCOURS`).
- **Un `#include` nouveau à la fois.** Chaque fonction a son tuto (sa ligne
  `#include`, ses arguments, ce qu'elle coûte), placé **juste avant** la
  première étape qui l'emploie. Les tutos qu'aucune étape n'emploie restent
  ensemble, dans la partie L du chapitre 0, « Les fonctions de la console, une
  par une ». `verifier-tuto.mjs` contrôle qu'aucune étape n'en apporte deux.
- Une étape d'ouverture, **« Pourquoi écrire « #include » ? »**, explique la
  règle une fois, en détail.
- **Une entrée par chapitre** : d'où l'on vient, ce qui vient, les fonctions
  qui arrivent — calculée sur le parcours lui-même.
- Dans chaque étape, l'encadré **« Les fonctions de cette leçon »** mène au
  tuto de chacune, et un tuto dit où l'on retrouve sa fonction
  (`tuto/fonctions.js`, nouveau : tout est lu dans le code, rien n'est écrit
  à la main).

En chiffres : **587 étapes** (dont 143 principales), **383** au chapitre 0,
**71** tutos de fonctions, **61** cours.

Dans l'atelier, le mode APPRENDRE montre le parcours ; le bouton « Cours » et
`cours.html` restent pour les anciens liens et y mènent.

## 3. Le cours : les chapitres 9 à 14

Six chapitres de plus au cours : le mouvement au pixel près, les collisions,
le hasard et le temps, les états du jeu, le son, le défilement. Les pages
`cours/*.html` et `documents/COURS.md` sont régénérées.

## 4. Les livrets, les images et les documents régénérés

La numérotation a changé : les anciens livrets (`livrets/lecon-09…` à
`lecon-82…`, et ceux du chapitre 0 dont le numéro a bougé) sont **supprimés** et
remplacés par les nouveaux (634 fichiers). Les captures `tutoriels/*.png`
sont refaites, avec une image par nouvelle étape. `documents/TUTORIELS.md`,
`documents/COURS.md`, `documents/livret.html` et `documents/tutoriel.pdf` sont
régénérés. Le projet d'essai `projets/mon_jeu/` est supprimé.

## 5. Ce qui a été vérifié

- `verification/verifier-tuto.mjs` : 587 leçons, 1629 contrôles, et « un
  #include nouveau à la fois, sur tout le parcours » — tout est vert.
- `verification/verifier-tuto-page.mjs` : les 587 étapes s'ouvrent et
  compilent dans `tuto.html`, dans un vrai navigateur — tout est vert.
- L'atelier (`index.html`, mode APPRENDRE), piloté étape par étape dans un
  navigateur neuf en relevant toute erreur JavaScript : aucune.
- `verifier-inclusion.mjs`, `verifier-refus.mjs`, `verifier-retour.mjs` et les
  autres vérificateurs ont été adaptés aux `#include`.

## 6. Ce qui reste

- **Des plantages signalés** (la leçon 0.6, entre autres) **ne se reproduisent
  pas** dans un navigateur neuf. Piste : un programme gardé par le navigateur
  (`gameboy3-programme`) écrit avant les `#include`, ou d'anciens fichiers en
  cache (Ctrl + F5). À reprendre avec le message d'erreur exact.
- `documents/PARCOURS.md` (les chemins vers Tetris et Mario) cite encore les
  numéros des 77 leçons d'avant : à refaire sur le parcours.

## Les fichiers ajoutés ou mis à jour

| Fichier | Rôle |
|---|---|
| `compilateur/inclusion.js` | `BIBLIOTHEQUES` : les 71 noms et ce qu'ils apportent ; un commentaire permis après la ligne |
| `compilateur/analyseur.js` | la ligne `#include <nom>` devient un nœud `inclusion` ; le nom mal écrit est corrigé dans le message |
| `compilateur/emetteur.js` | le refus quand une ligne manque ; `releverInclusions` ; seules les routines employées sont gravées |
| `compilateur/inclusions-auto.js` | **nouveau** : écrire les `#include` qui manquent |
| `tuto/parcours.js` | **nouveau** : le parcours en 25 chapitres, un `#include` à la fois |
| `tuto/fonctions.js` | **nouveau** : les fonctions d'une leçon, et le tuto de chacune |
| `tuto/lecons.js`, `tuto/programmation.js`, `tuto/tutoriels.js` | les `#include` dans chaque programme ; les tutos des fonctions ; les chapitres 9 à 14 du cours |
| `index.html`, `tuto.html`, `cours.html`, `sommaire.html` | le parcours ; « Les fonctions de cette leçon » ; le bouton « ✚ Écrire les #include qui manquent » |
| `retour-cpp.js`, `convertir.js`, `modeles-jeux.js`, `projets-serveur.mjs` | les `#include` dans ce qu'ils écrivent |
| `analyse-rom.js` | le panneau ROM : chaque `#include`, s'il sert et ce qu'il coûte ; l'en-tête que toute cartouche paie |
| `exemples/*.cpp`, `projets/mon_mario/principal.cpp` | leurs lignes `#include` |
| `outils/cours.mjs`, `outils/livret.mjs`, `outils/tutoriels.mjs` | le parcours et ses numéros |
| `verification/verifier-*.mjs` | adaptés aux `#include` et au parcours |
| `LISEZMOI.md` | « Apprendre : un seul parcours » ; « Les fonctions fournies — et leur `#include` » |
| `documents/TUTORIELS.md`, `documents/COURS.md`, `documents/livret.html`, `documents/tutoriel.pdf`, `cours/`, `livrets/`, `tutoriels/` | régénérés |

# Le cours complet en PDF, les leçons en double, et l'onglet « Les sources »

*Le 2026-10-03.*

## 1. Le cours complet, en un PDF

`outils/cours-complet.mjs` (nouveau, `npm run cours-complet`) écrit
`documents/cours-complet.pdf` et `documents/cours-complet.html` : tout le
parcours, **dans l'ordre de `tuto.html`** — couverture, sommaire des 25
chapitres, les 71 `#include` dans leur ordre d'apparition, chaque chapitre et
ses leçons (avec l'encadré « #include » : ce qui est nouveau, ce qui est déjà
vu), puis l'index des `#include`.

L'ancien `tutoriel.pdf` avait une couverture de hauteur fixe : le sommaire de
587 leçons débordait sur les pages suivantes. Ici, aucune hauteur n'est fixée,
et avant d'imprimer, le script vérifie dans la page qu'**aucun bloc n'en
recouvre un autre**.

## 2. Les leçons qui se répétaient

Toutes les leçons compilaient et tous les contrôles étaient verts : les
erreurs étaient des **doublons**.

- **Les 0.5, 0.6 et 0.7** s'appelaient tous « La même ligne, avec… » : on
  croyait lire trois fois la même leçon. Chaque titre dit maintenant ce qu'il
  apporte (et ses deux variantes « de base, ailleurs » et « doublé, deux
  positions » suivent) :
  - 0.5 — « La boucle for : la ligne en trois lignes de code » ;
  - 0.6 — « La boucle while : les trois morceaux du for, séparés » ;
  - 0.7 — « La boucle do … while : au moins un tour ».
- **Quatre tutos de fonction avaient le programme exact de la leçon qui
  suit** (comparés sans les commentaires ni les espaces) :

  | Tuto | Doublait | Montre maintenant |
  |---|---|---|
  | 0.33.3 `carre()` | le 0.34 | un **C** qui tourne autour de (15, 4) |
  | 0.66.3 `deplace_croix()` | le 0.71 | un **B** parti de (3, 4) |
  | 0.70.3 `glisse_croix()` | le 0.70.4 et le 0.73 | un **B** parti du pixel (8, 8) |
  | 0.86.3 `texteGrand()` | le 0.87 | un grand **B** |

  Leurs contrôles suivent la nouvelle lettre et la nouvelle place.
- **Le 0.70.4** (« Plus fluide — en simple ») était, lui aussi, le 0.73 mot
  pour mot. Il montre maintenant un **C** parti du pixel (120, 20).
- **Deux étapes s'appelaient « Une méthode : la fonction qui connaît son
  objet »** (88 et 93). Celle des tutoriels devient « Une méthode : ce qu'elle
  coûte, ce qui reste refusé » ; celle du cours garde son titre (c'est aussi
  celui de `cours/29-…`).

Après correction : **aucun** programme identique entre deux étapes, aucun
titre en double.

## 3. L'onglet « Les sources »

Un sixième onglet dans l'atelier, **« 📚 Les sources »** (`index.html#sources`),
donne le lien de chaque document, ouvert dans un nouvel onglet :

- **les livres** : le cours complet, le livret des leçons, « Passer d'un écran
  à l'autre », la valorisation — chacun en PDF et en page ;
- **les 61 cours**, un fichier chacun (PDF et page), lus dans `cours/index.html` ;
- **les 587 livrets**, un par leçon, rangés par chapitre dans des blocs repliés ;
  leur nom est calculé avec la règle de `outils/livret.mjs` ;
- **les textes** : `LISEZMOI.md`, `PARCOURS.md`, `COURS.md`, `TUTORIELS.md`,
  `CHANGEMENTS.md` et la planche des écrans.

L'onglet ouvert est retenu, comme les autres.

## 4. Régénéré

Les titres ayant changé, les noms des livrets aussi : `livrets/` (1174
fichiers), `documents/livret.html`, `documents/tutoriel.pdf`,
`documents/TUTORIELS.md` et `documents/cours-complet.*` sont régénérés.

## 5. Ce qui a été vérifié

- `npm run verifier` : les 14 suites sont vertes (587 leçons, 1629 contrôles,
  un `#include` nouveau à la fois).
- Les 1313 liens de l'onglet « Les sources » mènent tous à un fichier qui
  existe.
- **Pas encore vu dans un navigateur** : l'affichage de l'onglet lui-même.

## 6. Ce qui reste

- Le **plantage signalé au 0.6** (voir la passe précédente, § 6) n'a toujours
  pas été reproduit : à reprendre avec le message d'erreur exact.
- `documents/PARCOURS.md` cite encore les numéros d'avant.

## Les fichiers ajoutés ou mis à jour

| Fichier | Rôle |
|---|---|
| `outils/cours-complet.mjs` | **nouveau** : le cours complet en un PDF |
| `package.json` | le script `cours-complet` |
| `sources.js` | **nouveau** : l'onglet « Les sources » |
| `index.html` | l'onglet, sa zone, son style, `#sources` |
| `tuto/lecons.js` | les titres des 0.5 à 0.7 ; les tutos `carre`, `deplace_croix`, `glisse_croix`, `texteGrand` ; le 0.70.4 |
| `tuto/tutoriels.js` | le titre de la méthode en double |
| `LISEZMOI.md` | le cours en PDF ; l'onglet « Les sources » |
| `documents/cours-complet.*`, `documents/livret.html`, `documents/tutoriel.pdf`, `documents/TUTORIELS.md`, `livrets/` | régénérés |

# Le bouton « LES SOURCES », tes propres #include, et le PDF pour tous les niveaux

*Le 2026-10-04.*

## 1. Le bouton « 🔗 LES SOURCES », dans la barre du haut

L'onglet « 📚 Les sources » n'existait que dans le mode création, parmi les
onglets des ateliers : il fallait presque deviner qu'il était là. Un bouton
**« 🔗 LES SOURCES »** (« tous les cours et documents ») rejoint maintenant
les boutons de mode, à droite de « 🔎 MODE MACHINE », avec le même style. Un
clic passe en mode création et ouvre les sources ; le bouton brille tant
qu'elles sont affichées, et « MODE CRÉATION » s'éteint pour qu'un seul bouton
brille (`allumerLesSources`). La visite guidée le cite.

## 2. Une fonction de plus dans la console : `bande()`

`bande(colonne, ligne, tuile, longueur)` pose la même tuile « longueur » fois,
de gauche à droite. Elle est écrite **en C++**, comme les fonctions de
l'élève (`SOURCE_BANDE`, dans `compilateur/emetteur.js`, inscrite dans
`FONCTIONS_EN_C`), avec son nom dans `BIBLIOTHEQUES` et sa fiche dans
`aide-fonctions.js` : **72 `#include`**. Elle a son tuto (« La fonction
bande() »), que le parcours place tout seul avant sa première étape.

Elle sert d'exemple : c'est exactement ce qu'il faut faire pour ajouter une
fonction à la console.

## 3. Le chapitre « Tes propres #include »

Un chapitre 15 au cours (`tuto/programmation.js`), placé **à la fin du
parcours** (26 chapitres, 597 étapes). Une seule fonction le traverse, une
chose nouvelle par étape :

1. `bande()` écrite dans le programme ;
2. appelée trois fois ;
3. rangée dans l'onglet `outils.cpp` (`#include "outils.cpp"`) ;
4. le fichier voisin écrit son propre `#include <poser>` ;
5. une deuxième fonction, `pile()` ;
6. *(le tuto de `bande()`)* — puis `#include <bande>` : elle vient de la
   console, et le texte montre les trois fichiers du compilateur ;
7. une `bande()` à soi, en pointillés, passe avant celle de la console ;
8. un cadre, et la marche à suivre en 7 étapes pour ajouter sa fonction.

`verifier-cours.mjs` passe maintenant les fichiers voisins (`lecon.fichiers`)
au compilateur : les leçons à plusieurs onglets n'existaient jusqu'ici que
dans `lecons.js`.

## 4. Le PDF « Ajouter son propre #include », pour tous les niveaux

`outils/pdf-include.mjs` (nouveau, `npm run pdf-include`) écrit
`documents/ajouter-un-include.pdf` et sa page `.html` : 47 pages.

- **Partie 0, les bases**, en douze sections, depuis zéro : fichier et
  extension, programme et compilateur, l'octet, l'écran et les tuiles, la
  fonction, la boucle `for` déroulée, la ponctuation du C++, l'atelier,
  l'éditeur de texte et les touches, la fenêtre de commande, git.
- Chaque partie affiche son **niveau** (● débutant, ●● intermédiaire,
  ●●● avancé) et ce qu'il faut avoir lu avant, avec des liens.
- **A** les deux sortes d'`#include` ; **B** la compilation, d'abord en images
  (cinq personnes en cuisine), puis avec le vrai code expliqué morceau par
  morceau ; **C** les étapes du chapitre, avec leurs écrans ; **D** le
  JavaScript qu'il faut (avec un exercice corrigé) ; **E** la recette ;
  **F** six erreurs et le message exact du compilateur ; **G** les coûts
  mesurés ; **H** les questions fréquentes ; **I** l'aide-mémoire à cocher ;
  **J** les 72 `#include` ; **K** un lexique de 50 mots.
- **Rien n'est recopié à la main** : le code montré est lu dans les fichiers
  du compilateur, les messages et les octets viennent d'une vraie
  compilation, les écrans de l'émulateur.

Il est dans « 🔗 LES SOURCES ».

## 5. Ce que la mesure a appris

**Un appel à `bande()` coûte plus que dix `poser()` écrits en clair** : 911
octets contre 229. La fonction ne pèse que 38 octets ; mais la tuile lui
arrive par un **paramètre**, une variable, et le compilateur ne peut plus
savoir laquelle sera posée : il grave **toute la police** (704 octets) au lieu
du seul A (16). C'est vrai aussi avec un dessin à soi (`Tuile`). Le PDF
l'explique (partie G) ; une première version disait le contraire, et a été
corrigée avant d'être livrée.

## 6. Une erreur corrigée dans les explications

La leçon 15.3 et la foire aux questions du PDF disaient qu'un fichier voisin
doit être collé **avant** ce qui se sert de ses fonctions. C'est faux pour les
**fonctions** — le compilateur les relève toutes avant de traduire, et un
`#include "outils.cpp"` écrit après `main()` est accepté (essayé) — et vrai
seulement pour les **variables globales** et les **dessins**. Les deux textes
le disent maintenant.

## 7. Ce qui a été vérifié

- `verifier-cours` : 69 leçons, 259 contrôles, verts.
- `verifier-tuto` : 597 étapes, 1653 contrôles, verts ; un `#include` nouveau
  à la fois.
- Les suites de `npm run verifier`, une par une : toutes vertes, sauf
  **`verifier-portage`**, qui ne peut pas tourner sur ce PC (il compare avec
  `../gameboy2/exemples/*.gb`, absent) — sans rapport avec cette passe.
- `verifier-tutoriels` était rouge (le `.md` en retard sur les leçons) :
  `documents/TUTORIELS.md` est régénéré.
- Le PDF : ses 99 liens internes mènent tous quelque part. **Seuls la
  couverture, le sommaire et la Partie 0 ont été regardés en image** ; le
  reste a été relu dans le texte de la page.
- **Pas vu dans un navigateur** : le bouton « 🔗 LES SOURCES » et le chapitre
  dans l'atelier.

## 8. Ce qui reste

- Régénérer le cours complet (`npm run cours-complet`), les livrets
  (`npm run livret`) et `documents/PARCOURS.md` : ils ne connaissent pas
  encore le chapitre 15 ni le tuto de `bande()`.
- Le tuto de `bande()` ne parle pas du coût de la police (§ 5).

## Les fichiers ajoutés ou mis à jour

| Fichier | Rôle |
|---|---|
| `index.html` | le bouton « 🔗 LES SOURCES » et `allumerLesSources` |
| `compilateur/emetteur.js` | `SOURCE_BANDE`, et `bande` dans `FONCTIONS_EN_C` |
| `compilateur/inclusion.js` | `bande` dans `BIBLIOTHEQUES` |
| `aide-fonctions.js` | la fiche de `bande` |
| `tuto/programmation.js` | le chapitre 15, « Tes propres #include » |
| `tuto/parcours.js` | le 26e chapitre du parcours |
| `tuto/lecons.js` | le tuto de `bande()` |
| `verification/verifier-cours.mjs` | les fichiers voisins des leçons du cours |
| `outils/pdf-include.mjs` | **nouveau** : le PDF « Ajouter son propre #include » |
| `documents/ajouter-un-include.*` | **nouveau** : le PDF et sa page |
| `sources.js` | le PDF dans « Les sources » |
| `package.json` | le script `pdf-include` |
| `LISEZMOI.md` | 26 chapitres, 72 `#include`, le bouton, `bande()`, « Ajouter sa propre fonction à la console », le PDF |
| `README.md` | renvoie vers `LISEZMOI.md` |
| `documents/TUTORIELS.md` | régénéré |


## Plus tard le même jour : l'onglet « 📦 Tout le jeu »

Chaque création de l'atelier vit dans le code, sous son nom — mais dans un
grand jeu, on ne voyait plus ce qu'on avait, ni où. Un nouvel onglet du mode
création, **« 📦 Tout le jeu »** (`tout-le-jeu.js`, `index.html#tout`), lit
**tous les onglets** du programme et range chaque élément en six dossiers :
Personnages, Tuiles, Cartes, Scènes jouables, Musiques, Couleurs. Chaque
élément montre sa miniature, son fichier et sa ligne, la ligne à écrire pour
s'en servir (à copier), et « ✏ ouvrir » le choisit dans son atelier, dans le
bon onglet. Une recherche filtre par nom.

**L'image de chaque dossier** se choisit par l'élève (« 🖼 », un fichier de
son ordinateur, réduit à 96 × 96) et se retire (« ✕ »). Elle reste dans le
navigateur (localStorage) : ce n'est pas le programme, ni la cartouche.

Rien n'est déplacé : l'onglet lit, il n'écrit pas. Les ateliers des tuiles,
des airs et de la carte ont reçu une méthode `choisir(nom)`.

**Vérifié dans un vrai navigateur** : `npm run tout-le-jeu`
(`verification/verifier-tout-le-jeu.mjs`, nouveau) — 16 contrôles verts :
les six dossiers, les comptes de l'exemple « musique », le fichier et la
ligne, l'appel, la miniature, la recherche, « ✏ ouvrir », l'image choisie
par un vrai fichier puis retirée, aucune erreur JavaScript.
`verifier-atelier.mjs` reste vert. Les cartes et les scènes ont été essayées
hors navigateur (une carte et une scène écrites par les fonctions des
ateliers, et une tuile dans un second fichier) ; aucun exemple du projet n'a
encore de carte.

| Fichier | Rôle |
|---|---|
| `tout-le-jeu.js` | **nouveau** : l'onglet, l'inventaire, l'image des dossiers |
| `index.html` | l'onglet, sa zone, son style, `#tout`, le lien avec les ateliers |
| `editeur-tuiles.js`, `editeur-airs.js`, `editeur-carte.js` | `choisir(nom)` |
| `verification/verifier-tout-le-jeu.mjs` | **nouveau** : le contrôle dans le navigateur |
| `package.json` | le script `tout-le-jeu` |
| `LISEZMOI.md` | « Tout le jeu, d'un coup d'œil » |


## Plus tard encore : un seul mode pour créer et écrire

Le **MODE CODE** ne faisait que cacher les ateliers pour agrandir l'éditeur :
le programme, les fichiers et « + fichier » étaient déjà dans le MODE
CRÉATION. Deux boutons pour un même travail faisaient croire à deux
programmes. Il n'y a plus qu'**un mode, « 🎨 MODE CRÉATION »** (« dessiner,
composer, écrire le code »), et à côté du titre du programme, un bouton
**« ⤢ Agrandir le code » / « ⤡ Revoir les ateliers »** qui passe d'une vue à
l'autre. Le bouton de mode reste allumé dans les deux vues.

Rien n'est perdu : la vue « code en grand » est l'ancien mode, avec sa
hauteur de champ et son aide. Le bouton « MODE CODE » reste dans la page,
caché, pour l'adresse `index.html#code` et le réglage « Par quoi la page
s'ouvre » (renommé « Création, le code en grand »). La visite guidée montre
le nouveau bouton ; elle annonce « Quatre façons de travailler ».

**Vérifié dans un vrai navigateur** : `verifier-page.mjs` (le test complet
de la page) est vert, avec quatre contrôles nouveaux — plus de bouton à part,
le bouton présent avec les ateliers, le code en grand sans eux (et « MODE
CRÉATION » toujours allumé), le retour aux ateliers. `verifier-atelier.mjs`
et `verifier-tout-le-jeu.mjs` restent verts.

| Fichier | Rôle |
|---|---|
| `index.html` | « MODE CODE » caché, « ⤢ Agrandir le code », l'allumage, le titre, le réglage, la visite guidée |
| `verification/verifier-page.mjs` | le nouveau bouton, au lieu de l'ancien |
| `LISEZMOI.md`, `outils/pdf-include.mjs` (et le PDF régénéré) | le texte suit |


## Plus tard encore : la taille d'un personnage, et son fichier

**Choisir la taille avant de dessiner.** « ▦ Les tuiles » a trois boutons :
« + tuile 8 × 8 », « + perso 16 × 16 », et le nouveau **« + grand 32 × 32 »**.

**Le `Grand`, 32 × 32** — trois `#include` de plus (75 en tout) :

- `Grand BOSS = { 32 rangées de 32 };` : le compilateur en fait un seul dessin
  de **seize tuiles**, rangées comme quatre `Perso` à la suite (haut-gauche,
  haut-droite, bas-gauche, bas-droite) — `enregistrerDessin`, `donnees`,
  `noterTuile`, la déclaration, les messages (`compilateur/emetteur.js`,
  `analyseur.js`, `inclusion.js`).
- `sprite32(n, x, y, BOSS)` : quatre `sprite16` (lutins n à n + 15, 24 au
  plus), et retourné, les quarts échangés. `cacher32(n)` ôte les seize.
- Leurs trois tutos dans `tuto/lecons.js` (« Grand — dessiner un grand
  personnage », « sprite32() », « cacher32() »), placés par le parcours :
  **600 étapes**, 1 658 contrôles, un `#include` nouveau à la fois.
- L'atelier (`editeur-tuiles.js`) lit et écrit les `Grand`, les peint (une
  palette de lutins, le 0 transparent), et « Tout le jeu » les range dans
  Personnages, avec `sprite32`.

Essayé dans l'émulateur : les seize lutins à leur place avec les seize tuiles
dans l'ordre, chaque quart de la bonne nuance à l'écran, `MIROIR_X`,
`cacher32`, et trois refus (sans `#include <Grand>`, au-delà de 24, une rangée
de moins).

**Ranger les personnages dans `personnages.cpp`** (`ranger-personnages.js`,
nouveau) :

- une case **« 📁 personnages dans personnages.cpp »** à côté des boutons
  (retenue par le navigateur, décochée au départ ; seulement en création) :
  un nouveau personnage s'écrit dans cet onglet, créé s'il manque avec ses
  `#include`, et versé dans `principal.cpp` par `#include "personnages.cpp"`,
  avant le code ;
- dans « 📦 Tout le jeu », le dossier Personnages a **« 📁 Ranger dans
  personnages.cpp »** : tous les `Perso` et `Grand` des autres onglets y
  partent, avec leur table de palettes et leurs marques ; « ↶ » le défait.

Essayé hors navigateur sur Mario et `perso16` : le programme compile, et
l'écran est **identique au pixel près** après deux secondes ; ranger deux fois
ne change rien.

**Une erreur trouvée en regardant une capture** : la vignette d'un `Grand` en
couleur était peinte comme une tuile de fond (une condition `cote !== 16`
existante l'attrapait). Corrigée (`cote === 8`).

**Vérifié** : les 15 suites de `npm run verifier` (sauf `verifier-portage`,
qui ne tourne pas sur ce PC) ; dans un vrai navigateur, `verifier-page`,
`verifier-atelier` et `verifier-tout-le-jeu` — ce dernier passe à **29
contrôles** : Mario rangé (onglet créé, MARIO et ENNEMI dedans, le jeu compile
pareil, « ↶ » remet tout), la case cochée puis « + grand 32 × 32 » (BOSS
écrit dans personnages.cpp avec `#include <Grand>`, sa vignette, un vrai clic
qui peint un pixel et lui seul, et son appel `sprite32` dans « Tout le jeu »).

**Ce qui n'est pas fait** : un `Grand` n'a pas de palette par quart (un
`Perso` en a) ; il ne peut pas être joueur ou acteur d'une scène ; l'atelier
ne montre que les dessins de l'onglet ouvert.

| Fichier | Rôle |
|---|---|
| `compilateur/emetteur.js`, `analyseur.js`, `inclusion.js` | `Grand`, `sprite32`, `cacher32` |
| `aide-fonctions.js` | leurs fiches |
| `editeur-tuiles.js` | « + grand 32 × 32 », les `Grand`, la case de rangement |
| `ranger-personnages.js` | **nouveau** : ranger dans personnages.cpp |
| `tout-le-jeu.js` | les Grand, « 📁 Ranger dans personnages.cpp » |
| `index.html` | le lien entre les deux |
| `tuto/lecons.js` | trois tutos |
| `verification/verifier-tout-le-jeu.mjs` | 13 contrôles de plus |
| `LISEZMOI.md`, `documents/TUTORIELS.md`, `documents/ajouter-un-include.*` | à jour |


## Plus tard encore : verrouiller un dessin, comme un modèle

Un personnage fini devient un **modèle** qu'on utilise sans le modifier —
comme une classe : chaque `sprite16(numero, …, MARIO)` en fait un exemplaire,
l'original ne bouge pas. **🔒 Verrouiller** (« ▦ Les tuiles », ou « 📦 Tout le
jeu ») écrit une marque sous le dessin, `/* MARIO : verrouillé */` : elle
s'enregistre avec le projet et part avec lui dans `personnages.cpp`.

Le garde (`verrous.js`, nouveau, pur) compare l'avant et l'après :

- **un atelier** (`poserLeCode`, genre « atelier ») qui changerait un dessin
  verrouillé — ses rangées ou sa table de palettes — est refusé, et l'atelier
  le dit dans sa barre ; renommer un dessin verrouillé aussi ;
- **la frappe** (`surFrappeDansLeCode`) qui le changerait, l'effacerait ou
  ôterait sa marque est défaite aussitôt, curseur compris ;
- les retours en arrière, les versions et les programmes remplacés en entier
  passent ; la marque se pose et s'ôte par 🔒 / 🔓 seulement.

« ⧉ Dupliquer » devient **« ⧉ Créer une variante »** sur un dessin verrouillé :
une copie libre. La vignette porte un cadenas ; « Tout le jeu » aussi, avec
son bouton.

**Un défaut trouvé en chemin** : dans `ranger-personnages.js`, « `\b` » ne
voit pas la fin d'un mot qui finit par « é » — la marque « verrouillé »
n'aurait pas suivi son dessin dans `personnages.cpp`. Corrigé, et essayé.

**Vérifié** : hors navigateur, neuf contrôles (la marque, peindre refusé,
un autre dessin permis, la marque ôtée ou la déclaration effacée à la main
vues, 🔓 qui rend le texte d'avant, le rangement qui emporte la marque) ;
dans un vrai navigateur, `verifier-tout-le-jeu` passe à **42 contrôles** —
verrouiller depuis « Tout le jeu », le cadenas, peindre refusé et dit, taper
dans ses rangées défait, écrire ailleurs permis, une variante qui se peint
avec l'original intact, puis 🔓 et le même clic qui peint. `verifier-atelier`,
`verifier-page`, `verifier-tuto`, `verifier-langage`, `verifier-inclusion` et
`verifier-exemples` restent verts.

| Fichier | Rôle |
|---|---|
| `verrous.js` | **nouveau** : la marque, et ce qui serait refusé |
| `index.html` | le garde dans `poserLeCode` et à la frappe ; 🔒 / 🔓 ; le cadenas |
| `editeur-tuiles.js` | le bouton 🔒 / 🔓, « Créer une variante », le refus dit dans la barre |
| `tout-le-jeu.js` | le cadenas et son bouton |
| `ranger-personnages.js` | la marque part avec le dessin |
| `verification/verifier-tout-le-jeu.mjs` | 13 contrôles de plus |
| `LISEZMOI.md` | « Verrouiller un dessin » |


## Plus tard encore : supprimer un élément, seulement s'il ne sert pas

« 🗑 Effacer » ne faisait que vider le dessin : il devient **« 🧽 Vider le
dessin »** (le nom reste), et **« 🗑 Supprimer »** arrive, qui ôte l'élément du
programme avec ce qui l'accompagne (table de palettes, marques d'étiquettes,
de palette, de verrou).

La suppression est **refusée** :

- tant qu'une ligne du projet s'en sert, dans **n'importe quel onglet** — la
  page dit combien de fois, et où (« SOL est utilisé 1 fois dans le projet…
  principal.cpp, ligne 186 : t = SOL; ») ;
- si l'élément est **verrouillé** (un modèle ne se supprime pas).

Les commentaires et les textes entre guillemets ne comptent pas. Un dessin
compte comme utilisé quand son nom, ou sa table `NOM_PALETTES`, apparaît dans
le code hors de lui-même. Pris en charge : `Tuile`, `Perso`, `Grand`, `Air`,
les cartes (le bloc et son défilement). Pas les scènes ni les couleurs.

Dans **« 📦 Tout le jeu »**, chaque élément dit **« ✔ utilisé N fois »** ou
**« ∅ jamais utilisé »**, et porte **« 🗑 supprimer »**, grisé avec la raison
quand c'est impossible. Les utilisations sont comptées une fois pour tout
l'inventaire : chaque fichier n'est nettoyé et relevé qu'une fois
(`compteurDUtilisations`), et le compte est le même que la recherche détaillée
(vérifié sur les six dessins de Mario).

**Vérifié** : hors navigateur, quatorze contrôles (SOL utilisé refusé avec sa
ligne, un dessin inutilisé supprimé avec sa marque et le programme qui
compile, un verrouillé refusé, un commentaire et un texte qui ne comptent pas,
une tuile d'`outils.cpp` utilisée dans `principal.cpp` refusée, les airs, une
carte appelée refusée et une carte libre ôtée en entier) ; dans un vrai
navigateur, `verifier-tout-le-jeu` passe à **52 contrôles** — le compte et le
bouton grisé de SOL, une tuile neuve « jamais utilisée » supprimée et dite,
« ↶ » qui la rend, verrouillée puis refusée, et dans l'atelier « 🗑 Supprimer »
sur SOL refusé et expliqué. `verifier-atelier`, `verifier-page`,
`verifier-tuto`, `verifier-langage`, `verifier-exemples` et `verifier-refus`
restent verts.

| Fichier | Rôle |
|---|---|
| `supprimer.js` | **nouveau** : où un élément sert, et le supprimer |
| `index.html` | `supprimerDuProjet`, le lien avec l'atelier et « Tout le jeu » |
| `editeur-tuiles.js` | « 🗑 Supprimer », « 🧽 Vider le dessin » |
| `tout-le-jeu.js` | « utilisé N fois », « 🗑 supprimer » |
| `verification/verifier-tout-le-jeu.mjs` | 10 contrôles de plus |
| `LISEZMOI.md` | « Supprimer un élément » |


## Plus tard encore : le personnage qu'on voit, et le cours de son #include

**Le tuto « Perso » (35.1) montre enfin le personnage.** Il ne faisait
qu'écrire « UN PERSO ECRIT » : le dessin n'apparaissait qu'à l'étape d'après,
avec `sprite16()`. Maintenant, BONHOMME est **dans son fichier**,
`personnages.cpp` (avec `#include <Perso>`), `principal.cpp` le verse par
`#include "personnages.cpp"`, et le pose en **quatre cases** du fond avec
`poser()` — `BONHOMME`, `BONHOMME + 1`, `+ 2`, `+ 3`, les quatre quarts. Le seul
`#include` nouveau reste `<Perso>` (`poser` est connu depuis le 0.1.3, et les
fichiers à soi depuis le 0.67).

**Un cours de plus, dans le chapitre 6 « Dessiner »**, juste après les tutos
des personnages : **35.4 à 35.8**, des étapes intermédiaires — aucun autre
numéro ne bouge (la 36 reste la 36). Le même BONHOMME, une chose à la fois :

| N° | Étape |
|---|---|
| 35.4 | BONHOMME, de son fichier à l'écran : `sprite16()` |
| 35.5 | Un nouveau fichier qui l'appelle : `heros.cpp`, `montrerHeros(x, y)` |
| 35.6 | Deux BONHOMME, un seul dessin : le modèle, comme une classe |
| 35.7 | BONHOMME qui marche, depuis `principal.cpp` |
| 35.8 | BONHOMME verrouillé : on s'en sert, on ne le modifie pas |

Trois onglets, trois rôles : `personnages.cpp` (à quoi il ressemble),
`heros.cpp` (ce qu'on en fait), `principal.cpp` (quand et où). Essayé avant
d'écrire : l'ordre des deux `#include` ne compte pas pour un personnage et
une fonction.

**Vérifié** : `verifier-tuto` — **605 étapes**, 1 673 contrôles, un `#include`
nouveau à la fois ; les quinze contrôles des six étapes (le quart haut-gauche
posé et la tête sombre à sa place ; les lutins, leurs tuiles et leurs places ;
les deux exemplaires aux mêmes tuiles ; la marche jusqu'à 120 ; le verrou sans
effet sur le jeu). `verifier-tutoriels` (avec `TUTORIELS.md` régénéré),
`verifier-tuto-page` et `verifier-page` sont verts dans un vrai navigateur.

| Fichier | Rôle |
|---|---|
| `tuto/lecons.js` | le tuto « Perso », et les cinq étapes 35.4 à 35.8 |
| `documents/TUTORIELS.md` | régénéré |


## Plus tard encore : un personnage, un fichier — le parent et ses enfants

En création, un personnage ne s'écrit **plus jamais dans la source
principale** : il a son fichier, « enfant » de la liste des personnages.

```
principal.cpp        #include "personnages.cpp"   ← une ligne, écrite une seule fois
personnages.cpp      le parent : #include "perso_HEROS.cpp", #include "perso_BOSS.cpp"…
perso_HEROS.cpp      HEROS et son #include <Perso>
perso_BOSS.cpp       BOSS et son #include <Grand>
```

- **« + perso 16 × 16 » / « + grand 32 × 32 »** créent l'enfant, ajoutent sa
  ligne au parent, et l'ouvrent ; la case « 📁 personnages dans
  personnages.cpp » disparaît — c'est toujours ainsi, en création. Une leçon
  garde son programme.
- **L'atelier voit tout le projet** : la bande montre les dessins de tous les
  onglets (« ↗ » pour un autre onglet), avec les numéros de tuile comptés sur le
  programme assemblé ; un clic ouvre le fichier du dessin. On ne retouche que
  le contenu visé.
- **Renommer** agit partout, fichier et ligne du parent compris ; **⧉ Créer une
  variante** d'un personnage lui donne son fichier ; **🗑 Supprimer** ôte
  l'enfant vide et sa ligne.
- **Les onglets** des personnages sont repliés : « 📁 personnages (N) ▸ ».
- **« 📦 Tout le jeu »** : « 📁 Un fichier par personnage » range un projet
  existant (personnages de `principal.cpp`, d'un fichier voisin, ou d'un ancien
  `personnages.cpp` d'un seul bloc), marques comprises ; « ↶ » le défait.

`ranger-personnages.js` est réécrit (parent et enfants : `creerEnfant`,
`rangerLesPersonnages`, `renommerDansLeProjet`, `nettoyerLesEnfants`).

**Vérifié** : hors navigateur, vingt contrôles — créer HEROS puis BOSS
(principal.cpp touché la première fois seulement, puis plus jamais), Mario
rangé en deux enfants avec la marque de verrou, l'écran **identique au pixel
près**, ranger deux fois sans effet, un ancien personnages.cpp d'un bloc devenu
liste, renommer ENNEMI → GOOMBA (fichier, ligne du parent, appels), un enfant
vide nettoyé. Dans un vrai navigateur, `verifier-tout-le-jeu` passe à **58
contrôles** : Mario rangé, le groupe d'onglets replié puis déplié, le jeu qui
compile pareil, « ↶ » qui remet tout ; BOSS et HEROS créés chacun dans son
fichier, **principal.cpp inchangé au second**, le parent qui liste les deux, un
clic sur MARIO qui ouvre principal.cpp, une variante dans son propre fichier
et l'original intact. `verifier-atelier`, `verifier-page`, `verifier-tuto-page`,
`verifier-tuto`, `verifier-langage`, `verifier-exemples` et
`verifier-inclusion` restent verts.

**Ce qui reste** : les tuiles, les musiques et les cartes ne sont pas encore
rangées ainsi (les personnages d'abord) ; les leçons 35.x montrent le
`personnages.cpp` d'un seul bloc, plus simple pour apprendre.

| Fichier | Rôle |
|---|---|
| `ranger-personnages.js` | réécrit : le parent et ses enfants |
| `editeur-tuiles.js` | la bande de tout le projet, la création en enfant, renommer et variante |
| `index.html` | le projet pour l'atelier, `poserLesFichiers`, les onglets repliés, la suppression qui nettoie |
| `tout-le-jeu.js` | « 📁 Un fichier par personnage » |
| `verification/verifier-tout-le-jeu.mjs` | les sections 8 et 9 réécrites, 58 contrôles |
| `LISEZMOI.md` | « Un personnage, un fichier » |


**Correction — le compteur « 📁 personnages (N) » affichait (0).** Il comptait
les FICHIERS enfants (`perso_….cpp`), et non les personnages : un BONHOMME écrit
dans `personnages.cpp` d'un seul bloc (les leçons 35.x, un ancien rangement, une
écriture à la main) n'était pas vu. Il compte maintenant les `Perso` et `Grand`
de tous les fichiers du groupe, et suit la frappe (rafraîchi 400 ms après la
dernière touche). Ajouté à `verifier-tout-le-jeu` (**60 contrôles**) : un
`personnages.cpp` vide affiche (0), un Perso tapé dedans fait passer à (1).
`verifier-page` et `verifier-atelier` restent verts.


## Plus tard encore : un personnage est un Perso, en 16 × 16 comme en 32 × 32

« `#include <Perso>` — un dessin de 16 × 16 » laissait croire qu'un personnage
de 32 × 32 n'était pas un personnage. **Un `Perso` est un personnage, quelle
que soit sa taille** : seize rangées en font un 16 × 16, trente-deux un
32 × 32 — la taille se lit sur le dessin, dans le compilateur
(`compilateur/emetteur.js`) comme dans l'atelier (`lireDessins`). `Grand`
reste accepté : c'est l'autre nom d'un Perso de 32 × 32, rien n'est cassé.

- Le message d'un dessin de la mauvaise taille dit « un Perso en veut 16 (un
  personnage de 16 × 16) ou 32 (un personnage de 32 × 32) ». Un 32 × 32 écrit
  sur place dans `sprite32` demande `#include <Perso>`.
- L'atelier écrit `Perso` pour les deux tailles ; le bouton devient
  **« + perso 32 × 32 »**. Les fichiers `perso_NOM.cpp` portent
  `#include <Perso>`.
- `#include <Perso>` se décrit « un personnage : un dessin de 16 × 16 ou de
  32 × 32 pixels » ; `<Grand>`, « un autre nom pour un Perso de 32 × 32 ».

**Les leçons, plus claires — tous les personnages dans un fichier, deux noms :**

- **35.1 « Perso — dessiner des personnages »** : `personnages.cpp` regroupe
  **BONHOMME et ROBOT**, avec **un seul** `#include <Perso>` (« une ligne pour
  tous les personnages de ce fichier ») ; `principal.cpp` les pose tous deux,
  chacun en quatre cases. Contrôlé : les huit quarts, ROBOT = BONHOMME + 4, les
  deux visibles à l'écran.
- **35.2 `sprite16()`** : les deux, du même fichier, descendent ensemble (lutins
  0 à 3, puis 4 à 7).
- **35.4 `sprite32()`** montre un 32 × 32 (un `Perso` de trente-deux rangées) à
  côté d'un 16 × 16 ; **35.5 `cacher32()`** aussi en `Perso`. Le tuto `<Grand>`
  devient « l'autre nom d'un Perso de 32 × 32 ».
- **35.6 à 35.10** (le cours de BONHOMME, avant 35.4 à 35.8) gardent le même
  `personnages.cpp` à deux personnages.

**Une lenteur trouvée en vérifiant — et corrigée.** `verifier-page` a échoué
(« la console tourne » : rien au bout de 3 secondes). Mesuré : charger les
leçons prenait **2 370 ms**. Le parcours place chaque tuto après la première
étape où tout ce qu'il emploie est connu, et RECOMPTAIT depuis le début à
chaque pas ; c'était sans effet tant que `sprite32` et `cacher32` restaient dans
le dictionnaire du chapitre 0, mais en `Perso`, ils attendent le chapitre 6.
La recherche avance maintenant en un seul passage (`tuto/parcours.js`) :
**63 ms**, l'ordre des 605 étapes **identique** (comparé ligne à ligne), et la
page s'ouvre, console tournante, en **0,7 s** au lieu de 3,2 à 3,9 s.

**Vérifié** : les 15 suites de `npm run verifier` (sauf `verifier-portage`,
sans `../gameboy2` sur ce PC) ; `verifier-tuto` : **605 étapes, 1 677
contrôles**, un `#include` nouveau à la fois ; dans un vrai navigateur,
`verifier-tout-le-jeu` (**60 contrôles**, BOSS désormais en `Perso` de 32
rangées), `verifier-atelier`, `verifier-tuto-page` et — après la correction —
`verifier-page`, tous verts. Le PDF `ajouter-un-include` et `TUTORIELS.md` sont
régénérés.

| Fichier | Rôle |
|---|---|
| `compilateur/emetteur.js`, `compilateur/inclusion.js` | un Perso de 16 ou 32 rangées ; les messages ; `<Grand>` l'autre nom |
| `editeur-tuiles.js` | lire un Perso de 32 × 32, « + perso 32 × 32 » |
| `ranger-personnages.js`, `tout-le-jeu.js`, `aide-fonctions.js` | `#include <Perso>` pour les deux tailles |
| `tuto/lecons.js` | 35.1 et 35.2 à deux personnages ; 35.4, 35.5 en Perso ; le tuto `<Grand>` ; 35.6 à 35.10 |
| `tuto/parcours.js` | la recherche en un passage |
| `verification/verifier-tout-le-jeu.mjs` | BOSS en Perso |
| `LISEZMOI.md`, `documents/TUTORIELS.md`, `documents/ajouter-un-include.*` | à jour |

## Plus tard encore : les dessins dans leur fichier, et une leçon qui ne revient plus en arrière

**Dans les tutos des personnages, la source n'appelle que.** `cacher16`
(35.3), `sprite32` (35.4), `cacher32` (35.5) et le tuto `<Grand>` dessinaient
encore leurs personnages dans la source principale. Les dessins sont
maintenant dans l'onglet **`personnages.cpp`** (avec son `#include <Perso>` ou
`<Grand>`) ; `principal.cpp` ne garde que les `#include` et les appels
(`sprite32(…, GEANT)`, `sprite16(…, BONHOMME)`). Dans 35.4, le 16 × 16 est le
BONHOMME du 35.1 et le 32 × 32 s'appelle GEANT : « ROBOT » désignait un 16 × 16
au 35.1 et un 32 × 32 au 35.4. De 35.1 à 35.10, toutes les leçons de
personnages ont leur `personnages.cpp`. Restent dessinés dans la source : la
36 et la 47, liées à l'atelier de la leçon (qui ne lit que la source).

Le vieux commentaire « `#include <Perso>` — un dessin de 16 × 16 pixels, pour
un lutin » est corrigé dans les leçons et les exemples (« un personnage : un
dessin de 16 × 16 ou de 32 × 32 pixels »). `projets/mon_mario/principal.cpp`,
un projet de l'élève, n'est pas touché.

**Pourquoi la 35.4 restait dans son ancienne version, même après Ctrl+F5.**
Le disque et le serveur avaient la nouvelle version (vérifié). C'est l'atelier
qui, en rouvrant sur une leçon, GARDE le programme retenu — au cas où on l'a
modifié à la main — et remontrait donc l'ancienne 35.4. L'atelier retient
maintenant l'**empreinte** de la leçon chargée (FNV-1a de son titre, son code,
ses fichiers) : si la leçon a changé depuis, ou si l'empreinte manque, la
nouvelle version s'ouvre, la leçon affiche « 🔄 leçon mise à jour », et
l'ancienne reste dans l'historique (« ↶ » la rend). Une leçon inchangée garde,
comme avant, le programme modifié à la main.

Dans une leçon, le groupe d'onglets « 📁 personnages » est **déplié d'office** :
`personnages.cpp` est le fichier dont elle parle.

**Vérifié** : `verifier-tuto` (605 étapes, vert), `verifier-tutoriels`
(`TUTORIELS.md` régénéré), `verifier-exemples`, `verifier-console`,
`verifier-surplace`, `verifier-inclusion` ; dans un vrai navigateur,
`verifier-tout-le-jeu` passe à **66 contrôles** — dont le cas réel : l'ancienne
35.4 retenue, la page rouverte sur la nouvelle avec `personnages.cpp`, le
message, « ↶ » qui rend l'ancienne, puis la nouvelle qui reste — ainsi que
`verifier-tuto-page`, `verifier-page` et `verifier-atelier`.


## Plus tard encore : un personnage, un fichier, dans les leçons aussi

Les leçons de personnages mettaient tous les dessins dans un même
`personnages.cpp`. **Chaque personnage a maintenant son fichier**, un dessin
chacun — comme deux images — et la source principale verse chaque fichier
d'une ligne :

```cpp
#include "perso_BONHOMME.cpp"   // le dessin 1
#include "perso_ROBOT.cpp"      // le dessin 2
```

| Leçon | Ses fichiers |
|---|---|
| 35.1 Perso, 35.2 `sprite16()` | `perso_BONHOMME.cpp`, `perso_ROBOT.cpp` |
| 35.3 `cacher16()` | `perso_BONHOMME.cpp` |
| 35.4 `sprite32()` — la comparaison | `perso_GEANT.cpp` (32 × 32), `perso_BONHOMME.cpp` (16 × 16) |
| 35.5 `cacher32()`, le tuto `<Grand>` | `perso_GEANT.cpp` |
| 35.6 à 35.10 (le cours de BONHOMME) | `perso_BONHOMME.cpp` (et `heros.cpp`) |

Chaque fichier écrit son `#include <Perso>` pour se suffire à lui-même — deux
fois, c'est sans coût. Les textes et les commentaires suivent ; la phrase du
35.6 sur l'atelier parlait encore de l'ancienne case à cocher : elle dit
maintenant « + perso » et « 📁 Un fichier par personnage ». Les dessins sont
repris tels quels des leçons ; le script vérifie qu'il ne reste aucun
`personnages.cpp` dans ces onze leçons.

**Vérifié** : `verifier-tuto` — 605 étapes, 1 677 contrôles, verts ;
`verifier-tutoriels` (`TUTORIELS.md` régénéré) ; dans un vrai navigateur,
`verifier-tout-le-jeu` (66 contrôles — la 35.4 rouverte montre ses deux
onglets, `perso_GEANT.cpp` et `perso_BONHOMME.cpp`), `verifier-tuto-page`,
`verifier-page` et `verifier-atelier`, tous verts.

## Plus tard encore : un include qui inclut tous les fichiers

Chaque personnage a son fichier, et **`personnages.cpp` est l'include qui les
inclut tous** : il porte **`#include <Perso>` UNE fois**, pour tous, puis une
ligne par personnage. La source principale n'a qu'**une** ligne,
`#include "personnages.cpp"` ; chaque `perso_….cpp` n'est **que son dessin**,
comme une image.

```
principal.cpp        #include "personnages.cpp"
personnages.cpp      #include <Perso>               ← une fois, pour tous
                     #include "perso_BONHOMME.cpp"
                     #include "perso_GEANT.cpp"
perso_BONHOMME.cpp   Perso BONHOMME = { … };        ← juste le dessin
perso_GEANT.cpp      Perso GEANT = { … };           ← juste le dessin
```

Mesuré avant de choisir : `#include <Perso>` écrit dans chaque fichier ou une
seule fois donne la **même cartouche, octet pour octet** (1 136 octets, trois
personnages). C'est une autorisation, pas un dessin.

- **L'atelier** (`ranger-personnages.js`) : la liste porte `#include <Perso>`
  (et `<Grand>` si un enfant écrit « Grand »), ajouté s'il manque ; un
  personnage créé, ou rangé par « 📁 Un fichier par personnage », ne reçoit que
  son dessin.
- **Les leçons 35.1 à 35.10 et le tuto `<Grand>`** : la même organisation. Le
  script qui les réécrit s'est arrêté deux fois avant d'enregistrer (des
  phrases entre guillemets doubles d'un côté, simples de l'autre ; puis un
  remplacement qui visait le texte de la leçon au lieu de son code) : rien n'a
  été écrit à moitié.
- `LISEZMOI.md` : le schéma, et l'`#include <Perso>` unique.

**Vérifié** : hors navigateur, les vingt contrôles du parent et des enfants
(dont : les enfants sans aucune ligne `#include`, la liste avec un seul
`#include <Perso>`, Mario rangé à l'écran identique) ; `verifier-tuto` (605
étapes, 1 677 contrôles), `verifier-tutoriels` (`TUTORIELS.md` régénéré),
`verifier-exemples`, `verifier-inclusion` ; dans un vrai navigateur,
`verifier-tout-le-jeu` (**67 contrôles** — BOSS « juste le dessin, sans
#include », la liste avec « #include <Perso> UNE fois, pour tous »),
`verifier-tuto-page`, `verifier-page` et `verifier-atelier`. Tout est vert.

## Plus tard encore : l'alphabet des titres, ALPHABET_TITRE

Un **troisième alphabet**, pour écrire le nom d'un jeu sur son écran titre,
dans le style des grandes lettres des titres Game Boy : les lettres
**épaisses** d'`ALPHABET_GRAS`, avec une **ombre** grise (nuance 2) en bas à
droite de chaque pixel du trait — un relief qui tient dans la tuile de 8 × 8.
Ce sont **nos** lettres, calculées à partir de la police du projet
(`lettresTitre`, dans `compilateur/police.js`) : elles évoquent ce style sans
recopier celles d'aucun jeu.

- `#include <ALPHABET_TITRE>` (le 76ᵉ) ; `ALPHABET_TITRE[0]` est le A,
  `[25]` le Z ; chaque lettre se pose avec `poser()`.
- Comme `ALPHABET_GRAS` : 26 « Tuile TITRE_A … » et leur tableau, ajoutés à la
  cartouche **seulement** si le programme écrit `ALPHABET_TITRE` (environ
  1 200 octets dès la première lettre).
- **Son tuto, 0.110 du parcours** (« ALPHABET_TITRE — les lettres des
  titres ») : « TITRE » en lettres de titre, et le même mot en lettres
  ordinaires en dessous ; il explique comment trouver la place d'une lettre
  (T = 19, I = 8…). Cinq contrôles, dont l'ombre (63 pixels gris).
- `police.js` est en fins de ligne Windows (CRLF) : le script qui l'a modifié
  les respecte.

Regardé : l'écran du tuto, exporté de l'émulateur — les lettres épaisses à
l'ombre grise, nettement distinctes des lettres ordinaires.

**Vérifié** : `verifier-tuto` (**606 étapes, 1 682 contrôles**, un `#include`
nouveau à la fois), `verifier-tutoriels` (`TUTORIELS.md` régénéré),
`verifier-langage`, `verifier-refus`, `verifier-inclusion`,
`verifier-exemples`, `verifier-console`, et `verifier-tuto-page` dans un vrai
navigateur — tous verts. `LISEZMOI.md` (la ligne `ALPHABET_TITRE`, 76
`#include`) et le PDF `ajouter-un-include` sont à jour.

## Plus tard encore : les GROSSES lettres de titre, texteTitre()

`ALPHABET_TITRE` donnait des lettres d'**une** case : trop petites pour le
nom d'un jeu. `texteTitre(colonne, ligne, "MOT")` écrit un **mot entier** en
grosses lettres, dans le style des écrans titres Game Boy « dessin animé » :
24 × 24 pixels par lettre (trois cases sur trois), rondes, l'intérieur clair,
un **contour noir épais**, une **ombre** grise, et une lettre sur deux
descendue de 4 pixels — le mot **sautille**.

- **Les lettres** (`grandeLettreTitre`, dans `compilateur/police.js`) : le
  gras de la police, agrandi deux fois, coins arrondis, contour de deux
  pixels, ombre d'un pixel. Ce sont **nos** lettres : elles évoquent ce style
  sans recopier celles d'aucun jeu.
- **Le compilateur** (`compilateur/emetteur.js`) : l'appel devient, pour
  chaque case non vide, un `poser(c, l, { dessin })` écrit par la console
  (ni `#include <poser>` ni `<Tuile>` demandés). Seules les lettres du mot
  vont dans la cartouche, et deux cases dessinées pareil ne coûtent qu'une
  tuile. Refus clairs : un mot qui dépasse les 20 colonnes (avec le calcul),
  une lettre qui sort par le bas, un mot qui n'est pas écrit entre guillemets.
- `#include <texteTitre>` (le 77ᵉ) ; une fiche dans l'aide des fonctions.
- **Son tuto, 35.11** : « TITRE » au milieu de l'écran ; quatre contrôles
  (les deux T faits des mêmes tuiles, l'ombre, le I plus bas que le T).
- **La leçon 35.12, « L'écran titre de ton jeu »**, juste après le cours
  BONHOMME : SUPER et JEU centrés sur deux lignes, BONHOMME (de son fichier,
  par `montrerHeros`) dessous, et « APPUIE SUR START ». Six contrôles.
- `ALPHABET_TITRE` (0.110) reste disponible, pour les petites lettres.

Regardé : l'écran exporté de l'émulateur — SUPER / JEU 2! en grosses lettres
rondes, contour noir, ombre, qui sautillent.

**Vérifié** : `verifier-tuto` (**608 étapes, 1 692 contrôles**, un `#include`
nouveau à la fois), `verifier-tutoriels` (`TUTORIELS.md` régénéré),
`verifier-langage`, `verifier-refus`, `verifier-inclusion`,
`verifier-exemples`, `verifier-console`, et dans un vrai navigateur
`verifier-tuto-page`, `verifier-page` et `verifier-tout-le-jeu` — tous
verts. `LISEZMOI.md` (77 `#include`, la ligne `texteTitre`) à jour.

## Plus tard encore : la taille des lettres de titre

`texteTitre()` prend un **quatrième argument, facultatif : la taille**, le
nombre de cases de côté d'une lettre.

| taille | une lettre | lettres par ligne |
|---|---|---|
| 2 | 16 × 16 pixels (2 × 2 cases) | 10 |
| 3 (sans 4ᵉ argument) | 24 × 24 pixels (3 × 3 cases) | 6 |
| 4 | 32 × 32 pixels (4 × 4 cases) | 5 |

- **Les lettres** (`grandeLettreTitre(caractere, enBas, taille)`, dans
  `compilateur/police.js`) : les mesures de chaque taille sont rangées dans
  `TAILLES_DE_TITRE` (agrandissement, place, épaisseur du contour, coins
  arrondis ou non, saut). La taille 3 est exactement celle d'avant ; la
  taille 2 a un contour d'un pixel et pas d'arrondi (ses traits de 2 pixels
  disparaîtraient).
- **Dans la même fonction, pas dans une autre** : les lettres sont dessinées
  par le compilateur, avant que le jeu ne tourne. La taille s'écrit donc en
  clair ; une variable, ou une taille autre que 2, 3 ou 4, est refusée avec
  l'explication. Le refus « trop large » ou « trop bas » compte avec la taille.
- **La leçon 35.13, « Choisir la taille du titre »** : TITRE dans les trois
  tailles, l'un sous l'autre ; quatre contrôles (les colonnes de chaque
  taille, et des dessins propres à chaque taille).
- L'aide des fonctions et `#include <texteTitre>` parlent de la taille.

Regardé : l'écran exporté de l'émulateur — SUPER en tailles 2 et 3, JEU en
taille 4.

**Vérifié** : `verifier-tuto` (**609 étapes, 1 696 contrôles**, un `#include`
nouveau à la fois), `verifier-tutoriels` (`TUTORIELS.md` régénéré),
`verifier-langage`, `verifier-refus`, `verifier-inclusion`,
`verifier-exemples`, `verifier-console`, et dans un vrai navigateur
`verifier-tuto-page` et `verifier-page` — tous verts. Les refus essayés à
part : taille variable, taille 5, 11 lettres en taille 2, une lettre de
taille 4 en ligne 15. `LISEZMOI.md` (la ligne `texteTitre`) à jour.

## Plus tard encore : un titre entre manga et dessin animé, texteManga()

Un **deuxième style** de lettres de titre, demandé « entre manga et » le style
dessin animé de `texteTitre()`. `texteManga(colonne, ligne, "MOT", taille)` :

- des lettres **penchées** vers la droite (le haut décalé d'un pixel toutes
  les quelques rangées), comme une écriture qui fonce ;
- des **coins coupés en biais** (en haut à droite, en bas à gauche) au lieu
  d'arrondis, et un contour noir **carré**, aux angles vifs ;
- le **bas** de chaque lettre en **trame** (un pixel sur deux en gris clair),
  comme les trames des pages de manga — en taille 2, un gris plein ;
- une **ombre portée** grise plus longue, en bas à droite ;
- et, côté dessin animé, une lettre sur deux un peu plus bas.

Ce sont **nos** lettres (`lettreManga` et `TAILLES_MANGA`, dans
`compilateur/police.js`), calculées à partir de la police du projet, sans
recopier celles d'aucun manga ni d'aucun jeu.

- **Le compilateur** : `texteManga` suit exactement le chemin de
  `texteTitre` (mêmes arguments, mêmes tailles 2, 3 ou 4, mêmes refus, qui
  nomment la bonne fonction) ; seul le dessinateur des lettres change.
- `#include <texteManga>` (le 78ᵉ) et une fiche dans l'aide des fonctions.
- **Son tuto, 35.14** : « MANGA » en taille 3 ; quatre contrôles (la place,
  la pente du M, la trame, l'ombre).
- **La leçon 35.15, « Deux styles pour un titre »** : SUPER par
  `texteTitre()` puis par `texteManga()`, chacun sous son nom ; cinq
  contrôles, dont « la trame, dans le manga seulement ».

Regardé : l'écran exporté de l'émulateur — SUPER en tailles 2 et 3, JEU en
taille 4, en lettres manga.

**Vérifié** : `verifier-tuto` (**611 étapes, 1 705 contrôles**, un `#include`
nouveau à la fois), `verifier-tutoriels` (`TUTORIELS.md` régénéré),
`verifier-langage`, `verifier-refus`, `verifier-inclusion`,
`verifier-exemples`, `verifier-console`, et dans un vrai navigateur
`verifier-tuto-page` et `verifier-page` — tous verts. `LISEZMOI.md` (78
`#include`, la ligne `texteManga`) à jour.

## Plus tard encore : un avion dans les dessins tout faits

Un **AVION** de 16 × 16 rejoint les personnages de la bibliothèque
(`bibliotheque.js`, après le VAISSEAU) : vu du dessus, le nez en haut, les
ailes et la queue ; un contour plein (`#`), la carlingue moyenne (`+`), le
cockpit clair (`-`). On le prend dans l'onglet des modèles de « ▦ Les
tuiles », comme les autres : il entre dans le programme avec son nom.

Regardé : l'avion compilé et posé par `sprite16()` dans l'émulateur, agrandi.

**Vérifié** : `verifier-page` (17 modèles sur 17, 5 personnages),
`verifier-atelier` et `verifier-tout-le-jeu` — tous verts.

La **leçon 35.16, « Un avion qui vole »**, en fait un personnage qu'on pilote :
AVION rangé dans `perso_AVION.cpp`, versé par `personnages.cpp` ; `sprite16()`
le pose, la croix le déplace d'un pixel par image, et `px < 144`, `py < 128`
(160 − 16, 144 − 16) le gardent entier à l'écran. Cinq contrôles (le départ
au milieu, droite, haut, l'arrêt au bord gauche, le lutin qui suit).
**Vérifié** : `verifier-tuto` (**612 étapes, 1 710 contrôles**),
`verifier-tutoriels` (`TUTORIELS.md` régénéré), `verifier-langage`,
`verifier-inclusion`, `verifier-tuto-page` — tous verts.

Puis **deux leçons pour régler la vitesse de l'avion** :

- **35.17, « La vitesse de l'avion »** : une variable `vitesse` (pixels par
  image : 1 = 60 px/s, 2 = 120, 4 = 240) ; `px = px + vitesse;`. Les bords se
  testent AVANT le pas — `px >= vitesse`, `px + vitesse <= 144` — parce qu'un
  `uint8_t` ne descend pas sous 0 : il repart à 255, et l'avion sauterait à
  l'autre bout de l'écran. Cinq contrôles (deux fois plus loin qu'au 35.16,
  arrêts pile à 144 et à 0).
- **35.18, « Changer de vitesse en vol »** : A accélère, B ralentit, entre 1
  et 4 ; `aAvant` / `bAvant` retiennent l'image d'avant, pour qu'un appui
  tenu plusieurs images ne compte qu'une fois. `texte()` et `nombre()`
  affichent « VITESSE 2 ». Cinq contrôles (un appui de 6 images = +1, les
  limites 4 et 1, le chiffre affiché).

**Vérifié** : `verifier-tuto` (**614 étapes, 1 720 contrôles**),
`verifier-tutoriels` (`TUTORIELS.md` régénéré), `verifier-langage`,
`verifier-inclusion`, `verifier-tuto-page` — tous verts.

Et **35.19, « Plus lent qu'un pixel par image »** — « vitesse 2, c'est déjà
trop rapide » : `vitesse` ne descend pas sous 1 (60 pixels par seconde), un
`uint8_t` n'a pas de demi. L'avion garde donc un pas d'UN pixel, mais
n'avance qu'une image sur `lenteur`, grâce à un compteur `compte`.
`lenteur = 3` : 20 pixels par seconde, trois fois moins vite qu'au 35.16,
et toujours fluide ; le tableau 1 → 60, 2 → 30, 3 → 20, 4 → 15, 6 → 10.
Quatre contrôles (30 images de flèche = 10 pixels environ, arrêts pile à 0
et à 128, le lutin qui suit). **Vérifié** : `verifier-tuto` (**615 étapes,
1 724 contrôles**), `verifier-tutoriels`, `verifier-langage`,
`verifier-tuto-page` — tous verts.

## Plus tard encore : Space Invaders, rangé avec les projets

Le jeu complet était dans `exemples/invaders.cpp` (avec `invaders.gbc` et
`invaders.png`), ouvert par le menu des exemples (« SPACE INVADERS — le jeu
entier, en couleur ») et par `npm run invaders`. Il ne figurait pas dans
**📂 Ouvrir**, qui ne montre que les dossiers de `projets/`.

Il y est maintenant : **`projets/space_invaders/`** — `principal.cpp` (le même
programme), `space_invaders.gbc` (recompilée, titre « INVADERS »),
`capture.png`, `projet.json` (console `gbc`).

Ce que fait le jeu : écran titre et record ; 5 rangs × 7 envahisseurs qui
marchent, descendent au bord et accélèrent avec leur musique à quatre notes ;
trois sortes d'envahisseurs (30, 20, 10 points) ; le canon (un tir à la fois) ;
quatre abris qui s'effritent ; trois bombes au plus ; la soucoupe mystère ;
3 vies, une de plus à 1 500 points ; PAUSE avec START ; le record gardé dans
la cartouche. 1 200 lignes, 8 455 octets de programme.

Recompiler : `node outils/gb3.mjs projets/space_invaders/principal.cpp
projets/space_invaders/space_invaders.gbc INVADERS`.

## Plus tard encore : Mario Calcul, une démo qui fait calculer

Un nouveau petit jeu, pour commencer : **`exemples/calcul.cpp`** (360 lignes,
2 491 octets de programme, cartouche Game Boy `.gb`, titre « CALCUL »).

- Le héros (le personnage de Mario, en `sprite16`) marche avec GAUCHE /
  DROITE et saute avec A (24 images : 12 pour monter, 12 pour redescendre,
  2 pixels à chaque fois).
- **Trois portes « ? »** (colonnes 6, 11 et 16, trop hautes pour être sautées)
  barrent la route. En touchant une porte, une question s'écrit en haut :
  `7 + 5 = 0`. HAUT / BAS changent la réponse (0 à 18), A la donne.
- **Bonne réponse** : la porte disparaît, une étoile de plus, « BRAVO ! ».
  **Mauvaise** : « NON ESSAIE ENCORE », la même question reste.
- Les nombres vont de 1 à 9 ; une soustraction échange a et b si a est le plus
  petit, parce que la console ne connaît pas les nombres négatifs.
- Toutes les portes ouvertes et le drapeau atteint : « GAGNE ! BRAVO ».
- La police n'a ni « + » ni « = » : deux tuiles, `PLUS` et `EGAL`, les
  dessinent. Elle n'a pas non plus la virgule, d'où « NON ESSAIE ENCORE ».

Où le trouver :

- le menu des exemples de l'atelier : « MARIO CALCUL — ouvrir les portes en
  calculant (démo) » ;
- **📂 Ouvrir** : le projet **`projets/mario_calcul/`** (`principal.cpp`,
  `mario_calcul.gb`, `capture.png`, `projet.json`) ;
- la ligne de commande : `npm run calcul`.

**Vérifié** dans l'émulateur, en captures : l'écran de départ ; une mauvaise
réponse (« 8 + 2 = 2 » → « NON ESSAIE ENCORE ») ; une partie entière jouée
par des appuis enregistrés (A puis HAUT, encore et encore, jusqu'à la bonne
réponse) : une addition et une soustraction (« 7 - 5 ») réussies, les trois
portes ouvertes, « ETOILES 3 », « GAGNE ! BRAVO ».

Ce qui reste à faire, si l'on veut aller plus loin : un niveau qui défile
comme `mario.cpp`, des ennemis, des multiplications, un compte de vies.

## Plus tard encore : le programme C++ gravé dans la cartouche

La question revenait : « peut-on retrouver le C++ d'une cartouche ? ». Des
octets seuls, non — la compilation jette les noms et les commentaires, et
`retour-cpp.js` ne fait que reconnaître des formes. La seule façon de rendre
le programme **tel qu'il a été écrit**, c'est de l'avoir gardé.

- **`compilateur/source-gravee.js`** (nouveau) : les fichiers du projet — le
  principal et ceux qu'il inclut — sont compressés (LZSS, écrit ici, sans
  dépendance) et gravés au bout de la place libre de la cartouche, derrière
  une marque de seize octets « SOURCE C++ » en `$7FF0`, avec leur somme. Un
  octet abîmé, et rien n'est rendu plutôt qu'un programme faux.
- **`fabriquer()`** prend un sixième argument, `source`, et
  **`fabriquerLaCartouche()`** un quatrième ; la page et `gb3.mjs` les passent.
  `gb3.mjs` dit si le programme a été gravé, et sinon pourquoi.
- **⇱ Retour au C++** cherche d'abord le programme gravé : s'il est là, il
  remplace les onglets (avec confirmation, ↶ le défait) ; sinon, la
  reconnaissance d'avant.
- **`verification/verifier-source-gravee.mjs`** : 37 contrôles — cinq
  programmes, dont Space Invaders (30 Ko → 11 Ko), relus à la lettre près ;
  le même écran avec et sans le programme gravé ; un projet en deux fichiers ;
  rien de rendu sur une cartouche sans marque, abîmée ou trop pleine.

À savoir : qui a la cartouche a le programme. Les `.gb` déjà présents dans
`exemples/` et `projets/` ont été fabriqués avant, et n'en portent pas tant
qu'ils ne sont pas refabriqués.

## Plus tard encore : étudier une cartouche venue d'ailleurs (Pokémon Jaune)

Le C++ d'un jeu du commerce n'existe pas. On peut, en revanche, l'étudier
pièce par pièce et réécrire en C++ ce qu'on a compris. Première passe :

- **`etude/banc.js`** : n'importe quelle cartouche dans l'émulateur du
  projet, ses touches, et le journal de qui écrit où (instruction et banc) ;
- **`etude/chercheur.js`** : le chercheur de variables — photographier la
  mémoire, agir, garder ce qui a « monté de 1 », « baissé », « pas bougé » ;
- **`etude/idiomes.js`** : dix empreintes communes à toutes les cartouches
  (manette, transfert des lutins, attente de la ligne 144, ouvrir/fermer la
  sauvegarde, bancs, recopie, écran, halt), chacune reliée à la routine de
  notre compilateur et à la fonction C++ du projet ;
- **`outils/etudier.mjs`** : l'en-tête, les idiomes, et la sauvegarde
  espionnée pendant un parcours au clavier ;
- **`etude/jeux/pokemon-jaune.cpp`** : le carnet — le curseur du menu
  ($CC26, trouvé en cinq essais), le nom du joueur dans la sauvegarde ($A598,
  banc 1), la routine 01:5E84 qui décide s'il y a une partie et le menu
  01:5C22 qui la charge, traduits en C++ ; recoupés avec le désassemblage
  « pret » de Pokémon Rouge/Jaune (wCurrentMenuItem, sPlayerName) ;
- **`verification/verifier-etude.mjs`** : 9 contrôles sur nos cartouches,
  où l'on connaît la réponse.

Reste à faire : charger une partie sauvegardée (il faut en avoir une), la
routine qui écrit la sauvegarde (1C:7E8B), et un panneau dans la page pour
chercher les variables à la souris.

## Plus tard encore : modifier l'assembleur, et traduire tout un programme en C++

Deux outils généraux, pour n'importe quelle cartouche :

- **Modifier** — `etude/assembleur.js` (du texte aux octets, en reprenant
  les 988 formes du désassembleur : l'aller-retour est exact),
  `etude/modifier.js` (recouvrir sans jamais décaler, `nop` de complément,
  sommes de l'en-tête, IPS) et `outils/modifier.mjs` (voir, remplacer,
  écrire des octets, partager en IPS, essayer avec une capture). Essai sur
  Pokémon Jaune : 01:5E99 `jr z` → `jr` — le jeu croit à une sauvegarde,
  la charge et répond « La sauvegarde est détruite ! », ce qui confirme la
  lecture du carnet.
- **Traduire** — `etude/traducteur.js` et `outils/traduire.mjs` : trouver
  le code (lecture + console qui tourne, jouée au hasard), découper en
  fonctions, traduire chaque instruction en C++, nommer les adresses
  (fichier de noms), signaler les idiomes. Les drapeaux ne sont écrits que
  s'ils sont relus — y compris la retenue rendue au `ret`, un piège trouvé
  en relisant 01:5E84 et couvert par un contrôle.
- `etude/banc.js` note désormais les ENTRÉES (où arrivent les appels et
  les sauts calculés, avec leur banc).
- `desassembleur.js` : `add sp, e` et `ld hl, sp + e` affichent un nombre
  signé, plus une adresse ; `REGISTRES` est exporté pour l'assembleur.
- Contrôles : `verifier-modifier.mjs` (21) et `verifier-traduire.mjs` (19).

Limite dite partout : le C++ traduit se LIT, il ne se recompile pas en
cartouche ; et il ne contient que le code que la console a pu atteindre
pendant qu'on la faisait jouer.

## Plus tard encore : le C++ d'une cartouche du dehors, dans la page

- `etude/banc.js` : l'espion sort du banc d'étude — `espionner(gb)` se
  branche sur n'importe quelle console, la page comprise.
- La page l'allume à « 📂 Ouvrir un .gb » (et l'éteint à la compilation) :
  le code joué est noté au fil de la partie.
- `vue-traduction.js` (nouveau) : dans le MODE MACHINE, pour une cartouche
  du dehors, deux vues — « 🔎 Assembleur » et « ⇱ C++ — tout le programme » :
  C++ et assembleur côte à côte, banc, recherche, renommage au double-clic
  (retenu dans le navigateur, par cartouche), « 🔄 Retraduire »,
  « ⬇ Télécharger le C++ ».
- « ⇱ Retour au C++ » sur une cartouche du dehors ouvre cette vue (le
  programme gravé passe toujours d'abord).
- `verifier-page.mjs` : trois contrôles — la traduction de `tetris.gb` dans
  le MODE MACHINE, ses lignes, la recherche d'une adresse avec son
  assembleur. Le renommage au double-clic n'est pas piloté par le contrôle.

## Plus tard encore : lire des fichiers C++ importés, sans copier-coller

L'utilisateur a voulu copier les 500 000 lignes du C++ de Pokémon : le
navigateur s'est figé. Désormais :

- `vue-fichiers.js` (nouveau) : MODE MACHINE → « 📄 Lire des fichiers C++ » →
  « 📄 Importer des fichiers C++ » (un ou plusieurs .cpp / .h). Une visionneuse
  en lecture seule qui n'écrit que les lignes visibles (hauteur de ligne
  fixe, une cinquantaine dans la page) : 66 fichiers, 499 885 lignes ouverts en
  0,3 s. Recherche d'un fichier à l'autre, aller à la ligne, assembleur de la
  ligne cliquée si la cartouche est ouverte.
- Le MODE MACHINE a désormais des onglets toujours là : Assembleur, C++ (une
  cartouche du dehors), Lire des fichiers C++. « 🔎 Voir l'assembleur » ouvre
  toujours l'onglet Assembleur.
- `verifier-page.mjs` : trois contrôles — un fichier de 200 000 lignes
  importé, moins de 300 lignes écrites dans la page, la recherche qui va droit
  à la ligne.

## Plus tard encore : modifier le jeu en modifiant son C++

L'utilisateur voulait donner le fichier C++ à l'atelier, et que le jeu
tourne — avec ses changements.

- **Traducteur** : une ligne par instruction, toujours (les `nop` et les
  tests absorbés par un `if` ont maintenant la leur) ; chaque ligne finit par
  une empreinte `#CCCCIIII` (C++ / instruction, `empreinte()`), et une
  instruction d'un autre banc que sa fonction dit son banc (`// 01:414B`).
- **`etude/reconstruire.js`** (nouveau) : relit tous les fichiers et refait
  chaque octet ; les lignes inchangées redonnent leurs octets, les lignes
  changées sont retraduites (C++ → instruction, pour les formes que le
  traducteur écrit ; un `if` changé change aussi son `cp`/`bit`), ou
  assemblées (instruction en commentaire), ou recopiées (données). Rien ne se
  décale ; refus avec fichier et ligne ; fichier manquant détecté.
  Pokémon Jaune, Space Invaders, Mario, Tetris, le compteur : reconstruits
  à l'octet près.
- **`outils/reconstruire.mjs`** (nouveau) : dossier ou fichier unique → .gb.
- **Page** : dans « 📄 Lire des fichiers C++ », double-clic pour modifier une
  ligne, « ▶ Reconstruire et lancer » (la cartouche part dans la console
  par `jouerLaCartouche()`, sortie du chargement d'un .gb), « ⬇ .gb
  reconstruit », les erreurs et les changements cliquables.
- Contrôles : `verifier-reconstruire.mjs` (17), et deux de plus dans
  `verifier-page.mjs`. Essayé à la main dans le navigateur sur Pokémon :
  `if (a == 0x50) goto L_5EA7;` → `goto L_5EA7;` par double-clic, le jeu
  reconstruit tourne et dit « La sauvegarde est détruite ! ».
- Les anciennes traductions (sans empreintes) sont refusées, avec le conseil
  de les refaire ; celle de Pokémon, à côté du jeu, a été refaite.

## Bilan : ce que la traduction en C++ permet, et ce qu'elle ne permet pas

- **Elle permet** de lire n'importe quelle cartouche en entier, de trouver un
  endroit précis et de le **modifier** (C++, instruction ou données), puis de
  reconstruire et lancer le jeu — vérifié de bout en bout dans le navigateur
  sur Pokémon Jaune.
- **Elle ne donne pas un C++ lisible comme un programme écrit à la main** :
  registres, drapeaux, `goto` et noms automatiques. L'utilisateur l'a jugé
  illisible, à raison : un jeu écrit en assembleur n'a jamais eu de C++, et
  ses idées ne sont pas dans la cartouche. Retrouver les boucles ou importer
  une table de noms (`.sym`) aiderait sans changer le fond ; ni l'un ni
  l'autre n'a été fait.
- Pour comprendre un jeu connu : les désassemblages relus à la main (pour
  Pokémon Jaune, *pret/pokeyellow*). Pour un jeu en C++ clair : l'écrire dans
  l'atelier, en reprenant les dessins avec « ⚠ CONVERSION ».
- Essai abandonné à la demande de l'utilisateur (« trop lourd ») : Mewtwo à la
  place de Pikachu au départ. Endroit probable, non vérifié en jouant :
  `07:4B65` (`ld a, $54` après `ld a, 5`, le niveau).

## Plus tard encore : la traduction en C++ retirée

À la demande de l'utilisateur, l'option qui lisait une cartouche venue
d'ailleurs et la transformait en C++ est enlevée :

- supprimés : le dossier `etude/` (banc, chercheur, idiomes, assembleur,
  modifier, traducteur, reconstruire, le carnet de Pokémon Jaune),
  `vue-traduction.js`, `vue-fichiers.js`, `outils/etudier.mjs`,
  `traduire.mjs`, `reconstruire.mjs`, `modifier.mjs` et leurs quatre
  vérifications ;
- `index.html` : plus d'onglets dans le MODE MACHINE (l'assembleur seul),
  plus d'espion sur la console ; « ⇱ Retour au C++ » rend le C++ gravé, ou
  remonte les formes de ce compilateur, comme avant ;
- gardés : « 📂 Ouvrir un .gb », « ⚠ CONVERSION » (dessins, décor, textes),
  le C++ gravé dans la cartouche, `analyse-rom.js` et `desassembleur.js`.
- « ⇱ Retour au C++ » est grisé quand une cartouche venue d’ailleurs tourne :
  sans la traduction, il n’en retrouvait plus que 10 % (Tetris), illisible.
  Pour une cartouche compilée ici, il rend toujours le C++ d’origine.

## Plus tard encore : les deux boutons rouges retirés

À la demande de l'utilisateur, le groupe « Avancé » de la console disparaît :

- « ⇱ Retour au C++ » et « ⚠ CONVERSION » sont retirés de la page, avec
  `retour-cpp.js`, `convertir.js` et `verification/verifier-retour.mjs` ;
- leurs contrôles dans `verifier-page.mjs` et `verifier-atelier.mjs` aussi ;
- le programme C++ reste gravé dans les cartouches (`compilateur/source-gravee.js`),
  mais plus aucun bouton de la page ne le relit.

## Plus tard encore : les formes géométriques, 2.01 le rond, 2.02 le carré…

- `bibliotheque.js` : quinze formes en tête des modèles, 16 × 16, contour plein
  et intérieur clair — 2.01 ROND, 2.02 CARRE, 2.03 TRIANGLE, 2.04 RECTANGLE,
  2.05 LOSANGE, 2.06 OVALE, 2.07 TRAPEZE, 2.08 PARALLELOGRAMME, 2.09 PENTAGONE,
  2.10 HEXAGONE, 2.11 OCTOGONE, 2.12 DEMI_CERCLE, 2.13 ANNEAU, 2.14 CROIX,
  2.15 ETOILE_5 ;
- la galerie « 🖼 Les modèles » et la recherche montrent leur numéro ;
- un clic en fait un dessin du programme, comme les autres modèles.

## Plus tard encore : la série 2, les formes géométriques dans APPRENDRE

- `tuto/formes.js` (nouveau) : quinze leçons, une forme par leçon, de 2.01 Le
  rond à 2.15 L’étoile. Chacune dit ce qu’est la forme (côtés, coins), comment
  son dessin est écrit, la pose avec `sprite16()` au milieu de l’écran et
  écrit son nom dessous. Les dessins viennent de `bibliotheque.js` : les mêmes
  que la galerie, qui passe aussi à 2.01… 2.15 ;
- une série à part, après tout le parcours : son groupe s’appelle « Série 2 —
  Les formes géométriques » (menu, repères, `tuto.html`), ses leçons portent
  leur numéro (`numero`), et les numéros du parcours ne bougent pas ;
- aucun `#include` nouveau : texte, sprite16 et Perso sont déjà présentés ;
- `documents/TUTORIELS.md` régénéré ; livrets PDF pas régénérés.

## Plus tard encore : la série 2 s’allonge, de 2.16 à 2.34

- dix-neuf formes de plus, dans la galerie et dans APPRENDRE : 2.16 quart de
  cercle, 2.17 triangle rectangle, 2.18 triangle équilatéral, 2.19 cerf-volant,
  2.20 heptagone ; 2.21 croissant, 2.22 goutte, 2.23 cœur, 2.24 spirale,
  2.25 vague ; 2.26 flèche, 2.27 étoile à six branches, 2.28 cadre, 2.29 damier,
  2.30 X ; 2.31 cube, 2.32 pyramide, 2.33 cylindre, 2.34 sphère ;
- les quatre dernières sont en relief : elles prennent « + » pour l’ombre, et
  leurs leçons expliquent comment les nuances font voir les faces ;
- noms pris pour ne pas doubler la galerie : `GRAND_COEUR` (une tuile `COEUR`
  existe), `CROIX_X`, `ETOILE_6`, `TRIANGLE_EQUILATERAL` ;
- `verifier-page.mjs` : le contrôle du réglage « nommer » clique le modèle
  nommé exactement COEUR (il prenait le premier qui contenait le mot, devenu
  2.23 GRAND_COEUR) ;
- `documents/TUTORIELS.md` régénéré ; livrets PDF pas régénérés.

## Plus tard encore : les formes en trois tailles, et le zoom d’un dessin

- `bibliotheque.js` : chaque forme de la série 2 a aussi `tailles: { 8, 32 }`,
  CALCULÉES à partir de la même forme (pas grossies) ; quelques 8 × 8 dessinés
  à la main (étoiles, cœur, croissant, cube) ;
- la galerie « 🖼 Les modèles » : « Taille des formes : 8 × 8 · 16 × 16 ·
  32 × 32 » ; le nom dit la taille (ROND_8, ROND, ROND_32) ;
- `editeur-tuiles.js` : boutons « 🔍 ×2 » et « 🔍 ÷2 » — une COPIE du dessin
  ouvert, deux fois plus grande (chaque pixel doublé) ou plus petite (le plus
  foncé de chaque carré de 2 × 2), nommée NOM_GRAND ou NOM_PETIT ; grisés
  quand la taille sortirait de 8, 16, 32 (`agrandirLeDessin`, `reduireLeDessin`) ;
- `tuto/formes.js` : cinq leçons de plus — 2.35 le petit rond (8 × 8, sprite),
  2.36 le grand rond (32 × 32, sprite32), 2.37 les trois tailles côte à côte,
  2.38 grossir (×2), 2.39 réduire (÷2) ;
- `documents/TUTORIELS.md` régénéré ; livrets PDF pas régénérés.

## Plus tard encore : dessiner une fois, agrandir à la taille qu’on veut

- `editeur-tuiles.js` : `agrandirLisse(rangees, taille, nuance, signes)` — on fait
  le tour de la silhouette, les vrais coins (deux traits d’au moins 2 pixels,
  dont l’un d’au moins 3) restent pointus et les traits qui les touchent
  droits ; les marches et les traits entre deux marches sont arrondis
  (Chaikin, trois fois) ; puis la forme est redessinée à la taille voulue, avec
  un contour d’un pixel et l’intérieur pris aux nuances d’origine. Un dessin
  symétrique le reste ;
- atelier des tuiles : bouton « 📐 Agrandir… » — une réglette (de la taille du
  dessin à 32), l’aperçu, « ✔ Créer la copie » (NOM_24…) ; la copie est posée
  au milieu d’un dessin de 8, 16 ou 32, l’original ne change pas. L’aperçu
  n’est créé qu’à l’ouverture du panneau.
- `tuto/formes.js` : leçon 2.40 « Dessiner une fois, agrandir comme on veut » — le
  rond de 8 × 8 et le même agrandi en 24 × 24 par `agrandirLisse` ; le ROND_8 de
  la galerie redessiné plus rond (l’ancien, presque un losange, donnait un
  losange une fois agrandi) ; `documents/TUTORIELS.md` régénéré.

## Plus tard encore : spriteTaille(), un dessin à la taille qu’on veut

- `compilateur/agrandir.js` (nouveau) : l’algorithme d’agrandissement, sorti de
  `editeur-tuiles.js` — `agrandirForme` (la forme à sa taille exacte) et
  `agrandirLisse` (posée au milieu d’un dessin de 8, 16 ou 32, pour l’atelier) ;
- `spriteTaille(numero, x, y, DESSIN, taille)` : `#include <spriteTaille>` ; le
  dessin n’est écrit QU’UNE fois, à sa taille standard ; à la compilation, la forme
  est agrandie, coupée en carrés de 8 × 8, et chaque carré non vide devient un
  `sprite` avec son dessin sur place, à partir du lutin `numero`. La taille
  s’écrit en clair ; refus nommés au-delà de 40 lutins, ou de 10 sur une ligne ;
  `inclusion.js`, `aide-fonctions.js`, `LISEZMOI.md` ;
- leçon 2.40 réécrite : c’est le tuto de `#include <spriteTaille>` — un seul
  `ROND` de 8 × 8, posé en taille 1 et en taille 3.
- `spriteTaille()` sans limite de taille : en lutins tant qu’ils suffisent, sinon
  dans le FOND — seule la partie visible (160 × 144) est calculée
  (`agrandirForme` prend une « fenêtre »), posée case par case avec des `poser`
  sur place ; x et y en clair, lus sans se ramener à un octet
  (`constanteEntiere`), négatifs permis ; la taille aussi (300 reste 300). Refus
  nommé si les tuiles différentes ne tiennent plus. Leçon 2.40 mise à jour.
- la TAILLE en dernier argument, avec la logique de `spriteTaille()` :
  `sprite(0, 36, 60, ROND, 4)`, `sprite16(…, HEROS, 3)`, `sprite32(…, BOSS, 2)`,
  `spriteDerriere(…, ROND, 4)` (chaque lutin derrière le décor) et
  `poser(2, 3, MUR, 5)` (toujours dans le fond, colonne et ligne en clair). Pour
  les trois `sprite`, seul un nombre écrit en clair de 2 ou plus est une taille :
  `0`, `1` (l’ancien « retourné ») et les noms d’options gardent leur sens. La
  taille est repérée sur le programme ÉCRIT (`deroulerLesRaccourcis`), jamais
  sur les appels que le compilateur fabrique (`sprite16` → `sprite(…, 0x20)`) ;
  `aide-fonctions.js`, `LISEZMOI.md`, leçon 2.40.

## Plus tard encore : la série 3, les images — et quatre jeux faits avec

- `bibliotheque.js` : `IMAGES`, dix-sept images de 16 × 16 dessinées une fois —
  3.01 le Père Noël (style manga), 3.02 le bonhomme de neige, 3.03 le sapin,
  3.04 le cadeau, 3.05 le renne ; 3.06 le pion et 3.07 la dame (dames) ; 3.08 le
  roi, 3.09 la reine, 3.10 la tour, 3.11 le fou, 3.12 le cavalier, 3.13 le pion
  (échecs) ; 3.14 passe, 3.15 inverse, 3.16 +2, 3.17 joker (cartes). Elles sont
  dans la galerie « 🖼 Les modèles » ;
- `tuto/images.js` (nouveau) : la série 3 dans APPRENDRE, « Série 3 — Les
  images », une leçon par image : à sa taille, puis `sprite16(4, 88, 36, NOM, 3)`,
  trois fois plus grande — la taille en dernier argument ;
- `compilateur/agrandir.js` : l’intérieur d’une forme agrandie garde les
  détails sombres qui ne sont pas sur son bord (les yeux, la bouche) ;
- quatre jeux, dans `exemples/` et le menu des exemples, faits de ces images,
  en couleur, l’écran titre montrant deux images ×4 avec `poser(…, 4)` :
  `puissance4.cpp` (le Père Noël contre le bonhomme de neige), `dames.cpp`
  (prises enchaînées, dames), `echecs.cpp` (les six pièces, « ÉCHEC », on prend
  le roi pour gagner), `cartes.cpp` (« Couleurs », style UNO, contre la console) ;
- `verification/verifier-jeux.mjs` (nouveau, dans `npm run verifier`) : une
  vraie partie de chaque jeu, touche par touche — victoire en colonne et en
  diagonale, prise aux dames, coup du berger aux échecs, partie de cartes
  jusqu’au bout sans anomalie ;
- les documents disent « Série 2 », « Série 3 » (`livret.mjs`,
  `cours-complet.mjs`, `tutoriels.mjs`) ; `documents/TUTORIELS.md` et tous les
  livrets PDF régénérés, dans l’ordre du parcours puis des séries.
- `outils/cours.mjs` : chaque leçon est compilée AVEC ses fichiers (`outils.cpp`
  au chapitre 15) — l’outil s’arrêtait là ; les 80 livrets du cours sont
  réimprimés (`--pdf`), avec leurs nouveaux numéros ;
- la galerie : le choix « Taille des formes » est sorti de la liste `#modeles`
  (au-dessus de sa recherche), et la recherche lit aussi le numéro (« 2.01 ROND ») ;
- contrôles adaptés : `verifier-recherche.mjs` (« mario » trouve aussi MARIO
  CALCUL), `verifier-tutoriels.mjs` (« Série 2 », « Série 3 ») ;
- toutes les vérifications passent, sauf deux échecs plus anciens : le compte
  des groupes de leçons dans `verifier-page.mjs`, et `verifier-portage.mjs`, qui
  cherche le projet voisin `../gameboy2/`.

## Plus tard encore : les quatre jeux, rangés aussi dans projets/

- `projets/puissance_4/`, `projets/dames/`, `projets/echecs/`, `projets/couleurs/`,
  sur le modèle de `space_invaders/` : `principal.cpp` (le même que dans
  `exemples/`), `projet.json` (titre, console « gbc »), la cartouche `.gbc` et
  `capture.png` (l’écran titre, par `gb3.mjs --capture 30 --grossir 3`). Ils
  apparaissent dans « 📂 Ouvrir », s’ouvrent et compilent ;
- `exemples/cartes.cpp` : sur l’écran titre, les deux grandes images ont leur
  palette (`P_TITRE`), avec un vrai noir — sur le vert de la table, la teinte 3
  est blanche pour le texte, et le Père Noël y perdait ses yeux.

## Plus tard encore : jouer seul contre la console (des IA)

- Puissance 4, Dames et Échecs : l’écran titre propose « 1 JOUEUR » (par
  défaut) ou « 2 JOUEURS » (HAUT, BAS, START) ; seul, la console joue le second
  camp après une demi-seconde de « réflexion » ;
- Puissance 4 : gagner, sinon bloquer, sinon le centre sans offrir la case du
  dessus (`gagnerait`, `dangereux`) ;
- Dames : chaque coup noté de 0 à 255 (100 = ordinaire) — prise, dame, en prise
  ou non (`enPrise`), avancer ; la prise enchaînée continue avec la même pièce ;
- Échecs : un coup d’avance, `VALEUR[]` (pion 1 … reine 9), pièce laissée en
  prise (`attaquee`), roi laissé en échec = pire coup, promotion ; environ une
  seconde par coup sur la console ;
- `verifier-jeux.mjs` : les parties à deux choisissent « 2 JOUEURS » ; trois
  parties contre l’IA (elle bloque au Puissance 4, prend la pièce offerte aux
  dames, prend la dame offerte en h7 aux échecs) ; les trois projets mis à jour.

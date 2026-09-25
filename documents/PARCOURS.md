# Parcours pas à pas

Deux chemins tout tracés dans les 77 leçons de `TUTORIELS.md`, dans l'ordre où
les lire pour arriver, brique par brique, jusqu'à un jeu entier. Rien de
nouveau n'est enseigné ici : ce sont les mêmes leçons, simplement regroupées
par objectif plutôt que par niveau.

Les deux jeux existent déjà, entièrement écrits et vérifiés :
`exemples/tetris.cpp` et `exemples/mario.cpp`, sélectionnables dans l'atelier
sous « TETRIS — le jeu entier » et « SUPER MARIO — un niveau entier ». Ce
parcours dit comment on y arrive, pas seulement qu'on y arrive.

## Pas à pas : Tetris

1. **1. Écrire à l'écran** · **3. La plus petite cartouche** · **7. Un nombre à l'écran** — afficher le score et le niveau.
2. **20. Poser une tuile** · **22. Une rangée, puis un mur** · **23. Un damier** — construire le puits.
3. **41. Un tableau, et une boucle « for »** · **43. Remplir un tableau, puis le dessiner** · **45. Une grille** · **46. Chercher dans un tableau** — le puits comme grille en mémoire, pas seulement du dessin.
4. **10. Lire un bouton** · **25. Le front, ou pourquoi un appui compte trois fois** · **14. Se souvenir de l'état d'avant** · **16. Deux touches, deux effets** — déplacer et tourner la pièce une fois par appui.
5. **27. Un objet qui tombe** · **31. Une vitesse qui monte** · **70. Ralentir sans compter les images à la main** — la chute, qui accélère avec le niveau.
6. **12. Un dé, et le hasard du matériel** — tirer la prochaine pièce.
7. **55. Une « struct »** · **59. Un tableau de « struct »** · **60. Une méthode** · **61. Les trois façons de faire la même chose** · **62. Une méthode qui en appelle une autre** — une pièce comme objet, avec ses quatre blocs et sa rotation.
8. **69. Les collisions** — empêcher la pièce de traverser un mur ou une pièce déjà posée.
9. **48. Une fonction qui prend des arguments** · **49. Découper son programme** · **51. Une fonction qui rend une valeur** — isoler « une ligne est-elle pleine ? » et « faire tourner la pièce ».
10. **63. Passer d'un écran à l'autre** · **66. Un état de jeu** · **67. Le score, et le panneau** — écran-titre, partie, fin de partie.
11. **34. Le son** · **35. Écrire une musique** · **38. Un bruit** · **39. Une partition qui avance seule** — musique de fond et bruit à la ligne effacée.
12. **71. Se souvenir d'une partie à l'autre** — le meilleur score, qui survit à l'extinction.

→ `exemples/tetris.cpp`.

## Pas à pas : Super Mario

1. **1. Écrire à l'écran** · **7. Un nombre à l'écran** — le score.
2. **20. Poser une tuile** · **22. Une rangée, puis un mur** · **23. Un damier** — le décor solide (sol, blocs, tuyaux).
3. **24. Un lutin, hors de la grille** · **26. Un lutin, au pixel près** — le héros comme lutin, indépendant de la grille du décor.
4. **10. Lire un bouton** · **25. Le front** · **14. Se souvenir de l'état d'avant** · **16. Deux touches, deux effets** — gauche, droite, sauter une fois par appui.
5. **29. Déplacer un lutin** · **30. Le garder dans l'écran** — le déplacement gauche/droite, borné à l'écran.
6. **27. Un objet qui tombe** · **32. Sauter, sans pesanteur** · **64. La pesanteur et le saut** — tomber, puis sauter à hauteur variable.
7. **69. Les collisions** — s'arrêter sur un bloc sous les pieds, ou contre un mur sur le côté.
8. **56. Le décor qui défile** · **57. La caméra : c'est le monde qui bouge** · **33. defiler(), et l'octet qui boucle** — le niveau qui défile pendant que le héros reste au milieu.
9. **68. Des ennemis qui vivent et qui meurent** — les Goombas : avancer, faire demi-tour, mourir sous le pied.
10. **66. Un état de jeu** · **67. Le score, et le panneau** — ramasser une pièce, afficher le score.
11. **63. Passer d'un écran à l'autre** — écran-titre, partie, écran de fin.
12. **34. Le son** · **38. Un bruit** — un bruitage au saut, à la pièce ramassée, à la victoire.

→ `exemples/mario.cpp`.

## Pas à pas : Mega Man

Un jeu complet existe désormais — `projets/mon_mario/principal.cpp` (nommé
« MEGA » dans l'atelier) — mais **pas encore comme leçon ni comme
`exemples/megaman.cpp`** : c'est un projet, pas un exemple vérifié par
`verifier-exemples.mjs` ni raccroché à une leçon du tutoriel. Les étapes
ci-dessous restent donc utiles pour qui veut refaire le même chemin
brique par brique ; la section d'après dit précisément ce que ce projet a
prouvé, et ce qui manquerait encore pour en faire un vrai chemin de leçons.

**Déjà couvert par les leçons existantes :**

1. **1. Écrire à l'écran** · **7. Un nombre à l'écran** — le score et l'énergie affichés.
2. **20. Poser une tuile** · **22. Une rangée, puis un mur** · **23. Un damier** — le décor solide d'une salle.
3. **24. Un lutin, hors de la grille** · **26. Un lutin, au pixel près** — le héros comme lutin.
4. **10. Lire un bouton** · **25. Le front** · **14. Se souvenir de l'état d'avant** · **16. Deux touches, deux effets** — courir, sauter, viser.
5. **29. Déplacer un lutin** · **30. Le garder dans l'écran** · **27. Un objet qui tombe** · **32. Sauter, sans pesanteur** · **69. Les collisions** — le déplacement, la chute et les murs, comme pour Mario.
6. **55. Une « struct »** · **59. Un tableau de « struct »** · **60/61/62. Méthodes** — plusieurs objets qui bougent chacun seuls (base directe pour des ennemis, ou des tirs, comme la leçon **76. Le même jeu, deux fois** le montre avec trois balles).
7. **63. Passer d'un écran à l'autre** · **66. Un état de jeu** — changer de salle, et suivre où l'on en est.
8. **68. Des ennemis qui vivent et qui meurent** · **67. Le score, et le panneau** — des ennemis qu'on élimine, un score qui suit.
9. **34. Le son** · **38. Un bruit** — les bruitages de tir et de dégât.

**Prouvées, dans `projets/mon_mario/principal.cpp` — mais pas encore en leçon :**

- **Un tir déclenché par le joueur** : une `struct Balle`, un tableau de deux, une case libre trouvée puis activée à l'appui de B, avancée à chaque image, désactivée au contact d'un mur ou d'un ennemi. Ce que la leçon 76 ne montrait pas (faire *apparaître* un projectile, pas seulement l'animer) fonctionne, mais aucune leçon ne l'enseigne encore pas à pas.
- **Une jauge qui descend en prenant des dégâts** : cinq cases, pleines ou vides, redessinées seulement quand la valeur change — variante du panneau (leçon 67) qui n'existait pas encore dans ce sens-là.
- **Une invincibilité clignotante** après un coup reçu : un compteur d'images pendant lequel le lutin clignote (un test de parité sur le compteur qui saute un dessin sur deux) et ignore les nouveaux dégâts.

**Restent sans équivalent tout fait :**

- **Plusieurs types d'ennemis à comportements différents** dans le même niveau — `projets/mon_mario` n'en a qu'un (un drone qui patrouille), la leçon 68 aussi.
- **Des salles fixes** plutôt qu'un défilement continu — `projets/mon_mario` fait défiler la caméra en continu, comme Mario, pas comme un vrai Mega Man qui change de salle d'un bloc.

Deux briques manquantes, chacune raisonnable comme prochaine leçon si le jeu devient un vrai objectif — mais aucune ne devrait être ajoutée sans un besoin réel, pour ne pas gonfler le tutoriel de leçons qui ne serviront jamais.

## Autres genres, jamais abordés (parcours théoriques)

Même principe que Mega Man : ce qui existe déjà dans les 78 leçons, et ce qui
manque, sans rien inventer ni gonfler le tutoriel avant d'en avoir besoin.

### RPG (dialogues, combats au tour par tour, inventaire)

**Déjà couvert** : 1, 7 (texte, nombre) · 41, 43, 45, 46 (tableau, grille) —
la carte du monde · 55, 59, 60-62 (struct, tableau de struct, méthodes) —
plusieurs monstres avec leurs PV · 66, 67 (état de jeu, panneau) · 63
(changer d'écran) · 10, 25, 14, 16 (déplacer un curseur de menu).

**Manquant** : un texte qui s'écrit lettre par lettre plutôt que d'un coup
(une boîte de dialogue) · un menu à plusieurs lignes qu'on parcourt avec
HAUT/BAS et qu'on valide (pas juste deux états comme la leçon 16) · un combat
au tour par tour (attendre l'action du joueur, puis celle de l'ennemi,
alterner) · sauvegarder une LISTE d'objets plutôt qu'un seul nombre (la
leçon 71 ne sauvegarde qu'un score).

### Shoot 'em up (vaisseau qui tire, vagues d'ennemis)

**Déjà couvert** : 24, 26, 29, 30 (le vaisseau, ses limites d'écran) · 12
(hasard) — apparition des ennemis · 55, 59, 60-62 (plusieurs ennemis par
méthode, comme la leçon 76) · 68 (ennemis qui vivent et meurent) · 69
(collisions) · 66, 67 (score).

**Manquant** : un tir déclenché par le joueur (même lacune que pour Mega
Man) · plusieurs tirs actifs en même temps, chacun testé contre chaque
ennemi (croiser deux tableaux d'objets, jamais fait) · un défilement
VERTICAL continu (on n'a que l'horizontal, leçons 56/57/73) · une vague
d'ennemis programmée dans le temps (« à l'image 200, fais apparaître ceci »).

### Aventure vue du dessus, façon Zelda

**Déjà couvert** : 24, 26 (le héros) · 10, 25, 14, 16 (contrôles) · 55, 59
(objets, monstres) · 63, 66 (changer de salle, état de jeu) · 12 (hasard).

**Manquant** : un déplacement à quatre directions SANS jamais tomber (Mario
et Mega Man ont toujours une gravité ; ici il ne doit jamais y en avoir,
jamais isolé comme notion) · une case qui déclenche un changement d'écran
au simple contact, sans bouton · ramasser une clé qui débloque une case
AILLEURS sur la carte, plus tard (un objet qui change l'état d'un autre
endroit) · une attaque dirigée vers la dernière direction regardée (retenir
« vers où » et pas seulement « où »).

### Course

**Déjà couvert** : 27, 31 (vitesse qui monte) · 56, 57, 33 (le décor qui
défile) · 69 (sortir de la route) · 66, 67 (panneau).

**Manquant** : un chronomètre qui DESCEND (toutes les leçons de compteur
actuelles montent) affiché en minutes:secondes · un adversaire qui suit un
chemin fixe écrit à l'avance, plutôt qu'un déplacement au hasard · une piste
qui tourne (le sol ne va pas à la même vitesse au centre et sur les bords) —
très spécifique, jamais abordé.

### Sport (deux camps, une balle)

**Déjà couvert** : 76 (une balle qui rebondit, par méthode) · 10, 25, 14, 16
(déplacer une raquette ou un joueur) · 66, 67 (panneau).

**Manquant** : deux scores affichés chacun d'un côté (le panneau actuel n'en
montre qu'un) · une IA simple qui suit la balle toute seule, sans bouton ·
détecter par quel CÔTÉ précis la balle est sortie, pour créditer le bon camp.

### Sokoban (pousser des caisses sur une grille)

**Déjà couvert** : 45, 41, 43, 46 (la grille, le tableau) · 20, 22, 23
(murs, caisses dessinées) · 10, 25, 14, 16 (un appui, une action).

**Manquant** : déplacer d'une case ENTIÈRE par appui plutôt qu'au pixel
(tout ce qui existe bouge au pixel, jamais case par case) · pousser un objet
seulement si la case D'APRÈS est libre (vérifier deux cases à l'avance,
jamais fait) · vérifier que toutes les caisses sont sur leur case-cible pour
gagner (proche de « chercher dans un tableau », leçon 46, mais jamais
utilisé comme condition de victoire).

### Jeu de rythme

**Déjà couvert** : 34, 35, 39 (le son, écrire une musique, une partition qui
avance seule) · 10, 25 (bouton, front).

**Manquant** : comparer le moment d'un appui à un instant précis de la
partition en cours (juger « à l'heure » ou « raté ») — la musique et les
boutons ne se sont jamais parlé dans une leçon · une jauge qui monte ou
descend selon la réussite, image par image.

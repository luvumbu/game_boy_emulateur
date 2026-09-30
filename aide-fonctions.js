/**
 * La fiche de chaque fonction de la console : ses arguments, et ce qu'elle fait.
 *
 * C'est ce que l'éditeur propose en complétant un mot, et ce qu'il montre
 * pendant qu'on remplit les arguments d'un appel — l'argument qu'on écrit en
 * gras. Les formes viennent des messages du compilateur (« sprite16(numero,
 * x, y, tuile) prend quatre arguments… ») et du tableau du LISEZMOI : un
 * argument de plus ou de moins ici, et l'aide mentirait sur ce que le
 * compilateur accepte.
 *
 * `options` : les arguments qu'on peut ajouter à la fin.
 */
export const FONCTIONS = {
  texte: { args: ['colonne', 'ligne', '"…"'], dit: 'écrit un texte à l’écran — 20 colonnes, 18 lignes. Un nombre se colle à la suite : "SCORE " + score. Avec un Mot : texte(SALUT).' },
  nombre: { args: ['colonne', 'ligne', 'valeur'], options: ['chiffres'], dit: 'écrit un nombre calculé, en base dix. Le 4e argument dit combien de chiffres (3 par défaut).' },
  poserS: { args: ['colonne', 'ligne', 'tuile'], dit: 'comme poser(), mais passe à la ligne tout seul : la colonne 20 devient (0, ligne + 1), comme textS.' },
  textS: { args: ['colonne', 'ligne', '"…"'], dit: 'comme texte(), mais passe à la ligne tout seul : après la colonne 19, la suite reprend en colonne 0 de la ligne d’en dessous ; après la ligne 17, en haut.' },
  texteGrand: { args: ['colonne', 'ligne', '"…"', 'taille'], dit: 'écrit un texte AGRANDI de 1 à 20 fois (20 : une lettre remplit l’écran), sans rien dessiner : chaque pixel devient un carré de taille × taille. Une lettre prend taille × taille cases. Le texte et la taille s’écrivent en clair : texteGrand(2, 2, "A", 3).' },
  texteGrandS: { args: ['colonne', 'ligne', '"…"', 'taille'], dit: 'comme texteGrand, mais qui VA À LA LIGNE : les lettres qui ne tiennent plus dans la largeur repartent en colonne 0, une rangée de lettres plus bas, comme textS. Refusé s’il dépasse le bas de l’écran. Tout en clair : texteGrandS(0, 0, "BONJOUR", 3).' },
  effacer: { args: ['colonne', 'ligne', 'quoi'], dit: 'efface un texte à l’écran : « quoi » est le texte lui-même, ou un nombre de cases. Avec un Mot : effacer(SALUT).' },
  poser: { args: ['colonne', 'ligne', 'tuile'], dit: 'pose une tuile sur la grille du fond — un nom de Tuile, ou un numéro.' },
  lire: { args: ['colonne', 'ligne'], dit: 'rend la tuile affichée à cet endroit.' },
  deplace_x: { args: ['colonne', 'ligne', 'tuile', 'pas'], dit: 'pose la tuile, puis la fait bouger d’une case tous les quarts de seconde, « pas » fois : 5 avance vers la droite, -5 recule vers la gauche. S’arrête au bord de l’écran. Rend la colonne d’arrivée : x = deplace_x(x, 0, ALPHABET[0], 5). Seule sur sa ligne avec une variable, deplace_x(x, 0, ALPHABET[0], 5); range elle-même la colonne dans x.' },
  deplace_y: { args: ['colonne', 'ligne', 'tuile', 'pas'], dit: 'comme deplace_x(), mais sur l’axe Y : 5 descend de 5 lignes, -5 monte de 5 lignes. S’arrête au bord de l’écran (ligne 0 ou 17). Rend la ligne d’arrivée : y = deplace_y(0, y, ALPHABET[0], 5). Seule sur sa ligne avec une variable, deplace_y(0, y, ALPHABET[0], 5); range elle-même la ligne dans y.' },
  deplace: { args: ['colonne', 'ligne', 'tuile', 'pasX', 'pasY'], dit: 'les deux axes en une ligne : pasX pour la droite (+) ou la gauche (-), pasY pour le bas (+) ou le haut (-). 5 et 5 : en diagonale. À écrire seule sur sa ligne : deplace(x, y, ALPHABET[0], 5, 0); range la colonne dans x et la ligne dans y.' },
  va_a: { args: ['colonne', 'ligne', 'tuile', 'versColonne', 'versLigne'], dit: 'va jusqu’à la case (versColonne, versLigne), un pas tous les quarts de seconde : en diagonale, puis tout droit. Seule sur sa ligne : va_a(x, y, ALPHABET[0], 10, 5); range l’arrivée dans x et y.' },
  un_pas: { args: ['colonne', 'ligne', 'tuile', 'sensX', 'sensY'], dit: 'UN pas, tout de suite, sans attendre : 1 vers la droite ou le bas, -1 vers la gauche ou le haut, 0 immobile. Ne bloque pas : à appeler dans la boucle, pour faire bouger plusieurs choses à la fois. un_pas(x, y, ALPHABET[0], 1, 0); range la nouvelle place dans x et y.' },
  carre: { args: ['x', 'y', 'tuile', 'taille', 'sens', 'vitesse', 'tours'], dit: 'un carré parfait AUTOUR de (x, y) : taille 1 fait 3 × 3, taille 2 fait 5 × 5 (2 × taille + 1). sens 1 : aiguilles d’une montre, -1 : l’autre sens. vitesse : millisecondes par pas, écrite en clair (250). La lettre part du centre, fait ses tours et y revient. Ou, les sept réglages sous un nom : Carre ronde = { 10, 8, ALPHABET[0], 2, 1, 250, 3 }; carre(ronde);' },
  losange: { args: ['x', 'y', 'tuile', 'taille', 'sens', 'vitesse', 'tours'], dit: 'le carré posé sur la pointe, ses côtés en diagonale, autour de (x, y) : les pointes sont à « taille » cases du centre. Mêmes réglages que carre() ; accepte aussi un Carre : losange(ronde);' },
  rectangle: { args: ['x', 'y', 'tuile', 'largeur', 'hauteur', 'sens', 'vitesse', 'tours'], dit: 'un rectangle autour de (x, y) : largeur 4 et hauteur 2 font 9 × 5 cases (2 × n + 1 chacune). sens 1 ou -1, vitesse en ms écrite en clair, tours. Largeur jusqu’à 9, hauteur jusqu’à 8.' },
  spirale: { args: ['x', 'y', 'tuile', 'taille', 'sens', 'vitesse'], dit: 'part du centre et tourne en s’éloignant (branches de 1, 1, 2, 2, 3, 3… pas) jusqu’au bord d’un carré de « taille », puis revient au centre. sens 1 ou -1, vitesse en ms écrite en clair.' },
  aller_retour: { args: ['x', 'y', 'tuile', 'pasX', 'pasY', 'vitesse', 'fois'], dit: 'va jusqu’à (x + pasX, y + pasY) et revient, « fois » fois : 5, 0 tout droit à droite ; 4, 4 en diagonale vers le bas à droite. Finit à sa place de départ.' },
  vitesse: { args: ['ms'], dit: 'le temps d’un pas, en millisecondes écrites en clair, pour deplace_x, deplace_y, deplace et va_a qui viennent après : 250 au départ (4 pas par seconde), 100 plus vite, 500 plus lentement. Ne fait rien bouger elle-même.' },
  deplace_croix: { args: ['x', 'y', 'tuile', 'vitesse'], dit: 'la lettre suit la croix, case par case : à appeler dans la boucle, après image(). vitesse : le temps entre deux pas, en ms écrites en clair (250 = 4 cases par seconde, 100 = 10). Reste dans l’écran, efface seulement si elle a bougé (pas de clignotement). Seule sur sa ligne : deplace_croix(x, y, ALPHABET[0], 250); range la place dans x et y.' },
  glisse_croix: { args: ['numero', 'px', 'py', 'tuile', 'vitesse'], dit: 'la même chose au pixel près, avec un lutin. vitesse : pixels par image (1 = 60 pixels par seconde, 3 = 180) ; elle peut être une variable. px de 0 à 152, py de 0 à 136. Seule sur sa ligne : glisse_croix(0, px, py, ALPHABET[0], 1); range la place dans px et py.' },
  tourne_carre: { args: ['numero', 'x', 'y', 'tuile', 'cote', 'vitesse'], dit: 'une lettre qui tourne en carré sans fin, sans bloquer : à appeler à chaque image. Au premier appel, elle apparaît en (x, y) ; puis un pas toutes les « vitesse » ms (en clair) : cote pas à droite, en bas, à gauche, en haut. Un côté négatif (-4) part vers la gauche. numero (0 à 3) : la console retient où en est chaque lettre.' },
  defile: { args: ['numero', 'x', 'y', 'tuile', 'sens', 'vitesse'], dit: 'une lettre qui file sur sa ligne sans fin, sans bloquer : à appeler à chaque image. Au premier appel, elle apparaît en (x, y) ; puis un pas toutes les « vitesse » ms, à gauche (sens -1) ou à droite (1), et au bord elle repart de l’autre côté. numero (0 à 3).' },
  chaque: { args: ['ms'], dit: 'répond 1 toutes les « ms » millisecondes (écrites en clair), 0 le reste du temps, sans rien arrêter : if (chaque(250)) { … } se fait 4 fois par seconde. Chaque chaque() du programme a son propre chronomètre (huit au plus).' },
  changerDessin: { args: ['tuile', 'dessin'], dit: 'toutes les cases de cette tuile prennent un autre dessin, d’un coup : c’est ainsi qu’on anime l’eau, le feu, l’herbe.' },
  attendre: { args: ['secondes'], dit: 'attend ce nombre de secondes (jusqu’à 255), puis le programme continue. Pendant ce temps, rien d’autre ne se passe : la manette n’est pas lue.' },
  secondes: { args: ['n'], dit: 'une durée en secondes, convertie en images : secondes(1) vaut 60. Pour comparer à un compteur d’images : if (images == secondes(1)). Jusqu’à 4 secondes (255 images).' },
  ms: { args: ['n'], dit: 'une durée en millièmes de seconde, convertie en images : ms(250) vaut 15, ms(1000) vaut 60. Arrondi à l’image la plus proche (16,7 ms). Jusqu’à 4250 ms.' },
  image: { args: [], dit: 'attend l’image suivante — c’est ce qui cadence un jeu, 60 fois par seconde.' },
  images: { args: [], dit: 'le nombre d’images écoulées depuis l’allumage : une horloge.' },
  retard: { args: [], dit: 'rend 1 si le tour de boucle précédent a duré plus d’une image.' },
  bouton: { args: ['A'], dit: 'rend 1 si le bouton est enfoncé : A, B, HAUT, BAS, GAUCHE, DROITE, START, SELECT.' },
  hasard: { args: [], dit: 'un nombre imprévisible, de 0 à 255.' },
  semer: { args: ['nombre'], dit: 'choisit le point de départ des tirages de hasard().' },
  ecran: { args: ['0 ou 1'], dit: 'éteint (0) ou rallume (1) l’écran, le temps d’un gros redessin.' },
  sprite: { args: ['numero', 'x', 'y', 'tuile'], options: ['MIROIR_X'], dit: 'un lutin 8 × 8 au pixel près. Le 5e argument le retourne : MIROIR_X, MIROIR_Y, DERRIERE.' },
  sprite16: { args: ['numero', 'x', 'y', 'tuile'], options: ['MIROIR_X'], dit: 'un personnage 16 × 16 : quatre lutins en carré (numero à numero + 3). Le 5e argument le retourne.' },
  cacher: { args: ['numero'], dit: 'ôte un lutin de l’écran.' },
  cacher16: { args: ['numero'], dit: 'ôte les quatre lutins d’un personnage 16 × 16.' },
  defiler: { args: ['x', 'y'], dit: 'fait glisser le décor. La carte fait 256 pixels, et revient toute seule à zéro.' },
  panneau: { args: ['x', 'y'], dit: 'place le panneau (la fenêtre par-dessus le décor), en pixels, et l’allume.' },
  cacherPanneau: { args: [], dit: 'ôte le panneau, sans rien perdre de son contenu.' },
  effacerPanneau: { args: [], options: ['colonne', 'ligne', 'quoi'], dit: 'vide le panneau — ou, avec des arguments, y efface un mot.' },
  textePanneau: { args: ['colonne', 'ligne', '"…"'], dit: 'écrit dans le panneau, comme texte() sur le fond.' },
  nombrePanneau: { args: ['colonne', 'ligne', 'valeur'], options: ['chiffres'], dit: 'écrit un nombre dans le panneau, comme nombre() sur le fond.' },
  poserPanneau: { args: ['colonne', 'ligne', 'tuile'], dit: 'pose une tuile dans le panneau.' },
  lirePanneau: { args: ['colonne', 'ligne'], dit: 'rend la tuile du panneau à cet endroit.' },
  couleurFond: { args: ['palette', 'teinte', 'rouge', 'vert', 'bleu'], dit: 'une couleur du décor, sur Game Boy Color : palette 0 à 7, teinte 0 à 3, composantes 0 à 31.' },
  couleurTexte: { args: ['rouge', 'vert', 'bleu'], dit: 'la couleur de TOUTES les lettres, sur Game Boy Color : rouge, vert, bleu de 0 à 31. couleurTexte(31, 0, 0) : du rouge. C’est couleurFond(0, 3, r, v, b) : la teinte 3 de la palette 0.' },
  texteCouleur: { args: ['colonne', 'ligne', '"…"', 'palette'], dit: 'écrit le mot ET met ses cases dans une palette (0 à 7), sur Game Boy Color : le mot prend la couleur de cette palette. texteCouleur(6, 4, "ROUGE", 1) après couleurFond(1, 3, 31, 0, 0).' },
  couleurLutin: { args: ['palette', 'teinte', 'rouge', 'vert', 'bleu'], dit: 'une couleur des personnages, sur Game Boy Color (la teinte 0 est transparente).' },
  teindre: { args: ['colonne', 'ligne', 'palette'], dit: 'la case (colonne, ligne) du fond prend cette palette, sur Game Boy Color. « 2 | DEVANT » : la case passe devant les personnages.' },
  teindrePanneau: { args: ['colonne', 'ligne', 'palette'], dit: 'une case du PANNEAU (le HUD, les dialogues) prend cette palette, sur Game Boy Color.' },
  teindreLutin: { args: ['numero', 'palette'], dit: 'le lutin prend cette palette, sur Game Boy Color — à écrire après son sprite().' },
  paletteFond: { args: ['n0', 'n1', 'n2', 'n3'], dit: 'les quatre nuances du fond, sur Game Boy d’origine, de la plus claire à la plus sombre.' },
  paletteLutins: { args: ['0 ou 1', 'n0', 'n1', 'n2', 'n3'], dit: 'les nuances d’une des deux palettes des lutins, sur Game Boy d’origine.' },
  note: { args: ['voix', 'hauteur', 'duree', 'volume'], dit: 'joue une note sur la voix 1 ou 2.' },
  bruit: { args: ['duree', 'volume'], options: ['grain'], dit: 'frappe sur la voix du bruit ; le 3e argument règle le grain.' },
  silence: { args: ['voix'], dit: 'coupe la voix 1, 2 ou 4.' },
  volumeSon: { args: ['0 à 7'], dit: 'le volume général — de quoi fondre une musique.' },
  jouer: { args: ['voix', 'AIR', 'vitesse'], options: ['boucle'], dit: 'joue un Air sur une voix. Le 4e argument le fait jouer en boucle.' },
  airFini: { args: ['voix'], dit: 'rend 1 quand l’air de cette voix est fini.' },
  sauver: { args: ['numero', 'valeur'], dit: 'écrit une valeur dans la mémoire de la cartouche, gardée à l’extinction.' },
  sauvegarde: { args: ['numero'], dit: 'relit une valeur écrite par sauver().' },
}

/** Les mots tout faits du langage, proposés eux aussi. */
export const CONSTANTES = {
  A: 'le bouton A', B: 'le bouton B', HAUT: 'la flèche du haut', BAS: 'la flèche du bas',
  GAUCHE: 'la flèche de gauche', DROITE: 'la flèche de droite', START: 'le bouton START', SELECT: 'le bouton SELECT',
  MIROIR_X: 'retourné vers la gauche', MIROIR_Y: 'retourné vers le haut',
  DERRIERE: 'le décor passe devant le lutin', PALETTE1: 'la seconde palette des lutins',
  DEVANT: 'teindre(c, l, 2 | DEVANT) : la case passe devant les personnages',
  ALPHABET: 'les 26 lettres de la console : ALPHABET[0] est A, ALPHABET[25] est Z',
}

/** La forme d'appel : « sprite16(numero, x, y, tuile[, MIROIR_X]) ». */
export function forme(nom) {
  const f = FONCTIONS[nom]
  if (!f) return nom
  const options = f.options?.length ? `[, ${f.options.join(', ')}]` : ''
  return `${nom}(${f.args.join(', ')}${options})`
}

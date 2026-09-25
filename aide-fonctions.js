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
  texte: { args: ['colonne', 'ligne', '"…"'], dit: 'écrit un texte à l’écran — 20 colonnes, 18 lignes. Un nombre se colle à la suite : "SCORE " + score.' },
  nombre: { args: ['colonne', 'ligne', 'valeur'], options: ['chiffres'], dit: 'écrit un nombre calculé, en base dix. Le 4e argument dit combien de chiffres (3 par défaut).' },
  effacer: { args: ['colonne', 'ligne', 'quoi'], dit: 'efface un texte à l’écran : « quoi » est le texte lui-même, ou un nombre de cases.' },
  poser: { args: ['colonne', 'ligne', 'tuile'], dit: 'pose une tuile sur la grille du fond — un nom de Tuile, ou un numéro.' },
  lire: { args: ['colonne', 'ligne'], dit: 'rend la tuile affichée à cet endroit.' },
  changerDessin: { args: ['tuile', 'dessin'], dit: 'toutes les cases de cette tuile prennent un autre dessin, d’un coup : c’est ainsi qu’on anime l’eau, le feu, l’herbe.' },
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
}

/** La forme d'appel : « sprite16(numero, x, y, tuile[, MIROIR_X]) ». */
export function forme(nom) {
  const f = FONCTIONS[nom]
  if (!f) return nom
  const options = f.options?.length ? `[, ${f.options.join(', ')}]` : ''
  return `${nom}(${f.args.join(', ')}${options})`
}

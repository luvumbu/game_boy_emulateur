/**
 * Des dessins tout faits, à prendre.
 *
 * Dessiner son premier personnage pixel par pixel est une belle chose ; le
 * faire AVANT d'avoir vu un jeu bouger en décourage beaucoup. Ici on choisit
 * une image, elle entre dans le programme — avec ses rangées, son nom et son
 * numéro —, et la console la montre dans la seconde. Ensuite seulement on la
 * repeint, si l'on veut : c'est un point de départ, pas une bibliothèque
 * fermée.
 *
 * Les dessins sont écrits avec les signes plutôt qu'avec les chiffres :
 *
 *   « . » le vide      « - » clair      « + » moyen      « # » plein
 *
 * On les relit de loin, et c'est bien le but — ce fichier est fait pour être
 * regardé autant que lu.
 */

/** Les personnages : seize sur seize, quatre numéros de tuile chacun. */
const PERSONNAGES = [
  {
    nom: 'HEROS',
    quoi: 'de face, prêt à partir',
    rangees: [
      '.....####.......',
      '....######......',
      '...##++++##.....',
      '...#+#--#+#.....',
      '...#+#--#+#.....',
      '...##++++##.....',
      '....######......',
      '..###++++###....',
      '.##.#++++#.##...',
      '.##.#++++#.##...',
      '.##.######.##...',
      '.....####.......',
      '.....#..#.......',
      '.....#..#.......',
      '....###.###.....',
      '....###.###.....',
    ],
  },
  {
    nom: 'FANTOME',
    quoi: 'il flotte, et il vous regarde',
    rangees: [
      '.....####.......',
      '...##++++##.....',
      '..#++++++++#....',
      '.#++++++++++#...',
      '.#+##++##+++#...',
      '.#+#--#-##++#...',
      '.#+#--#-##++#...',
      '.#+##++##+++#...',
      '.#++++++++++#...',
      '.#++++++++++#...',
      '.#++++++++++#...',
      '.#++++++++++#...',
      '.#+#++#++#++#...',
      '.##.##.##.###...',
      '................',
      '................',
    ],
  },
  {
    nom: 'ENNEMI',
    quoi: 'des dents, et deux pattes',
    rangees: [
      '................',
      '..##........##..',
      '..###......###..',
      '..#+##....##+#..',
      '..#++######++#..',
      '.##++++++++++##.',
      '.#++#--##--#++#.',
      '.#++#--##--#++#.',
      '.#++++++++++++#.',
      '.#+##########+#.',
      '.#+#-#-##-#-#+#.',
      '.##++++++++++##.',
      '..############..',
      '...##......##...',
      '..###......###..',
      '................',
    ],
  },
  {
    nom: 'VAISSEAU',
    quoi: 'pour un jeu de tir',
    rangees: [
      '.......##.......',
      '.......##.......',
      '......####......',
      '......#++#......',
      '.....##++##.....',
      '.....#+--+#.....',
      '....##+--+##....',
      '....#++++++#....',
      '...##++++++##...',
      '..##++####++##..',
      '..#++#....#++#..',
      '.##+##....##+##.',
      '.#+##......##+#.',
      '.###........###.',
      '..#..........#..',
      '................',
    ],
  },
  {
    nom: 'AVION',
    quoi: 'vu du dessus, le nez en haut',
    rangees: [
      '.......##.......',
      '......#++#......',
      '......#--#......',
      '......#--#......',
      '......#++#......',
      '.....##++##.....',
      '...###++++###...',
      '.##++++++++++##.',
      '#++++++++++++++#',
      '####..#++#..####',
      '......#++#......',
      '......#++#......',
      '....###++###....',
      '...#++++++++#...',
      '...##########...',
      '................',
    ],
  },
]

/** Les tuiles : huit sur huit, une case du décor. */
const TUILES = [
  {
    nom: 'MUR',
    quoi: 'des briques',
    rangees: [
      '########',
      '#++#+++#',
      '#++#+++#',
      '########',
      '+++#++++',
      '+++#++++',
      '########',
      '#++#+++#',
    ],
  },
  {
    nom: 'CAISSE',
    quoi: 'à pousser',
    rangees: [
      '########',
      '#+----+#',
      '#-#--#-#',
      '#--##--#',
      '#--##--#',
      '#-#--#-#',
      '#+----+#',
      '########',
    ],
  },
  {
    nom: 'PIECE',
    quoi: 'à ramasser',
    rangees: [
      '..####..',
      '.#++++#.',
      '#++##++#',
      '#++##++#',
      '#++##++#',
      '#++##++#',
      '.#++++#.',
      '..####..',
    ],
  },
  {
    nom: 'COEUR',
    quoi: 'une vie',
    rangees: [
      '.##..##.',
      '#--##--#',
      '#-####-#',
      '#++++++#',
      '.#++++#.',
      '..#++#..',
      '...##...',
      '........',
    ],
  },
  {
    nom: 'ARBRE',
    quoi: 'du décor',
    rangees: [
      '...##...',
      '..####..',
      '.##++##.',
      '#++##++#',
      '.##++##.',
      '...##...',
      '...##...',
      '..####..',
    ],
  },
  {
    nom: 'EAU',
    quoi: 'des vagues',
    rangees: [
      '++++++++',
      '+##++##+',
      '#++##++#',
      '++++++++',
      '++##++##',
      '+##++##+',
      '++++++++',
      '++++++++',
    ],
  },
  {
    nom: 'ECHELLE',
    quoi: 'pour monter',
    rangees: [
      '##....##',
      '##....##',
      '########',
      '##....##',
      '##....##',
      '########',
      '##....##',
      '##....##',
    ],
  },
  {
    nom: 'CLE',
    quoi: 'ouvre la porte',
    rangees: [
      '.####...',
      '#+--+#..',
      '#-##-#..',
      '#+--+#..',
      '.####...',
      '..##....',
      '..####..',
      '..#..#..',
    ],
  },
  {
    nom: 'PORTE',
    quoi: 'la sortie',
    rangees: [
      '########',
      '#++++++#',
      '#+#--#+#',
      '#+#--#+#',
      '#+#--#+#',
      '#+#--##+',
      '#++++++#',
      '########',
    ],
  },
  {
    nom: 'ETOILE',
    quoi: 'un bonus',
    rangees: [
      '...##...',
      '...##...',
      '#..##..#',
      '########',
      '.######.',
      '..####..',
      '.##..##.',
      '##....##',
    ],
  },
  {
    nom: 'SOL',
    quoi: 'de l’herbe',
    rangees: [
      '-+-++-+-',
      '########',
      '#++##+++',
      '++##+++#',
      '#+++##++',
      '++#+++##',
      '#+++#+++',
      '++##++#+',
    ],
  },
  {
    nom: 'POINTE',
    quoi: 'à éviter',
    rangees: [
      '........',
      '...##...',
      '..####..',
      '..#--#..',
      '.##--##.',
      '.#----#.',
      '##----##',
      '########',
    ],
  },
]

/**
 * Le catalogue, tel qu'on le montre : les personnages d'abord.
 *
 * Un `Perso` occupe quatre numéros de tuile, un `Tuile` un seul — c'est le
 * compilateur qui compte, et l'atelier compte comme lui. Voir les deux dans la
 * même liste sans le dire tromperait sur ce qu'on prend.
 */
export const MODELES = [
  ...PERSONNAGES.map((m) => ({ ...m, cote: 16, type: 'Perso' })),
  ...TUILES.map((m) => ({ ...m, cote: 8, type: 'Tuile' })),
]

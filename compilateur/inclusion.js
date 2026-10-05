/**
 * Écrire un programme sur plusieurs fichiers.
 *
 *   #include "dessins.cpp"
 *
 * C'est une directive de **texte**, résolue avant le lexeur : le contenu du
 * fichier prend la place de la ligne, et le compilateur ne voit qu'un seul
 * programme. Un découpage en quatre fichiers rend donc exactement la même
 * cartouche que le fichier collé — à l'octet près, et c'est vérifié.
 *
 * C'est bien ce que fait « #include » en C++ : le préprocesseur colle le
 * fichier, et le compilateur ne voit qu'un texte. Il n'y a donc ni unités de
 * compilation séparées, ni éditeur de liens — un fichier versé deux fois ne
 * l'est qu'une, ce qui rend les gardes d'inclusion inutiles, et les cycles
 * inoffensifs.
 *
 * Ce module ne touche jamais au disque : c'est l'appelant qui fournit les
 * fichiers. La ligne de commande les lit, la page les demande au serveur.
 */

const MOTIF = /^[ \t]*#\s*include\s*(?:"([^"]+)"|<([^>]+)>)[ \t]*(?:\/\/.*)?$/

/*
 * Les fonctions de la console : aucune n'est là d'office.
 *
 *   #include <texte>          texte() existe
 *   #include <ALPHABET>       ALPHABET existe
 *
 * Une fonction de la console prend de la place dans la cartouche — son code,
 * ses routines, ses tables. La règle est donc celle du C : ce qu'on veut
 * employer, on l'inclut, par son nom, écrit exactement comme dans le
 * programme. Sans la ligne, le compilateur refuse l'appel et dit quelle ligne
 * écrire. Avec elle, il ne grave que ce que le programme emploie vraiment :
 * une ligne de trop ne coûte rien.
 *
 * Ce n'est pas un fichier : la ligne reste dans le texte, et c'est le
 * compilateur qui la lit.
 *
 * Restent natives, parce qu'elles ne coûtent rien : image(), images(),
 * retard(), ms() et secondes() — la boucle du jeu et ses horloges.
 */
export const BIBLIOTHEQUES = {
  /* écrire et poser sur le fond */
  texte: 'écrit un texte à l’écran',
  textS: 'écrit un texte qui passe à la ligne tout seul',
  texteGrand: 'écrit un texte agrandi, taille de 0 à 10',
  texteGrandS: 'écrit un texte agrandi qui passe à la ligne',
  texteCouleur: 'écrit un mot dans une palette de couleur',
  nombre: 'écrit un nombre en chiffres',
  effacer: 'efface des cases, ou tout le fond',
  poser: 'pose une tuile sur une case du fond',
  poserS: 'pose une tuile, et passe à la ligne au bord',
  bande: 'pose la même tuile plusieurs fois, de gauche à droite',
  poserDevant: 'pose une tuile qui passe devant les lutins (Game Boy Color)',
  lire: 'lit la tuile posée sur une case',
  changerDessin: 'change le dessin d’une tuile partout à la fois',
  defiler: 'fait glisser tout le fond',
  ecran: 'éteint ou rallume l’écran',
  /* le panneau, par-dessus le fond */
  panneau: 'montre le panneau, à une place choisie',
  cacherPanneau: 'cache le panneau',
  effacerPanneau: 'efface des cases du panneau, ou tout le panneau',
  textePanneau: 'écrit un texte sur le panneau',
  nombrePanneau: 'écrit un nombre sur le panneau',
  poserPanneau: 'pose une tuile sur le panneau',
  lirePanneau: 'lit une tuile du panneau',
  /* les dessins et les lettres */
  ALPHABET: 'les lettres de la police : ALPHABET[0] est le A',
  ALPHABET_GRAS: 'l’alphabet en gras : ALPHABET_GRAS[0] est le A gras',
  ALPHABET_TITRE: 'l’alphabet des titres : lettres épaisses, avec une ombre ; ALPHABET_TITRE[0] est le A',
  texteTitre: 'écrit un mot en GROSSES lettres de titre (taille 2, 3 ou 4 cases de côté)',
  texteManga: 'écrit un mot en lettres de titre MANGA : penchées, coins coupés, une trame (taille 2, 3 ou 4)',
  Tuile: 'un dessin de 8 × 8 pixels',
  Perso: 'un personnage : un dessin de 16 × 16 ou de 32 × 32 pixels',
  Grand: 'un autre nom pour un Perso de 32 × 32 pixels',
  Mot: 'un texte et sa place, sous un seul nom',
  /* les lutins */
  sprite: 'place un lutin de 8 × 8 au pixel près',
  spriteDerriere: 'place un lutin de 8 × 8 derrière le décor',
  sprite16: 'place un lutin de 16 × 16 au pixel près',
  sprite32: 'place un grand personnage de 32 × 32 au pixel près',
  cacher: 'cache un lutin',
  cacher16: 'cache un lutin de 16 × 16',
  cacher32: 'cache un grand personnage de 32 × 32',
  /* les couleurs (Game Boy Color) et les nuances */
  couleurFond: 'choisit une couleur d’une palette du fond',
  couleurTexte: 'choisit la couleur des lettres',
  couleurLutin: 'choisit une couleur d’une palette des lutins',
  teindre: 'met une case du fond dans une palette',
  teindrePanneau: 'met une case du panneau dans une palette',
  teindreLutin: 'met un lutin dans une palette',
  paletteFond: 'choisit les quatre nuances du fond',
  paletteLutins: 'choisit les quatre nuances des lutins',
  /* bouger */
  deplace_x: 'fait avancer une tuile sur sa ligne',
  deplace_y: 'fait avancer une tuile sur sa colonne',
  deplace: 'fait avancer une tuile sur les deux axes',
  va_a: 'mène une tuile jusqu’à une case',
  un_pas: 'fait faire un seul pas à une tuile',
  vitesse: 'règle la vitesse des déplacements',
  deplace_croix: 'une tuile qui suit la croix, case par case',
  glisse_croix: 'un lutin qui suit la croix, au pixel près',
  carre: 'une tuile qui tourne en carré',
  Carre: 'les sept réglages d’un carré sous un seul nom',
  losange: 'une tuile qui tourne en losange',
  rectangle: 'une tuile qui tourne en rectangle',
  spirale: 'une tuile qui tourne en spirale',
  aller_retour: 'une tuile qui va et revient',
  tourne_carre: 'une tuile qui tourne en carré sans arrêter le jeu',
  defile: 'une tuile qui file sur sa ligne sans arrêter le jeu',
  /* le temps, la manette, le hasard */
  chaque: 'répond 1 toutes les n millisecondes',
  attendre: 'attend des secondes entières',
  bouton: 'lit un bouton de la manette',
  hasard: 'tire un nombre au hasard',
  semer: 'choisit le départ du hasard',
  /* le son */
  note: 'joue une note',
  bruit: 'joue un bruit',
  silence: 'fait taire une voix',
  volumeSon: 'règle le volume général',
  Air: 'un air de musique, note par note',
  jouer: 'joue un air tout seul',
  airFini: 'dit si un air est fini',
  /* la mémoire de la cartouche */
  sauver: 'garde un nombre dans la cartouche, même éteinte',
  sauvegarde: 'relit un nombre gardé dans la cartouche',
  /* les calculs que le processeur ne sait pas faire seul */
  multiplier: 'a * b, quand les deux se calculent',
  diviser: 'a / b, sauf par 1, 2, 4, 8, 16… écrits en clair',
  reste: 'a % b, sauf par 1, 2, 4, 8, 16… écrits en clair',
  decaler: 'a << b et a >> b, quand b se calcule',
}

/** « #include <texte> » : une demande au compilateur, pas un fichier. */
const estUneBibliotheque = (coup) => Boolean(coup && coup[2] && Object.hasOwn(BIBLIOTHEQUES, coup[2].trim()))

/** Les fichiers qu'un programme demande, dans l'ordre, sans doublon. */
export function fichiersDemandes(texte) {
  const demandes = []

  for (const ligne of texte.split('\n')) {
    const coup = ligne.match(MOTIF)
    if (estUneBibliotheque(coup)) continue
    const nom = coup && (coup[1] ?? coup[2])
    if (nom && !demandes.includes(nom)) demandes.push(nom)
  }

  return demandes
}

/**
 * Assemble le programme principal et tout ce qu'il inclut.
 *
 * `lire(nom)` doit rendre le texte d'un fichier, ou lever une erreur claire.
 * Rend le texte complet et, pour chaque ligne, d'où elle vient — c'est ce qui
 * permet de dire « dessins.js, ligne 7 » plutôt que « ligne 214 » dans un
 * fichier que personne n'a écrit.
 */
export function rassembler(lire, principal) {
  const lignes = []
  const origine = []
  const deja = new Set()

  const verser = (nom) => {
    /*
     * Versé une seule fois, quel que soit le nombre de demandes. C'est ce
     * qu'on veut — deux fichiers qui partagent une même dépendance ne doivent
     * pas la déclarer en double —, et c'est aussi ce qui rend les cycles
     * inoffensifs : un fichier qui reviendrait sur lui-même est déjà dans la
     * liste, et l'on s'arrête là. Il n'y a donc pas de garde-fou séparé
     * contre les cycles : il serait inatteignable.
     */
    if (deja.has(nom)) return

    deja.add(nom)

    const texte = lire(nom)
    const sesLignes = texte.replace(/\r\n/g, '\n').split('\n')

    sesLignes.forEach((ligne, i) => {
      const coup = ligne.match(MOTIF)

      /* Une bibliothèque reste écrite : le compilateur la lira. */
      if (coup && !estUneBibliotheque(coup)) {
        verser(coup[1] ?? coup[2])
        return
      }

      lignes.push(ligne)
      origine.push({ fichier: nom, ligne: i + 1 })
    })
  }

  verser(principal)
  return { texte: lignes.join('\n'), origine }
}

/**
 * Un programme et ses fichiers voisins donnés d'avance, assemblés.
 *
 *   assemblerAvec(code, { 'variables.h': '…' })
 *
 * C'est le cas d'une leçon : ses fichiers ne sont ni sur un disque ni dans des
 * onglets, ils sont écrits avec elle. Le principal s'appelle « principal.cpp »,
 * comme dans l'atelier, pour que les fautes y renvoient sous le même nom.
 */
export function assemblerAvec(code, fichiers = {}) {
  const PRINCIPAL = 'principal.cpp'
  return rassembler((nom) => {
    if (nom === PRINCIPAL) return code
    if (!Object.hasOwn(fichiers, nom)) {
      const connus = Object.keys(fichiers)
      throw new Error(
        `fichier introuvable : « ${nom} »` +
          (connus.length ? `. Cette leçon a : ${connus.join(', ')}.` : ' : cette leçon n\'a pas d\'autre fichier.'),
      )
    }
    return fichiers[nom]
  }, PRINCIPAL)
}

/**
 * Réécrit « ligne 214 » en « dessins.js, ligne 7 ».
 *
 * Sans cela, une faute dans un fichier inclus renverrait à un numéro de ligne
 * du texte assemblé — c'est-à-dire d'un fichier que personne n'a sous les
 * yeux, et le message deviendrait plus déroutant qu'utile.
 */
export function traduire(message, origine) {
  return message.replace(/ligne (\d+)/g, (entier, numero) => {
    const source = origine[Number(numero) - 1]
    return source ? `${source.fichier}, ligne ${source.ligne}` : entier
  })
}

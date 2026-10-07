/**
 * Les deux consoles — et rien d'autre.
 *
 * C'est le SEUL endroit qui dit ce qu'est une cartouche « en couleur » et ce
 * qu'est une cartouche « en 4 nuances ». Le compilateur, la page, le parcours,
 * l'outil en ligne de commande et les contrôles viennent tous lire ici :
 * deux copies de cette règle finiraient par se contredire, et c'est
 * exactement ce qui rendait le passage de l'une à l'autre flou.
 *
 * La règle, en entier :
 *
 *   🎮 gb    Game Boy         $0143 = $00   « .gb »    4 nuances, rien de plus.
 *                                                       Une fonction de couleur
 *                                                       est REFUSÉE, avec sa ligne.
 *
 *   🌈 gbc   Game Boy Color   $0143 = $C0   « .gbc »   8 palettes de 4 couleurs
 *                                                       pour le décor, 8 pour les
 *                                                       personnages.
 *
 * L'un OU l'autre, jamais les deux : il n'y a pas de troisième sorte de
 * cartouche, ni de cartouche « couleur qui marche aussi en nuances ».
 *
 * Qui choisit ?
 *
 *   - Dans l'atelier : la liste en haut de la page (ou le bouton « Nouveau »).
 *   - Partout ailleurs (le parcours, les contrôles, gb3.mjs sans --console) :
 *     LE PROGRAMME. S'il appelle une seule fonction de couleur, c'est une
 *     cartouche Game Boy Color ; sinon, une cartouche Game Boy.
 */

/** L'adresse de l'octet qui le dit, dans l'en-tête de la cartouche. */
export const OCTET_CONSOLE = 0x0143

export const CONSOLES = {
  gb: {
    cle: 'gb',
    nom: 'Game Boy',
    icone: '🎮',
    etiquette: '🎮 Game Boy — 4 nuances',
    extension: '.gb',
    octet: 0x00,
  },
  gbc: {
    cle: 'gbc',
    nom: 'Game Boy Color',
    icone: '🌈',
    etiquette: '🌈 Game Boy Color — en couleur',
    extension: '.gbc',
    octet: 0xc0,
  },
}

/**
 * Pour quelle console une cartouche est-elle faite ? — 'gb' ou 'gbc'.
 *
 * Lu dans ses octets, comme le fait la vraie console : le bit 7 de $0143.
 * Une cartouche du commerce peut porter $80 (« profite de la couleur ») : elle
 * démarre elle aussi en couleur sur une Game Boy Color, c'est donc 'gbc'. Ce
 * compilateur, lui, n'écrit jamais que $00 ou $C0.
 */
export function consoleDeLaCartouche(rom) {
  return (rom[OCTET_CONSOLE] & 0x80) !== 0 ? 'gbc' : 'gb'
}

/** Refuse tout autre nom que 'gb' ou 'gbc' — « les-deux » compris. */
export function verifierLaConsole(cle, d_ou = 'la console') {
  if (!(cle in CONSOLES)) {
    throw new Error(
      `${d_ou} « ${cle} » n'existe pas : c'est « gb » (Game Boy, 4 nuances) ou « gbc » ` +
        '(Game Boy Color). L’un ou l’autre, jamais les deux.',
    )
  }
  return CONSOLES[cle]
}

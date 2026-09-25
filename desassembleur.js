/**
 * Relire une cartouche : des octets aux instructions.
 *
 *   node desassembler.mjs exemples/minimal.gb
 *
 * C'est l'inverse de `emetteur.js`, et il faut dire tout de suite ce que cet
 * inverse ne rend PAS : **le programme C++ n'est pas dans la cartouche**. La
 * compilation jette les noms, les commentaires, les portées, la forme des
 * boucles. Ce qui reste est ce que le processeur exécute — et rien d'autre.
 *
 * Ce module rend donc les INSTRUCTIONS, exactement, avec :
 *
 *   - les registres du matériel nommés — « ldh [ECRAN], a » plutôt que $FF40 ;
 *   - une étiquette à chaque endroit où le programme saute ;
 *   - et, quand on lui donne la table des noms du compilateur, les VRAIS noms
 *     des variables et des fonctions du programme d'origine.
 *
 * Ce dernier point change tout : sur une cartouche qu'on vient de compiler ici,
 * « ld a, [$FF8B] » se relit « ld a, [posX] ». Ce n'est toujours pas du C++,
 * mais on reconnaît son programme dedans.
 */

/* ------------------------------------------------ ce que le matériel porte */

/** Les registres de la page $FF00, ceux qu'un jeu touche vraiment. */
const REGISTRES = {
  0x00: 'MANETTE', 0x04: 'DIV', 0x05: 'TIMA', 0x06: 'TMA', 0x07: 'TAC',
  0x0f: 'INTERRUPTIONS',
  0x10: 'SON1_BALAYAGE', 0x11: 'SON1_LONGUEUR', 0x12: 'SON1_ENVELOPPE',
  0x13: 'SON1_BASSE', 0x14: 'SON1_HAUTE',
  0x16: 'SON2_LONGUEUR', 0x17: 'SON2_ENVELOPPE', 0x18: 'SON2_BASSE', 0x19: 'SON2_HAUTE',
  0x20: 'BRUIT_LONGUEUR', 0x21: 'BRUIT_ENVELOPPE', 0x22: 'BRUIT_BASSE', 0x23: 'BRUIT_HAUTE',
  0x24: 'SON_VOLUME', 0x25: 'SON_ROUTAGE', 0x26: 'SON_ALLUME',
  0x40: 'ECRAN', 0x41: 'ETAT_ECRAN', 0x42: 'DEFILEMENT_Y', 0x43: 'DEFILEMENT_X',
  0x44: 'LIGNE_ECRAN', 0x45: 'LIGNE_VISEE', 0x46: 'TRANSFERT',
  0x47: 'PALETTE_FOND', 0x48: 'PALETTE_OBJETS0', 0x49: 'PALETTE_OBJETS1',
  0x4a: 'FENETRE_Y', 0x4b: 'FENETRE_X',
  0xff: 'INTERRUPTIONS_PERMISES',
}

/** Les huit registres, dans l'ordre où les opcodes les rangent. */
const R8 = ['b', 'c', 'd', 'e', 'h', 'l', '[hl]', 'a']
const R16 = ['bc', 'de', 'hl', 'sp']
const R16_PILE = ['bc', 'de', 'hl', 'af']
const CONDITIONS = ['nz', 'z', 'nc', 'c']

/*
 * Les opcodes qui ne suivent aucun motif.
 *
 * Le processeur range bien ses instructions : tout le bloc $40 à $7F est un
 * « ld r, r », tout le bloc $80 à $BF une opération sur `a`. Ce qui reste tient
 * dans cette table — et l'écrire à la main est plus sûr que de deviner une
 * règle qui n'existe pas.
 *
 * « n » sera remplacé par l'octet qui suit, « nn » par les deux octets, et
 * « e » par le saut relatif calculé.
 */
const PARTICULIERS = {
  0x00: ['nop', null], 0x07: ['rlca', null], 0x0f: ['rrca', null], 0x10: ['stop', null],
  0x17: ['rla', null], 0x1f: ['rra', null],
  0x27: ['daa', null], 0x2f: ['cpl', null], 0x37: ['scf', null], 0x3f: ['ccf', null],
  0x76: ['halt', null],
  0x08: ['ld [nn], sp', 'nn'],
  0x18: ['jr e', 'e'],
  0xc3: ['jp nn', 'nn'], 0xc9: ['ret', null], 0xcd: ['call nn', 'nn'],
  0xd9: ['reti', null],
  0xe9: ['jp hl', null],
  0xf9: ['ld sp, hl', null],
  0xe0: ['ldh [n], a', 'n'], 0xf0: ['ldh a, [n]', 'n'],
  0xe2: ['ldh [c], a', null], 0xf2: ['ldh a, [c]', null],
  0xea: ['ld [nn], a', 'nn'], 0xfa: ['ld a, [nn]', 'nn'],
  0xe8: ['add sp, e', 'e'], 0xf8: ['ld hl, sp + e', 'e'],
  0xf3: ['di', null], 0xfb: ['ei', null],
  0xc6: ['add a, n', 'n'], 0xce: ['adc a, n', 'n'], 0xd6: ['sub n', 'n'], 0xde: ['sbc a, n', 'n'],
  0xe6: ['and n', 'n'], 0xee: ['xor n', 'n'], 0xf6: ['or n', 'n'], 0xfe: ['cp n', 'n'],
}

const OPERATIONS = ['add a,', 'adc a,', 'sub', 'sbc a,', 'and', 'xor', 'or', 'cp']
const DECALAGES = ['rlc', 'rrc', 'rl', 'rr', 'sla', 'sra', 'swap', 'srl']

/** Le nom d'une instruction préfixée par $CB : décalages et bits. */
function apresCB(octet) {
  const reg = R8[octet & 7]
  const groupe = octet >> 6
  const bit = (octet >> 3) & 7
  if (groupe === 0) return `${DECALAGES[bit]} ${reg}`
  if (groupe === 1) return `bit ${bit}, ${reg}`
  if (groupe === 2) return `res ${bit}, ${reg}`
  return `set ${bit}, ${reg}`
}

/**
 * Le nom d'une instruction, et sa longueur en octets.
 *
 * Rien n'est deviné : chaque cas rend la longueur exacte, parce que c'est elle
 * qui dit où commence l'instruction suivante. Se tromper d'un octet, et tout
 * ce qui suit devient du charabia — c'est le seul vrai piège d'un
 * désassembleur.
 */
export function instruction(octets, ou) {
  const o = octets[ou]

  if (o === 0xcb) return { texte: apresCB(octets[ou + 1]), taille: 2 }

  if (PARTICULIERS[o] !== undefined) {
    const [texte, forme] = PARTICULIERS[o]
    /* La forme est écrite, jamais devinée : « nop » contient un « n » sans
       prendre d'octet derrière, et une longueur fausse décale tout le reste du
       désassemblage — c'est le seul vrai piège de l'exercice. */
    return { texte, taille: forme === 'nn' ? 3 : forme ? 2 : 1, modele: forme }
  }

  /* ld r, r et halt — le bloc $40 à $7F */
  if (o >= 0x40 && o <= 0x7f) return { texte: `ld ${R8[(o >> 3) & 7]}, ${R8[o & 7]}`, taille: 1 }

  /* les opérations sur `a` — le bloc $80 à $BF */
  if (o >= 0x80 && o <= 0xbf) return { texte: `${OPERATIONS[(o >> 3) & 7]} ${R8[o & 7]}`, taille: 1 }

  /* ld r, n */
  if ((o & 0xc7) === 0x06) return { texte: `ld ${R8[(o >> 3) & 7]}, n`, taille: 2, modele: 'n' }

  /* ld rr, nn */
  if ((o & 0xcf) === 0x01) return { texte: `ld ${R16[(o >> 4) & 3]}, nn`, taille: 3, modele: 'nn' }

  /* inc / dec sur un octet, et sur une paire */
  if ((o & 0xc7) === 0x04) return { texte: `inc ${R8[(o >> 3) & 7]}`, taille: 1 }
  if ((o & 0xc7) === 0x05) return { texte: `dec ${R8[(o >> 3) & 7]}`, taille: 1 }
  if ((o & 0xcf) === 0x03) return { texte: `inc ${R16[(o >> 4) & 3]}`, taille: 1 }
  if ((o & 0xcf) === 0x0b) return { texte: `dec ${R16[(o >> 4) & 3]}`, taille: 1 }

  /* add hl, rr */
  if ((o & 0xcf) === 0x09) return { texte: `add hl, ${R16[(o >> 4) & 3]}`, taille: 1 }

  /* les accès par une paire : ld [bc], a … ld a, [hl-] */
  if ((o & 0xcf) === 0x02) {
    const ou_ = ['[bc]', '[de]', '[hl+]', '[hl-]'][(o >> 4) & 3]
    return { texte: `ld ${ou_}, a`, taille: 1 }
  }
  if ((o & 0xcf) === 0x0a) {
    const ou_ = ['[bc]', '[de]', '[hl+]', '[hl-]'][(o >> 4) & 3]
    return { texte: `ld a, ${ou_}`, taille: 1 }
  }

  /* les sauts, les appels et les retours, avec leur condition */
  if ((o & 0xe7) === 0x20) return { texte: `jr ${CONDITIONS[(o >> 3) & 3]}, e`, taille: 2, modele: 'e' }
  if ((o & 0xe7) === 0xc2) return { texte: `jp ${CONDITIONS[(o >> 3) & 3]}, nn`, taille: 3, modele: 'nn' }
  if ((o & 0xe7) === 0xc4) return { texte: `call ${CONDITIONS[(o >> 3) & 3]}, nn`, taille: 3, modele: 'nn' }
  if ((o & 0xe7) === 0xc0) return { texte: `ret ${CONDITIONS[(o >> 3) & 3]}`, taille: 1 }

  /* la pile */
  if ((o & 0xcf) === 0xc5) return { texte: `push ${R16_PILE[(o >> 4) & 3]}`, taille: 1 }
  if ((o & 0xcf) === 0xc1) return { texte: `pop ${R16_PILE[(o >> 4) & 3]}`, taille: 1 }

  /* rst : huit appels très courts, à des adresses fixes */
  if ((o & 0xc7) === 0xc7) return { texte: `rst $${(o & 0x38).toString(16).padStart(2, '0')}`, taille: 1 }

  return { texte: `??? ($${o.toString(16).padStart(2, '0')})`, taille: 1 }
}

/*
 * Ce qu'une routine de la console fait, dit en C++.
 *
 * C'est la seule passerelle honnête vers le programme d'origine : un « call
 * EcrireTexte » vient forcément d'un `texte()`, il n'y a pas d'autre façon de
 * l'écrire. Le reste — les boucles, les noms, la forme des calculs — ne se
 * retrouve pas, et prétendre le contraire serait mentir.
 */
const CE_QUE_CA_FAIT = {
  AttendreImage: 'image()',
  EcrireTexte: 'texte(colonne, ligne, "…")',
  EcrireNombre: 'nombre(colonne, ligne, valeur)',
  LireManette: 'bouton(…)',
  AvancerAirs: 'les airs avancent d’une image',
  Diviser: 'une division — a / b',
  Multiplier: 'une multiplication — a * b',
  CopierTuiles: 'les dessins partent en mémoire vidéo',
  EffacerCarte: 'l’écran est vidé',
  RangerLutins: 'les lutins sont rangés hors de l’écran',
  AttendreVBlank: 'on attend que l’écran ait fini sa passe',
}

/** Les écritures dans le matériel qui trahissent un appel du langage. */
const CE_QUE_CA_TOUCHE = {
  DEFILEMENT_X: 'defiler(x, y)',
  DEFILEMENT_Y: 'defiler(x, y)',
  PALETTE_FOND: 'paletteFond(…)',
  PALETTE_OBJETS0: 'paletteLutins(0, …)',
  PALETTE_OBJETS1: 'paletteLutins(1, …)',
  SON1_HAUTE: 'une note part sur la voix 1',
  SON2_HAUTE: 'une note part sur la voix 2',
  BRUIT_HAUTE: 'bruit(…)',
  SON_VOLUME: 'volumeSon(…)',
  ECRAN: 'ecran(0) ou ecran(1)',
  FENETRE_Y: 'panneau(x, y)',
}

/** Ce qu'une instruction laisse deviner du programme d'origine, ou rien. */
function ceQueCaVeutDire(texte) {
  const appel = texte.match(/^call (?:\w+, )?([A-Za-z_]\w*)/)
  if (appel && CE_QUE_CA_FAIT[appel[1]]) return CE_QUE_CA_FAIT[appel[1]]

  const registre = texte.match(/^ldh \[([A-Z_0-9]+)\]/)
  if (registre && CE_QUE_CA_TOUCHE[registre[1]]) return CE_QUE_CA_TOUCHE[registre[1]]

  return null
}

/* ------------------------------------------------------- le désassemblage */

const hex2 = (n) => '$' + n.toString(16).padStart(2, '0')
const hex4 = (n) => '$' + n.toString(16).padStart(4, '0')

/**
 * Désassemble une suite d'octets.
 *
 * `noms` permet de rendre leur nom aux adresses : celle d'une variable, celle
 * d'une fonction. Le compilateur les connaît toutes — il vient de les
 * attribuer —, et c'est ce qui fait la différence entre un listing illisible et
 * un programme qu'on reconnaît.
 */
export function desassembler(octets, { depuis = 0, jusqu = octets.length, base = 0, noms = new Map() } = {}) {
  const lignes = []

  /* --- premier passage : où saute-t-on ? --- */
  const vises = new Set()
  for (let ou = depuis; ou < jusqu;) {
    const { taille, modele } = instruction(octets, ou)
    if (modele === 'nn' || modele === 'e') {
      const adresse = modele === 'e'
        ? base + ou + 2 + ((octets[ou + 1] << 24) >> 24) // le saut relatif est signé
        : octets[ou + 1] | (octets[ou + 2] << 8)
      if (adresse >= base + depuis && adresse < base + jusqu) vises.add(adresse)
    }
    ou += taille
  }

  /* --- second passage : les instructions, avec leurs étiquettes --- */
  for (let ou = depuis; ou < jusqu;) {
    const debut = base + ou
    const { texte, taille, modele } = instruction(octets, ou)

    let rendu = texte
    if (modele === 'n') {
      const n = octets[ou + 1]
      if (texte.startsWith('ldh')) {
        /* Une variable du programme vit dans la page rapide : « ldh a, [$80] »
           est en réalité « ldh a, [x] ». Le nom passe avant le registre — une
           variable et un registre ne partagent jamais la même adresse. */
        rendu = texte.replace('n', noms.get(0xff00 | n) ?? REGISTRES[n] ?? hex2(n))
      } else {
        rendu = texte.replace(/\bn\b/, `${n}`)
      }
    }

    if (modele === 'nn') {
      const adresse = octets[ou + 1] | (octets[ou + 2] << 8)
      rendu = texte.replace('nn', noms.get(adresse) ?? hex4(adresse))
    }

    if (modele === 'e') {
      const adresse = base + ou + 2 + ((octets[ou + 1] << 24) >> 24)
      rendu = texte.replace(/\be\b/, noms.get(adresse) ?? hex4(adresse))
    }

    lignes.push({
      adresse: debut,
      octets: [...octets.slice(ou, ou + taille)],
      texte: rendu,
      etiquette: noms.get(debut) ?? (vises.has(debut) ? hex4(debut) : null),
      veutDire: ceQueCaVeutDire(rendu),
    })

    ou += taille
  }

  return lignes
}

/* --------------------------------------------------- l'entête d'une cartouche */

/** Ce que la cartouche dit d'elle-même, en $0100. */
export function enTete(octets) {
  const titre = [...octets.slice(0x0134, 0x0144)]
    .filter((o) => o >= 32 && o < 127)
    .map((o) => String.fromCharCode(o))
    .join('')
    .trim()

  const TYPES = {
    0x00: 'sans contrôleur', 0x01: 'MBC1', 0x02: 'MBC1 + mémoire',
    0x03: 'MBC1 + mémoire à pile', 0x0f: 'MBC3 + horloge', 0x13: 'MBC3 + mémoire à pile',
    0x19: 'MBC5', 0x1b: 'MBC5 + mémoire à pile',
  }

  return {
    titre,
    type: TYPES[octets[0x0147]] ?? `type ${hex2(octets[0x0147])}`,
    romKo: 32 << octets[0x0148],
    point: octets[0x0102] | (octets[0x0103] << 8), // où le saut de $0100 mène
  }
}

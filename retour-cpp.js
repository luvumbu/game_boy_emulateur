/**
 * Remonter d'une cartouche vers du C++ — ce qui peut l'être, et pas un mot de plus.
 *
 * Il faut le dire avant toute chose, parce que c'est la question que tout le
 * monde pose : **le C++ n'est pas dans la cartouche**. La compilation jette les
 * noms, les commentaires, les portées et la forme des boucles. Un `for` et un
 * `while` donnent les mêmes octets ; un `const` disparaît entièrement ; une
 * variable devient une adresse. Il n'existe donc aucune fonction inverse —
 * plusieurs programmes différents produisent exactement les mêmes octets, et
 * rien dans les octets ne dit lequel a été écrit.
 *
 * Ce qui existe, et que ce module fait : **reconnaître les formes que CE
 * compilateur produit**. Elles sont régulières. « ld hl, $98c5 / ld de, … /
 * ld b, 7 / call EcrireTexte » ne peut être qu'un `texte(5, 6, "…")` de sept
 * lettres, et cela se réécrit tel quel.
 *
 * Ce que le module ne reconnaît pas, il l'écrit EN COMMENTAIRE, instruction par
 * instruction, avec son adresse. Rien n'est inventé, rien n'est deviné : un
 * programme reconstruit à moitié qui aurait l'air complet serait bien pire que
 * pas de programme du tout. Le rapport dit combien d'instructions sur combien
 * ont été lues — c'est la seule mesure honnête de ce qu'on tient.
 *
 * Sur une cartouche venue d'ailleurs — un jeu du commerce — le compte tombera
 * près de zéro, et c'est normal : ses octets n'ont pas été écrits par ce
 * compilateur. Pour celles-là, c'est `convertir.js` qui rend ce qui se rend :
 * les dessins, la carte de l'écran, les palettes.
 */

import { instruction } from './desassembleur.js'
import { ORDRE } from './compilateur/police.js'
import { analyser } from './compilateur/analyseur.js'
import { compiler } from './compilateur/emetteur.js'

const CARTE_FOND = 0x9800
const CARTE_PANNEAU = 0x9c00
const BROUILLON2 = 0xfffd
const ROUTINE_TRANSFERT = 0xfff0

/** Les huit boutons, dans l'ordre des bits que « bouton() » teste. */
const BOUTONS = ['DROITE', 'GAUCHE', 'HAUT', 'BAS', 'A', 'B', 'SELECT', 'START']

const hex4 = (n) => '$' + n.toString(16).padStart(4, '0')

/* ------------------------------------------------ lire les instructions */

/**
 * La suite des instructions d'une tranche d'octets.
 *
 * On garde l'ADRESSE, l'opcode et la valeur BRUTE des opérandes : reconnaître
 * une forme, c'est comparer des opcodes et lire des nombres, jamais analyser
 * une chaîne. Le texte, lui, ne sert qu'au commentaire de ce qu'on n'a pas su
 * lire — et il porte alors les vrais noms, parce qu'un commentaire illisible
 * ne vaut pas mieux que pas de commentaire du tout.
 */
export function lireLesInstructions(octets, base, depuis, jusqu, noms = new Map()) {
  const lignes = []
  for (let ou = depuis; ou < jusqu;) {
    const { texte, taille, modele } = instruction(octets, ou)
    const n = modele === 'n' ? octets[ou + 1] : null
    const nn = modele === 'nn' ? (octets[ou + 1] | (octets[ou + 2] << 8)) : null
    const e = modele === 'e' ? base + ou + 2 + ((octets[ou + 1] << 24) >> 24) : null

    let rendu = texte
    if (modele === 'n') {
      rendu = texte.startsWith('ldh')
        ? texte.replace('n', noms.get(0xff00 | n) ?? hex4(0xff00 | n))
        : texte.replace(/\bn\b/, String(n))
    }
    if (modele === 'nn') rendu = texte.replace('nn', noms.get(nn) ?? hex4(nn))
    if (modele === 'e') rendu = texte.replace(/\be\b/, noms.get(e) ?? hex4(e))

    lignes.push({
      adresse: base + ou,
      ou,
      taille,
      opcode: octets[ou],
      second: octets[ou + 1],
      texte: rendu,
      modele: modele ?? null,
      n,
      nn,
      e,
      cible: nn ?? e,
    })
    ou += taille
  }
  return lignes
}

/**
 * L'empreinte d'une tranche de code, les adresses effacées.
 *
 * Deux cartouches n'ont pas leurs routines à la même adresse — le code de
 * l'utilisateur passe avant, et il n'a jamais la même longueur. Les octets
 * d'une routine sont pourtant les mêmes, À SES « call » ET SES « jp » PRÈS,
 * qui portent une adresse absolue. On les remplace par « ?? » : ce qui reste
 * identifie la routine où qu'elle soit tombée.
 */
export function empreinteDe(octets, depuis, jusqu) {
  const morceaux = []
  for (let ou = depuis; ou < jusqu;) {
    const { taille, modele } = instruction(octets, ou)
    const valeur = modele === 'nn' ? (octets[ou + 1] | (octets[ou + 2] << 8)) : null
    /*
     * On n'efface que les adresses de la CARTOUCHE.
     *
     * Celles-là bougent d'un programme à l'autre — le code de l'utilisateur
     * passe avant les routines, et il n'a jamais la même longueur. Les autres
     * sont des constantes du matériel, et elles DISTINGUENT : « EffacerFond »
     * et « EffacerPanneau » ont exactement les mêmes octets à leur « ld hl »
     * près, l'une visant $9800 et l'autre $9C00. Les effacer toutes rendait
     * les deux routines identiques, et la seconde prenait le nom de la
     * première — sur un listing, cela se lit comme une erreur du programme.
     */
    const aEffacer = modele === 'nn' && valeur >= 0x0100 && valeur < 0x8000
    morceaux.push(octets[ou].toString(16).padStart(2, '0'))
    for (let i = 1; i < taille; i++) {
      morceaux.push(aEffacer ? '??' : octets[ou + i].toString(16).padStart(2, '0'))
    }
    ou += taille
  }
  return morceaux.join(' ')
}

/* ------------------------------------------------ les routines de la console */

/*
 * Les routines à reconnaître, prises de programmes témoins compilés ICI.
 *
 * Rien n'est recopié à la main : on compile deux petits programmes — l'un
 * muet, l'autre qui joue un air, pour que le séquenceur soit gravé — et l'on
 * relève l'empreinte de chaque routine. Le jour où l'émetteur en gagne une,
 * elle est reconnue sans qu'on touche à ce fichier ; le jour où il en change
 * une, l'empreinte suit. Une table écrite à la main aurait menti au premier
 * changement, et en silence.
 */
const TEMOINS = [
  'int main() { while (true) { image(); } return 0; }\n',
  'Air A1 = { "DO4 12", "--" };\nint main() { jouer(1, A1, 8, 0); while (true) { image(); } return 0; }\n',
]

/** Une étiquette de routine : ni « fn_… », ni une étiquette interne « nom_12 ». */
const estUneRoutine = (nom) => !nom.startsWith('fn_') && !/_\d+$/.test(nom)

let empreintesConnues = null

/** Nom de routine → ses empreintes. Calculé une fois, gardé. */
export function empreintesDesRoutines() {
  if (empreintesConnues) return empreintesConnues
  empreintesConnues = new Map()

  for (const source of TEMOINS) {
    const rendu = compiler(analyser(source))
    const octets = new Uint8Array(rendu.octets)
    const finDuCode = rendu.etiquettes.get('Tuiles') ?? rendu.octets.length

    const bornes = [...rendu.etiquettes]
      .filter(([nom, ou]) => estUneRoutine(nom) && ou < finDuCode)
      .sort((a, b) => a[1] - b[1])

    bornes.forEach(([nom, ou], i) => {
      const jusqu = i + 1 < bornes.length ? bornes[i + 1][1] : finDuCode
      if (jusqu <= ou) return
      const empreinte = empreinteDe(octets, ou, jusqu)
      /* Une routine d'un ou deux octets — « AvancerAirs : ret » quand aucun air
         n'est joué — ne distingue rien : tout « ret » lui ressemblerait. */
      if (empreinte.split(' ').length < 5) return
      if (!empreintesConnues.has(nom)) empreintesConnues.set(nom, [])
      if (!empreintesConnues.get(nom).includes(empreinte)) empreintesConnues.get(nom).push(empreinte)
    })
  }

  return empreintesConnues
}

/**
 * Où sont les routines de la console dans CETTE cartouche.
 *
 * On cherche chaque empreinte partout dans le code. C'est un balayage bête, et
 * c'est ce qu'il faut : rien ne garantit l'ordre des routines d'une version à
 * l'autre, et une position devinée qui tombe à côté ferait lire du charabia.
 */
export function routinesDe(octets, base, finDuCode) {
  const trouvees = new Map() // adresse → nom

  for (const [nom, formes] of empreintesDesRoutines()) {
    for (const forme of formes) {
      const longueur = forme.split(' ').length
      for (let ou = 0; ou + longueur <= finDuCode; ou++) {
        if (empreinteDe(octets, ou, ou + longueur) !== forme) continue
        trouvees.set(base + ou, nom)
        break
      }
    }
  }

  return trouvees
}

/* ------------------------------------------------ retrouver les fonctions */

/**
 * Où commence `main()`.
 *
 * La mise en route se termine toujours par « call main() » suivi de
 * « Fin : jr Fin » — un programme qui rendrait la main s'arrête là plutôt que
 * de partir au hasard. Ces cinq octets sont la signature la plus sûre de la
 * cartouche : « cd ?? ?? 18 fe ».
 */
export function ouEstMain(octets, base, finDuCode) {
  for (let ou = 0; ou + 5 <= finDuCode; ou++) {
    if (octets[ou] === 0xcd && octets[ou + 3] === 0x18 && octets[ou + 4] === 0xfe) {
      return octets[ou + 1] | (octets[ou + 2] << 8)
    }
  }
  return null
}

/**
 * Les fonctions écrites par l'utilisateur.
 *
 * On part de `main()` et l'on suit les « call » : ce qui n'est pas une routine
 * de la console est une fonction du programme. Une fonction que personne
 * n'appelle reste invisible — elle est bien gravée, mais rien ne mène à elle,
 * et rien dans les octets ne la distingue du remplissage.
 */
export function fonctionsDe(lignes, main, routines, base, finDuCode) {
  const aVoir = [main]
  const vues = new Set()

  /*
   * Les fonctions de l'utilisateur sont gravées AVANT les routines : le
   * compilateur écrit le programme, puis la console. Tout ce qui est appelé
   * au-delà de la première routine EST une routine — y compris celles qu'on
   * n'a pas su nommer, comme « AvancerAirs » réduite à un seul « ret » quand
   * le programme ne joue rien. Sans cette borne, ce « ret » solitaire
   * devenait une fonction vide dans le programme rendu.
   */
  const premiereRoutine = Math.min(...routines.keys(), base + finDuCode)

  while (aVoir.length) {
    const depart = aVoir.shift()
    if (depart === null || depart === undefined || vues.has(depart)) continue
    vues.add(depart)

    for (const ligne of lignes) {
      if (ligne.adresse < depart || ligne.adresse >= base + finDuCode) continue
      if (!ligne.texte.startsWith('call')) continue
      const cible = ligne.cible
      if (cible === null || routines.has(cible) || cible === ROUTINE_TRANSFERT) continue
      if (cible >= premiereRoutine) continue
      if (cible >= base && cible < base + finDuCode) aVoir.push(cible)
    }
  }

  return [...vues].sort((a, b) => a - b)
}

/* ------------------------------------------------ les briques d'une forme */

/** La case de l'écran que désigne une adresse de carte, ou null. */
const caseDe = (adresse) => {
  for (const [carte, ou] of [[CARTE_FOND, 'fond'], [CARTE_PANNEAU, 'panneau']]) {
    const decalage = adresse - carte
    if (decalage >= 0 && decalage < 32 * 32) {
      return { colonne: decalage % 32, ligne: Math.floor(decalage / 32), ou }
    }
  }
  return null
}

/** Le texte gravé à une adresse, relu par la police. */
const texteGrave = (octets, base, adresse, combien) => {
  const ou = adresse - base
  if (ou < 0 || ou + combien > octets.length) return null
  let mot = ''
  for (let i = 0; i < combien; i++) mot += ORDRE[octets[ou + i]] ?? '?'
  return mot
}

/** Le nom nu d'une variable : « main.x » se lit « x » dans le programme. */
const nu = (nom) => nom.replace(/^[A-Za-z_]\w*\./, '')

/**
 * Le lecteur : tout ce qui sait reconnaître une forme dans cette cartouche-ci.
 *
 * Il est construit une fois par cartouche, parce que reconnaître demande de
 * savoir où sont les routines et comment s'appellent les variables — deux
 * choses qui changent d'une cartouche à l'autre.
 */
export function creerLecteur({ octets, base, noms, routines, fonctions, nomsDeTuile }) {
  const nomDeRoutine = (adresse) => routines.get(adresse) ?? null

  /** Une valeur d'un octet : une constante, ou une variable. */
  const valeurDans = (l) => {
    if (!l) return null
    /* « xor a » met zéro dans `a` en un octet au lieu de deux : c'est ainsi
       que le compilateur écrit la constante 0, et nulle part ailleurs. */
    if (l.opcode === 0xaf) return { cpp: '0', constante: 0 }
    if (l.opcode === 0x3e) return { cpp: String(l.n), constante: l.n } // ld a, n
    if (l.opcode === 0xf0) { // ldh a, [n]
      const nom = noms.get(0xff00 | l.n)
      return nom ? { cpp: nu(nom), constante: null } : null
    }
    return null
  }

  /** La variable qu'écrit « ldh [x], a ». */
  const ecritDans = (l) => {
    if (!l || l.opcode !== 0xe0) return null
    const nom = noms.get(0xff00 | l.n)
    return nom ? nu(nom) : null
  }

  /**
   * L'adresse d'une case, calculée par le compilateur.
   *
   * Il ne replie JAMAIS ce calcul, même quand les deux nombres sont écrits en
   * clair : la ligne part dans `hl`, se multiplie par trente-deux à coups de
   * « add hl, hl », et la colonne s'ajoute ensuite. C'est cette suite-là qu'on
   * reconnaît, et elle rend la ligne et la colonne, chacune constante ou lue
   * dans une variable.
   */
  const adresseDUneCase = (l, i) => {
    const ligne = valeurDans(l[i])
    if (!ligne) return null
    if (l[i + 1]?.opcode !== 0x6f) return null // ld l, a
    if (!(l[i + 2]?.opcode === 0x26 && l[i + 2].n === 0)) return null // ld h, 0
    for (let k = 0; k < 5; k++) if (l[i + 3 + k]?.opcode !== 0x29) return null // add hl, hl
    const carte = l[i + 8]
    if (carte?.opcode !== 0x11) return null // ld de, nn
    if (l[i + 9]?.opcode !== 0x19) return null // add hl, de
    const colonne = valeurDans(l[i + 10])
    if (!colonne) return null
    if (l[i + 11]?.opcode !== 0x5f) return null // ld e, a
    if (!(l[i + 12]?.opcode === 0x16 && l[i + 12].n === 0)) return null // ld d, 0
    if (l[i + 13]?.opcode !== 0x19) return null // add hl, de
    return { colonne: colonne.cpp, ligne: ligne.cpp, panneau: carte.nn === CARTE_PANNEAU, apres: i + 14 }
  }

  /** Le nom du dessin qui porte ce numéro, quand on le connaît. */
  const tuileDe = (valeur) =>
    valeur.constante === null ? valeur.cpp : (nomsDeTuile.get(valeur.constante) ?? valeur.cpp)

  /* ------------------------------------------------ les conditions */

  /*
   * Une condition laisse toujours 0 ou 1 dans `a`, par la même suite : on
   * calcule, on saute si c'est vrai, sinon « xor a », et « ld a, 1 » sur la
   * branche vraie. Ce squelette-là est invariable ; ce qui change, c'est ce
   * qu'on a calculé avant. On reconnaît donc le squelette, puis le calcul.
   */
  const SAUTS = { 0x28: '==', 0x20: '!=', 0x38: '<', 0x30: '>=' }

  /** « jr cc, vrai ; xor a ; jr suite ; ld a, 1 » — quatre instructions. */
  const squelette = (l, i) => {
    if (!l[i] || SAUTS[l[i].opcode] === undefined) return null
    if (l[i + 1]?.opcode !== 0xaf) return null // xor a
    if (l[i + 2]?.opcode !== 0x18) return null // jr suite
    if (!(l[i + 3]?.opcode === 0x3e && l[i + 3].n === 1)) return null // ld a, 1
    return { operateur: SAUTS[l[i].opcode], apres: i + 4 }
  }

  /** Ce qui produit un booléen à partir de `i` : son C++, et sa longueur. */
  const conditionA = (l, i) => {
    /* bouton(X) : la manette lue, puis un bit testé. */
    if (nomDeRoutine(l[i]?.cible) === 'LireManette' && l[i + 1]?.opcode === 0xcb) {
      const bit = (l[i + 1].second - 0x47) / 8
      const forme = squelette(l, i + 2)
      if (Number.isInteger(bit) && bit >= 0 && bit < 8 && forme && forme.operateur === '!=') {
        return { cpp: `bouton(${BOUTONS[bit]})`, combien: forme.apres - i }
      }
    }

    /* Une comparaison : le premier poussé, le second, la soustraction. */
    const premier = valeurDans(l[i])
    if (premier && l[i + 1]?.opcode === 0xf5) { // push af
      const second = valeurDans(l[i + 2])
      if (second && l[i + 3]?.opcode === 0x47 && l[i + 4]?.opcode === 0xf1 && l[i + 5]?.opcode === 0x90) {
        const forme = squelette(l, i + 6)
        if (forme) return { cpp: `${premier.cpp} ${forme.operateur} ${second.cpp}`, combien: forme.apres - i }
      }
    }

    /* Une variable seule : « if (vivant) ». */
    if (premier && premier.constante === null && l[i + 1]?.opcode === 0xb7) {
      return { cpp: premier.cpp, combien: 1 }
    }

    return null
  }

  /* ------------------------------------------------ les instructions */

  const formes = [
    /* image() — l'attente de l'image, puis la copie des lutins. */
    (l, i) => {
      if (nomDeRoutine(l[i]?.cible) !== 'AttendreImage') return null
      return { cpp: 'image();', combien: l[i + 1]?.cible === ROUTINE_TRANSFERT ? 2 : 1 }
    },

    /* texte(colonne, ligne, "…") — la case, la table, la longueur, l'appel. */
    (l, i) => {
      if (l[i]?.opcode !== 0x21) return null // ld hl, nn
      const ou = caseDe(l[i].nn)
      if (!ou || l[i + 1]?.opcode !== 0x11 || l[i + 2]?.opcode !== 0x06) return null
      if (nomDeRoutine(l[i + 3]?.cible) !== 'EcrireTexte') return null
      const mot = texteGrave(octets, base, l[i + 1].nn, l[i + 2].n)
      if (mot === null) return null
      return {
        cpp: `${ou.ou === 'panneau' ? 'textePanneau' : 'texte'}(${ou.colonne}, ${ou.ligne}, "${mot}");`,
        combien: 4,
      }
    },

    /* nombre(colonne, ligne, valeur, chiffres) — écrit de droite à gauche. */
    (l, i) => {
      const valeur = valeurDans(l[i])
      if (!valeur || l[i + 1]?.opcode !== 0x21) return null
      const ou = caseDe(l[i + 1].nn)
      if (!ou || l[i + 2]?.opcode !== 0x06) return null
      if (nomDeRoutine(l[i + 3]?.cible) !== 'EcrireNombre') return null
      return {
        cpp: `${ou.ou === 'panneau' ? 'nombrePanneau' : 'nombre'}(${ou.colonne}, ${ou.ligne}, ${valeur.cpp}, ${l[i + 2].n});`,
        combien: 4,
      }
    },

    /* effacer(colonne, ligne, combien) — la même case, sans table. */
    (l, i) => {
      if (l[i]?.opcode !== 0x21) return null
      const ou = caseDe(l[i].nn)
      if (!ou || l[i + 1]?.opcode !== 0x06) return null
      if (nomDeRoutine(l[i + 2]?.cible) !== 'EffacerCases') return null
      return {
        cpp: `${ou.ou === 'panneau' ? 'effacerPanneau' : 'effacer'}(${ou.colonne}, ${ou.ligne}, ${l[i + 1].n});`,
        combien: 3,
      }
    },

    /* ecran(0) / ecran(1) — la valeur écrite dit lequel. */
    (l, i) => {
      if (l[i]?.opcode !== 0x3e || !(l[i + 1]?.opcode === 0xe0 && l[i + 1].n === 0x40)) return null
      return { cpp: `ecran(${l[i].n & 0x80 ? 1 : 0});`, combien: 2 }
    },

    /* poser(colonne, ligne, tuile) — la tuile mise de côté, l'adresse calculée. */
    (l, i) => {
      const tuile = valeurDans(l[i])
      if (!tuile) return null
      if (!(l[i + 1]?.opcode === 0xe0 && (0xff00 | l[i + 1].n) === BROUILLON2)) return null
      const ou = adresseDUneCase(l, i + 2)
      if (!ou) return null
      const reprise = l[ou.apres]
      if (!(reprise?.opcode === 0xf0 && (0xff00 | reprise.n) === BROUILLON2)) return null
      if (l[ou.apres + 1]?.opcode !== 0x77) return null // ld [hl], a
      return {
        cpp: `${ou.panneau ? 'poserPanneau' : 'poser'}(${ou.colonne}, ${ou.ligne}, ${tuileDe(tuile)});`,
        combien: ou.apres + 2 - i,
      }
    },

    /* x = lire(colonne, ligne) — la même adresse, mais on relit la case. */
    (l, i) => {
      const ou = adresseDUneCase(l, i)
      if (!ou || l[ou.apres]?.opcode !== 0x7e) return null // ld a, [hl]
      const cible = ecritDans(l[ou.apres + 1])
      if (!cible) return null
      return {
        cpp: `${cible} = ${ou.panneau ? 'lirePanneau' : 'lire'}(${ou.colonne}, ${ou.ligne});`,
        combien: ou.apres + 2 - i,
      }
    },

    /* x++ — la valeur d'AVANT est gardée dans `c`, comme le veut « x++ ». */
    (l, i) => {
      const lu = valeurDans(l[i])
      if (!lu || lu.constante !== null || l[i + 1]?.opcode !== 0x4f) return null // ld c, a
      const pas = l[i + 2]?.opcode === 0x3c ? '++' : l[i + 2]?.opcode === 0x3d ? '--' : null
      if (!pas || ecritDans(l[i + 3]) !== lu.cpp || l[i + 4]?.opcode !== 0x79) return null
      return { cpp: `${lu.cpp}${pas};`, combien: 5 }
    },

    /* x = 3 ; x = y — une valeur, rangée quelque part. */
    (l, i) => {
      const valeur = valeurDans(l[i])
      const cible = ecritDans(l[i + 1])
      if (!valeur || !cible) return null
      return { cpp: `${cible} = ${valeur.cpp};`, combien: 2 }
    },

    /* Une fonction du programme. */
    (l, i) => {
      const nom = fonctions.get(l[i]?.cible)
      if (!nom || !l[i].texte.startsWith('call')) return null
      return { cpp: `${nom}();`, combien: 1 }
    },
  ]

  return { formes, conditionA }
}

/* ------------------------------------------------ écrire le programme */

/**
 * Rend un bloc d'instructions en C++, en remontant boucles et conditions.
 *
 * Les formes du compilateur sont fixes : une boucle est un saut EN ARRIÈRE vers
 * une étiquette, une condition est un « jp z » EN AVANT juste après le calcul
 * d'un booléen. C'est peu, et c'est assez pour rendre les `while` et les `if`
 * là où ils étaient.
 *
 * Un `for`, lui, ne revient pas : il donne exactement les octets d'un `while`
 * dont on aurait sorti l'initialisation et gardé le pas à la fin. On écrit donc
 * un `while` — c'est le même programme, et prétendre retrouver le `for` serait
 * inventer ce que les octets ne disent pas.
 */
function rendreBloc(l, debut, fin, lecteur, marge, compte, profondeur = 0) {
  const sortie = []
  const dire = (texte) => sortie.push(marge + texte)
  const indexDe = (adresse) => l.findIndex((x) => x.adresse === adresse)

  for (let i = debut; i < fin;) {
    const ici = l[i]

    /* --- une boucle : quelqu'un saute en arrière, ici même --- */
    if (profondeur < 12) {
      let retour = -1
      for (let b = i + 1; b < fin; b++) {
        const saut = l[b]
        if ((saut.opcode === 0xc3 || saut.opcode === 0x18) && saut.cible === ici.adresse) retour = b
      }

      if (retour > i) {
        const cond = lecteur.conditionA(l, i)
        const apres = cond ? i + cond.combien : i
        const test = l[apres]
        const saut = l[apres + 1]
        const sortieVoulue = retour + 1 < l.length ? l[retour + 1].adresse : null
        const avecTest = Boolean(cond) && test?.opcode === 0xb7 && saut?.opcode === 0xca &&
          saut.cible === sortieVoulue

        dire(`while (${avecTest ? cond.cpp : 'true'}) {`)
        sortie.push(...rendreBloc(
          l, avecTest ? apres + 2 : i, retour, lecteur, marge + '  ', compte, profondeur + 1,
        ))
        dire('}')
        /* Le saut de retour, et le test s'il y en avait un : lus, tous. */
        const combien = 1 + (avecTest ? cond.combien + 2 : 0)
        compte.reconnues += combien
        compte.total += combien
        i = retour + 1
        continue
      }
    }

    /* --- une condition : un booléen, puis un saut par-dessus --- */
    if (profondeur < 12) {
      const cond = lecteur.conditionA(l, i)
      const test = cond ? l[i + cond.combien] : null
      const saut = cond ? l[i + cond.combien + 1] : null
      if (cond && test?.opcode === 0xb7 && saut?.opcode === 0xca) {
        const finSi = indexDe(saut.cible)
        if (finSi > i && finSi <= fin) {
          compte.reconnues += cond.combien + 2
          compte.total += cond.combien + 2

          /* Un « else » se voit à un saut inconditionnel juste avant la fin du
             « si » : la branche vraie enjambe la branche fausse. */
          const dernier = l[finSi - 1]
          const versLaFin = dernier && dernier.opcode === 0xc3 ? indexDe(dernier.cible) : -1
          const avecSinon = versLaFin > finSi && versLaFin <= fin

          dire(`if (${cond.cpp}) {`)
          sortie.push(...rendreBloc(
            l, i + cond.combien + 2, avecSinon ? finSi - 1 : finSi, lecteur, marge + '  ', compte, profondeur + 1,
          ))
          if (avecSinon) {
            compte.reconnues++
            compte.total++
            dire('} else {')
            sortie.push(...rendreBloc(l, finSi, versLaFin, lecteur, marge + '  ', compte, profondeur + 1))
          }
          dire('}')
          i = avecSinon ? versLaFin : finSi
          continue
        }
      }
    }

    /* --- une instruction du programme --- */
    let pris = null
    for (const forme of lecteur.formes) {
      pris = forme(l, i)
      if (pris) break
    }

    if (pris) {
      dire(pris.cpp)
      compte.reconnues += pris.combien
      compte.total += pris.combien
      i += pris.combien
      continue
    }

    /* --- « xor a ; ret » à la toute fin, c'est le « return 0 » --- */
    /* Un « xor a » collé à un « ret » ne peut être qu'un « return 0 » : la
       valeur rendue passe par `a`, et zéro s'y écrit ainsi. */
    if (ici.opcode === 0xaf && l[i + 1]?.opcode === 0xc9) {
      compte.reconnues += 2
      compte.total += 2
      i += 2
      continue
    }

    /* --- le « ret » de la fin, c'est l'accolade fermante --- */
    if (ici.opcode === 0xc9 && i >= fin - 2) {
      compte.reconnues++
      compte.total++
      i++
      continue
    }

    dire(`// ${hex4(ici.adresse)}  ${ici.texte}`)
    compte.total++
    i++
  }

  return sortie
}

/**
 * Reconstruit un programme C++ à partir d'une cartouche.
 *
 * `rendu` — ce que le compilateur vient de produire — n'est pas nécessaire ; il
 * n'apporte que les NOMS. Sans lui, les variables s'appellent « $ff80 » et les
 * fonctions « f01ab » : ce sont leurs adresses, et c'est tout ce que la
 * cartouche en dit.
 */
export function retourAuCpp({ octets, base, finDuCode, rendu = null, dessins = [] }) {
  const tableau = octets instanceof Uint8Array ? octets : new Uint8Array(octets)
  const fin = finDuCode ?? tableau.length

  const noms = new Map()
  if (rendu) for (const [nom, adresse] of rendu.variables) noms.set(adresse, nom)

  const nomsDeTuile = new Map()
  for (const dessin of dessins) if (dessin.numero !== undefined) nomsDeTuile.set(dessin.numero, dessin.nom)

  const routines = routinesDe(tableau, base, fin)
  const main = ouEstMain(tableau, base, fin)
  const lignes = lireLesInstructions(tableau, base, 0, fin, noms)
  const departs = main === null ? [] : fonctionsDe(lignes, main, routines, base, fin)

  const fonctions = new Map()
  for (const depart of departs) {
    const propre = rendu
      ? [...rendu.fonctions].find(([, s]) => base + (rendu.etiquettes?.get(s.etiquette) ?? -1) === depart)
      : null
    fonctions.set(depart, propre ? propre[0] : (depart === main ? 'main' : `f${depart.toString(16)}`))
  }

  const lecteur = creerLecteur({ octets: tableau, base, noms, routines, fonctions, nomsDeTuile })
  const compte = { reconnues: 0, total: 0 }

  /* Où s'arrête chaque fonction : à la suivante, ou à la première routine. */
  const frontieres = [...departs, ...routines.keys()].sort((a, b) => a - b)
  const finDe = (depart) => frontieres.find((f) => f > depart) ?? base + fin

  const corps = []
  for (const depart of departs) {
    const jusqu = finDe(depart)
    const nom = fonctions.get(depart)
    const premier = lignes.findIndex((x) => x.adresse === depart)
    const apres = lignes.findIndex((x) => x.adresse >= jusqu)
    const rendues = rendreBloc(lignes, premier, apres < 0 ? lignes.length : apres, lecteur, '  ', compte)

    /*
     * Les variables locales, déclarées en tête.
     *
     * Le compilateur les nomme « main.x » : le préfixe dit la fonction, et il
     * n'existe que dans sa table. Sans cette déclaration, le programme rendu
     * parlerait d'un « x » que rien n'aurait annoncé — il se lirait bien et ne
     * compilerait pas.
     */
    const locales = rendu
      ? [...rendu.variables].filter(([complet]) => complet.startsWith(nom + '.')).map(([complet]) => nu(complet))
      : []
    const enTete = locales.map((v) => `  uint8_t ${v} = 0;`)
    if (enTete.length) enTete.push('')

    corps.push(
      (nom === 'main' ? 'int main() {' : `void ${nom}() {`) + '\n' +
      [...enTete, ...rendues].join('\n') +
      (nom === 'main' ? '\n\n  return 0;\n}' : '\n}') + '\n',
    )
  }

  const part = compte.total ? Math.round((compte.reconnues / compte.total) * 100) : 0

  const entete = [
    '/*',
    ' * Programme REMONTÉ depuis une cartouche — ce n’est pas le programme d’origine.',
    ' *',
    ' * Le C++ n’entre jamais dans une cartouche : la compilation jette les noms, les',
    ' * commentaires, les portées et la forme des boucles. Ce fichier est ce que les',
    ' * octets permettent de dire, et rien de plus. Un « for » y revient en « while » :',
    ' * les deux donnent exactement les mêmes octets.',
    ' *',
    ` * ${compte.reconnues} instructions sur ${compte.total} ont été reconnues (${part} %).`,
    ' * Ce qui ne l’a pas été est écrit en commentaire, avec son adresse : rien n’est',
    ' * inventé, et rien n’est passé sous silence.',
    ' */',
    '',
  ]

  const declarations = []
  for (const dessin of dessins) {
    const type = dessin.cote === 16 ? 'Perso' : 'Tuile'
    declarations.push(`${type} ${dessin.nom} = {`, ...dessin.rangees.map((r) => `  "${r}",`), '};', '')
  }

  if (rendu) {
    const globales = [...rendu.variables].filter(([nom]) => !nom.includes('.'))
    for (const [nom] of globales) declarations.push(`uint8_t ${nom} = 0;`)
    if (globales.length) declarations.push('')
  }

  return {
    texte: [...entete, ...declarations, ...corps].join('\n'),
    reconnues: compte.reconnues,
    total: compte.total,
    part,
    routines: routines.size,
    fonctions: departs.length,
  }
}

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
import { avecLesInclusions } from './compilateur/inclusions-auto.js'

const CARTE_FOND = 0x9800
const CARTE_PANNEAU = 0x9c00
const BROUILLON = 0xfffe
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
 *
 * Chaque témoin est compilé deux fois : avec TOUT, pour relever chaque
 * routine, et tel quel, pour relever leurs formes réduites — le VBlank d'un
 * programme muet n'appelle pas la musique, l'image() d'un programme sans
 * lutin ne les copie pas.
 */
const TEMOINS = [
  'int main() { while (true) { image(); } return 0; }\n',
  '#include <Air>\n#include <jouer>\nAir A1 = { "DO4 12", "--" };\nint main() { jouer(1, A1, 8, 0); while (true) { image(); } return 0; }\n',
]

/** Une étiquette de routine : ni « fn_… », ni une étiquette interne « nom_12 ». */
const estUneRoutine = (nom) => !nom.startsWith('fn_') && !/_\d+$/.test(nom)

let empreintesConnues = null

/** Nom de routine → ses empreintes. Calculé une fois, gardé. */
export function empreintesDesRoutines() {
  if (empreintesConnues) return empreintesConnues
  empreintesConnues = new Map()

  for (const [source, options] of TEMOINS.flatMap((t) => [[t, { tout: true }], [t, {}]])) {
    const rendu = compiler(analyser(source), options) // { tout: true } : toutes les routines, même inemployées
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

  /** Le nom d'un tableau de la mémoire de travail, à son adresse de départ. */
  const tableauEn = (adresse) => {
    if (adresse < 0xc000 || adresse >= 0xe000) return null
    const nom = noms.get(adresse)
    return nom ? nu(nom) : null
  }

  /**
   * L'adresse d'une case de tableau dans `hl` : « t[i] ».
   *
   * Deux formes. Le tableau tient dans une page de 256 octets : l'index
   * s'ajoute à l'octet du bas, l'octet du haut est écrit en clair.
   *
   *   ldh a, [i] : add a, $1e : ld l, a : ld h, $c1
   *
   * Sinon, l'index passe en seize bits et la base s'y ajoute :
   *
   *   ldh a, [i] : ld l, a : ld h, 0 : ld de, $c11e : add hl, de
   */
  const caseDeTableau = (l, i) => {
    const index = valeurDans(l[i])
    if (!index) return null
    let k = i + 1
    let bas = 0
    if (l[k]?.opcode === 0xc6) { bas = l[k].n; k++ } // add a, n
    if (l[k]?.opcode !== 0x6f || l[k + 1]?.opcode !== 0x26) return null // ld l, a : ld h, n
    let adresse
    if (l[k + 1].n !== 0) {
      adresse = (l[k + 1].n << 8) | bas
      k += 2
    } else {
      if (bas || l[k + 2]?.opcode !== 0x11 || l[k + 3]?.opcode !== 0x19) return null // ld de, nn : add hl, de
      adresse = l[k + 2].nn
      k += 4
    }
    const nom = tableauEn(adresse)
    return nom ? { cpp: `${nom}[${index.cpp}]`, apres: k } : null
  }

  /**
   * Une valeur mise dans `a`, sur une instruction ou plusieurs : un nombre,
   * une variable, « x + 1 », une case de tableau, ou ce que lit « lire() ».
   * `combien` dit sur combien d'instructions elle s'étend.
   */
  const valeurA = (l, i, avecLire = true) => {
    const lue = valeurLue(l, i, avecLire)
    if (!lue || lue.constante !== null) return lue
    /* « x + 1 », « t[i] - 1 » : un nombre ajouté ou ôté. Pas quand « ld l, a »
       suit : c'est alors l'index d'un tableau qui se décale. */
    const k = i + lue.combien
    if ((l[k]?.opcode === 0xc6 || l[k]?.opcode === 0xd6) && l[k + 1]?.opcode !== 0x6f) {
      return { cpp: `${lue.cpp} ${l[k].opcode === 0xc6 ? '+' : '-'} ${l[k].n}`, constante: null, combien: lue.combien + 1 }
    }
    return lue
  }

  /** La valeur lue, avant tout calcul : un nombre, une variable, une case. */
  const valeurLue = (l, i, avecLire) => {
    const tableau = caseDeTableau(l, i)
    if (tableau && l[tableau.apres]?.opcode === 0x7e) { // ld a, [hl]
      return { cpp: tableau.cpp, constante: null, combien: tableau.apres + 1 - i }
    }
    if (avecLire) {
      const ou = adresseDUneCase(l, i)
      if (ou && l[ou.apres]?.opcode === 0x7e) {
        return {
          cpp: `${ou.panneau ? 'lirePanneau' : 'lire'}(${ou.colonne}, ${ou.ligne})`,
          constante: null,
          combien: ou.apres + 1 - i,
        }
      }
    }
    const simple = valeurDans(l[i])
    return simple ? { ...simple, combien: 1 } : null
  }

  /**
   * L'adresse d'une case de l'écran, dans `hl`.
   *
   * Deux nombres écrits en clair : l'adresse est connue, « ld hl, $9909 ».
   * Sinon, la routine AdresseCase la calcule : la colonne dans `e`, la ligne
   * dans `a`, le haut de la carte dans `d`.
   *
   *   ld e, 3 : ldh a, [y] : ld d, $98 : call AdresseCase
   *   ldh a, [x] : ld e, a : ldh a, [y] : ld d, $98 : call AdresseCase
   *
   * Et quand la ligne se calcule (une case de tableau), la colonne attend sur
   * la pile : « push af … ld l, a : pop af : ld e, a : ld a, l ».
   */
  const adresseDUneCase = (l, i) => {
    if (l[i]?.opcode === 0x21) { // ld hl, nn
      const ou = caseDe(l[i].nn)
      return ou ? { colonne: String(ou.colonne), ligne: String(ou.ligne), panneau: ou.ou === 'panneau', apres: i + 1 } : null
    }

    let colonne
    let ligne
    let k
    if (l[i]?.opcode === 0x1e) { // ld e, n
      colonne = String(l[i].n)
      ligne = valeurA(l, i + 1, false)
      if (!ligne) return null
      k = i + 1 + ligne.combien
    } else {
      const c = valeurA(l, i, false)
      if (!c) return null
      colonne = c.cpp
      k = i + c.combien
      if (l[k]?.opcode === 0x5f) { // ld e, a
        ligne = valeurA(l, k + 1, false)
        if (!ligne) return null
        k += 1 + ligne.combien
      } else if (l[k]?.opcode === 0xf5) { // push af
        ligne = valeurA(l, k + 1, false)
        if (!ligne) return null
        k += 1 + ligne.combien
        const attendu = [0x6f, 0xf1, 0x5f, 0x7d] // ld l, a : pop af : ld e, a : ld a, l
        if (attendu.some((op, j) => l[k + j]?.opcode !== op)) return null
        k += 4
      } else {
        return null
      }
    }
    if (l[k]?.opcode !== 0x16) return null // ld d, n
    if (nomDeRoutine(l[k + 1]?.cible) !== 'AdresseCase') return null
    return { colonne, ligne: ligne.cpp, panneau: l[k].n === CARTE_PANNEAU >> 8, apres: k + 2 }
  }

  /** Le nom du dessin qui porte ce numéro, quand on le connaît. */
  const tuileDe = (valeur) =>
    valeur.constante === null ? valeur.cpp : (nomsDeTuile.get(valeur.constante) ?? valeur.cpp)

  /* ------------------------------------------------ les conditions */

  /*
   * Une condition saute : un « if » ou un « while » calcule, puis saute à sa
   * fin si c'est FAUX. Le saut dit la comparaison — « cp 20 : jp nc » saute
   * quand ce n'est pas plus petit : la condition était « < 20 ».
   */
  const SI_FAUX = { 0xc2: '==', 0xca: '!=', 0xd2: '<', 0xda: '>=' }

  /** Un test qui saute quand il est faux : son C++, sa longueur, où il saute. */
  const testA = (l, i) => {
    /* bouton(X) : la manette lue, un bit testé, et « jp z » s'il n'est pas pressé. */
    if (nomDeRoutine(l[i]?.cible) === 'LireManette' && l[i + 1]?.opcode === 0xcb && l[i + 2]?.opcode === 0xca) {
      const bit = (l[i + 1].second - 0x47) / 8
      if (Number.isInteger(bit) && bit >= 0 && bit < 8) {
        return { cpp: `bouton(${BOUTONS[bit]})`, combien: 3, cible: l[i + 2].cible }
      }
    }

    const premier = valeurA(l, i)
    if (!premier) return null
    const k = i + premier.combien

    /* « x < limite » : la droite chargée d'abord, dans `b`, puis la gauche. */
    if (l[k]?.opcode === 0x47) { // ld b, a
      const gauche = valeurA(l, k + 1)
      const j = gauche ? k + 1 + gauche.combien : -1
      if (gauche && l[j]?.opcode === 0x90 && SI_FAUX[l[j + 1]?.opcode]) {
        return { cpp: `${gauche.cpp} ${SI_FAUX[l[j + 1].opcode]} ${premier.cpp}`, combien: j + 2 - i, cible: l[j + 1].cible }
      }
    }

    /* « x < 20 » : cp 20, puis le saut. */
    if (l[k]?.opcode === 0xfe && SI_FAUX[l[k + 1]?.opcode]) {
      return { cpp: `${premier.cpp} ${SI_FAUX[l[k + 1].opcode]} ${l[k].n}`, combien: premier.combien + 2, cible: l[k + 1].cible }
    }

    /* « if (vivant) » : or a : jp z — et « x == 0 » : or a : jp nz. */
    if (l[k]?.opcode === 0xb7 && (l[k + 1]?.opcode === 0xca || l[k + 1]?.opcode === 0xc2)) {
      const cpp = l[k + 1].opcode === 0xca ? premier.cpp : `${premier.cpp} == 0`
      return { cpp, combien: premier.combien + 2, cible: l[k + 1].cible }
    }

    /* Deux valeurs calculées : la première poussée, la seconde, la soustraction. */
    if (l[k]?.opcode === 0xf5) { // push af
      const second = valeurA(l, k + 1)
      const j = second ? k + 1 + second.combien : -1
      if (second && l[j]?.opcode === 0x47 && l[j + 1]?.opcode === 0xf1 && l[j + 2]?.opcode === 0x90 &&
          SI_FAUX[l[j + 3]?.opcode]) {
        return {
          cpp: `${premier.cpp} ${SI_FAUX[l[j + 3].opcode]} ${second.cpp}`,
          combien: j + 4 - i,
          cible: l[j + 3].cible,
        }
      }
    }

    return null
  }

  /**
   * Des tests qui sautent tous au MÊME endroit : c'est un « && ». Le premier
   * faux sort ; tous vrais, on entre.
   */
  const conditionA = (l, i) => {
    const premier = testA(l, i)
    if (!premier) return null
    const parties = [premier.cpp]
    let combien = premier.combien
    for (let suite = testA(l, i + combien); suite && suite.cible === premier.cible; suite = testA(l, i + combien)) {
      parties.push(suite.cpp)
      combien += suite.combien
    }
    return { cpp: parties.join(' && '), combien, cible: premier.cible }
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
      const ou = adresseDUneCase(l, i)
      if (!ou) return null
      const k = ou.apres
      if (l[k]?.opcode !== 0x11 || l[k + 1]?.opcode !== 0x06) return null // ld de, nn : ld b, n
      if (nomDeRoutine(l[k + 2]?.cible) !== 'EcrireTexte') return null
      const mot = texteGrave(octets, base, l[k].nn, l[k + 1].n)
      if (mot === null) return null
      return {
        cpp: `${ou.panneau ? 'textePanneau' : 'texte'}(${ou.colonne}, ${ou.ligne}, "${mot}");`,
        combien: k + 3 - i,
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
      const ou = adresseDUneCase(l, i)
      if (!ou || l[ou.apres]?.opcode !== 0x06) return null // ld b, n
      if (nomDeRoutine(l[ou.apres + 1]?.cible) !== 'EffacerCases') return null
      return {
        cpp: `${ou.panneau ? 'effacerPanneau' : 'effacer'}(${ou.colonne}, ${ou.ligne}, ${l[ou.apres].n});`,
        combien: ou.apres + 2 - i,
      }
    },

    /* ecran(0) / ecran(1) — la valeur écrite dit lequel. */
    (l, i) => {
      if (l[i]?.opcode !== 0x3e || !(l[i + 1]?.opcode === 0xe0 && l[i + 1].n === 0x40)) return null
      return { cpp: `ecran(${l[i].n & 0x80 ? 1 : 0});`, combien: 2 }
    },

    /* poser(colonne, ligne, tuile) — l'adresse, la tuile, « ld [hl], a ». */
    (l, i) => {
      const ou = adresseDUneCase(l, i)
      if (!ou) return null
      const tuile = valeurA(l, ou.apres, false)
      if (!tuile || l[ou.apres + tuile.combien]?.opcode !== 0x77) return null // ld [hl], a
      return {
        cpp: `${ou.panneau ? 'poserPanneau' : 'poser'}(${ou.colonne}, ${ou.ligne}, ${tuileDe(tuile)});`,
        combien: ou.apres + tuile.combien + 1 - i,
      }
    },

    /* poser(…) d'une tuile calculée : elle attend dans le brouillon pendant
       qu'on calcule l'adresse. */
    (l, i) => {
      const tuile = valeurA(l, i)
      if (!tuile) return null
      const k = i + tuile.combien
      if (!(l[k]?.opcode === 0xe0 && (0xff00 | l[k].n) === BROUILLON2)) return null
      const ou = adresseDUneCase(l, k + 1)
      if (!ou) return null
      const reprise = l[ou.apres]
      if (!(reprise?.opcode === 0xf0 && (0xff00 | reprise.n) === BROUILLON2)) return null
      if (l[ou.apres + 1]?.opcode !== 0x77) return null // ld [hl], a
      return {
        cpp: `${ou.panneau ? 'poserPanneau' : 'poser'}(${ou.colonne}, ${ou.ligne}, ${tuileDe(tuile)});`,
        combien: ou.apres + 2 - i,
      }
    },

    /* t[i] = v — l'adresse de la case, la valeur, « ld [hl], a ». */
    (l, i) => {
      const place = caseDeTableau(l, i)
      if (!place) return null
      const valeur = valeurA(l, place.apres)
      if (!valeur || l[place.apres + valeur.combien]?.opcode !== 0x77) return null
      return { cpp: `${place.cpp} = ${valeur.cpp};`, combien: place.apres + valeur.combien + 1 - i }
    },

    /* t[i] = t[i] + 1 — la valeur attend dans le brouillon pendant qu'on
       calcule l'adresse de la case. */
    (l, i) => {
      const valeur = valeurA(l, i)
      if (!valeur) return null
      const k = i + valeur.combien
      if (!(l[k]?.opcode === 0xe0 && (0xff00 | l[k].n) === BROUILLON)) return null
      const place = caseDeTableau(l, k + 1)
      if (!place) return null
      const reprise = l[place.apres]
      if (!(reprise?.opcode === 0xf0 && (0xff00 | reprise.n) === BROUILLON)) return null
      if (l[place.apres + 1]?.opcode !== 0x77) return null
      return { cpp: `${place.cpp} = ${valeur.cpp};`, combien: place.apres + 2 - i }
    },

    /* x++ seul sur sa ligne : lu, avancé, rangé au même endroit. */
    (l, i) => {
      const lu = valeurDans(l[i])
      if (!lu || lu.constante !== null) return null
      const pas = l[i + 1]?.opcode === 0x3c ? '++' : l[i + 1]?.opcode === 0x3d ? '--' : null
      if (!pas || ecritDans(l[i + 2]) !== lu.cpp) return null
      return { cpp: `${lu.cpp}${pas};`, combien: 3 }
    },

    /* x++ dont on garde la valeur d'AVANT, dans `c`, comme le veut « x++ ». */
    (l, i) => {
      const lu = valeurDans(l[i])
      if (!lu || lu.constante !== null || l[i + 1]?.opcode !== 0x4f) return null // ld c, a
      const pas = l[i + 2]?.opcode === 0x3c ? '++' : l[i + 2]?.opcode === 0x3d ? '--' : null
      if (!pas || ecritDans(l[i + 3]) !== lu.cpp || l[i + 4]?.opcode !== 0x79) return null
      return { cpp: `${lu.cpp}${pas};`, combien: 5 }
    },

    /* x = 3 ; x = y + 1 ; x = t[i] ; x = lire(…) — une valeur, rangée. */
    (l, i) => {
      const valeur = valeurA(l, i)
      const cible = valeur ? ecritDans(l[i + valeur.combien]) : null
      if (!cible) return null
      return { cpp: `${cible} = ${valeur.cpp};`, combien: valeur.combien + 1 }
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
        /* Le test de la boucle saute juste APRÈS le saut de retour : c'est sa sortie. */
        const cond = lecteur.conditionA(l, i)
        const sortieVoulue = retour + 1 < l.length ? l[retour + 1].adresse : null
        const avecTest = Boolean(cond) && cond.cible === sortieVoulue

        dire(`while (${avecTest ? cond.cpp : 'true'}) {`)
        sortie.push(...rendreBloc(
          l, avecTest ? i + cond.combien : i, retour, lecteur, marge + '  ', compte, profondeur + 1,
        ))
        dire('}')
        /* Le saut de retour, et le test s'il y en avait un : lus, tous. */
        const combien = 1 + (avecTest ? cond.combien : 0)
        compte.reconnues += combien
        compte.total += combien
        i = retour + 1
        continue
      }
    }

    /* --- une condition : un test qui saute par-dessus quand il est faux --- */
    if (profondeur < 12) {
      const cond = lecteur.conditionA(l, i)
      if (cond) {
        const finSi = indexDe(cond.cible)
        if (finSi > i && finSi <= fin) {
          compte.reconnues += cond.combien
          compte.total += cond.combien

          /* Un « else » se voit à un saut inconditionnel juste avant la fin du
             « si » : la branche vraie enjambe la branche fausse. */
          const dernier = l[finSi - 1]
          const versLaFin = dernier && dernier.opcode === 0xc3 ? indexDe(dernier.cible) : -1
          const avecSinon = versLaFin > finSi && versLaFin <= fin

          dire(`if (${cond.cpp}) {`)
          sortie.push(...rendreBloc(
            l, i + cond.combien, avecSinon ? finSi - 1 : finSi, lecteur, marge + '  ', compte, profondeur + 1,
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

  /*
   * Les « #include » : le programme remonté emploie des fonctions de la
   * console, il doit les inclure pour recompiler. On les écrit en tête, comme
   * le compilateur les relève. Un programme à trous (des instructions laissées
   * en commentaire) peut ne pas compiler : il reste alors sans eux.
   */
  let texte = [...entete, ...declarations, ...corps].join('\n')
  try {
    texte = avecLesInclusions(texte)
  } catch {
    /* il ne compile pas : rien à relever */
  }

  return {
    texte,
    reconnues: compte.reconnues,
    total: compte.total,
    part,
    routines: routines.size,
    fonctions: departs.length,
  }
}

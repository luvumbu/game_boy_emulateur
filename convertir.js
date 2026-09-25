/**
 * Convertir une cartouche en ce qu'on peut en tirer : ses DESSINS.
 *
 * Il faut séparer deux choses que tout le monde confond, et c'est la raison
 * d'être de ce fichier :
 *
 *   - **Le code ne se convertit pas.** Le C++ n'entre jamais dans la
 *     cartouche ; la compilation jette les noms, les commentaires, la forme des
 *     boucles. `desassembleur.js` montre les instructions, et c'est tout ce
 *     qu'on peut honnêtement montrer.
 *
 *   - **Les dessins, si.** Une tuile est un format fixe — seize octets, deux
 *     plans de bits —, le même depuis 1989. Ce qui est en mémoire vidéo peut
 *     donc être relu exactement, et réécrit en `Tuile NOM = {…}`.
 *
 * On lit la MÉMOIRE VIDÉO de la console en train de tourner, et non la
 * cartouche : un jeu range ses dessins où il veut dans ses 32 Ko, souvent
 * compressés, et personne ne peut deviner où. Une fois le jeu lancé, en
 * revanche, ce qu'il affiche est là, décompressé, à une adresse connue.
 */

import { ORDRE } from './compilateur/police.js'

/** La mémoire des tuiles : 384 carrés de huit, seize octets chacun. */
const MEMOIRE_TUILES = 0x8000
const COMBIEN = 384
const OCTETS_PAR_TUILE = 16

const CARTE_FOND = 0x9800
const CARTE_PANNEAU = 0x9c00
const COLONNES = 20
const LIGNES = 18

/** Le saut de ligne, nommé : ce fichier écrit du C++, pas des chaînes. */
const SAUT = String.fromCharCode(10)

/** Le nom d'une tuile prise : il est inventé ici, la cartouche n'en portait pas. */
const nomDePrise = (i) => 'PRISE' + String(i + 1).padStart(2, '0')

/** Du plus clair au plus sombre — les signes que le compilateur attend. */
const SIGNES = ['.', '-', '+', '#']

/**
 * Les huit rangées d'une tuile, lues à son adresse.
 *
 * Le matériel range un pixel sur DEUX plans : le bit de poids faible dans le
 * premier octet, celui de poids fort dans le second. C'est ce qui permet à
 * quatre nuances de tenir sur deux octets par rangée — et c'est exactement
 * l'inverse de ce que fait `octetsDeLaRangee()` dans l'émetteur.
 */
function rangeesDeLaTuile(lire, adresse) {
  const rangees = []

  for (let y = 0; y < 8; y++) {
    const bas = lire(adresse + y * 2)
    const haut = lire(adresse + y * 2 + 1)
    let rangee = ''

    for (let x = 0; x < 8; x++) {
      const bit = 7 - x
      const nuance = ((bas >> bit) & 1) | (((haut >> bit) & 1) << 1)
      rangee += SIGNES[nuance]
    }

    rangees.push(rangee)
  }

  return rangees
}

/**
 * Les tuiles qu'une console tient en mémoire vidéo, en ce moment.
 *
 * Les vides sont laissées de côté — il y en a toujours des dizaines —, et les
 * doubles aussi : un jeu recopie souvent le même dessin à plusieurs numéros, et
 * les rendre tous donnerait vingt fois la même tuile à repeindre.
 */
export function tuilesDeLaMemoire(gb, { combien = COMBIEN } = {}) {
  const lire = (adresse) => gb.mmu.read(adresse)
  const trouvees = []
  const deja = new Set()

  for (let numero = 0; numero < combien; numero++) {
    const rangees = rangeesDeLaTuile(lire, MEMOIRE_TUILES + numero * OCTETS_PAR_TUILE)
    const empreinte = rangees.join('')

    if (empreinte === '.'.repeat(64)) continue // une tuile vide n'apprend rien
    if (deja.has(empreinte)) continue
    deja.add(empreinte)

    trouvees.push({ numero, rangees })
  }

  return trouvees
}

/**
 * Le fichier C++ que ces tuiles font.
 *
 * Le numéro d'origine est gardé en commentaire : c'est le seul lien qui reste
 * entre la tuile et la cartouche d'où elle vient — le nom, lui, n'a jamais
 * existé dans les octets.
 */
export function fichierDesTuiles(tuiles, { titre = 'la cartouche' } = {}) {
  const entete = [
    '/*',
    ` * Les dessins tirés de ${titre}.`,
    ' *',
    ' * Ils viennent de la MÉMOIRE VIDÉO de la console : ce que la cartouche y',
    ' * avait chargé au moment de la conversion. Le code, lui, ne se convertit',
    ' * pas — il n’entre jamais dans une cartouche sous forme de C++.',
    ' *',
    ' * Les noms sont inventés ici : la cartouche n’en portait aucun. Renomme-les',
    ' * pour ce qu’ils sont, et repeins-les dans « Les tuiles ».',
    ' */',
    '',
  ]

  const blocs = tuiles.map(({ numero, rangees }, i) => [
    `/* tuile n° ${numero} de la cartouche */`,
    `Tuile ${nomDePrise(i)} = {`,
    ...rangees.map((r) => `  "${r}",`),
    '};',
    '',
  ].join('\n'))

  return entete.concat(blocs).join('\n')
}

/* --------------------------------------------- ce que l'écran montre */

/**
 * La carte du fond, telle qu'elle est en ce moment.
 *
 * C'est le second morceau qui se récupère exactement : une case de la carte est
 * un numéro de tuile, un octet, à une adresse connue. Le décor d'un jeu — la
 * disposition, pas les dessins — est là, et il se réécrit en `poser()`.
 *
 * On ne rend que les 20 × 18 cases VISIBLES. La carte en fait 32 × 32 : le
 * reste est ce qui attend hors de l'écran pour le défilement, et le poser
 * afficherait un décor que personne n'a jamais vu.
 */
export function carteDeLEcran(gb, { panneau = false } = {}) {
  const base = panneau ? CARTE_PANNEAU : CARTE_FOND
  const cases = []
  for (let ligne = 0; ligne < LIGNES; ligne++) {
    for (let colonne = 0; colonne < COLONNES; colonne++) {
      cases.push({ colonne, ligne, tuile: gb.mmu.read(base + ligne * 32 + colonne) })
    }
  }
  return cases
}

/**
 * Ce que l'écran DIT, lu à travers la police.
 *
 * Une case porte un numéro de tuile ; si ce numéro est celui d'une lettre de la
 * police du projet, alors l'écran écrit un mot. C'est vrai des cartouches
 * compilées ici, et faux de toutes les autres — un jeu du commerce a sa propre
 * police, à ses propres numéros, et ce qu'on lirait serait du charabia.
 *
 * On ne rend donc que les suites d'au moins trois caractères lisibles : le
 * hasard produit des lettres isolées, jamais des mots.
 */
export function textesDeLEcran(gb, { panneau = false } = {}) {
  const base = panneau ? CARTE_PANNEAU : CARTE_FOND
  const trouves = []

  for (let ligne = 0; ligne < LIGNES; ligne++) {
    let mot = ''
    let depart = 0
    for (let colonne = 0; colonne <= COLONNES; colonne++) {
      const numero = colonne < COLONNES ? gb.mmu.read(base + ligne * 32 + colonne) : 255
      const signe = colonne < COLONNES ? ORDRE[numero] : undefined

      /* Le vide coupe un mot, mais un espace au milieu ne le coupe pas :
         « GAME BOY » est une phrase, et non deux mots sans rapport. */
      if (signe !== undefined && !(signe === ' ' && mot === '')) {
        if (mot === '') depart = colonne
        mot += signe
        continue
      }

      const propre = mot.trimEnd()
      if (propre.replace(/[^A-Z0-9]/g, '').length >= 3) {
        trouves.push({ colonne: depart, ligne, texte: propre })
      }
      mot = ''
    }
  }

  return trouves
}

/**
 * Les palettes de la console, sur Game Boy Color.
 *
 * Chaque teinte tient sur quinze bits, cinq par composante — le vert est à
 * cheval sur deux octets. Sur une console d'origine il n'y a rien à lire : la
 * fonction rend « null », ce qui est la vérité.
 */
export function palettesDeLaMemoire(gb) {
  const ppu = gb.ppu
  /* Le matériel range les huit palettes à la file, deux octets par teinte : le
     bas d'abord, le haut ensuite. Soixante-quatre octets pour trente-deux
     teintes, et pas un séparateur. */
  const table = ppu?.bgPalettes ?? null
  if (!ppu?.couleur || !table) return null

  const rendues = []
  for (let palette = 0; palette < 8; palette++) {
    const teintes = []
    for (let teinte = 0; teinte < 4; teinte++) {
      const ou = palette * 8 + teinte * 2
      const quinze = table[ou] | (table[ou + 1] << 8)
      teintes.push({ rouge: quinze & 31, vert: (quinze >> 5) & 31, bleu: (quinze >> 10) & 31 })
    }
    rendues.push(teintes)
  }
  return rendues
}

/**
 * Tout ce qui se récupère d'une cartouche, en un seul fichier C++.
 *
 * Les dessins, le décor, les palettes, et les mots qui sont à l'écran. C'est
 * beaucoup moins qu'un programme — il n'y a ici aucune règle du jeu, aucune
 * réaction à une touche — et c'est tout ce que les octets contiennent
 * réellement. Le reste, `retour-cpp.js` le tente sur les cartouches faites ici.
 */
export function fichierDeLaCartouche(gb, { titre = 'la cartouche' } = {}) {
  const tuiles = tuilesDeLaMemoire(gb)
  /*
   * Chaque numéro vers SON dessin — les doubles compris.
   *
   * « tuilesDeLaMemoire » écarte les doublons, et c'est ce qu'il faut pour la
   * liste des déclarations. Mais la carte, elle, les emploie : un jeu recopie
   * volontiers la même tuile à trois numéros. En ne reliant que le premier, on
   * laissait deux cases sur trois hors du décor — et le décor rendu avait des
   * trous que rien n'expliquait.
   */
  const lire = (adresse) => gb.mmu.read(adresse)
  const parDessin = new Map(tuiles.map(({ rangees }, i) => [rangees.join(''), nomDePrise(i)]))
  const numeroVers = new Map()
  for (let numero = 0; numero < COMBIEN; numero++) {
    const nom = parDessin.get(rangeesDeLaTuile(lire, MEMOIRE_TUILES + numero * OCTETS_PAR_TUILE).join(''))
    if (nom) numeroVers.set(numero, nom)
  }
  const cases = carteDeLEcran(gb).filter(({ tuile }) => numeroVers.has(tuile))
  const textes = textesDeLEcran(gb)
  const palettes = palettesDeLaMemoire(gb)

  const lignes = [
    '/*',
    ' * Ce qui a pu être tiré de ' + titre + '.',
    ' *',
    ' * Quatre choses se récupèrent exactement, parce qu’elles ont un format fixe',
    ' * et une adresse connue : les DESSINS, le DÉCOR posé à l’écran, les',
    ' * PALETTES, et les MOTS affichés. Tout est lu dans la console EN TRAIN DE',
    ' * TOURNER — un jeu range ses dessins où il veut dans ses 32 Ko, souvent',
    ' * compressés, et personne ne peut deviner où.',
    ' *',
    ' * Ce qui ne s’y trouve pas : LE PROGRAMME. Aucune règle du jeu, aucune',
    ' * réaction à une touche, aucune boucle. Le C++ n’entre jamais dans une',
    ' * cartouche. Pour une cartouche compilée ici, « ⇱ Retour au C++ » en remonte',
    ' * ce qui peut l’être ; pour les autres, ce fichier est le maximum.',
    ' */',
    '',
  ]

  for (const { numero, rangees } of tuiles) {
    lignes.push(
      '/* tuile n° ' + numero + ' de la cartouche */',
      'Tuile ' + numeroVers.get(numero) + ' = {',
      ...rangees.map((r) => '  "' + r + '",'),
      '};',
      '',
    )
  }

  lignes.push('int main() {')

  if (palettes) {
    lignes.push('  /* Les palettes, telles que la console les portait. */')
    palettes.forEach((teintes, palette) => {
      teintes.forEach(({ rouge, vert, bleu }, teinte) => {
        lignes.push(`  couleurFond(${palette}, ${teinte}, ${rouge}, ${vert}, ${bleu});`)
      })
    })
    lignes.push('')
  }

  if (textes.length) {
    lignes.push('  /* Les mots qui étaient à l’écran, relus à travers la police. */')
    for (const { colonne, ligne, texte } of textes) {
      lignes.push(`  texte(${colonne}, ${ligne}, "${texte}");`)
    }
    lignes.push('')
  }

  if (cases.length) {
    lignes.push(`  /* Le décor : ${cases.length} cases, telles qu’elles étaient posées. */`)
    for (const { colonne, ligne, tuile } of cases) {
      lignes.push(`  poser(${colonne}, ${ligne}, ${numeroVers.get(tuile)});`)
    }
    lignes.push('')
  }

  lignes.push('  while (true) {', '    image();', '  }', '', '  return 0;', '}', '')

  return lignes.join(SAUT)
}

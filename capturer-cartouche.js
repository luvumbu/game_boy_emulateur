/**
 * Prendre TOUS les dessins d'une cartouche — pas seulement ceux qu'on voit.
 *
 * « Capturer les lutins » (capturer-lutins.js) relit l'écran : il n'attrape que
 * ce que le jeu montre en ce moment. Les dessins des autres niveaux, des
 * ennemis qu'on n'a pas encore croisés, de la fin du jeu, dorment dans la
 * cartouche. Deux façons d'aller les chercher :
 *
 *   1. LIRE LA CARTOUCHE ENTIÈRE. Sur Game Boy (et Game Boy Color), une tuile
 *      fait toujours 16 octets : 8 rangées de 2 octets (le bit « bas » et le
 *      bit « haut » de chaque pixel — exactement comme dans la VRAM). On
 *      découpe donc le fichier, du premier octet au dernier, en morceaux de
 *      16, et on les dessine. Le CODE du jeu donne du « bruit » (des pixels au
 *      hasard) ; les DESSINS ressortent, bien rangés. Ça attrape tout ce qui
 *      n'est pas compressé, même ce qu'on n'a jamais vu.
 *
 *   2. LE COLLECTEUR. Certains jeux compressent leurs dessins : dans la
 *      cartouche, ils ressemblent à du bruit. Mais pour les montrer, le jeu
 *      DOIT les décompresser dans la mémoire vidéo. Le collecteur relit donc
 *      toute la VRAM (les 384 tuiles, et les 384 de la seconde banque sur
 *      Game Boy Color) à chaque image pendant qu'on joue, et garde chaque tuile
 *      nouvelle — même si le jeu l'efface ensuite.
 *
 * À eux deux : presque tout. Ce qui manque, c'est un dessin compressé ET
 * jamais chargé pendant qu'on jouait — il faudrait, pour lui, un décompresseur
 * écrit exprès pour ce jeu-là.
 *
 * Ce fichier ne connaît pas la page : il rend des tuiles (8 rangées de 8
 * chiffres, 0 à 3). C'est planche-cartouche.js qui les montre.
 */

/** Une tuile = 16 octets. */
export const OCTETS_PAR_TUILE = 16

/** Une banque de cartouche = 16 Ko = 1024 tuiles : c'est une « page » de la planche. */
export const OCTETS_PAR_BANQUE = 16384
export const TUILES_PAR_BANQUE = OCTETS_PAR_BANQUE / OCTETS_PAR_TUILE

/**
 * Les 16 octets qui commencent à « debut » → 8 rangées de 8 chiffres.
 * Pour chaque rangée : le premier octet donne le bit de poids faible de
 * chaque pixel, le second le bit de poids fort ; le pixel de gauche est le
 * bit 7. Au-delà de la fin du fichier, on compte des zéros.
 */
export function tuileEnRangees(octets, debut) {
  const rangees = []
  for (let y = 0; y < 8; y++) {
    const bas = octets[debut + y * 2] ?? 0
    const haut = octets[debut + y * 2 + 1] ?? 0
    let rangee = ''
    for (let x = 0; x < 8; x++) rangee += ((haut >> (7 - x)) & 1) << 1 | ((bas >> (7 - x)) & 1)
    rangees.push(rangee)
  }
  return rangees
}

/**
 * Dessin, vide, ou bruit ?
 *
 *   « vide »   : que des 0 (rien à prendre) ;
 *   « bruit »  : des pixels au hasard — du code, des nombres, du compressé ;
 *   « dessin » : le reste.
 *
 * Comment reconnaître le hasard ? Dans un dessin, un pixel ressemble presque
 * toujours à son voisin : les traits sont continus, les aplats sont pleins.
 * Au hasard, deux voisins n'ont qu'une chance sur quatre d'être pareils. On
 * compte donc les voisins pareils (à droite et en dessous : 112 paires) : moins
 * de la moitié, c'est du bruit. Ce n'est pas parfait — un dessin très fin peut
 * passer pour du bruit, c'est pourquoi la planche permet de tout montrer.
 */
export function natureDUneTuile(rangees) {
  if (rangees.every((r) => r === '00000000')) return 'vide'
  return lisseDUneTuile(rangees) < 0.5 ? 'bruit' : 'dessin'
}

/** La part des paires de voisins pareils, de 0 (hasard total) à 1 (tout d'une couleur). */
export function lisseDUneTuile(rangees) {
  let pareils = 0
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      if (x < 7 && rangees[y][x] === rangees[y][x + 1]) pareils++
      if (y < 7 && rangees[y][x] === rangees[y + 1][x]) pareils++
    }
  }
  return pareils / 112
}

/*
 * Le tri tuile par tuile se trompe parfois : un bout de code plein de zéros
 * peut sembler « lisse », un dessin très fin peut sembler « au hasard ». Or,
 * dans une cartouche, les dessins sont rangés EN PAQUETS, les uns derrière les
 * autres. On regarde donc aussi les voisines :
 *   - un « dessin » tout seul au milieu du bruit (aucune voisine dessin) est
 *     sans doute du code → bruit ;
 *   - un « bruit » presque lisse (au moins 0,35) pris entre deux dessins est
 *     sans doute un dessin fin → dessin.
 * (Le vide ne compte pas : il sépare souvent deux dessins d'un même paquet.)
 */
function trierAvecLesVoisines(tuiles) {
  const avant = tuiles.map((t) => t.nature)
  const voisine = (i, pas) => {
    for (let k = i + pas; k >= 0 && k < tuiles.length; k += pas) if (avant[k] !== 'vide') return avant[k]
    return null
  }
  tuiles.forEach((t, i) => {
    if (avant[i] === 'vide') return
    const g = voisine(i, -1), d = voisine(i, 1)
    if (avant[i] === 'dessin' && g !== 'dessin' && d !== 'dessin') t.nature = 'bruit'
    else if (avant[i] === 'bruit' && g === 'dessin' && d === 'dessin' && lisseDUneTuile(t.rangees) >= 0.35) t.nature = 'dessin'
  })
  return tuiles
}

/** Combien de banques (de pages) dans cette cartouche. */
export const nombreDeBanques = (rom) => Math.ceil(rom.length / OCTETS_PAR_BANQUE)

/**
 * Les 1024 tuiles d'une banque. « decalage » (0 à 15) : pour les rares jeux
 * dont les tuiles ne commencent pas sur un multiple de 16 — on glisse tout
 * d'un octet, puis de deux…
 * Rend [{ adresse, rangees, nature }] — « adresse » : la place dans le fichier.
 */
export function tuilesDUneBanque(rom, banque, decalage = 0) {
  const tuiles = []
  for (let i = 0; i < TUILES_PAR_BANQUE; i++) {
    const adresse = banque * OCTETS_PAR_BANQUE + i * OCTETS_PAR_TUILE + decalage
    if (adresse >= rom.length) break
    const rangees = tuileEnRangees(rom, adresse)
    tuiles.push({ adresse, rangees, nature: natureDUneTuile(rangees) })
  }
  return trierAvecLesVoisines(tuiles)
}

/** Toutes les tuiles de la cartouche, banque après banque. */
export function toutesLesTuiles(rom, decalage = 0) {
  const toutes = []
  for (let b = 0; b < nombreDeBanques(rom); b++) toutes.push(...tuilesDUneBanque(rom, b, decalage))
  return toutes
}

/**
 * Plusieurs tuiles qui se suivent → un dessin de « cote » × « cote »
 * (8, 16 ou 32 : 1, 4 ou 16 tuiles).
 *
 * Un personnage de 16 × 16 est rangé dans l'un de trois ordres :
 *   « grille »   : un carré DANS LA PLANCHE de 16 tuiles par rangée — les
 *                  deux du haut se suivent, les deux du bas sont 16 tuiles
 *                  plus loin (Super Mario Land 2, et beaucoup d'autres) ;
 *   « lignes »   : 4 tuiles qui se suivent : haut-gauche, haut-droite,
 *                  bas-gauche, bas-droite ;
 *   « colonnes » : 4 tuiles qui se suivent : haut-gauche, bas-gauche,
 *                  haut-droite, bas-droite — l'ordre des jeux qui ont des
 *                  lutins de 8 × 16 (bit 2 de $FF40).
 * « tuiles » : la liste ; « depart » : la première. Ce qui manque est vide.
 */
export function assembler(tuiles, depart, cote, ordre = 'lignes') {
  const n = cote / 8
  const grille = Array.from({ length: cote }, () => Array(cote).fill('0'))
  for (let j = 0; j < n * n; j++) {
    const col = ordre === 'colonnes' ? Math.floor(j / n) : j % n
    const lig = ordre === 'colonnes' ? j % n : Math.floor(j / n)
    const t = tuiles[ordre === 'grille' ? depart + lig * 16 + col : depart + j]
    if (!t) continue
    t.rangees.forEach((r, y) => [...r].forEach((c, x) => { grille[lig * 8 + y][col * 8 + x] = c }))
  }
  return { cote, rangees: grille.map((r) => r.join('')) }
}

/** Les 16 octets d'une tuile, en texte hexadécimal : sa « clé ». Deux tuiles pareilles ont la même. */
export function cleDUneTuile(octets, debut) {
  let cle = ''
  for (let k = 0; k < 16; k++) cle += (octets[debut + k] ?? 0).toString(16).padStart(2, '0')
  return cle
}
const CLE_VIDE = '0'.repeat(32)

/**
 * Le collecteur : il relit toute la VRAM et garde chaque tuile jamais vue.
 *
 * À chaque image, on ne regarde que les tuiles qui ont CHANGÉ depuis l'image
 * d'avant (on garde une copie de la VRAM) : une tuile qui ne bouge pas ne
 * coûte rien. Une tuile changée est comparée à toutes celles déjà gardées par
 * ses 16 octets : deux tuiles pareilles ne comptent qu'une fois.
 *
 * Seules les 384 premières places de chaque banque de 8 Ko sont des tuiles
 * ($8000 à $97FF) ; la suite, ce sont les cartes du décor — pas des dessins.
 *
 * Il note aussi À QUOI SERT chaque tuile — c'est ce qui permet de trier la
 * cartouche en « personnages » et « décor » :
 *   - une tuile pointée par un lutin de l'OAM (les 40 lutins, $FE00) est un
 *     morceau de PERSONNAGE (ce qui bouge : héros, ennemis, objets) ;
 *   - une tuile pointée par une case des deux cartes ($9800 et $9C00 : le
 *     fond et le panneau) est du DÉCOR.
 * Une tuile vue des deux façons compte comme personnage. Pour ne pas tout
 * refaire à chaque image, chaque place de tuile garde ce qu'on a déjà noté
 * pour son contenu ACTUEL ; on l'oublie quand le contenu change.
 *
 * Rend { ramasser(ppu), tuiles(), combien(), roles() } — roles() : une Map
 * clé (cleDUneTuile) → 'lutin' | 'decor'.
 */
export function creerUnCollecteur() {
  const vues = new Map()                       // 16 octets (en texte) → { adresse, rangees, nature }
  const avant = new Int16Array(16384).fill(-1) // -1 : jamais lu, donc « changé » au premier tour
  const cleDeLaPlace = new Array(768).fill(null) // la clé du contenu actuel de chaque place (384 × 2 banques)
  const note = new Uint8Array(768)             // bit 1 : déjà noté « lutin », bit 2 : déjà noté « décor »
  const roles = new Map()

  /* Noter qu'une place sert à « role » ; « lutin » l'emporte sur « decor ». */
  const noter = (place, bit, role) => {
    if (note[place] & bit) return
    note[place] |= bit
    const cle = cleDeLaPlace[place]
    if (!cle || cle === CLE_VIDE) return
    if (role === 'lutin' || !roles.has(cle)) roles.set(cle, role)
  }

  return {
    ramasser(ppu) {
      const vram = ppu.vram
      const banques = ppu.couleur ? 2 : 1
      for (let b = 0; b < banques; b++) {
        for (let t = 0; t < 384; t++) {
          const debut = b * 8192 + t * 16
          let change = false
          for (let k = 0; k < 16; k++) {
            if (avant[debut + k] !== vram[debut + k]) { change = true; avant[debut + k] = vram[debut + k] }
          }
          if (!change) continue
          const cle = cleDUneTuile(vram, debut)
          cleDeLaPlace[b * 384 + t] = cle
          note[b * 384 + t] = 0
          if (vues.has(cle)) continue
          const rangees = tuileEnRangees(vram, debut)
          const nature = natureDUneTuile(rangees)
          if (nature === 'vide') continue
          vues.set(cle, { adresse: 0x8000 + t * 16, banqueVram: b, rangees, nature })
        }
      }

      /* Les lutins : chacun pointe une tuile (deux en 8 × 16, bit 2 de $FF40). */
      const grands = (ppu.lcdc & 0x04) !== 0
      for (let n = 0; n < 40; n++) {
        const y = ppu.oam[n * 4], x = ppu.oam[n * 4 + 1]
        if (y === 0 || y >= 160 || x === 0 || x >= 168) continue   // rangé hors de l'écran
        const options = ppu.oam[n * 4 + 3]
        const banque = ppu.couleur && (options & 0x08) ? 384 : 0
        const tuile = ppu.oam[n * 4 + 2]
        if (grands) { noter(banque + (tuile & 0xfe), 1, 'lutin'); noter(banque + (tuile | 1), 1, 'lutin') }
        else noter(banque + tuile, 1, 'lutin')
      }

      /* Les deux cartes : chaque case pointe une tuile. Bit 4 de $FF40 à 1 :
         numéros 0 à 255 depuis $8000 ; à 0 : -128 à 127 autour de $9000. */
      const depuis8000 = (ppu.lcdc & 0x10) !== 0
      for (const carte of [0x1800, 0x1c00]) {
        for (let i = 0; i < 1024; i++) {
          const numero = vram[carte + i]
          const reglage = ppu.couleur ? vram[8192 + carte + i] : 0
          const place = (depuis8000 ? numero : numero < 128 ? 256 + numero : numero) + (reglage & 0x08 ? 384 : 0)
          noter(place, 2, 'decor')
        }
      }
    },
    tuiles: () => [...vues.values()],
    combien: () => vues.size,
    roles: () => roles,
  }
}

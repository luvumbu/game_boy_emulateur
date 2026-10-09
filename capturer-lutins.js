/**
 * Capturer les lutins d'un jeu qui tourne — le sien, ou une cartouche .gb
 * venue d'ailleurs — pour les ranger dans SES dessins.
 *
 * La console ne garde nulle part « le dessin du héros » : elle a une table de
 * quarante lutins (l'OAM, en $FE00), et chaque lutin dit seulement « à cette
 * place, la tuile numéro tant, retournée ou non ». Les tuiles, elles, sont
 * dans la mémoire vidéo (la VRAM, en $8000). Capturer, c'est donc relire les
 * deux, et refaire ce que fait l'écran :
 *
 *   1. chaque lutin visible : sa tuile (8 × 8, ou 8 × 16 si l'écran est réglé
 *      ainsi — le bit 2 de $FF40), retournée comme à l'écran (miroirs X et Y),
 *      prise dans la bonne banque de VRAM sur Game Boy Color (bit 3) ;
 *   2. les lutins qui se TOUCHENT forment un seul personnage : un héros de
 *      16 × 16 est fait de quatre lutins collés (ou de deux 8 × 16) ;
 *   3. chaque personnage devient un dessin de 8 × 8, 16 × 16 ou 32 × 32 — les
 *      tailles des dessins de l'atelier (Tuile, Perso, Grand) —, centré, et les
 *      dessins pareils ne sont gardés qu'une fois.
 *
 * Les chiffres des dessins sont ceux de la tuile : 0 transparent, 1, 2, 3 les
 * nuances. La palette du jeu n'est pas recopiée : le dessin prend celle de
 * ton programme.
 *
 * Ce fichier ne connaît ni la page ni l'atelier : on lui donne l'émulateur, il
 * rend des dessins (des rangées de chiffres). C'est la page qui les nomme et
 * les range.
 */

/** Les pixels d'une tuile de la VRAM : 8 rangées de 8 nombres (0 à 3). */
export function pixelsDUneTuile(vram, numero, banque = 0) {
  const debut = banque * 8192 + numero * 16
  return Array.from({ length: 8 }, (_, y) => {
    const bas = vram[debut + y * 2]
    const haut = vram[debut + y * 2 + 1]
    return Array.from({ length: 8 }, (_, x) => ((haut >> (7 - x)) & 1) << 1 | ((bas >> (7 - x)) & 1))
  })
}

/**
 * Les lutins visibles, tels que l'écran les montre.
 * Rend [{ numero, x, y, largeur, hauteur, pixels }] — pixels : hauteur
 * rangées de 8 nombres, miroirs déjà appliqués.
 */
export function lutinsALEcran(gb) {
  const { oam, vram, couleur } = gb.ppu
  const grands = (gb.mmu.read(0xff40) & 0x04) !== 0   // le bit 2 de $FF40 : des lutins de 8 × 16
  const hauteur = grands ? 16 : 8
  const lutins = []
  for (let n = 0; n < 40; n++) {
    const y = oam[n * 4] - 16
    const x = oam[n * 4 + 1] - 8
    // hors de l'écran : un lutin « rangé » (caché) a souvent y = 0 ou x = 0
    if (y <= -hauteur || y >= 144 || x <= -8 || x >= 160) continue
    let tuile = oam[n * 4 + 2]
    const options = oam[n * 4 + 3]
    if (grands) tuile &= 0xfe                       // en 8 × 16, la tuile du haut est paire
    const banque = couleur && (options & 0x08) ? 1 : 0
    let pixels = pixelsDUneTuile(vram, tuile, banque)
    if (grands) pixels = pixels.concat(pixelsDUneTuile(vram, tuile + 1, banque))
    if (options & 0x20) pixels = pixels.map((r) => r.slice().reverse())   // miroir X
    if (options & 0x40) pixels = pixels.slice().reverse()                // miroir Y
    if (pixels.every((r) => r.every((v) => v === 0))) continue          // tout transparent : rien à voir
    lutins.push({ numero: n, x, y, largeur: 8, hauteur, pixels })
  }
  return lutins
}

/**
 * Les lutins qui se touchent, réunis : chaque groupe est un personnage.
 * Deux lutins se touchent quand leurs rectangles se chevauchent ou se collent
 * (moins d'un pixel d'écart). Rend [[lutin, lutin…], …].
 */
export function regrouper(lutins) {
  const groupe = lutins.map((_, i) => i)
  const chef = (i) => (groupe[i] === i ? i : (groupe[i] = chef(groupe[i])))
  const touchent = (a, b) => a.x <= b.x + b.largeur && b.x <= a.x + a.largeur && a.y <= b.y + b.hauteur && b.y <= a.y + a.hauteur
  for (let i = 0; i < lutins.length; i++) {
    for (let j = i + 1; j < lutins.length; j++) {
      if (touchent(lutins[i], lutins[j])) groupe[chef(i)] = chef(j)
    }
  }
  const parChef = new Map()
  lutins.forEach((l, i) => {
    const c = chef(i)
    if (!parChef.has(c)) parChef.set(c, [])
    parChef.get(c).push(l)
  })
  return [...parChef.values()]
}

/** La taille de dessin qui contient « cote » pixels : 8, 16 ou 32 (au-delà, 32 : le reste est coupé). */
const coteDuDessin = (cote) => (cote <= 8 ? 8 : cote <= 16 ? 16 : 32)

/**
 * Un groupe de lutins → un dessin : « cote » rangées de « cote » chiffres.
 * Le personnage est posé au milieu de son carré. Là où deux lutins se
 * recouvrent, celui du plus petit numéro gagne — comme à l'écran.
 */
export function dessinDuGroupe(lutins) {
  const gauche = Math.min(...lutins.map((l) => l.x))
  const haut = Math.min(...lutins.map((l) => l.y))
  const largeur = Math.max(...lutins.map((l) => l.x + l.largeur)) - gauche
  const hauteur = Math.max(...lutins.map((l) => l.y + l.hauteur)) - haut
  const cote = coteDuDessin(Math.max(largeur, hauteur))
  const dx = Math.max(0, Math.floor((cote - largeur) / 2))
  const dy = Math.max(0, Math.floor((cote - hauteur) / 2))
  const grille = Array.from({ length: cote }, () => Array(cote).fill(0))
  // du plus grand numéro au plus petit : le plus petit est posé en dernier, donc devant
  for (const l of [...lutins].sort((a, b) => b.numero - a.numero)) {
    l.pixels.forEach((rangee, py) => rangee.forEach((v, px) => {
      const gx = l.x - gauche + px + dx, gy = l.y - haut + py + dy
      if (v && gx >= 0 && gy >= 0 && gx < cote && gy < cote) grille[gy][gx] = v
    }))
  }
  return { cote, rangees: grille.map((r) => r.join('')), lutins: lutins.length, coupe: largeur > 32 || hauteur > 32 }
}

/**
 * Tout en un : les personnages à l'écran, en dessins, sans doublon.
 * Rend [{ cote, rangees, lutins, coupe }] — du plus grand au plus petit.
 */
export function capturerLesLutins(gb) {
  const vus = new Set()
  return regrouper(lutinsALEcran(gb))
    .map(dessinDuGroupe)
    .filter((d) => {
      const cle = d.rangees.join('|')
      if (vus.has(cle)) return false
      vus.add(cle)
      return true
    })
    .sort((a, b) => b.lutins - a.lutins)
}

/* ===================================================================== */
/*  Le décor, le panneau, les couleurs                                    */
/* ===================================================================== */

/*
 * Une carte de 32 × 32 cases (le fond, ou le panneau), relue comme l'écran
 * la montre, en une grille de PIXELS de « colonnes × 8 » sur « lignes × 8 » —
 * la forme que l'atelier de la carte écrit (ecrireCarte, editeur-carte.js).
 *
 *   carte    où commence la carte dans la VRAM : $9800 ou $9C00 (bit 3 de
 *            $FF40 pour le fond, bit 6 pour le panneau) ;
 *   departX, departY   le pixel de la carte qui tombe au coin de la zone
 *            (le défilement, pour le fond) ; la carte fait le tour : 256 → 0 ;
 *   colonnes, lignes   combien de cases relire.
 *
 * Les tuiles : bit 4 de $FF40 à 1, numéros 0 à 255 depuis $8000 ; à 0,
 * numéros -128 à 127 autour de $9000 (c'est ainsi que la console les lit).
 * Sur Game Boy Color, la case a un octet de réglages dans la banque 1 :
 * sa palette (bits 0 à 2), la banque de sa tuile (bit 3), les miroirs (5 et
 * 6), et « devant les lutins » (7).
 *
 * Sur Game Boy d'origine, les pixels sont passés par les NUANCES du jeu
 * (BGP, $FF47) : un jeu qui inverse ses nuances est recopié tel qu'on le
 * voit, et le dessin rend juste avec les nuances normales du programme.
 */
function relireUneCarte(ppu, carte, departX, departY, colonnes, lignes) {
  const { vram, couleur, lcdc, bgp } = ppu
  const nuance = (brute) => (couleur ? brute : (bgp >> (brute * 2)) & 3)
  const grille = Array.from({ length: lignes * 8 }, () => Array(colonnes * 8).fill(0))
  const teintes = Array.from({ length: lignes }, () => Array(colonnes).fill(0))
  const devant = new Set()
  for (let py = 0; py < lignes * 8; py++) {
    for (let px = 0; px < colonnes * 8; px++) {
      const cx = (departX + px) & 255, cy = (departY + py) & 255   // le pixel dans la carte de 256 × 256
      const ou = carte + (cy >> 3) * 32 + (cx >> 3)
      const numero = vram[ou]
      const reglage = couleur ? vram[8192 + ou] : 0
      let ix = cx & 7, iy = cy & 7
      if (reglage & 0x20) ix = 7 - ix                                // miroir X
      if (reglage & 0x40) iy = 7 - iy                                // miroir Y
      const debut = (lcdc & 0x10 ? numero * 16 : 0x1000 + ((numero << 24) >> 24) * 16) + ((reglage & 0x08) ? 8192 : 0)
      const bas = vram[debut + iy * 2], haut = vram[debut + iy * 2 + 1]
      const brute = ((haut >> (7 - ix)) & 1) << 1 | ((bas >> (7 - ix)) & 1)
      grille[py][px] = nuance(brute)
      if (px % 8 === 0 && py % 8 === 0) {                           // une fois par case : ses réglages
        teintes[py >> 3][px >> 3] = reglage & 7
        if (reglage & 0x80) devant.add(`${px >> 3},${py >> 3}`)
      }
    }
  }
  return { grille, teintes, devant }
}

/**
 * Le DÉCOR visible : les 20 × 18 cases que l'écran montre, défilement compris.
 * Rend { grille, teintes, devant } pour ecrireCarte.
 */
export function capturerLeDecor(gb) {
  const ppu = gb.ppu
  const carte = ppu.lcdc & 0x08 ? 0x1c00 : 0x1800
  return relireUneCarte(ppu, carte, ppu.scx, ppu.scy, 20, 18)
}

/**
 * Le PANNEAU (la fenêtre de la console), s'il est allumé (bit 5 de $FF40) :
 * relu depuis son coin, sur ce qui tient dans l'écran à partir de sa place
 * (WX - 7, WY). Rend { grille, teintes, devant, x, y } — x et y : sa place
 * à l'écran, en pixels — ou null s'il est éteint ou hors de l'écran.
 */
export function capturerLePanneau(gb) {
  const ppu = gb.ppu
  if (!(ppu.lcdc & 0x20)) return null
  const x = Math.max(0, ppu.wx - 7), y = ppu.wy
  if (x >= 160 || y >= 144) return null
  const carte = ppu.lcdc & 0x40 ? 0x1c00 : 0x1800
  const colonnes = Math.ceil((160 - x) / 8), lignes = Math.ceil((144 - y) / 8)
  const lu = relireUneCarte(ppu, carte, 0, 0, colonnes, lignes)
  // posé dans une carte d'un écran (20 × 18), à sa place : le reste vide
  const grille = Array.from({ length: 144 }, () => Array(160).fill(0))
  const teintes = Array.from({ length: 18 }, () => Array(20).fill(0))
  const dc = x >> 3, dl = y >> 3
  lu.grille.forEach((r, py) => r.forEach((v, px) => { if (dl * 8 + py < 144 && dc * 8 + px < 160) grille[dl * 8 + py][dc * 8 + px] = v }))
  lu.teintes.forEach((r, l) => r.forEach((p, c) => { if (dl + l < 18 && dc + c < 20) teintes[dl + l][dc + c] = p }))
  const devant = new Set([...lu.devant].map((k) => { const [c, l] = k.split(',').map(Number); return `${c + dc},${l + dl}` }))
  return { grille, teintes, devant, x, y }
}

/**
 * Les COULEURS du jeu (Game Boy Color) : les 8 palettes du fond et les 8 des
 * lutins, chacune de 4 couleurs [rouge, vert, bleu] de 0 à 31 — la forme
 * d'ecrireCouleurs (editeur-couleurs.js). Une couleur tient sur deux octets :
 * rouge sur les bits 0 à 4, vert 5 à 9, bleu 10 à 14. Rend null sur une
 * Game Boy d'origine (elle n'a que ses quatre nuances).
 */
export function capturerLesCouleurs(gb) {
  const ppu = gb.ppu
  if (!ppu.couleur) return null
  const lire = (octets) => Array.from({ length: 8 }, (_, p) => Array.from({ length: 4 }, (_, t) => {
    const v = octets[p * 8 + t * 2] | (octets[p * 8 + t * 2 + 1] << 8)
    return [v & 31, (v >> 5) & 31, (v >> 10) & 31]
  }))
  return { fond: lire(ppu.bgPalettes), lutins: lire(ppu.objPalettes) }
}

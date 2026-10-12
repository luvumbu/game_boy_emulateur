/**
 * « 🗺 Enregistrer le niveau » : le DÉCOR COMPLET d'un niveau, comme un
 * panorama de téléphone.
 *
 * La console ne garde jamais un niveau entier : sa carte fait 32 × 32 cases
 * (256 × 256 pixels), et quand le héros avance, le jeu efface les colonnes
 * derrière et écrit les nouvelles devant. Le niveau complet n'existe que
 * dans la cartouche — compressé à la façon de chaque jeu.
 *
 * On le reconstruit donc EN JOUANT. À chaque image :
 *
 *   1. l'émulateur a noté le FOND SEUL (ppu.fondSeul : sans les lutins, sans
 *      le panneau) et le défilement de chaque ligne (ppu.scxDeLaLigne,
 *      scyDeLaLigne) ;
 *   2. le défilement le plus fréquent est celui de la CAMÉRA. Les lignes qui
 *      en ont un autre (une barre de score fixe, un ciel qui défile moins
 *      vite) ne sont pas du niveau : on les laisse ;
 *   3. la caméra avance de ce que le défilement a bougé depuis l'image
 *      d'avant (SCX passe de 255 à 0 : c'est +1, pas -255) ;
 *   4. chaque pixel du fond est recopié À SA PLACE dans une grande image
 *      qui grandit au fur et à mesure.
 *
 * Une PORTE ou un TUYAU fait sauter la caméra, ou change tout le décor d'un
 * coup : on le voit (saut de plus de 64 pixels, ou plus d'un tiers des pixels
 * déjà connus qui ne sont plus les mêmes) et l'on commence un nouveau
 * MORCEAU au lieu de mélanger deux salles.
 *
 * On garde la TEINTE de chaque pixel (0 à 3, avant les nuances) et sa
 * PALETTE (Game Boy Color) : un fondu au noir change les nuances, pas les
 * teintes — il ne casse donc rien. Pour l'image, on prend les nuances (ou
 * palettes) que le jeu a montrées le plus longtemps.
 */

const BLOC = 256        // la grande image est faite de blocs de 256 × 256 pixels, créés au besoin
const SAUT = 64         // un défilement de plus de 64 pixels d'un coup : une porte, un tuyau
const LARGEUR_MAXI = 16000   // au-delà, certains navigateurs refusent de dessiner : l'image est coupée en parties

function nouveauMorceau() {
  return {
    blocs: new Map(),       // « bx,by » → Uint8Array(256 × 256) : 0 inconnu, sinon 128 | palette << 2 | teinte
    minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity,
    images: 0,
    nuances: new Map(),     // la clé des nuances (BGP ou palettes couleur) → { fois, valeur }
  }
}

export function creerUnPanorama() {
  const morceaux = []
  let morceau = null
  let camX = 0, camY = 0
  let avantX = null, avantY = null

  /* Le bloc qui contient (x, y). Le dernier servi est gardé : sur une ligne,
     160 pixels tombent presque toujours dans le même bloc. */
  let dernier = { m: null, bx: NaN, by: NaN, b: null }
  const bloc = (m, x, y, creer) => {
    const bx = x >> 8, by = y >> 8
    if (dernier.m === m && dernier.bx === bx && dernier.by === by && (dernier.b || !creer)) return dernier.b
    const cle = `${bx},${by}`
    let b = m.blocs.get(cle)
    if (!b && creer) { b = new Uint8Array(BLOC * BLOC); m.blocs.set(cle, b) }
    dernier = { m, bx, by, b }
    return b
  }
  const commencer = (scx, scy) => {
    morceau = nouveauMorceau()
    morceaux.push(morceau)
    camX = scx; camY = scy   // le monde garde les coordonnées de la carte : les cases restent alignées sur 8
  }

  return {
    ramasser(ppu) {
      if (!(ppu.lcdc & 0x80)) return                 // écran éteint
      const fond = ppu.fondSeul

      /* La caméra : le couple (SCX, SCY) le plus fréquent sur les lignes de fond. */
      const compte = new Map()
      for (let y = 0; y < 144; y++) {
        if (!fond[y * 160] && !fond[y * 160 + 80]) continue
        const k = ppu.scxDeLaLigne[y] | ppu.scyDeLaLigne[y] << 8
        compte.set(k, (compte.get(k) ?? 0) + 1)
      }
      if (!compte.size) return
      let camera = 0, plus = -1
      for (const [k, n] of compte) if (n > plus) { plus = n; camera = k }
      const scx = camera & 255, scy = camera >> 8

      if (avantX === null) commencer(scx, scy)
      else {
        const dx = ((scx - avantX + 128) & 255) - 128
        const dy = ((scy - avantY + 128) & 255) - 128
        if (Math.abs(dx) > SAUT || Math.abs(dy) > SAUT) commencer(scx, scy)
        else { camX += dx; camY += dy }
      }
      avantX = scx; avantY = scy

      /* Les lignes de la caméra seulement ; un écran tout d'une teinte (noir, blanc : une transition) ne compte pas. */
      const lignes = []
      let premiere = -1, uni = true
      for (let y = 0; y < 144; y++) if ((ppu.scxDeLaLigne[y] | ppu.scyDeLaLigne[y] << 8) === camera) lignes.push(y)
      for (const y of lignes) {
        for (let x = 0; x < 160; x++) {
          const v = fond[y * 160 + x]
          if (!v) continue
          if (premiere < 0) premiere = v & 3
          else if ((v & 3) !== premiere) { uni = false; break }
        }
        if (!uni) break
      }
      if (uni) return

      /* Un autre décor au même endroit ? (une porte sans saut de caméra) */
      let connus = 0, differents = 0
      for (const y of lignes) {
        for (let x = 0; x < 160; x += 2) {
          const v = fond[y * 160 + x]
          if (!v) continue
          const wx = camX + x, wy = camY + y
          const b = bloc(morceau, wx, wy, false)
          const avant = b ? b[(wy & 255) * BLOC + (wx & 255)] : 0
          if (!avant) continue
          connus++
          if ((avant & 0x1f) !== (v & 0x1f)) differents++
        }
      }
      if (connus > 1500 && differents / connus > 0.34) commencer(scx, scy)

      /* Recopier. */
      for (const y of lignes) {
        const wy = camY + y
        for (let x = 0; x < 160; x++) {
          const v = fond[y * 160 + x]
          if (!v) continue
          const wx = camX + x
          bloc(morceau, wx, wy, true)[(wy & 255) * BLOC + (wx & 255)] = v
          if (wx < morceau.minX) morceau.minX = wx
          if (wx > morceau.maxX) morceau.maxX = wx
          if (wy < morceau.minY) morceau.minY = wy
          if (wy > morceau.maxY) morceau.maxY = wy
        }
      }
      morceau.images++

      /* Les nuances de cette image, pour colorer à la fin. */
      const cle = ppu.couleur ? String.fromCharCode(...ppu.bgPalettes) : 'g' + ppu.bgp
      const n = morceau.nuances.get(cle)
      if (n) n.fois++
      else morceau.nuances.set(cle, { fois: 1, couleur: ppu.couleur, bgp: ppu.bgp, palettes: ppu.couleur ? Uint8Array.from(ppu.bgPalettes) : null })
    },

    /** Les morceaux enregistrés (les vides et les tout petits — moins d'un écran — sont laissés). */
    morceaux: () => morceaux.filter((m) => m.images > 0 && (m.maxX - m.minX + 1) * (m.maxY - m.minY + 1) >= 160 * 100 && !estUni(m)),

    /** La taille du morceau en cours, pour le bouton. */
    taille: () => (morceau && morceau.images ? `${morceau.maxX - morceau.minX + 1} × ${morceau.maxY - morceau.minY + 1} px` : '…'),
    combien: () => morceaux.filter((m) => m.images > 0).length,
  }
}

/** Ce qu'il y a au pixel (x, y) du morceau : 0 inconnu, sinon 128 | palette << 2 | teinte. */
function lire(m, x, y) {
  const b = m.blocs.get(`${x >> 8},${y >> 8}`)
  return b ? b[(y & 255) * BLOC + (x & 255)] : 0
}

/**
 * Un morceau tout d'une couleur (un fondu au blanc ou au noir, un écran vide)
 * n'est pas un décor : on le laisse. On regarde un pixel sur quatre.
 */
function estUni(m) {
  const nuances = nuancesDominantes(m)
  let premiere = null
  for (let y = m.minY; y <= m.maxY; y += 2) {
    for (let x = m.minX; x <= m.maxX; x += 2) {
      const v = lire(m, x, y)
      if (!v) continue
      const c = couleurDe(v, nuances).join(',')
      if (premiere === null) premiere = c
      else if (c !== premiere) return false
    }
  }
  return true
}

/** Les nuances montrées le plus longtemps dans ce morceau. */
function nuancesDominantes(m) {
  let mieux = null
  for (const n of m.nuances.values()) if (!mieux || n.fois > mieux.fois) mieux = n
  return mieux
}

const GRIS = [[0xe0, 0xf8, 0xd0], [0x88, 0xc0, 0x70], [0x34, 0x68, 0x56], [0x08, 0x18, 0x20]]
const huit = (v) => (v << 3) | (v >> 2)

/** La couleur [r, v, b] d'un pixel connu, avec les nuances dominantes. */
function couleurDe(v, nuances) {
  const teinte = v & 3, palette = (v >> 2) & 7
  if (nuances.couleur) {
    const ou = palette * 8 + teinte * 2
    const c = nuances.palettes[ou] | nuances.palettes[ou + 1] << 8
    return [huit(c & 31), huit((c >> 5) & 31), huit((c >> 10) & 31)]
  }
  return GRIS[(nuances.bgp >> (teinte * 2)) & 3]
}

/**
 * Un morceau en image(s) PNG : « data:image/png;base64,… ». Ce qu'on n'a pas
 * vu est transparent. Plus large que 16 000 pixels : coupé en parties.
 * Rend [{ png, largeur, hauteur }].
 */
export function imagesDuMorceau(m) {
  const parties = []
  const largeur = m.maxX - m.minX + 1
  for (let depart = 0; depart < largeur; depart += LARGEUR_MAXI) {
    const { l, hauteur, rvba } = pixelsDuMorceau(m, depart, Math.min(LARGEUR_MAXI, largeur - depart))
    const toile = document.createElement('canvas')
    toile.width = l
    toile.height = hauteur
    const ctx = toile.getContext('2d')
    const image = ctx.createImageData(l, hauteur)
    image.data.set(rvba)
    ctx.putImageData(image, 0, 0)
    parties.push({ png: toile.toDataURL('image/png'), largeur: l, hauteur })
  }
  return parties
}

/** Les pixels (rouge, vert, bleu, opacité) d'une bande du morceau : « l » colonnes depuis « depart ». */
export function pixelsDuMorceau(m, depart = 0, l = m.maxX - m.minX + 1) {
  const hauteur = m.maxY - m.minY + 1
  const nuances = nuancesDominantes(m)
  const rvba = new Uint8ClampedArray(l * hauteur * 4)
  for (let y = 0; y < hauteur; y++) {
    for (let x = 0; x < l; x++) {
      const v = lire(m, m.minX + depart + x, m.minY + y)
      if (!v) continue
      const [r, g, b] = couleurDe(v, nuances)
      const o = (y * l + x) * 4
      rvba[o] = r; rvba[o + 1] = g; rvba[o + 2] = b; rvba[o + 3] = 255
    }
  }
  return { l, hauteur, rvba }
}

/**
 * Un morceau découpé en CARTES pour l'atelier (« La carte ») : au plus 32 × 32
 * cases chacune (la carte de la console). Les cases sont alignées sur la
 * vraie grille du jeu. Rend [{ colonne, ligne, grille, teintes }] —
 * « grille » : les pixels (0 à 3), « teintes » : la palette de chaque case
 * (Game Boy Color). En 4 nuances, les pixels passent par les nuances
 * dominantes du jeu (un jeu qui inverse ses nuances est recopié tel qu'on le
 * voit) ; en couleur, ce sont les teintes, et la palette va dans « teintes ».
 */
export function cartesDuMorceau(m, cote = 32) {
  const nuances = nuancesDominantes(m)
  const c0 = Math.floor(m.minX / 8), l0 = Math.floor(m.minY / 8)
  const c1 = Math.floor(m.maxX / 8), l1 = Math.floor(m.maxY / 8)
  const cartes = []
  for (let lc = l0; lc <= l1; lc += cote) {
    for (let cc = c0; cc <= c1; cc += cote) {
      const colonnes = Math.min(cote, c1 - cc + 1), lignes = Math.min(cote, l1 - lc + 1)
      const grille = Array.from({ length: lignes * 8 }, () => Array(colonnes * 8).fill(0))
      const teintes = Array.from({ length: lignes }, () => Array(colonnes).fill(0))
      let vus = 0
      for (let y = 0; y < lignes * 8; y++) {
        for (let x = 0; x < colonnes * 8; x++) {
          const v = lire(m, cc * 8 + x, lc * 8 + y)
          if (!v) continue
          vus++
          grille[y][x] = nuances.couleur ? v & 3 : (nuances.bgp >> ((v & 3) * 2)) & 3
          if (x % 8 === 0 && y % 8 === 0) teintes[y >> 3][x >> 3] = (v >> 2) & 7
        }
      }
      if (vus) cartes.push({ colonne: cc - c0, ligne: lc - l0, colonnes, lignes, grille, teintes })
    }
  }
  return cartes
}

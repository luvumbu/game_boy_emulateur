/**
 * La police du compilateur : 43 dessins de 8 × 8, en 2 bits par pixel.
 *
 * Chaque caractère est décrit par sept rangées de cinq bits — c'est assez pour
 * une lettre lisible, et cinq fois plus court à écrire que du dessin pixel par
 * pixel. La conversion vers le format de la console se fait plus bas : sur une
 * Game Boy, une ligne de tuile tient sur deux octets, le premier portant le bit
 * bas de chaque pixel et le second le bit haut.
 *
 * Les caractères sont posés dans l'ordre où le compilateur les numérote : le
 * numéro d'une tuile est sa position dans `ORDRE`, et rien d'autre.
 */

/** Sept rangées de cinq bits par caractère, la huitième restant vide. */
const DESSINS = {
  A: [0x0e, 0x11, 0x11, 0x1f, 0x11, 0x11, 0x11],
  B: [0x1e, 0x11, 0x11, 0x1e, 0x11, 0x11, 0x1e],
  C: [0x0e, 0x11, 0x10, 0x10, 0x10, 0x11, 0x0e],
  D: [0x1e, 0x11, 0x11, 0x11, 0x11, 0x11, 0x1e],
  E: [0x1f, 0x10, 0x10, 0x1e, 0x10, 0x10, 0x1f],
  F: [0x1f, 0x10, 0x10, 0x1e, 0x10, 0x10, 0x10],
  G: [0x0e, 0x11, 0x10, 0x17, 0x11, 0x11, 0x0f],
  H: [0x11, 0x11, 0x11, 0x1f, 0x11, 0x11, 0x11],
  I: [0x0e, 0x04, 0x04, 0x04, 0x04, 0x04, 0x0e],
  J: [0x07, 0x02, 0x02, 0x02, 0x02, 0x12, 0x0c],
  K: [0x11, 0x12, 0x14, 0x18, 0x14, 0x12, 0x11],
  L: [0x10, 0x10, 0x10, 0x10, 0x10, 0x10, 0x1f],
  M: [0x11, 0x1b, 0x15, 0x15, 0x11, 0x11, 0x11],
  N: [0x11, 0x19, 0x15, 0x13, 0x11, 0x11, 0x11],
  O: [0x0e, 0x11, 0x11, 0x11, 0x11, 0x11, 0x0e],
  P: [0x1e, 0x11, 0x11, 0x1e, 0x10, 0x10, 0x10],
  Q: [0x0e, 0x11, 0x11, 0x11, 0x15, 0x12, 0x0d],
  R: [0x1e, 0x11, 0x11, 0x1e, 0x14, 0x12, 0x11],
  S: [0x0f, 0x10, 0x10, 0x0e, 0x01, 0x01, 0x1e],
  T: [0x1f, 0x04, 0x04, 0x04, 0x04, 0x04, 0x04],
  U: [0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x0e],
  V: [0x11, 0x11, 0x11, 0x11, 0x11, 0x0a, 0x04],
  W: [0x11, 0x11, 0x11, 0x15, 0x15, 0x1b, 0x11],
  X: [0x11, 0x11, 0x0a, 0x04, 0x0a, 0x11, 0x11],
  Y: [0x11, 0x11, 0x0a, 0x04, 0x04, 0x04, 0x04],
  Z: [0x1f, 0x01, 0x02, 0x04, 0x08, 0x10, 0x1f],
  0: [0x0e, 0x11, 0x13, 0x15, 0x19, 0x11, 0x0e],
  1: [0x04, 0x0c, 0x04, 0x04, 0x04, 0x04, 0x0e],
  2: [0x0e, 0x11, 0x01, 0x02, 0x04, 0x08, 0x1f],
  3: [0x1f, 0x02, 0x04, 0x02, 0x01, 0x11, 0x0e],
  4: [0x02, 0x06, 0x0a, 0x12, 0x1f, 0x02, 0x02],
  5: [0x1f, 0x10, 0x1e, 0x01, 0x01, 0x11, 0x0e],
  6: [0x06, 0x08, 0x10, 0x1e, 0x11, 0x11, 0x0e],
  7: [0x1f, 0x01, 0x02, 0x04, 0x08, 0x08, 0x08],
  8: [0x0e, 0x11, 0x11, 0x0e, 0x11, 0x11, 0x0e],
  9: [0x0e, 0x11, 0x11, 0x0f, 0x01, 0x02, 0x0c],
  ' ': [0, 0, 0, 0, 0, 0, 0],
  '!': [0x04, 0x04, 0x04, 0x04, 0x04, 0x00, 0x04],
  '?': [0x0e, 0x11, 0x01, 0x02, 0x04, 0x00, 0x04],
  '.': [0, 0, 0, 0, 0, 0, 0x04],
  '-': [0, 0, 0, 0x1f, 0, 0, 0],
  ':': [0, 0x04, 0, 0, 0, 0x04, 0],

}

/**
 * Les dessins de jeu, qui ne sont pas des lettres.
 *
 * Une lettre tient dans cinq pixels de large et une seule nuance : c'est assez
 * pour du texte, et c'est très insuffisant pour un jeu. Un bloc de Tetris doit
 * occuper **les huit pixels**, sinon deux blocs côte à côte laissent une fente
 * blanche entre eux ; et il lui faut **trois nuances**, sinon c'est un pavé noir
 * sans relief.
 *
 * Ces dessins-là sont donc donnés autrement : huit rangées de huit chiffres,
 * chacun étant la nuance du pixel — 0 le plus clair, 3 le plus sombre. C'est
 * long à écrire, mais on voit le dessin dans le code.
 */
const DESSINS_LARGES = {
  /* Le bloc : cadre noir, liseré clair, cœur gris. Le cadre fait que deux
     blocs voisins restent deux blocs, au lieu de fondre en une masse. */
  '#': [
    '33333333',
    '30000003',
    '30222203',
    '30222203',
    '30222203',
    '30222203',
    '30000003',
    '33333333',
  ],
  /* Le mur du puits : un gris uni, plus clair que le cadre des blocs pour
     qu'une pièce collée au mur reste lisible. */
  '|': [
    '22222222',
    '22222222',
    '22222222',
    '22222222',
    '22222222',
    '22222222',
    '22222222',
    '22222222',
  ],
}

/**
 * L'ordre des tuiles. La première est le vide : une carte de fond remise à zéro
 * affiche donc du vide, sans qu'on ait à l'effacer caractère par caractère.
 */
export const ORDRE = [' ', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!?.-:#|']

/*
 * La police n'a que des MAJUSCULES, sans accents. Un caractère est donc mis en
 * majuscule, et débarrassé de son accent, avant d'être cherché :
 * « a » → A, « é », « è », « ê » → E, « à » → A, « ç » → C, « ô » → O…
 * (NFD sépare la lettre de son accent ; on ne garde que la lettre.)
 */
export function normaliser(caractere) {
  return caractere.normalize('NFD').replace(/\p{M}/gu, '').toUpperCase()
}

/** Le numéro de tuile d'un caractère. Les inconnus deviennent des espaces. */
export function numeroDe(caractere) {
  const index = ORDRE.indexOf(normaliser(caractere))
  return index === -1 ? 0 : index
}

/**
 * Les octets de tout le jeu de tuiles, prêts pour la mémoire vidéo.
 * Une rangée de cinq bits est décalée de deux pour être centrée dans les huit,
 * et écrite dans les deux plans à la fois — ce qui donne la nuance la plus
 * sombre.
 */
export function octetsDesTuiles() {
  const octets = []

  for (const caractere of ORDRE) {
    const large = DESSINS_LARGES[caractere]

    if (large) {
      /* Huit nuances par rangée : le premier octet porte le bit bas de chaque
         pixel, le second le bit haut. */
      for (const rangee of large) {
        let bas = 0
        let haut = 0
        for (let x = 0; x < 8; x++) {
          const nuance = Number(rangee[x])
          bas = (bas << 1) | (nuance & 1)
          haut = (haut << 1) | ((nuance >> 1) & 1)
        }
        octets.push(bas, haut)
      }
      continue
    }

    const rangees = DESSINS[caractere] ?? DESSINS[' ']
    for (let y = 0; y < 8; y++) {
      const rangee = ((rangees[y] ?? 0) << 2) & 0xff
      octets.push(rangee, rangee)
    }
  }

  return octets
}

/** Combien de tuiles la police occupe. */
export const NOMBRE_DE_TUILES = ORDRE.length

/*
 * L'alphabet EN GRAS, pour ALPHABET_GRAS : les mêmes lettres, aux traits
 * épaissis d'un pixel vers la droite (chaque rangée de 5 bits, placée aux
 * colonnes 1 à 5 comme la police, est recopiée une colonne plus à droite).
 * Rien n'est dessiné à la main, sauf M, N et W : leurs traits sont si serrés
 * que l'épaississement les remplirait ; ils sont redessinés sur 8 colonnes,
 * en gardant leurs creux.
 *
 * Rend 26 dessins, de A à Z : 8 chaînes de 8 chiffres chacun, 0 le fond, 3 le
 * trait — la forme d'une « Tuile » du langage.
 */
const GRAS_A_LA_MAIN = {
  M: ['33000033', '33300333', '33333333', '33033033', '33000033', '33000033', '33000033', '00000000'],
  N: ['33000033', '33300033', '33330033', '33033033', '33003333', '33000333', '33000033', '00000000'],
  W: ['33000033', '33000033', '33000033', '33033033', '33333333', '33300333', '33000033', '00000000'],
}
export function lettresGrasses() {
  return [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'].map((lettre) => {
    if (GRAS_A_LA_MAIN[lettre]) return { lettre, lignes: GRAS_A_LA_MAIN[lettre] }
    const lignes = []
    for (let y = 0; y < 8; y++) {
      const r = DESSINS[lettre][y] ?? 0
      const gras = ((r << 2) | (r << 1)) & 0xff        // colonnes 1 à 5, et une de plus à droite
      lignes.push([...Array(8)].map((_, x) => ((gras >> (7 - x)) & 1 ? '3' : '0')).join(''))
    }
    return { lettre, lignes }
  })
}

/*
 * L'alphabet des TITRES, pour ALPHABET_TITRE : les lettres épaisses du gras,
 * avec une OMBRE. Comme les grandes lettres d'un écran titre : chaque pixel
 * du trait (3, le plus sombre) jette une ombre grise (2) sur le pixel d'en
 * bas à droite, s'il est vide. Le relief tient dans la tuile : le gras
 * occupe les colonnes 1 à 6 et les rangées 0 à 6, l'ombre déborde sur la
 * colonne 7 et la rangée 7.
 *
 * C'est NOTRE dessin, calculé à partir de la police du projet : il évoque
 * le style des titres de la Game Boy sans recopier les lettres d'aucun jeu.
 *
 * Rend 26 dessins, de A à Z : 8 chaînes de 8 chiffres — 0 le fond, 2 l'ombre,
 * 3 le trait.
 */
export function lettresTitre() {
  return lettresGrasses().map(({ lettre, lignes }) => {
    const p = lignes.map((l) => [...l])
    for (let y = 0; y < 7; y++) {
      for (let x = 0; x < 7; x++) {
        if (lignes[y][x] === '3' && lignes[y + 1][x + 1] === '0') p[y + 1][x + 1] = '2'
      }
    }
    return { lettre, lignes: p.map((r) => r.join('')) }
  })
}

/*
 * Les GROSSES lettres des titres, pour texteTitre(). Dans le style des titres
 * « dessin animé » de la Game Boy : grosses, rondes, un contour noir épais,
 * l'intérieur clair, une ombre. Trois tailles — « taille » est le nombre de
 * cases de côté d'une lettre :
 *
 *   taille 2 : 16 × 16 pixels — le gras tel quel, un contour d'un pixel ;
 *   taille 3 : 24 × 24 pixels — le gras agrandi deux fois (la taille d'avant) ;
 *   taille 4 : 32 × 32 pixels — le gras agrandi trois fois.
 *
 * Pour la taille 3 :
 *
 *   1. le gras (traits de 2 pixels), agrandi deux fois : traits de 4 ;
 *   2. les coins arrondis : un pixel du bord qui n'a ni voisin au-dessus (ou
 *      au-dessous) ni voisin à gauche (ou à droite) est ôté ;
 *   3. un contour noir (3) de deux pixels tout autour ;
 *   4. une ombre grise (2) d'un pixel, en bas à droite ;
 *   5. « enBas » : la lettre descend de 4 pixels — une lettre sur deux, et le
 *      mot sautille.
 *
 * C'est NOTRE dessin, calculé à partir de la police du projet : il évoque ce
 * style sans recopier les lettres d'aucun jeu.
 *
 * Les tailles 2 et 4 suivent les mêmes étapes, avec leurs propres mesures
 * (TAILLES_DE_TITRE, juste en dessous) ; la taille 2 n'arrondit pas : ses
 * traits, de 2 pixels, disparaîtraient.
 *
 * Rend « 8 × taille » chaînes d'autant de chiffres (0 le fond et l'intérieur,
 * 2 l'ombre, 3 le contour), ou null pour un caractère que la police ne
 * connaît pas.
 */
export const TAILLES_DE_TITRE = {
  //   agrandi : chaque pixel du gras devient « agrandi × agrandi » pixels
  //   gauche, haut : où commence la lettre dans son carré
  //   contour : son épaisseur ; arrondi : coins arrondis ou non
  //   saut : de combien descend une lettre sur deux
  2: { agrandi: 1, gauche: 2, haut: 2, contour: 1, arrondi: false, saut: 2 },
  3: { agrandi: 2, gauche: 1, haut: 2, contour: 2, arrondi: true, saut: 4 },
  4: { agrandi: 3, gauche: 2, haut: 2, contour: 2, arrondi: true, saut: 3 },
}

export function grandeLettreTitre(caractere, enBas = false, taille = 3) {
  const t = TAILLES_DE_TITRE[taille]
  if (!t) return null
  const c = normaliser(caractere)
  if (!ORDRE.includes(c)) return null
  /* Le gras : celui d'ALPHABET_GRAS pour A à Z, sinon la police épaissie d'un pixel. */
  let gras
  const deLAlphabet = lettresGrasses().find((l) => l.lettre === c)
  if (deLAlphabet) gras = deLAlphabet.lignes.map((l) => [...l].map((n) => n === '3'))
  else {
    const p = pixelsDe(c)
    gras = p.map((r) => r.map((v, x) => v === 3 || (x > 0 && r[x - 1] === 3)))
  }
  const N = 8 * taille
  const plein = Array.from({ length: N }, () => Array(N).fill(false))
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) if (gras[y][x]) {
    for (let a = 0; a < t.agrandi; a++) for (let b = 0; b < t.agrandi; b++) {
      plein[t.haut + y * t.agrandi + a][t.gauche + x * t.agrandi + b] = true
    }
  }
  const v = (g, y, x) => y >= 0 && y < N && x >= 0 && x < N && g[y][x]
  const rond = plein.map((l) => l.slice())
  if (t.arrondi) for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (plein[y][x]) {
    const h = v(plein, y - 1, x), b = v(plein, y + 1, x), g = v(plein, y, x - 1), d = v(plein, y, x + 1)
    if ((!h && !g) || (!h && !d) || (!b && !g) || (!b && !d)) rond[y][x] = false
  }
  const sortie = Array.from({ length: N }, () => Array(N).fill(-1))
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    if (rond[y][x]) { sortie[y][x] = 0; continue }
    let pres = false
    const r = t.contour
    for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
      if (Math.abs(dy) + Math.abs(dx) <= r + 1 && v(rond, y + dy, x + dx)) pres = true
    }
    if (pres) sortie[y][x] = 3
  }
  const ombre = sortie.map((l) => l.slice())
  for (let y = 0; y < N - 1; y++) for (let x = 0; x < N - 1; x++) {
    if (sortie[y][x] === 3 && sortie[y + 1][x + 1] === -1) ombre[y + 1][x + 1] = 2
  }
  const decale = enBas ? t.saut : 0
  return Array.from({ length: N }, (_, y) => {
    const source = y - decale
    if (source < 0) return '0'.repeat(N)
    return ombre[source].map((n) => (n === -1 ? '0' : String(n))).join('')
  })
}

/*
 * Les lettres de titre MANGA, pour texteManga() : un style à mi-chemin entre
 * les titres de manga et ceux des dessins animés. Mêmes tailles que
 * texteTitre (2, 3 ou 4 cases de côté), mais :
 *
 *   1. PENCHÉES vers la droite, comme une écriture qui fonce : le haut de la
 *      lettre est décalé d'un pixel toutes les « penche » rangées ;
 *   2. des coins COUPÉS en biais — en haut à droite et en bas à gauche —, au
 *      lieu d'arrondis : la lettre a l'air taillée ;
 *   3. un contour noir CARRÉ (3), aux angles vifs ;
 *   4. l'intérieur en deux : le haut clair (0), le bas en TRAME (un pixel sur
 *      deux en gris clair, 1), comme les trames des pages de manga ;
 *   5. une ombre portée grise (2), plus longue, en bas à droite ;
 *   6. une lettre sur deux un peu plus bas : le côté dessin animé.
 *
 * C'est NOTRE dessin, calculé à partir de la police du projet, sans recopier
 * les lettres d'aucun manga ni d'aucun jeu. Rend « 8 × taille » chaînes
 * d'autant de chiffres, ou null pour un caractère inconnu.
 */
export const TAILLES_MANGA = {
  //   penche : un pixel de décalage toutes les « penche » rangées
  //   ombre : la longueur de l'ombre portée ; trame : le bas en trame, ou plein
  2: { agrandi: 1, gauche: 1, haut: 2, contour: 1, penche: 3, ombre: 1, saut: 1, trame: false },
  3: { agrandi: 2, gauche: 2, haut: 2, contour: 2, penche: 5, ombre: 2, saut: 2, trame: true },
  4: { agrandi: 3, gauche: 1, haut: 2, contour: 2, penche: 6, ombre: 2, saut: 2, trame: true },
}

export function lettreManga(caractere, enBas = false, taille = 3) {
  const t = TAILLES_MANGA[taille]
  if (!t) return null
  const c = normaliser(caractere)
  if (!ORDRE.includes(c)) return null
  let gras
  const deLAlphabet = lettresGrasses().find((l) => l.lettre === c)
  if (deLAlphabet) gras = deLAlphabet.lignes.map((l) => [...l].map((n) => n === '3'))
  else {
    const p = pixelsDe(c)
    gras = p.map((r) => r.map((v, x) => v === 3 || (x > 0 && r[x - 1] === 3)))
  }
  const N = 8 * taille
  const H = 8 * t.agrandi // la hauteur de la lettre, en pixels
  const dedans = (y, x) => y >= 0 && y < N && x >= 0 && x < N
  /* 1. Agrandie et penchée : plus la rangée est haute, plus elle va à droite. */
  const plein = Array.from({ length: N }, () => Array(N).fill(false))
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) if (gras[y][x]) {
    for (let a = 0; a < t.agrandi; a++) for (let b = 0; b < t.agrandi; b++) {
      const yy = y * t.agrandi + a
      const decalage = Math.floor((H - 1 - yy) / t.penche)
      const py = t.haut + yy, px = t.gauche + x * t.agrandi + b + decalage
      if (dedans(py, px)) plein[py][px] = true
    }
  }
  const v = (g, y, x) => dedans(y, x) && g[y][x]
  /* 2. Les coins coupés : en haut à droite et en bas à gauche. */
  const taille_ = plein.map((l) => l.slice())
  if (t.agrandi >= 2) for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (plein[y][x]) {
    const h = v(plein, y - 1, x), b = v(plein, y + 1, x), g = v(plein, y, x - 1), d = v(plein, y, x + 1)
    if ((!h && !d) || (!b && !g)) taille_[y][x] = false
  }
  /* 3 et 4. Le contour carré, l'intérieur clair en haut, en trame en bas. */
  const milieu = t.haut + H / 2
  const sortie = Array.from({ length: N }, () => Array(N).fill(-1))
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    if (taille_[y][x]) {
      sortie[y][x] = y < milieu ? 0 : t.trame ? (x + y) % 2 : 1
      continue
    }
    let pres = false
    for (let dy = -t.contour; dy <= t.contour; dy++) for (let dx = -t.contour; dx <= t.contour; dx++) {
      if (v(taille_, y + dy, x + dx)) pres = true
    }
    if (pres) sortie[y][x] = 3
  }
  /* 5. L'ombre portée : un pixel vide, avec du contour en haut à gauche, à moins de « ombre » pixels. */
  const ombre = sortie.map((l) => l.slice())
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (sortie[y][x] === -1) {
    for (let k = 1; k <= t.ombre; k++) if (dedans(y - k, x - k) && sortie[y - k][x - k] === 3) ombre[y][x] = 2
  }
  /* 6. Une lettre sur deux, un peu plus bas. */
  const decale = enBas ? t.saut : 0
  return Array.from({ length: N }, (_, y) => {
    const source = y - decale
    if (source < 0) return '0'.repeat(N)
    return ombre[source].map((n) => (n === -1 ? '0' : String(n))).join('')
  })
}

/*
 * Les pixels d'un caractère, tels qu'ils sont posés dans sa tuile : 8 rangées
 * de 8 nombres (0 le fond, 3 le trait), comme le fait octetsDesTuiles. Sert à
 * texteGrand, qui AGRANDIT ces pixels. Rend null pour un caractère inconnu.
 */
export function pixelsDe(caractere) {
  caractere = normaliser(caractere)             // minuscules et accents : la majuscule simple
  if (!ORDRE.includes(caractere)) return null
  const large = DESSINS_LARGES[caractere]
  if (large) return large.map((r) => [...r].map(Number))
  const rangees = DESSINS[caractere] ?? DESSINS[' ']
  return [...Array(8)].map((_, y) => {
    const r = ((rangees[y] ?? 0) << 2) & 0xff
    return [...Array(8)].map((_, x) => ((r >> (7 - x)) & 1 ? 3 : 0))
  })
}

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

/** Le numéro de tuile d'un caractère. Les inconnus deviennent des espaces. */
export function numeroDe(caractere) {
  const index = ORDRE.indexOf(caractere.toUpperCase())
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

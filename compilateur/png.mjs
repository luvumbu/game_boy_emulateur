/**
 * Écrit une image PNG, sans dépendance.
 *
 * Il n'y a rien de savant : un PNG est une signature, trois morceaux, et une
 * somme de contrôle par morceau. La compression est confiée à `zlib`, que Node
 * fournit — la réécrire n'apprendrait rien à personne.
 */

import { deflateSync } from 'node:zlib'

const TABLE = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c >>> 0
  }
  return t
})()

function crc32(octets) {
  let c = 0xffffffff
  for (const o of octets) c = TABLE[(c ^ o) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

/** Un morceau : longueur, type, données, somme. */
function morceau(type, donnees) {
  const entete = Buffer.alloc(8)
  entete.writeUInt32BE(donnees.length, 0)
  entete.write(type, 4, 'ascii')
  const corps = Buffer.concat([entete.subarray(4), Buffer.from(donnees)])
  const somme = Buffer.alloc(4)
  somme.writeUInt32BE(crc32(corps))
  return Buffer.concat([entete.subarray(0, 4), corps, somme])
}

/**
 * Rend un PNG à partir de pixels rouge-vert-bleu, trois octets chacun.
 * Chaque rangée est précédée d'un zéro : le filtre « aucun ».
 */
export function png(largeur, hauteur, rvb) {
  const brut = Buffer.alloc((largeur * 3 + 1) * hauteur)
  for (let y = 0; y < hauteur; y++) {
    brut[y * (largeur * 3 + 1)] = 0
    Buffer.from(rvb.subarray(y * largeur * 3, (y + 1) * largeur * 3))
      .copy(brut, y * (largeur * 3 + 1) + 1)
  }

  const enTete = Buffer.alloc(13)
  enTete.writeUInt32BE(largeur, 0)
  enTete.writeUInt32BE(hauteur, 4)
  enTete[8] = 8 // huit bits par composante
  enTete[9] = 2 // couleur vraie, sans transparence
  enTete[10] = 0
  enTete[11] = 0
  enTete[12] = 0

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    morceau('IHDR', enTete),
    morceau('IDAT', deflateSync(brut)),
    morceau('IEND', Buffer.alloc(0)),
  ])
}

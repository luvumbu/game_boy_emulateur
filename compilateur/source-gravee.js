/**
 * Le programme C++ d'origine, gravé DANS la cartouche.
 *
 * La compilation jette les noms, les commentaires et la forme des boucles :
 * des octets seuls, on ne remonte jamais au programme qui a été écrit. La
 * seule façon de le retrouver tel quel, c'est de
 * l'avoir gardé. C'est ce que fait ce module.
 *
 * Une cartouche fait 32 Ko, et un programme d'ici en occupe rarement plus de
 * six : le reste est vide. On y range, tout au bout, les fichiers du projet —
 * le principal et ceux qu'il inclut —, compressés. Le processeur ne va jamais
 * lire là : le jeu tourne exactement pareil.
 *
 *   ... le programme compilé ... | (vide) | les fichiers, compressés | la marque
 *                                                                     $7FF0–$7FFF
 *
 * La marque fait seize octets :
 *
 *   0–9    « SOURCE C++ »       pour la reconnaître
 *   10     la version           1
 *   11     la compression       0 : aucune, 1 : LZSS (plus bas)
 *   12–13  la longueur gravée   en octets, poids faible d'abord
 *   14–15  une somme            celle des octets gravés : un octet faux, et l'on ne rend rien
 *
 * Si le programme ne tient pas dans la place libre, il n'est PAS gravé, et
 * on le dit : un programme coupé en deux serait pire que pas de programme.
 *
 * ATTENTION — ce qui est gravé voyage avec la cartouche : qui a le « .gb » a
 * le programme, commentaires compris.
 */

const TAILLE = 0x8000
const MARQUE = 'SOURCE C++'
const LONGUEUR_MARQUE = 16
const VERSION = 1

/* ------------------------------------------------ la compression LZSS */

/*
 * LZSS : quand une suite de lettres est déjà apparue un peu plus haut, on
 * écrit « recopie N lettres prises D cases en arrière » au lieu des lettres.
 * Un programme C++ se répète beaucoup (les mots-clés, les noms, les rangées
 * des dessins) : il se réduit à peu près de moitié.
 *
 * Huit éléments sont précédés d'un octet de drapeaux, un bit chacun :
 *   1  une lettre telle quelle (un octet)
 *   0  une recopie (deux octets) : distance 1–4096 sur 12 bits, longueur 3–18 sur 4
 */
const FENETRE = 4096
const PLUS_COURT = 3
const PLUS_LONG = 18
const ESSAIS = 256

export function compresser(octets) {
  const sortie = []
  /* Pour chaque trio de lettres, sa dernière position ; et, pour chaque
     position, la précédente du même trio — une chaîne à remonter. */
  const dernier = new Map()
  const precedent = new Int32Array(octets.length).fill(-1)
  const cle = (i) => (octets[i] << 16) | (octets[i + 1] << 8) | octets[i + 2]
  const retenir = (i) => {
    if (i + 2 >= octets.length) return
    const k = cle(i)
    precedent[i] = dernier.has(k) ? dernier.get(k) : -1
    dernier.set(k, i)
  }

  let i = 0
  let drapeaux = -1
  let bit = 8
  while (i < octets.length) {
    if (bit === 8) {
      drapeaux = sortie.length
      sortie.push(0)
      bit = 0
    }

    let meilleure = 0
    let distance = 0
    if (i + 2 < octets.length) {
      let j = dernier.get(cle(i)) ?? -1
      for (let essai = 0; j >= 0 && i - j <= FENETRE && essai < ESSAIS; essai++, j = precedent[j]) {
        let n = 0
        while (n < PLUS_LONG && i + n < octets.length && octets[j + n] === octets[i + n]) n++
        if (n > meilleure) {
          meilleure = n
          distance = i - j
          if (n === PLUS_LONG) break
        }
      }
    }

    if (meilleure >= PLUS_COURT) {
      const d = distance - 1
      sortie.push(d & 0xff, ((d >> 8) << 4) | (meilleure - PLUS_COURT))
      for (let k = 0; k < meilleure; k++) retenir(i + k)
      i += meilleure
    } else {
      sortie[drapeaux] |= 1 << bit
      sortie.push(octets[i])
      retenir(i)
      i++
    }
    bit++
  }
  return Uint8Array.from(sortie)
}

export function decompresser(octets) {
  const sortie = []
  let i = 0
  while (i < octets.length) {
    const drapeaux = octets[i++]
    for (let bit = 0; bit < 8 && i < octets.length; bit++) {
      if (drapeaux & (1 << bit)) {
        sortie.push(octets[i++])
      } else {
        const b1 = octets[i++]
        const b2 = octets[i++]
        const distance = (b1 | ((b2 >> 4) << 8)) + 1
        const longueur = (b2 & 0x0f) + PLUS_COURT
        if (distance > sortie.length) throw new Error('recopie avant le début')
        for (let k = 0; k < longueur; k++) sortie.push(sortie[sortie.length - distance])
      }
    }
  }
  return Uint8Array.from(sortie)
}

/* ------------------------------------------------ graver, relire */

const somme = (octets) => {
  let s = 0
  for (const o of octets) s = (s + o) & 0xffff
  return s
}

/**
 * Grave les fichiers du projet au bout de la cartouche.
 *
 * @param rom       la cartouche de 32 Ko, déjà remplie
 * @param finDuCode la première adresse que le programme compilé n'occupe pas
 * @param source    { principal: 'principal.cpp', fichiers: [[nom, texte], …] }
 * @returns { grave: true, octets } ou { grave: false, raison }
 */
export function graverLeSource(rom, finDuCode, source) {
  const texte = new TextEncoder().encode(JSON.stringify(source))
  const serre = compresser(texte)
  const [mode, donnees] = serre.length < texte.length ? [1, serre] : [0, texte]

  const libre = TAILLE - LONGUEUR_MARQUE - finDuCode
  if (donnees.length > libre || donnees.length > 0xffff) {
    return {
      grave: false,
      raison: `le programme fait ${donnees.length} octets compressé, il reste ${Math.max(0, libre)} octets libres`,
    }
  }

  const marque = TAILLE - LONGUEUR_MARQUE
  rom.set(donnees, marque - donnees.length)
  for (let i = 0; i < MARQUE.length; i++) rom[marque + i] = MARQUE.charCodeAt(i)
  rom[marque + 10] = VERSION
  rom[marque + 11] = mode
  rom[marque + 12] = donnees.length & 0xff
  rom[marque + 13] = donnees.length >> 8
  const s = somme(donnees)
  rom[marque + 14] = s & 0xff
  rom[marque + 15] = s >> 8
  return { grave: true, octets: donnees.length + LONGUEUR_MARQUE }
}

/**
 * Relit le programme gravé, s'il y en a un.
 *
 * @returns { principal, fichiers: [[nom, texte], …] } ou null — une cartouche
 *          d'ailleurs, ou fabriquée avant ce module, n'en porte pas.
 */
export function lireLeSource(rom) {
  if (!rom || rom.length < TAILLE) return null
  const marque = TAILLE - LONGUEUR_MARQUE
  for (let i = 0; i < MARQUE.length; i++) if (rom[marque + i] !== MARQUE.charCodeAt(i)) return null
  if (rom[marque + 10] !== VERSION) return null

  const mode = rom[marque + 11]
  const longueur = rom[marque + 12] | (rom[marque + 13] << 8)
  if (longueur > marque) return null
  const donnees = rom.slice(marque - longueur, marque)
  if (somme(donnees) !== (rom[marque + 14] | (rom[marque + 15] << 8))) return null

  try {
    const texte = mode === 1 ? decompresser(donnees) : donnees
    const source = JSON.parse(new TextDecoder().decode(texte))
    if (typeof source?.principal !== 'string' || !Array.isArray(source.fichiers)) return null
    return source
  } catch {
    return null
  }
}

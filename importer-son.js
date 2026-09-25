/**
 * Importer de la musique : un fichier MIDI, ou un son enregistré (WAV).
 *
 * La Game Boy ne joue pas de fichiers : elle joue des NOTES, sur deux voix
 * carrées. Importer, c'est donc traduire en `Air` — une suite de pas, une
 * hauteur par pas — ce que l'atelier des musiques sait déjà écrire et jouer.
 *
 *   MIDI   exact : les notes y sont écrites. On en tire la mélodie (la note
 *          la plus haute à chaque pas) et la basse (la plus basse), deux airs
 *          pour les deux voix.
 *   WAV    approximatif : un son n'est pas une partition. On écoute chaque
 *          petit morceau, on cherche sa hauteur dominante, et l'on garde la
 *          note la plus proche. Une voix qui chante ou un sifflement donnent
 *          une mélodie reconnaissable ; un orchestre, beaucoup moins — c'est
 *          la limite de deux voix carrées, et on le dit.
 */

/** DO2 est le MIDI 36 : la plus grave des notes de la console ; SI6 (MIDI 95) la plus aiguë. */
const MIDI_MIN = 36
const MIDI_MAX = 95
/** Un tableau du programme ne dépasse pas 256 cases : un air non plus. */
export const PAS_MAXI = 256

const DEMI_TONS = ['DO', 'DOD', 'RE', 'RED', 'MI', 'FA', 'FAD', 'SOL', 'SOLD', 'LA', 'LAD', 'SI']

/** Un numéro MIDI → le nom d'une note de la console (« LA4 »), ramené dans ses cinq octaves. */
export function nomDeNote(midi) {
  let m = Math.round(midi)
  while (m < MIDI_MIN) m += 12
  while (m > MIDI_MAX) m -= 12
  return DEMI_TONS[m % 12] + (Math.floor(m / 12) - 1)
}

/* ------------------------------------------------------------ le MIDI */

/** Lit un fichier MIDI : ses notes, en temps (secondes), et sa résolution. */
export function lireMidi(tampon) {
  const o = new Uint8Array(tampon)
  let i = 0
  const texte = (n) => { const t = String.fromCharCode(...o.slice(i, i + n)); i += n; return t }
  const u32 = () => { const v = (o[i] << 24) | (o[i + 1] << 16) | (o[i + 2] << 8) | o[i + 3]; i += 4; return v >>> 0 }
  const u16 = () => { const v = (o[i] << 8) | o[i + 1]; i += 2; return v }
  const vlq = () => { let v = 0; for (;;) { const b = o[i++]; v = (v << 7) | (b & 0x7f); if (!(b & 0x80)) return v } }

  if (texte(4) !== 'MThd') throw new Error('ce fichier n’est pas un MIDI (il ne commence pas par « MThd »)')
  const longueurTete = u32()
  u16() // le format : 0, 1 ou 2 — on lit toutes les pistes pareil
  const pistes = u16()
  const division = u16()
  i = 8 + longueurTete
  if (division & 0x8000) throw new Error('ce MIDI compte en images SMPTE : ce n’est pas pris en charge')

  const notes = []   // { debut, fin, midi, canal } en « ticks »
  const tempos = [{ tick: 0, us: 500000 }]
  for (let p = 0; p < pistes && i < o.length; p++) {
    if (texte(4) !== 'MTrk') break
    const fin = i + 4 + u32() - 4
    const fin_ = fin
    let tick = 0
    let statut = 0
    const ouvertes = new Map()
    while (i < fin_) {
      tick += vlq()
      let s = o[i]
      if (s & 0x80) { statut = s; i++ } else s = statut
      const type = s & 0xf0
      const canal = s & 0x0f
      if (s === 0xff) {
        const meta = o[i++]
        const n = vlq()
        if (meta === 0x51 && n === 3) tempos.push({ tick, us: (o[i] << 16) | (o[i + 1] << 8) | o[i + 2] })
        i += n
      } else if (s === 0xf0 || s === 0xf7) {
        i += vlq()
      } else if (type === 0x90 || type === 0x80) {
        const note = o[i]; const vel = o[i + 1]; i += 2
        const cle = canal * 128 + note
        if (type === 0x90 && vel > 0) {
          ouvertes.set(cle, tick)
        } else if (ouvertes.has(cle)) {
          notes.push({ debut: ouvertes.get(cle), fin: tick, midi: note, canal })
          ouvertes.delete(cle)
        }
      } else if (type === 0xc0 || type === 0xd0) {
        i += 1
      } else {
        i += 2
      }
    }
    i = fin_
  }
  tempos.sort((a, b) => a.tick - b.tick)
  return { notes, division, tempo: tempos.find((t) => t.tick === 0 && t.us !== 500000)?.us ?? tempos[tempos.length - 1].us }
}

/**
 * Un MIDI → deux airs : la mélodie et la basse.
 *
 * Chaque pas dure une croche (la moitié d'une noire) : assez fin pour la
 * plupart des mélodies, assez court pour tenir dans 256 pas. La batterie
 * (canal 10) n'est pas une hauteur : elle est laissée de côté.
 */
export function airsDepuisMidi(tampon, { parNoire = 2 } = {}) {
  const { notes, division, tempo } = lireMidi(tampon)
  const jouees = notes.filter((n) => n.canal !== 9 && n.fin > n.debut)
  if (!jouees.length) throw new Error('ce MIDI n’a aucune note (hors batterie)')
  const tickParPas = division / parNoire
  const premier = Math.min(...jouees.map((n) => n.debut))
  const dernier = Math.max(...jouees.map((n) => n.fin))
  const nombre = Math.min(PAS_MAXI, Math.ceil((dernier - premier) / tickParPas))
  const voix = (choisir) => {
    const pas = []
    let avant = null
    for (let k = 0; k < nombre; k++) {
      const t0 = premier + k * tickParPas
      const t1 = t0 + tickParPas
      const sonnent = jouees.filter((n) => n.debut < t1 && n.fin > t0)
      if (!sonnent.length) { pas.push('--'); avant = null; continue }
      const n = choisir(sonnent)
      /* Une note qui continue depuis le pas d'avant se TIENT ; une qui commence se rejoue. */
      if (avant === n && n.debut < t0) pas.push('==')
      else pas.push(`${nomDeNote(n.midi)} 12`)
      avant = n
    }
    return pas
  }
  const plusHaute = (liste) => liste.reduce((a, b) => (b.midi > a.midi ? b : a))
  const plusBasse = (liste) => liste.reduce((a, b) => (b.midi < a.midi ? b : a))
  const melodie = voix(plusHaute)
  const basse = voix(plusBasse)
  /* La basse n'est gardée que si elle dit autre chose que la mélodie. */
  const differente = basse.some((p, k) => p !== melodie[k])
  /* La vitesse : combien d'images (1/60 s) dure un pas. */
  const secondesParPas = (tempo / 1e6) / parNoire
  const vitesse = Math.max(1, Math.min(30, Math.round(secondesParPas * 60)))
  return { melodie, basse: differente ? basse : null, vitesse, tronque: Math.ceil((dernier - premier) / tickParPas) > PAS_MAXI }
}

/* ------------------------------------------------------------ le WAV */

/** La hauteur dominante d'un morceau de son, par autocorrélation — ou null (silence, bruit). */
function hauteurDe(echantillons, debut, taille, frequence) {
  let energie = 0
  for (let k = 0; k < taille; k++) energie += echantillons[debut + k] ** 2
  if (Math.sqrt(energie / taille) < 0.02) return null // trop doux : un silence
  const minP = Math.floor(frequence / 1100) // jusqu'à ~1100 Hz
  const maxP = Math.floor(frequence / 60)   // depuis ~60 Hz
  let meilleur = 0
  let periode = 0
  for (let p = minP; p <= maxP; p++) {
    let somme = 0
    for (let k = 0; k + p < taille; k++) somme += echantillons[debut + k] * echantillons[debut + k + p]
    if (somme > meilleur) { meilleur = somme; periode = p }
  }
  if (!periode || meilleur < energie * 0.3) return null // pas de hauteur nette : du bruit
  const hertz = frequence / periode
  return 69 + 12 * Math.log2(hertz / 440)
}

/**
 * Des échantillons (un son décodé) → un air : une note par morceau de
 * « vitesse » images. Deux morceaux de même note se tiennent (« == »).
 */
export function airDepuisEchantillons(echantillons, frequence, { vitesse = 8 } = {}) {
  const taillePas = Math.round(frequence * vitesse / 60)
  const fenetre = Math.min(taillePas, 2048)
  const nombre = Math.min(PAS_MAXI, Math.floor(echantillons.length / taillePas))
  const pas = []
  let avant = null
  for (let k = 0; k < nombre; k++) {
    const h = hauteurDe(echantillons, k * taillePas, fenetre, frequence)
    if (h === null) { pas.push('--'); avant = null; continue }
    const nom = nomDeNote(h)
    pas.push(nom === avant ? '==' : `${nom} 12`)
    avant = nom
  }
  return { pas, vitesse, tronque: Math.floor(echantillons.length / taillePas) > PAS_MAXI }
}

/** Écrit un air dans le programme (sous forme de texte « Air NOM = {…}; »). */
export function texteDUnAir(nom, pas, commentaire = '') {
  const lignes = []
  for (let k = 0; k < pas.length; k += 8) lignes.push('  ' + pas.slice(k, k + 8).map((p) => `"${p}",`).join(' '))
  return `${commentaire ? `/* ${commentaire} */\n` : ''}Air ${nom} = {\n${lignes.join('\n')}\n};`
}

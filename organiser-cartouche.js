/**
 * Organiser les dessins d'une cartouche : par BANQUE, en PAQUETS, et par RÔLE.
 *
 * « 🗂 Toute la cartouche » donne des milliers de tuiles en vrac (9 000 pour
 * Super Mario Land 2). Pour s'y retrouver, on range de trois façons :
 *
 *   1. PAR BANQUE. La cartouche est découpée en banques de 16 Ko (1024
 *      tuiles) ; un jeu range souvent les dessins d'un même monde dans la
 *      même banque. Chaque banque devient une image de 16 tuiles par rangée
 *      — la largeur des outils de pros — où les tuiles restent À LEUR PLACE :
 *      un personnage rangé en quatre tuiles qui se suivent se reforme. Les
 *      rangées sans aucun dessin sont ôtées ; le bruit restant est en gris.
 *
 *   2. EN PAQUETS. Des tuiles dessinées qui se suivent, sans trou de deux
 *      tuiles ou plus, forment presque toujours UN objet : un personnage, une
 *      police de lettres, un morceau de décor. Un paquet de plus de 64 tuiles
 *      est coupé en morceaux de 64 (4 rangées), pour rester lisible.
 *
 *   3. PAR RÔLE. Le collecteur (🧲, capturer-cartouche.js) a noté, pendant
 *      qu'on jouait, quelles tuiles servaient aux LUTINS (personnages) et
 *      lesquelles au DÉCOR. Une tuile de la cartouche qui a la même clé (les
 *      mêmes 16 octets) a le même rôle. Le rôle d'un paquet est celui de la
 *      majorité de ses tuiles connues ; s'il n'en a aucune, il va dans
 *      « pas encore vu » — il faudra jouer jusque-là avec 🧲.
 *
 * Et pour les personnages, on reforme aussi les 16 × 16 (4 tuiles), dans les
 * trois ordres possibles (comme dans la planche, ligne par ligne, colonne par
 * colonne) : on garde celui qui ressemble.
 *
 * Ce fichier calcule (organiser) et dessine (imagesDuRangement) ; c'est
 * dossier-captures.js qui envoie le tout dans le dossier de la cartouche.
 */
import { tuilesDUneBanque, nombreDeBanques, assembler, cleDUneTuile, TUILES_PAR_BANQUE } from './capturer-cartouche.js'

export const PAR_RANGEE = 16
const PAQUET_MAX = 64
export const DOSSIER_DU_ROLE = { lutin: 'personnages', decor: 'decor', inconnu: 'pas-encore-vu' }

/**
 * Le rangement d'une cartouche.
 *   rom    ses octets ;
 *   roles  Map clé → 'lutin' | 'decor' (celle du collecteur ; vide : tout est « pas encore vu »).
 * Rend { banques: [{ banque, tuiles, dessins, rangees }], paquets: [{ id, banque, debut, adresse, tuiles, role, lutins, decors }] }
 *   rangees : les numéros des rangées de 16 gardées dans l'image de la banque ;
 *   debut   : la place de la première tuile dans sa banque ; tuiles : les tuiles du paquet.
 */
export function organiser(rom, roles = new Map()) {
  const banques = []
  const paquets = []
  for (let b = 0; b < nombreDeBanques(rom); b++) {
    const tuiles = tuilesDUneBanque(rom, b)
    const dessins = tuiles.filter((t) => t.nature === 'dessin').length
    if (!dessins) continue
    const rangees = []
    for (let r = 0; r * PAR_RANGEE < tuiles.length; r++) {
      if (tuiles.slice(r * PAR_RANGEE, (r + 1) * PAR_RANGEE).some((t) => t.nature === 'dessin')) rangees.push(r)
    }
    banques.push({ banque: b, tuiles, dessins, rangees })

    /* Les paquets : on avance ; un trou d'une seule tuile ne coupe pas (un
       personnage peut avoir un morceau vide), deux tuiles sans dessin coupent. */
    let i = 0
    let n = 0
    while (i < tuiles.length) {
      if (tuiles[i].nature !== 'dessin') { i++; continue }
      let fin = i
      while (fin + 1 < tuiles.length && (tuiles[fin + 1].nature === 'dessin' || (tuiles[fin].nature === 'dessin' && tuiles[fin + 2]?.nature === 'dessin'))) fin++
      for (let morceau = i; morceau <= fin; morceau += PAQUET_MAX) {
        const lesTuiles = tuiles.slice(morceau, Math.min(fin + 1, morceau + PAQUET_MAX))
        let lutins = 0, decors = 0
        for (const t of lesTuiles) {
          const role = roles.get(cleDUneTuile(rom, t.adresse))
          if (role === 'lutin') lutins++
          else if (role === 'decor') decors++
        }
        const role = lutins > decors ? 'lutin' : decors ? 'decor' : 'inconnu'   // à égalité : décor (le fond a bien plus de tuiles)
        n++
        paquets.push({ id: `b${String(b).padStart(2, '0')}-${String(n).padStart(3, '0')}`, banque: b, debut: morceau, adresse: lesTuiles[0].adresse, tuiles: lesTuiles, role, lutins, decors })
      }
      i = fin + 1
    }
  }
  return { banques, paquets }
}

/* ===================================================================== */
/*  Les images (dans le navigateur : elles passent par un canevas)        */
/* ===================================================================== */

const NUANCES = ['#e0f8d0', '#88c070', '#346856', '#081820']
const ZOOM = 2

function toile(largeur, hauteur) {
  const c = document.createElement('canvas')
  c.width = Math.max(1, largeur)
  c.height = Math.max(1, hauteur)
  return c
}

/* Une tuile : le bruit en gris (on voit qu'il n'y a rien à prendre), le vide en clair. */
function peindre(ctx, tuile, gx, gy) {
  if (tuile.nature === 'bruit') { ctx.fillStyle = '#7a7a7a'; ctx.fillRect(gx, gy, 8 * ZOOM, 8 * ZOOM); return }
  tuile.rangees.forEach((r, y) => [...r].forEach((c, x) => {
    ctx.fillStyle = NUANCES[Number(c)]
    ctx.fillRect(gx + x * ZOOM, gy + y * ZOOM, ZOOM, ZOOM)
  }))
}

/** Des tuiles, 16 par rangée (moins s'il y en a moins), en PNG. */
function planche(tuiles) {
  const large = Math.min(PAR_RANGEE, tuiles.length)
  const c = toile(large * 8 * ZOOM, Math.ceil(tuiles.length / PAR_RANGEE) * 8 * ZOOM)
  const ctx = c.getContext('2d')
  tuiles.forEach((t, i) => peindre(ctx, t, (i % PAR_RANGEE) * 8 * ZOOM, Math.floor(i / PAR_RANGEE) * 8 * ZOOM))
  return c.toDataURL('image/png')
}

/** Les 16 × 16 d'un paquet (4 tuiles par personnage), côte à côte, séparés de 4 pixels. */
/**
 * Où commence chaque 16 × 16 d'un paquet de « nombre » tuiles :
 *   « grille » : les carrés de 2 × 2 de la planche (16 par rangée), deux
 *                rangées à la fois ;
 *   « lignes », « colonnes » : toutes les 4 tuiles.
 */
export function departsDes16(nombre, ordre) {
  if (ordre !== 'grille') return Array.from({ length: Math.floor(nombre / 4) }, (_, g) => g * 4)
  const departs = []
  for (let r = 0; r * PAR_RANGEE < nombre; r += 2) {
    for (let c = 0; c < PAR_RANGEE; c += 2) if (r * PAR_RANGEE + c < nombre) departs.push(r * PAR_RANGEE + c)
  }
  return departs
}
export const ORDRES_DES_16 = [['grille', 'comme dans la planche'], ['lignes', 'ligne par ligne'], ['colonnes', 'colonne par colonne']]

function seize(tuiles, ordre) {
  const departs = departsDes16(tuiles.length, ordre)
  const pas = 16 * ZOOM + 4
  const c = toile(departs.length * pas - 4, 16 * ZOOM)
  const ctx = c.getContext('2d')
  for (let g = 0; g < departs.length; g++) {
    const d = assembler(tuiles, departs[g], 16, ordre)
    d.rangees.forEach((r, y) => [...r].forEach((v, x) => {
      ctx.fillStyle = NUANCES[Number(v)]
      ctx.fillRect(g * pas + x * ZOOM, y * ZOOM, ZOOM, ZOOM)
    }))
  }
  return c.toDataURL('image/png')
}

/**
 * Toutes les images du rangement, et sa description (rangement.json).
 * Rend { images: [{ chemin, png }], description }.
 *   banques/banque-05.png
 *   personnages/b05-003.png, personnages/b05-003-16x16-lignes.png, …-colonnes.png
 *   decor/b05-004.png
 *   pas-encore-vu/b06-001.png
 */
export function imagesDuRangement({ banques, paquets }) {
  const images = []
  const description = { fait: new Date().toISOString(), banques: [], paquets: [] }
  for (const b of banques) {
    const chemin = `banques/banque-${String(b.banque).padStart(2, '0')}.png`
    const gardees = b.rangees.flatMap((r) => b.tuiles.slice(r * PAR_RANGEE, (r + 1) * PAR_RANGEE))
    images.push({ chemin, png: planche(gardees) })
    description.banques.push({ banque: b.banque, dessins: b.dessins, rangees: b.rangees.length, image: chemin })
  }
  for (const p of paquets) {
    const dossier = DOSSIER_DU_ROLE[p.role]
    const chemin = `${dossier}/${p.id}.png`
    images.push({ chemin, png: planche(p.tuiles) })
    const entree = { id: p.id, banque: p.banque, adresse: p.adresse, tuiles: p.tuiles.length, role: p.role, lutins: p.lutins, decors: p.decors, image: chemin }
    if (p.role === 'lutin' && p.tuiles.length >= 4) {
      entree.seize = {}
      for (const [ordre] of ORDRES_DES_16) {
        entree.seize[ordre] = `${dossier}/${p.id}-16x16-${ordre}.png`
        images.push({ chemin: entree.seize[ordre], png: seize(p.tuiles, ordre) })
      }
    }
    description.paquets.push(entree)
  }
  description.compte = {
    banques: banques.length,
    personnages: paquets.filter((p) => p.role === 'lutin').length,
    decor: paquets.filter((p) => p.role === 'decor').length,
    inconnu: paquets.filter((p) => p.role === 'inconnu').length,
  }
  return { images, description }
}

export { TUILES_PAR_BANQUE }

/**
 * Une leçon, décomposée en étapes — de quoi en faire un livret détaillé.
 *
 * Rien n'est décrit à la main. Le programme est découpé en morceaux par sa
 * propre forme ; les images viennent de l'émulateur qui exécute vraiment la
 * cartouche ; les contrôles sont ceux de la leçon, JOUÉS, avec ce qu'ils ont
 * mesuré. Un livret rédigé à côté du code deviendrait faux à la première
 * retouche, et personne ne s'en apercevrait — c'est justement ce qu'on veut
 * éviter en montrant chaque étape.
 */

import { png } from '../compilateur/png.mjs'
import { NUANCES_ECRITES } from '../compilateur/emetteur.js'
import { consoleDuProgramme } from './console.mjs'

/** Les quatre nuances de l'écran vert d'origine. */
const NUANCES = [[0xe0, 0xf8, 0xd0], [0x88, 0xc0, 0x70], [0x34, 0x68, 0x56], [0x08, 0x18, 0x20]]

const enImage = (octets) => `data:image/png;base64,${octets.toString('base64')}`

/** Ce que l'écran montre à cet instant, en PNG. */
export function imageDeLEcran(gb) {
  const rvb = new Uint8Array(160 * 144 * 3)
  for (let i = 0; i < 160 * 144; i++) {
    const [r, v, b] = NUANCES[gb.framebuffer[i] & 3]
    rvb[i * 3] = r
    rvb[i * 3 + 1] = v
    rvb[i * 3 + 2] = b
  }
  return enImage(png(160, 144, rvb))
}

/** Une tuile dessinée, agrandie : huit sur huit, chaque pixel en huit. */
function imageDeLaTuile(rangees) {
  const cote = rangees.length
  const grossi = 6
  const large = cote * grossi
  const rvb = new Uint8Array(large * large * 3)

  for (let y = 0; y < large; y++) {
    for (let x = 0; x < large; x++) {
      const nuance = NUANCES_ECRITES[rangees[(y / grossi) | 0][(x / grossi) | 0]] ?? 0
      const [r, v, b] = NUANCES[nuance]
      const i = (y * large + x) * 3
      rvb[i] = r
      rvb[i + 1] = v
      rvb[i + 2] = b
    }
  }

  return enImage(png(large, large, rvb))
}

/* ------------------------------------------------ découper le programme */

const DEBUTS = [
  [/^\s*(Tuile|Perso)\s+(\w+)/, (m) => ({ quoi: `un dessin — ${m[2]}`, dessin: m[2] })],
  [/^\s*Air\s+(\w+)/, (m) => ({ quoi: `une mélodie — ${m[1]}` })],
  [/^\s*enum\s+(\w+)?/, (m) => ({ quoi: `des constantes nommées${m[1] ? ` — ${m[1]}` : ''}` })],
  [/^\s*struct\s+(\w+)/, (m) => ({ quoi: `un enregistrement — ${m[1]}` })],
  [/^\s*const\s+char\s+(\w+)/, (m) => ({ quoi: `un texte nommé — ${m[1]}` })],
  [/^\s*const\s+\w+\s+(\w+)\s*\[/, (m) => ({ quoi: `une table gravée dans la cartouche — ${m[1]}` })],
  [/^\s*const\s+\w+\s+(\w+)/, (m) => ({ quoi: `une constante — ${m[1]}` })],
  [/^\s*int\s+main\s*\(/, () => ({ quoi: 'le point d’entrée : c’est ici que la console arrive' })],
  [/^\s*(?:void|uint8_t|int|char|bool|auto|\w+)\s+(\w+)\s*\([^)]*\)\s*\{/, (m) => ({ quoi: `une fonction — ${m[1]}()` })],
  [/^\s*\w+\s+(\w+)\s*\[/, (m) => ({ quoi: `un tableau — ${m[1]}` })],
  [/^\s*\w+\s+(\w+)\s*(=|;)/, (m) => ({ quoi: `une variable — ${m[1]}` })],
]

/**
 * Le programme, morceau par morceau.
 *
 * On découpe sur les déclarations de premier niveau — celles qui commencent à
 * la marge. Ce n'est pas un analyseur, et il n'en faut pas un : ce qu'on veut
 * montrer, ce sont les blocs tels que l'œil les voit dans le fichier.
 */
export function decouperLeProgramme(code, dessins) {
  const lignes = code.split('\n')
  const morceaux = []
  let courant = null
  let profondeur = 0

  for (const ligne of lignes) {
    const aLaMarge = profondeur === 0 && /^\S/.test(ligne)
    const commentaire = /^\s*(\/\/|\/\*|\*)/.test(ligne)

    if (aLaMarge && !commentaire) {
      for (const [motif, decrire] of DEBUTS) {
        const coup = ligne.match(motif)
        if (!coup) continue
        courant = { ...decrire(coup), lignes: [] }
        morceaux.push(courant)
        break
      }
    }

    if (!courant) {
      /* Ce qui précède la première déclaration : l'en-tête du fichier. */
      courant = { quoi: 'ce que le programme raconte de lui-même', lignes: [] }
      morceaux.push(courant)
    }

    courant.lignes.push(ligne)
    profondeur += (ligne.match(/\{/g) ?? []).length - (ligne.match(/\}/g) ?? []).length
  }

  return morceaux
    .map((m) => ({
      quoi: m.quoi,
      code: m.lignes.join('\n').replace(/^\n+|\n+$/g, ''),
      /* Un dessin se montre : lire « 30222203 » ne dit pas ce qu'on verra. */
      image: m.dessin && dessins.has(m.dessin) ? imageDeLaTuile(dessins.get(m.dessin).rangees) : null,
    }))
    .filter((m) => m.code.trim().length > 0)
}

/* ----------------------------------------------- ce que l'écran devient */

/** Les instants qu'on photographie, et ce qu'on en dit. */
const INSTANTS = [
  [1, 'la toute première image — la console vient de démarrer'],
  [20, 'un tiers de seconde plus tard : le premier dessin est posé'],
  [60, 'au bout d’une seconde'],
  [180, 'au bout de trois secondes'],
  [420, 'au bout de sept secondes'],
]

/** Les touches qu'un programme lit vraiment, dans l'ordre où on les essaie. */
const TOUCHES = [
  ['a', 'A', /bouton\s*\(\s*A\s*\)/],
  ['b', 'B', /bouton\s*\(\s*B\s*\)/],
  ['right', 'DROITE', /bouton\s*\(\s*DROITE\s*\)/],
  ['left', 'GAUCHE', /bouton\s*\(\s*GAUCHE\s*\)/],
  ['up', 'HAUT', /bouton\s*\(\s*HAUT\s*\)/],
  ['down', 'BAS', /bouton\s*\(\s*BAS\s*\)/],
  ['start', 'START', /bouton\s*\(\s*START\s*\)/],
]

/**
 * L'exécution, étape par étape.
 *
 * Une image identique à la précédente n'apprend rien et coûte une page : on ne
 * garde que celles où l'écran a changé. Un programme qui ne bouge pas n'a donc
 * qu'une seule image, et c'est la vérité sur ce programme.
 */
export function etapesDeLExecution(lecon) {
  const { laConsole, gb } = consoleDuProgramme(lecon.code, lecon.titre, false)
  const etapes = []
  let precedent = null
  let images = 0

  for (const [quand, dit] of INSTANTS) {
    laConsole.avancer(quand - images)
    images = quand

    const maintenant = Buffer.from(gb.framebuffer)
    if (precedent && maintenant.equals(precedent)) continue
    precedent = maintenant

    etapes.push({ dit: `${dit} — image ${quand}`, image: imageDeLEcran(gb) })
  }

  /* --- ce que les touches changent --- */
  const touches = []
  for (const [nom, etiquette, motif] of TOUCHES) {
    if (!motif.test(lecon.code)) continue

    const avant = Buffer.from(gb.framebuffer)
    gb.setButton(nom, true)
    laConsole.avancer(12)
    gb.setButton(nom, false)
    laConsole.avancer(6)

    const apres = Buffer.from(gb.framebuffer)
    touches.push({
      etiquette,
      change: !apres.equals(avant),
      image: imageDeLEcran(gb),
    })
  }

  return { etapes, touches }
}

/**
 * Les contrôles de la leçon, JOUÉS — et ce qu'ils ont mesuré.
 *
 * Ce sont exactement ceux que `verifier-tuto.mjs` exige. Les montrer dans le
 * livret, c'est montrer au lecteur comment on s'assure qu'un programme fait ce
 * qu'il promet : on ne le relit pas, on l'interroge.
 */
export function controlesJoues(lecon) {
  try {
    const { laConsole } = consoleDuProgramme(lecon.code, lecon.titre)
    return lecon.controle(laConsole).map(([quoi, bon, detail]) => ({ quoi, bon: Boolean(bon), detail: detail ?? '' }))
  } catch (erreur) {
    return [{ quoi: 'le contrôle n’a pas pu être joué', bon: false, detail: erreur.message }]
  }
}

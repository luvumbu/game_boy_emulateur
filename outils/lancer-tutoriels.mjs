/**
 * Faire tourner les soixante-quatorze leçons, et les photographier.
 *
 *   node lancer-tutoriels.mjs              toutes, en une planche-contact
 *   node lancer-tutoriels.mjs 38           celle-là seule, en grand
 *   node lancer-tutoriels.mjs 38 --touches A,A,DROITE
 *
 * `verifier-tutoriels.mjs` prouve que le code COMPILE. Ce n'est pas la même
 * chose que de marcher : une cartouche peut s'assembler parfaitement et rester
 * noire. Ici chaque programme est chargé dans l'émulateur du projet, on le
 * laisse tourner, et l'on écrit ce que l'écran affichait.
 *
 * Les images sortent dans `tutoriels/`, plus une planche-contact qui les
 * rassemble — c'est elle qui montre, d'un coup d'œil, celui qui est resté noir.
 */

import { writeFileSync, mkdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { batir } from './controle.mjs'
import { LECONS } from '../tuto/lecons.js'
import { GameBoy } from '../emulateur.js'
import { png } from '../compilateur/png.mjs'

const NUANCES = [[0xe0, 0xf8, 0xd0], [0x88, 0xc0, 0x70], [0x34, 0x68, 0x56], [0x08, 0x18, 0x20]]
const LARGEUR = 160
const HAUTEUR = 144

/* --------------------------------------------------- lire les leçons */

/*
 * La source est `tuto/lecons.js`, et non `TUTORIELS.md`.
 *
 * Le markdown est engendré depuis les leçons ; le relire pour en ressortir le
 * code serait faire l'aller-retour, et donner l'occasion à une virgule de se
 * perdre en chemin. On prend les programmes là où ils sont écrits.
 */
const tutoriels = LECONS.map((lecon, i) => ({
  titre: `${i + 1}. ${lecon.titre}`,
  numero: i + 1,
  etiquette: String(i + 1),
  code: lecon.code.split(String.fromCharCode(10)),
}))

/* ------------------------------------------------------- les arguments */

const demande = process.argv[2] && /^\d+$/.test(process.argv[2]) ? Number(process.argv[2]) : null
const iTouches = process.argv.indexOf('--touches')
const touches = iTouches > 0 ? (process.argv[iTouches + 1] ?? '').split(',').filter(Boolean) : []

const choisis = demande === null ? tutoriels : tutoriels.filter((t) => t.numero === demande)
if (!choisis.length) {
  console.error(`aucune leçon numéro ${demande} — il y en a de 1 à ${tutoriels.length}`)
  process.exit(1)
}

/* ------------------------------------------------------ faire tourner */

const BOUTONS = {
  A: 'a', B: 'b', HAUT: 'up', BAS: 'down',
  GAUCHE: 'left', DROITE: 'right', START: 'start', SELECT: 'select',
}

const dossierTemporaire = tmpdir()
let numeroDeFichier = 0

/**
 * Compiler, charger, laisser tourner — et rendre l'écran.
 *
 * Cent-vingt images, soit deux secondes de console : assez pour qu'un compteur
 * ait bougé, qu'un objet soit tombé, qu'une scène ait démarré. Les touches
 * demandées sont pressées ensuite, une par une, avec le temps de faire effet —
 * un tutoriel qui n'attend qu'un appui montrerait sinon son écran de départ.
 */
function faireTourner(tutoriel) {
  const chemin = join(dossierTemporaire, `lancer-${numeroDeFichier++}.cpp`)
  writeFileSync(chemin, tutoriel.code.join('\n') + '\n')

  try {
    const bati = batir(chemin, tutoriel.etiquette)
    const gb = new GameBoy()
    gb.loadRom(bati.rom)

    for (let i = 0; i < 120; i++) gb.runFrame()

    for (const nom of touches) {
      const bouton = BOUTONS[nom.toUpperCase()]
      if (!bouton) throw new Error(`touche inconnue : « ${nom} » (${Object.keys(BOUTONS).join(', ')})`)
      gb.setButton(bouton, true)
      for (let i = 0; i < 8; i++) gb.runFrame()
      gb.setButton(bouton, false)
      for (let i = 0; i < 20; i++) gb.runFrame()
    }

    return { gb, bati }
  } finally {
    rmSync(chemin, { force: true })
  }
}

/** Les pixels de l'écran, en rouge-vert-bleu. */
function pixels(gb, grossir = 1) {
  const rvb = Buffer.alloc(LARGEUR * grossir * HAUTEUR * grossir * 3)
  for (let y = 0; y < HAUTEUR * grossir; y++) {
    for (let x = 0; x < LARGEUR * grossir; x++) {
      const [r, v, b] = NUANCES[gb.framebuffer[((y / grossir) | 0) * LARGEUR + ((x / grossir) | 0)] & 3]
      const ou = (y * LARGEUR * grossir + x) * 3
      rvb[ou] = r
      rvb[ou + 1] = v
      rvb[ou + 2] = b
    }
  }
  return rvb
}

/** Un écran est-il resté vide ? C'est ce qu'on veut repérer d'un coup d'œil. */
function estNoir(gb) {
  const premier = gb.framebuffer[0] & 3
  for (let i = 1; i < LARGEUR * HAUTEUR; i++) if ((gb.framebuffer[i] & 3) !== premier) return false
  return true
}

mkdirSync('tutoriels', { recursive: true })

console.log(`${choisis.length} programme${choisis.length > 1 ? 's' : ''} — 120 images chacun` +
  (touches.length ? `, puis ${touches.join(', ')}` : ''))
console.log()

const rendus = []
let vides = 0
let fautes = 0

for (const tutoriel of choisis) {
  let etat
  try {
    etat = faireTourner(tutoriel)
  } catch (erreur) {
    console.log(`  ✗ ${tutoriel.titre}\n      ${erreur.message}`)
    fautes++
    continue
  }

  const { gb, bati } = etat
  const grossir = demande === null ? 1 : 3
  const nom = join('tutoriels', `${tutoriel.etiquette.padStart(2, '0')}.png`)
  writeFileSync(nom, png(LARGEUR * grossir, HAUTEUR * grossir, pixels(gb, grossir)))

  const vide = estNoir(gb)
  if (vide) vides++
  rendus.push({ tutoriel, gb })

  const taille = `${String(bati.octets.length).padStart(4)} o`
  const memoire = `${String(bati.memoire).padStart(3)} o RAM`
  console.log(`  ${vide ? '·' : '✓'} ${tutoriel.etiquette.padEnd(4)} ${taille}  ${memoire}  ${tutoriel.titre}`)
}

/* ------------------------------------------------- la planche-contact */

if (rendus.length > 1) {
  /*
   * Tout sur une image, six par rangée.
   *
   * Cinquante fichiers ouverts un par un, personne ne les regarde. Une planche,
   * si — et c'est là qu'on voit d'un coup lequel est resté noir.
   */
  const PAR_RANGEE = 6
  const MARGE = 4
  const rangees = Math.ceil(rendus.length / PAR_RANGEE)
  const largeur = PAR_RANGEE * (LARGEUR + MARGE) + MARGE
  const hauteur = rangees * (HAUTEUR + MARGE) + MARGE
  const planche = Buffer.alloc(largeur * hauteur * 3, 0x18)

  rendus.forEach(({ gb }, i) => {
    const ox = MARGE + (i % PAR_RANGEE) * (LARGEUR + MARGE)
    const oy = MARGE + Math.floor(i / PAR_RANGEE) * (HAUTEUR + MARGE)
    for (let y = 0; y < HAUTEUR; y++) {
      for (let x = 0; x < LARGEUR; x++) {
        const [r, v, b] = NUANCES[gb.framebuffer[y * LARGEUR + x] & 3]
        const ou = ((oy + y) * largeur + ox + x) * 3
        planche[ou] = r
        planche[ou + 1] = v
        planche[ou + 2] = b
      }
    }
  })

  writeFileSync('tutoriels/planche.png', png(largeur, hauteur, planche))
  console.log(`\n  → tutoriels/planche.png — ${rendus.length} écrans, ${PAR_RANGEE} par rangée`)
}

console.log(`\n  ${rendus.length} ont tourné` +
  (vides ? `, dont ${vides} à écran uni (normal pour ceux qui attendent une touche)` : '') +
  (fautes ? `, ${fautes} en faute` : ''))

process.exit(fautes ? 1 : 0)

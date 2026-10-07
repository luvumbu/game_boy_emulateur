/**
 * La couleur arrive-t-elle vraiment à l'écran ?
 *
 *   node verifier-couleur.mjs
 *
 * Une cartouche peut porter le drapeau, poser ses palettes et rester verte :
 * il suffit qu'un attribut ne soit pas écrit dans la bonne banque de VRAM, ou
 * que l'index de palette ne s'auto-incrémente pas. Rien ne le signale — le
 * programme tourne, et l'écran a simplement l'air d'une Game Boy d'origine.
 *
 * On relit donc l'écran EN COULEURS, et l'on compte les teintes distinctes.
 */

import { demarrer, batir, bulletin } from '../outils/controle.mjs'
import { GameBoy } from '../emulateur.js'
import { readFileSync } from 'node:fs'
import { analyser } from '../compilateur/analyseur.js'
import { compiler } from '../compilateur/emetteur.js'
import { fabriquerLaCartouche } from '../compilateur/cartouches.js'
import { CONSOLES, consoleDeLaCartouche } from '../compilateur/consoles.js'

const b = bulletin('exemples/couleur.cpp')

/* ------------------------------------------------ la cartouche elle-même */

const bati = batir('exemples/couleur.cpp', 'COULEUR')

/* « couleur » est l'octet que l'en-tête portera : $00 (Game Boy) ou $C0
   (Game Boy Color), et rien d'autre — voir compilateur/consoles.js. Aucune
   console n'est choisie ici : c'est le programme qui décide, et il pose des
   couleurs. */
b.egal('le programme est reconnu « Game Boy Color »', bati.console, 'gbc')
b.egal('l’octet de l’en-tête est $C0', bati.couleur, 0xc0)
b.egal('le drapeau est gravé en $0143', bati.rom[0x0143], 0xc0)
b.verifier('le titre n’a pas mangé le drapeau',
  bati.rom[0x0142] === 0 || bati.rom[0x0142] !== 0xc0,
  ` (titre : « ${String.fromCharCode(...bati.rom.slice(0x0134, 0x0143)).replace(/\0/g, '')} »)`)

/*
 * La somme de contrôle de l'en-tête doit RESTER juste.
 *
 * Elle court de $0134 à $014C, donc elle inclut le drapeau : le poser sans
 * recalculer la somme donnerait une cartouche que la console refuse de
 * démarrer, sans un mot.
 */
let somme = 0
for (let i = 0x0134; i <= 0x014c; i++) somme = (somme - bati.rom[i] - 1) & 0xff
b.egal('la somme de l’en-tête tient compte du drapeau', bati.rom[0x014d], somme)

/* ------------------------------------------------------- ce qui s'affiche */

const jeu = demarrer('exemples/couleur.cpp', 30)
const ppu = jeu.gb.ppu

b.verifier('l’émulateur est passé en mode couleur', ppu.couleur === true)

const teintes = new Set(ppu.couleurs)
b.verifier('l’écran porte bien plus de quatre teintes', teintes.size > 4,
  ` (${teintes.size} teintes distinctes)`)

/** La couleur d'un pixel, en composantes de 0 à 31. */
const composantes = (c) => ({ r: c & 31, v: c >> 5 & 31, b: c >> 10 & 31 })

/* Le ciel en haut, la brique au milieu, l'herbe en bas : trois zones que le
   programme a teintes différemment, et qui doivent l'être à l'écran. */
const pixel = (colonne, ligne) => composantes(ppu.couleurs[(ligne * 8 + 4) * 160 + colonne * 8 + 4])

const ciel = pixel(2, 2)
const herbe = pixel(2, 14)

b.verifier('le ciel penche vers le bleu', ciel.b > ciel.r,
  ` (r${ciel.r} v${ciel.v} b${ciel.b})`)
b.verifier('l’herbe penche vers le vert', herbe.v > herbe.r && herbe.v > herbe.b,
  ` (r${herbe.r} v${herbe.v} b${herbe.b})`)
b.verifier('les trois zones ne sont pas de la même couleur',
  new Set([pixel(2, 2), pixel(2, 10), pixel(2, 14)].map((c) => `${c.r},${c.v},${c.b}`)).size === 3)

/* La palette du fond a bien été versée, teinte par teinte : l'auto-incrément
   de l'index est le genre de chose qui marche « à peu près » et décale tout. */
const lues = []
for (let t = 0; t < 4; t++) {
  lues.push(ppu.bgPalettes[t * 2] | ppu.bgPalettes[t * 2 + 1] << 8)
}
b.verifier('les quatre teintes de la palette 0 sont distinctes',
  new Set(lues).size === 4, ` (${lues.map((c) => { const x = composantes(c); return `${x.r}/${x.v}/${x.b}` }).join('  ')})`)

b.verifier('elles vont du clair au sombre',
  lues.every((c, i) => i === 0 || composantes(c).v <= composantes(lues[i - 1]).v))

/* ------------------------------------ et la même cartouche en NOIR ET BLANC */

/*
 * L'émulateur suit l'octet $0143, et lui seul.
 *
 * On reprend les mêmes octets, on efface le drapeau, et l'on redémarre :
 * l'émulateur doit passer en quatre nuances et ne rien refuser. C'est ce que
 * fait une vraie Game Boy d'origine, qui ignore les registres de couleur.
 */
const dOrigine = Uint8Array.from(bati.rom)
dOrigine[0x0143] = 0x00
let sommeDmg = 0
for (let i = 0x0134; i <= 0x014c; i++) sommeDmg = (sommeDmg - dOrigine[i] - 1) & 0xff
dOrigine[0x014d] = sommeDmg

const vieille = new GameBoy()
vieille.loadRom(dOrigine)
for (let i = 0; i < 30; i++) vieille.runFrame()

b.verifier('sans le drapeau, l’émulateur reste en nuances', vieille.ppu.couleur === false)
b.verifier('la même cartouche tourne quand même',
  new Set(vieille.framebuffer).size > 1,
  ` (${new Set(vieille.framebuffer).size} nuances à l’écran)`)
b.verifier('et elle n’affiche que les quatre nuances d’origine',
  new Set(vieille.ppu.couleurs).size <= 4,
  ` (${new Set(vieille.ppu.couleurs).size} teintes)`)

/* Les attributs sont écrits dans la SECONDE banque, et les tuiles dans la
   première. Les confondre remplirait l'écran de n'importe quoi. */
b.verifier('les tuiles sont restées dans la banque 0',
  jeu.gb.ppu.vram[0x1800 + 10 * 32] !== 0,
  ` (tuile ${jeu.gb.ppu.vram[0x1800 + 10 * 32]} en haut du mur)`)
b.verifier('les attributs sont dans la banque 1',
  jeu.gb.ppu.vram[8192 + 0x1800 + 10 * 32] === 1,
  ` (palette ${jeu.gb.ppu.vram[8192 + 0x1800 + 10 * 32]} pour la brique)`)
b.egal('la banque est bien remise à zéro après « teindre »', jeu.gb.ppu.vbk, 0)

/* ------------------------------ le plafond du matériel, atteint ------------ */

/*
 * Deux nombres qu'on confond tout le temps.
 *
 *   32 768   les couleurs entre lesquelles CHOISIR — cinq bits par composante
 *       56   celles qu'on affiche EN MÊME TEMPS
 *
 * Le second se décompose ainsi : 8 palettes de fond × 4 teintes = 32, plus
 * 8 palettes de lutins × 4 dont la première est TRANSPARENTE = 24. Ce
 * contrôle vérifie que le plafond est vraiment atteignable — une seule
 * palette mal écrite, et l'on plafonne à trente sans savoir pourquoi.
 */
const toutes = demarrer('exemples/palettes.cpp', 30)
const pp = toutes.gb.ppu

const teintesFond = new Set()
for (let i = 0; i < 32; i++) teintesFond.add(pp.bgPalettes[i * 2] | pp.bgPalettes[i * 2 + 1] << 8)
const teintesLutins = new Set()
for (let i = 0; i < 32; i++) {
  if (i % 4 !== 0) teintesLutins.add(pp.objPalettes[i * 2] | pp.objPalettes[i * 2 + 1] << 8)
}

b.egal('les 32 teintes de fond sont toutes différentes', teintesFond.size, 32)
b.egal('les 24 teintes de lutins aussi', teintesLutins.size, 24)
b.egal('et 56 arrivent À L’ÉCRAN, le plafond du matériel',
  new Set(pp.couleurs).size, 56)

/* Chaque lutin a bien SA palette : sans « teindreLutin », les huit prenaient
   la palette 0 et l'on n'en voyait que trois teintes au lieu de vingt-quatre. */
const palettesVues = new Set()
for (let n = 0; n < 8; n++) palettesVues.add(pp.oam[n * 4 + 3] & 7)
b.egal('les huit lutins portent huit palettes différentes', palettesVues.size, 8)

/* ------------------------------- la règle des deux consoles, sans exception */

/*
 * Game Boy OU Game Boy Color — compilateur/consoles.js.
 *
 * Il y a eu trois sortes de cartouches ($00, $80, $C0) et une option « les
 * deux » qui fabriquait deux fichiers : on ne savait plus ce qu'on avait. Ces
 * contrôles tiennent la règle : deux consoles, deux octets, deux extensions.
 */
const SANS = analyser(readFileSync('exemples/minimal.cpp', 'utf8'))
const AVEC = analyser(readFileSync('exemples/couleur.cpp', 'utf8'))

const seule = fabriquerLaCartouche(SANS, 'MINIMAL')
b.verifier('sans couleur et sans choix : une cartouche Game Boy',
  seule.pour === 'gb' && seule.rom[0x0143] === 0x00 && seule.extension === '.gb',
  ` (${seule.pour}, $${seule.rom[0x0143].toString(16)}, ${seule.extension})`)

const vive = fabriquerLaCartouche(AVEC, 'COULEUR')
b.verifier('avec couleurs et sans choix : une cartouche Game Boy Color',
  vive.pour === 'gbc' && vive.rom[0x0143] === 0xc0 && vive.extension === '.gbc',
  ` (${vive.pour}, $${vive.rom[0x0143].toString(16)}, ${vive.extension})`)

const choisie = fabriquerLaCartouche(SANS, 'MINIMAL', 'gbc')
b.verifier('« gbc » choisi sans une couleur : Game Boy Color quand même',
  choisie.pour === 'gbc' && choisie.rom[0x0143] === 0xc0)

const refus = (faire) => { try { faire(); return '' } catch (e) { return e.message } }
const refusGb = refus(() => fabriquerLaCartouche(AVEC, 'COULEUR', 'gb'))
b.verifier('« gb » choisi avec une couleur : REFUSÉ, avec la ligne',
  /ligne \d+ : « couleurFond\(\) » demande une Game Boy Color/.test(refusGb), ` (${refusGb.slice(0, 90)})`)

b.verifier('« les-deux » n’existe plus : refusé par le compilateur',
  /jamais les deux/.test(refus(() => compiler(AVEC, { cible: 'les-deux' }))))
b.verifier('ni par la fabrique de cartouche',
  /jamais les deux/.test(refus(() => fabriquerLaCartouche(AVEC, 'COULEUR', 'les-deux'))))

const octets = new Set([seule, vive, choisie].map((c) => c.rom[0x0143]))
b.verifier('deux octets possibles en $0143, et seulement deux',
  [...octets].every((o) => o === CONSOLES.gb.octet || o === CONSOLES.gbc.octet))

/* La lecture d'une cartouche venue d'ailleurs : le bit 7, comme la console. */
b.egal('une cartouche du commerce à $80 se lit « gbc »', consoleDeLaCartouche(Uint8Array.of(...new Array(0x143).fill(0), 0x80)), 'gbc')
b.egal('à $C0 aussi', consoleDeLaCartouche(Uint8Array.of(...new Array(0x143).fill(0), 0xc0)), 'gbc')
b.egal('à $00, « gb »', consoleDeLaCartouche(Uint8Array.of(...new Array(0x143).fill(0), 0x00)), 'gb')

b.fin()

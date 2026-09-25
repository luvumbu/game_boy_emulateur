/**
 * Un programme remonté d'une cartouche montre-t-il le MÊME écran ?
 *
 *   node verifier-retour.mjs
 *
 * `retour-cpp.js` prétend reconnaître les formes de ce compilateur et en
 * réécrire le C++. Une prétention pareille ne se contrôle pas en relisant le
 * texte produit : il faut le RECOMPILER, faire tourner les deux cartouches, et
 * comparer ce qu'elles affichent. Un programme remonté qui se lit bien et
 * n'affiche pas la même chose serait le pire des résultats — il aurait l'air
 * juste.
 *
 * Le contrôle fait donc, pour chaque exemple :
 *
 *   1. compiler le programme d'origine ;
 *   2. le REMONTER depuis ses octets ;
 *   3. recompiler ce qui est remonté ;
 *   4. faire tourner les DEUX consoles, et comparer la carte du fond image
 *      par image.
 *
 * Et il mesure, pour tous les exemples du dépôt, la part d'instructions
 * reconnues. Ce nombre-là ne doit jamais baisser : c'est la seule façon de voir
 * qu'un changement de l'émetteur a cassé une reconnaissance, en silence.
 */

import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { batir, demarrer, bulletin, CARTE_FOND } from '../outils/controle.mjs'
import { carteDeLEcran, textesDeLEcran, palettesDeLaMemoire, fichierDeLaCartouche } from '../convertir.js'
import { GameBoy } from '../emulateur.js'
import { retourAuCpp } from '../retour-cpp.js'
import { lireDessins } from '../editeur-tuiles.js'

const b = bulletin('le retour au C++')
const dossier = mkdtempSync(join(tmpdir(), 'gameboy3-retour-'))

/** Compile un exemple, le remonte, et rend le texte du programme remonté. */
function remonter(chemin) {
  const rendu = batir(chemin)
  const finDuCode = rendu.etiquettes.get('Tuiles') ?? rendu.octets.length
  const dessins = lireDessins(readFileSync(chemin, 'utf8'))
  return {
    rendu,
    ...retourAuCpp({ octets: rendu.octets, base: rendu.base, finDuCode, rendu, dessins }),
  }
}

/** Les 32 × 32 cases de la carte du fond, telles que la console les porte. */
const carteDe = (gb) =>
  Array.from({ length: 32 * 32 }, (_, i) => gb.mmu.read(CARTE_FOND + i))

/** Fait tourner une cartouche et rend l'état de l'écran, image par image. */
function jouer(rom, images) {
  const gb = new GameBoy()
  gb.loadRom(rom)
  const vues = []
  for (let i = 0; i < images; i++) {
    gb.runFrame()
    if (i % 20 === 19) vues.push(carteDe(gb).join(','))
  }
  return vues
}

/* ------------------------------------------------ le tour complet */

/*
 * Les programmes qui reviennent ENTIERS.
 *
 * Ce ne sont pas les plus simples par hasard : ils n'emploient que des formes
 * reconnues. Dès qu'un programme touche à la couleur, au son ou aux lutins, il
 * reste des instructions en commentaire — et un programme à trous ne recompile
 * pas. Le dire ainsi vaut mieux que de prétendre à un taux moyen.
 */
const ENTIERS = ['bonjour', 'minimal', 'ligne', 'une-tuile']

for (const nom of ENTIERS) {
  const chemin = `exemples/${nom}.cpp`
  const remonte = remonter(chemin)

  b.egal(`${nom} : tout est reconnu`, remonte.part, 100)

  const ailleurs = join(dossier, `${nom}-remonte.cpp`)
  writeFileSync(ailleurs, remonte.texte)

  let refait = null
  try {
    refait = batir(ailleurs, nom.toUpperCase())
  } catch (erreur) {
    b.verifier(`${nom} : le programme remonté recompile`, false, ` — ${erreur.message}`)
    continue
  }
  b.verifier(`${nom} : le programme remonté recompile`, true,
    ` (${refait.octets.length} octets contre ${remonte.rendu.octets.length})`)

  /*
   * Le même écran, et non les mêmes octets.
   *
   * Les deux cartouches n'ont aucune raison d'être identiques : le programme
   * remonté écrit un `while` là où l'autre avait un `for`, et le compilateur
   * n'émet pas exactement la même chose. Ce qui doit être identique, c'est ce
   * que le joueur voit.
   */
  const avant = jouer(remonte.rendu.rom, 100)
  const apres = jouer(refait.rom, 100)
  const ecarts = avant.filter((vue, i) => vue !== apres[i]).length
  b.verifier(`${nom} : les deux consoles montrent le MÊME écran`, ecarts === 0,
    ecarts === 0 ? ` (${avant.length} images comparées)` : ` — ${ecarts} images sur ${avant.length} diffèrent`)
}

/* ------------------------------------------------ ce qui est reconnu, partout */

/*
 * Le plancher de reconnaissance, exemple par exemple.
 *
 * Ces nombres sont MESURÉS, jamais souhaités : ils disent où l'on en est. Ils
 * sont là pour qu'une reconnaissance qui casse le dise — un émetteur qui change
 * une forme fait tomber son exemple, et rien d'autre ne le signalerait.
 */
const PLANCHERS = {
  bonjour: 100, minimal: 100, ligne: 100, 'une-tuile': 100,
  nuances: 90, ecrans: 85, compteur: 80, damier: 78, lutin: 75, surplace: 72,
  menu: 70, 'sans-dessin': 58, chute: 55, puits: 48, tetris: 46, mario: 44,
  langage: 40, marche: 38, musique: 36, console: 25, methodes: 22,
  palettes: 15, couleur: 13,
}

console.log()
let bas = 0
for (const [nom, plancher] of Object.entries(PLANCHERS)) {
  let part = null
  try {
    part = remonter(`exemples/${nom}.cpp`).part
  } catch (erreur) {
    b.verifier(`${nom} : se remonte sans casser`, false, ` — ${erreur.message.slice(0, 70)}`)
    continue
  }
  if (part < plancher) {
    bas++
    b.verifier(`${nom} : au moins ${plancher} % reconnus`, false, ` — tombé à ${part} %`)
  }
}

b.verifier('aucun exemple n’a perdu de reconnaissance', bas === 0,
  bas === 0 ? ` (${Object.keys(PLANCHERS).length} exemples mesurés)` : '')

/*
 * Et l'honnêteté du rendu : ce qui n'est pas reconnu doit être ÉCRIT.
 *
 * C'est la promesse du module, et c'est celle qui compte : un programme remonté
 * à moitié qui aurait l'air complet vaudrait moins que pas de programme du tout.
 */
const partiel = remonter('exemples/couleur.cpp')
const commentaires = (partiel.texte.match(/^\s*\/\/ \$[0-9a-f]{4}/gm) ?? []).length
b.verifier('ce qui n’est pas reconnu est écrit en commentaire, avec son adresse',
  commentaires > 100, ` (${commentaires} instructions laissées en clair)`)
b.verifier('et l’en-tête annonce la part reconnue, sans arrondir en sa faveur',
  partiel.texte.includes(`${partiel.reconnues} instructions sur ${partiel.total}`))

/* ------------------------- ce qui se tire d'une cartouche quelconque ------ */

/*
 * L'autre moitié du travail, et la seule qui marche sur un jeu du commerce.
 *
 * Quatre choses ont un format fixe et une adresse connue : les dessins, la
 * carte du fond, les palettes, et — pour une cartouche compilée ici — les mots
 * que la police permet de relire. On ne contrôle pas que le fichier produit
 * « a l'air bien » : on le RECOMPILE, on le fait tourner, et l'on compare le
 * décor case par case à celui d'où il vient.
 */
console.log()

const jeu = demarrer('exemples/bonjour.cpp', 40)

const mots = textesDeLEcran(jeu.gb).map((t) => `${t.colonne},${t.ligne}:${t.texte}`)
b.verifier('les mots à l’écran se relisent à travers la police',
  mots.join(' | ') === '6,4:BONJOUR | 3,8:APPUIE SUR A', ` (${mots.join(' | ')})`)

b.verifier('la carte du fond rend les 20 × 18 cases visibles',
  carteDeLEcran(jeu.gb).length === 20 * 18)

b.verifier('et pas une case de plus : le hors-champ du défilement reste dehors',
  carteDeLEcran(jeu.gb).every(({ colonne, ligne }) => colonne < 20 && ligne < 18))

b.verifier('une console d’origine n’a aucune palette à rendre',
  palettesDeLaMemoire(jeu.gb) === null)

/* Le décor tiré, recompilé, doit REDONNER le même décor. */
const tire = fichierDeLaCartouche(jeu.gb, { titre: 'exemples/bonjour.gb' })
const ouTire = join(dossier, 'tire-bonjour.cpp')
writeFileSync(ouTire, tire)

let refaitTire = null
try {
  refaitTire = batir(ouTire, 'TIRE')
} catch (erreur) {
  b.verifier('le fichier tiré de la cartouche recompile', false, ` — ${erreur.message}`)
}

if (refaitTire) {
  b.verifier('le fichier tiré de la cartouche recompile', true, ` (${refaitTire.octets.length} octets)`)

  const gb = new GameBoy()
  gb.loadRom(refaitTire.rom)
  for (let i = 0; i < 40; i++) gb.runFrame()

  /*
   * On compare l'IMAGE, et non les numéros de tuile.
   *
   * Les numéros n'ont aucune raison de revenir : les dessins tirés sont
   * redéclarés à la suite, et le premier prend le 44 quel qu'ait été son
   * numéro d'origine. Ce qui doit revenir, c'est ce que l'écran montre — et
   * c'est d'ailleurs la seule chose qu'on ait promise.
   */
  const memes = [...jeu.gb.framebuffer].filter((p, i) => p === gb.framebuffer[i]).length
  b.egal('et la console redonne la MÊME image, pixel par pixel', memes, 160 * 144)
}

/*
 * Sur une cartouche en couleur, les palettes reviennent aussi — et elles
 * reviennent JUSTES : c'est la seule façon de savoir qu'on a lu les quinze bits
 * dans le bon sens, le vert étant à cheval sur deux octets.
 */
const enCouleur = demarrer('exemples/couleur.cpp', 60)
const palettes = palettesDeLaMemoire(enCouleur.gb)
b.verifier('une cartouche en couleur rend ses huit palettes', palettes?.length === 8)
b.verifier('chaque teinte tient dans les cinq bits du matériel',
  Boolean(palettes) && palettes.every((p) => p.every(({ rouge, vert, bleu }) =>
    [rouge, vert, bleu].every((c) => c >= 0 && c <= 31))))
b.verifier('et la première palette n’est pas le dégradé vide',
  Boolean(palettes) && new Set(palettes[0].map((t) => `${t.rouge},${t.vert},${t.bleu}`)).size === 4,
  ` (${palettes ? palettes[0].map((t) => `${t.rouge}/${t.vert}/${t.bleu}`).join(' ') : ''})`)

b.fin()

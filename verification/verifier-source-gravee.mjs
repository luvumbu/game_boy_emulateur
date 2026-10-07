/**
 * Le programme C++ gravé dans la cartouche revient-il TEL QUEL ?
 *
 *   node verification/verifier-source-gravee.mjs
 *
 * Trois promesses, trois séries de contrôles :
 *
 *   1. ce qui est relu est le programme écrit, à la lettre près — tous ses
 *      fichiers, commentaires compris ;
 *   2. le jeu n'a pas changé : la même cartouche, sans le programme gravé,
 *      montre le même écran après les mêmes images ;
 *   3. une cartouche qui n'en porte pas — d'ailleurs, ou trop pleine — ne
 *      rend RIEN, plutôt qu'un programme à moitié.
 */

import { readFileSync } from 'node:fs'
import { basename, dirname, join } from 'node:path'

import { analyser } from '../compilateur/analyseur.js'
import { rassembler } from '../compilateur/inclusion.js'
import { fabriquerLaCartouche } from '../compilateur/cartouches.js'
import { compresser, decompresser, graverLeSource, lireLeSource } from '../compilateur/source-gravee.js'
import { bulletin } from '../outils/controle.mjs'
import { GameBoy } from '../emulateur.js'

const b = bulletin('le programme C++ gravé dans la cartouche')

/** Compile comme gb3.mjs : chaque fichier lu est retenu, puis gravé. */
function construire(chemin, graver = true) {
  const lus = new Map()
  const lire = (nom) => {
    const texte = readFileSync(nom === basename(chemin) ? chemin : join(dirname(chemin), nom), 'utf8')
    lus.set(nom, texte)
    return texte
  }
  const arbre = analyser(rassembler(lire, basename(chemin)).texte)
  const source = graver ? { principal: basename(chemin), fichiers: [...lus] } : null
  return { cartouche: fabriquerLaCartouche(arbre, 'ESSAI', null, source), lus }
}

const ecranApres = (rom, images = 60) => {
  const gb = new GameBoy()
  gb.loadRom(rom)
  for (let i = 0; i < images; i++) gb.runFrame()
  return gb.framebuffer
}

/* ------------------------------------------------ 1. relu à la lettre près */

const PROGRAMMES = [
  'exemples/minimal.cpp',
  'exemples/mario.cpp',
  'exemples/couleur.cpp',
  'exemples/invaders.cpp',
  'projets/space_invaders/principal.cpp',
]

for (const chemin of PROGRAMMES) {
  const { cartouche, lus } = construire(chemin)
  const g = cartouche.rom.sourceGravee
  if (!b.verifier(`${chemin} : gravé`, g?.grave === true, g?.grave ? ` (${g.octets} octets)` : ` — ${g?.raison}`)) continue

  const relu = lireLeSource(cartouche.rom)
  b.verifier(`${chemin} : relu`, relu !== null)
  if (!relu) continue
  b.egal(`${chemin} : le principal garde son nom`, relu.principal, basename(chemin))
  b.egal(`${chemin} : autant de fichiers`, relu.fichiers.length, lus.size)
  b.verifier(`${chemin} : chaque fichier, à la lettre près`,
    relu.fichiers.every(([nom, texte]) => lus.get(nom) === texte))

  /* 2. le jeu tourne pareil */
  const sans = construire(chemin, false).cartouche.rom
  const a = ecranApres(cartouche.rom)
  const s = ecranApres(sans)
  b.verifier(`${chemin} : même écran avec et sans le programme gravé`, a.every((p, i) => p === s[i]))
}

/* Un projet en plusieurs fichiers : l'#include revient avec son fichier. */
{
  const lus = new Map([
    ['principal.cpp', '#include <texte>\n#include "dessins.cpp"\n// mon jeu\nvoid main() { texte(1, 1, "SALUT"); }\n'],
    ['dessins.cpp', '// les dessins, à part\n'],
  ])
  const arbre = analyser(rassembler((nom) => lus.get(nom), 'principal.cpp').texte)
  const c = fabriquerLaCartouche(arbre, 'DEUX', null, { principal: 'principal.cpp', fichiers: [...lus] })
  const relu = lireLeSource(c.rom)
  b.verifier('deux fichiers : les deux reviennent, intacts',
    relu?.fichiers.length === 2 && relu.fichiers.every(([nom, texte]) => lus.get(nom) === texte))
}

/* ------------------------------------------------ 3. rien plutôt qu'à moitié */

{
  const { cartouche } = construire('exemples/minimal.cpp', false)
  b.egal('sans programme gravé : rien n\'est relu', lireLeSource(cartouche.rom), null)

  const abime = construire('exemples/minimal.cpp').cartouche.rom.slice()
  abime[0x7fe0] ^= 0xff
  b.egal('un octet gravé abîmé : rien n\'est relu', lireLeSource(abime), null)

  const pleine = new Uint8Array(0x8000)
  /* Des lettres tirées au hasard (un hasard fixe) : rien ne s'y répète, la
     compression n'y peut rien — 60 000 lettres ne tiennent pas dans 32 Ko. */
  let graine = 12345
  const auHasard = () => (graine = (graine * 1103515245 + 12345) & 0x7fffffff) >> 16
  const enorme = { principal: 'p.cpp', fichiers: [['p.cpp', Array.from({ length: 60000 }, () => String.fromCharCode(33 + (auHasard() % 90))).join('')]] }
  const r = graverLeSource(pleine, 0x0150, enorme)
  b.verifier('trop gros : refusé, et la raison est dite', !r.grave && /octets libres/.test(r.raison))
  b.egal('trop gros : la cartouche reste vierge', pleine.some((o) => o !== 0), false)
}

/* ------------------------------------------------ la compression elle-même */

{
  const textes = ['', 'a', 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', 'é — ✓ 🎮 accents et signes', readFileSync('exemples/mario.cpp', 'utf8')]
  const ok = textes.every((t) => {
    const o = new TextEncoder().encode(t)
    const d = decompresser(compresser(o))
    return d.length === o.length && d.every((x, i) => x === o[i])
  })
  b.verifier('compresser puis décompresser rend chaque texte à l\'octet près', ok)
}

b.fin()

/**
 * Le portage depuis gameboy2 change-t-il quoi que ce soit à l'écran ?
 *
 *   node verifier-portage.mjs
 *
 * `porter.mjs` traduit un programme JavaScript en C++, et les deux
 * compilateurs n'émettent pas les mêmes octets — le second alloue autrement,
 * appelle autrement, et produit un code plus long. Rien de tout cela ne doit
 * se voir : à touches égales, les deux cartouches doivent afficher **la même
 * image**, à l'image près.
 *
 * C'est le contrôle le plus dur du projet, et le plus utile : il compare deux
 * consoles pixel par pixel, sur plusieurs centaines d'images, avec la même
 * suite de touches. Une seule différence de calcul finit par se voir.
 *
 * Tetris en est absent : il tire au sort, et le tirage lit le compteur libre
 * du matériel — deux programmes de longueurs différentes ne le lisent pas au
 * même instant. Il est éprouvé pour lui-même dans `verifier-jeux.mjs`.
 */

import { readFileSync } from 'node:fs'
import { GameBoy } from '../emulateur.js'
import { batir, bulletin } from '../outils/controle.mjs'

const b = bulletin('le portage depuis gameboy2')

/*
 * La même suite de touches pour les deux consoles.
 *
 * Les appuis sont LONGS, et l'on ne compare que les images où plus rien n'est
 * enfoncé. Ce n'est pas de la complaisance : un programme plus long n'échantillonne
 * pas la manette au même endroit du tour de boucle, et une logique « au front »
 * peut voir l'appui une image plus tôt ou plus tard. Ce décalage-là n'est pas une
 * différence de calcul — il disparaît dès que la touche est relâchée depuis un
 * moment. Ce qui doit être identique, c'est ce qui reste à l'écran ensuite.
 */
const TOUCHES = [
  [10, 'start', true], [40, 'start', false],
  [80, 'right', true], [140, 'right', false],
  [180, 'a', true], [210, 'a', false],
  [250, 'down', true], [280, 'down', false],
  [320, 'left', true], [380, 'left', false],
  [420, 'start', true], [450, 'start', false],
]

/** Les images où l'on compare : tout est relâché depuis vingt images au moins. */
const estCalme = (image) => TOUCHES.every(([quand, , enfoncee]) => !enfoncee || image < quand || image > quand + 50) &&
  image > 60

const CARTE_FOND = 0x9800

function comparer(nom, images) {
  const ancienne = new GameBoy()
  ancienne.loadRom(new Uint8Array(readFileSync(`../gameboy2/exemples/${nom}.gb`)))

  const neuve = new GameBoy()
  neuve.loadRom(batir(`exemples/${nom}.cpp`, nom).rom)

  for (let image = 0; image < images; image++) {
    for (const [quand, touche, enfoncee] of TOUCHES) {
      if (quand === image) {
        ancienne.setButton(touche, enfoncee)
        neuve.setButton(touche, enfoncee)
      }
    }

    ancienne.runFrame()
    neuve.runFrame()

    if (!estCalme(image)) continue

    /* La carte de fond : ce que le programme a écrit, et non ce que le
       matériel en a fait. Une différence ici est une différence de calcul. */
    for (let i = 0; i < 32 * 32; i++) {
      const a = ancienne.mmu.read(CARTE_FOND + i)
      const n = neuve.mmu.read(CARTE_FOND + i)
      if (a !== n) {
        return b.verifier(
          `${nom} : les deux cartouches affichent la même chose`,
          false,
          ` — image ${image}, case ${i % 32},${(i / 32) | 0} : ${a} contre ${n}`,
        )
      }
    }

    /* Et l'image elle-même, lutins compris. */
    const gauche = ancienne.framebuffer
    const droite = neuve.framebuffer
    for (let i = 0; i < gauche.length; i++) {
      if (gauche[i] !== droite[i]) {
        return b.verifier(
          `${nom} : les deux consoles montrent les mêmes pixels`,
          false,
          ` — image ${image}, pixel ${i % 160},${(i / 160) | 0}`,
        )
      }
    }
  }

  return b.verifier(`${nom} : ${images} images identiques, à la touche près`, true)
}

comparer('ecrans', 500)
comparer('menu', 500)
comparer('mario', 500)

b.fin()

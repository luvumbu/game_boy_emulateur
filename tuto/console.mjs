/**
 * La console d'une leçon : compilée, chargée, prête à être interrogée.
 *
 * Le contrôle des leçons avait ce banc d'essai chez lui ; le livret en a besoin
 * du même — il fait tourner chaque leçon pour la photographier, et il joue ses
 * contrôles pour montrer ce que la console répond. Deux copies auraient fini
 * par ne plus mesurer la même chose, et c'est le genre de divergence qu'on ne
 * remarque pas : les deux passent au vert, chacune sur sa propre idée.
 *
 * Rien ici ne connaît le tutoriel : on donne un programme, on reçoit une
 * console et de quoi la lire.
 */

import { GameBoy } from '../emulateur.js'
import { analyser } from '../compilateur/analyseur.js'
import { compiler } from '../compilateur/emetteur.js'
import { fabriquer } from '../compilateur/cartouche.js'
import { ORDRE } from '../compilateur/police.js'
import { assemblerAvec, traduire } from '../compilateur/inclusion.js'

const CARTE = 0x9800
const OAM = 0xfe00

/** Le temps qu'il faut à la mise en route et au premier dessin. */
export const IMAGES_DE_DEPART = 20

/**
 * Compile un programme, le charge, et rend de quoi l'interroger.
 *
 * `laisserDemarrer` à faux rend la console AVANT la première image : c'est ce
 * qu'il faut pour photographier un programme depuis son tout premier instant.
 * `fichiers` : les fichiers voisins qu'il inclut, { "variables.h": "…" }.
 */
export function consoleDuProgramme(code, titre, laisserDemarrer = true, fichiers = {}) {
  const assemble = assemblerAvec(code, fichiers)
  let rendu
  try {
    rendu = compiler(analyser(assemble.texte))
  } catch (erreur) {
    erreur.message = traduire(erreur.message, assemble.origine)
    throw erreur
  }
  const { octets, variables, vecteurVBlank, couleur } = rendu

  const gb = new GameBoy()
  gb.loadRom(fabriquer(octets, 0x0150, titre.slice(0, 15), vecteurVBlank, couleur))

  const avancer = (n) => { for (let i = 0; i < n; i++) gb.runFrame() }

  const laConsole = {
    lire: (colonne, ligne) => gb.mmu.read(CARTE + ligne * 32 + colonne),
    mot: (colonne, ligne, combien) =>
      Array.from({ length: combien }, (_, i) => ORDRE[gb.mmu.read(CARTE + ligne * 32 + colonne + i)] ?? '?').join(''),

    /*
     * Une variable, par son nom.
     *
     * Les portées existent : le compilateur nomme « main.compte » ce que la
     * leçon appelle « compte ». On cherche donc le nom nu — une globale —,
     * puis celui de la variable locale de main(). Sans ce second essai, toute
     * leçon qui déclare ses variables dans main() ne serait plus contrôlable,
     * et c'est ce que le C++ demande d'écrire.
     */
    variable: (nom) => {
      const adresse = variables.get(nom) ?? variables.get(`main.${nom}`)
      if (adresse === undefined) {
        throw new Error(`le programme ne déclare pas « ${nom} » (il a : ${[...variables.keys()].join(', ')})`)
      }
      return gb.mmu.read(adresse)
    },

    lutin: (n) => ({
      y: gb.mmu.read(OAM + n * 4) - 16,
      x: gb.mmu.read(OAM + n * 4 + 1) - 8,
      tuile: gb.mmu.read(OAM + n * 4 + 2),
    }),
    /*
     * Une voix de la puce sonore : 1, 2, ou 4 pour le bruit.
     *
     * Les registres de fréquence NE SE RELISENT PAS sur cette console —
     * « lire $FF13 » rend 255 quoi qu'il arrive. Une leçon qui les
     * interrogerait mesurerait le matériel, et non ce qu'elle joue. On
     * interroge donc la voix de l'émulateur, qui les tient — c'est ce que
     * fait déjà `verifier-console.mjs`, et pour la même raison.
     */
    voix: (n) => {
      const v = n === 4 ? gb.apu.bruit : (n === 2 ? gb.apu.canal2 : gb.apu.canal1)
      return {
        joue: Boolean(v.joue ?? v.actif),
        volume: v.volume,
        /* La gamme tempérée, LA4 à 440 Hz — la même formule que la console.
           La voix du bruit a bien une période, mais elle règle le GRAIN et non
           une hauteur : en tirer des hertz donnerait un nombre qui ne veut
           rien dire. On rend « null », ce qui est la vérité. */
        hertz: n === 4 || v.periode === undefined ? null : Math.round(131072 / (2048 - v.periode)),
      }
    },

    ecranAllume: () => (gb.mmu.read(0xff40) & 0x80) !== 0,
    defilement: () => gb.mmu.read(0xff43),
    nuances: () => new Set(gb.framebuffer).size,

    /* Quelques leçons ont besoin de piloter la manette image par image. */
    gb,
    avancer,
    presser: (bouton, images = 6) => {
      gb.setButton(bouton, true)
      avancer(images)
      gb.setButton(bouton, false)
      avancer(3) // relâché : sans quoi un front ne se produirait plus jamais
    },
  }

  if (laisserDemarrer) avancer(IMAGES_DE_DEPART)

  return { laConsole, gb, octets, variables }
}

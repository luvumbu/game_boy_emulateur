/**
 * Le banc d'essai : compiler un fichier C++, puis le faire tourner.
 *
 * Compiler sans erreur ne prouve rien — une cartouche peut s'assembler
 * parfaitement et rester noire. Tous les contrôles du projet passent par ici :
 * ils compilent un `.cpp`, chargent la ROM produite dans l'émulateur **du
 * projet** — celui-là même que la page fait tourner —, et relisent la mémoire
 * de la console pour y retrouver ce que le programme devait y écrire.
 *
 * Aucune dépendance : `node verifier-langage.mjs` suffit.
 */

import { readFileSync } from 'node:fs'
import { basename, dirname, join } from 'node:path'
import { analyser } from '../compilateur/analyseur.js'
import { rassembler, traduire } from '../compilateur/inclusion.js'
import { compiler } from '../compilateur/emetteur.js'
import { fabriquer } from '../compilateur/cartouche.js'
import { GameBoy } from '../emulateur.js'

export const CARTE_FOND = 0x9800

/** Compile un fichier, et rend la cartouche ET ce que le compilateur en sait. */
export function batir(chemin, titre = basename(chemin)) {
  const dossier = dirname(chemin)
  const lire = (nom) => readFileSync(nom === basename(chemin) ? chemin : join(dossier, nom), 'utf8')

  const assemble = rassembler(lire, basename(chemin))
  try {
    const arbre = analyser(assemble.texte)
    const rendu = compiler(arbre)
    return { ...rendu, rom: fabriquer(rendu.octets, rendu.base, titre, rendu.vecteurVBlank, rendu.couleur) }
  } catch (erreur) {
    erreur.message = traduire(erreur.message, assemble.origine)
    throw erreur
  }
}

/** Compile, démarre la console, et laisse passer quelques images. */
export function demarrer(chemin, images = 12) {
  const bati = batir(chemin)
  const gb = new GameBoy()
  gb.loadRom(bati.rom)
  for (let i = 0; i < images; i++) gb.runFrame()

  /** L'adresse d'une variable, par son nom — « main.i » pour une locale. */
  const adresseDe = (nom) => {
    const adresse = bati.variables.get(nom)
    if (adresse === undefined) {
      throw new Error(`« ${nom} » n'est pas une variable du programme (${[...bati.variables.keys()].join(', ')})`)
    }
    return adresse
  }

  return {
    gb,
    ...bati,
    adresseDe,
    /** La valeur d'une variable du programme, relue dans la console. */
    valeurDe: (nom) => gb.mmu.read(adresseDe(nom)),
    /** Une case d'un tableau du programme. */
    caseDe: (nom, index) => gb.mmu.read(adresseDe(nom) + index),
    /** Ce que la carte de fond affiche à cet endroit. */
    ecran: (colonne, ligne, longueur) =>
      Array.from({ length: longueur }, (_, i) => gb.mmu.read(CARTE_FOND + ligne * 32 + colonne + i)),
    avancer: (images_) => { for (let i = 0; i < images_; i++) gb.runFrame() },
  }
}

/* ------------------------------------------------------------ le compteur */

export function bulletin(titre) {
  let echecs = 0
  console.log(titre)

  return {
    verifier(quoi, bon, detail = '') {
      console.log(`  ${bon ? '✓' : '✗'} ${quoi}${detail}`)
      if (!bon) echecs++
      return bon
    },
    egal(quoi, obtenu, attendu) {
      return this.verifier(quoi, obtenu === attendu, obtenu === attendu ? '' : ` — attendu ${attendu}, obtenu ${obtenu}`)
    },
    /** Le programme doit être REFUSÉ, et le message doit dire pourquoi. */
    refuse(quoi, action, motif) {
      let message = null
      try { action() } catch (erreur) { message = erreur.message }
      if (message === null) return this.verifier(quoi, false, ' — accepté alors qu\'il fallait refuser')
      return this.verifier(quoi, message.includes(motif), message.includes(motif) ? '' : ` — message : « ${message} »`)
    },
    fin() {
      console.log(echecs ? `\n${echecs} contrôle(s) en échec` : '\ntout est vert')
      process.exit(echecs ? 1 : 0)
    },
  }
}

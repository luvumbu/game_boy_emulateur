/**
 * Les airs jouent-ils vraiment ce qui est écrit ?
 *
 *   node verifier-airs.mjs
 *
 * Une mélodie qui compile ne prouve rien : le séquenceur peut avancer d'un pas
 * de trop, rejouer une note tenue — ce qui s'entend comme un bégaiement —, ou
 * ne jamais reboucler. Rien de tout cela ne se voit à l'écran.
 *
 * On fait donc tourner la cartouche, et l'on regarde la VOIX de l'émulateur à
 * chaque image : sa fréquence dit quelle note est en train de sonner, image
 * par image. Les hauteurs attendues sont calculées ici, en gamme tempérée,
 * indépendamment de la table gravée dans la cartouche — sinon on comparerait
 * la table à elle-même.
 *
 * L'atelier de la page est éprouvé aussi, mais sans navigateur : lire un air,
 * y poser une note, le réécrire, et retrouver le même texte.
 */

import { batir, bulletin } from '../outils/controle.mjs'
import { GameBoy } from '../emulateur.js'
import { analyser } from '../compilateur/analyseur.js'
import { compiler } from '../compilateur/emetteur.js'
import { fabriquer } from '../compilateur/cartouche.js'
import { lireAirs, remplacerAir, ajouterAir, lirePas, ecrirePas, HAUTEURS } from '../editeur-airs.js'

const b = bulletin('les airs : le séquenceur, et l’atelier qui les écrit')

/* --------------------------------------------------- ce qui doit s'entendre */

/** La hauteur d'une voix, telle que l'émulateur la tient, en hertz. */
const hertz = (voix) => Math.round(131072 / (2048 - voix.periode))

/** La hauteur attendue d'un nom de note, calculée à part. DO2 est le MIDI 36. */
function attendu(nom) {
  const numero = HAUTEURS.indexOf(nom)
  return Math.round(440 * Math.pow(2, (36 + numero - 69) / 12))
}

/**
 * Fait tourner un programme et rend, image par image, ce qui sonne sur une
 * voix : sa hauteur en hertz, ou 0 quand elle se tait.
 */
function ecouter(chemin, images, quelle = 1) {
  const bati = batir(chemin)
  const gb = new GameBoy()
  gb.loadRom(bati.rom)

  const suite = []
  for (let i = 0; i < images; i++) {
    gb.runFrame()
    const voix = quelle === 1 ? gb.apu.canal1 : gb.apu.canal2
    suite.push(voix.joue ? hertz(voix) : 0)
  }
  return { suite, gb, bati }
}

/** Les hauteurs entendues, dans l'ordre, sans les répétitions. */
const enchainement = (suite) => suite.filter((h, i) => h !== suite[i - 1])

const ESSAI = 'exemples/musique.cpp'
const { suite, gb, bati } = ecouter(ESSAI, 120)

b.verifier('la cartouche se fabrique', bati.rom.length === 32768, ` (${bati.octets.length} octets de programme)`)

/*
 * Le thème commence par DO4, MI4, SOL4, DO5 — chacun tenu deux pas de huit
 * images, soit seize images par note.
 */
const DEBUT = ['DO4', 'MI4', 'SOL4', 'DO5', 'SI4']
const entendu = enchainement(suite).filter((h) => h !== 0)

b.verifier('la voix 1 joue les notes du thème, dans l’ordre',
  DEBUT.every((nom, i) => Math.abs(entendu[i] - attendu(nom)) <= 2),
  ` (entendu : ${entendu.slice(0, 5).join(', ')} Hz — attendu ${DEBUT.map(attendu).join(', ')})`)

/*
 * « == » tient la note au lieu de la rejouer. Cela ne se voit pas dans la
 * fréquence — elle ne change pas — mais dans le DÉCLENCHEMENT : une note
 * rejouée remet son compteur de longueur à zéro. On compte donc combien
 * d'images d'affilée la première note tient : deux pas de huit images.
 */
const premiere = suite.findIndex((h) => h !== 0)
let tenue = 0
while (suite[premiere + tenue] === suite[premiere]) tenue++

b.verifier('une note tenue par « == » dure bien deux pas', tenue >= 15 && tenue <= 17,
  ` (${tenue} images, attendu 16)`)

/* Le « -- » de la fin de mesure fait vraiment taire la voix. */
b.verifier('« -- » fait taire la voix', suite.slice(0, 120).includes(0),
  ` (${suite.filter((h) => h === 0).length} images de silence sur 120)`)

/* La basse double le thème, deux octaves plus bas, sur l'autre voix. */
const basse = enchainement(ecouter(ESSAI, 60, 2).suite).filter((h) => h !== 0)
b.verifier('la voix 2 joue la basse', Math.abs(basse[0] - attendu('DO2')) <= 2,
  ` (entendu ${basse[0]} Hz, attendu ${attendu('DO2')})`)

/*
 * L'air boucle : le quatrième argument de « jouer() ». Trente-deux pas de huit
 * images font 256 images ; au-delà, on doit réentendre le premier DO4.
 */
const long = ecouter(ESSAI, 320).suite
const retours = enchainement(long).filter((h) => Math.abs(h - attendu('DO4')) <= 2).length
b.verifier('l’air recommence tout seul au bout', retours >= 2, ` (${retours} passages sur le DO4)`)

/* Et l'état vit bien là où le compilateur l'a mis, sans déborder ailleurs. */
b.egal('l’état de la voix 1 dit qu’un air tourne', gb.mmu.read(0xc0a0), 1)
b.egal('celui de la voix 2 aussi', gb.mmu.read(0xc0b0), 1)

/* ------------------------------------------- un air qui s'arrête tout seul */

const FINI = `
Air COURT = { "DO4 12", "MI4 12", "--" };
uint8_t fini = 0;
int main() {
  jouer(2, COURT, 4);
  while (true) { image(); if (airFini(2)) fini = 1; }
  return 0;
}
`

function faireTourner(source, images) {
  const rendu = compiler(analyser(source))
  const gb2 = new GameBoy()
  gb2.loadRom(fabriquer(rendu.octets, rendu.base, 'AIRS', rendu.vecteurVBlank))
  for (let i = 0; i < images; i++) gb2.runFrame()
  return { gb2, rendu }
}

const court = faireTourner(FINI, 6)
b.egal('airFini() rend 0 tant que l’air joue', court.gb2.mmu.read(court.rendu.variables.get('fini')), 0)

const apres = faireTourner(FINI, 30)
b.egal('et 1 quand il est arrivé au bout', apres.gb2.mmu.read(apres.rendu.variables.get('fini')), 1)
b.verifier('la voix se tait à la fin', !apres.gb2.apu.canal2.joue)

/* ------------------------------------------------- ce qui doit être refusé */

const refuser = (source) => () => compiler(analyser(source))

b.refuse('une hauteur qui n’existe pas est nommée',
  refuser('Air FANFARE = { "UT4 12" }; int main() { jouer(1, FANFARE, 8); return 0; }'),
  'n\'est pas une hauteur')

b.refuse('un volume au-delà de 15 est refusé',
  refuser('Air FANFARE = { "DO4 40" }; int main() { jouer(1, FANFARE, 8); return 0; }'),
  'va de 0 à 15')

b.refuse('un Air ne se lit pas comme un nombre',
  refuser('Air FANFARE = { "DO4" }; uint8_t x = 0; int main() { x = FANFARE; return 0; }'),
  'il se joue')

b.refuse('jouer() veut le nom d’un Air',
  refuser('uint8_t t[2]; int main() { jouer(1, t, 8); return 0; }'),
  'le nom d\'un Air')

b.refuse('un air ne se joue pas sur la voix du bruit',
  refuser('Air FANFARE = { "DO4" }; int main() { jouer(4, FANFARE, 8); return 0; }'),
  'la voix 1 ou 2')

/* ------------------------------------------------ l'atelier de la page */

const PROGRAMME = `Air THEME = {
  "DO4 12", "==", "--", "MI4 9",
};

int main() { jouer(1, THEME, 8); return 0; }
`

const airs = lireAirs(PROGRAMME)
b.egal('l’atelier retrouve l’air du programme', airs.length, 1)
b.egal('et son nom', airs[0].nom, 'THEME')
b.egal('et ses quatre pas', airs[0].pas.length, 4)
b.egal('une note se lit comme un numéro de hauteur', HAUTEURS[airs[0].pas[0].hauteur], 'DO4')
b.egal('son volume aussi', airs[0].pas[0].volume, 12)
b.egal('« == » se lit tel quel', airs[0].pas[1].hauteur, '==')
b.egal('« -- » aussi', airs[0].pas[2].hauteur, '--')
b.egal('un pas se réécrit comme il s’est lu', ecrirePas(lirePas('SOL5 3')), 'SOL5 3')
b.egal('un pas sans volume prend douze', lirePas('LA4').volume, 12)

/* Poser une note réécrit le texte — et le compilateur doit relire le résultat. */
const pas = airs[0].pas.map((p) => ({ ...p }))
pas[2] = { hauteur: HAUTEURS.indexOf('SOL4'), volume: 7 }
const reecrit = remplacerAir(PROGRAMME, airs[0], pas)

b.verifier('le texte réécrit contient la note posée', reecrit.includes('"SOL4 7"'),
  ` (${reecrit.split('\n')[1].trim()})`)
b.verifier('le reste du programme n’a pas bougé', reecrit.includes('jouer(1, THEME, 8);'))
b.egal('et l’air relu redonne les mêmes pas', lireAirs(reecrit)[0].pas.length, 4)

const recompile = compiler(analyser(reecrit))
b.verifier('le programme réécrit compile encore', recompile.octets.length > 0,
  ` (${recompile.octets.length} octets)`)

const ajoute = ajouterAir(PROGRAMME, 'NEUF')
b.egal('« + air » en ajoute un, vide', lireAirs(ajoute).length, 2)
b.egal('de huit pas de silence', lireAirs(ajoute)[1].pas.filter((p) => p.hauteur === '--').length, 8)
b.verifier('et le programme ainsi complété compile', compiler(analyser(ajoute)).octets.length > 0)

b.fin()

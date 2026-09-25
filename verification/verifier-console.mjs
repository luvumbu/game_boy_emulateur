/**
 * Le matériel de la console répond-il vraiment ?
 *
 *   node verifier-console.mjs
 *
 * `verifier-langage.mjs` éprouve le langage — les boucles, les calculs, les
 * « struct ». Celui-ci éprouve la PUCE : le panneau qui ne défile pas, les
 * palettes, les options d'un lutin, le son, l'horloge des images, et la
 * mémoire qui survit à l'extinction.
 *
 * Tout cela existait dans le matériel depuis 1989 et restait hors d'atteinte
 * du langage. Le vérifier demande de regarder les registres du matériel et le
 * signal sonore produit, et non pas seulement l'écran.
 */

import { GameBoy } from '../emulateur.js'
import { batir, demarrer, bulletin } from '../outils/controle.mjs'
import { numeroDe } from '../compilateur/police.js'

const b = bulletin('la console : écran, son, palettes, sauvegarde')

const FICHIER = 'exemples/console.cpp'
const jeu = demarrer(FICHIER, 30)
const { gb } = jeu

/* ------------------------------------------------------------ l'écran */

const lcdc = gb.mmu.read(0xff40)
b.verifier('l’écran est allumé', (lcdc & 0x80) !== 0)
b.verifier('le panneau est allumé', (lcdc & 0x20) !== 0, ` (LCDC = %${lcdc.toString(2).padStart(8, '0')})`)
b.verifier('et il lit bien la SECONDE carte, en $9C00', (lcdc & 0x40) !== 0)

const mot = (texte) => [...texte].map(numeroDe)
const dansLePanneau = (colonne, ligne, texte) =>
  mot(texte).every((v, i) => gb.mmu.read(0x9c00 + ligne * 32 + colonne + i) === v)

b.verifier('« RECORD » est écrit dans le panneau', dansLePanneau(1, 0, 'RECORD'))
b.egal('le panneau est posé à la ligne 120', gb.mmu.read(0xff4a), 120)
b.egal('et à la colonne 0 — le décalage du matériel est rendu invisible', gb.mmu.read(0xff4b), 7)

/*
 * Le décor défile ; le panneau ne bouge pas d'un pixel. C'est toute la raison
 * d'être de cette couche, et cela ne se voit qu'en comparant deux images.
 */
const rangeeDePixels = (y) => gb.framebuffer.slice(y * 160, (y + 1) * 160).join(',')
const decorAvant = rangeeDePixels(60)
const panneauAvant = rangeeDePixels(124)
const defilementAvant = gb.mmu.read(0xff43)

jeu.avancer(40)

b.verifier('le décor a défilé', gb.mmu.read(0xff43) !== defilementAvant,
  ` (${defilementAvant} → ${gb.mmu.read(0xff43)})`)
b.verifier('le décor a donc changé à l’écran', rangeeDePixels(60) !== decorAvant)
b.verifier('mais le panneau, lui, n’a pas bougé', rangeeDePixels(124) === panneauAvant)
b.verifier('et le panneau n’est pas vide', new Set(panneauAvant.split(',')).size > 1)

/* ------------------------------------------------------- les lutins */

const lutin = (n) => ({
  y: gb.mmu.read(0xfe00 + n * 4),
  x: gb.mmu.read(0xfe00 + n * 4 + 1),
  tuile: gb.mmu.read(0xfe00 + n * 4 + 2),
  options: gb.mmu.read(0xfe00 + n * 4 + 3),
})

b.egal('un personnage de seize sans option', lutin(0).options, 0)
b.egal('retourné vers la gauche', lutin(4).options, 0x20)
b.egal('retourné vers le haut', lutin(8).options, 0x40)
b.egal('les deux à la fois', lutin(12).options, 0x60)
b.egal('un lutin caché DERRIÈRE le décor', lutin(16).options, 0x80)
b.egal('un lutin sur la SECONDE palette', lutin(17).options, 0x10)

/*
 * Retourné, un personnage de seize doit échanger ses quarts : sinon le
 * matériel retourne chaque carré sur lui-même et le visage se retrouve à
 * l'envers. On lit donc les tuiles, et pas seulement les options.
 */
b.egal('à l’endroit, le quart haut-gauche est le premier', lutin(0).tuile, lutin(0).tuile)
b.verifier('retourné à gauche, les moitiés sont échangées',
  lutin(4).tuile === lutin(0).tuile + 1 && lutin(5).tuile === lutin(0).tuile,
  ` (${lutin(4).tuile}, ${lutin(5).tuile} contre ${lutin(0).tuile}, ${lutin(1).tuile})`)
b.verifier('retourné en haut, ce sont les rangées',
  lutin(8).tuile === lutin(0).tuile + 2 && lutin(10).tuile === lutin(0).tuile,
  ` (${lutin(8).tuile}, ${lutin(10).tuile})`)

/* ---------------------------------------------------- les palettes */

b.egal('la palette des lutins n° 0 est celle d’origine', gb.mmu.read(0xff48), 0b11100100)

const paletteDepart = gb.mmu.read(0xff47)
jeu.avancer(260) // le temps que l'air se termine et que la nuance change
b.verifier('la palette du fond a changé en cours de route',
  gb.mmu.read(0xff47) !== paletteDepart,
  ` ($${paletteDepart.toString(16)} → $${gb.mmu.read(0xff47).toString(16)})`)

/* -------------------------------------------------------------- le son */

const neuf = new GameBoy()
neuf.loadRom(jeu.rom)

let imagesQuiSonnent = 0
let amplitude = 0
const surLaVoix1 = new Set()
const surLaVoix2 = new Set()

/*
 * La hauteur se lit dans la voix, et non dans le signal mélangé.
 *
 * J'ai d'abord compté les passages par zéro de la sortie : deux carrés et un
 * bruit qui se superposent en font bien plus qu'une seule note, et la mesure
 * annonçait 1700 Hz pour un DO4. Ce n'était pas le son qui était faux, c'était
 * la façon de le mesurer. Les registres de fréquence, eux, ne se relisent pas
 * sur cette console — on interroge donc la voix de l'émulateur, qui les tient.
 */
const hertz = (voix) => Math.round(131072 / (2048 - voix.periode))

for (let i = 0; i < 400; i++) {
  neuf.runFrame()
  const echantillons = neuf.apu.drain()

  let fort = 0
  for (const v of echantillons) fort = Math.max(fort, Math.abs(v))
  if (fort >= 0.05) { imagesQuiSonnent++; amplitude = Math.max(amplitude, fort) }

  if (neuf.apu.canal1.joue) surLaVoix1.add(hertz(neuf.apu.canal1))
  if (neuf.apu.canal2.joue) surLaVoix2.add(hertz(neuf.apu.canal2))
}

b.verifier('la puce sonore est allumée', (neuf.mmu.read(0xff26) & 0x80) !== 0,
  ` (NR52 = $${neuf.mmu.read(0xff26).toString(16)})`)
b.egal('les quatre voix sortent des deux côtés', neuf.mmu.read(0xff25), 0xff)
b.verifier('la console produit vraiment du son', imagesQuiSonnent > 20,
  ` (${imagesQuiSonnent} images sur 400, amplitude ${amplitude.toFixed(2)})`)

/*
 * L'air va du DO4 au DO5 sur la voix 1 ; la voix 2 le double une octave plus
 * bas. Les hauteurs attendues sont donc connues d'avance, à un hertz près —
 * la table des notes est calculée en gamme tempérée, LA4 à 440 Hz.
 */
const ATTENDUES_1 = [262, 330, 392, 523, 294] // DO4 MI4 SOL4 DO5 RE4
const ATTENDUES_2 = [131, 165, 196, 262, 147] // les mêmes, une octave dessous

const proche = (mesurees, attendue) => [...mesurees].some((h) => Math.abs(h - attendue) <= 2)

b.verifier('la voix 1 joue les notes de l’air, à deux hertz près',
  ATTENDUES_1.every((h) => proche(surLaVoix1, h)),
  ` (entendu : ${[...surLaVoix1].sort((a, c) => a - c).join(', ')} Hz)`)

b.verifier('la voix 2 les double une octave plus bas',
  ATTENDUES_2.every((h) => proche(surLaVoix2, h)),
  ` (entendu : ${[...surLaVoix2].sort((a, c) => a - c).join(', ')} Hz)`)

/* ----------------------------------------------------- la sauvegarde */

b.egal('la cartouche annonce une mémoire à pile', jeu.rom[0x0147], 0x03)
b.egal('de huit kilo-octets', jeu.rom[0x0149], 0x02)
b.egal('l’émulateur reconnaît le contrôleur', gb.mmu.mbc, 'mbc1')

b.egal('la marque est écrite dans la mémoire', gb.mmu.externalRam[0], 42)
b.verifier('le record y est écrit aussi', gb.mmu.externalRam[1] > 0,
  ` (${gb.mmu.externalRam[1]})`)
b.verifier('et la mémoire est REVERROUILLÉE après chaque accès', gb.mmu.ramEnabled === false)

/*
 * On éteint la console et on la rallume, en gardant la mémoire de la
 * cartouche — c'est ce que fait la pile. Le programme doit reconnaître sa
 * marque et repartir du record précédent.
 */
const memoire = gb.mmu.externalRam.slice()
const rallumee = new GameBoy()
rallumee.loadRom(jeu.rom)
rallumee.mmu.externalRam.set(memoire)
for (let i = 0; i < 30; i++) rallumee.runFrame()

const bati = batir(FICHIER, 'CONSOLE')
const lit = (nom) => rallumee.mmu.read(bati.variables.get(nom))

b.egal('après extinction, la cartouche est reconnue', lit('premiereFois'), 0)
b.verifier('et le record a survécu', lit('meilleur') > 1, ` (${lit('meilleur')})`)

/* ------------------------------------------------ l'horloge des images */

/*
 * Une image ratée au plus, et c'est la PREMIÈRE.
 *
 * Écrire dans le panneau attend le VBlank : la mise en place consomme donc une
 * image avant que la boucle ne commence, et le premier « image() » le signale.
 * C'est vrai — une image est bien passée —, et ce n'est pas un ralentissement.
 *
 * On pourrait faire taire ce premier signalement ; ce serait mentir, et le
 * jour où la mise en place prendrait vraiment trop de temps, plus personne ne
 * le saurait. Ce qui compte est qu'ensuite, la boucle ne rate plus rien.
 */
const ratees = jeu.valeurDe('imagesRatees')
b.verifier('la boucle ne rate rien une fois lancée', ratees <= 1,
  ` (${ratees} image${ratees > 1 ? 's ratées' : ' ratée'} — celle de la mise en place)`)

b.fin()

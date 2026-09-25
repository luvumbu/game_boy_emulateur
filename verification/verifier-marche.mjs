/**
 * La marche joue-t-elle vraiment ?
 *
 *   node verifier-marche.mjs
 *
 * Un air qui compile n'est pas un air qu'on entend : la voix peut rester
 * muette, la basse peut se décaler de la mélodie, la percussion peut sauter un
 * temps. On écoute donc les voix de la puce, image par image, et l'on relève
 * les hauteurs traversées.
 */

import { demarrer, bulletin } from '../outils/controle.mjs'

const b = bulletin('exemples/marche.cpp')
const jeu = demarrer('exemples/marche.cpp', 10)

/* La hauteur se lit dans la voix, et non dans le signal mélangé : deux carrés
   superposés font bien plus de passages par zéro qu'une seule note. */
const hertz = (voix) => Math.round(131072 / (2048 - voix.periode))

const voix1 = new Set()
const voix2 = new Set()
let imagesBruit = 0
let imagesQuiSonnent = 0

for (let i = 0; i < 420; i++) {
  jeu.gb.runFrame()
  const apu = jeu.gb.apu
  if (apu.canal1.joue) voix1.add(hertz(apu.canal1))
  if (apu.canal2.joue) voix2.add(hertz(apu.canal2))
  if (apu.bruit.joue) imagesBruit++
  if (apu.canal1.joue || apu.canal2.joue) imagesQuiSonnent++
}

const aigus = [...voix1].sort((x, y) => x - y)
const graves = [...voix2].sort((x, y) => x - y)

b.verifier('la mélodie joue', voix1.size > 0)
b.verifier('elle parcourt plusieurs hauteurs', voix1.size >= 8, ` (${voix1.size} notes distinctes)`)
b.verifier('la basse joue aussi', voix2.size >= 4, ` (${voix2.size} notes distinctes)`)

/*
 * La basse est SOUS la mélodie — deux octaves plus bas.
 *
 * C'est ce qui fait qu'on entend deux voix et non une bouillie : si la basse
 * montait dans le registre de la mélodie, les deux carrés se masqueraient.
 */
b.verifier('la basse est bien sous la mélodie',
  Math.max(...graves) < Math.min(...aigus),
  ` (basse jusqu'à ${Math.max(...graves)} Hz, mélodie dès ${Math.min(...aigus)} Hz)`)

b.verifier('la mélodie tient dans les octaves 4 et 5',
  Math.min(...aigus) > 190 && Math.max(...aigus) < 1100,
  ` (${Math.min(...aigus)} à ${Math.max(...aigus)} Hz)`)

b.verifier('la percussion frappe', imagesBruit > 0, ` (${imagesBruit} images de bruit)`)
b.verifier('la console sonne presque tout le temps', imagesQuiSonnent > 380,
  ` (${imagesQuiSonnent} images sur 420)`)

/* Les deux airs comptent le même nombre de pas : sans cela ils se décalent
   lentement, et la basse « glisse » sous la mélodie au bout d'une minute. */
b.verifier('les mesures défilent', jeu.valeurDe('mesures') > 0,
  ` (${jeu.valeurDe('mesures')} mesures en 420 images)`)

/* A coupe, B relance : la musique doit obéir. */
jeu.gb.setButton('a', true); jeu.avancer(6); jeu.gb.setButton('a', false); jeu.avancer(6)
b.verifier('A coupe la musique', !jeu.gb.apu.canal1.joue && !jeu.gb.apu.canal2.joue)

jeu.gb.setButton('b', true); jeu.avancer(6); jeu.gb.setButton('b', false); jeu.avancer(12)
b.verifier('B la relance', jeu.gb.apu.canal1.joue)

b.fin()

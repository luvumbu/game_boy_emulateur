/**
 * Les exemples tournent-ils vraiment sur la console ?
 *
 *   node verifier-exemples.mjs
 *
 * Chacun est compilé, chargé dans l'émulateur, et joué : on presse des boutons
 * et l'on relit la mémoire. Une cartouche peut s'assembler sans une erreur et
 * rester noire — c'est même le plus courant quand on écrit un compilateur.
 */

import { demarrer, bulletin } from '../outils/controle.mjs'
import { numeroDe } from '../compilateur/police.js'

const b = bulletin('les exemples')
const mot = (texte) => [...texte].map(numeroDe)
const dit = (jeu, colonne, ligne, texte) =>
  jeu.ecran(colonne, ligne, texte.length).every((v, i) => v === mot(texte)[i])

/* ------------------------------------------------------------- bonjour */
{
  const jeu = demarrer('exemples/bonjour.cpp', 12)
  b.verifier('bonjour : « BONJOUR » s\'affiche', dit(jeu, 6, 4, 'BONJOUR'))
  b.verifier('bonjour : « APPUIE SUR A » aussi', dit(jeu, 3, 8, 'APPUIE SUR A'))
  b.verifier('bonjour : l\'écran est allumé', (jeu.gb.mmu.read(0xff40) & 0x80) !== 0)

  jeu.gb.setButton('a', true)
  jeu.avancer(6)
  b.verifier('bonjour : A répond « BRAVO »', dit(jeu, 3, 8, 'BRAVO'))
  b.verifier('bonjour : et le compte a monté', jeu.valeurDe('main.compte') > 0)

  jeu.gb.setButton('a', false)
  jeu.gb.setButton('b', true)
  jeu.avancer(6)
  b.verifier('bonjour : B remet la consigne', dit(jeu, 3, 8, 'APPUIE SUR A'))
}

/* ------------------------------------------------------------ compteur */
{
  const jeu = demarrer('exemples/compteur.cpp', 10)
  b.egal('compteur : la valeur démarre à 5', jeu.valeurDe('valeur'), 5)

  jeu.gb.setButton('up', true)
  jeu.avancer(150)
  const haut = jeu.valeurDe('valeur')
  b.verifier('compteur : HAUT fait monter', haut > 5, ` (lu : ${haut})`)
  b.egal('compteur : et cela s\'arrête à neuf', haut, 9)

  jeu.gb.setButton('up', false)
  jeu.gb.setButton('down', true)
  jeu.avancer(300)
  b.egal('compteur : BAS redescend jusqu\'à zéro, sans passer dessous', jeu.valeurDe('valeur'), 0)
}

/* --------------------------------------------------------------- puits */
{
  const jeu = demarrer('exemples/puits.cpp', 20)
  b.verifier('puits : le titre est là', dit(jeu, 1, 0, 'PUITS'))
  b.egal('puits : la pièce part de la colonne 4', jeu.valeurDe('px'), 4)

  const MUR = 40
  const BLOC = 41
  b.egal('puits : le mur de gauche est dessiné', jeu.ecran(4, 3, 1)[0], MUR)
  b.egal('puits : celui de droite aussi', jeu.ecran(15, 3, 1)[0], MUR)
  b.egal('puits : la pièce est à l\'écran', jeu.ecran(9, 1, 1)[0], BLOC)

  jeu.avancer(45)
  const descendue = jeu.valeurDe('py')
  b.verifier('puits : la pièce descend toute seule', descendue >= 2, ` (ligne ${descendue})`)

  /* GAUCHE au front : un appui, un pas — et pas quatre. */
  jeu.gb.setButton('left', true)
  jeu.avancer(8)
  b.egal('puits : un appui sur GAUCHE ne fait qu\'un pas', jeu.valeurDe('px'), 3)
  jeu.gb.setButton('left', false)

  /* Tout au fond : la pièce se pose, et une neuve repart du haut. */
  jeu.gb.setButton('down', true)
  jeu.avancer(80)
  b.egal('puits : la pièce posée est entrée dans le puits', jeu.caseDe('puits', 15 * 10 + 3), BLOC)
  b.verifier('puits : une nouvelle pièce est repartie du haut', jeu.valeurDe('py') < 15)
}

/* -------------------------------------------------------------- tetris */
{
  const jeu = demarrer('exemples/tetris.cpp', 30)
  b.verifier('tetris : le panneau annonce les lignes', dit(jeu, 13, 1, 'LIGNES'))
  b.egal('tetris : on démarre à zéro ligne', jeu.valeurDe('lignes'), 0)
  b.egal("tetris : et la partie n'est pas perdue", jeu.valeurDe('perdu'), 0)

  const departX = jeu.valeurDe('posX')
  jeu.gb.setButton('left', true)
  jeu.avancer(6)
  jeu.gb.setButton('left', false)
  b.egal("tetris : GAUCHE déplace la pièce d'une colonne", jeu.valeurDe('posX'), departX - 1)

  const rotationDepart = jeu.valeurDe('rotation')
  jeu.gb.setButton('a', true)
  jeu.avancer(6)
  jeu.gb.setButton('a', false)
  b.verifier('tetris : A fait tourner la pièce', jeu.valeurDe('rotation') !== rotationDepart)

  /* On laisse tomber longtemps : des blocs doivent finir dans le puits, et la
     console ne doit ni se figer ni perdre au premier coup. */
  jeu.gb.setButton('down', true)
  jeu.avancer(400)
  jeu.gb.setButton('down', false)

  let poses = 0
  for (let i = 0; i < 170; i++) if (jeu.caseDe('puits', i) !== 0) poses++
  b.verifier('tetris : des pièces se sont empilées', poses > 3, ` (${poses} cases occupées)`)
  b.verifier('tetris : la console tourne toujours', (jeu.gb.mmu.read(0xff40) & 0x80) !== 0)
}

/* --------------------------------------------------------------- chute */
{
  const jeu = demarrer('exemples/chute.cpp', 20)
  const hauteur = () => 120 - jeu.valeurDe('y')
  const vitesse = () => jeu.valeurDe('vy') - 128   // la vitesse est décalée : 128 = immobile

  b.verifier('chute : le décor annonce la simulation', dit(jeu, 0, 0, 'CHUTE LIBRE'))
  b.verifier('chute : le sol est posé sur les deux dernières lignes',
    jeu.ecran(0, 16, 20).every((t) => t !== 0) && jeu.ecran(0, 17, 20).every((t) => t !== 0))

  /* L'objet ACCÉLÈRE : c'est toute la différence entre tomber et descendre.
     Deux intervalles de même durée, et le second doit être plus long. */
  const depart = hauteur()
  jeu.avancer(20)
  const parcouruTot = depart - hauteur()
  const milieu = hauteur()
  jeu.avancer(20)
  const parcouruTard = milieu - hauteur()
  b.verifier('chute : la chute accélère', parcouruTard > parcouruTot,
    ` (${parcouruTot} px puis ${parcouruTard} px, en autant d'images)`)

  /* Les seizièmes de pixel servent à cela : au tout début, l'objet avance de
     MOINS d'un pixel par tour. Sans eux, il resterait collé en l'air. */
  b.verifier('chute : le premier déplacement est inférieur à un pixel par image',
    parcouruTot < 20, ` (${parcouruTot} px en 20 images)`)

  /* Le sol renvoie, en prenant un quart de la vitesse à chaque choc. */
  jeu.avancer(60)
  b.egal('chute : le sol est touché', jeu.valeurDe('rebonds') > 0, true)
  b.verifier('chute : et il renvoie vers le haut', vitesse() < 0, ` (vitesse ${vitesse()})`)

  const premier = jeu.valeurDe('rebonds')
  jeu.avancer(150)
  b.verifier('chute : les rebonds se succèdent', jeu.valeurDe('rebonds') > premier,
    ` (${premier} puis ${jeu.valeurDe('rebonds')})`)

  /* Et ils S'ARRÊTENT. Un rebond sans perte ferait trembler la balle pour
     toujours — c'est le défaut le plus courant de ces simulations. */
  jeu.avancer(400)
  b.egal('chute : la balle finit par se coucher', jeu.valeurDe('couchee'), 1)
  b.egal('chute : couchée, elle est posée sur le sol', jeu.valeurDe('y'), 120)
  b.egal('chute : et sa vitesse est nulle', vitesse(), 0)

  /* A relance, et remet le compteur à zéro. */
  jeu.gb.setButton('a', true)
  jeu.avancer(6)
  jeu.gb.setButton('a', false)
  jeu.avancer(6)
  b.egal('chute : A relance depuis le haut', jeu.valeurDe('rebonds'), 0)
  b.verifier('chute : et la balle est repartie du plafond', hauteur() > 80, ` (hauteur ${hauteur()})`)

  /* HAUT et BAS règlent la pesanteur, au front : un appui, un cran. */
  const pesanteur = jeu.valeurDe('g')
  jeu.gb.setButton('up', true)
  jeu.avancer(30)
  b.egal("chute : HAUT maintenu ne monte la pesanteur que d'un cran",
    jeu.valeurDe('g'), pesanteur + 1)
  jeu.gb.setButton('up', false)

  b.verifier('chute : la console tourne toujours', (jeu.gb.mmu.read(0xff40) & 0x80) !== 0)
}

b.fin()

/**
 * Les quatre jeux de la série 3 se jouent-ils jusqu'au bout ?
 *
 *   node verification/verifier-jeux.mjs
 *
 * Puissance 4, Dames, Échecs et Couleurs (un jeu de cartes dans le style du
 * UNO), dans exemples/. On ne relit pas le code : on compile chaque jeu, on le
 * fait tourner dans l'émulateur du projet, on appuie sur de vraies touches, et
 * on lit l'écran et les variables — une vraie partie, coup par coup.
 */

import { demarrer, bulletin } from '../outils/controle.mjs'
import { ORDRE } from '../compilateur/police.js'

const b = bulletin('les jeux de la série 3')

const TOUCHE = { A: 'a', B: 'b', START: 'start', GAUCHE: 'left', DROITE: 'right', HAUT: 'up', BAS: 'down' }

/** Un jeu, prêt à jouer : appuyer sur une touche, lire une ligne de l'écran, une variable.
    « joueurs » : 1 contre la console (le choix par défaut de l'écran titre), 2 à deux. */
function ouvrir(chemin, joueurs = 2) {
  const jeu = demarrer(chemin, 30)
  const j = {
    appuyer(nom, fois = 1) {
      for (let i = 0; i < fois; i++) {
        jeu.gb.setButton(TOUCHE[nom], true); jeu.avancer(4)
        jeu.gb.setButton(TOUCHE[nom], false); jeu.avancer(4)
      }
    },
    avancer: (n) => jeu.avancer(n),
    // une case qui n'est pas une lettre (la tuile VIDE du jeu) se lit comme un espace
    ligne: (l) => jeu.ecran(0, l, 20).map((v) => ORDRE[v] ?? ' ').join('').trim(),
    v: (nom) => jeu.valeurDe(nom),
  }
  if (joueurs === 2 && !chemin.includes('cartes')) j.appuyer('BAS')   // « 2 JOUEURS »
  j.appuyer('START')                 // l'écran titre
  j.avancer(10)
  return j
}

/** Attendre que la console ait joué (au plus quelques secondes). */
function attendreLaConsole(j, son) {
  for (let i = 0; i < 400 && j.v('joueur') === son && j.v('fini') === 0; i++) j.avancer(10)
}

/** Mener le curseur (curseurC, curseurL) sur une case, puis A. */
function viser(j, c, l) {
  while (j.v('curseurC') < c) j.appuyer('DROITE')
  while (j.v('curseurC') > c) j.appuyer('GAUCHE')
  while (j.v('curseurL') < l) j.appuyer('BAS')
  while (j.v('curseurL') > l) j.appuyer('HAUT')
  j.appuyer('A')
}
const deplacer = (j, c0, l0, c1, l1) => { viser(j, c0, l0); viser(j, c1, l1); j.avancer(4) }

/* ------------------------------------------------------------ Puissance 4 */
{
  const j = ouvrir('exemples/puissance4.cpp')
  b.verifier('puissance 4 : après le titre, le Père Noël commence', j.ligne(1) === 'AU PERE NOEL')
  // le Père Noël en colonne 3, le bonhomme en colonne 4 : quatre jetons du Père Noël empilés
  for (let k = 0; k < 4; k++) {
    j.appuyer('A'); j.avancer(4)
    if (k === 3) break
    j.appuyer('DROITE'); j.appuyer('A'); j.avancer(4); j.appuyer('GAUCHE')
  }
  b.verifier('puissance 4 : quatre en colonne, le Père Noël gagne', j.ligne(1) === 'LE PERE NOEL GAGNE' && j.v('fini') === 1)
  b.egal('puissance 4 : 7 jetons posés', j.v('coups'), 7)
  j.appuyer('START'); j.avancer(10)
  b.egal('puissance 4 : START rejoue, le plateau est vide', j.v('coups'), 0)
  // une diagonale ↗ pour le Père Noël
  let col = 3
  for (const c of [0, 1, 1, 2, 2, 3, 2, 3, 3, 6, 3]) {
    while (col < c) { j.appuyer('DROITE'); col++ }
    while (col > c) { j.appuyer('GAUCHE'); col-- }
    j.appuyer('A'); j.avancer(4)
  }
  b.verifier('puissance 4 : la diagonale est reconnue', j.v('fini') === 1 && j.ligne(1) === 'LE PERE NOEL GAGNE')
}

/* ------------------------------------------------------------------ Dames */
{
  const j = ouvrir('exemples/dames.cpp')
  b.verifier('dames : les blancs commencent', j.ligne(17) === 'AUX BLANCS')
  deplacer(j, 2, 5, 1, 6)                   // la case (1, 6) a un pion blanc : on change seulement de pièce
  j.appuyer('B')
  deplacer(j, 2, 5, 3, 6)                   // reculer : interdit (la case est prise de toute façon)
  b.egal('dames : un coup interdit ne passe pas la main', j.v('joueur'), 1)
  j.appuyer('B')
  deplacer(j, 2, 5, 3, 4)
  b.egal('dames : le blanc avance, aux rouges', j.v('joueur'), 2)
  deplacer(j, 5, 2, 4, 3)
  b.egal('dames : le rouge avance, aux blancs', j.v('joueur'), 1)
  deplacer(j, 3, 4, 5, 2)
  b.egal('dames : le blanc prend en sautant — 11 rouges', j.v('rouges'), 11)
  b.egal('dames : et la main passe', j.v('joueur'), 2)
}

/* ----------------------------------------------------------------- Échecs */
{
  const j = ouvrir('exemples/echecs.cpp')
  b.verifier('échecs : les blancs commencent', j.ligne(17) === 'AUX BLANCS')
  deplacer(j, 4, 6, 4, 3)
  b.egal('échecs : un pion ne fait pas trois cases', j.v('joueur'), 1)
  j.appuyer('B')
  // le coup du berger : e4 e5, Dh5 Cc6, Fc4 Cf6, Dxf7
  deplacer(j, 4, 6, 4, 4)
  deplacer(j, 4, 1, 4, 3)
  deplacer(j, 3, 7, 7, 3)
  deplacer(j, 1, 0, 2, 2)
  b.egal('échecs : le cavalier saute par-dessus les pions', j.v('joueur'), 1)
  deplacer(j, 5, 7, 2, 4)
  deplacer(j, 6, 0, 5, 2)
  deplacer(j, 7, 3, 5, 1)
  b.verifier('échecs : la dame en f7, « ÉCHEC » au roi noir', j.ligne(17) === 'NOIRS : ECHEC')
  deplacer(j, 0, 1, 0, 2)
  deplacer(j, 5, 1, 4, 0)
  b.verifier('échecs : la dame prend le roi, les blancs gagnent', j.v('fini') === 1 && j.ligne(17) === 'LES BLANCS GAGNENT')
}

/* ------------------------------------------------------- contre la console */
{
  // Puissance 4 : le Père Noël empile trois jetons en colonne 0 ; la console doit bloquer
  const j = ouvrir('exemples/puissance4.cpp', 1)
  b.egal('IA puissance 4 : seul contre la console, par défaut', j.v('seul'), 1)
  for (let k = 0; k < 3; k++) {
    while (j.v('colonne') > 0) j.appuyer('GAUCHE')
    j.appuyer('A'); j.avancer(4)
    attendreLaConsole(j, 2)
  }
  b.egal('IA puissance 4 : trois jetons du Père Noël en colonne 0 — elle bloque en 0', j.v('colonne'), 0)
  while (j.v('colonne') > 0) j.appuyer('GAUCHE')
  j.appuyer('A'); j.avancer(4)
  b.egal('IA puissance 4 : le quatrième ne gagne plus', j.v('fini'), 0)
}
{
  // Dames : un blanc avance, puis s'offre ; la console le prend
  const j = ouvrir('exemples/dames.cpp', 1)
  deplacer(j, 2, 5, 3, 4)
  attendreLaConsole(j, 2)
  b.egal('IA dames : la console répond, la main revient aux blancs', j.v('joueur'), 1)
  deplacer(j, 3, 4, 4, 3)
  attendreLaConsole(j, 2)
  b.egal('IA dames : un blanc offert, elle le prend — 11 blancs', j.v('blancs'), 11)
}
{
  // Échecs : e4, Dh5, puis la dame se jette en h7, défendue par la tour : la console la prend
  const j = ouvrir('exemples/echecs.cpp', 1)
  deplacer(j, 4, 6, 4, 4)
  attendreLaConsole(j, 2)
  b.egal('IA échecs : la console répond à e4', j.v('joueur'), 1)
  deplacer(j, 3, 7, 7, 3)
  attendreLaConsole(j, 2)
  deplacer(j, 7, 3, 7, 1)
  attendreLaConsole(j, 2)
  b.verifier('IA échecs : la dame offerte en h7, la tour la prend', j.v('curseurC') === 7 && j.v('curseurL') === 1 && j.v('joueur') === 1,
    ` (la console a joué en ${j.v('curseurC')}, ${j.v('curseurL')})`)
}

/* --------------------------------------------------- Flash le hérisson */
{
  // pas de choix de joueurs : START, puis on court à droite en sautant toutes les 45 images
  const jeu = demarrer('exemples/herisson.cpp', 30)
  jeu.gb.setButton('start', true); jeu.avancer(4); jeu.gb.setButton('start', false); jeu.avancer(10)
  let elanMax = 0, anneauxMax = 0, ressort = false, vieePerdue = false
  const vies = jeu.valeurDe('vies')
  jeu.gb.setButton('right', true)
  for (let t = 0; t < 4000 && jeu.valeurDe('fini') === 0; t++) {
    if (t % 45 === 0) jeu.gb.setButton('a', true)
    if (t % 45 === 6) jeu.gb.setButton('a', false)
    jeu.avancer(1)
    elanMax = Math.max(elanMax, jeu.valeurDe('elan'))
    anneauxMax = Math.max(anneauxMax, jeu.valeurDe('anneaux'))
    if (jeu.valeurDe('hVY') === 16 - 13) ressort = true
    if (jeu.valeurDe('vies') < vies) vieePerdue = true
  }
  jeu.gb.setButton('right', false); jeu.avancer(10)
  b.egal('hérisson : l’élan monte jusqu’au maximum (3 pixels par image)', elanMax, 3)
  b.verifier('hérisson : les anneaux se ramassent', anneauxMax > 0, ` (${anneauxMax} au plus)`)
  b.verifier('hérisson : un ressort l’envoie très haut', ressort)
  b.verifier('hérisson : tomber dans un trou coûte une vie', vieePerdue)
  b.egal('hérisson : le panneau termine la course', jeu.valeurDe('fini'), 1)
  b.verifier('hérisson : l’écran de fin dit BRAVO', jeu.ecran(7, 3, 5).map((v) => ORDRE[v]).join('') === 'BRAVO')
}

/* ------------------------------------------------------- Couleurs (cartes) */
{
  const j = ouvrir('exemples/cartes.cpp')
  b.verifier('cartes : sept cartes chacun', j.v('miennes') === 7 && j.v('siennes') === 7)
  let tours = 0
  let anomalie = ''
  for (tours = 0; tours < 400 && j.v('fini') === 0; tours++) {
    if (j.v('tour') !== 1) { j.avancer(50); continue }
    if (j.v('choisirCouleur') === 1) { j.appuyer('DROITE'); j.appuyer('A'); continue }
    const avant = j.v('miennes')
    while (j.v('choix') > 0) j.appuyer('GAUCHE')
    let joue = false
    for (let k = 0; k < avant && !joue; k++) {
      j.appuyer('A'); j.avancer(2)
      if (j.v('miennes') < avant || j.v('fini') === 1) joue = true
      else j.appuyer('DROITE')
    }
    if (!joue) j.appuyer('B')
    if (j.v('miennes') > 24 || j.v('siennes') > 24) anomalie = 'plus de 24 cartes'
    if (j.v('couleur') > 3) anomalie = 'une couleur qui n’existe pas'
  }
  b.verifier('cartes : la partie va jusqu’au bout', j.v('fini') === 1, ` (${tours} tours)`)
  b.verifier('cartes : sans anomalie en route', anomalie === '', anomalie ? ` — ${anomalie}` : '')
  b.verifier('cartes : quelqu’un a gagné', j.v('miennes') === 0 || j.v('siennes') === 0)
  j.appuyer('START'); j.avancer(10)
  b.verifier('cartes : START redonne sept cartes chacun', j.v('miennes') === 7 && j.v('siennes') === 7 && j.v('fini') === 0)
}

b.fin()

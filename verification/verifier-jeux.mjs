/**
 * Les quatre jeux de la série 3 se jouent-ils jusqu'au bout ?
 *
 *   node verification/verifier-jeux.mjs
 *
 * Puissance 4, Dames, Échecs et Couleurs (un jeu de cartes dans le style du
 * UNO), dans exemples/ — et Flash le hérisson, le Pou sauteur, les Bulles gloutonnes. On ne relit pas le code : on compile chaque jeu, on le
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

/* ------------------------------------------------------- Le pou sauteur */
{
  const jeu = demarrer('exemples/pou.cpp', 30)
  const v = (n) => jeu.valeurDe(n), tete = (i) => jeu.caseDe('gx', i), malade = (i) => jeu.caseDe('infecte', i)
  b.verifier('pou : l’écran titre dit LE POU SAUTEUR', jeu.ecran(3, 7, 14).map((x) => ORDRE[x]).join('') === 'LE POU SAUTEUR')
  jeu.gb.setButton('start', true); jeu.avancer(4); jeu.gb.setButton('start', false); jeu.avancer(10)
  b.verifier('pou : START lance la partie, le pou posé sur une tête', v('etat') === 1 && v('sur') === 0 && v('py') === 104)
  // il est emporté par la personne qui marche
  const x0 = v('px'); jeu.avancer(60)
  b.verifier('pou : il est emporté par la personne qui marche', v('px') !== x0 && v('sur') === 0)
  // un joueur : sur une tête, il saute vers la tête saine la plus proche, et se dirige en l'air
  let infections = 0, chutes = 0, saut = 0
  for (let t = 0; t < 6000 && v('etat') === 1; t++) {
    const sur = v('sur')
    if (sur < 4) {
      let cible = -1, mieux = 999
      for (let j = 0; j < 4; j++) if (j !== sur && !malade(j)) { const d = Math.abs(tete(j) + 8 - (v('px') + 4)); if (d < mieux) { mieux = d; cible = j } }
      if (cible >= 0 && mieux < 44) {
        const score = v('score'), vies = v('vies')
        jeu.gb.setButton('a', true)
        for (let k = 0; k < 50 && v('etat') === 1; k++) {
          jeu.avancer(1)
          if (k === 28) jeu.gb.setButton('a', false)
          const ecart = tete(cible) + 8 - (v('px') + 4)
          jeu.gb.setButton('right', ecart > 2); jeu.gb.setButton('left', ecart < -2)
          if (k > 8 && v('sur') < 4) break
        }
        jeu.gb.setButton('a', false); jeu.gb.setButton('right', false); jeu.gb.setButton('left', false)
        saut++
        if (v('score') > score) infections++
        if (v('vies') < vies) chutes++
        continue
      }
    }
    jeu.avancer(1)
  }
  jeu.avancer(10)
  // les points : un par tête infectée, plus 20 si les quatre ont eu des poux en même temps
  infections = v('score') - (v('gagne') ? 20 : 0)
  b.verifier('pou : des sauts réussis donnent des poux (et des points)', infections > 0, ` (${infections} têtes infectées en ${saut} sauts)`)
  b.verifier('pou : la partie va jusqu’au bout', v('etat') === 2, ` (vies ${v('vies')}, temps ${v('temps')}, gagné ${v('gagne')})`)
  b.egal('pou : le record est le score de la partie', v('record'), v('score'))
  // tomber dans la rue coûte une vie
  jeu.gb.setButton('start', true); jeu.avancer(4); jeu.gb.setButton('start', false); jeu.avancer(10)
  const vies = v('vies')
  jeu.gb.setButton('left', true); jeu.gb.setButton('a', true); jeu.avancer(30); jeu.gb.setButton('a', false); jeu.avancer(30); jeu.gb.setButton('left', false); jeu.avancer(30)
  b.verifier('pou : START rejoue, et tomber dans la rue coûte une vie', vies === 3 && v('vies') < 3, ` (${vies} → ${v('vies')})`)
}

/* ------------------------------------------------- Les bulles gloutonnes */
{
  const jeu = demarrer('exemples/bulles.cpp', 30)
  const v = (n) => jeu.valeurDe(n), c = (n, i) => jeu.caseDe(n, i)
  const ecrire = (n, i, x) => jeu.gb.mmu.write(jeu.adresseDe(n) + i, x)
  // une grande place : zone × 256 + pixel (le monde fait 3000 × 3000)
  const M = (i) => [c('mzx', i) * 256 + c('mpx', i), c('mzy', i) * 256 + c('mpy', i)]
  const X = (i) => c('zx', i) * 256 + c('px', i), Y = (i) => c('zy', i) * 256 + c('py', i)
  // donner une masse à une bulle, avec la taille qui va avec (le tableau de fixerTaille())
  const masse = (i, m) => {
    const t = m >= 70 ? 9 : m >= 53 ? 8 : m >= 40 ? 7 : m >= 30 ? 6 : m >= 22 ? 5 : m >= 16 ? 4 : m >= 11 ? 3 : m >= 7 ? 2 : m >= 4 ? 1 : 0
    ecrire('masse', i, m); ecrire('taille', i, t); ecrire('cot', i, [4, 6, 8, 10, 12, 14, 16, 18, 21, 24][t])
    ecrire('marge', i, [2, 1, 0, 2, 2, 0, 0, 3, 0, 0][t]); ecrire('lutins', i, t >= 7 ? 9 : t >= 3 ? 4 : 1)
  }
  // poser une bulle à une grande place, et lui dire d'y rester
  const placer = (i, x, y) => {
    for (const [n, val] of [['zx', x >> 8], ['px', x & 255], ['zy', y >> 8], ['py', y & 255], ['bzx', x >> 8], ['bpx', x & 255], ['bzy', y >> 8], ['bpy', y & 255]]) ecrire(n, i, val)
  }
  // une partie démarre en dessinant 1024 cases de quadrillage : on attend qu'elle soit lancée
  const start = () => { jeu.gb.setButton('start', true); for (let w = 0; w < 200 && v('etat') !== 1; w++) jeu.avancer(1); jeu.gb.setButton('start', false); jeu.avancer(4) }
  const appuyer = (t) => { jeu.gb.setButton(t, true); jeu.avancer(6); jeu.gb.setButton(t, false); jeu.avancer(6) }
  b.verifier('bulles : l’écran titre dit GLOUTONNES', jeu.ecran(4, 6, 10).map((x) => ORDRE[x]).join('') === 'GLOUTONNES')
  b.verifier('bulles : une cartouche Game Boy Color', jeu.gb.ppu.couleur === true)
  start()
  b.verifier('bulles : START lance la partie, au milieu du monde, toute petite', v('etat') === 1 && X(0) === 1480 && Y(0) === 1480 && c('masse', 0) === 3 && c('cot', 0) === 4)
  b.verifier('bulles : 24 miettes posées autour de toi, de six couleurs', [...Array(24)].every((_, k) => c('posee', k) === 1) && new Set([...Array(24)].map((_, k) => c('fcoul', k))).size === 6)
  b.egal('bulles : ta bulle a la palette 0 (le bleu)', jeu.gb.mmu.read(0xfe03) & 7, 0)
  // la caméra suit : à droite pendant 2 secondes, 120 pixels (60 par seconde), et l'écran glisse d'autant
  const x0 = X(0), cam0 = v('czx') * 256 + v('cpx')
  jeu.gb.setButton('right', true); jeu.avancer(120); jeu.gb.setButton('right', false)
  b.verifier('bulles : à 3 de masse, 60 pixels par seconde', Math.abs(X(0) - x0 - 120) <= 2, ` (${X(0) - x0} pixels en 2 s)`)
  b.verifier('bulles : la caméra suit (le fond glisse d’autant)', Math.abs(v('czx') * 256 + v('cpx') - cam0 - (X(0) - x0)) <= 1)
  // les sept IA bougent toutes seules
  const avant = [...Array(7)].map((_, k) => [X(k + 1), Y(k + 1)])
  jeu.avancer(120)
  b.verifier('bulles : les sept IA bougent toutes seules', avant.every(([x, y], k) => X(k + 1) !== x || Y(k + 1) !== y))

  // la carte : SELECT l'ouvre, le jeu attend, SELECT la ferme
  appuyer('select')
  const figees = [...Array(8)].map((_, i) => X(i))
  jeu.avancer(60)
  b.verifier('bulles : SELECT ouvre la carte, et le jeu attend', v('etat') === 3 && figees.every((x, i) => X(i) === x) && jeu.ecran(6, 0, 8).map((x) => ORDRE[x]).join('') === 'LA CARTE')
  b.verifier('bulles : sur la carte, un point par bulle, dans sa couleur', [1, 2, 3, 4, 5, 6, 7].every((i) => !c('vivante', i) || (jeu.gb.mmu.read(0xfe00 + i * 4 + 3) & 7) === i))
  appuyer('select')
  b.verifier('bulles : SELECT ramène au jeu', v('etat') === 1)

  // se manger : toi (20) contre une IA de 5, posée sur toi → tu la manges, tu prends sa masse
  masse(0, 20); placer(1, X(0) + 2, Y(0) + 2); masse(1, 5)
  jeu.avancer(6)
  b.verifier('bulles : tu manges une IA plus petite (20 + 5 = 25)', c('vivante', 1) === 0 && c('masse', 0) === 25, ` (masse ${c('masse', 0)})`)
  // deux bulles trop proches en masse : 10 contre 9 (il faut un quart de plus) → personne ne mange
  masse(0, 10); placer(2, X(0), Y(0)); masse(2, 9)
  jeu.avancer(6)
  b.verifier('bulles : 10 contre 9, trop proches : personne ne mange', c('vivante', 0) === 1 && c('vivante', 2) === 1 && c('masse', 0) === 10)
  // une IA (30) mange une IA (5), loin de toi
  placer(3, 600, 600); masse(3, 30); placer(4, 604, 604); masse(4, 5)
  jeu.avancer(30)
  b.verifier('bulles : une IA mange une autre IA (30 + 5 = 35)', c('vivante', 4) === 0 && c('masse', 3) === 35, ` (vivante ${c('vivante', 4)}, masse ${c('masse', 3)})`)
  // une IA (30) posée sur toi (10) → elle te mange, la partie est finie
  placer(5, X(0) - 4, Y(0) - 4); masse(5, 30)
  jeu.avancer(6)
  b.verifier('bulles : une IA plus grosse te mange : fini', v('etat') === 2 && c('vivante', 0) === 0 && v('gagne') === 0)

  // un joueur : fuit les plus grosses, court après les plus petites, sinon la miette la plus proche
  start()
  let iaMangees = 0, loin = false
  const tailles = new Set()
  const vivantes = [1, 1, 1, 1, 1, 1, 1, 1]
  for (let f = 0; f < 60 * 300 && v('etat') === 1; f++) {
    const [x, y] = M(0), m0 = c('masse', 0)
    let danger = null, proie = null, dd = 999, dp = 999, but = null
    for (let j = 1; j < 8; j++) {
      if (!c('vivante', j)) continue
      const [a, e] = M(j), d = Math.max(Math.abs(a - x), Math.abs(e - y)), mj = c('masse', j)
      if (mj >= m0 + (m0 >> 2) + 1 && d < 56 && d < dd) { dd = d; danger = [a, e] }
      if (m0 >= mj + (mj >> 2) + 1 && d < 70 && d < dp) { dp = d; proie = [a, e] }
    }
    let dx, dy
    if (danger) {
      dx = x < danger[0] ? -1 : 1; dy = y < danger[1] ? -1 : 1
      if (x < 20 || x > 2980) dx = 0
      if (y < 20 || y > 2980) dy = 0
    } else {
      but = proie
      if (!but) { let m = 999; for (let k = 0; k < 24; k++) { if (!c('posee', k)) continue; const a = c('fzx', k) * 256 + c('fpx', k), e = c('fzy', k) * 256 + c('fpy', k), d = Math.max(Math.abs(a - x), Math.abs(e - y)); if (d < m) { m = d; but = [a, e] } } }
      if (!but) but = [x + 50, y]
      dx = but[0] > x + 1 ? 1 : but[0] < x - 1 ? -1 : 0; dy = but[1] > y + 1 ? 1 : but[1] < y - 1 ? -1 : 0
    }
    jeu.gb.setButton('right', dx > 0); jeu.gb.setButton('left', dx < 0); jeu.gb.setButton('down', dy > 0); jeu.gb.setButton('up', dy < 0)
    jeu.avancer(1)
    tailles.add(c('taille', 0))
    if (Math.abs(X(0) - 1480) > 256 || Math.abs(Y(0) - 1480) > 256) loin = true
    for (let j = 1; j < 8; j++) { const w = c('vivante', j); if (vivantes[j] && !w) iaMangees++; vivantes[j] = w }
  }
  for (const t of ['right', 'left', 'up', 'down']) jeu.gb.setButton(t, false)
  jeu.avancer(10)
  b.verifier('bulles : en jouant, la bulle grandit marche après marche', tailles.size >= 5, ` (${tailles.size} tailles sur 10)`)
  b.verifier('bulles : on voyage dans le monde (plus de 256 pixels du départ)', loin)
  b.verifier('bulles : la partie va jusqu’au bout', v('etat') === 2, ` (masse ${c('masse', 0)}, gagné ${v('gagne')}, ${iaMangees} IA mangées)`)
  b.egal('bulles : le record est la meilleure masse', v('record'), Math.max(c('masse', 0), 25))
  start()
  b.verifier('bulles : START rejoue, de nouveau toute petite', v('etat') === 1 && c('masse', 0) === 3)
  // plus gros, plus lent : 80 de masse (60 - 80/4 - 80/8 = 30 pixels par seconde ; une miette ou deux en route le ralentissent à peine)
  masse(0, 80)
  jeu.gb.setButton('left', true); jeu.avancer(10)
  const x1 = X(0); jeu.avancer(120); const parcouru = x1 - X(0)
  jeu.gb.setButton('left', false)
  b.verifier('bulles : plus gros, plus lent (80 de masse : 30 pixels par seconde, contre 60 au départ)', parcouru >= 54 && parcouru <= 62, ` (${parcouru} pixels en 2 s)`)
  masse(0, 3)
  for (let f = 0; f < 60 * 180 && v('etat') === 1; f++) jeu.avancer(1)
  b.verifier('bulles : sans bouger, une IA finit par te manger', v('etat') === 2 && c('vivante', 0) === 0 && v('gagne') === 0)
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

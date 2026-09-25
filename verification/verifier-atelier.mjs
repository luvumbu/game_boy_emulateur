/**
 * L'atelier de tuiles tient-il ses promesses ?
 *
 *   node verifier-atelier.mjs
 *
 * On ouvre vraiment la page dans un Chrome sans interface, on clique vraiment
 * dans la grille de dessin, et on vérifie les trois choses qui comptent :
 *
 *   1. le TEXTE du programme change — c'est lui la source ;
 *   2. la CARTOUCHE recompilée contient les octets du nouveau dessin ;
 *   3. l'ÉCRAN de la console montre la tuile modifiée.
 *
 * Un éditeur graphique qui ne ferait que la première serait un joli mensonge.
 */

import { spawn } from 'node:child_process'
import { existsSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { signesDe, enUnSeulAlphabet } from '../editeur-tuiles.js'
import { servirLAtelier } from '../outils/serveur-essai.mjs'
import { NOMS_PROPOSES, NOMS_LUTINS_PROPOSES } from '../editeur-couleurs.js'

/* Un serveur à lui, sur le dossier du projet : plus besoin de XAMPP (voir outils/serveur-essai.mjs). */
const ADRESSE = await servirLAtelier()
const PORT = 9224

const chrome = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  process.env.LOCALAPPDATA + '/Google/Chrome/Application/chrome.exe',
  'C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe',
].find((c) => c && existsSync(c))
if (!chrome) throw new Error('Chrome introuvable')

const profil = join(tmpdir(), 'gameboy3-atelier')
rmSync(profil, { recursive: true, force: true })

const navigateur = spawn(chrome, [
  '--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profil}`,
  '--no-first-run', '--disable-gpu', '--window-size=1280,900', ADRESSE,
], { stdio: 'ignore' })

const patienter = (ms) => new Promise((r) => setTimeout(r, ms))

let cible = null
for (let i = 0; i < 40 && !cible; i++) {
  await patienter(250)
  try {
    const liste = await (await fetch(`http://localhost:${PORT}/json/list`)).json()
    cible = liste.find((t) => t.type === 'page' && t.url.startsWith(ADRESSE))
  } catch { /* pas encore prêt */ }
}
if (!cible) { navigateur.kill(); throw new Error('Chrome n’a pas ouvert la page') }

const prise = new WebSocket(cible.webSocketDebuggerUrl)
await new Promise((r) => prise.addEventListener('open', r))

let prochainId = 1
const attentes = new Map()
prise.addEventListener('message', (e) => {
  const m = JSON.parse(e.data)
  const a = attentes.get(m.id)
  if (!a) return
  attentes.delete(m.id)
  if (m.error) a.rejeter(new Error(m.error.message))
  else a.resoudre(m.result)
})
const envoyer = (methode, params = {}) =>
  new Promise((resoudre, rejeter) => {
    const id = prochainId++
    attentes.set(id, { resoudre, rejeter })
    prise.send(JSON.stringify({ id, method: methode, params }))
  })

async function evaluer(expression) {
  const { result, exceptionDetails } = await envoyer('Runtime.evaluate', {
    expression, returnByValue: true, awaitPromise: true,
  })
  if (exceptionDetails) throw new Error(exceptionDetails.exception?.description ?? 'erreur dans la page')
  return result.value
}

/** De vraies touches, comme une main : le champ reçoit des événements clavier. */
async function taper(texte) {
  for (const signe of texte) {
    await envoyer('Input.dispatchKeyEvent', { type: 'keyDown', text: signe, key: signe })
    await envoyer('Input.dispatchKeyEvent', { type: 'keyUp', key: signe })
    await patienter(30)
  }
}

/** Un vrai clic de souris, aux coordonnées de la page. */
async function cliquer(x, y) {
  for (const type of ['mousePressed', 'mouseReleased']) {
    await envoyer('Input.dispatchMouseEvent', {
      type, x, y, button: 'left', clickCount: 1, buttons: type === 'mousePressed' ? 1 : 0,
    })
    await patienter(40)
  }
  await patienter(120)
}

let echecs = 0
const controle = (quoi, bon, detail = '') => {
  console.log('  ' + (bon ? 'OK ' : 'NON') + ' ' + quoi + detail)
  if (!bon) echecs++
}

console.log('L’ATELIER DE TUILES, PILOTÉ DANS UN VRAI NAVIGATEUR')
console.log()

/*
 * Ce contrôle CRÉE des projets.
 *
 * « ✦ Nouveau » écrit un dossier à chaque nom qu'on lui donne — c'est
 * précisément ce qu'il vérifie — et la section des noms lui en donne huit. Il
 * ne doit pour autant rien laisser dans le dossier de travail de quelqu'un, ni
 * effacer un projet qu'il n'a pas créé : on relève ce qui est là AVANT, et l'on
 * n'ôte à la fin que ce qui est apparu depuis.
 */
const SERVICE_PROJETS = ADRESSE + 'projets.php'
const listerLesProjets = async () => {
  try {
    const lu = await (await fetch(`${SERVICE_PROJETS}?quoi=liste`)).json()
    return (lu.projets ?? []).map((p) => p.nom)
  } catch {
    return [] /* sans service, il n'y a rien à ranger */
  }
}
const dejaLa = new Set(await listerLesProjets())

try {
  await envoyer('Runtime.enable')
  await patienter(2500) // le module se charge, Mario se lit et se compile
  /* Les premiers contrôles peignent des NUMÉROS de nuance : en « 🎮 Game Boy — 4 nuances ».
     La partie « en couleur » repasse en couleur plus bas. */
  await evaluer(`(function () { const l = document.getElementById('console-cible'); l.value = 'gb'; l.dispatchEvent(new Event('change')) })()`)
  await patienter(1500)

  /* --- la bande des tuiles --- */
  const nombre = await evaluer(`document.querySelectorAll('#bande .tuile:not(.neuve)').length`)
  controle('les tuiles du programme sont montrées', nombre === 6,
    ` (${nombre} : quatre de huit, deux de seize)`)

  const noms = await evaluer(`[...document.querySelectorAll('#bande .tuile:not(.neuve) span')].map(s => s.textContent).join(' ')`)
  controle('elles portent leur nom', noms === 'SOL BRIQUE PIECE DRAPEAU MARIO ENNEMI', ` (${noms})`)

  /* Un dessin de seize occupe quatre numéros de tuile. Si l'atelier comptait
     comme le compilateur ne compte pas, le numéro annoncé serait faux, et le
     programme écrit d'après lui poserait la mauvaise tuile. */
  const titres = await evaluer(`[...document.querySelectorAll('#bande .tuile:not(.neuve)')].map(b => b.title).join(' | ')`)
  controle('les tuiles de huit se suivent une à une', titres.includes('SOL — 8 × 8, tuile numéro 44'), '')
  controle('celles de seize en occupent quatre',
    titres.includes('MARIO — 16 × 16, tuile numéro 48 à 51') && titres.includes('ENNEMI — 16 × 16, tuile numéro 52 à 55'),
    `\n      ${titres.split(' | ').slice(4).join('\n      ')}`)

  /* --- on en choisit une --- */
  await evaluer(`[...document.querySelectorAll('#bande .tuile')].find(b => b.title.startsWith('SOL')).click()`)
  await patienter(300)
  controle('cliquer une tuile ouvre la grille', await evaluer(`!document.getElementById('grille').classList.contains('vide')`))
  controle('la grille annonce son numéro',
    (await evaluer(`document.querySelector('#grille .aide').textContent`)).includes('poser(x, y, SOL)'))

  /* --- on dessine, pour de vrai --- */
  const avant = await evaluer(`document.getElementById('source').value`)
  const rangeeAvant = avant.split('Tuile SOL = {')[1].split('}')[0].split(String.fromCharCode(10))[1].trim()

  const cadre = await evaluer(`(document.querySelector('#grille .toile').scrollIntoView({ block: 'center' }), JSON.stringify(document.querySelector('#grille .toile').getBoundingClientRect()))`)
  const { x, y, width, height } = JSON.parse(cadre)

  /* La nuance la plus claire, puis le coin haut-gauche de la tuile. */
  await evaluer(`document.querySelectorAll('#grille .paint-pastille')[0].click()`)
  await cliquer(x + width / 16, y + height / 16)
  await patienter(600)

  const apres = await evaluer(`document.getElementById('source').value`)
  const rangeeApres = apres.split('Tuile SOL = {')[1].split('}')[0].split(String.fromCharCode(10))[1].trim()

  controle('peindre change le PROGRAMME', apres !== avant,
    `\n      avant  : ${rangeeAvant}\n      après  : ${rangeeApres}`)
  controle('et seulement le pixel visé', rangeeApres === '"0' + rangeeAvant.slice(2),
    ` (${rangeeApres})`)

  /* --- la cartouche a suivi --- */
  const etat = await evaluer(`document.getElementById('etat').className`)
  controle('la cartouche se recompile sans erreur', !etat.includes('erreur'))

  /* La tuile SOL porte le numéro 44 : ses seize octets commencent en $8000
     + 44 × 16. Le premier pixel de la première rangée doit être devenu clair,
     c'est-à-dire zéro dans les deux plans. */
  const octets = await evaluer(`inspecteur.memoire(0x8000 + 44 * 16, 2)`)
  controle('la MÉMOIRE VIDÉO de la console a suivi', (octets[0] & 0x80) === 0 && (octets[1] & 0x80) === 0,
    ` (premiers octets : ${octets.join(', ')})`)

  /* --- on dessine un personnage de seize --- */

  await evaluer(`[...document.querySelectorAll('#bande .tuile')].find(b => b.title.startsWith('MARIO')).click()`)
  await patienter(400)
  const cadre16 = JSON.parse(await evaluer(`(document.querySelector('#grille .toile').scrollIntoView({ block: 'center' }), JSON.stringify(document.querySelector('#grille .toile').getBoundingClientRect()))`))
  const avant16 = await evaluer(`document.getElementById('source').value`)

  /* La onzième colonne : au-delà de huit, donc dans la moitié DROITE du
     personnage — celle qui part dans une autre tuile. */
  await evaluer(`document.querySelectorAll('#grille .paint-pastille')[3].click()`)
  await cliquer(cadre16.x + (cadre16.width * 10.5) / 16, cadre16.y + cadre16.height / 32)
  await patienter(600)

  const apres16 = await evaluer(`document.getElementById('source').value`)
  /* La rangée telle qu'elle est écrite dans le fichier : guillemet, seize
     chiffres, guillemet, virgule. On ne garde que les chiffres. */
  const rangee16 = apres16.split('Perso MARIO = {')[1].split('}')[0]
    .split(String.fromCharCode(10))[1].trim().replace(/[^0-3]/g, '')
  controle('un personnage de seize se peint sur seize colonnes',
    apres16 !== avant16 && rangee16.length === 16 && rangee16[10] === '3',
    ` (${rangee16} — la onzième colonne)`)

  const octets16 = await evaluer(`inspecteur.memoire(0x8000 + 49 * 16, 2)`)
  /* Le pixel 10 du personnage est le pixel 2 de la moitié droite, donc le
     BIT 5 des deux plans — le pixel le plus à gauche est le bit 7. */
  controle('et le pixel touché part dans la SECONDE tuile',
    (octets16[0] & 0x20) !== 0 && (octets16[1] & 0x20) !== 0,
    ` (tuile 49, premiers octets : ${octets16.join(', ')} — il faut le bit 5)`)

  /* --- une tuile toute neuve --- */

  await evaluer(`[...document.querySelectorAll('#bande .neuve')][0].click()`)
  /* La page DEMANDE le nom : on le tape et l'on valide, comme un visiteur. */
  await patienter(400)
  await evaluer("document.getElementById('nom-champ').value = 'CAILLOU'")
  await evaluer("document.getElementById('boite-nom').requestSubmit()")
  await patienter(700)
  const apresNeuve = await evaluer(`document.getElementById('source').value`)
  controle('« + tuile 8 × 8 » écrit du code, sous le nom demandé', apresNeuve.includes('Tuile CAILLOU = {'),
    ` (${(await evaluer(`document.querySelectorAll('#bande .tuile:not(.neuve)').length`))} tuiles)`)

  await evaluer(`[...document.querySelectorAll('#bande .neuve')][1].click()`)
  /* La page DEMANDE le nom : on le tape et l'on valide, comme un visiteur. */
  await patienter(400)
  await evaluer("document.getElementById('nom-champ').value = 'GEANT'")
  await evaluer("document.getElementById('boite-nom').requestSubmit()")
  await patienter(700)
  const apresPerso = await evaluer(`document.getElementById('source').value`)
  controle('« + perso 16 × 16 » aussi', apresPerso.includes('Perso GEANT = {'),
    ` (${(await evaluer(`document.querySelectorAll('#bande .tuile:not(.neuve)').length`))} tuiles)`)
  controle('et la cartouche compile toujours',
    !(await evaluer(`document.getElementById('etat').className`)).includes('erreur'),
    ` (${(await evaluer(`document.getElementById('etat').textContent.split(String.fromCharCode(10))[1]`))})`)

  /* --- changer d'exemple remet l'atelier d'accord --- */
  await evaluer(`
    const l = document.getElementById('exemples')
    l.value = 'bonjour'
    l.dispatchEvent(new Event('change', { bubbles: true }))
  `)
  await patienter(1600)
  const apresChangement = await evaluer(`document.querySelectorAll('#bande .tuile:not(.neuve)').length`)
  controle('changer d’exemple vide la bande', apresChangement === 0,
    ` (${apresChangement} tuiles — « bonjour » n’en dessine aucune)`)
  controle('et la grille se referme', await evaluer(`document.getElementById('grille').classList.contains('vide')`))
  /* ------------------- la tuile n'a pas de couleur : la palette en a une ----- */

  /*
   * Une tuile porte quatre NUMÉROS de teinte, et rien d'autre. La couleur vient
   * de la palette de la case où on la pose — d'où le sélecteur « vue avec la
   * palette ». Sans lui, l'atelier montrait éternellement le vert d'origine
   * alors que le jeu tournait en couleur juste à côté, et l'on croyait que la
   * couleur ne marchait pas.
   */
  await evaluer(`(function () {
    const c = document.getElementById('console-cible')
    c.value = 'gbc'
    c.dispatchEvent(new Event('change'))
    const l = document.getElementById('exemples')
    l.value = 'couleur'
    l.dispatchEvent(new Event('change', { bubbles: true }))
  })()`)
  await patienter(2200)
  await evaluer(`document.querySelector('#bande .tuile:not(.neuve)')?.click()`)
  await patienter(500)

  /* Plus de palette « de vue » à choisir : UNE rangée de couleurs, le nuancier,
     avec les vraies couleurs du programme — voir « barre-paint.js ». */
  /* Les 4 palettes du jeu, une rangée chacune (voir « barre-paint.js »). */
  controle('en couleur, l’atelier montre les 8 palettes du jeu (0 à 7)',
    (await evaluer(`document.querySelectorAll('#grille .paint-groupe').length`)) === 8)
  const enCouleurs = await evaluer(
    `[...document.querySelectorAll('#grille .paint-pastille')].map((p) => p.style.background).join(' | ')`)
  controle('les pastilles montrent les vraies couleurs du programme',
    enCouleurs.includes('rgb(') && enCouleurs.split(' | ').length > 4, ` (${enCouleurs.split(' | ').length} couleurs)`)

  /* ------------------- l'atelier des couleurs écrit dans le programme -------- */

  /*
   * Regarder une palette ne suffit pas : il faut pouvoir la DÉFINIR.
   *
   * Les palettes qu'un programme ne pose pas gardent le dégradé vert d'origine
   * — c'est pourquoi, avant cet atelier, changer de palette de vue ne montrait
   * souvent que du vert. On vérifie donc la chaîne entière : une couleur
   * choisie à la souris devient une ligne de C++, qui devient une cartouche en
   * couleur, qui devient une palette dans la console.
   */
  await evaluer(`document.getElementById('onglet-couleurs').click()`)
  await patienter(500)

  const pastilles = await evaluer(
    `document.querySelectorAll('.couleurs-carte input[type="color"]').length`)
  controle('les 8 palettes ont leurs quatre teintes', pastilles === 32, ` (${pastilles} pastilles)`)

  await evaluer(`(function () {
    const c = document.querySelectorAll('.couleurs-carte')[0].querySelectorAll('input')[1]
    c.value = '#ff0000'
    c.dispatchEvent(new Event('input'))
  })()`)
  await patienter(1600)

  const ecrit = await evaluer(`document.getElementById('source').value`)
  controle('choisir une couleur l’écrit dans le programme',
    /couleurFond\(0, 1, 31, 0, 0\)/.test(ecrit))
  controle('le programme devient une cartouche en couleur',
    (await evaluer(`inspecteur.rom[0x0143]`)) === 0xc0)
  controle('et la console porte vraiment la nouvelle teinte',
    (await evaluer(`inspecteur.gb.ppu.bgPalettes[2] | inspecteur.gb.ppu.bgPalettes[3] << 8`)) === 31,
    ' (rouge pur : 31, 0, 0)')

  /* La teinte 0 d'un lutin ne s'affiche jamais : la proposer serait promettre
     un effet qui n'arrive pas. */
  await evaluer(`[...document.querySelectorAll('button')].find((b) => b.textContent === '🧍 Les personnages').click()`)
  await patienter(400)
  controle('la teinte transparente des lutins n’est pas modifiable',
    (await evaluer(`document.querySelectorAll('.couleurs-carte')[0].querySelectorAll('input')[0].disabled`)) === true)

  /*
   * La GRILLE aussi doit suivre la palette, et non les seules pastilles.
   *
   * Les nuances étaient posées entre les deux peintres : le canevas sortait
   * dans les couleurs de la palette précédente, et l'on voyait des pastilles
   * brique au-dessus d'une brique bleue. On lit donc un vrai pixel du canevas.
   */
  await evaluer(`document.getElementById('onglet-tuiles').click()`)
  await patienter(400)
  await evaluer(`[...document.querySelectorAll('#bande .tuile:not(.neuve)')].find((b) => b.title.includes('8 × 8'))?.click()`)
  await patienter(500)

  /* Le pixel est rendu sous la MÊME forme que « style.background », pour que
     les deux se comparent sans passer par une expression régulière — une
     regex écrite dans un littéral gabarit se fait manger ses antislashs. */
  const pixelDe = `(function () {
    const t = document.querySelector('#grille canvas')
    const d = t.getContext('2d').getImageData(2, 2, 1, 1).data
    return 'rgb(' + d[0] + ', ' + d[1] + ', ' + d[2] + ')'
  })()`

  /* Le pixel de la grille est l'une des couleurs du nuancier : la grille et
     la rangée disent la même chose. */
  const pixelVu = await evaluer(pixelDe)
  const nuancier = await evaluer(
    `[...document.querySelectorAll('#grille .paint-pastille')].map((p) => p.style.background)`)
  /* À une unité près : le navigateur arrondit parfois les couleurs du canevas. */
  const composantes = (c) => (c.match(/\d+/g) ?? []).map(Number)
  const proche = (a, b) => composantes(a).length === 3 && composantes(a).every((v, i) => Math.abs(v - composantes(b)[i]) <= 2)
  controle('la grille emploie une couleur du nuancier',
    nuancier.some((c) => proche(c, pixelVu)), ` (${pixelVu} parmi ${nuancier.join(' | ')})`)

  /* ------------------- seize couleurs proposées d'emblée -------------------- */

  /*
   * Les palettes qu'un programme ne pose pas restent au vert d'origine : on
   * ouvre l'atelier, on ne voit que du vert, et l'on croit que la couleur ne
   * marche pas. Le bouton en pose SEIZE — quatre palettes — et laisse les
   * quatre dernières libres.
   */
  await evaluer(`document.getElementById('onglet-couleurs').click()`)
  await patienter(500)

  const bouton = await evaluer(
    `[...document.querySelectorAll('button')].find((b) => b.textContent.startsWith('✦ Remplir'))?.textContent`)
  controle('l’atelier propose seize couleurs', bouton === '✦ Remplir les 16 palettes', ` (« ${bouton} »)`)

  await evaluer(
    `[...document.querySelectorAll('button')].find((b) => b.textContent.startsWith('✦ Remplir')).click()`)
  await patienter(1800)

  const seize = await evaluer(`(function () {
    const p = inspecteur.gb.ppu
    const vues = new Set()
    for (let i = 0; i < 16; i++) vues.add(p.bgPalettes[i * 2] | p.bgPalettes[i * 2 + 1] << 8)
    return vues.size
  })()`)
  controle('les quatre premières palettes portent seize teintes DIFFÉRENTES',
    seize === 16, ` (${seize})`)

  const libres = await evaluer(`(function () {
    const p = inspecteur.gb.ppu
    const vues = new Set()
    for (let i = 16; i < 32; i++) vues.add(p.bgPalettes[i * 2] | p.bgPalettes[i * 2 + 1] << 8)
    return vues.size
  })()`)
  /* Les huit sont proposées (PROPOSEES_PAR_DEFAUT = 8) : quatre palettes restées au vert
     d'origine faisaient des aperçus qui se répétaient. Les quatre dernières ont donc AUSSI leurs couleurs. */
  controle('et les quatre dernières ont aussi leurs couleurs', libres > 4,
    ` (${libres} teintes différentes)`)

  const nommees = await evaluer(
    `[...document.querySelectorAll('.couleurs-carte .aide')].map((s) => s.textContent).filter(Boolean).join(' ')`)
  controle('chacune dit à quoi elle sert',
    nommees === NOMS_PROPOSES.join(' ') || nommees === NOMS_LUTINS_PROPOSES.join(' '), ` (${nommees})`)

  /*
   * L'atelier des couleurs pose seize teintes : il y a donc DEUX cartouches.
   *
   * Celle qui tourne est le « .gbc », et elle exige la couleur — la Game Boy
   * d'origine a désormais son propre fichier, sans un octet de palette, plutôt
   * qu'une cartouche en couleur dont elle ignorait la moitié.
   */
  controle('et le programme devient une cartouche en couleur',
    (await evaluer(`inspecteur.rom[0x0143]`)) === 0xc0)

const uneSeule = await evaluer(`inspecteur.cartouches`)
  controle('une seule cartouche, en couleur — jamais les deux',
    uneSeule.length === 1 && uneSeule[0].extension === '.gbc',
    ` (${uneSeule.map((c) => `${c.extension} ${c.octets} octets`).join(', ')})`)

  /* ------------------ le projet, et son dossier sur le disque -------------- */

  /*
   * « Où suis-je en train de travailler ? »
   *
   * Un programme gardé dans le stockage du navigateur ne se trouve nulle part
   * sur le disque, et rien à l'écran ne disait où allait ce qu'on écrivait.
   * Un projet est maintenant un DOSSIER, et le bandeau le nomme en
   * permanence — travailler une heure dans le mauvais projet est une heure
   * perdue que rien ne rattrape.
   */
  const NOM_ESSAI = 'essai atelier'
  const DOSSIER_ESSAI = 'essai_atelier'
  await fetch(`${ADRESSE}projets.php?quoi=supprimer`, {
    method: 'POST', body: JSON.stringify({ projet: DOSSIER_ESSAI }),
  }).catch(() => {})

  controle('le bandeau du projet est là', await evaluer(`!!document.getElementById('bandeau-projet')`))

  await evaluer(`document.getElementById('nouveau').click()`)
  await patienter(450)
  await evaluer(`(function () {
    const c = document.getElementById('nom-champ')
    c.value = ${JSON.stringify(NOM_ESSAI)}
    c.dispatchEvent(new Event('input'))
  })()`)
  await evaluer(`document.getElementById('boite-nom').requestSubmit()`)
  /* « ✦ Nouveau » demande ensuite : en couleur, ou en 4 nuances — « en couleur ». */
  await patienter(300)
  await evaluer(`document.querySelector('#console-choix [data-console="gbc"]')?.click()`)
  await patienter(3000)

  controle('créer un jeu crée son DOSSIER, sous un nom de dossier',
    (await evaluer(`document.getElementById('projet-nom').textContent`)) === DOSSIER_ESSAI,
    ` (« ${await evaluer(`document.getElementById('projet-nom').textContent`)} »)`)

  const chemin = await evaluer(`document.getElementById('projet-chemin').title`)
  controle('et le bandeau dit le chemin complet, pas seulement le nom',
    chemin.includes('/projets/' + DOSSIER_ESSAI), ` (${chemin})`)

  /* Ce qui compte : le dossier existe VRAIMENT, et il contient le programme. */
  const surLeDisque = await (await fetch(
    `${ADRESSE}projets.php?quoi=ouvrir&projet=${DOSSIER_ESSAI}`)).json()
  controle('le programme est sur le disque, pas seulement à l’écran',
    typeof surLeDisque.fichiers?.['principal.cpp'] === 'string' &&
    surLeDisque.fichiers['principal.cpp'].includes('int main()'))

  /*
   * Et le dossier garde LES DEUX cartouches.
   *
   * Un projet en couleur qui n'emporterait que son « .gbc » ne se jouerait pas
   * sur une Game Boy d'origine, et rien dans le dossier ne dirait pourquoi.
   */
  const listeDuDisque = await (await fetch(ADRESSE + 'projets.php?quoi=liste')).json()
  const sienDuDisque = (listeDuDisque.projets ?? []).find((p) => p.nom === DOSSIER_ESSAI)
  controle('le dossier garde SA cartouche — en couleur, le « .gbc », seul',
    (sienDuDisque?.cartouches ?? []).join(' ') === 'gbc',
    ` (${DOSSIER_ESSAI}.${(sienDuDisque?.cartouches ?? ['—']).join(`, ${DOSSIER_ESSAI}.`)})`)

  /*
   * « ✦ Nouveau » quand on est DÉJÀ dans un projet.
   *
   * Il gardait le dossier d'avant. On tapait un nom, aucun dossier
   * n'apparaissait sur le disque, le jeu n'entrait dans aucune liste — et la
   * compilation suivante écrivait le programme vide PAR-DESSUS le projet
   * précédent. Deux pertes d'un seul clic : le jeu qu'on croyait créer, et
   * celui qu'on avait.
   */
  const SUITE = 'essai_atelier_2'
  const MARQUE = 'LE TRAVAIL DE LA VEILLE'
  const oter = (quoi) => fetch(ADRESSE + 'projets.php?quoi=supprimer', {
    method: 'POST', body: JSON.stringify({ projet: quoi }),
  }).catch(() => {})
  const lireLeDisque = async (quoi) => (await (await fetch(
    `${ADRESSE}projets.php?quoi=ouvrir&projet=${quoi}`)).json()).fichiers ?? {}

  await oter(SUITE)

  /* Quelque chose qu'on reconnaîtra dans le projet d'avant. */
  await evaluer(`document.getElementById('source').value = ${JSON.stringify(
    `// ${MARQUE}\nint main() { texte(4, 6, "VEILLE"); while (true) { image(); } return 0; }\n`)}`)
  await evaluer(`document.getElementById('lancer').click()`)
  await patienter(2200)

  await evaluer(`document.getElementById('nouveau').click()`)
  await patienter(450)
  await evaluer(`(function () {
    const c = document.getElementById('nom-champ')
    c.value = 'essai atelier 2'
    c.dispatchEvent(new Event('input'))
  })()`)
  await evaluer(`document.getElementById('boite-nom').requestSubmit()`)
  /* « ✦ Nouveau » demande ensuite : en couleur, ou en 4 nuances — « en couleur ». */
  await patienter(300)
  await evaluer(`document.querySelector('#console-choix [data-console="gbc"]')?.click()`)
  await patienter(3200)

  controle('« Nouveau » dans un projet ouvert en crée un AUTRE',
    (await evaluer(`document.getElementById('projet-nom').textContent`)) === SUITE,
    ` (« ${await evaluer(`document.getElementById('projet-nom').textContent`)} »)`)
  controle('et son dossier est sur le disque, avec son programme',
    typeof (await lireLeDisque(SUITE))['principal.cpp'] === 'string')

  const veille = await lireLeDisque(DOSSIER_ESSAI)
  controle('le projet d’avant est INTACT — rien n’a été écrit par-dessus',
    (veille['principal.cpp'] ?? '').includes(MARQUE),
    ` (${(veille['principal.cpp'] ?? '(vide)').slice(0, 40).replace(/\s+/g, ' ')}…)`)

  /*
   * Et l'on y revient PAR LE BOUTON « 📂 Ouvrir ».
   *
   * Le lecteur n'avait qu'une porte : le bandeau, dont rien ne dit qu'il se
   * clique. Retrouver son travail ne doit pas se deviner.
   */
  await evaluer(`document.getElementById('projets-ouvrir').click()`)
  await patienter(1600)
  controle('« 📂 Ouvrir » montre tous les projets du disque',
    (await evaluer(`document.getElementById('voile-projets').hidden`)) === false &&
    (await evaluer(`document.querySelectorAll('.projet-carte').length`)) >= 2,
    ` (${await evaluer(`document.querySelectorAll('.projet-carte').length`)} projets)`)

  await evaluer(`[...document.querySelectorAll('.projet-carte')]
    .find((c) => c.querySelector('.projet-nom').textContent === ${JSON.stringify(DOSSIER_ESSAI)})
    .querySelector('button.principal').click()`)
  await patienter(2600)
  controle('et en ouvrir un rend son travail à l’écran',
    (await evaluer(`document.getElementById('source').value`)).includes(MARQUE))

  await oter(SUITE)

  /* Une capture devient la vignette du projet. */
  await evaluer(`document.getElementById('capture').click()`)
  await patienter(1600)

  await evaluer(`document.getElementById('bandeau-projet').click()`)
  await patienter(1600)
  controle('le lecteur de projets s’ouvre',
    (await evaluer(`document.getElementById('voile-projets').hidden`)) === false)
  controle('il montre le dossier où tout vit',
    (await evaluer(`document.getElementById('projets-dossier').textContent`)).endsWith('/projets'),
    ` (${await evaluer(`document.getElementById('projets-dossier').textContent`)})`)

  const cartes = await evaluer(
    `[...document.querySelectorAll('.projet-carte .projet-nom')].map((n) => n.textContent)`)
  controle('le projet y est, avec les autres', cartes.includes(DOSSIER_ESSAI), ` (${cartes.join(', ')})`)
  controle('et il porte sa vignette, prise de la console',
    await evaluer(`!!document.querySelector('.projet-carte.ouvert .projet-vignette img')`))

  /*
   * On supprime PAR LE BOUTON, comme un visiteur — et non derrière le dos de
   * la page. Effacer le dossier par le service pendant que la page le croit
   * ouvert la laissait enregistrer dans le vide à chaque compilation, et
   * l'encadré d'état se remplissait d'erreurs qui n'avaient plus de rapport
   * avec le programme. C'est arrivé, et c'est ce contrôle-ci qui l'a montré.
   */
  await evaluer(`window.confirm = () => true`)
  await evaluer(`[...document.querySelectorAll('.projet-carte')]
    .find((c) => c.querySelector('.projet-nom').textContent === ${JSON.stringify(DOSSIER_ESSAI)})
    .querySelector('.danger').click()`)
  await patienter(1600)

  const restants = await evaluer(
    `[...document.querySelectorAll('.projet-carte .projet-nom')].map((n) => n.textContent)`)
  controle('supprimer ôte le projet du lecteur, et son dossier du disque',
    !restants.includes(DOSSIER_ESSAI), ` (${restants.join(', ') || 'plus aucun projet'})`)
  controle('et la page n’est plus dans aucun projet',
    (await evaluer(`document.getElementById('projet-nom').textContent`)) === 'aucun projet')

  /* Le bandeau ne dit plus seulement « aucun projet » : il dit combien
     attendent sur le disque, sans quoi on croit qu'il n'y en a aucun. */
  const ditCombien = await evaluer(`document.getElementById('projet-chemin').textContent`)
  controle('et il dit combien de projets attendent sur le disque',
    restants.length
      ? ditCombien.startsWith(`${restants.length} projet`)
      : ditCombien.includes('pas encore dans un dossier'),
    ` (${ditCombien})`)

  await evaluer(`document.getElementById('projets-fermer').click()`)
  await patienter(300)

  /* --------------- remonter au C++, et tirer ce qui se tire ---------------- */

  /*
   * Deux boutons, deux promesses, et elles ne sont pas la même.
   *
   * « ⇱ Retour au C++ » ne marche que sur une cartouche faite par CE
   * compilateur : il reconnaît ses formes. « ⚠ CONVERSION » marche sur
   * n'importe quelle cartouche, et ne rend que ce qui a un format fixe — les
   * dessins, le décor, les palettes, les mots. Le contrôle éprouve les deux, et
   * surtout que chacun DIT ce qu'il a pu faire.
   */
  await evaluer(`(function () {
    const l = document.getElementById('exemples')
    l.value = 'bonjour'
    l.dispatchEvent(new Event('change'))
  })()`)
  await patienter(2600)

  controle('le bouton « Retour au C++ » est là',
    await evaluer(`!!document.getElementById('retour-cpp')`))

  await evaluer(`document.getElementById('retour-cpp').click()`)
  await patienter(1500)

  const rapport = await evaluer(`document.getElementById('etat').textContent`)
  controle('il annonce la part remontée, sans arrondir en sa faveur',
    /\d+ instructions sur \d+ remontées \(\d+ %\)/.test(rapport), `
      « ${rapport.split(String.fromCharCode(10))[0]} »`)

  const remonte = await evaluer(`document.getElementById('source').value`)
  controle('et le programme remonté porte le C++ du programme d’origine',
    remonte.includes('texte(6, 4, "BONJOUR")') && remonte.includes('while (true)') &&
    remonte.includes('if (bouton(A))'),
    `
      ${remonte.split('*/')[1].trim().split(String.fromCharCode(10)).slice(0, 3).join(' / ')}`)

  controle('il dit franchement que ce n’est pas le programme d’origine',
    remonte.includes('ce n’est pas le programme d’origine'))

  /* On le recompile DANS LA PAGE : c'est la seule preuve qui vaille. */
  await evaluer(`document.getElementById('lancer').click()`)
  await patienter(1200)
  controle('le programme remonté recompile dans la page',
    !(await evaluer(`document.getElementById('etat').className`)).includes('erreur'),
    ` (${await evaluer(`document.getElementById('etat').textContent.split(String.fromCharCode(10))[1]`)})`)

  /* Et la conversion, qui elle ne demande rien à personne. */
  await evaluer(`document.getElementById('convertir').click()`)
  await patienter(1500)
  const tire = await evaluer(`document.getElementById('etat').textContent`)
  controle('« CONVERSION » rend les dessins, le décor et les mots',
    tire.includes('dessins') && tire.includes('cases de décor') && tire.includes('mots'),
    `
      « ${tire.split(String.fromCharCode(10))[0]} »`)

  const fichierTire = await evaluer(`document.getElementById('source').value`)
  controle('et ce qu’elle écrit est du C++ complet, pas une liste de dessins',
    fichierTire.includes('int main() {') && fichierTire.includes('  poser(') && fichierTire.includes('  texte('))

  /* ------------- peindre ne change pas l'ÉCRITURE d'un dessin -------------- */

  /*
   * Une tuile s'écrit en « 0123 » ou en « .-+# », jamais dans les deux.
   *
   * L'atelier posait le CHIFFRE de la nuance, quelle que soit l'écriture du
   * dessin : un « 3 » tombait au milieu d'un vaisseau écrit en « .-+# », le
   * compilateur refusait le mélange — à juste titre —, et la faute était
   * annoncée sur la ligne de la déclaration, seize rangées plus haut que le
   * pixel qu'on venait de peindre. Repeindre à la souris rendait le programme
   * incompilable : le contraire de ce que l'atelier promet.
   */
  await evaluer(`(function () {
    const l = document.getElementById('exemples')
    l.value = 'lutin'
    l.dispatchEvent(new Event('change'))
  })()`)
  await patienter(2600)

  /* L'onglet des couleurs est resté ouvert depuis la section d'avant : la
     grille des tuiles est donc cachée, et un clic de souris ne l'atteindrait
     pas. On revient dessus d'abord. */
  await evaluer(`document.getElementById('onglet-tuiles').click()`)
  await patienter(300)
  await evaluer(`[...document.querySelectorAll('#bande .tuile')].find((b) => b.title.startsWith('BALLE')).click()`)
  await patienter(400)
  const cadreSignes = JSON.parse(
    await evaluer(`(document.querySelector('#grille .toile').scrollIntoView({ block: 'center' }), JSON.stringify(document.querySelector('#grille .toile').getBoundingClientRect()))`))
  await evaluer(`document.querySelectorAll('#grille .paint-pastille')[3].click()`)
  /* Le coin haut-gauche de BALLE est un « . » : peint en nuance 3, il doit
     devenir « # », et surtout pas « 3 ». */
  await cliquer(cadreSignes.x + cadreSignes.width / 16, cadreSignes.y + cadreSignes.height / 16)
  await patienter(700)

  const balle = (await evaluer(`document.getElementById('source').value`))
    .split('Tuile BALLE = {')[1].split('}')[0]
  /* La première rangée était « ..####.. » : le pixel peint doit l'avoir
     changée. Sans cette exigence, le contrôle passerait aussi bien si RIEN
     n'avait été peint — un dessin en signes ne contient jamais de chiffre. */
  const premiere = balle.split(',')[0].split(String.fromCharCode(10)).join('').trim()
  controle('peindre écrit dans l’écriture du dessin — des signes, pas des chiffres',
    premiere === '"#.####.."' && !/[0-9]/.test(balle),
    ` (${premiere})`)
  controle('et le programme reste compilable',
    !(await evaluer(`document.getElementById('etat').className`)).includes('erreur'),
    ` (${await evaluer(`document.getElementById('etat').textContent.split(String.fromCharCode(10))[1]`)})`)

  /*
   * Et un dessin DÉJÀ mélangé se répare au premier trait.
   *
   * Le mélange est dans les fichiers de ceux qui ont peint avant le correctif :
   * il faut bien qu'il en sorte, et sûrement pas en traduisant seize rangées à
   * la main. C'est la majorité qui décide du sens, et aucun pixel ne bouge.
   */
  const abime = [
    '.......##.......', '.......##.......', '......####......', '......#++#...3..',
    '.....##++##..3..', '.....#+--+#..3..', '....##+--+##.3..', '....#++++++#.3..',
    '...##++++++##3..', '..##++####++##..', '..#++#....#++#..', '.##+##....##+##.',
    '.#+##......##+#.', '.###........###.', '..#..........#..', '................',
  ]
  const repare = enUnSeulAlphabet(abime, signesDe(abime))
  const nuance = (signe) => ({ '.': 0, '-': 1, '+': 2, '#': 3, 0: 0, 1: 1, 2: 2, 3: 3 })[signe]
  controle('un dessin déjà mélangé revient à une seule écriture',
    signesDe(abime).join('') === '.-+#' && repare.every((r) => !/[0-9]/.test(r)),
    ` (${repare[3]})`)
  controle('et pas un pixel n’a changé au passage',
    abime.every((r, y) => [...r].every((signe, x) => nuance(signe) === nuance(repare[y][x]))))

  /* --------------------------- le bouton « Nouveau » ------------------------ */

  controle('le bouton « Nouveau » est là', await evaluer(`!!document.getElementById('nouveau')`))
  await evaluer(`document.getElementById('nouveau').click()`)
  await patienter(400)
  controle('il demande un nom avant d’effacer quoi que ce soit',
    (await evaluer(`document.getElementById('voile').hidden`)) === false)

  const tailleAvant = await evaluer(`document.getElementById('source').value.length`)
  /* On renonce par le bouton qui sert à cela. Cliquer le voile ne ferme rien
     — la boîte serait restée ouverte, et le contrôle aurait mesuré un
     programme intact pour la seule raison qu'il ne s'était rien passé. */
  await evaluer(`document.getElementById('nom-annuler').click()`)
  await patienter(300)
  controle('et renoncer ne touche pas au programme',
    (await evaluer(`document.getElementById('voile').hidden`)) === true &&
    (await evaluer(`document.getElementById('source').value.length`)) === tailleAvant)

  /*
   * Le nom que la page PROPOSE doit passer tel quel.
   *
   * « MON JEU » porte un espace. La boîte lui appliquait la règle des noms de
   * tuiles — une lettre, puis des lettres, des chiffres ou « _ » — et refusait
   * donc ce qu'elle venait d'écrire elle-même dans le champ. Un champ qui
   * refuse sa propre proposition n'est pas une garde : c'est une impasse, et
   * le bouton « Nouveau » n'aboutissait jamais.
   */
  await evaluer(`document.getElementById('nouveau').click()`)
  await patienter(400)
  const proposeNeuf = await evaluer(`document.getElementById('nom-champ').value`)
  await evaluer(`document.getElementById('boite-nom').requestSubmit()`)
  /* « ✦ Nouveau » demande ensuite : en couleur, ou en 4 nuances — « en couleur ». */
  await patienter(300)
  await evaluer(`document.querySelector('#console-choix [data-console="gbc"]')?.click()`)
  await patienter(1200)
  controle('le nom qu’il PROPOSE est accepté tel quel',
    (await evaluer(`document.getElementById('voile').hidden`)) === true && proposeNeuf === 'mon_jeu',
    ` (« ${proposeNeuf} » — ${await evaluer(`document.getElementById('nom-faute').textContent`)})`)

  const neuf = await evaluer(`document.getElementById('source').value`)
  controle('et le programme repart de la page blanche, sous ce nom',
    neuf.includes('texte(4, 6, "MON JEU")') && neuf.includes('int main()'),
    ` (${neuf.split(String.fromCharCode(10)).length} lignes)`)

  controle('la cartouche neuve compile',
    !(await evaluer(`document.getElementById('etat').className`)).includes('erreur'),
    ` (${(await evaluer(`document.getElementById('etat').textContent.split(String.fromCharCode(10))[1]`))})`)

  /* Le titre est LU DANS LA CARTOUCHE, à l'endroit où la console le lit : il
     ne suffit pas que le réglage ait changé quelque part dans la page. */
  const grave = await evaluer(
    `[...inspecteur.rom.slice(0x0134, 0x0143)].map((o) => String.fromCharCode(o)).join('').replace(/\\0+$/, '')`)
  controle('et le titre gravé dans l’en-tête découle du nom du projet', grave === 'MON JEU',
    ` (« ${grave} »)`)

  /*
   * Ce que la console ne sait pas écrire est ARRANGÉ, jamais refusé.
   *
   * La boîte renvoyait la personne corriger elle-même un accent ou un espace
   * que la page savait parfaitement corriger — et elle refusait « MON JEU »,
   * qu'elle proposait pourtant d'elle-même. Elle arrange, et elle montre ce
   * qu'elle a arrangé avant de valider : arranger en silence échangerait un
   * refus contre une surprise.
   */
  await evaluer(`document.getElementById('nouveau').click()`)
  await patienter(400)
  await evaluer(`(function () {
    const c = document.getElementById('nom-champ')
    c.value = 'Café Crème & Cie'
    c.dispatchEvent(new Event('input'))
  })()`)
  await patienter(200)
  const annonce = await evaluer(`document.getElementById('nom-faute').textContent`)
  controle('la boîte annonce le nom de dossier qu’elle retiendra',
    (await evaluer(`document.getElementById('nom-faute').hidden`)) === false &&
    annonce.includes('cafe_creme_cie'), ` (« ${annonce} »)`)

  await evaluer(`document.getElementById('boite-nom').requestSubmit()`)
  await patienter(300)
  await evaluer(`document.querySelector('#console-choix [data-console="gbc"]')?.click()`)
  await patienter(1200)
  const graveArrange = await evaluer(
    `[...inspecteur.rom.slice(0x0134, 0x0143)].map((o) => String.fromCharCode(o)).join('').replace(/\\0+$/, '')`)
  /* Le titre gravé DÉCOULE du nom du projet : « cafe_creme_cie » donne
     « CAFE CREME », onze caractères, tout ce que l'en-tête accepte. */
  controle('et le titre gravé en découle, taillé à onze caractères',
    graveArrange === 'CAFE CREME', ` (« ${graveArrange} »)`)

  /* Trop long : taillé à onze, sous les yeux, et non en silence après coup. */
  await evaluer(`document.getElementById('nouveau').click()`)
  await patienter(400)
  await evaluer(`(function () {
    const c = document.getElementById('nom-champ')
    c.value = 'un nom de projet beaucoup trop long pour un dossier raisonnable'
    c.dispatchEvent(new Event('input'))
  })()`)
  await evaluer(`document.getElementById('boite-nom').requestSubmit()`)
  /* « ✦ Nouveau » demande ensuite : en couleur, ou en 4 nuances — « en couleur ». */
  await patienter(300)
  await evaluer(`document.querySelector('#console-choix [data-console="gbc"]')?.click()`)
  await patienter(1200)
  const graveCoupe = await evaluer(
    `[...inspecteur.rom.slice(0x0134, 0x0143)].map((o) => String.fromCharCode(o)).join('').replace(/\\0+$/, '')`)
  controle('un nom très long donne un titre de onze caractères',
    graveCoupe === 'UN NOM DE P', ` (« ${graveCoupe} »)`)

  /*
   * Et surtout : PAS DE DOUBLON.
   *
   * On redemande trois fois le même nom de tuile. Deux « SOL » dans un
   * programme, c'est une redéclaration que le compilateur refuse — et la faute
   * tomberait loin de la boîte qui l'a créée.
   */
  await evaluer(`(function () {
    const l = document.getElementById('exemples')
    l.value = 'mario'
    l.dispatchEvent(new Event('change'))
  })()`)
  await patienter(2600)

  const donnes = []
  for (const tape of ['SOL', 'SOL', 'mon héros (1)', '3 cailloux']) {
    await evaluer(`[...document.querySelectorAll('#bande .neuve')][0].click()`)
    await patienter(450)
    await evaluer(`(function () {
      const c = document.getElementById('nom-champ')
      c.value = ${JSON.stringify(tape)}
      c.dispatchEvent(new Event('input'))
    })()`)
    await evaluer(`document.getElementById('boite-nom').requestSubmit()`)
    await patienter(1000)
    donnes.push(tape)
  }

  const nomsFinaux = await evaluer(`inspecteurDessins().map((d) => d.nom)`)
  controle('quatre noms demandés, quatre tuiles de plus',
    nomsFinaux.length === 6 + donnes.length, ` (${nomsFinaux.join(' ')})`)
  controle('et aucun doublon, même en redemandant deux fois « SOL »',
    nomsFinaux.length === new Set(nomsFinaux).size, ` (${nomsFinaux.join(' ')})`)
  controle('un nom à accents et à parenthèses devient un identifiant',
    nomsFinaux.includes('MON_HEROS_1'), ` (${nomsFinaux.join(' ')})`)
  controle('un nom qui commence par un chiffre reçoit une lettre devant',
    nomsFinaux.some((n) => /^[A-Z_]/.test(n) && n.includes('CAILLOUX')),
    ` (${nomsFinaux.find((n) => n.includes('CAILLOUX'))})`)
  controle('et le programme compile toujours',
    !(await evaluer(`document.getElementById('etat').className`)).includes('erreur'),
    ` (${await evaluer(`document.getElementById('etat').textContent.split(String.fromCharCode(10))[1]`)})`)

  /* ------------ un jeu neuf sur une Game Boy d'ORIGINE ---------------------- */

  /*
   * « Nouveau » écrivait seize couleurs, même sur une console qui les refuse.
   *
   * Un jeu neuf ne doit pas s'ouvrir sur huit palettes vertes : le bouton pose
   * donc seize teintes d'emblée. Mais sur une Game Boy d'ORIGINE,
   * « couleurFond() » est refusé — et le programme neuf s'ouvrait sur une
   * faute, ligne 10, dans un fichier que personne n'avait encore écrit. Le
   * premier geste du bouton ne peut pas être de casser ce qu'il vient de créer.
   */
  await evaluer(`(function () {
    const l = document.getElementById('console-cible')
    l.value = 'gb'
    l.dispatchEvent(new Event('change'))
  })()`)
  await patienter(1400)

  controle('sur une console d’origine, l’atelier des couleurs dit pourquoi il est vide',
    (await evaluer(`document.getElementById('atelier-couleurs').textContent`)).includes('Game Boy d’origine'))

  await evaluer(`document.getElementById('nouveau').click()`)
  await patienter(450)
  await evaluer(`document.getElementById('boite-nom').requestSubmit()`)
  /* Pour quelle console : celle d'origine — c'est tout l'objet de ce contrôle. */
  await patienter(300)
  await evaluer(`document.querySelector('#console-choix [data-console="gb"]')?.click()`)
  await patienter(1800)

  controle('un jeu neuf n’y écrit aucune couleur',
    (await evaluer(`document.getElementById('source').value.includes('couleurFond')`)) === false)
  controle('et il COMPILE, au lieu de s’ouvrir sur une faute',
    !(await evaluer(`document.getElementById('etat').className`)).includes('erreur'),
    ` (${await evaluer(`document.getElementById('etat').textContent.split(String.fromCharCode(10))[1]`)})`)
  controle('la console le joue',
    (await evaluer(`new Set(inspecteur.gb.framebuffer).size`)) > 1)

  /* En couleur, les seize teintes reviennent : la garde n'a rien ôté à qui en veut. */
  await evaluer(`(function () {
    const l = document.getElementById('console-cible')
    l.value = 'gbc'
    l.dispatchEvent(new Event('change'))
  })()`)
  await patienter(1200)
  await evaluer(`document.getElementById('nouveau').click()`)
  await patienter(450)
  await evaluer(`document.getElementById('boite-nom').requestSubmit()`)
  /* « ✦ Nouveau » demande ensuite : en couleur, ou en 4 nuances — « en couleur ». */
  await patienter(300)
  await evaluer(`document.querySelector('#console-choix [data-console="gbc"]')?.click()`)
  await patienter(1800)

  controle('en couleur, le jeu neuf retrouve ses seize teintes',
    (await evaluer(`document.getElementById('source').value.includes('couleurFond')`)) === true &&
    !(await evaluer(`document.getElementById('etat').className`)).includes('erreur'))

  /*
   * Le PREMIER dessin se pose SOUS l'en-tête.
   *
   * Il s'écrivait tout en haut du fichier — avant le commentaire qui nomme le
   * jeu, avant les « #include ». Le programme ne s'ouvrait plus sur ce qu'il
   * fait mais sur seize rangées de guillemets, et sa propre présentation se
   * retrouvait enterrée au milieu. C'est le programme NEUF qui le montre : lui
   * seul n'a encore aucun dessin.
   */
  await evaluer(`[...document.querySelectorAll('#bande .neuve')][0].click()`)
  await patienter(450)
  await evaluer(`(function () {
    const c = document.getElementById('nom-champ')
    c.value = 'HEROS'
    c.dispatchEvent(new Event('input'))
  })()`)
  await evaluer(`document.getElementById('boite-nom').requestSubmit()`)
  await patienter(1400)

  const neufAvecTuile = await evaluer(`document.getElementById('source').value`)
  controle('le premier dessin ne passe pas DEVANT l’en-tête du programme',
    neufAvecTuile.trimStart().startsWith('/*'),
    ` (le programme s’ouvre sur « ${neufAvecTuile.trimStart().split(String.fromCharCode(10))[0]} »)`)
  /* « int main() » est CITÉ dans l’en-tête du programme neuf : on cherche la
     déclaration, en début de ligne, et non les mots. */
  const ouMain = neufAvecTuile.search(/^int main()/m)
  const ouDessin = neufAvecTuile.search(/^(?:Tuile|Perso) HEROS/m)
  controle('il se pose entre l’en-tête et « int main() »',
    ouDessin > 0 && ouMain > ouDessin,
    ` (en-tête, puis le dessin en ${ouDessin}, puis « int main() » en ${ouMain})`)
  controle('et le programme compile toujours',
    !(await evaluer(`document.getElementById('etat').className`)).includes('erreur'),
    ` (${await evaluer(`document.getElementById('etat').textContent.split(String.fromCharCode(10))[1]`)})`)
  /* ---------------- le code qu'on tape, et la console qui suit -------------- */

  /*
   * On tape dans le code, et la console ne bouge pas.
   *
   * C'est VOULU : la page ne recompile pas à chaque touche, parce que la
   * moitié d'un mot n'est jamais du C++ valide et qu'on n'afficherait que des
   * fautes. Mais rien ne le disait. On modifiait le programme d'une leçon, la
   * console continuait de jouer la version d'avant, et l'on en concluait que
   * le code n'était pas modifiable — alors qu'il l'était depuis le début.
   */
  /* Le curseur À LA FIN du programme : ce qu'on ajoute là ne coupe rien en
     deux, et le contrôle mesure la frappe, pas notre adresse à viser. */
  const auBout = `(function () {
    const s = document.getElementById('source')
    s.focus()
    s.setSelectionRange(s.value.length, s.value.length)
    return s.value.length
  })()`
  /* Ce contrôle porte sur le cas où la page NE recompile PAS en écrivant :
     on éteint donc le réglage le temps de la mesure, et on le remet après. */
  await evaluer(`reglages.poser('compilerEnEcrivant', false)`)
  await evaluer(auBout)
  const avantFrappe = await evaluer(`document.getElementById('source').value`)
  await taper('// essai')
  await patienter(500)

  const apresFrappe = await evaluer(`document.getElementById('source').value`)
  controle('le programme se tape vraiment, touche par touche',
    apresFrappe !== avantFrappe && apresFrappe.endsWith('// essai'))
  controle('et la console DIT qu’elle joue une version plus ancienne',
    (await evaluer(`document.getElementById('perime').hidden`)) === false,
    ` (« ${await evaluer(`document.getElementById('perime').textContent`)} »)`)

  await evaluer(`document.getElementById('lancer').click()`)
  await patienter(900)
  controle('« Compiler et lancer » remet les deux d’accord, et le bandeau part',
    (await evaluer(`document.getElementById('perime').hidden`)) === true &&
    !(await evaluer(`document.getElementById('etat').className`)).includes('erreur'))

  /* Une faute arrête la console : la marque doit nommer LA FAUTE, et non une
     pause — c'est la première chose qu'on lit en cherchant pourquoi c'est figé. */
  const sain = await evaluer(`document.getElementById('source').value`)

  /* Une ligne neuve, puis un mot qui n'est rien : le compilateur refuse, et la
     console s'arrête. Écrit à la suite du commentaire, le même mot n'aurait
     rien cassé — un contrôle qui passe pour cette raison-là ne contrôle rien. */
  await evaluer(auBout)
  await envoyer('Input.dispatchKeyEvent', {
    type: 'keyDown', key: 'Enter', text: String.fromCharCode(13), windowsVirtualKeyCode: 13, nativeVirtualKeyCode: 13,
  })
  await envoyer('Input.dispatchKeyEvent', {
    type: 'keyUp', key: 'Enter', windowsVirtualKeyCode: 13, nativeVirtualKeyCode: 13,
  })
  await taper('zzz')
  await evaluer(`document.getElementById('lancer').click()`)
  await patienter(900)

  const marqueFaute = await evaluer(`document.getElementById('en-pause').textContent`)
  controle('un programme qui ne compile pas arrête la console, et la marque le dit',
    (await evaluer(`document.getElementById('etat').className`)).includes('erreur') &&
    marqueFaute.includes('ne compile pas'), `\n      « ${marqueFaute} »`)

  /* On remet le programme sain et l'on recompile : la suite en a besoin. */
  await evaluer(`(function () {
    const s = document.getElementById('source')
    s.value = ${JSON.stringify(sain)}
    s.dispatchEvent(new Event('input'))
  })()`)
  await evaluer(`document.getElementById('lancer').click()`)
  await patienter(900)
  await evaluer(`reglages.poser('compilerEnEcrivant', true)`)
  controle('et la faute corrigée, la console repart',
    !(await evaluer(`document.getElementById('etat').className`)).includes('erreur') &&
    (await evaluer(`document.getElementById('en-pause').hidden`)) === true)

  /* --------------------- une console arrêtée doit le DIRE -------------------- */

  /*
   * « Démarrer en pause » coché, la console ne joue pas une seule image.
   *
   * Ce n'est pas une panne, c'est le réglage — mais l'écran, lui, est une
   * dalle unie, et rien ne l'en distingue. On a cherché pourquoi « les leçons
   * ne se chargent pas » alors que tout marchait : le programme était chargé,
   * la cartouche compilée, et la console attendait qu'on la lance.
   *
   * Le contrôle exige donc que l'état soit ÉCRIT SUR L'ÉCRAN, et qu'il dise sa
   * cause. Un état invisible se paie en temps perdu, et deux fois.
   */
  await evaluer(`reglages.poser('pauseAuDemarrage', true)`)
  await evaluer(`document.getElementById('lancer').click()`)
  await patienter(900)

  controle('« Démarrer en pause » laisse bien la console arrêtée',
    (await evaluer(`inspecteur.tourne`)) === false)
  controle('et l’écran le DIT, au lieu de rester vide',
    (await evaluer(`document.getElementById('en-pause').hidden`)) === false)

  const marque = await evaluer(`document.getElementById('en-pause').textContent`)
  controle('la marque nomme la cause', marque.includes('Démarrer en pause'), `\n      « ${marque} »`)
  controle('et le bouton propose de reprendre',
    (await evaluer(`document.getElementById('pause').textContent`)).includes('Reprendre'))

  await evaluer(`document.getElementById('pause').click()`)
  await patienter(700)
  controle('« Reprendre » lance la console et efface la marque',
    (await evaluer(`inspecteur.tourne`)) === true &&
    (await evaluer(`document.getElementById('en-pause').hidden`)) === true)
  controle('et l’écran montre enfin quelque chose',
    (await evaluer(`new Set(inspecteur.gb.framebuffer).size`)) > 1,
    ` (${await evaluer(`new Set(inspecteur.gb.framebuffer).size`)} nuances)`)

  await evaluer(`reglages.poser('pauseAuDemarrage', false)`)

  /* ------------- compiler, ou non, à l'ouverture de la page ---------------- */

  /*
   * Le réglage existe ; ce qui manquait, c'est ce qu'il laisse à l'écran.
   *
   * « Décoché, la console reste noire jusqu'au premier clic » : une console
   * noire sans un mot, c'est une panne pour qui ne se souvient plus d'avoir
   * décoché quoi que ce soit. Elle le dit maintenant, et elle nomme le
   * réglage — c'est la seule façon de le retrouver.
   */
  controle('le réglage « compiler à l’ouverture » est dans le panneau',
    await evaluer(`!!document.getElementById('reglage-compilerAuChargement')`))
  controle('et il est coché par défaut',
    (await evaluer(`document.getElementById('reglage-compilerAuChargement').checked`)) === true)
  controle('« recompiler en écrivant » l’est aussi désormais',
    (await evaluer(`document.getElementById('reglage-compilerEnEcrivant').checked`)) === true)

  await evaluer(`reglages.poser('compilerAuChargement', false)`)
  await patienter(300)
  await envoyer('Page.reload')
  await patienter(4200)

  controle('décoché, la page n’a plus de cartouche à l’ouverture',
    (await evaluer(`inspecteur.rom === null`)) === true)
  const attente = await evaluer(`document.getElementById('en-pause').textContent`)
  controle('et la console dit qu’elle attend, en nommant le réglage',
    (await evaluer(`document.getElementById('en-pause').hidden`)) === false &&
    attente.includes('Compiler dès l’ouverture'), `
      « ${attente} »`)

  await evaluer(`document.getElementById('lancer').click()`)
  await patienter(1200)
  controle('« Compiler et lancer » la met en route',
    (await evaluer(`document.getElementById('en-pause').hidden`)) === true &&
    (await evaluer(`new Set(inspecteur.gb.framebuffer).size`)) > 1)

  await evaluer(`reglages.poser('compilerAuChargement', true)`)

} finally {
  /* On n'efface que les projets NÉS pendant le contrôle. */
  for (const nom of await listerLesProjets()) {
    if (dejaLa.has(nom)) continue
    await fetch(`${SERVICE_PROJETS}?quoi=supprimer`, {
      method: 'POST', body: JSON.stringify({ projet: nom }),
    }).catch(() => {})
  }

  prise.close()
  navigateur.kill()
  try { rmSync(profil, { recursive: true, force: true }) } catch { /* il partira seul */ }
}

console.log()
console.log(echecs ? echecs + ' contrôle(s) en échec' : 'tout est vert')
process.exit(echecs ? 1 : 0)

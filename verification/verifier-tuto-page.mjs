/**
 * La page du tutoriel tient-elle debout ?
 *
 *   node verifier-tuto-page.mjs
 *
 * `verifier-tuto.ts` contrôle déjà que le CODE de chaque leçon fait ce qu'il
 * promet. Ici, on contrôle la PAGE : on ouvre vraiment
 * `l’atelier tuto.html` dans un Chrome sans interface, on
 * clique chaque leçon du sommaire, et on vérifie qu'elle s'affiche, se compile
 * et tourne. Une leçon qui n'apparaît pas n'enseigne rien.
 */

import { spawn } from 'node:child_process'
import { existsSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { LECONS, numeros, principales } from '../tuto/lecons.js'
import { servirLAtelier } from '../outils/serveur-essai.mjs'

/*
 * Le numéro de la leçon du plan est CHERCHÉ, jamais recopié.
 *
 * Il était écrit en clair. En insérant trois leçons avant elle, le contrôle
 * s'est mis à ouvrir la mauvaise page et à se plaindre que l'outil manquait —
 * il manquait, en effet, sur une leçon qui n'en a pas.
 */
const LECON_DU_PLAN = LECONS.findIndex((lecon) => lecon.plan)
const LECON_DES_AIRS = LECONS.findIndex((lecon) => lecon.airs)
const LECON_DU_DESSIN = LECONS.findIndex((lecon) => lecon.dessin)

/* Un serveur à lui, sur le dossier du projet : plus besoin de XAMPP (voir outils/serveur-essai.mjs). */
const BASE = await servirLAtelier()
const ADRESSE = BASE + 'tuto.html'
const PORT = 9226

const chrome = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  process.env.LOCALAPPDATA + '/Google/Chrome/Application/chrome.exe',
  'C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe',
].find((c) => c && existsSync(c))
if (!chrome) throw new Error('Chrome introuvable')

const profil = join(tmpdir(), 'gameboy3-tuto')
rmSync(profil, { recursive: true, force: true })

const navigateur = spawn(chrome, [
  '--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profil}`,
  '--no-first-run', '--disable-gpu', '--window-size=1280,960', ADRESSE,
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

/** Un vrai clic de souris, aux coordonnées de la page. */
async function cliquerLa(x, y) {
  for (const type of ['mousePressed', 'mouseReleased']) {
    await envoyer('Input.dispatchMouseEvent',
      { type, x, y, button: 'left', clickCount: 1, buttons: type === 'mousePressed' ? 1 : 0 })
    await patienter(60)
  }
  await patienter(150)
}

let echecs = 0
const controle = (quoi, bon, detail = '') => {
  console.log('  ' + (bon ? 'OK ' : 'NON') + ' ' + quoi + detail)
  if (!bon) echecs++
}

console.log('LA PAGE DU TUTORIEL, PILOTÉE DANS UN VRAI NAVIGATEUR')
console.log()

try {
  await envoyer('Runtime.enable')
  await patienter(2200)

  const combien = await evaluer(`document.querySelectorAll('#sommaire li.lecon').length`)
  /* Le nombre n'est pas recopié : il vient des leçons elles-mêmes. Un nombre
     écrit à la main devient faux le jour où l'on ajoute une leçon, et le
     contrôle se met alors à mesurer autre chose sans le dire. */
  controle('le sommaire liste toutes les leçons', combien === LECONS.length,
    ` (${combien} sur ${LECONS.length})`)
  controle('la première est ouverte', (await evaluer(`document.getElementById('titre').textContent`)).length > 3,
    ` (« ${await evaluer(`document.getElementById('titre').textContent`)} »)`)
  controle('elle compile', !(await evaluer(`document.getElementById('etat').className.includes('erreur')`)),
    ` (${await evaluer(`document.getElementById('etat').textContent.split(String.fromCharCode(10))[0]`)})`)

  console.log()

  /* --- chaque leçon, une par une --- */
  for (let i = 0; i < combien; i++) {
    await evaluer(`document.querySelectorAll('#sommaire button')[${i}].click()`)
    await patienter(500)

    const titre = await evaluer(`document.getElementById('titre').textContent`)
    const rate = await evaluer(`document.getElementById('etat').className.includes('erreur')`)
    const etat = await evaluer(`document.getElementById('etat').textContent.split(String.fromCharCode(10))[0]`)
    const codeVide = (await evaluer(`document.getElementById('source').value.length`)) < 20
    const explique = await evaluer(`document.querySelectorAll('#explication p').length`)
    const avoir = await evaluer(`document.getElementById('avoir').textContent`)
    const nuances = await evaluer(`inspecteur.nuances()`)

    /* Une leçon qui efface finit sur un écran vide : c'est ce qu'elle annonce. */
    const videVoulu = LECONS[i].aVoir.includes('l’écran reste vide')
    const bon = !rate && !codeVide && explique > 0 && avoir.length > 25 && (nuances > 1 || videVoulu)
    controle(`${i + 1}. ${titre}`, bon,
      ` — ${etat}, ${explique} paragraphe${explique > 1 ? 's' : ''}, ${nuances} nuances` +
      (rate ? ' — NE COMPILE PAS' : '') + (codeVide ? ' — CODE VIDE' : '') +
      (avoir.length <= 25 ? ' — RIEN À VOIR ANNONCÉ' : ''))
  }

  console.log()

  /* --- la navigation --- */
  await evaluer(`document.querySelectorAll('#sommaire button')[0].click()`)
  await patienter(400)
  controle('sur la première, « précédent » est éteint', await evaluer(`document.getElementById('precedent').disabled`))

  await evaluer(`document.getElementById('suivant').click()`)
  await patienter(400)
  controle('« suivant » avance d’une leçon',
    (await evaluer(`document.querySelector('#sommaire li.active button').textContent`)) === LECONS[1].titre)

  /* Le bouton dit OÙ il mène : c'est ce qui fait qu'on enchaîne. */
  const promesse = await evaluer(`document.getElementById('suivant').textContent`)
  controle('et il annonce la leçon d’après par son nom', promesse.includes(LECONS[2].titre),
    ` (« ${promesse} »)`)

  controle('l’adresse retient la leçon', (await evaluer(`location.hash`)) === '#lecon-2',
    ` (${await evaluer(`location.hash`)})`)

  /* --- le code est modifiable, et « remettre » le remet --- */
  await evaluer(`
    const t = document.getElementById('source')
    t.value = 'int main() { texte(1, 1, "ESSAI"); while (true) { image(); } return 0; }'
    document.getElementById('lancer').click()
  `)
  await patienter(500)
  controle('un code modifié se compile', !(await evaluer(`document.getElementById('etat').className.includes('erreur')`)))

  await evaluer(`document.getElementById('remettre').click()`)
  await patienter(400)
  controle('« remettre » rend le code de la leçon',
    (await evaluer(`document.getElementById('source').value`)) === LECONS[1].code)

  /* --- une erreur est montrée, pas avalée --- */
  await evaluer(`
    document.getElementById('source').value = 'dessiner(1, 2)'
    document.getElementById('lancer').click()
  `)
  await patienter(400)
  const message = await evaluer(`document.getElementById('etat').textContent`)
  controle('une faute est expliquée avec sa ligne',
    (await evaluer(`document.getElementById('etat').className.includes('erreur')`)) && message.includes('ligne 1'),
    `\n      « ${message.split(String.fromCharCode(10))[0].slice(0, 90)}… »`)

  /* --- le plan : poser ses tuiles à la souris --- */

  console.log()
  await evaluer(`location.hash = ''; document.querySelectorAll('#sommaire button')[${LECON_DU_PLAN}].click()`)
  await patienter(900)

  controle('la leçon du plan ouvre son outil',
    (await evaluer(`getComputedStyle(document.getElementById('planzone')).display`)) !== 'none')

  const tuiles = await evaluer(`[...document.querySelectorAll('#planzone .tuile span')].map(s => s.textContent).join(' ')`)
  controle('on VOIT les tuiles, par leur nom', tuiles === 'MUR CAISSE gomme', ` (${tuiles})`)

  const carres = await evaluer(`document.querySelectorAll('#planzone .tuile canvas').length`)
  controle('et chacune est un carré dessiné, pas un numéro', carres === 3, ` (${carres} aperçus)`)

  /* On choisit CAISSE, puis on trace une zone de trois sur deux. */
  await evaluer(`[...document.querySelectorAll('#planzone .tuile')].find(t => t.title.startsWith('CAISSE')).click()`)
  await patienter(200)

  const plan = JSON.parse(await evaluer(`JSON.stringify(document.querySelector('canvas.plan').getBoundingClientRect())`))
  const caseX = (c) => plan.x + (plan.width * (c + 0.5)) / 20
  const caseY = (l) => plan.y + (plan.height * (l + 0.5)) / 18

  const avantPlan = await evaluer(`document.getElementById('source').value`)

  await envoyer('Input.dispatchMouseEvent', { type: 'mousePressed', x: caseX(4), y: caseY(6), button: 'left', clickCount: 1, buttons: 1 })
  await patienter(80)
  await envoyer('Input.dispatchMouseEvent', { type: 'mouseMoved', x: caseX(6), y: caseY(7), button: 'left', buttons: 1 })
  await patienter(80)
  await envoyer('Input.dispatchMouseEvent', { type: 'mouseReleased', x: caseX(6), y: caseY(7), button: 'left', clickCount: 1, buttons: 0 })
  await patienter(700)

  const apresPlan = await evaluer(`document.getElementById('source').value`)
  const ajoutees = (apresPlan.match(/poser\(\d+, \d+, CAISSE\)/g) ?? []).length

  controle('tracer une zone écrit du code', apresPlan !== avantPlan)
  controle('six cases pour une zone de trois sur deux', ajoutees === 8,
    ` (${ajoutees} lignes CAISSE : 2 déjà là + 6 tracées)`)
  controle('le code porte le NOM, jamais le numéro',
    apresPlan.includes('poser(4, 6, CAISSE)') && !/poser\(\d+, \d+, 4[45]\)/.test(apresPlan),
    ` (« ${(apresPlan.match(/poser\(4, 6, [A-Z]+\)/) ?? ['introuvable'])[0]} »)`)
  controle('et la cartouche montre la tuile',
    (await evaluer(`inspecteur.gb.mmu.read(0x9800 + 6 * 32 + 4)`)) === 45,
    ` (tuile ${await evaluer(`inspecteur.gb.mmu.read(0x9800 + 6 * 32 + 4)`)} à la case (4, 6))`)

  /* La gomme remet du vide, et retire les lignes du programme. */
  await evaluer(`[...document.querySelectorAll('#planzone .tuile')].find(t => t.title.startsWith('la gomme')).click()`)
  await patienter(200)
  await envoyer('Input.dispatchMouseEvent', { type: 'mousePressed', x: caseX(4), y: caseY(6), button: 'left', clickCount: 1, buttons: 1 })
  await patienter(80)
  await envoyer('Input.dispatchMouseEvent', { type: 'mouseReleased', x: caseX(4), y: caseY(6), button: 'left', clickCount: 1, buttons: 0 })
  await patienter(700)

  const apresGomme = await evaluer(`document.getElementById('source').value`)
  controle('la gomme retire la ligne du programme', !apresGomme.includes('poser(4, 6, CAISSE)'))
  controle('et la case redevient vide à l’écran',
    (await evaluer(`inspecteur.gb.mmu.read(0x9800 + 6 * 32 + 4)`)) === 0)

  /* Ce qui est écrit hors du bloc ne doit pas bouger. */
  controle('le reste du programme est intact',
    apresGomme.includes('texte(4, 1, "TRACE UNE ZONE")') && apresGomme.includes('Tuile CAISSE = {'))

  /* --- les deux façons : la même tuile, en chiffres et à la souris --- */

  console.log()
  await evaluer(`location.hash = ''; document.querySelectorAll('#sommaire button')[${LECON_DU_DESSIN}].click()`)
  await patienter(900)

  controle('la leçon des tuiles ouvre son atelier',
    (await evaluer(`getComputedStyle(document.getElementById('dessinzone')).display`)) !== 'none')
  controle('et la tuile du programme y est, choisie d’office',
    (await evaluer(`document.querySelector('#dessinzone .tuile.choisie span')?.textContent`)) === 'BLOC')
  controle('la grille de dessin est ouverte',
    (await evaluer(`document.querySelector('#dessinzone .toile') !== null`)))

  const avantPixel = await evaluer(`document.getElementById('source').value`)

  /* La grille est cadrée AVANT d'être mesurée : un paragraphe de plus dans la
     leçon la pousse hors de l'écran, et le clic ne touche alors plus rien. */
  await evaluer(`document.querySelector('#dessinzone .toile').scrollIntoView({ block: 'center' })`)
  await patienter(300)
  const toileTuile = JSON.parse(await evaluer(
    `JSON.stringify(document.querySelector('#dessinzone .toile').getBoundingClientRect())`))

  /* La nuance la plus claire, puis le coin haut-gauche : le premier « 3 » de
     la première rangée doit devenir un « 0 » dans le texte. */
  await evaluer(`document.querySelectorAll('#dessinzone .paint-pastille')[0].click()`)
  await patienter(200)
  await cliquerLa(toileTuile.x + toileTuile.width / 16, toileTuile.y + toileTuile.height / 16)
  await patienter(700)

  const apresPixel = await evaluer(`document.getElementById('source').value`)
  const rangee = (apresPixel.match(/Tuile BLOC = \{\s*"([^"]*)"/) ?? [])[1]

  controle('peindre un pixel réécrit le PROGRAMME de la leçon', apresPixel !== avantPixel,
    ` (première rangée : « ${rangee} »)`)
  controle('et c’est bien le pixel visé', rangee === '03333333')
  controle('la cartouche suit', !(await evaluer(`document.getElementById('etat').className`)).includes('erreur'))

  /* Le repère de progression : le niveau, le numéro, l'atelier. */
  const reperes = await evaluer(`[...document.querySelectorAll('#reperes span')].map(s => s.textContent).join(' | ')`)
  controle('la leçon annonce son niveau, sa difficulté et son atelier',
    reperes.includes('Niveau 3') && reperes.includes(`leçon ${numeros(LECONS)[LECON_DU_DESSIN]} sur ${principales(LECONS)}`)
      && reperes.includes('difficulté 3 / 10') && reperes.includes('atelier'),
    `\n      ${reperes}`)

  const niveaux = await evaluer(`document.querySelectorAll('#sommaire li.partie:not(.sous-partie)').length`)
  const attendus = new Set(LECONS.map((l) => l.difficulte)).size
  controle('le sommaire est découpé en niveaux', niveaux === attendus, ` (${niveaux} niveaux sur ${attendus})`)

  /* Les parties d'un niveau (le 0 en a dix), chacune sous son titre.
     On lit le texte de chaque titre de partie du sommaire (« A. Écrire des
     lettres », « B. Le temps »…), puis on vérifie qu'il y en a autant que de
     leçons portant « partie: », et que la première commence bien par A. */
  const parties = await evaluer(`[...document.querySelectorAll('#sommaire li.sous-partie')].map(p => p.textContent)`)
  const partiesAttendues = LECONS.filter((l) => l.partie).length
  controle('le niveau 0 est découpé en parties, A, B, C…',
    parties.length === partiesAttendues && parties[0]?.startsWith('A. '),
    ` (${parties.length} parties sur ${partiesAttendues} : ${parties.slice(0, 3).join(', ')}…)`)

  /* --- la partition : écrire un air à la souris --- */

  console.log()
  await evaluer(`location.hash = ''; document.querySelectorAll('#sommaire button')[${LECON_DES_AIRS}].click()`)
  await patienter(1000)

  controle('la leçon de musique ouvre sa partition',
    (await evaluer(`getComputedStyle(document.getElementById('airzone')).display`)) !== 'none'
      && (await evaluer(`getComputedStyle(document.getElementById('planzone')).display`)) === 'none')

  const airs = await evaluer(`[...document.querySelectorAll('#bande-airs .air:not(.neuf) span')].map(s => s.textContent).join(' ')`)
  controle('les deux airs de la leçon sont montrés', airs === 'THEME BASSE', ` (${airs})`)

  await evaluer(`[...document.querySelectorAll('#bande-airs .air')].find(a => a.textContent.includes('THEME')).click()`)
  await patienter(400)
  await evaluer(`document.querySelector('#grille-airs .toile-air').scrollIntoView({ block: 'center' })`)
  await patienter(200)

  const avantAir = await evaluer(`document.getElementById('source').value`)
  const toile = JSON.parse(await evaluer(
    `JSON.stringify(document.querySelector('#grille-airs .toile-air').getBoundingClientRect())`))

  /* Le premier pas, la ligne du bas : c'est le DO4, celui par lequel l'air
     commence déjà. On vise donc la ligne juste au-dessus — un DOD4. */
  await envoyer('Input.dispatchMouseEvent',
    { type: 'mousePressed', x: toile.x + 38 + 9, y: toile.y + 22 * 9 + 4, button: 'left', clickCount: 1, buttons: 1 })
  await patienter(80)
  await envoyer('Input.dispatchMouseEvent',
    { type: 'mouseReleased', x: toile.x + 38 + 9, y: toile.y + 22 * 9 + 4, button: 'left', clickCount: 1, buttons: 0 })
  await patienter(800)

  const apresAir = await evaluer(`document.getElementById('source').value`)
  const premierPas = (apresAir.match(/Air THEME = \{\s*"([^"]*)"/) ?? [])[1]

  controle('poser une note change le PROGRAMME', apresAir !== avantAir, ` (premier pas : « ${premierPas} »)`)
  controle('et c’est la note de la ligne visée', premierPas?.startsWith('DOD4 '))
  controle('la cartouche se recompile sans faute',
    !(await evaluer(`document.getElementById('etat').className`)).includes('erreur'))
  controle('le reste de la leçon est intact',
    apresAir.includes('jouer(1, THEME, 8, 1);') && apresAir.includes('Air BASSE = {'))

  /* --- une image de la page, pour voir de ses yeux --- */
  await evaluer(`document.querySelectorAll('#sommaire button')[${LECON_DU_PLAN}].click()`)
  await patienter(900)
  const png = (await envoyer('Page.captureScreenshot', { format: 'png' })).data
  writeFileSync('images/capture-tuto.png', Buffer.from(png, 'base64'))
  console.log('\n  → images/capture-tuto.png : la page, telle qu’elle est')
} finally {
  prise.close()
  navigateur.kill()
  try { rmSync(profil, { recursive: true, force: true }) } catch { /* il partira seul */ }
}

console.log()
console.log(echecs ? echecs + ' contrôle(s) en échec' : 'tout est vert')
process.exit(echecs ? 1 : 0)

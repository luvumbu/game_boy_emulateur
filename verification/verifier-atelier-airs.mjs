/**
 * L'atelier des airs tient-il ses promesses ?
 *
 *   node verifier-atelier-airs.mjs
 *
 * Comme pour les tuiles, on ouvre vraiment la page dans un Chrome sans
 * interface, on clique vraiment dans la partition, et l'on vérifie les trois
 * choses qui comptent :
 *
 *   1. le TEXTE du programme change — c'est lui la source ;
 *   2. la CARTOUCHE se recompile sans une faute ;
 *   3. la note posée est bien celle de la ligne cliquée, et pas sa voisine.
 *
 * Un éditeur de musique qui écrirait un demi-ton à côté serait pire qu'aucun
 * éditeur : on corrigerait la partition à l'oreille sans jamais comprendre.
 */

import { spawn } from 'node:child_process'
import { existsSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { servirLAtelier } from '../outils/serveur-essai.mjs'

/* Un serveur à lui, sur le dossier du projet : plus besoin de XAMPP (voir outils/serveur-essai.mjs). */
const ADRESSE = await servirLAtelier()
const PORT = 9227

const chrome = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  process.env.LOCALAPPDATA + '/Google/Chrome/Application/chrome.exe',
  'C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe',
].find((c) => c && existsSync(c))
if (!chrome) throw new Error('Chrome introuvable')

const profil = join(tmpdir(), 'gameboy3-airs')
rmSync(profil, { recursive: true, force: true })

const navigateur = spawn(chrome, [
  '--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profil}`,
  '--no-first-run', '--disable-gpu', '--window-size=1280,900',
  /* Sans cela, le navigateur refuse d'ouvrir la sortie audio tant que personne
     n'a cliqué — et l'écoute d'un air ne pourrait pas être éprouvée. */
  '--autoplay-policy=no-user-gesture-required',
  /*
   * Le son est CALCULÉ, mais pas joué.
   *
   * « --autoplay-policy » sert à réveiller le contexte audio : sans lui il
   * reste endormi et l'on ne peut pas contrôler que du son sort. Mais un
   * navigateur sans interface sort quand même sur les haut-parleurs — et l'on
   * fait alors sonner la machine de quelqu'un à chaque passe de contrôle, ce
   * que personne n'a demandé.
   *
   * « --mute-audio » coupe la SORTIE, et elle seule : le contexte tourne, les
   * morceaux sont programmés, les échantillons comptés. Ce que le contrôle
   * mesure ne change pas d'un iota ; ce qu'on entend, si.
   */
  '--mute-audio',
  ADRESSE,
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
async function cliquer(x, y) {
  for (const type of ['mousePressed', 'mouseReleased']) {
    await envoyer('Input.dispatchMouseEvent', {
      type, x, y, button: 'left', clickCount: 1, buttons: type === 'mousePressed' ? 1 : 0,
    })
    await patienter(40)
  }
  await patienter(150)
}

let echecs = 0
const controle = (quoi, bon, detail = '') => {
  console.log('  ' + (bon ? 'OK ' : 'NON') + ' ' + quoi + detail)
  if (!bon) echecs++
}

/* Les mêmes mesures que l'atelier : si elles changent là-bas, ce contrôle doit
   changer ici, et c'est très bien — il éprouve un accord entre les deux. */
const LARGEUR_PAS = 18
const HAUTEUR_RANG = 9
const RANGS = 24
const CLAVIER = 38
const HAUTEUR_VOLUMES = 40

console.log('L’ATELIER DES AIRS, PILOTÉ DANS UN VRAI NAVIGATEUR')
console.log()

try {
  await envoyer('Runtime.enable')
  await patienter(2500) // le module se charge, Mario se lit et se compile

  /* --- l'onglet --- */
  const vu = (id) => evaluer(`document.getElementById('${id}').offsetParent !== null`)

  controle('la page s’ouvre sur l’atelier de tuiles', await vu('atelier-tuiles') && !(await vu('atelier-airs')))

  await evaluer(`document.getElementById('onglet-airs').click()`)
  await patienter(300)
  controle('l’onglet « Les airs » montre l’atelier des airs, et LUI SEUL',
    await vu('atelier-airs') && !(await vu('atelier-tuiles')))

  controle('Mario n’a pas d’air : la bande le dit',
    (await evaluer(`document.querySelector('#bande-airs .aide')?.textContent ?? ''`)).includes('Aucun air'))

  /* --- « + air » écrit du code --- */
  await evaluer(`document.querySelector('#bande-airs .air.neuf').click()`)
  /* La page DEMANDE le nom : on le tape et l'on valide, comme un visiteur. */
  await patienter(400)
  await evaluer("document.getElementById('nom-champ').value = 'THEME'")
  await evaluer("document.getElementById('boite-nom').requestSubmit()")
  await patienter(700)
  await patienter(700)

  const source = await evaluer(`document.getElementById('source').value`)
  controle('« + air » écrit un Air dans le programme', source.includes('Air THEME = {'),
    `\n      ${source.split('\n').slice(0, 3).join('\n      ')}`)
  controle('de huit pas de silence', (source.split('Air THEME = {')[1].split('}')[0].match(/"--"/g) ?? []).length === 8)
  controle('et il est aussitôt choisi',
    await evaluer(`document.querySelector('#bande-airs .air.choisi') !== null`))
  controle('la partition s’ouvre',
    await evaluer(`document.querySelector('#grille-airs .toile-air') !== null`))

  const etatNeuf = await evaluer(`document.getElementById('etat').className`)
  controle('la cartouche compile avec un air vide', !etatNeuf.includes('erreur'), ` (${etatNeuf})`)

  /* --- on pose une note, pour de vrai --- */

  /* La position de la partition se relit AVANT chaque clic : poser une note
     rafraîchit la bande des airs, dont la hauteur change — viser d'après une
     mesure prise plus tôt, c'est cliquer à côté. */
  const ouEst = async () => {
    /* La partition est plus haute que la fenêtre : sans ce cadrage, le bas de
       la grille — celui des volumes — est hors de l'écran, et un clic envoyé
       là ne touche rien du tout. */
    await evaluer(`document.querySelector('#grille-airs .toile-air').scrollIntoView({ block: 'center' })`)
    await patienter(150)
    return JSON.parse(await evaluer(
      `JSON.stringify(document.querySelector('#grille-airs .toile-air').getBoundingClientRect())`))
  }
  let cadre = await ouEst()

  /* Le troisième pas, la sixième ligne en partant du haut. La hauteur attendue
     se calcule comme l'atelier la calcule : le bas de la fenêtre est DO4. */
  const pasVise = 2
  const rang = 5
  const hauteurAttendue = 24 + (RANGS - 1 - rang) // DO4 = 24 dans la table des notes
  const NOMS = ['DO', 'DOD', 'RE', 'RED', 'MI', 'FA', 'FAD', 'SOL', 'SOLD', 'LA', 'LAD', 'SI']
  const nomAttendu = NOMS[hauteurAttendue % 12] + (2 + Math.floor(hauteurAttendue / 12))

  await cliquer(
    cadre.x + CLAVIER + pasVise * LARGEUR_PAS + LARGEUR_PAS / 2,
    cadre.y + rang * HAUTEUR_RANG + HAUTEUR_RANG / 2,
  )
  await patienter(700)

  const apres = await evaluer(`document.getElementById('source').value`)
  const partition = apres.split('Air THEME = {')[1].split('}')[0]
  const pas = [...partition.matchAll(/"([^"]*)"/g)].map((m) => m[1])

  controle('poser une note change le PROGRAMME', apres !== source,
    `\n      ${partition.trim()}`)
  controle('la note est celle de la LIGNE cliquée', pas[pasVise].startsWith(nomAttendu + ' '),
    ` (écrit « ${pas[pasVise]} », attendu « ${nomAttendu} »)`)
  controle('et au bon pas : les autres n’ont pas bougé',
    pas.filter((p) => p === '--').length === 7)

  const etat = await evaluer(`document.getElementById('etat').className`)
  controle('la cartouche se recompile sans erreur', !etat.includes('erreur'))

  /* --- le volume se règle dans la bande du bas --- */
  cadre = await ouEst()
  const bas = cadre.y + cadre.height - HAUTEUR_VOLUMES + 1 // tout en haut de la bande des volumes
  await cliquer(cadre.x + CLAVIER + pasVise * LARGEUR_PAS + LARGEUR_PAS / 2, bas)
  await patienter(600)

  const volumes = (await evaluer(`document.getElementById('source').value`))
    .split('Air THEME = {')[1].split('}')[0]
  const posé = [...volumes.matchAll(/"([^"]*)"/g)].map((m) => m[1])[pasVise]
  controle('cliquer en haut de la bande des volumes met le volume au plus fort',
    posé.endsWith(' 15'), ` (« ${posé} »)`)

  /* --- l'outil « == » --- */
  await evaluer(`[...document.querySelectorAll('#grille-airs .outil')].find(b => b.textContent.includes('tenir')).click()`)
  await patienter(200)
  cadre = await ouEst()
  await cliquer(
    cadre.x + CLAVIER + (pasVise + 1) * LARGEUR_PAS + LARGEUR_PAS / 2,
    cadre.y + rang * HAUTEUR_RANG + HAUTEUR_RANG / 2,
  )
  await patienter(600)

  const tenue = [...(await evaluer(`document.getElementById('source').value`))
    .split('Air THEME = {')[1].split('}')[0].matchAll(/"([^"]*)"/g)].map((m) => m[1])
  controle('l’outil « == » tient la note du pas d’avant', tenue[pasVise + 1] === '==',
    ` (« ${tenue[pasVise + 1]} »)`)

  /* --- l'écoute, sans compiler --- */
  await evaluer(`[...document.querySelectorAll('#grille-airs button')].find(b => b.textContent.includes('Écouter')).click()`)
  await patienter(400)
  const enTrain = await evaluer(
    `[...document.querySelectorAll('#grille-airs button')].some(b => b.textContent.includes('Arrêter'))`)
  controle('« Écouter » fait entendre l’air sans passer par la cartouche', enTrain)

  await evaluer(`document.getElementById('onglet-tuiles').click()`)
  await patienter(300)
  controle('changer d’onglet arrête l’écoute et rend la place aux tuiles',
    await vu('atelier-tuiles') && !(await vu('atelier-airs')))

  /* --- un programme qui a déjà des airs --- */
  await evaluer(`document.getElementById('exemples').value = 'musique';
    document.getElementById('exemples').dispatchEvent(new Event('change'))`)
  await patienter(2500)
  await evaluer(`document.getElementById('onglet-airs').click()`)
  await patienter(400)

  const noms = await evaluer(
    `[...document.querySelectorAll('#bande-airs .air:not(.neuf) span')].map(s => s.textContent).join(' ')`)
  controle('l’exemple « musique » montre ses trois airs', noms === 'THEME BASSE FANFARE', ` (${noms})`)

  const compte = await evaluer(`document.getElementById('compte-atelier').textContent`)
  controle('et la page les compte', compte.includes('3 airs'), ` (${compte})`)

  const etatFinal = await evaluer(`document.getElementById('etat').className`)
  controle('l’exemple compile dans la page', !etatFinal.includes('erreur'))

  /* Une image de l'atelier, pour la voir sans ouvrir la page. */
  await evaluer(`[...document.querySelectorAll('#bande-airs .air')].find(b => b.textContent.includes('THEME')).click()`)
  await patienter(500)
  await evaluer(`document.querySelector('#grille-airs .toile-air').scrollIntoView({ block: 'center' })`)
  await patienter(300)
  const { data } = await envoyer('Page.captureScreenshot', { format: 'png' })
  writeFileSync('images/capture-airs.png', Buffer.from(data, 'base64'))
  console.log('\n  → images/capture-airs.png : l’atelier des airs, tel qu’il se montre')
} finally {
  prise.close()
  navigateur.kill()
  /* Le profil est laissé sur place : Chrome le tient encore une seconde après
     avoir été tué, et l'effacer ici échouerait pour rien — il est effacé au
     lancement suivant, avant d'ouvrir la page. */
}

console.log(echecs ? `\n${echecs} contrôle(s) en échec` : '\ntout est vert')
process.exit(echecs ? 1 : 0)

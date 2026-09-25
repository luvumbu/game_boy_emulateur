/**
 * Lancer l'atelier, et le PILOTER — pour voir qu'il tourne.
 *
 *   node lancer-atelier.mjs
 *   node lancer-atelier.mjs --visible        avec la fenêtre à l'écran
 *
 * Ouvrir la page prouve que le serveur répond. Ce n'est pas la même chose que
 * de marcher : la console peut rester noire, le panneau peut s'ouvrir vide, un
 * réglage peut s'afficher sans rien changer. On charge donc la page dans un
 * vrai Chrome, on la fait jouer, on change des réglages, et l'on photographie.
 *
 * Le pilotage est celui de `verifier-page.mjs` — même guichet, même adresse.
 * Ici on ne vérifie rien : on montre.
 */

import { spawn } from 'node:child_process'
import { writeFileSync, existsSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

const ADRESSE = 'http://localhost/gameboy3/'
const PORT = 9223 // pas 9222 : pour ne pas gêner un contrôle qui tournerait
const VISIBLE = process.argv.includes('--visible')

const CHROMES = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  process.env.LOCALAPPDATA + '/Google/Chrome/Application/chrome.exe',
  'C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe',
]

const chrome = CHROMES.find((c) => c && existsSync(c))
if (!chrome) throw new Error('Chrome introuvable — cherché dans :\n  ' + CHROMES.join('\n  '))

const profil = join(tmpdir(), 'gameboy3-lancer')
rmSync(profil, { recursive: true, force: true })

const navigateur = spawn(chrome, [
  ...(VISIBLE ? [] : ['--headless=new']),
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${profil}`,
  '--no-first-run',
  '--disable-gpu',
  '--autoplay-policy=no-user-gesture-required',
  /*
   * Muet par défaut, « --son » pour entendre.
   *
   * Cet outil sert à REGARDER l'atelier tourner ; le son de la console partant
   * dans les haut-parleurs à chaque lancement finit par lasser. Le contexte
   * audio, lui, reste ouvert — c'est ce qui permet au compte rendu de dire
   * s'il tourne.
   */
  ...(process.argv.includes('--son') ? [] : ['--mute-audio']),
  '--window-size=1280,900',
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
  const message = JSON.parse(e.data)
  const attente = attentes.get(message.id)
  if (!attente) return
  attentes.delete(message.id)
  if (message.error) attente.rejeter(new Error(message.error.message))
  else attente.resoudre(message.result)
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

const photo = async (nom) => {
  const vue = await envoyer('Page.captureScreenshot', { format: 'png' })
  writeFileSync(nom, Buffer.from(vue.data, 'base64'))
  console.log(`  → ${nom}`)
}

const dire = (quoi, valeur) => console.log(`  ${quoi.padEnd(34)} ${valeur}`)

try {
  await patienter(2500)

  console.log(`\natelier — ${ADRESSE}\n`)

  /* --- la console tourne-t-elle vraiment ? --- */
  dire('la cartouche est compilée', (await evaluer(`document.getElementById('etat').className`)).includes('bon') ? 'oui' : 'NON')
  dire('la console tourne', (await evaluer(`inspecteur.tourne`)) ? 'oui' : 'non')

  /*
   * Deux mesures qui bougent toujours, plutôt qu'une qui peut dormir.
   *
   * $FF05 — le compteur du minuteur — reste à zéro tant que le programme ne
   * l'a pas armé : le lire donnerait « immobile » sur une console qui tourne
   * parfaitement. $FF04 avance sans qu'on lui demande rien, et l'image
   * affichée, elle, est ce que le visiteur voit.
   */
  const empreinte = `[...document.getElementById('ecran').getContext('2d')
    .getImageData(0, 0, 160, 144).data].reduce((t, o, i) => (t + o * (i % 7 + 1)) % 1000000, 0)`

  const divAvant = await evaluer(`inspecteur.gb.mmu.read(0xff04)`)
  const imageAvant = await evaluer(empreinte)
  await patienter(900)
  const divApres = await evaluer(`inspecteur.gb.mmu.read(0xff04)`)
  const imageApres = await evaluer(empreinte)

  dire('le processeur avance', divAvant === divApres ? 'IMMOBILE' : `oui ($FF04 : ${divAvant} → ${divApres})`)
  dire('images par seconde', await evaluer(`document.getElementById('ips').textContent`))

  /*
   * Et l'on JOUE.
   *
   * Un jeu qui attend une touche affiche la même image indéfiniment : « rien
   * ne bouge » ne prouve donc rien tant qu'on n'a rien appuyé. On appuie, et
   * l'on regarde si l'écran répond — c'est la seule preuve qui vaille.
   */
  const toucher = async (code, cle, combien) => {
    for (const type of ['keyDown', 'keyUp']) {
      await envoyer('Input.dispatchKeyEvent', { type, code, key: cle, windowsVirtualKeyCode: combien })
      if (type === 'keyDown') await patienter(900)
    }
  }

  const figeAvant = await evaluer(empreinte)
  await toucher('ArrowRight', 'ArrowRight', 39)
  await patienter(300)
  const figeApres = await evaluer(empreinte)
  dire('la manette répond', figeAvant === figeApres ? 'AUCUN EFFET' : 'oui — l’écran a changé')

  dire('l’écran est allumé', (await evaluer(`(inspecteur.gb.mmu.read(0xff40) & 0x80) !== 0`)) ? 'oui' : 'non')
  const son = await evaluer(`JSON.stringify(inspecteur.son)`)
  dire('le son', JSON.parse(son).etat)

  await photo('images/lancement-console.png')

  /* --- les cinquante réglages --- */
  console.log()
  dire('réglages au catalogue', await evaluer(`reglages.catalogue.length`))
  dire('contrôles affichés', await evaluer(`document.querySelectorAll('.reglage-ligne').length`))

  await evaluer(`document.getElementById('reglages').click()`)
  await patienter(400)

  /* On en change trois, la console tournant — c'est tout l'intérêt. */
  await evaluer(`reglages.poser('palette', 'ambre')`)
  await evaluer(`reglages.poser('balayage', 35)`)
  await evaluer(`reglages.poser('grilleEcran', 30)`)
  await patienter(500)

  dire('palette appliquée à chaud', (await evaluer(`reglages.nuances[0].join(',')`)) === '255,224,168' ? 'ambre' : 'NON')
  dire('la console tourne toujours', (await evaluer(`inspecteur.tourne`)) ? 'oui' : 'NON')

  await photo('images/lancement-reglages.png')

  /* --- et l'on remet tout, pour laisser la page comme on l'a trouvée --- */
  await evaluer(`document.getElementById('reglages-remettre').click()`)
  await patienter(300)
  await evaluer(`document.getElementById('reglages-fermer').click()`)
  await patienter(600)
  await photo('images/lancement-remis.png')

  console.log()
} finally {
  prise.close()
  navigateur.kill()
  await patienter(500)
  try { rmSync(profil, { recursive: true, force: true }) } catch { /* Chrome tient encore son dossier */ }
}

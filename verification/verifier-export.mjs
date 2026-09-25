/**
 * L'export HTML tourne-t-il vraiment tout seul, sans l'atelier ?
 *
 *   node verifier-export.mjs
 *
 * Compile un programme, clique le VRAI bouton « 🌐 Exporter en HTML » dans un
 * vrai navigateur, récupère le fichier téléchargé, puis l'ouvre dans un
 * SECOND navigateur, séparé du premier, en `file://` — sans le serveur de
 * l'atelier. Une capture d'écran ne suffirait pas : on presse une touche et on
 * vérifie que l'image change, preuve que l'émulateur tourne et lit le clavier
 * dans cette page-là, pas seulement dans l'atelier.
 */

import { spawn } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { bulletin } from '../outils/controle.mjs'

const b = bulletin('EXPORT HTML AUTONOME')
const patienter = (ms) => new Promise((r) => setTimeout(r, ms))

const CHROMES = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  process.env.LOCALAPPDATA + '/Google/Chrome/Application/chrome.exe',
  'C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe',
]
const chrome = CHROMES.find((c) => c && existsSync(c))
if (!chrome) { b.verifier('un navigateur est disponible', false, ' — aucun Chrome ni Brave trouvé'); b.fin() }

async function piloter(url, port, profilNom, { telechargements } = {}) {
  const profil = join(tmpdir(), profilNom)
  rmSync(profil, { recursive: true, force: true })
  const navigateur = spawn(chrome, [
    '--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${profil}`,
    '--no-first-run', '--disable-gpu', '--autoplay-policy=no-user-gesture-required',
    '--window-size=1000,800', url,
  ], { stdio: 'ignore' })

  let cible = null
  for (let i = 0; i < 40 && !cible; i++) {
    await patienter(250)
    try {
      const liste = await (await fetch(`http://localhost:${port}/json/list`)).json()
      cible = liste.find((t) => t.type === 'page')
    } catch { /* pas encore prêt */ }
  }
  if (!cible) { navigateur.kill(); throw new Error('la page ne s’est pas ouverte : ' + url) }

  const prise = new WebSocket(cible.webSocketDebuggerUrl)
  await new Promise((r) => prise.addEventListener('open', r))
  let id = 1
  const attentes = new Map()
  prise.addEventListener('message', (e) => {
    const m = JSON.parse(e.data)
    const a = attentes.get(m.id)
    if (!a) return
    attentes.delete(m.id)
    if (m.error) a.rejeter(new Error(m.error.message)); else a.resoudre(m.result)
  })
  const envoyer = (methode, params = {}) => new Promise((resoudre, rejeter) => {
    const monId = id++
    attentes.set(monId, { resoudre, rejeter })
    prise.send(JSON.stringify({ id: monId, method: methode, params }))
  })
  const evaluer = async (expression) => {
    const { result, exceptionDetails } = await envoyer('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
    if (exceptionDetails) throw new Error(exceptionDetails.exception?.description ?? 'erreur dans la page')
    return result.value
  }

  if (telechargements) {
    try { await envoyer('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: telechargements, eventsEnabled: true }) } catch { /* CDP plus ancien */ }
    try { await envoyer('Page.setDownloadBehavior', { behavior: 'allow', downloadPath: telechargements }) } catch { /* CDP plus récent */ }
  }

  return { evaluer, envoyer, fermer: () => { prise.close(); navigateur.kill() } }
}

const PORT_SERVEUR = Number(process.env.GAMEBOY3_PORT ?? 8000)
try {
  await fetch(`http://localhost:${PORT_SERVEUR}/`)
} catch {
  b.verifier('l’atelier répond', false, ` — lancer « node demarrer.mjs » (port ${PORT_SERVEUR} attendu)`)
  b.fin()
}

const dossierTelechargements = join(tmpdir(), 'gameboy3-verifier-export-dl')
rmSync(dossierTelechargements, { recursive: true, force: true })
mkdirSync(dossierTelechargements, { recursive: true })

const atelier = await piloter(`http://localhost:${PORT_SERVEUR}/`, 9290, 'gameboy3-verifier-export-atelier', { telechargements: dossierTelechargements })
await patienter(1200)
await atelier.evaluer(`document.getElementById('exemples').value = 'mario'`)
await atelier.evaluer(`document.getElementById('exemples').dispatchEvent(new Event('change'))`)
await patienter(300)
await atelier.evaluer(`document.getElementById('lancer').click()`)
await patienter(1200)
const boutonExiste = await atelier.evaluer(`!document.getElementById('exporter-html').disabled`)
b.verifier('le bouton « Exporter en HTML » s’active après compilation', boutonExiste)
await atelier.evaluer(`document.getElementById('exporter-html').click()`)
await patienter(1500)
atelier.fermer()
await patienter(300)

const fichiers = readdirSync(dossierTelechargements).filter((f) => f.endsWith('.html'))
b.verifier('un fichier .html a bien été téléchargé', fichiers.length === 1, ` (${fichiers.length} trouvé(s))`)
if (fichiers.length !== 1) b.fin()

const chemin = join(dossierTelechargements, fichiers[0])
const page = readFileSync(chemin, 'utf8')
b.verifier('la page embarque une cartouche en base64', /atob\("[A-Za-z0-9+/=]+"\)/.test(page))
b.verifier('la page embarque la classe GameBoy de l’émulateur du projet', page.includes('GameBoy = class'))

const joueur = await piloter(pathToFileURL(chemin).href, 9291, 'gameboy3-verifier-export-joueur')
await patienter(1500)

const somme = async () => joueur.evaluer(`
  (() => {
    const d = document.getElementById('ecran').getContext('2d').getImageData(0, 0, 160, 144).data
    let s = 0
    for (let i = 0; i < d.length; i += 37) s += d[i] * 7 + d[i + 1] * 13
    return s
  })()
`)

const titre = await joueur.evaluer(`document.querySelector('.titre')?.textContent`)
b.egal('le titre de la cartouche est affiché', titre, 'MON JEU')

const avant = await somme()
await joueur.envoyer('Input.dispatchKeyEvent', { type: 'keyDown', code: 'ArrowRight', key: 'ArrowRight', windowsVirtualKeyCode: 39 })
await patienter(400)
await joueur.envoyer('Input.dispatchKeyEvent', { type: 'keyUp', code: 'ArrowRight', key: 'ArrowRight', windowsVirtualKeyCode: 39 })
await patienter(500)
const apres = await somme()
b.verifier('une touche pressée dans la page EXPORTÉE (sans atelier) change l’image', avant !== apres, ` (${avant} → ${apres})`)

joueur.fermer()
b.fin()

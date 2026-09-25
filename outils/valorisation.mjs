/**
 * Imprime valorisation.html en PDF.
 *
 *   node valorisation.mjs
 *
 * Même technique que `fiche-ecrans.mjs` : un vrai navigateur, piloté par le
 * protocole de débogage, imprime un fichier local. Aucune bibliothèque PDF à
 * installer.
 */

import { spawn } from 'node:child_process'
import { existsSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const NOM = 'documents/valorisation'
const PORT = 9270
const patienter = (ms) => new Promise((r) => setTimeout(r, ms))

const CHROMES = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  process.env.LOCALAPPDATA + '/Google/Chrome/Application/chrome.exe',
  'C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe',
]
const chrome = CHROMES.find((c) => c && existsSync(c))
if (!chrome) throw new Error('Chrome introuvable — cherché dans :\n  ' + CHROMES.join('\n  '))

const url = pathToFileURL(resolve(`${NOM}.html`)).href
const profil = join(tmpdir(), 'gameboy3-valorisation')
rmSync(profil, { recursive: true, force: true })

const navigateur = spawn(chrome, [
  '--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profil}`,
  '--no-first-run', '--disable-gpu', '--window-size=1280,1000', url,
], { stdio: 'ignore' })

let cible = null
for (let i = 0; i < 40 && !cible; i++) {
  await patienter(250)
  try {
    const liste = await (await fetch(`http://localhost:${PORT}/json/list`)).json()
    cible = liste.find((t) => t.type === 'page' && t.url.startsWith('file://'))
  } catch { /* pas encore prêt */ }
}
if (!cible) { navigateur.kill(); throw new Error('Le navigateur n’a pas ouvert la page') }

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
const envoyer = (methode, params = {}) => new Promise((resoudre, rejeter) => {
  const id = prochainId++
  attentes.set(id, { resoudre, rejeter })
  prise.send(JSON.stringify({ id, method: methode, params }))
})

try {
  await envoyer('Page.enable')
  await patienter(800)
  const { data } = await envoyer('Page.printToPDF', {
    printBackground: true,
    paperWidth: 8.27, // A4
    paperHeight: 11.69,
    marginTop: 0, marginBottom: 0, marginLeft: 0, marginRight: 0, // les marges sont dans @page
    preferCSSPageSize: true,
  })
  writeFileSync(`${NOM}.pdf`, Buffer.from(data, 'base64'))
  console.log(`  → ${NOM}.pdf`)
} finally {
  prise.close()
  navigateur.kill()
}

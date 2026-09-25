/**
 * Démarrer l'atelier, sur n'importe quel PC — sans XAMPP, sans configuration.
 *
 *   node demarrer.mjs
 *
 * Cherche un PHP déjà installé, et s'en sert s'il marche. Sinon, l'atelier est
 * servi par ce script lui-même — y compris l'ouverture et l'enregistrement des
 * projets, que « projets-serveur.mjs » fait exactement comme « projets.php ».
 * Il ne manque donc plus rien sans PHP.
 *
 * Le seul prérequis réel est Node.js. Rien à installer avec `npm` : le
 * projet n'a aucune dépendance.
 */

import { spawn, execFileSync } from 'node:child_process'
import { existsSync, statSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import { extname, join } from 'node:path'
import { platform } from 'node:os'

import { creerLeService } from './projets-serveur.mjs'

const PORT = 8000
const RACINE = process.cwd()
const ADRESSE = `http://localhost:${PORT}/`

/* Ouvrir, enregistrer, renommer, supprimer un projet — sans PHP. */
const servirLesProjets = creerLeService(RACINE)

/**
 * PHP démarre-t-il vraiment ?
 *
 * Un `php.exe` présent sur le disque ne suffit pas : celui de XAMPP meurt dès
 * le lancement quand le runtime Visual C++ manque à Windows. On le lançait
 * quand même, il s'arrêtait aussitôt, et le navigateur s'ouvrait sur
 * « localhost n'autorise pas la connexion ». On l'essaie donc d'abord.
 */
function phpMarche(chemin) {
  try {
    execFileSync(chemin, ['-v'], { stdio: 'ignore', timeout: 5000 })
    return true
  } catch {
    return false
  }
}

/** Cherche un PHP installé ET qui marche, aux emplacements courants puis dans le PATH. */
function trouverPhp() {
  const candidats = [
    'C:/xampp/php/php.exe',
    'C:/wamp64/bin/php/php8/php.exe',
    '/usr/bin/php',
    '/usr/local/bin/php',
    '/opt/homebrew/bin/php',
  ]
  for (const chemin of candidats) {
    if (!existsSync(chemin)) continue
    if (phpMarche(chemin)) return chemin
    console.log(`  PHP trouvé (${chemin}) mais il ne démarre pas — sur Windows, il manque`)
    console.log(`  souvent le runtime Visual C++ : https://aka.ms/vs/17/release/vc_redist.x64.exe`)
  }

  return phpMarche('php') ? 'php' : null
}

function ouvrirNavigateur(url) {
  if (platform() === 'win32') spawn('cmd', ['/c', 'start', '""', url], { stdio: 'ignore' })
  else if (platform() === 'darwin') spawn('open', [url], { stdio: 'ignore' })
  else spawn('xdg-open', [url], { stdio: 'ignore' })
}

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.gb': 'application/octet-stream',
  '.gbc': 'application/octet-stream',
  '.pdf': 'application/pdf',
  '.mp4': 'video/mp4',
  '.cpp': 'text/plain; charset=utf-8',
  '.h': 'text/plain; charset=utf-8',
  '.md': 'text/plain; charset=utf-8',
}

/** Un serveur minimal, pour ne dépendre de rien d'autre que Node — sans « projets.php ». */
function servirSansPhp() {
  createServer(async (requete, reponse) => {
    try {
      let chemin = decodeURIComponent(requete.url.split('?')[0])

      /* Sa version, pour qu'un lancement plus récent sache s'il doit le remplacer. */
      if (chemin === '/__atelier') {
        reponse.writeHead(200, { 'Content-Type': 'application/json' })
        reponse.end(JSON.stringify({ version: VERSION }))
        return
      }
      /* S'arrêter, à la demande d'un atelier plus récent — et d'ici seulement. */
      if (chemin === '/__arreter' && requete.method === 'POST' &&
          ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(requete.socket.remoteAddress)) {
        reponse.writeHead(200)
        reponse.end('au revoir')
        setTimeout(() => process.exit(0), 100)
        return
      }
      if (chemin === '/') chemin = '/index.html'
      const fichier = join(RACINE, chemin)
      if (!fichier.startsWith(RACINE)) { reponse.writeHead(403); reponse.end(); return }

      /* Les projets : Node fait lui-même ce que faisait « projets.php ». */
      if (chemin === '/projets.php') {
        await servirLesProjets(requete, reponse)
        return
      }

      const donnees = await readFile(fichier)
      reponse.writeHead(200, { 'Content-Type': TYPES[extname(fichier)] ?? 'application/octet-stream' })
      reponse.end(donnees)
    } catch {
      reponse.writeHead(404)
      reponse.end('introuvable')
    }
  }).on('error', (erreur) => {
    /* Le port pris par AUTRE CHOSE que l'atelier (l'atelier lui-même est
       reconnu plus bas, avant d'en arriver là) : on le dit, sans pile d'appels. */
    if (erreur.code !== 'EADDRINUSE') throw erreur
    console.log(`  ✗ Le port ${PORT} est déjà pris par un autre programme que l'atelier.`)
    console.log(`    Fermer ce programme, puis relancer.`)
    process.exit(1)
  }).listen(PORT, () => {
    console.log(`  Les projets s'ouvrent et s'enregistrent par Node — PHP n'est pas nécessaire.`)
    console.log(`  → ${ADRESSE}`)
    ouvrirNavigateur(ADRESSE)
  })
}

/*
 * L'atelier tourne-t-il DÉJÀ ?
 *
 * Double-cliquer « lancer.bat » une seconde fois, la première fenêtre encore
 * ouverte, se terminait sur « EADDRINUSE » et une pile d'appels — suivies de
 * « Node.js est-il installé ? », ce qui envoyait chercher au mauvais endroit.
 * Le port est pris… par l'atelier lui-même : il suffit d'ouvrir la page.
 */
async function dejaLance() {
  try {
    const reponse = await fetch(`${ADRESSE}index.html`, { signal: AbortSignal.timeout(1500) })
    return reponse.ok && (await reponse.text()).includes('gameboy3')
  } catch {
    return false
  }
}

/*
 * Un atelier qui tourne déjà est-il À JOUR ?
 *
 * On réutilisait n'importe quel atelier trouvé sur le port. Or celui d'hier,
 * lancé avant une correction du serveur, continue de servir l'ancien code —
 * et « Nouveau » répondait encore « PHP absent » alors que tout était réparé.
 * Chaque serveur dit donc sa VERSION (la date de ses propres fichiers) ; s'il
 * est plus vieux que le code sur le disque, on lui demande de s'arrêter, et
 * l'on prend sa place.
 */
const VERSION = Math.max(...['demarrer.mjs', 'projets-serveur.mjs'].map((f) => {
  try { return statSync(join(RACINE, f)).mtimeMs } catch { return 0 }
}))

async function versionEnPlace() {
  try {
    const reponse = await fetch(`${ADRESSE}__atelier`, { signal: AbortSignal.timeout(1500) })
    return reponse.ok ? (await reponse.json()).version : null
  } catch {
    return null
  }
}

if (await dejaLance()) {
  const enPlace = await versionEnPlace()
  if (enPlace === VERSION) {
    console.log(`  L'atelier tourne déjà (une autre fenêtre le fait tourner) — on ouvre la page.`)
    console.log(`  → ${ADRESSE}`)
    ouvrirNavigateur(ADRESSE)
    process.exit(0)
  }
  if (enPlace === null) {
    /* Trop vieux pour savoir s'arrêter tout seul : on le dit clairement. */
    console.log(`  ⚠ Un ANCIEN atelier tourne encore, lancé avant une mise à jour.`)
    console.log(`    Fermer sa fenêtre noire (ou redémarrer le PC), puis relancer ce fichier.`)
    process.exit(1)
  }
  console.log(`  Un atelier plus ancien tournait : il s'arrête, celui-ci prend sa place.`)
  try { await fetch(`${ADRESSE}__arreter`, { method: 'POST' }) } catch { /* il s'arrête en coupant la connexion */ }
  for (let i = 0; i < 20 && await dejaLance(); i++) await new Promise((r) => setTimeout(r, 250))
}

const php = trouverPhp()

if (php) {
  console.log(`  PHP trouvé (${php}) — les projets pourront s'enregistrer sur le disque.`)
  const serveur = spawn(php, ['-S', `localhost:${PORT}`], { cwd: RACINE, stdio: 'inherit' })
  let relaye = false
  const sansLui = (pourquoi) => {
    if (relaye) return
    relaye = true
    console.log(`  PHP ${pourquoi} — on continue sans lui.`)
    servirSansPhp()
  }
  serveur.on('error', (erreur) => sansLui(`n'a pas pu démarrer (${erreur.message})`))
  /* Un serveur PHP qui s'arrête tout seul (port pris, extension cassée…)
     laisserait le navigateur face à une page morte : Node prend le relais. */
  serveur.on('exit', (code) => sansLui(`s'est arrêté (code ${code})`))
  setTimeout(() => {
    if (relaye) return // c'est le serveur de Node qui ouvrira la page
    console.log(`  → ${ADRESSE}`)
    ouvrirNavigateur(ADRESSE)
  }, 600)
  process.on('SIGINT', () => { serveur.kill(); process.exit(0) })
} else {
  servirSansPhp()
}

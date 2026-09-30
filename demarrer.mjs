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
import { existsSync, readFileSync, statSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { createServer, request } from 'node:http'
import { dirname, extname, join, normalize, relative } from 'node:path'
import { platform } from 'node:os'
import { fileURLToPath } from 'node:url'

/*
 * Les options, pour les essais (verification/verifier-disponible.mjs) :
 *   --port 8123         un autre port que 8000
 *   --sans-navigateur   ne pas ouvrir le navigateur (un essai n'en veut pas)
 *   --sans-php          ne pas chercher PHP : Node sert tout
 * Un double-clic sur lancer.bat n'en donne aucune : rien ne change pour lui.
 */
const ARGUMENTS = process.argv.slice(2)
const option = (nom) => ARGUMENTS.includes(nom)
const valeur = (nom) => { const i = ARGUMENTS.indexOf(nom); return i >= 0 ? ARGUMENTS[i + 1] : undefined }

const PORT = Number(valeur('--port')) || 8000

/*
 * Le dossier du projet : celui où se trouve CE fichier, et non le dossier
 * courant. « node C:\…\GAME8BOY\demarrer.mjs », lancé depuis un autre
 * dossier, servait sinon ce dossier-là — et le navigateur n'y trouvait rien.
 */
const RACINE = normalize(dirname(fileURLToPath(import.meta.url)))
const ADRESSE = `http://localhost:${PORT}/`

/*
 * Ouvrir, enregistrer, renommer, supprimer un projet — sans PHP.
 *
 * Importé À LA MAIN, dans un try, et non par un « import » en haut du
 * fichier : si « projets-serveur.mjs » manque ou est abîmé, un import
 * ordinaire faisait planter le lanceur avant même qu'il dise un mot. Ici,
 * l'atelier démarre quand même (tout marche, sauf l'enregistrement des
 * projets), et l'on dit pourquoi.
 */
let servirLesProjets
try {
  const { creerLeService } = await import('./projets-serveur.mjs')
  servirLesProjets = creerLeService(RACINE)
} catch (erreur) {
  console.log(`  ⚠ « projets-serveur.mjs » manque ou a une erreur (${erreur.message.split('\n')[0]}).`)
  console.log(`    L'atelier démarre, mais les projets ne pourront pas s'ouvrir ni s'enregistrer.`)
  // À la place du service : une réponse qui explique, au format attendu par projets.js.
  servirLesProjets = async (requete, reponse) => {
    reponse.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' })
    reponse.end(JSON.stringify({ erreur: 'Le fichier « projets-serveur.mjs » manque : les projets ne peuvent ni s’ouvrir ni s’enregistrer. Recopie le projet en entier.' }))
  }
}

/*
 * Tous les fichiers de l'application sont-ils là ?
 *
 * On part des trois pages, et l'on suit leurs « import », de fichier en
 * fichier, comme le fera le navigateur. Un fichier absent est dit ICI, dans
 * la fenêtre noire, en clair — avant que le navigateur ne s'ouvre sur une
 * page qui ne démarre pas. On ne s'arrête pas pour autant : les autres pages
 * peuvent marcher, et la page elle-même le redira (voir garde.js).
 */
function fichiersManquants() {
  const manquants = []
  const vus = new Set()
  // Le départ : les pages, et les fichiers qu'elles chargent sans « import ».
  const aLire = ['index.html', 'tuto.html', 'cours.html', 'garde.js', 'favicon.svg'].map((f) => join(RACINE, f))
  while (aLire.length) {
    const fichier = aLire.pop()
    if (vus.has(fichier)) continue
    vus.add(fichier)
    if (!existsSync(fichier)) { manquants.push(relative(RACINE, fichier).replaceAll('\\', '/')); continue }
    if (!/\.(html|m?js)$/.test(fichier)) continue   // une image : il suffit qu'elle soit là
    const texte = readFileSync(fichier, 'utf8')
    // les trois formes : import … from, import tout court, et import( … )
    for (const m of texte.matchAll(/(?:import\s+[\s\S]*?\s+from\s+|import\s+|import\()\s*['"](\.{1,2}\/[^'"]+)['"]/g))
      aLire.push(join(dirname(fichier), m[1]))
  }
  return manquants
}

const manquants = fichiersManquants()
if (manquants.length) {
  console.log(`  ✗ Il manque ${manquants.length} fichier(s) de l'atelier :`)
  for (const f of manquants) console.log(`      ${f}`)
  console.log(`    Le dossier du projet est incomplet : recopie-le en entier (ou retélécharge-le),`)
  console.log(`    en gardant de côté ton dossier « projets ». L'atelier démarre quand même.`)
}

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
  if (option('--sans-navigateur')) return   // un essai automatique : pas de fenêtre
  /* Si la commande qui ouvre le navigateur n'existe pas (un Linux sans
     xdg-open, par exemple), spawn envoie une erreur qui, non écoutée, faisait
     planter le serveur. On dit alors simplement quelle adresse ouvrir. */
  const aLaMain = () => console.log(`  Le navigateur ne s'est pas ouvert tout seul : ouvre ${url} à la main.`)
  let commande
  if (platform() === 'win32') commande = spawn('cmd', ['/c', 'start', '""', url], { stdio: 'ignore' })
  else if (platform() === 'darwin') commande = spawn('open', [url], { stdio: 'ignore' })
  else commande = spawn('xdg-open', [url], { stdio: 'ignore' })
  commande.on('error', aLaMain)
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
 * Poser une question au serveur qui tient déjà le port, et FERMER la connexion.
 *
 * On utilisait fetch(). Mais fetch garde la connexion ouverte en coulisse,
 * pour la réutiliser ; et le process.exit() qui suit, sous Windows, la
 * coupait en plein milieu : Node s'arrêtait sur « Assertion failed …
 * async.c », avec un code d'erreur — et lancer.bat, lancé une seconde fois,
 * affichait « Une erreur est survenue » alors que tout allait bien.
 * « agent: false » : une connexion neuve, fermée dès la réponse reçue.
 * Rend { statut, texte }, ou null si personne ne répond (en 1,5 seconde).
 */
function demander(chemin, methode = 'GET') {
  return new Promise((resoudre) => {
    const question = request(`${ADRESSE}${chemin}`, { method: methode, agent: false, timeout: 1500 }, (reponse) => {
      let texte = ''
      reponse.setEncoding('utf8')
      reponse.on('data', (morceau) => { texte += morceau })
      reponse.on('end', () => resoudre({ statut: reponse.statusCode, texte }))
      reponse.on('error', () => resoudre(null))
    })
    question.on('timeout', () => question.destroy())   // trop long : on abandonne…
    question.on('error', () => resoudre(null))         // …et l'on répond « personne »
    question.end()
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
  const reponse = await demander('index.html')
  return reponse?.statut === 200 && reponse.texte.includes('gameboy3')
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

/*
 * Rend la version du serveur en place, 'php', ou null.
 *
 * 'php' : le port est tenu par le serveur PHP qu'un lancement précédent a
 * démarré. Il ne connaît pas « __atelier » — pour lui, c'est une adresse sans
 * fichier, et il répond par la page d'accueil (du HTML, pas du JSON). Mais il
 * lit chaque fichier sur le disque à chaque demande : il est donc TOUJOURS à
 * jour, et il n'y a qu'à ouvrir la page. On le prenait pour un « ancien
 * atelier », et un second double-clic sur lancer.bat finissait en erreur.
 *
 * null : un vieux serveur Node, d'avant « __atelier » (il répond 404).
 */
async function versionEnPlace() {
  const reponse = await demander('__atelier')
  if (reponse?.statut !== 200) return null
  try {
    return JSON.parse(reponse.texte).version
  } catch {
    return 'php'   // une réponse, mais pas du JSON : la page d'accueil, servie par PHP
  }
}

if (await dejaLance()) {
  const enPlace = await versionEnPlace()
  if (enPlace === VERSION || enPlace === 'php') {
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
  await demander('__arreter', 'POST')   // il s'arrête ; s'il coupe avant de répondre, demander rend null
  for (let i = 0; i < 20 && await dejaLance(); i++) await new Promise((r) => setTimeout(r, 250))
}

const php = option('--sans-php') ? null : trouverPhp()

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

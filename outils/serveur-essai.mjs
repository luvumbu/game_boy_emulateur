/**
 * Un serveur pour les vérifications, lancé par elles-mêmes.
 *
 * Les vérifications qui ouvrent la page dans un navigateur allaient la chercher
 * à « http://localhost/gameboy3/ » — c'est-à-dire chez Apache (XAMPP), et sous
 * un nom de dossier précis. Sans XAMPP allumé, ou le dossier renommé, TOUT
 * échouait d'un coup, et l'on ne savait plus si la page était cassée ou
 * seulement introuvable.
 *
 * Chacune démarre donc son propre serveur, dans son propre processus, sur un
 * port libre : le dossier du projet, tel qu'il est, et le service des projets
 * de Node (le même que « demarrer.mjs »). Plus rien à allumer avant.
 *
 * Le serveur ne retient pas le processus : quand la vérification a fini, il
 * s'en va avec elle.
 */

import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { dirname, extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'

import { creerLeService } from '../projets-serveur.mjs'

export const RACINE = normalize(join(dirname(fileURLToPath(import.meta.url)), '..'))

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml',
  '.md': 'text/plain; charset=utf-8', '.gb': 'application/octet-stream', '.gbc': 'application/octet-stream',
  '.wasm': 'application/wasm', '.pdf': 'application/pdf', '.woff2': 'font/woff2',
}

let adresse = null

/** Démarre le serveur (une seule fois par processus) et rend son adresse, « http://localhost:PORT/ ». */
export async function servirLAtelier() {
  if (adresse) return adresse
  const projets = creerLeService(RACINE)
  const serveur = createServer(async (requete, reponse) => {
    try {
      let chemin = decodeURIComponent(new URL(requete.url, 'http://x').pathname)
      if (chemin.endsWith('/')) chemin += 'index.html'
      if (chemin === '/projets.php') { await projets(requete, reponse); return }
      const fichier = normalize(join(RACINE, chemin))
      if (!fichier.startsWith(RACINE)) { reponse.writeHead(403); reponse.end(); return }
      const donnees = await readFile(fichier)
      reponse.writeHead(200, { 'Content-Type': TYPES[extname(fichier)] ?? 'application/octet-stream', 'Cache-Control': 'no-store' })
      reponse.end(donnees)
    } catch {
      reponse.writeHead(404)
      reponse.end('introuvable')
    }
  })
  await new Promise((resoudre) => serveur.listen(0, '127.0.0.1', resoudre))
  serveur.unref()
  adresse = `http://localhost:${serveur.address().port}/`
  return adresse
}

/**
 * Les projets, sur le disque — servis par Node, sans PHP.
 *
 * C'est la traduction fidèle de « projets.php » : mêmes demandes (liste,
 * ouvrir, creer, enregistrer, capture, cartouche, renommer, supprimer), mêmes
 * réponses, mêmes refus. La page ne voit aucune différence.
 *
 * Pourquoi un double : le PHP de XAMPP peut être présent sur le disque et
 * cassé (il manque souvent le runtime Visual C++ à Windows). Sans lui,
 * « 📂 Ouvrir » et « 💾 Enregistrer » ne marchaient plus. Node, lui, est
 * forcément là : c'est lui qui fait tourner l'atelier.
 *
 * ------------------------------------------------------------------------
 * CE SERVICE ÉCRIT DES FICHIERS. Il est borné exactement comme l'original :
 *
 *   - tout vit sous « projets/ », et nulle part ailleurs ;
 *   - un nom de projet ne peut être que « a-z 0-9 _ - », de 1 à 40 signes ;
 *   - un nom de fichier ne peut être que « nom.cpp » avec les mêmes signes ;
 *   - le chemin final est REVÉRIFIÉ (realpath) : s'il sortait du dossier des
 *     projets par un chemin qu'on n'a pas prévu, on refuse.
 * ------------------------------------------------------------------------
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, realpathSync, renameSync, rmdirSync, statSync, unlinkSync, writeFileSync } from 'node:fs'
import { join, sep } from 'node:path'

const TAILLE_MAX = 2 * 1024 * 1024
const NOM_PROJET = /^[a-z0-9_-]{1,40}$/
const NOM_FICHIER = /^[A-Za-z0-9_-]{1,40}\.cpp$/

class Refus extends Error {
  constructor(message, code = 400) {
    super(message)
    this.code = code
  }
}
const refuser = (pourquoi, code = 400) => { throw new Refus(pourquoi, code) }

const estDossier = (chemin) => { try { return statSync(chemin).isDirectory() } catch { return false } }
const estFichier = (chemin) => { try { return statSync(chemin).isFile() } catch { return false } }
const secondes = () => Math.floor(Date.now() / 1000)
const barres = (chemin) => chemin.replace(/\\/g, '/')

/** « Mon Jeu ! » devient « mon_jeu ». */
function nomPropre(brut) {
  let propre = String(brut).trim().toLowerCase()
  const accents = { à: 'a', â: 'a', ä: 'a', é: 'e', è: 'e', ê: 'e', ë: 'e', î: 'i', ï: 'i', ô: 'o', ö: 'o', ù: 'u', û: 'u', ü: 'u', ç: 'c', œ: 'oe', æ: 'ae' }
  propre = propre.replace(/[àâäéèêëîïôöùûüçœæ]/g, (c) => accents[c])
  propre = propre.replace(/[^a-z0-9_-]+/g, '_').replace(/^_+|_+$/g, '')
  return propre.slice(0, 40)
}

/** Le programme neuf, mot pour mot celui de « projets.php ». */
function programmeNeuf(titre) {
  return [
    '/*',
    ` * ${titre}`,
    ' *',
    ' * Un programme neuf. Tout part de « int main() » — c\'est là que la console',
    ' * arrive, et nulle part ailleurs.',
    ' */',
    '',
    'int main() {',
    `  texte(4, 6, "${titre}");`,
    '',
    '  while (true) {',
    '    image();',
    '  }',
    '}',
    '',
  ].join('\n')
}

export function creerLeService(racine) {
  const DOSSIER = join(racine, 'projets')

  /** Le dossier d'un projet — ou un refus. Rien ne sort de « projets/ ». */
  function dossierDuProjet(nom, doitExister = true) {
    if (!NOM_PROJET.test(nom)) refuser(`« ${nom} » n’est pas un nom de projet : des lettres, des chiffres, « _ » et « - », pas plus.`)
    const chemin = join(DOSSIER, nom)
    if (doitExister && !estDossier(chemin)) refuser(`le projet « ${nom} » n’existe pas`, 404)
    if (estDossier(chemin)) {
      const reel = realpathSync(chemin)
      const base = realpathSync(DOSSIER)
      if (!reel.startsWith(base + sep)) refuser('chemin refusé', 403)
    }
    return chemin
  }

  function fichierPropre(nom) {
    if (!NOM_FICHIER.test(nom)) refuser(`« ${nom} » n’est pas un nom de fichier : « quelquechose.cpp »`)
    return nom
  }

  function reglagesDuProjet(dossier, nom) {
    const defaut = { titre: nom.slice(0, 11).toUpperCase(), console: 'gbc', change: null }
    const ou = join(dossier, 'projet.json')
    if (!estFichier(ou)) return defaut
    try {
      const lu = JSON.parse(readFileSync(ou, 'utf8'))
      return lu && typeof lu === 'object' && !Array.isArray(lu) ? { ...defaut, ...lu } : defaut
    } catch {
      return defaut
    }
  }

  const ecrireReglages = (dossier, reglages) =>
    writeFileSync(join(dossier, 'projet.json'), JSON.stringify(reglages, null, 4))

  const DEMANDES = {
    liste() {
      const projets = []
      for (const entree of readdirSync(DOSSIER)) {
        const dossier = join(DOSSIER, entree)
        if (!estDossier(dossier) || !NOM_PROJET.test(entree)) continue
        const reglages = reglagesDuProjet(dossier, entree)
        const contenu = readdirSync(dossier)
        const cartouches = ['gb', 'gbc'].filter((e) => estFichier(join(dossier, `${entree}.${e}`)))
        const programme = join(dossier, 'principal.cpp')
        projets.push({
          nom: entree,
          titre: reglages.titre,
          console: reglages.console,
          fichiers: contenu.filter((f) => /\.cpp$/.test(f)),
          capture: estFichier(join(dossier, 'capture.png')),
          cartouche: cartouches.length > 0,
          cartouches,
          change: Math.floor(statSync(estFichier(programme) ? programme : dossier).mtimeMs / 1000),
        })
      }
      projets.sort((a, b) => b.change - a.change)
      return { projets, dossier: barres(realpathSync(DOSSIER)) }
    },

    ouvrir(nom) {
      const dossier = dossierDuProjet(nom)
      const fichiers = {}
      for (const entree of readdirSync(dossier)) {
        if (NOM_FICHIER.test(entree)) fichiers[entree] = readFileSync(join(dossier, entree), 'utf8')
      }
      if (!Object.keys(fichiers).length) fichiers['principal.cpp'] = programmeNeuf(nom.toUpperCase())
      return { nom, fichiers, reglages: reglagesDuProjet(dossier, nom), dossier: barres(realpathSync(dossier)) }
    },

    creer(nom, donnees) {
      const propre = nomPropre(nom)
      if (!propre) refuser('il faut un nom : des lettres, des chiffres, « _ » ou « - »')
      /* Jamais d'écrasement : un nom pris reçoit un numéro. */
      let libre = propre
      for (let n = 2; estDossier(join(DOSSIER, libre)) && n < 1000; n++) {
        libre = propre.slice(0, 40 - String(n).length) + n
      }
      const dossier = dossierDuProjet(libre, false)
      mkdirSync(dossier, { recursive: true })
      const titre = String(donnees.titre ?? libre.slice(0, 11).toUpperCase())
      writeFileSync(join(dossier, 'principal.cpp'), programmeNeuf(titre))
      ecrireReglages(dossier, { titre, console: String(donnees.console ?? 'gbc'), change: secondes() })
      return { nom: libre, dossier: barres(realpathSync(dossier)) }
    },

    enregistrer(nom, donnees) {
      const dossier = dossierDuProjet(nom)
      const fichiers = donnees.fichiers
      if (!fichiers || typeof fichiers !== 'object' || !Object.keys(fichiers).length) refuser('rien à enregistrer')
      const ecrits = []
      for (const [quel, contenu] of Object.entries(fichiers)) {
        const propre = fichierPropre(String(quel))
        if (typeof contenu !== 'string' || Buffer.byteLength(contenu) > TAILLE_MAX) refuser(`« ${propre} » est vide ou trop gros`)
        writeFileSync(join(dossier, propre), contenu)
        ecrits.push(propre)
      }
      /* Un onglet fermé dans la page disparaît du dossier. */
      for (const entree of readdirSync(dossier)) {
        if (NOM_FICHIER.test(entree) && !ecrits.includes(entree)) {
          try { unlinkSync(join(dossier, entree)) } catch { /* tant pis */ }
        }
      }
      const reglages = reglagesDuProjet(dossier, nom)
      reglages.titre = String(donnees.titre ?? reglages.titre)
      reglages.console = String(donnees.console ?? reglages.console)
      reglages.change = secondes()
      ecrireReglages(dossier, reglages)
      return { nom, fichiers: ecrits, change: reglages.change }
    },

    capture(nom, donnees) {
      const dossier = dossierDuProjet(nom)
      const bouts = String(donnees.png ?? '').match(/^data:image\/png;base64,([A-Za-z0-9+/=]+)$/)
      if (!bouts) refuser('la capture doit être une image PNG')
      const octets = Buffer.from(bouts[1], 'base64')
      const ENTETE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
      if (octets.length > TAILLE_MAX || !octets.subarray(0, 8).equals(ENTETE)) refuser('ce n’est pas un PNG')
      writeFileSync(join(dossier, 'capture.png'), octets)
      return { nom, capture: true, octets: octets.length }
    },

    cartouche(nom, donnees) {
      const dossier = dossierDuProjet(nom)
      const ecrits = {}
      for (const extension of ['gb', 'gbc']) {
        if (donnees[extension] === undefined) continue
        const octets = Buffer.from(String(donnees[extension]), 'base64')
        if (octets.length < 0x150 || octets.length > TAILLE_MAX) refuser('ce n’est pas une cartouche')
        writeFileSync(join(dossier, `${nom}.${extension}`), octets)
        ecrits[extension] = octets.length
      }
      if (!Object.keys(ecrits).length) refuser('ce n’est pas une cartouche')
      /* Une cartouche qui n'est plus fabriquée s'en va. */
      for (const extension of ['gb', 'gbc']) {
        const chemin = join(dossier, `${nom}.${extension}`)
        if (ecrits[extension] === undefined && estFichier(chemin)) unlinkSync(chemin)
      }
      return { nom, cartouche: true, cartouches: ecrits, octets: Object.values(ecrits).reduce((s, n) => s + n, 0) }
    },

    renommer(nom, donnees) {
      const dossier = dossierDuProjet(nom)
      const vers = nomPropre(donnees.vers ?? '')
      if (!vers) refuser('il faut un nouveau nom')
      if (vers === nom) return { nom }
      const ailleurs = dossierDuProjet(vers, false)
      if (estDossier(ailleurs)) refuser(`« ${vers} » existe déjà`)
      try { renameSync(dossier, ailleurs) } catch { refuser('le dossier n’a pas pu être renommé', 500) }
      for (const extension of ['gb', 'gbc']) {
        const avant = join(ailleurs, `${nom}.${extension}`)
        if (estFichier(avant)) { try { renameSync(avant, join(ailleurs, `${vers}.${extension}`)) } catch { /* tant pis */ } }
      }
      return { nom: vers }
    },

    supprimer(nom) {
      const dossier = dossierDuProjet(nom)
      /* On n'efface que ce qu'on sait avoir écrit — jamais un « rm -rf ». */
      for (const entree of readdirSync(dossier)) {
        if (/^[A-Za-z0-9_-]{1,40}\.(cpp|gb|gbc|png|json|sav)$/.test(entree)) {
          try { unlinkSync(join(dossier, entree)) } catch { /* tant pis */ }
        }
      }
      const reste = readdirSync(dossier)
      if (reste.length) refuser('le dossier contient autre chose que le projet : à effacer à la main — ' + reste.join(', '))
      rmdirSync(dossier)
      return { supprime: nom }
    },
  }

  /** Répond à une requête « /projets.php?quoi=… ». */
  return async function servir(requete, reponse) {
    const repondre = (quoi, code = 200) => {
      reponse.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' })
      reponse.end(JSON.stringify(quoi))
    }
    try {
      if (!existsSync(DOSSIER)) mkdirSync(DOSSIER, { recursive: true })
      const adresse = new URL(requete.url, 'http://localhost')
      const quoi = adresse.searchParams.get('quoi') ?? ''

      let brut = ''
      for await (const morceau of requete) {
        brut += morceau
        if (brut.length > TAILLE_MAX * 2) refuser('requête trop grosse', 413)
      }
      let donnees = {}
      try { donnees = brut ? JSON.parse(brut) : {} } catch { donnees = {} }
      if (!donnees || typeof donnees !== 'object') donnees = {}
      const nom = String(adresse.searchParams.get('projet') ?? donnees.projet ?? '')

      const faire = DEMANDES[quoi]
      if (!faire) refuser(`« ${quoi} » n’est pas une demande connue : liste, ouvrir, creer, enregistrer, capture, cartouche, renommer, supprimer`, 404)
      repondre(faire(nom, donnees))
    } catch (erreur) {
      if (erreur instanceof Refus) repondre({ erreur: erreur.message }, erreur.code)
      else repondre({ erreur: `erreur du serveur : ${erreur.message}` }, 500)
    }
  }
}

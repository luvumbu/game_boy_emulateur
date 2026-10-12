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
    '#include <texte>   // chaque fonction de la console s\'inclut : texte() écrit un texte',
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

  /* ===================================================================
   *  Les CAPTURES d'une cartouche : un dossier par cartouche, sous
   *  « captures/ » (à côté de « projets/ », pour ne pas se mêler aux jeux).
   *
   *    captures/captures_tetris/
   *      capture.json    { titre, empreinte, octets, dessins: [{ nom, cote, rangees, source, adresse }] }
   *      tuiles-1.png    toute la cartouche en tuiles (« 🗂 Toute la cartouche »)
   *      ramasse-1.png   ce que le collecteur a ramassé (« 🧲 »)
   *
   *  Mêmes gardes que les projets : un nom « a-z 0-9 _ - », le chemin réel
   *  revérifié, des fichiers écrits sous des noms que CE service choisit.
   * =================================================================== */
  const CAPTURES = join(racine, 'captures')
  const NOM_DESSIN = /^[A-Z_][A-Z0-9_]{0,39}$/
  const SORTES_D_IMAGE = ['tuiles', 'ramasse']

  function dossierDesCaptures(nom, doitExister = true) {
    if (!NOM_PROJET.test(nom)) refuser(`« ${nom} » n’est pas un nom de dossier : des lettres, des chiffres, « _ » et « - », pas plus.`)
    if (!existsSync(CAPTURES)) mkdirSync(CAPTURES, { recursive: true })
    const chemin = join(CAPTURES, nom)
    if (doitExister && !estFichier(join(chemin, 'capture.json'))) refuser(`le dossier de captures « ${nom} » n’existe pas`, 404)
    if (estDossier(chemin) && !realpathSync(chemin).startsWith(realpathSync(CAPTURES) + sep)) refuser('chemin refusé', 403)
    return chemin
  }

  const lireCapture = (dossier) => JSON.parse(readFileSync(join(dossier, 'capture.json'), 'utf8'))
  const ecrireCapture = (dossier, capture) => {
    const texte = JSON.stringify(capture, null, 1)
    if (Buffer.byteLength(texte) > TAILLE_MAX * 4) refuser('trop de dessins dans ce dossier (8 Mo au plus)')
    writeFileSync(join(dossier, 'capture.json'), texte)
  }
  const imagesDe = (dossier) => readdirSync(dossier).filter((f) => /^(tuiles|ramasse)-\d{1,4}\.png$/.test(f))
    .sort((a, b) => a.localeCompare(b, 'fr', { numeric: true }))

  /** Un dessin venu de la page : vérifié champ par champ, rien d'autre n'est gardé. */
  function dessinPropre(d) {
    if (!d || typeof d !== 'object') refuser('un dessin illisible')
    const nom = String(d.nom ?? '')
    if (!NOM_DESSIN.test(nom)) refuser(`« ${nom} » n’est pas un nom de dessin : MAJUSCULES, chiffres et « _ »`)
    const cote = Number(d.cote)
    if (![8, 16, 32].includes(cote)) refuser(`« ${nom} » : la taille doit être 8, 16 ou 32`)
    const motif = new RegExp(`^[0-3]{${cote}}$`)
    if (!Array.isArray(d.rangees) || d.rangees.length !== cote || !d.rangees.every((r) => motif.test(r))) refuser(`« ${nom} » : ses pixels ne font pas ${cote} × ${cote}`)
    const propre = { nom, cote, rangees: d.rangees.map(String) }
    if (typeof d.source === 'string') propre.source = d.source.slice(0, 20)
    if (Number.isInteger(d.adresse)) propre.adresse = d.adresse
    return propre
  }

  /** Les dessins ajoutés à ceux du dossier : les pareils ne comptent qu'une fois, un nom pris reçoit un numéro. */
  function fusionner(anciens, nouveaux) {
    const pixels = new Set(anciens.map((d) => d.rangees.join('|')))
    const noms = new Set(anciens.map((d) => d.nom))
    let ajoutes = 0
    for (const d of nouveaux.map(dessinPropre)) {
      if (pixels.has(d.rangees.join('|'))) continue
      let nom = d.nom
      for (let n = 2; noms.has(nom); n++) nom = d.nom.slice(0, 40 - String(n).length - 1) + '_' + n
      pixels.add(d.rangees.join('|'))
      noms.add(nom)
      anciens.push({ ...d, nom })
      ajoutes++
    }
    return ajoutes
  }

  Object.assign(DEMANDES, {
    'captures-liste'() {
      if (!existsSync(CAPTURES)) return { captures: [], dossier: barres(CAPTURES) }
      const captures = []
      for (const entree of readdirSync(CAPTURES)) {
        const dossier = join(CAPTURES, entree)
        if (!NOM_PROJET.test(entree) || !estFichier(join(dossier, 'capture.json'))) continue
        try {
          const c = lireCapture(dossier)
          captures.push({ nom: entree, titre: c.titre ?? '', empreinte: c.empreinte ?? '', dessins: (c.dessins ?? []).length, images: imagesDe(dossier), change: Math.floor(statSync(join(dossier, 'capture.json')).mtimeMs / 1000) })
        } catch { /* un capture.json abîmé : on le saute */ }
      }
      captures.sort((a, b) => b.change - a.change)
      return { captures, dossier: barres(realpathSync(CAPTURES)) }
    },

    'captures-ouvrir'(nom) {
      const dossier = dossierDesCaptures(nom)
      const lireSiLa = (fichier, defaut) => { try { return JSON.parse(readFileSync(join(dossier, fichier), 'utf8')) } catch { return defaut } }
      return {
        nom, capture: lireCapture(dossier), images: imagesDe(dossier), dossier: barres(realpathSync(dossier)),
        rangement: lireSiLa('rangement.json', null),   // organiser-cartouche.js : banques, paquets, rôles
        roles: lireSiLa('roles.json', {}),             // clé d'une tuile → 'lutin' | 'decor' (ramassé par 🧲)
        decors: estDossier(join(dossier, 'decors'))    // les niveaux enregistrés (🗺)
          ? readdirSync(join(dossier, 'decors')).filter((f) => /^niveau-\d{1,3}(-\d{1,2})?\.png$/.test(f)).sort((a, b) => a.localeCompare(b, 'fr', { numeric: true }))
          : [],
      }
    },

    /*
     * Un niveau enregistré (🗺, panorama-decor.js) : decors/niveau-N.png.
     * Le service choisit N (le premier libre). Un très long niveau vient en
     * plusieurs parties : la première reçoit N, les suivantes renvoient
     * « numero » et « partie » → niveau-N-2.png, niveau-N-3.png…
     */
    'captures-decor'(nom, donnees) {
      const dossier = dossierDesCaptures(nom)
      const png = String(donnees.png ?? '').match(/^data:image\/png;base64,([A-Za-z0-9+/=]+)$/)
      if (!png) refuser('l’image doit être un PNG')
      const octets = Buffer.from(png[1], 'base64')
      const ENTETE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
      if (octets.length > TAILLE_MAX || !octets.subarray(0, 8).equals(ENTETE)) refuser('ce n’est pas un PNG (ou il fait plus de 2 Mo)')
      const ou = join(dossier, 'decors')
      mkdirSync(ou, { recursive: true })
      const partie = Number.isInteger(donnees.partie) && donnees.partie >= 1 && donnees.partie < 100 ? donnees.partie : 0
      let numero = Number.isInteger(donnees.numero) && donnees.numero >= 1 && donnees.numero < 1000 ? donnees.numero : 0
      if (!numero) { numero = 1; while (estFichier(join(ou, `niveau-${numero}.png`))) numero++ }
      const image = partie ? `niveau-${numero}-${partie + 1}.png` : `niveau-${numero}.png`
      writeFileSync(join(ou, image), octets)
      return { nom, numero, image: `decors/${image}` }
    },

    /* Les rôles ramassés par 🧲 (personnage ou décor), ajoutés à ceux du dossier.
       « lutin » l'emporte sur « decor ». */
    'captures-roles'(nom, donnees) {
      const dossier = dossierDesCaptures(nom)
      const nouveaux = donnees.roles
      if (!nouveaux || typeof nouveaux !== 'object') refuser('pas de rôles')
      let roles = {}
      try { roles = JSON.parse(readFileSync(join(dossier, 'roles.json'), 'utf8')) } catch { /* pas encore de rôles */ }
      let ajoutes = 0
      for (const [cle, role] of Object.entries(nouveaux)) {
        if (!/^[0-9a-f]{32}$/.test(cle) || !['lutin', 'decor'].includes(role)) continue
        if (roles[cle] === role || roles[cle] === 'lutin') continue
        roles[cle] = role
        ajoutes++
      }
      const texte = JSON.stringify(roles)
      if (Buffer.byteLength(texte) > TAILLE_MAX * 4) refuser('trop de rôles (8 Mo au plus)')
      writeFileSync(join(dossier, 'roles.json'), texte)
      return { nom, ajoutes, roles: Object.keys(roles).length }
    },

    /*
     * Le rangement (organiser-cartouche.js) : rangement.json, et les images
     * dans quatre sous-dossiers fixes. « debut » : on vide d'abord ces
     * sous-dossiers de leurs PNG — ils sont REFAITS à chaque rangement (un
     * paquet passé de « pas encore vu » à « personnages » ne doit pas rester
     * aux deux endroits). On n'efface rien d'autre : capture.json, roles.json
     * et les images du dossier restent.
     */
    'captures-organiser'(nom, donnees) {
      const dossier = dossierDesCaptures(nom)
      const SOUS_DOSSIERS = ['banques', 'personnages', 'decor', 'pas-encore-vu']
      if (donnees.debut) {
        for (const sous of SOUS_DOSSIERS) {
          const ou = join(dossier, sous)
          if (!estDossier(ou)) continue
          for (const f of readdirSync(ou)) if (/^[a-z0-9_-]{1,60}\.png$/.test(f)) { try { unlinkSync(join(ou, f)) } catch { /* tant pis */ } }
        }
      }
      if (donnees.rangement !== undefined) {
        if (!donnees.rangement || typeof donnees.rangement !== 'object') refuser('rangement illisible')
        const texte = JSON.stringify(donnees.rangement, null, 1)
        if (Buffer.byteLength(texte) > TAILLE_MAX * 4) refuser('rangement trop gros')
        writeFileSync(join(dossier, 'rangement.json'), texte)
      }
      const ENTETE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
      let ecrites = 0
      for (const image of Array.isArray(donnees.images) ? donnees.images : []) {
        const bouts = String(image?.chemin ?? '').match(/^(banques|personnages|decor|pas-encore-vu)\/([a-z0-9_-]{1,60}\.png)$/)
        if (!bouts) refuser(`« ${image?.chemin} » n’est pas un chemin d’image du rangement`)
        const png = String(image.png ?? '').match(/^data:image\/png;base64,([A-Za-z0-9+/=]+)$/)
        if (!png) refuser('l’image doit être un PNG')
        const octets = Buffer.from(png[1], 'base64')
        if (octets.length > TAILLE_MAX || !octets.subarray(0, 8).equals(ENTETE)) refuser('ce n’est pas un PNG (ou il fait plus de 2 Mo)')
        mkdirSync(join(dossier, bouts[1]), { recursive: true })
        writeFileSync(join(dossier, bouts[1], bouts[2]), octets)
        ecrites++
      }
      return { nom, ecrites }
    },

    /* Jamais d'écrasement : un nom pris reçoit un numéro, comme les projets. */
    'captures-creer'(nom, donnees) {
      const propre = nomPropre(nom)
      if (!propre) refuser('il faut un nom : des lettres, des chiffres, « _ » ou « - »')
      dossierDesCaptures(propre, false)
      let libre = propre
      for (let n = 2; estDossier(join(CAPTURES, libre)) && n < 1000; n++) libre = propre.slice(0, 40 - String(n).length) + n
      const dossier = dossierDesCaptures(libre, false)
      mkdirSync(dossier, { recursive: true })
      ecrireCapture(dossier, {
        titre: String(donnees.titre ?? '').slice(0, 40),
        empreinte: String(donnees.empreinte ?? '').replace(/[^0-9a-f]/g, '').slice(0, 16),
        octets: Number.isInteger(donnees.octets) ? donnees.octets : 0,
        dessins: [],
      })
      return { nom: libre, dossier: barres(realpathSync(dossier)) }
    },

    'captures-ajouter'(nom, donnees) {
      const dossier = dossierDesCaptures(nom)
      if (!Array.isArray(donnees.dessins)) refuser('rien à ajouter')
      const capture = lireCapture(dossier)
      capture.dessins = Array.isArray(capture.dessins) ? capture.dessins : []
      const ajoutes = fusionner(capture.dessins, donnees.dessins)
      ecrireCapture(dossier, capture)
      return { nom, ajoutes, dessins: capture.dessins.length }
    },

    /* Les dessins modifiés dans la page (renommés, ôtés) : la liste entière remplace l'ancienne. */
    'captures-modifier'(nom, donnees) {
      const dossier = dossierDesCaptures(nom)
      if (!Array.isArray(donnees.dessins)) refuser('rien à enregistrer')
      const dessins = donnees.dessins.map(dessinPropre)
      const noms = new Set(dessins.map((d) => d.nom))
      if (noms.size !== dessins.length) refuser('deux dessins portent le même nom')
      const capture = lireCapture(dossier)
      capture.dessins = dessins
      ecrireCapture(dossier, capture)
      return { nom, dessins: dessins.length }
    },

    /* Une image de plus : « tuiles-3.png » si 1 et 2 existent. Le service choisit le nom. */
    'captures-image'(nom, donnees) {
      const dossier = dossierDesCaptures(nom)
      const sorte = String(donnees.sorte ?? '')
      if (!SORTES_D_IMAGE.includes(sorte)) refuser('sorte d’image inconnue : tuiles ou ramasse')
      const bouts = String(donnees.png ?? '').match(/^data:image\/png;base64,([A-Za-z0-9+/=]+)$/)
      if (!bouts) refuser('l’image doit être un PNG')
      const octets = Buffer.from(bouts[1], 'base64')
      const ENTETE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
      if (octets.length > TAILLE_MAX || !octets.subarray(0, 8).equals(ENTETE)) refuser('ce n’est pas un PNG (ou il fait plus de 2 Mo)')
      /* La même image déjà là (on a rangé deux fois sans rien changer) : on ne la double pas. */
      const pareille = imagesDe(dossier).find((im) => im.startsWith(sorte + '-') && readFileSync(join(dossier, im)).equals(octets))
      if (pareille) return { nom, image: pareille, deja: true }
      let n = 1
      while (estFichier(join(dossier, `${sorte}-${n}.png`))) n++
      writeFileSync(join(dossier, `${sorte}-${n}.png`), octets)
      return { nom, image: `${sorte}-${n}.png` }
    },

    'captures-renommer'(nom, donnees) {
      const dossier = dossierDesCaptures(nom)
      const vers = nomPropre(donnees.vers ?? '')
      if (!vers) refuser('il faut un nouveau nom')
      if (vers === nom) return { nom }
      const ailleurs = dossierDesCaptures(vers, false)
      if (estDossier(ailleurs)) refuser(`« ${vers} » existe déjà`)
      try { renameSync(dossier, ailleurs) } catch { refuser('le dossier n’a pas pu être renommé', 500) }
      return { nom: vers }
    },
  })

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
        if (brut.length > TAILLE_MAX * 5) refuser('requête trop grosse', 413)   // 10 Mo : la liste des dessins capturés peut être longue
      }
      let donnees = {}
      try { donnees = brut ? JSON.parse(brut) : {} } catch { donnees = {} }
      if (!donnees || typeof donnees !== 'object') donnees = {}
      const nom = String(adresse.searchParams.get('projet') ?? donnees.projet ?? '')

      const faire = DEMANDES[quoi]
      if (!faire) refuser(`« ${quoi} » n’est pas une demande connue : liste, ouvrir, creer, enregistrer, capture, cartouche, renommer, supprimer, captures-liste, captures-ouvrir, captures-creer, captures-ajouter, captures-modifier, captures-image, captures-renommer, captures-roles, captures-organiser, captures-decor`, 404)
      repondre(faire(nom, donnees))
    } catch (erreur) {
      if (erreur instanceof Refus) repondre({ erreur: erreur.message }, erreur.code)
      else repondre({ erreur: `erreur du serveur : ${erreur.message}` }, 500)
    }
  }
}

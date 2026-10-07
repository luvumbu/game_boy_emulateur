/**
 * Le compilateur, en ligne de commande.
 *
 *   node outils/gb3.mjs exemples/bonjour.cpp
 *   node outils/gb3.mjs exemples/bonjour.cpp ma-cartouche.gb "MON JEU"
 *   node outils/gb3.mjs exemples/mario.cpp --capture
 *   node outils/gb3.mjs exemples/mario.cpp --capture 240 --touches DROITE,DROITE,A
 *
 * Un programme peut tenir sur plusieurs fichiers : « #include "dessins.cpp" »
 * verse le fichier voisin à cet endroit. Les chemins sont relatifs au fichier
 * principal.
 *
 * Il lit un fichier C++, en fait une cartouche Game Boy de 32 Ko, et dit ce
 * qu'elle pèse. Une erreur d'écriture est signalée avec son numéro de ligne
 * plutôt qu'avec une trace d'exécution : c'est le programme de l'utilisateur
 * qui est en cause, pas le compilateur.
 *
 * Avec « --capture », il fait EN PLUS tourner la cartouche qu'il vient de
 * produire et photographie son écran, à côté du .gb. C'est ce qui permet de
 * montrer un jeu sans l'installer : une capture qui vient du compilateur ne
 * peut pas dater d'une version d'avant, ni d'un autre programme.
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { basename, extname, dirname, join } from 'node:path'
import { analyser } from '../compilateur/analyseur.js'
import { rassembler, traduire } from '../compilateur/inclusion.js'
import { fabriquerLaCartouche } from '../compilateur/cartouches.js'
import { CONSOLES } from '../compilateur/consoles.js'

/*
 * Les options se reconnaissent à leur double tiret, et sont ÔTÉES avant de
 * lire les arguments de position. Sans cela, « gb3.mjs jeu.cpp --capture »
 * aurait pris « --capture » pour un nom de fichier de sortie, et écrit une
 * cartouche dans un fichier ainsi nommé — sans rien dire.
 */
const brut = process.argv.slice(2)
const options = new Map()
const positions = []

for (let i = 0; i < brut.length; i++) {
  if (!brut[i].startsWith('--')) { positions.push(brut[i]); continue }
  const nom = brut[i].slice(2)
  const suivant = brut[i + 1]
  /* Une option prend sa valeur si la suivante n'est pas une autre option. */
  if (suivant !== undefined && !suivant.startsWith('--') && nom !== 'capture') {
    options.set(nom, suivant)
    i++
  } else if (nom === 'capture' && suivant !== undefined && /^\d+$/.test(suivant)) {
    options.set(nom, suivant)
    i++
  } else {
    options.set(nom, true)
  }
}

const entree = positions[0]
if (!entree) {
  console.error('usage : node outils/gb3.mjs <programme.cpp> [sortie.gb] ["TITRE"]')
  console.error('        --capture [images]     photographie l\'écran à côté du .gb')
  console.error('        --touches A,DROITE,…   appuie dessus avant de photographier')
  console.error('        --grossir N            N pixels de moniteur par pixel de console')
  console.error('        --console gb|gbc       Game Boy (4 nuances) OU Game Boy Color')
  console.error('        sans --console, le programme décide : une couleur posée → .gbc, sinon .gb')
  process.exit(1)
}

const nomCourt = basename(entree, extname(entree))
/* Le nom donné est une BASE : chaque cartouche y ajoute SON extension —
   « .gb » pour la Game Boy, « .gbc » pour la Color. */
const base = (positions[1] ?? join(dirname(entree), nomCourt)).replace(/[.]gbc?$/i, '')
const titre = positions[2] ?? nomCourt

/* Le compilateur ne touche jamais au disque : c'est ici qu'on lui donne les
   fichiers, et ici qu'on refuse ceux qui manquent avec un message lisible. */
const dossier = dirname(entree)
/* Chaque fichier lu est retenu : ils seront gravés dans la cartouche, tels
   qu'ils ont été écrits. */
const lus = new Map()
const lire = (nom) => {
  const chemin = nom === basename(entree) || nom === entree ? entree : join(dossier, nom)
  try {
    const texte = readFileSync(chemin, 'utf8')
    lus.set(nom, texte)
    return texte
  } catch {
    throw new Error(`fichier introuvable : « ${nom} » (cherché dans ${dossier})`)
  }
}

let rom
let cartouches = []
let details
let origine = []
try {
  const assemble = rassembler(lire, basename(entree))
  origine = assemble.origine
  const arbre = analyser(assemble.texte)
  /*
   * Pour quelle console ? — « gb » ou « gbc », voir « consoles.js ».
   *
   * Sans --console, c'est le programme qui décide : une seule fonction de
   * couleur, et c'est une cartouche Game Boy Color ; aucune, une Game Boy.
   * Un ancien « --console les-deux » est refusé, avec ce qu'il faut écrire.
   */
  const cible = options.has('console') ? String(options.get('console')) : null
  if (cible !== null && !(cible in CONSOLES)) {
    throw new Error(`« --console ${cible} » : c'est « gb » (Game Boy, 4 nuances) ou « gbc » (Game Boy Color) — l'un ou l'autre, jamais les deux`)
  }

  /* UNE cartouche, toujours. */
  cartouches = [fabriquerLaCartouche(arbre, titre, cible, { principal: basename(entree), fichiers: [...lus] })]
  rom = cartouches[0].rom

  const premier = cartouches[0]
  details = {
    octets: premier.octets.length,
    variables: premier.variables,
    fonctions: premier.fonctions,
    dessins: premier.dessins,
    memoire: premier.memoire,
    fichiers: new Set(origine.map((o) => o.fichier)).size,
    couleur: premier.couleur,
  }
} catch (erreur) {
  console.error(`${entree} — ${traduire(erreur.message, origine)}`)
  process.exit(1)
}

/*
 * On écrit la cartouche : « .gb » pour la Game Boy, « .gbc » pour la Color —
 * l'extension dit la console sans avoir à ouvrir le fichier.
 */
for (const c of cartouches) writeFileSync(base + c.extension, c.rom)

/** « 3 tuiles », « 1 tuile », « 0 tuile ». */
const compte = (combien, singulier, pluriel = singulier + 's') =>
  `${combien} ${combien > 1 ? pluriel : singulier}`

for (const c of cartouches) {
  console.log(`${base + c.extension}`)
  console.log(`  ${(c.rom.length / 1024).toFixed(0)} Ko de cartouche, ${c.octets.length} octets de programme`)
  console.log(`  ${CONSOLES[c.pour].etiquette}`)
  const g = c.rom.sourceGravee
  console.log(g?.grave
    ? `  programme C++ gravé dedans : ${g.octets} octets`
    : `  programme C++ PAS gravé : ${g?.raison ?? 'rien à graver'}`)
}

console.log(`  ${compte(details.fonctions.size, 'fonction')} : ` + [...details.fonctions.keys()].join(', '))
console.log(
  `  ${compte(details.variables.size, 'variable')}` +
    (details.memoire ? `, ${details.memoire} octets de mémoire de travail` : ''),
)
if (details.dessins.size) {
  const noms = [...details.dessins].map(([cle, d]) => `${d.appellation ?? cle} = ${d.numero}`)
  console.log(`  ${compte(details.dessins.size, 'dessin')} : ${noms.join(', ')}`)
}
if (details.fichiers > 1) {
  console.log(`  ${details.fichiers} fichiers assemblés en un seul programme`)
}
console.log(`  titre : « ${titre.toUpperCase().slice(0, 15)} »`)

/* ------------------------------------------------------- la capture */

/*
 * Photographier la cartouche qu'on vient de produire.
 *
 * On charge le .gb dans l'émulateur du projet — le même que la page fait
 * tourner —, on laisse passer des images, on appuie sur les touches demandées,
 * et l'on écrit l'écran. Le chargement se fait depuis les OCTETS produits, et
 * non depuis un état interne du compilateur : ce qui est photographié est
 * exactement ce que la console lira.
 */
if (options.has('capture')) {
  const { GameBoy } = await import('../emulateur.js')
  const { png } = await import('../compilateur/png.mjs')

  /*
   * Cinq bits par composante deviennent huit.
   *
   * Pas « x * 8 » : 31 donnerait 248, et le blanc ne serait jamais tout à
   * fait blanc. On recopie les trois bits de poids fort en bas, ce qui étale
   * 0-31 sur 0-255 exactement.
   */
  const huitBits = (cinq) => (cinq << 3) | (cinq >> 2)
  const NUANCES = [[0xe0, 0xf8, 0xd0], [0x88, 0xc0, 0x70], [0x34, 0x68, 0x56], [0x08, 0x18, 0x20]]
  const BOUTONS = {
    A: 'a', B: 'b', HAUT: 'up', BAS: 'down',
    GAUCHE: 'left', DROITE: 'right', START: 'start', SELECT: 'select',
  }

  const images = options.get('capture') === true ? 120 : Number(options.get('capture'))
  const grossir = Math.max(1, Math.min(8, Number(options.get('grossir') ?? 1)))
  const touches = String(options.get('touches') ?? '').split(',').filter(Boolean)
  const image = options.get('image') ?? base + '.png'

  const gb = new GameBoy()
  gb.loadRom(rom)
  for (let i = 0; i < images; i++) gb.runFrame()

  for (const nom of touches) {
    const bouton = BOUTONS[nom.trim().toUpperCase()]
    if (!bouton) {
      console.error(`  touche inconnue : « ${nom} » — ${Object.keys(BOUTONS).join(', ')}`)
      process.exit(1)
    }
    gb.setButton(bouton, true)
    for (let i = 0; i < 8; i++) gb.runFrame()
    gb.setButton(bouton, false)
    for (let i = 0; i < 20; i++) gb.runFrame()
  }

  const largeur = 160 * grossir
  const hauteur = 144 * grossir
  const enCouleur = gb.ppu.couleur
  const rvb = Buffer.alloc(largeur * hauteur * 3)
  for (let y = 0; y < hauteur; y++) {
    for (let x = 0; x < largeur; x++) {
      const source = ((y / grossir) | 0) * 160 + ((x / grossir) | 0)
      let r, v, b
      if (enCouleur) {
        const c = gb.ppu.couleurs[source]
        r = huitBits(c & 31)
        v = huitBits(c >> 5 & 31)
        b = huitBits(c >> 10 & 31)
      } else {
        [r, v, b] = NUANCES[gb.framebuffer[source] & 3]
      }
      const ou = (y * largeur + x) * 3
      rvb[ou] = r
      rvb[ou + 1] = v
      rvb[ou + 2] = b
    }
  }
  writeFileSync(image, png(largeur, hauteur, rvb))

  /* Un écran d'une seule nuance n'est pas une capture : c'est un jeu qui n'a
     pas démarré, ou qui attend une touche. On le dit plutôt que de rendre
     fièrement un rectangle vert. */
  const uni = new Set(gb.framebuffer).size === 1

  console.log(`  ${image}`)
  console.log(
    `    ${largeur} × ${hauteur}, après ${images} image${images > 1 ? 's' : ''}` +
      (touches.length ? `, puis ${touches.join(', ')}` : '') +
      (uni ? ' — ATTENTION : écran d\'une seule nuance' : ''),
  )
}

/**
 * L'onglet « 📦 Tout le jeu » : chaque élément du programme, rangé par groupe.
 *
 * Les ateliers rangent chaque création DANS LE TEXTE du programme, par son
 * nom : une tuile est un « Tuile SOL = {…} », un personnage un « Perso MARIO =
 * {…} », une musique un « Air THEME = {…} », une carte un bloc marqué et sa
 * fonction « FOND() »… C'est voulu — il n'y a pas de second endroit qui
 * pourrait contredire le code —, mais dans un grand jeu, on ne voit plus ce
 * qu'on a. Cet onglet le montre, d'un coup :
 *
 *   - six DOSSIERS : Personnages, Tuiles, Cartes, Scènes, Musiques, Couleurs ;
 *   - dans chacun, chaque élément avec sa miniature, son nom, le fichier et la
 *     ligne où il est écrit, et LA LIGNE À ÉCRIRE pour s'en servir (à copier) ;
 *   - un bouton qui l'ouvre dans son atelier, dans le bon onglet.
 *
 * Rien n'est écrit dans le programme ici : cet onglet LIT, il ne range rien
 * ailleurs. Tous les onglets du programme sont lus (principal.cpp et ses
 * fichiers voisins), pas seulement celui qui est ouvert.
 *
 * L'IMAGE DE CHAQUE DOSSIER est choisie par l'élève (un fichier image de son
 * ordinateur). Elle ne va pas dans la cartouche : c'est une décoration de
 * l'atelier, réduite à 96 × 96 pixels et gardée dans CE navigateur
 * (localStorage). Un autre navigateur, ou des données effacées, rendent
 * l'icône de départ — rien d'autre n'est perdu.
 */

import { lireDessins, peindre, NUANCES_ORIGINE as NUANCES } from './editeur-tuiles.js'
import { lireAirs, SILENCE, TENIR } from './editeur-airs.js'
import { listerLesCartes, lireGrilleDeCarte } from './editeur-carte.js'
import { listerLesScenes } from './editeur-scene.js'
import { aDesCouleurs, lireCouleurs, versHuit } from './editeur-couleurs.js'
import { estVerrouille } from './verrous.js'
import { compteurDUtilisations } from './supprimer.js'

/*
 * Les groupes, dans l'ordre de l'onglet.
 *
 *   icone    : l'image de départ du dossier, tant que l'élève n'en a pas choisi
 *   atelier  : l'onglet de création qui sait le modifier (montrerAtelier)
 *   vide     : ce qu'on dit quand le dossier est vide — où le créer
 *   appel    : la ligne à écrire pour s'en servir
 *   inclure  : les « #include » que cette ligne demande (l'atelier les écrit
 *              tout seul quand il crée l'élément ; on les rappelle ici)
 */
export const GROUPES = [
  {
    id: 'personnages', titre: 'Personnages', icone: '🧍', atelier: 'tuiles', genre: 'dessin',
    dit: 'les dessins de 16 × 16 ou 32 × 32 pixels, pour un héros, un ennemi, un boss',
    vide: 'Aucun personnage. Dans « ▦ Les tuiles », « + perso 16 × 16 » ou « + perso 32 × 32 » en crée un.',
    appel: (nom, e) => (e?.cote === 32
      ? `sprite32(0, 64, 56, ${nom});   // les lutins 0 à 15, au pixel (64, 56)`
      : `sprite16(0, 80, 72, ${nom});   // le lutin n° 0, au pixel (80, 72)`),
    inclure: (elements) => [
      ...(elements.some((e) => e.cote === 16) ? ['Perso', 'sprite16'] : []),
      ...(elements.some((e) => e.cote === 32) ? [...(elements.some((e) => e.cote === 16) ? [] : ['Perso']), 'sprite32'] : []),
    ],
    /* Chaque personnage dans son fichier : « perso_NOM.cpp » (ranger-personnages.js). */
    ranger: (e) => `perso_${e.nom}.cpp`,
  },
  {
    id: 'tuiles', titre: 'Tuiles', icone: '▦', atelier: 'tuiles', genre: 'dessin',
    dit: 'les dessins de 8 × 8 pixels, posés sur une case du fond',
    vide: 'Aucune tuile. Dans « ▦ Les tuiles », le bouton « ＋ » en crée une.',
    appel: (nom) => `poser(10, 9, ${nom});   // colonne 10, ligne 9`,
    inclure: ['Tuile', 'poser'],
  },
  {
    id: 'cartes', titre: 'Cartes', icone: '🗺', atelier: 'carte', genre: 'carte',
    dit: 'des écrans entiers dessinés au pixel ; chacune devient une fonction',
    vide: 'Aucune carte. Dans « 🗺 La carte », dessine un écran (ou « 📥 Importer une image »).',
    appel: (nom) => `${nom}();   // affiche la carte, quand TU le décides`,
    inclure: [],
  },
  {
    id: 'scenes', titre: 'Scènes jouables', icone: '🎮', atelier: 'carte',
    dit: 'une carte avec ses murs, son joueur, ses acteurs et ses événements',
    vide: 'Aucune scène. Dans « 🗺 La carte », pose des murs ou un joueur : la carte devient une scène.',
    appel: (nom) => `${nom}_entrer(${nom}_DEPART_X, ${nom}_DEPART_Y);   // dessine la scène, pose le joueur`,
    inclure: [],
  },
  {
    id: 'musiques', titre: 'Musiques', icone: '♪', atelier: 'airs', genre: 'air',
    dit: 'des mélodies qui jouent toutes seules pendant le jeu',
    vide: 'Aucune musique. Dans « ♪ Les airs », le bouton « ＋ » en crée une.',
    appel: (nom) => `jouer(${nom});   // la mélodie avance toute seule`,
    inclure: ['Air', 'jouer'],
  },
  {
    id: 'couleurs', titre: 'Couleurs', icone: '🎨', atelier: 'couleurs',
    dit: 'les huit palettes du fond et les huit des lutins (Game Boy Color)',
    vide: 'Aucune couleur écrite : le jeu est en quatre nuances. « 🎨 Les couleurs » en ajoute.',
    appel: () => '// rien à écrire : les couleurs s’appliquent au démarrage',
    inclure: [],
  },
]

/** Le numéro de la ligne où commence `position` dans `texte` (1 = la première). */
const ligneDe = (texte, position) => texte.slice(0, Math.max(0, position)).split('\n').length

/**
 * L'inventaire : tous les éléments de tous les fichiers, rangés par groupe.
 *
 * `fichiers` : des paires [nom du fichier, texte], principal.cpp d'abord.
 * Rend { personnages: [...], tuiles: [...], … } ; chaque élément porte
 * { nom, fichier, ligne, … } et de quoi dessiner sa miniature.
 */
export function inventaire(fichiers) {
  const groupes = Object.fromEntries(GROUPES.map((g) => [g.id, []]))
  fichiers = [...fichiers]
  const compter = compteurDUtilisations(fichiers)

  for (const [fichier, texte] of fichiers) {
    for (const d of lireDessins(texte)) {
      groupes[d.cote >= 16 ? 'personnages' : 'tuiles'].push({
        nom: d.nom, fichier, ligne: ligneDe(texte, d.debut), rangees: d.rangees, cote: d.cote,
        verrouille: estVerrouille(texte, d.nom),
      })
    }

    const scenes = new Set(listerLesScenes(texte))
    for (const nom of listerLesCartes(texte)) {
      groupes.cartes.push({
        nom, fichier, ligne: ligneDe(texte, texte.indexOf(`/* --- carte "${nom}" --- */`)),
        grille: lireGrilleDeCarte(texte, nom), scene: scenes.has(nom),
      })
    }
    for (const nom of scenes) {
      groupes.scenes.push({
        nom, fichier, ligne: ligneDe(texte, texte.indexOf(`/* --- scène "${nom}" --- */`)),
        grille: lireGrilleDeCarte(texte, nom),
      })
    }

    for (const a of lireAirs(texte)) {
      groupes.musiques.push({ nom: a.nom, fichier, ligne: ligneDe(texte, a.debut), pas: a.pas })
    }

    if (aDesCouleurs(texte)) {
      const i = texte.search(/\bcouleur(?:Fond|Lutin)\s*\(\s*\d/)
      groupes.couleurs.push({
        nom: 'les palettes', fichier, ligne: ligneDe(texte, i),
        fond: lireCouleurs(texte, false), lutins: lireCouleurs(texte, true),
      })
    }
  }
  /* Combien de fois chaque élément sert-il, dans tout le projet ? */
  for (const groupe of GROUPES) {
    if (!groupe.genre) continue
    for (const e of groupes[groupe.id]) e.emplois = compter(e.nom, groupe.genre)
  }
  return groupes
}

/* ------------------------------------------------------- les miniatures */

/** Une carte (ou une scène), réduite : un pixel de la toile par pixel de l'écran. */
function dessinerGrille(toile, grille) {
  const lignes = grille.length
  const colonnes = grille[0]?.length ?? 0
  toile.width = colonnes
  toile.height = lignes
  const ctx = toile.getContext('2d')
  const image = ctx.createImageData(colonnes, lignes)
  const rvb = NUANCES.map((c) => [1, 3, 5].map((k) => parseInt(c.slice(k, k + 2), 16)))
  for (let y = 0; y < lignes; y++) {
    for (let x = 0; x < colonnes; x++) {
      const [r, v, b] = rvb[grille[y][x] & 3]
      const i = (y * colonnes + x) * 4
      image.data.set([r, v, b, 255], i)
    }
  }
  ctx.putImageData(image, 0, 0)
}

/** Une mélodie : une barre par pas, d'autant plus haute que la note est aiguë. */
function dessinerAir(toile, pas) {
  const n = Math.max(1, Math.min(pas.length, 64))
  toile.width = n * 3
  toile.height = 40
  const ctx = toile.getContext('2d')
  ctx.fillStyle = NUANCES[0]
  ctx.fillRect(0, 0, toile.width, toile.height)
  ctx.fillStyle = NUANCES[3]
  const hauteurs = pas.slice(0, n).map((p) => (typeof p.hauteur === 'number' ? p.hauteur : null))
  const connues = hauteurs.filter((h) => h !== null)
  const bas = Math.min(...connues, 0)
  const haut = Math.max(...connues, 1)
  hauteurs.forEach((h, i) => {
    if (h === null || pas[i].hauteur === SILENCE || pas[i].hauteur === TENIR) return
    const y = 36 - Math.round(((h - bas) / Math.max(1, haut - bas)) * 30)
    ctx.fillRect(i * 3, y, 2, 4)
  })
}

/** Les palettes : une rangée de quatre pastilles par palette (fond, puis lutins). */
function dessinerPalettes(toile, fond, lutins) {
  toile.width = 64
  toile.height = 32
  const ctx = toile.getContext('2d')
  ;[...fond, ...lutins].forEach((palette, p) => {
    palette.forEach(([r, v, b], t) => {
      ctx.fillStyle = `rgb(${versHuit(r)}, ${versHuit(v)}, ${versHuit(b)})`
      ctx.fillRect((p % 4) * 16 + t * 4, Math.floor(p / 4) * 8, 4, 8)
    })
  })
}

/* ------------------------------------------------------- l'image des dossiers */

const CLE_IMAGE = (groupe) => `gameboy3-dossier-${groupe}`

function lireImage(groupe) {
  try { return localStorage.getItem(CLE_IMAGE(groupe)) } catch { return null }
}

function ecrireImage(groupe, adresse) {
  try {
    if (adresse) localStorage.setItem(CLE_IMAGE(groupe), adresse)
    else localStorage.removeItem(CLE_IMAGE(groupe))
    return true
  } catch {
    return false // stockage plein ou interdit : l'icône de départ reste
  }
}

/**
 * Une image choisie, réduite à 96 × 96 et recadrée au centre — comme une
 * pochette. Rendue en adresse « data: » JPEG, quelques kilo-octets.
 */
async function vignette(fichier) {
  const adresse = URL.createObjectURL(fichier)
  try {
    const image = new Image()
    await new Promise((fait, rate) => {
      image.onload = fait
      image.onerror = () => rate(new Error(`« ${fichier.name} » n’est pas une image que le navigateur sache lire`))
      image.src = adresse
    })
    const cote = 96
    const toile = document.createElement('canvas')
    toile.width = cote
    toile.height = cote
    const petit = Math.min(image.naturalWidth, image.naturalHeight)
    const sx = (image.naturalWidth - petit) / 2
    const sy = (image.naturalHeight - petit) / 2
    toile.getContext('2d').drawImage(image, sx, sy, petit, petit, 0, 0, cote, cote)
    return toile.toDataURL('image/jpeg', 0.85)
  } finally {
    URL.revokeObjectURL(adresse)
  }
}

/* ------------------------------------------------------- l'onglet */

/** Un élément HTML, en une ligne. */
function el(balise, attributs = {}, ...enfants) {
  const e = document.createElement(balise)
  for (const [cle, valeur] of Object.entries(attributs)) {
    if (cle === 'class') e.className = valeur
    else if (cle.startsWith('on')) e.addEventListener(cle.slice(2), valeur)
    else e.setAttribute(cle, valeur)
  }
  e.append(...enfants.filter((x) => x !== null && x !== undefined))
  return e
}

async function copier(texte, bouton) {
  try {
    await navigator.clipboard.writeText(texte)
    bouton.textContent = '✓ copié'
  } catch {
    bouton.textContent = 'sélectionne et copie à la main'
  }
  setTimeout(() => { bouton.textContent = '📋 copier' }, 1500)
}

/**
 * Installe l'onglet.
 *
 *   zone          : l'élément où dessiner l'onglet
 *   lireFichiers  : () => paires [nom, texte] de tout le programme, à jour
 *   ouvrir        : (groupe, nom, fichier) => ouvrir l'élément dans son atelier
 *   ranger        : (groupe) => un message ; range le groupe dans son fichier
 *                   (le dossier Personnages : « personnages.cpp »)
 */
export function installer({ zone, lireFichiers, ouvrir, ranger = null, verrouiller = null, supprimer = null }) {
  let filtre = ''
  const ouverts = new Set(GROUPES.map((g) => g.id)) // les dossiers dépliés

  const recherche = el('input', {
    type: 'search', class: 'tout-recherche', placeholder: '🔍 chercher un élément par son nom…',
    'aria-label': 'chercher un élément par son nom',
  })
  recherche.addEventListener('input', () => { filtre = recherche.value.trim().toLowerCase(); rafraichir() })

  const resume = el('p', { class: 'aide' })
  const dossiers = el('div', { class: 'tout-dossiers' })
  zone.append(
    el('p', { class: 'aide' },
      'Tout ce que ton jeu contient, rangé par dossier. Chaque élément vit dans le code, sous son nom : ',
      'ici, tu vois où il est écrit, et la ligne à écrire pour t’en servir. ',
      'L’image de chaque dossier se change avec « 🖼 » (elle reste dans ce navigateur, pas dans la cartouche).'),
    recherche, resume, dossiers,
  )

  function carte(groupe, e) {
    const toile = el('canvas', { class: 'tout-miniature', 'aria-hidden': 'true' })
    if (e.rangees) {
      toile.width = e.cote
      toile.height = e.cote
      peindre(toile, e.rangees, e.cote)
    } else if (e.grille) {
      dessinerGrille(toile, e.grille)
    } else if (e.pas) {
      dessinerAir(toile, e.pas)
    } else if (e.fond) {
      dessinerPalettes(toile, e.fond, e.lutins)
    }

    const appel = groupe.appel(e.nom, e)
    const boutonCopier = el('button', { type: 'button', class: 'petit', title: 'copier cette ligne, à coller dans ton programme' }, '📋 copier')
    boutonCopier.addEventListener('click', () => copier(appel.replace(/\s+\/\/.*$/, ''), boutonCopier))
    const boutonOuvrir = el('button', { type: 'button', class: 'petit', title: `ouvrir dans son atelier (${e.fichier})` }, '✏ ouvrir')
    boutonOuvrir.addEventListener('click', () => ouvrir(groupe, e.nom, e.fichier))
    /* 🔒 / 🔓 : pour les dessins (tuiles, personnages). */
    const boutonVerrou = verrouiller && e.rangees
      ? el('button', { type: 'button', class: 'petit', title: e.verrouille ? `${e.nom} redevient modifiable` : `${e.nom} devient un modèle : on s’en sert, on ne le modifie plus` },
        e.verrouille ? '🔓 déverrouiller' : '🔒 verrouiller')
      : null
    boutonVerrou?.addEventListener('click', () => { verrouiller(e.nom, e.fichier, !e.verrouille); rafraichir() })
    /* 🗑 : seulement ce qui ne sert nulle part, et qui n'est pas verrouillé. */
    const pourquoiPas = e.verrouille ? `🔒 ${e.nom} est verrouillé : un modèle ne se supprime pas`
      : e.emplois ? `${e.nom} est utilisé ${e.emplois} fois dans le projet : retire d’abord ces lignes` : ''
    const boutonSupprimer = supprimer && groupe.genre
      ? el('button', { type: 'button', class: 'petit', title: pourquoiPas || `supprimer ${e.nom} du programme — « ↶ » le fait revenir` }, '🗑 supprimer')
      : null
    if (boutonSupprimer && pourquoiPas) boutonSupprimer.disabled = true
    boutonSupprimer?.addEventListener('click', () => {
      if (!confirm(`Supprimer « ${e.nom} » du programme ?\n\nIl n’est utilisé nulle part. « ↶ » (Ctrl+Z) le fera revenir.`)) return
      const dit = supprimer(groupe, e.nom)
      rafraichir()
      resume.textContent = dit
    })
    const emploi = groupe.genre
      ? el('span', { class: 'tout-emploi' + (e.emplois ? '' : ' jamais') }, e.emplois ? `✔ utilisé ${e.emplois} fois` : '∅ jamais utilisé')
      : null

    return el('div', { class: 'tout-element' },
      el('div', { class: 'tout-cadre' }, toile),
      el('div', { class: 'tout-texte' },
        el('b', {}, (e.verrouille ? '🔒 ' : '') + e.nom),
        e.scene ? el('span', { class: 'tout-marque', title: 'cette carte a aussi une scène jouable' }, '🎮 scène') : null,
        e.cote ? el('span', { class: 'tout-ou' }, `${e.cote} × ${e.cote} pixels`) : null,
        el('span', { class: 'tout-ou' }, `${e.fichier}, ligne ${e.ligne}`),
        emploi,
        el('code', { class: 'tout-appel' }, appel),
        el('span', { class: 'tout-actions' }, boutonCopier, boutonOuvrir, boutonVerrou, boutonSupprimer)),
    )
  }

  function couverture(groupe, tous = []) {
    const image = lireImage(groupe.id)
    const champ = el('input', { type: 'file', accept: 'image/*', hidden: '' })
    const message = el('span', { class: 'aide' })
    champ.addEventListener('change', async () => {
      const fichier = champ.files?.[0]
      champ.value = ''
      if (!fichier) return
      try {
        const adresse = await vignette(fichier)
        if (!ecrireImage(groupe.id, adresse)) message.textContent = 'le navigateur refuse de garder l’image'
        rafraichir()
      } catch (erreur) {
        message.textContent = erreur.message
      }
    })
    const choisir = el('button', { type: 'button', class: 'petit', title: 'choisir une image sur ton ordinateur pour ce dossier' }, '🖼')
    choisir.addEventListener('click', (ev) => { ev.preventDefault(); champ.click() })
    const retirer = image
      ? el('button', { type: 'button', class: 'petit', title: 'remettre l’icône de départ' }, '✕')
      : null
    retirer?.addEventListener('click', (ev) => { ev.preventDefault(); ecrireImage(groupe.id, null); rafraichir() })

    const pochette = image
      ? el('img', { class: 'tout-pochette', src: image, alt: `image du dossier ${groupe.titre}` })
      : el('span', { class: 'tout-pochette tout-icone', 'aria-hidden': 'true' }, groupe.icone)
    /* Ranger le dossier dans son fichier : seulement s'il a de quoi, et pas déjà tout rangé. */
    const aRanger = groupe.ranger && ranger && tous.some((e) => e.fichier !== groupe.ranger(e))
    const boutonRanger = aRanger
      ? el('button', { type: 'button', class: 'petit', title: 'chaque personnage dans son propre fichier, perso_NOM.cpp, listé par personnages.cpp — principal.cpp ne reçoit qu’une ligne ; « ↶ » le défait' }, '📁 Un fichier par personnage')
      : null
    boutonRanger?.addEventListener('click', (ev) => {
      ev.preventDefault()
      const dit = ranger(groupe)
      rafraichir()
      if (dit) zone.querySelector(`[data-groupe="${groupe.id}"] .tout-outils-dossier .aide`)?.replaceChildren(dit)
    })
    return { pochette, outils: el('span', { class: 'tout-outils-dossier' }, boutonRanger, choisir, retirer, champ, message) }
  }

  function rafraichir() {
    let groupes
    try {
      groupes = inventaire(lireFichiers())
    } catch (erreur) {
      dossiers.replaceChildren(el('p', { class: 'aide' }, `L’inventaire n’a pas pu être lu : ${erreur.message}`))
      return
    }
    const total = GROUPES.reduce((n, g) => n + groupes[g.id].length, 0)
    resume.textContent = total
      ? `${total} élément${total > 1 ? 's' : ''} dans ton jeu.`
      : 'Ton jeu ne contient encore aucun élément : dessine une tuile, un personnage, une carte ou une musique dans les autres onglets.'

    dossiers.replaceChildren(...GROUPES.map((groupe) => {
      const tous = groupes[groupe.id]
      const montres = filtre ? tous.filter((e) => e.nom.toLowerCase().includes(filtre)) : tous
      const { pochette, outils } = couverture(groupe, tous)
      const dossier = el('details', { class: 'tout-dossier', 'data-groupe': groupe.id },
        el('summary', {},
          pochette,
          el('span', { class: 'tout-titre' },
            el('span', {}, el('b', {}, `${groupe.titre} `), el('span', { class: 'tout-compte' }, `(${tous.length})`)),
            el('span', { class: 'tout-dit' }, groupe.dit)),
          outils),
        montres.length
          ? el('div', { class: 'tout-grille' }, ...montres.map((e) => carte(groupe, e)))
          : el('p', { class: 'aide' }, filtre && tous.length ? 'Aucun nom ne correspond à la recherche.' : groupe.vide),
        (() => {
          const noms = typeof groupe.inclure === 'function' ? groupe.inclure(tous) : groupe.inclure
          return noms.length && tous.length
            ? el('p', { class: 'aide tout-inclure' }, 'Lignes #include que ces appels demandent (l’atelier les écrit tout seul) : ',
              ...noms.map((n) => el('code', {}, `#include <${n}> `)))
            : null
        })(),
      )
      if (ouverts.has(groupe.id)) dossier.open = true
      dossier.addEventListener('toggle', () => { if (dossier.open) ouverts.add(groupe.id); else ouverts.delete(groupe.id) })
      return dossier
    }))
  }

  return { rafraichir }
}

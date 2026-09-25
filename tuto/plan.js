/**
 * Poser ses tuiles à la souris, sur un plan de l'écran.
 *
 * On voit les carrés qu'on a dessinés, on en choisit un, on trace une zone sur
 * l'écran — et le programme reçoit ses `poser(colonne, ligne, NOM)`. **Jamais
 * un numéro** : le nom du dessin est ce qu'on lit, et ce qui reste juste le
 * jour où l'on ajoute une tuile avant lui.
 *
 * Comme l'atelier de dessin, ce module ne garde rien de son côté : il lit le
 * bloc marqué du programme, et il le réécrit. Le texte reste la seule vérité.
 */

import { lireDessins, NUANCES, nuanceDe } from '../editeur-tuiles.js'

const COLONNES = 20
const LIGNES = 18

/* Le bloc que l'outil possède. Ce qui est en dehors n'est jamais touché : on
   peut écrire le reste du programme à la main sans rien perdre. */

const DEBUT = '// PLAN'
const FIN = '// FIN DU PLAN'

const POSER = /^\s*poser\(\s*(\d+)\s*,\s*(\d+)\s*,\s*([A-Za-z_$][\w$]*)\s*\)\s*;?\s*$/

/** Ce que le plan contient déjà : une case → le nom d'une tuile. */
export function lirePlan(source) {
  const plan = new Map()
  const i = source.indexOf(DEBUT)
  const j = source.indexOf(FIN)
  if (i < 0 || j < 0 || j < i) return plan

  for (const ligne of source.slice(i + DEBUT.length, j).split('\n')) {
    const coup = ligne.match(POSER)
    if (coup) plan.set(`${coup[1]},${coup[2]}`, coup[3])
  }

  return plan
}

/** Réécrit le bloc du plan, en gardant tout le reste du programme intact. */
export function ecrirePlan(source, plan) {
  const i = source.indexOf(DEBUT)
  const j = source.indexOf(FIN)
  if (i < 0 || j < 0 || j < i) return source

  /* Rangé par ligne puis par colonne : le code se relit comme on lit l'écran,
     de haut en bas et de gauche à droite. */
  const cases = [...plan.entries()]
    .map(([ou, nom]) => {
      const [colonne, ligne] = ou.split(',').map(Number)
      return { colonne, ligne, nom }
    })
    .sort((a, b) => a.ligne - b.ligne || a.colonne - b.colonne)

  /* Le bloc du plan vit maintenant DANS main() : on reprend l'indentation de
     la ligne « // PLAN » pour que le code écrit s'aligne sur ce qui l'entoure.
     Un plan collé à la marge au milieu d'une fonction indentée se lit mal, et
     donne l'impression que l'outil a abîmé le fichier. */
  const avant = source.slice(0, i)
  const marge = avant.slice(avant.lastIndexOf('\n') + 1).match(/^[ \t]*/)[0]

  const lignes = cases.length
    ? cases.map((c) => `${marge}poser(${c.colonne}, ${c.ligne}, ${c.nom});`)
    : [`${marge}// (rien de posé pour l’instant : choisis une tuile et trace une zone)`]

  return source.slice(0, i + DEBUT.length) + '\n' + lignes.join('\n') + '\n' + marge + source.slice(j)
}

/**
 * Installe le plan dans un élément.
 *
 * `lireSource` / `ecrireSource` sont fournis par la page : le module ne connaît
 * pas le champ de texte, il ne connaît que le programme.
 */
export function installer({ zone, lireSource, ecrireSource, surChangement }) {
  let choisie = null // le nom de la tuile en main, ou null pour la gomme
  let trace = null // la zone en cours de tracé

  const bande = document.createElement('div')
  bande.className = 'bande'

  const toile = document.createElement('canvas')
  toile.width = COLONNES * 8
  toile.height = LIGNES * 8
  toile.className = 'plan'

  const compte = document.createElement('p')
  compte.className = 'aide'

  zone.append(bande, toile, compte)

  const ctx = toile.getContext('2d')

  /* --- les tuiles qu'on peut poser --- */

  function boutonTuile(dessin) {
    const bouton = document.createElement('button')
    bouton.type = 'button'
    bouton.className = 'tuile' + ((dessin ? dessin.nom : null) === choisie ? ' choisie' : '')
    bouton.title = dessin ? `${dessin.nom} — le nom sera écrit dans le code` : 'la gomme : remet du vide'

    const apercu = document.createElement('canvas')
    apercu.width = 8
    apercu.height = 8
    const c = apercu.getContext('2d')

    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        c.fillStyle = dessin ? NUANCES[nuanceDe(dessin.rangees[y][x])] : NUANCES[0]
        c.fillRect(x, y, 1, 1)
      }
    }

    const nom = document.createElement('span')
    nom.textContent = dessin ? dessin.nom : 'gomme'

    bouton.append(apercu, nom)
    bouton.addEventListener('click', () => {
      choisie = dessin ? dessin.nom : null
      rafraichirBande()
    })

    return bouton
  }

  function rafraichirBande() {
    const dessins = lireDessins(lireSource()).filter((d) => d.cote === 8)
    bande.textContent = ''

    if (dessins.length === 0) {
      const vide = document.createElement('p')
      vide.className = 'aide'
      vide.textContent = 'Ce programme ne dessine aucune tuile de huit sur huit.'
      bande.append(vide)
      return
    }

    /* Rien en main au départ : la première tuile est prise d'office, sinon le
       premier tracé ne fait rien et l'on croit que l'outil est cassé. */
    if (choisie === null && trace === null && !bande.dataset.commence) {
      choisie = dessins[0].nom
      bande.dataset.commence = 'oui'
    }

    for (const dessin of dessins) bande.append(boutonTuile(dessin))
    bande.append(boutonTuile(null))
  }

  /* --- le plan --- */

  function dessinsParNom() {
    const par = new Map()
    for (const d of lireDessins(lireSource())) par.set(d.nom, d)
    return par
  }

  function peindre() {
    const plan = lirePlan(lireSource())
    const par = dessinsParNom()

    ctx.fillStyle = NUANCES[0]
    ctx.fillRect(0, 0, toile.width, toile.height)

    for (const [ou, nom] of plan) {
      const [colonne, ligne] = ou.split(',').map(Number)
      const dessin = par.get(nom)
      if (!dessin || dessin.cote !== 8) continue

      for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
          ctx.fillStyle = NUANCES[nuanceDe(dessin.rangees[y][x])]
          ctx.fillRect(colonne * 8 + x, ligne * 8 + y, 1, 1)
        }
      }
    }

    /* La zone en cours, en surimpression : on voit ce qu'on va poser avant de
       lâcher le bouton. */
    if (trace) {
      const { g, h, d, b } = bornes(trace)
      ctx.fillStyle = '#9bbc5a66'
      ctx.fillRect(g * 8, h * 8, (d - g + 1) * 8, (b - h + 1) * 8)
    }

    const posees = plan.size
    compte.textContent = posees === 0
      ? 'Choisis une tuile, puis trace une zone sur le plan.'
      : `${posees} case${posees > 1 ? 's' : ''} posée${posees > 1 ? 's' : ''} — le code s’écrit tout seul dans l’éditeur.`
  }

  const bornes = ({ x1, y1, x2, y2 }) => ({
    g: Math.min(x1, x2), d: Math.max(x1, x2),
    h: Math.min(y1, y2), b: Math.max(y1, y2),
  })

  const caseSous = (evenement) => {
    const cadre = toile.getBoundingClientRect()
    const x = Math.floor(((evenement.clientX - cadre.left) / cadre.width) * COLONNES)
    const y = Math.floor(((evenement.clientY - cadre.top) / cadre.height) * LIGNES)
    return { x: Math.max(0, Math.min(COLONNES - 1, x)), y: Math.max(0, Math.min(LIGNES - 1, y)) }
  }

  toile.addEventListener('pointerdown', (e) => {
    const { x, y } = caseSous(e)
    trace = { x1: x, y1: y, x2: x, y2: y }
    toile.setPointerCapture(e.pointerId)
    peindre()
  })

  toile.addEventListener('pointermove', (e) => {
    if (!trace) return
    const { x, y } = caseSous(e)
    trace.x2 = x
    trace.y2 = y
    peindre()
  })

  const relacher = () => {
    if (!trace) return

    const { g, h, d, b } = bornes(trace)
    trace = null

    const plan = lirePlan(lireSource())

    for (let ligne = h; ligne <= b; ligne++) {
      for (let colonne = g; colonne <= d; colonne++) {
        if (choisie === null) plan.delete(`${colonne},${ligne}`)
        else plan.set(`${colonne},${ligne}`, choisie)
      }
    }

    ecrireSource(ecrirePlan(lireSource(), plan))
    peindre()
    surChangement()
  }

  toile.addEventListener('pointerup', relacher)
  toile.addEventListener('pointercancel', relacher)

  rafraichirBande()
  peindre()

  return {
    rafraichir() {
      const noms = new Set(lireDessins(lireSource()).map((d) => d.nom))
      if (choisie !== null && !noms.has(choisie)) choisie = null
      delete bande.dataset.commence
      rafraichirBande()
      peindre()
    },
  }
}

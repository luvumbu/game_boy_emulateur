/**
 * L'éditeur de code, à la manière de VS Code : les numéros de ligne, les
 * couleurs du C++, la ligne du curseur surlignée, la ligne fautive en rouge.
 *
 * Le champ de texte RESTE le champ de texte. Tout ce que la page sait déjà
 * faire avec lui — la frappe, l'indentation, les parenthèses qui se ferment,
 * l'annulation, les ateliers qui le réécrivent — continue sans changer une
 * ligne. On pose simplement, SOUS lui, une copie colorée de son texte, et à
 * sa gauche une colonne de numéros ; le champ devient transparent, et son
 * curseur et sa sélection restent visibles par-dessus.
 *
 * La copie doit tomber pile sous le texte : même police, même taille, même
 * interligne, même retour à la ligne. Elle relit donc le style du champ à
 * chaque rafraîchissement plutôt que de le supposer — un réglage de police ou
 * de taille change le champ, et la copie suit.
 */

import { FONCTIONS, CONSTANTES, forme } from './aide-fonctions.js'

const SAUT = String.fromCharCode(10)

/* Les mots du langage, rangés comme VS Code les colore. */
const CONTROLE = new Set(['if', 'else', 'while', 'for', 'do', 'return', 'break', 'continue', 'switch', 'case', 'default', 'goto'])
const TYPES = new Set([
  'int', 'uint8_t', 'int8_t', 'uint16_t', 'int16_t', 'uint32_t', 'int32_t', 'bool', 'void', 'char',
  'unsigned', 'signed', 'short', 'long', 'const', 'static', 'struct', 'enum', 'auto', 'inline',
  'Tuile', 'Perso', 'Air',
])
const VALEURS = new Set(['true', 'false', 'NULL', 'nullptr'])
/* Les fonctions de la console (voir BUILTINS dans compilateur/emetteur.js). */
const CONSOLE = new Set([
  'texte', 'poser', 'lire', 'image', 'bouton', 'hasard', 'semer', 'ecran',
  'sprite', 'sprite16', 'cacher', 'cacher16', 'defiler',
  'panneau', 'cacherPanneau', 'effacerPanneau', 'poserPanneau', 'lirePanneau', 'textePanneau',
  'effacer', 'couleurFond', 'couleurLutin', 'teindre', 'teindreLutin',
  'paletteFond', 'paletteLutins', 'retard', 'images',
  'note', 'bruit', 'silence', 'volumeSon', 'jouer', 'airFini', 'sauver', 'sauvegarde',
  'nombre', 'nombrePanneau', 'changerDessin', 'teindrePanneau',
])

const echapper = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const bout = (classe, t) => `<span class="c-${classe}">${echapper(t)}</span>`

/*
 * Colore UNE ligne. `dansCommentaire` dit si la ligne commence au milieu d'un
 * « /* … * / » ouvert plus haut ; la fonction rend la ligne colorée et l'état
 * pour la suivante.
 *
 * `suivi` est le nom sous le curseur : ses apparitions DANS LE CODE (pas dans
 * un commentaire ni dans un texte entre guillemets) sont marquées, et leurs
 * colonnes rendues dans `trouves`.
 */
export function colorerLigne(ligne, dansCommentaire = false, suivi = null, marques = null) {
  const trouves = []
  let html = ''
  let i = 0
  const n = ligne.length

  if (dansCommentaire) {
    const fin = ligne.indexOf('*/')
    if (fin < 0) return { html: bout('commentaire', ligne), dansCommentaire: true, trouves }
    html += bout('commentaire', ligne.slice(0, fin + 2))
    i = fin + 2
  }

  /* Une directive : « #include "autre.cpp" ». */
  if (/^\s*#/.test(ligne.slice(i))) {
    const m = ligne.slice(i).match(/^(\s*#\s*\w+)(.*)$/)
    if (m) {
      const reste = m[2].replace(/("[^"]*"|<[^>]*>)/, '\u0000$1\u0000').split('\u0000')
      return {
        html: html + bout('directive', m[1]) + reste.map((morceau, k) => (k === 1 ? bout('chaine', morceau) : echapper(morceau))).join(''),
        dansCommentaire: false, trouves,
      }
    }
  }

  while (i < n) {
    const c = ligne[i]
    const deux = ligne.slice(i, i + 2)
    if (deux === '//') { html += bout('commentaire', ligne.slice(i)); i = n; break }
    if (deux === '/*') {
      const fin = ligne.indexOf('*/', i + 2)
      if (fin < 0) return { html: html + bout('commentaire', ligne.slice(i)), dansCommentaire: true, trouves }
      html += bout('commentaire', ligne.slice(i, fin + 2))
      i = fin + 2
      continue
    }
    if (c === '"' || c === "'") {
      let j = i + 1
      while (j < n && ligne[j] !== c) j += ligne[j] === '\\' ? 2 : 1
      html += bout('chaine', ligne.slice(i, Math.min(n, j + 1)))
      i = j + 1
      continue
    }
    if (/[0-9]/.test(c)) {
      const m = ligne.slice(i).match(/^(0[xX][0-9a-fA-F]+|0[bB][01]+|\d+)/)
      html += bout('nombre', m[0])
      i += m[0].length
      continue
    }
    if (/[A-Za-z_]/.test(c)) {
      const mot = ligne.slice(i).match(/^[A-Za-z_]\w*/)[0]
      const suite = ligne.slice(i + mot.length).match(/^\s*\(/)
      let classe = null
      if (CONTROLE.has(mot)) classe = 'controle'
      else if (TYPES.has(mot)) classe = 'type'
      else if (VALEURS.has(mot)) classe = 'valeur'
      else if (CONSOLE.has(mot) && suite) classe = 'console'
      else if (suite) classe = 'fonction'
      else if (/^[A-Z][A-Z0-9_]+$/.test(mot)) classe = 'constante'
      if (suivi && mot === suivi) {
        trouves.push(i)
        html += `<span class="occ${classe ? ' c-' + classe : ''}">${echapper(mot)}</span>`
      } else {
        html += classe ? bout(classe, mot) : echapper(mot)
      }
      i += mot.length
      continue
    }
    /* Le reste, d'un bloc jusqu'au prochain signe intéressant. */
    let j = i + 1
    while (j < n && !/[A-Za-z_0-9"'/#]/.test(ligne[j])) j++
    /* Une accolade (ou parenthèse, crochet) de la paire sous le curseur : encadrée. */
    for (let k = i; k < j; k++) {
      const marque = marques?.get(k)
      html += marque ? `<span class="${marque}">${echapper(ligne[k])}</span>` : echapper(ligne[k])
    }
    i = j
  }
  return { html, dansCommentaire: false, trouves }
}

/**
 * Les paires d'accolades, de parenthèses et de crochets du texte.
 *
 * Rend une table position → position de la jumelle (-1 : sans jumelle).
 * Les signes dans un commentaire ou entre guillemets ne comptent pas — un
 * « { » dans un texte à afficher n'ouvre rien.
 */
export function lesPaires(texte) {
  const paires = new Map()
  const pile = []
  const OUVRE = { '(': ')', '[': ']', '{': '}' }
  const FERME = { ')': '(', ']': '[', '}': '{' }
  for (let i = 0; i < texte.length; i++) {
    const c = texte[i]
    const d = texte[i + 1]
    if (c === '/' && d === '/') { while (i < texte.length && texte[i] !== SAUT) i++; continue }
    if (c === '/' && d === '*') { const fin = texte.indexOf('*/', i + 2); i = fin < 0 ? texte.length : fin + 1; continue }
    if (c === '"' || c === "'") {
      let j = i + 1
      while (j < texte.length && texte[j] !== c && texte[j] !== SAUT) j += texte[j] === '\\' ? 2 : 1
      i = j
      continue
    }
    if (OUVRE[c]) pile.push(i)
    else if (FERME[c]) {
      /* La dernière ouverte du MÊME genre : une « ) » ne ferme pas une « { ». */
      let k = pile.length - 1
      while (k >= 0 && texte[pile[k]] !== FERME[c]) k--
      if (k < 0) { paires.set(i, -1); continue }
      for (const orpheline of pile.splice(k + 1)) paires.set(orpheline, -1)
      const a = pile.pop()
      paires.set(a, i)
      paires.set(i, a)
    }
  }
  for (const orpheline of pile) paires.set(orpheline, -1)
  return paires
}

/** Les mots du langage ne sont pas suivis : tout le code serait surligné. */
const PAS_SUIVI = new Set([...CONTROLE, ...TYPES, ...VALEURS])

/** Le nom (variable, fonction, constante) sous le curseur, ou null. */
export function nomSousLeCurseur(texte, debut, fin = debut) {
  const estLettre = (c) => /\w/.test(c ?? '')
  let a = debut
  while (a > 0 && estLettre(texte[a - 1])) a--
  let b = debut
  while (b < texte.length && estLettre(texte[b])) b++
  if (fin !== debut && (a !== debut || b !== fin)) return null // une sélection qui n'est pas un mot entier
  const mot = texte.slice(a, b)
  if (!/^[A-Za-z_]\w*$/.test(mot) || PAS_SUIVI.has(mot)) return null
  return mot
}

/**
 * Installe l'éditeur autour du champ.
 *
 *   champ           le <textarea> du programme
 *   actif()         le réglage : l'éditeur riche, ou le champ nu
 *   ligneFautive()  le numéro de la ligne que la compilation refuse, ou null
 *
 * Rend { rafraichir() } : à appeler quand le texte change sans que le champ
 * le sache (un atelier qui le réécrit) — la frappe, elle, est suivie seule.
 */
export function installerEditeur({ champ, actif = () => true, ligneFautive = () => null, messageFautif = () => '' }) {
  const parent = champ.parentElement
  parent.classList.add('porte-editeur')

  const fond = document.createElement('div')
  fond.className = 'editeur-fond'
  fond.setAttribute('aria-hidden', 'true')
  const gouttiere = document.createElement('div')
  gouttiere.className = 'editeur-gouttiere'
  const numeros = document.createElement('div')
  numeros.className = 'editeur-numeros'
  gouttiere.append(numeros)
  const vue = document.createElement('div')
  vue.className = 'editeur-vue'
  const bandeCurseur = document.createElement('div')
  bandeCurseur.className = 'editeur-ligne-courante'
  const bandeFaute = document.createElement('div')
  bandeFaute.className = 'editeur-ligne-fautive'
  const texte = document.createElement('div')
  texte.className = 'editeur-texte'
  /* La règle, à droite : un trait par apparition du nom suivi, sur la hauteur
     de TOUT le fichier — on voit d'un coup d'œil où il se trouve. */
  const regle = document.createElement('div')
  regle.className = 'editeur-regle'
  vue.append(bandeFaute, bandeCurseur, texte)
  fond.append(gouttiere, vue, regle)
  parent.insertBefore(fond, champ)

  /* Sous le code : le nom suivi, combien de fois, et à quelles lignes — un clic y emmène. */
  const barre = document.createElement('div')
  barre.className = 'editeur-occurrences'
  barre.hidden = true
  /* Une rangée de hauteur FIXE sous le code, toujours là : les barres y paraissent et
     disparaissent sans que le champ change de taille — le code ne saute plus. */
  const pied = document.createElement('div')
  pied.className = 'editeur-pied'
  champ.after(pied)
  pied.append(barre)

  /* Sous le code aussi : la paire d'accolades sous le curseur, et où est la jumelle. */
  const barrePaire = document.createElement('div')
  barrePaire.className = 'editeur-occurrences editeur-paire'
  barrePaire.hidden = true
  pied.append(barrePaire)

  let paires = null       // position → jumelle, pour le texte courant
  let textePaires = null
  let paire = null        // { a, b } : le signe sous le curseur, et sa jumelle (-1 : aucune)
  let dernierePaire = ''
  let suivi = null        // le nom sous le curseur
  let apparitions = []    // [{ ligne, position }] de ce nom dans le texte

  let lignes = []           // les <div> des lignes colorées
  let dernierTexte = null
  let dernierSuivi = null
  let largeurGouttiere = 0

  /* Le fond suit le champ : sa place, sa taille, son style. */
  function caler() {
    if (!actif()) return
    const style = getComputedStyle(champ)
    const b = parseFloat(style.borderTopWidth) || 0
    const bl = parseFloat(style.borderLeftWidth) || 0
    fond.style.left = champ.offsetLeft + 'px'
    fond.style.top = champ.offsetTop + 'px'
    fond.style.width = champ.offsetWidth + 'px'
    fond.style.height = champ.offsetHeight + 'px'
    fond.style.borderRadius = style.borderRadius
    for (const p of ['fontFamily', 'fontSize', 'lineHeight', 'tabSize', 'letterSpacing', 'fontWeight']) {
      texte.style[p] = style[p]
      numeros.style[p] = style[p]
    }
    numeros.style.fontSize = `calc(${style.fontSize} * .92)`
    const haut = parseFloat(style.paddingTop) || 0
    const droite = parseFloat(style.paddingRight) || 0
    const gauche = parseFloat(style.paddingLeft) || 0
    texte.style.whiteSpace = style.whiteSpace
    texte.style.overflowWrap = style.overflowWrap
    texte.style.wordBreak = style.wordBreak
    /* La largeur UTILE du champ : sans sa barre de défilement, sans ses marges. */
    texte.style.width = Math.max(0, champ.clientWidth - gauche - droite) + 'px'
    vue.style.left = bl + 'px'
    vue.style.top = b + 'px'
    vue.style.width = champ.clientWidth + 'px'
    vue.style.height = champ.clientHeight + 'px'
    texte.style.left = gauche + 'px'
    texte.style.top = haut + 'px'
    gouttiere.style.top = b + 'px'
    gouttiere.style.height = champ.clientHeight + 'px'
    gouttiere.style.paddingTop = haut + 'px'
    defiler()
  }

  /* La gouttière : assez large pour le plus grand numéro, et le champ s'écarte d'autant. */
  function elargir(nombre) {
    const chiffres = Math.max(2, String(nombre).length)
    const largeur = Math.round(chiffres * 8.4 + 22)
    if (largeur === largeurGouttiere) return
    largeurGouttiere = largeur
    gouttiere.style.width = largeur + 'px'
    champ.style.setProperty('--gouttiere', largeur + 'px')
  }

  function colorer() {
    if (!actif()) return
    const valeur = champ.value
    const clePaire = paire ? paire.a + ':' + paire.b : ''
    if (valeur === dernierTexte && suivi === dernierSuivi && clePaire === dernierePaire) return
    dernierTexte = valeur
    dernierSuivi = suivi
    dernierePaire = clePaire
    /* Les deux signes de la paire, rangés par ligne : { ligne → Map(colonne → classe) }. */
    const aMarquer = new Map()
    if (paire) {
      const classe = paire.b < 0 ? 'paire seule' : 'paire'
      for (const p of paire.b < 0 ? [paire.a] : [paire.a, paire.b]) {
        const avant = valeur.slice(0, p)
        const k = avant.split(SAUT).length - 1
        const col = p - (avant.lastIndexOf(SAUT) + 1)
        if (!aMarquer.has(k)) aMarquer.set(k, new Map())
        aMarquer.get(k).set(col, classe)
      }
    }
    const brutes = valeur.split(SAUT)
    let dansCommentaire = false
    const html = []
    apparitions = []
    let debutLigne = 0
    for (let k = 0; k < brutes.length; k++) {
      const ligne = brutes[k]
      const rendu = colorerLigne(ligne, dansCommentaire, suivi, aMarquer.get(k))
      dansCommentaire = rendu.dansCommentaire
      for (const col of rendu.trouves) apparitions.push({ ligne: k, position: debutLigne + col })
      debutLigne += ligne.length + 1
      /* Une ligne vide garde sa hauteur : un espace insécable la tient ouverte. */
      html.push(`<div class="l">${rendu.html || ' '}</div>`)
    }
    texte.innerHTML = html.join('')
    lignes = [...texte.children]
    elargir(lignes.length)
    caler()
    numeroter()
  }

  /* Un numéro EN FACE de chaque ligne — d'une ligne repliée, le numéro reste sur sa première rangée. */
  function numeroter() {
    const faute = ligneFautive()
    const avecNom = new Set(apparitions.map((p) => p.ligne))
    const ligneDe = (p) => champ.value.slice(0, p).split(SAUT).length - 1
    const ligneJumelle = paire && paire.b >= 0 ? ligneDe(paire.b) : -1
    const parts = []
    for (let k = 0; k < lignes.length; k++) {
      const l = lignes[k]
      parts.push(`<span class="${k + 1 === faute ? 'n faute' : 'n'}${avecNom.has(k) ? ' occ-ligne' : ''}${k === ligneJumelle ? ' paire-ligne' : ''}" style="top:${l.offsetTop}px">${k + 1}</span>`)
    }
    numeros.innerHTML = parts.join('')
    montrerLesApparitions()
    marquerLaFaute(faute)
    suivreLeCurseur()
  }

  function montrerLesApparitions() {
    /* La règle : chaque apparition, à sa hauteur dans le fichier entier. */
    const total = Math.max(1, texte.scrollHeight)
    const haut = vue.clientHeight
    regle.innerHTML = apparitions.length > 1
      ? apparitions.map((p) => `<i style="top:${Math.round((lignes[p.ligne]?.offsetTop ?? 0) / total * (haut - 3))}px"></i>`).join('')
      : ''
    /* La règle se pose juste à gauche de la barre de défilement du champ. */
    regle.style.right = (champ.offsetWidth - champ.clientWidth - (parseFloat(getComputedStyle(champ).borderLeftWidth) || 0)) + 'px'
    regle.style.top = vue.style.top
    regle.style.height = vue.style.height

    if (paire && paire.b >= 0) {
      const l = lignes[champ.value.slice(0, paire.b).split(SAUT).length - 1]
      regle.insertAdjacentHTML('beforeend', `<i class="jumelle" style="top:${Math.round((l?.offsetTop ?? 0) / total * (haut - 3))}px"></i>`)
    }
    montrerLaPaire()

    barre.hidden = !suivi || !apparitions.length
    if (barre.hidden) return
    barre.textContent = ''
    const titre = document.createElement('span')
    titre.innerHTML = `🔎 <b>${echapper(suivi)}</b> — ${apparitions.length} fois${apparitions.length > 1 ? ', lignes' : ', ligne'} :`
    barre.append(titre)
    const vues = new Set()
    for (const p of apparitions) {
      if (vues.has(p.ligne)) continue
      vues.add(p.ligne)
      if (vues.size > 40) { barre.append(document.createTextNode(' …')); break }
      const b = document.createElement('button')
      b.type = 'button'
      b.className = 'editeur-aller' + (p.ligne === ligneDuCurseur() ? ' ici' : '')
      b.textContent = String(p.ligne + 1)
      b.title = `aller à la ligne ${p.ligne + 1}`
      /* mousedown, et non click : le champ garde le clavier, et le mot reste suivi. */
      b.addEventListener('mousedown', (e) => {
        e.preventDefault()
        champ.focus()
        champ.setSelectionRange(p.position, p.position + suivi.length)
        const l = lignes[p.ligne]
        if (l) champ.scrollTop = Math.max(0, l.offsetTop - champ.clientHeight / 3)
        suivreLeCurseur()
      })
      barre.append(b)
    }
  }

  function montrerLaPaire() {
    barrePaire.hidden = !paire
    if (!paire) return
    barrePaire.textContent = ''
    const v = champ.value
    const ligneDe = (p) => v.slice(0, p).split(SAUT).length
    const signe = v[paire.a]
    const t = document.createElement('span')
    if (paire.b < 0) {
      t.innerHTML = `⚠ <b>${echapper(signe)}</b> ligne ${ligneDe(paire.a)} n’a pas de jumelle — il en manque une, ou il y en a une de trop`
      t.className = 'paire-seule-texte'
      barrePaire.append(t)
      return
    }
    const [o, fe] = paire.a < paire.b ? [paire.a, paire.b] : [paire.b, paire.a]
    t.innerHTML = `<b>${echapper(v[o])}</b> ligne ${ligneDe(o)} → <b>${echapper(v[fe])}</b> ligne ${ligneDe(fe)}${ligneDe(fe) - ligneDe(o) > 0 ? ` — ${ligneDe(fe) - ligneDe(o) + 1} lignes` : ''}`
    barrePaire.append(t)
    const aller = document.createElement('button')
    aller.type = 'button'
    aller.className = 'editeur-aller'
    aller.textContent = paire.b > paire.a ? '↓ aller à la fermante' : '↑ aller à l’ouvrante'
    aller.addEventListener('mousedown', (e) => {
      e.preventDefault()
      champ.focus()
      const cible = paire.b
      /* Le curseur JUSTE APRÈS la jumelle : la paire reste la même, vue de l'autre bout. */
      champ.setSelectionRange(cible + 1, cible + 1)
      const l = lignes[ligneDe(cible) - 1]
      if (l) champ.scrollTop = Math.max(0, l.offsetTop - champ.clientHeight / 3)
      suivreLeCurseur()
    })
    barrePaire.append(aller)
  }

  const ligneDuCurseur = () => champ.value.slice(0, champ.selectionStart).split(SAUT).length - 1

  function marquerLaFaute(faute) {
    const l = faute ? lignes[faute - 1] : null
    bandeFaute.hidden = !l
    if (l) {
      bandeFaute.style.top = texte.offsetTop + l.offsetTop + 'px'
      bandeFaute.style.height = l.offsetHeight + 'px'
    }
  }

  function suivreLeCurseur() {
    if (!actif() || !lignes.length) return
    const nom = document.activeElement === champ ? nomSousLeCurseur(champ.value, champ.selectionStart, champ.selectionEnd) : suivi
    const nouvellePaire = document.activeElement === champ ? paireSousLeCurseur() : paire
    const cleNouvelle = nouvellePaire ? nouvellePaire.a + ':' + nouvellePaire.b : ''
    const cleAncienne = paire ? paire.a + ':' + paire.b : ''
    if (nom !== suivi || cleNouvelle !== cleAncienne) {
      suivi = nom
      paire = nouvellePaire
      colorer()
      return // colorer() renumérote, et revient ici
    }
    for (const b of barre.querySelectorAll('.editeur-aller')) b.classList.toggle('ici', Number(b.textContent) - 1 === ligneDuCurseur())
    const avant = champ.value.slice(0, champ.selectionStart)
    const k = avant.split(SAUT).length - 1
    const l = lignes[k]
    bandeCurseur.hidden = !l || document.activeElement !== champ
    if (l) {
      bandeCurseur.style.top = texte.offsetTop + l.offsetTop + 'px'
      bandeCurseur.style.height = l.offsetHeight + 'px'
    }
    for (const n of numeros.querySelectorAll('.n.courante')) n.classList.remove('courante')
    if (document.activeElement === champ) numeros.children[k]?.classList.add('courante')
  }

  /*
   * Le signe sous le curseur : celui JUSTE APRÈS lui d'abord, sinon celui juste
   * avant — comme VS Code. Seulement sans sélection.
   */
  function paireSousLeCurseur() {
    if (champ.selectionStart !== champ.selectionEnd) return null
    const v = champ.value
    if (textePaires !== v) { paires = lesPaires(v); textePaires = v }
    const p = champ.selectionStart
    for (const q of [p, p - 1]) {
      if (q >= 0 && paires.has(q)) return { a: q, b: paires.get(q) }
    }
    return null
  }

  function defiler() {
    const x = champ.scrollLeft
    const y = champ.scrollTop
    texte.style.transform = `translate(${-x}px, ${-y}px)`
    bandeCurseur.style.transform = bandeFaute.style.transform = `translateY(${-y}px)`
    numeros.style.transform = `translateY(${-y}px)`
  }

  function appliquer() {
    const oui = actif()
    document.body.classList.toggle('editeur-riche', oui)
    fond.hidden = !oui
    if (oui) {
      dernierTexte = null
      colorer()
    }
  }

  let enAttente = false
  const bientot = () => {
    if (enAttente) return
    enAttente = true
    requestAnimationFrame(() => { enAttente = false; colorer() })
  }

  champ.addEventListener('input', bientot)
  champ.addEventListener('scroll', defiler)
  for (const e of ['keyup', 'click', 'focus', 'blur', 'select']) champ.addEventListener(e, () => requestAnimationFrame(suivreLeCurseur))
  document.addEventListener('selectionchange', () => { if (document.activeElement === champ) suivreLeCurseur() })
  new ResizeObserver(() => { caler(); numeroter() }).observe(champ)
  /* Et si le cadre autour bouge sans que le champ change de taille (une barre au-dessus) : on suit aussi. */
  new ResizeObserver(() => caler()).observe(parent)
  addEventListener('resize', caler)

  /* Le texte changé sans frappe (un atelier, un exemple, annuler) : on le voit à la prochaine image. */
  const verifier = () => {
    if (actif() && champ.value !== dernierTexte) colorer()
    requestAnimationFrame(verifier)
  }


  /* ================================================================
   * Les outils de l'éditeur : l'erreur sous la ligne, la complétion,
   * l'aide aux arguments, renommer (F2), chercher et remplacer (Ctrl+F).
   * ================================================================ */

  /* Une position du texte → un point de la copie colorée (un nœud texte et
     un décalage), pour y poser une bulle, un cadre, une plage. */
  function pointDe(pos) {
    const v = champ.value
    const k = v.slice(0, pos).split(SAUT).length - 1
    let reste = pos - (v.lastIndexOf(SAUT, pos - 1) + 1)
    const l = lignes[k]
    if (!l) return null
    const marche = document.createTreeWalker(l, NodeFilter.SHOW_TEXT)
    let noeud = marche.nextNode()
    let dernier = noeud
    while (noeud) {
      if (reste <= noeud.length) return { noeud, decalage: reste }
      reste -= noeud.length
      dernier = noeud
      noeud = marche.nextNode()
    }
    return dernier ? { noeud: dernier, decalage: dernier.length } : null
  }

  /* Le rectangle d'une plage du texte, par rapport au cadre du champ. */
  function rectangleDe(debut, fin = debut) {
    const a = pointDe(debut)
    const b = pointDe(fin)
    if (!a || !b) return null
    const plage = document.createRange()
    plage.setStart(a.noeud, Math.min(a.decalage, a.noeud.length))
    plage.setEnd(b.noeud, Math.min(b.decalage, b.noeud.length))
    const r = plage.getClientRects()[0] ?? plage.getBoundingClientRect()
    const cadre = parent.getBoundingClientRect()
    return { x: r.left - cadre.left, y: r.top - cadre.top, largeur: r.width, hauteur: r.height || parseFloat(getComputedStyle(champ).lineHeight) || 18 }
  }

  /* ---------------- l'erreur, écrite au bout de sa ligne ---------------- */

  const bulleFaute = document.createElement('span')
  bulleFaute.className = 'editeur-faute-texte'
  bandeFaute.append(bulleFaute)
  const marquerLaFauteAvant = marquerLaFaute
  marquerLaFaute = (faute) => {
    marquerLaFauteAvant(faute)
    const l = faute ? lignes[faute - 1] : null
    const dit = l ? messageFautif() : ''
    bulleFaute.textContent = dit ? '● ' + dit : ''
    if (!l || !dit) return
    /* Juste après le dernier signe de la ligne : comme « Error Lens » dans VS Code. */
    const plage = document.createRange()
    plage.selectNodeContents(l)
    const r = plage.getBoundingClientRect()
    const base = texte.getBoundingClientRect()
    bulleFaute.style.left = (texte.offsetLeft + r.right - base.left + 24) + 'px'
  }

  /* ---------------- la complétion ---------------- */

  const menu = document.createElement('div')
  menu.className = 'editeur-completion'
  menu.hidden = true
  const liste = document.createElement('div')
  liste.className = 'editeur-completion-liste'
  const detail = document.createElement('div')
  detail.className = 'editeur-completion-detail'
  menu.append(liste, detail)
  parent.append(menu)

  const indice = document.createElement('div')
  indice.className = 'editeur-indice'
  indice.hidden = true
  parent.append(indice)

  let propositions = []
  let choisie = 0
  let debutMot = 0

  const MOTS_LANGAGE = new Set([...CONTROLE, ...TYPES, ...VALEURS])

  /* Les noms du programme lui-même : variables, fonctions, constantes, dessins. */
  function nomsDuProgramme(sauf) {
    const vus = new Set()
    const sansCommentaires = champ.value.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/\/\/.*$/gm, ' ').replace(/"(?:[^"\\\n]|\\.)*"/g, '""')
    for (const m of sansCommentaires.matchAll(/\b[A-Za-z_]\w*\b/g)) {
      const mot = m[0]
      if (mot.length < 2 || mot === sauf || MOTS_LANGAGE.has(mot) || FONCTIONS[mot]) continue
      vus.add(mot)
    }
    return vus
  }

  function fermerLeMenu() {
    menu.hidden = true
    propositions = []
  }

  function ouvrirLeMenu(force = false) {
    const pos = champ.selectionStart
    if (pos !== champ.selectionEnd) return fermerLeMenu()
    const avant = champ.value.slice(0, pos)
    const m = avant.match(/[A-Za-z_]\w*$/)
    const prefixe = m ? m[0] : ''
    /* Pas dans un commentaire ni un texte : on regarde la ligne. */
    const ligne = avant.slice(avant.lastIndexOf(SAUT) + 1)
    if (/\/\//.test(ligne) || (ligne.split('"').length - 1) % 2 === 1) return fermerLeMenu()
    if (!force && prefixe.length < 2) return fermerLeMenu()
    debutMot = pos - prefixe.length
    const bas = prefixe.toLowerCase()
    const tri = (a, b) => (a.nom.startsWith(prefixe) ? 0 : 1) - (b.nom.startsWith(prefixe) ? 0 : 1) || a.nom.localeCompare(b.nom)
    const fonctions = Object.keys(FONCTIONS).filter((n) => n.toLowerCase().startsWith(bas) && n !== prefixe)
      .map((nom) => ({ nom, genre: 'console' }))
    const constantes = Object.keys(CONSTANTES).filter((n) => n.toLowerCase().startsWith(bas) && n !== prefixe)
      .map((nom) => ({ nom, genre: 'constante' }))
    const mots = [...nomsDuProgramme(prefixe)].filter((n) => n.toLowerCase().startsWith(bas))
      .map((nom) => ({ nom, genre: 'programme' }))
    const motsLangage = [...MOTS_LANGAGE].filter((n) => n.startsWith(prefixe) && n !== prefixe && prefixe.length >= 2)
      .map((nom) => ({ nom, genre: 'langage' }))
    propositions = [...fonctions.sort(tri), ...constantes.sort(tri), ...mots.sort(tri), ...motsLangage.sort(tri)].slice(0, 12)
    if (!propositions.length) return fermerLeMenu()
    choisie = 0
    dessinerLeMenu()
    const r = rectangleDe(debutMot)
    if (!r) return fermerLeMenu()
    menu.hidden = false
    menu.style.left = Math.max(0, Math.min(r.x, parent.clientWidth - 380)) + 'px'
    menu.style.top = (r.y + r.hauteur + 2) + 'px'
  }

  const ICONES = { console: 'ƒ', constante: '◆', programme: '𝑥', langage: '⌘' }
  function dessinerLeMenu() {
    liste.textContent = ''
    propositions.forEach((p, i) => {
      const ligne = document.createElement('div')
      ligne.className = 'editeur-proposition' + (i === choisie ? ' choisie' : '')
      ligne.innerHTML = `<i class="g-${p.genre}">${ICONES[p.genre]}</i><span>${echapper(p.nom)}</span>`
      ligne.addEventListener('mousedown', (e) => { e.preventDefault(); choisie = i; accepter() })
      liste.append(ligne)
    })
    const p = propositions[choisie]
    if (p?.genre === 'console') detail.innerHTML = `<code>${echapper(forme(p.nom))}</code><br>${echapper(FONCTIONS[p.nom].dit)}`
    else if (p?.genre === 'constante') detail.innerHTML = `<code>${p.nom}</code> — ${echapper(CONSTANTES[p.nom])}`
    else if (p?.genre === 'programme') detail.textContent = 'un nom de ton programme'
    else detail.textContent = 'un mot du langage'
    liste.children[choisie]?.scrollIntoView({ block: 'nearest' })
  }

  /* Écrire dans le champ COMME une frappe : la page (historique, recompilation) suit. */
  function remplacer(debut, fin, texteNeuf, curseur) {
    champ.setRangeText(texteNeuf, debut, fin, 'end')
    if (curseur !== undefined) champ.setSelectionRange(curseur, curseur)
    champ.dispatchEvent(new Event('input', { bubbles: true }))
  }

  function accepter() {
    const p = propositions[choisie]
    if (!p) return
    const pos = champ.selectionStart
    fermerLeMenu()
    const apres = champ.value[pos]
    if (p.genre === 'console' && apres !== '(') {
      /* Une fonction : ses parenthèses, et le curseur dedans (ou après, si elle n'en prend pas). */
      const vide = !FONCTIONS[p.nom].args.length && !FONCTIONS[p.nom].options?.length
      remplacer(debutMot, pos, p.nom + '()', debutMot + p.nom.length + (vide ? 2 : 1))
    } else {
      remplacer(debutMot, pos, p.nom)
    }
    requestAnimationFrame(montrerLIndice)
  }

  /* ---------------- l'aide aux arguments ---------------- */

  /* L'appel dans lequel est le curseur : son nom, et le numéro de l'argument en cours. */
  function appelEnCours() {
    const v = champ.value
    let profondeur = 0
    let virgules = 0
    for (let i = champ.selectionStart - 1; i >= 0 && i > champ.selectionStart - 400; i--) {
      const c = v[i]
      if (c === ')' || c === ']') profondeur++
      else if (c === '(' || c === '[') {
        if (profondeur === 0) {
          if (c === '[') return null
          const nom = v.slice(0, i).match(/([A-Za-z_]\w*)\s*$/)?.[1]
          return nom && FONCTIONS[nom] ? { nom, argument: virgules, ouvre: i } : null
        }
        profondeur--
      } else if (c === ',' && profondeur === 0) virgules++
      else if ((c === ';' || c === '{' || c === '}') && profondeur === 0) return null
    }
    return null
  }

  function montrerLIndice() {
    const appel = document.activeElement === champ && champ.selectionStart === champ.selectionEnd ? appelEnCours() : null
    indice.hidden = !appel || !menu.hidden
    if (indice.hidden) return
    const f = FONCTIONS[appel.nom]
    const tous = [...f.args, ...(f.options ?? []).map((o) => o + '?')]
    const args = tous.map((a, i) => (i === appel.argument ? `<b>${echapper(a)}</b>` : echapper(a))).join(', ')
    indice.innerHTML = `<code>${appel.nom}(${args})</code><span>${echapper(f.dit)}</span>`
    const r = rectangleDe(appel.ouvre)
    if (!r) { indice.hidden = true; return }
    indice.style.left = Math.max(0, Math.min(r.x - 20, parent.clientWidth - 420)) + 'px'
    /* Au-dessus de la ligne, pour ne pas cacher ce qu'on écrit dessous. */
    indice.style.top = Math.max(0, r.y - indice.offsetHeight - 4) + 'px'
  }

  /* ---------------- renommer (F2) ---------------- */

  const renommage = document.createElement('div')
  renommage.className = 'editeur-renommer'
  renommage.hidden = true
  const champNom = document.createElement('input')
  champNom.spellcheck = false
  const aideNom = document.createElement('small')
  renommage.append(champNom, aideNom)
  parent.append(renommage)
  let aRenommer = null

  function ouvrirLeRenommage() {
    const nom = nomSousLeCurseur(champ.value, champ.selectionStart, champ.selectionEnd)
    if (!nom || FONCTIONS[nom] || CONSTANTES[nom]) return false
    if (nom !== suivi) { suivi = nom; colorer() }
    aRenommer = { nom, positions: apparitions.map((p) => p.position) }
    const r = rectangleDe(aRenommer.positions.find((p) => p <= champ.selectionStart && champ.selectionStart <= p + nom.length) ?? aRenommer.positions[0])
    champNom.value = nom
    aideNom.textContent = `Entrée : renommer ses ${aRenommer.positions.length} apparition(s) — Échap : annuler`
    renommage.hidden = false
    if (r) { renommage.style.left = r.x + 'px'; renommage.style.top = (r.y + r.hauteur + 2) + 'px' }
    champNom.focus()
    champNom.select()
    return true
  }

  function fermerLeRenommage(appliquer) {
    if (renommage.hidden) return
    renommage.hidden = true
    const neuf = champNom.value.trim()
    champ.focus()
    if (!appliquer || !aRenommer || neuf === aRenommer.nom) return
    if (!/^[A-Za-z_]\w*$/.test(neuf) || MOTS_LANGAGE.has(neuf) || FONCTIONS[neuf]) {
      aideNom.textContent = `« ${neuf} » ne peut pas être un nom`
      return
    }
    /* Toutes les apparitions d'un coup, de la dernière à la première : les positions restent justes. */
    let v = champ.value
    for (const p of [...aRenommer.positions].sort((a, b) => b - a)) v = v.slice(0, p) + neuf + v.slice(p + aRenommer.nom.length)
    const curseur = champ.selectionStart
    champ.value = v
    champ.setSelectionRange(curseur, curseur)
    champ.dispatchEvent(new Event('input', { bubbles: true }))
    aRenommer = null
  }
  champNom.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); fermerLeRenommage(true) }
    else if (e.key === 'Escape') { e.preventDefault(); fermerLeRenommage(false) }
  })
  champNom.addEventListener('blur', () => fermerLeRenommage(false))

  /* ---------------- chercher et remplacer (Ctrl+F, Ctrl+H) ---------------- */

  const recherche = document.createElement('div')
  recherche.className = 'editeur-recherche'
  recherche.hidden = true
  recherche.innerHTML = `
    <div class="rangee-r"><input class="r-cherche" placeholder="Chercher" spellcheck="false">
      <label title="respecter les majuscules"><input type="checkbox" class="r-casse"> Aa</label>
      <label title="mot entier seulement"><input type="checkbox" class="r-mot"> mot</label>
      <span class="r-compte"></span>
      <button type="button" class="r-prec" title="précédent (Maj+Entrée)">↑</button>
      <button type="button" class="r-suiv" title="suivant (Entrée)">↓</button>
      <button type="button" class="r-fermer" title="fermer (Échap)">✕</button></div>
    <div class="rangee-r r-remplacer"><input class="r-par" placeholder="Remplacer par" spellcheck="false">
      <button type="button" class="r-un" title="remplacer celle-ci">Remplacer</button>
      <button type="button" class="r-tous" title="remplacer toutes">Tout</button></div>`
  parent.append(recherche)
  const q = (c) => recherche.querySelector(c)
  const calqueTrouves = document.createElement('div')
  calqueTrouves.className = 'editeur-trouves'
  vue.insertBefore(calqueTrouves, texte)
  let trouves = []
  let courant = -1

  function chercherTout() {
    trouves = []
    const cherche = q('.r-cherche').value
    if (cherche) {
      const echappe = cherche.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const motif = new RegExp(q('.r-mot').checked ? `\\b${echappe}\\b` : echappe, q('.r-casse').checked ? 'g' : 'gi')
      for (const m of champ.value.matchAll(motif)) {
        trouves.push({ debut: m.index, fin: m.index + m[0].length })
        if (trouves.length >= 2000) break
      }
    }
    if (courant >= trouves.length) courant = trouves.length - 1
    dessinerLesTrouves()
  }

  function dessinerLesTrouves() {
    q('.r-compte').textContent = q('.r-cherche').value
      ? (trouves.length ? `${courant + 1 || '?'} sur ${trouves.length}` : 'aucun')
      : ''
    calqueTrouves.textContent = ''
    if (recherche.hidden) return
    const cadre = vue.getBoundingClientRect()
    for (let i = 0; i < trouves.length && i < 600; i++) {
      const t = trouves[i]
      const a = pointDe(t.debut)
      const b = pointDe(t.fin)
      if (!a || !b) continue
      const plage = document.createRange()
      plage.setStart(a.noeud, Math.min(a.decalage, a.noeud.length))
      plage.setEnd(b.noeud, Math.min(b.decalage, b.noeud.length))
      for (const r of plage.getClientRects()) {
        const boite = document.createElement('i')
        if (i === courant) boite.className = 'courant'
        /* Mesurées sur la copie telle qu'elle est affichée : redessinées à chaque défilement. */
        boite.style.left = (r.left - cadre.left) + 'px'
        boite.style.top = (r.top - cadre.top) + 'px'
        boite.style.width = r.width + 'px'
        boite.style.height = r.height + 'px'
        calqueTrouves.append(boite)
      }
    }
  }

  function allerAuTrouve(sens) {
    if (!trouves.length) return
    const pos = champ.selectionEnd
    if (courant < 0) {
      courant = sens > 0 ? Math.max(0, trouves.findIndex((t) => t.debut >= pos)) : trouves.length - 1
    } else {
      courant = (courant + sens + trouves.length) % trouves.length
    }
    const t = trouves[courant]
    champ.setSelectionRange(t.debut, t.fin)
    const k = champ.value.slice(0, t.debut).split(SAUT).length - 1
    const l = lignes[k]
    if (l && (l.offsetTop < champ.scrollTop || l.offsetTop > champ.scrollTop + champ.clientHeight - 40)) {
      champ.scrollTop = Math.max(0, l.offsetTop - champ.clientHeight / 3)
    }
    dessinerLesTrouves()
  }

  function ouvrirLaRecherche(avecRemplacer) {
    recherche.hidden = false
    /* Dans le cadre du code, en haut à droite — pas sur son titre. */
    recherche.style.top = (champ.offsetTop + 6) + 'px'
    recherche.classList.toggle('avec-remplacer', avecRemplacer)
    const choisi = champ.value.slice(champ.selectionStart, champ.selectionEnd)
    if (choisi && !choisi.includes(SAUT)) q('.r-cherche').value = choisi
    courant = -1
    chercherTout()
    ;(avecRemplacer && q('.r-cherche').value ? q('.r-par') : q('.r-cherche')).focus()
    q('.r-cherche').select()
  }
  function fermerLaRecherche() {
    recherche.hidden = true
    calqueTrouves.textContent = ''
    champ.focus()
  }
  function remplacerUn() {
    if (courant < 0) { allerAuTrouve(1); return }
    const t = trouves[courant]
    if (!t) return
    remplacer(t.debut, t.fin, q('.r-par').value)
    chercherTout()
    courant = Math.min(courant, trouves.length - 1)
    if (trouves.length) allerAuTrouve(0)
  }
  function remplacerTous() {
    if (!trouves.length) return
    const par = q('.r-par').value
    let v = champ.value
    for (const t of [...trouves].reverse()) v = v.slice(0, t.debut) + par + v.slice(t.fin)
    const n = trouves.length
    champ.value = v
    champ.dispatchEvent(new Event('input', { bubbles: true }))
    courant = -1
    chercherTout()
    q('.r-compte').textContent = `${n} remplacé(s)`
  }
  q('.r-cherche').addEventListener('input', () => { courant = -1; chercherTout() })
  q('.r-casse').addEventListener('change', chercherTout)
  q('.r-mot').addEventListener('change', chercherTout)
  q('.r-suiv').addEventListener('click', () => allerAuTrouve(1))
  q('.r-prec').addEventListener('click', () => allerAuTrouve(-1))
  q('.r-fermer').addEventListener('click', fermerLaRecherche)
  q('.r-un').addEventListener('click', remplacerUn)
  q('.r-tous').addEventListener('click', remplacerTous)
  recherche.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { e.preventDefault(); fermerLaRecherche() }
    else if (e.key === 'Enter' && e.target.classList.contains('r-cherche')) { e.preventDefault(); allerAuTrouve(e.shiftKey ? -1 : 1) }
    else if (e.key === 'Enter' && e.target.classList.contains('r-par')) { e.preventDefault(); if (e.ctrlKey || e.metaKey) remplacerTous(); else remplacerUn() }
    else if ((e.ctrlKey || e.metaKey) && (e.key === 'f' || e.key === 'h')) { e.preventDefault(); ouvrirLaRecherche(e.key === 'h') }
  })

  /* ---------------- le clavier ---------------- */

  /* En CAPTURE : avant la page (Tab qui indente, Entrée qui recopie l'indentation). */
  champ.addEventListener('keydown', (e) => {
    if (!actif()) return
    const bloque = () => { e.preventDefault(); e.stopImmediatePropagation() }
    if (!menu.hidden) {
      if (e.key === 'ArrowDown') { bloque(); choisie = (choisie + 1) % propositions.length; dessinerLeMenu(); return }
      if (e.key === 'ArrowUp') { bloque(); choisie = (choisie - 1 + propositions.length) % propositions.length; dessinerLeMenu(); return }
      if (e.key === 'Enter' || e.key === 'Tab') { bloque(); accepter(); return }
      if (e.key === 'Escape') { bloque(); fermerLeMenu(); return }
    }
    if (e.key === 'F2') { bloque(); ouvrirLeRenommage(); return }
    if ((e.ctrlKey || e.metaKey) && e.key === ' ') { bloque(); ouvrirLeMenu(true); return }
    if ((e.ctrlKey || e.metaKey) && (e.key === 'f' || e.key === 'h')) { bloque(); ouvrirLaRecherche(e.key === 'h'); return }
    if (e.key === 'Escape' && !recherche.hidden) { bloque(); fermerLaRecherche() }
  }, true)

  champ.addEventListener('input', (e) => {
    if (!actif()) return
    /* On propose en écrivant un nom ; en effaçant, on suit le menu déjà ouvert ; sinon on le ferme. */
    if (e.inputType === 'insertText' && /\w/.test(e.data ?? '')) ouvrirLeMenu()
    else if (e.inputType === 'deleteContentBackward' && !menu.hidden) ouvrirLeMenu()
    else fermerLeMenu()
    if (!recherche.hidden) { chercherTout() }
    requestAnimationFrame(montrerLIndice)
  })
  champ.addEventListener('blur', () => { setTimeout(() => { if (document.activeElement !== champ) { fermerLeMenu(); indice.hidden = true } }, 100) })
  champ.addEventListener('mousedown', fermerLeMenu)
  champ.addEventListener('scroll', () => { fermerLeMenu(); indice.hidden = true; if (!recherche.hidden) dessinerLesTrouves() })
  for (const ev of ['keyup', 'click']) champ.addEventListener(ev, () => requestAnimationFrame(montrerLIndice))

  appliquer()
  requestAnimationFrame(verifier)

  return {
    rafraichir() { dernierTexte = null; colorer() },
    appliquer,
    /* La compilation a parlé : la ligne fautive change de couleur. */
    marquer() { if (actif()) numeroter() },
    caler,
  }
}

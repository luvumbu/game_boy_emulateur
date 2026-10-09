/**
 * Chercher, partout de la même façon.
 *
 * Le tutoriel a 408 leçons, le cours 42, l'atelier une trentaine d'exemples,
 * des projets, des modèles, des réglages… Faire défiler pour trouver « la
 * leçon où l'on fait un snake » n'est pas raisonnable. Chaque liste reçoit
 * donc un champ de recherche — et toutes se comportent PAREIL, parce qu'elles
 * passent toutes par ce fichier :
 *
 *   - sans accents ni majuscules : « lecon » trouve « Leçon », « ecran » trouve
 *     « Écran » ;
 *   - plusieurs mots : « snake menu » ne garde que ce qui contient LES DEUX ;
 *   - un numéro : « 0.93 » trouve le 0.93 et ses intermédiaires (0.93.1…),
 *     mais pas le 0.930 ni le 10.93 ;
 *   - au clavier : « / » place le curseur dans la recherche de la page,
 *     Entrée ouvre le premier résultat, Échap efface ;
 *   - un compteur (« 12 leçons ») et un message quand rien n'est trouvé.
 *
 * Ce fichier ne connaît ni les leçons ni l'atelier : on lui donne du texte à
 * fouiller et des éléments à cacher ou montrer, il fait le reste.
 */

/* ------------------------------------------------------------ comparer */

/**
 * Un texte « à plat » : en minuscules, sans accents, sans apostrophe courbe.
 *
 * normalize('NFD') sépare chaque lettre de son accent (« é » devient « e » +
 * un accent à part) ; \p{M} désigne ces accents détachés, qu'on retire.
 * Exemple : normaliser('Écrire à l’écran') → 'ecrire a l'ecran'.
 */
export function normaliser(texte) {
  return String(texte ?? '')
    .normalize('NFD').replace(/\p{M}/gu, '')   // les accents s'en vont
    .replace(/[’‘]/g, "'")                     // l'apostrophe courbe devient droite
    .replace(/œ/g, 'oe').replace(/æ/g, 'ae')   // les lettres liées se séparent
    .toLowerCase()
}

/**
 * Les mots d'une recherche : « Snake  menu » → ['snake', 'menu'].
 *
 * La ponctuation sépare les mots, comme une espace : on peut donc coller la
 * PHRASE ENTIÈRE d'un cours, telle que le menu l'affiche, et la retrouver.
 * « 0.1. Afficher la lettre A — de base, ailleurs » → ['0.1', 'afficher',
 * 'la', 'lettre', 'a', 'de', 'base', 'ailleurs'].
 * On garde, dans un mot : les lettres, les chiffres, le point (« 0.93.4 »),
 * le souligné (« deplace_x ») et l'apostrophe (« l'ecran ») ; un point ou une
 * apostrophe au bout d'un mot s'en va (« 0.1. » → « 0.1 »).
 */
export function motsDe(requete) {
  return normaliser(requete)
    .split(/[^\p{L}\p{N}._']+/u)              // tout le reste (espaces, — , : « » ( ) …) coupe
    .map((mot) => mot.replace(/^[.']+|[.']+$/g, ''))   // « 0.1. » → « 0.1 », « 'a » → « a »
    .filter(Boolean)
}

/**
 * Une phrase « à plat » pour la comparer à une autre : ses mots (motsDe),
 * rejoints par une seule espace. phrase('Afficher la lettre A — de base')
 * → 'afficher la lettre a de base'. Sert à classer en tête les leçons dont
 * le titre contient la phrase tapée, dans le même ordre.
 */
export function phrase(texte) {
  return motsDe(texte).join(' ')
}

/* Un mot fait de chiffres et de points (« 12 », « 0.93 », « 0.93.4 ») est un
   NUMÉRO : on le compare au numéro de la leçon, et non au texte seulement. */
const EST_UN_NUMERO = /^\d+(\.\d+)*$/

/**
 * Le numéro « n » est-il celui demandé, ou l'un de ses intermédiaires ?
 * Exemples : numeroVa('0.93', '0.93') → oui ; numeroVa('0.93.4', '0.93') → oui ;
 * numeroVa('0.930', '0.93') → non (le point qui suit est exigé).
 */
function numeroVa(numero, demande) {
  return numero === demande || numero.startsWith(demande + '.')
}

/**
 * Une fiche correspond-elle à la recherche ?
 *
 *   texte   le texte déjà « à plat » où chercher (voir fiche())
 *   numero  son numéro, s'il en a un (« 0.93.4 »)
 *
 * TOUS les mots doivent être trouvés (« snake menu » : les deux). Un mot-
 * numéro est trouvé s'il est le numéro de la fiche, ou s'il figure dans le
 * texte comme un mot entier (« 8 » trouve « Un carré de 8 × 8 »).
 * Une recherche vide correspond à tout.
 */
export function correspond(mots, texte, numero = null) {
  return mots.every((mot) => {
    if (EST_UN_NUMERO.test(mot)) {
      if (numero && numeroVa(numero, mot)) return true
      // le numéro écrit dans le texte, comme un mot entier (entouré d'espaces ou de ponctuation)
      return new RegExp(`(^|[^\\d.])${mot.replace(/\./g, '\\.')}($|[^\\d.])`).test(texte)
    }
    return texte.includes(mot)
  })
}

/**
 * La « fiche » d'une chose à retrouver : tous ses textes, mis à plat et bout
 * à bout. fiche('Le snake', 'une queue qui suit') → 'le snake une queue qui suit'.
 */
export function fiche(...morceaux) {
  return normaliser(morceaux.flat().filter(Boolean).join(' '))
}

/**
 * Les noms qu'un programme APPELLE ou qu'il utilise comme mots du langage :
 * « texteGrand », « deplace_x », « for », « struct »… De quoi retrouver les
 * leçons qui se servent d'une fonction, sans fouiller les commentaires (où
 * « mur » ou « pièce » apparaissent partout).
 *   - un nom suivi d'une parenthèse : un appel (texte(, carre(…) ;
 *   - quelques mots du langage, repérés où qu'ils soient.
 */
const MOTS_DU_LANGAGE = /\b(for|while|do|if|else|switch|case|break|continue|return|struct|enum|const|include|uint8_t|int8_t|uint16_t|int|bool|void|Tuile|Perso|Mot|Air|Carre|ALPHABET|ALPHABET_GRAS)\b/g
export function motsDuCode(code) {
  const sansCommentaires = String(code ?? '')
    .replace(/\/\*[\s\S]*?\*\//g, ' ')   // les commentaires /* … */
    .replace(/\/\/.*$/gm, ' ')           // les commentaires // … jusqu'au bout de la ligne
  const trouves = new Set()
  for (const m of sansCommentaires.matchAll(/\b([A-Za-z_]\w*)\s*\(/g)) trouves.add(m[1])   // les appels
  for (const m of sansCommentaires.matchAll(MOTS_DU_LANGAGE)) trouves.add(m[1])           // les mots du langage
  return [...trouves]
}

/* -------------------------------------------------------- le champ lui-même */

/*
 * L'apparence du champ, écrite ici une seule fois pour toutes les pages. Les
 * couleurs viennent des variables de la page quand elle en a (--panneau,
 * --bord…) ; sinon, des valeurs sombres raisonnables.
 */
const STYLE = `
  /* Caché par une recherche. « !important » : sans lui, une carte en
     « display: flex » resterait visible (l'attribut hidden perd contre elle). */
  .recherche-cache { display: none !important; }
  .recherche { display: flex; flex-direction: column; gap: 3px; margin: 0 0 8px; }
  .recherche input {
    width: 100%; box-sizing: border-box; font: inherit; font-size: 13px;
    padding: 7px 10px; border-radius: 6px;
    border: 1px solid var(--bord, #3a3f4b); background: var(--panneau-clair, #262a33); color: var(--texte, #e6e6e6);
  }
  .recherche input:focus { outline: 2px solid var(--vert, #8bac0f); outline-offset: 0; }
  .recherche .recherche-compte { font-size: 11px; color: var(--gris, #8b93a1); min-height: 1em; padding-left: 2px; }
  .recherche .recherche-compte.rien { color: #e8a0a0; }
  .recherche.en-ligne { flex-direction: row; align-items: center; gap: 6px; margin: 0; }
  .recherche.en-ligne input { width: auto; flex: 1 1 140px; min-width: 110px; padding: 5px 8px; }
  .recherche.en-ligne .recherche-compte { white-space: nowrap; }
  /* La liste des résultats, ouverte sous le champ pendant qu'on tape. */
  .recherche.avec-resultats { position: relative; }
  .recherche-resultats {
    position: absolute; z-index: 30; top: 100%; left: 0; margin-top: 4px;
    width: max(100%, 460px); max-width: min(640px, calc(100vw - 32px)); max-height: 60vh; overflow-y: auto;
    padding: 4px; box-sizing: border-box; list-style: none;
    background: var(--panneau, #1e222a); border: 1px solid var(--bord, #3a3f4b); border-radius: 8px;
    box-shadow: 0 8px 24px #000a; font-size: 13px;
  }
  .recherche-resultats[hidden] { display: none; }
  .recherche-resultats li { display: flex; flex-direction: column; gap: 1px; padding: 6px 8px; border-radius: 5px; cursor: pointer; }
  .recherche-resultats li.choisi, .recherche-resultats li:hover { background: var(--panneau-clair, #262a33); }
  .recherche-resultats li.choisi { outline: 1px solid var(--vert, #8bac0f); }
  .recherche-resultats .r-titre { color: var(--texte, #e6e6e6); }
  .recherche-resultats .r-ou { color: var(--gris, #8b93a1); font-size: 11px; }
  .recherche-resultats mark { background: none; color: var(--vert, #8bac0f); font-weight: 600; }
  .recherche-resultats li.r-plus { cursor: default; color: var(--gris, #8b93a1); font-size: 11px; }
  .recherche-resultats li.r-plus:hover { background: none; }
  /* Dans un sommaire, le champ reste en haut quand on fait défiler la liste. */
  .recherche-sommaire { position: sticky; top: 0; z-index: 2; background: var(--panneau, #1e222a); padding: 4px 0; }
`
function poserLeStyle() {
  if (document.getElementById('recherche-style')) return   // une fois par page suffit
  const style = document.createElement('style')
  style.id = 'recherche-style'
  style.textContent = STYLE
  document.head.append(style)
}

/*
 * La touche « / » : aller à la recherche, d'où qu'on soit dans la page —
 * sauf quand on est déjà en train d'écrire (dans le code, un champ) : là,
 * « / » est un caractère comme un autre.
 * Écoutée UNE fois par page ; elle prend le premier champ de recherche VISIBLE
 * (offsetParent vaut null quand l'élément ou l'un de ses parents est caché).
 */
let toucheInstallee = false
function installerLaTouche() {
  if (toucheInstallee) return
  toucheInstallee = true
  addEventListener('keydown', (e) => {
    if (e.key !== '/' || e.ctrlKey || e.altKey || e.metaKey) return
    const ici = document.activeElement
    if (ici && (ici.tagName === 'TEXTAREA' || ici.tagName === 'INPUT' || ici.tagName === 'SELECT' || ici.isContentEditable)) return
    const champ = [...document.querySelectorAll('.recherche input')].find((c) => c.offsetParent !== null)
    if (!champ) return
    e.preventDefault()   // sinon le « / » s'écrirait dans le champ
    champ.focus()
    champ.select()
  })
}

/**
 * Un champ de recherche, prêt à poser dans la page.
 *
 *   texte     ce qu'il affiche quand il est vide (« 🔎 chercher une leçon… »)
 *   filtrer   appelé à chaque lettre tapée, avec la liste des mots ; rend le
 *             NOMBRE de résultats (pour le compteur)
 *   ouvrir    appelé sur Entrée : ouvrir le premier résultat
 *   unite     [singulier, pluriel] pour le compteur : ['leçon', 'leçons']
 *   enLigne   true : champ et compteur côte à côte (dans une barre d'outils)
 *   resultats (facultatif) (mots) → la liste de ce qui est trouvé, à MONTRER
 *             sous le champ pendant qu'on tape : [{ titre, ou, ouvrir }]
 *               titre   le texte de la ligne (« 0.1. Afficher la lettre A »)
 *               ou      une petite ligne dessous (le chapitre, la partie)
 *               ouvrir  () → ce que fait un clic sur la ligne
 *             Les flèches ↑ ↓ choisissent une ligne, Entrée l'ouvre, un clic
 *             aussi ; les mots trouvés sont surlignés dans chaque titre.
 *             Sans « resultats », pas de liste : seul le filtre agit.
 *
 * Rend { element, champ, rafraichir, vider } : rafraichir() refait le filtre
 * (après que la liste a été redessinée), vider() efface la recherche.
 */
export function champDeRecherche({ texte, filtrer, ouvrir = null, unite = ['résultat', 'résultats'], enLigne = false, titre = null, resultats = null }) {
  poserLeStyle()
  installerLaTouche()

  const element = document.createElement('div')
  element.className = 'recherche' + (enLigne ? ' en-ligne' : '') + (resultats ? ' avec-resultats' : '')

  const champ = document.createElement('input')
  champ.type = 'search'
  champ.placeholder = texte
  champ.autocomplete = 'off'
  champ.spellcheck = false
  champ.title = titre ?? `${texte.replace(/^🔎\s*/, '')} — touche « / » pour venir ici, Entrée ouvre le premier, Échap efface`
  champ.setAttribute('aria-label', texte.replace(/^🔎\s*/, ''))

  const compte = document.createElement('span')
  compte.className = 'recherche-compte'
  compte.setAttribute('aria-live', 'polite')   // un lecteur d'écran annonce le nombre trouvé

  element.append(champ, compte)

  /* Filtrer, et dire combien. Rien de tapé : pas de compteur du tout. */
  const rafraichir = () => {
    const mots = motsDe(champ.value)
    const n = filtrer(mots)
    if (!mots.length) { compte.textContent = ''; compte.classList.remove('rien'); return }
    compte.textContent = n === 0
      ? `rien ne contient « ${champ.value.trim()} »`   // (une phrase qui va à toutes les listes, leçons comme projets)
      : `${n} ${n > 1 ? unite[1] : unite[0]}`
    compte.classList.toggle('rien', n === 0)
  }
  const vider = () => { champ.value = ''; rafraichir(); fermerLaListe() }

  /* ---- La liste des résultats, sous le champ (seulement avec « resultats »). */
  const MONTRES = 80   // au-delà, la liste dit « … et N autres » : mieux vaut préciser la recherche
  const panneau = document.createElement('ul')
  panneau.className = 'recherche-resultats'
  panneau.hidden = true
  panneau.setAttribute('role', 'listbox')
  if (resultats) element.append(panneau)
  // Saisir la barre de défilement de la liste ne doit pas faire perdre le champ (et fermer la liste).
  panneau.addEventListener('mousedown', (e) => e.preventDefault())
  let trouves = []    // ce que la liste montre en ce moment
  let choisi = -1     // la ligne choisie aux flèches (-1 : aucune, Entrée prend la première)

  function fermerLaListe() { panneau.hidden = true; choisi = -1 }

  /* Un titre, avec les mots cherchés surlignés. On compare le texte « à
     plat » (sans accents) mais on affiche l'original : normaliser() garde la
     même longueur lettre pour lettre, sauf « œ » et « æ » (deux lettres) —
     on les compte à part pour ne pas décaler le surlignage. */
  function surligner(ligne, texteDuTitre, mots) {
    const plat = [...texteDuTitre].map((c) => normaliser(c)).join('')
    const depuis = []   // depuis[i] : la place, dans l'original, de la lettre i du texte à plat
    ;[...texteDuTitre].forEach((c, i) => { for (let k = 0; k < normaliser(c).length; k++) depuis.push(i) })
    const marque = new Array(texteDuTitre.length).fill(false)
    for (const mot of mots) {
      for (let p = plat.indexOf(mot); p >= 0; p = plat.indexOf(mot, p + 1)) {
        for (let k = p; k < p + mot.length; k++) marque[depuis[k]] = true
      }
    }
    const lettres = [...texteDuTitre]
    let morceau = ''
    let enMarque = false
    const pousser = () => {
      if (!morceau) return
      if (enMarque) { const m = document.createElement('mark'); m.textContent = morceau; ligne.append(m) } else ligne.append(morceau)
      morceau = ''
    }
    lettres.forEach((c, i) => {
      if (marque[i] !== enMarque) { pousser(); enMarque = marque[i] }
      morceau += c
    })
    pousser()
  }

  function dessinerLaListe(mots) {
    trouves = resultats(mots)
    choisi = -1
    panneau.textContent = ''
    trouves.slice(0, MONTRES).forEach((r, i) => {
      const li = document.createElement('li')
      li.setAttribute('role', 'option')
      const t = document.createElement('span')
      t.className = 'r-titre'
      surligner(t, r.titre, mots)
      li.append(t)
      if (r.ou) {
        const ou = document.createElement('span')
        ou.className = 'r-ou'
        ou.textContent = r.ou
        li.append(ou)
      }
      // mousedown, pas click : sinon le champ perd le focus et la liste se ferme avant le clic
      li.addEventListener('mousedown', (e) => { e.preventDefault(); ouvrirLaLigne(i) })
      li.addEventListener('mousemove', () => choisir(i, false))
      panneau.append(li)
    })
    if (trouves.length > MONTRES) {
      const plus = document.createElement('li')
      plus.className = 'r-plus'
      plus.textContent = `… et ${trouves.length - MONTRES} autres : ajoute un mot pour préciser`
      panneau.append(plus)
    }
    panneau.hidden = trouves.length === 0
  }

  function choisir(i, defiler = true) {
    const lignes = panneau.querySelectorAll('li[role="option"]')
    if (!lignes.length) return
    choisi = (i + lignes.length) % lignes.length   // après la dernière, on revient à la première
    lignes.forEach((li, k) => li.classList.toggle('choisi', k === choisi))
    if (defiler) lignes[choisi].scrollIntoView({ block: 'nearest' })
  }

  function ouvrirLaLigne(i) {
    const r = trouves[i]
    if (!r) return
    fermerLaListe()
    r.ouvrir()
  }

  /* La liste suit ce qu'on tape, mais seulement quand on est DANS le champ :
     un rafraîchissement venu d'ailleurs (le menu redessiné) ne l'ouvre pas. */
  const montrerSiBesoin = () => {
    if (!resultats) return
    const mots = motsDe(champ.value)
    if (!mots.length || document.activeElement !== champ) { fermerLaListe(); return }
    dessinerLaListe(mots)
  }
  if (resultats) {
    champ.addEventListener('focus', montrerSiBesoin)
    champ.addEventListener('blur', fermerLaListe)
  }

  champ.addEventListener('input', () => { rafraichir(); montrerSiBesoin() })
  champ.addEventListener('keydown', (e) => {
    if (resultats && !panneau.hidden && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      e.preventDefault()
      choisir(choisi < 0 && e.key === 'ArrowUp' ? -1 : choisi + (e.key === 'ArrowDown' ? 1 : -1))
      return
    }
    if (e.key === 'Enter' && resultats && !panneau.hidden && trouves.length) {
      e.preventDefault()
      ouvrirLaLigne(Math.max(choisi, 0))   // la ligne choisie, ou la première
      return
    }
    if (e.key === 'Enter' && ouvrir) { e.preventDefault(); ouvrir() }
    // Échap avec la liste ouverte : on la ferme seulement, la recherche reste.
    if (e.key === 'Escape' && resultats && !panneau.hidden) { e.preventDefault(); e.stopPropagation(); fermerLaListe(); return }
    // Échap : efface d'abord ; un second Échap (champ déjà vide) quitte le champ.
    if (e.key === 'Escape') {
      if (champ.value) { e.preventDefault(); e.stopPropagation(); vider() } else champ.blur()
    }
  })

  return { element, champ, rafraichir, vider, get mots() { return motsDe(champ.value) } }
}

/* ------------------------------------------------ trois façons de filtrer */

/** Cet élément est-il caché par la recherche ? */
const cache = (element) => element.classList.contains('recherche-cache')

/**
 * Filtrer un SOMMAIRE : une liste <ol> où des titres (niveaux, parties)
 * précèdent les leçons qu'ils regroupent.
 *
 *   liste     l'<ol>
 *   estTitre  (li) → 0 pour une leçon, 1 pour un titre de niveau, 2 pour un
 *             titre de partie (plus le nombre est grand, plus il est « bas »)
 *   garde     (li) → true si cette leçon correspond
 *
 * Un titre reste visible s'il a AU MOINS une leçon visible sous lui (jusqu'au
 * titre suivant de même rang ou plus haut). Rend le nombre de leçons visibles.
 */
export function filtrerUnSommaire(liste, estTitre, garde, filtreActif) {
  const lignes = [...liste.children]
  let visibles = 0
  // 1. les leçons
  for (const li of lignes) {
    if (estTitre(li)) continue
    li.classList.toggle('recherche-cache', filtreActif && !garde(li))
    if (!cache(li)) visibles++
  }
  // 2. les titres : visibles si une leçon visible les suit, avant le prochain titre de rang égal ou plus haut
  lignes.forEach((li, i) => {
    const rang = estTitre(li)
    if (!rang) return
    if (!filtreActif) { li.classList.remove('recherche-cache'); return }
    let garde_ = false
    for (let k = i + 1; k < lignes.length; k++) {
      const r = estTitre(lignes[k])
      if (r && r <= rang) break                 // un titre du même rang (ou plus haut) : fin de ce groupe
      if (!r && !cache(lignes[k])) { garde_ = true; break }
    }
    li.classList.toggle('recherche-cache', !garde_)
  })
  return visibles
}

/**
 * Filtrer un MENU DÉROULANT : on cache les <option> qui ne correspondent pas,
 * et les <optgroup> qui n'en ont plus aucune.
 *   garde  (option) → true si elle correspond
 * Rend { visibles, premiere } : combien restent, et la première (pour Entrée).
 */
export function filtrerUnMenu(menu, garde, filtreActif) {
  let visibles = 0
  let premiere = null
  for (const option of menu.querySelectorAll('option')) {
    option.hidden = filtreActif && !garde(option)
    if (!option.hidden) { visibles++; premiere ??= option }
  }
  for (const groupe of menu.querySelectorAll('optgroup')) {
    groupe.hidden = ![...groupe.querySelectorAll('option')].some((o) => !o.hidden)
  }
  return { visibles, premiere }
}

/**
 * Filtrer une GRILLE (des cartes, des boutons) : chaque enfant est caché ou
 * montré selon son propre texte affiché. Rend { visibles, premier }.
 *   texteDe  (enfant) → le texte où chercher (par défaut, tout son texte)
 */
export function filtrerUneGrille(conteneur, mots, texteDe = (e) => e.textContent) {
  let visibles = 0
  let premier = null
  for (const enfant of conteneur.children) {
    if (enfant.matches('p, h3, .recherche')) continue   // les messages et le champ lui-même ne se filtrent pas
    enfant.classList.toggle('recherche-cache', mots.length > 0 && !correspond(mots, normaliser(texteDe(enfant))))
    if (!cache(enfant)) { visibles++; premier ??= enfant }
  }
  return { visibles, premier }
}

/* ------------------------------------------- le sommaire des leçons, clé en main */

/**
 * Le champ de recherche d'un SOMMAIRE DE LEÇONS (tuto.html, cours.html) :
 * les deux pages ont le même sommaire, elles ont donc la même recherche.
 *
 *   titre    le <h2> du sommaire : le champ se pose juste dessous
 *   liste    l'<ol> du sommaire ; chaque leçon y porte data-index
 *   lecons   la liste des leçons
 *   numeros  leur numéro affiché (« 0.93.4 », ou « 12 »)
 *   extra    (lecon, i) → d'autres textes où chercher (le nom du niveau, de la partie…)
 *   aller    (i) → ouvre la leçon i (pour Entrée)
 *
 * On cherche dans : le numéro, le titre, l'idée, les textes d'« extra », et
 * les fonctions et mots du langage que son programme utilise (motsDuCode).
 * Rend le champ ; la page appelle .rafraichir() après avoir redessiné la liste.
 */
export function sommaireCherchable({ titre, liste, lecons, numeros, extra = () => [], aller, unite = ['leçon', 'leçons'] }) {
  // Les fiches sont faites UNE fois : 408 leçons, pas à chaque lettre tapée.
  const fiches = lecons.map((l, i) => fiche(
    numeros[i], l.titre, l.idee, extra(l, i),
    motsDuCode(l.code),                                           // le programme principal
    Object.values(l.fichiers ?? {}).map((texte) => motsDuCode(texte)),   // et ses fichiers voisins
  ))

  // Le rang d'une ligne du sommaire : 0 une leçon, 1 un titre de niveau, 2 un titre de partie.
  const estTitre = (li) => (li.classList.contains('sous-partie') ? 2 : li.classList.contains('partie') ? 1 : 0)

  let mots = []
  const recherche = champDeRecherche({
    texte: '🔎 chercher : titre, numéro, fonction…',
    unite,
    filtrer: (m) => {
      mots = m
      return filtrerUnSommaire(liste, estTitre,
        (li) => correspond(mots, fiches[li.dataset.index], numeros[li.dataset.index]),
        mots.length > 0)
    },
    // Entrée : la première leçon encore visible
    ouvrir: () => {
      const li = [...liste.children].find((l) => l.dataset.index !== undefined && !cache(l))
      if (li) aller(Number(li.dataset.index))
    },
  })
  recherche.element.classList.add('recherche-sommaire')
  titre.after(recherche.element)
  return recherche
}

/**
 * La planche : toutes les tuiles d'une cartouche (ou toutes celles ramassées
 * par le collecteur), en une grande image où l'on clique pour prendre.
 *
 *   - la planche montre 16 tuiles par rangée, dans l'ordre où elles sont
 *     rangées (dans la cartouche, ou dans l'ordre où le jeu les a chargées) ;
 *   - « cacher le vide et le bruit » grise ce qui n'est pas un dessin ;
 *   - on choisit une TAILLE (8, 16, 32) et un ORDRE, puis on clique une
 *     tuile : elle et celles qui la suivent forment le dessin, montré en grand
 *     à côté avec « ➕ Dans mes dessins » ;
 *   - « ➕ Toute la page » prend tous les dessins de la page d'un coup ;
 *   - « 💾 Tout en image » enregistre TOUTES les tuiles (toutes les pages)
 *     dans des fichiers PNG — la vraie « tout prendre », sans rien mettre
 *     dans le programme.
 *
 * Les calculs sont dans capturer-cartouche.js ; ici, on ne fait que montrer.
 */
import { tuilesDUneBanque, toutesLesTuiles, nombreDeBanques, assembler, TUILES_PAR_BANQUE } from './capturer-cartouche.js'

/* Les quatre nuances de la console, du plus clair au plus foncé (celles de l'inspecteur). */
const NUANCES = ['#e0f8d0', '#88c070', '#346856', '#081820']
const PAR_RANGEE = 16   // tuiles par rangée de la planche
const ZOOM = 2          // un pixel de tuile = 2 × 2 pixels à l'écran
const CASE = 8 * ZOOM + 1   // une tuile + 1 pixel de séparation

const element = (balise, classe, texte) => {
  const e = document.createElement(balise)
  if (classe) e.className = classe
  if (texte !== undefined) e.textContent = texte
  return e
}
const bouton = (texte, titre) => {
  const b = element('button', 'petit', texte)
  b.type = 'button'
  if (titre) b.title = titre
  return b
}
const hex = (n, chiffres) => '$' + n.toString(16).toUpperCase().padStart(chiffres, '0')

/** Une tuile peinte dans un canevas, à la place (gx, gy), un pixel = « zoom » pixels. */
function peindre(ctx, rangees, gx, gy, zoom, terne = false) {
  rangees.forEach((r, y) => [...r].forEach((c, x) => {
    ctx.fillStyle = NUANCES[Number(c)]
    ctx.fillRect(gx + x * zoom, gy + y * zoom, zoom, zoom)
  }))
  if (terne) {   // le vide et le bruit : voilés, pour que les dessins ressortent
    ctx.fillStyle = 'rgba(128,128,128,0.8)'
    ctx.fillRect(gx, gy, 8 * zoom, 8 * zoom)
  }
}

/** Un dessin assemblé, en grand (le 0 en damier, comme les autres aperçus de l'atelier). */
function apercu(rangees, cote) {
  const zoom = cote === 32 ? 3 : cote === 16 ? 5 : 8
  const toile = element('canvas')
  toile.width = toile.height = cote * zoom
  const ctx = toile.getContext('2d')
  rangees.forEach((r, y) => [...r].forEach((c, x) => {
    ctx.fillStyle = c === '0' ? ((x + y) % 2 ? '#ccc' : '#eee') : NUANCES[Number(c)]
    ctx.fillRect(x * zoom, y * zoom, zoom, zoom)
  }))
  return toile
}

/**
 * Des tuiles en images PNG : 64 par rangée, et au plus 2048 rangées par image
 * (16 384 pixels de haut — au-delà, certains navigateurs refusent de
 * dessiner). Une très grande cartouche donne donc plusieurs images.
 * Rend les images en « data:image/png;base64,… ».
 */
function tuilesEnPNG(tuiles) {
  const LARGE = 64, MAX_RANGEES = 2048, PAR_IMAGE = LARGE * MAX_RANGEES
  const morceaux = Math.max(1, Math.ceil(tuiles.length / PAR_IMAGE))
  const images = []
  for (let m = 0; m < morceaux; m++) {
    const part = tuiles.slice(m * PAR_IMAGE, (m + 1) * PAR_IMAGE)
    const toile = element('canvas')
    toile.width = LARGE * 8
    toile.height = Math.max(1, Math.ceil(part.length / LARGE)) * 8
    const ctx = toile.getContext('2d')
    part.forEach((t, i) => peindre(ctx, t.rangees, (i % LARGE) * 8, Math.floor(i / LARGE) * 8, 1))
    images.push(toile.toDataURL('image/png'))
  }
  return images
}

/** Les images PNG, enregistrées par le navigateur (dans « Téléchargements »). */
function telecharger(images, nom) {
  images.forEach((png, m) => {
    const lien = element('a')
    lien.href = png
    lien.download = images.length > 1 ? `${nom}-${m + 1}.png` : `${nom}.png`
    lien.click()
  })
}

/**
 * Montrer la planche dans « zone ».
 *
 *   source         'rom' (la cartouche entière) ou 'vram' (le collecteur) ;
 *   rom            les octets de la cartouche (source 'rom') ;
 *   tuilesRamassees  la liste du collecteur (source 'vram') ;
 *   ajouterUnDessin({ cote, rangees, propose })  — un dessin dans le programme ;
 *   ajouterTout(dessins)  — plusieurs d'un coup (un seul nom demandé) ;
 *   dire(texte, bon)  — écrire dans la ligne d'état de la page ;
 *   ranger({ dessins, images })  — les ranger dans le dossier de la cartouche
 *                    (dossier-captures.js) ; sans lui, pas de bouton 📁.
 */
export function montrerLaPlanche(zone, { source, rom = null, tuilesRamassees = [], ajouterUnDessin, ajouterTout, dire = () => {}, ranger = null }) {
  let page = 0          // la banque montrée (pour la cartouche), ou le paquet de 1024 (pour le collecteur)
  let decalage = 0      // 0 à 15 : de combien d'octets on glisse la lecture
  let cacher = true     // griser le vide et le bruit
  let cote = 8
  let ordre = 'grille'  // « comme dans la planche » : le plus fréquent (Super Mario Land 2…)
  let choisie = null    // la tuile cliquée (sa place dans la page)

  const pages = () => source === 'rom' ? nombreDeBanques(rom) : Math.max(1, Math.ceil(tuilesRamassees.length / TUILES_PAR_BANQUE))
  const tuilesDeLaPage = () => source === 'rom'
    ? tuilesDUneBanque(rom, page, decalage)
    : tuilesRamassees.slice(page * TUILES_PAR_BANQUE, (page + 1) * TUILES_PAR_BANQUE)

  zone.textContent = ''
  zone.hidden = false
  zone.style.cssText = 'display:flex;flex-direction:column;gap:6px;margin:8px 0'

  /* --- la barre de réglages --- */
  const barre = element('div')
  barre.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;align-items:center'
  const precedente = bouton('◀', 'la page d’avant')
  const suivante = bouton('▶', 'la page d’après')
  const numero = element('span', 'aide')
  const glisser = bouton('↷ Décaler d’un octet', 'si la planche n’est que du bruit, les tuiles de ce jeu ne commencent peut-être pas au bon octet : on glisse tout d’un octet (16 fois au plus)')
  const caseCacher = element('input')
  caseCacher.type = 'checkbox'
  caseCacher.checked = true
  const etiquetteCacher = element('label', 'aide')
  etiquetteCacher.append(caseCacher, ' griser le vide et le bruit')
  const choixTaille = element('select')
  for (const [v, t] of [[8, '8 × 8 (1 tuile)'], [16, '16 × 16 (4 tuiles)'], [32, '32 × 32 (16 tuiles)']]) choixTaille.append(new Option(t, v))
  choixTaille.title = 'la taille du dessin pris quand tu cliques : la tuile cliquée et celles qui la suivent'
  const choixOrdre = element('select')
  choixOrdre.append(new Option('comme dans la planche (carré de tuiles)', 'grille'), new Option('ligne par ligne (tuiles qui se suivent)', 'lignes'), new Option('colonne par colonne (lutins 8 × 16)', 'colonnes'))
  choixOrdre.title = 'dans quel ordre les tuiles qui se suivent forment le dessin : essaie l’autre si le personnage paraît coupé en morceaux'
  barre.append(precedente, numero, suivante)
  if (source === 'rom') barre.append(glisser)
  barre.append(etiquetteCacher, choixTaille, choixOrdre)

  const actions = element('div')
  actions.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px'
  const toutLaPage = bouton('➕ Toute la page dans mes dessins', 'tous les dessins de cette page (sans le vide ni le bruit), à la taille choisie, d’un coup')
  toutLaPage.classList.add('principal')
  const toutEnImage = bouton(source === 'rom' ? '💾 Toute la cartouche en image (PNG)' : '💾 Tout le ramassé en image (PNG)',
    'enregistre TOUTES les tuiles, de toutes les pages, en fichiers PNG — sans le vide (ni le bruit, si la case est cochée)')
  const toutRanger = bouton('📁 Tout ranger dans le dossier de la cartouche',
    'TOUS les dessins de TOUTES les pages (à la taille et dans l’ordre choisis), et l’image PNG de toutes les tuiles, dans le dossier de cette cartouche — créé la première fois, complété ensuite')
  toutRanger.classList.add('clignote-tout')   // vert qui clignote en rouge (index.html)
  actions.append(toutLaPage, toutEnImage)
  if (ranger) actions.append(toutRanger)

  /* --- la planche, et le dessin choisi à côté --- */
  const corps = element('div')
  corps.style.cssText = 'display:flex;flex-wrap:wrap;gap:10px;align-items:flex-start'
  const toile = element('canvas')
  toile.style.cssText = 'cursor:crosshair;image-rendering:pixelated;max-width:100%;border:1px solid var(--bord)'
  const choix = element('div')
  choix.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:4px'
  corps.append(toile, choix)

  const avertir = element('p', 'aide', 'Les dessins d’un jeu appartiennent à ses auteurs : prends-les pour apprendre et t’entraîner, pas pour publier le jeu d’un autre.')
  zone.append(barre, actions, corps, avertir)

  let tuiles = []
  function dessinerLaPlanche() {
    tuiles = tuilesDeLaPage()
    numero.textContent = (source === 'rom' ? `banque ${page} / ${pages() - 1}` : `page ${page + 1} / ${pages()}`)
      + (decalage ? ` · décalée de ${decalage}` : '')
      + ` · ${tuiles.filter((t) => t.nature === 'dessin').length} dessins sur ${tuiles.length} tuiles`
    precedente.disabled = page === 0
    suivante.disabled = page >= pages() - 1
    const rangees = Math.max(1, Math.ceil(tuiles.length / PAR_RANGEE))
    toile.width = PAR_RANGEE * CASE
    toile.height = rangees * CASE
    const ctx = toile.getContext('2d')
    ctx.fillStyle = '#555'
    ctx.fillRect(0, 0, toile.width, toile.height)
    tuiles.forEach((t, i) => peindre(ctx, t.rangees, (i % PAR_RANGEE) * CASE, Math.floor(i / PAR_RANGEE) * CASE, ZOOM, cacher && t.nature !== 'dessin'))
    // les tuiles prises : encadrées en rouge
    if (choisie !== null) {
      ctx.strokeStyle = '#e02020'
      ctx.lineWidth = 2
      for (const i of placesDuDessin(choisie)) {
        if (i >= tuiles.length) continue
        ctx.strokeRect((i % PAR_RANGEE) * CASE + 1, Math.floor(i / PAR_RANGEE) * CASE + 1, CASE - 2, CASE - 2)
      }
    }
    montrerLeChoix()
  }

  /* Le nom proposé : d'où vient le dessin. « T_01A2F0 » : à l'adresse $01A2F0
     de la cartouche ; « V_37 » : la 37e tuile ramassée. */
  const nomPropose = (t, place) => source === 'rom' ? 'T_' + t.adresse.toString(16).toUpperCase().padStart(6, '0') : 'V_' + (place + 1)
  const pourLeDossier = (d, t, place) => ({ nom: nomPropose(t, place), cote: d.cote, rangees: d.rangees, source: source === 'rom' ? 'cartouche' : 'memoire-video', adresse: t.adresse })

  function montrerLeChoix() {
    choix.textContent = ''
    if (choisie === null || !tuiles[choisie]) {
      choix.append(element('span', 'aide', 'Clique une tuile de la planche.'))
      return
    }
    const d = assembler(tuiles, choisie, cote, ordre)
    const t = tuiles[choisie]
    const ou = source === 'rom' ? `adresse ${hex(t.adresse, 6)} (banque ${page})` : `chargée en ${hex(t.adresse, 4)}${t.banqueVram ? ' (banque 1)' : ''}`
    const ajouter = bouton('➕ Dans mes dessins')
    ajouter.addEventListener('click', () => ajouterUnDessin({ cote: d.cote, rangees: d.rangees, propose: cote === 8 ? 'TUILE' : 'PERSO' }))
    choix.append(apercu(d.rangees, d.cote), element('span', 'aide', `${cote} × ${cote} · ${ou}`), ajouter)
    if (ranger) {
      const ici = bouton('📁 Ranger ce dessin', 'dans le dossier de cette cartouche')
      ici.addEventListener('click', () => ranger({ dessins: [pourLeDossier(d, t, page * TUILES_PAR_BANQUE + choisie)], images: [] }))
      choix.append(ici)
    }
  }

  /* Les dessins de la page, à la taille choisie : des paquets de 1, 4 ou 16
     tuiles qui se suivent ; on saute les paquets sans aucun dessin, et les
     pareils ne comptent qu'une fois. */
  /* Les places des tuiles d'un dessin qui commence en « depart » : un carré de
     la planche (« grille ») ou des tuiles qui se suivent. */
  function placesDuDessin(depart) {
    const n = cote / 8
    return Array.from({ length: n * n }, (_, j) => ordre === 'grille' ? depart + Math.floor(j / n) * PAR_RANGEE + (j % n) : depart + j)
  }
  /* Où commencent les dessins d'une page : des carrés de la planche, ou toutes les n × n tuiles. */
  function departsDeLaPage(nombre) {
    const n = cote / 8
    if (ordre !== 'grille') return Array.from({ length: Math.ceil(nombre / (n * n)) }, (_, k) => k * n * n)
    const departs = []
    for (let r = 0; r * PAR_RANGEE < nombre; r += n) for (let c = 0; c < PAR_RANGEE; c += n) if (r * PAR_RANGEE + c < nombre) departs.push(r * PAR_RANGEE + c)
    return departs
  }

  function dessinsDeLaPage(liste = tuiles, premiere = page * TUILES_PAR_BANQUE, vus = new Set()) {
    const dessins = []
    for (const i of departsDeLaPage(liste.length)) {
      const les = placesDuDessin(i).map((k) => liste[k]).filter(Boolean)
      if (cacher && !les.some((t) => t.nature === 'dessin')) continue
      if (!cacher && les.every((t) => t.nature === 'vide')) continue
      const d = assembler(liste, i, cote, ordre)
      const cle = d.rangees.join('|')
      if (vus.has(cle)) continue
      vus.add(cle)
      dessins.push(Object.assign(d, { pourLeDossier: pourLeDossier(d, liste[i], premiere + i) }))
    }
    return dessins
  }

  /* Toutes les tuiles, de toutes les pages : ce que « 💾 » et « 📁 » emportent. */
  const toutesLesTuilesGardees = () => (source === 'rom' ? toutesLesTuiles(rom, decalage) : tuilesRamassees)
    .filter((t) => t.nature === 'dessin' || (!cacher && t.nature !== 'vide'))

  precedente.addEventListener('click', () => { page--; choisie = null; dessinerLaPlanche() })
  suivante.addEventListener('click', () => { page++; choisie = null; dessinerLaPlanche() })
  glisser.addEventListener('click', () => { decalage = (decalage + 1) % 16; dessinerLaPlanche() })
  caseCacher.addEventListener('change', () => { cacher = caseCacher.checked; dessinerLaPlanche() })
  choixTaille.addEventListener('change', () => { cote = Number(choixTaille.value); dessinerLaPlanche() })
  choixOrdre.addEventListener('change', () => { ordre = choixOrdre.value; dessinerLaPlanche() })
  toile.addEventListener('click', (e) => {
    const r = toile.getBoundingClientRect()
    const x = Math.floor((e.clientX - r.left) * toile.width / r.width / CASE)
    const y = Math.floor((e.clientY - r.top) * toile.height / r.height / CASE)
    const i = y * PAR_RANGEE + x
    if (i < tuiles.length) { choisie = i; dessinerLaPlanche() }
  })
  toutLaPage.addEventListener('click', () => {
    const dessins = dessinsDeLaPage()
    if (!dessins.length) { dire('Aucun dessin sur cette page.', false); return }
    if (dessins.length > 64 && !confirm(`${dessins.length} dessins d’un coup : ton programme va devenir très long, et la console ne garde que 384 tuiles en même temps. Continuer ?`)) return
    ajouterTout(dessins)
  })
  toutEnImage.addEventListener('click', async () => {
    const toutes = toutesLesTuilesGardees()
    if (!toutes.length) { dire('Rien à enregistrer.', false); return }
    const images = tuilesEnPNG(toutes)
    telecharger(images, source === 'rom' ? 'cartouche-tuiles' : 'tuiles-ramassees')
    const fichiers = images.length
    dire(`${toutes.length} tuiles enregistrées en ${fichiers} image${fichiers > 1 ? 's' : ''} PNG (64 tuiles par rangée). Tu peux les rouvrir avec « Importer une image ».`, true)
  })

  toutRanger.addEventListener('click', () => {
    const vus = new Set()
    const dessins = []
    for (let p = 0; p < pages(); p++) {
      const liste = source === 'rom' ? tuilesDUneBanque(rom, p, decalage) : tuilesRamassees.slice(p * TUILES_PAR_BANQUE, (p + 1) * TUILES_PAR_BANQUE)
      dessins.push(...dessinsDeLaPage(liste, p * TUILES_PAR_BANQUE, vus).map((d) => d.pourLeDossier))
    }
    const toutes = toutesLesTuilesGardees()
    /* La cartouche n'envoie plus sa grande image : banques/ la contient déjà, tuiles à leur place
       (et deux PNG d'un même contenu ne sont pas toujours identiques au octet près : on en
       empilerait à chaque fois). Ce que 🧲 a ramassé, lui, change d'une séance à l'autre. */
    ranger({ dessins, images: source === 'vram' && toutes.length ? tuilesEnPNG(toutes).map((png) => ({ sorte: 'ramasse', png })) : [] })
  })

  dessinerLaPlanche()
  /* Pour « 📁 TOUT PRENDRE » sous la console : le même rangement, sans chercher le bouton. */
  return { toutRanger: () => (ranger ? toutRanger.click() : null) }
}

/**
 * Dessiner ses tuiles à la souris, plutôt que de taper des chiffres.
 *
 * Le programme reste la source : ce module lit les « Tuile NOM = {…} » et
 * « Perso NOM = {…} » du texte, les montre, et **réécrit le texte** quand on
 * peint. Il n'y a pas de second endroit où vivrait le dessin — un éditeur
 * graphique qui garderait les tuiles de son côté finirait par ne plus dire la
 * même chose que le code.
 *
 * Les quatre nuances sont celles de l'écran d'origine ; le chiffre 0 est la
 * plus claire, 3 la plus sombre, exactement comme dans le programme.
 */

import { NUANCES_ECRITES, ALPHABETS } from './compilateur/emetteur.js'
import { poserDansLeProgramme } from './programme.js'
import { lireCouleurs, ecrireCouleurs, versDiese, palettesMontrees, assurerLesPalettes } from './editeur-couleurs.js'
import { barrePaint, NOMBRE_DE_PALETTES } from './barre-paint.js'
import { placesDuDecor, placesDesLutins, compterLePerso, trouverUnePalette, differentes, ramenerA, usagesDuDecor, usagesDesLutins, palettePourLui, enUneListe } from './nuancier.js'
import { lirePalettesDuPerso, ecrirePalettesDuPerso, rafraichirLesScenes } from './editeur-scene.js'
import { pixelsDeForme } from './editeur-carte.js'
import { lireAnimations, ecrireAnimations, animationDe, animationAppelee, VITESSES, MODELES_D_ANIMATION, lirePolice, ecrirePolice, LETTRES_DE_LA_POLICE } from './animations-tuiles.js'

/**
 * Une tuile s'écrit en chiffres — « 30222203 » — ou en signes — « #.++++.# ».
 * Les deux disent la même chose ; l'atelier lit les deux, et REND À CHACUNE LA
 * SIENNE quand il réécrit. Repeindre un pixel ne doit pas convertir en chiffres
 * le dessin de quelqu'un qui l'avait écrit en signes.
 */
export const signesDe = (rangees) => {
  /*
   * Le plus EMPLOYÉ, et non le premier trouvé.
   *
   * Un dessin qui porte les deux écritures n'est plus compilable — le
   * compilateur le refuse, et il a raison. Mais il faut bien en sortir, et
   * c'est la majorité qui dit dans quel sens : un vaisseau de deux cent
   * cinquante signes « .-+# » avec six chiffres tombés dedans se répare vers
   * les signes, pas l'inverse.
   */
  const combien = ALPHABETS.map((signes) =>
    rangees.reduce((n, r) => n + [...r].filter((s) => signes.includes(s)).length, 0))
  return combien[1] > combien[0] ? ALPHABETS[1] : ALPHABETS[0]
}

/** Le dessin réécrit dans UN seul alphabet, sans changer un seul pixel. */
export const enUnSeulAlphabet = (rangees, signes) =>
  rangees.map((r) => [...r].map((signe) => signes[nuanceDe(signe)]).join(''))

/** La nuance d'un signe, quel que soit l'alphabet. */
export const nuanceDe = (signe) => NUANCES_ECRITES[signe] ?? 0

/*
 * Les signes, prêts à entrer dans une classe de caractères.
 *
 * Le tiret part À LA FIN : au milieu, « 1-2 » serait lu comme un intervalle, et
 * la classe voudrait dire autre chose que ce qu'on croit.
 */
const CLASSE = Object.keys(NUANCES_ECRITES).filter((s) => s !== '-').join('') + '-'

/** Les quatre nuances de l'écran vert, de la plus claire à la plus sombre. */
/*
 * Les quatre nuances de l'atelier.
 *
 * Une tuile ne contient PAS de couleurs : elle contient quatre numéros de
 * teinte, de 0 à 3. La couleur vient de la palette de la case où on la pose.
 * L'atelier a donc besoin d'une palette pour montrer quoi que ce soit — celle
 * d'origine par défaut, celle du programme dès qu'il en pose une.
 *
 * Le tableau est MUTÉ sur place, et jamais remplacé : « peindre() » le relit à
 * chaque trait, et la bande des miniatures aussi. Le remplacer laisserait ces
 * lecteurs-là sur l'ancien.
 */
const SAUT = String.fromCharCode(10)

/** Les nuances d'origine, en composantes de 0 à 31 (pour le curseur). */
const NUANCES_CINQ = [[28, 31, 26], [17, 24, 14], [6, 13, 10], [1, 3, 4]]
const depuisNuance = (n) => NUANCES_CINQ[n] ?? NUANCES_CINQ[3]

export const NUANCES = ['#e0f8d0', '#88c070', '#346856', '#081820']

/** Les nuances d'origine, pour y revenir quand le programme n'est pas en couleur. */
export const NUANCES_ORIGINE = ['#e0f8d0', '#88c070', '#346856', '#081820']

/** Change les quatre nuances de l'atelier. Quatre couleurs CSS, dans l'ordre. */
export function poserNuances(quatre) {
  for (let i = 0; i < 4; i++) NUANCES[i] = quatre[i] ?? NUANCES_ORIGINE[i]
}

/** La police occupe les 44 premiers numéros ; les dessins suivent. */
const PREMIER_DESSIN = 44

const MOTIF = /\b(Tuile|Perso)\s+([A-Za-z_][\w]*)\s*=\s*\{([\s\S]*?)\}\s*;/g

/**
 * Retrouve les tuiles dessinées dans un programme.
 *
 * Rend, pour chacune : son nom, son côté (8 ou 16), ses rangées, et où elle se
 * trouve dans le texte — c'est cette position qui permet de la réécrire sans
 * toucher au reste.
 *
 * Un dessin de seize occupe QUATRE numéros de tuile : le matériel ne connaît
 * que des carrés de huit. Le compte suit la même règle que le compilateur,
 * sinon le numéro annoncé serait faux.
 */
export function lireDessins(source) {
  const trouves = []
  let prochain = PREMIER_DESSIN
  MOTIF.lastIndex = 0
  let coup

  while ((coup = MOTIF.exec(source)) !== null) {
    const cote = coup[1] === 'Perso' ? 16 : 8
    const attendu = new RegExp(`'([${CLASSE}]{${cote}})'|"([${CLASSE}]{${cote}})"`, 'g')
    const rangees = [...coup[3].matchAll(attendu)].map((m) => m[1] ?? m[2])
    if (rangees.length !== cote) continue // une tuile mal formée est laissée au compilateur

    trouves.push({
      nom: coup[2],
      cote,
      rangees,
      debut: coup.index,
      fin: coup.index + coup[0].length,
      numero: prochain,
    })
    prochain += cote === 16 ? 4 : 1
  }

  return trouves
}

/** Réécrit une tuile dans le texte, en gardant l'indentation d'origine. */
export function remplacerDessin(source, dessin, rangees) {
  const avant = source.slice(0, dessin.debut)
  const debutDeLigne = avant.lastIndexOf('\n') + 1
  const marge = avant.slice(debutDeLigne).match(/^[ \t]*/)[0]
  const type = dessin.cote === 16 ? 'Perso' : 'Tuile'

  const texte = [
    `${type} ${dessin.nom} = {`,
    ...rangees.map((r) => `${marge}  "${r}",`),
    `${marge}};`,
  ].join('\n')

  return source.slice(0, dessin.debut) + texte + source.slice(dessin.fin)
}

/*
 * Les morceaux du texte qu'on ne renomme pas : les textes entre guillemets
 * (« SOL » affiché à l'écran n'est pas la tuile SOL). Les commentaires, eux,
 * sont renommés : c'est là que vivent « /* SOL : palette 2 *\/ » et les
 * étiquettes, qui suivent leur tuile par son nom.
 */
const MORCEAUX = /"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|[A-Za-z_]\w*/g

/** Tous les noms écrits dans le programme, hors des textes entre guillemets. */
export function nomsDuProgramme(source) {
  const noms = new Set()
  for (const [morceau] of source.matchAll(MORCEAUX)) {
    if (morceau[0] !== '"' && morceau[0] !== "'") noms.add(morceau)
  }
  return noms
}

/**
 * Renomme partout : la déclaration, chaque « poser(…, SOL) », les marques
 * de palette et d'étiquettes, et « SOL_PALETTES » qui accompagne un Perso.
 * Un mot qui ne fait que contenir l'ancien nom (« SOLDAT ») n'est pas touché.
 */
export function renommerPartout(source, ancien, neuf) {
  return source.replace(MORCEAUX, (morceau) => {
    if (morceau === ancien) return neuf
    if (morceau === `${ancien}_PALETTES`) return `${neuf}_PALETTES`
    return morceau
  })
}

/**
 * Une tuile neuve, ajoutée à la suite des autres.
 *
 * Vide par défaut — ou DESSINÉE, quand elle vient de la bibliothèque : prendre
 * un modèle, c'est écrire ses rangées dans le programme, et rien d'autre. Il
 * n'y a pas de dessin qui vivrait ailleurs que dans le texte.
 */
export function ajouterDessin(source, nom, cote = 8, modele = null) {
  const dessins = lireDessins(source)
  const type = cote === 16 ? 'Perso' : 'Tuile'
  const rangees = modele ?? Array.from({ length: cote }, () => '0'.repeat(cote))
  const bloc = [`${type} ${nom} = {`, ...rangees.map((r) => `  "${r}",`), '};'].join('\n')

  /* À la suite des autres quand il y en a ; sous l’en-tête pour le premier —
     « programme.js » dit où, et il le dit pour les airs aussi. */
  const dernier = dessins[dessins.length - 1]
  return poserDansLeProgramme(source, bloc, dernier ? dernier.fin : null)
}

/**
 * Peint une tuile dans un canevas, à la taille qu'il fait.
 *
 * `couleurDe(x, y, numero)`, s'il est donné, dit la couleur de chaque pixel
 * — celle d'un personnage dont chaque quart a sa palette.
 */
export function peindre(canevas, rangees, cote, couleurDe = null) {
  const ctx = canevas.getContext('2d')
  const pas = canevas.width / cote

  for (let y = 0; y < cote; y++) {
    for (let x = 0; x < cote; x++) {
      ctx.fillStyle = couleurDe ? couleurDe(x, y, nuanceDe(rangees[y][x])) : NUANCES[nuanceDe(rangees[y][x])]
      ctx.fillRect(x * pas, y * pas, pas, pas)
    }
  }
}

/*
 * Avec quelle palette cette tuile est-elle POSÉE dans le programme ?
 *
 * L'atelier ouvrait toujours la palette 0 : une brique s'affichait donc dans
 * les couleurs du ciel, et l'on devait redescendre le menu à chaque fois — ou
 * croire que la couleur ne prenait pas.
 *
 * On cherche donc, autour de chaque « poser(…, BRIQUE) », le « teindre(…, n) »
 * qui l'accompagne. C'est la forme qu'on écrit naturellement :
 *
 *   poser(c, 10, BRIQUE);
 *   teindre(c, 10, 1);
 *
 * Trois lignes de voisinage suffisent, et rien n'est deviné au-delà : sans
 * « teindre » à côté, on rend « null » et l'appelant garde son choix.
 */
const marqueDePalette = (nom) => new RegExp(`^[ \\t]*/\\* ${nom} : palette (\\d) \\*/.*$`, 'm')

export function paletteDUneTuile(source, nom) {
  if (!nom) return null
  /* La palette choisie dans l'atelier, écrite sous le dessin : « /* BRIQUE : palette 2 *\/ ». */
  const marque = source.match(marqueDePalette(nom))
  const lignes = source.split(SAUT)
  /*
   * Le « teindre » d'une tuile vise LA MÊME CASE que son « poser » : mêmes colonne
   * et ligne. On prenait n'importe quel « teindre » à trois lignes près — deux
   * tuiles posées l'une sous l'autre se volaient alors leur palette, et en
   * changer une semblait changer l'autre.
   */
  for (let i = 0; i < lignes.length; i++) {
    for (const pose of posesDe(lignes[i], nom)) {
      const t = teindreDeLaCase(lignes, i, pose)
      if (t && t.palette <= 7) return t.palette
    }
  }
  return marque ? Number(marque[1]) : null
}

/*
 * Les ÉTIQUETTES d'un dessin — pour le retrouver dans la bande : « décor »,
 * « mur », « ennemi »… et « ★ » pour un favori. Écrites sous le dessin :
 *
 *   /* BRIQUE : étiquettes décor mur ★ *\/
 */
const marqueDEtiquettes = (nom) => new RegExp(`^[ \\t]*/\\* ${nom} : étiquettes ([^*]*?) \\*/.*(?:\\r?\\n)?`, 'm')

export function lireEtiquettes(source, nom) {
  const m = source.match(marqueDEtiquettes(nom))
  return m ? m[1].trim().split(/\s+/).filter(Boolean) : []
}

export function ecrireEtiquettes(source, nom, etiquettes) {
  const propres = [...new Set(etiquettes.map((e) => e.replace(/[^\p{L}\p{N}★_-]/gu, '')).filter(Boolean))]
  const motif = marqueDEtiquettes(nom)
  const ligne = `/* ${nom} : étiquettes ${propres.join(' ')} */${SAUT}`
  if (motif.test(source)) return source.replace(motif, () => (propres.length ? ligne : ''))
  if (!propres.length) return source
  const debut = source.search(new RegExp(`\\b(?:Tuile|Perso)\\s+${nom}\\s*=\\s*\\{`))
  if (debut < 0) return source
  const fin = source.indexOf('};', debut)
  if (fin < 0) return source
  const apres = source.indexOf(SAUT, fin)
  const ou = apres < 0 ? source.length : apres + SAUT.length
  return source.slice(0, ou) + ligne + source.slice(ou)
}

/* Écrit (ou réécrit) la marque de palette d'une tuile, juste sous son dessin. */
function marquerLaPalette(source, nom, palette) {
  const ligne = `/* ${nom} : palette ${palette} */   // la palette de l'atelier ; en jeu, c'est « teindre(colonne, ligne, ${palette}) » qui la donne`
  const motif = marqueDePalette(nom)
  if (motif.test(source)) return source.replace(motif, () => ligne)
  const debut = source.search(new RegExp(`\\bTuile\\s+${nom}\\s*=\\s*\\{`))
  if (debut < 0) return source
  const fin = source.indexOf('};', debut)
  return fin < 0 ? source : source.slice(0, fin + 2) + SAUT + ligne + source.slice(fin + 2)
}

/**
 * Pose une tuile avec une autre palette : chaque « teindre » voisin d'un
 * « poser(…, NOM) » prend ce numéro — et un « poser » qui n'en avait pas en
 * reçoit un, juste en dessous. C'est la forme que « paletteDUneTuile » relit.
 */
export function changerPaletteDUneTuile(source, nom, palette) {
  source = marquerLaPalette(source, nom, palette)
  const lignes = source.split(SAUT)
  const ajouts = []
  for (let i = 0; i < lignes.length; i++) {
    for (const pose of posesDe(lignes[i], nom)) {
      const t = teindreDeLaCase(lignes, i, pose)
      if (t) {
        /* Celui de SA case, et lui seul. */
        const l = lignes[t.ligne]
        lignes[t.ligne] = l.slice(0, t.debutPalette) + palette + l.slice(t.finPalette)
      } else {
        const marge = lignes[i].match(/^[ \t]*/)[0]
        const fin = lignes[i].endsWith('\r') ? '\r' : ''
        ajouts.push([i, `${marge}teindre(${pose.colonne}, ${pose.ligne}, ${palette});${fin}`])
      }
    }
  }
  for (const [i, ligne] of ajouts.reverse()) lignes.splice(i + 1, 0, ligne)
  return lignes.join(SAUT)
}

/* Les « poser(colonne, ligne, NOM) » d'une ligne du programme. */
function posesDe(ligne, nom) {
  const motif = new RegExp(`poser\\s*\\(([^,()]+),([^,()]+),\\s*${nom}\\s*\\)`, 'g')
  return [...ligne.matchAll(motif)].map((m) => ({ colonne: m[1].trim(), ligne: m[2].trim() }))
}

const memeExpression = (a, b) => a.replace(/\s+/g, '') === b.replace(/\s+/g, '')

/* Le « teindre » qui vise la même case, à trois lignes près : où il est, et sa palette. */
function teindreDeLaCase(lignes, i, pose) {
  const motif = /teindre\s*\(([^,()]+),([^,()]+),\s*(\d+)\s*\)/g
  for (let d = -3; d <= 3; d++) {
    const voisine = lignes[i + d]
    if (voisine === undefined) continue
    for (const m of voisine.matchAll(motif)) {
      if (!memeExpression(m[1], pose.colonne) || !memeExpression(m[2], pose.ligne)) continue
      const debutPalette = m.index + m[0].lastIndexOf(m[3])
      return { ligne: i + d, palette: Number(m[3]), debutPalette, finPalette: debutPalette + m[3].length }
    }
  }
  return null
}

/**
 * Le pixel du dessin sous la souris, mesuré sur la SURFACE du canevas —
 * bordure exclue : comptée avec le dessin, elle décalait le trait d'un cheveu.
 */
function pixelSous(evenement, canevas, cote) {
  const cadre = canevas.getBoundingClientRect()
  return {
    x: Math.floor(((evenement.clientX - cadre.left - canevas.clientLeft) / canevas.clientWidth) * cote),
    y: Math.floor(((evenement.clientY - cadre.top - canevas.clientTop) / canevas.clientHeight) * cote),
  }
}

/*
 * Le presse-papiers des dessins, commun à toutes les tuiles : on copie une
 * tuile, on la colle sur une autre de la même taille. Seuls les pixels passent
 * (les numéros de couleur) ; la palette reste celle de la tuile d'arrivée.
 */
let dessinCopie = null // { cote, rangees, nom }

/** Les zooms proposés : pixels d'écran par pixel du dessin. */
const ZOOMS = [4, 6, 8, 11, 16, 22, 28, 36, 44, 56, 64]

/**
 * Installe l'éditeur.
 *
 * `lireSource` et `ecrireSource` sont fournis par la page : le module ne
 * connaît pas le champ de texte, il ne connaît que le programme.
 */
export function installer({
  bande, grille, lireSource, ecrireSource, surChangement, demanderUnNom,
  /* Rend les huit palettes de la console si le programme est en couleur,
     « null » sinon. L'atelier ne connaît pas l'émulateur : il demande. */
  palettesDeLaConsole = () => null,
}) {
  let choisi = null // le nom de la tuile en cours d'édition
  let nuance = 3
  let paletteVue = 0     // avec quelle palette on REGARDE la tuile
  let palettePosee = null // celle qu'on a choisie à la main, s'il y en a une
  let tuileVue = null     // pour quelle tuile ce choix vaut
  let vueLutins = false   // les palettes des personnages plutôt que celles du décor
  let paletteEnMain = 0   // la palette de la couleur en main (0 à 3) ; « nuance » est son numéro
  let zoom = null         // pixels d'écran par pixel ; null : la taille d'origine
  let zoomAvantPleinEcran = null
  let barre = null        // la barre de couleurs : elle dit pourquoi un pixel est refusé
  let placesEnCache = null // les places du décor prises ailleurs, le temps d'un trait
  let derniereSouris = null // où était la souris sur le dessin : le curseur y revient après une recompilation
  /*
   * L'outil de la toile : « peindre » (le crayon), « gomme », « ligne »,
   * « rectangle », « cercle », « remplir » (le pot de peinture), « pipette »,
   * ou « selection » (choisir une zone, et la déplacer).
   */
  let outilTuile = 'peindre'
  let formePleine = false    // rectangle et cercle : pleins, ou le contour seul
  let pelure = true          // pelure d'oignon : l'image d'avant, en transparence, sous celle qu'on dessine
  let minuteurApercu = null  // l'aperçu de l'animation qui tourne
  let zone = null            // { x, y, w, h } : la zone choisie dans le dessin

  /*
   * Poser les nuances AVANT de peindre quoi que ce soit.
   *
   * Elles étaient posées au milieu du rafraîchissement, entre le canevas et
   * les pastilles : le canevas sortait donc dans les couleurs de la palette
   * PRÉCÉDENTE, et l'on voyait des pastilles brique au-dessus d'une brique
   * bleue. Deux peintres, un seul endroit qui décide — et l'ordre dans lequel
   * on les appelle cesse de compter.
   */
  function poserLesNuances() {
    const palettes = palettesDeLaConsole()
    if (!palettes || !palettes.length) {
      poserNuances(NUANCES_ORIGINE)
      return null
    }

    /* Une autre tuile : on repart de celle avec laquelle le programme la pose,
       et l'on oublie le choix fait à la main pour la précédente. */
    if (choisi !== tuileVue) {
      tuileVue = choisi
      palettePosee = null
      /* Un personnage de seize se regarde d'abord avec les palettes des personnages. */
      vueLutins = dessinChoisi()?.cote === 16
      const dansLeProgramme = paletteDUneTuile(lireSource(), choisi)
      paletteVue = dansLeProgramme === null ? (vueLutins ? 1 : 0) : dansLeProgramme
      const d = dessinChoisi()
      paletteEnMain = Math.min(NOMBRE_DE_PALETTES - 1, vueLutins && d ? quartsDe(lireSource(), d)[0] : paletteVue)
    }
    if (palettePosee !== null) paletteVue = palettePosee
    if (paletteVue >= palettes.length) paletteVue = 0
    /* Les couleurs ÉCRITES dans le programme, sans attendre qu'il recompile :
       une couleur changée à la barre se voit dans l'instant. */
    poserNuances(palettesMontrees(lireSource(), vueLutins)[paletteVue].map(versDiese))
    return palettes
  }
  let peint = false
  let apercus = []

  /* Les palettes des quatre quarts d'un personnage : sa table, ou celle qu'on regarde. */
  const quartsDe = (texte, dessin) => lirePalettesDuPerso(texte, dessin.nom) ??
    Array(4).fill(dessin.nom === choisi ? paletteVue : 1)

  /* Comment peindre ce dessin : null pour les quatre nuances de l'atelier. */
  function peintureDe(dessin) {
    if (!palettesDeLaConsole()) return null
    const texte = lireSource()
    /*
     * Une tuile de 8 × 8 : dans SA palette, et non dans celle de la tuile ouverte.
     * Les vignettes de la bande prenaient toutes les couleurs de la tuile qu'on
     * peignait : on la passait en palette 3, et tout le monde semblait passer en
     * palette 3 avec elle — alors qu'aucune autre tuile n'avait changé.
     */
    if (dessin.cote !== 16) {
      const p = dessin.nom === choisi ? paletteVue : (paletteDUneTuile(texte, dessin.nom) ?? 0)
      const pal = palettesMontrees(texte, false)[Math.min(7, p)]
      return (x, y, n) => versDiese(pal[n])
    }
    const palettes = palettesMontrees(texte, true)
    const quarts = quartsDe(texte, dessin)
    /* Le n° 0 d'un personnage est TRANSPARENT : un damier, comme sa pastille. */
    return (x, y, n) => n === 0
      ? ((x + y) & 1 ? '#c8c8c8' : '#ececec')
      : versDiese(palettes[quarts[(y >> 3) * 2 + (x >> 3)]][n])
  }

  const dessins = () => lireDessins(lireSource())
  const dessinChoisi = () => dessins().find((d) => d.nom === choisi) ?? null

  /* --- la bande des tuiles --- */

  /*
   * Renommer un dessin.
   *
   * Un nom déjà porté par autre chose (une tuile, une variable, une fonction)
   * est REFUSÉ, avec la raison : deux choses sous un même nom, le compilateur
   * ne saurait plus laquelle on veut. Un nom libre remplace l'ancien partout.
   */
  async function renommer(ancien) {
    const pris = nomsDuProgramme(lireSource())
    pris.delete(ancien)

    const neuf = demanderUnNom
      ? await demanderUnNom({ quoi: `le nouveau nom de ${ancien}`, propose: ancien, pris, prevenir: true })
      : demanderSansBoite(ancien, pris)
    if (!neuf || neuf === ancien) return

    ecrireSource(renommerPartout(lireSource(), ancien, neuf))
    if (choisi === ancien) choisi = neuf
    surChangement()
    rafraichirBande()
    rafraichirGrille()
  }

  /* Sans la boîte de l'atelier (la page du tutoriel) : celle du navigateur. */
  function demanderSansBoite(ancien, pris) {
    let propose = ancien
    for (;;) {
      const brut = window.prompt(`Nouveau nom pour ${ancien} :`, propose)
      if (brut === null) return null
      const nom = brut.trim()
      propose = nom
      if (!/^[A-Za-z_]\w*$/.test(nom)) {
        window.alert(`« ${nom} » ne peut pas être un nom : des lettres, des chiffres et _, sans commencer par un chiffre.`)
      } else if (pris.has(nom)) {
        window.alert(`« ${nom} » est déjà utilisé dans le programme. Choisis un autre nom.`)
      } else {
        return nom
      }
    }
  }

  function boutonNeuf(texte, cote) {
    const bouton = document.createElement('button')
    bouton.type = 'button'
    bouton.className = 'tuile neuve'
    bouton.textContent = texte
    bouton.addEventListener('click', async () => {
      const pris = new Set(dessins().map((d) => d.nom))
      const racine = cote === 16 ? 'PERSO' : 'TUILE'
      let n = 1
      while (pris.has(racine + n)) n++

      /*
       * Le nom est DEMANDÉ, pas inventé.
       *
       * « TUILE1 » ne dit rien de ce qu'on va dessiner, et personne ne renomme
       * après coup : on se retrouve avec TUILE1, TUILE2, TUILE3, et plus aucune
       * idée de laquelle est le sol. La page propose un nom ; c'est celui qui
       * dessine qui décide.
       */
      const nom = demanderUnNom
        ? await demanderUnNom({ quoi: cote === 16 ? 'ton personnage' : 'ta tuile', propose: racine + n, pris })
        : racine + n
      if (!nom) return

      choisi = nom
      ecrireSource(ajouterDessin(lireSource(), choisi, cote))
      rafraichirBande()
      rafraichirGrille()
      surChangement()
    })
    return bouton
  }

  /*
   * 🔎 La recherche : par nom ou par étiquette. Le champ vit AU-DESSUS de la
   * bande — refaite à chaque geste, elle lui ferait perdre le curseur.
   */
  let recherche = ''
  const champRecherche = document.createElement('input')
  champRecherche.type = 'search'
  champRecherche.className = 'bande-recherche'
  champRecherche.placeholder = '🔎 chercher un dessin : nom, étiquette, ★'
  champRecherche.addEventListener('input', () => { recherche = champRecherche.value.trim().toLowerCase(); filtrer() })
  bande.parentElement?.insertBefore(champRecherche, bande)
  function filtrer() {
    const mots = recherche.split(/\s+/).filter(Boolean)
    for (const b of bande.querySelectorAll('.tuile[data-nom]')) {
      const quoi = (b.dataset.nom + ' ' + b.dataset.etiquettes).toLowerCase()
      b.hidden = !mots.every((m) => quoi.includes(m.replace(/^#/, '')))
    }
  }
  /* L'aperçu en grand, au survol d'une vignette. */
  const loupe = document.createElement('canvas')
  loupe.className = 'bande-loupe'
  loupe.hidden = true
  document.body.append(loupe)

  function rafraichirBande() {
    poserLesNuances()
    const texteDesEtiquettes = lireSource()
    /* Les favoris d'abord, puis les autres, chacun dans l'ordre du programme. */
    const liste = dessins().map((d, i) => ({ d, i, etiquettes: lireEtiquettes(texteDesEtiquettes, d.nom) }))
      .sort((a, b) => (b.etiquettes.includes('★') - a.etiquettes.includes('★')) || a.i - b.i)
      .map(({ d, etiquettes }) => Object.assign(d, { etiquettes }))
    bande.textContent = ''

    /* Une tuile est TOUJOURS ouverte, dès qu'il en existe une : l'atelier
       s'ouvrait sur une bande de vignettes et une grande place vide, et l'on
       cherchait l'éditeur en le regardant. C'est la même règle que pour les
       airs — deux ateliers côte à côte doivent se comporter pareil. */
    if (choisi === null && liste.length > 0) choisi = liste[0].nom

    if (liste.length === 0) {
      const vide = document.createElement('p')
      vide.className = 'aide'
      vide.textContent =
        'Aucune tuile dessinée dans ce programme. Les boutons ci-dessous en ajoutent une, ' +
        'et le code apparaît dans l’éditeur.'
      bande.append(vide)
    }

    for (const dessin of liste) {
      const bouton = document.createElement('button')
      bouton.type = 'button'
      bouton.className = 'tuile' + (dessin.nom === choisi ? ' choisie' : '')
      bouton.title = `${dessin.nom} — ${dessin.cote} × ${dessin.cote}, tuile numéro ${dessin.numero}` +
        (dessin.cote === 16 ? ' à ' + (dessin.numero + 3) : '')

      const canevas = document.createElement('canvas')
      canevas.width = dessin.cote
      canevas.height = dessin.cote
      if (dessin.cote === 16) canevas.classList.add('grand')
      peindre(canevas, dessin.rangees, dessin.cote, peintureDe(dessin))

      const nom = document.createElement('span')
      nom.textContent = dessin.nom

      bouton.dataset.nom = dessin.nom
      bouton.dataset.etiquettes = dessin.etiquettes.join(' ')
      if (dessin.etiquettes.length) bouton.title += ` — 🏷 ${dessin.etiquettes.join(' ')}`
      /* ★ : un favori passe en tête de la bande. */
      const etoile = document.createElement('i')
      const favori = dessin.etiquettes.includes('★')
      etoile.className = 'bande-etoile' + (favori ? ' allumee' : '')
      etoile.setAttribute('role', 'button')
      etoile.setAttribute('aria-label', favori ? 'retirer des favoris' : 'mettre en favori')
      etoile.title = favori ? 'retirer des favoris' : 'mettre en favori : il passe en tête de la bande'
      etoile.addEventListener('click', (e) => {
        e.stopPropagation()
        const neuves = favori ? dessin.etiquettes.filter((t) => t !== '★') : [...dessin.etiquettes, '★']
        ecrireSource(ecrireEtiquettes(lireSource(), dessin.nom, neuves))
        surChangement()
        rafraichirBande()
      })
      bouton.addEventListener('mouseenter', (e) => {
        loupe.width = loupe.height = dessin.cote
        peindre(loupe, dessin.rangees, dessin.cote, peintureDe(dessin))
        const r = bouton.getBoundingClientRect()
        loupe.style.left = Math.min(window.innerWidth - 140, r.left) + 'px'
        loupe.style.top = Math.max(4, r.top - 136) + 'px'
        loupe.hidden = false
      })
      bouton.addEventListener('mouseleave', () => { loupe.hidden = true })

      /* ✎ : renommer, partout où le nom est écrit. */
      const crayon = document.createElement('i')
      crayon.className = 'bande-renommer'
      crayon.setAttribute('role', 'button')
      crayon.setAttribute('aria-label', 'renommer')
      crayon.title = `renommer ${dessin.nom} partout dans le programme`
      crayon.textContent = '✎'
      crayon.addEventListener('click', (e) => {
        e.stopPropagation()
        renommer(dessin.nom)
      })

      bouton.append(canevas, nom, etoile, crayon)
      bouton.addEventListener('click', () => {
        choisi = dessin.nom
        rafraichirBande()
        rafraichirGrille()
      })

      bande.append(bouton)
    }

    bande.append(boutonNeuf('+ tuile 8 × 8', 8), boutonNeuf('+ perso 16 × 16', 16))
    filtrer()
  }

  /* --- la grille de dessin --- */

  function poserPixel(evenement, canevas) {
    const dessin = dessinChoisi()
    if (!dessin) return

    const { x, y } = pixelSous(evenement, canevas, dessin.cote)
    if (x < 0 || x >= dessin.cote || y < 0 || y >= dessin.cote) return

    if (palettesDeLaConsole()) {
      const fait = peindreAvecLaPalette(dessin, x, y)
      if (!fait) return
      ecrireSource(fait.texte)
      poserLesNuances()
      const peinture = peintureDe(dessin)
      peindre(canevas, fait.rangees, dessin.cote, peinture)
      for (const a of apercus) peindre(a, fait.rangees, dessin.cote, peinture)
      return
    }
    if (nuanceDe(dessin.rangees[y][x]) === nuance) return

    /*
     * On peint AVEC L'ÉCRITURE DU DESSIN, et non avec des chiffres.
     *
     * « String(nuance) » posait un « 3 » au milieu d'un dessin écrit en
     * « .-+# ». Le dessin devenait illégal — le compilateur refuse qu'on
     * mélange les deux — et la faute tombait sur la ligne de la déclaration,
     * loin du pixel qu'on venait de peindre. Repeindre à la souris rendait
     * ainsi un programme incompilable, ce qui est exactement le contraire de
     * ce que l'atelier promet.
     *
     * Le dessin entier repasse dans son alphabet au passage : un mélange déjà
     * dans le fichier se répare au premier trait, sans qu'on ait à ouvrir le
     * texte et à traduire seize rangées à la main.
     */
    const signes = signesDe(dessin.rangees)
    const rangees = enUnSeulAlphabet(dessin.rangees, signes)
    rangees[y] = rangees[y].slice(0, x) + signes[nuance] + rangees[y].slice(x + 1)

    ecrireSource(remplacerDessin(lireSource(), dessin, rangees))
    peindre(canevas, rangees, dessin.cote)
    for (const a of apercus) peindre(a, rangees, dessin.cote)
  }

  /*
   * Peindre en couleur : LE NUMÉRO de la couleur (1 à 4), et SA PALETTE.
   *
   * La console range les couleurs en palettes de quatre, et une tuile en prend
   * une. Peindre avec la couleur 3 de la palette 2, c'est poser le numéro 3,
   * et donner la palette 2 à la tuile — à tout le dessin (ou, pour un
   * personnage, au quart de 8 × 8 où l'on peint). Ses autres pixels prennent
   * alors les couleurs de la palette 2 : c'est ainsi que fait la console, et
   * l'atelier le dit. Aucun refus, aucune couleur rangée en cachette.
   */
  /*
   * Changer une palette SANS changer tout le reste.
   *
   * Une palette sert souvent à beaucoup de monde — la 0 au texte et à tout ce
   * qu'on n'a pas teint. Changer sa couleur changeait donc tout l'écran, alors
   * qu'on ne voulait changer que CE dessin. Si le dessin est seul à s'en servir,
   * la couleur change sur place ; sinon, l'atelier copie la palette dans une
   * palette libre, y met la nouvelle couleur, et ne donne la copie qu'à ce
   * dessin (pour un personnage : aux quarts qui prenaient cette palette).
   */
  function changerPourCeDessin(p, fabriquer) {
    let texte = assurerLesPalettes(lireSource())
    const fond = lireCouleurs(texte, false)
    const lutins = lireCouleurs(texte, true)
    const palettes = vueLutins ? lutins : fond
    const dessin = dessinChoisi()
    const perso = vueLutins && dessin?.cote === 16
    const tuile = !vueLutins && dessin?.cote === 8
    let dit = null
    let q = p
    if (perso || tuile) {
      const choix = palettePourLui(perso ? usagesDesLutins(texte) : usagesDuDecor(texte), p, [dessin.nom])
      q = choix.q
      if (q === null) {
        if (!confirm(`Les 8 palettes sont déjà prises. Changer la palette ${p} pour tout le monde (${enUneListe(choix.autres)} aussi) ?`)) return
        q = p
      } else if (q !== p) {
        dit = `Pour ne changer que ${dessin.nom}, sa palette ${p} est copiée dans la palette ${q} (libre), et c’est elle qui change. ${enUneListe(choix.autres)} gardent la palette ${p}.`
      } else if (choix.autres.length) {
        dit = `${dessin.nom} ne se sert pas de la palette ${p} : elle change pour ${enUneListe(choix.autres)}.`
      }
    }
    palettes[q] = fabriquer(palettes[p].map((c) => [...c]))
    texte = ecrireCouleurs(texte, fond, lutins)
    if (q !== p && perso) {
      const quarts = quartsDe(texte, dessin).map((x) => (x === p ? q : x))
      texte = rafraichirLesScenes(ecrirePalettesDuPerso(texte, dessin.nom, quarts))
    } else if (q !== p && tuile) {
      texte = changerPaletteDUneTuile(texte, dessin.nom, q)
      paletteVue = palettePosee = q
    }
    if (q !== p && paletteEnMain === p) paletteEnMain = q
    /* Le message d'abord : la barre est refaite juste après, et le reprend. */
    if (dit) barre?.dire(dit, 'info')
    ecrireSource(texte)
    surChangement()
    rafraichirGrille()
    rafraichirBande()
  }

  /*
   * Poser des pixels d'un coup — ce que font la gomme, la ligne, le rectangle,
   * le cercle et le pot de peinture.
   *
   *   points        les [x, y] à peindre (ceux hors du dessin sont ignorés)
   *   n             le numéro à y mettre (0 : le fond, ou le transparent)
   *   avecPalette   en couleur, le dessin (ou les quarts du personnage
   *                 touchés) prend la palette en main — comme le crayon. La
   *                 gomme ne change pas de palette : effacer n'est pas colorier.
   */
  function ecrireLesPoints(dessin, points, n, avecPalette) {
    const enCouleur = Boolean(palettesDeLaConsole())
    let texte = enCouleur ? assurerLesPalettes(lireSource()) : lireSource()
    const actuel = lireDessins(texte).find((d) => d.nom === dessin.nom) ?? dessin
    const signes = signesDe(actuel.rangees)
    const rangees = enUnSeulAlphabet(actuel.rangees, signes).map((r) => [...r])
    const dedans = points.filter(([x, y]) => x >= 0 && y >= 0 && x < actuel.cote && y < actuel.cote)
    for (const [x, y] of dedans) rangees[y][x] = signes[n]
    const finies = rangees.map((r) => r.join(''))
    let neuf = remplacerDessin(texte, actuel, finies)
    let dit = null
    if (avecPalette && enCouleur && dedans.length) {
      if (vueLutins && actuel.cote === 16) {
        const quarts = quartsDe(texte, actuel)
        let change = false
        for (const [x, y] of dedans) {
          const q = (y >> 3) * 2 + (x >> 3)
          if (quarts[q] !== paletteEnMain) { quarts[q] = paletteEnMain; change = true }
        }
        if (change) {
          neuf = rafraichirLesScenes(ecrirePalettesDuPerso(neuf, actuel.nom, quarts))
          dit = `Les quarts touchés de ${actuel.nom} prennent la palette ${paletteEnMain}.`
        }
      } else if (paletteVue !== paletteEnMain) {
        neuf = changerPaletteDUneTuile(neuf, actuel.nom, paletteEnMain)
        paletteVue = palettePosee = paletteEnMain
        dit = `${actuel.nom} prend la palette ${paletteEnMain} : tous ses pixels prennent ses couleurs.`
      }
    }
    if (neuf === lireSource()) return finies
    if (dit) barre?.dire(dit, 'info')
    ecrireSource(neuf)
    return finies
  }

  /* Le pot de peinture : les pixels d'un seul tenant (par les côtés) du même numéro. */
  function zoneDuMemeNumero(rangees, x0, y0) {
    const cote = rangees.length
    const cible = nuanceDe(rangees[y0][x0])
    const vus = new Set()
    const pile = [[x0, y0]]
    const points = []
    while (pile.length) {
      const [x, y] = pile.pop()
      if (x < 0 || y < 0 || x >= cote || y >= cote) continue
      const cle = y * cote + x
      if (vus.has(cle) || nuanceDe(rangees[y][x]) !== cible) continue
      vus.add(cle)
      points.push([x, y])
      pile.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1])
    }
    return points
  }

  /*
   * Retourner et tourner : ⇆ (miroir gauche-droite), ⇅ (haut-bas), ↻ (un quart
   * de tour). Sur la zone choisie s'il y en a une, sinon sur tout le dessin.
   * Un personnage entier retourné garde les couleurs de ses quarts : leurs
   * palettes suivent le mouvement.
   */
  function transformer(genre) {
    const d = dessinChoisi()
    if (!d) return
    const cote = d.cote
    const n = d.rangees.map((r) => [...r].map(nuanceDe))
    const r = (outilTuile === 'selection' && zone) ? { ...zone } : { x: 0, y: 0, w: cote, h: cote }
    const sous = Array.from({ length: r.h }, (_, j) => Array.from({ length: r.w }, (_, i) => n[r.y + j][r.x + i]))
    let neuve
    if (genre === 'h') neuve = sous.map((l) => [...l].reverse())
    else if (genre === 'v') neuve = [...sous].reverse()
    else neuve = Array.from({ length: r.w }, (_, i) => Array.from({ length: r.h }, (_, j) => sous[r.h - 1 - j][i]))
    for (let j = 0; j < r.h; j++) for (let i = 0; i < r.w; i++) n[r.y + j][r.x + i] = 0
    const h = neuve.length
    const w = neuve[0].length
    for (let j = 0; j < h; j++) {
      for (let i = 0; i < w; i++) {
        if (r.y + j < cote && r.x + i < cote) n[r.y + j][r.x + i] = neuve[j][i]
      }
    }
    const signes = signesDe(d.rangees)
    let texte = remplacerDessin(lireSource(), d, n.map((l) => l.map((k) => signes[k]).join('')))
    const tout = r.w === cote && r.h === cote
    if (tout && cote === 16 && lirePalettesDuPerso(texte, d.nom)) {
      const q = quartsDe(texte, d)
      const suite = genre === 'h' ? [q[1], q[0], q[3], q[2]] : genre === 'v' ? [q[2], q[3], q[0], q[1]] : [q[2], q[0], q[3], q[1]]
      texte = rafraichirLesScenes(ecrirePalettesDuPerso(texte, d.nom, suite))
    }
    if (zone && outilTuile === 'selection') zone = { x: r.x, y: r.y, w: Math.min(w, cote - r.x), h: Math.min(h, cote - r.y) }
    const quoi = tout ? d.nom : 'la zone'
    barre?.dire(genre === 'h' ? `${quoi} retourné gauche-droite.` : genre === 'v' ? `${quoi} retourné haut-bas.` : `${quoi} tourné d’un quart de tour.`, 'info')
    ecrireSource(texte)
    surChangement()
    rafraichirBande()
    rafraichirGrille()
  }

  /* ------------------------------------------------ 🎞 l'animation d'une tuile */

  function ecrireLAnimation(nouvelle, ancienne, dit) {
    const autres = lireAnimations(lireSource()).filter((a) => a.nom !== (ancienne?.nom ?? nouvelle?.nom))
    const texte = ecrireAnimations(lireSource(), nouvelle ? [...autres, nouvelle] : autres)
    ecrireSource(texte)
    if (nouvelle && !animationAppelee(texte)) {
      barre?.dire('L’animation est écrite, mais « main » n’a pas de « image(); » : ajoute « animerLesTuiles(); » dans ta boucle de jeu.', 'alerte')
    } else if (dit) barre?.dire(dit, 'info')
    surChangement()
    rafraichirBande()
    rafraichirGrille()
  }

  /*
   * 🔤 La police personnalisée : cette tuile remplace une lettre — tous les
   * textes du jeu la montrent avec ce dessin.
   */
  function panneauDePolice(dessin) {
    const police = lirePolice(lireSource())
    const miennes = police.filter((p) => p.nom === dessin.nom)
    const boite = document.createElement('div')
    boite.className = 'tuile-animation'
    const titre = document.createElement('b')
    titre.textContent = '🔤 Police'
    const dit = document.createElement('p')
    dit.className = 'aide'
    dit.textContent = miennes.length
      ? `${dessin.nom} remplace la lettre ${miennes.map((p) => p.lettre).join(', ')} : tous les textes du jeu la montrent ainsi.`
      : `${dessin.nom} peut remplacer une lettre de la police : tous les textes du jeu la montreront avec ce dessin.`
    const rangee = document.createElement('div')
    rangee.className = 'rangee tuile-outils'
    const liste = document.createElement('select')
    liste.title = 'la lettre que cette tuile remplace'
    liste.append(new Option('remplacer la lettre…', ''))
    for (const l of LETTRES_DE_LA_POLICE) {
      const deja = police.find((p) => p.lettre === l)
      liste.append(new Option(deja ? `${l} (déjà : ${deja.nom})` : l, l))
    }
    liste.addEventListener('change', () => {
      if (!liste.value) return
      const neuve = [...police.filter((p) => p.lettre !== liste.value), { lettre: liste.value, nom: dessin.nom }]
      ecrireSource(ecrirePolice(lireSource(), neuve))
      barre?.dire(`La lettre ${liste.value} prend le dessin de ${dessin.nom}, dans tous les textes.`, 'info')
      surChangement()
      rafraichirGrille()
    })
    rangee.append(liste)
    for (const p of miennes) {
      const b = document.createElement('button')
      b.type = 'button'
      b.className = 'petit'
      b.textContent = `✕ ${p.lettre}`
      b.title = `la lettre ${p.lettre} reprend son dessin d’origine`
      b.addEventListener('click', () => {
        ecrireSource(ecrirePolice(lireSource(), police.filter((x) => x !== p)))
        surChangement()
        rafraichirGrille()
      })
      rangee.append(b)
    }
    boite.append(titre, dit, rangee)
    return boite
  }

  function panneauDAnimation(dessin, vraieTaille, cadreToile, canevas) {
    const texte = lireSource()
    const anim = animationDe(texte, dessin.nom)
    const tous = dessins().filter((d) => d.cote === 8)
    const parNom = new Map(tous.map((d) => [d.nom, d]))
    const boite = document.createElement('div')
    boite.className = 'tuile-animation'
    const titre = document.createElement('b')
    titre.textContent = '🎞 Animation'
    boite.append(titre)
    const petitBouton = (texteB, titreB, action) => {
      const b = document.createElement('button')
      b.type = 'button'
      b.className = 'petit'
      b.textContent = texteB
      b.title = titreB
      b.addEventListener('click', action)
      return b
    }
    const vignette = (nom, taille = 32) => {
      const c = document.createElement('canvas')
      c.width = c.height = 8
      c.style.width = c.style.height = taille + 'px'
      c.className = 'reel'
      const d = parNom.get(nom)
      if (d) peindre(c, d.rangees, 8, peintureDe(d))
      return c
    }
    const nomLibre = (base) => {
      const pris = new Set(dessins().map((d) => d.nom))
      let k = 2
      while (pris.has(base + k)) k++
      return base + k
    }

    if (!anim) {
      const dit = document.createElement('p')
      dit.className = 'aide'
      dit.textContent = `${dessin.nom} ne bouge pas. Une animation toute prête (elle fabrique les images) :`
      boite.append(dit)
      const rangee = document.createElement('div')
      rangee.className = 'rangee tuile-outils'
      for (const [cle, modele] of Object.entries(MODELES_D_ANIMATION)) {
        rangee.append(petitBouton(modele.nom, modele.dit, () => {
          const d = dessinChoisi() ?? dessin
          const n = d.rangees.map((l) => [...l].map(nuanceDe))
          const { images, ordre } = modele.fabriquer(n)
          const signes = signesDe(d.rangees)
          let t = lireSource()
          const noms = [d.nom]
          for (const img of images) {
            const nom = (() => { const pris = new Set(lireDessins(t).map((x) => x.nom)); let k = 2; while (pris.has(d.nom + k)) k++; return d.nom + k })()
            t = ajouterDessin(t, nom, 8, img.map((l) => l.map((k) => signes[k]).join('')))
            noms.push(nom)
          }
          ecrireSource(t)
          ecrireLAnimation({ nom: d.nom, images: ordre.map((k) => noms[k]), vitesse: modele.vitesse }, null,
            `${d.nom} est animée (${modele.nom.replace(/^\S+ /, '').toLowerCase()}) : ${images.length} image${images.length > 1 ? 's' : ''} fabriquée${images.length > 1 ? 's' : ''} (${noms.slice(1).join(', ')}). Toutes les cases de ${d.nom} bougent ensemble.`)
        }))
      }
      rangee.append(petitBouton('＋ À la main', 'commence une animation : une copie de la tuile, à redessiner', () => {
        const d = dessinChoisi() ?? dessin
        const nom = nomLibre(d.nom)
        ecrireSource(ajouterDessin(lireSource(), nom, 8, d.rangees))
        ecrireLAnimation({ nom: d.nom, images: [d.nom, nom], vitesse: 16 }, null, `Deuxième image : ${nom}, une copie de ${d.nom}. Ouvre-la dans la frise et redessine-la.`)
      }))
      boite.append(rangee)
      return boite
    }

    /* La frise : chaque image, dans l'ordre ; un clic l'ouvre. */
    const dit = document.createElement('p')
    dit.className = 'aide'
    dit.textContent = anim.nom === dessin.nom
      ? `Les cases de ${anim.nom} montrent ces ${anim.images.length} images, l’une après l’autre :`
      : `${dessin.nom} est une image de l’animation de ${anim.nom} :`
    boite.append(dit)
    const frise = document.createElement('div')
    frise.className = 'tuile-frise'
    anim.images.forEach((nom, k) => {
      const case_ = document.createElement('div')
      case_.className = 'tuile-frise-image' + (nom === dessin.nom ? ' ouverte' : '')
      const b = document.createElement('button')
      b.type = 'button'
      b.title = `image ${k + 1} : ${nom} — clique pour la dessiner`
      b.append(vignette(nom), document.createTextNode(` ${k + 1}`))
      b.addEventListener('click', () => { choisi = nom; rafraichirBande(); rafraichirGrille() })
      case_.append(b)
      if (k > 0) {
        case_.append(petitBouton('✕', `retirer l’image ${k + 1} de l’animation (la tuile ${nom} reste dans le programme)`, () => {
          const images = anim.images.filter((_, i) => i !== k)
          ecrireLAnimation(images.length >= 2 ? { ...anim, images } : null, anim, images.length >= 2 ? `Image ${k + 1} retirée.` : `${anim.nom} ne bouge plus.`)
        }))
      }
      frise.append(case_)
    })
    boite.append(frise)

    const actions = document.createElement('div')
    actions.className = 'rangee tuile-outils'
    actions.append(petitBouton('＋ Image', 'une image de plus : une copie de la dernière, à redessiner', () => {
      const derniere = parNom.get(anim.images.at(-1)) ?? dessin
      const nom = nomLibre(anim.nom)
      ecrireSource(ajouterDessin(lireSource(), nom, 8, derniere.rangees))
      choisi = nom
      ecrireLAnimation({ ...anim, images: [...anim.images, nom] }, anim, `Image ${anim.images.length + 1} : ${nom}, une copie de la précédente.`)
    }))
    /* Ajouter une tuile qui existe déjà. */
    const deja = document.createElement('select')
    deja.title = 'ajouter une tuile qui existe déjà, comme image suivante'
    deja.append(new Option('＋ une tuile existante…', ''))
    for (const d of tous) if (!anim.images.includes(d.nom)) deja.append(new Option(d.nom, d.nom))
    deja.addEventListener('change', () => {
      if (!deja.value) return
      ecrireLAnimation({ ...anim, images: [...anim.images, deja.value] }, anim, `${deja.value} devient l’image ${anim.images.length + 1}.`)
    })
    actions.append(deja)
    for (const v of VITESSES) {
      const b = petitBouton(v.nom + (anim.vitesse === v.images ? ' ✓' : ''), `chaque image dure ${v.images} images de la console (${Math.round(v.images * 1000 / 60)} ms)`,
        () => ecrireLAnimation({ ...anim, vitesse: v.images }, anim, `Vitesse : ${v.nom}.`))
      if (anim.vitesse === v.images) b.classList.add('choisi')
      actions.append(b)
    }
    boite.append(actions)

    const actions2 = document.createElement('div')
    actions2.className = 'rangee tuile-outils'
    /* L'aperçu : la taille réelle et une vignette tournent, au rythme de la console. */
    const apercu = vignette(anim.images[0], 64)
    let k = 0
    minuteurApercu = setInterval(() => {
      if (!apercu.isConnected) { clearInterval(minuteurApercu); return }
      k = (k + 1) % anim.images.length
      const d = parNom.get(anim.images[k])
      if (d) peindre(apercu, d.rangees, 8, peintureDe(d))
    }, anim.vitesse * 1000 / 60)
    const etiquettePelure = document.createElement('label')
    etiquettePelure.className = 'aide reglage'
    const casePelure = document.createElement('input')
    casePelure.type = 'checkbox'
    casePelure.checked = pelure
    casePelure.addEventListener('change', () => { pelure = casePelure.checked; rafraichirGrille() })
    etiquettePelure.append(casePelure, document.createTextNode(' pelure d’oignon (l’image d’avant, en transparence)'))
    actions2.append(apercu, etiquettePelure, petitBouton('⏹ Ne plus animer', `${anim.nom} redevient immobile (ses images restent dans le programme)`, () => ecrireLAnimation(null, anim, `${anim.nom} ne bouge plus.`)))
    boite.append(actions2)

    /* La pelure d'oignon : l'image d'avant, posée sur la toile en transparence. */
    const ici = anim.images.indexOf(dessin.nom)
    const avant = ici > 0 ? parNom.get(anim.images[ici - 1]) : ici === 0 ? parNom.get(anim.images.at(-1)) : null
    if (pelure && avant && avant.nom !== dessin.nom) {
      const calque = document.createElement('canvas')
      calque.className = 'tuile-pelure'
      calque.width = calque.height = 8
      const ctx = calque.getContext('2d')
      const couleurDe = peintureDe(avant)
      for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
          const n = nuanceDe(avant.rangees[y][x])
          if (!n) continue
          ctx.fillStyle = couleurDe ? couleurDe(x, y, n) : NUANCES[n]
          ctx.fillRect(x, y, 1, 1)
        }
      }
      cadreToile.append(calque)
      requestAnimationFrame(() => {
        calque.style.left = canevas.offsetLeft + canevas.clientLeft + 'px'
        calque.style.top = canevas.offsetTop + canevas.clientTop + 'px'
        calque.style.width = canevas.clientWidth + 'px'
        calque.style.height = canevas.clientHeight + 'px'
      })
    }
    return boite
  }

  function peindreAvecLaPalette(dessin, x, y) {
    let texte = assurerLesPalettes(lireSource())
    const perso = vueLutins && dessin.cote === 16
    const signes = signesDe(dessin.rangees)
    const rangees = enUnSeulAlphabet(dessin.rangees, signes).map((r) => [...r])
    let dit = null
    let paletteChange = false
    let quarts = null
    const q = (y >> 3) * 2 + (x >> 3)
    if (perso) {
      quarts = quartsDe(texte, dessin)
      if (quarts[q] !== paletteEnMain) { quarts[q] = paletteEnMain; paletteChange = true }
    } else if (paletteVue !== paletteEnMain) {
      paletteChange = true
    }
    if (!paletteChange && nuanceDe(rangees[y][x]) === nuance && texte === lireSource()) return null
    rangees[y][x] = signes[nuance]
    const finies = rangees.map((r) => r.join(''))

    const actuel = lireDessins(texte).find((d) => d.nom === dessin.nom) ?? dessin
    let neuf = remplacerDessin(texte, actuel, finies)
    if (perso && paletteChange) {
      neuf = rafraichirLesScenes(ecrirePalettesDuPerso(neuf, dessin.nom, quarts))
      dit = `Ce quart de ${dessin.nom} prend la palette ${paletteEnMain}.`
    } else if (paletteChange) {
      neuf = changerPaletteDUneTuile(neuf, dessin.nom, paletteEnMain)
      paletteVue = palettePosee = paletteEnMain
      dit = `${dessin.nom} prend la palette ${paletteEnMain} : tous ses pixels prennent ses couleurs.`
    }
    if (dit) barre?.dire(dit, 'info')
    return { texte: neuf, rangees: finies }
  }

  /*
   * Le plein écran agrandit aussi LE DESSIN : le plus grand zoom qui tient, et
   * celui d'avant en sortant — comme pour la carte.
   */
  grille.addEventListener('fullscreenchange', () => {
    const cote = dessinChoisi()?.cote ?? 8
    if (document.fullscreenElement === grille) {
      zoomAvantPleinEcran = zoom
      /* Côte à côte (écran en largeur) : le dessin prend la hauteur, les palettes la gauche. */
      const coteACote = window.innerWidth > window.innerHeight
      zoom = Math.max(4, Math.floor((coteACote ? Math.min(window.innerWidth - 500, window.innerHeight - 40) : Math.min(window.innerWidth - 80, window.innerHeight - 260)) / cote))
    } else {
      zoom = zoomAvantPleinEcran
      zoomAvantPleinEcran = null
    }
    rafraichirGrille()
    /*
     * Puis on MESURE : la barre des 8 palettes, les outils et les messages
     * prennent plus que les 260 px supposés sur un petit écran — le bas du
     * dessin sortait de l'écran, et l'on ne pouvait plus y peindre.
     */
    if (document.fullscreenElement !== grille) return
    const toile = grille.querySelector('.toile')
    if (!toile) return
    const r = toile.getBoundingClientRect()
    const trop = Math.max(r.bottom - (grille.clientHeight - 16), r.right - (grille.clientWidth - 16))
    if (trop > 0) {
      zoom = Math.max(4, zoom - Math.ceil(trop / cote))
      rafraichirGrille()
    }
  })

  function rafraichirGrille() {
    poserLesNuances()
    grille.textContent = ''
    apercus = []

    const dessin = dessinChoisi()
    if (!dessin) {
      grille.classList.add('vide')
      const aide = document.createElement('p')
      aide.className = 'aide'
      aide.textContent = 'Clique une tuile ci-dessus pour la dessiner.'
      grille.append(aide)
      return
    }

    grille.classList.remove('vide')

    const titre = document.createElement('div')
    titre.className = 'rangee'
    const nom = document.createElement('strong')
    nom.textContent = dessin.nom
    const numero = document.createElement('span')
    numero.className = 'aide'
    numero.textContent = dessin.cote === 16
      ? `tuiles n° ${dessin.numero} à ${dessin.numero + 3} — sprite16(n, x, y, ${dessin.nom})`
      : `tuile n° ${dessin.numero} — poser(x, y, ${dessin.nom})`
    titre.append(nom, numero)

    const canevas = document.createElement('canvas')
    canevas.width = dessin.cote
    canevas.height = dessin.cote
    canevas.className = 'toile'
    /* Le zoom : la taille d'un pixel du dessin à l'écran. Le quadrillage le
       suit — une case doit rester une case. */
    const taillePixel = zoom ?? 176 / dessin.cote
    canevas.style.width = canevas.style.height = taillePixel * dessin.cote + 'px'
    canevas.style.backgroundSize = `${taillePixel}px ${taillePixel}px`
    peindre(canevas, dessin.rangees, dessin.cote, peintureDe(dessin))

    const enCouleur = Boolean(palettesDeLaConsole())
    const palettesIci = enCouleur ? palettesMontrees(lireSource(), vueLutins) : null
    /*
     * Le curseur : un carré de la couleur en main, posé EXACTEMENT sur le
     * pixel qu'on va peindre, et de sa taille — à n'importe quel zoom.
     */
    const cadreToile = document.createElement('div')
    cadreToile.className = 'cadre-toile-tuile'
    const carre = document.createElement('div')
    carre.className = 'curseur-carte'
    carre.hidden = true
    const enMainIci = outilTuile === 'gomme' ? (vueLutins ? null : (enCouleur ? palettesIci[paletteVue]?.[0] : depuisNuance(0)))
      : enCouleur
        ? (vueLutins && nuance === 0 ? null : palettesIci[paletteEnMain][nuance])
        : depuisNuance(nuance)
    if (enMainIci) carre.style.background = versDiese(enMainIci)
    else carre.classList.add('vide')
    cadreToile.append(canevas, carre)
    const suivre = (e) => {
      derniereSouris = { clientX: e.clientX, clientY: e.clientY }
      const { x, y } = pixelSous(e, canevas, dessin.cote)
      if (x < 0 || x >= dessin.cote || y < 0 || y >= dessin.cote) { carre.hidden = true; return }
      montrerIci(x, y)
      if (outilTuile === 'selection') {
        carre.hidden = true
        canevas.style.cursor = zone && x >= zone.x && x < zone.x + zone.w && y >= zone.y && y < zone.y + zone.h ? 'move' : 'crosshair'
        return
      }
      canevas.style.cursor = outilTuile === 'pipette' ? 'copy' : outilTuile === 'remplir' ? 'cell' : ''
      const t = canevas.clientWidth / dessin.cote
      carre.hidden = false
      carre.style.left = canevas.offsetLeft + canevas.clientLeft + x * t + 'px'
      carre.style.top = canevas.offsetTop + canevas.clientTop + y * t + 'px'
      carre.style.width = carre.style.height = t + 'px'
    }
    canevas.addEventListener('pointermove', suivre)
    canevas.addEventListener('pointerleave', () => { carre.hidden = true; derniereSouris = null; montrerIci(null) })
    /* Après une recompilation, le dessin est refait : le curseur revient là où est la souris. */
    requestAnimationFrame(() => {
      if (!derniereSouris || !canevas.isConnected) return
      const r = canevas.getBoundingClientRect()
      if (derniereSouris.clientX >= r.left && derniereSouris.clientX <= r.right && derniereSouris.clientY >= r.top && derniereSouris.clientY <= r.bottom) suivre(derniereSouris)
    })

    /* Sous la barre : la palette de la tuile, ou du quart de personnage qu'on survole. */
    function montrerIci(x, y) {
      if (!barre?.ici || !enCouleur) return
      if (x === null) { barre.ici(vueLutins ? '' : `${dessin.nom} → palette ${paletteVue}`); return }
      if (vueLutins && dessin.cote === 16) {
        const quarts = quartsDe(lireSource(), dessinChoisi() ?? dessin)
        barre.ici(`ce quart de ${dessin.nom} → palette ${quarts[(y >> 3) * 2 + (x >> 3)]}`)
      } else barre.ici(`${dessin.nom} → palette ${paletteVue}`)
    }

    const zoomer = (sens) => {
      const actuel = zoom ?? 176 / dessin.cote
      const suivant = sens > 0
        ? ZOOMS.find((z) => z > actuel + 0.01)
        : [...ZOOMS].reverse().find((z) => z < actuel - 0.01)
      if (!suivant) return
      zoom = suivant
      rafraichirGrille()
    }
    /* Ctrl + molette : zoomer et dézoomer, comme dans Paint. */
    canevas.addEventListener('wheel', (e) => {
      if (!e.ctrlKey) return
      e.preventDefault()
      zoomer(e.deltaY < 0 ? 1 : -1)
    }, { passive: false })

    /*
     * ⬚ Choisir une zone, et la DÉPLACER.
     *
     * On trace un rectangle dans le dessin ; puis on l'attrape et on le glisse :
     * ses pixels suivent la souris, et la place qu'il laisse redevient vide (le
     * n° 0 : le fond, ou le transparent d'un personnage). Tout s'écrit au
     * relâché — ↶ (Ctrl+Z) défait le déplacement d'un coup.
     */
    const cadreZone = document.createElement('div')
    cadreZone.className = 'carte-selection'
    cadreZone.hidden = true
    cadreToile.append(cadreZone)
    const montrerLaZone = () => {
      cadreZone.hidden = !zone
      if (!zone) return
      const t = canevas.clientWidth / dessin.cote
      cadreZone.style.left = canevas.offsetLeft + canevas.clientLeft + zone.x * t + 'px'
      cadreZone.style.top = canevas.offsetTop + canevas.clientTop + zone.y * t + 'px'
      cadreZone.style.width = zone.w * t + 'px'
      cadreZone.style.height = zone.h * t + 'px'
    }
    requestAnimationFrame(montrerLaZone)
    let traceZone = null   // { x, y } : le coin de départ du rectangle qu'on trace
    let deplacement = null // { dx, dy, pixels, depart, rangees } : la zone qu'on glisse
    const borne = (v, min, max) => Math.max(min, Math.min(max, v))
    /* Les rangées du dessin avec la zone déplacée en (nx, ny) : ce qu'on verra au relâché. */
    const avecLaZoneEn = (nx, ny) => {
      const { pixels, depart, rangees } = deplacement
      const signes = signesDe(rangees)
      const r = enUnSeulAlphabet(rangees, signes).map((l) => [...l])
      for (let j = 0; j < depart.h; j++) for (let i = 0; i < depart.w; i++) r[depart.y + j][depart.x + i] = signes[0]
      for (let j = 0; j < depart.h; j++) {
        for (let i = 0; i < depart.w; i++) {
          const x = nx + i
          const y = ny + j
          if (x >= 0 && x < dessin.cote && y >= 0 && y < dessin.cote) r[y][x] = signes[pixels[j][i]]
        }
      }
      return r.map((l) => l.join(''))
    }
    const surAppuiZone = (e) => {
      const { x, y } = pixelSous(e, canevas, dessin.cote)
      const d = dessinChoisi() ?? dessin
      if (zone && x >= zone.x && x < zone.x + zone.w && y >= zone.y && y < zone.y + zone.h) {
        /* Dans la zone : on l'attrape. */
        const pixels = Array.from({ length: zone.h }, (_, j) => Array.from({ length: zone.w }, (_, i) => nuanceDe(d.rangees[zone.y + j][zone.x + i])))
        deplacement = { dx: x - zone.x, dy: y - zone.y, pixels, depart: { ...zone }, rangees: d.rangees }
      } else {
        traceZone = { x: borne(x, 0, dessin.cote - 1), y: borne(y, 0, dessin.cote - 1) }
        zone = { x: traceZone.x, y: traceZone.y, w: 1, h: 1 }
        montrerLaZone()
      }
    }
    const surGlisseZone = (e) => {
      const { x, y } = pixelSous(e, canevas, dessin.cote)
      if (traceZone) {
        const x1 = borne(x, 0, dessin.cote - 1)
        const y1 = borne(y, 0, dessin.cote - 1)
        zone = { x: Math.min(traceZone.x, x1), y: Math.min(traceZone.y, y1), w: Math.abs(x1 - traceZone.x) + 1, h: Math.abs(y1 - traceZone.y) + 1 }
        montrerLaZone()
      } else if (deplacement) {
        const nx = borne(x - deplacement.dx, 1 - deplacement.depart.w, dessin.cote - 1)
        const ny = borne(y - deplacement.dy, 1 - deplacement.depart.h, dessin.cote - 1)
        zone = { x: nx, y: ny, w: deplacement.depart.w, h: deplacement.depart.h }
        const apercu = avecLaZoneEn(nx, ny)
        peindre(canevas, apercu, dessin.cote, peintureDe(dessin))
        montrerLaZone()
      }
    }
    const surRelacheZone = () => {
      if (deplacement && zone && (zone.x !== deplacement.depart.x || zone.y !== deplacement.depart.y)) {
        const finies = avecLaZoneEn(zone.x, zone.y)
        const d = dessinChoisi() ?? dessin
        ecrireSource(remplacerDessin(lireSource(), d, finies))
        /* La zone reste choisie, là où on l'a posée (réduite à ce qui reste dans le dessin). */
        const x0 = Math.max(0, zone.x); const y0 = Math.max(0, zone.y)
        zone = { x: x0, y: y0, w: Math.min(dessin.cote, zone.x + zone.w) - x0, h: Math.min(dessin.cote, zone.y + zone.h) - y0 }
        barre?.dire(`Zone déplacée. Ctrl+Z pour revenir en arrière.`, 'info')
        surChangement()
        rafraichirBande()
        rafraichirGrille()
      }
      traceZone = null
      deplacement = null
    }

    /* Ligne, rectangle, cercle : le point de départ, et l'aperçu pendant qu'on glisse. */
    let forme = null // { x0, y0, x1, y1 }
    const pointsDeLaForme = () => pixelsDeForme(outilTuile, forme.x0, forme.y0, forme.x1, forme.y1, formePleine)
    const montrerLaForme = () => {
      const d = dessinChoisi() ?? dessin
      const signes = signesDe(d.rangees)
      const r = enUnSeulAlphabet(d.rangees, signes).map((l) => [...l])
      for (const [x, y] of pointsDeLaForme()) if (x >= 0 && y >= 0 && x < d.cote && y < d.cote) r[y][x] = signes[nuance]
      peindre(canevas, r.map((l) => l.join('')), d.cote, peintureDe(d))
    }
    const redessiner = (rangees) => {
      const peinture = peintureDe(dessinChoisi() ?? dessin)
      poserLesNuances()
      peindre(canevas, rangees, dessin.cote, peinture)
      for (const a of apercus) peindre(a, rangees, dessin.cote, peinture)
    }
    const FORMES = ['ligne', 'rectangle', 'cercle']

    canevas.addEventListener('pointerdown', (e) => {
      peint = true
      placesEnCache = null
      canevas.setPointerCapture(e.pointerId)
      if (outilTuile === 'selection') { surAppuiZone(e); return }
      const { x, y } = pixelSous(e, canevas, dessin.cote)
      const dedans = x >= 0 && y >= 0 && x < dessin.cote && y < dessin.cote
      if (outilTuile === 'pipette') {
        peint = false
        if (!dedans) return
        const d = dessinChoisi() ?? dessin
        nuance = nuanceDe(d.rangees[y][x])
        if (palettesDeLaConsole()) paletteEnMain = vueLutins && d.cote === 16 ? quartsDe(lireSource(), d)[(y >> 3) * 2 + (x >> 3)] : paletteVue
        outilTuile = 'peindre'
        barre?.dire(palettesDeLaConsole() ? `Pipette : la couleur ${nuance} de la palette ${paletteEnMain}. Le crayon la prend.` : `Pipette : la nuance ${nuance}. Le crayon la prend.`, 'info')
        rafraichirGrille()
        return
      }
      if (outilTuile === 'remplir') {
        peint = false
        if (!dedans) return
        const d = dessinChoisi() ?? dessin
        const points = zoneDuMemeNumero(d.rangees, x, y)
        redessiner(ecrireLesPoints(d, points, nuance, true))
        surChangement()
        rafraichirBande()
        return
      }
      if (FORMES.includes(outilTuile)) {
        forme = { x0: x, y0: y, x1: x, y1: y }
        montrerLaForme()
        return
      }
      if (outilTuile === 'gomme') {
        if (dedans) redessiner(ecrireLesPoints(dessinChoisi() ?? dessin, [[x, y]], 0, false))
        return
      }
      poserPixel(e, canevas)
    })
    canevas.addEventListener('pointermove', (e) => {
      if (!peint) return
      if (outilTuile === 'selection') { surGlisseZone(e); return }
      const { x, y } = pixelSous(e, canevas, dessin.cote)
      if (forme) {
        if (x === forme.x1 && y === forme.y1) return
        forme.x1 = Math.max(0, Math.min(dessin.cote - 1, x))
        forme.y1 = Math.max(0, Math.min(dessin.cote - 1, y))
        montrerLaForme()
        return
      }
      if (outilTuile === 'gomme') {
        const d = dessinChoisi() ?? dessin
        if (x >= 0 && y >= 0 && x < d.cote && y < d.cote && nuanceDe(d.rangees[y][x]) !== 0) redessiner(ecrireLesPoints(d, [[x, y]], 0, false))
        return
      }
      poserPixel(e, canevas)
    })
    const relacher = () => {
      if (!peint) return
      peint = false
      if (outilTuile === 'selection') { surRelacheZone(); return }
      if (forme) {
        const points = pointsDeLaForme()
        forme = null
        redessiner(ecrireLesPoints(dessinChoisi() ?? dessin, points, nuance, true))
      }
      surChangement() // on ne recompile qu'au relâché : sinon la partie repart à chaque pixel
      rafraichirBande()
    }
    canevas.addEventListener('pointerup', relacher)
    canevas.addEventListener('pointercancel', relacher)

    /*
     * La barre de couleurs, comme dans Paint : toutes les palettes en haut,
     * un clic sur une pastille et l'on dessine avec. Voir « barre-paint.js ».
     * La tuile ne garde que des NUMÉROS : choisir une pastille, c'est choisir
     * son numéro — et regarder la tuile dans sa palette.
     */
    barre = barrePaint({
      couleur: enCouleur,
      palettes: palettesIci ?? [],
      choix: { p: paletteEnMain, n: nuance },
      lutins: vueLutins,
      cle: 'tuiles',
      surChoix: (p, n) => {
        nuance = n
        if (enCouleur) paletteEnMain = p
        rafraichirGrille()
      },
      /* Un thème : les 8 palettes du décor et des personnages, d'un coup. */
      surTheme: (theme) => {
        ecrireSource(ecrireCouleurs(lireSource(), theme.fond, theme.lutins))
        surChangement()
        barre?.dire(`Thème « ${theme.nom} » posé : les 8 palettes du décor et des personnages. Ctrl+Z pour revenir en arrière.`, 'info')
        rafraichirGrille()
        rafraichirBande()
      },
      /* Une variété toute prête, mise dans la palette p — pour ce dessin seulement. */
      surVariete: (p, palette) => changerPourCeDessin(p, () => palette.map((c) => [...c])),
      /* Changer une couleur d'une palette — pour ce dessin seulement. */
      surChangerCouleur: (p, n, rvb) => changerPourCeDessin(p, (anciennes) => anciennes.map((c, i) => (i === n ? rvb : c))),
    })
    montrerIci(null)

    /* Zoomer, dézoomer, plein écran — au-dessus du dessin. */
    const outils = document.createElement('div')
    outils.className = 'rangee tuile-zoom'
    const bouton = (texte, titre, action) => {
      const b = document.createElement('button')
      b.type = 'button'
      b.className = 'petit'
      b.textContent = texte
      b.title = titre
      b.addEventListener('click', action)
      return b
    }
    const echelle = document.createElement('span')
    echelle.className = 'aide'
    echelle.textContent = `${Math.round(taillePixel)}×`
    outils.append(
      bouton('− zoom', 'dézoomer : le dessin plus petit (ou Ctrl + molette)', () => zoomer(-1)),
      echelle,
      bouton('+ zoom', 'zoomer : le dessin plus grand, pour viser un pixel (ou Ctrl + molette)', () => zoomer(1)),
      bouton(document.fullscreenElement === grille ? '⛶ Quitter le plein écran' : '⛶ Plein écran',
        'le dessin prend tout l’écran — « Échap » pour revenir', () => {
          if (document.fullscreenElement) document.exitFullscreen()
          else grille.requestFullscreen()
        }),
    )
    /* Les outils de la toile, comme dans Paint — sur leur propre rangée. */
    const rangeeOutils = document.createElement('div')
    rangeeOutils.className = 'rangee tuile-outils'
    const outil = (lequel, texte, titre) => {
      const b = bouton(outilTuile === lequel ? texte + ' ✓' : texte, titre, () => {
        outilTuile = lequel
        if (lequel !== 'selection') zone = null
        rafraichirGrille()
      })
      if (outilTuile === lequel) b.classList.add('choisi')
      return b
    }
    rangeeOutils.append(
      outil('peindre', '✏ Peindre', 'peindre pixel par pixel'),
      outil('gomme', '🧽 Gomme', 'efface : le pixel redevient le n° 0 — le fond, ou le transparent d’un personnage'),
      outil('ligne', '／ Ligne', 'une droite : appuie au départ, relâche à l’arrivée'),
      outil('rectangle', '▭ Rectangle', 'un rectangle, d’un coin à l’autre'),
      outil('cercle', '◯ Cercle', 'un cercle (ou une ellipse), d’un coin à l’autre'),
      bouton(formePleine ? '▣ Formes pleines ✓' : '▢ Formes : contour', 'rectangle et cercle : pleins, ou le contour seul', () => { formePleine = !formePleine; rafraichirGrille() }),
      outil('remplir', '🪣 Remplir', 'le pot de peinture : remplit les pixels voisins du même numéro'),
      outil('pipette', '💧 Pipette', 'reprend la couleur d’un pixel, puis revient au crayon'),
      outil('selection', '⬚ Sélectionner et déplacer', 'trace un rectangle dans le dessin, puis attrape-le et glisse-le ailleurs'),
    )
    const rangeeActions = document.createElement('div')
    rangeeActions.className = 'rangee tuile-outils'
    const surQuoi = () => (outilTuile === 'selection' && zone ? 'la zone choisie' : 'tout le dessin')
    rangeeActions.append(
      bouton('⇆ Miroir', `retourne gauche-droite ${surQuoi()}`, () => transformer('h')),
      bouton('⇅ Miroir', `retourne haut-bas ${surQuoi()}`, () => transformer('v')),
      bouton('↻ Tourner', `un quart de tour, dans le sens des aiguilles d’une montre — ${surQuoi()}`, () => transformer('r')),
      /* Copier un dessin entier, le coller sur un autre de la même taille, ou le dupliquer. */
      bouton('📋 Copier le dessin', `garde le dessin de ${dessin.nom} (${dessin.cote} × ${dessin.cote}) pour le coller sur une autre tuile`, () => {
        const d = dessinChoisi() ?? dessin
        dessinCopie = { cote: d.cote, rangees: d.rangees.map((r) => [...r].map(nuanceDe)), nom: d.nom }
        barre?.dire(`Dessin de ${d.nom} copié (${d.cote} × ${d.cote}). Ouvre une autre tuile de la même taille, puis « 📌 Coller ici ».`, 'info')
        rafraichirGrille()
      }),
      (() => {
        const b = bouton('📌 Coller ici', dessinCopie ? `remplace le dessin par celui de ${dessinCopie.nom}` : 'copie d’abord un dessin', () => {
          const d = dessinChoisi() ?? dessin
          if (!dessinCopie || dessinCopie.cote !== d.cote) return
          const signes = signesDe(d.rangees)
          ecrireSource(remplacerDessin(lireSource(), d, dessinCopie.rangees.map((r) => r.map((n) => signes[n]).join(''))))
          barre?.dire(`Le dessin de ${dessinCopie.nom} est collé dans ${d.nom}. Ctrl+Z pour revenir en arrière.`, 'info')
          surChangement()
          rafraichirBande()
          rafraichirGrille()
        })
        b.disabled = !dessinCopie || dessinCopie.cote !== dessin.cote
        if (dessinCopie && dessinCopie.cote !== dessin.cote) b.title = `le dessin copié fait ${dessinCopie.cote} × ${dessinCopie.cote} : il se colle sur un dessin de la même taille`
        return b
      })(),
      bouton('⧉ Dupliquer', `une nouvelle ${dessin.cote === 16 ? 'personnage' : 'tuile'}, avec le même dessin que ${dessin.nom}`, async () => {
        const d = dessinChoisi() ?? dessin
        const pris = new Set(dessins().map((x) => x.nom))
        let k = 2
        while (pris.has(d.nom + k)) k++
        const nom = demanderUnNom ? await demanderUnNom({ quoi: 'la copie de ' + d.nom, propose: d.nom + k, pris }) : d.nom + k
        if (!nom) return
        ecrireSource(ajouterDessin(lireSource(), nom, d.cote, d.rangees))
        choisi = nom
        barre?.dire(`${nom} : une copie de ${d.nom}. Tu peux la modifier sans toucher à l’original.`, 'info')
        surChangement()
        rafraichirBande()
        rafraichirGrille()
      }),
      /* Tout effacer : le dessin redevient vide — le n° 0 partout, le fond ou
         le transparent. Il revient avec ↶ : l'historique garde le programme. */
      bouton(dessin.cote === 16 ? '🗑 Effacer le personnage' : '🗑 Effacer la tuile',
        `vide tout le dessin de ${dessin.nom} — ↶ (Ctrl+Z) le fait revenir`, () => {
          if (!confirm(`Effacer tout le dessin de « ${dessin.nom} » (${dessin.cote} × ${dessin.cote}) ?\n\n↶ (Ctrl+Z) le fera revenir si tu changes d’avis.`)) return
          const actuel = dessinChoisi()
          if (!actuel) return
          const signes = signesDe(actuel.rangees)
          ecrireSource(remplacerDessin(lireSource(), actuel,
            Array.from({ length: actuel.cote }, () => signes[0].repeat(actuel.cote))))
          surChangement()
          rafraichirBande()
          rafraichirGrille()
        }),
    )

    const cote = document.createElement('div')
    cote.className = 'cote'

    const vraieTaille = document.createElement('canvas')
    vraieTaille.width = dessin.cote
    vraieTaille.height = dessin.cote
    vraieTaille.className = 'reel'
    vraieTaille.style.width = dessin.cote + 'px'
    vraieTaille.style.height = dessin.cote + 'px'
    peindre(vraieTaille, dessin.rangees, dessin.cote, peintureDe(dessin))
    apercus.push(vraieTaille)

    const legende = document.createElement('span')
    legende.className = 'aide'
    legende.textContent = `taille réelle — ${dessin.cote} × ${dessin.cote} pixels`

    cote.append(vraieTaille, legende)

    /* 🏷 Les étiquettes du dessin : des mots pour le retrouver (« décor mur »). */
    const etiquettes = document.createElement('label')
    etiquettes.className = 'aide tuile-etiquettes'
    const champEtiquettes = document.createElement('input')
    champEtiquettes.value = lireEtiquettes(lireSource(), dessin.nom).filter((t) => t !== '★').join(' ')
    champEtiquettes.placeholder = 'décor mur…'
    champEtiquettes.title = 'des mots séparés par des espaces — la recherche de la bande les trouve'
    champEtiquettes.addEventListener('change', () => {
      const favori = lireEtiquettes(lireSource(), dessin.nom).includes('★')
      ecrireSource(ecrireEtiquettes(lireSource(), dessin.nom, [...champEtiquettes.value.split(/[\s,]+/), ...(favori ? ['★'] : [])]))
      surChangement()
      rafraichirBande()
    })
    etiquettes.append(document.createTextNode('🏷 étiquettes '), champEtiquettes)
    cote.append(etiquettes)

    /*
     * 🎞 L'animation d'une tuile : ses images, dans l'ordre (la frise), leur
     * vitesse, un aperçu qui tourne — et la pelure d'oignon : l'image d'avant,
     * en transparence sous celle qu'on dessine, pour que le mouvement suive.
     */
    clearInterval(minuteurApercu)
    minuteurApercu = null
    if (dessin.cote === 8 && !vueLutins) cote.append(panneauDAnimation(dessin, vraieTaille, cadreToile, canevas), panneauDePolice(dessin))
    else {
      /* Un personnage ne s'anime pas ici : il bouge dans la scène. On dit où. */
      const boite = document.createElement('div')
      boite.className = 'tuile-animation'
      const titre = document.createElement('b')
      titre.textContent = '🎞 Animation'
      const dit = document.createElement('p')
      dit.className = 'aide'
      dit.textContent = `Un personnage s’anime dans 🗺 La carte : 🧍 Le joueur (la marche, et ses états — attente, course, attaque, blessure…) ou 👾 Les acteurs (« alterne avec »). Fais-lui d’abord ses images : « ⧉ Dupliquer » ${dessin.nom}, puis change la copie. Ici, ce sont les tuiles de 8 × 8 qui s’animent (l’eau, le feu, l’herbe).`
      boite.append(titre, dit)
      cote.append(boite)
    }

    grille.append(barre, titre, outils, rangeeOutils, rangeeActions, cadreToile, cote)
  }

  rafraichirBande()
  rafraichirGrille()

  return {
    rafraichir() {
      /* Le texte a pu changer sous nos pieds — un autre exemple chargé, une
         retouche à la main. Une tuile disparue ne reste pas sélectionnée. */
      if (choisi && !dessinChoisi()) choisi = null
      rafraichirBande()
      rafraichirGrille()
    },
  }
}

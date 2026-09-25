/**
 * Les scènes jouables : une carte, ses murs, un joueur, des acteurs, des
 * événements — et le jeu qui passe de l'une à l'autre.
 *
 * C'est « créer → placer → jouer » sans écrire une ligne : on peint, on pose,
 * on règle des phrases (QUAND … ALORS …), et l'atelier écrit le C++ qui va
 * avec. Ce C++ reste DANS le programme, lisible et modifiable : la scène
 * n'est pas une boîte noire, c'est du code qu'on n'a pas eu à taper — et
 * qu'on peut ouvrir pour apprendre comment ça marche.
 *
 * Pour une carte nommée FOND, le programme reçoit un bloc « scène "FOND" » :
 *
 *   FOND_MURS_HAUT, FOND_MURS_BAS   les murs, case par case (1 = on ne passe pas)
 *   FOND_mur(), FOND_libre()        les questions que pose tout le reste
 *   FOND_joueurX, FOND_joueurY      où est le joueur, en pixels
 *   FOND_entrer(x, y)               dessiner la scène et y poser le joueur
 *   FOND_joueur()                   les flèches le déplacent, les murs l'arrêtent
 *   FOND_acteurs()                  les PNJ et les ennemis : ils bougent, on les touche
 *   FOND_evenements()               QUAND le joueur … ALORS …
 *
 * et un seul bloc « le jeu », en tête du programme, que toutes les scènes
 * partagent : les VARIABLES du jeu (JEU_SCORE, JEU_CLE…), le passage d'une
 * scène à l'autre, et l'attente du bouton A des dialogues.
 *
 * Les listes réglées à la souris — événements, acteurs — sont rangées sur une
 * ligne de commentaire dans chaque bloc (« // evenements = […] ») : c'est
 * elle que l'atelier relit ; le C++ en est la traduction.
 */

const SAUT = String.fromCharCode(10)

export const COLONNES = 20
export const LIGNES = 18

const debutScene = (nom) => `/* --- scène "${nom}" --- */`
const finScene = (nom) => `/* --- fin de la scène "${nom}" --- */`
const DEBUT_JEU = '  /* --- le jeu de la scène --- */'
const FIN_JEU = '  /* --- fin du jeu de la scène --- */'
const DEBUT_COMMUN = '/* --- le jeu : variables et scènes --- */'
const FIN_COMMUN = '/* --- fin du jeu : variables et scènes --- */'

/** Des murs vides : une case à 0 par case de la carte (un écran : 20 × 18). */
export const mursVides = (colonnes = COLONNES, lignes = LIGNES) => Array.from({ length: lignes }, () => Array(colonnes).fill(0))

/**
 * La taille de la carte d'une scène, en cases — lue sur la ligne « // taille = C x L »
 * de sa fonction (voir editeur-carte.js). Sans elle : un écran, 20 × 18.
 */
export function tailleDeLaCarte(source, nom) {
  const i = source.indexOf(`/* --- carte "${nom}" --- */`)
  if (i < 0) return { colonnes: COLONNES, lignes: LIGNES }
  const j = source.indexOf(`/* --- fin de la carte "${nom}" --- */`, i)
  const m = source.slice(i, j >= 0 ? j : undefined).match(/\/\/ taille = (\d+) x (\d+)/)
  return m
    ? { colonnes: Math.max(COLONNES, Math.min(32, Number(m[1]))), lignes: Math.max(LIGNES, Math.min(32, Number(m[2]))) }
    : { colonnes: COLONNES, lignes: LIGNES }
}

/** Les murs ramenés à une taille : ce qui manque est libre, ce qui dépasse s'en va. */
const aLaTaille = (murs, colonnes, lignes) =>
  Array.from({ length: lignes }, (_, l) => Array.from({ length: colonnes }, (_, c) => (murs?.[l]?.[c] ? 1 : 0)))

/** Combien de lignes de murs tiennent dans un tableau de 256 cases au plus. */
const lignesParTable = (colonnes) => Math.floor(256 / colonnes)

/* ---------------------------------------------------------------- lecture */

const MOTIF_SCENES = /\/\* --- scène "([A-Za-z_]\w*)" --- \*\//g

/** Les noms de toutes les scènes du programme. */
export function listerLesScenes(source) {
  return [...source.matchAll(MOTIF_SCENES)].map((m) => m[1])
}

function blocDeLaScene(source, nom) {
  const i = source.indexOf(debutScene(nom))
  if (i < 0) return null
  const j = source.indexOf(finScene(nom), i)
  return j >= 0 ? source.slice(i, j) : source.slice(i)
}

const lireListe = (bloc, cle) => {
  const m = bloc.match(new RegExp(`// ${cle} = (\\[.*\\])`))
  if (!m) return []
  try { return JSON.parse(m[1]) } catch { return [] }
}

/**
 * Ce que le programme dit déjà de la scène de cette carte — ou null.
 *
 * { murs, x, y, dessin, evenements, acteurs }
 */
export function lireScene(source, nom) {
  if (!nom) return null
  const bloc = blocDeLaScene(source, nom)
  if (bloc === null) return null

  const { colonnes, lignes } = tailleDeLaCarte(source, nom)
  const murs = mursVides(colonnes, lignes)
  /* Toutes les tables de murs, dans l'ordre où elles sont écrites : leurs rangées se suivent. */
  let ligneCourante = 0
  for (const table of bloc.matchAll(new RegExp(`${nom}_MURS_\\w+\\s*\\[\\s*\\d+\\s*\\]\\s*\\[\\s*\\d+\\s*\\]\\s*=\\s*\\{([\\s\\S]*?)\\};`, 'g'))) {
    for (const rangee of table[1].matchAll(/\{([^{}]*)\}/g)) {
      if (ligneCourante >= lignes) break
      rangee[1].split(',').slice(0, colonnes).forEach((v, c) => { murs[ligneCourante][c] = Number(v.trim()) ? 1 : 0 })
      ligneCourante++
    }
  }

  const nombre = (motif, defaut) => {
    const m = bloc.match(motif)
    return m ? Number(m[1]) : defaut
  }
  const dessin = bloc.match(/sprite(?:16)?\s*\(\s*0\s*,[^,]+,[^,]+,\s*([A-Za-z_]\w*)\s*[,)]/)
  let joueur = {}
  try { joueur = JSON.parse(bloc.match(/\/\/ joueur = (\{.*\})/)?.[1] ?? '{}') } catch { joueur = {} }
  let musique = null
  try { musique = JSON.parse(bloc.match(/\/\/ musique = (\{.*\}|null)/)?.[1] ?? 'null') } catch { musique = null }

  return {
    animation: joueur.images ? { images: joueur.images, vitesse: joueur.vitesse } : null,
    retourner: Boolean(joueur.retourner),
    etats: joueur.etats ?? {},
    touches: joueur.touches ?? null,
    marge: joueur.marge ?? 0,
    portee: joueur.portee ?? 12,
    genre: joueur.genre === 'plateforme' ? 'plateforme' : 'dessus',
    saut: joueur.saut ?? 22,
    musique,
    murs,
    evenements: lireListe(bloc, 'evenements'),
    acteurs: lireListe(bloc, 'acteurs'),
    x: nombre(new RegExp(`const uint8_t\\s+${nom}_DEPART_X\\s*=\\s*(\\d+)`), null) ?? nombre(new RegExp(`uint8_t\\s+${nom}_joueurX\\s*=\\s*(\\d+)`), 72),
    y: nombre(new RegExp(`const uint8_t\\s+${nom}_DEPART_Y\\s*=\\s*(\\d+)`), null) ?? nombre(new RegExp(`uint8_t\\s+${nom}_joueurY\\s*=\\s*(\\d+)`), 64),
    dessin: joueur.images?.[0] ?? (dessin ? dessin[1] : null),
  }
}

/** La taille d'un dessin du programme : 16 pour un Perso, 8 pour une Tuile. */
function coteDuDessin(source, nom) {
  if (!nom) return 16
  if (new RegExp(`\\bPerso\\s+${nom}\\b`).test(source)) return 16
  if (new RegExp(`\\bTuile\\s+${nom}\\b`).test(source)) return 8
  return 16
}

/* ------------------------------------------------------------ les actions */

/*
 * Les actions : ce qu'un événement ou un acteur FAIT.
 *
 * Chacune devient quelques lignes de C++, dans « lignesDAction ». Les noms
 * ci-dessous sont ceux que la page montre dans ses listes.
 */
export const ACTIONS = {
  message: 'afficher un message',
  dialogue: 'ouvrir un dialogue (attend A)',
  choix: 'poser une question (A oui, B non)',
  menu: 'un menu : plusieurs réponses, au curseur',
  objetPrendre: 'donner un objet au joueur',
  objetPerdre: 'retirer un objet au joueur',
  score: 'ajouter des points',
  variable: 'changer une variable',
  afficherVariable: 'montrer une variable',
  bruitage: 'jouer un bruitage',
  son: 'jouer un bip',
  bruit: 'jouer un bruit',
  aller: 'envoyer le joueur sur une case',
  scene: 'aller dans une autre scène',
  recommencer: 'recommencer la scène',
  perdreVie: 'perdre une vie',
  gagnerVie: 'gagner une vie',
  victoire: 'gagner la partie',
  animationJoueur: 'jouer l’animation personnalisée du joueur',
  effacer: 'effacer le dessin de cette case',
}

/*
 * Les bruitages : des sons de jeu tout prêts. Chacun est UNE note ou UN bruit,
 * choisis pour se reconnaître — la console n'a pas de glissando à offrir sans
 * toucher à ses registres. Ils passent par la voix 2 et la voix du bruit : la
 * voix 1 reste à la musique de la scène.
 */
export const BRUITAGES = {
  saut: ['un saut', '    note(2, DO5, 10, 12);'],
  piece: ['une pièce', '    note(2, MI6, 14, 12);'],
  tir: ['un tir', '    note(2, SOL5, 6, 10);'],
  porte: ['une porte', '    note(2, SOL3, 24, 12);'],
  menu: ['un menu', '    note(2, LA5, 4, 8);'],
  degats: ['des dégâts', '    bruit(20, 14, 2);'],
  explosion: ['une explosion', '    bruit(60, 15, 6);'],
}
/** Ce qu'un acteur fait en plus : disparaître (un ennemi vaincu, un objet ramassé). */
export const ACTIONS_ACTEUR = { ...ACTIONS, disparaitre: 'faire disparaître cet acteur' }
delete ACTIONS_ACTEUR.effacer

/** Un texte que la police de la console sait écrire : A–Z, 0–9, ! ? . - : # | et l'espace. */
export function messageLisible(texte, longueur = 13) {
  return String(texte ?? '').toUpperCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^A-Z0-9!?.\-:#| ]/g, ' ')
    .slice(0, longueur)
}

/** Un nom de variable : des lettres, des chiffres, « _ » — en majuscules. */
export function nomDeVariable(brut) {
  const propre = String(brut ?? '').toUpperCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^A-Z0-9_]/g, '_').replace(/^[0-9_]+/, '').slice(0, 16)
  return propre || 'VARIABLE'
}

const borne = (v, min, max) => Math.max(min, Math.min(max, Number(v) || 0))

/**
 * Les lignes de C++ d'une action.
 *
 * `ici` dit où l'on est : { nom (la scène), demi (la moitié du joueur),
 * evenement (sa case), acteur (son numéro et son lutin) }.
 */
function lignesDAction(action, ici) {
  const { nom, demi } = ici
  const message = (texte, valeur) => [
    '    textePanneau(0, 0, "                    ");   // la ligne entière : le HUD ne doit pas dépasser',
    `    textePanneau(1, 0, "${messageLisible(texte).padEnd(13, ' ')}");`,
    ...(valeur ? [`    nombrePanneau(15, 0, ${valeur});`] : []),
    '    panneau(0, 136);                  // sur la dernière ligne de l\'écran',
    `    ${nom}_message = 120;             // deux secondes, puis il s'efface`,
  ]

  switch (action.type) {
    case 'message':
      return message(action.texte)
    case 'dialogue': {
      /*
       * Un dialogue : trois lignes, et « A » pour continuer. Avec un NOM, il
       * s'écrit sur la première ligne ; avec un PORTRAIT (un dessin de 16 × 16),
       * le visage se pose à gauche, et le texte se décale pour lui laisser la place.
       */
      const qui = messageLisible(action.qui ?? '', 18).trim()
      const portrait = action.portrait && /^[A-Za-z_]\w*$/.test(action.portrait) ? action.portrait : null
      const col = portrait ? 4 : 1
      const large = portrait ? 15 : 18
      const lignes = [0, 1, 2].map((i) => messageLisible(action.lignes?.[i] ?? '', large).padEnd(large, ' '))
      const haut = qui ? 1 : 0
      const rangees = 4 + haut
      const y = 144 - rangees * 8
      return [
        '    effacerPanneau();',
        ...(qui ? [`    textePanneau(${col}, 0, "${qui}:");`] : []),
        ...lignes.map((l, i) => `    textePanneau(${col}, ${i + haut}, "${l}");`),
        `    textePanneau(16, ${3 + haut}, "A |");`,
        `    panneau(0, ${y});                  // ${rangees} lignes en bas de l'écran`,
        ...(portrait
          ? [
            `    sprite16(36, 8, ${y + 8}, ${portrait});   // le portrait de celui qui parle`,
            ...(ici.couleur ? [`    ${teindreLePerso(portrait, 36, false)}`] : []),
          ]
          : []),
        '    JEU_attendreA();                  // le jeu s\'arrête jusqu\'à ce qu\'on appuie sur A',
        ...(portrait ? ['    cacher16(36);'] : []),
        '    effacerPanneau();',
        '    JEU_finDuMessage();               // le HUD revient (ou le panneau se cache)',
        `    ${nom}_message = 0;`,
      ]
    }
    case 'menu': {
      /*
       * Un menu : une question, et jusqu'à quatre réponses. HAUT et BAS
       * déplacent le curseur « > », A choisit : la variable reçoit le numéro
       * de la réponse (1, 2, 3 ou 4). Les événements le lisent : « SI CHOIX == 2 ».
       */
      const options = (action.options ?? []).map((o) => messageLisible(o, 16).trim()).filter(Boolean).slice(0, 4)
      if (!options.length) options.push('OUI', 'NON')
      const question = messageLisible(action.lignes?.[0] ?? '', 18).trim()
      const v = `JEU_${nomDeVariable(action.nom || 'CHOIX')}`
      const rangees = options.length + 1
      return [
        '    effacerPanneau();',
        `    textePanneau(1, 0, "${question.padEnd(18, ' ')}");`,
        ...options.map((o, i) => `    textePanneau(3, ${i + 1}, "${o}");`),
        `    panneau(0, ${144 - rangees * 8});`,
        `    ${v} = JEU_menu(${options.length});   // 1 à ${options.length} : la réponse choisie`,
        '    effacerPanneau();',
        '    JEU_finDuMessage();',
        `    ${nom}_message = 0;`,
      ]
    }
    case 'choix': {
      /*
       * Une question : deux lignes, puis « A OUI   B NON ». Le jeu attend l'un
       * des deux, et range la réponse — 1 pour oui, 0 pour non — dans une
       * variable. Les événements la lisent ensuite comme n'importe quelle
       * autre : « SI REPONSE == 1 ».
       */
      const lignes = [0, 1].map((i) => messageLisible(action.lignes?.[i] ?? '', 18).padEnd(18, ' '))
      const v = `JEU_${nomDeVariable(action.nom || 'REPONSE')}`
      return [
        ...lignes.map((l, i) => `    textePanneau(1, ${i}, "${l}");`),
        '    textePanneau(1, 2, "                  ");',
        '    textePanneau(1, 3, "A OUI       B NON ");',
        '    panneau(0, 112);                  // quatre lignes en bas de l\'écran',
        `    ${v} = JEU_choisir();             // 1 : A (oui) — 0 : B (non)`,
        '    JEU_finDuMessage();',
        `    ${nom}_message = 0;`,
      ]
    }
    case 'objetPrendre':
    case 'objetPerdre': {
      /* Un objet de l'inventaire : une variable « OBJ_… » à 1 quand on le porte. START les montre. */
      const objet = nomDeVariable(action.nom || 'CLE')
      const prend = action.type === 'objetPrendre'
      return [`    JEU_OBJ_${objet} = ${prend ? 1 : 0};`, ...message(prend ? `+ ${objet}` : `- ${objet}`)]
    }
    case 'score':
      return [`    JEU_SCORE = JEU_SCORE + ${borne(action.valeur || 1, 1, 255)};`, ...message('SCORE', 'JEU_SCORE')]
    case 'variable': {
      const v = `JEU_${nomDeVariable(action.nom)}`
      const n = borne(action.valeur, 0, 255)
      if (action.op === '+') return [`    ${v} = ${v} + ${n};`]
      if (action.op === '-') return [`    if (${v} >= ${n}) ${v} = ${v} - ${n};`, `    else ${v} = 0;                  // jamais sous zéro : un octet repartirait de 255`]
      return [`    ${v} = ${n};`]
    }
    case 'afficherVariable':
      return message(nomDeVariable(action.nom), `JEU_${nomDeVariable(action.nom)}`)
    case 'bruitage': {
      const [nomDuSon, ligne] = BRUITAGES[action.son] ?? BRUITAGES.piece
      return [`${ligne}   // le bruitage : ${nomDuSon}`]
    }
    case 'perdreVie':
      return [
        '    if (JEU_VIES > 0) JEU_VIES--;',
        ...message('VIES', 'JEU_VIES'),
        '    if (JEU_VIES == 0) {',
        `      ${nom}_mourir();                 // l'animation de la mort (s'il en a une)`,
        '      JEU_perdre();                   // plus de vies : c\'est perdu',
        '      return;',
        '    }',
        `    ${nom}_blesser();                  // blessé : il clignote, ou repart du début de la scène`,
        '    return;',
      ]
    case 'gagnerVie':
      return ['    if (JEU_VIES < 99) JEU_VIES++;', ...message('VIES', 'JEU_VIES')]
    case 'victoire':
      return [`    ${nom}_feter();                    // l'animation de la victoire (s'il en a une)`, '    JEU_victoire();                   // l\'écran « BRAVO », puis la partie recommence', '    return;']
    case 'animationJoueur':
      return [`    ${nom}_special = 90;               // l'animation personnalisée du joueur, une seconde et demie`]
    case 'son':
      return ['    note(2, DO5, 20, 12);             // un bip, un cinquième de seconde']
    case 'bruit':
      return ['    bruit(24, 12);                    // un bruit bref']
    case 'aller': {
      const c = borne(action.c, 0, 31)
      const l = borne(action.l, 0, 31)
      /* Le MILIEU du joueur sur la case visée — c'est lui qui déclenche les événements. */
      return [`    ${nom}_joueurX = ${Math.max(0, c * 8 + 4 - demi)};  ${nom}_joueurY = ${Math.max(0, l * 8 + 4 - demi)};   // son milieu sur la case (${c}, ${l})`]
    }
    case 'scene': {
      if (!action.carte) return ['    // (aller dans une autre scène : aucune scène choisie)']
      const c = borne(action.c, 0, 31)
      const l = borne(action.l, 0, 31)
      return [
        `    ${action.carte}_entrer(${Math.max(0, c * 8 + 4 - demi)}, ${Math.max(0, l * 8 + 4 - demi)});   // la scène ${action.carte}, case (${c}, ${l})`,
        '    return;                           // cette scène-ci s\'arrête là',
      ]
    }
    case 'recommencer':
      return [`    ${nom}_entrer(${nom}_DEPART_X, ${nom}_DEPART_Y);`, '    return;']
    case 'effacer':
      return ici.evenement ? [`    poser(${ici.evenement.c}, ${ici.evenement.l}, 0);             // la case redevient vide`] : []
    case 'disparaitre': {
      if (!ici.acteur) return []
      const { i, lutin, cote, unique } = ici.acteur
      return [
        `    ${nom}_acteurVu[${i}] = 0;`,
        ...(unique ? [`    ${nom}_acteurFini[${i}] = 1;       // « une seule fois » : il ne reviendra pas`] : []),
        `    ${cote === 16 ? 'cacher16' : 'cacher'}(${lutin});`,
      ]
    }
    default:
      return []
  }
}

/** La condition « SI » d'un événement ou d'un acteur, en C++ — ou rien. */
function conditionSi(si) {
  if (!si || !si.nom) return ''
  const comparaisons = { '==': '==', '!=': '!=', '>=': '>=', '<': '<' }
  return ` && JEU_${nomDeVariable(si.nom)} ${comparaisons[si.comp] ?? '=='} ${borne(si.valeur, 0, 255)}`
}

const phraseSi = (si) => (si?.nom ? `, SI ${nomDeVariable(si.nom)} ${si.comp ?? '=='} ${borne(si.valeur, 0, 255)}` : '')

/** Les variables qu'une liste d'événements et d'acteurs emploie. */
function variablesEmployees(scene) {
  const noms = new Set()
  for (const chose of [...(scene.evenements ?? []), ...(scene.acteurs ?? [])]) {
    if (chose.si?.nom) noms.add(nomDeVariable(chose.si.nom))
    for (const a of [...(chose.actions ?? []), ...(chose.attaque?.actions ?? [])]) {
      if (a.type === 'score') noms.add('SCORE')
      if (a.type === 'perdreVie' || a.type === 'gagnerVie') noms.add('VIES')
      if (a.type === 'variable' || a.type === 'afficherVariable') noms.add(nomDeVariable(a.nom))
      if (a.type === 'choix') noms.add(nomDeVariable(a.nom || 'REPONSE'))
      if (a.type === 'menu') noms.add(nomDeVariable(a.nom || 'CHOIX'))
      if (a.type === 'objetPrendre' || a.type === 'objetPerdre') noms.add('OBJ_' + nomDeVariable(a.nom || 'CLE'))
    }
  }
  return noms
}

/* ------------------------------------------------------------ les acteurs */

/*
 * Un acteur : { x, y, dessin, mouvement, quand, unique, si, actions }
 *
 *   mouvement   'immobile', 'horizontal' (va-et-vient), 'vertical', 'suivre'
 *   quand       'touche' — le joueur le touche ; 'bouton' — le touche et appuie sur A
 *
 * Chaque acteur a son lutin (ou ses quatre, pour un dessin de seize), à
 * partir du numéro 4 : les quatre premiers sont au joueur.
 */
const MOUVEMENTS = {
  immobile: 'immobile',
  horizontal: 'va et vient (gauche–droite)',
  vertical: 'va et vient (haut–bas)',
  suivre: 'suit le joueur',
}
export { MOUVEMENTS }

function construireActeurs(nom, acteurs, source, coteJoueur, couleur, monde = { W: 160, H: 144, camera: false }) {
  let lutin = 4
  const places = []
  for (const a of acteurs) {
    const cote = coteDuDessin(source, a.dessin)
    const besoin = cote === 16 ? 4 : 1
    if (lutin + besoin > 36) break // quarante lutins ; les quatre derniers sont au portrait des dialogues
    places.push({ ...a, cote, lutin })
    lutin += besoin
  }
  const n = Math.max(1, places.length)

  const lignes = [
    `/* Les acteurs de ${nom} — PNJ, ennemis, objets —, posés à la souris (onglet La carte, 👾 Acteurs). */`,
    `// acteurs = ${JSON.stringify(acteurs)}`,
    `uint8_t ${nom}_acteurX[${n}];`,
    `uint8_t ${nom}_acteurY[${n}];`,
    `uint8_t ${nom}_acteurSens[${n}];     // 1 : vers la droite (ou le bas), 0 : l'inverse`,
    `uint8_t ${nom}_acteurVu[${n}];       // 1 : l'acteur est là`,
    `uint8_t ${nom}_acteurFini[${n}];     // 1 : parti pour de bon (« une seule fois »)`,
    `uint8_t ${nom}_acteurTouche[${n}];   // le joueur le touchait-il déjà à l'image d'avant ?`,
    `uint8_t ${nom}_acteurFrappe[${n}];   // l'attaque du joueur le touchait-elle déjà ?`,
    '',
    `/* Les acteurs reprennent leur place quand on entre dans ${nom}. */`,
    `void ${nom}_placerLesActeurs() {`,
    ...places.flatMap((a, i) => [
      `  ${nom}_acteurX[${i}] = ${a.x};  ${nom}_acteurY[${i}] = ${a.y};  ${nom}_acteurSens[${i}] = 1;  ${nom}_acteurTouche[${i}] = 0;`,
      `  ${nom}_acteurVu[${i}] = ${a.unique ? `!${nom}_acteurFini[${i}]` : '1'};`,
    ]),
    '}',
    '',
    `void ${nom}_acteurs() {`,
    '  uint8_t bouge = images() % 2 == 0;   // les acteurs avancent une image sur deux',
    `  uint8_t appui = bouton(A) && !${nom}_avantA;`,
  ]

  places.forEach((a, i) => {
    const X = `${nom}_acteurX[${i}]`
    const Y = `${nom}_acteurY[${i}]`
    const S = `${nom}_acteurSens[${i}]`
    const c = a.cote
    lignes.push('', `  /* Acteur ${i + 1} : ${a.dessin}, ${MOUVEMENTS[a.mouvement] ?? 'immobile'} */`)
    lignes.push(`  if (${nom}_acteurVu[${i}]) {`)
    if (a.mouvement === 'horizontal' && monde.plateforme) {
      /* En plateforme, l'acteur fait demi-tour au bord du vide : il faut du sol sous le pas suivant. */
      const sol = (px) => `(${Y} >= ${monde.H - c} || ${nom}_mur((${px}) / 8, (${Y} + ${c}) / 8))`
      lignes.push(
        `    if (bouge && ${S}) { if (${X} < ${monde.W - c} && ${nom}_libre(${X} + 1, ${Y}, ${c}) && ${sol(`${X} + ${c}`)}) ${X}++; else ${S} = 0; }`,
        `    else if (bouge) { if (${X} > 0 && ${nom}_libre(${X} - 1, ${Y}, ${c}) && ${sol(`${X} - 1`)}) ${X}--; else ${S} = 1; }`,
      )
    } else if (a.mouvement === 'horizontal') {
      lignes.push(
        `    if (bouge && ${S}) { if (${X} < ${monde.W - c} && ${nom}_libre(${X} + 1, ${Y}, ${c})) ${X}++; else ${S} = 0; }`,
        `    else if (bouge) { if (${X} > 0 && ${nom}_libre(${X} - 1, ${Y}, ${c})) ${X}--; else ${S} = 1; }`,
      )
    } else if (a.mouvement === 'vertical') {
      lignes.push(
        `    if (bouge && ${S}) { if (${Y} < ${monde.H - c} && ${nom}_libre(${X}, ${Y} + 1, ${c})) ${Y}++; else ${S} = 0; }`,
        `    else if (bouge) { if (${Y} > 0 && ${nom}_libre(${X}, ${Y} - 1, ${c})) ${Y}--; else ${S} = 1; }`,
      )
    } else if (a.mouvement === 'suivre') {
      lignes.push(
        `    if (bouge && ${X} < ${nom}_joueurX && ${nom}_libre(${X} + 1, ${Y}, ${c})) ${X}++;`,
        `    if (bouge && ${X} > ${nom}_joueurX && ${nom}_libre(${X} - 1, ${Y}, ${c})) ${X}--;`,
        `    if (bouge && ${Y} < ${nom}_joueurY && ${nom}_libre(${X}, ${Y} + 1, ${c})) ${Y}++;`,
        `    if (bouge && ${Y} > ${nom}_joueurY && ${nom}_libre(${X}, ${Y} - 1, ${c})) ${Y}--;`,
      )
    }
    const ax = monde.camera ? `${X} - ${nom}_camX` : X
    const ay = monde.camera ? `${Y} - ${nom}_camY` : Y
    const poserActeur = (image) => couleur && c === 16
      ? `{ sprite16(${a.lutin}, ${ax}, ${ay}, ${image}); ${teindreLePerso(image, a.lutin, false)} }`
      : `${c === 16 ? 'sprite16' : 'sprite'}(${a.lutin}, ${ax}, ${ay}, ${image});`
    /* L'animation : jusqu'à trois dessins de même taille, qui alternent sans cesse. */
    const images = [a.dessin, ...(a.images ?? []).filter((d) => d && coteDuDessin(source, d) === c)].slice(0, 3)
    if (images.length === 1) {
      lignes.push(`    ${poserActeur(a.dessin)}`)
    } else {
      const v = borne(a.vitesse ?? 12, 2, 60)
      lignes.push(`    uint8_t image${i} = (images() / ${v}) % ${images.length};   // l'animation : ${images.join(', ')}`)
      images.forEach((image, k) => {
        lignes.push(`    ${k === 0 ? '' : 'else '}${k === images.length - 1 && k > 0 ? '' : `if (image${i} == ${k}) `}${poserActeur(image)}`)
      })
    }
    if (couleur && c !== 16) {
      for (let k = 0; k < 1; k++) lignes.push(`    teindreLutin(${a.lutin + k}, 2);   // la palette « ennemi », après chaque sprite`)
    }
    /*
     * Se touchent-ils ? Deux carrés se chevauchent quand aucun n'est entièrement
     * d'un côté de l'autre. Le carré du joueur est réduit de sa MARGE (sa
     * « hurtbox ») : un ennemi qui frôle son bord ne le blesse pas.
     */
    const mg = borne(monde.marge ?? 0, 0, (coteJoueur >> 1) - 1)
    const jx = mg ? `(${nom}_joueurX + ${mg})` : `${nom}_joueurX`
    const jy = mg ? `(${nom}_joueurY + ${mg})` : `${nom}_joueurY`
    const jc = coteJoueur - 2 * mg
    lignes.push(
      `    uint8_t touche${i} = ${jx} + ${jc} > ${X} && ${X} + ${c} > ${jx}`,
      `        && ${jy} + ${jc} > ${Y} && ${Y} + ${c} > ${jy};`,
    )
    /* Blessé, le joueur est invincible le temps de clignoter : un ennemi qui le blesse attend. */
    const blesse = (a.actions ?? []).some((t) => t.type === 'perdreVie') ? ` && ${nom}_blesse == 0` : ''
    const declencheur = (a.quand === 'bouton' ? `touche${i} && appui` : `touche${i} && !${nom}_acteurTouche[${i}]`) + blesse
    const phrase = a.quand === 'bouton' ? 'le touche et appuie sur A' : 'le touche'
    lignes.push(`    /* QUAND le joueur ${phrase}${phraseSi(a.si)} */`)
    lignes.push(`    if (${declencheur}${conditionSi(a.si)}) {`)
    for (const action of a.actions ?? []) {
      lignes.push(...lignesDAction(action, { nom, demi: coteJoueur >> 1, couleur, acteur: { i, lutin: a.lutin, cote: c, unique: a.unique } }).map((l) => '  ' + l))
    }
    lignes.push('    }')
    /* APRÈS le test : « touchait-il déjà ? » doit parler de l'image d'avant. */
    lignes.push(`    ${nom}_acteurTouche[${i}] = touche${i};`)
    /*
     * QUAND le joueur l'ATTAQUE : le carré de l'attaque (la « hitbox », devant
     * le joueur, le temps du coup) chevauche l'acteur. Un coup ne compte qu'une fois.
     */
    if (a.attaque?.actions?.length) {
      lignes.push(
        `    uint8_t frappe${i} = ${nom}_frappeW > 0 && ${nom}_frappeX + ${nom}_frappeW > ${X} && ${X} + ${c} > ${nom}_frappeX`,
        `        && ${nom}_frappeY + ${nom}_frappeH > ${Y} && ${Y} + ${c} > ${nom}_frappeY;`,
        '    /* QUAND le joueur l\'attaque */',
        `    if (frappe${i} && !${nom}_acteurFrappe[${i}]) {`,
      )
      for (const action of a.attaque.actions) {
        lignes.push(...lignesDAction(action, { nom, demi: coteJoueur >> 1, couleur, acteur: { i, lutin: a.lutin, cote: c, unique: a.unique } }).map((l) => '  ' + l))
      }
      lignes.push('    }', `    ${nom}_acteurFrappe[${i}] = frappe${i};`)
    }
    lignes.push('  }')
  })
  lignes.push('}')
  return lignes
}

/* ------------------------------------------------------------ les événements */

/*
 * Un événement : { c, l, quand, unique, si, actions }
 *   quand    'arrive' — le joueur arrive sur la case ; 'bouton' — il y appuie sur A
 *   unique   vrai : il ne se produit qu'une fois (un coffre, une pièce)
 *   si       { nom, comp, valeur } : seulement si une variable le permet
 */
function construireEvenements(nom, evenements, cote, couleur = false) {
  const demi = cote >> 1
  const lignes = [
    '/* Les événements — QUAND le joueur … ALORS … —, écrits par l\'atelier (onglet La carte, ⚡ Événements).',
    '   La ligne suivante est ce que l\'atelier relit ; le C++ plus bas en est la traduction. */',
    `// evenements = ${JSON.stringify(evenements)}`,
    `uint8_t ${nom}_message = 0;     // les images qui restent avant d'effacer le message`,
    `uint8_t ${nom}_avantC = 255;    // la case d'avant : un événement « arrive » ne se produit qu'en ENTRANT`,
    `uint8_t ${nom}_avantL = 255;`,
    `uint8_t ${nom}_avantA = 0;      // A était-il déjà enfoncé à l'image d'avant ?`,
    `uint8_t ${nom}_fait[${Math.max(1, evenements.length)}];   // 1 : cet événement « une seule fois » a déjà eu lieu`,
    '',
    `void ${nom}_evenements() {`,
    '  /* La case sous le MILIEU du joueur. */',
    `  uint8_t c = (${nom}_joueurX + ${demi}) / 8;`,
    `  uint8_t l = (${nom}_joueurY + ${demi}) / 8;`,
    `  uint8_t entre = c != ${nom}_avantC || l != ${nom}_avantL;`,
    `  uint8_t appui = bouton(A) && !${nom}_avantA;`,
    `  ${nom}_avantC = c;`,
    `  ${nom}_avantL = l;`,
    `  ${nom}_avantA = bouton(A);`,
  ]

  evenements.forEach((e, i) => {
    const declencheur = e.quand === 'bouton' ? 'appui' : 'entre'
    const phrase = e.quand === 'bouton' ? 'est sur la case et appuie sur A' : 'arrive sur la case'
    lignes.push('')
    lignes.push(`  /* ${i + 1}. QUAND le joueur ${phrase} (${e.c}, ${e.l})${e.unique ? ', une seule fois' : ''}${phraseSi(e.si)} */`)
    lignes.push(`  if (${declencheur} && c == ${e.c} && l == ${e.l}${e.unique ? ` && !${nom}_fait[${i}]` : ''}${conditionSi(e.si)}) {`)
    if (e.unique) lignes.push(`    ${nom}_fait[${i}] = 1;`)
    for (const action of e.actions ?? []) lignes.push(...lignesDAction(action, { nom, demi, couleur, evenement: e }))
    lignes.push('  }')
  })

  lignes.push(
    '',
    '  /* Le message s\'efface tout seul. */',
    `  if (${nom}_message > 0) {`,
    `    ${nom}_message--;`,
    `    if (${nom}_message == 0) JEU_finDuMessage();`,
    '  }',
    '}',
  )
  return lignes
}

/* ---------------------------------------------------------------- le joueur */

/*
 * Les ÉTATS du joueur : chacun a ses dessins (jusqu'à trois, qui alternent).
 * Un état sans dessin reprend ceux de la marche — rien n'est obligatoire.
 */
export const ETATS_DU_JOUEUR = {
  attente: { nom: 'attente', dit: 'immobile : il respire, cligne des yeux…' },
  course: { nom: 'course', dit: 'quand il court (la touche de course enfoncée) : il va deux fois plus vite' },
  attaque: { nom: 'attaque', dit: 'le temps du coup — son carré d’attaque touche les acteurs devant lui' },
  blessure: { nom: 'blessure', dit: 'quand il perd une vie : il clignote, invincible, au lieu de repartir du début' },
  mort: { nom: 'mort', dit: 'quand il perd sa dernière vie, avant « PERDU »' },
  victoire: { nom: 'victoire', dit: 'quand il gagne la partie, avant « BRAVO »' },
  haut: { nom: 'de dos', dit: 'vu de dessus : quand il monte' },
  bas: { nom: 'de face', dit: 'vu de dessus : quand il descend' },
  perso: { nom: 'personnalisée', dit: 'jouée par l’action « jouer l’animation personnalisée du joueur »' },
}

/*
 * Le joueur : les flèches le déplacent, les murs l'arrêtent — et il s'anime.
 *
 *   animation   { images: ['HEROS', 'HEROS2', …], vitesse }  jusqu'à trois
 *               dessins qui alternent tant qu'il marche ; immobile, le premier
 *   retourner   vrai : il regarde à gauche quand il va à gauche (MIROIR_X)
 *   etats       { attente: { images, vitesse }, course, attaque, … } — voir ETATS_DU_JOUEUR
 *   touches     { attaque: 'A' | 'B' | '', course: 'A' | 'B' | '' }
 *   marge       la « hurtbox » : de combien de pixels son carré est réduit, pour les coups
 *   portee      la « hitbox » de l'attaque : sa taille, devant lui, en pixels
 *
 * Ces réglages sont rangés sur la ligne « // joueur = {…} », que l'atelier relit.
 */
function lignesDuJoueur(nom, scene, poser, monde = { W: 160, H: 144, camera: false }) {
  const { cote = 16, couleur = false, dessin } = scene
  const images = (scene.animation?.images ?? []).filter(Boolean).slice(0, 3)
  if (!images.length) images.push(dessin)
  images[0] = dessin
  const vitesse = borne(scene.animation?.vitesse ?? 8, 2, 30)
  const retourner = Boolean(scene.retourner)
  const plateforme = scene.genre === 'plateforme'
  const hauteurSaut = borne(scene.saut ?? 22, 6, 40)
  const etats = {}
  for (const [cle, etat] of Object.entries(scene.etats ?? {})) {
    const liste = (etat?.images ?? []).filter(Boolean).slice(0, 3)
    if (liste.length) etats[cle] = { images: liste, vitesse: borne(etat.vitesse ?? 8, 2, 30) }
  }
  if (plateforme) { delete etats.haut; delete etats.bas }
  const parDefaut = plateforme ? { attaque: 'B', course: '' } : { attaque: 'A', course: 'B' }
  const touches = { ...parDefaut, ...(scene.touches ?? {}) }
  for (const k of ['attaque', 'course']) if (!['A', 'B', ''].includes(touches[k])) touches[k] = parDefaut[k]
  /* En plateforme, A saute : il ne peut pas servir aussi à autre chose. */
  if (plateforme) for (const k of ['attaque', 'course']) if (touches[k] === 'A') touches[k] = ''
  if (touches.course && touches.course === touches.attaque) touches.course = ''
  const marge = borne(scene.marge ?? 0, 0, (cote >> 1) - 1)
  const portee = borne(scene.portee ?? 12, 4, 24)
  const DUREE_ATTAQUE = 16

  const teindre = couleur
    ? (cote === 16 ? [0, 1, 2, 3] : [0]).map((n) => `teindreLutin(${n}, 1);`).join(' ')
    : ''
  const ex = monde.camera ? `${nom}_joueurX - ${nom}_camX` : `${nom}_joueurX`
  const ey = monde.camera ? `${nom}_joueurY - ${nom}_camY` : `${nom}_joueurY`
  const parQuart = couleur && cote === 16
  const teint = (image, miroir) => parQuart ? ' ' + teindreLePerso(image, 0, miroir) : ''
  const dessiner = (image, marge_) => retourner
    ? [
      `${marge_}if (${nom}_gauche) { ${poser}(0, ${ex}, ${ey}, ${image}, MIROIR_X);${teint(image, true)} }`,
      `${marge_}else { ${poser}(0, ${ex}, ${ey}, ${image});${teint(image, false)} }`,
    ]
    : [`${marge_}${poser}(0, ${ex}, ${ey}, ${image});${teint(image, false)}`]
  /* Une suite d'images qui tourne au rythme d'un compteur : « compteur / vitesse », modulo leur nombre. */
  /*
   * Avec des états, chaque branche CHOISIT seulement le dessin (et ses quatre
   * palettes, en couleur) ; un seul bloc, à la fin, le pose — retourné ou non.
   * Répéter tout le dessin dans chaque branche doublait la taille du joueur.
   */
  const choisir = (image, m) => [`${m}${nom}_montre = ${image};${parQuart ? [0, 1, 2, 3].map((q) => ` ${nom}_q${q} = ${image}_PALETTES[${q}];`).join('') : ''}`]
  const teintVariable = (miroir) => parQuart ? ' ' + (miroir ? [1, 0, 3, 2] : [0, 1, 2, 3]).map((q, k) => `teindreLutin(${k}, ${nom}_q${q});`).join(' ') : ''
  const poserLeChoix = (m) => retourner
    ? [
      `${m}if (${nom}_gauche) { ${poser}(0, ${ex}, ${ey}, ${nom}_montre, MIROIR_X);${teintVariable(true)} }`,
      `${m}else { ${poser}(0, ${ex}, ${ey}, ${nom}_montre);${teintVariable(false)} }`,
    ]
    : [`${m}${poser}(0, ${ex}, ${ey}, ${nom}_montre);${teintVariable(false)}`]
  let numero = 0
  const enBoucle = (liste, v, compteur, m, faire = choisir) => {
    if (liste.length === 1) return faire(liste[0], m)
    /* Un compteur par suite : deux « k » dans la même fonction se gêneraient. */
    const i = `i${numero++}`
    const out = [`${m}uint8_t ${i} = (${compteur} / ${v}) % ${liste.length};`]
    liste.forEach((image, k) => {
      out.push(`${m}${k === 0 ? '' : 'else '}${k === liste.length - 1 && k > 0 ? '' : `if (${i} == ${k}) `}{`, ...faire(image, m + '  '), `${m}}`)
    })
    return out
  }
  const cacherLeJoueur = cote === 16 ? 'cacher16(0);' : 'cacher(0);'

  const bouton_ = (t) => `bouton(${t})`
  const vite = touches.course ? `${nom}_court` : '0'

  const lignes = [
    `// joueur = ${JSON.stringify({ images, vitesse, retourner, genre: plateforme ? 'plateforme' : 'dessus', saut: hauteurSaut, etats: scene.etats ?? {}, touches: scene.touches ?? null, marge, portee })}`,
    `uint8_t ${nom}_pas = 0;         // le compteur de l'animation`,
    `uint8_t ${nom}_gauche = 0;      // 1 : il regarde vers la gauche`,
    `uint8_t ${nom}_dir = 0;         // où il regarde : 0 en bas, 1 en haut, 2 sur le côté`,
    `uint8_t ${nom}_court = 0;       // 1 : la touche de course est enfoncée`,
    `uint8_t ${nom}_attaque = 0;     // les images qui restent au coup en cours`,
    `uint8_t ${nom}_avantAttaque = 0;`,
    `uint8_t ${nom}_blesse = 0;      // les images d'invincibilité qui restent, après une blessure`,
    `uint8_t ${nom}_special = 0;     // les images qui restent à l'animation personnalisée`,
    `uint8_t ${nom}_montre = 0;      // le dessin choisi pour cette image`,
    ...(parQuart ? [`uint8_t ${nom}_q0 = 1;  uint8_t ${nom}_q1 = 1;  uint8_t ${nom}_q2 = 1;  uint8_t ${nom}_q3 = 1;   // ses quatre palettes`] : []),
    '/* Le carré de l\'attaque (la « hitbox ») : devant le joueur, le temps du coup ; largeur 0 hors du coup. */',
    `uint8_t ${nom}_frappeX = 0;`,
    `uint8_t ${nom}_frappeY = 0;`,
    `uint8_t ${nom}_frappeW = 0;`,
    `uint8_t ${nom}_frappeH = 0;`,
    ...(plateforme
      ? [
        `uint8_t ${nom}_saut = 0;        // les images de montée qui restent : 0, il ne saute pas`,
        `uint8_t ${nom}_avantSaut = 0;   // A était-il déjà enfoncé ? (un appui = un saut)`,
      ]
      : []),
    '',
    '/* Blessé : il clignote, invincible un instant — ou, sans dessin de blessure, repart du début de la scène. */',
    `void ${nom}_blesser() {`,
    ...(etats.blessure ? [`  ${nom}_blesse = 90;`] : [`  ${nom}_entrer(${nom}_DEPART_X, ${nom}_DEPART_Y);`]),
    '}',
    '',
    ...['mort', 'victoire'].flatMap((cle) => {
      const f = cle === 'mort' ? 'mourir' : 'feter'
      if (!etats[cle]) return [`void ${nom}_${f}() {`, '}', '']
      return [
        `/* L'animation ${cle === 'mort' ? 'de la mort' : 'de la victoire'} : une seconde et demie, le jeu arrêté. */`,
        `void ${nom}_${f}() {`,
        '  for (uint8_t t = 0; t < 90; t++) {',
        '    image();',
        ...enBoucle(etats[cle].images, etats[cle].vitesse, 't', '    '),
        ...poserLeChoix('    '),
        '  }',
        '}',
        '',
      ]
    }),
    '/* Le joueur : les flèches le déplacent, les murs l\'arrêtent.',
    '   Chaque direction est essayée À PART : contre un mur, on glisse le long au lieu de coller. */',
    `void ${nom}_joueur() {`,
    '  uint8_t bouge = 0;',
    ...(touches.course ? [`  ${nom}_court = ${bouton_(touches.course)};   // courir : deux pas par image`] : []),
    `  for (uint8_t pas = 0; pas <= ${vite}; pas++) {`,
    `    if (bouton(DROITE) && ${nom}_joueurX < ${monde.W - cote} && ${nom}_libre(${nom}_joueurX + 1, ${nom}_joueurY, ${cote})) { ${nom}_joueurX++; bouge = 1; ${nom}_gauche = 0; ${nom}_dir = 2; }`,
    `    if (bouton(GAUCHE) && ${nom}_joueurX > 0 && ${nom}_libre(${nom}_joueurX - 1, ${nom}_joueurY, ${cote})) { ${nom}_joueurX--; bouge = 1; ${nom}_gauche = 1; ${nom}_dir = 2; }`,
    ...(plateforme ? [] : [
      `    if (bouton(BAS) && ${nom}_joueurY < ${monde.H - cote} && ${nom}_libre(${nom}_joueurX, ${nom}_joueurY + 1, ${cote})) { ${nom}_joueurY++; bouge = 1; ${nom}_dir = 0; }`,
      `    if (bouton(HAUT) && ${nom}_joueurY > 0 && ${nom}_libre(${nom}_joueurX, ${nom}_joueurY - 1, ${cote})) { ${nom}_joueurY--; bouge = 1; ${nom}_dir = 1; }`,
    ]),
    '  }',
    ...(plateforme
      ? [
        '',
        '  /* La pesanteur et le saut. Au sol : la case juste en dessous est un mur (ou le bas de la carte). */',
        `  uint8_t auSol = ${nom}_joueurY >= ${monde.H - cote} || !${nom}_libre(${nom}_joueurX, ${nom}_joueurY + 1, ${cote});`,
        `  if (bouton(A) && !${nom}_avantSaut && auSol) ${nom}_saut = ${hauteurSaut};   // A : on s'élance`,
        `  ${nom}_avantSaut = bouton(A);`,
        `  if (${nom}_saut > 0) {`,
        '    /* La montée : deux pixels par image au début, un seul vers le haut du saut. Un plafond l\'arrête. */',
        `    ${nom}_saut--;`,
        `    if (${nom}_joueurY > 0 && ${nom}_libre(${nom}_joueurX, ${nom}_joueurY - 1, ${cote})) ${nom}_joueurY--; else ${nom}_saut = 0;`,
        `    if (${nom}_saut > ${hauteurSaut >> 1} && ${nom}_joueurY > 0 && ${nom}_libre(${nom}_joueurX, ${nom}_joueurY - 1, ${cote})) ${nom}_joueurY--;`,
        '  } else {',
        '    /* La chute : deux pixels par image, un à la fois, pour ne jamais traverser un sol mince. */',
        `    if (${nom}_joueurY < ${monde.H - cote} && ${nom}_libre(${nom}_joueurX, ${nom}_joueurY + 1, ${cote})) ${nom}_joueurY++;`,
        `    if (${nom}_joueurY < ${monde.H - cote} && ${nom}_libre(${nom}_joueurX, ${nom}_joueurY + 1, ${cote})) ${nom}_joueurY++;`,
        '  }',
      ]
      : []),
    ...(touches.attaque
      ? [
        '',
        `  /* L'attaque : ${touches.attaque}. Un appui = un coup de ${DUREE_ATTAQUE} images ; son carré (${portee} pixels) est devant lui. */`,
        `  if (${bouton_(touches.attaque)} && !${nom}_avantAttaque && ${nom}_attaque == 0) ${nom}_attaque = ${DUREE_ATTAQUE};`,
        `  ${nom}_avantAttaque = ${bouton_(touches.attaque)};`,
        `  ${nom}_frappeW = 0;`,
        `  if (${nom}_attaque > 0) {`,
        `    ${nom}_attaque--;`,
        `    ${nom}_frappeW = ${portee};  ${nom}_frappeH = ${portee};`,
        `    ${nom}_frappeX = ${nom}_joueurX + ${(cote - portee) >> 1};  ${nom}_frappeY = ${nom}_joueurY + ${(cote - portee) >> 1};`,
        `    if (${nom}_dir == 2 && ${nom}_gauche) { if (${nom}_joueurX >= ${portee}) ${nom}_frappeX = ${nom}_joueurX - ${portee}; else ${nom}_frappeX = 0; }`,
        `    else if (${nom}_dir == 2) ${nom}_frappeX = ${nom}_joueurX + ${cote};`,
        ...(plateforme ? [] : [
          `    else if (${nom}_dir == 1) { if (${nom}_joueurY >= ${portee}) ${nom}_frappeY = ${nom}_joueurY - ${portee}; else ${nom}_frappeY = 0; }`,
          `    else ${nom}_frappeY = ${nom}_joueurY + ${cote};`,
        ]),
        '  }',
      ]
      : []),
    `  if (${nom}_blesse > 0) ${nom}_blesse--;`,
    `  if (${nom}_special > 0) ${nom}_special--;`,
  ]

  if (monde.camera) {
    const milieuX = (160 - cote) >> 1
    const milieuY = (144 - cote) >> 1
    lignes.push(
      '',
      '  /* La caméra suit : le joueur reste au milieu, sauf quand un bord de la carte l\'en empêche. */',
      `  if (${nom}_joueurX > ${milieuX}) ${nom}_camX = ${nom}_joueurX - ${milieuX}; else ${nom}_camX = 0;`,
      `  if (${nom}_camX > ${monde.W - 160}) ${nom}_camX = ${monde.W - 160};`,
      `  if (${nom}_joueurY > ${milieuY}) ${nom}_camY = ${nom}_joueurY - ${milieuY}; else ${nom}_camY = 0;`,
      `  if (${nom}_camY > ${monde.H - 144}) ${nom}_camY = ${monde.H - 144};`,
      `  defiler(${nom}_camX, ${nom}_camY);   // le décor glisse ; les lutins suivent en retirant la caméra`,
    )
  }

  /*
   * Quel dessin montrer : du plus urgent au plus calme — l'animation
   * personnalisée, la blessure (qui clignote), l'attaque, la marche (ou la
   * course, de dos, de face), et l'attente.
   */
  lignes.push('', '  /* Le dessin : selon ce qu\'il fait. */')
  if (images.length > 1 || etats.course || etats.haut || etats.bas) {
    lignes.push(
      `  if (bouge) ${nom}_pas++;`,
      `  else ${nom}_pas = 0;`,
      `  if (${nom}_pas >= 240) ${nom}_pas = 0;`,
    )
  }
  const branches = []
  if (etats.perso) branches.push([`${nom}_special > 0`, enBoucle(etats.perso.images, etats.perso.vitesse, 'images()', '    ')])
  if (etats.blessure) {
    branches.push([`${nom}_blesse > 0 && (images() / 4) % 2`, ['    cache = 1;   // il clignote : une image sur deux, invisible']])
    branches.push([`${nom}_blesse > 0`, enBoucle(etats.blessure.images, etats.blessure.vitesse, 'images()', '    ')])
  }
  if (etats.attaque) branches.push([`${nom}_attaque > 0`, enBoucle(etats.attaque.images, 4, `(${DUREE_ATTAQUE} - ${nom}_attaque)`, '    ')])
  if (etats.course) branches.push([`bouge && ${nom}_court`, enBoucle(etats.course.images, etats.course.vitesse, `${nom}_pas`, '    ')])
  if (etats.haut) branches.push([`${nom}_dir == 1`, enBoucle(etats.haut.images, vitesse, `${nom}_pas`, '    ')])
  if (etats.bas) branches.push([`${nom}_dir == 0${etats.attente ? ' && bouge' : ''}`, enBoucle(etats.bas.images, vitesse, `${nom}_pas`, '    ')])
  if (etats.attente) branches.push(['!bouge', enBoucle(etats.attente.images, etats.attente.vitesse, 'images()', '    ')])
  if (!branches.length) {
    /* Sans états : la marche seule, écrite comme avant. */
    const marche = images.length === 1 ? dessiner(images[0], '    ') : enBoucle(images, vitesse, `${nom}_pas`, '    ', dessiner)
    lignes.push(...marche.map((l) => l.slice(2)))
  } else {
    const marche = enBoucle(images, vitesse, `${nom}_pas`, '    ')
    lignes.push('  uint8_t cache = 0;')
    branches.forEach(([test, corps], k) => lignes.push(`  ${k === 0 ? 'if' : 'else if'} (${test}) {`, ...corps, '  }'))
    lignes.push('  else {', ...marche, '  }')
    lignes.push(`  if (cache) ${cacherLeJoueur}`, '  else {', ...poserLeChoix('    '), '  }')
  }
  if (teindre && !parQuart) lignes.push(`  ${teindre}   // la palette « héros », après chaque ${poser}()`)
  lignes.push('}')
  return lignes
}

/* ---------------------------------------------------------------- écriture */

/** Le bloc de la scène, tel qu'il s'écrit dans le programme. */
/*
 * La palette de chaque QUART d'un personnage de seize, sur Game Boy Color.
 *
 * Un « Perso » est fait de quatre lutins de 8 × 8, et chaque lutin prend sa
 * propre palette : trois couleurs et le transparent. Un personnage peut donc
 * porter jusqu'à douze couleurs, trois par quart. Le programme le dit par une
 * table posée juste sous le dessin — l'atelier des tuiles l'écrit, la scène
 * la lit :
 *
 *   const uint8_t HEROS_PALETTES[] = { 1, 1, 3, 3 };
 *
 * dans l'ordre haut-gauche, haut-droite, bas-gauche, bas-droite.
 */
const motifPalettes = (nom) =>
  new RegExp(`^[ \\t]*const\\s+uint8_t\\s+${nom}_PALETTES\\s*\\[\\s*\\d*\\s*\\]\\s*=\\s*\\{\\s*(\\d+)\\s*,\\s*(\\d+)\\s*,\\s*(\\d+)\\s*,\\s*(\\d+)\\s*\\}\\s*;.*$`, 'm')

/** Les quatre palettes d'un personnage, ou null s'il n'a pas encore sa table. */
export function lirePalettesDuPerso(source, nom) {
  const coup = source.match(motifPalettes(nom))
  return coup ? coup.slice(1, 5).map((n) => Math.min(7, Number(n))) : null
}

/** Écrit (ou réécrit) la table des palettes d'un personnage, juste sous son dessin. */
export function ecrirePalettesDuPerso(source, nom, quatre) {
  const ligne = `const uint8_t ${nom}_PALETTES[] = { ${quatre.join(', ')} };   // la palette de chaque quart : haut-gauche, haut-droite, bas-gauche, bas-droite`
  const motif = motifPalettes(nom)
  if (motif.test(source)) return source.replace(motif, () => ligne)
  const debut = source.search(new RegExp(`\\bPerso\\s+${nom}\\s*=\\s*\\{`))
  if (debut < 0) return source
  const fin = source.indexOf('};', debut)
  if (fin < 0) return source
  return source.slice(0, fin + 2) + SAUT + ligne + source.slice(fin + 2)
}

/*
 * Colorer un personnage de seize posé par « sprite16(premier, …) ».
 *
 * Retourné (MIROIR_X), le lutin de gauche montre le quart de DROITE : la
 * palette suit le quart, pas le lutin.
 */
function teindreLePerso(image, premier, miroir) {
  const quarts = miroir ? [1, 0, 3, 2] : [0, 1, 2, 3]
  return quarts.map((q, k) => `teindreLutin(${premier + k}, ${image}_PALETTES[${q}]);`).join(' ')
}

/** Chaque personnage de la scène reçoit sa table, s'il ne l'a pas : le héros la 1, les autres la 2. */
function donnerLeursPalettes(source, scene) {
  if (!scene.couleur) return source
  const heros = [scene.dessin, ...(scene.animation?.images ?? []), ...Object.values(scene.etats ?? {}).flatMap((e) => e?.images ?? [])].filter(Boolean)
  const autres = (scene.acteurs ?? []).flatMap((a) => [a.dessin, ...(a.images ?? [])]).filter(Boolean)
  for (const [noms, palette] of [[heros, 1], [autres, 2]]) {
    for (const nom of noms) {
      if (coteDuDessin(source, nom) !== 16 || lirePalettesDuPerso(source, nom)) continue
      source = ecrirePalettesDuPerso(source, nom, [palette, palette, palette, palette])
    }
  }
  return source
}

export function construireScene(nom, scene, source = '') {
  const { murs, x, y, dessin, cote = 16, couleur = false, evenements = [], acteurs = [], musique = null } = scene
  /* La musique de la scène : un « Air » du programme, qui joue en boucle tant qu'on y est. */
  const air = musique?.air && new RegExp(`\\bAir\\s+${musique.air}\\b`).test(source) ? musique.air : null
  const vitesseAir = borne(musique?.vitesse ?? 8, 1, 30)
  /* La taille de la carte : un écran, ou jusqu'à 32 × 32 cases avec une caméra. */
  const { colonnes: C, lignes: L } = tailleDeLaCarte(source, nom)
  const monde = { W: C * 8, H: L * 8, camera: C > COLONNES || L > LIGNES }
  const M = aLaTaille(murs, C, L)
  const parTable = lignesParTable(C)
  const tables = []
  for (let debut = 0, k = 0; debut < L; debut += parTable, k++) {
    const rangees = M.slice(debut, debut + parTable)
    tables.push({ k, debut, n: rangees.length, lignes: [
      `const uint8_t ${nom}_MURS_${k}[${rangees.length}][${C}] = {`,
      ...rangees.map((rangee) => `  { ${rangee.join(', ')} },`),
      '};',
    ] })
  }
  const poser = cote === 16 ? 'sprite16' : 'sprite'

  /* Ce qu'on refait en entrant : les cases « une seule fois » déjà effacées le restent. */
  const effacees = evenements
    .map((e, i) => ({ e, i }))
    .filter(({ e }) => e.unique && (e.actions ?? []).some((a) => a.type === 'effacer'))

  return [
    debutScene(nom),
    `/* Les murs de ${nom} (${C} × ${L} cases), case par case : 1 = on ne passe pas.`,
    `   En ${tables.length} tables, car un tableau ne dépasse pas 256 cases. */`,
    ...tables.flatMap((t) => t.lignes),
    '',
    '/* Une case est-elle un mur ? Hors de la carte aussi : on n\'en sort pas. */',
    `uint8_t ${nom}_mur(uint8_t colonne, uint8_t ligne) {`,
    `  if (colonne >= ${C} || ligne >= ${L}) return 1;`,
    ...tables.map((t, i) => i === tables.length - 1
      ? `  return ${nom}_MURS_${t.k}[ligne - ${t.debut}][colonne];`
      : `  if (ligne < ${t.debut + t.n}) return ${nom}_MURS_${t.k}[ligne - ${t.debut}][colonne];`),
    '}',
    ...(monde.camera
      ? [
        '',
        `/* La caméra : la carte fait ${monde.W} × ${monde.H} pixels, l'écran 160 × 144. Elle suit le joueur,`,
        '   et s\'arrête aux bords : on ne voit jamais au-delà de la carte. */',
        `uint8_t ${nom}_camX = 0;`,
        `uint8_t ${nom}_camY = 0;`,
      ]
      : []),
    '',
    '/* Un carré de « cote » pixels peut-il être là ? Ses coins ET le milieu de ses bords doivent être libres :',
    '   seize pixels mal alignés couvrent TROIS colonnes, et un mur d\'une case, au milieu, passait entre les coins. */',
    `uint8_t ${nom}_libre(uint8_t x, uint8_t y, uint8_t cote) {`,
    '  uint8_t d = cote - 1;',
    '  uint8_t m = cote >> 1;',
    `  return !${nom}_mur(x / 8, y / 8) && !${nom}_mur((x + m) / 8, y / 8) && !${nom}_mur((x + d) / 8, y / 8)`,
    `      && !${nom}_mur(x / 8, (y + m) / 8) && !${nom}_mur((x + d) / 8, (y + m) / 8)`,
    `      && !${nom}_mur(x / 8, (y + d) / 8) && !${nom}_mur((x + m) / 8, (y + d) / 8) && !${nom}_mur((x + d) / 8, (y + d) / 8);`,
    '}',
    '',
    `const uint8_t ${nom}_DEPART_X = ${x};   // où le joueur apparaît, en pixels`,
    `const uint8_t ${nom}_DEPART_Y = ${y};`,
    `uint8_t ${nom}_joueurX = ${x};`,
    `uint8_t ${nom}_joueurY = ${y};`,
    `uint8_t ${nom}_active = 0;       // 1 : c'est la scène où l'on joue`,
    `// musique = ${JSON.stringify(air ? { air, vitesse: vitesseAir } : null)}`,
    '',
    ...lignesDuJoueur(nom, scene, poser, monde),
    '',
    ...construireEvenements(nom, evenements, cote, couleur),
    '',
    ...construireActeurs(nom, acteurs, source, cote, couleur, { ...monde, plateforme: scene.genre === 'plateforme', marge: scene.marge ?? 0 }),
    '',
    `/* Entrer dans ${nom} : l'écran s'éteint, la carte se dessine, le joueur apparaît en (x, y). */`,
    `void ${nom}_entrer(uint8_t x, uint8_t y) {`,
    '  JEU_quitterLesScenes();',
    '  ecran(0);',
    '  /* D\'abord tout effacer — les 32 × 32 cases de la console : la carte ne pose que ses',
    '     cases dessinées, et la scène d\'avant (peut-être plus grande) laisserait les siennes. */',
    '  for (uint8_t l = 0; l < 32; l++) {',
    '    for (uint8_t c = 0; c < 32; c++) {',
    '      poser(c, l, 0);',
    ...(couleur ? ['      teindre(c, l, 0);'] : []),
    '    }',
    '  }',
    `  ${nom}();`,
    ...effacees.map(({ e, i }) => `  if (${nom}_fait[${i}]) poser(${e.c}, ${e.l}, 0);   // déjà ramassé`),
    '  defiler(0, 0);                  // la vue repart du coin de la carte',
    '  ecran(1);',
    `  ${nom}_joueurX = x;`,
    `  ${nom}_joueurY = y;`,
    `  ${nom}_avantC = 255;`,
    `  ${nom}_avantL = 255;`,
    `  ${nom}_avantA = 1;              // un A tenu en entrant ne déclenche rien`,
    `  ${nom}_message = 0;`,
    `  ${nom}_placerLesActeurs();`,
    ...(scene.genre === 'plateforme' ? [`  ${nom}_saut = 0;`, `  ${nom}_avantSaut = 1;`] : []),
    ...(air
      ? [`  jouer(1, ${air}, ${vitesseAir}, 1);   // la musique de la scène, en boucle`]
      : ['  silence(1);                   // pas de musique ici : celle d\'avant se tait']),
    `  ${nom}_active = 1;`,
    '  JEU_finDuMessage();             // le HUD, s\'il y en a un',
    '}',
    finScene(nom),
    '',
  ].join(SAUT)
}

/** Remplace un bloc repéré par ses marques — ou rend null s'il n'y est pas. */
function remplacerBloc(source, debut, fin, neuf) {
  const i = source.indexOf(debut)
  if (i < 0) return null
  const j = source.indexOf(fin, i)
  if (j < 0) return null
  return source.slice(0, i) + neuf + source.slice(j + fin.length).replace(/^\r?\n/, '')
}

/**
 * Réécrit le bloc de la scène — ou le pose à la suite de sa carte —, puis
 * remet à jour ce que toutes les scènes partagent.
 */
/**
 * Réécrit toutes les scènes du programme, en couleur : quand un personnage
 * change de palettes, le code qui le colore doit suivre.
 */
export function rafraichirLesScenes(source) {
  for (const nom of listerLesScenes(source)) {
    const scene = lireScene(source, nom)
    if (!scene) continue
    source = ecrireScene(source, nom, { ...scene, cote: coteDuDessin(source, scene.dessin) ?? 16, couleur: true })
  }
  return source
}

export function ecrireScene(source, nom, scene) {
  source = donnerLeursPalettes(source, scene)
  const bloc = construireScene(nom, scene, source)
  let neuf = remplacerBloc(source, debutScene(nom), finScene(nom), bloc)
  if (neuf === null) {
    const finCarte = `/* --- fin de la carte "${nom}" --- */`
    const k = source.indexOf(finCarte)
    neuf = k >= 0
      ? source.slice(0, k + finCarte.length) + SAUT + SAUT + bloc.trimEnd() + source.slice(k + finCarte.length)
      : bloc + SAUT + source
  }
  return mettreAJourLeJeu(neuf)
}

/* ------------------------------------------------------------- le jeu */

/*
 * Les réglages du jeu entier — pas d'une scène :
 *
 *   titre, sousTitre   l'écran titre (vide : on entre directement dans le jeu)
 *   vies               les vies au départ (0 : pas de vies)
 *   depart             la scène où la partie commence
 *
 * Rangés sur la ligne « // jeu = {…} » du bloc commun, que l'atelier relit.
 */
const REGLAGES_PAR_DEFAUT = {
  titre: '', sousTitre: 'APPUIE SUR START', vies: 3, depart: null, hud: true,
  pause: true,            // SELECT met le jeu en pause
  coeurs: false,          // les vies en cœurs, plutôt qu'en chiffres
  barre: null,            // { nom: 'MANA', max: 8 } : une barre, sur la ligne du HUD
  textePerdu: 'PERDU !',
  menu: false,            // l'écran titre devient un menu : JOUER, COMMENT JOUER
  aide: ['FLECHES : BOUGER', 'A : AGIR', 'START : INVENTAIRE', 'SELECT : PAUSE'],
  paletteHud: 0,          // la palette du panneau (HUD, dialogues, menus) — Game Boy Color
  texteBravo: 'BRAVO !',
}

export function lireReglagesDuJeu(source) {
  const bloc = source.slice(Math.max(0, source.indexOf(DEBUT_COMMUN)))
  const m = source.includes(DEBUT_COMMUN) ? bloc.match(/\/\/ jeu = (\{.*\})/) : null
  let lus = {}
  try { lus = m ? JSON.parse(m[1]) : {} } catch { lus = {} }
  return { ...REGLAGES_PAR_DEFAUT, ...lus }
}

/** Change les réglages du jeu, et réécrit tout ce qui en dépend. */
export function ecrireReglagesDuJeu(source, reglages) {
  return mettreAJourLeJeu(source, { ...lireReglagesDuJeu(source), ...reglages })
}

/** Un texte centré sur les vingt colonnes de l'écran. */
const centre = (texte) => Math.max(0, (20 - texte.length) >> 1)

/**
 * Le bloc commun à toutes les scènes, en tête du programme : les variables
 * du jeu, l'écran titre, perdre et gagner, quitter les scènes, attendre un
 * bouton.
 */
/*
 * L'inventaire : START, pendant la partie, ouvre un panneau qui dit ce que le
 * joueur porte — chaque objet est une variable « OBJ_… » à 1 quand on l'a.
 * Sans objet dans le jeu, START ne fait rien de plus qu'avant.
 */
function inventaire(variables) {
  const objets = [...variables].filter((v) => v.startsWith('OBJ_')).sort()
  if (!objets.length) return ['void JEU_start() {', '}', '']
  const lignes = Math.min(objets.length + 2, 9)
  return [
    '/* START : l\'inventaire — les objets que le joueur porte. START encore : on repart. */',
    'void JEU_start() {',
    '  effacerPanneau();',
    '  textePanneau(1, 0, "INVENTAIRE");',
    '  uint8_t l = 1;',
    ...objets.slice(0, 7).map((o) => `  if (JEU_${o} == 1) { textePanneau(2, l, "${o.slice(4)}"); l++; }`),
    '  if (l == 1) textePanneau(2, 1, "RIEN");',
    `  panneau(0, ${144 - lignes * 8});`,
    '  JEU_attendreStart();',
    '  effacerPanneau();',
    '  JEU_finDuMessage();',
    '}',
    '',
  ]
}

function construireLeCommun(source, reglages) {
  const scenes = listerLesScenes(source)
  const depart = scenes.includes(reglages.depart) ? reglages.depart : scenes[0]
  const variables = new Set()
  for (const s of scenes) for (const v of variablesEmployees(lireScene(source, s))) variables.add(v)
  const vies = borne(reglages.vies, 0, 99)
  if (vies > 0) variables.add('VIES')
  /* La barre du HUD (de mana, d'énergie…) : une variable du jeu, et son maximum. */
  const barre = reglages.barre?.nom ? { nom: nomDeVariable(reglages.barre.nom), max: borne(reglages.barre.max ?? 8, 1, 10) } : null
  if (barre) variables.add(barre.nom)
  const coeurs = Boolean(reglages.coeurs) && variables.has('VIES')
  const couleur = source.includes('      teindre(c, l, 0);')
  const titre = messageLisible(reglages.titre, 18).trim()
  const sousTitre = messageLisible(reglages.sousTitre, 18).trim()
  const remettre = [...variables].sort().map((v) => `  JEU_${v} = ${v === 'VIES' ? 'JEU_VIES_DEPART' : '0'};`)
  const ecrire = (ligne, texte) => (texte ? [`  texte(${centre(texte)}, ${ligne}, "${texte}");`] : [])

  return [
    DEBUT_COMMUN,
    '/* Ce que toutes les scènes partagent. Écrit par l\'atelier (onglet La carte, 🏁 Le jeu) : il le réécrit à chaque changement. */',
    `// jeu = ${JSON.stringify({ ...reglages, depart })}`,
    '',
    ...(coeurs
      ? ['/* Le cœur des vies, dans le HUD. */', 'Tuile JEU_COEUR = {', '  "00000000", "01100110", "13311331", "13333331",', '  "13333331", "01333310", "00133100", "00011000",', '};', '']
      : []),
    ...(barre
      ? ['/* La barre du HUD : une case pleine, une case vide. */', 'Tuile JEU_PLEIN = {', '  "00000000", "33333333", "32222223", "32222223",', '  "32222223", "32222223", "33333333", "00000000",', '};',
        'Tuile JEU_CASE = {', '  "00000000", "33333333", "30000003", "30000003",', '  "30000003", "30000003", "33333333", "00000000",', '};', '']
      : []),
    '/* Le curseur des menus : la police n\'a pas de « > », il est dessiné. */',
    'Tuile JEU_CURSEUR = {',
    '  "00000000", "03000000", "03300000", "03330000",',
    '  "03300000", "03000000", "00000000", "00000000",',
    '};',
    '',
    '/* Les variables du jeu — nommées dans les événements (« changer une variable », « SI … »). */',
    `const uint8_t JEU_VIES_DEPART = ${vies};`,
    ...[...variables].sort().map((v) => `uint8_t JEU_${v} = ${v === 'VIES' ? vies : 0};`),
    '',
    '/* Quitter toutes les scènes : une seule est active à la fois. Les lutins des acteurs s\'en vont. */',
    'void JEU_quitterLesScenes() {',
    ...scenes.map((s) => `  ${s}_active = 0;`),
    '  for (uint8_t n = 4; n < 40; n++) cacher(n);',
    '  cacherPanneau();',
    '}',
    '',
    '/* Attendre un bouton : qu\'on le lâche, qu\'on l\'enfonce, qu\'on le relâche. */',
    'void JEU_attendreA() {',
    '  while (bouton(A)) image();',
    '  while (!bouton(A)) image();',
    '  while (bouton(A)) image();',
    '}',
    '/* Un menu : le curseur « > » devant la réponse, HAUT et BAS le déplacent, A choisit. Rend 1 à n. */',
    'uint8_t JEU_menu(uint8_t n) {',
    '  uint8_t c = 0;',
    '  while (bouton(A)) image();',
    '  while (true) {',
    '    for (uint8_t i = 0; i < n; i++) poserPanneau(1, 1 + i, 0);',
    '    poserPanneau(1, 1 + c, JEU_CURSEUR);',
    '    image();',
    '    if (bouton(BAS) && c + 1 < n) { c++; while (bouton(BAS)) image(); }',
    '    if (bouton(HAUT) && c > 0) { c--; while (bouton(HAUT)) image(); }',
    '    if (bouton(A)) { while (bouton(A)) image(); return c + 1; }',
    '  }',
    '  return 1;',
    '}',
    '/* SELECT : la pause. Le jeu s\'arrête, SELECT encore : il reprend. */',
    'void JEU_pause() {',
    ...(reglages.pause !== false
      ? [
        '  while (bouton(SELECT)) image();',
        '  effacerPanneau();',
        '  textePanneau(7, 1, "PAUSE");',
        '  textePanneau(1, 3, "SELECT : REPRENDRE");',
        '  panneau(0, 104);',
        '  while (!bouton(SELECT)) image();',
        '  while (bouton(SELECT)) image();',
        '  effacerPanneau();',
        '  JEU_finDuMessage();',
      ]
      : []),
    '}',
    '/* Une question : A (oui) rend 1, B (non) rend 0. */',
    'uint8_t JEU_choisir() {',
    '  while (bouton(A) || bouton(B)) image();',
    '  uint8_t r = 2;',
    '  while (r == 2) {',
    '    image();',
    '    if (bouton(A)) r = 1;',
    '    if (bouton(B)) r = 0;',
    '  }',
    '  while (bouton(A) || bouton(B)) image();',
    '  return r;',
    '}',
    ...inventaire(variables),
    'void JEU_attendreStart() {',
    '  while (bouton(START)) image();',
    '  while (!bouton(START)) image();',
    '  while (bouton(START)) image();',
    '}',
    '',
    '/* Le HUD : les vies et le score, sur la dernière ligne de l\'écran. Le panneau de la console',
    '   couvre toujours jusqu\'en bas : c\'est donc là qu\'il se pose. Un message prend sa place un',
    '   instant, puis il revient. */',
    'void JEU_finDuMessage() {',
    ...(reglages.hud !== false && (variables.has('VIES') || variables.has('SCORE') || barre)
      ? [
        '  textePanneau(0, 0, "                    ");',
        ...(barre ? ['  textePanneau(0, 1, "                    ");'] : []),
        ...(variables.has('VIES')
          ? coeurs
            ? ['  for (uint8_t i = 0; i < 8; i++) {', '    if (i < JEU_VIES) poserPanneau(1 + i, 0, JEU_COEUR);   // un cœur par vie', '  }']
            : ['  textePanneau(1, 0, "VIES");', '  nombrePanneau(6, 0, JEU_VIES, 2);']
          : []),
        ...(variables.has('SCORE') ? ['  textePanneau(10, 0, "SCORE");', '  nombrePanneau(16, 0, JEU_SCORE);'] : []),
        ...(barre
          ? [
            `  textePanneau(1, 1, "${barre.nom.slice(0, 5)}");`,
            `  for (uint8_t i = 0; i < ${barre.max}; i++) {`,
            `    if (i < JEU_${barre.nom}) poserPanneau(7 + i, 1, JEU_PLEIN);   // la barre : pleine…`,
            '    else poserPanneau(7 + i, 1, JEU_CASE);          // …ou vide',
            '  }',
          ]
          : []),
        `  panneau(0, ${barre ? 128 : 136});`,
      ]
      : ['  cacherPanneau();']),
    '}',
    '',
    '/* Un écran vide, écran éteint : la carte, les couleurs des cases et tous les lutins s\'en vont. */',
    'void JEU_effacerLEcran() {',
    '  JEU_quitterLesScenes();',
    '  for (uint8_t n = 0; n < 4; n++) cacher(n);',
    '  silence(1);',
    '  ecran(0);',
    '  for (uint8_t l = 0; l < 32; l++) {',
    '    for (uint8_t c = 0; c < 32; c++) {',
    '      poser(c, l, 0);',
    ...(couleur ? ['      teindre(c, l, 0);'] : []),
    '    }',
    '  }',
    '  defiler(0, 0);',
    '}',
    '',
    ...(titre && reglages.menu
      ? [
        '/* Le menu principal : JOUER, ou COMMENT JOUER. HAUT et BAS choisissent, A (ou START) valide. */',
        'void JEU_titre() {',
        '  JEU_effacerLEcran();',
        ...ecrire(6, titre),
        '  texte(7, 11, "JOUER");',
        '  texte(7, 12, "COMMENT JOUER");',
        '  ecran(1);',
        '}',
        'void JEU_menuPrincipal() {',
        '  uint8_t choix = 0;',
        '  JEU_titre();',
        '  while (true) {',
        '    poser(5, 11, 0);',
        '    poser(5, 12, 0);',
        '    poser(5, 11 + choix, JEU_CURSEUR);',
        '    image();',
        '    if (bouton(BAS)) choix = 1;',
        '    if (bouton(HAUT)) choix = 0;',
        '    if (bouton(A) || bouton(START)) {',
        '      while (bouton(A) || bouton(START)) image();',
        '      if (choix == 0) return;',
        '      JEU_effacerLEcran();',
        '      texte(4, 3, "COMMENT JOUER");',
        ...(reglages.aide ?? []).map((l) => messageLisible(l, 18).trim()).filter(Boolean).slice(0, 6)
          .map((l, i) => `      texte(1, ${6 + i * 2}, "${l}");`),
        '      texte(4, 16, "A : RETOUR");',
        '      ecran(1);',
        '      JEU_attendreA();',
        '      JEU_titre();',
        '    }',
        '  }',
        '}',
        '',
      ]
      : []),
    '/* Une partie neuve : l\'écran titre, les variables à leur départ, la première scène. */',
    'void JEU_demarrer() {',
    ...(titre
      ? reglages.menu
        ? ['  JEU_menuPrincipal();']
        : [
          '  JEU_effacerLEcran();',
          ...ecrire(6, titre),
          ...ecrire(11, sousTitre),
          '  ecran(1);',
          '  JEU_attendreStart();',
        ]
      : []),
    ...(couleur && borne(reglages.paletteHud ?? 0, 0, 7) > 0
      ? [
        `  /* Le panneau (HUD, dialogues, menus) prend la palette ${borne(reglages.paletteHud, 0, 7)}. */`,
        '  for (uint8_t l = 0; l < 18; l++) {',
        `    for (uint8_t c = 0; c < 20; c++) teindrePanneau(c, l, ${borne(reglages.paletteHud, 0, 7)});`,
        '  }',
      ]
      : []),
    ...remettre,
    `  ${depart}_entrer(${depart}_DEPART_X, ${depart}_DEPART_Y);   // la scène de départ`,
    '}',
    '',
    '/* Plus de vies : « PERDU », puis une partie neuve. */',
    'void JEU_perdre() {',
    '  JEU_effacerLEcran();',
    ...ecrire(7, messageLisible(reglages.textePerdu ?? 'PERDU !', 18).trim() || 'PERDU !'),
    ...(variables.has('SCORE') ? ['  texte(6, 9, "SCORE:");', '  nombre(13, 9, JEU_SCORE);'] : []),
    ...ecrire(13, 'APPUIE SUR START'),
    '  ecran(1);',
    '  JEU_attendreStart();',
    '  JEU_demarrer();',
    '}',
    '',
    '/* Gagné : « BRAVO », puis une partie neuve. */',
    'void JEU_victoire() {',
    '  JEU_effacerLEcran();',
    ...ecrire(7, messageLisible(reglages.texteBravo ?? 'BRAVO !', 18).trim() || 'BRAVO !'),
    ...(variables.has('SCORE') ? ['  texte(6, 9, "SCORE:");', '  nombre(13, 9, JEU_SCORE);'] : []),
    ...ecrire(13, 'APPUIE SUR START'),
    '  ecran(1);',
    '  JEU_attendreStart();',
    '  JEU_demarrer();',
    '}',
    FIN_COMMUN,
    '',
  ].join(SAUT)
}

/** Le corps de « main » quand les scènes SONT le jeu. */
function blocDuJeu(scenes) {
  return [
    DEBUT_JEU,
    '  JEU_demarrer();              // l\'écran titre, puis la scène de départ',
    '',
    '  while (true) {',
    '    image();',
    '    if (bouton(START)) JEU_start();   // l\'inventaire',
    '    if (bouton(SELECT)) JEU_pause();  // la pause',
    ...scenes.flatMap((s) => [
      `    if (${s}_active) ${s}_joueur();`,
      `    if (${s}_active) ${s}_acteurs();`,
      `    if (${s}_active) ${s}_evenements();`,
    ]),
    '  }',
    FIN_JEU,
  ].join(SAUT)
}

/**
 * Ce que toutes les scènes partagent, remis à jour : le bloc commun, et — si
 * « main » est déjà le jeu des scènes — sa boucle, qui doit connaître chacune.
 */
export function mettreAJourLeJeu(source, reglages = lireReglagesDuJeu(source)) {
  if (!listerLesScenes(source).length) return source
  const commun = construireLeCommun(source, reglages)
  let neuf = remplacerBloc(source, DEBUT_COMMUN, FIN_COMMUN, commun)
  if (neuf === null) neuf = commun + SAUT + source

  const corps = corpsDeMain(neuf)
  if (corps && corps.texte.includes(DEBUT_JEU.trim())) {
    const refait = remplacerBloc(neuf, DEBUT_JEU, FIN_JEU, blocDuJeu(listerLesScenes(neuf)))
    if (refait !== null) neuf = refait
  }
  return neuf
}

/**
 * « main » fait-il autre chose que ce que l'atelier y a mis ?
 *
 * Les couleurs de l'atelier, le bloc du jeu, la boucle vide d'un programme
 * neuf ne comptent pas. Tout le reste est le travail de quelqu'un : on ne le
 * remplace pas sans demander.
 */
export function mainAUnContenuPropre(source) {
  const corps = corpsDeMain(source)
  if (corps === null) return false
  const nettoye = corps.texte
    .replace(/\/\* --- les couleurs de l’atelier --- \*\/[\s\S]*?\/\* --- fin des couleurs --- \*\//, '')
    .replace(/\/\* --- le jeu de la scène --- \*\/[\s\S]*?\/\* --- fin du jeu de la scène --- \*\//, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '')
    .replace(/while\s*\(\s*true\s*\)\s*\{\s*image\s*\(\s*\)\s*;\s*\}/, '')
    .replace(/return\s+0\s*;/, '')
  return nettoye.trim().length > 0
}

/** Le texte entre les accolades de « int main() », et où il est. */
function corpsDeMain(source) {
  const m = source.search(/int\s+main\s*\([^)]*\)\s*\{/)
  if (m < 0) return null
  const ouvre = source.indexOf('{', m)
  let profondeur = 0
  for (let i = ouvre; i < source.length; i++) {
    if (source[i] === '{') profondeur++
    else if (source[i] === '}') {
      profondeur--
      if (profondeur === 0) return { debut: ouvre + 1, fin: i, texte: source.slice(ouvre + 1, i) }
    }
  }
  return null
}

/**
 * Fait des scènes LE jeu, en partant de celle-ci : « main » entre dans la
 * scène, puis fait tourner celle qui est active.
 *
 * Les couleurs de l'atelier, en tête de « main », sont gardées. Sans « main »,
 * on en écrit un.
 */
export function faireDeLaSceneLeJeu(source, nom) {
  /* La partie commencera par CETTE scène. */
  source = mettreAJourLeJeu(source, { ...lireReglagesDuJeu(source), depart: nom })
  const corps = corpsDeMain(source)
  const jeu = blocDuJeu(listerLesScenes(source))
  if (!corps) return source.trimEnd() + SAUT + SAUT + `int main() {${SAUT}${jeu}${SAUT}}${SAUT}`

  const couleurs = corps.texte.match(/[ \t]*\/\* --- les couleurs de l’atelier --- \*\/[\s\S]*?\/\* --- fin des couleurs --- \*\/\r?\n?/)
  const neuf = SAUT + (couleurs ? couleurs[0].replace(/\r?\n?$/, SAUT) : '') + jeu + SAUT
  return source.slice(0, corps.debut) + neuf + source.slice(corps.fin)
}

/** Un personnage tout prêt, pour qui n'a encore rien dessiné. */
export const HEROS_PAR_DEFAUT = [
  'Perso HEROS = {',
  '  "0000033333300000",',
  '  "0000322222230000",',
  '  "0003222222223000",',
  '  "0003211221123000",',
  '  "0003211221123000",',
  '  "0003222222223000",',
  '  "0000322332230000",',
  '  "0000033333300000",',
  '  "0003333333333000",',
  '  "0032222222222300",',
  '  "0321222222221230",',
  '  "0321222222221230",',
  '  "0003222222223000",',
  '  "0003322003223000",',
  '  "0003220000223000",',
  '  "0033330000333300",',
  '};',
].join(SAUT)

/** Un ennemi tout prêt, pour le premier acteur d'un programme qui n'en a pas. */
export const MONSTRE_PAR_DEFAUT = [
  'Perso MONSTRE = {',
  '  "0000000000000000",',
  '  "0000033333300000",',
  '  "0003322222233000",',
  '  "0032222222222300",',
  '  "0321132222311230",',
  '  "0321132222311230",',
  '  "3222222222222223",',
  '  "3222233333322223",',
  '  "3222322222232223",',
  '  "3222222222222223",',
  '  "0322222222222230",',
  '  "0032222222222300",',
  '  "0003223223223000",',
  '  "0003203203203000",',
  '  "0000300300300000",',
  '  "0000000000000000",',
  '};',
].join(SAUT)

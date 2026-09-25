/**
 * Faire entrer les tuiles d'un fichier « .gbr » — celui du logiciel Game Boy
 * Tile Designer, de Harry Mulder.
 *
 * C'est un format binaire, pas un programme : « GBO », un numéro de version,
 * puis une suite de blocs (type, identifiant, longueur, données). Celui qui
 * nous intéresse est le bloc « tile_data » — un nom, une largeur, une hauteur,
 * un compte, et pour chaque tuile un octet par pixel, de 0 (le plus clair) à 3
 * (le plus sombre). C'est exactement la nuance que porte une « Tuile NOM = {…} »
 * de ce programme : il n'y a rien à recalculer, seulement à relire.
 *
 * Les autres blocs — les palettes, les réglages d'export — ne disent rien que
 * ce programme sache faire : une tuile n'y porte que des numéros de teinte, la
 * couleur vient de la palette de la case où on la pose. Ils sont donc ignorés.
 */

/** Du plus clair au plus sombre — les signes que le compilateur attend. */
const SIGNES = ['.', '-', '+', '#']

const MAGIE = 'GBO'
const TYPE_TUILES = 0x02

/** Le texte d'un champ à taille fixe, coupé à son premier zéro. */
function texteJusquauZero(octets, debut, longueur) {
  const tranche = octets.subarray(debut, debut + longueur)
  const zero = tranche.indexOf(0)
  const utile = zero === -1 ? tranche : tranche.subarray(0, zero)
  return new TextDecoder('latin1').decode(utile).trim()
}

/** Un nom que le compilateur accepte — lettres et chiffres, jamais un chiffre en tête. */
function nomValide(brut, cote) {
  const racine = cote === 16 ? 'PERSO' : 'TUILE'
  const propre = brut
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^A-Za-z0-9]/g, '')
    .toUpperCase()
    .slice(0, 20)

  if (!propre) return racine
  return /^[0-9]/.test(propre) ? racine + propre : propre
}

/** Le même nom, rendu unique — « TUILE2 », « TUILE3 », … s'il est déjà pris. */
function nomLibre(propose, pris) {
  if (!pris.has(propose)) return propose
  let n = 2
  while (pris.has(propose + n)) n++
  return propose + n
}

/**
 * Les tuiles d'un bloc « tile_data ».
 *
 * Un bloc porte UN nom mais peut contenir PLUSIEURS tuiles à la file — une
 * planche entière, dessinée d'un coup dans GBTD. Chacune reçoit alors un
 * numéro à la suite du nom : ce n'est qu'un point de départ, à renommer une
 * fois recopié dans son programme.
 */
function lireBlocDeTuiles(bloc) {
  if (bloc.length < 36) return { tuiles: [], ignoree: { nom: '(bloc incomplet)', raison: 'trop court pour être lu' } }

  const nomBrut = texteJusquauZero(bloc, 0, 30)
  let p = 30
  const largeur = bloc[p] | (bloc[p + 1] << 8); p += 2
  const hauteur = bloc[p] | (bloc[p + 1] << 8); p += 2
  const compte = bloc[p] | (bloc[p + 1] << 8); p += 2
  p += 4 // le jeu de couleurs : une console d'origine ne connaît que la clarté, pas la teinte
  const pixels = bloc.subarray(p)

  if (largeur !== hauteur || (largeur !== 8 && largeur !== 16)) {
    return {
      tuiles: [],
      ignoree: {
        nom: nomBrut || '(sans nom)',
        raison: `${largeur} × ${hauteur} : seules les tuiles 8 × 8 et les personnages 16 × 16 sont importés`,
      },
    }
  }

  const base = nomValide(nomBrut, largeur)
  const parTuile = largeur * hauteur
  const tuiles = []

  for (let i = 0; i < compte; i++) {
    const donnees = pixels.subarray(i * parTuile, (i + 1) * parTuile)
    if (donnees.length < parTuile) break // le fichier s'arrête au milieu d'une tuile

    const rangees = []
    for (let y = 0; y < largeur; y++) {
      let rangee = ''
      for (let x = 0; x < largeur; x++) rangee += SIGNES[donnees[y * largeur + x] & 3]
      rangees.push(rangee)
    }

    tuiles.push({ nom: compte > 1 ? `${base}${i + 1}` : base, cote: largeur, rangees })
  }

  return { tuiles, ignoree: null }
}

/**
 * Lit un fichier « .gbr » et en rend les tuiles.
 *
 * @param {ArrayBuffer} tampon le fichier, tel que le navigateur l'a lu
 * @returns {{ tuiles: Array, ignorees: Array }} les dessins trouvés, et ceux
 *   laissés de côté (avec pourquoi) — jamais les deux mêlés, pour que
 *   l'appelant sache exactement quoi montrer.
 */
export function lireGBR(tampon) {
  const octets = new Uint8Array(tampon)
  const vue = new DataView(tampon)

  const enTete = octets.length >= 3 ? new TextDecoder('latin1').decode(octets.subarray(0, 3)) : ''
  if (enTete !== MAGIE) {
    throw new Error('Ce fichier n’est pas un « .gbr » du Game Boy Tile Designer (l’en-tête « GBO » manque).')
  }

  const tuiles = []
  const ignorees = []
  const dejaPris = new Set()
  let position = 4 // les trois lettres, puis un octet de version

  while (position + 8 <= octets.length) {
    const type = vue.getUint16(position, true)
    const longueur = vue.getUint32(position + 4, true)
    position += 8

    if (position + longueur > octets.length) break // fichier tronqué : on garde ce qui a déjà été lu

    if (type === TYPE_TUILES) {
      const { tuiles: trouvees, ignoree } = lireBlocDeTuiles(octets.subarray(position, position + longueur))
      for (const tuile of trouvees) {
        tuile.nom = nomLibre(tuile.nom, dejaPris)
        dejaPris.add(tuile.nom)
        tuiles.push(tuile)
      }
      if (ignoree) ignorees.push(ignoree)
    }

    position += longueur
  }

  return { tuiles, ignorees }
}

/**
 * Le fichier C++ que ces tuiles font.
 *
 * Comme les dessins tirés d'une cartouche (« convertir.js »), elles vont dans
 * LEUR fichier, pas directement dans le programme : on garde celui-ci
 * lisible, et l'on choisit ensuite lesquelles on en prend.
 */
export function fichierGBTD(tuiles, ignorees, { titre = 'un fichier .gbr' } = {}) {
  const lignes = [
    '/*',
    ` * Les tuiles importées depuis ${titre}.`,
    ' *',
    ' * Elles viennent d’un fichier du Game Boy Tile Designer (GBTD) — son format',
    ' * range huit ou seize pixels de côté, un chiffre de 0 à 3 par pixel ;',
    ' * c’est exactement ce qu’attend une « Tuile NOM = {…} » de ce programme.',
    ' *',
    ' * Elles restent ici, et non dans le programme principal : recopie celles',
    ' * qui te servent, ou repeins-les depuis « Les tuiles » une fois ce fichier',
    ' * ouvert.',
    ' */',
    '',
  ]

  for (const { nom, cote, rangees } of tuiles) {
    lignes.push(
      `${cote === 16 ? 'Perso' : 'Tuile'} ${nom} = {`,
      ...rangees.map((r) => `  "${r}",`),
      '};',
      '',
    )
  }

  if (ignorees.length) {
    lignes.push(
      '/*',
      ' * Laissées de côté :',
      ...ignorees.map(({ nom, raison }) => ` *   - ${nom} : ${raison}`),
      ' */',
      '',
    )
  }

  return lignes.join('\n')
}

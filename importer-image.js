/**
 * Faire entrer une image dans le programme, sous forme de tuile.
 *
 * On choisit un fichier — PNG, JPEG, ce que le navigateur sait lire —, il est
 * réduit à huit ou seize pixels de côté, et chaque pixel devient l'une des
 * QUATRE nuances de la console. Le résultat n'est pas une image : ce sont des
 * rangées de signes, écrites dans le programme, qu'on peut ensuite repeindre à
 * la souris comme n'importe quelle autre tuile.
 *
 * C'est important, et c'est tout le contraire d'un « import » : rien n'est
 * gardé du fichier d'origine. La cartouche ne contient pas l'image, elle
 * contient la tuile — seize octets pour un carré de huit.
 *
 * L'écran d'origine ne connaît pas la couleur : une image en couleurs est donc
 * jugée sur sa CLARTÉ. C'est la seule traduction honnête, et elle explique
 * pourquoi deux couleurs très différentes mais également sombres finissent
 * dans la même nuance.
 */

/** Du plus clair au plus sombre : les signes que le compilateur attend. */
const SIGNES = ['.', '-', '+', '#']

/**
 * La nuance d'un pixel, d'après sa clarté.
 *
 * Les coefficients sont ceux de la luminance perçue : l'œil voit le vert bien
 * plus que le bleu, et une moyenne toute simple rendrait un ciel plus sombre
 * qu'une herbe de même valeur.
 */
export function nuanceDuPixel(r, v, b, alpha) {
  if (alpha < 128) return 0 // transparent : du vide

  const clarte = 0.299 * r + 0.587 * v + 0.114 * b
  if (clarte < 64) return 3
  if (clarte < 128) return 2
  if (clarte < 192) return 1
  return 0
}

/**
 * Lit un fichier image et rend les rangées d'une tuile.
 *
 * `cote` vaut 8 pour une tuile, 16 pour un personnage. L'image est réduite à
 * cette taille par le navigateur lui-même — c'est lui qui sait le faire vite et
 * proprement, et le résultat vaut bien mieux qu'un pixel pris au hasard tous
 * les n pixels.
 */
export async function tuileDepuisUneImage(fichier, cote) {
  const image = new Image()
  const adresse = URL.createObjectURL(fichier)

  try {
    await new Promise((fait, rate) => {
      image.onload = fait
      image.onerror = () => rate(new Error(`« ${fichier.name} » n'est pas une image que le navigateur sache lire`))
      image.src = adresse
    })

    const toile = document.createElement('canvas')
    toile.width = cote
    toile.height = cote
    const ctx = toile.getContext('2d', { willReadFrequently: true })

    /*
     * L'image est prise en ENTIER, et déformée s'il le faut.
     *
     * Rogner un carré au milieu paraît plus élégant, et coupe une tête sur deux
     * quand le dessin ne tient pas au centre. Mieux vaut une image un peu large
     * mais entière : on voit ce qu'on a importé, et l'on corrige à la souris.
     */
    ctx.drawImage(image, 0, 0, cote, cote)

    const pixels = ctx.getImageData(0, 0, cote, cote).data
    const rangees = []

    for (let y = 0; y < cote; y++) {
      let rangee = ''
      for (let x = 0; x < cote; x++) {
        const i = (y * cote + x) * 4
        rangee += SIGNES[nuanceDuPixel(pixels[i], pixels[i + 1], pixels[i + 2], pixels[i + 3])]
      }
      rangees.push(rangee)
    }

    return rangees
  } finally {
    /* Le navigateur garde le fichier en mémoire tant qu'on ne rend pas
       l'adresse : une image de dix mégaoctets importée dix fois finirait par
       peser, pour un résultat de seize octets. */
    URL.revokeObjectURL(adresse)
  }
}

/** Le nom, tiré du fichier, débarrassé de ce que le compilateur refuserait. */
function nomDeBase(nomFichier) {
  const propre = nomFichier
    .replace(/\.[^.]+$/, '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^A-Za-z0-9]/g, '')
    .toUpperCase()
    .slice(0, 12)
  return propre || 'IMAGE'
}

/**
 * Découpe une image en une GRILLE de tuiles de huit pixels, plutôt que de
 * l'écraser dans une seule.
 *
 * Une image de soixante-quatre pixels de côté tient déjà, pixel pour pixel,
 * dans huit tuiles sur huit : la réduire à UNE tuile en jetterait soixante-
 * trois pixels sur soixante-quatre, et c'est ce qui rend l'autre import
 * illisible sur une image détaillée. Ici, un pixel réel devient un pixel de
 * tuile — jusqu'à `maxCote` tuiles de large et de haut : au-delà, la grille
 * est plafonnée, pour ne pas tirer des centaines de dessins d'une photo.
 *
 * Rend les tuiles ET leur position dans la grille — pas de `poser()` écrit à
 * leur place : c'est un découpage, pas un décor.
 */
export async function tuilesDepuisUneImageEnGrille(fichier, { maxCote = 16 } = {}) {
  const image = new Image()
  const adresse = URL.createObjectURL(fichier)

  try {
    await new Promise((fait, rate) => {
      image.onload = fait
      image.onerror = () => rate(new Error(`« ${fichier.name} » n'est pas une image que le navigateur sache lire`))
      image.src = adresse
    })

    /* Un pixel de tuile par pixel réel — plafonné, et jamais en dessous d'une
       seule tuile pour une image plus petite que huit pixels. */
    const colonnes = Math.min(maxCote, Math.max(1, Math.round(image.naturalWidth / 8)))
    const lignes = Math.min(maxCote, Math.max(1, Math.round(image.naturalHeight / 8)))

    const toile = document.createElement('canvas')
    toile.width = colonnes * 8
    toile.height = lignes * 8
    const ctx = toile.getContext('2d', { willReadFrequently: true })
    ctx.drawImage(image, 0, 0, toile.width, toile.height)

    const pixels = ctx.getImageData(0, 0, toile.width, toile.height).data
    const base = nomDeBase(fichier.name)
    const total = colonnes * lignes
    const chiffres = String(total).length
    const tuiles = []

    for (let ligne = 0; ligne < lignes; ligne++) {
      for (let colonne = 0; colonne < colonnes; colonne++) {
        const rangees = []
        for (let y = 0; y < 8; y++) {
          let rangee = ''
          for (let x = 0; x < 8; x++) {
            const px = colonne * 8 + x
            const py = ligne * 8 + y
            const i = (py * toile.width + px) * 4
            rangee += SIGNES[nuanceDuPixel(pixels[i], pixels[i + 1], pixels[i + 2], pixels[i + 3])]
          }
          rangees.push(rangee)
        }

        const n = ligne * colonnes + colonne + 1
        tuiles.push({ nom: `${base}${String(n).padStart(chiffres, '0')}`, cote: 8, rangees, colonne, ligne })
      }
    }

    return { tuiles, colonnes, lignes }
  } finally {
    URL.revokeObjectURL(adresse)
  }
}

/**
 * Le fichier C++ que fait une grille de tuiles.
 *
 * Comme les tuiles tirées d'un « .gbr » (« importer-gbtd.js ») : leur propre
 * fichier, pas le programme principal — on garde celui-ci lisible, et l'on
 * recopie ensuite ce qui sert.
 */
export function fichierDeLaGrille(tuiles, { colonnes, lignes, titre = 'une image' } = {}) {
  const lignesTexte = [
    '/*',
    ` * ${tuiles.length} tuiles découpées depuis ${titre} — une grille de ${colonnes} × ${lignes}.`,
    ' *',
    ' * Chaque tuile est un carré de huit pixels de l’image, à sa place : la',
    ' * première de la liste est le coin en haut à gauche, la dernière le coin',
    ' * en bas à droite, ligne par ligne. Il n’y a pas de « poser() » ici — à toi',
    ' * de choisir lesquelles employer, et où, une fois recopiées dans ton',
    ' * programme (ou repeintes depuis « Les tuiles », une fois ce fichier ouvert).',
    ' */',
    '',
  ]

  for (const { nom, rangees } of tuiles) {
    lignesTexte.push(
      `Tuile ${nom} = {`,
      ...rangees.map((r) => `  "${r}",`),
      '};',
      '',
    )
  }

  return lignesTexte.join('\n')
}

/**
 * Les IMAGES d'un GIF animé, chacune réduite à `cote` pixels — jusqu'à `maxi`.
 *
 * Rend { images: [rangées…], vitesse } : la vitesse est la durée d'une image
 * du GIF, comptée en images de la console (1/60 s). Un GIF d'une seule image
 * rend une seule tuile, comme un PNG.
 *
 * Il faut au navigateur l'`ImageDecoder` (Chrome, Edge) : les autres ne savent
 * montrer que la première image d'un GIF, et le dire vaut mieux que d'importer
 * une animation qui ne bouge pas.
 */
export async function imagesDUnGif(fichier, cote, maxi = 8) {
  if (typeof ImageDecoder === 'undefined') {
    throw new Error('ce navigateur ne sait pas lire les images d’un GIF une par une — Chrome ou Edge le savent')
  }
  const decodeur = new ImageDecoder({ data: await fichier.arrayBuffer(), type: fichier.type || 'image/gif' })
  await decodeur.tracks.ready
  const nombre = Math.min(maxi, decodeur.tracks.selectedTrack?.frameCount ?? 1)
  const toile = document.createElement('canvas')
  toile.width = cote
  toile.height = cote
  const ctx = toile.getContext('2d', { willReadFrequently: true })
  const images = []
  let duree = 0
  for (let k = 0; k < nombre; k++) {
    const { image } = await decodeur.decode({ frameIndex: k })
    ctx.clearRect(0, 0, cote, cote)
    ctx.drawImage(image, 0, 0, cote, cote)
    duree += image.duration ?? 100000
    image.close()
    const pixels = ctx.getImageData(0, 0, cote, cote).data
    const rangees = []
    for (let y = 0; y < cote; y++) {
      let rangee = ''
      for (let x = 0; x < cote; x++) {
        const i = (y * cote + x) * 4
        rangee += SIGNES[nuanceDuPixel(pixels[i], pixels[i + 1], pixels[i + 2], pixels[i + 3])]
      }
      rangees.push(rangee)
    }
    images.push(rangees)
  }
  decodeur.close()
  const vitesse = Math.max(2, Math.min(60, Math.round((duree / nombre) / 1e6 * 60)))
  return { images, vitesse }
}

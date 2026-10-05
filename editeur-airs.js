/**
 * Écrire une mélodie à la souris, plutôt que de taper des noms de notes.
 *
 * C'est le pendant de l'atelier de tuiles, pour le son : le programme reste la
 * source. Ce module lit les « Air NOM = {…} » du texte, les montre sous forme
 * de partition, et **réécrit le texte** quand on pose une note. Il n'y a pas
 * de second endroit où vivrait la musique — un éditeur qui garderait la
 * sienne de son côté finirait par ne plus dire la même chose que le code.
 *
 * Les hauteurs sont celles du compilateur, importées de lui : si la table des
 * notes change un jour, l'atelier changera avec elle plutôt que de mentir.
 */

import { NOTES } from './compilateur/emetteur.js'
import { poserDansLeProgramme } from './programme.js'
import { airsDepuisMidi, airDepuisEchantillons, texteDUnAir } from './importer-son.js'

/** Les noms des hauteurs, du grave à l'aigu — DO2 à SI6. */
export const HAUTEURS = Object.keys(NOTES).sort((a, b) => NOTES[a] - NOTES[b])

/** Les deux pas qui ne sont pas des notes. */
export const SILENCE = '--'
export const TENIR = '=='

/** Les douze demi-tons, et lesquels sont les touches noires d'un clavier. */
const DEMI_TONS = ['DO', 'DOD', 'RE', 'RED', 'MI', 'FA', 'FAD', 'SOL', 'SOLD', 'LA', 'LAD', 'SI']
const NOIRE = new Set([1, 3, 6, 8, 10])

/** La fréquence d'une hauteur, en hertz. DO2 est le MIDI 36, le LA4 fait 440. */
export function hertzDe(numero) {
  return 440 * Math.pow(2, (36 + numero - 69) / 12)
}

const MOTIF = /\bAir\s+([A-Za-z_][\w]*)\s*=\s*\{([\s\S]*?)\}\s*;/g

/**
 * Retrouve les airs écrits dans un programme.
 *
 * Rend, pour chacun : son nom, ses pas, et où il se trouve dans le texte —
 * c'est cette position qui permet de le réécrire sans toucher au reste.
 *
 * Un pas mal écrit n'est pas corrigé en douce : il devient un silence dans
 * l'atelier, et le compilateur, lui, le refusera avec son numéro de ligne.
 * Deux avis valent mieux qu'une réparation silencieuse.
 */
export function lireAirs(source) {
  const trouves = []
  MOTIF.lastIndex = 0
  let coup

  while ((coup = MOTIF.exec(source)) !== null) {
    const ecrits = [...coup[2].matchAll(/"([^"]*)"|'([^']*)'/g)].map((m) => m[1] ?? m[2])
    if (ecrits.length === 0) continue

    trouves.push({
      nom: coup[1],
      pas: ecrits.map(lirePas),
      debut: coup.index,
      fin: coup.index + coup[0].length,
    })
  }

  return trouves
}

/** « DO4 12 » → { hauteur: 24, volume: 12 }. */
export function lirePas(ecrit) {
  const morceaux = ecrit.trim().split(/\s+/)
  const nom = morceaux[0] ?? ''
  const volume = morceaux.length > 1 && Number.isInteger(Number(morceaux[1]))
    ? Math.max(0, Math.min(15, Number(morceaux[1])))
    : 12

  if (nom === TENIR) return { hauteur: TENIR, volume }
  if (nom in NOTES) return { hauteur: NOTES[nom], volume }
  return { hauteur: SILENCE, volume }
}

/** L'inverse : { hauteur: 24, volume: 12 } → « DO4 12 ». */
export function ecrirePas(pas) {
  if (pas.hauteur === SILENCE) return SILENCE
  if (pas.hauteur === TENIR) return TENIR
  return `${HAUTEURS[pas.hauteur]} ${pas.volume}`
}

/**
 * Réécrit un air dans le texte, en gardant l'indentation d'origine.
 *
 * Huit pas par ligne, alignés en colonnes : une partition se lit en mesures,
 * et une ligne de trente-deux pas ne se lit pas du tout.
 */
export function remplacerAir(source, air, pas) {
  const avant = source.slice(0, air.debut)
  const debutDeLigne = avant.lastIndexOf('\n') + 1
  const marge = avant.slice(debutDeLigne).match(/^[ \t]*/)[0]

  const ecrits = pas.map(ecrirePas)
  const large = Math.max(...ecrits.map((e) => e.length))
  const lignes = []
  for (let i = 0; i < ecrits.length; i += 8) {
    const groupe = ecrits.slice(i, i + 8).map((e) => `"${e}",`.padEnd(large + 4))
    lignes.push(marge + '  ' + groupe.join('').trimEnd())
  }

  const texte = [`Air ${air.nom} = {`, ...lignes, `${marge}};`].join('\n')
  return source.slice(0, air.debut) + texte + source.slice(air.fin)
}

/** Un air tout neuf — huit pas de silence, ajouté à la suite des autres. */
export function ajouterAir(source, nom, pas = 8) {
  const airs = lireAirs(source)
  const vide = { nom, debut: 0, fin: 0 }
  const bloc = remplacerAir('', vide, Array.from({ length: pas }, () => ({ hauteur: SILENCE, volume: 12 })))

  /* Le premier air se pose sous l’en-tête, pas au-dessus : même règle que
     pour les dessins, et le même endroit qui la porte. */
  const dernier = airs[airs.length - 1]
  return poserDansLeProgramme(source, bloc, dernier ? dernier.fin : null)
}

/* ------------------------------------------------------------ l'écoute */

/**
 * Faire entendre un air TOUT DE SUITE, sans passer par la cartouche.
 *
 * Compiler pour s'entendre coûte une seconde ; une seconde entre le geste et
 * le son suffit à rendre l'écriture d'une mélodie pénible. La page joue donc
 * elle-même, avec un signal carré — le même que celui de la console — et la
 * cartouche, elle, reste la vérité.
 */
export function ecouter({ contexte, sortie, pas, vitesse, surPas, surFin }) {
  const debut = contexte.currentTime + 0.05
  const duree = vitesse / 60 // la console compte en images
  const sources = []

  let i = 0
  while (i < pas.length) {
    const courant = pas[i]
    if (courant.hauteur === SILENCE || courant.hauteur === TENIR || courant.volume === 0) { i++; continue }

    /* Les « == » qui suivent allongent la note au lieu d'en rejouer une : c'est
       exactement ce que fait le séquenceur de la cartouche. */
    let tenue = 1
    while (i + tenue < pas.length && pas[i + tenue].hauteur === TENIR) tenue++

    const oscillateur = contexte.createOscillator()
    oscillateur.type = 'square'
    oscillateur.frequency.value = hertzDe(courant.hauteur)

    const gain = contexte.createGain()
    /* Une attaque et une chute très courtes : sans elles, chaque note commence
       et finit par un claquement, qu'on finit par prendre pour une percussion. */
    const t = debut + i * duree
    const fin = t + tenue * duree
    const fort = (courant.volume / 15) * 0.22
    gain.gain.setValueAtTime(0, t)
    gain.gain.linearRampToValueAtTime(fort, t + 0.005)
    gain.gain.setValueAtTime(fort, Math.max(t + 0.006, fin - 0.01))
    gain.gain.linearRampToValueAtTime(0, fin)

    oscillateur.connect(gain)
    gain.connect(sortie)
    oscillateur.start(t)
    oscillateur.stop(fin + 0.02)
    sources.push(oscillateur)

    i += tenue
  }

  /* Le curseur qui court sur la partition suit l'horloge du son, et non celle
     des images : c'est la seule qui soit d'accord avec ce qu'on entend. */
  let vivant = true
  const suivre = () => {
    if (!vivant) return
    const ecoule = contexte.currentTime - debut
    const pasCourant = Math.floor(ecoule / duree)
    if (pasCourant >= pas.length) { vivant = false; surFin(); return }
    surPas(Math.max(0, pasCourant))
    requestAnimationFrame(suivre)
  }
  requestAnimationFrame(suivre)

  return () => {
    vivant = false
    for (const source of sources) { try { source.stop() } catch { /* déjà finie */ } }
    surFin()
  }
}

/* ------------------------------------------------------------ l'atelier */

const LARGEUR_PAS = 18
const HAUTEUR_RANG = 9
const RANGS = 24 // deux octaves à l'écran ; les boutons déplacent la fenêtre
const CLAVIER = 38 // le clavier dessiné à gauche
const HAUTEUR_VOLUMES = 40

/**
 * Installe l'atelier des airs.
 *
 * `lireSource` et `ecrireSource` sont fournis par la page : le module ne
 * connaît pas le champ de texte, il ne connaît que le programme. `audio` rend
 * de quoi jouer — la page ouvre la sortie sonore au premier geste, comme le
 * navigateur l'exige.
 */
export function installer({ bande, atelier, lireSource, ecrireSource, surChangement, audio, demanderUnNom }) {
  let choisi = null // le nom de l'air en cours d'écriture
  let outil = 'note' // « note », « -- » ou « == »
  let volume = 12
  let vitesse = 8
  let basse = 24 // la hauteur du bas de la fenêtre : DO4
  let curseur = -1 // le pas que l'on entend, pendant l'écoute
  let arreter = null
  let pose = false

  const airs = () => lireAirs(lireSource())
  const airChoisi = () => airs().find((a) => a.nom === choisi) ?? null

  /** Écrire les pas dans le programme, sans recompiler tout de suite. */
  const poser = (air, pas) => ecrireSource(remplacerAir(lireSource(), air, pas))

  /* --- la bande des airs --- */

  function rafraichirBande() {
    const liste = airs()
    bande.textContent = ''

    /* Un air est TOUJOURS ouvert, dès qu'il en existe un.
       L'atelier s'ouvrait sur une bande de vignettes et une grande place vide,
       avec « clique un air ci-dessus » en petit et en gris. On cherchait
       l'éditeur de musique en le regardant. */
    if (choisi === null && liste.length > 0) choisi = liste[0].nom

    if (liste.length === 0) {
      const vide = document.createElement('p')
      vide.className = 'aide'
      vide.textContent =
        'Aucun air dans ce programme. « + air » en ajoute un, et le code apparaît dans l’éditeur : ' +
        'Air NOM = { "DO4 12", … };'
      bande.append(vide)
    }

    for (const air of liste) {
      const bouton = document.createElement('button')
      bouton.type = 'button'
      bouton.className = 'air' + (air.nom === choisi ? ' choisi' : '')
      bouton.title = `${air.nom} — ${air.pas.length} pas — jouer(1, ${air.nom}, ${vitesse});`

      const canevas = document.createElement('canvas')
      canevas.width = 64
      canevas.height = 26
      apercu(canevas, air.pas)

      const nom = document.createElement('span')
      nom.textContent = air.nom

      bouton.append(canevas, nom)
      bouton.addEventListener('click', () => {
        stopper()
        choisi = air.nom
        rafraichirBande()
        rafraichirAtelier()
      })
      bande.append(bouton)
    }

    const neuf = document.createElement('button')
    neuf.type = 'button'
    neuf.className = 'air neuf'
    neuf.textContent = '+ air'
    neuf.addEventListener('click', async () => {
      const pris = new Set(airs().map((a) => a.nom))
      let n = 1
      while (pris.has('AIR' + n)) n++

      /* Le nom est demandé : « AIR1 » ne dit pas si c'est le thème ou la
         fanfare, et l'on ne renomme jamais après coup. */
      const nom = demanderUnNom
        ? await demanderUnNom({ quoi: 'ton air', propose: 'AIR' + n, pris })
        : 'AIR' + n
      if (!nom) return

      choisi = nom
      ecrireSource(ajouterAir(lireSource(), choisi))
      rafraichirBande()
      rafraichirAtelier()
      surChangement()
    })
    bande.append(neuf, importerMidi, importerWav, dire)
  }

  /*
   * 📥 Importer : un MIDI (exact — la mélodie et la basse, deux airs) ou un
   * WAV (approximatif — la hauteur de chaque morceau de son). Les champs sont
   * faits une fois : le glisser-déposer de la page s'en sert aussi (#fichier-midi).
   */
  function champ(id, accept) {
    const c = document.getElementById(id) ?? document.createElement('input')
    c.type = 'file'
    c.id = id
    c.accept = accept
    c.hidden = true
    if (!c.isConnected) document.body.append(c)
    return c
  }
  const champMidi = champ('fichier-midi', '.mid,.midi,audio/midi')
  const champWav = champ('fichier-wav', '.wav,.mp3,.ogg,audio/*')
  const dire = document.createElement('span')
  dire.className = 'aide'
  const bouton = (texte, titre, action) => {
    const b = document.createElement('button')
    b.type = 'button'
    b.className = 'air neuf'
    b.textContent = texte
    b.title = titre
    b.addEventListener('click', action)
    return b
  }
  const importerMidi = bouton('📥 MIDI', 'importer un fichier MIDI : sa mélodie et sa basse deviennent deux airs (exact)', () => champMidi.click())
  const importerWav = bouton('📥 WAV', 'importer un son enregistré : sa hauteur, morceau par morceau, devient un air (approximatif : la console n’a que deux voix carrées)', () => champWav.click())
  async function nommer(fichier) {
    const pris = new Set(airs().map((a) => a.nom))
    const propose = (fichier.name.replace(/.[^.]+$/, '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 12)) || 'MUSIQUE'
    return demanderUnNom ? demanderUnNom({ quoi: 'la musique importée', propose: /^[A-Z]/.test(propose) ? propose : 'M' + propose, pris }) : propose
  }
  function poserLesAirs(blocs, premier, message) {
    let texte = lireSource()
    for (const bloc of blocs) {
      const dernier = lireAirs(texte).at(-1)
      texte = poserDansLeProgramme(texte, bloc, dernier ? dernier.fin : null)
    }
    ecrireSource(texte)
    choisi = premier
    dire.textContent = message
    rafraichirBande()
    rafraichirAtelier()
    surChangement()
  }
  champMidi.addEventListener('change', async () => {
    const fichier = champMidi.files[0]
    champMidi.value = ''
    if (!fichier) return
    let r
    try { r = airsDepuisMidi(await fichier.arrayBuffer()) } catch (erreur) { alert(erreur.message); return }
    const nom = await nommer(fichier)
    if (!nom) return
    const blocs = [texteDUnAir(nom, r.melodie, `importé de ${fichier.name} : la mélodie — jouer(1, ${nom}, ${r.vitesse}, 1);`)]
    if (r.basse) blocs.push(texteDUnAir(nom + 'B', r.basse, `importé de ${fichier.name} : la basse — jouer(2, ${nom}B, ${r.vitesse}, 1);`))
    poserLesAirs(blocs, nom, `${fichier.name} → ${nom}${r.basse ? ` et ${nom}B (la basse)` : ''}, vitesse ${r.vitesse}${r.tronque ? ' — coupé à 256 pas' : ''}.`)
  })
  champWav.addEventListener('change', async () => {
    const fichier = champWav.files[0]
    champWav.value = ''
    if (!fichier) return
    let r
    try {
      const contexte = new (window.OfflineAudioContext ?? window.webkitOfflineAudioContext)(1, 1, 22050)
      const son = await contexte.decodeAudioData(await fichier.arrayBuffer())
      r = airDepuisEchantillons(son.getChannelData(0), son.sampleRate)
    } catch (erreur) { alert(`Ce son n’a pas pu être lu : ${erreur.message}`); return }
    const nom = await nommer(fichier)
    if (!nom) return
    poserLesAirs([texteDUnAir(nom, r.pas, `importé de ${fichier.name} (approximatif) — jouer(1, ${nom}, ${r.vitesse}, 1);`)], nom,
      `${fichier.name} → ${nom}, vitesse ${r.vitesse}${r.tronque ? ' — coupé à 256 pas' : ''}. Approximatif : retouche les notes dans la partition.`)
  })

  /** Un air en miniature : un point par pas, à sa hauteur. */
  function apercu(canevas, pas) {
    const ctx = canevas.getContext('2d')
    ctx.fillStyle = '#0b0d10'
    ctx.fillRect(0, 0, canevas.width, canevas.height)

    const notes = pas.filter((p) => typeof p.hauteur === 'number')
    if (notes.length === 0) return
    const bas = Math.min(...notes.map((p) => p.hauteur))
    const haut = Math.max(...notes.map((p) => p.hauteur))
    const large = Math.max(1, canevas.width / pas.length)
    const echelle = haut > bas ? (canevas.height - 6) / (haut - bas) : 0

    pas.forEach((p, i) => {
      if (typeof p.hauteur !== 'number') return
      ctx.fillStyle = teinte(p.volume)
      const y = canevas.height - 3 - (p.hauteur - bas) * echelle
      ctx.fillRect(i * large, y - 2, Math.max(1, large - 0.5), 3)
    })
  }

  /** Du sombre au clair selon le volume : on voit une nuance sans la lire. */
  const teinte = (v) => `hsl(84 45% ${18 + (v / 15) * 42}%)`

  /* --- la partition --- */

  function rafraichirAtelier() {
    atelier.textContent = ''

    const air = airChoisi()
    if (!air) {
      atelier.classList.add('vide')
      const aide = document.createElement('p')
      aide.className = 'aide'
      aide.textContent = 'Clique un air ci-dessus pour l’écrire.'
      atelier.append(aide)
      return
    }
    atelier.classList.remove('vide')

    /* --- la barre d'outils --- */
    const barre = document.createElement('div')
    barre.className = 'rangee outils'

    const titre = document.createElement('strong')
    titre.textContent = air.nom

    const ecoute = document.createElement('button')
    ecoute.type = 'button'
    ecoute.className = 'principal'
    ecoute.textContent = arreter ? '⏹ Arrêter' : '▶ Écouter'
    ecoute.addEventListener('click', () => (arreter ? stopper() : lancer()))

    barre.append(titre, ecoute)

    for (const [nom, etiquette, titreOutil] of [
      ['note', '♪ note', 'poser une note'],
      [SILENCE, '– silence', 'faire taire la voix : « -- »'],
      [TENIR, '= tenir', 'laisser la note d’avant continuer : « == »'],
    ]) {
      const bouton = document.createElement('button')
      bouton.type = 'button'
      bouton.className = 'outil' + (outil === nom ? ' choisi' : '')
      bouton.textContent = etiquette
      bouton.title = titreOutil
      bouton.addEventListener('click', () => { outil = nom; rafraichirAtelier() })
      barre.append(bouton)
    }

    const octaveBas = boutonPetit('▼', 'descendre d’une octave', () => {
      basse = Math.max(0, basse - 12)
      rafraichirAtelier()
    })
    const octaveHaut = boutonPetit('▲', 'monter d’une octave', () => {
      basse = Math.min(HAUTEURS.length - RANGS, basse + 12)
      rafraichirAtelier()
    })
    const moins = boutonPetit('− pas', 'ôter quatre pas', () => {
      const pas = airChoisi().pas
      if (pas.length <= 4) return
      poser(airChoisi(), pas.slice(0, pas.length - 4))
      rafraichirTout()
    })
    const plus = boutonPetit('+ pas', 'ajouter quatre pas', () => {
      const pas = airChoisi().pas
      if (pas.length >= 128) return
      poser(airChoisi(), [...pas, ...Array.from({ length: 4 }, () => ({ hauteur: SILENCE, volume: volume }))])
      rafraichirTout()
    })

    barre.append(octaveBas, octaveHaut, moins, plus)

    const reglage = document.createElement('label')
    reglage.className = 'aide reglage'
    const champ = document.createElement('input')
    champ.type = 'number'
    champ.min = '1'
    champ.max = '60'
    champ.value = String(vitesse)
    champ.addEventListener('input', () => {
      vitesse = Math.max(1, Math.min(60, Number(champ.value) || 8))
      appel.textContent = `jouer(1, ${air.nom}, ${vitesse});`
    })
    reglage.append(champ, document.createTextNode(' images par pas'))
    barre.append(reglage)

    /* --- la partition elle-même --- */
    const cadre = document.createElement('div')
    cadre.className = 'partition'

    const canevas = document.createElement('canvas')
    canevas.width = CLAVIER + air.pas.length * LARGEUR_PAS
    canevas.height = RANGS * HAUTEUR_RANG + HAUTEUR_VOLUMES + 14
    canevas.className = 'toile-air'
    canevas.addEventListener('contextmenu', (e) => e.preventDefault())
    cadre.append(canevas)

    /* La ligne à recopier dans le programme : c'est elle qui relie ce qu'on
       vient d'écrire à la cartouche, et elle suit la vitesse choisie. */
    const legende = document.createElement('p')
    legende.className = 'aide'
    const appel = document.createElement('code')
    appel.textContent = `jouer(1, ${air.nom}, ${vitesse});`
    legende.append(
      appel,
      document.createTextNode(' — le quatrième argument, 1, le fait recommencer sans fin.'),
    )

    const explication = document.createElement('p')
    explication.className = 'aide'
    explication.innerHTML =
      'Clique la partition pour poser une note ; le bas de la grille règle le <b>volume</b> du pas. ' +
      'Le clic droit fait taire un pas. <code>==</code> tient la note d’avant — c’est ainsi qu’on écrit une blanche.'

    atelier.append(barre, cadre, legende, explication)

    dessiner(canevas, air)

    /* --- la souris --- */
    const ou = (evenement) => {
      const boite = canevas.getBoundingClientRect()
      const x = ((evenement.clientX - boite.left) / boite.width) * canevas.width
      const y = ((evenement.clientY - boite.top) / boite.height) * canevas.height
      const pas = Math.floor((x - CLAVIER) / LARGEUR_PAS)
      if (pas < 0 || pas >= air.pas.length) return null
      return { pas, y, x }
    }

    const agir = (evenement) => {
      const place = ou(evenement)
      if (!place) return
      const courant = airChoisi()
      if (!courant) return
      const pas = courant.pas.map((p) => ({ ...p }))
      const zoneVolume = y0Volumes(canevas)

      if (evenement.buttons === 2 || evenement.button === 2) {
        pas[place.pas].hauteur = SILENCE
      } else if (place.y >= zoneVolume) {
        /* Sous la grille : la hauteur du clic est le volume, comme une console
           de mixage — plus haut, plus fort. */
        const part = 1 - (place.y - zoneVolume) / HAUTEUR_VOLUMES
        volume = Math.max(0, Math.min(15, Math.round(part * 15)))
        pas[place.pas].volume = volume
      } else if (outil === 'note') {
        const rang = Math.floor(place.y / HAUTEUR_RANG)
        const hauteur = basse + (RANGS - 1 - rang)
        if (hauteur < 0 || hauteur >= HAUTEURS.length) return
        pas[place.pas] = { hauteur, volume }
      } else {
        pas[place.pas].hauteur = outil
      }

      poser(courant, pas)
      dessiner(canevas, { ...courant, pas })
    }

    canevas.addEventListener('pointerdown', (e) => {
      pose = true
      canevas.setPointerCapture(e.pointerId)
      agir(e)
    })
    canevas.addEventListener('pointermove', (e) => { if (pose) agir(e) })
    const relacher = () => {
      if (!pose) return
      pose = false
      /* On ne recompile qu'au relâché : sinon la partie repart à chaque note. */
      surChangement()
      rafraichirBande()
    }
    canevas.addEventListener('pointerup', relacher)
    canevas.addEventListener('pointercancel', relacher)

    canevasCourant = canevas
  }

  let canevasCourant = null
  const y0Volumes = (canevas) => canevas.height - HAUTEUR_VOLUMES

  function boutonPetit(texte, titre, action) {
    const bouton = document.createElement('button')
    bouton.type = 'button'
    bouton.className = 'petit'
    bouton.textContent = texte
    bouton.title = titre
    bouton.addEventListener('click', action)
    return bouton
  }

  /** Dessine la partition : le clavier, la grille, les notes, les volumes. */
  function dessiner(canevas, air) {
    const ctx = canevas.getContext('2d')
    const hautVolumes = y0Volumes(canevas)

    ctx.fillStyle = '#0b0d10'
    ctx.fillRect(0, 0, canevas.width, canevas.height)

    /* Le clavier, à gauche : les touches noires se voient, et l'on sait où
       l'on est sans compter les lignes. */
    for (let rang = 0; rang < RANGS; rang++) {
      const hauteur = basse + (RANGS - 1 - rang)
      const demi = hauteur % 12
      const y = rang * HAUTEUR_RANG
      ctx.fillStyle = NOIRE.has(demi) ? '#171a21' : '#20242e'
      ctx.fillRect(0, y, CLAVIER, HAUTEUR_RANG - 1)
      if (demi === 0) {
        ctx.fillStyle = '#8b93a5'
        ctx.font = '8px ui-monospace, monospace'
        ctx.fillText(HAUTEURS[hauteur] ?? '', 3, y + HAUTEUR_RANG - 2)
      }
      /* Les rangées de la grille, à peine visibles, mais alignées. */
      ctx.fillStyle = NOIRE.has(demi) ? '#12151b' : '#161a21'
      ctx.fillRect(CLAVIER, y, canevas.width - CLAVIER, HAUTEUR_RANG - 1)
    }

    /* Les mesures, tous les quatre pas : sans elles, on perd le compte. */
    for (let i = 0; i <= air.pas.length; i += 4) {
      ctx.fillStyle = i % 16 === 0 ? '#3b4354' : '#232733'
      ctx.fillRect(CLAVIER + i * LARGEUR_PAS, 0, 1, hautVolumes)
    }

    /* Les notes. Une note tenue se prolonge par un trait, sans nouvelle tête :
       c'est ce qu'on entend, et donc ce qu'il faut voir. */
    air.pas.forEach((p, i) => {
      const x = CLAVIER + i * LARGEUR_PAS

      if (p.hauteur === TENIR) {
        const avant = hauteurTenue(air.pas, i)
        if (avant !== null && avant >= basse && avant < basse + RANGS) {
          const y = (RANGS - 1 - (avant - basse)) * HAUTEUR_RANG
          ctx.fillStyle = '#3d6b47'
          ctx.fillRect(x, y + 2, LARGEUR_PAS - 1, HAUTEUR_RANG - 5)
        }
        return
      }
      if (p.hauteur === SILENCE) return
      if (p.hauteur < basse || p.hauteur >= basse + RANGS) {
        /* Hors de la fenêtre : une flèche au bord, pour ne pas croire le pas vide. */
        ctx.fillStyle = '#5d6577'
        ctx.fillRect(x + 4, p.hauteur < basse ? hautVolumes - 4 : 1, LARGEUR_PAS - 9, 3)
        return
      }
      const y = (RANGS - 1 - (p.hauteur - basse)) * HAUTEUR_RANG
      ctx.fillStyle = teinte(p.volume)
      ctx.fillRect(x, y, LARGEUR_PAS - 1, HAUTEUR_RANG - 1)
    })

    /* Les volumes, en bas : une barre par pas. */
    ctx.fillStyle = '#161a21'
    ctx.fillRect(CLAVIER, hautVolumes, canevas.width - CLAVIER, HAUTEUR_VOLUMES)
    ctx.fillStyle = '#8b93a5'
    ctx.font = '8px ui-monospace, monospace'
    ctx.fillText('vol', 3, hautVolumes + 12)

    air.pas.forEach((p, i) => {
      if (p.hauteur === SILENCE) return
      const x = CLAVIER + i * LARGEUR_PAS
      const haut = Math.round((p.volume / 15) * (HAUTEUR_VOLUMES - 4))
      ctx.fillStyle = teinte(p.volume)
      ctx.fillRect(x + 2, hautVolumes + HAUTEUR_VOLUMES - 2 - haut, LARGEUR_PAS - 5, haut)
    })

    /* Les numéros de pas, dans la bande qui sépare la grille des volumes. */
    ctx.fillStyle = '#5d6577'
    for (let i = 0; i < air.pas.length; i += 4) {
      ctx.fillText(String(i), CLAVIER + i * LARGEUR_PAS + 2, hautVolumes - 4)
    }

    if (curseur >= 0 && curseur < air.pas.length) {
      ctx.fillStyle = '#9bbc5a33'
      ctx.fillRect(CLAVIER + curseur * LARGEUR_PAS, 0, LARGEUR_PAS - 1, canevas.height)
    }
  }

  /** La hauteur qu'un « == » prolonge : celle de la dernière vraie note. */
  function hauteurTenue(pas, i) {
    for (let k = i - 1; k >= 0; k--) {
      if (typeof pas[k].hauteur === 'number') return pas[k].hauteur
      if (pas[k].hauteur === SILENCE) return null
    }
    return null
  }

  /* --- l'écoute --- */

  function lancer() {
    const air = airChoisi()
    if (!air) return
    const sortie = audio()
    if (!sortie) return
    stopper()

    arreter = ecouter({
      ...sortie,
      pas: air.pas,
      vitesse,
      surPas: (i) => {
        if (i === curseur) return
        curseur = i
        if (canevasCourant) dessiner(canevasCourant, airChoisi() ?? air)
      },
      surFin: () => {
        arreter = null
        curseur = -1
        rafraichirAtelier()
      },
    })
    rafraichirAtelier()
  }

  function stopper() {
    if (!arreter) return
    const finir = arreter
    arreter = null
    curseur = -1
    finir()
  }

  const rafraichirTout = () => { rafraichirBande(); rafraichirAtelier() }

  rafraichirTout()

  return {
    rafraichir() {
      /* Le texte a pu changer sous nos pieds — un autre exemple chargé, une
         retouche à la main. Un air disparu ne reste pas sélectionné. */
      if (choisi && !airChoisi()) { stopper(); choisi = null }
      rafraichirTout()
    },
    /* Ouvrir un air par son nom (l'onglet « Tout le jeu »). */
    choisir(nom) {
      stopper()
      choisi = nom
      if (!airChoisi()) choisi = null
      rafraichirTout()
    },
    arreter: stopper,
  }
}

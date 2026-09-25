/**
 * La barre de couleurs, comme dans Paint — avec les HUIT PALETTES du jeu (0 à 7).
 *
 * La console range les couleurs en palettes de quatre, et chaque tuile (chaque
 * carré de la carte, chaque quart de personnage) prend UNE palette. Le jeu en
 * a quatre, pour le décor comme pour les personnages : on les voit toutes, en
 * quatre rangées numérotées de 1 à 4.
 *
 * Un clic sur une pastille : on dessine avec cette couleur, et ce qu'on peint
 * prend cette palette. « 🎨 Changer cette couleur » change la couleur elle-même
 * — partout où la palette sert, puisque c'est ainsi que la console fonctionne.
 * Plus de rangement caché, plus de refus, plus de fusion : ce qu'on voit est
 * exactement ce que la console a.
 *
 * Sur une Game Boy d'origine, il n'y a que quatre nuances : une seule rangée.
 */

import { versDiese, depuisDiese, VARIETES, VARIETES_LUTINS, THEMES } from './editeur-couleurs.js'

/** Les quatre nuances de la Game Boy d'origine, en composantes de 0 à 31. */
const NUANCES_GB = [[28, 31, 26], [17, 24, 14], [6, 13, 10], [1, 3, 4]]

/** Combien de palettes le jeu emploie : huit (0 à 7) — tout ce que la Game Boy Color a, pour le décor comme pour les personnages. */
export const NOMBRE_DE_PALETTES = 8

/*
 * Le dernier message de chaque barre, et jusqu'à quand le montrer : une barre
 * est reconstruite à chaque recompilation, et le message ne doit pas partir
 * avec elle avant qu'on ait pu le lire.
 */
const MESSAGES = new Map()
/* Le panneau des variétés reste ouvert d'une reconstruction de la barre à l'autre. */
const VARIETES_OUVERTES = new Map()
const THEMES_OUVERTS = new Map()
const DUREE = 6000

/**
 * Construit la barre.
 *
 *   couleur      faux : Game Boy d'origine — les quatre nuances seulement
 *   palettes     en couleur : les palettes, chacune quatre [r, v, b] de 0 à 31
 *                (seules les NOMBRE_DE_PALETTES premières sont montrées)
 *   choix        { p, n } : la palette et le numéro de la couleur en main
 *                (sans couleur : p est ignoré, n est la nuance)
 *   lutins       vrai : les palettes des personnages — le n° 0 est transparent
 *   surChoix(p, n)                 une pastille a été cliquée
 *   surChangerCouleur(p, n, rvb)   « 🎨 Changer cette couleur »
 *   surVariete(p, palette)         une variété toute prête mise dans la palette p
 *   surTheme(theme)                un thème : les 8 palettes du décor ET des personnages d'un coup
 *
 * Elle rend aussi `barre.dire(texte, genre)` — un message sous les pastilles —
 * et `barre.ici(texte)` — ce qu'on survole (« BRIQUE → palette 2 »).
 */
export function barrePaint({ couleur, palettes = [], choix = { p: 0, n: 3 }, lutins = false, surChoix, surChangerCouleur = () => {}, surVariete = () => {}, surTheme = () => {}, cle = 'barre' }) {
  const barre = document.createElement('div')
  barre.className = 'barre-paint'

  /* Le mode, dit en grand : en couleur (les 8 palettes), ou en quatre nuances. */
  const mode = document.createElement('div')
  mode.className = 'paint-mode ' + (couleur ? 'couleur' : 'nuances')
  const titreMode = document.createElement('b')
  titreMode.textContent = couleur ? '🌈 En couleur — 8 palettes (0 à 7)' : '🎮 Game Boy — 4 nuances'
  const ditMode = document.createElement('small')
  ditMode.textContent = couleur
    ? (lutins
      ? 'Les personnages ont 8 palettes de 3 couleurs + le transparent. Chaque quart 8 × 8 du personnage prend l’une d’elles : celle de la couleur avec laquelle tu y peins. La 0 est la normale.'
      : 'Le décor a 8 palettes de 4 couleurs — c’est le maximum de la Game Boy Color. Chaque tuile, chaque carré de 8 × 8 de la carte, prend l’une d’elles : celle de la couleur avec laquelle tu y peins. La 0 est la normale.')
    : 'Les quatre nuances de la console d’origine, et rien de plus.'
  const changer = document.createElement('button')
  changer.type = 'button'
  changer.textContent = couleur ? '🎮 Passer en 4 nuances' : '🌈 Passer en couleur'
  changer.title = 'le même choix qu’en haut de la page — ton dessin est gardé'
  changer.addEventListener('click', () => document.dispatchEvent(new CustomEvent('gameboy3:console', { detail: couleur ? 'gb' : 'gbc' })))
  mode.append(titreMode, ditMode, changer)
  barre.append(mode)

  const p = couleur ? Math.min(NOMBRE_DE_PALETTES - 1, Math.max(0, choix.p)) : 0
  const n = choix.n
  const transparente = couleur && lutins && n === 0
  const enMain = couleur ? palettes[p]?.[n] : NUANCES_GB[n]

  /* La couleur en main, en grand, et d'où elle vient. */
  const tenue = document.createElement('div')
  tenue.className = 'paint-choisie'
  const carre = document.createElement('span')
  carre.className = 'paint-carre' + (transparente ? ' vide' : '')
  if (!transparente && enMain) carre.style.background = versDiese(enMain)
  const dit = document.createElement('small')
  dit.textContent = couleur ? `palette ${p}, couleur ${n}${transparente ? ' — transparent' : ''}` : `nuance ${n}`
  tenue.append(carre, dit)
  barre.append(tenue)

  /* Les palettes, une rangée chacune. */
  const grille = document.createElement('div')
  grille.className = 'paint-palettes'
  const lesPalettes = couleur ? palettes.slice(0, NOMBRE_DE_PALETTES) : [NUANCES_GB]
  lesPalettes.forEach((palette, i) => {
    const groupe = document.createElement('div')
    groupe.className = 'paint-groupe' + (i === p ? ' active' : '')
    groupe.dataset.palette = String(i)
    const numero = document.createElement('b')
    numero.textContent = couleur ? `Palette ${i}` : 'Nuances'
    groupe.append(numero)
    palette.forEach((c, k) => {
      const pastille = document.createElement('button')
      pastille.type = 'button'
      const vide = couleur && lutins && k === 0
      pastille.className = 'paint-pastille' + (i === p && k === n ? ' choisie' : '') + (vide ? ' vide' : '')
      if (!vide) pastille.style.background = versDiese(c)
      pastille.dataset.palette = String(i)
      pastille.dataset.numero = String(k)
      pastille.title = couleur
        ? `palette ${i}, couleur ${k}${vide ? ' — transparent : le décor se voit au travers' : ` — ${versDiese(c)}`}`
        : `nuance ${k}`
      pastille.addEventListener('click', () => surChoix(couleur ? i : 0, k))
      groupe.append(pastille)
    })
    grille.append(groupe)
  })
  barre.append(grille)

  /* Changer une couleur d'une palette : partout où elle sert, elle change. */
  if (couleur) {
    const droite = document.createElement('div')
    droite.className = 'paint-droite'
    const selecteur = document.createElement('input')
    selecteur.type = 'color'
    selecteur.hidden = true
    selecteur.value = enMain && !transparente ? versDiese(enMain) : '#ffffff'
    selecteur.addEventListener('change', () => surChangerCouleur(p, n, depuisDiese(selecteur.value)))
    const autre = document.createElement('button')
    autre.type = 'button'
    autre.className = 'paint-autre'
    autre.textContent = '🎨 Changer cette couleur'
    autre.disabled = transparente
    autre.title = transparente
      ? 'le n° 0 d’une palette de personnage est le transparent : il ne se change pas'
      : `change la couleur ${n} de la palette ${p} — pour ce dessin seulement : si d’autres s’en servent, il reçoit une copie de la palette`
    autre.addEventListener('click', () => selecteur.click())
    /*
     * Les variétés : des palettes toutes prêtes, de 0 à 10, montrées en couleurs
     * — pas une liste. Un clic met la variété dans la palette choisie (celle qui
     * est entourée).
     */
    const ouvrir = document.createElement('button')
    ouvrir.type = 'button'
    ouvrir.className = 'paint-autre'
    ouvrir.textContent = '🎨 Variétés'
    ouvrir.title = `des palettes toutes prêtes, de 0 à 10, à mettre dans la palette ${p}`
    const ouvrirThemes = document.createElement('button')
    ouvrirThemes.type = 'button'
    ouvrirThemes.className = 'paint-autre'
    ouvrirThemes.textContent = '🎨 Thèmes'
    ouvrirThemes.title = 'des palettes qui vont ensemble, pour tout le jeu d’un coup — décor et personnages'
    droite.append(autre, selecteur, ouvrir, ouvrirThemes)
    barre.append(droite)

    /*
     * Les thèmes : 8 palettes de décor et 8 de personnages qui s'accordent,
     * montrées d'un coup d'œil — un clic les pose toutes. Ctrl+Z revient.
     */
    const themes = document.createElement('div')
    themes.className = 'paint-varietes paint-themes'
    themes.hidden = !THEMES_OUVERTS.get(cle)
    const ditThemes = document.createElement('p')
    ditThemes.className = 'aide'
    ditThemes.textContent = 'Un thème change les 8 palettes du décor ET les 8 des personnages, avec des couleurs qui vont ensemble. Ctrl+Z pour revenir en arrière.'
    themes.append(ditThemes)
    THEMES.forEach((t, k) => {
      const choix = document.createElement('button')
      choix.type = 'button'
      choix.className = 'paint-theme'
      choix.title = `thème ${k} — ${t.nom}`
      for (const liste of [t.fond, t.lutins]) {
        const rangee = document.createElement('span')
        rangee.className = 'paint-theme-rangee'
        liste.forEach((pal) => {
          const bandes = document.createElement('span')
          bandes.className = 'paint-variete-bandes'
          pal.forEach((col, i) => {
            const carre = document.createElement('i')
            if (liste === t.lutins && i === 0) return
            carre.style.background = versDiese(col)
            bandes.append(carre)
          })
          rangee.append(bandes)
        })
        choix.append(rangee)
      }
      const nom = document.createElement('small')
      nom.textContent = `${k} · ${t.nom}`
      choix.append(nom)
      choix.addEventListener('click', () => surTheme({ fond: t.fond.map((p) => p.map((c) => [...c])), lutins: t.lutins.map((p) => p.map((c) => [...c])), nom: t.nom }))
      themes.append(choix)
    })
    ouvrirThemes.addEventListener('click', () => {
      themes.hidden = !themes.hidden
      THEMES_OUVERTS.set(cle, !themes.hidden)
    })

    const varietes = document.createElement('div')
    varietes.className = 'paint-varietes'
    varietes.hidden = !VARIETES_OUVERTES.get(cle)
    const titre = document.createElement('p')
    titre.className = 'aide'
    titre.textContent = `Une variété toute prête pour la palette ${p} — un clic la met à sa place :`
    varietes.append(titre)
    ;(lutins ? VARIETES_LUTINS : VARIETES).forEach((v, k) => {
      const choix = document.createElement('button')
      choix.type = 'button'
      choix.className = 'paint-variete'
      choix.title = `variété ${k} — ${v.nom}`
      const bandes = document.createElement('span')
      bandes.className = 'paint-variete-bandes'
      v.palette.forEach((col, t) => {
        const i = document.createElement('i')
        if (lutins && t === 0) i.className = 'vide'
        else i.style.background = versDiese(col)
        bandes.append(i)
      })
      const nom = document.createElement('small')
      nom.textContent = `${k} · ${v.nom}`
      choix.append(bandes, nom)
      choix.addEventListener('click', () => surVariete(p, v.palette.map((col) => [...col])))
      varietes.append(choix)
    })
    ouvrir.addEventListener('click', () => {
      varietes.hidden = !varietes.hidden
      VARIETES_OUVERTES.set(cle, !varietes.hidden)
    })
    barre.append(varietes, themes)
  }

  /* Ce qu'on survole : « BRIQUE → palette 2 ». */
  const ici = document.createElement('p')
  ici.className = 'paint-ici'
  barre.append(ici)
  barre.ici = (texte) => { ici.textContent = texte ?? '' }
  /* Compatibilité : l'ancien compteur n'a plus lieu d'être. */
  barre.total = () => {}

  const message = document.createElement('p')
  message.className = 'paint-message'
  message.setAttribute('role', 'status')
  barre.append(message)

  let efface = null
  const montrer = (texte, reste, genre = 'alerte') => {
    message.textContent = texte
    message.title = texte // le message entier, s'il est coupé
    message.classList.toggle('alerte', genre === 'alerte')
    message.classList.toggle('info', genre === 'info')
    clearTimeout(efface)
    efface = setTimeout(() => { message.textContent = ''; message.classList.remove('alerte', 'info') }, reste)
  }
  /* genre : « alerte » (en rouge) ou « info » (ce qui vient de se passer). */
  barre.dire = (texte, genre = 'info') => {
    MESSAGES.set(cle, { texte, genre, jusqua: Date.now() + DUREE })
    montrer(texte, DUREE, genre)
  }
  const dernier = MESSAGES.get(cle)
  if (dernier && dernier.jusqua > Date.now()) montrer(dernier.texte, dernier.jusqua - Date.now(), dernier.genre)

  return barre
}

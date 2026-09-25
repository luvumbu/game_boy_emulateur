/**
 * Les versions du programme : des photos datées, qu'on peut rouvrir.
 *
 * ↶ et ↷ défont les derniers gestes ; ils ne ramènent pas le jeu d'hier. Les
 * versions, si : l'atelier en prend une toutes les cinq minutes quand le
 * programme a changé, et une à la demande (« 📸 », avec un nom). Revenir à une
 * version remplace le programme — et ↶ annule ce retour, comme n'importe quel
 * geste.
 *
 * Elles vivent dans ce navigateur (localStorage) : trente au plus, les plus
 * anciennes photos automatiques s'en vont d'abord ; celles qu'on a nommées
 * restent.
 */

const CLE = 'gameboy3-versions'
const MAXI = 30
const INTERVALLE = 5 * 60 * 1000

export function lireVersions() {
  try { return JSON.parse(localStorage.getItem(CLE) ?? '[]') } catch { return [] }
}

function ecrireVersions(liste) {
  /* Trop de versions : les automatiques les plus vieilles partent d'abord. */
  while (liste.length > MAXI) {
    const i = liste.findIndex((v) => v.auto)
    liste.splice(i >= 0 ? i : 0, 1)
  }
  try { localStorage.setItem(CLE, JSON.stringify(liste)); return true } catch { return false }
}

/** Prend une photo du programme. Rend la version, ou null si rien n'a changé depuis la dernière. */
export function prendreUneVersion(texte, { nom = '', auto = false } = {}) {
  const liste = lireVersions()
  if (auto && liste.length && liste[liste.length - 1].texte === texte) return null
  const version = { id: Date.now().toString(36), date: new Date().toISOString(), nom, texte, auto }
  liste.push(version)
  return ecrireVersions(liste) ? version : null
}

export function oublierUneVersion(id) {
  ecrireVersions(lireVersions().filter((v) => v.id !== id))
}

/** Combien de lignes diffèrent entre deux textes — de quoi savoir si une version vaut la peine. */
export function lignesChangees(a, b) {
  const la = a.split('\n')
  const lb = b.split('\n')
  const dansB = new Map()
  for (const l of lb) dansB.set(l, (dansB.get(l) ?? 0) + 1)
  let communes = 0
  for (const l of la) {
    const n = dansB.get(l) ?? 0
    if (n > 0) { communes++; dansB.set(l, n - 1) }
  }
  return Math.max(la.length, lb.length) - communes
}

/**
 * La fenêtre des versions, et la photo automatique.
 *
 *   bouton        le bouton qui l'ouvre
 *   lireSource    le programme d'aujourd'hui
 *   revenirA      pose un texte comme programme (annulable par ↶)
 */
export function installerLesVersions({ bouton, lireSource, revenirA }) {
  const boite = document.createElement('dialog')
  boite.className = 'versions'
  document.body.append(boite)

  const quand = (iso) => new Date(iso).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })

  function remplir() {
    boite.textContent = ''
    const titre = document.createElement('h2')
    titre.textContent = '🕘 Les versions du programme'
    const dit = document.createElement('p')
    dit.className = 'aide'
    dit.textContent = 'Une photo toutes les cinq minutes quand le programme change, et celles que tu prends. Revenir à une version remplace le programme : ↶ annule ce retour.'
    const prendre = document.createElement('form')
    prendre.className = 'rangee'
    const nom = document.createElement('input')
    nom.placeholder = 'nom de la version (ex. : avant le boss)'
    nom.maxLength = 40
    const ok = document.createElement('button')
    ok.textContent = '📸 Prendre une version'
    prendre.append(nom, ok)
    prendre.addEventListener('submit', (e) => {
      e.preventDefault()
      prendreUneVersion(lireSource(), { nom: nom.value.trim() })
      remplir()
    })
    const liste = document.createElement('ol')
    liste.className = 'versions-liste'
    const actuel = lireSource()
    const versions = lireVersions().slice().reverse()
    if (!versions.length) {
      const vide = document.createElement('p')
      vide.className = 'aide'
      vide.textContent = 'Aucune version pour l’instant.'
      liste.append(vide)
    }
    for (const v of versions) {
      const li = document.createElement('li')
      const qui = document.createElement('span')
      const ecart = lignesChangees(actuel, v.texte)
      qui.textContent = `${quand(v.date)} — ${v.nom || (v.auto ? 'automatique' : 'sans nom')} · ${v.texte.split('\n').length} lignes · ${ecart ? `${ecart} ligne${ecart > 1 ? 's' : ''} de différence` : 'identique à maintenant'}`
      const revenir = document.createElement('button')
      revenir.type = 'button'
      revenir.className = 'petit'
      revenir.textContent = '↩ Revenir'
      revenir.disabled = !ecart
      revenir.addEventListener('click', () => {
        /* Le programme d'avant n'est pas perdu : on en prend une photo d'abord. */
        prendreUneVersion(lireSource(), { nom: 'avant le retour', auto: true })
        revenirA(v.texte)
        boite.close()
      })
      const oublier = document.createElement('button')
      oublier.type = 'button'
      oublier.className = 'petit'
      oublier.textContent = '✕'
      oublier.title = 'oublier cette version'
      oublier.addEventListener('click', () => { oublierUneVersion(v.id); remplir() })
      li.append(qui, revenir, oublier)
      liste.append(li)
    }
    const fermer = document.createElement('button')
    fermer.type = 'button'
    fermer.textContent = 'Fermer'
    fermer.addEventListener('click', () => boite.close())
    boite.append(titre, dit, prendre, liste, fermer)
  }

  bouton.addEventListener('click', () => { remplir(); boite.showModal() })
  setInterval(() => prendreUneVersion(lireSource(), { auto: true }), INTERVALLE)
  return { remplir, prendre: (nom) => prendreUneVersion(lireSource(), { nom }) }
}

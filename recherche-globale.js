/**
 * Tout chercher, d'un seul endroit : Ctrl+K dans l'atelier.
 *
 * Chaque liste de l'atelier a sa propre recherche (recherche.js). Mais quand
 * on ne sait pas OÙ est ce qu'on cherche — « snake », est-ce une leçon, un
 * exemple, un projet ? —, il faut chercher partout à la fois. Cette fenêtre
 * le fait : on tape, les résultats de toutes les sortes arrivent ensemble,
 * chacun avec son étiquette (📘 Leçon, 🎮 Exemple, 📁 Projet…), et Entrée y
 * emmène.
 *
 * Ce module ne connaît que la fenêtre et le clavier. Les choses à trouver, et
 * ce qu'il faut faire quand on en choisit une, sont données par la page :
 *
 *   installer({ fiches, bouton })
 *     fiches()  → une liste de { genre, libelle, detail, texte, numero, aller }
 *                 genre   l'étiquette (« 📘 Leçon »)
 *                 libelle ce qu'on affiche en gras
 *                 detail  une ligne de plus, en petit (facultatif)
 *                 texte   où chercher, déjà « à plat » (fiche() de recherche.js)
 *                 numero  pour les leçons : « 0.93.4 » (facultatif)
 *                 aller   la fonction qui y emmène
 *               Appelée à CHAQUE ouverture : les projets, par exemple,
 *               peuvent avoir changé depuis la dernière fois.
 *     bouton    le bouton de la page qui ouvre aussi la fenêtre (facultatif)
 */
import { correspond, motsDe, normaliser } from './recherche.js'

/* Au plus 60 résultats affichés : au-delà, on affine sa recherche. */
const AU_PLUS = 60

const STYLE = `
  .tout-chercher-voile {
    position: fixed; inset: 0; z-index: 90; background: #0008;
    display: flex; justify-content: center; align-items: flex-start; padding-top: 10vh;
  }
  .tout-chercher {
    width: min(640px, calc(100vw - 32px)); max-height: 70vh; display: flex; flex-direction: column;
    background: var(--panneau, #1e222a); border: 1px solid var(--vert, #8bac0f); border-radius: 10px;
    box-shadow: 0 18px 50px #000a; overflow: hidden;
  }
  .tout-chercher input {
    font: inherit; font-size: 17px; padding: 14px 16px; border: 0; border-bottom: 1px solid var(--bord, #3a3f4b);
    background: transparent; color: var(--texte, #e6e6e6); outline: none;
  }
  .tout-chercher .compte { font-size: 11px; color: var(--gris, #8b93a1); padding: 6px 16px; }
  .tout-chercher ol { list-style: none; margin: 0; padding: 4px; overflow: auto; }
  .tout-chercher li { display: flex; gap: 10px; align-items: baseline; padding: 8px 12px; border-radius: 6px; cursor: pointer; }
  .tout-chercher li.choisi { background: var(--panneau-clair, #2c3140); }
  .tout-chercher .genre { flex: 0 0 96px; font-size: 11px; color: var(--vert, #8bac0f); white-space: nowrap; }
  .tout-chercher .quoi { display: flex; flex-direction: column; min-width: 0; }
  .tout-chercher .quoi b { font-weight: 600; }
  .tout-chercher .quoi small { color: var(--gris, #8b93a1); font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .tout-chercher .aide-touches { font-size: 11px; color: var(--gris, #8b93a1); padding: 8px 16px; border-top: 1px solid var(--bord, #3a3f4b); }
`

export function installer({ fiches, bouton = null }) {
  const style = document.createElement('style')
  style.textContent = STYLE
  document.head.append(style)

  let voile = null      // la fenêtre, quand elle est ouverte
  let resultats = []    // ce qui est affiché, dans l'ordre
  let choisi = 0        // la ligne en surbrillance (flèches haut et bas)

  function fermer() {
    voile?.remove()
    voile = null
  }

  function ouvrir() {
    if (voile) return
    const toutes = fiches()   // relues à chaque ouverture

    voile = document.createElement('div')
    voile.className = 'tout-chercher-voile'
    const boite = document.createElement('div')
    boite.className = 'tout-chercher'
    boite.setAttribute('role', 'dialog')
    boite.setAttribute('aria-label', 'Tout chercher')

    const champ = document.createElement('input')
    champ.type = 'search'
    champ.placeholder = '🔎 Tout chercher : leçons, cours, exemples, projets, fonctions, réglages, modèles…'
    champ.autocomplete = 'off'
    champ.spellcheck = false

    const compte = document.createElement('div')
    compte.className = 'compte'
    compte.setAttribute('aria-live', 'polite')
    const liste = document.createElement('ol')
    const aide = document.createElement('div')
    aide.className = 'aide-touches'
    aide.textContent = '↑ ↓ pour choisir · Entrée pour ouvrir · Échap pour fermer'

    boite.append(champ, compte, liste, aide)
    voile.append(boite)
    document.body.append(voile)

    /* Montrer les résultats de ce qui est tapé. */
    function montrer() {
      const mots = motsDe(champ.value)
      liste.textContent = ''
      if (!mots.length) {
        compte.textContent = `${toutes.length} choses à trouver — tape un mot`
        resultats = []
        return
      }
      const phrase = normaliser(champ.value.trim())
      resultats = toutes
        .filter((f) => correspond(mots, f.texte, f.numero))
        // D'abord ce dont le NOM contient la phrase entière, puis le reste ;
        // à égalité, l'ordre de départ (sort est stable).
        .sort((a, b) => Number(normaliser(b.libelle).includes(phrase)) - Number(normaliser(a.libelle).includes(phrase)))
      compte.textContent = resultats.length === 0
        ? `rien ne contient « ${champ.value.trim()} »`
        : resultats.length > AU_PLUS
          ? `${resultats.length} résultats — les ${AU_PLUS} premiers ; ajoute un mot pour affiner`
          : `${resultats.length} résultat${resultats.length > 1 ? 's' : ''}`
      resultats = resultats.slice(0, AU_PLUS)
      choisi = 0
      resultats.forEach((f, i) => {
        const li = document.createElement('li')
        li.innerHTML = '<span class="genre"></span><span class="quoi"><b></b><small></small></span>'
        li.querySelector('.genre').textContent = f.genre
        li.querySelector('b').textContent = f.libelle
        li.querySelector('small').textContent = f.detail ?? ''
        li.addEventListener('click', () => choisir(i))
        li.addEventListener('mousemove', () => surligner(i))
        liste.append(li)
      })
      surligner(0)
    }

    /* La ligne en surbrillance, et qu'elle reste visible dans la liste. */
    function surligner(i) {
      choisi = i
      ;[...liste.children].forEach((li, k) => li.classList.toggle('choisi', k === i))
      liste.children[i]?.scrollIntoView({ block: 'nearest' })
    }

    /* Y aller : on ferme la fenêtre d'abord, puis on emmène. */
    function choisir(i) {
      const f = resultats[i]
      if (!f) return
      fermer()
      f.aller()
    }

    champ.addEventListener('input', montrer)
    champ.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); surligner(Math.min(choisi + 1, resultats.length - 1)) }
      if (e.key === 'ArrowUp') { e.preventDefault(); surligner(Math.max(choisi - 1, 0)) }
      if (e.key === 'Enter') { e.preventDefault(); choisir(choisi) }
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); fermer() }
    })
    // un clic à côté de la boîte ferme
    voile.addEventListener('click', (e) => { if (e.target === voile) fermer() })

    montrer()
    champ.focus()
  }

  /* Ctrl+K (ou Cmd+K sur Mac) ouvre — même quand on écrit dans le code : le
     navigateur, lui, en ferait sa barre de recherche. Un second Ctrl+K ferme. */
  addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && !e.altKey && e.key.toLowerCase() === 'k') {
      e.preventDefault()
      if (voile) fermer(); else ouvrir()
    }
  })
  bouton?.addEventListener('click', ouvrir)

  return { ouvrir, fermer }
}

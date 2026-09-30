/**
 * Les recherches marchent-elles, partout ?
 *
 *   node verification/verifier-recherche.mjs
 *
 * On ouvre chaque page dans un vrai navigateur et l'on TAPE dans chaque champ
 * de recherche, comme quelqu'un le ferait : le sommaire du tutoriel et du
 * cours, les leçons, les exemples, les modèles, les projets et les modèles de
 * jeux de l'atelier, les réglages, la fenêtre « Tout chercher » (Ctrl+K), le
 * sommaire du dépôt et celui du cours imprimable.
 *
 * Les résultats attendus ne sont pas écrits à la main : ils sont CALCULÉS
 * depuis les leçons elles-mêmes (« 0.93 » : les leçons dont le numéro est 0.93
 * ou commence par « 0.93. »). Ajouter une leçon ne périme donc pas ce contrôle.
 */

import { spawn } from 'node:child_process'
import { existsSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { bulletin } from '../outils/controle.mjs'
import { servirLAtelier } from '../outils/serveur-essai.mjs'
import { LECONS, numeros } from '../tuto/lecons.js'
import { COURS } from '../tuto/programmation.js'
import { MODELES as MODELES_DE_JEUX } from '../modeles-jeux.js'

const b = bulletin('LES RECHERCHES, PAGE PAR PAGE')
const attendre = (ms) => new Promise((r) => setTimeout(r, ms))
const titre = (t) => console.log(`\n  --- ${t} ---`)
const NUMEROS = numeros(LECONS)

/* Ce qu'on attend, calculé depuis les leçons. */
const du093 = LECONS.filter((_, i) => NUMEROS[i] === '0.93' || NUMEROS[i].startsWith('0.93.'))
const premiere093 = LECONS[NUMEROS.indexOf('0.93')].titre

/* --------------------------------------------------------- le navigateur */

const ADRESSE = await servirLAtelier()
const CHROMES = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  process.env.LOCALAPPDATA + '/Google/Chrome/Application/chrome.exe',
  'C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
]
const executable = CHROMES.find((c) => c && existsSync(c))
if (!executable) { b.verifier('un navigateur à piloter', false); b.fin() }
const PORT = 9355
const profil = join(tmpdir(), 'gameboy3-recherche')
rmSync(profil, { recursive: true, force: true })
const navigateur = spawn(executable, ['--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profil}`,
  '--no-first-run', '--disable-gpu', '--mute-audio', '--window-size=1400,1000', 'about:blank'], { stdio: 'ignore' })
for (let i = 0; i < 50; i++) { try { await (await fetch(`http://127.0.0.1:${PORT}/json/version`)).json(); break } catch { await attendre(200) } }

/* Ouvre une page, et rend « evaluer(expression) » pour lui parler. */
async function ouvrir(chemin, delai = 3500) {
  const cible = await (await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: 'PUT' })).json()
  const ws = new WebSocket(cible.webSocketDebuggerUrl)
  await new Promise((r) => ws.addEventListener('open', r))
  let n = 0
  const attentes = new Map()
  const erreurs = []
  ws.addEventListener('message', (m) => {
    const d = JSON.parse(m.data)
    if (d.id && attentes.has(d.id)) { attentes.get(d.id)(d); attentes.delete(d.id) }
    if (d.method === 'Runtime.exceptionThrown') erreurs.push(d.params.exceptionDetails.exception?.description?.split('\n')[0] ?? d.params.exceptionDetails.text)
  })
  const envoyer = (method, params = {}) => new Promise((r) => { attentes.set(++n, r); ws.send(JSON.stringify({ id: n, method, params })) })
  await envoyer('Runtime.enable')
  await envoyer('Page.navigate', { url: ADRESSE + chemin })
  await attendre(delai)
  const evaluer = async (expression) => {
    const r = await envoyer('Runtime.evaluate', { expression: `(async () => { ${expression} })()`, awaitPromise: true, returnByValue: true })
    if (r.result?.exceptionDetails) throw new Error(r.result.exceptionDetails.exception?.description ?? 'erreur')
    return r.result?.result?.value
  }
  return { evaluer, erreurs, fermer: () => { ws.close(); fetch(`http://127.0.0.1:${PORT}/json/close/${cible.id}`).catch(() => {}) } }
}

/* Dans la page : taper dans un champ, et appuyer sur une touche. */
const OUTILS = `
  const taper = async (champ, texte) => { champ.value = texte; champ.dispatchEvent(new Event('input', { bubbles: true })); await new Promise((r) => setTimeout(r, 80)) }
  const touche = async (cible, key, plus = {}) => { cible.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...plus })); await new Promise((r) => setTimeout(r, 250)) }
  const visible = (e) => !e.classList.contains('recherche-cache') && !e.hidden
`

try {
  /* ============================================================ tuto.html */
  titre('tuto.html — le sommaire des leçons')
  {
    const p = await ouvrir('tuto.html', 5000)
    const r = await p.evaluer(`${OUTILS}
      const champ = document.querySelector('.sommaire .recherche input')
      const lecons = () => [...document.querySelectorAll('#sommaire li.lecon')].filter(visible)
      const titres = () => [...document.querySelectorAll('#sommaire li.partie')].filter(visible).map((l) => l.textContent)
      const res = { existe: !!champ, total: lecons().length }
      await taper(champ, '0.93')
      res.n093 = lecons().length
      res.compte = document.querySelector('.sommaire .recherche-compte').textContent
      res.titres093 = titres()
      // la pastille garde le numéro de la leçon (et non 1, 2, 3… parmi les résultats)
      const bouton = lecons()[0].querySelector('button')
      res.rang = bouton.dataset.rang
      res.pastille = getComputedStyle(bouton, '::before').content
      res.index = lecons()[0].dataset.index
      await touche(champ, 'Enter')
      res.ouverte = document.getElementById('titre').textContent
      res.apresOuverture = lecons().length   // la liste est redessinée : la recherche doit tenir
      await taper(champ, 'snake menu'); res.snakeMenu = lecons().map((l) => l.textContent)
      await taper(champ, 'LECON'); res.sansAccent = lecons().length
      await taper(champ, 'texteGrand'); res.texteGrand = lecons().map((l) => l.textContent)
      await taper(champ, 'zzqxw'); res.rien = { n: lecons().length, compte: document.querySelector('.sommaire .recherche-compte').textContent }
      await touche(champ, 'Escape'); res.efface = { valeur: champ.value, n: lecons().length }
      champ.blur(); await touche(document.body, '/'); res.slash = document.activeElement === champ
      return res`)
    b.verifier('le champ est sous « Les leçons »', r.existe)
    b.verifier(`« 0.93 » : les ${du093.length} leçons du 0.93 et de ses intermédiaires`, r.n093 === du093.length, ` (${r.n093} — « ${r.compte} »)`)
    b.verifier('… sous le titre de leur niveau et de leur partie, et eux seuls', r.titres093.length === 2 && /I\. Le jeu de bombes/.test(r.titres093[1]), ` (${r.titres093.join(' / ')})`)
    b.verifier('… chaque pastille garde SON numéro', r.rang === String(Number(r.index) + 1) && r.pastille === `"${r.rang}"`, ` (pastille ${r.pastille}, leçon ${Number(r.index) + 1})`)
    b.verifier('Entrée ouvre la première leçon trouvée', r.ouverte === premiere093, ` (« ${r.ouverte} »)`)
    b.verifier('… et la recherche tient quand le sommaire est redessiné', r.apresOuverture === du093.length)
    b.verifier('« snake menu » : les deux mots sont exigés', r.snakeMenu.length > 0 && r.snakeMenu.every((t) => /snake/i.test(t) && /menu/i.test(t)), ` (${r.snakeMenu.length})`)
    b.verifier('« LECON » trouve « leçon » (ni accents ni majuscules)', r.sansAccent > 0, ` (${r.sansAccent})`)
    b.verifier('« texteGrand » trouve les leçons qui APPELLENT cette fonction', r.texteGrand.some((t) => /texteGrand/.test(t)) && r.texteGrand.length >= 5, ` (${r.texteGrand.length})`)
    b.verifier('rien trouvé : aucune leçon, et un message', r.rien.n === 0 && /rien ne contient/.test(r.rien.compte), ` (« ${r.rien.compte} »)`)
    b.verifier('Échap efface : toutes les leçons reviennent', r.efface.valeur === '' && r.efface.n === r.total, ` (${r.efface.n}/${r.total})`)
    b.verifier('la touche « / » amène dans la recherche', r.slash)
    b.verifier('aucune erreur dans la page', !p.erreurs.length, p.erreurs.join(' | '))
    p.fermer()
  }

  /* ============================================================ cours.html */
  titre('cours.html — le sommaire du cours')
  {
    const attendus = COURS.filter((c) => /struct/i.test([c.titre, c.idee, c.code].join(' ')))
    const p = await ouvrir('cours.html', 5000)
    const r = await p.evaluer(`${OUTILS}
      const champ = document.querySelector('.sommaire .recherche input')
      const lecons = () => [...document.querySelectorAll('#sommaire li.lecon')].filter(visible)
      await taper(champ, 'struct')
      const n = lecons().length
      await touche(champ, 'Enter')
      return { n, titre: document.getElementById('titre').textContent, premier: lecons()[0]?.textContent }`)
    b.verifier('« struct » trouve des cours', r.n > 0 && r.n <= attendus.length + 2, ` (${r.n})`)
    b.verifier('Entrée ouvre le premier', r.titre === r.premier, ` (« ${r.titre} »)`)
    b.verifier('aucune erreur dans la page', !p.erreurs.length, p.erreurs.join(' | '))
    p.fermer()
  }

  /* ============================================================ index.html */
  titre('index.html — l’atelier')
  {
    const p = await ouvrir('index.html', 6000)
    const r = await p.evaluer(`${OUTILS}
      const $ = (id) => document.getElementById(id)
      const res = {}

      // les leçons, dans le mode Leçons
      $('mode-lecons').click(); await new Promise((r) => setTimeout(r, 600))
      const champL = document.querySelector('.lecons-barre .recherche input')
      await taper(champL, '0.93')
      res.lecons = [...$('lecon-choix').options].filter((o) => !o.hidden).length
      await touche(champL, 'Enter'); await new Promise((r) => setTimeout(r, 500))
      res.leconOuverte = $('lecon-titre').textContent
      await touche(champL, 'Escape')

      // les exemples
      const champE = document.querySelector('.recherche-exemples input')
      await taper(champE, 'mario')
      res.exemples = [...$('exemples').options].filter((o) => !o.hidden).map((o) => o.value)
      await taper(champE, '')

      // les modèles de dessins
      $('mode-creation').click(); document.getElementById('onglet-modeles')?.click(); await new Promise((r) => setTimeout(r, 300))
      const champM = $('modeles').previousElementSibling.querySelector('input')
      const nomModele = $('modeles').children[0].querySelector('b').textContent
      await taper(champM, nomModele)
      res.modeles = { nom: nomModele, n: [...$('modeles').children].filter(visible).length, tous: $('modeles').children.length }
      await taper(champM, '')

      // les modèles de jeux
      $('modeles-jeux').click(); await new Promise((r) => setTimeout(r, 200))
      const menu = document.querySelector('.didacticiel-menu')
      res.jeuxFocus = document.activeElement === menu.querySelector('.recherche input')
      await taper(menu.querySelector('.recherche input'), ${JSON.stringify(MODELES_DE_JEUX[0].nom)})
      res.jeux = [...menu.querySelectorAll('.modeles-jeux-liste > button')].filter(visible).length
      res.fermerVisible = visible([...menu.querySelectorAll('button.petit')].at(-1))
      menu.remove()

      // les projets
      $('projets-ouvrir').click(); await new Promise((r) => setTimeout(r, 1200))
      const cartes = () => [...document.querySelectorAll('#projets-grille .projet-carte')]
      const champP = document.querySelector('#voile-projets .recherche input')
      res.projetsTous = cartes().length
      if (cartes().length) {
        const nom = cartes()[0].querySelector('.projet-nom').textContent
        await taper(champP, nom)
        res.projets = { nom, n: cartes().filter(visible).length }
        await taper(champP, 'zzqxw')
        res.projetsRien = cartes().filter(visible).length
      }
      $('projets-fermer').click()

      // les réglages : sans accents
      $('reglages').click()
      const lignes = () => [...document.querySelectorAll('.reglage-ligne')].filter((l) => !l.hidden)
      // un VRAI mot accentué, d'au moins 4 lettres — pas « à », qui se trouve partout
      // (des minuscules seulement : le texte d'une ligne colle parfois deux mots, « écranUn »)
      const MOT_ACCENTUE = /\\p{Ll}*[éèê]\\p{Ll}*/u
      const mot = [...document.querySelectorAll('.reglage-ligne')].map((l) => l.textContent.match(MOT_ACCENTUE)?.[0] ?? '').find((m) => m.length >= 4)
      $('reglages-chercher').value = mot.normalize('NFD').replace(/\\p{M}/gu, '').toUpperCase()
      $('reglages-chercher').dispatchEvent(new Event('input'))
      res.reglages = { mot, n: lignes().length, tous: document.querySelectorAll('.reglage-ligne').length }
      $('reglages-fermer').click()

      // Tout chercher : Ctrl+K
      await touche(document.body, 'k', { ctrlKey: true })
      const voile = document.querySelector('.tout-chercher-voile')
      res.ctrlK = !!voile
      const champT = voile.querySelector('input')
      res.ctrlKFocus = document.activeElement === champT
      await taper(champT, 'snake')
      res.genres = [...new Set([...voile.querySelectorAll('li .genre')].map((g) => g.textContent))]
      await taper(champT, 'mario')
      res.genresMario = [...new Set([...voile.querySelectorAll('li .genre')].map((g) => g.textContent))]
      await taper(champT, 'texteGrand')
      const lignesT = [...voile.querySelectorAll('li')]
      const iFonction = lignesT.findIndex((li) => li.querySelector('.genre').textContent.includes('Fonction'))
      res.fonction = iFonction >= 0
      for (let k = 0; k < iFonction; k++) await touche(champT, 'ArrowDown')
      await touche(champT, 'Enter'); await new Promise((r) => setTimeout(r, 400))
      res.apresFonction = { ferme: !document.querySelector('.tout-chercher-voile'), mode: document.body.dataset.mode, cherche: champL.value }
      await touche(document.body, 'k', { ctrlKey: true })
      await touche(document.querySelector('.tout-chercher-voile input'), 'Escape')
      res.echapFerme = !document.querySelector('.tout-chercher-voile')
      return res`)
    b.verifier('leçons : « 0.93 » ne laisse que ses leçons dans le menu', r.lecons === du093.length, ` (${r.lecons})`)
    b.verifier('… Entrée ouvre la première', r.leconOuverte.includes(premiere093), ` (« ${r.leconOuverte} »)`)
    b.verifier('exemples : « mario » ne laisse que Mario', r.exemples.length === 1 && r.exemples[0] === 'mario', ` (${r.exemples.join(', ')})`)
    b.verifier('modèles de dessins : son nom le retrouve', r.modeles.n >= 1 && r.modeles.n < r.modeles.tous, ` (« ${r.modeles.nom} » : ${r.modeles.n}/${r.modeles.tous})`)
    b.verifier('modèles de jeux : le curseur est dans la recherche, et le nom retrouve le jeu', r.jeuxFocus && r.jeux === 1, ` (${r.jeux})`)
    b.verifier('… le bouton « Fermer » n’est jamais caché par la recherche', r.fermerVisible)
    if (r.projetsTous) {
      b.verifier('projets : son nom retrouve le projet', r.projets.n >= 1, ` (« ${r.projets.nom} » : ${r.projets.n}/${r.projetsTous})`)
      b.verifier('… et un nom inconnu n’en laisse aucun', r.projetsRien === 0)
    } else console.log('  · aucun projet sur ce disque : la recherche des projets n’est pas essayée')
    b.verifier('réglages : un mot tapé SANS accents retrouve le réglage', r.reglages.n >= 1 && r.reglages.n < r.reglages.tous,
      ` (« ${r.reglages.mot} », tapé sans accent : ${r.reglages.n}/${r.reglages.tous})`)
    b.verifier('Ctrl+K ouvre « Tout chercher », le curseur dedans', r.ctrlK && r.ctrlKFocus)
    b.verifier('… « snake » trouve des leçons (et plusieurs sortes de choses)', r.genres.includes('📘 Leçon'), ` (${r.genres.join(', ')})`)
    b.verifier('… « mario » y trouve aussi l’exemple', r.genresMario.includes('🎮 Exemple'), ` (${r.genresMario.join(', ')})`)
    b.verifier('… une fonction emmène aux leçons qui l’utilisent', r.fonction && r.apresFonction.ferme && r.apresFonction.mode === 'lecons' && r.apresFonction.cherche === 'texteGrand',
      ` (${JSON.stringify(r.apresFonction)})`)
    b.verifier('… Échap ferme la fenêtre', r.echapFerme)
    b.verifier('aucune erreur dans la page', !p.erreurs.length, p.erreurs.join(' | '))
    p.fermer()
  }

  /* ===================================================== les pages fixes */
  titre('sommaire.html et cours/index.html')
  {
    const p = await ouvrir('sommaire.html', 1500)
    const r = await p.evaluer(`${OUTILS}
      const champ = document.querySelector('.recherche-page input')
      await taper(champ, 'pdf')
      const cartes = [...document.querySelectorAll('a.carte')].filter(visible)
      const titres = [...document.querySelectorAll('h2')].filter(visible).length
      // chaque carte restée visible doit parler de PDF (texte mis à plat : sans accents, en minuscules)
      const aPlat = (t) => t.normalize('NFD').replace(/\\p{M}/gu, '').toLowerCase()
      return { champ: !!champ, cartes: cartes.length, toutesEnParlent: cartes.every((c) => aPlat(c.textContent).includes('pdf')),
        titres, tous: document.querySelectorAll('h2').length }`)
    b.verifier('sommaire.html : « pdf » ne laisse que les cartes qui en parlent', r.champ && r.cartes > 0 && r.toutesEnParlent, ` (${r.cartes})`)
    b.verifier('… et cache les sections devenues vides', r.titres < r.tous, ` (${r.titres}/${r.tous} titres)`)
    p.fermer()
    const q = await ouvrir('cours/index.html', 1500)
    const s = await q.evaluer(`${OUTILS}
      const champ = document.querySelector('.recherche-page input')
      await taper(champ, 'boucle')
      const cours = [...document.querySelectorAll('ol.sommaire-cours > li:not(.chapitre)')].filter(visible)
      return { n: cours.length, tous: document.querySelectorAll('ol.sommaire-cours > li:not(.chapitre)').length, chapitres: [...document.querySelectorAll('li.chapitre')].filter(visible).length }`)
    b.verifier('cours/index.html : « boucle » ne laisse que des cours de boucles, sous leur chapitre', s.n > 0 && s.n < s.tous && s.chapitres >= 1, ` (${s.n}/${s.tous}, ${s.chapitres} chapitre(s))`)
    q.fermer()
  }
} finally {
  navigateur.kill()
}
b.fin()

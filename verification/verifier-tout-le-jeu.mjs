/**
 * L'onglet « 📦 Tout le jeu » tient-il ses promesses ?
 *
 *   node verification/verifier-tout-le-jeu.mjs
 *
 * On ouvre vraiment la page dans un Chrome sans interface, sur l'exemple
 * « musique » (une tuile, trois airs), et l'on vérifie :
 *
 *   1. l'onglet s'ouvre, avec ses six dossiers ;
 *   2. chaque dossier compte ce que le programme contient vraiment ;
 *   3. chaque élément dit son fichier, sa ligne, et la ligne pour l'appeler ;
 *   4. la recherche filtre par nom ;
 *   5. « ✏ ouvrir » mène à l'atelier de l'élément ;
 *   6. l'image d'un dossier se choisit (un vrai fichier), se garde, se retire ;
 *   7. aucune erreur JavaScript pendant tout cela.
 *
 * Rien n'est écrit dans le projet : l'image du dossier vit dans le profil
 * jetable de ce Chrome, effacé à la fin.
 */

import { spawn } from 'node:child_process'
import { existsSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { servirLAtelier } from '../outils/serveur-essai.mjs'

const ADRESSE = await servirLAtelier()
const PORT = 9231

const chrome = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  process.env.LOCALAPPDATA + '/Google/Chrome/Application/chrome.exe',
  'C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
].find((c) => c && existsSync(c))
if (!chrome) throw new Error('Chrome introuvable')

const profil = join(tmpdir(), 'gameboy3-tout-le-jeu')
rmSync(profil, { recursive: true, force: true })

const navigateur = spawn(chrome, [
  '--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profil}`,
  '--no-first-run', '--disable-gpu', '--window-size=1280,900', ADRESSE + '#exemple=musique',
], { stdio: 'ignore' })

const patienter = (ms) => new Promise((r) => setTimeout(r, ms))

let cible = null
for (let i = 0; i < 40 && !cible; i++) {
  await patienter(250)
  try {
    const liste = await (await fetch(`http://localhost:${PORT}/json/list`)).json()
    cible = liste.find((t) => t.type === 'page' && t.url.startsWith(ADRESSE))
  } catch { /* pas encore prêt */ }
}
if (!cible) { navigateur.kill(); throw new Error('Chrome n’a pas ouvert la page') }

const prise = new WebSocket(cible.webSocketDebuggerUrl)
await new Promise((r) => prise.addEventListener('open', r))

let prochainId = 1
const attentes = new Map()
const erreurs = []
prise.addEventListener('message', (e) => {
  const m = JSON.parse(e.data)
  if (m.method === 'Runtime.exceptionThrown') {
    erreurs.push(m.params.exceptionDetails.exception?.description ?? m.params.exceptionDetails.text)
    return
  }
  const a = attentes.get(m.id)
  if (!a) return
  attentes.delete(m.id)
  if (m.error) a.rejeter(new Error(m.error.message))
  else a.resoudre(m.result)
})
const envoyer = (methode, params = {}) =>
  new Promise((resoudre, rejeter) => {
    const id = prochainId++
    attentes.set(id, { resoudre, rejeter })
    prise.send(JSON.stringify({ id, method: methode, params }))
  })

async function evaluer(expression) {
  const { result, exceptionDetails } = await envoyer('Runtime.evaluate', {
    expression, returnByValue: true, awaitPromise: true,
  })
  if (exceptionDetails) throw new Error(exceptionDetails.exception?.description ?? 'erreur dans la page')
  return result.value
}

let echecs = 0
const controle = (quoi, bon, detail = '') => {
  console.log('  ' + (bon ? 'OK ' : 'NON') + ' ' + quoi + detail)
  if (!bon) echecs++
}

console.log('L’ONGLET « TOUT LE JEU », PILOTÉ DANS UN VRAI NAVIGATEUR')
console.log()

try {
  await envoyer('Runtime.enable')
  await patienter(3000) // le module se charge, l'exemple se lit et se compile

  // 1. L'onglet s'ouvre.
  await evaluer(`document.getElementById('mode-creation').click(); document.getElementById('onglet-tout').click()`)
  await patienter(500)
  const etat = await evaluer(`(() => {
    const zone = document.getElementById('atelier-tout')
    return {
      visible: !zone.hidden,
      onglet: document.getElementById('onglet-tout').classList.contains('actif'),
      dossiers: [...zone.querySelectorAll('.tout-dossier')].map((d) => d.dataset.groupe),
      comptes: Object.fromEntries([...zone.querySelectorAll('.tout-dossier')].map((d) => [d.dataset.groupe, d.querySelectorAll('.tout-element').length])),
    }
  })()`)
  controle('l’onglet « 📦 Tout le jeu » s’ouvre et s’allume', etat.visible && etat.onglet)
  controle('six dossiers, dans l’ordre', etat.dossiers.join(',') === 'personnages,tuiles,cartes,scenes,musiques,couleurs', ` (${etat.dossiers.join(', ')})`)

  // 2. Les comptes : l'exemple « musique » a une tuile et trois airs.
  controle('Tuiles : 1 (NOTE)', etat.comptes.tuiles === 1, ` (${etat.comptes.tuiles})`)
  controle('Musiques : 3', etat.comptes.musiques === 3, ` (${etat.comptes.musiques})`)
  controle('Personnages, Cartes, Scènes : vides', etat.comptes.personnages === 0 && etat.comptes.cartes === 0 && etat.comptes.scenes === 0)

  // 3. Un élément dit où il est, et comment l'appeler.
  const theme = await evaluer(`(() => {
    const e = [...document.querySelectorAll('[data-groupe="musiques"] .tout-element')].find((x) => x.querySelector('b').textContent === 'THEME')
    return e ? { ou: e.querySelector('.tout-ou').textContent, appel: e.querySelector('.tout-appel').textContent, mini: e.querySelector('canvas').width } : null
  })()`)
  controle('THEME est listé', theme !== null)
  controle('avec son fichier et sa ligne', /^principal\.cpp, ligne \d+$/.test(theme?.ou ?? ''), ` (${theme?.ou})`)
  controle('et la ligne pour l’appeler : jouer(THEME);', (theme?.appel ?? '').startsWith('jouer(THEME);'))
  controle('et une miniature dessinée', (theme?.mini ?? 0) > 0)

  // 4. La recherche.
  const filtre = await evaluer(`(() => {
    const r = document.querySelector('.tout-recherche')
    r.value = 'note'
    r.dispatchEvent(new Event('input'))
    const n = document.querySelectorAll('.tout-element').length
    r.value = ''
    r.dispatchEvent(new Event('input'))
    return { n, apres: document.querySelectorAll('.tout-element').length }
  })()`)
  controle('la recherche « note » ne garde que NOTE', filtre.n === 1, ` (${filtre.n})`)
  controle('et l’effacer rend tout', filtre.apres === 4, ` (${filtre.apres})`)

  // 5. « ✏ ouvrir » mène à l'atelier des airs.
  await evaluer(`[...document.querySelectorAll('[data-groupe="musiques"] .tout-element')].find((x) => x.querySelector('b').textContent === 'THEME').querySelectorAll('button')[1].click()`)
  await patienter(500)
  const ouvert = await evaluer(`({ airs: !document.getElementById('atelier-airs').hidden, tout: !document.getElementById('atelier-tout').hidden })`)
  controle('« ✏ ouvrir » sur THEME passe à « ♪ Les airs »', ouvert.airs && !ouvert.tout)

  // 6. L'image du dossier Personnages : un vrai fichier, posé dans le champ.
  await evaluer(`document.getElementById('onglet-tout').click()`)
  await patienter(300)
  const { root } = await envoyer('DOM.getDocument', { depth: -1, pierce: true })
  const { nodeId } = await envoyer('DOM.querySelector', { nodeId: root.nodeId, selector: '[data-groupe="personnages"] input[type=file]' })
  await envoyer('DOM.setFileInputFiles', { nodeId, files: [resolve('images/capture-page.png')] })
  await patienter(1200)
  const image = await evaluer(`(() => {
    const img = document.querySelector('[data-groupe="personnages"] img.tout-pochette')
    let garde = null
    try { garde = localStorage.getItem('gameboy3-dossier-personnages') } catch {}
    return { img: Boolean(img), debut: img?.src.slice(0, 15), garde: Boolean(garde) }
  })()`)
  controle('l’image choisie devient la pochette du dossier', image.img && image.debut === 'data:image/jpeg', ` (${image.debut})`)
  controle('et elle est gardée dans le navigateur', image.garde)

  await evaluer(`document.querySelector('[data-groupe="personnages"] .tout-outils-dossier button[title^="remettre"]').click()`)
  await patienter(300)
  const retiree = await evaluer(`({ img: Boolean(document.querySelector('[data-groupe="personnages"] img.tout-pochette')), icone: document.querySelector('[data-groupe="personnages"] .tout-icone')?.textContent })`)
  controle('« ✕ » remet l’icône de départ', !retiree.img && retiree.icone === '🧍')

  /*
   * 8. Un fichier par personnage — sur Mario (deux Perso dans principal.cpp).
   * Le programme est rechargé : l'adresse demande l'exemple « mario ».
   */
  await evaluer(`location.hash = '#exemple=mario'; location.reload()`).catch(() => {})
  await patienter(4000)
  await evaluer(`document.getElementById('mode-creation').click(); document.getElementById('onglet-tout').click()`)
  await patienter(600)
  const etatAvant = await evaluer(`document.getElementById('etat').textContent`)
  const principalAvant = await evaluer(`document.getElementById('source').value`)
  const onglets = `[...document.querySelectorAll('#fichiers .fichier')].map((f) => f.textContent.replace(/[●×]/g, '').trim())`
  const mario = await evaluer(`(() => {
    const d = document.querySelector('[data-groupe="personnages"]')
    return {
      n: d.querySelectorAll('.tout-element').length,
      taille: d.querySelector('.tout-element .tout-ou')?.textContent,
      bouton: [...d.querySelectorAll('button')].some((b) => b.textContent === '📁 Un fichier par personnage'),
    }
  })()`)
  controle('Mario : deux personnages, « 16 × 16 pixels »', mario.n === 2 && mario.taille === '16 × 16 pixels', ` (${mario.n}, ${mario.taille})`)
  controle('et le bouton « 📁 Un fichier par personnage »', mario.bouton)

  await evaluer(`[...document.querySelectorAll('[data-groupe="personnages"] button')].find((b) => b.textContent === '📁 Un fichier par personnage').click()`)
  await patienter(2500)
  const range = await evaluer(`(() => {
    const d = document.querySelector('[data-groupe="personnages"]')
    return {
      onglets: ${onglets},
      ou: [...d.querySelectorAll('.tout-element')].map((e) => e.querySelectorAll('.tout-ou')[1]?.textContent),
      bouton: [...d.querySelectorAll('button')].some((b) => b.textContent === '📁 Un fichier par personnage'),
      message: d.querySelector('.tout-outils-dossier .aide')?.textContent ?? '',
      etat: document.getElementById('etat').textContent,
      principal: document.getElementById('source').value,
    }
  })()`)
  controle('les onglets : un groupe replié « 📁 personnages (2) ▸ »', range.onglets.includes('📁 personnages (2) ▸') && !range.onglets.some((o) => o.startsWith('perso_')), ` (${range.onglets.join(', ')})`)
  controle('MARIO dans perso_MARIO.cpp, ENNEMI dans perso_ENNEMI.cpp', range.ou[0]?.startsWith('perso_MARIO.cpp') && range.ou[1]?.startsWith('perso_ENNEMI.cpp'), ` (${range.ou.join(' ; ')})`)
  controle('le message le dit, et le bouton disparaît', range.message.startsWith('2 rangés, un fichier chacun') && !range.bouton, ` (${range.message.slice(0, 60)})`)
  controle('principal.cpp : ses deux dessins partis, une ligne #include "personnages.cpp" en plus', range.principal.includes('#include "personnages.cpp"') && !/Perso (MARIO|ENNEMI) =/.test(range.principal))
  controle('le jeu compile toujours, comme avant', range.etat === etatAvant, range.etat === etatAvant ? '' : ` (avant « ${etatAvant.slice(0, 60)} », après « ${range.etat.slice(0, 60)} »)`)

  await evaluer(`document.getElementById('groupe-personnages').click()`)
  await patienter(400)
  const deplie = await evaluer(onglets)
  controle('déplier le groupe : personnages.cpp et les deux perso_', ['personnages.cpp', 'perso_MARIO.cpp', 'perso_ENNEMI.cpp'].every((n) => deplie.some((o) => o.startsWith(n))), ` (${deplie.join(', ')})`)

  await evaluer(`document.getElementById('annuler').click()`)
  await patienter(1500)
  const annule = await evaluer(onglets)
  controle('« ↶ Annuler » remet tout comme avant', !annule.some((o) => o.startsWith('📁 personnages')) && (await evaluer(`document.getElementById('source').value`)) === principalAvant, ` (${annule.join(', ')})`)

  /*
   * 9. Créer des personnages : chacun son fichier, et principal.cpp ne change
   * qu'UNE fois (la ligne qui verse personnages.cpp), puis plus jamais.
   */
  await evaluer(`document.getElementById('onglet-tuiles').click()`)
  await patienter(400)
  controle('la bande dit la règle : un personnage = son fichier', await evaluer(`document.querySelector('#bande .rangement-perso')?.textContent.includes('perso_NOM.cpp') ?? false`))
  const creer = async (taille, nom) => {
    await evaluer(`[...document.querySelectorAll('#bande .neuve')].find((b) => b.textContent.includes('${taille}')).click()`)
    await patienter(600)
    await evaluer(`document.getElementById('nom-champ').value = '${nom}'`)
    await evaluer("document.getElementById('boite-nom').requestSubmit()")
    await patienter(2500)
  }
  const principalDe = `(() => { document.querySelector('#fichiers .fichier')?.click(); return document.getElementById('source').value })()`
  await creer('32 × 32', 'BOSS')
  const boss = await evaluer(`(() => ({
    ouvert: document.querySelector('#fichiers .fichier.ouvert')?.textContent.replace(/[●×]/g, '').trim(),
    source: document.getElementById('source').value,
    vignette: [...document.querySelectorAll('#bande .tuile')].some((b) => b.title.startsWith('BOSS — 32 × 32')),
    marioAilleurs: document.querySelector('#bande .tuile[data-nom="MARIO"]')?.classList.contains('ailleurs') ?? false,
  }))()`)
  controle('« + perso 32 × 32 » : BOSS s’ouvre dans perso_BOSS.cpp', (boss.ouvert ?? '').startsWith('perso_BOSS.cpp'), ` (${boss.ouvert})`)
  controle('qui contient « Perso BOSS = { … } », 32 rangées — juste le dessin, sans #include', /Perso BOSS = \{(\s*"0{32}",){32}\s*\};/.test(boss.source) && !/^[ \t]*#\s*include/m.test(boss.source))
  controle('la bande montre BOSS, et aussi MARIO, écrit dans un autre onglet (↗)', boss.vignette && boss.marioAilleurs)
  const principal1 = await evaluer(principalDe)
  controle('principal.cpp : une seule ligne en plus, #include "personnages.cpp"', principal1.replace(/^#include "personnages\.cpp".*\n/m, '') === principalAvant)

  await creer('16 × 16', 'HEROS')
  const principal2 = await evaluer(principalDe)
  controle('un deuxième personnage, HEROS : principal.cpp n’a PAS changé', principal2 === principal1)
  const parent = await evaluer(`(() => { const g = document.getElementById('groupe-personnages'); if (g && !g.classList.contains('deplie')) g.click(); const o = [...document.querySelectorAll('#fichiers .fichier')].find((x) => x.textContent.startsWith('personnages.cpp')); o?.click(); return document.getElementById('source').value })()`)
  controle('personnages.cpp liste perso_BOSS.cpp et perso_HEROS.cpp', parent.includes('#include "perso_BOSS.cpp"') && parent.includes('#include "perso_HEROS.cpp"'))
  controle('et porte #include <Perso> UNE fois, pour tous', (parent.match(/^#include <Perso>/gm) ?? []).length === 1)

  /* Un clic sur MARIO, écrit dans principal.cpp, ouvre principal.cpp. */
  await evaluer(`document.querySelector('#bande .tuile[data-nom="MARIO"]').click()`)
  await patienter(600)
  controle('un clic sur MARIO (dans principal.cpp) ouvre principal.cpp', ((await evaluer(`document.querySelector('#fichiers .fichier.ouvert')?.textContent`)) ?? '').startsWith('principal.cpp'))

  /* Retour sur BOSS pour la suite (le clic qui peint) : son fichier s'ouvre. */
  await evaluer(`document.querySelector('#bande .tuile[data-nom="BOSS"]').click()`)
  await patienter(600)
  /* Un vrai clic de souris au milieu de la grille de 32 × 32 : un pixel peint. */
  const cible32 = await evaluer(`(() => {
    const toile = [...document.querySelectorAll('#grille canvas')].sort((a, b) => b.width - a.width)[0]
    toile.scrollIntoView({ block: 'center' })
    const r = toile.getBoundingClientRect()
    return { x: r.left + r.width * (20.5 / 32), y: r.top + r.height * (10.5 / 32) }
  })()`)
  await patienter(200)
  for (const type of ['mousePressed', 'mouseReleased']) {
    await envoyer('Input.dispatchMouseEvent', { type, x: cible32.x, y: cible32.y, button: 'left', clickCount: 1, buttons: type === 'mousePressed' ? 1 : 0 })
    await patienter(60)
  }
  await patienter(800)
  const peint = await evaluer(`(() => {
    const m = document.getElementById('source').value.match(/Perso BOSS = \\{([\\s\\S]*?)\\};/)
    const rangees = [...(m?.[1] ?? '').matchAll(/"([^"]{32})"/g)].map((x) => x[1])
    return { n: rangees.length, pixel: rangees[10]?.[20], autres: rangees.join('').replace(/0/g, '').length }
  })()`)
  controle('un clic peint le pixel (20, 10) du Grand, et lui seul', peint.n === 32 && peint.pixel !== '0' && peint.autres === 1, ` (${JSON.stringify(peint)})`)
  await evaluer(`document.getElementById('onglet-tout').click()`)
  await patienter(600)
  const bossTout = await evaluer(`(() => {
    const e = [...document.querySelectorAll('[data-groupe="personnages"] .tout-element')].find((x) => x.querySelector('b').textContent === 'BOSS')
    return e ? { appel: e.querySelector('.tout-appel').textContent, taille: e.querySelector('.tout-ou').textContent } : null
  })()`)
  controle('« Tout le jeu » le range dans Personnages, avec sprite32', bossTout?.taille === '32 × 32 pixels' && (bossTout?.appel ?? '').startsWith('sprite32(0, 64, 56, BOSS);'), ` (${JSON.stringify(bossTout)})`)

  /*
   * 10. Le verrou 🔒 — sur Mario, rechargé.
   */
  await evaluer(`location.hash = '#exemple=mario'; location.reload()`).catch(() => {})
  await patienter(4000)
  await evaluer(`document.getElementById('mode-creation').click(); document.getElementById('onglet-tout').click()`)
  await patienter(600)
  const blocMario = `(document.getElementById('source').value.match(/Perso MARIO = \\{[\\s\\S]*?\\};/) ?? [''])[0]`
  await evaluer(`[...document.querySelectorAll('[data-groupe="personnages"] .tout-element')].find((x) => x.querySelector('b').textContent.endsWith('MARIO')).querySelector('button[title*="modèle"]').click()`)
  await patienter(600)
  const verrou = await evaluer(`({
    marque: document.getElementById('source').value.includes('/* MARIO : verrouillé */'),
    cadenas: [...document.querySelectorAll('[data-groupe="personnages"] .tout-element b')].map((b) => b.textContent),
  })`)
  controle('« 🔒 verrouiller » écrit la marque sous MARIO', verrou.marque)
  controle('et « Tout le jeu » montre le cadenas', verrou.cadenas.includes('🔒 MARIO') && verrou.cadenas.includes('ENNEMI'), ` (${verrou.cadenas.join(', ')})`)

  await evaluer(`document.getElementById('onglet-tuiles').click()`)
  await patienter(400)
  await evaluer(`document.querySelector('#bande .tuile[data-nom="MARIO"]').click()`)
  await patienter(600)
  const atelierVerrou = await evaluer(`({
    classe: document.querySelector('#bande .tuile[data-nom="MARIO"]').classList.contains('verrouille'),
    boutons: [...document.querySelectorAll('#grille button')].map((b) => b.textContent),
  })`)
  controle('dans ▦ Les tuiles, la vignette porte le cadenas', atelierVerrou.classe)
  controle('et les boutons « 🔓 Déverrouiller » et « ⧉ Créer une variante »',
    atelierVerrou.boutons.includes('🔓 Déverrouiller') && atelierVerrou.boutons.includes('⧉ Créer une variante'))

  const avantPeinture = await evaluer(blocMario)
  const cliquerDansLaGrille = async (fx, fy) => {
    const c = await evaluer(`(() => {
      const toile = [...document.querySelectorAll('#grille canvas')].sort((a, b) => b.width - a.width)[0]
      toile.scrollIntoView({ block: 'center' })
      const r = toile.getBoundingClientRect()
      return { x: r.left + r.width * ${fx}, y: r.top + r.height * ${fy} }
    })()`)
    await patienter(200)
    for (const type of ['mousePressed', 'mouseReleased']) {
      await envoyer('Input.dispatchMouseEvent', { type, x: c.x, y: c.y, button: 'left', clickCount: 1, buttons: type === 'mousePressed' ? 1 : 0 })
      await patienter(60)
    }
    await patienter(700)
  }
  await cliquerDansLaGrille(0.03, 0.03)
  const apresPeinture = await evaluer(blocMario)
  const dit = await evaluer(`document.getElementById('grille').textContent.includes('MARIO est verrouillé') || document.getElementById('etat').textContent.includes('MARIO est verrouillé')`)
  controle('peindre MARIO verrouillé : refusé, son dessin ne change pas', apresPeinture === avantPeinture && apresPeinture.length > 0)
  controle('et l’atelier le dit', dit)

  /* La frappe : changer un pixel de MARIO dans le code est défait ; écrire ailleurs passe. */
  const frappe = await evaluer(`(() => {
    const champ = document.getElementById('source')
    const avant = champ.value
    champ.value = avant.replace(/(Perso MARIO = \\{\\s*")./, '$13')
    champ.dispatchEvent(new Event('input'))
    const refusee = champ.value === avant
    champ.value = avant + '// un commentaire de plus\\n'
    champ.dispatchEvent(new Event('input'))
    const permise = champ.value.endsWith('// un commentaire de plus\\n')
    return { refusee, permise, etat: document.getElementById('etat').textContent }
  })()`)
  controle('taper dans les rangées de MARIO : défait aussitôt', frappe.refusee)
  controle('écrire ailleurs dans le code : permis', frappe.permise)

  /* Une variante : une copie modifiable, l'original intact. */
  await evaluer(`[...document.querySelectorAll('#grille button')].find((b) => b.textContent === '⧉ Créer une variante').click()`)
  await patienter(600)
  await evaluer("document.getElementById('nom-champ').value = 'MARIO_ROUGE'")
  await evaluer("document.getElementById('boite-nom').requestSubmit()")
  await patienter(900)
  const variante = await evaluer(`({
    existe: /Perso MARIO_ROUGE = \\{/.test(document.getElementById('source').value),
    libre: !document.getElementById('source').value.includes('/* MARIO_ROUGE : verrouillé */'),
  })`)
  controle('« ⧉ Créer une variante » : MARIO_ROUGE, sans verrou', variante.existe && variante.libre)
  const avantVariante = await evaluer(`(document.getElementById('source').value.match(/Perso MARIO_ROUGE = \\{[\\s\\S]*?\\};/) ?? [''])[0]`)
  await cliquerDansLaGrille(0.03, 0.03)
  const apresVariante = await evaluer(`(document.getElementById('source').value.match(/Perso MARIO_ROUGE = \\{[\\s\\S]*?\\};/) ?? [''])[0]`)
  controle('la variante se peint', apresVariante !== avantVariante)
  controle('et elle a son propre fichier, perso_MARIO_ROUGE.cpp', ((await evaluer(`document.querySelector('#fichiers .fichier.ouvert')?.textContent`)) ?? '').startsWith('perso_MARIO_ROUGE.cpp'))
  /* MARIO, lui, est resté dans principal.cpp : un clic sur sa vignette y retourne. */
  await evaluer(`document.querySelector('#bande .tuile[data-nom="MARIO"]').click()`)
  await patienter(500)
  controle('et MARIO, l’original, n’a pas bougé', (await evaluer(blocMario)) === avantPeinture)

  /* 🔓 : MARIO redevient modifiable. */
  await evaluer(`document.querySelector('#bande .tuile[data-nom="MARIO"]').click()`)
  await patienter(500)
  await evaluer(`[...document.querySelectorAll('#grille button')].find((b) => b.textContent === '🔓 Déverrouiller').click()`)
  await patienter(500)
  controle('« 🔓 Déverrouiller » ôte la marque', !(await evaluer(`document.getElementById('source').value.includes('/* MARIO : verrouillé */')`)))
  await cliquerDansLaGrille(0.03, 0.03)
  controle('et MARIO se peint de nouveau', (await evaluer(blocMario)) !== avantPeinture)

  /*
   * 11. Supprimer — refusé si l'élément sert, ou s'il est verrouillé. Mario, rechargé.
   * Les boîtes « confirmer » répondent oui toutes seules (un vrai visiteur clique OK).
   */
  await evaluer(`location.hash = '#exemple=mario'; location.reload()`).catch(() => {})
  await patienter(4000)
  await evaluer(`window.confirm = () => true`)
  await evaluer(`document.getElementById('mode-creation').click(); document.getElementById('onglet-tout').click()`)
  await patienter(600)
  const element = (nom) => `[...document.querySelectorAll('.tout-element')].find((x) => x.querySelector('b').textContent.replace('🔒 ', '') === '${nom}')`
  const sol = await evaluer(`(() => { const e = ${element('SOL')}; const b = [...e.querySelectorAll('button')].find((x) => x.textContent === '🗑 supprimer'); return { emploi: e.querySelector('.tout-emploi').textContent, bloque: b.disabled, pourquoi: b.title } })()`)
  controle('SOL : « ✔ utilisé 1 fois », et 🗑 bloqué', sol.emploi === '✔ utilisé 1 fois' && sol.bloque && sol.pourquoi.includes('utilisé'), ` (${sol.emploi} ; ${sol.pourquoi.slice(0, 50)})`)

  /* Une tuile neuve, jamais utilisée. */
  await evaluer(`document.getElementById('onglet-tuiles').click()`)
  await patienter(400)
  await evaluer(`[...document.querySelectorAll('#bande .neuve')].find((b) => b.textContent.includes('8 × 8')).click()`)
  await patienter(600)
  await evaluer("document.getElementById('nom-champ').value = 'INUTILE'")
  await evaluer("document.getElementById('boite-nom').requestSubmit()")
  await patienter(900)
  await evaluer(`document.getElementById('onglet-tout').click()`)
  await patienter(600)
  const inutile = await evaluer(`(() => { const e = ${element('INUTILE')}; const b = e && [...e.querySelectorAll('button')].find((x) => x.textContent === '🗑 supprimer'); return e ? { emploi: e.querySelector('.tout-emploi').textContent, libre: !b.disabled } : null })()`)
  controle('INUTILE : « ∅ jamais utilisé », et 🗑 possible', inutile?.emploi === '∅ jamais utilisé' && inutile?.libre, ` (${JSON.stringify(inutile)})`)
  await evaluer(`[...(${element('INUTILE')}).querySelectorAll('button')].find((x) => x.textContent === '🗑 supprimer').click()`)
  await patienter(1500)
  const supprime = await evaluer(`({ code: document.getElementById('source').value.includes('INUTILE'), dit: document.querySelector('#atelier-tout .aide + .tout-recherche + .aide')?.textContent ?? [...document.querySelectorAll('#atelier-tout > .aide')].map((p) => p.textContent).join(' ') })`)
  controle('🗑 : INUTILE disparaît du programme', !supprime.code)
  controle('et la page le dit', /🗑 INUTILE est supprimé/.test(supprime.dit), ` (${supprime.dit.slice(0, 60)})`)
  await evaluer(`document.getElementById('annuler').click()`)
  await patienter(1500)
  controle('« ↶ Annuler » le fait revenir', await evaluer(`document.getElementById('source').value.includes('Tuile INUTILE = {')`))

  /* Verrouillé : pas de suppression. */
  await evaluer(`document.getElementById('onglet-tout').click()`)
  await patienter(600)
  await evaluer(`[...(${element('INUTILE')}).querySelectorAll('button')].find((x) => x.textContent === '🔒 verrouiller').click()`)
  await patienter(600)
  const verrouSup = await evaluer(`(() => { const b = [...(${element('INUTILE')}).querySelectorAll('button')].find((x) => x.textContent === '🗑 supprimer'); return { bloque: b.disabled, pourquoi: b.title } })()`)
  controle('INUTILE verrouillé : 🗑 bloqué', verrouSup.bloque && verrouSup.pourquoi.startsWith('🔒'), ` (${verrouSup.pourquoi.slice(0, 50)})`)

  /* Dans l'atelier : 🗑 Supprimer sur SOL, utilisé → refusé, et dit. */
  await evaluer(`document.getElementById('onglet-tuiles').click()`)
  await patienter(400)
  await evaluer(`document.querySelector('#bande .tuile[data-nom="SOL"]').click()`)
  await patienter(500)
  const boutonsSol = await evaluer(`[...document.querySelectorAll('#grille button')].map((b) => b.textContent)`)
  controle('l’atelier a « 🗑 Supprimer » et « 🧽 Vider le dessin »', boutonsSol.includes('🗑 Supprimer') && boutonsSol.includes('🧽 Vider le dessin'))
  await evaluer(`[...document.querySelectorAll('#grille button')].find((b) => b.textContent === '🗑 Supprimer').click()`)
  await patienter(700)
  const solReste = await evaluer(`({ code: document.getElementById('source').value.includes('Tuile SOL = {'), dit: document.getElementById('grille').textContent.includes('SOL est utilisé') })`)
  controle('🗑 Supprimer sur SOL (utilisé) : refusé, SOL reste', solReste.code)
  controle('et l’atelier dit où il sert', solReste.dit)

  /*
   * 12. Le compteur du groupe compte les PERSONNAGES, pas les fichiers : un
   * Perso tapé à la main dans personnages.cpp d'un seul bloc (comme dans les
   * leçons 35.x) compte. Il affichait « (0) ».
   */
  await evaluer(`location.hash = '#exemple=minimal'; location.reload()`).catch(() => {})
  await patienter(4000)
  await evaluer(`document.getElementById('mode-creation').click()`)
  await patienter(400)
  await evaluer(`document.querySelector('#fichiers .fichier.neuf').click()`)
  await patienter(600)
  await evaluer("document.getElementById('nom-champ').value = 'personnages.cpp'")
  await evaluer("document.getElementById('boite-nom').requestSubmit()")
  await patienter(900)
  const compteur = () => evaluer(`document.getElementById('groupe-personnages')?.textContent ?? '(pas de groupe)'`)
  controle('personnages.cpp vide : « 📁 personnages (0) »', (await compteur()).startsWith('📁 personnages (0)'), ` (${await compteur()})`)
  await evaluer(`(() => {
    const champ = document.getElementById('source')
    champ.value = '#include <Perso>\\nPerso SOLO = {\\n' + Array(16).fill('  "0000333333330000",').join('\\n') + '\\n};\\n'
    champ.dispatchEvent(new Event('input'))
  })()`)
  await patienter(1200)
  controle('un Perso tapé dans personnages.cpp : « 📁 personnages (1) », pendant la frappe', (await compteur()).startsWith('📁 personnages (1)'), ` (${await compteur()})`)

  /*
   * 13. Une leçon MISE À JOUR ne revient pas dans son ancienne version.
   * L'atelier avait retenu l'ANCIENNE 35.4 (les dessins dans la source) ; à la
   * réouverture, c'est la nouvelle qui doit s'ouvrir, et « ↶ » rendre l'ancienne.
   */
  const ancienne354 = '// ---- #include <sprite32> : un grand personnage de 32 × 32 ----\n#include <sprite32>\n#include <sprite16>\n#include <Perso>\nPerso PETIT = {\n' +
    Array(16).fill('  "################",').join('\n') + '\n};\nint main() {\n  sprite16(16, 16, 16, PETIT);\n  while (true) { image(); }\n}\n'
  await evaluer(`(() => {
    localStorage.setItem('gameboy3-mode', 'lecons')
    localStorage.setItem('gameboy3-lecon', JSON.stringify({ lecons: { titre: 'La fonction sprite32() — un grand personnage de 32 × 32', place: 0 } }))
    localStorage.setItem('gameboy3-programme', JSON.stringify({ fichiers: [['principal.cpp', ${JSON.stringify(ancienne354)}]], ouvert: 'principal.cpp' }))
    localStorage.removeItem('gameboy3-lecon-empreinte')
    location.hash = ''
    location.reload()
  })()`).catch(() => {})
  await patienter(4500)
  const rouverte = await evaluer(`({
    titre: document.getElementById('lecon-titre').textContent,
    source: document.getElementById('source').value,
    onglets: [...document.querySelectorAll('#fichiers .fichier')].map((f) => f.textContent.replace(/[●×]/g, '').trim()),
    repere: document.getElementById('lecon-reperes').textContent,
  })`)
  controle('la page se rouvre sur la 35.4', rouverte.titre.includes('sprite32()'), ` (${rouverte.titre})`)
  controle('dans sa NOUVELLE version : la source n’appelle que, sans dessin', rouverte.source.includes('sprite32(0, 64, y, GEANT)') && !/Perso \\w+ = \\{/.test(rouverte.source))
  controle('les deux dessins, chacun dans son onglet : perso_GEANT.cpp et perso_BONHOMME.cpp', ['perso_GEANT.cpp', 'perso_BONHOMME.cpp'].every((n) => rouverte.onglets.some((o) => o.startsWith(n))), ` (${rouverte.onglets.join(', ')})`)
  controle('et la leçon le dit : « leçon mise à jour »', rouverte.repere.includes('leçon mise à jour'))
  await evaluer(`document.getElementById('annuler').click()`)
  await patienter(1200)
  controle('« ↶ » rend l’ancienne version', (await evaluer(`document.getElementById('source').value`)).includes('Perso PETIT = {'))
  await evaluer(`document.getElementById('refaire')?.click()`)
  await patienter(800)
  await evaluer(`location.reload()`).catch(() => {})
  await patienter(4500)
  const deNouveau = await evaluer(`({ source: document.getElementById('source').value, repere: document.getElementById('lecon-reperes').textContent })`)
  controle('rouverte encore : la nouvelle version reste, sans le message', deNouveau.source.includes('GEANT') && !deNouveau.repere.includes('mise à jour'))
  await evaluer(`localStorage.setItem('gameboy3-mode', 'creation')`)

  // 7. Aucune erreur.
  controle('aucune erreur JavaScript dans la page', erreurs.length === 0, erreurs.length ? ` — ${erreurs[0].split('\n')[0]}` : '')
} finally {
  prise.close()
  navigateur.kill()
  await patienter(300)
  try { rmSync(profil, { recursive: true, force: true }) } catch { /* il partira seul */ }
}

console.log()
console.log(echecs ? echecs + ' contrôle(s) en échec' : 'tout est vert')
process.exit(echecs ? 1 : 0)

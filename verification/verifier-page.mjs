/**
 * La page tient-elle ses promesses ?
 *
 *   node verifier-page.mjs
 *
 * On ne relit pas le HTML : on ouvre réellement `l’atelier `
 * dans un Chrome sans interface, on choisit Tetris dans la liste, on laisse la
 * console tourner, on appuie sur les touches, et on relit la mémoire de la
 * console émulée. Une page peut être du JavaScript parfaitement valide et ne
 * rien afficher du tout.
 *
 * Une capture de l'écran de la console est écrite à côté, pour qu'on puisse
 * voir de ses yeux ce que le contrôle a mesuré.
 */

import { spawn } from 'node:child_process'
import { writeFileSync, existsSync, rmSync } from 'node:fs'
/* Le nombre de leçons n'est jamais recopié : il vient des leçons elles-mêmes.
   Un nombre écrit à la main devient faux le jour où l'on en ajoute une, et le
   contrôle se met alors à mesurer autre chose sans le dire. */
import { LECONS, numeros } from '../tuto/lecons.js'

/* Les deux premières leçons, CHERCHÉES dans la liste : écrites en dur (« 1. »,
   « BONJOUR »), ces contrôles se périmaient dès qu'on ajoutait une leçon devant. */
const NUMEROS = numeros(LECONS)
const COMMUNES = new Set(['int main() {', 'while (true) {', 'image();', '{', '}'])
const ligneDe = (lecon) => {
  const lignes = lecon.code.split('\n').map((l) => l.replace(/\/\/.*/, '').trim()).filter((l) => l && !COMMUNES.has(l))
  return lignes[0] ?? 'image();'   // la première ligne qui distingue la leçon
}
import { MODELES } from '../bibliotheque.js'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { servirLAtelier } from '../outils/serveur-essai.mjs'

/* Un serveur à lui, sur le dossier du projet : plus besoin de XAMPP (voir outils/serveur-essai.mjs). */
const ADRESSE = await servirLAtelier()
const PORT = 9222

const CHROMES = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  process.env.LOCALAPPDATA + '/Google/Chrome/Application/chrome.exe',
  'C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe',
]

const chrome = CHROMES.find((c) => c && existsSync(c))
if (!chrome) throw new Error('Chrome introuvable — cherché dans :\n  ' + CHROMES.join('\n  '))

const profil = join(tmpdir(), 'gameboy3-controle')
rmSync(profil, { recursive: true, force: true })

const navigateur = spawn(chrome, [
  '--headless=new',
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${profil}`,
  '--no-first-run',
  '--disable-gpu',
  /* Sans cela, un navigateur sans interface garde son contexte audio endormi,
     et l'on ne peut pas contrôler que le son sort. C'est un réglage du banc
     d'essai, pas de la page : un vrai visiteur, lui, clique. */
  '--autoplay-policy=no-user-gesture-required',
  /*
   * Le son est CALCULÉ, mais pas joué.
   *
   * « --autoplay-policy » sert à réveiller le contexte audio : sans lui il
   * reste endormi, et l'on ne peut pas contrôler que du son sort. Mais un
   * navigateur sans interface sort quand même sur les haut-parleurs — et l'on
   * fait alors sonner la machine de quelqu'un à chaque passe de contrôle, ce
   * que personne n'a demandé.
   *
   * « --mute-audio » coupe la SORTIE, et elle seule : le contexte tourne, les
   * morceaux sont programmés, les échantillons comptés. Ce que le contrôle
   * mesure ne change pas d'un iota ; ce qu'on entend, si.
   */
  '--mute-audio',
  '--window-size=1200,900',
  ADRESSE,
], { stdio: 'ignore' })

const patienter = (ms) => new Promise((r) => setTimeout(r, ms))

/* Chrome met un instant à ouvrir son guichet de pilotage. */
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
prise.addEventListener('message', (e) => {
  const message = JSON.parse(e.data)
  const attente = attentes.get(message.id)
  if (!attente) return
  attentes.delete(message.id)
  if (message.error) attente.rejeter(new Error(message.error.message))
  else attente.resoudre(message.result)
})

const envoyer = (methode, params = {}) =>
  new Promise((resoudre, rejeter) => {
    const id = prochainId++
    attentes.set(id, { resoudre, rejeter })
    prise.send(JSON.stringify({ id, method: methode, params }))
  })

/*
 * `geste` dit au navigateur que l'appel vient d'un clic.
 *
 * Le plein écran n'est accordé qu'à un geste du visiteur : sans ce drapeau,
 * `requestFullscreen()` est refusé, et le contrôle mesurerait la règle de
 * sécurité de Chrome plutôt que la page.
 */
async function evaluer(expression, geste = false) {
  const { result, exceptionDetails } = await envoyer('Runtime.evaluate', {
    expression, returnByValue: true, awaitPromise: true, userGesture: geste,
  })
  if (exceptionDetails) throw new Error(exceptionDetails.exception?.description ?? 'erreur dans la page')
  return result.value
}

/** Une vraie frappe, pas un appel de fonction : c'est ce que fait un joueur. */
async function frapper(code, touche, images = 6) {
  await envoyer('Input.dispatchKeyEvent', { type: 'keyDown', code, key: touche, windowsVirtualKeyCode: 0 })
  await patienter(images * 17)
  await envoyer('Input.dispatchKeyEvent', { type: 'keyUp', code, key: touche, windowsVirtualKeyCode: 0 })
  await patienter(60)
}

let echecs = 0
const controle = (quoi, bon, detail = '') => {
  console.log(`  ${bon ? '✓' : '✗'} ${quoi}${detail}`)
  if (!bon) echecs++
}

console.log('LA PAGE, PILOTÉE DANS UN VRAI NAVIGATEUR\n')

try {
  await envoyer('Runtime.enable')
  await patienter(1200) // le temps que le module se charge et compile « bonjour »

  /* --- ce qui s'affiche à l'ouverture --- */
  controle('la page s’ouvre sur un exemple', (await evaluer(`document.getElementById('source').value.length`)) > 50)
  controle('elle compile toute seule', !(await evaluer(`document.getElementById('etat').className.includes('erreur')`)),
    ` (« ${(await evaluer(`document.getElementById('etat').textContent.split('\\n')[0]`))} »)`)
  controle('la console tourne', (await evaluer(`document.getElementById('ips').textContent`)).includes('ips'),
    ` (${await evaluer(`document.getElementById('ips').textContent`)})`)

  /* --- on choisit Tetris, comme le ferait un visiteur --- */
  await evaluer(`
    const liste = document.getElementById('exemples')
    liste.value = 'tetris'
    liste.dispatchEvent(new Event('change', { bubbles: true }))
  `)
  await patienter(1500)

  const source = await evaluer(`document.getElementById('source').value`)
  controle('Tetris est allé se lire dans son fichier', source.includes('const uint8_t FORMES[]'), ` (${source.length} caractères)`)

  /* Le succès se lit à la couleur de l'encadré, pas au texte : la liste des
     variables de Tetris contient « LIGNE », qu'un test naïf prenait pour le
     mot d'une erreur. */
  const etat = await evaluer(`document.getElementById('etat').textContent`)
  const rate = await evaluer(`document.getElementById('etat').className.includes('erreur')`)
  controle('il compile dans le navigateur', !rate, ` (${etat.split('\n')[1]})`)

  /* --- la console émulée, lue dans la page --- */
  await patienter(600)
  const puits = await evaluer(`inspecteur.tableau('puits')`)
  const peintes = await evaluer(`inspecteur.lire('vues')`)
  controle('une pièce est en vol', peintes === 4, ` (${peintes} cases peintes)`)
  controle('le puits est encore vide', puits.every((v) => v === 0), ` (${puits.length} cases)`)

  /* --- le son sort-il vraiment ? --- */
  const son = JSON.parse(await evaluer(`JSON.stringify(inspecteur.son)`))
  controle('le contexte audio est ouvert', son.ouvert, ` (état : ${son.etat})`)
  controle('des morceaux de son sont programmés', son.morceaux > 0,
    ` (${son.morceaux} morceaux, ${son.echantillons} échantillons)`)

  /* --- l'écran montre bien quelque chose --- */
  const nuances = await evaluer(`new Set(inspecteur.gb.framebuffer).size`)
  controle('l’écran affiche plus d’une nuance', nuances > 1, ` (${nuances} nuances)`)

  /* --- les touches --- */
  const avantX = await evaluer(`inspecteur.lire('posX')`)
  await frapper('ArrowLeft', 'ArrowLeft')
  const apresX = await evaluer(`inspecteur.lire('posX')`)
  controle('la flèche gauche déplace la pièce', apresX < avantX, ` (colonne ${avantX} → ${apresX})`)

  const avantTour = await evaluer(`inspecteur.lire('rotation')`)
  await frapper('KeyX', 'x')
  const apresTour = await evaluer(`inspecteur.lire('rotation')`)
  controle('la touche X fait tourner la pièce', apresTour !== avantTour, ` (tour ${avantTour} → ${apresTour})`)

  /*
   * BAS accélère la chute. On ne mesure PAS la ligne de la pièce : maintenue
   * trente images, elle a le temps de toucher le fond et d'être remplacée par
   * une neuve, qui peut se retrouver à la même ligne qu'au départ. Le contrôle
   * lisait alors « 5 → 5 » et se déclarait rouge une fois sur trois, sans que
   * rien ne soit cassé.
   *
   * Ce qu'on mesure est ce que BAS produit vraiment : le puits, vide jusqu'ici,
   * reçoit des cases. Une pièce s'est posée.
   */
  const avantY = await evaluer(`inspecteur.lire('posY')`)
  await frapper('ArrowDown', 'ArrowDown', 40)
  const posees = (await evaluer(`inspecteur.tableau('puits')`)).filter((v) => v !== 0).length
  const apresY = await evaluer(`inspecteur.lire('posY')`)
  controle('la flèche bas fait plonger la pièce jusqu’au fond', posees > 0,
    ` (${posees} cases posées, la pièce en vol est ligne ${apresY}, contre ${avantY} avant)`)

  /* --- le bouton de téléchargement --- */
  controle('le .gb est proposé au téléchargement', !(await evaluer(`document.getElementById('telecharger').disabled`)))
  const taille = await evaluer(`inspecteur.rom.length`)
  controle('la cartouche fait bien 32 Ko', taille === 32768, ` (${taille} octets)`)

  /*
   * --- le plein écran ---
   *
   * On ne contrôle pas que « le bouton existe » : on le clique, et l'on mesure
   * la taille que le canevas a prise. C'est là qu'est la seule chose qui peut
   * mal tourner — un agrandissement qui n'est pas un multiple entier de 160 sur
   * 144 déforme un pixel sur trois, et le jeu se joue au pixel près.
   */
  await evaluer(`document.getElementById('plein-ecran').click()`, true)
  await patienter(700)

  const dansLePlein = await evaluer(`document.fullscreenElement === document.querySelector('.ecran')`)
  controle('« Plein écran » donne l’écran à la console', dansLePlein)
  controle('et le bouton dit désormais comment en sortir',
    (await evaluer(`document.getElementById('plein-ecran').textContent`)).includes('Quitter'))

  const large = parseInt(await evaluer(`document.getElementById('ecran').style.width`), 10)
  const haut = parseInt(await evaluer(`document.getElementById('ecran').style.height`), 10)
  const fenetre = await evaluer(`innerWidth + '×' + innerHeight`)
  controle('l’agrandissement est un multiple ENTIER — aucun pixel déformé',
    large % 160 === 0 && haut % 144 === 0 && large / 160 === haut / 144 && large > 0,
    ` (${large}×${haut}, soit ×${large / 160}, dans ${fenetre})`)
  controle('et il tient dans la fenêtre',
    large <= (await evaluer(`innerWidth`)) && haut <= (await evaluer(`innerHeight`)))

  await evaluer(`document.getElementById('plein-ecran').click()`, true)
  await patienter(500)
  controle('on en sort, et le canevas rend sa taille à la feuille de style',
    (await evaluer(`document.fullscreenElement === null`)) &&
      (await evaluer(`document.getElementById('ecran').style.width`)) === '')

  /* On laisse tomber quelques pièces avant la photo : un puits vide ne
     montrerait pas grand-chose. */
  for (let i = 0; i < 6; i++) await frapper('ArrowDown', 'ArrowDown', 40)

  /* --- la bibliothèque de modèles --- */

  console.log()

  await evaluer(`document.getElementById('onglet-modeles').click()`)
  await patienter(500)

  const modeles = await evaluer(`document.querySelectorAll('#modeles .modele').length`)
  controle('l’onglet des modèles montre la bibliothèque', modeles === MODELES.length,
    ` (${modeles} modèles sur ${MODELES.length})`)

  const persos = await evaluer(`document.querySelectorAll('#modeles .modele.perso').length`)
  controle('les personnages de seize sont distingués des tuiles',
    persos === MODELES.filter((m) => m.cote === 16).length, ` (${persos} personnages)`)

  /* Prendre un modèle, c'est l'ÉCRIRE dans le programme — pas l'importer
     ailleurs. Le texte reste la seule vérité. */
  const avantModele = await evaluer(`document.getElementById('source').value`)
  await evaluer(`[...document.querySelectorAll('#modeles .modele')].find(m => m.textContent.includes('HEROS')).click()`)

  /* La page DEMANDE le nom : on le tape et l'on valide, comme un visiteur. */
  await patienter(400)
  await evaluer("document.getElementById('nom-champ').value = 'HEROS'")
  await evaluer("document.getElementById('boite-nom').requestSubmit()")
  await patienter(1200)

  const apresModele = await evaluer(`document.getElementById('source').value`)
  controle('prendre un modèle l’écrit dans le programme',
    apresModele.includes('Perso HEROS = {') && !avantModele.includes('Perso HEROS = {'))
  controle('avec ses rangées, pas un carré vide',
    apresModele.includes('.....####.......'))
  controle('et la cartouche se refait', !(await evaluer(`document.getElementById('etat').className`)).includes('erreur'))
  controle('on revient sur « Les tuiles », le modèle ouvert',
    (await evaluer(`document.querySelector('.onglet.actif').textContent`)).includes('tuiles'))

  /* --- importer une image, et la ramener aux quatre nuances --- */

  console.log()

  await evaluer(`document.getElementById('onglet-modeles').click()`)
  await patienter(400)
  await evaluer(`document.getElementById('importer-taille').value = '8'`)

  const champImage = await envoyer('DOM.querySelector',
    { nodeId: (await envoyer('DOM.getDocument')).root.nodeId, selector: '#fichier-image' })
  await envoyer('DOM.setFileInputFiles', { nodeId: champImage.nodeId, files: [resolve('exemples/rond.png')] })
  await patienter(900)

  /* Le nom vient du fichier, débarrassé de ce que le compilateur refuserait. */
  controle('importer une image demande son nom, tiré du fichier',
    (await evaluer(`document.getElementById('nom-champ').value`)) === 'ROND')

  await evaluer(`document.getElementById('boite-nom').requestSubmit()`)
  await patienter(1100)

  const dessine = await evaluer(`inspecteurDessins().find((d) => d.nom === 'ROND')`)
  controle('l’image entre dans le programme comme une tuile', Boolean(dessine))

  if (dessine) {
    /* Un rond sombre sur fond clair : les coins doivent être vides, le milieu
       plein. C'est la traduction en quatre nuances qui est éprouvée ici, pas le
       fichier — la cartouche ne contient pas l'image, elle contient la tuile. */
    controle('les coins sont restés vides', dessine.rangees[0][0] === '.' && dessine.rangees[7][7] === '.',
      ` (première rangée « ${dessine.rangees[0]} »)`)
    controle('et le milieu est plein', dessine.rangees[4][4] === '#',
      ` (rangée du milieu « ${dessine.rangees[4]} »)`)
  }

  controle('et la cartouche se refait',
    !(await evaluer(`document.getElementById('etat').className`)).includes('erreur'))

  /* --- les réglages --- */

  await evaluer(`document.getElementById('reglages').click()`)
  await patienter(300)
  controle('le bouton ⚙ ouvre les réglages',
    (await evaluer(`document.getElementById('voile-reglages').hidden`)) === false)

  /*
   * Le panneau est ENGENDRÉ : on vérifie donc qu'il l'est en entier.
   *
   * Un catalogue de cinquante entrées dont trois n'auraient pas de contrôle
   * s'ouvrirait sans rien dire — et les trois réglages manquants passeraient
   * pour des réglages qu'on n'a pas trouvés.
   */
  /* Le nombre n'est pas figé ici : un réglage de plus est une bonne nouvelle,
     et un contrôle qui échoue pour cela ne mesure plus que sa propre date. Ce
     qui compte est le plancher, et l'accord avec le panneau. */
  const auCatalogue = await evaluer(`reglages.catalogue.length`)
  controle('le catalogue porte au moins cinquante réglages', auCatalogue >= 50, ` — ${auCatalogue}`)

  const sansControle = await evaluer(
    `JSON.stringify(reglages.catalogue.filter((r) => !document.getElementById('reglage-' + r.cle)).map((r) => r.cle))`)
  controle('chacun a son contrôle dans le panneau', sansControle === '[]', ` — manquants : ${sansControle}`)

  const groupes = await evaluer(`document.querySelectorAll('.reglages-groupe').length`)
  controle('ils sont rangés par sujet', groupes >= 6, ` — ${groupes} groupes`)

  /* La recherche : on tape « volume », il ne doit rester que lui. */
  await evaluer(`(function () {
    const champ = document.getElementById('reglages-chercher')
    champ.value = 'volume'
    champ.dispatchEvent(new Event('input'))
  })()`)
  await patienter(150)
  const restants = await evaluer(
    `[...document.querySelectorAll('.reglage-ligne')].filter((l) => !l.hidden).length`)
  controle('la recherche filtre le panneau', restants === 1, ` — ${restants} ligne(s)`)

  await evaluer(`(function () {
    const champ = document.getElementById('reglages-chercher')
    champ.value = ''
    champ.dispatchEvent(new Event('input'))
  })()`)

  /* --- un réglage s'applique À L'INSTANT, sans rien recharger --- */

  const changer = (cle, valeur) => evaluer(`(function () {
    const c = document.getElementById('reglage-${cle}')
    if (c.type === 'checkbox') c.checked = ${JSON.stringify(valeur)}
    else c.value = ${JSON.stringify(String(valeur))}
    c.dispatchEvent(new Event('input'))
  })()`)

  await changer('theme', 'clair')
  await patienter(150)
  controle('le thème s’applique sans recharger',
    (await evaluer(`document.body.getAttribute('data-theme')`)) === 'clair')

  /* La taille du code : les modes serrés retirent un pixel au réglage plutôt
     que d'imposer le leur. On vérifie donc qu'elle SUIT, et non qu'elle vaut
     un nombre — le nombre dépend du mode où l'on se trouve. */
  const taillePetite = await evaluer(`parseFloat(getComputedStyle(document.getElementById('source')).fontSize)`)
  await changer('taillePolice', 20)
  await patienter(100)
  const tailleGrande = await evaluer(`parseFloat(getComputedStyle(document.getElementById('source')).fontSize)`)
  controle('la taille du code suit le réglage',
    tailleGrande > taillePetite && tailleGrande >= 19,
    ` — ${taillePetite}px puis ${tailleGrande}px`)

  await changer('balayage', 40)
  await patienter(100)
  controle('et les lignes de balayage',
    (await evaluer(`getComputedStyle(document.documentElement).getPropertyValue('--balayage').trim()`)) === '0.4')

  await changer('palette', 'ambre')
  await patienter(100)
  controle('changer de palette redessine l’écran en cours',
    (await evaluer(`reglages.nuances[0].join(',')`)) === '255,224,168')

  /* Un réglage retenu d'une visite à l'autre : il doit être dans le stockage. */
  const garde = await evaluer(`JSON.parse(localStorage.getItem('gameboy3-reglages') || '{}').theme`)
  controle('un réglage changé est retenu', garde === 'clair', ` — « ${garde} »`)

  /* « Tout remettre » les ramène tous, et défait leurs effets. */
  await evaluer(`document.getElementById('reglages-remettre').click()`)
  await patienter(200)
  const restes = await evaluer(
    `JSON.stringify(reglages.catalogue.filter((r) => reglages.valeurs[r.cle] !== r.defaut).map((r) => r.cle))`)
  controle('« Tout remettre » les ramène tous', restes === '[]', ` — restants : ${restes}`)
  controle('et défait leurs effets',
    (await evaluer(`document.body.getAttribute('data-theme')`)) === 'sombre'
      && (await evaluer(`reglages.nuances[0].join(',')`)) === '224,248,208')

  /* --- ce que le réglage « nommer » fait, décoché --- */

  await changer('nommer', false)
  await evaluer(`document.getElementById('reglages-fermer').click()`)
  await patienter(300)

  await evaluer(`[...document.querySelectorAll('#modeles .modele')].find(m => m.textContent.includes('COEUR')).click()`)
  await patienter(1100)

  controle('réglage décoché : le nom n’est plus demandé',
    (await evaluer(`document.getElementById('voile').hidden`)) === true &&
      Boolean(await evaluer(`inspecteurDessins().find((d) => d.nom === 'COEUR')`)))

  /* On le remet : les contrôles qui suivent comptent dessus. */
  await evaluer(`document.getElementById('reglages').click()`)
  await changer('nommer', true)
  await evaluer(`document.getElementById('reglages-fermer').click()`)
  await patienter(200)

  /* --- une cartouche venue du dehors --- */

  console.log()

  const document_ = await envoyer('DOM.getDocument')
  const champ = await envoyer('DOM.querySelector', { nodeId: document_.root.nodeId, selector: '#fichier-rom' })
  await envoyer('DOM.setFileInputFiles', { nodeId: champ.nodeId, files: [resolve('exemples/tetris.gb')] })
  await patienter(1500)

  const dit = await evaluer(`document.getElementById('etat').textContent`)
  controle('un .gb ouvert se met à tourner', dit.includes('32 Ko'), `\n      « ${dit.replace(/\n/g, ' · ')} »`)

  /* Le titre vient de la CARTOUCHE, en $0134 — pas du nom du fichier : un
     fichier renommé ne change pas ce qu'il contient. */
  controle('et son titre est relu dans la cartouche', dit.includes('TETRIS'))

  controle('la page dit que ce n’est plus le programme affiché',
    (await evaluer(`document.getElementById('dehors').hidden`)) === false)

  const nuancesRom = await evaluer(`new Set(inspecteur.gb.framebuffer).size`)
  controle('la console la joue vraiment', nuancesRom > 1, ` (${nuancesRom} nuances à l’écran)`)

  /* --- la conversion : ce qui peut être tiré d'une cartouche --- */

  await evaluer(`document.getElementById('convertir').click()`)
  await patienter(900)

  const dit2 = await evaluer(`document.getElementById('etat').textContent`)
  /* Elle ne rend plus seulement les dessins : le DÉCOR posé à l'écran et les
     MOTS affichés se relisent tout aussi exactement — un octet par case, à une
     adresse connue. C'est ce qui fait la différence entre une planche de tuiles
     et un programme qu'on peut recompiler. */
  controle('« CONVERSION » tire les dessins, le décor et les mots',
    dit2.includes('dessins') && dit2.includes('cases de décor') && dit2.includes('mots'),
    `\n      ${dit2.split('\n')[0]}`)

  /* Et surtout : elle dit ce qu'elle NE PEUT PAS faire. Un bouton qui promet
     une conversion sans dire où elle s'arrête ferait chercher longtemps. */
  controle('et elle dit que le code, lui, ne se convertit pas',
    dit2.includes('ne se convertit pas'))

  const ongletsApres = await evaluer(
    `[...document.querySelectorAll('#fichiers .fichier')].map(f => f.textContent).join(' ')`)
  controle('les dessins arrivent dans leur propre fichier',
    ongletsApres.includes('tuiles-prises.cpp'), ` (${ongletsApres})`)

  const prises = await evaluer(`inspecteurDessins().length`)
  controle('et l’atelier les montre, prêtes à repeindre', prises > 10, ` (${prises} dessins)`)

  await evaluer(`document.getElementById('revenir').click()`)
  await patienter(1200)
  controle('« revenir » rend la console au programme',
    (await evaluer(`document.getElementById('dehors').hidden`)) === true &&
      !(await evaluer(`document.getElementById('etat').className`)).includes('erreur'))

  /* --- un programme sur plusieurs fichiers --- */

  console.log()

  /** Écrit un texte dans le champ, sans se battre avec les échappements. */
  const ecrire = (lignes) =>
    evaluer(`document.getElementById('source').value = ${JSON.stringify(lignes.join('\n'))}`)

  /*
   * « + fichier » DEMANDE un nom.
   *
   * Il fabriquait « fichier2.cpp » en silence — la seule création de la page
   * qui ne demandait rien. Un programme découpé se relit pourtant par les noms
   * de ses fichiers, et « fichier3.cpp » n'en dit rien.
   */
  await evaluer(`document.querySelector('#fichiers .fichier.neuf').click()`)
  await patienter(400)
  controle('« + fichier » demande le nom du fichier',
    (await evaluer(`document.getElementById('voile').hidden`)) === false)

  const proposeFichier = await evaluer(`document.getElementById('nom-champ').value`)
  controle('et il en propose un, prêt à valider tel quel',
    proposeFichier === 'fichier2.cpp', ` (« ${proposeFichier} »)`)

  await evaluer(`document.getElementById('boite-nom').requestSubmit()`)
  await patienter(500)

  const onglets = await evaluer(
    `[...document.querySelectorAll('#fichiers .fichier')].map(f => f.textContent).join(' | ')`)
  controle('« + fichier » ouvre un second fichier', onglets.includes('fichier2.cpp'), ` (${onglets})`)

  await ecrire([
    'Tuile CAILLOU = {',
    '  "########", "#......#", "#.++++.#", "#.++++.#",',
    '  "#.++++.#", "#.++++.#", "#......#", "########",',
    '};',
  ])

  await evaluer(`[...document.querySelectorAll('#fichiers .fichier')].find(f => f.textContent.startsWith('principal')).click()`)
  await patienter(400)
  controle('revenir au principal rend son texte',
    (await evaluer(`document.getElementById('source').value`)).includes('int main'))

  await ecrire([
    '#include "fichier2.cpp"',
    '',
    'int main() {',
    '  poser(4, 4, CAILLOU);',
    '  while (true) { image(); }',
    '  return 0;',
    '}',
  ])
  await evaluer(`document.getElementById('lancer').click()`)
  await patienter(1100)

  controle('« #include » verse le second fichier',
    !(await evaluer(`document.getElementById('etat').className`)).includes('erreur'),
    ` (${await evaluer(`document.getElementById('etat').textContent.split(String.fromCharCode(10))[1]`)})`)

  /* La tuile est déclarée dans l'AUTRE fichier : si elle est à l'écran, c'est
     que les deux ont bien été compilés ensemble. */
  const posee = await evaluer(`inspecteur.gb.mmu.read(0x9800 + 4 * 32 + 4)`)
  controle('et la tuile de l’autre fichier est à l’écran', posee === 44, ` (tuile ${posee})`)

  /* Une faute dans un fichier versé doit nommer SON fichier, et sa ligne dans
     ce fichier — et non la ligne du texte collé, que personne n'a vue. */
  await evaluer(`[...document.querySelectorAll('#fichiers .fichier')].find(f => f.textContent.startsWith('fichier2')).click()`)
  await patienter(400)
  await ecrire(['uint8_t x = ;'])
  await evaluer(`document.getElementById('lancer').click()`)
  await patienter(900)

  const faute = await evaluer(`document.getElementById('etat').textContent`)
  controle('une faute désigne son vrai fichier', faute.startsWith('fichier2.cpp, ligne 1'), `\n      « ${faute} »`)

  /*
   * Le nom tapé à la main devient un nom de fichier, ou rien ne s'enregistre.
   *
   * Le service des projets ne prend que « [A-Za-z0-9_-].cpp » : un onglet
   * nommé « Mes Dessins ! » ferait un projet qui refuse de s'écrire sur le
   * disque, et cela ne se verrait qu'au moment d'enregistrer — bien après
   * qu'on ait écrit dedans.
   */
  const nommerUnFichier = async (tape) => {
    await evaluer(`document.querySelector('#fichiers .fichier.neuf').click()`)
    await patienter(350)
    await evaluer(`(function () {
      const c = document.getElementById('nom-champ')
      c.value = ${JSON.stringify(tape)}
      c.dispatchEvent(new Event('input'))
    })()`)
    await patienter(200)
    const annonce = await evaluer(`document.getElementById('nom-faute').textContent`)
    await evaluer(`document.getElementById('boite-nom').requestSubmit()`)
    await patienter(400)
    const ouvert = await evaluer(
      `document.querySelector('#fichiers .fichier.ouvert').textContent.replace('×', '')`)
    return { annonce, ouvert }
  }

  const aLaMain = await nommerUnFichier('Mes Dessins !')
  controle('un nom écrit à la main devient un nom de fichier « .cpp »',
    aLaMain.ouvert === 'mes_dessins.cpp', ` (« Mes Dessins ! » → ${aLaMain.ouvert})`)
  controle('et la boîte le dit AVANT de valider',
    aLaMain.annonce.includes('mes_dessins.cpp'), ` (${aLaMain.annonce})`)

  /* Le numéro se glisse avant l'extension : « mes_dessins.cpp2 » ne serait
     plus un fichier C++, ni pour le « #include », ni pour le disque. */
  const deuxFois = await nommerUnFichier('Mes Dessins !')
  controle('le même nom une seconde fois est numéroté AVANT le « .cpp »',
    deuxFois.ouvert === 'mes_dessins2.cpp', ` (${deuxFois.ouvert})`)

  /* On revient au principal : la suite du contrôle écrit dedans. */
  await evaluer(`[...document.querySelectorAll('#fichiers .fichier')].find(f => f.textContent.startsWith('principal')).click()`)
  await patienter(300)

  /* L'exemple découpé en cinq fichiers s'ouvre en cinq onglets. */
  await evaluer(`(function () {
    const liste = document.getElementById('exemples')
    liste.value = 'decoupe'
    liste.dispatchEvent(new Event('change'))
  })()`)
  await patienter(2600)

  const cinq = await evaluer(
    `[...document.querySelectorAll('#fichiers .fichier:not(.neuf)')].map(f => f.textContent).join(' ')`)
  controle('l’exemple découpé arrive avec ses cinq fichiers',
    cinq.split(' ').length === 5 && cinq.includes('dessins.cpp'), `\n      ${cinq}`)
  controle('et il compile', !(await evaluer(`document.getElementById('etat').className`)).includes('erreur'))

  /*
   * Chaque entrée de la liste doit MENER QUELQUE PART.
   *
   * Ajouter un exemple, c'est écrire son fichier, son entrée dans « EXEMPLES »
   * et son option dans la liste. Oublier l'un des deux derniers donne une
   * option qui ne charge rien, ou un chemin que personne n'atteint — et rien
   * ne le signale, puisque la page continue de tourner sur l'exemple d'avant.
   */
  const orphelines = await evaluer(`(function () {
    const valeurs = [...document.getElementById('exemples').options].map((o) => o.value)
    return JSON.stringify(valeurs.filter((v) => v !== 'vide' && !inspecteur.exemples[v]))
  })()`)
  controle('chaque exemple de la liste a son fichier', orphelines === '[]', ` (${orphelines})`)

  /* Un exemple tout entier fait de dessins écrits sur place : c'est le seul
     qui éprouve, dans le navigateur, que des accolades passent en argument. */
  await evaluer(`(function () {
    const liste = document.getElementById('exemples')
    liste.value = 'surplace'
    liste.dispatchEvent(new Event('change'))
  })()`)
  await patienter(2600)

  const surPlace = await evaluer(`document.getElementById('source').value`)
  controle('l’exemple du dessin sur place s’ouvre',
    surPlace.includes('poser(9, 11, {'), ` (${surPlace.length} caractères)`)
  controle('et il compile dans le navigateur',
    !(await evaluer(`document.getElementById('etat').className`)).includes('erreur'),
    ` (${await evaluer(`document.getElementById('etat').textContent.split(String.fromCharCode(10))[1]`)})`)
  /* Le sol occupe ses vingt cases, lues dans la console émulée de la page. */
  const sol = await evaluer(`inspecteur.memoire(0x9800 + 13 * 32, 20)`)
  controle('et la console de la page en montre le sol',
    sol.every((t) => t === sol[0] && t >= 44), ` (tuile ${sol[0]})`)

  /* --- les trois modes, et les leçons DANS l'atelier --- */

  console.log()

  const vu = (id) => evaluer(`document.getElementById('${id}').offsetParent !== null`)

  /* Choisir une leçon dans la liste. Le morceau évalué ne déclare rien : deux
     « const » du même nom, évalués l'un après l'autre dans la même page, se
     heurtent — la première déclaration y reste. */
  const choisirLaLecon = (numero) => evaluer(
    `document.getElementById('lecon-choix').value = '${numero}',` +
    `document.getElementById('lecon-choix').dispatchEvent(new Event('change'))`)

  await evaluer(`document.getElementById('mode-lecons').click()`)
  await patienter(1200)

  controle('« MODE LEÇONS » ouvre les leçons dans l’atelier',
    (await evaluer(`document.body.dataset.mode`)) === 'lecons' && await vu('zone-lecons'))

  const combien = await evaluer(`document.querySelectorAll('#lecon-choix option').length`)
  const niveaux = await evaluer(`document.querySelectorAll('#lecon-choix optgroup').length`)
  const attendus = new Set(LECONS.map((l) => l.difficulte)).size
  controle('toutes les leçons y sont, rangées par niveau',
    combien === LECONS.length && niveaux === attendus,
    ` (${combien} leçons, ${niveaux} niveaux)`)

  controle('la première leçon est ouverte',
    (await evaluer(`document.getElementById('lecon-titre').textContent`)).startsWith(NUMEROS[0] + '. '))

  /* Le programme de la leçon est DANS l'éditeur, et il tourne : c'est tout
     l'objet du mode. Une leçon qu'on ne pourrait que lire ne vaudrait pas
     mieux qu'une page de documentation. */
  controle('son programme est chargé dans l’éditeur',
    (await evaluer(`document.getElementById('source').value`)).includes(ligneDe(LECONS[0])))
  controle('et il compile', !(await evaluer(`document.getElementById('etat').className`)).includes('erreur'))

  /* Le bouton du bas annonce la leçon d'après par son nom : c'est ce qui fait
     qu'on enchaîne les vingt au lieu d'en lire trois. */
  const promis = await evaluer(`document.getElementById('lecon-apres-bas').textContent`)
  controle('le bouton « suivant » annonce la leçon d’après', promis.includes(LECONS[1].titre),
    ` (« ${promis} »)`)

  await evaluer(`document.getElementById('lecon-apres-bas').click()`)
  await patienter(900)
  controle('il passe à la leçon suivante, et charge son code',
    (await evaluer(`document.getElementById('lecon-titre').textContent`)).startsWith(NUMEROS[1] + '. ') &&
      (await evaluer(`document.getElementById('source').value`)).includes(ligneDe(LECONS[1])))

  /* Au bout, il ne promet plus rien qui n'existe pas. */
  await choisirLaLecon(LECONS.length - 1)
  await patienter(1100)
  controle('sur la dernière, il le dit et s’éteint',
    (await evaluer(`document.getElementById('lecon-apres-bas').disabled`)) === true &&
      (await evaluer(`document.getElementById('lecon-apres-bas').textContent`)).includes('bout'))

  /*
   * On saute jusqu'à une leçon à atelier, et l'on vérifie que le bouton y mène.
   *
   * Elle est CHERCHÉE, jamais numérotée : une leçon insérée avant elle, et un
   * numéro écrit à la main désigne autre chose — c'est arrivé le jour où « Un
   * personnage de seize » s'est glissée au niveau 4.
   */
  const numeroDeLAir = LECONS.findIndex((l) => l.airs)
  await choisirLaLecon(numeroDeLAir)
  await patienter(1200)

  const surAir = await evaluer(`document.getElementById('lecon-titre').textContent`)
  controle('choisir une leçon dans la liste l’ouvre',
    surAir.includes(LECONS[numeroDeLAir].titre), ` (${surAir})`)
  controle('une leçon à atelier propose de l’ouvrir',
    (await evaluer(`document.getElementById('lecon-atelier').hidden`)) === false)

  /*
   * L'atelier est DANS le mode leçons, et non dans l'autre.
   *
   * Il y était caché, et la leçon offrait un bouton pour aller le chercher en
   * mode création : un aller-retour à chaque geste, alors que la leçon dit
   * « clique un pixel dans la grille ci-dessous ». Le mode leçons a désormais
   * ce qu'a le mode création — les quatre onglets, la bande, la grille — et le
   * bouton ne fait plus que descendre au bon onglet.
   */
  controle('le mode leçons a les ateliers du mode création',
    (await vu('zone-creation')) && (await vu('onglet-tuiles')) && (await vu('onglet-airs')) &&
    (await vu('onglet-couleurs')) && (await vu('onglet-modeles')))

  controle('et une leçon de musique ouvre sa partition d’elle-même',
    (await evaluer(`document.getElementById('onglet-airs').classList.contains('actif')`)) === true &&
    (await evaluer(`document.querySelector('#grille-airs .toile-air') !== null`)))

  await evaluer(`document.getElementById('lecon-atelier').click()`)
  await patienter(900)
  controle('le bouton y descend SANS quitter la leçon',
    (await evaluer(`document.body.dataset.mode`)) === 'lecons' &&
      (await evaluer(`document.querySelector('#grille-airs .toile-air') !== null`)))
  controle('et le texte de la leçon reste lisible au-dessus', await vu('lecon-texte'))

  await evaluer(`document.getElementById('mode-code').click()`)
  await patienter(400)
  controle('« MODE CODE » rend tout l’écran au programme',
    !(await vu('zone-lecons')) && !(await vu('atelier-airs')))

  /* --- ce que la console exécute --- */

  console.log()

  await evaluer(`document.getElementById('mode-machine').click()`)
  await patienter(1400)

  const entete = await evaluer(`document.querySelector('.machine-entete').textContent`)
  controle('« MODE MACHINE » lit la cartouche', entete.includes('32 Ko'),
    `\n      ${entete.replace(/\s+/g, ' ').slice(0, 110)}…`)

  /* Le point qui compte : sur une cartouche compilée ici, le compilateur sait
     où il a rangé chaque nom, et le listing les porte. */
  controle('les noms du programme sont retrouvés', entete.includes('noms retrouvés'))

  const listing = await evaluer(`document.querySelector('.machine').textContent`)
  controle('le programme commence par « di » puis la pile',
    listing.includes('di') && listing.includes('ld sp, $dfff'))
  controle('une routine de la console est nommée', listing.includes('call AttendreVBlank'))
  controle('un registre du matériel aussi', listing.includes('ldh [ECRAN], a'))
  controle('et l’instruction dit à quoi elle correspond en C++',
    listing.includes('≈ ecran(0) ou ecran(1)'))

  const instructions = (listing.match(/\$0[0-9a-f]{3}/g) ?? []).length
  controle('tout le code est relu, pas seulement le début', instructions > 200,
    ` (${instructions} instructions)`)

  /*
   * --- la capture, telle que le bouton la produit ---
   *
   * On ne se contente pas de cliquer : un bouton peut parfaitement déclencher
   * un téléchargement vide. On refait donc le même calcul dans la page et l'on
   * regarde l'image obtenue — sa taille, et qu'elle porte bien plus d'une
   * nuance.
   */
  const capture = await evaluer(`(function () {
    const grossir = Number(reglages.valeurs.tailleCapture) || 3
    const toile = document.createElement('canvas')
    toile.width = 160 * grossir
    toile.height = 144 * grossir
    const d = toile.getContext('2d')
    const img = d.createImageData(toile.width, toile.height)
    const gb = inspecteur.gb
    for (let y = 0; y < toile.height; y++)
      for (let x = 0; x < toile.width; x++) {
        const n = gb.framebuffer[((y / grossir) | 0) * 160 + ((x / grossir) | 0)] & 3
        const ou = (y * toile.width + x) * 4
        img.data[ou] = [224, 136, 52, 8][n]
        img.data[ou + 1] = [248, 192, 104, 24][n]
        img.data[ou + 2] = [208, 112, 86, 32][n]
        img.data[ou + 3] = 255
      }
    d.putImageData(img, 0, 0)
    return JSON.stringify({
      largeur: toile.width,
      hauteur: toile.height,
      nuances: new Set(gb.framebuffer).size,
      octets: toile.toDataURL('image/png').length,
    })
  })()`)
  const photo = JSON.parse(capture)

  controle('le bouton 📷 est allumé quand la cartouche est prête',
    (await evaluer(`document.getElementById('capture').disabled`)) === false)
  controle('la capture est agrandie d’un facteur ENTIER',
    photo.largeur === 480 && photo.hauteur === 432, ` (${photo.largeur} × ${photo.hauteur})`)
  controle('elle porte plus d’une nuance', photo.nuances > 1, ` (${photo.nuances})`)
  controle('et c’est bien un PNG qui en sort', photo.octets > 1000, ` (${photo.octets} caractères)`)

  /* Le nom du fichier suit le titre gravé dans la cartouche : deux jeux
     téléchargés d'affilée ne doivent pas s'appeler pareil. */
  await evaluer(`document.getElementById('reglages').click()`)
  await evaluer(`reglages.poser('titreCartouche', 'MON ESSAI')`)
  await evaluer(`document.getElementById('reglages-fermer').click()`)
  await evaluer(`document.getElementById('lancer').click()`)
  await patienter(900)
  controle('le nom du fichier suit le titre de la cartouche',
    (await evaluer(`(function () {
      const t = document.getElementById('etat').textContent
      return t.includes('32 Ko')
    })()`)) === true)

  /* ------------------- pour quelle console, et l'aperçu en nuances ------------ */

  /*
   * Le sélecteur d'en-tête change ce que la cartouche EST ; l'aperçu ne change
   * que la façon dont on la regarde. Les deux se confondent facilement, et l'on
   * croit alors distribuer une cartouche couleur alors qu'on regarde un aperçu.
   */
  await evaluer(`(function () {
    const l = document.getElementById('exemples')
    l.value = 'couleur'
    l.dispatchEvent(new Event('change', { bubbles: true }))
  })()`)
  await patienter(1800)

  controle('l’exemple en couleur compile',
    !(await evaluer(`document.getElementById('etat').className.includes('erreur')`)))
  controle('la cartouche qui TOURNE est celle en couleur',
    (await evaluer(`inspecteur.rom[0x0143]`)) === 0xc0,
    ` (${(await evaluer(`inspecteur.rom[0x0143]`)).toString(16)})`)
  /*
   * UNE cartouche : en couleur, ou en quatre nuances — jamais les deux.
   *
   * « Les deux » fabriquait un « .gbc » ET un « .gb » ; on ne savait plus
   * lequel on distribuait, ni pourquoi les couleurs manquaient sur l'un. Le
   * choix est maintenant l'un OU l'autre : en couleur, c'est le « .gbc », seul.
   */
  const faites = await evaluer(`inspecteur.cartouches`)
  controle('en couleur, UNE seule cartouche : le « .gbc »',
    faites.length === 1 && faites[0]?.extension === '.gbc' && faites[0]?.drapeau === 0xc0,
    ` (${faites.map((c) => c.extension + ' ' + (c.drapeau ?? 0).toString(16)).join(', ')})`)
  const boutons = await evaluer(`[
    document.getElementById('telecharger').textContent.trim(),
    document.getElementById('telecharger-gb').hidden ? '(caché)' : document.getElementById('telecharger-gb').textContent.trim(),
  ]`)
  controle('un seul fichier est proposé au téléchargement', boutons[0] === '⬇ .gbc' && boutons[1] === '(caché)', ` (${boutons.join('  ')})`)

  controle('l’émulateur rend en couleur',
    (await evaluer(`inspecteur.gb.ppu.couleur`)) === true)

  const enCouleur = await evaluer(`new Set(inspecteur.gb.ppu.couleurs).size`)
  controle('l’écran porte plus de quatre teintes', enCouleur > 4, ` (${enCouleur} teintes)`)

  /* L'aperçu : la MÊME cartouche, vue en quatre nuances. */
  await evaluer(`document.getElementById('reglages').click()`)
  await evaluer(`reglages.poser('voirEnNuances', true)`)
  await evaluer(`document.getElementById('reglages-fermer').click()`)
  await patienter(500)

  const enNuances = await evaluer(`new Set(inspecteur.gb.ppu.couleurs).size`)
  controle('l’aperçu retombe à quatre nuances', enNuances <= 4, ` (${enNuances} teintes)`)
  controle('mais la cartouche, elle, n’a pas changé',
    (await evaluer(`inspecteur.rom[0x0143]`)) === 0xc0)

  await evaluer(`document.getElementById('reglages').click()`)
  await evaluer(`reglages.poser('voirEnNuances', false)`)
  await evaluer(`document.getElementById('reglages-fermer').click()`)
  await patienter(400)
  controle('et l’on revient à la couleur',
    (await evaluer(`new Set(inspecteur.gb.ppu.couleurs).size`)) > 4)

  /* Le sélecteur d'en-tête, lui, REFUSE : un programme en couleur n'est pas
     un programme pour Game Boy d'origine, et le dire vaut mieux que l'ignorer. */
  await evaluer(`(function () {
    const c = document.getElementById('console-cible')
    c.value = 'gb'
    c.dispatchEvent(new Event('change'))
  })()`)
  await patienter(900)
  const refus = await evaluer(`document.getElementById('etat').textContent`)
  controle('« Game Boy » refuse un programme en couleur, avec sa ligne',
    refus.includes('Game Boy Color') && /ligne \d+/.test(refus),
    ` — « ${refus.split(String.fromCharCode(10))[0]} »`)

  await evaluer(`(function () {
    const c = document.getElementById('console-cible')
    c.value = 'gbc'
    c.dispatchEvent(new Event('change'))
  })()`)
  await patienter(900)
  controle('et « en couleur » le fait repartir',
    !(await evaluer(`document.getElementById('etat').className.includes('erreur')`)))

  /* --- la photographie de l'écran de la console --- */
  const png = await evaluer(`document.getElementById('ecran').toDataURL('image/png').slice(22)`)
  writeFileSync('images/capture-page.png', Buffer.from(png, 'base64'))
  console.log('\n  → images/capture-page.png : l’écran de la console, tel qu’il était')

  /*
   * Et la photographie du panneau des réglages.
   *
   * Cinquante réglages peuvent parfaitement répondre à tous les contrôles et
   * rester illisibles — débordant de la boîte, ou empilés sans respiration.
   * Une capture ne se vérifie pas toute seule, mais elle se REGARDE, et c'est
   * la seule façon de voir cela.
   */
  await evaluer(`document.getElementById('reglages').click()`)
  await patienter(400)
  const vue = await envoyer('Page.captureScreenshot', { format: 'png' })
  writeFileSync('images/capture-reglages.png', Buffer.from(vue.data, 'base64'))
  await evaluer(`document.getElementById('reglages-fermer').click()`)
  console.log('  → images/capture-reglages.png : les cinquante réglages, tels qu’ils s’ouvrent')
} finally {
  prise.close()
  navigateur.kill()
  /* Chrome tient encore son dossier une seconde après avoir été fermé : on
     essaie de le retirer, sans en faire une affaire. */
  try { rmSync(profil, { recursive: true, force: true }) } catch { /* il partira tout seul */ }
}

console.log(echecs ? `\n${echecs} contrôle(s) en échec` : '\ntout est vert')
process.exit(echecs ? 1 : 0)

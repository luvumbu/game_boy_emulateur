/**
 * L'atelier est-il disponible, QUELLES QUE SOIENT les conditions ?
 *
 *   node verification/verifier-disponible.mjs
 *
 * Les autres vérifications contrôlent que l'atelier fait ce qu'il doit,
 * quand tout est en place. Celle-ci contrôle ce qui se passe quand quelque
 * chose MANQUE : un fichier effacé, un module abîmé, un navigateur sans son,
 * un stockage bloqué, un port déjà pris, PHP absent, Node trop vieux, la page
 * ouverte par un double-clic… Dans chaque cas, l'atelier doit soit marcher
 * quand même, soit DIRE clairement ce qui ne va pas et comment le réparer.
 * Jamais une page figée et muette.
 *
 * Six parties :
 *   1. les fichiers        tout ce que les pages chargent existe, avec la bonne casse
 *   2. le lanceur          demarrer.mjs, lancé pour de vrai, dans des situations difficiles
 *   3. lancer.bat          Node trop vieux, demarrer.mjs absent
 *   4. les pages           les 47 pages s'ouvrent sans erreur ni fichier introuvable
 *   5. le navigateur privé de quelque chose (son, stockage, plein écran, réseau)
 *   6. un fichier manque   chacun des modules retiré tour à tour : la page le dit
 *
 * Les essais qui abîment quelque chose le font dans une COPIE du projet, placée
 * dans un dossier au nom difficile (espaces, accents) : le vrai projet n'est
 * jamais touché.
 *
 * Il faut Node 22 ou plus pour CETTE vérification (elle parle au navigateur
 * par WebSocket, intégré à Node depuis la version 22) ; l'atelier, lui, ne
 * demande que Node 18. Et un Chrome, un Brave ou un Edge installé.
 */

import { spawn, execFileSync } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, appendFileSync, statSync, writeFileSync } from 'node:fs'
import { createServer } from 'node:http'
import { tmpdir } from 'node:os'
import { dirname, join, normalize, relative, sep } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

import { bulletin } from '../outils/controle.mjs'

const RACINE = normalize(join(dirname(fileURLToPath(import.meta.url)), '..'))
const b = bulletin('L’ATELIER EST-IL DISPONIBLE, QUELLES QUE SOIENT LES CONDITIONS ?')
const attendre = (ms) => new Promise((r) => setTimeout(r, ms))
const titre = (t) => console.log(`\n  --- ${t} ---`)

/* Les trois pages qui ont un programme (sommaire.html et les pages du cours
   sont du HTML seul, contrôlé à la partie 4). */
const PAGES = ['index.html', 'tuto.html', 'cours.html']

/* ============================================================ 1. les fichiers */

titre('1. les fichiers')

/*
 * Existe-t-il avec EXACTEMENT cette casse ? Windows ne fait pas la différence
 * entre « Police.js » et « police.js » ; un serveur Linux, si. Une faute de
 * casse passe donc inaperçue ici, et casse tout le jour où le projet est mis
 * en ligne. On compare donc chaque morceau du chemin au vrai nom sur le disque.
 */
function existeExactement(chemin) {
  let dossier = RACINE
  for (const morceau of relative(RACINE, chemin).split(sep)) {
    if (!existsSync(dossier) || !readdirSync(dossier).includes(morceau)) return false
    dossier = join(dossier, morceau)
  }
  return true
}

/* Les noms qu'un module exporte : « export function x », « export const y »,
   « export { a, b as c } ». De quoi vérifier que chaque « import { x } » trouve
   son x (sinon le navigateur refuse la page entière). */
function exportsDe(fichier) {
  const texte = readFileSync(fichier, 'utf8')
  const noms = new Set()
  for (const m of texte.matchAll(/export\s+(?:async\s+)?(?:const|let|var|function\*?|class)\s+([A-Za-z_$][\w$]*)/g)) noms.add(m[1])
  for (const m of texte.matchAll(/export\s*\{([^}]*)\}/g))
    for (const x of m[1].split(',')) { const nom = x.trim().split(/\s+as\s+/).pop(); if (nom) noms.add(nom) }
  if (/export\s+default/.test(texte)) noms.add('default')
  return noms
}

/* Tous les .js, .mjs et .html du projet, sauf ce qui n'est pas l'application
   (les livrets imprimés, l'historique git…). */
const IGNORES = new Set(['.git', 'node_modules', 'livrets', 'files', 'cartouches', 'images', 'tutoriels'])
const sources = []
;(function parcourir(dossier) {
  for (const nom of readdirSync(dossier)) {
    if (dossier === RACINE && IGNORES.has(nom)) continue
    const chemin = join(dossier, nom)
    if (statSync(chemin).isDirectory()) parcourir(chemin)
    else if (/\.(m?js|html)$/.test(nom)) sources.push(chemin)
  }
})(RACINE)

let liens = 0
const fautesDeLiens = []
const fautesDImports = []
for (const fichier of sources) {
  const texte = readFileSync(fichier, 'utf8')
  const ici = relative(RACINE, fichier).replaceAll('\\', '/')
  const references = []
  // les imports de modules, avec les noms importés quand il y en a
  // [^'";]*? : les noms importés ne contiennent ni guillemet ni point-virgule —
  // sinon la recherche enjambait un « import … from 'node:fs' » précédent.
  for (const m of texte.matchAll(/import\s+([^'";]*?)\s+from\s+['"](\.{1,2}\/[^'"]+)['"]/g)) references.push({ cible: m[2], noms: m[1] })
  for (const m of texte.matchAll(/import\s*\(?\s*['"](\.{1,2}\/[^'"]+)['"]/g)) references.push({ cible: m[1] })
  // dans une page : les <script src>, <link href>, <img src>, <a href> locaux
  if (fichier.endsWith('.html'))
    for (const m of texte.matchAll(/<(?:script|img|link|source|iframe|video)\b[^>]*?\b(?:src|href)=["']([^"'#?:]+)["']/g)) references.push({ cible: m[1] })

  for (const { cible, noms } of references) {
    const chemin = normalize(join(dirname(fichier), cible))
    // Un outil qui vise un projet VOISIN (../../gameboy2) : hors de l'atelier.
    if (!chemin.startsWith(RACINE)) continue
    liens++
    if (!existeExactement(chemin)) {
      fautesDeLiens.push(`${ici} → ${cible}${existsSync(chemin) ? ' (la casse diffère)' : ' (absent)'}`)
      continue
    }
    // Chaque nom entre accolades doit être exporté par le fichier visé.
    const accolades = noms?.match(/\{([\s\S]*)\}/)
    if (accolades && /\.m?js$/.test(chemin)) {
      const exportes = exportsDe(chemin)
      for (const x of accolades[1].split(',')) {
        const nom = x.trim().split(/\s+as\s+/)[0].trim()
        if (nom && !exportes.has(nom)) fautesDImports.push(`${ici} importe « ${nom} », que ${cible} n’exporte pas`)
      }
    }
  }
}
b.verifier(`chaque fichier chargé existe, avec la bonne casse (${liens} liens, ${sources.length} fichiers)`,
  !fautesDeLiens.length, fautesDeLiens.map((f) => '\n      ' + f).join(''))
b.verifier('chaque nom importé est bien exporté', !fautesDImports.length, fautesDImports.map((f) => '\n      ' + f).join(''))

/* Aucune ressource prise sur Internet : l'atelier doit marcher hors ligne. */
const enLigne = PAGES.concat('sommaire.html').filter((p) =>
  /<(?:script|link|img)\b[^>]*\b(?:src|href)=["']https?:/i.test(readFileSync(join(RACINE, p), 'utf8')))
b.verifier('aucune page ne charge quoi que ce soit depuis Internet (tout marche hors ligne)', !enLigne.length, enLigne.join(', '))

b.verifier('aucune dépendance npm à installer (package.json)',
  !JSON.parse(readFileSync(join(RACINE, 'package.json'), 'utf8')).dependencies)

/* ============================================================ la copie d'essai */

/*
 * Une copie du projet, dans un dossier au nom DIFFICILE : des espaces et des
 * accents, comme « Mes documents/Atelier é ». C'est là qu'on abîmera des
 * fichiers ; le vrai projet n'est jamais touché.
 */
const COPIE = join(tmpdir(), 'gameboy3 essai à é')
rmSync(COPIE, { recursive: true, force: true })
cpSync(RACINE, COPIE, {
  recursive: true,
  filter: (source) => !/[\\/](\.git|livrets|node_modules)([\\/]|$)/.test('/' + relative(RACINE, source)),
})

/* =============================================================== 2. le lanceur */

titre('2. le lanceur (demarrer.mjs), lancé pour de vrai')

/* Un port libre, demandé au système. */
async function portLibre() {
  const s = createServer()
  await new Promise((r) => s.listen(0, '127.0.0.1', r))
  const port = s.address().port
  await new Promise((r) => s.close(r))
  return port
}

/*
 * Lance « node demarrer.mjs » (celui du dossier donné) et rend :
 *   texte()  ce qu'il a écrit dans sa fenêtre jusqu'ici
 *   fin      une promesse du code de sortie, s'il s'arrête
 *   arreter  l'arrête, LUI ET SES ENFANTS (le serveur PHP qu'il a pu lancer)
 * « cwd » : le dossier d'où on le lance — exprès un AUTRE que le projet.
 */
function lancer(dossier, options, cwd = tmpdir()) {
  const enfant = spawn(process.execPath, [join(dossier, 'demarrer.mjs'), '--sans-navigateur', ...options], { cwd })
  let sortie = ''
  enfant.stdout.on('data', (d) => { sortie += d })
  enfant.stderr.on('data', (d) => { sortie += d })
  const fin = new Promise((r) => enfant.on('exit', r))
  return {
    texte: () => sortie,
    fin,
    arreter: () => {
      // taskkill /T : tout l'arbre, sinon le php.exe lancé par Node survivrait.
      try { if (process.platform === 'win32') execFileSync('taskkill', ['/pid', String(enfant.pid), '/T', '/F'], { stdio: 'ignore' }); else enfant.kill() } catch { /* déjà parti */ }
    },
  }
}

/* Attend qu'une adresse réponde (jusqu'à 10 s) ; rend la réponse, ou null. */
async function repond(adresse) {
  for (let i = 0; i < 40; i++) {
    try { return await fetch(adresse, { signal: AbortSignal.timeout(1000) }) } catch { await attendre(250) }
  }
  return null
}

/* Le lanceur sert-il vraiment l'atelier et les projets ? */
async function serviceComplet(port) {
  const page = await repond(`http://localhost:${port}/index.html`)
  const html = page?.ok ? await page.text() : ''
  const projets = await repond(`http://localhost:${port}/projets.php?quoi=liste`)
  let json = null
  try { json = await projets.json() } catch { /* pas du JSON */ }
  return { page: html.includes('garde.js'), projets: Array.isArray(json?.projets) }
}

{
  // a. Sans PHP, lancé depuis un AUTRE dossier que le projet.
  const port = await portLibre()
  const l = lancer(COPIE, ['--sans-php', '--port', String(port)])
  const s = await serviceComplet(port)
  b.verifier('sans PHP, lancé depuis un autre dossier : il sert la page ET les projets', s.page && s.projets,
    ` (page ${s.page}, projets ${s.projets})`)
  b.verifier('… et il ne signale aucun fichier manquant', !/manque/i.test(l.texte()), '\n      ' + l.texte().trim().replace(/\n/g, '\n      '))
  l.arreter()

  // b. Avec PHP, s'il y en a un qui marche sur ce PC.
  let php = null
  for (const c of ['C:/xampp/php/php.exe', 'php']) {
    try { execFileSync(c, ['-v'], { stdio: 'ignore', timeout: 5000 }); php = c; break } catch { /* suivant */ }
  }
  if (php) {
    const port2 = await portLibre()
    const l2 = lancer(COPIE, ['--port', String(port2)])
    const s2 = await serviceComplet(port2)
    b.verifier(`avec PHP (${php}) : il sert la page ET les projets`, s2.page && s2.projets, ` (page ${s2.page}, projets ${s2.projets})`)
    // Lancé une seconde fois : le serveur PHP ne connaît pas « __atelier » ; ce
    // n'est pas un « ancien atelier » pour autant, il faut juste ouvrir la page.
    const second = lancer(COPIE, ['--port', String(port2)])
    const codeSecond = await Promise.race([second.fin, attendre(10000).then(() => 'toujours là')])
    b.verifier('avec PHP, lancé deux fois : le second voit que l’atelier tourne déjà', codeSecond === 0 && /tourne déjà/.test(second.texte()),
      ` (code ${codeSecond})`)
    second.arreter()
    l2.arreter()
  } else {
    console.log('  · pas de PHP qui marche sur ce PC : l’essai avec PHP est sauté')
  }

  // c. Le port déjà pris par un AUTRE programme : un message clair, pas une pile d'appels.
  const port3 = await portLibre()
  const intrus = createServer((q, r) => r.end('un autre programme'))
  await new Promise((r) => intrus.listen(port3, r))
  const l3 = lancer(COPIE, ['--sans-php', '--port', String(port3)])
  const code3 = await Promise.race([l3.fin, attendre(10000).then(() => 'toujours là')])
  b.verifier('port pris par un autre programme : il le dit et s’arrête proprement',
    code3 === 1 && /déjà pris/.test(l3.texte()) && !/at .*\.mjs/.test(l3.texte()), ` (code ${code3})`)
  l3.arreter()
  intrus.close()

  // d. Lancé DEUX fois : le second voit le premier, et ouvre simplement la page.
  const port4 = await portLibre()
  const premier = lancer(COPIE, ['--sans-php', '--port', String(port4)])
  await repond(`http://localhost:${port4}/index.html`)
  const second = lancer(COPIE, ['--sans-php', '--port', String(port4)])
  const code4 = await Promise.race([second.fin, attendre(10000).then(() => 'toujours là')])
  b.verifier('lancé deux fois : le second voit que l’atelier tourne déjà', code4 === 0 && /tourne déjà/.test(second.texte()), ` (code ${code4})`)
  second.arreter()
  premier.arreter()

  // e. projets-serveur.mjs absent : l'atelier démarre quand même, et le dit.
  renameSync(join(COPIE, 'projets-serveur.mjs'), join(COPIE, 'projets-serveur.mjs.retire'))
  const port5 = await portLibre()
  const l5 = lancer(COPIE, ['--sans-php', '--port', String(port5)])
  const page5 = await repond(`http://localhost:${port5}/index.html`)
  const projets5 = await (await repond(`http://localhost:${port5}/projets.php?quoi=liste`))?.json().catch(() => null)
  b.verifier('sans projets-serveur.mjs : la page est servie quand même', !!page5?.ok)
  b.verifier('… la fenêtre le dit, et les projets répondent une erreur lisible',
    /projets-serveur\.mjs/.test(l5.texte()) && /projets-serveur/.test(projets5?.erreur ?? ''))
  l5.arreter()
  renameSync(join(COPIE, 'projets-serveur.mjs.retire'), join(COPIE, 'projets-serveur.mjs'))

  // f. Un module de l'atelier absent : la fenêtre noire le nomme, dès le lancement.
  renameSync(join(COPIE, 'compilateur/police.js'), join(COPIE, 'compilateur/police.js.retire'))
  const port6 = await portLibre()
  const l6 = lancer(COPIE, ['--sans-php', '--port', String(port6)])
  await repond(`http://localhost:${port6}/index.html`)
  b.verifier('un module absent : la fenêtre noire le nomme dès le lancement', /compilateur\/police\.js/.test(l6.texte()),
    '\n      ' + l6.texte().trim().split('\n').slice(0, 4).join('\n      '))
  l6.arreter()
  renameSync(join(COPIE, 'compilateur/police.js.retire'), join(COPIE, 'compilateur/police.js'))
}

/* =============================================================== 3. lancer.bat */

if (process.platform === 'win32') {
  titre('3. lancer.bat')

  /*
   * Un Node qui MENT sur sa version : le vrai node.exe, à qui l'on fait
   * charger d'abord un petit script (NODE_OPTIONS=--require). Ce script
   *   - remplace process.versions.node par la version voulue (16.20.0…) ;
   *   - quand on lui demande de lancer demarrer.mjs, écrit FAUX-NODE-LANCE
   *     au lieu de démarrer vraiment l'atelier.
   * Un faux « node.cmd » ne convenait pas : un .bat qui appelle un .cmd sans
   * « call » lui passe la main pour de bon, et lancer.bat s'arrêtait là.
   * Le vrai lancer.bat est copié dans un dossier à part ; on répond « N » à
   * la question de l'installation.
   */
  function essaiDuBat(version, avecDemarrer) {
    const dossier = join(tmpdir(), 'gameboy3-essai-bat')
    rmSync(dossier, { recursive: true, force: true })
    mkdirSync(dossier, { recursive: true })
    cpSync(join(RACINE, 'lancer.bat'), join(dossier, 'lancer.bat'))
    if (avecDemarrer) writeFileSync(join(dossier, 'demarrer.mjs'), '')
    const menteur = join(dossier, 'menteur.cjs')
    writeFileSync(menteur, [
      `Object.defineProperty(process.versions, 'node', { value: '${version}' })`,
      `if (/demarrer\\.mjs$/.test(process.argv[1] ?? '')) { console.log('FAUX-NODE-LANCE demarrer.mjs'); process.exit(0) }`,
    ].join('\n'))
    // Des « / » dans le chemin : NODE_OPTIONS avale les « \ » de Windows.
    const env = { ...process.env, NODE_OPTIONS: `--require "${menteur.replaceAll(sep, '/')}"` }
    try {
      return execFileSync('cmd', ['/c', join(dossier, 'lancer.bat')], {
        input: 'N\r\n', encoding: 'latin1', timeout: 20000, env,
      })
    } catch (erreur) {
      return String(erreur.stdout ?? '') + String(erreur.stderr ?? '')
    }
  }

  const vieux = essaiDuBat('16.20.0', true)
  b.verifier('Node 16 : lancer.bat dit qu’il est trop ancien et propose de l’installer',
    /trop ancien/.test(vieux) && /installer/.test(vieux) && !/FAUX-NODE-LANCE/.test(vieux))
  const incomplet = essaiDuBat('22.0.0', false)
  b.verifier('demarrer.mjs absent : lancer.bat le dit, au lieu d’une erreur de Node',
    /demarrer\.mjs manque/.test(incomplet) && !/FAUX-NODE-LANCE/.test(incomplet))
  const bon = essaiDuBat('22.0.0', true)
  b.verifier('Node 22 et le dossier complet : lancer.bat lance bien demarrer.mjs', /FAUX-NODE-LANCE demarrer\.mjs/.test(bon))
}

/* ======================================================== le navigateur piloté */

const CHROMES = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  process.env.LOCALAPPDATA + '/Google/Chrome/Application/chrome.exe',
  'C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome', '/usr/bin/chromium',
]
const executable = CHROMES.find((c) => c && existsSync(c))
if (!executable || typeof WebSocket === 'undefined') {
  b.verifier('un navigateur à piloter (Chrome, Brave ou Edge) et Node 22 pour lui parler', false,
    ` (navigateur : ${executable ?? 'aucun'}, Node ${process.versions.node})`)
  b.fin()
}

const PORT_CDP = 9344
const profil = join(tmpdir(), 'gameboy3-disponible')
rmSync(profil, { recursive: true, force: true })
const navigateur = spawn(executable, ['--headless=new', `--remote-debugging-port=${PORT_CDP}`, `--user-data-dir=${profil}`,
  '--no-first-run', '--disable-gpu', '--mute-audio', '--window-size=1300,900', 'about:blank'], { stdio: 'ignore' })
for (let i = 0; i < 50; i++) {
  try { await (await fetch(`http://127.0.0.1:${PORT_CDP}/json/version`)).json(); break } catch { await attendre(200) }
}

/* La page a-t-elle VRAIMENT démarré ? Sa liste de leçons est remplie, et la
   console a dessiné quelque chose sur l'écran (un pixel non transparent). */
const PEINT = `(() => { const c = document.getElementById('ecran'); if (!c) return false
  const x = c.getContext('2d'); if (!x) return true
  const d = x.getImageData(0, 0, c.width, c.height).data
  for (let i = 3; i < d.length; i += 4) if (d[i]) return true
  return false })()`
const SANTE = {
  'index.html': `document.getElementById('lecon-choix').options.length > 0 && ${PEINT}`,
  'tuto.html': `document.querySelectorAll('#sommaire li.lecon').length > 100 && ${PEINT}`,
  'cours.html': `document.querySelectorAll('#sommaire li').length > 10 && ${PEINT}`,
}

/*
 * Ouvre une adresse dans un onglet neuf, attend, et rend ce qu'on y a vu :
 *   demarre   la page a-t-elle démarré (voir SANTE) ?
 *   erreurs   les erreurs du programme et de la console
 *   manquants les fichiers que le serveur n'a pas trouvés (404…)
 *   bandeau   le texte du bandeau de garde.js, s'il y en a un
 * « avant » : du JavaScript exécuté AVANT la page, pour la priver de quelque chose.
 */
async function visiter(adresse, { avant = '', sante = 'document.body.innerText.length > 50', delai = 4000 } = {}) {
  const cible = await (await fetch(`http://127.0.0.1:${PORT_CDP}/json/new?about:blank`, { method: 'PUT' })).json()
  const ws = new WebSocket(cible.webSocketDebuggerUrl)
  await new Promise((r) => ws.addEventListener('open', r))
  let numero = 0
  const attentes = new Map()
  const erreurs = []
  const manquants = []
  const court = (url) => String(url).replace(/^.*?\/\/[^/]*\//, '')
  ws.addEventListener('message', (m) => {
    const d = JSON.parse(m.data)
    if (d.id && attentes.has(d.id)) { attentes.get(d.id)(d); attentes.delete(d.id); return }
    if (d.method === 'Runtime.exceptionThrown') {
      const e = d.params.exceptionDetails
      erreurs.push((e.exception?.description ?? e.text).split('\n')[0] + (e.url ? ` (${court(e.url)}:${e.lineNumber + 1})` : ''))
    }
    if (d.method === 'Runtime.consoleAPICalled' && d.params.type === 'error')
      erreurs.push('console : ' + d.params.args.map((a) => a.value ?? a.description ?? '').join(' ').slice(0, 160))
    if (d.method === 'Network.responseReceived' && d.params.response.status >= 400)
      manquants.push(`${d.params.response.status} ${court(d.params.response.url)}`)
  })
  const envoyer = (method, params = {}) => new Promise((r) => { attentes.set(++numero, r); ws.send(JSON.stringify({ id: numero, method, params })) })
  await envoyer('Runtime.enable')
  await envoyer('Network.enable')
  await envoyer('Page.enable')
  if (avant) await envoyer('Page.addScriptToEvaluateOnNewDocument', { source: avant })
  await envoyer('Page.navigate', { url: adresse })
  await attendre(delai)
  const evaluer = async (expression) => (await envoyer('Runtime.evaluate', { expression, returnByValue: true })).result?.result?.value
  const demarre = await evaluer(`(() => { try { return !!(${sante}) } catch { return false } })()`)
  const bandeau = (await evaluer(`document.getElementById('atelier-panne')?.innerText ?? ''`)).replace(/\s+/g, ' ')
  ws.close()
  await fetch(`http://127.0.0.1:${PORT_CDP}/json/close/${cible.id}`).catch(() => {})
  return { demarre, erreurs, manquants, bandeau }
}

/* Le serveur des parties 4 à 6 : le vrai lanceur, celui de la copie. */
const PORT_ATELIER = await portLibre()
const atelier = lancer(COPIE, ['--sans-php', '--port', String(PORT_ATELIER)])
const ADRESSE = `http://localhost:${PORT_ATELIER}/`
await repond(ADRESSE + 'index.html')

try {
  /* ============================================================== 4. les pages */

  titre('4. toutes les pages s’ouvrent, sans erreur ni fichier introuvable')

  const toutes = [...PAGES, 'sommaire.html', ...readdirSync(join(COPIE, 'cours')).filter((f) => f.endsWith('.html')).map((f) => 'cours/' + f)]
  const mauvaises = []
  for (const page of toutes) {
    const r = await visiter(ADRESSE + page, { sante: SANTE[page], delai: SANTE[page] ? 5000 : 1000 })
    if (!r.demarre || r.erreurs.length || r.manquants.length || r.bandeau)
      mauvaises.push(`${page} : ${r.demarre ? '' : 'ne démarre pas ; '}${[...r.erreurs, ...r.manquants, r.bandeau].filter(Boolean).join(' | ')}`)
  }
  b.verifier(`les ${toutes.length} pages démarrent, sans erreur, sans 404, sans bandeau`, !mauvaises.length,
    mauvaises.map((m) => '\n      ' + m).join(''))

  /* ================================= 5. le navigateur privé de quelque chose */

  titre('5. un navigateur privé de quelque chose')

  const PRIVATIONS = {
    'sans son (pas de Web Audio)': 'window.AudioContext = undefined; window.webkitAudioContext = undefined',
    'stockage interdit (navigation privée stricte)': `for (const n of ['localStorage', 'sessionStorage'])
      Object.defineProperty(window, n, { get() { throw new DOMException('refusé', 'SecurityError') } })`,
    'sans plein écran': 'Element.prototype.requestFullscreen = undefined',
    'projets.php injoignable': `{ const f = window.fetch
      window.fetch = (u, o) => String(u).includes('projets.php') ? Promise.reject(new TypeError('Failed to fetch')) : f(u, o) }`,
  }
  for (const [nom, avant] of Object.entries(PRIVATIONS)) {
    for (const page of PAGES) {
      const r = await visiter(ADRESSE + page, { avant, sante: SANTE[page], delai: 5000 })
      b.verifier(`${nom} : ${page} démarre quand même`, r.demarre && !r.erreurs.length && !r.bandeau,
        [...r.erreurs, r.bandeau].filter(Boolean).map((e) => '\n      ' + e).join(''))
    }
  }

  // Ouvert par un double-clic (file://) : le navigateur bloque les modules.
  for (const page of PAGES) {
    const r = await visiter(pathToFileURL(join(COPIE, page)).href, { sante: SANTE[page], delai: 3000 })
    b.verifier(`ouvert par un double-clic : ${page} dit d’utiliser lancer.bat`, r.demarre || /lancer\.bat/.test(r.bandeau), ` « ${r.bandeau.slice(0, 80)}… »`)
  }

  /* ===================================================== 6. un fichier manque */

  titre('6. un fichier manque, ou est abîmé : la page le dit')

  /* Le graphe des modules de chaque page : ce qu'elle importe, et ce que
     ceux-là importent, jusqu'au bout. */
  function modulesDe(page) {
    const vus = new Set()
    const pile = []
    const lire = (texte, dossier) => {
      for (const m of texte.matchAll(/(?:import\s+[\s\S]*?\s+from\s+|import\s+|import\()\s*['"](\.{1,2}\/[^'"]+)['"]/g))
        pile.push(normalize(join(dossier, m[1])))
    }
    lire(readFileSync(join(COPIE, page), 'utf8'), COPIE)
    while (pile.length) {
      const f = pile.pop()
      if (vus.has(f) || !existsSync(f)) continue
      vus.add(f)
      lire(readFileSync(f, 'utf8'), dirname(f))
    }
    return [...vus].map((f) => relative(COPIE, f).replaceAll('\\', '/'))
  }
  const pagesDe = new Map()   // module → les pages qui en ont besoin
  for (const page of PAGES) for (const m of modulesDe(page)) pagesDe.set(m, [...(pagesDe.get(m) ?? []), page])

  let essais = 0
  const muettes = []
  for (const [module, pages] of [...pagesDe].sort()) {
    const fichier = join(COPIE, module)
    renameSync(fichier, fichier + '.retire')   // on le retire…
    for (const page of pages) {
      essais++
      const r = await visiter(ADRESSE + page, { sante: SANTE[page], delai: 4500 })
      // …et la page doit NOMMER le fichier dans son bandeau.
      if (!r.bandeau.includes(module)) muettes.push(`sans ${module}, ${page} : « ${r.bandeau.slice(0, 90) || 'rien'} »`)
    }
    renameSync(fichier + '.retire', fichier)   // …puis on le remet
  }
  b.verifier(`chaque module retiré est nommé par la page (${pagesDe.size} modules, ${essais} essais)`, !muettes.length,
    muettes.map((m) => '\n      ' + m).join(''))

  // garde.js retiré lui-même : la fenêtre noire du lanceur le signale (partie 2, même mécanisme).
  // Une faute de frappe dans un module : la page dit lequel, et à quelle ligne.
  const abime = join(COPIE, 'tuto', 'plan.js')
  const intact = readFileSync(abime)
  appendFileSync(abime, '\n@@@ une faute de frappe\n')
  const r = await visiter(ADRESSE + 'tuto.html', { sante: SANTE['tuto.html'], delai: 5000 })
  b.verifier('une faute de frappe dans un module : la page dit le fichier et la ligne', /tuto\/plan\.js, ligne \d+/.test(r.bandeau), ` « ${r.bandeau.slice(0, 110)} »`)
  writeFileSync(abime, intact)
} finally {
  atelier.arreter()
  navigateur.kill()
  rmSync(COPIE, { recursive: true, force: true })
}

b.fin()

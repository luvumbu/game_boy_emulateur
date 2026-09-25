/**
 * La fiche « Passer d'un écran à l'autre », en PDF.
 *
 *   node fiche-ecrans.mjs
 *
 * Il écrit :
 *
 *   passer-d-un-ecran-a-l-autre.pdf    la fiche, quatre pages A4
 *   passer-d-un-ecran-a-l-autre.html   la même, relisible dans un navigateur
 *
 * RIEN N'EST RECOPIÉ À LA MAIN. Le programme est lu dans
 * `exemples/ecrans.cpp`, compilé par le compilateur du projet, et joué dans
 * l'émulateur du projet : les quatre captures sont l'écran de la console à
 * l'instant où on l'a photographié, et les mesures du dernier chapitre sont
 * celles que la console a rendues quand on a pressé le bouton.
 *
 * Une fiche rédigée à côté du code deviendrait fausse à la première retouche,
 * et personne ne s'en apercevrait.
 *
 * Le PDF est imprimé par Chrome, piloté comme les autres contrôles du projet.
 * Aucune bibliothèque à installer.
 */

import { spawn } from 'node:child_process'
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

import { demarrer } from './controle.mjs'
import { imageDeLEcran } from '../tuto/etapes.mjs'
import { STYLE } from '../tuto/style.js'

const SOURCE = 'exemples/ecrans.cpp'
const NOM = 'documents/passer-d-un-ecran-a-l-autre'
const PORT = 9260

const echapper = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const patienter = (ms) => new Promise((r) => setTimeout(r, ms))

/* ------------------------------------------------ le programme, en vrai */

console.log('LA FICHE « PASSER D’UN ÉCRAN À L’AUTRE »\n')

const texte = readFileSync(SOURCE, 'utf8')
const jeu = demarrer(SOURCE, 12)
console.log(`  ${SOURCE} compilé — ${jeu.octets.length} octets de programme`)

const NOMS = ['TITRE', 'JEU', 'FIN']

/** Une frappe du bouton A : on presse, on relâche — c'est ce que fait un joueur. */
const presserA = () => {
  jeu.gb.setButton('a', true)
  jeu.avancer(4)
  jeu.gb.setButton('a', false)
  jeu.avancer(4)
}

/** Ce que la console montre maintenant, et où elle en est. */
const instantane = (quand) => {
  const scene = jeu.valeurDe('scene')
  console.log(`    ${quand} — scene = ${scene} (${NOMS[scene]})`)
  return { quand, scene, image: imageDeLEcran(jeu.gb) }
}

console.log('  la cartouche tourne, on presse le bouton :')
const etapes = [instantane('au démarrage')]
presserA(); etapes.push(instantane('après un appui sur A'))
presserA(); etapes.push(instantane('après un deuxième appui'))
presserA(); etapes.push(instantane('après un troisième appui'))

/* ------------------------------------------------ le détecteur de front */

/*
 * On ne DÉCRIT pas le détecteur de front : on le met à l'épreuve.
 *
 * Une console neuve, pour que la mesure parte du même endroit que la fiche —
 * celle d'au-dessus a déjà fait trois tours.
 */
const front = demarrer(SOURCE, 12)
const mesures = []
front.gb.setButton('a', true)
front.avancer(4)
mesures.push({ quoi: 'au moment de l’appui, la scène avance d’un cran', lu: front.valeurDe('scene'), attendu: 1 })
front.avancer(180)
mesures.push({ quoi: 'A maintenu trois secondes : plus rien ne bouge', lu: front.valeurDe('scene'), attendu: 1 })
front.gb.setButton('a', false); front.avancer(4)
front.gb.setButton('a', true); front.avancer(4)
mesures.push({ quoi: 'relâché puis repressé : la scène avance encore', lu: front.valeurDe('scene'), attendu: 2 })

console.log('  le détecteur de front, mis à l’épreuve :')
let echecs = 0
for (const m of mesures) {
  const bon = m.lu === m.attendu
  if (!bon) echecs++
  console.log(`    ${bon ? '✓' : '✗'} ${m.quoi} — lu ${m.lu}, attendu ${m.attendu}`)
}
if (echecs) throw new Error(`${echecs} mesure(s) en échec : la fiche mentirait`)

/* ------------------------------------------------------------ la page */

/** Un morceau du programme : ce que c'est, et le code tel qu'il est écrit. */
const morceau = (quoi, code, dit) => `
<div class="bloc">
  <div class="quoi">${quoi}</div>
  <pre><code>${echapper(code)}</code></pre>
  <p class="dit">${dit}</p>
</div>`

/** Le texte d'une fonction, découpé dans le fichier — jamais recopié. */
function fonction(nom) {
  const debut = texte.indexOf(`void ${nom}()`) >= 0 ? texte.indexOf(`void ${nom}()`) : texte.indexOf(`int ${nom}()`)
  if (debut < 0) throw new Error(`« ${nom} » est introuvable dans ${SOURCE}`)
  let profondeur = 0
  for (let i = texte.indexOf('{', debut); i < texte.length; i++) {
    if (texte[i] === '{') profondeur++
    if (texte[i] === '}' && --profondeur === 0) return texte.slice(debut, i + 1)
  }
  throw new Error(`« ${nom} » n’est pas refermée`)
}

/** Les déclarations du début : tout ce qui précède la première fonction. */
const declarations = texte
  .slice(0, texte.indexOf('void '))
  .split('\n')
  .filter((l) => l.trim().startsWith('uint8_t'))
  .join('\n')

const page = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>Passer d’un écran à l’autre</title>
<style>${STYLE}
  .bloc { margin-bottom: 11pt; break-inside: avoid; }
  .bloc .quoi {
    font-size: 8pt; color: var(--vert); font-weight: 600;
    text-transform: uppercase; letter-spacing: .05em; margin-bottom: 3pt;
  }
  .bloc .dit { font-size: 9pt; color: var(--gris); margin: 4pt 0 0; }

  .quatre { display: grid; grid-template-columns: repeat(4, 1fr); gap: 4mm; break-inside: avoid; }
  .quatre img { width: 100%; }
  .quatre .ou { font-size: 8pt; color: var(--vert); font-weight: 600; margin-top: 3pt; }

  .regle { display: grid; grid-template-columns: 14pt 1fr; gap: 5pt; margin-bottom: 8pt; }
  .regle .n {
    display: grid; place-items: center; width: 14pt; height: 14pt; border-radius: 50%;
    background: var(--vert-clair); color: var(--vert); font-size: 8pt; font-weight: 700;
  }

  .roue { display: flex; align-items: center; gap: 6pt; font-size: 9.5pt; margin: 0 0 9pt; flex-wrap: wrap; }
  .roue b { background: var(--vert-clair); border: 1px solid #b9d199; border-radius: 3pt; padding: 1pt 6pt; color: var(--vert); }
  .roue i { color: var(--gris); font-style: normal; }

  .mesures { list-style: none; margin: 0; padding: 0; font-size: 9pt; }
  .mesures li { padding: 3pt 0 3pt 16pt; position: relative; border-bottom: 1px dotted var(--bord); }
  .mesures li::before { content: '✓'; position: absolute; left: 2pt; color: var(--vert); font-weight: 700; }
  .mesures .detail { color: var(--gris); font-size: 8pt; }

  .piege { border-left: 2.5pt solid #c2703d; background: #fdf3ec; padding: 6pt 9pt; border-radius: 0 3pt 3pt 0; font-size: 9.5pt; margin-bottom: 9pt; }
  .piege b { color: #a5512a; }
</style>
</head>
<body>

<div class="reperes">
  <span class="niveau">Le squelette d’un jeu</span>
  <span>${SOURCE}</span>
  <span>${jeu.octets.length} octets de programme</span>
  <span class="outil">tout est mesuré, rien n’est recopié</span>
</div>

<h1>Passer d’un écran à l’autre</h1>
<p class="idee">Un titre, une partie, une fin — et le bouton qui mène de l’un à l’autre.</p>

<p>C’est le squelette de n’importe quel jeu : un écran d’accueil, la partie,
l’écran de fin. Tout tient en trois pièces, et il n’y en a pas d’autres.</p>

<div class="regle"><span class="n">1</span><span><strong>Une variable dit où l’on est.</strong>
Un octet, <code>scene</code>, qui vaut <code>TITRE</code>, <code>JEU</code> ou <code>FIN</code>.
Le reste du programme ne fait que la lire.</span></div>

<div class="regle"><span class="n">2</span><span><strong>Un seul endroit change d’écran.</strong>
<code>allerA()</code> éteint, efface, redessine, rallume. Si chaque bouton faisait
son propre ménage, l’un finirait par oublier d’effacer, et deux écrans se mélangeraient.</span></div>

<div class="regle"><span class="n">3</span><span><strong>On ne redessine qu’au changement.</strong>
Redessiner à chaque image coûterait 360 cases soixante fois par seconde, pour rien :
l’écran ne bouge pas tant que la scène ne change pas.</span></div>

<h2>1. Ce que ça donne</h2>
<p>Les quatre images ci-dessous sont l’écran de la console émulée, photographié
après chaque appui sur <code>A</code>. Le quatrième appui ramène au titre : la
roue se referme.</p>

<div class="quatre">
${etapes.map((e) => `  <figure>
    <img src="${e.image}" alt="${e.quand}">
    <div class="ou">${NOMS[e.scene]}</div>
    <figcaption>${e.quand}</figcaption>
  </figure>`).join('\n')}
</div>

<p class="roue" style="margin-top:10pt">
  <b>TITRE</b><i>— A →</i><b>JEU</b><i>— A →</i><b>FIN</b><i>— A →</i><b>TITRE</b>
</p>

<h2>2. Le programme, morceau par morceau</h2>

${morceau('les valeurs de la scène, et la scène elle-même', declarations,
  'Trois noms plutôt que trois nombres : <code>scene == JEU</code> se relit, ' +
  '<code>scene == 1</code> demande de se souvenir. <code>aAvant</code> retient l’état du bouton ' +
  'à l’image précédente — on verra au chapitre 4 pourquoi il est indispensable.')}

${morceau('effacer — les 20 × 18 cases de l’écran', fonction('effacer'),
  'La tuile 0 est vide. Sans cet effacement, « A POUR JOUER » resterait sous ' +
  '« A POUR FINIR », les deux textes mélangés à l’écran.')}

${morceau('un dessin par écran', fonction('dessinerTitre') + '\n\n' + fonction('dessinerJeu') + '\n\n' + fonction('dessinerFin'),
  'Chacune ne sait que dessiner. Aucune ne décide de rien, aucune n’efface : ' +
  'c’est ce qui permet de les appeler depuis un seul endroit.')}

${morceau('allerA — le seul endroit qui change d’écran', fonction('allerA'),
  '<strong>L’ordre compte.</strong> <code>ecran(0)</code> éteint l’affichage, on fait le ménage à l’abri, ' +
  '<code>ecran(1)</code> rallume. Repeindre 360 cases prend bien plus de temps qu’une image n’en contient : ' +
  'écran allumé, on verrait le ménage se faire.')}

${morceau('main — la boucle, et le bouton', fonction('main'),
  '<code>image()</code> attend la fin de l’image en cours. En dehors du changement de scène, ' +
  'cette boucle ne fait rien d’autre que lire un bouton : c’est normal, l’écran est déjà peint.')}

<h2>3. Pourquoi <code>ecran(0)</code> avant d’effacer</h2>
<p>Une Game Boy affiche soixante images par seconde. Entre deux images, elle laisse
un court instant — le <em>VBlank</em> — pendant lequel la mémoire vidéo est libre.
Poser 360 tuiles demande beaucoup plus que cet instant.</p>
<div class="piege">
<b>Le piège :</b> si on efface écran allumé, le balayage passe pendant le ménage
et affiche un mélange des deux écrans — un scintillement, ou une bande de l’ancien
texte qui survit une fraction de seconde. Éteindre l’écran suspend le balayage :
plus rien ne s’affiche pendant qu’on travaille, et tout apparaît d’un coup au rallumage.
</div>

<h2>4. Le détecteur de front</h2>
<p>C’est le point qui casse le plus souvent, et il ne se voit pas dans le code :</p>

<pre><code>a = bouton(A);
if (a == 1) {
  if (aAvant == 0) {   // ← le front : A vient tout juste d’être pressé
    ...
    allerA();
  }
}
aAvant = a;            // ← on retient l’état pour l’image suivante</code></pre>

<p style="margin-top:9pt"><code>bouton(A)</code> ne dit pas « A vient d’être pressé » : il dit
« A est enfoncé <em>maintenant</em> ». Un appui humain dure une dizaine d’images. Sans
<code>aAvant</code>, la scène avancerait dix fois — on traverserait les trois écrans
et on retomberait sur le titre avant d’avoir eu le temps de lire quoi que ce soit.</p>

<p>La comparaison <code>a == 1 &amp;&amp; aAvant == 0</code> n’est vraie qu’à <strong>une seule
image</strong> : celle où le bouton passe de relâché à enfoncé. Un appui, une transition,
quelle que soit sa durée.</p>

<h2>5. Ce que la console a répondu</h2>
<p>Ces trois lignes ne sont pas une promesse : la cartouche a été chargée dans
l’émulateur, le bouton pressé, et <code>scene</code> relue dans la mémoire de la console.</p>

<ul class="mesures">
${mesures.map((m) => `  <li>${m.quoi}<br><span class="detail">scene = ${m.lu}</span></li>`).join('\n')}
</ul>

<h2>6. Pour t’en servir</h2>
<p>Ajouter un écran tient en trois gestes : un nom de plus dans les valeurs de
<code>scene</code>, une fonction <code>dessinerX()</code>, et un <code>if</code> de plus
dans <code>allerA()</code>. Rien d’autre du programme ne change.</p>
<div class="avoir">
<code>${SOURCE}</code> — le programme entier, ${texte.split('\n').length} lignes.<br>
<code>exemples/decoupe/</code> — le même, réparti sur cinq fichiers, pour voir <code>#include</code> à l’œuvre.<br>
<code>livrets/lecon-18-passer-d-un-ecran-a-l-autre.pdf</code> — la même idée écrite avec <code>enum</code> et <code>switch</code>.
</div>

<p class="pied">Fiche produite par <code>node fiche-ecrans.mjs</code> — le programme y est
compilé, exécuté et photographié à chaque impression. Elle ne peut pas vieillir sans qu’on le voie.</p>

</body>
</html>
`

writeFileSync(`${NOM}.html`, page)
console.log(`\n  → ${NOM}.html`)

/* ------------------------------------------------- l'impression par Chrome */

const CHROMES = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  process.env.LOCALAPPDATA + '/Google/Chrome/Application/chrome.exe',
  'C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe',
]
const chrome = CHROMES.find((c) => c && existsSync(c))
if (!chrome) throw new Error('Chrome introuvable — cherché dans :\n  ' + CHROMES.join('\n  '))

/* Les images sont dans le document, en clair : la page s'imprime depuis le
   disque, sans que le serveur local ait besoin de répondre. */
const url = pathToFileURL(resolve(`${NOM}.html`)).href
const profil = join(tmpdir(), 'gameboy3-fiche')
rmSync(profil, { recursive: true, force: true })

const navigateur = spawn(chrome, [
  '--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profil}`,
  '--no-first-run', '--disable-gpu', '--window-size=1280,1000', url,
], { stdio: 'ignore' })

let cible = null
for (let i = 0; i < 40 && !cible; i++) {
  await patienter(250)
  try {
    const liste = await (await fetch(`http://localhost:${PORT}/json/list`)).json()
    cible = liste.find((t) => t.type === 'page' && t.url.startsWith('file://'))
  } catch { /* pas encore prêt */ }
}
if (!cible) { navigateur.kill(); throw new Error('Chrome n’a pas ouvert la page') }

const prise = new WebSocket(cible.webSocketDebuggerUrl)
await new Promise((r) => prise.addEventListener('open', r))
let prochainId = 1
const attentes = new Map()
prise.addEventListener('message', (e) => {
  const m = JSON.parse(e.data)
  const a = attentes.get(m.id)
  if (!a) return
  attentes.delete(m.id)
  if (m.error) a.rejeter(new Error(m.error.message))
  else a.resoudre(m.result)
})
const envoyer = (methode, params = {}) => new Promise((resoudre, rejeter) => {
  const id = prochainId++
  attentes.set(id, { resoudre, rejeter })
  prise.send(JSON.stringify({ id, method: methode, params }))
})

try {
  await envoyer('Page.enable')
  await patienter(1200)
  const { data } = await envoyer('Page.printToPDF', {
    printBackground: true,
    paperWidth: 8.27, // A4
    paperHeight: 11.69,
    marginTop: 0, marginBottom: 0, marginLeft: 0, marginRight: 0, // les marges sont dans @page
    preferCSSPageSize: true,
  })
  writeFileSync(`${NOM}.pdf`, Buffer.from(data, 'base64'))
  console.log(`  → ${NOM}.pdf`)
} finally {
  prise.close()
  navigateur.kill()
}

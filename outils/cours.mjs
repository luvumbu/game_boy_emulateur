/**
 * Le cours « Apprendre à programmer », en livrets et en markdown.
 *
 *   node outils/cours.mjs          les livrets HTML et documents/COURS.md
 *   node outils/cours.mjs --pdf    et, en plus, un PDF par livret
 *
 * Il écrit :
 *
 *   documents/COURS.md             tout le cours, en texte
 *   cours/index.html               le sommaire, chapitre par chapitre
 *   cours/NN-….html (et .pdf)      chaque leçon, étape par étape
 *
 * Comme pour `livret.mjs`, RIEN N'EST RECOPIÉ À LA MAIN : les leçons viennent
 * de `tuto/programmation.js`, leur code est compilé, la cartouche tourne dans
 * l'émulateur du projet, et les images sont celles de son écran. Ce script ne
 * touche ni aux leçons du tutoriel, ni à leurs livrets : il n'écrit que dans
 * `cours/` et dans `documents/COURS.md`.
 *
 * Les pages portent leurs images en elles-mêmes : elles s'ouvrent sans
 * serveur, d'un double clic. Le PDF est imprimé par Chrome ou Edge, sans
 * serveur non plus.
 */

import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

import { COURS, CHAPITRES } from '../tuto/programmation.js'
import { STYLE } from '../tuto/style.js'
import { enrichir, echapper } from '../tuto/enrichir.js'
import { consoleDuProgramme } from '../tuto/console.mjs'
import { lignesGravees } from '../analyse-rom.js'
import { decouperLeProgramme, etapesDeLExecution, controlesJoues, imageDeLEcran } from '../tuto/etapes.mjs'
import { lireDessins } from '../editeur-tuiles.js'
import { png } from '../compilateur/png.mjs'

const DOSSIER = 'cours'
const AVEC_PDF = process.argv.includes('--pdf')

/** Un nom de fichier tenable : sans accents, sans espaces, sans surprises. */
const enNomDeFichier = (titre) => titre
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[’']/g, '-')
  .replace(/[^A-Za-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .toLowerCase()
  .slice(0, 40)

const nomDe = (lecon, index) => `${String(index + 1).padStart(2, '0')}-${enNomDeFichier(lecon.titre)}`

/* ------------------------------------------------------ ce qu'on montre */

/**
 * L'écran en image — EN COULEUR quand la cartouche l'est.
 *
 * `imageDeLEcran` des livrets du tutoriel ne connaît que les quatre nuances :
 * une leçon du chapitre 8 y apparaîtrait en vert, ce qui contredirait tout ce
 * qu'elle explique. Les cartouches en quatre nuances gardent, elles, le vert
 * d'origine des autres livrets.
 */
function imageDe(gb) {
  if (!gb.ppu.couleur) return imageDeLEcran(gb)
  const huitBits = (c) => (c << 3) | (c >> 2)
  const rvb = new Uint8Array(160 * 144 * 3)
  for (let i = 0; i < 160 * 144; i++) {
    const c = gb.ppu.couleurs[i]
    rvb[i * 3] = huitBits(c & 31)
    rvb[i * 3 + 1] = huitBits(c >> 5 & 31)
    rvb[i * 3 + 2] = huitBits(c >> 10 & 31)
  }
  return `data:image/png;base64,${png(160, 144, rvb).toString('base64')}`
}

/** Les mêmes instants et les mêmes touches que `etapesDeLExecution`, en couleur si besoin. */
const INSTANTS = [
  [1, 'la toute première image — la console vient de démarrer'],
  [20, 'un tiers de seconde plus tard : le premier dessin est posé'],
  [60, 'au bout d’une seconde'],
  [180, 'au bout de trois secondes'],
  [420, 'au bout de sept secondes'],
]
const TOUCHES = [
  ['a', 'A', /boutons*(s*As*)/], ['b', 'B', /boutons*(s*Bs*)/],
  ['right', 'DROITE', /boutons*(s*DROITEs*)/], ['left', 'GAUCHE', /boutons*(s*GAUCHEs*)/],
  ['up', 'HAUT', /boutons*(s*HAUTs*)/], ['down', 'BAS', /boutons*(s*BASs*)/],
  ['start', 'START', /boutons*(s*STARTs*)/],
]

function etapesEnCouleur(lecon) {
  const { laConsole, gb } = consoleDuProgramme(lecon.code, lecon.titre, false, lecon.fichiers)
  const ecran = () => Buffer.from(gb.ppu.couleurs.buffer.slice(0))
  const etapes = []
  let precedent = null
  let images = 0
  for (const [quand, dit] of INSTANTS) {
    laConsole.avancer(quand - images)
    images = quand
    const maintenant = ecran()
    if (precedent && maintenant.equals(precedent)) continue
    precedent = maintenant
    etapes.push({ dit: `${dit} — image ${quand}`, image: imageDe(gb) })
  }
  const touches = []
  for (const [nom, etiquette, motif] of TOUCHES) {
    if (!motif.test(lecon.code)) continue
    const avant = ecran()
    gb.setButton(nom, true)
    laConsole.avancer(12)
    gb.setButton(nom, false)
    laConsole.avancer(6)
    touches.push({ etiquette, change: !ecran().equals(avant), image: imageDe(gb) })
  }
  return { etapes, touches }
}

function matiereDeLaLecon(lecon) {
  const dessins = new Map(lireDessins(lecon.code).map((d) => [d.nom, d]))
  const { gb, octets, grave } = consoleDuProgramme(lecon.code, lecon.titre, true, lecon.fichiers)

  return {
    morceaux: decouperLeProgramme(lecon.code, dessins),
    ...(gb.ppu.couleur ? etapesEnCouleur(lecon) : etapesDeLExecution(lecon)),
    controles: controlesJoues(lecon),
    apercu: imageDe(gb),
    octets: octets.length,
    grave: lignesGravees(grave).join('\n'),
  }
}

/** Où la leçon se situe : son chapitre, et sa place dedans. */
function situer(lecon, index) {
  const duChapitre = COURS.filter((l) => l.difficulte === lecon.difficulte)
  return {
    chapitre: lecon.difficulte,
    nomDuChapitre: CHAPITRES[lecon.difficulte],
    rang: duChapitre.indexOf(lecon) + 1,
    combien: duChapitre.length,
    numero: index + 1,
  }
}

/* ------------------------------------------------------- l'apparence */

const PLUS = `
  a { color: var(--vert); }
  .navigation { display: flex; justify-content: space-between; gap: 12pt; margin-top: 18pt; font-size: 9.5pt; }
  .sommaire-cours { list-style: none; padding: 0; margin: 0; }
  .sommaire-cours li { padding: 2pt 0; }
  .sommaire-cours li.chapitre {
    color: var(--vert); font-weight: 700; text-transform: uppercase;
    font-size: 9pt; letter-spacing: .05em; padding-top: 12pt;
  }
  .sommaire-cours .numero {
    display: inline-grid; place-items: center; width: 16pt; height: 16pt; border-radius: 50%;
    background: var(--vert-clair); color: var(--vert); font-size: 8pt; font-weight: 700; margin-right: 4pt;
  }
`

function pageDeLecon(lecon, index, matiere) {
  const ou = situer(lecon, index)
  const avant = COURS[index - 1]
  const apres = COURS[index + 1]
  let section = 0
  const titre = (texte) => `<h2>${++section}. ${texte}</h2>`

  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<link rel="icon" href="../favicon.svg" type="image/svg+xml">
<title>Cours ${ou.numero} — ${echapper(lecon.titre)}</title>
<style>${STYLE}${PLUS}</style>
</head>
<body>

<p class="reperes">
  <span class="niveau">Chapitre ${ou.chapitre} — ${echapper(ou.nomDuChapitre)}</span>
  <span>leçon ${ou.rang} sur ${ou.combien} dans ce chapitre</span>
  <span>${ou.numero} sur ${COURS.length} dans le cours</span>
</p>
<h1>${ou.numero}. ${echapper(lecon.titre)}</h1>
<p class="idee">${echapper(lecon.idee)}</p>

${titre('Ce qu’il faut comprendre')}
${lecon.texte.map((p) => `<p>${enrichir(p)}</p>`).join('\n')}

${titre('Le programme, morceau par morceau')}
<p>Le programme entier de la leçon, découpé comme l’œil le lit. Il fait
<strong>${matiere.octets} octets</strong> de cartouche.</p>
<p>Ce que le compilateur y a gravé, nommé — chaque morceau, sa taille, qui l’a demandé — et ce qu’il a laissé, parce que rien ne l’appelle :</p>
<pre><code>${echapper(matiere.grave)}</code></pre>

${matiere.morceaux.map((m, k) => `
<div class="morceau">
  <div>
    <p class="quoi">${k + 1}. ${echapper(m.quoi)}</p>
    <pre><code>${echapper(m.code)}</code></pre>
  </div>
  ${m.image ? `<figure><img src="${m.image}" alt="le dessin"><figcaption>à l’écran</figcaption></figure>` : '<div></div>'}
</div>`).join('\n')}

${titre('Ce qui se passe, étape par étape')}
<p>La cartouche a été compilée et exécutée pour de bon ; voici son écran aux
instants qui comptent. Une image identique à la précédente n’est pas montrée.</p>

<div class="etapes">
${matiere.etapes.map((e) => `
  <figure>
    <img src="${e.image}" alt="l’écran">
    <figcaption>${echapper(e.dit)}</figcaption>
  </figure>`).join('\n')}
</div>

${matiere.touches.length ? `
${titre('Ce que les touches changent')}
<p>Chaque bouton que le programme lit a été enfoncé douze images, puis
relâché. Voici l’écran juste après.</p>

<div class="etapes">
${matiere.touches.map((t) => `
  <figure>
    <img src="${t.image}" alt="l’écran après ${echapper(t.etiquette)}">
    <figcaption><strong>${echapper(t.etiquette)}</strong> — ${t.change ? 'l’écran a changé' : 'l’écran n’a pas bougé'}</figcaption>
  </figure>`).join('\n')}
</div>` : ''}

${titre('Ce qu’on doit voir')}
<p class="avoir">${echapper(lecon.aVoir)}</p>

${titre('Ce que la console répond')}
<p>Ces contrôles sont ceux que <code>verification/verifier-cours.mjs</code>
exige de cette leçon. Ils viennent d’être joués, et voici ce qu’ils ont mesuré.</p>

<ul class="controles">
${matiere.controles.map((c) => `
  <li>${c.bon ? '' : '✗ '}${echapper(c.quoi)} ${c.detail ? `<span class="detail">${echapper(String(c.detail))}</span>` : ''}</li>`).join('\n')}
</ul>

<p class="navigation">
  <span>${avant ? `← <a href="${nomDe(avant, index - 1)}.html">${index}. ${echapper(avant.titre)}</a>` : `<a href="index.html">← le sommaire</a>`}</span>
  <span><a href="index.html">sommaire</a></span>
  <span>${apres ? `<a href="${nomDe(apres, index + 1)}.html">${index + 2}. ${echapper(apres.titre)}</a> →` : 'C’est la dernière leçon du cours.'}</span>
</p>

<p class="pied">gameboy3 — apprendre à programmer, en écrivant pour la Game Boy</p>

</body>
</html>
`
}

function sommaire() {
  const lignes = []
  let chapitre = 0
  COURS.forEach((lecon, index) => {
    if (lecon.difficulte !== chapitre) {
      chapitre = lecon.difficulte
      lignes.push(`<li class="chapitre">Chapitre ${chapitre} — ${echapper(CHAPITRES[chapitre])}</li>`)
    }
    lignes.push(`<li><span class="numero">${index + 1}</span>
      <a href="${nomDe(lecon, index)}.html">${echapper(lecon.titre)}</a>
      — <span class="detail">${echapper(lecon.idee)}</span></li>`)
  })

  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<link rel="icon" href="../favicon.svg" type="image/svg+xml">
<title>Apprendre à programmer — le sommaire</title>
<script src="../recherche-page.js" defer></script>
<style>${STYLE}${PLUS}</style>
</head>
<body>

<h1>Apprendre à programmer, sur Game&nbsp;Boy</h1>
<p class="idee">${COURS.length} leçons en huit chapitres qui se suivent : chaque notion est
vue en profondeur avant de passer à la suivante. Chaque programme a été compilé, et
chaque image est l’écran de la console émulée.</p>

<p>Pour les faire tourner et les modifier : le <strong>MODE COURS</strong> de l’atelier, ou <code>cours.html</code>, dans
l’atelier (<code>node demarrer.mjs</code>). Les leçons du tutoriel restent
dans <code>tuto.html</code> et <code>livrets/</code> : ce cours les complète,
il ne les remplace pas.</p>

<ol class="sommaire-cours">
${lignes.join('\n')}
</ol>

<p class="pied">gameboy3 — apprendre à programmer, en écrivant pour la Game Boy</p>

</body>
</html>
`
}

/* ------------------------------------------------------- le markdown */

/** Le texte d'une leçon tel qu'on l'écrit dans un .md : il l'est déjà. */
function enMarkdown(matieres) {
  const l = []
  l.push(
    '# Apprendre à programmer, sur Game Boy',
    '',
    `**${COURS.length} leçons, huit chapitres qui se suivent** : les variables, les conditions,`,
    'les boucles, les tableaux, les fonctions, les struct — puis les quatre nuances de la Game Boy et la couleur de la Game Boy Color. Chaque notion est vue en',
    'profondeur, avec des programmes Game Boy complets, avant de passer à la suivante.',
    '',
    'Les leçons du tutoriel (`TUTORIELS.md`) sont rangées par difficulté, et les',
    'notions de programmation y sont éparpillées. Ce cours les reprend **dans l’ordre**.',
    '',
    '> **Cette page est engendrée** — `node outils/cours.mjs`. La source est',
    '> `tuto/programmation.js`, qui alimente aussi `cours.html` et les livrets de',
    '> `cours/`. `node verification/verifier-cours.mjs` compile chaque programme,',
    '> le fait tourner dans l’émulateur et contrôle ce qu’il promet.',
    '',
    '## Sommaire',
    '',
  )

  let chapitre = 0
  COURS.forEach((lecon, index) => {
    if (lecon.difficulte !== chapitre) {
      chapitre = lecon.difficulte
      l.push('', `**Chapitre ${chapitre} — ${CHAPITRES[chapitre]}**`, '')
    }
    l.push(`${index + 1}. ${lecon.titre}`)
  })

  chapitre = 0
  COURS.forEach((lecon, index) => {
    if (lecon.difficulte !== chapitre) {
      chapitre = lecon.difficulte
      l.push('', '---', '', `## Chapitre ${chapitre} — ${CHAPITRES[chapitre]}`)
    }
    l.push(
      '',
      `### ${index + 1}. ${lecon.titre}`,
      '',
      `*${lecon.idee}*`,
      '',
      ...lecon.texte.flatMap((p) => [p, '']),
      '```cpp',
      lecon.code.trimEnd(),
      '```',
      '',
      `**Ce qu’on doit voir :** ${lecon.aVoir}`,
      '',
      `*${matieres[index].octets} octets de cartouche.*`,
    )
  })

  l.push('')
  return l.join('\n')
}

/* ------------------------------------------------------- en route */

console.log(`LE COURS — ${COURS.length} leçons`)
console.log()

const matieres = COURS.map((lecon, i) => {
  const m = matiereDeLaLecon(lecon)
  const rates = m.controles.filter((c) => !c.bon).length
  console.log(`  ${String(i + 1).padStart(2)}. ${lecon.titre} — ${m.octets} o, ${m.etapes.length} étape(s)` +
    (rates ? `  ← ${rates} contrôle(s) en échec` : ''))
  return m
})

/* Le dossier est vidé : un livret renuméroté ne doit pas laisser l'ancien à côté. */
rmSync(DOSSIER, { recursive: true, force: true })
mkdirSync(DOSSIER, { recursive: true })

const pages = [join(DOSSIER, 'index.html')]
writeFileSync(pages[0], sommaire())
COURS.forEach((lecon, index) => {
  const chemin = join(DOSSIER, `${nomDe(lecon, index)}.html`)
  writeFileSync(chemin, pageDeLecon(lecon, index, matieres[index]))
  pages.push(chemin)
})
console.log(`\n  ${pages.length} pages écrites dans ${DOSSIER}/`)

writeFileSync('documents/COURS.md', enMarkdown(matieres))
console.log('  documents/COURS.md écrit')

/* --- les PDF, si on les demande et qu'un navigateur sait les imprimer --- */

if (AVEC_PDF) {
  const navigateur = [
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    process.env.LOCALAPPDATA + '/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  ].find((c) => c && existsSync(c))

  if (!navigateur) {
    console.log('  (pas de PDF : ni Chrome ni Edge n’a été trouvé)')
  } else {
    console.log(`\n  impression avec ${navigateur}…`)
    for (const page of pages.slice(1)) {
      const pdf = resolve(page.replace(/\.html$/, '.pdf'))
      spawnSync(navigateur, [
        '--headless=new', '--disable-gpu', '--no-first-run', '--no-pdf-header-footer',
        `--print-to-pdf=${pdf}`, pathToFileURL(resolve(page)).href,
      ], { stdio: 'ignore', timeout: 60000 })
      /* Edge rend la main avant d'avoir fini d'écrire : on attend le fichier. */
      for (let i = 0; i < 100 && !existsSync(pdf); i++) Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 100)
      console.log(`    ${existsSync(pdf) ? '→' : '✗'} ${pdf}`)
    }
  }
}

/**
 * Les leçons, en PDF — avec les captures de ce qu'elles font vraiment.
 *
 *   node livret.mjs
 *
 * Il écrit :
 *
 *   tutoriel.pdf                     les vingt leçons, une page chacune
 *   livrets/lecon-01-….pdf           chaque leçon, étape par étape
 *   livret.html, livrets/*.html      les mêmes, relisibles dans un navigateur
 *
 * RIEN N'EST RECOPIÉ À LA MAIN. Les leçons viennent de `tuto/lecons.js`, leur
 * code est **compilé pour de bon**, la cartouche **tourne dans l'émulateur du
 * projet**, l'image est celle de son écran, et les contrôles montrés sont ceux
 * que `verifier-tuto.mjs` exige — joués, avec ce qu'ils ont mesuré.
 *
 * Un livret rédigé à côté du code deviendrait faux à la première retouche, et
 * personne ne s'en apercevrait. C'est précisément ce qu'un livret « détaillé »
 * risque le plus.
 *
 * Le PDF est imprimé par Chrome, qu'on pilote comme les autres contrôles du
 * projet. Aucune bibliothèque à installer.
 */

import { spawn } from 'node:child_process'
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { LECONS, NIVEAUX } from '../tuto/lecons.js'
import { STYLE } from '../tuto/style.js'
import { enrichir, echapper } from '../tuto/enrichir.js'
import { consoleDuProgramme } from '../tuto/console.mjs'
import { decouperLeProgramme, etapesDeLExecution, controlesJoues, imageDeLEcran } from '../tuto/etapes.mjs'
import { lireDessins } from '../editeur-tuiles.js'

const ADRESSE = 'http://localhost:8000/'
const PORT = 9240
const DOSSIER = 'livrets'

/** Un nom de fichier tenable : sans accents, sans espaces, sans surprises. */
const enNomDeFichier = (titre) => titre
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[’']/g, '-')
  .replace(/[^A-Za-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .toLowerCase()
  .slice(0, 40)

/* ------------------------------------------------------ ce qu'on montre */

/**
 * Tout ce qu'une leçon a à montrer : son programme découpé, ce que l'écran
 * devient, ce que les touches y changent, et ce que les contrôles répondent.
 */
function matiereDeLaLecon(lecon) {
  const dessins = new Map(lireDessins(lecon.code).map((d) => [d.nom, d]))
  const { gb, octets } = consoleDuProgramme(lecon.code, lecon.titre)

  return {
    morceaux: decouperLeProgramme(lecon.code, dessins),
    ...etapesDeLExecution(lecon),
    controles: controlesJoues(lecon),
    apercu: imageDeLEcran(gb),
    octets: octets.length,
  }
}

/* --------------------------------------------------- piloter Chrome */

const patienter = (ms) => new Promise((r) => setTimeout(r, ms))

const chrome = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  process.env.LOCALAPPDATA + '/Google/Chrome/Application/chrome.exe',
  'C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe',
].find((c) => c && existsSync(c))
if (!chrome) throw new Error('Chrome introuvable : c\'est lui qui imprime le PDF')

/* Chaque ouverture a SON profil et SON port : le Chrome qu'on vient de tuer
   tient encore les siens une seconde ou deux, et le second départ échouait. */
let ouvertures = 0

async function ouvrirChrome(url) {
  const numero = ouvertures++
  const profil = join(tmpdir(), `gameboy3-livret-${numero}`)
  try { rmSync(profil, { recursive: true, force: true }) } catch { /* il partira seul */ }

  const navigateur = spawn(chrome, [
    '--headless=new', `--remote-debugging-port=${PORT + numero}`, `--user-data-dir=${profil}`,
    '--no-first-run', '--disable-gpu', '--window-size=1280,1000', url,
  ], { stdio: 'ignore' })

  let cible = null
  for (let i = 0; i < 40 && !cible; i++) {
    await patienter(250)
    try {
      const liste = await (await fetch(`http://localhost:${PORT + numero}/json/list`)).json()
      cible = liste.find((t) => t.type === 'page' && t.url.startsWith(url.split('#')[0]))
    } catch { /* pas encore prêt */ }
  }
  if (!cible) { navigateur.kill(); throw new Error('Chrome n\'a pas ouvert la page') }

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

  const envoyer = (methode, params = {}) =>
    new Promise((resoudre, rejeter) => {
      const id = prochainId++
      attentes.set(id, { resoudre, rejeter })
      prise.send(JSON.stringify({ id, method: methode, params }))
    })

  const evaluer = async (expression) => {
    const { result } = await envoyer('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
    return result.value
  }

  return { envoyer, evaluer, fermer: () => { prise.close(); navigateur.kill() } }
}

/**
 * Les ateliers, photographiés dans la vraie page.
 *
 * Quatre leçons se font à la souris ; les décrire sans les montrer n'apprend
 * rien. On ouvre donc `tuto.html`, on va à la leçon, et l'on photographie
 * l'outil tel qu'il se présente.
 */
async function photographierLesAteliers() {
  console.log('  les ateliers, dans un vrai navigateur…')
  const { envoyer, evaluer, fermer } = await ouvrirChrome(ADRESSE + 'tuto.html')
  const prises = new Map()

  try {
    await envoyer('Runtime.enable')
    await patienter(2600)

    for (const [index, lecon] of LECONS.entries()) {
      const zone = lecon.dessin ? 'dessinzone' : lecon.plan ? 'planzone' : lecon.airs ? 'airzone' : null
      if (!zone) continue

      await evaluer(`location.hash = ''; document.querySelectorAll('#sommaire button')[${index}].click()`)
      await patienter(1100)
      await evaluer(`document.getElementById('${zone}').scrollIntoView({ block: 'center' })`)
      await patienter(400)

      /* Le cadre est relevé en coordonnées de PAGE, et non de fenêtre :
         le découpage d'une capture part du haut du document. */
      const cadre = JSON.parse(await evaluer(`(() => {
        const boite = document.getElementById('${zone}').getBoundingClientRect()
        return JSON.stringify({ x: boite.x + scrollX, y: boite.y + scrollY, width: boite.width, height: boite.height })
      })()`))

      const { data } = await envoyer('Page.captureScreenshot', {
        format: 'png',
        captureBeyondViewport: true,
        clip: { x: cadre.x - 8, y: cadre.y - 8, width: cadre.width + 16, height: cadre.height + 16, scale: 2 },
      })
      prises.set(index, `data:image/png;base64,${data}`)
      console.log(`    ${lecon.titre} → ${zone}`)
    }
  } finally {
    fermer()
  }

  return prises
}

/* ------------------------------------------------------- l'apparence */

const reperesDe = (lecon, index) => `
  <p class="reperes">
    <span class="niveau">Niveau ${lecon.difficulte} — ${echapper(NIVEAUX[lecon.difficulte])}</span>
    <span>leçon ${index + 1} sur ${LECONS.length}</span>
    <span class="jauge" style="--part: ${lecon.difficulte * 10}%">difficulté ${lecon.difficulte} / 10</span>
    ${lecon.dessin ? '<span class="outil">à la souris : atelier de dessin</span>' : ''}
    ${lecon.plan ? '<span class="outil">à la souris : plan du décor</span>' : ''}
    ${lecon.airs ? '<span class="outil">à la souris : partition</span>' : ''}
  </p>`

/** Le livret d'UNE leçon : chaque étape, avec ce qu'on voit à chaque étape. */
function pageDeLecon(lecon, index, matiere, atelier) {
  const suivante = LECONS[index + 1]

  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>Leçon ${index + 1} — ${echapper(lecon.titre)}</title>
<style>${STYLE}</style>
</head>
<body>

${reperesDe(lecon, index)}
<h1>${index + 1}. ${echapper(lecon.titre)}</h1>
<p class="idee">${echapper(lecon.idee)}</p>

<h2>1. Ce qu’il faut comprendre</h2>
${lecon.texte.map((p) => `<p>${enrichir(p)}</p>`).join('\n')}

<h2>2. Le programme, morceau par morceau</h2>
<p>Le programme entier de la leçon, découpé comme l’œil le lit. Il fait
<strong>${matiere.octets} octets</strong> de cartouche.</p>

${matiere.morceaux.map((m, k) => `
<div class="morceau">
  <div>
    <p class="quoi">${k + 1}. ${echapper(m.quoi)}</p>
    <pre><code>${echapper(m.code)}</code></pre>
  </div>
  ${m.image ? `<figure><img src="${m.image}" alt="le dessin"><figcaption>à l’écran</figcaption></figure>` : '<div></div>'}
</div>`).join('\n')}

<h2>3. Ce qui se passe, étape par étape</h2>
<p>La cartouche a été compilée et exécutée pour de bon ; voici son écran aux
instants qui comptent. Une image identique à la précédente n’est pas montrée —
un programme qui ne bouge pas n’a qu’une seule image, et c’est la vérité sur ce
programme.</p>

<div class="etapes">
${matiere.etapes.map((e) => `
  <figure>
    <img src="${e.image}" alt="l’écran">
    <figcaption>${echapper(e.dit)}</figcaption>
  </figure>`).join('\n')}
</div>

${matiere.touches.length ? `
<h2>4. Ce que les touches changent</h2>
<p>Chaque bouton que le programme lit a été enfoncé douze images, puis
relâché. Voici l’écran juste après.</p>

<div class="etapes">
${matiere.touches.map((t) => `
  <figure>
    <img src="${t.image}" alt="l’écran après ${echapper(t.etiquette)}">
    <figcaption><strong>${echapper(t.etiquette)}</strong> — ${t.change ? 'l’écran a changé' : 'l’écran n’a pas bougé'}</figcaption>
  </figure>`).join('\n')}
</div>` : ''}

<h2>${matiere.touches.length ? 5 : 4}. Ce qu’on doit voir</h2>
<p class="avoir">${echapper(lecon.aVoir)}</p>

<h2>${matiere.touches.length ? 6 : 5}. Ce que la console répond</h2>
<p>Ces contrôles ne sont pas décoratifs : ce sont ceux que
<code>verifier-tuto.mjs</code> exige de cette leçon. Ils viennent d’être joués,
et voici ce qu’ils ont mesuré.</p>

<ul class="controles">
${matiere.controles.map((c) => `
  <li>${echapper(c.quoi)} ${c.detail ? `<span class="detail">${echapper(String(c.detail))}</span>` : ''}</li>`).join('\n')}
</ul>

${atelier ? `
<h2>${matiere.touches.length ? 7 : 6}. La même chose, à la souris</h2>
<p>Cette leçon porte son atelier : le geste réécrit le programme ci-dessus, et
la cartouche se refait dans la seconde. C’est le même texte, écrit autrement.</p>
<img src="${atelier}" alt="l’atelier de la leçon" style="width: 100%">` : ''}

<p class="pied">
  ${suivante
    ? `Ensuite : <strong>${index + 2}. ${echapper(suivante.titre)}</strong> — niveau ${suivante.difficulte} sur 10.`
    : 'C’est la dernière des ' + LECONS.length + ' leçons.'}
  &nbsp;·&nbsp; gameboy3 — écrire une cartouche Game Boy en C++
</p>

</body>
</html>
`
}

/** Le livret complet : les vingt leçons, une page chacune. */
function livretComplet(matieres, ateliers) {
  const sommaire = []
  let niveau = 0
  for (const [index, lecon] of LECONS.entries()) {
    if (lecon.difficulte !== niveau) {
      niveau = lecon.difficulte
      sommaire.push(`<li class="niveau">Niveau ${niveau} — ${echapper(NIVEAUX[niveau])}</li>`)
    }
    sommaire.push(`<li><span class="numero">${index + 1}</span> ${echapper(lecon.titre)}
      <span class="points">difficulté ${lecon.difficulte}/10</span></li>`)
  }

  const lecons = LECONS.map((lecon, index) => {
    const m = matieres[index]
    const atelier = ateliers.get(index)

    return `
<section class="lecon">
  ${reperesDe(lecon, index)}
  <h1 class="titre-lecon">${index + 1}. ${echapper(lecon.titre)}</h1>
  <p class="idee">${echapper(lecon.idee)}</p>

  ${lecon.texte.map((p) => `<p>${enrichir(p)}</p>`).join('\n  ')}

  <div class="deux">
    <div>
      <h3>Le programme — ${m.octets} octets</h3>
      <pre><code>${echapper(lecon.code.trimEnd())}</code></pre>
    </div>

    <div>
      <h3>Ce qu’on doit voir</h3>
      <p class="avoir">${echapper(lecon.aVoir)}</p>
      <figure style="margin-top: 8pt">
        <img src="${m.apercu}" alt="l’écran de la console" style="width: 100%">
        <figcaption>l’écran, au bout de vingt images</figcaption>
      </figure>
    </div>
  </div>

  ${atelier ? `<div style="margin-top: 10pt; break-inside: avoid">
    <h3>La même chose, à la souris</h3>
    <img src="${atelier}" alt="l’atelier" style="width: 100%">
  </div>` : ''}
</section>`
  }).join('\n')

  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>gameboy3 — le tutoriel, ${LECONS.length} leçons</title>
<style>${STYLE}
  .couverture { height: 247mm; display: flex; flex-direction: column; justify-content: center; }
  .couverture h1 { font-size: 30pt; }
  .couverture .sous { font-size: 13pt; color: var(--gris); margin: 0 0 22pt; }

  .marque {
    display: inline-grid; place-items: center; width: 54pt; height: 54pt; border-radius: 10pt;
    background: linear-gradient(140deg, #9bbc5a, var(--vert)); color: #12251c;
    font-weight: 800; font-size: 15pt; margin-bottom: 14pt;
  }

  .couverture ol { list-style: none; margin: 0; padding: 0; columns: 2; column-gap: 14mm; font-size: 9.5pt; }
  .couverture li { break-inside: avoid; padding: 1.5pt 0; }
  .couverture li.niveau {
    color: var(--vert); font-weight: 700; text-transform: uppercase;
    font-size: 8pt; letter-spacing: .05em; padding-top: 9pt;
  }

  .numero {
    display: inline-grid; place-items: center; width: 13pt; height: 13pt; border-radius: 50%;
    background: var(--vert-clair); color: var(--vert); font-size: 7.5pt; font-weight: 700;
    vertical-align: -2pt;
  }

  .points { color: var(--gris); font-size: 8pt; }

  .lecon { break-before: page; }
  .titre-lecon { font-size: 17pt; margin: 2pt 0 3pt; }
  .deux { display: grid; grid-template-columns: 1fr 46mm; gap: 7mm; margin-top: 9pt; break-inside: avoid; }
  .deux h3 { font-size: 9pt; text-transform: uppercase; letter-spacing: .07em; color: var(--gris); }
</style>
</head>
<body>

<div class="couverture">
  <div><span class="marque">C++</span></div>
  <h1>Écrire une cartouche Game&nbsp;Boy en C++</h1>
  <p class="sous">${LECONS.length} leçons, en dix niveaux de difficulté — du premier mot à l’écran
  jusqu’à la musique d’un jeu. Chaque programme de ce livret a été compilé, et chaque
  image est l’écran de la console émulée, pixel pour pixel.<br><br>
  Chaque leçon a aussi <strong>son propre livret détaillé</strong>, dans le dossier
  <code>livrets/</code> : le programme morceau par morceau, l’exécution étape par
  étape, et ce que la console répond.</p>
  <ol>${sommaire.join('\n')}</ol>
</div>

${lecons}

</body>
</html>
`
}

/* ------------------------------------------------------- en route */

console.log(`LES LIVRETS — ${LECONS.length} leçons`)
console.log()

console.log('  compilation, exécution et captures…')
const matieres = LECONS.map((lecon, i) => {
  const m = matiereDeLaLecon(lecon)
  console.log(`    ${String(i + 1).padStart(2)}. ${lecon.titre} — ${m.octets} o, ` +
    `${m.morceaux.length} morceaux, ${m.etapes.length} étape${m.etapes.length > 1 ? 's' : ''}` +
    (m.touches.length ? `, ${m.touches.length} touche${m.touches.length > 1 ? 's' : ''}` : ''))
  return m
})

let ateliers = new Map()
try {
  ateliers = await photographierLesAteliers()
} catch (erreur) {
  /* Les livrets se font quand même : mieux vaut des livrets sans les photos
     des ateliers qu'aucun livret. On le DIT, plutôt que de le laisser croire. */
  console.log(`  (les ateliers n'ont pas pu être photographiés : ${erreur.message})`)
  console.log(`   — le serveur local répond-il sur ${ADRESSE} ?`)
}

/* --- les fichiers HTML, que Chrome ira imprimer --- */

/*
 * Le dossier est vidé d'abord.
 *
 * Les livrets portent le numéro de leur leçon. Insérer une leçon au milieu les
 * renumérote toutes — et sans ce ménage, l'ancienne « lecon-20-la-musique »
 * reste à côté de la neuve « lecon-21-la-musique », toutes deux plausibles.
 * On ne saurait plus laquelle est à jour.
 */
rmSync(DOSSIER, { recursive: true, force: true })
mkdirSync(DOSSIER, { recursive: true })

const aImprimer = [{ html: 'documents/livret.html', pdf: 'documents/tutoriel.pdf' }]
writeFileSync('documents/livret.html', livretComplet(matieres, ateliers))

LECONS.forEach((lecon, index) => {
  const nom = `lecon-${String(index + 1).padStart(2, '0')}-${enNomDeFichier(lecon.titre)}`
  writeFileSync(join(DOSSIER, `${nom}.html`), pageDeLecon(lecon, index, matieres[index], ateliers.get(index)))
  aImprimer.push({ html: `${DOSSIER}/${nom}.html`, pdf: join(DOSSIER, `${nom}.pdf`) })
})

console.log(`\n  ${aImprimer.length} pages écrites — impression…`)

const { envoyer, fermer } = await ouvrirChrome(ADRESSE + 'documents/livret.html')
try {
  await envoyer('Page.enable')

  for (const { html, pdf } of aImprimer) {
    await envoyer('Page.navigate', { url: ADRESSE + html })
    /* Les images sont dans le document : rien à télécharger, mais le rendu
       d'une page de vingt et une captures demande un instant. */
    await patienter(1400)

    const { data } = await envoyer('Page.printToPDF', {
      printBackground: true,
      paperWidth: 8.27, // A4
      paperHeight: 11.69,
      marginTop: 0, marginBottom: 0, marginLeft: 0, marginRight: 0, // les marges sont dans @page
      preferCSSPageSize: true,
    })
    writeFileSync(pdf, Buffer.from(data, 'base64'))
    console.log(`    → ${pdf}`)
  }
} finally {
  fermer()
}

console.log(`\n  ${aImprimer.length} PDF écrits.`)

/**
 * Le cours complet, en UN PDF — dans l'ordre exact du parcours.
 *
 *   node outils/cours-complet.mjs        (ou : npm run cours-complet)
 *
 * Il écrit :
 *
 *   documents/cours-complet.html     le cours, relisible dans un navigateur
 *   documents/cours-complet.pdf      le même, imprimé par Chrome
 *
 * L'ORDRE est celui de `tuto.html` : `LECONS` (tuto/lecons.js), construit par
 * tuto/parcours.js — 25 chapitres, et un « #include » nouveau à la fois.
 *
 * Ce que le PDF contient, dans l'ordre :
 *
 *   1. la couverture                 une page
 *   2. le sommaire                   les 25 chapitres, avec leurs leçons
 *   3. les #include                  les 71 fonctions, dans leur ordre d'apparition
 *   4. chaque chapitre               une page d'ouverture, puis ses leçons
 *   5. l'index des #include          chaque fonction → les leçons qui l'emploient
 *
 * Chaque leçon porte un encadré « #include » : ce qui est NOUVEAU ici (à quoi
 * sert la ligne, ce qu'elle grave), et ce qui est DÉJÀ VU (et depuis quand).
 *
 * POURQUOI UN NOUVEAU GÉNÉRATEUR. L'ancien `tutoriel.pdf` (outils/livret.mjs)
 * a été pensé pour vingt leçons : sa couverture avait une hauteur FIXE d'une
 * page, et le sommaire de 587 leçons débordait par-dessus les pages suivantes
 * — l'encre s'écrasait sur elle-même. Ici, AUCUNE hauteur n'est fixée : chaque
 * bloc prend la place qu'il lui faut. Et avant d'imprimer, on vérifie dans la
 * page qu'aucun bloc n'en recouvre un autre (voir `chevauchements`) : si c'est
 * le cas, on s'arrête et l'on dit où, plutôt que d'écrire un PDF illisible.
 *
 * RIEN N'EST RECOPIÉ À LA MAIN : le texte et le code viennent des leçons, la
 * description de chaque #include vient de BIBLIOTHEQUES (compilateur/inclusion.js),
 * et chaque programme est compilé et joué dans l'émulateur du projet.
 * Pas besoin du serveur local : Chrome ouvre le fichier directement.
 */

import { spawn } from 'node:child_process'
import { existsSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

import { LECONS, NIVEAUX, numeros, partieDe, nomDuChapitre } from '../tuto/lecons.js'

/* « Chapitre 6 », ou « Série 2 » pour un chapitre qui est une série à part (voir tuto/parcours.js). */
const nomDuNiveau = (niveau) => nomDuChapitre(LECONS.find((l) => l.difficulte === niveau) ?? { difficulte: niveau })
import { inclusionsDe, fonctionDuTuto, tutosDesFonctions, leconsQuiEmploient } from '../tuto/fonctions.js'
import { BIBLIOTHEQUES } from '../compilateur/inclusion.js'
import { STYLE } from '../tuto/style.js'
import { enrichir, echapper } from '../tuto/enrichir.js'
import { consoleDuProgramme } from '../tuto/console.mjs'
import { imageDeLEcran } from '../tuto/etapes.mjs'

const HTML = 'documents/cours-complet.html'
const PDF = 'documents/cours-complet.pdf'
const PORT = 9260

const NUMEROS = numeros(LECONS)
const TUTOS = tutosDesFonctions(LECONS)       // nom → place de son tuto
const EMPLOIS = leconsQuiEmploient(LECONS)    // nom → places des leçons qui l'incluent

/** Une barre de progression dans le terminal : « [██████░░░░] 60 % — … ». */
function progression(part, quoi) {
  const plein = Math.round(part * 20)
  console.log(`  [${'█'.repeat(plein)}${'░'.repeat(20 - plein)}] ${String(Math.round(part * 100)).padStart(3)} % — ${quoi}`)
}

/* ------------------------------------------- les #include, dans l'ordre */

/*
 * La première apparition de chaque #include, en suivant le parcours.
 *
 * On lit les leçons une par une ; un nom jamais vu jusque-là est NOUVEAU dans
 * cette leçon. C'est ce qui fait l'ordre de la table des #include, et les
 * encadrés « Nouveau ici » / « Déjà vus ».
 */
const PREMIERE = new Map()                    // nom → place de la 1re leçon qui l'inclut
const NOUVEAUX = LECONS.map((lecon, index) => {
  const nouveaux = inclusionsDe(lecon).filter((nom) => !PREMIERE.has(nom))
  for (const nom of nouveaux) PREMIERE.set(nom, index)
  return nouveaux
})

/** Le commentaire écrit au bout de la ligne « #include <nom> // … », s'il y en a un. */
function commentaireDeLaLigne(lecon, nom) {
  const textes = [lecon.code ?? '', ...Object.values(lecon.fichiers ?? {})]
  for (const texte of textes) {
    const trouve = texte.match(new RegExp(`#\\s*include\\s*<\\s*${nom}\\s*>[ \\t]*//[ \\t]*(.*)`))
    if (trouve) return trouve[1].trim()
  }
  return null
}

/**
 * Ce que coûte un #include dans CE programme : ce que ses appels écrivent sur
 * place, plus les routines qu'il fait graver une fois. Le même calcul que le
 * panneau « Les #include du programme » de l'atelier (analyse-rom.js).
 * null : la fonction n'est pas appelée comme une fonction (une donnée, comme
 * ALPHABET, ou une ligne qui ne sert pas).
 */
function coutDans(grave, nom) {
  const appel = (grave.appels ?? []).find((a) => a.nom === `${nom}()`)
  if (!appel) return null
  return appel.octets + appel.routines.reduce((somme, r) => somme + r.taille, 0)
}

/* ------------------------------------------------- compiler et jouer */

/** Chaque leçon compilée, jouée vingt images, et son écran photographié. */
function matiereDe(lecon) {
  try {
    const { gb, octets, grave } = consoleDuProgramme(lecon.code, lecon.titre, true, lecon.fichiers)
    return { octets: octets.length, grave, apercu: imageDeLEcran(gb) }
  } catch (erreur) {
    /* Une leçon qui ne compile pas : on le DIT dans le PDF, au lieu de la cacher. */
    return { erreur: erreur.message }
  }
}

/* ------------------------------------------------------- les morceaux */

const lienLecon = (i, texte = NUMEROS[i]) => `<a href="#lecon-${i}">${texte}</a>`
const lienInclude = (nom) => `<a href="#include-${nom}"><code>#include &lt;${echapper(nom)}&gt;</code></a>`

/** Les chapitres : leur numéro, leur nom, et la place de leurs leçons. */
const CHAPITRES = []
LECONS.forEach((lecon, index) => {
  const dernier = CHAPITRES.at(-1)
  if (dernier && dernier.numero === lecon.difficulte) dernier.places.push(index)
  else CHAPITRES.push({ numero: lecon.difficulte, nom: NIVEAUX[lecon.difficulte], places: [index] })
})

function couverture() {
  return `
<section class="couverture">
  <div><span class="marque">C++</span></div>
  <h1>Écrire une cartouche Game&nbsp;Boy en C++</h1>
  <p class="sous">Le cours complet — le parcours entier, dans son ordre.</p>
  <ul class="chiffres">
    <li><b>${CHAPITRES.length}</b> chapitres</li>
    <li><b>${LECONS.length}</b> leçons</li>
    <li><b>${PREMIERE.size}</b> <code>#include</code>, un nouveau à la fois</li>
  </ul>
  <p>Chaque programme de ce cours a été <strong>compilé</strong>, et chaque image
  est l’écran de la console émulée, pixel pour pixel. Les leçons sont dans
  l’ordre exact de l’atelier (<code>tuto.html</code>) : rien n’arrive avant ce
  dont il a besoin.</p>
  <p>Une fonction de la console ne s’emploie qu’après l’avoir <strong>incluse</strong>
  par son nom : <code>#include &lt;texte&gt;</code>. Chaque leçon dit donc, dans un
  encadré vert, quel <code>#include</code> est <strong>nouveau</strong> ici, à quoi il
  sert, et lesquels on connaît déjà.</p>
</section>`
}

function sommaire() {
  const lignes = CHAPITRES.map((c) => {
    const premiere = c.places[0]
    const derniere = c.places.at(-1)
    const ajoutes = c.places.reduce((n, i) => n + NOUVEAUX[i].length, 0)
    return `
  <li>
    <a class="chapitre" href="#chapitre-${c.numero}"><span class="num">${c.numero}</span> ${echapper(c.nom)}</a>
    <span class="detail">leçons ${NUMEROS[premiere]} à ${NUMEROS[derniere]} — ${c.places.length} leçon${c.places.length > 1 ? 's' : ''}${ajoutes ? `, ${ajoutes} #include nouveau${ajoutes > 1 ? 'x' : ''}` : ''}</span>
  </li>`
  })
  return `
<section class="page">
  <h1>Sommaire</h1>
  <ol class="sommaire">${lignes.join('')}
  </ol>
  <p class="detail">Puis : <a href="#includes">les ${PREMIERE.size} #include, dans leur ordre d’apparition</a>
  (juste après ce sommaire) et <a href="#index">l’index des #include</a> (à la fin).</p>
</section>`
}

function tableDesIncludes() {
  const lignes = [...PREMIERE.entries()].map(([nom, premiere], k) => {
    const tuto = TUTOS.get(nom)
    const emplois = EMPLOIS.get(nom)?.length ?? 0
    return `
    <tr id="include-${nom}">
      <td class="num">${k + 1}</td>
      <td><code>#include &lt;${echapper(nom)}&gt;</code></td>
      <td>${echapper(BIBLIOTHEQUES[nom] ?? '')}</td>
      <td>${lienLecon(premiere)}</td>
      <td>${tuto === undefined ? '—' : lienLecon(tuto)}</td>
      <td>${emplois}</td>
    </tr>`
  })
  return `
<section class="page" id="includes">
  <h1>Les ${PREMIERE.size} #include</h1>
  <p>Toute fonction de la console s’inclut par son nom, en haut du programme.
  <strong>Sans la ligne</strong>, le compilateur refuse et dit laquelle écrire.
  <strong>Avec la ligne</strong>, il ne grave dans la cartouche que ce que le
  programme emploie vraiment : une ligne de trop ne coûte rien.</p>
  <p>Seules cinq fonctions n’ont pas besoin de <code>#include</code>, parce
  qu’elles font tourner la boucle du jeu : <code>image()</code>,
  <code>images()</code>, <code>retard()</code>, <code>ms()</code> et
  <code>secondes()</code>.</p>
  <p>Voici les autres, <strong>dans l’ordre où le parcours les fait apparaître</strong> —
  une seule nouvelle à la fois.</p>
  <table class="includes">
    <thead><tr><th>#</th><th>la ligne</th><th>ce qu’elle apporte</th><th>apparaît en</th><th>son tuto</th><th>leçons</th></tr></thead>
    <tbody>${lignes.join('')}
    </tbody>
  </table>
</section>`
}

function ouvertureDuChapitre(c) {
  const nouveaux = c.places.flatMap((i) => NOUVEAUX[i].map((nom) => ({ nom, i })))
  const titres = c.places.map((i) => `<li>${lienLecon(i)} ${echapper(LECONS[i].titre)}</li>`)
  return `
<section class="chapitre-ouverture" id="chapitre-${c.numero}">
  <p class="sur">${nomDuNiveau(c.numero)}</p>
  <h1>${echapper(c.nom)}</h1>
  <p class="detail">${c.places.length} leçon${c.places.length > 1 ? 's' : ''},
  de ${NUMEROS[c.places[0]]} à ${NUMEROS[c.places.at(-1)]}.</p>
  ${nouveaux.length ? `
  <div class="cadre">
    <p class="cadre-titre">Les #include que ce chapitre fait apparaître</p>
    <ul>${nouveaux.map(({ nom, i }) => `
      <li><code>#include &lt;${echapper(nom)}&gt;</code> — ${echapper(BIBLIOTHEQUES[nom] ?? '')} <span class="detail">(leçon ${lienLecon(i)})</span></li>`).join('')}
    </ul>
  </div>` : `
  <div class="cadre"><p class="cadre-titre">Aucun #include nouveau dans ce chapitre</p>
  <p>On s’y sert de ce qu’on connaît déjà.</p></div>`}
  <h2>Les leçons du chapitre</h2>
  <ol class="titres">${titres.join('')}</ol>
</section>`
}

/** L'encadré « #include » d'une leçon : le cœur de ce cours. */
function encadreDesIncludes(lecon, index, matiere) {
  const tous = inclusionsDe(lecon)
  const nouveaux = NOUVEAUX[index]
  const dejaVus = tous.filter((nom) => !nouveaux.includes(nom))
  const tutoDe = fonctionDuTuto(lecon)

  if (!tous.length) return `
  <div class="cadre">
    <p class="cadre-titre">#include : aucun</p>
    <p>Ce programme n’en a pas besoin : il n’emploie que des fonctions
    natives, comme <code>image()</code>, qui fait tourner la boucle du jeu.</p>
  </div>`

  const nouveau = (nom) => {
    const commentaire = commentaireDeLaLigne(lecon, nom)
    const cout = matiere.grave ? coutDans(matiere.grave, nom) : null
    return `
    <li><code class="fort">#include &lt;${echapper(nom)}&gt;</code> — ${echapper(BIBLIOTHEQUES[nom] ?? '')}.
      ${commentaire ? `<br><span class="detail">Dans le programme : « ${echapper(commentaire)} »</span>` : ''}
      ${cout !== null ? `<br><span class="detail">Ce qu’il grave ici : ${cout} octets de cartouche.</span>` : ''}
      ${TUTOS.has(nom) && TUTOS.get(nom) !== index ? `<br><span class="detail">Son tuto : ${lienLecon(TUTOS.get(nom), `${NUMEROS[TUTOS.get(nom)]}. ${echapper(LECONS[TUTOS.get(nom)].titre)}`)}</span>` : ''}
    </li>`
  }

  return `
  <div class="cadre">
    <p class="cadre-titre">${tutoDe ? `Cette leçon est le tuto de #include &lt;${echapper(tutoDe)}&gt;` : 'Les #include de cette leçon'}</p>
    ${nouveaux.length
      ? `<p class="nouveau">Nouveau ici :</p><ul>${nouveaux.map(nouveau).join('')}</ul>`
      : '<p class="nouveau">Rien de nouveau ici : tous ces #include ont déjà été vus.</p>'}
    ${dejaVus.length ? `<p class="deja">Déjà vus : ${dejaVus.map((nom) =>
      `<code>&lt;${echapper(nom)}&gt;</code> <span class="detail">(${lienLecon(PREMIERE.get(nom))})</span>`).join(', ')}</p>` : ''}
  </div>`
}

function pageDeLecon(lecon, index, matiere) {
  const partie = partieDe(LECONS, index)
  return `
<article class="lecon" id="lecon-${index}">
  <p class="reperes">
    <span class="niveau">${nomDuChapitre(lecon)} — ${echapper(NIVEAUX[lecon.difficulte])}</span>
    ${partie ? `<span class="niveau">Partie ${partie.lettre} — ${echapper(partie.nom)}</span>` : ''}
    ${lecon.provenance === 'cours' ? '<span class="outil">du cours</span>' : ''}
    <span>leçon ${NUMEROS[index]}</span>
    <span class="jauge" style="--part: ${(lecon.niveau ?? lecon.difficulte) * 10}%">difficulté ${lecon.niveau ?? lecon.difficulte} / 10</span>
  </p>
  <h2 class="titre-lecon">${NUMEROS[index]}. ${echapper(lecon.titre)}</h2>
  <p class="idee">${echapper(lecon.idee ?? '')}</p>

  ${(lecon.texte ?? []).map((p) => `<p>${enrichir(p)}</p>`).join('\n  ')}

  ${encadreDesIncludes(lecon, index, matiere)}

  ${Object.entries(lecon.fichiers ?? {}).map(([nom, contenu]) => `
  <p class="fichier"><code>${echapper(nom)}</code></p>
  <pre><code>${echapper(contenu.trimEnd())}</code></pre>`).join('')}
  <p class="fichier">Le programme${lecon.fichiers ? ' — <code>principal.cpp</code>' : ''}${matiere.octets ? ` — ${matiere.octets} octets de cartouche` : ''}</p>
  <pre><code>${echapper((lecon.code ?? '').trimEnd())}</code></pre>

  <div class="resultat">
    ${matiere.apercu
      ? `<figure><img src="${matiere.apercu}" alt="l’écran de la console"><figcaption>l’écran, au bout de vingt images</figcaption></figure>`
      : `<p class="detail">Ce programme n’a pas pu être compilé : ${echapper(matiere.erreur ?? '')}</p>`}
    <div>
      <p class="fichier">Ce qu’on doit voir</p>
      <p class="avoir">${echapper(lecon.aVoir ?? '')}</p>
    </div>
  </div>
</article>`
}

function indexDesIncludes() {
  const lignes = [...PREMIERE.keys()].sort((a, b) => a.localeCompare(b, 'fr')).map((nom) => {
    const emplois = EMPLOIS.get(nom) ?? []
    return `
  <li><b><code>&lt;${echapper(nom)}&gt;</code></b>
    ${TUTOS.has(nom) ? `— tuto ${lienLecon(TUTOS.get(nom))}` : ''}
    — ${emplois.length ? `${emplois.length} leçon${emplois.length > 1 ? 's' : ''} : ${emplois.map((i) => lienLecon(i)).join(', ')}` : 'employé seulement dans son tuto'}</li>`
  })
  return `
<section class="page" id="index">
  <h1>Index des #include</h1>
  <p>Par ordre alphabétique : chaque fonction, son tuto, et toutes les leçons qui l’incluent.</p>
  <ul class="index">${lignes.join('')}
  </ul>
</section>`
}

/* ------------------------------------------------------- l'apparence */

/*
 * Les règles d'or de la mise en page, pour que l'encre ne se superpose JAMAIS :
 *   - aucune hauteur fixe (ni height, ni position absolute) sur un bloc qui
 *     contient du texte ;
 *   - un chapitre commence sur une page neuve ; les leçons s'enchaînent ;
 *   - un encadré ou une image n'est pas coupé entre deux pages. Un programme
 *     plus long qu'une page, lui, doit se couper : Chrome le fait proprement.
 */
const APPARENCE = `${STYLE}
  .couverture { padding-top: 40mm; break-after: page; }
  .couverture h1 { font-size: 30pt; }
  .couverture .sous { font-size: 14pt; color: var(--gris); margin: 0 0 18pt; }
  .couverture p { font-size: 11pt; max-width: 150mm; }
  .chiffres { list-style: none; padding: 0; margin: 0 0 18pt; display: flex; gap: 8mm; font-size: 12pt; }
  .chiffres b { color: var(--vert); font-size: 18pt; }
  .marque {
    display: inline-grid; place-items: center; width: 54pt; height: 54pt; border-radius: 10pt;
    background: linear-gradient(140deg, #9bbc5a, var(--vert)); color: #12251c;
    font-weight: 800; font-size: 15pt; margin-bottom: 14pt;
  }

  .page { break-before: page; }
  .detail { color: var(--gris); font-size: 8.5pt; }
  a { color: var(--vert); text-decoration: none; }

  .sommaire { list-style: none; padding: 0; margin: 10pt 0; }
  .sommaire li { padding: 5pt 0; border-bottom: 1px dotted var(--bord); break-inside: avoid; }
  .sommaire .chapitre { font-weight: 600; font-size: 11pt; color: var(--encre); }
  .sommaire .detail { display: block; padding-left: 26pt; }
  .num {
    display: inline-block; min-width: 20pt; text-align: center; border-radius: 10pt;
    background: var(--vert-clair); color: var(--vert); font-weight: 700; font-size: 9pt;
  }

  table.includes { width: 100%; border-collapse: collapse; font-size: 8.5pt; }
  .includes th { text-align: left; color: var(--gris); font-weight: 600; border-bottom: 1pt solid var(--bord); padding: 3pt; }
  .includes td { vertical-align: top; padding: 3pt; border-bottom: 1px dotted var(--bord); }
  .includes tr { break-inside: avoid; }
  .includes thead { display: table-header-group; }

  .chapitre-ouverture { break-before: page; }
  .chapitre-ouverture .sur { color: var(--vert); font-weight: 700; text-transform: uppercase; letter-spacing: .08em; margin: 0; }
  .chapitre-ouverture h1 { font-size: 26pt; }
  .titres { columns: 2; column-gap: 10mm; font-size: 8.5pt; padding-left: 0; list-style: none; }
  .titres li { break-inside: avoid; padding: 1pt 0; }

  .cadre {
    border: 1px solid #c8d4b4; border-left: 4pt solid var(--vert); border-radius: 4pt;
    background: #f6faf1; padding: 6pt 10pt; margin: 9pt 0; break-inside: avoid;
  }
  .cadre-titre { margin: 0 0 4pt; font-weight: 700; color: var(--vert); }
  .cadre ul { margin: 0 0 4pt; padding-left: 14pt; }
  .cadre li { margin-bottom: 3pt; }
  .nouveau { margin: 0 0 3pt; font-weight: 700; }
  .deja { margin: 4pt 0 0; font-size: 9pt; }
  code.fort { background: var(--vert); color: #fff; border-color: var(--vert); font-weight: 700; }

  .lecon { margin-top: 18pt; padding-top: 10pt; border-top: 2pt solid var(--vert-clair); }
  .chapitre-ouverture + .lecon { break-before: page; border-top: 0; margin-top: 0; }
  .titre-lecon { font-size: 16pt; margin: 2pt 0 3pt; border: 0; padding: 0; break-after: avoid; }
  .reperes { break-after: avoid; }
  .fichier { font-size: 8.5pt; text-transform: uppercase; letter-spacing: .06em; color: var(--gris); margin: 9pt 0 3pt; break-after: avoid; }
  .lecon pre { margin-bottom: 6pt; }

  .resultat { display: grid; grid-template-columns: 50mm 1fr; gap: 7mm; align-items: start; margin-top: 8pt; break-inside: avoid; }
  .resultat img { width: 100%; }
  .resultat .fichier { margin-top: 0; }

  .index { columns: 2; column-gap: 10mm; font-size: 8.5pt; padding-left: 12pt; }
  .index li { break-inside: avoid; margin-bottom: 4pt; }
`

function pageEntiere(matieres) {
  const corps = CHAPITRES.map((c) =>
    ouvertureDuChapitre(c) + c.places.map((i) => pageDeLecon(LECONS[i], i, matieres[i])).join('')).join('')

  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>gameboy3 — le cours complet</title>
<style>${APPARENCE}</style>
</head>
<body>
${couverture()}
${sommaire()}
${tableDesIncludes()}
${corps}
${indexDesIncludes()}
</body>
</html>
`
}

/* --------------------------------------------------- piloter Chrome */

const patienter = (ms) => new Promise((r) => setTimeout(r, ms))

const chrome = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  process.env.LOCALAPPDATA + '/Google/Chrome/Application/chrome.exe',
  'C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
].find((c) => c && existsSync(c))

async function ouvrirChrome() {
  if (!chrome) throw new Error('Chrome introuvable : c\'est lui qui imprime le PDF')
  const profil = join(tmpdir(), 'gameboy3-cours-complet')
  try { rmSync(profil, { recursive: true, force: true }) } catch { /* il partira seul */ }

  const navigateur = spawn(chrome, [
    '--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profil}`,
    '--no-first-run', '--disable-gpu', '--window-size=794,1123', 'about:blank',
  ], { stdio: 'ignore' })

  let cible = null
  for (let i = 0; i < 60 && !cible; i++) {
    await patienter(250)
    try {
      cible = (await (await fetch(`http://localhost:${PORT}/json/list`)).json()).find((t) => t.type === 'page')
    } catch { /* pas encore prêt */ }
  }
  if (!cible) { navigateur.kill(); throw new Error('Chrome n\'a pas ouvert de page') }

  const prise = new WebSocket(cible.webSocketDebuggerUrl)
  await new Promise((r) => prise.addEventListener('open', r))

  let prochainId = 1
  const attentes = new Map()
  const evenements = new Map()
  prise.addEventListener('message', (e) => {
    const m = JSON.parse(e.data)
    if (m.method) { evenements.get(m.method)?.(); evenements.delete(m.method); return }
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
  const attendre = (evenement) => new Promise((r) => evenements.set(evenement, r))
  const evaluer = async (expression) =>
    (await envoyer('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })).result.value

  return { envoyer, attendre, evaluer, fermer: () => { prise.close(); navigateur.kill() } }
}

/*
 * Le contrôle anti-chevauchement, joué DANS la page, en mise en page « print ».
 *
 * Deux blocs qui se suivent ne doivent pas se recouvrir (le bas de l'un sous
 * le haut du suivant), et un bloc ne doit pas déborder de sa propre boîte —
 * c'est exactement ce qui écrasait l'ancien sommaire sur les leçons.
 * Rend la liste des fautes, vide si tout va bien.
 */
const chevauchements = `(() => {
  const fautes = []
  const nom = (e) => (e.id ? '#' + e.id : '') + (e.className ? '.' + String(e.className).split(' ')[0] : '') || e.tagName
  const blocs = document.querySelectorAll('body > *, article > *, section > *, .cadre > *, .resultat > *')
  for (const e of blocs) {
    if (e.scrollHeight > e.clientHeight + 2 && getComputedStyle(e).overflowY === 'visible' && e.clientHeight > 0 && e.tagName !== 'TABLE')
      fautes.push('déborde en hauteur : ' + nom(e) + ' dans ' + nom(e.closest('[id]') || e.parentElement))
    if (e.scrollWidth > e.clientWidth + 2 && e.clientWidth > 0 && e.tagName !== 'TABLE')
      fautes.push('déborde en largeur : ' + nom(e) + ' dans ' + nom(e.closest('[id]') || e.parentElement))
    const suivant = e.nextElementSibling
    if (suivant && getComputedStyle(e).position === 'static' && getComputedStyle(e.parentElement).display === 'block') {
      const a = e.getBoundingClientRect(), b = suivant.getBoundingClientRect()
      if (a.height && b.height && b.top < a.bottom - 2)
        fautes.push('recouvre le suivant : ' + nom(e) + ' dans ' + nom(e.closest('[id]') || e.parentElement))
    }
  }
  return fautes
})()`

/* ------------------------------------------------------- en route */

console.log(`LE COURS COMPLET — ${CHAPITRES.length} chapitres, ${LECONS.length} leçons, ${PREMIERE.size} #include`)
console.log()

progression(0, 'compilation et écran de chaque leçon…')
const matieres = LECONS.map((l, i) => {
  if (i % 60 === 0 && i) progression(0.6 * i / LECONS.length, `leçon ${NUMEROS[i]}…`)
  return matiereDe(l)
})
const ratees = matieres.filter((m) => m.erreur).length
progression(0.6, `${LECONS.length} leçons compilées${ratees ? ` — ${ratees} en erreur, signalées dans le PDF` : ''}`)

writeFileSync(HTML, pageEntiere(matieres))
progression(0.65, `${HTML} écrit`)

const { envoyer, attendre, evaluer, fermer } = await ouvrirChrome()
try {
  await envoyer('Page.enable')
  await envoyer('Emulation.setEmulatedMedia', { media: 'print' })
  const charge = attendre('Page.loadEventFired')
  await envoyer('Page.navigate', { url: pathToFileURL(resolve(HTML)).href })
  await charge
  await patienter(1500)
  progression(0.75, 'page ouverte — contrôle des chevauchements…')

  const fautes = await evaluer(chevauchements)
  if (fautes.length) {
    console.log(`\n  ${fautes.length} chevauchement${fautes.length > 1 ? 's' : ''} — PDF NON écrit :`)
    for (const f of fautes.slice(0, 30)) console.log('    ' + f)
    process.exitCode = 1
  } else {
    progression(0.8, 'aucun chevauchement — impression…')
    const { data } = await envoyer('Page.printToPDF', {
      printBackground: true,
      preferCSSPageSize: true,
      displayHeaderFooter: true,
      headerTemplate: '<span></span>',
      footerTemplate: `<div style="font: 7pt 'Segoe UI', sans-serif; color: #5c6472; width: 100%; padding: 0 13mm; display: flex; justify-content: space-between;">
        <span>Écrire une cartouche Game Boy en C++ — le cours complet</span>
        <span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>`,
    })
    writeFileSync(PDF, Buffer.from(data, 'base64'))
    progression(1, `${PDF} écrit`)
  }
} finally {
  fermer()
}

/**
 * La documentation technique — écrite pour quelqu’un qui découvre le code.
 *
 *   node outils/doc-technique.mjs        (ou : npm run doc-technique)
 *
 * Il écrit :
 *
 *   documents/doc-technique.html     le document, relisible dans un navigateur
 *   documents/doc-technique.pdf      le même, imprimé par Chrome
 *
 * Ce que le projet est, fichier par fichier ; comment un texte devient une
 * cartouche, en suivant un VRAI programme (exemples/bonjour.cpp) à travers
 * chaque étape du compilateur ; l’atelier, les leçons, les vérifications ; et
 * comment ajouter un jeu, une leçon, une image, une fonction.
 *
 * RIEN N’EST RECOPIÉ À LA MAIN quand on peut l’éviter : l’arbre, les
 * instructions, les octets et l’écran viennent du vrai compilateur et du vrai
 * émulateur ; la liste des fichiers et des vérifications est lue dans le
 * dossier. Si le projet change, on relance ce fichier, et le document dit vrai.
 */

import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

import { STYLE } from '../tuto/style.js'
import { enrichir, echapper } from '../tuto/enrichir.js'
import { rassembler } from '../compilateur/inclusion.js'
import { analyser } from '../compilateur/analyseur.js'
import { compiler } from '../compilateur/emetteur.js'
import { fabriquer } from '../compilateur/cartouche.js'
import { desassembler, enTete } from '../desassembleur.js'
import { GameBoy } from '../emulateur.js'
import { imageDeLEcran } from '../tuto/etapes.mjs'
import { LECONS } from '../tuto/lecons.js'
import { basesEnHtml, lexiqueEnHtml, encadreLigneParLigne, LEXIQUE } from './debutant.mjs'

const HTML = 'documents/doc-technique.html'
const PDF = 'documents/doc-technique.pdf'

const progression = (part, quoi) => {
  const n = Math.round(part * 20)
  console.log(`[${'█'.repeat(n)}${'░'.repeat(20 - n)}] ${String(Math.round(part * 100)).padStart(3)} %  ${quoi}`)
}
const p = (...lignes) => lignes.map((l) => `<p>${enrichir(l)}</p>`).join('\n')
const code = (texte) => `<pre><code>${echapper(texte)}</code></pre>`
const note = (titre, ...lignes) => `<div class="note"><p class="note-titre">${echapper(titre)}</p>${p(...lignes)}</div>`

/* ------------------------------------------------ les mots techniques en plus */

const LEXIQUE_TECHNIQUE = [
  ['assembleur', 'La langue du processeur, écrite en mots courts (ld, call, jp…) : chaque mot est une instruction de la machine. Le compilateur traduit le C++ en assembleur, puis en octets.', null],
  ['arbre (syntaxique)', 'Ce que l’analyseur fabrique : le programme rangé comme un arbre généalogique — le programme contient des fonctions, qui contiennent des instructions, qui contiennent des valeurs.', null],
  ['analyseur', 'La première partie du compilateur : il lit le texte et en fait un arbre (compilateur/analyseur.js).', null],
  ['commit (git)', 'Une « photo » enregistrée du projet, avec un message qui dit ce qui a changé. On peut toujours revenir à une photo d’avant.', null],
  ['dossier', 'Un classeur dans l’ordinateur, qui contient des fichiers (et d’autres dossiers).', null],
  ['émetteur', 'La partie du compilateur qui transforme l’arbre en instructions du processeur (compilateur/emetteur.js).', null],
  ['fichier', 'Un document enregistré dans l’ordinateur : un texte, une image, une cartouche… Son nom finit par une extension (.cpp, .js, .gb…) qui dit son genre.', null],
  ['git', 'Un programme qui garde l’historique du projet, photo après photo, et qui l’envoie sur internet (GitHub) pour le partager et le sauvegarder.', null],
  ['hexadécimal', 'Une façon d’écrire les nombres avec 16 chiffres : 0 à 9 puis A à F. « $FF » veut dire 255 ; « $0150 » veut dire 336. Pratique pour les octets : un octet s’écrit toujours en deux chiffres.', null],
  ['HTML', 'Le langage des pages web : l’atelier (index.html) est une page HTML, que le navigateur affiche.', null],
  ['JavaScript (.js)', 'Le langage dans lequel l’atelier, le compilateur et l’émulateur sont écrits. Le navigateur sait l’exécuter.', null],
  ['mémoire (RAM)', 'Là où la console range ses variables pendant le jeu : 8 Ko de cases, effacées quand on l’éteint.', null],
  ['module', 'Un fichier .js qui fait une seule chose et qui la prête aux autres (avec « export » et « import »).', null],
  ['navigateur', 'Le programme qui affiche les pages web : Chrome, Edge, Firefox… L’atelier s’ouvre dedans.', null],
  ['Node.js', 'Un programme qui exécute du JavaScript en dehors du navigateur. Il fait tourner le petit serveur de l’atelier, les outils et les vérifications.', null],
  ['processeur', 'La puce qui exécute les instructions, une à une. Celle de la Game Boy s’appelle SM83 et fait environ 4 millions de pas par seconde.', null],
  ['push (git)', 'Envoyer ses commits sur internet (GitHub) : le projet y est alors sauvegardé et partagé.', null],
  ['registre', 'Une toute petite case DANS le processeur (a, b, c, h, l…), où il fait ses calculs. Beaucoup plus rapide que la mémoire.', null],
  ['ROM', 'La mémoire de la cartouche, qu’on lit sans pouvoir l’écrire : le programme, les dessins, les textes.', null],
  ['serveur (local)', 'Un petit programme qui « sert » les pages de l’atelier au navigateur. lancer.bat le démarre ; il ne sort pas de ton ordinateur.', null],
  ['vérification', 'Un programme qui contrôle qu’un autre marche : il compile, fait tourner, appuie sur les boutons, et compare avec ce qui est attendu. ✓ veut dire « bon », ✗ « pas bon ».', null],
]

/* ------------------------------------------------ le dossier, fichier par fichier */

/* Ce que fait chaque fichier : la première vraie phrase de son commentaire d’en-tête. */
function premierePhrase(chemin) {
  let t = ''
  try { t = readFileSync(chemin, 'utf8').slice(0, 3000) } catch { return '' }
  const bloc = t.match(/\/\*\*?([\s\S]*?)\*\//)?.[1] ?? t.match(/<!--([\s\S]*?)-->/)?.[1] ?? ''
  const ligne = bloc.split('\n').map((l) => l.replace(/^\s*\*\s?/, '').trim()).find((l) => l && !l.startsWith('node ') && !l.startsWith('npm ') && l.length > 12)
  return ligne ? ligne.replace(/\s+/g, ' ').slice(0, 170) : ''
}

const DOSSIERS = {
  'compilateur/': 'le compilateur : ce qui transforme ton texte C++ en cartouche',
  'tuto/': 'les leçons du parcours, et les outils qui les font tourner',
  'outils/': 'des programmes qu’on lance en ligne de commande : compiler, fabriquer les PDF…',
  'verification/': 'les vérifications : des programmes qui contrôlent que tout marche',
  'exemples/': 'des programmes tout faits (et leurs cartouches), ouverts par le menu des exemples',
  'projets/': 'tes projets : un dossier par jeu, ouvert par « 📂 Ouvrir »',
  'documents/': 'les documents : le cours complet, cette documentation, l’historique des changements',
  'livrets/': 'un PDF par leçon, étape par étape',
  'cours/': 'un PDF par leçon du cours de programmation',
  'images/': 'des captures d’écran de l’atelier',
  'tutoriels/': 'les cartouches et les captures des leçons',
  'cartouches/': 'des cartouches du commerce, pour l’émulateur (jamais publiées : droits de Nintendo)',
}

function tableDuDossier() {
  const racine = readdirSync('.').filter((n) => !n.startsWith('.') && n !== 'node_modules')
  const lignes = []
  for (const nom of racine.sort()) {
    const dossier = statSync(nom).isDirectory()
    if (dossier) {
      const cle = nom + '/'
      lignes.push([cle, DOSSIERS[cle] ?? 'un dossier du projet', readdirSync(nom).length + ' éléments'])
    } else if (/\.(js|mjs|html|bat|php|json)$/.test(nom)) {
      lignes.push([nom, premierePhrase(nom) || '—', `${readFileSync(nom, 'utf8').split('\n').length} lignes`])
    }
  }
  return `<table class="dossier"><tbody>
${lignes.map(([n, d, t]) => `<tr><td><code>${echapper(n)}</code></td><td>${echapper(d)}</td><td>${echapper(t)}</td></tr>`).join('\n')}
</tbody></table>`
}

function tableDuCompilateur() {
  return `<table class="dossier"><tbody>
${readdirSync('compilateur').filter((n) => /\.(js|mjs)$/.test(n)).sort().map((n) =>
  `<tr><td><code>compilateur/${echapper(n)}</code></td><td>${echapper(premierePhrase(join('compilateur', n)) || '—')}</td><td>${readFileSync(join('compilateur', n), 'utf8').split('\n').length} lignes</td></tr>`).join('\n')}
</tbody></table>`
}

function tableDesVerifications() {
  return `<table class="dossier"><tbody>
${readdirSync('verification').filter((n) => n.endsWith('.mjs')).sort().map((n) =>
  `<tr><td><code>${echapper(n)}</code></td><td>${echapper(premierePhrase(join('verification', n)) || '—')}</td></tr>`).join('\n')}
</tbody></table>`
}

/* ------------------------------------------------ un vrai programme, étape par étape */

function suivreUnProgramme() {
  const chemin = 'exemples/bonjour.cpp'
  const source = readFileSync(chemin, 'utf8')
  const assemble = rassembler((nom) => (nom === 'bonjour.cpp' ? source : ''), 'bonjour.cpp')
  const arbre = analyser(assemble.texte)
  const rendu = compiler(arbre)
  const rom = fabriquer(rendu.octets, rendu.base, 'BONJOUR', rendu.vecteurVBlank, rendu.couleur)
  // les noms, pour un listing lisible
  const noms = new Map()
  for (const [nom, adresse] of rendu.variables) noms.set(adresse, nom)
  for (const [etiquette, ou] of rendu.etiquettes ?? []) noms.set(rendu.base + ou, etiquette)
  let debutMain = null
  for (const [nom, signature] of rendu.fonctions) {
    const ou = rendu.etiquettes?.get(signature.etiquette)
    if (ou !== undefined) { noms.set(rendu.base + ou, nom + '()'); if (nom === 'main') debutMain = rendu.base + ou }
  }
  const depuis = debutMain ?? enTete(rom).point
  const lignes = desassembler(rom, { depuis, jusqu: depuis + 90, base: 0, noms }).slice(0, 26)
  const listing = lignes.map((l) => `${l.etiquette ? `\n${l.etiquette} :\n` : ''}  $${l.adresse.toString(16).padStart(4, '0')}  ${l.octets.map((o) => o.toString(16).padStart(2, '0')).join(' ').padEnd(9)}  ${l.texte.padEnd(22)}${l.veutDire ? '; ' + l.veutDire : ''}`).join('\n')
  // l’arbre : le début de main, en abrégé
  const resume = (n, profondeur = 0) => {
    if (profondeur > 3 || n == null || typeof n !== 'object') return n
    if (Array.isArray(n)) return n.slice(0, 4).map((x) => resume(x, profondeur + 1))
    const o = {}
    for (const [k, v] of Object.entries(n)) if (!['ligne', 'symbole', 'signature', 'colonne'].includes(k)) o[k] = resume(v, profondeur + 1)
    return o
  }
  const main = (arbre.fonctions ?? arbre.corps ?? arbre).find?.((f) => f.nom === 'main') ?? arbre
  const arbreTexte = JSON.stringify(resume(main.corps?.slice?.(0, 3) ?? main), null, 2).split('\n').slice(0, 40).join('\n')
  // les octets : l’en-tête de la cartouche
  const hexa = (de, a) => {
    const out = []
    for (let ad = de; ad < a; ad += 16) out.push(`$${ad.toString(16).padStart(4, '0')}  ` + [...rom.slice(ad, Math.min(a, ad + 16))].map((o) => o.toString(16).padStart(2, '0')).join(' '))
    return out.join('\n')
  }
  // l’écran
  const gb = new GameBoy(); gb.loadRom(rom)
  for (let i = 0; i < 30; i++) gb.runFrame()
  const ecran = imageDeLEcran(gb)
  return { source, assemble, rendu, rom, listing, arbreTexte, hexa, ecran, entete: enTete(rom) }
}

/* ------------------------------------------------ les parties */

const PARTIES = [
  ['bases', 'Les bases — si tu n’as jamais programmé'],
  ['dossier', 'A. Ce que contient le dossier du projet'],
  ['chemin', 'B. Du texte à l’écran : suivre un vrai programme'],
  ['compilateur', 'C. Le compilateur, fichier par fichier'],
  ['atelier', 'D. L’atelier : la page où l’on travaille'],
  ['lecons', 'E. Les leçons et le parcours'],
  ['verifications', 'F. Les vérifications : comment on sait que tout marche'],
  ['ajouter', 'G. Ajouter quelque chose : un jeu, une leçon, une image, une fonction'],
  ['git', 'H. Enregistrer et partager : git'],
  ['lexique', 'Le lexique'],
]

function couverture() {
  return `<section class="couverture">
  <h1>Comment marche gameboy3</h1>
  <p class="sous">La documentation technique — écrite pour quelqu’un qui découvre le code.<br>
  Chaque mot nouveau est expliqué, et le lexique, à la fin, les reprend tous.</p>
  <ol>${PARTIES.map(([cle, titre]) => `<li><a href="#${cle}">${echapper(titre)}</a></li>`).join('')}</ol>
</section>`
}

function partieDossier() {
  return `<section id="dossier" class="partie"><h1>${PARTIES[1][1]}</h1>
${p(
    '**Le projet est un dossier** (on dit aussi un répertoire) : un classeur dans ton ordinateur, qui contient des **fichiers** et d’autres dossiers. Chaque fichier a un nom et une **extension** — les lettres après le point — qui dit son genre :',
    '- `.cpp` : un programme écrit en C++ (les jeux, les exemples) ;',
    '- `.js` et `.mjs` : un programme écrit en **JavaScript**, le langage dans lequel l’atelier, le compilateur et l’émulateur sont écrits ;',
    '- `.html` : une page web (l’atelier est une page web, ouverte dans le navigateur) ;',
    '- `.gb` et `.gbc` : une cartouche (le jeu compilé, que la console joue) ;',
    '- `.md` : un texte simple (les documents comme LISEZMOI.md) ; `.pdf` : un document à lire ou imprimer.',
    '**Voici le dossier, tel qu’il est en ce moment.** La deuxième colonne dit à quoi sert chaque élément ; pour un fichier, c’est la première phrase de son propre commentaire, lue dans le fichier lui-même.',
  )}
${tableDuDossier()}
${note('À retenir', 'Trois choses font tout le projet : **l’atelier** (index.html, la page où l’on écrit et où l’on joue), **le compilateur** (le dossier compilateur/, qui traduit le texte en cartouche) et **l’émulateur** (emulateur.js, la Game Boy imitée qui joue la cartouche). Tout le reste les aide : les leçons, les exemples, les outils, les vérifications, les documents.')}
</section>`
}

function partieChemin(s) {
  return `<section id="chemin" class="partie"><h1>${PARTIES[2][1]}</h1>
${p(
    '**Que se passe-t-il quand on appuie sur « Compiler et lancer » ?** On va le voir en suivant un vrai programme, `exemples/bonjour.cpp`, à travers chaque étape. Tout ce qui est montré ici a été **calculé** par le vrai compilateur et le vrai émulateur au moment où ce document a été fabriqué.',
    '**L’idée générale, comme une chaîne de fabrication** : le texte entre d’un côté ; chaque étape le transforme un peu ; une cartouche sort de l’autre côté, et la console la joue.',
  )}
${code('ton texte (.cpp)\n   │  1. rassembler   — verser les fichiers #include "…" au bon endroit\n   ▼\nun seul texte\n   │  2. analyser     — lire les mots et ranger le programme en arbre\n   ▼\nun arbre\n   │  3. compiler     — transformer l’arbre en instructions du processeur\n   ▼\ndes instructions (des octets)\n   │  4. fabriquer    — ajouter l’en-tête et les dessins : la cartouche\n   ▼\nune cartouche de 32 768 octets\n   │  5. jouer        — l’émulateur exécute la cartouche, 60 images par seconde\n   ▼\nl’écran')}

<h2>Le programme de départ</h2>
${p('Le voici, tel qu’il est dans le fichier :')}
${code(s.source.trimEnd())}
${encadreLigneParLigne(s.source, 'bonjour.cpp, ligne par ligne')}

<h2>Étape 1 — rassembler</h2>
${p(
    '**Un programme peut tenir sur plusieurs fichiers.** Une ligne `#include "dessins.cpp"` veut dire « verse ici le texte du fichier dessins.cpp ». La première étape fait ces versements, pour obtenir **un seul texte**. (C’est le fichier `compilateur/inclusion.js`.)',
    `**bonjour.cpp n’a qu’un fichier** : le texte rassemblé fait ${s.assemble.texte.split('\n').length} lignes, et les lignes \`#include <texte>\` (avec des chevrons) ne versent rien : elles **demandent** une fonction de la console, et le compilateur s’en souvient pour la suite.`,
  )}

<h2>Étape 2 — analyser : du texte à l’arbre</h2>
${p(
    '**L’analyseur lit le texte mot à mot** (`compilateur/analyseur.js`). Il reconnaît les mots du langage (`int`, `while`, `if`…), les noms (`compte`), les nombres, les textes entre guillemets, les signes — et il vérifie l’orthographe du C++ : une parenthèse oubliée, un point-virgule manquant, et il s’arrête en disant la ligne.',
    '**Il range le programme en arbre**, comme un arbre généalogique : le programme contient la fonction main, qui contient des instructions, qui contiennent des appels, qui contiennent des valeurs. Voici le début de main, tel que l’analyseur l’a rangé (abrégé) :',
  )}
${code(s.arbreTexte)}
${p('**Comment le lire** : chaque `{ … }` est un nœud de l’arbre ; `genre` dit ce que c’est (un appel, une boucle, une variable…), et les autres champs ses morceaux : `nom` le nom de la fonction appelée, `arguments` ce qu’on lui donne, `valeur` un nombre ou un texte, `ligne` la ligne du programme d’où vient le morceau — c’est grâce à elle qu’une erreur peut dire « ligne 14 ». Ici, la ligne 14, `texte(6, 4, "BONJOUR");`, est devenue un appel à « texte » avec trois arguments : les nombres 6 et 4, et le texte BONJOUR.', 'L’ordinateur travaille bien mieux sur cet arbre que sur le texte : tout y est déjà rangé et nommé.')}

<h2>Étape 3 — compiler : de l’arbre aux instructions</h2>
${p(
    '**L’émetteur parcourt l’arbre** (`compilateur/emetteur.js`) et, pour chaque nœud, écrit les **instructions du processeur** de la Game Boy (il s’appelle SM83). Ces instructions sont très simples : « mets ce nombre dans une case », « ajoute », « saute là-bas », « appelle cette routine ». Une seule ligne de C++ en donne souvent plusieurs.',
    `**Le résultat pour bonjour.cpp** : ${s.rendu.octets.length} octets de programme, ${s.rendu.variables.size} variable${s.rendu.variables.size > 1 ? 's' : ''}. Voici le début de main, relu par le désassembleur (\`desassembleur.js\`) — l’adresse, les octets, l’instruction, et ce qu’elle veut dire :`,
  )}
${code(s.listing)}
${p(
    '**Comment le lire, colonne par colonne** : d’abord l’**adresse** (`$0181`…), écrite en hexadécimal — un nombre avec les chiffres 0-9 et A-F — : la place de l’instruction dans la cartouche. Puis les **octets**, la traduction exacte en nombres. Puis l’**instruction**, en assembleur. Enfin, après « ; », ce qu’elle veut dire en C++, quand on le sait.',
    '**Les quatre premières lignes sont `texte(6, 4, "BONJOUR");`** : `ld hl, $9886` range dans la case « hl » l’adresse de la case de l’écran (colonne 6, ligne 4) ; `ld de, Texte_2` range l’adresse du mot BONJOUR, gravé plus loin dans la cartouche ; `ld b, 7` sa longueur, sept lettres ; `call ecrire_…` appelle la routine qui recopie les lettres à l’écran. Une ligne de C++, quatre instructions.',
    '**Les mots de l’assembleur** : `ld` « charger » (ranger une valeur quelque part), `call` « appeler une routine » (puis revenir), `jp` / `jr` « sauter » ailleurs, `inc` « ajouter 1 », `xor a` « mettre a à zéro », `bit` « tester un bit ». Les noms comme `AttendreImage` ou `LireManette` sont des **routines de la console** : du code tout fait, ajouté parce que le programme a demandé `image()` et `bouton()`. `tantque_4` est le début de la boucle `while`, et `finsi_7` la fin d’un `if` : quand le bouton A n’est pas enfoncé, `jp z, finsi_7` saute par-dessus ce qu’il y a dedans.',
    '**`main.compte` est la variable `compte`** : le compilateur lui a donné une adresse dans la mémoire, et `inc a` entre deux `ldh` est le `compte++;` du programme.',
  )}

<h2>Étape 4 — fabriquer la cartouche</h2>
${p(
    '**Une cartouche Game Boy a une forme imposée** (`compilateur/cartouche.js`) : à l’adresse `$0100`, un saut vers le programme ; de `$0104` à `$0133`, le logo de Nintendo (la console refuse de démarrer sans lui) ; à `$0134`, le titre du jeu ; puis quelques réglages, et une **somme de contrôle** qui vérifie que rien n’est abîmé. Le programme commence ensuite, en `$0150`.',
    `**Voici les premiers octets de la cartouche de bonjour**, en hexadécimal. Le titre lu dans l’en-tête : « ${echapper(s.entete.titre)} » ; taille : ${s.entete.romKo} Ko.`,
  )}
${code(s.hexa(0x100, 0x150))}
${p('**Les dessins** (les lettres de la police, les tuiles du programme) sont gravés après le programme ; la cartouche est complétée jusqu’à 32 768 octets. Dans l’atelier, le bouton « ⬇ .gb » télécharge exactement ce fichier : il marcherait sur une vraie Game Boy.')}

<h2>Étape 5 — jouer : l’émulateur</h2>
${p(
    '**L’émulateur imite la console, pièce par pièce** (`emulateur.js`) : le processeur (qui exécute les instructions une à une), la mémoire, l’écran (qui dessine 144 lignes, 60 fois par seconde), la manette et le son. Il ne « devine » rien : il fait exactement ce que ferait la vraie machine avec les mêmes octets.',
    '**Voici l’écran de bonjour, après 30 images** (une demi-seconde), photographié dans l’émulateur :',
  )}
<figure><img src="${s.ecran}" alt="l’écran de bonjour" style="width: 60%; image-rendering: pixelated;"><figcaption>exemples/bonjour.cpp, dans l’émulateur du projet</figcaption></figure>
${note('À retenir', 'Le texte devient un arbre, l’arbre devient des instructions, les instructions deviennent une cartouche, la cartouche devient un écran. Chaque étape est un fichier du projet, et chacune vérifie son travail : si quelque chose ne va pas, c’est l’étape la plus proche de ton texte qui le dit, avec la ligne.')}
</section>`
}

function partieCompilateur() {
  return `<section id="compilateur" class="partie"><h1>${PARTIES[3][1]}</h1>
${p(
    '**Le compilateur est un dossier de fichiers JavaScript**, chacun chargé d’un morceau du travail. Tu n’as pas besoin de les lire pour programmer des jeux ; mais si tu veux comprendre ou changer la console elle-même, voici où chercher. La description vient de l’en-tête de chaque fichier.',
  )}
${tableDuCompilateur()}
${p(
    '**Les plus importants** : `analyseur.js` (le texte → l’arbre), `emetteur.js` (l’arbre → les instructions, avec toutes les fonctions de la console), `inclusion.js` (les `#include`, et la liste `BIBLIOTHEQUES` de tout ce qu’on peut demander), `cartouche.js` (la cartouche), `agrandir.js` (l’agrandissement d’un dessin, pour la taille en dernier argument).',
    '**Pour ajouter ta propre fonction à la console**, un document entier l’explique pas à pas : `documents/ajouter-un-include.pdf`.',
  )}
</section>`
}

function partieAtelier() {
  return `<section id="atelier" class="partie"><h1>${PARTIES[4][1]}</h1>
${p(
    '**L’atelier est une page web** : `index.html`. Pour l’ouvrir, on double-clique sur `lancer.bat` : il démarre un petit **serveur** sur ton ordinateur (avec Node.js), puis ouvre la page dans le navigateur. (Ouvrir index.html directement d’un double-clic ne marche pas : le navigateur interdit alors à la page de lire les fichiers du projet, et la page le dit.)',
    '**Ce qu’on voit** : à gauche le **programme** (un éditeur de texte qui colore le code et propose les fonctions pendant qu’on tape), à droite la **console** (l’émulateur) avec ses boutons — Pause, Reset, Son, Plein écran, Capture, ⬇ .gb pour télécharger la cartouche.',
    '**Les modes, en haut de la page** :',
    '- **🎨 CRÉATION** : écrire le programme, et des ateliers à la souris — ▦ Les tuiles (dessiner, avec 📐 Agrandir…), ♪ Les airs (la musique), 🎨 Les couleurs, 🗺 La carte (le décor), 🖼 Les modèles (dessins tout faits : formes, images, personnages) ;',
    '- **📚 APPRENDRE** : le parcours, leçon par leçon ; chaque leçon met son programme dans l’éditeur et le lance ;',
    '- **🔎 MACHINE** : les instructions que la console exécute vraiment (le résultat de l’étape 3) ;',
    '- **🔗 LES SOURCES** : tous les documents, dont celui-ci.',
    '**Les projets** : « ✦ Nouveau » crée un dossier dans `projets/`, « 📂 Ouvrir » montre les projets du disque. Chaque compilation enregistre le projet ouvert.',
    '**Le code de la page** est surtout dans `index.html` (près de 7 000 lignes, avec beaucoup de commentaires), aidé de modules : `editeur-code.js` (l’éditeur), `editeur-tuiles.js` (le dessin), `editeur-airs.js` (la musique), `projets.js` (les projets), `recherche.js` (la recherche)…',
  )}
</section>`
}

function partieLecons() {
  const exemple = LECONS.find((l) => l.numero === '2.01') ?? LECONS[0]
  const montre = { titre: exemple.titre, numero: exemple.numero, idee: exemple.idee, texte: ['…'], code: exemple.code.split('\n').slice(0, 6).join('\n') + '\n…', aVoir: exemple.aVoir, controle: '(c) => { … }' }
  return `<section id="lecons" class="partie"><h1>${PARTIES[5][1]}</h1>
${p(
    `**Les ${LECONS.length} leçons sont écrites dans des fichiers JavaScript**, dans le dossier \`tuto/\` : \`lecons.js\` (les leçons du parcours), \`tutoriels.js\` (une leçon par fonction de la console), \`programmation.js\` (le cours de programmation), \`formes.js\` (la série 2) et \`images.js\` (la série 3). \`parcours.js\` les range dans l’ordre, chapitre par chapitre.`,
    '**Une leçon est une fiche**, avec des cases qui ont un nom : son titre, son idée, ses paragraphes d’explication, son programme, ce qu’on doit voir à l’écran, et un **contrôle** — un petit programme qui vérifie que la leçon fait bien ce qu’elle promet. Voici la fiche de la leçon 2.01, abrégée :',
  )}
${code(JSON.stringify(montre, null, 2))}
${p(
    '**Le contrôle est la garantie** : `verification/verifier-tuto.mjs` compile chaque leçon, la fait tourner dans l’émulateur, et lance son contrôle (par exemple : « le lutin 0 est-il bien en (72, 56) ? »). Si une leçon ne marche plus, la vérification le dit tout de suite.',
    '**Les PDF des leçons sont fabriqués**, pas écrits à la main : `outils/livret.mjs` (un livret par leçon, et le tutoriel), `outils/cours-complet.mjs` (le cours complet), `outils/cours.mjs` (le cours de programmation). Ils compilent chaque programme et photographient l’écran : une image dans un PDF est toujours le vrai écran.',
  )}
</section>`
}

function partieVerifications() {
  return `<section id="verifications" class="partie"><h1>${PARTIES[6][1]}</h1>
${p(
    '**Une vérification est un programme qui en contrôle un autre.** Elle fait ce que ferait une personne patiente : elle compile un programme, le fait tourner dans l’émulateur, appuie sur les boutons, lit l’écran — et compare avec ce qui est attendu. Chaque contrôle s’affiche avec ✓ (bon) ou ✗ (pas bon).',
    '**Pour toutes les lancer d’un coup**, dans une fenêtre de commande ouverte dans le dossier du projet :',
  )}
${code('npm run verifier')}
${p('**Pour en lancer une seule**, par exemple celle des jeux :')}
${code('node verification/verifier-jeux.mjs')}
${p('**Elles sont dans le dossier `verification/`**. Voici chacune, avec la première phrase de sa description :')}
${tableDesVerifications()}
${note('Pourquoi c’est important', 'Un projet de cette taille ne peut pas être vérifié à la main à chaque changement. Les vérifications le font en quelques minutes, à chaque fois, sans se lasser : quand on change le compilateur, elles disent tout de suite si une leçon, un jeu ou une page est cassé.')}
</section>`
}

function partieAjouter() {
  return `<section id="ajouter" class="partie"><h1>${PARTIES[7][1]}</h1>
<h2>Un jeu</h2>
${p(
    '1. Écris le programme dans l’atelier (ou dans un fichier `exemples/mon-jeu.cpp`) et vérifie qu’il compile et qu’il marche.',
    '2. Pour qu’il soit dans **le menu des exemples** : dans `index.html`, ajoute une ligne `<option value="monjeu">MON JEU — …</option>` dans la liste `id="exemples"`, et une ligne `monjeu: \'exemples/mon-jeu.cpp\',` dans la liste `EXEMPLES`.',
    '3. Pour qu’il soit dans **📂 Ouvrir** : crée le dossier `projets/mon_jeu/` avec `principal.cpp` (le programme), `projet.json` (son titre), et la cartouche. Le plus simple : ✦ Nouveau dans l’atelier, puis colle ton programme.',
    '4. Ajoute une partie jouée dans `verification/verifier-jeux.mjs`, pour qu’on sache toujours qu’il marche.',
  )}
<h2>Une leçon</h2>
${p(
    '1. Dans le fichier de la série qui convient (`tuto/lecons.js`, `tuto/formes.js`, `tuto/images.js`…), ajoute une fiche : titre, idée, texte, code, ce qu’on doit voir, et un contrôle.',
    '2. Lance `node verification/verifier-tuto.mjs` : ta leçon est compilée et contrôlée avec toutes les autres.',
    '3. Régénère les documents : `node outils/tutoriels.mjs`, puis les PDF (`node outils/livret.mjs`, `node outils/cours-complet.mjs`).',
  )}
<h2>Une image</h2>
${p(
    '1. Dans `bibliotheque.js`, ajoute un dessin à la liste `IMAGES` : un numéro, un nom en MAJUSCULES, un titre, et 16 rangées de 16 signes (`.`, `-`, `+`, `#`).',
    '2. Elle apparaît aussitôt dans 🖼 Les modèles, et une leçon de la série 3 est fabriquée pour elle.',
  )}
<h2>Une fonction de la console</h2>
${p('Tout est expliqué pas à pas, du premier mot au dernier, dans `documents/ajouter-un-include.pdf` : où écrire la fonction, comment la rendre disponible avec `#include`, comment l’aide de l’éditeur la propose, et comment la vérifier.')}
</section>`
}

function partieGit() {
  return `<section id="git" class="partie"><h1>${PARTIES[8][1]}</h1>
${p(
    '**git garde l’historique du projet**, comme un album de photos : chaque **commit** est une photo du projet entier, avec une phrase qui dit ce qui a changé. On peut toujours revenir à une photo d’avant — rien n’est jamais perdu.',
    '**GitHub** est un site qui garde une copie du projet sur internet. **Pousser** (push), c’est envoyer ses nouvelles photos là-bas : le projet est alors sauvegardé, et d’autres peuvent le voir.',
    '**Les trois commandes de tous les jours**, dans une fenêtre de commande ouverte dans le dossier :',
  )}
${code('git status                          # ce qui a changé depuis la dernière photo\ngit add -A                          # tout préparer pour la photo\ngit commit -m "Ce que j’ai changé"  # prendre la photo, avec sa phrase\ngit push                            # l’envoyer sur GitHub')}
${p(
    '**Ce qui n’est jamais envoyé** est écrit dans le fichier `.gitignore` : par exemple le dossier `cartouches/`, qui contient des jeux du commerce (ils appartiennent à Nintendo, on n’a pas le droit de les partager).',
    '**L’historique de ce qui a changé, en phrases** : `documents/CHANGEMENTS.md`, mis à jour à chaque étape.',
  )}
</section>`
}

/* ------------------------------------------------ en route */

progression(0, 'un vrai programme, étape par étape…')
const suivi = suivreUnProgramme()
progression(0.4, 'le dossier, les vérifications…')

const APPARENCE = STYLE + `
  .couverture { min-height: 240mm; display: flex; flex-direction: column; justify-content: center; }
  .couverture h1 { font-size: 30pt; }
  .couverture .sous { font-size: 13pt; color: #555; }
  .partie { break-before: page; }
  table.dossier { width: 100%; border-collapse: collapse; font-size: 8.5pt; }
  table.dossier td { vertical-align: top; padding: 3pt 5pt; border-bottom: 1px dotted #ccc; }
  table.dossier td:first-child { white-space: nowrap; }
  .note { border: 1px solid #c8d4b4; border-left: 4px solid #3d6b47; border-radius: 4px; padding: 6pt 10pt; margin: 10pt 0; break-inside: avoid; background: #f6faf2; }
  .note-titre { margin: 0 0 4pt; font-weight: 700; color: #3d6b47; }
  pre { white-space: pre-wrap; font-size: 8pt; }
`
const tousLesMots = [...LEXIQUE, ...LEXIQUE_TECHNIQUE]
const lexique = lexiqueEnHtml('h1').replace(/<tbody>[\s\S]*<\/tbody>/, () => {
  const tries = [...tousLesMots].sort((a, b) => a[0].replace(/^[#{(]/, '').localeCompare(b[0].replace(/^[#{(]/, ''), 'fr'))
  return `<tbody>\n${tries.map(([mot, def]) => `<tr style="break-inside: avoid;"><td style="width: 34%; vertical-align: top; padding: 4pt 6pt 4pt 0; border-bottom: 1px dotted #ccc; font-weight: 700;">${echapper(mot)}</td><td style="vertical-align: top; padding: 4pt 0; border-bottom: 1px dotted #ccc;">${echapper(def)}</td></tr>`).join('\n')}\n</tbody>`
}).replace(/Les \d+ mots techniques/, `Les ${tousLesMots.length} mots techniques`)

const page = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>Comment marche gameboy3 — la documentation technique</title>
<style>${APPARENCE}</style>
</head>
<body>
${couverture()}
<section id="bases" class="partie"><h1>${PARTIES[0][1]}</h1>
${p('**Ces bases sont les mêmes que celles du cours complet.** Si tu les as déjà lues, passe directement à la partie A.')}
${basesEnHtml({ avecSaut: false })}
</section>
${partieDossier()}
${partieChemin(suivi)}
${partieCompilateur()}
${partieAtelier()}
${partieLecons()}
${partieVerifications()}
${partieAjouter()}
${partieGit()}
<div id="lexique">${lexique}</div>
</body>
</html>
`
writeFileSync(HTML, page)
progression(0.7, `${HTML} écrit`)

const chrome = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  process.env.LOCALAPPDATA + '/Google/Chrome/Application/chrome.exe',
  'C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
].find((c) => c && existsSync(c))
if (!chrome) throw new Error('Chrome introuvable : c’est lui qui imprime le PDF')
progression(0.75, 'impression par Chrome…')
const r = spawnSync(chrome, ['--headless=new', '--disable-gpu', '--no-first-run', '--no-pdf-header-footer',
  `--print-to-pdf=${resolve(PDF)}`, pathToFileURL(resolve(HTML)).href], { stdio: 'ignore', timeout: 180000 })
if (r.status !== 0 || !existsSync(PDF)) throw new Error('Chrome n’a pas écrit le PDF')
progression(1, `${PDF} écrit`)

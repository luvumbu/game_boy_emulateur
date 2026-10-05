/**
 * « Ajouter son propre #include » — un PDF dédié, qui explique tout.
 *
 *   node outils/pdf-include.mjs
 *
 * Il écrit :
 *
 *   documents/ajouter-un-include.html    le document, relisible dans un navigateur
 *   documents/ajouter-un-include.pdf     le même, imprimé par Chrome
 *
 * RIEN N'EST RECOPIÉ À LA MAIN quand on peut l'éviter :
 *   - le code du compilateur montré (SOURCE_BANDE, la ligne de BIBLIOTHEQUES,
 *     la fiche d'aide, le motif de #include) est LU dans les vrais fichiers ;
 *   - les messages d'erreur sont ceux que le compilateur donne vraiment : on
 *     compile chaque programme fautif, et l'on écrit ce qu'il répond ;
 *   - les octets sont mesurés en compilant ;
 *   - les leçons sont celles du chapitre « Tes propres #include » du
 *     parcours, compilées et photographiées dans l'émulateur du projet.
 *
 * Si le compilateur change, on relance ce fichier, et le PDF dit vrai.
 */

import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

import { LECONS, NIVEAUX, numeros } from '../tuto/lecons.js'
import { BIBLIOTHEQUES } from '../compilateur/inclusion.js'
import { STYLE } from '../tuto/style.js'
import { enrichir, echapper } from '../tuto/enrichir.js'
import { consoleDuProgramme } from '../tuto/console.mjs'
import { imageDeLEcran } from '../tuto/etapes.mjs'

const HTML = 'documents/ajouter-un-include.html'
const PDF = 'documents/ajouter-un-include.pdf'
const NUMEROS = numeros(LECONS)

function progression(part, quoi) {
  const plein = Math.round(part * 20)
  console.log(`[${'█'.repeat(plein)}${'░'.repeat(20 - plein)}] ${String(Math.round(part * 100)).padStart(3)} %  ${quoi}`)
}

/* ------------------------------------------- lire les vrais fichiers */

const EMETTEUR = readFileSync('compilateur/emetteur.js', 'utf8')
const INCLUSION = readFileSync('compilateur/inclusion.js', 'utf8')
const AIDE = readFileSync('aide-fonctions.js', 'utf8')

/** Le morceau de `texte` qui va de `debut` jusqu'à la fin de la ligne de `fin` (compris). */
function extrait(texte, debut, fin) {
  const a = texte.indexOf(debut)
  if (a < 0) throw new Error(`introuvable dans le projet : « ${debut} »`)
  const b = texte.indexOf(fin, a + debut.length)
  if (b < 0) throw new Error(`introuvable dans le projet : « ${fin} » après « ${debut} »`)
  const finDeLigne = texte.indexOf('\n', b)
  return texte.slice(a, finDeLigne < 0 ? undefined : finDeLigne).trimEnd()
}
const ligneQuiContient = (texte, morceau) => texte.split('\n').find((l) => l.includes(morceau))?.trimEnd() ?? ''
const numeroDeLigne = (texte, morceau) => texte.split('\n').findIndex((l) => l.includes(morceau)) + 1

const VRAI = {
  tableauDebut: extrait(EMETTEUR, '/** Les fonctions de la console écrites en C', 'bande: SOURCE_BANDE,'),
  ligneBiblio: ligneQuiContient(INCLUSION, "  bande: '"),
  ligneAide: ligneQuiContient(AIDE, '  bande: {'),
  motif: ligneQuiContient(INCLUSION, 'const MOTIF ='),
  ajoutEnC: extrait(EMETTEUR, '  for (const [nom, source] of Object.entries(FONCTIONS_EN_C)) {', '  }'),
  lignes: {
    sourceBande: numeroDeLigne(EMETTEUR, 'const SOURCE_BANDE = `'),
    tableau: numeroDeLigne(EMETTEUR, 'const FONCTIONS_EN_C = {'),
    biblio: numeroDeLigne(INCLUSION, "  bande: '"),
    biblioDebut: numeroDeLigne(INCLUSION, 'export const BIBLIOTHEQUES = {'),
    aide: numeroDeLigne(AIDE, '  bande: {'),
    cacherPanneau: numeroDeLigne(EMETTEUR, "if (nom === 'cacherPanneau')"),
  },
}
/* La source de bande() s'arrête à l'accent grave qui la ferme. */
VRAI.sourceBande = EMETTEUR.slice(EMETTEUR.indexOf('const SOURCE_BANDE = `'), EMETTEUR.indexOf('`', EMETTEUR.indexOf('const SOURCE_BANDE = `') + 22) + 1)

/* ------------------------------------------- compiler pour de bon */

/** Compile ; rend { octets, apercu } ou { erreur } — le vrai message. */
function compiler(code, fichiers = {}, titre = 'essai') {
  try {
    const { gb, octets, grave } = consoleDuProgramme(code, titre, true, fichiers)
    return { octets: octets.length, apercu: imageDeLEcran(gb), elements: grave?.elements ?? [] }
  } catch (e) {
    return { erreur: e.message }
  }
}

const PROGRAMMES_FAUTIFS = [
  {
    titre: 'On appelle bande() sans écrire #include <bande>',
    pourquoi: 'C’est l’erreur la plus fréquente. Le compilateur connaît `bande()`, mais refuse de la graver sans qu’on la demande : il dit exactement quelle ligne écrire, et où.',
    remede: 'Écrire `#include <bande>` en haut du programme.',
    code: `#include <ALPHABET>

int main() {
  bande(2, 5, ALPHABET[0], 10);
  while (true) { image(); }
}
`,
  },
  {
    titre: 'Le nom est mal écrit : #include <Bande>',
    pourquoi: 'Le nom entre chevrons doit être écrit **exactement** comme la fonction, majuscules comprises. `Bande` n’est pas `bande` : n’étant pas une fonction de la console, le nom est cherché comme un FICHIER — et il n’y en a pas.',
    remede: 'Écrire `#include <bande>`, en minuscules, comme dans `bande(…)`.',
    code: `#include <ALPHABET>
#include <Bande>

int main() {
  bande(2, 5, ALPHABET[0], 10);
  while (true) { image(); }
}
`,
  },
  {
    titre: 'On demande une fonction que la console n’a pas : #include <pile>',
    pourquoi: '`pile()` n’est pas (encore) dans `BIBLIOTHEQUES` : le compilateur ne la connaît pas comme fonction de la console, et cherche donc un fichier nommé `pile`. C’est le message qu’on obtient tant que l’étape 4 de la recette (le nom dans `compilateur/inclusion.js`) n’est pas faite.',
    remede: 'Soit faire entrer `pile()` dans la console (partie E), soit l’écrire dans un fichier voisin et l’inclure avec des guillemets.',
    code: `#include <ALPHABET>
#include <pile>

int main() {
  pile(3, 4, ALPHABET[0], 8);
  while (true) { image(); }
}
`,
  },
  {
    titre: 'Le fichier voisin n’existe pas : #include "outils.cpp"',
    pourquoi: 'Avec des guillemets, le compilateur cherche un ONGLET de ce nom à côté de `principal.cpp`. S’il n’y en a pas (ou si le nom diffère d’une lettre), il s’arrête.',
    remede: 'Créer l’onglet avec le bouton « + fichier », et lui donner exactement le nom écrit entre les guillemets.',
    code: `#include "outils.cpp"

int main() {
  while (true) { image(); }
}
`,
  },
  {
    titre: 'On appelle une fonction que personne n’a écrite',
    pourquoi: 'Ni le programme ni la console n’ont de `pile()`. Le compilateur donne la liste des fonctions de la console qu’il connaît, puis celles du programme (« les vôtres »).',
    remede: 'Écrire la fonction (dans le programme ou un fichier voisin), ou l’ajouter à la console.',
    code: `#include <ALPHABET>

int main() {
  pile(3, 4, ALPHABET[0], 8);
  while (true) { image(); }
}
`,
  },
  {
    titre: 'Il manque un argument',
    pourquoi: '`bande()` en attend quatre : la colonne, la ligne, la tuile, la longueur. Le compilateur compte, et le dit.',
    remede: 'Donner les quatre : `bande(2, 5, ALPHABET[0], 10);`',
    code: `#include <ALPHABET>
#include <bande>

int main() {
  bande(2, 5, ALPHABET[0]);
  while (true) { image(); }
}
`,
  },
]

/* Ce que coûte une fonction de la console : on mesure. */
const COUTS = [
  {
    dit: 'Le programme vide : aucun #include, rien à l’écran.',
    code: `int main() {
  while (true) { image(); }
}
`,
  },
  {
    dit: '`#include <bande>` écrit, mais bande() jamais appelée.',
    code: `#include <bande>

int main() {
  while (true) { image(); }
}
`,
  },
  {
    dit: 'Avec dix `poser()` écrits à la main (dix A).',
    code: `#include <poser>
#include <ALPHABET>

int main() {
  poser(2, 5, ALPHABET[0]); poser(3, 5, ALPHABET[0]); poser(4, 5, ALPHABET[0]);
  poser(5, 5, ALPHABET[0]); poser(6, 5, ALPHABET[0]); poser(7, 5, ALPHABET[0]);
  poser(8, 5, ALPHABET[0]); poser(9, 5, ALPHABET[0]); poser(10, 5, ALPHABET[0]);
  poser(11, 5, ALPHABET[0]);
  while (true) { image(); }
}
`,
  },
  {
    dit: 'Un appel à `bande()` (les mêmes dix A).',
    code: `#include <ALPHABET>
#include <bande>

int main() {
  bande(2, 5, ALPHABET[0], 10);
  while (true) { image(); }
}
`,
  },
  {
    dit: 'Trois appels à `bande()`.',
    code: `#include <ALPHABET>
#include <bande>

int main() {
  bande(2, 5, ALPHABET[0], 10);
  bande(2, 7, ALPHABET[1], 6);
  bande(2, 9, ALPHABET[2], 3);
  while (true) { image(); }
}
`,
  },
]

/* --------------------------------------------------- les morceaux */

const pre = (code, nom) => `${nom ? `<p class="fichier"><code>${echapper(nom)}</code></p>` : ''}<pre><code>${echapper(code.trimEnd())}</code></pre>`
const p = (...lignes) => lignes.map((l) => `<p>${enrichir(l)}</p>`).join('\n')
const cadre = (titre, ...lignes) => `<div class="cadre"><p class="cadre-titre">${enrichir(titre)}</p>${p(...lignes)}</div>`
const attention = (titre, ...lignes) => `<div class="cadre alerte"><p class="cadre-titre">${enrichir(titre)}</p>${p(...lignes)}</div>`
const liste = (...items) => `<ul>${items.map((i) => `<li>${enrichir(i)}</li>`).join('')}</ul>`

/*
 * Les parties, dans l'ordre du document.
 *
 *   cle      : le nom interne (les fonctions partieA, partieB… gardent le leur)
 *   lettre   : ce que lit le lecteur (« Partie 0 », « Partie A »…)
 *   niveau   : 1 débutant, 2 intermédiaire, 3 avancé — la pastille de couleur
 *   avant    : ce qu'il faut avoir lu avant, renvoyé vers la Partie 0
 *
 * Le document s'adresse à TOUS les niveaux : rien n'y est employé sans avoir
 * été expliqué avant, soit dans la Partie 0, soit dans la partie D pour le
 * JavaScript. Chaque partie dit d'emblée ce qu'elle suppose.
 */
const PARTIES = [
  { cle: 'bases', lettre: '0', titre: 'Les bases : tout ce qu’il faut savoir avant', niveau: 1, avant: [] },
  { cle: 'a', lettre: 'A', titre: 'Les deux sortes d’#include', niveau: 1, avant: ['0.2', '0.3', '0.6', '0.9'] },
  { cle: 'b', lettre: 'B', titre: 'Ce qui se passe quand on compile', niveau: 2, avant: ['0.3', 'A'] },
  { cle: 'c', lettre: 'C', titre: 'Le chapitre du parcours, étape par étape', niveau: 2, avant: ['0.5', '0.6', '0.7', '0.8', 'A'] },
  { cle: 'js', lettre: 'D', titre: 'Le JavaScript qu’il faut pour la suite', niveau: 2, avant: ['0.2', '0.10'] },
  { cle: 'd', lettre: 'E', titre: 'La recette : ajouter ta fonction à la console', niveau: 3, avant: ['0.10', '0.11', 'C', 'D'] },
  { cle: 'e', lettre: 'F', titre: 'Les erreurs, et ce que le compilateur répond', niveau: 2, avant: ['0.6', 'A'] },
  { cle: 'f', lettre: 'G', titre: 'Ce que ça coûte dans la cartouche', niveau: 3, avant: ['0.4', '0.5', '0.6'] },
  { cle: 'g', lettre: 'H', titre: 'Les questions qu’on se pose', niveau: 2, avant: ['A', 'E'] },
  { cle: 'h', lettre: 'I', titre: 'L’aide-mémoire, à garder sous les yeux', niveau: 2, avant: ['E'] },
  { cle: 'i', lettre: 'J', titre: 'Tous les #include de la console', niveau: 1, avant: [] },
  { cle: 'lexique', lettre: 'K', titre: 'Le lexique : chaque mot technique', niveau: 1, avant: [] },
]
const PARTIE = Object.fromEntries(PARTIES.map((x) => [x.cle, x]))
const NIVEAU = {
  1: ['debutant', '● débutant', 'aucune connaissance demandée en dehors de ce qui est cité'],
  2: ['moyen', '●● intermédiaire', 'il faut avoir lu ce qui est cité, et avoir essayé'],
  3: ['avance', '●●● avancé', 'on modifie le projet lui-même : prends ton temps'],
}

/** Un renvoi cliquable : « 0.6 » vers une section de la Partie 0, « E » vers une partie. */
function renvoi(cible, court = false) {
  if (/^0\.\d+$/.test(cible)) {
    const s = SECTIONS_DES_BASES.find((x) => x.numero === cible)
    return `<a href="#base-${cible.replace('.', '-')}">${cible}${s && !court ? ` ${echapper(s.titre)}` : ''}</a>`
  }
  const x = PARTIES.find((y) => y.lettre === cible)
  return `<a href="#partie-${x.cle}">partie ${cible}${x && !court ? ` — ${echapper(x.titre)}` : ''}</a>`
}

/** L'en-tête de chaque partie : sa lettre, son titre, son niveau, ce qu'il faut avoir lu avant. */
function entete(cle) {
  const x = PARTIE[cle]
  const [classe, pastille, sens] = NIVEAU[x.niveau]
  return `
<section class="page" id="partie-${cle}">
  <p class="sur">Partie ${x.lettre}</p>
  <h1>${echapper(x.titre)}</h1>
  <div class="niveau-partie ${classe}">
    <span class="pastille">${pastille}</span> <span>${sens}</span>
    ${x.avant.length ? `<br><b>À lire avant :</b> ${x.avant.map(renvoi).join(' · ')}` : ''}
  </div>`
}

/* ------------------------------------------- la Partie 0 : les bases */

/*
 * Tout ce que le reste du document emploie, expliqué une fois, ici, en
 * partant de zéro. Chaque section a un numéro (0.1, 0.2…) : les autres
 * parties y renvoient (« À lire avant »), et le lexique aussi.
 */
const SECTIONS_DES_BASES = [
  {
    numero: '0.1',
    titre: 'Ce document, et comment t’en servir',
    html: () => `
  ${p(
    '**Ce document répond à une question : « comment ajouter moi-même un `#include` ? ».** Pour y répondre vraiment, il faut quelques bases : ce qu’est un fichier, un programme, une fonction, un octet… Cette Partie 0 les explique toutes, **en partant de zéro**. Si tu les connais déjà, survole-la.',
    '**Le code est écrit dans des cadres gris**, avec une police où toutes les lettres ont la même largeur. Les mots qui viennent du code, dans le texte, sont écrits `comme ceci`.',
    '**Les commentaires** : dans le code, tout ce qui suit `//` sur une ligne est une explication pour l’humain. La console l’ignore. Ce document en met beaucoup : lis-les, ils font partie de l’explication.',
    '**Les flèches** `→` veulent dire « donne » ou « devient » : `2 + 3 → 5`.',
  )}
  ${cadre('**Un conseil**', 'Garde l’atelier ouvert à côté de ce document, et **essaie chaque programme**. Lire un programme et le voir tourner, ce n’est pas du tout la même chose : on comprend dix fois mieux en changeant un nombre et en regardant ce qui se passe.')}`,
  },
  {
    numero: '0.2',
    titre: 'Un fichier, un dossier, une extension',
    html: () => `
  ${p(
    '**Un fichier** est un document rangé sur l’ordinateur : un texte, une image, un programme. Il a un **nom**, par exemple `inclusion.js`.',
    '**L’extension** est la fin du nom, après le point. Elle dit ce que contient le fichier :',
  )}
  <table class="comparer"><tbody>
    <tr><th><code>.cpp</code></th><td>un programme écrit en C++ (le langage de tes programmes Game Boy)</td></tr>
    <tr><th><code>.h</code></th><td>un « en-tête » C++ : un fichier fait pour être collé en haut d’un autre</td></tr>
    <tr><th><code>.js</code> <code>.mjs</code></th><td>un programme écrit en JavaScript (le langage de l’atelier et du compilateur, voir partie D)</td></tr>
    <tr><th><code>.html</code></th><td>une page web, qu’un navigateur affiche</td></tr>
    <tr><th><code>.pdf</code></th><td>un document à lire ou imprimer, comme celui-ci</td></tr>
    <tr><th><code>.md</code></th><td>un texte simple, avec un peu de mise en forme</td></tr>
    <tr><th><code>.gb</code></th><td>une cartouche Game Boy : ce que le compilateur fabrique</td></tr>
  </tbody></table>
  ${p(
    '**Un dossier** est une boîte qui contient des fichiers et d’autres dossiers. Un **chemin** dit où trouver un fichier en ouvrant les boîtes l’une après l’autre, séparées par `/` : `compilateur/inclusion.js` veut dire « le fichier `inclusion.js`, dans le dossier `compilateur` ».',
    '**Le dossier du projet** est celui qui contient `index.html` (la page de l’atelier). Tous les chemins de ce document partent de lui. Ceux dont on se sert :',
  )}
  ${pre(`le dossier du projet/
├── index.html              la page de l'atelier
├── aide-fonctions.js       l'aide de l'éditeur (partie E, étape 5)
├── compilateur/            le compilateur : il transforme ton C++ en cartouche
│   ├── inclusion.js        les #include et la liste des fonctions de la console
│   ├── analyseur.js        la lecture du programme
│   └── emetteur.js         la traduction, et les fonctions de la console
├── tuto/                   les leçons du parcours
│   ├── lecons.js           les leçons (et les tutos des fonctions)
│   └── programmation.js    le cours (dont le chapitre « Tes propres #include »)
├── outils/                 des petits programmes : compiler, faire les PDF…
└── documents/              les documents, dont ce PDF`)}
  ${p('**Dans l’atelier, un « onglet » de l’éditeur est un fichier** : `principal.cpp` est le fichier principal de ton programme ; le bouton « + fichier » en crée un autre, à côté (section 0.9).')}`,
  },
  {
    numero: '0.3',
    titre: 'Un programme, un compilateur, une cartouche',
    html: () => `
  ${p(
    '**Un programme** est une suite d’ordres écrits pour une machine. Tu l’écris en **C++**, un langage fait pour être lu par des humains : `poser(2, 5, ALPHABET[0]);` se comprend presque comme une phrase.',
    '**Le processeur de la Game Boy ne comprend pas le C++.** Il ne comprend que des **nombres** : chaque nombre est un ordre minuscule (« copie cette case », « ajoute 1 », « saute là-bas »).',
    '**Le compilateur** est le traducteur : il lit ton C++ et écrit les nombres que le processeur comprend. Dans l’atelier, il tourne tout seul dès que tu t’arrêtes d’écrire.',
    '**La cartouche** est le résultat : un fichier `.gb` qui contient tous ces nombres, plus les dessins et la musique. C’est l’équivalent de la cartouche en plastique qu’on mettait dans une vraie Game Boy.',
    '**L’émulateur** est une Game Boy imitée par l’ordinateur : il lit la cartouche et fait exactement ce qu’une vraie console ferait. C’est l’écran que tu vois dans l’atelier.',
  )}
  ${pre(`  ce que tu écris          ce que fait l'atelier                ce que tu vois
  ┌──────────────┐  le    ┌──────────────┐  l'      ┌──────────────┐
  │ principal.cpp│ compi- │  cartouche   │ ému-     │   l'écran    │
  │   (du C++)   │──────▶ │ .gb (nombres)│──────▶   │ de la console│
  └──────────────┘ lateur └──────────────┘ lateur   └──────────────┘`)}
  ${cadre('**Une image pour retenir**', 'Le C++ est une **recette** écrite en français. Le compilateur est un **traducteur** qui la réécrit dans la langue du cuisinier. La cartouche est la recette traduite. L’émulateur est le **cuisinier** qui la suit, à la lettre.')}`,
  },
  {
    numero: '0.4',
    titre: 'L’octet, et la place dans la cartouche',
    html: () => `
  ${p(
    '**Un octet est une petite case de mémoire qui retient un nombre de 0 à 255.** Pas plus : 256 valeurs possibles. C’est l’unité de base de toute la console.',
    '**Pourquoi 255 ?** Un octet est fait de **8 bits**, 8 interrupteurs qui valent 0 ou 1. Huit interrupteurs donnent 2 × 2 × 2 × 2 × 2 × 2 × 2 × 2 = **256** combinaisons : de 0 (tout éteint) à 255 (tout allumé).',
    '**Ce qui se passe au-delà :** 255 + 1 ne donne pas 256, mais **0** — le nombre « fait le tour », comme un compteur kilométrique. Et 0 − 1 donne 255.',
    '**Une cartouche de l’atelier contient 32 768 octets** (on dit « 32 Ko », 32 kilo-octets). Tout le jeu doit tenir dedans : le programme traduit, les dessins, la musique. C’est **très peu** : une seule photo de téléphone en prend des centaines de fois plus.',
    '**C’est pour cela que la console a la règle des `#include`** : chaque fonction de la console prend des octets ; on ne grave que celles qu’on demande (partie A) et qu’on appelle vraiment (partie G).',
  )}`,
  },
  {
    numero: '0.5',
    titre: 'L’écran : des cases, des tuiles, la police',
    html: () => `
  ${p(
    '**L’écran de la Game Boy mesure 160 × 144 points** (des « pixels »). On ne le dessine pas point par point : il est découpé en **cases de 8 × 8 pixels**. Cela fait **20 colonnes** (numérotées de 0 à 19, de gauche à droite) et **18 lignes** (de 0 à 17, de haut en bas).',
    '**Une case se désigne par deux nombres : sa colonne, puis sa ligne.** La case (0, 0) est en haut à gauche ; la case (19, 17) en bas à droite ; (2, 5) est la 3e colonne de la 6e ligne (on compte à partir de 0).',
  )}
  ${pre(`        colonnes →  0   1   2   3   4  …  19
  lignes   0      ┌───┬───┬───┬───┬───┬ ┬───┐
     ↓     1      ├───┼───┼───┼───┼───┼ ┼───┤
           …      │   │   │   │   │   │ │   │
           5      ├───┼───┼─A─┼───┼───┼ ┼───┤   ← poser(2, 5, ALPHABET[0])
           …      │   │   │   │   │   │ │   │      met un A en colonne 2, ligne 5
          17      └───┴───┴───┴───┴───┴ ┴───┘`)}
  ${p(
    '**Une tuile est le dessin d’une case** : 8 × 8 pixels, chacun dans une des 4 nuances de la console. Une tuile prend **16 octets** de cartouche (2 octets par rangée de 8 pixels, et 8 rangées).',
    '**La police** est l’ensemble des tuiles des lettres : A à Z, les chiffres 0 à 9, l’espace et quelques signes (43 en tout). Elles sont rangées dans un tableau nommé `ALPHABET` : `ALPHABET[0]` est le A, `ALPHABET[1]` le B, `ALPHABET[2]` le C… `ALPHABET[23]` le X. Le nombre entre crochets est la **place** dans le tableau, en partant de 0.',
    '**`poser(colonne, ligne, tuile)`** met une tuile dans une case. C’est la fonction de la console dont se sert tout ce document.',
  )}`,
  },
  {
    numero: '0.6',
    titre: 'Une fonction : la définir, l’appeler',
    html: () => `
  ${p('**Une fonction est un geste auquel on donne un nom**, pour pouvoir le refaire sans le réécrire. Il y a deux moments bien différents :')}
  ${pre(`// 1. LA DÉFINIR : écrire, une fois, ce que fait le geste.
void saluer(uint8_t ligne) {        // son nom : saluer ; son paramètre : ligne
  poser(0, ligne, ALPHABET[7]);     // un H…
  poser(1, ligne, ALPHABET[8]);     // …et un I, sur la ligne demandée
}

// 2. L'APPELER : faire le geste, autant de fois qu'on veut.
saluer(3);    // HI sur la ligne 3
saluer(10);   // HI sur la ligne 10`)}
  ${p('**Chaque mot de la première ligne a un rôle :**')}
  <table class="comparer"><tbody>
    <tr><th><code>void</code></th><td>« vide » : la fonction ne <strong>rend</strong> rien. Elle agit (elle pose des lettres), c’est tout.</td></tr>
    <tr><th><code>saluer</code></th><td>son <strong>nom</strong>. C’est lui qu’on écrit pour l’appeler.</td></tr>
    <tr><th><code>(uint8_t ligne)</code></th><td>son <strong>paramètre</strong> : une case de mémoire nommée <code>ligne</code>, qui sera remplie au moment de l’appel. <code>uint8_t</code> est son <strong>type</strong> : un octet, un nombre de 0 à 255 (section 0.4).</td></tr>
    <tr><th><code>{ … }</code></th><td>les <strong>accolades</strong> entourent le <strong>corps</strong> : les ordres exécutés à chaque appel.</td></tr>
  </tbody></table>
  ${p(
    '**Paramètre et argument, deux mots pour deux choses.** Le **paramètre** est la case vide dans la définition (`ligne`). L’**argument** est la valeur qu’on met dedans à l’appel (`3`). Pendant `saluer(3)`, `ligne` vaut 3 ; pendant `saluer(10)`, elle vaut 10.',
    '**Plusieurs paramètres** se séparent par des virgules, et l’appel donne les arguments **dans le même ordre** : `bande(colonne, ligne, tuile, longueur)` s’appelle `bande(2, 5, ALPHABET[0], 10)` → colonne = 2, ligne = 5, tuile = le A, longueur = 10.',
    '**Rendre une valeur** : une fonction peut aussi calculer un résultat et le rendre avec `return`. Elle s’écrit alors `uint8_t` au lieu de `void` : `uint8_t double_de(uint8_t n) { return n + n; }` → `double_de(4)` vaut 8.',
    '**`main()`** est la fonction par laquelle tout programme commence. La console l’appelle toute seule à l’allumage.',
    '**Une fonction de la console** (`poser`, `texte`, `bande`…) est une fonction comme les autres, sauf qu’elle a été écrite **par le projet**, pas par toi. C’est exactement pour cela qu’on peut en ajouter une (partie E).',
  )}`,
  },
  {
    numero: '0.7',
    titre: 'La boucle for, tour par tour',
    html: () => `
  ${p('**Une boucle répète des ordres.** La boucle `for` les répète en comptant. Elle a trois morceaux entre ses parenthèses, séparés par des points-virgules :')}
  ${pre(`for (uint8_t i = 0;   i < 4;   i++) {
     └─── départ ───┘ └ tant que ┘ └ après chaque tour ┘
  poser(2 + i, 5, ALPHABET[0]);      // le corps : répété à chaque tour
}`)}
  <table class="comparer"><tbody>
    <tr><th>départ</th><td><code>uint8_t i = 0</code> : crée un compteur nommé <code>i</code>, qui vaut 0. Fait <strong>une seule fois</strong>, au début.</td></tr>
    <tr><th>tant que</th><td><code>i &lt; 4</code> : la condition. Vérifiée <strong>avant chaque tour</strong> : si elle est vraie, on fait le tour ; si elle est fausse, la boucle s’arrête.</td></tr>
    <tr><th>après chaque tour</th><td><code>i++</code> : ajoute 1 à <code>i</code>. (On peut écrire <code>i = i + 2</code> pour avancer de 2.)</td></tr>
  </tbody></table>
  ${p('**Déroulé, tour par tour :**')}
  <table class="comparer">
    <thead><tr><th>Tour</th><th>i vaut</th><th>i &lt; 4 ?</th><th>Ce qui est fait</th></tr></thead>
    <tbody>
      <tr><td>1</td><td>0</td><td>oui</td><td><code>poser(2, 5, A)</code> puis i devient 1</td></tr>
      <tr><td>2</td><td>1</td><td>oui</td><td><code>poser(3, 5, A)</code> puis i devient 2</td></tr>
      <tr><td>3</td><td>2</td><td>oui</td><td><code>poser(4, 5, A)</code> puis i devient 3</td></tr>
      <tr><td>4</td><td>3</td><td>oui</td><td><code>poser(5, 5, A)</code> puis i devient 4</td></tr>
      <tr><td>—</td><td>4</td><td><strong>non</strong></td><td>la boucle s’arrête : 4 A posés, colonnes 2 à 5</td></tr>
    </tbody>
  </table>
  ${p('**À retenir :** une boucle `for (i = 0; i < N; i++)` fait **exactement N tours**, avec `i` qui vaut 0, 1, 2… jusqu’à N − 1. C’est le cœur de `bande()` : `N` est la longueur.')}`,
  },
  {
    numero: '0.8',
    titre: 'La ponctuation du C++',
    html: () => `
  <table class="comparer"><tbody>
    <tr><th><code>;</code></th><td>le <strong>point-virgule</strong> termine un ordre, comme un point termine une phrase. L’oublier est l’erreur la plus fréquente.</td></tr>
    <tr><th><code>{ }</code></th><td>les <strong>accolades</strong> regroupent plusieurs ordres : le corps d’une fonction, d’une boucle, d’un <code>if</code>.</td></tr>
    <tr><th><code>( )</code></th><td>les <strong>parenthèses</strong> entourent les arguments d’un appel, les paramètres d’une définition, la condition d’un <code>if</code> ou d’une boucle.</td></tr>
    <tr><th><code>[ ]</code></th><td>les <strong>crochets</strong> désignent une place dans un tableau : <code>ALPHABET[0]</code>.</td></tr>
    <tr><th><code>,</code></th><td>la <strong>virgule</strong> sépare les arguments : <code>poser(2, 5, A)</code>.</td></tr>
    <tr><th><code>// …</code></th><td>un <strong>commentaire</strong> : jusqu’au bout de la ligne, ignoré par la console.</td></tr>
    <tr><th><code>"…"</code></th><td>des <strong>guillemets</strong> entourent un texte : <code>texte(1, 1, "SALUT")</code>. Aussi le nom d’un fichier dans <code>#include "outils.cpp"</code>.</td></tr>
    <tr><th><code>&lt; &gt;</code></th><td>des <strong>chevrons</strong> : « plus petit que » dans <code>i &lt; 4</code> ; et le nom d’une fonction de la console dans <code>#include &lt;bande&gt;</code>.</td></tr>
    <tr><th><code>=</code> et <code>==</code></th><td><code>x = 3</code> <strong>range</strong> 3 dans x. <code>x == 3</code> <strong>demande</strong> si x vaut 3 (vrai ou faux).</td></tr>
    <tr><th><code>#</code></th><td>une ligne qui commence par <code>#</code> n’est pas un ordre pour la console, mais une <strong>consigne pour la préparation du programme</strong> : <code>#include</code>.</td></tr>
  </tbody></table>`,
  },
  {
    numero: '0.9',
    titre: 'L’atelier : où écrire, où regarder',
    html: () => `
  ${p(
    '**L’atelier est la page `index.html`, ouverte dans un navigateur.** On le lance en double-cliquant `lancer.bat` dans le dossier du projet ; il s’ouvre à l’adresse `http://localhost:8000`.',
    '**En haut, des boutons de mode :**',
  )}
  ${liste(
    '**🎨 MODE CRÉATION** : dessiner les tuiles, composer la musique, à la souris — **et écrire le programme**, dans l’éditeur juste au-dessus des ateliers. Le bouton **« ⤢ Agrandir le code »** donne tout l’écran au programme ; **« ⤡ Revoir les ateliers »** les fait revenir. C’est là qu’on se sert des `#include`.',
    '**📚 APPRENDRE** : le parcours de leçons. Le chapitre « Tes propres #include » est le dernier.',
    '**🔎 MODE MACHINE** : ce que le processeur exécute vraiment.',
    '**🔗 LES SOURCES** : tous les documents, dont celui-ci.',
  )}
  ${p(
    '**L’éditeur du programme** montre un **onglet par fichier**. Au départ, il n’y a que `principal.cpp`. Le bouton **« + fichier »**, au-dessus de l’éditeur, en ajoute un : tu lui donnes un nom (par exemple `outils.cpp`), et il apparaît comme un nouvel onglet. Cliquer un onglet l’ouvre.',
    '**La console se met à jour toute seule** : dès que tu t’arrêtes d’écrire, le programme est recompilé et relancé. Si quelque chose ne va pas, le message du compilateur s’affiche sous l’éditeur.',
  )}`,
  },
  {
    numero: '0.10',
    titre: 'Les touches utiles, et l’éditeur de texte',
    html: () => `
  ${p('**Pour la partie E, on modifie des fichiers du projet lui-même**, en dehors de l’atelier. Il faut un **éditeur de texte** : un programme qui ouvre un fichier, le montre tel quel, et l’enregistre. Le **Bloc-notes** de Windows suffit (clic droit sur le fichier → « Ouvrir avec » → Bloc-notes). **Visual Studio Code** (gratuit) est bien plus confortable : il colore le code et numérote les lignes.')}
  ${attention('**Attention : pas Word**', 'Un traitement de texte (Word, LibreOffice) ajoute de la mise en forme invisible et remplace les guillemets droits par des guillemets courbes : le fichier ne marcherait plus. Toujours un **éditeur de texte**.')}
  <table class="comparer">
    <thead><tr><th>Touches</th><th>Où</th><th>Ce qu’elles font</th></tr></thead>
    <tbody>
      <tr><td><strong>Ctrl+F</strong></td><td>éditeur, navigateur</td><td><strong>chercher</strong> un mot dans le fichier ou la page (« Trouver »)</td></tr>
      <tr><td><strong>Ctrl+G</strong></td><td>Visual Studio Code</td><td><strong>aller à une ligne</strong> par son numéro</td></tr>
      <tr><td><strong>Ctrl+S</strong></td><td>éditeur</td><td><strong>enregistrer</strong> le fichier (sans cela, rien n’est changé sur le disque)</td></tr>
      <tr><td><strong>Ctrl+Z</strong></td><td>partout</td><td><strong>annuler</strong> la dernière modification</td></tr>
      <tr><td><strong>Ctrl+F5</strong></td><td>navigateur</td><td><strong>recharger la page en relisant tout</strong>. Le navigateur garde une copie des fichiers en mémoire ; F5 seul peut réutiliser l’ancienne. Après avoir modifié le compilateur, c’est toujours Ctrl+F5.</td></tr>
      <tr><td><strong>F12</strong></td><td>navigateur</td><td>ouvre les <strong>outils de développement</strong> ; l’onglet <strong>Console</strong> montre les erreurs de la page, avec le fichier et la ligne</td></tr>
      <tr><td><strong>AltGr+7</strong></td><td>clavier français</td><td>l’<strong>accent grave</strong> seul, <code>\`</code>, dont la partie E a besoin (appuyer ensuite sur Espace)</td></tr>
    </tbody>
  </table>
  ${p('**Un numéro de ligne** désigne la place d’une ligne dans un fichier : « vers la ligne 5432 » veut dire « à peu près la 5432e ligne en partant du haut ». Dans le Bloc-notes, le numéro s’affiche en bas à droite (menu Affichage → Barre d’état).')}`,
  },
  {
    numero: '0.11',
    titre: 'La fenêtre de commande',
    html: () => `
  ${p(
    '**Une fenêtre de commande (un « terminal »)** est une fenêtre où l’on tape des ordres au clavier, au lieu de cliquer. On s’en sert pour lancer les vérifications du projet.',
    '**L’ouvrir dans le dossier du projet** : dans l’Explorateur de fichiers, ouvre le dossier du projet, fais un **clic droit dans le vide** → **« Ouvrir dans le Terminal »**. (Autre façon : clique dans la barre d’adresse de l’Explorateur, tape `cmd`, puis Entrée.)',
    '**Taper un ordre, puis Entrée.** Les trois dont ce document se sert :',
  )}
  <table class="comparer"><tbody>
    <tr><th><code>node outils/gb3.mjs essai.cpp</code></th><td>compile le fichier <code>essai.cpp</code> et dit s’il est accepté (ou le message d’erreur). <code>node</code> est le programme qui fait tourner du JavaScript en dehors du navigateur.</td></tr>
    <tr><th><code>npm run verifier</code></th><td>lance <strong>tous les contrôles</strong> du projet : chaque leçon est compilée et jouée. Chaque ligne dit <code>OK</code> ou <code>NON</code> ; à la fin, « tout est vert » si rien n’est cassé.</td></tr>
    <tr><th><code>npm run pdf-include</code></th><td>refait ce document, à jour.</td></tr>
  </tbody></table>
  ${p('**Node.js doit être installé** : c’est le cas si l’atelier démarre avec `lancer.bat` (il propose de l’installer sinon).')}`,
  },
  {
    numero: '0.12',
    titre: 'git : garder une trace, revenir en arrière',
    html: () => `
  ${p(
    '**git** est un programme qui photographie le projet à chaque étape importante. Si une modification casse tout, on revient à la dernière photo. Le dossier du projet est déjà suivi par git.',
    '**Les commandes, à taper dans la fenêtre de commande (section 0.11) :**',
  )}
  <table class="comparer"><tbody>
    <tr><th><code>git status</code></th><td>la liste des fichiers modifiés depuis la dernière photo.</td></tr>
    <tr><th><code>git diff</code></th><td>ce qui a changé, ligne par ligne : <code>-</code> devant une ligne enlevée, <code>+</code> devant une ligne ajoutée. (Touche <code>q</code> pour sortir.)</td></tr>
    <tr><th><code>git add -A</code><br><code>git commit -m "ajout de pile()"</code></th><td><strong>prendre la photo</strong>, avec une phrase qui dit ce qu’elle contient.</td></tr>
    <tr><th><code>git checkout -- compilateur/emetteur.js</code></th><td><strong>annuler</strong> toutes les modifications de ce fichier depuis la dernière photo. Attention : ce qui n’a pas été photographié est perdu.</td></tr>
  </tbody></table>
  ${cadre('**La bonne habitude**', 'Une photo (`git commit`) **avant** de toucher au compilateur, et une autre **après**, quand `npm run verifier` est vert. Si quelque chose casse entre les deux, `git checkout -- …` remet le fichier comme avant.')}`,
  },
]

function partieBases() {
  return `${entete('bases')}
  ${p('**Chaque section ci-dessous explique une seule notion, en partant de zéro.** Les autres parties y renvoient : « À lire avant : 0.6 » veut dire « lis la section 0.6 si tu ne sais pas encore ce qu’est une fonction ».')}
  ${SECTIONS_DES_BASES.map((s) => `
  <div class="base" id="base-${s.numero.replace('.', '-')}">
    <h2><span class="num">${s.numero}</span> ${echapper(s.titre)}</h2>
    ${s.html()}
  </div>`).join('')}
</section>`
}

function couverture() {
  return `
<section class="couverture">
  <div><span class="marque">#inc</span></div>
  <h1>Ajouter son propre #include</h1>
  <p class="sous">Ranger ses fonctions dans un fichier, et en faire entrer dans la console</p>
  <p>Ce document explique, du tout début jusqu’au bout, comment fonctionnent les lignes <code>#include</code> de l’atelier Game Boy, et comment en <strong>ajouter une à toi</strong>.</p>
  <p>On y suit une seule fonction, <code>bande()</code>, qui fait tout le voyage : écrite dans le programme, rangée dans un fichier voisin, puis devenue une fonction de la console que l’on demande par <code>#include &lt;bande&gt;</code>.</p>
  <p class="detail">Tout le code du compilateur montré ici est lu dans les vrais fichiers du projet ; chaque message d’erreur est celui que le compilateur donne vraiment ; chaque écran est celui que le programme affiche dans l’émulateur. Pour remettre ce document à jour : <code>node outils/pdf-include.mjs</code>.</p>
</section>
<section class="page">
  <h2>Sommaire</h2>
  <ol class="sommaire">
    ${PARTIES.map((x) => `<li><a href="#partie-${x.cle}"><span class="num">${x.lettre}</span> ${echapper(x.titre)}</a> <span class="pastille petite ${NIVEAU[x.niveau][0]}">${NIVEAU[x.niveau][1]}</span>${x.cle === 'bases'
      ? `<ol class="sous-sommaire">${SECTIONS_DES_BASES.map((s) => `<li><a href="#base-${s.numero.replace('.', '-')}">${s.numero} ${echapper(s.titre)}</a></li>`).join('')}</ol>` : ''}</li>`).join('\n    ')}
  </ol>
  ${cadre('**Comment lire ce document**',
    '**Tu débutes ?** Lis la **Partie 0** en entier, puis les parties A et C. Reviens aux autres plus tard, quand tu voudras aller plus loin : rien ne presse.',
    '**Tu as déjà suivi le parcours de l’atelier ?** Survole la Partie 0, lis A, B et C, puis D et E pour ajouter ta propre fonction à la console.',
    '**Chaque partie dit son niveau** (● débutant, ●● intermédiaire, ●●● avancé) et ce qu’il faut avoir lu avant. **Un mot que tu ne connais pas ?** Le lexique (partie K) le définit et renvoie là où il est expliqué.')}
  ${cadre('**Si tu n’as que deux minutes**',
    '`#include "outils.cpp"` (des **guillemets**) colle **ton** fichier dans le programme. Tu le crées avec le bouton **« + fichier »** de l’atelier.',
    '`#include <bande>` (des **chevrons**) demande une **fonction de la console**, qui existe déjà dans le compilateur.',
    'Pour ajouter une fonction à la console : son code dans `compilateur/emetteur.js`, son nom dans `compilateur/inclusion.js`, son aide dans `aide-fonctions.js`. Puis **Ctrl+F5** dans le navigateur.')}
</section>`
}

function partieA() {
  return `
${entete('a')}
  ${p('**Une ligne `#include` veut toujours dire la même chose : « ce programme a besoin de quelque chose qui n’est pas écrit ici ».** Ce qui change, c’est **où** ce quelque chose se trouve. Les signes qui entourent le nom le disent :')}
  <table class="comparer">
    <thead><tr><th></th><th>Des guillemets <code>"…"</code></th><th>Des chevrons <code>&lt;…&gt;</code></th></tr></thead>
    <tbody>
      <tr><th>Exemple</th><td><code>#include "outils.cpp"</code></td><td><code>#include &lt;bande&gt;</code></td></tr>
      <tr><th>Ce que c’est</th><td>un <strong>fichier à toi</strong>, un onglet à côté de <code>principal.cpp</code></td><td>une <strong>fonction de la console</strong>, connue du compilateur</td></tr>
      <tr><th>Qui l’a écrit</th><td>toi</td><td>le projet (ou toi, si tu l’y as ajoutée : partie E)</td></tr>
      <tr><th>Ce que fait la ligne</th><td>elle est <strong>remplacée</strong> par tout le texte du fichier, mot pour mot</td><td>elle <strong>autorise</strong> la fonction ; elle reste dans le texte</td></tr>
      <tr><th>Le nom</th><td>le nom de l’onglet, extension comprise</td><td>le nom de la fonction, exactement comme on l’appelle</td></tr>
      <tr><th>Sans la ligne</th><td>les fonctions du fichier sont inconnues</td><td>refus : « il faut #include &lt;bande&gt; »</td></tr>
      <tr><th>Où on la modifie</th><td>dans l’atelier, sans rien installer</td><td>dans les fichiers du compilateur (un éditeur de texte)</td></tr>
    </tbody>
  </table>

  <h2>Les guillemets : « colle ici mon fichier »</h2>
  ${p(
    '**C’est une affaire de texte, rien de plus.** Avant même de lire le programme, la console cherche les lignes `#include "…"` et remplace chacune par le contenu du fichier nommé. Le compilateur ne voit donc **qu’un seul long texte** : il ne sait même pas qu’il y avait deux onglets.',
    '**Conséquence :** un programme rangé en quatre fichiers donne **exactement la même cartouche**, à l’octet près, que le même programme écrit d’un seul bloc. Ranger ne coûte rien.',
    '**C’est ce que fait le vrai C++.** Le « préprocesseur » colle les fichiers avant la compilation. L’atelier fait pareil, avec une simplification : un fichier versé deux fois ne l’est qu’une fois. Pas besoin des « gardes d’inclusion » (`#ifndef … #define … #endif`) qu’on voit dans les vrais projets.',
  )}
  ${pre(`// principal.cpp                         // outils.cpp
#include <ALPHABET>                       #include <poser>
#include "outils.cpp"   ───── colle ───▶  void bande(…) { … }
int main() { bande(…); }                  void pile(…)  { … }`)}
  ${p('**Ce que le compilateur voit vraiment, après collage :**')}
  ${pre(`#include <ALPHABET>
#include <poser>          ← venu d'outils.cpp
void bande(…) { … }       ← venu d'outils.cpp
void pile(…)  { … }       ← venu d'outils.cpp
int main() { bande(…); }`)}

  <h2>Les chevrons : « je me sers de cette fonction de la console »</h2>
  ${p(
    '**La console a des dizaines de fonctions toutes prêtes** : `texte()`, `poser()`, `note()`, `sprite()`… Chacune prend de la **place** dans la cartouche (son code, ses petites routines, ses tables). Une cartouche ne fait que 32 768 octets.',
    '**La règle de l’atelier : aucune n’est là d’office.** On écrit `#include <texte>` pour dire « je me sers de `texte()` ». Sans la ligne, le compilateur refuse l’appel et écrit la ligne qui manque. Avec elle, il grave la fonction — **mais seulement si le programme l’appelle vraiment** : une ligne de trop ne coûte rien (la partie G le mesure).',
    '**Ce n’est pas un fichier.** `#include <bande>` ne colle aucun texte dans ton programme : la ligne reste là, et c’est le compilateur qui la lit comme une autorisation.',
    '**Seules quelques fonctions sont natives**, sans `#include` : `image()`, `images()`, `retard()`, `ms()` et `secondes()` — la boucle du jeu et ses horloges, qui ne coûtent presque rien.',
  )}
  ${attention('**Le piège :** des chevrons autour d’un nom que la console ne connaît pas',
    'Si le nom entre chevrons n’est **pas** une fonction de la console (une faute de frappe, une majuscule, une fonction pas encore ajoutée), le compilateur le cherche comme un **fichier** — et répond « fichier introuvable ». La partie F montre ce message.')}
</section>`
}

function partieB() {
  return `
${entete('b')}
  ${p(
    '**Compiler, c’est transformer ton texte C++ en nombres que le processeur de la Game Boy exécute** (section 0.3). L’atelier le fait en **cinq passes**, toujours dans le même ordre. Cette partie les raconte deux fois : d’abord **en images, sans code** (B.1) ; puis **avec le vrai code du compilateur**, expliqué morceau par morceau (B.2), pour ceux qui veulent aller plus loin.',
  )}

  <h2>B.1 — En images, sans code</h2>
  ${p('**Imagine que ton programme est une recette, et le compilateur une équipe de cuisine.** Cinq personnes s’en occupent, l’une après l’autre :')}
  <ol class="etapes">
    <li>${enrichir('**Le colleur.** Il lit la recette ligne par ligne. Quand il voit `#include "outils.cpp"`, il va chercher la page `outils.cpp` dans le classeur, et la **colle** à la place de la ligne. Quand il voit `#include <bande>`, il ne colle rien : ce n’est pas une page du classeur, c’est un ustensile de la cuisine. Il laisse la ligne.')}</li>
    <li>${enrichir('**Le lecteur.** Il lit la recette collée et la découpe en morceaux qu’il comprend : « ici une fonction nommée `main` », « là un appel à `bande` avec quatre nombres », « là une demande d’ustensile : `bande` ».')}</li>
    <li>${enrichir('**Le contrôleur.** Il fait la liste des ustensiles que la recette **utilise** (les fonctions de la console appelées), et la compare à ceux qu’elle **demande** (les `#include <…>`). S’il en manque un : il arrête tout, et écrit « il faut #include <bande> ». Si la recette a son propre ustensile du même nom (sa propre fonction `bande`), il ne réclame rien : c’est le sien.')}</li>
    <li>${enrichir('**Le magasinier.** Pour chaque ustensile demandé **et vraiment utilisé**, il va chercher son mode d’emploi dans la réserve du projet, et l’ajoute au début de la recette. Pour `bande()`, ce mode d’emploi est écrit en C++, exactement comme si tu l’avais écrit toi-même. Un ustensile demandé mais jamais utilisé reste dans la réserve : il ne coûte rien.')}</li>
    <li>${enrichir('**Le traducteur.** Il traduit toute la recette (la tienne, plus les modes d’emploi ajoutés) dans la langue du processeur : des nombres. Il les range dans la cartouche, avec les dessins. L’émulateur peut la lancer.')}</li>
  </ol>
  ${cadre('**À retenir**',
    'Les **guillemets** sont l’affaire du **colleur** (étape 1) : c’est du texte collé, rien de plus.',
    'Les **chevrons** sont l’affaire du **contrôleur** et du **magasinier** (étapes 3 et 4) : une autorisation, puis l’ajout du code de la fonction, seulement si elle sert.',
    'Une fonction de la console écrite en C++ est ajoutée **exactement comme si tu l’avais écrite**. C’est pour cela qu’en ajouter une est à ta portée : il suffit de la ranger dans la réserve (partie E).')}

  <h2>B.2 — Avec le vrai code</h2>
  ${p('**Cette section montre le vrai code du compilateur**, lu dans ses fichiers pendant la fabrication de ce document. Il est en JavaScript : la partie D explique ce qu’il faut pour le lire. Tu peux la sauter sans rien perdre pour la suite.')}

  <h3>Étape 1 — Le colleur : reconnaître une ligne #include</h3>
  ${p('Dans `compilateur/inclusion.js`, une seule ligne décide si une ligne du programme est un `#include`. C’est un **motif** (on dit une « expression régulière ») : une sorte de pochoir que le compilateur pose sur chaque ligne pour voir si elle a la bonne forme.')}
  ${pre(VRAI.motif, 'compilateur/inclusion.js')}
  ${p('**Le pochoir, morceau par morceau** (le motif est entre les deux `/`) :')}
  <table class="comparer">
    <thead><tr><th>Morceau</th><th>Ce qu’il veut dire</th><th>Dans <code>#include &lt;bande&gt;   // …</code></th></tr></thead>
    <tbody>
      <tr><td><code>^</code></td><td>le début de la ligne</td><td>avant le <code>#</code></td></tr>
      <tr><td><code>[ \\t]*</code></td><td>des espaces ou des tabulations, autant qu’on veut (même aucun)</td><td>aucun</td></tr>
      <tr><td><code>#</code></td><td>le signe dièse, tel quel</td><td><code>#</code></td></tr>
      <tr><td><code>\\s*</code></td><td>des espaces facultatifs</td><td>aucun</td></tr>
      <tr><td><code>include</code></td><td>le mot <code>include</code>, tel quel</td><td><code>include</code></td></tr>
      <tr><td><code>\\s*</code></td><td>des espaces facultatifs</td><td>un espace</td></tr>
      <tr><td><code>"([^"]+)"</code></td><td><strong>soit</strong> un nom entre guillemets (<code>[^"]+</code> : un ou plusieurs signes qui ne sont pas des guillemets) — c’est un <strong>fichier</strong></td><td>—</td></tr>
      <tr><td><code>|</code></td><td>« ou bien »</td><td></td></tr>
      <tr><td><code>&lt;([^&gt;]+)&gt;</code></td><td><strong>soit</strong> un nom entre chevrons</td><td><code>&lt;bande&gt;</code> → le nom <code>bande</code></td></tr>
      <tr><td><code>[ \\t]*</code></td><td>des espaces facultatifs</td><td>les trois espaces</td></tr>
      <tr><td><code>(?:\\/\\/.*)?</code></td><td>un commentaire <code>//</code> facultatif, jusqu’au bout</td><td><code>// …</code></td></tr>
      <tr><td><code>$</code></td><td>la fin de la ligne</td><td></td></tr>
    </tbody>
  </table>
  ${p(
    '**Ce qui se passe ensuite :** si le nom est entre guillemets, le colleur remplace la ligne par le fichier. S’il est entre chevrons **et** qu’il figure dans la liste `BIBLIOTHEQUES` (partie J), la ligne est laissée telle quelle. S’il est entre chevrons mais **absent** de la liste, il est traité comme un nom de fichier — d’où le message « fichier introuvable » de la partie F.',
  )}

  <h3>Étape 3 — Le contrôleur</h3>
  ${p('Dans `compilateur/emetteur.js`, la fonction `inclusionsEmployees` parcourt tout l’arbre du programme. Pour chaque **appel** dont le nom est dans `BIBLIOTHEQUES` — et qui n’est pas une fonction écrite par le programme lui-même —, elle note le nom et sa ligne. Ensuite, ce qui est noté sans être inclus est refusé, avant toute traduction.')}

  <h3>Étape 4 — Le magasinier : ajouter les fonctions écrites en C++</h3>
  ${p('Voici, lue dans `compilateur/emetteur.js`, la boucle qui ajoute les fonctions de la console écrites en C++ :')}
  ${pre(VRAI.ajoutEnC, 'compilateur/emetteur.js')}
  ${p('**Ligne par ligne :**')}
  <table class="comparer"><tbody>
    <tr><th>ligne 1</th><td><code>for (const [nom, source] of Object.entries(FONCTIONS_EN_C))</code> : pour chaque élément de l’objet <code>FONCTIONS_EN_C</code> (D.4), prendre son nom (<code>bande</code>) et sa valeur — la source C++ (<code>SOURCE_BANDE</code>).</td></tr>
    <tr><th>ligne 2</th><td><code>if (siennes.has(nom) || !appelle(programme, nom)) continue</code> : <strong>si</strong> le programme a écrit sa propre fonction de ce nom, <strong>ou</strong> (<code>||</code>) s’il ne l’appelle <strong>pas</strong> (<code>!</code>), passer à la suivante (<code>continue</code>) sans rien ajouter.</td></tr>
    <tr><th>ligne 3</th><td><code>ajoutees.push(...analyser(source))</code> : sinon, lire la source C++ avec le même lecteur que ton programme (<code>analyser</code>), et ajouter ce qu’il en tire à la liste des fonctions ajoutées.</td></tr>
    <tr><th>ligne 4</th><td><code>}</code> : fin de la boucle.</td></tr>
  </tbody></table>
  ${p('Un peu plus bas, chaque fonction ajoutée reçoit une marque, `deLaConsole` : c’est elle qui lui évite d’avoir à écrire ses propres `#include` (`bande()` appelle `poser()` sans `#include <poser>`).')}
</section>`
}

function partieC(matieres) {
  const chapitre = LECONS.findIndex((l) => NIVEAUX[l.difficulte]?.startsWith('Tes propres #include'))
  const places = LECONS.map((l, i) => i).filter((i) => LECONS[i].difficulte === LECONS[chapitre].difficulte && LECONS[i].provenance !== 'parcours')
  const pages = places.map((i) => {
    const lecon = LECONS[i]
    const m = matieres.get(i)
    return `
<article class="lecon">
  <p class="reperes"><span class="niveau">leçon ${NUMEROS[i]} du parcours</span>${lecon.provenance === 'cours' ? '' : '<span class="outil">tuto de la fonction</span>'}</p>
  <h2 class="titre-lecon">${NUMEROS[i]}. ${echapper(lecon.titre)}</h2>
  <p class="idee">${echapper(lecon.idee ?? '')}</p>
  ${(lecon.texte ?? []).map((t) => `<p>${enrichir(t)}</p>`).join('\n  ')}
  ${Object.entries(lecon.fichiers ?? {}).map(([nom, contenu]) => pre(contenu, nom)).join('')}
  ${pre(lecon.code, lecon.fichiers ? 'principal.cpp' : 'le programme')}
  <div class="resultat">
    ${m.apercu ? `<figure><img src="${m.apercu}" alt="l’écran de la console"><figcaption>l’écran, dans l’émulateur — ${m.octets} octets</figcaption></figure>`
      : `<p class="detail">Ce programme n’a pas pu être compilé : ${echapper(m.erreur ?? '')}</p>`}
    <div><p class="fichier">Ce qu’on doit voir</p><p class="avoir">${echapper(lecon.aVoir ?? '')}</p></div>
  </div>
</article>`
  }).join('')
  return `
${entete('c')}
  ${p(
    `**Dans l’atelier, ce chapitre est le dernier du parcours** (bouton **📚 APPRENDRE**), sous le nom « ${echapper(NIVEAUX[LECONS[chapitre].difficulte])} ». Dans la page du tutoriel, il commence à la leçon ${NUMEROS[places[0]]} : \`tuto.html#lecon-${places[0] + 1}\`.`,
    '**Chaque étape reprend la précédente et ne change qu’une chose.** Les voici toutes, avec leur programme complet (et leurs fichiers voisins), et l’écran qu’elles donnent vraiment.',
  )}
  ${pages}
</section>`
}

/* --------------------------- la partie D : le JavaScript qu'il faut */

function partieJS() {
  return `${entete('js')}
  ${p(
    '**Pourquoi du JavaScript ?** Tes programmes Game Boy sont en C++. Mais l’**atelier** et son **compilateur**, eux, sont écrits en **JavaScript** : c’est le langage que les navigateurs savent faire tourner. Pour ajouter une fonction à la console (partie E), on modifie trois fichiers JavaScript.',
    '**Bonne nouvelle : il n’y a pas besoin d’apprendre le JavaScript.** On ne touche qu’à **trois endroits**, toujours de la même façon : on recopie une ligne qui existe déjà, et on change le nom. Cette partie explique juste assez pour lire ces lignes, et ne pas les casser.',
  )}

  <h2>D.1 — Les commentaires</h2>
  ${p('Comme en C++ : `//` commente jusqu’au bout de la ligne. En plus, `/* … */` commente tout ce qui est entre les deux, même sur plusieurs lignes. Les fichiers du compilateur en sont pleins : ils expliquent le code.')}
  ${pre(`// un commentaire d'une ligne
/*
 * un commentaire de plusieurs lignes :
 * les étoiles au début de chaque ligne sont juste décoratives
 */`)}

  <h2>D.2 — Donner un nom à une valeur : <code>const</code></h2>
  ${pre(`const SOURCE_BANDE = 'un texte'
│     │            │ └─ la valeur
│     │            └─── « reçoit »
│     └──────────────── le nom choisi
└────────────────────── « je crée un nom qui ne changera plus »`)}
  ${p('`const` veut dire « constante » : un nom donné une fois pour toutes à une valeur. Ensuite, écrire `SOURCE_BANDE` ailleurs dans le fichier, c’est comme écrire la valeur elle-même. En JavaScript, le point-virgule au bout de la ligne est facultatif : le projet ne le met pas.')}

  <h2>D.3 — Les textes : trois façons de les entourer</h2>
  <table class="comparer">
    <thead><tr><th>Écrit</th><th>Ce que c’est</th><th>À savoir</th></tr></thead>
    <tbody>
      <tr><td><code>'pose une tuile'</code></td><td>un texte entre <strong>apostrophes droites</strong></td><td>sur une seule ligne. Une apostrophe droite <code>'</code> à l’intérieur le fermerait trop tôt : utilise l’apostrophe typographique <code>’</code> (« l’écran »).</td></tr>
      <tr><td><code>"pose une tuile"</code></td><td>un texte entre <strong>guillemets droits</strong></td><td>la même chose, avec <code>"</code>.</td></tr>
      <tr><td><code>\`…\`</code></td><td>un texte entre <strong>accents graves</strong> (AltGr+7)</td><td>peut tenir sur <strong>plusieurs lignes</strong> : c’est ce qu’il faut pour y mettre toute une fonction C++.</td></tr>
    </tbody>
  </table>
  ${p('**C’est l’astuce de la partie E :** la source C++ d’une fonction de la console est simplement **un texte**, rangé entre deux accents graves, dans une constante. Le compilateur lira ce texte comme si tu l’avais écrit dans ton programme.')}
  ${pre(`const SOURCE_PILE = \`
void pile(uint8_t colonne, uint8_t ligne, uint8_t tuile, uint8_t hauteur) {
  …
}
\`
// ↑ tout ce qui est entre les deux accents graves est UN texte, sur 5 lignes`)}

  <h2>D.4 — Les objets : une liste de « nom : valeur »</h2>
  ${p('Un **objet** est une liste où chaque valeur a un nom. Il s’écrit entre accolades, chaque élément sous la forme `nom: valeur`, **suivi d’une virgule** :')}
  ${pre(`export const BIBLIOTHEQUES = {
  texte: 'écrit un texte à l’écran',
  poser: 'pose une tuile sur une case du fond',
  bande: 'pose la même tuile plusieurs fois, de gauche à droite',
}`)}
  <table class="comparer"><tbody>
    <tr><th><code>export</code></th><td>« les autres fichiers ont le droit de s’en servir ». À laisser tel quel.</td></tr>
    <tr><th><code>{ … }</code></th><td>le début et la fin de l’objet. Tout ce qu’on ajoute va <strong>entre</strong> les deux.</td></tr>
    <tr><th><code>bande:</code></th><td>le <strong>nom</strong> de l’élément, suivi de deux-points. Ici, c’est le nom de la fonction de la console.</td></tr>
    <tr><th><code>'pose la même…'</code></th><td>la <strong>valeur</strong> : ici, un texte (D.3).</td></tr>
    <tr><th><code>,</code></th><td>la <strong>virgule</strong> sépare un élément du suivant. Le projet en met une même après le dernier : ainsi, on peut toujours ajouter une ligne en dessous sans rien toucher d’autre.</td></tr>
  </tbody></table>
  ${p('**Ajouter un élément, c’est ajouter une ligne** `nom: valeur,` entre les accolades. L’ordre n’a pas d’importance pour le compilateur ; le projet range les noms par sujet.')}

  <h2>D.5 — Un objet dans un objet, et les tableaux</h2>
  ${p('Une valeur peut être elle-même un objet, ou un **tableau** — une liste sans noms, entre crochets `[ ]`, les éléments séparés par des virgules. C’est le cas de l’aide de l’éditeur :')}
  ${pre(`  bande: { args: ['colonne', 'ligne', 'tuile', 'longueur'], dit: 'pose la même tuile…' },
  │       │ │     └───────── un tableau de 4 textes ─────────┘  │    └─ un texte       │
  │       │ └─ nom : args                                        └─ nom : dit          │
  │       └─ début de l'objet « fiche de bande »                    fin de l'objet ────┘
  └─ nom de l'élément, dans le grand objet FONCTIONS`)}
  ${p('Ici : l’élément `bande` du grand objet `FONCTIONS` est un petit objet à deux éléments, `args` (la liste des noms d’arguments) et `dit` (la phrase d’aide). La virgule tout au bout sépare `bande` de l’élément suivant du grand objet.')}

  <h2>D.6 — Ce que tu n’as pas besoin de comprendre</h2>
  ${p(
    '**Tout le reste.** `compilateur/emetteur.js` fait plus de 6 000 lignes : la traduction en instructions du processeur, les optimisations, les registres… Pour ajouter une fonction écrite en C, **tu n’y touches pas**. Tu ajoutes une constante (D.2, D.3) et une ligne dans un objet (D.4). Rien d’autre.',
    '**Si tu vois des mots inconnus autour** (`function`, `return`, `=>`, `export`, `import`), laisse-les : ils font partie du compilateur, pas de ce que tu ajoutes.',
  )}

  <h2>D.7 — Exercice : trouve les trois erreurs</h2>
  ${pre(`export const BIBLIOTHEQUES = {
  bande: 'pose la même tuile plusieurs fois'
  pile: 'pose la même tuile vers le bas',
  cadre: 'dessine un cadre autour de l'écran',
}
const SOURCE_PILE = \`
void pile(uint8_t colonne, uint8_t ligne, uint8_t tuile, uint8_t hauteur) { … }`)}
  ${cadre('**Les réponses**',
    '**1.** Ligne 2 : il manque la **virgule** après `\'pose la même tuile plusieurs fois\'`. Le compilateur ne sait plus où finit l’élément `bande`.',
    '**2.** Ligne 4 : `l\'écran` contient une **apostrophe droite**, qui ferme le texte trop tôt. Écrire `l’écran`, avec l’apostrophe typographique.',
    '**3.** La source de `pile` n’a **pas d’accent grave de fermeture** à la fin : tout le reste du fichier serait pris pour du texte.',
    'Dans les trois cas, l’atelier ne compile plus rien, et **F12 → Console** affiche une erreur JavaScript qui donne le fichier et la ligne (section 0.10).')}
</section>`
}

function partieD() {
  const pile = `void pile(uint8_t colonne, uint8_t ligne, uint8_t tuile, uint8_t hauteur) {
  for (uint8_t i = 0; i < hauteur; i++) {   // hauteur fois :
    poser(colonne, ligne + i, tuile);       //   une case de plus vers le bas
  }
}`
  return `
${entete('d')}
  ${p(
    '**On va faire entrer `pile()` dans la console**, exactement comme `bande()` y est entrée. La même recette marche pour **n’importe quelle fonction** écrite avec les fonctions qui existent déjà.',
    '**Ce qu’il te faut :** un éditeur de texte (le Bloc-notes suffit ; Visual Studio Code est plus confortable) et le dossier du projet. On ne modifie **pas** le programme dans l’atelier, mais **trois fichiers du compilateur**, qui sont à côté d’`index.html`.',
  )}

  <h2>Étape 1 — L’écrire et l’essayer dans ton programme</h2>
  ${p(
    'Toujours commencer là : dans `principal.cpp`, ou dans un onglet voisin (`outils.cpp`). Tant qu’elle n’est pas parfaite, une fonction se corrige bien plus facilement dans l’atelier que dans le compilateur : l’écran se met à jour à chaque frappe.',
    'Voici `pile()`, telle qu’elle est dans `outils.cpp` au chapitre du parcours :',
  )}
  ${pre(pile, 'outils.cpp')}

  <h2>Étape 2 — Choisir son nom</h2>
  ${p(
    '**Le nom du `#include` sera exactement celui de la fonction** : `pile` → `#include <pile>`. Il doit être **libre** : aucune fonction de la console ne doit déjà le porter (la liste complète est en partie J).',
    'Des lettres, des chiffres, le tiret bas `_` ; pas d’espace, pas d’accent, pas de chiffre au début. Les majuscules comptent : `Pile` et `pile` sont deux noms différents. L’habitude du projet : `motsCollesAvecMajuscules` (`cacherPanneau`) ou `mots_avec_tiret` (`deplace_x`).',
  )}

  <h2>Étape 3 — Le code : <code>compilateur/emetteur.js</code></h2>
  ${p(
    `**Ouvre \`compilateur/emetteur.js\`** et cherche (Ctrl+F) \`const SOURCE_BANDE\` : c’est vers la ligne ${VRAI.lignes.sourceBande}. Voici, lue dans le fichier, la source de \`bande()\` :`,
  )}
  ${pre(VRAI.sourceBande, 'compilateur/emetteur.js, ligne ' + VRAI.lignes.sourceBande)}
  ${p(
    '**Lis-la morceau par morceau :**',
  )}
  ${liste(
    '`const SOURCE_BANDE =` : une **constante JavaScript** (le compilateur est écrit en JavaScript). Son nom est libre, mais l’habitude est `SOURCE_` + le nom en majuscules.',
    'L’**accent grave** (la touche AltGr + 7) ouvre un texte qui peut tenir sur plusieurs lignes. Un second accent grave le ferme, tout à la fin.',
    'Entre les deux : **ta fonction, en C, mot pour mot** comme dans `outils.cpp`.',
    '**Différence avec `outils.cpp` : pas de `#include <poser>`.** Ce que la console ajoute elle-même n’a rien à inclure.',
  )}
  ${p('**Ajoute la tienne juste en dessous**, avant le commentaire « Les fonctions de la console écrites en C » :')}
  ${pre(`const SOURCE_PILE = \`
${pile}
\``, 'à ajouter dans compilateur/emetteur.js')}
  ${p(`**Puis inscris-la dans le tableau \`FONCTIONS_EN_C\`**, juste en dessous (vers la ligne ${VRAI.lignes.tableau}). Voici son début, lu dans le fichier :`)}
  ${pre(VRAI.tableauDebut, 'compilateur/emetteur.js, ligne ' + VRAI.lignes.tableau)}
  ${p('Ajoute une ligne, à côté de celle de `bande` :')}
  ${pre(`  bande: SOURCE_BANDE,
  pile: SOURCE_PILE,          ← NOUVEAU : le nom de la fonction, deux-points, la constante, virgule`)}
  ${attention('**Les petites erreurs qui cassent tout**',
    'Oublier la **virgule** au bout de la ligne du tableau. Oublier l’**accent grave** qui ferme la source. Écrire le nom du tableau (`pile`) autrement que le nom de la fonction dans la source (`void pile(`).',
    'Dans ces cas, l’atelier ne peut plus rien compiler du tout : la page affiche une erreur JavaScript. Ouvre la console du navigateur (**F12**, onglet Console) : elle dit le fichier et la ligne.')}

  <h2>Étape 4 — Le nom : <code>compilateur/inclusion.js</code></h2>
  ${p(`**Ouvre \`compilateur/inclusion.js\`** et cherche \`export const BIBLIOTHEQUES\` (ligne ${VRAI.lignes.biblioDebut}). C’est la liste de tous les noms qu’on peut écrire entre chevrons, chacun avec une phrase qui dit ce qu’il fait. Voici la ligne de \`bande\`, lue dans le fichier (ligne ${VRAI.lignes.biblio}) :`)}
  ${pre(VRAI.ligneBiblio, 'compilateur/inclusion.js, ligne ' + VRAI.lignes.biblio)}
  ${p('**Ajoute la tienne juste en dessous :**')}
  ${pre(`  pile: 'pose la même tuile plusieurs fois, vers le bas',`, 'à ajouter dans compilateur/inclusion.js')}
  ${p(
    '**Cette ligne fait trois choses :** elle rend `#include <pile>` valable ; elle oblige tout programme qui appelle `pile()` à écrire la ligne (sinon : refus) ; et sa phrase est recopiée en commentaire quand l’atelier écrit les `#include` à ta place (`#include <pile>   // pose la même tuile…`).',
    '**La phrase est entre apostrophes droites** `\'…\'`. Si ta phrase contient une apostrophe, prends l’apostrophe typographique `’` (comme dans « l’écran ») : une apostrophe droite fermerait le texte trop tôt.',
  )}

  <h2>Étape 5 — L’aide de l’éditeur : <code>aide-fonctions.js</code></h2>
  ${p(`**Ouvre \`aide-fonctions.js\`** (à la racine du projet) et cherche \`bande: {\` (ligne ${VRAI.lignes.aide}) :`)}
  ${pre(VRAI.ligneAide, 'aide-fonctions.js, ligne ' + VRAI.lignes.aide)}
  ${pre(`  pile: { args: ['colonne', 'ligne', 'tuile', 'hauteur'], dit: 'pose la même tuile « hauteur » fois, vers le bas.' },`, 'à ajouter dans aide-fonctions.js')}
  ${p(
    '`args` : le nom de chaque argument, dans l’ordre. Pendant que tu tapes `pile(3, `, l’éditeur montre `pile(colonne, ligne, tuile, hauteur)` avec l’argument en cours en gras.',
    '`dit` : la phrase affichée sous la proposition, quand tu tapes « pil… ».',
    '**Cette étape est facultative** : sans elle, `pile()` marche, mais l’éditeur ne t’aide pas à l’écrire.',
  )}

  <h2>Étape 6 — Essayer</h2>
  ${liste(
    '**Recharge l’atelier avec Ctrl+F5** (pas F5 seul : Ctrl+F5 oblige le navigateur à relire les fichiers du compilateur au lieu de garder l’ancienne version en mémoire).',
    'Dans `outils.cpp`, **supprime** ta `pile()` (sinon, c’est la tienne qui compte, et tu n’essaies pas celle de la console).',
    'Dans `principal.cpp`, ajoute `#include <pile>` en haut, et lance.',
    'Pour vérifier le message d’oubli : enlève la ligne `#include <pile>` → le compilateur doit répondre « il faut #include <pile> ».',
    '**En ligne de commande** (une fenêtre ouverte dans le dossier du projet) : `node outils/gb3.mjs mon-essai.cpp` compile un fichier `.cpp` et dit s’il est accepté.',
    '**Puis `npm run verifier`** : les centaines de contrôles du projet. S’ils sont tous verts, tu n’as rien cassé.',
  )}

  <h2>Étape 7 — Sa leçon</h2>
  ${p(
    '**Dans ce projet, chaque `#include` a son tuto** : une leçon qui présente la fonction seule. Elle se met dans `tuto/lecons.js`. Le plus simple : cherche `La fonction bande()`, copie toute la leçon (de `{` à `},`), colle-la juste en dessous et adapte-la.',
    '**Le point important : la première ligne de son programme.** C’est elle qui fait reconnaître la leçon comme le tuto de la fonction :',
  )}
  ${pre(`// ---- #include <pile> : la même tuile, vers le bas ----`)}
  ${p(
    'Le parcours (`tuto/parcours.js`) place alors ce tuto **tout seul**, juste avant la première étape qui écrit `#include <pile>`. Le contrôle `npm run verifier` vérifie qu’aucune étape n’apporte deux `#include` nouveaux d’un coup.',
    '**Le `controle`** de la leçon dit ce qu’on doit voir à l’écran, et le vérifie dans l’émulateur. Par exemple, pour six D en colonne 15, lignes 4 à 9 : `c.mot(15, 4, 1) === \'D\'`.',
  )}

  <h2>Et pour aller plus loin : les fonctions en assembleur</h2>
  ${p(
    `Certaines fonctions de la console ne sont **pas** écrites en C, mais directement en instructions du processeur : celles qui parlent au matériel (l’écran, le son, la manette). Par exemple \`cacherPanneau()\`, vers la ligne ${VRAI.lignes.cacherPanneau} de \`compilateur/emetteur.js\` : trois instructions qui éteignent un bit du registre de l’écran.`,
    'Les ajouter demande de connaître le processeur de la Game Boy (un cousin du Z80) et ses registres. **Pour tout ce qu’on peut écrire avec les fonctions qui existent déjà, la façon en C de cette recette suffit**, et elle est bien plus sûre.',
  )}
</section>`
}

function partieE(fautes) {
  return `
${entete('e')}
  ${p('**Chaque programme ci-dessous a été compilé pour écrire ce document**, et le message est celui que l’atelier affiche, mot pour mot. Les reconnaître fait gagner beaucoup de temps.')}
  ${fautes.map((f, k) => `
  <div class="erreur">
    <h3>${k + 1}. ${enrichir(f.titre)}</h3>
    ${pre(f.code)}
    <p class="fichier">Le compilateur répond</p>
    <p class="message">${echapper(f.resultat.erreur ?? `(aucune erreur — ${f.resultat.octets} octets)`)}</p>
    ${p('**Pourquoi :** ' + f.pourquoi, '**Ce qu’il faut faire :** ' + f.remede)}
  </div>`).join('')}
</section>`
}

function partieF(couts) {
  const vide = couts[0].resultat.octets
  return `
${entete('f')}
  ${p('**Chaque programme a été compilé, et sa cartouche mesurée.** Le nombre est la taille du programme compilé, en octets (une cartouche en tient 32 768).')}
  <table class="comparer">
    <thead><tr><th>Le programme</th><th>Octets</th><th>Par rapport au vide</th></tr></thead>
    <tbody>
      ${couts.map((c) => `<tr><td>${enrichir(c.dit)}</td><td><b>${c.resultat.octets ?? '—'}</b></td><td>${c.resultat.octets != null ? (c.resultat.octets === vide ? '—' : '+ ' + (c.resultat.octets - vide)) : echapper(c.resultat.erreur ?? '')}</td></tr>`).join('\n      ')}
    </tbody>
  </table>
  ${p('**Ce que montre le tableau :**')}
  ${liste(
    `**Une ligne \`#include\` seule ne coûte rien** : ${couts[1].resultat.octets} octets, comme le programme vide. Le compilateur ne grave une fonction que si elle est **appelée**.`,
    `**Les appels suivants ne coûtent que quelques octets** (${couts[4].resultat.octets - couts[3].resultat.octets} octets pour deux appels de plus) : la fonction est gravée **une fois**, et chaque appel ne fait que lui donner ses quatre nombres.`,
    `**Mais un seul appel à \`bande()\` coûte bien plus que dix \`poser()\`** (${couts[3].resultat.octets} octets contre ${couts[2].resultat.octets}). Ce n’est pas la faute de \`bande()\` : le détail ci-dessous l’explique.`,
  )}
  <h2>Le détail : où partent les octets</h2>
  ${p('**Le compilateur sait dire ce qu’il a gravé, morceau par morceau.** Voici, pour les deux programmes qui posent dix A, la liste qu’il donne :')}
  <div class="deux">
    ${[couts[2], couts[3]].map((c) => `<div>
      <p class="fichier">${enrichir(c.dit)} — ${c.resultat.octets} octets</p>
      <table class="includes"><tbody>
        ${(c.resultat.elements ?? []).map((e) => `<tr><td><b>${e.taille}</b></td><td><code>${echapper(e.nom)}</code></td><td>${echapper(e.role ?? '')}</td></tr>`).join('')}
      </tbody></table></div>`).join('')}
  </div>
  ${p('**Comment lire ces deux listes.** Chaque ligne est un morceau gravé dans la cartouche : sa taille en octets, son nom, et son rôle. Les morceaux qu’on retrouve dans **tous** les programmes :')}
  ${liste(
    '`démarrage` : ce que la console fait à l’allumage, avant d’appeler `main()` (préparer l’écran, la mémoire).',
    '`main()` : **ta** fonction, traduite. Elle est plus courte avec `bande()` : un seul appel au lieu de dix.',
    '`VBlank`, `AttendreImage`, `AttendreVBlank` : la mesure du temps. La console dessine l’écran 60 fois par seconde ; `image()` attend le dessin suivant.',
    '`CopierTuiles`, `EffacerCarte` : copier les dessins des tuiles dans la mémoire de l’écran, et vider l’écran au départ.',
    '`AdresseCase` : la petite routine qui calcule où, dans la mémoire de l’écran, se trouve la case (colonne, ligne). `poser()` s’en sert.',
    '`Tuiles` : les **dessins** gravés, 16 octets par tuile (section 0.5).',
  )}
  ${p(
    `**\`bande()\` elle-même ne pèse que ${tailleDe(couts[3], 'bande()')} octets.** La différence est dans la ligne \`Tuiles\` : ${tailleDe(couts[2], 'Tuiles')} octets d’un côté, ${tailleDe(couts[3], 'Tuiles')} de l’autre.`,
    '**Pourquoi.** Avec `poser(2, 5, ALPHABET[0])`, la lettre est **écrite en clair** : le compilateur voit qu’on ne pose que des A, et ne grave **que le dessin du A** (16 octets : une tuile de 8 × 8 pixels). Avec `bande(2, 5, ALPHABET[0], 10)`, la lettre entre dans `bande()` par un **paramètre**, `tuile`, qui est une **variable** : à l’intérieur de la fonction, le compilateur ne peut plus savoir quelle lettre sera posée. Par prudence, il grave **toute la police**.',
    '**Ce qu’il faut en retenir.** Ce coût est celui de la **police**, pas de la fonction : il est payé **une seule fois**, dès qu’une tuile passe par une variable quelque part dans le programme — les appels suivants ne le repaient pas. C’est vrai aussi quand la tuile est un dessin à toi (une `Tuile`) : la police est gravée quand même, car le compilateur ne peut pas savoir ce que contiendra la variable.',
    '**Le bon réflexe :** une fonction de la console qui reçoit une tuile en paramètre est pratique, mais pas gratuite. Si un programme doit tenir dans très peu de place, écrire les `poser()` en clair reste le plus économe.',
  )}
</section>`
}

/** La taille d'un morceau gravé, par son nom (« bande() », « Tuiles »). */
const tailleDe = (c, nom) => (c.resultat.elements ?? []).find((e) => e.nom === nom)?.taille ?? '?'

function partieG() {
  const qr = [
    ['Faut-il mettre `.cpp` ou `.h` à mon fichier voisin ?', 'Les deux marchent dans l’atelier : le nom n’est qu’un nom. L’habitude du C : un `.h` (« header ») pour des déclarations — des variables, des constantes, des dessins ; un `.cpp` pour des fonctions.'],
    ['Où dois-je écrire la ligne `#include "outils.cpp"` ?', 'L’habitude : en haut, avec les autres `#include`. Pour des **fonctions**, l’ordre ne compte pas : le compilateur relève toutes les fonctions du programme avant de les traduire, donc `main()` peut appeler une fonction collée plus bas. Pour des **variables globales** et des **dessins**, l’ordre compte : ils doivent être versés **avant** la fonction qui s’en sert.'],
    ['Un fichier voisin peut-il en inclure un autre ?', 'Oui : `outils.cpp` peut écrire `#include "dessins.h"`. Le collage se fait de proche en proche. Un fichier inclus deux fois n’est collé qu’une fois, et deux fichiers qui s’incluent l’un l’autre ne font pas tourner la console en rond.'],
    ['Si j’écris `#include <bande>` deux fois, ou dans deux fichiers ?', 'Aucun problème : la fonction n’est gravée qu’une fois. Une ligne en double ne coûte rien.'],
    ['J’ai écrit une fonction qui porte le nom d’une fonction de la console. Laquelle sert ?', 'La tienne. Le compilateur n’ajoute une fonction de la console que si le programme n’en a pas écrit une du même nom (leçon « Ta fonction passe avant celle de la console »). C’est pratique pour essayer une variante.'],
    ['Ma fonction de console peut-elle se servir d’autres fonctions de la console ?', 'Oui, comme `bande()` se sert de `poser()`, et sans écrire leurs `#include` dans sa source. Le programme, lui, n’a à écrire que `#include <bande>`.'],
    ['Ma fonction de console peut-elle rendre une valeur ?', 'Oui : au lieu de `void`, écris `uint8_t`, et termine par `return …;`. `deplace_x()` en est un exemple : elle rend la colonne où la tuile s’est arrêtée.'],
    ['Peut-elle avoir ses propres variables globales ?', 'Oui : la source peut déclarer des variables au-dessus de la fonction, dans le même texte. Choisis-leur un nom qui commence par celui de la fonction (`pile_compte`) pour ne pas gêner celles du programme.'],
    ['J’ai modifié le compilateur et rien ne change dans l’atelier.', 'Le navigateur garde l’ancienne version en mémoire. **Ctrl+F5** l’oblige à tout relire. Si cela ne suffit pas, ferme l’onglet et rouvre l’atelier.'],
    ['L’atelier ne compile plus rien du tout depuis ma modification.', 'Une faute de JavaScript dans un des trois fichiers (souvent une virgule ou un accent grave oublié). **F12**, onglet **Console** : le message donne le fichier et la ligne. Au pire, `git diff` montre ce que tu as changé, et `git checkout -- compilateur/emetteur.js` revient en arrière.'],
    ['Mes changements seront-ils perdus si je mets le projet à jour ?', 'Ils sont dans les fichiers du projet, comme le reste. Fais un `git commit` après chaque fonction ajoutée : tu gardes une trace, et tu peux revenir en arrière.'],
  ]
  return `
${entete('g')}
  <dl class="faq">
    ${qr.map(([q, r]) => `<dt>${enrichir(q)}</dt><dd>${enrichir(r)}</dd>`).join('\n    ')}
  </dl>
</section>`
}

function partieH() {
  const cases = [
    'La fonction marche dans mon programme (ou dans `outils.cpp`).',
    'Son nom est libre (absent de la partie J) et écrit pareil partout.',
    '`compilateur/emetteur.js` : `const SOURCE_…` ajoutée, sans `#include` dedans, l’accent grave fermé.',
    '`compilateur/emetteur.js` : une ligne `nom: SOURCE_…,` dans `FONCTIONS_EN_C`, avec sa virgule.',
    '`compilateur/inclusion.js` : une ligne `nom: \'ce qu’elle fait\',` dans `BIBLIOTHEQUES`.',
    '`aide-fonctions.js` : une ligne `nom: { args: […], dit: \'…\' },` dans `FONCTIONS` (facultatif).',
    'Ctrl+F5 dans l’atelier ; ma version retirée d’`outils.cpp` ; `#include <nom>` écrit ; ça marche.',
    'Sans la ligne `#include <nom>`, le compilateur refuse : la règle est en place.',
    '`npm run verifier` : tout est vert.',
    'Sa leçon dans `tuto/lecons.js`, programme commençant par `// ---- #include <nom> : … ----`.',
    '`git commit`.',
  ]
  return `
${entete('h')}
  <table class="comparer">
    <thead><tr><th>Je veux…</th><th>J’écris…</th><th>Où</th></tr></thead>
    <tbody>
      <tr><td>me servir d’une fonction de la console</td><td><code>#include &lt;nom&gt;</code></td><td>en haut du programme</td></tr>
      <tr><td>ranger mes fonctions à part</td><td><code>#include "outils.cpp"</code></td><td>en haut de <code>principal.cpp</code> ; l’onglet par « + fichier »</td></tr>
      <tr><td>ajouter le code d’une fonction à la console</td><td><code>const SOURCE_NOM = \`…\`</code> + <code>nom: SOURCE_NOM,</code></td><td><code>compilateur/emetteur.js</code></td></tr>
      <tr><td>rendre <code>#include &lt;nom&gt;</code> valable</td><td><code>nom: 'ce qu’elle fait',</code></td><td><code>compilateur/inclusion.js</code></td></tr>
      <tr><td>que l’éditeur la propose</td><td><code>nom: { args: […], dit: '…' },</code></td><td><code>aide-fonctions.js</code></td></tr>
      <tr><td>lui donner sa leçon</td><td><code>// ---- #include &lt;nom&gt; : … ----</code></td><td><code>tuto/lecons.js</code></td></tr>
      <tr><td>tout vérifier</td><td><code>npm run verifier</code></td><td>une fenêtre dans le dossier du projet</td></tr>
    </tbody>
  </table>
  <h2>À cocher, pour chaque fonction ajoutée</h2>
  <ul class="cocher">${cases.map((c) => `<li>${enrichir(c)}</li>`).join('')}</ul>
</section>`
}

function partieI() {
  return `
${entete('i')}
  ${p(`**Les ${Object.keys(BIBLIOTHEQUES).length} noms qu’on peut écrire entre chevrons aujourd’hui**, lus dans \`compilateur/inclusion.js\`. Un nouveau nom doit être **absent** de cette liste.`)}
  <table class="includes">
    <thead><tr><th>#include</th><th>Ce qu’il apporte</th></tr></thead>
    <tbody>
      ${Object.entries(BIBLIOTHEQUES).map(([nom, dit]) => `<tr><td><code>#include &lt;${echapper(nom)}&gt;</code></td><td>${echapper(dit)}</td></tr>`).join('\n      ')}
    </tbody>
  </table>
</section>`
}

/* ------------------------------------------- la partie K : le lexique */

/* [le mot, sa définition, où il est expliqué (une section 0.x ou une lettre de partie)] */
const LEXIQUE = [
  ['accent grave', 'Le signe ` (AltGr+7). En JavaScript, il entoure un texte qui peut tenir sur plusieurs lignes.', 'D'],
  ['accolades', 'Les signes { et }. Elles regroupent des ordres (C++) ou les éléments d’un objet (JavaScript).', '0.8'],
  ['ALPHABET', 'Le tableau des tuiles de la police : ALPHABET[0] est le A, ALPHABET[1] le B…', '0.5'],
  ['appel', 'Le moment où l’on fait le geste d’une fonction : bande(2, 5, ALPHABET[0], 10);', '0.6'],
  ['argument', 'La valeur donnée à un paramètre au moment de l’appel : dans bande(2, …), 2 est un argument.', '0.6'],
  ['BIBLIOTHEQUES', 'La liste, dans compilateur/inclusion.js, de tous les noms qu’on peut écrire entre chevrons.', 'E'],
  ['bit', 'Un interrupteur qui vaut 0 ou 1. Huit bits font un octet.', '0.4'],
  ['boucle', 'Des ordres répétés. La boucle for les répète en comptant.', '0.7'],
  ['cartouche', 'Le fichier .gb fabriqué par le compilateur : tout le jeu, en nombres. 32 768 octets au plus.', '0.3'],
  ['case', 'Un carré de 8 × 8 pixels de l’écran, désigné par sa colonne (0 à 19) et sa ligne (0 à 17).', '0.5'],
  ['chemin', 'Où trouver un fichier, dossier par dossier : compilateur/inclusion.js.', '0.2'],
  ['chevrons', 'Les signes < et >. Autour d’un nom dans #include, ils désignent une fonction de la console.', 'A'],
  ['commentaire', 'Une explication pour l’humain, ignorée par la machine : après // ou entre /* et */.', '0.8'],
  ['compilateur', 'Le traducteur qui transforme ton C++ en nombres pour le processeur.', '0.3'],
  ['console (fonction de la)', 'Une fonction écrite par le projet (poser, texte, bande…), qu’on demande par #include <nom>.', 'A'],
  ['const', 'En JavaScript : donner un nom fixe à une valeur.', 'D'],
  ['corps', 'Les ordres d’une fonction ou d’une boucle, entre accolades.', '0.6'],
  ['deLaConsole', 'La marque que le compilateur pose sur les fonctions qu’il ajoute lui-même : elles n’ont rien à inclure.', 'B'],
  ['dossier', 'Une boîte qui contient des fichiers et d’autres dossiers.', '0.2'],
  ['éditeur de texte', 'Un programme qui ouvre et enregistre un fichier tel quel (Bloc-notes, Visual Studio Code). Pas Word.', '0.10'],
  ['émulateur', 'Une Game Boy imitée par l’ordinateur : il lance la cartouche.', '0.3'],
  ['expression régulière', 'Un motif qui reconnaît la forme d’un texte, comme un pochoir.', 'B'],
  ['extension', 'La fin du nom d’un fichier, après le point : .cpp, .js, .pdf.', '0.2'],
  ['fichier', 'Un document rangé sur l’ordinateur. Dans l’atelier, un onglet de l’éditeur.', '0.2'],
  ['fichier voisin', 'Un fichier à toi, à côté de principal.cpp, qu’on colle par #include "nom".', 'A'],
  ['fonction', 'Un geste auquel on a donné un nom, pour le refaire sans le réécrire.', '0.6'],
  ['FONCTIONS_EN_C', 'L’objet, dans compilateur/emetteur.js, qui relie le nom de chaque fonction de la console écrite en C++ à sa source.', 'E'],
  ['for', 'La boucle qui compte : for (départ ; tant que ; après chaque tour).', '0.7'],
  ['git', 'Le programme qui photographie le projet, pour pouvoir revenir en arrière.', '0.12'],
  ['guillemets', 'Le signe ". Autour d’un nom dans #include, ils désignent un fichier à toi.', 'A'],
  ['#include', 'La ligne qui dit « ce programme a besoin de quelque chose qui n’est pas écrit ici ».', 'A'],
  ['JavaScript', 'Le langage de l’atelier et du compilateur, que les navigateurs savent faire tourner.', 'D'],
  ['main()', 'La fonction par laquelle tout programme commence.', '0.6'],
  ['node', 'Le programme qui fait tourner du JavaScript dans une fenêtre de commande.', '0.11'],
  ['objet', 'En JavaScript : une liste de « nom: valeur, » entre accolades.', 'D'],
  ['octet', 'Une case de mémoire qui retient un nombre de 0 à 255.', '0.4'],
  ['paramètre', 'La case nommée, dans la définition d’une fonction, que l’appel remplit.', '0.6'],
  ['pixel', 'Un point de l’écran. L’écran en a 160 × 144.', '0.5'],
  ['point-virgule', 'Le signe ; qui termine un ordre en C++.', '0.8'],
  ['police', 'L’ensemble des tuiles des lettres et des chiffres.', '0.5'],
  ['principal.cpp', 'Le fichier principal du programme, celui par lequel la compilation commence.', '0.9'],
  ['processeur', 'La puce de la Game Boy qui exécute les ordres, un par un.', '0.3'],
  ['return', 'L’ordre qui rend une valeur et termine la fonction.', '0.6'],
  ['source', 'Le texte d’un programme, tel qu’on l’écrit. SOURCE_BANDE est la source de bande().', 'E'],
  ['tableau', 'Une liste de valeurs rangées à la suite ; on désigne chacune par sa place entre crochets.', '0.5'],
  ['terminal', 'La fenêtre de commande, où l’on tape des ordres au clavier.', '0.11'],
  ['tuile', 'Le dessin d’une case : 8 × 8 pixels, 16 octets.', '0.5'],
  ['type', 'Le genre de valeur qu’une case retient. Ici presque toujours uint8_t.', '0.6'],
  ['uint8_t', 'Le type « octet » : un nombre entier de 0 à 255.', '0.4'],
  ['void', '« Vide » : la fonction ne rend rien.', '0.6'],
]

function partieLexique() {
  const tries = [...LEXIQUE].sort((a, b) => a[0].replace(/^#/, '').localeCompare(b[0].replace(/^#/, ''), 'fr'))
  return `${entete('lexique')}
  ${p(`**Les ${LEXIQUE.length} mots techniques du document**, par ordre alphabétique. La dernière colonne renvoie là où le mot est expliqué en détail (cliquable).`)}
  <table class="lexique"><tbody>
    ${tries.map(([mot, dit, ou]) => `<tr><td>${echapper(mot)}</td><td>${echapper(dit)}</td><td>${renvoi(ou, true)}</td></tr>`).join('\n    ')}
  </tbody></table>
</section>`
}

const APPARENCE = `${STYLE}
  .couverture { padding-top: 40mm; break-after: page; }
  .couverture h1 { font-size: 30pt; }
  .couverture .sous { font-size: 14pt; color: var(--gris); margin: 0 0 18pt; }
  .couverture p { font-size: 11pt; max-width: 150mm; }
  .marque {
    display: inline-grid; place-items: center; width: 54pt; height: 54pt; border-radius: 10pt;
    background: linear-gradient(140deg, #9bbc5a, var(--vert)); color: #12251c;
    font-weight: 800; font-size: 13pt; margin-bottom: 14pt;
  }
  .page { break-before: page; }
  .sur { color: var(--vert); font-weight: 700; text-transform: uppercase; letter-spacing: .08em; margin: 0; }
  .detail { color: var(--gris); font-size: 8.5pt; }
  a { color: var(--vert); text-decoration: none; }
  .sommaire { list-style: none; padding: 0; margin: 10pt 0 18pt; font-size: 12pt; }
  .sommaire li { padding: 5pt 0; border-bottom: 1px dotted var(--bord); }
  .num {
    display: inline-block; min-width: 20pt; text-align: center; border-radius: 10pt;
    background: var(--vert-clair); color: var(--vert); font-weight: 700; font-size: 9pt; margin-right: 6pt;
  }
  .cadre {
    border: 1px solid #c8d4b4; border-left: 4pt solid var(--vert); border-radius: 4pt;
    background: #f6faf1; padding: 6pt 10pt; margin: 9pt 0; break-inside: avoid;
  }
  .cadre.alerte { border-color: #e0c48a; border-left-color: #c98a00; background: #fdf8ec; }
  .cadre.alerte .cadre-titre { color: #8a5a00; }
  .cadre-titre { margin: 0 0 4pt; font-weight: 700; color: var(--vert); }
  .cadre p { margin: 0 0 4pt; }
  table.comparer, table.includes { width: 100%; border-collapse: collapse; font-size: 9pt; margin: 8pt 0 12pt; }
  .comparer th, .includes th { text-align: left; color: var(--gris); font-weight: 600; border-bottom: 1pt solid var(--bord); padding: 4pt; vertical-align: top; }
  .comparer td, .includes td { vertical-align: top; padding: 4pt; border-bottom: 1px dotted var(--bord); }
  .comparer tbody th { color: var(--encre); width: 28mm; }
  .comparer tr, .includes tr { break-inside: avoid; }
  thead { display: table-header-group; }
  .includes { font-size: 8.5pt; }
  ol.etapes > li { margin-bottom: 10pt; }
  .lecon { margin-top: 18pt; padding-top: 10pt; border-top: 2pt solid var(--vert-clair); }
  .titre-lecon { font-size: 16pt; margin: 2pt 0 3pt; border: 0; padding: 0; break-after: avoid; }
  .reperes { break-after: avoid; }
  .fichier { font-size: 8.5pt; text-transform: uppercase; letter-spacing: .06em; color: var(--gris); margin: 9pt 0 3pt; break-after: avoid; }
  .fichier code { text-transform: none; }
  .resultat { display: grid; grid-template-columns: 50mm 1fr; gap: 7mm; align-items: start; margin-top: 8pt; break-inside: avoid; }
  .resultat img { width: 100%; image-rendering: pixelated; }
  .resultat .fichier { margin-top: 0; }
  .erreur { margin: 12pt 0 16pt; padding-top: 8pt; border-top: 1px solid var(--bord); }
  .erreur h3 { margin: 0 0 4pt; break-after: avoid; }
  .message {
    font-family: Consolas, monospace; font-size: 8.5pt; background: #fdeeee; color: #8a1f1f;
    border-left: 3pt solid #c0392b; padding: 6pt 8pt; border-radius: 3pt; break-inside: avoid;
  }
  .deux { display: grid; grid-template-columns: 1fr 1fr; gap: 6mm; break-inside: avoid; }
  .deux table.includes { font-size: 7.5pt; margin-top: 2pt; }
  .faq dt { font-weight: 700; margin-top: 10pt; break-after: avoid; }
  .faq dd { margin: 3pt 0 0 12pt; }
  .cocher { list-style: none; padding-left: 0; }
  .cocher li { padding: 4pt 0 4pt 22pt; position: relative; border-bottom: 1px dotted var(--bord); }
  .cocher li::before { content: ''; position: absolute; left: 2pt; top: 5pt; width: 10pt; height: 10pt; border: 1.2pt solid var(--vert); border-radius: 2pt; }
  .niveau-partie { font-size: 9pt; border-radius: 4pt; padding: 5pt 9pt; margin: 2pt 0 12pt; border: 1px solid var(--bord); background: #fafbf8; }
  .pastille { display: inline-block; font-weight: 700; border-radius: 8pt; padding: 0 7pt; color: #fff; }
  .debutant .pastille, .pastille.debutant { background: #3f8f4f; }
  .moyen .pastille, .pastille.moyen { background: #c98a00; }
  .avance .pastille, .pastille.avance { background: #b03a2e; }
  .pastille.petite { font-size: 7.5pt; margin-left: 6pt; vertical-align: 1pt; }
  .sous-sommaire { list-style: none; columns: 2; column-gap: 8mm; font-size: 9.5pt; padding: 4pt 0 0 28pt; margin: 0; }
  .sous-sommaire li { border: 0; padding: 1pt 0; }
  .base { margin-top: 16pt; }
  .base h2 .num { margin-right: 4pt; }
  .lexique { width: 100%; border-collapse: collapse; font-size: 9pt; }
  .lexique td { vertical-align: top; padding: 4pt; border-bottom: 1px dotted var(--bord); }
  .lexique tr { break-inside: avoid; }
  .lexique td:first-child { font-weight: 700; width: 32mm; }
  .lexique td:last-child { width: 30mm; font-size: 8pt; }
`

/* ------------------------------------------------------- en route */

progression(0, 'lecture du compilateur…')
const placesDuChapitre = LECONS.map((l, i) => i).filter((i) => NIVEAUX[LECONS[i].difficulte]?.startsWith('Tes propres #include') && LECONS[i].provenance !== 'parcours')
if (!placesDuChapitre.length) throw new Error('le chapitre « Tes propres #include » est introuvable dans le parcours')

progression(0.1, `${placesDuChapitre.length} leçons du chapitre : compilation et écran…`)
const matieres = new Map(placesDuChapitre.map((i) => [i, compiler(LECONS[i].code, LECONS[i].fichiers ?? {}, LECONS[i].titre)]))
const ratees = [...matieres.values()].filter((m) => m.erreur)
if (ratees.length) console.log(`  attention : ${ratees.length} leçon(s) ne compilent pas — signalé dans le PDF`)

progression(0.35, 'les programmes fautifs : ce que répond le compilateur…')
const fautes = PROGRAMMES_FAUTIFS.map((f) => ({ ...f, resultat: compiler(f.code) }))
const pasDErreur = fautes.filter((f) => !f.resultat.erreur)
if (pasDErreur.length) console.log(`  attention : ${pasDErreur.length} programme(s) « fautif(s) » acceptés : ${pasDErreur.map((f) => f.titre).join(' ; ')}`)

progression(0.5, 'les coûts : compilation et mesure…')
const couts = COUTS.map((c) => ({ ...c, resultat: compiler(c.code) }))

const page = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>Ajouter son propre #include — gameboy3</title>
<style>${APPARENCE}</style>
</head>
<body>
${couverture()}
${partieBases()}
${partieA()}
${partieB()}
${partieC(matieres)}
${partieJS()}
${partieD()}
${partieE(fautes)}
${partieF(couts)}
${partieG()}
${partieH()}
${partieI()}
${partieLexique()}
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
const r = spawnSync(chrome, [
  '--headless=new', '--disable-gpu', '--no-first-run', '--no-pdf-header-footer',
  `--print-to-pdf=${resolve(PDF)}`, pathToFileURL(resolve(HTML)).href,
], { stdio: 'ignore', timeout: 120000 })
if (r.status !== 0 || !existsSync(PDF)) throw new Error('Chrome n’a pas écrit le PDF')
progression(1, `${PDF} écrit`)

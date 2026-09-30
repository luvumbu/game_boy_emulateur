/**
 * Écrire `TUTORIELS.md` à partir des leçons.
 *
 *   node tutoriels.mjs
 *
 * Le fichier n'est pas tenu à la main : il est ENGENDRÉ. Deux copies d'un même
 * tutoriel — l'une dans la page, l'autre dans un markdown — c'est la garantie
 * qu'un jour l'une des deux mentira, et que ce sera celle qu'on ne fait pas
 * tourner. Ici la source est `tuto/lecons.js` et `tuto/tutoriels.js` ; le
 * markdown en est une sortie, comme la page en est une autre.
 *
 * Ce qui suit est donc à changer DANS LES LEÇONS, jamais dans le .md.
 */

import { writeFileSync } from 'node:fs'
import { LECONS, NIVEAUX, numeros, partieDe } from '../tuto/lecons.js'

const NUMEROS = numeros(LECONS)
import { consoleDuProgramme } from '../tuto/console.mjs'

const SAUT = String.fromCharCode(10)

/*
 * Les tailles sont MESURÉES, et non recopiées.
 *
 * Écrire « 1590 octets » dans une explication, c'est écrire un nombre qui sera
 * faux dès que l'émetteur gagnera une optimisation. On recompile chaque
 * programme ici, et le tableau porte ce que le compilateur vient de dire.
 */
const mesure = (lecon) => {
  try {
    const { octets, variables } = consoleDuProgramme(lecon.code, lecon.titre, false, lecon.fichiers)
    return { octets: octets.length, variables: variables.size }
  } catch (erreur) {
    return { erreur: erreur.message }
  }
}

const lignes = []
const dire = (...quoi) => lignes.push(...quoi)

dire(
  '# Les leçons, du plus facile au plus dur',
  '',
  `**${LECONS.length} leçons**, rangées en dix niveaux. Chacune est un **programme`,
  'entier** : le code se colle tel quel dans `http://localhost/gameboy3/`, ou se',
  'compile en ligne de commande, et il tourne.',
  '',
  '```bash',
  'node outils/gb3.mjs mon-essai.cpp',
  '```',
  '',
  'Ce n’est pas une promesse en l’air. `node verification/verifier-tuto.mjs` **compile chaque',
  'leçon, la fait tourner dans un vrai émulateur, appuie sur de vraies touches**,',
  'et contrôle ce qu’elle annonce dans son « ce qu’on doit voir ». Un tutoriel',
  'dont le code ne marche pas est pire qu’aucun tutoriel : le lecteur croit avoir',
  'mal compris.',
  '',
  '> **Cette page est engendrée** — `node tutoriels.mjs`. La source est',
  '> `tuto/lecons.js` et `tuto/tutoriels.js`, qui alimentent aussi le mode',
  '> LEÇONS de l’atelier, `tuto.html` et les livrets PDF. Corriger ici ne',
  '> servirait à rien : le fichier serait réécrit à la prochaine passe.',
  '',
  'Les mêmes leçons se lisent **dans l’atelier**, avec une console qui tourne à',
  'côté et le code modifiable — `http://localhost/gameboy3/` puis « MODE LEÇONS ».',
  '',
)

/* --- le sommaire, par niveau --- */

dire('| Niveau | Ce qu’on y apprend | Leçons |', '|---|---|---|')
for (const [numero, nom] of Object.entries(NIVEAUX)) {
  const dedans = LECONS.filter((l) => l.difficulte === Number(numero))
  if (!dedans.length) continue
  const premier = NUMEROS[LECONS.indexOf(dedans[0])]
  const dernier = NUMEROS[LECONS.indexOf(dedans[dedans.length - 1])]
  dire(`| ${numero} | ${nom} | ${premier} – ${dernier} |`)
}
dire('')

/* --- les parties d'un niveau (le 0 en a dix), chacune avec ses numéros --- */

// La place de chaque leçon qui OUVRE une partie (celles qui portent
// « partie: '…' »). flatMap garde [i] pour elles, et [] (rien) pour les autres :
// on obtient la liste de leurs places, par exemple [0, 51, 69, …].
const ouvertures = LECONS.flatMap((l, i) => (l.partie ? [i] : []))

// Un tableau seulement s'il y a des parties : sans elles, rien à écrire.
if (ouvertures.length) {
  dire('| Partie | Niveau | Leçons |', '|---|---|---|')   // l'en-tête du tableau markdown
  for (const i of ouvertures) {
    const { lettre, nom } = partieDe(LECONS, i)   // par exemple B et « Le temps »

    // La DERNIÈRE leçon de la partie : on avance d'une leçon à la fois tant
    // que la suivante est du même niveau et n'ouvre pas une autre partie.
    // Pour « Le temps » : du 0.12, on avance jusqu'au 0.17.2 (le 0.18 ouvre
    // « Déplacer une lettre »). Le ?. évite l'erreur au bout de la liste.
    let fin = i
    while (LECONS[fin + 1]?.difficulte === LECONS[i].difficulte && !LECONS[fin + 1].partie) fin++

    // Une ligne : « | B. Le temps | 0 | 0.12 – 0.17.2 | ».
    dire(`| ${lettre}. ${nom} | ${LECONS[i].difficulte} | ${NUMEROS[i]} – ${NUMEROS[fin]} |`)
  }
  dire('')   // une ligne vide : le markdown termine le tableau
}
dire('---', '')

/* --- les leçons --- */

let niveauCourant = null

LECONS.forEach((lecon, i) => {
  if (lecon.difficulte !== niveauCourant) {
    niveauCourant = lecon.difficulte
    dire(`## Niveau ${niveauCourant} — ${NIVEAUX[niveauCourant]}`, '')
  }
  // Sur la leçon qui ouvre une partie, un titre avant elle :
  // « ### Partie B — Le temps ». Les autres leçons n'ont pas « partie ».
  if (lecon.partie) {
    const { lettre, nom } = partieDe(LECONS, i)
    dire(`### Partie ${lettre} — ${nom}`, '')
  }

  dire(`### ${NUMEROS[i]}. ${lecon.titre}`, '')
  dire(`> ${lecon.idee}`, '')

  /* Les fichiers voisins d'abord, chacun sous son nom : le principal les inclut. */
  for (const [nom, contenu] of Object.entries(lecon.fichiers ?? {})) {
    dire('`' + nom + '`', '', '```cpp')
    dire(...contenu.replace(/\s+$/, '').split(SAUT))
    dire('```', '')
  }
  if (lecon.fichiers) dire('`principal.cpp`', '')
  dire('```cpp')
  dire(...lecon.code.replace(/\s+$/, '').split(SAUT))
  dire('```', '')

  for (const paragraphe of lecon.texte) dire(paragraphe, '')

  const { octets, variables, erreur } = mesure(lecon)
  if (erreur) {
    dire(`**Ce programme ne compile pas** — ${erreur}`, '')
  } else {
    dire(
      `**Ce qu’on doit voir** — ${lecon.aVoir}  `,
      `**Ce qu’il coûte** — ${octets} octets de programme, ` +
        `${variables} variable${variables > 1 ? 's' : ''}.`,
      '',
    )
  }

  const outils = []
  if (lecon.dessin) outils.push('un dessin à faire soi-même')
  if (lecon.airs) outils.push('une partition')
  if (lecon.plan) outils.push('un décor à poser')
  if (outils.length) dire(`*Cette leçon a son atelier à la souris : ${outils.join(', ')}.*`, '')

  dire('---', '')
})

dire(
  '## Et après',
  '',
  '- **`http://localhost/gameboy3/`** — l’atelier : les mêmes leçons, avec une',
  '  console qui tourne à côté, et quatre d’entre elles à faire à la souris.',
  '- **`LISEZMOI.md`** — la page du langage, les fonctions de la console, et les',
  '  cinquante réglages.',
  '- **`node lancer-tutoriels.mjs`** — les fait toutes tourner, et les',
  '  photographie en une planche-contact.',
  '- **`node verifier-tuto.mjs`** — recompile et rejoue tout ce qui est écrit ici.',
  '',
)

writeFileSync('documents/TUTORIELS.md', lignes.join(SAUT))

const compilent = LECONS.filter((l) => !mesure(l).erreur).length
console.log('TUTORIELS.md')
console.log(`  ${LECONS.length} leçons, ${compilent} qui compilent`)
console.log(`  ${lignes.length} lignes`)

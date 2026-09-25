/**
 * `TUTORIELS.md` dit-il encore la vérité ?
 *
*   node verification/verifier-tutoriels.mjs
 *
 * Le fichier est engendré depuis les leçons. Rien ne force pourtant à le
 * régénérer après avoir corrigé une leçon — et un markdown périmé est pire
 * qu'un markdown absent : il a l'air à jour.
 *
 * Ce contrôle le réengendre en mémoire et compare. S'il diffère, c'est qu'on a
 * changé une leçon sans relancer `node outils/tutoriels.mjs`, ou qu'on a corrigé le
 * .md à la main — ce qui serait perdu à la passe suivante.
 *
 * Que les programmes COMPILENT et fassent ce qu'ils annoncent est vérifié
 * ailleurs, par `verifier-tuto.mjs`, qui les fait tourner.
 */

import { readFileSync, existsSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { LECONS } from '../tuto/lecons.js'
import { enrichir } from '../tuto/enrichir.js'
import { bulletin } from '../outils/controle.mjs'

const b = bulletin('documents/TUTORIELS.md')

if (!existsSync('documents/TUTORIELS.md')) {
  b.verifier('le fichier existe', false, ' — lancer « node outils/tutoriels.mjs »')
  b.fin()
}

const avant = readFileSync('documents/TUTORIELS.md', 'utf8')

/* On régénère pour de vrai, puis on remet ce qu'on a trouvé si cela diffère :
   un contrôle ne doit pas modifier le dépôt en passant. */
execFileSync(process.execPath, ['outils/tutoriels.mjs'], { stdio: 'ignore' })
const apres = readFileSync('documents/TUTORIELS.md', 'utf8')

b.verifier('il est à jour avec les leçons', avant === apres,
  avant === apres ? '' : ' — relancer « node outils/tutoriels.mjs » et committer le résultat')

b.egal('il porte toutes les leçons',
  (apres.match(/^### \d+(\.\d+)*\. /gm) ?? []).length, LECONS.length)   // 1, 1.1, 0.35, 0.35.1…

/* Un bloc par programme, plus un par fichier voisin. */
const BLOCS = LECONS.reduce((n, l) => n + 1 + Object.keys(l.fichiers ?? {}).length, 0)
b.verifier('chaque leçon porte son programme',
  (apres.match(/^```cpp$/gm) ?? []).length === BLOCS,
  ` (${(apres.match(/^```cpp$/gm) ?? []).length} blocs pour ${BLOCS} fichiers de leçons)`)

/* Le marqueur exact, et non la tournure : une leçon peut parfaitement PARLER
   d'octets de programme dans son explication — celle qui enseigne à lire le
   compte rendu le fait —, et la compter serait compter deux fois. */
const mesures = (apres.match(/^\*\*Ce qu’il coûte\*\* — \d+ octets/gm) ?? []).length
b.egal('chacune annonce ce qu’elle coûte, mesuré', mesures, LECONS.length)

b.verifier('les dix niveaux sont annoncés',
  [...Array(10).keys()].every((n) => apres.includes(`## Niveau ${n + 1} —`)))

/*
 * Aucun accent grave ne doit ARRIVER À L'ÉCRAN.
 *
 * `enrichir()` transforme « `du code` » et « **du gras** » en balises. Ce qu'il
 * ne sait pas rendre, il le laisse tel quel — et le lecteur voit alors les
 * marques d'écriture au lieu du texte. Treize leçons montraient ainsi leurs
 * accents graves, parce que le code écrit AU MILIEU d'un gras n'était pas
 * traité. Rien ne cassait, rien ne se plaignait : c'est exactement pourquoi
 * cela a duré. Le contrôle rend la faute bruyante.
 */
const marques = LECONS.flatMap((lecon) =>
  (lecon.texte ?? [])
    .filter((paragraphe) => enrichir(paragraphe).includes('`'))
    .map((paragraphe) => `${lecon.titre} : ${paragraphe.slice(0, 60)}…`))

b.verifier('aucune leçon ne montre ses accents graves au lecteur', marques.length === 0,
  marques.length ? `\n      ${marques.join('\n      ')}` : '')

b.fin()

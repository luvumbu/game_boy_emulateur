/**
 * Écrire la section « Les réglages » du LISEZMOI, à partir du catalogue.
 *
 *   node reglages.mjs
 *
 * Recopier cinquante-trois réglages à la main dans une documentation, ce sont
 * cinquante-trois occasions d'y laisser une valeur par défaut qui n'est plus
 * la bonne — et personne ne s'en aperçoit, puisqu'une documentation ne
 * s'exécute pas. On lit donc le catalogue de `index.html`, et l'on engendre le
 * tableau.
 *
 * Le catalogue est du JavaScript : on le fait évaluer par JavaScript, plutôt
 * que de l'analyser à coups d'expressions régulières. Ses fonctions
 * « appliquer » nomment des choses de la page ; on ne les appelle pas, mais
 * elles doivent pouvoir être définies — d'où les bouchons.
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { LECONS } from '../tuto/lecons.js'

const SAUT = String.fromCharCode(10)
const CRLF = String.fromCharCode(13) + SAUT
/* « ?
 » écrit sans dépendre de la façon dont ce fichier est enregistré. */
const SAUT_OU_CRLF = String.fromCharCode(92) + 'r?' + String.fromCharCode(92) + 'n'
const page = readFileSync('index.html', 'utf8')

/*
 * Les fins de ligne ne sont pas les mêmes partout.
 *
 * Ces fichiers sont écrits sous Windows, donc en CRLF. Chercher un saut de
 * ligne seul n'y trouve rien — et le générateur annonçait « catalogue
 * introuvable » alors qu'il était sous ses yeux. On cherche donc avec une
 * expression qui accepte les deux, et l'on ÉCRIT avec les fins de ligne du
 * fichier qu'on remplace : les changer toutes d'un coup ferait passer le
 * fichier entier pour modifié.
 */
const debut = page.indexOf('const CATALOGUE = [')
if (debut < 0) throw new Error('le catalogue des réglages est introuvable dans index.html')

const ferme = page.slice(debut).search(new RegExp(SAUT_OU_CRLF + String.fromCharCode(93) + SAUT_OU_CRLF))
if (ferme < 0) throw new Error('la fin du catalogue est introuvable dans index.html')
const fin = debut + ferme + page.slice(debut + ferme).indexOf(String.fromCharCode(93)) + 1

const BOUCHONS = `
let NUANCES = null
const PALETTES = {}, POLICES = {}
const poserVariable = () => {}, poserAttribut = () => {}
const redessinerLEcran = () => {}, ajusterLePleinEcran = () => {}
const appliquerLeVolume = () => {}, appliquerLeTheme = () => {}
const TITRE_ORIGINE = ''
const localStorage = { removeItem() {} }
const LECONS = { length: ${LECONS.length} }
`

/* eslint-disable no-new-func */
const CATALOGUE = new Function(BOUCHONS + page.slice(debut, fin) + SAUT + 'return CATALOGUE')()

/** Ce qu'un réglage vaut au départ, dit en français plutôt qu'en JavaScript. */
const valeurLisible = (r) => {
  if (r.type === 'case') return r.defaut ? 'coché' : 'décoché'
  if (r.type === 'glissiere') return `\`${r.defaut}${r.unite ?? ''}\``
  return `\`${r.defaut}\``
}

const lignes = [
  '## Les réglages',
  '',
  `Le bouton **⚙**, en haut de la page, ouvre **${CATALOGUE.length} réglages**. Ils tiennent`,
  'tous à une règle : **chacun s\'applique à l\'instant où on le change**, la',
  'console tournant, sans rien recharger et sans couper la partie en cours. Un',
  'réglage qu\'il faut valider n\'est pas un réglage, c\'est un formulaire.',
  '',
  'Ils sont retenus d\'une visite à l\'autre. Un champ de recherche les filtre —',
  'sur leur nom comme sur leur explication —, un point vert marque ceux qui ont',
  'bougé, et « Tout remettre » les ramène tous, effets compris.',
  '',
  '> **Ce tableau est engendré** — `node reglages.mjs`. Le panneau non plus',
  '> n\'est pas écrit à la main : il sort d\'une table qui dit, pour chaque',
  '> réglage, son nom, sa valeur de départ et ce qu\'il change. Cinquante',
  '> réglages écrits trois fois — dans le HTML, à la lecture, à',
  '> l\'enregistrement —, ce sont trois occasions d\'en oublier un ; et un',
  '> réglage qui s\'affiche mais ne se retient pas ressemble beaucoup à un',
  '> réglage qui marche.',
  '',
  '`Ctrl+,` ouvre le panneau, `Ctrl+Entrée` compile et lance, `Ctrl+M` met en',
  'pause.',
  '',
]

const groupes = [...new Set(CATALOGUE.map((r) => r.groupe))]

for (const groupe of groupes) {
  lignes.push(`### ${groupe}`, '')
  lignes.push('| Réglage | Par défaut | Ce qu\'il change |', '|---|---|---|')
  for (const r of CATALOGUE.filter((x) => x.groupe === groupe)) {
    const aide = r.aide.replace(/\|/g, '\\|')
    const titre = r.titre.replace(/\|/g, '\\|')
    lignes.push(`| **${titre}** | ${valeurLisible(r)} | ${aide} |`)
  }
  lignes.push('')
}

lignes.push(
  'Chaque contrôle porte l\'identifiant `reglage-<nom>` : le panneau se pilote',
  'donc du dehors, et c\'est ce qui permet à `verifier-page.mjs` de vérifier',
  'qu\'aucun réglage du catalogue ne manque à l\'affichage, que la recherche',
  'filtre, et qu\'un réglage changé change bien quelque chose.',
  '',
)

const section = lignes.join(SAUT)

/*
 * La section REMPLACE la précédente, elle ne s'ajoute pas.
 *
 * Écrit dans l'autre sens, chaque passe empilait un tableau de plus dans le
 * fichier — et le lecteur tombait sur deux listes de réglages qui ne disaient
 * pas la même chose, sans savoir laquelle croire.
 */
const APRES = '## Comment ça marche'
let doc = readFileSync('LISEZMOI.md', 'utf8')
const finDeLigne = doc.includes(CRLF) ? CRLF : SAUT
const morceau = section.split(SAUT).join(finDeLigne) + '---' + finDeLigne + finDeLigne

const ouEtait = doc.indexOf('## Les réglages')

if (ouEtait >= 0) {
  const jusqua = doc.indexOf(APRES, ouEtait)
  if (jusqua < 0) throw new Error(`« ${APRES} » ne suit plus la section des réglages`)
  doc = doc.slice(0, ouEtait) + morceau + doc.slice(jusqua)
} else {
  doc = doc.replace(APRES, morceau + APRES)
}

writeFileSync('LISEZMOI.md', doc)

console.log('LISEZMOI.md — section « Les réglages »')
console.log(`  ${CATALOGUE.length} réglages, ${groupes.length} groupes`)

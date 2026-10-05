/**
 * Les personnages, un fichier chacun : le parent et ses enfants.
 *
 *   principal.cpp                 ta source — UNE ligne, écrite une seule fois :
 *     #include "personnages.cpp"
 *   personnages.cpp               le PARENT : l'include qui inclut tous les fichiers
 *     #include <Perso>            UNE fois, pour tous les personnages
 *     #include "perso_HEROS.cpp"
 *     #include "perso_BOSS.cpp"
 *   perso_HEROS.cpp               un ENFANT : le dessin de HEROS, et rien d'autre
 *   perso_BOSS.cpp                un ENFANT : le dessin de BOSS, un Perso de 32 × 32
 *
 * Ajouter un personnage crée son enfant et ajoute UNE ligne au parent : la
 * source principale n'est touchée qu'une fois, le premier jour, pour verser
 * le parent. Sans cette ligne le compilateur ne verrait pas les personnages ;
 * la cacher ferait un programme qui ne compile plus hors de l'atelier.
 *
 * Le programme compilé ne change pas : « #include "…" » colle le fichier à
 * l'endroit de la ligne, de proche en proche (voir compilateur/inclusion.js),
 * et pour des dessins l'ordre ne compte pas.
 *
 * Un dessin part avec ce qui l'accompagne, écrit juste sous lui par les
 * ateliers : sa table de palettes (« NOM_PALETTES »), ses marques
 * d'étiquettes, de palette et de verrou.
 *
 * Fonctions PURES : elles reçoivent les fichiers (paires [nom, texte]) et
 * rendent une Map, l'ordre gardé. C'est la page qui les pose, et qui garde de
 * quoi annuler.
 */

import { lireDessins, ajouterDessin, renommerPartout } from './editeur-tuiles.js'

export const FICHIER_DES_PERSONNAGES = 'personnages.cpp'

/** Le fichier d'un personnage : « perso_HEROS.cpp ». */
export const fichierEnfant = (nom) => `perso_${nom}.cpp`

/** Ce fichier est-il un enfant (un personnage à lui seul) ? */
export const estEnfant = (fichier) => /^perso_[A-Za-z_]\w*\.cpp$/.test(fichier)

/** Ce fichier fait-il partie du groupe des personnages (le parent ou un enfant) ? */
export const estDuGroupe = (fichier) => fichier === FICHIER_DES_PERSONNAGES || estEnfant(fichier)

const SAUT = '\n'
const echapper = (nom) => nom.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const ligneInclusion = (fichier) => `#include "${fichier}"`
const inclut = (texte, fichier) => new RegExp(`^[ \\t]*#\\s*include\\s*"${echapper(fichier)}"`, 'm').test(texte)

const ENTETE_DU_PARENT = [
  `// ${FICHIER_DES_PERSONNAGES} : la liste des personnages du jeu — un fichier chacun.`,
  '//',
  '// Ce fichier ne contient que des « #include » : chaque personnage est écrit',
  '// dans SON fichier, « perso_NOM.cpp ». principal.cpp verse cette liste avec',
  `//   #include "${FICHIER_DES_PERSONNAGES}"`,
  '//',
  '// L’atelier écrit ici tout seul : un personnage créé ajoute sa ligne,',
  '// un personnage supprimé l’ôte. Pour le dessiner : « ▦ Les tuiles ».',
  '',
  '#include <Perso>   // UNE fois, pour TOUS les personnages de la liste (16 × 16 ou 32 × 32)',
  '',
].join(SAUT)

const enteteDeLEnfant = (nom, cote) => [
  `// ${fichierEnfant(nom)} : le personnage ${nom} (${cote} × ${cote}), et lui seul.`,
  `// Il est versé par ${FICHIER_DES_PERSONNAGES}, lui-même versé par principal.cpp.`,
  '// Juste le dessin : « #include <Perso> » est écrit une fois, dans la liste.',
  '// L’atelier n’écrit que dans ce fichier quand on le dessine.',
  '',
].join(SAUT)

/** Les lignes écrites sous un dessin par les ateliers, et qui partent avec lui. */
const accompagne = (nom, ligne) => {
  const n = echapper(nom)
  return new RegExp(`^[ \\t]*const\\s+uint8_t\\s+${n}_PALETTES\\b`).test(ligne) ||
    // pas « \b » : il ne voit pas la fin d'un mot qui finit par « é »
    new RegExp(`^[ \\t]*/\\* ${n} : (?:étiquettes|palette|verrouillé)(?=[\\s*])`).test(ligne)
}

/**
 * Retire de `texte` chaque personnage (Perso, Grand), avec ce qui l'accompagne.
 * Rend { texte, blocs: [{ nom, cote, texte }] }, les blocs dans l'ordre du fichier.
 */
export function extrairePersonnages(texte) {
  const dessins = lireDessins(texte).filter((d) => d.cote >= 16)
  const blocs = []
  let reste = texte
  for (const d of [...dessins].reverse()) {
    const debut = reste.lastIndexOf(SAUT, d.debut - 1) + 1
    let fin = reste.indexOf(SAUT, d.fin)
    fin = fin < 0 ? reste.length : fin + 1
    for (;;) {
      const finLigne = reste.indexOf(SAUT, fin)
      const ligne = reste.slice(fin, finLigne < 0 ? reste.length : finLigne)
      if (fin >= reste.length || !accompagne(d.nom, ligne)) break
      fin = finLigne < 0 ? reste.length : finLigne + 1
    }
    blocs.unshift({ nom: d.nom, cote: d.cote, texte: reste.slice(debut, fin).replace(/\n?$/, SAUT) })
    reste = reste.slice(0, debut) + reste.slice(fin)
  }
  return { texte: reste, blocs }
}

/**
 * La ligne « #include "personnages.cpp" » dans le fichier principal, s'il ne
 * l'a pas : après les « #include » du haut, avant la première ligne de code.
 */
export function inclureLeFichier(principal, nom = FICHIER_DES_PERSONNAGES) {
  if (inclut(principal, nom)) return principal
  const lignes = principal.split(SAUT)
  let dansUnBloc = false
  let ou = lignes.length
  for (let i = 0; i < lignes.length; i++) {
    const l = lignes[i].trim()
    if (dansUnBloc) { if (l.includes('*/')) dansUnBloc = false; continue }
    if (l.startsWith('/*')) { dansUnBloc = !l.includes('*/'); continue }
    if (l === '' || l.startsWith('//') || l.startsWith('#include')) continue
    ou = i
    break
  }
  let apres = -1
  for (let i = 0; i < ou; i++) if (lignes[i].trim().startsWith('#include')) apres = i
  lignes.splice(apres >= 0 ? apres + 1 : ou, 0, `${ligneInclusion(nom)}   // les personnages, un fichier chacun`)
  return lignes.join(SAUT)
}

/**
 * Le parent porte l'autorisation, UNE fois : #include <Perso> — et <Grand>
 * si un enfant écrit « Grand NOM = … ». Ajoutée sous son en-tête s'il ne l'a pas.
 */
function avecLesInclusionsDuParent(tous) {
  let parent = tous.get(FICHIER_DES_PERSONNAGES)
  if (parent === undefined) return tous
  const besoins = ['Perso']
  for (const [nom, texte] of tous) if (estEnfant(nom) && /\bGrand\s+[A-Za-z_]\w*\s*=/.test(texte)) { besoins.push('Grand'); break }
  for (const type of besoins) {
    if (new RegExp(`^[ \\t]*#\\s*include\\s*<\\s*${type}\\s*>`, 'm').test(parent)) continue
    const lignes = parent.split(SAUT)
    let i = 0
    while (i < lignes.length && (/^\s*\/\//.test(lignes[i]) || /^\s*#\s*include\s*</.test(lignes[i]))) i++
    lignes.splice(i, 0, type === 'Perso'
      ? '#include <Perso>   // UNE fois, pour TOUS les personnages de la liste (16 × 16 ou 32 × 32)'
      : '#include <Grand>   // l\'autre nom d\'un Perso de 32 × 32')
    parent = lignes.join(SAUT)
  }
  tous.set(FICHIER_DES_PERSONNAGES, parent)
  return tous
}

/** Le parent existe, le principal le verse : rien d'autre n'est touché. */
export function assurerLeParent(fichiers, principal) {
  const tous = new Map(fichiers)
  if (!tous.has(FICHIER_DES_PERSONNAGES)) tous.set(FICHIER_DES_PERSONNAGES, ENTETE_DU_PARENT)
  const dejaVerse = [...tous].some(([nom, texte]) => nom !== FICHIER_DES_PERSONNAGES && inclut(texte, FICHIER_DES_PERSONNAGES))
  if (!dejaVerse) tous.set(principal, inclureLeFichier(tous.get(principal) ?? ''))
  return tous
}

/** Ajoute « #include "perso_NOM.cpp" » au parent, s'il n'y est pas. */
function inscrireLEnfant(parent, nom) {
  const fichier = fichierEnfant(nom)
  if (inclut(parent, fichier)) return parent
  return parent.replace(/\n*$/, SAUT) + ligneInclusion(fichier) + SAUT
}

/**
 * Un nouveau personnage, dans son fichier à lui.
 * `rangees` : le dessin de départ (une variante), ou rien pour un dessin vide.
 */
export function creerEnfant(fichiers, principal, nom, cote, rangees = null) {
  const tous = assurerLeParent(fichiers, principal)
  const fichier = fichierEnfant(nom)
  const enfant = ajouterDessin(enteteDeLEnfant(nom, cote), nom, cote, rangees)
  tous.set(fichier, enfant.replace(/\n*$/, SAUT))
  tous.set(FICHIER_DES_PERSONNAGES, inscrireLEnfant(tous.get(FICHIER_DES_PERSONNAGES), nom))
  return avecLesInclusionsDuParent(tous)
}

/**
 * Chaque personnage écrit ailleurs que dans son enfant y déménage :
 * principal.cpp, un fichier voisin, l'ancien personnages.cpp d'un seul bloc.
 * Rend { fichiers: Map, deplaces: [noms] } — rien ne change s'il n'y en a pas.
 */
export function rangerLesPersonnages(fichiers, principal) {
  let tous = new Map(fichiers)
  const deplaces = []
  const blocs = []
  for (const [nom, texte] of tous) {
    if (estEnfant(nom)) continue
    const { texte: reste, blocs: siens } = extrairePersonnages(texte)
    if (!siens.length) continue
    tous.set(nom, reste)
    blocs.push(...siens)
  }
  /* Un enfant qui porte d'autres personnages que le sien les rend aussi. */
  for (const [nom, texte] of tous) {
    if (!estEnfant(nom)) continue
    const lui = nom.slice('perso_'.length, -'.cpp'.length)
    const autres = lireDessins(texte).filter((d) => d.cote >= 16 && d.nom !== lui)
    if (!autres.length) continue
    const { texte: reste, blocs: siens } = extrairePersonnages(texte)
    const sien = siens.find((b) => b.nom === lui)
    tous.set(nom, sien ? reste.replace(/\n*$/, SAUT) + SAUT + sien.texte : reste)
    blocs.push(...siens.filter((b) => b.nom !== lui))
  }
  if (!blocs.length) return { fichiers: new Map(fichiers), deplaces }

  tous = assurerLeParent(tous, principal)
  /* L'ancien personnages.cpp d'un seul bloc devient la liste : son en-tête et
     ses « #include <Perso> » n'ont plus lieu d'être ; le reste est gardé. */
  const ancien = tous.get(FICHIER_DES_PERSONNAGES)
  if (!ancien.startsWith(ENTETE_DU_PARENT.split(SAUT)[0])) {
    const garde = ancien.split(SAUT).filter((l) => {
      const t = l.trim()
      return t !== '' && !t.startsWith('//') && !/^#\s*include\s*<\s*(?:Perso|Grand)\s*>/.test(t)
    })
    tous.set(FICHIER_DES_PERSONNAGES, ENTETE_DU_PARENT + (garde.length ? garde.join(SAUT) + SAUT : ''))
  }
  for (const bloc of blocs) {
    const fichier = fichierEnfant(bloc.nom)
    const deja = tous.get(fichier)
    tous.set(fichier, deja === undefined
      ? enteteDeLEnfant(bloc.nom, bloc.cote) + SAUT + bloc.texte
      : deja.replace(/\n*$/, SAUT) + SAUT + bloc.texte)
    tous.set(FICHIER_DES_PERSONNAGES, inscrireLEnfant(tous.get(FICHIER_DES_PERSONNAGES), bloc.nom))
    deplaces.push(bloc.nom)
  }
  return { fichiers: avecLesInclusionsDuParent(tous), deplaces }
}

/**
 * Les enfants vides (leur personnage a été supprimé) partent, avec leur ligne
 * dans le parent. Rend une Map.
 */
export function nettoyerLesEnfants(fichiers) {
  const tous = new Map(fichiers)
  for (const [nom, texte] of [...tous]) {
    if (!estEnfant(nom) || lireDessins(texte).length) continue
    tous.delete(nom)
    const motif = new RegExp(`^[ \\t]*#\\s*include\\s*"${echapper(nom)}".*(?:\\n|$)`, 'gm')
    for (const [autre, contenu] of tous) tous.set(autre, contenu.replace(motif, ''))
  }
  return tous
}

/**
 * Renommer un personnage dans tout le projet : son nom partout, son fichier
 * « perso_ANCIEN.cpp » qui devient « perso_NEUF.cpp », et la ligne du parent.
 * Rend { fichiers: Map, renommes: Map(ancien fichier → nouveau) }.
 */
export function renommerDansLeProjet(fichiers, ancien, neuf) {
  const renommes = new Map()
  const avant = fichierEnfant(ancien)
  const apres = fichierEnfant(neuf)
  const tous = new Map()
  for (const [nom, texte] of fichiers) {
    let contenu = renommerPartout(texte, ancien, neuf)
    contenu = contenu.split(`"${avant}"`).join(`"${apres}"`).split(`// ${avant} :`).join(`// ${apres} :`)
    if (nom === avant) { tous.set(apres, contenu); renommes.set(avant, apres) } else tous.set(nom, contenu)
  }
  return { fichiers: tous, renommes }
}

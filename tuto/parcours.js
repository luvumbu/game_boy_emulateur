/*
 * LE PARCOURS : les leçons, les tutoriels et le cours, en UNE seule suite.
 *
 * Il y avait deux modes qui se ressemblaient — les leçons (par niveau de
 * difficulté) et le cours (par notion de programmation). On les réunit sans
 * rien perdre : chaque leçon et chaque cours garde son texte, son programme
 * et ses contrôles. Seuls changent leur place et leur numéro de chapitre.
 *
 * 1. L'ordre des chapitres. Les niveaux des leçons et les chapitres du cours
 *    sont entremêlés PAR SUJET, en gardant l'ordre interne de chaque série :
 *    aucune notion n'arrive avant celles dont elle a besoin. Le tableau
 *    CHAPITRES_DU_PARCOURS dit, chapitre après chapitre, d'où il vient.
 *
 * 2. Un « #include » à la fois. Les tutos des fonctions (« La fonction
 *    texte() — écrire un mot »…) ne sont plus rangés tous ensemble : chacun
 *    vient JUSTE AVANT la première étape qui emploie sa fonction, comme une
 *    étape intermédiaire (« suite » : les numéros des autres ne bougent pas).
 *    Un tuto qui emploie lui-même une autre fonction fait passer le tuto de
 *    celle-ci d'abord. Ainsi chaque étape n'apporte qu'un « #include » neuf
 *    au plus — et c'est vérifié (verifier-tuto.mjs).
 *
 *    Les tutos qu'aucune étape n'emploie restent ensemble, à la fin du
 *    chapitre 0, dans la partie « Les fonctions de la console, une par une ».
 */

import { inclusionsDe, fonctionDuTuto } from './fonctions.js'
import { COURS } from './programmation.js'

/* [d'où vient le chapitre, son numéro là-bas, son nom dans le parcours] */
const CHAPITRES_DU_PARCOURS = [
  ['lecons', 0, 'Avant tout'],
  ['lecons', 1, 'Les tout premiers pas'],
  ['cours', 1, 'Les variables : la mémoire de la console'],
  ['lecons', 2, 'Retenir, et réagir'],
  ['cours', 2, 'Les conditions : choisir'],
  ['cours', 3, 'Les boucles : répéter'],
  ['lecons', 3, 'Dessiner'],
  ['lecons', 4, 'Le mouvement'],
  ['lecons', 5, 'Le son'],
  ['lecons', 6, 'Ranger ce qu’on manipule'],
  ['cours', 4, 'Les tableaux : ranger beaucoup de valeurs'],
  ['lecons', 7, 'Découper son programme'],
  ['cours', 5, 'Les fonctions : nommer un geste'],
  ['lecons', 8, 'Ce qui va ensemble'],
  ['cours', 6, 'Les struct : ce qui va ensemble'],
  ['cours', 7, 'Les quatre nuances : la Game Boy d’origine'],
  ['cours', 8, 'La couleur : la Game Boy Color'],
  ['cours', 9, 'Le mouvement : les lutins au pixel près'],
  ['cours', 10, 'Les collisions : se toucher, se cogner'],
  ['cours', 11, 'Le hasard et le temps'],
  ['cours', 12, 'Les états du jeu : titre, partie, fin'],
  ['cours', 13, 'Le son : notes, bruits, airs'],
  ['cours', 14, 'Le défilement : un monde plus grand que l’écran'],
  ['lecons', 9, 'Un vrai jeu'],
  ['lecons', 10, 'Aller au bout'],
  ['cours', 15, 'Tes propres #include : ajouter une fonction'],
]

/** Le nom de chaque chapitre du parcours, par numéro : 0 « Avant tout », 1… */
export const CHAPITRES = Object.fromEntries(CHAPITRES_DU_PARCOURS.map(([, , nom], k) => [k, nom]))

/*
 * Après le parcours, une série à part : « Série 2 — Les formes géométriques »
 * (tuto/formes.js). Elle prend la place qui suit le dernier chapitre, pour que
 * tout ce qui range par chapitre la range aussi ; mais ses leçons portent leur
 * propre numéro (2.01, 2.02…) et s'affichent « Série 2 », pas « Chapitre 26 ».
 */
export const CHAPITRE_DES_FORMES = CHAPITRES_DU_PARCOURS.length
CHAPITRES[CHAPITRE_DES_FORMES] = 'Les formes géométriques'

/* Puis la série 3 — les images (tuto/images.js) : « Série 3 — Les images ». */
export const CHAPITRE_DES_IMAGES = CHAPITRE_DES_FORMES + 1
CHAPITRES[CHAPITRE_DES_IMAGES] = 'Les images'

/** « Chapitre 6 », ou « Série 2 » pour une leçon d'une série à part. */
export const nomDuChapitre = (lecon) => (lecon.serie ? `Série ${lecon.serie}` : `Chapitre ${lecon.difficulte}`)

/*
 * La difficulté, de 1 à 10, qu'affiche la jauge. Une leçon garde la sienne ;
 * un cours prend celle du niveau de leçons dont son chapitre est voisin.
 */
const DIFFICULTE_DU_COURS = { 1: 1, 2: 2, 3: 2, 4: 6, 5: 7, 6: 8, 7: 8, 8: 8, 9: 8, 10: 9, 11: 9, 12: 9, 13: 9, 14: 10, 15: 10 }

/*
 * Avant le tout premier « #include » : pourquoi on en écrit.
 *
 * Le parcours explique la règle UNE fois, en détail, avec un programme qui
 * l'applique — puis chaque tuto de fonction la redit pour sa ligne à lui.
 */
const POURQUOI_INCLURE = {
  titre: 'Pourquoi écrire « #include » ?',
  difficulte: 0,
  suite: true,
  idee: 'Une fonction de la console prend de la place dans la cartouche. On écrit « #include <nom> » pour dire qu’on s’en sert : sans la ligne, le compilateur la refuse ; avec, il la grave — et seulement si le programme l’emploie vraiment.',
  texte: [
    '**Au 0.0, le programme ne faisait rien, et il n’avait aucune ligne `#include`.** À partir de maintenant, presque chaque programme commence par quelques lignes `#include <…>`. Cette étape explique pourquoi, une fois pour toutes, avant d’en écrire une.',
    '**La cartouche est petite.** Une cartouche Game Boy, c’est **32 Ko** : 32 768 octets pour tout le jeu — le programme, les dessins, la musique. Un octet est une case qui retient un nombre de 0 à 255. Chaque instruction du programme en occupe quelques-unes.',
    '**Une fonction de la console prend de la place.** Écrire un mot (`texte()`), lire la manette (`bouton()`), jouer une note (`note()`) : derrière chacune, il y a du code, des petites routines, des tables (les dessins des lettres, les hauteurs des notes). Tout cela doit être **gravé dans la cartouche** pour que la console puisse s’en servir.',
    '**Rien n’est là d’office.** Si la console mettait toutes ses fonctions dans chaque cartouche, un programme qui n’écrit qu’une lettre emporterait aussi la musique, les lutins, la police entière… des milliers d’octets pour rien. La règle est donc celle du langage C : **ce qu’on veut employer, on l’inclut**.',
    '**La ligne `#include <texte>`** se lit : « ce programme se sert de `texte()` ». Le **nom entre les chevrons `< >`** est celui de la fonction, écrit **exactement** comme dans le programme : `#include <texte>` pour `texte()`, `#include <ALPHABET>` pour `ALPHABET`, `#include <Tuile>` pour une `Tuile`. Le `#` au début dit que ce n’est pas une instruction du jeu : c’est une indication donnée au compilateur, avant la compilation.',
    '**Sans la ligne, le compilateur refuse**, et il dit laquelle écrire : « il faut « #include <texte> » pour employer texte() ». Personne n’a à deviner. Dans l’atelier, un bouton l’écrit pour toi.',
    '**Avec la ligne, il ne grave que ce qui sert.** Une ligne `#include` de trop ne coûte **rien** : si le programme n’appelle jamais la fonction, rien n’est gravé. Le panneau ROM de l’atelier dit, pour chaque ligne, si elle sert et combien d’octets elle coûte.',
    '**Ce qui ne s’inclut pas :** `image()`, `images()`, `retard()`, `ms()` et `secondes()` sont **natives** — elles font tourner la boucle du jeu et ne coûtent rien. C’est pourquoi le 0.0 n’avait besoin d’aucun `#include`.',
    '**La suite du parcours avance une ligne à la fois.** Chaque fois qu’une fonction de la console sert pour la première fois, une étape la présente seule — sa ligne `#include`, ses arguments, ce qu’elle coûte —, juste avant la leçon qui l’emploie. Tu n’as jamais deux lignes nouvelles à comprendre en même temps.',
    '**Essaie :** efface la ligne `#include <texte>`, puis lance : lis le message du compilateur. Remets-la : tout repart.',
  ],
  code: `// ---- Pourquoi écrire #include ? ----
// La ligne ci-dessous dit au compilateur : « ce programme se sert de texte() ».
//
//   #include <texte>
//   |        |
//   |        +-- le nom de la fonction, écrit comme dans le programme
//   +----------- « # » : une indication pour le compilateur, pas une instruction du jeu
//
// Sans elle, texte() est refusée : une fonction de la console prend de la
// place dans la cartouche, et ne s'emploie qu'incluse. Avec elle, texte() est
// gravée — et seulement parce que le programme l'appelle vraiment.

#include <texte>   // écrit un texte à l’écran

int main() {
  texte(1, 8, "INCLUS DONC GRAVE");   // texte() existe : sa ligne #include est là

  while (true) {     // la boucle du jeu
    image();         // image() est native : elle ne s'inclut pas
  }
}
`,
  aVoir: 'INCLUS DONC GRAVE écrit au milieu de l’écran.',
  controle: (c) => [
    ['le texte est écrit : texte() est bien incluse', c.mot(1, 8, 17) === 'INCLUS DONC GRAVE'],
  ],
}

/*
 * Un tuto déplacé devient une étape intermédiaire : « suite », dans le
 * chapitre de l'étape qu'il précède, et sans sa « partie » d'origine.
 */
function etapeDuTuto(tuto, chapitre) {
  const { partie, ...reste } = tuto
  const etape = { ...reste, difficulte: chapitre, suite: true }
  /* Le premier tuto parlait de « cette partie, un dictionnaire » : déplacé,
     il ouvre la présentation des fonctions une par une. */
  etape.texte = etape.texte.map((p) => p.startsWith('**Cette partie est un dictionnaire.**')
    ? '**Une fonction, une étape.** Avant d’employer une fonction de la console pour la première fois, le parcours la présente seule : la ligne `#include` qui la rend disponible, ses arguments, ce qu’elle coûte, et un essai. Ici, `texte()`, la première de toutes.'
    : p)
  return etape
}

/*
 * L'entrée de chaque chapitre : pas de saut entre deux chapitres.
 *
 * Le parcours passe d'une série à l'autre (des leçons au cours, et retour) :
 * chaque chapitre s'ouvre donc sur une étape qui dit d'où l'on vient, ce qui
 * vient, et quelles fonctions de la console y seront présentées. Tout est lu
 * dans le parcours lui-même — les titres, les « #include » neufs — : ces
 * étapes restent justes quand une leçon change.
 */
function ajouterLesEntreesDeChapitre(parcours) {
  const connus = new Set()
  const entrees = []
  parcours.forEach((etape, i) => {
    const chapitre = etape.difficulte
    if (chapitre > 0 && parcours[i - 1]?.difficulte !== chapitre) {
      const dedans = parcours.filter((l) => l.difficulte === chapitre)
      const neufs = []
      for (const l of dedans) for (const nom of inclusionsDe(l)) if (!connus.has(nom) && !neufs.includes(nom)) neufs.push(nom)
      const lecons = dedans.filter((l) => !fonctionDuTuto(l))
      const cours = lecons.filter((l) => l.provenance === 'cours').length
      const precedent = CHAPITRES[chapitre - 1]
      entrees.push({ avant: i, etape: {
        titre: `Chapitre ${chapitre} — ${CHAPITRES[chapitre]} : ce qui vient`,
        difficulte: chapitre,
        niveau: etape.niveau,
        suite: true,
        provenance: 'parcours',
        idee: `L’entrée du chapitre ${chapitre} : ce qu’on a vu jusqu’ici, et ce que ses ${lecons.length} étapes vont ajouter, une à la fois.`,
        texte: [
          `**D’où l’on vient.** Le chapitre ${chapitre - 1}, « ${precedent} », vient de se terminer. Tout ce qu’il a montré reste valable : on s’en sert à partir d’ici sans le réexpliquer.`,
          `**Ce que ce chapitre apporte : ${CHAPITRES[chapitre]}.** Il compte ${lecons.length} étape${lecons.length > 1 ? 's' : ''}` +
            (cours ? `, dont ${cours} venue${cours > 1 ? 's' : ''} du cours` : '') + ' :',
          ...lecons.slice(0, 12).map((l) => `- ${l.titre}`),
          ...(lecons.length > 12 ? [`- … et ${lecons.length - 12} autres.`] : []),
          neufs.length
            ? `**Les fonctions qui arrivent :** ${neufs.map((n) => `\`#include <${n}>\``).join(', ')}. Chacune sera présentée seule, juste avant la première étape qui l’emploie : jamais deux lignes nouvelles d’un coup.`
            : '**Aucune fonction nouvelle ici :** ce chapitre n’emploie que des fonctions déjà présentées. Tout l’effort porte sur la façon d’écrire le programme.',
          '**Comment avancer :** une étape à la fois. Lis l’explication, lance le programme, regarde ce qu’on doit voir, puis fais l’essai proposé. Si quelque chose t’échappe, l’étape d’avant contient la pièce qui manque.',
        ],
        code: `// ---- Chapitre ${chapitre} : ${CHAPITRES[chapitre].replace(/[’']/g, "'")} ----
// L'entrée du chapitre : rien de neuf dans ce programme. Il annonce la suite.

#include <texte>   // écrit un texte à l’écran

int main() {
  texte(1, 7, "CHAPITRE ${chapitre}");   // le numéro du chapitre
  texte(1, 9, "C EST PARTI");

  while (true) {
    image();
  }
}
`,
        aVoir: `CHAPITRE ${chapitre}, puis C EST PARTI.`,
        controle: (c) => [
          [`le chapitre ${chapitre} s’annonce`, c.mot(1, 7, `CHAPITRE ${chapitre}`.length) === `CHAPITRE ${chapitre}`],
        ],
      } })
    }
    for (const nom of inclusionsDe(etape)) connus.add(nom)
  })
  for (const { avant, etape } of entrees.reverse()) parcours.splice(avant, 0, etape)
}

/**
 * Le parcours : les leçons (`ecrites`, `tutoriels`) et le cours, en une suite.
 */
export function construireLeParcours(ecrites, tutoriels) {
  const lecons = [...ecrites, ...tutoriels]
  const tutos = new Map()
  for (const l of lecons) {
    const nom = fonctionDuTuto(l)
    if (nom) tutos.set(nom, l)
  }
  const ordinaires = lecons.filter((l) => !fonctionDuTuto(l))

  /* 1. Les chapitres, dans l'ordre du parcours, chacun dans l'ordre de sa série. */
  const base = []
  CHAPITRES_DU_PARCOURS.forEach(([serie, numero], chapitre) => {
    const source = serie === 'lecons' ? ordinaires : COURS
    for (const l of source) {
      if (l.difficulte !== numero) continue
      const niveau = serie === 'lecons' ? Math.max(l.difficulte, 1) : DIFFICULTE_DU_COURS[numero]
      base.push({ ...l, difficulte: chapitre, niveau, provenance: l.provenance ?? (serie === 'cours' ? 'cours' : 'lecon') })
    }
  })

  /* 2. Les tutos, chacun juste avant la première étape qui emploie sa fonction. */
  const parcours = []
  const vues = new Set()
  let pourquoiPlace = false
  const placer = (nom, chapitre) => {
    if (vues.has(nom) || !tutos.has(nom)) return
    vues.add(nom)
    const tuto = tutos.get(nom)
    for (const autre of inclusionsDe(tuto)) if (autre !== nom) placer(autre, chapitre)
    if (!pourquoiPlace) {
      parcours.push(POURQUOI_INCLURE)
      pourquoiPlace = true
    }
    parcours.push(etapeDuTuto(tuto, chapitre))
  }
  for (const etape of base) {
    for (const nom of inclusionsDe(etape)) placer(nom, etape.difficulte)
    parcours.push(etape)
  }

  /* 3. Les tutos que rien n'emploie : la fin du chapitre 0, comme un dictionnaire. */
  /* Rangés eux aussi selon ce qu'ils emploient : panneau() avant cacherPanneau(). */
  const restants = []
  const ranger = (nom) => {
    if (vues.has(nom) || !tutos.has(nom)) return
    vues.add(nom)
    for (const autre of inclusionsDe(tutos.get(nom))) if (autre !== nom) ranger(autre)
    restants.push(nom)
  }
  for (const nom of tutos.keys()) ranger(nom)

  /*
   * Un tuto qui emploie une fonction présentée plus loin dans le parcours
   * (cacherPanneau() a besoin de panneau()) vient juste après l'étape où tout
   * ce qu'il emploie est connu — comme une suite de cette étape-là.
   */
  const dejaVues = (jusqua) => {
    const noms = new Set()
    for (let i = 0; i <= jusqua; i++) for (const n of inclusionsDe(parcours[i])) noms.add(n)
    return noms
  }
  const dictionnaire = []
  for (const nom of restants) {
    const besoins = inclusionsDe(tutos.get(nom)).filter((autre) => autre !== nom)
    const enDictionnaire = dictionnaire.map((t) => fonctionDuTuto(t))
    const finDuZero = parcours.findIndex((l) => l.difficulte > 0)
    const connus = dejaVues(finDuZero - 1)
    if (besoins.every((b) => connus.has(b) || enDictionnaire.includes(b))) {
      dictionnaire.push({ ...tutos.get(nom) })
      continue
    }
    /* La première étape où tout ce qu'il emploie est connu — en UN passage :
       recompter depuis le début à chaque pas (dejaVues) coûtait des centaines
       de milliers de lectures dès qu'un tuto attendait le chapitre 6, et
       retardait de deux secondes l'ouverture de la page. Même résultat. */
    let ou = 0
    const vus = new Set()
    while (ou < parcours.length) {
      for (const n of inclusionsDe(parcours[ou])) vus.add(n)
      if (besoins.every((b) => vus.has(b))) break
      ou++
    }
    parcours.splice(ou + 1, 0, etapeDuTuto(tutos.get(nom), parcours[Math.min(ou, parcours.length - 1)].difficulte))
  }

  ajouterLesEntreesDeChapitre(parcours)

  /* Les autres : la fin du chapitre 0, comme un dictionnaire. */
  if (dictionnaire.length) {
    dictionnaire.forEach((tuto, k) => {
      if (k === 0) tuto.partie = 'Les fonctions de la console, une par une'
      else delete tuto.partie
    })
    const finDuZero = parcours.findIndex((l) => l.difficulte > 0)
    parcours.splice(finDuZero < 0 ? parcours.length : finDuZero, 0, ...dictionnaire)
  }
  return parcours
}

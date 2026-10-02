/**
 * Les fonctions d'une leçon, et le tuto de chacune.
 *
 * Chaque programme commence par ses « #include » : la liste de ce qu'il
 * emploie de la console. La partie L du chapitre 0 a un tuto par « #include »
 * (« La fonction texte() — écrire un mot »…). Ce module relie les deux :
 *
 *   inclusionsDe(lecon)          ['poser', 'ALPHABET', 'texte']
 *   tutosDesFonctions(LECONS)    'texte' → la place du tuto de texte()
 *   leconsQuiEmploient(LECONS)   'texte' → les places des leçons qui l'incluent
 *
 * Rien n'est écrit à la main : les « #include » sont lus dans le code de la
 * leçon, et le tuto d'une fonction se reconnaît à la première ligne de son
 * programme, « // ---- #include <texte> : … ». Une leçon qui change, ou un
 * tuto qui s'ajoute, se relie tout seul.
 */

const INCLUSION = /^[ \t]*#\s*include\s*<\s*([A-Za-z_0-9]+)\s*>/gm
const EN_TETE_DU_TUTO = /^\/\/ ---- #include <([A-Za-z_0-9]+)> :/

/** Les noms inclus par la leçon, dans l'ordre, sans doublon (ses fichiers voisins compris). */
export function inclusionsDe(lecon) {
  const textes = [lecon.code ?? '', ...Object.values(lecon.fichiers ?? {})]
  const noms = []
  for (const texte of textes) {
    for (const [, nom] of texte.matchAll(INCLUSION)) if (!noms.includes(nom)) noms.push(nom)
  }
  return noms
}

/** Le nom de la fonction dont cette leçon est LE tuto, ou null. */
export function fonctionDuTuto(lecon) {
  return (lecon.code ?? '').match(EN_TETE_DU_TUTO)?.[1] ?? null
}

/** Nom → place (dans `liste`) du tuto de cette fonction. */
export function tutosDesFonctions(liste) {
  const tutos = new Map()
  liste.forEach((lecon, i) => {
    const nom = fonctionDuTuto(lecon)
    if (nom && !tutos.has(nom)) tutos.set(nom, i)
  })
  return tutos
}

/** Nom → places des leçons qui l'incluent, sans compter les tutos eux-mêmes. */
export function leconsQuiEmploient(liste) {
  const emplois = new Map()
  liste.forEach((lecon, i) => {
    if (fonctionDuTuto(lecon)) return
    for (const nom of inclusionsDe(lecon)) {
      if (!emplois.has(nom)) emplois.set(nom, [])
      emplois.get(nom).push(i)
    }
  })
  return emplois
}

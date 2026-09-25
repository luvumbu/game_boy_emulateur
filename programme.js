/**
 * Où poser un morceau dans le programme.
 *
 * Les ateliers écrivent dans le texte : une tuile, un perso, un air. Ils ont
 * tous besoin de la même réponse à la même question — « à quel endroit ? » —
 * et cette réponse n'a rien à voir avec les dessins ni avec les notes. Elle
 * est ici, une seule fois : trois copies d'une règle de placement, c'est
 * l'assurance que deux d'entre elles seront un jour fausses.
 */

/**
 * Où commence le programme, une fois passé son en-tête.
 *
 * L'en-tête, c'est tout ce qui précède la première ligne de code : les lignes
 * vides, les commentaires — d'une barre comme d'une étoile — et les
 * « #include » qui vont chercher les fichiers voisins.
 *
 * Le PREMIER dessin s'écrivait tout en haut du fichier, avant ce commentaire
 * qui nomme le jeu. Le programme ne s'ouvrait plus sur ce qu'il fait, mais sur
 * seize rangées de guillemets, et sa propre présentation se retrouvait
 * enterrée au milieu. On pose donc SOUS l'en-tête, jamais au-dessus.
 *
 * @param {string} source le programme entier
 * @returns {number} l'indice où poser ce qui vient s'ajouter
 */
export function apresLEnTete(source) {
  const LIGNE_VIDE = /^[ \t]*\r?\n/
  const UNE_BARRE = /^[ \t]*(?:\/\/|#include\b)[^\n]*(?:\r?\n|$)/
  const UNE_ETOILE = /^[ \t]*\/\*[\s\S]*?\*\/[ \t]*(?:\r?\n|$)/

  let ou = 0
  while (ou < source.length) {
    const reste = source.slice(ou)
    const pris = reste.match(LIGNE_VIDE) ?? reste.match(UNE_BARRE) ?? reste.match(UNE_ETOILE)
    if (!pris) break
    ou += pris[0].length
  }
  return ou
}

/**
 * Poser un bloc dans le programme : à la suite de ses pareils, ou sous l'en-tête.
 *
 * `derniers` est la fin du dernier bloc du même genre — la dernière tuile pour
 * une tuile, le dernier air pour un air. Il n'y en a pas encore : le bloc va
 * sous l'en-tête, et le programme garde sa présentation en premier.
 */
export function poserDansLeProgramme(source, bloc, finDuDernier = null) {
  if (finDuDernier !== null) {
    return source.slice(0, finDuDernier) + '\n\n' + bloc + source.slice(finDuDernier)
  }

  const ou = apresLEnTete(source)
  const dessous = source.slice(ou)
  /* Une ligne vide entre ce qu'on pose et le code qui suit — mais pas de
     ligne vide en trop à la fin d'un fichier qui n'avait que son en-tête. */
  return source.slice(0, ou) + bloc + (dessous ? '\n\n' + dessous : '\n')
}

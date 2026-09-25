/**
 * Sauver l'état de la console, et y revenir — au cycle près.
 *
 * Une sauvegarde de jeu (la pile de la cartouche) ne retient que ce que le
 * programme a décidé d'écrire. Un ÉTAT retient TOUT : les registres du
 * processeur, les mémoires, l'écran, le son, les minuteries. On le reprend,
 * et la partie repart exactement de là — même au milieu d'un saut.
 *
 * L'émulateur (« emulateur.js ») est un fichier engendré, qu'on ne retouche
 * pas à la main. On le photographie donc DU DEHORS : on parcourt ses objets,
 * on copie chaque nombre et chaque tableau d'octets, et l'on recopie le tout
 * en place au retour. Les fonctions ne sont pas des états : elles restent.
 *
 * Un même objet atteint par deux chemins (le processeur connaît la mémoire,
 * l'écran aussi) n'est pris qu'UNE fois, par le premier chemin — et le retour
 * le parcourt dans le même ordre, donc au même endroit.
 */

/** Une copie de tout ce que la console tient à cet instant. */
export function capturer(gb) {
  const vus = new Set()
  const copier = (valeur) => {
    if (typeof valeur === 'function') return undefined
    if (valeur === null || typeof valeur !== 'object') return valeur
    if (ArrayBuffer.isView(valeur)) return valeur.slice()
    if (vus.has(valeur)) return undefined
    vus.add(valeur)
    if (Array.isArray(valeur)) return valeur.map(copier)
    const copie = {}
    for (const cle of Object.keys(valeur)) {
      const c = copier(valeur[cle])
      if (c !== undefined) copie[cle] = c
    }
    return copie
  }
  return copier(gb)
}

/** Remet la console dans l'état capturé — en place, sans rien recréer. */
export function restaurer(gb, etat) {
  const vus = new Set()

  const remettre = (cible, source) => {
    if (!cible || typeof cible !== 'object' || vus.has(cible)) return
    vus.add(cible)
    for (const cle of Object.keys(source)) {
      const neuf = source[cle]
      const actuel = cible[cle]

      if (ArrayBuffer.isView(neuf)) {
        if (ArrayBuffer.isView(actuel) && actuel.length === neuf.length) actuel.set(neuf)
        else cible[cle] = neuf.slice()
      } else if (Array.isArray(neuf)) {
        if (!Array.isArray(actuel)) { cible[cle] = structuredClone(neuf); continue }
        actuel.length = neuf.length
        neuf.forEach((element, i) => {
          if (element && typeof element === 'object' && actuel[i] && typeof actuel[i] === 'object') remettre(actuel[i], element)
          else actuel[i] = ArrayBuffer.isView(element) ? element.slice() : element
        })
      } else if (neuf && typeof neuf === 'object') {
        if (actuel && typeof actuel === 'object') remettre(actuel, neuf)
        else cible[cle] = structuredClone(neuf)
      } else {
        cible[cle] = neuf
      }
    }
  }

  remettre(gb, etat)
}

/**
 * Une cartouche, ou DEUX — le Game Boy d'un côté, le Game Boy Color de l'autre.
 *
 * Un programme qui pose des couleurs et qu'on veut jouable partout tenait
 * jusqu'ici dans un seul fichier : la cartouche portait ses palettes, la vieille
 * console les ignorait poliment. Ça marche, mais ça mêle les deux — le « .gb »
 * emportait des centaines d'octets d'écritures qui n'y font rien, et l'on ne
 * pouvait pas dire ce que la Game Boy d'origine exécutait vraiment.
 *
 * « les deux » fabrique donc DEUX fichiers :
 *
 *   mon_jeu.gbc    $0143 = $C0    toutes les couleurs, une Game Boy Color exigée
 *   mon_jeu.gb     $0143 = $00    pas une seule instruction de couleur
 *
 * Le même programme, compilé deux fois : les dessins, le son, les boutons et
 * la logique sont identiques — c'est le seul côté couleur qui s'en va.
 *
 * **Un programme sans couleur ne donne qu'un seul fichier.** Deux cartouches
 * identiques n'apprendraient rien à personne, et le « .gb » d'un programme en
 * quatre nuances tourne déjà sur les deux consoles.
 */

import { compiler } from './emetteur.js'
import { fabriquer } from './cartouche.js'

/** Le rendu du compilateur, plus la cartouche assemblée et son extension. */
function enveloppe(rendu, titre, pour) {
  return {
    ...rendu,
    pour, // 'gb' ou 'gbc'
    extension: pour === 'gbc' ? '.gbc' : '.gb',
    rom: fabriquer(rendu.octets, rendu.base, titre, rendu.vecteurVBlank, rendu.couleur),
  }
}

/**
 * Les cartouches d'un programme, dans l'ordre où on les montre.
 *
 * La PREMIÈRE est celle qu'on fait tourner et qu'on photographie : la version
 * en couleur quand il y en a une, puisque c'est la plus riche des deux.
 *
 * @param arbre   le programme analysé
 * @param titre   ce qui sera gravé dans l'en-tête, onze caractères au plus
 * @param cible   'gb', 'gbc' ou 'les-deux'
 * @returns {Array} une entrée, ou deux
 */
export function fabriquerLesCartouches(arbre, titre, cible = 'les-deux') {
  /* Une console demandée seule : une seule cartouche, et rien ne change. */
  if (cible === 'gb' || cible === 'gbc') {
    return [enveloppe(compiler(arbre, { cible }), titre, cible)]
  }

  /*
   * « les deux ». On compile d'abord EN COULEUR.
   *
   * C'est la seule des deux compilations qui ne peut rien refuser, et c'est
   * elle qui répond à la question dont tout dépend : ce programme pose-t-il
   * une seule couleur ?
   */
  const enCouleur = compiler(arbre, { cible: 'gbc' })

  /*
   * Pas une seule : un seul fichier.
   *
   * Le code est le même à l'octet près — « cible » ne change que l'en-tête
   * quand aucune couleur n'est posée. On remet donc l'octet d'une cartouche
   * d'origine plutôt que de tout recompiler pour le seul plaisir de l'obtenir.
   */
  if (!enCouleur.poseDesCouleurs) {
    return [enveloppe({ ...enCouleur, couleur: 0, cible: 'les-deux' }, titre, 'gb')]
  }

  /* Et la même chose, sans un octet de couleur. */
  const enNuances = compiler(arbre, { cible: 'gb', couleursOmises: true })

  return [enveloppe(enCouleur, titre, 'gbc'), enveloppe(enNuances, titre, 'gb')]
}

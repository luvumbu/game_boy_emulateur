/**
 * LA cartouche d'un programme — Game Boy OU Game Boy Color, jamais les deux.
 *
 * La règle est dans « consoles.js » :
 *
 *   mon_jeu.gb     $0143 = $00    Game Boy, 4 nuances, pas une instruction de couleur
 *   mon_jeu.gbc    $0143 = $C0    Game Boy Color, toutes les couleurs
 *
 * Il y a eu ici une troisième voie, « les deux », qui fabriquait les DEUX
 * fichiers d'un même programme — le « .gb » en ôtant les couleurs en silence.
 * Elle a été retirée : on ne savait plus lequel on distribuait, ni pourquoi
 * les couleurs manquaient sur l'un. Un programme donne UNE cartouche.
 */

import { compiler } from './emetteur.js'
import { fabriquer } from './cartouche.js'
import { CONSOLES, verifierLaConsole } from './consoles.js'

/**
 * Compile un programme et assemble sa cartouche.
 *
 * @param arbre    le programme analysé
 * @param titre    ce qui sera gravé dans l'en-tête, quinze caractères au plus
 * @param choix    'gb' ou 'gbc' ; absent, c'est le programme qui décide : une
 *                 seule couleur posée, et c'est une Game Boy Color
 * @param source   { principal, fichiers: [[nom, texte], …] } : le programme
 *                 d'origine, gravé dans la cartouche
 * @returns le rendu du compilateur, plus `pour` ('gb' | 'gbc'), `extension`
 *          et `rom`
 */
export function fabriquerLaCartouche(arbre, titre, choix = null, source = null) {
  if (choix !== null) verifierLaConsole(choix)
  const rendu = compiler(arbre, choix ? { cible: choix } : {})
  return {
    ...rendu,
    pour: rendu.console,
    extension: CONSOLES[rendu.console].extension,
    rom: fabriquer(rendu.octets, rendu.base, titre, rendu.vecteurVBlank, rendu.couleur, source),
  }
}

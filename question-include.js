/**
 * « Il manque un #include : l'ajouter ? » — la question douce.
 *
 * Pas de fenêtre qui s'impose au milieu de l'écran : une petite boîte, sous
 * l'erreur, montre les lignes qui manquent et propose deux boutons.
 *
 *   ✚ Oui, l'ajouter tout en haut   → les lignes vont en première ligne du code
 *   Non merci                        → la boîte disparaît ; le petit bouton
 *                                       rouge reste là pour plus tard
 *
 * Après un « Non merci », la même question ne revient pas à chaque
 * compilation : seul le bouton rouge reste. Elle revient si ce qui manque
 * change (une autre fonction, par exemple).
 *
 * Un CLIC (simple ou double) sur le message d'erreur fait la même chose que
 * « Oui ».
 *
 * Employé par l'atelier (index.html) et le tuto (tuto.html).
 */

import { lignesDInclusion } from './compilateur/inclusions-auto.js'

let refusees = ''

/**
 * etat    : la boîte de l'erreur, où poser la question
 * noms    : les noms à inclure qui manquent (« poser », « texte »…)
 * ajouter : ce qui écrit les lignes en haut du code et recompile
 * bouton  : le bouton rouge, caché tant que la question est posée
 */
export function poserLaQuestion(etat, noms, ajouter, bouton) {
  /* Les lignes ajoutées par le bouton rouge : la prochaine fois, on redemande. */
  bouton.addEventListener('click', () => { refusees = '' })
  cliquable(etat, ajouter)
  if (!noms.length) return
  const cle = noms.join(',')
  if (cle === refusees) return

  bouton.hidden = true
  const boite = document.createElement('div')
  boite.className = 'question-include'

  const phrase = document.createElement('span')
  phrase.textContent = noms.length > 1
    ? `Il manque ces ${noms.length} lignes. Les ajouter tout en haut du code ?`
    : 'Il manque cette ligne. L’ajouter tout en haut du code ?'
  const lignes = document.createElement('code')
  lignes.textContent = lignesDInclusion(noms).join('\n')

  const oui = document.createElement('button')
  oui.type = 'button'
  oui.className = 'principal'
  oui.textContent = noms.length > 1 ? '✚ Oui, les ajouter tout en haut' : '✚ Oui, l’ajouter tout en haut'
  oui.addEventListener('click', () => { refusees = ''; ajouter() })

  const non = document.createElement('button')
  non.type = 'button'
  non.textContent = 'Non merci'
  non.addEventListener('click', () => {
    refusees = cle
    boite.remove()
    bouton.hidden = false
  })

  boite.append(phrase, lignes, oui, non)
  etat.append(boite)
}

/*
 * Un clic sur le message d'erreur lui-même fait comme « Oui ».
 *
 * Le message est le premier morceau de texte de la boîte d'erreur. On
 * l'enveloppe dans un <span> qui écoute le clic : à la compilation suivante,
 * la page réécrit la boîte, et le <span> disparaît avec l'ancien message. Un
 * message qui ne parle pas d'un #include n'est donc jamais cliquable.
 *
 * Le double-clic marche aussi, sans rien de plus : son premier clic suffit,
 * et le second tombe sur un message déjà remplacé.
 */
function cliquable(etat, ajouter) {
  const texte = etat.firstChild
  if (!texte || texte.nodeType !== Node.TEXT_NODE) return
  const message = document.createElement('span')
  message.className = 'message-ajoutable'
  message.title = 'Clic : ajouter les #include qui manquent, tout en haut du code'
  etat.replaceChild(message, texte)
  message.append(texte)
  message.addEventListener('click', () => {
    getSelection()?.removeAllRanges()
    refusees = ''
    ajouter()
  })
}

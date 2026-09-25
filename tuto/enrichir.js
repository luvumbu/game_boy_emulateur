/**
 * Le texte des leçons, tel qu'il s'affiche.
 *
 * Les explications sont écrites en texte simple, avec `du code` entre accents
 * graves et **du gras** entre étoiles. On les transforme en balises ici plutôt
 * que d'écrire du HTML dans les leçons : une leçon doit rester lisible dans
 * son fichier, et relisible par quelqu'un qui ne connaît pas le HTML.
 *
 * Ce module est le SEUL endroit où cette transformation existe. Elle a été
 * écrite trois fois — dans la page du tutoriel, dans l'atelier, dans le
 * livret — et les trois copies ont fini par ne plus dire la même chose : l'une
 * d'elles ne savait pas rendre « **`Tuile`** », et affichait les accents
 * graves au lecteur.
 */

/** Ce qui ne doit surtout pas être pris pour des balises. */
export const echapper = (texte) => texte
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')

/**
 * Le code entre accents graves, dans un morceau déjà échappé.
 *
 * Isolé ici parce qu'il sert DEUX fois : sur le texte ordinaire, et à
 * l'intérieur du gras.
 */
const codeDedans = (texte) => texte
  .split(/(`[^`]+`)/g)
  .map((morceau) => (morceau.startsWith('`') && morceau.endsWith('`') && morceau.length > 1
    ? `<code>${morceau.slice(1, -1)}</code>`
    : morceau))
  .join('')

/**
 * Rend le HTML d'un paragraphe de leçon.
 *
 * Le texte est échappé D'ABORD : ce qui suit ne fabrique que les balises que
 * l'on décide, et rien de ce qui est écrit dans une leçon ne peut en produire
 * d'autres.
 *
 * Le code se rend AUSSI À L'INTÉRIEUR DU GRAS. Les deux marques s'écrivent
 * ensemble tout naturellement — « **Un `Perso` de seize compte pour quatre** »,
 * « **dans le `poser` lui-même** » — et seul le cas où l'accent grave enveloppe
 * tout le gras était traité. Partout ailleurs, le lecteur voyait les accents
 * graves à l'écran, dans treize leçons du dépôt : c'est le genre de défaut qui
 * se lit tous les jours sans que personne ne le signale, parce qu'il ne casse
 * rien.
 */
export function enrichir(texte) {
  return echapper(texte)
    .split(/(`[^`]+`|\*\*[^*]+\*\*)/g)
    .map((morceau) => {
      if (morceau.startsWith('`') && morceau.endsWith('`')) {
        return `<code>${morceau.slice(1, -1)}</code>`
      }

      if (morceau.startsWith('**') && morceau.endsWith('**')) {
        return `<strong>${codeDedans(morceau.slice(2, -2))}</strong>`
      }

      return morceau
    })
    .join('')
}

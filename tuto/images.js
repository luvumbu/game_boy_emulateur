/*
 * LA SÉRIE 3 : LES IMAGES — une image par leçon.
 *
 *   3.01 le Père Noël, 3.02 le bonhomme de neige, 3.03 le sapin… puis les
 *   pièces des jeux : le pion et la dame, les six pièces des échecs, et les
 *   symboles des cartes.
 *
 * Chaque image est dessinée UNE fois, en 16 × 16 (bibliotheque.js, IMAGES).
 * La leçon la montre à sa taille, puis trois fois plus grande avec la taille
 * en dernier argument : sprite16(4, 88, 36, PERE_NOEL, 3). Le compilateur la
 * redessine en 48 × 48 (compilateur/agrandir.js) ; il n'y a toujours qu'un
 * dessin dans le programme.
 *
 * Les jeux de la série — Puissance 4, Dames, Échecs, Cartes (exemples/) — sont
 * faits de ces images.
 *
 * Aucun « #include » nouveau : texte, sprite16 et Perso sont déjà présentés.
 */

import { IMAGES } from '../bibliotheque.js'
import { CHAPITRE_DES_IMAGES } from './parcours.js'

/* Où se posent les deux images : la petite à gauche, la grande (48 × 48) à droite. */
const PETITE = { x: 24, y: 56 }
const GRANDE = { x: 88, y: 36 }
const LIGNE_DU_NOM = 12   // en cases de 8 pixels : 96, sous la grande image (36 + 48 = 84)

/** Ce que l'écran écrit sous les images : des majuscules, sans accent, 20 cases au plus. */
const motDe = (titre) => titre
  .replace(/^(Le |La |L’|Les )/, '').replace(/« | »/g, '')
  .normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’']/g, ' ')
  .replace(/\+/g, 'PLUS ')                 // la police n'a pas de « + »
  .toUpperCase().replace(/[^A-Z0-9 ]/g, '').replace(/ +/g, ' ').trim().slice(0, 20)

const fichierDuDessin = (im) => `// perso_${im.nom}.cpp : ${im.titre.toLowerCase()} (16 × 16) — juste le dessin, écrit UNE fois.
// « # » le plus sombre : le contour.   « + » moyen.   « - » clair.
// « . » le plus clair : dans un personnage, c'est le TRANSPARENT (on voit le fond).

Perso ${im.nom} = {
${im.rangees.map((r) => `  "${r}",`).join('\n')}
};
`

function programme(im, mot) {
  const colonne = Math.floor((20 - mot.length) / 2)
  return `// ---- ${im.numero} ${im.titre} ----
// Dessiné UNE fois, en 16 × 16. À gauche à sa taille, à droite trois fois plus grand.

#include <texte>                // texte() : écrire un mot
#include <sprite16>             // sprite16() : poser un dessin de 16 × 16 — et l'agrandir
#include <Perso>                // Perso : un dessin de 16 × 16
#include "perso_${im.nom}.cpp"  // le dessin, dans son fichier

int main() {
  sprite16(0, ${PETITE.x}, ${PETITE.y}, ${im.nom});      // taille 1 : les lutins 0 à 3
  sprite16(4, ${GRANDE.x}, ${GRANDE.y}, ${im.nom}, 3);   // taille 3 : 48 × 48, à partir du lutin 4
  texte(${colonne}, ${LIGNE_DU_NOM}, "${mot}");

  while (true) {
    image();
  }
}
`
}

function texte(im, k) {
  const premiere = k === 0
  const lignes = [`**${im.titre} : ${im.quoi}.** Une image de 16 × 16, dessinée **une seule fois**, dans \`perso_${im.nom}.cpp\`.`]
  if (premiere) {
    lignes.push(
      '**Cette série montre des images, une par leçon**, et les jeux qui s’en servent : Puissance 4, Dames, Échecs, et un jeu de cartes (dans le menu des exemples). Le programme est le même d’une leçon à l’autre : seuls changent le dessin et le nom.',
      `**À gauche, l’image à sa taille** : \`sprite16(0, ${PETITE.x}, ${PETITE.y}, ${im.nom})\`, les lutins 0 à 3.`,
      `**À droite, la même, trois fois plus grande** : \`sprite16(4, ${GRANDE.x}, ${GRANDE.y}, ${im.nom}, 3)\`. Le **3**, en dernier argument, est la **taille** : le compilateur redessine l’image en 48 × 48 avant que le jeu ne tourne, en gardant les vrais coins pointus et en arrondissant les marches. C’est la logique du 2.40, écrite directement dans \`sprite16()\`.`,
      '**Combien de lutins ?** 48 × 48, c’est 6 × 6 carrés de 8 : 36 lutins au plus (les carrés vides ne comptent pas), à partir du lutin 4. Avec les 4 de la petite image : 40, tout ce que la console a. Plus grand encore, la forme passe d’elle-même dans le fond de l’écran : il n’y a pas de limite de taille.',
      '**Les petits détails** (un œil d’un pixel) restent petits : l’agrandissement suit les formes, il n’invente rien. Plus le dessin de 16 × 16 est net, plus le grand est beau.',
    )
  } else {
    lignes.push(`**Le programme est celui du 3.01** : seuls changent le fichier du dessin et le nom. \`sprite16(4, ${GRANDE.x}, ${GRANDE.y}, ${im.nom}, 3)\` la montre trois fois plus grande.`)
  }
  lignes.push(premiere
    ? '**Essaie :** change le `3` en `2`, puis en `5` (elle passe alors dans le fond, et le premier argument ne sert plus). Puis modifie un pixel dans le dessin : les deux tailles changent ensemble.'
    : '**Essaie :** change le `3` en `2` ; ou modifie le dessin, et regarde les deux tailles changer ensemble.')
  return lignes
}

export const LECONS_DES_IMAGES = IMAGES.map((im, k) => {
  const mot = motDe(im.titre)
  const colonne = Math.floor((20 - mot.length) / 2)
  return {
    titre: im.titre,
    numero: im.numero,
    serie: 3,
    difficulte: CHAPITRE_DES_IMAGES,
    niveau: 3,
    provenance: 'images',
    ...(k > 0 ? { suite: true } : {}),
    idee: `${im.numero} : ${im.titre.toLowerCase()} — ${im.quoi}. Dessiné une fois en 16 × 16, montré à sa taille puis trois fois plus grand avec sprite16(…, 3).`,
    texte: texte(im, k),
    fichiers: { [`perso_${im.nom}.cpp`]: fichierDuDessin(im) },
    code: programme(im, mot),
    aVoir: `${im.titre} deux fois : petit à gauche, trois fois plus grand à droite, et ${mot} dessous.`,
    controle: (c) => {
      c.avancer(10)
      return [
        [`taille 1 : l’image en (${PETITE.x}, ${PETITE.y})`, c.lutin(0).x === PETITE.x && c.lutin(0).y === PETITE.y],
        ['taille 3 : des lutins dans le carré de 48 à droite', c.lutin(4).x >= GRANDE.x && c.lutin(4).x < GRANDE.x + 48 && c.lutin(4).y >= GRANDE.y && c.lutin(4).y < GRANDE.y + 48, ` (lutin 4 en ${c.lutin(4).x}, ${c.lutin(4).y})`],
        [`le nom est écrit : ${mot}`, c.mot(colonne, LIGNE_DU_NOM, mot.length) === mot],
      ]
    },
  }
})

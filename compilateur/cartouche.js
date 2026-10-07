/**
 * Assemble les 32 Ko d'une cartouche autour du code compilé.
 *
 * Une Game Boy ne démarre pas sur n'importe quoi : elle attend un saut à
 * `$0100`, un logo Nintendo recopié à l'octet près à partir de `$0104`, un
 * titre, et une somme de contrôle d'en-tête. Un seul octet faux, et la console
 * s'arrête sur son écran de démarrage sans rien dire.
 *
 * Elle attend aussi ses vecteurs d'interruption, tout en bas de la cartouche :
 * le VBlank en `$0040`. C'est là que le matériel saute, soixante fois par
 * seconde, dès qu'on les a autorisées.
 */

import { graverLeSource } from './source-gravee.js'

/** Le logo, tel que la console le vérifie. Il ne se paraphrase pas. */
const LOGO = [
  0xce, 0xed, 0x66, 0x66, 0xcc, 0x0d, 0x00, 0x0b, 0x03, 0x73, 0x00, 0x83, 0x00, 0x0c, 0x00, 0x0d,
  0x00, 0x08, 0x11, 0x1f, 0x88, 0x89, 0x00, 0x0e, 0xdc, 0xcc, 0x6e, 0xe6, 0xdd, 0xdd, 0xd9, 0x99,
  0xbb, 0xbb, 0x67, 0x63, 0x6e, 0x0e, 0xec, 0xcc, 0xdd, 0xdc, 0x99, 0x9f, 0xbb, 0xb9, 0x33, 0x3e,
]

const TAILLE = 0x8000

/**
 * Rend la cartouche complète, prête à écrire sur disque.
 * `code` est le programme compilé, à poser à `base`.
 *
 * `source`, s'il est donné — { principal, fichiers } —, est gravé au bout de
 * la cartouche (voir « source-gravee.js ») ; ce qui en est advenu est noté
 * sur la cartouche rendue, dans `rom.sourceGravee`.
 */
export function fabriquer(code, base, titre, vecteurVBlank, couleur = 0, source = null) {
  const rom = new Uint8Array(TAILLE)

  /*
   * Le VBlank saute en $0040 — c'est le matériel qui le décide, et cette
   * adresse-là est libre : l'en-tête ne commence qu'en $0100. On y pose un
   * saut vers la routine du programme.
   *
   * L'oublier ne donnerait pas une cartouche un peu moins bonne : elle
   * sauterait sur des octets nuls soixante fois par seconde, et la console
   * partirait au hasard sans un message. C'est pourquoi ce n'est pas un
   * argument facultatif — mieux vaut refuser de fabriquer.
   */
  if (typeof vecteurVBlank !== 'number') {
    throw new Error(
      "fabriquer() veut l'adresse du VBlank, celle que compiler() rend dans " +
        '« vecteurVBlank ». Sans elle, la cartouche saute sur des octets nuls.',
    )
  }
  rom[0x0040] = 0xc3 // jp
  rom[0x0041] = vecteurVBlank & 0xff
  rom[0x0042] = (vecteurVBlank >> 8) & 0xff

  /* Le point d'entrée : la console arrive ici, et saute au programme. */
  rom[0x0100] = 0x00 // nop
  rom[0x0101] = 0xc3 // jp base
  rom[0x0102] = base & 0xff
  rom[0x0103] = (base >> 8) & 0xff

  rom.set(LOGO, 0x0104)

  /*
   * Le titre tient sur quinze caractères, et non seize.
   *
   * Sur une Game Boy d'origine il en occupait seize, de $0134 à $0143. La
   * Game Boy Color a repris ce dernier octet pour son drapeau : un titre de
   * seize lettres l'écraserait, ou le drapeau mangerait la dernière lettre.
   * Quinze pour tout le monde règle les deux cas.
   */
  const nom = titre.toUpperCase().slice(0, 15)
  for (let i = 0; i < nom.length; i++) rom[0x0134 + i] = nom.charCodeAt(i)

  /*
   * $0143 — pour quelle console.
   *
   *   $00  Game Boy, 4 nuances
   *   $C0  Game Boy Color
   *
   * Deux valeurs, pas trois : la règle est dans « consoles.js », et c'est le
   * compilateur qui donne l'octet (« rendu.couleur »). Le $80 des cartouches
   * du commerce (« profite de la couleur, marche aussi sans ») n'est jamais
   * écrit ici — l'un OU l'autre.
   */
  rom[0x0143] = couleur & 0xff

  /*
   * Une cartouche à pile, avec sa petite mémoire.
   *
   * Elle était déclarée « ROM seule » : un meilleur score s'effaçait à
   * l'extinction, et il n'y avait aucun moyen de faire autrement. Le
   * contrôleur MBC1 et ses huit kilo-octets sauvegardés ne coûtent rien tant
   * qu'on ne s'en sert pas — la console ne change pas de comportement — et
   * ils rendent « sauver() » possible.
   */
  rom[0x0147] = 0x03 // MBC1, mémoire de sauvegarde, pile
  rom[0x0148] = 0x00 // 32 Ko de programme : un seul banc, jamais changé
  rom[0x0149] = 0x02 // 8 Ko sauvegardés

  rom.set(code, base)

  /* Le programme d'origine, dans la place libre — AVANT les sommes, qui
     comptent toute la cartouche. */
  const sourceGravee = source ? graverLeSource(rom, base + code.length, source) : null

  /* La somme de l'en-tête. Le matériel la vérifie ; elle doit être juste. */
  let somme = 0
  for (let i = 0x0134; i <= 0x014c; i++) somme = (somme - rom[i] - 1) & 0xff
  rom[0x014d] = somme

  /* Celle de la cartouche entière, que la console ne vérifie pas — mais que
     les outils lisent, et qu'il serait négligent de laisser fausse. */
  let totale = 0
  for (let i = 0; i < TAILLE; i++) {
    if (i === 0x014e || i === 0x014f) continue
    totale = (totale + rom[i]) & 0xffff
  }
  rom[0x014e] = (totale >> 8) & 0xff
  rom[0x014f] = totale & 0xff

  if (sourceGravee) rom.sourceGravee = sourceGravee
  return rom
}

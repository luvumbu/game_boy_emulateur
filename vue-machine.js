/**
 * Voir ce que la console exécute vraiment.
 *
 * Le programme est en C++ ; la cartouche, elle, ne contient que des
 * instructions. Ce module montre les secondes, avec — quand la cartouche vient
 * d'être compilée ici — les NOMS du premier : « ldh a, [posX] », « call
 * fn_sauter », « jr nz, presse_17 ».
 *
 * Il faut le dire franchement : **ceci ne rend pas le C++**. Le compilateur
 * jette les noms, les commentaires et la forme des boucles ; personne ne peut
 * les retrouver dans les octets, parce qu'ils n'y sont jamais entrés. Ce qu'on
 * gagne ici, c'est de voir ce que sa propre ligne de C++ a fabriqué — et cela,
 * aucune autre vue ne le donne.
 */

import { desassembler, enTete } from './desassembleur.js'

/**
 * Construit la table des noms d'un programme compilé.
 *
 * Elle vient du compilateur, qui vient de poser ces adresses. C'est la seule
 * source possible : une cartouche relue sans elle ne peut montrer que des
 * nombres.
 */
export function nomsDuProgramme(rendu) {
  const noms = new Map()

  for (const [nom, adresse] of rendu.variables) noms.set(adresse, nom)

  /* Les routines de la console — elles disent ce que le programme demande à la
     machine, et c'est souvent la ligne la plus parlante du listing. */
  for (const [etiquette, ou] of rendu.etiquettes ?? []) noms.set(rendu.base + ou, etiquette)

  /* Les fonctions écrites par l'utilisateur passent en dernier : leur nom vaut
     mieux que l'étiquette « fn_… » que le compilateur leur a donnée. */
  for (const [nom, signature] of rendu.fonctions) {
    const ou = rendu.etiquettes?.get(signature.etiquette)
    if (ou !== undefined) noms.set(rendu.base + ou, nom + '()')
  }

  return noms
}

/** Où s'arrête le code et où commencent les données d'une cartouche compilée. */
const finDuCode = (rendu) => rendu.etiquettes?.get('Tuiles') ?? rendu.octets.length

/**
 * Écrit le listing dans une zone de la page.
 *
 * `rendu` est ce que le compilateur vient de produire, ou `null` quand la
 * console joue une cartouche venue du dehors — auquel cas on lit les octets
 * tels quels, sans un nom, et l'on doit le dire.
 */
export function montrerLaMachine(zone, { rom, rendu }) {
  zone.textContent = ''

  if (!rom) {
    const rien = document.createElement('p')
    rien.className = 'aide'
    rien.textContent = 'Rien à lire : aucune cartouche n’est chargée.'
    zone.append(rien)
    return
  }

  const entete = enTete(rom)
  const noms = rendu ? nomsDuProgramme(rendu) : new Map()

  /* --- ce que la cartouche dit d'elle-même --- */
  const carte = document.createElement('p')
  carte.className = 'machine-entete'
  carte.innerHTML =
    `<b>${entete.titre || 'sans titre'}</b> — ${entete.romKo} Ko, ${entete.type}. ` +
    `Le programme commence en $${entete.point.toString(16).padStart(4, '0')}.<br>` +
    (rendu
      ? `<span class="avec-noms">${noms.size} noms retrouvés</span> : cette cartouche vient d’être ` +
        'compilée ici, le compilateur sait donc où il a rangé chaque variable et chaque fonction.'
      : '<span class="sans-noms">Aucun nom</span> : cette cartouche vient du dehors. ' +
        'Les noms de son programme ne sont écrits nulle part dedans — la compilation les a jetés, ' +
        'et personne ne peut les rendre.')
  zone.append(carte)

  /* --- le listing --- */
  const lignes = rendu
    ? desassembler(new Uint8Array(rendu.octets), {
      depuis: 0, jusqu: finDuCode(rendu), base: rendu.base, noms,
    })
    : desassembler(rom, { depuis: entete.point, jusqu: Math.min(rom.length, entete.point + 4000), base: 0, noms })

  const listing = document.createElement('pre')
  listing.className = 'machine'

  for (const ligne of lignes) {
    if (ligne.etiquette) {
      const etiquette = document.createElement('b')
      etiquette.className = 'machine-etiquette'
      etiquette.textContent = `\n${ligne.etiquette} :\n`
      listing.append(etiquette)
    }

    const adresse = document.createElement('span')
    adresse.className = 'machine-adresse'
    adresse.textContent = '$' + ligne.adresse.toString(16).padStart(4, '0') + '  '

    const bruts = document.createElement('span')
    bruts.className = 'machine-octets'
    bruts.textContent = ligne.octets.map((o) => o.toString(16).padStart(2, '0')).join(' ').padEnd(9) + '  '

    const texte = document.createElement('span')
    texte.textContent = ligne.veutDire ? ligne.texte.padEnd(26) : ligne.texte

    listing.append(adresse, bruts, texte)

    if (ligne.veutDire) {
      /* Ce qu'une instruction laisse deviner du programme d'origine. C'est une
         ressemblance, pas une traduction — d'où le « ≈ ». */
      const dit = document.createElement('span')
      dit.className = 'machine-veutdire'
      dit.textContent = '  ; ≈ ' + ligne.veutDire
      listing.append(dit)
    }

    listing.append(document.createTextNode('\n'))
  }

  zone.append(listing)

  const compte = document.createElement('p')
  compte.className = 'aide'
  compte.textContent = `${lignes.length} instructions.`
  zone.append(compte)
}

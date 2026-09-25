/**
 * Écrire un programme sur plusieurs fichiers.
 *
 *   #include "dessins.cpp"
 *
 * C'est une directive de **texte**, résolue avant le lexeur : le contenu du
 * fichier prend la place de la ligne, et le compilateur ne voit qu'un seul
 * programme. Un découpage en quatre fichiers rend donc exactement la même
 * cartouche que le fichier collé — à l'octet près, et c'est vérifié.
 *
 * C'est bien ce que fait « #include » en C++ : le préprocesseur colle le
 * fichier, et le compilateur ne voit qu'un texte. Il n'y a donc ni unités de
 * compilation séparées, ni éditeur de liens — un fichier versé deux fois ne
 * l'est qu'une, ce qui rend les gardes d'inclusion inutiles, et les cycles
 * inoffensifs.
 *
 * Ce module ne touche jamais au disque : c'est l'appelant qui fournit les
 * fichiers. La ligne de commande les lit, la page les demande au serveur.
 */

const MOTIF = /^[ \t]*#\s*include\s*(?:"([^"]+)"|<([^>]+)>)[ \t]*$/

/** Les fichiers qu'un programme demande, dans l'ordre, sans doublon. */
export function fichiersDemandes(texte) {
  const demandes = []

  for (const ligne of texte.split('\n')) {
    const coup = ligne.match(MOTIF)
    const nom = coup && (coup[1] ?? coup[2])
    if (nom && !demandes.includes(nom)) demandes.push(nom)
  }

  return demandes
}

/**
 * Assemble le programme principal et tout ce qu'il inclut.
 *
 * `lire(nom)` doit rendre le texte d'un fichier, ou lever une erreur claire.
 * Rend le texte complet et, pour chaque ligne, d'où elle vient — c'est ce qui
 * permet de dire « dessins.js, ligne 7 » plutôt que « ligne 214 » dans un
 * fichier que personne n'a écrit.
 */
export function rassembler(lire, principal) {
  const lignes = []
  const origine = []
  const deja = new Set()

  const verser = (nom) => {
    /*
     * Versé une seule fois, quel que soit le nombre de demandes. C'est ce
     * qu'on veut — deux fichiers qui partagent une même dépendance ne doivent
     * pas la déclarer en double —, et c'est aussi ce qui rend les cycles
     * inoffensifs : un fichier qui reviendrait sur lui-même est déjà dans la
     * liste, et l'on s'arrête là. Il n'y a donc pas de garde-fou séparé
     * contre les cycles : il serait inatteignable.
     */
    if (deja.has(nom)) return

    deja.add(nom)

    const texte = lire(nom)
    const sesLignes = texte.replace(/\r\n/g, '\n').split('\n')

    sesLignes.forEach((ligne, i) => {
      const coup = ligne.match(MOTIF)

      if (coup) {
        verser(coup[1] ?? coup[2])
        return
      }

      lignes.push(ligne)
      origine.push({ fichier: nom, ligne: i + 1 })
    })
  }

  verser(principal)
  return { texte: lignes.join('\n'), origine }
}

/**
 * Réécrit « ligne 214 » en « dessins.js, ligne 7 ».
 *
 * Sans cela, une faute dans un fichier inclus renverrait à un numéro de ligne
 * du texte assemblé — c'est-à-dire d'un fichier que personne n'a sous les
 * yeux, et le message deviendrait plus déroutant qu'utile.
 */
export function traduire(message, origine) {
  return message.replace(/ligne (\d+)/g, (entier, numero) => {
    const source = origine[Number(numero) - 1]
    return source ? `${source.fichier}, ligne ${source.ligne}` : entier
  })
}

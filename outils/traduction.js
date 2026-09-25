/**
 * Traduire un programme gameboy2 (JavaScript) en gameboy3 (C++).
 *
 * Ce n'est pas une suite d'expressions régulières : le fichier est ANALYSÉ par
 * l'analyseur de gameboy2, et l'arbre obtenu est réécrit en C++. Une
 * traduction de texte se trompe sur « x = 1 // let y = 2 » ; une traduction
 * d'arbre ne peut pas — elle ne voit que ce que le compilateur voyait.
 *
 * Ce que le traducteur doit décider :
 *
 * **Où mettre le code du haut.** Un programme JavaScript s'exécute de haut en
 * bas ; un programme C++ commence à `main()`. Tout ce qui n'est pas une
 * déclaration descend donc dans `main()`, dans l'ordre où c'était écrit.
 *
 * **Quelles variables peuvent garder leur valeur de départ.** Une globale de
 * C++ prend sa valeur avant `main()`. Tant qu'aucune instruction n'a encore
 * été rencontrée, « let x = 5 » devient « uint8_t x = 5; ». Après, il faudrait
 * initialiser au milieu d'autre chose : la déclaration reste nue, et
 * l'affectation descend dans `main()`, à sa place exacte.
 *
 * Le C++ produit est correct mais littéral : il garde les variables globales
 * qui servaient d'arguments faute de mieux. C'est un point de départ à
 * relire, pas un résultat fini — les fonctions à arguments, les portées et les
 * « struct » sont justement ce que le portage permet ensuite d'écrire.
 */

import { analyser } from '../../gameboy2/compilateur/analyseur.js'

const SAUT = String.fromCharCode(10)

/* ------------------------------------------------------- les expressions */

/*
 * Les priorités, pour ne parenthéser que lorsqu'il le faut. Elles sont les
 * mêmes des deux côtés — c'est ce qui rend la traduction sûre : « 20 - p * q »
 * se relit à l'identique, sans une paire de parenthèses ajoutée par prudence.
 */
const RANGS = {
  '|': 1, '&': 2,
  '===': 3, '!==': 3, '<': 3, '>': 3, '<=': 3, '>=': 3,
  '+': 4, '-': 4,
  '*': 5, '/': 5, '%': 5,
}

const TRADUITS = { '===': '==', '!==': '!=' }

function expression(n, rangParent = 0, aDroite = false) {
  switch (n.genre) {
    case 'nombre': return String(n.valeur)
    case 'texte': return `"${n.valeur}"`
    case 'variable': return n.nom
    case 'index': return `${n.nom}[${expression(n.index)}]`
    case 'appel': return `${n.nom}(${n.arguments.map((a) => expression(a)).join(', ')})`
    case 'liste': return `{ ${n.valeurs.map((v) => expression(v)).join(', ')} }`

    case 'calcul':
    case 'comparer': {
      const rang = RANGS[n.operateur] ?? 0
      const operateur = TRADUITS[n.operateur] ?? n.operateur
      /* À droite d'un « - » ou d'un « / », un opérateur de même rang doit
         garder ses parenthèses : « a - (b - c) » n'est pas « a - b - c ». */
      const serre = rang < rangParent || (rang === rangParent && aDroite)
      const texte = `${expression(n.gauche, rang)} ${operateur} ${expression(n.droite, rang, true)}`
      return serre ? `(${texte})` : texte
    }

    default: throw new Error(`expression « ${n.genre} » non traduite`)
  }
}

/* ------------------------------------------------------ les instructions */

const decaler = (lignes, retrait) => lignes.map((l) => (l ? retrait + l : l))

function instruction(n) {
  switch (n.genre) {
    case 'declarer': return [`${declaration(n)}`]
    case 'affecter': return [`${n.nom} = ${expression(n.valeur)};`]
    case 'affecterCase': return [`${n.nom}[${expression(n.index)}] = ${expression(n.valeur)};`]
    case 'expression': return [`${expression(n.valeur)};`]
    case 'retour': return ['return;']

    case 'si': {
      const lignes = [`if (${expression(n.condition)}) {`]
      lignes.push(...decaler(corps(n.alors), '  '))
      if (n.sinon) {
        lignes.push('} else {')
        lignes.push(...decaler(corps(n.sinon), '  '))
      }
      lignes.push('}')
      return lignes
    }

    case 'tantque': {
      const condition = n.condition.genre === 'variable' && n.condition.nom === 'true'
        ? 'true' : expression(n.condition)
      return [`while (${condition}) {`, ...decaler(corps(n.corps), '  '), '}']
    }

    case 'fonction':
      return [`void ${n.nom}() {`, ...decaler(corps(n.corps), '  '), '}']

    default: throw new Error(`instruction « ${n.genre} » non traduite`)
  }
}

const corps = (noeuds) => noeuds.flatMap((n) => instruction(n))

/** Une déclaration locale, ou le corps d'une globale. */
function declaration(n) {
  const v = n.valeur

  if (v.genre === 'appel' && v.nom === 'tableau') {
    return `uint8_t ${n.nom}[${expression(v.arguments[0])}];`
  }
  if (v.genre === 'appel' && (v.nom === 'dessin' || v.nom === 'dessin16')) {
    const type = v.nom === 'dessin16' ? 'Perso' : 'Tuile'
    const rangees = v.arguments[0].valeurs.map((r) => `  "${r.valeur}",`)
    return [`${type} ${n.nom} = {`, ...rangees, '};'].join('\n')
  }
  if (v.genre === 'liste') {
    return `const uint8_t ${n.nom}[] = { ${v.valeurs.map((x) => expression(x)).join(', ')} };`
  }
  return `uint8_t ${n.nom} = ${expression(v)};`
}

/* ------------------------------------------------------------ le partage */

/** Rend le programme C++ correspondant à un programme gameboy2. */
export function versCpp(source, entete = []) {
  const arbre = analyser(source)

  const globales = []
  const fonctions = []
  const dedansMain = []
  let commence = false // a-t-on déjà rencontré une instruction ?

  for (const n of arbre) {
    if (n.genre === 'fonction') {
      fonctions.push(instruction(n).join(SAUT), '')
      continue
    }

    if (n.genre === 'declarer') {
      const v = n.valeur
      const estUneTable = v.genre === 'liste' ||
        (v.genre === 'appel' && ['tableau', 'dessin', 'dessin16'].includes(v.nom))

      /* Une table, un dessin, un tableau : cela ne s'exécute pas, cela existe.
         Sa place est en haut, quoi qu'il y ait autour. */
      if (estUneTable || !commence) {
        globales.push(declaration(n))
        continue
      }

      /* Une variable déclarée après le début du programme : la déclaration
         monte, nue, et l'affectation reste où elle était. */
      globales.push(`uint8_t ${n.nom};`)
      dedansMain.push(`${n.nom} = ${expression(v)};`)
      continue
    }

    commence = true
    dedansMain.push(...instruction(n))
  }

  return [
    ...entete,
    ...(entete.length ? [''] : []),
    ...globales,
    '',
    ...fonctions,
    'int main() {',
    ...decaler(dedansMain, '  '),
    '',
    '  return 0;',
    '}',
    '',
  ].join(SAUT).replace(/\n{3,}/g, SAUT + SAUT)
}

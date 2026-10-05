/**
 * Lit du C++ et en fait un arbre.
 *
 * Ce n'est pas tout C++, et ça ne le sera jamais : le processeur de la Game Boy
 * travaille sur des octets, à 4 MHz, avec 8 Ko de mémoire de travail. Lui
 * promettre des modèles, des classes, des flux ou des nombres à virgule serait
 * mentir. Ce qui est compris est le C++ qu'une console de 1989 sait exécuter
 * sans y perdre son âme :
 *
 *   uint8_t x = 0;                    une variable, un octet
 *   uint8_t puits[180];               un tableau, en mémoire de travail
 *   const uint8_t FORMES[] = {…};     une table gravée dans la cartouche
 *   struct Ennemi { uint8_t x, y; };  un enregistrement de champs d'un octet
 *   enum { MENU, JEU };               des constantes nommées
 *   Tuile SOL = { "33333333", … };    une tuile dessinée, 8 × 8
 *   Air FANFARE = { "DO4 12", … };    une mélodie, un pas par élément
 *   uint8_t plus(uint8_t a) { … }     une fonction, avec arguments et retour
 *   for / while / do / switch / if    les boucles et les branchements
 *   int main() { … }                  par où tout commence
 *
 * Tout le reste est refusé avec son numéro de ligne. Mieux vaut un refus clair
 * qu'une cartouche qui fait autre chose que ce qui est écrit — un `long` traduit
 * en douce sur un octet, c'est un jeu qui compte faux à partir de 256 sans que
 * personne n'ait été prévenu.
 */

/* --------------------------------------------------------------- le lexeur */

/*
 * Les symboles, du plus long au plus court : « <<= » doit être reconnu avant
 * « << », qui doit l'être avant « < ». Trier autrement découpe « a <<= 2 » en
 * « a < <= 2 », et l'erreur qui s'ensuit ne parle plus de rien.
 */
import { BIBLIOTHEQUES } from './inclusion.js'

const SYMBOLES = [
  '<<=', '>>=',
  '==', '!=', '<=', '>=', '&&', '||', '++', '--',
  '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=', '<<', '>>', '::', '->',
  '(', ')', '{', '}', '[', ']', ',', ';', '=', '+', '-', '*', '/', '%',
  '&', '|', '^', '~', '<', '>', '!', '?', ':', '.',
]

/** Les types d'un octet. Tous pareils pour la machine : elle n'en a qu'un. */
export const TYPES_OCTET = new Set(['uint8_t', 'int', 'char', 'bool', 'unsigned', 'auto'])

/** Ceux qu'on refuse, avec ce qu'il faut écrire à la place. */
const TYPES_REFUSES = {
  uint16_t: 'un octet ne va que jusqu\'à 255 ; pour compter plus loin, tenir deux variables',
  int16_t: 'un octet ne va que jusqu\'à 255 ; pour compter plus loin, tenir deux variables',
  uint32_t: 'la machine ne connaît que l\'octet',
  int32_t: 'la machine ne connaît que l\'octet',
  short: 'écrire « uint8_t » : sur cette machine, tout nombre tient sur un octet',
  long: 'la machine ne connaît que l\'octet',
  float: 'ce processeur ne sait pas compter à virgule ; travailler en seizièmes de pixel',
  double: 'ce processeur ne sait pas compter à virgule ; travailler en seizièmes de pixel',
  size_t: 'écrire « uint8_t »',
  string: 'les textes ne servent qu\'à texte(x, y, "…") et ne se rangent pas en mémoire',
}

/** Découpe le texte en jetons, en gardant le numéro de ligne de chacun. */
export function lexer(source) {
  const jetons = []
  let i = 0
  let ligne = 1

  const echappement = (c) => {
    if (c === '\\') return '\\'
    if (c === '"') return '"'
    if (c === "'") return "'"
    if (c === '0') return '\0'
    return null
  }

  while (i < source.length) {
    const c = source[i]

    if (c === '\n') { ligne++; i++; continue }
    if (c === ' ' || c === '\t' || c === '\r') { i++; continue }

    /* Commentaires : // jusqu'au bout de la ligne, ou /* … *​/ */
    if (c === '/' && source[i + 1] === '/') {
      while (i < source.length && source[i] !== '\n') i++
      continue
    }
    if (c === '/' && source[i + 1] === '*') {
      const depart = ligne
      i += 2
      while (i < source.length && !(source[i] === '*' && source[i + 1] === '/')) {
        if (source[i] === '\n') ligne++
        i++
      }
      if (i >= source.length) throw new Error(`ligne ${depart} : commentaire jamais refermé`)
      i += 2
      continue
    }

    /* Une chaîne : « "BONJOUR" ». Elle ne sert qu'à texte(). */
    if (c === '"') {
      let texte = ''
      const depart = ligne
      i++
      while (i < source.length && source[i] !== '"') {
        if (source[i] === '\n') throw new Error(`ligne ${depart} : texte jamais refermé`)
        if (source[i] === '\\') {
          const remplacement = echappement(source[i + 1])
          if (remplacement === null) {
            throw new Error(`ligne ${ligne} : « \\${source[i + 1]} » n'est pas compris dans un texte`)
          }
          texte += remplacement
          i += 2
          continue
        }
        texte += source[i++]
      }
      if (i >= source.length) throw new Error(`ligne ${depart} : texte jamais refermé`)
      i++
      jetons.push({ genre: 'texte', valeur: texte, ligne })
      continue
    }

    /*
     * Un caractère seul : « 'A' ». En C++ c'est un NOMBRE — le code du
     * caractère —, et non un texte d'une lettre. Les confondre ferait passer
     * « if (lettre == 'A') » pour une comparaison entre un octet et une chaîne,
     * c'est-à-dire pour une erreur, alors que c'est la façon normale de l'écrire.
     */
    if (c === "'") {
      i++
      let caractere
      if (source[i] === '\\') {
        caractere = echappement(source[i + 1])
        if (caractere === null) throw new Error(`ligne ${ligne} : « \\${source[i + 1]} » n'est pas compris`)
        i += 2
      } else {
        caractere = source[i++]
      }
      if (source[i] !== "'") throw new Error(`ligne ${ligne} : un caractère entre apostrophes n'en contient qu'un seul`)
      i++
      jetons.push({ genre: 'nombre', valeur: caractere.charCodeAt(0), ligne, caractere })
      continue
    }

    /* Un nombre : 42, 0x2A, 0b101010. Le souligné sépare les chiffres. */
    if (/[0-9]/.test(c)) {
      let brut = ''
      let base = 10
      if (c === '0' && (source[i + 1] === 'x' || source[i + 1] === 'X')) { base = 16; i += 2 }
      else if (c === '0' && (source[i + 1] === 'b' || source[i + 1] === 'B')) { base = 2; i += 2 }
      const chiffres = base === 16 ? /[0-9A-Fa-f_]/ : base === 2 ? /[01_]/ : /[0-9_]/
      while (i < source.length && chiffres.test(source[i])) brut += source[i++]
      /* Les suffixes de C++ : 10u, 255U. Ils ne changent rien ici. */
      while (i < source.length && /[uUlL]/.test(source[i])) i++
      const valeur = parseInt(brut.replace(/_/g, ''), base)
      if (Number.isNaN(valeur)) throw new Error(`ligne ${ligne} : nombre mal écrit`)
      jetons.push({ genre: 'nombre', valeur, ligne })
      continue
    }

    if (/[A-Za-z_]/.test(c)) {
      let nom = ''
      while (i < source.length && /[A-Za-z0-9_]/.test(source[i])) nom += source[i++]
      jetons.push({ genre: 'nom', valeur: nom, ligne })
      continue
    }

    if (c === '#') {
      /* « #include <texte> » : une demande d'inclusion, voir BIBLIOTHEQUES.
         Un commentaire peut suivre, sur la même ligne. */
      const fin = source.indexOf('\n', i)
      const reste = source.slice(i, fin === -1 ? source.length : fin)
      const demande = reste.match(/^#\s*include\s*<\s*([A-Za-z_0-9]+)\s*>\s*(?:\/\/[^\n]*)?$/)
      if (demande && Object.hasOwn(BIBLIOTHEQUES, demande[1])) {
        jetons.push({ genre: 'inclure', valeur: demande[1], ligne })
        i += reste.length
        continue
      }
      if (demande) {
        /* « <alphabet> » pour « <ALPHABET> » : le nom s'écrit comme dans le programme. */
        const proche = Object.keys(BIBLIOTHEQUES).find((nom) => nom.toLowerCase() === demande[1].toLowerCase())
        throw new Error(
          `ligne ${ligne} : « <${demande[1]}> » n'existe pas. ` +
            (proche
              ? `C'est « #include <${proche}> » : le nom s'écrit exactement comme dans le programme.`
              : 'On inclut une fonction de la console par son nom, écrit comme dans le programme : ' +
                Object.keys(BIBLIOTHEQUES).map((nom) => `<${nom}>`).join(', ') + '.'),
        )
      }
      throw new Error(
        `ligne ${ligne} : « # » n'est compris que dans « #include "autre.cpp" », ` +
          'seul sur sa ligne. Pour une constante, écrire « const uint8_t NOM = 3; ».',
      )
    }

    const symbole = SYMBOLES.find((s) => source.startsWith(s, i))
    if (symbole) {
      jetons.push({ genre: 'symbole', valeur: symbole, ligne })
      i += symbole.length
      continue
    }

    throw new Error(`ligne ${ligne} : caractère inattendu « ${c} »`)
  }

  jetons.push({ genre: 'fin', valeur: null, ligne })
  return jetons
}

/* ------------------------------------------------------------ l'analyseur */

export function analyser(source) {
  /* Les demandes d'inclusion sont mises à part : elles ne sont pas du code,
     elles ouvrent le programme comme des nœuds « inclusion ». */
  const tous = lexer(source)
  const inclusions = tous.filter((j) => j.genre === 'inclure')
    .map((j) => ({ genre: 'inclusion', nom: j.valeur, ligne: j.ligne }))
  const jetons = tous.filter((j) => j.genre !== 'inclure')
  let p = 0

  /*
   * Les noms de « struct » sont relevés d'un coup d'œil sur les jetons, avant
   * de rien analyser. Sans cela, « Ennemi loup; » serait indiscernable d'un
   * appel de fonction : c'est le même début. Un langage à déclarations comme
   * C++ demande de savoir ce qui est un type avant de lire la ligne.
   */
  const structures = new Set(['Tuile', 'Perso', 'Grand', 'Air', 'Mot', 'Carre'])
  /* Le nom d'un « enum » est un type lui aussi — mais un type d'un octet :
     « Scene ou = TITRE; » se lit mieux que « uint8_t ou = TITRE; », et dit ce
     que la variable a le droit de contenir. */
  const enumerations = new Set()

  for (let k = 0; k + 1 < jetons.length; k++) {
    if (jetons[k].valeur === 'struct' && jetons[k + 1].genre === 'nom') structures.add(jetons[k + 1].valeur)
    if (jetons[k].valeur === 'enum') {
      const suivant = jetons[k + 1].valeur === 'class' ? jetons[k + 2] : jetons[k + 1]
      if (suivant && suivant.genre === 'nom') enumerations.add(suivant.valeur)
    }
  }

  const voir = (avance = 0) => jetons[Math.min(p + avance, jetons.length - 1)]
  const finies = () => voir().genre === 'fin'
  const est = (valeur, avance = 0) => voir(avance).valeur === valeur && voir(avance).genre !== 'texte'
  const avancer = () => jetons[p++]

  function attendre(valeur, precision) {
    if (!est(valeur)) {
      const trouve = voir().genre === 'fin' ? 'la fin du fichier' : `« ${voir().valeur} »`
      throw new Error(
        `ligne ${voir().ligne} : « ${valeur} » attendu, trouvé ${trouve}` + (precision ? ` (${precision})` : ''),
      )
    }
    return avancer()
  }

  function nomAttendu(quoi) {
    const jeton = voir()
    if (jeton.genre !== 'nom') throw new Error(`ligne ${jeton.ligne} : ${quoi} attendu`)
    return avancer().valeur
  }

  /** Un type est-il écrit ici ? */
  function estUnType(avance = 0) {
    const jeton = voir(avance)
    if (jeton.genre !== 'nom') return false
    if (jeton.valeur === 'const' || jeton.valeur === 'struct') return true
    if (jeton.valeur === 'unsigned' || jeton.valeur === 'signed') return true
    if (TYPES_OCTET.has(jeton.valeur)) return true
    if (jeton.valeur === 'void') return true
    /* Un type refusé est tout de même reconnu comme un type : c'est ce qui
       permet de dire « uint16_t n'existe pas ici » plutôt que de s'étonner
       d'un nom inattendu au milieu d'une déclaration. */
    if (jeton.valeur in TYPES_REFUSES) return true
    if (structures.has(jeton.valeur)) return true
    if (enumerations.has(jeton.valeur)) return true
    return false
  }

  /** Lit un type, et rend { nom, constant }. */
  function type() {
    let constant = false
    while (est('const') || est('static') || est('struct')) {
      if (est('const')) constant = true
      avancer()
    }
    const jeton = voir()
    if (jeton.genre !== 'nom') throw new Error(`ligne ${jeton.ligne} : type attendu`)

    if (jeton.valeur in TYPES_REFUSES) {
      throw new Error(`ligne ${jeton.ligne} : « ${jeton.valeur} » n'existe pas ici — ${TYPES_REFUSES[jeton.valeur]}`)
    }

    let nom = avancer().valeur
    /* « unsigned char », « signed char » : deux mots pour un octet. */
    if ((nom === 'unsigned' || nom === 'signed') && voir().genre === 'nom' && TYPES_OCTET.has(voir().valeur)) {
      avancer()
      nom = 'uint8_t'
    }
    if (nom === 'signed') nom = 'uint8_t'
    /* Un « enum » est un octet : le compilateur n'a rien à retenir de plus. */
    if (enumerations.has(nom)) nom = 'uint8_t'

    if (est('*') || est('&')) {
      throw new Error(
        `ligne ${jeton.ligne} : pas de pointeurs ni de références. ` +
          'Un tableau se passe par son nom, qui est déjà une adresse.',
      )
    }
    while (est('const')) { constant = true; avancer() }

    if (!TYPES_OCTET.has(nom) && nom !== 'void' && !structures.has(nom)) {
      if (enumerations.has(nom)) return { nom: 'uint8_t', constant, ligne: jeton.ligne }
      throw new Error(
        `ligne ${jeton.ligne} : type inconnu « ${nom} ». Ceux qui existent : ` +
          'uint8_t, int, char, bool, auto, void, Tuile, Perso, Grand, Air, Mot, Carre, et les « struct » du programme.',
      )
    }
    return { nom, constant, ligne: jeton.ligne }
  }

  /* --- les expressions, du moins lié au plus lié --- */

  /*
   * Les priorités sont celles de C++, et il faut qu'elles le soient : un
   * fichier qui se lit comme du C++ doit se calculer comme du C++.
   *
   *   ?:  →  ||  →  &&  →  |  →  ^  →  &  →  == !=  →  < >  →  << >>
   *       →  + -  →  * / %  →  unaire  →  suffixe  →  primaire
   */

  function expression() { return ternaire() }

  function ternaire() {
    const condition = ouLogique()
    if (!est('?')) return condition
    const ligne = avancer().ligne
    const alors = expression()
    attendre(':', 'un « ? » veut son « : »')
    return { genre: 'ternaire', condition, alors, sinon: expression(), ligne }
  }

  /** Une famille d'opérateurs de même priorité, tous associatifs à gauche. */
  function binaire(operateurs, genre, dessous) {
    return () => {
      let gauche = dessous()
      while (operateurs.some((o) => est(o))) {
        const jeton = avancer()
        gauche = { genre, operateur: jeton.valeur, gauche, droite: dessous(), ligne: jeton.ligne }
      }
      return gauche
    }
  }

  const produit = binaire(['*', '/', '%'], 'calcul', () => unaire())
  const somme = binaire(['+', '-'], 'calcul', () => produit())
  const decalage = binaire(['<<', '>>'], 'calcul', () => somme())
  const ordre = binaire(['<', '>', '<=', '>='], 'comparer', () => decalage())
  const egalite = binaire(['==', '!='], 'comparer', () => ordre())
  const etBits = binaire(['&'], 'calcul', () => egalite())
  const ouExclusif = binaire(['^'], 'calcul', () => etBits())
  const ouBits = binaire(['|'], 'calcul', () => ouExclusif())
  const etLogique = binaire(['&&'], 'logique', () => ouBits())
  const ouLogique = binaire(['||'], 'logique', () => etLogique())

  function unaire() {
    const jeton = voir()

    if (est('!')) { avancer(); return { genre: 'non', valeur: unaire(), ligne: jeton.ligne } }
    if (est('~')) { avancer(); return { genre: 'complement', valeur: unaire(), ligne: jeton.ligne } }
    if (est('-')) { avancer(); return { genre: 'oppose', valeur: unaire(), ligne: jeton.ligne } }
    if (est('+')) { avancer(); return unaire() }

    if (est('++') || est('--')) {
      const operateur = avancer().valeur
      return { genre: 'incrementer', operateur, prefixe: true, cible: unaire(), ligne: jeton.ligne }
    }

    /* Une conversion écrite « (uint8_t) x ». Tout tient déjà sur un octet :
       elle ne change rien, mais on la comprend plutôt que de s'en étonner. */
    if (est('(') && estUnType(1)) {
      avancer()
      type()
      attendre(')')
      return unaire()
    }

    return suffixe()
  }

  function suffixe() {
    let noeud = primaire()

    for (;;) {
      const jeton = voir()

      if (est('[')) {
        avancer()
        const index = expression()
        attendre(']', 'un « [ » veut son « ] »')
        noeud = { genre: 'index', cible: noeud, index, ligne: jeton.ligne }
        continue
      }

      if (est('.')) {
        avancer()
        const nom = nomAttendu('nom de champ')

        /* « troupe[i].avancer() » : le nom est suivi d'une parenthèse. Les
           arguments sont lus quand même — le refus se fait alors sur un nom
           et une ligne, plutôt que sur une parenthèse inattendue. */
        if (est('(')) {
          avancer()
          const arguments_ = []
          while (!est(')')) {
            if (finies()) throw new Error(`ligne ${jeton.ligne} : parenthèse fermante manquante`)
            arguments_.push(expression())
            if (est(',')) { avancer(); continue }
            break
          }
          attendre(')', 'un appel veut sa parenthèse fermante')
          noeud = { genre: 'appelMethode', cible: noeud, nom, arguments: arguments_, ligne: jeton.ligne }
          continue
        }

        noeud = { genre: 'champ', cible: noeud, nom, ligne: jeton.ligne }
        continue
      }

      if (est('->')) {
        throw new Error(`ligne ${jeton.ligne} : pas de pointeurs ; écrire « ${'.'} » pour atteindre un champ`)
      }

      if (est('++') || est('--')) {
        const operateur = avancer().valeur
        noeud = { genre: 'incrementer', operateur, prefixe: false, cible: noeud, ligne: jeton.ligne }
        continue
      }

      return noeud
    }
  }

  function primaire() {
    const jeton = voir()

    if (est('(')) {
      avancer()
      const dedans = expression()
      attendre(')', 'une parenthèse ouverte veut sa fermante')
      return dedans
    }

    if (est('{')) {
      throw new Error(
        `ligne ${jeton.ligne} : une liste entre accolades s'écrit à la déclaration — ` +
          'comme « const uint8_t FORMES[] = {0, 1, 1, 0}; » — ou comme dessin posé sur ' +
          'place, en argument de poser(), poserPanneau(), sprite() ou sprite16().',
      )
    }

    if (jeton.genre === 'nombre') { avancer(); return { genre: 'nombre', valeur: jeton.valeur, ligne: jeton.ligne } }
    if (jeton.genre === 'texte') { avancer(); return { genre: 'texte', valeur: jeton.valeur, ligne: jeton.ligne } }

    if (jeton.genre === 'nom') {
      if (jeton.valeur === 'sizeof') {
        avancer()
        attendre('(', 'sizeof(…) veut ses parenthèses')
        const dedans = estUnType() ? { genre: 'type', type: type(), ligne: jeton.ligne } : expression()
        attendre(')')
        return { genre: 'taille', valeur: dedans, ligne: jeton.ligne }
      }

      if (est('::', 1)) {
        throw new Error(
          `ligne ${jeton.ligne} : « ${jeton.valeur}:: » — il n'y a pas de bibliothèque standard sur cette console. ` +
            'Les fonctions fournies s\'appellent sans préfixe.',
        )
      }

      avancer()

      if (est('(')) {
        avancer()
        const arguments_ = []
        while (!est(')')) {
          if (finies()) throw new Error(`ligne ${jeton.ligne} : parenthèse fermante manquante`)
          /*
           * Un dessin écrit SUR PLACE : « poser(4, 6, {"########", …}) ».
           *
           * L'argument d'un appel est le seul endroit, hors déclaration, où des
           * accolades veulent dire quelque chose — et c'est le compilateur qui
           * dira, plus loin, si la fonction appelée sait quoi en faire. Les
           * accepter ici plutôt que dans « expression() » garde « x = {1, 2} »
           * refusé, ce qui n'a toujours pas de sens.
           */
          arguments_.push(est('{') ? liste() : expression())
          if (est(',')) avancer()
          else break
        }
        attendre(')')
        return { genre: 'appel', nom: jeton.valeur, arguments: arguments_, ligne: jeton.ligne }
      }

      return { genre: 'variable', nom: jeton.valeur, ligne: jeton.ligne }
    }

    const trouve = jeton.genre === 'fin' ? 'la fin du fichier' : `« ${jeton.valeur} »`
    throw new Error(`ligne ${jeton.ligne} : expression attendue, trouvé ${trouve}`)
  }

  /* --- les déclarations --- */

  /** La liste entre accolades d'une initialisation : {1, 2, 3} ou {"…", "…"}. */
  function liste() {
    const ligne = attendre('{').ligne
    const valeurs = []
    while (!est('}')) {
      if (finies()) throw new Error(`ligne ${ligne} : accolade fermante manquante`)
      /* Une liste peut en contenir d'autres : c'est ainsi qu'on grave une
         table de « struct », un enregistrement par accolade. */
      valeurs.push(est('{') ? liste() : expression())
      if (est(',')) avancer()
      else break
    }
    attendre('}', 'une accolade ouverte veut sa fermante')
    return { genre: 'liste', valeurs, ligne }
  }

  /**
   * Une déclaration, en C++ : un type, un nom, éventuellement des crochets,
   * éventuellement un « = », et l'on peut en enchaîner plusieurs par virgule.
   *
   *   uint8_t x = 0, y = 0;
   *   uint8_t puits[180];
   *   const uint8_t FORMES[] = {0, 1};
   */
  function declarations(leType, ligne) {
    const faites = []

    for (;;) {
      const nom = nomAttendu('nom de variable')
      let dimension = null // null : ce n'est pas un tableau
      let colonnes = null // la seconde dimension, s'il y en a une
      let tableau = false

      if (est('[')) {
        avancer()
        tableau = true
        if (!est(']')) dimension = expression()
        attendre(']', 'un « [ » veut son « ] »')

        /* « uint8_t carte[18][20]; » — une grille. Le compilateur la range à
           plat, ligne après ligne, et calcule « ligne × largeur + colonne »
           lui-même. C'est le calcul que tout le monde écrit à la main, et que
           tout le monde finit par écrire de travers le jour où la largeur
           change. */
        if (est('[')) {
          avancer()
          colonnes = expression()
          attendre(']', 'un « [ » veut son « ] »')
        }
      }

      let valeur = null
      if (est('=')) {
        avancer()
        valeur = est('{') ? liste() : expression()
      } else if (est('{')) {
        /* L'initialisation directe de C++ moderne : « Tuile SOL {…} ». */
        valeur = liste()
      }

      faites.push({
        genre: 'declarer', type: leType, nom, tableau, dimension, colonnes, valeur, ligne,
      })

      if (est(',')) { avancer(); continue }
      break
    }

    attendre(';', 'une déclaration se termine par un point-virgule')
    return faites
  }

  /* --- les instructions --- */

  function bloc() {
    const ligne = attendre('{').ligne
    const corps = []
    while (!est('}')) {
      if (finies()) throw new Error(`ligne ${ligne} : accolade fermante manquante`)
      corps.push(...instruction())
    }
    attendre('}')
    return corps
  }

  /** Le corps d'un « if » ou d'une boucle : un bloc, ou une seule instruction. */
  function corps() {
    if (est('{')) return bloc()
    if (est(';')) { avancer(); return [] }
    return instruction()
  }

  /** Rend une LISTE : « uint8_t a = 1, b = 2; » fait deux instructions. */
  function instruction() {
    const jeton = voir()

    /* Un bloc écrit pour lui-même garde sa portée : ce qu'on y déclare
       n'existe pas au-dehors, comme en C++. */
    if (est('{')) return [{ genre: 'bloc', corps: bloc(), ligne: jeton.ligne }]

    if (est(';')) { avancer(); return [] }

    if (est('if')) {
      avancer()
      attendre('(', 'un « if » veut ses parenthèses')
      const condition = expression()
      attendre(')')
      const alors = corps()
      let sinon = null
      if (est('else')) { avancer(); sinon = corps() }
      return [{ genre: 'si', condition, alors, sinon, ligne: jeton.ligne }]
    }

    if (est('while')) {
      avancer()
      attendre('(', 'un « while » veut ses parenthèses')
      const condition = expression()
      attendre(')')
      return [{ genre: 'tantque', condition, corps: corps(), ligne: jeton.ligne }]
    }

    if (est('do')) {
      avancer()
      const dedans = corps()
      attendre('while', 'un « do » veut son « while »')
      attendre('(')
      const condition = expression()
      attendre(')')
      attendre(';')
      return [{ genre: 'faire', condition, corps: dedans, ligne: jeton.ligne }]
    }

    /*
     * « for (uint8_t i = 0; i < 10; i++) »
     *
     * Les trois parties sont facultatives : « for (;;) » est une boucle sans
     * fin, comme « while (true) ». La variable déclarée dans la première partie
     * n'existe que dans la boucle — c'est la portée de C++, et le compilateur
     * la tient vraiment : deux boucles voisines peuvent nommer « i » sans se
     * marcher dessus.
     */
    if (est('for')) {
      avancer()
      attendre('(', 'un « for » veut ses parenthèses')

      let debut = []
      if (!est(';')) {
        if (estUnType()) {
          const leType = type()
          debut = declarations(leType, jeton.ligne)
        } else {
          debut = instructionSimple()
          attendre(';')
        }
      } else avancer()

      const condition = est(';') ? null : expression()
      attendre(';', 'les trois parties d\'un « for » sont séparées par des points-virgules')

      const pas = est(')') ? [] : instructionSimple()
      attendre(')')

      return [{ genre: 'pour', debut, condition, pas, corps: corps(), ligne: jeton.ligne }]
    }

    /*
     * « switch » : un aiguillage. Les cas se suivent réellement, comme en C++ —
     * sans « break », l'exécution continue dans le cas suivant. C'est un piège
     * célèbre, mais c'est le sens du langage, et le trahir en douce serait pire
     * que de le laisser tel quel.
     */
    if (est('switch')) {
      avancer()
      attendre('(', 'un « switch » veut ses parenthèses')
      const quoi = expression()
      attendre(')')
      attendre('{', 'un « switch » veut ses accolades')

      const cas = []
      while (!est('}')) {
        if (finies()) throw new Error(`ligne ${jeton.ligne} : accolade fermante manquante`)

        if (est('case')) {
          const ligneCas = avancer().ligne
          const quand = expression()
          attendre(':', 'un « case » se termine par deux-points')
          cas.push({ quand, corps: [], ligne: ligneCas })
          continue
        }
        if (est('default')) {
          const ligneCas = avancer().ligne
          attendre(':', 'un « default » se termine par deux-points')
          cas.push({ quand: null, corps: [], ligne: ligneCas })
          continue
        }
        if (!cas.length) {
          throw new Error(`ligne ${voir().ligne} : dans un « switch », tout commence par « case … : »`)
        }
        cas[cas.length - 1].corps.push(...instruction())
      }
      attendre('}')
      return [{ genre: 'choisir', quoi, cas, ligne: jeton.ligne }]
    }

    if (est('break')) { avancer(); attendre(';'); return [{ genre: 'casser', ligne: jeton.ligne }] }
    if (est('continue')) { avancer(); attendre(';'); return [{ genre: 'continuer', ligne: jeton.ligne }] }

    if (est('return')) {
      avancer()
      const valeur = est(';') ? null : expression()
      attendre(';', 'un « return » se termine par un point-virgule')
      return [{ genre: 'retour', valeur, ligne: jeton.ligne }]
    }

    if (est('goto')) {
      throw new Error(`ligne ${jeton.ligne} : « goto » n'existe pas ici — les boucles et « break » suffisent`)
    }

    if (estUnType() && voir(1).genre === 'nom') {
      const leType = type()
      return declarations(leType, jeton.ligne)
    }

    const simple = instructionSimple()
    attendre(';', 'une instruction se termine par un point-virgule')
    return simple
  }

  /** Une affectation ou un appel, sans son point-virgule. */
  function instructionSimple() {
    const jeton = voir()
    const debut = expression()

    const AFFECTATIONS = ['=', '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=', '<<=', '>>=']
    const operateur = AFFECTATIONS.find((o) => est(o))

    if (operateur) {
      avancer()
      const valeur = est('{') ? liste() : expression()
      if (!['variable', 'index', 'champ'].includes(debut.genre)) {
        throw new Error(
          `ligne ${jeton.ligne} : on ne peut affecter qu'à une variable, ` +
            'à une case de tableau ou à un champ',
        )
      }
      return [{ genre: 'affecter', cible: debut, operateur, valeur, ligne: jeton.ligne }]
    }

    if (debut.genre === 'appel' || debut.genre === 'appelMethode' || debut.genre === 'incrementer') {
      return [{ genre: 'expression', valeur: debut, ligne: jeton.ligne }]
    }

    if (debut.genre === 'comparer' && debut.operateur === '==') {
      throw new Error(
        `ligne ${jeton.ligne} : « == » compare, il n'affecte pas. Pour donner une valeur, écrire « = ».`,
      )
    }

    throw new Error(`ligne ${jeton.ligne} : cette ligne ne fait rien`)
  }

  /* --- le haut du fichier --- */

  function haut() {
    const jeton = voir()

    /* struct Ennemi { uint8_t x, y; void avancer() { x++; } }; */
    if (est('struct') && voir(1).genre === 'nom' && est('{', 2)) {
      avancer()
      const nom = nomAttendu('nom de structure')
      attendre('{')
      const champs = []
      /*
       * Les méthodes ressortent d'ici comme des fonctions ordinaires, sous un
       * nom composé — « Ennemi::avancer ». Tout ce que le compilateur sait
       * déjà faire d'une fonction (la voir avant qu'elle serve, refuser un
       * cycle d'appels, l'écrire dans la cartouche) leur profite sans une
       * ligne de plus ; ce qui reste à traiter à part tient à « this », et à
       * rien d'autre.
       */
      const methodes = []
      while (!est('}')) {
        if (finies()) throw new Error(`ligne ${jeton.ligne} : accolade fermante manquante`)
        const leType = type()

        /* Une méthode : le nom est suivi d'une parenthèse. */
        if (voir().genre === 'nom' && est('(', 1)) {
          const ligneMethode = voir().ligne
          const nomMethode = nomAttendu('nom de méthode')
          avancer()
          if (est('void') && est(')', 1)) avancer()
          if (!est(')')) {
            throw new Error(
              `ligne ${ligneMethode} : « ${nom}::${nomMethode} » ne prend pas d'argument. ` +
                'Une méthode reçoit déjà l\'objet sur lequel elle travaille ; ' +
                'ce qui vient d\'ailleurs se passe à une fonction ordinaire.',
            )
          }
          attendre(')')
          /* « uint8_t vivant() const { … } » : le mot se lit bien, et ne
             change rien ici — aucun champ n'est écrit à l'insu de personne. */
          if (est('const')) avancer()
          if (est(';')) {
            throw new Error(
              `ligne ${ligneMethode} : « ${nom}::${nomMethode} » est annoncée sans son corps. ` +
                'Une méthode s\'écrit en entier dans la « struct », accolades comprises.',
            )
          }
          methodes.push({
            genre: 'fonction',
            nom: `${nom}::${nomMethode}`,
            structure: nom,
            methode: nomMethode,
            retour: leType,
            parametres: [],
            corps: bloc(),
            ligne: ligneMethode,
          })
          continue
        }

        for (;;) {
          const nomChamp = nomAttendu('nom de champ')
          let dimension = null
          if (est('[')) {
            avancer()
            dimension = expression()
            attendre(']')
          }
          champs.push({ nom: nomChamp, type: leType, dimension, ligne: voir().ligne })
          if (est(',')) { avancer(); continue }
          break
        }
        attendre(';', 'un champ se termine par un point-virgule')
      }
      attendre('}')
      attendre(';', 'une « struct » se termine par un point-virgule')
      return [{ genre: 'structure', nom, champs, ligne: jeton.ligne }, ...methodes]
    }

    /* enum Etat { MENU, JEU }; — et enum sans nom. */
    if (est('enum')) {
      avancer()
      if (est('class')) avancer()
      const nom = voir().genre === 'nom' ? avancer().valeur : null
      attendre('{', 'un « enum » veut ses accolades')
      const valeurs = []
      while (!est('}')) {
        if (finies()) throw new Error(`ligne ${jeton.ligne} : accolade fermante manquante`)
        const ligneValeur = voir().ligne
        const nomValeur = nomAttendu('nom de constante')
        /* Sans « = », la constante vaut la précédente plus un : c'est
           l'emetteur qui le calcule, une fois les nombres connus. */
        let valeur = null
        if (est('=')) { avancer(); valeur = expression() }
        valeurs.push({ nom: nomValeur, valeur, ligne: ligneValeur })
        if (est(',')) avancer()
        else break
      }
      attendre('}')
      attendre(';', 'un « enum » se termine par un point-virgule')
      return [{ genre: 'enumeration', nom, valeurs, ligne: jeton.ligne }]
    }

    if (!estUnType()) {
      const trouve = jeton.genre === 'fin' ? 'la fin du fichier' : `« ${jeton.valeur} »`
      throw new Error(
        `ligne ${jeton.ligne} : hors des fonctions, on ne déclare que des variables, ` +
          `des « struct », des « enum » et des fonctions — trouvé ${trouve}. ` +
          'Le programme s\'exécute depuis « int main() ».',
      )
    }

    const leType = type()
    const nom = nomAttendu('nom')

    /* Une fonction : le nom est suivi d'une parenthèse. */
    if (est('(')) {
      avancer()
      const parametres = []
      while (!est(')')) {
        if (finies()) throw new Error(`ligne ${jeton.ligne} : parenthèse fermante manquante`)
        if (est('void') && est(')', 1)) { avancer(); break }
        const typeParametre = type()
        const nomParametre = nomAttendu('nom d\'argument')
        if (est('[')) {
          throw new Error(
            `ligne ${jeton.ligne} : un tableau ne se passe pas en argument. ` +
              'Les tableaux sont visibles de partout : les nommer suffit.',
          )
        }
        /* « void poser(uint8_t x, uint8_t y, uint8_t tuile = MUR) » : ce qui
           n'est pas écrit à l'appel prend la valeur donnée ici. */
        let defaut = null
        if (est('=')) { avancer(); defaut = expression() }

        parametres.push({ type: typeParametre, nom: nomParametre, defaut, ligne: jeton.ligne })
        if (est(',')) avancer()
        else break
      }
      attendre(')')

      if (est(';')) {
        /* Une déclaration seule : en C++ elle annonce une fonction écrite plus
           bas. Ici toutes les fonctions sont vues avant d'être traduites, donc
           elle n'a rien à faire — on l'accepte sans rien produire. */
        avancer()
        return []
      }

      return [{
        genre: 'fonction', nom, retour: leType, parametres, corps: bloc(), ligne: jeton.ligne,
      }]
    }

    /* Sinon, une ou plusieurs variables globales. On rembobine d'un nom. */
    p--
    return declarations(leType, jeton.ligne).map((d) => ({ ...d, globale: true }))
  }

  const programme = [...inclusions]
  while (!finies()) programme.push(...haut())
  return programme
}

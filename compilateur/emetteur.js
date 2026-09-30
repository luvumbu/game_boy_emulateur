/**
 * L'arbre devient du code machine.
 *
 * Il n'y a pas d'assembleur au milieu : chaque nœud émet directement ses
 * opcodes SM83. Les sauts sont posés avec une adresse provisoire, notée dans
 * une liste de retouches, et corrigés quand toutes les étiquettes sont connues.
 *
 * Le modèle d'exécution est volontairement bête, et c'est ce qui le rend
 * lisible : **toute valeur transite par `a`**, et toute variable vit dans un
 * octet nommé. Pas de registres à allouer, pas de pile d'expressions. Une
 * expression un peu grande produit du code un peu long — mais on peut lire le
 * code produit et y reconnaître le C++ de départ.
 *
 * Deux choses distinguent ce compilateur de celui qui lisait du JavaScript :
 *
 * **Les portées existent vraiment.** Le `i` d'une fonction et le `i` d'une
 * autre sont deux octets différents, comme en C++. C'est ce qui permet
 * d'écrire des fonctions sans se demander quels noms sont déjà pris ailleurs.
 *
 * **Les arguments existent aussi.** Chaque paramètre est un octet réservé une
 * fois pour toutes à la fonction — c'est ce que font les compilateurs C des
 * machines huit bits, faute d'une pile praticable. Le prix est qu'une fonction
 * ne peut pas s'appeler elle-même : le second appel écraserait les arguments
 * du premier. Plutôt que de le laisser arriver, on refuse la récursion au
 * moment de compiler, en nommant le cycle.
 */

import { numeroDe, octetsDesTuiles, NOMBRE_DE_TUILES, lettresGrasses, pixelsDe } from './police.js'
import { analyser } from './analyseur.js'

/* Les guichets du matériel, nommés en français comme dans le reste du projet. */
const MANETTE = 0x00 // $FF00
const ECRAN = 0x40 // $FF40
const DEFILEMENT_Y = 0x42
const DEFILEMENT_X = 0x43
const LIGNE_ECRAN = 0x44
const PALETTE_FOND = 0x47

const PALETTE_OBJETS = 0x48 // $FF48
const PALETTE_OBJETS2 = 0x49 // $FF49 : la seconde palette des lutins
const FENETRE_Y = 0x4a // $FF4A
const FENETRE_X = 0x4b // $FF4B
const TRANSFERT = 0x46 // $FF46 : le copieur rapide vers la table des lutins

/*
 * Les registres de la Game Boy Color.
 *
 * Ils n'existent pas sur une console d'origine — y écrire n'y fait rien, et
 * c'est précisément ce qui permet à une cartouche de tourner sur les deux :
 * elle pose ses couleurs, et la vieille console les ignore poliment.
 */
const BANQUE_VRAM = 0x4f      // $FF4F : quelle banque de VRAM le programme voit
const COULEUR_FOND_OU = 0x68  // $FF68 : l'index dans les palettes de fond
const COULEUR_FOND = 0x69     // $FF69 : la couleur, deux octets à la suite
const COULEUR_LUTIN_OU = 0x6a // $FF6A
const COULEUR_LUTIN = 0x6b    // $FF6B

/*
 * La puce sonore. Quatre voix : deux carrés, une onde programmable, un bruit.
 * On en expose trois — les deux carrés pour la mélodie, le bruit pour les
 * percussions et les explosions.
 *
 * L'onde programmable reste dehors, et il vaut mieux le dire : l'émulateur du
 * projet ne la mélange pas encore à sa sortie. L'exposer donnerait une
 * fonction qui marche sur une vraie console et reste muette dans la page —
 * c'est-à-dire une fonction dont on ne pourrait pas vérifier qu'elle marche.
 */
const SON_ALLUME = 0x26 // $FF26 : la puce entière
const SON_VOLUME = 0x24 // $FF24 : le volume général, gauche et droite
const SON_ROUTAGE = 0x25 // $FF25 : quelle voix sort de quel côté

/** Les quatre registres d'une voix, dans l'ordre où on les écrit. */
const VOIX = {
  1: { balayage: 0x10, longueur: 0x11, enveloppe: 0x12, basse: 0x13, haute: 0x14 },
  2: { balayage: null, longueur: 0x16, enveloppe: 0x17, basse: 0x18, haute: 0x19 },
  4: { balayage: null, longueur: 0x20, enveloppe: 0x21, basse: 0x22, haute: 0x23 },
}

/**
 * L'état des airs en train de jouer, en mémoire de travail.
 *
 * Il vit juste au-dessus de la copie des lutins, sous les variables du
 * programme : seize octets par voix, et les deux voix chantantes seulement.
 * Le bruit n'a pas de hauteur ; il n'a rien à faire dans une mélodie.
 */
const MUSIQUE = 0xc0a0
const OCTETS_PAR_VOIX = 16
const ETAT_AIR = { 1: MUSIQUE, 2: MUSIQUE + OCTETS_PAR_VOIX }

/** Ce que chacun des seize octets retient. */
const AIR = {
  ACTIF: 0, // 0 : rien ne joue sur cette voix
  CURSEUR_BAS: 1, // où en est la lecture de la table
  CURSEUR_HAUT: 2,
  RESTANTS: 3, // pas encore à jouer
  VITESSE: 4, // images par pas
  COMPTE: 5, // images restantes du pas courant
  BOUCLE: 6, // recommencer au bout, ou se taire
  DEBUT_BAS: 7, // le début de la table, pour reboucler
  DEBUT_HAUT: 8,
  TOTAL: 9,
}

/**
 * Deux octets par pas : la hauteur, puis le volume.
 *
 * Deux hauteurs ne sont pas des notes : l'une fait taire la voix, l'autre ne
 * touche à rien — c'est ainsi qu'une note tient sur plusieurs pas sans être
 * rejouée à chaque fois, ce qui s'entendrait comme un bégaiement.
 */
const PAS_SILENCE = 0xff
const PAS_TENIR = 0xfe

/**
 * Les quatre nuances d'un pixel, et les signes qui les désignent.
 *
 * Les chiffres 0 à 3 disent la nuance sans ambiguïté — 0 le plus clair, 3 le
 * plus sombre — mais huit chiffres à la file ne ressemblent pas à un dessin :
 *
 *   "30222203"          "#.++++.#"
 *   "30222203"    ou    "#.++++.#"
 *   "30000003"          "#......#"
 *
 * Les deux écritures donnent exactement les mêmes octets. La seconde se relit
 * de loin, et l'on voit la faute de frappe ; c'est ce qui compte quand on
 * dessine à la main. Le point est le vide, le dièse est le plein.
 */
export const NUANCES_ECRITES = {
  0: 0, '.': 0,
  1: 1, '-': 1,
  2: 2, '+': 2,
  3: 3, '#': 3,
}

/** Les signes qui vont ensemble : on n'en mélange pas deux dans une tuile. */
export const ALPHABETS = [
  ['0', '1', '2', '3'],
  ['.', '-', '+', '#'],
]

/** La mémoire de la cartouche, celle qui survit à l'extinction. */
const MEMOIRE_SAUVEGARDE = 0xa000

const MEMOIRE_TUILES = 0x8000
const CARTE_FOND = 0x9800

/*
 * La fenêtre : une seconde couche, posée par-dessus le décor, et qui ne défile
 * pas avec lui. C'est ainsi que se fait un panneau de score qui reste en place
 * pendant qu'un niveau glisse dessous.
 *
 * Le matériel n'a que DEUX cartes de fond. Celle-ci est la seconde, et elle est
 * donc dépensée pour le panneau : il n'en reste pas pour préparer un écran
 * entier hors-champ et basculer d'un coup. C'est un choix, et il vaut mieux
 * l'écrire que le laisser deviner.
 */
const CARTE_PANNEAU = 0x9c00

/*
 * La table des lutins ne se laisse écrire que pendant le VBlank, et elle est
 * la première chose qu'on veut changer à chaque image. On tient donc une
 * copie en mémoire de travail, qu'on écrit quand on veut, et le matériel la
 * recopie d'un bloc au bon moment. C'est ce que fait tout jeu de la machine.
 *
 * L'adresse doit finir par deux zéros : le copieur ne prend que l'octet haut.
 */
const OAM_OMBRE = 0xc000

/*
 * Pendant la copie, le processeur ne peut plus lire la cartouche — seulement
 * la page rapide. La petite routine qui la déclenche doit donc y vivre. Elle
 * est posée tout en haut, hors d'atteinte des variables.
 */
const ROUTINE_TRANSFERT = 0xfff0
const OCTETS_DU_TRANSFERT = 10

/** Les variables commencent ici, un octet chacune : la page rapide. */
const PREMIERE_VARIABLE = 0x80 // $FF80
const DERNIERE_VARIABLE = 0xee // $FFEE, juste sous les octets du compilateur

/** Deux octets de brouillon, pour ne pas perdre une valeur pendant un calcul. */
const BROUILLON = 0xfe // $FFFE, juste sous la pile
const BROUILLON2 = 0xfd

/** L'état du tirage au sort. Il vit hors des variables du programme. */
const GRAINE = 0xfc

/**
 * Le compteur d'images, tenu par l'interruption du VBlank, et le drapeau qui
 * dit qu'un tour de boucle a duré plus d'une image.
 *
 * Sans eux, un jeu trop lent ralentissait **en silence** : la boucle ratait le
 * VBlank, attendait le suivant, et tournait à trente images par seconde sans
 * que rien ne le signale. C'est le genre de chose qu'on met des heures à
 * comprendre, et une seconde à voir quand la console le dit.
 */
const COMPTEUR_IMAGES = 0xfb
const RETARD = 0xfa

/** Le compteur d'images tel qu'il était au réveil précédent. */
const DERNIER_REVEIL = 0xef

/**
 * Tableaux, structures, et les variables qui ne tiennent plus dans la page
 * rapide : tout cela vit en mémoire de travail, après la copie des lutins.
 *
 * La page rapide ne fait que 112 octets. Quand un programme en demande
 * davantage, il serait absurde de s'arrêter là : la console a huit kilo-octets
 * de mémoire, et une variable qui y vit coûte un octet de code de plus par
 * accès — c'est tout. Le compilateur remplit donc la page rapide d'abord, et
 * déborde ensuite, sans que le programme ait à le savoir.
 */
const PREMIER_OCTET_LIBRE = 0xc100
const DERNIER_OCTET_LIBRE = 0xdf00 // au-dessus commence la pile

/** Les boutons, dans l'ordre où la manette les rend. */
export const BOUTONS = {
  DROITE: 0, GAUCHE: 1, HAUT: 2, BAS: 3,
  A: 4, B: 5, SELECT: 6, START: 7,
}

/**
 * Les noms des douze demi-tons, et les cinq octaves que la console tient sans
 * fausser : DO2 (le plus grave) à SI6.
 *
 * Un nom vaut mieux qu'un numéro. « note(1, LA4, 8, 12) » se relit ; « note(1,
 * 33, 8, 12) » ne se relit pas, et se recopie de travers.
 */
const DEMI_TONS = ['DO', 'DOD', 'RE', 'RED', 'MI', 'FA', 'FAD', 'SOL', 'SOLD', 'LA', 'LAD', 'SI']
const PREMIERE_OCTAVE = 2
const NOMBRE_D_OCTAVES = 5

export const NOTES = {}
for (let octave = 0; octave < NOMBRE_D_OCTAVES; octave++) {
  DEMI_TONS.forEach((nom, demi) => {
    NOTES[nom + (octave + PREMIERE_OCTAVE)] = octave * 12 + demi
  })
}

/**
 * Ce que le matériel veut pour chaque note.
 *
 * La console ne connaît pas les hertz : elle veut un nombre de 0 à 2047, et
 * joue 131072 / (2048 − ce nombre) fois par seconde. La table est calculée
 * ici, à la compilation, en gamme tempérée — le LA4 à 440 Hz comme partout.
 */
export function octetsDesNotes() {
  const octets = []
  for (let k = 0; k < NOMBRE_D_OCTAVES * 12; k++) {
    const midi = 12 * (PREMIERE_OCTAVE + 1) + k // DO2 est le MIDI 36
    const hertz = 440 * Math.pow(2, (midi - 69) / 12)
    const valeur = Math.round(2048 - 131072 / hertz)
    octets.push(valeur & 0xff, (valeur >> 8) & 0x07)
  }
  return octets
}

/**
 * Les options d'un lutin, telles que le matériel les range dans son quatrième
 * octet. Elles se combinent avec « | », comme en C++ :
 *
 *   sprite(0, x, y, MARIO, MIROIR_X | DERRIERE)
 *
 * Seul le miroir horizontal existait ; les trois autres étaient là, dans le
 * matériel, et personne ne pouvait les atteindre.
 */
export const OPTIONS_LUTIN = {
  MIROIR_X: 0x20, // retourné vers la gauche
  MIROIR_Y: 0x40, // retourné vers le haut
  DERRIERE: 0x80, // le décor passe devant : un personnage qui entre dans un tuyau
  PALETTE1: 0x10, // la seconde palette des lutins, celle de paletteLutins(1, …)
}

/* ------------------------------------------------------------- l'émetteur */

/**
 * Huit rangées de huit signes — ou seize de seize — et rien d'autre.
 *
 * `sujet` est ce dont on parle : « la tuile « MUR » » quand le dessin est
 * déclaré, « ce dessin » quand il est écrit sur place. Le message doit
 * désigner le coupable ; un « rangée trop courte » qui ne dit pas laquelle
 * envoie relire quarante lignes.
 */
function verifierDessin(rangees, ligne, cote, sujet) {
  if (rangees.length !== cote) {
    throw new Error(
      `ligne ${ligne} : ${sujet} a ${rangees.length} rangée${rangees.length > 1 ? 's' : ''} ; ` +
        `${cote === 16 ? 'un Perso' : 'une Tuile'} en veut exactement ${cote}.`,
    )
  }
  for (const rangee of rangees) {
    if (rangee.length !== cote || [...rangee].some((signe) => NUANCES_ECRITES[signe] === undefined)) {
      throw new Error(
        `ligne ${ligne} : la rangée « ${rangee} » de ${sujet} doit faire ${cote} signes — ` +
          'les chiffres 0 à 3, du plus clair au plus sombre, ou « . - + # » qui se relisent de loin.',
      )
    }
  }

  /*
   * Une seule écriture par tuile.
   *
   * « 3.22+203 » est peut-être ce qu'on voulait, mais c'est surtout ce qu'on
   * obtient en corrigeant à moitié une tuile écrite en chiffres. Mieux vaut
   * le dire que graver un dessin que personne n'a voulu.
   */
  const melange = ALPHABETS.filter((signes) => rangees.some((r) => [...r].some((s) => signes.includes(s))))
  if (melange.length > 1) {
    throw new Error(
      `ligne ${ligne} : ${sujet} mélange les chiffres et les signes. ` +
        'Une tuile s\'écrit soit en « 0123 », soit en « .-+# » — pas les deux.',
    )
  }
}

/**
 * Ce qu'un dessin DONNE À VOIR, réduit à une chaîne comparable.
 *
 * « "#.++" » et « "3022" » sont le même dessin écrit dans deux alphabets.
 * Comparer les rangées telles quelles graverait deux fois la même tuile ; on
 * compare donc les NUANCES, qui sont ce que le matériel verra.
 */
function empreinteDuDessin(rangees, cote) {
  return cote + ':' + rangees.map((r) => [...r].map((s) => NUANCES_ECRITES[s]).join('')).join('|')
}

export class Emetteur {
  constructor() {
    this.octets = []
    this.etiquettes = new Map()
    this.retouches = []

    this.variables = new Map() // nom complet → adresse, pour le rapport
    this.zones = new Map() // les tableaux et structures : nom → { base, taille }
    this.structures = new Map() // les « struct » déclarées
    this.tables = [] // les tables gravées dans la cartouche
    this.dessins = new Map() // les tuiles dessinées dans le programme
    this.airs = new Map() // les mélodies écrites dans le programme
    this.utiliseAirs = false // aucun « jouer() » : le séquenceur n'est pas gravé
    this.prochaineTuile = NOMBRE_DE_TUILES // un dessin de 16 en occupe quatre
    this.textes = []

    this.signatures = new Map() // nom de fonction → sa signature
    /*
     * Ce programme se sert-il de la couleur ?
     *
     * Personne ne le déclare : c'est l'usage d'une fonction de couleur qui
     * lève ce drapeau, et l'en-tête de la cartouche suit. Un mot-clé à écrire
     * en tête de fichier, c'est un mot-clé qu'on oublie — et l'on cherche
     * alors pourquoi les palettes qu'on vient de poser ne font rien.
     */
    this.couleur = false
    /*
     * Pour quelle console ce programme est-il écrit ?
     *
     *   'gb'        une Game Boy d'origine — les fonctions de couleur sont REFUSÉES
     *   'gbc'       une Game Boy Color — elle est exigée
     *   'les-deux'  la couleur si la console l'a, quatre nuances sinon
     *
     * Refuser plutôt qu'ignorer : une couleur posée dans un programme annoncé
     * pour la Game Boy d'origine ne ferait rien du tout, et l'on chercherait
     * pourquoi. Mieux vaut l'entendre dire à la compilation.
     */
    this.cible = 'les-deux'
    /*
     * Fabrique-t-on la cartouche Game Boy des DEUX ?
     *
     * Alors les appels de couleur ne sont ni refusés ni émis : ils sont
     * OMIS, et le fichier « .gb » ne porte pas un octet de couleur.
     */
    this.couleursOmises = false
    this.boucles = [] // les sorties de boucle en cours, pour break et continue
    this.fonctionCourante = null

    this.prochaineRapide = PREMIERE_VARIABLE
    this.prochainOctet = PREMIER_OCTET_LIBRE
  }

  /* ------------------------------------------------------- la mémoire */

  /**
   * Un octet pour une variable. La page rapide d'abord ; la mémoire de travail
   * quand elle est pleine.
   */
  octetPourVariable(nom, ligne) {
    let adresse
    if (this.prochaineRapide <= DERNIERE_VARIABLE) {
      adresse = 0xff00 | this.prochaineRapide
      this.prochaineRapide++
    } else {
      adresse = this.reserver(1, nom, ligne)
    }
    this.variables.set(nom, adresse)
    return adresse
  }

  /**
   * Deux octets côte à côte, pour une adresse.
   *
   * C'est ce que veut le « this » d'une méthode : l'objet sur lequel elle
   * travaille n'est pas connu à la compilation — « troupe[i] » change à chaque
   * tour —, donc c'est son adresse qui lui est passée. Les deux octets doivent
   * se suivre, et la page rapide n'est prise que si les DEUX y tiennent :
   * autrement l'octet de poids fort tomberait ailleurs.
   */
  motPourVariable(nom, ligne) {
    let adresse
    if (this.prochaineRapide + 1 <= DERNIERE_VARIABLE) {
      adresse = 0xff00 | this.prochaineRapide
      this.prochaineRapide += 2
    } else {
      adresse = this.reserver(2, nom, ligne)
    }
    this.variables.set(nom, adresse)
    return adresse
  }

  /** Réserve des octets en mémoire de travail, et rend l'adresse du premier. */
  reserver(combien, nom, ligne) {
    if (this.prochainOctet + combien > DERNIER_OCTET_LIBRE) {
      throw new Error(`ligne ${ligne} : plus de place en mémoire pour « ${nom} »`)
    }
    const base = this.prochainOctet
    this.prochainOctet += combien
    return base
  }

  /** Grave une suite d'octets dans la cartouche, et rend son étiquette. */
  graver(nom, valeurs) {
    const etiquette = `table_${nom}_${this.tables.length}`
    this.tables.push({ etiquette, valeurs })
    return etiquette
  }

  /**
   * Enregistre une tuile dessinée dans le programme, et rend son numéro.
   *
   * Huit rangées de huit chiffres, chacun étant la nuance d'un pixel : 0 le
   * plus clair, 3 le plus sombre. Les numéros continuent après ceux de la
   * police, de sorte qu'ajouter un dessin ne déplace aucune lettre.
   */
  dessiner(nom, rangees, ligne, cote) {
    if (this.dessins.has(nom)) return this.dessins.get(nom)
    const sujet = `${cote === 16 ? 'le Perso' : 'la tuile'} « ${nom} »`
    verifierDessin(rangees, ligne, cote, sujet)
    return this.enregistrerDessin(nom, rangees, ligne, cote, sujet, nom)
  }

  /**
   * Le même dessin, mais écrit LÀ OÙ ON LE POSE — et sans nom.
   *
   *   poser(4, 6, { "########", "#......#", …, "########" });
   *
   * Une case du fond n'a jamais été autre chose que huit rangées de huit
   * pixels. Il fallait pourtant les déclarer en haut du fichier, leur trouver
   * un nom, et ne poser ensuite que ce nom — c'est-à-dire un NUMÉRO. Pour un
   * dessin qui ne sert qu'à un endroit, ce détour coûte plus qu'il ne
   * rapporte : le dessin est loin de là où il apparaît, et relire
   * « poser(4, 6, M3) » ne dit rien de ce qu'on va voir à l'écran.
   *
   * Le dessin n'a donc pas de nom : sa CLÉ EST SON DESSIN. Deux cases peintes
   * pareil ne dépensent qu'une tuile, même écrites à dix lignes d'écart — et
   * un dessin déjà déclaré en « Tuile MUR = {…} » n'en dépense pas une
   * seconde, quel que soit l'alphabet dans lequel il est écrit. Le matériel
   * n'en tient que 256 : les gaspiller sans le savoir se paierait un jour par
   * un « plus de place » sur une ligne qui n'y est pour rien.
   */
  dessinSurPlace(rangees, ligne, cote) {
    verifierDessin(rangees, ligne, cote, 'ce dessin')
    const empreinte = empreinteDuDessin(rangees, cote)
    for (const dessin of this.dessins.values()) {
      if (dessin.cote === cote && empreinteDuDessin(dessin.rangees, dessin.cote) === empreinte) return dessin
    }
    return this.enregistrerDessin(empreinte, rangees, ligne, cote, 'ce dessin', `sur place, ligne ${ligne}`)
  }

  /**
   * La place que le dessin prend dans la cartouche, et le numéro qui va avec.
   *
   * `cle` sert à le retrouver — c'est son nom, ou son dessin quand il n'en a
   * pas. `appellation` est ce qu'on en dit dans le rapport de compilation :
   * une clé faite de soixante-quatre chiffres n'y apprendrait rien à personne.
   */
  enregistrerDessin(cle, rangees, ligne, cote, sujet, appellation) {
    /* Un dessin de seize occupe QUATRE tuiles : le matériel ne connaît que des
       carrés de huit. Elles se suivent dans l'ordre haut-gauche, haut-droite,
       bas-gauche, bas-droite — c'est ce que « sprite16 » attend. */
    const combien = cote === 16 ? 4 : 1
    const numero = this.prochaineTuile
    if (numero + combien > 256) throw new Error(`ligne ${ligne} : plus de place pour ${sujet}`)
    this.prochaineTuile += combien

    this.dessins.set(cle, { numero, rangees, cote, appellation })
    return this.dessins.get(cle)
  }

  /**
   * Enregistre une mélodie écrite dans le programme, et rend sa table.
   *
   * Un pas s'écrit « "DO4 12" » : une hauteur, et le volume qu'elle prend.
   * Le volume est facultatif — « "DO4" » joue à douze, ce qui s'entend sans
   * saturer. Deux pas ne sont pas des notes :
   *
   *   "--"   la voix se tait
   *   "=="   on ne touche à rien : la note d'avant continue
   *
   * Sans « == », une blanche s'écrirait en rejouant la même note à chaque
   * pas — et l'oreille entend alors quatre coups, pas une note tenue.
   */
  composer(nom, pas, ligne) {
    if (this.airs.has(nom)) return this.airs.get(nom)
    if (pas.length === 0) throw new Error(`ligne ${ligne} : « Air ${nom} » n'a pas un seul pas`)
    if (pas.length > 255) {
      throw new Error(`ligne ${ligne} : « Air ${nom} » fait ${pas.length} pas ; le compte s'arrête à 255`)
    }

    const octets = []
    for (const pasEcrit of pas) {
      const morceaux = pasEcrit.trim().split(/\s+/)
      const hauteur = morceaux[0]

      if (morceaux.length > 2) {
        throw new Error(`ligne ${ligne} : le pas « ${pasEcrit} » de « ${nom} » s'écrit « HAUTEUR volume »`)
      }

      let numero
      if (hauteur === '--' || hauteur === '') numero = PAS_SILENCE
      else if (hauteur === '==') numero = PAS_TENIR
      else if (hauteur in NOTES) numero = NOTES[hauteur]
      else {
        throw new Error(
          `ligne ${ligne} : « ${hauteur} » n'est pas une hauteur. Les noms vont de DO2 à SI6 ` +
            '(DO, DOD, RE, RED, MI, FA, FAD, SOL, SOLD, LA, LAD, SI) ; ' +
            '« -- » fait taire la voix, « == » tient la note.',
        )
      }

      let volume = 12
      if (morceaux.length === 2) {
        volume = Number(morceaux[1])
        if (!Number.isInteger(volume) || volume < 0 || volume > 15) {
          throw new Error(`ligne ${ligne} : le volume du pas « ${pasEcrit} » de « ${nom} » va de 0 à 15`)
        }
      }

      octets.push(numero, volume)
    }

    const air = { etiquette: this.graver(nom, octets), pas: pas.length, nom }
    this.airs.set(nom, air)
    return air
  }

  /* ------------------------------------------------------------ les octets */

  ecrire(...valeurs) {
    for (const v of valeurs) this.octets.push(v & 0xff)
  }

  get position() { return this.octets.length }

  /** Pose une étiquette ici. */
  poser(nom) {
    if (this.etiquettes.has(nom)) throw new Error(`étiquette posée deux fois : ${nom}`)
    this.etiquettes.set(nom, this.position)
  }

  /** Écrit une adresse provisoire, à corriger plus tard. */
  adresse(nom, decalage = 0) {
    this.retouches.push({ position: this.position, nom, decalage, genre: 'absolue' })
    this.ecrire(0, 0)
  }

  /** Écrit un déplacement provisoire, pour un saut court. */
  deplacement(nom) {
    this.retouches.push({ position: this.position, nom, decalage: 0, genre: 'relative' })
    this.ecrire(0)
  }

  /** Remplace toutes les adresses provisoires par les vraies. */
  corriger(baseRom) {
    for (const r of this.retouches) {
      const cible = this.etiquettes.get(r.nom)
      if (cible === undefined) throw new Error(`étiquette inconnue : ${r.nom}`)
      if (r.genre === 'absolue') {
        const absolue = baseRom + cible + r.decalage
        this.octets[r.position] = absolue & 0xff
        this.octets[r.position + 1] = (absolue >> 8) & 0xff
      } else {
        const saut = cible - (r.position + 1)
        if (saut < -128 || saut > 127) throw new Error(`saut trop long vers ${r.nom}`)
        this.octets[r.position] = saut & 0xff
      }
    }
  }

  /* ------------------------------------------- les instructions employées */

  ldA(n) { this.ecrire(0x3e, n) }
  ldB(n) { this.ecrire(0x06, n) }
  ldC(n) { this.ecrire(0x0e, n) }
  ldHL(n) { this.ecrire(0x21, n & 0xff, (n >> 8) & 0xff) }
  ldDE(n) { this.ecrire(0x11, n & 0xff, (n >> 8) & 0xff) }
  ldBC(n) { this.ecrire(0x01, n & 0xff, (n >> 8) & 0xff) }
  ldHLetiquette(nom, decalage = 0) { this.ecrire(0x21); this.adresse(nom, decalage) }
  ldDEetiquette(nom, decalage = 0) { this.ecrire(0x11); this.adresse(nom, decalage) }
  ldHLplusA() { this.ecrire(0x22) }
  ldAdeDE() { this.ecrire(0x1a) }
  ldAdeHL() { this.ecrire(0x7e) }
  ldAdeHLplus() { this.ecrire(0x2a) }
  ldHLA() { this.ecrire(0x77) }
  incDE() { this.ecrire(0x13) }
  incHL() { this.ecrire(0x23) }
  addHLDE() { this.ecrire(0x19) }
  addHLBC() { this.ecrire(0x09) }
  addHLHL() { this.ecrire(0x29) }
  decB() { this.ecrire(0x05) }
  ldhVersA(n) { this.ecrire(0xf0, n) }
  ldhDepuisA(n) { this.ecrire(0xe0, n) }
  xorA() { this.ecrire(0xaf) }
  cplA() { this.ecrire(0x2f) }
  incA() { this.ecrire(0x3c) }
  decA() { this.ecrire(0x3d) }
  swapA() { this.ecrire(0xcb, 0x37) }
  andN(n) { this.ecrire(0xe6, n) }
  orN(n) { this.ecrire(0xf6, n) }
  xorN(n) { this.ecrire(0xee, n) }
  orA() { this.ecrire(0xb7) }
  orB() { this.ecrire(0xb0) }
  addN(n) { this.ecrire(0xc6, n) }
  subN(n) { this.ecrire(0xd6, n) }
  cpN(n) { this.ecrire(0xfe, n) }
  addA() { this.ecrire(0x87) }
  srlA() { this.ecrire(0xcb, 0x3f) }
  addB() { this.ecrire(0x80) }
  subB() { this.ecrire(0x90) }
  andB() { this.ecrire(0xa0) }
  xorB() { this.ecrire(0xa8) }
  ldBA() { this.ecrire(0x47) }
  ldAB() { this.ecrire(0x78) }
  retZ() { this.ecrire(0xc8) } // ret z — rendre la main si le compte est nul
  pushAF() { this.ecrire(0xf5) }
  popAF() { this.ecrire(0xf1) }
  bitA(n) { this.ecrire(0xcb, 0x47 + n * 8) }
  jrNZ(nom) { this.ecrire(0x20); this.deplacement(nom) }
  jrZ(nom) { this.ecrire(0x28); this.deplacement(nom) }
  jrC(nom) { this.ecrire(0x38); this.deplacement(nom) }
  jrNC(nom) { this.ecrire(0x30); this.deplacement(nom) }
  jr(nom) { this.ecrire(0x18); this.deplacement(nom) }
  jp(nom) { this.ecrire(0xc3); this.adresse(nom) }
  jpZ(nom) { this.ecrire(0xca); this.adresse(nom) }
  jpNZ(nom) { this.ecrire(0xc2); this.adresse(nom) }
  jpC(nom) { this.ecrire(0xda); this.adresse(nom) }
  jpNC(nom) { this.ecrire(0xd2); this.adresse(nom) }
  call(nom) { this.ecrire(0xcd); this.adresse(nom) }
  ret() { this.ecrire(0xc9) }
  reti() { this.ecrire(0xd9) }
  di() { this.ecrire(0xf3) }
  ei() { this.ecrire(0xfb) }
  halt() { this.ecrire(0x76) }
  pushBC() { this.ecrire(0xc5) }
  popBC() { this.ecrire(0xc1) }
  pushDE() { this.ecrire(0xd5) }
  popDE() { this.ecrire(0xd1) }
  pushHL() { this.ecrire(0xe5) }
  popHL() { this.ecrire(0xe1) }
  ldSP(n) { this.ecrire(0x31, n & 0xff, (n >> 8) & 0xff) }
  ldLA() { this.ecrire(0x6f) }
  ldHA() { this.ecrire(0x67) }
  ldAH() { this.ecrire(0x7c) }
  ldCA() { this.ecrire(0x4f) }
  ldAC() { this.ecrire(0x79) }
  ldLB() { this.ecrire(0x68) }
  decHL() { this.ecrire(0x2b) }
  incD() { this.ecrire(0x14) }
  ldAD() { this.ecrire(0x7a) }
  ldH(n) { this.ecrire(0x26, n) }
  ldEA() { this.ecrire(0x5f) }
  ldDA() { this.ecrire(0x57) }
  ldD(n) { this.ecrire(0x16, n) }
  ldAL() { this.ecrire(0x7d) }

  /* ------------------------------------------------ lire et écrire un octet */

  /** L'octet vit-il dans la page rapide ? Elle s'atteint en deux octets. */
  estRapide(adresse) { return adresse >= 0xff80 && adresse <= 0xfffe }

  /** Met dans `a` l'octet rangé à cette adresse. */
  chargerDe(adresse) {
    if (this.estRapide(adresse)) this.ldhVersA(adresse & 0xff)
    else this.ecrire(0xfa, adresse & 0xff, (adresse >> 8) & 0xff) // ld a, [nn]
  }

  /** Range `a` à cette adresse. */
  rangerA(adresse) {
    if (this.estRapide(adresse)) this.ldhDepuisA(adresse & 0xff)
    else this.ecrire(0xea, adresse & 0xff, (adresse >> 8) & 0xff) // ld [nn], a
  }

  /** Met dans `hl` l'adresse rangée en deux octets. `a` est perdu. */
  chargerMotDans(registreBas, registreHaut, adresse) {
    this.chargerDe(adresse)
    registreBas()
    this.chargerDe(adresse + 1)
    registreHaut()
  }

  ldHLdeAdresse(adresse) { this.chargerMotDans(() => this.ldLA(), () => this.ldHA(), adresse) }
  ldDEdeAdresse(adresse) { this.chargerMotDans(() => this.ldEA(), () => this.ldDA(), adresse) }

  /** Range `hl` en deux octets à cette adresse. `a` est perdu. */
  rangerHL(adresse) {
    this.ldAL()
    this.rangerA(adresse)
    this.ldAH()
    this.rangerA(adresse + 1)
  }

  /**
   * Met dans `hl` la valeur de `a` multipliée par une échelle connue.
   *
   * C'est le calcul d'un décalage dans un tableau : la case numéro `a` d'un
   * tableau de `struct` de six octets commence six fois plus loin. La
   * multiplication se fait en doublant et en ajoutant, jamais par la routine
   * générale : l'échelle est connue à la compilation, et le résultat doit
   * tenir sur seize bits — un tableau peut dépasser 255 octets, même si son
   * index, lui, tient sur un.
   */
  echelonner(echelle) {
    this.ldLA()
    this.ldH(0)
    if (echelle === 1) return
    if ((echelle & (echelle - 1)) === 0) {
      for (let n = echelle; n > 1; n >>= 1) this.addHLHL()
      return
    }
    this.ecrire(0x54, 0x5d) // ld d, h ; ld e, l — de garde l'index
    this.ldHL(0)
    for (let bit = 0; (1 << bit) <= echelle; bit++) {
      if (echelle & (1 << bit)) this.addHLDE()
      if (echelle >> (bit + 1)) this.ecrire(0xcb, 0x23, 0xcb, 0x12) // sla e ; rl d
    }
  }

  /**
   * Met dans `hl` l'adresse d'une case de la carte de fond : base + ligne × 32
   * + colonne. La multiplication par trente-deux se fait en doublant cinq fois
   * — ce processeur ne sait pas multiplier.
   */
  adresseCarte(colonne, ligne, valeurDe, base = CARTE_FOND) {
    valeurDe(this, ligne)
    this.ldLA()
    this.ldH(0)
    for (let i = 0; i < 5; i++) this.addHLHL() // × 32
    this.ldDE(base)
    this.addHLDE()

    /*
     * `hl` porte maintenant l'adresse de la ligne — et la colonne reste à
     * calculer. Si ce calcul se sert de `hl`, il faut la mettre à l'abri.
     *
     * C'est ce qui manquait : « poser(XS[i], YS[i], MUR) » lisait sa colonne
     * dans une table, ce qui passe par `hl` — et la tuile partait à une adresse
     * quelconque. Rien ne le disait ; la case visée restait simplement vide, et
     * l'on cherchait la faute dans le programme.
     *
     * Une colonne écrite en clair, ou lue dans une variable d'un octet, ne
     * touche pas `hl` : le cas courant ne paie pas les deux octets.
     */
    const risque = colonne.genre !== 'nombre' && constante(colonne) === null &&
      !(colonne.genre === 'variable' && colonne.symbole && colonne.symbole.genre === 'octet')

    if (risque) this.pushHL()
    valeurDe(this, colonne)
    this.ldEA()
    this.ldD(0)
    if (risque) this.popHL()
    this.addHLDE()
  }
}

/** Le nom d'une étiquette neuve. */
let compteur = 0
const neuve = (quoi) => `${quoi}_${compteur++}`

/* ------------------------------------------------------------ les portées */

/**
 * Une portée : ce qu'un morceau de programme peut nommer.
 *
 * C'est ce qui rend les fonctions indépendantes les unes des autres. Le
 * compilateur qui lisait du JavaScript n'en avait pas : toutes les variables
 * vivaient dans un même sac, et deux fonctions qui appelaient leur compteur
 * « i » se le partageaient sans le savoir. Ici, chaque déclaration reçoit son
 * octet, et un nom ne désigne que ce qui est visible d'où il est écrit.
 */
class Portee {
  constructor(parent, quoi) {
    this.parent = parent
    this.quoi = quoi
    this.noms = new Map()
  }

  chercher(nom) {
    return this.noms.get(nom) ?? (this.parent ? this.parent.chercher(nom) : null)
  }

  definir(nom, symbole, ligne) {
    if (this.noms.has(nom)) {
      throw new Error(`ligne ${ligne} : « ${nom} » est déjà déclaré ${this.quoi}`)
    }
    this.noms.set(nom, symbole)
    return symbole
  }
}

/* ------------------------------------------------------- les constantes */

/**
 * La valeur d'une expression, si elle est connue dès la compilation.
 *
 * Rend `null` sinon. C'est ce qui permet d'écrire « uint8_t carte[LARGEUR *
 * HAUTEUR] », « case ROUGE: » ou « sprite(JOUEUR, …) » : partout où le
 * compilateur a besoin d'un nombre écrit en clair, il accepte aussi un calcul
 * dont toutes les parties sont connues.
 */
export function constante(n) {
  if (!n) return null
  switch (n.genre) {
    case 'nombre': return n.valeur & 0xff
    case 'variable': return n.symbole && n.symbole.genre === 'constante' ? n.symbole.valeur & 0xff : null
    case 'taille': return n.tailleCalculee ?? null
    case 'oppose': { const v = constante(n.valeur); return v === null ? null : (-v) & 0xff }
    case 'complement': { const v = constante(n.valeur); return v === null ? null : (~v) & 0xff }
    case 'non': { const v = constante(n.valeur); return v === null ? null : (v === 0 ? 1 : 0) }
    case 'calcul': {
      const g = constante(n.gauche)
      const d = constante(n.droite)
      if (g === null || d === null) return null
      switch (n.operateur) {
        case '+': return (g + d) & 0xff
        case '-': return (g - d) & 0xff
        case '*': return (g * d) & 0xff
        case '/': return d === 0 ? 0 : Math.floor(g / d) & 0xff
        case '%': return d === 0 ? g : (g % d) & 0xff
        case '&': return g & d
        case '|': return g | d
        case '^': return g ^ d
        case '<<': return (g << d) & 0xff
        case '>>': return (g >> d) & 0xff
        default: return null
      }
    }
    case 'comparer': {
      const g = constante(n.gauche)
      const d = constante(n.droite)
      if (g === null || d === null) return null
      switch (n.operateur) {
        case '==': return g === d ? 1 : 0
        case '!=': return g !== d ? 1 : 0
        case '<': return g < d ? 1 : 0
        case '>': return g > d ? 1 : 0
        case '<=': return g <= d ? 1 : 0
        case '>=': return g >= d ? 1 : 0
        default: return null
      }
    }
    default: return null
  }
}

/** L'exposant si le nombre est une puissance de deux, sinon `null`. */
function puissanceDeDeux(n) {
  if (n < 2 || (n & (n - 1)) !== 0) return null
  let exposant = 0
  while ((1 << exposant) < n) exposant++
  return exposant
}

/**
 * `a` devient `a × facteur`, le facteur étant connu à la compilation.
 *
 * On déroule la table de multiplication en binaire : le total est doublé à
 * chaque bit, et la valeur de départ lui est ajoutée quand le bit est à un.
 * Douze octets au pire, et pas une boucle — là où la routine générale faisait
 * jusqu'à 255 tours pour un seul produit.
 */
function multiplierPar(e, facteur) {
  const combien = facteur & 0xff
  if (combien === 0) return e.xorA()
  if (combien === 1) return

  const puissance = puissanceDeDeux(combien)
  if (puissance !== null) {
    for (let i = 0; i < puissance; i++) e.addA()
    return
  }

  /* `b` garde la valeur de départ ; `a` porte le total. On commence au bit le
     plus haut, déjà pris en compte par la valeur elle-même. */
  e.ldBA()
  const haut = 31 - Math.clz32(combien)
  for (let bit = haut - 1; bit >= 0; bit--) {
    e.addA()
    if (combien & (1 << bit)) e.addB()
  }
}

/**
 * La même chose, mais SANS replier le résultat sur un octet.
 *
 * `constante()` calcule comme la machine : sur huit bits, et ce qui déborde
 * est perdu — c'est juste pour « x + 3 », qui doit déborder comme à
 * l'exécution. Mais une TAILLE de tableau n'est pas une valeur de la machine :
 * c'est un nombre du compilateur. Replié, « uint8_t carte[300] » devenait
 * « carte[44] » sans un mot, et le programme écrivait paisiblement dans les
 * variables du voisin. Il fallait donc les deux.
 */
function tailleConstante(n) {
  if (!n) return null
  switch (n.genre) {
    case 'nombre': return n.valeur
    case 'variable': return n.symbole && n.symbole.genre === 'constante' ? n.symbole.valeur : null
    case 'taille': return n.tailleCalculee ?? null
    case 'calcul': {
      const g = tailleConstante(n.gauche)
      const d = tailleConstante(n.droite)
      if (g === null || d === null) return null
      switch (n.operateur) {
        case '+': return g + d
        case '-': return g - d
        case '*': return g * d
        case '/': return d === 0 ? null : Math.floor(g / d)
        case '%': return d === 0 ? null : g % d
        case '<<': return g << d
        case '>>': return g >> d
        default: return null
      }
    }
    default: return null
  }
}

/** Une taille écrite en clair, ou une erreur qui dit ce qu'on attendait. */
function tailleExigee(n, quoi, ligne) {
  const v = tailleConstante(n)
  if (v === null) throw new Error(`ligne ${n?.ligne ?? ligne} : ${quoi}`)
  if (v < 0) throw new Error(`ligne ${n?.ligne ?? ligne} : une taille ne peut pas être négative`)
  return v
}

/** Un nombre écrit en clair, ou une erreur qui dit ce qu'on attendait. */
function nombreExige(n, quoi, ligne) {
  const v = constante(n)
  if (v === null) throw new Error(`ligne ${n?.ligne ?? ligne} : ${quoi}`)
  return v
}

/* -------------------------------------------------------- la résolution */

/*
 * Avant de produire le moindre octet, on parcourt l'arbre pour attacher à
 * chaque nom ce qu'il désigne : un octet et son adresse, un tableau et sa
 * base, une constante et sa valeur, une fonction et sa signature.
 *
 * Faire cela d'abord, et une fois pour toutes, a deux vertus. Les erreurs de
 * nom sortent avec leur ligne avant qu'un seul opcode ne soit écrit ; et
 * l'émission qui suit n'a plus rien à chercher — elle lit ce qui est attaché
 * au nœud, et écrit.
 */

const TAILLE_OCTET = { genre: 'octet', taille: 1 }

function tailleDuType(e, type, ligne) {
  if (type.nom === 'void') throw new Error(`ligne ${ligne} : « void » ne se range pas en mémoire`)
  if (e.structures.has(type.nom)) return e.structures.get(type.nom).taille
  return 1
}

function elementDuType(e, type) {
  if (e.structures.has(type.nom)) {
    return { genre: 'structure', structure: e.structures.get(type.nom), taille: e.structures.get(type.nom).taille }
  }
  return TAILLE_OCTET
}

/** Les valeurs d'une liste gravée, aplaties selon la forme attendue. */
function aplatir(e, liste, element, combien, nom, ligne) {
  const octets = []

  const verserUn = (noeud) => {
    if (element.genre === 'structure') {
      if (noeud.genre !== 'liste') {
        throw new Error(
          `ligne ${ligne} : « ${nom} » est une table de « ${element.structure.nom} » : ` +
            'chaque élément s\'écrit entre accolades, comme {3, 1}.',
        )
      }
      const champs = [...element.structure.champs.values()]
      if (noeud.valeurs.length > champs.length) {
        throw new Error(`ligne ${noeud.ligne} : « ${element.structure.nom} » n'a que ${champs.length} champs`)
      }
      const dedans = new Array(element.taille).fill(0)
      noeud.valeurs.forEach((v, i) => {
        const champ = champs[i]
        if (champ.taille !== 1) throw new Error(`ligne ${noeud.ligne} : le champ « ${champ.nom} » est un tableau ; il ne se grave pas ainsi`)
        dedans[champ.decalage] = nombreExige(v, 'une table gravée ne contient que des nombres connus à la compilation', noeud.ligne)
      })
      octets.push(...dedans)
      return
    }
    /* Une grille s'écrit en rangées : { {1, 2}, {3, 4} }. Elle est gravée à
       plat, rangée après rangée — c'est ainsi que le compilateur la lit. */
    if (noeud.genre === 'liste') {
      for (const v of noeud.valeurs) verserUn(v)
      return
    }

    octets.push(nombreExige(noeud, `« ${nom} » est gravée dans la cartouche : elle ne contient que des nombres connus à la compilation`, ligne))
  }

  for (const v of liste.valeurs) verserUn(v)

  if (combien !== null) {
    const attendus = combien * element.taille
    if (octets.length > attendus) {
      throw new Error(`ligne ${ligne} : « ${nom} » reçoit ${liste.valeurs.length} valeurs pour ${combien} cases`)
    }
    while (octets.length < attendus) octets.push(0)
  }
  return octets
}

function resoudreProgramme(e, programme) {
  const prelude = new Portee(null, 'par le compilateur')
  for (const [nom, bit] of Object.entries(BOUTONS)) {
    prelude.definir(nom, { genre: 'constante', valeur: bit }, 0)
  }
  for (const [nom, valeur] of Object.entries(OPTIONS_LUTIN)) {
    prelude.definir(nom, { genre: 'constante', valeur }, 0)
  }
  for (const [nom, valeur] of Object.entries(NOTES)) {
    prelude.definir(nom, { genre: 'constante', valeur }, 0)
  }
  /* teindre(c, l, 2 | DEVANT) : la case passe DEVANT les personnages (Game Boy Color). */
  prelude.definir('DEVANT', { genre: 'constante', valeur: 0x80 }, 0)
  prelude.definir('true', { genre: 'constante', valeur: 1 }, 0)
  prelude.definir('false', { genre: 'constante', valeur: 0 }, 0)
  /*
   * ALPHABET : la police de la console, sous un nom. A est la tuile 1, Z la 26 :
   * « ALPHABET[i] » se calcule donc « 1 + i », et rien n'est rangé dans la
   * cartouche. Le recopier dans un « const char » coûtait 26 octets pour
   * redire ce que la console sait déjà.
   */
  prelude.definir('ALPHABET', { genre: 'alphabet', taille: 26 }, 0)

  const global = new Portee(prelude, 'plus haut dans le programme')
  e.global = global

  /*
   * Un nom de la console ne se redéfinit pas.
   *
   * « const uint8_t HAUT = 14; » écrasait en silence le bouton HAUT, et le
   * programme s'entendait dire, vingt lignes plus loin, « il n'y a que huit
   * boutons » — sur une ligne où l'on ne voit aucun 14. Une heure pour
   * comprendre que le coupable était la déclaration, pas l'appel.
   *
   * Le nom est refusé là où il est écrit, en disant ce qu'il désigne déjà.
   */
  e.nomsDeLaConsole = new Map([
    ...Object.keys(BOUTONS).map((nom) => [nom, 'un bouton de la manette']),
    ...Object.keys(OPTIONS_LUTIN).map((nom) => [nom, 'une option de lutin']),
    ...Object.keys(NOTES).map((nom) => [nom, 'une hauteur de note']),
    ['DEVANT', 'la priorité d’une case (teindre)'],
    ['ALPHABET', 'l’alphabet de la console'],
    ['true', 'la valeur vraie'],
    ['false', 'la valeur fausse'],
  ])

  /* --- les structures d'abord : les tailles servent à tout le reste --- */
  for (const n of programme) {
    if (n.genre !== 'structure') continue
    if (e.structures.has(n.nom)) throw new Error(`ligne ${n.ligne} : « struct ${n.nom} » est déclarée deux fois`)
    const champs = new Map()
    let decalage = 0
    for (const champ of n.champs) {
      if (champs.has(champ.nom)) throw new Error(`ligne ${champ.ligne} : « ${n.nom} » a deux champs « ${champ.nom} »`)
      if (champ.type.nom === n.nom) {
        throw new Error(`ligne ${champ.ligne} : « ${n.nom} » ne peut pas se contenir elle-même`)
      }
      const element = elementDuType(e, champ.type)
      const combien = champ.dimension ? tailleExigee(champ.dimension, 'la taille d\'un tableau s\'écrit en clair', champ.ligne) : 1
      champs.set(champ.nom, {
        nom: champ.nom, decalage, element, combien,
        taille: element.taille * combien,
        tableau: champ.dimension !== null,
      })
      decalage += element.taille * combien
    }
    if (decalage === 0) throw new Error(`ligne ${n.ligne} : « struct ${n.nom} » n'a aucun champ`)
    if (decalage > 255) throw new Error(`ligne ${n.ligne} : « struct ${n.nom} » fait ${decalage} octets ; 255 au maximum`)
    e.structures.set(n.nom, { nom: n.nom, taille: decalage, champs })
  }

  /* --- les énumérations : des constantes, et rien de plus --- */
  for (const n of programme) {
    if (n.genre !== 'enumeration') continue
    let suivante = 0
    for (const v of n.valeurs) {
      let valeur = suivante
      if (v.valeur) {
        resoudreExpression(e, v.valeur, global)
        valeur = nombreExige(v.valeur, `« ${v.nom} » veut une valeur connue à la compilation`, v.ligne)
      }
      global.definir(v.nom, { genre: 'constante', valeur }, v.ligne)
      suivante = (valeur + 1) & 0xff
    }
  }

  /* --- les signatures : une fonction peut en appeler une écrite plus bas --- */
  for (const n of programme) {
    if (n.genre !== 'fonction') continue
    if (e.signatures.has(n.nom)) throw new Error(`ligne ${n.ligne} : « ${n.nom} » est définie deux fois`)
    if (BUILTINS.has(n.nom)) {
      throw new Error(`ligne ${n.ligne} : « ${n.nom} » est déjà une fonction fournie par la console`)
    }
    let vuUnDefaut = false
    for (const parametre of n.parametres) {
      if (parametre.defaut) vuUnDefaut = true
      else if (vuUnDefaut) {
        throw new Error(
          `ligne ${parametre.ligne} : « ${parametre.nom} » n'a pas de valeur par défaut, ` +
            "et suit un argument qui en a une. On ne pourrait plus deviner lequel manque à l'appel.",
        )
      }
    }

    const signature = {
      nom: n.nom,
      retour: n.retour.nom,
      parametres: n.parametres,
      etiquette: 'fn_' + n.nom,
      noeud: n,
      appelle: new Set(),
    }

    /*
     * Une méthode reçoit l'adresse de son objet, dans deux octets qui lui sont
     * propres — comme un argument, et pour la même raison : « avancer » peut
     * appeler « vivant » sur un autre ennemi sans perdre le sien. Ce sont deux
     * octets de mémoire de travail par méthode, et ils sont comptés comme le
     * reste : le compilateur les annonce à la fin.
     */
    if (n.structure) {
      const structure = e.structures.get(n.structure)
      if (!structure) throw new Error(`ligne ${n.ligne} : « struct ${n.structure} » est inconnue`)
      if (structure.champs.has(n.methode)) {
        throw new Error(
          `ligne ${n.ligne} : « ${n.structure} » a déjà un champ « ${n.methode} » ; ` +
            'un champ et une méthode ne peuvent pas porter le même nom',
        )
      }
      signature.structure = structure
      signature.pointeur = e.motPourVariable(`${n.nom}.this`, n.ligne)
    }

    e.signatures.set(n.nom, signature)
  }

  if (!e.signatures.has('main')) {
    throw new Error(
      'ligne 1 : il manque « int main() » — c\'est par là que la console commence. ' +
        'Tout ce qui doit s\'exécuter s\'écrit dedans.',
    )
  }
  if (e.signatures.get('main').parametres.length) {
    throw new Error(`ligne ${e.signatures.get('main').noeud.ligne} : « main » ne prend pas d'argument sur cette console`)
  }

  /* --- les globales, dans l'ordre où elles sont écrites --- */
  const initialisations = []
  for (const n of programme) {
    if (n.genre !== 'declarer') continue
    resoudreDeclaration(e, n, global, initialisations)
  }

  /* --- le corps de chaque fonction --- */
  for (const n of programme) {
    if (n.genre !== 'fonction') continue
    const signature = e.signatures.get(n.nom)
    const portee = new Portee(global, `dans « ${n.nom} »`)
    e.fonctionCourante = signature

    /*
     * Dans une méthode, les champs de la structure s'écrivent sous leur nom
     * nu : « x++ » plutôt que « this->x++ ». Ce sont des noms de plus dans la
     * portée, et rien d'autre — le reste du compilateur ne voit aucune
     * différence, et une variable locale qui reprendrait le nom d'un champ
     * s'entend dire qu'il est déjà pris.
     */
    if (signature.structure) {
      for (const [nomChamp, champ] of signature.structure.champs) {
        portee.definir(
          nomChamp,
          { genre: 'champThis', nom: nomChamp, champ, pointeur: signature.pointeur },
          n.ligne,
        )
      }
    }

    for (const parametre of n.parametres) {
      /* La valeur par défaut est lue dans la portée du DEHORS : elle ne peut
         nommer que des constantes et des globales, jamais un autre argument. */
      if (parametre.defaut) resoudreExpression(e, parametre.defaut, global)

      if (!estUnOctet(e, parametre.type)) {
        throw new Error(
          `ligne ${parametre.ligne} : un argument est un octet ; ` +
            `« ${parametre.type.nom} » se passe par son nom, qui est visible partout`,
        )
      }
      const adresse = e.octetPourVariable(`${n.nom}.${parametre.nom}`, parametre.ligne)
      parametre.symbole = portee.definir(parametre.nom, { genre: 'octet', adresse, nom: parametre.nom }, parametre.ligne)
    }

    signature.retourne = false
    resoudreCorps(e, n.corps, portee)

    if (signature.retour !== 'void' && !signature.retourne && n.nom !== 'main') {
      throw new Error(
        `ligne ${n.ligne} : « ${n.nom} » annonce rendre un ${signature.retour}, ` +
          'mais aucun « return » ne le fait. Écrire « void » si elle ne rend rien.',
      )
    }
    e.fonctionCourante = null
  }

  verifierRecursion(e)
  return initialisations
}

const estUnOctet = (e, type) => !e.structures.has(type.nom) && type.nom !== 'void'

/**
 * Une déclaration : variable, tableau, structure, table gravée, ou tuile.
 * `initialisations` reçoit ce qu'il faudra exécuter pour lui donner sa valeur.
 */
function resoudreDeclaration(e, n, portee, initialisations) {
  const nomComplet = portee === e.global ? n.nom : `${e.fonctionCourante.nom}.${n.nom}`

  /* Un nom que la console porte déjà — un bouton, une note, une option de
     lutin — est refusé ICI, là où il est écrit. Le laisser passer donnerait
     une faute plus loin, sur une ligne qui n'y est pour rien. */
  const deja = e.nomsDeLaConsole?.get(n.nom)
  if (deja) {
    throw new Error(
      `ligne ${n.ligne} : « ${n.nom} » est déjà ${deja} — choisir un autre nom.` +
        (BOUTONS[n.nom] !== undefined ? ' Sans cela, « bouton(' + n.nom + ') » ne parlerait plus du bouton.' : ''),
    )
  }

  /* Une tuile dessinée : son nom devient son numéro, connu à la compilation. */
  if (n.type.nom === 'Tuile' || n.type.nom === 'Perso') {
    const cote = n.type.nom === 'Perso' ? 16 : 8
    if (n.tableau) throw new Error(`ligne ${n.ligne} : un ${n.type.nom} ne se met pas en tableau`)
    if (!n.valeur || n.valeur.genre !== 'liste') {
      throw new Error(
        `ligne ${n.ligne} : « ${n.type.nom} ${n.nom} » veut ses ${cote} rangées, ` +
          `comme ${n.type.nom} ${n.nom} = { "${'3'.repeat(cote)}", … };`,
      )
    }
    const rangees = n.valeur.valeurs.map((v) => {
      if (v.genre !== 'texte') {
        throw new Error(`ligne ${v.ligne ?? n.ligne} : une rangée de ${n.type.nom} s'écrit entre guillemets`)
      }
      return v.valeur
    })
    const dessin = e.dessiner(n.nom, rangees, n.ligne, cote)
    n.symbole = portee.definir(n.nom, { genre: 'constante', valeur: dessin.numero, tuile: true }, n.ligne)
    return
  }

  /* Une mélodie : une suite de pas, gravée dans la cartouche. Son nom ne
     désigne pas un nombre — il ne se lit ni ne s'additionne : il se joue. */
  if (n.type.nom === 'Air') {
    if (n.tableau) throw new Error(`ligne ${n.ligne} : un Air ne se met pas en tableau`)
    if (!n.valeur || n.valeur.genre !== 'liste') {
      throw new Error(
        `ligne ${n.ligne} : « Air ${n.nom} » veut ses pas, ` +
          `comme Air ${n.nom} = { "DO4 12", "MI4 12", "--", … };`,
      )
    }
    const pas = n.valeur.valeurs.map((v) => {
      if (v.genre !== 'texte') throw new Error(`ligne ${v.ligne ?? n.ligne} : un pas d'Air s'écrit entre guillemets`)
      return v.valeur
    })
    const air = e.composer(n.nom, pas, n.ligne)
    n.symbole = portee.definir(n.nom, { genre: 'air', ...air }, n.ligne)
    return
  }

  /*
   * Un mot et sa place, sous un seul nom.
   *
   *   Mot SALUT = { 5, 6, "BONJOUR" };
   *   texte(SALUT);
   *   effacer(SALUT);
   *
   * Rien n'est rangé en mémoire : le nom retient les trois morceaux, et
   * texte() comme effacer() les reçoivent tels qu'ils sont écrits ici. La
   * colonne et la ligne peuvent être des variables : elles sont relues à
   * chaque appel.
   */
  if (n.type.nom === 'Mot') {
    if (n.tableau) throw new Error(`ligne ${n.ligne} : un Mot ne se met pas en tableau`)
    const morceaux = n.valeur && n.valeur.genre === 'liste' ? n.valeur.valeurs : []
    if (morceaux.length !== 3) {
      throw new Error(
        `ligne ${n.ligne} : « Mot ${n.nom} » veut sa colonne, sa ligne et son texte, ` +
          `comme Mot ${n.nom} = { 5, 6, "BONJOUR" };`,
      )
    }
    const [x, y, texte] = morceaux
    for (const morceau of morceaux) resoudreExpression(e, morceau, portee)
    if (texteDe(texte) === null) {
      throw new Error(
        `ligne ${n.ligne} : le troisième morceau d'un Mot est un texte entre guillemets, ` +
          'ou le nom d\'un « const char NOM[] = "…"; »',
      )
    }
    n.symbole = portee.definir(n.nom, { genre: 'mot', x, y, texte }, n.ligne)
    return
  }

  const element = elementDuType(e, n.type)

  /*
   * Un texte qui porte un nom.
   *
   *   const char TITRE[] = "TRACE UNE ZONE";
   *   texte(4, 1, TITRE);
   *
   * Le même message écrit à trois endroits, c'est trois occasions de le
   * changer à deux endroits sur trois. Nommé une fois, il n'est plus qu'à un
   * seul endroit — et il ne coûte pas un octet de mémoire de travail : il est
   * gravé dans la cartouche, comme les guillemets écrits sur place.
   *
   * Le contenu est converti en numéros de tuile au moment de graver, par le
   * même chemin que les textes écrits en clair : il n'y a qu'une police, et
   * qu'une façon de la lire.
   */
  if (n.tableau && n.valeur && n.valeur.genre === 'texte') {
    if (!n.type.constant) {
      throw new Error(
        `ligne ${n.ligne} : un texte nommé est gravé dans la cartouche — écrire ` +
          `« const ${n.type.nom} ${n.nom}[] = "${n.valeur.valeur}"; ». ` +
          'Sans « const », il faudrait le recopier en mémoire de travail à chaque partie.',
      )
    }
    if (!n.valeur.valeur.length) throw new Error(`ligne ${n.ligne} : « ${n.nom} » est un texte vide`)
    if (n.valeur.valeur.length > 255) {
      throw new Error(`ligne ${n.ligne} : « ${n.nom} » fait ${n.valeur.valeur.length} lettres ; le compte s'arrête à 255`)
    }

    const etiquette = neuve(`Texte_${n.nom}`)
    e.textes.push({ etiquette, contenu: n.valeur.valeur })
    n.symbole = portee.definir(n.nom, {
      genre: 'table', etiquette, element, combien: n.valeur.valeur.length, colonnes: null,
      taille: n.valeur.valeur.length, tableau: true, nom: n.nom, texte: n.valeur.valeur,
    }, n.ligne)
    return
  }

  /* Un tableau, ou une structure : une zone de mémoire, et son nom en désigne
     le premier octet. Une zone constante est gravée dans la cartouche. */
  if (n.tableau || element.genre === 'structure') {
    let combien = null
    let colonnes = null

    if (n.tableau) {
      if (n.colonnes) {
        resoudreExpression(e, n.colonnes, portee)
        colonnes = tailleExigee(n.colonnes, 'la largeur d\'une grille s\'écrit en clair', n.ligne)
        if (colonnes === 0) throw new Error(`ligne ${n.ligne} : une grille de zéro colonne ne sert à rien`)
      }

      if (n.dimension) {
        resoudreExpression(e, n.dimension, portee)
        combien = tailleExigee(n.dimension, 'la taille d\'un tableau s\'écrit en clair', n.ligne)
        if (combien === 0) throw new Error(`ligne ${n.ligne} : un tableau de zéro case ne sert à rien`)
      } else if (n.valeur && n.valeur.genre === 'liste') {
        combien = n.valeur.valeurs.length
      } else {
        throw new Error(
          `ligne ${n.ligne} : « ${n.nom}[] » sans taille ni valeurs — écrire ` +
            `« ${n.type.nom} ${n.nom}[180]; » ou donner la liste de son contenu`,
        )
      }

      /*
       * Un index tient sur un octet, et un octet s'arrête à 255.
       *
       * Un tableau de trois cents cases était accepté sans un mot — et ses
       * quarante dernières étaient inatteignables autrement qu'avec un nombre
       * écrit en clair. C'est exactement le « traduit à peu près » que ce
       * compilateur s'interdit : mieux vaut le dire ici que le laisser
       * découvrir au joueur.
       */
      const cases = colonnes !== null ? combien * colonnes : combien
      if (cases > 256) {
        const explication = colonnes !== null
          ? `« ${n.nom}[${combien}][${colonnes}] » en fait ${cases}`
          : `« ${n.nom} » en demande ${cases}`
        throw new Error(
          `ligne ${n.ligne} : un tableau va jusqu'à 256 cases, et ${explication}. ` +
            'L\'index tient sur un octet : au-delà, les dernières cases seraient ' +
            'hors d\'atteinte, sans que rien ne le dise. Découper en plusieurs tableaux.',
        )
      }
    }

    if (n.type.constant) {
      if (!n.valeur || n.valeur.genre !== 'liste') {
        throw new Error(`ligne ${n.ligne} : une table « const » est gravée dans la cartouche : il lui faut son contenu`)
      }
      for (const v of n.valeur.valeurs) resoudreListe(e, v, portee)
      const octets = aplatir(e, n.valeur, element, combien === null ? null : combien * (colonnes ?? 1), n.nom, n.ligne)
      const etiquette = e.graver(n.nom, octets)
      n.symbole = portee.definir(n.nom, {
        genre: 'table', etiquette, element, combien: combien ?? 1, colonnes,
        taille: octets.length, tableau: n.tableau, nom: n.nom,
      }, n.ligne)
      return
    }

    const taille = element.taille * (combien ?? 1) * (colonnes ?? 1)
    const base = e.reserver(taille, nomComplet, n.ligne)
    e.variables.set(nomComplet, base)
    e.zones.set(nomComplet, { base, taille, element: element.genre })
    n.symbole = portee.definir(n.nom, {
      genre: 'zone', base, element, combien: combien ?? 1, colonnes, taille, tableau: n.tableau, nom: n.nom,
    }, n.ligne)

    /* Une zone qui a un contenu écrit est recopiée depuis la cartouche, à
       l'endroit où la déclaration est écrite : c'est ce que fait C++, et cela
       vaut aussi pour un tableau déclaré dans une fonction, à chaque appel. */
    if (n.valeur) {
      if (n.valeur.genre !== 'liste') {
        throw new Error(`ligne ${n.ligne} : « ${n.nom} » est un tableau : son contenu s'écrit entre accolades`)
      }
      for (const v of n.valeur.valeurs) resoudreListe(e, v, portee)
      const octets = aplatir(e, n.valeur, element, combien ?? 1, n.nom, n.ligne)
      n.copie = e.graver(n.nom + '_depart', octets)
      n.copieTaille = octets.length
      if (portee === e.global) initialisations.push(n)
    }
    return
  }

  /* Une constante d'un octet : connue à la compilation, elle ne coûte rien. */
  if (n.type.constant) {
    if (!n.valeur) throw new Error(`ligne ${n.ligne} : une constante « const » veut sa valeur`)
    resoudreExpression(e, n.valeur, portee)
    const valeur = constante(n.valeur)
    if (valeur === null) {
      throw new Error(
        `ligne ${n.ligne} : « ${n.nom} » est « const » mais sa valeur n'est pas connue à la compilation. ` +
          'Ôter le « const » pour en faire une variable.',
      )
    }
    n.symbole = portee.definir(n.nom, { genre: 'constante', valeur }, n.ligne)
    return
  }

  /* Une variable d'un octet. */
  const adresse = e.octetPourVariable(nomComplet, n.ligne)
  if (n.valeur) {
    if (n.valeur.genre === 'liste') throw new Error(`ligne ${n.ligne} : « ${n.nom} » n'est pas un tableau`)
    resoudreExpression(e, n.valeur, portee)
    if (portee === e.global) initialisations.push(n)
  }
  n.symbole = portee.definir(n.nom, { genre: 'octet', adresse, nom: n.nom }, n.ligne)
}

/** Les listes imbriquées d'une table gravée. */
function resoudreListe(e, n, portee) {
  if (n.genre === 'liste') {
    for (const v of n.valeurs) resoudreListe(e, v, portee)
    return
  }
  resoudreExpression(e, n, portee)
}

function resoudreCorps(e, corps, portee) {
  for (const n of corps) resoudreInstruction(e, n, portee)
}

function resoudreInstruction(e, n, portee) {
  switch (n.genre) {
    case 'declarer':
      resoudreDeclaration(e, n, portee, [])
      return

    case 'bloc':
      resoudreCorps(e, n.corps, new Portee(portee, 'dans ce bloc'))
      return

    case 'affecter':
      resoudreExpression(e, n.cible, portee)
      if (n.cible.alphabet) throw new Error(`ligne ${n.ligne} : ALPHABET est la police de la console : il se lit, il ne s'écrit pas`)
      if (n.valeur.genre === 'liste') {
        throw new Error(`ligne ${n.ligne} : une liste entre accolades ne s'écrit qu'à la déclaration`)
      }
      resoudreExpression(e, n.valeur, portee)
      return

    case 'si':
      resoudreExpression(e, n.condition, portee)
      resoudreCorps(e, n.alors, new Portee(portee, 'dans ce « if »'))
      if (n.sinon) resoudreCorps(e, n.sinon, new Portee(portee, 'dans ce « else »'))
      return

    case 'tantque':
    case 'faire':
      resoudreExpression(e, n.condition, portee)
      resoudreCorps(e, n.corps, new Portee(portee, 'dans cette boucle'))
      return

    case 'pour': {
      const dedans = new Portee(portee, 'dans ce « for »')
      resoudreCorps(e, n.debut, dedans)
      if (n.condition) resoudreExpression(e, n.condition, dedans)
      resoudreCorps(e, n.pas, dedans)
      resoudreCorps(e, n.corps, new Portee(dedans, 'dans ce « for »'))
      return
    }

    case 'choisir': {
      resoudreExpression(e, n.quoi, portee)
      let defaut = false
      for (const cas of n.cas) {
        if (cas.quand) {
          resoudreExpression(e, cas.quand, portee)
          cas.valeur = nombreExige(cas.quand, 'un « case » veut une valeur connue à la compilation', cas.ligne)
        } else {
          if (defaut) throw new Error(`ligne ${cas.ligne} : un « switch » n'a qu'un seul « default »`)
          defaut = true
        }
        resoudreCorps(e, cas.corps, new Portee(portee, 'dans ce « case »'))
      }
      return
    }

    case 'retour':
      if (n.valeur) {
        if (!e.fonctionCourante) throw new Error(`ligne ${n.ligne} : « return » hors d'une fonction`)
        if (e.fonctionCourante.retour === 'void') {
          throw new Error(
            `ligne ${n.ligne} : « ${e.fonctionCourante.nom} » est « void » : ` +
              'elle ne rend rien, et « return » s\'y écrit seul',
          )
        }
        resoudreExpression(e, n.valeur, portee)
        e.fonctionCourante.retourne = true
      }
      return

    case 'expression':
      resoudreExpression(e, n.valeur, portee)
      return

    case 'casser':
    case 'continuer':
      return

    default:
      throw new Error(`ligne ${n.ligne} : instruction « ${n.genre} » non comprise`)
  }
}

function resoudreExpression(e, n, portee) {
  switch (n.genre) {
    case 'nombre':
    case 'texte':
      return

    case 'variable': {
      const symbole = portee.chercher(n.nom)
      if (!symbole) {
        const proches = [...portee.noms.keys(), ...e.signatures.keys()]
          .filter((autre) => autre.toUpperCase() === n.nom.toUpperCase() && autre !== n.nom)
        throw new Error(
          `ligne ${n.ligne} : « ${n.nom} » n'est pas déclaré ici` +
            (proches.length ? `. Peut-être « ${proches[0]} » ?` : ''),
        )
      }
      n.symbole = symbole
      return
    }

    case 'index':
      resoudreExpression(e, n.cible, portee)
      resoudreExpression(e, n.index, portee)

      /* ALPHABET[i] devient « 1 + i » : le numéro de la tuile de la lettre. */
      if (n.cible.symbole?.genre === 'alphabet') {
        const i = constante(n.index)
        if (i !== null && i > 25) {
          throw new Error(`ligne ${n.ligne} : ALPHABET va de l'indice 0 (A) à 25 (Z) ; ${i} est au-delà`)
        }
        Object.assign(n, {
          genre: 'calcul', operateur: '+', alphabet: true,
          gauche: { genre: 'nombre', valeur: 1, ligne: n.ligne }, droite: n.index,
        })
      }
      return

    case 'champ':
      resoudreExpression(e, n.cible, portee)
      return

    case 'calcul':
    case 'comparer':
    case 'logique':
      resoudreExpression(e, n.gauche, portee)
      resoudreExpression(e, n.droite, portee)
      return

    case 'non':
    case 'complement':
    case 'oppose':
      resoudreExpression(e, n.valeur, portee)
      return

    case 'ternaire':
      resoudreExpression(e, n.condition, portee)
      resoudreExpression(e, n.alors, portee)
      resoudreExpression(e, n.sinon, portee)
      return

    case 'incrementer':
      resoudreExpression(e, n.cible, portee)
      if (n.cible.alphabet) throw new Error(`ligne ${n.ligne} : ALPHABET est la police de la console : il se lit, il ne s'écrit pas`)
      return

    case 'taille': {
      if (n.valeur.genre === 'type') {
        n.tailleCalculee = tailleDuType(e, n.valeur.type, n.ligne)
        return
      }
      resoudreExpression(e, n.valeur, portee)
      n.tailleCalculee = tailleDe(e, n.valeur, n.ligne)
      return
    }

    /*
     * « troupe[i].avancer() ».
     *
     * La structure de la cible est connue dès maintenant : `lieu` ne fait que
     * décrire un endroit, sans rien émettre, donc on peut le lui demander ici
     * pour savoir de quelle « struct » il s'agit — et donc quelle méthode est
     * appelée. Ce qui sera émis plus tard, c'est le calcul de l'adresse.
     */
    case 'appelMethode': {
      resoudreExpression(e, n.cible, portee)
      for (const argument of n.arguments) resoudreExpression(e, argument, portee)

      const place = lieu(e, n.cible)
      if (!place.structure) {
        throw new Error(`ligne ${n.ligne} : « .${n.nom}() » ne s'écrit qu'après une « struct »`)
      }
      if (place.rom) {
        throw new Error(
          `ligne ${n.ligne} : c'est une table « const », gravée dans la cartouche : ` +
            'une méthode pourrait vouloir y écrire. Ôter le « const » pour la mettre ' +
            'en mémoire de travail.',
        )
      }

      const complet = `${place.structure.nom}::${n.nom}`
      if (!e.signatures.has(complet)) {
        const siennes = [...e.signatures.keys()]
          .filter((c) => c.startsWith(`${place.structure.nom}::`))
          .map((c) => c.split('::')[1])
        throw new Error(
          `ligne ${n.ligne} : « ${place.structure.nom} » n'a pas de méthode « ${n.nom} ». ` +
            (siennes.length
              ? `Celles qu'elle a : ${siennes.join(', ')}`
              : "Elle n'en a aucune."),
        )
      }
      if (n.arguments.length) {
        throw new Error(
          `ligne ${n.ligne} : « ${complet} » ne prend pas d'argument, ` +
            `et non ${n.arguments.length}`,
        )
      }

      n.signature = e.signatures.get(complet)
      if (e.fonctionCourante) e.fonctionCourante.appelle.add(complet)
      return
    }

    case 'appel': {
      /*
       * secondes(n) et ms(n) : une durée, convertie en IMAGES (60 par seconde).
       *
       *   if (images == secondes(1))   →   if (images == 60)
       *   if (images == ms(250))       →   if (images == 15)
       *
       * La conversion est faite ICI, une fois pour toutes : l'appel devient le
       * nombre, et la cartouche n'en garde rien. C'est aussi ce qui permet
       * « const uint8_t DUREE = ms(250); ». Le nombre doit donc être écrit en
       * clair — il est lu tel quel, et 1000 passe, même s'il ne tient pas dans
       * un octet : c'est le résultat qui doit tenir, pas ce qu'on convertit.
       */
      if ((n.nom === 'secondes' || n.nom === 'ms') && !e.signatures.has(n.nom)) {
        if (n.arguments.length !== 1) {
          throw new Error(`ligne ${n.ligne} : ${n.nom}() prend un seul nombre : ${n.nom === 'ms' ? 'ms(250)' : 'secondes(2)'}`)
        }
        const quoi = n.arguments[0]
        let duree = quoi.genre === 'nombre' ? quoi.valeur : null
        if (duree === null) {
          resoudreExpression(e, quoi, portee)
          duree = constante(quoi)
        }
        if (duree === null) {
          throw new Error(
            `ligne ${n.ligne} : ${n.nom}() veut un nombre écrit en clair, comme ${n.nom === 'ms' ? 'ms(250)' : 'secondes(2)'} : ` +
              'la conversion en images est faite à la compilation, pas pendant le jeu',
          )
        }
        const images = n.nom === 'secondes' ? duree * 60 : Math.round((duree * 60) / 1000)
        if (images > 255) {
          throw new Error(
            `ligne ${n.ligne} : ${n.nom}(${duree}) fait ${images} images, et un compteur uint8_t s'arrête à 255 ` +
              '(environ 4,25 secondes, soit 4250 ms). Pour attendre plus longtemps sans compter : attendre(secondes).',
          )
        }
        if (images === 0 && duree > 0) {
          throw new Error(`ligne ${n.ligne} : ms(${duree}) fait moins d'une image : la console ne compte pas en dessous de 16,7 ms`)
        }
        for (const cle of Object.keys(n)) if (cle !== 'ligne') delete n[cle]
        Object.assign(n, { genre: 'nombre', valeur: images })
        return
      }

      /*
       * Un dessin écrit sur place n'a rien à résoudre : ni nom, ni portée.
       *
       * Il est gravé à l'ÉMISSION, c'est-à-dire après que toutes les « Tuile »
       * et tous les « Perso » déclarés ont pris leur numéro. Ainsi, écrire un
       * dessin au milieu d'une fonction ne décale le numéro d'aucune tuile
       * nommée — et l'atelier, qui les compte dans l'ordre du texte, continue
       * de dire vrai.
       */
      const attendue = e.signatures.has(n.nom) ? undefined : TUILE_ATTENDUE.get(n.nom)
      n.arguments.forEach((argument, rang) => {
        if (attendue && rang === attendue.rang && argument.genre === 'liste') return
        resoudreExpression(e, argument, portee)
      })

      /*
       * Dans une méthode, « vivant() » sans rien devant, c'est « la mienne » —
       * comme en C++. L'objet en cours est passé tel quel à l'appelée, qui a
       * ses propres deux octets pour le recevoir.
       */
      if (!e.signatures.has(n.nom) && e.fonctionCourante && e.fonctionCourante.structure) {
        const sienne = `${e.fonctionCourante.structure.nom}::${n.nom}`
        if (e.signatures.has(sienne)) {
          n.nom = sienne
          n.surSoi = true
        }
      }

      if (e.signatures.has(n.nom)) {
        n.signature = e.signatures.get(n.nom)
        if (e.fonctionCourante) e.fonctionCourante.appelle.add(n.nom)
        /*
         * Les arguments par défaut sont remplis ICI, à l'appel, et non dans la
         * fonction : c'est ce que fait C++, et cela permet à la valeur par
         * défaut de dépendre de l'endroit d'où l'on appelle.
         */
        const parametres = n.signature.parametres
        const obligatoires = parametres.filter((p) => !p.defaut).length

        if (n.arguments.length < obligatoires || n.arguments.length > parametres.length) {
          const combien = obligatoires === parametres.length
            ? `${parametres.length} argument${parametres.length > 1 ? 's' : ''}`
            : `de ${obligatoires} à ${parametres.length} arguments`
          throw new Error(
            `ligne ${n.ligne} : « ${n.nom} » prend ${combien}, et non ${n.arguments.length}`,
          )
        }

        for (let i = n.arguments.length; i < parametres.length; i++) {
          n.arguments.push(parametres[i].defaut)
          resoudreExpression(e, parametres[i].defaut, portee)
        }
        return
      }
      if (!BUILTINS.has(n.nom)) {
        const connues = [...e.signatures.keys()]
        throw new Error(
          `ligne ${n.ligne} : fonction inconnue « ${n.nom} ». Celles de la console : ` +
            [...BUILTINS].join(', ') +
            (connues.length ? `. Les vôtres : ${connues.join(', ')}` : ''),
        )
      }
      return
    }

    /*
     * Des accolades ailleurs qu'aux quatre endroits qui savent les lire.
     *
     * Le dire ICI, à la résolution, plutôt que de laisser l'émission se
     * plaindre d'une « expression non comprise » : le programme a écrit un
     * dessin, il faut lui dire où un dessin se pose.
     */
    case 'liste':
      throw new Error(
        `ligne ${n.ligne} : une liste entre accolades s'écrit à la déclaration — ` +
          '« Tuile MUR = {…}; » — ou comme dessin posé sur place, dans poser(), ' +
          'poserPanneau(), sprite() ou sprite16(). Ailleurs, elle ne tient pas dans un octet.',
      )

    default:
      throw new Error(`ligne ${n.ligne} : expression « ${n.genre} » non comprise`)
  }
}

/** Combien d'octets occupe ce qu'une expression désigne. */
function tailleDe(e, n, ligne) {
  if (n.genre === 'variable' && n.symbole) {
    if (n.symbole.genre === 'zone' || n.symbole.genre === 'table' || n.symbole.genre === 'alphabet') return n.symbole.taille
    return 1
  }
  if (n.genre === 'index') {
    const conteneur = n.cible.symbole
    if (conteneur && (conteneur.genre === 'zone' || conteneur.genre === 'table')) return conteneur.element.taille
    return 1
  }
  return 1
}

/**
 * Une fonction ne peut pas s'appeler elle-même, ni par un détour.
 *
 * Les arguments vivent dans des octets réservés à la fonction, une fois pour
 * toutes — c'est ce que fait tout compilateur C d'une machine huit bits, faute
 * d'une pile où les empiler à peu de frais. Un second appel, imbriqué dans le
 * premier, écraserait donc les arguments du premier : la fonction reprendrait
 * son travail avec les valeurs de l'autre. C'est un bogue silencieux, et
 * indébogable. On préfère le nommer avant qu'il n'arrive.
 */
function verifierRecursion(e) {
  const etat = new Map() // 0 : pas vu, 1 : en cours, 2 : fini
  const chemin = []

  const visiter = (nom) => {
    if (etat.get(nom) === 2) return
    if (etat.get(nom) === 1) {
      const boucle = [...chemin.slice(chemin.indexOf(nom)), nom].join(' → ')
      const signature = e.signatures.get(nom)
      /* Une méthode sans argument tombe dans le même piège, mais pour une
         autre raison : c'est « this » qui vit à une place fixe. Le dire
         franchement évite de chercher des arguments qui n'existent pas. */
      const quoi = signature.structure && !signature.parametres.length
        ? 'L\'objet sur lequel travaille une méthode vit à une place fixe : un appel imbriqué ' +
          'écraserait celui de l\'appel en cours.'
        : 'Les arguments d\'une fonction vivent à une place fixe : un appel imbriqué écraserait ' +
          'ceux de l\'appel en cours.'
      throw new Error(
        `ligne ${signature.noeud.ligne} : « ${nom} » finit par s'appeler elle-même (${boucle}). ` +
          `${quoi} Dérouler la boucle avec « while ».`,
      )
    }
    etat.set(nom, 1)
    chemin.push(nom)
    for (const appelee of e.signatures.get(nom).appelle) {
      if (e.signatures.has(appelee)) visiter(appelee)
    }
    chemin.pop()
    etat.set(nom, 2)
  }

  for (const nom of e.signatures.keys()) visiter(nom)
}

/* ------------------------------------------------------------- les lieux */

/**
 * Où vit ce qu'une expression désigne.
 *
 * Rend un descriptif : une adresse connue à la compilation, ou un calcul à
 * faire. Le calcul n'est pas encore émis — c'est `chargerLieu` et `rangerLieu`
 * qui décident du bon ordre, car l'adresse et la valeur se disputent le même
 * registre.
 */
function lieu(e, n) {
  if (n.genre === 'variable') {
    const s = n.symbole
    if (s.genre === 'octet') return { fixe: s.adresse, rom: false }
    /*
     * Un champ atteint par « this ». L'adresse de départ n'est pas un nombre
     * connu : elle est lue dans les deux octets de la méthode, au moment où
     * l'instruction s'exécute. C'est la seule sorte de lieu dont la base soit
     * en mémoire plutôt que dans la cartouche.
     */
    if (s.genre === 'champThis') {
      const place = {
        pointeur: s.pointeur,
        decalage: s.champ.decalage,
        rom: false,
        structure: s.champ.element.structure,
        champ: s.champ,
      }
      if (s.champ.tableau) place.tableauChamp = true
      return place
    }
    if (s.genre === 'constante') throw new Error(`ligne ${n.ligne} : « ${n.nom} » est une constante : elle ne change pas`)
    if (s.genre === 'zone') {
      if (s.tableau) throw new Error(`ligne ${n.ligne} : « ${n.nom} » est un tableau ; il faut dire quelle case`)
      return { fixe: s.base, rom: false, structure: s.element.structure }
    }
    if (s.genre === 'table') {
      return { etiquette: s.etiquette, decalage: 0, index: null, rom: true, structure: s.element.structure, sym: s }
    }
    if (s.genre === 'air') {
      throw new Error(
        `ligne ${n.ligne} : « ${n.nom} » est un Air : il ne se lit pas, il se joue — ` +
          `jouer(1, ${n.nom}, 8);`,
      )
    }
    if (s.genre === 'alphabet') {
      throw new Error(`ligne ${n.ligne} : ALPHABET est un tableau : il faut dire quelle lettre, comme ALPHABET[0] pour A`)
    }
    if (s.genre === 'mot') {
      throw new Error(
        `ligne ${n.ligne} : « ${n.nom} » est un Mot : il ne se lit pas, il s'écrit ` +
          `avec texte(${n.nom}) et s'efface avec effacer(${n.nom})`,
      )
    }
    throw new Error(`ligne ${n.ligne} : « ${n.nom} » ne se lit pas ainsi`)
  }

  if (n.genre === 'index') {
    const cible = n.cible

    /*
     * Une grille : « carte[ligne][colonne] ».
     *
     * Elle est rangée à plat, ligne après ligne, et le décalage vaut « ligne ×
     * largeur + colonne ». C'est le calcul que tout le monde écrit à la main —
     * et que tout le monde finit par écrire de travers le jour où la largeur
     * change. On le construit ici, une fois, à partir de la largeur déclarée.
     *
     * Le décalage est une expression comme une autre : s'il est entièrement
     * connu, il se replie en un nombre, et « carte[2][3] » ne coûte pas un
     * seul cycle de calcul.
     */
    if (cible.genre === 'index' && cible.cible.genre === 'variable') {
      const grille = cible.cible.symbole
      if (grille && (grille.genre === 'zone' || grille.genre === 'table') && grille.colonnes) {
        const decalage = {
          genre: 'calcul',
          operateur: '+',
          ligne: n.ligne,
          gauche: {
            genre: 'calcul',
            operateur: '*',
            ligne: n.ligne,
            gauche: cible.index,
            droite: { genre: 'nombre', valeur: grille.colonnes, ligne: n.ligne },
          },
          droite: n.index,
        }
        const depart = grille.genre === 'table'
          ? { etiquette: grille.etiquette, decalage: 0, index: null, rom: true }
          : { fixe: grille.base, rom: false }
        return indexer(e, depart, grille.element, decalage, n.ligne)
      }
    }

    const s = cible.genre === 'variable' ? cible.symbole : null

    /* Une grille veut ses DEUX index : « carte[ligne] » seul désignerait une
       rangée entière, et non un octet. Mieux vaut le dire. */
    if (s && s.colonnes) {
      throw new Error(
        `ligne ${n.ligne} : « ${s.nom} » est une grille de ${s.combien} sur ${s.colonnes} : ` +
          `il faut deux index, comme « ${s.nom}[ligne][colonne] ».`,
      )
    }

    if (!s || (s.genre !== 'zone' && s.genre !== 'table')) {
      /* Un champ tableau : « joueur.tirs[2] », ou « tirs[2] » écrit dans une
         méthode — dans les deux cas le champ donne la base. */
      if (cible.genre === 'champ' || (s && s.genre === 'champThis')) {
        const dessous = lieu(e, cible)
        return indexer(e, dessous, dessous.champ?.element ?? TAILLE_OCTET, n.index, n.ligne)
      }
      throw new Error(`ligne ${n.ligne} : ce qui est indexé n'est pas un tableau`)
    }
    const base = s.genre === 'table'
      ? { etiquette: s.etiquette, decalage: 0, index: null, rom: true }
      : { fixe: s.base, rom: false }
    return indexer(e, base, s.element, n.index, n.ligne)
  }

  if (n.genre === 'champ') {
    const dessous = lieu(e, n.cible)
    const structure = dessous.structure
    if (!structure) {
      throw new Error(`ligne ${n.ligne} : « .${n.nom} » ne s'écrit qu'après une « struct »`)
    }
    const champ = structure.champs.get(n.nom)
    if (!champ) {
      throw new Error(
        `ligne ${n.ligne} : « ${structure.nom} » n'a pas de champ « ${n.nom} ». ` +
          `Ceux qu'elle a : ${[...structure.champs.keys()].join(', ')}`,
      )
    }
    const place = decaler(dessous, champ.decalage)
    place.structure = champ.element.structure
    place.champ = champ
    if (champ.tableau) place.tableauChamp = true
    return place
  }

  throw new Error(`ligne ${n.ligne} : cette expression ne désigne pas un endroit de la mémoire`)
}

/** Le même lieu, décalé d'un nombre d'octets connu. */
function decaler(place, combien) {
  if (combien === 0) return { ...place }
  if (place.fixe !== undefined) return { ...place, fixe: place.fixe + combien }
  return { ...place, decalage: (place.decalage ?? 0) + combien }
}

/** Le lieu d'une case : base + index × la taille d'un élément. */
function indexer(e, base, element, index, ligne) {
  const connu = constante(index)
  if (connu !== null) {
    const place = decaler(base, connu * element.taille)
    place.structure = element.structure
    delete place.tableauChamp
    delete place.champ
    return place
  }
  if (base.index) {
    throw new Error(`ligne ${ligne} : un seul index calculé à la fois ; passer par une variable`)
  }
  const place = { ...base, index, echelle: element.taille, structure: element.structure }
  delete place.tableauChamp
  delete place.champ
  if (place.fixe !== undefined) { place.base = place.fixe; delete place.fixe }
  place.decalage = place.decalage ?? 0
  return place
}

/**
 * Ce lieu demande-t-il un calcul d'adresse, plutôt qu'une adresse écrite ?
 *
 * Deux cas : un index qui n'est connu qu'à l'exécution, et un champ atteint
 * par le « this » d'une méthode. Les deux finissent dans `hl`.
 */
const estCalcule = (place) => Boolean(place.index) || place.pointeur !== undefined

/** Met dans `hl` l'adresse d'un lieu calculé. `a` est perdu. */
function adresserLieu(e, place) {
  /* Par « this » : la base est lue en mémoire. Sans index, deux chargements
     suffisent et il n'y a rien à additionner quand le champ est le premier. */
  if (place.pointeur !== undefined) {
    if (place.index) {
      valeur(e, place.index)
      e.echelonner(place.echelle)
      e.ldDEdeAdresse(place.pointeur)
      e.addHLDE()
    } else {
      e.ldHLdeAdresse(place.pointeur)
    }
    if (place.decalage) {
      e.ldDE(place.decalage & 0xffff)
      e.addHLDE()
    }
    return
  }

  valeur(e, place.index)
  e.echelonner(place.echelle)
  if (place.etiquette) e.ldDEetiquette(place.etiquette, place.decalage)
  else e.ldDE((place.base + place.decalage) & 0xffff)
  e.addHLDE()
}

/** Ce lieu désigne-t-il bien UN octet ? */
function verifierLieu(place, ligne) {
  if (place.tableauChamp) {
    throw new Error(`ligne ${ligne} : ce champ est un tableau ; il faut dire quelle case`)
  }
  if (place.structure) {
    throw new Error(
      `ligne ${ligne} : une « struct » ne se lit ni ne s'écrit d'un bloc ; nommer un de ses champs`,
    )
  }
}

/** Met dans `a` ce qui est rangé à ce lieu. */
function chargerLieu(e, place, ligne) {
  verifierLieu(place, ligne)
  if (estCalcule(place)) {
    adresserLieu(e, place)
    e.ldAdeHL()
    return
  }
  if (place.etiquette) {
    e.ldHLetiquette(place.etiquette, place.decalage ?? 0)
    e.ldAdeHL()
    return
  }
  e.chargerDe(place.fixe)
}

/** Range `a` à ce lieu. La valeur est déjà dans `a`. */
function rangerLieu(e, place, ligne) {
  if (place.rom) {
    throw new Error(
      `ligne ${ligne} : c'est une table « const », gravée dans la cartouche : elle ne change pas. ` +
        'Ôter le « const » pour la mettre en mémoire de travail.',
    )
  }
  verifierLieu(place, ligne)
  if (estCalcule(place)) {
    /* La valeur est mise à l'abri : calculer l'adresse écrase `a`. */
    e.ldhDepuisA(BROUILLON)
    adresserLieu(e, place)
    e.ldhVersA(BROUILLON)
    e.ldHLA()
    return
  }
  e.rangerA(place.fixe)
}

/**
 * Un lieu qu'on va lire puis réécrire : « x++ », « t[i] += 3 ».
 *
 * L'adresse n'est calculée qu'une seule fois, et gardée sur la pile. La
 * recalculer rejouerait l'index — et « t[i++] += 1 » avancerait deux fois,
 * pour écrire ailleurs que là où il vient de lire.
 */
function accesUnique(e, place, ligne) {
  verifierLieu(place, ligne)
  if (place.rom) {
    throw new Error(
      `ligne ${ligne} : c'est une table « const », gravée dans la cartouche : elle ne change pas.`,
    )
  }
  if (!estCalcule(place)) {
    return {
      lire: () => chargerLieu(e, place, ligne),
      ecrire: () => rangerLieu(e, place, ligne),
    }
  }
  adresserLieu(e, place)
  e.ecrire(0xe5) // push hl — l'adresse attend là, à l'abri des calculs
  return {
    lire: () => { e.ecrire(0xe1, 0xe5); e.ldAdeHL() }, // pop hl ; push hl
    /*
     * Écrire dépile l'adresse : `a` porte la valeur, et doit y survivre — un
     * « i++ » suffixé rend ce qu'il vient de ranger. On passe donc par `b`,
     * plutôt que par la pile, qui sert déjà à porter l'adresse.
     */
    ecrire: () => { e.ldBA(); e.ecrire(0xe1); e.ldAB(); e.ldHLA() },
  }
}

/**
 * `a` porte déjà la valeur de gauche : on lui applique l'opérateur.
 *
 * C'est le seul endroit où un opérateur binaire est traduit — « p * q » et
 * « p *= q » y passent tous les deux. En avoir deux copies, c'était garantir
 * qu'une amélioration n'en toucherait qu'une, et qu'un jour les deux écritures
 * ne calculeraient plus pareil.
 *
 * Quand la droite est connue à la compilation, on ne passe **ni par la pile ni
 * par une routine** :
 *
 *   x + 3    →  add a, 3            deux octets
 *   x * 100  →  sept doublements et trois additions
 *   x / 16   →  quatre décalages
 *   x % 16   →  and $0F
 *
 * La multiplication mérite un mot. La routine générale boucle sur son opérande
 * de droite : « x * 100 » lui demandait cent tours quand « 100 * x » n'en
 * demandait que x — vingt fois l'écart, mesuré, pour deux écritures que tout le
 * monde croit équivalentes. Personne ne peut deviner cela en lisant son
 * programme. Quand la constante est là, elle se déroule.
 */
function appliquer(e, operateur, droite, ligne) {
  const connu = constante(droite)

  if (connu !== null) {
    switch (operateur) {
      case '+': if (connu !== 0) e.addN(connu); return
      case '-': if (connu !== 0) e.subN(connu); return
      case '&': e.andN(connu); return
      case '|': if (connu !== 0) e.orN(connu); return
      case '^': if (connu !== 0) e.xorN(connu); return

      case '*': return multiplierPar(e, connu)

      case '<<':
      case '>>': {
        if (connu >= 8) return e.xorA()
        for (let i = 0; i < connu; i++) operateur === '<<' ? e.addA() : e.srlA()
        return
      }

      case '/': {
        if (connu === 1) return
        /* Diviser par seize, c'est décaler de quatre. */
        const puissance = puissanceDeDeux(connu)
        if (puissance !== null) {
          for (let i = 0; i < puissance; i++) e.srlA()
          return
        }
        break // un diviseur quelconque : la routine reste le plus court
      }

      case '%': {
        if (connu === 1) return e.xorA()
        /* Le reste d'une division par seize, ce sont les quatre bits du bas. */
        const puissance = puissanceDeDeux(connu)
        if (puissance !== null) return e.andN(connu - 1)
        break
      }
    }
  }

  /* La gauche est mise sur la PILE, pas dans un registre : calculer la droite
     peut appeler une routine, et une routine se sert des registres. Garder
     « b » ici donnait « p * q + 1 » égal à « p * q » — un calcul faux, sans le
     moindre message. */
  e.pushAF()
  valeur(e, droite)
  e.ldBA()
  e.popAF() // la gauche revient dans a

  switch (operateur) {
    case '+': return e.addB()
    case '-': return e.subB()
    case '&': return e.andB()
    case '|': return e.orB()
    case '^': return e.xorB()
    case '*': return e.call('Multiplier')
    case '/': return e.call('Diviser')
    case '%': return e.call('Reste')
    case '<<': return e.call('DecalerGauche')
    case '>>': return e.call('DecalerDroite')
    default: throw new Error(`ligne ${ligne} : opérateur « ${operateur} » non compris`)
  }
}

/* ---------------------------------------------------------- les expressions */

/** Met la valeur de l'expression dans `a`. */
function valeur(e, n) {
  const connu = constante(n)
  if (connu !== null) {
    if (connu === 0) e.xorA()
    else e.ldA(connu)
    return
  }

  switch (n.genre) {
    case 'nombre':
      e.ldA(n.valeur & 0xff)
      return

    case 'variable':
    case 'index':
    case 'champ':
      chargerLieu(e, lieu(e, n), n.ligne)
      return

    case 'calcul': {
      /* « 100 * x » et « x * 100 » doivent coûter la même chose : quand
         l'opérateur ne s'en soucie pas, on met le nombre connu à droite, là
         où il sera déroulé. */
      const commutatif = ['*', '+', '&', '|', '^'].includes(n.operateur)
      const echange = commutatif && constante(n.gauche) !== null && constante(n.droite) === null
      valeur(e, echange ? n.droite : n.gauche)
      appliquer(e, n.operateur, echange ? n.gauche : n.droite, n.ligne)
      return
    }

    case 'comparer': {
      /* Une seule soustraction sert à toutes les comparaisons. « plus grand »
         et « plus petit ou égal » se font en échangeant les deux côtés, plutôt
         qu'en recalculant : recalculer une expression pourrait la rejouer, avec
         ses effets. */
      const inverse = n.operateur === '>' || n.operateur === '<='
      const premier = inverse ? n.droite : n.gauche
      const second = inverse ? n.gauche : n.droite

      valeur(e, premier)
      e.pushAF()
      valeur(e, second)
      e.ldBA()
      e.popAF()
      e.subB() // premier - second : les drapeaux disent tout

      const vrai = neuve('vrai')
      const suite = neuve('suite')

      if (n.operateur === '==') e.jrZ(vrai)
      else if (n.operateur === '!=') e.jrNZ(vrai)
      else if (n.operateur === '<' || n.operateur === '>') e.jrC(vrai)
      else if (n.operateur === '>=' || n.operateur === '<=') e.jrNC(vrai)
      else throw new Error(`ligne ${n.ligne} : comparaison « ${n.operateur} » non comprise`)

      e.xorA()
      e.jr(suite)
      e.poser(vrai)
      e.ldA(1)
      e.poser(suite)
      return
    }

    /*
     * « && » et « || » s'arrêtent dès que la réponse est connue, comme en C++.
     * Ce n'est pas une optimisation : « if (i < n && t[i] == 0) » compte
     * là-dessus pour ne pas lire une case hors du tableau.
     */
    case 'logique': {
      const court = neuve('court')
      const suite = neuve('suite')

      valeur(e, n.gauche)
      e.orA()
      if (n.operateur === '&&') e.jpZ(court)
      else e.jpNZ(court)

      valeur(e, n.droite)
      e.orA()
      if (n.operateur === '&&') e.jpZ(court)
      else e.jpNZ(court)

      e.ldA(n.operateur === '&&' ? 1 : 0)
      e.jr(suite)
      e.poser(court)
      e.ldA(n.operateur === '&&' ? 0 : 1)
      e.poser(suite)
      return
    }

    case 'non': {
      const vrai = neuve('pas')
      const suite = neuve('suite')
      valeur(e, n.valeur)
      e.orA()
      e.jrZ(vrai)
      e.xorA()
      e.jr(suite)
      e.poser(vrai)
      e.ldA(1)
      e.poser(suite)
      return
    }

    case 'complement':
      valeur(e, n.valeur)
      e.cplA()
      return

    case 'oppose':
      valeur(e, n.valeur)
      e.cplA()
      e.incA()
      return

    case 'ternaire': {
      const sinon = neuve('sinon')
      const suite = neuve('suite')
      valeur(e, n.condition)
      e.orA()
      e.jpZ(sinon)
      valeur(e, n.alors)
      e.jp(suite)
      e.poser(sinon)
      valeur(e, n.sinon)
      e.poser(suite)
      return
    }

    /*
     * « i++ » et « ++i » : la même incrémentation, deux valeurs différentes.
     * Le suffixe rend la valeur d'AVANT — c'est ce qui fait marcher
     * « t[i++] = v », et l'ignorer ferait écrire une case trop loin.
     */
    case 'incrementer': {
      const acces = accesUnique(e, lieu(e, n.cible), n.ligne)
      const pas = () => n.operateur === '++' ? e.incA() : e.decA()
      acces.lire()
      if (n.prefixe) {
        pas()
        acces.ecrire() // ranger ne perd pas `a` : c'est la valeur rendue
      } else {
        e.ecrire(0x4f) // ld c, a — la valeur d'AVANT, celle que l'on rendra
        pas()
        acces.ecrire()
        e.ecrire(0x79) // ld a, c
      }
      return
    }

    case 'taille':
      e.ldA(n.tailleCalculee ?? 1)
      return

    case 'appel':
      if (n.signature && n.signature.retour === 'void') {
        throw new Error(`ligne ${n.ligne} : « ${n.nom} » est « void » : elle ne rend aucune valeur`)
      }
      appel(e, n)
      return

    case 'appelMethode':
      if (n.signature.retour === 'void') {
        throw new Error(
          `ligne ${n.ligne} : « ${n.signature.nom} » est « void » : elle ne rend aucune valeur`,
        )
      }
      appelMethode(e, n)
      return

    case 'liste':
      throw new Error(
        `ligne ${n.ligne} : une liste entre accolades s'écrit à la déclaration — ` +
          '« Tuile MUR = {…}; » — ou comme dessin posé sur place, dans poser(), ' +
          'poserPanneau(), sprite() ou sprite16(). Ailleurs, elle ne tient pas dans un octet.',
      )

    case 'texte':
      throw new Error(
        `ligne ${n.ligne} : un texte ne se range pas dans un octet. ` +
          'Il ne s\'écrit que dans texte(colonne, ligne, "…").',
      )

    default:
      throw new Error(`ligne ${n.ligne} : expression « ${n.genre} » non comprise`)
  }
}

/* ------------------------------------------------ les fonctions de la console */

const BUILTINS = new Set([
  'texte', 'poser', 'lire', 'image', 'bouton', 'hasard', 'semer', 'ecran',
  'sprite', 'sprite16', 'cacher', 'cacher16', 'defiler',
  'panneau', 'cacherPanneau', 'effacerPanneau', 'poserPanneau', 'lirePanneau', 'textePanneau',
  'effacer', 'textS', 'poserS', 'attendre',
  'couleurFond', 'couleurLutin', 'teindre', 'teindreLutin', 'teindrePanneau',
  'paletteFond', 'paletteLutins', 'retard', 'images',
  'note', 'bruit', 'silence', 'volumeSon', 'jouer', 'airFini', 'sauver', 'sauvegarde',
  'nombre', 'nombrePanneau', 'changerDessin',
])

/**
 * Où chaque fonction attend sa tuile, et de quel côté.
 *
 * Ce sont les quatre endroits où un NUMÉRO de tuile est demandé — et donc les
 * quatre endroits où l'on peut écrire le dessin à la place du numéro. Partout
 * ailleurs, des accolades restent une faute : « hasard({…}) » ne veut rien
 * dire, et le dire tout de suite vaut mieux que graver une tuile pour rien.
 */
const TUILE_ATTENDUE = new Map([
  ['poser', { rang: 2, cote: 8 }],
  ['poserS', { rang: 2, cote: 8 }],
  ['poserPanneau', { rang: 2, cote: 8 }],
  ['sprite', { rang: 3, cote: 8 }],
  ['sprite16', { rang: 3, cote: 16 }],
])

/**
 * Un dessin écrit sur place devient le NUMÉRO de la tuile qu'il vient de
 * graver — et l'appel continue comme si l'on avait écrit ce numéro.
 *
 * L'argument est remplacé dans l'arbre, une fois pour toutes : « sprite16 »
 * se rappelle lui-même quatre fois avec le même argument, et le graver quatre
 * fois dépenserait seize tuiles pour un seul personnage.
 */
function tuileSurPlace(e, liste, cote, nom) {
  const rangees = liste.valeurs.map((v) => {
    if (v.genre !== 'texte') {
      throw new Error(
        `ligne ${v.ligne ?? liste.ligne} : une rangée de dessin s'écrit entre guillemets, ` +
          `comme ${nom}(…, { "${'#'.repeat(cote)}", … }).`,
      )
    }
    return v.valeur
  })
  const dessin = e.dessinSurPlace(rangees, liste.ligne, cote)
  return { genre: 'nombre', valeur: dessin.numero, ligne: liste.ligne }
}

/**
 * « troupe[i].avancer() » : l'adresse de l'objet, puis l'appel.
 *
 * C'est tout ce qu'une méthode coûte de plus qu'une fonction — un calcul
 * d'adresse et deux rangements. Il n'y a ni table de fonctions, ni pile
 * d'objets : l'appel est le même « call » qu'ailleurs, vers une étiquette
 * connue à la compilation.
 */
function appelMethode(e, n) {
  const place = lieu(e, n.cible)
  if (estCalcule(place)) adresserLieu(e, place)
  else e.ldHL(place.fixe & 0xffff)
  e.rangerHL(n.signature.pointeur)
  e.call(n.signature.etiquette)
}

/** Un appel de fonction se cache-t-il quelque part dans cette expression ? */
function contientUnAppel(n) {
  if (!n || typeof n !== 'object') return false
  if (n.genre === 'appel') return true
  return Object.values(n).some((v) => (Array.isArray(v) ? v.some(contientUnAppel) : contientUnAppel(v)))
}

/*
 * Cette ligne pose une couleur : qu'en fait-on ici ?
 *
 * Une seule question, posée aux trois seuls endroits qui écrivent dans les
 * registres de couleur, et trois réponses selon la cartouche qu'on fabrique :
 *
 *   ÉMETTRE   la console visée a la couleur — on écrit les registres.
 *
 *   OMETTRE   on fabrique la cartouche Game Boy des DEUX. Ces registres
 *             n'existent pas sur cette console : y écrire n'y ferait rien, et
 *             ces octets n'ont donc rien à faire dans le fichier. C'est tout
 *             l'objet des deux cartouches — le « .gb » n'emporte pas une seule
 *             instruction de couleur, le « .gbc » les a toutes.
 *
 *   REFUSER   « Game Boy » a été demandée SEULE. Poser des couleurs qui ne
 *             feront jamais rien, sans le dire, c'est laisser chercher
 *             longtemps pourquoi l'écran ne change pas.
 *
 * Les erreurs d'écriture — une palette au-delà de 7, un rouge au-delà de 31 —
 * sont contrôlées AVANT cette question, et le restent : les deux cartouches
 * doivent refuser exactement les mêmes programmes, sans quoi « les deux »
 * voudrait dire « celle qui compile ».
 */
function couleurIci(e, nom, n) {
  if (e.couleursOmises) {
    /*
     * Un argument qui APPELLE une fonction ne peut pas être omis.
     *
     * L'appel disparaîtrait avec la ligne de couleur, et les deux cartouches
     * ne feraient plus la même chose — l'une jouerait un son, l'autre non.
     * On le dit, et l'on dit où le mettre.
     */
    const fautif = (n.arguments ?? []).findIndex(contientUnAppel)
    if (fautif >= 0) {
      throw new Error(
        `ligne ${n.ligne} : l'argument ${fautif + 1} de « ${nom}() » appelle une fonction. ` +
          'La cartouche Game Boy ne porte aucune instruction de couleur, et cet appel y ' +
          'disparaîtrait avec elle : les deux cartouches ne feraient plus la même chose. ' +
          'Calculer cette valeur dans une variable avant la ligne de couleur.',
      )
    }
    return false
  }

  if (e.cible === 'gb') {
    throw new Error(
      `ligne ${n.ligne} : « ${nom}() » demande une Game Boy Color, et ce programme ` +
        'est écrit pour une Game Boy d\'origine (4 nuances). Choisir « En couleur » ' +
        'en haut de la page — ou « --console gbc » en ligne de commande.',
    )
  }

  e.couleur = true
  return true
}

/** Le texte d'un morceau : entre guillemets, ou le nom d'un « const char » ; null sinon. */
function texteDe(m) {
  if (m.genre === 'texte') return m.valeur
  if (m.genre === 'variable' && m.symbole?.genre === 'table' && m.symbole.texte !== undefined) return m.symbole.texte
  return null
}

/** Une somme où entre au moins un texte : « "SCORE " + score », à découper. */
function porteUnTexte(m) {
  if (texteDe(m) !== null) return true
  return m.genre === 'calcul' && m.operateur === '+' && (porteUnTexte(m.gauche) || porteUnTexte(m.droite))
}

function appel(e, n) {
  const nom = n.nom
  const args = n.arguments

  /* Le dessin écrit sur place, s'il y en a un, devient son numéro AVANT tout
     le reste : la suite de la fonction n'a plus à savoir qu'il a existé. */
  const attendue = n.signature ? undefined : TUILE_ATTENDUE.get(nom)
  if (attendue && args[attendue.rang] && args[attendue.rang].genre === 'liste') {
    args[attendue.rang] = tuileSurPlace(e, args[attendue.rang], attendue.cote, nom)
  }

  /* Une fonction écrite par l'utilisateur : chaque argument est rangé dans
     l'octet qui lui est réservé, puis l'on appelle. */
  if (n.signature) {
    /* « vivant() » écrit dans une méthode : l'objet en cours passe à l'appelée,
       qui a ses propres deux octets pour le tenir. Recopié AVANT les arguments,
       car le recopier écrase `a` et `hl`. */
    if (n.surSoi) {
      e.ldHLdeAdresse(e.fonctionCourante.pointeur)
      e.rangerHL(n.signature.pointeur)
    }
    n.signature.parametres.forEach((parametre, i) => {
      valeur(e, args[i])
      e.rangerA(parametre.symbole.adresse)
    })
    e.call(n.signature.etiquette)
    return
  }

  /*
   * « texte(SALUT) », « effacer(SALUT) » : un Mot se déplie en ses trois
   * morceaux, comme si on les avait écrits. L'effacement reçoit donc
   * forcément la case et la longueur de l'écriture.
   */
  const mot = args.length === 1 && args[0].genre === 'variable' && args[0].symbole?.genre === 'mot'
    ? args[0].symbole
    : null
  if (mot) {
    if (!['texte', 'textePanneau', 'effacer', 'effacerPanneau'].includes(nom)) {
      throw new Error(
        `ligne ${n.ligne} : « ${args[0].nom} » est un Mot : il s'écrit avec texte(${args[0].nom}) ` +
          `et s'efface avec effacer(${args[0].nom})`,
      )
    }
    appel(e, { ...n, arguments: [mot.x, mot.y, mot.texte] })
    return
  }

  /*
   * Effacer, sans compter les lettres à la main.
   *
   *   effacer(6, 4, "BONJOUR");     sept cases — la longueur est LUE dans le texte
   *   effacer(6, 4, TITRE);         celle du « const char TITRE[] »
   *   effacer(6, 4, combien);       un nombre, calculé s'il le faut
   *
   * Jusqu'ici il fallait écrire « texte(6, 4, "       ") » et compter soi-même.
   * Un espace de moins laissait la dernière lettre orpheline, un de trop
   * mangeait la case d'à côté — et rien ne le signalait, puisque écrire des
   * espaces est parfaitement légal.
   *
   * Le compilateur, lui, CONNAÎT la longueur du texte : il la lit dans les
   * guillemets, ou dans la table nommée. La donner à la main, c'était donner
   * une occasion de se tromper à ce qui n'en demandait pas.
   */
  if (nom === 'effacer' || nom === 'effacerPanneau') {
    const surLePanneau = nom === 'effacerPanneau'

    /*
     * Sans argument : tout.
     *
     * « effacerPanneau() » l'a toujours fait ; « effacer() » le fait désormais
     * aussi, et c'est le même geste. Trois programmes du dépôt écrivaient leur
     * propre « void effacer() » avec deux boucles imbriquées et trois cent
     * soixante « poser » — le besoin était donc là, et il manquait au langage.
     *
     * Les 32 × 32 de la carte, et non les 20 × 18 visibles : ce que le décor
     * montrera en défilant doit être vide lui aussi. Les versions écrites à la
     * main n'effaçaient que le visible, et laissaient reparaître l'écran
     * d'avant au premier « defiler ».
     */
    if (args.length === 0) {
      e.call(surLePanneau ? 'EffacerPanneau' : 'EffacerFond')
      return
    }

    if (args.length !== 3) {
      throw new Error(
        `ligne ${n.ligne} : ${nom}(colonne, ligne, quoi) prend trois arguments. ` +
          '« quoi » est le texte à effacer entre guillemets, le nom d\'un ' +
          `« const char NOM[] », ou un nombre de cases. Sans argument, ${nom}() ` +
          `vide ${surLePanneau ? 'tout le panneau' : 'tout le fond'}.`,
      )
    }

    const [x, y, quoi] = args

    /* La longueur : lue dans le texte quand il y en a un, calculée sinon. */
    const nomme = quoi.genre === 'variable' && quoi.symbole
      && quoi.symbole.genre === 'table' && quoi.symbole.texte !== undefined
      ? quoi.symbole
      : null

    const longueur = quoi.genre === 'texte' ? quoi.valeur.length
      : nomme ? nomme.texte.length
      : null

    if (longueur !== null && longueur === 0) return

    const carte = surLePanneau ? CARTE_PANNEAU : CARTE_FOND
    const colonne = constante(x)
    const ligne = constante(y)

    /*
     * L'ordre compte : l'adresse D'ABORD, le compte ensuite.
     *
     * Calculer l'adresse se sert de `a` et de `hl` ; poser le compte dans `b`
     * avant, c'est le perdre. C'est la même règle que partout ici, et elle ne
     * se voit qu'à l'exécution — la case effacée n'est alors ni la bonne, ni
     * en nombre juste.
     */
    if (colonne !== null && ligne !== null) {
      if (colonne > 19 || ligne > 17) {
        throw new Error(`ligne ${n.ligne} : l'écran fait 20 colonnes et 18 lignes ; ${colonne},${ligne} est dehors`)
      }
      e.ldHL(carte + ligne * 32 + colonne)
    } else {
      e.adresseCarte(x, y, valeur, carte)
    }

    if (longueur !== null) {
      e.ldB(longueur & 0xff)
    } else {
      /* Un nombre calculé : il passe par `a`, puis dans `b`. */
      valeur(e, quoi)
      e.ldBA()
    }

    e.call('EffacerCases')
    return
  }

  /*
   * textS : un texte qui passe à la ligne tout seul.
   *
   *   textS(18, 0, "BONJOUR");   « BO » en ligne 0, « NJOUR » en ligne 1
   *
   * Au bout de la ligne (après la colonne 19), la suite reprend à la colonne 0
   * de la ligne d'en dessous ; après la ligne 17, en haut. Une colonne de départ
   * trop grande saute de même : textS(20, 0, …) écrit en (0, 1).
   *
   * texte() n'a pas changé : il refuse toujours une colonne hors de l'écran, et
   * c'est ce qui attrape les fautes. textS est pour qui VEUT le saut.
   */
  /*
   * poserS : poser() qui passe à la ligne tout seul, comme textS.
   *
   *   poserS(i, 0, ALPHABET[i]);   colonne 20 → (0, 1), colonne 25 → (5, 1)
   *
   * La colonne est ramenée dans l'écran (le reste de la division par 20), et
   * ce qui dépasse descend d'autant de lignes (le quotient). Après la ligne 17,
   * on repart en haut. Le calcul est fait ICI, une fois pour toutes : la boucle
   * qui s'en sert n'a plus rien à calculer. Position en clair : c'est le
   * compilateur qui calcule, et cela ne coûte rien.
   */
  if (nom === 'poserS') {
    if (args.length !== 3) throw new Error(`ligne ${n.ligne} : poserS(colonne, ligne, tuile) prend trois arguments`)
    const [x, y, tuile] = args
    const nombre = (v) => ({ genre: 'nombre', valeur: v, ligne: n.ligne })
    const calcul = (operateur, gauche, droite) => ({ genre: 'calcul', operateur, gauche, droite, ligne: n.ligne })
    const colonneFixe = constante(x)
    const ligneFixe = constante(y)
    const colonne = colonneFixe !== null ? nombre(colonneFixe % 20) : calcul('%', x, nombre(20))
    const ligne = colonneFixe !== null && ligneFixe !== null
      ? nombre((ligneFixe + Math.floor(colonneFixe / 20)) % 18)
      : calcul('%', calcul('+', y, calcul('/', x, nombre(20))), nombre(18))
    appel(e, { ...n, nom: 'poser', arguments: [colonne, ligne, tuile] })
    return
  }

  if (nom === 'textS') {
    if (args.length !== 3) throw new Error(`ligne ${n.ligne} : textS(colonne, ligne, "…") prend trois arguments`)
    const [x, y, message] = args
    const contenu = texteDe(message)
    if (contenu === null) {
      throw new Error(
        `ligne ${n.ligne} : le troisième argument de textS() est un texte entre guillemets, ` +
          'ou le nom d\'un « const char NOM[] = "…"; »',
      )
    }
    if (!contenu.length) return

    const nombre = (v) => ({ genre: 'nombre', valeur: v, ligne: n.ligne })
    const calcul = (operateur, gauche, droite) => ({ genre: 'calcul', operateur, gauche, droite, ligne: n.ligne })

    /* Position écrite en clair : le compilateur découpe lui-même, ligne par
       ligne, en texte() ordinaires. Rien de plus dans la cartouche. */
    const colonneFixe = constante(x)
    const ligneFixe = constante(y)
    if (colonneFixe !== null && ligneFixe !== null) {
      let c = colonneFixe % 20
      let l = (ligneFixe + Math.floor(colonneFixe / 20)) % 18
      if (c + contenu.length <= 20) {
        appel(e, { ...n, nom: 'texte', arguments: [nombre(c), nombre(l), message] })
        return
      }
      let reste = contenu
      while (reste.length) {
        const morceau = reste.slice(0, 20 - c)
        appel(e, { ...n, nom: 'texte', arguments: [nombre(c), nombre(l), { genre: 'texte', valeur: morceau, ligne: n.ligne }] })
        reste = reste.slice(morceau.length)
        c = 0
        l = (l + 1) % 18
      }
      return
    }

    /* Position calculée : la case de départ est ramenée dans l'écran, puis la
       routine « EcrireTexteS » compte les colonnes pendant qu'elle écrit. */
    e.besoinTexteS = true
    const colonne = calcul('%', x, nombre(20))
    const ligne = calcul('%', calcul('+', y, calcul('/', x, nombre(20))), nombre(18))
    e.adresseCarte(colonne, ligne, valeur, CARTE_FOND)
    e.pushHL()
    valeur(e, colonne)
    e.ldCA()
    e.popHL()

    let etiquette
    if (message.genre === 'texte') {
      etiquette = neuve('Texte')
      e.textes.push({ etiquette, contenu })
    } else {
      etiquette = message.symbole.etiquette
    }
    e.ldDEetiquette(etiquette)
    e.ldB(contenu.length)
    e.call('EcrireTexteS')
    return
  }

  if (nom === 'texte' || nom === 'textePanneau') {
    if (args.length !== 3) throw new Error(`ligne ${n.ligne} : ${nom}(colonne, ligne, "…") prend trois arguments`)
    const [x, y, message] = args

    /*
     * Coller un texte et un nombre : « "X EGAL " + x ».
     *
     * La console n'a pas de texte fabriqué pendant le jeu : on ne peut pas
     * construire une chaîne en mémoire. Le compilateur fait donc ce qu'on
     * écrirait à la main — le texte, puis le nombre juste après, sur la même
     * ligne :
     *
     *   texte(1, 4, "X EGAL " + x);   devient   texte(1, 4, "X EGAL ");
     *                                           nombre(8, 4, x);
     *
     * Chaque morceau se pose à la suite du précédent : un texte prend autant
     * de colonnes que de lettres, un nombre en prend trois (ses zéros de tête
     * compris, comme nombre()). La colonne de départ peut être calculée ; les
     * suivantes le sont alors aussi.
     */
    if (message.genre === 'calcul' && message.operateur === '+' && porteUnTexte(message)) {
      const morceaux = []
      const aplatir = (m) => {
        if (m.genre === 'calcul' && m.operateur === '+' && porteUnTexte(m)) { aplatir(m.gauche); aplatir(m.droite) } else morceaux.push(m)
      }
      aplatir(message)
      let decalage = 0
      for (const morceau of morceaux) {
        const colonne = decalage === 0 ? x
          : { genre: 'calcul', operateur: '+', gauche: x, droite: { genre: 'nombre', valeur: decalage, ligne: n.ligne }, ligne: n.ligne }
        const lettres = texteDe(morceau)
        if (lettres !== null) {
          appel(e, { ...n, nom, arguments: [colonne, y, morceau] })
          decalage += lettres.length
        } else {
          appel(e, { ...n, nom: nom === 'texte' ? 'nombre' : 'nombrePanneau', arguments: [colonne, y, morceau] })
          decalage += 3
        }
      }
      return
    }

    /*
     * Le message s'écrit entre guillemets sur place, OU porte un nom :
     *
     *   const char TITRE[] = "TRACE UNE ZONE";
     *   texte(4, 1, TITRE);
     *
     * Dans les deux cas la routine reçoit une adresse et une longueur — c'est
     * la même chose pour elle. Le nom, lui, évite d'écrire trois fois le même
     * message, ce qui est trois occasions de le changer à deux endroits.
     */
    const nomme = message.genre === 'variable' && message.symbole
      && message.symbole.genre === 'table' && message.symbole.texte !== undefined
      ? message.symbole
      : null

    if (message.genre !== 'texte' && !nomme) {
      throw new Error(
        `ligne ${n.ligne} : le troisième argument de ${nom}() est un texte entre guillemets, ` +
          'ou le nom d\'un « const char NOM[] = "…"; ». Pour un nombre calculé, ' +
          'c\'est nombre(colonne, ligne, valeur) — ou collé à un texte : « "SCORE " + score ».',
      )
    }

    const contenu = nomme ? nomme.texte : message.valeur
    if (!contenu.length) return

    let etiquette
    if (nomme) {
      etiquette = nomme.etiquette
    } else {
      etiquette = neuve('Texte')
      e.textes.push({ etiquette, contenu })
    }

    const carte = nom === 'textePanneau' ? CARTE_PANNEAU : CARTE_FOND

    /*
     * La position peut être CALCULÉE, comme celle de `poser()`.
     *
     * Elle devait s'écrire en clair, et cela se comprenait mal : « texte(x, 4,
     * …) » est refusé alors que « poser(x, 4, …) » passe, pour la seule raison
     * que l'un calculait son adresse à la compilation. Quand les deux nombres
     * sont connus, l'adresse l'est aussi et ne coûte rien ; sinon on la calcule
     * à l'exécution, comme partout ailleurs.
     */
    const colonne = constante(x)
    const ligne = constante(y)

    if (colonne !== null && ligne !== null) {
      if (colonne > 19 || ligne > 17) {
        throw new Error(`ligne ${n.ligne} : l'écran fait 20 colonnes et 18 lignes ; ${colonne},${ligne} est dehors`)
      }
      e.ldHL(carte + ligne * 32 + colonne)
    } else {
      /* Hors de l'écran, l'écriture continue dans la partie de la carte qu'on
         ne voit pas — exactement comme `poser()`. Le programme est seul juge de
         ses bornes quand c'est lui qui les calcule. */
      e.adresseCarte(x, y, valeur, carte)
    }

    e.ldDEetiquette(etiquette)
    e.ldB(contenu.length)
    e.call('EcrireTexte')
    return
  }

  /*
   * Écrire un NOMBRE calculé.
   *
   *   nombre(11, 4, score)        « 042 » — trois chiffres, zéros compris
   *   nombre(11, 4, vies, 1)      « 3 »   — un seul chiffre
   *
   * Il fallait jusqu'ici poser les tuiles des chiffres soi-même, et diviser à
   * la main : « poser(11, 4, 27 + score / 10); poser(12, 4, 27 + score % 10); ».
   * Deux divisions écrites à chaque affichage, et un score à trois chiffres
   * qu'on renonce à montrer.
   *
   * Les zéros de tête sont écrits : c'est ce que fait une borne d'arcade, et
   * cela évite qu'un score qui passe de 9 à 10 déplace tout ce qui suit.
   */
  if (nom === 'nombre' || nom === 'nombrePanneau') {
    if (args.length !== 3 && args.length !== 4) {
      throw new Error(`ligne ${n.ligne} : ${nom}(colonne, ligne, valeur) prend trois arguments, ou quatre avec le nombre de chiffres`)
    }
    /* Le nombre de chiffres, lui, s'écrit en clair : c'est une décision de mise
       en page, pas un calcul. */
    const chiffres = args.length === 4
      ? nombreExige(args[3], `le nombre de chiffres de ${nom}() s'écrit en clair`, n.ligne)
      : 3

    if (chiffres < 1 || chiffres > 3) {
      throw new Error(
        `ligne ${n.ligne} : ${nom}() écrit de 1 à 3 chiffres — une valeur tient sur un octet, ` +
          'et s\'arrête à 255.',
      )
    }

    const carte = nom === 'nombrePanneau' ? CARTE_PANNEAU : CARTE_FOND
    const colonne = constante(args[0])
    const ligne = constante(args[1])

    /* La valeur d'abord : la calculer ensuite écraserait `hl` et `b`. */
    valeur(e, args[2])

    if (colonne !== null && ligne !== null) {
      if (ligne > 17 || colonne + chiffres > 20) {
        throw new Error(
          `ligne ${n.ligne} : l'écran fait 20 colonnes et 18 lignes ; ` +
            `${chiffres} chiffre${chiffres > 1 ? 's' : ''} à la colonne ${colonne} dépassent.`,
        )
      }
      e.ldHL(carte + ligne * 32 + colonne)
    } else {
      /* Une position calculée : elle passe par la même route que `poser()`, et
         la valeur attend dans le brouillon — le calcul de l'adresse se sert
         de `a`. */
      e.ldhDepuisA(BROUILLON2)
      e.adresseCarte(args[0], args[1], valeur, carte)
      e.ldhVersA(BROUILLON2)
    }

    e.ldB(chiffres)
    e.call('EcrireNombre')
    return
  }

  /*
   * attendre(secondes) : le temps dit en secondes, et non en images.
   *
   * La console ne connaît que les images (60 par seconde) : attendre(2), c'est
   * 2 × 60 = 120 fois image(), lutins et musique compris. Le programme est
   * arrêté pendant ce temps — c'est la différence avec compter les images
   * soi-même, où la boucle de jeu continue de tourner (et de lire la manette).
   * Jusqu'à 255 secondes ; attendre(0) n'attend pas.
   */
  if (nom === 'attendre') {
    if (args.length !== 1) throw new Error(`ligne ${n.ligne} : attendre(secondes) prend un argument : le nombre de secondes`)
    if (args[0].genre === 'nombre' && args[0].valeur > 255) {
      throw new Error(`ligne ${n.ligne} : attendre() va jusqu'à 255 secondes, et non ${args[0].valeur}`)
    }
    e.besoinAttendre = true
    valeur(e, args[0])
    e.call('AttendreSecondes')
    return
  }

  if (nom === 'image') {
    if (args.length) throw new Error(`ligne ${n.ligne} : image() ne prend pas d'argument`)
    e.call('AttendreImage')
    /* Le VBlank vient de commencer : c'est le seul moment où la table des
       lutins accepte d'être remplie. On y verse la copie tenue en mémoire de
       travail — c'est ce qui fait qu'un lutin déplacé apparaît vraiment. */
    e.ecrire(0xcd, ROUTINE_TRANSFERT & 0xff, (ROUTINE_TRANSFERT >> 8) & 0xff)
    return
  }

  /*
   * Le tour de boucle précédent a-t-il duré plus d'une image ?
   *
   * Un jeu qui calcule trop rate le VBlank, attend le suivant, et tourne à
   * trente images par seconde. Rien ne le disait : le jeu était simplement
   * « un peu mou », et l'on cherchait la cause partout sauf là. `retard()`
   * rend 1 quand c'est arrivé — de quoi l'afficher pendant qu'on met au point,
   * ou alléger le travail tout seul.
   */
  if (nom === 'retard') {
    if (args.length) throw new Error(`ligne ${n.ligne} : retard() ne prend pas d'argument`)
    e.ldhVersA(RETARD)
    return
  }

  /* Le nombre d'images écoulées depuis l'allumage, modulo 256. Il avance même
     si le jeu est en retard : c'est une horloge, pas un compte de tours. */
  if (nom === 'images') {
    if (args.length) throw new Error(`ligne ${n.ligne} : images() ne prend pas d'argument`)
    e.ldhVersA(COMPTEUR_IMAGES)
    return
  }

  if (nom === 'bouton') {
    if (args.length !== 1) throw new Error(`ligne ${n.ligne} : bouton(A) prend un argument`)
    const bit = nombreExige(args[0], 'bouton() veut A, B, HAUT, BAS, GAUCHE, DROITE, START ou SELECT', n.ligne)
    if (bit > 7) throw new Error(`ligne ${n.ligne} : il n'y a que huit boutons`)
    e.call('LireManette')
    e.bitA(bit)
    const vrai = neuve('presse')
    const suite = neuve('suite')
    e.jrNZ(vrai)
    e.xorA()
    e.jr(suite)
    e.poser(vrai)
    e.ldA(1)
    e.poser(suite)
    return
  }

  if (nom === 'hasard') {
    if (args.length) throw new Error(`ligne ${n.ligne} : hasard() ne prend pas d'argument`)
    e.call('Hasard')
    return
  }

  /*
   * Choisir soi-même le point de départ du tirage.
   *
   * Sur une console émulée, tout se passe à la même vitesse à chaque
   * démarrage : le compteur du matériel vaut la même chose, et la partie se
   * déroule à l'identique. Semer avec le nombre d'images écoulées avant que le
   * joueur n'appuie sur START suffit à tout changer — c'est ce que fait
   * n'importe quel jeu de la machine.
   */
  if (nom === 'semer') {
    if (args.length !== 1) throw new Error(`ligne ${n.ligne} : semer(nombre) prend un argument`)
    valeur(e, args[0])
    const pasNul = neuve('semencePasNulle')
    e.orA()
    e.jrNZ(pasNul)
    e.ldA(0xb8) // zéro ne sème rien : le registre y resterait
    e.poser(pasNul)
    e.ldhDepuisA(GRAINE)
    return
  }

  /* Poser une tuile à une position calculée : c'est ce qui permet de dessiner
     un décor, un puits, une pièce qui tombe. */
  /*
   * Une couleur d'une palette, sur Game Boy Color.
   *
   *   couleurFond(0, 1, 31, 24, 8);    palette 0, teinte 1 : du sable
   *   couleurLutin(2, 3, 31, 0, 0);    palette 2 des lutins, teinte 3 : rouge
   *
   * Huit palettes de quatre teintes chacune, pour le fond comme pour les
   * lutins. Chaque composante va de 0 à 31 — la console range une couleur sur
   * quinze bits, cinq par composante, et non sur vingt-quatre.
   *
   * On pose UNE teinte à la fois plutôt que les quatre d'un coup. Une palette
   * entière ferait treize arguments, et personne ne relit « couleurFond(0, 31,
   * 24, 8, 12, 30, 4, 2, 9, 18, 0, 0, 0) » sans compter sur ses doigts.
   *
   * Sur une console d'origine, ces écritures ne font rien : le même programme
   * y tourne en quatre nuances.
   */
  if (nom === 'couleurFond' || nom === 'couleurLutin') {
    const pourLesLutins = nom === 'couleurLutin'
    if (args.length !== 5) {
      throw new Error(
        `ligne ${n.ligne} : ${nom}(palette, teinte, rouge, vert, bleu) prend cinq arguments — ` +
          'la palette de 0 à 7, la teinte de 0 à 3, et chaque composante de 0 à 31',
      )
    }

    const palette = constante(args[0])
    const teinte = constante(args[1])
    if (palette !== null && palette > 7) {
      throw new Error(`ligne ${n.ligne} : il y a huit palettes, de 0 à 7 — trouvé ${palette}`)
    }
    if (teinte !== null && teinte > 3) {
      throw new Error(`ligne ${n.ligne} : une palette a quatre teintes, de 0 à 3 — trouvé ${teinte}`)
    }

    const composantes = args.slice(2).map((a) => constante(a))
    const noms = ['rouge', 'vert', 'bleu']
    composantes.forEach((c, i) => {
      if (c !== null && c > 31) {
        throw new Error(`ligne ${n.ligne} : le ${noms[i]} va de 0 à 31 — trouvé ${c}`)
      }
    })

    if (!couleurIci(e, nom, n)) return

    const [rouge, vert, bleu] = composantes
    const toutesConnues = composantes.every((c) => c !== null)
    const quinzeBits = toutesConnues ? (bleu << 10) | (vert << 5) | rouge : 0
    const ou = pourLesLutins ? COULEUR_LUTIN_OU : COULEUR_FOND_OU
    const donnee = pourLesLutins ? COULEUR_LUTIN : COULEUR_FOND

    /*
     * L'index : palette × 8 + teinte × 2, et le bit 7 pour l'auto-incrément.
     *
     * Ce bit fait avancer l'index tout seul après chaque octet versé : les
     * deux moitiés de la couleur partent à la suite, sans le reposer entre.
     *
     * La palette et la teinte peuvent être CALCULÉES. C'est ce qui permet
     * d'écrire « pour chacune des huit palettes » dans une boucle — les
     * exiger écrites en clair obligeait à recopier trente-deux appels, et
     * l'on finissait par se tromper d'un numéro dans le tas.
     */
    if (palette !== null && teinte !== null) {
      e.ldA(0x80 | (palette * 8 + teinte * 2))
    } else {
      valeur(e, args[0])
      e.andN(7)
      e.addA()
      e.addA()
      e.addA() // palette × 8
      e.ldhDepuisA(BROUILLON2)
      valeur(e, args[1])
      e.andN(3)
      e.addA() // teinte × 2
      e.ldBA()
      e.ldhVersA(BROUILLON2)
      e.addB()
      e.orN(0x80)
    }
    e.ldhDepuisA(ou)

    /* Tout connu d'avance : les deux octets sont calculés ici, et rien à
       l'exécution. C'est le cas de loin le plus fréquent — une palette est un
       choix de dessin, pas un calcul. */
    if (toutesConnues) {
      e.ldA(quinzeBits & 0xff)
      e.ldhDepuisA(donnee)
      e.ldA((quinzeBits >> 8) & 0xff)
      e.ldhDepuisA(donnee)
      return
    }

    /*
     * Sinon, la couleur s'assemble à l'exécution.
     *
     * Une couleur tient sur quinze bits, cinq par composante, à cheval sur
     * deux octets : le vert est COUPÉ EN DEUX — ses trois bits du bas finissent
     * en haut du premier octet, ses deux bits du haut en bas du second. C'est
     * ce découpage qui rend le calcul moins court qu'on ne l'imagine.
     *
     * Les trois composantes passent par la PILE, et non par les octets de
     * brouillon : « valeur() » s'en sert lui-même pour un index calculé, et
     * ranger le rouge dans un brouillon que le calcul du bleu écrase ensuite
     * donnerait une couleur fausse une fois sur deux — sans rien signaler.
     * Chaque argument n'est ainsi évalué qu'UNE fois, ce qui compte dès qu'il
     * s'écrit « table[i++] ».
     */
    valeur(e, args[4]) // le bleu, poussé en premier : il ressort en dernier
    e.andN(31)
    e.addA()
    e.addA() // bleu × 4, sa place dans l'octet haut
    e.ldBA()
    e.pushBC()

    valeur(e, args[2]) // le rouge
    e.andN(31)
    e.ldBA()
    e.pushBC()

    valeur(e, args[3]) // le vert, gardé dans « c » : il sert aux DEUX octets
    e.andN(31)
    e.ldCA()

    /* L'octet bas : les trois bits du bas du vert, puis le rouge. */
    e.ldAC()
    e.andN(7)
    for (let i = 0; i < 5; i++) e.addA()
    e.ldBA()
    e.popHL()
    e.ldAH()
    e.orB()
    e.ldhDepuisA(donnee)

    /* L'octet haut : le bleu déjà décalé, puis les deux bits du haut du vert. */
    e.ldAC()
    e.srlA()
    e.srlA()
    e.srlA()
    e.ldBA()
    e.popHL()
    e.ldAH()
    e.orB()
    e.ldhDepuisA(donnee)
    return
  }

  /*
   * Quelle palette pour une case du fond.
   *
   *   teindre(4, 10, 2);    la case (4, 10) prend la palette 2
   *
   * L'attribut vit dans la SECONDE banque de VRAM, à la même adresse que la
   * tuile. On bascule la banque, on écrit, et on rebascule — laisser la banque
   * 1 en place ferait écrire les « poser » suivants dans les attributs au lieu
   * des tuiles, et l'écran se remplirait de n'importe quoi.
   */
  /* teindrePanneau : la même chose, pour une case du PANNEAU (le HUD, les dialogues). */
  if (nom === 'teindre' || nom === 'teindrePanneau') {
    if (args.length !== 3) {
      throw new Error(`ligne ${n.ligne} : ${nom}(colonne, ligne, palette) prend trois arguments`)
    }
    const palette = constante(args[2])
    /* Le bit du haut (DEVANT, 128) est la priorité : la case cache les personnages. */
    if (palette !== null && (palette & 0x7f) > 7) {
      throw new Error(`ligne ${n.ligne} : il y a huit palettes, de 0 à 7 — trouvé ${palette & 0x7f}`)
    }

    if (!couleurIci(e, nom, n)) return

    valeur(e, args[2])
    e.ldhDepuisA(BROUILLON2)
    e.ldA(1)
    e.ldhDepuisA(BANQUE_VRAM)
    e.adresseCarte(args[0], args[1], valeur, nom === 'teindrePanneau' ? CARTE_PANNEAU : CARTE_FOND)
    e.ldhVersA(BROUILLON2)
    e.ldHLA()
    e.xorA()
    e.ldhDepuisA(BANQUE_VRAM)
    return
  }

  /*
   * Quelle palette pour un lutin, sur Game Boy Color.
   *
   *   teindreLutin(0, 3);    le lutin 0 prend la palette 3
   *
   * Elle vit dans les trois bits du BAS de l'octet d'options — ceux que
   * « sprite() » masque, parce que sur une console d'origine ils n'appartenaient
   * à personne. Les écrire par le cinquième argument de « sprite() » aurait
   * mélangé un numéro de palette et des drapeaux dans la même valeur : lisible
   * pour le matériel, illisible pour qui relit son programme.
   *
   * Les autres bits sont préservés : un lutin retourné qu'on colore reste
   * retourné.
   */
  if (nom === 'teindreLutin') {
    if (args.length !== 2) {
      throw new Error(`ligne ${n.ligne} : teindreLutin(numero, palette) prend deux arguments`)
    }
    const numero = constante(args[0])
    if (numero !== null && numero > 39) {
      throw new Error(`ligne ${n.ligne} : il n'y a que quarante lutins, numérotés de 0 à 39`)
    }
    const palette = constante(args[1])
    if (palette !== null && palette > 7) {
      throw new Error(`ligne ${n.ligne} : il y a huit palettes de lutins, de 0 à 7 — trouvé ${palette}`)
    }

    if (!couleurIci(e, nom, n)) return

    valeur(e, args[1])
    e.andN(7)
    e.ldhDepuisA(BROUILLON2)

    if (numero === null) {
      valeur(e, args[0])
      e.echelonner(4)
      e.ldDE(OAM_OMBRE + 3)
      e.addHLDE()
    } else {
      e.ldHL(OAM_OMBRE + numero * 4 + 3)
    }

    /* Lire, effacer les trois bits du bas, y poser la palette, réécrire. */
    e.ldAdeHL()
    e.andN(0xf8)
    e.ldBA()
    e.ldhVersA(BROUILLON2)
    e.orB()
    e.ldHLA()
    return
  }

  /*
   * Changer le DESSIN d'une tuile, partout à la fois.
   *
   *   changerDessin(EAU, EAU2);   toutes les cases d'EAU montrent EAU2
   *
   * C'est ainsi que les jeux animent l'eau, le feu ou l'herbe : on ne repose
   * pas cent cases, on réécrit les seize octets de la tuile en mémoire vidéo,
   * et tout l'écran suit. Le dessin vient de la cartouche (les tuiles y sont
   * rangées à l'étiquette « Tuiles »), jamais de la mémoire vidéo elle-même.
   *
   * La mémoire vidéo est fermée pendant que l'écran se dessine (mode 3) : on
   * attend avant chaque octet que la ligne en cours la rende. Écran éteint, ou
   * juste après image(), l'attente ne coûte rien.
   */
  if (nom === 'changerDessin') {
    if (args.length !== 2) throw new Error(`ligne ${n.ligne} : changerDessin(tuile, dessin) prend deux arguments : la tuile qui change, et le dessin qu'elle prend`)
    /*
     * Une LETTRE à la place de la tuile — changerDessin("A", MON_A) — : c'est la
     * police qu'on change. Chaque lettre est une tuile comme une autre ; tous
     * les textes de l'écran la montrent aussitôt avec le nouveau dessin.
     */
    if (args[0].genre === 'texte') {
      const lettre = String(args[0].valeur)
      if (lettre.length !== 1 || numeroDe(lettre) === 0 && lettre !== ' ') {
        throw new Error(`ligne ${n.ligne} : changerDessin("${lettre}", …) : il faut UNE lettre que la police connaît — A à Z, 0 à 9, ! ? . - : # |`)
      }
      args[0] = { genre: 'nombre', valeur: numeroDe(lettre), ligne: n.ligne }
    }
    valeur(e, args[0])
    e.echelonner(16)
    e.ldDE(MEMOIRE_TUILES)
    e.addHLDE()
    e.pushHL()
    valeur(e, args[1])
    e.echelonner(16)
    e.ldDEetiquette('Tuiles')
    e.addHLDE()
    e.ecrire(0x54, 0x5d) // ld d, h ; ld e, l — de : le dessin, dans la cartouche
    e.popHL()            // hl : la tuile, en mémoire vidéo
    e.ldB(16)
    const octet = neuve('dessinOctet')
    const attente = neuve('dessinAttente')
    e.poser(octet)
    e.poser(attente)
    e.ldhVersA(0x41) // STAT : le mode de l'écran
    e.andN(2)        // modes 2 et 3 : on attend le 0 ou le 1
    e.jrNZ(attente)
    e.ldAdeDE()
    e.ldHLplusA()
    e.incDE()
    e.decB()
    e.jrNZ(octet)
    return
  }

  if (nom === 'poser' || nom === 'poserPanneau') {
    if (args.length !== 3) throw new Error(`ligne ${n.ligne} : ${nom}(colonne, ligne, tuile) prend trois arguments`)
    valeur(e, args[2])
    e.ldhDepuisA(BROUILLON2)
    e.adresseCarte(args[0], args[1], valeur, nom === 'poserPanneau' ? CARTE_PANNEAU : CARTE_FOND)
    e.ldhVersA(BROUILLON2)
    e.ldHLA()
    return
  }

  /* Lire ce qui est affiché à un endroit : de quoi savoir si une case est
     libre, sans tenir un second tableau à jour. */
  if (nom === 'lire' || nom === 'lirePanneau') {
    if (args.length !== 2) throw new Error(`ligne ${n.ligne} : ${nom}(colonne, ligne) prend deux arguments`)
    e.adresseCarte(args[0], args[1], valeur, nom === 'lirePanneau' ? CARTE_PANNEAU : CARTE_FOND)
    e.ldAdeHL()
    return
  }

  /* L'écran s'éteint le temps d'un gros redessin, et se rallume après : c'est
     la seule façon d'écrire mille cases sans attendre mille images. */
  if (nom === 'ecran') {
    if (args.length !== 1) throw new Error(`ligne ${n.ligne} : ecran(0) éteint, ecran(1) rallume`)
    const allume = constante(args[0])
    if (allume === null) {
      throw new Error(`ligne ${n.ligne} : ecran() veut 0 ou 1 écrit en clair`)
    }
    if (allume) {
      /*
       * La même valeur qu'à la mise en route, LUTINS COMPRIS : écrire ici
       * l'ancien réglage rallumait l'écran en éteignant les lutins, et le
       * personnage disparaissait sans qu'aucune erreur ne soit signalée.
       *
       * Le bit de la fenêtre est repris tel qu'il est, et non remis à zéro :
       * éteindre puis rallumer l'écran ne doit pas faire disparaître le
       * panneau de score.
       */
      e.ldhVersA(ECRAN)
      e.andN(0b00100000) // on ne garde que « la fenêtre est-elle allumée ? »
      e.orN(0b11010011)
      e.ldhDepuisA(ECRAN)

      /*
       * On remet l'horloge à l'heure.
       *
       * Éteindre l'écran pour redessiner tout un décor prend plusieurs images,
       * et c'est voulu — c'est même la raison d'être de « ecran(0) ». Sans ce
       * rattrapage, le premier « image() » d'après se croyait en retard et
       * « retard() » criait au loup à chaque changement d'écran.
       */
      e.ldhVersA(COMPTEUR_IMAGES)
      e.ldhDepuisA(DERNIER_REVEIL)
      e.xorA()
      e.ldhDepuisA(RETARD)
      return
    } else {
      e.call('AttendreVBlank') // on n'éteint jamais l'écran hors du VBlank
      e.xorA()
    }
    e.ldhDepuisA(ECRAN)
    return
  }

  /*
   * Un lutin : un carré de huit sur huit posé où l'on veut, au PIXEL, et non
   * sur la grille du fond. C'est ce qui sépare un jeu d'action d'un jeu de
   * cases — un personnage qui saute ne s'arrête pas sur un multiple de huit.
   *
   *   sprite(0, x, y, MARIO)        le lutin numéro 0
   *   sprite(0, x, y, MARIO, 1)     le même, retourné vers la gauche
   *
   * Le matériel décale les lutins de huit à gauche et de seize en haut, pour
   * qu'ils puissent entrer et sortir par les bords. On rend ce décalage
   * invisible : x et y sont ceux de l'écran.
   */
  if (nom === 'sprite') {
    if (args.length !== 4 && args.length !== 5) {
      throw new Error(`ligne ${n.ligne} : sprite(numero, x, y, tuile) prend quatre arguments, ou cinq avec le retournement`)
    }
    const numero = constante(args[0])
    if (numero !== null && numero > 39) {
      throw new Error(`ligne ${n.ligne} : il n'y a que quarante lutins, numérotés de 0 à 39`)
    }

    /*
     * Le numéro du lutin peut être calculé : « sprite(i, …) » dans une boucle
     * est la façon naturelle d'afficher une troupe rangée dans un tableau. Son
     * adresse dans la table est alors tenue sur la pile, le temps des quatre
     * octets — la calculer quatre fois rejouerait l'expression, et un « i++ »
     * glissé dedans placerait les quatre morceaux à quatre endroits.
     */
    let ranger
    if (numero === null) {
      valeur(e, args[0])
      e.echelonner(4)
      e.ldDE(OAM_OMBRE)
      e.addHLDE()
      e.ecrire(0xe5) // push hl
      ranger = (decalage) => {
        e.ldBA() // la valeur, le temps de retrouver l'adresse
        e.ecrire(0xe1, 0xe5) // pop hl ; push hl
        for (let i = 0; i < decalage; i++) e.incHL()
        e.ldAB()
        e.ldHLA()
      }
    } else {
      const base = OAM_OMBRE + numero * 4
      ranger = (decalage) => e.ecrire(0xea, (base + decalage) & 0xff, ((base + decalage) >> 8) & 0xff)
    }

    valeur(e, args[2])
    e.addN(16)
    ranger(0)
    valeur(e, args[1])
    e.addN(8)
    ranger(1)
    valeur(e, args[3])
    ranger(2)

    /*
     * Le quatrième octet porte les options. « 1 » veut encore dire « retourné
     * vers la gauche » — c'est ce que le cinquième argument signifiait quand
     * il n'y avait que lui, et les programmes déjà écrits doivent continuer de
     * marcher. Les noms MIROIR_X, MIROIR_Y, DERRIERE et PALETTE1 portent
     * directement les bits du matériel, et se combinent avec « | ».
     */
    if (args.length === 5) {
      const options = constante(args[4])
      if (options !== null) {
        e.ldA((options === 1 ? 0x20 : options) & 0xf0)
      } else {
        valeur(e, args[4])
        const pasUn = neuve('pasLAncienUn')
        e.bitA(0)
        e.jrZ(pasUn)
        e.orN(0x20)
        e.poser(pasUn)
        e.andN(0xf0) // les quatre bits du bas n'appartiennent pas au programme
      }
    } else {
      e.xorA()
    }
    ranger(3)
    if (numero === null) e.ecrire(0xe1) // pop hl : la pile revient comme elle était
    return
  }

  /*
   * Un personnage de seize sur seize, en un seul appel.
   *
   * Le matériel ne connaît que des carrés de huit : il en faut quatre, posés
   * en carré, avec quatre numéros de lutin qui se suivent. Les écrire à la
   * main faisait huit lignes par personnage, et il fallait penser à échanger
   * les moitiés quand il regarde à gauche — une erreur invisible, qui donne un
   * visage à l'envers.
   */
  if (nom === 'sprite16') {
    if (args.length !== 4 && args.length !== 5) {
      throw new Error(`ligne ${n.ligne} : sprite16(numero, x, y, tuile) prend quatre arguments, ou cinq avec le retournement`)
    }
    const premier = constante(args[0])
    if (premier !== null && premier > 36) {
      throw new Error(`ligne ${n.ligne} : un personnage de seize occupe quatre lutins ; 36 au maximum`)
    }

    const options = args.length === 5 ? constante(args[4]) : 0
    if (options === null) {
      throw new Error(
        `ligne ${n.ligne} : les options de sprite16() s'écrivent en clair — 0, MIROIR_X, ` +
          'MIROIR_Y, ou les deux. Un personnage de seize est fait de quatre lutins, et ' +
          'le compilateur doit savoir DANS QUEL ORDRE les poser. Pour un personnage qui ' +
          'change de sens, écrire les deux cas dans un « if ».',
      )
    }
    /* « 1 » veut dire MIROIR_X, comme pour sprite(). */
    const drapeaux = options === 1 ? 0x20 : options

    const nombre = (valeurEntiere) => ({ genre: 'nombre', valeur: valeurEntiere, ligne: n.ligne })
    const plus = (noeud, combien) => combien === 0 ? noeud
      : { genre: 'calcul', operateur: '+', gauche: noeud, droite: nombre(combien), ligne: n.ligne }

    /*
     * Retourné, la moitié de gauche montre le quart de droite, en miroir — et
     * retourné vers le haut, la moitié du bas montre celle du haut. Le
     * matériel retourne chaque carré de huit sur lui-même ; c'est à nous
     * d'échanger les quatre places, sans quoi le visage se retrouve à l'envers.
     */
    const miroirX = (drapeaux & 0x20) !== 0
    const miroirY = (drapeaux & 0x40) !== 0
    let quarts = [0, 1, 2, 3]
    if (miroirX) quarts = [quarts[1], quarts[0], quarts[3], quarts[2]]
    if (miroirY) quarts = [quarts[2], quarts[3], quarts[0], quarts[1]]

    quarts.forEach((quart, place) => {
      appel(e, {
        genre: 'appel',
        nom: 'sprite',
        ligne: n.ligne,
        arguments: [
          premier === null ? plus(args[0], place) : nombre(premier + place),
          plus(args[1], (place % 2) * 8),
          plus(args[2], place > 1 ? 8 : 0),
          plus(args[3], quart),
          nombre(drapeaux),
        ],
      })
    })
    return
  }

  /* Ôter un lutin de l'écran. Le remettre à zéro le range au-dessus du bord. */
  if (nom === 'cacher' || nom === 'cacher16') {
    const combien = nom === 'cacher16' ? 4 : 1
    const maximum = nom === 'cacher16' ? 36 : 39
    if (args.length !== 1) throw new Error(`ligne ${n.ligne} : ${nom}(numero) prend un argument`)
    const numero = constante(args[0])
    if (numero !== null && numero > maximum) {
      throw new Error(`ligne ${n.ligne} : ${nom}() va de 0 à ${maximum}`)
    }

    /* Le numéro peut se calculer, comme pour sprite() : cacher une troupe se
       fait dans une boucle, sur le même compteur qui l'a dessinée. */
    if (numero === null) {
      valeur(e, args[0])
      e.echelonner(4)
      e.ldDE(OAM_OMBRE)
      e.addHLDE()
      e.xorA()
      for (let i = 0; i < combien; i++) {
        e.ldHLA()
        if (i < combien - 1) for (let k = 0; k < 4; k++) e.incHL()
      }
      return
    }

    e.xorA()
    for (let i = 0; i < combien; i++) {
      const base = OAM_OMBRE + (numero + i) * 4
      e.ecrire(0xea, base & 0xff, (base >> 8) & 0xff)
    }
    return
  }

  /*
   * Jouer une note.
   *
   *   note(1, LA4, 8, 12)     voix 1, un LA, huit 256ᵉ de seconde, volume 12
   *   note(2, DO5, 0, 10)     sans fin : elle tient jusqu'à silence(2)
   *
   * La console ne connaît pas les hertz : elle veut un nombre de 0 à 2047, et
   * la table des notes est gravée dans la cartouche — 120 octets pour cinq
   * octaves, calculés à la compilation.
   *
   * Le déclenchement est le dernier registre écrit, et c'est obligatoire : le
   * matériel prend la note en compte à ce moment-là. L'écrire avant la
   * fréquence jouait la note PRÉCÉDENTE, une image sur deux, et le mélomane
   * qui débogue cela y passe la soirée.
   */
  if (nom === 'note') {
    if (args.length !== 4) {
      throw new Error(`ligne ${n.ligne} : note(voix, hauteur, duree, volume) prend quatre arguments`)
    }
    const quelle = nombreExige(args[0], 'la voix de note() s\'écrit en clair : 1 ou 2', n.ligne)
    if (quelle !== 1 && quelle !== 2) {
      throw new Error(`ligne ${n.ligne} : note() joue sur la voix 1 ou 2. Pour un bruit, écrire bruit(duree, volume).`)
    }
    const voix = VOIX[quelle]

    /* La voix 1 sait glisser d'une note à l'autre ; on ne s'en sert pas, et il
       faut le dire au matériel, sinon la note d'avant continue de glisser. */
    if (voix.balayage !== null) { e.xorA(); e.ldhDepuisA(voix.balayage) }

    /* La durée, mise de côté : elle sert deux fois. */
    valeur(e, args[2])
    e.ldhDepuisA(BROUILLON2)
    e.ldBA()
    e.ldA(64)
    e.subB()
    e.andN(0x3f)
    e.orN(0x80) // un signal carré à moitié haut, à moitié bas
    e.ldhDepuisA(voix.longueur)

    valeur(e, args[3])
    e.andN(0x0f)
    e.swapA() // le volume occupe les quatre bits du haut
    e.ldhDepuisA(voix.enveloppe)

    valeur(e, args[1])
    e.echelonner(2) // deux octets par note dans la table
    e.ldDEetiquette('Notes')
    e.addHLDE()
    e.ldAdeHLplus()
    e.ldhDepuisA(voix.basse)
    e.ldAdeHL()
    e.andN(0x07)
    e.orN(0x80) // déclenchement
    e.ldBA()

    /* Une durée nulle veut dire « sans fin » : on n'arme pas le compteur. */
    e.ldhVersA(BROUILLON2)
    e.orA()
    const sansFin = neuve('sansFin')
    e.jrZ(sansFin)
    e.ldAB()
    e.orN(0x40) // le compteur de durée coupera la note
    e.ldBA()
    e.poser(sansFin)
    e.ldAB()
    e.ldhDepuisA(voix.haute)
    return
  }

  /*
   * Le bruit : la quatrième voix. Une explosion, un pas, un tir.
   *
   *   bruit(6, 12)        court et fort
   *   bruit(20, 8, 0x55)  plus grave, plus rêche — le « grain » est le
   *                       réglage du générateur, de 0 à 255 ; à essayer.
   */
  if (nom === 'bruit') {
    if (args.length !== 2 && args.length !== 3) {
      throw new Error(`ligne ${n.ligne} : bruit(duree, volume) prend deux arguments, ou trois avec le grain`)
    }
    const voix = VOIX[4]

    valeur(e, args[0])
    e.ldhDepuisA(BROUILLON2)
    e.ldBA()
    e.ldA(64)
    e.subB()
    e.andN(0x3f)
    e.ldhDepuisA(voix.longueur)

    valeur(e, args[1])
    e.andN(0x0f)
    e.swapA()
    e.ldhDepuisA(voix.enveloppe)

    if (args.length === 3) valeur(e, args[2])
    else e.ldA(0x30) // un grain moyen, celui qui ressemble le plus à un choc
    e.ldhDepuisA(voix.basse)

    e.ldA(0x80)
    e.ldBA()
    e.ldhVersA(BROUILLON2)
    e.orA()
    const bruitSansFin = neuve('bruitSansFin')
    e.jrZ(bruitSansFin)
    e.ldAB()
    e.orN(0x40)
    e.ldBA()
    e.poser(bruitSansFin)
    e.ldAB()
    e.ldhDepuisA(voix.haute)
    return
  }

  /*
   * La sauvegarde : 256 octets qui survivent à l'extinction.
   *
   *   sauver(0, meilleur);
   *   uint8_t meilleur = sauvegarde(0);
   *
   * La cartouche porte une pile et une petite mémoire. Elle n'est pas
   * accessible en permanence : il faut la DÉVERROUILLER avant d'y toucher et
   * la reverrouiller aussitôt. C'est ce que font les vraies cartouches, et
   * pour une bonne raison — verrouillée, elle survit à une coupure de courant
   * au milieu d'une écriture ; laissée ouverte, elle se corrompt.
   *
   * Le compilateur pose donc le verrou lui-même, à chaque accès. C'est
   * quelques cycles de plus, et une catégorie entière de sauvegardes perdues
   * en moins.
   *
   * À la toute première partie, cette mémoire contient n'importe quoi. Un jeu
   * y écrit d'abord une marque à lui — « if (sauvegarde(0) != 42) » — et ne
   * fait confiance au reste que si elle s'y trouve.
   */
  if (nom === 'sauver' || nom === 'sauvegarde') {
    const ecrire = nom === 'sauver'
    if (args.length !== (ecrire ? 2 : 1)) {
      throw new Error(
        `ligne ${n.ligne} : ${ecrire ? 'sauver(numero, valeur)' : 'sauvegarde(numero)'} ` +
          `prend ${ecrire ? 'deux arguments' : 'un argument'}`,
      )
    }

    if (ecrire) {
      valeur(e, args[1])
      e.ldhDepuisA(BROUILLON2)
    }

    e.ldA(0x0a) // le déverrouillage : rien d'autre que $0A ne l'ouvre
    e.ecrire(0xea, 0x00, 0x00)

    valeur(e, args[0])
    e.ldLA()
    e.ldH(0)
    e.ldDE(MEMOIRE_SAUVEGARDE)
    e.addHLDE()

    if (ecrire) {
      e.ldhVersA(BROUILLON2)
      e.ldHLA()
      e.xorA()
      e.ecrire(0xea, 0x00, 0x00) // reverrouillé
      return
    }

    e.ldAdeHL()
    e.ldBA() // la valeur lue, mise à l'abri le temps de reverrouiller
    e.xorA()
    e.ecrire(0xea, 0x00, 0x00)
    e.ldAB()
    return
  }

  /* Couper une voix. Le volume à zéro éteint le convertisseur : la note
     s'arrête net, sans le claquement d'un déclenchement de plus. */
  if (nom === 'silence') {
    if (args.length !== 1) throw new Error(`ligne ${n.ligne} : silence(voix) prend un argument`)
    const quelle = nombreExige(args[0], 'la voix de silence() s\'écrit en clair : 1, 2 ou 4', n.ligne)
    if (!VOIX[quelle]) throw new Error(`ligne ${n.ligne} : les voix sont 1, 2 et 4`)
    e.xorA()
    /* Un air qui tournait sur cette voix s'arrête aussi. Sans cela, la voix se
       tairait le temps d'une image et le pas suivant la relancerait : un
       « silence » qui ne fait pas silence est pire que pas de silence du tout. */
    if (ETAT_AIR[quelle]) e.rangerA(ETAT_AIR[quelle] + AIR.ACTIF)
    e.ldhDepuisA(VOIX[quelle].enveloppe)
    return
  }

  /*
   * Lancer une mélodie.
   *
   *   jouer(1, FANFARE, 8)      la voix 1, huit images par pas
   *   jouer(2, THEME, 6, 1)     et celle-ci recommence sans fin
   *
   * L'air avance tout seul, une fois par « image() » : le programme n'a rien
   * à tenir. C'est ce qui permet d'écrire une musique de fond sans que la
   * boucle du jeu ait à s'en occuper à chaque tour — la partition est dans la
   * cartouche, et le compteur dans la mémoire de travail.
   */
  if (nom === 'jouer') {
    if (args.length !== 3 && args.length !== 4) {
      throw new Error(`ligne ${n.ligne} : jouer(voix, AIR, vitesse) prend trois arguments, ou quatre avec la boucle`)
    }
    const quelle = nombreExige(args[0], 'la voix de jouer() s\'écrit en clair : 1 ou 2', n.ligne)
    if (quelle !== 1 && quelle !== 2) {
      throw new Error(`ligne ${n.ligne} : un air se joue sur la voix 1 ou 2. La voix 4 est celle du bruit.`)
    }
    const air = args[1].genre === 'variable' && args[1].symbole && args[1].symbole.genre === 'air'
      ? args[1].symbole
      : null
    if (!air) {
      throw new Error(
        `ligne ${n.ligne} : le second argument de jouer() est le nom d'un Air, ` +
          'écrit comme Air FANFARE = { "DO4 12", … };',
      )
    }

    e.utiliseAirs = true
    const base = ETAT_AIR[quelle]

    /* La voix se tait le temps de l'installation : l'air qui tournait ne doit
       pas jouer un pas de plus avec le curseur d'un autre. */
    e.xorA()
    e.rangerA(base + AIR.ACTIF)

    /* La vitesse. Zéro image par pas ne veut rien dire, et le compte à rebours
       en ferait 256 : une image, au moins. */
    valeur(e, args[2])
    e.orA()
    const vitesseOk = neuve('vitesseOk')
    e.jrNZ(vitesseOk)
    e.incA()
    e.poser(vitesseOk)
    e.rangerA(base + AIR.VITESSE)

    /* Le premier pas se joue à la prochaine image, et non dans huit. */
    e.ldA(1)
    e.rangerA(base + AIR.COMPTE)

    /* Où lire la partition. Le curseur avance pendant que l'air joue ; le
       début reste, car c'est là qu'il faudra revenir pour reboucler. */
    e.ldHLetiquette(air.etiquette)
    e.ldAL()
    e.rangerA(base + AIR.CURSEUR_BAS)
    e.rangerA(base + AIR.DEBUT_BAS)
    e.ldAH()
    e.rangerA(base + AIR.CURSEUR_HAUT)
    e.rangerA(base + AIR.DEBUT_HAUT)

    e.ldA(air.pas)
    e.rangerA(base + AIR.RESTANTS)
    e.rangerA(base + AIR.TOTAL)

    if (args.length === 4) valeur(e, args[3])
    else e.xorA()
    e.rangerA(base + AIR.BOUCLE)

    /* Le drapeau en dernier : tant qu'il n'est pas posé, l'interruption qui
       tomberait au milieu ne trouverait qu'un air arrêté. */
    e.ldA(1)
    e.rangerA(base + AIR.ACTIF)
    return
  }

  /* L'air de cette voix est-il arrivé au bout ? Un air qui boucle ne finit
     jamais ; c'est de quoi enchaîner deux morceaux, ou attendre la fin d'une
     fanfare avant de rendre la main au joueur. */
  if (nom === 'airFini') {
    if (args.length !== 1) throw new Error(`ligne ${n.ligne} : airFini(voix) prend un argument`)
    const quelle = nombreExige(args[0], 'la voix d\'airFini() s\'écrit en clair : 1 ou 2', n.ligne)
    if (quelle !== 1 && quelle !== 2) throw new Error(`ligne ${n.ligne} : les airs jouent sur les voix 1 et 2`)
    e.chargerDe(ETAT_AIR[quelle] + AIR.ACTIF)
    e.xorN(1)
    return
  }

  /* Le volume général, de 0 à 7. De quoi baisser le son d'un jeu à l'autre,
     ou fondre la musique en quelques images. */
  if (nom === 'volumeSon') {
    if (args.length !== 1) throw new Error(`ligne ${n.ligne} : volumeSon(0 à 7) prend un argument`)
    valeur(e, args[0])
    e.andN(0x07)
    e.ldBA()
    e.swapA()
    e.srlA() // × 16 puis ÷ 2 : le même volume à gauche et à droite
    e.orB()
    e.ldhDepuisA(SON_VOLUME)
    return
  }

  /*
   * Le panneau : une couche posée par-dessus le décor, qui NE DÉFILE PAS.
   *
   * C'est ce qui manquait pour faire un score qui reste en place pendant qu'un
   * niveau glisse dessous. Sans lui, il fallait redessiner le score à chaque
   * image, à la position que le défilement lui avait donnée — et le moindre
   * décalage se voyait.
   *
   *   panneau(0, 128)          le coin haut-gauche du panneau, en PIXELS
   *   textePanneau(1, 0, "…")  on y écrit comme sur le fond
   *   cacherPanneau()          il disparaît, sans rien perdre de son contenu
   *
   * Le matériel place le panneau à « x + 7 » : on rend ce décalage invisible,
   * pour que panneau(0, 0) soit vraiment le coin de l'écran.
   */
  if (nom === 'panneau') {
    if (args.length !== 2) throw new Error(`ligne ${n.ligne} : panneau(x, y) prend deux arguments, en pixels`)
    valeur(e, args[1])
    e.ldhDepuisA(FENETRE_Y)
    valeur(e, args[0])
    e.addN(7)
    e.ldhDepuisA(FENETRE_X)
    e.ldhVersA(ECRAN)
    e.orN(0b00100000) // bit 5 : la fenêtre s'affiche
    e.ldhDepuisA(ECRAN)
    return
  }

  if (nom === 'cacherPanneau') {
    if (args.length) throw new Error(`ligne ${n.ligne} : cacherPanneau() ne prend pas d'argument`)
    e.ldhVersA(ECRAN)
    e.andN(0b11011111)
    e.ldhDepuisA(ECRAN)
    return
  }

  if (nom === 'effacerPanneau') {
    if (args.length) throw new Error(`ligne ${n.ligne} : effacerPanneau() ne prend pas d'argument`)
    e.call('EffacerPanneau')
    return
  }

  /*
   * Les quatre nuances, choisies à l'exécution.
   *
   * Elles étaient posées une fois à la mise en route et plus jamais touchées :
   * pas de fondu au noir, pas d'écran qui blanchit quand on perd, pas de
   * personnage qui clignote quand il est touché. Une palette est un octet —
   * deux bits par nuance —, et le changer coûte quelques cycles.
   *
   *   paletteFond(0, 1, 2, 3)        les nuances telles qu'elles sont d'origine
   *   paletteFond(3, 3, 3, 3)        tout noir : le fondu se fait en quatre pas
   *   paletteLutins(0, 0, 1, 2, 3)   la palette n° 0 des lutins
   *
   * Un lutin choisit sa palette avec l'option PALETTE1 de sprite().
   */
  if (nom === 'paletteFond' || nom === 'paletteLutins') {
    const pourLesLutins = nom === 'paletteLutins'
    const attendus = pourLesLutins ? 5 : 4
    if (args.length !== attendus) {
      throw new Error(
        `ligne ${n.ligne} : ${nom}(${pourLesLutins ? 'numero, ' : ''}n0, n1, n2, n3) ` +
          `prend ${attendus} arguments, chacun de 0 à 3`,
      )
    }

    const nuances = pourLesLutins ? args.slice(1) : args
    let registre = PALETTE_FOND

    if (pourLesLutins) {
      const quelle = nombreExige(args[0], 'paletteLutins() veut 0 ou 1 écrit en clair', n.ligne)
      if (quelle > 1) throw new Error(`ligne ${n.ligne} : il n'y a que deux palettes de lutins, 0 et 1`)
      registre = quelle === 0 ? PALETTE_OBJETS : PALETTE_OBJETS2
    }

    /* Tout connu d'avance : l'octet est calculé ici, et rien à l'exécution. */
    const connues = nuances.map((v) => constante(v))
    if (connues.every((v) => v !== null)) {
      if (connues.some((v) => v > 3)) throw new Error(`ligne ${n.ligne} : une nuance va de 0 à 3`)
      e.ldA(connues[0] | (connues[1] << 2) | (connues[2] << 4) | (connues[3] << 6))
      e.ldhDepuisA(registre)
      return
    }

    /* Sinon on assemble : chaque nuance prend sa place de deux bits. */
    e.xorA()
    e.ldhDepuisA(BROUILLON2)
    nuances.forEach((quoi, i) => {
      valeur(e, quoi)
      e.andN(3)
      for (let k = 0; k < i * 2; k++) e.addA()
      e.ldBA()
      e.ldhVersA(BROUILLON2)
      e.orB()
      e.ldhDepuisA(BROUILLON2)
    })
    e.ldhVersA(BROUILLON2)
    e.ldhDepuisA(registre)
    return
  }

  /*
   * Faire glisser le fond. La carte fait 32 cases sur 32, soit 256 pixels de
   * côté, et l'écran n'en montre que 160 sur 144 : le reste attend hors-champ,
   * et c'est ce qui permet de préparer la colonne suivante avant qu'elle
   * n'entre. Au-delà de 255, le décor revient à son point de départ.
   */
  if (nom === 'defiler') {
    if (args.length !== 2) throw new Error(`ligne ${n.ligne} : defiler(x, y) prend deux arguments`)
    valeur(e, args[0])
    e.ldhDepuisA(DEFILEMENT_X)
    valeur(e, args[1])
    e.ldhDepuisA(DEFILEMENT_Y)
    return
  }

  throw new Error(`ligne ${n.ligne} : fonction inconnue « ${nom} »`)
}

/* -------------------------------------------------------- les instructions */

/** Recopie une table gravée vers une zone de mémoire de travail. */
function recopier(e, etiquette, base, taille) {
  e.ldDEetiquette(etiquette)
  e.ldHL(base)
  e.ldBC(taille)
  const boucle = neuve('recopier')
  e.poser(boucle)
  e.ldAdeDE()
  e.ldHLplusA()
  e.incDE()
  e.ecrire(0x0b) // dec bc
  e.ecrire(0x79, 0xb0) // ld a, c : or b — reste-t-il quelque chose ?
  e.jrNZ(boucle)
}

function instruction(e, n) {
  switch (n.genre) {
    case 'declarer': {
      const symbole = n.symbole
      if (!symbole || symbole.genre === 'constante' || symbole.genre === 'table' || symbole.genre === 'mot') return
      if (symbole.genre === 'zone') {
        if (n.copie) recopier(e, n.copie, symbole.base, n.copieTaille)
        return
      }
      if (!n.valeur) return
      valeur(e, n.valeur)
      e.rangerA(symbole.adresse)
      return
    }

    case 'bloc':
      for (const x of n.corps) instruction(e, x)
      return

    case 'affecter': {
      const place = lieu(e, n.cible)

      if (n.operateur === '=') {
        valeur(e, n.valeur)
        rangerLieu(e, place, n.ligne)
        return
      }

      /*
       * « x += 3 » se calcule comme « x = x + 3 », mais sans relire l'endroit
       * deux fois quand il se calcule : « t[i + 1] += 2 » ne doit évaluer
       * « i + 1 » qu'une fois. On charge, on opère, on range au même lieu.
       */
      const acces = accesUnique(e, place, n.ligne)
      acces.lire()
      appliquer(e, n.operateur.slice(0, -1), n.valeur, n.ligne)
      acces.ecrire()
      return
    }

    case 'si': {
      const connu = constante(n.condition)
      if (connu !== null) {
        /* « if (0) » et « if (1) » : un seul des deux côtés est écrit. C'est ce
           qui rend une constante de réglage vraiment gratuite. */
        const pris = connu ? n.alors : n.sinon
        if (pris) for (const x of pris) instruction(e, x)
        return
      }
      const sinon = neuve('sinon')
      const fin = neuve('finsi')
      valeur(e, n.condition)
      e.orA()
      e.jpZ(n.sinon ? sinon : fin)
      for (const x of n.alors) instruction(e, x)
      if (n.sinon) {
        e.jp(fin)
        e.poser(sinon)
        for (const x of n.sinon) instruction(e, x)
      }
      e.poser(fin)
      return
    }

    case 'tantque': {
      const debut = neuve('tantque')
      const fin = neuve('fintantque')
      e.poser(debut)
      /* « while (true) » n'a pas besoin d'être testé à chaque tour. */
      const toujours = constante(n.condition) === 1
      if (!toujours) {
        valeur(e, n.condition)
        e.orA()
        e.jpZ(fin)
      }
      e.boucles.push({ fin, suite: debut })
      for (const x of n.corps) instruction(e, x)
      e.boucles.pop()
      e.jp(debut)
      e.poser(fin)
      return
    }

    case 'faire': {
      const debut = neuve('faire')
      const test = neuve('testfaire')
      const fin = neuve('finfaire')
      e.poser(debut)
      e.boucles.push({ fin, suite: test })
      for (const x of n.corps) instruction(e, x)
      e.boucles.pop()
      e.poser(test)
      valeur(e, n.condition)
      e.orA()
      e.jpNZ(debut)
      e.poser(fin)
      return
    }

    case 'pour': {
      const debut = neuve('pour')
      const pas = neuve('paspour')
      const fin = neuve('finpour')
      for (const x of n.debut) instruction(e, x)
      e.poser(debut)
      if (n.condition && constante(n.condition) !== 1) {
        valeur(e, n.condition)
        e.orA()
        e.jpZ(fin)
      }
      /* « continue » saute au PAS, et non au test : sinon la boucle
         n'avancerait plus, et le programme tournerait sans fin. */
      e.boucles.push({ fin, suite: pas })
      for (const x of n.corps) instruction(e, x)
      e.boucles.pop()
      e.poser(pas)
      for (const x of n.pas) instruction(e, x)
      e.jp(debut)
      e.poser(fin)
      return
    }

    /*
     * Un aiguillage. Les tests sont écrits d'abord, en file, et les corps
     * ensuite, à la suite : c'est ce qui donne au « switch » de C++ sa chute
     * d'un cas dans le suivant quand le « break » manque.
     */
    case 'choisir': {
      const fin = neuve('finchoisir')
      const etiquettes = n.cas.map(() => neuve('cas'))
      const defaut = n.cas.findIndex((cas) => cas.quand === null)

      valeur(e, n.quoi)
      e.ldBA()
      n.cas.forEach((cas, i) => {
        if (cas.quand === null) return
        e.ldAB()
        e.cpN(cas.valeur)
        e.jpZ(etiquettes[i])
      })
      e.jp(defaut === -1 ? fin : etiquettes[defaut])

      e.boucles.push({ fin, suite: e.boucles.length ? e.boucles[e.boucles.length - 1].suite : null })
      n.cas.forEach((cas, i) => {
        e.poser(etiquettes[i])
        for (const x of cas.corps) instruction(e, x)
      })
      e.boucles.pop()
      e.poser(fin)
      return
    }

    case 'casser': {
      if (!e.boucles.length) {
        throw new Error(`ligne ${n.ligne} : « break » ne s'écrit que dans une boucle ou un « switch »`)
      }
      e.jp(e.boucles[e.boucles.length - 1].fin)
      return
    }

    case 'continuer': {
      const boucle = e.boucles[e.boucles.length - 1]
      if (!boucle || !boucle.suite) {
        throw new Error(`ligne ${n.ligne} : « continue » ne s'écrit que dans une boucle`)
      }
      e.jp(boucle.suite)
      return
    }

    case 'retour':
      if (n.valeur) valeur(e, n.valeur)
      e.ret()
      return

    /* Un appel écrit pour lui seul. C'est le seul endroit où une fonction
       « void » a le droit de paraître : ailleurs, on attend une valeur. */
    case 'expression':
      if (n.valeur.genre === 'appel') appel(e, n.valeur)
      else if (n.valeur.genre === 'appelMethode') appelMethode(e, n.valeur)
      else valeur(e, n.valeur)
      return

    default:
      throw new Error(`ligne ${n.ligne} : instruction « ${n.genre} » non comprise`)
  }
}

/* ------------------------------------------------ les fonctions écrites en C */

/*
 * deplace_x(colonne, ligne, tuile, pas) : une case qui avance ou recule toute
 * seule, d'un pas tous les quarts de seconde, et rend sa nouvelle colonne.
 *
 *   x = deplace_x(x, 0, ALPHABET[0], 5);    5 cases vers la droite
 *   x = deplace_x(x, 0, ALPHABET[0], -5);   5 cases vers la gauche
 *
 * Elle n'est pas écrite en instructions de la console, mais dans le langage
 * du lecteur : c'est exactement le programme de la leçon « Une lettre qui
 * avance de 5 cases », rangé dans une fonction. Le compilateur l'ajoute au
 * programme SEULEMENT s'il s'en sert — sinon elle ne coûte pas un octet.
 *
 * Le signe : un octet ne connaît pas les nombres négatifs. -5 y est rangé
 * comme 256 − 5 = 251. Tout pas au-delà de 127 est donc lu comme un recul,
 * et « 0 - pas » retrouve le nombre de cases (0 − 251 = 5, en tournant).
 *
 * Elle bloque, comme attendre() : pendant le voyage, la boucle du programme
 * ne tourne pas. Au bord de l'écran (colonne 0 ou 19), elle s'arrête plutôt
 * que de sortir, et rend la colonne où elle s'est arrêtée.
 */
const SOURCE_DEPLACE_X = `
uint8_t deplace_x(uint8_t colonne, uint8_t ligne, uint8_t tuile, uint8_t pas) {
  uint8_t recule = pas > 127;          // -5 est rangé 251 : au-delà de 127, on recule
  if (recule) pas = 0 - pas;           // 251 redevient 5 : le nombre de cases
  poser(colonne, ligne, tuile);        // la case à sa place de départ
  while (pas > 0) {
    for (uint8_t i = 0; i < deplace_images; i++) image();   // un pas : 15 images (250 ms), ou ce que vitesse() a réglé
    if (recule && colonne == 0) break;          // bord gauche : on s'arrête
    if (!recule && colonne == 19) break;        // bord droit : on s'arrête
    effacer(colonne, ligne, 1);        // 1. efface l'ancienne place
    if (recule) colonne--;             // 2. une colonne plus à gauche…
    else colonne++;                    //    …ou plus à droite
    poser(colonne, ligne, tuile);      // 3. la case à sa nouvelle place
    pas--;                             // un pas de moins à faire
  }
  return colonne;                      // la colonne d'arrivée
}
`

/*
 * deplace_y(colonne, ligne, tuile, pas) : la même chose que deplace_x, mais
 * sur l'axe Y — la case DESCEND ou MONTE — et elle rend sa nouvelle LIGNE.
 *
 *   y = deplace_y(0, y, ALPHABET[0], 5);    5 lignes vers le bas
 *   y = deplace_y(0, y, ALPHABET[0], -5);   5 lignes vers le haut
 *
 * Pourquoi deux fonctions, et pas une seule pour X et Y ? Une fonction ne
 * rend qu'UNE valeur. deplace_x rend la colonne, deplace_y rend la ligne :
 * chacune dit où elle s'est arrêtée, même quand le bord l'a stoppée.
 *
 * Sur l'écran, les lignes vont de 0 (en haut) à 17 (en bas) : un pas positif
 * descend (la ligne grandit), un pas négatif monte (la ligne diminue).
 */
const SOURCE_DEPLACE_Y = `
uint8_t deplace_y(uint8_t colonne, uint8_t ligne, uint8_t tuile, uint8_t pas) {
  uint8_t monte = pas > 127;           // -5 est rangé 251 : au-delà de 127, on monte
  if (monte) pas = 0 - pas;            // 251 redevient 5 : le nombre de lignes
  poser(colonne, ligne, tuile);        // la case à sa place de départ
  while (pas > 0) {
    for (uint8_t i = 0; i < deplace_images; i++) image();   // un pas : 15 images (250 ms), ou ce que vitesse() a réglé
    if (monte && ligne == 0) break;             // bord du haut : on s'arrête
    if (!monte && ligne == 17) break;           // bord du bas : on s'arrête
    effacer(colonne, ligne, 1);        // 1. efface l'ancienne place
    if (monte) ligne--;                // 2. une ligne plus haut…
    else ligne++;                      //    …ou plus bas
    poser(colonne, ligne, tuile);      // 3. la case à sa nouvelle place
    pas--;                             // un pas de moins à faire
  }
  return ligne;                        // la ligne d'arrivée
}
`

/*
 * Les fonctions qui bougent sur les DEUX axes à la fois : deplace, va_a, un_pas.
 *
 * Elles ont un problème que deplace_x et deplace_y n'ont pas : une fonction ne
 * rend qu'UNE valeur, et il y en a deux à rendre, la colonne ET la ligne.
 * Elles rendent donc la colonne (return), et déposent la ligne dans une
 * variable de la console, « deplace_ligne_rendue ». Le compilateur, en
 * réécrivant la ligne (voir « rangerLaPosition »), range l'une dans x et
 * l'autre dans y :
 *
 *   deplace(x, y, ALPHABET[0], 5, 5);
 *   devient
 *   { x = deplace(x, y, ALPHABET[0], 5, 5);  y = deplace_ligne_rendue; }
 *
 * Cette variable n'est ajoutée qu'une fois, même si le programme se sert des
 * trois fonctions : c'est « SOURCE_LIGNE_RENDUE », à part. Elle porte aussi
 * « deplace_images », la durée d'un pas de deplace_x, deplace_y, deplace et
 * va_a : 15 images (250 ms) au départ, et ce que vitesse(ms) règle ensuite.
 */
const SOURCE_LIGNE_RENDUE = `
uint8_t deplace_ligne_rendue = 0;      // la ligne d'arrivée, que la console range dans y
uint8_t deplace_images = 15;           // la durée d'un pas, en images : 15 = 250 ms ; vitesse(ms) la change
`

/*
 * deplace(colonne, ligne, tuile, pasX, pasY) : les deux axes en une ligne.
 *
 *   deplace(x, y, ALPHABET[0], 5, 0);    5 cases vers la droite
 *   deplace(x, y, ALPHABET[0], 0, -5);   5 lignes vers le haut
 *   deplace(x, y, ALPHABET[0], 5, 5);    en diagonale, vers le bas à droite
 *
 * À chaque quart de seconde, un pas sur X (s'il en reste) ET un pas sur Y (s'il
 * en reste) : avec 5 et 5, la case part en diagonale. Au bord, l'axe bloqué
 * ne bouge plus, l'autre continue.
 */
const SOURCE_DEPLACE = `
uint8_t deplace(uint8_t colonne, uint8_t ligne, uint8_t tuile, uint8_t pasX, uint8_t pasY) {
  uint8_t gauche = pasX > 127;         // -5 est rangé 251 : au-delà de 127, vers la gauche
  if (gauche) pasX = 0 - pasX;         // 251 redevient 5 : le nombre de cases
  uint8_t haut = pasY > 127;           // pareil pour Y : au-delà de 127, vers le haut
  if (haut) pasY = 0 - pasY;
  poser(colonne, ligne, tuile);        // la case à sa place de départ
  while (pasX > 0 || pasY > 0) {       // tant qu'il reste un pas sur l'un des axes
    for (uint8_t i = 0; i < deplace_images; i++) image();   // un pas : 15 images (250 ms), ou ce que vitesse() a réglé
    effacer(colonne, ligne, 1);        // 1. efface l'ancienne place
    if (pasX > 0) {                    // 2. un pas sur X…
      if (gauche && colonne > 0) colonne--;
      if (!gauche && colonne < 19) colonne++;
      pasX--;
    }
    if (pasY > 0) {                    //    …et un pas sur Y
      if (haut && ligne > 0) ligne--;
      if (!haut && ligne < 17) ligne++;
      pasY--;
    }
    poser(colonne, ligne, tuile);      // 3. la case à sa nouvelle place
  }
  deplace_ligne_rendue = ligne;        // la ligne d'arrivée, pour y
  return colonne;                      // la colonne d'arrivée, pour x
}
`

/*
 * va_a(colonne, ligne, tuile, versColonne, versLigne) : aller à une case.
 *
 *   va_a(x, y, ALPHABET[0], 10, 5);      jusqu'en (10, 5)
 *
 * On ne compte plus les pas : on dit OÙ aller. À chaque quart de seconde, la
 * case se rapproche d'un pas sur chaque axe qui n'est pas encore bon —
 * d'abord en diagonale, puis tout droit.
 */
const SOURCE_VA_A = `
uint8_t va_a(uint8_t colonne, uint8_t ligne, uint8_t tuile, uint8_t versColonne, uint8_t versLigne) {
  if (versColonne > 19) versColonne = 19;   // l'arrivée reste dans l'écran
  if (versLigne > 17) versLigne = 17;
  poser(colonne, ligne, tuile);             // la case à sa place de départ
  while (colonne != versColonne || ligne != versLigne) {   // pas encore arrivée
    for (uint8_t i = 0; i < deplace_images; i++) image();   // un pas : 15 images (250 ms), ou ce que vitesse() a réglé
    effacer(colonne, ligne, 1);             // 1. efface l'ancienne place
    if (colonne < versColonne) colonne++;   // 2. un pas vers la colonne voulue…
    else if (colonne > versColonne) colonne--;
    if (ligne < versLigne) ligne++;         //    …et vers la ligne voulue
    else if (ligne > versLigne) ligne--;
    poser(colonne, ligne, tuile);           // 3. la case à sa nouvelle place
  }
  deplace_ligne_rendue = ligne;             // la ligne d'arrivée, pour y
  return colonne;                           // la colonne d'arrivée, pour x
}
`

/*
 * un_pas(colonne, ligne, tuile, sensX, sensY) : UN pas, tout de suite.
 *
 *   un_pas(x, y, ALPHABET[0], 1, 0);     une case à droite
 *   un_pas(x, y, ALPHABET[0], 0, -1);    une case en haut
 *
 * Les autres BLOQUENT : pendant le voyage, rien d'autre ne tourne. Celle-ci
 * fait un seul pas, sans attendre, et rend la main. On l'appelle dans la
 * boucle, au rythme qu'on veut : c'est ce qui permet de faire bouger deux
 * lettres à la fois, ou de lire la manette pendant le mouvement.
 *
 * Seul le SIGNE compte : 1 (ou 5) avance d'une case, -1 recule d'une case,
 * 0 ne bouge pas sur cet axe.
 */
const SOURCE_UN_PAS = `
uint8_t un_pas(uint8_t colonne, uint8_t ligne, uint8_t tuile, uint8_t sensX, uint8_t sensY) {
  effacer(colonne, ligne, 1);               // 1. efface l'ancienne place
  if (sensX > 127) {                        // 2. négatif : à gauche…
    if (colonne > 0) colonne--;
  } else if (sensX > 0) {                   //    …positif : à droite
    if (colonne < 19) colonne++;
  }
  if (sensY > 127) {                        //    négatif : en haut…
    if (ligne > 0) ligne--;
  } else if (sensY > 0) {                   //    …positif : en bas
    if (ligne < 17) ligne++;
  }
  poser(colonne, ligne, tuile);             // 3. la case à sa nouvelle place
  deplace_ligne_rendue = ligne;             // la ligne d'arrivée, pour y
  return colonne;                           // la colonne d'arrivée, pour x
}
`

/*
 * carre(x, y, tuile, taille, sens, vitesse, tours) : un carré parfait AUTOUR
 * de la case (x, y).
 *
 *   carre(10, 8, ALPHABET[0], 2, 1, 250, 3);
 *   autour de (10, 8), un carré de 5 × 5, dans le sens des aiguilles d'une
 *   montre, un pas tous les 250 ms, trois tours
 *
 * La taille de base, c'est la case elle-même : « taille » dit à combien de
 * cases d'elle on tourne. 1 : le tour juste autour d'elle (3 × 3) ; 2 : un
 * cran plus loin (5 × 5) ; n : un carré de 2 × n + 1 cases de côté.
 *
 * Le trajet : la case part du centre, gagne en diagonale le coin en haut à
 * gauche, fait ses tours, et revient en diagonale au centre. À la fin, elle
 * est EXACTEMENT à sa place de départ : x et y n'ont pas à changer.
 *
 * Le sens : 1 dans le sens des aiguilles d'une montre (droite, bas, gauche,
 * haut) ; -1 dans l'autre sens (bas, droite, haut, gauche). -1 est rangé 255 :
 * au-delà de 127, c'est l'autre sens.
 *
 * La vitesse : en millisecondes par pas, ÉCRITE EN CLAIR (250, 100…). Le
 * compilateur la traduit en images, comme ms() : la fonction, elle, reçoit
 * un nombre d'images (voir « preparerLesFormes »).
 *
 * Le carré reste PARFAIT : s'il sortait de l'écran, c'est le centre qui est
 * poussé vers l'intérieur, pas la taille qui est rognée. Seule une taille
 * plus grande que l'écran (au-delà de 8) est ramenée à 8.
 */
const SOURCE_CARRE = `
void carre(uint8_t x, uint8_t y, uint8_t tuile, uint8_t taille, uint8_t sens, uint8_t vitesse, uint8_t tours) {
  if (taille > 8) taille = 8;                // 8 : le plus grand carré que l'écran tienne (17 lignes)
  if (x < taille) x = taille;                // trop à gauche : le centre est poussé vers la droite
  if (x + taille > 19) x = 19 - taille;      // trop à droite
  if (y < taille) y = taille;                // trop haut
  if (y + taille > 17) y = 17 - taille;      // trop bas
  uint8_t cote = taille + taille;            // un côté, en pas : 2 × taille
  uint8_t colonne = x;
  uint8_t ligne = y;
  poser(colonne, ligne, tuile);              // la case au centre

  // 1. du centre au coin en haut à gauche, en diagonale : « taille » pas
  for (uint8_t k = 0; k < taille; k++) {
    for (uint8_t i = 0; i < vitesse; i++) image();
    effacer(colonne, ligne, 1);
    colonne--;
    ligne--;
    poser(colonne, ligne, tuile);
  }

  // 2. les tours : 4 côtés de « cote » pas chacun
  for (uint8_t t = 0; t < tours; t++) {
    for (uint8_t c = 0; c < 4; c++) {        // c : le côté, de 0 à 3
      // Dans le sens des aiguilles : côté 0 droite, 1 bas, 2 gauche, 3 haut.
      // Dans l'autre sens, on échange 0 et 1, 2 et 3 : bas, droite, haut, gauche.
      uint8_t direction = c;
      if (sens > 127) direction = c ^ 1;     // ^ 1 : 0 ↔ 1, 2 ↔ 3
      for (uint8_t k = 0; k < cote; k++) {
        for (uint8_t i = 0; i < vitesse; i++) image();
        effacer(colonne, ligne, 1);
        if (direction == 0) colonne++;       // à droite
        if (direction == 1) ligne++;         // en bas
        if (direction == 2) colonne--;       // à gauche
        if (direction == 3) ligne--;         // en haut
        poser(colonne, ligne, tuile);
      }
    }
  }

  // 3. du coin au centre, en diagonale : retour à la place de départ
  for (uint8_t k = 0; k < taille; k++) {
    for (uint8_t i = 0; i < vitesse; i++) image();
    effacer(colonne, ligne, 1);
    colonne++;
    ligne++;
    poser(colonne, ligne, tuile);
  }
}
`

/*
 * losange(x, y, tuile, taille, sens, vitesse, tours) : le carré posé sur la
 * POINTE, autour de la case (x, y). Ses côtés sont des diagonales.
 *
 *   losange(10, 8, ALPHABET[0], 2, 1, 250, 1);
 *
 *           ↘                 les quatre pointes sont à « taille » cases
 *     . . A . .               du centre : en haut, à droite, en bas, à gauche.
 *     . ↗ . ↘ .
 *     A . + . A               Les mêmes réglages que carre(), dans le même
 *     . ↖ . ↙ .               ordre : on peut lui donner un Carre,
 *     . . A . .               losange(ronde).
 *
 * Le trajet : du centre, tout droit jusqu'à la pointe du haut ; puis les tours,
 * en diagonale (sens 1 : vers la droite d'abord ; -1 : vers la gauche) ; puis
 * tout droit jusqu'au centre. Près du bord, le centre est poussé vers
 * l'intérieur ; la taille va jusqu'à 8.
 */
const SOURCE_LOSANGE = `
void losange(uint8_t x, uint8_t y, uint8_t tuile, uint8_t taille, uint8_t sens, uint8_t vitesse, uint8_t tours) {
  if (taille > 8) taille = 8;                // 8 : le plus grand losange que l'écran tienne
  if (x < taille) x = taille;                // trop près d'un bord : le centre est poussé
  if (x + taille > 19) x = 19 - taille;
  if (y < taille) y = taille;
  if (y + taille > 17) y = 17 - taille;
  uint8_t colonne = x;
  uint8_t ligne = y;
  poser(colonne, ligne, tuile);              // la case au centre

  // 1. du centre à la pointe du haut, tout droit : « taille » pas vers le haut
  for (uint8_t k = 0; k < taille; k++) {
    for (uint8_t i = 0; i < vitesse; i++) image();
    effacer(colonne, ligne, 1);
    ligne--;
    poser(colonne, ligne, tuile);
  }

  // 2. les tours : 4 côtés EN DIAGONALE, de « taille » pas chacun
  for (uint8_t t = 0; t < tours; t++) {
    for (uint8_t c = 0; c < 4; c++) {
      // Sens 1, depuis la pointe du haut : côté 0 bas-droite, 1 bas-gauche,
      // 2 haut-gauche, 3 haut-droite. Sens -1 : on échange droite et gauche.
      uint8_t droite = c == 0 || c == 3;
      if (sens > 127) droite = !droite;
      uint8_t bas = c < 2;
      for (uint8_t k = 0; k < taille; k++) {
        for (uint8_t i = 0; i < vitesse; i++) image();
        effacer(colonne, ligne, 1);
        if (droite) colonne++;               // un pas sur X…
        else colonne--;
        if (bas) ligne++;                    // …ET un pas sur Y : la diagonale
        else ligne--;
        poser(colonne, ligne, tuile);
      }
    }
  }

  // 3. de la pointe du haut au centre, tout droit
  for (uint8_t k = 0; k < taille; k++) {
    for (uint8_t i = 0; i < vitesse; i++) image();
    effacer(colonne, ligne, 1);
    ligne++;
    poser(colonne, ligne, tuile);
  }
}
`

/*
 * rectangle(x, y, tuile, largeur, hauteur, sens, vitesse, tours) : un
 * rectangle autour de (x, y). C'est carre() avec DEUX tailles : « largeur »
 * sur X, « hauteur » sur Y, comptées comme la taille d'un carré. Un rectangle
 * de largeur 4 et de hauteur 2 fait 9 × 5 cases (2 × 4 + 1, 2 × 2 + 1).
 *
 *   rectangle(10, 8, ALPHABET[0], 4, 2, 1, 250, 1);
 *
 * Le trajet : du centre au coin en haut à gauche (en diagonale, puis tout
 * droit sur l'axe le plus long), les tours, puis le chemin inverse. Largeur
 * jusqu'à 9, hauteur jusqu'à 8.
 */
const SOURCE_RECTANGLE = `
void rectangle(uint8_t x, uint8_t y, uint8_t tuile, uint8_t largeur, uint8_t hauteur, uint8_t sens, uint8_t vitesse, uint8_t tours) {
  if (largeur > 9) largeur = 9;              // 9 : 19 colonnes, presque toute la largeur
  if (hauteur > 8) hauteur = 8;              // 8 : 17 lignes
  if (x < largeur) x = largeur;              // trop près d'un bord : le centre est poussé
  if (x + largeur > 19) x = 19 - largeur;
  if (y < hauteur) y = hauteur;
  if (y + hauteur > 17) y = 17 - hauteur;
  uint8_t colonne = x;
  uint8_t ligne = y;
  uint8_t coinX = x - largeur;               // le coin en haut à gauche
  uint8_t coinY = y - hauteur;
  poser(colonne, ligne, tuile);

  // 1. du centre au coin : en diagonale tant que les deux axes avancent, puis tout droit
  while (colonne != coinX || ligne != coinY) {
    for (uint8_t i = 0; i < vitesse; i++) image();
    effacer(colonne, ligne, 1);
    if (colonne > coinX) colonne--;
    if (ligne > coinY) ligne--;
    poser(colonne, ligne, tuile);
  }

  // 2. les tours : 2 côtés de 2 × largeur pas, 2 côtés de 2 × hauteur pas
  for (uint8_t t = 0; t < tours; t++) {
    for (uint8_t c = 0; c < 4; c++) {
      uint8_t direction = c;                 // sens 1 : 0 droite, 1 bas, 2 gauche, 3 haut
      if (sens > 127) direction = c ^ 1;     // sens -1 : bas, droite, haut, gauche
      uint8_t longueur = largeur + largeur;  // un côté horizontal : 2 × largeur
      if (direction == 1 || direction == 3) longueur = hauteur + hauteur;   // vertical : 2 × hauteur
      for (uint8_t k = 0; k < longueur; k++) {
        for (uint8_t i = 0; i < vitesse; i++) image();
        effacer(colonne, ligne, 1);
        if (direction == 0) colonne++;
        if (direction == 1) ligne++;
        if (direction == 2) colonne--;
        if (direction == 3) ligne--;
        poser(colonne, ligne, tuile);
      }
    }
  }

  // 3. du coin au centre : le même chemin, à l'envers
  while (colonne != x || ligne != y) {
    for (uint8_t i = 0; i < vitesse; i++) image();
    effacer(colonne, ligne, 1);
    if (colonne < x) colonne++;
    if (ligne < y) ligne++;
    poser(colonne, ligne, tuile);
  }
}
`

/*
 * spirale(x, y, tuile, taille, sens, vitesse) : partir du centre et tourner
 * en s'éloignant, jusqu'au bord d'un carré de « taille ».
 *
 *   spirale(10, 8, ALPHABET[0], 2, 1, 250);
 *
 * Les branches de la spirale s'allongent d'un pas toutes les deux branches :
 * 1, 1, 2, 2, 3, 3… jusqu'à 2 × taille, puis une dernière branche de
 * 2 × taille ferme le carré. Sens 1 : droite, bas, gauche, haut… ; sens -1 :
 * bas, droite, haut, gauche… À la fin, retour au centre en diagonale.
 */
const SOURCE_SPIRALE = `
void spirale(uint8_t x, uint8_t y, uint8_t tuile, uint8_t taille, uint8_t sens, uint8_t vitesse) {
  if (taille > 8) taille = 8;
  if (x < taille) x = taille;                // trop près d'un bord : le centre est poussé
  if (x + taille > 19) x = 19 - taille;
  if (y < taille) y = taille;
  if (y + taille > 17) y = 17 - taille;
  uint8_t colonne = x;
  uint8_t ligne = y;
  uint8_t cote = taille + taille;            // la plus longue branche : 2 × taille
  uint8_t longueur = 1;                      // la branche en cours : 1, 1, 2, 2, 3, 3…
  uint8_t branche = 0;                       // son numéro : 0, 1, 2, 3, 4…
  uint8_t derniere = 0;                      // 1 quand on fait la branche qui ferme le carré
  poser(colonne, ligne, tuile);

  while (longueur <= cote) {
    uint8_t direction = branche & 3;         // 0, 1, 2, 3, 0, 1… : droite, bas, gauche, haut
    if (sens > 127) direction = direction ^ 1;   // l'autre sens : bas, droite, haut, gauche
    for (uint8_t k = 0; k < longueur; k++) {
      for (uint8_t i = 0; i < vitesse; i++) image();
      effacer(colonne, ligne, 1);
      if (direction == 0) colonne++;
      if (direction == 1) ligne++;
      if (direction == 2) colonne--;
      if (direction == 3) ligne--;
      poser(colonne, ligne, tuile);
    }
    if (derniere) break;                     // la branche qui ferme le carré est faite
    branche++;
    if ((branche & 1) == 0) longueur++;      // toutes les deux branches, un pas de plus
    if (longueur > cote) {                   // on a dépassé : une dernière branche de 2 × taille
      longueur = cote;
      derniere = 1;
    }
  }

  // retour au centre, en diagonale
  while (colonne != x || ligne != y) {
    for (uint8_t i = 0; i < vitesse; i++) image();
    effacer(colonne, ligne, 1);
    if (colonne < x) colonne++;
    else if (colonne > x) colonne--;
    if (ligne < y) ligne++;
    else if (ligne > y) ligne--;
    poser(colonne, ligne, tuile);
  }
}
`

/*
 * aller_retour(x, y, tuile, pasX, pasY, vitesse, fois) : aller, et revenir.
 *
 *   aller_retour(10, 8, ALPHABET[0], 5, 0, 250, 3);    3 allers-retours à droite
 *   aller_retour(10, 8, ALPHABET[0], 4, 4, 250, 1);    en diagonale, vers le bas à droite
 *
 * pasX et pasY disent où est l'autre bout, comme pour deplace() : + vers la
 * droite ou le bas, - vers la gauche ou le haut. Avec les deux, le chemin est
 * une diagonale. L'autre bout est gardé dans l'écran. La lettre finit à sa
 * place de départ.
 */
const SOURCE_ALLER_RETOUR = `
void aller_retour(uint8_t x, uint8_t y, uint8_t tuile, uint8_t pasX, uint8_t pasY, uint8_t vitesse, uint8_t fois) {
  // L'autre bout. -5 est rangé 251 : x + 251 « tourne » et revient à x - 5.
  uint8_t versColonne = x + pasX;
  if (pasX > 127 && versColonne > x) versColonne = 0;      // trop à gauche : on a tourné sous 0
  if (pasX < 128 && versColonne > 19) versColonne = 19;    // trop à droite
  uint8_t versLigne = y + pasY;
  if (pasY > 127 && versLigne > y) versLigne = 0;          // trop haut
  if (pasY < 128 && versLigne > 17) versLigne = 17;        // trop bas
  uint8_t colonne = x;
  uint8_t ligne = y;
  poser(colonne, ligne, tuile);

  for (uint8_t f = 0; f < fois; f++) {
    // l'aller : un pas vers l'autre bout, sur chaque axe qui n'y est pas encore
    while (colonne != versColonne || ligne != versLigne) {
      for (uint8_t i = 0; i < vitesse; i++) image();
      effacer(colonne, ligne, 1);
      if (colonne < versColonne) colonne++;
      else if (colonne > versColonne) colonne--;
      if (ligne < versLigne) ligne++;
      else if (ligne > versLigne) ligne--;
      poser(colonne, ligne, tuile);
    }
    // le retour : pareil, vers la place de départ
    while (colonne != x || ligne != y) {
      for (uint8_t i = 0; i < vitesse; i++) image();
      effacer(colonne, ligne, 1);
      if (colonne < x) colonne++;
      else if (colonne > x) colonne--;
      if (ligne < y) ligne++;
      else if (ligne > y) ligne--;
      poser(colonne, ligne, tuile);
    }
  }
}
`

/*
 * deplace_croix(colonne, ligne, tuile, vitesse) : la lettre suit la croix,
 * case par case. Tout le 0.66 en une ligne, à appeler dans la boucle, à
 * chaque image :
 *
 *   while (true) {
 *     image();
 *     deplace_croix(x, y, ALPHABET[0], 250);
 *   }
 *
 * « vitesse » : le temps entre deux pas, en MILLISECONDES, écrit en clair —
 * 250 fait 4 cases par seconde, 100 en fait 10. Le compilateur la traduit en
 * images, comme ms() (voir FORMES) : la fonction reçoit un nombre d'images.
 *
 * Elle lit la croix, fait au plus un pas, reste dans l'écran, efface
 * l'ancienne case SEULEMENT si la lettre a bougé (sinon elle clignoterait),
 * et la pose à sa place. Seule sur sa ligne, la console range la colonne
 * dans x et la ligne dans y.
 *
 * Elle NE BLOQUE PAS : un appel, au plus un pas, et elle rend la main.
 * « croix_attente » compte les images avant le pas suivant : c'est une
 * variable de la console, qui survit d'un appel à l'autre.
 */
const SOURCE_DEPLACE_CROIX = `
uint8_t croix_attente = 0;                // les images avant le prochain pas
uint8_t croix_image = 0;                  // la dernière image où le temps a passé
uint8_t croix_pret = 0;                   // 1 : dans cette image, on a le droit de bouger
uint8_t deplace_croix(uint8_t colonne, uint8_t ligne, uint8_t tuile, uint8_t vitesse) {
  // Le temps ne passe qu'UNE fois par image, même si l'on appelle
  // deplace_croix pour plusieurs lettres : sinon la première lettre
  // relancerait l'attente, et la seconde ne bougerait jamais.
  // Et il passe du VRAI nombre d'images écoulées : une boucle chargée (des
  // nombres à écrire, plusieurs lettres) peut durer deux images par tour ;
  // la lettre garde quand même sa vitesse.
  uint8_t maintenant = images();
  uint8_t passees = maintenant - croix_image;   // les images depuis la dernière fois
  if (passees > 0) {                          // au moins une nouvelle image :
    croix_image = maintenant;
    if (croix_attente > passees) croix_attente -= passees;   //   le temps passe…
    else croix_attente = 0;                   //   …sans descendre sous zéro
    croix_pret = croix_attente == 0;          //   et l'on sait si l'on peut bouger
  }
  if (croix_pret) {                           // on peut faire un pas
    uint8_t avantX = colonne;                 // la place d'avant, pour l'effacer
    uint8_t avantY = ligne;
    if (bouton(DROITE) && colonne < 19) colonne++;
    else if (bouton(GAUCHE) && colonne > 0) colonne--;
    if (bouton(BAS) && ligne < 17) ligne++;
    else if (bouton(HAUT) && ligne > 0) ligne--;
    if (colonne != avantX || ligne != avantY) {   // elle a bougé :
      effacer(avantX, avantY, 1);             //   l'ancienne case s'efface
      croix_attente = vitesse;                //   et l'on attend « vitesse » images
    }
  }
  poser(colonne, ligne, tuile);               // la lettre à sa place
  deplace_ligne_rendue = ligne;               // la ligne, pour y
  return colonne;                             // la colonne, pour x
}
`

/*
 * glisse_croix(numero, px, py, tuile, vitesse) : la même chose AU PIXEL PRÈS,
 * avec un lutin. Tout le 0.70 en une ligne :
 *
 *   glisse_croix(0, px, py, ALPHABET[0], 1);
 *
 * « vitesse » : combien de PIXELS par image, tant qu'une flèche est tenue —
 * 1 fait 60 pixels par seconde, 3 en fait 180. Ce n'est pas une durée : elle
 * peut donc être une variable, et changer en plein jeu (courir avec B…).
 *
 * px va de 0 à 152 et py de 0 à 136, pour que le lutin reste entier dans
 * l'écran de 160 × 144 : un pas qui dépasserait s'arrête au bord. Seule sur
 * sa ligne, la console range la nouvelle place dans px et py.
 */
const SOURCE_GLISSE_CROIX = `
uint8_t glisse_croix(uint8_t numero, uint8_t px, uint8_t py, uint8_t tuile, uint8_t vitesse) {
  if (bouton(DROITE)) {                       // « vitesse » pixels à droite…
    if (px + vitesse < 152) px += vitesse;
    else px = 152;                            // …sans dépasser le bord
  }
  if (bouton(GAUCHE)) {
    if (px > vitesse) px -= vitesse;
    else px = 0;
  }
  if (bouton(BAS)) {
    if (py + vitesse < 136) py += vitesse;
    else py = 136;
  }
  if (bouton(HAUT)) {
    if (py > vitesse) py -= vitesse;
    else py = 0;
  }
  sprite(numero, px, py, tuile);              // le lutin à sa nouvelle place
  deplace_ligne_rendue = py;                  // la ligne en pixels, pour py
  return px;                                  // la colonne en pixels, pour px
}
`

/*
 * tourne_carre(numero, x, y, tuile, cote, vitesse) : une lettre qui tourne
 * en carré SANS FIN, sans bloquer. À appeler à chaque image, dans la boucle :
 *
 *   tourne_carre(0, 10, 8, ALPHABET[1], 4, 250);
 *
 * Au premier appel, la lettre apparaît en (x, y), un coin du carré. Ensuite,
 * toutes les « vitesse » ms, elle fait UN pas : « cote » pas à droite, puis
 * en bas, puis à gauche, puis en haut, et elle recommence. Un côté NÉGATIF
 * (-4) part vers la gauche puis vers le haut : le même carré, parcouru depuis
 * le coin opposé.
 *
 * « numero » (0 à 3) : la console retient, pour chaque numéro, où en est la
 * lettre — sa place, son pas dans le tour, son temps d'attente. Quatre
 * lettres peuvent tourner en même temps, chacune avec son numéro.
 */
const SOURCE_TOURNE_CARRE = `
uint8_t tour_parti[4];                    // 0 : ce numéro n'a pas encore commencé
uint8_t tour_x[4];                        // la place de chaque lettre
uint8_t tour_y[4];
uint8_t tour_pas[4];                      // où elle en est dans son tour
uint8_t tour_attente[4];                  // les images avant son prochain pas
uint8_t tour_image[4];                    // la dernière image où l'on a compté
void tourne_carre(uint8_t numero, uint8_t x, uint8_t y, uint8_t tuile, uint8_t cote, uint8_t vitesse) {
  uint8_t maintenant = images();
  if (tour_parti[numero] == 0) {          // premier appel : la lettre apparaît
    tour_parti[numero] = 1;
    tour_x[numero] = x;
    tour_y[numero] = y;
    tour_pas[numero] = 0;
    tour_attente[numero] = vitesse;
    tour_image[numero] = maintenant;
    poser(x, y, tuile);
    return;
  }
  uint8_t passees = maintenant - tour_image[numero];   // le temps passé depuis
  tour_image[numero] = maintenant;
  if (tour_attente[numero] > passees) {   // pas encore l'heure du pas suivant
    tour_attente[numero] = tour_attente[numero] - passees;
    return;
  }
  tour_attente[numero] = vitesse;         // l'heure est venue : un pas
  uint8_t direction = 0;                  // 0 droite, 1 bas, 2 gauche, 3 haut
  uint8_t p = tour_pas[numero];
  uint8_t n = cote;
  if (cote > 127) n = 0 - cote;           // -4 est rangé 252 : la longueur, c'est 4
  while (p >= n) { p = p - n; direction++; }   // quel côté du tour : 0, 1, 2 ou 3
  if (cote > 127) direction = direction + 2;   // côté négatif : on commence à gauche
  direction = direction & 3;              // 4 redevient 0, 5 redevient 1
  uint8_t cx = tour_x[numero];
  uint8_t cy = tour_y[numero];
  effacer(cx, cy, 1);
  if (direction == 0) cx++;
  if (direction == 1) cy++;
  if (direction == 2) cx--;
  if (direction == 3) cy--;
  poser(cx, cy, tuile);
  tour_x[numero] = cx;
  tour_y[numero] = cy;
  tour_pas[numero]++;
  if (tour_pas[numero] == n + n + n + n) tour_pas[numero] = 0;   // le tour est fini
}
`

/*
 * defile(numero, x, y, tuile, sens, vitesse) : une lettre qui file sur sa
 * ligne, SANS FIN, sans bloquer. À appeler à chaque image :
 *
 *   defile(0, 19, 3, ALPHABET[2], -1, 250);   à gauche
 *   defile(1, 0, 14, ALPHABET[3], 1, 250);    à droite
 *
 * Au premier appel, la lettre apparaît en (x, y). Ensuite, toutes les
 * « vitesse » ms, elle fait un pas : à gauche (sens -1) ou à droite (sens 1).
 * Au bord, elle repart de l'autre côté. « numero » (0 à 3), comme pour
 * tourne_carre : la console retient où en est chaque lettre.
 */
const SOURCE_DEFILE = `
uint8_t file_parti[4];
uint8_t file_x[4];
uint8_t file_attente[4];
uint8_t file_image[4];
void defile(uint8_t numero, uint8_t x, uint8_t y, uint8_t tuile, uint8_t sens, uint8_t vitesse) {
  uint8_t maintenant = images();
  if (file_parti[numero] == 0) {          // premier appel : la lettre apparaît
    file_parti[numero] = 1;
    file_x[numero] = x;
    file_attente[numero] = vitesse;
    file_image[numero] = maintenant;
    poser(x, y, tuile);
    return;
  }
  uint8_t passees = maintenant - file_image[numero];
  file_image[numero] = maintenant;
  if (file_attente[numero] > passees) {
    file_attente[numero] = file_attente[numero] - passees;
    return;
  }
  file_attente[numero] = vitesse;         // un pas
  uint8_t cx = file_x[numero];
  effacer(cx, y, 1);
  if (sens > 127) {                       // sens -1 : à gauche…
    if (cx == 0) cx = 19;                 //   …et au bord, on repart de droite
    else cx--;
  } else {                                // sens 1 : à droite…
    if (cx == 19) cx = 0;                 //   …et au bord, on repart de gauche
    else cx++;
  }
  poser(cx, y, tuile);
  file_x[numero] = cx;
}
`

/*
 * chaque(ms) : « est-ce l'heure ? ». Répond 1 toutes les « ms » millisecondes,
 * 0 le reste du temps, SANS rien arrêter :
 *
 *   if (chaque(250)) { … }     ce bloc se fait 4 fois par seconde
 *
 * Chaque « chaque(…) » écrit dans le programme a son propre chronomètre : le
 * compilateur le réécrit en « chaque_minuteur(k, ms(250)) », avec k son
 * numéro (0, 1, 2… dans l'ordre du programme). L'élève n'a rien à numéroter.
 * Huit au plus. Le temps compte les images RÉELLEMENT passées, comme
 * deplace_croix : une boucle lente ne ralentit pas le rythme.
 */
const SOURCE_CHAQUE = `
uint8_t chaque_parti[8];
uint8_t chaque_attente[8];
uint8_t chaque_image[8];
uint8_t chaque_minuteur(uint8_t numero, uint8_t duree) {
  uint8_t maintenant = images();
  if (chaque_parti[numero] == 0) {        // la première fois : le chronomètre part
    chaque_parti[numero] = 1;
    chaque_image[numero] = maintenant;
    chaque_attente[numero] = duree;
    return 0;
  }
  uint8_t passees = maintenant - chaque_image[numero];
  chaque_image[numero] = maintenant;
  if (chaque_attente[numero] > passees) {  // pas encore l'heure
    chaque_attente[numero] = chaque_attente[numero] - passees;
    return 0;
  }
  chaque_attente[numero] = duree;         // l'heure : on repart pour un tour
  return 1;
}
`

/** Les fonctions de la console écrites en C : leur nom, et leur texte. */
const FONCTIONS_EN_C = {
  chaque_minuteur: SOURCE_CHAQUE,
  tourne_carre: SOURCE_TOURNE_CARRE, defile: SOURCE_DEFILE,
  deplace_croix: SOURCE_DEPLACE_CROIX, glisse_croix: SOURCE_GLISSE_CROIX,
  deplace_x: SOURCE_DEPLACE_X, deplace_y: SOURCE_DEPLACE_Y,
  deplace: SOURCE_DEPLACE, va_a: SOURCE_VA_A, un_pas: SOURCE_UN_PAS,
  carre: SOURCE_CARRE, losange: SOURCE_LOSANGE, rectangle: SOURCE_RECTANGLE,
  spirale: SOURCE_SPIRALE, aller_retour: SOURCE_ALLER_RETOUR,
}

/*
 * Les formes : leurs réglages, et où est leur vitesse.
 *
 *   combien  : le nombre de réglages attendus ;
 *   vitesse  : la place du réglage de vitesse (0 = le premier) ;
 *   exemple  : ce que dit le message quand il manque un réglage.
 *
 * La vitesse est donnée en MILLISECONDES par pas (250, 100…), et traduite ici
 * en images : « 250 » devient « ms(250) », que le compilateur calcule (15
 * images). Un octet ne tient pas 500 : c'est pour cela que la conversion se
 * fait avant le jeu, et que la vitesse s'écrit en clair.
 */
const FORMES = {
  carre: { combien: 7, vitesse: 5, exemple: 'carre(x, y, tuile, taille, sens, vitesse, tours), comme carre(10, 8, ALPHABET[0], 2, 1, 250, 3)' },
  losange: { combien: 7, vitesse: 5, exemple: 'losange(x, y, tuile, taille, sens, vitesse, tours), comme losange(10, 8, ALPHABET[0], 2, 1, 250, 1)' },
  rectangle: { combien: 8, vitesse: 6, exemple: 'rectangle(x, y, tuile, largeur, hauteur, sens, vitesse, tours), comme rectangle(10, 8, ALPHABET[0], 4, 2, 1, 250, 1)' },
  spirale: { combien: 6, vitesse: 5, exemple: 'spirale(x, y, tuile, taille, sens, vitesse), comme spirale(10, 8, ALPHABET[0], 2, 1, 250)' },
  aller_retour: { combien: 7, vitesse: 5, exemple: 'aller_retour(x, y, tuile, pasX, pasY, vitesse, fois), comme aller_retour(10, 8, ALPHABET[0], 5, 0, 250, 3)' },
  tourne_carre: { combien: 6, vitesse: 5, exemple: 'tourne_carre(numero, x, y, tuile, cote, vitesse), comme tourne_carre(0, 10, 8, ALPHABET[1], 4, 250)' },
  defile: { combien: 6, vitesse: 5, exemple: 'defile(numero, x, y, tuile, sens, vitesse), comme defile(0, 19, 3, ALPHABET[2], -1, 250)' },
  deplace_croix: { combien: 4, vitesse: 3, exemple: 'deplace_croix(x, y, tuile, vitesse), comme deplace_croix(x, y, ALPHABET[0], 250) — la vitesse en millisecondes entre deux pas' },
  /* glisse_croix : sa vitesse est en PIXELS par image, pas en millisecondes —
     rien à traduire (pas de « vitesse » ici), et elle peut être une variable. */
  glisse_croix: { combien: 5, exemple: 'glisse_croix(numero, px, py, tuile, vitesse), comme glisse_croix(0, px, py, ALPHABET[0], 1) — la vitesse en pixels par image' },
}

/*
 * Avant la traduction, trois préparations :
 *
 * 1. « Carre » : les sept réglages d'un carré sous un seul nom, comme un Mot.
 *
 *      Carre ronde = { 10, 8, ALPHABET[0], 2, 1, 250, 3 };
 *      carre(ronde);        et aussi        losange(ronde);
 *
 *    Rien n'est rangé en mémoire : « carre(ronde) » est déplié en
 *    « carre(10, 8, ALPHABET[0], 2, 1, 250, 3) », comme si on l'avait écrit.
 *    losange() a les mêmes sept réglages, dans le même ordre : il accepte un
 *    Carre lui aussi.
 *
 * 2. La vitesse des formes, en millisecondes, traduite en images (voir FORMES).
 *
 * 3. « vitesse(100); » : la vitesse de deplace_x, deplace_y, deplace et va_a.
 *    Elles font un pas tous les « deplace_images » images (15 au départ, soit
 *    250 ms). La ligne devient « deplace_images = ms(100); » : les
 *    déplacements qui suivent vont à 100 ms par pas.
 *
 * Rend true si le programme a réglé la vitesse : il faut alors la variable
 * « deplace_images », même s'il ne se sert d'aucun déplacement.
 */
function preparerLesFormes(programme, siennes) {
  const carres = new Map()           // le nom d'un Carre → ses sept réglages
  let vitesseReglee = false
  let chaques = 0                    // les chaque() déjà numérotés

  /* 1. On relève les « Carre nom = { … }; », et on les retire du programme. */
  const relever = (noeud) => {
    if (Array.isArray(noeud)) {
      for (let i = noeud.length - 1; i >= 0; i--) {
        const n = noeud[i]
        if (n?.genre === 'declarer' && n.type?.nom === 'Carre') {
          const reglages = n.valeur?.genre === 'liste' ? n.valeur.valeurs : []
          if (n.tableau || reglages.length !== 7) {
            throw new Error(
              `ligne ${n.ligne} : « Carre ${n.nom} » veut ses sept réglages — le centre (x, y), la tuile, ` +
                `la taille, le sens, la vitesse en ms et les tours : Carre ${n.nom} = { 10, 8, ALPHABET[0], 2, 1, 250, 3 };`,
            )
          }
          carres.set(n.nom, reglages)
          noeud.splice(i, 1)
        } else relever(n)
      }
      return
    }
    if (noeud && typeof noeud === 'object') for (const v of Object.values(noeud)) relever(v)
  }
  relever(programme)

  /* 2 et 3. On déplie les Carre, on traduit les vitesses, on règle vitesse(). */
  const preparer = (noeud) => {
    if (Array.isArray(noeud)) { noeud.forEach(preparer); return }
    if (!noeud || typeof noeud !== 'object') return

    /* « vitesse(100); » devient « deplace_images = ms(100); ». */
    const appel = noeud.valeur
    if (noeud.genre === 'expression' && appel?.genre === 'appel' && appel.nom === 'vitesse' && !siennes.has('vitesse')) {
      const ms = appel.arguments[0]
      if (appel.arguments.length !== 1 || ms.genre !== 'nombre') {
        throw new Error(
          `ligne ${noeud.ligne} : vitesse() veut UN nombre écrit en clair, en millisecondes par pas, comme vitesse(100) : ` +
            'il est traduit en images à la compilation, comme ms(100)',
        )
      }
      noeud.genre = 'affecter'
      noeud.cible = { genre: 'variable', nom: 'deplace_images', ligne: noeud.ligne }
      noeud.operateur = '='
      noeud.valeur = { genre: 'appel', nom: 'ms', arguments: [ms], ligne: noeud.ligne }
      vitesseReglee = true
      return
    }

    /*
     * La couleur des lettres, sur Game Boy Color.
     *
     * Les lettres de la police sont dessinées dans la TEINTE 3 (la plus
     * foncée). Et toute case du fond est dans la palette 0, tant qu'on ne l'a
     * pas teinte autrement. Donc :
     *
     *   couleurTexte(31, 0, 0);           devient   couleurFond(0, 3, 31, 0, 0);
     *     la teinte 3 de la palette 0 : toutes les lettres, en rouge
     *
     *   texteCouleur(5, 6, "ABC", 2);     devient   { texte(5, 6, "ABC");
     *                                                 teindre(5, 6, 2);
     *                                                 teindre(5 + 1, 6, 2);
     *                                                 teindre(5 + 2, 6, 2); }
     *     le mot, et chacune de ses cases dans la palette 2
     *
     * Ce ne sont que des réécritures : couleurFond et teindre font le travail,
     * et refusent un programme en 4 nuances, comme elles l'ont toujours fait.
     */
    if (noeud.genre === 'expression' && appel?.genre === 'appel' && appel.nom === 'couleurTexte' && !siennes.has('couleurTexte')) {
      if (appel.arguments.length !== 3) {
        throw new Error(`ligne ${noeud.ligne} : couleurTexte(rouge, vert, bleu) veut trois nombres, de 0 à 31 : comme couleurTexte(31, 0, 0) pour du rouge`)
      }
      appel.nom = 'couleurFond'
      appel.arguments = [{ genre: 'nombre', valeur: 0, ligne: noeud.ligne }, { genre: 'nombre', valeur: 3, ligne: noeud.ligne }, ...appel.arguments]
      return
    }
    if (noeud.genre === 'expression' && appel?.genre === 'appel' && appel.nom === 'texteCouleur' && !siennes.has('texteCouleur')) {
      const [x, y, mot, palette] = appel.arguments
      if (appel.arguments.length !== 4 || mot?.genre !== 'texte') {
        throw new Error(`ligne ${noeud.ligne} : texteCouleur(x, y, "MOT", palette) veut un texte entre guillemets et une palette de 0 à 7 : comme texteCouleur(5, 6, "BONJOUR", 2)`)
      }
      const ici = noeud.ligne
      const lignes = [{ genre: 'expression', ligne: ici, valeur: { genre: 'appel', nom: 'texte', ligne: ici, arguments: [x, y, mot] } }]
      for (let i = 0; i < [...mot.valeur].length; i++) {
        const colonne = i === 0 ? structuredClone(x)
          : { genre: 'calcul', operateur: '+', gauche: structuredClone(x), droite: { genre: 'nombre', valeur: i, ligne: ici }, ligne: ici }
        lignes.push({ genre: 'expression', ligne: ici, valeur: { genre: 'appel', nom: 'teindre', ligne: ici, arguments: [colonne, structuredClone(y), structuredClone(palette)] } })
      }
      for (const cle of Object.keys(noeud)) delete noeud[cle]
      Object.assign(noeud, { genre: 'bloc', corps: lignes, ligne: ici })
      return
    }

    /* « chaque(250) » devient « chaque_minuteur(k, ms(250)) » : son numéro
       caché, et la durée traduite en images. */
    if (noeud.genre === 'appel' && noeud.nom === 'chaque' && !siennes.has('chaque')) {
      const ms = noeud.arguments[0]
      if (noeud.arguments.length !== 1 || ms.genre !== 'nombre') {
        throw new Error(
          `ligne ${noeud.ligne} : chaque() veut UN nombre écrit en clair, en millisecondes, comme chaque(250) : ` +
            'il est traduit en images à la compilation, comme ms(250)',
        )
      }
      if (chaques >= 8) throw new Error(`ligne ${noeud.ligne} : huit chaque() au plus dans un programme`)
      noeud.nom = 'chaque_minuteur'
      noeud.arguments = [{ genre: 'nombre', valeur: chaques++, ligne: noeud.ligne }, { genre: 'appel', nom: 'ms', arguments: [ms], ligne: noeud.ligne }]
      return
    }

    if (noeud.genre === 'appel' && noeud.nom in FORMES && !siennes.has(noeud.nom)) {
      const forme = FORMES[noeud.nom]
      const args = noeud.arguments
      /* Un Carre à la place des sept réglages : carre(ronde), losange(ronde). */
      if (args.length === 1 && args[0].genre === 'variable' && forme.combien === 7 && noeud.nom !== 'aller_retour') {
        if (!carres.has(args[0].nom)) {
          throw new Error(`ligne ${noeud.ligne} : « ${args[0].nom} » n'est pas un Carre — Carre ${args[0].nom} = { 10, 8, ALPHABET[0], 2, 1, 250, 3 };`)
        }
        noeud.arguments = structuredClone(carres.get(args[0].nom))
      }
      if (noeud.arguments.length !== forme.combien) {
        throw new Error(`ligne ${noeud.ligne} : ${noeud.nom}() veut ${forme.combien} réglages — ${forme.exemple}`)
      }
      if (forme.vitesse === undefined) return   // une vitesse qui n'est pas une durée : rien à traduire
      const vitesse = noeud.arguments[forme.vitesse]
      if (vitesse.genre !== 'nombre') {
        throw new Error(
          `ligne ${noeud.ligne} : la vitesse de ${noeud.nom}() s'écrit en clair, en millisecondes par pas, comme 250 : ` +
            'elle est traduite en images à la compilation, comme ms(250)',
        )
      }
      noeud.arguments[forme.vitesse] = { genre: 'appel', nom: 'ms', arguments: [vitesse], ligne: vitesse.ligne }
      return
    }
    for (const v of Object.values(noeud)) preparer(v)
  }
  preparer(programme)
  return vitesseReglee
}

/*
 * texteGrand(x, y, "TEXTE", taille) : un texte AGRANDI, de 1 à 20 fois.
 *
 *   texteGrand(0, 0, "A", 3);      un A trois fois plus grand : 3 × 3 cases
 *
 * Chaque pixel de la police devient un carré de taille × taille pixels : les
 * proportions sont gardées, et rien n'est dessiné à la main. Le compilateur
 * CALCULE les tuiles de la lettre agrandie, avant le jeu — d'où la règle :
 * le texte et la taille s'écrivent en clair. Seules les tuiles de ce texte, à
 * cette taille, sont fabriquées ; une tuile identique à une autre (souvent
 * toute pleine, aux grandes tailles) n'est fabriquée qu'une fois ; une tuile
 * vide est la tuile 0, l'espace de la police.
 *
 * La ligne devient un bloc : la place est rangée dans deux variables, puis une
 * petite fonction pose les tuiles, rangée par rangée, depuis un tableau gravé
 * dans la cartouche.
 */
function preparerLesTextesGrands(programme, siennes) {
  if (siennes.has('texteGrand')) return ''
  const tuiles = new Map()          // le dessin d'une tuile (64 chiffres) → son nom
  const sources = []
  let k = 0

  const tuileDe = (chiffres) => {
    if (!/[1-3]/.test(chiffres)) return '0'                 // vide : l'espace de la police
    if (!tuiles.has(chiffres)) tuiles.set(chiffres, 'GRAND_' + tuiles.size)
    return tuiles.get(chiffres)
  }

  /*
   * texteGrandS(x, y, "TEXTE", taille) : texteGrand qui VA À LA LIGNE, comme
   * textS pour les petites lettres. Les lettres qui ne tiennent plus dans la
   * largeur (20 cases) repartent en colonne 0, une rangée de lettres plus bas
   * (taille cases). Si le texte dépasse le BAS de l'écran (18 cases), c'est
   * une erreur, qui dit combien de lignes il faudrait.
   *
   * Le découpage se fait avant le jeu : x et y s'écrivent donc en clair, comme
   * le texte et la taille. Chaque ligne devient un texteGrand ordinaire.
   */
  const decouper = (noeud) => {
    const appel = noeud.valeur
    const [x, y, texte, taille] = appel.arguments
    if (appel.arguments.length !== 4 || [x, y, taille].some((a) => a?.genre !== 'nombre') || texte?.genre !== 'texte') {
      throw new Error(
        `ligne ${noeud.ligne} : texteGrandS(x, y, "TEXTE", taille) veut tout écrit en clair — la place, le texte et la taille : ` +
          'comme texteGrandS(0, 0, "BONJOUR", 3). Le découpage en lignes se fait avant le jeu',
      )
    }
    const n = taille.valeur
    const lignes = [{ colonne: x.valeur, lettres: '' }]
    let colonne = x.valeur
    for (const lettre of texte.valeur) {
      if (colonne + n > 20) {                        // plus de place sur la ligne : on passe à la suivante,
        colonne = 0                                  // en colonne 0, comme textS
        lignes.push({ colonne, lettres: '' })
      }
      lignes.at(-1).lettres += lettre
      colonne += n
    }
    /* Une première ligne restée vide (la première lettre ne tenait pas dès la
       colonne de départ) compte quand même : la suite commence en dessous. */
    const bas = y.valeur + lignes.length * n
    if (bas > 18) {
      throw new Error(
        `ligne ${noeud.ligne} : texteGrandS : « ${texte.valeur} » à la taille ${n} demande ${lignes.length} ligne(s) de ${n} cases, ` +
          `jusqu'à la case ${bas} ; l'écran n'en a que 18 — un texte plus court, plus petit, ou plus haut`,
      )
    }
    const nombre = (valeur) => ({ genre: 'nombre', valeur, ligne: noeud.ligne })
    const appels = lignes.map((l, i) => l.lettres && ({
      genre: 'expression', ligne: noeud.ligne,
      valeur: { genre: 'appel', nom: 'texteGrand', ligne: noeud.ligne, arguments: [nombre(l.colonne), nombre(y.valeur + i * n), { genre: 'texte', valeur: l.lettres, ligne: noeud.ligne }, taille] },
    })).filter(Boolean)
    for (const cle of Object.keys(noeud)) delete noeud[cle]
    Object.assign(noeud, { genre: 'bloc', corps: appels, ligne: appels[0].ligne })
  }

  const preparer = (noeud) => {
    if (Array.isArray(noeud)) { noeud.forEach(preparer); return }
    if (!noeud || typeof noeud !== 'object') return
    const appel = noeud.valeur
    if (noeud.genre === 'expression' && appel?.genre === 'appel' && appel.nom === 'texteGrandS') {
      decouper(noeud)                    // devient un bloc de texteGrand, un par ligne…
      preparer(noeud.corps)              // …que l'on prépare aussitôt
      return
    }
    if (noeud.genre === 'expression' && appel?.genre === 'appel' && appel.nom === 'texteGrand') {
      const [x, y, texte, taille] = appel.arguments
      if (appel.arguments.length !== 4 || texte?.genre !== 'texte' || taille?.genre !== 'nombre') {
        throw new Error(
          `ligne ${noeud.ligne} : texteGrand(x, y, "TEXTE", taille) veut un texte entre guillemets et une taille ` +
            'écrite en clair, de 1 à 20 : comme texteGrand(0, 0, "A", 3). Les deux sont calculés avant le jeu',
        )
      }
      /* 20 au plus : une lettre fait 7 pixels de haut, l'écran 144 ; 7 × 20 =
         140, elle tient encore entière. Au-delà, elle dépasserait de l'écran. */
      const n = taille.valeur
      if (n < 1 || n > 20) throw new Error(`ligne ${noeud.ligne} : texteGrand agrandit de 1 à 20 fois ; ${n} est hors de ces limites (au-delà, la lettre dépasse de l'écran)`)
      const lettres = [...texte.valeur]
      const pixels = lettres.map((c) => {
        const p = pixelsDe(c)
        if (!p) throw new Error(`ligne ${noeud.ligne} : texteGrand ne connaît pas le caractère « ${c} »`)
        return p
      })
      const largeur = lettres.length * n                    // en cases
      const hauteur = n
      if (largeur > 255) {
        throw new Error(`ligne ${noeud.ligne} : texteGrand : ${largeur} cases de large, c'est trop (255 au plus) — un texte plus court, ou plus petit`)
      }
      /* Le pixel (px, py) du grand dessin vient du pixel (px / n, py / n) de la
         police. Une table PAR RANGÉE de cases : un octet ne compte que jusqu'à
         255, et 20 × 20 cases en font 400 ; une rangée n'en a jamais plus de 255. */
      const rangees = []
      for (let tr = 0; tr < hauteur; tr++) {
        const table = []
        rangees.push(table)
        for (let tc = 0; tc < largeur; tc++) {
          let chiffres = ''
          for (let py = 0; py < 8; py++) {
            for (let px = 0; px < 8; px++) {
              const gx = tc * 8 + px, gy = tr * 8 + py              // le pixel dans le grand texte
              const lettre = Math.floor(gx / (8 * n))
              const fx = Math.floor((gx % (8 * n)) / n), fy = Math.floor(gy / n)
              chiffres += pixels[lettre][fy][fx]
            }
          }
          table.push(tuileDe(chiffres))
        }
      }
      sources.push(`uint8_t grand_x_${k} = 0;
uint8_t grand_y_${k} = 0;
${rangees.map((t, r) => `const uint8_t GRAND_TABLE_${k}_${r}[] = { ${t.join(', ')} };`).join('\n')}
void texte_grand_${k}() {
${rangees.map((t, r) => `  for (uint8_t c = 0; c < ${largeur}; c++) {
    poser(grand_x_${k} + c, grand_y_${k} + ${r}, GRAND_TABLE_${k}_${r}[c]);
  }`).join('\n')}
}
`)
      const ranger = (nom, valeur) => ({ genre: 'affecter', cible: { genre: 'variable', nom, ligne: noeud.ligne }, operateur: '=', valeur, ligne: noeud.ligne })
      const lignes = [
        ranger(`grand_x_${k}`, x),
        ranger(`grand_y_${k}`, y),
        { genre: 'expression', valeur: { genre: 'appel', nom: `texte_grand_${k}`, arguments: [], ligne: noeud.ligne }, ligne: noeud.ligne },
      ]
      for (const cle of Object.keys(noeud)) delete noeud[cle]
      Object.assign(noeud, { genre: 'bloc', corps: lignes, ligne: lignes[0].ligne })
      k++
      return
    }
    for (const v of Object.values(noeud)) preparer(v)
  }
  preparer(programme)
  if (!k) return ''
  const dessins = [...tuiles].map(([chiffres, nom]) =>
    `Tuile ${nom} = {\n${[...Array(8)].map((_, r) => '  "' + chiffres.slice(r * 8, r * 8 + 8) + '",').join('\n')}\n};\n`).join('')
  return dessins + sources.join('')
}

/*
 * L'autre façon d'écrire : « deplace_x(x, …); », sans « x = ».
 *
 * En C, une fonction reçoit une COPIE de ce qu'on lui donne : elle ne peut pas
 * changer la variable x elle-même (il faudrait une référence, « uint8_t& »,
 * que ce compilateur refuse). La façon normale est donc « x = deplace_x(x, …) »
 * : la fonction REND la position, et on la range.
 *
 * Mais ces fonctions sont des fonctions de la CONSOLE, et le compilateur peut
 * faire ce rangement à notre place. Quand l'appel est seul sur sa ligne — son
 * résultat n'est rangé nulle part — et que la position donnée est une
 * variable (x) ou un champ (joueur.x), il réécrit la ligne :
 *
 *   deplace_x(x, 0, ALPHABET[0], 5);   devient   x = deplace_x(x, 0, ALPHABET[0], 5);
 *   deplace(x, y, ALPHABET[0], 5, 5);  devient   { x = deplace(…);  y = deplace_ligne_rendue; }
 *
 * Rien d'autre ne change : c'est la même fonction, la même cartouche. Et une
 * position qui n'est pas une variable (« deplace_x(3, …) ») n'a nulle part où
 * être rangée : elle n'est pas rangée, la lettre bouge, c'est tout.
 *
 * Seulement pour les fonctions de la console : si le programme a écrit la
 * sienne sous l'un de ces noms, elle suit la règle ordinaire du C.
 */
const RANGEMENTS = {
  // colonne : l'argument qui reçoit la valeur rendue (return) ;
  // ligne   : celui qui reçoit « deplace_ligne_rendue ».
  deplace_x: { colonne: 0 },
  deplace_y: { ligne: 1, rendue: true }, // deplace_y REND la ligne, elle n'a pas besoin de la variable
  deplace: { colonne: 0, ligne: 1 },
  va_a: { colonne: 0, ligne: 1 },
  un_pas: { colonne: 0, ligne: 1 },
  deplace_croix: { colonne: 0, ligne: 1 },
  glisse_croix: { colonne: 1, ligne: 2 },   // le 1er réglage est le numéro du lutin
}
const RANGEABLE = new Set(['variable', 'champ'])        // ce qui peut être à gauche d'un « = »

function rangerLaPosition(noeud, siennes) {
  if (Array.isArray(noeud)) { noeud.forEach((n) => rangerLaPosition(n, siennes)); return }
  if (!noeud || typeof noeud !== 'object') return
  const appel = noeud.valeur
  if (noeud.genre === 'expression' && appel?.genre === 'appel' && appel.nom in RANGEMENTS && !siennes.has(appel.nom)) {
    const regle = RANGEMENTS[appel.nom]
    const rangeable = (i) => i !== undefined && RANGEABLE.has(appel.arguments[i]?.genre)
    const ranger = (i, valeur) => ({
      genre: 'affecter', cible: structuredClone(appel.arguments[i]), operateur: '=', valeur, ligne: noeud.ligne,
    })

    /* deplace_y : une seule valeur, rendue par return — comme deplace_x. */
    if (regle.rendue) {
      if (rangeable(regle.ligne)) Object.assign(noeud, ranger(regle.ligne, appel))
      return
    }

    /* Les autres : la colonne par return, la ligne par la variable de la console. */
    const lignes = []
    lignes.push(rangeable(regle.colonne) ? ranger(regle.colonne, appel) : { genre: 'expression', valeur: appel, ligne: noeud.ligne })
    if (rangeable(regle.ligne)) {
      lignes.push(ranger(regle.ligne, { genre: 'variable', nom: 'deplace_ligne_rendue', ligne: noeud.ligne }))
    }
    if (lignes.length === 1) Object.assign(noeud, lignes[0])
    else {
      /* Deux lignes à la place d'une : un bloc « { … } » les tient ensemble. */
      for (const cle of Object.keys(noeud)) delete noeud[cle]
      Object.assign(noeud, { genre: 'bloc', corps: lignes, ligne: lignes[0].ligne })
    }
    return
  }
  for (const v of Object.values(noeud)) rangerLaPosition(v, siennes)
}

/*
 * ALPHABET_GRAS : l'alphabet en gras, de A à Z, à côté d'ALPHABET (qui ne
 * change pas). « ALPHABET_GRAS[0] » est le A gras, « [25] » le Z gras.
 *
 * Ce ne sont que des tuiles dessinées, écrites dans le langage : 26
 * « Tuile GRAS_A = { … }; » (voir lettresGrasses, dans police.js), puis un
 * tableau qui les range dans l'ordre. Le compilateur les ajoute SEULEMENT si
 * le programme parle d'ALPHABET_GRAS : sinon, pas un octet de plus.
 */
const SOURCE_ALPHABET_GRAS = lettresGrasses().map(({ lettre, lignes }) =>
  `Tuile GRAS_${lettre} = {\n${lignes.map((l) => `  "${l}",`).join('\n')}\n};\n`).join('') +
  `const uint8_t ALPHABET_GRAS[] = { ${lettresGrasses().map(({ lettre }) => 'GRAS_' + lettre).join(', ')} };\n`

/** Le programme nomme-t-il `nom` quelque part (une variable, un tableau) ? */
function nomme(noeud, nom) {
  if (Array.isArray(noeud)) return noeud.some((n) => nomme(n, nom))
  if (!noeud || typeof noeud !== 'object') return false
  if (noeud.nom === nom && noeud.genre !== 'declarer') return true
  return Object.values(noeud).some((v) => nomme(v, nom))
}

/** Le programme appelle-t-il `nom(…)` quelque part ? On fouille tout l'arbre. */
function appelle(noeud, nom) {
  if (Array.isArray(noeud)) return noeud.some((n) => appelle(n, nom))
  if (!noeud || typeof noeud !== 'object') return false
  if (noeud.genre === 'appel' && noeud.nom === nom) return true
  return Object.values(noeud).some((v) => appelle(v, nom))
}

/**
 * Ajoute au programme les fonctions de la console écrites en C dont il se
 * sert — à moins qu'il n'ait écrit la sienne sous le même nom : c'est alors
 * la sienne qui compte.
 */
function avecLesFonctionsEnC(programme) {
  const siennes = new Set(programme.filter((n) => n.genre === 'fonction').map((n) => n.nom))
  const vitesseReglee = preparerLesFormes(programme, siennes)
  const textesGrands = preparerLesTextesGrands(programme, siennes)   // les tuiles agrandies et leurs tables
  rangerLaPosition(programme, siennes)
  const ajoutees = []
  for (const [nom, source] of Object.entries(FONCTIONS_EN_C)) {
    if (siennes.has(nom) || !appelle(programme, nom)) continue   // la sienne, ou pas appelée
    ajoutees.push(...analyser(source))
  }
  /* Les deux variables des déplacements (la ligne rendue, la durée d'un pas),
     UNE fois, si l'un des déplacements est là — ou si vitesse() a été réglée. */
  const deplacements = ['deplace_x', 'deplace_y', 'deplace', 'va_a', 'un_pas', 'deplace_croix', 'glisse_croix']
  const bouge = deplacements.some((nom) => !siennes.has(nom) && appelle(programme, nom))
  if (bouge || vitesseReglee) ajoutees.unshift(...analyser(SOURCE_LIGNE_RENDUE))
  if (textesGrands) ajoutees.unshift(...analyser(textesGrands))
  /* L'alphabet en gras, si le programme en parle (et n'a pas le sien). */
  const siensGlobaux = new Set(programme.filter((n) => n.genre === 'declarer').map((n) => n.nom))
  if (!siensGlobaux.has('ALPHABET_GRAS') && nomme(programme, 'ALPHABET_GRAS')) ajoutees.unshift(...analyser(SOURCE_ALPHABET_GRAS))
  return [...ajoutees, ...programme]
}

/* ------------------------------------------------------------ la traduction */

/**
 * Compile un programme analysé, et rend les octets à poser dans la cartouche.
 */
export function compiler(programme, options = {}) {
  programme = avecLesFonctionsEnC(programme)
  compteur = 0
  const e = new Emetteur()
  if (options.cible) e.cible = options.cible
  /* La moitié Game Boy de « les deux » : les couleurs ne sont pas refusées,
     elles ne sont pas ÉMISES. Voir « couleurIci ». */
  if (options.couleursOmises) e.couleursOmises = true
  const BASE = 0x0150

  const initialisations = resoudreProgramme(e, programme)

  /* --- la mise en route, avant le programme de l'utilisateur --- */
  e.di()

  /* La pile s'installe en haut de la mémoire de travail, et non dans la page
     rapide : celle-ci est trop petite pour loger à la fois les variables, la
     routine de copie des lutins, et une pile qui accueille les appels
     imbriqués. Huit kilo-octets sous la pile, c'est plus qu'il n'en faut. */
  e.ldSP(0xdfff)
  e.call('AttendreVBlank')
  e.xorA()
  e.ldhDepuisA(ECRAN) // écran éteint : la mémoire vidéo est libre
  e.ldA(0b11100100)
  e.ldhDepuisA(PALETTE_FOND)
  e.ldhDepuisA(PALETTE_OBJETS) // les lutins prennent les mêmes nuances
  e.xorA()
  e.ldhDepuisA(DEFILEMENT_X)
  e.ldhDepuisA(DEFILEMENT_Y)
  /*
   * La puce sonore s'allume.
   *
   * Éteinte, elle refuse toute écriture : un « note() » posé avant cette
   * ligne ne ferait rien du tout, sans un message. On l'allume donc une fois
   * pour toutes, à plein volume, les quatre voix dirigées vers les deux
   * côtés — et le programme n'a plus qu'à jouer.
   */
  e.ldA(0x80)
  e.ldhDepuisA(SON_ALLUME)
  e.ldA(0x77) // volume 7 à gauche, 7 à droite
  e.ldhDepuisA(SON_VOLUME)
  e.ldA(0xff) // chaque voix des deux côtés
  e.ldhDepuisA(SON_ROUTAGE)

  /* Une première semence, prise dans le compteur du matériel. */
  e.ldhVersA(0x04)
  e.orA()
  const semenceOk = neuve('semenceOk')
  e.jrNZ(semenceOk)
  e.ldA(0xb8)
  e.poser(semenceOk)
  e.ldhDepuisA(GRAINE)

  /*
   * L'état des airs, remis à zéro.
   *
   * La mémoire de travail contient n'importe quoi à l'allumage. Sans ce
   * ménage, un « actif » resté à 1 par hasard ferait lire une partition qui
   * n'existe pas, et la console jouerait la mémoire.
   */
  e.ldHL(MUSIQUE)
  e.ldB(OCTETS_PAR_VOIX * 2)
  e.xorA()
  const ranger = neuve('rangerAirs')
  e.poser(ranger)
  e.ldHLplusA()
  e.decB()
  e.jrNZ(ranger)

  e.call('CopierTuiles')
  e.call('EffacerCarte')
  e.call('RangerLutins')
  e.call('InstallerTransfert')
  /* Écran allumé, tuiles en $8000, fond ET lutins affichés, et la fenêtre —
     éteinte pour l'instant — ira lire la seconde carte, en $9C00. */
  e.ldA(0b11010011)
  e.ldhDepuisA(ECRAN)

  /*
   * L'interruption du VBlank est autorisée, et elle seule.
   *
   * Elle ne fait qu'une chose : compter les images. C'est peu, et c'est
   * beaucoup — cela donne une horloge que le programme ne peut pas fausser en
   * étant lent, et c'est elle qui permet de DIRE qu'il l'a été. Elle permet
   * aussi à « image() » de mettre le processeur en sommeil au lieu de
   * l'occuper à relire le compteur de ligne des milliers de fois.
   */
  e.xorA()
  e.ldhDepuisA(COMPTEUR_IMAGES)
  e.ldhDepuisA(DERNIER_REVEIL)
  e.ldhDepuisA(RETARD)
  e.ldhDepuisA(0x0f) // les interruptions en attente, oubliées
  e.ldA(0b00000001) // VBlank, et rien d'autre
  e.ecrire(0xea, 0xff, 0xff) // ld [$FFFF], a
  e.ei()

  /* Les globales prennent leur valeur avant main(), dans l'ordre du fichier —
     c'est ce que fait C++, et c'est ce qu'on attend en lisant le programme. */
  for (const n of initialisations) instruction(e, n)

  e.call('fn_main')

  /* Un programme qui finit s'arrête ici plutôt que de partir au hasard. */
  e.poser('Fin')
  e.jr('Fin')

  /* --- les fonctions, l'une après l'autre --- */
  for (const n of programme) {
    if (n.genre !== 'fonction') continue
    e.fonctionCourante = e.signatures.get(n.nom)
    e.poser('fn_' + n.nom)
    for (const x of n.corps) instruction(e, x)
    e.ret()
    e.fonctionCourante = null
  }

  routines(e)
  donnees(e)

  e.corriger(BASE)
  return {
    octets: e.octets,
    base: BASE,
    variables: e.variables,
    zones: e.zones,
    fonctions: e.signatures,
    /*
     * Ce que l'en-tête doit annoncer en $0143.
     *
     *   0     une cartouche d'origine
     *   0x80  elle PROFITE de la couleur, et démarre quand même sur une DMG
     *   0xC0  elle l'EXIGE
     *
     * « les-deux » sans une seule couleur posée reste une cartouche d'origine :
     * annoncer la couleur qu'on n'utilise pas n'apporterait rien.
     */
    couleur: e.cible === 'gb' ? 0 : e.cible === 'gbc' ? 0xc0 : e.couleur ? 0x80 : 0,
    /*
     * Ce programme POSE-T-IL une couleur ? — l’octet ci-dessus ne le dit pas.
     *
     * « gbc » grave $C0 même sur un programme qui n’a pas une seule palette,
     * et « gb » grave 0 sur un programme qui en refuserait. C’est ce drapeau,
     * et lui seul, qui dit s’il y a quelque chose à séparer en deux
     * cartouches.
     */
    poseDesCouleurs: e.couleur,
    cible: e.cible,
    dessins: e.dessins,
    memoire: e.prochainOctet - PREMIER_OCTET_LIBRE,
    /*
     * Où chaque étiquette a fini par tomber.
     *
     * Le compilateur les connaît — il vient de les poser. Les rendre permet de
     * RELIRE la cartouche avec les noms du programme : « call fn_sauter »
     * plutôt que « call $01f7 ». Sans cette table, personne ne peut retrouver
     * ces noms : ils n'entrent pas dans les octets.
     */
    etiquettes: e.etiquettes,
    /* Où le matériel doit sauter quand le VBlank arrive. La cartouche pose le
       saut en $0040 : c'est l'adresse que la console y cherche. */
    vecteurVBlank: BASE + e.etiquettes.get('VBlank'),
  }
}

/* -------------------------------------------------------------- les airs */

/**
 * Faire avancer les mélodies d'une image.
 *
 * L'interruption du VBlank appelle ceci soixante fois par seconde, quoi que
 * fasse le jeu. Un programme qui ne joue rien n'y trouve qu'un « ret » : la
 * musique ne coûte que ce qu'on en fait.
 *
 * Les registres sont empilés ICI plutôt que dans l'interruption : sans musique,
 * on ne paie pas six push-pop soixante fois par seconde pour rien.
 *
 * Le séquenceur est écrit deux fois, une par voix, avec des adresses connues.
 * Une seule routine partagée coûterait un pointeur et son arithmétique à
 * chaque champ ; ici tout accès tient en trois octets, et le code se lit comme
 * ce qu'il fait.
 */
function airs(e) {
  e.poser('AvancerAirs')
  if (!e.utiliseAirs) {
    e.ret()
    return
  }
  e.pushBC()
  e.pushDE()
  e.pushHL()
  avancerUneVoix(e, 1)
  avancerUneVoix(e, 2)
  e.popHL()
  e.popDE()
  e.popBC()
  e.ret()
}

function avancerUneVoix(e, quelle) {
  const base = ETAT_AIR[quelle]
  const voix = VOIX[quelle]
  const fin = neuve('airFini')
  const pas = neuve('airPas')
  const arreter = neuve('airArreter')
  const pleine = neuve('airNote')

  /** La voix se tait : plus d'enveloppe, et un déclenchement pour l'acter. */
  const taire = () => {
    e.xorA()
    e.ldhDepuisA(voix.enveloppe)
    e.ldA(0x80)
    e.ldhDepuisA(voix.haute)
  }

  e.chargerDe(base + AIR.ACTIF)
  e.orA()
  e.jpZ(fin)

  /* Le pas courant dure-t-il encore ? C'est le compte à rebours qui fait le
     tempo : une image de moins, et l'on ne touche à rien tant qu'il reste. */
  e.chargerDe(base + AIR.COMPTE)
  e.decA()
  e.rangerA(base + AIR.COMPTE)
  e.jpNZ(fin)

  e.chargerDe(base + AIR.VITESSE)
  e.rangerA(base + AIR.COMPTE)

  e.chargerDe(base + AIR.RESTANTS)
  e.orA()
  e.jpNZ(pas)

  /* Plus un pas : ou l'on recommence au début, ou l'air s'arrête. */
  e.chargerDe(base + AIR.BOUCLE)
  e.orA()
  e.jpZ(arreter)
  e.chargerDe(base + AIR.DEBUT_BAS)
  e.rangerA(base + AIR.CURSEUR_BAS)
  e.chargerDe(base + AIR.DEBUT_HAUT)
  e.rangerA(base + AIR.CURSEUR_HAUT)
  e.chargerDe(base + AIR.TOTAL)
  e.rangerA(base + AIR.RESTANTS)
  e.jp(pas)

  e.poser(arreter)
  e.xorA()
  e.rangerA(base + AIR.ACTIF)
  taire()
  e.jp(fin)

  /* Lire le pas : la hauteur, puis le volume, et le curseur avance de deux. */
  e.poser(pas)
  e.chargerDe(base + AIR.RESTANTS)
  e.decA()
  e.rangerA(base + AIR.RESTANTS)

  e.chargerDe(base + AIR.CURSEUR_BAS)
  e.ldLA()
  e.chargerDe(base + AIR.CURSEUR_HAUT)
  e.ldHA()
  e.ldAdeHLplus()
  e.ldBA() // b : la hauteur
  e.ldAdeHLplus()
  e.ldCA() // c : le volume
  e.ldAL()
  e.rangerA(base + AIR.CURSEUR_BAS)
  e.ldAH()
  e.rangerA(base + AIR.CURSEUR_HAUT)

  e.ldAB()
  e.cpN(PAS_TENIR)
  e.jpZ(fin) // « == » : la note d'avant continue, sans être rejouée
  e.cpN(PAS_SILENCE)
  e.jpNZ(pleine)
  taire()
  e.jp(fin)

  /*
   * Une vraie note. C'est ce que fait « note() », à ceci près que la durée
   * n'est pas armée : c'est le pas suivant qui décidera de la suite. Le
   * déclenchement s'écrit en dernier — le matériel ne prend la fréquence qu'à
   * ce moment-là, et l'écrire avant jouerait la note précédente.
   */
  e.poser(pleine)
  if (voix.balayage !== null) {
    e.xorA()
    e.ldhDepuisA(voix.balayage)
  }
  e.ldA(0x80) // un carré à moitié haut, sans compteur de durée
  e.ldhDepuisA(voix.longueur)
  e.ldAC()
  e.andN(0x0f)
  e.swapA()
  e.ldhDepuisA(voix.enveloppe)
  e.ldH(0)
  e.ldLB()
  e.addHLHL() // deux octets par note dans la table
  e.ldDEetiquette('Notes')
  e.addHLDE()
  e.ldAdeHLplus()
  e.ldhDepuisA(voix.basse)
  e.ldAdeHL()
  e.andN(0x07)
  e.orN(0x80)
  e.ldhDepuisA(voix.haute)

  e.poser(fin)
}

/* ------------------------------------------------------------ les routines */

function routines(e) {
  /*
   * L'interruption du VBlank. Le matériel saute ici soixante fois par seconde,
   * quoi que fasse le programme.
   *
   * Elle est aussi courte que possible : tout ce qu'on y ferait de long
   * volerait du temps au jeu, et à un moment qu'il ne choisit pas. Elle compte
   * une image, et rend la main.
   */
  e.poser('VBlank')
  e.pushAF()
  e.ldhVersA(COMPTEUR_IMAGES)
  e.incA()
  e.ldhDepuisA(COMPTEUR_IMAGES)
  /*
   * Et la musique avance d'une image.
   *
   * Elle est ICI, et non dans « image() », et cela s'est décidé en écoutant :
   * un jeu qui calcule trop rate le VBlank et tourne à trente images par
   * seconde — sa musique, cadencée par « image() », ralentissait de moitié
   * avec lui. Un tempo qui dépend de la charge du jeu n'est pas un tempo.
   *
   * L'interruption reste courte : un programme qui ne joue rien n'y trouve
   * qu'un « ret », et le séquenceur, lui, empile ce dont il se sert.
   */
  e.call('AvancerAirs')
  e.popAF()
  e.reti()

  /*
   * Attendre le VBlank — mais SEULEMENT si l'écran est allumé.
   *
   * Écran éteint, le compteur de ligne reste bloqué à zéro : une attente y
   * tourne pour toujours, et la console se fige sans un message. C'est le
   * piège classique de cette machine, et il n'a rien à faire dans un langage
   * où l'on écrit « ecran(0) » puis « texte(…) » sans y penser. Le test tient
   * en trois octets ; il rend le gel impossible, quel que soit le programme.
   */
  /*
   * Attendre l'image suivante, et dire si l'on est en retard.
   *
   * Le processeur DORT — `halt` — jusqu'à la prochaine interruption, au lieu
   * de relire le compteur de ligne des milliers de fois. Sur une console à
   * piles, cela change quelque chose ; ici, cela rend surtout le programme
   * honnête sur ce qu'il attend.
   *
   * Écran éteint, il n'y a pas de VBlank : dormir ne réveillerait personne, et
   * la console se figerait pour toujours. On rend donc la main tout de suite —
   * la mémoire vidéo est de toute façon libre en permanence.
   */
  e.poser('AttendreImage')
  e.ldhVersA(ECRAN)
  e.andN(0x80)
  e.ecrire(0xc8) // ret z — écran éteint : rien à attendre

  /*
   * Le retard se mesure À L'ENTRÉE, et non pendant l'attente.
   *
   * C'est tout le piège, et je m'y suis fait prendre : compter les images
   * écoulées pendant que l'on attend donne toujours une, quel qu'ait été le
   * travail — car le compteur a déjà avancé AVANT qu'on arrive. Ce qu'il faut
   * comparer, c'est le compteur d'aujourd'hui à celui du réveil précédent. S'il
   * a bougé pendant que le jeu calculait, le VBlank visé est passé sans nous.
   */
  e.ldhVersA(COMPTEUR_IMAGES)
  e.ldBA()
  e.ldhVersA(DERNIER_REVEIL)
  e.ecrire(0xb8) // cp b — le compteur a-t-il bougé pendant le travail ?
  e.ldA(0)
  const aLHeure = neuve('aLHeure')
  e.jrZ(aLHeure)
  e.ldA(1)
  e.poser(aLHeure)
  e.ldhDepuisA(RETARD)

  const dodo = neuve('dodo')
  e.poser(dodo)
  e.halt()
  e.ldhVersA(COMPTEUR_IMAGES)
  e.ecrire(0xb8) // cp b
  e.jrZ(dodo)
  e.ldhDepuisA(DERNIER_REVEIL)
  e.ret()

  airs(e)

  /*
   * Attendre le moment où l'on peut écrire à l'écran : le VBlank, lignes 144
   * à 153, quand la console ne dessine pas.
   *
   * Autrefois, on attendait la ligne 144 EXACTEMENT. Déjà dans le VBlank (145
   * et au-delà), on laissait donc passer toute une image pour attendre le
   * suivant : « effacer » dans un VBlank, « poser » dans le suivant, et
   * l'écran montrait entre les deux une image SANS la lettre — elle
   * clignotait, et chaque pas durait une image de trop.
   *
   * Maintenant, on écrit tout de suite si l'on est déjà dans le VBlank —
   * sauf sur ses deux dernières lignes (152, 153) : trop près de la reprise
   * du dessin pour écrire sans risque sur une vraie console. Là, on attend
   * le VBlank suivant, comme avant.
   */
  e.poser('AttendreVBlank')
  e.ldhVersA(ECRAN)
  e.andN(0x80) // bit 7 : l'écran est-il allumé ?
  e.ecrire(0xc8) // ret z — éteint, il n'y a pas de VBlank à attendre
  const a1 = neuve('vb')
  e.poser(a1)
  e.ldhVersA(LIGNE_ECRAN)
  e.cpN(144)
  e.jrC(a1) // avant la ligne 144 : la console dessine, on attend
  e.cpN(152)
  e.jrNC(a1) // lignes 152 et 153 : trop tard, on attend le VBlank suivant
  e.ret()

  e.poser('AttendreFinVBlank')
  e.ldhVersA(ECRAN)
  e.andN(0x80)
  e.ecrire(0xc8) // ret z — même raison
  const a2 = neuve('vb')
  e.poser(a2)
  e.ldhVersA(LIGNE_ECRAN)
  e.cpN(144)
  e.jrZ(a2)
  e.ret()

  /* HL = destination, DE = source, B = longueur. Attend le VBlank d'abord. */
  /*
   * Effacer des cases. `hl` la première, `b` combien.
   *
   * La tuile 0 est le vide : effacer, c'est l'écrire. Le compte à zéro sort
   * TOUT DE SUITE — sans ce garde, « dec b » passerait de 0 à 255 et l'on
   * effacerait deux cent cinquante-six cases pour en avoir demandé aucune.
   * C'est le genre de bogue qui n'arrive que le jour où la longueur est
   * calculée, et qui efface alors la moitié de l'écran.
   */
  e.poser('EffacerCases')
  e.ldAB()
  e.orA()
  e.retZ()
  e.call('AttendreVBlank')
  const vider = neuve('effacer')
  e.poser(vider)
  e.xorA()
  e.ldHLplusA()
  e.decB()
  e.jrNZ(vider)
  e.ret()

  e.poser('EcrireTexte')
  e.call('AttendreVBlank')
  const boucle = neuve('ecrire')
  e.poser(boucle)
  e.ldAdeDE()
  e.ldHLplusA()
  e.incDE()
  e.decB()
  e.jrNZ(boucle)
  e.ret()

  /*
   * textS à une position calculée. `hl` la première case, `c` sa colonne,
   * `de` le texte, `b` sa longueur. Après la colonne 19 : +12 pour sauter les
   * douze colonnes cachées de la carte (32 − 20), et l'on est au début de la
   * ligne suivante. Arrivé sous la ligne 17 (0x9A40), on repart en haut.
   * Ajoutée seulement si le programme s'en sert.
   */
  /*
   * attendre(secondes). `a` le nombre de secondes. Deux compteurs : `b` les
   * secondes, `c` les 60 images de chacune. Ils sont mis à l'abri à chaque
   * image : « AttendreImage » se sert de `b`. Ajoutée seulement si le
   * programme s'en sert.
   */
  if (e.besoinAttendre) {
    e.poser('AttendreSecondes')
    e.orA()
    e.retZ() // attendre(0) : rien à attendre
    e.ldBA()
    const seconde = neuve('attendre')
    const uneImage = neuve('attendre')
    e.poser(seconde)
    e.ldC(60)
    e.poser(uneImage)
    e.ecrire(0xc5) // push bc
    e.call('AttendreImage')
    e.ecrire(0xcd, ROUTINE_TRANSFERT & 0xff, (ROUTINE_TRANSFERT >> 8) & 0xff) // les lutins, comme image()
    e.ecrire(0xc1) // pop bc
    e.ecrire(0x0d) // dec c
    e.jrNZ(uneImage)
    e.decB()
    e.jrNZ(seconde)
    e.ret()
  }

  if (e.besoinTexteS) {
    e.poser('EcrireTexteS')
    e.call('AttendreVBlank')
    const lettre = neuve('textS')
    const suite = neuve('textS')
    e.poser(lettre)
    e.ldAdeDE()
    e.ldHLplusA()
    e.incDE()
    e.ecrire(0x0c) // inc c — la colonne suivante
    e.ldAC()
    e.cpN(20)
    e.jrNZ(suite)
    e.ldC(0)
    e.pushDE()
    e.ldDE(12)
    e.addHLDE()
    e.popDE()
    e.ldAH()
    e.cpN((CARTE_FOND + 18 * 32) >> 8)
    e.jrNZ(suite)
    e.ldAL()
    e.cpN((CARTE_FOND + 18 * 32) & 0xff)
    e.jrNZ(suite)
    e.ldHL(CARTE_FOND)
    e.poser(suite)
    e.decB()
    e.jrNZ(lettre)
    e.ret()
  }

  /*
   * Écrire un nombre, en base dix. `a` la valeur, `hl` la première case,
   * `b` le nombre de chiffres.
   *
   * On écrit de DROITE à GAUCHE : le chiffre des unités est le reste de la
   * division par dix, et le quotient donne la suite. Écrire de gauche à droite
   * demanderait de savoir d'avance combien de chiffres le nombre occupe — donc
   * de diviser deux fois.
   *
   * Le processeur ne sait pas diviser : on retire dix tant qu'on peut. Vingt-
   * cinq tours au pire, une fois par chiffre. C'est court, et cela tient en
   * vingt octets.
   */
  e.poser('EcrireNombre')
  e.pushAF()
  /* L'attente D'ABORD, et la valeur mise à l'abri pendant ce temps :
     « AttendreVBlank » relit le registre de l'écran, donc écrase `a`. Le
     nombre affiché était alors le numéro de la ligne balayée — un « 144 »
     parfaitement stable, qu'on prend d'abord pour un calcul faux. */
  e.call('AttendreVBlank')
  e.ldAB()
  e.decA()
  e.ldEA()
  e.ldD(0)
  e.addHLDE() // hl : la case du chiffre le plus à droite
  e.popAF()

  const chiffreSuivant = neuve('chiffre')
  e.poser(chiffreSuivant)
  e.ldD(0) // le quotient
  const retirerDix = neuve('retirerDix')
  e.poser(retirerDix)
  e.cpN(10)
  const resteTrouve = neuve('reste')
  e.jrC(resteTrouve)
  e.subN(10)
  e.incD()
  e.jr(retirerDix)
  e.poser(resteTrouve)
  e.addN(numeroDe('0')) // le reste devient la tuile de son chiffre
  e.ldHLA()
  e.decHL()
  e.ldAD() // le quotient devient la valeur du chiffre suivant
  e.decB()
  e.jrNZ(chiffreSuivant)
  e.ret()

  /*
   * Diviser : a devient a / b. Le processeur ne sait pas diviser — il ne sait
   * même pas multiplier. On retire b tant qu'on peut, et le nombre de fois est
   * le quotient. C'est lent quand a est grand, mais un jeu divise par huit ou
   * par dix, jamais par un.
   *
   * Diviser par zéro rend zéro, plutôt que de faire tourner la console pour
   * toujours : une console figée n'apprend rien à personne.
   */
  e.poser('Diviser')
  e.ldC(0) // le quotient
  e.ecrire(0x57) // ld d, a — a est mis de côté
  e.ldAB()
  e.orA() // b vaut-il zéro ?
  const finDiv = neuve('finDiv')
  e.jrZ(finDiv)
  e.ecrire(0x7a) // ld a, d
  const bcleDiv = neuve('diviser')
  e.poser(bcleDiv)
  e.ecrire(0xb8) // cp b
  e.jrC(finDiv) // a est plus petit que b : c'est fini
  e.subB()
  e.ecrire(0x0c) // inc c
  e.jr(bcleDiv)
  e.poser(finDiv)
  e.ecrire(0x79) // ld a, c
  e.ret()

  /* Le reste, par le même chemin : on retire b tant qu'on peut, et ce qui
     reste est le reste. Un reste par zéro laisse a tel quel. */
  e.poser('Reste')
  e.ecrire(0x57) // ld d, a
  e.ldAB()
  e.orA()
  e.ecrire(0x7a) // ld a, d
  e.ecrire(0xc8) // ret z — b vaut zéro : on rend a inchangé
  const bcleReste = neuve('reste')
  e.poser(bcleReste)
  e.ecrire(0xb8) // cp b
  e.ecrire(0xd8) // ret c — il reste moins que b
  e.subB()
  e.jr(bcleReste)

  /* a × b, par additions successives. Ce processeur ne sait pas multiplier :
     on ajoute « a » autant de fois que « b » l'indique. Le résultat déborde
     au-delà de 255, comme toute valeur d'un octet. */
  e.poser('Multiplier')
  e.ecrire(0x4f) // ld c, a — c garde la valeur à additionner
  e.xorA() //        le total démarre à zéro
  const bouclemul = neuve('mul')
  const finMul = neuve('finmul')
  e.poser(bouclemul)
  e.ecrire(0x57) // ld d, a — le total est mis à l'abri le temps du test
  e.ldAB()
  e.orA() //       reste-t-il des tours à faire ?
  e.jrZ(finMul)
  e.ecrire(0x7a) // ld a, d — on reprend le total
  e.ecrire(0x81) // add a, c
  e.decB()
  e.jr(bouclemul)
  e.poser(finMul)
  e.ecrire(0x7a) // ld a, d
  e.ret()

  /* a décalé de b rangs. Écrit « x << n » quand n n'est pas connu d'avance ;
     quand il l'est, le compilateur déroule et n'appelle pas ceci. */
  e.poser('DecalerGauche')
  const bcleGauche = neuve('decg')
  const finGauche = neuve('findecg')
  e.poser(bcleGauche)
  e.ecrire(0x57) // ld d, a
  e.ldAB()
  e.orA()
  e.jrZ(finGauche)
  e.ecrire(0x7a) // ld a, d
  e.addA()
  e.decB()
  e.jr(bcleGauche)
  e.poser(finGauche)
  e.ecrire(0x7a) // ld a, d
  e.ret()

  e.poser('DecalerDroite')
  const bcleDroite = neuve('decd')
  const finDroite = neuve('findecd')
  e.poser(bcleDroite)
  e.ecrire(0x57) // ld d, a
  e.ldAB()
  e.orA()
  e.jrZ(finDroite)
  e.ecrire(0x7a) // ld a, d
  e.srlA()
  e.decB()
  e.jr(bcleDroite)
  e.poser(finDroite)
  e.ecrire(0x7a) // ld a, d
  e.ret()

  /* Tous les lutins hors de l'écran : sans cela, la table contient ce que la
     console avait en mémoire à l'allumage, et des carrés apparaissent. */
  e.poser('RangerLutins')
  e.ldHL(OAM_OMBRE)
  e.ldB(160)
  const rangement = neuve('ranger')
  e.poser(rangement)
  e.xorA()
  e.ldHLplusA()
  e.decB()
  e.jrNZ(rangement)
  e.ret()

  /* La routine de copie déménage dans la page rapide : pendant le transfert,
     le processeur ne peut plus lire la cartouche. */
  e.poser('InstallerTransfert')
  e.ldDEetiquette('DonneesTransfert')
  e.ldHL(ROUTINE_TRANSFERT)
  e.ldB(OCTETS_DU_TRANSFERT)
  const installation = neuve('installer')
  e.poser(installation)
  e.ldAdeDE()
  e.ldHLplusA()
  e.incDE()
  e.decB()
  e.jrNZ(installation)
  e.ret()

  /* Les dessins partent en mémoire vidéo. Écran éteint : c'est permis. */
  e.poser('CopierTuiles')
  e.ldDEetiquette('Tuiles')
  e.ldHL(MEMOIRE_TUILES)
  e.ldBC(e.prochaineTuile * 16)
  const copie = neuve('copie')
  e.poser(copie)
  e.ldAdeDE()
  e.ldHLplusA()
  e.incDE()
  e.ecrire(0x0b) // dec bc
  e.ecrire(0x79) // ld a, c
  e.ecrire(0xb0) // or b — reste-t-il quelque chose ?
  e.jrNZ(copie)
  e.ret()

  /* Les DEUX cartes à la tuile 0, qui est le vide : celle du décor et celle
     du panneau. Effacer la première seule laissait dans la seconde ce que la
     console avait en mémoire à l'allumage, et le panneau s'ouvrait sur des
     caractères au hasard. */
  e.poser('EffacerCarte')
  e.ldHL(CARTE_FOND)
  e.ldBC(32 * 32 * 2)
  const vide = neuve('vide')
  e.poser(vide)
  e.xorA()
  e.ldHLplusA()
  e.ecrire(0x0b) // dec bc
  e.ecrire(0x79) // ld a, c
  e.ecrire(0xb0) // or b
  e.jrNZ(vide)
  e.ret()

  /*
   * Le tirage au sort.
   *
   * `hasard()` lisait autrefois le compteur libre du matériel, tel quel. Huit
   * appels d'affilée rendaient alors 240, 241, 242, 243, 244, 245, 245, 246 :
   * une suite arithmétique, pas un tirage. Un jeu qui pose trois ennemis à la
   * suite les posait au même endroit, et rien ne le disait.
   *
   * Ici, un registre à décalage rebouclé — celui des vrais générateurs huit
   * bits — mélange l'état à chaque appel, et le compteur du matériel y est
   * versé pour que deux parties ne se ressemblent pas. Le zéro est écarté :
   * un tel registre, une fois à zéro, y reste pour toujours.
   */
  e.poser('Hasard')
  e.ldhVersA(GRAINE)
  for (let pas = 0; pas < 2; pas++) {
    const saute = neuve('pasDeRetour')
    e.srlA()
    e.jrNC(saute)
    e.xorN(0xb8) // le polynôme qui donne la période la plus longue
    e.poser(saute)
  }
  e.ldBA()
  e.ldhVersA(0x04) // le compteur libre : l'entropie du matériel
  e.xorB()
  const pasNul = neuve('pasNul')
  e.jrNZ(pasNul)
  e.ldA(0xb8)
  e.poser(pasNul)
  e.ldhDepuisA(GRAINE)
  e.ret()

  /* Le panneau seul, remis à du vide. Le décor, lui, n'est pas touché. */
  /* Vider tout le fond : les 32 × 32 de la carte, et non les 20 × 18 vus. */
  e.poser('EffacerFond')
  e.call('AttendreVBlank')
  e.ldHL(CARTE_FOND)
  e.ldBC(32 * 32)
  const videFond = neuve('videFond')
  e.poser(videFond)
  e.xorA()
  e.ldHLplusA()
  e.ecrire(0x0b) // dec bc
  e.ecrire(0x79) // ld a, c
  e.ecrire(0xb0) // or b
  e.jrNZ(videFond)
  e.ret()

  e.poser('EffacerPanneau')
  e.call('AttendreVBlank')
  e.ldHL(CARTE_PANNEAU)
  e.ldBC(32 * 32)
  const videPanneau = neuve('videPanneau')
  e.poser(videPanneau)
  e.xorA()
  e.ldHLplusA()
  e.ecrire(0x0b) // dec bc
  e.ecrire(0x79) // ld a, c
  e.ecrire(0xb0) // or b
  e.jrNZ(videPanneau)
  e.ret()

  /* Les huit boutons dans un seul octet, comme sur la vraie console. */
  e.poser('LireManette')
  e.ldA(0b00100000)
  e.ldhDepuisA(MANETTE)
  e.ldhVersA(MANETTE)
  e.ldhVersA(MANETTE)
  e.cplA()
  e.andN(0x0f)
  e.ldBA()
  e.ldA(0b00010000)
  e.ldhDepuisA(MANETTE)
  e.ldhVersA(MANETTE)
  e.ldhVersA(MANETTE)
  e.ldhVersA(MANETTE)
  e.ldhVersA(MANETTE)
  e.cplA()
  e.andN(0x0f)
  e.swapA()
  e.orB()
  e.ldBA()
  e.ldA(0b00110000)
  e.ldhDepuisA(MANETTE)
  e.ldAB()
  e.ret()
}

/* -------------------------------------------------------------- les données */

/** Une rangée de huit nuances devient les deux octets que la console attend. */
function octetsDeLaRangee(rangee) {
  let bas = 0
  let haut = 0
  for (let x = 0; x < 8; x++) {
    const nuance = NUANCES_ECRITES[rangee[x]]
    bas = (bas << 1) | (nuance & 1)
    haut = (haut << 1) | ((nuance >> 1) & 1)
  }
  return [bas, haut]
}

function donnees(e) {
  /* La police d'abord, les dessins du programme ensuite, sans trou : la copie
     vers la mémoire vidéo se fait d'un seul bloc. */
  e.poser('Tuiles')
  e.ecrire(...octetsDesTuiles())
  for (const { rangees, cote } of e.dessins.values()) {
    if (cote === 16) {
      /* Les quatre quarts, dans l'ordre : haut-gauche, haut-droite,
         bas-gauche, bas-droite. */
      for (const [depart, moitie] of [[0, 0], [0, 8], [8, 0], [8, 8]]) {
        for (let y = depart; y < depart + 8; y++) {
          e.ecrire(...octetsDeLaRangee(rangees[y].slice(moitie, moitie + 8)))
        }
      }
    } else {
      for (const rangee of rangees) e.ecrire(...octetsDeLaRangee(rangee))
    }
  }

  /* La routine de copie des lutins, telle qu'elle sera recopiée en page
     rapide. Ses sauts sont relatifs : elle fonctionne où qu'elle soit. */
  e.poser('DonneesTransfert')
  e.ecrire(0x3e, (OAM_OMBRE >> 8) & 0xff) // ld a, page haute de la copie
  e.ecrire(0xe0, TRANSFERT) // ldh [$FF46], a — le matériel part
  e.ecrire(0x3e, 40) // ld a, 40 : le temps que la copie dure
  const attente = neuve('attendreTransfert')
  e.poser(attente)
  e.ecrire(0x3d) // dec a
  e.jrNZ(attente)
  e.ret()

  /* Les notes : deux octets chacune, dans l'ordre de DO2 à SI6. */
  e.poser('Notes')
  e.ecrire(...octetsDesNotes())

  for (const { etiquette, contenu } of e.textes) {
    e.poser(etiquette)
    for (const caractere of contenu) e.ecrire(numeroDe(caractere))
  }

  for (const { etiquette, valeurs } of e.tables) {
    e.poser(etiquette)
    if (valeurs.length) e.ecrire(...valeurs)
  }
}

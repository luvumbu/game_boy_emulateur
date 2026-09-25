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

import { numeroDe, octetsDesTuiles, NOMBRE_DE_TUILES } from './police.js'

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
      `ligne ${n.ligne} : « ${n.nom} » est déjà ${deja} — choisir un autre nom. ` +
        'Sans cela, « bouton(' + n.nom + ') » ne parlerait plus du bouton.',
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
    if (n.symbole.genre === 'zone' || n.symbole.genre === 'table') return n.symbole.taille
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
  'effacer',
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
      if (!symbole || symbole.genre === 'constante' || symbole.genre === 'table') return
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

/* ------------------------------------------------------------ la traduction */

/**
 * Compile un programme analysé, et rend les octets à poser dans la cartouche.
 */
export function compiler(programme, options = {}) {
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

  e.poser('AttendreVBlank')
  e.ldhVersA(ECRAN)
  e.andN(0x80) // bit 7 : l'écran est-il allumé ?
  e.ecrire(0xc8) // ret z — éteint, il n'y a pas de VBlank à attendre
  const a1 = neuve('vb')
  e.poser(a1)
  e.ldhVersA(LIGNE_ECRAN)
  e.cpN(144)
  e.jrNZ(a1)
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

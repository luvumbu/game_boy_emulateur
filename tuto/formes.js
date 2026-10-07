/*
 * LA SÉRIE 2 : LES FORMES GÉOMÉTRIQUES — une forme par leçon.
 *
 *   2.01 le rond, 2.02 le carré, 2.03 le triangle… jusqu'à 2.34 la sphère.
 *
 * Une série à part, après tout le parcours : elle ne fait que DESSINER. Chaque
 * leçon montre une seule forme, au milieu de l'écran, avec son nom dessous. Le
 * programme est le même d'une leçon à l'autre ; seuls changent le dessin et le
 * mot. Ce qu'on apprend, c'est la forme elle-même : ses côtés, ses coins, et
 * comment on l'écrit avec des « # » et des « - ».
 *
 * Les dessins sont ceux de la galerie « 🖼 Les modèles » (bibliotheque.js) :
 * un seul endroit où ils sont écrits, les mêmes des deux côtés.
 *
 * Elle n'emploie que texte(), sprite16() et Perso, déjà présentés dans le
 * parcours : aucun « #include » nouveau.
 */

import { FORMES } from '../bibliotheque.js'
import { CHAPITRE_DES_FORMES } from './parcours.js'
import { agrandirLeDessin, reduireLeDessin, nuanceDe } from '../editeur-tuiles.js'

/* Où se pose la forme : au milieu de l'écran, qui fait 160 × 144 pixels.
   (160 − 16) / 2 = 72 en largeur ; en hauteur, un peu au-dessus du milieu,
   pour laisser la place du nom dessous. */
const X = 72
const Y = 56
const LIGNE_DU_NOM = 10   // en cases de 8 pixels : 10 × 8 = 80, sous la forme (56 + 16 = 72)

/*
 * Ce que chaque leçon dit de SA forme. Le reste du texte est commun.
 *
 *   mot     : ce que l'écran écrit sous la forme (des majuscules, sans accent)
 *   titre   : le titre de la leçon
 *   forme   : ce qu'est la forme, en géométrie
 *   dessin  : comment son dessin est fait, rangée par rangée
 *   essai   : une chose à changer soi-même
 */
const CE_QU_ON_EN_DIT = {
  ROND: {
    mot: 'ROND',
    titre: 'Le rond',
    forme: '**Un rond (on dit aussi un cercle)**, c’est une forme sans côté et sans coin. Tous les points du bord sont **à la même distance du centre** : cette distance s’appelle le **rayon**. Deux rayons bout à bout, d’un bord à l’autre en passant par le centre, font le **diamètre**.',
    dessin: '**Sur une grille, un rond n’est jamais tout à fait rond** : les pixels sont des petits carrés. On l’approche en marches d’escalier. Regarde les rangées : en haut, 6 pixels de large ; puis 10, 12, 14 ; au milieu, les 16 pixels. Les marches sont plus courtes vers le haut et le bas, plus longues sur les côtés : c’est ce qui donne l’impression d’une courbe.',
    essai: '**Essaie :** dans `perso_ROND.cpp`, remplace tous les `-` par des `+` : le rond devient plein et plus foncé.',
  },
  CARRE: {
    mot: 'CARRE',
    titre: 'Le carré',
    forme: '**Un carré** a **4 côtés de même longueur** et **4 coins droits** (on dit 4 angles droits : comme le coin d’une feuille de papier).',
    dessin: '**Le carré est la forme la plus facile à écrire sur une grille** : le côté du haut est une rangée de `#`, celui du bas aussi ; entre les deux, chaque rangée commence et finit par un `#`. Ici le carré fait 14 pixels de côté : les rangées 1 à 14, les colonnes 1 à 14. La première et la dernière rangée restent vides (`.`), comme une petite marge.',
    essai: '**Essaie :** déplace le carré dans un coin de l’écran : `sprite16(0, 0, 0, CARRE);`.',
  },
  TRIANGLE: {
    mot: 'TRIANGLE',
    titre: 'Le triangle',
    forme: '**Un triangle** a **3 côtés** et **3 coins** (3 angles). Si on additionne ses trois angles, on trouve toujours **180 degrés**, quel que soit le triangle. Celui-ci a deux côtés de même longueur, à gauche et à droite : on dit qu’il est **isocèle**.',
    dessin: '**Le triangle s’élargit d’une rangée à l’autre** : la pointe en haut fait 2 pixels, puis toutes les deux rangées il gagne un pixel de chaque côté. Les côtés penchés sont faits de petites marches ; le côté du bas est une rangée pleine de `#`.',
    essai: '**Essaie :** retourne le triangle, pointe en bas : recopie les rangées de `perso_TRIANGLE.cpp` dans l’ordre inverse, de la dernière à la première.',
  },
  RECTANGLE: {
    mot: 'RECTANGLE',
    titre: 'Le rectangle',
    forme: '**Un rectangle** a **4 coins droits**, comme le carré, mais ses côtés ne sont pas tous égaux : les côtés **face à face** ont la même longueur. Ici il est **plus large que haut** : 14 pixels de large, 8 de haut. Un carré est un rectangle dont les quatre côtés sont égaux.',
    dessin: '**Il s’écrit comme le carré**, avec moins de rangées : une rangée de `#` en haut, une en bas, et entre les deux des rangées qui commencent et finissent par `#`. Les rangées vides (`.`) au-dessus et en dessous le centrent dans les 16 × 16.',
    essai: '**Essaie :** compte les rangées du rectangle, puis ajoute-en deux pour qu’il fasse 10 pixels de haut (en prenant deux rangées vides).',
  },
  LOSANGE: {
    mot: 'LOSANGE',
    titre: 'Le losange',
    forme: '**Un losange** a **4 côtés de même longueur**, comme le carré, mais ses coins ne sont pas droits. On le voit souvent **posé sur une pointe**. Ses deux **diagonales** (les traits qui relient les pointes opposées) se croisent au milieu, en faisant un angle droit.',
    dessin: '**Le losange grandit puis rapetisse** : un pixel de plus de chaque côté à chaque rangée jusqu’au milieu, puis un de moins jusqu’en bas. La moitié du bas est le reflet de la moitié du haut.',
    essai: '**Essaie :** pose un carré et un losange côte à côte, en recopiant le dessin du carré de la leçon 2.02 et en le montrant avec `sprite16(4, 100, 56, CARRE);`.',
  },
  OVALE: {
    mot: 'OVALE',
    titre: 'L’ovale',
    forme: '**Un ovale** est un rond **étiré** : plus large que haut (ou plus haut que large). En géométrie, l’ovale bien régulier s’appelle une **ellipse**. Comme le rond, il n’a ni côté ni coin.',
    dessin: '**Il occupe toute la largeur, mais pas toute la hauteur** : 16 pixels de large au milieu, 10 rangées de haut. Ses marches sont plus longues en haut et en bas (le bord y est presque plat) et très courtes sur les côtés (le bord y tourne vite).',
    essai: '**Essaie :** mets l’ovale debout : il faudrait l’écrire avec 16 rangées de haut et 10 pixels de large. Commence par la rangée du haut : `"......####......"`.',
  },
  TRAPEZE: {
    mot: 'TRAPEZE',
    titre: 'Le trapèze',
    forme: '**Un trapèze** a **4 côtés**, dont **deux sont parallèles** : ils vont dans la même direction sans jamais se toucher. Ici ce sont le côté du haut (8 pixels) et le côté du bas (14 pixels). Les deux autres côtés penchent.',
    dessin: '**Le haut est plus court que le bas** : la rangée du haut a 8 `#`, celle du bas 14. Entre les deux, chaque côté penché s’écarte d’un pixel toutes les deux rangées environ.',
    essai: '**Essaie :** retourne le trapèze (le grand côté en haut) en recopiant ses rangées dans l’ordre inverse.',
  },
  PARALLELOGRAMME: {
    mot: 'PARALLELOGRAMME',
    titre: 'Le parallélogramme',
    forme: '**Un parallélogramme** a **4 côtés**, et ses côtés **face à face sont parallèles et de même longueur**. On peut le voir comme un rectangle qu’on aurait poussé sur le côté : il **penche**.',
    dessin: '**Chaque rangée est décalée** d’un demi-pixel vers la gauche par rapport à celle du dessus : comme un demi-pixel n’existe pas, le décalage se fait d’un pixel toutes les deux rangées. Le haut et le bas sont deux rangées de `#` de même longueur, l’une décalée par rapport à l’autre.',
    essai: '**Essaie :** fais-le pencher de l’autre côté en écrivant chaque rangée à l’envers, de droite à gauche.',
  },
  PENTAGONE: {
    mot: 'PENTAGONE',
    titre: 'Le pentagone',
    forme: '**Un pentagone** a **5 côtés** et 5 coins (« penta » veut dire cinq, en grec). Quand ses 5 côtés sont égaux, il est **régulier** : c’est le cas ici, une pointe en haut.',
    dessin: '**La pointe en haut, deux côtés qui descendent en s’écartant, deux côtés qui se resserrent un peu, et la base en bas.** Les côtés penchés n’ont pas tous la même pente : c’est ce qui distingue un pentagone d’un losange ou d’un triangle.',
    essai: '**Essaie :** compte les côtés sur l’écran de la console : il y en a bien cinq.',
  },
  HEXAGONE: {
    mot: 'HEXAGONE',
    titre: 'L’hexagone',
    forme: '**Un hexagone** a **6 côtés** et 6 coins (« hexa » veut dire six). Les alvéoles des abeilles sont des hexagones : collés les uns aux autres, ils remplissent tout sans laisser de trou.',
    dessin: '**Un côté plat en haut, un en bas, et deux côtés penchés de chaque côté** qui se rejoignent au milieu de la hauteur. La moitié droite est le reflet de la moitié gauche.',
    essai: '**Essaie :** pose deux hexagones l’un à côté de l’autre, avec un deuxième `sprite16(4, 88, 56, HEXAGONE);`.',
  },
  OCTOGONE: {
    mot: 'OCTOGONE',
    titre: 'L’octogone',
    forme: '**Un octogone** a **8 côtés** et 8 coins (« octo » veut dire huit). Le panneau STOP est un octogone.',
    dessin: '**Un carré dont on aurait coupé les quatre coins** : un côté plat en haut, en bas, à gauche et à droite, et quatre côtés penchés entre eux. Plus une forme a de côtés, plus elle ressemble à un rond : compare avec le 2.01.',
    essai: '**Essaie :** remplis l’octogone avec des `#` à la place des `-` : il devient un panneau plein.',
  },
  DEMI_CERCLE: {
    mot: 'DEMI CERCLE',
    titre: 'Le demi-cercle',
    forme: '**Un demi-cercle** est **la moitié d’un rond**, coupé en passant par son centre. Il a un côté droit (le **diamètre**) et un bord courbe.',
    dessin: '**Le côté droit est la rangée pleine du haut** (16 `#`) ; en dessous, le bord courbe se resserre jusqu’en bas, comme la moitié basse du rond.',
    essai: '**Essaie :** fais-en un bol qui s’ouvre vers le bas, en recopiant les rangées dans l’ordre inverse.',
  },
  ANNEAU: {
    mot: 'ANNEAU',
    titre: 'L’anneau',
    forme: '**Un anneau** est un rond **percé au milieu** : deux cercles qui ont le même centre, un grand et un petit. La partie colorée est entre les deux.',
    dessin: '**Le trou est fait de `.`** : dans un personnage, le `.` est **transparent**. On voit donc le fond de l’écran au travers. Le bord du grand cercle et celui du petit sont des `#` ; entre les deux, des `-`.',
    essai: '**Essaie :** écris un mot dans le trou : `texte(9, 8, "O");` (la case 9, 8 tombe au milieu de l’anneau). Le fond se voit au travers, le mot aussi.',
  },
  CROIX: {
    mot: 'CROIX',
    titre: 'La croix',
    forme: '**Une croix** est faite de **deux barres qui se croisent** au milieu : une debout, une couchée. Son bord a **12 côtés** et 12 coins, tous droits.',
    dessin: '**La barre debout fait 6 pixels de large**, du haut en bas ; la barre couchée fait 6 pixels de haut, de gauche à droite. Là où elles se croisent, l’intérieur est commun : pas de trait au milieu.',
    essai: '**Essaie :** change les `-` de la barre du milieu en `+` pour voir où les deux barres se croisent.',
  },
  ETOILE_5: {
    mot: 'ETOILE',
    titre: 'L’étoile',
    forme: '**Une étoile à cinq branches** a **10 coins** : 5 pointes vers l’extérieur, et 5 creux entre elles. Son bord a donc 10 côtés.',
    dessin: '**Une pointe en haut, deux sur les côtés, deux en bas.** Le dessin s’appelle `ETOILE_5` (et pas `ETOILE`) parce qu’une tuile `ETOILE` existe déjà dans la galerie : deux dessins ne peuvent pas porter le même nom.',
    essai: '**Essaie :** fais tomber l’étoile : mets le `sprite16()` dans la boucle, avec une variable `y` qui grandit d’un pixel à chaque image, comme au 35.2.',
  },

  /* --- 2.16 à 2.20 : des formes simples qui manquaient --- */

  QUART_CERCLE: {
    mot: 'QUART DE CERCLE',
    titre: 'Le quart de cercle',
    forme: '**Un quart de cercle** est **un rond coupé en quatre** parts égales, comme une pizza. Il a **deux côtés droits** qui se rencontrent en faisant un coin droit (ce coin, c’est le centre du rond), et **un bord courbe**.',
    dessin: '**Le coin droit est en bas à gauche** : le côté gauche est une colonne de `#`, le côté du bas une rangée de `#`. Le bord courbe va du haut à gauche jusqu’en bas à droite. Sa longueur, en pixels, est le **rayon** du rond : ici 14.',
    essai: '**Essaie :** pose quatre quarts de cercle pour refaire un rond entier. Il faudrait les tourner : commence par recopier le dessin en écrivant chaque rangée à l’envers, pour obtenir le quart d’en bas à droite.',
  },
  TRIANGLE_RECTANGLE: {
    mot: 'TRIANGLE RECTANGLE',
    titre: 'Le triangle rectangle',
    forme: '**Un triangle rectangle** est un triangle qui a **un coin droit** (un angle droit). C’est **la moitié d’un carré** coupé en diagonale. Le grand côté, en face du coin droit, s’appelle l’**hypoténuse**.',
    dessin: '**Le coin droit est en bas à gauche.** Chaque rangée a un pixel de plus que celle du dessus : la diagonale (l’hypoténuse) descend d’un pixel vers la droite à chaque rangée. C’est la pente la plus simple à dessiner sur une grille : un pas à droite, un pas en bas.',
    essai: '**Essaie :** avec deux `sprite16()`, pose deux triangles rectangles l’un contre l’autre pour refaire un carré (le second dessiné à l’envers, rangées en ordre inverse et écrites de droite à gauche).',
  },
  TRIANGLE_EQUILATERAL: {
    mot: 'TRIANGLE EQUILATERAL',
    titre: 'Le triangle équilatéral',
    forme: '**Un triangle équilatéral** a **3 côtés de même longueur** et donc **3 angles égaux**, de 60 degrés chacun (60 + 60 + 60 = 180). Le triangle du 2.03 n’avait que deux côtés égaux.',
    dessin: '**Sa hauteur est un peu plus petite que sa base** : pour une base de 14 pixels, la hauteur fait environ 12 (14 × 0,87). À 16 pixels, la différence avec le 2.03 ne tient qu’en une ou deux rangées : le 2.03 est un peu plus haut, celui-ci un peu plus trapu.',
    essai: '**Essaie :** ouvre le 2.03 et compte ses rangées, puis compte celles-ci : la différence est là.',
  },
  CERF_VOLANT: {
    mot: 'CERF VOLANT',
    titre: 'Le cerf-volant',
    forme: '**Un cerf-volant** a **4 côtés**, égaux **deux par deux** : les deux côtés du haut sont courts, les deux du bas sont longs. Il ressemble à un losange, mais il est **plus long en bas qu’en haut**.',
    dessin: '**Le point le plus large est en haut**, à la rangée 5 : c’est là que les côtés courts rencontrent les côtés longs. Au-dessus, la forme s’élargit vite ; en dessous, elle se resserre lentement jusqu’à la pointe du bas.',
    essai: '**Essaie :** ajoute-lui une ficelle avec une deuxième forme : un trait de `#` dans un autre `Perso`, posé juste en dessous avec `sprite16(4, 72, 72, FICELLE);`.',
  },
  HEPTAGONE: {
    mot: 'HEPTAGONE',
    titre: 'L’heptagone',
    forme: '**Un heptagone** a **7 côtés** et 7 coins (« hepta » veut dire sept). Il manquait entre l’hexagone du 2.10 (6 côtés) et l’octogone du 2.11 (8 côtés).',
    dessin: '**Une pointe en haut, et une base plate en bas** : avec un nombre impair de côtés, le haut et le bas ne peuvent pas être pareils. Compare avec le pentagone (2.09, 5 côtés) : l’heptagone est plus rond.',
    essai: '**Essaie :** compte ses 7 côtés sur l’écran de la console, en partant de la pointe du haut.',
  },

  /* --- 2.21 à 2.25 : des formes courbes --- */

  CROISSANT: {
    mot: 'CROISSANT',
    titre: 'Le croissant',
    forme: '**Un croissant** est **un rond dont on a enlevé un autre rond**, décalé sur le côté. C’est la forme de la **lune** quand on n’en voit qu’une partie. Il a deux bords courbes qui se rejoignent en deux pointes.',
    dessin: '**Le bord de gauche est celui d’un grand rond**, le bord de droite celui d’un rond qui a mordu dedans. La moitié du bas est le reflet de la moitié du haut : on a écrit 8 rangées, puis on les a recopiées à l’envers.',
    essai: '**Essaie :** retourne la lune pour qu’elle s’ouvre vers la gauche, en écrivant chaque rangée de droite à gauche.',
  },
  GOUTTE: {
    mot: 'GOUTTE',
    titre: 'La goutte',
    forme: '**Une goutte** est **ronde en bas et pointue en haut** : un rond surmonté d’un triangle. C’est la forme d’une goutte d’eau qui tombe.',
    dessin: '**En haut, une pointe de 2 pixels** qui s’élargit comme un triangle ; **en bas, la moitié d’un rond**. Les deux morceaux se rejoignent sans trait au milieu : un seul contour fait le tour des deux.',
    essai: '**Essaie :** fais tomber la goutte : mets `sprite16()` dans la boucle avec une variable `y` qui grandit d’un pixel par image.',
  },
  GRAND_COEUR: {
    mot: 'COEUR',
    titre: 'Le cœur',
    forme: '**Un cœur** est fait de **deux bosses rondes** en haut et d’**une pointe** en bas. On peut le voir comme deux demi-ronds posés sur un triangle à l’envers.',
    dessin: '**Les deux bosses se touchent au milieu**, à la rangée 3, là où le contour fait un creux (`##`). Ensuite la forme se resserre d’un pixel de chaque côté à chaque rangée jusqu’à la pointe. Le dessin s’appelle `GRAND_COEUR` parce qu’une tuile `COEUR` de 8 × 8 existe déjà.',
    essai: '**Essaie :** fais battre le cœur : dans la boucle, une image sur trente, pose-le, puis cache-le avec `cacher16(0);` (il faut alors `#include <cacher16>`).',
  },
  SPIRALE: {
    mot: 'SPIRALE',
    titre: 'La spirale',
    forme: '**Une spirale** est **un trait qui tourne en s’approchant du centre** (ou en s’en éloignant, si on la lit dans l’autre sens). Celle-ci est **carrée** : elle tourne à angle droit.',
    dessin: '**Ce n’est pas une surface mais un trait** : il n’y a que des `#` et des `.`, pas de `-`. Le trait part en haut à gauche, va à droite, descend, revient à gauche, remonte… et chaque côté est **2 pixels plus court** que le précédent, pour laisser un couloir vide d’un pixel entre deux tours.',
    essai: '**Essaie :** suis le trait du doigt sur l’écran, depuis le coin en haut à gauche jusqu’au centre. Compte combien de fois il tourne.',
  },
  VAGUE: {
    mot: 'VAGUE',
    titre: 'La vague',
    forme: '**Une vague** est **une ligne qui monte et qui descend**, encore et encore. En mathématiques, cette forme s’appelle une **sinusoïde**. Ici, l’eau est sous la ligne.',
    dessin: '**Le haut de l’eau descend à gauche et monte à droite** : le creux de la vague est vers la colonne 4, la crête vers la colonne 12. Sous la ligne, tout est rempli de `-` jusqu’au fond, une rangée de `#`.',
    essai: '**Essaie :** pose trois vagues côte à côte pour faire une mer : `sprite16(4, 88, 56, VAGUE);` puis `sprite16(8, 104, 56, VAGUE);`.',
  },

  /* --- 2.26 à 2.30 : des formes faites de plusieurs morceaux --- */

  FLECHE: {
    mot: 'FLECHE',
    titre: 'La flèche',
    forme: '**Une flèche** est faite de **deux formes collées** : un **triangle** (la pointe) posé sur un **rectangle** (la tige). Elle montre une direction : ici, le haut.',
    dessin: '**La pointe occupe les rangées 1 à 7**, comme un triangle ; à la rangée 7, elle dépasse la tige de chaque côté. **La tige fait 6 pixels de large**, des rangées 8 à 14. Un seul contour fait le tour des deux morceaux.',
    essai: '**Essaie :** fais une flèche qui pointe vers le bas en recopiant les rangées dans l’ordre inverse.',
  },
  ETOILE_6: {
    mot: 'ETOILE 6 BRANCHES',
    titre: 'L’étoile à six branches',
    forme: '**Une étoile à six branches** est faite de **deux triangles équilatéraux** croisés : l’un pointe vers le haut, l’autre vers le bas. Elle a 6 pointes et 12 côtés.',
    dessin: '**Une pointe en haut, une en bas, et deux de chaque côté** (aux rangées 4 et 11). Au milieu, les deux triangles se recouvrent : l’intérieur est commun, sans trait.',
    essai: '**Essaie :** compare avec l’étoile à cinq branches du 2.15 : compte leurs pointes.',
  },
  CADRE: {
    mot: 'CADRE',
    titre: 'Le cadre',
    forme: '**Un cadre** est **un carré percé d’un carré plus petit**, au milieu. Comme l’anneau du 2.13, il a un bord dehors et un bord dedans.',
    dessin: '**Le trou est fait de `.`**, transparents : on voit le fond au travers. Le grand carré fait 14 pixels de côté, le trou 6. Entre les deux, une bande de `-` de 3 pixels.',
    essai: '**Essaie :** écris une lettre dans le cadre, comme dans un tableau : `texte(9, 8, "A");`.',
  },
  DAMIER: {
    mot: 'DAMIER',
    titre: 'Le damier',
    forme: '**Un damier** est fait de **petits carrés**, un foncé, un clair, un foncé… sur chaque rangée, et décalés d’une rangée à l’autre. C’est le plateau du jeu de dames et des échecs.',
    dessin: '**Chaque petit carré fait 4 × 4 pixels**, donc 4 carrés par rangée et 4 rangées de carrés : 16 carrés en tout. Il n’y a pas de contour : les carrés foncés (`#`) et clairs (`-`) se touchent directement.',
    essai: '**Essaie :** fais des carrés de 2 × 2 pixels : il faudra 8 carrés par rangée. Commence par la première rangée : `"##--##--##--##--"`.',
  },
  CROIX_X: {
    mot: 'X',
    titre: 'Le X',
    forme: '**Un X** est fait de **deux barres en diagonale** qui se croisent au milieu. C’est la croix du 2.14, **tournée d’un huitième de tour** (45 degrés).',
    dessin: '**Chaque barre avance d’un pixel vers la droite à chaque rangée**, comme l’hypoténuse du 2.17 : l’une descend vers la droite, l’autre vers la gauche. Le dessin s’appelle `CROIX_X` : un nom d’une seule lettre se confondrait trop facilement avec une variable.',
    essai: '**Essaie :** pose un X et la croix du 2.14 côte à côte pour voir qu’ils sont la même forme, tournée.',
  },

  /* --- 2.31 à 2.34 : des formes en relief, avec les quatre nuances --- */

  CUBE: {
    mot: 'CUBE',
    titre: 'Le cube',
    forme: '**Un cube** est une forme **en relief** (en trois dimensions) : 6 faces carrées, comme un dé. On n’en voit jamais que trois à la fois, ici **le devant, le dessus et le côté droit**.',
    dessin: '**Pour faire croire au relief, chaque face a sa nuance** : le dessus, éclairé, est clair (`-`) ; le devant est moyen (`+`) ; le côté droit, dans l’ombre, est le plus sombre (`#`). Le dessus et le côté sont des **parallélogrammes** (le 2.08) : c’est ce qui donne l’impression de profondeur.',
    essai: '**Essaie :** échange les nuances du dessus et du devant (les `-` et les `+`) : la lumière semble alors venir d’ailleurs.',
  },
  PYRAMIDE: {
    mot: 'PYRAMIDE',
    titre: 'La pyramide',
    forme: '**Une pyramide** est une forme en relief qui a une base et des faces en **triangle** qui se rejoignent en une pointe. Celles d’Égypte ont une base carrée : 4 faces en triangle.',
    dessin: '**Un triangle coupé par une arête** (un trait de `#`) un peu à droite du milieu : la face de gauche est claire (`-`), éclairée ; la face de droite moyenne (`+`), plus à l’ombre. C’est la différence de nuance qui fait voir deux faces.',
    essai: '**Essaie :** remplace les `+` par des `-` : sans la différence de nuance, la pyramide redevient un triangle plat.',
  },
  CYLINDRE: {
    mot: 'CYLINDRE',
    titre: 'Le cylindre',
    forme: '**Un cylindre** est une forme en relief comme une **boîte de conserve** : deux ronds (le dessus et le dessous) reliés par une paroi courbe.',
    dessin: '**Le dessus est un ovale** (le 2.06) clair (`-`) : un rond vu de biais paraît aplati. **La paroi est un rectangle** moyen (`+`). En bas, le bord est courbe lui aussi : c’est la moitié de l’ovale du dessous.',
    essai: '**Essaie :** fais un verre : remplace les `+` de la paroi par des `.`, transparents.',
  },
  SPHERE: {
    mot: 'SPHERE',
    titre: 'La sphère',
    forme: '**Une sphère** est **une boule** : le rond du 2.01, mais en relief. Tous les points de sa surface sont à la même distance du centre.',
    dessin: '**Le dessin est celui du 2.01**, rempli de `+` (moyen), avec **une tache claire (`-`) en haut à gauche** : c’est le reflet de la lumière. Le cerveau en conclut que la forme est ronde comme une balle, et pas plate comme un disque.',
    essai: '**Essaie :** déplace la tache claire en bas à droite : la lumière semble venir d’en bas.',
  },
}

/** Le fichier du dessin : « perso_ROND.cpp », juste le dessin. */
function fichierDuDessin(forme, dit) {
  return `// perso_${forme.nom}.cpp : ${dit.titre.toLowerCase()}, ${forme.nom} (16 × 16) — juste le dessin.
// « # » le plus sombre : le contour.   « + » moyen : l'ombre.   « - » clair : l'intérieur.
// « . » le plus clair : dans un personnage, c'est le TRANSPARENT (on voit le fond).

Perso ${forme.nom} = {
${forme.rangees.map((r) => `  "${r}",`).join('\n')}
};
`
}

/** Le programme, le même pour toutes les formes : seuls le dessin et le mot changent. */
function programme(forme, dit) {
  const colonne = Math.floor((20 - dit.mot.length) / 2)   // le mot, centré : l'écran fait 20 cases de large
  return `// ---- ${forme.numero} ${dit.titre} ----
// ${dit.titre} de 16 × 16 au milieu de l'écran, et son nom dessous.

#include <texte>                    // texte() : écrire un mot à l'écran
#include <sprite16>                 // sprite16() : poser un personnage de 16 × 16
#include <Perso>                    // Perso : un dessin de 16 × 16
#include "perso_${forme.nom}.cpp"${' '.repeat(Math.max(1, 15 - forme.nom.length))}// le dessin, dans son fichier

int main() {
  sprite16(0, ${X}, ${Y}, ${forme.nom});${' '.repeat(Math.max(1, 17 - forme.nom.length))}// les lutins 0 à 3, coin haut-gauche en (${X}, ${Y})
  texte(${colonne}, ${LIGNE_DU_NOM}, "${dit.mot}");${' '.repeat(Math.max(1, 18 - dit.mot.length - String(colonne).length))}// le nom, sous la forme

  while (true) {   // la boucle du jeu : rien ne bouge, on regarde
    image();
  }
}
`
}

/** Les explications communes, après celles de la forme. */
function commun(forme, dit, premiere) {
  const colonne = Math.floor((20 - dit.mot.length) / 2)
  if (premiere) {
    return [
      '**Cette série dessine des formes géométriques, une par leçon.** Le programme reste le même d’une leçon à l’autre : seuls changent le dessin et le mot. Tu peux donc te concentrer sur la forme.',
      '**Le dessin est dans son propre fichier**, `perso_ROND.cpp` (l’onglet à côté de `principal.cpp`). Il fait **16 × 16 pixels** : 16 rangées de 16 signes. `#` est le plus sombre (le contour), `-` est clair (l’intérieur), `.` est le **transparent** : dans un personnage, on voit le fond de l’écran au travers.',
      '**Pourquoi 16 × 16 et pas 8 × 8 ?** Dans une tuile de 8 pixels, un rond aurait 4 pixels de rayon : il ressemblerait à un carré aux coins cassés. Avec 16 pixels, la courbe se voit.',
      '**Les trois lignes `#include`** : `<texte>` pour écrire le nom, `<sprite16>` pour poser un dessin de 16 × 16, `<Perso>` pour avoir le droit d’écrire un `Perso`. Puis `#include "perso_ROND.cpp"` verse le dessin dans le programme (des guillemets, parce que c’est un fichier du projet, pas une fonction de la console).',
      `**\`sprite16(0, ${X}, ${Y}, ROND)\`** pose le dessin avec les lutins 0, 1, 2 et 3 (un personnage de 16 × 16 en prend quatre). ${X} et ${Y} sont la place du **coin en haut à gauche**, en pixels. L’écran fait 160 pixels de large : (160 − 16) / 2 = ${X}, c’est le milieu.`,
      `**\`texte(${colonne}, ${LIGNE_DU_NOM}, "ROND")\`** écrit le nom sous la forme. Ici on compte en **cases de 8 pixels** : la ligne ${LIGNE_DU_NOM} est à ${LIGNE_DU_NOM * 8} pixels du haut, juste sous la forme (qui s’arrête à ${Y + 16}).`,
      '**La boucle du jeu** ne fait qu’attendre l’image suivante : rien ne bouge, on regarde.',
    ]
  }
  return [
    `**Le programme est celui du 2.01** : seuls changent le fichier du dessin (\`perso_${forme.nom}.cpp\`), le nom \`${forme.nom}\` dans \`sprite16()\`, et le mot écrit dessous. \`#\` est le plus sombre, \`+\` moyen, \`-\` clair, \`.\` le transparent.`,
  ]
}

/** Les leçons de la série : une par forme, dans l'ordre de la galerie. */
const LECONS_UNE_PAR_FORME = FORMES.map((forme, k) => {
  const dit = CE_QU_ON_EN_DIT[forme.nom]
  if (!dit) throw new Error(`tuto/formes.js : rien n'est dit de la forme ${forme.nom}`)
  const colonne = Math.floor((20 - dit.mot.length) / 2)
  return {
    titre: dit.titre,
    numero: forme.numero,
    serie: 2,
    difficulte: CHAPITRE_DES_FORMES,
    niveau: 3,
    provenance: 'formes',
    ...(k > 0 ? { suite: true } : {}),
    idee: `${forme.numero} : ${dit.titre.toLowerCase()} — ${forme.quoi}. Un dessin de 16 × 16 posé au milieu de l’écran avec sprite16(), son nom dessous.`,
    texte: [
      dit.forme,
      dit.dessin,
      ...commun(forme, dit, k === 0),
      dit.essai,
    ],
    fichiers: { [`perso_${forme.nom}.cpp`]: fichierDuDessin(forme, dit) },
    code: programme(forme, dit),
    aVoir: `${dit.titre} au milieu de l’écran, et ${dit.mot} écrit dessous.`,
    controle: (c) => {
      c.avancer(10)
      return [
        [`la forme est posée au milieu, en (${X}, ${Y})`, c.lutin(0).x === X && c.lutin(0).y === Y, ` (${c.lutin(0).x}, ${c.lutin(0).y})`],
        ['ses quatre lutins font un carré de 16', c.lutin(1).x === X + 8 && c.lutin(2).y === Y + 8 && c.lutin(3).x === X + 8 && c.lutin(3).y === Y + 8],
        [`son nom est écrit dessous : ${dit.mot}`, c.mot(colonne, LIGNE_DU_NOM, dit.mot.length) === dit.mot],
      ]
    },
  }
})

/*
 * 2.35 à 2.40 : LES TAILLES. Le même rond en 8, 16 et 32, et le zoom d'un
 * dessin (les boutons « 🔍 ×2 » et « 🔍 ÷2 » de l'atelier des tuiles).
 *
 * Une chose nouvelle par leçon : le petit rond, le grand rond, les trois
 * ensemble, puis grossir, puis réduire — et enfin spriteTaille() : un seul
 * dessin, posé à la taille qu'on veut, agrandi par le compilateur.
 */
const ROND = FORMES.find((f) => f.nom === 'ROND')
const ROND_GROSSI = agrandirLeDessin(ROND.rangees)                  // 16 → 32, chaque pixel doublé
const ROND_REDUIT = reduireLeDessin(ROND.rangees, nuanceDe, '.-+#')  // 16 → 8, le plus foncé de chaque carré de 2 × 2

/** Le fichier d'un dessin : « Tuile » pour 8 × 8, « Perso » pour 16 et 32. */
const fichierDe = (nom, rangees, quoi) => `// ${nom} : ${quoi} (${rangees.length} × ${rangees.length}) — juste le dessin.
// « # » le plus sombre : le contour.   « - » clair : l'intérieur.   « . » transparent.

${rangees.length === 8 ? 'Tuile' : 'Perso'} ${nom} = {
${rangees.map((r) => `  "${r}",`).join('\n')}
};
`

const LECONS_DES_TAILLES = [
  {
    numero: '2.35',
    titre: 'Le petit rond : 8 × 8',
    idee: 'Le même rond, dans une tuile de 8 × 8 : Tuile ROND_8, posée avec sprite(). Quatre fois moins de pixels.',
    texte: [
      '**La console ne sait pas agrandir ni réduire un dessin.** Chaque pixel du dessin donne exactement un pixel à l’écran. Pour un rond plus petit, il faut **un autre dessin**, avec moins de pixels. C’est ce que montrent les leçons 2.35 à 2.39.',
      '**Ici, le rond fait 8 × 8 pixels** : c’est une **tuile**, la plus petite taille. Il s’écrit `Tuile ROND_8 = {…}` avec 8 rangées de 8 signes, dans le fichier `tuile_ROND_8.cpp`. Le `_8` dans le nom dit sa taille.',
      '**Il se pose avec `sprite()`**, qui place un seul lutin de 8 × 8 au pixel près : `sprite(0, 76, 60, ROND_8)`. 76 = (160 − 8) / 2 : le milieu de l’écran. Il faut `#include <sprite>` et `#include <Tuile>`.',
      '**Compare avec le 2.01** : le rond de 16 × 16 avait une vraie courbe. En 8 × 8, il n’a plus que deux marches de chaque côté : on le reconnaît, mais c’est presque un octogone.',
      '**Dans la galerie « 🖼 Les modèles »**, le bouton **8 × 8** en haut donne toutes les formes à cette taille : ROND_8, CARRE_8, et les autres.',
      '**Essaie :** dans `tuile_ROND_8.cpp`, change un `-` en `#` et regarde le pixel changer sur l’écran : en 8 × 8, chaque pixel compte.',
    ],
    fichiers: { 'tuile_ROND_8.cpp': fichierDe('ROND_8', ROND.tailles[8], 'le rond en petit') },
    code: `// ---- 2.35 Le petit rond : 8 × 8 ----
// Le rond dans une tuile de 8 × 8, au milieu de l'écran.

#include <texte>             // texte() : écrire un mot
#include <sprite>            // sprite() : poser un lutin de 8 × 8
#include <Tuile>             // Tuile : un dessin de 8 × 8
#include "tuile_ROND_8.cpp"  // le petit rond, dans son fichier

int main() {
  sprite(0, 76, 60, ROND_8);   // le lutin 0, en (76, 60)
  texte(5, 10, "PETIT ROND");  // le nom, sous la forme

  while (true) {
    image();
  }
}
`,
    aVoir: 'Un petit rond de 8 × 8 au milieu de l’écran, et PETIT ROND dessous.',
    controle: (c) => {
      c.avancer(10)
      return [
        ['le petit rond est posé en (76, 60)', c.lutin(0).x === 76 && c.lutin(0).y === 60, ` (${c.lutin(0).x}, ${c.lutin(0).y})`],
        ['PETIT ROND est écrit dessous', c.mot(5, 10, 10) === 'PETIT ROND'],
      ]
    },
  },
  {
    numero: '2.36',
    titre: 'Le grand rond : 32 × 32',
    idee: 'Le même rond en 32 × 32 : Perso ROND_32, posé avec sprite32(). Quatre fois plus de pixels, et une courbe bien plus douce.',
    texte: [
      '**Le grand rond fait 32 × 32 pixels** : 32 rangées de 32 signes, dans `perso_ROND_32.cpp`. Il s’écrit `Perso ROND_32 = {…}`, comme un personnage de 16 × 16 : c’est le **nombre de rangées** qui dit au compilateur sa taille.',
      '**Il n’est pas grossi : il est redessiné.** Le contour a toujours un seul pixel d’épaisseur, et la courbe a deux fois plus de marches, deux fois plus petites. C’est pour ça qu’il paraît bien plus rond que celui du 2.01.',
      '**Il se pose avec `sprite32()`** : `sprite32(0, 64, 40, ROND_32)` prend **16 lutins** (les numéros 0 à 15), en carré de 4 × 4. 64 = (160 − 32) / 2, le milieu. Il faut `#include <sprite32>`.',
      '**Un grand dessin coûte cher** : 16 lutins sur les 40 de la console, et 16 tuiles. Un écran peut en montrer deux, pas dix.',
      '**Dans la galerie**, le bouton **32 × 32** donne toutes les formes à cette taille : ROND_32, CARRE_32…',
      '**Essaie :** fais-le descendre, avec une variable `y` qui grandit d’un pixel par image, comme au 35.4.',
    ],
    fichiers: { 'perso_ROND_32.cpp': fichierDe('ROND_32', ROND.tailles[32], 'le rond en grand') },
    code: `// ---- 2.36 Le grand rond : 32 × 32 ----
// Le rond en 32 × 32, au milieu de l'écran.

#include <texte>              // texte() : écrire un mot
#include <sprite32>           // sprite32() : poser un dessin de 32 × 32
#include <Perso>              // Perso : un dessin de 16 × 16 ou de 32 × 32
#include "perso_ROND_32.cpp"  // le grand rond, dans son fichier

int main() {
  sprite32(0, 64, 40, ROND_32);   // les lutins 0 à 15, coin haut-gauche en (64, 40)
  texte(5, 11, "GRAND ROND");     // le nom, sous la forme (qui s'arrête à 72)

  while (true) {
    image();
  }
}
`,
    aVoir: 'Un grand rond de 32 × 32 au milieu de l’écran, et GRAND ROND dessous.',
    controle: (c) => {
      c.avancer(10)
      return [
        ['le grand rond est posé en (64, 40)', c.lutin(0).x === 64 && c.lutin(0).y === 40, ` (${c.lutin(0).x}, ${c.lutin(0).y})`],
        ['ses 16 lutins font un carré de 32', c.lutin(15).x === 88 && c.lutin(15).y === 64, ` (lutin 15 en ${c.lutin(15).x}, ${c.lutin(15).y})`],
        ['GRAND ROND est écrit dessous', c.mot(5, 11, 10) === 'GRAND ROND'],
      ]
    },
  },
  {
    numero: '2.37',
    titre: 'Les trois tailles côte à côte',
    idee: 'ROND_8, ROND et ROND_32 sur le même écran : trois dessins, trois fonctions, trois tailles.',
    texte: [
      '**Les trois ronds ensemble**, du plus petit au plus grand : `ROND_8` avec `sprite()`, `ROND` avec `sprite16()`, `ROND_32` avec `sprite32()`. Ce sont **trois dessins différents**, chacun dans son fichier.',
      '**Les lutins ne doivent pas se chevaucher** : le petit prend le lutin 0 ; le moyen les lutins 1 à 4 (il en faut 4) ; le grand les lutins 5 à 20 (il en faut 16). C’est pourquoi on écrit `sprite16(1, …)` et `sprite32(5, …)`.',
      '**La console a une limite** : 10 lutins au plus sur une même ligne de l’écran. Ici, sur les lignes où les trois ronds se trouvent, il y en a 1 + 2 + 4 = 7. Ça passe.',
      '**Le nombre sous chaque rond** dit son côté en pixels : 8, 16, 32. Chaque taille a **deux fois** le côté de la précédente, et **quatre fois** ses pixels (8 × 8 = 64, 16 × 16 = 256, 32 × 32 = 1 024).',
      '**Essaie :** échange les places du petit et du grand rond.',
    ],
    fichiers: {
      'tuile_ROND_8.cpp': fichierDe('ROND_8', ROND.tailles[8], 'le rond en petit'),
      'perso_ROND.cpp': fichierDe('ROND', ROND.rangees, 'le rond'),
      'perso_ROND_32.cpp': fichierDe('ROND_32', ROND.tailles[32], 'le rond en grand'),
    },
    code: `// ---- 2.37 Les trois tailles côte à côte ----
// Le même rond en 8 × 8, 16 × 16 et 32 × 32.

#include <texte>              // texte() : écrire un mot
#include <sprite>             // sprite()   : un dessin de 8 × 8
#include <sprite16>           // sprite16() : un dessin de 16 × 16
#include <sprite32>           // sprite32() : un dessin de 32 × 32
#include <Tuile>              // Tuile : 8 × 8
#include <Perso>              // Perso : 16 × 16 ou 32 × 32
#include "tuile_ROND_8.cpp"   // le petit rond
#include "perso_ROND.cpp"     // le rond du 2.01
#include "perso_ROND_32.cpp"  // le grand rond

int main() {
  sprite(0, 24, 60, ROND_8);       // le lutin 0
  sprite16(1, 56, 56, ROND);       // les lutins 1 à 4
  sprite32(5, 104, 48, ROND_32);   // les lutins 5 à 20
  texte(3, 11, "8");               // sous le petit
  texte(7, 11, "16");              // sous le moyen
  texte(15, 11, "32");             // sous le grand

  while (true) {
    image();
  }
}
`,
    aVoir: 'Trois ronds de plus en plus grands, et 8, 16, 32 écrits dessous.',
    controle: (c) => {
      c.avancer(10)
      return [
        ['le petit rond en (24, 60)', c.lutin(0).x === 24 && c.lutin(0).y === 60],
        ['le rond du 2.01 en (56, 56)', c.lutin(1).x === 56 && c.lutin(1).y === 56],
        ['le grand rond en (104, 48)', c.lutin(5).x === 104 && c.lutin(5).y === 48],
        ['les trois tailles sont écrites', c.mot(3, 11, 1) === '8' && c.mot(7, 11, 2) === '16' && c.mot(15, 11, 2) === '32'],
      ]
    },
  },
  {
    numero: '2.38',
    titre: 'Grossir un dessin : ×2',
    idee: 'Le bouton « 🔍 ×2 » fait d’un dessin de 16 une copie de 32, en doublant chaque pixel. À côté, le rond redessiné en 32 : la différence se voit.',
    texte: [
      '**Le zoom d’un dessin.** Dans « ▦ Les tuiles », le bouton **🔍 ×2** fait une **copie** du dessin ouvert, deux fois plus grande : un dessin de 8 devient un dessin de 16, un dessin de 16 devient un dessin de 32. L’original ne change pas.',
      '**Comment il grossit :** chaque pixel devient un **carré de 2 × 2** pixels, de la même nuance. Chaque rangée est écrite deux fois, et chaque signe dans la rangée aussi : `"#-"` devient `"##--"`, deux fois.',
      '**À gauche, `ROND_GRAND`** : le rond du 2.01, grossi par ×2. **À droite, `ROND_32`** : le rond redessiné en 32 × 32 (le 2.36). Ils ont la même taille, mais le grossi a des **marches deux fois plus grosses** et un contour de 2 pixels : il n’a pas plus de détails qu’avant, juste de plus gros pixels.',
      '**Quand se servir de ×2 ?** Pour agrandir **ton propre dessin** sans tout recommencer : la copie grossie est un bon point de départ, qu’on affine ensuite pixel par pixel. Pour les formes de la galerie, prends plutôt la taille 32 × 32 : elles y sont redessinées.',
      '**Essaie :** ouvre `perso_ROND_GRAND.cpp` et arrondis ses marches à la main, en t’aidant du rond de droite.',
    ],
    fichiers: {
      'perso_ROND_GRAND.cpp': fichierDe('ROND_GRAND', ROND_GROSSI, 'le rond du 2.01 grossi par ×2'),
      'perso_ROND_32.cpp': fichierDe('ROND_32', ROND.tailles[32], 'le rond redessiné en grand'),
    },
    code: `// ---- 2.38 Grossir un dessin : ×2 ----
// À gauche le rond grossi (chaque pixel doublé), à droite le rond redessiné.

#include <texte>                 // texte() : écrire un mot
#include <sprite32>              // sprite32() : un dessin de 32 × 32
#include <Perso>                 // Perso : 16 × 16 ou 32 × 32
#include "perso_ROND_GRAND.cpp"  // le rond du 2.01, grossi par ×2
#include "perso_ROND_32.cpp"     // le rond redessiné en 32 × 32

int main() {
  sprite32(0, 24, 40, ROND_GRAND);   // les lutins 0 à 15
  sprite32(16, 104, 40, ROND_32);    // les lutins 16 à 31
  texte(2, 11, "GROSSI");            // sous celui de gauche
  texte(11, 11, "REDESSINE");        // sous celui de droite

  while (true) {
    image();
  }
}
`,
    aVoir: 'Deux grands ronds : à gauche aux grosses marches (GROSSI), à droite plus lisse (REDESSINE).',
    controle: (c) => {
      c.avancer(10)
      return [
        ['le rond grossi en (24, 40)', c.lutin(0).x === 24 && c.lutin(0).y === 40],
        ['le rond redessiné en (104, 40)', c.lutin(16).x === 104 && c.lutin(16).y === 40],
        ['les deux mots sont écrits', c.mot(2, 11, 6) === 'GROSSI' && c.mot(11, 11, 9) === 'REDESSINE'],
      ]
    },
  },
  {
    numero: '2.39',
    titre: 'Réduire un dessin : ÷2',
    idee: 'Le bouton « 🔍 ÷2 » fait d’un dessin de 16 une copie de 8 : chaque carré de 2 × 2 devient un pixel. Des détails se perdent.',
    texte: [
      '**Le bouton 🔍 ÷2** fait l’inverse de ×2 : une copie **deux fois plus petite**. Un dessin de 32 devient un dessin de 16, un dessin de 16 devient un dessin de 8.',
      '**Comment il réduit :** le dessin est découpé en **carrés de 2 × 2** pixels, et chaque carré devient **un seul pixel**. Lequel des quatre garder ? Le **plus foncé** : ainsi un contour d’un pixel d’épaisseur ne disparaît pas.',
      '**Quatre pixels n’en font plus qu’un** : des détails se perdent forcément. À gauche, `ROND_PETIT`, le rond du 2.01 réduit ; à droite, `ROND_8`, le rond redessiné en 8 × 8 (le 2.35). Compare-les : le réduit est plus épais, plus foncé.',
      '**Pourquoi la vraie Game Boy n’a pas de zoom :** elle n’a pas le temps de calculer de nouveaux pixels pendant qu’elle dessine l’écran, 60 fois par seconde. Les jeux de l’époque dessinaient donc chaque taille à la main — exactement ce que fait la galerie avec ses trois tailles.',
      '**Essaie :** ouvre `tuile_ROND_PETIT.cpp` et éclaircis-le en changeant quelques `#` en `-`, pour qu’il ressemble au rond de droite.',
    ],
    fichiers: {
      'tuile_ROND_PETIT.cpp': fichierDe('ROND_PETIT', ROND_REDUIT, 'le rond du 2.01 réduit par ÷2'),
      'tuile_ROND_8.cpp': fichierDe('ROND_8', ROND.tailles[8], 'le rond redessiné en petit'),
    },
    code: `// ---- 2.39 Réduire un dessin : ÷2 ----
// À gauche le rond réduit (chaque carré de 2 × 2 devient un pixel), à droite le rond redessiné.

#include <texte>                 // texte() : écrire un mot
#include <sprite>                // sprite() : un dessin de 8 × 8
#include <Tuile>                 // Tuile : 8 × 8
#include "tuile_ROND_PETIT.cpp"  // le rond du 2.01, réduit par ÷2
#include "tuile_ROND_8.cpp"      // le rond redessiné en 8 × 8

int main() {
  sprite(0, 36, 60, ROND_PETIT);   // le lutin 0
  sprite(1, 108, 60, ROND_8);      // le lutin 1
  texte(2, 10, "REDUIT");          // sous celui de gauche
  texte(10, 10, "REDESSINE");      // sous celui de droite

  while (true) {
    image();
  }
}
`,
    aVoir: 'Deux petits ronds : à gauche plus foncé (REDUIT), à droite plus fin (REDESSINE).',
    controle: (c) => {
      c.avancer(10)
      return [
        ['le rond réduit en (36, 60)', c.lutin(0).x === 36 && c.lutin(0).y === 60],
        ['le rond redessiné en (108, 60)', c.lutin(1).x === 108 && c.lutin(1).y === 60],
        ['les deux mots sont écrits', c.mot(2, 10, 6) === 'REDUIT' && c.mot(10, 10, 9) === 'REDESSINE'],
      ]
    },
  },
  {
    numero: '2.40',
    titre: 'La fonction spriteTaille() — dessiner une fois, choisir la taille',
    idee: '#include <spriteTaille> : spriteTaille(numero, x, y, DESSIN, taille) pose un dessin à la taille qu’on veut. Le dessin n’est écrit qu’UNE fois, à sa taille standard ; c’est le compilateur qui l’agrandit.',
    texte: [
      '**Dessiner une seule fois.** Le rond est écrit **une seule fois**, dans `tuile_ROND.cpp`, à sa taille standard : 8 × 8. Il n’y a pas de « grand rond » dans le programme. C’est dans l’appel qu’on dit à quelle taille le montrer.',
      '**La ligne à écrire : `#include <spriteTaille>`.**',
      '**Ses arguments :** `spriteTaille(numero, x, y, DESSIN, taille)`. `numero` est le **premier** lutin employé ; `x` et `y` le coin en haut à gauche, en pixels ; `DESSIN` le nom d’une `Tuile` ou d’un `Perso` du programme ; `taille` combien de fois plus grand : **1** sa taille, **2** deux fois, **3** trois fois…',
      '**Ici :** `spriteTaille(0, 36, 60, ROND, 1)` pose le rond tel qu’il est dessiné (8 × 8) ; `spriteTaille(1, 96, 44, ROND, 3)` pose **le même rond** trois fois plus grand : 24 × 24.',
      '**Comment le compilateur agrandit.** La console ne sait pas agrandir pendant que le jeu tourne. Le compilateur redessine donc la forme **avant**, à la compilation : il fait le tour du dessin, garde les vrais coins pointus, arrondit les marches d’escalier, puis redessine à la nouvelle taille avec un contour d’un pixel. Le grand rond est **rond**, pas fait de gros pixels.',
      '**Avec combien de lutins ?** La forme agrandie est coupée en carrés de 8 × 8 ; chaque carré qui n’est pas vide prend **un lutin**, à partir de `numero`. En taille 3, le rond fait 24 × 24 : 3 × 3 = 9 lutins, les numéros 1 à 9. Le premier rond a pris le lutin 0 : les deux ne se chevauchent pas.',
      '**Pas de limite de taille.** La console n’a que 40 lutins, et n’en montre que 10 sur une même ligne. Tant que la forme y tient, elle est faite de lutins : elle passe par-dessus le décor et peut bouger. **Au-delà, elle est dessinée dans le fond de l’écran**, case par case : là, plus de limite. Taille 12, 18, 40, 100… : la forme est toujours affichée. Plus grande que l’écran, on en voit la partie qui tombe dedans.',
      '**Dans le fond, la place s’écrit en clair** (`spriteTaille(0, -80, -88, ROND, 40)`, par exemple, pour centrer un rond de 320 pixels) : le compilateur doit savoir quelle partie tombe dans l’écran. Elle peut être négative, c’est-à-dire commencer hors de l’écran. Le `numero` n’y sert pas.',
      '**La taille s’écrit en clair** — `3`, pas une variable — : c’est le compilateur qui dessine, avant que le jeu ne tourne.',
      '**Si tu modifies le petit rond**, dans `tuile_ROND.cpp`, toutes les tailles changent ensemble à la compilation suivante : il n’y a qu’un dessin.',
      '**La même logique dans les autres fonctions :** la taille peut aussi s’écrire en dernier argument de `sprite(0, 36, 60, ROND, 4)`, `sprite16(0, 40, 40, HEROS, 3)`, `sprite32(0, 0, 0, BOSS, 2)`, `spriteDerriere(0, x, 72, ROND, 4)` (derrière le décor) et `poser(2, 3, ROND, 5)` (toujours dans le fond, colonne et ligne en clair). Pour les trois `sprite`, seul un nombre de **2 ou plus** est une taille : `0`, `1` et `MIROIR_X`, `DERRIERE`… gardent leur ancien sens, celui des options.',
      '**Essaie :** change le `3` en `2`, puis en `4`. Puis remplace la seconde ligne par `spriteTaille(1, 8, 0, ROND, 18);` : un rond de 144 pixels, toute la hauteur de l’écran. Enfin, dessine ta propre forme dans `tuile_ROND.cpp` (une goutte, une maison) et regarde-la à toutes les tailles.',
    ],
    fichiers: {
      'tuile_ROND.cpp': fichierDe('ROND', ROND.tailles[8], 'le rond, dessiné UNE fois, à sa taille standard'),
    },
    code: `// ---- #include <spriteTaille> : dessiner une fois, choisir la taille ----
// UN seul dessin, ROND (8 × 8). À gauche en taille 1, à droite en taille 3 (24 × 24).

#include <texte>          // texte() : écrire un mot
#include <spriteTaille>   // spriteTaille() : un dessin à la taille qu'on veut
#include <Tuile>          // Tuile : un dessin de 8 × 8
#include "tuile_ROND.cpp" // le rond, dessiné une seule fois

int main() {
  spriteTaille(0, 36, 60, ROND, 1);   // taille 1 : 8 × 8, le lutin 0
  spriteTaille(1, 96, 44, ROND, 3);   // taille 3 : 24 × 24, les lutins 1 à 9
  texte(1, 10, "TAILLE 1");           // sous celui de gauche
  texte(10, 10, "TAILLE 3");          // sous celui de droite

  while (true) {
    image();
  }
}
`,
    aVoir: 'Le même rond deux fois : petit à gauche (TAILLE 1), trois fois plus grand et bien rond à droite (TAILLE 3).',
    controle: (c) => {
      c.avancer(10)
      return [
        ['taille 1 : le rond en (36, 60), un seul lutin', c.lutin(0).x === 36 && c.lutin(0).y === 60],
        ['taille 3 : neuf lutins en carré de 24, à partir de (96, 44)',
          c.lutin(1).x === 96 && c.lutin(1).y === 44 && c.lutin(9).x === 112 && c.lutin(9).y === 60, ` (lutin 9 en ${c.lutin(9).x}, ${c.lutin(9).y})`],
        ['les deux tailles sont écrites', c.mot(1, 10, 8) === 'TAILLE 1' && c.mot(10, 10, 8) === 'TAILLE 3'],
      ]
    },
  },
].map((l) => ({ ...l, serie: 2, difficulte: CHAPITRE_DES_FORMES, niveau: 3, provenance: 'formes', suite: true }))

/** Toute la série 2 : une leçon par forme (2.01 à 2.34), puis les tailles (2.35 à 2.40). */
export const LECONS_DES_FORMES = [...LECONS_UNE_PAR_FORME, ...LECONS_DES_TAILLES]

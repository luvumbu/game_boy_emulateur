/**
 * POUR QUELQU’UN QUI N’A JAMAIS PROGRAMMÉ — ce que tous les documents partagent.
 *
 * Les livrets, le cours complet et la documentation technique supposaient
 * qu’on savait déjà ce qu’est une variable, une boucle ou un compilateur. Ce
 * module donne à chacun de quoi partir de ZÉRO :
 *
 *   BASES                 « Les bases » : vingt pages simples, avec des
 *                         comparaisons de tous les jours, avant la première leçon
 *   LEXIQUE               chaque mot technique, expliqué en une ou deux phrases
 *   motsDuCode(code)      les mots du lexique qu’un programme emploie
 *   expliquerLigne(l)     une ligne de code, dite en français
 *   encadreDebutant(…)    pour une leçon : « Les mots de cette leçon » et
 *                         « Le programme, ligne par ligne », en HTML
 *
 * Rien n’est recopié à la main dans chaque leçon : les encadrés sont FABRIQUÉS
 * à partir du vrai programme de la leçon. Si une leçon change, son explication
 * change avec elle.
 */

import { FONCTIONS } from '../aide-fonctions.js'
import { BIBLIOTHEQUES } from '../compilateur/inclusion.js'
import { enrichir, echapper } from '../tuto/enrichir.js'

/* ===================================================================== LES BASES */

/*
 * Chaque partie : un titre, puis des paragraphes (le **gras** et le `code`
 * sont mis en forme par enrichir). Un paragraphe qui commence par « CODE: »
 * est un petit programme à montrer tel quel.
 */
export const BASES = [
  {
    titre: 'Avant tout : ce document est fait pour toi',
    texte: [
      '**Tu n’as jamais programmé ? C’est exactement pour toi.** Ce document ne suppose rien : chaque mot nouveau est expliqué la première fois qu’il apparaît, et il est aussi dans le **lexique**, à la fin, rangé par ordre alphabétique.',
      '**Comment le lire.** Lis « Les bases » dans l’ordre, une partie à la fois, sans te presser. Ensuite, chaque leçon a deux encadrés pour t’aider : **« Les mots de cette leçon »** (les mots techniques du programme, expliqués) et **« Le programme, ligne par ligne »** (chaque ligne du programme dite en français).',
      '**Le plus important : essayer.** On n’apprend pas à programmer en lisant seulement, comme on n’apprend pas le vélo dans un livre. Ouvre l’atelier, tape le programme de la leçon, appuie sur « Compiler et lancer », regarde ce qui se passe, puis **change un nombre** et relance. Se tromper fait partie du jeu : la console ne casse jamais.',
    ],
  },
  {
    titre: 'Un ordinateur suit des instructions, une à une',
    texte: [
      '**Un ordinateur ne réfléchit pas : il obéit.** Il fait exactement ce qu’on lui dit, dans l’ordre, très vite — des millions de fois par seconde — mais sans jamais deviner ce qu’on voulait dire.',
      '**Comme une recette de cuisine.** « Casser deux œufs. Ajouter le sucre. Mélanger. » Chaque phrase est une **instruction** ; on les fait l’une après l’autre, de la première à la dernière. Un programme, c’est pareil : une liste d’instructions, écrites dans une langue que la machine comprend.',
      '**Il faut tout dire.** Une personne comprend « mets un peu de sel ». Un ordinateur, non : il faut dire combien, où, et quand. C’est pour ça que le code paraît précis et un peu raide : il ne laisse rien au hasard.',
    ],
  },
  {
    titre: 'La Game Boy : une petite console de 1989',
    texte: [
      '**La Game Boy** est une console de jeux portable, sortie en 1989. On y glissait une **cartouche** — un petit boîtier de plastique qui contient un jeu. La **Game Boy Color** (1998) est la même console, avec des couleurs.',
      '**Son écran fait 160 pixels de large et 144 de haut.** Un **pixel** est un tout petit carré de couleur : l’image entière est faite de 160 × 144 = 23 040 de ces carrés, comme une mosaïque.',
      '**Elle est très lente comparée à un téléphone d’aujourd’hui** — des milliers de fois. C’est ce qui rend la programmation intéressante : chaque calcul compte, et on voit vraiment ce que fait la machine.',
      '**Tu n’as pas besoin d’une vraie Game Boy.** L’atelier en contient une **imitée** dans le navigateur (on dit un **émulateur**) : elle fait exactement ce que ferait la vraie. La cartouche que tu fabriques marcherait aussi sur une vraie console.',
    ],
  },
  {
    titre: 'Un programme, c’est un texte',
    texte: [
      '**Un programme s’écrit comme un texte**, avec des lettres, des chiffres et quelques signes : `( ) { } ; = " "`. Ici, on l’écrit dans le langage **C++** (on dit « C plus plus »), un langage très utilisé pour les jeux vidéo.',
      '**Un langage de programmation a des règles strictes**, comme l’orthographe, mais plus sévères : un signe oublié et la machine ne comprend plus. Pas de panique : l’atelier dit **où** est l’erreur et **quoi** corriger.',
      '**Le plus petit programme possible** : il ne fait rien, mais il est juste.',
      'CODE:int main() {\n  while (true) {\n    image();\n  }\n}',
      '`int main()` veut dire « ici commence le programme » ; `while (true)` veut dire « recommence sans fin » ; `image()` veut dire « attends l’image suivante ». Les **accolades** `{ }` entourent ce qui va ensemble. Tout cela est expliqué dans les parties suivantes.',
    ],
  },
  {
    titre: 'Le compilateur : le traducteur',
    texte: [
      '**La console ne lit pas le C++.** Elle ne comprend que des **nombres** : des suites d’**octets** (un octet est un nombre de 0 à 255). Il faut donc **traduire** le texte en nombres.',
      '**Le compilateur est ce traducteur.** Quand tu appuies sur « Compiler et lancer », il lit ton programme du début à la fin, vérifie qu’il respecte les règles, puis le transforme en octets — environ 32 000 — qui forment une **cartouche**.',
      '**S’il trouve une erreur, il s’arrête et le dit** : le numéro de la ligne, et ce qui ne va pas, en français. Par exemple : « ligne 5 : il manque un point-virgule ». C’est normal et utile : il vaut mieux une erreur dite tout de suite qu’un jeu qui fait n’importe quoi.',
    ],
  },
  {
    titre: 'L’atelier : là où l’on écrit et où l’on joue',
    texte: [
      '**L’atelier est la page où tout se passe** (index.html, ouverte par lancer.bat). À gauche : le **programme**, que tu écris. À droite : la **console**, qui joue la cartouche.',
      '**Le bouton « ▶ Compiler et lancer »** (ou Ctrl + Entrée) traduit le programme et le lance aussitôt dans la console. En dessous, la page dit ce que la cartouche contient, ou l’erreur s’il y en a une.',
      '**Les touches du clavier font la manette** : les flèches pour la croix, X pour le bouton A, Z pour B, Entrée pour START.',
      '**Les modes, en haut** : 🎨 CRÉATION (écrire, dessiner, composer de la musique), 📚 APPRENDRE (les leçons, dans l’ordre), 🔎 MACHINE (ce que la console exécute vraiment), 🔗 LES SOURCES (tous les documents).',
    ],
  },
  {
    titre: 'Lire une ligne de code',
    texte: [
      '**On lit de haut en bas**, et chaque ligne de gauche à droite — comme un livre. La console exécute les instructions dans cet ordre.',
      '**Le point-virgule `;` termine une instruction**, comme le point termine une phrase. L’oublier est l’erreur la plus fréquente ; le compilateur la signale.',
      '**Les accolades `{ }` regroupent des lignes** qui vont ensemble : tout ce qui est entre `{` et `}` forme un **bloc**. Les lignes d’un bloc sont décalées vers la droite (on dit **indentées**) pour qu’on voie d’un coup d’œil ce qui est dedans. Le décalage n’est que pour l’œil : la console ne le regarde pas.',
      '**Les commentaires commencent par `//`** : tout ce qui suit, jusqu’au bout de la ligne, est pour l’humain qui lit, et la console l’ignore. Ils expliquent ce que fait le code.',
      'CODE:texte(1, 2, "BONJOUR");   // écrit BONJOUR en haut à gauche',
      '**Les majuscules comptent** : `score` et `Score` sont deux noms différents. Et les noms n’ont ni espace ni accent : on écrit `meilleurScore`, pas « meilleur score ».',
    ],
  },
  {
    titre: 'Écrire à l’écran : les coordonnées',
    texte: [
      '**Pour écrire, il faut dire OÙ.** L’écran est découpé en une grille de **20 colonnes** et **18 lignes** ; chaque case fait 8 × 8 pixels et peut contenir une lettre.',
      '**La case (0, 0) est en haut à gauche.** La première coordonnée est la **colonne** (vers la droite), la seconde la **ligne** (vers le bas). Attention : on compte à partir de **zéro**, pas de un. La colonne 19 est la dernière à droite, la ligne 17 la dernière en bas.',
      'CODE:texte(5, 8, "SALUT");   // colonne 5, ligne 8 : à peu près au milieu',
      '**Des parenthèses après un nom, c’est un appel** : `texte(5, 8, "SALUT")` demande à la console d’exécuter « texte » avec trois **arguments** — les valeurs entre parenthèses, séparées par des virgules. Le mot entre guillemets `"…"` est un **texte** tel quel.',
      '**Au pixel près**, pour ce qui bouge : 160 pixels de large (0 à 159), 144 de haut (0 à 143). Les lutins (les personnages) se placent ainsi.',
    ],
  },
  {
    titre: 'Retenir un nombre : la variable',
    texte: [
      '**Une variable est une boîte avec un nom**, dans la mémoire de la console, qui retient un nombre. On peut lire ce nombre, et le changer.',
      'CODE:uint8_t score = 0;   // une boîte « score », qui commence à 0',
      '`uint8_t` veut dire « un nombre entier de **0 à 255** » (un **octet**). C’est le seul genre de nombre de cette console. Au-delà de 255, il **repart à 0**, comme le compteur kilométrique d’une vieille voiture qui repasse à zéro.',
      '**Le signe `=` veut dire « prend la valeur »**, pas « est égal ». `score = score + 1;` se lit : « score prend la valeur de score plus un » — il augmente de 1. On l’écrit aussi `score++;` ou `score += 1;`.',
      '**Une constante** (`const uint8_t VIES = 3;`) est une variable qui ne change jamais : on lui donne un nom pour que le programme se lise mieux. On les écrit souvent en MAJUSCULES.',
      '**Un tableau** (`uint8_t cases[10];`) est une rangée de boîtes sous un même nom : `cases[0]`, `cases[1]` … `cases[9]`. Le nombre entre crochets dit **laquelle** ; on commence à 0.',
    ],
  },
  {
    titre: 'La boucle du jeu : 60 images par seconde',
    texte: [
      '**Un jeu, c’est un dessin animé.** La console montre **60 images par seconde** ; entre deux images, le programme regarde la manette, déplace les personnages, et prépare l’image suivante.',
      'CODE:while (true) {\n  image();          // attendre l’image suivante\n  // … ce qui se passe à chaque image\n}',
      '`while (true) { … }` répète ce qui est entre les accolades **sans jamais s’arrêter** : c’est la **boucle du jeu**. `image()` attend l’image suivante : sans elle, le programme irait trop vite et tout serait fini avant qu’on voie quoi que ce soit.',
      '**Ce qui est avant la boucle se fait une seule fois** (préparer l’écran, mettre le score à zéro). Ce qui est dedans se fait 60 fois par seconde.',
    ],
  },
  {
    titre: 'Décider : « si… sinon… »',
    texte: [
      '**`if` veut dire « si »** : la console teste une **condition** ; si elle est vraie, elle fait ce qui est dans les accolades, sinon elle passe.',
      'CODE:if (bouton(A)) {        // si le bouton A est enfoncé…\n  texte(1, 1, "BRAVO");  // … écrire BRAVO\n} else {                // sinon…\n  texte(1, 1, "     ");  // … effacer\n}',
      '**Comparer** : `==` « est égal à » (deux signes `=`, pour ne pas confondre avec « prend la valeur »), `!=` « est différent de », `<` « plus petit que », `>` « plus grand que », `<=` et `>=` « ou égal ».',
      '**Combiner** : `&&` veut dire « et » (les deux doivent être vrais), `||` veut dire « ou » (l’un des deux suffit), `!` veut dire « pas ».',
    ],
  },
  {
    titre: 'Répéter : les boucles qui comptent',
    texte: [
      '**`for` répète un nombre de fois connu.** On lui donne un compteur, une condition pour continuer, et ce qu’on fait au compteur après chaque tour.',
      'CODE:for (uint8_t i = 0; i < 5; i++) {   // i vaut 0, 1, 2, 3, 4\n  texte(i, 3, "X");                  // un X dans les colonnes 0 à 4\n}',
      '**`while (condition)` répète tant qu’une condition est vraie** — on ne sait pas d’avance combien de fois. `break;` sort de la boucle tout de suite.',
    ],
  },
  {
    titre: 'Ranger des gestes : les fonctions',
    texte: [
      '**Une fonction est un groupe d’instructions qui a un nom.** On l’écrit une fois, puis on la lance autant de fois qu’on veut en écrivant son nom suivi de parenthèses.',
      'CODE:void effacerLigne(uint8_t ligne) {       // une fonction à nous\n  texte(0, ligne, "                    ");\n}\n\neffacerLigne(4);                          // on la lance pour la ligne 4',
      '`void` dit que la fonction **ne rend rien** ; `uint8_t nom(…)` dit qu’elle **rend un nombre**, avec `return`. Ce qui est entre les parenthèses de sa définition (`uint8_t ligne`) sont ses **paramètres** : des boîtes qui reçoivent les valeurs données à l’appel.',
      '**La console a ses propres fonctions toutes prêtes** : `texte`, `poser`, `sprite`, `bouton`, `image`… Ce sont elles qui touchent l’écran, la manette et le son.',
    ],
  },
  {
    titre: '« #include » : demander une fonction de la console',
    texte: [
      '**La cartouche est petite** (32 768 octets pour tout le jeu). La console ne met donc dans ta cartouche **que les fonctions que tu demandes**.',
      'CODE:#include <texte>    // « ce programme se sert de texte() »',
      '**Une ligne `#include <nom>` par fonction employée**, en haut du programme. Sans elle, le compilateur refuse et dit laquelle ajouter. Une ligne de trop ne coûte rien.',
      '**`#include "fichier.cpp"`** (avec des guillemets) est différent : il verse **ton propre fichier** à cet endroit, comme si son texte était écrit là. Ça permet de ranger un grand programme en plusieurs onglets.',
    ],
  },
  {
    titre: 'Les dessins : pixels, tuiles et lutins',
    texte: [
      '**Une tuile est un petit dessin de 8 × 8 pixels.** Le décor (le fond de l’écran) est une grille de tuiles, comme un carrelage. On l’écrit avec des signes, une rangée par ligne :',
      'CODE:Tuile MUR = {\n  "########",\n  "#++#+++#",\n  …\n};',
      '**Chaque signe est un pixel** : « . » le plus clair, « - » clair, « + » foncé, « # » le plus foncé. (On peut aussi écrire les chiffres 0, 1, 2, 3.) En couleur, ces quatre nuances deviennent les quatre couleurs d’une **palette**.',
      '**Un Perso est un dessin de 16 × 16** (ou 32 × 32) : quatre tuiles (ou seize) en carré.',
      '**Un lutin (en anglais « sprite ») est un dessin qui bouge** librement, au pixel près, par-dessus le décor : le héros, les ennemis, une balle. `poser()` met une tuile dans le décor ; `sprite()` place un lutin.',
      '**Dessiner une fois, agrandir comme on veut** : un nombre en plus à la fin — `sprite16(0, 40, 40, HEROS, 3)` — montre le dessin trois fois plus grand ; le compilateur le redessine, il n’y a toujours qu’un seul dessin.',
    ],
  },
  {
    titre: 'Quand ça ne marche pas : les erreurs',
    texte: [
      '**Une erreur n’est pas un échec**, c’est une information. Tous les programmeurs en font, tout le temps.',
      '**Lis le message** : il donne la **ligne** et la **raison**. Va à cette ligne (le numéro est à gauche du programme) et regarde juste avant aussi : un point-virgule oublié à la ligne 4 est souvent signalé à la ligne 5.',
      '**Les erreurs les plus courantes** : un `;` oublié ; une accolade `}` en trop ou en moins ; un nom mal écrit (`Texte` au lieu de `texte`) ; un `#include` oublié ; un texte sans ses guillemets.',
      '**Avance par petits pas** : change une seule chose, relance, regarde. Si ça casse, tu sais exactement ce qui a cassé. Et Ctrl + Z annule la dernière modification.',
    ],
  },
]

/* =================================================================== LE LEXIQUE */

/*
 * [mot, définition, motif qui le reconnaît dans un programme (ou null)].
 * Le motif sert aux encadrés « Les mots de cette leçon » : seuls les mots
 * qu’on VOIT dans le programme y sont repris.
 */
export const LEXIQUE = [
  ['accolades { }', 'Elles entourent un bloc : les lignes qui vont ensemble (le corps d’une fonction, d’une boucle, d’un « if »). Chaque « { » a son « } ».', /[{}]/],
  ['affectation (=)', '« x = 5; » : la boîte x prend la valeur 5. Ce n’est pas une égalité : c’est un rangement.', /[^=!<>]=[^=]/],
  ['argument', 'Une valeur donnée à une fonction quand on l’appelle, entre ses parenthèses : dans texte(5, 8, "SALUT"), 5, 8 et "SALUT" sont les arguments.', /\w\([^)]/],
  ['bloc', 'Un groupe de lignes entre accolades { }, qui s’exécutent ensemble.', /\{/],
  ['booléen (vrai / faux)', 'Le résultat d’une condition : vrai (1) ou faux (0). « true » veut dire vrai, « false » faux.', /\btrue\b|\bfalse\b/],
  ['boucle', 'Des instructions qui se répètent : « while » (tant que…) ou « for » (pour un compteur qui va de… à…).', /\bwhile\b|\bfor\b/],
  ['boucle du jeu', '« while (true) { image(); … } » : ce qui se répète 60 fois par seconde, sans fin, pendant tout le jeu.', /while\s*\(\s*true\s*\)/],
  ['bouton()', 'Une fonction de la console qui dit si un bouton de la manette est enfoncé : 1 oui, 0 non. Les boutons : A, B, HAUT, BAS, GAUCHE, DROITE, START, SELECT.', /\bbouton\s*\(/],
  ['break', 'Sort tout de suite de la boucle (ou du « switch ») où l’on est.', /\bbreak\b/],
  ['C++', 'Le langage dans lequel ces programmes sont écrits. Le compilateur de l’atelier en comprend une partie, adaptée à la Game Boy.', null],
  ['cartouche', 'Le boîtier qui contient un jeu ; ici, le fichier .gb (ou .gbc en couleur) que le compilateur fabrique : 32 768 octets.', null],
  ['chaîne de caractères (texte)', 'Des lettres entre guillemets, "COMME CECI" : un texte pris tel quel. La police de la console n’a que des majuscules, sans accents.', /"[^"]*"/],
  ['commentaire (//)', 'Tout ce qui suit « // » jusqu’au bout de la ligne : une phrase pour l’humain, que la console ignore.', /\/\//],
  ['compilateur', 'Le traducteur qui transforme le texte du programme en octets que la console comprend, et qui signale les erreurs.', null],
  ['condition', 'Une question dont la réponse est vrai ou faux : « score > 10 », « bouton(A) ». On la teste avec « if » ou « while ».', /\bif\b|\bwhile\b/],
  ['console', 'La machine qui joue : ici, la Game Boy (ou Game Boy Color), imitée dans le navigateur par l’émulateur.', null],
  ['constante (const)', 'Une valeur qui a un nom et ne change jamais : « const uint8_t VIES = 3; ».', /\bconst\b/],
  ['continue', 'Passe directement au tour suivant de la boucle.', /\bcontinue\b/],
  ['coordonnées', 'Deux nombres qui disent où : la colonne (vers la droite) puis la ligne (vers le bas), à partir de (0, 0) en haut à gauche.', /\b(texte|poser|sprite\w*|nombre)\s*\(/],
  ['couleur, palette', 'En couleur (Game Boy Color), chaque dessin a quatre teintes ; une palette dit quelles couleurs. couleurFond() les règle pour le décor, couleurLutin() pour les lutins.', /\bcouleur(Fond|Lutin)\b|\bteindre\w*\b/],
  ['défilement', 'Le décor qui glisse quand le héros avance : defiler(x, y) décale tout le fond.', /\bdefiler\s*\(/],
  ['else (sinon)', 'Ce que l’on fait quand la condition du « if » est fausse.', /\belse\b/],
  ['émulateur', 'Un programme qui imite une machine : ici, une Game Boy dans le navigateur.', null],
  ['fonction', 'Un groupe d’instructions qui a un nom, qu’on lance en écrivant son nom et des parenthèses. Celles de la console (texte, poser…) sont toutes prêtes ; on peut écrire les siennes.', /\b(void|uint8_t)\s+\w+\s*\([^)]*\)\s*\{/],
  ['for', 'Une boucle qui compte : « for (uint8_t i = 0; i < 5; i++) » fait 5 tours, i valant 0, 1, 2, 3 puis 4.', /\bfor\b/],
  ['hasard()', 'Une fonction de la console qui rend un nombre au hasard, de 0 à 255.', /\bhasard\s*\(/],
  ['if (si)', 'Teste une condition : si elle est vraie, on fait le bloc qui suit.', /\bif\b/],
  ['image()', 'Attend l’image suivante. La console en montre 60 par seconde : c’est ce qui règle la vitesse d’un jeu.', /\bimage\s*\(/],
  ['#include', 'En haut du programme : « #include <texte> » demande la fonction texte() à la console ; « #include "fichier.cpp" » verse un de tes fichiers à cet endroit.', /#include/],
  ['incrémenter (++)', '« x++ » ou « x += 1 » : x augmente de 1. « x-- » : x diminue de 1.', /\+\+|--|\+=|-=/],
  ['indice', 'Le numéro d’une case dans un tableau, entre crochets : cases[3] est la quatrième case (on compte à partir de 0).', /\w\[[^\]]+\]/],
  ['instruction', 'Un ordre donné à la console, terminé par un point-virgule : « texte(1, 1, "OK"); ».', /;/],
  ['lutin (sprite)', 'Un dessin qui bouge au pixel près, par-dessus le décor : le héros, un ennemi. sprite() en place un de 8 × 8, sprite16() un de 16 × 16. La console en a 40.', /\bsprite\w*\s*\(/],
  ['main', '« int main() { … } » : là où le programme commence. La console exécute d’abord la première ligne de main.', /\bmain\s*\(/],
  ['octet', 'Un nombre de 0 à 255 : la plus petite boîte de la mémoire. Une cartouche en a 32 768.', /\buint8_t\b/],
  ['opérateurs de calcul', '+ plus, - moins, * fois, / divisé par (sans virgule : 7 / 2 donne 3), % le reste de la division (7 % 2 donne 1).', /[^/*]\s[+\-*/%]\s/],
  ['opérateurs de comparaison', '== égal, != différent, < plus petit, > plus grand, <= plus petit ou égal, >= plus grand ou égal. Le résultat est vrai ou faux.', /==|!=|<=|>=|[^<]<[^<]|[^>-]>[^>]/],
  ['opérateurs logiques', '&& « et » (les deux doivent être vrais), || « ou » (un seul suffit), ! « pas ».', /&&|\|\||![^=]/],
  ['paramètre', 'Dans la définition d’une fonction, la boîte qui reçoit une valeur donnée à l’appel : dans « void f(uint8_t x) », x est un paramètre.', /\b(void|uint8_t)\s+\w+\s*\(\s*uint8_t/],
  ['Perso', 'Un dessin de 16 × 16 pixels (ou 32 × 32) : quatre tuiles en carré (ou seize). « Perso HEROS = { … }; ».', /\bPerso\b/],
  ['pixel', 'Un tout petit carré de couleur ; l’écran en a 160 de large et 144 de haut.', /\bsprite\w*\s*\(/],
  ['point-virgule (;)', 'Il termine une instruction, comme le point termine une phrase.', /;/],
  ['poser()', 'Met une tuile dans le décor, sur une case de la grille de 20 × 18 (32 × 32 en tout, avec la partie cachée).', /\bposer\s*\(/],
  ['programme', 'La liste d’instructions qu’on écrit, et que le compilateur traduit en cartouche.', null],
  ['return', 'Termine la fonction et rend une valeur à celui qui l’a appelée.', /\breturn\b/],
  ['struct', 'Un modèle qui regroupe plusieurs boîtes sous un nom : « struct Ennemi { uint8_t x; uint8_t y; }; ».', /\bstruct\b/],
  ['switch / case', 'Choisir entre plusieurs cas selon la valeur d’une variable, au lieu d’une suite de « if ».', /\bswitch\b|\bcase\b/],
  ['tableau', 'Une rangée de boîtes sous un même nom : « uint8_t cases[10]; » donne cases[0] à cases[9].', /\w\s*\[\s*\w*\s*\]\s*(=|;)/],
  ['taille (agrandir)', 'Un nombre en dernier argument de sprite, sprite16, sprite32, poser… : le dessin, écrit une fois, montré autant de fois plus grand.', /\b(spriteTaille)\b|\bsprite(16|32)?\s*\([^;]*,\s*[2-9]\d*\s*\)\s*;/],
  ['texte()', 'Écrit des lettres à l’écran, sur la grille de 20 colonnes et 18 lignes : texte(colonne, ligne, "MOT").', /\btexte\s*\(/],
  ['Tuile', 'Un dessin de 8 × 8 pixels, écrit rangée par rangée avec des signes (. - + #). Le décor en est fait.', /\bTuile\b/],
  ['uint8_t', 'Le genre de nombre de cette console : un entier de 0 à 255 (un octet). Au-delà, il repart à 0.', /\buint8_t\b/],
  ['variable', 'Une boîte avec un nom, dans la mémoire, qui retient un nombre qu’on peut lire et changer.', /\buint8_t\s+\w+\s*(=|;|\[)/],
  ['void', 'Devant une fonction : elle ne rend rien, elle agit seulement.', /\bvoid\b/],
  ['while (tant que)', 'Répète un bloc tant qu’une condition est vraie.', /\bwhile\b/],
]

/** Les mots du lexique qu’un programme (et ses fichiers) emploie vraiment. Les
    « #include » et les commentaires ne comptent que pour leurs propres mots :
    le « < » de « #include <texte> » n’est pas une comparaison. */
export function motsDuCode(...textes) {
  const tout = textes.filter(Boolean).join('\n')
  const code = tout.split('\n').filter((l) => !/^\s*#include/.test(l)).map((l) => l.replace(/\/\/.*$/, '')).join('\n')
  return LEXIQUE.filter(([mot, , motif]) => motif && motif.test(mot.startsWith('#include') || mot.startsWith('commentaire') ? tout : code))
}

/* ========================================================== LIGNE PAR LIGNE */

/* Une condition dite en français : « score > 10 && vies != 0 » → « score est plus grand que 10 et vies est différent de 0 ». */
export function conditionEnFrancais(c) {
  return c
    .replace(/\bbouton\(\s*(\w+)\s*\)\s*==\s*1/g, 'le bouton $1 est enfoncé')
    .replace(/\bbouton\(\s*(\w+)\s*\)\s*==\s*0/g, 'le bouton $1 n’est pas enfoncé')
    .replace(/\bbouton\(\s*(\w+)\s*\)/g, 'le bouton $1 est enfoncé')
    .replace(/&&/g, ' et ').replace(/\|\|/g, ' ou ')
    .replace(/==/g, ' est égal à ').replace(/!=/g, ' est différent de ')
    .replace(/<=/g, ' est plus petit ou égal à ').replace(/>=/g, ' est plus grand ou égal à ')
    .replace(/(^|[^-])>/g, '$1 est plus grand que ').replace(/</g, ' est plus petit que ')
    .replace(/\btrue\b/g, 'vrai').replace(/\bfalse\b/g, 'faux')
    .replace(/!\s*(\w)/g, 'pas $1')
    .replace(/\s+/g, ' ').trim()
}

/* Ce que fait une fonction de la console : l’aide de l’éditeur, sinon la phrase de BIBLIOTHEQUES. */
const decrireFonction = (nom) => {
  const f = FONCTIONS[nom]?.dit ?? BIBLIOTHEQUES[nom]
  return f ? f.replace(/\.$/, '') : null
}

/**
 * Une ligne de code, en français. Rend null pour une ligne vide (ou une
 * rangée de dessin qui suit une autre : on ne les explique qu’une fois).
 */
export function expliquerLigne(brute, avant = '') {
  const ligne = brute.replace(/\/\/.*$/, '').trim()
  const commentaire = (brute.match(/\/\/\s*(.*)$/) ?? [])[1]?.trim()
  const dit = (phrase) => phrase + (commentaire && ligne ? ` (Le commentaire le dit : « ${commentaire} ».)` : '')
  if (!ligne && !commentaire) return null
  if (!ligne) return `Un commentaire : une phrase pour celui qui lit (« ${commentaire} »). La console l’ignore.`
  if (/^\/\*/.test(ligne) || /\*\/$/.test(ligne) || /^\*/.test(ligne)) return 'Un commentaire sur plusieurs lignes, entre « /* » et « */ » : pour celui qui lit, la console l’ignore.'
  if (/^default\s*:/.test(ligne)) return dit('Le cas « par défaut » du switch : quand aucun autre « case » ne correspond.')
  let m
  if ((m = ligne.match(/^#include\s*<(\w+)>/))) {
    const d = BIBLIOTHEQUES[m[1]] ?? decrireFonction(m[1])
    return dit(`Demande à la console « ${m[1]} »${d ? ` (ce que c’est : ${d})` : ''}. Sans cette ligne, le compilateur refuserait de l’employer.`)
  }
  if ((m = ligne.match(/^#include\s*"([^"]+)"/))) return dit(`Verse ici le fichier « ${m[1]} » (un autre onglet du programme) : tout se passe comme si son texte était écrit à cet endroit.`)
  if (/^("[^"]*",?\s*)+$/.test(ligne)) {
    if (/^\s*"/.test(avant)) return null
    return 'Les rangées du dessin, une par ligne : chaque signe est un pixel — « . » le plus clair, « - » clair, « + » foncé, « # » le plus foncé (ou les chiffres 0 à 3).'
  }
  if ((m = ligne.match(/^(Tuile|Perso|Grand)\s+(\w+)\s*=\s*\{/))) return dit(`Le début d’un dessin appelé ${m[2]} : ${m[1] === 'Tuile' ? 'une tuile de 8 × 8 pixels' : 'un dessin de 16 × 16 (ou 32 × 32) pixels'}. Les lignes suivantes en sont les rangées, de haut en bas.`)
  if (/^\};?$/.test(ligne)) return /^\s*"/.test(avant) || /,\s*$/.test(avant) ? 'La fin du dessin (ou de la liste).' : 'L’accolade fermante : la fin du bloc ouvert plus haut par « { ».'
  if ((m = ligne.match(/^const\s+uint8_t\s+(\w+)\s*\[\s*\]\s*=\s*\{/))) return dit(`Un tableau constant nommé ${m[1]} : une liste de nombres, rangés dans l’ordre et gravés dans la cartouche. ${m[1]}[0] est le premier.`)
  if ((m = ligne.match(/^const\s+uint8_t\s+(\w+)\s*=\s*([^;]+);/))) return dit(`Une constante : le nom ${m[1]} veut dire ${m[2].trim()}, pour tout le programme. Elle ne changera jamais ; le nom rend le code plus facile à lire.`)
  if ((m = ligne.match(/^uint8_t\s+(\w+)\s*\[\s*(\w+)\s*\]\s*(=\s*\{[^}]*\})?\s*;/))) return dit(`Un tableau nommé ${m[1]} : ${m[2]} boîtes de nombres (0 à 255) sous le même nom, de ${m[1]}[0] à la dernière.`)
  if ((m = ligne.match(/^uint8_t\s+(\w+)\s*=\s*([^;]+);/))) return dit(`Une variable : une boîte appelée ${m[1]}, qui retient un nombre de 0 à 255, et qui commence à ${m[2].trim()}.`)
  if ((m = ligne.match(/^uint8_t\s+(\w+)\s*;/))) return dit(`Une variable : une boîte appelée ${m[1]}, qui retient un nombre de 0 à 255.`)
  if (/^int\s+main\s*\(\s*\)\s*\{?/.test(ligne)) return dit('Le début du programme : la console commence ici, par la première ligne qui suit.')
  if ((m = ligne.match(/^(void|uint8_t)\s+(\w+)\s*\(([^)]*)\)\s*\{/))) {
    const params = m[3].trim() ? m[3].split(',').map((p) => p.trim().split(/\s+/).pop()) : []
    return dit(`Le début d’une fonction à nous, appelée ${m[2]} : un groupe d’instructions qu’on lancera en écrivant ${m[2]}(…). ${params.length ? `Elle reçoit ${params.length > 1 ? 'des valeurs' : 'une valeur'}, rangée${params.length > 1 ? 's' : ''} dans ${params.join(', ')}. ` : ''}${m[1] === 'void' ? 'Elle ne rend rien (void).' : 'Elle rend un nombre (avec return).'}`)
  }
  if ((m = ligne.match(/^struct\s+(\w+)/))) return dit(`Un modèle appelé ${m[1]} : plusieurs boîtes rangées ensemble sous un même nom.`)
  if (/^while\s*\(\s*true\s*\)/.test(ligne)) return dit('La boucle du jeu : tout ce qui est entre les accolades recommence sans fin, 60 fois par seconde avec image().')
  if ((m = ligne.match(/^while\s*\((.*)\)\s*\{?\s*(.*)$/))) return dit(`Une boucle : tant que ${conditionEnFrancais(m[1])}, on recommence ${m[2] && m[2] !== '{' ? `« ${m[2]} »` : 'ce qui est entre les accolades'}.`)
  if ((m = ligne.match(/^for\s*\(\s*(?:uint8_t\s+)?(\w+)\s*=\s*([^;]+);([^;]+);([^)]*)\)/))) return dit(`Une boucle qui compte : ${m[1]} part de ${m[2].trim()} ; on continue tant que ${conditionEnFrancais(m[3])} ; et après chaque tour, ${m[4].includes('++') ? `${m[1]} augmente de 1` : m[4].trim()}.`)
  if ((m = ligne.match(/^\}?\s*else\s+if\s*\((.*)\)\s*\{?/))) return dit(`Sinon, si ${conditionEnFrancais(m[1])}, on fait le bloc qui suit.`)
  if (/^\}?\s*else\s*\{?$/.test(ligne)) return dit('Sinon (si la condition d’avant était fausse), on fait le bloc qui suit.')
  if ((m = ligne.match(/^if\s*\((.*)\)\s*(\{?)\s*(.*)$/))) {
    const suite = m[3] && m[3] !== '{' ? ` alors on fait « ${m[3].replace(/;$/, '')} »` : ', on fait ce qui est entre les accolades'
    return dit(`Une décision : si ${conditionEnFrancais(m[1])}${suite}. Sinon, on passe.`)
  }
  if ((m = ligne.match(/^switch\s*\((.*)\)/))) return dit(`Choisir selon la valeur de ${m[1]} : on saute au « case » qui lui correspond.`)
  if ((m = ligne.match(/^case\s+([^:]+):/))) return dit(`Le cas où la valeur est ${m[1].trim()}.`)
  if (/^break\s*;/.test(ligne)) return dit('On sort de la boucle (ou du « switch ») tout de suite.')
  if (/^continue\s*;/.test(ligne)) return dit('On passe au tour suivant de la boucle.')
  if ((m = ligne.match(/^return\s*([^;]*);/))) return dit(m[1] ? `La fonction s’arrête ici et rend ${m[1].trim()} à celui qui l’a appelée.` : 'La fonction s’arrête ici.')
  if (/^\}$/.test(ligne)) return 'L’accolade fermante : la fin du bloc ouvert plus haut par « { ».'
  if ((m = ligne.match(/^(\w+(?:\[[^\]]+\])*(?:\.\w+)?)\s*\+\+\s*;/)) || (m = ligne.match(/^(\w+(?:\[[^\]]+\])*(?:\.\w+)?)\s*=\s*\1\s*\+\s*1\s*;/))) return dit(`${m[1]} augmente de 1.`)
  if ((m = ligne.match(/^(\w+(?:\[[^\]]+\])*(?:\.\w+)?)\s*--\s*;/)) || (m = ligne.match(/^(\w+(?:\[[^\]]+\])*(?:\.\w+)?)\s*=\s*\1\s*-\s*1\s*;/))) return dit(`${m[1]} diminue de 1.`)
  if ((m = ligne.match(/^(\w+(?:\[[^\]]+\])*(?:\.\w+)?)\s*\+=\s*([^;]+);/))) return dit(`${m[1]} augmente de ${m[2].trim()}.`)
  if ((m = ligne.match(/^(\w+(?:\[[^\]]+\])*(?:\.\w+)?)\s*-=\s*([^;]+);/))) return dit(`${m[1]} diminue de ${m[2].trim()}.`)
  if ((m = ligne.match(/^(\w+(?:\[[^\]]+\])*(?:\.\w+)?)\s*=\s*([^;]+);/))) return dit(`${m[1]} prend une nouvelle valeur : ${m[2].trim()}.`)
  if ((m = ligne.match(/^(\w+)\s*\((.*)\)\s*;/))) {
    if (m[1] === 'image') return dit('Attendre l’image suivante : la console en montre 60 par seconde. C’est ce qui règle la vitesse du jeu.')
    const d = decrireFonction(m[1])
    if (d) return dit(`Appel de la fonction ${m[1]} de la console${m[2].trim() ? `, avec ${m[2].split(',').length > 1 ? 'les arguments' : 'l’argument'} ${m[2].trim()}` : ''}. Ce qu’elle fait : ${d}.`)
    return dit(`Lance la fonction ${m[1]}${m[2].trim() ? ` avec ${m[2].trim()}` : ''} : ses instructions s’exécutent, puis on revient à la ligne suivante.`)
  }
  if (/^\{$/.test(ligne)) return 'L’accolade ouvrante : le début d’un bloc.'
  if ((m = ligne.match(/^(\w+)\s*\((.*),\s*\{$/))) return dit(`Appel de ${m[1]}, avec un dessin écrit SUR PLACE : ses rangées suivent, juste en dessous, au lieu d’avoir un nom.`)
  if (/^\}\s*\)\s*;$/.test(ligne)) return 'La fin du dessin écrit sur place, et la fin de l’appel.'
  if (/^do\s*\{?$/.test(ligne)) return dit('Une boucle « fais… tant que » : on fait le bloc une première fois, puis on recommence tant que la condition écrite à la fin est vraie.')
  if ((m = ligne.match(/^\}\s*while\s*\((.*)\)\s*;/))) return dit(`La fin de la boucle « do » : on recommence tant que ${conditionEnFrancais(m[1])}.`)
  if ((m = ligne.match(/^const\s+char\s+(\w+)\s*\[\s*\]\s*=\s*("[^"]*")/))) return dit(`Un texte constant nommé ${m[1]} : ${m[2]}, gravé dans la cartouche. On l’écrit à l’écran avec texte(…, ${m[1]}).`)
  if ((m = ligne.match(/^else\s*\{?\s*(.+?)\s*\}?$/))) return dit(`Sinon (si la condition d’avant était fausse), on fait « ${m[1].replace(/;\s*\}?$/, '')} ».`)
  if ((m = ligne.match(/^uint8_t\s+(\w+(?:\s*,\s*\w+)+)\s*;/))) return dit(`Plusieurs variables d’un coup : ${m[1].split(/\s*,\s*/).join(', ')} — chacune une boîte qui retient un nombre de 0 à 255.`)
  if ((m = ligne.match(/^enum\s+(\w+)\s*\{([^}]*)\}/))) return dit(`Une liste de noms appelée ${m[1]} : ${m[2].split(',').map((x, k) => `${x.trim()} vaut ${k}`).join(', ')}. Des noms plutôt que des nombres, pour que le code se lise.`)
  if ((m = ligne.match(/^([A-Z]\w*)\s+(\w+)\s*\[\s*(\w+)\s*\]\s*;/))) return dit(`Un tableau de ${m[3]} ${m[1]} : ${m[2]}[0], ${m[2]}[1]… chacun regroupe les boîtes du modèle ${m[1]}.`)
  if ((m = ligne.match(/^([A-Z]\w*)\s+(\w+)\s*(=\s*([^;]+))?;/))) return dit(`Une variable ${m[2]}, du genre ${m[1]} — un genre défini plus haut dans le programme (un modèle « struct » qui regroupe plusieurs boîtes, ou une liste de noms « enum »)${m[4] ? `. Elle commence à ${m[4].trim()}` : ''}.`)
  if ((m = ligne.match(/^(\w+(?:\[[^\]]+\])*)\.(\w+)\s*\((.*)\)\s*;/))) return dit(`Lance la méthode ${m[2]} de ${m[1]} : une fonction qui appartient à son modèle, et qui agit sur lui.`)
  if (/^[\d\s,]+,?$/.test(ligne)) return null
  return dit('Une instruction : la console l’exécute, puis passe à la ligne suivante.')
}

/* ================================================================ EN HTML */

const CADRE = 'border: 1px solid #c9c2e6; border-left: 4px solid #6b5bb8; border-radius: 4px; padding: 6pt 10pt; margin: 8pt 0; break-inside: avoid;'

/** « Les mots de cette leçon » : chaque mot technique que le programme emploie. */
export function encadreDesMots(code, fichiers = {}) {
  const mots = motsDuCode(code, ...Object.values(fichiers))
  if (!mots.length) return ''
  return `
<div style="${CADRE}">
  <p style="margin: 0 0 4pt; font-weight: 700; color: #4b3d99;">📖 Les mots de cette leçon — si tu débutes</p>
  <ul style="margin: 0; padding-left: 14pt;">
${mots.map(([mot, def]) => `    <li style="margin: 2pt 0;"><strong>${echapper(mot)}</strong> — ${echapper(def)}</li>`).join('\n')}
  </ul>
</div>`
}

/** « Le programme, ligne par ligne » : chaque ligne, puis ce qu’elle veut dire. */
export function encadreLigneParLigne(code, titre = 'Le programme, ligne par ligne') {
  const lignes = code.replace(/\r\n/g, '\n').trimEnd().split('\n')
  const rangs = []
  lignes.forEach((l, i) => {
    const sens = expliquerLigne(l, lignes[i - 1] ?? '')
    if (sens === null) return
    rangs.push(`    <tr><td style="width: 46%; vertical-align: top; padding: 2pt 6pt 2pt 0; border-bottom: 1px dotted #ddd;"><code style="white-space: pre-wrap; overflow-wrap: anywhere; font-size: 8pt;">${echapper(l.trim()) || '&nbsp;'}</code></td><td style="vertical-align: top; padding: 2pt 0; border-bottom: 1px dotted #ddd; font-size: 9pt; overflow-wrap: anywhere;">${echapper(sens)}</td></tr>`)
  })
  if (!rangs.length) return ''
  return `
<div style="${CADRE} break-inside: auto;">
  <p style="margin: 0 0 4pt; font-weight: 700; color: #4b3d99;">🔍 ${echapper(titre)} — chaque ligne dite en français</p>
  <table style="width: 100%; border-collapse: collapse; table-layout: fixed;"><tbody>
${rangs.join('\n')}
  </tbody></table>
</div>`
}

/** Les deux encadrés d’une leçon, pour le débutant. */
export function encadreDebutant(lecon) {
  return encadreDesMots(lecon.code ?? '', lecon.fichiers) + encadreLigneParLigne(lecon.code ?? '')
}

/** « Les bases », en HTML : chaque partie, numérotée. */
export function basesEnHtml({ niveauTitre = 'h2', avecSaut = true } = {}) {
  return BASES.map((b, k) => `
<section style="${avecSaut && k === 0 ? 'break-before: page;' : ''} break-inside: auto;">
  <${niveauTitre}>${k}. ${echapper(b.titre)}</${niveauTitre}>
${b.texte.map((t) => t.startsWith('CODE:') ? `  <pre><code>${echapper(t.slice(5))}</code></pre>` : `  <p>${enrichir(t)}</p>`).join('\n')}
</section>`).join('\n')
}

/** Le lexique entier, en HTML, par ordre alphabétique. */
export function lexiqueEnHtml(niveauTitre = 'h2') {
  const tries = [...LEXIQUE].sort((a, b) => a[0].replace(/^[#{(]/, '').localeCompare(b[0].replace(/^[#{(]/, ''), 'fr'))
  return `
<section style="break-before: page;">
  <${niveauTitre}>Le lexique : chaque mot, expliqué simplement</${niveauTitre}>
  <p>Les ${tries.length} mots techniques qu’on rencontre dans ce document, par ordre alphabétique.</p>
  <table style="width: 100%; border-collapse: collapse; font-size: 9.5pt;"><tbody>
${tries.map(([mot, def]) => `    <tr style="break-inside: avoid;"><td style="width: 34%; vertical-align: top; padding: 4pt 6pt 4pt 0; border-bottom: 1px dotted #ccc; font-weight: 700;">${echapper(mot)}</td><td style="vertical-align: top; padding: 4pt 0; border-bottom: 1px dotted #ccc;">${echapper(def)}</td></tr>`).join('\n')}
  </tbody></table>
</section>`
}

/**
 * Les projets sur le disque : le service tient-il, et refuse-t-il ce qu'il doit ?
 *
 *   node verifier-projets.mjs
 *
 * `projets.php` est le SEUL morceau de ce dépôt qui écrive un fichier. C'est
 * donc le seul qui puisse abîmer autre chose que l'écran, et il est éprouvé en
 * conséquence : on l'appelle par HTTP, comme la page le fait, et l'on contrôle
 * autant ce qu'il accepte que ce qu'il refuse.
 *
 * La moitié des contrôles porte sur les REFUS. Un nom de projet qui remonte
 * dans l'arborescence, un fichier « .php » glissé dans la liste, une capture
 * qui n'est pas une image : ce sont les trois façons dont un service comme
 * celui-ci se fait retourner, et aucune ne doit passer.
 *
 * Le dossier d'essai est créé et effacé par le contrôle : il ne laisse rien
 * derrière lui, et ne touche à aucun projet existant.
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { bulletin } from '../outils/controle.mjs'
import { servirLAtelier } from '../outils/serveur-essai.mjs'

/* Un serveur à lui, sur le dossier du projet : plus besoin de XAMPP (voir outils/serveur-essai.mjs). */
const SERVICE = (await servirLAtelier()) + 'projets.php'
const DOSSIER = 'projets'
const ESSAI = 'essai_du_controle'

const b = bulletin('les projets sur le disque')

/** Un appel au service, comme la page le fait. */
async function demander(quoi, { projet = null, corps = null } = {}) {
  const adresse = `${SERVICE}?quoi=${quoi}` + (projet ? `&projet=${encodeURIComponent(projet)}` : '')
  const reponse = await fetch(adresse, corps
    ? { method: 'POST', body: JSON.stringify({ projet, ...corps }) }
    : { method: 'GET' })
  return { code: reponse.status, ...(await reponse.json()) }
}

/* Le serveur répond-il seulement ? Sans lui, tout le reste ment. */
let debout = false
try {
  const premier = await demander('liste')
  debout = Array.isArray(premier.projets)
} catch { /* il est arrêté */ }

if (!debout) {
  b.verifier('le service répond', false, ' — Apache et PHP tournent-ils ? (XAMPP)')
  b.fin()
}

/* On part propre : un essai d'hier fausserait tout ce qui suit. */
if (existsSync(`${DOSSIER}/${ESSAI}`)) await demander('supprimer', { projet: ESSAI, corps: {} })

/* ------------------------------------------------ ce qu'il accepte */

const cree = await demander('creer', { projet: 'Essai Du Contrôle !', corps: { titre: 'ESSAI' } })
b.egal('un nom écrit à la main devient un nom de dossier', cree.nom, ESSAI)
b.verifier('et le dossier existe vraiment sur le disque', existsSync(`${DOSSIER}/${ESSAI}`),
  ` (${cree.dossier})`)
b.verifier('avec un programme de départ qui n’est pas vide',
  existsSync(`${DOSSIER}/${ESSAI}/principal.cpp`) &&
  readFileSync(`${DOSSIER}/${ESSAI}/principal.cpp`, 'utf8').includes('int main()'))

/*
 * Jamais d'écrasement.
 *
 * Deux projets du même nom, c'est le travail de l'un qui disparaît. Le service
 * numérote plutôt que d'écraser — comme la boîte de nom de la page, et pour la
 * même raison.
 */
const encore = await demander('creer', { projet: ESSAI })
b.egal('un second projet du même nom reçoit un numéro', encore.nom, ESSAI + '2')
await demander('supprimer', { projet: encore.nom, corps: {} })

const ecrit = await demander('enregistrer', {
  projet: ESSAI,
  corps: {
    titre: 'ESSAI',
    console: 'gb',
    fichiers: {
      'principal.cpp': 'int main() { texte(4, 6, "ESSAI"); while (true) { image(); } }\n',
      'dessins.cpp': '// des dessins\n',
    },
  },
})
b.egal('enregistrer écrit tous les onglets', (ecrit.fichiers ?? []).length, 2)

const relu = await demander('ouvrir', { projet: ESSAI })
b.verifier('et les relire rend exactement ce qu’on a écrit',
  relu.fichiers['principal.cpp'].includes('texte(4, 6, "ESSAI")') &&
  relu.fichiers['dessins.cpp'] === '// des dessins\n')
b.egal('les réglages du projet suivent, eux aussi', relu.reglages.console, 'gb')

/*
 * La page et le disque doivent nommer PAREIL.
 *
 * « + fichier » corrige ce qu'on tape avant d'en faire un onglet ; le service,
 * lui, refuse tout ce qui n'est pas « quelquechose.cpp ». Les deux règles sont
 * écrites à deux endroits, et rien ne les tient ensemble — une page qui
 * fabriquerait un nom que le disque refuse ne se trahirait qu'au moment
 * d'enregistrer, longtemps après qu'on ait écrit dans le fichier.
 *
 * On prend donc la règle de la page TELLE QU'ELLE EST ÉCRITE dans
 * « index.html », on lui fait nommer les pires noms qu'on puisse taper, et
 * l'on demande au service de les écrire.
 */
const bloc = readFileSync('index.html', 'utf8').match(/ {2}fichier: \{[\s\S]*?\r?\n {2}\},/)
const regleDeLaPage = bloc ? eval('({' + bloc[0] + '})').fichier : null

const TAPÉS = ['Mes Dessins !', 'décor du niveau 3', 'DESSINS.CPP', '../porte', 'a'.repeat(60), '3 cailloux']
const nommés = TAPÉS.map((t) => regleDeLaPage?.corriger(t)).filter(Boolean)

const tousÉcrits = await demander('enregistrer', {
  projet: ESSAI,
  corps: {
    fichiers: Object.fromEntries([
      ['principal.cpp', relu.fichiers['principal.cpp']],
      ...nommés.map((nom) => [nom, `// ${nom}\n`]),
    ]),
  },
})
b.verifier('les noms que la PAGE fabrique, le disque les accepte',
  Boolean(regleDeLaPage) && !tousÉcrits.erreur && (tousÉcrits.fichiers ?? []).length === nommés.length + 1,
  regleDeLaPage ? ` (${nommés.join(', ')})` : ' — la règle « fichier » est introuvable dans index.html')

/*
 * Un onglet fermé disparaît du dossier.
 *
 * Sans cela, un « #include » d'hier continuerait d'être trouvé sur le disque,
 * et le projet ne dirait plus la même chose que ce qu'on voit à l'écran.
 */
await demander('enregistrer', {
  projet: ESSAI,
  corps: { fichiers: { 'principal.cpp': relu.fichiers['principal.cpp'] } },
})
b.verifier('un fichier retiré de la page disparaît du dossier',
  !existsSync(`${DOSSIER}/${ESSAI}/dessins.cpp`))

/* La vignette : un vrai PNG, et rien d'autre. */
const PNG_MINUSCULE = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
const vignette = await demander('capture', { projet: ESSAI, corps: { png: 'data:image/png;base64,' + PNG_MINUSCULE } })
b.verifier('une capture PNG s’écrit dans le dossier',
  vignette.capture === true && existsSync(`${DOSSIER}/${ESSAI}/capture.png`), ` (${vignette.octets} octets)`)

/* La cartouche, à côté du programme. */
const cartouche = Buffer.alloc(0x200, 0)
const gb = await demander('cartouche', { projet: ESSAI, corps: { gb: cartouche.toString('base64') } })
b.verifier('la cartouche est gardée à côté du programme',
  gb.cartouche === true && existsSync(`${DOSSIER}/${ESSAI}/${ESSAI}.gb`))

/*
 * DEUX cartouches, quand le programme pose des couleurs.
 *
 * « les deux » fabrique un « .gbc » avec toutes les couleurs et un « .gb » qui
 * n'en porte aucune. Le dossier garde les deux : c'est ce qu'on met sur une
 * vraie console, et l'on choisit laquelle en la branchant.
 */
const deux = await demander('cartouche', {
  projet: ESSAI,
  corps: { gb: cartouche.toString('base64'), gbc: cartouche.toString('base64') },
})
b.verifier('un projet en couleur garde ses DEUX cartouches',
  existsSync(`${DOSSIER}/${ESSAI}/${ESSAI}.gb`) && existsSync(`${DOSSIER}/${ESSAI}/${ESSAI}.gbc`),
  ` (${Object.keys(deux.cartouches ?? {}).join(', ')})`)

const vues = (await demander('liste')).projets.find((p) => p.nom === ESSAI)
b.egal('et le lecteur les voit toutes les deux', (vues?.cartouches ?? []).join(' '), 'gb gbc')

/*
 * Ôter la couleur d'un programme ôte le « .gbc ».
 *
 * Sans cela il resterait dans le dossier, plus vieux que tout le reste, et
 * l'on croirait avoir encore une version en couleur — jusqu'à la brancher.
 */
await demander('cartouche', { projet: ESSAI, corps: { gb: cartouche.toString('base64') } })
b.verifier('et le « .gbc » s’en va quand le programme n’a plus de couleur',
  !existsSync(`${DOSSIER}/${ESSAI}/${ESSAI}.gbc`))

/* On les remet : la suppression, plus bas, doit savoir effacer les deux. */
await demander('cartouche', {
  projet: ESSAI,
  corps: { gb: cartouche.toString('base64'), gbc: cartouche.toString('base64') },
})

/* La liste, telle que le lecteur la montre. */
const liste = await demander('liste')
const sien = liste.projets.find((p) => p.nom === ESSAI)
b.verifier('le lecteur voit le projet, avec sa vignette et sa cartouche',
  Boolean(sien) && sien.capture === true && sien.cartouche === true,
  ` (${sien ? sien.fichiers.join(', ') : 'introuvable'})`)
b.verifier('et il dit dans quel dossier tout cela vit',
  typeof liste.dossier === 'string' && liste.dossier.endsWith('/projets'), ` (${liste.dossier})`)

/* ------------------------------------------------ ce qu'il refuse */

console.log()

/*
 * Les refus. C'est la moitié qui compte : ce service écrit des fichiers.
 */
const refuse = async (quoi, appel, motif) => {
  const rendu = await appel()
  const dit = rendu.erreur ?? ''
  b.verifier(quoi, Boolean(rendu.erreur) && dit.includes(motif),
    rendu.erreur ? '' : ' — ACCEPTÉ alors qu’il fallait refuser')
}

await refuse('un nom de projet qui remonte dans l’arborescence',
  () => demander('ouvrir', { projet: '../../../windows' }), 'n’est pas un nom de projet')

await refuse('le même, encodé',
  () => demander('ouvrir', { projet: '..%2f..' }), 'n’est pas un nom de projet')

await refuse('une suppression hors du dossier des projets',
  () => demander('supprimer', { projet: '../gameboy3', corps: {} }), 'n’est pas un nom de projet')

await refuse('un fichier « .php » glissé dans la liste',
  () => demander('enregistrer', { projet: ESSAI, corps: { fichiers: { 'porte.php': '<?php ?>' } } }),
  'n’est pas un nom de fichier')

await refuse('un chemin dans le nom d’un fichier',
  () => demander('enregistrer', { projet: ESSAI, corps: { fichiers: { '../../porte.cpp': 'x' } } }),
  'n’est pas un nom de fichier')

await refuse('une capture qui n’est pas une image',
  () => demander('capture', { projet: ESSAI, corps: { png: 'data:image/png;base64,bm90IGEgcG5n' } }),
  'ce n’est pas un PNG')

await refuse('un projet qui n’existe pas',
  () => demander('ouvrir', { projet: 'jamais_vu_celui_la' }), 'n’existe pas')

await refuse('une demande inconnue',
  () => demander('formater'), 'n’est pas une demande connue')

/* Et rien de tout cela n'a écrit hors du dossier des projets. */
b.verifier('aucun fichier n’a été écrit hors de « projets/ »',
  !existsSync('porte.php') && !existsSync('porte.cpp') && !existsSync('../porte.cpp'))

const dedans = readdirSync(`${DOSSIER}/${ESSAI}`).sort()
b.verifier('et le dossier d’essai ne contient que ce qu’on y a mis',
  dedans.join(' ') === `capture.png ${ESSAI}.gb ${ESSAI}.gbc principal.cpp projet.json`, ` (${dedans.join(' ')})`)

/* ------------------------------------------------ on ne laisse rien */

const ote = await demander('supprimer', { projet: ESSAI, corps: {} })
b.verifier('supprimer efface le dossier, et le contrôle ne laisse rien derrière lui',
  ote.supprime === ESSAI && !existsSync(`${DOSSIER}/${ESSAI}`))

b.fin()

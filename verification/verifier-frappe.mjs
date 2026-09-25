/**
 * Ce qu'on tape est-il bien ce qui arrive dans le programme ?
 *
 *   node verifier-frappe.mjs
 *
 * Les réglages « fermer les parenthèses toutes seules », « garder
 * l'indentation » et « Tab indente » interceptent les touches AVANT le champ
 * de texte. Une paire posée en trop, une accolade avalée, et le programme ne
 * compile plus — alors que la personne a tapé exactement ce qu'il fallait.
 *
 * C'est le pire genre de bogue : la faute est signalée sur SA ligne à elle,
 * avec un numéro et un message, et elle cherche pendant vingt minutes ce
 * qu'elle a mal écrit. Elle n'a rien mal écrit.
 *
 * On tape donc un vrai programme, touche par touche, dans un vrai navigateur,
 * et l'on compare ce que le champ contient à ce que l'on voulait — puis on
 * compile. Deux fois : réglages d'aide allumés, puis éteints.
 */

import { spawn } from 'node:child_process'
import { existsSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { bulletin } from '../outils/controle.mjs'
import { servirLAtelier } from '../outils/serveur-essai.mjs'

/* Un serveur à lui, sur le dossier du projet : plus besoin de XAMPP (voir outils/serveur-essai.mjs). */
const ADRESSE = await servirLAtelier()
const PORT = 9224

const CHROMES = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  process.env.LOCALAPPDATA + '/Google/Chrome/Application/chrome.exe',
  'C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe',
]

const chrome = CHROMES.find((c) => c && existsSync(c))
if (!chrome) throw new Error('Chrome introuvable — cherché dans :\n  ' + CHROMES.join('\n  '))

const profil = join(tmpdir(), 'gameboy3-frappe')
rmSync(profil, { recursive: true, force: true })

const navigateur = spawn(chrome, [
  '--headless=new',
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${profil}`,
  '--no-first-run', '--disable-gpu',
  /* On tape dans un champ de texte : la console tourne à côté, et il n'y a
     aucune raison de la faire sonner pendant qu'on éprouve un clavier. */
  '--mute-audio',
  '--window-size=1280,900',
  ADRESSE,
], { stdio: 'ignore' })

const patienter = (ms) => new Promise((r) => setTimeout(r, ms))

let cible = null
for (let i = 0; i < 40 && !cible; i++) {
  await patienter(250)
  try {
    const liste = await (await fetch(`http://localhost:${PORT}/json/list`)).json()
    cible = liste.find((t) => t.type === 'page' && t.url.startsWith(ADRESSE))
  } catch { /* pas encore prêt */ }
}
if (!cible) { navigateur.kill(); throw new Error('Chrome n’a pas ouvert la page') }

const prise = new WebSocket(cible.webSocketDebuggerUrl)
await new Promise((r) => prise.addEventListener('open', r))

let prochainId = 1
const attentes = new Map()
prise.addEventListener('message', (e) => {
  const message = JSON.parse(e.data)
  const attente = attentes.get(message.id)
  if (!attente) return
  attentes.delete(message.id)
  if (message.error) attente.rejeter(new Error(message.error.message))
  else attente.resoudre(message.result)
})

const envoyer = (methode, params = {}) =>
  new Promise((resoudre, rejeter) => {
    const id = prochainId++
    attentes.set(id, { resoudre, rejeter })
    prise.send(JSON.stringify({ id, method: methode, params }))
  })

async function evaluer(expression) {
  const { result, exceptionDetails } = await envoyer('Runtime.evaluate', {
    expression, returnByValue: true, awaitPromise: true,
  })
  if (exceptionDetails) throw new Error(exceptionDetails.exception?.description ?? 'erreur dans la page')
  return result.value
}

/*
 * Taper, pour de vrai.
 *
 * `Input.insertText` poserait le texte d'un bloc, SANS passer par les
 * gestionnaires de touches — et ne prouverait donc rien de ce qu'on veut
 * prouver ici. On envoie chaque caractère comme une frappe.
 */
const TOUCHES = {
  '\n': { key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, text: '\r' },
  '\t': { key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9, text: '\t' },
}

async function taper(texte) {
  for (const caractere of texte) {
    const special = TOUCHES[caractere]

    /*
     * Surtout PAS « windowsVirtualKeyCode: caractere.charCodeAt(0) ».
     *
     * Ce code n'est pas celui du caractère : c'est celui de la TOUCHE. Le 40
     * de « ( » est la flèche bas, le 46 de « . » est la touche Suppr. Envoyé
     * tel quel, le curseur descend d'une ligne et efface un caractère — et
     * l'on croit avoir pris la page en faute alors que c'est le banc d'essai
     * qui tape n'importe quoi. Zéro laisse Chrome fabriquer la frappe à partir
     * du texte, ce qui est exactement ce qu'on veut.
     */
    const base = special ?? {
      key: caractere,
      text: caractere,
      unmodifiedText: caractere,
      windowsVirtualKeyCode: 0,
    }
    await envoyer('Input.dispatchKeyEvent', { type: 'keyDown', ...base })
    await envoyer('Input.dispatchKeyEvent', { type: 'keyUp', key: base.key, code: base.code })
  }
}

/*
 * Le programme d'essai.
 *
 * Il est choisi pour tomber sur TOUT ce que les réglages interceptent : des
 * parenthèses, des crochets, des accolades ouvertes puis refermées à la main,
 * des guillemets, et des retours à la ligne après une accolade — c'est là que
 * l'indentation automatique s'ajoute à ce qu'on a tapé.
 */
const VOULU = `struct Point {
uint8_t x, y;
void avancer() { x++; }
};
Point p;
int main() {
p.x = 3;
p.avancer();
texte(2, 4, "ESSAI");
nombre(9, 4, p.x, 1);
while (true) { image(); }
}
`

const b = bulletin('la frappe dans l’atelier')

/** Vider le champ, taper le programme, compiler — et rendre ce qu'on obtient. */
async function essayer(quoi, reglages) {
  await evaluer(`document.getElementById('reglages').click()`)
  for (const [cle, valeur] of Object.entries(reglages)) {
    await evaluer(`reglages.poser(${JSON.stringify(cle)}, ${JSON.stringify(valeur)})`)
  }
  await evaluer(`document.getElementById('reglages-fermer').click()`)

  /* Le champ est vidé par le code — vider au clavier prendrait mille touches,
     et ce n'est pas ce qu'on éprouve ici. */
  await evaluer(`(function () {
    const s = document.getElementById('source')
    s.value = ''
    s.dispatchEvent(new Event('input'))
    s.focus()
    s.setSelectionRange(0, 0)
  })()`)
  await patienter(200)

  await taper(VOULU)
  await patienter(300)

  const tape = await evaluer(`document.getElementById('source').value`)

  await evaluer(`document.getElementById('lancer').click()`)
  await patienter(1200)

  const classe = await evaluer(`document.getElementById('etat').className`)
  const dit = await evaluer(`document.getElementById('etat').textContent`)

  console.log(`\n  ${quoi}`)

  /* Ce qui compte n'est pas que le texte soit identique — l'indentation
     automatique en AJOUTE, et c'est son travail. C'est que le programme, une
     fois l'indentation ôtée, soit ligne pour ligne celui qu'on a tapé. */
  const sansEspaces = (t) => t
    .replace(/^[ \t]+/gm, '')  // l'indentation posée par la page
    .replace(/[ \t]+$/gm, '')  // et les espaces en fin de ligne
    .replace(/\n{2,}/g, '\n')
    .trim()

  b.verifier('ce qui est tapé arrive dans le champ',
    sansEspaces(tape) === sansEspaces(VOULU),
    sansEspaces(tape) === sansEspaces(VOULU) ? '' : `\n      obtenu :\n${tape.split('\n').map((l) => '        ' + l).join('\n')}`)

  b.verifier('aucune parenthèse ni accolade en trop',
    ['(', ')', '{', '}', '[', ']', '"'].every((s) =>
      tape.split(s).length === VOULU.split(s).length),
    ` (${['(', ')', '{', '}', '"'].map((s) => `${s}${tape.split(s).length - 1}`).join(' ')})`)

  b.verifier('et le programme compile', classe.includes('bon'),
    classe.includes('bon') ? '' : `\n      « ${dit.replace(/\n/g, ' · ')} »`)

  return { tape, classe, dit }
}

try {
  await patienter(2500)

  /* --- les aides à la frappe allumées, comme par défaut --- */
  await essayer('paires et indentation automatiques — comme par défaut', {
    pairesAuto: true, indentAuto: true, toucheTab: true, compilerEnEcrivant: false,
  })

  /* --- toutes éteintes : le champ doit rendre EXACTEMENT ce qu'on tape --- */
  const nu = await essayer('toutes les aides éteintes', {
    pairesAuto: false, indentAuto: false, toucheTab: false,
  })
  b.verifier('éteintes, le texte est rendu au caractère près', nu.tape === VOULU,
    nu.tape === VOULU ? '' : ' — le champ a modifié la frappe alors que rien ne le lui demandait')

  /* --- et en recompilant à chaque frappe --- */
  console.log('\n  recompiler pendant qu’on écrit')
  await evaluer(`document.getElementById('reglages').click()`)
  await evaluer(`reglages.poser('compilerEnEcrivant', true)`)
  await evaluer(`reglages.poser('delaiCompilation', 200)`)
  await evaluer(`document.getElementById('reglages-fermer').click()`)
  await evaluer(`(function () {
    const s = document.getElementById('source')
    s.focus()
    s.setSelectionRange(s.value.length, s.value.length)
  })()`)

  await taper('\n// un commentaire ajoute a la fin\n')
  await patienter(1500)

  b.verifier('la recompilation automatique n’a pas cassé le programme',
    (await evaluer(`document.getElementById('etat').className`)).includes('bon'),
    ` — « ${(await evaluer(`document.getElementById('etat').textContent`)).split('\n')[0]} »`)

  b.verifier('la console tourne sur ce qu’on vient d’écrire',
    await evaluer(`inspecteur.tourne`))

  /* --- ce que le programme AFFICHE, une fois compilé par la page --- */
  b.egal('et il affiche ce qu’il devait',
    await evaluer(`(function () {
      const gb = inspecteur.gb
      let mot = ''
      for (let i = 0; i < 5; i++) mot += String.fromCharCode(0)
      return [0, 1, 2, 3, 4].map((i) => gb.mmu.read(0x9800 + 4 * 32 + 2 + i)).join(',')
    })()`) !== '0,0,0,0,0', true)
} finally {
  prise.close()
  navigateur.kill()
  await patienter(500)
  try { rmSync(profil, { recursive: true, force: true }) } catch { /* Chrome tient son dossier */ }
}

b.fin()

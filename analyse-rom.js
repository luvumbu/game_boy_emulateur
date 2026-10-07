/**
 * Ce que la cartouche occupe : la ROM, la mémoire de travail, et ce qui pèse.
 *
 * Tout vient du compilateur, qui vient de tout poser : la taille du
 * programme, les octets de mémoire réservés, l'adresse de chaque fonction et
 * la taille de chaque tableau. Rien n'est estimé — on relit ce qui est fait.
 *
 * La page le montre en barres, et dit franchement quand on approche du
 * plafond : ce qui prend le plus de place, et quoi y faire.
 */

import { BIBLIOTHEQUES } from './compilateur/inclusion.js'

/** La cartouche fait 32 Ko : pas de changement de banc (voir LISEZMOI, « Ce qui manque »). */
export const ROM_TOTALE = 32 * 1024
/** La mémoire de travail laissée au programme : de $C100 à $DF00 — au-dessus, la pile. */
export const RAM_TOTALE = 0xdf00 - 0xc100

/**
 * L'analyse d'une compilation.
 *
 * `rendu` est ce que rend `compiler()` (ou la cartouche de `fabriquerLaCartouche`) :
 * octets, base, memoire, zones, etiquettes.
 */
export function analyser(rendu) {
  const romUtilisee = rendu.base + rendu.octets.length

  /*
   * La taille de chaque fonction : de son étiquette à la frontière suivante.
   *
   * Les étiquettes internes — « si_12 », « tantque_40 » — tombent AU MILIEU
   * d'une fonction : elles ne comptent pas comme frontières. Les autres
   * (les fonctions « fn_… », les routines de la console) en sont.
   */
  const frontieres = [...(rendu.etiquettes ?? new Map())]
    .filter(([nom]) => nom.startsWith('fn_') || !/_\d+$/.test(nom))
    .sort((a, b) => a[1] - b[1])
  const fonctions = []
  frontieres.forEach(([nom, debut], i) => {
    if (!nom.startsWith('fn_')) return
    const fin = frontieres[i + 1]?.[1] ?? rendu.octets.length
    fonctions.push({ nom: nom.slice(3) + '()', taille: fin - debut })
  })
  fonctions.sort((a, b) => b.taille - a.taille)

  const tableaux = [...(rendu.zones ?? new Map())]
    .map(([nom, zone]) => ({ nom, taille: zone.taille }))
    .sort((a, b) => b.taille - a.taille)

  /* Les petites variables vont dans la mémoire RAPIDE, de $FF80 à $FFFE :
     la mémoire de travail peut donc rester à zéro alors que le programme en a. */
  const hram = [...(rendu.variables ?? new Map()).values()].filter((adresse) => adresse >= 0xff80).length

  return {
    /* `base` : l'en-tête que toute cartouche porte avant la première instruction
       — le logo, le titre, les vecteurs. Même un programme vide le paie. */
    rom: { utilisee: romUtilisee, totale: ROM_TOTALE, entete: rendu.base },
    hram: { utilisee: hram, totale: 127 },
    ram: { utilisee: rendu.memoire ?? 0, totale: RAM_TOTALE },
    fonctions,
    tableaux,
    grave: rendu.grave ?? null,
  }
}

/**
 * Ce que le compilateur a gravé, nommé, en lignes de texte.
 *
 * C'est la liste des « #include » qu'un programme C écrirait à la main : ici
 * le compilateur les déduit des appels — texte() fait graver EcrireTexte —,
 * et il les montre, avec ce qu'il a laissé de côté.
 *
 *   Gravé dans la cartouche :
 *     main()          21 o  ← démarrage  — ta fonction
 *     EcrireTexte     10 o  ← texte()    — écrit un texte, lettre par lettre
 *   Lettres gravées : A
 *   Pas gravé (jamais appelé) : Diviser, Multiplier, …
 *
 * Puis chaque appel écrit dans le programme, avec ce qu'il coûte :
 *
 *   Fonctions du langage appelées :
 *     poser()   × 14   112 o sur place, dans main()
 *     texte()   ×  6    48 o sur place, dans main()  + EcrireTexte (10 o)
 *   Tes fonctions appelées :
 *     flammes() ×  1     3 o sur place, dans main()
 */
export function lignesGravees(grave) {
  if (!grave) return []
  return [...lignesDuGrave(grave), ...lignesDesAppels(grave.appels ?? [])]
}

/**
 * Les appels, en lignes : « sur place », ce que l'appel écrit là où il est
 * — poser() n'a rien d'autre —, et « + », la routine qu'il fait graver une
 * fois pour toutes, quel que soit le nombre d'appels.
 */
function lignesDesAppels(appels) {
  if (!appels.length) return []
  const largeur = Math.max(...appels.map((a) => a.nom.length))
  const chiffres = Math.max(...appels.map((a) => String(a.fois).length))
  const ligne = (a) => {
    const plus = a.routines.length ? '  + ' + a.routines.map((r) => `${r.nom} (${r.taille} o)`).join(', ') : ''
    return `  ${a.nom.padEnd(largeur)} × ${String(a.fois).padStart(chiffres)}  ${String(a.octets).padStart(4)} o sur place, dans ${a.dans.join(', ')}${plus}`
  }
  const duLangage = appels.filter((a) => a.langage)
  const tiennes = appels.filter((a) => !a.langage)
  const lignes = []
  if (duLangage.length) lignes.push('Fonctions du langage appelées :', ...duLangage.map(ligne))
  if (tiennes.length) lignes.push('Tes fonctions appelées :', ...tiennes.map(ligne))
  return lignes
}

function lignesDuGrave(grave) {
  const largeur = Math.max(...grave.elements.map((x) => x.nom.length))
  const lignes = ['Gravé dans la cartouche :']
  for (const x of grave.elements) {
    const par = x.appelePar.length ? `← ${x.appelePar.join(', ')}` : ''
    lignes.push(`  ${x.nom.padEnd(largeur)} ${String(x.taille).padStart(4)} o  ${par}${x.role ? `  — ${x.role}` : ''}`)
  }
  lignes.push(grave.lettres !== null
    ? `Lettres gravées : ${grave.lettres || 'aucune'}`
    : `Lettres gravées : toutes (${grave.policeEntiere})`)
  if (grave.ecartes.length) lignes.push(`Pas gravé (jamais appelé) : ${grave.ecartes.join(', ')}`)
  return lignes
}

/**
 * La même chose sur une ligne, pour un document qui en montre des centaines :
 *
 *   démarrage (88 o), main() (21 o), EcrireTexte (10 o, pour texte()), … ·
 *   lettres : A · pas gravé : Diviser, Multiplier, …
 */
export function resumeGrave(grave) {
  if (!grave) return ''
  const graves = grave.elements.map((x) => {
    const pourUnAppel = x.appelePar.filter((p) => p.endsWith('()') && !grave.elements.some((y) => y.nom === p))
    return `\`${x.nom}\` (${x.taille} o${pourUnAppel.length ? `, pour ${pourUnAppel.join(', ')}` : ''})`
  })
  const appels = (grave.appels ?? []).map((a) => `\`${a.nom}\` ×${a.fois} (${a.octets} o)`)
  return graves.join(', ') +
    (appels.length ? ` · appels : ${appels.join(', ')}` : '') +
    ` · lettres : ${grave.lettres !== null ? grave.lettres || 'aucune' : `toutes (${grave.policeEntiere})`}` +
    (grave.ecartes.length ? ` · pas gravé : ${grave.ecartes.join(', ')}` : '')
}

const enKo = (octets) => (octets >= 1024 ? `${(octets / 1024).toFixed(1).replace('.', ',')} Ko` : `${octets} o`)

/**
 * L'analyse, en barres et en listes, dans un élément de la page.
 *
 * `actions.inclure(nom, oui)`, si la page la donne, fait apparaître les
 * boutons « Inclure » : à elle d'écrire ou d'effacer la ligne, et de
 * recompiler.
 */
export function montrer(element, analyse, actions = {}) {
  element.textContent = ''

  const barre = (titre, { utilisee, totale }, detail) => {
    const part = Math.min(100, (utilisee / totale) * 100)
    const bloc = document.createElement('div')
    bloc.className = 'analyse-bloc'
    const tete = document.createElement('div')
    tete.className = 'analyse-tete'
    tete.innerHTML = `<b>${titre}</b><span>${enKo(utilisee)} sur ${enKo(totale)} — ${part.toFixed(0)} %</span>`
    const jauge = document.createElement('div')
    jauge.className = 'analyse-jauge' + (part >= 90 ? ' pleine' : part >= 70 ? ' chargee' : '')
    const rempli = document.createElement('i')
    rempli.style.width = `${Math.max(part, 0.5)}%`
    jauge.append(rempli)
    const dit = document.createElement('small')
    dit.className = 'aide'
    dit.textContent = detail
    bloc.append(tete, jauge, dit)
    element.append(bloc)
    return part
  }

  const partRom = barre('ROM — la cartouche', analyse.rom,
    `libre : ${enKo(analyse.rom.totale - analyse.rom.utilisee)} · ${analyse.rom.entete ? `l’en-tête obligatoire (${enKo(analyse.rom.entete)}), puis ` : ''}le code, les dessins, les textes et les tables gravées`)
  const partRam = barre('RAM — la mémoire de travail', analyse.ram,
    `libre : ${enKo(analyse.ram.totale - analyse.ram.utilisee)} · les tableaux, et les variables qui ne tiennent plus dans la mémoire rapide`)
  if (analyse.hram.utilisee) {
    barre('HRAM — la mémoire rapide', analyse.hram,
      `${analyse.hram.utilisee} variable${analyse.hram.utilisee > 1 ? 's' : ''} d’un octet, lues et écrites plus vite qu’ailleurs`)
  }

  const liste = (titre, elements) => {
    if (!elements.length) return
    const bloc = document.createElement('details')
    bloc.className = 'analyse-liste'
    const resume = document.createElement('summary')
    resume.textContent = titre
    bloc.append(resume)
    const ol = document.createElement('ol')
    for (const e of elements.slice(0, 6)) {
      const li = document.createElement('li')
      li.innerHTML = `<code>${e.nom}</code> <span class="aide">${enKo(e.taille)}</span>`
      ol.append(li)
    }
    bloc.append(ol)
    element.append(bloc)
  }
  /*
   * Les « #include » du programme, un par un : sert-il, et que coûte-t-il ?
   *
   * Chaque fonction de la console s'inclut par son nom. Une ligne qui ne sert
   * à rien ne grave rien — mais elle se voit ici, avec son bouton « Retirer ».
   * Ce que coûte une fonction employée : ce que ses appels écrivent sur place,
   * et les routines qu'elle fait graver une fois.
   */
  if (analyse.grave?.bibliotheques && Object.keys(analyse.grave.bibliotheques).length) {
    const bloc = document.createElement('details')
    bloc.className = 'analyse-liste'
    bloc.open = true
    const resume = document.createElement('summary')
    resume.textContent = 'Les #include du programme — ce que chacun coûte'
    const table = document.createElement('div')
    table.className = 'analyse-inclure'
    const cout = (nom) => {
      const appel = (analyse.grave.appels ?? []).find((a) => a.nom === `${nom}()`)
      if (!appel) return null
      return appel.octets + appel.routines.reduce((somme, r) => somme + r.taille, 0)
    }
    for (const [nom, b] of Object.entries(analyse.grave.bibliotheques)) {
      const ligne = document.createElement('div')
      const quoi = document.createElement('span')
      const code = document.createElement('code')
      code.textContent = `#include <${nom}>`
      const octets = cout(nom)
      const aide = document.createElement('span')
      aide.className = 'aide'
      aide.textContent = b.etat === 'emploi'
        ? ` ✔ employé${octets !== null ? ` — ${enKo(octets)}` : ''}`
        : ' ○ pas employé — ne grave rien : la ligne peut partir'
      quoi.append(code, aide)
      quoi.title = BIBLIOTHEQUES[nom] ?? ''
      ligne.append(quoi)
      if (actions.inclure) {
        const bouton = document.createElement('button')
        bouton.textContent = 'Retirer'
        bouton.title = b.etat === 'emploi'
          ? `efface « #include <${nom}> » : le programme ne compilera plus tant qu’il s’en sert`
          : `efface « #include <${nom}> », qui ne sert pas`
        bouton.addEventListener('click', () => actions.inclure(nom, false))
        ligne.append(bouton)
      }
      table.append(ligne)
    }
    bloc.append(resume, table)
    element.append(bloc)
  }

  /* Ce qui est gravé, nommé : ouvert d'office, c'est la première question
     qu'on se pose devant une barre de ROM. */
  if (analyse.grave) {
    const bloc = document.createElement('details')
    bloc.className = 'analyse-liste'
    bloc.open = true
    const resume = document.createElement('summary')
    resume.textContent = `Ce qui est gravé (${analyse.grave.elements.length} morceaux) — et ce qui ne l’est pas`
    const pre = document.createElement('pre')
    pre.className = 'analyse-grave'
    pre.textContent = lignesGravees(analyse.grave).join('\n')
    bloc.append(resume, pre)
    element.append(bloc)
  }

  liste('Ce qui pèse le plus dans la ROM', analyse.fonctions)
  liste('Ce qui pèse le plus dans la RAM', analyse.tableaux)

  /* Près du plafond : le dire, avec les coupables et des pistes. */
  const conseils = []
  if (partRom >= 90) {
    conseils.push(`La ROM est pleine à ${partRom.toFixed(0)} %. Le plus lourd : ` +
      analyse.fonctions.slice(0, 3).map((f) => `${f.nom} (${enKo(f.taille)})`).join(', ') +
      '. Pistes : une fonction pour un geste répété, une boucle plutôt que des lignes copiées, une table gravée plutôt que du code.')
  }
  if (partRam >= 90) {
    conseils.push(`La RAM est pleine à ${partRam.toFixed(0)} %. Le plus lourd : ` +
      analyse.tableaux.slice(0, 3).map((t) => `${t.nom} (${enKo(t.taille)})`).join(', ') +
      '. Piste : une donnée qui ne change jamais peut devenir « const » — gravée dans la ROM, elle ne coûte plus rien ici.')
  }
  for (const c of conseils) {
    const p = document.createElement('p')
    p.className = 'analyse-alerte'
    p.textContent = '⚠ ' + c
    element.append(p)
  }
}

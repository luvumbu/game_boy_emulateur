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

/** La cartouche fait 32 Ko : pas de changement de banc (voir LISEZMOI, « Ce qui manque »). */
export const ROM_TOTALE = 32 * 1024
/** La mémoire de travail laissée au programme : de $C100 à $DF00 — au-dessus, la pile. */
export const RAM_TOTALE = 0xdf00 - 0xc100

/**
 * L'analyse d'une compilation.
 *
 * `rendu` est ce que rend `compiler()` (ou une cartouche de `fabriquerLesCartouches`) :
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
    rom: { utilisee: romUtilisee, totale: ROM_TOTALE },
    hram: { utilisee: hram, totale: 127 },
    ram: { utilisee: rendu.memoire ?? 0, totale: RAM_TOTALE },
    fonctions,
    tableaux,
  }
}

const enKo = (octets) => (octets >= 1024 ? `${(octets / 1024).toFixed(1).replace('.', ',')} Ko` : `${octets} o`)

/** L'analyse, en barres et en listes, dans un élément de la page. */
export function montrer(element, analyse) {
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
    `libre : ${enKo(analyse.rom.totale - analyse.rom.utilisee)} · le code, les dessins, les textes et les tables gravées`)
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

/**
 * L'inspecteur : regarder DANS la console pendant qu'elle tourne.
 *
 * Cinq vues, relues quatre fois par seconde tant que le panneau est ouvert :
 *
 *   Mémoire     n'importe quelle adresse, de $0000 à $FFFF — en hexadécimal,
 *               en décimal, en binaire ou en texte
 *   Variables   chaque variable du programme, par son NOM, et sa valeur
 *   Registres   A F B C D E H L, SP, PC, les drapeaux, et l'état de l'écran
 *   Tuiles      la mémoire vidéo, dessinée : ce que la console a en magasin
 *   Lutins      la table des quarante lutins (l'OAM), telle qu'elle est
 *
 * On ne fait que LIRE. L'inspecteur ne change pas un octet : regarder une
 * console ne doit pas changer ce qu'elle fait.
 *
 * Et l'on peut PRENDRE : « 📸 Capturer les lutins à l'écran » (vue Lutins)
 * relit les personnages que la console montre — ceux de ton jeu, ou d'une
 * cartouche .gb ouverte —, et « ➕ Dans mes dessins » les range dans ton
 * programme (capturer-lutins.js). Dans la vue Tuiles, un clic sur une tuile
 * fait de même pour elle seule. C'est la page qui donne le nom et range le
 * dessin (« ajouterUnDessin »).
 */

import { capturerLesLutins, pixelsDUneTuile } from './capturer-lutins.js'

const hex = (n, chiffres = 2) => n.toString(16).toUpperCase().padStart(chiffres, '0')
const bin = (n) => n.toString(2).padStart(8, '0')

/** Les grandes régions de la carte mémoire de la Game Boy. */
const REGIONS = [
  ['ROM', 0x0000, 'la cartouche : le programme et ses données'],
  ['VRAM', 0x8000, 'la mémoire vidéo : les tuiles, puis les deux cartes'],
  ['WRAM', 0xc100, 'la mémoire de travail : les variables du programme'],
  ['OAM', 0xfe00, 'la table des quarante lutins'],
  ['I/O', 0xff00, 'les registres du matériel : écran, son, manette'],
  ['HRAM', 0xff80, 'la petite mémoire rapide'],
]

/** Les quatre nuances, pour dessiner la mémoire vidéo. */
const NUANCES = ['#e0f8d0', '#88c070', '#346856', '#081820']

/** Un dessin (rangées de chiffres 0 à 3) peint dans un petit canevas, 0 en damier : le transparent. */
function apercu(rangees, cote, zoom = 4) {
  const toile = document.createElement('canvas')
  toile.width = cote
  toile.height = cote
  toile.style.width = toile.style.height = cote * zoom + 'px'
  toile.style.imageRendering = 'pixelated'
  const ctx = toile.getContext('2d')
  rangees.forEach((r, y) => [...r].forEach((c, x) => {
    ctx.fillStyle = c === '0' ? ((x + y) % 2 ? '#ccc' : '#eee') : NUANCES[Number(c)]
    ctx.fillRect(x, y, 1, 1)
  }))
  return toile
}

/**
 * Capturer MAINTENANT les lutins à l'écran, et les montrer dans « prises » :
 * un aperçu par personnage, et « ➕ Dans mes dessins ». Servi par la vue
 * Lutins de l'inspecteur ET par le bouton « 📸 Capturer les lutins » sous la
 * console : les deux montrent la même chose.
 */
export function montrerLesCaptures(prises, laConsole, ajouterUnDessin, { dessins: dejaPris = null, ajouterTout = null } = {}) {
  const element = (balise, classe, texte) => {
    const e = document.createElement(balise)
    if (classe) e.className = classe
    if (texte !== undefined) e.textContent = texte
    return e
  }
  prises.textContent = ''
  prises.style.cssText = 'display:flex;flex-wrap:wrap;gap:10px;margin:8px 0'
  // « dejaPris » : une liste ramassée pendant le jeu (la capture continue) ; sinon, l'écran de maintenant
  const dessins = dejaPris ?? capturerLesLutins(laConsole)
  if (!dessins.length) {
    prises.append(element('p', 'aide', 'Aucun lutin à l’écran en ce moment. Mets le jeu là où le personnage se voit, puis recommence (la pause ⏸ aide).'))
    return
  }
  if (ajouterTout && dessins.length > 1) {
    const tout = element('button', 'petit principal', `➕ Tout dans mes dessins (${dessins.length})`)
    tout.type = 'button'
    tout.style.flexBasis = '100%'
    tout.addEventListener('click', () => ajouterTout(dessins))
    prises.append(tout)
  }
  dessins.forEach((d, k) => {
    const carte = element('div')
    carte.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:4px;padding:6px;border:1px solid var(--bord);border-radius:6px'
    const ajouter = element('button', 'petit', '➕ Dans mes dessins')
    ajouter.type = 'button'
    ajouter.addEventListener('click', () => ajouterUnDessin({ cote: d.cote, rangees: d.rangees, propose: (d.cote === 8 ? 'LUTIN' : 'PERSO') + (k + 1) }))
    carte.append(apercu(d.rangees, d.cote, d.cote === 32 ? 2 : 4),
      element('span', 'aide', `${d.cote} × ${d.cote} · ${d.lutins} lutin${d.lutins > 1 ? 's' : ''}${d.coupe ? ' · coupé à 32' : ''}`), ajouter)
    prises.append(carte)
  })
  prises.append(element('p', 'aide', 'Les dessins d’un jeu appartiennent à ses auteurs : capture-les pour apprendre et t’entraîner, pas pour publier le jeu d’un autre.'))
}

export function installer({ zone, gb, variables = () => new Map(), zones = () => new Map(), ajouterUnDessin = null }) {
  let vue = 'memoire'
  let adresse = 0xc100
  let format = 'hex'
  let minuteur = null

  const element = (balise, classe, texte) => {
    const e = document.createElement(balise)
    if (classe) e.className = classe
    if (texte !== undefined) e.textContent = texte
    return e
  }
  const lire = (a) => gb().mmu.read(a & 0xffff)
  const enFormat = (v) => format === 'dec' ? String(v).padStart(3, ' ')
    : format === 'bin' ? bin(v)
      : format === 'ascii' ? (v >= 32 && v < 127 ? String.fromCharCode(v) : '·')
        : hex(v)

  /* --- la charpente : les onglets, puis le contenu --- */
  zone.textContent = ''
  const onglets = element('div', 'inspecteur-onglets')
  const contenu = element('div', 'inspecteur-contenu')
  for (const [id, nom] of [['memoire', 'Mémoire'], ['variables', 'Variables'], ['registres', 'Registres'], ['tuiles', 'Tuiles (VRAM)'], ['lutins', 'Lutins (OAM)']]) {
    const b = element('button', 'petit', nom)
    b.type = 'button'
    b.dataset.vue = id
    b.addEventListener('click', () => { vue = id; construire() })
    onglets.append(b)
  }
  zone.append(onglets, contenu)

  /* --- chaque vue : une partie fixe (construire) et une partie vivante (rafraichir) --- */
  let rafraichir = () => {}

  function construire() {
    onglets.querySelectorAll('button').forEach((b) => b.classList.toggle('principal', b.dataset.vue === vue))
    contenu.textContent = ''

    if (vue === 'memoire') {
      const barre = element('div', 'rangee')
      const champ = element('input')
      champ.value = hex(adresse, 4)
      champ.size = 6
      champ.title = 'une adresse en hexadécimal, de 0000 à FFFF'
      champ.addEventListener('change', () => {
        const n = parseInt(champ.value, 16)
        if (!Number.isNaN(n)) adresse = n & 0xfff8
        champ.value = hex(adresse, 4)
        rafraichir()
      })
      barre.append(element('span', 'aide', '$'), champ)
      for (const [nom, debut, dit] of REGIONS) {
        const b = element('button', 'petit', nom)
        b.type = 'button'
        b.title = dit
        b.addEventListener('click', () => { adresse = debut; champ.value = hex(adresse, 4); rafraichir() })
        barre.append(b)
      }
      const choix = element('select')
      for (const [v, n] of [['hex', 'hexadécimal'], ['dec', 'décimal'], ['bin', 'binaire'], ['ascii', 'texte']]) {
        const o = element('option', '', n)
        o.value = v
        choix.append(o)
      }
      choix.value = format
      choix.addEventListener('change', () => { format = choix.value; rafraichir() })
      const plus = element('button', 'petit', '▼')
      plus.type = 'button'
      plus.title = '128 octets plus loin'
      plus.addEventListener('click', () => { adresse = (adresse + 128) & 0xffff; champ.value = hex(adresse, 4); rafraichir() })
      const moins = element('button', 'petit', '▲')
      moins.type = 'button'
      moins.title = '128 octets plus haut'
      moins.addEventListener('click', () => { adresse = (adresse - 128) & 0xffff; champ.value = hex(adresse, 4); rafraichir() })
      barre.append(choix, moins, plus)
      const table = element('pre', 'inspecteur-memoire')
      contenu.append(barre, table)
      rafraichir = () => {
        const largeur = format === 'bin' ? 4 : 8
        const lignes = []
        for (let l = 0; l < 128 / largeur; l++) {
          const debut = (adresse + l * largeur) & 0xffff
          const octets = Array.from({ length: largeur }, (_, i) => enFormat(lire(debut + i)))
          lignes.push(`${hex(debut, 4)}  ${octets.join(format === 'ascii' ? '' : ' ')}`)
        }
        table.textContent = lignes.join('\n')
      }
    }

    if (vue === 'variables') {
      const table = element('table', 'inspecteur-table')
      contenu.append(table)
      rafraichir = () => {
        const lignes = [...variables()].sort((a, b) => a[1] - b[1])
        const tableaux = [...zones()]
        table.innerHTML = '<tr><th>nom</th><th>adresse</th><th>déc.</th><th>hex.</th><th>binaire</th></tr>'
        if (!lignes.length && !tableaux.length) {
          table.innerHTML += '<tr><td colspan="5" class="aide">Compile un programme : ses variables apparaîtront ici.</td></tr>'
        }
        for (const [nom, a] of lignes) {
          const v = lire(a)
          const tr = element('tr')
          tr.innerHTML = `<td><code>${nom}</code></td><td>$${hex(a, 4)}</td><td>${v}</td><td>$${hex(v)}</td><td>${bin(v)}</td>`
          table.append(tr)
        }
        for (const [nom, z] of tableaux) {
          const debut = Array.from({ length: Math.min(z.taille, 12) }, (_, i) => lire(z.base + i)).join(', ')
          const tr = element('tr')
          tr.innerHTML = `<td><code>${nom}[]</code></td><td>$${hex(z.base, 4)}</td><td colspan="3">${z.taille} octets : ${debut}${z.taille > 12 ? '…' : ''}</td>`
          table.append(tr)
        }
      }
    }

    if (vue === 'registres') {
      const table = element('table', 'inspecteur-table')
      contenu.append(table)
      rafraichir = () => {
        const cpu = gb().cpu
        const f = cpu.f
        const ligne = (nom, valeur, dit) => `<tr><td><b>${nom}</b></td><td>${valeur}</td><td class="aide">${dit}</td></tr>`
        table.innerHTML =
          ligne('A', `$${hex(cpu.a)} · ${cpu.a}`, 'l’accumulateur : les calculs passent par lui') +
          ligne('F', `${f & 0x80 ? 'Z' : '-'}${f & 0x40 ? 'N' : '-'}${f & 0x20 ? 'H' : '-'}${f & 0x10 ? 'C' : '-'}`, 'les drapeaux : Zéro, Soustraction, demi-retenue, retenue (Carry)') +
          ligne('BC', `$${hex(cpu.b)}${hex(cpu.c)}`, 'une paire : compteurs, longueurs') +
          ligne('DE', `$${hex(cpu.d)}${hex(cpu.e)}`, 'une paire : souvent une adresse source') +
          ligne('HL', `$${hex(cpu.h)}${hex(cpu.l)}`, 'la paire qui désigne une case mémoire') +
          ligne('SP', `$${hex(cpu.sp, 4)}`, 'le sommet de la pile') +
          ligne('PC', `$${hex(cpu.pc, 4)}`, 'l’adresse de la prochaine instruction') +
          ligne('IME', cpu.ime ? 'oui' : 'non', 'les interruptions sont-elles permises ?') +
          ligne('HALT', cpu.halted ? 'oui' : 'non', 'le processeur dort-il (il attend l’image suivante) ?') +
          ligne('LY', `${lire(0xff44)}`, 'la ligne que l’écran dessine (144 et plus : le VBlank)') +
          ligne('LCDC', bin(lire(0xff40)), 'le réglage de l’écran : bit 7 = allumé')
      }
    }

    if (vue === 'tuiles') {
      const toile = element('canvas', 'inspecteur-tuiles')
      toile.width = 128
      toile.height = 192
      const dit = element('p', 'aide', 'Les 384 tuiles de la mémoire vidéo ($8000–$97FF), seize par rangée — en nuances brutes, avant palette.'
        + (ajouterUnDessin ? ' Clique une tuile pour la mettre dans tes dessins.' : ''))
      contenu.append(dit, toile)
      if (ajouterUnDessin) {
        toile.style.cursor = 'copy'
        toile.title = 'clique une tuile : elle va dans tes dessins'
        toile.addEventListener('click', (e) => {
          const boite = toile.getBoundingClientRect()
          const tx = Math.floor((e.clientX - boite.left) / boite.width * 16)
          const ty = Math.floor((e.clientY - boite.top) / boite.height * 24)
          const numero = ty * 16 + tx
          const rangees = pixelsDUneTuile(gb().ppu.vram, numero).map((r) => r.join(''))
          ajouterUnDessin({ cote: 8, rangees, propose: 'TUILE' + numero })
        })
      }
      const ctx = toile.getContext('2d')
      rafraichir = () => {
        const vram = gb().ppu.vram
        const image = ctx.createImageData(128, 192)
        for (let t = 0; t < 384; t++) {
          for (let y = 0; y < 8; y++) {
            const bas = vram[t * 16 + y * 2]
            const haut = vram[t * 16 + y * 2 + 1]
            for (let x = 0; x < 8; x++) {
              const bit = 7 - x
              const n = ((haut >> bit) & 1) << 1 | ((bas >> bit) & 1)
              const px = ((t >> 4) * 8 + y) * 128 + (t & 15) * 8 + x
              const c = NUANCES[n]
              image.data[px * 4] = parseInt(c.slice(1, 3), 16)
              image.data[px * 4 + 1] = parseInt(c.slice(3, 5), 16)
              image.data[px * 4 + 2] = parseInt(c.slice(5, 7), 16)
              image.data[px * 4 + 3] = 255
            }
          }
        }
        ctx.putImageData(image, 0, 0)
      }
    }

    if (vue === 'lutins') {
      const table = element('table', 'inspecteur-table')
      if (ajouterUnDessin) {
        /* Capturer : les personnages à l'écran, MAINTENANT (le jeu peut être en
           pause, ou tourner : on prend l'image du moment). */
        const barre = element('div', 'rangee')
        const bouton = element('button', 'petit', '📸 Capturer les lutins à l’écran')
        bouton.type = 'button'
        bouton.title = 'relit les personnages que la console montre en ce moment, et propose de les mettre dans tes dessins'
        const prises = element('div', 'inspecteur-captures')
        bouton.addEventListener('click', () => montrerLesCaptures(prises, gb(), ajouterUnDessin))
        barre.append(bouton)
        contenu.append(barre, prises)
      }
      contenu.append(table)
      rafraichir = () => {
        const oam = gb().ppu.oam
        let html = '<tr><th>n°</th><th>x</th><th>y</th><th>tuile</th><th>options</th></tr>'
        let visibles = 0
        for (let n = 0; n < 40; n++) {
          const y = oam[n * 4] - 16
          const x = oam[n * 4 + 1] - 8
          if (oam[n * 4] === 0 || oam[n * 4] >= 160) continue // hors de l'écran : caché
          visibles++
          const o = oam[n * 4 + 3]
          const options = [o & 0x20 ? 'miroir X' : '', o & 0x40 ? 'miroir Y' : '', o & 0x80 ? 'derrière' : '', o & 0x10 ? 'palette 1' : '', `pal. couleur ${o & 7}`].filter(Boolean).join(', ')
          html += `<tr><td>${n}</td><td>${x}</td><td>${y}</td><td>${oam[n * 4 + 2]}</td><td>${options}</td></tr>`
        }
        if (!visibles) html += '<tr><td colspan="5" class="aide">Aucun lutin à l’écran.</td></tr>'
        table.innerHTML = html
      }
    }

    rafraichir()
  }

  construire()

  return {
    /* Relire en continu tant que le panneau est ouvert, et s'arrêter sinon. */
    suivre(ouvert) {
      clearInterval(minuteur)
      minuteur = ouvert ? setInterval(() => rafraichir(), 250) : null
      if (ouvert) rafraichir()
    },
    rafraichir: () => rafraichir(),
  }
}

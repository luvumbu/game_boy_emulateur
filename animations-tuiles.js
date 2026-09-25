/**
 * Les tuiles animées : l'eau qui ondule, le feu qui danse, l'herbe qui plie.
 *
 * La Game Boy ne sait pas « animer une tuile » : elle affiche ce qu'il y a en
 * mémoire vidéo. Un jeu anime donc son décor en RÉÉCRIVANT le dessin d'une
 * tuile, à intervalles réguliers — et toutes les cases qui la montrent changent
 * d'un coup, sans qu'on repose une seule case. C'est ce que fait
 * `changerDessin(tuile, dessin)`.
 *
 * L'atelier écrit, dans le programme, UNE fonction qui s'en charge :
 *
 *   /* animation EAU : EAU EAU2 EAU3 / 16 *\/      ← ce que l'atelier relit
 *   void animerLesTuiles() {
 *     uint8_t i_EAU = (images() / 16) % 3;
 *     if (i_EAU == 0) changerDessin(EAU, EAU);
 *     …
 *   }
 *
 * et l'appelle juste après le premier `image();` de `main`. Les marques sont
 * la seule vérité : effacer la fonction à la main, c'est arrêter l'animation.
 */

const SAUT = '\n'
const DEBUT = '/* --- Les tuiles animées (écrit par l’atelier des tuiles) --- */'
const FIN = '/* --- fin des tuiles animées --- */'
const MARQUE = /^[ \t]*\/\* animation (\w+) : ([\w ]+?) \/ (\d+) \*\/[ \t]*\r?$/gm
const APPEL = 'animerLesTuiles();'

/** Les vitesses proposées : le nombre d'images (1/60 s) que dure chaque dessin. */
export const VITESSES = [
  { nom: 'rapide', images: 8 },
  { nom: 'moyenne', images: 16 },
  { nom: 'lente', images: 32 },
]

/** Les animations écrites dans le programme : [{ nom, images: ['EAU', 'EAU2'], vitesse }]. */
export function lireAnimations(source) {
  const liste = []
  for (const m of source.matchAll(MARQUE)) {
    liste.push({ nom: m[1], images: m[2].trim().split(/\s+/), vitesse: Number(m[3]) })
  }
  return liste
}

/** L'animation dont cette tuile fait partie (comme tuile animée, ou comme l'une de ses images). */
export function animationDe(source, nom) {
  const liste = lireAnimations(source)
  return liste.find((a) => a.nom === nom) ?? liste.find((a) => a.images.includes(nom)) ?? null
}

function fonctionDesAnimations(liste) {
  const lignes = [DEBUT]
  for (const a of liste) lignes.push(`/* animation ${a.nom} : ${a.images.join(' ')} / ${a.vitesse} */`)
  lignes.push('void animerLesTuiles() {')
  for (const a of liste) {
    const i = `i_${a.nom}`
    lignes.push(`  uint8_t ${i} = (images() / ${a.vitesse}) % ${a.images.length};`)
    a.images.forEach((image, k) => lignes.push(`  if (${i} == ${k}) changerDessin(${a.nom}, ${image});`))
  }
  lignes.push('}')
  lignes.push(FIN)
  return lignes.join(SAUT)
}

/**
 * Réécrit les animations : la fonction, et son appel dans `main`.
 * Une liste vide retire les deux — le programme redevient ce qu'il était.
 */
export function ecrireAnimations(source, liste) {
  const crlf = source.includes('\r\n')
  let s = source.replace(/\r\n/g, '\n')
  const d = s.indexOf(DEBUT)
  if (d >= 0) {
    const f = s.indexOf(FIN, d)
    s = s.slice(0, d) + s.slice(f < 0 ? d : f + FIN.length).replace(/^\n+/, '')
  }
  /* L'appel, avec sa ligne. */
  s = s.replace(/^[ \t]*animerLesTuiles\(\);[^\n]*\n/m, '')

  const gardees = liste.filter((a) => a.images.length >= 2)
  if (gardees.length) {
    const main = s.search(/^\s*int\s+main\s*\(/m)
    const ou = main < 0 ? s.length : main
    const avant = s.slice(0, ou).replace(/\n*$/, '\n\n')
    s = avant + fonctionDesAnimations(gardees) + '\n\n' + s.slice(ou).replace(/^\n+/, '')
    /* L'appel : juste après le premier « image(); » de main. */
    const debutMain = s.search(/^\s*int\s+main\s*\(/m)
    if (debutMain >= 0) {
      const motif = /^([ \t]*)image\(\);[^\n]*$/m
      const reste = s.slice(debutMain)
      const m = reste.match(motif)
      if (m) {
        const fin = debutMain + m.index + m[0].length
        s = s.slice(0, fin) + `\n${m[1]}${APPEL}   // les tuiles animées (l’atelier des tuiles)` + s.slice(fin)
      }
    }
  }
  return crlf ? s.replace(/\n/g, '\r\n') : s
}

/** Le programme appelle-t-il bien l'animation ? (sans « image(); » dans main, rien ne bouge) */
export function animationAppelee(source) {
  return source.includes(APPEL)
}

/* ------------------------------------------------ fabriquer les images */

const decaler = (n, dx, dy) => n.map((_, y) => n[0].map((__, x) => n[(y - dy + 8 * 8) % 8][(x - dx + 8 * 8) % 8]))
const miroir = (n) => n.map((l) => [...l].reverse())

/**
 * Des animations toutes prêtes, fabriquées à partir du dessin qu'on a :
 * chacune rend les images EN PLUS de la tuile elle-même, et l'ordre où les
 * montrer (0 : la tuile d'origine, 1 : la première image fabriquée…).
 */
export const MODELES_D_ANIMATION = {
  eau: {
    nom: '🌊 Eau (vague)',
    dit: 'le dessin glisse d’un pixel à la fois, et revient : une vague qui ne s’arrête pas',
    vitesse: 16,
    fabriquer: (n) => ({ images: [decaler(n, 2, 0), decaler(n, 4, 0), decaler(n, 6, 0)], ordre: [0, 1, 2, 3] }),
  },
  feu: {
    nom: '🔥 Feu (flamme)',
    dit: 'la flamme se retourne et monte d’un pixel : elle danse',
    vitesse: 8,
    fabriquer: (n) => ({ images: [miroir(n), decaler(n, 0, -1)], ordre: [0, 1, 2, 1] }),
  },
  herbe: {
    nom: '🌿 Herbe (vent)',
    dit: 'le haut de l’herbe penche à droite, puis à gauche',
    vitesse: 32,
    fabriquer: (n) => {
      const pencher = (dx) => n.map((l, y) => (y < 4 ? l.map((_, x) => l[(x - dx + 8) % 8]) : [...l]))
      return { images: [pencher(1), pencher(-1)], ordre: [0, 1, 0, 2] }
    },
  },
  clignoter: {
    nom: '✨ Clignoter',
    dit: 'le dessin s’allume et s’éteint : un trésor, une alarme',
    vitesse: 16,
    fabriquer: (n) => ({ images: [n.map((l) => l.map(() => 0))], ordre: [0, 1] }),
  },
}

/* ------------------------------------------------ la police personnalisée */

/*
 * Une lettre redessinée : `changerDessin("A", MON_A);` au début de main. Chaque
 * lettre de la police est une tuile ; la réécrire change TOUS les textes où
 * elle paraît. L'atelier écrit ces lignes, avec leur marque, et les relit.
 */
const MARQUE_POLICE = /^[ \t]*changerDessin\("(.)", (\w+)\);[ \t]*\/\/ la police[^\n]*\n?/gm

/** Les lettres redessinées : [{ lettre: 'A', nom: 'MON_A' }]. */
export function lirePolice(source) {
  return [...source.matchAll(MARQUE_POLICE)].map((m) => ({ lettre: m[1], nom: m[2] }))
}

/** Réécrit les lettres redessinées, juste après « int main() { ». */
export function ecrirePolice(source, liste) {
  const crlf = source.includes('\r\n')
  let s = source.replace(/\r\n/g, '\n').replace(MARQUE_POLICE, '')
  const m = s.match(/^([ \t]*)int\s+main\s*\([^)]*\)\s*\{[^\n]*\n/m)
  if (m && liste.length) {
    const fin = m.index + m[0].length
    const lignes = liste.map(({ lettre, nom }) => `  changerDessin("${lettre}", ${nom});   // la police : la lettre ${lettre} prend le dessin de ${nom}\n`).join('')
    s = s.slice(0, fin) + lignes + s.slice(fin)
  }
  return crlf ? s.replace(/\n/g, '\r\n') : s
}

/** Les lettres que la police connaît. */
export const LETTRES_DE_LA_POLICE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!?.-:#|'

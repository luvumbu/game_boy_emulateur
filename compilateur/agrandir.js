/*
 * AGRANDIR UN DESSIN — on le dessine une fois, en petit, et l'on choisit
 * ensuite sa taille.
 *
 * Servi à deux endroits :
 *   - l'atelier des tuiles, bouton « 📐 Agrandir… » (editeur-tuiles.js), qui
 *     en fait une copie ;
 *   - le compilateur, pour spriteTaille(numero, x, y, DESSIN, taille) : le
 *     dessin reste UNIQUE dans le programme, et la forme agrandie est calculée
 *     à chaque compilation (emetteur.js).
 *
 * La console ne sait pas agrandir pendant que le jeu tourne : c'est donc ici,
 * avant, que la forme est redessinée.
 */

/*
 * Agrandir un dessin à n'importe quelle taille, en retrouvant sa FORME.
 *
 *  1. On fait le tour de la silhouette (tout ce qui n'est pas le vide) : une
 *     suite de petits côtés d'un pixel, regroupés en traits droits.
 *  2. Un VRAI coin — deux traits d'au moins 2 pixels, dont l'un d'au moins 3, qui
 *     se rencontrent — reste pointu, et les traits qui le touchent restent
 *     droits : un carré reste carré. Un trait entre deux marches, lui, fait
 *     partie d'une courbe : le haut d'un rond.
 *  3. Les MARCHES (des traits d'un pixel) sont arrondies : on coupe les coins,
 *     trois fois de suite (l'algorithme de Chaikin). Un rond redevient rond.
 *  4. On redessine la forme à la taille voulue, avec un contour d'un pixel, et
 *     l'intérieur pris aux nuances du dessin d'origine.
 *
 * Rend « taille » rangées de « taille » signes, dans l'alphabet « signes »
 * (« .-+# » ou « 0123 ») ; « nuance(signe) » dit la nuance d'un signe, 0 le vide.
 *
 * « fenetre » ({ x, y, largeur, hauteur }, en pixels de la forme agrandie) ne
 * fait calculer QUE ce morceau-là : une forme plus grande que l'écran ne coûte
 * que ce qu'on en voit. Les pixels hors de la forme y sont vides.
 */
export function agrandirForme(rangees, taille, nuance, signes, fenetre = { x: 0, y: 0, largeur: taille, hauteur: taille }) {
  const n = rangees.length
  const plein = rangees.map((r) => [...r].map((s) => nuance(s) !== 0))
  const p = (x, y) => x >= 0 && y >= 0 && x < n && y < n && plein[y][x]

  /* 1. Les petits côtés, le plein toujours à droite (on tourne dans le sens des aiguilles). */
  const cotes = []
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    if (!plein[y][x]) continue
    if (!p(x, y - 1)) cotes.push([x, y, x + 1, y])
    if (!p(x + 1, y)) cotes.push([x + 1, y, x + 1, y + 1])
    if (!p(x, y + 1)) cotes.push([x + 1, y + 1, x, y + 1])
    if (!p(x - 1, y)) cotes.push([x, y + 1, x, y])
  }
  const partant = new Map()
  for (const c of cotes) { const k = c[0] + ',' + c[1]; if (!partant.has(k)) partant.set(k, []); partant.get(k).push(c) }
  const pris = new Set()
  const boucles = []
  for (const depart of cotes) {
    if (pris.has(depart)) continue
    const boucle = []
    let c = depart
    while (c && !pris.has(c)) {
      pris.add(c); boucle.push(c)
      const choix = (partant.get(c[2] + ',' + c[3]) ?? []).filter((d) => !pris.has(d))
      if (choix.length > 1) {
        // deux chemins (deux pixels qui se touchent par un coin) : on tourne à droite
        const dx = c[2] - c[0], dy = c[3] - c[1]
        c = choix.find((d) => d[2] - d[0] === -dy && d[3] - d[1] === dx) ?? choix[0]
      } else c = choix[0]
    }
    boucles.push(boucle)
  }

  /* 2. Les traits droits, puis les points du contour : les vrais coins restent pointus. */
  const polygones = boucles.map((boucle) => {
    const traits = []
    for (const c of boucle) {
      const dx = c[2] - c[0], dy = c[3] - c[1]
      const dernier = traits[traits.length - 1]
      if (dernier && dernier.dx === dx && dernier.dy === dy) { dernier.x2 = c[2]; dernier.y2 = c[3]; dernier.l++ }
      else traits.push({ x1: c[0], y1: c[1], x2: c[2], y2: c[3], dx, dy, l: 1 })
    }
    // le premier et le dernier trait peuvent être le même, coupé en deux
    if (traits.length > 1) { const a = traits[0], z = traits[traits.length - 1]
      if (a.dx === z.dx && a.dy === z.dy) { a.x1 = z.x1; a.y1 = z.y1; a.l += z.l; traits.pop() } }
    // un vrai coin : deux traits d'au moins 2 pixels, dont l'un d'au moins 3
    const coin = traits.map((t, i) => { const a = traits[(i - 1 + traits.length) % traits.length]
      return a.l >= 2 && t.l >= 2 && Math.max(a.l, t.l) >= 3 })
    const points = []
    traits.forEach((t, i) => {
      const finCoin = coin[(i + 1) % traits.length]
      if (coin[i]) points.push({ x: t.x1, y: t.y1, pointu: true })
      if (t.l >= 2 && (coin[i] || finCoin)) {
        // un trait qui touche un vrai coin reste droit
        points.push({ x: t.x1 + t.dx * 0.5, y: t.y1 + t.dy * 0.5, pointu: false })
        points.push({ x: t.x2 - t.dx * 0.5, y: t.y2 - t.dy * 0.5, pointu: false })
      } else points.push({ x: (t.x1 + t.x2) / 2, y: (t.y1 + t.y2) / 2, pointu: false })   // entre deux marches : une courbe
    })
    /* 3. Arrondir : chaque point qui n'est pas un coin est coupé en deux, trois fois. */
    let pts = points
    for (let tour = 0; tour < 3; tour++) {
      const suite = []
      pts.forEach((q, i) => {
        if (q.pointu) { suite.push(q); return }
        const a = pts[(i - 1 + pts.length) % pts.length], b = pts[(i + 1) % pts.length]
        suite.push({ x: q.x + (a.x - q.x) * 0.25, y: q.y + (a.y - q.y) * 0.25, pointu: false })
        suite.push({ x: q.x + (b.x - q.x) * 0.25, y: q.y + (b.y - q.y) * 0.25, pointu: false })
      })
      pts = suite
    }
    return pts
  })

  /* 4. Redessiner : un pixel est plein si son centre est dans la forme (pair-impair, pour les trous). */
  const dansLaForme = (x, y) => {
    let d = false
    for (const pts of polygones) for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const a = pts[i], b = pts[j]
      if ((a.y > y) !== (b.y > y) && x < (b.x - a.x) * (y - a.y) / (b.y - a.y) + a.x) d = !d
    }
    return d
  }
  const k = n / taille
  // chaque pixel n'est calculé qu'une fois, et seulement s'il sert
  const vus = new Map()
  const base = (X, Y) => {
    if (X < 0 || Y < 0 || X >= taille || Y >= taille) return false
    const cle = Y * taille + X
    if (!vus.has(cle)) vus.set(cle, dansLaForme((X + 0.5) * k, (Y + 0.5) * k))
    return vus.get(cle)
  }
  /* Un dessin symétrique (gauche-droite, haut-bas) le reste : un pixel posé
     pile sur la limite de la forme tomberait sinon d'un côté seulement. */
  const symetriqueX = plein.every((l) => l.every((v, x) => v === l[n - 1 - x]))
  const symetriqueY = plein.every((l, y) => l.every((v, x) => v === plein[n - 1 - y][x]))
  const f = (X, Y) => {
    if (X < 0 || Y < 0 || X >= taille || Y >= taille) return false
    const mx = taille - 1 - X, my = taille - 1 - Y
    return base(X, Y) || (symetriqueX && base(mx, Y)) || (symetriqueY && (base(X, my) || (symetriqueX && base(mx, my))))
  }

  // les nuances : celle du contour d'origine, et celles de l'intérieur
  const auBord = (x, y) => !p(x - 1, y) || !p(x + 1, y) || !p(x, y - 1) || !p(x, y + 1)
  const compte = {}
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (plein[y][x] && auBord(x, y)) compte[rangees[y][x]] = (compte[rangees[y][x]] ?? 0) + 1
  const signeDuContour = Object.entries(compte).sort((a, b) => b[1] - a[1])[0]?.[0] ?? signes[3]
  /* L'intérieur prend la nuance du pixel d'origine le plus proche qui est À
     L'INTÉRIEUR de la forme (pas sur son bord) — quelle que soit sa nuance :
     les yeux, la bouche, un trait noir au milieu restent. Un dessin si fin
     qu'il n'a pas d'intérieur (un anneau d'un pixel) prend à défaut les pixels
     qui ne sont pas de la nuance du contour. */
  let dedans = []
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (plein[y][x] && !auBord(x, y)) dedans.push([x, y])
  if (!dedans.length) {
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (plein[y][x] && rangees[y][x] !== signeDuContour) dedans.push([x, y])
  }

  const sortie = Array.from({ length: fenetre.hauteur }, () => Array(fenetre.largeur).fill(signes[0]))
  for (let fy = 0; fy < fenetre.hauteur; fy++) for (let fx = 0; fx < fenetre.largeur; fx++) {
    const X = fenetre.x + fx, Y = fenetre.y + fy
    if (!f(X, Y)) continue
    let s = signeDuContour
    if (f(X - 1, Y) && f(X + 1, Y) && f(X, Y - 1) && f(X, Y + 1) && dedans.length) {
      const u = (X + 0.5) * k - 0.5, v = (Y + 0.5) * k - 0.5
      let mieux = Infinity
      for (const [x, y] of dedans) { const d = (x - u) ** 2 + (y - v) ** 2; if (d < mieux) { mieux = d; s = rangees[y][x] } }
    }
    sortie[fy][fx] = s
  }
  return sortie.map((r) => r.join(''))
}

/**
 * La même forme, posée au milieu d'un dessin que la console connaît : 8, 16
 * ou 32 de côté (le bouton « 📐 Agrandir… » de l'atelier). Le reste est vide.
 */
export function agrandirLisse(rangees, taille, nuance, signes) {
  const forme = agrandirForme(rangees, taille, nuance, signes)
  const cote = taille <= 8 ? 8 : taille <= 16 ? 16 : 32
  const marge = Math.floor((cote - taille) / 2)
  const vide = signes[0].repeat(cote)
  const sortie = Array.from({ length: cote }, () => vide)
  forme.forEach((r, y) => { sortie[marge + y] = signes[0].repeat(marge) + r + signes[0].repeat(cote - marge - taille) })
  return { cote, rangees: sortie }
}

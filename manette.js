/**
 * Jouer autrement qu'au clavier : une vraie manette, ou l'écran tactile.
 *
 * Deux fonctions, et rien d'autre : l'atelier s'en sert, et la page exportée
 * les EMBARQUE telles quelles (« exporter-html.js » recopie leur texte avec
 * `toString()`). Elles ne doivent donc rien importer ni rien nommer hors
 * d'elles-mêmes — c'est pourquoi tout ce dont elles ont besoin est dedans.
 */

/**
 * Les manettes branchées (USB ou Bluetooth), relues à chaque image.
 *
 * Le navigateur ne prévient pas quand un bouton change : il faut regarder.
 * On ne transmet à la console QUE les changements — sinon une manette posée
 * sur la table « relâcherait » à chaque image les touches tenues au clavier.
 *
 * La disposition « standard » du navigateur : 0 = bouton du bas (A), 1 = celui
 * de droite (B), 8 = Select, 9 = Start, 12 à 15 = la croix ; le stick gauche
 * compte comme la croix au-delà de la moitié de sa course.
 */
export function suivreLesManettes(gb, estActif = () => true) {
  if (typeof navigator === 'undefined' || !navigator.getGamepads) return
  const avant = {}

  const regarder = () => {
    requestAnimationFrame(regarder)
    const maintenant = { up: false, down: false, left: false, right: false, a: false, b: false, start: false, select: false }

    for (const manette of navigator.getGamepads()) {
      if (!manette) continue
      const appuye = (n) => Boolean(manette.buttons[n]?.pressed)
      const x = manette.axes[0] ?? 0
      const y = manette.axes[1] ?? 0
      maintenant.a ||= appuye(0)
      maintenant.b ||= appuye(1) || appuye(2)
      maintenant.select ||= appuye(8)
      maintenant.start ||= appuye(9)
      maintenant.up ||= appuye(12) || y < -0.5
      maintenant.down ||= appuye(13) || y > 0.5
      maintenant.left ||= appuye(14) || x < -0.5
      maintenant.right ||= appuye(15) || x > 0.5
    }

    if (!estActif()) return
    for (const bouton in maintenant) {
      if (maintenant[bouton] !== Boolean(avant[bouton])) {
        gb.setButton(bouton, maintenant[bouton])
        avant[bouton] = maintenant[bouton]
      }
    }
  }
  requestAnimationFrame(regarder)
}

/**
 * Une manette dessinée, pour les écrans tactiles : la croix, A, B, Start,
 * Select.
 *
 * Chaque doigt est suivi à part (« pointerId ») : on tient DROITE d'un pouce
 * et l'on saute avec A de l'autre, comme sur la console. Un doigt qui glisse
 * d'un bouton à l'autre de la croix change de direction sans se relever.
 */
export function installerLaManetteTactile(conteneur, gb) {
  const style = document.createElement('style')
  style.textContent = `
    .gb-tactile { display: flex; flex-wrap: wrap; justify-content: space-around; align-items: center; gap: 10px; box-sizing: border-box; padding: 0 6px;
      width: 100%; max-width: 380px; margin: 8px auto 0; user-select: none; -webkit-user-select: none;
      touch-action: none; }
    .gb-tactile button { border: none; border-radius: 50%; background: #3b3f4a; color: #eee;
      font: 700 18px system-ui, sans-serif; touch-action: none; }
    .gb-tactile button.presse { background: #9bbc5a; color: #14161b; }
    .gb-croix { display: grid; grid-template-columns: repeat(3, 40px); grid-template-rows: repeat(3, 40px); gap: 2px; }
    .gb-croix button { border-radius: 8px; }
    .gb-ab { display: flex; gap: 10px; transform: rotate(-20deg); padding: 8px 0; }
    .gb-ab button { width: 52px; height: 52px; }
    .gb-options { display: flex; flex-direction: column; gap: 10px; }
    .gb-options button { width: 66px; height: 26px; border-radius: 13px; font-size: 11px; }
  `
  document.head.append(style)

  const zone = document.createElement('div')
  zone.className = 'gb-tactile'

  const bouton = (nom, texte, place) => {
    const b = document.createElement('button')
    b.type = 'button'
    b.dataset.bouton = nom
    b.textContent = texte
    if (place) b.style.gridArea = place
    return b
  }

  const croix = document.createElement('div')
  croix.className = 'gb-croix'
  croix.append(bouton('up', '▲', '1 / 2'), bouton('left', '◀', '2 / 1'), bouton('right', '▶', '2 / 3'), bouton('down', '▼', '3 / 2'))

  const options = document.createElement('div')
  options.className = 'gb-options'
  options.append(bouton('select', 'SELECT'), bouton('start', 'START'))

  const ab = document.createElement('div')
  ab.className = 'gb-ab'
  ab.append(bouton('b', 'B'), bouton('a', 'A'))

  zone.append(croix, options, ab)
  conteneur.append(zone)

  /* Quel bouton chaque doigt tient en ce moment. */
  const doigts = new Map()
  const tenus = () => new Set(doigts.values())

  const mettreAJour = (avant) => {
    const apres = tenus()
    for (const nom of avant) if (!apres.has(nom)) gb.setButton(nom, false)
    for (const nom of apres) if (!avant.has(nom)) gb.setButton(nom, true)
    zone.querySelectorAll('button').forEach((b) => b.classList.toggle('presse', apres.has(b.dataset.bouton)))
  }

  const sous = (e) => document.elementFromPoint(e.clientX, e.clientY)?.closest?.('.gb-tactile button')?.dataset.bouton ?? null

  zone.addEventListener('pointerdown', (e) => {
    const nom = sous(e)
    if (!nom) return
    e.preventDefault()
    zone.setPointerCapture?.(e.pointerId)
    const avant = tenus()
    doigts.set(e.pointerId, nom)
    mettreAJour(avant)
  })
  zone.addEventListener('pointermove', (e) => {
    if (!doigts.has(e.pointerId)) return
    const nom = sous(e)
    if (nom === doigts.get(e.pointerId)) return
    const avant = tenus()
    if (nom) doigts.set(e.pointerId, nom)
    else doigts.delete(e.pointerId)
    mettreAJour(avant)
  })
  const lacher = (e) => {
    if (!doigts.has(e.pointerId)) return
    const avant = tenus()
    doigts.delete(e.pointerId)
    mettreAJour(avant)
  }
  zone.addEventListener('pointerup', lacher)
  zone.addEventListener('pointercancel', lacher)
  zone.addEventListener('contextmenu', (e) => e.preventDefault())

  return zone
}

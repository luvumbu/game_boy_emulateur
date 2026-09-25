/**
 * Exporter la cartouche courante en une page HTML autonome.
 *
 * Un seul fichier, jouable en double-cliquant dessus — pas de serveur, pas
 * d'atelier, pas même de connexion. Il embarque le texte de `emulateur.js`
 * (lu une fois, tel quel) et les octets de la cartouche, encodés en base64.
 * Personne ne recopie l'émulateur à la main : le fichier exporté et celui de
 * l'atelier restent la même chose, gravée à deux endroits différents.
 */

import { suivreLesManettes, installerLaManetteTactile } from './manette.js'

let sourceEmulateur = null

async function lireSourceEmulateur() {
  if (!sourceEmulateur) sourceEmulateur = await (await fetch('emulateur.js')).text()
  return sourceEmulateur
}

function enBase64(octets) {
  let binaire = ''
  for (const o of octets) binaire += String.fromCharCode(o)
  return btoa(binaire)
}

/** L'export ne se sert que de la classe GameBoy : le reste du fichier ne gêne pas, mais autant ne pas le traîner deux fois. */
function sansLExport(source) {
  return source.replace(/\nexport\s*\{[\s\S]*?\};?\s*$/, '\n')
}

export async function construirePageAutonome(octets, titre) {
  const emulateur = sansLExport(await lireSourceEmulateur())
  const rom64 = enBase64(octets)
  const enCouleur = octets[0x0143] === 0x80 || octets[0x0143] === 0xc0
  const nomAffiche = (titre || 'Cartouche').replace(/[<>&]/g, '')

  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>${nomAffiche} — jouable</title>
<style>
  html, body { margin: 0; height: 100%; background: #111; color: #ccc; font-family: system-ui, sans-serif; }
  body { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; }
  canvas { image-rendering: pixelated; width: min(92vw, 640px); height: min(82.8vw, 576px); border: 2px solid #3a3a3a; background: #000; }
  p { font-size: 13px; color: #8a8a8a; text-align: center; margin: 0; max-width: 90vw; }
  .titre { color: #ddd; font-size: 15px; font-weight: 600; }
</style>
</head>
<body>
<p class="titre">${nomAffiche}</p>
<canvas id="ecran" width="160" height="144"></canvas>
<p>Flèches pour bouger · X = A · Z = B · Entrée = START · Maj = SELECT · ou une manette — touche l'écran une fois pour activer le son.</p>
<script type="module">
${emulateur}

const ROM = Uint8Array.from(atob("${rom64}"), (c) => c.charCodeAt(0))
const EN_COULEUR = ${enCouleur}
const NUANCES = [[0xe0, 0xf8, 0xd0], [0x88, 0xc0, 0x70], [0x34, 0x68, 0x56], [0x08, 0x18, 0x20]]
const huitBits = (cinq) => (cinq << 3) | (cinq >> 2)

const toile = document.getElementById('ecran')
const ctx = toile.getContext('2d')
const image = ctx.createImageData(160, 144)

const gb = new GameBoy()
gb.loadRom(ROM)
gb.ppu.couleur = EN_COULEUR

let audio = null
let volume = null
let curseurAudio = 0

function ouvrirLeSon() {
  if (audio) { if (audio.state === 'suspended') audio.resume(); return }
  audio = new AudioContext()
  volume = audio.createGain()
  volume.gain.value = 0.25
  volume.connect(audio.destination)
  gb.apu.frequenceEchantillonnage = audio.sampleRate
  curseurAudio = audio.currentTime
}

function verserLeSon() {
  if (!audio || audio.state !== 'running') return
  const echantillons = gb.apu.drain()
  if (!echantillons.length) return
  const tampon = audio.createBuffer(1, echantillons.length, audio.sampleRate)
  tampon.getChannelData(0).set(echantillons)
  const source = audio.createBufferSource()
  source.buffer = tampon
  source.connect(volume)
  const maintenant = audio.currentTime
  if (curseurAudio < maintenant + 0.02) curseurAudio = maintenant + 0.06
  if (curseurAudio > maintenant + 0.3) curseurAudio = maintenant + 0.1
  source.start(curseurAudio)
  curseurAudio += tampon.duration
}

function redessiner() {
  if (gb.ppu.couleur) {
    for (let i = 0; i < 160 * 144; i++) {
      const c = gb.ppu.couleurs[i]
      image.data[i * 4] = huitBits(c & 31)
      image.data[i * 4 + 1] = huitBits((c >> 5) & 31)
      image.data[i * 4 + 2] = huitBits((c >> 10) & 31)
      image.data[i * 4 + 3] = 255
    }
  } else {
    for (let i = 0; i < 160 * 144; i++) {
      const [r, v, b] = NUANCES[gb.framebuffer[i] & 3]
      image.data[i * 4] = r
      image.data[i * 4 + 1] = v
      image.data[i * 4 + 2] = b
      image.data[i * 4 + 3] = 255
    }
  }
  ctx.putImageData(image, 0, 0)
}

const TOUCHES = {
  ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
  KeyX: 'a', KeyZ: 'b', Enter: 'start', ShiftLeft: 'select', ShiftRight: 'select',
}

addEventListener('keydown', (e) => {
  const bouton = TOUCHES[e.code]
  if (!bouton) return
  e.preventDefault()
  gb.setButton(bouton, true)
})
addEventListener('keyup', (e) => {
  const bouton = TOUCHES[e.code]
  if (!bouton) return
  e.preventDefault()
  gb.setButton(bouton, false)
})
/* La manette et l'écran tactile : les MÊMES fonctions que l'atelier,
   recopiées ici par leur texte — voir « manette.js ». */
${suivreLesManettes.toString()}
${installerLaManetteTactile.toString()}
suivreLesManettes(gb)
if (matchMedia('(pointer: coarse)').matches) installerLaManetteTactile(document.body, gb)

addEventListener('pointerdown', ouvrirLeSon, { once: true })
addEventListener('keydown', ouvrirLeSon, { once: true })

function tick() {
  requestAnimationFrame(tick)
  gb.runFrame()
  verserLeSon()
  redessiner()
}
tick()
</script>
</body>
</html>
`
}

/**
 * Le dossier d'une cartouche : là où l'on range ce qu'on lui a pris.
 *
 *   captures/captures_tetris/
 *     capture.json    les dessins rangés : nom, taille, pixels, d'où ils viennent
 *     tuiles-1.png    toute la cartouche en tuiles (« 🗂 Toute la cartouche »)
 *     ramasse-1.png   ce que le collecteur a ramassé (« 🧲 »)
 *
 * UN dossier par cartouche. Comment la page sait-elle que c'est « la même » ?
 * Par son EMPREINTE : un nombre calculé sur tous ses octets. Un fichier
 * renommé garde son empreinte ; un autre jeu en a une autre. Quand on range,
 * la page cherche donc d'abord un dossier qui porte l'empreinte de la
 * cartouche qui tourne : s'il existe, les captures S'AJOUTENT (les dessins
 * pareils ne comptent qu'une fois, les images reçoivent le numéro suivant) ;
 * sinon, on demande un nom — proposé : « captures_ » + le titre écrit dans la
 * cartouche — et le dossier est créé.
 *
 * Le dossier se rouvre ensuite (« 📁 Mes dossiers de captures ») : on y
 * renomme le dossier, on renomme ou ôte un dessin, on en envoie un dans ses
 * dessins.
 *
 * Le disque, c'est le service des projets (projets.php, ou projets-serveur.mjs
 * sous Node) : demandes « captures-… ».
 */

import { organiser, imagesDuRangement, departsDes16, ORDRES_DES_16 } from './organiser-cartouche.js'
import { tuileEnRangees, assembler } from './capturer-cartouche.js'

const SERVICE = 'projets.php'

/** Un appel au service. Rend ce qu'il dit, ou lève avec son message. */
async function demander(quoi, { dossier = null, corps = null } = {}) {
  const adresse = `${SERVICE}?quoi=${quoi}` + (dossier ? `&projet=${encodeURIComponent(dossier)}` : '')
  const reponse = await fetch(adresse, corps ? { method: 'POST', body: JSON.stringify({ projet: dossier, ...corps }) } : { method: 'GET' })
  let lu
  try { lu = await reponse.json() } catch { throw new Error('le service des projets n’a pas répondu — le serveur tourne-t-il ?') }
  if (lu.erreur) throw new Error(lu.erreur)
  return lu
}

/**
 * L'empreinte d'une cartouche : FNV-1a sur tous ses octets, et sa longueur.
 * Deux cartouches différentes ont (presque à coup sûr) deux empreintes
 * différentes ; la même, renommée, garde la sienne.
 */
export function empreinteDe(rom) {
  let h = 0x811c9dc5
  for (let i = 0; i < rom.length; i++) h = Math.imul(h ^ rom[i], 0x01000193) >>> 0
  return h.toString(16).padStart(8, '0') + rom.length.toString(16).padStart(8, '0')
}

/** Le titre écrit dans la cartouche, en $0134 (comme l'en-tête le donne). */
export function titreDe(rom) {
  return [...rom.slice(0x0134, 0x0144)].filter((o) => o >= 32 && o < 127).map((o) => String.fromCharCode(o)).join('').trim()
}

/** Les dossiers de captures, du plus récent au plus ancien. */
export const listerLesDossiers = () => demander('captures-liste')

/**
 * Où sont les captures de CETTE cartouche ? Rend { nom, chemin, dessins,
 * images } — « chemin » : le dossier complet sur le disque, à coller dans
 * l'explorateur — ou null si rien n'a encore été rangé pour elle.
 */
export async function dossierDeLaCartouche(rom) {
  const empreinte = empreinteDe(rom)
  const { captures, dossier } = await listerLesDossiers()
  const c = captures.find((x) => x.empreinte === empreinte)
  return c ? { nom: c.nom, chemin: `${dossier}/${c.nom}`, dessins: c.dessins, images: c.images } : null
}

/**
 * Ranger des dessins, et des images, dans le dossier de cette cartouche.
 *
 *   rom        la cartouche qui tourne (pour son empreinte et son titre) ;
 *   dessins    [{ nom, cote, rangees, source, adresse }] ;
 *   images     [{ sorte: 'tuiles' | 'ramasse', png: 'data:image/png;base64,…' }] ;
 *   demanderUnNom  la boîte de nom de la page (genre « dossier »).
 *
 * Rend { dossier, ajoutes, total, images, nouveau } — ou null si l'on a fermé
 * la boîte de nom.
 */
export async function rangerDansLeDossier({ rom, dessins = [], images = [], roles = new Map(), demanderUnNom, progression = () => {} }) {
  const trouve = await dossierPourLaCartouche(rom, demanderUnNom)
  if (!trouve) return null
  const { dossier, nouveau } = trouve
  /* Par paquets de 2000 dessins : une très grande liste d'un coup ferait une
     requête trop lourde pour le serveur. */
  let ajoutes = 0, total = 0
  for (let i = 0; i < dessins.length || i === 0; i += 2000) {
    const r = await demander('captures-ajouter', { dossier, corps: { dessins: dessins.slice(i, i + 2000) } })
    ajoutes += r.ajoutes
    total = r.dessins
    progression(Math.min(1, (i + 2000) / Math.max(1, dessins.length)) * 0.3)
  }
  const ecrites = []
  for (const [k, image] of images.entries()) {
    const r = await demander('captures-image', { dossier, corps: image })
    if (!r.deja) ecrites.push(r.image)   // une image déjà rangée, pareille, n'est pas recomptée
    progression(0.3 + (k + 1) / images.length * 0.1)
  }
  /* Et le dossier est (re)organisé : banques, paquets, personnages / décor. */
  const rangement = await organiserLeDossier({ rom, dossier, roles, progression: (p) => progression(0.4 + p * 0.6) })
  return { dossier, ajoutes, total, images: ecrites, nouveau, rangement }
}

/**
 * Le dossier de cette cartouche : celui qui porte son empreinte, ou un neuf
 * (la boîte de nom s'ouvre, nom proposé « captures_ » + le titre).
 * Rend { dossier, nouveau } — ou null si l'on a fermé la boîte de nom.
 */
async function dossierPourLaCartouche(rom, demanderUnNom) {
  const empreinte = empreinteDe(rom)
  const { captures } = await listerLesDossiers()
  const deja = captures.find((c) => c.empreinte === empreinte)?.nom
  if (deja) return { dossier: deja, nouveau: false }
  const titre = titreDe(rom)
  const propose = 'captures_' + (titre || 'cartouche')
  const nom = await demanderUnNom({ quoi: 'le dossier de cette cartouche (toutes ses captures y seront rangées)', propose, pris: new Set(captures.map((c) => c.nom)), genre: 'dossier', prevenir: true })
  if (!nom) return null
  return { dossier: (await demander('captures-creer', { dossier: nom, corps: { titre, empreinte, octets: rom.length } })).nom, nouveau: true }
}

/**
 * Ranger des NIVEAUX (🗺, panorama-decor.js) dans le dossier de la cartouche :
 * decors/niveau-1.png, niveau-2.png… — un par morceau ; un morceau trop large
 * vient en parties (niveau-3.png, niveau-3-2.png…).
 *   niveaux : [[png, png…], …] — les parties de chaque morceau.
 * Rend { dossier, images, nouveau } — ou null si l'on a fermé la boîte de nom.
 */
export async function rangerDesNiveaux({ rom, niveaux, demanderUnNom }) {
  const trouve = await dossierPourLaCartouche(rom, demanderUnNom)
  if (!trouve) return null
  const images = []
  for (const parties of niveaux) {
    let numero = 0
    for (const [partie, png] of parties.entries()) {
      const r = await demander('captures-decor', { dossier: trouve.dossier, corps: { png, numero: numero || undefined, partie } })
      numero = r.numero
      images.push(r.image)
    }
  }
  return { dossier: trouve.dossier, images, nouveau: trouve.nouveau }
}

/**
 * Organiser le dossier d'une cartouche (organiser-cartouche.js) :
 *   1. les rôles nouveaux (🧲) rejoignent roles.json ;
 *   2. avec TOUS les rôles du dossier, la cartouche est découpée en banques
 *      et en paquets, triés personnages / décor / pas encore vu ;
 *   3. rangement.json et les images partent dans les sous-dossiers
 *      banques/, personnages/, decor/, pas-encore-vu/ (refaits à chaque fois).
 * Il faut la cartouche (« rom ») : les tuiles sont relues dedans.
 * Rend le compte : { banques, personnages, decor, inconnu }.
 */
export async function organiserLeDossier({ rom, dossier, roles = new Map(), progression = () => {} }) {
  if (roles.size) await demander('captures-roles', { dossier, corps: { roles: Object.fromEntries(roles) } })
  const lu = await demander('captures-ouvrir', { dossier })
  progression(0.05)
  const { images, description } = imagesDuRangement(organiser(rom, new Map(Object.entries(lu.roles ?? {}))))
  progression(0.2)
  /* Par lots d'environ 3 Mo : des centaines d'images d'un coup feraient une requête trop lourde. */
  await demander('captures-organiser', { dossier, corps: { debut: true, rangement: description } })
  let lot = [], poids = 0, faites = 0
  const envoyer = async () => {
    if (!lot.length) return
    await demander('captures-organiser', { dossier, corps: { images: lot } })
    faites += lot.length
    lot = []; poids = 0
    progression(0.2 + faites / images.length * 0.8)
  }
  for (const image of images) {
    lot.push(image)
    poids += image.png.length
    if (poids > 3_000_000) await envoyer()
  }
  await envoyer()
  return description.compte
}

/* ===================================================================== */
/*  Montrer un dossier, pour le modifier                                  */
/* ===================================================================== */

const NUANCES = ['#e0f8d0', '#88c070', '#346856', '#081820']
const PAR_PAGE = 48

const element = (balise, classe, texte) => {
  const e = document.createElement(balise)
  if (classe) e.className = classe
  if (texte !== undefined) e.textContent = texte
  return e
}
const bouton = (texte, titre) => {
  const b = element('button', 'petit', texte)
  b.type = 'button'
  if (titre) b.title = titre
  return b
}

function apercu(rangees, cote) {
  const zoom = cote === 32 ? 2 : cote === 16 ? 3 : 5
  const toile = element('canvas')
  toile.width = toile.height = cote * zoom
  const ctx = toile.getContext('2d')
  rangees.forEach((r, y) => [...r].forEach((c, x) => {
    ctx.fillStyle = c === '0' ? ((x + y) % 2 ? '#ccc' : '#eee') : NUANCES[Number(c)]
    ctx.fillRect(x * zoom, y * zoom, zoom, zoom)
  }))
  return toile
}

/** Un nom de dessin comme le compilateur l'accepte : « mon héros » → « MON_HEROS ». */
const nomDeDessin = (brut) => {
  const p = String(brut).normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase()
    .replace(/[^A-Z0-9_]+/g, '_').replace(/_+/g, '_').replace(/^_+|_+$/g, '').slice(0, 40)
  return !p ? '' : /^[A-Z_]/.test(p) ? p : ('N' + p).slice(0, 40)
}

/**
 * La liste des dossiers, dans « zone » : un clic en ouvre un.
 */
export async function montrerLesDossiers(zone, options) {
  zone.textContent = ''
  zone.hidden = false
  zone.style.cssText = 'display:flex;flex-direction:column;gap:6px;margin:8px 0'
  let lu
  try { lu = await listerLesDossiers() } catch (e) { zone.append(element('p', 'aide', e.message)); return }
  zone.append(element('strong', '', '📁 Mes dossiers de captures'), element('span', 'aide', lu.dossier))
  if (!lu.captures.length) {
    zone.append(element('p', 'aide', 'Aucun dossier pour l’instant. Ouvre « 🗂 Toute la cartouche » ou « 🧲 », puis « 📁 Ranger ».'))
    return
  }
  for (const c of lu.captures) {
    const b = bouton(`📁 ${c.nom} — ${c.titre || 'sans titre'} · ${c.dessins} dessins · ${c.images.length} image${c.images.length > 1 ? 's' : ''}`)
    b.style.textAlign = 'left'
    b.addEventListener('click', () => montrerLeDossier(zone, c.nom, options))
    zone.append(b)
  }
}

/**
 * Un dossier ouvert, rangé en ONGLETS :
 *
 *   🧍 Personnages   les paquets dont les tuiles servaient aux lutins (🧲) —
 *                    avec leurs 16 × 16 reformés, dans les deux ordres ;
 *   🧱 Décor         les paquets dont les tuiles servaient au fond ;
 *   ❔ Pas encore vu  les paquets jamais affichés pendant 🧲 ;
 *   🗂 Banques       la cartouche, banque par banque, tuiles à leur place ;
 *   🔤 Tous les dessins  la liste de capture.json, à renommer, ôter, prendre
 *                    — filtrée par banque.
 *
 * « 🧹 Réorganiser » refait le rangement ; il faut que la cartouche du
 * dossier soit celle qui tourne (les tuiles sont relues dedans). Les
 * changements de noms restent dans la page jusqu'à « 💾 Enregistrer ».
 *
 *   ajouterUnDessin({ cote, rangees, propose }), ajouterTout(dessins) — vers le programme ;
 *   demanderUnNom  — la boîte de nom (pour renommer le dossier) ;
 *   dire(texte, bon)  — la ligne d'état ;
 *   rom()  — la cartouche qui tourne (ou null).
 */
export async function montrerLeDossier(zone, nom, options) {
  const { ajouterUnDessin, ajouterTout = null, demanderUnNom, dire = () => {}, rom = () => null } = options
  zone.textContent = ''
  zone.hidden = false
  zone.style.cssText = 'display:flex;flex-direction:column;gap:6px;margin:8px 0'
  let lu
  try { lu = await demander('captures-ouvrir', { dossier: nom }) } catch (e) { zone.append(element('p', 'aide', e.message)); return }
  let dessins = lu.capture.dessins ?? []
  const rangement = lu.rangement
  const version = encodeURIComponent(rangement?.fait ?? '')   // pour que le navigateur ne montre pas une vieille image
  const cartouche = () => { const r = rom(); return r && empreinteDe(r) === lu.capture.empreinte ? r : null }
  let modifie = false
  let onglet = rangement?.compte?.personnages ? 'lutin' : rangement ? 'banques' : 'tous'
  let page = 0
  let filtreBanque = 'toutes'

  /* --- la tête : retour, nom, renommer, réorganiser, enregistrer --- */
  const tete = element('div')
  tete.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;align-items:center'
  const retour = bouton('◀ Mes dossiers')
  const renommer = bouton('✏ Renommer le dossier')
  const reorganiser = bouton('🧹 Réorganiser', 'refait banques, paquets, personnages / décor avec tous les rôles ramassés par 🧲 — la cartouche de ce dossier doit être celle qui tourne')
  const enregistrer = bouton('💾 Enregistrer les changements')
  enregistrer.classList.add('principal')
  tete.append(retour, element('strong', '', `📁 ${nom}`), renommer, reorganiser, enregistrer)
  const chemin = element('span', 'aide', `${lu.dossier} — ${lu.capture.titre ? `cartouche « ${lu.capture.titre} »` : 'cartouche sans titre'}`)

  const images = element('div')
  images.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px'
  for (const im of lu.images) {
    const a = element('a', 'petit', `🖼 ${im}`)
    a.href = `captures/${nom}/${im}`
    a.target = '_blank'
    images.append(a)
  }

  const onglets = element('div')
  onglets.style.cssText = 'display:flex;flex-wrap:wrap;gap:4px'
  const navigation = element('div')
  navigation.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;align-items:center'
  const grille = element('div')
  grille.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;align-items:flex-start'
  zone.append(tete, chemin, images, onglets, navigation, grille)

  const marquer = () => {
    modifie = true
    enregistrer.textContent = '💾 Enregistrer les changements •'
  }

  /* Les tuiles d'un paquet, relues dans la cartouche (si c'est elle qui tourne),
     sinon prises dans capture.json par leur adresse. */
  function tuilesDuPaquet(p) {
    const r = cartouche()
    if (r) return Array.from({ length: p.tuiles }, (_, k) => ({ rangees: tuileEnRangees(r, p.adresse + k * 16) }))
    const fin = p.adresse + p.tuiles * 16
    return dessins.filter((d) => d.cote === 8 && d.adresse >= p.adresse && d.adresse < fin).sort((a, b) => a.adresse - b.adresse)
  }

  /* La navigation de pages, commune aux vues. */
  function pages(total, parPage, quoi) {
    const nb = Math.max(1, Math.ceil(total / parPage))
    page = Math.min(page, nb - 1)
    const avant = bouton('◀'), apres = bouton('▶')
    avant.disabled = page === 0
    apres.disabled = page >= nb - 1
    avant.addEventListener('click', () => { page--; dessiner() })
    apres.addEventListener('click', () => { page++; dessiner() })
    navigation.append(avant, element('span', 'aide', `${total} ${quoi} · page ${page + 1} / ${nb}`), apres)
  }

  const image = (chemin, titre) => {
    const im = element('img')
    im.src = `captures/${nom}/${chemin}?v=${version}`
    im.alt = titre
    im.title = titre
    im.loading = 'lazy'
    im.style.cssText = 'image-rendering:pixelated;max-width:100%;border:1px solid var(--bord);background:#e0f8d0'
    return im
  }

  function vuePaquets(role) {
    const liste = rangement.paquets.filter((p) => p.role === role)
    const PAR = 24
    pages(liste.length, PAR, 'paquets')
    if (!liste.length) {
      grille.append(element('p', 'aide', role === 'inconnu' ? 'Tout a été vu.' : 'Aucun paquet ici pour l’instant : joue avec « 🧲 Ramasser la mémoire vidéo » jusqu’à voir ces dessins, puis « 🧹 Réorganiser ».'))
      return
    }
    for (const p of liste.slice(page * PAR, (page + 1) * PAR)) {
      const carte = element('div')
      carte.style.cssText = 'display:flex;flex-direction:column;gap:4px;padding:6px;border:1px solid var(--bord);border-radius:6px;max-width:100%'
      carte.append(element('strong', '', p.id), image(p.image, p.id),
        element('span', 'aide', `banque ${p.banque} · $${p.adresse.toString(16).toUpperCase().padStart(6, '0')} · ${p.tuiles} tuile${p.tuiles > 1 ? 's' : ''}` + (p.lutins || p.decors ? ` · vues : ${p.lutins} en personnage, ${p.decors} en décor` : '')))
      const boutons = element('div')
      boutons.style.cssText = 'display:flex;flex-wrap:wrap;gap:4px'
      const prendre8 = bouton(`➕ Ses ${p.tuiles} tuiles (8 × 8)`, 'chaque tuile du paquet devient un dessin de ton programme')
      prendre8.addEventListener('click', () => {
        const t = tuilesDuPaquet(p).map((x) => ({ cote: 8, rangees: x.rangees }))
        if (!t.length) dire('Ces tuiles ne sont pas dans capture.json : ouvre la cartouche de ce dossier, puis recommence.', false)
        else if (t.length === 1 || !ajouterTout) ajouterUnDessin({ ...t[0], propose: p.id.toUpperCase().replace(/-/g, '_') })
        else ajouterTout(t)
      })
      boutons.append(prendre8)
      if (p.seize) {
        for (const [ordre, texte] of ORDRES_DES_16) {
          if (!p.seize[ordre]) continue   // un rangement d'avant n'a pas l'ordre « grille »
          carte.append(element('span', 'aide', `16 × 16, ${texte} :`), image(p.seize[ordre], `${p.id} en 16 × 16, ${texte}`))
          const b = bouton(`➕ En 16 × 16 (${texte})`, 'chaque groupe de 4 tuiles devient un personnage de 16 × 16 — choisis l’ordre où il ressemble')
          b.addEventListener('click', () => {
            if (!cartouche()) { dire('Pour prendre en 16 × 16, ouvre d’abord la cartouche de ce dossier.', false); return }
            const t = tuilesDuPaquet(p)
            const groupes = departsDes16(t.length, ordre).map((d) => assembler(t, d, 16, ordre))
            if (groupes.length === 1 || !ajouterTout) ajouterUnDessin({ ...groupes[0], propose: 'PERSO_' + p.id.toUpperCase().replace(/-/g, '_') })
            else ajouterTout(groupes)
          })
          boutons.append(b)
        }
      }
      carte.append(boutons)
      grille.append(carte)
    }
  }

  /* Les niveaux enregistrés (🗺) : chacun en entier, à faire défiler de côté. */
  function vueDecors() {
    for (const d of lu.decors ?? []) {
      const carte = element('div')
      carte.style.cssText = 'display:flex;flex-direction:column;gap:4px;max-width:100%'
      const cadre = element('div')
      cadre.style.cssText = 'overflow-x:auto;max-width:100%;border:1px solid var(--bord);background:repeating-conic-gradient(#ccc 0 25%, #eee 0 50%) 0 0 / 16px 16px'
      const im = element('img')
      im.src = `captures/${nom}/decors/${d}?v=${Date.now()}`
      im.alt = d
      im.style.cssText = 'image-rendering:pixelated;display:block'
      im.onload = () => { im.style.height = im.naturalHeight * 2 + 'px' }   // × 2, au pixel près
      cadre.append(im)
      const lien = element('a', 'petit', `🖼 Ouvrir ${d} en grand`)
      lien.href = `captures/${nom}/decors/${d}`
      lien.target = '_blank'
      carte.append(element('strong', '', d), cadre, lien)
      grille.append(carte)
    }
  }

  function vueBanques() {
    const PAR = 4
    pages(rangement.banques.length, PAR, 'banques')
    for (const b of rangement.banques.slice(page * PAR, (page + 1) * PAR)) {
      const carte = element('div')
      carte.style.cssText = 'display:flex;flex-direction:column;gap:4px'
      carte.append(element('strong', '', `Banque ${b.banque} — ${b.dessins} tuiles dessinées`), image(b.image, `banque ${b.banque}`),
        element('span', 'aide', `16 tuiles par rangée, à leur place dans la cartouche ; ${b.rangees} rangées gardées (celles sans dessin sont ôtées) ; le gris, c’est du bruit.`))
      grille.append(carte)
    }
  }

  function vueTous() {
    const banques = [...new Set(dessins.filter((d) => Number.isInteger(d.adresse)).map((d) => d.adresse >> 14))].sort((a, b) => a - b)
    const choix = element('select')
    choix.append(new Option('toutes les banques', 'toutes'))
    for (const b of banques) choix.append(new Option(`banque ${b}`, String(b)))
    choix.value = filtreBanque
    choix.addEventListener('change', () => { filtreBanque = choix.value; page = 0; dessiner() })
    navigation.append(choix)
    const montres = filtreBanque === 'toutes' ? dessins : dessins.filter((d) => Number.isInteger(d.adresse) && d.adresse >> 14 === Number(filtreBanque))
    pages(montres.length, PAR_PAGE, 'dessins')
    montres.slice(page * PAR_PAGE, (page + 1) * PAR_PAGE).forEach((d) => {
      const carte = element('div')
      carte.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:3px;padding:5px;border:1px solid var(--bord);border-radius:6px'
      const champ = element('input')
      champ.value = d.nom
      champ.size = 12
      champ.title = 'le nom du dessin : MAJUSCULES, chiffres et « _ »'
      champ.addEventListener('change', () => {
        const propre = nomDeDessin(champ.value)
        if (!propre || dessins.some((x) => x !== d && x.nom === propre)) {
          dire(propre ? `« ${propre} » est déjà pris dans ce dossier.` : 'Il faut un nom.', false)
          champ.value = d.nom
          return
        }
        d.nom = champ.value = propre
        marquer()
      })
      const prendre = bouton('➕', 'dans mes dessins')
      prendre.addEventListener('click', () => ajouterUnDessin({ cote: d.cote, rangees: d.rangees, propose: d.nom }))
      const oter = bouton('🗑', 'ôter de ce dossier (au prochain « Enregistrer »)')
      oter.addEventListener('click', () => { dessins = dessins.filter((x) => x !== d); marquer(); dessiner() })
      const boutons = element('div')
      boutons.style.cssText = 'display:flex;gap:3px'
      boutons.append(prendre, oter)
      carte.append(apercu(d.rangees, d.cote), champ, element('span', 'aide', `${d.cote} × ${d.cote}${d.source ? ' · ' + d.source : ''}`), boutons)
      grille.append(carte)
    })
  }

  function dessiner() {
    onglets.textContent = ''
    const c = rangement?.compte
    const liste = rangement
      ? [['lutin', `🧍 Personnages (${c.personnages})`], ['decor', `🧱 Décor (${c.decor})`], ['inconnu', `❔ Pas encore vu (${c.inconnu})`], ['banques', `🗂 Banques (${c.banques})`], ['tous', `🔤 Tous les dessins (${dessins.length})`]]
      : [['tous', `🔤 Tous les dessins (${dessins.length})`]]
    if (lu.decors?.length) liste.unshift(['decors', `🗺 Décors (${lu.decors.length})`])
    for (const [id, texte] of liste) {
      const b = bouton(texte)
      if (id === onglet) b.classList.add('principal')
      b.addEventListener('click', () => { onglet = id; page = 0; dessiner() })
      onglets.append(b)
    }
    if (!rangement) onglets.append(element('span', 'aide', 'Pas encore organisé : ouvre la cartouche de ce dossier, puis « 🧹 Réorganiser ».'))
    navigation.textContent = ''
    grille.textContent = ''
    if (onglet === 'decors') vueDecors()
    else if (onglet === 'banques') vueBanques()
    else if (onglet === 'tous') vueTous()
    else vuePaquets(onglet)
  }

  retour.addEventListener('click', () => {
    if (modifie && !confirm('Des changements ne sont pas enregistrés. Revenir quand même ?')) return
    montrerLesDossiers(zone, options)
  })
  enregistrer.addEventListener('click', async () => {
    try {
      const r = await demander('captures-modifier', { dossier: nom, corps: { dessins } })
      modifie = false
      enregistrer.textContent = '💾 Enregistrer les changements'
      dire(`Dossier « ${nom} » enregistré : ${r.dessins} dessins.`, true)
    } catch (e) { dire(e.message, false) }
  })
  reorganiser.addEventListener('click', async () => {
    const r = cartouche()
    if (!r) { dire(`Pour réorganiser, ouvre d’abord la cartouche de ce dossier${lu.capture.titre ? ` (« ${lu.capture.titre} »)` : ''}.`, false); return }
    if (modifie && !confirm('Des changements de noms ne sont pas enregistrés : ils seront perdus. Réorganiser quand même ?')) return
    try {
      const compte = await organiserLeDossier({ rom: r, dossier: nom, progression: (p) => dire(`Réorganisation… ${Math.round(p * 100)} %`, true) })
      dire(`Réorganisé : ${compte.personnages} paquets de personnages, ${compte.decor} de décor, ${compte.inconnu} pas encore vus, ${compte.banques} banques.`, true)
      montrerLeDossier(zone, nom, options)
    } catch (e) { dire('Réorganisation impossible : ' + e.message, false) }
  })
  renommer.addEventListener('click', async () => {
    if (modifie && !confirm('Des changements ne sont pas enregistrés : ils seront perdus. Renommer quand même ?')) return
    const { captures } = await listerLesDossiers()
    const vers = await demanderUnNom({ quoi: 'ce dossier de captures', propose: nom, pris: new Set(captures.map((c) => c.nom).filter((n) => n !== nom)), genre: 'dossier', prevenir: true })
    if (!vers || vers === nom) return
    try {
      const r = await demander('captures-renommer', { dossier: nom, corps: { vers } })
      dire(`Le dossier s’appelle maintenant « ${r.nom} ».`, true)
      montrerLeDossier(zone, r.nom, options)
    } catch (e) { dire(e.message, false) }
  })

  dessiner()
}

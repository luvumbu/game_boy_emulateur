/**
 * L'onglet « Les sources » : tous les documents du projet, d'un clic.
 *
 * Le cours existe en plusieurs FICHIERS, rangés dans plusieurs dossiers :
 *
 *   documents/cours-complet.pdf     tout le parcours, en un PDF   (npm run cours-complet)
 *   documents/tutoriel.pdf          l'ancien livret complet        (npm run livret)
 *   cours/NN-….pdf                  les cours, un fichier chacun   (outils/cours.mjs)
 *   livrets/lecon-….pdf             chaque leçon, un fichier       (npm run livret)
 *   documents/*.md                  les textes du projet
 *
 * Personne ne devine ces chemins. Cet onglet les écrit tous, avec un lien.
 *
 * RIEN N'EST RECOPIÉ À LA MAIN quand on peut l'éviter :
 *   - la liste des cours est lue dans `cours/index.html`, qui les liste déjà ;
 *   - le nom de chaque livret est calculé depuis la leçon, avec LA MÊME règle
 *     que `outils/livret.mjs` (voir `nomDuLivret`). Si l'une change, l'autre
 *     doit changer aussi.
 */

/* Les documents uniques : un titre, ce qu'il contient, et ses fichiers. */
const DOCUMENTS = [
  {
    titre: 'Le cours complet',
    dit: 'Tout le parcours, dans l’ordre de « Apprendre » : les chapitres, chaque leçon, chaque #include.',
    fichiers: [['PDF', 'documents/cours-complet.pdf'], ['page', 'documents/cours-complet.html']],
  },
  {
    titre: 'Ajouter son propre #include',
    dit: 'Pour tous les niveaux : les bases depuis zéro, puis guillemets ou chevrons, ranger ses fonctions, en ajouter une à la console — avec les vraies erreurs, les vrais coûts et un lexique.',
    fichiers: [['PDF', 'documents/ajouter-un-include.pdf'], ['page', 'documents/ajouter-un-include.html']],
  },
  {
    titre: 'Le livret des leçons',
    dit: 'Toutes les leçons, avec la capture de l’écran qu’elles donnent vraiment.',
    fichiers: [['PDF', 'documents/tutoriel.pdf'], ['page', 'documents/livret.html']],
  },
  {
    titre: 'Passer d’un écran à l’autre',
    dit: 'Un titre, une partie, une fin — et le bouton qui mène de l’un à l’autre.',
    fichiers: [['PDF', 'documents/passer-d-un-ecran-a-l-autre.pdf'], ['page', 'documents/passer-d-un-ecran-a-l-autre.html']],
  },
  {
    titre: 'Valorisation',
    dit: 'La valorisation du projet.',
    fichiers: [['PDF', 'documents/valorisation.pdf'], ['page', 'documents/valorisation.html']],
  },
]

/* Les textes : ils s'ouvrent tels quels, dans le navigateur. */
const TEXTES = [
  ['LISEZMOI.md', 'Lisez-moi : démarrer'],
  ['documents/PARCOURS.md', 'Le parcours, chapitre par chapitre'],
  ['documents/COURS.md', 'Le cours, en texte'],
  ['documents/TUTORIELS.md', 'Les tutoriels, en texte'],
  ['documents/CHANGEMENTS.md', 'Ce qui a changé, et pourquoi'],
  ['tutoriels/planche.png', 'La planche : l’écran de chaque leçon, en une image'],
]

/**
 * Le nom de fichier d'un livret — la règle de `outils/livret.mjs` :
 *   numéro « 0.6.1 » → « 00-6.1 » (le chapitre sur deux chiffres, le premier
 *   point devient un tiret), puis le titre sans accents ni espaces, 40 lettres.
 * Exemple : le 0.6, « La boucle while : … » → lecon-00-6-la-boucle-while-les-trois-morceaux-du.
 */
const enNomDeFichier = (titre) => titre
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[’']/g, '-')
  .replace(/[^A-Za-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .toLowerCase()
  .slice(0, 40)

const nomDuLivret = (numero, titre) =>
  `lecon-${numero.replace(/^\d+/, (n) => n.padStart(2, '0')).replace('.', '-')}-${enNomDeFichier(titre)}`

/* Un petit fabricant d'éléments : el('a', { href: … }, 'texte'). */
function el(balise, attributs = {}, ...enfants) {
  const e = document.createElement(balise)
  for (const [nom, valeur] of Object.entries(attributs)) e.setAttribute(nom, valeur)
  e.append(...enfants)
  return e
}

/* Un lien qui s'ouvre dans un nouvel onglet : on garde l'atelier ouvert. */
const lien = (texte, adresse) => el('a', { href: adresse, target: '_blank', rel: 'noopener' }, texte)

/* Une ligne : le titre, puis ses liens « PDF · page ». */
function ligne(titre, fichiers, dit) {
  const li = el('li', {}, el('b', {}, titre), ' ')
  fichiers.forEach(([texte, adresse], i) => li.append(i ? ' · ' : '', lien(texte, adresse)))
  if (dit) li.append(el('span', { class: 'aide' }, ` — ${dit}`))
  return li
}

/**
 * Remplit la zone. `LECONS`, `NIVEAUX` et `numeros` viennent de tuto/lecons.js :
 * ce sont eux qui donnent les livrets, chapitre par chapitre.
 */
export function installer({ zone, LECONS, NIVEAUX, numeros }) {
  zone.append(el('p', { class: 'aide' },
    'Tous les documents du projet. Chaque lien s’ouvre dans un nouvel onglet ; ',
    'un PDF s’imprime ou s’enregistre depuis le navigateur.'))

  // 1. Les documents uniques.
  zone.append(el('h3', {}, 'Les livres'))
  const livres = el('ul', { class: 'sources-liste' })
  for (const d of DOCUMENTS) livres.append(ligne(d.titre, d.fichiers, d.dit))
  zone.append(livres)

  // 2. Les cours, lus dans cours/index.html (la liste y est déjà).
  zone.append(el('h3', {}, 'Les cours, un fichier chacun'))
  const cours = el('ul', { class: 'sources-liste' }, el('li', { class: 'aide' }, 'lecture de cours/index.html…'))
  zone.append(cours)
  fetch('cours/index.html')
    .then((r) => (r.ok ? r.text() : Promise.reject(new Error(r.status))))
    .then((html) => {
      const page = new DOMParser().parseFromString(html, 'text/html')
      // Chaque lien « NN-….html » est un cours ; son PDF porte le même nom.
      const liens = [...page.querySelectorAll('a[href]')]
        .filter((a) => /^\d+-.*\.html$/.test(a.getAttribute('href')))
      const vus = new Set()
      cours.replaceChildren(ligne('Le sommaire des cours', [['page', 'cours/index.html']]))
      for (const a of liens) {
        const page = a.getAttribute('href')
        if (vus.has(page)) continue
        vus.add(page)
        const n = page.match(/^\d+/)[0]
        cours.append(ligne(`${Number(n)}. ${a.textContent.trim()}`,
          [['PDF', `cours/${page.replace(/\.html$/, '.pdf')}`], ['page', `cours/${page}`]]))
      }
    })
    .catch(() => cours.replaceChildren(ligne('Le sommaire des cours', [['page', 'cours/index.html']],
      'la liste n’a pas pu être lue ; le sommaire, lui, les donne tous')))

  // 3. Les livrets : un par leçon, rangés par chapitre (repliés : il y en a des centaines).
  const nums = numeros(LECONS)
  zone.append(el('h3', {}, `Les livrets, une leçon chacun (${LECONS.length})`))
  const chapitres = new Map()
  LECONS.forEach((lecon, i) => {
    const c = lecon.difficulte
    if (!chapitres.has(c)) chapitres.set(c, [])
    chapitres.get(c).push(i)
  })
  for (const [c, indices] of chapitres) {
    const bloc = el('details', { class: 'sources-chapitre' },
      el('summary', {}, `Chapitre ${c} — ${NIVEAUX[c] ?? ''} (${indices.length})`))
    const liste = el('ul', { class: 'sources-liste' })
    for (const i of indices) {
      const nom = nomDuLivret(nums[i], LECONS[i].titre)
      liste.append(ligne(`${nums[i]}. ${LECONS[i].titre}`, [['PDF', `livrets/${nom}.pdf`], ['page', `livrets/${nom}.html`]]))
    }
    bloc.append(liste)
    zone.append(bloc)
  }

  // 4. Les textes.
  zone.append(el('h3', {}, 'Les textes'))
  const textes = el('ul', { class: 'sources-liste' })
  for (const [adresse, titre] of TEXTES) textes.append(ligne(titre, [[adresse.split('/').pop(), adresse]]))
  zone.append(textes)
}

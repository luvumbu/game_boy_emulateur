/**
 * Les projets, vus de la page : un lecteur, et un bandeau qui dit où l'on est.
 *
 * Le travail vivait dans le navigateur — un programme, gardé dans le stockage
 * local, qu'on perdait en vidant son cache et qu'on ne retrouvait nulle part
 * sur le disque. Un projet est maintenant un DOSSIER : `projets/mon_jeux/`,
 * avec ses `.cpp`, sa capture, sa cartouche. On peut l'ouvrir dans
 * l'explorateur, le copier sur une clé, le sauvegarder.
 *
 * Ce module ne connaît ni le compilateur ni la console : la page lui donne de
 * quoi lire et écrire le programme, et il s'occupe du reste. Les fichiers sont
 * écrits par `projets.php`, le seul morceau du dépôt qui tourne côté serveur.
 *
 * **Ce qui montre qu'on est au bon endroit** est le point de départ de tout
 * ceci : le bandeau porte en permanence le nom du projet ouvert et le chemin de
 * son dossier, et un point apparaît dès que ce qui est à l'écran n'est plus ce
 * qui est sur le disque. Travailler une heure dans le mauvais projet est une
 * heure perdue que rien ne rattrape.
 */

const SERVICE = 'projets.php'

/** Un appel au service. Rend ce qu'il dit, ou lève avec son message. */
async function demander(quoi, { projet = null, corps = null } = {}) {
  const adresse = `${SERVICE}?quoi=${quoi}` + (projet ? `&projet=${encodeURIComponent(projet)}` : '')
  const reponse = await fetch(adresse, corps
    ? { method: 'POST', body: JSON.stringify({ projet, ...corps }) }
    : { method: 'GET' })

  let lu
  try {
    lu = await reponse.json()
  } catch {
    /* Le service n'a pas répondu du JSON : c'est qu'il n'a pas répondu du tout.
       Le dire ainsi vaut mieux qu'un « unexpected token » que personne ne peut
       relier à un serveur qui ne tourne pas. */
    throw new Error('« projets.php » n’a pas répondu — le serveur PHP tourne-t-il ?')
  }

  if (lu.erreur) throw new Error(lu.erreur)
  return lu
}

/** La date d'un projet, dite comme on la dirait à voix haute. */
function quand(secondes) {
  if (!secondes) return ''
  const ecart = Math.floor(Date.now() / 1000) - secondes
  if (ecart < 60) return 'à l’instant'
  if (ecart < 3600) return `il y a ${Math.floor(ecart / 60)} min`
  if (ecart < 86400) return `il y a ${Math.floor(ecart / 3600)} h`
  return new Date(secondes * 1000).toLocaleDateString('fr-FR')
}

export function installer({
  bandeau, nomCourant, cheminCourant, pointModifie,
  voile, grille, cheminDuDossier,
  lireProjet, poserProjet, capture, cartouches, demanderUnNom, dire,
  apresLaListe = () => {},   // appelé quand la grille des projets vient d'être refaite (pour la recherche)
}) {
  let courant = null // le nom du projet ouvert, ou null : « pas dans un projet »
  let modifie = false
  let dossier = ''
  /* Combien de projets attendent sur le disque : le bandeau le dit quand on
     n’est dans aucun. « aucun projet » tout court laisse croire qu’il n’y en
     a pas, alors qu’ils sont là, à un clic. */
  let combien = 0

  const $$ = (balise, classe, texte) => {
    const e = document.createElement(balise)
    if (classe) e.className = classe
    if (texte !== undefined) e.textContent = texte
    return e
  }

  /* ------------------------------------------------ le bandeau */

  function montrerLeBandeau() {
    nomCourant.textContent = courant ?? 'aucun projet'
    bandeau.classList.toggle('sans-projet', !courant)
    /*
     * Le chemin, raccourci par la GAUCHE.
     *
     * Ce qui compte est la fin — le nom du dossier —, et c'est justement ce
     * qu'une coupure ordinaire mange en premier. On garde donc les deux
     * derniers morceaux, et le chemin entier va dans l'infobulle et dans le
     * lecteur, où il y a la place de l'écrire en entier.
     */
    const entier = courant ? `${dossier}/${courant}/` : ''
    const morceaux = entier.split('/').filter(Boolean)
    cheminCourant.textContent = courant
      ? '…/' + morceaux.slice(-2).join('/') + '/'
      : combien
        ? `${combien} projet${combien > 1 ? 's' : ''} sur le disque — clique pour en ouvrir un`
        : 'ton travail n’est pas encore dans un dossier'
    cheminCourant.title = courant ? entier : 'aucun dossier'
    pointModifie.hidden = !courant || !modifie
  }

  /** Le programme a changé : le disque ne dit plus la même chose que l'écran. */
  function marquerModifie() {
    if (!courant || modifie) return
    modifie = true
    montrerLeBandeau()
  }

  /* ------------------------------------------------ enregistrer */

  /**
   * Écrire le projet sur le disque : les fichiers, les réglages, la cartouche.
   *
   * La capture n'y est pas : elle se demande explicitement, parce qu'on ne
   * photographie pas un écran à chaque frappe — on le fait quand ce qu'on voit
   * mérite d'être gardé.
   */
  async function enregistrer({ silencieux = false } = {}) {
    if (!courant) return null
    const { fichiers, titre, console: cible } = lireProjet()

    try {
      await demander('enregistrer', { projet: courant, corps: { fichiers, titre, console: cible } })

      /*
       * Les cartouches — une, ou deux.
       *
       * « les deux » sur un programme en couleur en fabrique deux : le dossier
       * garde le « .gbc » ET le « .gb ». Le service efface celle qu’on ne lui
       * envoie plus : ôter la couleur d’un programme ne doit pas laisser un
       * « .gbc » d’hier dans le dossier, qu’on croirait à jour.
       */
      const enBase64 = (octets) => {
        let brut = ''
        for (const o of octets) brut += String.fromCharCode(o)
        return btoa(brut)
      }

      const corps = {}
      for (const c of cartouches()) corps[c.pour] = enBase64(c.rom)
      if (Object.keys(corps).length) {
        await demander('cartouche', { projet: courant, corps })
      }

      modifie = false
      montrerLeBandeau()
      if (!silencieux) {
        dire(`« ${courant} » enregistré dans ${dossier}/${courant}/`, true)
      }
      return courant
    } catch (erreur) {
      /*
       * Le dossier a disparu — effacé dans l'explorateur, ou par quelqu'un
       * d'autre. On l'oublie, une fois, et l'on se tait ensuite : sans cela
       * chaque compilation reposerait la même erreur, et l'encadré ne
       * montrerait plus jamais le compte rendu du programme.
       */
      if (erreur.message.includes('n’existe pas')) {
        courant = null
        modifie = false
        montrerLeBandeau()
        dire('Le dossier du projet a disparu : le travail est toujours à l’écran, mais il n’est plus enregistré nulle part.', false)
        return null
      }
      dire('Le projet n’a pas pu être enregistré : ' + erreur.message, false)
      return null
    }
  }

  /** La vignette du projet : l'écran de la console, tel qu'il est. */
  async function enregistrerLaCapture(donnee = null) {
    if (!courant) {
      dire('Aucun projet ouvert : la capture n’a pas d’endroit où aller.', false)
      return
    }
    /* Le bouton « Capture » agrandit l'écran avant de le photographier : il
       passe donc SON image, et non celle du canevas de la page. */
    const png = donnee ?? capture()
    if (!png) {
      dire('La console n’a rien à photographier.', false)
      return
    }
    try {
      await demander('capture', { projet: courant, corps: { png } })
      dire(`Vignette enregistrée dans ${dossier}/${courant}/capture.png`, true)
    } catch (erreur) {
      dire('La vignette n’a pas pu être enregistrée : ' + erreur.message, false)
    }
  }

  /* ------------------------------------------------ ouvrir, créer */

  async function ouvrir(nom, { demarrage = false } = {}) {
    /* Ce qui n'est pas enregistré part avec le projet qu'on quitte. On l'écrit
       d'abord, sans un mot : demander « voulez-vous enregistrer ? » à chaque
       changement de projet est la question à laquelle personne ne répond. */
    if (courant && modifie) await enregistrer({ silencieux: true })

    const lu = await demander('ouvrir', { projet: nom })
    courant = lu.nom
    modifie = false
    dossier = lu.dossier.replace(/\/[^/]+$/, '')
    poserProjet({ nom: lu.nom, fichiers: lu.fichiers, reglages: lu.reglages, demarrage })

    /*
     * La cartouche est écrite dès l'ouverture.
     *
     * « poserProjet » vient de compiler : le .gb est là, en mémoire. L'écrire
     * tout de suite fait qu'un projet contient toujours sa cartouche, même si
     * l'on n'y a rien changé — et l'on peut la prendre sans avoir à toucher
     * une ligne pour déclencher un enregistrement.
     */
    await enregistrer({ silencieux: true })

    montrerLeBandeau()
    fermerLeLecteur()
    /*
     * On ne dit rien dans l'encadré de compilation.
     *
     * Il porte le compte rendu du programme — « 32 Ko de cartouche, 1400
     * octets » —, et l'écraser d'un « projet ouvert » ferait disparaître la
     * seule chose qu'on regarde après avoir compilé. Le bandeau, lui, vient de
     * changer de nom : c'est là que la réponse se lit.
     */
    return lu.nom
  }

  /**
   * Créer un projet sous un nom déjà choisi, sans redemander.
   *
   * C'est ce dont « ✦ Nouveau » se sert : on vient de taper le titre du jeu,
   * et l'on n'a pas envie d'une seconde boîte pour le nom du dossier. « MON
   * JEUX » donne « mon_jeux » ; le service corrige ce qui reste, et numérote
   * si le nom est pris.
   */
  async function creerDirect(nom, titre) {
    try {
      const fait = await demander('creer', { projet: nom, corps: { titre } })

      /*
       * Le dossier reçoit CE QUI EST À L'ÉCRAN.
       *
       * On ne rouvre surtout pas ce que le service vient d'écrire : la page a
       * déjà fabriqué le programme neuf, avec ses seize couleurs si la console
       * les accepte. Rouvrir remplacerait tout cela par le squelette du
       * service — on aurait créé un projet en effaçant ce qu'on venait de
       * faire, ce que personne ne comprendrait.
       */
      courant = fait.nom
      modifie = true
      const lu = await demander('liste')
      combien = lu.projets.length
      dossier = lu.dossier
      cheminDuDossier.textContent = lu.dossier
      await enregistrer({ silencieux: true })
      montrerLeBandeau()
      return fait.nom
    } catch (erreur) {
      /*
       * Sans service, on n’a pas de dossier — et ce n’est pas une faute : la
       * page marche comme avant, le bandeau dit simplement qu’on n’est dans
       * aucun projet.
       *
       * Un REFUS, lui, se dit. Le service a répondu, il a une raison, et se
       * taire laisserait croire que le dossier existe : on écrirait une heure
       * dans un projet qui n’a jamais été créé.
       */
      if (!erreur.message.includes('n’a pas répondu')) {
        dire('Le dossier du projet n’a pas pu être créé : ' + erreur.message, false)
      }
      return null
    }
  }

  /**
   * Quitter le projet ouvert, sans rien écrire de plus dans son dossier.
   *
   * « ✦ Nouveau » efface le programme à l'écran pour repartir de zéro. Tant
   * qu'on est encore DANS le projet d'avant, cet écran vide est ce que la
   * compilation suivante enregistrera dans SON dossier — et le travail de la
   * veille disparaît sans un mot, sans une question, sans rien à rattraper.
   *
   * On s'en détache donc AVANT d'effacer quoi que ce soit ; le dossier du jeu
   * neuf est créé ensuite.
   */
  function quitter() {
    courant = null
    modifie = false
    montrerLeBandeau()
  }

  async function creer(proposeParDefaut = 'mon_jeu') {
    const nom = await demanderUnNom({
      quoi: 'ce projet — ce sera le nom de son dossier',
      propose: proposeParDefaut,
      genre: 'dossier',
      pris: new Set(),
    })
    if (!nom) return null

    try {
      const fait = await demander('creer', { projet: nom, corps: { titre: nom.toUpperCase().slice(0, 11) } })
      await ouvrir(fait.nom)
      return fait.nom
    } catch (erreur) {
      dire('Le projet n’a pas pu être créé : ' + erreur.message, false)
      return null
    }
  }

  /* ------------------------------------------------ le lecteur */

  function fermerLeLecteur() {
    voile.hidden = true
  }

  async function ouvrirLeLecteur() {
    voile.hidden = false
    grille.textContent = ''
    grille.append($$('p', 'aide', 'Lecture des projets…'))

    let lu
    try {
      lu = await demander('liste')
    } catch (erreur) {
      grille.textContent = ''
      grille.append($$('p', 'aide erreur-texte', erreur.message))
      return
    }

    combien = lu.projets.length

    dossier = lu.dossier
    cheminDuDossier.textContent = lu.dossier
    montrerLeBandeau()
    grille.textContent = ''

    if (lu.projets.length === 0) {
      grille.append($$('p', 'aide', 'Aucun projet pour l’instant. « ✦ Nouveau projet » en crée un, avec son dossier.'))
      return
    }

    for (const projet of lu.projets) {
      const carte = $$('div', 'projet-carte' + (projet.nom === courant ? ' ouvert' : ''))

      const vignette = $$('div', 'projet-vignette')
      if (projet.capture) {
        const image = document.createElement('img')
        /* La date en suffixe : sans elle, le navigateur ressert la vignette
           d'avant, et l'on croit que la capture n'a pas été prise. */
        image.src = `projets/${projet.nom}/capture.png?${projet.change}`
        image.alt = ''
        vignette.append(image)
      } else {
        vignette.append($$('span', 'projet-sans-image', 'pas encore de capture'))
      }
      carte.append(vignette)

      const nom = $$('div', 'projet-nom', projet.nom)
      const dit = $$('div', 'projet-dit',
        `${projet.titre} · ${projet.fichiers.length} fichier${projet.fichiers.length > 1 ? 's' : ''} · ${quand(projet.change)}`)
      carte.append(nom, dit)

      const rangee = $$('div', 'rangee')

      const bouton = $$('button', 'principal', projet.nom === courant ? 'Ouvert' : 'Ouvrir')
      bouton.type = 'button'
      bouton.disabled = projet.nom === courant
      bouton.addEventListener('click', () => ouvrir(projet.nom).catch((e) => dire(e.message, false)))

      const renommer = $$('button', 'petit', '✎')
      renommer.type = 'button'
      renommer.title = 'renommer le dossier'
      renommer.addEventListener('click', async () => {
        const vers = await demanderUnNom({
          quoi: `ce projet — il s’appelle « ${projet.nom} »`,
          propose: projet.nom,
          genre: 'dossier',
          pris: new Set(lu.projets.map((p) => p.nom).filter((n) => n !== projet.nom)),
        })
        if (!vers || vers === projet.nom) return
        try {
          const fait = await demander('renommer', { projet: projet.nom, corps: { vers } })
          if (courant === projet.nom) courant = fait.nom
          await ouvrirLeLecteur()
          dire(`« ${projet.nom} » s’appelle maintenant « ${fait.nom} ».`, true)
        } catch (erreur) {
          dire(erreur.message, false)
        }
      })

      const oter = $$('button', 'petit danger', '🗑')
      oter.type = 'button'
      oter.title = 'supprimer le dossier du projet'
      oter.addEventListener('click', async () => {
        /* Un projet supprimé ne revient pas : on demande, et l'on demande en
           nommant ce qui va partir. */
        if (!confirm(`Supprimer « ${projet.nom} » et tout son dossier ?\n\nCela ne se défait pas.`)) return
        try {
          await demander('supprimer', { projet: projet.nom, corps: {} })
          if (courant === projet.nom) { courant = null; modifie = false }
          await ouvrirLeLecteur()
          dire(`« ${projet.nom} » supprimé.`, true)
        } catch (erreur) {
          dire(erreur.message, false)
        }
      })

      rangee.append(bouton, renommer, oter)
      carte.append(rangee)
      grille.append(carte)
    }
    apresLaListe()   // la page réapplique sa recherche à la grille toute neuve
  }

  /* ------------------------------------------------ au démarrage */

  /**
   * Rouvrir le projet de la dernière fois.
   *
   * Le nom seul est gardé dans le navigateur — le travail, lui, est sur le
   * disque. C'est toute la différence : perdre ce réglage ne perd rien.
   */
  async function reprendre() {
    let voulu = null
    try { voulu = localStorage.getItem('gameboy3-projet') } catch { /* tant pis */ }

    try {
      const lu = await demander('liste')
      combien = lu.projets.length
      dossier = lu.dossier
      cheminDuDossier.textContent = lu.dossier
      if (voulu && lu.projets.some((p) => p.nom === voulu)) {
        await ouvrir(voulu, { demarrage: true })
        return voulu
      }
    } catch {
      /* Sans service, la page marche comme avant : on n'est simplement dans
         aucun projet, et le bandeau le dit. */
      dossier = ''
    }
    montrerLeBandeau()
    return null
  }

  const garderLeCourant = () => {
    try { localStorage.setItem('gameboy3-projet', courant ?? '') } catch { /* tant pis */ }
  }

  return {
    ouvrirLeLecteur,
    fermerLeLecteur,
    ouvrir: async (nom) => { const n = await ouvrir(nom); garderLeCourant(); return n },
    creer: async (propose) => { const n = await creer(propose); garderLeCourant(); return n },
    creerDirect: async (nom, titre) => { const n = await creerDirect(nom, titre); garderLeCourant(); return n },
    enregistrer,
    enregistrerLaCapture,
    marquerModifie,
    quitter: () => { quitter(); garderLeCourant() },
    reprendre: async () => { const n = await reprendre(); garderLeCourant(); return n },
    get courant() { return courant },
    get modifie() { return modifie },
  }
}

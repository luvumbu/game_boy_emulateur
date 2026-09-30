/*
 * garde.js — dire POURQUOI une page ne démarre pas.
 *
 * Les pages de l'atelier (index.html, tuto.html, cours.html) sont écrites en
 * « modules » : chacune importe une trentaine de fichiers, qui en importent
 * d'autres. Il suffit qu'UN SEUL manque (un fichier effacé, une copie
 * incomplète, une clé USB retirée trop tôt) pour que le navigateur refuse
 * TOUT le programme de la page. Avant ce fichier, on voyait alors une page à
 * moitié dessinée, figée, sans aucun message : impossible de savoir quoi faire.
 *
 * Ce script-ci est chargé AVANT les modules, et n'en est pas un lui-même
 * (un simple <script src="garde.js">) : il tourne donc même quand tout le
 * reste échoue — et même quand la page est ouverte par un double-clic.
 *
 * Son travail :
 *   1. écouter les erreurs qui arrivent PENDANT le démarrage ;
 *   2. si la page n'a pas dit « je suis prête » (atelierPret()) peu après,
 *      chercher lui-même quel fichier manque, en suivant les « import » ;
 *   3. afficher un bandeau, en haut de la page, qui dit ce qui ne va pas et
 *      comment le réparer.
 *
 * Chaque page appelle window.atelierPret() à la toute fin de son programme :
 * c'est le signe que tout s'est chargé. Le bandeau n'apparaît jamais après.
 *
 * Écrit en JavaScript « ancien » (var, function) exprès : si le navigateur
 * est trop vieux pour les modules, ce fichier-ci doit quand même tourner, et
 * le dire.
 */
(function () {
  'use strict'

  var pret = false        // devient vrai quand la page appelle atelierPret()
  var ennuis = []         // les erreurs vues pendant le démarrage, en texte
  var minuterie = null    // l'attente avant d'afficher le bandeau
  var montre = false      // le bandeau n'est construit qu'une fois

  /* La page dit qu'elle a fini de démarrer : on oublie tout, et l'on retire
     le bandeau s'il avait paru trop tôt (une page lente, pas cassée). */
  window.atelierPret = function () {
    pret = true
    if (minuterie) clearTimeout(minuterie)
    var bandeau = document.getElementById('atelier-panne')
    if (bandeau) bandeau.remove()
  }

  /* Un chemin court et lisible : « compilateur/police.js » plutôt que
     « http://localhost:8000/compilateur/police.js ». */
  function court(adresse) {
    var dossier = location.href.replace(/[^/]*([?#].*)?$/, '')   // l'adresse du dossier de la page
    return String(adresse).indexOf(dossier) === 0 ? String(adresse).slice(dossier.length) : String(adresse)
  }

  /*
   * Construire le bandeau. Ses couleurs et ses tailles sont écrites ICI, sur
   * l'élément lui-même : la feuille de style de la page peut très bien être
   * ce qui manque, et le message doit rester lisible quand même.
   */
  function montrer(titre, lignes, conseil) {
    if (montre || pret) return   // déjà affiché, ou la page a fini par démarrer
    montre = true
    var poser = function () {
      var bandeau = document.createElement('div')
      bandeau.id = 'atelier-panne'
      bandeau.setAttribute('role', 'alert')   // lu tout de suite par un lecteur d'écran
      bandeau.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:2147483647;' +
        'background:#5c1414;color:#fff;font:15px/1.5 system-ui,sans-serif;' +
        'padding:16px 20px;box-shadow:0 4px 18px rgba(0,0,0,.5);max-height:70vh;overflow:auto'

      var h = document.createElement('div')
      h.style.cssText = 'font-size:18px;font-weight:700;margin-bottom:6px'
      h.textContent = '⚠ ' + titre
      bandeau.appendChild(h)

      // Une ligne par problème trouvé (un fichier manquant, une erreur…).
      var liste = document.createElement('ul')
      liste.style.cssText = 'margin:4px 0 8px 20px;padding:0'
      for (var i = 0; i < lignes.length; i++) {
        var li = document.createElement('li')
        li.style.cssText = 'font-family:ui-monospace,Consolas,monospace;font-size:13px'
        li.textContent = lignes[i]
        liste.appendChild(li)
      }
      if (lignes.length) bandeau.appendChild(liste)

      var p = document.createElement('div')
      p.textContent = conseil
      bandeau.appendChild(p)

      document.body.appendChild(bandeau)
    }
    // Le <body> n'existe peut-être pas encore : on attend qu'il soit là.
    if (document.body) poser()
    else document.addEventListener('DOMContentLoaded', poser)
  }

  /* ------------------------------------------------ ouvert par un double-clic */

  /*
   * index.html ouvert directement depuis l'explorateur (« file:// ») : le
   * navigateur interdit alors aux modules de se charger entre eux. Rien n'est
   * cassé dans le projet — c'est la façon de l'ouvrir qui ne va pas.
   */
  if (location.protocol === 'file:') {
    // On laisse une seconde : certains navigateurs l'acceptent, et la page
    // aura alors dit atelierPret() avant.
    setTimeout(function () {
      montrer('L’atelier a été ouvert par un double-clic sur la page',
        [],
        'Le navigateur bloque alors les fichiers du programme. Ferme cet onglet, ' +
        'puis double-clique sur « lancer.bat » dans le dossier du projet : il ' +
        'démarre l’atelier et ouvre la bonne adresse (http://localhost:8000/).')
    }, 1000)
    return   // inutile de chercher plus loin : c'est la seule cause
  }

  /* ------------------------------------------------------ chercher ce qui manque */

  /* Les « import » d'un texte de programme : './x.js', '../y.js'… */
  function importsDe(texte) {
    var trouves = []
    var re = /(?:import\s+[\s\S]*?\s+from\s+|import\s+|import\()\s*['"](\.{1,2}\/[^'"]+)['"]/g
    var m
    while ((m = re.exec(texte))) trouves.push(m[1])
    return trouves
  }

  /*
   * Suivre les imports, fichier par fichier, depuis le programme de la page,
   * et noter ceux que le serveur ne donne pas (404). C'est le même chemin
   * que suit le navigateur — mais lui ne dit pas où il s'est arrêté.
   * Rend une promesse de la liste des fichiers manquants.
   */
  function chercherLesManquants() {
    var vus = {}              // les adresses déjà demandées
    var manquants = []
    var aLire = []            // [adresse du fichier, adresse de celui qui l'importe]

    // Le point de départ : le programme écrit dans la page elle-même.
    var scripts = document.querySelectorAll('script[type="module"]')
    for (var i = 0; i < scripts.length; i++) {
      var imports = importsDe(scripts[i].textContent)
      for (var j = 0; j < imports.length; j++) aLire.push([new URL(imports[j], location.href).href, location.href])
    }

    function suivant() {
      if (!aLire.length) return Promise.resolve(manquants)
      var paire = aLire.shift()
      var adresse = paire[0]
      if (vus[adresse]) return suivant()
      vus[adresse] = true
      return fetch(adresse, { cache: 'no-store' }).then(function (reponse) {
        if (!reponse.ok) {
          manquants.push(court(adresse) + '   (demandé par ' + court(paire[1]) + ')')
          return
        }
        return reponse.text().then(function (texte) {
          var imports = importsDe(texte)
          for (var k = 0; k < imports.length; k++) aLire.push([new URL(imports[k], adresse).href, adresse])
        })
      }, function () {
        manquants.push(court(adresse) + '   (le serveur ne répond plus)')
      }).then(suivant)
    }
    return suivant()
  }

  /* La page n'a pas démarré : on cherche, puis on le dit. */
  function diagnostiquer() {
    if (pret || montre) return
    chercherLesManquants().then(function (manquants) {
      if (manquants.length) {
        montrer(
          manquants.length === 1 ? 'Il manque un fichier : l’atelier ne peut pas démarrer'
                                 : 'Il manque ' + manquants.length + ' fichiers : l’atelier ne peut pas démarrer',
          manquants,
          'Le dossier du projet est incomplet. Recopie-le en entier (ou ' +
          'retélécharge-le depuis GitHub), puis relance « lancer.bat ». Ton travail ' +
          'est dans le dossier « projets » : garde-le de côté avant de recopier.')
      } else {
        // Tous les fichiers sont là : c'est l'un d'eux qui a une erreur.
        montrer('Une erreur empêche l’atelier de démarrer',
          ennuis.length ? ennuis : ['(le navigateur n’a pas donné de détail)'],
          'Un fichier du projet est peut-être abîmé ou modifié à la main. Recopie ' +
          'le projet en entier, ou annule la dernière modification, puis recharge ' +
          'la page (F5). Si cela recommence, la ligne ci-dessus dit où chercher.')
      }
    }, function () {
      montrer('L’atelier ne peut pas démarrer', ennuis,
        'Recharge la page (F5). Si cela recommence, relance « lancer.bat ».')
    })
  }

  /* Attendre un peu avant de conclure : une erreur sans gravité peut arriver
     pendant un démarrage qui réussit quand même (la page dira atelierPret). */
  function bientot() {
    if (pret || minuterie) return
    minuterie = setTimeout(diagnostiquer, 2500)
  }

  /* ------------------------------------------------------ écouter les erreurs */

  /*
   * « true » : on écoute à la CAPTURE. Une balise <script> qui ne se charge
   * pas envoie une erreur qui ne remonte pas jusqu'à la fenêtre ; à la
   * capture, on la voit passer quand même.
   */
  window.addEventListener('error', function (e) {
    if (pret) return   // après le démarrage, la page gère ses erreurs elle-même
    var cible = e.target
    if (cible && cible !== window && cible.tagName === 'SCRIPT') {
      // Le programme de la page, ou l'un de ses fichiers, n'a pas pu se charger.
      ennuis.push('Le programme de la page n’a pas pu se charger' + (cible.src ? ' : ' + court(cible.src) : ''))
    } else if (e.message) {
      // Une erreur dans le code : son message, son fichier et sa ligne.
      ennuis.push(e.message + (e.filename ? '   — ' + court(e.filename) + ', ligne ' + e.lineno : ''))
    }
    bientot()
  }, true)

  // Une promesse rejetée sans que personne ne la rattrape, pendant le démarrage.
  window.addEventListener('unhandledrejection', function (e) {
    if (pret) return
    ennuis.push(String(e.reason && e.reason.message || e.reason))
    bientot()
  })

  /* Le filet : 20 secondes après le chargement, toujours pas prête, et
     aucune erreur vue ? On cherche quand même. */
  window.addEventListener('load', function () {
    setTimeout(function () { if (!pret) diagnostiquer() }, 20000)
  })
})()

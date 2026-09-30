/*
 * recherche-page.js — la recherche des pages de documentation.
 *
 * sommaire.html et cours/index.html sont des pages simples, qu'on ouvre
 * souvent par un double-clic dans l'explorateur (« file:// »). Là, un module
 * JavaScript (recherche.js) ne peut pas se charger. Ce fichier-ci est donc un
 * script ORDINAIRE, qui marche partout — au prix de recopier les trois lignes
 * qui comparent sans accents (normaliser, ci-dessous) : c'est le seul doublon,
 * et il est voulu.
 *
 * Il reconnaît tout seul la page où il est :
 *   - des cartes (.cartes > a.carte), rangées sous des titres <h2> : sommaire.html ;
 *   - une liste de cours (ol.sommaire-cours), coupée par des li.chapitre : cours/index.html.
 * Même comportement que partout : sans accents ni majuscules, plusieurs mots,
 * « / » pour y aller, Entrée ouvre le premier lien, Échap efface.
 */
(function () {
  'use strict'

  /* Un texte à plat : minuscules, sans accents (voir recherche.js, la même chose). */
  function normaliser(t) {
    return String(t || '').normalize('NFD').replace(/\p{M}/gu, '').replace(/[’‘]/g, "'").toLowerCase()
  }
  /* Tous les mots tapés doivent se trouver dans le texte. */
  function correspond(mots, texte) {
    texte = normaliser(texte)
    return mots.every(function (m) { return texte.indexOf(m) !== -1 })
  }

  function demarrer() {
    var cartes = document.querySelectorAll('.cartes a.carte')
    var cours = document.querySelector('ol.sommaire-cours')
    if (!cartes.length && !cours) return   // rien à chercher sur cette page

    /* --- le champ --- */
    var style = document.createElement('style')
    style.textContent =
      '.recherche-page { display: flex; gap: 10px; align-items: center; margin: 0 0 18px; }' +
      '.recherche-page input { flex: 1; font: inherit; font-size: 15px; padding: 9px 12px; border: 1px solid var(--bord, #d3d8e0);' +
      ' border-radius: 8px; background: #fff; color: inherit; }' +
      '.recherche-page input:focus { outline: 2px solid var(--vert, #3d6b47); }' +
      '.recherche-page span { font-size: 12.5px; color: var(--gris, #5c6472); white-space: nowrap; }' +
      '.recherche-cache { display: none !important; }' +
      '@media print { .recherche-page { display: none; } }'   // pas de champ sur le papier
    document.head.appendChild(style)

    var boite = document.createElement('div')
    boite.className = 'recherche-page'
    var champ = document.createElement('input')
    champ.type = 'search'
    champ.placeholder = cours ? '🔎 chercher un cours : variable, boucle, struct…' : '🔎 chercher dans le sommaire…'
    champ.setAttribute('aria-label', champ.placeholder.replace('🔎 ', ''))
    champ.title = 'touche « / » pour venir ici, Entrée ouvre le premier, Échap efface'
    var compte = document.createElement('span')
    compte.setAttribute('aria-live', 'polite')
    boite.appendChild(champ)
    boite.appendChild(compte)

    // Où le poser : sous le sous-titre du sommaire, ou juste avant la liste des cours.
    if (cours) cours.parentNode.insertBefore(boite, cours)
    else {
      var sousTitre = document.querySelector('.sous-titre') || document.querySelector('h1')
      sousTitre.parentNode.insertBefore(boite, sousTitre.nextSibling)
    }

    /* --- filtrer --- */
    function filtrer() {
      var mots = normaliser(champ.value).split(/\s+/).filter(Boolean)
      var n = 0
      var premier = null

      if (cours) {
        // les cours : chaque li qui n'est pas un chapitre ; puis les chapitres qui gardent un cours visible
        var lignes = Array.prototype.slice.call(cours.children)
        lignes.forEach(function (li) {
          if (li.classList.contains('chapitre')) return
          var garde = !mots.length || correspond(mots, li.textContent)
          li.classList.toggle('recherche-cache', !garde)
          if (garde) { n++; premier = premier || li.querySelector('a') }
        })
        lignes.forEach(function (li, i) {
          if (!li.classList.contains('chapitre')) return
          var garde = !mots.length
          for (var k = i + 1; k < lignes.length && !lignes[k].classList.contains('chapitre'); k++) {
            if (!lignes[k].classList.contains('recherche-cache')) { garde = true; break }
          }
          li.classList.toggle('recherche-cache', !garde)
        })
      } else {
        // les cartes ; puis chaque groupe (<h2>, son intro, ses cartes) qui n'en a plus aucune disparaît
        Array.prototype.forEach.call(cartes, function (carte) {
          var garde = !mots.length || correspond(mots, carte.textContent)
          carte.classList.toggle('recherche-cache', !garde)
          if (garde) { n++; premier = premier || carte }
        })
        Array.prototype.forEach.call(document.querySelectorAll('.cartes'), function (groupe) {
          var vide = !groupe.querySelector('a.carte:not(.recherche-cache)')
          groupe.classList.toggle('recherche-cache', vide)
          // le <h2> et le paragraphe d'introduction qui précèdent ce groupe
          for (var avant = groupe.previousElementSibling; avant && (avant.tagName === 'P' || avant.tagName === 'H2'); avant = avant.previousElementSibling) {
            avant.classList.toggle('recherche-cache', vide)
            if (avant.tagName === 'H2') break
          }
        })
      }

      compte.textContent = !mots.length ? '' : n === 0 ? 'rien trouvé' : n + ' trouvé' + (n > 1 ? 's' : '')
      return premier
    }

    champ.addEventListener('input', filtrer)
    champ.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { var lien = filtrer(); if (lien) lien.click() }   // ouvrir le premier
      if (e.key === 'Escape') { champ.value = ''; filtrer() }
    })
    // « / » : venir dans la recherche (sauf si l'on écrit déjà quelque part)
    addEventListener('keydown', function (e) {
      var ici = document.activeElement
      if (e.key !== '/' || (ici && (ici.tagName === 'INPUT' || ici.tagName === 'TEXTAREA'))) return
      e.preventDefault()
      champ.focus()
    })
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', demarrer)
  else demarrer()
})()

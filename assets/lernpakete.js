/* =========================================================
   Lernpakete — liegen auf dump.yanikroesti.ch, hier nur verlinkt.
   Ein Paket wechselt nach seinem Prüfungsdatum selbst ins Archiv.
   ========================================================= */
(function (global) {
  'use strict';

  function lang() { return document.documentElement.getAttribute('data-l') || 'de'; }
  function tx(o) { return o ? (o[lang()] || o.de) : ''; }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  // aktiv -> archiv, sobald das Prüfungsdatum vorbei ist
  function effectiveStatus(p) {
    if (p.status === 'aktiv' && p.archiveAfter) {
      var t = new Date(p.archiveAfter + 'T23:59:59');
      if (new Date() > t) return 'archiv';
    }
    return p.status;
  }

  function card(p, subjects) {
    var st = effectiveStatus(p);
    var label = { aktiv: { de: 'aktiv', en: 'active' },
                  archiv: { de: 'Archiv', en: 'archive' },
                  geplant: { de: 'geplant', en: 'planned' } }[st];
    var inner =
      '<div class="lphead"><span class="chip s-' + p.subject + '">' + esc(subjects[p.subject].code) + '</span>' +
        '<span class="lp-state lp-' + st + '">' + esc(tx(label)) + '</span></div>' +
      '<h3>' + esc(tx(p.title)) + '</h3>' +
      '<p>' + esc(tx(p.detail)) + '</p>' +
      '<div class="lptabs">' + (p.tabs || []).map(function (x) { return '<span>' + esc(x) + '</span>'; }).join('') + '</div>' +
      (st === 'geplant' && p.blocked ? '<p class="blocked">' + esc(tx(p.blocked)) + '</p>' : '');

    if (st === 'geplant' || !p.file) {
      return '<article class="card lpcard geplant rv" style="--c:' + subjects[p.subject].color + '">' + inner + '</article>';
    }
    return '<a class="card hoverable lpcard ' + st + ' rv" style="--c:' + subjects[p.subject].color + '" ' +
      'href="' + LP.base + p.file + '" target="_blank" rel="noopener">' +
      '<span class="go"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="2.2" stroke-linecap="round"><path d="M7 17 17 7M9 7h8v8"/></svg></span>' + inner + '</a>';
  }

  var LP = { base: '', pakete: [] };

  global.Lernpakete = {
    load: function (base) {
      return fetch((base || './') + 'data/lernpakete.json')
        .then(function (r) { return r.json(); })
        .then(function (d) { LP.base = d.base; LP.pakete = d.pakete; return d; });
    },
    html: function (subjects, filter) {
      var list = LP.pakete.filter(filter || function () { return true; });
      if (!list.length) return '';
      var order = { aktiv: 0, geplant: 1, archiv: 2 };
      list.sort(function (a, b) { return order[effectiveStatus(a)] - order[effectiveStatus(b)]; });
      return '<section class="sect" id="lernpakete"><div class="sect-h">' +
        '<h2><span lang="de">Lernpakete</span><span lang="en">Study packs</span></h2>' +
        '<span class="n">' + list.length + '</span><span class="rule"></span></div>' +
        '<div class="lp">' + list.map(function (p) { return card(p, subjects); }).join('') + '</div></section>';
    },
    effectiveStatus: effectiveStatus
  };
})(window);

/* =========================================================
   Lernpakete — liegen auf dump.yanikroesti.ch, hier nur verlinkt.
   Ein Paket wechselt nach seinem Prüfungsdatum selbst ins Archiv.

   Sie sitzen auf einer schmalen Schiene: kein Markierungsschild,
   weil ein Lernpaket keine Uhrzeit hat, aber derselbe Klemmenkoerper
   wie alles andere.
   ========================================================= */
(function (global) {
  'use strict';

  function lang() { return document.documentElement.getAttribute('data-l') || 'de'; }
  function tx(o) { return o ? (o[lang()] || o.de || o.en || '') : ''; }
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

  var LABEL = {
    aktiv:   { de: 'aktiv',   en: 'active' },
    archiv:  { de: 'Archiv',  en: 'archive' },
    geplant: { de: 'geplant', en: 'planned' }
  };

  function term(p, subjects) {
    var st = effectiveStatus(p);
    var subj = subjects[p.subject] || { code: '?' };
    var state = '<span class="lp-state ' + st + '">' + esc(tx(LABEL[st])) + '</span>';

    var body =
      '<span class="body">' +
        '<span class="tt">' + esc(tx(p.title)) + '</span>' +
        '<span class="sub">' + esc(tx(p.detail)) + '</span>' +
      '</span>' +
      '<span class="aside">' + state +
        ((p.tabs && p.tabs.length)
          ? '<span class="rm">' + p.tabs.length + ' Tabs</span>' : '') +
      '</span>';

    var head = '<span class="fuss">' + esc(subj.code) + '</span>';
    var cls = 'term s-' + esc(p.subject) + (st === 'archiv' ? ' done' : '');

    if (st === 'geplant' || !p.file) {
      return '<div class="' + cls + '" aria-disabled="true">' + head + body + '</div>';
    }
    return '<a class="' + cls + '" href="' + esc(LP.base + p.file) + '" ' +
      'target="_blank" rel="noopener">' + head + body + '</a>';
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
      list = list.slice().sort(function (a, b) {
        return order[effectiveStatus(a)] - order[effectiveStatus(b)];
      });
      return '<section class="sect" id="lernpakete" aria-labelledby="lp-h">' +
        '<div class="sect-h">' +
          '<h2 id="lp-h"><span lang="de">Lernpakete</span><span lang="en">Study packs</span></h2>' +
          '<span class="count">' + list.length + '</span><span class="spacer"></span>' +
        '</div>' +
        '<div class="rail tight">' +
          list.map(function (p) { return term(p, subjects); }).join('') +
        '</div></section>';
    },
    effectiveStatus: effectiveStatus
  };
})(window);

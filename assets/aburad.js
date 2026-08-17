/* =========================================================
   ABU-Modulrad — G01 bis G11 als Ring, aktuelles Modul in der Mitte.
   Der Stand kommt aus data/pages.json (done / current).
   ========================================================= */
(function (global) {
  'use strict';

  function lang() { return document.documentElement.getAttribute('data-l') || 'de'; }
  function tx(o) { return o ? (o[lang()] || o.de) : ''; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  var CX = 120, CY = 120, R = 90, GAP = 1.6;

  function pt(cx, cy, r, deg) {
    var a = (deg - 90) * Math.PI / 180;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  }

  function arc(i, n) {
    var step = 360 / n;
    var a0 = i * step + GAP, a1 = (i + 1) * step - GAP;
    var p0 = pt(CX, CY, R, a0), p1 = pt(CX, CY, R, a1);
    var large = (a1 - a0) > 180 ? 1 : 0;
    return 'M' + p0[0].toFixed(2) + ',' + p0[1].toFixed(2) +
           ' A' + R + ',' + R + ' 0 ' + large + ' 1 ' + p1[0].toFixed(2) + ',' + p1[1].toFixed(2);
  }

  function html(mods) {
    var n = mods.length;
    var done = mods.filter(function (m) { return m.done; }).length;
    var cur = mods.filter(function (m) { return m.current; })[0];

    var segs = mods.map(function (m, i) {
      var cls = m.done ? 'done' : m.current ? 'cur' : 'todo';
      return '<path class="seg ' + cls + '" d="' + arc(i, n) + '" data-mod="' + esc(m.id) + '" ' +
             'tabindex="0" role="button" aria-label="' + esc(m.id + ' ' + tx(m)) + '"><title>' +
             esc(m.id + ' — ' + tx(m)) + '</title></path>';
    }).join('');

    var labels = mods.map(function (m, i) {
      var step = 360 / n, mid = i * step + step / 2;
      var p = pt(CX, CY, R, mid);
      return '<text class="seg-l" x="' + p[0].toFixed(1) + '" y="' + (p[1] + 3).toFixed(1) + '">' +
             esc(m.id.replace('G', '')) + '</text>';
    }).join('');

    var legend = mods.map(function (m) {
      var cls = m.done ? 'done' : m.current ? 'cur' : 'todo';
      return '<li class="' + cls + '"><span class="k mono">' + esc(m.id) + '</span>' +
             '<span class="v">' + esc(tx(m)) + '</span>' +
             (m.current ? '<span class="badge"><span lang="de">läuft</span><span lang="en">current</span></span>' : '') +
             (m.done ? '<span class="tick">✓</span>' : '') + '</li>';
    }).join('');

    return '' +
    '<section class="sect" id="abu-module">' +
      '<div class="sect-h">' +
        '<h2><span lang="de">ABU-Module</span><span lang="en">General-education modules</span></h2>' +
        '<span class="n">' + done + '/' + n + '</span><span class="rule"></span></div>' +
      '<div class="card rad-wrap rv">' +
        '<div class="rad">' +
          '<svg viewBox="0 0 240 240" role="img" aria-labelledby="rad-t">' +
            '<title id="rad-t">Fortschritt durch die ABU-Themenbereiche</title>' +
            segs + labels +
            '<text class="rad-c1" x="120" y="112">' + esc(cur ? cur.id : '–') + '</text>' +
            '<text class="rad-c2" x="120" y="132">' +
              esc(cur ? (lang() === 'en' ? 'current' : 'läuft') : '') + '</text>' +
          '</svg>' +
        '</div>' +
        '<ul class="rad-legend">' + legend + '</ul>' +
      '</div>' +
    '</section>';
  }

  global.AbuRad = { html: html };
})(window);

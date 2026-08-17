/* =========================================================
   Gesetzespyramide — Schweizer Elektrorecht
   Belegt über Fedlex-SR-Nummern, Wikipedia und eit.swiss.
   Was NICHT belegt ist, steht unten ausdrücklich als offen.
   ========================================================= */
(function (global) {
  'use strict';

  var TIERS = [
    { id: 'bv', d: 'M320,10 L386.5,80 L253.5,80 Z',
      label: { de: 'Verfassung', en: 'Constitution' },
      short: 'BV', sr: 'SR 101',
      title: { de: 'Bundesverfassung', en: 'Federal Constitution' },
      text: { de: 'Die oberste Ebene. Legt fest, dass der Bund für das Elektrizitätswesen zuständig ist.',
              en: 'The top level. Establishes federal responsibility for electricity.' } },

    { id: 'gesetz', d: 'M249.7,84 L390.3,84 L454.9,152 L185.1,152 Z',
      label: { de: 'Gesetz', en: 'Act' },
      short: 'EleG', sr: 'SR 734.0',
      title: { de: 'Elektrizitätsgesetz (24. Juni 1902)', en: 'Electricity Act (24 June 1902)' },
      text: { de: 'Der Rahmen: elektrische Anlagen dürfen Menschen, Tiere und Sachen nicht gefährden. Sagt DASS, nicht WIE.',
              en: 'The frame: electrical installations must not endanger people, animals or property. Says THAT, not HOW.' } },

    { id: 'verordnung', d: 'M181.3,156 L458.7,156 L523.3,224 L116.7,224 Z',
      label: { de: 'Verordnungen', en: 'Ordinances' },
      short: 'StV · NEV · NIV', sr: '734.2 · 734.26 · 734.27',
      title: { de: 'Verordnungen zum EleG', en: 'Ordinances under the Act' },
      text: { de: 'Sagen WER und WANN. Die NIV (SR 734.27) regelt schweizweit verbindlich, wie Installationen geplant, erstellt, gemeldet und kontrolliert werden — inklusive Kontrollperioden und Bewilligungen.',
              en: 'They say WHO and WHEN. The NIV (SR 734.27) governs how installations are planned, built, reported and inspected.' },
      items: [
        { n: 'StV',  sr: 'SR 734.2',  de: 'Starkstromverordnung', en: 'High-current ordinance' },
        { n: 'NEV',  sr: 'SR 734.26', de: 'Niederspannungs-Erzeugnisverordnung', en: 'Low-voltage products ordinance' },
        { n: 'NIV',  sr: 'SR 734.27', de: 'Niederspannungs-Installationsverordnung', en: 'Low-voltage installation ordinance' },
        { n: 'UVEK', sr: 'SR 734.272.3', de: 'UVEK-Verordnung über elektrische Niederspannungsinstallationen', en: 'DETEC ordinance on low-voltage installations' }
      ] },

    { id: 'norm', d: 'M112.9,228 L527.1,228 L591.7,296 L48.3,296 Z',
      label: { de: 'Norm', en: 'Standard' },
      short: 'NIN', sr: 'SN 411000',
      title: { de: 'Niederspannungs-Installations-Norm', en: 'Low-voltage installation standard' },
      text: { de: 'Sagt WIE. Herausgeberin ist Electrosuisse, früher SEV 1000. Formal eine private Norm — aber Verordnungen und Netzbetreiber verlangen die «anerkannten Regeln der Technik», und als solche gilt die NIN. Wer abweicht, muss gleichwertige Sicherheit beweisen.',
              en: 'Says HOW. Published by Electrosuisse. Formally a private standard, but it counts as the recognised state of the art.' } }
  ];

  function lang() { return document.documentElement.getAttribute('data-l') || 'de'; }
  function tx(o) { return o ? (o[lang()] || o.de) : ''; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function html() {
    var mid = { bv: 52, gesetz: 122, verordnung: 194, norm: 266 };
    var shapes = TIERS.map(function (t, i) {
      return '<g class="tier" data-tier="' + t.id + '" tabindex="0" role="button" ' +
             'aria-label="' + esc(tx(t.title)) + '" style="--i:' + i + '">' +
        '<path d="' + t.d + '"/>' +
        '<text class="tl" x="320" y="' + (mid[t.id] - 4) + '">' + esc(tx(t.label)) + '</text>' +
        '<text class="ts" x="320" y="' + (mid[t.id] + 13) + '">' + esc(t.short) + '</text>' +
      '</g>';
    }).join('');

    return '' +
    '<section class="sect" id="gesetzespyramide">' +
      '<div class="sect-h">' +
        '<h2><span lang="de">Gesetzespyramide</span><span lang="en">Legal hierarchy</span></h2>' +
        '<span class="rule"></span>' +
      '</div>' +
      '<div class="pyr-wrap card rv">' +
        '<div class="pyr-svg">' +
          '<svg viewBox="0 0 640 316" role="img" aria-labelledby="pyr-t">' +
            '<title id="pyr-t">Gesetzespyramide: Verfassung, Gesetz, Verordnung, Norm</title>' +
            shapes +
            '<text class="axis" x="614" y="30" text-anchor="end">' +
              (lang() === 'en' ? 'more general' : 'allgemeiner') + '</text>' +
            '<text class="axis" x="614" y="312" text-anchor="end">' +
              (lang() === 'en' ? 'more concrete' : 'konkreter') + '</text>' +
          '</svg>' +
          '<p class="pyr-hint">' +
            '<span lang="de">Ebene antippen für Details</span>' +
            '<span lang="en">Tap a level for details</span></p>' +
        '</div>' +
        '<div class="pyr-detail" id="pyr-detail"></div>' +
      '</div>' +
      '<p class="merksatz rv">' +
        '<span lang="de">Das <b>Gesetz</b> sagt <i>dass</i>, die <b>Verordnung</b> sagt <i>wer und wann</i>, die <b>Norm</b> sagt <i>wie</i>.</span>' +
        '<span lang="en">The <b>Act</b> says <i>that</i>, the <b>ordinance</b> says <i>who and when</i>, the <b>standard</b> says <i>how</i>.</span>' +
      '</p>' +
      '<div class="card openbox rv">' +
        '<div class="eyebrow"><span lang="de">Gegen Quellen geprüft — und was offen ist</span>' +
          '<span lang="en">Checked against sources — and what is open</span></div>' +
        '<p><span lang="de">SR-Nummern und die Bezeichnung SN 411000 stammen aus Fedlex, Wikipedia und eit.swiss, nicht aus dem Gedächtnis. ' +
          '<b>Nicht belegt</b> ist, ob eine Stufe <i>Werkvorschriften der Netzbetreiber</i> unterhalb der Norm dazugehört — ' +
          'eit.swiss spricht nur von den «anerkannten Regeln der Technik». Auch offen: ob Wäfler die Bundesverfassung mitzeichnet ' +
          'oder erst beim EleG anfängt. Sag es mir, dann trage ich es nach.</span>' +
        '<span lang="en">SR numbers and the SN 411000 designation come from Fedlex, Wikipedia and eit.swiss. It is <b>not</b> established ' +
          'whether network operators’ works rules form a level below the standard.</span></p>' +
      '</div>' +
    '</section>';
  }

  function detailHTML(t) {
    var items = t.items ? '<ul class="pyr-items">' + t.items.map(function (i) {
      return '<li><b>' + esc(i.n) + '</b> <span class="mono">' + esc(i.sr) + '</span><br>' + esc(tx(i)) + '</li>';
    }).join('') + '</ul>' : '';
    return '<div class="pyr-card">' +
      '<div class="eyebrow">' + esc(tx(t.label)) + ' · <span class="mono">' + esc(t.sr) + '</span></div>' +
      '<h3>' + esc(tx(t.title)) + '</h3>' +
      '<p>' + esc(tx(t.text)) + '</p>' + items +
    '</div>';
  }

  function bind() {
    var host = document.getElementById('pyr-detail');
    if (!host) return;
    var wrap = host.closest('.pyr-wrap');
    function show(tid) {
      var t = TIERS.filter(function (x) { return x.id === tid; })[0];
      if (!t) return;
      host.innerHTML = detailHTML(t);
      wrap.querySelectorAll('.tier').forEach(function (g) {
        g.classList.toggle('on', g.getAttribute('data-tier') === tid);
      });
    }
    wrap.querySelectorAll('.tier').forEach(function (g) {
      g.addEventListener('click', function () { show(g.getAttribute('data-tier')); });
      g.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); show(g.getAttribute('data-tier')); }
      });
    });
    show('norm');   // die Ebene, die im Alltag zählt
  }

  global.Pyramide = { html: html, bind: bind };
  document.addEventListener('pageready', bind);
})(window);
